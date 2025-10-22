import { Pool } from "pg";

// 链接池，所有的连接都维护在这个连接池里面
let globalPool: Pool;

export function getDb() {
  if (!globalPool) {
    const connectionString = process.env.POSTGRES_URL;
    
    // 如果没有配置数据库连接字符串，返回 null
    if (!connectionString) {
      console.warn('⚠️ POSTGRES_URL not configured. Database features will be disabled.');
      return null;
    }

    globalPool = new Pool({
      connectionString,
    });
  }

  return globalPool;
}