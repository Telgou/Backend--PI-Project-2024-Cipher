//import { memcached } from "../index.js";
import Post from "../models/Post.js";
import { User } from "../models/User.js";
//import Memcached from 'memcached-promisify';

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const { description, picturePath } = req.body;
    const user = await User.findById(req.user.id);
    //console.log(req.user.id===userId, req.user.id, userId)

    {
      const newPost = new Post({
        userId: req.user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        location: user.location,
        description,
        userPicturePath: user.picturePath,
        picturePath,
        likes: {},
        comments: [],
      });
      await newPost.save();

      const post = await Post.find();
      res.status(201).json(post);
    }
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find().sort({ createdAt: -1 });;
    res.status(200).json(post);
  } catch (err) {
    //res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { postId, text } = req.body;
    const userId = req.user.id;
    const user = await User.findById(req.user.id);

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json("Post not found");

    const newComment = {
      userId,
      username: user.firstName + user.lastName,
      userpic: user.picturePath,
      text,
      createdAt: Date.now()
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({ message: "Comment added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE */
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Ensure the current user is the owner of the post
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//// mem
/*
export const getFeedPosts = async (req, res) => {
  try {
    const cachedPosts = await fetchDataFromCache('feedPosts');
    if (cachedPosts) {
      return res.status(200).json(cachedPosts);
    }

    const posts = await Post.find().sort({ createdAt: -1 });
    await setInCache('feedPosts', posts);

    res.status(200).json(posts);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Internal server error' });
  }
};


async function fetchDataFromCache(key) {
  try {
    const data = await memcached.get(key);
    return data;
  } catch (error) {
    throw new Error(`Error fetching data from cache: ${error}`);
  }
}
*/