const router = require('express').Router();
const Comment = require('../models/comment.model');
const Scream = require('../models/screams.model');
const { ensureAuthenticated, bodyValidation } = require('../middlewares/validation');

router.route('/').get((req, res) => {
  Comment.find().sort({ createdAt: -1 })
    .populate('likes')
    .then(comments => res.json(comments))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add/:screamId').post(ensureAuthenticated, (req, res) => {
  const { error } = bodyValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  Scream.findById(req.params.screamId).then(scream => {
    const userHandle = req.user.handle;
    const body = req.body.body;
    const screamId = req.params.screamId;
    const userId = req.user._id;
    const imageURL = req.user.imageURL;

    const newComment = new Comment({
      screamId,
      userId,
      userHandle,
      body,
      imageURL
    });

    newComment.save()
      .catch(err => res.status(400).json('Error: ' + err));

    scream.comments.unshift(newComment._id);
    scream.commentCount = ++scream.commentCount;

    scream.save()
      .then(() => res.json('Comment added!'))
      .catch(err => res.status(400).json('Error: ' + err));
  }).catch(err => res.status(400).json('Error, scream not found: ' + err));
});

router.route('/:commentId').delete(ensureAuthenticated, (req, res) => {
  Comment.findByIdAndDelete(req.params.commentId)
    .then(comment => {
      Scream.findById(comment.screamId).then(scream => {
        const toDelete = scream.comments.findIndex(deleteMe => {
          return deleteMe.toString() === req.params.commentId;
        });
        if (toDelete === -1) res.status(400).json('Comment not found');
        else {
          scream.commentCount = --scream.commentCount;
          scream.comments.splice(toDelete, 1);
        }

        scream.save()
          .catch(err => res.status(400).json('Error: ' + err));
      }).catch(err => res.status(400).json('Error: ' + err));

      res.json('Comment deleted.');
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:commentId').post(ensureAuthenticated, (req, res) => {
  const { error } = bodyValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  Comment.findOneAndUpdate({ _id: req.params.commentId }, { body: req.body.body })
    .then(() => res.json('Comment updated!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
