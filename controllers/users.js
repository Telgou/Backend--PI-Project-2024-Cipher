import Post from "../models/Post.js";
import Skill from "../models/Skills.js";
import { User } from "../models/User.js";

/* READ */
export const getUsers = async (req, res) => {
    try {
        const user = await User.find();
        res.status(200).json(user);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};
/*
export const getLessPrivUsers = async (req, res) => {
    try {
        const requester = ;
        const user = await User.find();
        res.status(200).json(user);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};
*/
export const getLessPrivUsers = async (req, res) => {
    try {
        const requesterRole = req.user.role;
        let users;
        let lesserRoles = [];
        switch (requesterRole) {
            case 'admin':
                lesserRoles = ['depHead', 'coordinator', 'prof'];
                break;
            case 'depHead':
                lesserRoles = ['coordinator', 'prof'];
                break;
            case 'coordinator':
                lesserRoles = ['prof'];
                break;
            default:
                lesserRoles = [];
                break;
        }

        users = await User.find({ role: { $in: lesserRoles } });
        res.status(200).json(users);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        user.password = null;
        res.status(200).json(user);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

export const getUserFriends = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        );
        const formattedFriends = friends.map(
            ({ _id, firstName, lastName, occupation, location, picturePath }) => {
                return { _id, firstName, lastName, occupation, location, picturePath };
            }
        );
        res.status(200).json(formattedFriends);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

export const getSkills = async (req, res) => {
    try {
        const skills = await Skill.find();
        //console.log(skills)
        res.status(200).json(skills);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

export const getusersbyskill = async (req, res) => {
    try {
        const { skill } = req.body;
        console.log(req.body)
        const users = await User.aggregate([
            {
                $match: {
                    $or: [
                        { [`score.${skill}`]: { $exists: true } },
                        { [`initialscore.${skill}`]: { $exists: true } }
                    ]
                }
            },
            {
                $addFields: {
                    totalScore: { $sum: ["$score." + skill, "$initialscore." + skill] }
                }
            },
            {
                $sort: { totalScore: -1 }
            }
        ]);
        console.log(users)
        res.status(200).json(users);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

/* UPDATE */
export const updateUser = async (req, res) => {
    try {
        const { firstName, lastName, picturePath, occupation, location, github, linkedin, twitter } = req.body;

        const params = req.params;
        console.log(params)
        const user = await User.findById({ _id: params.id });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (picturePath) user.picturePath = picturePath;
        if (occupation) user.occupation = occupation;
        if (location) user.location = location;
        if (github != user.github && github != undefined) {
            user.github = github;
            await user.calculateLanguageScores();
        }
        if (linkedin != user.linkedin && linkedin != undefined) { user.linkedin = linkedin; }
        if (twitter != user.twitter && twitter != undefined) { user.twitter = twitter; }

        //console.log(user)
        await user.save();

        // Update old posts of the user
        /*
        const oldposts = await Post.find({ userId: user._id });
        oldposts.forEach(async (post) => {
            post.userPicturePath = user.picturePath;
            post.firstName= user.firstName;
            post.lastName= user.lastName;
            post.location= user.location;
            await post.save();
        })*/
        if (picturePath || firstName || lastName || location) {
            const updatedUserData = {
                firstName: user.firstName,
                lastName: user.lastName,
                location: user.location,
                occupation: user.occupation,
                picturePath: user.picturePath,
            };

            await Post.updateUserDataInPosts(user._id, updatedUserData);
        }

        user.password = null;
        console.log(user)
        res.status(200).json({ message: 'User information updated successfully', user: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
};

export const addRemoveFriend = async (req, res) => {
    try {
        const { id, friendId } = req.params;
        const user = await User.findById(id);
        const friend = await User.findById(friendId);

        console.log(friendId, "your id : ", id, "new friendid : ", " you are sameornot", friendId === id)
        if (user.friends.includes(friendId)) {
            user.friends = user.friends.filter((id) => id !== friendId);
            friend.friends = friend.friends.filter((id) => id !== id);
        } else {
            if (friendId !== id) {
                user.friends.push(friendId);
                friend.friends.push(id);
            }
        }
        await user.save();
        await friend.save();

        const friends = await Promise.all(
            user.friends.map((id) => User.findById(id))
        );
        const formattedFriends = friends.map(
            ({ _id, firstName, lastName, occupation, location, picturePath }) => {
                return { _id, firstName, lastName, occupation, location, picturePath };
            }
        );

        res.status(200).json(formattedFriends);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

export const setAvatar = async (req, res, next) => {
    try {
      const userId = req.userId;
      const avatarImage = req.body.image;
      const userData = await User.findByIdAndUpdate(
        userId,
        {
          isAvatarImageSet: true,
          avatarImage,
        },
        { new: true }
      );
      console.log('User Data', userData);
      if (!userData) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({
        isSet: userData.isAvatarImageSet,
        image: userData.avatarImage,
      });
    } catch (error) {
        console.error('Error setting avatar:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
  };
