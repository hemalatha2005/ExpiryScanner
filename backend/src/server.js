require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err.message));

const PORT = 5000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});
