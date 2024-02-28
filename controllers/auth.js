import bcrypt from "bcrypt";
import crypto from 'crypto';
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import PreUser from "../models/preUser.js";

/* Pregister USER */ 
export const pregister = async (req, res) => {
  try {
    const {
      email,
    } = req.body;
    console.log(req.body)

    console.log(email)
    const newPreUser = new PreUser({ email });

    const savedPreUser = await newPreUser.save();
    const token = generateRandomToken(10);
    savedPreUser.token=token;
    await savedPreUser.save();

    // Send an email with the token to the user
    await sendTokenEmail(email, token);


    res.status(201).json("pregistered correctly");
  } catch (err) {
    console.error("preRegister error:", err);
    res.status(500).json({ error: err.message });
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
       return res.status(401).json({ error: "PreUser not found for the provided token" });
     }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email : preUser.email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: 0,
      impressions: 0,
    });
    const savedUser = await newUser.save();
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;
    res.status(200).json({ token, user });
  } catch (err) {
    //console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
};


const sendTokenEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "gamgamitelgou@gmail.com",
      pass: "tmpn cjzq eyrk epjl",
    },
  });

  const mailOptions = {
    from: "gamgamitelgou@gmail.com",
    to: email,
    subject: "Registration Token",
    text: `Kindly continue to : http://localhost:3000/tok=${token} and complete the registration`,
  };

  await transporter.sendMail(mailOptions);
};

const generateRandomToken = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};
