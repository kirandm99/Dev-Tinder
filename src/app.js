const express = require("express");
const connectDB = require("./config/database");
const { adminAuthentication } = require("./middlewares/auth");
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validator");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

const app = express();

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

app.get("/user", async (req, res) => {
  const emailId = req.body.email;
  try {
    const users = await User.find({ emailId: emailId });
    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    } else {
      res.status(200).json(users);
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
});

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching feeds", error });
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete({ _id: userId });
    // await User.findByIdAndDelete(userId);
    res.send("User Deleted Successfully");
  } catch (err) {
    res.status(500).json({ message: "Error while deleting user", error });
  }
});

app.patch("/user/:userId", async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    const ALLOWED_UPDATES = ["skills", "about", "photoUrl", "age", "gender"];
    const isUpdateAllowed = Object.keys(data).every((key) =>
      ALLOWED_UPDATES.includes(key),
    );

    if (!isUpdateAllowed) {
      throw new Error(
        "Update not allowed. You can only update skills, about, photoUrl, age, and gender",
      );
    }

    if (data?.skills.length > 10) {
      throw new Error("You can only add a maximum of 10 skills");
    }

    const user = await User.findByIdAndUpdate({ _id: userId }, data);
    //  const user = await User.findByIdAndUpdate(userId, data,{ new:true, runValidators: true});
    res.status(200).json({ message: "User Updated Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error while updating user", error });
  }
});

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(7777, () => {
      console.log("Server is running on port 7777");
    });
  })
  .catch((err) => {
    console.log("Error connecting to database", err);
  });
