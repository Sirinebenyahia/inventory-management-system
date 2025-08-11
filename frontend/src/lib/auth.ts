import * as jwt from "jsonwebtoken"

export default function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch (err) {
    return null;
  }
}
