import pkg from "pg";

const { Pool } = pkg;

let pool;

const connectDB = () => {
  if (!pool) {
    pool = new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.DB_NAME,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT || 5432,
      ssl: {
        rejectUnauthorized: false,
      },
      connectionTimeoutMillis: 5000,
    });

    pool.on("error", (err) => {
      console.error("Unexpected PostgreSQL pool error:", err.message);
      pool = null; // Reset the pool on error
    });

    console.log("PostgreSQL pool initialized");
  }

  return pool;
};

export default connectDB;
