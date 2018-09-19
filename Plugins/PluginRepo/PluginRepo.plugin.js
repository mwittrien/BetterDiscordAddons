//META{"name":"PluginRepo"}*//

class PluginRepo {
	initConstructor () {
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
		
		this.grabbedPlugins = [];
		this.foundPlugins = [];
		this.loadedPlugins = {};
		
		this.updateInterval;
		
		this.pluginRepoButtonMarkup = 
			`<button class="bd-pfbtn bd-pluginrepobutton">Plugin Repo</button>`;
		
		this.settingsContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitem} pluginrepo-item">
				<span>Plugin Repo</span>
				<div class="${BDFDB.disCN.contextmenuhint}"></div>
			</div>`;

		this.pluginEntryMarkup =
			`<li class="pluginEntry jiiks">
				<div class="bda-left">
					<span class="bda-name"></span>
					<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCN.scrollerthemed}">
						<div class="${BDFDB.disCN.scroller} bda-description"></div>
					</div>
				</div>
				<div class="bda-right">
					<div class="bda-header">
						<svg class="favIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><path fill="none" stroke="black" d="M 19.542, 9.092 c 0.393 -0.383, 0.532 -0.946, 0.362 -1.468 c -0.17 -0.523 -0.613 -0.896 -1.157 -0.975 l -4.837 -0.703 c -0.206 -0.03 -0.384 -0.159 -0.476 -0.346 L 11.273, 1.217 c -0.243 -0.492 -0.736 -0.798 -1.285 -0.798 c -0.549, 0 -1.042, 0.306 -1.284, 0.798 L 6.541, 5.6 c -0.092, 0.187 -0.27, 0.316 -0.476, 0.346 L 1.228, 6.649 c -0.544, 0.079 -0.987, 0.452 -1.157, 0.975 c -0.17, 0.523 -0.031, 1.085, 0.362, 1.468 l 3.5, 3.411 c 0.149, 0.146, 0.218, 0.355, 0.182, 0.56 L 3.29, 17.88 c -0.073, 0.424, 0.038, 0.836, 0.312, 1.162 c 0.426, 0.507, 1.171, 0.661, 1.766, 0.348 l 4.326 -2.274 c 0.181 -0.095, 0.408 -0.094, 0.589, 0 l 4.326, 2.274 c 0.21, 0.111, 0.435, 0.167, 0.666, 0.167 c 0.423, 0, 0.824 -0.188, 1.099 -0.515 c 0.275 -0.325, 0.386 -0.738, 0.312 -1.162 l -0.826 -4.817 c -0.035 -0.205, 0.033 -0.414, 0.182 -0.56 L 19.542, 9.092 z"/></svg>
						<svg class="gitIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><g fill="white"><path d="M 7.19, 16.027 c -0.139, 0.026 -0.199, 0.091 -0.182, 0.195 c 0.017, 0.104, 0.095, 0.138, 0.234, 0.104 c 0.139 -0.035, 0.199 -0.095, 0.182 -0.182 C 7.406, 16.049, 7.328, 16.01, 7.19, 16.027 z"/><path d="M 6.45, 16.131 c -0.138, 0 -0.208, 0.047 -0.208, 0.143 c 0, 0.112, 0.074, 0.16, 0.221, 0.143 c 0.138, 0, 0.208 -0.048, 0.208 -0.143 C 6.671, 16.162, 6.597, 16.114, 6.45, 16.131 z"/><path d="M 5.438, 16.092 c -0.035, 0.095, 0.022, 0.16, 0.169, 0.195 c 0.13, 0.052, 0.212, 0.026, 0.247 -0.078 c 0.026 -0.095 -0.03 -0.164 -0.169 -0.208 C 5.554, 15.967, 5.472, 15.996, 5.438, 16.092 z"/><path d="M 18.837, 1.097 C 18.106, 0.366, 17.226, 0, 16.196, 0 H 3.738 C 2.708, 0, 1.828, 0.366, 1.097, 1.097 C 0.366, 1.828, 0, 2.708, 0, 3.738 v 12.459 c 0, 1.03, 0.366, 1.91, 1.097, 2.641 c 0.731, 0.731, 1.612, 1.097, 2.641, 1.097 h 2.907 c 0.19, 0, 0.333 -0.007, 0.428 -0.019 c 0.095 -0.013, 0.19 -0.069, 0.285 -0.169 c 0.095 -0.099, 0.143 -0.244, 0.143 -0.435 c 0 -0.026 -0.002 -0.32 -0.007 -0.883 c -0.004 -0.562 -0.007 -1.008 -0.007 -1.337 l -0.298, 0.052 c -0.19, 0.035 -0.43, 0.05 -0.72, 0.045 c -0.29 -0.004 -0.59 -0.035 -0.902 -0.091 c -0.312 -0.056 -0.601 -0.186 -0.87 -0.389 c -0.268 -0.203 -0.458 -0.469 -0.571 -0.798 l -0.13 -0.299 c -0.086 -0.199 -0.223 -0.419 -0.409 -0.662 c -0.186 -0.242 -0.374 -0.407 -0.564 -0.493 l -0.091 -0.065 c -0.06 -0.043 -0.117 -0.095 -0.169 -0.156 c -0.052 -0.061 -0.091 -0.121 -0.117 -0.182 c -0.026 -0.061 -0.004 -0.11, 0.065 -0.149 c 0.069 -0.039, 0.195 -0.058, 0.376 -0.058 l 0.259, 0.039 c 0.173, 0.035, 0.387, 0.138, 0.642, 0.311 c 0.255, 0.173, 0.465, 0.398, 0.629, 0.675 c 0.199, 0.355, 0.439, 0.625, 0.72, 0.811 c 0.281, 0.186, 0.565, 0.279, 0.85, 0.279 s 0.532 -0.022, 0.74 -0.065 c 0.208 -0.043, 0.402 -0.108, 0.584 -0.195 c 0.078 -0.58, 0.29 -1.025, 0.636 -1.337 c -0.493 -0.052 -0.936 -0.13 -1.33 -0.234 c -0.394 -0.104 -0.8 -0.272 -1.22 -0.506 c -0.42 -0.234 -0.768 -0.523 -1.045 -0.87 c -0.277 -0.346 -0.504 -0.8 -0.681 -1.363 c -0.177 -0.562 -0.266 -1.211 -0.266 -1.947 c 0 -1.047, 0.342 -1.938, 1.025 -2.673 c -0.32 -0.787 -0.29 -1.67, 0.091 -2.647 c 0.251 -0.078, 0.623 -0.019, 1.116, 0.175 c 0.493, 0.195, 0.854, 0.361, 1.084, 0.5 c 0.229, 0.138, 0.413, 0.255, 0.552, 0.35 c 0.805 -0.225, 1.635 -0.337, 2.492 -0.337 c 0.856, 0, 1.687, 0.112, 2.492, 0.337 l 0.493 -0.311 c 0.338 -0.208, 0.735 -0.398, 1.194 -0.571 c 0.459 -0.173, 0.809 -0.221, 1.051 -0.143 c 0.389, 0.978, 0.424, 1.86, 0.104, 2.647 c 0.683, 0.735, 1.025, 1.627, 1.025, 2.673 c 0, 0.735 -0.089, 1.387 -0.266, 1.953 c -0.177, 0.567 -0.406, 1.021 -0.688, 1.363 c -0.281, 0.342 -0.632, 0.629 -1.051, 0.863 c -0.42, 0.234 -0.826, 0.402 -1.22, 0.506 c -0.394, 0.104 -0.837, 0.182 -1.33, 0.234 c 0.45, 0.389, 0.675, 1.003, 0.675, 1.843 v 3.102 c 0, 0.147, 0.021, 0.266, 0.065, 0.357 c 0.044, 0.091, 0.113, 0.153, 0.208, 0.188 c 0.096, 0.035, 0.18, 0.056, 0.253, 0.065 c 0.074, 0.009, 0.18, 0.013, 0.318, 0.013 h 2.907 c 1.029, 0, 1.91 -0.366, 2.641 -1.097 c 0.731 -0.731, 1.097 -1.612, 1.097 -2.641 V 3.738 C 19.933, 2.708, 19.568, 1.827, 18.837, 1.097 z"/><path d="M 3.945, 14.509 c -0.06, 0.043 -0.052, 0.112, 0.026, 0.208 c 0.087, 0.086, 0.156, 0.1, 0.208, 0.039 c 0.061 -0.043, 0.052 -0.112 -0.026 -0.208 C 4.066, 14.47, 3.997, 14.457, 3.945, 14.509 z"/><path d="M 3.517, 14.184 c -0.026, 0.061, 0.004, 0.113, 0.091, 0.156 c 0.069, 0.043, 0.126, 0.035, 0.169 -0.026 c 0.026 -0.061 -0.004 -0.113 -0.091 -0.156 C 3.599, 14.132, 3.543, 14.141, 3.517, 14.184 z"/><path d="M 4.348, 15.015 c -0.078, 0.043 -0.078, 0.121, 0, 0.234 c 0.078, 0.113, 0.151, 0.143, 0.221, 0.091 c 0.078 -0.061, 0.078 -0.143, 0 -0.247 C 4.499, 14.981, 4.425, 14.954, 4.348, 15.015 z"/><path d="M 4.802, 15.599 c -0.078, 0.069 -0.061, 0.151, 0.052, 0.247 c 0.104, 0.104, 0.19, 0.117, 0.259, 0.039 c 0.069 -0.069, 0.052 -0.151 -0.052 -0.246 C 4.958, 15.534, 4.871, 15.521, 4.802, 15.599 z"/></g></svg>
					</div>
					<div class="bda-footer">
						<svg class="trashIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><g fill="white"><path d="M 18.012, 0.648 H 12.98 C 12.944, 0.284, 12.637, 0, 12.264, 0 H 8.136 c -0.373, 0 -0.68, 0.284 -0.716, 0.648 H 2.389 c -0.398, 0 -0.72, 0.322 -0.72, 0.72 v 1.368 c 0, 0.398, 0.322, 0.72, 0.72, 0.72 h 15.623 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 1.368 C 18.731, 0.97, 18.409, 0.648, 18.012, 0.648 z"/><path d="M 3.178, 4.839 v 14.841 c 0, 0.397, 0.322, 0.72, 0.72, 0.72 h 12.604 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 4.839 H 3.178 z M 8.449, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 c -0.438, 0 -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z M 13.538, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 s -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z"/></g></svg>
						<button class="btn-download bda-settings-button">Download</button>
					</div>
				</div>
			</li>`;

		this.pluginEntryZackMarkup =
			`<li class="pluginEntry settings-closed ui-switch-item zack">
				<div class="bda-header">
					<span class="bda-header-title">
						<span class="bda-name"></span> v<span class="bda-version"></span> by <span class="bda-author"></span>
					</span>
					<svg class="favIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><path fill="none" stroke="black" d="M 19.542, 9.092 c 0.393 -0.383, 0.532 -0.946, 0.362 -1.468 c -0.17 -0.523 -0.613 -0.896 -1.157 -0.975 l -4.837 -0.703 c -0.206 -0.03 -0.384 -0.159 -0.476 -0.346 L 11.273, 1.217 c -0.243 -0.492 -0.736 -0.798 -1.285 -0.798 c -0.549, 0 -1.042, 0.306 -1.284, 0.798 L 6.541, 5.6 c -0.092, 0.187 -0.27, 0.316 -0.476, 0.346 L 1.228, 6.649 c -0.544, 0.079 -0.987, 0.452 -1.157, 0.975 c -0.17, 0.523 -0.031, 1.085, 0.362, 1.468 l 3.5, 3.411 c 0.149, 0.146, 0.218, 0.355, 0.182, 0.56 L 3.29, 17.88 c -0.073, 0.424, 0.038, 0.836, 0.312, 1.162 c 0.426, 0.507, 1.171, 0.661, 1.766, 0.348 l 4.326 -2.274 c 0.181 -0.095, 0.408 -0.094, 0.589, 0 l 4.326, 2.274 c 0.21, 0.111, 0.435, 0.167, 0.666, 0.167 c 0.423, 0, 0.824 -0.188, 1.099 -0.515 c 0.275 -0.325, 0.386 -0.738, 0.312 -1.162 l -0.826 -4.817 c -0.035 -0.205, 0.033 -0.414, 0.182 -0.56 L 19.542, 9.092 z"/></svg>
					<svg class="gitIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><g fill="white"><path d="M 7.19, 16.027 c -0.139, 0.026 -0.199, 0.091 -0.182, 0.195 c 0.017, 0.104, 0.095, 0.138, 0.234, 0.104 c 0.139 -0.035, 0.199 -0.095, 0.182 -0.182 C 7.406, 16.049, 7.328, 16.01, 7.19, 16.027 z"/><path d="M 6.45, 16.131 c -0.138, 0 -0.208, 0.047 -0.208, 0.143 c 0, 0.112, 0.074, 0.16, 0.221, 0.143 c 0.138, 0, 0.208 -0.048, 0.208 -0.143 C 6.671, 16.162, 6.597, 16.114, 6.45, 16.131 z"/><path d="M 5.438, 16.092 c -0.035, 0.095, 0.022, 0.16, 0.169, 0.195 c 0.13, 0.052, 0.212, 0.026, 0.247 -0.078 c 0.026 -0.095 -0.03 -0.164 -0.169 -0.208 C 5.554, 15.967, 5.472, 15.996, 5.438, 16.092 z"/><path d="M 18.837, 1.097 C 18.106, 0.366, 17.226, 0, 16.196, 0 H 3.738 C 2.708, 0, 1.828, 0.366, 1.097, 1.097 C 0.366, 1.828, 0, 2.708, 0, 3.738 v 12.459 c 0, 1.03, 0.366, 1.91, 1.097, 2.641 c 0.731, 0.731, 1.612, 1.097, 2.641, 1.097 h 2.907 c 0.19, 0, 0.333 -0.007, 0.428 -0.019 c 0.095 -0.013, 0.19 -0.069, 0.285 -0.169 c 0.095 -0.099, 0.143 -0.244, 0.143 -0.435 c 0 -0.026 -0.002 -0.32 -0.007 -0.883 c -0.004 -0.562 -0.007 -1.008 -0.007 -1.337 l -0.298, 0.052 c -0.19, 0.035 -0.43, 0.05 -0.72, 0.045 c -0.29 -0.004 -0.59 -0.035 -0.902 -0.091 c -0.312 -0.056 -0.601 -0.186 -0.87 -0.389 c -0.268 -0.203 -0.458 -0.469 -0.571 -0.798 l -0.13 -0.299 c -0.086 -0.199 -0.223 -0.419 -0.409 -0.662 c -0.186 -0.242 -0.374 -0.407 -0.564 -0.493 l -0.091 -0.065 c -0.06 -0.043 -0.117 -0.095 -0.169 -0.156 c -0.052 -0.061 -0.091 -0.121 -0.117 -0.182 c -0.026 -0.061 -0.004 -0.11, 0.065 -0.149 c 0.069 -0.039, 0.195 -0.058, 0.376 -0.058 l 0.259, 0.039 c 0.173, 0.035, 0.387, 0.138, 0.642, 0.311 c 0.255, 0.173, 0.465, 0.398, 0.629, 0.675 c 0.199, 0.355, 0.439, 0.625, 0.72, 0.811 c 0.281, 0.186, 0.565, 0.279, 0.85, 0.279 s 0.532 -0.022, 0.74 -0.065 c 0.208 -0.043, 0.402 -0.108, 0.584 -0.195 c 0.078 -0.58, 0.29 -1.025, 0.636 -1.337 c -0.493 -0.052 -0.936 -0.13 -1.33 -0.234 c -0.394 -0.104 -0.8 -0.272 -1.22 -0.506 c -0.42 -0.234 -0.768 -0.523 -1.045 -0.87 c -0.277 -0.346 -0.504 -0.8 -0.681 -1.363 c -0.177 -0.562 -0.266 -1.211 -0.266 -1.947 c 0 -1.047, 0.342 -1.938, 1.025 -2.673 c -0.32 -0.787 -0.29 -1.67, 0.091 -2.647 c 0.251 -0.078, 0.623 -0.019, 1.116, 0.175 c 0.493, 0.195, 0.854, 0.361, 1.084, 0.5 c 0.229, 0.138, 0.413, 0.255, 0.552, 0.35 c 0.805 -0.225, 1.635 -0.337, 2.492 -0.337 c 0.856, 0, 1.687, 0.112, 2.492, 0.337 l 0.493 -0.311 c 0.338 -0.208, 0.735 -0.398, 1.194 -0.571 c 0.459 -0.173, 0.809 -0.221, 1.051 -0.143 c 0.389, 0.978, 0.424, 1.86, 0.104, 2.647 c 0.683, 0.735, 1.025, 1.627, 1.025, 2.673 c 0, 0.735 -0.089, 1.387 -0.266, 1.953 c -0.177, 0.567 -0.406, 1.021 -0.688, 1.363 c -0.281, 0.342 -0.632, 0.629 -1.051, 0.863 c -0.42, 0.234 -0.826, 0.402 -1.22, 0.506 c -0.394, 0.104 -0.837, 0.182 -1.33, 0.234 c 0.45, 0.389, 0.675, 1.003, 0.675, 1.843 v 3.102 c 0, 0.147, 0.021, 0.266, 0.065, 0.357 c 0.044, 0.091, 0.113, 0.153, 0.208, 0.188 c 0.096, 0.035, 0.18, 0.056, 0.253, 0.065 c 0.074, 0.009, 0.18, 0.013, 0.318, 0.013 h 2.907 c 1.029, 0, 1.91 -0.366, 2.641 -1.097 c 0.731 -0.731, 1.097 -1.612, 1.097 -2.641 V 3.738 C 19.933, 2.708, 19.568, 1.827, 18.837, 1.097 z"/><path d="M 3.945, 14.509 c -0.06, 0.043 -0.052, 0.112, 0.026, 0.208 c 0.087, 0.086, 0.156, 0.1, 0.208, 0.039 c 0.061 -0.043, 0.052 -0.112 -0.026 -0.208 C 4.066, 14.47, 3.997, 14.457, 3.945, 14.509 z"/><path d="M 3.517, 14.184 c -0.026, 0.061, 0.004, 0.113, 0.091, 0.156 c 0.069, 0.043, 0.126, 0.035, 0.169 -0.026 c 0.026 -0.061 -0.004 -0.113 -0.091 -0.156 C 3.599, 14.132, 3.543, 14.141, 3.517, 14.184 z"/><path d="M 4.348, 15.015 c -0.078, 0.043 -0.078, 0.121, 0, 0.234 c 0.078, 0.113, 0.151, 0.143, 0.221, 0.091 c 0.078 -0.061, 0.078 -0.143, 0 -0.247 C 4.499, 14.981, 4.425, 14.954, 4.348, 15.015 z"/><path d="M 4.802, 15.599 c -0.078, 0.069 -0.061, 0.151, 0.052, 0.247 c 0.104, 0.104, 0.19, 0.117, 0.259, 0.039 c 0.069 -0.069, 0.052 -0.151 -0.052 -0.246 C 4.958, 15.534, 4.871, 15.521, 4.802, 15.599 z"/></g></svg>
				</div>
				<div class="bda-description-wrap ${BDFDB.disCN.scrollerwrap}">
					<div class="bda-description ${BDFDB.disCN.scroller}" style="display: block;"></div>
				</div>
				<div class="bda-footer">
					<span class="bda-links"></span>
					<svg class="trashIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><g fill="white"><path d="M 18.012, 0.648 H 12.98 C 12.944, 0.284, 12.637, 0, 12.264, 0 H 8.136 c -0.373, 0 -0.68, 0.284 -0.716, 0.648 H 2.389 c -0.398, 0 -0.72, 0.322 -0.72, 0.72 v 1.368 c 0, 0.398, 0.322, 0.72, 0.72, 0.72 h 15.623 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 1.368 C 18.731, 0.97, 18.409, 0.648, 18.012, 0.648 z"/><path d="M 3.178, 4.839 v 14.841 c 0, 0.397, 0.322, 0.72, 0.72, 0.72 h 12.604 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 4.839 H 3.178 z M 8.449, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 c -0.438, 0 -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z M 13.538, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 s -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z"/></g></svg>
					<button class="btn-download bda-settings-button">Download</button>
				</div>
			</li>`;
			
		this.pluginRepoModalMarkup =
			`<span class="pluginrepo-modal DevilBro-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizelarge}">
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
									<input class="${BDFDB.disCNS.searchbarinput + BDFDB.disCN.flexchild}" value="" placeholder="Search for ..." style="flex: 1 1 auto;">
									<div class="${BDFDB.disCNS.searchbariconwrap + BDFDB.disCN.flexchild}">
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
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner} ui-standard-sidebar-view">
									<ul class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCN.nowrap} bda-slist plugins" style="flex: 1 1 auto;"></ul>
								</div>
							</div>
							<div tab="settings" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalsubinner} tab-content" style="flex: 1 1 auto;">
								<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 0 0 auto;">
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto; width: 800px;">To expierence PluginRepo in the best way. I would recommend you to download Restart-No-More, which automatically loads newly downloaded Plugins into your BetterDiscord, so you won't have to reload after downloading a Plugin.</h3>
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
									<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Start Plugin after Download (Restart-No-More needed)</h3>
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
			.pluginrepo-modal ${BDFDB.dotCN.modalinner} {
				min-height: 100%;
			}
			.pluginrepo-modal .pluginEntry.zack {
				overflow: visible !important;
			}
			.pluginrepo-modal .pluginEntry .gitIcon,
			.pluginrepo-modal .pluginEntry .favIcon,
			.pluginrepo-modal .pluginEntry .trashIcon {
				margin-right: 5px;
				cursor: pointer;
			}
			.pluginrepo-modal .pluginEntry .trashIcon,
			.pluginrepo-modal .pluginEntry .favIcon {
				margin-left: auto;
			}
			.pluginrepo-modal .pluginEntry .btn-download {
				margin-left: 0 !important;
			}
			.pluginrepo-modal .pluginEntry .favIcon path {
				stroke: yellow;
				fill: none;
			}
			.pluginrepo-modal .pluginEntry .favIcon.favorized path {
				stroke: yellow;
				fill: yellow;
			}
			.pluginrepo-modal .pluginEntry.downloadable .trashIcon {
				display: none;
			}
			.pluginrepo-modal .pluginEntry.downloadable .btn-download {
				background-color: rgb(114, 137, 218) !important;
				margin-left: auto !important;
			}
			.pluginrepo-modal .pluginEntry.outdated .btn-download {
				background-color: rgb(240, 71, 71) !important;
				margin-left: 0 !important;
			}
			.pluginrepo-modal .pluginEntry.updated .btn-download {
				background-color: rgb(67, 181, 129) !important;
				margin-left: 0 !important;
			}
			.pluginrepo-trashicon-tooltip{
				z-index: 3500!important;
			}
			.pluginrepo-modal .pluginEntry.jiiks .bda-right {
				flex: 1 1 auto;
			}
			.pluginrepo-modal .pluginEntry.jiiks .bda-header,
			.pluginrepo-modal .pluginEntry.jiiks .bda-footer {
				display: flex;
				align-items: center;
				margin: 0 !important;
			}
			.pluginrepo-modal .pluginEntry.jiiks .bda-footer {
				margin-top: 33% !important;
			}`;
	}

	getName () {return "PluginRepo";}

	getDescription () {return "Allows you to look at all plugins from the plugin repo and download them on the fly. Repo button is in the plugins settings.";}

	getVersion () {return "1.5.3";}

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
			.on("click", ".remove-all", () => {this.removeAllFromOwnList(settingspanel);})
			.on("click", ".refresh-button", () => {this.loadPlugins();});
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
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, j) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								this.checkIfPluginsPage(node);
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.layer + "[layer-id='user-settings']", {name:"innerSettingsWindowObserver",instance:observer}, {childList:true,subtree:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								setImmediate(() => {
									if (node && node.tagName && node.getAttribute("layer-id") == "user-settings") {
										BDFDB.addObserver(this, node, {name:"innerSettingsWindowObserver"}, {childList:true,subtree:true});
										this.checkIfPluginsPage(node);
									}
								});
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.layers, {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.nodeType == 1 && node.className.includes(BDFDB.disCN.contextmenu)) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.appmount, {name:"settingsContextObserver",instance:observer}, {childList: true});
			
			var settingswindow = document.querySelector(BDFDB.dotCN.layer + "[layer-id='user-settings']");
			if (settingswindow) this.checkIfPluginsPage(settingswindow);
						
			this.loadPlugins();
			
			this.updateInterval = setInterval(() => {this.checkForNewPlugins();},1000*60*30);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDFDB === "object") {
			clearInterval(this.updateInterval);
						
			$(".pluginrepo-modal, .bd-pluginrepobutton, webview[webview-PluginRepo]").remove();
			
			BDFDB.unloadMessage(this);
		}
	}

	
	// begin of own functions
	
	onContextMenu (context) {
		if (!context || !context.tagName || !context.parentElement) return;
		for (let entry of context.querySelectorAll(BDFDB.dotCN.contextmenuitem)) {
			if (entry.textContent == "BetterDiscord") {
				let innerObserver = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.nodeType == 1 && node.className.includes(BDFDB.disCN.contextmenu) && !node.querySelector(".pluginrepo-item")) {
										for (let innerEntry of node.querySelectorAll(BDFDB.dotCN.contextmenuitem)) {
											if (innerEntry.textContent == "Themes") {
												$(this.settingsContextEntryMarkup)
													.on("click", () => {
														if (!this.loading) $(context).hide();
														this.openPluginRepoModal();
													})
													.insertAfter(innerEntry);
												$(node).css("top", $(context).css("top").replace("px","") - $(node).outerHeight() + $(context).outerHeight());
												break;
											}
										}
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
	
	removeAllFromOwnList (settingspanel) {
		if (confirm("Are you sure you want to remove all added Plugins from your own list?")) {
			BDFDB.saveData("ownlist", [], this, "ownlist");
			settingspanel.querySelectorAll(BDFDB.dotCN.hovercard).forEach(ele => {ele.remove();});
		}
	}
	
	checkIfPluginsPage (container) {
		if (container && container.tagName) {
			var folderbutton = container.querySelector(".bd-pfbtn");
			if (folderbutton) {
				var buttonbar = folderbutton.parentElement;
				if (buttonbar && buttonbar.tagName) {
					var header = buttonbar.querySelector("h2");
					if (header && header.innerText.toUpperCase() === "PLUGINS") {
						this.addPluginRepoButton(buttonbar);
					}
				}
			}
		}
	}
	
	addPluginRepoButton (container) {
		if (container && !container.querySelector(".bd-pluginrepobutton")) {
			$(container).find(".bda-description").css("display", "block");
			$(this.pluginRepoButtonMarkup)
				.insertAfter(container.querySelector(".bd-pfbtn"))
				.on("click", () => {
					this.openPluginRepoModal()
				})
				.on("mouseenter", (e) => {
					BDFDB.createTooltip("Open Plugin Repo", e.currentTarget, {type:"top",selector:"pluginrepo-button-tooltip"});
				});
		}
	}
	
	openPluginRepoModal (showOnlyOutdated = false) {
		if (this.loading) {
			BDFDB.showToast(`Plugins are still being fetched. Try again in some seconds.`, {type:"danger"});
			return;
		}
		var pluginRepoModal = $(this.pluginRepoModalMarkup);
		pluginRepoModal.updateModal = true;
		pluginRepoModal.enableSearch = false;
		var hiddenSettings = BDFDB.loadAllData(this, "hidden");
		pluginRepoModal.find("#input-hideupdated").prop("checked", hiddenSettings.updated || showOnlyOutdated);
		pluginRepoModal.find("#input-hideoutdated").prop("checked", hiddenSettings.outdated && !showOnlyOutdated);
		pluginRepoModal.find("#input-hidedownloadable").prop("checked", hiddenSettings.downloadable || showOnlyOutdated);
		if (!BDFDB.isRestartNoMoreEnabled()) pluginRepoModal.find("#RNMoption").remove();
		else pluginRepoModal.find("#input-rnmstart").prop("checked", BDFDB.loadData("RNMstart", this, "settings"));
		pluginRepoModal
			.on("keyup." + this.getName(), BDFDB.dotCN.searchbarinput, () => {
				clearTimeout(pluginRepoModal.searchTimeout);
				pluginRepoModal.searchTimeout = setTimeout(() => {this.addPluginEntries(pluginRepoModal);},1000);
			})
			.on("click." + this.getName(), BDFDB.dotCN.searchbarclear + BDFDB.dotCN.searchbarvisible, () => {
				clearTimeout(pluginRepoModal.searchTimeout);
				pluginRepoModal.searchTimeout = setTimeout(() => {this.addPluginEntries(pluginRepoModal);},1000);
			})
			.on("change." + this.getName(), ".hide-checkbox", (e) => {
				var hideButton = $(e.currentTarget);
				hiddenSettings[hideButton.val()] = hideButton.prop("checked");
				BDFDB.saveAllData(hiddenSettings, this, "hidden");
			})
			.on("change." + this.getName(), "#input-rnmstart", (e) => {
				BDFDB.saveData("RNMstart", $(e.currentTarget).prop("checked"), this, "settings");
			})
			.on("click." + this.getName(), ".sort-filter", (e) => {
				this.openSortPopout(e, this.sortPopoutMarkup, pluginRepoModal);
			})
			.on("click." + this.getName(), ".order-filter", (e) => {
				this.openSortPopout(e, this.orderPopoutMarkup, pluginRepoModal);
			})
			.on("click." + this.getName(), ".tab[tab=plugins]:not(.selected)", (e) => {
				this.addPluginEntries(pluginRepoModal);
			});
			
		this.createPluginEntries(pluginRepoModal);
			
		BDFDB.appendModal(pluginRepoModal);
	}
	
	openSortPopout (e, markup, modal) {
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
				this.addPluginEntries(modal);
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
	
	createPluginEntries (modal) {
		var favorites = BDFDB.loadAllData(this, "favorites");
		modal.entries = [];
		for (let url in this.loadedPlugins) {
			let plugin = this.loadedPlugins[url];
			let div = BDFDB.zacksFork() ? $(this.pluginEntryZackMarkup) : $(this.pluginEntryMarkup);
			var installedPlugin = window.bdplugins[plugin.getName] ? window.bdplugins[plugin.getName].plugin : null;
			if (installedPlugin && installedPlugin.getAuthor().toUpperCase() == plugin.getAuthor.toUpperCase()) {
				if (installedPlugin.getVersion() != plugin.getVersion) {
					plugin.getState = 1;
					div.addClass("outdated")
						.find(".btn-download").text("Outdated");
				}
				else {
					plugin.getState = 0;
					div.addClass("updated")
						.find(".btn-download").text("Updated");
				}
			}
			else {
				plugin.getState = 2;
				div.addClass("downloadable")
					.find(".btn-download").text("Download");
			}
			if (favorites[url]) {
				plugin.getFav = 0;
				div.find(".favIcon")[0].classList.add("favorized");
			}
			else {
				plugin.getFav = 1;
				div.find(".favIcon")[0].classList.remove("favorized");
			}
				
			modal.entries.push({
				div: div,
				url: plugin.url,
				search: (plugin.getName + " " + plugin.getVersion + " " + plugin.getAuthor + " " + plugin.getDescription).toUpperCase(),
				name: plugin.getName,
				version: plugin.getVersion,
				author: plugin.getAuthor,
				description: plugin.getDescription ? plugin.getDescription : "No Description found.",
				fav: plugin.getFav,
				state: plugin.getState
			});
		}
		this.addPluginEntries(modal);
	}
	
	addPluginEntries (modal) {
		if (typeof modal.entries != "object") return;
		modal.find(".pluginEntry").remove();
		
		var searchstring = modal.find(BDFDB.dotCN.searchbarinput).val().replace(/[<|>]/g, "").toUpperCase();
		
		var entries = modal.entries;
		if (modal.find("#input-hideupdated").prop("checked")) 		entries = entries.filter((entry) => {return entry.state != 0 ? entry : null;});
		if (modal.find("#input-hideoutdated").prop("checked")) 		entries = entries.filter((entry) => {return entry.state != 1 ? entry : null;});
		if (modal.find("#input-hidedownloadable").prop("checked")) 	entries = entries.filter((entry) => {return entry.state != 2 ? entry : null;});
		entries = entries.filter((entry) => {return entry.search.indexOf(searchstring) > -1 ? entry : null;});
		BDFDB.sortArrayByKey(entries, modal.find(".sort-filter " + BDFDB.dotCN.quickselectvalue).attr("option"));
		if (modal.find(".order-filter " + BDFDB.dotCN.quickselectvalue).attr("option") == "desc") entries.reverse();
		
		modal.find(".pluginAmount").text("Plugin Repository " + entries.length + "/" + Object.keys(this.loadedPlugins).length + " Plugins");
		
		var container = modal.find(".plugins");
		entries.forEach((entry) => {
			var div = entry.div;
			
			var values = [entry.name, entry.version, entry.author, entry.description];
			if (searchstring.length > 0) {
				for (let i in values) values[i] = BDFDB.highlightText(values[i], searchstring);
			}
			if (BDFDB.zacksFork()) {
				div.find(".bda-name").html(values[0]);
				div.find(".bda-version").html(values[1]);
				div.find(".bda-author").html(values[2]);
			}
			else {
				div.find(".bda-name").html(values[0] + " v" + values[1] + " by " + values[2]);
			}
			div.find(".bda-description").html(values[3]);
			
			div
				.on("click." + this.getName(), ".favIcon", (e) => {
					e.currentTarget.classList.toggle("favorized");
					if (e.currentTarget.classList.contains("favorized")) {
						entry.fav = 0;
						BDFDB.saveData(entry.url, true, this, "favorites");
					}
					else {
						entry.fav = 1;
						BDFDB.removeData(entry.url, this, "favorites");
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
						this.deletePluginFile(entry);
						if (!BDFDB.isRestartNoMoreEnabled()) this.stopPlugin(entry);
					}
				})
				.on("click." + this.getName(), ".btn-download", () => {
					entry.state = 0;
					div.removeClass("downloadable").removeClass("outdated").addClass("updated")
						.find(".btn-download").text("Updated");
					this.downloadPlugin(entry);
					if (modal.find("#input-rnmstart").prop("checked")) setTimeout(() => {this.startPlugin(entry);},3000);
				})
				.on("mouseenter." + this.getName(), ".favIcon", (e) => {
					BDFDB.createTooltip("Favorize", e.currentTarget, {type:"top",selector:"pluginrepo-favicon-tooltip"});
				})
				.on("mouseenter." + this.getName(), ".gitIcon", (e) => {
					BDFDB.createTooltip("Go to Git", e.currentTarget, {type:"top",selector:"pluginrepo-giticon-tooltip"});
				})
				.on("mouseenter." + this.getName(), ".trashIcon", (e) => {
					BDFDB.createTooltip("Delete Pluginfile", e.currentTarget, {type:"top",selector:"pluginrepo-trashicon-tooltip"});
				});
				
			container.append(div);
		});
	}
	
	loadPlugins () {
		var getPluginInfo, outdated = 0, i = 0;
		var tags = ["getName", "getVersion", "getAuthor", "getDescription"];
		var seps = ["\"", "\'", "\`"];
		let request = require("request");
		request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/PluginRepo/res/PluginList.txt", (error, response, result) => {
			if (response) {
				this.loadedPlugins = {};
				this.grabbedPlugins = result.split("\n");
				this.foundPlugins = this.grabbedPlugins.concat(BDFDB.loadData("ownlist", this, "ownlist") || []);
				this.loading = true;
				createWebview().then((webview) => {
					getPluginInfo(webview, () => {
						this.loading = false;
						console.log("PluginRepo: Finished fetching Plugins.");
						if (document.querySelector(".bd-pluginrepobutton")) BDFDB.showToast(`Finished fetching Plugins.`, {type:"success"});
						if (outdated > 0) {
							var text = `${outdated} of your Plugins ${outdated == 1 ? "is" : "are"} outdated. Check:`;
							var bar = BDFDB.createNotificationsBar(text,{type:"danger",btn:"PluginRepo",selector:"pluginrepo-notice"});
							$(bar).on("click." + this.getName(), BDFDB.dotCN.noticebutton, (e) => {
								this.openPluginRepoModal(true);
								e.delegateTarget.querySelector(BDFDB.dotCN.noticedismiss).click();
							});
						}
						setTimeout(() => {webview.remove();},10000);
						if (BDFDB.myData.id == "278543574059057154") {
							let wrongUrls = [];
							for (let url of this.foundPlugins) if (url && !this.loadedPlugins[url]) wrongUrls.push(url);
							if (wrongUrls.length > 0) {
								var bar = BDFDB.createNotificationsBar(`PluginRepo: ${wrongUrls.length} Plugin${wrongUrls.length > 1 ? "s" : ""} could not be loaded.`, {type:"danger",btn:"List"});
								$(bar).on("click." + this.getName(), BDFDB.dotCN.noticebutton, (e) => {
									var toast = BDFDB.showToast(wrongUrls.join("\n"),{type:"error"});
									toast.style.overflow = "hidden";
									console.log(wrongUrls.length == 1 ? wrongUrls[0] : wrongUrls);
								});
							}
						}
					});
				});
			}
		});
		
		getPluginInfo = (webview, callback) => {
			if (i >= this.foundPlugins.length) {
				callback();
				return;
			}
			let url = this.foundPlugins[i].replace(new RegExp("[\\r|\\n|\\t]", "g"), "");
			this.foundPlugins[i] = url;
			request(url, (error, response, body) => {
				if (response) {
					let plugin = {};
					let bodycopy = body;
					if (body.length / body.split("\n").length > 1000) {
						/* code is minified -> add newlines */
						bodycopy = body.replace(new RegExp("}", "g"), "}\n");
					}
					for (let tag of tags) {
						let result = new RegExp(tag + "[\\s|\\t|\\n|\\r|=|>|_|:|function|\(|\)|\{|return]*([\"|\'|\`]).*\\1","gi").exec(bodycopy);
						if (result) {
							let separator = result[1];
							result = result[0].replace(new RegExp("\\\\" + separator, "g"), separator).split(separator);
							if (result.length > 2) {
								result = result.slice(1, -1).join(separator).replace(new RegExp("\\\\n", "g"), "<br>").replace(new RegExp("\\\\", "g"), "");
								plugin[tag] = tag != "getVersion" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
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
						var installedPlugin = window.bdplugins[plugin.getName] ? window.bdplugins[plugin.getName].plugin : null;
						if (installedPlugin && installedPlugin.getAuthor().toUpperCase() == plugin.getAuthor.toUpperCase() && installedPlugin.getVersion() != plugin.getVersion) {
							if (PluginUpdates && PluginUpdates.plugins && !PluginUpdates.plugins[url]) outdated++;
						}
					}
					else {
						let name = body.replace(new RegExp("\\s*\:\\s*", "g"), ":").split('"name":"');
						if (name.length > 1 && webview) {
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
									var installedPlugin = window.bdplugins[plugin.getName] ? window.bdplugins[plugin.getName].plugin : null;
									if (installedPlugin && installedPlugin.getAuthor().toUpperCase() == plugin.getAuthor.toUpperCase() && installedPlugin.getVersion() != plugin.getVersion) outdated++;
								});
							});
						}
					}
				}
				i++;
				getPluginInfo(webview, callback);
			});
		}
		
		function createWebview () {
			return new Promise(function(callback) {
				var webview;
				webview = document.createElement("webview");
				webview.src = "https://discordapp.com/";
				webview.setAttribute("webview-PluginRepo", null);
				webview.style.setProperty("visibility", "hidden");
				webview.addEventListener("dom-ready", () => {
					callback(webview);
				});
				document.body.appendChild(webview);
			});
		}
	}
	
	checkForNewPlugins () {
		let request = require("request");
		request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/PluginRepo/res/PluginList.txt", (error, response, result) => {
			if (response && !BDFDB.equals(result.split("\n"), this.grabbedPlugins)) this.loadPlugins();
		});
	}
	
	downloadPlugin (entry) {
		let request = require("request");
		request(entry.url, (error, response, body) => {
			if (error) {
				BDFDB.showToast(`Unable to download Plugin "${plugin.getName}".`, {type:"danger"});
			}
			else {
				let filename = entry.url.split("/");
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
	
	startPlugin (entry) {
		var name = entry.name;
		if (BDFDB.isPluginEnabled(name) == false) {
			bdplugins[name].plugin.start();
			pluginCookie[name] = true;
			pluginModule.savePluginData();
			console.log("PluginRepo: started Plugin " + name);
		}
	}
	
	deletePluginFile (entry) {
		let fileSystem = require("fs");
		let path = require("path");
		let filename = entry.url.split("/");
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
	
	stopPlugin (entry) {
		var name = entry.name;
		if (BDFDB.isPluginEnabled(name) == true) {
			bdplugins[name].plugin.stop();
			pluginCookie[name] = false;
			delete bdplugins[name];
			pluginModule.savePluginData();
			console.log("PluginRepo: stopped Plugin " + name);
		}
	}
}
