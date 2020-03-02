const router = require('express').Router();
const Post = require('../models/post.model');
const Like = require('../models/like.model');
const Comment = require('../models/comment.model');
const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const { ensureAuthenticated, bodyValidation } = require('../middlewares/validation');

// Get all posts
router.route('/').get(async(req, res) => {
  try {
    await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'comments likes',
        populate: {
          path: 'likes'
        }
      })
      .exec((err, posts) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (posts === null) return res.status(400).json('No any posts found');
        else return res.json(posts);
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Add new post
router.route('/add').post(ensureAuthenticated, async(req, res) => {
  try {
    const { error } = bodyValidation(req.body);
    if (error) return res.status(400).json(error.details[0].message);
    else {
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

      await newPost.save();
      await User.findById(req.user._id)
        .exec((err, user) => {
          if (err) return res.status(400).json('Error: ' + err);
          else if (user === null) return res.status(400).json('Internal error');
          else {
            user.posts.unshift(newPost._id);
            user.postCount = ++user.postCount;

            return user.save(() => {
              res.json('Post added!');
            });
          }
        });
    }
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Get one post by ID
router.route('/:id').get(async(req, res) => {
  try {
    await Post.findById(req.params.id)
      .populate({
        path: 'comments likes',
        populate: {
          path: 'likes'
        }
      })
      .exec((err, post) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (post === null) return res.status(400).json('No any posts found');
        else return res.json(post);
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Delete one post
router.route('/:id').delete(ensureAuthenticated, async(req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id)
      .exec(async(err, post) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (post === null) return res.status(400).json('Post not found');
        else {
          try {
            await Like.deleteMany({ postId: post._id });
            await Comment.deleteMany({ postId: post._id });
            await Notification.deleteMany({ postId: post._id });
            await User.findById(post.userId)
              .exec((err, user) => {
                if (err) return res.status(400).json('Error: ' + err);
                else if (user === null) return res.status(400).json('Internal error');
                else {
                  const toDelete = user.posts.findIndex(deleteMe => {
                    return deleteMe.toString() === req.params.id;
                  });
                  if (toDelete === -1) return res.status(400).json('Post not found');
                  else {
                    user.postCount = --user.postCount;
                    user.posts.splice(toDelete, 1);
                    return user.save(() => {
                      res.json('Post deleted');
                    });
                  }
                }
              });
          }
          catch (err) {
            res.status(400).json('Error: ' + err);
          }
        }
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Update Post
router.route('/update/:id').post(ensureAuthenticated, async(req, res) => {
  try {
    await Post.findById(req.params.id)
      .exec((err, post) => {
        if (err) return res.status(400).json('Error: ' + err);
        else if (post === null) return res.status(400).json('Post not found');
        else {
          const { error } = bodyValidation(req.body);
          if (error) return res.status(400).json(error.details[0].message);

          // posts.postId = req.body.postId;// _id: new mongoose.Types.ObjectId().toHexString(),
          post.body = req.body.body;

          return post.save(() => {
            res.json('Post updated!');
          });
        }
      });
  }
  catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

module.exports = router;
