//META{"name":"ServerFolders","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ServerFolders","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ServerFolders/ServerFolders.plugin.js"}*//

class ServerFolders {
	getName () {return "ServerFolders";}

	getVersion () {return "6.3.6";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds the feature to create folders to organize your servers. Right click a server > 'Serverfolders' > 'Create Server' to create a server. To add servers to a folder hold 'Ctrl' and drag the server onto the folder, this will add the server to the folderlist and hide it in the serverlist. To open a folder click the folder. A folder can only be opened when it has at least one server in it. To remove a server from a folder, open the folder and either right click the server > 'Serverfolders' > 'Remove Server from Folder' or hold 'Del' and click the server in the folderlist.";}

	constructor () {
		this.changelog = {
			"fixed":[["Light Theme Update","Fixed bugs for the Light Theme Update, which broke 99% of my plugins"]]
		};

		this.labels = {};

		this.patchModules = {
			"Guilds":["componentDidMount","componentDidUpdate","componentWillUnmount"],
			"Guild":["componentDidMount","componentDidUpdate","render","componentWillUnmount"],
			"StandardSidebarView":"componentWillUnmount"
		};
	}

	initConstructor () {
		this.cachedGuildState = {};

		this.css = `
			.${this.name}-modal .ui-icon-picker-icon {
				position: relative;
				width: 70px;
				height: 70px;
				border: 4px solid transparent;
				border-radius: 12px;
				margin: 0;
			}
			.${this.name}-modal .ui-icon-picker-icon .ui-picker-inner {
				margin: 5px 5px;
				width: 60px;
				height: 60px;
				background-repeat: no-repeat;
				background-clip: padding-box;
				background-position: 50%;
				background-size: cover;
				border-radius: 12px;
			}
			.${this.name}-modal .ui-icon-picker-icon.selected ${BDFDB.dotCN.hovercardbutton} {
				display: none !important;
			}
			.${this.name}-modal .ui-icon-picker-icon ${BDFDB.dotCN.hovercardbutton} {
				position: absolute;
				top: -10px;
				right: -10px;
			}
			.${this.name}-modal .ui-icon-picker-icon.preview.nopic .ui-picker-inner {
				background-image: url('data:image/svg+xml; utf8, <svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" version="1.1" width="400" height="400"><path d="M40.400 17.178 C 39.850 17.366,38.793 17.538,38.050 17.560 C 33.351 17.699,23.397 24.788,21.381 29.432 C 21.087 30.109,20.566 30.896,20.223 31.181 C 19.880 31.465,19.600 31.866,19.600 32.071 C 19.600 32.276,19.236 33.242,18.792 34.218 C 16.345 39.589,16.345 49.611,18.792 54.982 C 19.236 55.958,19.600 56.918,19.600 57.116 C 19.600 57.314,19.960 57.802,20.400 58.200 C 20.840 58.598,21.200 59.131,21.200 59.385 C 21.200 60.391,25.680 64.942,91.505 130.800 C 128.995 168.310,159.849 199.326,160.068 199.724 C 160.409 200.344,150.950 209.964,93.989 266.924 C 18.798 342.113,19.600 341.292,19.600 343.126 C 19.600 343.283,19.250 344.065,18.822 344.864 C 15.429 351.195,15.958 362.918,19.932 369.440 C 22.094 372.990,27.474 378.800,28.598 378.800 C 28.861 378.800,29.402 379.160,29.800 379.600 C 30.198 380.040,30.703 380.400,30.922 380.400 C 31.141 380.400,32.238 380.831,33.360 381.358 C 34.482 381.886,36.480 382.533,37.800 382.797 C 43.786 383.994,44.323 384.027,47.299 383.386 C 48.895 383.042,51.010 382.619,52.000 382.446 C 52.990 382.274,54.517 381.743,55.394 381.266 C 56.271 380.790,57.188 380.400,57.432 380.400 C 57.676 380.400,58.202 380.040,58.600 379.600 C 58.998 379.160,59.598 378.800,59.932 378.800 C 60.267 378.800,91.725 347.615,129.839 309.500 C 169.057 270.281,199.496 240.145,199.964 240.073 C 200.602 239.975,216.001 255.193,267.495 306.814 C 327.046 366.511,339.531 378.800,340.627 378.800 C 340.798 378.800,341.265 379.097,341.667 379.461 C 345.728 383.136,361.013 384.409,365.685 381.461 C 366.188 381.143,367.024 380.757,367.541 380.602 C 370.583 379.691,376.623 374.200,379.382 369.836 C 385.105 360.785,384.039 346.409,377.039 338.228 C 376.084 337.113,344.846 305.743,307.621 268.517 C 255.329 216.224,239.969 200.647,240.070 200.009 C 240.143 199.545,270.062 169.288,308.216 131.091 C 345.625 93.641,376.723 62.370,377.324 61.600 C 384.286 52.678,385.036 40.621,379.277 30.171 C 376.136 24.469,367.906 18.537,361.668 17.477 C 354.656 16.286,345.095 17.665,341.883 20.331 C 341.567 20.594,340.549 21.318,339.622 21.941 C 338.695 22.563,307.031 53.972,269.259 91.737 C 231.486 129.501,200.330 160.400,200.022 160.400 C 199.714 160.400,168.938 129.869,131.631 92.554 C 56.225 17.131,60.288 21.047,55.200 18.887 C 51.591 17.354,42.836 16.343,40.400 17.178z" fill="rgb(220,43,67)"></path></svg>');
			}
			${BDFDB.dotCN.guildouter}.folder ${BDFDB.dotCN.guildicon} {
				background-clip: padding-box !important;
				background-position: center !important;
				background-size: cover !important;
			}
			${BDFDB.dotCN.guildupperbadge}.count {
				left: 0px;
				right: unset;
			}
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview {
				pointer-events: none !important;
				position: absolute !important;
				opacity: 0.5 !important;
				z-index: 10000 !important;
			}
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview,
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview ${BDFDB.dotCN.guildinner},
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview ${BDFDB.dotCNS.guildinner + BDFDB.dotCN.guildiconwrapper},
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview ${BDFDB.dotCNS.guildinner + BDFDB.dotCNS.guildiconwrapper + BDFDB.dotCN.guildicon} {
				border-radius: 50% !important;
				width: 48px !important;
				height: 48px !important;
			}
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview ${BDFDB.dotCN.guildpillwrapper},
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview ${BDFDB.dotCN.guildbadgewrapper} {
				display: none !important;
			}
			${BDFDB.dotCN.guildouter}.serverfolders-dragpreview ${BDFDB.dotCN.guildiconacronym} {
				color: white !important;
				background-color: #444 !important;
				border-radius: 50% !important;
				overflow: hidden !important;
			}
			${BDFDB.dotCN.guildswrapper}.foldercontent {
				transition: width .3s linear !important;
				left: 72px;
			}
			${BDFDB.dotCN.guildswrapper}.foldercontent .folderseparatorouter {
				margin-top: 10px;
			}
			${BDFDB.dotCN.guildswrapper}.foldercontent.foldercontentclosed {
				width: 0px !important;
			}
			${BDFDB.dotCN.appcontainer} {
				display: flex !important;
			}
			${BDFDB.dotCN.guildswrapper} {
				position: static !important;
				contain: unset !important;
			}
			${BDFDB.dotCN.chatbase} {
				position: static !important;
				contain: unset !important;
				width: 100% !important;
			}`;

		this.folderContentMarkup = 
			`<div class="${BDFDB.disCNS.guildswrapper + BDFDB.disCN.guilds} foldercontent foldercontentclosed">
				<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.firefoxfixscrollflex + BDFDB.disCNS.guildsscrollerwrap + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
					<div class="${BDFDB.disCNS.guildsscroller + BDFDB.disCN.scroller}"></div>
				</div>
			</div>`;

		this.folderIconMarkup =
			`<div class="${BDFDB.disCNS.guildouter + BDFDB.disCN._bdguild} folder">
				<div class="${BDFDB.disCNS.guildpillwrapper + BDFDB.disCN.guildpill}">
					<span class="${BDFDB.disCN.guildpillitem}" style="opacity: 0; height: 8px; transform: translate3d(0px, 0px, 0px);"></span>
				</div>
				<div class="${BDFDB.disCN.guildcontainer}" draggable="false">
					<div class="${BDFDB.disCN.guildinner}">
						<svg width="48" height="48" viewBox="0 0 48 48" class="${BDFDB.disCN.guildsvg}">
							<mask id="" fill="black" x="0" y="0" width="48" height="48">
								<path d="M0 0 l50 0l0 50l-50 0l0 -50Z" fill="white"></path>
								<rect x="28" y="-4" width="24" height="24" rx="12" ry="12" transform="translate(20 -20)" fill="black"></rect>
								<rect x="28" y="28" width="24" height="24" rx="12" ry="12" transform="translate(20 20)" fill="black"></rect>
								<rect x="-4" y="-4" width="24" height="24" rx="12" ry="12" transform="translate(-20 -20)" fill="black"></rect>
							</mask>
							<foreignObject mask="" x="0" y="0" width="48" height="48">
								<a class="${BDFDB.disCN.guildiconwrapper}" draggable="false" style="border-radius: 50%; overflow: hidden;">
									<img class="${BDFDB.disCN.guildicon}" src="" width="48" height="48" draggable="false"></img>
								</a>
							</foreignObject>
						</svg>
						<div class="${BDFDB.disCN.guildbadgewrapper}">
							<div class="${BDFDB.disCN.guildlowerbadge} notifications" style="opacity: 1; transform: translate(0px, 0px); display: none;">
								<div class="${BDFDB.disCN.guildbadgenumberbadge}" style="background-color: rgb(240, 71, 71); width: 16px; padding-right: 1px;">0</div>
							</div>
							<div class="${BDFDB.disCN.guildupperbadge} count" style="opacity: 1; transform: translate(0px, 0px); display: none;">
								<div class="${BDFDB.disCN.guildbadgenumberbadge}" style="background-color: rgb(114, 137, 218); width: 16px; padding-right: 1px;">0</div>
							</div>
						</div>
					</div>
				</div>
				<div class="${BDFDB.disCN.guildedgewrapper}" aria-hidden="true">
					<span class="${BDFDB.disCN.guildedge}"></span>
					<span class="${BDFDB.disCN.guildedgemiddle}"></span>
					<span class="${BDFDB.disCN.guildedge}"></span>
				</div>
			</div>`;

		this.dragPlaceholderMarkup =
			`<div class="${BDFDB.disCNS.guildouter + BDFDB.disCN._bdguild} foldercopyplaceholder">
				<div class="${BDFDB.disCNS.guildpillwrapper + BDFDB.disCN.guildpill}">
					<span class="${BDFDB.disCN.guildpillitem}"></span>
				</div>
				<div tabindex="0" class="${BDFDB.disCNS.guildcontainer + BDFDB.disCN.guildinner}" role="button">
					<svg width="48" height="48" viewBox="0 0 48 48" class="${BDFDB.disCN.guildplaceholdermask}">
						<foreignObject mask="url(#svg-mask-squircle)" x="0" y="0" width="48" height="48">
							<div class="${BDFDB.disCN.guildplaceholder}"></div>
						</foreignObject>
					</svg>
					<div class="${BDFDB.disCN.guildbadgewrapper}"></div>
				</div>
			</div>`;

		this.folderSettingsModalMarkup =
			`<span class="${this.name}-modal BDFDB-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto; padding-bottom: 10px;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.defaultcolor + BDFDB.disCN.h4defaultmargin}">REPLACE_modal_header_text</h4>
									<div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div>
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
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.marginbottom8 + BDFDB.disCN.tabbarcontainer}" style="flex: 0 0 auto; padding-right: 12px;">
								<div class="${BDFDB.disCNS.tabbar + BDFDB.disCN.tabbartop}">
									<div tab="folder" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbaritem}">REPLACE_modal_tabheader1_text</div>
									<div tab="icon" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbaritem}">REPLACE_modal_tabheader2_text</div>
									<div tab="tooltip" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbaritem}">REPLACE_modal_tabheader3_text</div>
									<div tab="custom" class="${BDFDB.disCNS.settingsitem + BDFDB.disCN.tabbaritem}">REPLACE_modal_tabheader4_text</div>
								</div>
							</div>
							<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner}">
									<div tab="folder" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_foldername_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-foldername"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_iconpicker_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} icons" style="flex: 1 1 auto;"></div>
									</div>
									<div tab="icon" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker1_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker2_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
									</div>
									<div tab="tooltip" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker3_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker4_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">REPLACE_modal_copytooltipcolor_text</h3>
											<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
												<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-copytooltipcolor">
											</div>
										</div>
									</div>
									<div tab="custom" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_customopen_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
												<input type="text" option="open" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" placeholder="Url or Filepath">
											</div>
											<button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} file-navigator" style="flex: 0 0 auto;">
												<div class="${BDFDB.disCN.buttoncontents}"></div>
												<input type="file" option="open" accept="image/*" style="display:none!important;">
											</button>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_customclosed_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
												<input type="text" option="closed" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" placeholder="Url or Filepath">
											</div>
											<button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} file-navigator" style="flex: 0 0 auto;">
												<div class="${BDFDB.disCN.buttoncontents}"></div>
												<input type="file" option="closed" accept="image/*" style="display:none!important;">
											</button>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_custompreview_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifycenter + BDFDB.disCN.aligncenter + BDFDB.disCNS.nowrap}" style="flex: 1 1 auto;">
												<div class="ui-icon-picker-icon preview nopic open">
													<div class="ui-picker-inner"></div>
												</div>
												<div class="ui-icon-picker-icon preview nopic closed" style="margin-left: 25px; margin-right: 25px;">
													<div class="ui-picker-inner"></div>
												</div>
												<div class="ui-icon-picker-icon preview nopic switching">
													<div class="ui-picker-inner"></div>
												</div>
											</div>
											<button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} btn-add btn-addcustom" style="flex: 0 0 auto;">
												<div class="${BDFDB.disCN.buttoncontents}"></div>
											</button>
										</div>
									</div>
								</div>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontalreverse + BDFDB.disCNS.horizontalreverse2 + BDFDB.disCNS.directionrowreverse + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.modalfooter}">
								<button type="button" class="btn-save ${BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow}">
									<div class="${BDFDB.disCN.buttoncontents}"></div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;

		this.folderIcons = [
			{openicon:`<path d="M 200,390 H 955 L 795,770 H 200 Z" fill="REPLACE_FILL2"/><path d="M 176.6,811 C 163.9,811 155.1,802.6 155,784.7 V 212.9 C 157.9,190.5 169,179.8 195.9,176 h 246 c 20.3,3.2 34.5,18.7 41,28.6 C 494.9,228.3 492.9,240.4 494,266 l 313.6,1.3 c 17.6,0.4 23.3,3.7 23.3,3.7 8.6,4.2 14.8,10.7 19,19.5 C 856.3,319.5 854,360 854,360 h 108.9 c 4.4,2.4 13.7,1.2 11.8,23.5 L 815.8,789.4 c -2.1,5.2 -12.5,13.6 -18.7,16.1 -6.8,2.7 -18.5,5.5 -23.9,5.5 z M 767,759 897,430 H 360 L 230,759 Z" fill="REPLACE_FILL1"/>`,
			closedicon:`<path d="M 175,320 V 790 H 820 V 320 Z" fill="REPLACE_FILL2"/><path d="m 183,811 c -12.2,-0.6 -17.9,-4.8 -21.5,-8.2 C 159.5,801 154.8,792.6 155,779.7 V 215.6 c 3.3,-14.1 9.3,-21.4 15.1,-26.4 7.4,-6.3 16,-11.6 36.7,-13.2 h 237.3 c 23.3,6 32.2,18.7 38.7,28.6 7.6,11.7 9.4,18.6 10.3,41.4 L 494,266 h 313.4 c 16.9,0.1 23.5,5.1 23.5,5.1 8.6,4.2 14.5,10.9 19,19.5 0,0 3.7,7.5 3.1,19.8 V 777.2 c -1.1,9 -4.1,13.7 -4.1,13.7 -4.2,8.6 -10.7,14.8 -19.5,19 L 823.3,811 Z m 602.8,-55 c 2.8,-1.7 6.9,-4.5 8.9,-7.4 2.4,-3.6 5,-10.8 5.4,-24.7 V 362 c -0.2,-10.9 -4.2,-16.3 -4.2,-16.3 -2,-3 -5.9,-6.8 -8.7,-8.6 0,0 -5.8,-3 -12.7,-3.2 h -548.1 c -7.8,0 -13.9,3.6 -13.9,3.6 -3,2 -7.3,6.7 -8.4,17.3 v 386.4 c 2.8,10.4 7.5,16 13.6,17.7 h 544.9 c 11,-0.2 18.4,-1.9 23.3,-3 z" fill="REPLACE_FILL1"/>`},
			{openicon:`<path d="m 167,200 h 200 l 50,50 H 829.8 L 830,330 H 970 L 825,779 H 167 Z" fill="REPLACE_FILL2"/><path d="m 184,799 c -10.5,0 -22.3,-5.3 -27,-10 -4.7,-4.7 -9,-15.1 -9,-34 V 212 c 0,-13.3 5,-22 11,-28 4.4,-4.4 15.4,-10 30,-10 h 170.3 l 53.3,53 H 820 c 13.1,0 18.2,4.2 25,10 6.4,5.5 7,14.4 7,31 v 52 h 122.3 c 11.6,0 17.1,3.3 17.1,3.3 2.9,2.9 3.3,4.4 3.3,14.2 0,8.4 -0.9,13.5 -3.8,22.4 L 849,799 Z M 933,360 H 335 l -130,398.1 603.2,1.3 z M 289.7,334.6 c 3,-8.2 8,-14.8 17,-14.8 0,0 506.6,0.2 506.3,0.2 0,-39.8 -12.2,-53 -53,-53 L 403.3,266.7 350,213 H 240 c -37.6,0 -53,10.1 -53,53 v 382.7 z" fill="REPLACE_FILL1"/>`,
			closedicon:`<path d="M 173,190 V 771 H 825 V 250 H 420 l -70,-60 z" fill="REPLACE_FILL2"/><path d="M 184.2,799 C 170.3,799 164.3,795.8 157.4,788.9 151.7,783.3 148,774.6 148,754.9 V 211.2 c 0.7,-18.6 6,-21.7 11.9,-27.6 6.8,-6.8 15.5,-9.4 29.3,-9.6 h 170.1 l 53.3,53 h 407.7 c 14.1,0 18.6,2.8 25.3,9.4 6.4,6.4 7.1,13.4 7.1,30.8 v 246.1 247.4 c 0.2,11.8 -1.9,22.1 -7.4,27.6 C 839.7,793.9 831,799 819.4,799 Z M 813,707 V 415 c 0,-36.9 -13.9,-53 -53,-53 H 240 c -38.1,0 -53,11.7 -53,53 v 292 c 0,38.8 11.5,53 53,53 h 520 c 37.8,0 53,-12.1 53,-53 z M 760,267 c 0,0 -228.6,-0.3 -356.7,-0.3 L 350,213 H 240 c -41.6,2.7 -52.2,14.3 -53,53 v 54 h 626 c -0.6,-37.5 -12,-53 -53,-53 z" fill="REPLACE_FILL1"/>`},
			{openicon:`<path d="M 307,330 H 970 L 825,779 H 167 Z" fill="REPLACE_FILL2"/><path d="M 189 174 C 174.4 174 163.4 179.6 159 184 C 153 190 148 198.7 148 212 L 148 755 C 148 773.9 152.3 784.3 157 789 C 161.7 793.7 173.5 799 184 799 L 849 799 L 990.8 359.8 C 993.8 350.9 994.7 345.9 994.7 337.4 C 994.7 327.6 994.3 326.2 991.4 323.3 C 991.4 323.3 985.9 320 974.3 320 L 852 320 L 852 268 C 852 251.4 851.4 242.5 845 237 C 838.2 231.2 833.1 227 820 227 L 412.6 227 L 359.3 174 L 189 174 z M 335 360 L 933 360 L 808.2 759.3 L 205 758.1 L 335 360 z" fill="REPLACE_FILL1"/>`,
			closedicon:`<path d="M 173,345 V 771 H 825 V 345 Z" fill="REPLACE_FILL2"/><path d="M 189.2 174 C 175.4 174.2 166.7 176.8 159.9 183.6 C 154 189.5 148.7 192.7 148 211.2 L 148 754.9 C 148 774.6 151.7 783.3 157.4 788.9 C 164.3 795.8 170.3 799 184.2 799 L 819.4 799 C 831 799 839.7 793.9 845.2 788.4 C 850.8 782.8 852.9 772.5 852.7 760.8 L 852.7 513.3 L 852.7 267.2 C 852.7 249.8 852 242.8 845.6 236.4 C 838.9 229.7 834.4 227 820.3 227 L 412.6 227 L 359.3 174 L 189.2 174 z M 240 362 L 760 362 C 799.1 362 813 378.1 813 415 L 813 707 C 813 747.9 797.8 760 760 760 L 240 760 C 198.5 760 187 745.8 187 707 L 187 415 C 187 373.7 201.9 362 240 362 z" fill="REPLACE_FILL1"/>`},
			{openicon:`<path d="m 167,200 h 200 l 50,50 H 829.8 L 830,330 H 314 L 167,779 Z" fill="REPLACE_FILL2"/><path d="M 189 174 C 174.4 174 163.4 179.6 159 184 C 153 190 148 198.7 148 212 L 148 755 C 148 773.9 152.3 784.3 157 789 C 161.7 793.7 173.5 799 184 799 L 849 799 L 990.8 359.8 C 993.8 350.9 994.7 345.9 994.7 337.4 C 994.7 327.6 994.3 326.2 991.4 323.3 C 991.4 323.3 985.9 320 974.3 320 L 852 320 L 852 268 C 852 251.4 851.4 242.5 845 237 C 838.2 231.2 833.1 227 820 227 L 412.6 227 L 359.3 174 L 189 174 z M 240 213 L 350 213 L 403.3 266.7 L 760 267 C 800.8 267 813 280.2 813 320 C 813.3 320 306.7 319.8 306.7 319.8 C 297.7 319.8 292.7 326.4 289.7 334.6 L 187 648.7 L 187 266 C 187 223.1 202.4 213 240 213 z" fill="REPLACE_FILL1"/>`,
			closedicon:`<path d="M 173,190 V 350 H 825 V 250 H 420 l -70,-60 z" fill="REPLACE_FILL2"/><path d="M 189.2 174 C 175.4 174.2 166.7 176.8 159.9 183.6 C 154 189.5 148.7 192.7 148 211.2 L 148 754.9 C 148 774.6 151.7 783.3 157.4 788.9 C 164.3 795.8 170.3 799 184.2 799 L 819.4 799 C 831 799 839.7 793.9 845.2 788.4 C 850.8 782.8 852.9 772.5 852.7 760.8 L 852.7 513.3 L 852.7 267.2 C 852.7 249.8 852 242.8 845.6 236.4 C 838.9 229.7 834.4 227 820.3 227 L 412.6 227 L 359.3 174 L 189.2 174 z M 240 213 L 350 213 L 403.3 266.7 C 531.4 266.7 760 267 760 267 C 801 267 812.4 282.5 813 320 L 187 320 L 187 266 C 187.8 227.3 198.4 215.7 240 213 z" fill="REPLACE_FILL1"/>`},
			{openicon:`<path d="M 132,305 H 880 V 750 H 132 Z" fill="REPLACE_FILL2"/><path d="m 135,188 c -5.6,0 -13.9,2.9 -19.8,8.9 C 109.4,203 107,206.8 107,216 c 0,189.7 0,379.3 0,569 0,11.1 1.7,14.8 7,20.2 C 120.5,811.6 125.4,813 135,813 h 717 c 16.7,0 16.7,-1.6 18.6,-6.6 L 981.3,423.4 c 0,-5.8 -1,-6.2 -2.8,-8.1 -1.9,-1.9 -4.3,-2 -11.9,-2 l -691.9,2.1 c -16.4,0 -21.3,11.5 -23.4,17.2 l -80.9,263 -0.2,0 C 159.1,714.4 147,704.3 147,677.2 V 334 h 733 v -26 c 0,-7.7 -1.6,-14.7 -7.6,-19.8 C 866.3,283.1 860.4,280 852,280 H 440 l -20,-82 c -1.2,-2.5 -3.1,-6.8 -5.8,-7.7 0,0 -3,-2.3 -10.2,-2.3 z" fill="REPLACE_FILL1"/>`,
			closedicon:`<path d="M 132,305 H 880 V 750 H 132 Z" fill="REPLACE_FILL2"/><path d="m 135,813 c -10.3,0 -14.5,-1.4 -21,-7.8 C 108.7,799.8 107,796.1 107,785 c 0,-189.7 0,-379.3 0,-569 0,-9.2 2.4,-13 8.2,-19.1 C 121.1,190.9 129.4,188 135,188 h 269 c 7.2,0 10.2,2.3 10.2,2.3 2.7,0.9 4.6,5.2 5.8,7.7 l 20,82 h 412 c 8.4,0 14.3,3.1 20.4,8.2 C 878.4,293.3 880,300.3 880,308 v 26 H 147 v 343.2 c 0,27.1 18.1,25.2 21.7,5.4 l 32.7,-277.7 c 0.7,-2.8 2.7,-7.5 5.8,-10.6 C 210.4,391.1 214.5,388 222.7,388 H 852 c 7.9,0 15.9,2.9 20.5,7.5 C 878.3,401.3 880,408.6 880,416 v 369 c 0,6.9 -1.8,14.7 -7.4,19.3 C 866.2,809.6 858.9,813 852,813 Z" fill="REPLACE_FILL1"/>`},
			{openicon:`<path d="m 186.3,187 c -20,0 -35.7,7.4 -47.4,19.3 -11.7,11.9 -17.6,25 -17.6,45.7 v 80 l -0.3,416 c 0,10.9 4.6,32.6 16.7,45.1 C 149.8,805.6 168,813 186.3,813 365.7,749.3 880.3,734.5 880.3,734.5 c 0,0 0,-255.4 0,-402.5 0,-16.9 -4.7,-35 -17.2,-47.4 -12.5,-12.4 -30.1,-17.6 -47.8,-17.6 h -310 l -79,-80 z" fill="REPLACE_FILL1"/><path d="m 175.1,810.3 79.1,-393 c 8.3,-23.6 21.8,-42.9 53.1,-43 H 920.6 c 17.7,0 35.9,19.5 33.7,29.3 l -73.7,365.7 c -9,24.8 -11.1,41.3 -51.8,44 H 185.6 c -3.6,0 -6.4,-0.1 -11.1,-0.9 z" fill="REPLACE_FILL2"/>`,
			closedicon:`<path d="m 121,252 c 0,-20.7 5.9,-33.8 17.6,-45.7 C 150.3,194.4 166,187 186,187 h 240 l 79,80 -384,113 z" fill="REPLACE_FILL1"/><path d="m 186,813 c -18.4,0 -36.5,-7.4 -48.6,-19.9 C 125.3,780.6 120.7,758.9 120.7,748 L 121,332 c 0,-16.9 7.2,-31.7 18.6,-43.5 C 151,276.7 170.1,267 186,267 h 629 c 17.6,0 35.2,5.3 47.8,17.6 C 875.3,297 880,315.1 880,332 v 416 c 0,14.8 -3.4,36.6 -17,47.9 C 849.5,807.2 830.9,813 815,813 Z" fill="REPLACE_FILL2"/>`},
			{openicon:`<path d="m 160,253 h 614 c 14.8,0 29.7,8.6 36.9,15.8 C 819.4,277.3 826,289.4 826,305 v 95 H 160 Z" fill="REPLACE_FILL2"/><path d="m 199,200 c -26.2,0 -33.9,6.5 -41.5,15.6 C 149.8,224.8 147,231.8 147,252 V 386.7 387 c -20.9,0.5 -56.5,-3.5 -70.3,6.9 -2.5,1.9 -5.4,3.2 -8.3,9.8 -6.8,25.6 -0.3,54.8 1.1,70.3 9.1,59.2 69.1,294.7 74.9,310 3.7,9.8 4.6,13.6 10,15 h 689.6 c 6.3,-1.4 11.6,-15 11.6,-15 L 931.8,474 c 2.7,-20 8.3,-54 -0.2,-70.3 -2,-3.5 -6.5,-8.1 -9.3,-9.8 C 902.5,385.1 881.9,387 853,387 852.6,369.4 855,346.8 846.6,333 842.4,326.2 830.5,321.3 826,321.3 V 387 L 173.2,386.7 173,387 v -82 c 0,-14.6 2.8,-25.9 12.4,-35.5 C 195.9,259 207.7,253 225,253 h 201 l -54,-53 z" fill="REPLACE_FILL1"/>`,
			closedicon:`<path d="M 160,400 V 253 h 440 v 147 z" fill="REPLACE_FILL2"/><path d="m 186,799 c -24.2,0 -34,-8 -39.7,-13.6 C 140.8,779.9 134,769.1 134,747 V 372 c 0,-21.5 13,-32 13,-32 V 252 c 0,-20.2 2.8,-27.2 10.5,-36.4 C 165.1,206.5 172.8,200 199,200 h 173 l 54,53 H 225 c -17.3,0 -29.1,6 -39.6,16.5 C 175.8,279.1 173,290.4 173,305 l -0.4,19 c 0,0 9.6,-4 20.9,-4 H 494 L 614,200 h 186 c 17.7,0 26.6,7.1 36,14.2 C 846.5,222 852,233.6 852,252 v 495 c 0,16.1 -7.5,30.2 -14.1,36.7 C 831.4,790.2 815.9,799 800,799 Z" fill="REPLACE_FILL1"/>`}
		];

		this.defaults = {
			settings: {
				closeOtherFolders:	{value:false, 	description:"Close other Folders when opening a Folder."},
				closeTheFolder:		{value:false, 	description:"Close the Folder when selecting a Server."},
				closeAllFolders:	{value:false, 	description:"Close All Folders when selecting a Server."},
				forceOpenFolder:	{value:false, 	description:"Force a Folder to open when switching to a Server of that Folder."},
				showCountBadge:		{value:true, 	description:"Display Badge for Amount of Servers in a Folder."},
				addSeparators:		{value:true, 	description:"Adds separators between Servers of different Folders."}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.getAllData(this, "settings");
		let settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Reset all Folders.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Remove all custom Icons.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} removecustom-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Remove</div></button></div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".reset-button", () => {
			BDFDB.openConfirmModal(this, "Are you sure you want to delete all folders?", () => {
				BDFDB.removeAllData(this, "folders");
				this.resetAllElements();
			});
		});
		BDFDB.addEventListener(this, settingspanel, "click", ".removecustom-button", () => {
			BDFDB.openConfirmModal(this, "Are you sure you want to remove all custom icons?", () => {
				BDFDB.removeAllData(this, "customicons");
			});
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

			BDFDB.WebModules.forceAllUpdates(this, "Guilds");
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.resetAllElements();
			BDFDB.removeClasses("foldercontentopened");
			BDFDB.removeEles(this.foldercontent, BDFDB.dotCN.guildswrapper + ".foldercontent", ".serverfolder-contextmenu");
			BDFDB.unloadMessage(this);
		}
	}

	onSwitch () {
		if (typeof BDFDB === "object" && BDFDB.getData("forceOpenFolder", this, "settings")) {
			let serverObj = BDFDB.getSelectedServer();
			if (!serverObj) return;
			let folderdiv = this.getFolderOfServer(serverObj);
			if (!folderdiv || BDFDB.containsClass(folderdiv, "open")) return;
			this.openCloseFolder(folderdiv);
		}
	}


	// begin of own functions

	changeLanguageStrings () {
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_foldername_text", this.labels.modal_foldername_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_tabheader1_text", this.labels.modal_tabheader1_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_tabheader2_text", this.labels.modal_tabheader2_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_tabheader3_text", this.labels.modal_tabheader3_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_tabheader4_text", this.labels.modal_tabheader4_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_iconpicker_text", this.labels.modal_iconpicker_text);
		this.folderSettingsModalMarkup =	this.folderSettingsModalMarkup.replace("REPLACE_modal_copytooltipcolor_text", this.labels.modal_copytooltipcolor_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_colorpicker1_text", this.labels.modal_colorpicker1_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_colorpicker2_text", this.labels.modal_colorpicker2_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_colorpicker3_text", this.labels.modal_colorpicker3_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_colorpicker4_text", this.labels.modal_colorpicker4_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_customopen_text", this.labels.modal_customopen_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_customclosed_text", this.labels.modal_customclosed_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_custompreview_text", this.labels.modal_custompreview_text);
	}

	onGuildContextMenu (instance, menu, returnvalue) {
		if (document.querySelector(".BDFDB-modal")) return;
		if (instance.props && instance.props.target && instance.props.guild && instance.props.type == "GUILD_ICON_BAR" && !menu.querySelector(".serverfolders-item")) {
			let folders = document.querySelectorAll(BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter + ".folder");
			let folderdiv = this.getFolderOfServer(instance.props.guild);
			let addtofolderitems = [];
			for (let i = 0; i < folders.length; i++) addtofolderitems.push(BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
				label: folders[i].getAttribute("foldername") || (this.labels.modal_tabheader1_text + " #" + parseInt(i+1)),
				className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-addtofolder-contextMenuItem`,
				action: e => {
					BDFDB.closeContextMenu(menu);
					this.addServerToFolder(instance.props.guild, folders[i]);
				}
			}));
			let [children, index] = BDFDB.getContextMenuGroupAndIndex(returnvalue, ["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]);
			const itemgroup = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
				children: [
					BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuSubItem, {
						label: this.labels.servercontext_serverfolders_text,
						className: `BDFDB-contextMenuSubItem ${this.name}-contextMenuSubItem ${this.name}-guild-contextMenuSubItem`,
						render: [
							BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
								label: this.labels.serversubmenu_createfolder_text,
								className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-createfolder-contextMenuItem`,
								action: e => {
									BDFDB.closeContextMenu(menu);
									this.createNewFolder(instance.props.target);
								}
							}),
							folderdiv ? BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
								label: this.labels.serversubmenu_removefromfolder_text,
								className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-repo-contextMenuItem`,
								danger: true,
								action: e => {
									BDFDB.closeContextMenu(menu);
									this.removeServerFromFolder(instance.props.guild, folderdiv);
								}
							}) : BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuSubItem, {
								label: this.labels.serversubmenu_addtofolder_text,
								className: `BDFDB-contextMenuSubItem ${this.name}-contextMenuSubItem ${this.name}-addtofolder-contextMenuSubItem`,
								disabled: !addtofolderitems.length,
								render: addtofolderitems
							})
						]
					})
				]
			});
			if (index > -1) children.splice(index, 0, itemgroup);
			else children.push(itemgroup);
		}
	}

	processGuilds (instance, wrapper, returnvalue, methodnames) {
		if (methodnames.includes("componentWillUnmount")) {
			BDFDB.removeEles(this.foldercontent, BDFDB.dotCN.guildswrapper + ".foldercontent", ".serverfolder-contextmenu", BDFDB.dotCN.guildouter + ".folder");
			this.foldercontent = null;
		}
		if (methodnames.includes("componentDidMount")) {
			let process = () => {
				if (!wrapper.parentElement.querySelector(BDFDB.dotCN.guildswrapper + ".foldercontent")) {
					this.foldercontent = BDFDB.htmlToElement(this.folderContentMarkup);
					wrapper.parentElement.insertBefore(this.foldercontent, wrapper.nextElementSibling);
					this.foldercontentguilds = this.foldercontent.querySelector(BDFDB.dotCN.guildsscroller);
				}
				let folders = BDFDB.sortObject(BDFDB.loadAllData(this, "folders"), "position");
				for (let folderID in folders) if (folderID && !wrapper.querySelector(BDFDB.dotCN.guildouter + ".folder#" + folderID)) {
					let folderdiv = this.createFolderDiv(folders[folderID]);
					this.readIncludedServerList(folderdiv).forEach(guilddiv => {this.hideServer(guilddiv, folderdiv);});
				}
				BDFDB.WebModules.forceAllUpdates(this, "Guild");
			};
			if (document.querySelector(BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter + ":not(.folder):not(.copy) " + BDFDB.dotCN.guildicon)) process();
			else setTimeout(process, 5000);
		}
		if (methodnames.includes("componentDidUpdate")) {
			let serverAndFolders = this.getAllServersAndFolders();
			let folders = BDFDB.loadAllData(this, "folders");
			let foundfolders = serverAndFolders.filter(ele => BDFDB.containsClass(ele, "folder"));
			if (Object.keys(folders).length != foundfolders.length) for (let folderdiv of document.querySelectorAll(BDFDB.dotCN.guildouter + ".folder")) {
				if (folders[folderdiv.id]) this.insertFolderDiv(folders[folderdiv.id], folderdiv);
			}
		}
	}

	processGuild (instance, wrapper, returnvalue, methodnames) {
		if (instance.props && instance.props.guild) {
			if (methodnames.includes("componentDidMount")) {
				this.cachedGuildState[instance.props.guild.id] = this.getGuildState(instance);
				let folderdiv = this.getFolderOfServer(instance.props.guild);
				if (folderdiv && !wrapper.getAttribute("folder")) {
					this.hideServer(wrapper, folderdiv);
					this.updateCopyInFolderContent(wrapper, folderdiv);
					this.updateFolderNotifications(folderdiv);
				}
				BDFDB.addEventListener(this, wrapper, "click", () => {setImmediate(() => {
					var newsettings = BDFDB.getAllData(this, "settings")
					if (newsettings.closeAllFolders) document.querySelectorAll(BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter + ".folder.open").forEach(openFolder => {
						if (!newsettings.forceOpenFolder || !this.foldercontent.querySelector(`${BDFDB.dotCN.guildouter}[folder="${openFolder.id}"][guild="${BDFDB.LibraryModules.LastGuildStore.getGuildId()}"]`)) this.openCloseFolder(openFolder);
					});
				})});
				BDFDB.addEventListener(this, wrapper, "mousedown", e => {
					if (BDFDB.pressedKeys.includes(17)) {
						BDFDB.stopEvent(e);
						let dragpreview = this.createDragPreview(wrapper, e);
						let updatePreview = e2 => {
							this.updateDragPreview(dragpreview, e2);
						};
						let droppedPreview = e2 => {
							let dropfolderdiv = BDFDB.getParentEle(BDFDB.dotCN.guildouter + ".folder", e2.target);
							if (dropfolderdiv) this.addServerToFolder(instance.props.guild, dropfolderdiv);
							document.removeEventListener("mousemove", updatePreview);
							document.removeEventListener("mouseup", droppedPreview);
							BDFDB.removeEles(dragpreview);
						};
						document.addEventListener("mousemove", updatePreview);
						document.addEventListener("mouseup", droppedPreview);
					}
				});
			}
			if (methodnames.includes("componentDidUpdate")) {
				let state = this.getGuildState(instance);
				if (!BDFDB.equals(state, this.cachedGuildState[instance.props.guild.id])) {
					this.cachedGuildState[instance.props.guild.id] = state;
					let folderdiv = this.getFolderOfServer(instance.props.guild);
					if (folderdiv) setTimeout(() => {
						this.updateCopyInFolderContent(wrapper, folderdiv);
						this.updateFolderNotifications(folderdiv);
					},1000);
				}
			}
			if (methodnames.includes("render")) {
				if (!wrapper.getAttribute("folder")) {
					let folderdiv = this.getFolderOfServer(instance.props.guild);
					if (folderdiv) {
						this.cachedGuildState[instance.props.guild.id] = this.getGuildState(instance);
						this.hideServer(wrapper, folderdiv);
						this.updateCopyInFolderContent(wrapper, folderdiv);
						this.updateFolderNotifications(folderdiv);
					}
				}
			}
			if (methodnames.includes("componentWillUnmount")) {
				let folderdiv = this.getFolderOfServer(instance.props.guild);
				if (folderdiv) {
					BDFDB.removeEles(this.foldercontent.querySelectorAll(`[guild="${instance.props.guild.id}"]`));
					this.updateFolderNotifications(folderdiv);
				}
			}
		}
	}

	processStandardSidebarView (instance, wrapper, returnvalue) {
		if (this.SettingsUpdated && this.foldercontent) {
			delete this.SettingsUpdated;
			this.foldercontent.querySelectorAll(BDFDB.dotCN.guildouter + ".folder").forEach(folderdiv => {this.updateFolderNotifications(folderdiv);});
		}
	}

	getGuildState (instance) {
		let state = {};
		for (let key in instance.props) if (typeof instance.props[key] != "object" && typeof instance.props[key] != "function") state[key] = instance.props[key];
		return state;
	}

	showFolderSettings (folderdiv) {
		if (!folderdiv) return;
		let {folderID,folderName,position,iconID,icons,copyTooltipColor,color1,color2,color3,color4,servers,isOpen,autounread} = BDFDB.loadData(folderdiv.id, this, "folders") || {};
		if (!folderID) return;

		let folderSettingsModal = BDFDB.htmlToElement(this.folderSettingsModalMarkup);
		let foldernameinput = folderSettingsModal.querySelector("#input-foldername");
		let copytooltipcolorinput = folderSettingsModal.querySelector("#input-copytooltipcolor");

		folderSettingsModal.querySelector(BDFDB.dotCN.modalguildname).innerText = folderName || "";
		foldernameinput.value = folderName || "";
		foldernameinput.setAttribute("placeholder", folderName || "");
		copytooltipcolorinput.checked = copyTooltipColor;
		this.setIcons(folderSettingsModal, iconID);
		BDFDB.setColorSwatches(folderSettingsModal, color1);
		BDFDB.setColorSwatches(folderSettingsModal, color2);
		BDFDB.setColorSwatches(folderSettingsModal, color3);
		BDFDB.setColorSwatches(folderSettingsModal, color4);

		BDFDB.appendModal(folderSettingsModal);

		BDFDB.addChildEventListener(folderSettingsModal, "change", "input[type='file'][option]", e => {
			let file = e.currentTarget.files[0];
			if (file) this.fetchCustomIcon(folderSettingsModal, e.currentTarget.getAttribute("option"));
		});
		BDFDB.addChildEventListener(folderSettingsModal, "keyup", "input[type='text'][option]", e => {
			if (e.which == 13) this.fetchCustomIcon(folderSettingsModal, e.currentTarget.getAttribute("option"));
		});
		BDFDB.addChildEventListener(folderSettingsModal, "click", ".btn-addcustom", () => {
			this.saveCustomIcon(folderSettingsModal);
		});
		BDFDB.addChildEventListener(folderSettingsModal, "click", ".btn-save", e => {
			folderName = foldernameinput.value.trim();
			folderName = folderName ? folderName : null;

			var oldIconID = iconID;
			var selectedIcon = folderSettingsModal.querySelector(".ui-icon-picker-icon.selected");
			iconID = selectedIcon.getAttribute("value");

			copyTooltipColor = copytooltipcolorinput.checked;

			var oldColor1 = color1;
			var oldColor2 = color2;
			color1 = BDFDB.getSwatchColor(folderSettingsModal, 1);
			color2 = BDFDB.getSwatchColor(folderSettingsModal, 2);
			color3 = BDFDB.getSwatchColor(folderSettingsModal, 3);
			color4 = BDFDB.getSwatchColor(folderSettingsModal, 4);

			if (folderName) folderdiv.setAttribute("foldername", folderName);
			else folderdiv.removeAttribute("foldername");
			folderdiv.querySelector(BDFDB.dotCN.guildiconwrapper).setAttribute("aria-label", folderName || "");

			if (iconID != oldIconID || !BDFDB.equals(color1, oldColor1) || !BDFDB.equals(color2, oldColor2)) {
				let folderIcons = this.loadAllIcons();
				let isCustom = BDFDB.containsClass(selectedIcon, "custom");
				icons.openicon = !isCustom ? this.createBase64SVG(folderIcons[iconID].openicon, color1, color2) : folderIcons[iconID].openicon;
				icons.closedicon = !isCustom ? this.createBase64SVG(folderIcons[iconID].closedicon, color1, color2) : folderIcons[iconID].closedicon;
				folderdiv.querySelector(BDFDB.dotCN.guildicon).setAttribute("src", `${isOpen ? icons.openicon : icons.closedicon}`);
				BDFDB.saveData(folderID, {folderID,folderName,position,iconID,icons,copyTooltipColor,color1,color2,color3,color4,servers,isOpen}, this, "folders");
			}
			else BDFDB.saveData(folderID, {folderID,folderName,position,iconID,icons,copyTooltipColor,color1,color2,color3,color4,servers,isOpen}, this, "folders");
		});
		foldernameinput.focus();
	}

	createBase64SVG (paths, color1 = "#000000", color2 = "#FFFFFF") {
		if (paths.indexOf("<path ") != 0) return paths;
		let isgradient1 = color1 && BDFDB.isObject(color1);
		let isgradient2 = color1 && BDFDB.isObject(color2);
		let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000">`;
		if (isgradient1) {
			svg += `<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">`;
			for (let pos of Object.keys(color1).sort()) svg += `<stop offset="${pos * 100}%" style="stop-color: ${color1[pos]};"></stop>`;
			svg += `</linearGradient>`;
		}
		if (isgradient2) {
			svg += `<linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">`;
			for (let pos of Object.keys(color2).sort()) svg += `<stop offset="${pos * 100}%" style="stop-color: ${color2[pos]};"></stop>`;
			svg += `</linearGradient>`;
		}
		svg += `${paths.replace("REPLACE_FILL1", isgradient1 ? "url(#grad1)" : BDFDB.colorCONVERT(color1, "HEX")).replace("REPLACE_FILL2", isgradient2 ? "url(#grad2)" : BDFDB.colorCONVERT(color2, "HEX"))}</svg>`;
		return `data:image/svg+xml;base64,${btoa(svg)}`;
	}

	setIcons (modal, selection) {
		let wrapper = modal.querySelector(".icons");
		if (!wrapper) return;
		BDFDB.removeEles(wrapper.childNodes);

		let folderIcons = this.loadAllIcons();
		for (let id in folderIcons) if (!folderIcons[id].customID) {
			folderIcons[id].openicon = this.createBase64SVG(folderIcons[id].openicon);
			folderIcons[id].closedicon = this.createBase64SVG(folderIcons[id].closedicon);
		}

		wrapper.appendChild(BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.margintop4}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCN.wrap} ui-icon-picker-row" style="flex: 1 1 auto; display: flex; flex-wrap: wrap; overflow: visible !important;">${Object.getOwnPropertyNames(folderIcons).map(id => `<div class="ui-icon-picker-icon${folderIcons[id].customID ? ' custom' : ''}" value="${id}"><div class="ui-picker-inner" style="background-image: url(${folderIcons[id].closedicon});"></div>${folderIcons[id].customID ? '<div value="' + id + '" class="' + BDFDB.disCN.hovercardbutton + '"></div>' : ''}</div>`).join("")}</div></div>`));

		setIcon(wrapper.querySelector(`.ui-icon-picker-icon[value="${folderIcons[selection] ? selection : 0}"]`), false, true);

		BDFDB.addChildEventListener(wrapper, "click", ".ui-icon-picker-icon", e => {
			if (BDFDB.containsClass(e.target, BDFDB.disCN.hovercardbutton)) return;
			setIcon(wrapper.querySelector(".ui-icon-picker-icon.selected"), false, false);
			setIcon(e.currentTarget, true, true);
		});
		BDFDB.addChildEventListener(wrapper, "click", BDFDB.dotCN.hovercardbutton, e => {
			if (BDFDB.containsClass(e.currentTarget.parentElement, "selected")) return;
			BDFDB.removeData(e.currentTarget.getAttribute("value"), this, "customicons");
			e.currentTarget.parentElement.remove();
			BDFDB.showToast(`Custom Icon was deleted.`, {type:"success"});
		});
		BDFDB.addChildEventListener(wrapper, "mouseenter", ".ui-icon-picker-icon", e => {
			setIcon(e.currentTarget, true);
		});
		BDFDB.addChildEventListener(wrapper, "mouseleave", ".ui-icon-picker-icon", e => {
			setIcon(e.currentTarget, false);
		});

		function setIcon (icon, hover, enable) {
			if (!icon) return;
			if (enable != undefined) BDFDB.toggleClass(icon, "selected", enable);
			if (hover) {
				icon.querySelector(".ui-picker-inner").style.setProperty("background-image", `url(${folderIcons[icon.getAttribute("value")].openicon})`);
				if (BDFDB.containsClass(icon, "selected")) icon.style.setProperty("background-color", "rgb(255,255,255,0.2)");
				else icon.style.setProperty("background-color", "rgb(255,255,255,0.1)");
			}
			else {
				icon.querySelector(".ui-picker-inner").style.setProperty("background-image", `url(${folderIcons[icon.getAttribute("value")].closedicon})`);
				if (BDFDB.containsClass(icon, "selected")) icon.style.setProperty("background-color", "rgb(255,255,255,0.2)");
				else icon.style.removeProperty("background-color");
			}
		}
	}

	loadAllIcons () {
		let icons = {};
		this.folderIcons.forEach((array,i) => {icons[i] = {"openicon":array.openicon,"closedicon":array.closedicon,"customID":null};});
		Object.assign(icons, BDFDB.loadAllData(this, "customicons"));
		return icons;
	}

	fetchCustomIcon (modal, type) {
		let successFetchIcon;
		let url = modal.querySelector("input[type='text'][option='" + type + "']").value;
		if (url.indexOf("http") == 0) {
			BDFDB.LibraryRequires.request(url, (error, response, result) => {
				if (response) {
					let type = response.headers["content-type"];
					if (type && type.indexOf("image") > -1) {
						successFetchIcon();
						return;
					}
				}
				BDFDB.showToast("Use a valid direct link to an image source. They usually end on something like .png, .jpg or .gif.", {type:"danger"});
			});
		}
		else {
			if (BDFDB.LibraryRequires.fs.existsSync(url)) {
				BDFDB.LibraryRequires.fs.readFile(url, (error, response) => {
					if (!error) {
						url = `data:image/png;base64,${response.toString("base64")}`;
						successFetchIcon();
					}
				});
			}
			else {
				BDFDB.showToast("Could not fetch file. Please make sure the file exists.", {type:"danger"});
			}
		}

		successFetchIcon = () => {
			let iconpreview = modal.querySelector(".ui-icon-picker-icon.preview." + type);
			let iconpreviewinner = iconpreview.querySelector(".ui-picker-inner");
			BDFDB.removeClass(iconpreview, "nopic");
			iconpreview.url = url;
			iconpreviewinner.style.setProperty("background-image", `url(${url})`);

			let iconpreviewopen = modal.querySelector(".ui-icon-picker-icon.preview.open");
			let iconpreviewclosed = modal.querySelector(".ui-icon-picker-icon.preview.closed");
			if (!BDFDB.containsClass(iconpreviewopen, "nopic") && !BDFDB.containsClass(iconpreviewclosed, "nopic")) {
				let iconpreviewswitching = modal.querySelector(".ui-icon-picker-icon.preview.switching");

				let iconpreviewopenimage = iconpreviewopen.querySelector(".ui-picker-inner").style.getPropertyValue("background-image");
				let iconpreviewclosedimage = iconpreviewclosed.querySelector(".ui-picker-inner").style.getPropertyValue("background-image");
				let iconpreviewswitchinginner = iconpreviewswitching.querySelector(".ui-picker-inner");

				BDFDB.removeClass(iconpreviewswitching, "nopic");
				iconpreviewswitchinginner.style.setProperty("background-image", iconpreviewopenimage);
				let switching = true;
				iconpreviewswitching.switchInterval = setInterval(() => {
					switching = !switching;
					iconpreviewswitchinginner.style.setProperty("background-image", switching ? iconpreviewopenimage : iconpreviewclosedimage);
				},1000);
			}
		};
	}

	saveCustomIcon (modal) {
		let iconpreviewopen = modal.querySelector(".ui-icon-picker-icon.preview.open");
		let iconpreviewclosed = modal.querySelector(".ui-icon-picker-icon.preview.closed");
		let iconpreviewswitching = modal.querySelector(".ui-icon-picker-icon.preview.switching");
		if (!BDFDB.containsClass(iconpreviewopen, "nopic") && !BDFDB.containsClass(iconpreviewclosed, "nopic") && !BDFDB.containsClass(iconpreviewswitching, "nopic")) {
			let customID = this.generateID("customicon");
			BDFDB.saveData(customID, {"openicon":iconpreviewopen.url,"closedicon":iconpreviewclosed.url,customID}, this, "customicons");
			modal.querySelectorAll("input[type='text'][option]").forEach((input) => {input.value = "";});

			let iconpreviewopeninner = iconpreviewopen.querySelector(".ui-picker-inner");
			let iconpreviewclosedinner = iconpreviewclosed.querySelector(".ui-picker-inner");
			let iconpreviewswitchinginner = iconpreviewswitching.querySelector(".ui-picker-inner");

			BDFDB.addClass(iconpreviewopen, "nopic");
			iconpreviewopeninner.style.removeProperty("background-image");
			BDFDB.addClass(iconpreviewclosed, "nopic");
			iconpreviewclosedinner.style.removeProperty("background-image");
			BDFDB.addClass(iconpreviewswitching, "nopic");
			iconpreviewswitchinginner.style.removeProperty("background-image");
			clearInterval(iconpreviewswitching.switchInterval);
			BDFDB.showToast(`Custom Icon was added to selection.`, {type:"success"});
			this.setIcons(modal, modal.querySelector(".ui-icon-picker-icon.selected").getAttribute("value"));
		}
		else {
			BDFDB.showToast(`Add an image for the open and the closed icon.`, {type:"danger"});
		}
	}

	resetAllElements () {
		this.toggleFolderContent(false);
		BDFDB.removeEles(BDFDB.dotCN.guildouter + ".folder", ".serverfolders-dragpreview");
		BDFDB.readServerList().forEach(info => {this.unhideServer(info.div);});
	}

	createNewFolder (ankerdiv) {
		if (!Node.prototype.isPrototypeOf(ankerdiv)) return;
		let guilddiv = BDFDB.getParentEle(BDFDB.dotCN.guildouter, ankerdiv);
		if (!guilddiv) return;

		this.showFolderSettings(this.createFolderDiv({
			folderID: 			this.generateID("folder"),
			folderName: 		"",
			position: 			this.getAllServersAndFolders().indexOf(guilddiv),
			iconID: 			0,
			icons: 				{openicon: this.createBase64SVG(this.folderIcons[0].openicon), closedicon: this.createBase64SVG(this.folderIcons[0].closedicon)},
			autounread: 		false,
			copyTooltipColor: 	false,
			isOpen: 			false,
			color1: 			["0","0","0"],
			color2: 			["255","255","255"],
			color3: 			null,
			color4: 			null,
			servers: 			[]
		}));

		this.updateFolderPositions();
	}

	createFolderDiv (data) {
		let folderdiv = BDFDB.htmlToElement(this.folderIconMarkup);
		let folderdivinner = folderdiv.querySelector(BDFDB.dotCN.guildcontainer);
		let foldericonwrapper = folderdiv.querySelector(BDFDB.dotCN.guildiconwrapper);
		this.insertFolderDiv(data, folderdiv);

		folderdiv.id = data.folderID;
		folderdiv.setAttribute("foldername", data.folderName);
		foldericonwrapper.setAttribute("aria-label", data.folderName);
		BDFDB.addClass(folderdiv, "closed");
		folderdiv.querySelector("mask").setAttribute("id", "SERVERFOLDERS" + data.folderID);
		folderdiv.querySelector("foreignObject").setAttribute("mask", "url(#SERVERFOLDERS" + data.folderID + ")");
		folderdiv.querySelector(BDFDB.dotCN.guildicon).setAttribute("src", `${data.icons.closedicon}`);
		folderdiv.addEventListener("click", () => {
			if (BDFDB.getData("closeOtherFolders", this, "settings")) {
				document.querySelectorAll(BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter + ".folder.open").forEach(folder => {
					if (folder != folderdiv) this.openCloseFolder(folder);
				});
			}
			this.openCloseFolder(folderdiv);
		});
		folderdivinner.addEventListener("mouseenter", () => {
			let newdata = BDFDB.loadData(folderdiv.id, this, "folders");
			if (!newdata || !newdata.folderName) return;
			var isgradient3 = newdata.color3 && BDFDB.isObject(newdata.color3);
			var isgradient4 = newdata.color4 && BDFDB.isObject(newdata.color4);
			var bgColor = newdata.color3 ? (!isgradient3 ? BDFDB.colorCONVERT(newdata.color3, "RGB") : BDFDB.colorGRADIENT(newdata.color3)) : "";
			var fontColor = newdata.color4 ? (!isgradient4 ? BDFDB.colorCONVERT(newdata.color4, "RGB") : BDFDB.colorGRADIENT(newdata.color4)) : "";
			BDFDB.createTooltip(isgradient4 ? `<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${fontColor} !important;">${BDFDB.encodeToHTML(newdata.folderName)}</span>` : newdata.folderName, folderdivinner, {type:"right", selector:"guild-folder-tooltip", style:`${isgradient4 ? '' : 'color: ' + fontColor + ' !important; '}background: ${bgColor} !important; border-color: ${isgradient3 ? BDFDB.colorCONVERT(data.color3[0], "RGB") : bgColor} !important;`, html:isgradient3});
		});
		folderdiv.addEventListener("contextmenu", e => {
			let newdata = BDFDB.loadData(folderdiv.id, this, "folders");
			if (!newdata) return;
			let unreadServers = BDFDB.readUnreadServerList(this.readIncludedServerList(folderdiv));
			const itemGroup = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
				children: [
					BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
						label: this.labels.foldercontext_unreadfolder_text,
						className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-unreadfolder-contextMenuItem`,
						disabled: !unreadServers.length,
						action: e => {
							BDFDB.closeContextMenu(BDFDB.getParentEle(BDFDB.dotCN.contextmenu, e.target));
							BDFDB.markGuildAsRead(unreadServers);
						}
					}),
					BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuToggleItem, {
						label: this.labels.foldercontext_autounreadfolder_text,
						className: `BDFDB-contextMenuToggleItem ${this.name}-contextMenuToggleItem ${this.name}-autounreadfolder-contextMenuToggleItem`,
						active: newdata.autounread,
						action: state => {
							newdata.autounread = state;
							BDFDB.saveData(newdata.folderID, newdata, this, "folders");
						}
					}),
					BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
						label: this.labels.foldercontext_foldersettings_text,
						className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-foldersettings-contextMenuItem`,
						action: e => {
							BDFDB.closeContextMenu(BDFDB.getParentEle(BDFDB.dotCN.contextmenu, e.target));
							this.showFolderSettings(folderdiv);
						}
					}),
					BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
						label: this.labels.serversubmenu_createfolder_text,
						className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-createfolder-contextMenuItem`,
						action: e => {
							BDFDB.closeContextMenu(BDFDB.getParentEle(BDFDB.dotCN.contextmenu, e.target));
							this.createNewFolder(folderdiv);
						}
					}),
					BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
						label: this.labels.foldercontext_removefolder_text,
						className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-removefolder-contextMenuItem`,
						danger: true,
						action: e => {
							BDFDB.closeContextMenu(BDFDB.getParentEle(BDFDB.dotCN.contextmenu, e.target));
							this.removeFolder(folderdiv);
						}
					})
				]
			});
			BDFDB.openContextMenu(this, e, itemGroup);
		});
		folderdiv.addEventListener("mousedown", e => {
			let x = e.pageX, y = e.pageY;
			let mousemove = e2 => {
				if (Math.sqrt((x - e2.pageX)**2) > 20 || Math.sqrt((y - e2.pageY)**2) > 20) {
					document.removeEventListener("mousemove", mousemove);
					document.removeEventListener("mouseup", mouseup);
					let guildswrap = document.querySelector(`${BDFDB.dotCN.guildswrapper}:not(.foldercontent) ${BDFDB.dotCN.guildsscroller}`);
					if (!guildswrap) return;
					let hovele = null;
					let placeholder = BDFDB.htmlToElement(this.dragPlaceholderMarkup);
					let dragpreview = this.createDragPreview(folderdiv, e);
					let dragging = e3 => {
						BDFDB.removeEles(placeholder);
						BDFDB.toggleEles(folderdiv, false);
						this.updateDragPreview(dragpreview, e3);
						hovele = BDFDB.getParentEle(BDFDB.dotCN.guildouter + ".folder", e3.target);
						if (hovele) {
							if (hovele.parentElement == guildswrap) guildswrap.insertBefore(placeholder, hovele.nextSibling);
						}
						else {
							hovele = BDFDB.getParentEle(BDFDB.dotCN.guildouter, e3.target);
							if (hovele && BDFDB.getReactValue(hovele, "return.memoizedProps.guild") && guildswrap.contains(hovele)) {
								if (hovele.parentElement == guildswrap) guildswrap.insertBefore(placeholder, hovele.nextSibling);
							}
						}
					};
					let releasing = e3 => {
						document.removeEventListener("mousemove", dragging);
						document.removeEventListener("mouseup", releasing);
						BDFDB.removeEles(placeholder, dragpreview);
						BDFDB.toggleEles(folderdiv, true);
						if (hovele) {
							guildswrap.insertBefore(folderdiv, hovele.nextSibling);
							this.updateFolderPositions(folderdiv);
						}
					};
					document.addEventListener("mousemove", dragging);
					document.addEventListener("mouseup", releasing);
				}
			};
			let mouseup = () => {
				document.removeEventListener("mousemove", mousemove);
				document.removeEventListener("mouseup", mouseup);
			};
			document.addEventListener("mousemove", mousemove);
			document.addEventListener("mouseup", mouseup);
		});

		this.addHoverBehaviour(folderdiv);

		BDFDB.saveData(data.folderID, data, this, "folders");

		this.updateFolderNotifications(folderdiv);

		if (data.isOpen) folderdiv.click();

		return folderdiv;
	}

	insertFolderDiv (data, folderdiv) {
		folderdiv.remove();
		let serversandfolders = this.getAllServersAndFolders();
		let insertnode = serversandfolders[data.position == -1 || data.position > serversandfolders.length - 1 ? serversandfolders.length - 1 : data.position];
		if (insertnode) insertnode.parentElement.insertBefore(folderdiv, insertnode);
		else {
			insertnode = BDFDB.getParentEle(BDFDB.dotCN.guildouter, document.querySelector(BDFDB.dotCNS.guildsscroller + BDFDB.dotCN.guildbuttoncontainer));
			if (insertnode) insertnode.parentElement.parentElement.insertBefore(folderdiv, insertnode.parentElement);
		}
	}

	generateID (prefix) {
		let data = BDFDB.loadAllData(this, prefix + "s");
		let id = prefix + "_" + Math.round(Math.random()*10000000000000000);
		return data[id] ? this.generateID(prefix) : id;
	}

	addServerToFolder (info, folderdiv) {
		if (!info || !folderdiv) return;
		let guilddiv = BDFDB.getServerDiv(info);
		let data = BDFDB.loadData(folderdiv.id, this, "folders");
		if (!guilddiv || !data || data.servers.includes(info.id)) return;
		data.servers.push(info.id);
		BDFDB.saveData(folderdiv.id, data, this, "folders");
		this.hideServer(guilddiv, folderdiv);
		this.updateCopyInFolderContent(guilddiv, folderdiv);
		this.updateFolderNotifications(folderdiv);
		BDFDB.showToast(this.labels.toast_addserver_text.replace("${servername}", info.name).replace("${foldername}", data.folderName ? " " + data.folderName : ""), {type:"success"});
	}

	removeServerFromFolder (info, folderdiv) {
		if (!info || !folderdiv || !this.foldercontent) return;
		let data = BDFDB.loadData(folderdiv.id, this, "folders");
		if (!data) return;
		BDFDB.removeFromArray(data.servers, info.id);
		BDFDB.saveData(folderdiv.id, data, this, "folders");
		BDFDB.removeEles(this.foldercontent.querySelectorAll(`${BDFDB.dotCN.guildouter}.copy[guild="${info.id}"]`));
		if (!this.foldercontent.querySelector(`${BDFDB.dotCN.guildouter}.copy[folder="${folderdiv.id}"]`)) BDFDB.removeEles(this.foldercontent.querySelectorAll(`${BDFDB.dotCN.guildouter}.folderseparatorouter[folder="${folderdiv.id}"]`));
		this.unhideServer(BDFDB.getServerDiv(info));
		this.updateFolderNotifications(folderdiv);
		BDFDB.showToast(this.labels.toast_removeserver_text.replace("${servername}", info.name).replace("${foldername}", data.folderName ? " " + data.folderName : ""), {type:"danger"});
	}

	removeFolder (folderdiv) {
		if (!folderdiv || !this.foldercontent) return;
		this.readIncludedServerList(folderdiv).forEach(guilddiv => {this.unhideServer(guilddiv);});
		BDFDB.removeData(folderdiv.id, this, "folders");
		this.closeFolderContent(folderdiv);
		folderdiv.remove();
		this.updateFolderPositions();
	}

	getAllServersAndFolders () {
		let separator = document.querySelector(`${BDFDB.dotCN.guildseparator}:not(.folderseparator)`).parentElement;
		let nextsibling = separator.nextElementSibling, serversandfolders = [];
		while (nextsibling) {
			if (nextsibling.querySelector(BDFDB.dotCN.guildcontainer)) serversandfolders.push(nextsibling);
			nextsibling = nextsibling.nextElementSibling
		}
		return serversandfolders
	}

	getFolderOfServer (idOrInfoOrEle) {
		if (!idOrInfoOrEle || !this.foldercontent) return;
		let id = Node.prototype.isPrototypeOf(idOrInfoOrEle) ? BDFDB.getServerID(idOrInfoOrEle) : (typeof idOrInfoOrEle == "object" ? idOrInfoOrEle.id : idOrInfoOrEle);
		if (!id) return;
		let folders = BDFDB.loadAllData(this, "folders");
		for (let folderid in folders) for (let serverid of folders[folderid].servers) if (serverid == id) return document.querySelector(".folder#" + folderid);
		return null;
	}

	hideServer (guilddiv, folderdiv) {
		if (!Node.prototype.isPrototypeOf(guilddiv) || !folderdiv) return;
		guilddiv.setAttribute("folder", folderdiv.id);
		BDFDB.toggleEles(guilddiv, false);
	}

	unhideServer (guilddiv) {
		if (!Node.prototype.isPrototypeOf(guilddiv)) return;
		guilddiv.removeAttribute("folder");
		BDFDB.toggleEles(guilddiv, true);
	}

	toggleFolderContent (forceOpenClose) {
		if (!this.foldercontent) return;
		forceOpenClose = forceOpenClose === undefined ? BDFDB.containsClass(this.foldercontent, "foldercontentclosed") : forceOpenClose;
		BDFDB.toggleClass(this.foldercontent, "foldercontentopen", forceOpenClose);
		BDFDB.toggleClass(this.foldercontent, "foldercontentclosed", !forceOpenClose);
		BDFDB.toggleClass(document.body, "foldercontentopened", forceOpenClose);
	}

	openCloseFolder (folderdiv) {
		if (!folderdiv || !this.foldercontent) return;
		let data = BDFDB.loadData(folderdiv.id, this, "folders");
		if (!data) return;
		let isClosed = !BDFDB.containsClass(folderdiv, "open");
		if (isClosed) {
			let includedServers = this.readIncludedServerList(folderdiv);
			if (includedServers.length == 0) return;
			BDFDB.addClass(folderdiv, "open");
			BDFDB.removeClass(folderdiv, "closed");

			this.toggleFolderContent(true);

			let settings = BDFDB.getAllData(this, "settings");

			let open = () => {
				if (this.foldercontent) {
					if (settings.addSeparators && this.foldercontent.querySelectorAll(BDFDB.dotCN.guildcontainer).length) this.foldercontentguilds.appendChild(BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.guildouter + BDFDB.disCN._bdguildseparator} folderseparatorouter" folder="${folderdiv.id}"><div class="${BDFDB.disCN.guildseparator} folderseparator"></div></div>`));
					includedServers.forEach(guilddiv => {this.updateCopyInFolderContent(guilddiv, folderdiv);});
				}
			}

			if (settings.closeOtherFolders && this.foldercontent.querySelectorAll(BDFDB.dotCN.guildcontainer).length) setTimeout(open, 300);
			else open();
		}
		else this.closeFolderContent(folderdiv);

		folderdiv.querySelector(BDFDB.dotCN.guildicon).setAttribute("src", `${isClosed ? data.icons.openicon : data.icons.closedicon}`);

		data.isOpen = isClosed;
		BDFDB.saveData(folderdiv.id, data, this, "folders");
	}

	closeFolderContent (folderdiv) {
		if (!folderdiv || !this.foldercontent) return;
		BDFDB.removeClass(folderdiv, "open");
		BDFDB.addClass(folderdiv, "closed");
		let includedCopies = this.foldercontent.querySelectorAll(`[folder="${folderdiv.id}"]`);
		for (let copy of includedCopies) copy.removeAttribute("folder");
		if (!this.foldercontent.querySelector("[folder]")) {
			this.toggleFolderContent(false);
			setTimeout(() => {
				let settings = BDFDB.getAllData(this, "settings");
				if (settings.closeOtherFolders) BDFDB.removeEles(includedCopies);
				else if (!settings.closeOtherFolders && !document.querySelector(BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter + ".folder.open")) BDFDB.removeEles(includedCopies);
			}, 300);
		}
		else BDFDB.removeEles(includedCopies);

		let firstchild = this.foldercontentguilds.firstElementChild;
		if (BDFDB.containsClass(firstchild, "folderseparatorouter")) BDFDB.removeEles(firstchild);
	}

	updateCopyInFolderContent (guilddiv, folderdiv) {
		if (!guilddiv || !folderdiv || !this.foldercontent) return;
		if (BDFDB.containsClass(folderdiv, "open")) {
			let info = BDFDB.LibraryModules.GuildStore.getGuild(BDFDB.getServerID(guilddiv));
			if (!info) return;
			let oldCopy = this.foldercontent.querySelector(`[guild="${info.id}"]`);
			if (oldCopy) {
				this.foldercontentguilds.insertBefore(this.createCopyOfServer(guilddiv, folderdiv), oldCopy);
				BDFDB.removeEles(oldCopy);
			}
			else {
				let sameFolderCopies = this.foldercontent.querySelectorAll(`[folder="${folderdiv.id}"]`);
				let insertNode = sameFolderCopies.length > 0 ? sameFolderCopies[sameFolderCopies.length-1].nextSibling : null;
				this.foldercontentguilds.insertBefore(this.createCopyOfServer(guilddiv, folderdiv), insertNode);
			}
		}
	}

	createCopyOfServer (guilddiv, folderdiv) {
		if (!guilddiv || !folderdiv || !this.foldercontent) return;
		let info = BDFDB.LibraryModules.GuildStore.getGuild(BDFDB.getServerID(guilddiv));
		if (!info) return;
		let props = BDFDB.getReactValue(guilddiv, "return.stateNode.props");
		let guildcopy = guilddiv.cloneNode(true);
		let guildcopyinner = guildcopy.querySelector(BDFDB.dotCN.guildcontainer);
		let guildiconwrapper = guildcopy.querySelector(BDFDB.dotCN.guildiconwrapper);
		let guildicon = guildcopy.querySelector(BDFDB.dotCN.guildicon);
		let guildpillitem = guildcopy.querySelector(BDFDB.dotCN.guildpillitem);
		guildcopy.setAttribute("guild", info.id);
		guildcopy.setAttribute("folder", folderdiv.id);
		guildiconwrapper.style.setProperty("border-radius", props.selected ? "30%" : "50%");
		guildiconwrapper.style.setProperty("overflow", "hidden");
		guildpillitem.style.setProperty("opacity", props.selected ? 1 : (props.unread ? 0.7 : 0));
		guildpillitem.style.setProperty("height", props.selected ? "40px" : "8px");
		guildpillitem.style.setProperty("transform", "translate3d(0px, 0px, 0px)");
		guildcopy.querySelector("mask").setAttribute("id", "SERVERFOLDERSCOPY" + info.id);
		guildcopy.querySelector("mask path").setAttribute("d", "M0 0 l50 0l0 50l-50 0l0 -50Z");
		guildcopy.querySelector("foreignObject").setAttribute("mask", "url(#SERVERFOLDERSCOPY" + info.id + ")");
		BDFDB.addClass(guildcopy, "copy");
		BDFDB.toggleEles(guildcopy, true);
		guildcopyinner.addEventListener("mouseenter", () => {
			let ESdata = BDFDB.isPluginEnabled("EditServers") ? window.bdplugins.EditServers.plugin.getGuildData(info.id, guildcopyinner) : null;
			if (ESdata && (ESdata.name || ESdata.color3 || ESdata.color4)) window.bdplugins.EditServers.plugin.changeTooltip(info, guildcopyinner, "right");
			else {
				let folderData = BDFDB.loadData(folderdiv.id, this, "folders") || {};
				let color3 = folderData.copyTooltipColor ? folderData.color3 : null;
				let color4 = folderData.copyTooltipColor ? folderData.color4 : null;
				let isgradient3 = color3 && BDFDB.isObject(color3);
				let isgradient4 = color4 && BDFDB.isObject(color4);
				let bgColor = color3 ? (!isgradient3 ? BDFDB.colorCONVERT(color3, "RGB") : BDFDB.colorGRADIENT(color3)) : "";
				let fontColor = color4 ? (!isgradient4 ? BDFDB.colorCONVERT(color4, "RGB") : BDFDB.colorGRADIENT(color4)) : "";
				BDFDB.createTooltip(isgradient4 ? `<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${fontColor} !important;">${BDFDB.encodeToHTML(info.name)}</span>` : info.name, guildcopyinner, {type:"right", selector:"guild-folder-tooltip", style:`${isgradient4 ? '' : 'color: ' + fontColor + ' !important; '}background: ${bgColor} !important; border-color: ${isgradient3 ? BDFDB.colorCONVERT(color3[0], "RGB") : bgColor} !important;`, html:isgradient3});
			}
			if (guildicon && guildicon.src && info.icon && info.icon.startsWith("a_") && info.features.has("ANIMATED_ICON") && guildicon.src.includes("discordapp.com/icons/")) {
				guildicon.src = guildicon.src.replace(".webp", ".gif");
			}
		});
		guildcopyinner.addEventListener("mouseleave", () => {
			if (guildicon && guildicon.src && info.icon && info.icon.startsWith("a_") && info.features.has("ANIMATED_ICON") && guildicon.src.includes("discordapp.com/icons/") && !this.isAutoPlayGif()) {
				guildicon.src = guildicon.src.replace(".gif", ".webp");
			}
		});
		guildcopy.addEventListener("click", e => {
			BDFDB.stopEvent(e);
			if (BDFDB.pressedKeys.includes(46)) this.removeServerFromFolder(info, folderdiv);
			else {
				let settings = BDFDB.getAllData(this, "settings");
				if (!settings.closeAllFolders && settings.closeTheFolder) this.openCloseFolder(folderdiv);
				guilddiv.querySelector("a").click();
			}
		});
		guildcopy.addEventListener("contextmenu", e => {
			BDFDB.openGuildContextMenu(guilddiv, e);
		});
		guildcopy.addEventListener("mousedown", e => {
			let x = e.pageX, y = e.pageY;
			let mousemove = e2 => {
				if (Math.sqrt((x - e2.pageX)**2) > 20 || Math.sqrt((y - e2.pageY)**2) > 20) {
					document.removeEventListener("mousemove", mousemove);
					document.removeEventListener("mouseup", mouseup);
					let hovcopy = null;
					let placeholder = BDFDB.htmlToElement(this.dragPlaceholderMarkup);
					let dragpreview = this.createDragPreview(guilddiv, e);

					let dragging = e3 => {
						BDFDB.removeEles(placeholder);
						BDFDB.toggleEles(guildcopy, false);
						this.updateDragPreview(dragpreview, e3);
						if (this.foldercontent.contains(e3.target)) {
							hovcopy = BDFDB.getParentEle(BDFDB.dotCN.guildouter, e3.target);
							if (hovcopy && hovcopy.getAttribute("folder") == folderdiv.id) this.foldercontentguilds.insertBefore(placeholder, hovcopy.nextSibling);
							else hovcopy = null;
						}
					};
					let releasing = e3 => {
						document.removeEventListener("mousemove", dragging);
						document.removeEventListener("mouseup", releasing);
						BDFDB.removeEles(placeholder, dragpreview);
						BDFDB.toggleEles(guildcopy, true);
						let dropfolderdiv = BDFDB.getParentEle(BDFDB.dotCN.guildouter + ".folder", e3.target);
						if (dropfolderdiv && dropfolderdiv != folderdiv) {
							this.removeServerFromFolder(info, folderdiv);
							this.addServerToFolder(info, dropfolderdiv);
						}
						else if (hovcopy) {
							this.foldercontentguilds.insertBefore(guildcopy, hovcopy.nextSibling);
							this.updateServerPositions(folderdiv);
						}
					};
					document.addEventListener("mousemove", dragging);
					document.addEventListener("mouseup", releasing);
				}
			};
			let mouseup = () => {
				document.removeEventListener("mousemove", mousemove);
				document.removeEventListener("mouseup", mouseup);
			};
			document.addEventListener("mousemove", mousemove);
			document.addEventListener("mouseup", mouseup);
		});

		guildcopy.querySelector("a").setAttribute("draggable", false);

		this.addHoverBehaviour(guildcopy);

		return guildcopy;
	}

	isAutoPlayGif () {
		return BDFDB.isPluginEnabled("AutoPlayGifs") && window.bdplugins && window.bdplugins.AutoPlayGifs && window.bdplugins.AutoPlayGifs.plugin && window.bdplugins.AutoPlayGifs.plugin.settings && window.bdplugins.AutoPlayGifs.plugin.settings.guildList;
	}

	createDragPreview (div, e) {
		if (!Node.prototype.isPrototypeOf(div)) return;
		let dragpreview = div.cloneNode(true);
		BDFDB.addClass(dragpreview, "serverfolders-dragpreview");
		BDFDB.toggleEles(dragpreview, false);
		dragpreview.style.setProperty("pointer-events", "none", "important");
		dragpreview.style.setProperty("left", e.clientX - 25 + "px", "important");
		dragpreview.style.setProperty("top", e.clientY - 25 + "px", "important");
		document.querySelector(BDFDB.dotCN.appmount).appendChild(dragpreview);
		return dragpreview;
	}

	updateDragPreview (dragpreview, e) {
		if (!Node.prototype.isPrototypeOf(dragpreview)) return;
		BDFDB.toggleEles(dragpreview, true);
		dragpreview.style.setProperty("left", e.clientX - 25 + "px", "important");
		dragpreview.style.setProperty("top", e.clientY - 25 + "px", "important");
	}

	updateFolderPositions () {
		if (!this.foldercontent) return;
		let serverAndFolders = this.getAllServersAndFolders();
		for (let i = 0; i < serverAndFolders.length; i++) {
			let folderdiv = BDFDB.getParentEle(BDFDB.dotCN.guildouter + ".folder", serverAndFolders[i]);
			if (folderdiv) {
				let data = BDFDB.loadData(folderdiv.id, this, "folders");
				if (data) {
					data.position = i;
					BDFDB.saveData(folderdiv.id, data, this, "folders");
				}
			} 
		}
	}

	updateServerPositions (folderdiv) {
		if (!this.foldercontent) return;
		let data = BDFDB.loadData(folderdiv.id, this, "folders");
		if (data) {
			let servers = Array.from(this.foldercontent.querySelectorAll(`${BDFDB.dotCN.guildouter}.copy[folder="${folderdiv.id}"]`)).map(div => {return div.getAttribute("guild");});
			for (let serverid of servers) BDFDB.removeFromArray(data.servers, serverid);
			data.servers = BDFDB.removeCopiesFromArray(servers.concat(data.servers));
			BDFDB.saveData(folderdiv.id, data, this, "folders");
		}
	}

	updateFolderNotifications (folderdiv) {
		if (!this.foldercontent) return;
		let data = BDFDB.loadData(folderdiv.id, this, "folders");
		if (!data) return;
		let includedServers = this.readIncludedServerList(folderdiv);
		let unreadServers = BDFDB.readUnreadServerList(includedServers);
		if (unreadServers.length > 0 && data.autounread) BDFDB.markGuildAsRead(unreadServers);
		else {
			let folderpill = folderdiv.querySelector(BDFDB.dotCN.guildpill);
			let folderpillitem = folderdiv.querySelector(BDFDB.dotCN.guildpillitem);
			let folderdivbadges = folderdiv.querySelector(BDFDB.dotCN.guildbadgewrapper);
			let masks = folderdiv.querySelectorAll("mask rect");

			let mentions = 0, unread = false, selected = false, audioenabled = false, videoenabled = false;

			includedServers.forEach(div => {
				let props = BDFDB.getReactValue(div, "return.stateNode.props");
				if (props) {
					mentions += parseInt(props.badge);
					if (props.selected) selected = true;
					if (props.unread) unread = true;
					if (props.audio) audioenabled = true;
					if (props.video) videoenabled = true;
				}
			});

			BDFDB.toggleClass(folderdiv, BDFDB.disCN._bdguildunread, unread);
			BDFDB.toggleClass(folderdiv, BDFDB.disCN._bdguildaudio, audioenabled);
			BDFDB.toggleClass(folderdiv, BDFDB.disCN._bdguildvideo, videoenabled);

			BDFDB.toggleClass(folderpill, BDFDB.disCN._bdpillunread, unread);
			folderpillitem.style.setProperty("opacity", unread ? 0.7 : 0);

			let showcount = BDFDB.getData("showCountBadge", this, "settings");
			let notificationbadge = folderdiv.querySelector(BDFDB.dotCN.guildlowerbadge + ".notifications");
			let countbadge = folderdiv.querySelector(BDFDB.dotCN.guildupperbadge + ".count");
			countbadge.firstElementChild.innerText = includedServers.length;
			countbadge.firstElementChild.style.setProperty("width", `${includedServers.length > 99 ? 30 : (includedServers.length > 9 ? 22 : 16)}px`);
			countbadge.firstElementChild.style.setProperty("padding-right", `${includedServers.length > 99 ? 0 : (includedServers.length > 9 ? 0 : 1)}px`);
			BDFDB.toggleEles(countbadge, showcount);
			notificationbadge.firstElementChild.innerText = mentions;
			notificationbadge.firstElementChild.style.setProperty("width", `${mentions > 99 ? 30 : (mentions > 9 ? 22 : 16)}px`);
			notificationbadge.firstElementChild.style.setProperty("padding-right", `${mentions > 99 ? 0 : (mentions > 9 ? 0 : 1)}px`);
			BDFDB.toggleEles(notificationbadge, mentions > 0);

			masks[0].setAttribute("transform", audioenabled || videoenabled ? "translate(0 0)" : "translate(20 -20)");
			masks[1].setAttribute("transform", mentions > 0 ? "translate(0 0)" : "translate(20 20)");
			masks[1].setAttribute("x", `${mentions > 99 ? 14 : (mentions > 9 ? 22 : 28)}`);
			masks[1].setAttribute("width", `${mentions > 99 ? 38 : (mentions > 9 ? 30 : 24)}`);
			masks[2].setAttribute("transform", showcount ? "translate(0 0)" : "translate(-20 -20)");
			masks[2].setAttribute("x", -4);
			masks[2].setAttribute("width", `${includedServers.length > 99 ? 38 : (includedServers.length > 9 ? 30 : 24)}`);

			if (audioenabled) folderdivbadges.appendChild(BDFDB.htmlToElement(`<div class="${BDFDB.disCN.guildupperbadge} audio-badge" style="opacity: 1; transform: translate(0px, 0px);"><div class="${BDFDB.disCNS.guildbadgeiconbadge + BDFDB.disCN.guildbadgeiconbadge2}"><svg name="Nova_Speaker" class="${BDFDB.disCN.guildbadgeicon}" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM14 5.00195V7.00195C16.757 7.00195 19 9.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 8.14295 17.86 5.00195 14 5.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z"></path></svg></div></div>`));
			else BDFDB.removeEles(folderdivbadges.querySelectorAll(".audio-badge"));

			if (videoenabled) folderdivbadges.appendChild(BDFDB.htmlToElement(`<div class="${BDFDB.disCN.guildupperbadge} video-badge" style="opacity: 1; transform: translate(0px, 0px);"><div class="${BDFDB.disCNS.guildbadgeiconbadge + BDFDB.disCN.guildbadgeiconbadge2}"><svg name="Nova_Camera" class="${BDFDB.disCN.guildbadgeicon}" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M20.526 8.149C20.231 7.966 19.862 7.951 19.553 8.105L17 9.382V8C17 6.897 16.103 6 15 6H6C4.897 6 4 6.897 4 8V16C4 17.104 4.897 18 6 18H15C16.103 18 17 17.104 17 16V14.618L19.553 15.894C19.694 15.965 19.847 16 20 16C20.183 16 20.365 15.949 20.526 15.851C20.82 15.668 21 15.347 21 15V9C21 8.653 20.82 8.332 20.526 8.149Z"></path></svg></div></div>`));
			else BDFDB.removeEles(folderdivbadges.querySelectorAll(".video-badge"));

			if (document.contains(folderdiv) && BDFDB.containsClass(folderdiv, "open") && !this.foldercontent.querySelector(`[folder="${folderdiv.id}"]`)) this.openCloseFolder(folderdiv);
		}
	}

	readIncludedServerList (folderdiv) {
		let data = BDFDB.loadData(folderdiv.id, this, "folders");
		let includedServers = [];
		if (data) for (let id of data.servers) {
			let div = BDFDB.getServerDiv(id);
			if (div && includedServers.indexOf(div) == -1) includedServers.push(div);
		}
		return includedServers;
	}

	addHoverBehaviour (div) {
		let divinner = div.querySelector(BDFDB.dotCN.guildcontainer);
		let diviconwrapper = div.querySelector(BDFDB.dotCN.guildiconwrapper);
		let divpillitem = div.querySelector(BDFDB.dotCN.guildpillitem);

		let pillvisible = divpillitem.style.getPropertyValue("opacity") != 0;

		let guild = div.getAttribute("guild");

		let borderRadius = new BDFDB.LibraryModules.AnimationUtils.Value(0);
		borderRadius
			.interpolate({
				inputRange: [0, 1],
				outputRange: [50, 30]
			})
			.addListener((value) => {
				diviconwrapper.style.setProperty("border-radius", `${value.value}%`);
			});

		let pillHeight = new BDFDB.LibraryModules.AnimationUtils.Value(0);
		pillHeight
			.interpolate({
				inputRange: [0, 1],
				outputRange: [8, 20]
			})
			.addListener((value) => {
				divpillitem.style.setProperty("height", `${value.value}px`);
			});

		let pillOpacity = new BDFDB.LibraryModules.AnimationUtils.Value(0);
		pillOpacity
			.interpolate({
				inputRange: [0, 1],
				outputRange: [0, 0.7]
			})
			.addListener((value) => {
				divpillitem.style.setProperty("opacity", `${value.value}`);
			});

		let animate = (v) => {
			BDFDB.LibraryModules.AnimationUtils.parallel([
				BDFDB.LibraryModules.AnimationUtils.timing(borderRadius, {toValue: v, duration: 200}),
				BDFDB.LibraryModules.AnimationUtils.spring(pillHeight, {toValue: v, friction: 5})
			]).start();
		};

		let animate2 = (v) => {
			BDFDB.LibraryModules.AnimationUtils.parallel([
				BDFDB.LibraryModules.AnimationUtils.timing(pillOpacity, {toValue: v, duration: 200}),
			]).start();
		};

		divinner.addEventListener("mouseenter", () => {
			pillvisible = divpillitem.style.getPropertyValue("opacity") != 0;
			if (!guild || (BDFDB.LibraryModules.LastGuildStore.getGuildId() != guild)) {
				animate(1);
				if (!pillvisible) animate2(1);
			}
		})
		divinner.addEventListener("mouseleave", () => {
			if (!guild || (BDFDB.LibraryModules.LastGuildStore.getGuildId() != guild)) {
				animate(0);
				if (!pillvisible) animate2(0);
			}
		});
	}

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					toast_addserver_text:					"${servername} je dodan u mapu${foldername}.",
					toast_removeserver_text:				"${servername} je uklonjena iz mape${foldername}.",
					servercontext_serverfolders_text:		"Poslužitelj mapu",
					serversubmenu_createfolder_text:		"Izradi mapu",
					serversubmenu_addtofolder_text:			"Dodaj poslužitelj u mapu",
					serversubmenu_removefromfolder_text:	"Ukloni poslužitelj iz mapu",
					foldercontext_unreadfolder_text:		"Označi sve kao pročitano",
					foldercontext_autounreadfolder_text:	"Auto: Označite kao pročitano",
					foldercontext_foldersettings_text:		"Postavke map",
					foldercontext_removefolder_text:		"Izbriši mapu",
					modal_header_text:						"Postavke mapa",
					modal_foldername_text:					"Naziv mape",
					modal_tabheader1_text:					"Mape",
					modal_tabheader2_text:					"Boja mape",
					modal_tabheader3_text:					"Boja tooltip",
					modal_tabheader4_text:					"Prilagođeni ikona",
					modal_iconpicker_text:					"Odabir mape",
					modal_copytooltipcolor_text:			"Koristite iste boje za poslužitelj u mapi",
					modal_colorpicker1_text:				"Boja primarne mape",
					modal_colorpicker2_text:				"Boja sekundarne mape",
					modal_colorpicker3_text:				"Boja tooltip",
					modal_colorpicker4_text:				"Boja fonta",
					modal_customopen_text:					"Otvori ikona",
					modal_customclosed_text:				"Zatvorena ikona",
					modal_custompreview_text:				"Pregled ikona"
				};
			case "da":		//danish
				return {
					toast_addserver_text:					"${servername} er blevet tilføjet til mappe${foldername}.",
					toast_removeserver_text:				"${servername} er blevet fjernet fra mappen${foldername}.",
					servercontext_serverfolders_text:		"Servermapper",
					serversubmenu_createfolder_text:		"Opret mappe",
					serversubmenu_addtofolder_text:			"Tilføj server til mappe",
					serversubmenu_removefromfolder_text:	"Fjern server fra mappe",
					foldercontext_unreadfolder_text:		"Markér alle som læst",
					foldercontext_autounreadfolder_text:	"Auto: Markér som læst",
					foldercontext_foldersettings_text:		"Mappeindstillinger",
					foldercontext_removefolder_text:		"Slet mappe",
					modal_header_text:						"Mappindstillinger",
					modal_foldername_text:					"Mappenavn",
					modal_tabheader1_text:					"Mappe",
					modal_tabheader2_text:					"Mappefarve",
					modal_tabheader3_text:					"Tooltipfarve",
					modal_tabheader4_text:					"Brugerdefinerede ikoner",
					modal_iconpicker_text:					"Mappevalg",
					modal_copytooltipcolor_text:			"Brug de samme farver til server på mappen",
					modal_colorpicker1_text:				"Primær mappefarve",
					modal_colorpicker2_text:				"Sekundær mappefarve",
					modal_colorpicker3_text:				"Tooltipfarve",
					modal_colorpicker4_text:				"Skriftfarve",
					modal_customopen_text:					"Åbn ikon",
					modal_customclosed_text:				"Lukket ikon",
					modal_custompreview_text:				"Ikon forhåndsvisning"
				};
			case "de":		//german
				return {
					toast_addserver_text:					"${servername} wurde dem Ordner${foldername} hinzugefügt.",
					toast_removeserver_text:				"${servername} wurde aus dem Ordner${foldername} entfernt.",
					servercontext_serverfolders_text:		"Serverordner",
					serversubmenu_createfolder_text:		"Ordner erzeugen",
					serversubmenu_addtofolder_text:			"Server zum Ordner hinzufügen",
					serversubmenu_removefromfolder_text:	"Server aus Ordner entfernen",
					foldercontext_unreadfolder_text:		"Alle als gelesen markieren",
					foldercontext_autounreadfolder_text:	"Auto: Als gelesen markieren",
					foldercontext_foldersettings_text:		"Ordnereinstellungen",
					foldercontext_removefolder_text:		"Ordner löschen",
					modal_header_text:						"Ordnereinstellungen",
					modal_foldername_text:					"Ordnername",
					modal_tabheader1_text:					"Ordner",
					modal_tabheader2_text:					"Ordnerfarbe",
					modal_tabheader3_text:					"Tooltipfarbe",
					modal_tabheader4_text:					"Eigene Icons",
					modal_iconpicker_text:					"Ordnerauswahl",
					modal_copytooltipcolor_text:			"Benutze dieselben Farben für alle Server des Ordners",
					modal_colorpicker1_text:				"Primäre Ordnerfarbe",
					modal_colorpicker2_text:				"Sekundäre Ordnerfarbe",
					modal_colorpicker3_text:				"Tooltipfarbe",
					modal_colorpicker4_text:				"Schriftfarbe",
					modal_customopen_text:					"Geöffnetes Icon",
					modal_customclosed_text:				"Geschlossenes Icon",
					modal_custompreview_text:				"Iconvorschau"
				};
			case "es":		//spanish
				return {
					toast_addserver_text:					"${servername} ha sido agregado a la carpeta${foldername}.",
					toast_removeserver_text:				"${servername} ha sido eliminado de la carpeta${foldername}.",
					servercontext_serverfolders_text:		"Carpetas de servidor",
					serversubmenu_createfolder_text:		"Crear carpeta",
					serversubmenu_addtofolder_text:			"Añadir servidor a la carpeta",
					serversubmenu_removefromfolder_text:	"Eliminar servidor de la carpeta",
					foldercontext_unreadfolder_text:		"Marcar todo como leido",
					foldercontext_autounreadfolder_text:	"Auto: Marcar como leído",
					foldercontext_foldersettings_text:		"Ajustes de carpeta",
					foldercontext_removefolder_text:		"Eliminar carpeta",
					modal_header_text:						"Ajustes de carpeta",
					modal_foldername_text:					"Nombre de la carpeta",
					modal_tabheader1_text:					"Carpeta",
					modal_tabheader2_text:					"Color de carpeta",
					modal_tabheader3_text:					"Color de tooltip",
					modal_tabheader4_text:					"Iconos personalizados",
					modal_iconpicker_text:					"Selección de carpeta",
					modal_copytooltipcolor_text:			"Usa los mismos colores para el servidor de la carpeta",
					modal_colorpicker1_text:				"Color primaria de carpeta",
					modal_colorpicker2_text:				"Color secundario de la carpeta",
					modal_colorpicker3_text:				"Color de tooltip",
					modal_colorpicker4_text:				"Color de fuente",
					modal_customopen_text:					"Ícono abierto",
					modal_customclosed_text:				"Icono cerrado",
					modal_custompreview_text:				"Vista previa del icono"
				};
			case "fr":		//french
				return {
					toast_addserver_text:					"${servername} a été ajouté au dossier${foldername}.",
					toast_removeserver_text:				"${servername} a été supprimé du dossier${foldername}.",
					servercontext_serverfolders_text:		"Dossiers du serveur",
					serversubmenu_createfolder_text:		"Créer le dossier",
					serversubmenu_addtofolder_text:			"Ajouter le serveur à un dossier",
					serversubmenu_removefromfolder_text:	"Supprimer le serveur du dossier",
					foldercontext_unreadfolder_text:		"Tout marquer comme lu",
					foldercontext_autounreadfolder_text:	"Auto: Marquer comme lu",
					foldercontext_foldersettings_text:		"Paramètres du dossier",
					foldercontext_removefolder_text:		"Supprimer le dossier",
					modal_header_text:						"Paramètres du dossier",
					modal_foldername_text:					"Nom de dossier",
					modal_tabheader1_text:					"Dossier",
					modal_tabheader2_text:					"Couleur du dossier",
					modal_tabheader3_text:					"Couleur de tooltip",
					modal_tabheader4_text:					"Icônes personnalisées",
					modal_iconpicker_text:					"Choix du dossier",
					modal_copytooltipcolor_text:			"Utilisez les mêmes couleurs pour le serveur du dossier",
					modal_colorpicker1_text:				"Couleur primaire du dossier",
					modal_colorpicker2_text:				"Couleur secondaire du dossier",
					modal_colorpicker3_text:				"Couleur de tooltip",
					modal_colorpicker4_text:				"Couleur de la police",
					modal_customopen_text:					"Icône ouverte",
					modal_customclosed_text:				"Icône fermée",
					modal_custompreview_text:				"Aperçu de l'icône"
				};
			case "it":		//italian
				return {
					toast_addserver_text:					"${servername} è stato aggiunto alla cartella${foldername}.",
					toast_removeserver_text:				"${servername} è stato rimosso dalla cartella${foldername}.",
					servercontext_serverfolders_text:		"Cartelle del server",
					serversubmenu_createfolder_text:		"Creare una cartella",
					serversubmenu_addtofolder_text:			"Aggiungi il server alla cartella",
					serversubmenu_removefromfolder_text:	"Rimuovi il server dalla cartella",
					foldercontext_unreadfolder_text:		"Segna tutti come letti",
					foldercontext_autounreadfolder_text:	"Auto: Contrassegna come letto",
					foldercontext_foldersettings_text:		"Impostazioni cartella",
					foldercontext_removefolder_text:		"Elimina cartella",
					modal_header_text:						"Impostazioni cartella",
					modal_foldername_text:					"Nome della cartella",
					modal_tabheader1_text:					"Cartella",
					modal_tabheader2_text:					"Colore della cartella",
					modal_tabheader3_text:					"Colore della tooltip",
					modal_tabheader4_text:					"Icone personalizzate",
					modal_iconpicker_text:					"Selezione della cartella",
					modal_copytooltipcolor_text:			"Usa gli stessi colori per il server della cartella",
					modal_colorpicker1_text:				"Colore primaria della cartella",
					modal_colorpicker2_text:				"Colore secondaria della cartella",
					modal_colorpicker3_text:				"Colore della tooltip",
					modal_colorpicker4_text:				"Colore del carattere",
					modal_customopen_text:					"Icona aperta",
					modal_customclosed_text:				"Icona chiusa",
					modal_custompreview_text:				"Icona anteprima"
				};
			case "nl":		//dutch
				return {
					toast_addserver_text:					"${servername} is toegevoegd aan de map${foldername}.",
					toast_removeserver_text:				"${servername} is verwijderd uit de map${foldername}.",
					servercontext_serverfolders_text:		"Servermappen",
					serversubmenu_createfolder_text:		"Map aanmaken",
					serversubmenu_addtofolder_text:			"Voeg server toe aan de map",
					serversubmenu_removefromfolder_text:	"Verwijder de server uit de map",
					foldercontext_unreadfolder_text:		"Alles als gelezen markeren",
					foldercontext_autounreadfolder_text:	"Auto: Markeren als gelezen",
					foldercontext_foldersettings_text:		"Mapinstellingen",
					foldercontext_removefolder_text:		"Verwijder map",
					modal_header_text:						"Mapinstellingen",
					modal_foldername_text:					"Mapnaam",
					modal_tabheader1_text:					"Map",
					modal_tabheader2_text:					"Mapkleur",
					modal_tabheader3_text:					"Tooltipkleur",
					modal_tabheader4_text:					"Aangepaste keuze",
					modal_iconpicker_text:					"Map keuze",
					modal_copytooltipcolor_text:			"Gebruik dezelfde kleuren voor de server van de map",
					modal_colorpicker1_text:				"Primaire mapkleur",
					modal_colorpicker2_text:				"Tweede mapkleur",
					modal_colorpicker3_text:				"Tooltipkleur",
					modal_colorpicker4_text:				"Doopvontkleur",
					modal_customopen_text:					"Geopende keuze",
					modal_customclosed_text:				"Gesloten keuze",
					modal_custompreview_text:				"Voorbeeld van keuze"
				};
			case "no":		//norwegian
				return {
					toast_addserver_text:					"${servername} er lagt til i mappe${foldername}.",
					toast_removeserver_text:				"${servername} er fjernet fra mappen${foldername}.",
					servercontext_serverfolders_text:		"Servermapper",
					serversubmenu_createfolder_text:		"Lag mappe",
					serversubmenu_addtofolder_text:			"Legg til server i mappe",
					serversubmenu_removefromfolder_text:	"Fjern server fra mappe",
					foldercontext_unreadfolder_text:		"Marker alle som lest",
					foldercontext_autounreadfolder_text:	"Auto: Merk som les",
					foldercontext_foldersettings_text:		"Mappinnstillinger",
					foldercontext_removefolder_text:		"Slett mappe",
					modal_header_text:						"Mappinnstillinger",
					modal_foldername_text:					"Mappenavn",
					modal_tabheader1_text:					"Mappe",
					modal_tabheader2_text:					"Mappefarge",
					modal_tabheader3_text:					"Tooltipfarge",
					modal_tabheader4_text:					"Tilpassede ikoner",
					modal_iconpicker_text:					"Mappevalg",
					modal_copytooltipcolor_text:			"Bruk de samme fargene til serveren til mappen",
					modal_colorpicker1_text:				"Primær mappefarge",
					modal_colorpicker2_text:				"Sekundær mappefarge",
					modal_colorpicker3_text:				"Tooltipfarge",
					modal_colorpicker4_text:				"Skriftfarge",
					modal_customopen_text:					"Åpnet ikon",
					modal_customclosed_text:				"Lukket ikon",
					modal_custompreview_text:				"Ikon forhåndsvisning"
				};
			case "pl":		//polish
				return {
					toast_addserver_text:					"${servername} został dodany do folderu${foldername}.",
					toast_removeserver_text:				"${servername} został usunięty z folderu${foldername}.",
					servercontext_serverfolders_text:		"Foldery serwera",
					serversubmenu_createfolder_text:		"Utwórz folder",
					serversubmenu_addtofolder_text:			"Dodaj serwer do folderu",
					serversubmenu_removefromfolder_text:	"Usuń serwer z folderu",
					foldercontext_unreadfolder_text:		"Oznacz wszystkie jako przeczytane",
					foldercontext_autounreadfolder_text:	"Auto: Oznacz jako przeczytane",
					foldercontext_foldersettings_text:		"Ustawienia folderu",
					foldercontext_removefolder_text:		"Usuń folder",
					modal_header_text:						"Ustawienia folderu",
					modal_foldername_text:					"Nazwa folderu",
					modal_tabheader1_text:					"Folder",
					modal_tabheader2_text:					"Kolor folderu",
					modal_tabheader3_text:					"Kolor podpowiedzi",
					modal_tabheader4_text:					"Niestandardowe ikony",
					modal_iconpicker_text:					"Wybór folderu",
					modal_copytooltipcolor_text:			"Użyj tych samych kolorów dla serwera folderu",
					modal_colorpicker1_text:				"Podstawowy kolor folderu",
					modal_colorpicker2_text:				"Drugorzędny kolor folderu",
					modal_colorpicker3_text:				"Kolor podpowiedzi",
					modal_colorpicker4_text:				"Kolor czcionki",
					modal_customopen_text:					"Otwarta ikona",
					modal_customclosed_text:				"Zamknięta ikona",
					modal_custompreview_text:				"Podgląd ikony"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					toast_addserver_text:					"${servername} foi adicionado à pasta${foldername}.",
					toast_removeserver_text:				"${servername} foi removido da pasta${foldername}.",
					servercontext_serverfolders_text:		"Pastas de servidores",
					serversubmenu_createfolder_text:		"Criar pasta",
					serversubmenu_addtofolder_text:			"Adicionar servidor à pasta",
					serversubmenu_removefromfolder_text:	"Remover servidor da pasta",
					foldercontext_unreadfolder_text:		"Marcar tudo como lido",
					foldercontext_autounreadfolder_text:	"Auto: Marcar como lido",
					foldercontext_foldersettings_text:		"Configurações da pasta",
					foldercontext_removefolder_text:		"Excluir pasta",
					modal_header_text:						"Configurações da pasta",
					modal_foldername_text:					"Nome da pasta",
					modal_tabheader1_text:					"Pasta",
					modal_tabheader2_text:					"Cor da pasta",
					modal_tabheader3_text:					"Cor da tooltip",
					modal_tabheader4_text:					"Ícones personalizados",
					modal_iconpicker_text:					"Escolha da pasta",
					modal_copytooltipcolor_text:			"Use as mesmas cores para o servidor da pasta",
					modal_colorpicker1_text:				"Cor primária da pasta",
					modal_colorpicker2_text:				"Cor secundária da pasta",
					modal_colorpicker3_text:				"Cor da tooltip",
					modal_colorpicker4_text:				"Cor da fonte",
					modal_customopen_text:					"Ícone aberto",
					modal_customclosed_text:				"Ícone fechado",
					modal_custompreview_text:				"Pré-visualização de ícones"
				};
			case "fi":		//finnish
				return {
					toast_addserver_text:					"${servername} on lisätty kansioon${foldername}.",
					toast_removeserver_text:				"${servername} on poistettu kansioon${foldername}.",
					servercontext_serverfolders_text:		"Palvelinkansiot",
					serversubmenu_createfolder_text:		"Luo kansio",
					serversubmenu_addtofolder_text:			"Lisää palvelin kansioon",
					serversubmenu_removefromfolder_text:	"Poista palvelin kansioon",
					foldercontext_unreadfolder_text:		"Merkitse kaikki luetuksi",
					foldercontext_autounreadfolder_text:	"Auto: merkitse luettavaksi",
					foldercontext_foldersettings_text:		"Kansion kansio",
					foldercontext_removefolder_text:		"Poista kansio",
					modal_header_text:						"Kansion kansio",
					modal_foldername_text:					"Kansion nimi",
					modal_tabheader1_text:					"Kansio",
					modal_tabheader2_text:					"Kansionväri",
					modal_tabheader3_text:					"Tooltipväri",
					modal_tabheader4_text:					"Mukautetut kuvakkeet",
					modal_iconpicker_text:					"Kansion valinta",
					modal_copytooltipcolor_text:			"Käytä samoja värejä kansion palvelimelle",
					modal_colorpicker1_text:				"Ensisijainen kansionväri",
					modal_colorpicker2_text:				"Toissijainen kansionväri",
					modal_colorpicker3_text:				"Tooltipväri",
					modal_colorpicker4_text:				"Fontinväri",
					modal_customopen_text:					"Avattu kuvake",
					modal_customclosed_text:				"Suljettu kuvake",
					modal_custompreview_text:				"Kuvakkeen esikatselu"
				};
			case "sv":		//swedish
				return {
					toast_addserver_text:					"${servername} har lagts till i mapp${foldername}.",
					toast_removeserver_text:				"${servername} har tagits bort från mappen${foldername}.",
					servercontext_serverfolders_text:		"Servermappar",
					serversubmenu_createfolder_text:		"Skapa mapp",
					serversubmenu_addtofolder_text:			"Lägg till server i mapp",
					serversubmenu_removefromfolder_text:	"Ta bort servern från mappen",
					foldercontext_unreadfolder_text:		"Markera allt som läst",
					foldercontext_autounreadfolder_text:	"Auto: Markera som Läs",
					foldercontext_foldersettings_text:		"Mappinställningar",
					foldercontext_removefolder_text:		"Ta bort mapp",
					modal_header_text:						"Mappinställningar",
					modal_foldername_text:					"Mappnamn",
					modal_tabheader1_text:					"Mapp",
					modal_tabheader2_text:					"Mappfärg",
					modal_tabheader3_text:					"Tooltipfärg",
					modal_tabheader4_text:					"Anpassade ikoner",
					modal_iconpicker_text:					"Mappval",
					modal_copytooltipcolor_text:			"Använd samma färger för mappen på mappen",
					modal_colorpicker1_text:				"Primär mappfärg",
					modal_colorpicker2_text:				"Sekundär mappfärg",
					modal_colorpicker3_text:				"Tooltipfärg",
					modal_colorpicker4_text:				"Fontfärg",
					modal_customopen_text:					"Öppnad ikon",
					modal_customclosed_text:				"Closed Icon",
					modal_custompreview_text:				"Ikon förhandsvisning"
				};
			case "tr":		//turkish
				return {
					toast_addserver_text:					"${servername} klasörü${foldername} eklendi.",
					toast_removeserver_text:				"${servername} klasörü${foldername} kaldırıldı",
					servercontext_serverfolders_text:		"Sunucu klasörleri",
					serversubmenu_createfolder_text:		"Klasör oluşturun",
					serversubmenu_addtofolder_text:			"Klasöre sunucu ekle",
					serversubmenu_removefromfolder_text:	"Sunucuyu klasörden kaldır",
					foldercontext_unreadfolder_text:		"Tümünü Oku olarak işaretle",
					foldercontext_autounreadfolder_text:	"Oto: Okundu Olarak İşaretle",
					foldercontext_foldersettings_text:		"Klasör Ayarları",
					foldercontext_removefolder_text:		"Klasörü sil",
					modal_header_text:						"Klasör Ayarları",
					modal_foldername_text:					"Klasör adı",
					modal_tabheader1_text:					"Klasör",
					modal_tabheader2_text:					"Klasör rengi",
					modal_tabheader3_text:					"Tooltip rengi",
					modal_tabheader4_text:					"Özel simgeler",
					modal_iconpicker_text:					"Klasör seçimi",
					modal_copytooltipcolor_text:			"Klasörün sunucusu için aynı renkleri kullanın",
					modal_colorpicker1_text:				"Birincil klasör rengi",
					modal_colorpicker2_text:				"İkincil klasör rengi",
					modal_colorpicker3_text:				"Tooltip rengi",
					modal_colorpicker4_text:				"Yazı rengi",
					modal_customopen_text:					"Açılmış simge",
					modal_customclosed_text:				"Kapalı simge",
					modal_custompreview_text:				"Simge önizleme"
				};
			case "cs":		//czech
				return {
					toast_addserver_text:					"${servername} byl přidán do složky${foldername}.",
					toast_removeserver_text:				"${servername} byl odstraněn ze složky${foldername}.",
					servercontext_serverfolders_text:		"Složky serveru",
					serversubmenu_createfolder_text:		"Vytvořit složky",
					serversubmenu_addtofolder_text:			"Přidat server do složky",
					serversubmenu_removefromfolder_text:	"Odebrat server ze složky",
					foldercontext_unreadfolder_text:		"Označit vše jako přečtené",
					foldercontext_autounreadfolder_text:	"Auto: Označit jako přečtené",
					foldercontext_foldersettings_text:		"Nastavení složky",
					foldercontext_removefolder_text:		"Smazat složky",
					modal_header_text:						"Nastavení složky",
					modal_foldername_text:					"Název složky",
					modal_tabheader1_text:					"Složky",
					modal_tabheader2_text:					"Barva složky",
					modal_tabheader3_text:					"Barva tooltip",
					modal_tabheader4_text:					"Vlastní ikony",
					modal_iconpicker_text:					"Volba složky",
					modal_copytooltipcolor_text:			"Použijte stejné barvy pro server složky",
					modal_colorpicker1_text:				"Primární barva složky",
					modal_colorpicker2_text:				"Sekundární barva složky",
					modal_colorpicker3_text:				"Barva tooltip",
					modal_colorpicker4_text:				"Barva fontu",
					modal_customopen_text:					"Otevřená ikona",
					modal_customclosed_text:				"Uzavřená ikona",
					modal_custompreview_text:				"Náhled ikony"
				};
			case "bg":		//bulgarian
				return {
					toast_addserver_text:					"${servername} е добавен към папката${foldername}.",
					toast_removeserver_text:				"${servername} е премахнат от папката${foldername}.",
					servercontext_serverfolders_text:		"Сървърни папки",
					serversubmenu_createfolder_text:		"Създай папка",
					serversubmenu_addtofolder_text:			"Добавяне на сървър в папка",
					serversubmenu_removefromfolder_text:	"Премахване на сървър от папка",
					foldercontext_unreadfolder_text:		"Маркирай всички като прочетени",
					foldercontext_autounreadfolder_text:	"Авто: Маркиране като четене",
					foldercontext_foldersettings_text:		"Настройки папка",
					foldercontext_removefolder_text:		"Изтриване на папка",
					modal_header_text:						"Настройки папка",
					modal_foldername_text:					"Име на папка",
					modal_tabheader1_text:					"Папка",
					modal_tabheader2_text:					"Цвят на папка",
					modal_tabheader3_text:					"Цвят на подсказка",
					modal_tabheader4_text:					"Персонализирани икони",
					modal_iconpicker_text:					"Избор на папки",
					modal_copytooltipcolor_text:			"Използвайте същите цветове за сървъра на папката",
					modal_colorpicker1_text:				"Цвят основнен на папка",
					modal_colorpicker2_text:				"цвят вторичен на папка",
					modal_colorpicker3_text:				"Цвят на подсказка",
					modal_colorpicker4_text:				"Цвят на шрифта",
					modal_customopen_text:					"Отворена икона",
					modal_customclosed_text:				"Затворена икона",
					modal_custompreview_text:				"Икона Преглед"
				};
			case "ru":		//russian
				return {
					toast_addserver_text:					"${servername} добавлен в папку${foldername}.",
					toast_removeserver_text:				"${servername} был удален из папки${foldername}.",
					servercontext_serverfolders_text:		"Папки сервера",
					serversubmenu_createfolder_text:		"Создать папки",
					serversubmenu_addtofolder_text:			"Добавить сервер в папку",
					serversubmenu_removefromfolder_text:	"Удалить сервер из папки",
					foldercontext_unreadfolder_text:		"Отметить все как прочитанное",
					foldercontext_autounreadfolder_text:	"Авто: Отметить как прочитанное",
					foldercontext_foldersettings_text:		"Настройки папки",
					foldercontext_removefolder_text:		"Удалить папки",
					modal_header_text:						"Настройки папки",
					modal_foldername_text:					"Имя папки",
					modal_tabheader1_text:					"Папка",
					modal_tabheader2_text:					"Цвет папки",
					modal_tabheader3_text:					"Цвет подсказка",
					modal_tabheader4_text:					"Пользовательские значки",
					modal_iconpicker_text:					"Выбор папки",
					modal_copytooltipcolor_text:			"Используйте те же цвета для сервера папки",
					modal_colorpicker1_text:				"Цвет основной папки",
					modal_colorpicker2_text:				"Цвет вторичной папки",
					modal_colorpicker3_text:				"Цвет подсказка",
					modal_colorpicker4_text:				"Цвет шрифта",
					modal_customopen_text:					"Открытая иконка",
					modal_customclosed_text:				"Закрытая иконка",
					modal_custompreview_text:				"Иконка Просмотр"
				};
			case "uk":		//ukrainian
				return {
					toast_addserver_text:					"${servername} було додано до папки${foldername}.",
					toast_removeserver_text:				"${servername} був вилучений з папки${foldername}.",
					servercontext_serverfolders_text:		"Папки сервера",
					serversubmenu_createfolder_text:		"Створити папки",
					serversubmenu_addtofolder_text:			"Додати сервер до папки",
					serversubmenu_removefromfolder_text:	"Видалити папку з папки",
					foldercontext_unreadfolder_text:		"Позначити як прочитане",
					foldercontext_autounreadfolder_text:	"Авто: Позначити як прочитане",
					foldercontext_foldersettings_text:		"Параметри папки",
					foldercontext_removefolder_text:		"Видалити папки",
					modal_header_text:						"Параметри папки",
					modal_foldername_text:					"Ім'я папки",
					modal_tabheader1_text:					"Папки",
					modal_tabheader2_text:					"Колір папки",
					modal_tabheader3_text:					"Колір підказка",
					modal_tabheader4_text:					"Користувальницькі іконки",
					modal_iconpicker_text:					"Вибір папки",
					modal_copytooltipcolor_text:			"Використовуйте ті ж кольори для сервера папки",
					modal_colorpicker1_text:				"Колір основної папки",
					modal_colorpicker2_text:				"Колір вторинного папки",
					modal_colorpicker3_text:				"Колір підказка",
					modal_colorpicker4_text:				"Колір шрифту",
					modal_customopen_text:					"Відкрита ікона",
					modal_customclosed_text:				"Закрита ікона",
					modal_custompreview_text:				"Піктограма попереднього перегляду"
				};
			case "ja":		//japanese
				return {
					toast_addserver_text:					"${servername} がフォルダ${foldername} に追加されました。",
					toast_removeserver_text:				"${servername} がフォルダ${foldername} から削除されました。",
					servercontext_serverfolders_text:		"サーバーフォルダ",
					serversubmenu_createfolder_text:		"フォルダーを作る",
					serversubmenu_addtofolder_text:			"サーバーをフォルダに追加する",
					serversubmenu_removefromfolder_text:	"サーバーをフォルダから削除する",
					foldercontext_unreadfolder_text:		"すべてを読むようにマークする",
					foldercontext_autounreadfolder_text:	"自動： 読み取りとしてマークする",
					foldercontext_foldersettings_text:		"フォルダ設定",
					foldercontext_removefolder_text:		"フォルダを削除する",
					modal_header_text:						"フォルダ設定",
					modal_foldername_text:					"フォルダ名",
					modal_tabheader1_text:					"フォルダ",
					modal_tabheader2_text:					"フォルダの色",
					modal_tabheader3_text:					"ツールチップの色",
					modal_tabheader4_text:					"カスタムアイコン",
					modal_iconpicker_text:					"フォルダの選択",
					modal_copytooltipcolor_text:			"フォルダのサーバーに同じ色を使う",
					modal_colorpicker1_text:				"プライマリフォルダの色",
					modal_colorpicker2_text:				"セカンダリフォルダの色",
					modal_colorpicker3_text:				"ツールチップの色",
					modal_colorpicker4_text:				"フォントの色",
					modal_customopen_text:					"開いたアイコン",
					modal_customclosed_text:				"クローズドアイコン",
					modal_custompreview_text:				"アイコンのプレビュー"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					toast_addserver_text:					"${servername} 已被添加到文件夾${foldername}.",
					toast_removeserver_text:				"${servername} 已從文件夾${foldername} 中刪除.",
					servercontext_serverfolders_text:		"服務器文件夾",
					serversubmenu_createfolder_text:		"創建文件夾",
					serversubmenu_addtofolder_text:			"添加服務器到文件夾",
					serversubmenu_removefromfolder_text:	"從文件夾中刪除服務器",
					foldercontext_unreadfolder_text:		"標記為已讀",
					foldercontext_autounreadfolder_text:	"自動： 標記為已讀",
					foldercontext_foldersettings_text:		"文件夾設置",
					foldercontext_removefolder_text:		"刪除文件夾",
					modal_header_text:						"文件夾設置",
					modal_foldername_text:					"文件夾名稱",
					modal_tabheader1_text:					"夾",
					modal_tabheader2_text:					"文件夾顏色",
					modal_tabheader3_text:					"工具提示顏色",
					modal_tabheader4_text:					"自定義圖標",
					modal_iconpicker_text:					"文件夾選擇",
					modal_copytooltipcolor_text:			"對文件夾的服務器使用相同的顏色",
					modal_colorpicker1_text:				"主文件夾顏色",
					modal_colorpicker2_text:				"輔助文件夾顏色",
					modal_colorpicker3_text:				"工具提示顏色",
					modal_colorpicker4_text:				"字體顏色",
					modal_customopen_text:					"打開的圖標",
					modal_customclosed_text:				"封閉的圖標",
					modal_custompreview_text:				"圖標預覽"
				};
			case "ko":		//korean
				return {
					toast_addserver_text:					"${servername} 가 폴더${foldername} 에 추가되었습니다.",
					toast_removeserver_text:				"${servername} 가 폴더${foldername} 에서 제거되었습니다.",
					servercontext_serverfolders_text:		"서버 폴더",
					serversubmenu_createfolder_text:		"폴더 만들기",
					serversubmenu_addtofolder_text:			"폴더에 서버 추가",
					serversubmenu_removefromfolder_text:	"폴더에서 서버 제거",
					foldercontext_unreadfolder_text:		"모두 읽은 상태로 표시",
					foldercontext_autounreadfolder_text:	"자동: 읽은 상태로 표시",
					foldercontext_foldersettings_text:		"폴더 설정",
					foldercontext_removefolder_text:		"폴더 삭제",
					modal_header_text:						"폴더 설정",
					modal_foldername_text:					"폴더 이름",
					modal_tabheader1_text:					"폴더",
					modal_tabheader2_text:					"폴더 색",
					modal_tabheader3_text:					"툴팁 색깔",
					modal_tabheader4_text:					"사용자 정의 아이콘",
					modal_iconpicker_text:					"폴더 선택",
					modal_copytooltipcolor_text:			"폴더의 서버에 대해 동일한 색상을 사용하십시오.",
					modal_colorpicker1_text:				"기본 폴더 색",
					modal_colorpicker2_text:				"보조 폴더 색",
					modal_colorpicker3_text:				"툴팁 색깔",
					modal_colorpicker4_text:				"글꼴 색깔",
					modal_customopen_text:					"열린 아이콘",
					modal_customclosed_text:				"닫힌 아이콘",
					modal_custompreview_text:				"아이콘 미리보기"
				};
			default:		//default: english
				return {
					toast_addserver_text:					"${servername} has been added to the folder${foldername}.",
					toast_removeserver_text:				"${servername} has been removed from the folder${foldername}.",
					servercontext_serverfolders_text:		"Serverfolders",
					serversubmenu_createfolder_text:		"Create Folder",
					serversubmenu_addtofolder_text:			"Add Server to Folder",
					serversubmenu_removefromfolder_text:	"Remove Server from Folder",
					foldercontext_unreadfolder_text:		"Mark All As Read",
					foldercontext_autounreadfolder_text:	"Auto: Mark As Read",
					foldercontext_foldersettings_text:		"Foldersettings",
					foldercontext_removefolder_text:		"Delete Folder",
					modal_header_text:						"Foldersettings",
					modal_foldername_text:					"Foldername",
					modal_tabheader1_text:					"Folder",
					modal_tabheader2_text:					"Foldercolor",
					modal_tabheader3_text:					"Tooltipcolor",
					modal_tabheader4_text:					"Custom Icons",
					modal_iconpicker_text:					"Folderchoice",
					modal_copytooltipcolor_text:			"Use same Colors for Servers of the Folder",
					modal_colorpicker1_text:				"Primary Foldercolor",
					modal_colorpicker2_text:				"Secondary Foldercolor",
					modal_colorpicker3_text:				"Tooltipcolor",
					modal_colorpicker4_text:				"Fontcolor",
					modal_customopen_text:					"Open Icon",
					modal_customclosed_text:				"Closed Icon",
					modal_custompreview_text:				"Iconpreview"
				};
		}
	}
}
