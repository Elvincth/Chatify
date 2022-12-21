import { connect } from "mongoose";

export const connectToDb = async () => {
  connect(process.env.MONGO_URI!)
    .then((db) => {
      const isConnected = db.connections[0].readyState === 1;
      console.log("Database connected:", isConnected);
      Promise.resolve(isConnected);
    })
    .catch((e) => {
      console.error("Database connection error");
      Promise.reject(e);
    });
};
