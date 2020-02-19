const Joi = require('@hapi/joi');

module.exports = {

  registerValidation: (data) => {
    const schema = Joi.object({
      email: Joi.string().min(6).required().email(),
      password: Joi.string().min(6).required(),
      password2: Joi.string().min(6).required(),
      handle: Joi.string().min(3).required()
    });
    return schema.validate(data);
  },

  loginValidation: (data) => {
    const schema = Joi.object({
      email: Joi.string().min(6).required().email(),
      password: Joi.string().min(6).required()
    });
    return schema.validate(data);
  },

  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    console.log('Please log in to view that resource');
    res.redirect('/users/login');
  },

  forwardAuthenticated: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  },

  notloggedIn: (req, res, next) => {
    if (req.user) {
      res.send('User already logged in');
    }
    else {
      next();
    }
  }

};
