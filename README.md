[Adsense Plugin for PencilBlue](http://pencilblue.org)
=====

##### Save your Adsense ads inside PencilBlue and easily load them through template directives

Installation and Setup
-----

1. Clone the adsense-pencilblue repository into the plugins folder of your PencilBlue installation
```shell
cd [pencilblue_directory]/plugins
git clone https://github.com/pencilblue/adsense-pencilblue.git
```

2. Install the adsense-pencilblue plugin through the manage plugins screen in the admin section (/admin/plugins).

3. Go to the adsense-pencilblue settings screen (/admin/plugins/settings/adsense-pencilblue) and set *Ad client id* to your Adsense client ID (ca-pub-#) and save.

4. Add your first Adsense ad:
  1. Click on the *Manage Ads* button on the adsense-pencilblue settings page.
  2. Create a unique name for your first ad
  3. On Adsense's management panel, copy the ID of the ad you want to save and paste it into the *ad_id* field of PencilBlue's *new_adsense_ad* form.
  4. Save the adsense_ad object.

5. Now there will be a directive available in your HTML templates of ^adsense_[ad name]^. For instance, if you name your ad "leaderboard," the directive is ^adsense_leaderboard^.
  * **Note:** if you add the directive and restart the server before you save the ad type it will not be loaded until you click the *Refresh Directives* button on the adsense-penciblue settings screen. 
