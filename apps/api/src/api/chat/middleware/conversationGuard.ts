//express middleware
import { Request, Response, NextFunction } from "express";
import { ConversationModel } from "../models/conversation.model";

//Used to check if the conversation exists and if the user is part of it, if not throw error
export const conversationGuard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { conversationId } = req.params;
    const user = req.user;

    if (user) {
      //Check if user is a  participant of the conversation
      const conversation = await ConversationModel.findById(conversationId);

      if (conversation) {
        //Loop through the participants and check if the user is part of the conversation
        const isParticipant = conversation.participants.some(
          (participantId: string) =>
            participantId.toString() === user._id.toString()
        );

        if (isParticipant) {
          return next();
        } else {
          console.log("Not a participant");
          return res.status(401).json({ message: "Unauthorized" });
        }
      } else {
        return res.status(404).json({ message: "Conversation not found" });
      }
    }

    return res.status(403).json({ message: "Forbidden" });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};
