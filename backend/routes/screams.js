const router = require('express').Router();
const Scream = require('../models/screams.model');
const Like = require('../models/like.model');
const Comment = require('../models/comment.model');
const { ensureAuthenticated, bodyValidation } = require('../middlewares/validation');

router.route('/').get((req, res) => {
  Scream.find()
    .sort({ createdAt: -1 })
    .populate({
      path: 'comments likes',
      populate: {
        path: 'likes'
      }
    })
    .then(screams => res.json(screams))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post(ensureAuthenticated, (req, res) => {
  const { error } = bodyValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // const screamId = req.body.screamId; // _id: new mongoose.Types.ObjectId().toHexString(),
  const userHandle = req.user.handle;
  const body = req.body.body;
  const imageURL = req.user.imageURL;
  const userId = req.user._id;

  const newScream = new Scream({
    userHandle,
    body,
    imageURL,
    userId
  });

  newScream.save()
    .then(() => res.json('Scream added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
  Scream.findById(req.params.id)
    .populate({
      path: 'comments likes',
      populate: {
        path: 'likes'
      }
    })
    .then(scream => res.json(scream))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete(ensureAuthenticated, (req, res) => {
  Scream.findByIdAndDelete(req.params.id)
    .then(scream => {
      Like.deleteMany({ screamId: scream._id })
        .catch(err => res.status(400).json('Error here: ' + err));
      scream.comments.forEach(comment => {
        console.log(comment);
        Like.deleteMany({ screamId: comment.toString() })
          .catch(err => res.status(400).json('Error: ' + err));
      });
      Comment.deleteMany({ screamId: scream._id })
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .then(() => res.json('Scream Deleted'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post(ensureAuthenticated, (req, res) => {
  Scream.findById(req.params.id)
    .then(scream => {
      const { error } = bodyValidation(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      // screams.screamId = req.body.screamId;// _id: new mongoose.Types.ObjectId().toHexString(),
      scream.body = req.body.body;

      scream.save()
        .then(() => res.json('Scream updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
