const Contact = require('../models/Contact');
const dotenv = require('dotenv');
dotenv.config();

const router = require('express').Router();

/* --->  Create a new booking  <--- */

router.post("/", async (req,res) => {
    console.log(req.body);
    const newContact = new Contact(req.body);

    try{
        const savedContact = await newContact.save();
        return res.status(200).json(savedContact);
    }catch(err){
        return res.status(500).json(err);
    }
});

/* --->  GET all bookings  <--- */

router.get("/", async (req,res) => {
    try {
        const messages = await Contact.find();
        return res.status(200).json(messages);
    } catch(err) {
        return res.status(500).json(err);
    }
});


module.exports = router;