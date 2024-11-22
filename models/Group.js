import mongoose from "mongoose";
import {User} from "./User.js";
import mongooseSequence from 'mongoose-sequence';
const AutoIncrement = mongooseSequence(mongoose);

const groupSchema = mongoose.Schema(
  {
    groupId: {
      type: Number,
      unique: true,
    },
    groupAdminId: {
        type: Number,
        unique: true,
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

// Apply auto-increment plugin to groupId field
groupSchema.plugin(AutoIncrement, { inc_field: 'groupId', start_seq: 1 });

// Apply auto-increment plugin to groupAdminId field
groupSchema.plugin(AutoIncrement, { inc_field: 'groupAdminId', start_seq: 1 });

const Group = mongoose.model("Group", groupSchema);

export default Group;
