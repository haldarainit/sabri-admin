module.exports = {
  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/sabri-admin",
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || "sabri-admin-super-secret-jwt-key-2024",
    expiresIn: "30d",
  },

  // Admin configuration
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@sabri.com",
    password: process.env.ADMIN_PASSWORD || "admin123",
  },

  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || "development",
  },

  // CORS configuration
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    authMax: 5, // limit auth requests to 5 per windowMs
  },
};
