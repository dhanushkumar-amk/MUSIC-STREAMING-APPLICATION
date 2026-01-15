import { Redis } from '@upstash/redis';
import dotenv from 'dotenv';

dotenv.config();

async function setupCaching() {
  console.log('🔧 Setting up Caching Layer...\n');

  try {
    // Check if Redis credentials exist
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.log('⚠️  Redis credentials not found in .env\n');
      console.log('📝 To setup Redis caching:');
      console.log('   1. Go to https://upstash.com');
      console.log('   2. Create a free account');
      console.log('   3. Create a new Redis database');
      console.log('   4. Copy REST URL and Token');
      console.log('   5. Add to .env:');
      console.log('      UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"');
      console.log('      UPSTASH_REDIS_REST_TOKEN="AXXXxxx"\n');
      return;
    }

    // Test Redis connection
    console.log('Test 1: Connecting to Redis...');
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN
    });

    // Test ping
    const pingResult = await redis.ping();
    console.log('✅ Redis connected! Ping:', pingResult);
    console.log('');

    // Test set/get
    console.log('Test 2: Testing cache operations...');
    await redis.set('test:key', 'Hello from cache!', { ex: 60 });
    const value = await redis.get('test:key');
    console.log('✅ Cache write/read successful!');
    console.log('   Value:', value);
    console.log('');

    // Test TTL
    console.log('Test 3: Testing TTL...');
    const ttl = await redis.ttl('test:key');
    console.log('✅ TTL working!');
    console.log('   Expires in:', ttl, 'seconds');
    console.log('');

    // Cleanup
    await redis.del('test:key');

    console.log('🎉 Redis caching is ready!\n');

    console.log('📊 Cache Configuration:');
    console.log('   Provider: Upstash Redis ✅');
    console.log('   Connection: Active ✅');
    console.log('   Operations: Working ✅');
    console.log('   Status: Ready for use 🚀\n');

    console.log('💡 Cache Strategy:');
    console.log('   L1: Memory Cache (30s TTL)');
    console.log('   L2: Redis Cache (5min TTL)');
    console.log('   L3: PostgreSQL Database\n');

  } catch (error) {
    console.error('❌ Redis setup failed!\n');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Verify UPSTASH_REDIS_REST_URL in .env');
    console.error('   2. Verify UPSTASH_REDIS_REST_TOKEN in .env');
    console.error('   3. Check Upstash dashboard for database status');
    console.error('   4. Ensure database is not paused\n');
  }
}

setupCaching();
