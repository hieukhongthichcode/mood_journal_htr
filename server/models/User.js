const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,            
  username: String,          
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar:   { type: String }, 
});

module.exports = mongoose.model('User', UserSchema);
