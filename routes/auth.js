const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const router = require('express').Router();
const CryptoJS = require("crypto-js");
const User = require("../models/User");
const Questions = require("../models/Questions");
const {
    verifyToken
} = require('./verify');


/* ---->  Crypto functions  <---------------------------------- */

function Encrypt(pass, key) {
    const encJson = CryptoJS.AES.encrypt(JSON.stringify(pass), key).toString();
    let encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson))
    return encData;
};

function Decrypt(pass, key) {
    const decData = CryptoJS.enc.Base64.parse(pass).toString(CryptoJS.enc.Utf8);
    const bytes = CryptoJS.AES.decrypt(decData, key).toString(CryptoJS.enc.Utf8);
    return JSON.parse(bytes);
};

/* ---->  Register a new user if lost password  <---------------------------------- */

/* router.post("/register", async (req, res) => {
    if(!User.find()){
        return res.status(403).json("You can not register a new admin")
    }else {

    
    const newUser = new User({
        username: req.body.username,
        password: Encrypt(req.body.password, process.env.PASS_SECRET),
    });
    try {
        const savedUser = await newUser.save();
        const accessToken = jwt.sign({
            id: savedUser._id,
        },
        process.env.JWT_SECRET,
        {expiresIn:("1h")}
        );
        return res.status(201).json({savedUser, accessToken});
    }catch (err) {
        return res.status(500).json(err);
    }
    }
}); */

/* ---->  Login  <---------------------------------- */

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.body.username
        });
        if (!user) {
            return res.status(401).json("Wrong credentials");
        } else {
            const decryptedPassword = Decrypt(user.password, process.env.PASS_SECRET);
            if (decryptedPassword !== req.body.password) {
                return res.status(401).json("Wrong credentials");
            } else {
                const accessToken = jwt.sign({
                        id: user._id,
                    },
                    process.env.JWT_SECRET, {
                        expiresIn: "1h"
                    }
                );
                return res.status(200).json(accessToken);
                /* .cookie("token", `${accessToken}`, {
                    domain: "http://10.0.0.252:3000",
                    path: "/",
                    httpOnly: true,
                    maxAge: (1000 * 60 * 30),
                    sameSite: "None",
                    secure: false
                })
                .header("withCredentials", "true")
                .header("Access-Control-Allow-Credentials", "true")
                .header("Access-Control-Allow-Origin", "http://10.0.0.252:3000")
                .send(); */
            };
        };
    } catch (err) {
        return res.status(500).json(err);
    };
});

router.post("/verifytoken", verifyToken, async (req, res) => {
    res.status(200).json("authenticated");
});


router.post("/lostpassword", async (req, res) => {
    const realAnswers = await Questions.find();
    const answers = req.body.answers;
    const goodAns = realAnswers.every((answer, i) => {
        const strAnswer = Decrypt(answer, PASS_SECRET);
        if (strAnswer === answers[i]) {
            return true;
        } else {
            return false;
        };
    });
    if (goodAns) {
        return res.status(200).json("Good answers");
    }
});


module.exports = router;