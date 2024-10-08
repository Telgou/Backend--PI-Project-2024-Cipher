import mongoose, { Schema } from "mongoose";

const postSchema = mongoose.Schema(
  {
    userId: {
      type: String,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    location: String,
    description: {
      type: String,
      minlength: 1
    },
    picturePath: String,
    userPicturePath: String,
    likes: {
      type: Map,
      of: Boolean,
    },
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        username: String,
        userpic: String,
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

// Function we use to update userPicturePath in all posts when a user updates their profile picture
postSchema.statics.updateUserDataInPosts = async function (userId, updatedUserData) {
  try {
    await this.updateMany({ userId }, {
      firstName: updatedUserData.firstName,
      lastName: updatedUserData.lastName,
      location: updatedUserData.location,
      userPicturePath: updatedUserData.picturePath,
    });

    await this.updateMany(
      { userId },
      { $set: { "comments.$[elem].username": `${updatedUserData.firstName}  ${updatedUserData.lastName}`, "comments.$[elem].userpic": updatedUserData.picturePath } },
      { arrayFilters: [{ "elem.userId": userId }] }
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

const Post = mongoose.model("Post", postSchema);

export default Post;
