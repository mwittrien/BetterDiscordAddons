//META{"name":"PluginRepo"}*// 

class PluginRepo {
	initConstructor () {
		this.patchModules = {
			"V2C_List":"componentDidMount"
		};
		
		this.sortings = {
			sort: {
				name:			"Name",
				author:			"Author",
				version:		"Version",
				description:	"Description",
				state:			"Update State",
				fav:			"Favorites"
			},
			order: {
				asc:			"Ascending",
				desc:			"Descending"
			}
		};
		
		this.loading = {is:false, timeout:null, amount:0};
		
		this.grabbedPlugins = [];
		this.foundPlugins = [];
		this.loadedPlugins = {};
		
		this.updateInterval;
		
		this.settingsContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitem} pluginrepo-item">
				<span>Plugin Repo</span>
				<div class="${BDFDB.disCN.contextmenuhint}"></div>
			</div>`;
			
		this.pluginRepoLoadingIconMarkup =
			`<svg class="pluginrepo-loadingicon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="40" height="30" viewBox="0 0 483 382">
				<path d="M0.000 183.023 L 0.000 366.046 46.377 366.046 L 92.754 366.046 92.754 312.629 L 92.754 259.213 127.223 259.213 C 174.433 259.213,187.432 257.146,210.766 245.926 C 311.105 197.681,301.344 41.358,195.859 7.193 C 173.603 -0.015,173.838 0.000,80.846 0.000 L 0.000 0.000 0.000 183.023 M157.615 88.195 C 193.007 97.413,198.827 152.678,166.407 171.674 C 158.993 176.019,155.494 176.398,122.807 176.398 L 92.754 176.398 92.754 131.677 L 92.754 86.957 122.807 86.957 C 146.807 86.957,153.819 87.206,157.615 88.195" stroke="none" fill="#7289da" fill-rule="evenodd"></path>
				<path d="M226.647 3.824 C 258.085 21.580,282.721 54.248,291.095 89.281 C 292.183 93.834,293.041 95.659,294.560 96.655 C 310.880 107.348,312.400 140.701,297.286 156.464 C 293.685 160.221,293.134 161.348,291.162 169.006 C 282.026 204.468,259.916 235.185,230.701 253.002 C 229.548 253.705,235.510 262.261,270.237 309.731 L 311.131 365.631 355.565 365.846 L 400.000 366.060 400.000 348.309 L 400.000 330.557 364.338 285.630 L 328.676 240.703 333.494 238.892 C 373.356 223.907,395.248 189.691,399.313 136.020 C 404.504 67.495,372.510 19.710,311.375 4.675 C 294.592 0.548,287.694 -0.000,252.482 0.000 L 219.876 0.000 226.647 3.824 M202.899 265.964 C 183.869 272.635,168.536 274.960,139.752 275.540 L 116.770 276.003 116.770 321.024 L 116.770 366.046 163.975 366.046 L 211.180 366.046 211.180 314.700 C 211.180 286.460,210.901 263.386,210.559 263.425 C 210.217 263.464,206.770 264.607,202.899 265.964" stroke="none" fill="#7f8186" fill-rule="evenodd"></path>
			</svg>`;

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
			`<span class="${this.getName()}-modal Repo-modal DevilBro-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCN.modalsub}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto; padding: 20px 20px 0 20px;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.headertitle + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.defaultcolor + BDFDB.disCNS.h4defaultmargin + BDFDB.disCN.marginreset} pluginAmount">Plugin Repository</h4>
									<div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div>
								</div>
								<svg class="${BDFDB.disCNS.modalclose + BDFDB.disCN.flexchild}" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
									<g fill="none" fill-rule="evenodd">
										<path d="M0 0h12v12H0"></path>
										<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
									</g>
								</svg>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.modalheader + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto; padding: 10px 20px 0px 20px;">
								<div tab="plugins" class="tab selected">Plugins</div>
								<div tab="settings" class="tab">Settings</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.searchbar + BDFDB.disCN.size14}" style="flex: 1 1 auto; margin: -15px 5px 0 0;">
									<input class="${BDFDB.disCN.searchbarinput}" value="" placeholder="Search for ..." style="flex: 1 1 auto;">
									<div class="${BDFDB.disCN.searchbariconwrap}">
										<i class="${BDFDB.disCNS.searchbaricon + BDFDB.disCNS.searchbareyeglass + BDFDB.disCN.searchbarvisible}"/>
										<i class="${BDFDB.disCNS.searchbaricon + BDFDB.disCN.searchbarclear}"/>
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.quickselect}" style="padding-bottom: 15px;">
									<div class="${BDFDB.disCN.quickselectlabel}">Sort by:</div>
									<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.quickselectclick} sort-filter" style="flex: 0 0 auto;">
										<div option="${Object.keys(this.sortings.sort)[0]}" class="${BDFDB.disCN.quickselectvalue}">${this.sortings.sort[Object.keys(this.sortings.sort)[0]]}</div>
										<div class="${BDFDB.disCN.quickselectarrow}"></div>
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.quickselect}" style="padding-bottom: 15px;">
									<div class="${BDFDB.disCN.quickselectlabel}">Order:</div>
									<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.quickselectclick} order-filter" style="flex: 0 0 auto;">
										<div option="${Object.keys(this.sortings.order)[0]}" class="${BDFDB.disCN.quickselectvalue}">${this.sortings.order[Object.keys(this.sortings.order)[0]]}</div>
										<div class="${BDFDB.disCN.quickselectarrow}"></div>
									</div>
								</div>
							</div>
							<div tab="plugins" class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline} tab-content">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner}">
									<ul class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN._repolist} plugins" style="flex: 1 1 auto; display: flex !important; display: flex-direction: column !important;"></ul>
								</div>
							</div>
							<div tab="settings" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalsubinner} tab-content" style="flex: 1 1 auto;">
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto; width: 800px;">To expierence PluginRepo in the best way. I would recommend you to enable BD intern reload function, that way all downloaded files are loaded into Discord without the need to reload.</h3>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Hide updated Plugins.</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" value="updated" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} hide-checkbox" id="input-hideupdated">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Hide outdated Plugins.</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" value="outdated" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} hide-checkbox" id="input-hideoutdated">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Hide downloadable Plugins.</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" value="downloadable" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} hide-checkbox" id="input-hidedownloadable">
									</div>
								</div>
								<div id="RNMoption" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Start Plugin after Download (Automatic Loading needed)</h3>
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
					<div class="${BDFDB.disCN.contextmenu} quickSelectPopout">
						<div class="${BDFDB.disCN.contextmenuitemgroup}">
							${Object.keys(this.sortings.sort).map((key, i) => `<div option="${key}" class="${BDFDB.disCN.contextmenuitem}">${this.sortings.sort[key]}</div>`).join("")}
						</div>
					</div>
				</div>
			</div>`;
			
		this.orderPopoutMarkup =
			`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottomright + BDFDB.disCN.popoutnoshadow} pluginrepo-order-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="${BDFDB.disCN.contextmenu} quickSelectPopout">
						<div class="${BDFDB.disCN.contextmenuitemgroup}">
							${Object.keys(this.sortings.order).map((key, i) => `<div option="${key}" class="${BDFDB.disCN.contextmenuitem}">${this.sortings.order[key]}</div>`).join("")}
						</div>
					</div>
				</div>
			</div>`;
		
		this.css = `
			${BDFDB.dotCN.app} > .repo-loadingwrapper {
				position: absolute;
				bottom: 0;
				right: 0;
				z-index: 1000;
				animation: repo-loadingwrapper-fade 3s infinite ease;
			}
			@keyframes repo-loadingwrapper-fade {
				from {opacity: 0.1;}
				50% {opacity: 0.9;}
				to {opacity: 0.1;}
			}
			.${this.getName()}-modal.Repo-modal ${BDFDB.dotCN.modalinner} {
				min-height: 100%;
				min-width: 800px;
				width: 50%;
			}
			.${this.getName()}-modal .pluginEntry ${BDFDB.dotCN._repocontrols} > * {
				margin-right: 5px !important;
			}
			.${this.getName()}-modal .pluginEntry svg[fill="currentColor"],
			.${this.getName()}-modal .pluginEntry ${BDFDB.dotCN.giffavoritebutton}:not(${BDFDB.dotCN.giffavoriteselected}) {
				color: #72767d !important;
			}
			${BDFDB.dotCN.themedark} .${this.getName()}-modal .pluginEntry svg[fill="currentColor"],
			${BDFDB.dotCN.themedark} .${this.getName()}-modal .pluginEntry ${BDFDB.dotCN.giffavoritebutton}:not(${BDFDB.dotCN.giffavoriteselected}) {
				color: #dcddde !important;
			}
			.${this.getName()}-modal .pluginEntry.downloadable .trashIcon {
				opacity: 0 !important;
				pointer-events: none !important;
			}`;
	}

	getName () {return "PluginRepo";}

	getDescription () {return "Allows you to look at all plugins from the plugin repo and download them on the fly. Repo button is in the plugins settings.";}

	getVersion () {return "1.6.5";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Add Plugin:</h3><input type="text" placeholder="Insert Raw Github Link of Plugin (https://raw.githubusercontent.com/...)" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-pluginurl" style="flex: 1 1 auto;"><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-add btn-addplugin" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div>`;
		settingshtml += `<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Your additional Plugin List:</h3><div class="DevilBro-settings-inner-list plugin-list ${BDFDB.disCN.marginbottom8}">`;
		var ownlist = BDFDB.loadData("ownlist", this, "ownlist") || [];
		for (let url of ownlist) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.margintop4 + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis} entryurl">${url}</div></div><div class="${BDFDB.disCN.hovercardbutton} remove-plugin"></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Force all Plugins to be fetched again.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} refresh-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Refresh</div></button></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Remove all added Plugins from your own list.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} remove-all" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".btn-addplugin", () => {this.addPluginToOwnList(settingspanel);})
			.on("keyup", "#input-pluginurl", (e) => {if (e.which == 13) this.addPluginToOwnList(settingspanel);})
			.on("click", ".remove-plugin", (e) => {this.removePluginFromOwnList(e);})
			.on("click", ".remove-all", () => {this.removeAllFromOwnList();})
			.on("click", ".refresh-button", () => {
				this.loading = {is:false, timeout:null, amount:0};
				this.loadPlugins();
			});
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDFDB === "object") {
			BDFDB.loadMessage(this);
						
			this.loadPlugins();
			
			this.updateInterval = setInterval(() => {this.checkForNewPlugins();},1000*60*30);
			
			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDFDB === "object") {
			clearInterval(this.updateInterval);
			clearTimeout(this.loading.timeout);
			
			BDFDB.removeEles("webview[webview-pluginrepo]",".pluginrepo-notice",".bd-pluginrepobutton",".pluginrepo-loadingicon",BDFDB.dotCN.app + " > .repo-loadingwrapper:empty");
			
			BDFDB.unloadMessage(this);
		}
	}

	
	// begin of own functions
	
	onUserSettingsCogContextMenu (instance, menu) {
		let observer = new MutationObserver(changes => {
			changes.forEach(change => {
				if (change.addedNodes) change.addedNodes.forEach(node => {
					if (node.tagName && node.classList && node.className.includes("plugin-context-menu") && !node.querySelector(".pluginrepo-item")) {
						let items = node.querySelectorAll(BDFDB.dotCN.contextmenuitem);
						$(this.settingsContextEntryMarkup)
							.on("click", () => {
								if (!this.loading.is) instance._reactInternalFiber.return.memoizedProps.closeContextMenu();
								this.openPluginRepoModal();
							})
							.insertAfter(items[items.length-1]);
						node.style.setProperty("top", (menu.getBoundingClientRect().top - node.getBoundingClientRect().height + menu.getBoundingClientRect().height) + "px");
					}
				});
			});
		});
		observer.observe(menu, {childList: true, subtree:true});
	}
	
	processV2CList (instance, wrapper) {
		if (!document.querySelector(".bd-pluginrepobutton") && window.PluginUpdates && window.PluginUpdates.plugins && instance._reactInternalFiber.key && instance._reactInternalFiber.key.split("-")[0] == "plugin") {
			var folderbutton = document.querySelector(BDFDB.dotCN._repofolderbutton);
			if (folderbutton) {
				var repoButton = document.createElement("button");
				repoButton.className = BDFDB.disCN._repofolderbutton + " bd-pluginrepobutton";
				repoButton.innerText = "PluginRepo";
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
				$(`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.margintop4 + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis} entryurl">${url}</div></div><div class="${BDFDB.disCN.hovercardbutton} remove-plugin"></div></div>`).appendTo(pluginList);
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
	
	removeAllFromOwnList () {
		BDFDB.openConfirmModal(this, "Are you sure you want to remove all added Plugins from your own list?", () => {
			BDFDB.saveData("ownlist", [], this, "ownlist");
			BDFDB.removeEles("." + this.getName() + "-settings " + BDFDB.dotCN.hovercard);
		});
	}
	
	openPluginRepoModal (showOnlyOutdated = false) {
		if (this.loading.is) {
			BDFDB.showToast(`Plugins are still being fetched. Try again in some seconds.`, {type:"danger"});
			return;
		}
		var pluginRepoModal = $(this.pluginRepoModalMarkup);
		var hiddenSettings = Object.assign({},BDFDB.loadAllData(this, "hidden"));
		pluginRepoModal.find("#input-hideupdated").prop("checked", hiddenSettings.updated || showOnlyOutdated);
		pluginRepoModal.find("#input-hideoutdated").prop("checked", hiddenSettings.outdated && !showOnlyOutdated);
		pluginRepoModal.find("#input-hidedownloadable").prop("checked", hiddenSettings.downloadable || showOnlyOutdated);
		if (!BDFDB.isRestartNoMoreEnabled()) pluginRepoModal.find("#RNMoption").remove();
		else pluginRepoModal.find("#input-rnmstart").prop("checked", BDFDB.loadData("RNMstart", this, "settings"));
		pluginRepoModal = pluginRepoModal[0];
		$(pluginRepoModal)
			.on("keyup." + this.getName(), BDFDB.dotCN.searchbarinput, () => {
				clearTimeout(pluginRepoModal.searchTimeout);
				pluginRepoModal.searchTimeout = setTimeout(() => {this.sortEntries(pluginRepoModal);},1000);
			})
			.on("click." + this.getName(), BDFDB.dotCN.searchbarclear + BDFDB.dotCN.searchbarvisible, () => {
				clearTimeout(pluginRepoModal.searchTimeout);
				pluginRepoModal.searchTimeout = setTimeout(() => {this.sortEntries(pluginRepoModal);},1000);
			})
			.on("change." + this.getName(), ".hide-checkbox", (e) => {
				BDFDB.saveData(e.currentTarget.value, e.currentTarget.checked, this, "hidden");
			})
			.on("change." + this.getName(), "#input-rnmstart", (e) => {
				BDFDB.saveData("RNMstart", e.currentTarget.checked, this, "settings");
			})
			.on("click." + this.getName(), ".sort-filter", (e) => {
				this.openSortPopout(e, this.sortPopoutMarkup, pluginRepoModal);
			})
			.on("click." + this.getName(), ".order-filter", (e) => {
				this.openSortPopout(e, this.orderPopoutMarkup, pluginRepoModal);
			})
			.on("click." + this.getName(), ".tab[tab=plugins]:not(.selected)", (e) => {
				var newHiddenSettings = BDFDB.loadAllData(this, "hidden");
				if (!BDFDB.equals(newHiddenSettings, hiddenSettings)) {
					hiddenSettings = Object.assign({},newHiddenSettings);
					this.sortEntries(pluginRepoModal);
				}
			});
		
		let favorites = BDFDB.loadAllData(this, "favorites");
		let container = pluginRepoModal.querySelector(".plugins");
		pluginRepoModal.entries = {};
		for (let url in this.loadedPlugins) {
			let plugin = this.loadedPlugins[url];
			let instPlugin = window.bdplugins[plugin.getName] ? window.bdplugins[plugin.getName].plugin : null;
			if (instPlugin && instPlugin.getAuthor().toUpperCase() == plugin.getAuthor.toUpperCase()) plugin.getState = instPlugin.getVersion() != plugin.getVersion ? 1 : 0;
			else plugin.getState = 2;
			plugin.getFav = favorites[url] ? 0 : 1;
			let data = {
				url: plugin.url,
				search: (plugin.getName + " " + plugin.getVersion + " " + plugin.getAuthor + " " + plugin.getDescription).toUpperCase(),
				name: plugin.getName,
				version: plugin.getVersion,
				author: plugin.getAuthor,
				description: plugin.getDescription ? plugin.getDescription : "No Description found.",
				fav: plugin.getFav,
				state: plugin.getState
			};
			pluginRepoModal.entries[url] = data;
			this.addEntry(pluginRepoModal, container, data);
		}
		this.sortEntries(pluginRepoModal);
			
		BDFDB.appendModal(pluginRepoModal);
	}
	
	addEntry (pluginRepoModal, container, data) {
		if (!pluginRepoModal || !container || !data) return;
		let entry = $(this.pluginEntryMarkup)[0];
		entry.querySelector(BDFDB.dotCN.giffavoritebutton).classList.toggle(BDFDB.disCN.giffavoriteselected, data.fav == 0);
		setEntryState(data.state);
		entry.setAttribute("data-name", data.name);
		entry.setAttribute("data-version", data.version);
		entry.setAttribute("data-url", data.url);
		entry.querySelector(BDFDB.dotCN._reponame).innerHTML = data.name;
		entry.querySelector(BDFDB.dotCN._repoversion).innerHTML = data.version;
		entry.querySelector(BDFDB.dotCN._repoauthor).innerHTML = data.author;
		entry.querySelector(BDFDB.dotCN._repodescription).innerHTML = data.description;
		$(entry)
			.on("click." + this.getName(), BDFDB.dotCN.giffavoritebutton, (e) => {
				let favorize = data.fav == 1;
				data.fav = favorize ? 0 : 1;
				if (favorize) BDFDB.saveData(data.url, true, this, "favorites");
				else BDFDB.removeData(data.url, this, "favorites");
				pluginRepoModal.entries[data.url] = data;
			})
			.on("click." + this.getName(), ".gitIcon", (e) => {
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
			})
			.on("click." + this.getName(), ".trashIcon", () => {
				if (entry.classList.contains("outdated") || entry.classList.contains("updated")) {
					setEntryState(2);
					this.deletePluginFile(data);
					if (!BDFDB.isRestartNoMoreEnabled()) this.stopPlugin(data);
				}
			})
			.on("click." + this.getName(), ".btn-download", () => {
				setEntryState(0);
				this.downloadPlugin(data);
				if (pluginRepoModal.querySelector("#input-rnmstart").checked) setTimeout(() => {this.startPlugin(data);},3000);
			})
			.on("mouseenter." + this.getName(), BDFDB.dotCN.giffavoritebutton, (e) => {
				BDFDB.createTooltip("Favorize", e.currentTarget, {type:"top",selector:"pluginrepo-favicon-tooltip"});
			})
			.on("mouseenter." + this.getName(), ".gitIcon", (e) => {
				BDFDB.createTooltip("Go to Git", e.currentTarget, {type:"top",selector:"pluginrepo-giticon-tooltip"});
			})
			.on("mouseenter." + this.getName(), ".trashIcon", (e) => {
				BDFDB.createTooltip("Delete Pluginfile", e.currentTarget, {type:"top",selector:"pluginrepo-trashicon-tooltip"});
			});
			
		container.appendChild(entry);
			
		function setEntryState (state) {
			data.state = state;
			entry.classList.toggle("downloadable", state > 1);
			entry.classList.toggle("outdated", state == 1);
			entry.classList.toggle("updated", state < 1);
			let downloadbutton = entry.querySelector(".btn-download");
			downloadbutton.innerText = state < 1 ? "Updated" : (state > 1 ? "Download" : "Outdated");
			downloadbutton.style.setProperty("background-color", "rgb(" + (state < 1 ? "67,181,129" : (state > 1 ? "114,137,218" : "241,71,71")) + ")", "important");
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
		
		entries = BDFDB.sortObject(entries, pluginRepoModal.querySelector(".sort-filter " + BDFDB.dotCN.quickselectvalue).getAttribute("option"));
		if (pluginRepoModal.querySelector(".order-filter " + BDFDB.dotCN.quickselectvalue).getAttribute("option") == "desc") entries = BDFDB.reverseObject(entries);
		
		let entrypositions = Object.keys(entries);
		
		pluginRepoModal.querySelector(".pluginAmount").innerText = "PluginRepo Repository " + entrypositions.length + "/" + Object.keys(this.loadedPlugins).length + " Plugins";
		
		for (let li of container.children) {
			let pos = entrypositions.indexOf(li.getAttribute("data-url"));
			if (pos > -1) {
				li.querySelectorAll(BDFDB.dotCNC._reponame + BDFDB.dotCNC._repoversion + BDFDB.dotCNC._repoauthor + BDFDB.dotCN._repodescription).forEach(ele => {
					if (searchstring || ele.querySelector(".highlight")) ele.innerHTML = BDFDB.highlightText(ele.innerText, searchstring); 
				});
				li.style.removeProperty("display");
				li.style.setProperty("order", pos, "important");
			}
			else { 
				li.style.setProperty("display", "none", "important");
				li.style.removeProperty("order");
			}
		}
	}
	
	openSortPopout (e, markup, pluginRepoModal) {
		var wrapper = e.currentTarget;
		if (wrapper.classList.contains("popout-open")) return;
		wrapper.classList.add("popout-open");
		var value = $(wrapper).find(BDFDB.dotCN.quickselectvalue);
		var popout = $(markup);
		$(BDFDB.dotCN.popouts).append(popout)
			.off("click", BDFDB.dotCN.contextmenuitem)
			.on("click", BDFDB.dotCN.contextmenuitem, (e2) => {
				value.text($(e2.currentTarget).text());
				value.attr("option", $(e2.currentTarget).attr("option"));
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				this.sortEntries(pluginRepoModal);
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			});
			
		popout
			.css("left", $(wrapper).offset().left + $(wrapper).outerWidth() + "px")
			.css("top", $(wrapper).offset().top + value.outerHeight() + "px")
			.find(BDFDB.dotCN.contextmenu).addClass(BDFDB.getDiscordTheme());
			
		$(document).on("mousedown.sortpopout" + this.getName(), (e2) => {
			if (popout.has(e2.target).length == 0) {
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			}
		});
	}
	
	loadPlugins () {
		var getPluginInfo, createWebview, runInWebview;
		var webview, webviewrunning = false, webviewqueue = [], outdated = 0, i = 0;
		var tags = ["getName", "getVersion", "getAuthor", "getDescription"];
		var seps = ["\"", "\'", "\`"];
		let request = require("request");
		request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/PluginRepo/res/PluginList.txt", (error, response, result) => {
			if (response) {
				this.loadedPlugins = {};
				this.grabbedPlugins = result.split("\n");
				this.foundPlugins = this.grabbedPlugins.concat(BDFDB.loadData("ownlist", this, "ownlist") || []);
				this.loading = {is:true, timeout:setTimeout(() => {
					clearTimeout(this.loading.timeout);
					if (this.started) {
						if (this.loading.is && this.loading.amount < 4) setTimeout(() => {this.loadPlugins();},10000);
						this.loading = {is: false, timeout:null, amount:this.loading.amount};
					}
				},1200000), amount:this.loading.amount+1};
				var loadingiconwrapper = document.querySelector(BDFDB.dotCN.app + "> .repo-loadingwrapper");
				if (!loadingiconwrapper) {
					loadingiconwrapper = document.createElement("div");
					loadingiconwrapper.className = "repo-loadingwrapper";
					document.querySelector(BDFDB.dotCN.app).appendChild(loadingiconwrapper);
				}
				$(this.pluginRepoLoadingIconMarkup)
					.on("mouseenter." + this.getName(), (e) => {BDFDB.createTooltip("Loading PluginRepo",e.currentTarget,{type:"left",delay:500});})
					.appendTo(loadingiconwrapper);
					
				createWebview().then(() => {
					getPluginInfo(() => {
						if (!this.started) {
							clearTimeout(this.loading.timeout);
							BDFDB.removeEles(webview);
							return;
						}
						var finishCounter = 0, finishInterval = setInterval(() => { 
							if ((webviewqueue.length == 0 && !webviewrunning) || finishCounter > 300 || !this.loading.is) {
								clearInterval(finishInterval);
								BDFDB.removeEles(webview, ".pluginrepo-loadingicon");
								if (!loadingiconwrapper.firstChild) BDFDB.removeEles(loadingiconwrapper);
								clearTimeout(this.loading.timeout);
								this.loading = {is:false, timeout:null, amount:this.loading.amount};
								console.log(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Finished fetching Plugins.");
								if (document.querySelector(".bd-pluginrepobutton")) BDFDB.showToast(`Finished fetching Plugins.`, {type:"success"});
								if (outdated > 0) {
									var text = `${outdated} of your Plugins ${outdated == 1 ? "is" : "are"} outdated. Check:`;
									var bar = BDFDB.createNotificationsBar(text,{type:"danger",btn:"PluginRepo",selector:"pluginrepo-notice"});
									$(bar).on("click." + this.getName(), BDFDB.dotCN.noticebutton, (e) => {
										this.openPluginRepoModal(true);
										e.delegateTarget.querySelector(BDFDB.dotCN.noticedismiss).click();
									});
								}
								if (BDFDB.myData.id == "278543574059057154") {
									let wrongUrls = [];
									for (let url of this.foundPlugins) if (url && !this.loadedPlugins[url] && !wrongUrls.includes(url)) wrongUrls.push(url);
									if (wrongUrls.length > 0) {
										var bar = BDFDB.createNotificationsBar(`PluginRepo: ${wrongUrls.length} Plugin${wrongUrls.length > 1 ? "s" : ""} could not be loaded.`, {type:"danger",btn:"List",selector:"pluginrepo-notice"});
										$(bar).on("click." + this.getName(), BDFDB.dotCN.noticebutton, (e) => {
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
			let url = this.foundPlugins[i].replace(new RegExp("[\\r|\\n|\\t]", "g"), "");
			this.foundPlugins[i] = url;
			request(url, (error, response, body) => {
				if (!response) {
					if (url && BDFDB.getAllIndexes(this.foundPlugins, url).length < 2) this.foundPlugins.push(url);
				}
				else if (body && body.indexOf("404: Not Found") != 0 && response.statusCode == 200) {
					let plugin = {};
					let bodycopy = body;
					if (body.length / body.split("\n").length > 1000) {
						/* code is minified -> add newlines */
						bodycopy = body.replace(new RegExp("}", "g"), "}\n");
					}
					if (url != "https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/PluginRepo/PluginRepo.plugin.js" && body.indexOf("const config = {") > -1 && body.indexOf("index.js") > -1 && body.indexOf("discord_id") > -1 && body.indexOf("github_raw") > -1) {
						let configstring = body.split("const config = {")[1].split("};")[0].replace(/[\n\r\t]/g, "").replace(/:\s|\s:/g, ":").replace(/["'`]:/g, ":").replace(/([{,])["'`]/g, "$1").split("info:{")[1].split(",github:")[0];
						for (let tag of tags) {
							let result = tag != "getAuthor" ? new RegExp(tag.replace("get", "").toLowerCase() + ":([\"|\'|\`]).*\\1","gi").exec(configstring) : /authors:\[{name:([\"|\'|\`]).*\1/gi.exec(configstring);
							if (result) {
								var separator = result[1];
								result = result[0].replace(new RegExp("\\\\" + separator, "g"), separator).split(separator);
								if (result.length > 2) {
									result = tag != "getDescription" ? result[1] : result.slice(1, -1).join(separator).replace(new RegExp("\\\\n", "g"), "<br>").replace(new RegExp("\\\\", "g"), "");
									plugin[tag] = tag != "getVersion" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
								}
							}
						}
					}
					else if (url.indexOf("https://raw.githubusercontent.com/samogot/") > -1) {
						let configstring = body.replace(/[\n\r\t]/g, "").split('module.exports = {"info": {')[1].split("};")[0].replace(/:\s|\s:/g, ":").replace(/["'`]:/g, ":").replace(/([{,])["'`]/g, "$1");
						for (let tag of tags) {
							let result = tag != "getAuthor" ? new RegExp(tag.replace("get", "").toLowerCase() + ":([\"|\'|\`]).*\\1","gi").exec(configstring) : /authors:\[([\"|\'|\`]).*\1/gi.exec(configstring);
							if (result) {
								var separator = result[1];
								result = result[0].replace(new RegExp("\\\\" + separator, "g"), separator).split(separator);
								if (result.length > 2) {
									plugin[tag] = tag != "getVersion" ? result[1].charAt(0).toUpperCase() + result[1].slice(1) : result[1];
								}
							}
						}
					}
					else {
						for (let tag of tags) {
							let result = new RegExp(tag + "[\\s|\\t|\\n|\\r|=|>|_|:|function|\(|\)|\{|return]*([\"|\'|\`]).*\\1","gi").exec(bodycopy);
							if (!result) result = new RegExp("get " + tag.replace("get", "").toLowerCase() + "[\\s|\\t|\\n|\\r|=|>|_|:|function|\(|\)|\{|return]*([\"|\'|\`]).*\\1","gi").exec(bodycopy);
							if (result) {
								let separator = result[1];
								result = result[0].replace(new RegExp("\\\\" + separator, "g"), separator).split(separator);
								if (result.length > 2) {
									result = result.slice(1, -1).join(separator).replace(new RegExp("\\\\n", "g"), "<br>").replace(new RegExp("\\\\", "g"), "");
									plugin[tag] = tag != "getVersion" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
								}
							}
						}
					}
					let valid = true;
					for (let tag of tags) {
						if (!plugin[tag] || plugin[tag].length > 10000) valid = false;
					}
					if (valid) {
						plugin.url = url;
						this.loadedPlugins[url] = plugin;
						var instPlugin = window.bdplugins[plugin.getName] ? window.bdplugins[plugin.getName].plugin : null;
						if (instPlugin && instPlugin.getAuthor().toUpperCase() == plugin.getAuthor.toUpperCase() && instPlugin.getVersion() != plugin.getVersion) {
							if (PluginUpdates && PluginUpdates.plugins && !PluginUpdates.plugins[url]) outdated++;
						}
					}
					else {
						webviewqueue.push({body, url});
						runInWebview();
					}
				}
				i++;
				getPluginInfo(callback);
			});
		}
		
		createWebview = () => {
			return new Promise(function(callback) {
				webview = document.createElement("webview");
				webview.src = "https://discordapp.com/";
				webview.setAttribute("webview-PluginRepo", null);
				webview.style.setProperty("visibility", "hidden", "important");
				webview.addEventListener("dom-ready", () => {
					callback();
				});
				document.body.appendChild(webview);
			});
		}
		
		runInWebview = () => {
			if (webviewrunning) return;
			let webviewdata = webviewqueue.shift();
			if (!webviewdata) return;
			webviewrunning = true;
			let {body, url} = webviewdata;
			let name = body.replace(new RegExp("\\s*\:\\s*", "g"), ":").split('"name":"');
			if (name.length > 1) {
				name = name[1].split('"')[0];
				webview.getWebContents().executeJavaScript(body).then(() => {
					webview.getWebContents().executeJavaScript(` 
						var p = new ` + name + `(); 
						var data = {
							"getName":p.getName(),
							"getAuthor":p.getAuthor(),
							"getVersion":p.getVersion(),
							"getDescription":p.getDescription()
						}; 
						Promise.resolve(data);`
					).then((plugin) => {
						plugin.url = url;
						this.loadedPlugins[url] = plugin;
						var instPlugin = window.bdplugins[plugin.getName] ? window.bdplugins[plugin.getName].plugin : null;
						if (instPlugin && instPlugin.getAuthor().toUpperCase() == plugin.getAuthor.toUpperCase() && instPlugin.getVersion() != plugin.getVersion) outdated++;
						webview.getWebContents().reload();
						webviewrunning = false;
						runInWebview();
					});
				});
			}
		}
	}
	
	checkForNewPlugins () {
		let request = require("request");
		request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/PluginRepo/res/PluginList.txt", (error, response, result) => {
			if (response && !BDFDB.equals(result.split("\n"), this.grabbedPlugins)) {
				this.loading = {is:false, timeout:null, amount:0};
				this.loadPlugins();
			}
		});
	}
	
	downloadPlugin (data) {
		let request = require("request");
		request(data.url, (error, response, body) => {
			if (error) {
				BDFDB.showToast(`Unable to download Plugin "${plugin.getName}".`, {type:"danger"});
			}
			else {
				let filename = data.url.split("/");
				this.createPluginFile(filename[filename.length - 1], body);
			}
		});
	}
	
	createPluginFile (filename, content) {
		let fileSystem = require("fs");
		let path = require("path");
		var file = path.join(BDFDB.getPluginsFolder(), filename);
		fileSystem.writeFile(file, content, (error) => {
			if (error) {
				BDFDB.showToast(`Unable to save Plugin "${filename}".`, {type:"danger"});
			}
			else {
				BDFDB.showToast(`Successfully saved Plugin "${filename}".`, {type:"success"});
			}
		});
	}
	
	startPlugin (data) {
		var name = data.name;
		if (BDFDB.isPluginEnabled(name) == false) {
			bdplugins[name].plugin.start();
			pluginCookie[name] = true;
			pluginModule.savePluginData();
			console.log(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Started Plugin " + name + ".");
		}
	}
	
	deletePluginFile (data) {
		let fileSystem = require("fs");
		let path = require("path");
		let filename = data.url.split("/");
		filename = filename[filename.length - 1];
		var file = path.join(BDFDB.getPluginsFolder(), filename);
		fileSystem.unlink(file, (error) => {
			if (error) {
				BDFDB.showToast(`Unable to delete Plugin "${filename}".`, {type:"danger"});
			}
			else {
				BDFDB.showToast(`Successfully deleted Plugin "${filename}".`, {type:"success"});
			}
		});
	}
	
	stopPlugin (data) {
		var name = data.name;
		if (BDFDB.isPluginEnabled(name) == true) {
			bdplugins[name].plugin.stop();
			pluginCookie[name] = false;
			delete bdplugins[name];
			pluginModule.savePluginData();
			console.log(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Stopped Plugin " + name + ".");
		}
	}
}
