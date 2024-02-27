import mongoose from "mongoose";

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
    groupNumber: {
      type: Number,
      required: true,
    },
    /*location: String,
    description: String,
    picturePath: String,
    userPicturePath: String,*/
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;
