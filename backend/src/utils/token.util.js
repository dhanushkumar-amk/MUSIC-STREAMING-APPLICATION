import jwt from "jsonwebtoken";

/* Create Access Token */
export const generateAccessToken = userId => {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
      issuer: "spotichat-auth",
      audience: "spotichat-users"
    }
  );
};

/* Create Refresh Token */
export const generateRefreshToken = userId => {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
      issuer: "spotichat-auth",
      audience: "spotichat-users"
    }
  );
};

/* Verify Refresh Token safely */
export const verifyRefreshToken = token => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    return null;
  }
};
