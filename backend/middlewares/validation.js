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
  },
  reduseUserDetails: (data) => {
    const userDetails = {};
    if (!data.bio.trim().isEmpty()) userDetails.bio = data.bio;
    if (!data.website.trim().isEmpty()) {
      if (data.website.trim().substring(0, 4) !== 'http') {
        userDetails.website = `http://${data.website.trim()}`;
      }
      else userDetails.website = data.website;
    }
    if (!data.location.trim().isEmpty()) userDetails.location = data.location;
    if (!data.birthDay.trim().isEmpty()) userDetails.birthDay = data.birthDay;
    return userDetails;
  },

  userDetailsValidation: (data) => {
    const schema = Joi.object({
      bio: Joi.string().empty().not(' '),
      website: Joi.string().uri().empty().not(' '),
      location: Joi.string().empty().not(' '),
      birthDay: Joi.date().empty().less('now').greater('1-1-1').iso().not(' ')
    });
    return schema.validate(data);
  },

  bodyValidation: (data) => {
    const schema = Joi.object({
      body: Joi.string().empty().not(' ')
    });
    return schema.validate(data);
  }

};
