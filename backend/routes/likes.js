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

router.route('/').get((req, res) => {
  Like.find().sort({ createdAt: -1 })
    .then(likes => res.json(likes))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Like Post
router.route('/add/:postId').post(ensureAuthenticated, (req, res) => {
  Like.findOne({
    userId: req.user._id,
    postId: req.params.postId,
    likeType: 'post'
  })
    .then(liked => {
      if (liked !== null) { // null, findOne result
        throw new Error(`User ${req.user.handle} is already liked this post`);
      }
    })
    .then(() => {
      return Post.findById(req.params.postId);
    })
    .then(post => {
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

      return newLike.save()
        .then(() => {
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

          newNotification.save()
            .then(() => {
              pusher.trigger('Twitter', 'like-post', {
                // message: 'hello world'
              });
            })
            .catch(err => res.status(400).json('Notification Error: ' + err));

          post.likes.unshift(newLike._id);
          post.likeCount = ++post.likeCount;

          post.save()
            .catch(err => res.status(400).json('Post Error: ' + err));
        });
    })
    .then(() => res.json(`Liked by ${req.user.handle}`))
    .catch(err => res.status(400).json('Error : ' + err));
});

// Unlike post
router.route('/:postId').delete(ensureAuthenticated, (req, res) => {
  Like.findOneAndDelete({
    userId: req.user._id,
    postId: req.params.postId,
    likeType: 'post'
  })
    .then(liked => {
      if (liked === null) {
        throw new Error(`User ${req.user.handle} not liked this post yet`);
      }
      else {
        return liked;
      }
    })
    .then(liked => {
      return Post.findById(req.params.postId)
        .then(post => {
          const toDelete = post.likes.findIndex(deleteMe => {
            return deleteMe.toString() === liked._id.toString();
          });

          if (toDelete === -1) throw new Error('Allready unliked');
          else {
            post.likeCount = --post.likeCount;
            post.likes.splice(toDelete, 1);
          }

          return post.save()
            .catch(err => res.status(400).json('Post Error: ' + err));
        })
        .catch(err => res.status(400).json('Error, post not found: ' + err));
    })
    .then(() => {
      return Notification.findOneAndDelete({
        senderId: req.user._id,
        postId: req.params.postId,
        notificationType: 'like-post'
      });
    })
    .then(() => res.json('Unliked'))
    .catch(err => res.status(400).json('Error : ' + err));
});

// Like comment
router.route('/comments/add/:commentId').post(ensureAuthenticated, (req, res) => {
  Like.findOne({
    userId: req.user._id,
    commentId: req.params.commentId,
    likeType: 'comment'
  })
    .then(liked => {
      if (liked !== null) {
        throw new Error(`User ${req.user.handle} is already liked this comment`);
      }
    })
    .then(() => {
      return Comment.findById(req.params.commentId);
    })
    .then(comment => {
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

      return newLike.save()
        .then(() => {
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

          newNotification.save()
            .then(() => {
              pusher.trigger('Twitter', 'like-comment', {
                // message: 'hello world'
              });
            })
            .catch(err => res.status(400).json('Notification Error: ' + err));

          comment.likes.unshift(newLike._id);
          comment.likeCount = ++comment.likeCount;

          comment.save()
            .catch(err => res.status(400).json('Like Error: ' + err));
        }).catch(err => res.status(400).json('Error, comment not found: ' + err));
    })
    .then(() => res.json(`Liked by ${req.user.handle}`))
    .catch(err => res.status(400).json('Error : ' + err));
});

// Unlike comment
router.route('/comments/:commentId').delete(ensureAuthenticated, (req, res) => {
  Like.findOneAndDelete({
    userId: req.user._id,
    commentId: req.params.commentId,
    likeType: 'comment'
  })
    .then(liked => {
      if (liked === null) {
        throw new Error(`User ${req.user.handle} not liked this comment yet`);
      }
      else {
        return liked;
      }
    })
    .then(liked => {
      return Comment.findById(req.params.commentId)
        .then(comment => {
          const toDelete = comment.likes.findIndex(deleteMe => {
            return deleteMe.toString() === liked._id.toString();
          });

          if (toDelete === -1) throw new Error('Allready unliked');
          else {
            comment.likeCount = --comment.likeCount;
            comment.likes.splice(toDelete, 1);
          }

          return comment.save()
            .catch(err => res.status(400).json('Comment Error: ' + err));
        });
    })
    .then(() => {
      return Notification.findOneAndDelete({
        commentId: req.params.commentId,
        senderId: req.user._id,
        notificationType: 'like-comment'
      });
    })
    .then(() => res.json('Unliked'))
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
