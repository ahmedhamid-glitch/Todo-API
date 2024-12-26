const { Router } = require("express");
const User = require("../models/user"); // Adjust the path if necessary
const nodemailer = require("nodemailer");
const { authenticate } = require("../middlewares/authentication");
const router = Router();

// User Signup Route
router.post("/signup", async (req, res) => {
  const { name, email, password, recoverGmail } = req.body;
  const user = new User({ name, email, password, recoverGmail });
  if (!user) {
    res.status(400).json({ message: "Error creating user" });
  }
  try {
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ message: "Error creating user" });
  }
});

// User Login Route
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({ message: "Invalid User or Password" });
    }

    // Set a secure cookie
    res
      .status(200)
      .cookie("userId", user._id, {
        httpOnly: false, // Set to false to allow client-side access
        sameSite: "strict",
      })
      .json({
        message: "User logged in successfully",
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/recover", async (req, res) => {
  const { recoverGmail } = req.body;

  try {
    const user = await User.findOne({ recoverGmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const otp = Math.floor(Math.random() * 900000) + 100000; // Generate 6-digit OTP
    const otpExpiry = new Date(Date.now() + (1 * 60 + 3) * 1000);
    // Set expiry to 15 minutes from now

    user.otp = otp;
    user.otpExpiry = otpExpiry;

    // Save the updated user data
    await user.save();

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Use your email service provider
      auth: {
        user: "ahmedhamid8250@gmail.com", // Replace with your email
        pass: "lbvq kdky uzgy noxl", // Replace with your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: "ahmedhamid8250@gmail.com", // Sender email address
      to: recoverGmail, // Recipient email address
      subject: otp,
      text: `Your OTP code is ${otp}. It will expire in 15 minutes.`, // Email body text
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
});

router.post("/user", authenticate, async (req, res) => {
  const { userId } = req.body; // Extract userId from the request body
  console.log(userId, "bUserId");

  try {
    // Find user in the database using userId
    const user = await User.findOne({ _id: userId }); // Assuming `userId` matches the `_id` field

    console.log("dbUserId", user.user);

    if (!user) {
      return res.status(404).json({ message: "User not found" }); // Return error if user doesn't exist
    }

    // If user exists, send success response
    res.status(200).json({
      message: "User found",
      user, // Optional: Include user details in the response
    });
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ message: "Internal server error" }); // Handle server errors
  }
});

router.post("/checkotp", async (req, res) => {
  const { otp } = req.body;

  try {
    const user = await User.findOne({ otp });
    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP has expired
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Clear OTP and expiry after successful validation
    user.otp = undefined;
    user.otpExpiry = undefined;

    // Save the updated user data
    await user.save();

    res.status(200).json({
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
});

router.get("/checkotp", async (req, res) => {
  const { recoverGmail } = req.query; // Fetch recoverGmail from query params

  try {
    const user = await User.findOne({ recoverGmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    res.status(200).json({ otpExpiry: user.otpExpiry }); // Send OTP expiry time
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again." });
  }
});

router.patch("/gmail/:recoverGmail", async (req, res) => {
  const { password } = req.body; // Get the password from the request body
  const { recoverGmail } = req.params; // Get the recoverGmail from the route params

  try {
    // Find user by recoverGmail
    const user = await User.findOne({ recoverGmail });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Update the user's password (Hashing recommended for security)
    user.password = password; // Replace with a hashed version: e.g., bcrypt.hash(password, saltRounds)
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong", error: err.message });
  }
});

module.exports = router;
