import express from "express";
import { Place } from "../model/Place.js"
import authenticate from "../utils/auth.js";
const router = express.Router();


////////////////////////////////// GET
/**
 * @api {get} /places Request a list of all places
 * @apiName GetPlaces
 * @apiGroup Place
 * 
 * @apiQuery {Number} [floor] Optional filter to get places on a specific floor.
 *
 * @apiSuccess {Object[]} places List of places.
 * @apiSuccess {String} places._id Id of the place.
 * @apiSuccess {String} places.name Name of the place.
 * @apiSuccess {Number} places.floor Floor number of the place.
 * @apiSuccess {String} places.description Description of the place.
 * @apiSuccess {String} places.creationDate Creation date of the place.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *         {
 *             "_id": "5f8d3b70aad9e0b491cf7123",
 *             "name": "Place 1",
 *             "floor": 1,
 *             "description": "Description of Place 1",
 *             "creationDate": "2023-02-20T10:24:55.812Z"
 *         },
 *         // Additional places
 *     ]
 */

// Get all places
router.get("/", function (req, res, next) {
  Place.find().exec(function (err, place) {
    if (err) {
      return next(err)
    }
    //To filter the places by floor
    let query = Place.find().sort({ creationDate: -1 })
    if (req.query.floor) {
      query = query.where('floor').equals(req.query.floor);
    }

    query.exec(function (err, places) {
      if (err) {
        return next(err);
      }
      res.status(200).send(places)
    })
  })
});

/**
 * @api {get} /places/:id Request specific Place information
 * @apiName GetPlace
 * @apiGroup Place
 *
 * @apiParam {String} id Place's unique ID.
 *
 * @apiSuccess {String} _id Id of the Place.
 * @apiSuccess {String} name Name of the Place.
 * @apiSuccess {Number} floor Floor number of the Place.
 * @apiSuccess {String} description Description of the Place.
 * @apiSuccess {String} creationDate Creation date of the Place.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "5f8d3b70aad9e0b491cf7123",
 *       "name": "Specific Place",
 *       "floor": 2,
 *       "description": "Description of Specific Place",
 *       "creationDate": "2023-03-15T13:47:20.123Z"
 *     }
 */


// Get a specific place
router.get("/:id", function (req, res, next) {
  Place.findOne({ _id: req.params.id }).exec(function (err, place) {
    if (err) {
      return next(err)
    }
    res.status(200).send(place)
  })
});

/////////////////////////////////////// POST
/**
 * @api {post} /places Create a new place
 * @apiName CreatePlace
 * @apiGroup Place
 *
 * @apiHeader {String} Authorization User's access token.
 * @apiBody {String} name Name of the Place.
 * @apiBody {Number} floor Floor number of the Place.
 * @apiBody {String} description Description of the Place.
 *
 * @apiSuccess {String} _id Id of the created Place.
 * @apiSuccess {String} name Name of the Place.
 * @apiSuccess {Number} floor Floor number of the Place.
 * @apiSuccess {String} description Description of the Place.
 * @apiSuccess {String} creationDate Creation date of the Place.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "_id": "6a9e4b21bcf1e2c543da8765",
 *       "name": "New Place",
 *       "floor": 3,
 *       "description": "Description of New Place",
 *       "creationDate": "2023-04-10T16:30:00.812Z"
 *     }
 */


// Create new place
router.post("/", authenticate, async function (req, res, next) {
  //Get the place created
  const newPlace = new Place(req.body)
  //save new place created
  newPlace.save(function (err, savedPlace) {
    if (err) {
      return next(err)
    }
    res.status(201).send(savedPlace)
  })
})


///////////////////////////////////// DELETE

/**
 * @api {delete} /places/:id Delete a place
 * @apiName DeletePlace
 * @apiGroup Place
 *
 * @apiParam {String} id Place's unique ID.
 * @apiHeader {String} Authorization User's access token.
 *
 * @apiSuccess {String} message Success message confirming the deletion.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Deleted successfully!"
 *     }
 */


// DELETE route to delete an item
router.delete("/:id", authenticate, function (req, res, next) {
  Place.findByIdAndDelete(req.params.id, function (err) {
    if (err) return next(err);
    res.status(200).send('Deleted successfully!');
  });
});


///////////////////////////////////// PUT
/**
 * @api {put} /places/:id Update a place
 * @apiName UpdatePlace
 * @apiGroup Place
 *
 * @apiParam {String} id Place's unique ID.
 * @apiHeader {String} Authorization User's access token.
 * @apiBody {Object} geolocalisation New geolocalisation of the Place.
 * @apiBody {Number} floor New floor number of the Place.
 * @apiBody {String} description New description of the Place.
 *
 * @apiSuccess {Object} updatedPlace The updated place object.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "6a9e4b21bcf1e2c543da8765",
 *       "geolocalisation": {"lat": 48.8566, "lng": 2.3522},
 *       "floor": 3,
 *       "description": "Updated description of the Place",
 *       "creationDate": "2023-04-10T16:30:00.812Z"
 *     }
 */


// PUT route to update an item
router.put("/:id", authenticate, function (req, res, next) {
  Place.findByIdAndUpdate({ _id: req.params.id }, {
    geolocalisation: req.body.geolocalisation,
    floor: req.body.floor,
    description: req.body.description
  }, { new: true, runValidators: true }).exec(async function (err, updatedPlace) {
    if (err) {
      return next(err)
    }
    res.status(200).send(updatedPlace)
  })
});

export default router;