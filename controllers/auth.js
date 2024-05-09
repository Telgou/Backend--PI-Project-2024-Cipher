import bcrypt from "bcrypt";
import crypto from 'crypto';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import * as xlsx from 'xlsx';
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
    const mailOptions = {
      from: "gamgamitelgou@gmail.com",
      to: email,
      subject: "Registration Token",
      text: `Your pre registration has been submitted, please wait until it's verified.
      Kindly continue to : http://localhost:3000/tok=${token} and complete the registration later on.`,
    };
    await sendTokenEmail(email, mailOptions);
    console.log(token);

    res.status(201).json({ msg: "pregistered correctly" });
  } catch (err) {
    console.error("preRegister error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* PREREGISTRATION  Verifying - getting preusers - deleting preusers */
export const getPreUsers = async (req, res) => {
  try {
    const user = await PreUser.find();
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
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

    // inform per email 
    const mailOptions = {
      from: "gamgamitelgou@gmail.com",
      to: email,
      subject: "Your Unisocialize account was vrified ",
      text: `We are glad to tell you that your account was verified, please continue your registration.`,
    };

    await sendTokenEmail(email, mailOptions);


    res.status(200).json({ verified: preuser.valid });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
};


export const massverificationbyemail = async (req, res) => {
  try {
    //console.log(req.body)
    //const { file } = xlsx.read(req.body);
    //console.log(file)
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

    const emails = [];
    const range = xlsx.utils.decode_range(sheet['!ref']);

    for (let rowNum = range.s.r; rowNum <= range.e.r; rowNum++) {
      const cellAddress = { c: 0, r: rowNum };
      const cellRef = xlsx.utils.encode_cell(cellAddress);
      const cell = sheet[cellRef];
      if (cell && cell.t === 's' && emailRegex.test(cell.v)) {
        emails.push(cell.v);
      }
    }
    console.log(emails);

    const verifyPromises = emails.map(async (email) => {
      try {
        console.log(email);
        const preuser = await PreUser.findOne({ email: email });

        preuser.valid = !preuser.valid;
        await preuser.save();
        console.log(preuser);
        const mailOptions = {
          from: "gamgamitelgou@gmail.com",
          to: email,
          subject: "Your Unisocialize account was vrified ",
          text: `We are glad to tell you that your account was verified, please continue your registration.`,
        };

        await sendTokenEmail(email, mailOptions);
        return { status: 200, json: null };
      } catch (error) {
        console.error(`Error verifying user with email ${email}:`, error);
        return { status: 500, json: { error: `An error occurred during verification of user with email ${email}` } };
      }
    });

    const responses = await Promise.all(verifyPromises);

    responses.forEach(({ status, json }) => {
      if (json) {
        res.status(status).json(json);
      } else {
        res.status(status).end();
      }
    });

  } catch (error) {
    console.error('Error occurred during email verification:', error);
    res.status(500).json({ /*error: 'An error occurred during email verification'*/ });
  }
}


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


    const userBrowser = req.headers['user-agent'];
    const userIpAddress = req.clientIP;
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
      userAgent: userBrowser,
      lastip: userIpAddress
    });


    const savedUser = await newUser.save();
    // delete preuser
    preUser.delete();

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
    const { email, password, logtoken } = req.body;
    console.log(req.body)
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ /*msg: "User does not exist. "*/ });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ /*msg: "Invalid credentials. "*/ });

    console.log(logtoken);
    if (logtoken != undefined) {
      user.lastip = req.clientIP;
      user.userAgent = req.headers['user-agent'];
      await user.save();
      console.log(user)
    }

    const userBrowser = req.headers['user-agent'];
    const userIpAddress = req.clientIP;
    if (userBrowser !== user.userAgent || userIpAddress !== user.lastip) {
      const resetinfo = new ResetToken({ userId: user._id });

      const logtoken = crypto.randomBytes(20).toString('hex');
      resetinfo.token = logtoken;
      resetinfo.createdAt = Date.now();
      console.log(logtoken);
      await resetinfo.save();

      const mailOptions = {
        from: "gamgamitelgou@gmail.com",
        to: email,
        subject: "New login location detected",
        text: `Kindly continue to : http://localhost:3000/tok=log${logtoken} to login.
        `,
      };

      await sendTokenEmail(email, mailOptions);

      return res.status(401).json({ msg: "New connection location detected, please check your email to continue logging in" });
    }

    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    user.password = null;
    res.status(200).json({ token, user });

  } catch (err) {
    //console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};

// Request privilege upgrade

// Forgot Password
export const forgotpassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json();
    }
    const resetinfo = new ResetToken({ userId: user._id });

    const token = crypto.randomBytes(20).toString('hex');
    resetinfo.token = token;
    resetinfo.createdAt = Date.now();
    await resetinfo.save();

    const mailOptions = {
      from: "gamgamitelgou@gmail.com",
      to: email,
      subject: "Resetting Your Unisocialize Password",
      text: `Kindly continue to : http://localhost:3000/tok=pass${token} to reset your password
      If you haven't requested a password reset, please ignore this email.
      `,
    };

    await sendTokenEmail(email, mailOptions);
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

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();

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

// email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "gamgamitelgou@gmail.com",
    pass: "cpxk kwqy hwyo hriy",
  },
});

const sendTokenEmail = async (email, mailOptions) => {
  await transporter.sendMail(mailOptions);
};

const generateRandomToken = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

// Changing privilege 

export const transferUser = async (req, res) => {
  // departments & UP list
  const departments = await Department.find({}, { name: 1, _id: 0 });
  const departmentNames = departments.map(department => department.name);
  const UPs = await PedagogicalUnit.find({}, { name: 1, _id: 0 });
  const UPNames = UPs.map(up => up.name);

  const { userid, dep, UP } = req.body;
  console.log(userid, dep, UP)


  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await User.findById(userid).session(session);

    if (req.user.role == 'depHead' && dep) res.status(403).json({ msg: 'Not allowed' });
    else {
      if (user && !UP && !dep) demotetoprof(user);

      if (!user || ((UP !== undefined && !UPNames.includes(UP)) || (dep !== undefined && !departmentNames.includes(dep)))) {
        console.log(UP === undefined, UPNames.includes(UP), (UP !== undefined && !UPNames.includes(UP)))
        console.log((dep !== undefined && !departmentNames.includes(dep)), dep !== undefined, !departmentNames.includes(dep))
        return res.status(404).json({ /*"message": "NOT FOUND"*/ });
      }
      let newP;
      //console.log((dep && departmentNames.includes(dep) && !(user.department)))

      if ((dep !== undefined && user.department == dep) || (UP !== undefined && user.UP == UP)) {
        return res.status(201).json({ message: 'User is already in the same position' });
      }

      const PositionModel = dep ? await getPositionModel('depHead') : await getPositionModel('coordinator')
      // Department Transfer
      if (dep && departmentNames.includes(dep)) {
        const department = await Department.findOne({ name: dep });
        console.log("model", PositionModel, " and dephead id = ", department.depHead);
        let oldHead;
        oldHead = await PositionModel.findById(department.depHead);
        console.log(oldHead);
        if (oldHead) {
          if (user._id.toString() !== oldHead._id.toString()) await demoteExistingRole('depHead', dep, session);
        }
        newP = await promoteUserToRole(user, 'depHead', dep, session);
      }

      // UP Transfer
      if (UP && UPNames.includes(UP)) {
        const up = await PedagogicalUnit.findOne({ name: UP });
        console.log(up.coordinator)
        let oldCoordinator;
        oldCoordinator = await PositionModel.findById(up.coordinator)
        if (oldCoordinator) {
          if (user._id.toString() !== oldCoordinator._id.toString()) await demoteExistingRole('coordinator', UP, session);
        }
        newP = await promoteUserToRole(user, 'coordinator', UP, session);
      }
      console.log('committing transaction')
      await session.commitTransaction();
      console.log('COMMITTED')
      res.status(200).json({ newP });
    }

  } catch (error) {
    console.log("Error transferring user:", error);
    await session.abortTransaction();

    res.status(500).json({ error: err.message });
    //throw error;
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
    console.log("deleting old head/coord")
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
    instance[role] = null;
    await instance.save();
    console.log("demoting done")
  }
}

async function promoteUserToRole(user, role, entityName, session) {
  const PositionModel = await getPositionModel(role);
  const entity = role === 'depHead' ? Department : PedagogicalUnit;
  const attribut = role === 'depHead' ? 'department' : 'UP';
  const instance = await entity.findOne({ name: entityName });
  console.log(PositionModel)
  console.log(entity)
  console.log(instance)

  const currentRole = await PositionModel.findOne({ _id: user._id });

  if (!currentRole) {
    console.log("User doesn't have current role.");
    await User.deleteOne({ email: user.email });

    // Setting old entity position to null
    if (user.department) {
      const oldEntity = await Department.findOne({ name: user.department });
      console.log("Old Entity:", oldEntity);
      oldEntity.depHead = null;
      oldEntity.save();
    } else if (user.UP) {
      const oldEntity = await PedagogicalUnit.findOne({ name: user.UP });
      console.log("Old Entity:", oldEntity);
      oldEntity.coordinator = null;
      oldEntity.save();
    }

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
    console.log("New position created:", newPosition);

    // Set department or UP based on the role
    if (role === 'depHead') {
      newPosition.department = entityName;
    } else if (role === 'coordinator') {
      newPosition.UP = entityName;
    }

    await newPosition.save();
  } else {
    console.log("User has current role. Updating...");
    if (entityName !== currentRole[attribut]) {
      const oldEntity = await entity.findOne({ name: currentRole[attribut] });
      console.log("Old Entity:", oldEntity);
      oldEntity[role] = null;
      oldEntity.save();
      console.log("Old entity saved with role cleared");
    }
    currentRole[attribut] = entityName;
    await currentRole.save();
    console.log("Current role updated successfully");
  }
  instance[role] = user._id;
  await instance.save();
  console.log("Instance updated with user's new role");
  await user.save();
  console.log("User updated with new role");

  return instance;
}


async function demotetoprof(user) {
  await User.deleteOne({ email: user.email });
  if (user.department) {
    const dep = await Department.findOne({ name: user.department });
    dep.depHead = null;
    await dep.save();
  }
  if (user.UP) {
    const up = await PedagogicalUnit.findOne({ name: user.UP });
    up.coordinator = null;
    await up.save();
  }
  const newPosition = new User({
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
    role: 'prof'
  });
  console.log("Demoted to normal prof :", newPosition);
  await newPosition.save();

  return newPosition;
}















// CHAT Rayen


export const loginn = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const registerr = async (req, res, next) => {
  try {
    const { username, firstName, lastName, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      firstName,
      lastName,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
};

export const logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: "User id is required " });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};