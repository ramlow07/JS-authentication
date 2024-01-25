var express = require("express"); 

var router = express.Router();

router.get("/", function (req, res) {
    // console.log("request", req)
    // console.log ("reponse", res)
    // sending the response

    res.send("Hello auth express!")
});

module.exports = router;



const userModel = require ('../models/user.js');
const { hash } = require("bcryptjs");


// importing the user model
const User = require ("../models/user.js");

// Sign Up request
router.post("/signup", async (req, res) => {
    try {
        const {email, password} = req.body;
        // check if the user already exists
        const user = await User.findOne({ email: email});

        // if user already exists, return error

        if (user)
        return res.status(500).json({
            message: "User already exists. Try logging in or change your user to create a new one.",
            type: "warning",

        });

        // 2. if user does not exist, create a new one
        // hashing the password

        const passwordHash =  await hash(password, 10);
        const newUser = new User({
            email: email,
            password: passwordHash,
        });

        // 3. saving the user to the database
        await newUser.save();

        // 4. send the response 
        res.status(200).json({
            message: "User created sucessfully. Try logging in",
            type: "success",
        });
    } catch (error) {
        res.status(500).json({
            type: "error",
            message: "Error creating user! Try again.",
            error
        });
    }
});

module.exports = router;
