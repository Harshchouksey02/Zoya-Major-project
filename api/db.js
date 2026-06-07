const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let pool = null;
const useDb = !!process.env.DATABASE_URL;

if (useDb) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
}

// In-memory/local storage database
let memoryDb = {
  users: [],
  user_roles: [],
  products: [],
  cart_items: [],
  orders: [],
  order_items: []
};

// Seed products from products.json
const productsJsonPath = path.join(__dirname, 'products.json');
let defaultProducts = [];
try {
  const productsData = fs.readFileSync(productsJsonPath, 'utf8');
  defaultProducts = JSON.parse(productsData);
} catch (err) {
  console.error("Failed to read products.json", err);
}

// Optional: local json file persistence path (useful for local development)
const localDbPath = path.join(__dirname, '..', 'data', 'db.json');

function saveLocalMemoryDb() {
  if (useDb) return;
  try {
    const dir = path.dirname(localDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(localDbPath, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (err) {
    console.error("Failed to save local memory db", err);
  }
}

function loadLocalMemoryDb() {
  if (useDb) return;
  try {
    if (fs.existsSync(localDbPath)) {
      const data = fs.readFileSync(localDbPath, 'utf8');
      Object.assign(memoryDb, JSON.parse(data));
      console.log("Loaded local memory DB from", localDbPath);
    }
  } catch (err) {
    console.error("Failed to load local memory db", err);
  }
}

// Seed and initialize
async function initDb() {
  if (useDb) {
    console.log("Using Postgres Database...");
    const client = await pool.connect();
    try {
      // Create tables
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS user_roles (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          role VARCHAR(255) NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          name_hindi VARCHAR(255),
          category VARCHAR(255),
          price DECIMAL(10, 2) NOT NULL,
          unit VARCHAR(255),
          usage VARCHAR(255),
          description TEXT,
          description_hindi TEXT,
          rating DECIMAL(3, 2),
          reviews INT,
          image_url VARCHAR(500),
          bulk_offers JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS cart_items (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          product_id VARCHAR(255) NOT NULL,
          quantity INT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          total_amount DECIMAL(10, 2) NOT NULL,
          status VARCHAR(255) NOT NULL,
          payment_method VARCHAR(255) NOT NULL,
          payment_status VARCHAR(255) NOT NULL,
          shipping_address TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS order_items (
          id VARCHAR(255) PRIMARY KEY,
          order_id VARCHAR(255) NOT NULL,
          product_id VARCHAR(255) NOT NULL,
          quantity INT NOT NULL,
          price DECIMAL(10, 2) NOT NULL
        );
      `);

      // Seed default admin user
      const adminEmail = 'zoyaibrahim987@gmail.com';
      const bcrypt = require('bcryptjs');
      const hash = bcrypt.hashSync('123456', 10);
      const userExists = await client.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
      if (userExists.rowCount === 0) {
        const adminId = 'admin-uuid-1111';
        await client.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [adminId, adminEmail, hash]);
        await client.query('INSERT INTO user_roles (id, user_id, role) VALUES ($1, $2, $3)', ['admin-role-1111', adminId, 'admin']);
        console.log("Default admin seeded in Postgres!");
      } else {
        const adminId = userExists.rows[0].id;
        await client.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, adminId]);
        const roleExists = await client.query('SELECT * FROM user_roles WHERE user_id = $1 AND role = $2', [adminId, 'admin']);
        if (roleExists.rowCount === 0) {
          await client.query('INSERT INTO user_roles (id, user_id, role) VALUES ($1, $2, $3)', [`admin-role-${Date.now()}`, adminId, 'admin']);
        }
      }

      // Seed products if empty
      const prodCheck = await client.query('SELECT * FROM products LIMIT 1');
      if (prodCheck.rowCount === 0) {
        console.log("Seeding products in Postgres...");
        for (const p of defaultProducts) {
          const bulkOffers = p.bulk_offers ? JSON.stringify(p.bulk_offers) : null;
          await client.query(
            'INSERT INTO products (id, name, name_hindi, category, price, unit, usage, description, description_hindi, rating, reviews, image_url, bulk_offers) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
            [String(p.id), p.name, p.name_hindi || null, p.category, p.price, p.unit, p.usage, p.description, p.description_hindi || null, p.rating, p.reviews, p.image_url, bulkOffers]
          );
        }
        console.log("Seeding products completed!");
      }
    } finally {
      client.release();
    }
  } else {
    console.log("Using In-Memory Database...");
    loadLocalMemoryDb();

    const bcrypt = require('bcryptjs');
    const adminEmail = 'zoyaibrahim987@gmail.com';
    const hash = bcrypt.hashSync('123456', 10);
    const adminId = 'admin-uuid-1111';

    // Seed default admin if not exists in memory
    const existingAdminIdx = memoryDb.users.findIndex(u => u.email === adminEmail);
    if (existingAdminIdx === -1) {
      memoryDb.users.push({
        id: adminId,
        email: adminEmail,
        password_hash: hash,
        created_at: new Date()
      });

      memoryDb.user_roles.push({
        id: 'admin-role-1111',
        user_id: adminId,
        role: 'admin'
      });
    } else {
      memoryDb.users[existingAdminIdx].password_hash = hash;
      const hasAdminRole = memoryDb.user_roles.some(r => r.user_id === memoryDb.users[existingAdminIdx].id && r.role === 'admin');
      if (!hasAdminRole) {
        memoryDb.user_roles.push({
          id: `admin-role-${Date.now()}`,
          user_id: memoryDb.users[existingAdminIdx].id,
          role: 'admin'
        });
      }
    }

    // Seed default products if not exists in memory
    if (memoryDb.products.length === 0) {
      memoryDb.products = defaultProducts.map(p => ({
        id: String(p.id),
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
        bulk_offers: p.bulk_offers || null,
        created_at: new Date()
      }));
    }
    saveLocalMemoryDb();
    console.log("In-Memory database ready!");
  }
}

async function query(text, params) {
  if (useDb) {
    return pool.query(text, params);
  }
  throw new Error("Postgres query called while running in in-memory mode.");
}

module.exports = {
  initDb,
  query,
  pool,
  useDb,
  memoryDb,
  saveLocalMemoryDb
};
