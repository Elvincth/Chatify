import { NextFunction, Request, Response } from "express";
import UserModel from "./user.model";

export const userController = {
  //Used to get the current user information
  async getUserInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const { user } = req;
      if (user) {
        res.json({
          username: user.username,
          name: user.name,
        });
      } else {
        throw new Error("User not found");
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  },

  //Could search by username or email
  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q;
      const projection = { username: 1, name: 1 };

      if (!query) {
        //get the first 10 users
        const users = await UserModel.find(
          //exclude the current user
          { _id: { $ne: req.user!._id } },
          projection
        ).limit(10);
        return res.json(users);
      }

      //simple full text search by username, name or email
      const searchResult = await UserModel.find(
        {
          _id: { $ne: req.user!._id },
          $or: [
            { username: { $regex: query, $options: "i" } },
            { name: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } },
          ],
        },
        projection
      );

      return res.json(searchResult);
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  },
};
