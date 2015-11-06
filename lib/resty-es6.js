'use strict';

var express = require('express');
var _       = require('lodash');

var HTTP_METHODS = {
    GET: 'get',
    POST: 'post',
    PATCH: 'patch',
    PUT: 'put',
    DELETE: 'delete'
};

var ALLOWED_HTTP_METHODS = [
    HTTP_METHODS.GET,
    HTTP_METHODS.POST,
    HTTP_METHODS.PATCH,
    HTTP_METHODS.PUT,
    HTTP_METHODS.DELETE
];

var ENTITY_HTTP_METHODS = [HTTP_METHODS.PATCH, HTTP_METHODS.PUT, HTTP_METHODS.DELETE];

var MIDDLEWARE_TYPES = {
    MAIN: 'main',
    BEFORE: 'before',
    AFTER: 'after'
};

var EMPTY_MIDDLEWARE_FUNC = function (req, res, next) { next(); };

class resty {

    /**
     * @constructor
     * @param resourceName
     */
    constructor(resourceName) {
        this._router = express.Router();
        this._resourceName = resourceName;
        this._resourcePath = '/' + this._resourceName;
        this._routes = [];
    }

    /**
     * Create a GET route with the model name.
     *
     * @param {function(req, res, next)} middleware
     * @returns {resty}
     */
    get(middleware) {
        var path = this._resourcePath;

        this._setRoutes(path, HTTP_METHODS.GET, middleware, MIDDLEWARE_TYPES.MAIN);

        return this;
    }

    /**
     * Create a POST route with the model name.
     *
     * @param {function(req, res, next)} middleware
     * @returns {resty}
     */
    post(middleware) {
        var path = this._resourcePath;

        this._setRoutes(path, HTTP_METHODS.POST, middleware, MIDDLEWARE_TYPES.MAIN);

        return this;
    };

    /**
     * Create a PATCH route with the model name.
     *
     * @param {function(req, res, next)} middleware
     * @returns {resty}
     */
    patch(middleware) {
        var path = this._resourcePath + '/:id';

        this._setRoutes(path, HTTP_METHODS.PATCH, middleware, MIDDLEWARE_TYPES.MAIN);

        return this;
    };

    /**
     * Create a PUT route with the model name.
     *
     * @param {function(req, res, next)} middleware
     * @returns {resty}
     */
    put(middleware) {
        var path = this._resourcePath + '/:id';

        this._setRoutes(path, HTTP_METHODS.PUT, middleware, MIDDLEWARE_TYPES.MAIN);

        return this;
    };

    /**
     * Create a DELETE route with the model name.
     *
     * @param {function(req, res, next)} middleware
     * @returns {resty}
     */
    delete(middleware) {
        var path = this._resourcePath + '/:id';

        this._setRoutes(path, HTTP_METHODS.DELETE, middleware, MIDDLEWARE_TYPES.MAIN);

        return this;
    };


    /**
     * Create a get route with an id of the model name.
     *
     * @param {function(req, res, next)} middleware
     * @returns {resty}
     */
    getDetails(middleware) {
        var path = this._resourcePath + '/:id';

        this._setRoutes(path, HTTP_METHODS.GET, middleware, MIDDLEWARE_TYPES.MAIN);

        return this;
    };

    /**
     * Sets a "before" middleware.
     *
     * @param {string} path
     * @param {*} options
     *  Express middleware || {middleware: function(req, res, next), detail: bool }
     * @returns {resty}
     */
     before(path, options) {
        var routePath;
        var httpMethod = HTTP_METHODS.GET;
        var middleware;

        if (resty._isHttpMethodAllowed(path)) {
            // Path is actually an http method.
            httpMethod = path;
            routePath = this._resourcePath
        }
        else {
            // Path is suffix path for the resource.
            routePath = this._resourcePath + '/' + path;
        }

        if (typeof options === "function") {
            middleware = options;

            if (resty._isEntityHttpMethod(path)) {
                routePath += '/:id';
            }
        }
        else {
            middleware = options.handler || EMPTY_MIDDLEWARE_FUNC;
            httpMethod = options.method || httpMethod;
            if (options.detail) {
                routePath = this._resourcePath + '/:id';
                if (path && !resty._isHttpMethodAllowed(path)) {
                    // Add extra path if passed.
                    routePath += '/' + path;
                }
            }
        }

        this._setRoutes(routePath, httpMethod, middleware, MIDDLEWARE_TYPES.BEFORE);

        return this;
    };

    /**
     * Sets a "after" middleware.
     *
     * @param {string} path
     * @param {*} options
     *  Express middleware || {middleware: function(req, res, next), detail: bool }
     * @returns {resty}
     */
    after(path, options) {
        var routePath;
        var httpMethod = HTTP_METHODS.GET;
        var middleware;

        if (resty._isHttpMethodAllowed(path)) {
            // Path is actually an http method.
            httpMethod = path;
            routePath = this._resourcePath
        }
        else {
            // Path is suffix path for the resource.
            routePath = this._resourcePath + '/' + path;
        }

        if (typeof options === "function") {
            middleware = options;

            if (resty._isEntityHttpMethod(path)) {
                routePath += '/:id';
            }
        }
        else {
            middleware = options.handler || EMPTY_MIDDLEWARE_FUNC;
            httpMethod = options.method || httpMethod;
            if (options.detail) {
                routePath = this._resourcePath + '/:id';
                if (path && !resty._isHttpMethodAllowed(path)) {
                    // Add extra path if passed.
                    routePath += '/' + path;
                }
            }
        }

        this._setRoutes(routePath, httpMethod, middleware, MIDDLEWARE_TYPES.AFTER);

        return this;
    };


    /**
     * Create a new route based on the resource.
     *
     * @param {string}  path
     * @param {string} method
     * @param {*} options
     * @returns {resty}
     */
    route(path, method, options) {
        var middleware,
            routePath;

        if (!path) {
            throw new Error('Resty: ' + this._resourceName + ' no extraPath defined.');
        }

        if (!resty._isHttpMethodAllowed(method)) {
            throw new Error('Resty: the method ' + method + ' is not allowed. in ' + this._resourceName)
        }

        if (!options) {
            throw new Error('Resty: ' + this._resourceName + ' no options defined.');
        }

        routePath = this._resourcePath + '/' + path;

        if (typeof options === "function") {
            middleware = options;
        }
        else {
            var isDetails = options.detail;
            middleware = options.handler;

            if (isDetails) {
                routePath = this._resourcePath + '/:id/' + path;
            }
        }

        this._setRoutes(routePath, method, middleware, MIDDLEWARE_TYPES.MAIN);

        return this;
    };

    /**
     * Registers the resource routes.
     *
     * @returns {*}
     */
    register() {
        var self = this;

        _.forEach(this._routes, function(routeSettings) {
            var routeMiddlewares = self._createRouteMiddlewares(routeSettings.main, routeSettings.before, routeSettings.after);
            self._router[routeSettings.method](routeSettings.path, routeMiddlewares);
        });

        return this._router;
    };

    /**
     * Return the defined routes.
     *
     * @returns {Array}
     */
    debug() {
        return this._routes;
    };


    /*
        PRIVATE METHODS
     */

    /**
     * Create the route middleware(s).
     *
     * @param main
     * @param before
     * @param after
     * @returns {Array}
     * @private
     */
    _createRouteMiddlewares(main, before, after) {
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
    _setRoutes(path, method, middleware, level) {
        if (!level) {
            level = MIDDLEWARE_TYPES.MAIN;
        }

        if (!resty._isHttpMethodAllowed(method)) {
            throw new Error('Resty: ' + this._resourceName + ', the method "' + method.toUpperCase() + '" is not allowed.');
        }

        if (!resty._isValidMiddlewareLevel(level)) {
            throw new Error('Resty: ' + method.toUpperCase() + ': ' + this._resourceName + '/' + path + ', invalid middleware\'s level.');
        }

        this._setRouteMiddleware(path, method, middleware, level);
    }

    /**
     * Set the route middleware by middleware-level.
     * @param {string} path
     * @param {string} method
     * @param {function} middleware
     * @param {string} level
     * @private
     */
    _setRouteMiddleware(path, method, middleware, level) {
        var routeIndex = this._getRoutePathMethod(path, method);
        var route,
            isNew = false;

        if (routeIndex === -1) {
            // Route doesn't exists;
            isNew = true;

            route = {
                path: path,
                method: method,
                main: EMPTY_MIDDLEWARE_FUNC,
                before: [],
                after: []
            };
        }
        else {
            route = this._routes[routeIndex];
        }

        switch(level) {
            case MIDDLEWARE_TYPES.BEFORE:
            case MIDDLEWARE_TYPES.AFTER:
                route[level].push(middleware);
                break;
            case MIDDLEWARE_TYPES.MAIN:
                route[level] = middleware;
                break;
        }

        if (isNew) {
            this._routes.push(route);
        }
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
    _getRoutePathMethod(path, method) {
        return _.findIndex(this._routes, function(route) {
            return route.path == path && route.method == method;
        });
    };

    /**
     * Check if an http method is allowed.
     * @param method
     * @returns {boolean}
     * @private
     */
    static _isHttpMethodAllowed(method) {
        return ALLOWED_HTTP_METHODS.indexOf(method) !== -1;
    }

    /**
     * Check if an http method is of entity.
     * @param method
     * @returns {boolean}
     * @private
     */
    static _isEntityHttpMethod(method) {
        return ENTITY_HTTP_METHODS.indexOf(method) !== -1;
    }

    /**
     * Check if the middleware-level is valid.
     *
     * @param {string} level
     * @returns {boolean}
     * @private
     */
    static _isValidMiddlewareLevel(level) {
        return MIDDLEWARE_TYPES.hasOwnProperty(level.toUpperCase());
    };
}


module.exports = resty;