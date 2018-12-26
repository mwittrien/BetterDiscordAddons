//META{"name":"EditUsers"}*//

class EditUsers {
	initConstructor () {
		this.labels = {}; 
		
		this.moduleTypes = {
			"ChannelTextArea":"componentDidMount",
			"NameTag":"componentDidMount",
			"AuditLog":"componentDidMount",
			"FluxContainer(TypingUsers)":"componentDidUpdate",
			"Popout":"componentDidMount",
			"DirectMessage":"componentDidMount",
			"CallAvatar":"componentDidMount",
			"PrivateChannel":"componentDidMount",
			"HeaderBar":["componentDidMount","componentDidUpdate"],
			"Clickable":"componentDidMount"
		};

		this.css = `
			${BDFDB.dotCN.bottag} {
				top: -4px;
				position: relative;
				margin-left: 1ch;
			}
			${BDFDB.dotCN.memberusername} ~ ${BDFDB.dotCN.bottag} {
				top: 0px;
			}
			${BDFDB.dotCN.messagegroupcompact} ${BDFDB.dotCN.bottag} {
				margin-right: 6px;
			}`;

		this.userContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} localusersettings-item ${BDFDB.disCN.contextmenuitemsubmenu}">
					<span>REPLACE_context_localusersettings_text</span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;
			
		this.userContextSubMenuMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} editusers-submenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} usersettings-item">
						<span>REPLACE_submenu_usersettings_text</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} resetsettings-item ${BDFDB.disCN.contextmenuitemdisabled}">
						<span>REPLACE_submenu_resetsettings_text</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>
			</div>`;
			
		this.userSettingsModalMarkup =
			`<span class="editusers-modal DevilBro-modal">
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
								<div tab="user" class="tab">REPLACE_modal_tabheader1_text</div>
								<div tab="name" class="tab">REPLACE_modal_tabheader2_text</div>
								<div tab="tag" class="tab">REPLACE_modal_tabheader3_text</div>
							</div>
							<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner}">
									<div tab="user" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_username_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-username"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_usertag_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-usertag"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_userurl_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-userurl"></div>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">REPLACE_modal_removeicon_text</h3>
											<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
												<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-removeicon">
											</div>
										</div>
									</div>
									<div tab="name" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker1_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker2_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
									</div>
									<div tab="tag" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} tab-content" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker3_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker4_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8} swatches" style="flex: 1 1 auto;"></div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">REPLACE_modal_ignoretagcolor_text</h3>
											<div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;">
												<input type="checkbox" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}" id="input-ignoretagcolor">
											</div>
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
	}

	getName () {return "EditUsers";}

	getDescription () {return "Allows you to change the icon, name, tag and color of users. Does not work in compact mode.";}

	getVersion () {return "3.1.0";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var settings = BDFDB.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Reset all Users.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".reset-button", () => {
				if (confirm("Are you sure you want to reset all users?")) {
					BDFDB.removeAllData(this, "users");
					this.forceAllUpdates();
				}
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
			
			for (let type in this.moduleTypes) {
				let module = BDFDB.WebModules.findByName(type);
				if (module && module.prototype) BDFDB.WebModules.patch(module.prototype, this.moduleTypes[type], this, {after: (e) => {this.initiateProcess(e.thisObject, type);}});
			}
			
			this.RelationshipUtils = BDFDB.WebModules.findByProperties("isBlocked", "isFriend");
			this.UserUtils = BDFDB.WebModules.findByProperties("getUsers","getUser");
			this.MemberUtils = BDFDB.WebModules.findByProperties("getMembers", "getMember");
			this.ChannelUtils = BDFDB.WebModules.findByProperties("getChannels","getChannel");
			this.LastGuildStore = BDFDB.WebModules.findByProperties("getLastSelectedGuildId");
			this.LastChannelStore = BDFDB.WebModules.findByProperties("getLastSelectedChannelId");
			
			this.forceAllUpdates();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDFDB === "object") {
			let data = BDFDB.loadAllData(this, "users");
			BDFDB.removeAllData(this, "users");
			this.forceAllUpdates();
			BDFDB.saveAllData(data, this, "users");
			
			BDFDB.unloadMessage(this);
		}
	}

	
	// begin of own functions

	changeLanguageStrings () {
		this.userContextEntryMarkup =		this.userContextEntryMarkup.replace("REPLACE_context_localusersettings_text", this.labels.context_localusersettings_text);
		
		this.userContextSubMenuMarkup =		this.userContextSubMenuMarkup.replace("REPLACE_submenu_usersettings_text", this.labels.submenu_usersettings_text);
		this.userContextSubMenuMarkup =		this.userContextSubMenuMarkup.replace("REPLACE_submenu_resetsettings_text", this.labels.submenu_resetsettings_text);
		
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_username_text", this.labels.modal_username_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_usertag_text", this.labels.modal_usertag_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_userurl_text", this.labels.modal_userurl_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_removeicon_text", this.labels.modal_removeicon_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_ignoretagcolor_text", this.labels.modal_ignoretagcolor_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_tabheader1_text", this.labels.modal_tabheader1_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_tabheader2_text", this.labels.modal_tabheader2_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_tabheader3_text", this.labels.modal_tabheader3_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker1_text", this.labels.modal_colorpicker1_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker2_text", this.labels.modal_colorpicker2_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker3_text", this.labels.modal_colorpicker3_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_modal_colorpicker4_text", this.labels.modal_colorpicker4_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_btn_cancel_text", this.labels.btn_cancel_text);
		this.userSettingsModalMarkup =		this.userSettingsModalMarkup.replace("REPLACE_btn_save_text", this.labels.btn_save_text);
	}
	
	onUserContextMenu (instance, menu) {
		if (instance.props && instance.props.user && !menu.querySelector(".localusersettings-item")) {
			$(menu).append(this.userContextEntryMarkup)
				.on("mouseenter", ".localusersettings-item", (e) => {
					var userContextSubMenu = $(this.userContextSubMenuMarkup);
					userContextSubMenu
						.on("click", ".usersettings-item", () => {
							$(menu).hide();
							this.showUserSettings(instance.props.user);
						});
					if (BDFDB.loadData(instance.props.user.id, this, "users")) {
						userContextSubMenu
							.find(".resetsettings-item")
							.removeClass(BDFDB.disCN.contextmenuitemdisabled)
							.on("click", () => {
								$(menu).hide();
								BDFDB.removeData(instance.props.user.id, this, "users");
								this.forceAllUpdates();
							});
					}
					BDFDB.appendSubMenu(e.currentTarget, userContextSubMenu);
				});
		}
	}
	
	showUserSettings (info, e) {
		var data = BDFDB.loadData(info.id, this, "users");
		
		var name =				data ? data.name : null;
		var tag =				data ? data.tag : null;
		var url =				data ? data.url : null;
		var removeIcon =		data ? data.removeIcon : false;
		var ignoreTagColor =	data ? data.ignoreTagColor : false;
		var color1 =			data ? data.color1 : null;
		var color2 =			data ? data.color2 : null;
		var color3 =			data ? data.color3 : null;
		var color4 =			data ? data.color4 : null;
		
		var member = this.MemberUtils.getMember(this.LastGuildStore.getGuildId(), info.id) ;
		
		var userSettingsModal = $(this.userSettingsModalMarkup);
		userSettingsModal.find(BDFDB.dotCN.modalguildname).text(member && member.nick ? member.nick : info.username);
		userSettingsModal.find("#input-username").val(name);
		userSettingsModal.find("#input-username").attr("placeholder", member && member.nick ? member.nick : info.username);
		userSettingsModal.find("#input-usertag").val(tag);
		userSettingsModal.find("#input-userurl").val(url);
		userSettingsModal.find("#input-userurl").attr("placeholder", BDFDB.getUserAvatar(info.id));
		userSettingsModal.find("#input-userurl").addClass(url ? "valid" : "");
		userSettingsModal.find("#input-userurl").prop("disabled", removeIcon);
		userSettingsModal.find("#input-removeicon").prop("checked", removeIcon);
		userSettingsModal.find(".swatches[swatchnr='3'], .swatches[swatchnr='4']").toggleClass("disabled", ignoreTagColor);
		userSettingsModal.find("#input-ignoretagcolor").prop("checked", ignoreTagColor);
		BDFDB.setColorSwatches(userSettingsModal, color1);
		BDFDB.setColorSwatches(userSettingsModal, color2);
		BDFDB.setColorSwatches(userSettingsModal, color3);
		BDFDB.setColorSwatches(userSettingsModal, color4);
		BDFDB.appendModal(userSettingsModal);
		userSettingsModal
			.on("click", "#input-removeicon", (event) => {
				userSettingsModal.find("#input-userurl").prop("disabled", event.currentTarget.checked);
			})
			.on("click", "#input-ignoretagcolor", (event) => {
				userSettingsModal.find(".swatches[swatchnr='3'], .swatches[swatchnr='4']").toggleClass("disabled", event.currentTarget.checked);
			})
			.on("change keyup paste", "#input-userurl", (event) => {
				this.checkUrl(userSettingsModal, event);
			})
			.on("mouseenter", "#input-userurl", (event) => {
				$(event.target).addClass("hovering");
				this.createNoticeTooltip(event);
			})
			.on("mouseleave", "#input-userurl", (event) => {
				$(BDFDB.dotCN.tooltips).find(".notice-tooltip").remove();
				$(event.target).removeClass("hovering");
			})
			.on("click", ".btn-save", (event) => {
				event.preventDefault();
				
				removeIcon = userSettingsModal.find("#input-removeicon").prop("checked");
				ignoreTagColor = userSettingsModal.find("#input-ignoretagcolor").prop("checked");
				
				name = null;
				if (userSettingsModal.find("#input-username").val()) {
					if (userSettingsModal.find("#input-username").val().trim().length > 0) {
						name = userSettingsModal.find("#input-username").val().trim();
					}
				}
				
				tag = null;
				if (userSettingsModal.find("#input-usertag").val()) {
					if (userSettingsModal.find("#input-usertag").val().trim().length > 0) {
						tag = userSettingsModal.find("#input-usertag").val().trim();
					}
				}
				
				if (userSettingsModal.find("#input-userurl:not('.invalid')").length > 0) {
					url = null;
					if (!removeIcon && userSettingsModal.find("#input-userurl").val()) {
						if (userSettingsModal.find("#input-userurl").val().trim().length > 0) {
							url = userSettingsModal.find("#input-userurl").val().trim();
						}
					}
				}
				
				color1 = BDFDB.getSwatchColor(userSettingsModal, 1);
				color2 = BDFDB.getSwatchColor(userSettingsModal, 2);
				color3 = BDFDB.getSwatchColor(userSettingsModal, 3);
				color4 = BDFDB.getSwatchColor(userSettingsModal, 4);
				
				if (name == null && tag == null && url == null && !removeIcon && !ignoreTagColor && color1 == null && color2 == null && color3 == null && color4 == null) {
					BDFDB.removeData(info.id, this, "users")
				}
				else {
					BDFDB.saveData(info.id, {name,tag,url,removeIcon,ignoreTagColor,color1,color2,color3,color4}, this, "users");
				}
				this.forceAllUpdates();
			});
		userSettingsModal.find("#input-username").focus();
	}
	
	checkUrl (modal, e) {
		if (!e.target.value) {
			$(e.target)
				.removeClass("valid")
				.removeClass("invalid");
			if ($(e.target).hasClass("hovering")) $(BDFDB.dotCNS.tooltips + ".notice-tooltip").remove();
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
			BDFDB.createTooltip(text, input, {type:"right",selector:"notice-tooltip",style:`background-color: ${bgColor} !important; border-color: ${bgColor} !important;`});
		}
	}
	
	initiateProcess (instance, type) {
		type = type.replace(/[^A-z]/g,"");
		type = type[0].toUpperCase() + type.slice(1);
		if (typeof this["process" + type] == "function") {
			let wrapper = BDFDB.React.findDOMNodeSafe(instance);
			if (wrapper) this["process" + type](instance, wrapper);
			else setImmediate(() => {
				this["process" + type](instance, BDFDB.React.findDOMNodeSafe(instance));
			});
		}
	}
	
	processChannelTextArea (instance, wrapper) {
		if (!wrapper) return;
		if (instance.props && instance.props.type == "normal" && instance.props.channel && instance.props.channel.type == 1) {
			let user = this.UserUtils.getUser(instance.props.channel.recipients[0]);
			if (user) {
				let data = BDFDB.loadData(user.id, this, "users") || {};
				wrapper.querySelector("textarea").setAttribute("placeholder", BDFDB.LanguageStrings.TEXTAREA_PLACEHOLDER.replace("{{channel}}", "@" + (data.name || user.username)));
			}
		}
	}
	
	processNameTag (instance, wrapper) {
		if (!wrapper) return;
		let username = wrapper.parentElement.querySelector("." + (wrapper.classList && wrapper.classList.contains(BDFDB.disCN.userpopoutheadertagwithnickname) ? BDFDB.disCN.userpopoutheadernickname : instance.props.usernameClass).replace(/ /g, "."));
		this.changeName(instance.props.user, username);
		this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
		this.addTag(instance.props.user, username.parentElement, (instance.props.botClass ? (" " + instance.props.botClass) : "") + " " + BDFDB.disCN.bottagnametag);
	}
	
	processPopout (instance, wrapper) {
		if (!wrapper) return;
		let fiber = instance._reactInternalFiber;
		if (fiber.return && fiber.return.memoizedProps && fiber.return.memoizedProps.message) {
			let username = wrapper.querySelector(BDFDB.dotCN.messageusername);
			if (username) {
				this.changeName(fiber.return.memoizedProps.message.author, username);
				this.changeAvatar(fiber.return.memoizedProps.message.author, this.getAvatarDiv(wrapper));
				this.addTag(fiber.return.memoizedProps.message.author, wrapper);
			}
		}
	}
	
	processAuditLog (instance, wrapper) {
		if (!wrapper) return;
		if (instance.props && instance.props.log && instance.props.log.user) {
			let hooks = wrapper.querySelectorAll(BDFDB.dotCN.auditloguserhook);
			let guildid = instance._reactInternalFiber.return.memoizedProps.guildId;
			if (hooks.length > 0) this.changeName2(instance.props.log.user, hooks[0].firstChild, guildid);
			if (hooks.length > 1 && instance.props.log.targetType == "USER") this.changeName2(instance.props.log.target, hooks[1].firstChild, guildid);
		}
	}
	
	processFluxContainerTypingUsers (instance) {
		let users = !instance.state.typingUsers ? [] : Object.keys(instance.state.typingUsers).filter(id => id != BDFDB.myData.id).filter(id => !this.RelationshipUtils.isBlocked(id)).map(id => this.UserUtils.getUser(id)).filter(id => id != null);
		document.querySelectorAll(BDFDB.dotCNS.typing + "strong").forEach((username, i) => {
			if (users[i]) this.changeName2(users[i], username);
		});
	}
	
	processDirectMessage (instance, wrapper) {
		if (!wrapper) return;
		if (instance.props && instance.props.channel && instance.props.channel.type == 1) {
			let user = this.UserUtils.getUser(instance.props.channel.recipients[0]);
			if (user) {
				let avatar = this.getAvatarDiv(wrapper);
				if (avatar) {
					this.changeAvatar(user, avatar);
					this.changeTooltip(user, avatar, "right");
				}
			}
		}
	}
	
	processCallAvatar (instance, wrapper) {
		if (!wrapper) return;
		if (instance.props && instance.props.id) {
			let user = this.UserUtils.getUser(instance.props.id);
			if (!user) {
				let channel = this.ChannelUtils.getChannel(instance.props.id);
				if (channel && channel.type == 1) user = this.UserUtils.getUser(channel.recipients[0]);
			}
			if (user) {
				let avatar = wrapper.querySelector(BDFDB.dotCN.callavatar);
				this.changeName2(user, wrapper.parentElement.querySelector(BDFDB.dotCN.callmembers));
				this.changeAvatar(user, avatar);
				if (avatar.classList.contains(BDFDB.disCN.callvideo)) this.changeTooltip(user, avatar, "left");
			}
		}
	}
	
	processPrivateChannel (instance, wrapper) {
		if (!wrapper) return;
		if (instance.props && instance.props.user) {
			let username = wrapper.querySelector(BDFDB.dotCN.dmchannelname);
			this.changeName(instance.props.user, username.firstElementChild ? username.firstElementChild : username);
			this.changeAvatar(instance.props.user, this.getAvatarDiv(wrapper));
		}
	}
	
	processHeaderBar (instance, wrapper) {
		let fiber = instance._reactInternalFiber;
		if (fiber.return && fiber.return.memoizedProps && fiber.return.memoizedProps.channelId) {
			let username = wrapper.querySelector(BDFDB.dotCN.channelheaderchannelname);
			if (username) {
				let channel = this.ChannelUtils.getChannel(fiber.return.memoizedProps.channelId);
				if (channel) {
					if (channel.type == 1) this.changeName(this.UserUtils.getUser(channel.recipients[0]), username);
					else {
						if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
						username.style.removeProperty("color");
						username.style.removeProperty("background");
						BDFDB.setInnerText(username, channel.name);
					}
				}
			}
		}
	}
	
	processClickable (instance, wrapper) {
		if (!wrapper || !instance.props || !instance.props.className) return;
		if (instance.props.tag == "a" && instance.props.className.indexOf(BDFDB.disCN.anchorunderlineonhover) > -1) {
			if (wrapper.parentElement.classList.contains(BDFDB.disCN.messagesystemcontent)) {
				let message = BDFDB.getKeyInformation({node:wrapper.parentElement, key:"message", up:true});
				if (message) this.changeName(message.author, wrapper);
			}
		}
		else if (instance.props.tag == "span" && instance.props.className.indexOf(BDFDB.disCN.mention) > -1) {
			let fiber = instance._reactInternalFiber;
			if (fiber.return && fiber.return.return && fiber.return.return.stateNode && fiber.return.return.stateNode.props && typeof fiber.return.return.stateNode.props.render == "function") {
				this.changeMention(fiber.return.return.stateNode.props.render().props.user, wrapper);
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.voiceuser) > -1) {
			let fiber = instance._reactInternalFiber;
			if (fiber.return && fiber.return.memoizedProps && fiber.return.memoizedProps.user) {
				this.changeVoiceUser(fiber.return.memoizedProps.user, wrapper.querySelector(BDFDB.dotCN.voicename));
				this.changeAvatar(fiber.return.memoizedProps.user, this.getAvatarDiv(wrapper));
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.quickswitchresult) > -1) {
			let fiber = instance._reactInternalFiber;
			if (fiber.return && fiber.return.memoizedProps && fiber.return.memoizedProps.result && fiber.return.memoizedProps.result.type == "USER") {
				this.changeName2(fiber.return.memoizedProps.result.record, wrapper.querySelector(BDFDB.dotCN.quickswitchresultmatch));
				this.changeAvatar(fiber.return.memoizedProps.result.record, this.getAvatarDiv(wrapper));
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.autocompleterow) > -1) {
			let fiber = instance._reactInternalFiber;
			if (fiber.return && fiber.return.memoizedProps && fiber.return.memoizedProps.user) {
				this.changeName2(fiber.return.memoizedProps.user, wrapper.querySelector(BDFDB.dotCN.marginleft8));
				this.changeAvatar(fiber.return.memoizedProps.user, this.getAvatarDiv(wrapper));
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.searchpopoutoption) > -1) {
			let fiber = instance._reactInternalFiber;
			if (fiber.return && fiber.return.memoizedState && Array.isArray(fiber.return.memoizedState.tokens)) {
				for (let i in fiber.return.memoizedState.tokens) {
					let token = fiber.return.memoizedState.tokens[i];
					if (token.type == "ANSWER_USERNAME_FROM" && token._data && token._data.get("user")) {
						this.changeName3(token._data.get("user"), wrapper.children[i], true);
						this.changeAvatar(fiber.return.memoizedProps.user, this.getAvatarDiv(wrapper));
						break;
					}
				}
			}
			else if (instance.props.className.indexOf(BDFDB.disCN.searchpopoutuser) > -1) {
				if (fiber.return && fiber.return.memoizedProps && fiber.return.memoizedProps.result && fiber.return.memoizedProps.result.user) {
					this.changeName3(fiber.return.memoizedProps.result.user, wrapper.querySelector(BDFDB.dotCN.searchpopoutdisplayednick), false);
					this.changeAvatar(fiber.return.memoizedProps.result.user, wrapper.querySelector(BDFDB.dotCN.searchpopoutdisplayavatar));
				}
			}
		}
	}
	
	changeName (info, username, guildid = this.LastGuildStore.getGuildId()) {
		if (!info || !username || !username.parentElement) return;
		if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
		let data = BDFDB.loadData(info.id, this, "users") || {};
		let member = this.MemberUtils.getMember(guildid, info.id) || {};
		let usenick = !username.classList.contains(BDFDB.disCN.userprofileusername) && !username.parentElement.classList.contains(BDFDB.disCN.accountinfodetails) && member.nick;
		let changecolor = username.classList.contains(BDFDB.disCN.memberusername) || username.classList.contains(BDFDB.disCN.messageusername) || BDFDB.isPluginEnabled("BetterRoleColors");
		let color1 = BDFDB.colorCONVERT(data.color1 || (changecolor ? member.colorString : null), "RGB");
		let color2 = BDFDB.colorCONVERT(data.color2, "RGB");
		username.style.setProperty("color", color1, "important");
		username.style.setProperty("background-color", color2, "important");
		BDFDB.setInnerText(username, data.name || (usenick ? member.nick : info.username));
		if (info.bot) {
			let tag = username.parentElement.querySelector(BDFDB.dotCN.bottagnametag);
			if (tag) {
				let invert = tag.className.indexOf(BDFDB.disCN.bottaginvert) > -1;
				let tagcolor =  BDFDB.colorCONVERT(data.color1 || (BDFDB.isPluginEnabled("BetterRoleColors") ? member.colorString : null), "RGB");
				tag.style.setProperty("color", invert ? tagcolor : "white");
				tag.style.setProperty("background-color", invert ? "white" : tagcolor);
			}
		}
		if (!BDFDB.isObjectEmpty(data)) {
			username.EditUsersChangeObserver = new MutationObserver((changes, _) => {
				username.EditUsersChangeObserver.disconnect();
				this.changeName(info, username);
			});
			username.EditUsersChangeObserver.observe(username, {attributes:true});
		}
	}
	
	changeName2 (info, username, guildid = this.LastGuildStore.getGuildId()) {
		if (!info || !username || !username.parentElement) return;
		if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
		let data = BDFDB.loadData(info.id, this, "users") || {};
		let member = this.MemberUtils.getMember(guildid, info.id) || {};
		let color1 = BDFDB.colorCONVERT(data.color1 || (BDFDB.isPluginEnabled("BetterRoleColors") ? member.colorString : null), "RGB");
		username.style.setProperty("color", color1, "important");
		BDFDB.setInnerText(username, data.name || member.nick || info.username);
		if (!BDFDB.isObjectEmpty(data)) {
			username.EditUsersChangeObserver = new MutationObserver((changes, _) => {
				username.EditUsersChangeObserver.disconnect();
				this.changeName(info, username);
			});
			username.EditUsersChangeObserver.observe(username, {attributes:true});
		}
	}
	
	changeName3 (info, username, adddisc) {
		if (!info || !username || !username.parentElement) return;
		if (username.EditUsersChangeObserver && typeof username.EditUsersChangeObserver.disconnect == "function") username.EditUsersChangeObserver.disconnect();
		let data = BDFDB.loadData(info.id, this, "users");
		if (data) { 
			let color1 = BDFDB.colorCONVERT(data.color1, "RGB");
			if (adddisc) {
				username.innerHTML = `<span ${color1 ? 'style="color:' + color1 + '!important;"': ''}>${BDFDB.encodeToHTML(data.name || info.username)}</span><span>#${info.discriminator}</span>`;
			}
			else {
				username.style.setProperty("color", color1, "important");
				BDFDB.setInnerText(username, data.name || info.username);
			}
			username.EditUsersChangeObserver = new MutationObserver((changes, _) => {
				username.EditUsersChangeObserver.disconnect();
				this.changeName(info, username);
			});
			username.EditUsersChangeObserver.observe(username, {attributes:true});
		}
	}
	
	changeAvatar (info, avatar) {
		if (!info || !avatar || !avatar.parentElement) return;
		if (avatar.EditUsersChangeObserver && typeof avatar.EditUsersChangeObserver.disconnect == "function") avatar.EditUsersChangeObserver.disconnect();
		let data = BDFDB.loadData(info.id, this, "users") || {};
		if (avatar.tagName == "IMG") avatar.setAttribute("src", data.removeIcon ? null : (data.url || BDFDB.getUserAvatar(info.id)));
		else {
			let url = data.removeIcon ? null : ("url(" + (data.url || BDFDB.getUserAvatar(info.id)) + ") center/cover");
			if (url && avatar.classList.contains(BDFDB.disCN.avatarmaskprofile) && url.search(/discordapp\.com\/avatars\/[0-9]*\/a_/) > -1) url = url.replace(".webp)", ".gif)");
			avatar.style.setProperty("background", url);
		}
		if (data.url || data.removeIcon) {
			avatar.EditUsersChangeObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						avatar.EditUsersChangeObserver.disconnect();
						this.changeAvatar(info, avatar);
					}
				);
			});
			avatar.EditUsersChangeObserver.observe(avatar, {attributes:true});
		}
	}
	
	changeTooltip (info, wrapper, type) {
		if (!info || !wrapper || !wrapper.parentElement) return;
		let data = BDFDB.loadData(info.id, this, "users") || {};
		$(wrapper).off("mouseenter." + this.getName());
		if (data.name) $(wrapper).on("mouseenter." + this.getName(), () => {
			BDFDB.createTooltip(data.name, wrapper, {type,selector:"EditUsers-tooltip",css:`body ${BDFDB.dotCN.tooltip}:not(.EditUsers-tooltip) {display: none !important;}`});
		});
	}
	
	addTag (info, wrapper, selector = "") {
		if (!info || !wrapper || !wrapper.parentElement || wrapper.classList.contains(BDFDB.disCN.accountinfodetails) || wrapper.classList.contains("discord-tag")) return;
		wrapper.querySelectorAll(".EditUsers-tag").forEach((tag) => tag.remove());
		let data = BDFDB.loadData(info.id, this, "users");
		if (data && data.tag) {
			let member = data.ignoreTagColor ? (this.MemberUtils.getMember(this.LastGuildStore.getGuildId(), info.id) || {}) : {};
			let color3 = BDFDB.colorCONVERT(!data.ignoreTagColor ? data.color3 : member.colorString, "RGB");
			let color3COMP = color3 ? BDFDB.colorCONVERT(color3, "RGBCOMP") : [0,0,0];
			let color4 = !data.ignoreTagColor && data.color4 ? BDFDB.colorCONVERT(data.color4, "RGB") : (color3COMP[0] > 180 && color3COMP[1] > 180 && color3COMP[2] > 180 ? "black" : "white");
			let tag = document.createElement("span");
			tag.className = "EditUsers-tag " + BDFDB.disCN.bottag + selector;
			tag.innerText = data.tag;
			tag.style.setProperty("background-color", color3);
			tag.style.setProperty("color", color4);
			wrapper.appendChild(tag);
		}
	}
	
	changeMention (info, mention) {
		if (!info || !mention || !mention.parentElement) return;
		if (mention.EditUsersChangeObserver && typeof mention.EditUsersChangeObserver.disconnect == "function") mention.EditUsersChangeObserver.disconnect();
		let data = BDFDB.loadData(info.id, this, "users") || {};
		let member = this.MemberUtils.getMember(this.LastGuildStore.getGuildId(), info.id) || {};
		let color1 = BDFDB.colorCONVERT(data.color1 || (BDFDB.isPluginEnabled("BetterRoleColors") ? member.colorString : null), "RGBCOMP");
		BDFDB.setInnerText(mention, "@" + (data.name || member.nick || info.username));
		if (mention.EditUsersHovered) colorHover();
		else colorDefault();
		$(mention)
			.off("mouseenter." + this.getName()).off("mouseleave." + this.getName())
			.on("mouseenter." + this.getName(), (e) => {
				mention.EditUsersHovered = true;
				colorHover();
			})
			.on("mouseleave." + this.getName(), (e) => {
				mention.EditUsersHovered = false;
				colorDefault();
			});
		mention.EditUsersChangeObserver = new MutationObserver((changes, _) => {
			mention.EditUsersChangeObserver.disconnect();
			this.changeMention(info, mention);
		});
		mention.EditUsersChangeObserver.observe(mention, {attributes:true});
		function colorDefault() {
			mention.style.setProperty("color", color1 ? "rgb(" + color1[0] + "," + color1[1] + "," + color1[2] + ")" : null, "important");
			mention.style.setProperty("background", color1 ? "rgba(" + color1[0] + "," + color1[1] + "," + color1[2] + ",.1)" : null, "important");
		}
		function colorHover() {
			mention.style.setProperty("color", color1 ? "#FFFFFF" : null, "important");
			mention.style.setProperty("background", color1 ? "rgba(" + color1[0] + "," + color1[1] + "," + color1[2] + ",.7)" : null, "important");
		}
	}
	
	changeVoiceUser (info, username) {
		if (!info || !username || !username.parentElement) return;
		let data = BDFDB.loadData(info.id, this, "users") || {};
		let member = this.MemberUtils.getMember(this.LastGuildStore.getGuildId(), info.id) || {};
		let color1 = BDFDB.colorCONVERT(data.color1 ? data.color1 : (BDFDB.isPluginEnabled("BetterRoleColors") ? member.colorString : ""), "RGB");
		BDFDB.setInnerText(username, data.name || member.nick || info.username);
		username.style.setProperty("color", !username.classList.contains(BDFDB.disCN.voicenamedefault) ? BDFDB.colorCHANGE(color1, -50) : color1, "important");
	}
	
	forceAllUpdates () {
		let app = document.querySelector(BDFDB.dotCN.app);
		if (app) {
			let ins = BDFDB.getOwnerInstance({node:app, name:Object.keys(this.moduleTypes), all:true, noCopies:true, group:true, depth:99999999, time:99999999});
			for (let type in ins) for (let i in ins[type]) this.initiateProcess(ins[type][i], type);
		}
	}
	
	getAvatarDiv (wrapper) {
		var avatar = wrapper.querySelector(BDFDB.dotCNC.avatarimage + BDFDB.dotCNC.callavatarwrapper + BDFDB.dotCNC.voiceavatarcontainer + "[class*='avatar-']");
		while (!avatar && wrapper.parentElement) {
			wrapper = wrapper.parentElement;
			avatar = wrapper.querySelector(BDFDB.dotCNC.avatarimage + BDFDB.dotCNC.callavatarwrapper + BDFDB.dotCNC.voiceavatarcontainer + "[class*='avatar-']");
		}
		return avatar.firstElementChild || avatar;
	}
	
	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					context_localusersettings_text:		"Lokalne korisničke postavke",
					submenu_usersettings_text:			"Promijeni postavke",
					submenu_resetsettings_text:			"Poništi korisnika",
					modal_header_text:					"Lokalne korisničke postavke",
					modal_username_text:				"Lokalno korisničko ime",
					modal_usertag_text:					"Oznaka",
					modal_userurl_text:					"Ikona",
					modal_removeicon_text:				"Ukloni ikonu",
					modal_tabheader1_text:				"Korisnik",
					modal_tabheader2_text:				"Boja naziva",
					modal_tabheader3_text:				"Boja oznaka",
					modal_colorpicker1_text:			"Boja naziva",
					modal_colorpicker2_text:			"Boja pozadine",
					modal_colorpicker3_text:			"Boja oznaka",
					modal_colorpicker4_text:			"Boja fonta",
					modal_ignoreurl_text:				"URL ignorirati",
					modal_ignoretagcolor_text:			"Upotrijebite boju uloga",
					modal_validurl_text:				"Vrijedi URL",
					modal_invalidurl_text:				"Nevažeći URL",
					btn_cancel_text:					"Prekid",
					btn_save_text:						"Uštedjeti"
				};
			case "da":		//danish
				return {
					context_localusersettings_text:		"Lokal brugerindstillinger",
					submenu_usersettings_text:			"Skift indstillinger",
					submenu_resetsettings_text:			"Nulstil bruger",
					modal_header_text:					"Lokal brugerindstillinger",
					modal_username_text:				"Lokalt brugernavn",
					modal_usertag_text:					"Initialer",
					modal_userurl_text:					"Ikon",
					modal_removeicon_text:				"Fjern ikon",
					modal_tabheader1_text:				"Bruger",
					modal_tabheader2_text:				"Navnefarve",
					modal_tabheader3_text:				"Etiketfarve",
					modal_colorpicker1_text:			"Navnefarve",
					modal_colorpicker2_text:			"Baggrundsfarve",
					modal_colorpicker3_text:			"Etiketfarve",
					modal_colorpicker4_text:			"Skriftfarve",
					modal_ignoreurl_text:				"Ignorer URL",
					modal_ignoretagcolor_text:			"Brug rollefarve",
					modal_validurl_text:				"Gyldig URL",
					modal_invalidurl_text:				"Ugyldig URL",
					btn_cancel_text:					"Afbryde",
					btn_save_text:						"Spare"
				};
			case "de":		//german
				return {
					context_localusersettings_text:		"Lokale Benutzereinstellungen",
					submenu_usersettings_text:			"Einstellungen ändern",
					submenu_resetsettings_text:			"Benutzer zurücksetzen",
					modal_header_text:					"Lokale Benutzereinstellungen",
					modal_username_text:				"Lokaler Benutzername",
					modal_usertag_text:					"Etikett",
					modal_userurl_text:					"Icon",
					modal_removeicon_text:				"Entferne Icon",
					modal_tabheader1_text:				"Benutzer",
					modal_tabheader2_text:				"Namensfarbe",
					modal_tabheader3_text:				"Etikettfarbe",
					modal_colorpicker1_text:			"Namensfarbe",
					modal_colorpicker2_text:			"Hintergrundfarbe",
					modal_colorpicker3_text:			"Etikettfarbe",
					modal_colorpicker4_text:			"Schriftfarbe",
					modal_ignoreurl_text:				"URL ignorieren",
					modal_ignoretagcolor_text:			"Benutze Rollenfarbe",
					modal_validurl_text:				"Gültige URL",
					modal_invalidurl_text:				"Ungültige URL",
					btn_cancel_text:					"Abbrechen",
					btn_save_text:						"Speichern"
				};
			case "es":		//spanish
				return {
					context_localusersettings_text:		"Ajustes local de usuario",
					submenu_usersettings_text:			"Cambiar ajustes",
					submenu_resetsettings_text:			"Restablecer usuario",
					modal_header_text:					"Ajustes local de usuario",
					modal_username_text:				"Nombre local de usuario",
					modal_usertag_text:					"Etiqueta",
					modal_userurl_text:					"Icono",
					modal_removeicon_text:				"Eliminar icono",
					modal_tabheader1_text:				"Usuario",
					modal_tabheader2_text:				"Color del nombre",
					modal_tabheader3_text:				"Color de la etiqueta",
					modal_colorpicker1_text:			"Color del nombre",
					modal_colorpicker2_text:			"Color de fondo",
					modal_colorpicker3_text:			"Color de la etiqueta",
					modal_colorpicker4_text:			"Color de fuente",
					modal_ignoreurl_text:				"Ignorar URL",
					modal_ignoretagcolor_text:			"Usar color de rol",
					modal_validurl_text:				"URL válida",
					modal_invalidurl_text:				"URL inválida",
					btn_cancel_text:					"Cancelar",
					btn_save_text:						"Guardar"
				};
			case "fr":		//french
				return {
					context_localusersettings_text:		"Paramètres locale d'utilisateur",
					submenu_usersettings_text:			"Modifier les paramètres",
					submenu_resetsettings_text:			"Réinitialiser l'utilisateur",
					modal_header_text:					"Paramètres locale d'utilisateur",
					modal_username_text:				"Nom local d'utilisateur",
					modal_usertag_text:					"Étiquette",
					modal_userurl_text:					"Icône",
					modal_removeicon_text:				"Supprimer l'icône",
					modal_tabheader1_text:				"Serveur",
					modal_tabheader2_text:				"Couleur du nom",
					modal_tabheader3_text:				"Couleur de l'étiquette",
					modal_colorpicker1_text:			"Couleur du nom",
					modal_colorpicker2_text:			"Couleur de fond",
					modal_colorpicker3_text:			"Couleur de l'étiquette",
					modal_colorpicker4_text:			"Couleur de la police",
					modal_ignoreurl_text:				"Ignorer l'URL",
					modal_ignoretagcolor_text:			"Utiliser la couleur de rôle",
					modal_validurl_text:				"URL valide",
					modal_invalidurl_text:				"URL invalide",
					btn_cancel_text:					"Abandonner",
					btn_save_text:						"Enregistrer"
				};
			case "it":		//italian
				return {
					context_localusersettings_text:		"Impostazioni locale utente",
					submenu_usersettings_text:			"Cambia impostazioni",
					submenu_resetsettings_text:			"Ripristina utente",
					modal_header_text:					"Impostazioni locale utente",
					modal_username_text:				"Nome locale utente",
					modal_usertag_text:					"Etichetta",
					modal_userurl_text:					"Icona",
					modal_removeicon_text:				"Rimuova l'icona",
					modal_tabheader1_text:				"Utente",
					modal_tabheader2_text:				"Colore del nome",
					modal_tabheader3_text:				"Colore della etichetta",
					modal_colorpicker1_text:			"Colore del nome",
					modal_colorpicker2_text:			"Colore di sfondo",
					modal_colorpicker3_text:			"Colore della etichetta",
					modal_colorpicker4_text:			"Colore del carattere",
					modal_ignoreurl_text:				"Ignora l'URL",
					modal_ignoretagcolor_text:			"Usa il colore del ruolo",
					modal_validurl_text:				"URL valido",
					modal_invalidurl_text:				"URL non valido",
					btn_cancel_text:					"Cancellare",
					btn_save_text:						"Salvare"
				};
			case "nl":		//dutch
				return {
					context_localusersettings_text:		"Lokale gebruikerinstellingen",
					submenu_usersettings_text:			"Verandere instellingen",
					submenu_resetsettings_text:			"Reset gebruiker",
					modal_header_text:					"Lokale gebruikerinstellingen",
					modal_username_text:				"Lokale gebruikernaam",
					modal_usertag_text:					"Etiket",
					modal_userurl_text:					"Icoon",
					modal_removeicon_text:				"Verwijder icoon",
					modal_tabheader1_text:				"Gebruiker",
					modal_tabheader2_text:				"Naamkleur",
					modal_tabheader3_text:				"Etiketkleur",
					modal_colorpicker1_text:			"Naamkleur",
					modal_colorpicker2_text:			"Achtergrondkleur",
					modal_colorpicker3_text:			"Etiketkleur",
					modal_colorpicker4_text:			"Doopvontkleur",
					modal_ignoreurl_text:				"URL negeren",
					modal_ignoretagcolor_text:			"Gebruik rolkleur",
					modal_validurl_text:				"Geldige URL",
					modal_invalidurl_text:				"Ongeldige URL",
					btn_cancel_text:					"Afbreken",
					btn_save_text:						"Opslaan"
				};
			case "no":		//norwegian
				return {
					context_localusersettings_text:		"Lokal brukerinnstillinger",
					submenu_usersettings_text:			"Endre innstillinger",
					submenu_resetsettings_text:			"Tilbakestill bruker",
					modal_header_text:					"Lokal brukerinnstillinger",
					modal_username_text:				"Lokalt gebruikernavn",
					modal_usertag_text:					"Stikkord",
					modal_userurl_text:					"Ikon",
					modal_removeicon_text:				"Fjern ikon",
					modal_tabheader1_text:				"Bruker",
					modal_tabheader2_text:				"Navnfarge",
					modal_tabheader3_text:				"Stikkordfarge",
					modal_colorpicker1_text:			"Navnfarge",
					modal_colorpicker2_text:			"Bakgrunnfarge",
					modal_colorpicker3_text:			"Stikkordfarge",
					modal_colorpicker4_text:			"Skriftfarge",
					modal_ignoreurl_text:				"Ignorer URL",
					modal_ignoretagcolor_text:			"Bruk rollefarge",
					modal_validurl_text:				"Gyldig URL",
					modal_invalidurl_text:				"Ugyldig URL",
					btn_cancel_text:					"Avbryte",
					btn_save_text:						"Lagre"
				};
			case "pl":		//polish
				return {
					context_localusersettings_text:		"Lokalne ustawienia użytkownika",
					submenu_usersettings_text:			"Zmień ustawienia",
					submenu_resetsettings_text:			"Resetuj ustawienia",
					modal_header_text:					"Lokalne ustawienia użytkownika",
					modal_username_text:				"Lokalna nazwa użytkownika",
					modal_usertag_text:					"Etykieta",
					modal_userurl_text:					"Ikona",
					modal_removeicon_text:				"Usuń ikonę",
					modal_tabheader1_text:				"Użytkownik",
					modal_tabheader2_text:				"Kolor nazwy",
					modal_tabheader3_text:				"Kolor etykiety",
					modal_colorpicker1_text:			"Kolor nazwy",
					modal_colorpicker2_text:			"Kolor tła",
					modal_colorpicker3_text:			"Kolor etykiety",
					modal_colorpicker4_text:			"Kolor czcionki",
					modal_ignoreurl_text:				"Ignoruj URL",
					modal_ignoretagcolor_text:			"Użyj kolor roli",
					modal_validurl_text:				"Prawidłowe URL",
					modal_invalidurl_text:				"Nieprawidłowe URL",
					btn_cancel_text:					"Anuluj",
					btn_save_text:						"Zapisz"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_localusersettings_text:		"Configurações local do utilizador",
					submenu_usersettings_text:			"Mudar configurações",
					submenu_resetsettings_text:			"Redefinir utilizador",
					modal_header_text:					"Configurações local do utilizador",
					modal_username_text:				"Nome local do utilizador",
					modal_usertag_text:					"Etiqueta",
					modal_userurl_text:					"Icone",
					modal_removeicon_text:				"Remover ícone",
					modal_tabheader1_text:				"Utilizador",
					modal_tabheader2_text:				"Cor do nome",
					modal_tabheader3_text:				"Cor da etiqueta",
					modal_colorpicker1_text:			"Cor do nome",
					modal_colorpicker2_text:			"Cor do fundo",
					modal_colorpicker3_text:			"Cor da etiqueta",
					modal_colorpicker4_text:			"Cor da fonte",
					modal_ignoreurl_text:				"Ignorar URL",
					modal_ignoretagcolor_text:			"Use a cor do papel",
					modal_validurl_text:				"URL válido",
					modal_invalidurl_text:				"URL inválida",
					btn_cancel_text:					"Cancelar",
					btn_save_text:						"Salvar"
				};
			case "fi":		//finnish
				return {
					context_localusersettings_text:		"Paikallinen käyttäjä asetukset",
					submenu_usersettings_text:			"Vaihda asetuksia",
					submenu_resetsettings_text:			"Nollaa käyttäjä",
					modal_header_text:					"Paikallinen käyttäjä asetukset",
					modal_username_text:				"Paikallinen käyttäjätunnus",
					modal_usertag_text:					"Merkki",
					modal_userurl_text:					"Ikonin",
					modal_removeicon_text:				"Poista kuvake",
					modal_tabheader1_text:				"Käyttäjä",
					modal_tabheader2_text:				"Nimiväri",
					modal_tabheader3_text:				"Merkkiväri",
					modal_colorpicker1_text:			"Nimiväri",
					modal_colorpicker2_text:			"Taustaväri",
					modal_colorpicker3_text:			"Merkkiväri",
					modal_colorpicker4_text:			"Fontinväri",
					modal_ignoreurl_text:				"Ohita URL",
					modal_ignoretagcolor_text:			"Käytä rooliväriä",
					modal_validurl_text:				"Voimassa URL",
					modal_invalidurl_text:				"Virheellinen URL",
					btn_cancel_text:					"Peruuttaa",
					btn_save_text:						"Tallentaa"
				};
			case "sv":		//swedish
				return {
					context_localusersettings_text:		"Lokal användareinställningar",
					submenu_usersettings_text:			"Ändra inställningar",
					submenu_resetsettings_text:			"Återställ användare",
					modal_header_text:					"Lokal användareinställningar",
					modal_username_text:				"Lokalt användarenamn",
					modal_usertag_text:					"Märka",
					modal_userurl_text:					"Ikon",
					modal_removeicon_text:				"Ta bort ikonen",
					modal_tabheader1_text:				"Användare",
					modal_tabheader2_text:				"Namnfärg",
					modal_tabheader3_text:				"Märkafärg",
					modal_colorpicker1_text:			"Namnfärg",
					modal_colorpicker2_text:			"Bakgrundfärg",
					modal_colorpicker3_text:			"Märkafärg",
					modal_colorpicker4_text:			"Fontfärg",
					modal_ignoreurl_text:				"Ignorera URL",
					modal_ignoretagcolor_text:			"Använd rollfärg",
					modal_validurl_text:				"Giltig URL",
					modal_invalidurl_text:				"Ogiltig URL",
					btn_cancel_text:					"Avbryta",
					btn_save_text:						"Spara"
				};
			case "tr":		//turkish
				return {
					context_localusersettings_text:		"Yerel Kullanıcı Ayarları",
					submenu_usersettings_text:			"Ayarları Değiştir",
					submenu_resetsettings_text:			"Kullanıcı Sıfırla",
					modal_header_text:					"Yerel Kullanıcı Ayarları",
					modal_username_text:				"Yerel Kullanıcı Isim",
					modal_usertag_text:					"Etiket",
					modal_userurl_text:					"Simge",
					modal_removeicon_text:				"Simge kaldır",
					modal_tabheader1_text:				"Kullanıcı",
					modal_tabheader2_text:				"Simge rengi",
					modal_tabheader3_text:				"Isim rengi",
					modal_colorpicker1_text:			"Simge rengi",
					modal_colorpicker2_text:			"Arka fon rengi",
					modal_colorpicker3_text:			"Etiket rengi",
					modal_colorpicker4_text:			"Yazı rengi",
					modal_ignoreurl_text:				"URL yoksay",
					modal_ignoretagcolor_text:			"Rol rengini kullan",
					modal_validurl_text:				"Geçerli URL",
					modal_invalidurl_text:				"Geçersiz URL",
					btn_cancel_text:					"Iptal",
					btn_save_text:						"Kayıt"
				};
			case "cs":		//czech
				return {
					context_localusersettings_text:		"Místní nastavení uživatel",
					submenu_usersettings_text:			"Změnit nastavení",
					submenu_resetsettings_text:			"Obnovit uživatel",
					modal_header_text:					"Místní nastavení uživatel",
					modal_username_text:				"Místní název uživatel",
					modal_usertag_text:					"Štítek",
					modal_userurl_text:					"Ikony",
					modal_removeicon_text:				"Odstranit ikonu",
					modal_tabheader1_text:				"Uživatel",
					modal_tabheader2_text:				"Barva název",
					modal_tabheader3_text:				"Barva štítek",
					modal_colorpicker1_text:			"Barva název",
					modal_colorpicker2_text:			"Barva pozadí",
					modal_colorpicker3_text:			"Barva štítek",
					modal_colorpicker4_text:			"Barva fontu",
					modal_ignoreurl_text:				"Ignorovat URL",
					modal_ignoretagcolor_text:			"Použijte barva role",
					modal_validurl_text:				"Platná URL",
					modal_invalidurl_text:				"Neplatná URL",
					btn_cancel_text:					"Zrušení",
					btn_save_text:						"Uložit"
				};
			case "bg":		//bulgarian
				return {
					context_localusersettings_text:		"Настройки за локални потребител",
					submenu_usersettings_text:			"Промяна на настройките",
					submenu_resetsettings_text:			"Възстановяване на потребител",
					modal_header_text:					"Настройки за локални потребител",
					modal_username_text:				"Локално име на потребител",
					modal_usertag_text:					"Cвободен край",
					modal_userurl_text:					"Икона",
					modal_removeicon_text:				"Премахване на иконата",
					modal_tabheader1_text:				"Потребител",
					modal_tabheader2_text:				"Цвят на име",
					modal_tabheader3_text:				"Цвят на свободен край",
					modal_colorpicker1_text:			"Цвят на име",
					modal_colorpicker2_text:			"Цвят на заден план",
					modal_colorpicker3_text:			"Цвят на свободен край",
					modal_colorpicker4_text:			"Цвят на шрифта",
					modal_ignoreurl_text:				"Игнориране на URL",
					modal_ignoretagcolor_text:			"Използвайте цвят на ролите",
					modal_validurl_text:				"Валиден URL",
					modal_invalidurl_text:				"Невалиден URL",
					btn_cancel_text:					"Зъбести",
					btn_save_text:						"Cпасяване"
				};
			case "ru":		//russian
				return {
					context_localusersettings_text:		"Настройки локального пользователь",
					submenu_usersettings_text:			"Изменить настройки",
					submenu_resetsettings_text:			"Сбросить пользователь",
					modal_header_text:					"Настройки локального пользователь",
					modal_username_text:				"Имя локального пользователь",
					modal_usertag_text:					"Tег",
					modal_userurl_text:					"Значок",
					modal_removeicon_text:				"Удалить значок",
					modal_tabheader1_text:				"Пользователь",
					modal_tabheader2_text:				"Цвет имя",
					modal_tabheader3_text:				"Цвет тег",
					modal_colorpicker1_text:			"Цвет имя",
					modal_colorpicker2_text:			"Цвет задний план",
					modal_colorpicker3_text:			"Цвет тег",
					modal_colorpicker4_text:			"Цвет шрифта",
					modal_ignoreurl_text:				"Игнорировать URL",
					modal_ignoretagcolor_text:			"Использовать цвет ролей",
					modal_validurl_text:				"Действительный URL",
					modal_invalidurl_text:				"Неверная URL",
					btn_cancel_text:					"Отмена",
					btn_save_text:						"Cпасти"
				};
			case "uk":		//ukrainian
				return {
					context_localusersettings_text:		"Налаштування локального користувач",
					submenu_usersettings_text:			"Змінити налаштування",
					submenu_resetsettings_text:			"Скидання користувач",
					modal_header_text:					"Налаштування локального користувач",
					modal_username_text:				"Локальне ім'я користувач",
					modal_usertag_text:					"Tег",
					modal_userurl_text:					"Іконка",
					modal_removeicon_text:				"Видалити піктограму",
					modal_tabheader1_text:				"Користувач",
					modal_tabheader2_text:				"Колір ім'я",
					modal_tabheader3_text:				"Колір тег",
					modal_colorpicker1_text:			"Колір ім'я",
					modal_colorpicker2_text:			"Колір фон",
					modal_colorpicker3_text:			"Колір тег",
					modal_colorpicker4_text:			"Колір шрифту",
					modal_ignoreurl_text:				"Ігнорувати URL",
					modal_ignoretagcolor_text:			"Використовуйте рольовий колір",
					modal_validurl_text:				"Дійсна URL",
					modal_invalidurl_text:				"Недійсна URL",
					btn_cancel_text:					"Скасувати",
					btn_save_text:						"Зберегти"
				};
			case "ja":		//japanese
				return {
					context_localusersettings_text:		"ローカルユーザーー設定",
					submenu_usersettings_text:			"設定を変更する",
					submenu_resetsettings_text:			"ユーザーーをリセットする",
					modal_header_text:					"ローカルユーザーー設定",
					modal_username_text:				"ローカルユーザーー名",
					modal_usertag_text:					"タグ",
					modal_userurl_text:					"アイコン",
					modal_removeicon_text:				"アイコンを削除",
					modal_tabheader1_text:				"ユーザー",
					modal_tabheader2_text:				"名の色",
					modal_tabheader3_text:				"タグの色",
					modal_colorpicker1_text:			"名の色",
					modal_colorpicker2_text:			"バックグラウンドの色",
					modal_colorpicker3_text:			"タグの色",
					modal_colorpicker4_text:			"フォントの色",
					modal_ignoreurl_text:				"URL を無視する",
					modal_ignoretagcolor_text:			"ロールカラーを使用する",
					modal_validurl_text:				"有効な URL",
					modal_invalidurl_text:				"無効な URL",
					btn_cancel_text:					"キャンセル",
					btn_save_text:						"セーブ"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_localusersettings_text:		"本地用戶設置",
					submenu_usersettings_text:			"更改設置",
					submenu_resetsettings_text:			"重置用戶",
					modal_header_text:					"本地用戶設置",
					modal_username_text:				"用戶名稱",
					modal_usertag_text:					"標籤",
					modal_userurl_text:					"圖標",
					modal_removeicon_text:				"刪除圖標",
					modal_tabheader1_text:				"用戶",
					modal_tabheader2_text:				"名稱顏色",
					modal_tabheader3_text:				"標籤顏色",
					modal_colorpicker1_text:			"名稱顏色",
					modal_colorpicker2_text:			"背景顏色",
					modal_colorpicker3_text:			"標籤顏色",
					modal_colorpicker4_text:			"字體顏色",
					modal_ignoreurl_text:				"忽略 URL",
					modal_ignoretagcolor_text:			"使用角色",
					modal_validurl_text:				"有效的 URL",
					modal_invalidurl_text:				"無效的 URL",
					btn_cancel_text:					"取消",
					btn_save_text:						"保存"
				};
			case "ko":		//korean
				return {
					context_localusersettings_text:		"로컬 사용자 설정",
					submenu_usersettings_text:			"설정 변경",
					submenu_resetsettings_text:			"사용자 재설정",
					modal_header_text:					"로컬 사용자 설정",
					modal_username_text:				"로컬 사용자 이름",
					modal_usertag_text:					"꼬리표",
					modal_userurl_text:					"상",
					modal_removeicon_text:				"상 삭제",
					modal_tabheader1_text:				"사용자",
					modal_tabheader2_text:				"이름 색깔",
					modal_tabheader3_text:				"꼬리표 색깔",
					modal_colorpicker1_text:			"이름 색깔",
					modal_colorpicker2_text:			"배경 색깔",
					modal_colorpicker3_text:			"꼬리표 색깔",
					modal_colorpicker4_text:			"글꼴 색깔",
					modal_ignoreurl_text:				"URL 무시",
					modal_ignoretagcolor_text:			"역할 색상 사용",
					modal_validurl_text:				"유효한 URL",
					modal_invalidurl_text:				"잘못된 URL",
					btn_cancel_text:					"취소",
					btn_save_text:						"저장"
				};
			default:	//default: english
				return {
					context_localusersettings_text:		"Local Usersettings",
					submenu_usersettings_text:			"Change Settings",
					submenu_resetsettings_text:			"Reset User",
					modal_header_text:					"Local Usersettings",
					modal_username_text:				"Local Username",
					modal_usertag_text:					"Tag",
					modal_userurl_text:					"Icon",
					modal_removeicon_text:				"Remove Icon",
					modal_tabheader1_text:				"User",
					modal_tabheader2_text:				"Namecolor",
					modal_tabheader3_text:				"Tagcolor",
					modal_colorpicker1_text:			"Namecolor",
					modal_colorpicker2_text:			"Backgroundcolor",
					modal_colorpicker3_text:			"Tagcolor",
					modal_colorpicker4_text:			"Fontcolor",
					modal_ignoreurl_text:				"Ignore URL",
					modal_ignoretagcolor_text:			"Use Rolecolor",
					modal_validurl_text:				"Valid URL",
					modal_invalidurl_text:				"Invalid URL",
					btn_cancel_text:					"Cancel",
					btn_save_text:						"Save"
				};
		}
	}
}