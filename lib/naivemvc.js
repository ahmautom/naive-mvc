var fs = require('fs');
var path = require('path');
var async = require('async');

module.exports = function(express) {
    function naviemvc(options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = undefined;
        }

        var router = express.Router();

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

        var router = express.Router();

        // Default options
        options = options || {};
        options.basePath = options.basePath || path.dirname(require.main.filename);
        options.controllerPath = options.controllerPath || path.join(options.basePath, 'controllers');
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
                        var controllerRouter = express.Router();
                        var name = path.basename(filename, path.extname(filename));
                        require(controllerPath).apply(null, [controllerRouter].concat(options.params));

                        if (name === options.defaultDocument) {
                            router.use('/', controllerRouter);
                        } else {
                            router.use('/' + name, controllerRouter);
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

        var router = express.Router();

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
                        var areaRouter = express.Router();
                        require(areaPath).apply(null, [areaRouter].concat(options.params));
                        router.use(areaRouter);
                    }

                    callback(null);
                });
            }, callback);
        });

        return router;
    };

    return naviemvc;
};