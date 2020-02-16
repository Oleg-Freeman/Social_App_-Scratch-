const router = require('express').Router();
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const passport = require('passport');
const { registerValidation } = require('../middlewares/validation'); // loginValidation
const { notloggedIn } = require('../middlewares/not-loggedin');

router.route('/').get((req, res) => {
  User.find().sort({ createdAt: -1 })
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/register').post(async(req, res) => {
  const { email, password, password2, handle } = req.body;

  // Validate data
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if User Exists in DB
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send('Email is already exists');

  const newUser = new User({ email, password, password2, handle });

  // Hash password
  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(req.body.password, salt);

  newUser.save()
    .then(() => res.json('User added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Login
router.route('/login').post(notloggedIn, (req, res, next) => {
// router.post('/login', isloggedIn, (req, res, next) => {
  // const { error } = isloggedIn(req.body);
  // if (error) return res.status(400).send(error.details[0].message);

  passport.authenticate('local', {
    successRedirect: '/screams',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  // res.redirect('/users/login');
  res.send('Logged out');
});

router.route('/:id').get((req, res) => {
  User.findById(req.params.id)
    .then(users => res.json(users))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete((req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then(() => res.json('User deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// router.route('/update/:id').post((req, res) => {
//   User.findById(req.params.id)
//     .then(users => {
//       users.username = req.body.username;

//       users.save()
//         .then(() => res.json('User updated!'))
//         .catch(err => res.status(400).json('Error: ' + err));
//     })
//     .catch(err => res.status(400).json('Error: ' + err));
// });

module.exports = router;
