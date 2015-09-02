// Require example for tests.
var express = require('express');
var app = express();
var request = require('supertest');

var resty = require('../lib');

describe('GET route', function() {
    "use strict";

    var usersList = [
        {
            "id": 1,
            "name": "Dave"
        },
        {
            "id": 2,
            "name": "John"
        }
    ];

    before(function(done) {
        var users = new resty.resource('users');
        users.get(function(req, res, next) {
            res.json(usersList);
        });

        app.use('/api', users.register());

        done();
    });

    it('Should return a response with an array of users', function(done) {
        request(app)
            .get('/api/users')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(usersList)
            .end(done);
    });

});