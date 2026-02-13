import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    role:{type:String,required:true,default:'organizer',enum:['admin','organizer']},
    verifyOtp:{type:String,default:''},
    verifyOtpExpire:{type:Number,default:0},
    isAccountVerified:{type:Boolean,default:false},
    resetOtp:{type:String,default:''},
    resetOtpExpire:{type:Number,default:0}
});

//compound index to ensure unique email per role
userSchema.index({ email: 1, role: 1 }, { unique: true });

const userModel=mongoose.models.user || mongoose.model('users',userSchema);

export default userModel;