import dotenv from "dotenv";
import mysql from "mysql2";

dotenv.config();

const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 30000,
};

const db = mysql.createPool(poolConfig);

const testConnection = () => {
  db.getConnection((err, connection) => {
    if (err) {
      console.error("❌ Database Connection Failed");
      console.error("Error Code:", err.code);
      return;
    }

    console.log("✅ Database Connected Successfully!");
    connection.release();
  });
};

testConnection();

export default db;