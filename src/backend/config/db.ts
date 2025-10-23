import { Pool } from "pg";

// 链接池，所有的连接都维护在这个连接池里面
let globalPool: Pool | null = null;

// 创建一个dummy pool用于错误处理，防止生产环境崩溃
function createDummyPool(): Pool {
  return {
    query: async () => ({ rows: [], rowCount: 0, command: '', oid: 0, fields: [] }),
    connect: async () => ({ 
      query: async () => ({ rows: [], rowCount: 0, command: '', oid: 0, fields: [] }),
      release: () => {}
    }),
    end: async () => {},
    on: () => {},
    totalCount: 0,
    idleCount: 0,
    waitingCount: 0
  } as any;
}

export function getDb(): Pool {
  if (!globalPool) {
    const connectionString = process.env.POSTGRES_URL;
    
    // 如果没有配置数据库连接字符串，在生产环境返回dummy pool
    if (!connectionString) {
      console.warn('⚠️ POSTGRES_URL environment variable is not set, using dummy pool');
      return createDummyPool();
    }

    try {
      globalPool = new Pool({
        connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
      console.log('✅ Database connection pool created successfully');
    } catch (error) {
      console.error('❌ Failed to create database connection pool:', error);
      return createDummyPool();
    }
  }

  return globalPool || createDummyPool();
}

// 安全的获取数据库连接，返回null而不是抛出错误
export function getDbSafe(): Pool | null {
  try {
    return getDb();
  } catch (error) {
    console.warn('⚠️ Database connection not available:', error);
    return null;
  }
}