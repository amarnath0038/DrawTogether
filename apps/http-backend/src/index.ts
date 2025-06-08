import express, { Express, Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { userMiddleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { signupSchema, signinSchema, createRoomSchema } from "@repo/common/types";
import bcrypt from "bcrypt";
import { prismaClient } from "@repo/db/client";
import cors from "cors";

import passport from "passport";
import session from "express-session";
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from "passport-google-oauth20";
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from "passport-github2";

import { SESSION_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from "@repo/backend-common/config";


const app: Express = express();
app.use(express.json());
app.use(cors());

app.use(
  session({
    secret: SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Serialize user to session
passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prismaClient.user.findUnique({ where: { id } });
    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  } catch (err) {
    done(err);
  }
});

// OAuth strategy(Google)
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3001/auth/google/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GoogleProfile,
      done: (error: any, user?: Express.User | false) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value || "";
        let user = await prismaClient.user.findUnique({ where: { email } });
        if (!user) {
          user = await prismaClient.user.create({
            data: {
              email,
              name: profile.displayName || "",
              password: "", 
              oauthProvider: "google",
              oauthId: profile.id,
            },
          });
        }
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);


// OAuth strategy(Github)
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3001/auth/github/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: GitHubProfile,
      done: (error: any, user?: Express.User | false) => void
    ) => {
      try {
        const email = profile.emails?.[0]?.value || "";
        let user = await prismaClient.user.findUnique({ where: { email } });
        if (!user) {
          user = await prismaClient.user.create({
            data: {
              email,
              name: profile.displayName || profile.username || "",
              password: "",
              oauthProvider: "github",
              oauthId: profile.id,
            },
          });
        }
        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);


// OAuth routes

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signin" }),
  (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication failed" });
      return;
    }
    const token = jwt.sign({ id: req.user.id }, JWT_SECRET);
    //res.json({ message: "Google signin successful", token, userId: req.user.id });
    res.redirect(`http://localhost:3000/dashboard?token=${token}`)
  }
);

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/signin" }),
  (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication failed" });
      return;
    }
    const token = jwt.sign({ id: req.user.id }, JWT_SECRET);
    //res.json({ message: "GitHub signin successful", token, userId: req.user.id });
    res.redirect(`http://localhost:3000/dashboard?token=${token}`)
  }
);



async function userSignup(req: Request, res: Response) {
  const parsedDataWithSuccess = signupSchema.safeParse(req.body);
  if (!parsedDataWithSuccess.success) {
    const whatIsWrong = parsedDataWithSuccess.error.issues.map(
      (issue) => `${issue.path[0]} is invalid: ${issue.message}`
    );
    res.status(401).json({ message: "Incorrect data format", errors: whatIsWrong });
    return;
  }

  const { email, name, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 5);

  try {
    const user = await prismaClient.user.create({
      data: { email, name, password: hashedPassword },
    });
    res.json({ message: "You are successfully signed up", userId: user.id });
  } catch (err) {
    res.status(401).json({ message: "Error while signing up", err });
  }
}


async function userSignin(req: Request, res: Response) {
  const parsedDataWithSuccess = signinSchema.safeParse(req.body);
  if (!parsedDataWithSuccess.success) {
    const whatIsWrong = parsedDataWithSuccess.error.issues.map(
      (issue) => `${issue.path[0]} is invalid: ${issue.message}`
    );
    res.status(401).json({ message: "Incorrect data format", errors: whatIsWrong });
    return;
  }

  const { email, password } = req.body;

  try {
    const user = await prismaClient.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Wrong password" });
      return;
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.json({ message: "You are successfully signed in", userId: user.id, token });
  } catch (err) {
    console.error("Signin error: ", err);
    res.status(500).json({ message: "Something went wrong. Please try again" });
  }
}


async function userCreateRoom(req: Request, res: Response) {
  const parsedDataWithSuccess = createRoomSchema.safeParse(req.body);
  if (!parsedDataWithSuccess.success) {
    const whatIsWrong = parsedDataWithSuccess.error.issues.map(
      (issue) => `${issue.path[0]} is invalid: ${issue.message}`
    );
    res.status(401).json({ message: "Incorrect data format", errors: whatIsWrong });
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
        slug: req.body.name,
      },
    });
    res.json({ message: "You successfully created a room", room });
  } catch (err) {
    res.status(401).json({ message: "Error while creating room", err });
  }
}


async function getRoomChats(req: Request<{ roomId: string }>, res: Response) {
  try {
    const roomId = req.params.roomId;

    // if (isNaN(roomId)) {
    //   res.status(400).json({ message: "Invalid roomId" });
    // }

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
      return;
    }

    const room = await prismaClient.room.findFirst({
      where: { slug },
      include: {admin: true}
    });

    if (!room) {
      res.status(404).json({message: "Room not found"});
      return;
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
app.post("/create-room", userMiddleware, userCreateRoom);
app.get("/chats/:roomId", getRoomChats);
app.get("/room/:slug", getRoomBySlug);

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
