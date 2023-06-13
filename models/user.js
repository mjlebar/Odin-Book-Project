const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  userName: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  password: { type: String, required: true },
  friends: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  friendRequests: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  sentRequests: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
});

userSchema.virtual("fullname").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual("url").get(function () {
  return `/users/${this._id}`;
});

const User = mongoose.model("User", userSchema);

module.exports = User;
