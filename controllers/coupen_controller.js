const Coupen = require("../models/coupen_data")


const view_coupens = async (req, res) => {
    try {
        const coupens = await Coupen.find({})
        res.render('coupens', { coupens: coupens });
    } catch (error) {
        console.log(error.message);
    }
}


const delete_coupen = async (req, res) => {

    try {
        const id = req.params.id;
        await Coupen.deleteOne({ _id: id })
        res.json({ success: true })
    } catch (error) {
        console.log(error.message);
    }
}





const add_coupen = async (req, res) => {
    try {
         res.render('add_coupen')
    } catch (error) {
        console.log(error.message);
    }
}


const insert_coupen = async (req, res) => {
    try {

        const coupencode = req.body.coupencode;
        const recentcoupen = await Coupen.findOne({ coupencode: coupencode })
        if (recentcoupen) {
            res.json({ recent: true });
        } else {
            const coupen = new Coupen({
                coupencode: req.body.coupencode,
                percentoff: req.body.percentoff,
                maxDiscount: req.body.maxdiscount,
                expiryDate: req.body.expiry,
                minPurchaseAmount: req.body.minpurchase
            })

            const coupenData = await coupen.save();

            if (coupenData) {
                res.json({ added: true })
            } else {
                res.json({ notadded: true })
            }

        }
    } catch (error) {
        console.log(error.message);
    }
}



const apply_coupen = async (req, res) => {
    try {
        if (req.session.user) {
            const user = req.session.user
            const code = req.body.code
            const cartTotal = req.body.total
            const coupen = await Coupen.findOne({ coupencode: req.body.code });
            console.log(coupen);
            const percentoff = coupen.percentoff;
            const expiry = coupen.expiryDate;
            const newDate = Date.now();
            const minPurchaseAmount = coupen.minPurchaseAmount;
            const found = await Coupen.findOne({ coupencode: code, usersUsed: { $in: [user._id] } })
            if (found) {
                res.json({ userfailed: true })
            } else {
                if (newDate <= expiry) {
                    if (cartTotal >= minPurchaseAmount) {
                        let Discount = cartTotal * percentoff / 100
                        Discount = Math.round(Discount)
                        if (Discount > coupen.maxDiscount) {
                            let finalDiscount = coupen.maxDiscount
                            let finalvalue = cartTotal - finalDiscount;
                            console.log(finalvalue);
                            console.log(finalDiscount);

                            res.json({ value: true, finalvalue, finalDiscount, code })
                        } else {
                            let finalDiscount = Discount
                            let finalvalue = cartTotal - finalDiscount;
                            console.log(finalvalue);
                            console.log(finalDiscount);

                            res.json({ value: true, finalvalue, finalDiscount })
                        }
                    } else {
                        res.json({ pricefailed: true })
                        finalDiscount = 0
                    }
                } else {
                    res.json({ datefailed: true })
                    finalDiscount = 0
                }
            }
            console.log(finalDiscount);
        }
    } catch (error) {
        console.log(error.message);
    }
}



const edit_coupen = async (req, res) => {
    try {
        const id = req.params.id;
        const coupen = await Coupen.findOne({ _id: id });
        res.render('editcoupen', { coupen: coupen })
    } catch (error) {
        console.log(error.message);
    }
}




const editing_coupen = async (req, res) => {
    try {
        const id = req.body.coupenId;
        const coupen = await Coupen.updateOne({ _id: id }, {
            coupencode: req.body.coupencode,
            percentoff: req.body.percentoff,
            maxDiscount: req.body.maxdiscount,
            expiryDate: req.body.expiry,
            minPurchaseAmount: req.body.minpurchase
        });
        res.json({ success: true })
    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    view_coupens,
    add_coupen,
    insert_coupen,
    apply_coupen,
    delete_coupen,
    edit_coupen,
    editing_coupen
}