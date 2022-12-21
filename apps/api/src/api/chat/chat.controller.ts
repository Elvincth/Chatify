import { NextFunction, Request, Response } from "express";
import { IConversationReq, IUserDoc } from "interfaces";
import { ConversationModel, MessageModel } from "~/api/chat/models";
import UserModel from "../user/user.model";

const controller = {
  //Create a new conversation between two users
  async createConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const { receiverId }: IConversationReq = req.body;

      if (!receiverId) {
        return res.status(400).json({
          message: "Receiver id is required",
        });
      }

      if (receiverId === req.user!._id) {
        return res.status(400).json({
          message: "You cannot send a message to yourself",
        });
      }

      //check is the receiverId is a valid user
      const receiver = await UserModel.findById(receiverId);

      if (!receiver) {
        return res.status(400).json({
          message: "Receiver id is not valid",
        });
      }

      //check if conversation already exists
      const existingConversation = await ConversationModel.findOne({
        participants: {
          $all: [req.user!._id, receiverId],
        },
      });

      if (existingConversation) {
        return res.status(200).json(existingConversation);
      }

      const conversation = await ConversationModel.create({
        participants: [req.user!._id, receiverId],
      });

      res.status(201).json(conversation);
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  },

  async getConversationList(req: Request, res: Response, next: NextFunction) {
    try {
      //Get all conversations where the current user is a participant
      const conversations = await ConversationModel.find({
        participants: {
          $in: [req.user!._id],
        },
      }).populate<IUserDoc>({
        path: "participants",
        select: {
          name: 1,
          username: 1,
          email: 1,
        },
      });

      res.status(200).json(conversations);
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  },

  //Get a conversation by id
  async getMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { conversationId } = req.params;

      //Get all messages from a conversation
      const messages = await MessageModel.find({
        conversationId,
      });

      res.status(200).json(messages);
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  },

  //Send a message to a conversation
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { conversationId } = req.params;
      const { content, senderContent } = req.body;

      if (!content || !senderContent) {
        return res.status(400).json({
          message: "Sender and receiver content is required",
        });
      }

      //Get conversation
      const conversation = await ConversationModel.findById(conversationId);

      if (!conversation) {
        return res.status(400).json({
          message: "Conversation not found",
        });
      }

      //Create a new message
      const newMessage = await MessageModel.create({
        conversationId,
        senderId: req.user!._id,
        content,
        senderContent,
      });

      res.status(201).json(newMessage);
    } catch (e) {
      console.log(e);
      res.status(500).json({
        message: "Something went wrong",
      });
    }
  },
};

export { controller as chatController };
