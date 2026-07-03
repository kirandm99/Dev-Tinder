const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequstModel = require("../models/connectionRequest");
const requestRouter = express.Router();
const UserModel = require("../models/user");

requestRouter.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ message: req.user.firstName + " sending request" });
  } catch (error) {
    res.status(500).json({
      message: "Error while sending connection request " + error.message,
    });
  }
});

requestRouter.post(
  "/request/send/:status/:userId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const { status, userId } = req.params;

      const allowedStatus = ["ignored", "interested"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status type : " + status,
        });
      }

      const toUserCheck = await UserModel.findById(userId);
      if (!toUserCheck) {
        return res.status(404).json({
          message: "User is not found",
        });
      }

      const existingRequest = await ConnectionRequstModel.findOne({
        $or: [
          { fromUserId, toUserId: userId },
          { fromUserId: userId, toUserId: fromUserId },
        ],
      });

      if (existingRequest) {
        return res.status(400).json({
          message: "Connection request already exists between these users",
        });
      }

      const connectionRequest = new ConnectionRequstModel({
        fromUserId,
        toUserId: userId,
        status,
      });

      const data = await connectionRequest.save();
      res
        .status(200)
        .json({ message: "Connection request sent successfully", data });
    } catch (error) {
      res.status(500).json({
        message: "Error while accepting connection request " + error.message,
      });
    }
  },
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    const loggedUserId = req.user._id;
    const { status, requestId } = req.params;

    try {
      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status type : " + status,
        });
      }

      const connectionRequest = await ConnectionRequstModel.findOne({
        _id: requestId,
        toUserId: loggedUserId,
        status: "interested",
      });

      if (!connectionRequest) {
        return res.status(404).json({
          message: "No pending connection request found from this user",
        });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      res.status(200).json({
        message: "Connection request reviewed successfully",
        data,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error while reviewing connection request " + error.message,
      });
    }
  },
);

module.exports = requestRouter;
