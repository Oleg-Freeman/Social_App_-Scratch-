/* eslint-disable promise/always-return */
const router = require('express').Router();
const Pusher = require('pusher');
const Like = require('../models/like.model');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const Notification = require('../models/notification.model');
const { ensureAuthenticated } = require('../middlewares/validation');

require('dotenv').config({ path: './config/.env' });

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'eu'
});

// Get all likes
router.route('/').get(async(req, res) => {
  try {
    await Like.find().sort({ createdAt: -1 })
      .exec((err, likes) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (likes === null) return res.status(400).json('No any likes found');
        else return res.json(likes);
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Like Post
router.route('/add/:postId').post(ensureAuthenticated, async(req, res) => {
  try {
    await Like.findOne({
      userId: req.user._id,
      postId: req.params.postId,
      likeType: 'post'
    })
      .exec(async(err, liked) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (liked !== null) return res.status(400).json(`User ${req.user.handle} is already liked this post`);
        else {
          try {
            await Post.findById(req.params.postId)
              .exec((err, post) => {
                if (err) return res.status(400).json('Error: ' + err);
                else if (post === null) return res.status(400).json('Internal error');
                else {
                  const userHandle = req.user.handle;
                  const postId = req.params.postId;
                  const userId = req.user._id;
                  const likeType = 'post';

                  const newLike = new Like({
                    postId,
                    userHandle,
                    userId,
                    likeType
                  });

                  return newLike.save(() => {
                    post.likes.unshift(newLike._id);
                    post.likeCount = ++post.likeCount;

                    return post.save(() => {
                      const senderId = req.user._id;
                      const senderName = req.user.handle;
                      const receiverId = post.userId;
                      const receiverName = post.userHandle;
                      const postId = post._id;
                      const notificationType = 'like-post';

                      const newNotification = new Notification({
                        senderId,
                        senderName,
                        receiverId,
                        receiverName,
                        postId,
                        notificationType
                      });

                      return newNotification.save(() => {
                        pusher.trigger('Twitter', 'like-post', {
                          // message: 'hello world'
                        });
                      });
                    });
                  });
                }
              });
          }
          catch (err) {
            res.status(400).json('Error: ' + err);
          }
        }
      });
    res.json(`Liked by ${req.user.handle}`);
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Unlike post
router.route('/:postId').delete(ensureAuthenticated, async(req, res) => {
  try {
    await Like.findOneAndDelete({
      userId: req.user._id,
      postId: req.params.postId,
      likeType: 'post'
    })
      .exec(async(err, liked) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (liked === null) return res.status(400).json(`User ${req.user.handle} not liked this post yet`);
        else {
          try {
            await Post.findById(req.params.postId)
              .exec((err, post) => {
                if (err) return res.status(400).json('Error: ' + err);
                else if (post === null) return res.status(400).json('Internal error');
                else {
                  const toDelete = post.likes.findIndex(deleteMe => {
                    return deleteMe.toString() === liked._id.toString();
                  });

                  if (toDelete === -1) return res.status(400).json('Already unliked');
                  else {
                    post.likeCount = --post.likeCount;
                    post.likes.splice(toDelete, 1);

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
      senderId: req.user._id,
      postId: req.params.postId,
      notificationType: 'like-post'
    })
      .exec((err, notification) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (notification === null) return res.status(400).json('Internal error');
        else return res.json('Unliked');
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Like comment
router.route('/comments/add/:commentId').post(ensureAuthenticated, async(req, res) => {
  try {
    await Like.findOne({
      userId: req.user._id,
      commentId: req.params.commentId,
      likeType: 'comment'
    })
      .exec(async(err, liked) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (liked === null) return res.status(400).json(`User ${req.user.handle} is already liked this comment`);
        else {
          try {
            await Comment.findById(req.params.commentId)
              .exec((err, comment) => {
                if (err) return res.status(400).json('Error: ' + err);
                else if (comment === null) return res.status(400).json('Internal error');
                else {
                  const userHandle = req.user.handle;
                  const postId = comment.postId;
                  const userId = req.user._id;
                  const commentId = comment._id;
                  const likeType = 'comment';

                  const newLike = new Like({
                    postId,
                    userHandle,
                    userId,
                    commentId,
                    likeType
                  });

                  return newLike.save(() => {
                    comment.likes.unshift(newLike._id);
                    comment.likeCount = ++comment.likeCount;

                    return comment.save(() => {
                      const senderId = req.user._id;
                      const senderName = req.user.handle;
                      const receiverId = comment.userId;
                      const receiverName = comment.userHandle;
                      const postId = comment.postId;
                      const commentId = comment._id;
                      const notificationType = 'like-comment';

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
                        pusher.trigger('Twitter', 'like-comment', {
                          // message: 'hello world'
                        });
                      });
                    });
                  });
                }
              });
          }
          catch (err) {
            res.status(400).json('Error: ' + err);
          }
        }
      });

    res.json(`Liked by ${req.user.handle}`);
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Unlike comment
router.route('/comments/:commentId').delete(ensureAuthenticated, async(req, res) => {
  try {
    await Like.findOneAndDelete({
      userId: req.user._id,
      commentId: req.params.commentId,
      likeType: 'comment'
    })
      .exec(async(err, liked) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (liked === null) return res.status(400).json(`User ${req.user.handle} not liked this comment yet`);
        else {
          try {
            await Comment.findById(req.params.commentId)
              .exec((err, comment) => {
                if (err) return res.status(400).json('Error: ' + err);
                else if (comment === null) return res.status(400).json('Internal error');
                else {
                  const toDelete = comment.likes.findIndex(deleteMe => {
                    return deleteMe.toString() === liked._id.toString();
                  });

                  if (toDelete === -1) return res.status(400).json('Allready unliked');
                  else {
                    comment.likeCount = --comment.likeCount;
                    comment.likes.splice(toDelete, 1);

                    return comment.save();
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
      notificationType: 'like-comment'
    })
      .exec((err, notification) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (notification === null) return res.status(400).json('Internal error');
        else return res.json('Unliked');
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;
