import jwt from "jsonwebtoken";
import config from "../config";

const getAdminJwtToken = (admin_id: string, email: string, username: string) => {
  const token = jwt.sign(
    {
      id: admin_id,
      email,
      name: username,
      type: "admin",
    },
    config.JWT_SECRET,
    {
      expiresIn: parseInt(config.JWT_EXPIRY),
    }
  );
  const data = {
    email,
    username,
    admin_id,
  };
  return { token, data };
};

const getUserJwtToken = (user_id: string, email: string) => {
  const token = jwt.sign(
    {
      id: user_id,
      email,
      type: "user",
    },
    config.JWT_SECRET,
    {
      expiresIn: parseInt(config.JWT_EXPIRY),
    }
  );
  const data = {
    user_id,
    email,
  };
  return { token, data };
};

export { getAdminJwtToken, getUserJwtToken };
