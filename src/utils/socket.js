const socket = require("socket.io");
const Crypto = require("crypto");
const socketAuth = require("../middlewares/socketAuth");
const ConnectionRequest = require("../models/connectionRequest");
const { Chat } = require("../models/chat");

const getSecretRoomId = (userId, targetUserId) => {
  return Crypto.createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.use(socketAuth);

  io.on("connection", (socket) => {
    socket.on("joinChat", async ({ targetUserId, firstName }) => {
      const userId = socket.user._id;
      const connection = await ConnectionRequest.findOne({
        $or: [
          {
            fromUserId: userId,
            toUserId: targetUserId,
            status: "accepted",
          },
          {
            fromUserId: targetUserId,
            toUserId: userId,
            status: "accepted",
          },
        ],
      });

      if (!connection) {
        return;
      }
      const uniqueRoomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " Joined Room using Id :" + uniqueRoomId);
      socket.join(uniqueRoomId);
    });

    socket.on("sendMessage", async ({ targetUserId, firstName, text }) => {
      try {
        if (!text?.trim()) {
          return;
        }

        if (text.length > 1000) {
          return;
        }

        const userId = socket.user._id;
        const uniqueRoomId = getSecretRoomId(userId, targetUserId);
        console.log(firstName + " " + text);

        let chat = await Chat.findOne({
          participants: { $all: [userId, targetUserId] },
        });

        if (!chat) {
          chat = new Chat({
            participants: [userId, targetUserId],
            messages: [],
          });
        }

        chat.messages.push({
          senderId: userId,
          text,
        });

        await chat.save();
        io.to(uniqueRoomId).emit("messageReceived", { firstName, text });
      } catch (err) {
        console.error(err);
      }
    });

    socket.on("disconect", () => {});
  });
};

module.exports = initializeSocket;
