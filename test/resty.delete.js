var request = require('supertest');

var express = require('express');
var bodyParser = require('body-parser');

var app = module.exports = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var resty = require('../lib');

describe('DELETE entity route', function() {
    "use strict";

    before(function() {
        var users = new resty.resource('users');
        users.delete(function(req, res, next) {
            res.status(204).end();
        });

        app.use('/api', users.register());
    });

    it('Should return a response with 204 http code and no content', function(done) {
        request(app)
            .delete('/api/users/1')
            .expect(204)
            .expect('')
            .end(done);
    });

});