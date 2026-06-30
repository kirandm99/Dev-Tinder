const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 20,
    },
    lastName: {
      type: String,
      minLength: 2,
      maxLength: 20,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address");
        }
      },
    },
    password: {
      type: String,
      minLength: 8,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Password should be strong");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    photoUrl: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid URL for photo");
        }
      },
    },
    about: {
      type: String,
      minLength: 20,
      maxLength: 200,
      default: "Hey there! I am using DevTinder.",
    },
    skills: {
      type: [String],
      validate(value) {
        if (value.length > 10) {
          throw new Error("Skills array cannot have more than 10 skills.");
        }
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.getJwtToken = async function () {
  const user = this;
  const token = await jwt.sign({ userId: user._id }, "DEV@Tinder$636428", {
    expiresIn: "1d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordByUser) {
  const user = this;
  return await bcrypt.compare(passwordByUser, user.password);
};

module.exports = mongoose.model("User", userSchema);
