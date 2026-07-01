const express = require("express");
const { userAuth } = require("../middlewares/auth");
const requestRouter = express.Router();

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

module.exports = requestRouter;
