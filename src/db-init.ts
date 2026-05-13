// Database initialization script
const DATABASE_URL = Bun.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const sql = await import("postgres");
const db = sql.default(DATABASE_URL);

async function initializeDatabase() {
  try {
    console.log("Creating tables...");

    // Users table
    await db`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log("✓ Users table created");

    // Products table
    await db`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        wholesale_price DECIMAL(10, 2) NOT NULL,
        retail_price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        min_quantity INT DEFAULT 10,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log("✓ Products table created");

    // Sales table
    await db`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_type VARCHAR(50) DEFAULT 'cash',
        status VARCHAR(50) DEFAULT 'completed',
        archived BOOLEAN DEFAULT FALSE,
        archived_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log("✓ Sales table created");

    // Sale items table
    await db`
      CREATE TABLE IF NOT EXISTS sale_items (
        id SERIAL PRIMARY KEY,
        sale_id INT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
        product_id INT NOT NULL REFERENCES products(id),
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log("✓ Sale items table created");

    // Create indexes
    await db`CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_name)`;
    await db`CREATE INDEX IF NOT EXISTS idx_sales_created ON sales(created_at)`;
    await db`CREATE INDEX IF NOT EXISTS idx_products_name ON products(name)`;
    console.log("✓ Indexes created");

    // Insert default user (admin / admin123)
    const hashedPassword = await Bun.password.hash("admin123");
    await db`
      INSERT INTO users (username, password)
      VALUES ('admin', ${hashedPassword})
      ON CONFLICT (username) DO NOTHING
    `;
    console.log("✓ Default user created (admin / admin123)");

    console.log("\n✅ Database initialized successfully!");
    console.log("Default credentials: admin / admin123");

  } catch (error) {
    console.error("❌ Error initializing database:", error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

await initializeDatabase();
