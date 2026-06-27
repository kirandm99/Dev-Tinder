const express = require("express");
const connectDB = require("./config/database");
const { adminAuthentication } = require("./middlewares/auth");
const User = require("./models/user");

const app = express();

app.post("/signup", async (req, res) => {
  const user = new User({
    firstName: "Virat",
    lastName: "DM",
    emailId: "virat.dm@example.com",
    password: "password123",
    age: 30,
    gender: "Male",
  });

  try {
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error creating user", error });
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
