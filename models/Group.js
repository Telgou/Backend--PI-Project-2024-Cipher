import mongoose from "mongoose";
import autoIncrement from "mongoose-auto-increment";
import {User} from "./User.js";

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

// Initialize auto-increment
autoIncrement.initialize(mongoose.connection);

// Apply auto-increment plugin to groupId and groupAdminId fields
groupSchema.plugin(autoIncrement.plugin, {
  model: "Group",
  field: "groupId",
  startAt: 1, // Start incrementing at 1
});
groupSchema.plugin(autoIncrement.plugin, {
  model: "Group",
  field: "groupAdminId",
  startAt: 1, // Start incrementing at 1
});

const Group = mongoose.model("Group", groupSchema);

export default Group;
