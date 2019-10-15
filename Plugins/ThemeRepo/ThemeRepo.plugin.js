//META{"name":"ThemeRepo","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ThemeRepo","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ThemeRepo/ThemeRepo.plugin.js"}*//

class ThemeRepo {
	getName () {return "ThemeRepo";}

	getVersion () {return "1.8.9";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to preview all themes from the theme repo and download them on the fly. Repo button is in the theme settings.";}

	constructor () {
		this.changelog = {
			"improved":[["ThemeFixer","Fixed and improved"]]
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
				new:			"New Themes"
			},
			order: {
				asc:			"Ascending",
				desc:			"Descending"
			}
		};

		this.loading = {is:false, timeout:null, amount:0};

		this.cachedThemes = [];
		this.grabbedThemes = [];
		this.foundThemes = [];
		this.loadedThemes = {};
		this.generatorThemes = [];

		this.updateInterval;

		this.themeRepoButtonMarkup = 
			`<button class="bd-pfbtn bd-themerepobutton">Theme Repo</button>`;

		this.themeRepoIconMarkup = 
			`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="36" height="31" viewBox="20 0 400 332">
				<path d="M0.000 39.479 L 0.000 78.957 43.575 78.957 L 87.151 78.957 87.151 204.097 L 87.151 329.236 129.609 329.236 L 172.067 329.236 172.067 204.097 L 172.067 78.957 215.642 78.957 L 259.218 78.957 259.218 39.479 L 259.218 0.000 129.609 0.000 L 0.000 0.000 0.000 39.479" stroke="none" fill="#7289da" fill-rule="evenodd"></path>
				<path d="M274.115 38.624 L 274.115 77.248 280.261 77.734 C 309.962 80.083,325.986 106.575,313.378 132.486 C 305.279 149.131,295.114 152.700,255.800 152.700 L 230.168 152.700 230.168 123.277 L 230.168 93.855 208.566 93.855 L 186.965 93.855 186.965 211.546 L 186.965 329.236 208.566 329.236 L 230.168 329.236 230.168 277.068 L 230.168 224.899 237.268 225.113 L 244.368 225.326 282.215 277.095 L 320.062 328.864 360.031 329.057 L 400.000 329.249 400.000 313.283 L 400.000 297.317 367.924 256.908 L 335.848 216.499 340.182 214.869 C 376.035 201.391,395.726 170.616,399.382 122.342 C 405.008 48.071,360.214 0.000,285.379 0.000 L 274.115 0.000 274.115 38.624" stroke="none" fill="#7f8186" fill-rule="evenodd"></path>
			</svg>`;

		this.frameMarkup = 
			`<iframe class="discordPreview" src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/DiscordPreview.html"></iframe>`;


		this.themeEntryMarkup =
			`<li class="themeEntry ${BDFDB.disCNS._reposettingsclosed + BDFDB.disCN._repocheckboxitem}">
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
						<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault} previewCheckboxWrapper" style="flex: 0 0 auto;">
							<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} previewCheckbox">
						</div>
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

		this.themeRepoModalMarkup =
			`<span class="${this.name}-modal Repo-modal BDFDB-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizelarge}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto; padding-bottom: 10px;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.defaultcolor + BDFDB.disCN.h4defaultmargin} themeAmount">Theme Repository</h4>
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
									<div tab="themes" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbaritem}">Themes</div>
									<div tab="generator" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbaritem}">Generator</div>
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
							<div tab="themes" class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.scrollerthemeghosthairline} tab-content">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner}">
									<ul class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN._repolist} themes" style="flex: 1 1 auto; display: flex !important; display: flex-direction: column !important; margin: unset !important; width: unset !important;"></ul>
								</div>
							</div>
							<div tab="generator" class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.scrollerthemeghosthairline} tab-content">
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 1 auto;">Generator Theme:</h3>
									<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap} generator-select" style="flex: 1 1 auto;"></div>
									<button type="button" id="download-generated" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-download" style="flex: 0 0 auto;">
										<div class="${BDFDB.disCN.buttoncontents}"></div>
									</button>
								</div>
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner}">
									<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCN.nowrap} variables" style="flex: 1 1 auto;"></div>
								</div>
							</div>
							<div tab="settings" class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalsubinner} tab-content" style="flex: 1 1 auto;">
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">You can toggle this menu with the "Ctrl" key to take a better look at the preview.</h3>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Preview in light mode</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-darklight">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Preview with normalized classes</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-normalize">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Include Custom CSS in Preview</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-customcss">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Include ThemeFixer CSS in Preview</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-themefixer">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Download ThemeFixer</h3>
									<button type="button" id="download-themefixer" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-download" style="flex: 0 0 auto;">
										<div class="${BDFDB.disCN.buttoncontents}"></div>
									</button>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Hide updated Themes.</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" value="updated" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} hide-checkbox" id="input-hideupdated">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Hide outdated Themes.</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" value="outdated" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} hide-checkbox" id="input-hideoutdated">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Hide downloadable Themes.</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" value="downloadable" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} hide-checkbox" id="input-hidedownloadable">
									</div>
								</div>
								<div id="RNMoption" class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Apply Theme after Download (Automatic loading enabled)</h3>
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
			`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottomright + BDFDB.disCN.popoutnoshadow} themerepo-sort-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="${BDFDB.disCN.contextmenu} BDFDB-quickSelectPopout">
						<div class="${BDFDB.disCN.contextmenuitemgroup}">
							${Object.keys(this.sortings.sort).map((key, i) => `<div option="${key}" class="${BDFDB.disCNS.contextmenuitem + BDFDB.disCN.contextmenuitemclickable}"><div class="${BDFDB.disCN.contextmenulabel} BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">${this.sortings.sort[key]}</div></div></div>`).join("")}
						</div>
					</div>
				</div>
			</div>`;

		this.orderPopoutMarkup =
			`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottomright + BDFDB.disCN.popoutnoshadow} themerepo-order-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="${BDFDB.disCN.contextmenu} BDFDB-quickSelectPopout">
						<div class="${BDFDB.disCN.contextmenuitemgroup}">
							${Object.keys(this.sortings.order).map((key, i) => `<div option="${key}" class="${BDFDB.disCNS.contextmenuitem + BDFDB.disCN.contextmenuitemclickable}"><div class="${BDFDB.disCN.contextmenulabel} BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">${this.sortings.order[key]}</div></div></div>`).join("")}
						</div>
					</div>
				</div>
			</div>`;

		this.defaults = {
			settings: {
				notifyOutdated:		{value:true, 		description:"Notifies you when one of your Themes is outdated."},
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
			@keyframes repo-loadingwrapper-fade {
				from {opacity: 0.1;}
				50% {opacity: 0.9;}
				to {opacity: 0.1;}
			}
			iframe.discordPreview {
				width: 100vw !important;
				height: 100vh !important;
				position: absolute !important;
				z-index: 999 !important;
			}
			iframe.discordPreview ~ ${BDFDB.dotCN.appmount} {
				position: absolute !important;
				top: 0 !important;
			}
			iframe.discordPreview ~ ${BDFDB.dotCNS.appmount + BDFDB.dotCN.titlebar},
			iframe.discordPreview ~ ${BDFDB.dotCNS.appmount + BDFDB.dotCN.app} > *:not(.toasts):not(.bd-toasts) {
				opacity: 0 !important;
				visibility: hidden !important;
			}
			.${this.name}-modal.Repo-modal ${BDFDB.dotCN.modalinner} {
				min-height: 100%;
				min-width: 800px;
				width: 50%;
			}
			.${this.name}-modal .themeEntry ${BDFDB.dotCN._repocontrols} > * {
				margin-right: 5px !important;
			}
			.${this.name}-modal .themeEntry ${BDFDB.dotCN._repocontrols} > .previewCheckboxWrapper {
				margin-right: 0px !important;
			}
			.${this.name}-modal .themeEntry svg[fill="currentColor"],
			.${this.name}-modal .themeEntry ${BDFDB.dotCN.giffavoritebutton} {
				cursor: pointer;
			}
			.${this.name}-modal .themeEntry svg[fill="currentColor"],
			.${this.name}-modal .themeEntry ${BDFDB.dotCN.giffavoritebutton + BDFDB.notCN.giffavoriteselected} {
				color: #72767d !important;
			}
			${BDFDB.dotCN.themedark} .${this.name}-modal .themeEntry svg[fill="currentColor"],
			${BDFDB.dotCN.themedark} .${this.name}-modal .themeEntry ${BDFDB.dotCN.giffavoritebutton + BDFDB.notCN.giffavoriteselected} {
				color: #dcddde !important;
			}
			.${this.name}-modal .themeEntry.downloadable .trashIcon {
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
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Add Theme:</h3><input type="text" placeholder="Insert Raw Github Link of Theme (https://raw.githubusercontent.com/...)" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.titlesize16}" id="input-themeurl" style="flex: 1 1 auto;"><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-add btn-addtheme" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div>`;
		settingshtml += `<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Your additional Theme List:</h3><div class="BDFDB-settings-inner-list theme-list ${BDFDB.disCN.marginbottom8}">`;
		var ownlist = BDFDB.loadData("ownlist", this, "ownlist") || [];
		if (ownlist) for (let url of ownlist) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.margintop4 + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis} entryurl">${url}</div></div><div class="${BDFDB.disCN.hovercardbutton} remove-theme"></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Force all Themes to be fetched again.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} refresh-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Refresh</div></button></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Remove all added Themes from your own list.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} remove-all" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".btn-addtheme", () => {this.addThemeToOwnList(settingspanel);});
		BDFDB.addEventListener(this, settingspanel, "click", "#input-themeurl", e => {if (e.which == 13) this.addThemeToOwnList(settingspanel);});
		BDFDB.addEventListener(this, settingspanel, "click", ".remove-theme", e => {this.removeThemeFromOwnList(e);});
		BDFDB.addEventListener(this, settingspanel, "click", ".remove-all", () => {this.removeAllFromOwnList(settingspanel);})
		BDFDB.addEventListener(this, settingspanel, "click", ".refresh-button", () => {
			this.loading = {is:false, timeout:null, amount:0};
			this.loadThemes();
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

			this.loadThemes();

			this.updateInterval = setInterval(() => {this.checkForNewThemes();},1000*60*30);

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

			BDFDB.removeEles("iframe.discordPreview",".themerepo-notice",".bd-themerepobutton",".themerepo-loadingicon",BDFDB.dotCN.app + " > .repo-loadingwrapper:empty");

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	onUserSettingsCogContextMenu (instance, menu, returnvalue) {
		setImmediate(() => {for (let child of returnvalue.props.children) if (child && child.props && child.props.label == "BandagedBD" && Array.isArray(child.props.render)) {
			const repoItem = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
				label: "Theme Repo",
				className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-repo-contextMenuItem`,
				action: e => {
					if (!this.loading.is) BDFDB.closeContextMenu(menu);
					this.openThemeRepoModal();
				}
			});
			child.props.render.push(repoItem);
			break;
		}});
	}

	processV2CList (instance, wrapper, returnvalue) {
		if (!document.querySelector(".bd-themerepobutton") && window.PluginUpdates && window.PluginUpdates.plugins && instance._reactInternalFiber.key && instance._reactInternalFiber.key.split("-")[0] == "theme") {
			var folderbutton = document.querySelector(BDFDB.dotCN._repofolderbutton);
			if (folderbutton) {
				var repoButton = BDFDB.htmlToElement(`<button class="${BDFDB.disCN._repofolderbutton} bd-themerepobutton">ThemeRepo</button>`);
				repoButton.addEventListener("click", () => {
					this.openThemeRepoModal()
				});
				repoButton.addEventListener("mouseenter", () => {
					BDFDB.createTooltip("Open Theme Repo", repoButton, {type:"top",selector:"themerepo-button-tooltip"});
				});
				folderbutton.parentElement.insertBefore(repoButton, folderbutton.nextSibling);
			}
		}
	};

	addThemeToOwnList (settingspanel) {
		var themeUrlInput = settingspanel.querySelector("#input-themeurl");
		var themeList = settingspanel.querySelector(".theme-list");
		if (themeUrlInput && themeList) {
			var url = themeUrlInput.value;
			themeUrlInput.value = null;
			var ownlist = BDFDB.loadData("ownlist", this, "ownlist") || [];
			if (!ownlist.includes(url)) {
				ownlist.push(url);
				BDFDB.saveData("ownlist", ownlist, this, "ownlist");
				let entry = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.margintop4 + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis} entryurl">${url}</div></div><div class="${BDFDB.disCN.hovercardbutton} remove-theme"></div></div>`)
				BDFDB.addChildEventListener(entry, "click", ".remove-theme", e => {this.removeThemeFromOwnList(e);});
				themeList.appendChild(entry);
			}
		}
	}

	removeThemeFromOwnList (e) {
		var entry = e.currentTarget.parentElement;
		var url = entry.querySelector(".entryurl").textContent;
		entry.remove();
		var ownlist = BDFDB.loadData("ownlist", this, "ownlist") || [];
		BDFDB.removeFromArray(ownlist, url);
		BDFDB.saveData("ownlist", ownlist, this, "ownlist");
	}

	removeAllFromOwnList (settingspanel) {
		BDFDB.openConfirmModal(this, "Are you sure you want to remove all added Themes from your own list?", () => {
			BDFDB.saveData("ownlist", [], this, "ownlist");
			BDFDB.removeEles(settingspanel.querySelector(BDFDB.dotCN.hovercard));
		});
	}

	openThemeRepoModal (options = {}) {
		if (this.loading.is) {
			BDFDB.showToast(`Themes are still being fetched. Try again in some seconds.`, {type:"danger"});
			return;
		}

		var keyPressed = e => {
			if (e.which == 17) {
				var toggle = true;
				for (let ele of themeRepoModal.querySelectorAll(".varinput, " + BDFDB.dotCN.searchbarinput)) if (ele == document.activeElement) {
					toggle = false;
					break;
				}
				if (toggle) BDFDB.toggleEles(themeRepoModal);
			}
			else if (e.which == 27) frame.remove();
		};

		var messageReceived = e => {
			if (!document.contains(frame)) {
				document.removeEventListener("keyup", keyPressed);
				window.removeEventListener("message", messageReceived);
			}
			else if (typeof e.data === "object" && e.data.origin == "DiscordPreview") {
				switch (e.data.reason) {
					case "OnLoad":
						var username = BDFDB.myData.username;
						var id = BDFDB.myData.id;
						var discriminator = BDFDB.myData.discriminator;
						var avatar = BDFDB.getUserAvatar();
						var nativecss = document.querySelector("head link[rel='stylesheet'][integrity]");
						nativecss = nativecss && nativecss.href ? nativecss.href : null;
						var titlebar = document.querySelector(BDFDB.dotCN.titlebar);
						titlebar = titlebar ? titlebar.outerHTML : null;
						frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"OnLoad",classes:JSON.stringify(BDFDB.DiscordClasses),classmodules:JSON.stringify(BDFDB.DiscordClassModules),username,id,discriminator,avatar,nativecss,html:document.documentElement.className,titlebar},"*");
						frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"DarkLight",checked:darklightinput.checked},"*");
						frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"Normalize",checked:normalizeinput.checked},"*");
						break;
					case "KeyUp":
						keyPressed(e.data);
						break;
				}
			}
		};

		var createSelectChoice = index => {
			let theme = this.loadedThemes[this.generatorThemes[index-1]] || {name: "-----", author: "-----"};
			return `<div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.primary + BDFDB.disCNS.weightnormal + BDFDB.disCN.cursorpointer}" style="flex: 1 1 auto;"><strong>${BDFDB.encodeToHTML(theme.name)}</strong> by ${BDFDB.encodeToHTML(theme.author)}</div>`;
		};

		var saveSelectChoice = (selectWrap, type, index) => {
			let theme = this.loadedThemes[this.generatorThemes[index-1]] || {name: "-----", author: "-----"};
			selectWrap.querySelector(BDFDB.dotCN.title).innerHTML = `<strong>${BDFDB.encodeToHTML(theme.name)}</strong> by ${BDFDB.encodeToHTML(theme.author)}`;
			themeRepoModal.querySelectorAll(".previewCheckbox").forEach(checkbox => {
				checkbox.checked = false;
				BDFDB.removeClass(checkbox.parentElement, BDFDB.disCN.switchvaluechecked);
				BDFDB.addClass(checkbox.parentElement, BDFDB.disCN.switchvalueunchecked);
			});
			let container = themeRepoModal.querySelector(".variables");
			BDFDB.removeEles(themeRepoModal.querySelectorAll(".varcontainer"));
			if (container && theme.fullcss) {
				frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"NewTheme",checked:true,css:theme.fullcss},"*");
				this.createGeneratorVars(frame, container, theme);
			}
		};

		document.addEventListener("keyup", keyPressed);
		window.addEventListener("message", messageReceived);

		var frame = BDFDB.htmlToElement(this.frameMarkup);
		var themeRepoModal = BDFDB.htmlToElement(this.themeRepoModalMarkup);
		var tabbar = themeRepoModal.querySelector(BDFDB.dotCN.tabbar);
		tabbar.parentElement.insertBefore(BDFDB.createSearchBar("small"), tabbar.nextElementSibling);
		var hiddenSettings = BDFDB.loadAllData(this, "hidden");
		var darklightinput = themeRepoModal.querySelector("#input-darklight");
		var normalizeinput = themeRepoModal.querySelector("#input-normalize");
		var customcssinput = themeRepoModal.querySelector("#input-customcss");
		var themefixerinput = themeRepoModal.querySelector("#input-themefixer");
		darklightinput.checked = BDFDB.getDiscordTheme() == BDFDB.disCN.themelight;
		normalizeinput.checked = window.settingsCookie["fork-ps-4"] == true;
		customcssinput.checked = false;
		themefixerinput.checked = false;
		themeRepoModal.querySelector("#input-hideupdated").checked = hiddenSettings.updated || options.showOnlyOutdated;
		themeRepoModal.querySelector("#input-hideoutdated").checked = hiddenSettings.outdated && !options.showOnlyOutdated;
		themeRepoModal.querySelector("#input-hidedownloadable").checked = hiddenSettings.downloadable || options.showOnlyOutdated;
		if (!BDFDB.isRestartNoMoreEnabled()) themeRepoModal.querySelector("#RNMoption").remove();
		else themeRepoModal.querySelector("#input-rnmstart").checked = BDFDB.loadData("RNMstart", this, "RNMstart");

		if (options.forcedSort && this.sortings.sort[options.forcedSort]) {
			var sortinput = themeRepoModal.querySelector(".sort-filter " + BDFDB.dotCN.quickselectvalue);
			sortinput.innerText = this.sortings.sort[options.forcedSort];
			sortinput.setAttribute('option', options.forcedSort);
		}
		if (options.forcedOrder && this.sortings.order[options.forcedOrder]) {
			var orderinput = themeRepoModal.querySelector(".order-filter " + BDFDB.dotCN.quickselectvalue);
			orderinput.innerText = this.sortings.order[options.forcedOrder];
			orderinput.setAttribute('option', options.forcedOrder);
		}

		darklightinput.addEventListener("change", e => {
			frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"DarkLight",checked:darklightinput.checked,light:BDFDB.disCN.themelight,dark:BDFDB.disCN.themedark},"*");
		});
		normalizeinput.addEventListener("change", e => {
			frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"Normalize",checked:normalizeinput.checked},"*");
		});
		customcssinput.addEventListener("change", e => {
			var customCSS = document.querySelector("style#customcss");
			if (customCSS && customCSS.innerText.length > 0) frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"CustomCSS",checked:customcssinput.checked,css:customCSS.innerText},"*");
		});
		themefixerinput.addEventListener("change", e => {
			BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeFixer.css", (error, response, body) => {
				frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"ThemeFixer",checked:themefixerinput.checked,css:this.createFixerCSS(body)},"*");
			});
		});
		themeRepoModal.querySelector("#download-themefixer").addEventListener("click", e => {
			BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeFixer.css", (error, response, body) => {
				this.createThemeFile("ThemeFixer.theme.css", `//META{"name":"ThemeFixer","description":"ThemeFixerCSS for transparent themes","author":"DevilBro","version":"1.0.2"}*//\n\n` + this.createFixerCSS(body));
			});
		});
		themeRepoModal.querySelector("#download-generated").addEventListener("click", e => {
			let inputs = themeRepoModal.querySelectorAll(".varinput");
			if (!inputs.length) BDFDB.showToast(`Select a Theme to download a custom generated Theme.`, {type:"error"});
			else {
				let data = this.loadedThemes[this.generatorThemes[themeRepoModal.querySelector(".generator-select " + BDFDB.dotCN.select).getAttribute("value")-1]];
				let css = data.fullcss;
				for (let input of inputs) {
					let oldvalue = input.getAttribute("placeholder");
					let newvalue = input.value;
					if (newvalue && newvalue.trim() && newvalue != oldvalue) {
						let varname = input.getAttribute("option");
						css = css.replace(new RegExp(`--${BDFDB.regEscape(varname)}(\\s*):(\\s*)${BDFDB.regEscape(oldvalue)}`,"g"),`--${varname}$1:$2${newvalue}`);
					}
				}
				this.createThemeFile(data.name + ".theme.css", css);
			}
		});
		BDFDB.addChildEventListener(themeRepoModal, "click", BDFDB.dotCNC.modalclose + BDFDB.dotCN.backdrop, () => {
			frame.remove();
			document.removeEventListener("keyup", keyPressed);
			window.removeEventListener("message", messageReceived);
		});
		BDFDB.addChildEventListener(themeRepoModal, "mouseenter", BDFDB.dotCN.backdrop, e => {
			if (!document.querySelector(BDFDB.dotCN.colorpicker)) {
				for (let child of themeRepoModal.childNodes) {
					child.style.setProperty("transition", "opacity .5s ease-in-out", "important");
					child.style.setProperty("opacity", "0", "important");
				}
			}
		});
		BDFDB.addChildEventListener(themeRepoModal, "mouseleave", BDFDB.dotCN.backdrop, e => {
			if (!document.querySelector(BDFDB.dotCN.colorpicker)) {
				themeRepoModal.childNodes[0].style.setProperty("opacity", "0.85");
				themeRepoModal.childNodes[1].style.setProperty("opacity", "1");
				setTimeout(() => {for (let child of themeRepoModal.childNodes) child.style.removeProperty("transition");}, 500);
			}
		});
		BDFDB.addChildEventListener(themeRepoModal, "keyup", BDFDB.dotCN.searchbarinput, () => {
			clearTimeout(themeRepoModal.searchTimeout);
			themeRepoModal.searchTimeout = setTimeout(() => {this.sortEntries(themeRepoModal);},1000);
		});
		BDFDB.addChildEventListener(themeRepoModal, "click", BDFDB.dotCN.searchbarclear, () => {
			clearTimeout(themeRepoModal.searchTimeout);
			themeRepoModal.searchTimeout = setTimeout(() => {this.sortEntries(themeRepoModal);},1000);
		});
		BDFDB.addChildEventListener(themeRepoModal, "change", ".hide-checkbox", e => {
			themeRepoModal.updateHidden = true;
			BDFDB.saveData(e.currentTarget.value, e.currentTarget.checked, this, "hidden");
		});
		BDFDB.addChildEventListener(themeRepoModal, "change", "#input-rnmstart", e => {
			BDFDB.saveData("RNMstart", e.currentTarget.checked, this, "RNMstart");
		});
		BDFDB.addChildEventListener(themeRepoModal, "click", ".sort-filter", e => {
			BDFDB.createSortPopout(e.currentTarget, this.sortPopoutMarkup, () => {this.sortEntries(themeRepoModal);});
		});
		BDFDB.addChildEventListener(themeRepoModal, "click", ".order-filter", e => {
			BDFDB.createSortPopout(e.currentTarget, this.orderPopoutMarkup, () => {this.sortEntries(themeRepoModal);});
		});
		BDFDB.addChildEventListener(themeRepoModal, "click", BDFDB.dotCN.tabbaritem + "[tab=themes]", e => {
			if (!BDFDB.containsClass(e.currentTarget, BDFDB.disCN.settingsitemselected)) {
				if (themeRepoModal.updateHidden) {
					delete themeRepoModal.updateHidden;
					this.sortEntries(themeRepoModal);
				}
			}
		});

		let favorites = BDFDB.loadAllData(this, "favorites");
		let container = themeRepoModal.querySelector(".themes");
		themeRepoModal.entries = {};
		for (let url in this.loadedThemes) {
			let theme = this.loadedThemes[url];
			let instTheme = BDFDB.getTheme(theme.name);
			if (instTheme && instTheme.author.toUpperCase() == theme.author.toUpperCase()) theme.state = instTheme.version != theme.version ? 1 : 0;
			else theme.state = 2;
			let data = {
				url: theme.url,
				requesturl: theme.requesturl,
				search: (theme.name + " " + theme.version + " " + theme.author + " " + theme.description).toUpperCase(),
				name: theme.name,
				version: theme.version,
				author: theme.author,
				description: theme.description,
				fav: favorites[url] ? 0 : 1,
				new: !this.cachedThemes.includes(url) ? 0 : 1,
				state: theme.state,
				css: theme.css
			};
			themeRepoModal.entries[url] = data;
			this.addEntry(frame, themeRepoModal, container, data);
		}
		this.sortEntries(themeRepoModal);
		
		var genselect = themeRepoModal.querySelector(".generator-select");
		genselect.innerHTML = BDFDB.createSelectMenu(createSelectChoice("-----"), "-----");
		genselect.addEventListener("click", e => {
			BDFDB.openDropdownMenu(e, saveSelectChoice.bind(this), createSelectChoice.bind(this), ["-----"].concat(this.generatorThemes));
		});

		BDFDB.appendModal(themeRepoModal);

		document.body.insertBefore(frame, document.body.firstElementChild);

		themeRepoModal.querySelector(BDFDB.dotCN.searchbarinput).focus();
	}
	
	createFixerCSS (body) {
		var oldcss = body.replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r").split("REPLACE_CLASS_");
		var newcss = oldcss.shift();
		for (let str of oldcss) {
			let reg = /([A-z0-9_]+)(.*)/.exec(str);
			newcss += BDFDB.dotCN[reg[1]] + reg[2];
		}
		return newcss.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "\r");
	}
	
	createGeneratorVars (frame, container, data) {
		let vars = data.fullcss.split(":root");
		if (vars.length < 2) return;
		vars = vars[1].replace(/\t\(/g, " (").replace(/\r|\t| {2,}/g, "").replace(/\/\*\n*((?!\/\*|\*\/).|\n)*\n+((?!\/\*|\*\/).|\n)*\n*\*\//g, "").replace(/\n\/\*.*?\*\//g, "").replace(/\n/g, "");
		vars = vars.split("{");
		vars.shift();
		vars = vars.join("{").replace(/\s*(:|;|--|\*)\s*/g, "$1");
		vars = vars.split("}")[0];
		vars = vars.slice(2).split(/;--|\*\/--/);
		
		var maxwidth = BDFDB.getRects(container).width - 80;
		for (let varstr of vars) {
			varstr = varstr.split(":");
			let varname = varstr.shift().trim();
			varstr = varstr.join(":").split(/;[^A-z0-9]|\/\*/);
			let varvalue = varstr.shift().trim();
			if (varvalue) {
				let vardescription = varstr.join("").replace(/\*\/|\/\*/g, "").replace(/:/g, ": ").replace(/: \//g, ":/").replace(/--/g, " --").replace(/\( --/g, "(--").trim();
				vardescription = vardescription && vardescription.indexOf("*") == 0 ? vardescription.slice(1) : vardescription;
				let varcontainer = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} varcontainer" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCN.flexchild} BDFDB-textscrollwrapper" style="flex: 0 0 30%;"><div class="BDFDB-textscroll">${varname[0].toUpperCase() + varname.slice(1)}</div></h3><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex2 + BDFDB.disCN.directioncolumn}" style="flex: 1 1 auto;"><input type="text" option="${varname}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.titlesize16} varinput"></div><button type="button" class="${BDFDB.disCN.colorpickerswatch} single-swatch" style="background-color: black;"></button><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} file-navigator" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div><input type="file" accept="image/*" style="display:none!important;"></button></div>${vardescription ? `<div class="${BDFDB.disCNS.description + BDFDB.disCNS.note + BDFDB.disCN.primary} BDFDB-textscrollwrapper" style="flex: 1 1 auto; max-width: ${maxwidth}px !important;"><div class="BDFDB-textscroll">${BDFDB.encodeToHTML(vardescription)}</div></div>` : ""}${vars[vars.length-1] == varstr ? '' : `<div class="${BDFDB.disCNS.divider + BDFDB.disCN.dividerdefault}"></div>`}</div>`);
				let varinput = varcontainer.querySelector(BDFDB.dotCN.input);
				varinput.value = varvalue;
				varinput.setAttribute("placeholder", varvalue);
				
				let swatch = varcontainer.querySelector(".single-swatch");
				let navigator = varcontainer.querySelector(".file-navigator");
				
				let iscolor = BDFDB.colorTYPE(varvalue);
				let iscomp = !iscolor && /[0-9 ]+,[0-9 ]+,[0-9 ]+/g.test(varvalue);
				let isurlfile = !iscolor && !iscolor && /url\(.+\)/gi.test(varvalue);
				let isfile = !iscolor && !iscolor && !isurlfile && /(http(s)?):\/\/[(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(varvalue);
				if (iscolor || iscomp) {
					let color = iscomp ? BDFDB.colorCONVERT(varvalue.split(","), "RGB") : varvalue;
					swatch.style.setProperty("background-color", color, "important");
					swatch.addEventListener("click", e => {
						BDFDB.openColorPicker(varcontainer, e.currentTarget, color, {gradient:false, comp:iscomp, alpha:iscolor, callback:updatePreview});
					});
				}
				else BDFDB.removeEles(swatch);
				if (isurlfile || isfile) {
					navigator.addEventListener("change", e => {
						let file = navigator.querySelector("input").files[0];
						if (file && file.type.indexOf("image") == 0) varinput.value = `${isurlfile ? "url('" : ""}data:${file.type};base64,${BDFDB.LibraryRequires.fs.readFileSync(file.path).toString("base64")}${isurlfile ? "')" : ""}`;
						else varinput.value = varvalue;
						updatePreview();
					});
				}
				else BDFDB.removeEles(navigator);
				
				container.appendChild(varcontainer);
			}
		}
		let inputs = container.querySelectorAll(".varinput"), updateTimeout, updatePreview = () => {
			clearTimeout(updateTimeout);
			updateTimeout = setTimeout(() => {
				let css = data.fullcss;
				for (let input of inputs) {
					let oldvalue = input.getAttribute("placeholder");
					let newvalue = input.value;
					if (newvalue && newvalue.trim() && newvalue != oldvalue) {
						let varname = input.getAttribute("option");
						css = css.replace(new RegExp(`--${BDFDB.regEscape(varname)}(\\s*):(\\s*)${BDFDB.regEscape(oldvalue)}`,"g"),`--${varname}$1:$2${newvalue}`);
					}
				}
				frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"NewTheme",checked:true,css},"*");
			}, 1000);
		};
		BDFDB.addChildEventListener(container, "change input", ".varinput", updatePreview);
		BDFDB.initElements(container);
	}

	addEntry (frame, themeRepoModal, container, data) {
		if (!frame || !themeRepoModal || !container || !data) return;
		let entry = BDFDB.htmlToElement(this.themeEntryMarkup);
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
			themeRepoModal.entries[data.url] = data;
		});
		let gitbutton = entry.querySelector(".gitIcon");
		gitbutton.addEventListener("click", e => {
			var giturl = null;
			if (data.requesturl.indexOf("https://raw.githubusercontent.com") == 0) {
				var temp = data.requesturl.replace("//raw.githubusercontent", "//github").split("/");
				temp.splice(5, 0, "blob");
				giturl = temp.join("/");
			}
			else if (data.requesturl.indexOf("https://gist.githubusercontent.com/") == 0) {
				giturl = data.requesturl.replace("//gist.githubusercontent", "//gist.github").split("/raw/")[0];
			}
			if (giturl) window.open(giturl, "_blank");
		});
		gitbutton.addEventListener("mouseenter", e => {
			BDFDB.createTooltip("Go to Git", gitbutton, {type:"top",selector:"themerepo-giticon-tooltip"});
		});
		let trashbutton = entry.querySelector(".trashIcon");
		trashbutton.addEventListener("click", e => {
			if (BDFDB.containsClass(entry, "outdated", "updated", false)) {
				setEntryState(2);
				this.deleteThemeFile(data);
				if (!BDFDB.isRestartNoMoreEnabled()) this.removeTheme(data);
			}
		});
		trashbutton.addEventListener("mouseenter", e => {
			BDFDB.createTooltip("Delete Themefile", trashbutton, {type:"top",selector:"themerepo-trashicon-tooltip"});
		});
		entry.querySelector(".btn-download").addEventListener("click", e => {
			setEntryState(0);
			this.downloadTheme(data);
			if (themeRepoModal.querySelector("#input-rnmstart").checked) setTimeout(() => {this.applyTheme(data);},3000);
		});
		entry.querySelector(".previewCheckbox").addEventListener("click", e => {
			themeRepoModal.querySelector(".generator-select " + BDFDB.dotCN.select).setAttribute('value', "-----");
			themeRepoModal.querySelector(".generator-select " + BDFDB.dotCN.title).innerHTML = `<strong>-----</strong> by -----`;
			BDFDB.removeEles(themeRepoModal.querySelectorAll(".varcontainer"));
			if (e.currentTarget.checked) themeRepoModal.querySelectorAll(".previewCheckbox").forEach(checkbox => {
				if (e.currentTarget != checkbox) {
					checkbox.checked = false;
					BDFDB.removeClass(checkbox.parentElement, BDFDB.disCN.switchvaluechecked);
					BDFDB.addClass(checkbox.parentElement, BDFDB.disCN.switchvalueunchecked);
				}
			});
			frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"NewTheme",checked:e.currentTarget.checked,css:data.css},"*");
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
			themeRepoModal.entries[data.url] = data;
		};
	}

	sortEntries (themeRepoModal) {
		if (!themeRepoModal || typeof themeRepoModal.entries != "object") return;

		let container = themeRepoModal.querySelector(".themes");
		if (!container) return;

		let searchstring = themeRepoModal.querySelector(BDFDB.dotCN.searchbarinput).value.replace(/[<|>]/g, "").toUpperCase();

		let entries = themeRepoModal.entries;
		if (themeRepoModal.querySelector("#input-hideupdated").checked) 		entries = BDFDB.filterObject(entries, entry => {return entry.state < 1 ? null : entry;});
		if (themeRepoModal.querySelector("#input-hideoutdated").checked) 		entries = BDFDB.filterObject(entries, entry => {return entry.state == 1 ? null : entry;});
		if (themeRepoModal.querySelector("#input-hidedownloadable").checked) 	entries = BDFDB.filterObject(entries, entry => {return entry.state > 1 ? null : entry;});
		entries = BDFDB.filterObject(entries, entry => {return entry.search.indexOf(searchstring) > -1 ? entry : null;});

		let sortfilter = themeRepoModal.querySelector(".sort-filter " + BDFDB.dotCN.quickselectvalue).getAttribute("option");
		entries = BDFDB.sortObject(entries, sortfilter == "new" && !themeRepoModal.querySelector(".newentries-tag") ? "name" : sortfilter);
		if (themeRepoModal.querySelector(".order-filter " + BDFDB.dotCN.quickselectvalue).getAttribute("option") == "desc") entries = BDFDB.reverseObject(entries);

		let entrypositions = Object.keys(entries);

		themeRepoModal.querySelector(".themeAmount").innerText = "ThemeRepo Repository " + entrypositions.length + "/" + Object.keys(this.loadedThemes).length + " Themes";

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

	loadThemes () {
		BDFDB.removeEles(".themerepo-loadingicon");
		var settings = BDFDB.loadAllData(this, "settings");
		var getThemeInfo, outdated = 0, newentries = 0, i = 0, NFLDreplace = null;
		var tags = ["name","description","author","version"];
		var newentriesdata = BDFDB.loadAllData(this, "newentriesdata"), ownlist = BDFDB.loadData("ownlist", this, "ownlist") || [];
		this.cachedThemes = (newentriesdata.urlbase64 ? atob(newentriesdata.urlbase64).split("\n") : []).concat(ownlist);
		BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeList.txt", (error, response, body) => {
			if (!error && body) {
				body = body.replace(/[\r\t]/g, "");
				BDFDB.saveData("urlbase64", btoa(body), this, "newentriesdata");
				this.loadedThemes = {};
				this.grabbedThemes = body.split("\n").filter(n => n);
				BDFDB.LibraryRequires.request("https://github.com/NFLD99/Better-Discord", (error2, response2, body2) => {
					if (!error2 && body2) {
						NFLDreplace = /\/NFLD99\/Better-Discord\/tree\/master\/Themes_[^"]+">([^<]+)/i.exec(body2);
						NFLDreplace = NFLDreplace && NFLDreplace.length > 1 ? NFLDreplace[1] : null;
					}
					this.foundThemes = this.grabbedThemes.concat(ownlist);

					this.loading = {is:true, timeout:setTimeout(() => {
						clearTimeout(this.loading.timeout);
						if (this.started) {
							if (this.loading.is && this.loading.amount < 4) setTimeout(() => {this.loadThemes();},10000);
							this.loading = {is: false, timeout:null, amount:this.loading.amount};
						}
					},1200000), amount:this.loading.amount+1};
					var loadingiconwrapper = document.querySelector(BDFDB.dotCN.app + "> .repo-loadingwrapper");
					if (!loadingiconwrapper) {
						loadingiconwrapper = BDFDB.htmlToElement(`<div class="repo-loadingwrapper"></div>`);
						document.querySelector(BDFDB.dotCN.app).appendChild(loadingiconwrapper);
					}
					var loadingicon = BDFDB.htmlToElement(this.themeRepoIconMarkup);
					BDFDB.addClass(loadingicon, "themerepo-loadingicon");
					loadingicon.addEventListener("mouseenter", () => {BDFDB.createTooltip(this.getLoadingTooltipText(),loadingicon,{type:"left",delay:500,style:"max-width:unset;",selector:"themerepo-loading-tooltip"});})
					loadingiconwrapper.appendChild(loadingicon);

					getThemeInfo(() => {
						if (!this.started) {
							clearTimeout(this.loading.timeout);
							return;
						}
						BDFDB.removeEles(loadingicon, ".themerepo-loadingicon");
						if (!loadingiconwrapper.firstChild) BDFDB.removeEles(loadingiconwrapper);
						clearTimeout(this.loading.timeout);
						this.loading = {is:false, timeout:null, amount:this.loading.amount};
						console.log(`%c[${this.name}]%c`, "color: #3a71c1; font-weight: 700;", "", "Finished fetching Themes.");
						if (document.querySelector(".bd-themerepobutton")) BDFDB.showToast(`Finished fetching Themes.`, {type:"success"});
						if ((settings.notifyOutdated || settings.notifyOutdated == undefined) && outdated > 0) {
							var oldbarbutton = document.querySelector(".themerepo-outdate-notice " + BDFDB.dotCN.noticedismiss);
							if (oldbarbutton) oldbarbutton.click();
							var bar = BDFDB.createNotificationsBar(`${outdated} of your Themes ${outdated == 1 ? "is" : "are"} outdated. Check:`,{type:"danger",btn:"ThemeRepo",selector:"themerepo-notice themerepo-outdate-notice", customicon:this.themeRepoIconMarkup.replace(/#7289da/gi,"#FFF").replace(/#7f8186/gi,"#B9BBBE")});
							bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", e => {
								this.openThemeRepoModal({showOnlyOutdated:true});
								bar.querySelector(BDFDB.dotCN.noticedismiss).click();
							});
						}
						if ((settings.notifyNewentries || settings.notifyNewentries == undefined) && newentries > 0) {
							var oldbarbutton = document.querySelector(".themerepo-newentries-notice " + BDFDB.dotCN.noticedismiss);
							if (oldbarbutton) oldbarbutton.click();
							var bar = BDFDB.createNotificationsBar(`There ${newentries == 1 ? "is" : "are"} ${newentries} new Theme${newentries == 1 ? "" : "s"} in the Repo. Check:`, {type:"success", btn:"ThemeRepo", selector:"themerepo-notice themerepo-newentries-notice", customicon:this.themeRepoIconMarkup.replace(/#7289da/gi,"#FFF").replace(/#7f8186/gi,"#B9BBBE")});
							bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", e => {
								this.openThemeRepoModal({forcedSort:"new",forcedOrder:"asc"});
								bar.querySelector(BDFDB.dotCN.noticedismiss).click();
							});
						}
						if (BDFDB.myData.id == "278543574059057154") {
							let wrongUrls = [];
							for (let url of this.foundThemes) if (url && !this.loadedThemes[url] && !wrongUrls.includes(url)) wrongUrls.push(url);
							if (wrongUrls.length > 0) {
								var bar = BDFDB.createNotificationsBar(`ThemeRepo: ${wrongUrls.length} Theme${wrongUrls.length > 1 ? "s" : ""} could not be loaded.`, {type:"danger", btn:"List", selector:"themerepo-notice", customicon:this.themeRepoIconMarkup.replace(/#7289da/gi,"#FFF").replace(/#7f8186/gi,"#B9BBBE")});
								bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", e => {
									var toast = BDFDB.showToast(wrongUrls.join("\n"),{type:"error"});
									toast.style.overflow = "hidden";
									console.log(wrongUrls.length == 1 ? wrongUrls[0] : wrongUrls);
								});
							}
						}
						BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/GeneratorList.txt", (error3, response3, body3) => {
							if (!error3 && body3) for (let url of body3.replace(/[\r\t]/g, "").split("\n").filter(n => n)) if (this.loadedThemes[url]) this.generatorThemes.push(url);
						});
					});
				});
			}
		});
		 
		getThemeInfo = (callback) => {
			if (i >= this.foundThemes.length || !this.started || !this.loading.is) {
				callback();
				return;
			}
			let url = this.foundThemes[i];
			let requesturl = NFLDreplace && url.includes("NFLD99/Better-Discord/master/Themes") ? url.replace("master/Themes", "master/" + NFLDreplace) : url;
			BDFDB.LibraryRequires.request(requesturl, (error, response, body) => {
				if (!response) {
					if (url && BDFDB.getAllIndexes(this.foundThemes, url).length < 2) this.foundThemes.push(url);
				}
				else if (body && body.indexOf("404: Not Found") != 0 && response.statusCode == 200) {
					let theme = {};
					let text = body;
					if ((text.split("*//").length > 1 || text.indexOf("/**") == 0) && text.split("\n").length > 1) {
						var hasMETAline = text.replace(/\s/g, "").indexOf("//META{");
						if (hasMETAline < 20 && hasMETAline > -1) {
							var searchtext = text.replace(/\s*:\s*/g, ":").replace(/\s*}\s*/g, "}");
							for (let tag of tags) {
								let result = searchtext.split('"' + tag + '":"');
								result = result.length > 1 ? result[1].split('",')[0].split('"}')[0] : null;
								result = result && tag != "version" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
								theme[tag] = result ? result.trim() : result;
							}
						}
						else {
							var searchtext = text.replace(/[\r\t| ]*\*\s*/g, "*");
							for (let tag of tags) {
								let result = searchtext.split('@' + tag + ' ');
								result = result.length > 1 ? result[1].split('\n')[0] : null;
								result = result && tag != "version" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
								theme[tag] = result ? result.trim() : result;
							}
						}
						let valid = true;
						for (let tag of tags) if (theme[tag] === null) valid = false;
						if (valid) {
							theme.fullcss = text;
							theme.css = hasMETAline < 20 && hasMETAline > -1 ? text.split("\n").slice(1).join("\n").replace(/[\r|\n|\t]/g, "") : text.replace(/[\r|\n|\t]/g, "");
							theme.url = url;
							theme.requesturl = requesturl;
							this.loadedThemes[url] = theme;
							var instTheme = BDFDB.getTheme(theme.name);
							if (instTheme && instTheme.author.toUpperCase() == theme.author.toUpperCase() && instTheme.version != theme.version) outdated++;
							if (!this.cachedThemes.includes(url)) newentries++;
						}
					}
				}
				i++;
				var loadingtooltip = document.querySelector(".themerepo-loading-tooltip");
				if (loadingtooltip) {
					BDFDB.setInnerText(loadingtooltip, this.getLoadingTooltipText());
					BDFDB.updateTooltipPosition(loadingtooltip);
				}
				getThemeInfo(callback);
			});
		}
	}

	getLoadingTooltipText () {
		return `Loading ThemeRepo - [${Object.keys(this.loadedThemes).length}/${Object.keys(this.grabbedThemes).length}]`;
	}

	checkForNewThemes () {
		BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeList.txt", (error, response, result) => {
			if (response && !BDFDB.equals(result.replace(/\t|\r/g, "").split("\n").filter(n => n), this.grabbedThemes)) {
				this.loading = {is:false, timeout:null, amount:0};
				this.loadThemes();
			}
		});
	}

	downloadTheme (data) {
		BDFDB.LibraryRequires.request(data.requesturl, (error, response, body) => {
			if (error) BDFDB.showToast(`Unable to download Theme "${data.name}".`, {type:"danger"});
			else this.createThemeFile(data.requesturl.split("/").pop(), body);
		});
	}

	createThemeFile (filename, content) {
		BDFDB.LibraryRequires.fs.writeFile(BDFDB.LibraryRequires.path.join(BDFDB.getThemesFolder(), filename), content, (error) => {
			if (error) BDFDB.showToast(`Unable to save Theme "${filename}".`, {type:"danger"});
			else BDFDB.showToast(`Successfully saved Theme "${filename}".`, {type:"success"});
		});
	}

	applyTheme (data) {
		if (BDFDB.isThemeEnabled(data.name) == false) {
			BDFDB.removeEles(`style#${data.name}`);
			document.head.appendChild(BDFDB.htmlToElement(`<style id=${data.name}>${data.css}</style>`));
			window.themeModule.enableTheme(data.name);
			console.log(`%c[${this.name}]%c`, "color: #3a71c1; font-weight: 700;", "", "Applied Theme " + data.name + ".");
		}
	}

	deleteThemeFile (data) {
		let filename = data.requesturl.split("/").pop();
		BDFDB.LibraryRequires.fs.unlink(BDFDB.LibraryRequires.path.join(BDFDB.getThemesFolder(), filename), (error) => {
			if (error) BDFDB.showToast(`Unable to delete Theme "${filename}".`, {type:"danger"});
			else BDFDB.showToast(`Successfully deleted Theme "${filename}".`);
		});
	}

	removeTheme (data) {
		if (BDFDB.isThemeEnabled(data.name) == true) {
			BDFDB.removeEles(`style#${data.name}`);
			window.themeModule.disableTheme(data.name);
			console.log(`%c[${this.name}]%c`, "color: #3a71c1; font-weight: 700;", "", "Removed Theme " + data.name + ".");
		}
	}
}