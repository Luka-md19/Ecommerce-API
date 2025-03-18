// const redis = require('redis');

// // Create Redis client
// const client = redis.createClient();

// client.on('connect', function () {
//   console.log('Connected to Redis');
// });

// client.on('error', (err) => console.error('Redis Client Error', err));

// client.connect(); // Ensure the client connects to Redis

// // Middleware for caching
// const cacheMiddleware = (keyPrefix) => {
//   return async (req, res, next) => {
//     const cacheKey = `${keyPrefix}:${req.params.id}`;

//     try {
//       const cachedData = await client.get(cacheKey);

//       if (cachedData) {
//         return res.status(200).json({
//           status: 'success',
//           data: JSON.parse(cachedData),
//         });
//       }

//       next(); // Proceed to the controller if cache is empty
//     } catch (error) {
//       return next(new AppError('Error fetching from Redis cache', 500));
//     }
//   };
// };

// // Utility function to cache data in Redis
// const cacheCategory = async (cacheKey, data, expirationTime = 3600) => {
//   try {
//     await client.set(cacheKey, JSON.stringify(data), { EX: expirationTime });
//   } catch (error) {
//     console.error('Error caching category:', error);
//   }
// };

// module.exports = {
//   client,
//   cacheMiddleware,
//   cacheCategory,
// };
