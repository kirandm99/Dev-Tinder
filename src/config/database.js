const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://kirandm1947:Wx2yE69ekXuimapZ@cluster0.dszxevr.mongodb.net/dev_tinder",
  );
};

module.exports = connectDB;
