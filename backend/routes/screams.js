const router = require('express').Router();
const Scream = require('../models/screams.model');

router.route('/').get((req, res) => {
  Scream.find()
    .then(screams => res.json(screams))
    .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
  const userHandle = req.body.userHandle;
  const body = req.body.body;
  const createAt = req.body.createAt;

  const newScream = new Scream({
    userHandle,
    body,
    createAt
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
      screams.userHandle = req.body.userHandle;
      screams.body = req.body.body;
      screams.createAt = req.body.createAt;

      screams.save()
        .then(() => res.json('Scream updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
