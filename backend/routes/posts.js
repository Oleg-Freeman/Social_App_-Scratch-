const router = require('express').Router();
const Post = require('../models/post.model');
const Like = require('../models/like.model');
const Comment = require('../models/comment.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const { ensureAuthenticated, bodyValidation } = require('../middlewares/validation');

// Get all posts
router.route('/').get((req, res) => {
  Post.find()
    .sort({ createdAt: -1 })
    .populate({
      path: 'comments likes',
      populate: {
        path: 'likes'
      }
    })
    .then(posts => res.json(posts))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add new post
router.route('/add').post(ensureAuthenticated, (req, res) => {
  const { error } = bodyValidation(req.body);
  if (error) return res.status(400).json(error.details[0].message);

  // const postId = req.body.postId; // _id: new mongoose.Types.ObjectId().toHexString(),
  const userHandle = req.user.handle;
  const body = req.body.body;
  const imageURL = req.user.imageURL;
  const userId = req.user._id;

  const newPost = new Post({
    userHandle,
    body,
    imageURL,
    userId
  });

  return newPost.save()
    .then(() => {
      return User.findById(req.user._id);
    })
    .then(user => {
      user.posts.unshift(newPost._id);
      user.postCount = ++user.postCount;

      return user.save();
    })
    .then(() => res.json('Post added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get one post by ID
router.route('/:id').get((req, res) => {
  Post.findById(req.params.id)
    .populate({
      path: 'comments likes',
      populate: {
        path: 'likes'
      }
    })
    .then(post => res.json(post))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Delete one post
router.route('/:id').delete(ensureAuthenticated, (req, res) => {
  return Post.findByIdAndDelete(req.params.id)
    .then(post => {
      Like.deleteMany({ postId: post._id })
        .catch(err => res.status(400).json('Error: ' + err));
      return post;
    })
    .then(post => {
      Comment.deleteMany({ postId: post._id })
        .catch(err => res.status(400).json('Error: ' + err));
      return post;
    })
    .then(post => {
      Notification.deleteMany({ postId: post._id })
        .catch(err => res.status(400).json('Error: ' + err));
      return post;
    })
    .then(post => {
      return User.findById(post.userId);
    })
    .then(user => {
      const toDelete = user.posts.findIndex(deleteMe => {
        return deleteMe.toString() === req.params.id;
      });
      if (toDelete === -1) throw new Error('Post not found');
      else {
        user.postCount = --user.postCount;
        user.posts.splice(toDelete, 1);
      }
      return user.save()
        .catch(err => res.status(400).json('Post Error: ' + err));
    })
    .then(() => res.json('Post Deleted'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update Post
router.route('/update/:id').post(ensureAuthenticated, (req, res) => {
  Post.findById(req.params.id)
    .then(post => {
      const { error } = bodyValidation(req.body);
      if (error) return res.status(400).json(error.details[0].message);

      // posts.postId = req.body.postId;// _id: new mongoose.Types.ObjectId().toHexString(),
      post.body = req.body.body;

      return post.save()
        .then(() => res.json('Post updated!'))
        .catch(err => res.status(400).json('Error: ' + err));
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
