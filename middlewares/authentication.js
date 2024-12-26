const User = require("../models/user");

const authenticate = async (req, res, next) => {
  let userId = req.cookies?.userId; // Optional chaining for safety in case cookies is undefined

  try {
    // Check if userId cookie is present
    if (!userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized access: No userId cookie" });
    }

    const user = await User.findById(userId); // Find user by userId in database
    console.log("🚀 ~ authenticate ~ user:", user);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized access: User not found" });
    }

    // Attach userId to the request object for subsequent handlers
    req.user = userId;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error(err);
    res.json({ message: "Unauthorized access: No userId cookie" });
  }
};

module.exports = {
  authenticate,
};

