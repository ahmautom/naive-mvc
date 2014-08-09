NaiveMVC
=========

Simple MVC middleware for express. Inspired by .NET MVC framework.

Install
=======

```shell
$ npm install naive-mvc
```

Simple Usage
============

```javascript
var express = require('express');
var naivemvc = require('naive-mvc')(express);

var app = express();
app.use(naivemvc()); // Then use as middleware
```

Project Structure
================

Let's assume you have the following project layout

```
|-- areas
|   |-- api_v1
|   |   |-- controllers
|   |   |   |-- values.js
|   |   |-- index.js
|-- controllers
|   |-- index.js
|   |-- account.js
|-- views
|   |-- index
|   |   |-- index.html
|   |-- account
|   |   |-- login.html
|   |   |-- login_success.html
|-- app.js
```

Controller
==========

```javascript
// controllers/index.js

module.exports = function(router) {
    // GET /
    router.get('/', function(req, res, next) {
        res.render('index', {data: 'Hello World!'}); // no need to specify path of the view file
    });
};
```

```javascript
// controllers/account.js

module.exports = function(router) {
    // GET /account/login
    router.get('/login', function(req, res, next) {
        res.render('login');
    });

    // POST /account/login
    router.post('/login', function(req, res, next) {
        // TODO: Verify login credentials
        res.render('login_success');
    });
};
```

Area
====

To register an area, do the following

```javascript
// areas/api_v1/index.js

var naivemvc = require('naive-mvc');

module.exports = function(router) {
    router.use('/api/v1', naivemvc({basePath: __dirname}); // You must supply basePath here
};
```

```javascript
// areas/api_v1/controllers/values.js

module.exports = function(router) {
    // GET /api/v1/values
    router.get('/', function(req, res, next) {
        res.jsonp(['value1', 'value2']);
    });
};
```

* Note: You must supply `basePath` options when registering an area *

API
===

naivemvc([options], [callback])
-------------------------------

Shorthand method for calling `naivemvc.registerAllControllers` and `naivemvc.registerAllAreas` together.

```javascript
app.use(naivemvc());
```

### Return

Express.Router

### Options

- `basePath` {String} (default: path.dirname(require.main.filename)): base path for controller, view and area directories
- `controllerPath` {String} (default: basePath + '/contollers'): directory that hold controller files
- `viewPath` {String} (default: basePath + '/views'): directory that hold view files
- `areaPath` {String} (default: basePath + '/areas'): directory that hold areas
- `viewEngine` {String} (default: 'jade'): view engine
- `defaultDocument` {String} (default: 'index'): default name of index file
- `params` {Array<String>}: Parameters that passed to every controllers

#### A note on using * params *

If you specific params in options, they are passed to every controller

Examples

```javascript
// app.js

var db = require('db');

app.use(naivemvc({
    params: [db]
}));
```

```javascript
// controllers/account.js

module.exports = function(router, db) {
    // GET /account/id
    router.post('/:id', function(req, res, next) {
        db.users.findOne({_id: req.param.id}, function(err, user){
            if (user) {
                res.render('user', {user: user});
            } else {
                res.render('not_found');
            }
        });
    });
};
```

naivemvc.registerAllControllers([options], [callback])
------------------------------------------------------

Scan `controllers` directory and register all controllers

```javascript
app.use(naivemvc.registerAllControllers());
```

### Return

Express.Router

### Options (see `naivemvc()`)

- `basePath`
- `controllerPath`
- `viewPath`
- `viewEngine`
- `defaultDocument`
- `params`

naivemvc.registerAllAreas([options], [callback])
------------------------------------------------------

Scan `areas` directory and register all areas

```javascript
app.use(naivemvc.registerAllAreas());
```

### Return

Express Application

### Options (see `naivemvc()`)

- `basePath`
- `areaPath`
- `params`

License 
=======

[MIT](LICENSE)