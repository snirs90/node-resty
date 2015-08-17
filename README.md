node-resty
============

Create RESTful APIs using express.

Supports the restful & Restangular standards.

# Getting started

require node-resty with:

```
var resty = require('./node-resty');
```

## Creating a new resource:

```
var cars = new resty.resource('cars');
```

A best practice is to define the resource name in pluralize.

## API

There are few functions that available after creating a new resource instance.

- get
- getDetails
- post
- patch
- put
- delete

All methods are excepting one parameter which is the middleware handler.


### Example:

```
cars.get(function(req, res, next) {
    res.json({message: 'Get list of cars'});
});
```

Which defines the path: `/cars`

```
cars.getDetails(function(req, res, next) {
    res.json({message: 'Get list of cars'});
});
```

Defines the path: `/car/X`, where the X is the ID of resource model.
**Please attention that the path here is the singular version of the resource name**

It is also possible to run a custom route based on the resource name as a prefix

```
cars.route('count', 'get', function(req, res, next) {
    res.send({message: 'This is a cars count route'});
    next();
});
```

This defined the path: `/cars/count`

## Supported filters:
 
- before
- after

Filters are used to add middleware handlers before or after the main middleware-handler
This is good for validations of the params that a client sends or validate that user is authenticated.

In order to make the `after` filter work you must call the `next()` method on the main middleware handler.

### Example:

```
cars.before('get', {
    handler: function(req, res, next) {
        console.log('before cars count');
        next();
    }
})
```

Do no forget the `next();` at the end of the middleware so it will jump to the next middleware.

The first param is the path of the route you want to attach the filter to.
There is "magic" keywords to help us to simplify the process.

The keywords are:

* get
* post
* patch
* put
* delete

When you specify each of those keywords it will bind the filter to the main HTTP METHOD
by the keyword name.

If you'll specify a path like `count` it will attach it to the route `/cars/count`

# Registering the resource to the application

In order to register the resource to the application and make the routes work
all you need to add is:

```
app.use(cars.register());
```

If you want to add the resource routes under a prefix route it is possible by doing:

```
app.use('/api', cars.register());
```

This will register the routes under `/api` prefix, for example:

```
/api/cars
/api/car/1
/api/cars/count
```

Inspiration from: https://github.com/baugarten/node-restful