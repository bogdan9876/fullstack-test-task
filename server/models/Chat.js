const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  name: { type: String, required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [{
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Chat', chatSchema);
