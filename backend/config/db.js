import mongoose from 'mongoose';

const conectarDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default conectarDB;