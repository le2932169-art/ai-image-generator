const { Pool } = require('pg');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 检查数据库连接状态...\n');

  // 检查环境变量
  const connectionString = process.env.POSTGRES_URL;
  
  if (!connectionString) {
    console.log('❌ POSTGRES_URL 环境变量未配置');
    console.log('💡 要启用数据库功能，请在 .env 文件中设置 POSTGRES_URL');
    console.log('📋 格式示例：');
    console.log('   POSTGRES_URL="postgres://username:password@host:port/database"');
    console.log('   或者 Supabase 格式：');
    console.log('   POSTGRES_URL="postgres://postgres.[项目ID]:[项目秘钥]@aws-0-[数据库所在区域].pooler.supabase.com:6543/postgres"');
    return;
  }

  console.log('✅ POSTGRES_URL 已配置');
  console.log(`🔗 连接字符串: ${connectionString.replace(/:[^:@]*@/, ':****@')}`);

  // 尝试连接数据库
  const pool = new Pool({ connectionString });

  try {
    console.log('\n🔌 尝试连接数据库...');
    const client = await pool.connect();
    console.log('✅ 数据库连接成功！');

    // 检查数据库版本
    const versionResult = await client.query('SELECT version()');
    console.log(`📊 数据库版本: ${versionResult.rows[0].version.split(' ').slice(0, 2).join(' ')}`);

    // 检查必需的表是否存在
    console.log('\n📋 检查数据库表结构...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const existingTables = tablesResult.rows.map(row => row.table_name);
    const requiredTables = [
      'users', 
      'effect', 
      'effect_result', 
      'credit_usage', 
      'payment_history', 
      'subscription_plans', 
      'user_subscriptions'
    ];

    console.log(`📊 发现 ${existingTables.length} 个表: ${existingTables.join(', ')}`);

    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length === 0) {
      console.log('✅ 所有必需的表都已存在');
      
      // 检查 effect 表的数据
      const effectCount = await client.query('SELECT COUNT(*) FROM effect');
      console.log(`📊 effect 表中有 ${effectCount.rows[0].count} 条记录`);
      
      if (effectCount.rows[0].count > 0) {
        const effects = await client.query('SELECT id, name, type, platform FROM effect LIMIT 5');
        console.log('🎨 effect 表前5条记录:');
        effects.rows.forEach(effect => {
          console.log(`   - ID: ${effect.id}, 名称: ${effect.name}, 类型: ${effect.type}, 平台: ${effect.platform}`);
        });
      }
    } else {
      console.log(`❌ 缺少以下表: ${missingTables.join(', ')}`);
      console.log('💡 建议运行数据库初始化脚本 (init.sql)');
    }

    // 测试插入和查询功能
    console.log('\n🧪 测试数据库写入功能...');
    try {
      await client.query('BEGIN');
      
      // 测试插入一个临时用户（如果 users 表存在）
      if (existingTables.includes('users')) {
        const testUuid = 'test-' + Date.now();
        await client.query(`
          INSERT INTO users (uuid, email, nickname, avatar_url, created_at) 
          VALUES ($1, $2, $3, $4, NOW())
        `, [testUuid, 'test@example.com', '测试用户', 'https://example.com/avatar.jpg']);
        
        console.log('✅ 成功插入测试数据');
        
        // 查询刚插入的数据
        const result = await client.query('SELECT * FROM users WHERE uuid = $1', [testUuid]);
        if (result.rows.length > 0) {
          console.log('✅ 成功查询测试数据');
        }
        
        // 删除测试数据
        await client.query('DELETE FROM users WHERE uuid = $1', [testUuid]);
        console.log('✅ 成功删除测试数据');
      }
      
      await client.query('COMMIT');
      console.log('✅ 数据库写入功能正常');
      
    } catch (writeError) {
      await client.query('ROLLBACK');
      console.log('❌ 数据库写入测试失败:', writeError.message);
    }

    client.release();
    console.log('\n🎉 数据库检查完成！数据库可以正常存储信息。');
    
  } catch (error) {
    console.log(`❌ 数据库连接失败: ${error.message}`);
    
    if (error.code === 'ENOTFOUND') {
      console.log('💡 可能的原因: 主机名无法解析，请检查连接字符串中的主机地址');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 可能的原因: 数据库服务器拒绝连接，请检查端口和防火墙设置');
    } else if (error.code === '28P01') {
      console.log('💡 可能的原因: 用户名或密码错误，请检查认证信息');
    } else if (error.code === '3D000') {
      console.log('💡 可能的原因: 数据库不存在，请确认数据库名称');
    }
  } finally {
    await pool.end();
  }
}

// 运行测试
testDatabaseConnection().catch(console.error);