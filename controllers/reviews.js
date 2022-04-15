const Campground = require('../models/campground');
const Review = require('../models/review');
//? REVIEW ADDING
module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id; // so sánh để add author id cho user id mục đích làm author
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
};
//? REVIEW DELETING
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params; // kéo ID và reviewID ra
    // Dùng $pull để  removes from an existing array 
    // all instances of a value or values that match a specified condition.
    // { $pull: { <field1>: <value|condition>, <field2>: <value|condition>, ... } }

    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }) // findbyID update với điều kiện là pull
    // pull sẽ kéo tất cả những gì liên quan đế id đó và removes
    await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfully Deleting Review')
    res.redirect(`/campgrounds/${id}`)
};