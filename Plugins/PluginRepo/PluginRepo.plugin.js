//META{"name":"PluginRepo","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/PluginRepo","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/PluginRepo/PluginRepo.plugin.js"}*// 

class PluginRepo {
	getName () {return "PluginRepo";} 

	getVersion () {return "1.8.7";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to look at all plugins from the plugin repo and download them on the fly. Repo button is in the plugins settings.";}

	constructor () {
		this.changelog = {
			"improved":[["Preview","Now also uses Modules to grab classnames"]]
		};

		this.patchModules = {
			"V2C_List":"componentDidMount"
		};
	}

	initConstructor () {
		this.sortings = {
			sort: {
				name:			"Name",
				author:			"Author",
				version:		"Version",
				description:	"Description",
				state:			"Update State",
				fav:			"Favorites",
				new:			"New Plugins"
			},
			order: {
				asc:			"Ascending",
				desc:			"Descending"
			}
		};

		this.loading = {is:false, timeout:null, amount:0};

		this.cachedPlugins = [];
		this.grabbedPlugins = [];
		this.foundPlugins = [];
		this.loadedPlugins = {};

		this.updateInterval;

		this.pluginRepoIconMarkup =
			`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="34" height="31" viewBox="0 0 400 382">
				<path d="M0.000 183.023 L 0.000 366.046 46.377 366.046 L 92.754 366.046 92.754 312.629 L 92.754 259.213 127.223 259.213 C 174.433 259.213,187.432 257.146,210.766 245.926 C 311.105 197.681,301.344 41.358,195.859 7.193 C 173.603 -0.015,173.838 0.000,80.846 0.000 L 0.000 0.000 0.000 183.023 M157.615 88.195 C 193.007 97.413,198.827 152.678,166.407 171.674 C 158.993 176.019,155.494 176.398,122.807 176.398 L 92.754 176.398 92.754 131.677 L 92.754 86.957 122.807 86.957 C 146.807 86.957,153.819 87.206,157.615 88.195" stroke="none" fill="#7289da" fill-rule="evenodd"></path>
				<path d="M226.647 3.824 C 258.085 21.580,282.721 54.248,291.095 89.281 C 292.183 93.834,293.041 95.659,294.560 96.655 C 310.880 107.348,312.400 140.701,297.286 156.464 C 293.685 160.221,293.134 161.348,291.162 169.006 C 282.026 204.468,259.916 235.185,230.701 253.002 C 229.548 253.705,235.510 262.261,270.237 309.731 L 311.131 365.631 355.565 365.846 L 400.000 366.060 400.000 348.309 L 400.000 330.557 364.338 285.630 L 328.676 240.703 333.494 238.892 C 373.356 223.907,395.248 189.691,399.313 136.020 C 404.504 67.495,372.510 19.710,311.375 4.675 C 294.592 0.548,287.694 -0.000,252.482 0.000 L 219.876 0.000 226.647 3.824 M202.899 265.964 C 183.869 272.635,168.536 274.960,139.752 275.540 L 116.770 276.003 116.770 321.024 L 116.770 366.046 163.975 366.046 L 211.180 366.046 211.180 314.700 C 211.180 286.460,210.901 263.386,210.559 263.425 C 210.217 263.464,206.770 264.607,202.899 265.964" stroke="none" fill="#7f8186" fill-rule="evenodd"></path>
			</svg>`;

		this.frameMarkup = 
			`<iframe class="discordSandbox" style="position: absolute !important; opacity: 0 !important; pointer-events: none !important;" src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/DiscordPreview.html"></iframe>`;

		this.pluginEntryMarkup =
			`<li class="pluginEntry ${BDFDB.disCNS._reposettingsclosed + BDFDB.disCN._repocheckboxitem}">
				<div class="${BDFDB.disCN._repoheader}" style="overflow: visible !important;">
					<span class="${BDFDB.disCN._repoheadertitle}">
						<span class="${BDFDB.disCN._reponame}"></span> v<span class="${BDFDB.disCN._repoversion}"></span> by <span class="${BDFDB.disCN._repoauthor}"></span>
					</span>
					<div class="${BDFDB.disCN._repocontrols}">
						<div tabindex="0" class="${BDFDB.disCNS.giffavoritebutton + BDFDB.disCN.giffavoritecolor}" role="button" style="width: 24px !important; height: 24px !important; position: relative !important; opacity: 1 !important; transform: none !important;">
							<svg class="${BDFDB.disCNS.giffavoriteicon}" name="Favorite" viewBox="2 2 20 20" width="24" height="24"></svg>
						</div>
						<svg class="gitIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" transform="translate(2,1.5)">
							<path d="M 7.19, 16.027 c -0.139, 0.026 -0.199, 0.091 -0.182, 0.195 c 0.017, 0.104, 0.095, 0.138, 0.234, 0.104 c 0.139 -0.035, 0.199 -0.095, 0.182 -0.182 C 7.406, 16.049, 7.328, 16.01, 7.19, 16.027 z"></path>
							<path d="M 6.45, 16.131 c -0.138, 0 -0.208, 0.047 -0.208, 0.143 c 0, 0.112, 0.074, 0.16, 0.221, 0.143 c 0.138, 0, 0.208 -0.048, 0.208 -0.143 C 6.671, 16.162, 6.597, 16.114, 6.45, 16.131 z"></path>
							<path d="M 5.438, 16.092 c -0.035, 0.095, 0.022, 0.16, 0.169, 0.195 c 0.13, 0.052, 0.212, 0.026, 0.247 -0.078 c 0.026 -0.095 -0.03 -0.164 -0.169 -0.208 C 5.554, 15.967, 5.472, 15.996, 5.438, 16.092 z"></path>
							<path d="M 18.837, 1.097 C 18.106, 0.366, 17.226, 0, 16.196, 0 H 3.738 C 2.708, 0, 1.828, 0.366, 1.097, 1.097 C 0.366, 1.828, 0, 2.708, 0, 3.738 v 12.459 c 0, 1.03, 0.366, 1.91, 1.097, 2.641 c 0.731, 0.731, 1.612, 1.097, 2.641, 1.097 h 2.907 c 0.19, 0, 0.333 -0.007, 0.428 -0.019 c 0.095 -0.013, 0.19 -0.069, 0.285 -0.169 c 0.095 -0.099, 0.143 -0.244, 0.143 -0.435 c 0 -0.026 -0.002 -0.32 -0.007 -0.883 c -0.004 -0.562 -0.007 -1.008 -0.007 -1.337 l -0.298, 0.052 c -0.19, 0.035 -0.43, 0.05 -0.72, 0.045 c -0.29 -0.004 -0.59 -0.035 -0.902 -0.091 c -0.312 -0.056 -0.601 -0.186 -0.87 -0.389 c -0.268 -0.203 -0.458 -0.469 -0.571 -0.798 l -0.13 -0.299 c -0.086 -0.199 -0.223 -0.419 -0.409 -0.662 c -0.186 -0.242 -0.374 -0.407 -0.564 -0.493 l -0.091 -0.065 c -0.06 -0.043 -0.117 -0.095 -0.169 -0.156 c -0.052 -0.061 -0.091 -0.121 -0.117 -0.182 c -0.026 -0.061 -0.004 -0.11, 0.065 -0.149 c 0.069 -0.039, 0.195 -0.058, 0.376 -0.058 l 0.259, 0.039 c 0.173, 0.035, 0.387, 0.138, 0.642, 0.311 c 0.255, 0.173, 0.465, 0.398, 0.629, 0.675 c 0.199, 0.355, 0.439, 0.625, 0.72, 0.811 c 0.281, 0.186, 0.565, 0.279, 0.85, 0.279 s 0.532 -0.022, 0.74 -0.065 c 0.208 -0.043, 0.402 -0.108, 0.584 -0.195 c 0.078 -0.58, 0.29 -1.025, 0.636 -1.337 c -0.493 -0.052 -0.936 -0.13 -1.33 -0.234 c -0.394 -0.104 -0.8 -0.272 -1.22 -0.506 c -0.42 -0.234 -0.768 -0.523 -1.045 -0.87 c -0.277 -0.346 -0.504 -0.8 -0.681 -1.363 c -0.177 -0.562 -0.266 -1.211 -0.266 -1.947 c 0 -1.047, 0.342 -1.938, 1.025 -2.673 c -0.32 -0.787 -0.29 -1.67, 0.091 -2.647 c 0.251 -0.078, 0.623 -0.019, 1.116, 0.175 c 0.493, 0.195, 0.854, 0.361, 1.084, 0.5 c 0.229, 0.138, 0.413, 0.255, 0.552, 0.35 c 0.805 -0.225, 1.635 -0.337, 2.492 -0.337 c 0.856, 0, 1.687, 0.112, 2.492, 0.337 l 0.493 -0.311 c 0.338 -0.208, 0.735 -0.398, 1.194 -0.571 c 0.459 -0.173, 0.809 -0.221, 1.051 -0.143 c 0.389, 0.978, 0.424, 1.86, 0.104, 2.647 c 0.683, 0.735, 1.025, 1.627, 1.025, 2.673 c 0, 0.735 -0.089, 1.387 -0.266, 1.953 c -0.177, 0.567 -0.406, 1.021 -0.688, 1.363 c -0.281, 0.342 -0.632, 0.629 -1.051, 0.863 c -0.42, 0.234 -0.826, 0.402 -1.22, 0.506 c -0.394, 0.104 -0.837, 0.182 -1.33, 0.234 c 0.45, 0.389, 0.675, 1.003, 0.675, 1.843 v 3.102 c 0, 0.147, 0.021, 0.266, 0.065, 0.357 c 0.044, 0.091, 0.113, 0.153, 0.208, 0.188 c 0.096, 0.035, 0.18, 0.056, 0.253, 0.065 c 0.074, 0.009, 0.18, 0.013, 0.318, 0.013 h 2.907 c 1.029, 0, 1.91 -0.366, 2.641 -1.097 c 0.731 -0.731, 1.097 -1.612, 1.097 -2.641 V 3.738 C 19.933, 2.708, 19.568, 1.827, 18.837, 1.097 z"></path>
							<path d="M 3.945, 14.509 c -0.06, 0.043 -0.052, 0.112, 0.026, 0.208 c 0.087, 0.086, 0.156, 0.1, 0.208, 0.039 c 0.061 -0.043, 0.052 -0.112 -0.026 -0.208 C 4.066, 14.47, 3.997, 14.457, 3.945, 14.509 z"></path>
							<path d="M 3.517, 14.184 c -0.026, 0.061, 0.004, 0.113, 0.091, 0.156 c 0.069, 0.043, 0.126, 0.035, 0.169 -0.026 c 0.026 -0.061 -0.004 -0.113 -0.091 -0.156 C 3.599, 14.132, 3.543, 14.141, 3.517, 14.184 z"></path>
							<path d="M 4.348, 15.015 c -0.078, 0.043 -0.078, 0.121, 0, 0.234 c 0.078, 0.113, 0.151, 0.143, 0.221, 0.091 c 0.078 -0.061, 0.078 -0.143, 0 -0.247 C 4.499, 14.981, 4.425, 14.954, 4.348, 15.015 z"></path>
							<path d="M 4.802, 15.599 c -0.078, 0.069 -0.061, 0.151, 0.052, 0.247 c 0.104, 0.104, 0.19, 0.117, 0.259, 0.039 c 0.069 -0.069, 0.052 -0.151 -0.052 -0.246 C 4.958, 15.534, 4.871, 15.521, 4.802, 15.599 z"></path>
						</svg>
					</div>
				</div>
				<div class="${BDFDB.disCNS._repodescriptionwrap + BDFDB.disCN.scrollerwrap}">
					<div class="${BDFDB.disCNS._repodescription + BDFDB.disCN.scroller}" style="display: block !important;"></div>
				</div>
				<div class="${BDFDB.disCN._repofooter}">
					<span class="${BDFDB.disCN._repolinks}"></span>
					<svg class="trashIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" style="margin: 0 5px 0 auto !important;">
						<path d="M 18.012, 0.648 H 12.98 C 12.944, 0.284, 12.637, 0, 12.264, 0 H 8.136 c -0.373, 0 -0.68, 0.284 -0.716, 0.648 H 2.389 c -0.398, 0 -0.72, 0.322 -0.72, 0.72 v 1.368 c 0, 0.398, 0.322, 0.72, 0.72, 0.72 h 15.623 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 1.368 C 18.731, 0.97, 18.409, 0.648, 18.012, 0.648 z"></path>
						<path d="M 3.178, 4.839 v 14.841 c 0, 0.397, 0.322, 0.72, 0.72, 0.72 h 12.604 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 4.839 H 3.178 z M 8.449, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 c -0.438, 0 -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z M 13.538, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 s -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z"></path>
					</svg>
					<button class="${BDFDB.disCN._reposettingsbutton} btn-download" style="margin-left: 0 !important;">Download</button>
				</div>
			</li>`;

		this.pluginRepoModalMarkup =
			`<span class="${this.name}-modal Repo-modal BDFDB-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizelarge}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto; padding-bottom: 10px;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.defaultcolor + BDFDB.disCN.h4defaultmargin} pluginAmount">Plugin Repository</h4>
									<div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.titlesize12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div>
								</div>
								<button type="button" class="${BDFDB.disCNS.modalclose + BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookblank + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}">
										<svg name="Close" width="18" height="18" viewBox="0 0 12 12" style="flex: 0 1 auto;">
											<g fill="none" fill-rule="evenodd">
												<path d="M0 0h12v12H0"></path>
												<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
											</g>
										</svg>
									</div>
								</button>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.marginbottom8 + BDFDB.disCN.tabbarcontainer}" style="flex: 0 0 auto; padding-right: 12px;">
								<div class="${BDFDB.disCNS.tabbar + BDFDB.disCN.tabbartop}">
									<div tab="plugins" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbaritem}">Plugins</div>
									<div tab="settings" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbaritem}">Settings</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.quickselect}">
									<div class="${BDFDB.disCN.quickselectlabel}">Sort by:</div>
									<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.quickselectclick} sort-filter" style="flex: 0 0 auto;">
										<div option="${Object.keys(this.sortings.sort)[0]}" class="${BDFDB.disCN.quickselectvalue}">${this.sortings.sort[Object.keys(this.sortings.sort)[0]]}</div>
										<div class="${BDFDB.disCN.quickselectarrow}"></div>
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.quickselect}">
									<div class="${BDFDB.disCN.quickselectlabel}">Order:</div>
									<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.quickselectclick} order-filter" style="flex: 0 0 auto;">
										<div option="${Object.keys(this.sortings.order)[0]}" class="${BDFDB.disCN.quickselectvalue}">${this.sortings.order[Object.keys(this.sortings.order)[0]]}</div>
										<div class="${BDFDB.disCN.quickselectarrow}"></div>
									</div>
								</div>
							</div>
							<div tab="plugins" class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.scrollerthemeghosthairline} tab-content">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner}">
									<ul class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN._repolist} plugins" style="flex: 1 1 auto; display: flex !important; display: flex-direction: column !important; margin: unset !important; width: unset !important;"></ul>
								</div>
							</div>
							<div tab="settings" class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalsubinner} tab-content" style="flex: 1 1 auto;">
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto; width: 800px;">To experience PluginRepo in the best way. I would recommend you to enable BD intern reload function, that way all downloaded files are loaded into Discord without the need to reload.</h3>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Hide updated Plugins.</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" value="updated" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} hide-checkbox" id="input-hideupdated">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Hide outdated Plugins.</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" value="outdated" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} hide-checkbox" id="input-hideoutdated">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Hide downloadable Plugins.</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" value="downloadable" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} hide-checkbox" id="input-hidedownloadable">
									</div>
								</div>
								<div id="RNMoption" class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Start Plugin after Download (Automatic Loading needed)</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-rnmstart">
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</span>`;

		this.sortPopoutMarkup =
			`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottomright + BDFDB.disCN.popoutnoshadow} pluginrepo-sort-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="${BDFDB.disCN.contextmenu} BDFDB-quickSelectPopout">
						<div class="${BDFDB.disCN.contextmenuitemgroup}">
							${Object.keys(this.sortings.sort).map((key, i) => `<div option="${key}" class="${BDFDB.disCNS.contextmenuitem + BDFDB.disCN.contextmenuitemclickable}">${this.sortings.sort[key]}</div>`).join("")}
						</div>
					</div>
				</div>
			</div>`;

		this.orderPopoutMarkup =
			`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottomright + BDFDB.disCN.popoutnoshadow} pluginrepo-order-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="${BDFDB.disCN.contextmenu} BDFDB-quickSelectPopout">
						<div class="${BDFDB.disCN.contextmenuitemgroup}">
							${Object.keys(this.sortings.order).map((key, i) => `<div option="${key}" class="${BDFDB.disCNS.contextmenuitem + BDFDB.disCN.contextmenuitemclickable}">${this.sortings.order[key]}</div>`).join("")}
						</div>
					</div>
				</div>
			</div>`;

		this.defaults = {
			settings: {
				notifyOutdated:		{value:true, 		description:"Notifies you when one of your Plugins is outdated."},
				notifyNewentries:	{value:true, 		description:"Notifies you when there are new entries in the Repo."}
			}
		};

		this.css = `
			${BDFDB.dotCN.app} > .repo-loadingwrapper {
				position: absolute;
				bottom: 0;
				right: 0;
				z-index: 1000;
				animation: repo-loadingwrapper-fade 3s infinite ease;
			}
			${BDFDB.dotCN.app} > .repo-loadingwrapper > * {
				margin: 0 5px;
			}
			@keyframes repo-loadingwrapper-fade {
				from {opacity: 0.1;}
				50% {opacity: 0.9;}
				to {opacity: 0.1;}
			}
			.${this.name}-modal.Repo-modal ${BDFDB.dotCN.modalinner} {
				min-height: 100%;
				min-width: 800px;
				width: 50%;
			}
			.${this.name}-modal .pluginEntry ${BDFDB.dotCN._repocontrols} > * {
				margin-right: 5px !important;
			}
			.${this.name}-modal .pluginEntry svg[fill="currentColor"],
			.${this.name}-modal .pluginEntry ${BDFDB.dotCN.giffavoritebutton} {
				cursor: pointer;
			}
			.${this.name}-modal .pluginEntry svg[fill="currentColor"],
			.${this.name}-modal .pluginEntry ${BDFDB.dotCN.giffavoritebutton + BDFDB.notCN.giffavoriteselected} {
				color: #72767d !important;
			}
			${BDFDB.dotCN.themedark} .${this.name}-modal .pluginEntry svg[fill="currentColor"],
			${BDFDB.dotCN.themedark} .${this.name}-modal .pluginEntry ${BDFDB.dotCN.giffavoritebutton + BDFDB.notCN.giffavoriteselected} {
				color: #dcddde !important;
			}
			.${this.name}-modal .pluginEntry.downloadable .trashIcon {
				opacity: 0 !important;
				pointer-events: none !important;
			}`;
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var settings = 	BDFDB.getAllData(this, "settings");
		var settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.titlesize18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Add Plugin:</h3><input type="text" placeholder="Insert Raw Github Link of Plugin (https://raw.githubusercontent.com/...)" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.titlesize16}" id="input-pluginurl" style="flex: 1 1 auto;"><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-add btn-addplugin" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div>`;
		settingshtml += `<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Your additional Plugin List:</h3><div class="BDFDB-settings-inner-list plugin-list ${BDFDB.disCN.marginbottom8}">`;
		var ownlist = BDFDB.loadData("ownlist", this, "ownlist") || [];
		for (let url of ownlist) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.margintop4 + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis} entryurl">${url}</div></div><div class="${BDFDB.disCN.hovercardbutton} remove-plugin"></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Force all Plugins to be fetched again.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} refresh-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Refresh</div></button></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Remove all added Plugins from your own list.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} remove-all" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".btn-addplugin", () => {this.addPluginToOwnList(settingspanel);});
		BDFDB.addEventListener(this, settingspanel, "click", "#input-pluginurl", e => {if (e.which == 13) this.addPluginToOwnList(settingspanel);});
		BDFDB.addEventListener(this, settingspanel, "click", ".remove-plugin", e => {this.removePluginFromOwnList(e);});
		BDFDB.addEventListener(this, settingspanel, "click", ".remove-all", () => {this.removeAllFromOwnList(settingspanel);})
		BDFDB.addEventListener(this, settingspanel, "click", ".refresh-button", () => {
			this.loading = {is:false, timeout:null, amount:0};
			this.loadPlugins();
		});

		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
					if (body) {
						libraryScript = document.createElement("script");
						libraryScript.setAttribute("id", "BDFDBLibraryScript");
						libraryScript.setAttribute("type", "text/javascript");
						libraryScript.setAttribute("date", performance.now());
						libraryScript.innerText = body;
						document.head.appendChild(libraryScript);
					}
					this.initialize();
				});
			}, 15000);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			this.loadPlugins();

			this.updateInterval = setInterval(() => {this.checkForNewPlugins();},1000*60*30);

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			clearInterval(this.updateInterval);
			clearTimeout(this.loading.timeout);

			BDFDB.removeEles(".pluginrepo-notice",".bd-pluginrepobutton",".pluginrepo-loadingicon",BDFDB.dotCN.app + " > .repo-loadingwrapper:empty");

			var frame = document.querySelector("iframe.discordSandbox");
			if (frame) {
				window.removeEventListener("message", frame.messageReceived);
				frame.remove();
			}

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	onUserSettingsCogContextMenu (instance, menu, returnvalue) {
		setImmediate(() => {for (let child of returnvalue.props.children) if (child && child.props && child.props.label == "BandagedBD" && Array.isArray(child.props.render)) {
			const repoItem = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
				label: "Plugin Repo",
				className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-repo-contextMenuItem`,
				action: e => {
					if (!this.loading.is) BDFDB.closeContextMenu(menu);
					this.openPluginRepoModal();
				}
			});
			child.props.render.push(repoItem);
			break;
		}});
	}

	processV2CList (instance, wrapper, returnvalue) {
		if (!document.querySelector(".bd-pluginrepobutton") && window.PluginUpdates && window.PluginUpdates.plugins && instance._reactInternalFiber.key && instance._reactInternalFiber.key.split("-")[0] == "plugin") {
			var folderbutton = document.querySelector(BDFDB.dotCN._repofolderbutton);
			if (folderbutton) {
				var repoButton = BDFDB.htmlToElement(`<button class="${BDFDB.disCN._repofolderbutton} bd-pluginrepobutton">PluginRepo</button>`);
				repoButton.addEventListener("click", () => {
					this.openPluginRepoModal()
				});
				repoButton.addEventListener("mouseenter", () => {
					BDFDB.createTooltip("Open Plugin Repo", repoButton, {type:"top",selector:"pluginrepo-button-tooltip"});
				});
				folderbutton.parentElement.insertBefore(repoButton, folderbutton.nextSibling);
			}
		}
	};

	addPluginToOwnList (settingspanel) {
		var pluginUrlInput = settingspanel.querySelector("#input-pluginurl");
		var pluginList = settingspanel.querySelector(".plugin-list");
		if (pluginUrlInput && pluginList) {
			var url = pluginUrlInput.value;
			pluginUrlInput.value = null;
			var ownlist = BDFDB.loadData("ownlist", this, "ownlist") || [];
			if (!ownlist.includes(url)) {
				ownlist.push(url);
				BDFDB.saveData("ownlist", ownlist, this, "ownlist");
				let entry = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.margintop4 + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis} entryurl">${url}</div></div><div class="${BDFDB.disCN.hovercardbutton} remove-plugin"></div></div>`);
				BDFDB.addChildEventListener(entry, "click", ".remove-plugin", e => {this.removePluginFromOwnList(e);});
				pluginList.appendChild(entry);
			}
		}
	}

	removePluginFromOwnList (e) {
		var entry = e.currentTarget.parentElement;
		var url = entry.querySelector(".entryurl").textContent;
		entry.remove();
		var ownlist = BDFDB.loadData("ownlist", this, "ownlist") || [];
		BDFDB.removeFromArray(ownlist, url);
		BDFDB.saveData("ownlist", ownlist, this, "ownlist");
	}

	removeAllFromOwnList (settingspanel) {
		BDFDB.openConfirmModal(this, "Are you sure you want to remove all added Plugins from your own list?", () => {
			BDFDB.saveData("ownlist", [], this, "ownlist");
			BDFDB.removeEles(settingspanel.querySelector(BDFDB.dotCN.hovercard));
		});
	}

	openPluginRepoModal (options = {}) {
		if (this.loading.is) {
			BDFDB.showToast(`Plugins are still being fetched. Try again in some seconds.`, {type:"danger"});
			return;
		}

		var pluginRepoModal = BDFDB.htmlToElement(this.pluginRepoModalMarkup);
		var tabbar = pluginRepoModal.querySelector(BDFDB.dotCN.tabbar);
		tabbar.parentElement.insertBefore(BDFDB.createSearchBar("small"), tabbar.nextElementSibling);
		var hiddenSettings = BDFDB.loadAllData(this, "hidden");
		pluginRepoModal.querySelector("#input-hideupdated").checked = hiddenSettings.updated || options.showOnlyOutdated;
		pluginRepoModal.querySelector("#input-hideoutdated").checked = hiddenSettings.outdated && !options.showOnlyOutdated;
		pluginRepoModal.querySelector("#input-hidedownloadable").checked = hiddenSettings.downloadable || options.showOnlyOutdated;
		if (!BDFDB.isRestartNoMoreEnabled()) pluginRepoModal.querySelector("#RNMoption").remove();
		else pluginRepoModal.querySelector("#input-rnmstart").checked = BDFDB.loadData("RNMstart", this, "RNMstart");

		if (options.forcedSort && this.sortings.sort[options.forcedSort]) {
			var sortinput = pluginRepoModal.querySelector(".sort-filter " + BDFDB.dotCN.quickselectvalue);
			sortinput.innerText = this.sortings.sort[options.forcedSort];
			sortinput.setAttribute('option', options.forcedSort);
		}
		if (options.forcedOrder && this.sortings.order[options.forcedOrder]) {
			var orderinput = pluginRepoModal.querySelector(".order-filter " + BDFDB.dotCN.quickselectvalue);
			orderinput.innerText = this.sortings.order[options.forcedOrder];
			orderinput.setAttribute('option', options.forcedOrder);
		}

		BDFDB.addChildEventListener(pluginRepoModal, "keyup", BDFDB.dotCN.searchbarinput, () => {
			clearTimeout(pluginRepoModal.searchTimeout);
			pluginRepoModal.searchTimeout = setTimeout(() => {this.sortEntries(pluginRepoModal);},1000);
		});
		BDFDB.addChildEventListener(pluginRepoModal, "click", BDFDB.dotCN.searchbarclear, () => {
			clearTimeout(pluginRepoModal.searchTimeout);
			pluginRepoModal.searchTimeout = setTimeout(() => {this.sortEntries(pluginRepoModal);},1000);
		});
		BDFDB.addChildEventListener(pluginRepoModal, "change", ".hide-checkbox", e => {
			pluginRepoModal.updateHidden = true;
			BDFDB.saveData(e.currentTarget.value, e.currentTarget.checked, this, "hidden");
		});
		BDFDB.addChildEventListener(pluginRepoModal, "change", "#input-rnmstart", e => {
			BDFDB.saveData("RNMstart", e.currentTarget.checked, this, "RNMstart");
		});
		BDFDB.addChildEventListener(pluginRepoModal, "click", ".sort-filter", e => {
			BDFDB.createSortPopout(e.currentTarget, this.sortPopoutMarkup, () => {this.sortEntries(pluginRepoModal);});
		});
		BDFDB.addChildEventListener(pluginRepoModal, "click", ".order-filter", e => {
			BDFDB.createSortPopout(e.currentTarget, this.orderPopoutMarkup, () => {this.sortEntries(pluginRepoModal);});
		});
		BDFDB.addChildEventListener(pluginRepoModal, "click", BDFDB.dotCN.tabbaritem + "[tab=plugins]", e => {
			if (!BDFDB.containsClass(e.currentTarget, BDFDB.disCN.settingsitemselected) && pluginRepoModal.updateHidden) {
				delete pluginRepoModal.updateHidden;
				this.sortEntries(pluginRepoModal);
			}
		});

		let favorites = BDFDB.loadAllData(this, "favorites");
		let container = pluginRepoModal.querySelector(".plugins");
		pluginRepoModal.entries = {};
		for (let url in this.loadedPlugins) {
			let plugin = this.loadedPlugins[url];
			let instPlugin = BDFDB.getPlugin(plugin.getName);
			if (instPlugin && this.getString(instPlugin.getAuthor()).toUpperCase() == plugin.getAuthor.toUpperCase()) plugin.getState = this.getString(instPlugin.getVersion()) != plugin.getVersion ? 1 : 0;
			else plugin.getState = 2;
			let data = {
				url: plugin.url,
				search: (plugin.getName + " " + plugin.getVersion + " " + plugin.getAuthor + " " + plugin.getDescription).toUpperCase(),
				name: plugin.getName,
				version: plugin.getVersion,
				author: plugin.getAuthor,
				description: plugin.getDescription ? plugin.getDescription : "No Description found.",
				fav: favorites[url] ? 0 : 1,
				new: !this.cachedPlugins.includes(url) ? 0 : 1,
				state: plugin.getState
			};
			pluginRepoModal.entries[url] = data;
			this.addEntry(pluginRepoModal, container, data);
		}
		this.sortEntries(pluginRepoModal);

		BDFDB.appendModal(pluginRepoModal);

		pluginRepoModal.querySelector(BDFDB.dotCN.searchbarinput).focus();
	}

	addEntry (pluginRepoModal, container, data) {
		if (!pluginRepoModal || !container || !data) return;
		let entry = BDFDB.htmlToElement(this.pluginEntryMarkup);
		setEntryState(data.state);
		entry.setAttribute("data-name", data.name);
		entry.setAttribute("data-version", data.version);
		entry.setAttribute("data-url", data.url);
		entry.querySelector(BDFDB.dotCN._reponame).innerHTML = data.name;
		entry.querySelector(BDFDB.dotCN._repoversion).innerHTML = data.version;
		entry.querySelector(BDFDB.dotCN._repoauthor).innerHTML = data.author;
		entry.querySelector(BDFDB.dotCN._repodescription).innerHTML = data.description;
		if (data.new == 0) entry.querySelector(BDFDB.dotCN._repoheadertitle).appendChild(BDFDB.htmlToElement(`<span class="newentries-tag ${BDFDB.disCNS.bottag + BDFDB.disCNS.bottagregular + BDFDB.disCN.bottagnametag}" style="background-color: rgb(250, 166, 26) !important; color: white !important; padding: 1px 3px; font-size: 10px; top: -2px;">NEW</span>`));
		let favbutton = entry.querySelector(BDFDB.dotCN.giffavoritebutton);
		BDFDB.toggleClass(favbutton, BDFDB.disCN.giffavoriteselected, data.fav == 0);
		favbutton.addEventListener("click", e => {
			let favorize = data.fav == 1;
			data.fav = favorize ? 0 : 1;
			if (favorize) BDFDB.saveData(data.url, true, this, "favorites");
			else BDFDB.removeData(data.url, this, "favorites");
			pluginRepoModal.entries[data.url] = data;
		});
		let gitbutton = entry.querySelector(".gitIcon");
		gitbutton.addEventListener("click", e => {
			var giturl = null;
			if (data.url.indexOf("https://raw.githubusercontent.com") == 0) {
				var temp = data.url.replace("//raw.githubusercontent", "//github").split("/");
				temp.splice(5, 0, "blob");
				giturl = temp.join("/");
			}
			else if (data.url.indexOf("https://gist.githubusercontent.com/") == 0) {
				giturl = data.url.replace("//gist.githubusercontent", "//gist.github").split("/raw/")[0];
			}
			if (giturl) window.open(giturl, "_blank");
		});
		gitbutton.addEventListener("mouseenter", e => {
			BDFDB.createTooltip("Go to Git", gitbutton, {type:"top",selector:"pluginrepo-giticon-tooltip"});
		});
		let trashbutton = entry.querySelector(".trashIcon");
		trashbutton.addEventListener("click", e => {
			if (BDFDB.containsClass(entry, "outdated", "updated", false)) {
				setEntryState(2);
				this.deletePluginFile(data);
				if (!BDFDB.isRestartNoMoreEnabled()) this.stopPlugin(data);
			}
		});
		trashbutton.addEventListener("mouseenter", e => {
			BDFDB.createTooltip("Delete Pluginfile", trashbutton, {type:"top",selector:"pluginrepo-trashicon-tooltip"});
		});
		entry.querySelector(".btn-download").addEventListener("click", e => {
			setEntryState(0);
			this.downloadPlugin(data);
			if (pluginRepoModal.querySelector("#input-rnmstart").checked) setTimeout(() => {this.startPlugin(data);},3000);
		});

		container.appendChild(entry);

		function setEntryState (state) {
			data.state = state;
			BDFDB.toggleClass(entry, "downloadable", state > 1);
			BDFDB.toggleClass(entry, "outdated", state == 1);
			BDFDB.toggleClass(entry, "updated", state < 1);
			let downloadbutton = entry.querySelector(".btn-download");
			downloadbutton.innerText = state < 1 ? "Updated" : (state > 1 ? "Download" : "Outdated");
			downloadbutton.style.setProperty("background-color", "rgb(" + (state < 1 ? "67,181,129" : (state > 1 ? "114,137,218" : "241,71,71")) + ")", state > 1 ? "" : "important");
			pluginRepoModal.entries[data.url] = data;
		};
	}

	sortEntries (pluginRepoModal) {
		if (!pluginRepoModal || typeof pluginRepoModal.entries != "object") return;

		let container = pluginRepoModal.querySelector(".plugins");
		if (!container) return;

		let searchstring = pluginRepoModal.querySelector(BDFDB.dotCN.searchbarinput).value.replace(/[<|>]/g, "").toUpperCase();

		let entries = pluginRepoModal.entries;
		if (pluginRepoModal.querySelector("#input-hideupdated").checked) 		entries = BDFDB.filterObject(entries, entry => {return entry.state < 1 ? null : entry;});
		if (pluginRepoModal.querySelector("#input-hideoutdated").checked) 		entries = BDFDB.filterObject(entries, entry => {return entry.state == 1 ? null : entry;});
		if (pluginRepoModal.querySelector("#input-hidedownloadable").checked) 	entries = BDFDB.filterObject(entries, entry => {return entry.state > 1 ? null : entry;});
		entries = BDFDB.filterObject(entries, entry => {return entry.search.indexOf(searchstring) > -1 ? entry : null;});

		let sortfilter = pluginRepoModal.querySelector(".sort-filter " + BDFDB.dotCN.quickselectvalue).getAttribute("option");
		entries = BDFDB.sortObject(entries, sortfilter == "new" && !pluginRepoModal.querySelector(".newentries-tag") ? "name" : sortfilter);
		if (pluginRepoModal.querySelector(".order-filter " + BDFDB.dotCN.quickselectvalue).getAttribute("option") == "desc") entries = BDFDB.reverseObject(entries);

		let entrypositions = Object.keys(entries);

		pluginRepoModal.querySelector(".pluginAmount").innerText = "PluginRepo Repository " + entrypositions.length + "/" + Object.keys(this.loadedPlugins).length + " Plugins";

		for (let li of container.children) {
			let pos = entrypositions.indexOf(li.getAttribute("data-url"));
			if (pos > -1) {
				li.querySelectorAll(BDFDB.dotCNC._reponame + BDFDB.dotCNC._repoversion + BDFDB.dotCNC._repoauthor + BDFDB.dotCN._repodescription).forEach(ele => {
					if (searchstring && searchstring.length > 2 || ele.querySelector(BDFDB.dotCN.highlight)) ele.innerHTML = BDFDB.highlightText(ele.innerText, searchstring);
				});
				li.style.setProperty("order", pos, "important");
			}
			else li.style.removeProperty("order");
			BDFDB.toggleEles(li, pos > -1);
		}
	}

	loadPlugins () {
		BDFDB.removeEles("iframe.discordSandbox",".pluginrepo-loadingicon");
		var settings = BDFDB.loadAllData(this, "settings");
		var getPluginInfo, createFrame, runInFrame;
		var frame, framerunning = false, framequeue = [], outdated = 0, newentries = 0, i = 0;
		var tags = ["getName", "getVersion", "getAuthor", "getDescription"];
		var seps = ["\"", "\'", "\`"];
		var newentriesdata = BDFDB.loadAllData(this, "newentriesdata"), ownlist = BDFDB.loadData("ownlist", this, "ownlist") || [];
		this.cachedPlugins = (newentriesdata.urlbase64 ? atob(newentriesdata.urlbase64).split("\n") : []).concat(ownlist);
		BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/PluginRepo/res/PluginList.txt", (error, response, result) => {
			if (!error && result) {
				result = result.replace(/[\r\t]/g, "");
				BDFDB.saveData("urlbase64", btoa(result), this, "newentriesdata");
				this.loadedPlugins = {};
				this.grabbedPlugins = result.split("\n").filter(n => n);
				this.foundPlugins = this.grabbedPlugins.concat(ownlist);
				this.loading = {is:true, timeout:setTimeout(() => {
					clearTimeout(this.loading.timeout);
					if (this.started) {
						if (this.loading.is && this.loading.amount < 4) setTimeout(() => {this.loadPlugins();},10000);
						this.loading = {is: false, timeout:null, amount:this.loading.amount};
					}
				},1200000), amount:this.loading.amount+1};
				var loadingiconwrapper = document.querySelector(BDFDB.dotCN.app + "> .repo-loadingwrapper");
				if (!loadingiconwrapper) {
					loadingiconwrapper = BDFDB.htmlToElement(`<div class="repo-loadingwrapper"></div>`);
					document.querySelector(BDFDB.dotCN.app).appendChild(loadingiconwrapper);
				}
				var loadingicon = BDFDB.htmlToElement(this.pluginRepoIconMarkup);
				BDFDB.addClass(loadingicon, "pluginrepo-loadingicon");
				loadingicon.addEventListener("mouseenter", () => {BDFDB.createTooltip(this.getLoadingTooltipText(),loadingicon,{type:"left",delay:500,style:"max-width:unset;",selector:"pluginrepo-loading-tooltip"});})
				loadingiconwrapper.appendChild(loadingicon);

				createFrame().then(() => {
					getPluginInfo(() => {
						if (!this.started) {
							clearTimeout(this.loading.timeout);
							BDFDB.removeEles(frame);
							if (frame && frame.messageReceived) window.removeEventListener("message", frame.messageReceived);
							return;
						}
						var finishCounter = 0, finishInterval = setInterval(() => { 
							if ((framequeue.length == 0 && !framerunning) || finishCounter > 300 || !this.loading.is) {
								clearInterval(finishInterval);
								BDFDB.removeEles(frame, loadingicon, ".pluginrepo-loadingicon");
								if (frame && frame.messageReceived) window.removeEventListener("message", frame.messageReceived);
								if (!loadingiconwrapper.firstChild) BDFDB.removeEles(loadingiconwrapper);
								clearTimeout(this.loading.timeout);
								this.loading = {is:false, timeout:null, amount:this.loading.amount};
								console.log(`%c[${this.name}]%c`, "color: #3a71c1; font-weight: 700;", "", "Finished fetching Plugins.");
								if (document.querySelector(".bd-pluginrepobutton")) BDFDB.showToast(`Finished fetching Plugins.`, {type:"success"});
								if ((settings.notifyOutdated || settings.notifyOutdated == undefined) && outdated > 0) {
									var oldbarbutton = document.querySelector(".pluginrepo-outdate-notice " + BDFDB.dotCN.noticedismiss);
									if (oldbarbutton) oldbarbutton.click();
									var bar = BDFDB.createNotificationsBar(`${outdated} of your Plugins ${outdated == 1 ? "is" : "are"} outdated. Check:`,{type:"danger",btn:"PluginRepo",selector:"pluginrepo-notice pluginrepo-outdate-notice", customicon:this.pluginRepoIconMarkup.replace(/#7289da/gi,"#FFF").replace(/#7f8186/gi,"#B9BBBE")});
									bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", e => {
										this.openPluginRepoModal({showOnlyOutdated:true});
										bar.querySelector(BDFDB.dotCN.noticedismiss).click();
									});
								}
								if ((settings.notifyNewentries || settings.notifyNewentries == undefined) && newentries > 0) {
									var oldbarbutton = document.querySelector(".pluginrepo-newentries-notice " + BDFDB.dotCN.noticedismiss);
									if (oldbarbutton) oldbarbutton.click();
									var bar = BDFDB.createNotificationsBar(`There ${newentries == 1 ? "is" : "are"} ${newentries} new Plugin${newentries == 1 ? "" : "s"} in the Repo. Check:`,{type:"success",btn:"PluginRepo",selector:"pluginrepo-notice pluginrepo-newentries-notice", customicon:this.pluginRepoIconMarkup.replace(/#7289da/gi,"#FFF").replace(/#7f8186/gi,"#B9BBBE")});
									bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", e => {
										this.openPluginRepoModal({forcedSort:"new",forcedOrder:"asc"});
										bar.querySelector(BDFDB.dotCN.noticedismiss).click();
									});
								}
								if (BDFDB.myData.id == "278543574059057154") {
									let wrongUrls = [];
									for (let url of this.foundPlugins) if (url && !this.loadedPlugins[url] && !wrongUrls.includes(url)) wrongUrls.push(url);
									if (wrongUrls.length > 0) {
										var bar = BDFDB.createNotificationsBar(`PluginRepo: ${wrongUrls.length} Plugin${wrongUrls.length > 1 ? "s" : ""} could not be loaded.`, {type:"danger",btn:"List",selector:"pluginrepo-notice pluginrepo-fail-notice", customicon:this.pluginRepoIconMarkup.replace(/#7289da/gi,"#FFF").replace(/#7f8186/gi,"#B9BBBE")});
										bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", e => {
											var toast = BDFDB.showToast(wrongUrls.join("\n"),{type:"error"});
											toast.style.overflow = "hidden";
											console.log(wrongUrls.length == 1 ? wrongUrls[0] : wrongUrls);
										});
									}
								}
							}
							else finishCounter++;
						},1000);
					});
				});
			}
		});

		getPluginInfo = (callback) => {
			if (i >= this.foundPlugins.length || !this.started || !this.loading.is) {
				callback();
				return;
			}
			let url = this.foundPlugins[i];
			BDFDB.LibraryRequires.request(url, (error, response, body) => {
				if (!response) {
					if (url && BDFDB.getAllIndexes(this.foundPlugins, url).length < 2) this.foundPlugins.push(url);
				}
				else if (body && body.indexOf("404: Not Found") != 0 && response.statusCode == 200) {
					let plugin = {};
					let bodycopy = body;
					if (body.length / body.split("\n").length > 1000) {
						/* code is minified -> add newlines */
						bodycopy = body.replace(/}/g, "}\n");
					}
					let configreg = /(module\.exports|config)\s*=\s*\{\n*\r*\t*["'`]*info["'`]*\s*:\s*/i.exec(bodycopy);
					if (url != "https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/PluginRepo/PluginRepo.plugin.js" && configreg) {
						try {
							let config = JSON.parse('{"info":' + bodycopy.substring(configreg.index).split(configreg[0])[1].split("};")[0] + '}');
							plugin.getName = config.info.name.charAt(0).toUpperCase() + config.info.name.slice(1);
							plugin.getDescription = config.info.description.charAt(0).toUpperCase() + config.info.description.slice(1);
							plugin.getVersion = config.info.version;
							plugin.getAuthor = "";
							if (typeof config.info.author == "string") plugin.getAuthor = config.info.author.charAt(0).toUpperCase() + config.info.author.slice(1);
							else if (typeof config.info.authors == "string") plugin.getAuthor = config.info.authors.charAt(0).toUpperCase() + config.info.authors.slice(1);
							else if (Array.isArray(config.info.authors)) for (let author of config.info.authors) {
								plugin.getAuthor += (plugin.getAuthor + (plugin.getAuthor ? ", " : "") + (typeof author == "string" ? author : author.name));
							}
						}
						catch (err) {}
					}
					else {
						for (let tag of tags) {
							let result = new RegExp(tag + "[\\s|\\t|\\n|\\r|=|>|_|:|function|\(|\)|\{|return]*([\"|\'|\`]).*\\1","gi").exec(bodycopy);
							if (!result) result = new RegExp("get " + tag.replace("get", "").toLowerCase() + "[\\s|\\t|\\n|\\r|=|>|_|:|function|\(|\)|\{|return]*([\"|\'|\`]).*\\1","gi").exec(bodycopy);
							if (result) {
								let separator = result[1];
								result = result[0].replace(new RegExp("\\\\" + separator, "g"), separator).split(separator);
								if (result.length > 2) {
									result = result.slice(1, -1).join(separator).replace(/\\n/g, "<br>").replace(/\\/g, "");
									result = tag != "getVersion" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
									plugin[tag] = result ? result.trim() : result;
								}
							}
						}
					}
					let valid = true;
					for (let tag of tags) if (!plugin[tag] || plugin[tag].length > 10000) valid = false;
					if (valid) {
						plugin.url = url;
						this.loadedPlugins[url] = plugin;
						let instPlugin = BDFDB.getPlugin(plugin.getName);
						if (instPlugin && this.getString(instPlugin.getAuthor()).toUpperCase() == plugin.getAuthor.toUpperCase() && this.getString(instPlugin.getVersion()) != plugin.getVersion && PluginUpdates && PluginUpdates.plugins && !PluginUpdates.plugins[url]) outdated++;
						if (!this.cachedPlugins.includes(url)) newentries++;
					}
					else if (frame && frame.contentWindow) {
						framequeue.push({body, url});
						runInFrame();
					}
				}
				i++;
				var loadingtooltip = document.querySelector(".pluginrepo-loading-tooltip");
				if (loadingtooltip) {
					BDFDB.setInnerText(loadingtooltip, this.getLoadingTooltipText());
					BDFDB.updateTooltipPosition(loadingtooltip);
				}
				getPluginInfo(callback);
			});
		}

		createFrame = () => {
			var markup = this.frameMarkup;
			return new Promise(function(callback) {
				frame = BDFDB.htmlToElement(markup);
				frame.startTimeout = setTimeout(() => {
					callback();
				},600000);
				frame.messageReceived = e => {
					if (!document.contains(frame)) {
						window.removeEventListener("message", frame.messageReceived);
					}
					else if (typeof e.data === "object" && e.data.origin == "DiscordPreview") {
						switch (e.data.reason) {
							case "OnLoad":
								frame.contentWindow.postMessage({origin:"PluginRepo",reason:"OnLoad",classes:JSON.stringify(BDFDB.DiscordClasses),classmodules:JSON.stringify(BDFDB.DiscordClassModules)},"*");
								callback();
								break;
						}
					}
				};
				window.addEventListener("message", frame.messageReceived);

				document.body.appendChild(frame);
			});
		}

		runInFrame = () => {
			if (framerunning) return;
			let framedata = framequeue.shift();
			if (!framedata) return;
			framerunning = true;
			let {body, url} = framedata;
			let name = body.replace(/\s*:\s*/g, ":").split('"name":"');
			if (name.length > 1) {
				name = name[1].split('"')[0];
				var processResult = plugin => {
					if (BDFDB.isObject(plugin)) {
						plugin.url = url;
						this.loadedPlugins[url] = plugin;
						let instPlugin = BDFDB.getPlugin(plugin.getName);
						if (instPlugin && this.getString(instPlugin.getAuthor()).toUpperCase() == plugin.getAuthor.toUpperCase() && this.getString(instPlugin.getVersion()) != plugin.getVersion) outdated++;
						if (!this.cachedPlugins.includes(url)) newentries++;
					}
					framerunning = false;
					runInFrame();
				};
				var evalResultReceived = e => {
					if (typeof e.data === "object" && e.data.origin == "DiscordPreview") {
						switch (e.data.reason) {
							case "EvalResult":
								window.removeEventListener("message", evalResultReceived);
								processResult(e.data.result);
								break;
						}
					}
				};
				window.addEventListener("message", evalResultReceived);
				frame.contentWindow.postMessage({origin:"PluginRepo",reason:"Eval",jsstring:`
					try {
						${body}
						var p = new ${name}();
						var data = {
							"getName":getString(p.getName()),
							"getAuthor":getString(p.getAuthor()),
							"getVersion":getString(p.getVersion()),
							"getDescription":getString(p.getDescription())
						};
						window.evalResult = data;
					}
					catch (err) {
						window.evalResult = null;
					}`
				},"*");
			}
		}
	}

	getLoadingTooltipText () {
		return `Loading PluginRepo - [${Object.keys(this.loadedPlugins).length}/${Object.keys(this.grabbedPlugins).length}]`;
	}

	getString (obj) {
		var string = "";
		if (typeof obj == "string") string = obj;
		else if (obj && obj.props) {
			if (typeof obj.props.children == "string") string = obj.props.children;
			else if (Array.isArray(obj.props.children)) for (let c of obj.props.children) string += typeof c == "string" ? c : this.getString(c);
		}
		return string;
	}

	checkForNewPlugins () {
		BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/PluginRepo/res/PluginList.txt", (error, response, result) => {
			if (response && !BDFDB.equals(result.replace(/\t|\r/g, "").split("\n").filter(n => n), this.grabbedPlugins)) {
				this.loading = {is:false, timeout:null, amount:0};
				this.loadPlugins();
			}
		});
	}

	downloadPlugin (data) {
		BDFDB.LibraryRequires.request(data.url, (error, response, body) => {
			if (error) BDFDB.showToast(`Unable to download Plugin "${plugin.getName}".`, {type:"danger"});
			else this.createPluginFile(data.url.split("/").pop(), body);
		});
	}

	createPluginFile (filename, content) {
		BDFDB.LibraryRequires.fs.writeFile(BDFDB.LibraryRequires.path.join(BDFDB.getPluginsFolder(), filename), content, (error) => {
			if (error) BDFDB.showToast(`Unable to save Plugin "${filename}".`, {type:"danger"});
			else BDFDB.showToast(`Successfully saved Plugin "${filename}".`, {type:"success"});
		});
	}

	startPlugin (data) {
		if (BDFDB.isPluginEnabled(data.name) == false) {
			window.pluginModule.startPlugin(data.name);
			console.log(`%c[${this.name}]%c`, "color: #3a71c1; font-weight: 700;", "", "Started Plugin " + data.name + ".");
		}
	}

	deletePluginFile (data) {
		let filename = data.url.split("/").pop();
		BDFDB.LibraryRequires.fs.unlink(BDFDB.LibraryRequires.path.join(BDFDB.getPluginsFolder(), filename), (error) => {
			if (error) BDFDB.showToast(`Unable to delete Plugin "${filename}".`, {type:"danger"});
			else BDFDB.showToast(`Successfully deleted Plugin "${filename}".`);
		});
	}

	stopPlugin (data) {
		if (BDFDB.isPluginEnabled(data.name) == true) {
			window.pluginModule.stopPlugin(data.name);
			console.log(`%c[${this.name}]%c`, "color: #3a71c1; font-weight: 700;", "", "Stopped Plugin " + data.name + ".");
		}
	}
}
