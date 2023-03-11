const Banner = require("../models/banner_data")


const view_banners = async(req,res)=>{
    try{
         const banners = await Banner.find({})
        res.render('view_banners',{bannerData:banners});
    }catch(error){
      console.log(error.message);
    }
}


const add_banners = async(req,res)=>{
    try{
        res.render('add_banners')
    }catch(error){
    console.log(error.message);
    }
}


const insert_banners = async(req,res)=>{
    console.log(req.body);
    console.log(req.file);
    try{
        
        
         if(req.body.bannercaption==''|| req.body.description==''){
            res.render('add_banners',{message:"You Should fill all fields"})
        }else{
            const banner = new Banner({
                bannerCaption:req.body.bannercaption,
                description:req.body.description,
                subDescription:req.body.subdescription,
                image:req.file.filename
            })
            const bannerData = await banner.save();
            console.log("Banner added successfully");
            res.json({added:true});
        }
    }catch(error){
         console.log(error.message);
    }
}



const edit_banner = async(req,res)=>{
    try{
        const id = req.params.id;
        const banner = await Banner.find({_id:id});
        console.log(banner);
        res.render('edit_banner',{banner:banner})
    }catch(error){
    console.log(error.message);
    }
}




const editing_banner = async(req,res)=>{
    try{
        const id = req.body.bannerId;
        
        const banner = await Banner.updateOne({_id:id},{
            bannerCaption:req.body.bannercaption,
            description:req.body.description,
            subDescription:req.body.subdescription,
            image:req.body.filename
        });
        res.json({added:true});
    }catch(error){
    console.log(error.message);
    }
}




const delete_banner = async(req,res)=>{
    
    try{
        console.log(req.params.id);
        const id=req.params.id;
        await Banner.deleteOne({_id:id})
        // console.log(productData);
        res.json({success:true})
    }catch(error){
    console.log(error.message);
    }
}


module.exports = {
    add_banners,
    view_banners,
    insert_banners,
    delete_banner,
    edit_banner,
    editing_banner
}