import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  identifier: string; // email or phone
  otp: string; // hashed OTP
  createdAt: Date;
}

const OtpSchema: Schema = new Schema({
  identifier: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Document will automatically be deleted after 5 minutes (300 seconds)
  },
});

export default mongoose.model<IOtp>('Otp', OtpSchema);
