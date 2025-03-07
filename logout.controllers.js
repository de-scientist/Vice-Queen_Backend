import { tokenBlacklist } from "../middlewares/logout.middlewares.js";

export const logout = async (req, reply) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return reply.status(400).send({ error: "Token is missing" });
    }

    // Add the token to the blacklist
    tokenBlacklist.add(token);

    // Clear the cookie
    reply.clearCookie("token");

    return reply.status(200).send({ message: "Logout successful" });
  } catch (error) {
    return reply.status(500).send({ error: error.message });
  }
};
