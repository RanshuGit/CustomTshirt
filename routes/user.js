var express = require('express');
var router = express.Router();
var csrf = require("csurf");
const passport = require('passport');

var Order = require('../models/order');
var Cart = require('../models/cart');

var csrfProtection = csrf();
router.use(csrfProtection);

/*Get Account or Profile Page*/
router.get('/profile',isLoggedIn , function(req, res, next){
    var adminemail = 'Admin@admin.com';
    if(adminemail === req.user.email){
        res.redirect('/user/admin');
    }
    Order.find({user : req.user}, function(err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
        });
        res.render('user/profile', {orders: orders});
    });
    
});

/*Get LogOut process*/
router.get('/logout',isLoggedIn, function(req, res, next){
    req.logout();
    res.redirect('/');
});



router.use('/', notLoggedIn, function(req,res,next){
    next();
});

router.get('/singup', function(req, res, next){
    var messages = req.flash('error');
    res.render('user/singup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/singup', passport.authenticate('local.singup', {
    failureRedirect: '/user/singup',
    failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    }
});

router.get('/singin', function(req, res, next){
    var messages = req.flash('error');
    res.render('user/singin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/singin', passport.authenticate('local-singin', {
    failureRedirect: '/user/singin',
    failureFlash: true
}), function(req, res, next) {
    if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
    } else {
        res.redirect('/user/profile');
    }
});

module.exports = router;

function isLoggedIn(req,res,next){
    if (req.isAuthenticated()) {
    return next();
    }
    res.redirect('/');
}

function notLoggedIn(req,res,next){
    if (!req.isAuthenticated()) {
    return next();
    }
    res.redirect('/');
}