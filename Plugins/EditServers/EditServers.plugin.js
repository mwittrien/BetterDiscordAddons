//META{"name":"EditServers"}*//

class EditServers {
	initConstructor () {
		this.labels = {};
		
		this.serverDragged = false;

		this.serverContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} localserversettings-item ${BDFDB.disCN.contextmenuitemsubmenu}">
					<span>REPLACE_context_localserversettings_text</span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;
			
		this.serverContextSubMenuMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} editservers-submenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} serversettings-item">
						<span>REPLACE_submenu_serversettings_text</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} resetsettings-item ${BDFDB.disCN.contextmenuitemdisabled}">
						<span>REPLACE_submenu_resetsettings_text</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>
			</div>`;

		this.serverSettingsModalMarkup =
			`<span class="editservers-modal DevilBro-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
								<div class="${BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">
									<h4 class="${BDFDB.disCNS.h4 + BDFDB.disCNS.headertitle + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.weightsemibold + BDFDB.disCNS.defaultcolor + BDFDB.disCNS.h4defaultmargin + BDFDB.disCN.marginreset}">REPLACE_modal_header_text</h4>
									<div class="${BDFDB.disCNS.modalguildname + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.primary}"></div>
								</div>
								<svg class="${BDFDB.disCNS.modalclose + BDFDB.disCN.flexchild}" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
									<g fill="none" fill-rule="evenodd">
										<path d="M0 0h12v12H0"></path>
										<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
									</g>
								</svg>
							</div>
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.marginbottom8 + BDFDB.disCN.modalsubinner}" style="flex: 0 0 auto;">
								<div tab="server" class="tab">REPLACE_modal_tabheader1_text</div>
								<div tab="icon" class="tab">REPLACE_modal_tabheader2_text</div>
								<div tab="tooltip" class="tab">REPLACE_modal_tabheader3_text</div>
							</div>
							<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner}">
									<div tab="server" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_servername_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-servername"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_servershortname_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-servershortname"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_serverurl_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-serverurl"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">REPLACE_modal_removeicon_text</h3>
											<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
												<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-removeicon">
											</div>
										</div>
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
	}

	getName () {return "EditServers";}

	getDescription () {return "Allows you to change the icon, name and color of servers.";}

	getVersion () {return "1.8.8";} 

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Reset all Servers.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".reset-button", () => {this.resetAll();});
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
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.nodeType == 1 && node.className.includes(BDFDB.disCN.contextmenu)) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.appmount, {name:"serverContextObserver",instance:observer}, {childList: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						var addedNodes = change.addedNodes;
						if (change.attributeName == "class" && change.oldValue && change.oldValue.indexOf(BDFDB.disCN.guildplaceholder) > -1)  addedNodes = [change.target];
						if (change.attributeName == "draggable" && change.oldValue && change.oldValue == "false")  addedNodes = [change.target.parentElement];
						if (addedNodes) {
							addedNodes.forEach((node) => {
								if (node && node.classList && node.classList.contains(BDFDB.disCN.guild) && !node.querySelector(BDFDB.dotCN.guildserror)) {
									var id = BDFDB.getIdOfServer(node);
									if (id) this.loadServer(BDFDB.getDivOfServer(id));
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.guilds, {name:"serverListObserver",instance:observer}, {childList: true, subtree:true, attributes:true, attributeFilte: ["class", "draggable"], attributeOldValue: true});
				
			setTimeout(() => {
				this.loadAllServers();
			},3000);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			document.querySelectorAll("[custom-editservers]").forEach(serverDiv => {this.resetServer(BDFDB.getIdOfServer(serverDiv));});
			
			BDFDB.unloadMessage(this);
		}
	}

	
	// begin of own functions

	resetAll () {
		if (confirm("Are you sure you want to reset all servers?")) {
			BDFDB.removeAllData(this, "servers");
			
			document.querySelectorAll("[custom-editservers]").forEach(serverDiv => {this.resetServer(BDFDB.getIdOfServer(serverDiv));});
		}
	}

	changeLanguageStrings () {
		this.serverContextEntryMarkup = 	this.serverContextEntryMarkup.replace("REPLACE_context_localserversettings_text", this.labels.context_localserversettings_text);
		
		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_submenu_serversettings_text", this.labels.submenu_serversettings_text);
		this.serverContextSubMenuMarkup = 	this.serverContextSubMenuMarkup.replace("REPLACE_submenu_resetsettings_text", this.labels.submenu_resetsettings_text);
		
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_servername_text", this.labels.modal_servername_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_servershortname_text", this.labels.modal_servershortname_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_serverurl_text", this.labels.modal_serverurl_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_removeicon_text", this.labels.modal_removeicon_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_tabheader1_text", this.labels.modal_tabheader1_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_tabheader2_text", this.labels.modal_tabheader2_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_tabheader3_text", this.labels.modal_tabheader3_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_colorpicker1_text", this.labels.modal_colorpicker1_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_colorpicker2_text", this.labels.modal_colorpicker2_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_colorpicker3_text", this.labels.modal_colorpicker3_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_modal_colorpicker4_text", this.labels.modal_colorpicker4_text);
		this.serverSettingsModalMarkup = 	this.serverSettingsModalMarkup.replace("REPLACE_btn_save_text", this.labels.btn_save_text);
	}
	
	onContextMenu (context) {
		if (!context || !context.tagName || !context.parentElement || context.querySelector(".localserversettings-item")) return;
		var info = BDFDB.getKeyInformation({"node":context, "key":"guild"});
		if (info && BDFDB.getKeyInformation({"node":context, "key":"displayName", "value":"GuildLeaveGroup"})) {
			$(context).append(this.serverContextEntryMarkup)
				.on("mouseenter", ".localserversettings-item", (e) => {
					this.createContextSubMenu(info, e, context);
				});
				
			BDFDB.updateContextPosition(context);
		}
	}
	
	createContextSubMenu (info, e, context) {
		var id = info.id;
		
		var serverContextSubMenu = $(this.serverContextSubMenuMarkup);
		
		serverContextSubMenu
			.on("click", ".serversettings-item", () => {
				$(context).hide();
				this.showServerSettings(info);
			});
			
		if (BDFDB.loadData(id, this, "servers")) {
			serverContextSubMenu
				.find(".resetsettings-item")
				.removeClass(BDFDB.disCN.contextmenuitemdisabled)
				.on("click", () => {
					$(context).hide();
					this.removeServerData(info.id);
				});
		}
		
		BDFDB.appendSubMenu(e.currentTarget, serverContextSubMenu);
	}
	
	showServerSettings (info) {
		var data = BDFDB.loadData(info.id, this, "servers");
		
		var name = 			data ? data.name : null;
		var shortName = 	data ? data.shortName : null;
		var url = 			data ? data.url : null;
		var removeIcon = 	data ? data.removeIcon : false;
		var color1 = 		data ? data.color1 : null;
		var color2 = 		data ? data.color2 : null;
		var color3 = 		data ? data.color3 : null;
		var color4 = 		data ? data.color4 : null;
		
		var serverSettingsModal = $(this.serverSettingsModalMarkup);
		serverSettingsModal.find(BDFDB.dotCN.modalguildname).text(info.name);
		serverSettingsModal.find("#input-servername").val(name);
		serverSettingsModal.find("#input-servername").attr("placeholder", info.name);
		serverSettingsModal.find("#input-servershortname").val(shortName ? shortName : (info.icon ? "" : info.acronym));
		serverSettingsModal.find("#input-servershortname").attr("placeholder", info.acronym);
		serverSettingsModal.find("#input-serverurl").val(url);
		serverSettingsModal.find("#input-serverurl").attr("placeholder", info.icon ? "https://cdn.discordapp.com/icons/" + info.id + "/" + info.icon + ".png" : null);
		serverSettingsModal.find("#input-serverurl").addClass(url ? "valid" : "");
		serverSettingsModal.find("#input-serverurl").prop("disabled", removeIcon);
		serverSettingsModal.find("#input-removeicon").prop("checked", removeIcon);
		BDFDB.setColorSwatches(serverSettingsModal, color1);
		BDFDB.setColorSwatches(serverSettingsModal, color2);
		BDFDB.setColorSwatches(serverSettingsModal, color3);
		BDFDB.setColorSwatches(serverSettingsModal, color4);
		BDFDB.appendModal(serverSettingsModal);
		serverSettingsModal
			.on("click", "#input-removeicon", (event) => {
				serverSettingsModal.find("#input-serverurl").prop("disabled", event.target.checked);
			})
			.on("change keyup paste", "#input-serverurl", (event) => {
				this.checkUrl(serverSettingsModal, event);
			})
			.on("mouseenter", "#input-serverurl", (event) => {
				$(event.target).addClass("hovering");
				this.createNoticeTooltip(event);
			})
			.on("mouseleave", "#input-serverurl", (event) => {
				$(BDFDB.dotCN.tooltips).find(".notice-tooltip").remove();
				$(event.target).removeClass("hovering");
			})
			.on("click", ".btn-save", (event) => {
				event.preventDefault();
				
				name = null;
				if (serverSettingsModal.find("#input-servername").val()) {
					if (serverSettingsModal.find("#input-servername").val().trim().length > 0) {
						name = serverSettingsModal.find("#input-servername").val().trim();
					}
				}
				
				shortName = null;
				if (serverSettingsModal.find("#input-servershortname").val()) {
					if (serverSettingsModal.find("#input-servershortname").val().trim().length > 0) {
						shortName = serverSettingsModal.find("#input-servershortname").val().trim();
						shortName = shortName == info.acronym ? null : shortName;
					}
				}
				
				removeIcon = serverSettingsModal.find("#input-removeicon").prop("checked");
				if (serverSettingsModal.find("#input-serverurl:not('.invalid')").length > 0) {
					url = null;
					if (!removeIcon && serverSettingsModal.find("#input-serverurl").val()) {
						if (serverSettingsModal.find("#input-serverurl").val().trim().length > 0) {
							url = serverSettingsModal.find("#input-serverurl").val().trim();
						}
					}
				}
				
				color1 = BDFDB.getSwatchColor(serverSettingsModal, 1);
				color2 = BDFDB.getSwatchColor(serverSettingsModal, 2);
				color3 = BDFDB.getSwatchColor(serverSettingsModal, 3);
				color4 = BDFDB.getSwatchColor(serverSettingsModal, 4);
				
				if (name == null && shortName == null && url == null && !removeIcon && color1 == null && color2 == null && color3 == null && color4 == null) {
					this.removeServerData(info.id);
				}
				else {
					BDFDB.saveData(info.id, {name,shortName,url,removeIcon,color1,color2,color3,color4}, this, "servers");
					this.loadServer(BDFDB.getDivOfServer(info.id));
				}
			});
		serverSettingsModal.find("#input-servername").focus();
	}
	
	checkUrl (modal, e) {
		if (!e.target.value) {
			$(e.target)
				.removeClass("valid")
				.removeClass("invalid");
			if ($(e.target).hasClass("hovering")) $(BDFDB.dotCN.tooltips).find(".notice-tooltip").remove();
		}
		else {
			let request = require("request");
			request(e.target.value, (error, response, result) => {
				if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") != -1) {
					$(e.target)
						.removeClass("invalid")
						.addClass("valid");
				}
				else {
					$(e.target)
						.removeClass("valid")
						.addClass("invalid");
				}
				if ($(e.target).hasClass("hovering")) this.createNoticeTooltip(e);
			});
		}
	}
	
	createNoticeTooltip (e) {
		$(BDFDB.dotCN.tooltips).find(".notice-tooltip").remove();
		
		var input = e.currentTarget;
		var disabled = input.disabled;
		var valid = input.classList.contains("valid");
		var invalid = input.classList.contains("invalid");
		if (disabled || valid || invalid) {
			var text = disabled ? this.labels.modal_ignoreurl_text : valid ? this.labels.modal_validurl_text : this.labels.modal_invalidurl_text;
			var bgColor = disabled ? "#282524" : valid ? "#297828" : "#8C2528";
			var customTooltipCSS = `
				body .notice-tooltip {
					background-color: ${bgColor} !important;
				}
				body .notice-tooltip:after {
					border-right-color: ${bgColor} !important;
				}`;
			BDFDB.createTooltip(text, input, {type:"right",selector:"notice-tooltip",css:customTooltipCSS});
		}
	}
	
	removeServerData (id) {
		this.resetServer(id);
		
		BDFDB.removeData(id, this, "servers");
	}
	
	resetServer (id) {
		let serverObj = BDFDB.getDivOfServer(id);
		if (typeof serverObj !== "object" || !serverObj) return;
		$(serverObj.div)
			.off("mouseenter." + this.getName())
			.removeAttr("custom-editservers")
			.find(BDFDB.dotCN.avataricon)
				.text(serverObj.icon ? "" : serverObj.data.acronym)
				.toggleClass(BDFDB.disCN.avatarnoicon, !serverObj.icon)
				.css("font-size", !serverObj.icon ? "10px" : "")
				.css("background-image", serverObj.icon ? "url('https://cdn.discordapp.com/icons/" + serverObj.id + "/" + serverObj.icon + ".png')" : "")
				.css("background-color", "")
				.css("color", "");
	}
	
	loadServer (serverObj) {
		if (typeof serverObj !== "object" || !serverObj) return;
		var data = BDFDB.loadData(serverObj.id, this, "servers");
		if (data) {
			var name = data.name ? data.name : serverObj.name;
			var bgImage = data.url ? ("url(" + data.url + ")") : (serverObj.icon ? "url('https://cdn.discordapp.com/icons/" + serverObj.id + "/" + serverObj.icon + ".png')" : "");
			var removeIcon = data.removeIcon;
			var shortName = data.shortName ? data.shortName : (serverObj.icon && !removeIcon ? "" : serverObj.data.acronym);
			var color1 = data.color1 ? BDFDB.colorCONVERT(data.color1, "RGB") : "";
			var color2 = data.color2 ? BDFDB.colorCONVERT(data.color2, "RGB") : "";
			$(serverObj.div)
				.off("mouseenter." + this.getName())
				.on("mouseenter." + this.getName(), () => {this.createServerToolTip(serverObj);})
				.attr("custom-editservers", true)
				.find(BDFDB.dotCN.avataricon)
					.text(bgImage && !removeIcon ? "" : shortName)
					.addClass(removeIcon || !bgImage ? BDFDB.disCN.avatarnoicon : "")
					.removeClass(!removeIcon && bgImage ? BDFDB.disCN.avatarnoicon : "")
					.css("font-size", removeIcon || !bgImage ? "10px" : "")
					.css("background-image", removeIcon ? "" : bgImage)
					.css("background-color", color1)
					.css("color", color2);
		}
	}
	
	loadAllServers () {
		var serverObjs = BDFDB.readServerList();
		for (var i = 0; i < serverObjs.length; i++) {
			this.loadServer(serverObjs[i]);
		}
	}
	
	createServerToolTip (serverObj) {
		var data = BDFDB.loadData(serverObj.id, this, "servers");
		if (data) {
			var text = data.name ? data.name : serverObj.name;
			var bgColor = data.color3 ? BDFDB.colorCONVERT(data.color3, "RGB") : "";
			var fontColor = data.color4 ? BDFDB.colorCONVERT(data.color4, "RGB") : "";
			var customTooltipCSS = `
				body ${BDFDB.dotCN.tooltip}:not(.guild-custom-tooltip) {
					display: none !important;
				}
				body .guild-custom-tooltip {
					color: ${fontColor} !important;
					background-color: ${bgColor} !important;
				}
				body .guild-custom-tooltip:after {
					border-right-color: ${bgColor} !important;
				}`;
				
			BDFDB.createTooltip(text, serverObj.div, {type:"right",selector:"guild-custom-tooltip",css:customTooltipCSS});
		}
	}
	
	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					context_localserversettings_text:	"Lokalne postavke poslužitelja",
					submenu_serversettings_text:		"Promijeni postavke",
					submenu_resetsettings_text:			"Ponovno postavite poslužitelj",
					modal_header_text:					"Lokalne postavke poslužitelja",
					modal_servername_text:				"Naziv lokalnog poslužitelja",
					modal_servershortname_text:			"Poslužitelj prečaca",
					modal_serverurl_text:				"Ikona",
					modal_removeicon_text:				"Ukloni ikonu",
					modal_tabheader1_text:				"Poslužitelja",
					modal_tabheader2_text:				"Boja ikona",
					modal_tabheader3_text:				"Boja tooltip",
					modal_colorpicker1_text:			"Boja ikona",
					modal_colorpicker2_text:			"Boja fonta",
					modal_colorpicker3_text:			"Boja tooltip",
					modal_colorpicker4_text:			"Boja fonta",
					modal_ignoreurl_text:				"URL ignorirati",
					modal_validurl_text:				"Vrijedi URL",
					modal_invalidurl_text:				"Nevažeći URL",
					btn_cancel_text:					"Prekid",
					btn_save_text:						"Uštedjeti"
				};
			case "da":		//danish
				return {
					context_localserversettings_text:	"Lokal serverindstillinger",
					submenu_serversettings_text:		"Skift indstillinger",
					submenu_resetsettings_text:			"Nulstil server",
					modal_header_text:	 				"Lokal serverindstillinger",
					modal_servername_text:				"Lokalt servernavn",
					modal_servershortname_text:			"Initialer",
					modal_serverurl_text:				"Ikon",
					modal_removeicon_text:				"Fjern ikon",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Ikonfarve",
					modal_tabheader3_text:				"Tooltipfarve",
					modal_colorpicker1_text:			"Ikonfarve",
					modal_colorpicker2_text:			"Skriftfarve",
					modal_colorpicker3_text:			"Tooltipfarve",
					modal_colorpicker4_text:			"Skriftfarve",
					modal_ignoreurl_text:				"Ignorer URL",
					modal_validurl_text:				"Gyldig URL",
					modal_invalidurl_text:				"Ugyldig URL",
					btn_cancel_text:					"Afbryde",
					btn_save_text:						"Spare"
				};
			case "de":		//german
				return {
					context_localserversettings_text:	"Lokale Servereinstellungen",
					submenu_serversettings_text:		"Einstellungen ändern",
					submenu_resetsettings_text:			"Server zurücksetzen",
					modal_header_text:					"Lokale Servereinstellungen",
					modal_servername_text:				"Lokaler Servername",
					modal_servershortname_text:			"Serverkürzel",
					modal_serverurl_text:				"Icon",
					modal_removeicon_text:				"Entferne Icon",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Iconfarbe",
					modal_tabheader3_text:				"Tooltipfarbe",
					modal_colorpicker1_text:			"Iconfarbe",
					modal_colorpicker2_text:			"Schriftfarbe",
					modal_colorpicker3_text:			"Tooltipfarbe",
					modal_colorpicker4_text:			"Schriftfarbe",
					modal_ignoreurl_text:				"URL ignorieren",
					modal_validurl_text:				"Gültige URL",
					modal_invalidurl_text:				"Ungültige URL",
					btn_cancel_text:					"Abbrechen",
					btn_save_text:						"Speichern"
				};
			case "es":		//spanish
				return {
					context_localserversettings_text:	"Ajustes local de servidor",
					submenu_serversettings_text:		"Cambiar ajustes",
					submenu_resetsettings_text:			"Restablecer servidor",
					modal_header_text:					"Ajustes local de servidor",
					modal_servername_text:				"Nombre local del servidor",
					modal_servershortname_text:			"Iniciales",
					modal_serverurl_text:				"Icono",
					modal_removeicon_text:				"Eliminar icono",
					modal_tabheader1_text:				"Servidor",
					modal_tabheader2_text:				"Color del icono",
					modal_tabheader3_text:				"Color de tooltip",
					modal_colorpicker1_text:			"Color del icono",
					modal_colorpicker2_text:			"Color de fuente",
					modal_colorpicker3_text:			"Color de tooltip",
					modal_colorpicker4_text:			"Color de fuente",
					modal_ignoreurl_text:				"Ignorar URL",
					modal_validurl_text:				"URL válida",
					modal_invalidurl_text:				"URL inválida",
					btn_cancel_text:					"Cancelar",
					btn_save_text:						"Guardar"
				};
			case "fr":		//french
				return {
					context_localserversettings_text:	"Paramètres locale du serveur",
					submenu_serversettings_text:		"Modifier les paramètres",
					submenu_resetsettings_text:			"Réinitialiser le serveur",
					modal_header_text:					"Paramètres locale du serveur",
					modal_servername_text:				"Nom local du serveur",
					modal_servershortname_text:			"Initiales",
					modal_serverurl_text:				"Icône",
					modal_removeicon_text:				"Supprimer l'icône",
					modal_tabheader1_text:				"Serveur",
					modal_tabheader2_text:				"Couleur de l'icône",
					modal_tabheader3_text:				"Couleur de tooltip",
					modal_colorpicker1_text:			"Couleur de l'icône",
					modal_colorpicker2_text:			"Couleur de la police",
					modal_colorpicker3_text:			"Couleur de tooltip",
					modal_colorpicker4_text:			"Couleur de la police",
					modal_ignoreurl_text:				"Ignorer l'URL",
					modal_validurl_text:				"URL valide",
					modal_invalidurl_text:				"URL invalide",
					btn_cancel_text:					"Abandonner",
					btn_save_text:						"Enregistrer"
				};
			case "it":		//italian
				return {
					context_localserversettings_text:	"Impostazioni locale server",
					submenu_serversettings_text:		"Cambia impostazioni",
					submenu_resetsettings_text:			"Ripristina server",
					modal_header_text:					"Impostazioni locale server",
					modal_servername_text:				"Nome locale server",
					modal_servershortname_text:			"Iniziali",
					modal_serverurl_text:				"Icona",
					modal_removeicon_text:				"Rimuova l'icona",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Colore dell'icona",
					modal_tabheader3_text:				"Colore della tooltip",
					modal_colorpicker1_text:			"Colore dell'icona",
					modal_colorpicker2_text:			"Colore del carattere",
					modal_colorpicker3_text:			"Colore della tooltip",
					modal_colorpicker4_text:			"Colore del carattere",
					modal_ignoreurl_text:				"Ignora l'URL",
					modal_validurl_text:				"URL valido",
					modal_invalidurl_text:				"URL non valido",
					btn_cancel_text:					"Cancellare",
					btn_save_text:						"Salvare"
				};
			case "nl":		//dutch
				return {
					context_localserversettings_text:	"Lokale serverinstellingen",
					submenu_serversettings_text:		"Verandere instellingen",
					submenu_resetsettings_text:			"Reset server",
					modal_header_text:					"Lokale serverinstellingen",
					modal_servername_text:				"Lokale servernaam",
					modal_servershortname_text:			"Initialen",
					modal_serverurl_text:				"Icoon",
					modal_removeicon_text:				"Verwijder icoon",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Icoonkleur",
					modal_tabheader3_text:				"Tooltipkleur",
					modal_colorpicker1_text:			"Icoonkleur",
					modal_colorpicker2_text:			"Doopvontkleur",
					modal_colorpicker3_text:			"Tooltipkleur",
					modal_colorpicker4_text:			"Doopvontkleur",
					modal_ignoreurl_text:				"URL negeren",
					modal_validurl_text:				"Geldige URL",
					modal_invalidurl_text:				"Ongeldige URL",
					btn_cancel_text:					"Afbreken",
					btn_save_text:						"Opslaan"
				};
			case "no":		//norwegian
				return {
					context_localserversettings_text:	"Lokal serverinnstillinger",
					submenu_serversettings_text:		"Endre innstillinger",
					submenu_resetsettings_text:			"Tilbakestill server",
					modal_header_text:					"Lokal serverinnstillinger",
					modal_servername_text:				"Lokalt servernavn",
					modal_servershortname_text:			"Initialer",
					modal_serverurl_text:				"Ikon",
					modal_removeicon_text:				"Fjern ikon",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Ikonfarge",
					modal_tabheader3_text:				"Tooltipfarge",
					modal_colorpicker1_text:			"Ikonfarge",
					modal_colorpicker2_text:			"Skriftfarge",
					modal_colorpicker3_text:			"Tooltipfarge",
					modal_colorpicker4_text:			"Skriftfarge",
					modal_ignoreurl_text:				"Ignorer URL",
					modal_validurl_text:				"Gyldig URL",
					modal_invalidurl_text:				"Ugyldig URL",
					btn_cancel_text:					"Avbryte",
					btn_save_text:						"Lagre"
				};
			case "pl":		//polish
				return {
					context_localserversettings_text:	"Lokalne ustawienia serwera",
					submenu_serversettings_text:		"Zmień ustawienia",
					submenu_resetsettings_text:				"Resetuj ustawienia",
					modal_header_text:					"Lokalne ustawienia serwera",
					modal_servername_text:				"Lokalna nazwa serwera",
					modal_servershortname_text:				"Krótka nazwa",
					modal_serverurl_text:				"Ikona",
					modal_removeicon_text:				"Usuń ikonę",
					modal_tabheader1_text:				"Serwer",
					modal_tabheader2_text:				"Kolor ikony",
					modal_tabheader3_text:				"Kolor podpowiedzi",
					modal_colorpicker1_text:			"Kolor ikony",
					modal_colorpicker2_text:			"Kolor czcionki",
					modal_colorpicker3_text:			"Kolor podpowiedzi",
					modal_colorpicker4_text:			"Kolor czcionki",
					modal_ignoreurl_text:				"Ignoruj URL",
					modal_validurl_text:				"Prawidłowe URL",
					modal_invalidurl_text:				"Nieprawidłowe URL",
					btn_cancel_text:					"Anuluj",
					btn_save_text:						"Zapisz"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_localserversettings_text:	"Configurações local do servidor",
					submenu_serversettings_text:		"Mudar configurações",
					submenu_resetsettings_text:			"Redefinir servidor",
					modal_header_text:					"Configurações local do servidor",
					modal_servername_text:				"Nome local do servidor",
					modal_servershortname_text:			"Iniciais",
					modal_serverurl_text:				"Icone",
					modal_removeicon_text:				"Remover ícone",
					modal_tabheader1_text:				"Servidor",
					modal_tabheader2_text:				"Cor do ícone",
					modal_tabheader3_text:				"Cor da tooltip",
					modal_colorpicker1_text:			"Cor do ícone",
					modal_colorpicker2_text:			"Cor da fonte",
					modal_colorpicker3_text:			"Cor da tooltip",
					modal_colorpicker4_text:			"Cor da fonte",
					modal_ignoreurl_text:				"Ignorar URL",
					modal_validurl_text:				"URL válido",
					modal_invalidurl_text:				"URL inválida",
					btn_cancel_text:					"Cancelar",
					btn_save_text:						"Salvar"
				};
			case "fi":		//finnish
				return {
					context_localserversettings_text:	"Paikallinen palvelimen asetukset",
					submenu_serversettings_text:		"Vaihda asetuksia",
					submenu_resetsettings_text:			"Nollaa palvelimen",
					modal_header_text:					"Paikallinen palvelimen asetukset",
					modal_servername_text:				"Paikallinen palvelimenimi",
					modal_servershortname_text:			"Nimikirjaimet",
					modal_serverurl_text:				"Ikonin",
					modal_removeicon_text:				"Poista kuvake",
					modal_tabheader1_text:				"Palvelimen",
					modal_tabheader2_text:				"Ikoninväri",
					modal_tabheader3_text:				"Tooltipväri",
					modal_colorpicker1_text:			"Ikoninväri",
					modal_colorpicker2_text:			"Fontinväri",
					modal_colorpicker3_text:			"Tooltipväri",
					modal_colorpicker4_text:			"Fontinväri",
					modal_ignoreurl_text:				"Ohita URL",
					modal_validurl_text:				"Voimassa URL",
					modal_invalidurl_text:				"Virheellinen URL",
					btn_cancel_text:					"Peruuttaa",
					btn_save_text:						"Tallentaa"
				};
			case "sv":		//swedish
				return {
					context_localserversettings_text:	"Lokal serverinställningar",
					submenu_serversettings_text:		"Ändra inställningar",
					submenu_resetsettings_text:			"Återställ server",
					modal_header_text:					"Lokal serverinställningar",
					modal_servername_text:				"Lokalt servernamn",
					modal_servershortname_text:			"Initialer",
					modal_serverurl_text:				"Ikon",
					modal_removeicon_text:				"Ta bort ikonen",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Ikonfärg",
					modal_tabheader3_text:				"Tooltipfärg",
					modal_colorpicker1_text:			"Ikonfärg",
					modal_colorpicker2_text:			"Fontfärg",
					modal_colorpicker3_text:			"Tooltipfärg",
					modal_colorpicker4_text:			"Fontfärg",
					modal_ignoreurl_text:				"Ignorera URL",
					modal_validurl_text:				"Giltig URL",
					modal_invalidurl_text:				"Ogiltig URL",
					btn_cancel_text:					"Avbryta",
					btn_save_text:						"Spara"
				};
			case "tr":		//turkish
				return {
					context_localserversettings_text:	"Yerel Sunucu Ayarları",
					submenu_serversettings_text:		"Ayarları Değiştir",
					submenu_resetsettings_text:			"Sunucu Sıfırla",
					modal_header_text:					"Yerel Sunucu Ayarları",
					modal_servername_text:				"Yerel Sunucu Adı",
					modal_servershortname_text:			"Baş harfleri",
					modal_serverurl_text:				"Simge",
					modal_removeicon_text:				"Simge kaldır",
					modal_tabheader1_text:				"Sunucu",
					modal_tabheader2_text:				"Simge rengi",
					modal_tabheader3_text:				"Tooltip rengi",
					modal_colorpicker1_text:			"Simge rengi",
					modal_colorpicker2_text:			"Yazı rengi",
					modal_colorpicker3_text:			"Tooltip rengi",
					modal_colorpicker4_text:			"Yazı rengi",
					modal_ignoreurl_text:				"URL yoksay",
					modal_validurl_text:				"Geçerli URL",
					modal_invalidurl_text:				"Geçersiz URL",
					btn_cancel_text:					"Iptal",
					btn_save_text:						"Kayıt"
				};
			case "cs":		//czech
				return {
					context_localserversettings_text:	"Místní nastavení serveru",
					submenu_serversettings_text:		"Změnit nastavení",
					submenu_resetsettings_text:			"Obnovit server",
					modal_header_text:					"Místní nastavení serveru",
					modal_servername_text:				"Místní název serveru",
					modal_servershortname_text:			"Iniciály",
					modal_serverurl_text:				"Ikony",
					modal_removeicon_text:				"Odstranit ikonu",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Barva ikony",
					modal_tabheader3_text:				"Barva tooltip",
					modal_colorpicker1_text:			"Barva ikony",
					modal_colorpicker2_text:			"Barva fontu",
					modal_colorpicker3_text:			"Barva tooltip",
					modal_colorpicker4_text:			"Barva fontu",
					modal_ignoreurl_text:				"Ignorovat URL",
					modal_validurl_text:				"Platná URL",
					modal_invalidurl_text:				"Neplatná URL",
					btn_cancel_text:					"Zrušení",
					btn_save_text:						"Uložit"
				};
			case "bg":		//bulgarian
				return {
					context_localserversettings_text:	"Настройки за локални cървър",
					submenu_serversettings_text:		"Промяна на настройките",
					submenu_resetsettings_text:			"Възстановяване на cървър",
					modal_header_text:					"Настройки за локални cървър",
					modal_servername_text:				"Локално име на cървър",
					modal_servershortname_text:			"Инициали",
					modal_serverurl_text:				"Икона",
					modal_removeicon_text:				"Премахване на иконата",
					modal_tabheader1_text:				"Cървър",
					modal_tabheader2_text:				"Цвят на иконата",
					modal_tabheader3_text:				"Цвят на подсказка",
					modal_colorpicker1_text:			"Цвят на иконата",
					modal_colorpicker2_text:			"Цвят на шрифта",
					modal_colorpicker3_text:			"Цвят на подсказка",
					modal_colorpicker4_text:			"Цвят на шрифта",
					modal_ignoreurl_text:				"Игнориране на URL",
					modal_validurl_text:				"Валиден URL",
					modal_invalidurl_text:				"Невалиден URL",
					btn_cancel_text:					"Зъбести",
					btn_save_text:						"Cпасяване"
				};
			case "ru":		//russian
				return {
					context_localserversettings_text:	"Настройки локального cервер",
					submenu_serversettings_text:		"Изменить настройки",
					submenu_resetsettings_text:			"Сбросить cервер",
					modal_header_text:					"Настройки локального cервер",
					modal_servername_text:				"Имя локального cервер",
					modal_servershortname_text:			"Инициалы",
					modal_serverurl_text:				"Значок",
					modal_removeicon_text:				"Удалить значок",
					modal_tabheader1_text:				"Cервер",
					modal_tabheader2_text:				"Цвет значков",
					modal_tabheader3_text:				"Цвет подсказка",
					modal_colorpicker1_text:			"Цвет значков",
					modal_colorpicker2_text:			"Цвет шрифта",
					modal_colorpicker3_text:			"Цвет подсказка",
					modal_colorpicker4_text:			"Цвет шрифта",
					modal_ignoreurl_text:				"Игнорировать URL",
					modal_validurl_text:				"Действительный URL",
					modal_invalidurl_text:				"Неверная URL",
					btn_cancel_text:					"Отмена",
					btn_save_text:						"Cпасти"
				};
			case "uk":		//ukrainian
				return {
					context_localserversettings_text:	"Налаштування локального cервер",
					submenu_serversettings_text:		"Змінити налаштування",
					submenu_resetsettings_text:			"Скидання cервер",
					modal_header_text:					"Налаштування локального cервер",
					modal_servername_text:				"Локальне ім'я cервер",
					modal_servershortname_text:			"Ініціали",
					modal_serverurl_text:				"Іконка",
					modal_removeicon_text:				"Видалити піктограму",
					modal_tabheader1_text:				"Cервер",
					modal_tabheader2_text:				"Колір ікони",
					modal_tabheader3_text:				"Колір підказка",
					modal_colorpicker1_text:			"Колір ікони",
					modal_colorpicker2_text:			"Колір шрифту",
					modal_colorpicker3_text:			"Колір підказка",
					modal_colorpicker4_text:			"Колір шрифту",
					modal_ignoreurl_text:				"Ігнорувати URL",
					modal_validurl_text:				"Дійсна URL",
					modal_invalidurl_text:				"Недійсна URL",
					btn_cancel_text:					"Скасувати",
					btn_save_text:						"Зберегти"
				};
			case "ja":		//japanese
				return {
					context_localserversettings_text:	"ローカルサーバー設定",
					submenu_serversettings_text:		"設定を変更する",
					submenu_resetsettings_text:			"サーバーをリセットする",
					modal_header_text:					"ローカルサーバー設定",
					modal_servername_text:				"ローカルサーバー名",
					modal_servershortname_text:			"イニシャル",
					modal_serverurl_text:				"アイコン",
					modal_removeicon_text:				"アイコンを削除",
					modal_tabheader1_text:				"サーバー",
					modal_tabheader2_text:				"アイコンの色",
					modal_tabheader3_text:				"ツールチップの色",
					modal_colorpicker1_text:			"アイコンの色",
					modal_colorpicker2_text:			"フォントの色",
					modal_colorpicker3_text:			"ツールチップの色",
					modal_colorpicker4_text:			"フォントの色",
					modal_ignoreurl_text:				"URL を無視する",
					modal_validurl_text:				"有効な URL",
					modal_invalidurl_text:				"無効な URL",
					btn_cancel_text:					"キャンセル",
					btn_save_text:						"セーブ"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_localserversettings_text:	"本地服務器設置",
					submenu_serversettings_text:		"更改設置",
					submenu_resetsettings_text:			"重置服務器",
					modal_header_text:					"本地服務器設置",
					modal_servername_text:				"服務器名稱",
					modal_servershortname_text:			"聲母",
					modal_serverurl_text:				"圖標",
					modal_removeicon_text:				"刪除圖標",
					modal_tabheader1_text:				"服務器",
					modal_tabheader2_text:				"圖標顏色",
					modal_tabheader3_text:				"工具提示顏色",
					modal_colorpicker1_text:			"圖標顏色",
					modal_colorpicker2_text:			"字體顏色",
					modal_colorpicker3_text:			"工具提示顏色",
					modal_colorpicker4_text:			"字體顏色",
					modal_ignoreurl_text:				"忽略 URL",
					modal_validurl_text:				"有效的 URL",
					modal_invalidurl_text:				"無效的 URL",
					btn_cancel_text:					"取消",
					btn_save_text:						"保存"
				};
			case "ko":		//korean
				return {
					context_localserversettings_text:	"로컬 서버 설정",
					submenu_serversettings_text:		"설정 변경",
					submenu_resetsettings_text:			"서버 재설정",
					modal_header_text:					"로컬 서버 설정",
					modal_servername_text:				"로컬 서버 이름",
					modal_servershortname_text:			"머리 글자",
					modal_serverurl_text:				"상",
					modal_removeicon_text:				"상 삭제",
					modal_tabheader1_text:				"서버",
					modal_tabheader2_text:				"상 색깔",
					modal_tabheader3_text:				"툴팁 색깔",
					modal_colorpicker1_text:			"상 색깔",
					modal_colorpicker2_text:			"글꼴 색깔",
					modal_colorpicker3_text:			"툴팁 색깔",
					modal_colorpicker4_text:			"글꼴 색깔",
					modal_ignoreurl_text:				"URL 무시",
					modal_validurl_text:				"유효한 URL",
					modal_invalidurl_text:				"잘못된 URL",
					btn_cancel_text:					"취소",
					btn_save_text:						"저장"
				};
			default:		//default: english
				return {
					context_localserversettings_text:	"Local Serversettings",
					submenu_serversettings_text:		"Change Settings",
					submenu_resetsettings_text:			"Reset Server",
					modal_header_text:					"Local Serversettings",
					modal_servername_text:				"Local Servername",
					modal_servershortname_text:			"Initials",
					modal_serverurl_text:				"Icon",
					modal_removeicon_text:				"Remove Icon",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Iconcolor",
					modal_tabheader3_text:				"Tooltipcolor",
					modal_colorpicker1_text:			"Iconcolor",
					modal_colorpicker2_text:			"Fontcolor",
					modal_colorpicker3_text:			"Tooltipcolor",
					modal_colorpicker4_text:			"Fontcolor",
					modal_ignoreurl_text:				"Ignore URL",
					modal_validurl_text:				"Valid URL",
					modal_invalidurl_text:				"Invalid URL",
					btn_cancel_text:					"Cancel",
					btn_save_text:						"Save"
				};
		}
	}
}
