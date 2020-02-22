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
  Scream.findById(req.params.id).populate('comments', 'body').exec((err, comments) => {
    if (err) return res.status(400).json('Error: ' + err);
    else res.json('Screams with comments: ' + comments);
  });
  // .then(screams => {
  //   console.log('Screams:' + screams);

  //   res.json(screams);
  // })
  // .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete(ensureAuthenticated, (req, res) => {
  Scream.findByIdAndDelete(req.params.id)
    .then(() => res.json('Scream deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post(ensureAuthenticated, (req, res) => {
  Scream.findById(req.params.id)
    .then(screams => {
      const { error } = bodyValidation(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      // screams.screamId = req.body.screamId;// _id: new mongoose.Types.ObjectId().toHexString(),
      // screams.userHandle = req.user.handle;
      screams.body = req.body.body;
      // screams.likeCount = req.body.likeCount;
      // screams.commentCount = req.body.commentCount;
      // screams.comments = req.body.comments;

      screams.save()
        .then(() => res.json('Scream updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/comments/add/:id').post(ensureAuthenticated, (req, res) => {
  const { error } = bodyValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  Scream.findById(req.params.id)
    .then(screams => {
      screams.comments.push({ body: req.body.body, userHandle: req.user.handle });

      screams.save()
        .then(() => res.json('Comment added!'))
        .catch(err => res.status(400).json('Error: ' + err));
    }).catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
