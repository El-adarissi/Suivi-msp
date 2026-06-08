const Responsable_crmef = require("../models/Responsable_crmef");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client("583827417875-l3k605h5e08ipvoc5scq6ghugldbfgii.apps.googleusercontent.com");


exports.register = async (req, res) => {
  try {
    const { responsable_id, email, password } = req.body;

    // Vérifier si le responsable existe déjà
    const responsableExists = await Responsable_crmef.findOne({
      $or: [
        { email },
        { responsable_id }
      ]
    });

    if (responsableExists) {
      return res.status(400).json({
        success: false,
        message: "Responsable already exists",
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le responsable
    const responsable = await Responsable_crmef.create({
      responsable_id,
      email,
      password: hashedPassword,
      role: "admin",
    });
    res.status(201).json({
      success: true,
      message: "Responsable created successfully",
      responsable: {
        _id: responsable._id,
        responsable_id: responsable.responsable_id,
        email: responsable.email,
        role: responsable.role,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.loginResponsable = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 🔴 check champs obligatoires
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont obligatoires",
      });
    }

    // 🔴 find user
    const responsable = await Responsable_crmef.findOne({
      email,
    });

    if (!responsable) {
      return res.status(400).json({
        success: false,
        message: "Email incorrect",
      });
    }

    // 🔴 check role
    if (responsable.role !== role) {
      return res.status(403).json({
        success: false,
        message: "Rôle non autorisé",
      });
    }

    // 🔴 check password
    const isMatch = await bcrypt.compare(
      password,
      responsable.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mot de passe incorrect",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Connexion réussie",
      responsable,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // 🔴 verify google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name } = payload;

    // 🔴 check if user exists
    let user = await Responsable.findOne({ email });

    if (!user) {
      user = await Responsable.create({
        email,
        firstName: name,
        password: "", // google user no password
        role: "admin",
      });
    }

    // 🔴 create JWT
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token: jwtToken,
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
