//META{"name":"ThemeRepo"}*//

class ThemeRepo {
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
		
		this.grabbedThemes = [];
		this.foundThemes = [];
		this.loadedThemes = {};
		
		this.updateInterval;
		
		this.themeFixerCSS = `#friends, .noChannel-Z1DQK7, .activityFeed-HeiGwL, .lfg-3xoFkI, .app, .layers-3iHuyZ, .layer-3QrUeG, .container-2lgZY8, .content-region, .guilds-wrapper, .search-l1Wz-Q .search-bar, .chat .inner-zqa7da, .search-results-wrap, .search-results-wrap .search-header, .search-results-wrap .search-result-message.hit, .sidebar-region, .ui-standard-sidebar-view, .channels-Ie2l6A, .container-2Thooq {background: rgba(0,0,0,0.3) !important;}  .search-results-wrap .search-result-message.hit {box-shadow:none !important;} .titleBar-AC4pGV::after {content:""; position:absolute; z-index:-1; top:0; left:0; right:0; width:100%; height:22px; background: rgba(0,0,0,0.8) !important;} #friends .friends-table, .members-1998pB, .loading-316uYQ, .chat .content, .chat form, .chat, .content .flex-spacer, .messages-wrapper, .typing-2GQL18, .container-PNkimc, .headerBar-UHpsPw, .titleBar-AC4pGV, .titleWrapper-1l0xT9 .title-3qD0b-, .search-results-wrap .search-result::before, .search-results-wrap .search-result::after, .search-results-wrap .channel-name {background: transparent !important;}  ::-webkit-scrollbar-thumb {border-color: transparent !important; background: rgba(0,0,0,0.8) !important;} ::-webkit-scrollbar, ::-webkit-scrollbar-track-piece {border-color: transparent !important; background: transparent !important;} ::-webkit-scrollbar-corner {display: none !important;}`;
		
		this.themeRepoButtonMarkup = 
			`<button class="bd-pfbtn bd-themerepobutton">Theme Repo</button>`;
		
		this.settingsContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitem} themerepo-item">
				<span>Theme Repo</span>
				<div class="${BDFDB.disCN.contextmenuhint}"></div>
			</div>`;
			
		this.themeRepoLoadingIconMarkup = 
			`<svg class="themerepo-loadingicon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="42" height="31" viewBox="0 0 483 332">
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
			`<span class="${this.getName()}-modal Repo-modal DevilBro-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCN.modalsub}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto; padding: 20px 20px 0 20px;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.headertitle + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.defaultcolor + BDFDB.disCNS.h4defaultmargin + BDFDB.disCN.marginreset} themeAmount">Theme Repository</h4>
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
								<div tab="themes" class="tab selected">Themes</div>
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
							<div tab="themes" class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline} tab-content">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner}">
									<ul class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN._repolist} themes" style="flex: 1 1 auto; display: flex !important; display: flex-direction: column !important;"></ul>
								</div>
							</div>
							<div tab="settings" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalsubinner} tab-content" style="flex: 1 1 auto;">
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">You can toggle this menu with the "Ctrl" key to take a better look at the preview.</h3>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Preview in light mode</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-darklight">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Include Custom CSS in Preview</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-customcss">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Include ThemeFixer CSS in Preview</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-themefixer">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Download ThemeFixer</h3>
									<button type="button" id="download-themefixer" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}" style="flex: 0 0 auto;">
										<div class="${BDFDB.disCN.buttoncontents}">Download</div>
									</button>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Hide updated Themes.</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" value="updated" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} hide-checkbox" id="input-hideupdated">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Hide outdated Themes.</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" value="outdated" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} hide-checkbox" id="input-hideoutdated">
									</div>
								</div>
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Hide downloadable Themes.</h3>
									<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
										<input type="checkbox" value="downloadable" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} hide-checkbox" id="input-hidedownloadable">
									</div>
								</div>
								<div id="RNMoption" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Apply Theme after Download (Automatic loading enabled)</h3>
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
					<div class="${BDFDB.disCN.contextmenu} quickSelectPopout">
						<div class="${BDFDB.disCN.contextmenuitemgroup}">
							${Object.keys(this.sortings.sort).map((key, i) => `<div option="${key}" class="${BDFDB.disCN.contextmenuitem}">${this.sortings.sort[key]}</div>`).join("")}
						</div>
					</div>
				</div>
			</div>`;
			
		this.orderPopoutMarkup =
			`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottomright + BDFDB.disCN.popoutnoshadow} themerepo-order-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
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
			.discordPreview {
				width: 100vw !important;
				height: 100vh !important;
				position: absolute !important;
				z-index: 999 !important;
			}
			.discordPreview ~ ${BDFDB.dotCN.appmount} {
				position: absolute !important;
				top: 0 !important;
			}
			.discordPreview ~ ${BDFDB.dotCNS.appmount + BDFDB.dotCN.app} {
				opacity: 0 !important;
				visibility: hidden !important;
			}
			.${this.getName()}-modal.Repo-modal ${BDFDB.dotCN.modalinner} {
				min-height: 100%;
				min-width: 800px;
				width: 50%;
			}
			.${this.getName()}-modal .themeEntry ${BDFDB.dotCN._repocontrols} > * {
				margin-right: 5px !important;
			}
			.${this.getName()}-modal .themeEntry svg[fill="currentColor"],
			.${this.getName()}-modal .themeEntry ${BDFDB.dotCN.giffavoritebutton}:not(${BDFDB.dotCN.giffavoriteselected}) {
				color: #72767d !important;
			}
			${BDFDB.dotCN.themedark} .${this.getName()}-modal .themeEntry svg[fill="currentColor"],
			${BDFDB.dotCN.themedark} .${this.getName()}-modal .themeEntry ${BDFDB.dotCN.giffavoritebutton}:not(${BDFDB.dotCN.giffavoriteselected}) {
				color: #dcddde !important;
			}
			.${this.getName()}-modal .themeEntry.downloadable .trashIcon {
				opacity: 0 !important;
				pointer-events: none !important;
			}`;
	}

	getName () {return "ThemeRepo";}

	getDescription () {return "Allows you to preview all themes from the theme repo and download them on the fly. Repo button is in the theme settings.";}

	getVersion () {return "1.6.5";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Add Theme:</h3><input type="text" placeholder="Insert Raw Github Link of Theme (https://raw.githubusercontent.com/...)" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-themeurl" style="flex: 1 1 auto;"><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-add btn-addtheme" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div></button></div>`;
		settingshtml += `<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Your additional Theme List:</h3><div class="DevilBro-settings-inner-list theme-list ${BDFDB.disCN.marginbottom8}">`;
		var ownlist = BDFDB.loadData("ownlist", this, "ownlist") || [];
		if (ownlist) for (let url of ownlist) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.margintop4 + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis} entryurl">${url}</div></div><div class="${BDFDB.disCN.hovercardbutton} remove-theme"></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Force all Themes to be fetched again.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} refresh-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Refresh</div></button></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Remove all added Themes from your own list.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} remove-all" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".btn-addtheme", () => {this.addThemeToOwnList(settingspanel);})
			.on("keyup", "#input-themeurl", (e) => {if (e.which == 13) this.addThemeToOwnList(settingspanel);})
			.on("click", ".remove-theme", (e) => {this.removeThemeFromOwnList(e);})
			.on("click", ".remove-all", () => {this.removeAllFromOwnList();})
			.on("click", ".refresh-button", () => {
				this.loading = {is:false, timeout:null, amount:0};
				this.loadThemes();
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
			
			this.UserUtils = BDFDB.WebModules.findByProperties("getUsers");
			this.IconUtils = BDFDB.WebModules.findByProperties("getUserAvatarURL");
			
			this.loadThemes();
			
			this.updateInterval = setInterval(() => {this.checkForNewThemes();},1000*60*30);
			
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
						
			BDFDB.removeEles(".discordPreview",".themerepo-notice",".bd-themerepobutton",".themerepo-loadingicon",BDFDB.dotCN.app + " > .repo-loadingwrapper:empty");
			
			BDFDB.unloadMessage(this);
		}
	}

	
	// begin of own functions
	
	onUserSettingsCogContextMenu (instance, menu) {
		let observer = new MutationObserver(changes => {
			changes.forEach(change => {
				if (change.addedNodes) change.addedNodes.forEach(node => {
					if (node.tagName && node.classList && node.className.includes("plugin-context-menu") && !node.querySelector(".themerepo-item")) {
						let items = node.querySelectorAll(BDFDB.dotCN.contextmenuitem);
						$(this.settingsContextEntryMarkup)
							.on("click", () => {
								if (!this.loading.is) instance._reactInternalFiber.return.memoizedProps.closeContextMenu();
								this.openThemeRepoModal();
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
		if (!document.querySelector(".bd-themerepobutton") && window.PluginUpdates && window.PluginUpdates.plugins && instance._reactInternalFiber.key && instance._reactInternalFiber.key.split("-")[0] == "theme") {
			var folderbutton = document.querySelector(BDFDB.dotCN._repofolderbutton);
			if (folderbutton) {
				var repoButton = document.createElement("button");
				repoButton.className = BDFDB.disCN._repofolderbutton + " bd-themerepobutton";
				repoButton.innerText = "ThemeRepo";
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
				$(`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.margintop4 + BDFDB.disCNS.marginbottom4 + BDFDB.disCN.hovercard}"><div class="${BDFDB.disCN.hovercardinner}"><div class="${BDFDB.disCNS.description + BDFDB.disCNS.formtext + BDFDB.disCNS.note + BDFDB.disCNS.margintop4 + BDFDB.disCNS.modedefault + BDFDB.disCNS.primary + BDFDB.disCN.ellipsis} entryurl">${url}</div></div><div class="${BDFDB.disCN.hovercardbutton} remove-theme"></div></div>`).appendTo(themeList);
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
	
	removeAllFromOwnList () {
		BDFDB.openConfirmModal(this, "Are you sure you want to remove all added Themes from your own list?", () => {
			BDFDB.saveData("ownlist", [], this, "ownlist");
			BDFDB.removeEles("." + this.getName() + "-settings " + BDFDB.dotCN.hovercard);
		});
	}
	
	openThemeRepoModal (showOnlyOutdated = false) {
		if (this.loading.is) {
			BDFDB.showToast(`Themes are still being fetched. Try again in some seconds.`, {type:"danger"});
			return;
		}
		var frame = $(this.frameMarkup)[0];
		var lightTheme = BDFDB.getDiscordTheme() == BDFDB.disCN.themelight;
		var themeRepoModal = $(this.themeRepoModalMarkup);
		var hiddenSettings = Object.assign({},BDFDB.loadAllData(this, "hidden"));
		themeRepoModal.find("#input-darklight").prop("checked", lightTheme);
		themeRepoModal.find("#input-customcss").prop("checked", false);
		themeRepoModal.find("#input-themefixer").prop("checked", false);
		themeRepoModal.find("#input-hideupdated").prop("checked", hiddenSettings.updated || showOnlyOutdated);
		themeRepoModal.find("#input-hideoutdated").prop("checked", hiddenSettings.outdated && !showOnlyOutdated);
		themeRepoModal.find("#input-hidedownloadable").prop("checked", hiddenSettings.downloadable || showOnlyOutdated);
		if (!BDFDB.isRestartNoMoreEnabled()) BDFDB.removeEles(".themerepo-modal #RNMoption");
		else themeRepoModal.find("#input-rnmstart").prop("checked", BDFDB.loadData("RNMstart", this, "settings"));
		themeRepoModal = themeRepoModal[0];
		$(themeRepoModal)
			.on("keyup." + this.getName(), BDFDB.dotCN.searchbarinput, () => {
				clearTimeout(themeRepoModal.searchTimeout);
				themeRepoModal.searchTimeout = setTimeout(() => {this.sortEntries(themeRepoModal);},1000);
			})
			.on("click." + this.getName(), BDFDB.dotCN.searchbarclear + BDFDB.dotCN.searchbarvisible, () => {
				clearTimeout(themeRepoModal.searchTimeout);
				themeRepoModal.searchTimeout = setTimeout(() => {this.sortEntries(themeRepoModal);},1000);
			})
			.on("click." + this.getName(), BDFDB.dotCNC.modalclose + BDFDB.dotCN.backdrop, () => {
				frame.remove();
				$(document).off("keyup." + this.getName());
				$(window).off("message." + this.getName());
			})
			.on("click." + this.getName(), ".sort-filter", (e) => {
				this.openSortPopout(e, this.sortPopoutMarkup, themeRepoModal);
			})
			.on("click." + this.getName(), ".order-filter", (e) => {
				this.openSortPopout(e, this.orderPopoutMarkup, themeRepoModal);
			})
			.on("change." + this.getName(), "#input-darklight", (e) => {
				frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"DarkLight",checked:e.currentTarget.checked},"*");
			})
			.on("change." + this.getName(), "#input-customcss", (e) => {
				var customCSS = document.querySelector("style#customcss");
				if (customCSS && customCSS.innerText.length > 0) frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"CustomCSS",checked:$(e.target).prop("checked"),css:customCSS.innerText},"*");
			})
			.on("change." + this.getName(), "#input-themefixer", (e) => {
				frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"ThemeFixer",checked:e.currentTarget.checked,css:this.themeFixerCSS},"*");
			})
			.on("click." + this.getName(), "#download-themefixer", (e) => {
				this.createThemeFile("ThemeFixer.theme.css", `//META{"name":"ThemeFixer","description":"ThemeFixerCSS for transparent themes","author":"DevilBro","version":"1.0.1"}*//\n\n` + this.themeFixerCSS);
			})
			.on("change." + this.getName(), ".hide-checkbox", (e) => {
				BDFDB.saveData(e.currentTarget.value, e.currentTarget.checked, this, "hidden");
			})
			.on("change." + this.getName(), "#input-rnmstart", (e) => {
				BDFDB.saveData("RNMstart", e.currentTarget.checked, this, "settings");
			})
			.on("click." + this.getName(), ".tab[tab=themes]:not(.selected)", (e) => {
				var newHiddenSettings = BDFDB.loadAllData(this, "hidden");
				if (!BDFDB.equals(newHiddenSettings, hiddenSettings)) {
					hiddenSettings = Object.assign({},newHiddenSettings);
					this.sortEntries(themeRepoModal);
				}
			});
		
		let favorites = BDFDB.loadAllData(this, "favorites");
		let container = themeRepoModal.querySelector(".themes");
		themeRepoModal.entries = {};
		for (let url in this.loadedThemes) {
			let theme = this.loadedThemes[url];
			let instTheme = window.bdthemes[this.loadedThemes[url].name];
			if (instTheme && instTheme.author.toUpperCase() == theme.author.toUpperCase()) theme.state = instTheme.version != theme.version ? 1 : 0;
			else theme.state = 2;
			theme.fav = favorites[url] ? 0 : 1;
			let data = {
				url: theme.url,
				search: (theme.name + " " + theme.version + " " + theme.author + " " + theme.description).toUpperCase(),
				name: theme.name,
				version: theme.version,
				author: theme.author,
				description: theme.description,
				fav: theme.fav,
				state: theme.state,
				css: theme.css
			};
			themeRepoModal.entries[url] = data;
			this.addEntry(frame, themeRepoModal, container, data);
		}
		this.sortEntries(themeRepoModal);
			
		BDFDB.appendModal(themeRepoModal);
			
		$(document).off("keyup." + this.getName())
			.on("keyup." + this.getName(), (e) => {
				keyPressed(e.which);
			});
			
		$(window)
			.off("message." + this.getName())
			.on("message." + this.getName(), (e) => {
				e = e.originalEvent;
				if (typeof e.data === "object" && e.data.origin == "DiscordPreview") {
					switch (e.data.reason) {
						case "OnLoad":
							var user = this.UserUtils.getCurrentUser();
							if (!user) return;
							var username = user.username;
							var id = user.id;
							var avatar = "url(" + (((user.avatar ? "" : "https://discordapp.com") + this.IconUtils.getUserAvatarURL(user)).split("?size")[0]) + ");";
							var discriminator = user.discriminator;
							var nativecss = document.querySelector("head link[rel='stylesheet'][integrity]");
							nativecss = nativecss && nativecss.href ? nativecss.href : null;
							frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"OnLoad",username,id,avatar,discriminator,nativecss},"*");
							frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"DarkLight",checked:lightTheme},"*");
							break;
						case "KeyUp":
							keyPressed(e.data.key);
							break;
					}
				}
			});
		
		$(frame).insertBefore(BDFDB.dotCN.appmount);
			
		function keyPressed (key) {
			if (key == 17 && !$(themeRepoModal).find(BDFDB.dotCN.searchbarinput).is(":focus")) $(themeRepoModal).toggle();
			if (key == 27) frame.remove();
		}
	}
	
	addEntry (frame, themeRepoModal, container, data) {
		if (!frame || !themeRepoModal || !container || !data) return;
		let entry = $(this.themeEntryMarkup)[0];
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
			.on("change." + this.getName(), ".previewCheckbox", (e) => {
				if (e.currentTarget.checked) themeRepoModal.querySelectorAll(".previewCheckbox").forEach(checkbox => {
					if (e.currentTarget != checkbox) {
						checkbox.checked = false;
						checkbox.parentElement.classList.remove(BDFDB.disCN.switchvaluechecked);
						checkbox.parentElement.classList.add(BDFDB.disCN.switchvalueunchecked);
					}
				});
				frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"NewTheme",checked:e.currentTarget.checked,css:data.css},"*");
			})
			.on("click." + this.getName(), BDFDB.dotCN.giffavoritebutton, (e) => {
				let favorize = data.fav == 1;
				data.fav = favorize ? 0 : 1;
				if (favorize) BDFDB.saveData(data.url, true, this, "favorites");
				else BDFDB.removeData(data.url, this, "favorites");
				themeRepoModal.entries[data.url] = data;
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
					if (!BDFDB.isRestartNoMoreEnabled()) this.removeTheme(data);
				}
			})
			.on("click." + this.getName(), ".btn-download", () => {
				setEntryState(0);
				this.downloadTheme(data);
				if (themeRepoModal.querySelector("#input-rnmstart").checked) setTimeout(() => {this.applyTheme(data);},3000);
			})
			.on("mouseenter." + this.getName(), BDFDB.dotCN.giffavoritebutton, (e) => {
				BDFDB.createTooltip("Favorize", e.currentTarget, {type:"top",selector:"themerepo-favicon-tooltip"});
			})
			.on("mouseenter." + this.getName(), ".gitIcon", (e) => {
				BDFDB.createTooltip("Go to Git", e.currentTarget, {type:"top",selector:"themerepo-giticon-tooltip"});
			})
			.on("mouseenter." + this.getName(), ".trashIcon", (e) => {
				BDFDB.createTooltip("Delete Themefile", e.currentTarget, {type:"top",selector:"themerepo-trashicon-tooltip"});
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
		
		entries = BDFDB.sortObject(entries, themeRepoModal.querySelector(".sort-filter " + BDFDB.dotCN.quickselectvalue).getAttribute("option"));
		if (themeRepoModal.querySelector(".order-filter " + BDFDB.dotCN.quickselectvalue).getAttribute("option") == "desc") entries = BDFDB.reverseObject(entries);
		
		let entrypositions = Object.keys(entries);
		
		themeRepoModal.querySelector(".themeAmount").innerText = "ThemeRepo Repository " + entrypositions.length + "/" + Object.keys(this.loadedThemes).length + " Themes";
		
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
	
	openSortPopout (e, markup, themeRepoModal) {
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
				this.sortEntries(themeRepoModal);
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
	
	loadThemes () {
		var getThemeInfo, outdated = 0, i = 0;
		var tags = ["name","description","author","version"];
		let request = require("request");
		request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeList.txt", (error, response, result) => {
			if (response) {
				this.loadedThemes = {};
				this.grabbedThemes = result.split("\n");
				this.foundThemes = this.grabbedThemes.concat(BDFDB.loadData("ownlist", this, "ownlist") || []);
				this.loading = {is:true, timeout:setTimeout(() => {
					clearTimeout(this.loading.timeout);
					if (this.started) {
						if (this.loading.is && this.loading.amount < 4) setTimeout(() => {this.loadThemes();},10000);
						this.loading = {is: false, timeout:null, amount:this.loading.amount};
					}
				},1200000), amount:this.loading.amount+1};
				var loadingiconwrapper = document.querySelector(BDFDB.dotCN.app + "> .repo-loadingwrapper");
				if (!loadingiconwrapper) {
					loadingiconwrapper = document.createElement("div");
					loadingiconwrapper.className = "repo-loadingwrapper";
					document.querySelector(BDFDB.dotCN.app).appendChild(loadingiconwrapper);
				}
				$(this.themeRepoLoadingIconMarkup)
					.on("mouseenter." + this.getName(), (e) => {BDFDB.createTooltip("Loading ThemeRepo",e.currentTarget,{type:"left",delay:500});})
					.appendTo(loadingiconwrapper);
					
				getThemeInfo(() => {
					if (!this.started) {
						clearTimeout(this.loading.timeout);
						return;
					}
					BDFDB.removeEles(".themerepo-loadingicon");
					if (!loadingiconwrapper.firstChild) BDFDB.removeEles(loadingiconwrapper);
					clearTimeout(this.loading.timeout);
					this.loading = {is:false, timeout:null, amount:this.loading.amount};
					console.log(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Finished fetching Themes.");
					if (document.querySelector(".bd-themerepobutton")) BDFDB.showToast(`Finished fetching Themes.`, {type:"success"});
					if (outdated > 0) {
						var text = `${outdated} of your Themes ${outdated == 1 ? "is" : "are"} outdated. Check:`;
						var bar = BDFDB.createNotificationsBar(text,{type:"danger",btn:"ThemeRepo",selector:"themerepo-notice"});
						$(bar).on("click." + this.getName(), BDFDB.dotCN.noticebutton, (e) => {
							this.openThemeRepoModal(true);
							e.delegateTarget.querySelector(BDFDB.dotCN.noticedismiss).click();
						});
					}
					if (BDFDB.myData.id == "278543574059057154") {
						let wrongUrls = [];
						for (let url of this.foundThemes) if (url && !this.loadedThemes[url] && !wrongUrls.includes(url)) wrongUrls.push(url);
						if (wrongUrls.length > 0) {
							var bar = BDFDB.createNotificationsBar(`ThemeRepo: ${wrongUrls.length} Theme${wrongUrls.length > 1 ? "s" : ""} could not be loaded.`, {type:"danger",btn:"List",selector:"themerepo-notice"});
							$(bar).on("click." + this.getName(), BDFDB.dotCN.noticebutton, (e) => {
								var toast = BDFDB.showToast(wrongUrls.join("\n"),{type:"error"});
								toast.style.overflow = "hidden";
								console.log(wrongUrls.length == 1 ? wrongUrls[0] : wrongUrls);
							});
						}
					}
				});
			}
		});
		 
		getThemeInfo = (callback) => {
			if (i >= this.foundThemes.length || !this.started || !this.loading.is) {
				callback();
				return;
			}
			let url = this.foundThemes[i].replace(new RegExp("[\\r|\\n|\\t]", "g"), "");
			this.foundThemes[i] = url;
			request(url, (error, response, body) => {
				if (!response) {
					if (url && BDFDB.getAllIndexes(this.foundThemes, url).length < 2) this.foundThemes.push(url);
				}
				else if (body && body.indexOf("404: Not Found") != 0 && response.statusCode == 200) {
					let theme = {};
					let text = body;
					if (text.split("*//").length > 1 && text.split("\n").length > 1) {
						for (let tag of tags) {
							let result = text.replace(new RegExp("\\s*\:\\s*", "g"), ":").replace(new RegExp("\\s*\}\\s*", "g"), "}").split('"' + tag + '":"');
							result = result.length > 1 ? result[1].split('",')[0].split('"}')[0] : null;
							result = result && tag != "version" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
							theme[tag] = result;
						}
						let valid = true;
						for (let tag of tags) {
							if (theme[tag] === null) valid = false;
						}
						if (valid) {
							theme.css = text.split("\n").slice(1).join("\n").replace(new RegExp("[\\r|\\n|\\t]", "g"), "");
							theme.url = url;
							this.loadedThemes[url] = theme;
							var instTheme = window.bdthemes[theme.name];
							if (instTheme && instTheme.author.toUpperCase() == theme.author.toUpperCase() && instTheme.version != theme.version) outdated++;
						}
					}
				}
				i++;
				getThemeInfo(callback);
			});
		}
	}
	
	checkForNewThemes () {
		let request = require("request");
		request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeList.txt", (error, response, result) => {
			if (response && !BDFDB.equals(result.split("\n"), this.grabbedThemes)) {
				this.loading = {is:false, timeout:null, amount:0};
				this.loadThemes();
			}
		});
	}
	
	downloadTheme (data) {
		let request = require("request");
		request(data.url, (error, response, body) => {
			if (error) {
				BDFDB.showToast(`Unable to download Theme "${data.name}".`, {type:"danger"});
			}
			else {
				let filename = data.url.split("/");
				this.createThemeFile(filename[filename.length - 1], body);
			}
		});
	}
	
	createThemeFile (filename, content) {
		let fileSystem = require("fs");
		let path = require("path");
		var file = path.join(BDFDB.getThemesFolder(), filename);
		fileSystem.writeFile(file, content, (error) => {
			if (error) {
				BDFDB.showToast(`Unable to save Theme "${filename}".`, {type:"danger"});
			}
			else {
				BDFDB.showToast(`Successfully saved Theme "${filename}".`, {type:"success"});
			}
		});
	}
	
	applyTheme (data) {
		var name = data.name;
		if (BDFDB.isThemeEnabled(name) == false) {
			BDFDB.removeEles(`style#${name}`);
			$("head").append(`<style id=${name}>${data.css}</style>`);
			themeCookie[name] = true;
			themeModule.saveThemeData();
			console.log(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Applied Theme " + name + ".");
		}
	}
	
	deleteThemeFile (data) {
		let fileSystem = require("fs");
		let path = require("path");
		let filename = data.url.split("/");
		filename = filename[filename.length - 1];
		var file = path.join(BDFDB.getThemesFolder(), filename);
		fileSystem.unlink(file, (error) => {
			if (error) {
				BDFDB.showToast(`Unable to delete Theme "${filename}".`, {type:"danger"});
			}
			else {
				BDFDB.showToast(`Successfully deleted Theme "${filename}".`, {type:"success"});
			}
		});
	}
	
	removeTheme (data) {
		var name = data.name;
		if (BDFDB.isThemeEnabled(name) == true) {
			BDFDB.removeEles(`style#${name}`);
			themeCookie[name] = false;
			delete bdthemes[name];
			themeModule.saveThemeData();
			console.log(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Removed Theme " + name + ".");
		}
	}
}