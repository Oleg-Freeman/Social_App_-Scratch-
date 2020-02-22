const router = require('express').Router();
const Comment = require('../models/comment.model');
const { ensureAuthenticated } = require('../middlewares/validation');

router.route('/').get((req, res) => {
  Comment.find().sort({ createdAt: -1 })
    .then(comments => res.json(comments))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add/:id').post(ensureAuthenticated, (req, res) => {
  const userHandle = req.user.handle;
  const body = req.body.body;
  const screamId = req.params.id;

  const newComment = new Comment({
    screamId,
    userHandle,
    body
  });

  newComment.save()
    .then(() => res.json('Comment added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete(ensureAuthenticated, (req, res) => {
  Comment.findByIdAndDelete(req.params.id)
    .then(() => res.json('Comment deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post(ensureAuthenticated, (req, res) => {
  Comment.findOneAndUpdate({ _id: req.params.id }, { body: req.body.body })
    .then(() => res.json('Comment updated!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
