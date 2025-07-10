const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
require("dotenv").config();
const protectedRoutes = require('./routes/protected.routes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Default route for health check
app.get("/", (req, res) => {
  res.send("✅ BankDApp backend is live!");
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api", protectedRoutes); // e.g. /api/profile (requires token)

// Port config
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
