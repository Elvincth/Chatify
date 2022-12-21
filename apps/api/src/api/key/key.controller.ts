import { NextFunction, Request, Response } from "express";
import { KeyModel } from "./key.model";

const controller = {
  // async getKey(req: Request, res: Response, next: NextFunction) {
  //   res.send("Hello World!");
  // },

  //Get the public key of a particular userId
  async getPublicKey(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User id is required" });
    }

    try {
      const key = await KeyModel.findOne({ userId });

      return res.json({ publicKey: key?.publicKey ?? null });
    } catch (error) {
      next(error);
    }
  },

  //Here we allow the user to update and upload their public key
  //Actually we should need to revoke the old key and generate a new one
  //But here we are just updating the key
  async postPublicKey(req: Request, res: Response, next: NextFunction) {
    const { publicKey } = req.body;

    if (!publicKey) {
      return res.status(400).json({ message: "Public key are required" });
    }

    try {
      //if exists, update
      const key = await KeyModel.findOne({ userId: req.user!._id });

      if (key) {
        key.publicKey = publicKey;
        await key.save();
        return res.json({ message: "Key updated" });
      }
      //if not exists, create
      const newKey = await KeyModel.create({
        userId: req.user!._id,
        publicKey,
      });

      return res.status(201).send({ message: "Key created" });
    } catch (e) {
      next(e);
    }
  },
};

export { controller as keyController };
