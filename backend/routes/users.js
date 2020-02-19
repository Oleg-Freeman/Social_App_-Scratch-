const router = require('express').Router();
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const passport = require('passport');
// Image upload
// const Busboy = require('busboy');
// const path = require('path');
// const os = require('os');
// const fs = require('fs');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const { registerValidation } = require('../middlewares/validation'); // loginValidation
const { notloggedIn } = require('../middlewares/not-loggedin');
const { ensureAuthenticated } = require('../config/auth');

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

router.post('/image', ensureAuthenticated, upload.single('image'), function(req, res) {
  cloudinary.uploader.upload(req.file.path, function(error, result) {
    if (error) {
      return res.status(400).send('Error in image upload - ' + error);
    }
    else {
      // User.find({ handle: req.user.handle }).then(users => {
      //   console.log(users);
      //   users.imageURL = result.secure_url;
      //   console.log(users.imageURL);

      //   users.save()
      //     .then(() => res.json('Image uploaded!'))
      //     .catch(err => res.status(400).json('Error: ' + err));
      // }).catch(err => res.status(400).json('Error: ' + err));

      User.findOneAndUpdate({ handle: req.user.handle }, { imageURL: result.secure_url })
        .then(() => res.json('Image uploaded!'))
        .catch(err => res.status(400).json('Error: ' + err));
    }
  });
});
// router.route('/image').post(ensureAuthenticated, (req, res, next) => {
//   const busboy = new Busboy({ headers: req.headers });

//   let imageFileName;
//   let imageToBeUploaded = {};

//   busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
//     console.log(fieldname);
//     console.log(filename);
//     console.log(mimetype);

//     const imageExtension = filename.split('.')[filename.split('.').length - 1];
//     imageFileName = `${Math.round(Math.random() * 1000)}.${imageExtension}`;
//     const filePath = path.join(os.tmpdir(), imageFileName);
//     imageToBeUploaded = { filePath, mimetype };
//     console.log(`filePath - ${filePath}`);

//     file.pipe(fs.createWriteStream(filePath));
//   });
//   busboy.on('finish', () => {
//     console.log(`imageToBeUploaded.filePath - ${imageToBeUploaded.filePath}`);

//     cloudinary.uploader.upload(imageToBeUploaded.filePath, (error, result) => {
//       if (error) {
//         console.log(error);
//         res.status(400).json('Upload Error: ' + error);
//       }
//       else {
//         console.log(result);
//         const imageURL = cloudinary.url(imageFileName, {
//           width: 225,
//           height: 225,
//           crop: 'fill'
//         });
//         req.user.imageURL = imageURL;
//         res.send('Image uploaded successfully!');
//       };
//     });
//   });
//   busboy.end(req.rawBody);
// });

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
