import express from "express";
import { Object } from "../model/Object.js"
import { User } from "../model/User.js";
import { Place } from "../model/Place.js";
import { broadcastMessage } from "../ws.js";
import authenticate from "../utils/auth.js";
const router = express.Router();


////////////////////////////////// GET
/**
 * @api {get} /objects Request a list of all objects
 * @apiName GetObjects
 * @apiGroup Object
 *
 * @apiSuccess {Object[]} objects List of objects.
 * @apiSuccess {String} objects._id Id of the object.
 * @apiSuccess {String} objects.name Name of the object.
 * @apiSuccess {String} objects.description Description of the object.
 * @apiSuccess {String} objects.userId Id of the user who created the object.
 * @apiSuccess {String} objects.placeId Id of the place where the object is located.
 * @apiSuccess {String} objects.creationDate Creation date of the object.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *         {
 *             "_id": "5f8d3b70aad9e0b491cf7123",
 *             "name": "Object 1",
 *             "description": "Description of Object 1",
 *             "userId": "6537d3b70aad9f0b491cf700",
 *             "placeId": "6a9e4b21bcf1e2c543da8765",
 *             "creationDate": "2023-02-20T10:24:55.812Z"
 *         },
 *         // Additional objects
 *     ]
 */


// Get all objects
router.get("/", function (req, res, next) {
  Object.find().populate(['userId', 'placeId']).exec(function (err, object) {
    if (err) {
      return next(err)
    }
    res.status(200).send(object)
  })
});

// Get a specific object
/**
 * @api {get} /objects/:id Request specific Object information
 * @apiName GetObject
 * @apiGroup Object
 *
 * @apiParam {String} id Object's unique ID.
 *
 * @apiSuccess {String} _id Id of the Object.
 * @apiSuccess {String} name Name of the Object.
 * @apiSuccess {String} description Description of the Object.
 * @apiSuccess {String} userId Id of the user who created the Object.
 * @apiSuccess {String} placeId Id of the place where the Object is located.
 * @apiSuccess {String} creationDate Creation date of the Object.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "5f8d3b70aad9e0b491cf7123",
 *       "name": "Specific Object",
 *       "description": "Description of Specific Object",
 *       "userId": "6537d3b70aad9f0b491cf700",
 *       "placeId": "6a9e4b21bcf1e2c543da8765",
 *       "creationDate": "2023-03-15T13:47:20.123Z"
 *     }
 */

router.get("/:id", function (req, res, next) {
  Object.findOne({ _id: req.params.id }).populate(['userId', 'placeId']).exec(function (err, object) {
    if (err) {
      return next(err)
    }
    res.status(200).send(object)
  })
});

/////////////////////////////////////// POST

/**
 * @api {post} /objects Create a new object
 * @apiName CreateObject
 * @apiGroup Object
 *
 * @apiHeader {String} Authorization User's access token.
 * @apiBody {String} name Name of the Object.
 * @apiBody {String} description Description of the Object.
 * @apiBody {String} userId Id of the user who is creating the Object.
 * @apiBody {String} placeId Id of the place where the Object is located.
 *
 * @apiSuccess {String} _id Id of the created Object.
 * @apiSuccess {String} name Name of the Object.
 * @apiSuccess {String} description Description of the Object.
 * @apiSuccess {String} userId Id of the user who created the Object.
 * @apiSuccess {String} placeId Id of the place where the Object is located.
 * @apiSuccess {String} creationDate Creation date of the Object.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "_id": "6b7e4c22bcf1e3d543da9876",
 *       "name": "New Object",
 *       "description": "Description of New Object",
 *       "userId": "6537d3b70aad9f0b491cf701",
 *       "placeId": "6a9e4b21bcf1e2c543da8766",
 *       "creationDate": "2023-04-10T17:30:00.812Z"
 *     }
 */

// Create new object
router.post("/", authenticate, async function (req, res, next) {
  const newObject = new Object(req.body)
  newObject.save(function (err, savedObject) {
    if (err) {
      return next(err)
    }
    res.status(201).send(savedObject)

    User.findOne({ _id: newObject.userId }).exec(function (userErr, user) {
      if (userErr || !user) {
        return next(userErr || new Error('User not found'));
      }

      Place.findOne({ _id: newObject.placeId }).exec(function (placeErr, place) {
        if (placeErr || !place) {
          return next(placeErr || new Error('Place not found'));
        }

        broadcastMessage({ Update: `New object found by ${user.userName} at ${place.description}`, newObject: newObject });
      });
    });
  })
})



///////////////////////////////////// DELETE
/**
 * @api {delete} /objects/:id Delete an object
 * @apiName DeleteObject
 * @apiGroup Object
 *
 * @apiParam {String} id Object's unique ID.
 * @apiHeader {String} Authorization User's access token.
 *
 * @apiSuccess {String} message Success message confirming the deletion.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "Deleted successfully!"
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "message": "Don't have the rights to do that"
 *     }
 */

// DELETE route to delete an item
router.delete("/:id", authenticate, function (req, res, next) {
  Object.findOne({ _id: req.params.id }).populate(['userId']).exec(function (err, object) {
    if (err) {
      return next(err)
    }
    if (object?.userId?._id == req.currentUserId || object?.userId?.admin) {
      Object.findByIdAndDelete(req.params.id, function (err) {
        if (err) return next(err);
        res.status(200).send('Deleted successfully!');
      });
    } else {
      res.status(403).send("Don't have the rights to do that")
    }
  })
});



///////////////////////////////////// PUT
/**
 * @api {put} /objects/:id Update an object
 * @apiName UpdateObject
 * @apiGroup Object
 *
 * @apiParam {String} id Object's unique ID.
 * @apiHeader {String} Authorization User's access token.
 * @apiBody {String} name New name of the Object.
 * @apiBody {String} picture New picture of the Object.
 * @apiBody {String} description New description of the Object.
 *
 * @apiSuccess {Object} updatedObject The updated object.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "6b7e4c22bcf1e3d543da9876",
 *       "name": "Updated Object",
 *       "picture": "picture_url",
 *       "description": "Updated description of the Object",
 *       "creationDate": "2023-04-10T17:30:00.812Z"
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "message": "Don't have the rights to do that"
 *     }
 */

// PUT route to update an item
router.put("/:id", authenticate, function (req, res, next) {
  Object.findOne({ _id: req.params.id }).populate(['userId']).exec(function (err, object) {
    if (err) {
      return next(err)
    }
    //If the correct user is logged in we update the object
    if (object?.userId?._id == req.currentUserId || object?.userId?.admin) {
      Object.findByIdAndUpdate({ _id: req.params.id }, {
        name: req.body.name,
        picture: req.body.picture,
        description: req.body.description
      }, { new: true, runValidators: true }).exec(function (err, updatedObject) {
        if (err) {
          return next(err)
        }
        res.status(200).send(updatedObject)
      })
    } else {
      res.status(403).send("Don't have the rights to do that")
    }
  })
})
export default router;