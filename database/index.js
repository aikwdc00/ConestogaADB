// FU-TING, LI, Student No: 8819152

require('dotenv').config()
const mongoose = require('mongoose');

module.exports = mongoose.connect(process.env.MONGODB_URI)