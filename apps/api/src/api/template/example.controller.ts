import { NextFunction, Request, Response, Router } from "express";

const controller = {
  async getExample(req: Request, res: Response, next: NextFunction) {
    res.send("Hello World!");
  },
};

export { controller as exampleController };
