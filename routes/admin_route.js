const express = require("express");
const admin_route =express();
const path = require("path");

const session = require("express-session");

const admin_controller = require("../controllers/admin_controller");

const coupen_controller = require("../controllers/coupen_controller");

const banner_controller = require("../controllers/banner_controller");

// const config= require('../config/config');
// admin_route.use(session({
//     secret:config.sessionSecret
// }))

const auth = require('../middilewares/auth');


admin_route.set("view engine","ejs");
admin_route.set('views','./views/admin');

// const multer = require("multer");

// const storage = multer.diskStorage({
//     destination:function(req,file,cb){
//        cb(null,path.join(__dirname,'../public/user_images')) 
//     },
//     filename:function(req,file,cb){
//        const name = Date.now()+'-'+file.originalname;
//        cb(null,name);
//     }
// })
const upload =require("../middilewares/multer");



// =========================Admin Login Page =========================
admin_route.get('/',auth.islogout,admin_controller.load_login);



// =========================Admin Verification(post Login) =========================
admin_route.post('/',admin_controller.verifyAdmin);



// =========================Loading home if session=========================
admin_route.get('/home',auth.islogin,admin_controller.home);



// =========================Add Products(Get & Post)=========================
admin_route.get('/addproduct',auth.islogin,admin_controller.add_product)
admin_route.post('/addproduct',upload.array('image', 6),admin_controller.insert_product)



// =========================Add Category(Get & Post)=========================
admin_route.get('/addcategory',auth.islogin,admin_controller.add_category)
admin_route.post('/addcategory',upload.single('categoryimage'),admin_controller.insert_category)
admin_route.get('/editcategory/:id',admin_controller.edit_category)
admin_route.post('/editcategory',admin_controller.update_category)







// =========================View Products List=========================
admin_route.get('/viewproducts',auth.islogin,admin_controller.view_products)



// =========================Delete Products=========================
admin_route.get('/deleteproduct/:id',auth.islogin,admin_controller.delete_product)



// =========================Edit Products(Get & Post)=========================
admin_route.get('/editproduct/:id',auth.islogin,admin_controller.edit_product)
admin_route.post('/editproduct',admin_controller.update_product)
admin_route.post('/deleteproductimage',auth.islogin,admin_controller.deleteproductimage)
admin_route.post('/addproductimage',upload.array('image', 4),auth.islogin,admin_controller.addproductimage)


// =========================View Users List=========================
admin_route.get('/viewusers',auth.islogin,admin_controller.view_users)



// =========================Staff Management=========================
admin_route.get('/addstaffs',auth.islogin,admin_controller.add_staff)
admin_route.post('/addstaffs',auth.islogin,admin_controller.insert_staff)
admin_route.get('/viewstaff',auth.islogin,admin_controller.view_staff)



// =========================Category List=========================
admin_route.get('/viewcategory',auth.islogin,admin_controller.view_category)



// =========================Delete Category=========================
admin_route.get('/deletecategory/:id',auth.islogin,admin_controller.delete_category)



// =========================Block & unblock Users=========================
admin_route.get('/blockuser',auth.islogin,admin_controller.block_user)
admin_route.get('/unblockuser',auth.islogin,admin_controller.unblock_user)





admin_route.get('/listproduct',auth.islogin,admin_controller.list_product)
admin_route.get('/unlistproduct',auth.islogin,admin_controller.unlist_product)


// =========================Order Management=========================
admin_route.get('/orderlist',auth.islogin,admin_controller.view_orders)
admin_route.post('/changeorderstatus',auth.islogin,admin_controller.change_orderstatus)
admin_route.get('/vieworderdetails/:id',auth.islogin,admin_controller.view_orderdetails)



// =========================Coupen Management=========================
admin_route.get('/viewcoupens',auth.islogin,coupen_controller.view_coupens)
admin_route.get('/addcoupens',auth.islogin,coupen_controller.add_coupen)
admin_route.post('/addcoupens',auth.islogin,coupen_controller.insert_coupen)
admin_route.get('/deletecoupen/:id',auth.islogin,coupen_controller.delete_coupen)
admin_route.get('/editcoupen/:id',auth.islogin,coupen_controller.edit_coupen)
admin_route.post('/editcoupen',auth.islogin,coupen_controller.editing_coupen)


admin_route.get('/viewbanners',auth.islogin,banner_controller.view_banners)
admin_route.get('/add_banners',auth.islogin,banner_controller.add_banners)
admin_route.post('/add_banners',upload.single('bannerimage'),auth.islogin,banner_controller.insert_banners)
admin_route.get('/deletebanner/:id',auth.islogin,banner_controller.delete_banner)
admin_route.get('/editbanner/:id',auth.islogin,banner_controller.edit_banner)
admin_route.post('/edit_banner',upload.single('bannerimage'),auth.islogin,banner_controller.editing_banner)





admin_route.get('/salesreport',auth.islogin,admin_controller.sales_report);
admin_route.post('/salesreport',auth.islogin,admin_controller.getsales_report);
admin_route.post('/printsalesreport',auth.islogin,admin_controller.getingsales_report);


// =========================Admin Logout=========================
admin_route.get('/adminlogout',auth.adminlogout);

module.exports = admin_route