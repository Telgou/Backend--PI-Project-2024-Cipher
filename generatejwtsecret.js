import { randomBytes } from "crypto";

function generateRandomString(length) {
  return randomBytes(length).toString("hex");
}

const jwtSecret = generateRandomString(32);
console.log('JWT_SECRET:', jwtSecret);
