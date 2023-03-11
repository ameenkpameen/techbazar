const Admin = require("../models/admin_data")
const Product = require("../models/product_data")
const Category = require("../models/category_data")
const User = require("../models/user_data")
const Staff = require("../models/staff_data")
const Order = require("../models/order_data")

const path = require("path");
const fs = require('fs');

const mongoose = require("mongoose")
const bycrypt = require('bcrypt');
const { log } = require("console")


//  const Admin = require("mongodb");

const load_login = async(req,res)=>{
  
    try{
        
        res.render('admin_login');


    }catch(error){
        console.log(error.message);
    }


}

const verifyAdmin = async(req,res)=>{
    
    try{
    
       const username = req.body.username;
       const password = req.body.password;

       const adminData = await Admin.findOne({username:username});
       if(adminData){
            if(adminData.password===password){

                req.session.admin_id=adminData._id
                res.redirect('/admin/home');
            }else{
                res.render('admin_login');
            }

       }else{
        res.render('admin_login',{message:"Email or password incorrect"})
       }

    }catch(error){
        console.log(error.message);
    }
}


const home = async(req,res)=>{
    try{
        const thisweek = new Date(Date.now()- 7 * 24 * 60 * 60 *1000);
        const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const Orders = await Order.find({createdAt:{$gte: thisweek}}).count()
        const products = await Product.find({}).count()
        const UPI = await Order.find({paymentmethod:"UPI"}).count()
        const COD = await Order.find({paymentmethod:"COD"}).count()
        const Wallet = await Order.find({paymentmethod:"Wallet"}).count()
        const users = await User.find({}).count()
        const deliveredorders = await Order.find({createdAt:{$gte: thisweek},status:"Delivered"}).count()
        
        const salesChart = await Order.aggregate([
            {
              $match: {
                status: {
                  $eq: "Delivered"
                }
              }
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                sales: { $sum: "$totalprice" },
              }
            },
            {
              $sort: { _id: 1 }
            },
            {
              $limit: 7
            }
          ])
          const date = salesChart.map((item) => {
            return item._id;
          })
          const sales = salesChart.map((item) => {
            return item.sales;
          })
        
        //   console.log(date);
        //   console.log(sales);

        const orderstatus = await Order.aggregate([
            { $group: { _id:"$status", count: { $sum: 1 } } }
          ])
        let revenue = 0;
        const totalOrder = await Order.aggregate([
            {$match:{createdAt:{$gte: thisweek}}}
        ])
        for(let i=0; i<totalOrder.length; i++){
            revenue = revenue+ totalOrder[i].totalprice;
        }
        res.render('home',{Orders,products,revenue,users,orderstatus,UPI,COD,Wallet,deliveredorders,date,sales})
    }catch(error){
    console.log(error.message);
    }
}

const add_product = async(req,res)=>{
    try{
        const categoryData = await Category.find({});
        res.render('add_product',{categoryData:categoryData})
    }catch(error){
    console.log(error.message);
    }
}


const insert_product = async(req,res)=>{
     

    try{
        if(req.body.productname == ''|| req.body.categoryname == ''|| req.body.brand == ''|| req.body.discription == ''|| req.body.price == ''|| req.body.orders == ''|| req.body.stock == ''|| req.body.list == ''){
            res.json({null:true}) 
        }else if(req.files.length<3){
            res.json({image:true}) 
        }else{
               const imgArray = []
               for(var i=0;i<req.files.length;i++){
                   imgArray.push(req.files[i].filename)
               }

               const product = new Product({
                   productname:req.body.productname,
                   category:req.body.categoryname,
                   brand:req.body.brand,
                   discription:req.body.discription,
                   image:imgArray,
                   price:req.body.price,
                   orders:req.body.orders,
                   stock:req.body.stock,
                   list:req.body.list
       
               })

               const productData = await product.save();

               if(productData){
                   // console.log(req.body);
                   // console.log(req.files);
                   res.json({added:true})
               }
         }
    }catch(error){
         console.log(error.message);
    }
}


const add_category = async(req,res)=>{
    try{
        res.render('add_category')
    }catch(error){
    console.log(error.message);
    }
}

const insert_category = async(req,res)=>{
    console.log(req.body);
    
    try{
        
        const categoryname=req.body.categoryname;
        const description=req.body.description;
        console.log(description);
        console.log(req.file.filename);
        const recentcategory =await Category.findOne({categoryname:categoryname})
         

        if(recentcategory){
            console.log("Category Already exist");
            res.render('add_category',{message:"Category Already exist"})

        } else if(req.body.categoryname==''|| req.body.description==''){
            res.render('add_category',{message:"You Should fill all fields"})
        }else{
            const category = new Category({
                categoryname:req.body.categoryname,
                description:req.body.description,
                categoryImage:req.file.filename
            })
            const categoryData = await category.save();
            console.log("Category added successfully");
            res.render('add_category',{message:"category added successfully"})
        }
    }catch(error){
         console.log(error.message);
    }
}


const edit_category = async(req,res)=>{
    try{

        const id = req.params.id
        const categoryData = await Category.find({_id:id})
        
        res.render('editcategory',{data:categoryData})
    }catch(error){
    console.log(error.message);
    }
}


const update_category = async(req,res)=>{
    try{
       console.log(req.body);
       const description = req.body.description
       const categoryname = req.body.categoryname
       const recentcategory =await Category.findOne({categoryname:categoryname})
       console.log(recentcategory);
       if(recentcategory){
          res.json({recent:true})
       }else if(req.body.categoryname==''|| req.body.description==''){
         console.log("null");
         res.json({null:true})
       }else{
         const id= req.body.categoryId
         const categoryData = await Category.updateOne({_id:id},{categoryname:req.body.categoryname,description:req.body.description});
         res.json({success:true})
       }
       
    }catch(error){
       console.log(error.message);
    }
}



const view_products = async(req,res)=>{
    try{

        const productData = await Product.find({}).populate('category')
        // console.log(productData);
        res.render('view_products',{products:productData})
    }catch(error){
    console.log(error.message);
    }
}

const delete_product = async(req,res)=>{
    
    try{
        console.log(req.params.id);
        const id=req.params.id;
        await Product.deleteOne({_id:id})
        // console.log(productData);
        res.json({success:true})
    }catch(error){
    console.log(error.message);
    }
}


const edit_product = async(req,res)=>{
    try{
        const id = req.params.id;
        const productData = await Product.find({_id:id}).populate('category')
        const categoryData =await Category.find({})
        res.render('edit_product',{productData:productData,categoryData:categoryData})
    }catch(error){
    console.log(error.message);
    }
}


const update_product = async(req,res)=>{
    console.log(req.body);
    const id = req.body.productId
    const editproduct =await Product.find({_id:id})
    const cat = await Product.findOne({_id:id}).populate('category')
    
    try{
        
        const category = await Category.findOne({_id: req.body.categoryname})
        const categoryId = category._id
        const productData = await Product.updateOne({_id:id},{productname:req.body.productname,
            category:categoryId,
            brand:req.body.brand,
            discription:req.body.discription,
            price:req.body.price,
            orders:req.body.orders,
            stock:req.body.stock});

        if(productData){
            
            res.json({success:true})
        }else{
            res.json({error:true})
        }
    }catch(error){
         console.log(error.message);
    }
}


const deleteproductimage=async(req,res)=>{
    try{
        const productId = req.body.productId
        const image = req.body.image
        const imagepath = path.join(__dirname,'../public/user_images')
        const productData = await Product.updateOne({_id:productId},{$pull:{image:image}})
        console.log(productData);
        
        fs.chmod(imagepath, 0o777, (err) => {
            if (err) {
              console.log("Error changing permissions", err);
              res.json({ message: "Error changing permissions" });
            } else {
              fs.unlink(imagepath, (err) => {
                if (err) {
                  console.log("Error deleting image", err);
                  res.json({ message: "Error deleting image" });
                } else {
                  console.log("Image deleted successfully");
                  res.json({ success: true });
                }
              });
            }
          });

    }catch(error){
    console.log(error.message);
    }
}


const addproductimage = async(req,res)=>{
    try{
        const images =[]
        req.files.forEach((element)=>{
            images.push(element.filename);
        })
        const product = req.body.productId
        const filelength = req.files.length

        const productData = await Product.findOne({_id:product})
        const currlength = productData.image.length
        if((filelength+currlength)<=4){
              for(let i=0; i<images.length; i++){
                await Product.updateOne({_id:product},{$push:{image:images[i]}})
              }
              res.json({success:true})
        }else{
              res.json({image:true})
        }
    }catch(error){
    console.log(error.message);
    }
}




const view_category = async(req,res)=>{
    try{

        const categoryData = await Category.find({})
        // console.log(productData);
        res.render('view_category',{category:categoryData})
    }catch(error){
    console.log(error.message);
    }
}

const delete_category = async(req,res)=>{
    
    try{
        console.log(req.params.id);
        const id=req.params.id;
        await Category.deleteOne({_id:id})
        // console.log(productData);
        res.redirect('/admin/viewcategory')
    }catch(error){
    console.log(error.message);
    }
}

const view_users = async(req,res)=>{
    try{

        const usersData = await User.find({})
        // console.log(productData);
        res.render('view_users',{users:usersData})
    }catch(error){
    console.log(error.message);
    }
}


const add_staff = async(req,res)=>{
    try{

        
        res.render('add_staff')
    }catch(error){
    console.log(error.message);
    }
}



const insert_staff = async(req,res)=>{
     

    try{
        
        req.body.password = await bycrypt.hash(req.body.password, 10)
        console.log(req.body);
        const staff = new Staff({
            name:req.body.name,
            username:req.body.username,
            phonenumber:req.body.phonenumber,
            password:req.body.password,
            privilage:req.body.Privilage

        })

        const staffData = await staff.save();

        if(staffData){
            // console.log(req.body);
            // console.log(req.files);
            res.redirect('/admin/viewstaff')
        }else{
            res.render('add_staff',{message:"staff insertion failed"})
        }
    }catch(error){
         console.log(error.message);
    }
}


const view_staff = async(req,res)=>{
    try{

        const staffData = await Staff.find({})
        
        res.render('view_staffs',{staffs:staffData})
    }catch(error){
    console.log(error.message);
    }
}


const block_user = async(req,res)=>{

    try{

        const id= req.query.id
        console.log(id);

        const hai = await User.find({_id:req.query.id})
        console.log(hai)
        
        await User.updateOne({_id:id},{$set:{status:false}});
        // console.log(productData);

        res.redirect('/admin/viewusers')
    }catch(error){
    console.log(error.message);
    }
}





const list_product = async(req,res)=>{

    try{

        const id= req.query.id
        console.log(id);

        const hai = await Product.find({_id:id})
        
        await Product.updateOne({_id:id},{$set:{list:"List"}});
        // console.log(productData);

        res.redirect('/admin/viewproducts')
    }catch(error){
    console.log(error.message);
    }
}




const unlist_product = async(req,res)=>{

    try{
        const id= req.query.id
        console.log(id);
        const hai = await Product.find({_id:id})
        await Product.updateOne({_id:id},{$set:{list:"Unlist"}});
        // console.log(productData);

        res.redirect('/admin/viewproducts')
    }catch(error){
    console.log(error.message);
    }
}


const unblock_user = async(req,res)=>{

    try{

        const id= req.query.id
        console.log(id);
        
        await User.updateOne({_id:id},{$set:{status:true}});
        // console.log(productData);

        res.redirect('/admin/viewusers')
    }catch(error){
    console.log(error.message);
    }
}




const view_orders = async(req,res)=>{
    try{

        const productData = await Order.find({}).sort({createdAt:-1})
      
        
        const array=[]
        if(productData.length>0){
            for(let i=0; i<productData.length; i++){
                array.push(await Order.findOne({_id: productData[i]._id}).populate("products.productId").exec())
            }
        }
   

        const userarray = []
        if(productData.length>0){
            for(let i=0; i<productData.length; i++){
                userarray.push(await Order.findOne({_id: productData[i]._id}).populate("userId").exec())
            }
        }

        // console.log(userarray);

        
        res.render('view_orders',{orders:productData,products:array,users:userarray})
    }catch(error){
    console.log(error.message);
    }
}



 const change_orderstatus = async (req, res) => {
    try {
       
        if(req.body.value == "Return Approved"){
            const order = await Order.findOne({orderId:req.body.orderId}).populate("products.productId")
            const price = order.totalprice
            const wallet = await User.updateOne({_id:order.userId},{$inc:{wallet:price}})
             order.products.forEach(async (element)=>{
             const count = element.quantity + element.productId.stock
             console.log(count);
             const update = await Product.updateOne({_id:element.productId._id},{stock:count})
           })
           const status=req.body.value
           const change = await Order.updateOne({orderId: req.body.orderId},{$set:{status: status}});
           if(change){
            res.json({ success: true, status  });
           }
        }else{
            const status=req.body.value
            const change = await Order.updateOne({orderId: req.body.orderId},{$set:{status: status}});
            if(change){
                res.json({ success: true, status  });
            }
        }


      
    } catch (error) {
      console.log(error.message);
    }
  };


 const view_orderdetails = async (req, res) => {
    try {
      const orderId = req.params.id
      console.log(orderId);
      const order = await Order.find({orderId:orderId}).populate("products.productId")
        console.log(order);
      res.render("orderdetails", { orders: order });
     
    } catch (error) {
      console.log(error.message);
    }
  };



const sales_report = async (req, res) => {
    try {
      
      res.render("sales_report");
     
    } catch (error) {
      console.log(error.message);
    }
  };


  const getsales_report = async (req, res) => {
    try {
       console.log(req.body);
       const from = req.body.fromDate;
       const to = req.body.toDate;
       console.log(from,to);
      if(req.body.fromDate == '' || req.body.toDate == ''){
        res.render('sales_report',{message:"All fields are required"})
      }else{
         const datas = await Order.find({status:"Delivered", createdAt:{$gte:new Date(from), $lte:new Date(to)}}).populate("products.productId")
         console.log(datas);
         res.render('print_salesreport',{orders:datas})
      }
     
    } catch (error) {
      console.log(error.message);
    }
  };



  const getingsales_report = async (req, res) => {
    try {
       console.log(req.body);
       res.render('print_salesreport')
     
    } catch (error) {
      console.log(error.message);
    }
  };


module.exports= {
    load_login,
    verifyAdmin,
    home,
    add_product,
    insert_product,
    add_category,
    insert_category,
    view_products,
    view_category,
    delete_product,
    edit_product,
    delete_category,
    view_users,
    update_product,
    block_user,
    unblock_user,
    add_staff,
    insert_staff,
    view_staff,
    view_orders,
    change_orderstatus,
    deleteproductimage,
    addproductimage,
    edit_category,
    update_category,
    view_orderdetails,
    sales_report,
    getsales_report,
    getingsales_report,
    list_product,
    unlist_product
}