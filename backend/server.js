const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDb = require('./db');

// .env config
require('dotenv').config({ path: './config/.env' });

// Connect DB
const port = process.env.PORT || 5000;
const uriDb = process.env.ATLAS_URI;
connectDb(uriDb);

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
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
