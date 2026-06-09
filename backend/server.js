const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const bodyParser = require("body-parser");
// Test DB connection on startup
const db = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ─── Mailer setup ──────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST, // ex: smtp.gmail.com
  port: process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER, // your email
    pass: process.env.MAIL_PASS, // app password
  },
});

// Table + champs selon le rôle
const ROLE_CONFIG = {
  responsable_crmef: {
    table: "responsables_crmef",
    idField: "Id_CRMEF",
    hasEmail: false,
  },
  stagiaire: {
    table: "stagiaires",
    idField: "Id_Stagiaire",
    hasEmail: true,
  },
  superviseur: {
    table: "superviseurs_crmef",
    idField: "Id_Superviseur",
    hasEmail: true,
  },
  etablissement: {
    table: "etablissements",
    idField: "Id_Etablissement",
    hasEmail: true,
  },
};

db.getConnection()
  .then((connection) => {
    console.log("✅ MySQL connecté avec succès");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion MySQL :", err.message);
    process.exit(1);
  });

app.post("/api/auth/register", async (req, res) => {
  const { Email, Password, role } = req.body;
  console.log("Données reçues pour l'inscription :", { Email, Password, role });
  if (!Password) {
    return res.status(400).json({
      success: false,
      message: "Le mot de passe est obligatoire.",
    });
  }
  try {
    const hashedPassword = await bcrypt.hash(Password, 10);

    const [result] = await db.query(
      "INSERT INTO responsables_crmef (Email, Password, role) VALUES (?, ?, ?)",
      [Email, hashedPassword, role],
    );

    return res.status(201).json({
      success: true,
      message: "Responsable CRMEF créé avec succès.",
      data: {
        Id_CRMEF: result.insertId,
      },
    });
  } catch (err) {
    console.error("Erreur register responsable :", err.message);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const { email, password, role } = req.body;

  if (!password || !role) {
    return res.status(400).json({
      success: false,
      message: "Mot de passe et rôle sont obligatoires.",
    });
  }

  const config = ROLE_CONFIG[role];
  if (!config) {
    return res.status(400).json({
      success: false,
      message: "Rôle invalide.",
    });
  }

  try {
    let query;
    let params;

    // responsable_crmef n'a pas d'email dans la table
    if (!config.hasEmail) {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email obligatoire.",
        });
      }
      // Pour responsable, on prend le premier enregistrement (unique)
      query = `SELECT * FROM ${config.table} LIMIT 1`;
      params = [];
    } else {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email obligatoire.",
        });
      }
      query = `SELECT * FROM ${config.table} WHERE Email = ?`;
      params = [email];
    }

    const [rows] = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects.",
      });
    }

    const user = rows[0];

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects.",
      });
    }

    // Vérifier si le compte est actif (superviseur / etablissement)
    if ("is_active" in user && user.is_active === 0) {
      return res.status(403).json({
        success: false,
        message: "Votre compte n'est pas encore activé.",
      });
    }

    // Générer le JWT
    const payload = {
      id: user[config.idField],
      role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Construire l'objet user retourné (sans le mot de passe)
    const { Password, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      token,
      user: {
        ...userWithoutPassword,
        role,
      },
    });
  } catch (err) {
    console.error("Erreur login :", err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur.",
    });
  }
});


app.post("/api/addetablisement", async (req, res) => {
  const { NomEtab, Ville, Location, Email, Password } = req.body;
  if (!NomEtab || !Email || !Password || !Ville)
    return res.status(400).json({ success: false, message: "Nom, ville, email et mot de passe sont obligatoires." });
 
  try {
    // Check duplicate email
    const [existing] = await db.query(
      "SELECT Id_Etablissement FROM etablissements WHERE Email = ?", [Email]
    );
    if (existing.length > 0)
      return res.status(409).json({ success: false, message: "Cet email est déjà utilisé." });
 
    const hashedPassword = await bcrypt.hash(Password, 10);
    
    const [result] = await db.query(
      `INSERT INTO etablissements (NomEtab, Ville, Location, Email, Password, role, is_active)
       VALUES (?, ?, ?, ?, ?, 'etablissement', 0)`,
      [NomEtab, Ville, Location || null, Email, hashedPassword]
    );
    transporter
      .sendMail({
        from: process.env.MAIL_USER,
        to: Email, // ← mets ton email ici
        subject: "Bienvenue au CRMEF",
        text: "Bienvenue dans le système de suivi des stages du CRMEF ! Votre compte a été créé avec succès. Voici vos identifiants de connexion :\n\n" + Email + " / " + Password + "\n\nMerci de vous connecter et de compléter votre profil.lien vers platform : http://localhost:5173/signin",
      })
 
    res.status(201).json({
      success: true,
      message: "Établissement créé. Un email d'activation a été envoyé.",
      data: { Id_Etablissement: result.insertId },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// POST /api
// app.post("/api/addetablisement", async (req, res) => {
//   const { NomEtab, Email, Password } = req.body;

//   if (!NomEtab || !Email || !Password)
//     return res
//       .status(400)
//       .json({ success: false, message: "Tous les champs sont obligatoires." });

//   try {
//     const [existing] = await db.query(
//       "SELECT Id_Etablissement FROM etablissements WHERE Email = ?",
//       [Email],
//     );
//     if (existing.length > 0)
//       return res
//         .status(409)
//         .json({ success: false, message: "Cet email est déjà utilisé." });

//     const hashedPassword = await bcrypt.hash(Password, 10);
//     const [result] = await db.query(
//       "INSERT INTO etablissements (NomEtab, Email, Password) VALUES (?, ?, ?)",
//       [NomEtab, Email, hashedPassword],
//     );
//     transporter
//       .sendMail({
//         from: process.env.MAIL_USER,
//         to: Email, // ← mets ton email ici
//         subject: "Bienvenue au CRMEF",
//         text: "Bienvenue dans le système de suivi des stages du CRMEF ! Votre compte a été créé avec succès. Voici vos identifiants de connexion :\n\n" + Email + " / " + Password + "\n\nMerci de vous connecter et de compléter votre profil. lien d'activation : http://localhost:5173/signin",
//       })
//       .then(() => console.log("Email envoyé ✅"))
//       .catch((err) => console.error("Erreur :", err.message));
//     res
//       .status(201)
//       .json({
//         success: true,
//         message: "Établissement créé.",
//         data: { Id_Etablissement: result.insertId },
//       });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Erreur serveur." });
//   }
// });


// ── DELETE ────────────────────────────────────────────────────────────────────
app.delete("/api/deleteetablissement/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM etablissements WHERE Id_Etablissement = ?", [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Établissement non trouvé." });
    res.json({ success: true, message: "Établissement supprimé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

app.get("/api/getalletablissements", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT Id_Etablissement, NomEtab, Email,Ville, Location, is_active FROM etablissements",
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
