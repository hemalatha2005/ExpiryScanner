const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const protectedRoutes = require("./routes/protected.routes");
const itemRoutes = require("./routes/items.routes");
const dashboardRoutes = require("./routes/dashboard.routes");



const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/dashboard", dashboardRoutes);



module.exports = app;
