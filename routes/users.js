import express from "express";
import { User } from "../model/User.js"
const router = express.Router();


////////////////////////////////// GET
// Get all users
router.get("/", function (req, res, next) {
  User.find().exec(function (err, user) {
    if (err) {
      return next(err)
    }
    res.status(200).send(user)
  })
});

// Get a specific user
router.get("/:id", function (req, res, next) {
  User.findOne({_id: req.params.id}).exec(function (err, user) {
    if(err) {
      return next(err)
    }
    res.status(200).send(user)
  })
});

// Get all the objects posted by a user



/////////////////////////////////////// POST
// Create new user
router.post("/", async function (req, res, next) {
  //Get the user created
  const newUser = new User(req.body)
  //save new user created
  newUser.save(function (err, savedUser) {
    if (err) {
      return next(err)
    }
    res.status(201).send(savedUser)
  })
})


///////////////////////////////////// DELETE
// Delete a user

///////////////////////////////////// PUT
export default router;
