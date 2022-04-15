//?ACcess .env
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

// require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchasync')
const ExpressError = require('./utils/expresserror')
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const { notDeepEqual } = require('assert');
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const Review = require('./models/review')
const userRoutes = require('./routes/userroutes')
const campgroundRoutes = require('./routes/campgroundroutes'); //! Điểm kết nối module router
const reviewsRoutes = require('./routes/reviewroutes');//! Điểm kết nối module router
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const MongoStore = require('connect-mongo');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'; // MONGO ATLAS VERSION
// const dbUrl = 'mongodb://localhost:27017/yelp-camp'; // LOCAL VERSION
//* ERROR HANDLING
//? Mongoose connect ATLAS ONLINE
// mongoose.connect(dbUrl, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false,
// })

// //? Mongoose connect LOCAL
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});


const db = mongoose.connection; // đặt db = mongoose connection để rút gọn 
db.on("error", console.error.bind(console, 'connection error:'));
db.once("open", () => {
    console.log("Database connected");
});

app.use(methodOverride('_method'))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize());
//?SESSION AND FLASH
//? USE MONGO STORE FOR STORING SESSION
const secret = process.env.SECRET || 'thisisasecret';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24*3600, // don't want to resave all the session on 
                       // database every single time that the user refresh the page, you can lazy update the session, by limiting a period of time.
                       // saying to the session be updated only one time in a period of 24 hours, does not matter how many request's are made
});
store.on("error", function(e){
    console.log("SESSION STORE ERROR", e)
});
//? Config SESSION
const sessionConfig = {
    store,
    // name: 'blablabla'   //Change name to prevent tracking of session
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        // httpOnly 1 kiểu flag để ngăn chặn client vào
        // cookie và cookie bị lộ 
        httpOnly: true, // block user access through JavasScript
        // set thời gian expire 
        // secure: true, // turn on https mode
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,  // date.now hiển thị dưới dạng ms , ví dụ
        // muốn hết hạn trong 1 tuần thì phải convert tuần --> ms
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

//? Helmet contentSecurityPolicy
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/db4sgsafi/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//?PASSPORT
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
// --> we want passport to use the LocalStrategy
// for that LocalStrategy the authenticate is used on User
passport.serializeUser(User.serializeUser())
// tell passport how to serialize ( how to store the user in session )
passport.deserializeUser(User.deserializeUser())
// tell passport how to deserialize( how to unstore the user in session )

//?FLASH MIDDLEWARE
app.use((req, res, next) => {
    // console.log(req.query);
    // console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//? TẠO THỬ 1 FAKE USER 
// app.get('/fakeUser', async (req, res) => {
//     const user = new User({ email: 'huyi@gmail.com', username: 'huiyyy' })
//     const newUser = await User.register(user, 'thisisapassword') // addd user and pass word and take them to be harhsed make salt and storethem
//     res.send(newUser);
// })



app.use('/', userRoutes)
//! Điểm kết nối module router của ./routes/campground.js
app.use('/campgrounds', campgroundRoutes)
//! Điểm kết nối module router của ./routes/review.js
app.use('/campgrounds/:id/reviews', reviewsRoutes)

app.get('/', (req, res) => {
    res.render('home');
})

//? Error cho sai route 
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//? TẠO 1 HANDLING ERROR MIDDLEWARE
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Some thing went wrong"
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})

