var express = require("express"); 

var router = express.Router();

router.get("/", function (req, res) {
    // console.log("request", req)
    // console.log ("reponse", res)
    // sending the response

    res.send("Hello auth express!")
});

module.exports = router;
