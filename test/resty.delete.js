var request = require('supertest');

var express = require('express');
var bodyParser = require('body-parser');

var app = module.exports = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var resty = require('../lib');

describe('DELETE entity route', function() {
    "use strict";

    var user = 'John';

    before(function() {
        var users = new resty.resource('users');
        users.delete(function(req, res, next) {
            res.status(200).send({ username: user });
        })
        .before('delete', function(req, res, next) {
            user = 'Dave';
            next();
        });

        app.use('/api', users.register());
    });

    it('Should return a response with 200 http code and json with username Dave', function(done) {
        request(app)
            .delete('/api/users/1')
            .expect(200)
            .expect({ username: 'Dave' })
            .end(done);
    });

});