import express from "express";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import protect from "../middleware/authMiddleware.js";
import {
  allUsers,
  currentLoginUser,
  updateName,
  updateEmail,
  updatePassword,
  updateImageURL,
  Verify,
  registerUser,
  loginUser,
  deleleUserByItSelf,
  forgotPassword,
  VerifyOTPForPasswordRecovery,
  resetPassword,
  resendEmailForUserRegistration
} from "../controllers/userControllers.js";

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
      });
    }
  }
  res.status(401).send({ message: "Invalid email or password" });
});

userRouter.route("/auth").get(protect, async (req, res) => {
  res.send({ message: "Welcome Bro" });
});

userRouter.route("/my-account").get(protect, async (req, res) => {
  const user = { name: "hello", email: "hello@123" };
  res.send({ message: "Welcome Bro", user });
});

userRouter.post("/register", async (req, res) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
    });

    const createdUser = await user.save();
    // console.log(user);
    return res.send({
      _id: createdUser._id,
      username: createdUser.username,
      email: createdUser.email,
      isAdmin: createdUser.isAdmin,
      token: generateToken(createdUser),
    });
  } catch (errors) {
    return res.status(200).send({ errors });
  }
});

userRouter.route("/allusers").get(protect, allUsers);
userRouter.route("/users/:id").get(currentLoginUser);
userRouter.route("/users/:id/deleleUserByItSelf").delete(protect,deleleUserByItSelf);

userRouter.route("/user/register").post(registerUser);
userRouter.route("/user/register/resendEmailForUserRegistration").post(resendEmailForUserRegistration);
userRouter.route("/user/login").post(loginUser);
userRouter.route("/user/:id/verify/:token").get( Verify);

userRouter.route("/users/:id/updateName").patch(protect, updateName);
userRouter.route("/users/:id/updateEmail").patch(protect, updateEmail);
userRouter.route("/users/:id/updatePassword").patch(protect, updatePassword);
userRouter.route("/users/:id/updateImageURL").patch(protect, updateImageURL);

userRouter.route("/user/forgotPassword").post(forgotPassword)
userRouter.route("/user/VerifyOTPForPasswordRecovery").post(VerifyOTPForPasswordRecovery)
userRouter.route("/user/:id/resetPassword").patch(resetPassword);

export default userRouter;
