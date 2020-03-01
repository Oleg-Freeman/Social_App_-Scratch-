/* eslint-disable promise/no-promise-in-callback */
const router = require('express').Router();
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const passport = require('passport');
// Image upload
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
// Validations
const {
  registerValidation,
  ensureAuthenticated,
  forwardAuthenticated,
  userDetailsValidation
} = require('../middlewares/validation');

require('dotenv').config({ path: './config/.env' });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + '_image');
  }
});

const imageFilter = function(req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter });

// Get all users from DB
router.route('/').get((req, res) => {
  User.find()
    .sort({ createdAt: -1 })
    .populate({
      path: 'posts',
      populate: {
        path: 'comments likes',
        populate: {
          path: 'likes'
        }
      }
    })
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Register new user
router.route('/register').post(async(req, res) => {
  // eslint-disable-next-line no-unused-vars
  const { email, password, password2, handle } = req.body;

  // Validate data
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  // Check if User Exists in DB
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).json('Email is already exists');

  const newUser = new User({ email, password, handle });

  // Hash password
  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(req.body.password, salt);
  try {
    await newUser.save();
    res.json('User added!');
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
  // newUser.save()
  //   .then(() => res.json('User added!'))
  //   .catch(err => res.status(400).json('Error: ' + err));
});

// Login
router.route('/login').post(forwardAuthenticated, (req, res, next) => {
// router.post('/login', isloggedIn, (req, res, next) => {
  // const { error } = isloggedIn(req.body);
  // if (error) return res.status(400).json(error.details[0].message);

  passport.authenticate('local', {
    successRedirect: '/posts',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.route('/logout').get((req, res) => {
  req.logout();
  // res.redirect('/users/login');
  res.json('Logged out');
});

// Get one user by ID
router.route('/:id').get((req, res) => {
  User.findById(req.params.id)
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Delete user
router.route('/:id').delete((req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.json('User deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// upload user profie image avatar
router.route('/image').post(ensureAuthenticated, upload.single('image'), function(req, res) {
  cloudinary.uploader.upload(req.file.path, function(error, result) {
    if (error) {
      return res.status(400).json('Error in image upload - ' + error);
    }
    else {
      User.findOneAndUpdate({ handle: req.user.handle }, { imageURL: result.secure_url })
        .then(() => res.json('Image uploaded!'))
        .catch(err => res.status(400).json('Error: ' + err));
    }
  });
});

// Add user details
router.route('/update/:id').post((req, res) => {
  const { error } = userDetailsValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  User.findById(req.params.id)
    .then(users => {
      if (('bio' in req.body) && (req.body.bio !== undefined)) {
        users.bio = req.body.bio;
      }
      if (('website' in req.body) && (req.body.website !== undefined)) {
        if (req.body.website.trim().substring(0, 4) !== 'http') {
          users.website = `http://${req.body.website.trim()}`;
        }
        else users.website = req.body.website;
      }
      if (('location' in req.body) && (req.body.location !== undefined)) {
        users.location = req.body.location;
      }
      if (('birthDay' in req.body) && (req.body.birthDay !== undefined)) {
        users.birthDay = req.body.birthDay;
      }

      return users.save();
    })
    .then(() => res.json('User updated!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
