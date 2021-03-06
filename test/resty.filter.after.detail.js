// Require example for tests.
var express = require('express');
var app = module.exports = express();
var request = require('supertest');

var chai = require('chai');
var expect = chai.expect;

var resty = require('../lib');

describe('after detail filter', function() {
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
        users.route('after', 'get', {
            detail: true,
            handler: function(req, res, next) {
                usersList[0].name = "Bob";
                next();
            }
        });

        users.after('after', {
            detail: true,
            handler: function(req, res, next) {
                res.json(usersList);
            }
        });

        app.use('/api', users.register());
    });

    it('Should response with list of users with Bob in the first user', function(done) {
        request(app)
            .get('/api/users/1/after')
            .expect('Content-Type', /json/)
            .expect(200)
            .expect(function(res) {
                var body = res.body;
                expect(body[0].name).to.equal('Bob');
            })
            .end(done);
    });

});