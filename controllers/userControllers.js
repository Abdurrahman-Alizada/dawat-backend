import Group from "../models/groupModel.js";
import Task from "../models/taskModal.js";
import Friendship from "../models/FriendshipModel.js";

import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import Token from "../models/tokenModel.js";
import OTPModel from "../models/OTPModel.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import {
  sendRecoveryEmail,
  sendVerificationEmail,
  sendPasswordResetSuccessfullyEmail,
} from "../utils/sendEmail.js";
import { generateToken } from "../utils/generateToken.js";
import otpGenerator from "otp-generator";
//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword);
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send({ message: "Please enter all the fields" });
      // throw new Error("Please Enter all the Feilds");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(409).send({ message: "User with given email already Exist!", verified:userExists.verified });
      return;
    }

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name,
      email: email,
      password: hashPassword,
    });

    if (user) {
      const token = await Token.create({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      });
      const url = `${process.env.BASE_URL}/api/account/user/${user._id}/verify/${token.token}`;
      await sendVerificationEmail(
        user.email,
        "Please verify your email for event planner app",
        url
      );
      res
        .status(201)
        .send({ message: "An Email sent to your account please verify" });
    } else {
      res.status(400);
      throw new Error("Something went wrong");
    }
  } catch (errors) {
    return res.status(200).send({ errors });
  }
});

//@description     Resend email for registering new user
//@route           POST /api/user/register/resendEmailForUserRegistration
//@access          Public
const resendEmailForUserRegistration = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Invalid email" });
    }

    const user = await User.findOne({ email: email });
    const isToken = await Token.findOne({
      userId: user._id,
    });
    if (isToken) {
      await isToken.remove();
    } 
      const token = await Token.create({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      });
      const url = `${process.env.BASE_URL}/api/account/user/${user._id}/verify/${token.token}`;
      await sendVerificationEmail(
        user.email,
        "Please verify your email for event planner app",
        url
      );
      res
        .status(201)
        .send({ message: "An Email sent to your account please verify" });
    
  } catch (errors) {
    console.log(errors);
    return res.status(200).send({ errors });
  }
});

//@description     Login user
//@route           POST /api/user/login
//@access          Public
const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword)
        return res.status(401).send({ message: "Invalid Email or Password" });

      if (!user.verified) {
        return res.status(401).send({
          message:
            "An Email was sent to your account please verify the provided email",
        });
      }

      res.status(200).send({
        user: user,
        token: generateToken(user),
      });
    } else {
      res
        .status(200)
        .send({ message: "User not found. Please register first" });
      // res.status(401).send({ message: "Invalid email or password" });
    }
  } catch (errors) {
    return res
      .status(200)
      .send({ message: "internal server error", error: errors });
  }
});

//@description     Verify the token for email varification
//@route           POST /api/account/user/:id/verify/:token
//@access          Public
const Verify = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid link" });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "Invalid link" });

    await User.findByIdAndUpdate(user._id, { verified: true }, { new: true });
    await token.remove();

    res.status(200).send({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

//@description     check user if the user forgot password and then send email
//@route           POST /api/account/user/forgotPassword
//@access          Public
const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send({ message: "Email not found" });

    const OTP = otpGenerator.generate(5, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
    const OTPresponse = await OTPModel.create({
      userId: user._id,
      OTP: OTP,
      attempts: 0,
    });

    if (OTPresponse._id) {
      sendRecoveryEmail({ recipient_email: req.body.email, OTP: OTP });
    }

    res.status(200).send({ message: `OTP has been sent to ${user?.email}` });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

//@description     Verify the token for email varification
//@route           POST /api/account/user/:id/verify/:token
//@access          Public
const VerifyOTPForPasswordRecovery = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res.status(400).send({
        message:
          "User not found. Verification must be done by email owner itself",
      });
    const OTP = await OTPModel.findOne({
      userId: user._id,
      OTP: req.body.OTP,
    });
    if (!OTP)
      return res.status(400).send({
        message:
          "OTP not found. It may be incorrect or expired, please try again",
      });
    await OTP.remove();

    res.status(200).send({ message: "OTP verified successfully", user: user });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      // token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

//@description     get the Current Login User
//@route           get /api/users/:id
//@access          Public
const currentLoginUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     update the name of user
//@route           get /api/account/users/:id/updateName
//@access          Protected
const updateName = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { name: name },
      { new: true }
    );
    console.log("user is : ", user);
    if (!user) {
      res.status(404).send({ message: "User not found" });
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     update the email of user
//@route           get /api/account/users/:id/updateEmail
//@access          Protected
const updateEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { email: email },
      { new: true }
    );
    if (!user) {
      res.status(404).send({ message: "User not found" });
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     update the password of user - when user know the old password
//@route           get /api/account/users/:id/updatePassword
//@access          Protected
const updatePassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(400).send("User not found");
    }
    // validate old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).send("Please enter correct old password");
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 8);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );
    res.send(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Something went wrong. Try again");
  }
});

//@description     update the password of user - when user don't now the old password
//@route           get /api/account/user/resetPassword
//@access          Protected
const resetPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  try {
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(400).send("User not found");
    }
    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 8);
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true }
    );
    if (updatedUser._id) {
      sendPasswordResetSuccessfullyEmail({
        recipient_email: updatedUser.email,
      });
      return res
        .status(200)
        .send({ message: "Password has been updated", user: updatedUser });
    } else {
      return res.status(400).send("Something went wrong");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Something went wrong. Try again");
  }
});

//@description     update the image url of user
//@route           get /api/account/users/:id/updateImgURL
//@access          Protected
const updateImageURL = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { imageURL } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { imageURL: imageURL },
      { new: true }
    );
    if (!user) {
      res.status(404).send({ message: "User not found" });
    } else {
      res.send(user);
    }
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const deleleUserByItSelf = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  try {
    if (req.params.id.toString() === req.user._id.toString()) {
      // res.status(200).json({message:"matched."})

      if (user) {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        // removing user from group
        await Group.updateMany(
          {
            users: {
              $in: [req.params.id],
            },
          },
          {
            $pull: {
              users: req.params.id,
            },
          }
        );

        // deleting user friend's record
        await Friendship.deleteMany({
          $or: [{ requestor: req.params.id }, { recipient: req.params.id }],
        });

        // removing user from tasks
        await Task.updateMany({
          $pull: { responsibles: { responsible: { $in: [req.params.id] } } },
        });

        res
          .status(200)
          .json({ message: "user has been deleted", deletedUser: deletedUser });
      } else {
        res.status(404).send("User not found");
      }
    } else {
      res.status(199).json({ message: "User can only delete itself." });
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "something went wrong", error: error.message });
    throw new Error(error.message);
  }
});

export {
  allUsers,
  authUser,
  currentLoginUser,
  updateName,
  updateEmail,
  updatePassword,
  updateImageURL,
  registerUser,
  loginUser,
  Verify,
  deleleUserByItSelf,
  forgotPassword,
  VerifyOTPForPasswordRecovery,
  resetPassword,
  resendEmailForUserRegistration,
};
