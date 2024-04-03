import bcrypt from "bcrypt";
import crypto from 'crypto';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Coordinator, User, DepHead } from "../models/User.js";
import { Department, PedagogicalUnit } from "../models/departments&UP.js";
import PreUser from "../models/preUser.js";
import ResetToken from "../models/passwordreset.js";

/* Pregister USER */
export const pregister = async (req, res) => {
  try {
    const { email, } = req.body;
    console.log(req.body)

    console.log(email)
    const newPreUser = new PreUser({ email });

    const savedPreUser = await newPreUser.save();
    const token = generateRandomToken(10);
    savedPreUser.token = token;
    await savedPreUser.save();

    // Send an email with the token to the user
    /*const mailOptions = {
      from: "gamgamitelgou@gmail.com",
      to: email,
      subject: "Registration Token",
      text: `Kindly continue to : http://localhost:3000/tok=${token} and complete the registration`,
    };
    await sendTokenEmail(email, token,mailOptions);*/
    console.log(token);

    res.status(201).json("pregistered correctly");
  } catch (err) {
    console.error("preRegister error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* PREREGISTRATION  Verifying */
export const getPreUsers = async (req, res) => {
  try {
    const user = await PreUser.find();
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const verifyuser = async (req, res) => {
  try {
    //const { email } = req.body;
    const { email, valid } = req.params;
    //console.log(valid)
    const preuser = await PreUser.findOne({ email: email });
    if (!preuser) return res.status(404).json({ msg: "No one has registered with this email.", verified: false });

    /*if (valid === false) preuser.valid = true;
    else preuser.valid = false;
    console.log(preuser)*/
    if (valid != preuser.valid.toString()) {
      //console.log(valid != preuser.valid, " ", valid, preuser.valid)
      return res.status(204).json({ verified: preuser.valid });
    }
    preuser.valid = !preuser.valid;
    await preuser.save();

    res.status(200).json({ verified: preuser.valid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePreUser = async (req, res) => {
  const { email } = req.params;
  try {
    const deletedPreUser = await PreUser.deleteOne({ email: email });

    if (!deletedPreUser.deletedCount) {
      return res.status(404).json({ message: 'PreUser not found' });
    }

    const preusers = await PreUser.find();
    res.status(200).json(preusers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      password,
      picturePath,
      friends,
      location,
      occupation,
      tok,
    } = req.body;
    //console.log('Request Body:', req.body);

    const preUser = await PreUser.findOne({ token: tok });
    if (!preUser) {
      return res.status(404).json({ error: "PreUser not found for the provided token" });
    }
    if (preUser.valid === false) {
      return res.status(403).json({ error: "You are still unverified" });
    }

    // Salting & Hashing
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email: preUser.email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: 0,
      impressions: 0,
    });


    //preUser.delete();
    const savedUser = await newUser.save();
    savedUser.password = null;
    res.status(201).json(savedUser);
  } catch (err) {
    //console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "User does not exist. " });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials. " });

    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    user.password = null;
    res.status(200).json({ token, user });

  } catch (err) {
    //console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Request privilege upgrade
/*
export const transferUser = async (req, res) => {
  const departments = await Department.find({}, { name: 1, _id: 0 });
  const departmentNames = departments.map(department => department.name);

  const UPs = await PedagogicalUnit.find({}, { name: 1, _id: 0 });
  const UPNames = UPs.map(up => up.name);

  const { userid, dep, UP } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userid).session(session);
    if (!user) {
      throw new Error('User not found');
    }
    let newP;
    // Department Transfer
    if (dep && departmentNames.includes(dep)) {
      const department = await Department.findOne({ name: dep });
      const oldHead = await DepHead.findById(department.depHead);
      //console.log(user._id,oldHead._id)
      //console.log(user._id.toString() !== oldHead._id.toString())
      if (oldHead && user._id.toString() !== oldHead._id.toString()) await demoteExistingHead(dep, session);
      newP = await promoteUserToHead(user, dep, session);
    }

    // UP Transfer
    if (UP && UPNames.includes(UP)) {
      const up = await UPs.findOne({ name: dep });
      const oldCoordinator = await UPs.findById(UPs.corrdinator);
      //console.log(user._id,oldHead._id)
      //console.log(user._id.toString() !== oldHead._id.toString())
      if (oldCoordinator && user._id.toString() !== oldCoordinator._id.toString()) await demoteExistingCoordinator(UP, session);
      const newP = await promoteUserToCoordinator(user, UP, session);
    }

    await session.commitTransaction();
    await user.save();
    res.status(200).json({ newP });

  } catch (error) {
    console.error("Error transferring user:", error);
    await session.abortTransaction(); // Rollback
    throw error; // re-throwing error UP the call stack
  } finally {
    session.endSession();
  }
}

async function demoteExistingHead(departmentName) {
  const department = await Department.findOne({ name: departmentName });
  if (department && department.depHead) {
    const oldHead = await User.findById(department.depHead);
    await DepHead.deleteOne({ email: oldHead.email });
    await new User({
      _id: oldHead._id,
      firstName: oldHead.firstName,
      lastName: oldHead.lastName,
      email: oldHead.email,
      password: oldHead.password,
      picturePath: oldHead.picturePath,
      friends: oldHead.friends,
      occupation: oldHead.occupation,
      location: oldHead.location,
      viewedProfile: oldHead.viewedProfile,
      impressions: oldHead.impressions,
      role: 'prof'
    }).save();
    department.depHead = null; // Clear depHead in department
    await department.save();
  }
}

async function promoteUserToHead(user, departmentName) {
  const department = await Department.findOne({ name: departmentName });
  const depHead = await DepHead.findOne({ _id: user._id });
  //console.log(department,depHead)
  if (!depHead) {
    await User.deleteOne({ email: user.email })
    //console.log(User.findById(user._id))
    await new DepHead({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      picturePath: user.picturePath,
      friends: user.friends,
      occupation: user.occupation,
      location: user.location,
      viewedProfile: user.viewedProfile,
      impressions: user.impressions,
      department: departmentName,
      role: 'depHead'
    }).save();
  } else {
    if (departmentName !== depHead.department) {
      const olddep = await Department.findOne({ name: depHead.department });
      olddep.depHead = null;
      olddep.save();
    }
    depHead.department = departmentName;
    await depHead.save();
  }
  department.depHead = user._id;
  await department.save();
  //console.log(depHead);
  await depHead.save();
  //console.log(user)
}

async function demoteExistingCoordinator(upName) {
  const UP = await PedagogicalUnit.findOne({ name: upName });
  if (UP && UP.coordinator) {
    const oldCoordinator = await User.findById(UP.coordinator);
    oldCoordinator.role = 'prof';
    await oldCoordinator.save();
    UP.coordinator = null; // Clear coordinator in UP
    await UP.save();
  }
}

async function promoteUserToCoordinator(user, upName) {
  const UP = await PedagogicalUnit.findOne({ name: upName });
  const coordinator = await Coordinator.findOne({ _id: user._id });
  if (!coordinator) {
    await new Coordinator({ _id: user._id, UP: upName }).save();
  } else {
    coordinator.UP = upName;
    await coordinator.save();
  }
  user.role = 'coordinator';
  if (UP) {
    UP.coordinator = user._id;
    await UP.save();
  }
}
*/

// Forgot Password
export const forgotpassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      // WE do NOT reveal whether the user exists or not
      return res.status(400).json();
    }
    const resetinfo = new ResetToken({ userId: user._id });

    const token = crypto.randomBytes(20).toString('hex');
    resetinfo.token = token;
    resetinfo.createdAt = Date.now();
    await resetinfo.save();

    // our email options 
    const mailOptions = {
      from: "gamgamitelgou@gmail.com",
      to: email,
      subject: "Resetting Your Unisocialize Password",
      text: `Kindly continue to : http://localhost:3000/tok=pass${token} to reset your password
      If you haven't requested a password reset, please ignore this email.
      `,
    };

    //await sendTokenEmail(email, token, mailOptions);
    console.log(token)
    return res.status(200).json({ message: 'Password reset email sent. Check your inbox.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const resetpassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    console.log(token, password)
    const resetdata = await ResetToken.findOne({ token });
    if (!resetdata) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    const user = await User.findById(resetdata.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hashing and saving the new password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();

    // Deleting the reset token document
    await resetdata.delete();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server Error' });
  }
};

// Change Password inside profile
const changepassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate a new random password
    const randomPassword = Math.random().toString(36).slice(-8); // Generates an 8-character alphanumeric password

    // Hash the new password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Update the user's password in the database
    const user = await User.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    // Send the email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to send email' });
      } else {
        console.log('Email sent: ' + info.response);
        return res.status(200).json({ message: 'New password sent successfully' });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Send an email with the token to the user
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gamgamitelgou@gmail.com",
    pass: "tmpn cjzq eyrk epjl",
  },
});

const sendTokenEmail = async (email, token, mailOptions) => {
  await transporter.sendMail(mailOptions);
};

const generateRandomToken = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

/////////////////////

export const transferUser = async (req, res) => {
  const departments = await Department.find({}, { name: 1, _id: 0 });
  const departmentNames = departments.map(department => department.name);

  const UPs = await PedagogicalUnit.find({}, { name: 1, _id: 0 });
  const UPNames = UPs.map(up => up.name);

  const { userid, dep, UP } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(userid).session(session);
    if (!user || ((UP !== undefined && !UPNames.includes(UP)) || (dep !== undefined && !departmentNames.includes(dep)))) {
      console.log(UP === undefined, UPNames.includes(UP), (UP !== undefined && !UPNames.includes(UP)))
      return res.status(404).json({ "message": "NOT FOUND" });
    }
    let newP;
    console.log((dep && departmentNames.includes(dep) && !(user.department)))
    if ((dep !== undefined && user.department == dep) || (UP !== undefined && user.UP == UP)) {
      return res.status(201).json({ message: 'User is already in the same position' });
    }
    // Department Transfer
    if (dep && departmentNames.includes(dep)) {
      const department = await Department.findOne({ name: dep });
      const oldHead = await (await getPositionModel('depHead')).findById(department.depHead);
      if (oldHead && user._id.toString() !== oldHead._id.toString()) await demoteExistingRole('depHead', dep, session);
      newP = await promoteUserToRole(user, 'depHead', dep, session);
    }

    // UP Transfer
    if (UP && UPNames.includes(UP)) {
      const up = await PedagogicalUnit.findOne({ name: UP });
      console.log(up.coordinator)
      let oldCoordinator;
      if (up.coordinator) { oldCoordinator = (await getPositionModel('coordinator').findById(up.coordinator)) };
      if (oldCoordinator && user._id.toString() !== oldCoordinator._id.toString()) await demoteExistingRole('coordinator', UP, session);
      newP = await promoteUserToRole(user, 'coordinator', UP, session);
    }

    await session.commitTransaction();
    await user.save();
    res.status(200).json({ newP });

  } catch (error) {
    console.error("Error transferring user:", error);
    await session.abortTransaction(); // Rollback
    throw error; // re-throwing error UP the call stack
  } finally {
    session.endSession();
  }
}

async function getPositionModel(role) {
  if (role === 'depHead') {
    return DepHead;
  } else if (role === 'coordinator') {
    return Coordinator;
  } else {
    throw new Error(`Unsupported role: ${role}`);
  }
}

async function demoteExistingRole(role, entityName, session) {
  const PositionModel = await getPositionModel(role);
  const entity = role === 'depHead' ? Department : PedagogicalUnit;
  const instance = await entity.findOne({ name: entityName });

  if (instance && instance[role]) {
    const oldUser = await PositionModel.findById(instance[role]);
    await User.deleteOne({ email: oldUser.email });
    await new User({
      _id: oldUser._id,
      firstName: oldUser.firstName,
      lastName: oldUser.lastName,
      email: oldUser.email,
      password: oldUser.password,
      picturePath: oldUser.picturePath,
      friends: oldUser.friends,
      occupation: oldUser.occupation,
      location: oldUser.location,
      viewedProfile: oldUser.viewedProfile,
      impressions: oldUser.impressions,
      role: 'prof'
    }).save();
    instance[role] = null; // Clear role in entity
    await instance.save();
  }
}

async function promoteUserToRole(user, role, entityName, session) {
  const PositionModel = await getPositionModel(role);
  const entity = role === 'depHead' ? Department : PedagogicalUnit;
  const attribut = role === 'depHead' ? 'department' : 'UP';
  const instance = await entity.findOne({ name: entityName });
  const currentRole = await PositionModel.findOne({ _id: user._id });

  if (!currentRole) {
    await User.deleteOne({ email: user.email });
    const newPosition = new PositionModel({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      picturePath: user.picturePath,
      friends: user.friends,
      occupation: user.occupation,
      location: user.location,
      viewedProfile: user.viewedProfile,
      impressions: user.impressions,
      role: role === 'depHead' ? 'depHead' : 'coordinator'
    });

    // Set department or UP based on the role
    if (role === 'depHead') {
      newPosition.department = entityName;
    } else if (role === 'coordinator') {
      newPosition.UP = entityName;
    }

    await newPosition.save();
  } else {
    if (entityName !== currentRole[attribut]) {
      const oldEntity = await entity.findOne({ name: currentRole[attribut] });
      console.log(oldEntity)
      oldEntity[role] = null;
      oldEntity.save();
    }
    currentRole[attribut] = entityName;
    await currentRole.save();
  }
  instance[role] = user._id;
  await instance.save();
  await user.save();
  return instance;
}
