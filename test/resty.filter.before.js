// Require example for tests.
var express = require('express');
var app = module.exports = express();
var request = require('supertest');

var chai = require('chai');
var expect = chai.expect;

var resty = require('../lib');

describe('before filter', function() {
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

    before(function() {
        var users = new resty.resource('users');
        users.route('before', 'get', function(req, res, next) {
            res.json(usersList);
        });

        users.before('before', function(req, res, next) {
            usersList[0].name = "Bob";
            next();
        });

        app.use('/api', users.register());
    });

    it('Should response with an list of users with Bob in the first user', function(done) {
        request(app)
            .get('/api/users/before')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(function(res) {
                var body = res.body;
                expect(body[0].name).to.not.equal('Dave');
            })
            .end(done);
    });

});