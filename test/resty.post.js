var request = require('supertest');

var express = require('express');
var bodyParser = require('body-parser');

var app = module.exports = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var resty = require('../lib');

describe('POST entity route', function() {
    "use strict";

    before(function() {
        var users = new resty.resource('users');
        users.post(function(req, res, next) {
            res.status(201).json({
                "id": 1,
                "name": req.body.name
            });
        });

        app.use('/api', users.register());
    });

    it('Should return a response with 201 http code with an object', function(done) {
        request(app)
            .post('/api/users')
            .send({ "name": "Dave" })
            .expect('Content-Type', /json/)
            .expect(201)
            .expect({
                "id": 1,
                "name": "Dave"
            })
            .end(done);
    });

});