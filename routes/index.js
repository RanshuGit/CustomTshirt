var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var hbs = require('nodemailer-express-handlebars');
var Cart = require('../models/cart');


var Product = require('../models/product');
var Customproduct = require('../models/customproduct');
var Order = require('../models/order');
var Clipart = require('../models/clipart');
var PrivateCustproduct = require('../models/privatecustproduct');
var Message = require('../models/message');

/* GET home page. */
router.get('/', function(req, res, next) {
  var successMsg = req.flash('success')[0];
  var errmsg = req.flash('error')[0];
  var productChunks = [];
  var chunkSize = 3;
  var customproductchunks = [];
  var custchunksize = 3;
  Customproduct.find(function(err, docs){
      
    for(var i = 0; i < docs.length; i += custchunksize) {
      customproductchunks.push(docs.slice(i, i + custchunksize));
    }
  });
  Product.find(function(err, docs){
   for(var i = 0; i < docs.length; i += chunkSize) {
        productChunks.push(docs.slice(i, i + chunkSize));
      }
      res.render('shop/index', { title: 'Printed Tshirt Designer', products: productChunks, customproducts: customproductchunks, errmsg: errmsg, noerror: !errmsg ,successMsg: successMsg, noMessages: !successMsg, hclicked : true });  
  });
});

router.get('/add-to-cart/:id',function(req, res, next){
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});
  Customproduct.findById(productId, function(err, custproduct){
    if (err) {
      
     return res.redirect('/');
    }
    if(custproduct==null)
    {
      Product.findById(req.params.id, function(err, product){
        if (err) {
          return res.redirect('/');
        }
        if(product ==null){
          PrivateCustproduct.findById(req.params.id, function(err, pproduct){
            if (err) {
              return res.redirect('/');
            }
            cart.add(pproduct, pproduct.id);
            req.session.cart = cart;
            console.log(req.session.cart);
            res.redirect('/');
          });
        }
        else {
          cart.add(product, product.id);
          req.session.cart = cart;
          console.log(req.session.cart);
         res.redirect('/');
        }  
      });
    }
    else{
      cart.add(custproduct, custproduct.id);
      req.session.cart = cart;
      console.log(req.session.cart);
      
      res.redirect('/');
    }
    
  });
  
  
  
});

router.get('/reduce/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/add/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.addByOne(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
  var productId = req.params.id;
  var cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect('/shopping-cart');
});

router.get('/shopping-cart', function(req, res, next){
  if(!req.session.cart) {
    return res.render('shop/shopping-cart', {products : null});
  }
  var cart = new Cart(req.session.cart);
  res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice, totalqty: cart.totalQty});
});

router.get('/checkout', isLoggedIn,function(req, res, next) {
  if(!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);
  var errMsg = req.flash('error')[0];
  res.render('shop/checkout', {total : cart.totalPrice, errMsg, noError: !errMsg, products: cart.generateArray(), totalqty: cart.totalQty});
});

router.post('/checkout',isLoggedIn ,function(req, res, next) {
  if(!req.session.cart) {
    return res.redirect('/shopping-cart');
  }
  var cart = new Cart(req.session.cart);

  const Stripe = require('stripe');
  const stripe = Stripe('sk_test_51Hyt96Lrxata1dmuVFRNqEwrcVzelwfxfflRnvmlyVX1tovJs9hW9kqTH3tCHNS8QQV5Yb91NU9wghYCACSK4GJ300NgUwkfVG');
  stripe.charges.create({
    amount: cart.totalPrice * 100,
    currency: "inr",
    source: req.body.stripeToken, // obtained with Stripe.js
    description: " Test Charge"
  }, function(err, charge) {
    // asynchronously called
    if(err) {
      req.flash('error', err.message);
      return res.redirect('/checkout');
    }
    var order = new Order({
      user : req.user,
      cart : cart,
      address: req.body.address,
      address2: req.body.address2,
      fname: req.body.firstname,
      lname: req.body.lastname,
      paymentId: charge.id,
      pnum: req.body.pnumber
    });
          var mailmessage = `
    <p>You Order was Successful.</p>
    <h3>Order Details</h3>
    <ul>
       
        <li>First Name  : ${req.body.firstname}</li>
        <li>Last Name : ${req.body.lastname}</li>
        <li>Address : ${req.body.address} ${req.body.address2}</li>
        <li>Phone : ${req.body.pnumber}</li>
        <li>Order Id : ${order.id}</li>
        <li>Payment Id: ${charge.id}</li>
        <li>Cart : ${cart.generateArray()}</li>
    </ul>
    `;
          var options = {

              viewEngine: {

                  extname: '.hbs',

                  layoutsDir: 'views/email/',

                  defaultLayout: 'template',

                  partialsDir: 'views/partials/'

              },
              viewPath: 'views/email/',

              extName: '.hbs'

          };

         

        //   let transporter = nodemailer.createTransport({
        //       host: 'smtp.gmail.com',
        //       port: 587,
        //       secure: true,
        //       auth: {

        //           user: 'printedtshirtdesigner@gmail.com',
        //           pass: 'printedtshirt'
        //       },
        //       tls: {

        //           rejectUnauthorized: false
        //       }
        //   });

        //   transporter.use('compile', hbs(options));
        //   // send mail with defined transport object
        //   transporter.sendMail({
        //       from: '"Printed Tshirt Designer" <printedtshirtdesigner@gmail.com>', // sender address
        //       to: req.body.email, // list of receivers

        //       subject: "Order Booking Confirmation", // Subject line
        //      // html: mailmessage, // html body
        //       template: 'email_body',

        //        context: {

        //            products: cart.generateArray(),
        //            totalPrice: cart.totalPrice,
        //            totalqty: cart.totalQty,
        //             First_Name: req.body.firstname ,
        //              Last_Name :req.body.lastname,
        //  Address1 : req.body.address,
        //  Address2: req.body.address2,
        //  Phone : req.body.pnumber,
        //  Order_Id : order.id,
        //  Payment_Id: charge.id

        //        }
        //    });
    order.save(function(err, result) {
      req.flash('success', 'Successfully Bought the Tshirts');
      req.session.cart = null;
      res.redirect('/success');
    });
  });

    
});

router.get('/success',isLoggedIn, function(req,res,next) {
  res.render('success');
});

router.get('/customize',isLoggedIn, function(req,res,next) {
  
  Clipart.find(function(err, clipart){
    if(err) {
      console.log('Error in Loading Clipart');
    } else {
      var errmsg = req.flash('error')[0];
      res.render('customizer', {clipart : clipart, errmsg: errmsg, noerror: !errmsg, cclicked: true });
    }
  });
  
});

router.post('/addtohome',isLoggedIn, function(req, res, next) {
  var customproduct = new Customproduct({
    imagePath: req.body.imagePath, 
    title: req.body.tshirtname,
    description: req.user.email,
    price: req.body.price,
    size: req.body.size
 });
 customproduct.save(function(err, result) {
   if(err){
     req.flash('error', 'First Save the Design. View it in Design preview then only click Add to Home');
     res.redirect('/');
   }
   else{
    req.flash('success', 'Successfully Added the Tshirt to our Product List You can Scroll Down and Buy It.');
    res.redirect('/customize');
   }
 
}); 
});

router.post('/privateadding',isLoggedIn, function(req, res, next) {
  var privateproduct = new PrivateCustproduct({
    imagePath: req.body.imagePath, 
    title: 'Personal Custom TShirt!!!!',
    description: req.user.email,
    price: req.body.price,
    size: req.body.size
 });
 privateproduct.save(function(err, result) { 
  if(err){
    req.flash('error', 'First Save the Design. View it in Design preview then only click Add to Home');
    res.redirect('/customize');
  }
  else{
    req.flash('success', 'Successfully Added the Tshirt to Cart.');
    console.log(privateproduct.id);
  res.redirect('/add-to-cart/' + privateproduct.id);
  }
 
}); 
  
});

router.get('/about', function (req, res, next) {
    var successmsg = req.flash('success')[0]
  res.render('about', {abclicked: true, successMsg : successmsg, noMessages : !successmsg});
});

router.post('/message', function (req, res, next) {
    
    var message = new Message({
        name: req.body.name,
        email: req.body.email,
        company: req.body.company,
        phone: req.body.phone,
        message: req.body.message
    });
    message.save(function (err, result) {
        req.flash('success', 'Message Successfully Sent.');
        res.redirect('/about');
    });

    var mailmessage = `
    <p>You got a New Message from a User.</p>
    <h3>Message And Contact Details</h3>
    <ul>
        <li>Name : ${req.body.name}</li>
        <li>Email : ${req.body.email}</li>
        <li>Company : ${req.body.company}</li>
        <li>Phone : ${req.body.phone}</li>
    </ul>
    <h3> Message </h3>
    <h4>${req.body.message}</h4>
    `;

//     let transporter = nodemailer.createTransport({
//         host: 'smtp.gmail.com',
//         port: 465,
//         secure: true,
//         auth: {
//             user: 'printedtshirtdesigner@gmail.com',
//             pass: 'printedtshirt'
//         },
//          tls: {
            
//             rejectUnauthorized: false
//         }
//     });

//     //transporter.use('compile', hbs(options));
//     // send mail with defined transport object
//      transporter.sendMail({
//         from: '"Printed Tshirt Designer" <printedtshirtdesigner@gmail.com>', // sender address
//          to: "printedtshirtdesigner@gmail.com", // list of receivers
        
//          subject: "New Message From Customer", // Subject line
//         html: mailmessage, // html body
//     });
 
 });

function isLoggedIn(req,res,next){
  if (req.isAuthenticated()) {
  return next();
  }
  req.session.oldUrl = req.url;
  res.redirect('/user/singin');
}


module.exports = router;


