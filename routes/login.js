//login sẽ gom vào router users luôn - bây giờ đang tách cho dễ code
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var userModel = require("../models/users");
const multer = require("multer");

//method post - login
router.post("/", multer().none(), (req, res, next) => {
  var username = req.body.u;
  var password = req.body.p;
  console.log("username: " + username + " password: " + password);
  userModel
    .find({ "account.username": username })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "NOT FOUND USER",
        });
      } else if (password !== user[0].account.password) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      // } else {
      //   bcrypt.compare(password, user[0].account.password, (err, result) => {
      //     if (err) {
      //       return res.status(401).json({
      //         message: "Error Decode",
      //       });
      //     }
      //     if (result) {
      //       const token = jwt.sign(
      //         {
      //           email: user[0].email,
      //           userId: user[0]._id,
      //         },
      //         process.env.JWT_KEY,
      //         {
      //           expiresIn: "1h",
      //         }
      //       );
      //       return res.status(200).json({
      //         message: "Auth successful",
      //         token: token,
      //       });
      //     }
      //     res.status(401).json({
      //       message: "Auth failed",
      //     });
      //   });
      // }
      else {
        res.status(200).json({
          message: "Auth successful",
          role: user[0].account.role,
          username: user[0].account.username,
          avatar: "daylalinkimage",
          email: user[0].email,
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({ error: err });
    });
});

module.exports = router;
