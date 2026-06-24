import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI no definida en .env");
}

export const connectDB = async () => {
  try {
    await mongoose.connect(uri);

    console.log("🍃 MongoDB Atlas conectado");
  } catch (error) {
    console.error("❌ Error MongoDB:", error);
    process.exit(1);
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log("🔒 MongoDB desconectado");
  } catch (error) {
    console.error("❌ Error cerrando MongoDB:", error);
  }
};