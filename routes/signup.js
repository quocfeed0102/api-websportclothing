const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
var userModel = require("../models/users");
const multer = require("multer");

router.post("/", multer().none(), (req, res, next) => {
  var message = {};
  var username = req.body.u;
  var email = req.body.e;
  var phone = req.body.p;
  var password = req.body.pw;
  var repassword = req.body.rpw;
  var name = req.body.n;
  var role = req.body.role;
  //check password & repassword

  if (password !== repassword) {
    message.repassword = "not matched";
  } else if (password.trim() === "") {
    message.repassword = "password null!!!";
  } else {
    console.log("repassword matched");

    console.log("body: " + JSON.stringify(req.body));

    const random = (length = 8) => {
      // Declare all characters
      let chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      // Pick characers randomly
      let str = "";
      for (let i = 0; i < length; i++) {
        str += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return str;
    };

    userModel
      .find({
        $or: [
          { "account.username": username },
          { email: email },
          { phone: phone },
        ],
      })
      .exec()
      .then((user) => {
        if (user.length >= 1) {
          user.forEach((item) => {
            console.log("username: " + item.account.username);
            if (item.account.username === username) {
              message.username = "exists";
            }
          });
          user.forEach((item) => {
            if (item.phone === phone) {
              message.phone = "exists";
            }
          });
          user.forEach((item) => {
            if (item.email === email) {
              message.email = "exists";
            }
          });
          res.status(409).json(message);
        } else {
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err,
              });
            } else {
              const user = new userModel({
                _id: new mongoose.Types.ObjectId(),
                id: random(30),
                name: name,
                phone: phone,
                email: email,
                gender: "",
                age: "",
                address: "",
                linkAvt: "",
                account: {
                  username: username,
                  password: hash,
                  role: role,
                  status:"active",
                  created_at: new Date().toLocaleDateString("en-US"),
                },
                wishList: [],
                cart: [],
                ordered: [],
              });
              user
                .save()
                .then((result) => {
                  console.log(result);
                  res.status(201).json({
                    status: "User created",
                  });
                })
                .catch((err) => {
                  console.log("error: " + err);
                  res.status(500).json({
                    error: err,
                  });
                });
            }
          });
        }
      });
  }
});

module.exports = router;
