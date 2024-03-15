import mongoose from "mongoose";
import {User} from "./User.js";

const groupSchema = mongoose.Schema(
  {
    groupId: {
      type: String,
      required: true,
    },
    groupAdminId: {
        type: String,
        required: true,
      },
    groupName: {
      type: String,
      required: true,
    },
    NumMumber: {
      type: Number,
      required: true,
    },
    description: String,
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        firstName: {
          type: String,
        },
        lastName: {
          type: String,
        },
        /*role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },*/
      },
    ],
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;
