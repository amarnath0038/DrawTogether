import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";


export function userMiddleware(req: Request, res: Response, next: NextFunction) {
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: "No token found" });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ message: "Invalid token format" });
    return;
  }

  try {
    const decodedInfo = jwt.verify(token, JWT_SECRET) as { id: string };
    console.log("Decoded JWT:", decodedInfo);
    req.user = { id: decodedInfo.id };
    next();
  } catch (err) {
    res.status(401).json({ message: "You are not signed in" });
    return;
  }
}
