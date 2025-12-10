import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer: "spotichat-auth",
      audience: "spotichat-users"
    });

    req.userId = decoded.sub;
    req.token = token;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

export default authMiddleware;
