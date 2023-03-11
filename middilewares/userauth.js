const Product = require("../models/product_data")

const islogin = async(req,res,next)=>{

    try{
      if(req.session.user){}
      else{
          res.redirect('/user');
      }
      next()
    }catch (error){
  
      console.log(error.message);
    }
  
  }
  
  const islogout = async(req,res,next)=>{
  
      try{
        if(req.session.user){
          // const productData = await Product.find({})
          res.redirect('/user');
        }
       
        next()
      }catch (error){
    
        console.log(error.message);
      }
    
    
    }

    const user_logout = async(req,res,next)=>{
  
      try{
        
        req.session.user = null
        res.redirect('/user');
      }catch (error){
    
        console.log(error.message);
      }
    
    
    }
  
    module.exports={
      islogin,
      islogout,
      user_logout
    }