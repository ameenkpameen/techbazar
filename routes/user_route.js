const express = require('express')

const user_route = express();
const session = require('express-session')
const userauth = require('../middilewares/userauth');

const bodyParser = require('body-parser')
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))

const multer = require("multer");
const auth = require('../middilewares/userauth');
const path = require('path')

const storage = multer.diskStorage({
    destination:function(req,file,cb){
       cb(null,path.join(__dirname,'/public/user_images')) 
    },
    filename:function(req,file,cb){
       const name = Date.now()+'-'+file.originalname;
       cb(null,name);
    }
})

const upload = multer({storage:storage})

user_route.set('view engine','ejs');
user_route.set('views','./views/user')

const userController =  require('../controllers/user_controller')
const coupen_controller = require("../controllers/coupen_controller");


//===============================Loading Home Page=============================
user_route.get('/user',userController.loadRegister);



//=================================Verify User===================================
user_route.get('/user',userController.verifyUser);



//=================================Verify User==================================
user_route.post('/login',userController.verifyUser);



//===============================All Products Page==============================
user_route.get('/allproducts',userController.all_productshow);
user_route.post('/getProduct',userController.searchProducts)
user_route.post('/search_products',userController.searchingProducts)


//================================User Login Page===============================
user_route.get('/login',auth.islogout,userController.load_login)



//================================User Profile Page=============================
user_route.get('/userprofile',userController.user_profile);
user_route.get('/mywallet',userController.user_wallet);


//================================Edit User Profile=============================
user_route.post('/userprofile',userController.edit_profile);



//===============================User Add Addresses=============================
user_route.get('/addaddress',userController.add_address);
user_route.post('/addaddress',userController.add_an_address);



//==========================User Address Edit and Delete========================
user_route.post('/deleteaddress',userController.delete_address);
// user_route.get('/editaddress/:id',userController.edit_address);
user_route.post('/editaddress/:id',userController.editing_address);
user_route.get('/addresses',userController.user_addresses)
user_route.post('/addingaddress',userController.adding_addresses)



//=================================User Order History===========================
user_route.get('/myorders',userController.my_orders)
user_route.get('/vieworderdetails/:id',userController.view_orderDetails)
user_route.post('/changeorderstatus',userController.changeorderstatus)



//================================Category Products=============================
user_route.get('/viewcategoryproducts/:id',userController.category_products);



//=================================User Signup Page=============================
user_route.get('/signup',auth.islogout,userController.signup_User)
user_route.post('/signup',userController.sendOtp);



//===============================Verify Otp and Save user=======================
user_route.post('/verifyotp',userController.verifyotp)

// user_route.get('user/home',userauth.islogin,userController.load_home);



//================================Single Product Details========================
user_route.get('/viewproduct/:id',userController.product_details)




//====================================User logout===============================
user_route.get('/userlogout',userauth.user_logout);



//================================User Cart Management==========================
user_route.post('/addtocart',userController.user_cart)
user_route.post('/removefromcart',userController.removefrom_cart)



//===================================User View Cart=============================
user_route.get('/viewcart',userController.view_cart)



//===================================User Checkout==============================

user_route.get('/checkout',userController.checkout)
user_route.post('/submitcheckout',userController.submit_checkout)
user_route.post('/verify-payment',userController.PaymentVerified)
user_route.post('/failed-payment',userController.PaymentFailed)
user_route.post('/applyCoupon',coupen_controller.apply_coupen)
user_route.get('/orderconfirmation',userController.order_confirmation)


//================================Ajax Function in Cart=========================
user_route.post('/incrementQuantity',userController.incrementQuantity)




//================================User Wishlist Management=======================
user_route.get('/viewwishlist',userController.view_wishlist)
user_route.get('/addtowishlist/:id',userController.addtowishlist)
user_route.get('/removefromwishlist/:id',userController.removefromwishlist)

module.exports = user_route;


