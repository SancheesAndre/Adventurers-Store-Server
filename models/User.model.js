import mongoose from 'mongoose';
const { Schema, model } = mongoose

const UserSchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  profilePicture: { type: String, required: true, default: "https://res.cloudinary.com/sanxcloud/image/upload/v1660753513/profilePictures/vmxxj05vzm1djxggcmge.png" },
  role: { type: String, enum: ["ADMIN", "USER"], required: true, default: "USER" },
  healthPoints: { type: Number, required: true, default: 100 },
  staminaPoints: { type: Number, required: true, default: 100 },
  experiencePoints: { type: Number, required: true, default: 0 },
  userMoney: { type: Number, required: true, default: 100 },

});

const User = model("User", UserSchema);

export default User
