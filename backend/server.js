const express = require('express');
const cors = require('cors');
const connectDb = require('./db');

require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;
const uriDb = process.env.ATLAS_URI;
connectDb(uriDb);

app.use(cors());
app.use(express.json());

const usersRouter = require('./routes/users');
const screamsRouter = require('./routes/screams');

app.use('/users', usersRouter);
app.use('/screams', screamsRouter);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
