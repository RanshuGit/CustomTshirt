var express = require('express');
var router = express.Router();

var Order = require('../models/order');
var Cart = require('../models/cart');
var User = require('../models/user');
var Product = require('../models/product');
var Clipart = require('../models/clipart');
var CustomProduct = require('../models/customproduct');
var PrivateCustproduct = require('../models/privatecustproduct');
var Message = require('../models/message');

/*Get Admin Dashboard Page*/
router.get('/',isLoggedIn, function(req,res,next) {
    var adminemail = 'Admin@admin.com';
    if(adminemail != req.user.email){
        res.redirect('/');
    }
    res.render('user/admindashboard', {aclicked:true});
});

/*Get Admin Users pages*/
router.get('/users',isLoggedIn, function(req,res,next) {
    var adminemail = 'Admin@admin.com';
    if(adminemail != req.user.email){
        res.redirect('/');
    }
    var errMsg = req.flash('error')[0];
    var successMsg = req.flash('success')[0];
    User.find({}, function(err, users) {
        if (err) {
            return res.write('Error!');
        }
        res.render('user/adminusers', {users: users, errMsg, noError: !errMsg, successMsg, noMessage: !successMsg,aclicked:true});
    });
});

/*Get Admin Orders Page*/
router.get('/orders',isLoggedIn, function(req,res,next) {
    var adminemail = 'Admin@admin.com';
    if(adminemail != req.user.email){
        res.redirect('/');
    }
    Order.find({}, function(err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/adminorders', {orders: orders, aclicked:true});
    });
});

/*Get Admin Products Page*/
router.get('/products',isLoggedIn, function(req,res,next) {
    var adminemail = 'Admin@admin.com';
    if(adminemail != req.user.email){
        res.redirect('/');
    }
    var errMsg = req.flash('error')[0];
    var successMsg = req.flash('success')[0];
    
    CustomProduct.find({}, function(err, customp) {
        if (err) {
            return res.write('Error!');
        }
        Product.find({}, function(err, product) {
            if (err) {
                return res.write('Error!');
            }
            PrivateCustproduct.find({}, function(err, pproduct) {
                if (err) {
                    return res.write('Error!');
                }  
                res.render('user/adminproducts', {products: product, customproducts: customp, privateproducts : pproduct, errMsg, noError: !errMsg, successMsg, noMessage: !successMsg, aclicked:true});
            });
            
        });
    });
   
    
});

router.get('/messages', isLoggedIn, function (req, res, next) {
    var adminemail = 'Admin@admin.com';
    if (adminemail != req.user.email) {
        res.redirect('/');
    }
    Message.find({}, function (err, message) {
        if (err) {
            return res.write('Error!');
        }
        res.render('user/adminmessages', { messages: message, aclicked: true });
    });
});

/*Get Admin Cliparts Page*/
router.get('/clipart',isLoggedIn, function(req,res,next) {
    var adminemail = 'Admin@admin.com';
    if(adminemail != req.user.email){
        res.redirect('/');
    }
    var errMsg = req.flash('error')[0];
    var successMsg = req.flash('success')[0];
    Clipart.find({}, function(err, clipart) {
        if (err) {
            return res.write('Error!');
        }
        res.render('user/adminclipart', {clipart: clipart, aclicked:true ,errMsg, noError: !errMsg, successMsg, noMessage: !successMsg});
    });
});

/*remove the Clipart through Admin Login*/
router.get('/removeclipart/:id',isLoggedIn, function(req, res, next) {
    var adminemail = 'Admin@admin.com';
    if(adminemail != req.user.email){
        res.redirect('/');
    }
    var ClipartId = req.params.id;
    Clipart.deleteOne({_id : ClipartId}, function(err, data) {
        if(err){
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/user/admin/clipart');
        }else{
            
        console.log("Data Deleted!");
        req.flash('success', 'Successfully Removed The Clipart');
        res.redirect('/user/admin/clipart');
        } 
    });  
    
  });

/*to create the clipart*/
router.get('/addclipart/',isLoggedIn, function(req, res, next) {
    var adminemail = 'Admin@admin.com';
    if(adminemail != req.user.email){
        res.redirect('/');
    }
   
    res.render('user/adminaddclipart');
      
});


router.post('/addclipart/',isLoggedIn, function(req, res, next) {
    var adminemail = 'Admin@admin.com';
    if(adminemail != req.user.email){
        res.redirect('/');
    }
    var clipart = new Clipart({
        image : req.body.image,
    });
    clipart.save(function(err, result){
        if(err){
            req.flash('error',err.msg);
            res.redirect('/user/admin/addclipart');
        }
        else{
            req.flash('success','Clipart Added Successfully!');
            res.redirect('/user/admin/clipart');
        }
    });
    
});

/*remove the user through Admin Login*/
router.get('/removeuser/:id',isLoggedIn, function(req, res, next) {
    var adminemail = 'Admin@admin.com';
    if(adminemail != req.user.email){
        res.redirect('/');
    }
    var UserId = req.params.id;
    User.deleteOne({_id : UserId}, function(err, data) {
        if(err){
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/user/admin/users');
        }else{
            
        console.log("Data Deleted!");
        req.flash('success', 'Successfully Removed The User');
        res.redirect('/user/admin/users');
        } 
    });  
    
  });

/*remove the Product through Admin Login*/
router.get('/removeproduct/:id',isLoggedIn, function(req, res, next) {
    var adminemail = 'Admin@admin.com';
    if(adminemail != req.user.email){
        res.redirect('/');
    }
    var productId = req.params.id;
    Product.findOneAndDelete({_id : productId}, function(err, product) {
        if(err){
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/user/admin/products');
        }
        if(product==null) {
            CustomProduct.findOneAndDelete({_id : req.params.id}, function(err, data) {
                if(err){
                    console.log(err);
                    req.flash('error', err.message);
                    res.redirect('/user/admin/products');
                }
                if (data==null) {
                    PrivateCustproduct.findOneAndDelete({_id : req.params.id}, function(err, pproduct) {
                        if(err){
                            console.log(err);
                            req.flash('error', err.message);
                            res.redirect('/user/admin/products');
                        }
                        else{
                            console.log("Data Deleted!");
                            req.flash('success', 'Successfully Removed The Product');
                            res.redirect('/user/admin/products');
                            } 
                        }); 
                }
                else{
                    console.log("Data Deleted!");
                    req.flash('success', 'Successfully Removed The Product');
                    res.redirect('/user/admin/products');
                    } 
                }); 
    
        }
        else{   
            
        console.log("Data Deleted!");
        req.flash('success', 'Successfully Removed The Product');
        res.redirect('/user/admin/products');
        } 
    });  
    
});

/*to get the product ID from the main products Table*/
router.get('/updateproduct/:id',isLoggedIn, function(req, res, next) {
    var adminemail = 'Admin@admin.com';
    if(adminemail != req.user.email){
        res.redirect('/');
    }
    var productId = req.params.id;
    Product.findOne({_id : productId}, function(err, product) {
        if(err){
            console.log(err);
            req.flash('error', err.message);
            res.redirect('/user/admin/products');
        }
       if(product == null) {
            CustomProduct.findOne({_id : productId}, function(err, custproduct){
                if(err){
                    console.log(err);
                    req.flash('error', err.message);
                    res.redirect('/user/admin/products');
                }
                else{
                    console.log('Custom Product found');
                    console.log(custproduct);
                    res.render('user/adminupdateproduct', {products: custproduct, aclicked:true ,imagePath: custproduct.imagePath, id: custproduct.id, title: custproduct.title, description: custproduct.description, price: custproduct.price, size: custproduct.size});
                }
             });
        }
        else {
            console.log('Product found');
            console.log(product);
            res.render('user/adminupdateproduct', {products: product, aclicked:true ,imagePath: product.imagePath, id: product.id, title: product.title, description: product.description, price: product.price, size: product.size});
        }
           
    });    
});

/*To update the product*/
router.post('/updateproduct/:id',isLoggedIn, function(req, res, next) {
    var adminemail = 'Admin@admin.com';
    if(adminemail != req.user.email){
        res.redirect('/');
    }
    var productId = req.params.id;
    Product.findOneAndUpdate({_id: productId}, {
        imagePath: req.body.imagePath,
        description : req.body.description,
        title: req.body.title,
        price: req.body.price,
        size: req.body.size
    }, function(err, data) {
        if(err){
            console.log(err);
            req.flash('error',err.message);
            res.redirect('user/admin/products');
        }
        if(data ==null) {
            CustomProduct.findOneAndUpdate({_id: productId}, {
                imagePath: req.body.imagePath,
                description : req.body.description,
                title: req.body.title,
                price: req.body.price,
                size: req.body.size
            }, function(err, custproduct) {
                if(err){
                    console.log(err);
                    req.flash('error',err.message);
                    res.redirect('user/admin/products');
                }
                else{
                    console.log('Product Update is Successful!');
                    req.flash('success', 'Product update is Successful!');
                    res.redirect('/user/admin/products');
                }
            });
        }
        else{
            console.log('Product Update is Successful!');
            req.flash('success', 'Product update is Successful!');
            res.redirect('/user/admin/products');
        }
    });
});

/*to create the product*/
router.get('/createproduct/',isLoggedIn, function(req, res, next) {
    var adminemail = 'Admin@admin.com';
    if(adminemail != req.user.email){
        res.redirect('/');
    }
   
    res.render('user/admincreateproduct', {aclicked:true});
      
});


router.post('/createproduct/',isLoggedIn, function(req, res, next) {
    var adminemail = 'Admin@admin.com';
    if(adminemail != req.user.email){
        res.redirect('/');
    }
    var product = new Product({
        imagePath : req.body.imagePath,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        size: req.body.size
    });
    product.save(function(err, result){
        if(err){
            req.flash('error',err.msg);
            res.redirect('/user/admin/createproduct');
        }
        else{
            req.flash('success','Product Added Successfully!');
            res.redirect('/user/admin/products');
        }
    });
    
});

module.exports = router;

function isLoggedIn(req,res,next){
    if (req.isAuthenticated()) {
    return next();
    }
    res.redirect('/');
}
