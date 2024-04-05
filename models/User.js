import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      match: /^[a-zA-Z]+$/,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      match: /^[a-zA-Z]+$/,
    },
    email: {
      type: String,
      required: true,
      maxlength: 50,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
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
    role :{ type : String, default : 'prof'},
    score: {
      type: Map,
      of: Number
    },
    location: String,
    viewedProfile: Number,
    impressions: Number,
  },
  { timestamps: true, discriminatorKey: 'role' }
);
const User = mongoose.model("User", UserSchema);

// Roles
const Coordinator = User.discriminator('coordinator', new mongoose.Schema({
  UP: String
}));

const DepHead = User.discriminator('depHead', new mongoose.Schema({
  department: String
}));

const Admin = User.discriminator('admin', new mongoose.Schema({
  //adminPrivileges: [String]
}));

export { User, Coordinator, DepHead, Admin }; 
