import express from "express";
import GroupModel from "../models/groupModel.js";
import user from "../models/userModel.js";
const groupRouter = express.Router();

groupRouter.post("/addNewGroup/:id", async (req, res) => {
  console.log(req.params.id);
  console.log(req.body);
  const user_id = req.params.id;
  const User = await user.findOne({ _id: user_id });

  const post = new GroupModel({
    groupName: req.body.groupName,
    totalMembers: req.body.totalMembers,
    // ImageUrl: req.body.img,
  });
  post.user = user_id;

  User?.groups?.push(post._id);

  const createdPost = await post.save();

  return res.send({
    _id: createdPost._id,
    itemName: createdPost.groupName,
    totalMembers: createdPost.totalMembers,
  });
});

// delete post

groupRouter.delete('/delete-post/:id', async(req,res) => {
   await userPost.findByIdAndDelete(req.params.id)

  try{
    res.status(204).json({
        status : 'Success',
        data : {}
    })
  }catch(err){
      res.status(500).json({
          status: 'Failed',
          message : err
      })
  }
})

groupRouter.patch('/update-post/:id', async (req,res) => {
  const updatedPost = await userPost.findByIdAndUpdate(req.params.id,req.body,{
      new : true,
      runValidators : true
    })
  try{
      res.status(200).json({
          status : 'Success',
          data : {
            updatedPost
          }
        })
  }catch(err){
      console.log(err)
  }
})

groupRouter.get("/allposts", async (req, res) => {
  let posts = await GroupModel.find({});
  console.log("yes post Router");
  res.status(200).send(posts);
});

groupRouter.get("/", async (req, res) => {
  res.status(200).send("Hi Working");
});

export default groupRouter;
