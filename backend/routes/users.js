const router = require('express').Router();
const User = require('../models/user.model');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const bcrypt = require('bcrypt');
const passport = require('passport');
// Image upload
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
// Validations
const {
  registerValidation,
  ensureAuthenticated,
  loginValidation,
  // isloggedIn,
  // forwardAuthenticated,
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
router.route('/').get(async(req, res) => {
  try {
    await User.find()
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
      .exec((err, users) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (users === null || users.length === 0) return res.status(400).json('No any registered users found');
        else return res.json(users);
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Register new user
router.route('/register').post(async(req, res) => {
  // eslint-disable-next-line no-unused-vars
  const { email, password, password2, userName } = req.body;

  // Validate data
  const { error } = registerValidation(req.body);
  // if (error) return res.status(400).json(error.details[0].message);
  if (error && error.details[0].path[0] === 'email') {
    return res.status(400).json({
      email: error.details[0].message,
      message: 'Wrong credentials, try again'
    });
  }
  if (error && error.details[0].path[0] === 'password') {
    return res.status(400).json({
      password: error.details[0].message,
      message: 'Wrong credentials, try again'
    });
  }
  if (error && error.details[0].path[0] === 'password2') {
    return res.status(400).json({
      password2: 'Confirm password do not match',
      message: 'Wrong credentials, try again'
    });
  }
  if (error && error.details[0].path[0] === 'userName') {
    return res.status(400).json({
      userName: error.details[0].message,
      message: 'Wrong credentials, try again'
    });
  }

  // Check if User Exists in DB
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).json({ message: 'Email is already exists' });

  const newUser = new User({ email, password, userName });

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
});

// Login
router.route('/login').post(async(req, res, next) => {
  // if (req.user) {
  //   console.log('User already logged in');
  //   return res.json('User already logged in');
  // }

  const { error } = loginValidation(req.body);
  if (error && error.details[0].path[0] === 'email') {
    return res.status(400).json({
      email: error.details[0].message,
      message: 'Wrong credentials, try again'
    });
  }
  if (error && error.details[0].path[0] === 'password') {
    return res.status(400).json({
      password: error.details[0].message,
      message: 'Wrong credentials, try again'
    });
  }
  try {
    await passport.authenticate('local', {
      // successRedirect: '/posts'
      // failureRedirect: '/users/login'
    // failureFlash: true
    }, (err, user, info) => {
      if (err) {
        return res.status(400).json(err);
      }
      if (!user) {
        return res.status(400).json(info);
      }
      req.logIn(user, function(err) {
        if (err) {
          return res.status(400).json(err);
        }
        user.isAuthenticated = true;
        // console.log(req.cookies);

        // return res.redirect('/posts');
        return res.json(user);
      });
    })(req, res, next);
  }
  catch (err) {
    console.log(err);
  }
});

// Logout
router.route('/logout').get((req, res) => {
  req.logout();
  // res.redirect('/users/login');
  res.json('Logged out');
});

// Get one user by ID
router.route('/:id').get(async(req, res) => {
  try {
    await User.findById(req.params.id)
      .populate({
        path: 'posts',
        populate: {
          path: 'comments likes',
          populate: {
            path: 'likes'
          }
        }
      })
      .exec((err, user) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (user === null) return res.status(400).json('Error: user not found');
        else return res.json(user);
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Delete user
router.route('/:id').delete(ensureAuthenticated, (req, res) => {
  try {
    User.findByIdAndDelete(req.params.id)
      .exec((err, user) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (user === null) return res.status(400).json('Error: user not found');
        else return res.json('User deleted');
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// upload user profie image avatar
router.route('/image').post(ensureAuthenticated, upload.single('image'), async(req, res) => {
  try {
    await cloudinary.uploader.upload(req.file.path, async(error, result) => {
      // console.log(req);
      if (error) {
        return res.status(400).json('Error in image upload - ' + error);
      }
      else {
        await User.findOneAndUpdate({ _id: req.user._id }, { imageURL: result.secure_url });
        // .exec((err, user) => {
        //   if (err) return res.status(400).json('Error: ' + err);
        //   if (user === null) return res.status(400).json('User Not found');
        // });
        await Post.updateMany({ userId: req.user._id }, { imageURL: result.secure_url });
        // .exec((err, posts) => {
        //   if (err) return res.status(400).json('Error: ' + err);
        //   if (posts.nModified === 0) return res.status(400).json('Post Not found');
        // });
        await Comment.updateMany({ userId: req.user._id }, { imageURL: result.secure_url });
        // .exec((err, comments) => {
        //   if (err) return res.status(400).json('Error: ' + err);
        //   if (comments.nModified === 0) return res.status(400).json('Comments Not found');
        // });
      }
    });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Add user details
router.route('/update/:id').post(ensureAuthenticated, async(req, res) => {
  try {
    const { error } = userDetailsValidation(req.body);
    if (error) return res.status(400).json(error.details[0].message);
    else {
      await User.findById(req.params.id)
        .exec((err, user) => {
          if (err) return res.status(400).json('Error: ' + err);
          else if (user === null) return res.status(400).json('User not found');
          else {
            if (('bio' in req.body) && (req.body.bio !== undefined)) {
              user.bio = req.body.bio;
            }
            if (('website' in req.body) && (req.body.website !== undefined)) {
              if (req.body.website.trim().substring(0, 4) !== 'http') {
                user.website = `http://${req.body.website.trim()}`;
              }
              else user.website = req.body.website;
            }
            if (('location' in req.body) && (req.body.location !== undefined)) {
              user.location = req.body.location;
            }
            if (('birthDay' in req.body) && (req.body.birthDay !== undefined)) {
              user.birthDay = req.body.birthDay;
            }

            return user.save(() => {
              res.json('User updated!');
            });
          }
        });
    }
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;
