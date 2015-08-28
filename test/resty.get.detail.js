// Require example for tests.
var express = require('express');
var app = module.exports = express();
var request = require('supertest');

var resty = require('../lib');

describe('GET detail route', function() {
    "use strict";

    var userEntity = {
        id: 1,
        name: "Dave"
    };

    before(function() {
        var users = new resty.resource('users');

        users.getDetails(function(req, res, next) {
            res.json(userEntity);
            next();
        });

        app.use('/api', users.register());
    });

    it('Should return a response with a user object', function(done) {
        request(app)
            .get('/api/user/1')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(userEntity)
            .end(done);
    });

});