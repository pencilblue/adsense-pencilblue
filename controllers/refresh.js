/*
    Copyright (C) 2015  PencilBlue, LLC

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

module.exports = function(pb) {
    
    //pb dependencies
    var util            = pb.util;
    var BaseController  = pb.BaseController;
    var PluginService   = pb.PluginService;
    var SecurityService = pb.SecurityService;

    /**
     *
     * @class AdsenseRefresh
     * @constructor
     */
    function AdsenseRefresh(){}
    util.inherits(AdsenseRefresh, BaseController);

    /**
     * This is the function that will be called by the system's RequestHandler.  It
     * will map the incoming route to the ones below and then instantiate this
     * prototype.  The request handler will then proceed to call this function.
     * Its callback should contain everything needed in order to provide a response.
     *
     * @method render
     * @see BaseController#render
     * @param cb The callback.  It does not require a an error parameter.  All
     * errors should be handled by the controller and format the appropriate
     *  response.  The system will attempt to catch any catastrophic errors but
     *  makes no guarantees.
     */
    AdsenseRefresh.prototype.render = function(cb) {
        var self = this;
        var cos = new pb.CustomObjectService();

        cos.loadTypeByName('adsense_ad', function(err, adsenseAdType) {
            cos.findByType(adsenseAdType, null, function(err, adsenseAds) {
                for(var i = 0; i < adsenseAds.length; i++) {
                    self.setGlobal(adsenseAds[i]);
                }

                self.session.success = self.ls.get('ADSENSE_REFRESHED');
                self.redirect('/admin/plugins/settings/adsense-pencilblue', cb);
            });
        });
    };

    //TODO remove this duplicate code
    //TODO speed this up so it doesn't make multiple DB calls on EVERY request
    AdsenseRefresh.prototype.setGlobal = function(adsenseAd) {
        pb.TemplateService.registerGlobal('adsense_' + adsenseAd.name, function(flag, cb) {
            
            var pluginService = new PluginService();
            pluginService.getSetting('ad_client_id', 'adsense', function(err, adClientId) {
                var adName = flag.split('adsense_').join('');
                cos.loadTypeByName('adsense_ad', function(err, adsenseAdType) {
                    cos.findByType(adsenseAdType, {name: adName}, function(err, adsenseAds) {
                        if(!adsenseAds.length) {
                            return cb(err, '');
                        }

                        var adsenseAd = adsenseAds[0];
                        cb(err, new pb.TemplateValue('<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script><ins class="adsbygoogle" style="display:block" data-ad-client="' + adClientId + '" data-ad-slot="' + adsenseAd.ad_id + '" data-ad-format="auto"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>', false));
                    });
                });
            });
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
    AdsenseRefresh.getRoutes = function(cb) {
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
    return AdsenseRefresh;
};
