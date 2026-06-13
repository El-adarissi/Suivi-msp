const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const bodyParser = require("body-parser");
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");



// Test DB connection on startup
const db = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));


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

const ROLE_CONFIG = {
  responsable_crmef: {
    table: "responsables_crmef",
    idField: "Id_CRMEF",
    hasEmail: false,
  },
  stagiairestag: {
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
  stagiairestag: {
    table: "stagiaires",
    idField: "Id_Stagiaire",
    hasEmail: true,
  },
  etablissementetab: {
    table: "etablissements",
    idField: "Id_Etablissement",
    hasEmail: true,
  },
};


// ── HELPER token ────────────────────────────────────────
function getUserId(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    throw new Error("Token manquant");
  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.id;
}

// ── MULTER CONFIG ───────────────────────────────────────
const UPLOAD_DIR = "uploads/rapports";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    cb(null, `rapport_${unique}${ext}`);
  },
});
 
const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Format non accepté. Utilisez PDF, DOC ou DOCX."));
};
 
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});



db.getConnection()
  .then((connection) => {
    console.log("✅ MySQL connecté avec succès");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ Erreur de connexion MySQL :", err.message);
    process.exit(1);
  });



const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Token manquant" });
    }

    // Format: "Bearer TOKEN"
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token invalide" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = decoded; // e.g. { id: 1, email: ... }

    next();
  } catch (err) {
    return res.status(403).json({ message: "Token invalide ou expiré" });
  }
};




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
  console.log("Configuration de rôle pour la connexion :", config);
  console.log("Données reçues pour la connexion :", { email, password, role });
  if (!config) {
    return res.status(400).json({
      success: false,
      message: "Rôle invalide.",
    });
  }

  try {
    let query;
    let params;

    if (!config.hasEmail) {
      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email obligatoire.",
        });
      }

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
    console.log("Requête SQL pour login :", query, "avec params :", params);
    const [rows] = await db.query(query, params);
    console.log("Résultat de la requête login :", rows);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects.",
      });
    }

    let user = rows[0];

    // Vérification du mot de passe
    if (password !== user.Password) {
      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects.",
      });
    }

    if (role === "responsable_crmef" && user.Email !== email && comparePassword(password, user.Password)) {
      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects.",
      });
    }
    

    console.log("Password saisi :", password);
    console.log("Password BD :", user.Password);
    

    // if (!isMatch) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Identifiants incorrects.",
    //   });
    // }

    // Vérifier si la colonne is_active existe
    if (Object.prototype.hasOwnProperty.call(user, "is_active")) {
      // Première connexion
      if (user.is_active === 0) {
        await db.query(
          `UPDATE ${config.table}
           SET is_active = 1
           WHERE ${config.idField} = ?`,
          [user[config.idField]],
        );

        // Récupérer les données mises à jour
        const [updatedRows] = await db.query(
          `SELECT *
           FROM ${config.table}
           WHERE ${config.idField} = ?`,
          [user[config.idField]],
        );

        if (updatedRows.length > 0) {
          user = updatedRows[0];
        }
      }
    }

    // Génération du JWT
    const payload = {
      id: user[config.idField],
      role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Supprimer le mot de passe
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
      error: err.message,
    });
  }
});

// app.post("/api/addetablisement", async (req, res) => {
//   const { NomEtab, Ville, Location, Email, Password } = req.body;
//   if (!NomEtab || !Email || !Password || !Ville)
//     return res.status(400).json({
//       success: false,
//       message: "Nom, ville, email et mot de passe sont obligatoires.",
//     });

//   try {
//     // Check duplicate email
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
//       `INSERT INTO etablissements (NomEtab, Ville, Location, Email, Password, role, is_active)
//        VALUES (?, ?, ?, ?, ?, 'etablissement', 0)`,
//       [NomEtab, Ville, Location || null, Email, hashedPassword],
//     );
//     transporter.sendMail({
//       from: process.env.MAIL_USER,
//       to: Email, // ← mets ton email ici
//       subject: "Bienvenue au CRMEF",
//       text:
//         "Bienvenue dans le système de suivi des stages du CRMEF ! Votre compte a été créé avec succès. Voici vos identifiants de connexion :\n\n" +
//         Email +
//         " / " +
//         Password +
//         "\n\nMerci de vous connecter et de compléter votre profil.lien vers platform : http://localhost:5173/signin",
//     });

//     res.status(201).json({
//       success: true,
//       message: "Établissement créé. Un email d'activation a été envoyé.",
//       data: { Id_Etablissement: result.insertId },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Erreur serveur." });
//   }
// });


app.post("/api/addetablisement", async (req, res) => {
  const { NomEtab, Ville, Location, Email, Password } = req.body;
  
  if (!NomEtab || !Email || !Password || !Ville) {
    return res.status(400).json({
      success: false,
      message: "Nom, ville, email et mot de passe sont obligatoires.",
    });
  }

  try {
    // Vérifier si l'email existe déjà
    const [existing] = await db.query(
      "SELECT Id_Etablissement FROM etablissements WHERE Email = ?",
      [Email],
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: "Cet email est déjà utilisé." 
      });
    }

    // ON PASSE DIRECTEMENT LE MOT DE PASSE EN CLAIR ICI (Pas de bcrypt)
    const [result] = await db.query(
      `INSERT INTO etablissements (NomEtab, Ville, Location, Email, Password, role, is_active)
       VALUES (?, ?, ?, ?, ?, 'etablissement', 0)`,
      [NomEtab, Ville, Location || null, Email, Password], 
    );

    // Envoi de l'e-mail de bienvenue
    try {
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: Email, 
        subject: "Bienvenue au CRMEF",
        text:
          `Bienvenue dans le système de suivi des stages du CRMEF !\n\n` +
          `Votre compte établissement a été créé avec succès. Voici vos identifiants de connexion :\n` +
          `• Email : ${Email}\n` +
          `• Mot de passe : ${Password}\n\n` +
          `Merci de vous connecter pour compléter votre profil.\n` +
          `Lien vers la plateforme : http://localhost:5173/signin`,
      });
    } catch (mailErr) {
      console.error("Erreur lors de l'envoi de l'email :", mailErr);
    }

    return res.status(201).json({
      success: true,
      message: "Établissement créé. Un email d'activation a été envoyé.",
      data: { Id_Etablissement: result.insertId },
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});




// ── DELETE ────────────────────────────────────────────────────────────────────
app.delete("/api/deleteetablissement/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM etablissements WHERE Id_Etablissement = ?",
      [req.params.id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Établissement non trouvé." });
    res.json({ success: true, message: "Établissement supprimé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// app.get("/api/getalletablissements", async (req, res) => {
//   try {
//     const [rows] = await db.query(
//       "SELECT Id_Etablissement, NomEtab, Email,Ville, Location, is_active FROM etablissements",
//     );
//     res.json({ success: true, data: rows });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Erreur serveur." });
//   }
// });

app.put("/api/updateetablissement/:id", async (req, res) => {
  const { id } = req.params;
  const { NomEtab, Email, Ville, Location, is_active } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE etablissements 
       SET NomEtab = ?, Email = ?, Ville = ?, Location = ?, is_active = ?
       WHERE Id_Etablissement = ?`,
      [NomEtab, Email, Ville, Location, is_active, id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Établissement non trouvé." });
    }

    res.json({
      success: true,
      message: "Établissement mis à jour avec succès.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

app.get("/api/getallstagiaires", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        s.Id_Stagiaire,
        s.NomStag,
        s.PrenomStag,
        s.Filiere,
        s.Email,
        e.NomEtab,
        s.Id_Etablissement, s.Id_Superviseur,
        CONCAT(sup.NomSup, ' ', sup.PrenomSup) AS NomSuperviseur
      FROM stagiaires s
      LEFT JOIN etablissements e      ON s.Id_Etablissement = e.Id_Etablissement
      LEFT JOIN superviseurs_crmef sup ON s.Id_Superviseur  = sup.Id_Superviseur
    `);
    res.json({ success: true, data: rows });
    console.log(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

app.get("/api/getalletablissements", async (req, res) => {
  try {
    // Utilisation des noms exacts de ta base de données : Ville, Location, Email, is_active
    const [rows] = await db.query(
      "SELECT Id_Etablissement, NomEtab, Ville, Location, Email , is_active FROM etablissements WHERE is_active = 1"
    );
    
    console.log("==== Établissements récupérés avec succès ====");
    console.log(rows)
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("Erreur dans GET /api/getalletablissements :", err);
    return res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// POST ajouter stagiaire
app.post("/api/addstagiaire", async (req, res) => {
  const {
    NomStag,
    PrenomStag,
    Filiere,
    Email,
    Password,
    Id_Etablissement,
    Id_Superviseur,
  } = req.body;

  if (!NomStag || !PrenomStag || !Filiere || !Email || !Password) {
    return res
      .status(400)
      .json({ success: false, message: "Champs obligatoires manquants." });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO stagiaires (NomStag, PrenomStag, Filiere, Email, Password,Id_Etablissement,Id_Superviseur)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        NomStag,
        PrenomStag,
        Filiere,
        Email,
        Password,
        Id_Etablissement || null,
        Id_Superviseur || null,
      ],
    );
    res.json({ success: true, id: result.insertId });

    transporter
      .sendMail({
        from: process.env.MAIL_USER,
        to: Email, // ← mets ton email ici
        subject: "Bienvenue au CRMEF",
        text:
          "Bienvenue dans le système de suivi des stages du CRMEF ! Votre compte a été créé avec succès. Voici vos identifiants de connexion :\n\n" +
          Email +
          " / " +
          Password +
          "\n\nMerci de vous connecter et de compléter votre profil. lien d'activation : http://localhost:5173/signin",
      })
      .then(() => console.log("Email envoyé ✅"))
      .catch((err) => console.error("Erreur :", err.message));
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// PUT modifier un stagiaire
app.put("/api/stagiaire/:id", async (req, res) => {
  const { id } = req.params;
  const {
    NomStag,
    PrenomStag,
    Filiere,
    Email,
    Password,
    Id_Etablissement,
    Id_Superviseur,
  } = req.body;

  try {
    let query, params;

    if (Password) {
      query = `UPDATE stagiaires 
               SET NomStag=?, PrenomStag=?, Filiere=?, Email=?, Password=?, 
                   Id_Etablissement=?, Id_Superviseur=?
               WHERE Id_Stagiaire=?`;
      params = [
        NomStag,
        PrenomStag,
        Filiere,
        Email,
        Password,
        Id_Etablissement || null,
        Id_Superviseur || null,
        id,
      ];
    } else {
      query = `UPDATE stagiaires 
               SET NomStag=?, PrenomStag=?, Filiere=?, Email=?, 
                   Id_Etablissement=?, Id_Superviseur=?
               WHERE Id_Stagiaire=?`;
      params = [
        NomStag,
        PrenomStag,
        Filiere,
        Email,
        Id_Etablissement || null,
        Id_Superviseur || null,
        id,
      ];
    }

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Stagiaire non trouvé." });

    res.json({ success: true, message: "Stagiaire mis à jour." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// DELETE supprimer un stagiaire
app.delete("/api/stagiaire/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "DELETE FROM stagiaires WHERE Id_Stagiaire = ?",
      [id],
    );

    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Stagiaire non trouvé." });

    res.json({ success: true, message: "Stagiaire supprimé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// GET — déjà fait
app.get("/api/getallsuperviseurs", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.Id_Superviseur, s.NomSup, s.PrenomSup, s.Email, s.is_active,
              COUNT(st.Id_Stagiaire) AS NbStagiaires
       FROM superviseurs_crmef s
       LEFT JOIN stagiaires st ON st.Id_Superviseur = s.Id_Superviseur
       GROUP BY s.Id_Superviseur`,
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// POST
app.post("/api/addsuperviseur", async (req, res) => {
  const { NomSup, PrenomSup, Email, Password } = req.body;
  if (!NomSup || !PrenomSup || !Email || !Password)
    return res
      .status(400)
      .json({ success: false, message: "Champs obligatoires manquants." });
  try {
    const [result] = await db.query(
      "INSERT INTO superviseurs_crmef (NomSup, PrenomSup, Email, Password,role) VALUES (?, ?, ?, ?, ?)",
      [NomSup, PrenomSup, Email, Password, "superviseur"],
    );
    res.json({ success: true, id: result.insertId });
    transporter
      .sendMail({
        from: process.env.MAIL_USER,
        to: Email, // ← mets ton email ici
        subject: "Bienvenue au CRMEF",
        text:
          "Bienvenue dans le système de suivi des stages du CRMEF ! Votre compte a été créé avec succès. Voici vos identifiants de connexion :\n\n" +
          Email +
          " / " +
          Password +
          "\n\nMerci de vous connecter et de compléter votre profil. lien d'activation : http://localhost:5173/signin",
      })
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// PUT
app.put("/api/superviseur/:id", async (req, res) => {
  const { id } = req.params;
  const { NomSup, PrenomSup, Email, Password, is_active } = req.body;
  try {
    let query, params;
    if (Password) {
      query =
        "UPDATE superviseurs_crmef SET NomSup=?, PrenomSup=?, Email=?, Password=?, is_active=? WHERE Id_Superviseur=?";
      params = [NomSup, PrenomSup, Email, Password, is_active, id];
    } else {
      query =
        "UPDATE superviseurs_crmef SET NomSup=?, PrenomSup=?, Email=?, is_active=? WHERE Id_Superviseur=?";
      params = [NomSup, PrenomSup, Email, is_active, id];
    }
    const [result] = await db.query(query, params);
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Superviseur non trouvé." });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// DELETE
app.delete("/api/superviseur/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      "DELETE FROM superviseurs_crmef WHERE Id_Superviseur=?",
      [id],
    );
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ success: false, message: "Superviseur non trouvé." });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ── Stats dashboard (1 seule requête) ──────────────────
app.get("/api/getstats", async (req, res) => {
  try {
    const [[etab]] = await db.query(
      "SELECT COUNT(*) AS total, SUM(is_active) AS actifs FROM etablissements",
    );
    const [[stag]] = await db.query("SELECT COUNT(*) AS total FROM stagiaires");
    const [[stagactifs]] = await db.query(
      "SELECT COUNT(*) AS total FROM stagiaires WHERE Id_Etablissement IN (SELECT Id_Etablissement FROM etablissements WHERE is_active = 1)",
    );
    const [[sup]] = await db.query(
      "SELECT COUNT(*) AS total, SUM(is_active) AS actifs FROM superviseurs_crmef",
    );
    const [[recl]] = await db.query(
      "SELECT COUNT(*) AS total FROM reclamations",
    );
    const [[reclAtt]] = await db.query(
      "SELECT COUNT(*) AS total FROM reclamations WHERE statut = 'en_attente'",
    );

    res.json({
      success: true,
      data: {
        totalEtab: etab.total,
        activeEtab: etab.actifs,
        totalStagiaires: stag.total,
        activeStagiaires: stagactifs.total,
        totalSuperviseurs: sup.total,
        activeSuperviseurs: sup.actifs,
        totalReclamations: recl.total,
        reclEnAttente: reclAtt.total,
      },
    });
    console.log({
      totalEtab: etab.total,
      activeEtab: etab.actifs,
      totalStagiaires: stag.total,
      totalSuperviseurs: sup.total,
      activeSuperviseurs: sup.actifs,
      totalReclamations: recl.total,
      reclEnAttente: reclAtt.total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// ── Réclamations (si la table existe) ──────────────────
app.get("/api/getallreclamations", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.Id_Reclamation, r.objet, r.description, r.statut, r.created_at,
             s.NomStag, s.PrenomStag
      FROM reclamations r
      LEFT JOIN stagiaires s ON r.Id_Stagiaire = s.Id_Stagiaire
      ORDER BY r.created_at DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});


app.get("/api/rapports/my", async (req, res) => {
  try {
    const userId = getUserId(req);
    const [rows] = await db.query(
      "SELECT * FROM rapports WHERE Id_Stagiaire = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json({ data: rows });
  } catch (err) {
    res.status(401).json({ message: "Token invalide", error: err.message });
  }
});

// ════════════════════════════════════════════════════════
// POST /api/rapports
// ════════════════════════════════════════════════════════
app.post("/api/rapports", upload.single("file"), async (req, res) => {
  try {
    // ── 1. Token ──────────────────────────────────────
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token manquant" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded JWT:", decoded); // ← regarde ce qui s'affiche
    const userId = decoded.id || decoded.Id || decoded.userId || decoded.sub;
    if (!userId) {
      return res.status(401).json({ message: "Champ id introuvable dans le token" });
    }

    // ── 2. Body ───────────────────────────────────────
    console.log("req.body:", req.body); // ← regarde ce qui s'affiche
    const title   = req.body ? (req.body.title   || "") : "";
    const content = req.body ? (req.body.content || "") : "";

    if (!title.trim()) {
      return res.status(400).json({ message: "Le titre est requis." });
    }

    // ── 3. Fichier ou texte ───────────────────────────
    let type      = "text";
    let file_name = null;
    let file_url  = null;

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
      type      = ext;
      file_name = req.file.originalname;
      file_url  = "/" + req.file.path.replace(/\\/g, "/");
    } else if (!content.trim()) {
      return res.status(400).json({ message: "Contenu requis pour un rapport texte." });
    }

    // ── 4. Insert ─────────────────────────────────────
    const [result] = await db.query(
      `INSERT INTO rapports (Id_Stagiaire, title, type, content, file_name, file_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, title.trim(), type, content || "", file_name, file_url]
    );

    const [rows] = await db.query(
      "SELECT * FROM rapports WHERE Id_Rapport = ?",
      [result.insertId]
    );

    res.status(201).json({ data: rows[0] });

  } catch (err) {
    console.error("POST /rapports ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});
// ════════════════════════════════════════════════════════
// PUT /api/rapports/:id
// ════════════════════════════════════════════════════════
app.put("/api/rapports/:id", upload.single("file"), async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { title, content } = req.body;
 
    const [existing] = await db.query(
      "SELECT * FROM rapports WHERE Id_Rapport = ? AND Id_Stagiaire = ?",
      [id, userId]
    );
 
    if (!existing.length)
      return res.status(404).json({ message: "Rapport introuvable ou accès refusé." });
 
    const rapport = existing[0];
 
    const updates = {
      title:     title?.trim()  || rapport.title,
      content:   content        ?? rapport.content,
      type:      rapport.type,
      file_name: rapport.file_name,
      file_url:  rapport.file_url,
    };
 
    if (req.file) {
      if (rapport.file_url) {
        const oldPath = rapport.file_url.replace(/^\//, "");
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
      updates.type      = ext;
      updates.file_name = req.file.originalname;
      updates.file_url  = `/${req.file.path.replace(/\\/g, "/")}`;
    }
 
    await db.query(
      `UPDATE rapports
       SET title = ?, type = ?, content = ?, file_name = ?, file_url = ?, updated_at = NOW()
       WHERE Id_Rapport = ?`,
      [updates.title, updates.type, updates.content, updates.file_name, updates.file_url, id]
    );
 
    const [rows] = await db.query("SELECT * FROM rapports WHERE Id_Rapport = ?", [id]);
    res.json({ data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});


app.delete("/api/rapports/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
 
    const [existing] = await db.query(
      "SELECT * FROM rapports WHERE Id_Rapport = ? AND Id_Stagiaire = ?",
      [id, userId]
    );
 
    if (!existing.length)
      return res.status(404).json({ message: "Rapport introuvable ou accès refusé." });
 
    const rapport = existing[0];
    if (rapport.file_url) {
      const filePath = rapport.file_url.replace(/^\//, "");
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
 
    await db.query("DELETE FROM rapports WHERE Id_Rapport = ?", [id]);
    res.json({ message: "Rapport supprimé." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});



app.get("/api/stagiaires/my-infos",verifyToken, async (req, res) => {
  try {
    const stagiaireId = req.user.id; // set by verifyToken middleware
 
    // ── 1. Fetch stagiaire ────────────────────────────────────────────────
    const [stagRows] = await db.query(
      `SELECT
         Id_Stagiaire,
         CONCAT(PrenomStag, ' ', NomStag) AS nom_complet,
         Filiere                          AS filiere,
         Email                            AS email,
         Id_Etablissement,
         Id_Superviseur
       FROM stagiaires
       WHERE Id_Stagiaire = ?`,
      [stagiaireId]
    );
 
    if (stagRows.length === 0) {
      return res.status(404).json({ message: "Stagiaire introuvable." });
    }
 
    const stagiaire = stagRows[0];
 
    // ── 2. Fetch établissement (may be null) ──────────────────────────────
    let etablissement = null;
    if (stagiaire.Id_Etablissement) {
      const [etabRows] = await db.query(
        `SELECT
           NomEtab  AS nom,
           Ville    AS ville,
           Location AS location,
           Email    AS email
         FROM etablissements
         WHERE Id_Etablissement = ?`,
        [stagiaire.Id_Etablissement]
      );
      if (etabRows.length > 0) etablissement = etabRows[0];
    }
 
    // ── 3. Fetch superviseur (may be null) ────────────────────────────────
    let superviseur = null;
    if (stagiaire.Id_Superviseur) {
      const [supRows] = await db.query(
        `SELECT
           CONCAT(PrenomSup, ' ', NomSup) AS nom,
           Email                          AS email
         FROM superviseurs_crmef
         WHERE Id_Superviseur = ?`,
        [stagiaire.Id_Superviseur]
      );
      if (supRows.length > 0) superviseur = supRows[0];
    }
 
    // Strip internal FK fields before sending
    const { Id_Etablissement, Id_Superviseur, Id_Stagiaire, ...stagPublic } =
      stagiaire;
 
    return res.json({
      stagiaire: stagPublic,
      etablissement,
      superviseur,
    });
  } catch (err) {
    console.error("[GET /stagiaires/my-infos]", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
});



app.get("/api/stagiaires", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token manquant" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const superviseurId = decoded.id;

    const [rows] = await db.query(
      `
      SELECT 
        s.Id_Stagiaire AS id,
        s.NomStag AS nom,
        s.PrenomStag AS prenom,
        s.Email AS email,
        COALESCE(s.Filiere, '') AS filiere,
        COALESCE(s.is_active, 0) AS statut,

        e.NomEtab AS etablissement,

        sp.Id_Superviseur AS superviseur_id,
        sp.NomSup AS superviseur_nom,
        sp.PrenomSup AS superviseur_prenom,
        sp.Email AS superviseur_email

      FROM stagiaires s

      LEFT JOIN etablissements e 
        ON s.Id_Etablissement = e.Id_Etablissement

      INNER JOIN superviseurs_crmef sp 
        ON s.Id_Superviseur = sp.Id_Superviseur

      WHERE s.Id_Superviseur = ?
      `,
      [superviseurId]
    );

    res.json({ data: rows });
    console.log("Stagiaires récupérés pour superviseur", superviseurId, ":", rows);
  } catch (err) {
    console.error("GET stagiaires error:", err);

    res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    });
  }
});


app.get("/api/superviseur/rapports", verifyToken, async (req, res) => {
  try {
    const superviseurId = req.user.id;

    const [rows] = await db.query(`
      SELECT
        r.Id_Rapport,
        r.title,
        r.type,
        r.content,
        r.file_name,
        r.file_url,
        r.commentaire,
        r.created_at,

        s.Id_Stagiaire,
        s.NomStag,
        s.PrenomStag,
        s.Email

      FROM rapports r

      INNER JOIN stagiaires s
        ON r.Id_Stagiaire = s.Id_Stagiaire

      WHERE s.Id_Superviseur = ?

      ORDER BY r.created_at DESC
    `, [superviseurId]);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});


app.put(
  "/api/superviseur/rapports/:id/commentaire",
  verifyToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { commentaire } = req.body;

      // 1. Mise à jour du commentaire en Base de Données
      await db.query(
        `
        UPDATE rapports
        SET commentaire = ?
        WHERE Id_Rapport = ?
        `,
        [commentaire, id]
      );

      // 2. Récupération des informations du stagiaire et du rapport pour l'e-mail
      try {
        const queryInfos = `
          SELECT 
            r.title AS TitreRapport,
            s.NomStag,
            s.PrenomStag,
            s.Email AS EmailStag
          FROM rapports r
          JOIN stagiaires s ON r.Id_Stagiaire = s.Id_Stagiaire
          WHERE r.Id_Rapport = ?
        `;
        const [rows] = await db.query(queryInfos, [id]);

        if (rows && rows.length > 0) {
          const stagiaire = rows[0];
          const nomComplet = `${stagiaire.PrenomStag} ${stagiaire.NomStag}`;

          // 3. Envoi du mail de notification avec les consignes
          if (stagiaire.EmailStag) {
            await transporter.sendMail({
              from: process.env.MAIL_USER,
              to: stagiaire.EmailStag,
              subject: `CRMEF - Nouvelles consignes sur votre rapport : ${stagiaire.TitreRapport}`,
              text: 
                `Bonjour ${nomComplet},\n\n` +
                `Votre superviseur de stage vient de consulter votre rapport intitulé "${stagiaire.TitreRapport}" et y a laissé des commentaires ou des consignes de correction.\n\n` +
                `--- Retour du Superviseur ---\n` +
                `"${commentaire}"\n` +
                `-----------------------------\n\n` +
                `Merci de prendre en compte ces remarques et d'apporter les modifications nécessaires directement sur votre espace de gestion du CRMEF.\n\n` +
                `Cordialement,\nL'équipe de suivi des stages CRMEF.`
            });
          }
        }
      } catch (mailErr) {
        // On log l'erreur de messagerie sans bloquer l'expérience utilisateur sur le front-end
        console.error("Erreur lors de l'envoi de l'email au stagiaire :", mailErr);
      }

      res.json({
        success: true,
        message: "Commentaire enregistré et notification envoyée."
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);


// 1. GET Supervisor Profile Info
app.get("/api/superviseur/profile", verifyToken, async (req, res) => {
  try {
    // Fallback: Check for database column key layout or standard id property
    const supervisorId = req.user.Id_Superviseur || req.user.id; 
    
    if (!supervisorId) {
      return res.status(400).json({ 
        message: "Identifiant manquant dans le jeton d'authentification." 
      });
    }
    
    const [rows] = await db.query(
      "SELECT NomSup, PrenomSup, Email, is_active, role FROM superviseurs_crmef WHERE Id_Superviseur = ?", 
      [supervisorId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Superviseur introuvable" });
    }
    
    // Express send object structured identically to front-end layout mapping
    res.json({ data: rows[0] });
  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. PUT Update Profile Info
app.put("/api/superviseur/profile/update", verifyToken, async (req, res) => {
  try {
    const supervisorId = req.user.id;
    const { NomSup, PrenomSup, Email } = req.body;

    // Validation
    if (!NomSup || !PrenomSup || !Email) {
      return res.status(400).json({ message: "Veuillez remplir les champs obligatoires" });
    }

    await db.query(
      "UPDATE superviseurs_crmef SET NomSup = ?, PrenomSup = ?, Email = ? WHERE Id_Superviseur = ?",
      [NomSup, PrenomSup, Email, supervisorId]
    );

    res.json({ message: "Profil mis à jour avec succès" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.get("/api/stagiaire/profile", verifyToken, async (req, res) => {
  try {
    // Safely look for either column layout or raw token key structures
    const stagiaireId = req.user.Id_Stagiaire || req.user.id; 

    if (!stagiaireId) {
      return res.status(400).json({ message: "Identifiant stagiaire manquant dans le jeton." });
    }
    
    const [rows] = await db.query(
      "SELECT NomStag, PrenomStag, Filiere, Email, role, Id_Etablissement, Id_Superviseur, is_active FROM Stagiaires WHERE Id_Stagiaire = ?", 
      [stagiaireId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Stagiaire introuvable" });
    }
    
    res.json({ data: rows[0] });
  } catch (err) {
    console.error("Stagiaire profile fetch crash:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. PUT Update Trainee Profile Info
app.put("/api/stagiaire/profile/update", verifyToken, async (req, res) => {
  try {
    const stagiaireId = req.user.Id_Stagiaire || req.user.id;
    const { NomStag, PrenomStag, Filiere, Email } = req.body;

    if (!NomStag || !PrenomStag || !Filiere || !Email) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs obligatoires" });
    }

    await db.query(
      "UPDATE Stagiaires SET NomStag = ?, PrenomStag = ?, Filiere = ?, Email = ? WHERE Id_Stagiaire = ?",
      [NomStag, PrenomStag, Filiere, Email, stagiaireId]
    );

    res.json({ message: "Profil mis à jour avec succès !" });
  } catch (err) {
    console.error("Stagiaire profile update crash:", err);
    res.status(500).json({ error: err.message });
  }
});

// 1. GET Current Authenticated Établissement Profile details
app.get("/api/etablissement/profile", verifyToken, async (req, res) => {
  try {
    // Extract ID checking for specific table column mapping or token payload standard
    const etabId = req.user.Id_Etablissement || req.user.id;

    if (!etabId) {
      return res.status(400).json({ message: "Identifiant de l'établissement introuvable dans le jeton." });
    }

    const [rows] = await db.query(
      "SELECT NomEtab, Ville, Location, Email, is_active, role FROM etablissements WHERE Id_Etablissement = ?",
      [etabId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Établissement introuvable." });
    }

    res.json({ data: rows[0] });
  } catch (err) {
    console.error("Fetch profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. PUT Update Current Authenticated Établissement Profile
app.put("/api/etablissement/profile/update", verifyToken, async (req, res) => {
  try {
    const etabId = req.user.Id_Etablissement || req.user.id;
    const { NomEtab, Ville, Location, Email, Password } = req.body;

    if (!NomEtab || !Ville || !Email) {
      return res.status(400).json({ message: "Veuillez renseigner tous les champs obligatoires (Nom, Ville, Email)." });
    }

    // Dynamic field tracking update
    let query = "UPDATE etablissements SET NomEtab = ?, Ville = ?, Location = ?, Email = ?";
    let params = [NomEtab, Ville, Location, Email];

    // If a new password was typed, hash it and add to query execution bundle
    if (Password && Password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(Password, 10);
      query += ", Password = ?";
      params.push(hashedPassword);
    }

    query += " WHERE Id_Etablissement = ?";
    params.push(etabId);

    await db.query(query, params);
    res.json({ message: "Les informations de l'établissement ont été mises à jour avec succès !" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET all assigned trainees with their institution details
// app.get("/api/etablissement/assigned-stagiaires", verifyToken, async (req, res) => {
//   try {
//     // 1. Récupérer l'ID de l'établissement connecté depuis le token JWT
//     const etabId = req.user.Id_Etablissement || req.user.id;

//     if (!etabId) {
//       return res.status(400).json({ message: "Identifiant de l'établissement manquant dans le jeton." });
//     }

//     // 2. Filtrer par s.Id_Etablissement pour n'avoir QUE ses stagiaires
//     const query = `
//       SELECT 
//         s.Id_Stagiaire, 
//         s.NomStag, 
//         s.PrenomStag, 
//         s.Email, 
//         s.Filiere, 
//         s.is_active,
//         e.NomEtab as etablissement
//       FROM Stagiaires s
//       LEFT JOIN etablissements e ON s.Id_Etablissement = e.Id_Etablissement
//       WHERE s.Id_Etablissement = ?
//     `;
    
//     // 3. Passer l'ID en paramètre sécurisé
//     const [rows] = await db.query(query, [etabId]);
//     console.log("Stagiaires affectés récupérés pour l'établissement", etabId, ":", rows);
//     res.json({ data: rows });
//   } catch (err) {
//     console.error("Error fetching assigned trainees for this establishment:", err);
//     res.status(500).json({ error: err.message });
//   }
// });
app.get("/api/etablissement/assigned-stagiaires", verifyToken, async (req, res) => {
  try {
    // 1. Récupérer l'ID de l'établissement connecté depuis le token JWT
    const etabId = req.user.Id_Etablissement || req.user.id;

    if (!etabId) {
      return res.status(400).json({ message: "Identifiant de l'établissement manquant dans le jeton." });
    }

    // 2. Requête avec jointure pour récupérer les informations du stagiaire et sa réclamation active
    const query = `
      SELECT 
        s.Id_Stagiaire, 
        s.NomStag, 
        s.PrenomStag, 
        s.Email, 
        s.Filiere, 
        s.is_active,
        e.NomEtab AS etablissement,
        r.Id_Reclamation,
        r.type AS reclamation_type,
        r.statut AS reclamation_statut,
        r.description AS reclamation_motif
      FROM Stagiaires s
      LEFT JOIN etablissements e ON s.Id_Etablissement = e.Id_Etablissement
      LEFT JOIN reclamations r ON s.Id_Stagiaire = r.Id_Stagiaire 
        AND r.statut = 'attente_etablissement'
        AND r.type = 'changement_etablissement'
      WHERE s.Id_Etablissement = ?
      GROUP BY s.Id_Stagiaire;
    `;
    
    // 3. Passer l'ID en paramètre sécurisé
    const [rows] = await db.query(query, [etabId]);
    
    console.log("Stagiaires affectés récupérés avec réclamations pour l'établissement", etabId, ":", rows);
    res.json({ data: rows });
  } catch (err) {
    console.error("Error fetching assigned trainees for this establishment:", err);
    res.status(500).json({ error: err.message });
  }
});

// app.put("/api/etablissement/stagiaires/:id/accepter", verifyToken, async (req, res) => {
//   const { id } = req.params;

//   try {
//     // 1. Récupérer les infos du stagiaire et de son établissement AVANT la mise à jour
//     const infoQuery = `
//       SELECT 
//         s.NomStag, 
//         s.PrenomStag, 
//         s.Email AS EmailStag, 
//         e.NomEtab 
//       FROM Stagiaires s
//       LEFT JOIN etablissements e ON s.Id_Etablissement = e.Id_Etablissement
//       WHERE s.Id_Stagiaire = ?
//     `;
//     const [rows] = await db.query(infoQuery, [id]);

//     if (rows.length === 0) {
//       return res.status(404).json({ error: "Stagiaire introuvable." });
//     }

//     const stagiaire = rows[0];
//     const nomComplet = `${stagiaire.PrenomStag} ${stagiaire.NomStag}`;
//     const etablissementNom = stagiaire.NomEtab || "notre établissement";

//     // 2. Accepter le stagiaire en passant son statut à actif
//     const updateQuery = "UPDATE Stagiaires SET is_active = 1 WHERE Id_Stagiaire = ?";
    
//     await db.query(updateQuery, [id]);

//     // 3. Envoi des e-mails en arrière-plan (sans bloquer la réponse de l'API)
//     try {
//       // -- Mail pour le stagiaire --
//       if (stagiaire.EmailStag) {
//         await transporter.sendMail({
//           from: process.env.MAIL_USER,
//           to: stagiaire.EmailStag,
//           subject: "CRMEF - Votre affectation de stage a été acceptée !",
//           text: 
//             `Bonjour ${nomComplet},\n\n` +
//             `Nous avons le plaisir de vous informer que votre demande de stage a été acceptée par l'établissement : ${etablissementNom}.\n\n` +
//             `Votre compte est désormais actif. Vous pouvez vous connecter à la plateforme pour commencer à soumettre vos rapports et suivre vos consignes.\n\n` +
//             `Lien de connexion : http://localhost:5173/signin\n\n` +
//             `Bon courage pour votre stage !`,
//         });
//       }

//       // -- Mail pour l'admin du CRMEF --
//       // Note : Remplace 'admin@crmef.ma' par l'adresse de ton choix ou par process.env.ADMIN_EMAIL
//       const adminEmail = process.env.ADMIN_EMAIL || "admin@crmef.ma"; 
      
//       await transporter.sendMail({
//         from: process.env.MAIL_USER,
//         to: adminEmail,
//         subject: `CRMEF - Notification d'acceptation : ${nomComplet}`,
//         text: 
//           `Bonjour l'Administration,\n\n` +
//           `L'établissement "${etablissementNom}" vient d'accepter officiellement le stagiaire suivant dans sa structure :\n\n` +
//           `• Stagiaire : ${nomComplet}\n` +
//           `• Email du stagiaire : ${stagiaire.EmailStag}\n\n` +
//           `Le statut du stagiaire a été mis à jour automatiquement sur la plateforme.\n\n` +
//           `Cordialement,\nSystème automatisé CRMEF.`,
//       });

//     } catch (mailErr) {
//       // On log l'erreur de mail mais on ne fait pas planter la requête front-end
//       console.error("Erreur lors de l'envoi des e-mails d'acceptation :", mailErr);
//     }

//     // 4. Réponse de succès envoyée au front-end
//     res.json({ message: "Stagiaire accepté avec succès et notifications envoyées." });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Erreur lors de la validation du stagiaire." });
//   }
// });

app.put("/api/etablissement/stagiaires/:id/accepter", verifyToken, async (req, res) => {
  const { id } = req.params; // C'est l'Id_Stagiaire envoyé par le front-end

  // 1. Récupérer une connexion dédiée du pool pour piloter la transaction
  const connection = await db.getConnection();

  try {
    // Démarrage de la transaction SQL
    await connection.beginTransaction();

    // 2. Récupérer les infos du stagiaire et de son établissement avant la mise à jour
    const infoQuery = `
      SELECT 
        s.NomStag, 
        s.PrenomStag, 
        s.Email AS EmailStag, 
        e.NomEtab 
      FROM Stagiaires s
      LEFT JOIN etablissements e ON s.Id_Etablissement = e.Id_Etablissement
      WHERE s.Id_Stagiaire = ?
    `;
    const [rows] = await connection.query(infoQuery, [id]);

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Stagiaire introuvable." });
    }

    const stagiaire = rows[0];
    const nomComplet = `${stagiaire.PrenomStag} ${stagiaire.NomStag}`;
    const etablissementNom = stagiaire.NomEtab || "notre établissement";

    // 3. Mettre à jour le stagiaire (is_active = 1)
    const updateStagiaireQuery = "UPDATE Stagiaires SET is_active = 1 WHERE Id_Stagiaire = ?";
    await connection.query(updateStagiaireQuery, [id]);

    // 4. Mettre à jour la réclamation associée à "Validé définitif" ('acceptee')
    const updateReclamationQuery = `
      UPDATE reclamations 
      SET statut = 'acceptee' 
      WHERE Id_Stagiaire = ? 
        AND type = 'changement_etablissement' 
        AND statut = 'attente_etablissement'
    `;
    await connection.query(updateReclamationQuery, [id]);

    // Validation définitive des changements en Base de Données
    await connection.commit();

    // 5. Envoi des e-mails en arrière-plan (ne bloque pas le cycle de réponse HTTP)
    try {
      // -- Mail pour le stagiaire --
      if (stagiaire.EmailStag) {
        await transporter.sendMail({
          from: process.env.MAIL_USER,
          to: stagiaire.EmailStag,
          subject: "CRMEF - Votre affectation de stage a été acceptée !",
          text: 
            `Bonjour ${nomComplet},\n\n` +
            `Nous avons le plaisir de vous informer que votre demande de stage a été acceptée par l'établissement : ${etablissementNom}.\n\n` +
            `Votre compte est désormais actif et votre réclamation est officiellement validée. Vous pouvez vous connecter à la plateforme pour commencer à soumettre vos rapports.\n\n` +
            `Lien de connexion : http://localhost:5173/signin\n\n` +
            `Bon courage pour votre stage !`,
        });
      }

      // -- Mail pour l'admin du CRMEF --
      const adminEmail = process.env.ADMIN_EMAIL || "admin@crmef.ma"; 
      
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: adminEmail,
        subject: `CRMEF - Notification d'acceptation et clôture : ${nomComplet}`,
        text: 
          `Bonjour l'Administration,\n\n` +
          `L'établissement "${etablissementNom}" vient d'accepter officiellement le stagiaire suivant dans sa structure :\n\n` +
          `• Stagiaire : ${nomComplet}\n` +
          `• Email du stagiaire : ${stagiaire.EmailStag}\n\n` +
          `Le statut du stagiaire a été passé à 'Actif' et son dossier de réaffectation est maintenant marqué comme 'Validé définitif' (acceptee).\n\n` +
          `Cordialement,\nSystème automatisé CRMEF.`,
      });

    } catch (mailErr) {
      // Évite de faire planter l'API si le service SMTP (NodeMailer) a un souci passager
      console.error("Erreur lors de l'envoi des e-mails d'acceptation :", mailErr);
    }

    // 6. Réponse de succès envoyée au front-end
    return res.json({ message: "Stagiaire accepté, réclamation clôturée et notifications envoyées." });

  } catch (err) {
    // En cas d'erreur sur n'importe quelle requête SQL, on annule TOUT
    await connection.rollback();
    console.error("Erreur lors de la validation du stagiaire et de sa réclamation :", err);
    return res.status(500).json({ error: "Erreur serveur lors de la validation." });
  } finally {
    // Libération impérative de la connexion pour éviter les fuites de ressources (Pool starvation)
    connection.release();
  }
});



app.put("/api/etablissement/stagiaires/:id/refuser", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Récupérer les informations du stagiaire et de son établissement AVANT de tout supprimer
    const infoQuery = `
      SELECT 
        s.NomStag, 
        s.PrenomStag, 
        s.Email AS EmailStag, 
        e.NomEtab 
      FROM Stagiaires s
      LEFT JOIN etablissements e ON s.Id_Etablissement = e.Id_Etablissement
      WHERE s.Id_Stagiaire = ?
    `;
    const [rows] = await db.query(infoQuery, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Stagiaire introuvable." });
    }

    const stagiaire = rows[0];
    const nomComplet = `${stagiaire.PrenomStag} ${stagiaire.NomStag}`;
    const etablissementNom = stagiaire.NomEtab || "l'établissement attribué";

    // 2. Mettre à jour la base de données (retrait de l'établissement et désactivation)
    const queryUpdate = "UPDATE Stagiaires SET Id_Etablissement = NULL, is_active = 0 WHERE Id_Stagiaire = ?";
    await db.query(queryUpdate, [id]);

    // 3. Envoi des e-mails de notification (en arrière-plan sécurisé)
    try {
    
      // -- Mail 2 : Envoi à l'Admin du CRMEF --
      const adminEmail = process.env.ADMIN_EMAIL || "admin@crmef.ma";
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: adminEmail,
        subject: `CRMEF - Affectation annulée/refusée pour ${nomComplet}`,
        text: 
          `Bonjour l'Administration,\n\n` +
          `L'action de refus/retrait d'affectation a été validée pour le stagiaire suivant :\n\n` +
          `• Stagiaire : ${nomComplet}\n` +
          `• Ancienne structure : ${etablissementNom}\n` +
          `• Email du stagiaire : ${stagiaire.EmailStag}\n\n`+
          `Cordialement,\nSystème automatisé CRMEF.`
      });

    } catch (mailErr) {
      // Capturer l'erreur mail pour éviter que l'API ne plante si le SMTP a un problème
      console.error("Erreur lors de l'envoi des e-mails de refus :", mailErr);
    }

    // 4. Réponse au frontend
    return res.json({ message: "Affectation du stagiaire refusée ou retirée avec succès." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur lors du refus du stagiaire." });
  }
});
 


app.get("/api/admin/reclamations", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        r.*,

        s1.NomStag AS stagiaire_nom,

        s2.NomStag AS stagiaire_cible_nom

      FROM reclamations r

      LEFT JOIN stagiaires s1
        ON s1.Id_Stagiaire = r.Id_Stagiaire

      LEFT JOIN stagiaires s2
        ON s2.Id_Stagiaire = r.stagiaire_cible_id

      ORDER BY r.created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});


app.put("/api/admin/reclamations/:id/accepter", async (req, res) => {
  const { id } = req.params;

  // Utilisation d'une transaction pour sécuriser la permutation croisée en base de données
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Mettre à jour le statut de la réclamation
    await connection.query(
      "UPDATE reclamations SET statut = 'acceptee' WHERE Id_Reclamation = ?",
      [id]
    );

    // 2. Récupérer les détails de la réclamation, des stagiaires et des établissements
    const queryDetails = `
      SELECT 
        r.type,
        r.objet,
        r.id_etablissement_depart,
        r.id_etablissement_cible,
        stA.Id_Stagiaire AS IdA, stA.Email AS EmailA, stA.NomStag AS NomA, stA.PrenomStag AS PrenomA,
        stB.Id_Stagiaire AS IdB, stB.Email AS EmailB, stB.NomStag AS NomB, stB.PrenomStag AS PrenomB,
        etabDep.NomEtab AS EtablissementDepartNom,
        etabCib.NomEtab AS EtablissementCibleNom
      FROM reclamations r
      JOIN stagiaires stA ON r.Id_Stagiaire = stA.Id_Stagiaire
      LEFT JOIN stagiaires stB ON r.stagiaire_cible_id = stB.Id_Stagiaire
      LEFT JOIN etablissements etabDep ON r.id_etablissement_depart = etabDep.Id_Etablissement
      LEFT JOIN etablissements etabCib ON r.id_etablissement_cible = etabCib.Id_Etablissement
      WHERE r.Id_Reclamation = ?
    `;
    const [rows] = await connection.query(queryDetails, [id]);

    if (!rows || rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Réclamation introuvable." });
    }

    const rec = rows[0];

    // 3. SI C'EST UN ÉCHANGE DE BINÔME : MISE À JOUR DES ÉTABLISSEMENTS DES DEUX STAGIAIRES
    if (rec.type === "echange_etablissement" && rec.IdB) {
      
      // Le stagiaire A prend l'établissement du stagiaire B (id_etablissement_cible)
      await connection.query(
        "UPDATE stagiaires SET Id_Etablissement = ? WHERE Id_Stagiaire = ?",
        [rec.id_etablissement_cible, rec.IdA]
      );

      // Le stagiaire B prend l'établissement du stagiaire A (id_etablissement_depart)
      await connection.query(
        "UPDATE stagiaires SET Id_Etablissement = ? WHERE Id_Stagiaire = ?",
        [rec.id_etablissement_depart, rec.IdB]
      );
    }

    // Validation définitive de toutes les requêtes SQL de la transaction
    await connection.commit();

    // 4. ENVOI DES MAILS DE CONFIRMATION AUX STAGIAIRES
    try {
      const nameA = `${rec.PrenomA} ${rec.NomA}`;
      const nameB = `${rec.PrenomB} ${rec.NomB}`;
      const etabA_Nom = rec.EtablissementDepartNom || "Non spécifié";
      const etabB_Nom = rec.EtablissementCibleNom || "Non spécifié";

      if (rec.type === "echange_etablissement") {
        // --- CAS PERMUTATION : Envoi d'un mail descriptif à chacun ---
        
        // Mail au Stagiaire A (Demandeur)
        if (rec.EmailA) {
          await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: rec.EmailA,
            subject: "CRMEF - Permutation validée officiellement",
            text: `Bonjour ${nameA},\n\nNous vous informons que l'administration du CRMEF a validé officiellement votre demande de permutation réciproque.\n\nVotre affectation a été mise à jour :\n• Votre nouvel établissement : ${etabB_Nom} (précédemment occupé par ${nameB}).\n\nCordialement,\nL'administration du CRMEF.`
          });
        }

        // Mail au Stagiaire B (Binôme)
        if (rec.EmailB) {
          await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: rec.EmailB,
            subject: "CRMEF - Permutation validée officiellement",
            text: `Bonjour ${nameB},\n\nNous vous informons que l'administration du CRMEF a validé officiellement la demande de permutation réciproque avec ${nameA}.\n\nVotre affectation a été mise à jour :\n• Votre nouvel établissement : ${etabA_Nom} (précédemment occupé par ${nameA}).\n\nCordialement,\nL'administration du CRMEF.`
          });
        }
      } else {
        // --- CAS REAFFECTATION SIMPLE (changement_etablissement) ---
        if (rec.EmailA) {
          await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: rec.EmailA,
            subject: "CRMEF - Demande de changement validée",
            text: `Bonjour ${nameA},\n\nVotre demande de changement d'établissement (Objet : ${rec.objet}) a été acceptée et validée par l'administration du CRMEF.\n\nVeuillez consulter votre espace étudiant pour prendre connaissance de votre nouvelle affectation.\n\nCordialement,\nL'administration du CRMEF.`
          });
        }
      }
    } catch (mailErr) {
      console.error("Erreur lors de l'envoi des e-mails de confirmation Admin :", mailErr);
    }

    // Réponse au frontend
    return res.json({ success: true, message: "Réclamation acceptée et affectations mises à jour." });

  } catch (err) {
    // En cas d'erreur dans le bloc SQL, on annule tout pour éviter de corrompre les données des stagiaires
    await connection.rollback();
    console.error("Erreur lors de la validation finale Admin :", err);
    return res.status(500).json({ error: "Une erreur interne est survenue lors de la validation." });
  } finally {
    connection.release(); // Libère la connexion au pool
  }
});


app.put(
  "/api/admin/reclamations/:id/refuser",
  async (req, res) => {
    try {
      await db.query(
        `
        UPDATE reclamations
        SET statut='refusee'
        WHERE Id_Reclamation=?
      `,
        [req.params.id]
      );

      res.json({
        success: true,
      });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);




app.get(
  "/api/reclamations/stagiaire/:id", 
  verifyToken,
  async (req, res) => {
    try {
      // Priorité à l'id extrait du token décodé, sinon on prend celui de l'URL
      const id = req.user.Id_Stagiaire || req.user.id || req.params.id;

      if (!id || id === "null") {
        return res.status(400).json({ 
          success: false, 
          message: "L'identifiant du stagiaire est invalide ou absent." 
        });
      }

      const query = `
        SELECT *
        FROM reclamations
        WHERE Id_Stagiaire = ?
        ORDER BY created_at DESC
      `;
      
      const [rows] = await db.query(query, [id]);
      console.log(`[Backend] Réclamations pour le stagiaire (${id}) :`, rows.length, "trouvée(s)");

      res.json(rows);
    } catch (err) {
      console.error("[Backend Error]:", err);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération des réclamations.",
      });
    }
  }
);


app.post("/api/reclamations", async (req, res) => {
  const { 
    Id_Stagiaire, 
    type, 
    objet, 
    description, 
    id_etablissement_depart, 
    id_etablissement_cible, 
    stagiaire_cible_id 
  } = req.body;

  // Validation des champs communs obligatoires
  if (!Id_Stagiaire || !objet || !description || !type) {
    return res.status(400).json({ message: "Veuillez remplir tous les champs obligatoires." });
  }

  try {
    let query = "";
    let values = [];

    if (type === "changement_etablissement") {
      // RÈGLE 1 : Le stagiaire ne choisit rien. On force les établissements et le binôme à NULL
      query = `
        INSERT INTO reclamations 
          (Id_Stagiaire, type, id_etablissement_depart, id_etablissement_cible, stagiaire_cible_id, objet, description, statut) 
        VALUES (?, ?, NULL, NULL, NULL, ?, ?, 'en_attente')
      `;
      values = [Id_Stagiaire, type, objet, description];

    } else if (type === "echange_etablissement") {
      // RÈGLE 2 : L'échange requiert obligatoirement le binôme, votre établissement ET son établissement
      if (!id_etablissement_depart || !id_etablissement_cible || !stagiaire_cible_id) {
        return res.status(400).json({ 
          message: "Pour un échange, vous devez renseigner votre établissement, celui du binôme et sélectionner le stagiaire." 
        });
      }

      query = `
        INSERT INTO reclamations 
          (Id_Stagiaire, type, id_etablissement_depart, id_etablissement_cible, stagiaire_cible_id, objet, description, statut) 
        VALUES (?, ?, ?, ?, ?, ?, ?, 'attente_confirmation')
      `;
      values = [Id_Stagiaire, type, id_etablissement_depart, id_etablissement_cible, stagiaire_cible_id, objet, description];
    }

    // Execution de l'enregistrement de la réclamation
    await db.query(query, values);
    
    // --- INTÉGRATION DE LA NOTIFICATION MAIL A ---
    if (type === "echange_etablissement") {
      try {
        // 1. Récupérer le nom et prénom du demandeur (Stagiaire A)
        const [demandeurResult] = await db.query(
          "SELECT NomStag, PrenomStag FROM stagiaires WHERE Id_Stagiaire = ?", 
          [Id_Stagiaire]
        );

        // 2. Récupérer l'adresse e-mail du binôme ciblé (Stagiaire B)
        const [cibleResult] = await db.query(
          "SELECT Email FROM stagiaires WHERE Id_Stagiaire = ?", 
          [stagiaire_cible_id]
        );

        // Vérification que le binôme ciblé possède bien une adresse e-mail valide
        if (cibleResult && cibleResult.length > 0 && cibleResult[0].Email) {
          const emailCible = cibleResult[0].Email;
          
          // Récupération des informations du demandeur pour personnaliser le contenu du message
          const prenomA = demandeurResult && demandeurResult.length > 0 ? demandeurResult[0].PrenomStag : "Un";
          const nomA = demandeurResult && demandeurResult.length > 0 ? demandeurResult[0].NomStag : "stagiaire";
          const nomCompletA = `${prenomA} ${nomA}`.trim();

          // Envoi de l'e-mail de notification d'échange
          await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: emailCible,
            subject: "CRMEF - Nouvelle demande de permutation de stage reçue",
            text: 
              `Bonjour,\n\n` +
              `Le stagiaire ${nomCompletA} vient de vous envoyer une proposition d'échange réciproque (permutation) pour votre poste de stage.\n\n` +
              `Détails de sa réclamation :\n` +
              `- Objet : ${objet}\n\n` +
              `Veuillez vous connecter dès maintenant sur votre espace personnel du système de suivi du CRMEF pour examiner, accepter ou refuser cette demande de binôme.\n\n` +
              `Lien d'accès direct : http://localhost:5173/signin\n\n` +
              `Cordialement,\n` +
              `L'équipe de gestion des stages du CRMEF.`
          });
        }
      } catch (mailErr) {
        // Bloc d'interception : empêche un crash du serveur si le service SMTP ou l'e-mail échoue
        console.error("Échec lors de l'envoi de l'e-mail de notification au binôme :", mailErr);
      }
    }

    return res.status(201).json({ message: "Réclamation enregistrée avec succès." });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

app.get("/api/stagiairesrec", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        Id_Stagiaire,
        NomStag,
        PrenomStag
      FROM stagiaires
      ORDER BY NomStag ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});


app.get("/api/etablissements", async (req, res) => {
  try {
    // Requête pour récupérer l'ID et le Nom de chaque établissement
    const query = `
      SELECT Id_Etablissement, NomEtab 
      FROM etablissements 
      ORDER BY NomEtab ASC
    `;
    
    const [rows] = await db.query(query);
    
    // Renvoyer directement les données
    res.json(rows);
  } catch (err) {
    console.error("Erreur lors de la récupération des établissements :", err);
    res.status(500).json({ error: "Erreur serveur lors de la récupération des établissements." });
  }
});



app.get("/api/reclamations/recues/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Requête SQL modifiée pour récupérer les NOMS des établissements
    const query = `
      SELECT 
        r.*, 
        s.NomStag, 
        s.PrenomStag, 
        e_depart.NomEtab AS NomEtabDepart, 
        e_cible.NomEtab AS NomEtabCible
      FROM reclamations r
      JOIN Stagiaires s ON r.Id_Stagiaire = s.Id_Stagiaire
      LEFT JOIN etablissements e_depart ON r.id_etablissement_depart = e_depart.Id_Etablissement
      LEFT JOIN etablissements e_cible ON r.id_etablissement_cible = e_cible.Id_Etablissement
      WHERE r.stagiaire_cible_id = ? AND r.type = 'echange_etablissement'
      ORDER BY r.created_at DESC
    `;
    
    const [rows] = await db.query(query, [id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des demandes reçues." });
  }
});



app.put("/api/reclamations/:idReclamation/repondre", verifyToken, async (req, res) => {
  try {
    const { idReclamation } = req.params;
    const { action } = req.body; // "acceptee" ou "refusee"

    if (!["acceptee", "refusee"].includes(action)) {
      return res.status(400).json({ error: "Action non valide." });
    }

    let statutFinal = "";
    let messageFront = "";

    if (action === "refusee") {
      statutFinal = "refusee";
      messageFront = "L'invitation à la permutation a été refusée avec succès.";
    } else if (action === "acceptee") {
      statutFinal = "accord_binome";
      messageFront = "Accord enregistré. En attente de validation définitive par l'administration.";
    }

    const queryUpdate = `
      UPDATE reclamations 
      SET statut = ? 
      WHERE Id_Reclamation = ? AND type = 'echange_etablissement'
    `;
    const [updateResult] = await db.query(queryUpdate, [statutFinal, idReclamation]);

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: "Réclamation introuvable ou type incorrect." });
    }

    // 3. RECUPERATION DES EMAILS, NOMS ET ETABLISSEMENTS
    try {
      // AJOUT : Jointures avec la table etablissements (NomEtab) pour le départ et la cible
      const queryInfos = `
        SELECT 
          r.objet,
          stA.Email AS EmailDemandeur, 
          stA.NomStag AS NomDemandeur, 
          stA.PrenomStag AS PrenomDemandeur,
          stB.NomStag AS NomBinome, 
          stB.PrenomStag AS PrenomBinome,
          etabDep.NomEtab AS EtablissementDepart,
          etabCib.NomEtab AS EtablissementCible
        FROM reclamations r
        JOIN stagiaires stA ON r.Id_Stagiaire = stA.Id_Stagiaire
        JOIN stagiaires stB ON r.stagiaire_cible_id = stB.Id_Stagiaire
        LEFT JOIN etablissements etabDep ON r.id_etablissement_depart = etabDep.Id_Etablissement
        LEFT JOIN etablissements etabCib ON r.id_etablissement_cible = etabCib.Id_Etablissement
        WHERE r.Id_Reclamation = ?
      `;
      const [infos] = await db.query(queryInfos, [idReclamation]);

      if (infos && infos.length > 0) {
        const data = infos[0];
        const nomCompletDemandeur = `${data.PrenomDemandeur} ${data.NomDemandeur}`;
        const nomCompletBinome = `${data.PrenomBinome} ${data.NomBinome}`;
        
        // Sécurité si le nom de l'établissement n'est pas trouvé
        const etablissementA = data.EtablissementDepart || "Non spécifié";
        const etablissementB = data.EtablissementCible || "Non spécifié";

        // --- CAS 1 : LE BINÔME A REFUSÉ ---
        if (action === "refusee") {
          await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: data.EmailDemandeur,
            subject: "CRMEF - Votre demande de permutation a été refusée",
            text: 
              `Bonjour ${nomCompletDemandeur},\n\n` +
              `Nous vous informons que ${nomCompletBinome} a refusé votre proposition d'échange réciproque d'établissement (Objet : ${data.objet}).\n\n` +
              `Votre dossier de permutation est par conséquent clôturé.\n\n` +
              `Cordialement,\nL'équipe de gestion des stages CRMEF.`
          });
        }

        // --- CAS 2 : LE BINÔME A ACCEPTÉ ---
        else if (action === "acceptee") {
          // Mail 1 : Au demandeur initial (Stagiaire A)
          await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: data.EmailDemandeur,
            subject: "CRMEF - Accord de permutation obtenu (En attente Admin)",
            text: 
              `Bonjour ${nomCompletDemandeur},\n\n` +
              `Bonne nouvelle ! Le stagiaire ${nomCompletBinome} a accepté votre proposition d'échange réciproque d'établissement (Objet : ${data.objet}).\n\n` +
              `Le dossier est désormais complet et a été transmis automatiquement sur le bureau de l'administration.\n\n` +
              `Cordialement,\nL'équipe de gestion des stages CRMEF.`
          });

          // Mail 2 : À l'administrateur (MIS À JOUR AVEC LES ÉTABLISSEMENTS)
          await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: process.env.ADMIN_MAIL || "admin_crmef@votre-domaine.ma",
            subject: "CRMEF - Nouveau dossier de permutation complet à traiter",
            text: 
              `Bonjour l'Administration,\n\n` +
              `Un dossier de permutation réciproque vient d'obtenir l'accord des deux parties et requiert votre arbitrage final.\n\n` +
              `Détails de l'échange proposé :\n` +
              `--------------------------------------------------\n` +
              `• Stagiaire 1 (Demandeur) : ${nomCompletDemandeur}\n` +
              `  ➔ Établissement actuel : ${etablissementA}\n\n` +
              `• Stagiaire 2 (Binôme) : ${nomCompletBinome}\n` +
              `  ➔ Établissement actuel : ${etablissementB}\n` +
              `--------------------------------------------------\n` +
              `• Objet de la demande : ${data.objet}\n\n` +
              `Le dossier est actuellement disponible sous le statut "Accord Binôme" dans votre espace de gestion pour validation définitive des nouvelles affectations.\n\n` +
              `Lien du tableau de bord Admin : http://localhost:5173/admin/reclamations\n\n` +
              `Système de gestion automatique CRMEF.`
          });
        }
      }
    } catch (mailErr) {
      console.error("Erreur lors de l'envoi des e-mails de réponse :", mailErr);
    }

    return res.json({ message: messageFront });

  } catch (err) {
    console.error("Erreur lors de la réponse à la réclamation :", err);
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});


app.get("/api/admin/etablissements", async (req, res) => {
  try {
    // Récupère les colonnes clés utilisées dans ton composant React
    const [etabs] = await db.execute(
      "SELECT Id_Etablissement, NomEtab, Ville FROM etablissements ORDER BY NomEtab ASC"
    );
    return res.status(200).json(etabs);
  } catch (error) {
    console.error("Erreur GET /etablissements :", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des structures." });
  }
});



// app.put("/api/admin/reclamations/:id/proposer", async (req, res) => {
//   const idReclamation = req.params.id;
//   const { Id_Etablissement } = req.body; // Récupère l'ID envoyé par React

//   if (!Id_Etablissement) {
//     return res.status(400).json({ message: "L'identifiant de l'établissement est requis." });
//   }

//   try {
//     // Met à jour la réclamation : affecte la structure cible et passe le statut à "attente_etablissement"
//     const [result] = await db.execute(
//       `UPDATE reclamations 
//        SET Id_Etablissement_Cible = ?, statut = 'attente_etablissement' 
//        WHERE Id_Reclamation = ?`,
//       [Id_Etablissement, idReclamation]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Réclamation introuvable." });
//     }

//     return res.status(200).json({ 
//       message: "Proposition enregistrée. Dossier transmis à l'établissement avec succès." 
//     });
//   } catch (error) {
//     console.error("Erreur PUT /reclamations/:id/proposer :", error);
//     return res.status(500).json({ message: "Erreur serveur lors de la soumission du dossier." });
//   }
// });

app.put("/api/admin/reclamations/:id/proposer", async (req, res) => {
  const idReclamation = req.params.id;
  const { Id_Etablissement } = req.body; 

  if (!Id_Etablissement) {
    return res.status(400).json({ message: "L'identifiant de l'établissement est requis." });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. On force l'alias "id_stagiaire" en minuscules pour JS
    const [reclamationRows] = await connection.execute(
      `SELECT Id_Stagiaire AS id_stagiaire FROM reclamations WHERE Id_Reclamation = ?`,
      [idReclamation]
    );

    if (reclamationRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Réclamation introuvable." });
    }

    const idStagiaire = reclamationRows[0].id_stagiaire;
    
    // LOGGER DE SÉCURITÉ : Regarde ta console Node.js pour voir ce qui est écrit ici
    console.log(`[PROPOSER] Reclamation: ${idReclamation} -> Stagiaire trouvé: ${idStagiaire} -> Nouvel Etab: ${Id_Etablissement}`);

    if (!idStagiaire) {
      await connection.rollback();
      return res.status(400).json({ message: "Impossible de récupérer l'ID du stagiaire depuis la réclamation." });
    }

    // 2. Mise à jour de la réclamation
    await connection.execute(
      `UPDATE reclamations 
       SET Id_Etablissement_Cible = ?, statut = 'attente_etablissement' 
       WHERE Id_Reclamation = ?`,
      [Id_Etablissement, idReclamation]
    );

    // 3. Mise à jour du stagiaire (Vérifie bien que les colonnes s'appellent ainsi dans ta BD)
    const [stagiaireResult] = await connection.execute(
  `UPDATE stagiaires 
   SET is_active = 0,
       Id_Etablissement = ? 
   WHERE Id_Stagiaire = ?`,
  [Id_Etablissement, idStagiaire]
);

    console.log(`[PROPOSER] Nombre de lignes stagiaires modifiées: ${stagiaireResult.affectedRows}`);

    await connection.commit();

    return res.status(200).json({ 
      message: "Proposition enregistrée. Établissement du stagiaire mis à jour et dossier transmis." 
    });

  } catch (error) {
    await connection.rollback();
    console.error("Erreur PUT /reclamations/:id/proposer :", error);
    return res.status(500).json({ message: "Erreur serveur lors de la soumission du dossier." });
  } finally {
    connection.release();
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
