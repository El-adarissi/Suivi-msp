const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: [
        "admin_crmef",
        "stagiaire",
        "supervisor",
        "admin_etablissement",
      ],
      default: "stagiaire",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);