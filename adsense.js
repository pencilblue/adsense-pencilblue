/*
    Copyright (C) 2016  PencilBlue, LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
'use strict';

//dependencies
var async = require('async');
var path = require('path');

module.exports = function(pb) {
    
    //pb dependencies
    var util = pb.util;
    var DAO = pb.DAO;
    var PluginServiceLoader = pb.PluginServiceLoader;

    /**
     * AdSense - Display Adsense ads on your site.
     * @class Adsense
     * @constructor
     */
    function Adsense(){}

    var UID = 'adsense-pencilblue';

    var SERVICE_FILENAME = 'adsense_service.js';

    var pluginServiceLoader = new PluginServiceLoader({pluginUid: UID});

    /**
     * Called when the application is being installed for the first time.
     * @static
     * @method onInstallWithContext
     * @param {object} context
     * @param {string} context.site
     * @param {function} cb (Error) A callback that must be called upon completion.
     * The result is ignored
     */
    Adsense.onInstallWithContext = function(context, cb) {
        
        var absolutePath = path.join(PluginServiceLoader.getPathToServices(UID), SERVICE_FILENAME);
        var tasks = [

            //load the service
            util.wrapTask(pluginServiceLoader, pluginServiceLoader.get, [absolutePath, {}]),

            //register ad placements
            function(serviceLoaderWrapper, callback) {
                var service = new serviceLoaderWrapper.data({site: context.site, onlyThisSite: true});
                service.createObjectsForInstall(callback);
            }
        ];
        async.waterfall(tasks, cb);
    };

    /**
     * Called when the application is uninstalling this plugin.  The plugin should
     * make every effort to clean up any plugin-specific DB items or any in function
     * overrides it makes.
     * @static
     * @method onUninstallWithContext
     * @param {object} context
     * @param {string} context.site
     * @param {function} cb (Error) A callback that must be called upon completion.
     * The result is ignored
     */
    Adsense.onUninstallWithContext = function(context, cb) {
        cb(null, true);
    };

    /**
     * Called when the application is starting up. The function is also called at
     * the end of a successful install. It is guaranteed that all core PB services
     * will be available including access to the core DB.
     * @static
     * @method onStartupWithContext
     * @param {object} context
     * @param {string} context.site
     * @param {function} cb (Error) A callback that must be called upon completion.
     * The result is ignored
     */
    Adsense.onStartupWithContext = function(context, cb) {

        var AdSenseService = null;
        var absolutePath = path.join(PluginServiceLoader.getPathToServices(UID), SERVICE_FILENAME);
        var tasks = [

            //load the service
            util.wrapTask(pluginServiceLoader, pluginServiceLoader.get, [absolutePath, {}]),

            //register ad placements
           function(serviceLoaderWrapper, callback) {
               AdSenseService = serviceLoaderWrapper.data;
               var service = new AdSenseService({site: context.site, onlyThisSite: true});
               service.registerGlobals(callback);
           },

            function(adSenseAdType, callback) {
                AdSenseService.registerAdminSubNav(adSenseAdType[DAO.getIdField()].toString());
                callback(null, true);
            }
        ];
        async.waterfall(tasks, cb);
    };

    /**
     * Called when the application is gracefully shutting down.  No guarantees are
     * provided for how much time will be provided the plugin to shut down.
     * @static
     * @method onShutdown
     * @param {function} cb (Error) A callback that must be called upon completion.
     */
    Adsense.onShutdown = function(cb) {
        cb(null, true);
    };

    //exports
    return Adsense;
};
