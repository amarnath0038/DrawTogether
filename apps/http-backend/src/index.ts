import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { userMiddleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import {signupSchema, signinSchema, createRoomSchema} from "@repo/common/types";
import bcrypt from "bcrypt";
import { prismaClient } from "@repo/db/client";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

async function userSignup(req: Request, res: Response) {
  const parsedDataWithSuccess = signupSchema.safeParse(req.body);
  if (!parsedDataWithSuccess.success) {
    const whatIsWrong = parsedDataWithSuccess.error.issues.map(issue => (`${issue.path[0]} is invalid: ${issue.message}`));
    res.status(401).json({message: "Incorrect data format", errors: whatIsWrong});
    return;
  }

  const { email, name, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 5);

  try {
    const user = await prismaClient.user.create({data: {email, name, password: hashedPassword}})
    res.json({message: "You are successfully signed up", userId: user.id});
  } catch(err) {
    res.status(401).json({ message: "Error while signing up", err});
    return;
  }
}

async function userSignin(req: Request, res: Response) {
  const parsedDataWithSuccess = signinSchema.safeParse(req.body);
  if (!parsedDataWithSuccess.success) {
    const whatIsWrong = parsedDataWithSuccess.error.issues.map(issue => (`${issue.path[0]} is invalid: ${issue.message}`));
    res.status(401).json({message: "Incorret data format", errors: whatIsWrong});
    return;
  }

  const { email, password } = req.body;

  try {
    const user = await prismaClient.user.findUnique({where: { email }});
    if (!user) {
      res.status(401).json({ message: "User not found"});
      return;
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch){
      res.status(401).json({ message: "Wrong password"});
      return;
    } 

    const token = jwt.sign({ id: user.id }, JWT_SECRET)
    res.json({ message: "You are successfully signed in", userId: user.id, token: token});

    } catch(err) {
      console.error("Signin error: ",err);
      res.status(500).json({ message: "Something went wrong. Please try again"});
  }
}

async function userCreateRoom(req: Request, res: Response) {
  const parsedDataWithSuccess = createRoomSchema.safeParse(req.body);
  if (!parsedDataWithSuccess.success) {
    const whatIsWrong = parsedDataWithSuccess.error.issues.map(issue => (`${issue.path[0]} is invalid: ${issue.message}`));
    res.status(401).json({message: "Incorrect data format", errors: whatIsWrong});
    return;
  }
  
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const userId = req.user.id;

  try {
    const room = await prismaClient.room.create({
      data: {
        adminId: userId.toString(),
        slug: parsedDataWithSuccess.data.name
      }
    });
    res.json({message: "Room created successfully!", roomId: room.id});
  } catch(err) {
    res.status(401).json({message: "Unable to create room", err});
  }
}


async function getRoomChats(req: Request<{ roomId: string }>, res: Response) {
  try {
    const roomId = parseInt(req.params.roomId);

    if (isNaN(roomId)) {
      res.status(400).json({ message: "Invalid roomId" });
    }

    const messages = await prismaClient.chat.findMany({
      where: { roomId },
      orderBy: { id: "desc" },
      take: 50,
    });
    const chat = messages.map(m => m.message);
    res.json({ chat });
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ message: "Internal server error", messages: [] });
  }
}


async function getRoomBySlug(req: Request<{ slug: string }>, res: Response) {
  try {
    const { slug } = req.params;

    if (!slug || typeof slug !== "string") {
      res.status(400).json({ message: "Invalid slug" });
    }

    const room = await prismaClient.room.findFirst({
      where: { slug },
      include: {admin: true}
    });

    if (!room) {
      res.status(404).json({message: "Room not found"});
    }
    const {admin, ...rest} = room as Exclude<typeof room, null>;
;
    res.json({ room: {
      ...rest,
      adminName: admin?.name || "Unknown"
    } });
  } catch (err) {
    console.error("Error fetching room:", err);
    res.status(500).json({ message: "Server error", room: null });
  }
}



app.post("/signup", userSignup);

app.post("/signin", userSignin);

app.post("/room", userMiddleware, userCreateRoom);

app.get("/chats/:roomId", userMiddleware, getRoomChats);

app.get("/room/:slug", userMiddleware, getRoomBySlug);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});