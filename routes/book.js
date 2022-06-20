const Book = require('../models/Book');
const dotenv = require('dotenv');
dotenv.config();
const router = require('express').Router();
const {
    verifyToken
} = require('./verify');

/* ---->  Create a new booking  <---------------------------------- */

// fix this
router.post("/", async (req, res) => {
    const name = req.body.name;
    const lastName = req.body.lName;
    const email = req.body.email;
    const phoneNumber = req.body.phone;
    const begDate = req.body.date;
    const begH = new Date(begDate);
    const endHour = new Date(begDate).setHours(begH.getHours() + 2);
    if (!(await between(begDate)) && !tooEarly(begDate) && !tooLate(begDate)) {
        try {
            const newBooking = new Book({
                name,
                lastName,
                email,
                phoneNumber,
                begHour: begH.getTime(),
                endHour,
                completed: false,
                confirmed: false,
            });
            const savedBooking = await newBooking.save();
            return res.status(200).json(savedBooking);
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    } else {
        res.status(403).json(!(await between(begDate)) + " " + !tooEarly(begDate) + " " + !tooLate(begDate))
    }
});

/* --->  validate post query  <--- */

async function between(newBook) {
    const bookingDate = new Date(newBook).getTime();
    const data = await Book.find();
    return data.some(obj => {
        const begDate = new Date(obj.begHour).getTime();
        const endDate = new Date(obj.endHour).getTime();
        return bookingDate > begDate && bookingDate < endDate;
    });
};

function tooEarly(newBook) {
    const bookingDate = new Date(newBook);
    return bookingDate.getUTCHours() < 12;
};

function tooLate(newBook) {
    const bookingDate = new Date(newBook);

    return bookingDate.getUTCHours() > 19;
};

/* ---->  Get all booking beginning and ending hours  <---------------------------------- */

router.get("/hours", async (req, res) => {
    try {
        const bookings = await Book.find();
        const begHours = bookings.map((b) => {
            return new Date(JSON.parse(b.begHour));
        });
        return res.status(200).json(begHours);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

/* ---->  GET all upcoming bookings  <---------------------------------- */

router.get("/", verifyToken, async (req, res) => {
    try {
        const bookings = await Book.find();
        return res.status(200).json(bookings);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

/* ---->  FUTURE  <---------------------------------- */

router.get("/stats/future", verifyToken, async (req, res) => {
    try {
        const projection = req.headers.projection ? JSON.parse(req.headers.projection) : {};
        const skipNum = req.headers.skip || 0;

        const bookings = await Book.find({
            begHour: {
                $gte: new Date().getTime(),
            }
        }).sort({
            begHour: 1
        }).select(projection).skip(skipNum).limit(10);

        const upcomingBookings = bookings;

        const unconfirmed = bookings.filter((b) => {
            return !b.confirmed;
        });

        return res.status(200).json({
            upcomingBookings,
            unconfirmed
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

/* ---->  PAST  <---------------------------------- */

router.get("/stats/past", verifyToken, async (req, res) => {
    try {
        //query projection to limit info
        const projection = req.headers.projection ? JSON.parse(req.headers.projection) : {};
        const skipNum = req.headers.skip || 0;
        const date = new Date().getTime();

        const compBookings = await Book.find({
            begHour: {
                $lte: date
            },
            completed: true
        }).sort({
            begHour: -1
        }).select(projection).skip(skipNum).limit(10);

        /*         const completedLastMonth = bookings.filter((b) => {
                    const begH = new Date(b.begHour);
                    if ((date.getMonth() - 1) === begH.getMonth() && b.completed) {
                        return b;
                    }
                });

                const completedThisMonth = bookings.filter((b) => {
                    const begH = new Date(b.begHour);
                    if (date.getMonth() === begH.getMonth() && b.completed) {
                        return b;
                    }
                });  */

        const missedBookings = await Book.find({
            begHour: {
                $lte: date
            },
            completed: false
        }).sort({
            begHour: -1
        }).select(projection).skip(skipNum).limit(10);

        return res.status(200).json({
            completedBookings: compBookings,
            missed : missedBookings
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

/* ---->  STATS  <---------------------------------- */

router.get("/stats/number", verifyToken, async (req, res) => {
    try {
        const bookings = async (query) => await Book.countDocuments(query);

        //get the total number of completed bookings
        const completedBookings = await bookings({
            completed: true
        });

        //get the number of bookings which were done in the last calendar month
        const lastMonthFirstDay = new Date().setUTCMonth(new Date().getUTCMonth() - 1, 1);
        const lastMonthLastDay = new Date().setUTCDate(0);

        const completedLastMonth = await bookings({
            completed: true,
            begHour: {
                $gte: lastMonthFirstDay,
                $lte: lastMonthLastDay,
            },
        });

        //get the number of bookings which were done during this calendar month
        const thisMonthFirstDay = new Date().setUTCDate(1);
        const completedThisMonth = await bookings({
            completed: true,
            begHour: {
                $gte: thisMonthFirstDay,
            },
        })

        const now = new Date().getTime();

        //get number of bookings that were not completed
        const missed = await bookings({
            completed: false,
            begHour: {
                $lte: now
            }
        });

        //get number of bookings that are coming
        const upcomingBookings = await bookings({
            begHour: {
                $gte: now,
            },
        });

        //get the number of upcoming bookings that still need confirmation
        const unconfirmed = await bookings({
            begHour: {
                $gte: now,
            },
            confirmed: false,
        });

        return res.status(200).json({
            completedBookings,
            completedThisMonth,
            completedLastMonth,
            missed,
            upcomingBookings,
            unconfirmed
        });
    } catch (err) {
        return res.status(500).json(err)
    }
});

router.get("/:id", verifyToken, async (req, res) => {
    try {
        const booking = await Book.findById(req.params.id);
        return res.status(200).json(booking);
    } catch (err) {
        return res.status(500).json(err);
    }
});

/* ---->  Change booking statuses  <---------------------------------- */

/* --->  Confirm booking  <--- */
router.post("/confirm", verifyToken, async (req, res) => {

    try {
        const updated = await Book.findOneAndUpdate({
            _id: req.body.id,
        }, {
            confirmed: true
        }, {
            new: true
        });
        return res.status(200).json(updated);
    } catch (err) {
        return res.status(500).json(err);
    }
});

/* --->  Mark booking as completed  <--- */
router.post("/completed", verifyToken, async (req, res) => {
    console.log(req.body.id);
    try {
        const updated = await Book.findOneAndUpdate({
            _id: req.body.id,
        }, {
            completed: true
        }, {
            new: true
        });
        console.log(updated);
        return res.status(200).json(updated);
    } catch (err) {
        console.log(err);
        return res.status(500).json(err);
    }
});

module.exports = router;