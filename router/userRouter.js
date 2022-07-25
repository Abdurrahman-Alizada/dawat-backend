import express from "express";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { isAuth } from "../middleware/check-auth.js";

const userRouter = express.Router();

userRouter.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      return res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
        user: user,
        accessToken: generateToken(user),
      }
      );
    }
  }
  res.status(401).send({ message: "Invalid email or password" });
});

userRouter.get("/auth", async (req, res) => {
  // const user = await User.findOne({ email: req.body.email });
  res.send({ message: "Welcome Bro" });
});

userRouter.get("/my-account", async (req, res) => {
  const user = {name:"hello", email : 'hello@123',};
  res.send({ message: "Welcome Bro", user });
});


userRouter.post("/register", async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
  });

  console.log(user);
  const createdUser = await user.save();
  res.send({
    _id: createdUser._id,
    name: createdUser.name,
    email: createdUser.email,
    isAdmin: createdUser.isAdmin,
    token: generateToken(createdUser),
  });
});

export default userRouter;
