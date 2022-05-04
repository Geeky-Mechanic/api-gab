const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        lname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        subj: {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            required: true,
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model("Contact", ContactSchema);