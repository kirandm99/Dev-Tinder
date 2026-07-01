const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditFieldsData } = require("../utils/validator");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res
      .status(200)
      .json({ message: "User profile fetched successfully", user });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error fetching user profile :" + error.message });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditFieldsData(req)) {
      throw new Error("Invalid edit fields");
    }
    const user = req.user;
    Object.keys(req.body).forEach((key) => {
      user[key] = req.body[key];
    });
    await user.save();
    res.status(200).json({
      message: `${user.firstName} your profile updated successfully`,
      data: user,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating user profile :" + error.message });
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { oldPassword, newPassword } = req.body;

    const isMatch = await user.validatePassword(oldPassword);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    res
      .status(200)
      .json({
        message: `${user.firstName} your password updated successfully`,
      });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating user password :" + error.message });
  }
});

module.exports = profileRouter;
