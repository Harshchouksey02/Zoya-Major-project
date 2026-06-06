const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'agroveda_super_secret_key_12345_must_be_long_enough_to_be_secure_32_bytes';

// Wait for database initialization on every request
let isInitialized = false;
const initPromise = db.initDb().then(() => {
  isInitialized = true;
}).catch(err => {
  console.error("Database initialization failed", err);
});

app.use(async (req, res, next) => {
  if (!isInitialized) {
    await initPromise;
  }
  next();
});

// JWT Token Helper
function generateToken(userId, email, role) {
  return jwt.sign({ userId, email, role }, SECRET, { expiresIn: '24h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

// Authentication Middleware
function authMiddleware(req, res, next) {
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Normalize path relative to /api if needed
  let path = req.path;
  if (path.startsWith('/api')) {
    path = path.slice(4);
  }

  const isPublic = 
    path === '/auth/login' ||
    path === '/auth/signup' ||
    (path === '/products' && req.method === 'GET') ||
    path.startsWith('/functions/');

  if (isPublic) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Access Token Required" });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(403).json({ message: "Invalid or Expired Token" });
  }

  req.userId = payload.userId;
  req.userEmail = payload.email;
  req.userRole = payload.role;

  // Enforce admin check for products modification (POST/DELETE)
  if (path === '/products' && req.method !== 'GET') {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: "Unauthorized action" });
    }
  }

  next();
}

app.use(authMiddleware);

// --- AUTHENTICATION ROUTES ---

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || email.trim() === '' || password.trim() === '') {
    return res.status(400).json({ message: "Email and password required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // Check if user exists
    let userExists = false;
    if (db.useDb) {
      const checkRes = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
      userExists = checkRes.rowCount > 0;
    } else {
      userExists = db.memoryDb.users.some(u => u.email === normalizedEmail);
    }

    if (userExists) {
      return res.status(400).json({ message: "This email is already registered" });
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const hash = bcrypt.hashSync(password, 10);

    // Save user
    let userCount = 0;
    if (db.useDb) {
      await db.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [userId, normalizedEmail, hash]);
      const countRes = await db.query('SELECT COUNT(*) FROM users');
      userCount = parseInt(countRes.rows[0].count);
    } else {
      db.memoryDb.users.push({ id: userId, email: normalizedEmail, password_hash: hash, created_at: new Date() });
      userCount = db.memoryDb.users.length;
    }

    // Determine role (first user is admin, rest are user)
    const role = userCount === 1 ? 'admin' : 'user';
    const roleId = `role-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    if (db.useDb) {
      await db.query('INSERT INTO user_roles (id, user_id, role) VALUES ($1, $2, $3)', [roleId, userId, role]);
    } else {
      db.memoryDb.user_roles.push({ id: roleId, user_id: userId, role });
      db.saveLocalMemoryDb();
    }

    const token = generateToken(userId, normalizedEmail, role);

    // Format response matching Lovable client expectations
    res.status(201).json({
      user: { id: userId, email: normalizedEmail, role },
      session: {
        access_token: token,
        user: { id: userId, email: normalizedEmail }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed: " + err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || email.trim() === '' || password.trim() === '') {
    return res.status(400).json({ message: "Email and password required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    let user = null;
    let role = 'user';

    if (db.useDb) {
      const userRes = await db.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
      if (userRes.rowCount > 0) {
        user = userRes.rows[0];
        const roleRes = await db.query('SELECT role FROM user_roles WHERE user_id = $1', [user.id]);
        role = roleRes.rowCount > 0 ? roleRes.rows[0].role : 'user';
      }
    } else {
      user = db.memoryDb.users.find(u => u.email === normalizedEmail);
      if (user) {
        const userRole = db.memoryDb.user_roles.find(r => r.user_id === user.id);
        role = userRole ? userRole.role : 'user';
      }
    }

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(req.userId || user.id, user.email, role);

    res.json({
      user: { id: user.id, email: user.email, role },
      session: {
        access_token: token,
        user: { id: user.id, email: user.email }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed: " + err.message });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  res.json({
    id: req.userId,
    email: req.userEmail,
    role: req.userRole
  });
});


// --- PRODUCTS ENDPOINTS ---

// GET /api/products
app.get('/api/products', async (req, res) => {
  const { id } = req.query;
  try {
    if (db.useDb) {
      let queryText = 'SELECT * FROM products';
      let params = [];
      if (id) {
        queryText += ' WHERE id = $1';
        params.push(String(id));
      }
      queryText += ' ORDER BY created_at DESC';
      const results = await db.query(queryText, params);
      res.json(results.rows);
    } else {
      let list = db.memoryDb.products;
      if (id) {
        list = list.filter(p => p.id === String(id));
      }
      res.json(list);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products (Add product)
app.post('/api/products', async (req, res) => {
  const p = req.body;
  const id = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const bulkOffers = p.bulk_offers || null;

  try {
    if (db.useDb) {
      const queryText = `
        INSERT INTO products (id, name, name_hindi, category, price, unit, usage, description, description_hindi, rating, reviews, image_url, bulk_offers)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *
      `;
      const values = [id, p.name, p.name_hindi || null, p.category, p.price, p.unit, p.usage, p.description, p.description_hindi || null, p.rating, p.reviews, p.image_url, bulkOffers ? JSON.stringify(bulkOffers) : null];
      const results = await db.query(queryText, values);
      res.status(201).json(results.rows);
    } else {
      const item = {
        id,
        name: p.name,
        name_hindi: p.name_hindi || null,
        category: p.category,
        price: p.price,
        unit: p.unit,
        usage: p.usage,
        description: p.description,
        description_hindi: p.description_hindi || null,
        rating: p.rating,
        reviews: p.reviews,
        image_url: p.image_url,
        bulk_offers: bulkOffers,
        created_at: new Date()
      };
      db.memoryDb.products.unshift(item);
      db.saveLocalMemoryDb();
      res.status(201).json([item]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/products
app.delete('/api/products', async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: "Product ID required" });
  }

  try {
    if (db.useDb) {
      await db.query('DELETE FROM products WHERE id = $1', [String(id)]);
      res.json({ message: "Product deleted" });
    } else {
      db.memoryDb.products = db.memoryDb.products.filter(p => p.id !== String(id));
      db.saveLocalMemoryDb();
      res.json({ message: "Product deleted" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


// --- USER ROLES ENDPOINTS ---

// GET /api/user_roles
app.get('/api/user_roles', async (req, res) => {
  const { user_id } = req.query;
  const targetUserId = user_id || req.userId;

  try {
    if (db.useDb) {
      const results = await db.query('SELECT * FROM user_roles WHERE user_id = $1', [targetUserId]);
      res.json(results.rows);
    } else {
      const list = db.memoryDb.user_roles.filter(r => r.user_id === targetUserId);
      res.json(list);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


// --- CART ENDPOINTS ---

// GET /api/cart_items
app.get('/api/cart_items', async (req, res) => {
  try {
    if (db.useDb) {
      const queryText = `
        SELECT ci.*, p.name, p.category, p.price, p.unit, p.usage, p.description, p.description_hindi, p.rating, p.reviews, p.image_url, p.bulk_offers
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = $1
      `;
      const results = await db.query(queryText, [req.userId]);
      const mapped = results.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        product_id: row.product_id,
        quantity: row.quantity,
        products: {
          id: row.product_id,
          name: row.name,
          name_hindi: row.name_hindi,
          category: row.category,
          price: parseFloat(row.price),
          unit: row.unit,
          usage: row.usage,
          description: row.description,
          description_hindi: row.description_hindi,
          rating: parseFloat(row.rating),
          reviews: row.reviews,
          image_url: row.image_url,
          bulk_offers: typeof row.bulk_offers === 'string' ? JSON.parse(row.bulk_offers) : row.bulk_offers
        }
      }));
      res.json(mapped);
    } else {
      const list = db.memoryDb.cart_items.filter(c => c.user_id === req.userId);
      const mapped = list.map(item => {
        const prod = db.memoryDb.products.find(p => p.id === item.product_id);
        return {
          ...item,
          products: prod || null
        };
      });
      res.json(mapped);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cart_items
app.post('/api/cart_items', async (req, res) => {
  const { product_id, quantity } = req.body;
  if (!product_id) {
    return res.status(400).json({ message: "Product ID required" });
  }
  const qty = quantity || 1;

  try {
    if (db.useDb) {
      const exist = await db.query('SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2', [req.userId, String(product_id)]);
      if (exist.rowCount > 0) {
        const newQty = exist.rows[0].quantity + qty;
        await db.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [newQty, exist.rows[0].id]);
      } else {
        const id = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        await db.query('INSERT INTO cart_items (id, user_id, product_id, quantity) VALUES ($1, $2, $3, $4)', [id, req.userId, String(product_id), qty]);
      }
      res.status(201).json({ message: "Added to cart" });
    } else {
      const existIndex = db.memoryDb.cart_items.findIndex(c => c.user_id === req.userId && c.product_id === String(product_id));
      if (existIndex !== -1) {
        db.memoryDb.cart_items[existIndex].quantity += qty;
      } else {
        const id = `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        db.memoryDb.cart_items.push({ id, user_id: req.userId, product_id: String(product_id), quantity: qty });
      }
      db.saveLocalMemoryDb();
      res.status(201).json({ message: "Added to cart" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/cart_items
app.put('/api/cart_items', async (req, res) => {
  const { product_id } = req.query;
  const { quantity } = req.body;

  if (!product_id || quantity === undefined) {
    return res.status(400).json({ message: "product_id and quantity required" });
  }

  try {
    if (db.useDb) {
      await db.query('UPDATE cart_items SET quantity = $1 WHERE user_id = $2 AND product_id = $3', [quantity, req.userId, String(product_id)]);
    } else {
      const idx = db.memoryDb.cart_items.findIndex(c => c.user_id === req.userId && c.product_id === String(product_id));
      if (idx !== -1) {
        db.memoryDb.cart_items[idx].quantity = quantity;
      }
      db.saveLocalMemoryDb();
    }
    res.json({ message: "Quantity updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/cart_items
app.delete('/api/cart_items', async (req, res) => {
  const { product_id } = req.query;

  try {
    if (db.useDb) {
      if (product_id) {
        await db.query('DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2', [req.userId, String(product_id)]);
      } else {
        await db.query('DELETE FROM cart_items WHERE user_id = $1', [req.userId]);
      }
    } else {
      if (product_id) {
        db.memoryDb.cart_items = db.memoryDb.cart_items.filter(c => !(c.user_id === req.userId && c.product_id === String(product_id)));
      } else {
        db.memoryDb.cart_items = db.memoryDb.cart_items.filter(c => c.user_id !== req.userId);
      }
      db.saveLocalMemoryDb();
    }
    res.json({ message: "Removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


// --- ORDERS ENDPOINTS ---

// GET /api/orders
app.get('/api/orders', async (req, res) => {
  const { id, user_id } = req.query;

  try {
    if (db.useDb) {
      let queryText = 'SELECT * FROM orders';
      let params = [];

      if (id) {
        queryText += ' WHERE id = $1';
        params.push(String(id));
      } else if (req.userRole !== 'admin') {
        queryText += ' WHERE user_id = $1';
        params.push(req.userId);
      } else if (user_id) {
        queryText += ' WHERE user_id = $1';
        params.push(String(user_id));
      }

      queryText += ' ORDER BY created_at DESC';
      const results = await db.query(queryText, params);
      res.json(results.rows);
    } else {
      let list = db.memoryDb.orders;

      if (id) {
        list = list.filter(o => o.id === String(id));
      } else if (req.userRole !== 'admin') {
        list = list.filter(o => o.user_id === req.userId);
      } else if (user_id) {
        list = list.filter(o => o.user_id === String(user_id));
      }

      // Sort by date desc
      list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      res.json(list);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders
app.post('/api/orders', async (req, res) => {
  const reqOrder = req.body;

  if (!reqOrder.customer_name || !reqOrder.customer_address || !reqOrder.customer_phone) {
    return res.status(400).json({ message: "Missing order details" });
  }

  const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randSuffix = Math.floor(Math.random() * 9000) + 1000;
  const orderNumber = `AV-${dateStr}-${randSuffix}`;

  const status = reqOrder.status || 
    (String(reqOrder.payment_method).toLowerCase() === 'razorpay' ? 'paid' : 'pending');

  try {
    const orderData = {
      id: orderId,
      user_id: req.userId || reqOrder.user_id,
      order_number: orderNumber,
      customer_name: reqOrder.customer_name,
      customer_address: reqOrder.customer_address,
      customer_phone: reqOrder.customer_phone,
      subtotal: parseFloat(reqOrder.subtotal),
      discount_amount: parseFloat(reqOrder.discount_amount || 0),
      total_amount: parseFloat(reqOrder.total_amount),
      payment_method: reqOrder.payment_method,
      status: status,
      razorpay_order_id: reqOrder.razorpay_order_id || null,
      razorpay_payment_id: reqOrder.razorpay_payment_id || null
    };

    if (db.useDb) {
      const keys = Object.keys(orderData);
      const values = keys.map(k => orderData[k]);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      await db.query(`INSERT INTO orders (${keys.join(', ')}) VALUES (${placeholders})`, values);
    } else {
      orderData.created_at = new Date();
      db.memoryDb.orders.unshift(orderData);
      db.saveLocalMemoryDb();
    }

    // Return as array so that .select().single() works
    res.status(201).json([orderData]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id
app.patch('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status required" });
  }

  try {
    if (db.useDb) {
      await db.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
    } else {
      const order = db.memoryDb.orders.find(o => o.id === id);
      if (order) {
        order.status = status;
        db.saveLocalMemoryDb();
      }
    }
    res.json({ message: "Order status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/order_items
app.get('/api/order_items', async (req, res) => {
  const { order_id } = req.query;
  if (!order_id) {
    return res.status(400).json({ message: "order_id required" });
  }

  try {
    if (db.useDb) {
      const results = await db.query('SELECT * FROM order_items WHERE order_id = $1', [String(order_id)]);
      res.json(results.rows.map(r => ({
        ...r,
        price: parseFloat(r.price)
      })));
    } else {
      const list = db.memoryDb.order_items.filter(oi => oi.order_id === String(order_id));
      res.json(list);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/order_items
app.post('/api/order_items', async (req, res) => {
  const rawBody = req.body;
  let items = [];

  if (Array.isArray(rawBody)) {
    items = rawBody;
  } else {
    items = [rawBody];
  }

  try {
    for (const itemDto of items) {
      const itemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const orderItem = {
        id: itemId,
        order_id: itemDto.order_id,
        product_id: itemDto.product_id,
        product_name: itemDto.product_name,
        product_price: parseFloat(itemDto.product_price),
        quantity: parseInt(itemDto.quantity),
        total_price: parseFloat(itemDto.total_price)
      };

      if (db.useDb) {
        const keys = Object.keys(orderItem);
        const values = keys.map(k => orderItem[k]);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        await db.query(`INSERT INTO order_items (${keys.join(', ')}) VALUES (${placeholders})`, values);
      } else {
        db.memoryDb.order_items.push(orderItem);
      }
    }
    db.saveLocalMemoryDb();
    res.status(201).json({ message: "Order items created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


// --- EDGE FUNCTIONS EMULATION ---

// POST /api/functions/create-razorpay-order
app.post('/api/functions/create-razorpay-order', (req, res) => {
  const { amount, currency, receipt } = req.body;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.log("Razorpay credentials not configured. Using mock simulation.");
    return res.json({
      order_id: "order_mock_" + Date.now() + "_" + Math.floor(Math.random() * 9000 + 1000),
      amount: Math.round(parseFloat(amount) * 100),
      currency: currency || "INR",
      mock: true
    });
  }

  // Real Razorpay order integration
  const Razorpay = require('razorpay');
  const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
  rzp.orders.create({
    amount: Math.round(parseFloat(amount) * 100),
    currency: currency || "INR",
    receipt: receipt || "receipt_" + Date.now()
  }, (err, order) => {
    if (err) {
      console.error("Razorpay order creation error:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  });
});

// POST /api/functions/verify-razorpay-payment
app.post('/api/functions/verify-razorpay-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (razorpay_signature === 'sig_mock_verified' || (razorpay_order_id && razorpay_order_id.startsWith('order_mock_'))) {
    console.log("Mock payment verified successfully:", razorpay_payment_id);
    return res.json({ verified: true });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return res.status(500).json({ error: "Razorpay secret not configured" });
  }

  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', keySecret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const expectedSignature = hmac.digest('hex');

  if (expectedSignature === razorpay_signature) {
    console.log("Payment verified successfully:", razorpay_payment_id);
    res.json({ verified: true });
  } else {
    console.err("Payment signature verification failed");
    res.status(400).json({ verified: false, error: "Invalid payment signature" });
  }
});

// POST /api/functions/send-order-notifications
app.post('/api/functions/send-order-notifications', (req, res) => {
  console.log("Order notifications skipped (Twilio not configured)");
  res.json({ success: true, message: "Notifications skipped" });
});

// Export the Express app
module.exports = app;
