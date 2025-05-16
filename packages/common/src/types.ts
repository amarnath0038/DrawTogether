import { z } from "zod";

const passwordRule =  z.string()
  .min(4, {message: "Password must be atleast 4 characters long"})
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?]).*$/, 
    {message: "Password must have at least one uppercase, one lowercase, one number and one special character"});


export const signupSchema = z.object({
  // username: z.string()
  //   .min(2, {message: "Username must be atleast 2 characters"})
  //   .max(20, {message: "Username cannot exceed 20 characters"})
  //   .trim()
  //   .toLowerCase(),

  email: z.string()
    .email({message: "Invalid email address"})
    .trim()
    .toLowerCase(),

  name: z.string()
    .min(2, {message: "Username must be atleast 2 characters long"})
    .max(30, {message: "Username cannot exceed 30 characters"})
    .trim(),

  password: passwordRule,
});


export const signinSchema = z
  .object({
      // username: z.string()
      //   .min(2, {message: "Username must be atleast 2 characters"})
      //   .max(20, {message: "Username cannot exceed 20 characters"})
      //   .trim()
      //   .toLowerCase(),

      email: z.string()
        .email({message: "Invalid email address"})
        .trim()
        .toLowerCase(),

      password: passwordRule,
  });


  export const createRoomSchema = z.object({
    name: z.string() // name of the room
    .min(2, {message: "Username must be atleast 2 characters long"})
    .max(30, {message: "Username cannot exceed 30 characters"})
    .trim()
  });
  