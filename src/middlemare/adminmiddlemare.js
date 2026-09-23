
const User = require("../models/user");
const jwt=require('jsonwebtoken');
const redisclient = require("../config/redis");
const adminmiddlemare=async (req,res,next)=>{
   try{
       const { token } = req.cookies;
       if(!token)
        throw new Error("invalid token");

      const payload= await jwt.verify(token,process.env.JWT_SECRETKEY);
      const _id = payload._id;
      if(!_id){
        throw new Error("id is missing")
      }
      const result = await User.findById(_id);

if (!result) {
    throw new Error("User does not exist");
}

if (result.role !== "admin") {
    throw new Error("Access denied");
}
      // redis ke blocklist mai present to nhi hai
     const isBlocked = await redisclient.exists(`token:${token}`);

if (isBlocked) {
    throw new Error("Token has been blacklisted");
}
      req.user = result;
       next();
   }
   catch(err){
    return res.status(401).json({
    error: err.message,
});
   }
}

module.exports=adminmiddlemare;