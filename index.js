import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import activityRoutes from "./routes/Activity.js";
import messageRoutes from"./routes/messages.js";
import groupeRoutes from "./routes/groups.js"
//import eventRoutes from "./routes/events.js"
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { createActivity } from "./controllers/Activity.js";
import { verifyToken } from "./middleware/auth.js";
import { restrict } from "./middleware/role-authorize.js";
import {User} from "./models/User.js";
import Post from "./models/Post.js";
import  eventRoutes  from "./routes/events.js";
import { Server } from "socket.io";


//import { users, posts } from "./data/index.js";
import { createGroup } from "./controllers/group.js";
import { createEvent } from "./controllers/event.js";
import Group from "./models/Group.js";
/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/addpost", verifyToken, upload.single("picture"), createPost);
//app.post('/posts', verifyToken, restrict('admin'), upload.single('picture'), createPost);
app.post("/events/add", verifyToken, createEvent);

app.post("/activity", verifyToken, upload.single("picture"), createActivity);

app.post("/addgroup", createGroup);


/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/events", eventRoutes);

app.use("/activity", activityRoutes);
app.use("/api/messages", messageRoutes);
app.use("/groups", groupeRoutes)

//app.use("/events",eventRoutes)

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 3001;
const mongoport = process.env.MONGO_URI || 'mongodb://localhost:27017/snu'
console.log(mongoport);
mongoose
  .connect(mongoport, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

  })
  .catch((error) => console.log(`${error} did not connect`));

  const server = app.listen(process.env.PORT, () =>
console.log(`Server started on ${process.env.PORT}`)
);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});