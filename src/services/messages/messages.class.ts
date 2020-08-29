import { Service, MongooseServiceOptions } from "feathers-mongoose";
import mongoose from "mongoose";

import { Application } from "../../declarations";
import { Params } from "@feathersjs/feathers";
import app from "../../app";

const ObjectId = mongoose.Types.ObjectId;

export class Messages extends Service {
  private app: Application;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(options: Partial<MongooseServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async find(params?: Params) {
    return this.Model.aggregate([
      {
        $match: {
          channelId: ObjectId(params?.query?.channelId.toString()),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
        preserveNullAndEmptyArrays: true,
      },
      {
        $project: {
          _id: 1,
          content: 1,
          channelId: 1,
          userId: 1,
          createdAt: 1,
          updatedAt: 1,
          "user._id": 1,
          "user.name": 1,
          "user.avatar": 1,
          "user.email": 1,
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          count: { $sum: 1 },
          messages: {
            $push: {
              _id: "$_id",
              content: "$content",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
              userId: "$userId",
              channelId: "$channelId",
              user: "$user",
            },
          },
        },
      },
      {
        $unwind: "$messages",
      },
      {
        $sort: { "messages.createdAt": 1 },
      },
      {
        $group: {
          _id: "$_id",
          messages: { $push: "$messages" },
        },
      },
      {
        $project: {
          messages: { $slice: ["$messages", 50] },
        },
      },
      {
        $limit: 5,
      },
      {
        $sort: { "_id.date": 1 },
      },
    ]);
  }
}
