const jwt = require('jsonwebtoken');

const roommiddleware = (req, res, next) => {
  try {
    console.log("AUTH HEADER:", req.headers.authorization); // 👈 add this

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("❌ No token received");
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN:", token); // 👈 add this

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED:", decoded); // 👈 add this

    req.user = decoded;

    next();
  } catch (err) {
    console.log("❌ JWT ERROR:", err.message); // 👈 IMPORTANT
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = roommiddleware;