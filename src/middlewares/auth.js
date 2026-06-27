const adminAuthentication = (req, res, next) => {
  const token = "xyz123";
  const isAuthenticated = token === "xyz123";

  if (!isAuthenticated) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  console.log("Admin authenticated successfully");
  next();
};

module.exports = { adminAuthentication };
