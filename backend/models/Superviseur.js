const mongoose = require("mongoose");

const SuperviseurSchema = new mongoose.Schema(
  {
    NomSup: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
    },
    PrenomSup: {
      type: String,
      required: [true, 'Le prénom est obligatoire'],
      trim: true,
    },
    Email: {
      type: String,
      required: [true, "L'adresse email est obligatoire"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Veuillez fournir un email valide'],
    },
    Password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: 6, // Good security practice
    },
    // Relationship: The Responsable CRMEF who assigned this supervisor
    ResponsableCRMEF: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResponsableCRMEF',
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);


SuperviseurSchema.virtual('stagiaires', {
  ref: 'Stagiaire',
  localField: '_id',
  foreignField: 'Id_Superviseur', 
});

// Next.js specific check to prevent compiling the model multiple times during hot-reloads
const Superviseur = mongoose.models.Superviseur || mongoose.model('Superviseur', SuperviseurSchema);

module.exports = Superviseur;