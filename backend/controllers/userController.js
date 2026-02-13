import userModel from "../models/userModel.js";
import { isAccountVerified } from "./authController.js";

export const getUserData= async (req,res)=>{
    try {
        const {userId} =req.body;
        const user =await userModel.findOne({ _id: userId });

        if(!user){
        return res.json({success:false,message:'user not found'});
        }
        res.json({
            success:true,
            userData:{
                name:user.name,
                isAccountVerified:user.isAccountVerified,
                role:user.role

            }
        })
    } catch (error) {
        return res.json({success:false,message:error.message});
    }

}