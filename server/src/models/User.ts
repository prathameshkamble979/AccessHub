import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  profilePicture?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined and uniqueness
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      // Not required because users might register via Google/Firebase
    },
    profilePicture: {
      type: String,
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', UserSchema);
