const router = require('express').Router();
const Pusher = require('pusher');
const Like = require('../models/like.model');
const Comment = require('../models/comment.model');
const Post = require('../models/post.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
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
        else if (likes === null || likes.length === 0) return res.status(400).json('No any likes found');
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
    const token = req.headers.token;
    await User.findById(token)
      .exec(async(err, user) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (user === null) return res.status(400).json('Internal error');
        else {
          await Like.findOne({
            userId: user._id,
            postId: req.params.postId,
            likeType: 'post'
          })
            .exec(async(err, liked) => {
              if (err) return res.status(400).json('Error: ' + err);
              else if (liked !== null) {
                return res.status(400).json(`User ${user.userName} is already liked this post`);
              }
              else {
                await Post.findById(req.params.postId)
                  .exec(async(err, post) => {
                    if (err) return res.status(400).json('Error: ' + err);
                    else if (post === null) return res.status(400).json('Internal error');
                    else {
                      const userName = user.userName;
                      const postId = req.params.postId;
                      const userId = user._id;
                      const likeType = 'post';

                      const newLike = new Like({
                        postId,
                        userName,
                        userId,
                        likeType
                      });

                      await newLike.save();

                      post.likes.unshift(newLike._id);
                      post.likeCount = ++post.likeCount;

                      await post.save();

                      const senderId = user._id;
                      const senderName = user.userName;
                      const receiverId = post.userId;
                      const receiverName = post.userName;
                      const notificationType = 'like-post';

                      const newNotification = new Notification({
                        senderId,
                        senderName,
                        receiverId,
                        receiverName,
                        postId,
                        notificationType
                      });

                      await newNotification.save(() => {
                        pusher.trigger('Twitter', 'like-post', {
                          // message: 'hello world'
                        });
                        res.json(`Liked by ${user.userName}`);
                      });
                    }
                  });
              }
            });
        }
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Unlike post
router.route('/:postId').delete(ensureAuthenticated, async(req, res) => {
  try {
    const token = req.headers.token;
    await Like.findOneAndDelete({
      userId: token,
      postId: req.params.postId,
      likeType: 'post'
    })
      .exec(async(err, liked) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (liked !== null) return res.status(400).json('This post is not liked yet');
        else {
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
      });

    await Notification.findOneAndDelete({
      senderId: token,
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
    const token = req.headers.token;
    await User.findById(token)
      .exec(async(err, user) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (user === null) return res.status(400).json('Internal error');
        else {
          await Like.findOne({
            userId: user._id,
            commentId: req.params.commentId,
            likeType: 'comment'
          })
            .exec(async(err, liked) => {
              if (err) return res.status(400).json('Error: ' + err);
              else if (liked !== null) {
                return res.status(400).json(`User ${user.userName} is already liked this comment`);
              }
              else {
                await Comment.findById(req.params.commentId)
                  .exec(async(err, comment) => {
                    if (err) return res.status(400).json('Error: ' + err);
                    else if (comment === null) return res.status(400).json('Internal error');
                    else {
                      const userName = user.userName;
                      const postId = comment.postId;
                      const userId = user._id;
                      const commentId = comment._id;
                      const likeType = 'comment';

                      const newLike = new Like({
                        postId,
                        userName,
                        userId,
                        commentId,
                        likeType
                      });

                      await newLike.save();

                      comment.likes.unshift(newLike._id);
                      comment.likeCount = ++comment.likeCount;

                      await comment.save();

                      const senderId = user._id;
                      const senderName = user.userName;
                      const receiverId = comment.userId;
                      const receiverName = comment.userName;
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

                      await newNotification.save(() => {
                        pusher.trigger('Twitter', 'like-comment', {
                          // message: 'hello world'
                        });
                        res.json(`Liked by ${user.userName}`);
                      });
                    }
                  });
              }
            });
        }
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Unlike comment
router.route('/comments/:commentId').delete(ensureAuthenticated, async(req, res) => {
  try {
    const token = req.headers.token;
    await Like.findOneAndDelete({
      userId: token,
      commentId: req.params.commentId,
      likeType: 'comment'
    })
      .exec(async(err, liked) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (liked === null) {
          return res.status(400).json('This comment is not liked yet');
        }
        else {
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
      });
    await Notification.findOneAndDelete({
      commentId: req.params.commentId,
      senderId: token,
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
