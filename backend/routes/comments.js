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
router.route('/').get(async(req, res) => {
  try {
    await Comment.find().sort({ createdAt: -1 })
      .populate('likes')
      .exec((err, comments) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (comments === null || comments.length === 0) return res.status(400).json('No any comments found');
        else return res.json(comments);
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Get all comments on post
router.route('/:postId').get(async(req, res) => {
  try {
    await Comment.find({ postId: req.param.postId })
      .sort({ createdAt: -1 })
      .populate('likes')
      .exec((err, comments) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (comments === null || comments.length === 0) return res.status(400).json('No any comments on this post found');
        else return res.json(comments);
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Add new comment
router.route('/add/:postId').post(ensureAuthenticated, async(req, res) => {
  const { error } = bodyValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  else {
    try {
      await Post.findById(req.params.postId)
        .exec((err, post) => {
          if (err) return res.status(400).json('Error: ' + err);
          else if (post === null) return res.status(400).json('Internal error');
          else {
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

            return newComment.save(() => {
              post.comments.unshift(newComment._id);
              post.commentCount = ++post.commentCount;

              return post.save(() => {
                const senderId = req.user._id;
                const senderName = req.user.handle;
                const receiverId = post.userId;
                const receiverName = post.userHandle;
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

                return newNotification.save(() => {
                  pusher.trigger('Twitter', 'new-comment', {
                    // message: 'hello world'
                  });
                });
              });
            });
          }
        });

      res.json('Comment added!');
    }
    catch (err) {
      res.status(400).json('Error: ' + err);
    }
  }
});

// Delete comment
router.route('/:commentId').delete(ensureAuthenticated, async(req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.commentId)
      .exec(async(err, comment) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (comment === null) return res.status(400).json('Comments not found');
        else {
          try {
            await Post.findById(comment.postId)
              .exec((err, post) => {
                if (err) return res.status(400).json('Error: ' + err);
                else if (post === null) return res.status(400).json('Internal error');
                else {
                  const toDelete = post.comments.findIndex(deleteMe => {
                    return deleteMe.toString() === req.params.commentId;
                  });
                  if (toDelete === -1) throw new Error('Comment not found');
                  else {
                    post.commentCount = --post.commentCount;
                    post.comments.splice(toDelete, 1);
                    return post.save();
                  }
                }
              });
          }
          catch (err) {
            res.status(400).json('Error: ' + err);
          }
        }
      });

    await Notification.findOneAndDelete({
      commentId: req.params.commentId,
      senderId: req.user._id,
      notificationType: 'new-comment'
    })
      .exec((err, notification) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (notification === null) return res.status(400).json('Internal error');
        else return res.json('Comment deleted.');
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Update comment
router.route('/update/:commentId').post(ensureAuthenticated, async(req, res) => {
  const { error } = bodyValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);
  else {
    try {
      await Comment.findOneAndUpdate({ _id: req.params.commentId }, { body: req.body.body })
        .exec((err, comment) => {
          if (err) return res.status(400).json('Error: ' + err);
          else if (comment === null) return res.status(400).json('Comment not found');
          else return res.json('Comment updated!');
        });
    }
    catch (err) {
      res.status(400).json('Error: ' + err);
    }
  }
});

module.exports = router;
