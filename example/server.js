'use strict';

var port  	 = process.env.NODE_PORT || 8800;

var express = require('express');
var app = express();

var resty = require('./node-resty');

var cars = new resty.resource('cars');
cars.get(function(req, res, next) {
    res.json({message: 'Get list of cars'});
    next();
});

cars.before('get', function(req, res, next) {
    console.log('I am before');
    next();
});

cars.after('get', function(req, res, next) {
    console.log('I am after');
    next();
});

cars.route('count', 'get', function(req, res, next) {
    res.send({message: 'This is a cars count route'});
    next();
});

cars.before('count', {
    handler: function(req, res, next) {
        console.log('before cars count');
        next();
    }
})
    .after('count', {
        handler: function(req, res, next) {
            console.log('after cars count');
             next();
        }
    });

cars.getDetails(function(req, res, next) {
    var id = req.params.id;
    res.json({message: 'Get specific car = ' + id});
    next();
});



cars.before('get', {
    details: true,
    handler: function(req, res, next) {
        console.log('I am before details');
        next();
    }
});

cars.after('get', {
    details: true,
    handler: function(req, res, next) {
        console.log('I am after details');
        next();
    }
});

cars.post(function(req, res, next) {
   res.send({message: 'This is a cars post'});
    next();
});

cars.before('post', function(req, res, next) {
    console.log('This is a cars post before');
    next();
});

cars.after('post', function(req, res, next) {
    console.log('This is a cars post after');
    next();
});


app.use('/api', cars.register());
//
//app.use(function(req, res, next) {
//    res.status(404).send({ message: 'Sorry cant find that!' });
//});

var server = app.listen(port, function () {
    console.log('Server app listening at port %s', port);
});