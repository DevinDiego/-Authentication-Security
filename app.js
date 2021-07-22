//********** REQUIRES ****************/
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//************* MONGO | MONGOOSE CONNECTION ******************
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/********** USER SCHEMA | MODEL *****************/
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

/**** ENCRYPTION BEFORE MODEL *****************/
userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
});

const User = mongoose.model("User", userSchema);

/***** LISTEN PORT 3000 ****/
app.listen(3000, () => {
  console.log("Port 3000");
});

/********* GET HOME ***********/
app.get("/", (req, res) => {
  res.render("home", {
    title: "Home",
  });
});

/********* GET LOG IN ***********/
app.get("/login", (req, res) => {
  res.render("login", {
    title: "Log In",
  });
});

/********* GET REGISTER ***********/
app.get("/register", (req, res) => {
  res.render("register", {
    title: "Register",
  });
});

/********* POST REGISTRATION ***********/
app.post("/register", (req, res) => {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password,
  });
  newUser
    .save()
    .then((result) => {
      res.render("secrets", {
        title: "Secrets",
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

/********* POST LOG IN ***********/
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({
    email: username,
  })
    .then((result) => {
      if (result && result.password === password) {
        res.render("secrets", {
          title: "Secrets",
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
