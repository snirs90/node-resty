var request = require('supertest');

var express = require('express');
var bodyParser = require('body-parser');

var app = module.exports = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var resty = require('../lib');

describe('PUT entity route', function() {
    "use strict";

    before(function() {
        var users = new resty.resource('users');
        users.put(function(req, res, next) {
            var userEntity = {
                id: req.params.id,
                name: req.body.name
            };
            res.status(200).json(userEntity);
        });

        app.use('/api', users.register());
    });

    it('Should return a response with 200 http code with an object', function(done) {
        request(app)
            .put('/api/user/1')
            .send({ "name": "John" })
            .expect('Content-Type', /json/)
            .expect(200)
            .expect({
                id: 1,
                name: "John"
            })
            .end(done);
    });

});