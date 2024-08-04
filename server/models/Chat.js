const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  isQuote: { type: Boolean, default: false }
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [messageSchema]
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
