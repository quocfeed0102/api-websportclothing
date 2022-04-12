//login sẽ gom vào router users luôn - bây giờ đang tách cho dễ code
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var userModel = require("../models/users");

//method post - login
router.post("/", (req, res, next) => {
  userModel
    .find({ "account.username": req.query.u })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed",
        });
      } else if (req.query.p !== user[0].account.password) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }

      // bcrypt.compare("123", "123", (err, result) => {
      //   if (err) {
      //     console.log("2");
      //     return res.status(401).json({
      //       message: "Auth failed",
      //     });
      //   }
      //   if (result) {
      //     console.log("3");
      //     const token = jwt.sign(
      //       {
      //         email: user[0].email,
      //         userId: user[0]._id,
      //       },
      //       process.env.JWT_KEY,
      //       {
      //         expiresIn: "1h",
      //       }
      //     );
      //     return res.status(200).json({
      //       message: "Auth successful",
      //       token: token,
      //     });
      //   }
      //   console.log("4");
      //   res.status(401).json({
      //     message: "Auth failed",
      //   });
      // });
      else {
        return res.status(200).json({
          message: "Auth successful",
          role: user[0].account.role,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
