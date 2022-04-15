const { campgroundSchema, reviewSchema } = require('./schemas.js')
const ExpressError = require('./utils/expresserror.js');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    console.log("REQ.USER...", req.user)
    // Khi không loggin --> trả về REQ.USER... undefined
    // Khi có login trả về : 
    //REQ.USER... {
        //   _id: 60ff072d6560bb1b74a8976e,
        //   email: 'bob@gmail.com',
        //   username: 'bob',
        //   __v: 0
        // }

    if (!req.isAuthenticated()) {
        // returnTo là url sẽ dc redirect sau khi login thanh cong
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in')
        return res.redirect('/login');
    }
    next();
}


module.exports.validationCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)  // error.details có nhiều value nên phải join lại với nhau
    } else {
        next()
    }
}
module.exports.isAuthor = async (req,res, next)=>{
    const {id}   = req.params;
    const campground = await Campground.findById(id)
    // Check campground có thuộc user ko ?
    if (!campground.author.equals(req.user._id)){
        req.flash('error','You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)  // error.details có nhiều value nên phải join lại với nhau
    } else {
        next();
    }
}
