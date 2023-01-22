import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

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
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      // token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
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

//@description     update the password of user
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
    return res.status(500).send('Something went wrong. Try again');
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


export {
  allUsers,
  registerUser,
  authUser,
  currentLoginUser,
  updateName,
  updateEmail,
  updatePassword,
  updateImageURL
};
