const router = require('express').Router();
const Pusher = require('pusher');
const Comment = require('../models/comment.model');
const Scream = require('../models/screams.model');
const Notification = require('../models/notification.model');
const { ensureAuthenticated, bodyValidation } = require('../middlewares/validation');

require('dotenv').config({ path: './config/.env' });

// Pusher config
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'eu'
});

// Get all comments from DB
router.route('/').get((req, res) => {
  Comment.find().sort({ createdAt: -1 })
    .populate('likes')
    .then(comments => res.json(comments))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get all comments on scream
router.route('/:screamId').get((req, res) => {
  Comment.find({ screamId: req.param.screamId })
    .sort({ createdAt: -1 })
    .populate('likes')
    .then(comments => res.json(comments))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add new comment
router.route('/add/:screamId').post(ensureAuthenticated, (req, res) => {
  const { error } = bodyValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  Scream.findById(req.params.screamId)
    .then(scream => {
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
        .then(() => {
          const senderId = req.user._id;
          const senderName = req.user.handle;
          const receiverId = scream.userId;
          const receiverName = scream.userHandle;
          const screamId = scream._id;
          const commentId = newComment._id;
          const notificationType = 'new-comment';

          const newNotification = new Notification({
            senderId,
            senderName,
            receiverId,
            receiverName,
            screamId,
            commentId,
            notificationType
          });
          // console.log(newNotification);

          newNotification.save()
            .then(() => {
              pusher.trigger('Twitter', 'new-comment', {
                // message: 'hello world'
              });
            })
            .catch(err => res.status(400).json('Notification Error: ' + err));

          scream.comments.unshift(newComment._id);
          scream.commentCount = ++scream.commentCount;

          scream.save()
            .then(() => res.json('Comment added!'))
            .catch(err => res.status(400).json('Scream Error: ' + err));
        })
        .catch(err => res.status(400).json('Comment Error: ' + err));
    }).catch(err => res.status(400).json('Error, scream not found: ' + err));
});

// Delete comment
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
          .then(() => {
            Notification.findOneAndDelete({
              commentId: req.params.commentId,
              senderId: req.user._id,
              notificationType: 'new-comment'
            })
              .catch(err => res.status(400).json('Error, notification not found: ' + err));
          })
          .catch(err => res.status(400).json('Scream Error: ' + err));
      }).catch(err => res.status(400).json('Error, scream not found: ' + err));

      res.json('Comment deleted.');
    })
    .catch(err => res.status(400).json('Error, comment not found: ' + err));
});

// Update comment
router.route('/update/:commentId').post(ensureAuthenticated, (req, res) => {
  const { error } = bodyValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  Comment.findOneAndUpdate({ _id: req.params.commentId }, { body: req.body.body })
    .then(() => res.json('Comment updated!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
