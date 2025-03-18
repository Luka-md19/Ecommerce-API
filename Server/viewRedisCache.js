const redis = require('redis');

// Connect to Redis
const client = redis.createClient();

client.on('error', (err) => {
    console.log('Redis error:', err);
});

client.connect();

// Fetch all keys and their values
(async () => {
    try {
        const keys = await client.keys('*');
        
        if (keys.length === 0) {
            console.log('No keys found in Redis.');
        } else {
            console.log('Cached keys and their values:');
            for (const key of keys) {
                const value = await client.get(key);
                console.log(`${key}: ${value}`);
            }
        }
        
        client.quit();
    } catch (err) {
        console.log('Error fetching Redis keys:', err);
    }
})();
