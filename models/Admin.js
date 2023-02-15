const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  tokens: [{ type: Object }],
});

const Admin = mongoose.model("admin", adminSchema);

module.exports = Admin;
