const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        date: {
            type: String,
            required: true,
        }
    },
    {timestamps: true}
);

module.exports = mongoose.model("Book", BookSchema);
