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

    var util = pb.util;
    var TemplateService = pb.TemplateService;
    var CustomObjectService = pb.CustomObjectService;
    var AdminSubnavService = pb.AdminSubnavService;
    var PluginService = pb.PluginService;

    /**
     * @class AdSenseService
     * @constructor
     * @param {object} context
     * @param {string} context.site
     * @param {boolean} context.onlyThisSite
     */
    function AdSenseService(context) {

        /**
         * @property site
         * @type {string}
         */
        this.site = context.site;

        /**
         * @property customObjectService
         * @type {CustomObjectService}
         */
        this.customObjectService = new CustomObjectService(context.site, context.onyThisSite);
    }

    /**
     * @private
     * @static
     * @readonly
     * @property TYPE_NAME
     * @type {string}
     */
    var TYPE_NAME = 'adsense_ad';

    /**
     * @private
     * @static
     * @readonly
     * @property FLAG_PREFIX
     * @type {string}
     */
    var FLAG_PREFIX = 'adsense_';

    /**
     * @method createObjectsForInstall
     * @param {function} cb (Error, boolean)
     */
    AdSenseService.prototype.createObjectsForInstall = function(cb) {
        var self = this;

        this.customObjectService.loadTypeByName(TYPE_NAME, function(err, adsenseAd) {
            if (util.isError(err)) {
                return cb(err);
            }

            //don't bother if it is already created
            if (adsenseAd) {
                return cb(null, true);
            }

            //it doesn't exist so go create it
            var adValues = {
                name: TYPE_NAME,
                fields: {
                    name: {
                        field_type: 'text'
                    },
                    ad_id: {
                        field_type: 'number'
                    }
                }
            };
            self.customObjectService.saveType(adValues, function(err) {
                cb(err, true);
            });
        });
    };

    /**
     * Registers the global flags for each ad placement. The second parameter of the callback is the custom object type
     * for the ads
     * @method registerGlobals
     * @param {function} cb (Error, object)
     */
    AdSenseService.prototype.registerGlobals = function(cb) {
        var self = this;

        this.customObjectService.loadTypeByName(TYPE_NAME, function(err, adsenseAdType) {
            if (util.isError(err)) {
                return cb(err);
            }

            //register global flags for each ad placement
            var ctx = {
                site: self.site,
                adsenseAdType: adsenseAdType
            };
            self.customObjectService.findByType(adsenseAdType, null, function(err, adsenseAds) {
                for(var i = 0; i < adsenseAds.length; i++) {

                    //register individual flag
                    TemplateService.registerGlobal(FLAG_PREFIX + adsenseAds[i].name, AdSenseService.getAdHandler(ctx));
                }

                cb(null, adsenseAdType);
            });
        });
    };

    /**
     * Creates a flag handler
     * @static
     * @method getAdHandler
     * @param {object} context
     * @param {object} context.adsenseAdType
     * @param {string} context.site
     * @returns {Function} (string, function)
     */
    AdSenseService.getAdHandler = function(context) {
        return function(flag, cb) {

            //retrieve the ad-sense client ID
            var pluginService = new PluginService({site: context.site});
            pluginService.getSetting('ad_client_id', 'adsense-pencilblue', function(err, adClientId) {

                //derive ad name from flag
                var adName = flag.split(FLAG_PREFIX).join('');

                var cos = new CustomObjectService(context.site, true);
                cos.findByType(context.adsenseAdType, {name: adName}, function(err, adsenseAds) {
                    if(util.isError(err) || adsenseAds.length <= 0) {
                        return cb(err, '');
                    }

                    var adsenseAd = adsenseAds[0];
                    cb(err, new pb.TemplateValue('<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script><ins class="adsbygoogle" style="display:block" data-ad-client="' + adClientId + '" data-ad-slot="' + adsenseAd.ad_id + '" data-ad-format="auto"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>', false));
                });
            });
        };
    };

    /**
     * @static
     * @method registerAdminSubNav
     * @param {string} adsenseAdTypeId
     */
    AdSenseService.registerAdminSubNav = function(adsenseAdTypeId) {
        AdminSubnavService.registerFor('plugin_settings', function(navKey, localization, plugin) {
            if(plugin.uid === 'adsense-pencilblue') {
                return [
                    {
                        name: 'ads',
                        title: 'Manage Ads',
                        icon: 'bookmark',
                        href: '/admin/content/custom_objects/manage_objects/' + adsenseAdTypeId
                    },
                    {
                        name: 'refresh',
                        title: 'Refresh Directives',
                        icon: 'refresh',
                        href: '/admin/plugins/settings/adsense-pencilblue/refresh'
                    }
                ];
            }
            return [];
        });
    };

    return AdSenseService;
};