module.exports = {
  notloggedIn: function(req, res, next) {
    if (req.user) {
      res.send('User already logged in');
    }
    else {
      next();
    }
  }
};
