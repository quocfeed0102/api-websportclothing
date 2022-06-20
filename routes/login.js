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
        res.status(401).json({
          message: "NOT FOUND USER",
        });
      } else {
        bcrypt.compare(password.trim(), user[0].account.password, (err, result) => {
          if (err) {
            res.status(401).json({
              message: "Error Decode",
            });
          }

          if (result) {
            res.status(200).json({
              message: "Auth successful",
              id: user[0].id,
              role: user[0].account.role,
              username: user[0].account.username,
              linkAvt: user[0].linkAvt,
              email: user[0].email,
              status:"active"
            });
          } else
            res.status(401).json({
              message: "Auth failed",
            });
        });
      }

      // res.status(200).json({
      //   message: "Auth successful",
      //   id: user[0].id,
      //   role: user[0].account.role,
      //   username: user[0].account.username,
      //   linkAvt: user[0].linkAvt,
      //   email: user[0].email,
      // });
    })
    .catch((err) => {
      res.status(500).json({ error: err });
    });
});

module.exports = router;
