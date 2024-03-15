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
    /*role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true
    },*/

    /*role: {
      type: String,

      enum: ['admin', 'prof', 'coordinator', 'dephead'],

      default: 'prof',
    },*/
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

// Roles Schemas
const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  //permissions: [permissionSchema]
});
const Role = mongoose.model("Role", roleSchema);

// Permissions Schema
const permissionSchema = new mongoose.Schema({
  action: { type: String, required: true },
  resource: { type: String, required: true },
  //attributes: { type: Object } // For attribute-based conditions
});
export { User, Role, Coordinator, DepHead, Admin }; 
