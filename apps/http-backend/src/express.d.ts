import express from "express";

interface OAuthUser {
  id: string;
  email?: string;
  name?: string;
  oauthProvider?: string | null;
  oauthId?: string | null;
  password?: string;
}

declare global {
  namespace Express {
    interface User extends OAuthUser {}
    interface Request {
      user?: User;
    }
  }
}
