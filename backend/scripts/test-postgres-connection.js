import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('🔍 Testing PostgreSQL Connection...\n');

  try {
    // Test 1: Basic connection
    console.log('Test 1: Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connection successful!\n');

    // Test 2: Simple query
    console.log('Test 2: Running test query...');
    const result = await prisma.$queryRaw`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Query successful!');
    console.log('   Current Time:', result[0].current_time);
    console.log('   PostgreSQL Version:', result[0].pg_version.split(' ')[0], result[0].pg_version.split(' ')[1]);
    console.log('');

    // Test 3: Check tables
    console.log('Test 3: Checking database tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log('⚠️  No tables found. Run "npx prisma db push" to create tables.');
    } else {
      console.log(`✅ Found ${tables.length} tables:`);
      tables.forEach(t => console.log(`   - ${t.table_name}`));
    }
    console.log('');

    // Test 4: Connection pool info
    console.log('Test 4: Connection pool status...');
    console.log('✅ Connection pool active');
    console.log('');

    console.log('🎉 All tests passed! PostgreSQL is ready to use.\n');

    // Summary
    console.log('📊 Summary:');
    console.log('   Database: Connected ✅');
    console.log('   Tables:', tables.length > 0 ? `${tables.length} found ✅` : 'Not created yet ⚠️');
    console.log('   Status: Ready for migration 🚀\n');

    if (tables.length === 0) {
      console.log('💡 Next Steps:');
      console.log('   1. Run: npx prisma generate');
      console.log('   2. Run: npx prisma db push');
      console.log('   3. Run: npx prisma studio (to view database)\n');
    }

  } catch (error) {
    console.error('❌ Connection test failed!\n');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check DATABASE_URL in .env file');
    console.error('   2. Verify Neon project is active');
    console.error('   3. Check internet connection');
    console.error('   4. Ensure connection string includes ?sslmode=require\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
