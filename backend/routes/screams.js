const router = require('express').Router();
const Scream = require('../models/screams.model');
const { ensureAuthenticated, bodyValidation } = require('../middlewares/validation');

router.route('/').get((req, res) => {
  Scream.find().sort({ createdAt: -1 })
    .then(screams => res.json(screams))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post(ensureAuthenticated, (req, res) => {
  const { error } = bodyValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // const screamId = req.body.screamId; // _id: new mongoose.Types.ObjectId().toHexString(),
  const userHandle = req.user.handle;
  const body = req.body.body;
  const likeCount = req.body.likeCount;
  const commentCount = req.body.commentCount;
  const comments = req.body.comments;

  const newScream = new Scream({
    // screamId,
    userHandle,
    body,
    likeCount,
    commentCount,
    comments
  });

  newScream.save()
    .then(() => res.json('Scream added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
  Scream.findById(req.params.id)
    .then(scream => res.json(scream))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete(ensureAuthenticated, (req, res) => {
  Scream.findByIdAndDelete(req.params.id)
    .then(() => res.json('Scream deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post(ensureAuthenticated, (req, res) => {
  Scream.findById(req.params.id)
    .then(scream => {
      const { error } = bodyValidation(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      // screams.screamId = req.body.screamId;// _id: new mongoose.Types.ObjectId().toHexString(),
      // screams.userHandle = req.user.handle;
      scream.body = req.body.body;
      // screams.likeCount = req.body.likeCount;
      // screams.commentCount = req.body.commentCount;
      // screams.comments = req.body.comments;

      scream.save()
        .then(() => res.json('Scream updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/comments/add/:id').post(ensureAuthenticated, (req, res) => {
  const { error } = bodyValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  Scream.findById(req.params.id)
    .then(scream => {
      scream.comments.push({ body: req.body.body, userHandle: req.user.handle });
      scream.commentCount = ++scream.commentCount;

      scream.save()
        .then(() => res.json('Comment added!'))
        .catch(err => res.status(400).json('Error: ' + err));
    }).catch(err => res.status(400).json('Error: ' + err));
});

// Get comment of Scream by ID
router.route('/comments/:screamId/:commentId')
  .get((req, res) => {
    Scream.findById(req.params.screamId)
      .then(scream => {
        const queriedComment = scream.comments.filter(comment => {
          return comment._id.toString() === req.params.commentId;
        });

        res.json(queriedComment);
      })
      .catch(err => res.status(400).json('Error: ' + err));
  });

router.route('/comments/del/:screamId/:commentId')
  .delete(ensureAuthenticated, (req, res) => {
    Scream.findById(req.params.screamId)
      .then(scream => {
        const toDelete = scream.comments.findIndex(comment => {
          return comment._id.toString() === req.params.commentId;
        });
        scream.comments.splice(toDelete, 1);

        scream.save()
          .then(() => res.json('Comment deleted'))
          .catch(err => res.status(400).json('Error: ' + err));
      })
      .catch(err => res.status(400).json('Error: ' + err));
  });

router.route('/comments/update/:screamId/:commentId')
  .post(ensureAuthenticated, (req, res) => {
    Scream.findById(req.params.screamId).where()
      .then(scream => {
        scream.comments.filter(comment => {
          if (comment._id.toString() === req.params.commentId) comment.body = req.body.body;
        });

        scream.save()
          .then(() => res.json('Comment updated!'))
          .catch(err => res.status(400).json('Error: ' + err));
      }).catch(err => res.status(400).json('Error: ' + err));
  });

module.exports = router;
