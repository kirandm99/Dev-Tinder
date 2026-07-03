const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequstModel = require("../models/connectionRequest");
const userRouter = express.Router();

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const receivedRequests = await ConnectionRequstModel.find({
      toUserId: userId,
      status: "interested",
    }).populate(
      "fromUserId",
      "firstName lastName emailId photoUrl about skills",
    );

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
    }).populate(
      "fromUserId toUserId",
      "firstName lastName emailId photoUrl about skills",
    );

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

module.exports = userRouter;
