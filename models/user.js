const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
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
  return `${this.firstname} ${this.lastname}`;
});

userSchema.virtual("url").get(function () {
  return `/users/${this._id}`;
});

const User = mongoose.model("User", userSchema);

module.exports = User;
