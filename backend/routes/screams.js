const router = require('express').Router();
const Scream = require('../models/screams.model');

router.route('/').get((req, res) => {
  Scream.find().sort({ createdAt: -1 })
    .then(screams => res.json(screams))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  // const screamId = req.body.screamId; // _id: new mongoose.Types.ObjectId().toHexString(),
  const userHandle = req.body.userHandle;
  const body = req.body.body;
  const createAt = req.body.createAt;
  const likeCount = req.body.likeCount;
  const commentCount = req.body.commentCount;

  const newScream = new Scream({
    // screamId,
    userHandle,
    body,
    createAt,
    likeCount,
    commentCount
  });

  newScream.save()
    .then(() => res.json('Scream added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').get((req, res) => {
  Scream.findById(req.params.id)
    .then(screams => res.json(screams))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:id').delete((req, res) => {
  Scream.findByIdAndDelete(req.params.id)
    .then(() => res.json('Scream deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:id').post((req, res) => {
  Scream.findById(req.params.id)
    .then(screams => {
      // screams.screamId = req.body.screamId;// _id: new mongoose.Types.ObjectId().toHexString(),
      screams.userHandle = req.body.userHandle;
      screams.body = req.body.body;
      screams.createAt = req.body.createAt;
      screams.likeCount = req.body.likeCount;
      screams.commentCount = req.body.commentCount;

      screams.save()
        .then(() => res.json('Scream updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
