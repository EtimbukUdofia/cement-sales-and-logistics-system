import mongoose from "mongoose";
const { Schema } = mongoose;

interface User { 
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'salesPerson';
  shopId?: mongoose.Types.ObjectId;
}

const userSchema = new Schema<User>({
  username: {
    type: String, required: true, unique: true
  },
  email: {
    type: String, required: true, unique: true
  },
  password: {
    type: String, required: true
  },
  role: {
    type: String, enum: ['admin', 'salesPerson'], default: 'admin', required: true
  },
  shopId: { type: Schema.Types.ObjectId, ref: 'Shop' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;