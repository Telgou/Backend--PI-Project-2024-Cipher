import mongoose from 'mongoose';
import Group from "../models/Group.js";
import {User} from "../models/User.js";

/* CREATE */
export const createGroup = async (req, res) => {
  try {
    const {groupId, groupAdminId, groupName,description,members} = req.body;
    const numMembers = members.length;
    const users = await User.find({_id: {$in: members.map(member => member.userId)}});
    const formattedMembers = users.map(user => ({ userId: user._id, firstName: user.firstName, lastName: user.lastName, }));
    if (!users) {
      return res.status(404).json({ message: "User not found" });
    }
    const newGroup = new Group({
      _id: new mongoose.Types.ObjectId(),
      groupId,
      groupAdminId,
      groupName,
      NumMumber: numMembers,
      description,
      members: formattedMembers,
    });
    await newGroup.save();

    const group = await Group.find();
    res.status(201).json(group);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getGroupsByUserId = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const groups = await Group.find({ "members.userId": userId });

    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getGroups = async (req, res) => {
  try {
    const group = await Group.find();
    res.status(200).json(group);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getGroupsID = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.find({ groupId });
    res.status(200).json(group);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const { groupName, description, members } = req.body;

  try {
    const numMembers = members.length;
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { groupName,NumMumber: numMembers, description, members },
      { new: true } // Return the modified document
    );

    if (!updatedGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* DELETE */
export const deleteGroup = async (req, res) => {
    const { groupId } = req.params;

    try {
      const deletedGroup = await Group.findByIdAndRemove(groupId);

      if (!deletedGroup) {
        return res.status(404).json({ message: 'Group not found' });
      }

      const groups = await Group.find();
      res.status(200).json(groups);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};
