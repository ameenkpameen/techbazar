const User = require("../models/user_data");
const Product = require("../models/product_data");
const Category = require("../models/category_data");
const Order = require("../models/order_data");
const Coupen = require("../models/coupen_data")
const Banner = require("../models/banner_data")
// const ObjectId = require('mongodb').ObjectId

const { v4: uuidv4 } = require('uuid');

var session;
// const session = require('express-session');
const bycrypt = require("bcrypt");
const { isObjectIdOrHexString } = require("mongoose");
const { ObjectId } = require("mongodb");
const user_route = require("../routes/user_route");
const { response, request } = require("../routes/user_route");

require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
const client = require("twilio")(accountSid, authToken);
const PAGE_SIZE = 3;
const Razorpay = require('razorpay')
const crypto=require('crypto'); 
const { log } = require("console");

var instance = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,

});





const loadRegister = async (req, res) => {
  try {
    const productData = await Product.find({}).limit(5);
    
    const categoryData = await Category.find({});
    const banner = await Banner.find({});
    var userDetails = undefined
    var cartArray = undefined
    var nameArray = "null"
    var wishnameArray = "null"

    if (req.session.user) {
      userDetails = req.session.user;

      const cartData = await User.findOne({ _id: req.session.user._id })
        .populate("cart.productId")
        .exec();
      // console.log(cartData);
      cartArray = [];
      cartData.cart.forEach((element) => {
        cartArray.push(element);
      });

      nameArray = [];
      cartArray.forEach((element) => {
        nameArray.push(element.productId.productname);
      });

      const wishData = await User.findOne({ _id: req.session.user._id })
        .populate("wishlist.productId")
        .exec();
      //
       

      const wishArray = [];
      wishData.wishlist.forEach((element) => {
        wishArray.push(element);
      });

      wishnameArray = [];
      wishArray.forEach((element) => {
        wishnameArray.push(element.productId.productname);
      });
      


    }
    res.render("home", {
      products: productData,
      category: categoryData,
      userData: userDetails,
      cartitems: cartArray,
      wishnameArray: wishnameArray,
      nameArray: nameArray,
      banners:banner
    });
    
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};



async function getProducts(page) {
  const skip = (page - 1) * PAGE_SIZE;
  const products = await Product.find({}).skip(skip).limit(PAGE_SIZE).exec();
  return products;
}



const all_productshow = async (req, res) => {                                         
  try{



    const page = parseInt(req.query.page) || 1;
    const products = await getProducts(page);
    const count = await Product.countDocuments().exec();
    const totalPages = Math.ceil(count / PAGE_SIZE);
    // res.render('products', { products, page, totalPages });
    const categoryData = await Category.find({});

    var userDetails = undefined
    var cartArray = undefined
    var nameArray = "null"
    var wishnameArray = "null"

    if (req.session.user) {
      userDetails = req.session.user;

      
      const cartData = await User.findOne({ _id: req.session.user._id })
        .populate("cart.productId")
        .exec();
      // console.log(cartData);
      cartArray = [];
      cartData.cart.forEach((element) => {
        cartArray.push(element);
      });

      console.log(cartArray);

      nameArray = [];
      cartArray.forEach((element) => {
        nameArray.push(element.productId.productname);
      });

      const wishData = await User.findOne({ _id: req.session.user._id })
        .populate("wishlist.productId")
        .exec();
      //
       

      const wishArray = [];
      wishData.wishlist.forEach((element) => {
        wishArray.push(element);
      });

      wishnameArray = [];
      wishArray.forEach((element) => {
        wishnameArray.push(element.productId.productname);
      });
     
    }
    res.render("allproducts", {
      products,
      page,
      totalPages,
      category: categoryData,
      userData: userDetails,
      cartitems: cartArray,
      wishnameArray: wishnameArray,
      nameArray: nameArray,
    });


  }catch(error){
    res.render('errorpage')
  }
  
};





// const all_products = async (req, res) => {
//   try {
//     const productData = await Product.find({});
    
//     const categoryData = await Category.find({});

//     var userDetails = undefined
//     var cartArray = undefined
//     var nameArray = "null"
//     var wishnameArray = "null"

//     if (req.session.user) {
//       userDetails = req.session.user;

      
//       const cartData = await User.findOne({ _id: req.session.user._id })
//         .populate("cart.productId")
//         .exec();
//       // console.log(cartData);
//       cartArray = [];
//       cartData.cart.forEach((element) => {
//         cartArray.push(element);
//       });

//       console.log(cartArray);

//       nameArray = [];
//       cartArray.forEach((element) => {
//         nameArray.push(element.productId.productname);
//       });

//       const wishData = await User.findOne({ _id: req.session.user._id })
//         .populate("wishlist.productId")
//         .exec();
//       //
       

//       const wishArray = [];
//       wishData.wishlist.forEach((element) => {
//         wishArray.push(element);
//       });

//       wishnameArray = [];
//       wishArray.forEach((element) => {
//         wishnameArray.push(element.productId.productname);
//       });
      


//     }
//     res.render("allproducts", {
//       products: productData,
//       category: categoryData,
//       userData: userDetails,
//       cartitems: cartArray,
//       wishnameArray: wishnameArray,
//       nameArray: nameArray,
//     });
    
//   } catch (error) {
//     console.log(error.message);
//   }
// };


const searchProducts = async (req, res) => {
  try {
    let payload = req.body.payload
    let searchKey = new RegExp(payload,'i');
    let search = await Product.find({productname: searchKey})
    console.log(search);
    res.send({payload: search});
  }catch(error){
    res.render('errorpage')
    console.log(error.message);
  }
}



async function getingProducts(page,search) {
  const skip = (page - 1) * PAGE_SIZE;
  const products = await Product.find({productname: search,status:"List"}).sort({price:-1}).skip(skip).limit(PAGE_SIZE).exec();
  return products;
}

const searchingProducts = async (req, res, next) => {
  try {

    if (req.session.user) {
      const userdetails = req.session.user
      const searchKey = req.body.searchKey
      const search = new RegExp(searchKey, 'i')
      const page = parseInt(req.query.page) || 1;
      const products = await getingProducts(page, search);
      const count = await Product.countDocuments().exec();
      const totalPages = Math.ceil(count / PAGE_SIZE);


      const cartData = await User.findOne({ _id: req.session.user._id })
        .populate("cart.productId")
        .exec();
      cartArray = [];
      cartData.cart.forEach((element) => {
        cartArray.push(element);
      });

      console.log(cartArray);

      nameArray = [];
      cartArray.forEach((element) => {
        nameArray.push(element.productId.productname);
      });

      const wishData = await User.findOne({ _id: req.session.user._id })
        .populate("wishlist.productId")
        .exec();
      //


      const wishArray = [];
      wishData.wishlist.forEach((element) => {
        wishArray.push(element);
      });

      wishnameArray = [];
      wishArray.forEach((element) => {
        wishnameArray.push(element.productId.productname);
      });
      // const products = await Product.find({ name: search,status:"List"}).sort({price:-1})
      const categorydata = await Category.find({})
      res.render('allproducts', { category: categorydata, products: products, userData: userdetails, search: true, cartitems: cartArray, wishnameArray: wishnameArray, nameArray: nameArray, page, totalPages })
    } else {
      console.log(req.body);
      const searchKey = req.body.searchKey
      const search = new RegExp(searchKey, 'i')
      // const products = await Product.find({ name: search,status:"List"}).sort({price:-1})
      const categorydata = await Category.find({})
      const page = parseInt(req.query.page) || 1;
      const products = await getingProducts(page, search);
      const count = await Product.countDocuments().exec();
      const totalPages = Math.ceil(count / PAGE_SIZE);
      var userDetails = undefined
      var cartArray = undefined
      var nameArray = "null"
      var wishnameArray = "null"
      res.render('allproducts', { category: categorydata, products: products, search: true, userData: userDetails, cartitems: cartArray, wishnameArray: wishnameArray, nameArray: nameArray, page, totalPages })
    }
  } catch (error) {
    res.render('errorpage')
    next(error);
  }
}





const verifyUser = async (req, res) => {
  try {
    console.log(req.body.username);
    const username = req.body.username;
    const password = req.body.password;

    // const productData = await Product.find({});
    // const categoryData = await Category.find({});
    const userdetails = await User.findOne({ username });
    if (userdetails) {
      bycrypt.compare(password, userdetails.password).then((status) => {
        if (status) {
          const blockstatus = userdetails.status;
          if (blockstatus == 1) {
            // console.log("ffffffffffffff"+userdetails);
            session = req.session;
            session.user = userdetails;

            req.session.user_id = true;
            // console.log(req.session.user_id);
            // const userData = req.session.user_id;

            // console.log(userData);
            // console.log("redirecting");
            res.redirect("/");
          } else {
            req.session.loginErrorMsg = "You are blocked by Admin"
            res.redirect("back");
          }
        } else {
          req.session.loginErrorMsg = "Email or password incorrect"
          res.redirect("back");
        }
      });
    } else {
      req.session.loginErrorMsg = "Email or password incorrect"
      res.redirect("back");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};



const user_profile = async (req, res) => {
  try {
    if (req.session.user) {
      const userDetails = await User.findOne({ _id: req.session.user._id });
      res.render("profile", { userDetails: userDetails });
    } else {
      res.redirect('/')
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};



const user_wallet = async (req, res) => {
  try {
    if (req.session.user) {


      const walletBalance = (await User.findOne({ _id: req.session.user._id},{wallet:1,_id:0})).wallet
      const walletusages = await Order.find({userId:req.session.user._id,paymentmethod:"Wallet"},{totalprice:1,_id:0})
      var total = 0;
      const totalusage = walletusages.forEach((element)=>{
           total = total+ element.totalprice;
      })
      res.render("wallet",{wallet:walletBalance,usage:total});
    } else {
      res.redirect('/')
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};




const edit_profile = async (req, res) => {

  try {
    if (req.session.user) {
      console.log(req.body);
      const userDetails = await User.findOne({ _id: req.session.user._id });
      const password = req.body.currpassword;
      if (userDetails) {
        bycrypt.compare(password, userDetails.password).then(async (status) => {
          if (status) {
            if (req.body.newpassword == req.body.conpassword) {
              console.log("all Ok");
              const newpassword = await bycrypt.hash(req.body.conpassword, 10);

              const userupdate = await User.updateOne(
                { _id: req.session.user._id },
                {
                  name: req.body.name,
                  username: req.body.username,
                  phonenumber: req.body.phonenumber,
                  address: req.body.address,
                  password: newpassword
                }
              )

              console.log("You Successfully Edited Your Profile");
              res.redirect('/user');

            } else {
              console.log("Confirmation Password Failed");
              res.redirect('back');
            }
          } else {
            console.log("Your Current Password is Incorrect");
            res.redirect('back');
          }
        })
      }


      // res.render("profile", { userDetails: userDetails });
    } else {
      res.redirect("/user");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};



const add_address = async (req, res) => {
  try {
    res.render("addaddress",{address: ''});
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};






const add_an_address = async (req, res) => {
  try {
    if (req.session.user) {
      // console.log(req.body);
      // console.log(req.body);
      const user = req.session.user;
      const addaddress = await User.updateOne({ _id: user._id }, { $push: { address:
        { name:req.body.name,
          phonenumber:req.body.phonenumber,
          housename:req.body.housename,
          area:req.body.area,
          district:req.body.district,
          state:req.body.state,
          pincode:req.body.pincode
        } } })
      if (addaddress) {
        res.json({value:true})
        console.log("updated and added");
      }else{
        res.json({novalue:true})
      }


      res.redirect("/userprofile");
    } else {
      res.redirect("/");
    }

  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};




const delete_address = async (req, res) => {

   try{
     if(req.session.user){
      console.log(req.body);
      const edited = await User.updateOne({_id:req.session.user._id},{$pull:{address:{_id:req.body.addressId}}})
      if(edited){

        req.session.editaddresserror = "Deleted n address Successfully"
        res.redirect('/addresses')
        req.session.editaddresserror= null
      }else{
        
        req.session.editaddresserror = "Deletion Failed"
        res.redirect('/addresses')
        req.session.editaddresserror= null
      }
     }

   }catch{
    res.render('errorpage')
    console.log(error.message);
   }

}




const edit_address = async (req, res) => {

  try{
    if(req.session.user){
     const address = await User.findOne({_id:req.session.user._id,"address._id":req.params.id},{"address.$":1,_id:0})
     res.render('editaddress',{address:address.address[0]})
    }else{
      res.redirect('/login')
    }

  }catch(error){
    res.render('errorpage')
   console.log(error.message);
  }

}




const editing_address = async (req, res) => {

  try{
    if(req.session.user){
     if(req.body.name == ''|| req.body.phonenumber == ''||req.body.housename == ''||req.body.area == ''||req.body.district == ''||req.body.state == ''||req.body.pincode == ''){
        const user = await User.findOne({_id:req.session.user._id})
        const addresses = user.address
        res.render('addresses',{message:"All fields are required in editing address",addresses:addresses})
     }else{
      
         const editaddress = await User.updateOne({_id:req.session.user._id,"address._id":req.params.id},{$set:{"address.$":req.body}})
         if(editaddress){
            res.redirect('/addresses')
          }
      }
    }else{
      res.redirect('/login')
    }

  }catch{
    res.render('errorpage')
   console.log(error.message);
  }

}





const user_addresses = async (req, res) => {
  try {
    if (req.session.user) {
     const user = await User.findOne({_id:req.session.user._id})
     const addresses = user.address
     res.render("addresses", { addresses: addresses });



    } else {
      res.redirect("/userprofile");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
}


const adding_addresses = async (req,res)=>{
  try {
    if (req.session.user) {
      
      const user = req.session.user;
      if(req.body.name == '' || req.body.phonenumber == ''|| req.body.housename == ''|| req.body.area == ''|| req.body.district == ''|| req.body.state == ''|| req.body.pincode == ''){
           res.json({null:true})
      }else{
           const addaddress = await User.updateOne({ _id: user._id }, { $push: { address:
             { name:req.body.name,
               phonenumber:req.body.phonenumber,
               housename:req.body.housename,
               area:req.body.area,
               district:req.body.district,
               state:req.body.state,
               pincode:req.body.pincode
             } } })
           if (addaddress) {
             res.json({value:true})
           }
      }

    } else {
      // res.redirect("/userprofile");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
}


const my_orders = async (req, res) => {
  try {
    if (req.session.user) {
      const user = await User.findOne({_id:req.session.user._id})
      // console.log(user._id);
      const orders = await Order.find({userId:user._id}).sort({createdAt:-1}).populate("products.productId")
      

      res.render("orderhistory", { orders: orders });

    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
}



const view_orderDetails = async (req, res) => {
  try {
    if (req.session.user) {
      const user = await User.findOne({_id:req.session.user._id})
      const orderId = req.params.id
      // console.log(user._id);
      const order = await Order.find({orderId:orderId}).populate("products.productId")

      res.render("orderdetails", { orders: order });

    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
}






const changeorderstatus = async (req, res) => {
  try {
      const status=req.body.value
      if(status == "Returned"){
          //  const order = await Order.findOne({orderId:req.body.orderId}).populate("products.productId")
          //  const price = order.totalprice
          //  const wallet = await User.updateOne({_id:order.userId},{$inc:{wallet:price}})
          //  order.products.forEach(async (element)=>{
          //   const count = element.quantity + element.productId.stock
          //   console.log(count);
          //   const update = await Product.updateOne({_id:element.productId._id},{stock:count})
          // })

          const changed = await Order.updateOne({orderId: req.body.orderId},{$set:{status: status}});
          if(changed){
            res.json({ returned: true, status  });
          }
      }else{
        const order = await Order.findOne({orderId:req.body.orderId}).populate("products.productId")
        order.products.forEach(async (element)=>{
          const count = element.quantity + element.productId.stock
          console.log(count);
          const update = await Product.updateOne({_id:element.productId._id},{stock:count})
        })
          const change = await Order.updateOne({orderId: req.body.orderId},{$set:{status: status}});
        
        if(change){
            res.json({ success: true, status  });
        }
      }
      
      
    
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};








const load_login = async (req, res) => {
  try {
    res.render("user_signin", {message: req.session.loginErrorMsg});
    req.session.loginErrorMsg = ''
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};

const sendOtp = async (req, res) => {
  try {
    const userEmail = req.body.username;
    const regexEmail = new RegExp(userEmail, "i");
    const findUserEmail = await User.find({ username: regexEmail });
    const datalength = findUserEmail.length;
    if (datalength === 1) {
      res.render("user_signup", { error: "Email is already exists" });
    } else {
      req.session.tempuser= req.body
      req.session.phonenumber = req.body.phonenumber
      const phone = req.session.phonenumber;
      req.session.countryCode = "+91";
      await client.verify.v2
        .services(serviceSid)
        .verifications.create({
          to: `+91${phone}`,
          channel: "sms",
        });

      res.render("send_otp");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};

const verifyotp = async (req, res) => {
  const phone = req.session.phonenumber;
  // const countryCode = req.session.user.countryCode;
  const otp = req.body.otp;
  const userData = req.session.tempuser;
  try {
    await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: `+91${phone}`,
        code: otp,
      })
      .then(async (verificationResponse) => {
        if (verificationResponse.status === "approved") {
          userData.password = await bycrypt.hash(userData.password, 10);

          const user = new User({
            name: userData.name,
            username: userData.username,
            phonenumber: userData.phonenumber,
            password: userData.password
          });
          await user.save();

          console.log("user verified");
          res.redirect("/");

        } else {
          console.log(error.message);
          console.log("errrrrrrrrrrrrrrrrrrrrrr");
          res.redirect("back");
        }
      });
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};

const signup_User = async (req, res) => {
  try {
    res.render("user_signup");
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  console.log(req.body);
  req.session.user = req.body;
  try {
    const userData = new User({
      name: req.body.name,
      username: req.body.username,
      phonenumber: req.body.phonenumber,
      address: req.body.address,
      password: req.body.password,
      is_admin: 0,
    });

    console.log(userData);
    if (userData) {
      console.log(req.body);
      const userEmail = req.body.username;
      const regexEmail = new RegExp(userEmail, "i");
      const findUserEmail = await User.find({ username: regexEmail });
      const datalength = findUserEmail.length;
      if (datalength === 1) {
        res.render("user_signup", { error: "Email is already exists" });
      } else {
        res.render("send_otp");
      }

      // req.session.user_id=userData._id
    } else {
      res.render("user_signup", {
        message: "Your Registration has been failed",
      });
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};





const product_details = async (req, res) => {
  try {
    if (req.session.user) {
      const userDetails = req.session.user;
      
      const id = req.params.id;
      const user = req.session.user;

      const productData = await Product.find({ _id: id })
      
      const catData = await Category.find({ _id: productData[0].category })
      
      const cartCheck = await User.findOne(
        { _id: user._id, "cart.productId": id },
        { "productId.$": 1 }
      );

      if (cartCheck) {
        var exist = "Go to Cart";
      }

      const wishCheck = await User.findOne(
        { _id: user._id, "wishlist.productId": id },
        { "productId.$": 1 }
      );

      if (wishCheck) {
        var wishexist = "Go to Wishlist";
      }

      res.render("view_product", {
        productData: productData,
        exist: exist,
        wishexist: wishexist,
        category:catData
      });
    } else {
      const id = req.params.id;
      const productData = await Product.find({ _id: id });
      const catData = await Category.find({ _id: productData[0].category })
      res.render("view_product", { productData: productData,category:catData});
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};

const category_products = async (req, res) => {
  try {
   
    const id = req.params.id;
    const productData = await Product.find({category:id});
    const categoryData = await Category.find({});
    
    
    let userDetails = undefined;
    if (req.session.user) userDetails = req.session.user;

    res.render("category_product", {
      products: productData,
      categoryData: categoryData,
      userData: userDetails,
    });
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};





const user_cart = async (req, res) => {
  try {
    if (req.session.user) {
      console.log(req.body);
      const id = req.body.productId;
      const productData = await Product.find({ _id: id });
      // console.log(req.session.user.name);
      // const product = productData[0]._id;
      const price = productData[0].price;
      await User.updateOne(
        { _id: req.session.user._id },
        { $push: { cart: { productId: id, producttotal: price } } }
      )
      const updated = await User.updateOne(
        { _id: req.session.user._id },
        { $pull: { wishlist: { productId: id } } }
      )

      const cartitems = await User.findOne({_id:req.session.user._id},{_id:0,cart:1})
      const cartcount = cartitems.cart.length
      
      if(updated){
        res.json({ success: true,cartcount });
      }else{
        // res.json({ success: false})
        res.redirect("/");
      }
      
      
      

      // const user = await User.find({ name: req.session.user.name });
      // const cartitems = user[0].cart;

      // const cartData = await User.findOne({ _id: req.session.user._id })
      //   .populate("cart.productId")
      //   .exec();

      // const updatedCart = await User.findOne(
      //   { _id: req.session.user._id },
      //   { cart: 1 }
      // );

      // // console.log(updatedCart);
      // const totalPrice = updatedCart.cart.reduce(
      //   (total, item) => total + item.producttotal,
      //   0
      // );


      // const cartTotal = await User.updateOne(
      //   { _id: req.session.user._id },
      //   { carttotal: totalPrice }
      // );

      // res.redirect('/viewcart');
    } else {
      res.json({ login:true})
      
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};



const removefrom_cart = async (req, res) => {
  try {
    if (req.session.user) {

      const id = req.body.productId;
      console.log(req.session.user.name);
      const userdata = await User.find({ name: req.session.user.name });
      // console.log(userdata);
      const cartData = await User.updateOne(
        { name: req.session.user.name },
        { $pull: { cart: { productId: id } } }
      );

      if (cartData) {
          res.json({ success: true });
          res.redirect("/viewcart");
        
      } else {
        console.log(error.message);
      }
    } else {
      res.redirect("signup");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};




const view_cart = async (req, res) => {
  try {
    if (req.session.user) {
      const user = await User.find({ name: req.session.user.name });
      // console.log(req.session.user._id);
      const cartData = await User.findOne({ _id: req.session.user._id })
        .populate("cart.productId")
        .exec();

      cartArray = [];
      cartData.cart.forEach((element) => {
        cartArray.push(element);
      });

      var cartTotal = 0;
      cartArray.forEach((element)=>{
          cartTotal=cartTotal+element.producttotal
      })

      const updatedCart = await User.findOne(
        { _id: req.session.user._id },
        { cart: 1 }
      );

      // console.log(updatedCart);
      const totalPrice = updatedCart.cart.reduce(
        (total, item) => total + item.producttotal,
        0
      );
       
      const carttotal = await User.updateOne(
        { _id: req.session.user._id },
        { carttotal: totalPrice }
      );
      // console.log(cartTotal);

      res.render("user_cart", { cartitems: cartData, carttotal: totalPrice, user:user });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};





const checkout = async (req, res) => {
  try {
    if (req.session.user) {
      const user = await User.find({ _id: req.session.user._id });

      const cartData = await User.findOne({ _id: req.session.user._id })
       .populate("cart.productId");

      const stockarray=[]
      cartData.cart.forEach((element)=>{
        stockarray.push(element.productId.stock);
      })
      // console.log(stockarray);
      if(cartData.cart.length>0){
        for(let i=0; i<cartData.cart.length; i++){
          if(cartData.cart[i].productId.stock<cartData.cart[i].quantity){
            var checkout = false;
            break;
          }else{
            var checkout = true;
          }
        }
      }
      const coupensavailable = await Coupen.find({ usersUsed: { $ne: req.session.user._id } })
      if(checkout == true){
        res.render("checkout",{user:user,cartData:cartData, message: '',coupensavailable});
      }else{
        res.redirect('/viewcart');
      }
      
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};






const submit_checkout = async (req, res) => {
  try {
    if (req.session.user) {
      
      console.log(req.body);
      const payment = req.body.payment
      console.log(payment);
      if(payment == "COD"){

          if(req.body.address == ''){
              res.json({address:true})
          }else{
             const id = req.session.user._id;
             const orders = req.body;
             const orderdetails = [];
             orders.products = orderdetails;
             if(!Array.isArray(orders.productId)){
               orders.productId = [orders.productId];
             }
             if(!Array.isArray(orders.productQuantity)){
               orders.productQuantity = [orders.productQuantity];
             }
             if(!Array.isArray(orders.productTotal)){
               orders.productTotal = [orders.productTotal];
             }
             const qty = orders.productQuantity
             const prototal = orders.productTotal
              for(let i=0; i<orders.productId.length; i++){
               const product = orders.productId[i]
               const quantity = orders.productQuantity[i]
               const price = orders.productTotal[i]
               orderdetails.push({productId:product, quantity:quantity, producttotal:price})
              }
       
             //  console.log(orders.products);
       
              const order = new Order({
                 userId: id,
                 orderId: `order_id_${uuidv4()}`,
                 products:orders.products,
                 totalprice:orders.lastTotal,
                 discount:orders.discountvalue,
                 deliveryAddress:orders.address,
                 paymentmethod:payment,
                 status:"Confirmed"
              })
               const ordered= await order.save();
               if(ordered){
                await Coupen.updateOne({coupencode:req.body.code},{$push:{usersUsed:id}});
               }
               
               if(ordered){
                 orders.products.forEach(async(elements)=>{ 
                   const recent = (await Product.findOne({_id:elements.productId},{_id:0,stock:1})).stock
                   newqty = recent-elements.quantity
                   const update = await Product.updateOne({_id:elements.productId},{$set:{stock: newqty}});
                  }) 
                 await User.updateOne({_id:id},{$set: { cart: [] }})
               }

              const orderDetails ={Totalprice:orders.cartTotal,lastPrice:orders.lastTotal,discount:orders.discountvalue,quantity:qty,producttotal:prototal, DeliveryAddress:orders.address,paymentmethod:payment}
              const productData=[];
               if(orders.products.length > 0){
               for(let i=0; i<orders.products.length; i++){
                 productData.push (await Product.findOne({_id:orders.products[i].productId}))
               }
               
             }
             res.json({success:true,cod:true})
           }
        
          }else if(payment == "UPI"){

            if(req.body.address == ''){
              res.json({address:true})
              }else{
                     const id = req.session.user._id;
                     const orders = req.body;
                     const orderdetails = [];
                     orders.products = orderdetails;
                     if(!Array.isArray(orders.productId)){
                       orders.productId = [orders.productId];
                     }
                     if(!Array.isArray(orders.productQuantity)){
                       orders.productQuantity = [orders.productQuantity];
                     }
                     if(!Array.isArray(orders.productTotal)){
                       orders.productTotal = [orders.productTotal];
                     }
                    const qty = orders.productQuantity
                     const prototal = orders.productTotal
                      for(let i=0; i<orders.productId.length; i++){
                       const product = orders.productId[i]
                       const quantity = orders.productQuantity[i]
                       const price = orders.productTotal[i]
                       orderdetails.push({productId:product, quantity:quantity, producttotal:price})
                      }
               
                       // console.log(req.body.lastTotal);
               
                      const ordersave = new Order({
                         userId: id,
                         orderId: `order_id_${uuidv4()}`,
                         products:orders.products,
                         totalprice:orders.lastTotal,
                         discount:orders.discountvalue,
                         deliveryAddress:orders.address,
                         paymentmethod:payment,
                         status:"Payment Failed"
                      })
                       const ordered= await ordersave.save();
                       if(ordered){
                        await Coupen.updateOne({coupencode:req.body.code},{$push:{usersUsed:id}});
                       }
                       
                       if(ordered){
                         orders.products.forEach(async(elements)=>{ 
                           const recent = (await Product.findOne({_id:elements.productId},{_id:0,stock:1})).stock
                           newqty = recent-elements.quantity
                           const update = await Product.updateOne({_id:elements.productId},{$set:{stock: newqty}});
                          }) 
                         await User.updateOne({_id:id},{$set: { cart: [] }})
                       }
           
                      const orderDetails ={Totalprice:orders.cartTotal,lastPrice:orders.lastTotal,discount:orders.discountvalue,quantity:qty,producttotal:prototal, DeliveryAddress:orders.address,paymentmethod:payment}
                      const productData=[];
                       if(orders.products.length > 0){
                       for(let i=0; i<orders.products.length; i++){
                         productData.push (await Product.findOne({_id:orders.products[i].productId}))
                       }
                       
                     }
                     const lastorder = await Order.findOne({}).sort({createdAt:-1});
                     // console.log(orders.lastTotal);
                     let options = {
                       amount: req.body.lastTotal * 100,
                       currency:"INR",
                       receipt:""+lastorder._id
                     };
                     console.log(options);
          
                     instance.orders.create(options,function(err,order){
                       if(err){
                         console.log(err);
                       }
                       console.log("donneeeeeeeeeeeeee");
                       console.log(order);
                       res.json({viewRazorpay:true,order})
                     });
          
                }

         }else if(payment == "Wallet"){
             if(req.body.address == ''){
                res.json({address:true})
             }else{
                const wallet = (await User.findOne({_id:req.session.user._id},{_id:0,wallet:1})).wallet
                console.log(wallet);
                console.log(req.body.lastTotal);
                if(wallet<req.body.lastTotal){
                   res.json({lesswallet:true})
                }else{
                  const wallet = (await User.findOne({_id:req.session.user._id},{_id:0,wallet:1})).wallet
                  const cartprice = req.body.lastTotal
                  const balance = wallet-cartprice;
                  const id = req.session.user._id;
                  const orders = req.body;
                  const orderdetails = [];
                  orders.products = orderdetails;
                  if(!Array.isArray(orders.productId)){
                    orders.productId = [orders.productId];
                  }
                  if(!Array.isArray(orders.productQuantity)){
                    orders.productQuantity = [orders.productQuantity];
                  }
                  if(!Array.isArray(orders.productTotal)){
                    orders.productTotal = [orders.productTotal];
                  }
                  const qty = orders.productQuantity
                  const prototal = orders.productTotal
                   for(let i=0; i<orders.productId.length; i++){
                    const product = orders.productId[i]
                    const quantity = orders.productQuantity[i]
                    const price = orders.productTotal[i]
                    orderdetails.push({productId:product, quantity:quantity, producttotal:price})
                   }
            
                  //  console.log(orders.products);
            
                   const order = new Order({
                      userId: id,
                      orderId: `order_id_${uuidv4()}`,
                      products:orders.products,
                      totalprice:orders.lastTotal,
                      discount:orders.discountvalue,
                      deliveryAddress:orders.address,
                      paymentmethod:payment,
                      status:"Confirmed"
                   })
                    const ordered= await order.save();
                    if(ordered){
                     await Coupen.updateOne({coupencode:req.body.code},{$push:{usersUsed:id}});
                    }
                    
                    if(ordered){
                      orders.products.forEach(async(elements)=>{ 
                        const recent = (await Product.findOne({_id:elements.productId},{_id:0,stock:1})).stock
                        newqty = recent-elements.quantity
                        const update = await Product.updateOne({_id:elements.productId},{$set:{stock: newqty}});
                       }) 
                      await User.updateOne({_id:id},{$set: { cart: [] }})
                      await User.updateOne({_id:id},{$set:{wallet:balance}})
                    }
     
                   const orderDetails ={Totalprice:orders.cartTotal,lastPrice:orders.lastTotal,discount:orders.discountvalue,quantity:qty,producttotal:prototal, DeliveryAddress:orders.address,paymentmethod:payment}
                   const productData=[];
                    if(orders.products.length > 0){
                    for(let i=0; i<orders.products.length; i++){
                      productData.push (await Product.findOne({_id:orders.products[i].productId}))
                    }
                    
                  }
                  res.json({success:true,cod:true})
                }
             }
         }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};






const PaymentVerified= async(req,res,next)=>{
  try {
   if(req.session.user){

     const latestOrder = await Order
     .findOne({})
     .sort({ createdAt:-1 })
     .lean();

     await Order.updateOne({orderId: latestOrder.orderId},{$set:{status:"Confirmed"}})
   
        console.log("final");
        console.log(req.body);
       const details=req.body
       let hmac= crypto.createHmac('sha256',process.env.KEY_SECRET)
       res.json({status:true})
       hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
       hmac=hmac.digest('hex')
       if(hmac==details['payment[razorpay_signature]']){
         console.log("success");
       
         res.json({status:true})
       }else{
    
         res.json({failed:true})
       }
   }else{
     res.redirect('/login')
   }
   
  } catch (error) {
    res.render('errorpage')
   next(error);
     } 
}




const PaymentFailed = async (req,res) =>{
  try{
    const orderDetails = req.body;
    const data = await Order.updateOne({_id: orderDetails.order.receipt},{status: "Payment Failed"});
    if(data){
      res.json({paymentFailed:true,reason:orderDetails.description})
    }
  }catch{
    res.render('errorpage')
    console.log(error)
  }
}






const order_confirmation = async (req, res) => {
  try {
    if (req.session.user) {
       
       const user = req.session.user;
       const lastorder = await Order.findOne({}).sort({createdAt:-1});
       const orderDetails = await Order.findOne({_id: lastorder._id}).populate("products.productId");
       console.log(orderDetails);
       res.render('orderconfirmation',{orders:orderDetails,user:req.session.user})

    } else {
      res.redirect("signup");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};






const incrementshippingprice = async (req, res)=>{
  try{
    if(req.session.user){
      const user = req.session.user;
      const count =parseInt(req.body.count);
      console.log(user);
      console.log(req.body);
      console.log(count);
      const newprice = user.carttotal+count
      console.log(newprice);

      // await User.updateOne(
      //   {_id:user._id},
      //   {carttotal:newprice}
      // )
      
    }

  }catch{
    console.log(error.message);
  }
}




const incrementQuantity = async (req, res) => {
  try {
    if (req.session.user) {
      const user = req.session.user;
      const proId = req.body.productId;
      console.log(proId);
      const count = req.body.count;
      const proPrice = req.body.proPrice;
      
      await User.updateOne(
        { _id: user._id, "cart.productId": proId },
        { $inc: { "cart.$.quantity": count } }
      );

          
          const cartqty = await User.findOne({_id: user._id, "cart.productId": proId},{"cart.quantity.$":1,_id:0})
          
          const qqq = cartqty.cart[0].quantity;
          
          const qty = (await Product.findOne({_id: proId},{_id:0,stock:1})).stock
          // console.log(qty);
          if(qqq > qty) {
            var stockStatus = "OutOf Stock"       
          }else{
            var stockStatus =  "In Stock"
          }
        
             const cartItem = await User.findOne(
               { _id: user._id, "cart.productId": proId },
               { "cart.$": 1 }
             );
             const producttotal = proPrice * cartItem.cart[0].quantity;
       
             await User.updateOne(
               { _id: user._id, "cart.productId": proId },
               { $set: { "cart.$.producttotal": producttotal } }
             );

             const updatedCart = await User.findOne({ _id: user._id }, { cart: 1 });

             const totalPrice = updatedCart.cart.reduce(
               (total, item) => total + item.producttotal,
               0
             );

             await User.updateOne(
               { _id: user._id },
               { carttotal: totalPrice }
             );

      res.json({ success: true, producttotal, totalPrice , stockStatus});
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};

const view_wishlist = async (req, res) => {
  try {
    if (req.session.user) {
      // console.log(req.params.id);
      // const id = req.params.id;

      const cartData = await User.findOne({ _id: req.session.user._id })
        .populate("cart.productId")
        .exec();
      
      const cartArray = [];
      cartData.cart.forEach((element) => {
        cartArray.push(element);
      });

      const nameArray = [];
      cartArray.forEach((element) => {
        nameArray.push(element.productId.productname);
      });


      const wishData = await User.findOne({ _id: req.session.user._id })
        .populate("wishlist.productId")
        .exec();
      // console.log(wishData);
      res.render("wishlist", { wishitems: wishData, nameArray: nameArray });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};

const addtowishlist = async (req, res) => {
  try {
    if (req.session.user) {
      console.log(req.params.id);
      const id = req.params.id;
      const productData = await Product.find({ _id: id });

      const product = productData[0]._id;

      const wishlist = await User.updateOne(
        { name: req.session.user.name },
        { $push: { wishlist: { productId: id } } }
      ).then((response) => {
        console.log(response);
        res.redirect("/");
      });

      // const user =await User.find({name:req.session.user.name})
      // const wishitems = user[0].wishlist;
       
      const wishData = await User.findOne({ _id: req.session.user._id })
        .populate("wishlist.productId")
        .exec();

      res.render("wishlist", { wishitems: wishData });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};

const removefromwishlist = async (req, res) => {
  try {
    if (req.session.user) {
      const id = req.params.id;
      const wishData = await User.updateOne(
        { name: req.session.user.name },
        { $pull: { wishlist: { productId: id } } }
      );

      if (wishData) {
        res.redirect("/viewwishlist");
      } else {
        console.log(error.message);
      }
    } else {
      res.redirect("signup");
    }
  } catch (error) {
    res.render('errorpage')
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  load_login,
  insertUser,
  signup_User,
  verifyUser,
  product_details,
  sendOtp,
  verifyotp,
  category_products,
  user_cart,
  removefrom_cart,
  view_cart,
  incrementQuantity,
  view_wishlist,
  addtowishlist,
  removefromwishlist,
  checkout,
  user_profile,
  edit_profile,
  add_address,
  add_an_address,
  user_addresses,
  delete_address,
  edit_address,
  editing_address,
  all_productshow,
  submit_checkout,
  my_orders,
  view_orderDetails,
  changeorderstatus,
  searchProducts,
  adding_addresses,
  order_confirmation,
  PaymentVerified,
  PaymentFailed,
  user_wallet,
  searchingProducts
  // incrementshippingprice
};
