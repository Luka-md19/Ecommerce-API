const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const promClient = require("prom-client");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const logger = require("./utils/logger"); // Import the centralized logger
const { v4: uuidv4 } = require("uuid");

// Load environment variables from .env file
dotenv.config({ path: "./config.env" });

const app = express();

// Import routes
const productRouter = require("./routes/productRoutes");
const categoryRouter = require("./routes/categoryRoutes");
const userRouter = require("./routes/userRoutes");
const addressRouter = require("./routes/addressRoutes");
const wishlistRouter = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const shippingRouter = require("./routes/shippingRoutes"); // Keep only internal shipping routes

// Import controllers
const paymentController = require("./controllers/paymentController");

// Import services
// Remove external shipping services
// require("./services/shippingService"); // Keep internal shippingService if used
// require("./services/mockShippingServer");
// require('./services/shippingPollingService');
require("./services/orderService");

// Metrics setup
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "code"],
  buckets: [50, 100, 200, 300, 400, 500],
});

register.registerMetric(httpRequestDurationMicroseconds);

// Middleware to collect metrics
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on("finish", () => {
    end({
      route: req.route ? req.route.path : req.originalUrl, // Use originalUrl if route is undefined
      code: res.statusCode,
      method: req.method,
    });
  });
  next();
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Middleware to generate request IDs (optional)
app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

// Helper function to mask email addresses
function maskEmail(email) {
  const [local, domain] = email.split("@");
  const maskedLocal = local.length > 2 ? local.slice(0, 2) + "***" : "***";
  return `${maskedLocal}@${domain}`;
}

// Logging middleware to debug incoming requests
app.use((req, res, next) => {
  // Check if the route is a webhook to skip logging the body
  const isStripeWebhook = req.originalUrl === "/api/v1/payments/webhook";


  // Clone headers to modify before logging
  const headers = { ...req.headers };

  // Remove or redact sensitive headers
  if (headers.authorization) {
    headers.authorization = '***REDACTED***';
  }
  if (headers['stripe-signature']) {
    headers['stripe-signature'] = '***REDACTED***';
  }

  if (isStripeWebhook /* || isShippingWebhook */) {
    // Log without body for webhooks
    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`, {
      requestId: req.id,
      headers,
    });
  } else {
    // Clone and mask body to avoid logging sensitive information
    const body = { ...req.body };
    if (body.email) {
      body.email = maskEmail(body.email);
    }

    logger.info(`Incoming request: ${req.method} ${req.originalUrl}`, {
      requestId: req.id,
      headers,
      body,
    });
  }

  next();
});

// Mount the Stripe webhook route before body parsing middleware
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook
);

// Remove Shipping webhook routes
// app.use(
//   "/webhooks",
//   express.raw({ type: "application/json" }), // Apply raw parser to all /webhooks routes
//   webhookRoutes
// );

// Body parser middleware (for parsing JSON requests)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    allowedHeaders: "Content-Type, Authorization",
  })
);

// Data sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// HTTP request logging (optional)
// Uncomment if you prefer to use morgan
// const morgan = require("morgan");
// app.use(morgan("combined"));

// Mount the other routes after body parsing middleware
app.use("/api/v1/products", productRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/addresses", addressRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/shipping", shippingRouter);

// Catch-all for unmatched routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { error: err.message, stack: err.stack });
  process.exit(1);
});

module.exports = app;
