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

app.post("/api/addetablisement", async (req, res) => {
  const { NomEtab, Ville, Location, Email, Password } = req.body;
  if (!NomEtab || !Email || !Password || !Ville)
    return res.status(400).json({
      success: false,
      message: "Nom, ville, email et mot de passe sont obligatoires.",
    });

  try {
    // Check duplicate email
    const [existing] = await db.query(
      "SELECT Id_Etablissement FROM etablissements WHERE Email = ?",
      [Email],
    );
    if (existing.length > 0)
      return res
        .status(409)
        .json({ success: false, message: "Cet email est déjà utilisé." });

    const hashedPassword = await bcrypt.hash(Password, 10);

    const [result] = await db.query(
      `INSERT INTO etablissements (NomEtab, Ville, Location, Email, Password, role, is_active)
       VALUES (?, ?, ?, ?, ?, 'etablissement', 0)`,
      [NomEtab, Ville, Location || null, Email, hashedPassword],
    );
    transporter.sendMail({
      from: process.env.MAIL_USER,
      to: Email, // ← mets ton email ici
      subject: "Bienvenue au CRMEF",
      text:
        "Bienvenue dans le système de suivi des stages du CRMEF ! Votre compte a été créé avec succès. Voici vos identifiants de connexion :\n\n" +
        Email +
        " / " +
        Password +
        "\n\nMerci de vous connecter et de compléter votre profil.lien vers platform : http://localhost:5173/signin",
    });

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

// GET établissements (pour le select)
app.get("/api/getalletablissements", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT Id_Etablissement, NomEtab FROM etablissements WHERE is_active = 1",
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// GET superviseurs (pour le select)
app.get("/api/getallsuperviseurs", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT Id_Superviseur, NomSup, PrenomSup FROM superviseurs_crmef",
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
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
      `INSERT INTO stagiaires (NomStag, PrenomStag, Filiere, Email, Password, Id_Etablissement, Id_Superviseur)
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
      "INSERT INTO superviseurs_crmef (NomSup, PrenomSup, Email, Password) VALUES (?, ?, ?, ?)",
      [NomSup, PrenomSup, Email, Password],
    );
    res.json({ success: true, id: result.insertId });
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
        totalSuperviseurs: sup.total,
        activeSuperviseurs: sup.actifs,
        totalReclamations: recl.total,
        reclEnAttente: reclAtt.total,
      },
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


app.post("/api/rapports", async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id; // depuis JWT

  await db.query(
    "INSERT INTO rapports (Id_Stagiaire, content) VALUES (?, ?)",
    [userId, content]
  );

  res.json({ success: true });
});

app.get("/api/rapports/my", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token manquant" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id;

    const [rows] = await db.query(
      "SELECT * FROM rapports WHERE Id_Stagiaire = ? ORDER BY created_at DESC",
      [userId]
    );
    console.log("Rapports récupérés pour l'utilisateur", userId, ":", rows);
    res.json({ data: rows });

  } catch (err) {
    res.status(401).json({
      message: "Token invalide",
      error: err.message,
    });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
