'use strict';

var express = require('express');
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

var resty = function(resourceName) {
    var _self = this;

    /**
     * Holds the express router object.
     */
    var _router = express.Router();;

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

    /**
     * Defines the middleware levels.
     *
     * @type {*[]}
     * @private
     */
    var _middlewareLevels = [MIDDLEWARE.MAIN, MIDDLEWARE.BEFORE, MIDDLEWARE.AFTER];

    var _resourcePath = '/' + _getResourceName();

    /**
     * Defines the routes.
     * @type []
     * @private
     */
    var _routes = [];

    /*
     * PUBLIC FUNCTIONS.
     */

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
     * @returns {resty}
     */
    _self.patch = function(middleware) {
        var path = _getResourcePath() + '/:id';

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
    _self.put = function(middleware) {
        var path = _getResourcePath() + '/:id';

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
    _self.delete = function(middleware) {
        var path = _getResourcePath() + '/:id';

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
        var path = _getResourcePath() + '/:id';

        _setRoutes(path, METHOD.GET, middleware, MIDDLEWARE.MAIN);

        return _self;
    };

    /**
     * Sets a "before" middleware.
     *
     * @param {string} path
     * @param {*} options
     *  Express middleware || {middleware: function(req, res, next), detail: bool }
     * @returns {resty}
     */
    _self.before = function(path, options) {
        var routePath;
        var httpMethod = METHOD.GET;
        var middleware;

        if (_isHttpMethodAllowed(path)) {
            // Path is actually an http method.
            httpMethod = path;
            routePath = _getResourcePath();
        }
        else {
            // Path is suffix path for the resource.
            routePath = _getResourcePath() + '/' + path;
        }

        if (typeof options === "function") {
            middleware = options;
        }
        else {
            middleware = options.handler || function(req, res, next) { next(); };
            httpMethod = options.method || httpMethod;
            if (options.detail) {
                routePath = _getResourcePath() + '/:id';
                if (path && !_isHttpMethodAllowed(path)) {
                    // Add extra path if passed.
                    routePath += '/' + path;
                }
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
     *  Express middleware || {middleware: function(req, res, next), detail: bool }
     * @returns {resty}
     */
    _self.after = function(path, options) {
        var routePath;
        var httpMethod = METHOD.GET;
        var middleware;

        if (_isHttpMethodAllowed(path)) {
            // Path is actually an http method.
            httpMethod = path;
            routePath = _getResourcePath();
        }
        else {
            // Path is suffix path for the resource.
            routePath = _getResourcePath() + '/' + path;
        }

        if (typeof options === "function") {
            middleware = options;
        }
        else {
            middleware = options.handler || function(req, res, next) { next(); };
            httpMethod = options.method || httpMethod;
            if (options.detail) {
                routePath = _getResourcePath() + '/:id';
                if (path && !_isHttpMethodAllowed(path)) {
                    // Add extra path if passed.
                    routePath += '/' + path;
                }
            }
        }

        _setRoutes(routePath, httpMethod, middleware, MIDDLEWARE.AFTER);

        return _self;
    };

    /**
     * Create a new route based on the resource.
     *
     * @param {string}  path
     * @param {string} method
     * @param {*} options
     * @returns {resty}
     */
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
            var isDetails = options.detail;
            middleware = options.handler;

            if (isDetails) {
                routePath = _getResourcePath() + '/:id/' + path;
            }
        }

        _setRoutes(routePath, method, middleware, MIDDLEWARE.MAIN);

        return _self;
    };


    /*
     * PRIVATE FUNCTIONS
     */

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
        return _.findIndex(_routes, function(route) {
            return route.path == path && route.method == method;
        });
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
        var routeIndex = _getRoutePathMethod(path, method);
        var route,
            isNew = false;

        if (routeIndex === -1) {
            // Route doesn't exists;
            isNew = true;

            route = {
                path: path,
                method: method,
                main: function (req, res, next) { next(); },
                before: [],
                after: []
            };
        }
        else {
            route = _routes[routeIndex];
        }

        switch(level) {
            case MIDDLEWARE.BEFORE:
            case MIDDLEWARE.AFTER:
                route[level].push(middleware);
                break;
            case MIDDLEWARE.MAIN:
                route[level] = middleware;
                break;
        }

        if (isNew) {
            _routes.push(route);
        }
    };

    /**
     * Registers the resource routes.
     *
     * @returns {*}
     */
    _self.register = function() {

        _.forEach(_routes, function(routeSettings) {
            var routeMiddlewares = _createRouteMiddlewares(routeSettings.main, routeSettings.before, routeSettings.after);

            _router[routeSettings.method](routeSettings.path, routeMiddlewares);
        });

        return _router;
    };

    _self.debug = function() {
        return _routes;
    };


    /**
     * Create the route middleware(s).
     *
     * @param main
     * @param before
     * @param after
     * @returns {Array}
     * @private
     */
    function _createRouteMiddlewares(main, before, after) {
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
     * Check if an http method is allowed.
     * @param method
     * @returns {boolean}
     * @private
     */
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
};

module.exports = resty;