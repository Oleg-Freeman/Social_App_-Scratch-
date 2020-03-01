/* eslint-disable promise/always-return */
const router = require('express').Router();
const Pusher = require('pusher');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
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

// Get all comments on post
router.route('/:postId').get((req, res) => {
  Comment.find({ postId: req.param.postId })
    .sort({ createdAt: -1 })
    .populate('likes')
    .then(comments => res.json(comments))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add new comment
router.route('/add/:postId').post(ensureAuthenticated, (req, res) => {
  const { error } = bodyValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  return Post.findById(req.params.postId)
    .then(post => {
      const userHandle = req.user.handle;
      const body = req.body.body;
      const postId = req.params.postId;
      const userId = req.user._id;
      const imageURL = req.user.imageURL;

      const newComment = new Comment({
        postId,
        userId,
        userHandle,
        body,
        imageURL
      });

      return newComment.save()
        .then(() => {
          const senderId = req.user._id;
          const senderName = req.user.handle;
          const receiverId = post.userId;
          const receiverName = post.userHandle;
          // const postId = post._id;
          const commentId = newComment._id;
          const notificationType = 'new-comment';

          const newNotification = new Notification({
            senderId,
            senderName,
            receiverId,
            receiverName,
            postId,
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

          post.comments.unshift(newComment._id);
          post.commentCount = ++post.commentCount;

          post.save()
            .catch(err => res.status(400).json('Post Error: ' + err));
        })
        .catch(err => res.status(400).json('Comment Error: ' + err));
    })
    .then(() => res.json('Comment added!'))
    .catch(err => res.status(400).json('Error, post not found: ' + err));
});

// Delete comment
router.route('/:commentId').delete(ensureAuthenticated, (req, res) => {
  Comment.findByIdAndDelete(req.params.commentId)
    .then(comment => {
      return Post.findById(comment.postId)
        .then(post => {
          const toDelete = post.comments.findIndex(deleteMe => {
            return deleteMe.toString() === req.params.commentId;
          });
          if (toDelete === -1) throw new Error('Comment not found');
          else {
            post.commentCount = --post.commentCount;
            post.comments.splice(toDelete, 1);
          }

          return post.save()
            .catch(err => res.status(400).json('Post Error: ' + err));
        }).catch(err => res.status(400).json('Error, post not found: ' + err));
    })
    .then(() => {
      return Notification.findOneAndDelete({
        commentId: req.params.commentId,
        senderId: req.user._id,
        notificationType: 'new-comment'
      });
    })
    .then(() => res.json('Comment deleted.'))
    .catch(err => res.status(400).json('Error, comment not found: ' + err));
});

// Update comment
router.route('/update/:commentId').post(ensureAuthenticated, (req, res) => {
  const { error } = bodyValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  Comment.findOneAndUpdate({ _id: req.params.commentId }, { body: req.body.body })
    .then(() => res.json('Comment updated!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
