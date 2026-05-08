import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  // Tracking scan harian — TIDAK terpengaruh delete history
  dailyScanDate:  string; // format 'YYYY-MM-DD'
  dailyScanCount: number;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>({
  name:     { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  // Default kosong — akan diisi saat pertama scan
  dailyScanDate:  { type: String, default: '' },
  dailyScanCount: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUserDocument>('User', UserSchema);