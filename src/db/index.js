import pkg from "pg";

const { Pool } = pkg; 

const connectDB = async () => {
  const pool = new Pool({
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

  try {
    await pool.connect();
    console.log("Connected to PostgreSQL");
    return pool;
  } catch (err) {
    console.error("PostgreSQL connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
