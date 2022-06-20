const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

/* --->  Routes  <--- */

const bookRoute = require('./routes/book');
const contactRoute = require('./routes/contact');
const authRoute = require('./routes/auth');
/* --->  DB connection  <--- */

mongoose.connect(process.env.MONGO_URL)
.then(() => console.log("Connected to DB"))
.catch((err) => console.log(err));

/* --->  Deps  <--- */
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use("/api/book", bookRoute);
app.use("/api/contact", contactRoute);
app.use("/api/auth", authRoute);

/* --->  Setup  <--- */

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`server started on port : ${port}`);
});