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
const { hash, compare } = require("bcryptjs");


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

// importing the helper functions
const {
    createAccessToken,
    createRefreshToken,
    sendAccessToken,
    sendRefreshToken,

} = require("../utils/tokens");

// Sign in request
router.post("../signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user already exists

    const user = await User.findOne ({ email: email});

    // if user does not exist, return error

    if (!user)
    return res.status(500).json ({
        message: "User doesn't exist!",
        type: "error",
    });

    // 2. if user exists, check if the password is correct
    const isMatch = await compare(password, user.password);

    // if password is incorrect, return error

    if (!isMatch) 
    return res.status(500).json({
        message: "Password is incorrect!",
        type: "error",
    });

    // 3. if the password is correct, create the tokens
    const accessToken = createAccesToken(user._id);
    const refreshToken = createRefreshToken(user._id);

    // 4. put refresh token in database
    user.refreshtoken = refreshToken;
    await user.save();

    // 5. send the response
    sendRefreshToken(res, refreshToken);
    sendAccessToken(req, res, accessToken);
    } catch (error) {
        res.status(500).json({
            type: "error",
            message: "An error occurred while signing in.",
            error,
        });
    }
});

// Sign out request
router.post("/logout", (_req, res) => {
    // clear cookies
    res.clearCookie("refreshtoken");
    return res.json({
        message: "Logged out successfully.",
        type: "success",
    });
});