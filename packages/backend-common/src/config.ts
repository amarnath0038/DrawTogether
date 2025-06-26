import dotenv from "dotenv";
import path from "path";

// Load from current wd
dotenv.config({path: path.resolve(process.cwd(),".env")});

export const DATABASE_URL = process.env.DATABASE_URL || "";
export const JWT_SECRET = process.env.JWT_SECRET || "";

export const SESSION_SECRET = process.env.SESSION_SECRET || "very-long-random-string";

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

export const PORT = process.env.PORT || "3001";




