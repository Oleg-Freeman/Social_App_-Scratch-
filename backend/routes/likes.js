const router = require('express').Router();
const Like = require('../models/like.model');
const Comment = require('../models/comment.model');
const Scream = require('../models/screams.model');
const { ensureAuthenticated } = require('../middlewares/validation');

router.route('/').get((req, res) => {
  Like.find().sort({ createdAt: -1 })
    .then(likes => res.json(likes))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Like scream
router.route('/add/:screamId').post(ensureAuthenticated, (req, res) => {
  Like.find({ screamId: req.params.screamId }).findOne({ userId: req.user._id })
    .then(liked => {
      // console.log(liked); // null, findOne result
      if (liked !== null) {
        res.send(`User ${req.user.handle} is already liked this scream`);
      }
      else {
        Scream.findById(req.params.screamId)
          .then(scream => {
            const userHandle = req.user.handle;
            const screamId = req.params.screamId;
            const userId = req.user._id.toString();

            const newLike = new Like({
              screamId,
              userHandle,
              userId
            });

            newLike.save()
              .catch(err => res.status(400).json('Error: ' + err));

            scream.likes.unshift(newLike._id);
            scream.likeCount = ++scream.likeCount;

            scream.save()
              .then(() => res.json(`Liked by ${req.user.handle}`))
              .catch(err => res.status(400).json('Error here: ' + err));
          }).catch(err => res.status(400).json('Error, scream not found: ' + err));
      }
    })
    .catch(err => res.status(400).json('Error here: ' + err));
});

// Unlike scream
router.route('/:screamId').delete(ensureAuthenticated, (req, res) => {
  Like.find({ screamId: req.params.screamId }).findOneAndDelete({ userId: req.user._id }) // findOneAndDelete
    .then(liked => {
      if (liked === null) {
        res.send(`User ${req.user.handle} not liked this scream yet`);
      }
      else {
        Scream.findById(req.params.screamId)
          .then(scream => {
            const toDelete = scream.likes.findIndex(deleteMe => {
              return deleteMe.toString() === liked._id.toString();
            });

            if (toDelete === -1) res.status(400).json('Allready unliked');
            else {
              scream.likeCount = --scream.likeCount;
              scream.likes.splice(toDelete, 1);
            }

            scream.save()
              .then(() => res.json('Unliked'))
              .catch(err => res.status(400).json('Error here: ' + err));
          })
          .catch(err => res.status(400).json('Error here: ' + err));
      }
    })
    .catch(err => res.status(400).json('Error here: ' + err));
});

// Like comment
router.route('/comments/add/:commentId').post(ensureAuthenticated, (req, res) => {
  Like.find({ screamId: req.params.commentId }).findOne({ userId: req.user._id })
    .then(liked => {
      if (liked !== null) {
        res.send(`User ${req.user.handle} is already liked this comment`);
      }
      else {
        Comment.findById(req.params.commentId)
          .then(comment => {
            const userHandle = req.user.handle;
            const screamId = req.params.commentId;
            const userId = req.user._id.toString();

            const newLike = new Like({
              screamId,
              userHandle,
              userId
            });

            newLike.save()
              .catch(err => res.status(400).json('Error: ' + err));

            comment.likes.unshift(newLike._id);
            comment.likeCount = ++comment.likeCount;

            comment.save()
              .then(() => res.json(`Liked by ${req.user.handle}`))
              .catch(err => res.status(400).json('Error here: ' + err));
          }).catch(err => res.status(400).json('Error, scream not found: ' + err));
      }
    })
    .catch(err => res.status(400).json('Error here: ' + err));
});

// Unlike comment
router.route('/comments/:commentId').delete(ensureAuthenticated, (req, res) => {
  Like.find({ screamId: req.params.commentId }).findOneAndDelete({ userId: req.user._id }) // findOneAndDelete
    .then(liked => {
      if (liked === null) {
        res.send(`User ${req.user.handle} not liked this comment yet`);
      }
      else {
        Comment.findById(req.params.commentId)
          .then(comment => {
            const toDelete = comment.likes.findIndex(deleteMe => {
              return deleteMe.toString() === liked._id.toString();
            });

            if (toDelete === -1) res.status(400).json('Allready unliked');
            else {
              comment.likeCount = --comment.likeCount;
              comment.likes.splice(toDelete, 1);
            }

            comment.save()
              .then(() => res.json('Unliked'))
              .catch(err => res.status(400).json('Error here: ' + err));
          })
          .catch(err => res.status(400).json('Error here: ' + err));
      }
    })
    .catch(err => res.status(400).json('Error here: ' + err));
});

module.exports = router;
