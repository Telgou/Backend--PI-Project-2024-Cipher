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
    isAvatarImageSet: {
      type: Boolean,
      default: true,
    },
    avatarImage: {
      type: String,
      default: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMzEgMjMxIj48cGF0aCBkPSJNMzMuODMsMzMuODNhMTE1LjUsMTE1LjUsMCwxLDEsMCwxNjMuMzQsMTE1LjQ5LDExNS40OSwwLDAsMSwwLTE2My4zNFoiIHN0eWxlPSJmaWxsOiNmZjFlYzE7Ii8+PHBhdGggZD0ibTExNS41IDUxLjc1YTYzLjc1IDYzLjc1IDAgMCAwLTEwLjUgMTI2LjYzdjE0LjA5YTExNS41IDExNS41IDAgMCAwLTUzLjcyOSAxOS4wMjcgMTE1LjUgMTE1LjUgMCAwIDAgMTI4LjQ2IDAgMTE1LjUgMTE1LjUgMCAwIDAtNTMuNzI5LTE5LjAyOXYtMTQuMDg0YTYzLjc1IDYzLjc1IDAgMCAwIDUzLjI1LTYyLjg4MSA2My43NSA2My43NSAwIDAgMC02My42NS02My43NSA2My43NSA2My43NSAwIDAgMC0wLjA5OTYxIDB6IiBzdHlsZT0iZmlsbDojNzU1MjI3OyIvPjxwYXRoIGQ9Ik02MS4xMSwyMDUuNTlsMy40OSwzLjY5LTYuMjYsNi42QTExNS40NSwxMTUuNDUsMCwwLDAsNzIsMjIyLjUxdi0yMmExMTUuMTksMTE1LjE5LDAsMCwwLTEwLjg1LDUuMVoiIHN0eWxlPSJmaWxsOiNlZmVkZWU7Ii8+PHBhdGggZD0iTTkzLjI0LDIyOC44NVYxOTlsLTQtNEExMTQuNDMsMTE0LjQzLDAsMCwwLDcyLDIwMC40OXYyMmExMTQuNDMsMTE0LjQzLDAsMCwwLDIxLjI4LDYuMzRaIiBzdHlsZT0iZmlsbDojMDBhMWUwOyIvPjxwYXRoIGQ9Im0xNTkgMjIyLjUxdi0yMmExMTQuNjMgMTE0LjYzIDAgMCAwLTE3LjI1LTUuNTFsLTQgNHYyOS44NmExMTQuMTYgMTE0LjE2IDAgMCAwIDIxLjI1LTYuMzV6IiBzdHlsZT0iZmlsbDojMDBhMWUwOyIvPjxwYXRoIGQ9Im0xNjkuODkgMjA1LjU5LTMuNDkgMy42OSA2LjI2IDYuNmExMTUuNDUgMTE1LjQ1IDAgMCAxLTEzLjY2IDYuNjN2LTIyYTExNS4xOSAxMTUuMTkgMCAwIDEgMTAuODUgNS4xeiIgc3R5bGU9ImZpbGw6I2VmZWRlZTsiLz48cGF0aCBkPSJNMTE1LjUsMjE5LjYyQTI4LjUsMjguNSwwLDAsMSw4Ny4yNSwxOTVjMi45My0uNzQsNS45Mi0xLjM2LDguOTQtMS44N2ExOS40MSwxOS40MSwwLDAsMCwzOC42MiwwYzMsLjUxLDYsMS4xMyw4Ljk0LDEuODdhMjguNDksMjguNDksMCwwLDEtMjguMjUsMjQuNjNaIiBzdHlsZT0iZmlsbDojZmZjZTFjOyIvPjxwYXRoIGQ9Im00My44OTEgNzcuODM2Yy01LjExMjQgMjguMjM3IDIuMTM0NyA2MS4wMDQgMjQuNzkyIDgxLjMzMi02LjIzNjItMTIuNTAzLTkuNTM2Mi0zMy45NDgtOS40ODg3LTQ1LjQ1OC0wLjUwMjAzLTM3LjQ3MyA0MS40MzktNDYuMzM1IDU2LjE0OS0xNy42MTQgMTguOC0zMS4yIDUyLjgyNS0xNi44NzIgNTQuMDYyIDEzLjcxNCAwLjU2MDE4IDEzLjg0NC0wLjQzNTY4IDI1LjU5OC03LjA5NjIgNDguOTY2IDE4LjM3Mi0xMi40NyAyOC4wMTItNTMuOTU5IDIzLjU0NS04MC45NDEtNDcuNDg2LTIuMjU1Mi05NC44MzEtMi41NzI0LTE0MS45NiAweiIgc3R5bGU9ImZpbGw6I0ZGQzYwMDsiLz48cGF0aCBkPSJtMTExLjI2IDEyLjc4MmMtMTguNTA4IDAuMDc5MS0zMi41OTQgMy42MTYzLTMyLjU5NCAzLjYxNjMgMjQuNTEzIDUuNjAwMiAzMi44MDcgMTAuNTA0IDMxLjc0MyAxOS44MzUtMC44NzIyNyA5LjcwMi0xMS4wOTIgMTAuODc1LTIwLjgxMSAxMS41NTQtNS4yNTQ4IDAuMzY0MTQtMTAuOTQ5IDAuNzE1MjMtMTYuMzkxIDEuNzUyNS0xMS44NjIgMi4yODE4LTE5Ljk0NiA0LjM3MzYtMjQuNDQ3IDExLjk1Ni0xLjcwMTIgMi44NjYyLTMuNzk0NSAxMC40MjgtNC44Njg5IDE2LjM0aDE0MS45NmMtNS43MjQyLTM4LjU2My0zMi41NTctNjUuMDczLTc0LjU5NS02NS4wNTR6IiBzdHlsZT0iZmlsbDpub25lOyIvPjxwYXRoIGQ9Im03My4yOTIgNDQuNzdjLTExLjc4OCAyLjI4MTYtMTguOTIzIDUuNTQ0NC0yMy4zOTQgMTMuMTI2LTIuODQ4NCA2Ljc1ODYtNC44NDU0IDEzLjIzOC02LjAwNzIgMTkuOTM5aDE0MS45NmMtMS45NzcyLTE0LjU3Ni02Ljg2NzctMjguMjQ4LTE5LjI3Ny0zMi4wOTgtMjguODM0LTYuMzMwOC02My43NzQtNi4zNTUzLTkzLjI4NS0wLjk2NzYxeiIgc3R5bGU9ImZpbGw6I0ZGQzYwMDsiLz48cGF0aCBkPSJtMTY1Ljk1IDM1LjY0MmMtMTEuMTc4IDIxLjgyOS05MS44OSAxOS4zNi0xMDMuOTggMi4zMDExLTkuNzAzIDEyLjI2Ny0xNS42MDUgMjUuODgzLTE4LjA3OSAzOS44OTJoMTQxLjk2Yy0zLjAwOTYtMTcuMTU4LTkuNzQyNC0zMi42ODgtMTkuOTAyLTQyLjE5M3oiIHN0eWxlPSJmaWxsOm5vbmU7Ii8+PHBhdGggZD0ibTE0NS4zOSAxMDQuNy0xMS41MiAxMS4yaDE3LjI2bS02NS41Mi0xMS4yIDExLjUyIDExLjJoLTE3LjI2IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6NS40OTk4cHg7c3Ryb2tlOiMwMDA7Ii8+PHBhdGggZD0ibTEyNi4yOCAxNDkuODJjLTYuMTYgMi40My0xNS41MiAyLjQyLTIxLjU2IDAiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDo1Ljk5OThweDtzdHJva2U6IzAwMDsiLz48L3N2Zz4=",
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
    userAgent: String,
    lastip: String,
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
