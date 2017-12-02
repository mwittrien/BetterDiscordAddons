//META{"name":"ThemeRepo"}*//

class ThemeRepo {
	constructor () {
		this.settingsWindowObserver = new MutationObserver(() => {});
		this.innerSettingsWindowObserver = new MutationObserver(() => {});
		
		this.loading = false;
		
		this.grabbedThemes = {};
		this.loadedThemes = {};
		
		this.updateInterval;
		
		this.themeFixerCSS = `#voice-connection,#friends,.friends-header,.friends-table,.guilds-wrapper,.guild-headerheader,.channels-wrap,.private-channels.search-bar,.private-channels,.guild-channels,.account,.friend-table-add-header,.chat,.content,.layers,.title-wrap:not(.search-bar),.messages-wrapper,.messages.dividerspan,.messages.divider:before,.content,.message-group-blocked,.is-local-bot-message,.channel-members-loading,.channel-members-loading.heading,.channel-members-loading.member,.typing,.layer,.layers,.container-RYiLUQ,.theme-dark.ui-standard-sidebar-view,.theme-dark.ui-standard-sidebar-view.sidebar-region,.theme-dark.ui-standard-sidebar-view.content-region,.theme-dark.channel-members,.layer,.layers,.container-2OU7Cz,.theme-dark.title-qAcLxz,.theme-dark.chatform,.channels-3g2vYe,.theme-dark.friends-table,.theme-dark.messages-wrapper,.content.flex-spacer,.theme-dark.chat>.content,.theme-dark.chat,.container-2OU7Cz,.theme-dark.channel-members,.channel-members,.channels-3g2vYe,.guilds-wrapper,.search.search-bar,.theme-dark.chatform,.container-iksrDt,.container-3lnMWU,.theme-dark.title-qAcLxz{background:transparent!important;}.theme-dark.layer,.theme-dark.layers,.typeWindows-15E0Ys{background:rgba(0,0,0,0.18)!important;}`
		
		this.themeRepoButtonMarkup = 
			`<button class="bd-pfbtn bd-themerepobutton" style="left: 220px;">Theme Repo</button>`;
		
		this.frameMarkup = 
			`<iframe class="discordPreview" src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/DiscordPreview.html"></iframe>`;

		this.themeEntryMarkup =
			`<li class="themeEntry" style="position:relative;">
				<div class="bda-left">
					<span class="bda-name"></span>
					<div class="scrollerWrap-2uBjct scrollerThemed-19vinI">
						<div class="scroller-fzNley bda-description"></div>
					</div>
				</div>
				<div class="bda-right">
					<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU previewCheckboxWrapper" style="flex: 0 0 auto;">
						<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm previewCheckbox">
					</div>
					<svg class="favIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><path fill="none" stroke="black" d="M 19.542, 9.092 c 0.393 -0.383, 0.532 -0.946, 0.362 -1.468 c -0.17 -0.523 -0.613 -0.896 -1.157 -0.975 l -4.837 -0.703 c -0.206 -0.03 -0.384 -0.159 -0.476 -0.346 L 11.273, 1.217 c -0.243 -0.492 -0.736 -0.798 -1.285 -0.798 c -0.549, 0 -1.042, 0.306 -1.284, 0.798 L 6.541, 5.6 c -0.092, 0.187 -0.27, 0.316 -0.476, 0.346 L 1.228, 6.649 c -0.544, 0.079 -0.987, 0.452 -1.157, 0.975 c -0.17, 0.523 -0.031, 1.085, 0.362, 1.468 l 3.5, 3.411 c 0.149, 0.146, 0.218, 0.355, 0.182, 0.56 L 3.29, 17.88 c -0.073, 0.424, 0.038, 0.836, 0.312, 1.162 c 0.426, 0.507, 1.171, 0.661, 1.766, 0.348 l 4.326 -2.274 c 0.181 -0.095, 0.408 -0.094, 0.589, 0 l 4.326, 2.274 c 0.21, 0.111, 0.435, 0.167, 0.666, 0.167 c 0.423, 0, 0.824 -0.188, 1.099 -0.515 c 0.275 -0.325, 0.386 -0.738, 0.312 -1.162 l -0.826 -4.817 c -0.035 -0.205, 0.033 -0.414, 0.182 -0.56 L 19.542, 9.092 z"/></svg>
					<svg class="gitIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><g fill="white"><path d="M 7.19, 16.027 c -0.139, 0.026 -0.199, 0.091 -0.182, 0.195 c 0.017, 0.104, 0.095, 0.138, 0.234, 0.104 c 0.139 -0.035, 0.199 -0.095, 0.182 -0.182 C 7.406, 16.049, 7.328, 16.01, 7.19, 16.027 z"/><path d="M 6.45, 16.131 c -0.138, 0 -0.208, 0.047 -0.208, 0.143 c 0, 0.112, 0.074, 0.16, 0.221, 0.143 c 0.138, 0, 0.208 -0.048, 0.208 -0.143 C 6.671, 16.162, 6.597, 16.114, 6.45, 16.131 z"/><path d="M 5.438, 16.092 c -0.035, 0.095, 0.022, 0.16, 0.169, 0.195 c 0.13, 0.052, 0.212, 0.026, 0.247 -0.078 c 0.026 -0.095 -0.03 -0.164 -0.169 -0.208 C 5.554, 15.967, 5.472, 15.996, 5.438, 16.092 z"/><path d="M 18.837, 1.097 C 18.106, 0.366, 17.226, 0, 16.196, 0 H 3.738 C 2.708, 0, 1.828, 0.366, 1.097, 1.097 C 0.366, 1.828, 0, 2.708, 0, 3.738 v 12.459 c 0, 1.03, 0.366, 1.91, 1.097, 2.641 c 0.731, 0.731, 1.612, 1.097, 2.641, 1.097 h 2.907 c 0.19, 0, 0.333 -0.007, 0.428 -0.019 c 0.095 -0.013, 0.19 -0.069, 0.285 -0.169 c 0.095 -0.099, 0.143 -0.244, 0.143 -0.435 c 0 -0.026 -0.002 -0.32 -0.007 -0.883 c -0.004 -0.562 -0.007 -1.008 -0.007 -1.337 l -0.298, 0.052 c -0.19, 0.035 -0.43, 0.05 -0.72, 0.045 c -0.29 -0.004 -0.59 -0.035 -0.902 -0.091 c -0.312 -0.056 -0.601 -0.186 -0.87 -0.389 c -0.268 -0.203 -0.458 -0.469 -0.571 -0.798 l -0.13 -0.299 c -0.086 -0.199 -0.223 -0.419 -0.409 -0.662 c -0.186 -0.242 -0.374 -0.407 -0.564 -0.493 l -0.091 -0.065 c -0.06 -0.043 -0.117 -0.095 -0.169 -0.156 c -0.052 -0.061 -0.091 -0.121 -0.117 -0.182 c -0.026 -0.061 -0.004 -0.11, 0.065 -0.149 c 0.069 -0.039, 0.195 -0.058, 0.376 -0.058 l 0.259, 0.039 c 0.173, 0.035, 0.387, 0.138, 0.642, 0.311 c 0.255, 0.173, 0.465, 0.398, 0.629, 0.675 c 0.199, 0.355, 0.439, 0.625, 0.72, 0.811 c 0.281, 0.186, 0.565, 0.279, 0.85, 0.279 s 0.532 -0.022, 0.74 -0.065 c 0.208 -0.043, 0.402 -0.108, 0.584 -0.195 c 0.078 -0.58, 0.29 -1.025, 0.636 -1.337 c -0.493 -0.052 -0.936 -0.13 -1.33 -0.234 c -0.394 -0.104 -0.8 -0.272 -1.22 -0.506 c -0.42 -0.234 -0.768 -0.523 -1.045 -0.87 c -0.277 -0.346 -0.504 -0.8 -0.681 -1.363 c -0.177 -0.562 -0.266 -1.211 -0.266 -1.947 c 0 -1.047, 0.342 -1.938, 1.025 -2.673 c -0.32 -0.787 -0.29 -1.67, 0.091 -2.647 c 0.251 -0.078, 0.623 -0.019, 1.116, 0.175 c 0.493, 0.195, 0.854, 0.361, 1.084, 0.5 c 0.229, 0.138, 0.413, 0.255, 0.552, 0.35 c 0.805 -0.225, 1.635 -0.337, 2.492 -0.337 c 0.856, 0, 1.687, 0.112, 2.492, 0.337 l 0.493 -0.311 c 0.338 -0.208, 0.735 -0.398, 1.194 -0.571 c 0.459 -0.173, 0.809 -0.221, 1.051 -0.143 c 0.389, 0.978, 0.424, 1.86, 0.104, 2.647 c 0.683, 0.735, 1.025, 1.627, 1.025, 2.673 c 0, 0.735 -0.089, 1.387 -0.266, 1.953 c -0.177, 0.567 -0.406, 1.021 -0.688, 1.363 c -0.281, 0.342 -0.632, 0.629 -1.051, 0.863 c -0.42, 0.234 -0.826, 0.402 -1.22, 0.506 c -0.394, 0.104 -0.837, 0.182 -1.33, 0.234 c 0.45, 0.389, 0.675, 1.003, 0.675, 1.843 v 3.102 c 0, 0.147, 0.021, 0.266, 0.065, 0.357 c 0.044, 0.091, 0.113, 0.153, 0.208, 0.188 c 0.096, 0.035, 0.18, 0.056, 0.253, 0.065 c 0.074, 0.009, 0.18, 0.013, 0.318, 0.013 h 2.907 c 1.029, 0, 1.91 -0.366, 2.641 -1.097 c 0.731 -0.731, 1.097 -1.612, 1.097 -2.641 V 3.738 C 19.933, 2.708, 19.568, 1.827, 18.837, 1.097 z"/><path d="M 3.945, 14.509 c -0.06, 0.043 -0.052, 0.112, 0.026, 0.208 c 0.087, 0.086, 0.156, 0.1, 0.208, 0.039 c 0.061 -0.043, 0.052 -0.112 -0.026 -0.208 C 4.066, 14.47, 3.997, 14.457, 3.945, 14.509 z"/><path d="M 3.517, 14.184 c -0.026, 0.061, 0.004, 0.113, 0.091, 0.156 c 0.069, 0.043, 0.126, 0.035, 0.169 -0.026 c 0.026 -0.061 -0.004 -0.113 -0.091 -0.156 C 3.599, 14.132, 3.543, 14.141, 3.517, 14.184 z"/><path d="M 4.348, 15.015 c -0.078, 0.043 -0.078, 0.121, 0, 0.234 c 0.078, 0.113, 0.151, 0.143, 0.221, 0.091 c 0.078 -0.061, 0.078 -0.143, 0 -0.247 C 4.499, 14.981, 4.425, 14.954, 4.348, 15.015 z"/><path d="M 4.802, 15.599 c -0.078, 0.069 -0.061, 0.151, 0.052, 0.247 c 0.104, 0.104, 0.19, 0.117, 0.259, 0.039 c 0.069 -0.069, 0.052 -0.151 -0.052 -0.246 C 4.958, 15.534, 4.871, 15.521, 4.802, 15.599 z"/></g></svg>
					<svg class="trashIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><g fill="white"><path d="M 18.012, 0.648 H 12.98 C 12.944, 0.284, 12.637, 0, 12.264, 0 H 8.136 c -0.373, 0 -0.68, 0.284 -0.716, 0.648 H 2.389 c -0.398, 0 -0.72, 0.322 -0.72, 0.72 v 1.368 c 0, 0.398, 0.322, 0.72, 0.72, 0.72 h 15.623 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 1.368 C 18.731, 0.97, 18.409, 0.648, 18.012, 0.648 z"/><path d="M 3.178, 4.839 v 14.841 c 0, 0.397, 0.322, 0.72, 0.72, 0.72 h 12.604 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 4.839 H 3.178 z M 8.449, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 c -0.438, 0 -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z M 13.538, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 s -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z"/></g></svg>
					<button type="button" class="btn-download buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu">
						<div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM">Download</div>
					</button>
				</div>
			</li>`;
			
		this.themeRepoModalMarkup =
			`<span class="themerepo-modal recent-mentions-popout DevilBro-modal">
				<div class="backdrop-2ohBEd"></div>
				<div class="modal-2LIEKY">
					<div class="inner-1_1f7b">
						<div class="modal-3HOjGZ sizeMedium-1-2BNS">
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
								<div class="flexChild-1KGW5q" style="flex: 1 1 auto;">
									<h4 class="h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl themeAmount">Theme Repository</h4>
									<div class="guildName-1u0hy7 small-3-03j1 size12-1IGJl9 height16-1qXrGy primary-2giqSn"></div>
								</div>
								<svg class="btn-cancel close-3ejNTg flexChild-1KGW5q" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
									<g fill="none" fill-rule="evenodd">
										<path d="M0 0h12v12H0"></path>
										<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
									</g>
								</svg>
							</div>
							<div class="header inner-tqJwAU">
								<div class="header-tab-bar-wrapper">
									<div class="tab-bar TOP">
										<div tab="themes" class="tab-bar-item selected">Themes</div>
										<div tab="settings" class="tab-bar-item">Settings</div>
									</div>
									<div class="inputWrapper-3xoRWR vertical-3X17r5 directionColumn-2h-LPR searchWrapper">
										<input type="text" class="input-2YozMi size16-3IvaX_" id="input-search" placeholder="Search for...">
									</div>
									<div class="mention-filter sort-filter">
										<div class="label">Sort by:</div>
										<div option="name" class="value" style="text-transform:none;">Name</div>
									</div>
									<div class="mention-filter order-filter">
										<div class="label">Order:</div>
										<div option="asc" class="value" style="text-transform:none;">Ascending</div>
									</div>
								</div>
							</div>
							<div tab="themes" class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW tab-content">
								<div class="scroller-fzNley inner-tqJwAU ui-standard-sidebar-view">
									<ul class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO bda-slist themes" style="flex: 1 1 auto;"></ul>
								</div>
							</div>
							<div tab="settings" class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO inner-tqJwAU tab-content" style="flex: 1 1 auto;">
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">You can toggle this menu with the "Ctrl" key to take a better look at the preview.</h3>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Preview in light mode</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" id="input-darklight">
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Include Custom CSS in Preview</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" id="input-customcss">
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Include ThemeFixer CSS in Preview</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" id="input-themefixer">
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto; padding-top:8px;">Download ThemeFixer</h3>
									<button type="button" id="download-themefixer" class="flexChild-1KGW5q buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu" style="flex: 0 0 auto;">
										<div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM">Download</div>
									</button>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Hide updated Plugins.</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" value="updated" class="checkboxEnabled-4QfryV checkbox-1KYsPm hide-checkbox" id="input-hideupdated">
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Hide outdated Plugins.</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" value="outdated" class="checkboxEnabled-4QfryV checkbox-1KYsPm hide-checkbox" id="input-hideoutdated">
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Hide downloadable Plugins.</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" value="downloadable" class="checkboxEnabled-4QfryV checkbox-1KYsPm hide-checkbox" id="input-hidedownloadable">
									</div>
								</div>
								<div id="RNMoption" class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Apply Theme after Download (Restart-No-More needed)</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" id="input-rnmstart">
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</span>`;
			
		this.sortPopoutMarkup =
			`<div class="popout popout-bottom-right no-shadow themerepo-sort-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="context-menu recent-mentions-filter-popout">
						<div class="item-group">
							<div option="name" class="item">Name</div>
							<div option="author" class="item">Author</div>
							<div option="version" class="item">Version</div>
							<div option="state" class="item">Update State</div>
							<div option="fav" class="item">Favorites</div>
						</div>
					</div>
				</div>
			</div>`;
			
		this.orderPopoutMarkup =
			`<div class="popout popout-bottom-right no-shadow themerepo-order-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="context-menu recent-mentions-filter-popout">
						<div class="item-group">
							<div option="asc" class="item">Ascending</div>
							<div option="desc" class="item">Descending</div>
						</div>
					</div>
				</div>
			</div>`;
		
		this.css = `
			.discordPreview {
				width:100vw !important;
				height:100vh !important;
				position: absolute !important;
				z-index: 3400 !important;
			}
			.discordPreview ~ #app-mount{
				position: absolute !important;
				top: 0 !important;
			}
			.themerepo-sort-popout,
			.themerepo-order-popout,
			.themerepo-favicon-tooltip,
			.themerepo-giticon-tooltip {
				z-index: 3600 !important;
			}
			.themerepo-modal {
				position: relative !important;
				z-index: 3500 !important;
			}
			.themerepo-modal .inner-1_1f7b {
				min-height: 100%;
			}
			.themerepo-modal .header {
				overflow: visible !important;
			}
			.themerepo-modal .header-tab-bar-wrapper {
				margin-top: 0 !important;
			}
			.themerepo-modal .searchWrapper {
				margin-top: -5px !important;
			}
			.themerepo-modal .searchWrapper #input-search {
				padding: 1px 8px !important;
			}
			.themerepo-modal .themeEntry {
				overflow: visible !important;
			}
			.themerepo-modal .themeEntry .previewCheckboxWrapper {
				position: absolute;
				right: 10px;
				top: 10px;
			}
			.themerepo-modal .themeEntry .gitIcon,
			.themerepo-modal .themeEntry .favIcon,
			.themerepo-modal .themeEntry .trashIcon {
				position: absolute;
				cursor: pointer;
			}
			.themerepo-modal .themeEntry .favIcon {
				right: 90px;
				top: 12px;
			}
			.themerepo-modal .themeEntry .favIcon path {
				stroke: yellow;
				fill: none;
			}
			.themerepo-modal .themeEntry .favIcon.favorized path {
				stroke: yellow;
				fill: yellow;
			}
			.themerepo-modal .themeEntry .gitIcon {
				right: 60px;
				top: 12px;
			}
			.themerepo-modal .themeEntry .trashIcon {
				right: 120px;
				bottom: 25px;
				display: none;
			}
			.themerepo-modal .themeEntry.outdated .trashIcon,
			.themerepo-modal .themeEntry.updated .trashIcon {
				display: block;
			}
			.themerepo-modal .themeEntry .btn-download {
				position: absolute;
				right: 5px; 
				bottom: 10px;
			}
			.themerepo-modal .themeEntry.outdated .btn-download {
				background-color: rgb(240, 71, 71) !important;
			}
			.themerepo-modal .themeEntry.updated .btn-download {
				background-color: rgb(67, 181, 129) !important;
			}`;
	}

	getName () {return "ThemeRepo";}

	getDescription () {return "Allows you to preview all themes from the theme repo and download them on the fly. Repo button is in the theme settings.";}

	getVersion () {return "1.0.7";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
		}
	}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
			
			this.settingsWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.getAttribute("layer-id") == "user-settings") {
									this.innerSettingsWindowObserver.observe(node, {childList:true, subtree:true});
								}
							});
						}
					}
				);
			});
			this.settingsWindowObserver.observe(document.querySelector(".layers"), {childList:true});
			
			this.innerSettingsWindowObserver = new MutationObserver((changes2, _) => {
				changes2.forEach(
					(change2, j) => {
						if (change2.addedNodes) {
							change2.addedNodes.forEach((node2) => {
								if (node2 && node2.tagName && node2.querySelector(".bd-pfbtn") && node2.querySelector("h2") && node2.querySelector("h2").innerText.toLowerCase() === "themes") {
									this.addThemeRepoButton(node2);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".layer[layer-id='user-settings']")) this.innerSettingsWindowObserver.observe(document.querySelector(".layer[layer-id='user-settings']"), {childList:true, subtree:true});
			
			var bdbutton = document.querySelector(".bd-pfbtn");
			if (bdbutton && bdbutton.parentElement.querySelector("h2") && bdbutton.parentElement.querySelector("h2").innerText.toLowerCase() === "themes") {
				this.addThemeRepoButton(bdbutton.parentElement);
			}
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.loadThemes();
			
			this.updateInterval = setInterval(() => {this.checkForNewThemes();},1000*60*30);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
			
			this.settingsWindowObserver.disconnect();
			this.innerSettingsWindowObserver.disconnect();
			
			clearInterval(this.updateInterval);
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			
			$(".discordPreview, .themerepo-modal").remove();
		}
	}

	
	// begin of own functions
	
	addThemeRepoButton (container) {
		if (container && !container.querySelector(".bd-themerepobutton")) {
			$(this.themeRepoButtonMarkup)
				.insertAfter(container.querySelector(".bd-pfbtn"))
				.on("click", () => {
					if (!this.loading) this.openThemeRepoModal(); 
					else BDfunctionsDevilBro.showToast(`Themes are still being fetched. Try again in some seconds.`, {type:"danger"});
				})
				.on("mouseenter", (e) => {
					BDfunctionsDevilBro.createTooltip("Open Theme Repo", e.currentTarget, {type:"right",selector:"themerepo-button-tooltip"});
				});
		}
	}
	
	openThemeRepoModal () {
		var frame = $(this.frameMarkup)[0];
		var lightTheme = BDfunctionsDevilBro.getDiscordTheme() == "theme-light";
		var themeRepoModal = $(this.themeRepoModalMarkup);
		themeRepoModal.updateModal = true;
		themeRepoModal.enableSearch = false;
		var hiddenSettings = BDfunctionsDevilBro.loadAllData(this.getName(), "hidden");
		themeRepoModal.find("#input-darklight").prop("checked", lightTheme);
		themeRepoModal.find("#input-customcss").prop("checked", false);
		themeRepoModal.find("#input-themefixer").prop("checked", false);
		themeRepoModal.find("#input-hideupdated").prop("checked", hiddenSettings.updated);
		themeRepoModal.find("#input-hideoutdated").prop("checked", hiddenSettings.outdated);
		themeRepoModal.find("#input-hidedownloadable").prop("checked", hiddenSettings.downloadable);
		if (!(window.bdplugins["Restart-No-More"] && window.pluginCookie["Restart-No-More"] || window.bdplugins["Restart No More"] && window.pluginCookie["Restart No More"])) {
			themeRepoModal.find("#RNMoption").remove();
		}
		else {
			themeRepoModal.find("#input-rnmstart").prop("checked", BDfunctionsDevilBro.loadData("RNMstart", this.getName(), "settings"));
		}
		themeRepoModal
			.on("keyup." + this.getName(), "#input-search", (e) => {
				if (e.which == 13) {
					themeRepoModal.updateModal = true;
					themeRepoModal.enableSearch = true;
					this.addThemeEntries(themeRepoModal);	
				}
			})
			.on("click." + this.getName(), ".btn-cancel, .backdrop-2ohBEd", () => {
				frame.remove();
				$(document).off("keyup." + this.getName());
				$(window).off("message." + this.getName());
			})
			.on("click." + this.getName(), ".sort-filter", (e) => {
				this.openSortPopout(e, this.sortPopoutMarkup, themeRepoModal, frame);
			})
			.on("click." + this.getName(), ".order-filter", (e) => {
				this.openSortPopout(e, this.orderPopoutMarkup, themeRepoModal, frame);
			})
			.on("change." + this.getName(), "#input-darklight", (e) => {
				frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"DarkLight",checked:$(e.target).prop("checked")},"*");
			})
			.on("change." + this.getName(), "#input-customcss", (e) => {
				var customCSS = document.querySelector("style#customcss");
				if (customCSS && customCSS.innerText.length > 0) 
					frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"CustomCSS",checked:$(e.target).prop("checked"),css:customCSS.innerText},"*");
			})
			.on("change." + this.getName(), "#input-themefixer", (e) => {
				frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"ThemeFixer",checked:$(e.target).prop("checked"),css:this.themeFixerCSS},"*");
			})
			.on("click." + this.getName(), "#download-themefixer", (e) => {
				this.createThemeFile("ThemeFixer.theme.css", `//META{"name":"ThemeFixer","description":"ThemeFixerCSS for transparent themes","author":"xNightWulf","version":"1.0.0"}*//\n\n` + this.themeFixerCSS);
			})
			.on("change." + this.getName(), ".hide-checkbox", (e) => {
				var hideButton = $(e.currentTarget);
				hiddenSettings[hideButton.val()] = hideButton.prop("checked");
				BDfunctionsDevilBro.saveAllData(hiddenSettings, this.getName(), "hidden");
				themeRepoModal.updateModal = true;
			})
			.on("change." + this.getName(), "#input-rnmstart", (e) => {
				BDfunctionsDevilBro.saveData("RNMstart", $(e.currentTarget).prop("checked"), this.getName(), "settings");
			})
			.on("click." + this.getName(), ".tab-bar-item[tab=plugins]:not(.selected)", (e) => {
				this.addThemeEntries(themeRepoModal);
			});
			
		$(document).off("keyup." + this.getName())
			.on("keyup." + this.getName(), (e) => {
				keyPressed(e.which);
			});
		$(window).off("message." + this.getName())
			.on("message." + this.getName(), (e) => {
				e = e.originalEvent;
				if (typeof e.data === "object" && e.data.origin == "DiscordPreview") {
					switch (e.data.reason) {
						case "OnLoad":
							var container = document.querySelector(".container-iksrDt");
							if (!container) return;
							var username = container.querySelector(".username").innerText;
							var avatar = container.querySelector(".avatar-small").style.backgroundImage;
							var discriminator = container.querySelector(".discriminator").innerText;
							
							frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"OnLoad",username,avatar,discriminator},"*");
							frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"DarkLight",checked:lightTheme},"*");
							break;
						case "KeyUp":
							keyPressed(e.data.key);
							break;
					}
				}
			});
			
		this.addThemeEntries(themeRepoModal, frame);
			
		BDfunctionsDevilBro.appendModal(themeRepoModal);
		$(frame).insertBefore("#app-mount");
			
		function keyPressed (key) {
			if (key == 17) themeRepoModal.toggle();
			if (key == 27) frame.remove();
		}
	}
	
	openSortPopout (e, markup, modal, frame) {
		var wrapper = e.currentTarget;
		if (wrapper.classList.contains("popout-open")) return;
		wrapper.classList.add("popout-open");
		var value = $(wrapper).find(".value");
		var popout = $(markup);
		$(".popouts").append(popout)
			.off("click", ".item")
			.on("click", ".item", (e2) => {
				value.text($(e2.currentTarget).text());
				value.attr("option", $(e2.currentTarget).attr("option"));
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				modal.updateModal = true;
				this.addThemeEntries(modal, frame);
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			});
			
		popout
			.css("left", $(wrapper).offset().left + $(wrapper).outerWidth() + "px")
			.css("top", $(wrapper).offset().top + value.outerHeight() + "px")
			.find(".context-menu").addClass(BDfunctionsDevilBro.getDiscordTheme());
			
		$(document).on("mousedown.sortpopout" + this.getName(), (e2) => {
			if (popout.has(e2.target).length == 0) {
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			}
		});
	}
	
	addThemeEntries (modal, frame) {
		if (!modal.updateModal) return;
		modal.updateModal = false;
		modal.find(".themeEntry").remove();
		var favorites = BDfunctionsDevilBro.loadAllData(this.getName(), "favorites");
		var themes = [];
		for (var url in this.loadedThemes) {
			this.loadedThemes[url].fav = favorites[url] ? false : true;
			var installedTheme = window.bdthemes[this.loadedThemes[url].name];
			if (installedTheme) {
				if (installedTheme.version != this.loadedThemes[url].version) {
					this.loadedThemes[url].state = 1;
				}
				else {
					this.loadedThemes[url].state = 0;
				}
			}
			else {
				this.loadedThemes[url].state = 2;
			}
			themes.push(this.loadedThemes[url]);
		}
		if (modal.find("#input-hideupdated").prop("checked")) 		themes = themes.filter((theme) => {return theme.state != 0 ? theme : null;});
		if (modal.find("#input-hideoutdated").prop("checked")) 		themes = themes.filter((theme) => {return theme.state != 1 ? theme : null;});
		if (modal.find("#input-hidedownloadable").prop("checked")) 	themes = themes.filter((theme) => {return theme.state != 2 ? theme : null;});
		if (modal.enableSearch) {
			var searchInput = modal.find("#input-search");
			themes = themes.filter((theme) => {
				var themeText = theme.name + " " + theme.version + " " + theme.author + " " + theme.description;
				return themeText.toLowerCase().indexOf(searchInput.val().toLowerCase()) > -1 ? theme : null;
			});
			modal.enableSearch = false;
			searchInput.val("");
		}
		themes = BDfunctionsDevilBro.sortArrayByKey(themes, modal.find(".sort-filter .value").attr("option"));
		if (modal.find(".order-filter .value").attr("option") == "desc") themes.reverse();
		modal.find(".themeAmount").text("Theme Repository " + themes.length + "/" + Object.keys(this.loadedThemes).length + " Themes");
		for (let theme of themes) {
			let entry = $(this.themeEntryMarkup);
			modal.find(".themes").append(entry);
			entry.find(".bda-name").html(theme.name + (theme.version ? " v" + theme.version : "") + (theme.author ? " by " + theme.author : ""));
			entry.find(".bda-description").html(theme.description);
			if (theme.state != 2) {
				if (theme.state == 1) {
					entry.addClass("outdated")
						.find(".btn-download div").text("Outdated");
				}
				else {
					entry.addClass("updated")
						.find(".btn-download div").text("Updated");
				}
			}
			if (!theme.fav) entry.find(".favIcon")[0].classList.add("favorized");
			entry
				.on("change." + this.getName(), ".previewCheckbox", (e) => {
					modal.find(".previewCheckbox").not(e.target).prop("checked", false);
					modal.find(".previewCheckbox").each((_, checkBox) => {
						$(checkBox.parentElement)
							.toggleClass("valueChecked-3Bzkbm", $(checkBox).prop("checked"))
							.toggleClass("valueUnchecked-XR6AOk", $(checkBox).prop("checked"));
					});
					frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"NewTheme",checked:$(e.target).prop("checked"),css:theme.css},"*");
				})
				.on("click." + this.getName(), ".favIcon", (e) => {
					e.currentTarget.classList.toggle("favorized");
					if (e.currentTarget.classList.contains("favorized")) favorites[theme.url] = true;
					else delete favorites[theme.url];
					BDfunctionsDevilBro.saveAllData(favorites, this.getName(), "favorites");
				})
				.on("click." + this.getName(), ".gitIcon", (e) => {
					var giturl = null;
					if (theme.url.indexOf("https://raw.githubusercontent.com") == 0) {
						giturl = theme.url.replace("//raw.githubusercontent", "//github").replace("/master/", "/blob/master/");
					}
					else if (theme.url.indexOf("https://gist.githubusercontent.com/") == 0) {
						giturl = theme.url.replace("//gist.githubusercontent", "//gist.github").split("/raw/")[0];
					}
					if (giturl) {
						window.open(giturl, "_blank");
					}
				})
				.on("click." + this.getName(), ".trashIcon", () => {
					if (entry.hasClass("outdated") || entry.hasClass("updated") {
						entry.removeClass("outdated").removeClass("updated")
							.find(".btn-download div").text("Download");
						this.deleteThemeFile(theme);
						if (!(window.bdplugins["Restart-No-More"] && window.pluginCookie["Restart-No-More"] || window.bdplugins["Restart No More"] && window.pluginCookie["Restart No More"])) removeTheme(theme);
					}
				})
				.on("mouseenter." + this.getName(), ".favIcon", (e) => {
					BDfunctionsDevilBro.createTooltip("Favorize", e.currentTarget, {type:"top",selector:"themerepo-favicon-tooltip"});
				})
				.on("mouseenter." + this.getName(), ".gitIcon", (e) => {
					BDfunctionsDevilBro.createTooltip("Go to Git", e.currentTarget, {type:"top",selector:"themerepo-giticon-tooltip"});
				})
				.on("mouseenter." + this.getName(), ".trashIcon", (e) => {
					BDfunctionsDevilBro.createTooltip("Delete Pluginfile", e.currentTarget, {type:"top",selector:"themerepo-trashIcon-tooltip"});
				})
				.on("click." + this.getName(), ".btn-download", () => {
					this.downloadTheme(theme);
					entry.removeClass("outdated").addClass("updated")
						.find(".btn-download div").text("Updated");
					if (modal.find("#input-rnmstart").prop("checked")) setTimeout(() => {this.applyTheme(theme);},3000);
				});
		}
	}
	
	loadThemes () {
		var i = 0;
		var tags = ["name","description","author","version"];
		let request = require("request");
		request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeList.txt", (error, response, result) => {
			if (response) {
				this.loadedThemes = {};
				this.grabbedThemes = result.split("\n");
				this.loading = true;
				getThemeInfo(this.grabbedThemes, this.loadedThemes, () => {
					this.loading = false;
					console.log("ThemeRepo: Finished fetching Themes.");
					if (document.querySelector(".bd-themerepobutton")) BDfunctionsDevilBro.showToast(`Finished fetching Themes.`, {type:"success"});
				});
			}
		});
		
		function getThemeInfo (grabbedThemes, loadedThemes, callback) {
			if (i >= grabbedThemes.length) {
				callback();
				return;
			}
			let url = grabbedThemes[i].replace(new RegExp("[\\r|\\n|\\t]", "g"), "");
			request(url, (error, response, body) => {
				if (response) {
					let theme = {};
					let text = body;
					if (text.split("*//").length > 1 && text.split("\n").length > 1) {
						for (let tag of tags) {
							let temp = text.replace(new RegExp("\\s*\:\\s*", "g"), ":").replace(new RegExp("\\s*\}\\s*", "g"), "}").split('"' + tag + '":"');
							temp = temp.length > 1 ? temp[1].split('",')[0].split('"}')[0] : null;
							temp = temp && tag != "version" ? temp.charAt(0).toUpperCase() + temp.slice(1) : temp;
							theme[tag] = temp;
						}
						theme.css = text.split("\n").slice(1).join("\n").replace(new RegExp("[\\r|\\n|\\t]", "g"), "");
						theme.url = url;
						loadedThemes[url] = theme;
					}
				}
				i++;
				getThemeInfo(grabbedThemes, loadedThemes, callback);
			});
		}
	}
	
	checkForNewThemes () {
		let request = require("request");
		request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeList.txt", (error, response, result) => {
			if (response && !BDfunctionsDevilBro.equals(result.split("\n"), this.grabbedThemes)) this.loadedThemes();
		});
	}
	
	downloadTheme (theme) {
		let request = require("request");
		request(theme.url, (error, response, body) => {
			if (error) {
				BDfunctionsDevilBro.showToast(`Unable to download Theme "${theme.name}".`, {type:"danger"});
			}
			else {
				let filename = theme.url.split("/");
				this.createThemeFile(filename[filename.length - 1], body);
			}
		});
	}
	
	createThemeFile (filename, content) {
		let fileSystem = require("fs");
		let path = require("path");
		var file = path.join(BDfunctionsDevilBro.getThemesFolder(), filename);
		fileSystem.writeFile(file, content, (error) => {
			if (error) {
				BDfunctionsDevilBro.showToast(`Unable to save Theme "${filename}".`, {type:"danger"});
			}
			else {
				BDfunctionsDevilBro.showToast(`Successfully saved Theme "${filename}".`, {type:"success"});
			}
		});
	}
	
	applyTheme (theme) {
		var name = theme.name;
		if (typeof window.bdthemes[name] == "object" && window.themeCookie[name] == false) {
			$(`style#${name}`).remove();
			$("head").append(`<style id=${name}>${theme.css}</style>`);
			window.themeCookie[name] = true;
			console.log("ThemeRepo: applied Theme " + name);
		}
	}
	
	deleteThemeFile (theme) {
		let fileSystem = require("fs");
		let path = require("path");
		let filename = theme.url.split("/");
		filename = filename[filename.length - 1];
		var file = path.join(BDfunctionsDevilBro.getThemesFolder(), filename);
		fileSystem.unlink(file, (error) => {
			if (error) {
				BDfunctionsDevilBro.showToast(`Unable to delete Theme "${filename}".`, {type:"danger"});
			}
			else {
				BDfunctionsDevilBro.showToast(`Successfully deleted Theme "${filename}".`, {type:"success"});
			}
		});
	}
	
	removeTheme (plugin) {
		var name = theme.name;
		if (typeof window.bdthemes[name] == "object" && window.themeCookie[name] == true) {
			$(`style#${name}`).remove();
			window.themeCookie[name] = false;
			delete window.bdthemes[name];
			console.log("ThemeRepo: removed Theme " + name);
		}
	}
}
