const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    recoverGmail: {
      type: String,
      required: true,
      unique: true,
    },
    // Other fields...
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
