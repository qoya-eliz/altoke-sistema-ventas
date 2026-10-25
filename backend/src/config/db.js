const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Singleton Pattern para el Pool de Conexiones MySQL

class Database {
  constructor() {
    if (!Database.instance) {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'minimarket_altoke_db',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        waitForConnections: true,
        connectionLimit: 15,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });
      Database.instance = this;
    }
    return Database.instance;
  }

  getPool() {
    return this.pool;
  }

  async query(sql, params) {
    const [rows, fields] = await this.pool.query(sql, params);
    return rows;
  }

  async execute(sql, params) {
    const [result] = await this.pool.execute(sql, params);
    return result;
  }

  async getConnection() {
    return await this.pool.getConnection();
  }
}

const dbInstance = new Database();
module.exports = dbInstance;
