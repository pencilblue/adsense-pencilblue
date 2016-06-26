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
    var util            = pb.util;
    var BaseController  = pb.BaseController;
    var SecurityService = pb.SecurityService;
    var PluginService = pb.PluginService;

    /**
     *
     * @class AdsenseRefreshController
     * @extends BaseController
     * @constructor
     */
    function AdsenseRefreshController(){}
    util.inherits(AdsenseRefreshController, BaseController);

    /**
     * @method initSync
     * @param {object} context
     */
    AdsenseRefreshController.prototype.initSync = function(/*context*/) {
        var AdSenseService = PluginService.getService('AdSenseService', 'adsense-pencilblue', this.site);

        /**
         * @property adSenseService
         * @type {AdSenseService}
         */
        this.adSenseService = new AdSenseService(this.getServiceContext());
    };

    /**
     * This is the function that will be called by the system's RequestHandler.  It
     * will map the incoming route to the ones below and then instantiate this
     * prototype.  The request handler will then proceed to call this function.
     * Its callback should contain everything needed in order to provide a response.
     *
     * @method render
     * @see BaseController#render
     * @param {function} cb The callback.  It does not require a an error parameter.  All
     * errors should be handled by the controller and format the appropriate
     *  response.  The system will attempt to catch any catastrophic errors but
     *  makes no guarantees.
     */
    AdsenseRefreshController.prototype.render = function(cb) {
        var self = this;

        this.adSenseService.registerGlobals(function(err) {
            if (util.isError(err)) {
                return cb(err);
            }
            self.session.success = self.ls.g('ADSENSE_REFRESHED');
            self.redirect('/admin/plugins/adsense-pencilblue/settings', cb);
        });
    };

    /**
     * Provides the routes that are to be handled by an instance of this prototype.
     * The route provides a definition of path, permissions, authentication, and
     * expected content type.
     * Method is optional
     * Path is required
     * Permissions are optional
     * Access levels are optional
     * Content type is optional
     *
     * @param cb A callback of the form: cb(error, array of objects)
     */
    AdsenseRefreshController.getRoutes = function(cb) {
        var routes = [
            {
                method: 'get',
                path: "/admin/plugins/settings/adsense-pencilblue/refresh",
                auth_required: true,
                access_level: SecurityService.ACCESS_EDITOR,
                content_type: 'text/html'
            }
        ];
        cb(null, routes);
    };

    //exports
    return AdsenseRefreshController;
};
