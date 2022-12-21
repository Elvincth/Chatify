import { NextFunction, Request, Response } from "express";
import UserModel from "~/api/user/user.model";
import { issueJWT } from "~/utils/jwt";
import { comparePassword } from "~/utils/password";

const controller = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, name, password, email } = req.body;

      if (!username || !name || !password || !email) {
        return res.status(400).json({
          message: "Please provide all required fields",
        });
      }

      //check if username or email already exists
      const exists = await UserModel.findOne({
        username,
      });

      if (exists) {
        return res.status(400).json({
          message: "Username already exists",
        });
      }

      //Check if email already exists
      const emailExists = await UserModel.findOne({
        email,
      });

      if (emailExists) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }

      const user = await UserModel.create({
        username,
        name,
        password,
        email,
      });

      //Issue JWT for user, as they have successfully logged in
      issueJWT({ user, res });

      res.status(201).json({
        message: "User created successfully",
      });

      next();
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      const user = await UserModel.findOne({ username });

      console.log("user", user);

      if (!user) {
        return res.status(400).json({
          message: "Incorrect username",
        });
      }

      if (user) {
        //Check if the password is correct
        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
          return res.status(400).json({
            message: "Incorrect password",
          });
        }

        //Issue JWT for user, as they have successfully registered, so they don't have to login again
        issueJWT({ user, res });

        return res.status(200).json({
          message: "Logged in successfully",
        });
      }

      next();
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      //Clear the access token cookie
      res.clearCookie("access-token");
      res.json({
        message: "Logged out successfully",
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  },

  //Just an example of how to protect a route
  async protected(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json({
        message: "You have access to this route",
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  },
};

export { controller as authController };
