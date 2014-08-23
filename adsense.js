/**
 * Adsense - Display Adsense ads on your site.
 *
 * @author Blake Callens <blake@pencilblue.org>
 * @copyright 2014 PencilBlue, LLC
 */
function Adsense(){}

/**
 * Called when the application is being installed for the first time.
 *
 * @param cb A callback that must be called upon completion.  cb(err, result).
 * The result is ignored
 */
Adsense.onInstall = function(cb) {
    var self = this;
    var cos = new pb.CustomObjectService();

    cos.loadTypeByName('adsense_ad', function(err, adsenseAd) {
        if(!adsenseAd) {
            var adValues = {name: 'adsense_ad', fields: {name: {field_type: 'text'}, ad_id: {field_type: 'number'}}};
            cos.saveType(adValues, function(err, adsenseAd) {
                if(err) {
                    // TODO error handling
                }

                cb(null, true);
            });
        }
        else {
            cb(null, true);
        }
    });
};

/**
 * Called when the application is uninstalling this plugin.  The plugin should
 * make every effort to clean up any plugin-specific DB items or any in function
 * overrides it makes.
 *
 * @param cb A callback that must be called upon completion.  cb(err, result).
 * The result is ignored
 */
Adsense.onUninstall = function(cb) {
    cb(null, true);
};

/**
 * Called when the application is starting up. The function is also called at
 * the end of a successful install. It is guaranteed that all core PB services
 * will be available including access to the core DB.
 *
 * @param cb A callback that must be called upon completion.  cb(err, result).
 * The result is ignored
 */
Adsense.onStartup = function(cb) {
    var self = this;
    var cos = new pb.CustomObjectService();
    var dao = new pb.DAO();

    this.setGlobal = function(adsenseAd) {
        pb.TemplateService.registerGlobal('adsense_' + adsenseAd.name, function(flag, cb) {
            pb.plugins.getSetting('ad_client_id', 'adsense-pencilblue', function(err, adClientId) {
                var adName = flag.split('adsense_').join('');
                cos.loadTypeByName('adsense_ad', function(err, adsenseAdType) {
                    cos.findByType(adsenseAdType, {name: adName}, function(err, adsenseAds) {
                        if(!adsenseAds.length) {
                            cb(err, '');
                            return;
                        }

                        var adsenseAd = adsenseAds[0];
                        cb(null, new pb.TemplateValue('<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script><ins class="adsbygoogle" style="display:block" data-ad-client="' + adClientId + '" data-ad-slot="' + adsenseAd.ad_id + '" data-ad-format="auto"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>', false));
                    });
                });
            });
        });
    };

    cos.loadTypeByName('adsense_ad', function(err, adsenseAdType) {
        cos.findByType(adsenseAdType, null, function(err, adsenseAds) {
            for(var i = 0; i < adsenseAds.length; i++) {
                self.setGlobal(adsenseAds[i]);
            }
        });

        pb.AdminSubnavService.registerFor('plugin_settings', function(navKey, localization, plugin) {
            if(plugin.uid === 'adsense-pencilblue') {
                return [
                    {
                        name: 'ads',
                        title: 'Manage Ads',
                        icon: 'bookmark',
                        href: '/admin/content/custom_objects/manage_objects/' + adsenseAdType._id.toString()
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
    });

    cb(null, true);
};

/**
 * Called when the application is gracefully shutting down.  No guarantees are
 * provided for how much time will be provided the plugin to shut down.
 *
 * @param cb A callback that must be called upon completion.  cb(err, result).
 * The result is ignored
 */
Adsense.onShutdown = function(cb) {
    cb(null, true);
};

//exports
module.exports = Adsense;
