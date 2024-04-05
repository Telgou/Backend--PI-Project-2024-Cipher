import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");
    //console.log(token)

    if (!token) {
      console.log("No token, authorization denied");
      return res.status(401).send("Access Denied");
    }
    if (!token.startsWith("Bearer ")) {
      return res.status(401).send("Invalid Token Format");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    //console.log('JWT_SECRET:', process.env.JWT_SECRET);

    // process.env.JWT_SECRET
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(verified)

    req.user = verified;
    req.user.role = verified.role;
    //req.userid = verified.id;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
