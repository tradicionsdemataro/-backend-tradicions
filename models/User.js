// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    descripcion: {
      type: String,
      default: "",
      maxlength: 300,
    },

    avatar: {
    type: String,
    default: "http://localhost:3000/images/default.jpg",
  },

    banner: {
      type: String,
      default:
        "http://localhost:3000/images/default-banner.jpg",
    },

    telefono: {
      type: String,
      default: "",
    },

    ubicacion: {
      type: String,
      default: "",
    },

    fechaNacimiento: {
      type: Date,
      default: null,
    },

    rol: {
      type: String,
      enum: ["usuario", "admin"],
      default: "usuario",
    },

    verificado: {
      type: Boolean,
      default: false,
    },

    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);