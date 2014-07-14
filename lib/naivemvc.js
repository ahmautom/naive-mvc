var fs = require('fs');
var path = require('path');
var async = require('async');
var _ = require('underscore');

module.exports = function(express) {
    return function(options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = undefined;
        }

        var rootRouter;
        if ('function' === typeof express.Router) {
            // Express 4.x
            rootRouter = express.Router();
        } else {
            rootRouter = express();
        }

        options || (options = {});
        options.basePath = options.basePath || path.dirname(require.main.filename);
        _.defaults(options, {
            controllerPath: path.join(options.basePath, 'controllers'),
            viewPath: path.join(options.basePath, 'views'),
            areaPath: path.join(options.basePath, 'areas'),
            viewEngine: 'jade',
            defaultDocument: 'index',
            params: []
        });

        async.parallel([
            // Register controllers
            function(callback) {
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
                                var controllerApp = express();
                                var name = path.basename(filename, path.extname(filename));
                                controllerApp.set('views', path.join(options.viewPath, name));
                                controllerApp.set('view engine', options.viewEngine);
                                require(controllerPath).apply(null, [controllerApp].concat(options.params));

                                if (name === options.defaultDocument) {
                                    rootRouter.use('/', controllerApp);
                                } else {
                                    rootRouter.use('/' + name, controllerApp);
                                }
                            }
                            callback(null);
                        });
                    }, function(err) {
                        callback(err);
                    });
                });
            },
            // Register areas   
            function(callback) {
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
                                require(areaPath).apply(null, [rootRouter].concat(options.params));
                            }
                            callback(null);
                        });
                    }, function(err) {
                        callback(err);
                    });
                });
            }
        ], function(err) {
            callback && callback(err);
        });

        return rootRouter;
    };
};