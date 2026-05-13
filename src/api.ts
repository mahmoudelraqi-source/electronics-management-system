import Hono from "hono";
import { cors } from "hono/cors";
import { jwt } from "hono/jwt";
import bcrypt from "bcryptjs";

const app = new Hono();

// CORS
app.use("*", cors());

// JWT Secret
const JWT_SECRET = Bun.env.JWT_SECRET || "your-secret-key-change-in-production";

// ============ AUTHENTICATION ============

// Register
app.post("/api/auth/register", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ error: "Username and password required" }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const existing = await Bun.sql`
      SELECT id FROM users WHERE username = ${username}
    `;
    
    if (existing.length > 0) {
      return c.json({ error: "User already exists" }, 400);
    }

    // Create user
    const result = await Bun.sql`
      INSERT INTO users (username, password) 
      VALUES (${username}, ${hashedPassword})
      RETURNING id, username
    `;

    return c.json({ 
      message: "User created successfully",
      user: result[0]
    }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Login
app.post("/api/auth/login", async (c) => {
  try {
    const { username, password } = await c.req.json();
    
    if (!username || !password) {
      return c.json({ error: "Username and password required" }, 400);
    }

    const users = await Bun.sql`
      SELECT id, username, password FROM users WHERE username = ${username}
    `;

    if (users.length === 0) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const token = await Bun.jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET
    );

    return c.json({ 
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// ============ INVENTORY MANAGEMENT ============

// Get all products
app.get("/api/products", async (c) => {
  try {
    const products = await Bun.sql`
      SELECT id, name, wholesale_price, retail_price, quantity, min_quantity, created_at
      FROM products
      ORDER BY name ASC
    `;
    return c.json(products);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Create product
app.post("/api/products", async (c) => {
  try {
    const { name, wholesale_price, retail_price, quantity, min_quantity } = await c.req.json();
    
    if (!name || !wholesale_price || !retail_price || quantity === undefined) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    const result = await Bun.sql`
      INSERT INTO products (name, wholesale_price, retail_price, quantity, min_quantity)
      VALUES (${name}, ${wholesale_price}, ${retail_price}, ${quantity}, ${min_quantity || 10})
      RETURNING *
    `;

    return c.json(result[0], 201);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Update product
app.put("/api/products/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const { name, wholesale_price, retail_price, quantity, min_quantity } = await c.req.json();

    const result = await Bun.sql`
      UPDATE products
      SET 
        name = COALESCE(${name}, name),
        wholesale_price = COALESCE(${wholesale_price}, wholesale_price),
        retail_price = COALESCE(${retail_price}, retail_price),
        quantity = COALESCE(${quantity}, quantity),
        min_quantity = COALESCE(${min_quantity}, min_quantity),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return c.json({ error: "Product not found" }, 404);
    }

    return c.json(result[0]);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// ============ SALES SYSTEM ============

// Create sale
app.post("/api/sales", async (c) => {
  try {
    const { customer_name, customer_phone, items, payment_type } = await c.req.json();
    
    if (!customer_name || !items || items.length === 0) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Calculate total
    let total = 0;
    for (const item of items) {
      const product = await Bun.sql`
        SELECT retail_price FROM products WHERE id = ${item.product_id}
      `;
      if (product.length === 0) {
        return c.json({ error: `Product ${item.product_id} not found` }, 404);
      }
      total += product[0].retail_price * item.quantity;
    }

    // Create sale
    const saleResult = await Bun.sql`
      INSERT INTO sales (customer_name, customer_phone, total_amount, payment_type, status)
      VALUES (${customer_name}, ${customer_phone}, ${total}, ${payment_type || 'cash'}, 'completed')
      RETURNING id, customer_name, customer_phone, total_amount, created_at
    `;

    const sale = saleResult[0];

    // Add sale items and update inventory
    for (const item of items) {
      await Bun.sql`
        INSERT INTO sale_items (sale_id, product_id, quantity, price)
        VALUES (${sale.id}, ${item.product_id}, ${item.quantity}, 
          (SELECT retail_price FROM products WHERE id = ${item.product_id}))
      `;

      // Update inventory
      await Bun.sql`
        UPDATE products
        SET quantity = quantity - ${item.quantity}
        WHERE id = ${item.product_id}
      `;
    }

    return c.json({ 
      message: "Sale created successfully",
      sale 
    }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Get sales
app.get("/api/sales", async (c) => {
  try {
    const sales = await Bun.sql`
      SELECT id, customer_name, customer_phone, total_amount, payment_type, status, created_at
      FROM sales
      ORDER BY created_at DESC
    `;
    return c.json(sales);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Get sale details
app.get("/api/sales/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const sale = await Bun.sql`
      SELECT * FROM sales WHERE id = ${id}
    `;

    if (sale.length === 0) {
      return c.json({ error: "Sale not found" }, 404);
    }

    const items = await Bun.sql`
      SELECT si.id, si.product_id, p.name, si.quantity, si.price
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ${id}
    `;

    return c.json({ ...sale[0], items });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// ============ ACCOUNTS RECEIVABLE ============

// Get customers with debt
app.get("/api/accounts/customers", async (c) => {
  try {
    const customers = await Bun.sql`
      SELECT DISTINCT customer_name, customer_phone, 
        SUM(CASE WHEN payment_type = 'credit' THEN total_amount ELSE 0 END) as debt,
        SUM(CASE WHEN payment_type = 'cash' THEN total_amount ELSE 0 END) as paid
      FROM sales
      GROUP BY customer_name, customer_phone
      ORDER BY customer_name
    `;
    return c.json(customers);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// ============ ARCHIVE ============

// Archive old sales
app.post("/api/archive/monthly", async (c) => {
  try {
    const { year, month } = await c.req.json();
    
    if (!year || !month) {
      return c.json({ error: "Year and month required" }, 400);
    }

    const result = await Bun.sql`
      UPDATE sales
      SET archived = true, archived_at = NOW()
      WHERE EXTRACT(YEAR FROM created_at) = ${year}
        AND EXTRACT(MONTH FROM created_at) = ${month}
      RETURNING id
    `;

    return c.json({ 
      message: `Archived ${result.length} sales`,
      count: result.length
    });
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Get archived sales
app.get("/api/archive/:year/:month", async (c) => {
  try {
    const year = parseInt(c.req.param("year"));
    const month = parseInt(c.req.param("month"));

    const sales = await Bun.sql`
      SELECT id, customer_name, customer_phone, total_amount, payment_type, created_at
      FROM sales
      WHERE archived = true
        AND EXTRACT(YEAR FROM created_at) = ${year}
        AND EXTRACT(MONTH FROM created_at) = ${month}
      ORDER BY created_at DESC
    `;

    return c.json(sales);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

export default app;
