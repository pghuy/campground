const express = require('express');
const router = express.Router({ mergeParams: true });  // Merge param dùng để đồng hóa param giữa app.js và routers như /routes/review.js 
const catchAsync = require('../utils/catchasync');
const { reviewSchema } = require('../schemas.js');

const ExpressError = require('../utils/expresserror.js');
const Campground = require('../models/campground');
const Review = require('../models/review')
const Joi = require('joi');
const { validateReview , isLoggedIn, isReviewAuthor} = require('../isloginmiddleware.js')
const reviews = require('../controllers/reviews')

//*REVIEW
//? REVIEW ADDING
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));


//? REVIEW DELETING

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;