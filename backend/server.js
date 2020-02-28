const express = require('express');
const app = express();

const cors = require('cors');
const connectDb = require('./db');
const session = require('express-session');
const passport = require('passport');
// const flash = require('express-flash');

require('dotenv').config({ path: './config/.env' });

// Passport Config
const initializePassport = require('./config/passport-config');
initializePassport(passport);

const port = process.env.PORT || 5000;
const uriDb = process.env.ATLAS_URI;
connectDb(uriDb);

// app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // true
    saveUninitialized: false // true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(cors());
app.use(express.json());

const usersRouter = require('./routes/users');
const screamsRouter = require('./routes/screams');
const commentsRouter = require('./routes/comments');
const likesRouter = require('./routes/likes');

app.use('/users', usersRouter);
app.use('/screams', screamsRouter);
app.use('/comments', commentsRouter);
app.use('/likes', likesRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
