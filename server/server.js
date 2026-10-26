const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const auth = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const Record = require("./models/Record");

// Initialize express app
const app = express();
app.use(cors());
app.use(express.json());

// In-memory record store for development resilience when MongoDB is offline
const inMemoryRecords = [];

// Helper to check MongoDB connection status
const isDbConnected = () => mongoose.connection.readyState === 1;

// MongoDB Connection Setup
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Breava";
mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 2500,
}).then(() => {
  console.log("MongoDB connected successfully");
}).catch((err) => {
  console.log("MongoDB connection deferred (resilient in-memory fallback enabled):", err.message);
});

// Setup Multer for File Uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Breava API Gateway",
    database: isDbConnected() ? "MongoDB Connected" : "In-Memory Resilient Store",
    flask_url: process.env.FLASK_URL || "http://127.0.0.1:8008",
  });
});

// Auth Routes
app.use("/api/auth", authRoutes);

// Public Test Route
app.get("/api", (req, res) => {
  res.json({ message: "Breava Healthcare Intelligence API online" });
});

// Protected Diagnose Endpoint: forward to Flask ML service & persist records
app.post(
  "/api/diagnose",
  auth,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No diagnostic CSV file uploaded." });
    }

    const filePath = req.file.path;
    try {
      // Build form-data for Flask ML microservice
      const form = new FormData();
      form.append("file", fs.createReadStream(filePath), req.file.originalname);

      const FLASK_URL = process.env.FLASK_URL || "http://127.0.0.1:8008";
      const flaskRes = await axios.post(
        `${FLASK_URL}/predict_csv`,
        form,
        { headers: form.getHeaders() }
      );
      const results = flaskRes.data.results; // Array of ['benign', 'malignant', ...]

      // Save each result as a separate Record
      if (isDbConnected()) {
        const recordDocs = results.map((r) => ({
          user: req.user.id,
          filename: req.file.originalname,
          result: r,
        }));
        await Record.insertMany(recordDocs);
      } else {
        results.forEach((r) => {
          inMemoryRecords.unshift({
            _id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            user: req.user.id,
            filename: req.file.originalname,
            result: r,
            createdAt: new Date().toISOString(),
          });
        });
      }

      return res.json({ result: results });
    } catch (err) {
      console.error("ML service communication error:", err.response?.status, err.response?.data || err.message);
      const msg = err.response?.data?.error || err.message || "Diagnostic service error";
      return res
        .status(err.response?.status || 500)
        .json({ error: msg });
    } finally {
      // Clean up uploaded file
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error("Failed to delete temp file:", unlinkErr);
      });
    }
  }
);

// Protected Get All Diagnosis Records
app.get("/api/records", auth, async (req, res) => {
  try {
    if (isDbConnected()) {
      const records = await Record.find({ user: req.user.id }).sort({ createdAt: -1 });
      res.json(records);
    } else {
      const userRecords = inMemoryRecords.filter(r => r.user === req.user.id);
      res.json(userRecords);
    }
  } catch (err) {
    console.error("Error fetching records:", err);
    res.status(500).json({ error: "Failed to fetch diagnostic records." });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Breava API Server is running on port ${PORT}`);
});
