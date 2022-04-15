const mongoose = require('mongoose');
const Review = require('./review') // phải bổ sung cái này để sử dụng review cho middleware ở dưới
const Schema = mongoose.Schema

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: {virtuals: true}};

const CampgroundSchema = new Schema ({
    title : String,
    images: [ImageSchema],
    //MAPBOX:
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    // thêm author để cấp quyền cho từng Id
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    // Inject reviews object ID to campground to
    // link review with campground
    reviews: [{
        type: Schema.Types.ObjectId,
        ref:"Review"
    }]
},opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});



CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc){
        await Review.remove({     // remove all reviews that have id in doc that have just been deleted
            _id:{
                $in: doc.reviews      
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);
