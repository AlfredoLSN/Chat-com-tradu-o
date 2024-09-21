const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    users: { type: [String], default: [] },
});

const Room = mongoose.model("Room", roomSchema);

module.exports = Room;
