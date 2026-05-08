import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mood-detector';
  await mongoose.connect(uri);
  console.log(`✅ MongoDB: ${mongoose.connection.host}`);
};

export default connectDB;