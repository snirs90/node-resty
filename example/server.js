'use strict';

var port  	 = process.env.NODE_PORT || 8800;

var express = require('express');
var app = express();

var resty = require('../lib');

var users = new resty.resource('users');
users.get(function(req, res, next) {
    res.json({message: 'Get list of users'});
    next();
});

users.before('get', function(req, res, next) {
    console.log('I am before');
    next();
});

users.after('get', function(req, res, next) {
    console.log('I am after');
    next();
});

users.route('count', 'get', function(req, res, next) {
    res.send({message: 'This is a users count route'});
    next();
});

users
    .before('count', {
        handler: function(req, res, next) {
            console.log('before users count');
            next();
        }
    })
    .after('count', {
        handler: function(req, res, next) {
            console.log('after users count');
             next();
        }
    });


users.route('count', 'get', {
    detail: true,
    handler: function (req, res, next) {
        res.send({message: 'This is a user count route with the id: ' + req.params.id});
        next();
    }
});

users.getDetails(function(req, res, next) {
    var id = req.params.id;
    res.send({message: 'Get specific user = ' + id});
    next();
});



users.before('get', {
    detail: true,
    handler: function(req, res, next) {
        console.log('I am before details');
        next();
    }
});

users.after('get', {
    detail: true,
    handler: function(req, res, next) {
        console.log('I am after details');
        next();
    }
});

users.post(function(req, res, next) {
   res.send({message: 'This is a user post'});
    next();
});

users.before('post', function(req, res, next) {
    console.log('This is a user post before');
    next();
});

users.after('post', function(req, res, next) {
    console.log('This is a user post after');
    next();
});

app.use('/api', users.register());
//
//app.use(function(req, res, next) {
//    res.status(404).send({ message: 'Sorry cant find that!' });
//});

var server = app.listen(port, function () {
    console.log('Server app listening at port %s', port);
});