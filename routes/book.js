const Book = require('../models/Book');
const dotenv = require('dotenv');
dotenv.config();
const dayjs = require('dayjs');

const router = require('express').Router();

/* --->  Create a new booking  <--- */

router.post("/", async (req,res) => {
    console.log(res.body);
    const newBooking = new Book(req.body);

    try{
        const savedBooking = await newBooking.save();
        return res.status(200).json(savedBooking);
    }catch(err){
        return res.status(500).json(err);
    }
});

/* --->  GET all bookings  <--- */

router.get("/", async (req,res) => {
    try {
        const bookings = await Book.find();
        return res.status(200).json(bookings);
    } catch(err) {
        return res.status(500).json(err);
    }
});

/* --->  Get all booking beginning and ending hours  <--- */

router.get("/hours", async (req,res) => {
    try {
        const bookings = await Book.find();
        const begHours = bookings.forEach((booking)=> {
            console.log(booking.date);
            return booking;
        });
        return res.status(200).json(bookings);
    } catch(err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

module.exports = router;