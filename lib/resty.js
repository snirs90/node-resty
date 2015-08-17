'use strict';

var express = require('express');
var _expressRouter = express.Router();

var inflector = require('inflector');

var _ = require('lodash');

var METHOD = {
    GET: 'get',
    POST: 'post',
    PATCH: 'patch',
    PUT: 'put',
    DELETE: 'delete'
};

var MIDDLEWARE = {
    MAIN: 'main',
    BEFORE: 'before',
    AFTER: 'after'
};

var HTTP_METHODS = [METHOD.GET, METHOD.POST, METHOD.PATCH, METHOD.PUT, METHOD.DELETE];

var resty = function(resourceName) {
    var _self = this;

    /**
     * Holds the express router object.
     */
    var _router = _expressRouter;

    /**
     * Define the resourceName.
     */
    var _resourceName = resourceName;

    /**
     * Defines the allowed http methods.
     * @type {*[]}
     * @private
     */
    var _allowedHttpMethods = [METHOD.GET, METHOD.POST, METHOD.PATCH, METHOD.PUT, METHOD.DELETE];

    var _resourcePath = '/' + _getResourceName();

    /**
     * Defines the middleware levels.
     *
     * @type {*[]}
     * @private
     */
    var _middlewareLevels = [MIDDLEWARE.MAIN, MIDDLEWARE.BEFORE, MIDDLEWARE.AFTER];

    /**
     * Defines the routes.
     * @type {{}}
     * @private
     */
    var _routes = {};

    var __construct = function() {
    }();

    /**
     * Check if the middleware-level is valid.
     *
     * @param {string} level
     * @returns {boolean}
     * @private
     */
    var _isValidMiddlewareLevel = function(level) {
        return _middlewareLevels.indexOf(level) !== -1;
    };

    /**
     * Returns an object of the routes with the path and method.
     * It creates the nested object if not exists.
     *
     * @param {string} path
     * @param {string} method
     * @returns {*}
     * @private
     */
    var _getRoutePathMethod = function(path, method) {
        if (!_routes[path]) {
            _routes[path] = {};
            _routes[path][method] = {};
        }
        else if (!_routes[path][method]) {
            _routes[path][method] = {};
        }

        return _routes[path][method];
    };

    /**
     * Set the route middleware by middleware-level.
     * @param {string} path
     * @param {method} method
     * @param {function} middleware
     * @param {string} level
     * @private
     */
    var _setRouteMiddleware = function(path, method, middleware, level) {
        var routeMiddleware = _getRoutePathMethod(path, method);

        switch(level) {
            case MIDDLEWARE.BEFORE:
            case MIDDLEWARE.AFTER:
                if (!_.isArray(routeMiddleware[level])) {
                    _routes[path][method][level] = [];
                }

                _routes[path][method][level].push(middleware);
                break;
            case MIDDLEWARE.MAIN:
                _routes[path][method][level] = middleware;
                break;
        }
    };

    /**
     * Create the route middleware(s).
     *
     * @param path
     * @param method
     * @returns {Array}
     * @private
     */
    function _createRouteMiddlewares(path, method) {
        var main = _routes[path][method][MIDDLEWARE.MAIN];
        var before = _routes[path][method][MIDDLEWARE.BEFORE];
        var after = _routes[path][method][MIDDLEWARE.AFTER];

        var middlewares = [];

        if (_.isArray(before) && before.length) {
            middlewares = middlewares.concat(before);
        }

        middlewares.push(main);

        if (_.isArray(after) && after.length) {
            middlewares = middlewares.concat(after);
        }

        return middlewares;
    }

    /**
     * Sets the routes.
     *
     * @param {string} path
     * @param {string} method
     * @param {function} middleware
     * @param {string} level
     * @private
     */
    var _setRoutes = function(path, method, middleware, level) {
        if (!level) {
            level = MIDDLEWARE.MAIN;
        }

        if (!_isHttpMethodAllowed(method)) {
            throw new Error('Resty: ' + _getResourceName() + ', the method "' + method.toUpperCase() + '" is not allowed.');
        }

        if (!_isValidMiddlewareLevel(level)) {
            throw new Error('Resty: ' + method.toUpperCase() + ': ' + _getResourceName() + '/' + path + ', invalid middleware\'s level.');
        }

        _setRouteMiddleware(path, method, middleware, level);
    };

    /**
     * Registers the resource routes.
     *
     * @returns {*}
     */
    _self.register = function() {

        _.forEach(_routes, function(routeSettings, path) {
            _.forEach(routeSettings, function(middlewares, method) {
                var routeArguments = _createRouteMiddlewares(path, method);

                _router[method](path, routeArguments);
            })
        });

        return _router;
    };

    /**
     * Create a GET route with the model name.
     *
     * @param {function(req, res, next)} middleware
     * @returns {resty}
     */
    _self.get = function(middleware) {
        var path = _getResourcePath();

        _setRoutes(path, METHOD.GET, middleware, MIDDLEWARE.MAIN);

        return _self;
    };

    /**
     * Create a POST route with the model name.
     *
     * @param {function(req, res, next)} middleware
     * @returns {resty}
     */
    _self.post = function(middleware) {
        var path = _getResourcePath();

        _setRoutes(path, METHOD.POST, middleware, MIDDLEWARE.MAIN);

        return _self;
    };

    /**
     * Create a PATCH route with the model name.
     *
     * @param {function(req, res, next)} middleware
     * @param {} options
     * @returns {resty}
     */
    _self.patch = function(middleware, options) {
        var path = _getResourcePath();

        if (options && options.details) {
            path = _getSingularResourcePath() + '/:id';
        }

        _setRoutes(path, METHOD.PATCH, middleware, MIDDLEWARE.MAIN);

        return _self;
    };

    /**
     * Create a PUT route with the model name.
     *
     * @param {function(req, res, next)} middleware
     * @param {} options
     * @returns {resty}
     */
    _self.put = function(middleware, options) {
        var path = _getResourcePath();

        if (options && options.details) {
            path = _getSingularResourcePath() + '/:id';
        }

        _setRoutes(path, METHOD.PUT, middleware, MIDDLEWARE.MAIN);

        return _self;
    };

    /**
     * Create a DELETE route with the model name.
     *
     * @param {function(req, res, next)} middleware
     * @param {} options
     * @returns {resty}
     */
    _self.delete = function(middleware, options) {
        var path = _getResourcePath();

        if (options && options.details) {
            path = _getSingularResourcePath() + '/:id';
        }

        _setRoutes(path, METHOD.DELETE, middleware, MIDDLEWARE.MAIN);

        return _self;
    };

    /**
     * Create a get route with an id of the model name.
     *
     * @param {function(req, res, next)} middleware
     * @returns {resty}
     */
    _self.getDetails = function(middleware) {
        var path = _getSingularResourcePath() + '/:id';

        _setRoutes(path, METHOD.GET, middleware, MIDDLEWARE.MAIN);

        return _self;
    };

    /**
     * Sets a "before" middleware.
     *
     * @param {string} path
     * @param {*} options
     *  Express middleware || {middleware: function(req, res, next), details: bool }
     * @returns {resty}
     */
    _self.before = function(path, options) {
        var routePath = _getResourcePath();
        var httpMethod = METHOD.GET;
        var middleware;

        if (HTTP_METHODS.indexOf(path) !== -1) {
            // Path is actually an http method.
            httpMethod = path;
        }
        else {
            // Path is suffix path for the resource.
            routePath += '/' + path;
        }

        if (typeof options === "function") {
            middleware = options;
        }
        else {
            middleware = options.handler || function(req, res, next) { next() };
            httpMethod = options.method || httpMethod;
            if (options.details) {
                routePath = _getSingularResourcePath() + '/:id';
            }
        }

        _setRoutes(routePath, httpMethod, middleware, MIDDLEWARE.BEFORE);

        return _self;
    };

    /**
     * Sets a "after" middleware.
     *
     * @param {string} path
     * @param {*} options
     *  Express middleware || {middleware: function(req, res, next), details: bool }
     * @returns {resty}
     */
    _self.after = function(path, options) {
        var routePath = _getResourcePath();
        var httpMethod = METHOD.GET;
        var middleware;

        if (HTTP_METHODS.indexOf(path) !== -1) {
            // Path is actually an http method.
            httpMethod = path;
        }
        else {
            // Path is suffix path for the resource.
            routePath += '/' + path;
        }

        if (typeof options === "function") {
            middleware = options;
        }
        else {
            middleware = options.handler || function(req, res, next) { next() };
            httpMethod = options.method || httpMethod;
            if (options.details) {
                routePath = _getSingularResourcePath() + '/:id';
            }
        }

        _setRoutes(routePath, httpMethod, middleware, MIDDLEWARE.AFTER);

        return _self;
    };

    _self.route = function(path, method, options) {
        var middleware,
            routePath;

        if (!path) {
            throw new Error('Resty: ' + _getResourceName() + ' no extraPath defined.');
        }

        if (!_isHttpMethodAllowed(method)) {
            throw new Error('Resty: the method ' + method + ' is not allowed. in ' + _getResourceName())
        }

        if (!options) {
            throw new Error('Resty: ' + _getResourceName() + ' no options defined.');
        }

        routePath = _getResourcePath() + '/' + path;

        if (typeof options === "function") {
            middleware = options;
        }
        else {
            var isDetails = options.details;
            middleware = options.handler;

            if (isDetails) {
                routePath = _getSingularResourcePath() + '/:id/' + path;
            }
        }

        _setRoutes(routePath, method, middleware, MIDDLEWARE.MAIN);

        return _self;
    };

    function _isHttpMethodAllowed(method) {
        return _allowedHttpMethods.indexOf(method) !== -1;
    }

    /**
     * Get the resource name.
     * @returns {*}
     * @private
     */
    function _getResourceName() {
        return _resourceName;
    }

    /**
     * Get the resource base path.
     *
     * @returns {string}
     * @private
     */
    function _getResourcePath() {
        return _resourcePath;
    }

    /**
     * Get the singular resource name.
     * @private
     */
    function _getSingularResourceName() {
        return _getResourceName().singular();
    }

    /**
     * Get the singular resource path.
     * @private
     */
    function _getSingularResourcePath() {
        return _resourcePath.singular();
    }

};

module.exports = resty;