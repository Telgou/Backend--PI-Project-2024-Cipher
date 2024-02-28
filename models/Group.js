import mongoose from "mongoose";
import User from "./User.js";

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
        memberId: {
          type: String,
          required: true,
        },
        memberName: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;
