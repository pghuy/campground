
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities')
const {places, descriptors} = require('./seedHelpers')


mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
})

const db = mongoose.connection; // đặt db = mongoose connection để rút gọn 
db.on("error", console.error.bind(console, 'connection error:'));
db.once("open", () =>{
    console.log("Database connected");
});
const sample = (array) => array[Math.floor(Math.random() *array.length)];

const seedDB = async () =>{
    await Campground.deleteMany({});
    for(let i=0; i<200; i++) {
        const random1000 = Math.floor(Math.random()*1000);
        const randomLat =  Math.floor((Math.random() * 90) * ((Math.random()) ? 1 : -1));
        const randomLon = Math.floor((Math.random() * 90) * ((Math.random()) ? 1 : -1));
        const price = Math.floor(Math.random()*30);
        const camp =  new Campground({
            author:'60ff9ff55ec00214e0004743',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)} `,
            description:'This is the descriptionnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn',
            price,
            geometry:{
                type:"Point",
                coordinates: [
                    cities[randomLon].longitude,
                    cities[randomLat].latitude
                ]},
            images: [
                {
                  url: 'https://res.cloudinary.com/db4sgsafi/image/upload/v1628667617/YelpCamp/1.jpg',
                  filename: 'YelpCamp/1'
                },
                {
                    url: 'https://res.cloudinary.com/db4sgsafi/image/upload/v1628667598/YelpCamp/2.jpg',
                    filename: 'YelpCamp/2'
                  }
            ]});
        await camp.save();
    }
}

// Run seedDB and Close Connection
// Có nghĩ là sau khi tạo database xong thì tự close luôn
seedDB().then(() => {
    mongoose.connection.close();
})