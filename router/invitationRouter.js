import express  from "express";
import InvitationModel from '../models/invitaionModel.js';
import user from "../models/userModel.js";
import group from '../models/groupModel.js';

const invitationRouter = express.Router();

invitationRouter.post("/addNewInvitation", async (req, res) => {
    // console.log(req.params.id);
    // console.log(req.body);
    const user_id = req.params.id;
    const group_id = req.params.id;

    const User = await user.findOne({ _id: user_id });
    const Group = await group.findOne({id : group_id});

    const invitation = new InvitationModel({
      invitationName: req.body.invitationName,
      invitationSubtitle: req.body.invitationSubtitle,
      invitationCode: req.body.invitationCode
    });

    invitation.user = user_id;
  
    User?.invitations?.push(invitation._id);
    Group?.invitations?.push(invitation._id);

    const createdPost = await invitation.save();
  
    return res.send({
      _id: createdPost._id,
      invitationName: createdPost.invitationName,
      invitationSubtitle: createdPost.invitationSubtitle,
    });
  });

invitationRouter.get("/allInvitations", async (req,res)=>{
    let invitations = await InvitationModel.find({});
    res.status(200).send(invitations);
})

invitationRouter.get("/", async (req, res)=>{
    res.status(200).send("Main invitations router")
})

export default invitationRouter;