import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    picturePath: {
      type: String,
      default: "",
    },
    friends: {
      type: Array,
      default: [],
    },
    occupation: String,
    role: {
      type: String,

      enum: ['admin', 'prof', 'coordinator', 'dephead'],

      default: 'prof',
    },
    score: {
      type: Map,
      of: Number
    },
    location: String,
    viewedProfile: Number,
    impressions: Number,

  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;

const Admin = User.discriminator('admin', new mongoose.Schema({
  // Add any admin-specific fields here, e.g.,
  adminPrivileges: [String]
}));

const Coordinator = User.discriminator('coordinator', new mongoose.Schema({
  // Add coordinator-specific fields here, e.g.,
  department: String
}));

const DepHead = User.discriminator('depHead', new mongoose.Schema({
  // Add department head-specific fields here, e.g.,   
  faculty: String
}));
