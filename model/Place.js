import mongoose, { Schema, model } from "mongoose";

//create the user schema
let placeSchema = new Schema({
    id: {
        type: mongoose.ObjectId
    },
    geolocalisation: {
        type: [Number],
        required: true,
        validate: {
            validator: validateGeoJsonCoordinates,
            message: '{VALUE} is not a valid longitude/latitude(/altitude) coordinates array'
        }
    },
    floor: {
        type: String,
        enum: ['ss', 'rdc', '1', '2', '3'],
        required: [true, "You must enter a floor"]
    },
    description: {
        type: String,
        required: [true, "You must enter a description"],
        maxlength: 250
    },
    creationDate: {
        type: Date,
        default: Date.now
    }
})

// Hide the _v to the api users
placeSchema.set("toJSON", {
    transform: transformJsonObject
});

function transformJsonObject(doc, json, options) {
    // Remove the _v from the generated JSON.
    delete json.__v;
    return json;
}

//create model and export it
export const Place = model('Place', placeSchema)

// Validate a GeoJSON coordinates array (longitude, latitude and optional altitude).
function validateGeoJsonCoordinates(value) {
    return Array.isArray(value) && value.length >= 2 && value.length <= 3 && isLongitude(value[0]) && isLatitude(value[1]);
}

function isLatitude(value) {
    return value >= -90 && value <= 90;
}

function isLongitude(value) {
    return value >= -180 && value <= 180;
}