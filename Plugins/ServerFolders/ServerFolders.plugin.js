//META{"name":"ServerFolders","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ServerFolders","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ServerFolders/ServerFolders.plugin.js"}*//

class ServerFolders {
	getName () {return "ServerFolders";}

	getVersion () {return "6.3.3";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds the feature to create folders to organize your servers. Right click a server > 'Serverfolders' > 'Create Server' to create a server. To add servers to a folder hold 'Ctrl' and drag the server onto the folder, this will add the server to the folderlist and hide it in the serverlist. To open a folder click the folder. A folder can only be opened when it has at least one server in it. To remove a server from a folder, open the folder and either right click the server > 'Serverfolders' > 'Remove Server from Folder' or hold 'Del' and click the server in the folderlist.";}

	initConstructor () {
		this.changelog = {
			"fixed":[["Server Outage","Fixed issue where servers that return from an outage would not be hidden by the plugin (for real this time)"]],
		};
		
		this.labels = {};

		this.patchModules = {
			"Guilds":["componentDidMount","componentDidUpdate","componentWillUnmount"],
			"Guild":["componentDidMount","componentDidUpdate","render","componentWillUnmount"],
			"StandardSidebarView":"componentWillUnmount"
		};
		
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
			}
			${BDFDB.dotCN.guildswrapper}.foldercontent .folderseparatorouter {
				margin-top: 10px;
			}
			${BDFDB.dotCN.guildswrapper}.foldercontent.foldercontentclosed {
				width: 0px !important;
			}`;

		this.serverContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} serverfolders-item ${BDFDB.disCN.contextmenuitemsubmenu}">
					<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_servercontext_serverfolders_text</div></span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;

		this.serverContextSubMenuMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} serverfolders-submenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} createfolder-item">
						<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_serversubmenu_createfolder_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} addtofolder-item ${BDFDB.disCN.contextmenuitemsubmenu}">
						<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_serversubmenu_addtofolder_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} removefromfolder-item">
						<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_serversubmenu_removefromfolder_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>
			</div>`;

		this.serverContextSubFolderMenuMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} serverfolders-foldersubmenu">
				<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
					<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.contextmenuscroller}"></div>
				</div>
			</div>`;

		this.folderContextMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} serverfolder-contextmenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} unreadfolder-item ${BDFDB.disCN.contextmenuitemdisabled}">
						<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_foldercontext_unreadfolder_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} autounreadfolder-item ${BDFDB.disCN.contextmenuitemtoggle}">
						<div class="${BDFDB.disCN.contextmenulabel} BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_foldercontext_autounreadfolder_text</div></div>
						<div class="${BDFDB.disCNS.contextmenucheckbox + BDFDB.disCN.contextmenucheckbox2}">
							<div class="${BDFDB.disCN.contextmenucheckboxinner}">
								<input class="${BDFDB.disCN.contextmenucheckboxelement}" type="checkbox">
								<span></span>
							</div>
							<span></span>
						</div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} foldersettings-item">
						<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_foldercontext_foldersettings_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} createfolder-item">
						<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_foldercontext_createfolder_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} removefolder-item ${BDFDB.disCN.contextmenuitemdanger}">
						<span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">REPLACE_foldercontext_removefolder_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>
			</div>`;

		this.folderContentMarkup = 
			`<div class="${BDFDB.disCN.guildswrapper} foldercontent foldercontentclosed">
				<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.firefoxfixscrollflex + BDFDB.disCNS.guildsscrollerwrap + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
					<div class="${BDFDB.disCNS.guilds + BDFDB.disCN.scroller}"></div>
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
			</div>`;

		this.dragPlaceholderMarkup =
			`<div class="${BDFDB.disCNS.guildouter + BDFDB.disCN._bdguild} foldercopyplaceholder">
				<div class="${BDFDB.disCNS.guildpillwrapper + BDFDB.disCN.guildpill}">
					<span class="${BDFDB.disCN.guildpillitem}"></span>
				</div>
				<div tabindex="0" class="${BDFDB.disCNS.guildcontainer + BDFDB.disCN.guildinner}" role="button">
					<svg width="48" height="48" viewBox="0 0 48 48" class="${BDFDB.disCN.guildsvg}">
						<mask id="SERVERFOLDERSDRAG" fill="black" x="0" y="0" width="48" height="48">
							<path d="M48 24C48 37.2548 37.2548 48 24 48C10.7452 48 0 37.2548 0 24C0 10.7452 10.7452 0 24 0C37.2548 0 48 10.7452 48 24Z" fill="white"></path>
						</mask>
						<foreignObject mask="url(#SERVERFOLDERSDRAG)" x="0" y="0" width="48" height="48">
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
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.headertitle + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.defaultcolor + BDFDB.disCNS.h4defaultmargin + BDFDB.disCN.marginreset}">REPLACE_modal_header_text</h4>
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
									<div class="${BDFDB.disCN.buttoncontents}">REPLACE_btn_save_text</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</span>`;

		this.folderIcons = [
			{"openicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAAB2ElEQVR4Xu2Z4W6DMAwG4f0fmqloq0YJw0dIhLPb7y+qfT0Hr8yTf2ECczhpcBIWkEBYwgIEQFSzhAUIgKhmCQsQAFHNEhYgAKKaJSxAAETvMGsBn1eK3lFDZQmx4zWF1kL6rLCmlli3lamrBd4N6qeNq/VUYogdv1JcK1CPByasmFRrisJqbdWj7RLWAGaBFi5FqSSPHsNLBOAhDIwe6HVnwb4vx1H/KDxN02iw0ENOWGAjEJaw0B0WFiYc/P547yzwPYwI66j9nUiadW7Km5GwzmG91wthCStGAKRWqbqatSw5ng/zXL7bu8FKDKr/nSWs4NAnB9XXLGEFrXrFksPqt5QmB7XZGJo/DZPD2vBpCis5qN0eKqzXZr5fQosLezNYo1nV9N8dYYG3O8lhFSeuyRgmB3U4ccLaL9eHTG6HNapVTS745LD+lEeztmPYD9bIVt0+hsLaanr4I3pyUCFxbruzksMKcQiFfsk1qlkhDqHQGaz/YFVoTj8W3Bwv/sBP3uTdKTVr/Umd1fLoNOofhc/G8dFYysWh/lF4sJHEveMDhS8o01hW9Vt1OOHYVZUsLIBPWMICBEBUs4QFCICoZgkLEABRzRIWIACimiUsQABENQvA+gLIy3lMlnMoMQAAAABJRU5ErkJggg==", 
			"closedicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABkElEQVR4Xu3a6xKCIABEYXz/h7bpOl1M94CWMqffywRfK1I2FF+xwBAnDRaxQAnEEgsIgKjNEgsIgKjNEgsIgKjNEgsIgKjNEgsIgOgazRrB+01F15hD4xSy4S0TbUV6n2HLXLLVNqZqJ7g21H0ZtfNpZMiG10xuK6jdg4mVleqSolhbt2rX7RKrg2aBJVRFaUl2fRlWCcBBGIwO+NWeBdddHUfrR+FSSm9Y6CYnFjgRNGON43HKNgyTy40N4uBtV3iRORLU4wD3CRYbxEGxwPUqlli/uxu6Z82f79zgwflXLLEyAY8O4CYnlljfL6uJrzxxYeKgh1JQQbHE8gQ/dxBwz8qOSdeHDv5Ek2uJlVvZLGAlllhEAGTds8QCAiBqs8QCAiBqs8QCAiBqs8QCAiD6t2ad53ikB61//ReNWOCJNGj/nqPxc4g4+LTa4/x7bfkjQutH4c7A8NrxgE7AqtZdNWi53X0mxAKfq1hiAQEQtVliAQEQtVliAQEQtVliAQEQtVliAQEQtVliAQEQPQHGLZBMBnSlGQAAAABJRU5ErkJggg=="},
			{"openicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAAB5ElEQVR4Xu3b0XaDIBBFUfz/j7YraZqooM4dxljg9HkU2dwh6rJT4s8sMJkrKUxgCSEACyxBQCglWWAJAkIpyQJLEBBKSRZYgoBQSrLAEgSEUm+yZmGMZal3POdwsYd5Lt4L9XflnjFjZ+08m3rhtVBNg1VhzbPdbpqyodSxnXmIO0y94LeOAvWOUw4WNxP9TOrc5fdZVViP+RQSpk8z7ggJTCpOKVVjtQx2C1ZcMPQz1eydw2EVkm02MBe+1jCkDfU8xB6xSZfZwFwIVrru1/Cf/erVRvMZqkuS1RnU5zZRJDftWWD9qrqwPHf74iKGl5duMb7ShmDtPERvV6QXqEs2eLA+O8LpngWWE6vFFjx6HArd4HtOVfieBdb6DuZwzwLLiNU7VGgbgpU/ROy2IVhGrBGgwtoQrPJzfLENwTJijQIV0oZg7b9Ky9oQLCPWSFDVbQjW8dvsVRuC5cTq7d1VicH9Pmt7shax1I9EwFqv+qEHWN/GGqEFq24dlgsC1smzIVjnXwxk33KPkqqQNgTL8Gx4HsKmKkx3BaaixbTt/1LRjpXZwFz4mjtY7YTg3itVk3Xv1d48OljCAoAFliAglJIssAQBoZRkgSUICKUkCyxBQCglWWAJAkIpyQJLEBBKfwAHhexMOBnKeAAAAABJRU5ErkJggg==", 
			"closedicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABj0lEQVR4Xu3b2w6CMBBF0fb/PxpDgsQAMbOnExtw+3zoZfUoxGhvvsICPZw02MQCJRBLLCAAojZLLCAAojZLLCAAojZLLCAAojZLLCAAotlmLWCOz2h2vuR0tZdlFp+Feq88M2ftrpOj0YWPQt0abAhrWeJ2vZ+monMn+1B3GV3wrkOg9jqdwep2wkeie8ffZw1hrfu5aBjfZt0VCAyFW2vDWHcGm4JVVww+0shn599hXTQ7bBAObmdY8jbkfai94tCusEE4KFbL3w1rz3rqaOHChIPHZk3dXu3kYYNwUKzBt2HmKb62FHw0Hx2gmXdDACaWWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARH/erHVt/jDk+wnF/yUATnpyNPyzq3Bw25BY8GSfBIbKgsIQ9XFxscCRiiUWEABRmyUWEABRmyUWEABRmyUWEABRmyUWEABRmyUWEABRmwWwXiH/oUz3h3vUAAAAAElFTkSuQmCC"},
			{"openicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABsElEQVR4Xu3Z4XLCIBBFYfP+D52OjbXGxmQPQgrr6b/OrAKfdwnidPEvLDCFKy28iAVCIJZYQACUmiyxgAAoNVliAQFQarLEAgKg1GSJBQRAaWmyZjDGY2npeIXD1X1ZyeRLoX5mXjJm3VUXvhud+LtQQ4P9F9YVjY5dmId6L6MTrpWseisofye6dvzpZsLC6aa62bAQmFhg7xRLLLTrhwMTLrwN754FPoeMWJHlf4fKZEWolppJrN6w5nm87p3+5uicZIkVjG8WqFM2eLGCqbqWiRXEGhFqOSOsDgn3f5oeHUbE2noKll7vojOAWMEWzLZfNX0aZkuVWE9dsrdfidUDVsYWbJYssZbIho4OYgWxskI1aUOxfp8ah20oVhArM1T1NhRrfXDbbUOxglgjQu3dXW3dF1S7zxoR6+i74DOYWGuRXQ+xzsb6hBasdnQQa/v6ePPoIFYQ61OgqrShWK9/wTn8Ig1+/OmpNHQqCBU9rCojVtggXHgDE6unfuh5LjRZPa+l+dzEAsRiiQUEQKnJEgsIgFKTJRYQAKUmSywgAEpNllhAAJSaLLGAACj9AiC1iUwkZlXyAAAAAElFTkSuQmCC", 
			"closedicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABgElEQVR4Xu3a7a6CMBREUXj/h8aQKEGMMvvYACX7/r2jLatDrR/j4F8sMMZJg4NYoARiiQUEQNRmiQUEQNRmiQUEQNRmiQUEQNRmiQUEQLTarAmMsY5WxysO1/ZhlclXoV4zr4zZ9qqLz0Yn/i9U12BnYc1odOxiH9o9jE64VbPaXUH9mei149W9ExZuN9W9GxYCEwvsnWKJhXb9uDBx8Dm8exZYB7HEygS8DY/a4Kepv7tyHD/6ERcmDm43+B6hlnfx72CxQRwUC9yvYol1zHtD96z948by8ieWWD8FfDUE+7ZYYv3eTzan+LgwcdBzFqigWGJ5KN07Abln7Qmt/i+WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG2WWEAARG3WlbHmufX4ddgpPwwBC3n1aPzRehzcfqx8dQEwv9ggDq4G7+9HWd/l0PWjMFitW0bFAssqllhAAERtllhAAERtllhAAERtllhAAERtllhAAERtllhAAERtFsB6ACnIiUxdpMfOAAAAAElFTkSuQmCC"},
			{"openicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAAByUlEQVR4Xu3a4XKCMBBFYXj/h6bTakEFYU+yjJic/r4Y+LwLNOM4+BcWGMNJg4NYoARiiQUEQNRmiQUEQNRmiQUEQNRmiQUEQNRmiQUEQLS0WRNY4zFaul7hcrmHlZx8KdT/mZesmXvVhZ9GT7wW6qvBqrCmKW43jqul6NqFfcg7jJ7wrEOg5jqtwfKuhH8SvXa8n1WF9Xs9Gw3jl5l3BAJD4WEYqrG+GewjWHnF4J9Uc+/sDmuj2WGDcPD+HaaMIe9D7hEv7QobhINiDec9DS/21Kut5l+pTmlWY1DLayIkD92zxLqpigXaJVYmVqsjeMoNXqyleodjKFbfWPPrVep7VsutSr9nifX8qNy9Z4kVxGodKnUMxVq/rb4dQ7GCWD1ApY2hWNv/MG6OoVhBrF6gUsZQrPd7NqsxFCuI1RNU9RiKtb9t+jSGYvWNtbtlVbyfBfbtvykqFvi2xBILCASjh7ekw8DLQvFf3AbP8EKxQ4vDgFiLgFg3i5BDKPTQrlbHMOQQCokF6tc4Vrgw4eAdrMUxDBuEgxd6xH/sVMQC9GKJBQRA1GaJBQRA1GaJBQRA1GaJBQRA1GaJBQRA1GaJBQRA1GYBrB8F4ZJMlK2iwQAAAABJRU5ErkJggg==", 
			"closedicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABkklEQVR4Xu2bywrCQBAEN///0RFFg6iHrtmRNVieK/uo9LQguA0/sYEtJgWHskAIlKUsYACgJktZwABATZaygAGAmixlAQMANVnKAgYAWk3WDvZ4Rqv7Fbfrfaxy+Kqox8kre/beurgaPfisqFMLm5K177m7bXvbiu5dzEPfY/TAhx0i6ojTu7C+m/CV6N3x71lTsq73+ZAwfs2+J5AwBI8xpmWdWdgSWX3B4CvNdOffyfqQ7NhBDN7fYcsY8jz0PvGSrthBDCpr1L8Ne9/10tXiwMTga7KWXq9389hBDCrLMbx9OaZBjUGTBawqS1mOYdpBdy6uohh0DB1Dx9AxhAYAHldRDNpZdpadBUZQWcqCBgAe93YMWvAWvJ0FRlBZyoIGAB73dgxa8Ba8nQVGUFnKggYAHvd2DFrwFrydBUZQWcqCBgAe93YMWvAWvJ0FRvCrsq6L5/9BgadegKMaQvCCy/zUlsoCr0NZygIGAGqylAUMANRkKQsYAKjJUhYwAFCTpSxgAKAmS1nAAEBNFpB1ARZcR0zScgj8AAAAAElFTkSuQmCC"},
			{"openicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAAB4ElEQVR4Xu2Z0XWDMAxFxWdH6A6docN3hu7QEfpJT9NAQwJIz0duQefm+8WY6yvZwGD8wgSGcJKgAUuQAFjAEggIUcwClkBAiGIWsAQCQhSzgCUQEKKYBSyBgBDFrA6wRmHMaPR0CxWZcA9QE9DI9aPwu+cikwXWdRn+G9b3NCJz6G5N5AKRifY0C1iRVbrLRBatYdjcv0Qm2dus09h1FFi5CuijRTiEmutfmKXfXv4/XGBuwMyAdaCjQ74jbSO64riBW7PGsa5kwzC4LNwAsH41BdbUjzAr3rwowzgrA9bRYQVKX7iFw0QvvT29wQPrusDeOasoqFmqVLOAdfNsiFl+D52fcfZgVbcqtcED68c6zGp5RbNVhoWtWlRfym5YGNaCD7D2N7hcWIWtetgAW8x6M7PXaUEKw3pg0wLr3cxegLVev/dHhw8ze7446r+29o+8x02kmPVpZk/Aipk1pwqbtdqeWnrWBVZhUJuPgcBarybMEvaSPFjFSzC3DIvD2mxNUs8SND5zFFjC6gELWAIBIYpZQVi7PZwGv6QIrKBV7teuiFmLLzzChc8WdVm4gbPdcc/5AkugCyxgCQSEKGYBSyAgRDELWAIBIYpZwBIICFHMApZAQIhiFrAEAkL0C09hh0yOgU58AAAAAElFTkSuQmCC", 
			"closedicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABv0lEQVR4Xu2aYW7CMBSDX26ChHabXZfbTJN2kqKCNpCg+Jk0axp9/MVpky+220JL8EkTKGklwgCWYQJgAcsgYEhxFrAMAoYUZwHLIGBIcRawDAKGFGcByyBgSHFWA1iTccys9BARP1lxD7qMs1qA+l175vw9cLrMITPZlrA+I+LUDQ0xka1hZTesC57AMrahB1i7cVdPsOa5tOxHw0PPpb3Aql5I5QEyHDa/GlaucdXhx4j4fnXEDNGuo7EiLnmTDKwb7Y+I+FrNWdM0rslKKdI4UnB/hQKWDv2fnYAFrOtD8n/EMHEOvR0bK+bENIc1Aqi7fZL9LQWvCh5Yj5FYLHhgAWuxQYnhDY1kIQV0lkETWMB61ksyZVKAs3AWzqp8apIpkwJiSAyJITGsJGAMl5UkBXQWnUVnGZEDFrAqCRjDZX9LwVLBD/Yr6eUPHgVWCnp/DUgt0PhespACYL1562Ds0h6l0jhSgLNwVvv7rD1my5izTJkUEENiSAyNyDWDNR943Pcjr9gydZQTVe7YMMNTRIdZbeVCgGUABBawDAKGFGcByyBgSHEWsAwChhRnAcsgYEhxFrAMAoYUZxmwzq8phkz4oCrBAAAAAElFTkSuQmCC"},
			{"openicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAAByElEQVR4Xu3Z0XaDIBCE4fj+D21OepqkWnRnZPUA/rntxuDnsICdHnxkgUmupPABlhECsMAyBIxSkgWWIWCUkiywDAGjlGSBZQgYpSQLLEPAKCVZJ2PNxvWV0m4emDvQbKg3pjsO5SGk1ziDPAuqGzAV62yoLsBaw3qhqWNKn2bRBdWBXZWsphPWKlb0kDP+rt7757fUL1ydrAwM9RqqgdwfRsaS+6SqCpax8oyOJaWLZH07W2gRFvxei2QxDRcLZhicsKAmWfPcdiCnaXH7oUVYcASrdaStDdi00lvXpWP1CvU5Z+2AgVWI2VbCUrF6T1WULrBIlnqGLtcxDQ2/07FG6Vc/h8SNFTGtZ4H1jW64FQfrhlh7u3im4arxg5WwEkpvB5WD9B36FVjG7h0ssIwGZTR3knU11l2ae0qywPo/7TePO2CBVVwlqo87oyQr+s9Odc8aBWrvHdbfiFUlC6zynq7Y4MG6IZbSr6p61t1S5WC9ahdTEaz9M+iQWOoUdJO1SNcIyXKgjmC9szf3juVC1WAdf2nU8TfVTWnHt5g3dLAMS7DAMgSMUpIFliFglJIssAwBo5RkgWUIGKUkCyxDwCglWQbWE/kykkzUi2UWAAAAAElFTkSuQmCC", 
			"closedicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABZklEQVR4Xu3awZKCMBQFUfL/Hx0rKizccNtKKHjVs/WKeGh0FrbNv1igxUuHm1ggArHEAgJgalliAQEwtSyxgACYWpZYQABMLUssIACmlrUYq4PjJ9PHXDB6orOhdkx6HslFmL4hJ7kK6jFgKdZqqEeA3Q1roKXnNP02OztgemJXlXXrwv7C6v1qu7Nrzh9vraXv/Th4+oS3TgWkX1aCFmNVhDru+bAyscY3ykysXjmrb14JWFSWWB9RsSxrzb8SlmVZlsUFwDP8NhQLCICpZYkFBMDUssQCAmBqWWIBATC1LLGAAJhallhAAEwtSywgAKaWJRYQAFPLEgsIgKlliQUEwNSyxAICYGpZYgEBMLUssYAAmE4ra7xm5d9oJVDDIPoVjVifRGOsqmBpVRhr/wiocEsSpP19o7LA52XJqVjgsoolFhAAU8sSCwiAqWWJBQTA1LLEAgJgalliAQEwtSyxgACYvgCckKpMkaN7zAAAAABJRU5ErkJggg=="},
			{"openicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABrklEQVR4Xu3ayZLCMAxFUfz/H50upnQanFjXdi8SXba8TAdJGBfl5issUMJJgzexQBGIJRYQAFErSywgAKJWllhAAEStLLGAAIhaWWIBARC1ssQCAiDaU1kLOH8t2nPNwUvOOZze+CjU+67pdec87eBZ6E3PwrrfNr324KOOH05veCbW6cCGsJZltt34p986QymFPvN6SnrgqnNGqHVgdoJ1YZ0Z6tH7YrUa8Pd9seJWj2QPWMo2fGHhb+PsWAhMLLA4Fkus9rTfrB7CBXMUPN/yvG0USeya7L2RFepwV6SGlR1qF0ys/cb8shFLrMgcb2asrCbR5vf2Z9Y2tA1B/Qxi3Q/Pvnyorj9dlNYrSyzQnGL9F1bmuYV/SItVKUO3aL5RrKzReRXZrM+23jrcNW1tqYq1KUmx/vanlTVjXkVmVqYlRKvLQv++yzK3xJrVgrYhGO5RrAxzq9mCYh3st9faNySaYOc05BAKifWssyjWledW2CAcvHB1hQ3CQbBeuWxULPDRiiUWEABRK0ssIACiVpZYQABErSyxgACIWlliAQEQtbLEAgIgamUBrB+JEUtMl61hQwAAAABJRU5ErkJggg==", 
			"closedicon":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABhUlEQVR4Xu3YwQqDMBBF0eT/P9oiVAji4l1rIh1u1w8zHifTaG/+YoEeJw02sUATiCUWEABRO0ssIACidpZYQABE7SyxgACI2lliAQEQtbPEAgIgeqezNnD9q+idNa+us7wOWvivBR43Tdc9Y71SBy36qSL3m6drH2BP1oDqoAW/VuhX6un112Ft24zarydi7/S5xpM1vnAcPD/ZIlDzO6sQVB2siVtv3KPx7oqD4zZc0VmLoOZ3Vjw6/yMYN0wcnPjX/TZpbBAHW2vrzglr+WKDOCgWe+Wws0DHiyVW/kLvzAKjSCyxwHARSywkAMLxKIqDHkrBfhVLrGmfaDzBg0Eolli+7oAeEEssIgCy8VkzDnrO8pzlOQtsQbHEggIgHs/tOOiAd8A7s8AWFEssKADi8dyOgw54B7wzC2zBaVj7hat9LSVjKP/wNTytKmAICrUgbO2ScaxbUiG8KbFCKLchgBJLLCgA4s4ssYAAiNpZYgEBELWzxAICIGpniQUEQNTOAlgf/fBATBZ555AAAAAASUVORK5CYII="}
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
				require("request")("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
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

			this.GuildUtils = BDFDB.WebModules.findByProperties("getGuilds","getGuild");
			this.CurrentGuildStore = BDFDB.WebModules.findByProperties("getLastSelectedGuildId");
			this.DiscordConstants = BDFDB.WebModules.findByProperties("Permissions", "ActivityTypes", "StatusTypes");
			this.Animations = BDFDB.WebModules.findByProperties("spring");

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
		this.serverContextEntryMarkup = 	this.serverContextEntryMarkup.replace("REPLACE_servercontext_serverfolders_text", this.labels.servercontext_serverfolders_text);

		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_serversubmenu_createfolder_text", this.labels.serversubmenu_createfolder_text);
		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_serversubmenu_addtofolder_text", this.labels.serversubmenu_addtofolder_text);
		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_serversubmenu_removefromfolder_text", this.labels.serversubmenu_removefromfolder_text);

		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_unreadfolder_text", this.labels.foldercontext_unreadfolder_text);
		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_autounreadfolder_text", this.labels.foldercontext_autounreadfolder_text);
		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_foldersettings_text", this.labels.foldercontext_foldersettings_text);
		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_createfolder_text", this.labels.serversubmenu_createfolder_text);
		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_removefolder_text", this.labels.foldercontext_removefolder_text);

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

	onGuildContextMenu (instance, menu) {
		if (document.querySelector(".BDFDB-modal")) return;
		if (instance.props && instance.props.target && instance.props.guild && instance.props.type == "GUILD_ICON_BAR" && !menu.querySelector(".serverfolders-item")) {
			let serverContextEntry = BDFDB.htmlToElement(this.serverContextEntryMarkup);
			let devgroup = BDFDB.React.findDOMNodeSafe(BDFDB.getOwnerInstance({node:menu,name:["DeveloperModeGroup","MessageDeveloperModeGroup"]}));
			if (devgroup) devgroup.parentElement.insertBefore(serverContextEntry, devgroup);
			else menu.appendChild(serverContextEntry, menu);
			let folderitem = serverContextEntry.querySelector(".serverfolders-item");
			folderitem.addEventListener("mouseenter", () => {
				let serverContextSubMenu = BDFDB.htmlToElement(this.serverContextSubMenuMarkup);
				let createitem = serverContextSubMenu.querySelector(".createfolder-item");
				let additem = serverContextSubMenu.querySelector(".addtofolder-item");
				let removeitem = serverContextSubMenu.querySelector(".removefromfolder-item");
				createitem.addEventListener("click", () => {
					BDFDB.closeContextMenu(menu);
					this.createNewFolder(instance.props.target);
				});
				let folderdiv = this.getFolderOfServer(instance.props.guild);
				if (!folderdiv) {
					BDFDB.removeEles(removeitem);
					let folders = document.querySelectorAll(BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter + ".folder");
					if (folders) {
						BDFDB.removeClass(additem, BDFDB.disCN.contextmenuitemdisabled);
						additem.addEventListener("mouseenter", () => {
							let serverContextSubFolderMenu = BDFDB.htmlToElement(this.serverContextSubFolderMenuMarkup);
							for (let i = 0; i < folders.length; i++) {
								let foundfolderdiv = folders[i];
								let name = foundfolderdiv.getAttribute("foldername");
								let folderentry = BDFDB.htmlToElement(`<div class="${BDFDB.disCN.contextmenuitem} addtospecificfolder-item"><span class="BDFDB-textscrollwrapper" speed=3><div class="BDFDB-textscroll">${name ? BDFDB.encodeToHTML(name) : (this.labels.modal_tabheader1_text + " #" + (i+1))}</div></span><div class="${BDFDB.disCN.contextmenuhint}"></div></div>`);
								folderentry.addEventListener("click", () => {
									BDFDB.closeContextMenu(menu);
									this.addServerToFolder(instance.props.guild, foundfolderdiv);
								});
								serverContextSubFolderMenu.firstElementChild.firstElementChild.appendChild(folderentry);
							}
							BDFDB.appendSubMenu(additem, serverContextSubFolderMenu);
						});
					}
					else BDFDB.removeEles(additem);
				}
				else {
					BDFDB.removeEles(additem);
					removeitem.addEventListener("click", () => {
						BDFDB.closeContextMenu(menu);
						this.removeServerFromFolder(instance.props.guild, folderdiv);
					});
				}
				BDFDB.appendSubMenu(folderitem, serverContextSubMenu);
			});
		}
	}

	processGuilds (instance, wrapper, methodnames) {
		if (methodnames.includes("componentWillUnmount")) {
			BDFDB.removeEles(this.foldercontent, BDFDB.dotCN.guildswrapper + ".foldercontent", ".serverfolder-contextmenu", BDFDB.dotCN.guildouter + ".folder");
			this.foldercontent = null;
		}
		if (methodnames.includes("componentDidMount")) {
			let process = () => {
				if (!wrapper.parentElement.querySelector(BDFDB.dotCN.guildswrapper + ".foldercontent")) {
					this.foldercontent = BDFDB.htmlToElement(this.folderContentMarkup);
					wrapper.parentElement.insertBefore(this.foldercontent, wrapper.nextElementSibling);
					this.foldercontentguilds = this.foldercontent.querySelector(BDFDB.dotCN.guilds);
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

	processGuild (instance, wrapper, methodnames) {
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
						if (!newsettings.forceOpenFolder || !this.foldercontent.querySelector(`${BDFDB.dotCN.guildouter}[folder="${openFolder.id}"][guild="${this.CurrentGuildStore.getGuildId()}"]`)) this.openCloseFolder(openFolder);
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

	processStandardSidebarView (instance, wrapper) {
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
		let {folderID,folderName,position,iconID,icons,copyTooltipColor,color1,color2,color3,color4,servers} = BDFDB.loadData(folderdiv.id, this, "folders") || {};
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
				let isOpen = BDFDB.containsClass(folderdiv, "open");
				if (!BDFDB.containsClass(selectedIcon, "custom")) {
					this.changeImgColor(color1, color2, folderIcons[iconID].openicon, (openicon) => {
						icons.openicon = openicon;
						this.changeImgColor(color1, color2, folderIcons[iconID].closedicon, (closedicon) => {
							icons.closedicon = closedicon;
							folderdiv.querySelector(BDFDB.dotCN.guildicon).setAttribute("src", `${isOpen ? icons.openicon : icons.closedicon}`);
							BDFDB.saveData(folderID, {folderID,folderName,position,iconID,icons,copyTooltipColor,color1,color2,color3,color4,servers}, this, "folders");
						});
					});
				}
				else {
					icons.openicon = folderIcons[iconID].openicon;
					icons.closedicon = folderIcons[iconID].closedicon;
					folderdiv.querySelector(BDFDB.dotCN.guildicon).setAttribute("src", `${isOpen ? icons.openicon : icons.closedicon}`);
					BDFDB.saveData(folderID, {folderID,folderName,position,iconID,icons,copyTooltipColor,color1,color2,color3,color4,servers}, this, "folders");
				}
			}
			else BDFDB.saveData(folderID, {folderID,folderName,position,iconID,icons,copyTooltipColor,color1,color2,color3,color4,servers}, this, "folders");
		});
		foldernameinput.focus();
	}

	changeImgColor (color1, color2, icon, callback) {
		color1 = BDFDB.colorCONVERT(color1, "RGBCOMP");
		color2 = BDFDB.colorCONVERT(color2, "RGBCOMP");
		if (!color1 || !color2 || !icon) return;
		let img = new Image();
		img.src = icon;
		img.onload = () => {
			if (icon.indexOf("data:image") == 0 && img.width < 200 && img.height < 200) {
				let can = document.createElement("canvas");
				can.width = img.width;
				can.height = img.height;
				let ctx = can.getContext("2d");
				ctx.drawImage(img, 0, 0);
				let imageData = ctx.getImageData(0, 0, img.width, img.height);
				let data = imageData.data;
				for (let i = 0; i < data.length; i += 4) {
					if (data[i] == 0 && data[i + 1] == 0 && data[i + 2] == 0) {
						data[i] = color1[0];
						data[i + 1] = color1[1];
						data[i + 2] = color1[2];
					}
					else if (data[i] == 255 && data[i + 1] == 255 && data[i + 2] == 255) {
						data[i] = color2[0];
						data[i + 1] = color2[1];
						data[i + 2] = color2[2];
					}
					ctx.putImageData(imageData, 0, 0);
				}
				callback(can.toDataURL("image/png"));
			}
			else {
				callback(img.src);
			}
		};
	}

	setIcons (modal, selection) {
		let wrapper = modal.querySelector(".icons");
		if (!wrapper) return;
		BDFDB.removeEles(wrapper.childNodes);

		let folderIcons = this.loadAllIcons();

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
			let request = require("request");
			request(url, (error, response, result) => {
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
			let fs = require("fs")
			if (fs.existsSync(url)) {
				fs.readFile(url, (error, response) => {
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
		let folderID = 		this.generateID("folder");
		let folderName = 	"";
		let position = 		this.getAllServersAndFolders().indexOf(guilddiv);
		let iconID = 		0;
		let icons = 		Object.assign({},this.folderIcons[0]);
		let autounread = 	false;
		let isOpen = 		false;
		let color1 = 		["0","0","0"];
		let color2 = 		["255","255","255"];
		let color3 = 		null;
		let color4 = 		null;
		let servers = 		[];

		this.showFolderSettings(this.createFolderDiv({folderID,folderName,position,iconID,icons,autounread,color1,color2,color3,color4,servers}));

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
			let bgColor = BDFDB.colorCONVERT(newdata.color3, "RGB");
			let fontColor = BDFDB.colorCONVERT(newdata.color4, "RGB");
			BDFDB.createTooltip(newdata.folderName, folderdivinner, {type:"right",selector:"guild-folder-tooltip",style:`color: ${fontColor} !important; background-color: ${bgColor} !important; border-color: ${bgColor} !important;`});
		});
		folderdiv.addEventListener("contextmenu", e => {
			let newdata = BDFDB.loadData(folderdiv.id, this, "folders");
			if (!newdata) return;
			let folderContext = BDFDB.htmlToElement(this.folderContextMarkup);
			let autounreadinput = folderContext.querySelector(".autounreadfolder-item input");
			autounreadinput.checked = newdata.autounread;
			folderContext.querySelector(".autounreadfolder-item").addEventListener("click", () => {
				autounreadinput.checked = !autounreadinput.checked;
				newdata.autounread = autounreadinput.checked;
				BDFDB.saveData(newdata.folderID, newdata, this, "folders");
			});
			folderContext.querySelector(".foldersettings-item").addEventListener("click", () => {
				folderContext.remove();
				this.showFolderSettings(folderdiv);
			});
			folderContext.querySelector(".createfolder-item").addEventListener("click", () => {
				folderContext.remove();
				this.createNewFolder(folderdiv);
			});
			folderContext.querySelector(".removefolder-item").addEventListener("click", () => {
				folderContext.remove();
				this.removeFolder(folderdiv);
			});

			let unreadServers = BDFDB.readUnreadServerList(this.readIncludedServerList(folderdiv));
			if (unreadServers.length > 0) {
				let unreaditem = folderContext.querySelector(".unreadfolder-item");
				BDFDB.removeClass(unreaditem, BDFDB.disCN.contextmenuitemdisabled);
				unreaditem.addEventListener("click", () => {
					folderContext.remove();
					BDFDB.markGuildAsRead(unreadServers);
				});
			}
			BDFDB.appendContextMenu(folderContext, e);
		});
		folderdiv.addEventListener("mousedown", e => {
			let x = e.pageX, y = e.pageY;
			let mousemove = e2 => {
				if (Math.sqrt((x - e2.pageX)**2) > 20 || Math.sqrt((y - e2.pageY)**2) > 20) {
					document.removeEventListener("mousemove", mousemove);
					document.removeEventListener("mouseup", mouseup);
					let guildswrap = document.querySelector(`${BDFDB.dotCN.guildswrapper}:not(.foldercontent) ${BDFDB.dotCN.guilds}`);
					if (!guildswrap) return;
					let hovele = null;
					let placeholder = BDFDB.htmlToElement(this.dragPlaceholderMarkup);
					let dragpreview = this.createDragPreview(folderdiv, e);
					let dragging = e3 => {
						BDFDB.removeEles(placeholder);
						BDFDB.toggleEles(folderdiv, false);
						this.updateDragPreview(dragpreview, e3);
						hovele = BDFDB.getParentEle(BDFDB.dotCN.guildouter + ".folder", e3.target);
						if (hovele) guildswrap.insertBefore(placeholder, hovele.nextSibling);
						else {
							hovele = BDFDB.getParentEle(BDFDB.dotCN.guildouter, e3.target);
							if (hovele && BDFDB.getReactValue(hovele, "return.memoizedProps.guild") && guildswrap.contains(hovele)) {
								guildswrap.insertBefore(placeholder, hovele.nextSibling);
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
			insertnode = BDFDB.getParentEle(BDFDB.dotCN.guildouter, document.querySelector(BDFDB.dotCNS.guilds + BDFDB.dotCN.guildbuttoncontainer));
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
			let info = this.GuildUtils.getGuild(BDFDB.getServerID(guilddiv));
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
		let info = this.GuildUtils.getGuild(BDFDB.getServerID(guilddiv));
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
				let bgColor = BDFDB.colorCONVERT(folderData.copyTooltipColor ? folderData.color3 : null, "RGB");
				let fontColor = BDFDB.colorCONVERT(folderData.copyTooltipColor ? folderData.color4 : null, "RGB");
				BDFDB.createTooltip(info.name, guildcopyinner, {type:"right",style:`color: ${fontColor} !important; background-color: ${bgColor} !important; border-color: ${bgColor} !important;`});
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
				mentions += parseInt(props.badge);
				if (props.selected) selected = true;
				if (props.unread) unread = true;
				if (props.audio) audioenabled = true;
				if (props.video) videoenabled = true;
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

		let borderRadius = new this.Animations.Value(0);
		borderRadius
			.interpolate({
				inputRange: [0, 1],
				outputRange: [50, 30]
			})
			.addListener((value) => {
				diviconwrapper.style.setProperty("border-radius", `${value.value}%`);
			});

		let pillHeight = new this.Animations.Value(0);
		pillHeight
			.interpolate({
				inputRange: [0, 1],
				outputRange: [8, 20]
			})
			.addListener((value) => {
				divpillitem.style.setProperty("height", `${value.value}px`);
			});

		let pillOpacity = new this.Animations.Value(0);
		pillOpacity
			.interpolate({
				inputRange: [0, 1],
				outputRange: [0, 0.7]
			})
			.addListener((value) => {
				divpillitem.style.setProperty("opacity", `${value.value}`);
			});
		
		let animate = (v) => {
			this.Animations.parallel([
				this.Animations.timing(borderRadius, {toValue: v, duration: 200}),
				this.Animations.spring(pillHeight, {toValue: v, friction: 5})
			]).start();
		};
		
		let animate2 = (v) => {
			this.Animations.parallel([
				this.Animations.timing(pillOpacity, {toValue: v, duration: 200}),
			]).start();
		};

		divinner.addEventListener("mouseenter", () => {
			pillvisible = divpillitem.style.getPropertyValue("opacity") != 0;
			if (!guild || (this.CurrentGuildStore.getGuildId() != guild)) {
				animate(1);
				if (!pillvisible) animate2(1);
			}
		})
		divinner.addEventListener("mouseleave", () => {
			if (!guild || (this.CurrentGuildStore.getGuildId() != guild)) {
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
