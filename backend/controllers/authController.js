const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");


exports.register = async (req, res) => {

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
        [Email, hashedPassword, role]
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
};
