import mongoose, { Schema, model } from "mongoose";

//create the object schema
let objectSchema = new Schema({
    id: {
        type: mongoose.ObjectId
    },
    name: {
        type: String,
        required: [true, 'You must provide a name!'],
        maxLength: 30,
        minLength: 3
    },
    picture: {
        type: String,
        required: [true, 'You must provide a picture!']
    },
    description: {
        type: String,
        minLength: 3,
        maxLength: 250
    },
    creationDate: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.ObjectId,
        required: [true, 'You must provide a userId!'],
        ref: "User"
    },
    placeId: {
        type: mongoose.ObjectId,
        required: [true, 'You must provide a placeId!'],
        ref: "Place"
    },
})

// Hide the _v to the api users
objectSchema.set("toJSON", {
    transform: transformJsonObject
});

function transformJsonObject(doc, json, options) {
    // Remove the _v from the generated JSON.
    delete json.__v;
    return json;
}

//create model and export it
export const Object = model('Object', objectSchema)