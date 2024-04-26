import mongoose from "mongoose";
import fetch from "node-fetch";
import Skill from "./Skills.js";

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
    role: { type: String, default: 'prof' },
    score: {
      type: Map,
      of: Number
    },
    initialscore: {
      type: Map,
      of: Number
    },
    github: String,
    linkedin: String,
    twitter: String,
    location: String,
    viewedProfile: Number,
    impressions: Number,
  },
  { timestamps: true, discriminatorKey: 'role' }
);

UserSchema.methods.calculateLanguageScores = async function () {
  try {

    const username = this.github;
    const token = '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';
    const headers = { 'Authorization': `Bearer ${token}` };
    // Getting repositories
    const repos_url = `https://api.github.com/users/${username}/repos`;
    const repos_response = await fetch(repos_url, { headers });

    if (!repos_response.ok) {
      throw new Error(`GitHub API error (repos): ${repos_response.status}`);
    }

    const repos_data = await repos_response.json();
    console.log(repos_data)

    const user_scores = new Map();
    for (const repo of repos_data) {
      const languages_url = `https://api.github.com/repos/${username}/${repo.name}/languages`;
      const languages_response = await fetch(languages_url, { headers });

      if (!languages_response.ok) {
        throw new Error(`GitHub API error (languages): ${languages_response.status}`);
      }

      const languages = await languages_response.json();
      //console.log("Languages:", languages);

      for (const language in languages) {
        if (!user_scores.has(language)) {
          user_scores.set(language, 15);
        } else {
          user_scores.set(language, user_scores.get(language, 0) + 15);
        }

        let skill = await Skill.findOne({ name: language });
        if (!skill) {
          skill = new Skill({ name: language });
          await skill.save();
        }

      }
    }
    //console.log(user_scores)
    this.initialscore = user_scores;
    console.log(this.initialscore)
    this.markModified('initialscore');
    await this.save();

    console.log(this.initialscore);
  } catch (error) {
    console.error("Error calculating language scores:", error);
  }
};

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
