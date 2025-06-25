import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import pkg from "pg";
import bcrypt from "bcrypt";
import env from "dotenv";
env.config();

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const db = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

function isAdminOrStaff(req, res, next) {
  const level = parseInt(req.headers["x-user-level"]);
  if (level === 1 || level === 2) {
    next();
  } else {
    res.status(403).json({ error: "Forbidden" });
  }
}

// ✅ Updated here: use category_id instead of category
app.post("/api/items", upload.single("image"), async (req, res) => {
  const { name, description, price, category_id } = req.body;
  const imagePath = req.file?.path;

  try {
    console.log("Received data:", { name, description, price, category_id });

    await db.query(
      "INSERT INTO item (item_name, description, price, image, category_id) VALUES ($1, $2, $3, $4, $5)",
      [name, description, price, imagePath, category_id]
    );

    res.status(200).send("Item added!");
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Error adding item.");
  }
});

// Get all items
app.get("/api/items", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM item");
    res.json(result.rows);
  } catch (err) {
    console.error("Database error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new category
app.post("/api/categories", async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Category title is required" });
  }

  try {
    await db.query("INSERT INTO category (title) VALUES ($1)", [title]);
    res.status(201).json({ message: "Category added successfully" });
  } catch (err) {
    console.error("Error inserting category:", err.message);
    res.status(500).json({ error: "Failed to add category" });
  }
});

// Get all categories
app.get("/api/categories", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM category ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// Register route
app.post("/api/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id, first_name, last_name, email",
      [firstName, lastName, email, hashedPassword]
    );

    res.status(201).json({ message: "User registered", user: result.rows[0] });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Do NOT send password back in response
    const { password: _, ...safeUser } = user;

    res.json({ message: "Login successful", user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// DELETE an item by ID
app.delete("/api/items/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM item WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err.message);
    res.status(500).json({ error: "Failed to delete item" });
  }
});
// UPDATE an item by ID
app.put("/api/items/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category } = req.body;
  const imagePath = req.file?.path;

  try {
    // Check if the item exists
    const existing = await db.query("SELECT * FROM item WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    const oldItem = existing.rows[0];

    // Use new image if uploaded, otherwise keep the old image
    const finalImagePath = imagePath || oldItem.image;

    // Update the item
    const result = await db.query(
      `UPDATE item
       SET item_name = $1,
           description = $2,
           price = $3,
           image = $4,
           category_id = $5
       WHERE id = $6
       RETURNING *`,
      [name, description, price, finalImagePath, category, id]
    );

    const updated = result.rows[0];
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating item:", err.message);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// UPDATE category by ID
app.put("/api/categories/:id", async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({ error: "Category title is required" });
  }

  try {
    const result = await db.query(
      "UPDATE category SET title = $1 WHERE id = $2 RETURNING *",
      [title, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error updating category:", err.message);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// DELETE category by ID
app.delete("/api/categories/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query("DELETE FROM category WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Error deleting category:", err.message);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

app.post("/api/checkout", async (req, res) => {
  const {
    user_id,
    firstName,
    lastName,
    address1,
    address2,
    country,
    state,
    zip,
    payment,
    items,
  } = req.body;

  console.log("✅ Checkout received:", req.body); // ADD THIS LINE

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid or missing items array" });
  }

  const total = items.reduce((sum, item) => sum + item.price, 0);

  try {
    const orderResult = await db.query(
      `INSERT INTO orders (user_id, first_name, last_name, address1, address2, country, state, zip, payment, price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        user_id,
        firstName,
        lastName,
        address1,
        address2,
        country,
        state,
        zip,
        payment,
        total,
      ]
    );

    const orderId = orderResult.rows[0].id;

    const orderItemsPromises = items.map((item) =>
      db.query(
        `INSERT INTO order_items (order_id, item_id, item_name, price) VALUES ($1, $2, $3, $4)`,
        [orderId, item.id, item.name, item.price]
      )
    );
    await Promise.all(orderItemsPromises);

    res.status(201).json({ message: "Order placed successfully!" });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Failed to process order" });
  }
});

// Get orders by user
app.get("/api/orders/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const result = await db.query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY order_at DESC", // ✅ updated to order_at
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching orders for user", userId, err);
    res.status(500).json({ error: err.message });
  }
});

// Get order items
app.get("/api/orders/:orderId/items", async (req, res) => {
  const { orderId } = req.params;
  try {
    const result = await db.query(
      `SELECT 
         order_items.item_name, 
         order_items.price, 
         item.image 
       FROM order_items
       JOIN item ON order_items.item_id = item.id
       WHERE order_items.order_id = $1`,
      [orderId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching order items:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/pages", async (req, res) => {
  const { title, content } = req.body;
  try {
    await db.query(
      "INSERT INTO pages (title, content, created) VALUES ($1, $2, NOW())",
      [title, content]
    );
    res.status(201).json({ message: "Page created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to insert page" });
  }
});

// Get all pages
app.get("/api/pages", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM pages ORDER BY created DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching pages:", err.message);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

// ✅ Get a single page by ID
app.get("/api/pages/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM pages WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Page not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching page:", err.message);
    res.status(500).json({ error: "Failed to fetch page" });
  }
});

// Update page
app.put("/api/pages/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const result = await db.query(
      "UPDATE pages SET title = $1, content = $2 WHERE id = $3 RETURNING *",
      [title, content, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating page:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a page by ID
app.delete("/api/pages/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("DELETE FROM pages WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(200).json({ message: "Page deleted successfully" });
  } catch (err) {
    console.error("Error deleting page:", err);
    res.status(500).json({ error: "Failed to delete page" });
  }
});

app.patch("/api/orders/:id", async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    await db.query("UPDATE orders SET status = $1 WHERE id = $2", [status, id]);
    res.sendStatus(200);
  } catch (err) {
    console.error("Error updating order status:", err);
    res.sendStatus(500);
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, first_name, last_name, level FROM users"
    );
    res.json(result.rows); // 👈 This must return JSON
  } catch (err) {
    console.error("Failed to fetch users:", err);
    res.sendStatus(500);
  }
});

app.patch("/api/users/:id", async (req, res) => {
  const { level } = req.body;
  const { id } = req.params;

  try {
    await db.query("UPDATE users SET level = $1 WHERE id = $2", [level, id]);
    res.sendStatus(200);
  } catch (err) {
    console.error("Failed to update user level:", err);
    res.sendStatus(500);
  }
});

// Route for admin/staff to get all orders
app.get("/api/orders", isAdminOrStaff, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM orders ORDER BY order_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
// sss
