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

module.exports = function(pb) {
    
    //pb dependencies
    var util = pb.util;
    var DAO = pb.DAO;

    /**
     * Adsense - Display Adsense ads on your site.
     * @class Adsense
     * @constructor
     */
    function Adsense(){}

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
        
        //TODO load service
        var service = new AdSenseService({site: context.site, onlyThisSite: true});
        service.createObjectsForInstall(cb);
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

        //TODO load service dummy
        var service = new AdSenseService({site: context.site, onlyThisSite: true});
        service.registerGlobals(function(err, adSenseAdType) {
            if (util.isError(err)) {
                return cb(err);
            }

            //register admin sub nav
            AdSenseService.registerAdminSubNav(adSenseAdType[DAO.getIdField()].toString());
        });
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
