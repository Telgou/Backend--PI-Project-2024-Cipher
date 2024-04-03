import mongoose from "mongoose";

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
    description: String,
    picturePath: String,
    userPicturePath: String,
    likes: {
      type: Map,
      of: Boolean,
    },
    comments: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

// Function we use to update userPicturePath in all posts when a user updates their profile picture
postSchema.statics.updateUserDataInPosts = async function(userId, updatedUserData) {
  try {
    await this.updateMany({ userId }, { 
      firstName: updatedUserData.firstName,
      lastName: updatedUserData.lastName,
      location: updatedUserData.location,
      userPicturePath: updatedUserData.picturePath,
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

const Post = mongoose.model("Post", postSchema);

export default Post;
