var fs = require('fs');
var path = require('path');
var async = require('async');

module.exports = function(express) {
    function naviemvc(options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = undefined;
        }

        var router = getRouter();

        async.parallel([

            function(callback) {
                router.use(naviemvc.registerAllControllers(options, callback));
            },
            function(callback) {
                router.use(naviemvc.registerAllAreas(options, callback));
            }
        ], callback);

        return router;
    }

    naviemvc.registerAllControllers = function(options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = undefined;
        }

        var router = getRouter();

        // Default options
        options = options || {};
        options.basePath = options.basePath || path.dirname(require.main.filename);
        options.controllerPath = options.controllerPath || path.join(options.basePath, 'controllers');
        options.viewPath = options.viewPath || path.join(options.basePath, 'views');
        options.viewEngine = options.viewEngine || 'jade';
        options.defaultDocument = options.defaultDocument || 'index',
        options.params = options.params || [];

        fs.readdir(options.controllerPath, function(err, filenames) {
            if (err) {
                return callback(err);
            }

            async.each(filenames, function(filename, callback) {
                var controllerPath = path.join(options.controllerPath, filename);
                fs.stat(controllerPath, function(err, stats) {
                    if (err) {
                        return callback(err);
                    }

                    if (stats.isFile()) {
                        var app = express();
                        var name = path.basename(filename, path.extname(filename));
                        app.set('views', path.join(options.viewPath, name));
                        app.set('view engine', options.viewEngine);
                        require(controllerPath).apply(null, [app].concat(options.params));

                        if (name === options.defaultDocument) {
                            router.use('/', app);
                        } else {
                            router.use('/' + name, app);
                        }
                    }
                    callback(null);
                });
            }, callback);
        });

        return router;
    };

    naviemvc.registerAllAreas = function(options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = undefined;
        }

        var router = getRouter();

        // Default options
        options = options || {};
        options.basePath = options.basePath || path.dirname(require.main.filename);
        options.areaPath = options.areaPath || path.join(options.basePath, 'areas');
        options.params = options.params || [];

        fs.readdir(options.areaPath, function(err, filenames) {
            if (err) {
                return callback(err);
            }

            async.each(filenames, function(filename, callback) {
                var areaPath = path.join(options.areaPath, filename);
                fs.stat(areaPath, function(err, stats) {
                    if (err) {
                        return callback(err);
                    }

                    if (stats.isDirectory()) {
                        var app = express();
                        require(areaPath).apply(null, [app].concat(options.params));
                        router.use(app);
                    }

                    callback(null);
                });
            }, callback);
        });

        return router;
    };

    return naviemvc;

    function getRouter() {
        // Express 4.x
        if ('function' === typeof express.Router) {
            return express.Router();
        }

        return express();
    }
};