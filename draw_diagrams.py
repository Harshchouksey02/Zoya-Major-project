import matplotlib.pyplot as plt
import matplotlib.patches as patches
import os

# Create diagrams directory if it doesn't exist
os.makedirs("diagrams", exist_ok=True)

def draw_use_case():
    fig, ax = plt.subplots(figsize=(10, 8), dpi=150)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 9)
    ax.axis('off')
    
    # System boundary box
    rect = patches.Rectangle((2.5, 0.5), 5.0, 7.5, fill=True, facecolor='#fcfdfd', edgecolor='#4472c4', linewidth=2)
    ax.add_patch(rect)
    ax.text(5.0, 7.7, "AgroVeda System Boundary", ha='center', va='center', fontsize=12, fontweight='bold', fontname='Arial', color='#1f4e79')

    # Draw Actor Helper
    def draw_actor(x, y, name):
        # Head
        head = patches.Circle((x, y), 0.25, fill=True, facecolor='#ffffff', edgecolor='#2f5597', linewidth=2)
        ax.add_patch(head)
        # Body
        ax.plot([x, x], [y-0.25, y-0.95], color='#2f5597', linewidth=2)
        # Arms
        ax.plot([x-0.4, x+0.4], [y-0.45, y-0.45], color='#2f5597', linewidth=2)
        # Legs
        ax.plot([x, x-0.3], [y-0.95, y-1.5], color='#2f5597', linewidth=2)
        ax.plot([x, x+0.3], [y-0.95, y-1.5], color='#2f5597', linewidth=2)
        # Name
        ax.text(x, y-1.8, name, ha='center', va='top', fontsize=11, fontweight='bold', fontname='Arial')

    # Draw Actors
    draw_actor(1.2, 4.5, "Customer")
    draw_actor(8.8, 4.5, "Admin")

    # Use Cases definition
    use_cases = [
        ("UC-1: Browse Catalog", 6.8),
        ("UC-2: Manage Cart", 5.7),
        ("UC-3: Checkout & Pay", 4.6),
        ("UC-4: Track Orders", 3.5),
        ("UC-5: Manage Products", 2.2),
        ("UC-6: Manage Orders", 1.1)
    ]

    uc_patches = {}
    for uc_name, y_pos in use_cases:
        ellipse = patches.Ellipse((5.0, y_pos), 3.2, 0.65, fill=True, facecolor='#d9e2f3', edgecolor='#2f5597', linewidth=1.5)
        ax.add_patch(ellipse)
        ax.text(5.0, y_pos, uc_name, ha='center', va='center', fontsize=9, fontweight='bold', fontname='Arial')
        uc_patches[uc_name] = (3.4, 6.6, y_pos) # (left boundary, right boundary, y)

    # Draw lines connecting Customer to customer use cases
    # Actor Customer center at y=4.0 for connections
    c_x, c_y = 1.6, 4.2
    for uc_name in ["UC-1: Browse Catalog", "UC-2: Manage Cart", "UC-3: Checkout & Pay", "UC-4: Track Orders"]:
        target_x, _, target_y = uc_patches[uc_name]
        ax.plot([c_x, target_x], [c_y, target_y], color='#7f7f7f', linestyle='-', linewidth=1.2)

    # Draw lines connecting Admin to admin use cases (and some customer checkout triggers)
    a_x, a_y = 8.4, 4.2
    for uc_name in ["UC-3: Checkout & Pay", "UC-5: Manage Products", "UC-6: Manage Orders"]:
        _, target_x, target_y = uc_patches[uc_name]
        ax.plot([a_x, target_x], [a_y, target_y], color='#7f7f7f', linestyle='-', linewidth=1.2)

    plt.tight_layout()
    plt.savefig("diagrams/use_case_diagram.png", bbox_inches='tight')
    plt.close()
    print("Use Case diagram generated successfully.")

def draw_er_diagram():
    fig, ax = plt.subplots(figsize=(11, 8.5), dpi=150)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    # Draw Entity Box
    def draw_entity(x, y, w, h, title, attributes):
        # Header
        header = patches.Rectangle((x, y+h-0.4), w, 0.4, fill=True, facecolor='#2f5597', edgecolor='#2f5597')
        ax.add_patch(header)
        ax.text(x+w/2.0, y+h-0.2, title, ha='center', va='center', fontsize=9, fontweight='bold', fontname='Arial', color='#ffffff')
        
        # Body
        body = patches.Rectangle((x, y), w, h-0.4, fill=True, facecolor='#f2f2f2', edgecolor='#2f5597', linewidth=1.5)
        ax.add_patch(body)
        
        # Attributes
        y_text = y + h - 0.65
        for attr in attributes:
            ax.text(x+0.15, y_text, attr, ha='left', va='center', fontsize=8, fontname='Arial')
            y_text -= 0.25

    # Define Entities and Attributes
    # Users
    draw_entity(0.5, 5.0, 2.2, 2.5, "USERS", [
        "PK  id (INT)",
        "    email (VARCHAR)",
        "    password_hash (VARCHAR)",
        "    created_at (TIMESTAMP)",
        "    name (VARCHAR)",
        "    phone (VARCHAR)",
        "    address (TEXT)"
    ])

    # User_Roles
    draw_entity(0.5, 1.5, 2.2, 1.8, "USER_ROLES", [
        "PK  id (INT)",
        "FK  user_id (INT)",
        "    role (VARCHAR)"
    ])

    # Products
    draw_entity(4.2, 5.0, 2.6, 2.8, "PRODUCTS", [
        "PK  id (INT)",
        "    name (VARCHAR)",
        "    name_hindi (VARCHAR)",
        "    category (VARCHAR)",
        "    price (DECIMAL)",
        "    unit (VARCHAR)",
        "    image_url (VARCHAR)",
        "    stock (INT)",
        "    rating (DECIMAL)"
    ])

    # Cart_Items
    draw_entity(4.2, 1.5, 2.6, 2.0, "CART_ITEMS", [
        "PK  id (INT)",
        "FK  user_id (INT)",
        "FK  product_id (INT)",
        "    quantity (INT)"
    ])

    # Orders
    draw_entity(8.0, 5.0, 2.5, 2.8, "ORDERS", [
        "PK  id (INT)",
        "FK  user_id (INT)",
        "    order_number (VARCHAR)",
        "    total_amount (DECIMAL)",
        "    status (VARCHAR)",
        "    payment_method (VARCHAR)",
        "    razorpay_order_id (VARCHAR)",
        "    created_at (TIMESTAMP)"
    ])

    # Order_Items
    draw_entity(8.0, 1.5, 2.5, 2.2, "ORDER_ITEMS", [
        "PK  id (INT)",
        "FK  order_id (INT)",
        "FK  product_id (INT)",
        "    product_name (VARCHAR)",
        "    product_price (DECIMAL)",
        "    quantity (INT)"
    ])

    # Draw Relation Lines with cardinality notation
    # Users (0.5+2.2, 5.0+1.25)=(2.7, 6.25) to User_Roles (0.5+1.1, 1.5+1.8)=(1.6, 3.3)
    ax.plot([1.6, 1.6], [5.0, 3.3], color='#595959', linewidth=1.2)
    ax.text(1.5, 4.8, "1", fontsize=8, fontname='Arial')
    ax.text(1.5, 3.5, "N", fontsize=8, fontname='Arial')
    
    # Users (2.7, 5.5) to Cart_Items (4.2, 2.5)
    ax.plot([2.7, 3.5, 3.5, 4.2], [5.5, 5.5, 2.5, 2.5], color='#595959', linewidth=1.2)
    ax.text(2.8, 5.6, "1", fontsize=8, fontname='Arial')
    ax.text(4.0, 2.6, "N", fontsize=8, fontname='Arial')

    # Users (2.7, 6.5) to Orders (8.0, 6.5)
    ax.plot([2.7, 8.0], [6.5, 6.5], color='#595959', linewidth=1.2)
    ax.text(2.8, 6.6, "1", fontsize=8, fontname='Arial')
    ax.text(7.8, 6.6, "N", fontsize=8, fontname='Arial')

    # Products (4.2+1.3, 5.0) to Cart_Items (4.2+1.3, 1.5+2.0)
    ax.plot([5.5, 5.5], [5.0, 3.5], color='#595959', linewidth=1.2)
    ax.text(5.6, 4.8, "1", fontsize=8, fontname='Arial')
    ax.text(5.6, 3.7, "N", fontsize=8, fontname='Arial')

    # Products (4.2+2.6, 6.0) to Order_Items (8.0, 2.5)
    ax.plot([6.8, 7.4, 7.4, 8.0], [6.0, 6.0, 2.5, 2.5], color='#595959', linewidth=1.2)
    ax.text(6.9, 6.1, "1", fontsize=8, fontname='Arial')
    ax.text(7.8, 2.6, "N", fontsize=8, fontname='Arial')

    # Orders (9.25, 5.0) to Order_Items (9.25, 3.7)
    ax.plot([9.25, 9.25], [5.0, 3.7], color='#595959', linewidth=1.2)
    ax.text(9.35, 4.8, "1", fontsize=8, fontname='Arial')
    ax.text(9.35, 3.9, "N", fontsize=8, fontname='Arial')

    plt.tight_layout()
    plt.savefig("diagrams/er_diagram.png", bbox_inches='tight')
    plt.close()
    print("ER diagram generated successfully.")

def draw_dfd_level0():
    fig, ax = plt.subplots(figsize=(9, 5), dpi=150)
    ax.set_xlim(0, 9)
    ax.set_ylim(0, 5)
    ax.axis('off')

    # System process (Circle)
    proc = patches.Circle((4.5, 2.5), 0.9, fill=True, facecolor='#d9e2f3', edgecolor='#2f5597', linewidth=2)
    ax.add_patch(proc)
    ax.text(4.5, 2.5, "0.0\nAgroVeda\nSystem", ha='center', va='center', fontsize=11, fontweight='bold', fontname='Arial')

    # External Entities (Rectangles)
    ent_customer = patches.Rectangle((0.5, 1.75), 1.6, 1.5, fill=True, facecolor='#f2f2f2', edgecolor='#7f7f7f', linewidth=1.5)
    ax.add_patch(ent_customer)
    ax.text(1.3, 2.5, "Customer\n(Farmer / Buyer)", ha='center', va='center', fontsize=10, fontweight='bold', fontname='Arial')

    ent_admin = patches.Rectangle((6.9, 1.75), 1.6, 1.5, fill=True, facecolor='#f2f2f2', edgecolor='#7f7f7f', linewidth=1.5)
    ax.add_patch(ent_admin)
    ax.text(7.7, 2.5, "Admin\n(Manager)", ha='center', va='center', fontsize=10, fontweight='bold', fontname='Arial')

    # Arrows and labels
    # Customer to System
    ax.annotate("Search, Cart Details,\nOrder Request", xy=(3.5, 2.8), xytext=(2.1, 3.2),
                arrowprops=dict(arrowstyle="->", color='#2f5597', lw=1.2),
                fontsize=8, fontname='Arial')
    # System to Customer
    ax.annotate("Product Details, Order\nStatus, Invoice", xy=(2.1, 1.8), xytext=(2.4, 1.4),
                arrowprops=dict(arrowstyle="<-", color='#2f5597', lw=1.2),
                fontsize=8, fontname='Arial')

    # Admin to System
    ax.annotate("Product Updates,\nManage Orders", xy=(5.5, 2.8), xytext=(5.6, 3.2),
                arrowprops=dict(arrowstyle="->", color='#2f5597', lw=1.2),
                fontsize=8, fontname='Arial')
    # System to Admin
    ax.annotate("Order Details,\nSales Reports", xy=(6.9, 1.8), xytext=(5.5, 1.4),
                arrowprops=dict(arrowstyle="<-", color='#2f5597', lw=1.2),
                fontsize=8, fontname='Arial')

    plt.tight_layout()
    plt.savefig("diagrams/dfd_level0.png", bbox_inches='tight')
    plt.close()
    print("DFD Level 0 diagram generated successfully.")

def draw_dfd_level1():
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=150)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 7.5)
    ax.axis('off')

    # External Entities
    ent_customer = patches.Rectangle((0.3, 3.0), 1.4, 1.2, fill=True, facecolor='#f2f2f2', edgecolor='#7f7f7f', linewidth=1.5)
    ax.add_patch(ent_customer)
    ax.text(1.0, 3.6, "Customer", ha='center', va='center', fontsize=10, fontweight='bold', fontname='Arial')

    ent_admin = patches.Rectangle((9.3, 3.0), 1.4, 1.2, fill=True, facecolor='#f2f2f2', edgecolor='#7f7f7f', linewidth=1.5)
    ax.add_patch(ent_admin)
    ax.text(10.0, 3.6, "Admin", ha='center', va='center', fontsize=10, fontweight='bold', fontname='Arial')

    # Processes (Circles)
    p1 = patches.Circle((3.5, 6.0), 0.65, fill=True, facecolor='#d9e2f3', edgecolor='#2f5597', linewidth=1.5)
    ax.add_patch(p1)
    ax.text(3.5, 6.0, "1.0\nUser Auth", ha='center', va='center', fontsize=9, fontweight='bold', fontname='Arial')

    p2 = patches.Circle((6.5, 6.0), 0.65, fill=True, facecolor='#d9e2f3', edgecolor='#2f5597', linewidth=1.5)
    ax.add_patch(p2)
    ax.text(6.5, 6.0, "2.0\nCatalog\nMgmt", ha='center', va='center', fontsize=9, fontweight='bold', fontname='Arial')

    p3 = patches.Circle((3.5, 1.8), 0.65, fill=True, facecolor='#d9e2f3', edgecolor='#2f5597', linewidth=1.5)
    ax.add_patch(p3)
    ax.text(3.5, 1.8, "3.0\nCart & Order\nMgmt", ha='center', va='center', fontsize=9, fontweight='bold', fontname='Arial')

    p4 = patches.Circle((6.5, 1.8), 0.65, fill=True, facecolor='#d9e2f3', edgecolor='#2f5597', linewidth=1.5)
    ax.add_patch(p4)
    ax.text(6.5, 1.8, "4.0\nPayment\nProcess", ha='center', va='center', fontsize=9, fontweight='bold', fontname='Arial')

    # Data Stores (Open rects)
    def draw_datastore(x, y, w, h, ds_id, name):
        # Draw left line, top line, bottom line, leaving right open (standard DFD representation)
        ax.plot([x, x], [y, y+h], color='#2f5597', linewidth=1.5)
        ax.plot([x, x+w], [y+h, y+h], color='#2f5597', linewidth=1.5)
        ax.plot([x, x+w], [y, y], color='#2f5597', linewidth=1.5)
        ax.fill_between([x, x+w], [y, y], [y+h, y+h], facecolor='#fbfcfc', alpha=1.0)
        # Vertical divider for ID
        ax.plot([x+0.6, x+0.6], [y, y+h], color='#2f5597', linewidth=1.0)
        ax.text(x+0.3, y+h/2.0, ds_id, ha='center', va='center', fontsize=8, fontweight='bold', fontname='Arial')
        ax.text(x+0.6+(w-0.6)/2.0, y+h/2.0, name, ha='center', va='center', fontsize=8, fontweight='bold', fontname='Arial')

    draw_datastore(3.0, 3.8, 1.8, 0.6, "D1", "Users DB")
    draw_datastore(6.0, 3.8, 1.8, 0.6, "D2", "Products DB")
    draw_datastore(4.4, 0.5, 2.0, 0.6, "D3", "Orders DB")

    # Connect lines Customer to Processes
    # Cust -> 1.0 (Auth)
    ax.annotate("Credentials", xy=(3.0, 5.7), xytext=(1.2, 4.2),
                arrowprops=dict(arrowstyle="->", color='#595959', connectionstyle="arc3,rad=-0.1"), fontsize=8)
    # Cust -> 2.0 (Browse)
    ax.annotate("Product Search", xy=(6.0, 5.8), xytext=(1.2, 4.2),
                arrowprops=dict(arrowstyle="->", color='#595959', connectionstyle="arc3,rad=-0.2"), fontsize=8)
    # Cust -> 3.0 (Cart/Order)
    ax.annotate("Add to Cart, Checkout", xy=(3.0, 2.1), xytext=(1.2, 3.0),
                arrowprops=dict(arrowstyle="->", color='#595959'), fontsize=8)

    # Admin -> Processes
    # Admin -> 2.0 (Catalog Admin)
    ax.annotate("Update Inventory", xy=(7.1, 5.8), xytext=(9.3, 4.2),
                arrowprops=dict(arrowstyle="->", color='#595959', connectionstyle="arc3,rad=0.2"), fontsize=8)
    # Admin -> 3.0 (Orders Admin)
    ax.annotate("Order Status Update", xy=(4.2, 1.8), xytext=(9.3, 3.5),
                arrowprops=dict(arrowstyle="->", color='#595959', connectionstyle="arc3,rad=0.1"), fontsize=8)

    # Processes to Data Stores
    # 1.0 <-> D1
    ax.annotate("Verify User", xy=(3.5, 4.4), xytext=(3.5, 5.35),
                arrowprops=dict(arrowstyle="<->", color='#2f5597'))
    # 2.0 <-> D2
    ax.annotate("Read/Write Products", xy=(6.5, 4.4), xytext=(6.5, 5.35),
                arrowprops=dict(arrowstyle="<->", color='#2f5597'))
    
    # 3.0 -> D3 (Write order details)
    ax.annotate("Write Order", xy=(4.9, 1.1), xytext=(3.5, 1.15),
                arrowprops=dict(arrowstyle="->", color='#2f5597'))
    # 4.0 -> D3 (Update Payment Status)
    ax.annotate("Payment Status", xy=(5.9, 1.1), xytext=(6.5, 1.15),
                arrowprops=dict(arrowstyle="->", color='#2f5597'))

    # Process to Process
    # 3.0 -> 4.0 (Checkout initiates Payment)
    ax.annotate("Initiate Payment", xy=(5.85, 1.8), xytext=(4.15, 1.8),
                arrowprops=dict(arrowstyle="->", color='#2f5597'), fontsize=8)

    # 4.0 -> Customer (Razorpay confirmation/slip)
    ax.annotate("Payment Receipt", xy=(1.0, 3.0), xytext=(6.0, 1.3),
                arrowprops=dict(arrowstyle="->", color='#595959', connectionstyle="arc3,rad=0.2"), fontsize=8)

    plt.tight_layout()
    plt.savefig("diagrams/dfd_level1.png", bbox_inches='tight')
    plt.close()
    print("DFD Level 1 diagram generated successfully.")

def draw_dfd_level2():
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=150)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 7.5)
    ax.axis('off')

    # External Entities
    ent_customer = patches.Rectangle((0.3, 3.2), 1.4, 1.0, fill=True, facecolor='#f2f2f2', edgecolor='#7f7f7f', linewidth=1.5)
    ax.add_patch(ent_customer)
    ax.text(1.0, 3.7, "Customer", ha='center', va='center', fontsize=9, fontweight='bold', fontname='Arial')

    ent_razorpay = patches.Rectangle((9.3, 3.2), 1.4, 1.0, fill=True, facecolor='#f2f2f2', edgecolor='#7f7f7f', linewidth=1.5)
    ax.add_patch(ent_razorpay)
    ax.text(10.0, 3.7, "Razorpay\nGateway", ha='center', va='center', fontsize=9, fontweight='bold', fontname='Arial')

    # Processes (Circles)
    p41 = patches.Circle((3.2, 5.2), 0.6, fill=True, facecolor='#d9e2f3', edgecolor='#2f5597', linewidth=1.5)
    ax.add_patch(p41)
    ax.text(3.2, 5.2, "4.1\nValidate\nOrder", ha='center', va='center', fontsize=8, fontweight='bold', fontname='Arial')

    p42 = patches.Circle((6.8, 5.2), 0.6, fill=True, facecolor='#d9e2f3', edgecolor='#2f5597', linewidth=1.5)
    ax.add_patch(p42)
    ax.text(6.8, 5.2, "4.2\nCreate RP\nOrder", ha='center', va='center', fontsize=8, fontweight='bold', fontname='Arial')

    p43 = patches.Circle((6.8, 2.2), 0.6, fill=True, facecolor='#d9e2f3', edgecolor='#2f5597', linewidth=1.5)
    ax.add_patch(p43)
    ax.text(6.8, 2.2, "4.3\nVerify\nPayment", ha='center', va='center', fontsize=8, fontweight='bold', fontname='Arial')

    p44 = patches.Circle((3.2, 2.2), 0.6, fill=True, facecolor='#d9e2f3', edgecolor='#2f5597', linewidth=1.5)
    ax.add_patch(p44)
    ax.text(3.2, 2.2, "4.4\nConfirm\nOrder", ha='center', va='center', fontsize=8, fontweight='bold', fontname='Arial')

    # Data Stores (Open rects)
    def draw_datastore(x, y, w, h, ds_id, name):
        ax.plot([x, x], [y, y+h], color='#2f5597', linewidth=1.5)
        ax.plot([x, x+w], [y+h, y+h], color='#2f5597', linewidth=1.5)
        ax.plot([x, x+w], [y, y], color='#2f5597', linewidth=1.5)
        ax.fill_between([x, x+w], [y, y], [y+h, y+h], facecolor='#fbfcfc', alpha=1.0)
        ax.plot([x+0.6, x+0.6], [y, y+h], color='#2f5597', linewidth=1.0)
        ax.text(x+0.3, y+h/2.0, ds_id, ha='center', va='center', fontsize=8, fontweight='bold', fontname='Arial')
        ax.text(x+0.6+(w-0.6)/2.0, y+h/2.0, name, ha='center', va='center', fontsize=8, fontweight='bold', fontname='Arial')

    draw_datastore(1.8, 6.4, 1.8, 0.5, "D2", "Products DB")
    draw_datastore(4.4, 6.4, 1.8, 0.5, "D4", "Cart Items")
    draw_datastore(4.4, 0.5, 1.8, 0.5, "D3", "Orders DB")

    # Connect lines
    # Customer -> 4.1 Validate
    ax.annotate("Checkout Request", xy=(2.6, 5.2), xytext=(1.0, 4.3),
                arrowprops=dict(arrowstyle="->", color='#595959'), fontsize=7)

    # 4.1 -> Products DB (Read)
    ax.annotate("Read Stock", xy=(2.4, 6.4), xytext=(3.0, 5.8),
                arrowprops=dict(arrowstyle="->", color='#2f5597'), fontsize=7)
    # 4.1 -> Cart Items (Read)
    ax.annotate("Read Cart", xy=(4.5, 6.4), xytext=(3.5, 5.8),
                arrowprops=dict(arrowstyle="->", color='#2f5597'), fontsize=7)

    # 4.1 -> 4.2 Validate OK
    ax.annotate("Validated Amount", xy=(6.2, 5.2), xytext=(3.8, 5.2),
                arrowprops=dict(arrowstyle="->", color='#2f5597'), fontsize=7)

    # 4.2 -> Razorpay (Create API order request)
    ax.annotate("Order Request (Amt)", xy=(9.3, 3.9), xytext=(7.4, 5.0),
                arrowprops=dict(arrowstyle="->", color='#2f5597'), fontsize=7)
    # Razorpay -> 4.2 (Order ID)
    ax.annotate("Razorpay Order ID", xy=(7.3, 4.8), xytext=(9.3, 3.7),
                arrowprops=dict(arrowstyle="->", color='#2f5597'), fontsize=7)

    # 4.2 -> Customer (Launch Razorpay checkout form)
    ax.annotate("Order ID & Checkout", xy=(1.0, 3.2), xytext=(6.5, 4.6),
                arrowprops=dict(arrowstyle="->", color='#595959', connectionstyle="arc3,rad=-0.1"), fontsize=7)

    # Customer -> Razorpay (Enters payment credentials)
    # Razorpay -> 4.3 Verify Payment (Signature, Payment ID callback)
    ax.annotate("Payment Details", xy=(7.4, 2.2), xytext=(9.3, 3.2),
                arrowprops=dict(arrowstyle="->", color='#595959'), fontsize=7)

    # 4.3 -> 4.4 Confirm Order (Payment Validated)
    ax.annotate("Payment Confirmed", xy=(3.8, 2.2), xytext=(6.2, 2.2),
                arrowprops=dict(arrowstyle="->", color='#2f5597'), fontsize=7)

    # 4.4 -> Orders DB (Write)
    ax.annotate("Write Order Record", xy=(4.6, 1.0), xytext=(3.2, 1.6),
                arrowprops=dict(arrowstyle="->", color='#2f5597'), fontsize=7)
    # 4.4 -> Cart Items (Clear)
    ax.annotate("Clear Cart", xy=(4.8, 6.4), xytext=(3.5, 2.8),
                arrowprops=dict(arrowstyle="->", color='#2f5597'), fontsize=7)

    # 4.4 -> Customer (Success receipt)
    ax.annotate("Order Confirmation", xy=(1.0, 3.2), xytext=(2.6, 2.2),
                arrowprops=dict(arrowstyle="->", color='#595959'), fontsize=7)

    plt.tight_layout()
    plt.savefig("diagrams/dfd_level2.png", bbox_inches='tight')
    plt.close()
    print("DFD Level 2 diagram generated successfully.")

def draw_activity_diagram():
    fig, ax = plt.subplots(figsize=(11, 7.5), dpi=150)
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 7.5)
    ax.axis('off')

    # Draw nodes helper
    def draw_action(x, y, w, h, text):
        rect = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.1", fill=True, facecolor='#d9e2f3', edgecolor='#2f5597', linewidth=1.5)
        ax.add_patch(rect)
        ax.text(x+w/2.0, y+h/2.0, text, ha='center', va='center', fontsize=8, fontweight='bold', fontname='Arial')

    def draw_decision(x, y, text):
        diamond = patches.Polygon([[x, y+0.4], [x+0.7, y], [x, y-0.4], [x-0.7, y]], fill=True, facecolor='#fff2cc', edgecolor='#d6b656', linewidth=1.5)
        ax.add_patch(diamond)
        ax.text(x, y, text, ha='center', va='center', fontsize=7, fontweight='bold', fontname='Arial')

    # Start Node
    start = patches.Circle((1.0, 6.2), 0.15, fill=True, color='#000000')
    ax.add_patch(start)
    ax.text(1.0, 6.4, "Start", ha='center', va='bottom', fontsize=8, fontweight='bold')

    # Actions & Decisions
    draw_action(2.0, 5.9, 1.5, 0.6, "Browse Catalog\n& Add to Cart")
    draw_action(4.2, 5.9, 1.4, 0.6, "Proceed to\nCheckout")
    draw_action(6.2, 5.9, 1.4, 0.6, "Enter Delivery\nDetails")
    
    draw_decision(8.7, 6.2, "Payment\nMethod?")
    
    draw_action(8.0, 4.4, 1.4, 0.6, "Simulate Razorpay\nPayment Gateway")
    draw_decision(8.7, 3.2, "Verify\nPayment?")
    
    draw_action(8.0, 1.5, 1.4, 0.6, "Log Payment Error\n& Retry")
    draw_action(5.0, 4.4, 1.4, 0.6, "Confirm Cash\non Delivery")
    
    draw_action(5.0, 1.5, 1.4, 0.6, "Save Order &\nClear Cart")
    draw_action(2.2, 1.5, 1.5, 0.6, "Generate Invoice &\nNotify User")
    
    # End Node
    end_outer = patches.Circle((1.0, 1.8), 0.18, fill=False, edgecolor='#000000', linewidth=1.5)
    end_inner = patches.Circle((1.0, 1.8), 0.1, fill=True, color='#000000')
    ax.add_patch(end_outer)
    ax.add_patch(end_inner)
    ax.text(1.0, 1.5, "End", ha='center', va='top', fontsize=8, fontweight='bold')

    # Connect arrows
    # Start -> Browse
    ax.annotate("", xy=(2.0, 6.2), xytext=(1.15, 6.2), arrowprops=dict(arrowstyle="->", color='#2f5597', lw=1.2))
    # Browse -> Checkout
    ax.annotate("", xy=(4.2, 6.2), xytext=(3.5, 6.2), arrowprops=dict(arrowstyle="->", color='#2f5597', lw=1.2))
    # Checkout -> Details
    ax.annotate("", xy=(6.2, 6.2), xytext=(5.6, 6.2), arrowprops=dict(arrowstyle="->", color='#2f5597', lw=1.2))
    # Details -> Decision
    ax.annotate("", xy=(8.0, 6.2), xytext=(7.6, 6.2), arrowprops=dict(arrowstyle="->", color='#2f5597', lw=1.2))

    # Decision -> Online Pay
    ax.annotate("Online", xy=(8.7, 5.0), xytext=(8.7, 5.8), arrowprops=dict(arrowstyle="->", color='#2f5597', lw=1.2), fontsize=7)
    # Decision -> COD
    ax.annotate("COD", xy=(5.7, 4.7), xytext=(8.0, 6.2), arrowprops=dict(arrowstyle="->", color='#2f5597', lw=1.2, connectionstyle="arc3,rad=0.15"), fontsize=7)

    # Online -> Verify
    ax.annotate("", xy=(8.7, 3.6), xytext=(8.7, 4.4), arrowprops=dict(arrowstyle="->", color='#2f5597', lw=1.2))
    
    # Verify -> Success -> Save Order
    ax.annotate("Yes", xy=(5.7, 2.1), xytext=(8.0, 3.2), arrowprops=dict(arrowstyle="->", color='#2f5597', lw=1.2, connectionstyle="arc3,rad=0.1"), fontsize=7)
    # Verify -> Fail -> Retry
    ax.annotate("No", xy=(8.7, 2.1), xytext=(8.7, 2.8), arrowprops=dict(arrowstyle="->", color='#2f5597', lw=1.2), fontsize=7)

    # COD -> Save Order
    ax.annotate("", xy=(5.7, 2.1), xytext=(5.7, 4.4), arrowprops=dict(arrowstyle="->", color='#2f5597', lw=1.2))
    
    # Save Order -> Generate Invoice
    ax.annotate("", xy=(3.7, 1.8), xytext=(5.0, 1.8), arrowprops=dict(arrowstyle="->", color='#2f5597', lw=1.2))
    # Generate Invoice -> End
    ax.annotate("", xy=(1.2, 1.8), xytext=(2.2, 1.8), arrowprops=dict(arrowstyle="->", color='#2f5597', lw=1.2))

    plt.tight_layout()
    plt.savefig("diagrams/activity_diagram.png", bbox_inches='tight')
    plt.close()
    print("Activity diagram generated successfully.")

if __name__ == "__main__":
    draw_use_case()
    draw_er_diagram()
    draw_dfd_level0()
    draw_dfd_level1()
    draw_dfd_level2()
    draw_activity_diagram()
    print("All diagrams generated successfully.")
