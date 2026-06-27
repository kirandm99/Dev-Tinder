const express = require("express");

const app = express();

app.use("/namaste", (req, res) => {
  res.send("namaste World");
});

app.use("/test", (req, res) => {
  res.send("test World");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
