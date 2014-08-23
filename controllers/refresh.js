
function AdsenseRefresh(){}

//inheritance
util.inherits(AdsenseRefresh, pb.BaseController);

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

AdsenseRefresh.prototype.setGlobal = function(adsenseAd) {
    pb.TemplateService.registerGlobal('adsense_' + adsenseAd.name, function(flag, cb) {
        pb.plugins.getSetting('ad_client_id', 'adsense', function(err, adClientId) {
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
            access_level: ACCESS_EDITOR,
            content_type: 'text/html'
        }
    ];
    cb(null, routes);
};

//exports
module.exports = AdsenseRefresh;
