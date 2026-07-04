const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequstModel = require("../models/connectionRequest");
const UserModel = require("../models/user");
const userRouter = express.Router();
const USER_SAFE_DATA = "firstName lastName emailId photoUrl about skills";

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const receivedRequests = await ConnectionRequstModel.find({
      toUserId: userId,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.status(200).json({
      message: "Received connection requests fetched successfully",
      data: receivedRequests,
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Error while fetching received connection requests " + error.message,
    });
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user._id;

    const connections = await ConnectionRequstModel.find({
      $or: [
        { fromUserId: loggedUser, status: "accepted" },
        { toUserId: loggedUser, status: "accepted" },
      ],
    }).populate("fromUserId toUserId", USER_SAFE_DATA);

    const data = connections.map((connection) => {
      if (connection.fromUserId._id.toString() === loggedUser.toString()) {
        return connection.toUserId;
      }
      return connection.fromUserId;
    });

    res.status(200).json({
      message: "Connections fetched successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while fetching connections " + error.message,
    });
  }
});

userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedUser = req.user._id;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connections = await ConnectionRequstModel.find({
      $or: [{ fromUserId: loggedUser }, { toUserId: loggedUser }],
    }).select("fromUserId toUserId");

    const hideUsersFromFeed = new Set();
    connections.forEach((connection) => {
      hideUsersFromFeed.add(connection.toUserId.toString());
      hideUsersFromFeed.add(connection.fromUserId.toString());
    });

    const feedUsers = await UserModel.find({
      _id: { $ne: loggedUser, $nin: Array.from(hideUsersFromFeed) },
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Feed fetched successfully",
      data: feedUsers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while fetching feed " + error.message,
    });
  }
});

module.exports = userRouter;
