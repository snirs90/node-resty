node-resty
============

Create RESTful APIs using express.

Supports the Restangular standard.

# Getting started

require node-resty with:

```
var resty = require('./node-resty');
```

## Creating a new resource:

```
var users = new resty.resource('users');
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
users.get(function(req, res, next) {
    res.json({message: 'Get list of users'});
});
```

Which defines the path: `/users`

** patch/put/delete methods defines the routes for a single entity. **
for example:
```
/user/:id
```


```
users.getDetails(function(req, res, next) {
    res.json({message: 'Get list of users'});
});
```

Defines the path: `/user/:X`, where the X is the ID of resource model.
**Please attention that the path here is the singular version of the resource name**

It is also possible to run a custom route based on the resource name as a prefix

```
users.route('count', 'get', function(req, res, next) {
    res.send({message: 'This is a users count route'});
    next();
});
```

This defines the path: `/users/count`

You can also pass an object to the third argument instead of a function to set the route
with a `detail` prefix route.

for example:

```
users.route('count', 'get', {
    detail: true,
    handler: function(req, res, next) {
                 res.send({message: 'This is a users count route'});
                 next();
             }
}
});
```

This will define the route: GET `/user/1/count`.

## Supported filters:
 
- before
- after

Filters are used to add middleware handlers before or after the main middleware-handler
This is good for validations of the params that a client sends or validate that user is authenticated.

In order to make the `after` filter work you must call the `next()` method on the main middleware handler.

### Example:

```
users.before('get', function(req, res, next) {
    console.log('before users count');
    next();
});
```

OR

```
users.before('get', {
    handler: function(req, res, next) {
        console.log('before users count');
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

If you'll specify a path like `count` it will attach it to the route `/users/count`

You can also pass as a second param inside the object (as in example 2) a property
named "detail" sets to `true` to specify the filter on a detail route.

### Example:

```
users.before('count', {
    detail: true,
    handler: function(req, res, next) {
        console.log('before users count');
        next();
    }
})
```

Which will define a `before` filter to the route: `/user/1/count`.


# Registering the resource to the application

In order to register the resource to the application and make the routes work
all you need to add is:

```
app.use(users.register());
```

If you want to add the resource routes under a prefix route it is possible by doing:

```
app.use('/api', users.register());
```

This will register the routes under `/api` prefix, for example:

```
/api/users
/api/user/1
/api/users/count
```

Inspiration from: https://github.com/baugarten/node-restful
