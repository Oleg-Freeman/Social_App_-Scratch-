/* eslint-disable */

// Comments array, nested in scream onj
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
  // TO DO - User can delete and edit only own posts
  Scream.findById(req.params.screamId)
    .then(scream => {
      const toDelete = scream.comments.findIndex(comment => {
        return comment._id.toString() === req.params.commentId;
      });
      console.log(typeof scream.comments[toDelete].userHandle);

      if (scream.comments[toDelete].userHandle === req.user.handle) {
        scream.comments.splice(toDelete, 1);

        scream.save()
          .then(() => res.json('Comment deleted'))
          .catch(err => res.status(400).json('Error: ' + err));
      }
      else {
        return res.status(400).json('You can delete comments only in own posts');
      }
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