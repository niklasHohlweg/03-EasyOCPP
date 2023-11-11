const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const dbUrl = process.env.db;

mongoose.connect(dbUrl);


changeLog = new mongoose.Schema({
    MessageTypeId: Number,
    UniqueId: String,
    Action: String,
    Payload: Object,
    Timestamp: String
});

var chargeLogs = mongoose.model("ChargeLog", changeLog);

module.exports = chargeLogs;