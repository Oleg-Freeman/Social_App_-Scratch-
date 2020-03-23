const express = require('express');
const app = express();
const cors = require('cors');
const connectDb = require('./db');
const session = require('express-session');
// const cookieSession = require('cookie-session');
// const cookieParser = require('cookie-parser');

require('dotenv').config({ path: './config/.env' });

const port = process.env.PORT || 5000;
const uriDb = process.env.ATLAS_URI;
connectDb(uriDb);

app.use(
  session({
    cookie: {
      maxAge: 1000 * 60 * 60 * 12, // 1000mS = 1 Second
      sameSite: true
    },
    name: 'sId',
    // path: '/*',
    secret: process.env.SESSION_SECRET,
    resave: false, // true
    saveUninitialized: false // true
  })
);
// app.use(cookieParser());
// app.use(cookieSession({
//   // maxAge: 60 * 60 * 1000,
//   name: 'userSession',
//   // path: '/',
//   keys: [process.env.COOKIE_KEY]
// }));

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

app.use((req, res, next) => {
  res.json('Page not found');
});

app.use((err, req, res, next) => {
  if (err) {
    res.status(500).json('Internal server error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
