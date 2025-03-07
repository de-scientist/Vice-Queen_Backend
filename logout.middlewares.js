export const tokenBlacklist = new Set();

// Middleware to check if the token is blacklisted
export const checkTokenBlacklist = async (req, reply) => {
  const token = req.cookies.token;

  if (!token) {
    return reply.status(400).send({ error: "Token is missing" });
  }

  if (tokenBlacklist.has(token)) {
    return reply.status(401).send({ error: "Token has been revoked" });
  }
};
