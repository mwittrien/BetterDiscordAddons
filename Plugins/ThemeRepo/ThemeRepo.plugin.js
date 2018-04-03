//META{"name":"ThemeRepo"}*//

class ThemeRepo {
	constructor () {
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
		
		this.loading = false;
		
		this.grabbedThemes = [];
		this.foundThemes = [];
		this.loadedThemes = {};
		
		this.updateInterval;
		
		this.themeFixerCSS = `#friends, .noChannel-2EQ0a9, .activityFeed-HeiGwL, .lfg-3xoFkI, .app, .layers-20RVFW, .layer-kosS71, .container-2OU7Cz, .content-region, .guilds-wrapper, .search-2--6aU .search-bar, .chat .inner-3if5cm, .search-results-wrap, .search-results-wrap .search-header, .search-results-wrap .search-result-message.hit, .sidebar-region, .ui-standard-sidebar-view, .channels-3g2vYe, .container-iksrDt {background: rgba(0,0,0,0.3) !important;}  .search-results-wrap .search-result-message.hit {box-shadow:none !important;}  .titleBar-3_fDwJ::after {content:""; position:absolute; z-index:-1; top:0; left:0; right:0; width:100%; height:22px; background: rgba(0,0,0,0.8) !important;}  #friends .friends-table, .channel-members, .members-1bid1J, .loading-316uYQ, .chat .content, .chat form, .chat, .content .flex-spacer, .messages-wrapper, .typing-3eiiL_, .container-RYiLUQ, .headerBar-cxbhPD, .titleBar-3_fDwJ, .titleWrapper-3Vi_wz .title-qAcLxz, .search-results-wrap .search-result::before, .search-results-wrap .search-result::after, .search-results-wrap .channel-name {background: transparent !important;}  ::-webkit-scrollbar-thumb {border-color: transparent !important; background: rgba(0,0,0,0.8) !important;} ::-webkit-scrollbar, ::-webkit-scrollbar-track-piece {border-color: transparent !important; background: transparent !important;} ::-webkit-scrollbar-corner {display: none !important;}`;
		
		this.themeRepoButtonMarkup = 
			`<button class="bd-pfbtn bd-themerepobutton">Theme Repo</button>`;
		
		this.settingsContextEntryMarkup =
			`<div class="item-1XYaYf themerepo-item">
				<span>Theme Repo</span>
				<div class="hint-3TJykr"></div>
			</div>`;
		
		this.frameMarkup = 
			`<iframe class="discordPreview" src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/DiscordPreview.html"></iframe>`;

		this.themeEntryMarkup =
			`<li class="themeEntry jiiks">
				<div class="bda-left">
					<span class="bda-name"></span>
					<div class="scrollerWrap-2uBjct scrollerThemed-19vinI">
						<div class="scroller-fzNley bda-description"></div>
					</div>
				</div>
				<div class="bda-right">
					<div class="bda-header">
						<svg class="favIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><path fill="none" stroke="black" d="M 19.542, 9.092 c 0.393 -0.383, 0.532 -0.946, 0.362 -1.468 c -0.17 -0.523 -0.613 -0.896 -1.157 -0.975 l -4.837 -0.703 c -0.206 -0.03 -0.384 -0.159 -0.476 -0.346 L 11.273, 1.217 c -0.243 -0.492 -0.736 -0.798 -1.285 -0.798 c -0.549, 0 -1.042, 0.306 -1.284, 0.798 L 6.541, 5.6 c -0.092, 0.187 -0.27, 0.316 -0.476, 0.346 L 1.228, 6.649 c -0.544, 0.079 -0.987, 0.452 -1.157, 0.975 c -0.17, 0.523 -0.031, 1.085, 0.362, 1.468 l 3.5, 3.411 c 0.149, 0.146, 0.218, 0.355, 0.182, 0.56 L 3.29, 17.88 c -0.073, 0.424, 0.038, 0.836, 0.312, 1.162 c 0.426, 0.507, 1.171, 0.661, 1.766, 0.348 l 4.326 -2.274 c 0.181 -0.095, 0.408 -0.094, 0.589, 0 l 4.326, 2.274 c 0.21, 0.111, 0.435, 0.167, 0.666, 0.167 c 0.423, 0, 0.824 -0.188, 1.099 -0.515 c 0.275 -0.325, 0.386 -0.738, 0.312 -1.162 l -0.826 -4.817 c -0.035 -0.205, 0.033 -0.414, 0.182 -0.56 L 19.542, 9.092 z"/></svg>
						<svg class="gitIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><g fill="white"><path d="M 7.19, 16.027 c -0.139, 0.026 -0.199, 0.091 -0.182, 0.195 c 0.017, 0.104, 0.095, 0.138, 0.234, 0.104 c 0.139 -0.035, 0.199 -0.095, 0.182 -0.182 C 7.406, 16.049, 7.328, 16.01, 7.19, 16.027 z"/><path d="M 6.45, 16.131 c -0.138, 0 -0.208, 0.047 -0.208, 0.143 c 0, 0.112, 0.074, 0.16, 0.221, 0.143 c 0.138, 0, 0.208 -0.048, 0.208 -0.143 C 6.671, 16.162, 6.597, 16.114, 6.45, 16.131 z"/><path d="M 5.438, 16.092 c -0.035, 0.095, 0.022, 0.16, 0.169, 0.195 c 0.13, 0.052, 0.212, 0.026, 0.247 -0.078 c 0.026 -0.095 -0.03 -0.164 -0.169 -0.208 C 5.554, 15.967, 5.472, 15.996, 5.438, 16.092 z"/><path d="M 18.837, 1.097 C 18.106, 0.366, 17.226, 0, 16.196, 0 H 3.738 C 2.708, 0, 1.828, 0.366, 1.097, 1.097 C 0.366, 1.828, 0, 2.708, 0, 3.738 v 12.459 c 0, 1.03, 0.366, 1.91, 1.097, 2.641 c 0.731, 0.731, 1.612, 1.097, 2.641, 1.097 h 2.907 c 0.19, 0, 0.333 -0.007, 0.428 -0.019 c 0.095 -0.013, 0.19 -0.069, 0.285 -0.169 c 0.095 -0.099, 0.143 -0.244, 0.143 -0.435 c 0 -0.026 -0.002 -0.32 -0.007 -0.883 c -0.004 -0.562 -0.007 -1.008 -0.007 -1.337 l -0.298, 0.052 c -0.19, 0.035 -0.43, 0.05 -0.72, 0.045 c -0.29 -0.004 -0.59 -0.035 -0.902 -0.091 c -0.312 -0.056 -0.601 -0.186 -0.87 -0.389 c -0.268 -0.203 -0.458 -0.469 -0.571 -0.798 l -0.13 -0.299 c -0.086 -0.199 -0.223 -0.419 -0.409 -0.662 c -0.186 -0.242 -0.374 -0.407 -0.564 -0.493 l -0.091 -0.065 c -0.06 -0.043 -0.117 -0.095 -0.169 -0.156 c -0.052 -0.061 -0.091 -0.121 -0.117 -0.182 c -0.026 -0.061 -0.004 -0.11, 0.065 -0.149 c 0.069 -0.039, 0.195 -0.058, 0.376 -0.058 l 0.259, 0.039 c 0.173, 0.035, 0.387, 0.138, 0.642, 0.311 c 0.255, 0.173, 0.465, 0.398, 0.629, 0.675 c 0.199, 0.355, 0.439, 0.625, 0.72, 0.811 c 0.281, 0.186, 0.565, 0.279, 0.85, 0.279 s 0.532 -0.022, 0.74 -0.065 c 0.208 -0.043, 0.402 -0.108, 0.584 -0.195 c 0.078 -0.58, 0.29 -1.025, 0.636 -1.337 c -0.493 -0.052 -0.936 -0.13 -1.33 -0.234 c -0.394 -0.104 -0.8 -0.272 -1.22 -0.506 c -0.42 -0.234 -0.768 -0.523 -1.045 -0.87 c -0.277 -0.346 -0.504 -0.8 -0.681 -1.363 c -0.177 -0.562 -0.266 -1.211 -0.266 -1.947 c 0 -1.047, 0.342 -1.938, 1.025 -2.673 c -0.32 -0.787 -0.29 -1.67, 0.091 -2.647 c 0.251 -0.078, 0.623 -0.019, 1.116, 0.175 c 0.493, 0.195, 0.854, 0.361, 1.084, 0.5 c 0.229, 0.138, 0.413, 0.255, 0.552, 0.35 c 0.805 -0.225, 1.635 -0.337, 2.492 -0.337 c 0.856, 0, 1.687, 0.112, 2.492, 0.337 l 0.493 -0.311 c 0.338 -0.208, 0.735 -0.398, 1.194 -0.571 c 0.459 -0.173, 0.809 -0.221, 1.051 -0.143 c 0.389, 0.978, 0.424, 1.86, 0.104, 2.647 c 0.683, 0.735, 1.025, 1.627, 1.025, 2.673 c 0, 0.735 -0.089, 1.387 -0.266, 1.953 c -0.177, 0.567 -0.406, 1.021 -0.688, 1.363 c -0.281, 0.342 -0.632, 0.629 -1.051, 0.863 c -0.42, 0.234 -0.826, 0.402 -1.22, 0.506 c -0.394, 0.104 -0.837, 0.182 -1.33, 0.234 c 0.45, 0.389, 0.675, 1.003, 0.675, 1.843 v 3.102 c 0, 0.147, 0.021, 0.266, 0.065, 0.357 c 0.044, 0.091, 0.113, 0.153, 0.208, 0.188 c 0.096, 0.035, 0.18, 0.056, 0.253, 0.065 c 0.074, 0.009, 0.18, 0.013, 0.318, 0.013 h 2.907 c 1.029, 0, 1.91 -0.366, 2.641 -1.097 c 0.731 -0.731, 1.097 -1.612, 1.097 -2.641 V 3.738 C 19.933, 2.708, 19.568, 1.827, 18.837, 1.097 z"/><path d="M 3.945, 14.509 c -0.06, 0.043 -0.052, 0.112, 0.026, 0.208 c 0.087, 0.086, 0.156, 0.1, 0.208, 0.039 c 0.061 -0.043, 0.052 -0.112 -0.026 -0.208 C 4.066, 14.47, 3.997, 14.457, 3.945, 14.509 z"/><path d="M 3.517, 14.184 c -0.026, 0.061, 0.004, 0.113, 0.091, 0.156 c 0.069, 0.043, 0.126, 0.035, 0.169 -0.026 c 0.026 -0.061 -0.004 -0.113 -0.091 -0.156 C 3.599, 14.132, 3.543, 14.141, 3.517, 14.184 z"/><path d="M 4.348, 15.015 c -0.078, 0.043 -0.078, 0.121, 0, 0.234 c 0.078, 0.113, 0.151, 0.143, 0.221, 0.091 c 0.078 -0.061, 0.078 -0.143, 0 -0.247 C 4.499, 14.981, 4.425, 14.954, 4.348, 15.015 z"/><path d="M 4.802, 15.599 c -0.078, 0.069 -0.061, 0.151, 0.052, 0.247 c 0.104, 0.104, 0.19, 0.117, 0.259, 0.039 c 0.069 -0.069, 0.052 -0.151 -0.052 -0.246 C 4.958, 15.534, 4.871, 15.521, 4.802, 15.599 z"/></g></svg>
						<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU previewCheckboxWrapper" style="flex: 0 0 auto;">
							<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm previewCheckbox">
						</div>
					</div>
					<div class="bda-footer">
						<svg class="trashIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><g fill="white"><path d="M 18.012, 0.648 H 12.98 C 12.944, 0.284, 12.637, 0, 12.264, 0 H 8.136 c -0.373, 0 -0.68, 0.284 -0.716, 0.648 H 2.389 c -0.398, 0 -0.72, 0.322 -0.72, 0.72 v 1.368 c 0, 0.398, 0.322, 0.72, 0.72, 0.72 h 15.623 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 1.368 C 18.731, 0.97, 18.409, 0.648, 18.012, 0.648 z"/><path d="M 3.178, 4.839 v 14.841 c 0, 0.397, 0.322, 0.72, 0.72, 0.72 h 12.604 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 4.839 H 3.178 z M 8.449, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 c -0.438, 0 -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z M 13.538, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 s -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z"/></g></svg>
						<button class="btn-download bda-settings-button">Download</button>
					</div>
				</div>
			</li>`;

		this.themeEntryZackMarkup =
			`<li class="themeEntry settings-closed ui-switch-item zack">
				<div class="bda-header">
					<span class="bda-header-title">
						<span class="bda-name"></span> v<span class="bda-version"></span> by <span class="bda-author"></span>
					</span>
					<svg class="favIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><path fill="none" stroke="black" d="M 19.542, 9.092 c 0.393 -0.383, 0.532 -0.946, 0.362 -1.468 c -0.17 -0.523 -0.613 -0.896 -1.157 -0.975 l -4.837 -0.703 c -0.206 -0.03 -0.384 -0.159 -0.476 -0.346 L 11.273, 1.217 c -0.243 -0.492 -0.736 -0.798 -1.285 -0.798 c -0.549, 0 -1.042, 0.306 -1.284, 0.798 L 6.541, 5.6 c -0.092, 0.187 -0.27, 0.316 -0.476, 0.346 L 1.228, 6.649 c -0.544, 0.079 -0.987, 0.452 -1.157, 0.975 c -0.17, 0.523 -0.031, 1.085, 0.362, 1.468 l 3.5, 3.411 c 0.149, 0.146, 0.218, 0.355, 0.182, 0.56 L 3.29, 17.88 c -0.073, 0.424, 0.038, 0.836, 0.312, 1.162 c 0.426, 0.507, 1.171, 0.661, 1.766, 0.348 l 4.326 -2.274 c 0.181 -0.095, 0.408 -0.094, 0.589, 0 l 4.326, 2.274 c 0.21, 0.111, 0.435, 0.167, 0.666, 0.167 c 0.423, 0, 0.824 -0.188, 1.099 -0.515 c 0.275 -0.325, 0.386 -0.738, 0.312 -1.162 l -0.826 -4.817 c -0.035 -0.205, 0.033 -0.414, 0.182 -0.56 L 19.542, 9.092 z"/></svg>
					<svg class="gitIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><g fill="white"><path d="M 7.19, 16.027 c -0.139, 0.026 -0.199, 0.091 -0.182, 0.195 c 0.017, 0.104, 0.095, 0.138, 0.234, 0.104 c 0.139 -0.035, 0.199 -0.095, 0.182 -0.182 C 7.406, 16.049, 7.328, 16.01, 7.19, 16.027 z"/><path d="M 6.45, 16.131 c -0.138, 0 -0.208, 0.047 -0.208, 0.143 c 0, 0.112, 0.074, 0.16, 0.221, 0.143 c 0.138, 0, 0.208 -0.048, 0.208 -0.143 C 6.671, 16.162, 6.597, 16.114, 6.45, 16.131 z"/><path d="M 5.438, 16.092 c -0.035, 0.095, 0.022, 0.16, 0.169, 0.195 c 0.13, 0.052, 0.212, 0.026, 0.247 -0.078 c 0.026 -0.095 -0.03 -0.164 -0.169 -0.208 C 5.554, 15.967, 5.472, 15.996, 5.438, 16.092 z"/><path d="M 18.837, 1.097 C 18.106, 0.366, 17.226, 0, 16.196, 0 H 3.738 C 2.708, 0, 1.828, 0.366, 1.097, 1.097 C 0.366, 1.828, 0, 2.708, 0, 3.738 v 12.459 c 0, 1.03, 0.366, 1.91, 1.097, 2.641 c 0.731, 0.731, 1.612, 1.097, 2.641, 1.097 h 2.907 c 0.19, 0, 0.333 -0.007, 0.428 -0.019 c 0.095 -0.013, 0.19 -0.069, 0.285 -0.169 c 0.095 -0.099, 0.143 -0.244, 0.143 -0.435 c 0 -0.026 -0.002 -0.32 -0.007 -0.883 c -0.004 -0.562 -0.007 -1.008 -0.007 -1.337 l -0.298, 0.052 c -0.19, 0.035 -0.43, 0.05 -0.72, 0.045 c -0.29 -0.004 -0.59 -0.035 -0.902 -0.091 c -0.312 -0.056 -0.601 -0.186 -0.87 -0.389 c -0.268 -0.203 -0.458 -0.469 -0.571 -0.798 l -0.13 -0.299 c -0.086 -0.199 -0.223 -0.419 -0.409 -0.662 c -0.186 -0.242 -0.374 -0.407 -0.564 -0.493 l -0.091 -0.065 c -0.06 -0.043 -0.117 -0.095 -0.169 -0.156 c -0.052 -0.061 -0.091 -0.121 -0.117 -0.182 c -0.026 -0.061 -0.004 -0.11, 0.065 -0.149 c 0.069 -0.039, 0.195 -0.058, 0.376 -0.058 l 0.259, 0.039 c 0.173, 0.035, 0.387, 0.138, 0.642, 0.311 c 0.255, 0.173, 0.465, 0.398, 0.629, 0.675 c 0.199, 0.355, 0.439, 0.625, 0.72, 0.811 c 0.281, 0.186, 0.565, 0.279, 0.85, 0.279 s 0.532 -0.022, 0.74 -0.065 c 0.208 -0.043, 0.402 -0.108, 0.584 -0.195 c 0.078 -0.58, 0.29 -1.025, 0.636 -1.337 c -0.493 -0.052 -0.936 -0.13 -1.33 -0.234 c -0.394 -0.104 -0.8 -0.272 -1.22 -0.506 c -0.42 -0.234 -0.768 -0.523 -1.045 -0.87 c -0.277 -0.346 -0.504 -0.8 -0.681 -1.363 c -0.177 -0.562 -0.266 -1.211 -0.266 -1.947 c 0 -1.047, 0.342 -1.938, 1.025 -2.673 c -0.32 -0.787 -0.29 -1.67, 0.091 -2.647 c 0.251 -0.078, 0.623 -0.019, 1.116, 0.175 c 0.493, 0.195, 0.854, 0.361, 1.084, 0.5 c 0.229, 0.138, 0.413, 0.255, 0.552, 0.35 c 0.805 -0.225, 1.635 -0.337, 2.492 -0.337 c 0.856, 0, 1.687, 0.112, 2.492, 0.337 l 0.493 -0.311 c 0.338 -0.208, 0.735 -0.398, 1.194 -0.571 c 0.459 -0.173, 0.809 -0.221, 1.051 -0.143 c 0.389, 0.978, 0.424, 1.86, 0.104, 2.647 c 0.683, 0.735, 1.025, 1.627, 1.025, 2.673 c 0, 0.735 -0.089, 1.387 -0.266, 1.953 c -0.177, 0.567 -0.406, 1.021 -0.688, 1.363 c -0.281, 0.342 -0.632, 0.629 -1.051, 0.863 c -0.42, 0.234 -0.826, 0.402 -1.22, 0.506 c -0.394, 0.104 -0.837, 0.182 -1.33, 0.234 c 0.45, 0.389, 0.675, 1.003, 0.675, 1.843 v 3.102 c 0, 0.147, 0.021, 0.266, 0.065, 0.357 c 0.044, 0.091, 0.113, 0.153, 0.208, 0.188 c 0.096, 0.035, 0.18, 0.056, 0.253, 0.065 c 0.074, 0.009, 0.18, 0.013, 0.318, 0.013 h 2.907 c 1.029, 0, 1.91 -0.366, 2.641 -1.097 c 0.731 -0.731, 1.097 -1.612, 1.097 -2.641 V 3.738 C 19.933, 2.708, 19.568, 1.827, 18.837, 1.097 z"/><path d="M 3.945, 14.509 c -0.06, 0.043 -0.052, 0.112, 0.026, 0.208 c 0.087, 0.086, 0.156, 0.1, 0.208, 0.039 c 0.061 -0.043, 0.052 -0.112 -0.026 -0.208 C 4.066, 14.47, 3.997, 14.457, 3.945, 14.509 z"/><path d="M 3.517, 14.184 c -0.026, 0.061, 0.004, 0.113, 0.091, 0.156 c 0.069, 0.043, 0.126, 0.035, 0.169 -0.026 c 0.026 -0.061 -0.004 -0.113 -0.091 -0.156 C 3.599, 14.132, 3.543, 14.141, 3.517, 14.184 z"/><path d="M 4.348, 15.015 c -0.078, 0.043 -0.078, 0.121, 0, 0.234 c 0.078, 0.113, 0.151, 0.143, 0.221, 0.091 c 0.078 -0.061, 0.078 -0.143, 0 -0.247 C 4.499, 14.981, 4.425, 14.954, 4.348, 15.015 z"/><path d="M 4.802, 15.599 c -0.078, 0.069 -0.061, 0.151, 0.052, 0.247 c 0.104, 0.104, 0.19, 0.117, 0.259, 0.039 c 0.069 -0.069, 0.052 -0.151 -0.052 -0.246 C 4.958, 15.534, 4.871, 15.521, 4.802, 15.599 z"/></g></svg>
					<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU previewCheckboxWrapper" style="flex: 0 0 auto;">
						<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm previewCheckbox">
					</div>
				</div>
				<div class="bda-description-wrap scroller-wrap fade">
					<div class="bda-description scroller" style="display: block;"></div>
				</div>
				<div class="bda-footer">
					<span class="bda-links"></span>
					<svg class="trashIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><g fill="white"><path d="M 18.012, 0.648 H 12.98 C 12.944, 0.284, 12.637, 0, 12.264, 0 H 8.136 c -0.373, 0 -0.68, 0.284 -0.716, 0.648 H 2.389 c -0.398, 0 -0.72, 0.322 -0.72, 0.72 v 1.368 c 0, 0.398, 0.322, 0.72, 0.72, 0.72 h 15.623 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 1.368 C 18.731, 0.97, 18.409, 0.648, 18.012, 0.648 z"/><path d="M 3.178, 4.839 v 14.841 c 0, 0.397, 0.322, 0.72, 0.72, 0.72 h 12.604 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 4.839 H 3.178 z M 8.449, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 c -0.438, 0 -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z M 13.538, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 s -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z"/></g></svg>
					<button class="btn-download bda-settings-button">Download</button>
				</div>
			</li>`;
			
		this.themeRepoModalMarkup =
			`<span class="themerepo-modal DevilBro-modal">
				<div class="backdrop-2ohBEd"></div>
				<div class="modal-2LIEKY">
					<div class="inner-1_1f7b">
						<div class="modal-3HOjGZ sizeLarge-1AHXtx">
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto; padding: 20px 20px 0 20px;">
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
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE marginBottom20-2Ifj-2" style="flex: 0 0 auto; padding: 10px 20px 0px 20px;">
								<div tab="themes" class="tab selected">Themes</div>
								<div tab="settings" class="tab">Settings</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO searchBar-YMJBu9 size14-1wjlWP" style="flex: 1 1 auto; margin: -15px 5px 0 0;">
									<input class="input-yt44Uw flexChild-1KGW5q" value="" placeholder="Search for ..." style="flex: 1 1 auto;">
									<div class="searchBarIcon-vCfmUl flexChild-1KGW5q">
										<i class="icon-11Zny- eyeGlass-6rahZf visible-4lw4vs"/>
										<i class="icon-11Zny- clear-4pSDsx"/>
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO quickSelect-2sgeoi" style="padding-bottom: 15px;">
									<div class="quickSelectLabel-2MM1ZS">Sort by:</div>
									<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO quickSelectClick-36aPV0 sort-filter" style="flex: 0 0 auto;">
										<div option="${Object.keys(this.sortings.sort)[0]}" class="quickSelectValue-23jNHW">${this.sortings.sort[Object.keys(this.sortings.sort)[0]]}</div>
										<div class="quickSelectArrow-1lyLly"></div>
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO quickSelect-2sgeoi" style="padding-bottom: 15px;">
									<div class="quickSelectLabel-2MM1ZS">Order:</div>
									<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO quickSelectClick-36aPV0 order-filter" style="flex: 0 0 auto;">
										<div option="${Object.keys(this.sortings.order)[0]}" class="quickSelectValue-23jNHW">${this.sortings.order[Object.keys(this.sortings.order)[0]]}</div>
										<div class="quickSelectArrow-1lyLly"></div>
									</div>
								</div>
							</div>
							<div tab="themes" class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW tab-content">
								<div class="scroller-fzNley inner-tqJwAU ui-standard-sidebar-view">
									<ul class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO bda-slist themes" style="flex: 1 1 auto;"></ul>
								</div>
							</div>
							<div tab="settings" class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO inner-tqJwAU tab-content" style="flex: 1 1 auto;">
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">You can toggle this menu with the "Ctrl" key to take a better look at the preview.</h3>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Preview in light mode</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" id="input-darklight">
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Include Custom CSS in Preview</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" id="input-customcss">
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Include ThemeFixer CSS in Preview</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" class="checkboxEnabled-4QfryV checkbox-1KYsPm" id="input-themefixer">
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Download ThemeFixer</h3>
									<button type="button" id="download-themefixer" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" style="flex: 0 0 auto;">
										<div class="contents-4L4hQM">Download</div>
									</button>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Hide updated Themes.</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" value="updated" class="checkboxEnabled-4QfryV checkbox-1KYsPm hide-checkbox" id="input-hideupdated">
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Hide outdated Themes.</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" value="outdated" class="checkboxEnabled-4QfryV checkbox-1KYsPm hide-checkbox" id="input-hideoutdated">
									</div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
									<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Hide downloadable Themes.</h3>
									<div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;">
										<input type="checkbox" value="downloadable" class="checkboxEnabled-4QfryV checkbox-1KYsPm hide-checkbox" id="input-hidedownloadable">
									</div>
								</div>
								<div id="RNMoption" class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;">
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
					<div class="contextMenu-uoJTbz quickSelectPopout">
						<div class="itemGroup-oViAgA">
							${Object.keys(this.sortings.sort).map((key, i) => `<div option="${key}" class="item-1XYaYf">${this.sortings.sort[key]}</div>`).join("")}
						</div>
					</div>
				</div>
			</div>`;
			
		this.orderPopoutMarkup =
			`<div class="popout popout-bottom-right no-shadow themerepo-order-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="contextMenu-uoJTbz quickSelectPopout">
						<div class="itemGroup-oViAgA">
							${Object.keys(this.sortings.order).map((key, i) => `<div option="${key}" class="item-1XYaYf">${this.sortings.order[key]}</div>`).join("")}
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
			.discordPreview ~ .appMount-14L89u {
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
			.themerepo-modal .themeEntry.zack {
				overflow: visible !important;
			}
			.themerepo-modal .themeEntry .gitIcon,
			.themerepo-modal .themeEntry .favIcon,
			.themerepo-modal .themeEntry .trashIcon {
				margin-right: 5px;
				cursor: pointer;
			}
			.themerepo-modal .themeEntry .trashIcon,
			.themerepo-modal .themeEntry .favIcon {
				margin-left: auto;
			}
			.themerepo-modal .themeEntry .favIcon path {
				stroke: yellow;
				fill: none;
			}
			.themerepo-modal .themeEntry .favIcon.favorized path {
				stroke: yellow;
				fill: yellow;
			}
			.themerepo-modal .themeEntry.downloadable .trashIcon {
				display: none;
			}
			.themerepo-modal .themeEntry.downloadable .btn-download {
				background-color: rgb(114, 137, 218) !important;
				margin-left: auto !important;
			}
			.themerepo-modal .themeEntry.outdated .btn-download {
				background-color: rgb(240, 71, 71) !important;
				margin-left: 0 !important;
			}
			.themerepo-modal .themeEntry.updated .btn-download {
				background-color: rgb(67, 181, 129) !important;
				margin-left: 0 !important;
			}
			.themerepo-trashicon-tooltip{
				z-index: 3500!important;
			}
			.themerepo-modal .themeEntry.jiiks .bda-right {
				flex: 1 1 auto;
			}
			.themerepo-modal .themeEntry.jiiks .bda-header,
			.themerepo-modal .themeEntry.jiiks .bda-footer {
				display: flex;
				align-items: center;
				margin: 0 !important;
			}
			.themerepo-modal .themeEntry.jiiks .bda-footer {
				margin-top: 33% !important;
			}
			.themerepo-modal .themeEntry.jiiks .previewCheckboxWrapper {
				margin-right: 5px;
			}`;
	}

	getName () {return "ThemeRepo";}

	getDescription () {return "Allows you to preview all themes from the theme repo and download them on the fly. Repo button is in the theme settings.";}

	getVersion () {return "1.4.6";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">Add Theme:</h3><input type="text" placeholder="Insert Raw Github Link of Theme (https://raw.githubusercontent.com/...)" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_" id="input-themeurl" style="flex: 1 1 auto;"><button type="button" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u btn-add btn-addtheme" style="flex: 0 0 auto;"><div class="contents-4L4hQM"></div></button></div>`;
		settingshtml += `<h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Your additional Theme List:</h3><div class="DevilBro-settings-inner-list theme-list marginBottom8-1mABJ4">`;
		var ownlist = BDfunctionsDevilBro.loadData("ownlist", this, "ownlist") || [];
		if (ownlist) for (let url of ownlist) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginTop4-2rEBfJ marginBottom4-_yArcI card-11ynQk"><div class="card-11ynQk-inner"><div class="description-3MVziF formText-1L-zZB note-UEZmbY marginTop4-2rEBfJ modeDefault-389VjU primary-2giqSn ellipsis-CYOqEr entryurl">${url}</div></div><div class="button-1qrA-N remove-theme"></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Force all Themes to be fetched again.</h3><button type="button" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u refresh-button" style="flex: 0 0 auto;"><div class="contents-4L4hQM">Refresh</div></button></div>`;
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom20-2Ifj-2" style="flex: 0 0 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">Remove all added Themes from your own list.</h3><button type="button" class="flexChild-1KGW5q button-2t3of8 lookFilled-luDKDo colorRed-3HTNPV sizeMedium-2VGNaF grow-25YQ8u remove-all" style="flex: 0 0 auto;"><div class="contents-4L4hQM">Reset</div></button></div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".btn-addtheme", () => {this.addThemeToOwnList(settingspanel);})
			.on("keyup", "#input-themeurl", (e) => {if (e.which == 13) this.addThemeToOwnList(settingspanel);})
			.on("click", ".remove-theme", (e) => {this.removeThemeFromOwnList(e);})
			.on("click", ".remove-all", () => {this.removeAllFromOwnList(settingspanel);})
			.on("click", ".refresh-button", () => {this.loadThemes();});
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDfunctionsDevilBro === "object") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			this.UserUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getUsers"]);
			this.IconUtils = BDfunctionsDevilBro.WebModules.findByProperties(["getUserAvatarURL"]);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, j) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								this.checkIfThemesPage(node);
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".layer-kosS71[layer-id='user-settings']", {name:"innerSettingsWindowObserver",instance:observer}, {childList:true,subtree:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								setImmediate(() => {
									if (node && node.tagName && node.getAttribute("layer-id") == "user-settings") {
										BDfunctionsDevilBro.addObserver(this, node, {name:"innerSettingsWindowObserver"}, {childList:true,subtree:true});
										this.checkIfThemesPage(node);
									}
								});
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".layers-20RVFW", {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.nodeType == 1 && node.className.includes("contextMenu-uoJTbz")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, ".appMount-14L89u", {name:"settingsContextObserver",instance:observer}, {childList: true});
			
			var settingswindow = document.querySelector(".layer-kosS71[layer-id='user-settings']");
			if (settingswindow) this.checkIfThemesPage(settingswindow);
			
			this.loadThemes();
			
			this.updateInterval = setInterval(() => {this.checkForNewThemes();},1000*60*30);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			clearInterval(this.updateInterval);
						
			$(".discordPreview, .themerepo-modal, .bd-themerepobutton").remove();
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}

	
	// begin of own functions
	
	onContextMenu (context) {
		if (!context || !context.tagName || !context.parentElement) return;
		for (let entry of context.querySelectorAll(".item-1XYaYf")) {
			if (entry.textContent == "BetterDiscord") {
				let innerObserver = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.nodeType == 1 && node.className.includes("contextMenu-uoJTbz") && !node.querySelector(".themerepo-item")) {
										var innerEntries = node.querySelectorAll(".item-1XYaYf");
										$(this.settingsContextEntryMarkup)
											.on("click", () => {
												if (!this.loading) $(context).hide();
												this.openThemeRepoModal();
											})
											.insertAfter(innerEntries[innerEntries.length-1]);
										$(node).css("top", $(context).css("top").replace("px","") - $(node).outerHeight() + $(context).outerHeight());
									}
								});
							}
						}
					);
				});
				innerObserver.observe(entry, {childList: true});
				break;
			}
		}
	}
	
	addThemeToOwnList (settingspanel) {
		var themeUrlInput = settingspanel.querySelector("#input-themeurl");
		var themeList = settingspanel.querySelector(".theme-list");
		if (themeUrlInput && themeList) {
			var url = themeUrlInput.value;
			themeUrlInput.value = null;
			var ownlist = BDfunctionsDevilBro.loadData("ownlist", this, "ownlist") || [];
			if (!ownlist.includes(url)) {
				ownlist.push(url);
				BDfunctionsDevilBro.saveData("ownlist", ownlist, this, "ownlist");
				$(`<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO marginTop4-2rEBfJ marginBottom4-_yArcI card-11ynQk"><div class="card-11ynQk-inner"><div class="description-3MVziF formText-1L-zZB note-UEZmbY marginTop4-2rEBfJ modeDefault-389VjU primary-2giqSn ellipsis-CYOqEr entryurl">${url}</div></div><div class="button-1qrA-N remove-theme"></div></div>`).appendTo(themeList);
			}
		}
	}
	
	removeThemeFromOwnList (e) {
		var entry = e.currentTarget.parentElement;
		var url = entry.querySelector(".entryurl").textContent;
		entry.remove();
		var ownlist = BDfunctionsDevilBro.loadData("ownlist", this, "ownlist") || [];
		BDfunctionsDevilBro.removeFromArray(ownlist, url);
		BDfunctionsDevilBro.saveData("ownlist", ownlist, this, "ownlist");
	}
	
	removeAllFromOwnList (settingspanel) {
		if (confirm("Are you sure you want to remove all added Themes from your own list?")) {
			BDfunctionsDevilBro.saveData("ownlist", [], this, "ownlist");
			settingspanel.querySelectorAll(".card-11ynQk").forEach(ele => {ele.remove();});
		}
	}
	
	checkIfThemesPage (container) {
		if (container && container.tagName) {
			var folderbutton = container.querySelector(".bd-pfbtn");
			if (folderbutton) {
				var buttonbar = folderbutton.parentElement;
				if (buttonbar && buttonbar.tagName) {
					var header = buttonbar.querySelector("h2");
					if (header && header.innerText.toUpperCase() === "THEMES") {
						this.addThemeRepoButton(buttonbar);
					}
				}
			}
		}
	}
	
	addThemeRepoButton (container) {
		if (container && !container.querySelector(".bd-themerepobutton")) {
			$(container).find(".bda-description").css("display", "block");
			$(this.themeRepoButtonMarkup)
				.insertAfter(container.querySelector(".bd-pfbtn"))
				.on("click", () => {
					this.openThemeRepoModal();
				})
				.on("mouseenter", (e) => {
					BDfunctionsDevilBro.createTooltip("Open Theme Repo", e.currentTarget, {type:"top",selector:"themerepo-button-tooltip"});
				});
		}
	}
	
	openThemeRepoModal (showOnlyOutdated = false) {
		if (this.loading) {
			BDfunctionsDevilBro.showToast(`Themes are still being fetched. Try again in some seconds.`, {type:"danger"});
			return;
		}
		var frame = $(this.frameMarkup)[0];
		var lightTheme = BDfunctionsDevilBro.getDiscordTheme() == "theme-light";
		var themeRepoModal = $(this.themeRepoModalMarkup);
		themeRepoModal.updateModal = true;
		themeRepoModal.enableSearch = false;
		var hiddenSettings = BDfunctionsDevilBro.loadAllData(this, "hidden");
		themeRepoModal.find("#input-darklight").prop("checked", lightTheme);
		themeRepoModal.find("#input-customcss").prop("checked", false);
		themeRepoModal.find("#input-themefixer").prop("checked", false);
		themeRepoModal.find("#input-hideupdated").prop("checked", hiddenSettings.updated || showOnlyOutdated);
		themeRepoModal.find("#input-hideoutdated").prop("checked", hiddenSettings.outdated && !showOnlyOutdated);
		themeRepoModal.find("#input-hidedownloadable").prop("checked", hiddenSettings.downloadable || showOnlyOutdated);
		if (!BDfunctionsDevilBro.isRestartNoMoreEnabled()) themeRepoModal.find("#RNMoption").remove();
		else themeRepoModal.find("#input-rnmstart").prop("checked", BDfunctionsDevilBro.loadData("RNMstart", this, "settings"));
		themeRepoModal
			.on("keyup." + this.getName(), ".input-yt44Uw", () => {
				clearTimeout(themeRepoModal.searchTimeout);
				themeRepoModal.searchTimeout = setTimeout(() => {this.addThemeEntries(themeRepoModal, frame);},1000);
			})
			.on("click." + this.getName(), ".clear-4pSDsx.visible-4lw4vs", () => {
				clearTimeout(themeRepoModal.searchTimeout);
				themeRepoModal.searchTimeout = setTimeout(() => {this.addThemeEntries(themeRepoModal, frame);},1000);
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
				this.createThemeFile("ThemeFixer.theme.css", `//META{"name":"ThemeFixer","description":"ThemeFixerCSS for transparent themes","author":"DevilBro","version":"1.0.1"}*//\n\n` + this.themeFixerCSS);
			})
			.on("change." + this.getName(), ".hide-checkbox", (e) => {
				var hideButton = $(e.currentTarget);
				hiddenSettings[hideButton.val()] = hideButton.prop("checked");
				BDfunctionsDevilBro.saveAllData(hiddenSettings, this, "hidden");
			})
			.on("change." + this.getName(), "#input-rnmstart", (e) => {
				BDfunctionsDevilBro.saveData("RNMstart", $(e.currentTarget).prop("checked"), this, "settings");
			})
			.on("click." + this.getName(), ".tab[tab=themes]:not(.selected)", (e) => {
				this.addThemeEntries(themeRepoModal, frame);
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
			
		this.createThemeEntries(themeRepoModal, frame);
			
		BDfunctionsDevilBro.appendModal(themeRepoModal);
		$(frame).insertBefore(".appMount-14L89u");
			
		function keyPressed (key) {
			if (key == 17 && !themeRepoModal.find(".input-yt44Uw").is(":focus")) themeRepoModal.toggle();
			if (key == 27) frame.remove();
		}
	}
	
	openSortPopout (e, markup, modal, frame) {
		var wrapper = e.currentTarget;
		if (wrapper.classList.contains("popout-open")) return;
		wrapper.classList.add("popout-open");
		var value = $(wrapper).find(".quickSelectValue-23jNHW");
		var popout = $(markup);
		$(".popouts").append(popout)
			.off("click", ".item-1XYaYf")
			.on("click", ".item-1XYaYf", (e2) => {
				value.text($(e2.currentTarget).text());
				value.attr("option", $(e2.currentTarget).attr("option"));
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
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
	
	createThemeEntries (modal, frame) {
		var favorites = BDfunctionsDevilBro.loadAllData(this, "favorites");
		modal.entries = [];
		for (let url in this.loadedThemes) {
			let theme = this.loadedThemes[url];
			let div = BDfunctionsDevilBro.zacksFork() ? $(this.themeEntryZackMarkup) : $(this.themeEntryMarkup);
			
			var installedTheme = window.bdthemes[this.loadedThemes[url].name];
			if (installedTheme && installedTheme.author.toUpperCase() == theme.author.toUpperCase()) {
				if (installedTheme.version != theme.version) {
					theme.state = 1;
					div.addClass("outdated")
						.find(".btn-download").text("Outdated");
				}
				else {
					theme.state = 0;
					div.addClass("updated")
						.find(".btn-download").text("Updated");
				}
			}
			else {
				theme.state = 2;
				div.addClass("downloadable")
					.find(".btn-download").text("Download");
			}
			if (favorites[url]) {
				theme.fav = 0;
				div.find(".favIcon")[0].classList.add("favorized");
			}
			else {
				theme.fav = 1;
				div.find(".favIcon")[0].classList.remove("favorized");
			}
				
			modal.entries.push({
				div: div,
				url: theme.url,
				search: (theme.name + " " + theme.version + " " + theme.author + " " + theme.description).toUpperCase(),
				name: theme.name,
				version: theme.version,
				author: theme.author,
				description: theme.description,
				fav: theme.fav,
				state: theme.state,
				css: theme.css
			});
		}
		this.addThemeEntries(modal, frame);
	}
	
	addThemeEntries (modal, frame) {
		if (typeof modal.entries != "object") return;
		modal.find(".themeEntry").remove();
		
		var searchstring = modal.find(".input-yt44Uw").val().replace(/[<|>]/g, "").toUpperCase();
		
		var entries = modal.entries;
		if (modal.find("#input-hideupdated").prop("checked")) 		entries = entries.filter((entry) => {return entry.state != 0 ? entry : null;});
		if (modal.find("#input-hideoutdated").prop("checked")) 		entries = entries.filter((entry) => {return entry.state != 1 ? entry : null;});
		if (modal.find("#input-hidedownloadable").prop("checked")) 	entries = entries.filter((entry) => {return entry.state != 2 ? entry : null;});
		entries = entries.filter((entry) => {return entry.search.indexOf(searchstring) > -1 ? entry : null;});
		entries = BDfunctionsDevilBro.sortArrayByKey(entries, modal.find(".sort-filter .quickSelectValue-23jNHW").attr("option"));
		if (modal.find(".order-filter .quickSelectValue-23jNHW").attr("option") == "desc") entries.reverse();
		
		modal.find(".themeAmount").text("Theme Repository " + entries.length + "/" + Object.keys(this.loadedThemes).length + " Themes");
		
		var container = modal.find(".themes");
		entries.forEach((entry) => {
			var div = entry.div;
			
			var values = [entry.name, entry.version, entry.author, entry.description];
			if (searchstring.length > 0) {
				for (let i in values) values[i] = BDfunctionsDevilBro.highlightText(values[i], searchstring);
			}
			if (BDfunctionsDevilBro.zacksFork()) {
				div.find(".bda-name").html(values[0]);
				div.find(".bda-version").html(values[1]);
				div.find(".bda-author").html(values[2]);
			}
			else {
				div.find(".bda-name").html(values[0] + " v" + values[1] + " by " + values[2]);
			}
			div.find(".bda-description").html(values[3]);
			
			div
				.on("change." + this.getName(), ".previewCheckbox", (e) => {
					modal.find(".previewCheckbox").not(e.target).prop("checked", false);
					modal.find(".previewCheckbox").each((_, checkBox) => {
						$(checkBox.parentElement)
							.toggleClass("valueChecked-3Bzkbm", $(checkBox).prop("checked"))
							.toggleClass("valueUnchecked-XR6AOk", $(checkBox).prop("checked"));
					});
					frame.contentWindow.postMessage({origin:"ThemeRepo",reason:"NewTheme",checked:$(e.target).prop("checked"),css:entry.css},"*");
				})
				.on("click." + this.getName(), ".favIcon", (e) => {
					e.currentTarget.classList.toggle("favorized");
					if (e.currentTarget.classList.contains("favorized")) {
						entry.fav = 0;
						BDfunctionsDevilBro.saveData(entry.url, true, this, "favorites");
					}
					else {
						entry.fav = 1;
						BDfunctionsDevilBro.removeData(entry.url, this, "favorites");
					}
				})
				.on("click." + this.getName(), ".gitIcon", (e) => {
					var giturl = null;
					if (entry.url.indexOf("https://raw.githubusercontent.com") == 0) {
						var temp = entry.url.replace("//raw.githubusercontent", "//github").split("/");
						temp.splice(5, 0, "blob");
						giturl = temp.join("/");
					}
					else if (entry.url.indexOf("https://gist.githubusercontent.com/") == 0) {
						giturl = entry.url.replace("//gist.githubusercontent", "//gist.github").split("/raw/")[0];
					}
					if (giturl) {
						window.open(giturl, "_blank");
					}
				})
				.on("click." + this.getName(), ".trashIcon", () => {
					if (div.hasClass("outdated") || div.hasClass("updated")) {
						entry.state = 2;
						div.removeClass("outdated").removeClass("updated").addClass("downloadable")
							.find(".btn-download").text("Download");
						this.deleteThemeFile(entry);
						if (!BDfunctionsDevilBro.isRestartNoMoreEnabled()) this.removeTheme(entry);
					}
				})
				.on("mouseenter." + this.getName(), ".favIcon", (e) => {
					BDfunctionsDevilBro.createTooltip("Favorize", e.currentTarget, {type:"top",selector:"themerepo-favicon-tooltip"});
				})
				.on("mouseenter." + this.getName(), ".gitIcon", (e) => {
					BDfunctionsDevilBro.createTooltip("Go to Git", e.currentTarget, {type:"top",selector:"themerepo-giticon-tooltip"});
				})
				.on("mouseenter." + this.getName(), ".trashIcon", (e) => {
					BDfunctionsDevilBro.createTooltip("Delete Themefile", e.currentTarget, {type:"top",selector:"themerepo-trashicon-tooltip"});
				})
				.on("click." + this.getName(), ".btn-download", () => {
					entry.state = 0;
					this.downloadTheme(entry);
					div.removeClass("downloadable").removeClass("outdated").addClass("updated")
						.find(".btn-download").text("Updated");
					if (modal.find("#input-rnmstart").prop("checked")) setTimeout(() => {this.applyTheme(entry);},3000);
				});
				
			container.append(div);
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
				this.foundThemes = this.grabbedThemes.concat(BDfunctionsDevilBro.loadData("ownlist", this, "ownlist") || []);
				this.loading = true;
				getThemeInfo(() => {
					this.loading = false;
					console.log("ThemeRepo: Finished fetching Themes.");
					if (document.querySelector(".bd-themerepobutton")) BDfunctionsDevilBro.showToast(`Finished fetching Themes.`, {type:"success"});
					if (outdated > 0) {
						var text = `${outdated} of your Themes ${outdated == 1 ? "is" : "are"} outdated. Check:`;
						var bar = BDfunctionsDevilBro.createNotificationsBar(text,{type:"danger",btn:"ThemeRepo",selector:"themerepo-notice"});
						$(bar).on("click." + this.getName(), ".button-2TvR03", (e) => {
							this.openThemeRepoModal(true);
							e.delegateTarget.querySelector(".dismiss-1QjyJW").click();
						});
					}
				});
			}
		});
		
		getThemeInfo = (callback) => {
			if (i >= this.foundThemes.length) {
				callback();
				return;
			}
			let url = this.foundThemes[i].replace(new RegExp("[\\r|\\n|\\t]", "g"), "");
			request(url, (error, response, body) => {
				if (response) {
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
							var installedTheme = window.bdthemes[theme.name];
							if (installedTheme && installedTheme.author.toUpperCase() == theme.author.toUpperCase() && installedTheme.version != theme.version) outdated++;
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
			if (response && !BDfunctionsDevilBro.equals(result.split("\n"), this.grabbedThemes)) this.loadThemes();
		});
	}
	
	downloadTheme (entry) {
		let request = require("request");
		request(entry.url, (error, response, body) => {
			if (error) {
				BDfunctionsDevilBro.showToast(`Unable to download Theme "${entry.name}".`, {type:"danger"});
			}
			else {
				let filename = entry.url.split("/");
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
	
	applyTheme (entry) {
		var name = entry.name;
		if (BDfunctionsDevilBro.isThemeEnabled(name) == false) {
			$(`style#${name}`).remove();
			$("head").append(`<style id=${name}>${entry.css}</style>`);
			themeCookie[name] = true;
			themeModule.saveThemeData();
			console.log("ThemeRepo: applied Theme " + name);
		}
	}
	
	deleteThemeFile (entry) {
		let fileSystem = require("fs");
		let path = require("path");
		let filename = entry.url.split("/");
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
	
	removeTheme (entry) {
		var name = entry.name;
		if (BDfunctionsDevilBro.isThemeEnabled(name) == true) {
			$(`style#${name}`).remove();
			themeCookie[name] = false;
			delete bdthemes[name];
			themeModule.saveThemeData();
			console.log("ThemeRepo: removed Theme " + name);
		}
	}
}
