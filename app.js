const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();
const populate = require("./seeds");
const compression = require("compression");
const helmet = require("helmet");

// these will route all http requests on this server
const indexRouter = require("./routes/index");
const friendRequestRouter = require("./routes/friendRequest");
const acceptRequestRouter = require("./routes/acceptRequest");
const postsRouter = require("./routes/posts");
const userRouter = require("./routes/users");

// Connect to mongoDB
const mongoose = require("mongoose");

const devDB = `mongodb+srv://lebarmj:${process.env.DB_PASS}@cluster0.jijk6nh.mongodb.net/?retryWrites=true&w=majority`;

const mongoDB = process.env.MONGODB_URI || devDB;
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// setting up all the tools our app needs to use
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// we need this one for passportJS
app.use(express.static(path.join(__dirname, "public")));
app.use(compression());
app.use(helmet());
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20,
});
// Apply rate limiter to all requests
app.use(limiter);

app.use("/", indexRouter);
app.use("/friend-request", friendRequestRouter);
app.use("/accept-request", acceptRequestRouter);
app.use("/posts", postsRouter);
app.use("/users", userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// populate();
// run function to  populate page

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
