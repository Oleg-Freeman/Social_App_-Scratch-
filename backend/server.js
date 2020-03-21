const express = require('express');
const app = express();

const cors = require('cors');
const connectDb = require('./db');
// const session = require('express-session');
const passport = require('passport');
// const cookieSession = require('cookie-session');
// const cookieParser = require('cookie-parser');

require('dotenv').config({ path: './config/.env' });

// Passport Config
const initializePassport = require('./config/passport-config');
initializePassport(passport);

const port = process.env.PORT || 5000;
const uriDb = process.env.ATLAS_URI;
connectDb(uriDb);

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET,
//     resave: false, // true
//     saveUninitialized: false // true
//   })
// );
// app.use(cookieParser());
// app.use(cookieSession({
//   // maxAge: 60 * 60 * 1000,
//   name: 'userSession',
//   // path: '/',
//   keys: [process.env.COOKIE_KEY]
// }));

// Passport middleware
app.use(passport.initialize());
// app.use(passport.session());

app.use(cors());
app.use(express.json());

const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');
const likesRouter = require('./routes/likes');
const notificationsRouter = require('./routes/notifications');

app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/likes', likesRouter);
app.use('/notifications', notificationsRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
