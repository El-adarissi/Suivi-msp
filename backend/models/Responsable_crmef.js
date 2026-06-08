const mongoose = require("mongoose");

const responsableSchema = new mongoose.Schema(
  {
    responsable_id: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Responsable_crmef",
  responsableSchema
);