const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const User = require("../models/user");

const socketAuth = async (socket, next) => {
  try {
    // Read cookies sent during the WebSocket handshake
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");

    const token = cookies.token;

    if (!token) {
      return next(new Error("Authentication Failed"));
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optional: verify user still exists
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new Error("User not found"));
    }

    // Attach authenticated user to socket
    socket.user = user;

    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
};

module.exports = socketAuth;
