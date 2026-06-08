const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = require("./app");

// Middleware
app.use(cors());
app.use(express.json());


const connectDB = require("./config/db");

connectDB();


// Route test
app.get("/api/message", (req, res) => {
  res.json({
    success: true,
    message: "Bonjour depuis Express !"
  });
});



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});




