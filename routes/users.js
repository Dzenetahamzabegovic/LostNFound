import express from "express";
import bcrypt from "bcrypt";
import { User } from "../model/User.js"
import { Object } from "../model/Object.js";
import authenticate from "../utils/auth.js"
const router = express.Router();


////////////////////////////////// GET
/**
 * @api {get} /users Request a list of the users
 * @apiName GetUsers
 * @apiGroup User
 * 
 * @apiQuery {Number} pageSize The number of element to show on a page (pagination)
 * @apiQuery {Number} page The page number that you want to show (pagination)
 *
 * @apiSuccess {Object[]} users List of users
 * @apiSuccess {String} users._id Id of the users
 * @apiSuccess {Boolean} users.admin Role of the users
 * @apiSuccess {String} users.firstName Firstname of the users
 * @apiSuccess {String} users.lastName Lastname of the users
 * @apiSuccess {String} users.userName Username of the users
 * @apiSuccess {String} users.creationDate Creation date of the users
 * 
 * @apiSuccessExample {json} Succes-Response:
 *HTTP/1.1 200 OK
 *[
    {
        "_id": "6537d3b70aad9f0b491cf700",
        "admin": false,
        "firstName": "user",
        "lastName": "test",
        "userName": "testuser",
        "creationDate": "2023-10-24T14:24:55.812Z"
    }
]
 */
// Get all users
router.get("/", function (req, res, next) {
  User.find().exec(function (err, user) {
    if (err) {
      return next(err)
    }
    const maxPage = 10

    let page = parseInt(req.query.page, 10);
    if (isNaN(page) || page < 1) {
      page = 1
    }

    let pageSize = parseInt(req.query.pageSize, 10);
    if (isNaN(pageSize) || pageSize < 0 || pageSize > maxPage) {
      pageSize = maxPage;
    }

    //Aggregation
    User.aggregate([
      {
        $lookup: {
          from: 'objects',
          localField: '_id',
          foreignField: 'userId',
          as: 'objectsPosted'
        }
      },
      {
        $unwind: {
          path: '$objectsPosted',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          objectsPosted: {
            $cond: {
              if: '$objectsPosted',
              then: 1,
              else: 0
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id',
          admin: { $first: '$admin' },
          firstName: { $first: '$firstName' },
          lastName: { $first: '$lastName' },
          userName: { $first: '$userName' },
          email: { $first: '$email'},
          creationDate: { $first: '$creationDate' },
          objectsPosted: { $sum: '$objectsPosted' }
        }
      },
      {
        $sort: {
          creationDate: -1
        }
      },
      {
        $skip: (page - 1) * pageSize
      },
      {
        $limit: pageSize
      }
    ], function (err, users) {
      if (err) {
        return next(err);
      }
      res.status(200).send(users.map(user => {
        const serialized = new User(user).toJSON() //Transform user to Mongoose model
        serialized.objectsPosted = user.objectsPosted //Add the aggregated property
        return serialized
      }))
    })
  })
});

/**
 * @api {get} /users/:id Request User information
 * @apiName GetUser
 * @apiGroup User
 *
 * @apiParam {String} id Users unique ID.
 *
 * @apiSuccess {String} _id Id of the User.
 * @apiSuccess {Boolean} admin Role of the User.
 * @apiSuccess {String} firstName Firstname of the User.
 * @apiSuccess {String} lastName Lastname of the User.
 * @apiSuccess {String} userName Username of the User.
 * @apiSuccess {String} creationDate Creation date of the User.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "6537d3b70aad9f0b491cf700",
 *       "admin": true,
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "userName": "johndoe",
 *       "creationDate": "2023-01-24T11:37:00.812Z"
 *     }
 */

// Get a specific user
router.get("/:id", function (req, res, next) {
  User.findOne({_id: req.params.id}).exec(function (err, user) {
    if(err) {
      return next(err)
    }
    res.status(200).send(user)
  })
});

/**
 * @api {get} /users/:id/objects Request Objects posted by a User
 * @apiName GetUserObjects
 * @apiGroup User
 *
 * @apiParam {String} id User's unique ID.
 *
 * @apiSuccess {Object[]} objects List of objects posted by the User.
 * @apiSuccess {String} objects._id Id of the object.
 * @apiSuccess {String} objects.name Name of the object.
 * @apiSuccess {String} objects.description Description of the object.
 * @apiSuccess {String} objects.creationDate Creation date of the object.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *         {
 *             "_id": "5f8d3b70aad9e0b491cf7123",
 *             "name": "Object 1",
 *             "description": "Description of Object 1",
 *             "creationDate": "2023-02-20T10:24:55.812Z"
 *         },
 *         {
 *             "_id": "6a9e4b21bcf1e2c543da8765",
 *             "name": "Object 2",
 *             "description": "Description of Object 2",
 *             "creationDate": "2023-02-21T15:47:35.123Z"
 *         }
 *     ]
 */


// Get all the objects posted by a user

router.get("/:id/objects", function (req, res, next) {
  User.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    Object.find({ userId: req.params.id }).exec(function (err, objects) {
      if (err) {
        return next(err);
      }
      res.status(200).send({objects, user})
    })
  })
});



/////////////////////////////////////// POST

/**
 * @api {post} /users Create a new user
 * @apiName CreateUser
 * @apiGroup User
 *
 * @apiBody {String} userName Username of the User.
 * @apiBody {String} password Password of the User.
 * @apiBody {String} firstName Firstname of the User.
 * @apiBody {String} lastName Lastname of the User.
 * @apiBody {Boolean} admin Role of the User.
 *
 * @apiSuccess {String} _id Id of the created User.
 * @apiSuccess {String} userName Username of the User.
 * @apiSuccess {String} firstName Firstname of the User.
 * @apiSuccess {String} lastName Lastname of the User.
 * @apiSuccess {Boolean} admin Role of the User.
 * @apiSuccess {String} creationDate Creation date of the User.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "_id": "6543d3b70aad9f0b491cf750",
 *       "userName": "newuser",
 *       "firstName": "New",
 *       "lastName": "User",
 *       "admin": false,
 *       "creationDate": "2023-03-24T08:24:55.812Z"
 *     }
 */


// Create new user
router.post("/", async function (req, res, next) {
  const plainPassword = req.body.password;
  const costFactor = 10;
  bcrypt.hash(plainPassword, costFactor, function (err, hashedPassword) {
    if (err) {
      return next(err)
    }
    //Get the user created
    const newUser = new User(req.body)
    //Change the password to the hashed one
    newUser.password = hashedPassword;
    //save new user
    newUser.save(function (err, savedUser) {
      if (err) {
        return next(err)
      }
      res.status(201).send(savedUser)
    })
  })
})


///////////////////////////////////// DELETE

/**
 * @api {delete} /users/:id Delete a user
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiParam {String} id User's unique ID.
 * @apiHeader {String} Authorization User's access token.
 *
 * @apiSuccess {Object} removedUser The deleted user object.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "6537d3b70aad9f0b491cf700",
 *       "userName": "deleteduser",
 *       "firstName": "Deleted",
 *       "lastName": "User",
 *       "admin": false,
 *       "creationDate": "2023-01-24T14:24:55.812Z"
 *     }
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 403 Forbidden
 *     {
 *       "message": "Don't have the rights to do that"
 *     }
 */

// Delete a user
router.delete("/:id", authenticate, function (req, res, next) {
  User.findOne({ _id: req.params.id }).exec(function (err, user) {
    if (err) {
      return next(err)
    }
    //If the correct user is logged in we delete it
    if (req.params.id == req.currentUserId) {
      User.findByIdAndDelete({ _id: req.params.id }).exec(function (err, removedUser) {
        if (err) {
          return next(err)
        }
        res.status(200).send(removedUser)
      })
    } else {
      res.status(403).send("Don't have the rights to do that")
    }
  })
});

//////////////////////////////////// PUT

/**
 * @api {put} /users/:id Update a user's profile
 * @apiName UpdateUser
 * @apiGroup User
 *
 * @apiParam {String} id User's unique ID.
 * @apiHeader {String} Authorization User's access token.
 * @apiBody {String} [firstName] New first name of the User.
 * @apiBody {String} [lastName] New last name of the User.
 * @apiBody {String} [userName] New username of the User.
 * @apiBody {String} [email] New email of the User.
 * @apiBody {Boolean} [admin] New admin status (only if the current user is an admin).
 *
 * @apiSuccess {Object} updatedUser The updated user object.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "6537d3b70aad9f0b491cf700",
 *       "firstName": "Updated",
 *       "lastName": "User",
 *       "userName": "updateduser",
 *       "email": "updated@example.com",
 *       "admin": false,
 *       "creationDate": "2023-01-24T14:24:55.812Z"
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
  User.findOne({ _id: req.params.id }).exec(async function (err, user) {
    if (err) {
      return next(err)
    }
    //If the correct user is logged in he can update his profile (can't change the role)
    if (req.params.id == req.currentUserId) {
      await User.findByIdAndUpdate({ _id: req.params.id }, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email
      }, { new: true, runValidators: true }).exec(function (err, updatedUser) {
        if (err) {
          return next(err);
        }
        res.status(200).send(updatedUser)
      })
    } else {
      //If this is not the current user connected's profile, but he is an admin, he can grant the admin role to the user.
      User.findOne({ _id: req.currentUserId }).exec(function (err, user) {
        if (err) {
          return next(err)
        }
        if (user.admin) {
          User.findByIdAndUpdate({ _id: req.params.id }, {
            admin: req.body.admin
          }, { new: true, runValidators: true }).exec(function (err, updatedUser) {
            if (err) {
              return next(err);
            }
            res.status(200).send(updatedUser);
          })
        } else {//This is not an admin, but he tries to modify somebody elses profile
          res.status(403).send("Don't have the rights to do that")
        }
      })
    }
  })
});
export default router;