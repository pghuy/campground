const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchasync.js');
const passport = require('passport');
const { route } = require('./campgroundroutes');
const users = require('../controllers/users');



//? REGISTER ROUTE LOGIN LOGIC
router.route('/register')
    .get(users.getRegister)
    .post(catchAsync(users.postRegister));
//?LOGIN ROUTE
router.route('/login')
    .get(users.getLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.postLogin);


//? LOGOUT ROUTE
router.get('/logout', users.getLogout);
module.exports = router;