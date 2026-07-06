const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "Please Login!" });
    }

    const decodedToken = jwt.verify(token, "DEV@Tinder$636428");
    const userId = decodedToken.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error authenticating user :" + error.message });
  }
};

module.exports = { userAuth };
