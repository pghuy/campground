const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchasync')
const ExpressError = require('../utils/expresserror')
const Campground = require('../models/campground');
const Review = require('../models/review')
const { campgroundSchema, reviewSchema } = require('../schemas.js')
const { isLoggedIn, isAuthor, validationCampground } = require('../isloginmiddleware.js')
const {storage} = require('../cloudinary')
const campgrounds = require('../controllers/campgrounds')
const multer  = require('multer')
const upload = multer({storage})


router.get('/new', isLoggedIn, campgrounds.renderNewForm)
router.route('/')
    .get(catchAsync(campgrounds.index)) //? INDEX
    .post(isLoggedIn, upload.array('image'), validationCampground, catchAsync(campgrounds.createCampground));
    // .post(upload.single('campground[image]'),(req,res) => {
    //     console.log(req.body ,req.file);
    //     res.send("IT WORKS")
    // })


router.route('/:id') 
    .put(isLoggedIn, isAuthor, upload.array('image'), validationCampground, catchAsync(campgrounds.updateCampground))//? EDIT and UPDATE
    .get(catchAsync(campgrounds.showCampground)) //? SHOW
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); //?  DELETE



// /campgrounds/new' phải đế trước /campgrounds/:id
// vì nếu ngược lại /campgrounds/:id sẽ lấy new là 1 id

//? EDIT
router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgrounds.editCampground));

module.exports = router;