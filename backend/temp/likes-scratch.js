const router = require('express').Router();
const Pusher = require('pusher');
const Like = require('../models/like.model');
const Comment = require('../models/comment.model');
const Scream = require('../models/screams.model');
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

// Like scream
router.route('/add/:screamId').post(ensureAuthenticated, (req, res) => {
  Like.findOne({
    userId: req.user._id,
    screamId: req.params.screamId,
    likeType: 'scream'
  })
    .then(liked => {
      // console.log(liked); // null, findOne result
      if (liked !== null) {
        throw new Error(`User ${req.user.handle} is already liked this scream`);
      }
    })
    .then(() => {
      return Scream.findById(req.params.screamId);
    })
    .then(scream => {
      const userHandle = req.user.handle;
      const screamId = req.params.screamId;
      const userId = req.user._id;
      const likeType = 'scream';

      const newLike = new Like({
        screamId,
        userHandle,
        userId,
        likeType
      });

      return newLike.save()
        .then(() => {
          const senderId = req.user._id;
          const senderName = req.user.handle;
          const receiverId = scream.userId;
          const receiverName = scream.userHandle;
          // const screamId = scream._id;
          const notificationType = 'like-scream';

          const newNotification = new Notification({
            senderId,
            senderName,
            receiverId,
            receiverName,
            screamId,
            notificationType
          });

          return newNotification;
        })
        .then(newNotification => {
          newNotification.save();

          scream.likes.unshift(newLike._id);
          scream.likeCount = ++scream.likeCount;
        })
        .then(() => {
          pusher.trigger('Twitter', 'like-scream', {
            // message: 'hello world'
          });
        })
        .catch(err => res.status(400).json('Like Error: ' + err));
    })
    .then(scream => {
      scream.save();
    })
    .then(() => res.json(`Liked by ${req.user.handle}`))
    .catch(err => res.status(400).json('Scream Error: ' + err));
});

// Unlike scream
router.route('/:screamId').delete(ensureAuthenticated, (req, res) => {
  Like.findOneAndDelete({
    userId: req.user._id,
    screamId: req.params.screamId,
    likeType: 'scream'
  })
    .then(liked => {
      if (liked === null) {
        throw new Error(`User ${req.user.handle} not liked this scream yet`);
      }
      else return liked;
    })
    .then(liked => {
      return Scream.findById(req.params.screamId)
        .then(scream => {
          const toDelete = scream.likes.findIndex(deleteMe => {
            return deleteMe.toString() === liked._id.toString();
          });

          if (toDelete === -1) throw new Error('Allready unliked');
          else {
            scream.likeCount = --scream.likeCount;
            scream.likes.splice(toDelete, 1);
            return scream;
          }
        })
        .then(scream => {
          scream.save();
        })
        .then(() => {
          Notification.findOneAndDelete({
            senderId: req.user._id,
            screamId: req.params.screamId,
            notificationType: 'like-scream'
          });
        })
        .then(() => {
          res.json('Unliked');
        })
        .catch(err => res.status(400).json('Scream Error: ' + err));
    })
    .catch(err => res.status(400).json('Like Error: ' + err));
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
      const screamId = comment.screamId;
      const userId = req.user._id;
      const commentId = comment._id;
      const likeType = 'comment';

      const newLike = new Like({
        screamId,
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
          const screamId = comment.screamId;
          // const commentId = comment._id;
          const notificationType = 'like-comment';

          const newNotification = new Notification({
            senderId,
            senderName,
            receiverId,
            receiverName,
            screamId,
            commentId,
            notificationType
          });

          return newNotification;
        })
        .then(newNotification => {
          newNotification.save();

          comment.likes.unshift(newLike._id);
          comment.likeCount = ++comment.likeCount;
        })
        .then(() => {
          return pusher.trigger('Twitter', 'like-comment', {
          // message: 'hello world'
          });
        })
        .catch(err => res.status(400).json('Like Error: ' + err));
    })
    .then(comment => {
      return comment.save();
    })
    .then(() => res.json(`Liked by ${req.user.handle}`))
    .catch(err => res.status(400).json('Comment Error: ' + err));
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
          return comment;
        })
        .then(comment => {
          return comment.save();
        })
        .then(() => {
          return Notification.findOneAndDelete({
            commentId: req.params.commentId,
            senderId: req.user._id,
            notificationType: 'like-comment'
          });
        })
        .then(() => {
          return res.json('Unliked');
        })
        .catch(err => res.status(400).json('Comment Error: ' + err));
    })
    .catch(err => res.status(400).json('Like Error: ' + err));
});

module.exports = router;
