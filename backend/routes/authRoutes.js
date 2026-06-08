const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// IMPORTANT
router.post("/register", authController.register);
router.post("/login-responsable", authController.loginResponsable);
router.post("/google-login", authController.googleLogin);


module.exports = router;