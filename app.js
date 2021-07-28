//********** REQUIRES ****************/
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// const bcrypt = require("bcrypt");
// const saltRounds = 10;
//const md5 = require("md5");
//const encrypt = require("mongoose-encryption");

const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// SESSION *********************
app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

// PASSPORT *******************
app.use(passport.initialize());
app.use(passport.session());

//************* MONGO | MONGOOSE CONNECTION ******************
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

/********** USER SCHEMA *****************/
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// plugin passport to userSchema **********
userSchema.plugin(passportLocalMongoose);

/**** ENCRYPTION BEFORE MODEL *****************/

// userSchema.plugin(encrypt, {
//   secret: process.env.SECRET,
//   encryptedFields: ["password"],
// });

// USER MODEL **********************************
const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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

/*  GET SECRETS ********************/
app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets", {
      title: "Secrets",
    });
  } else {
    res.redirect("/login");
  }
});

/* GET LOGOUT ***************************/
app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

/********* POST REGISTRATION ***********/
app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    }
  );
});

/********* POST LOG IN ***********/
app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secrets");
      });
    }
  });
});
