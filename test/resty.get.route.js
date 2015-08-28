// Require example for tests.
var express = require('express');
var app = express();
var request = require('supertest');

var resty = require('../lib');

describe('GET custom route with middleware', function() {
    "use strict";

    var totalObject = {
        total: 212
    };

    before(function() {
        var users = new resty.resource('users');

        users.route('count', 'get',
            function (req, res, next) {
                res.send(totalObject);
            }
        );

        app.use('/api', users.register());
    });

    it('Should return a response with an object containing total property', function(done) {
        request(app)
            .get('/api/users/count')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(totalObject)
            .end(done);
    });

});

describe('GET custom route with options', function() {
    "use strict";

    var totalObject = {
        total: 212
    };

    before(function() {
        var users = new resty.resource('users');

        users.route('count', 'get', {
            handler: function (req, res, next) {
                res.send(totalObject);
            }
        });

        app.use('/api', users.register());
    });

    it('Should return a response with an object containing total property', function(done) {
        request(app)
            .get('/api/users/count')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(totalObject)
            .end(done);
    });

});

describe('GET custom route with detail', function() {
    "use strict";

    var totalObject = {
        total: 212
    };

    before(function() {
        var users = new resty.resource('users');

        users.route('count', 'get', {
            detail: true,
            handler: function (req, res, next) {
                res.send(totalObject);
            }
        });

        app.use('/api', users.register());
    });

    it('Should return a response with an object containing total property', function(done) {
        request(app)
            .get('/api/user/1/count')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(totalObject)
            .end(done);
    });

});