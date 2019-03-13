//META{"name":"EditChannels","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditChannels","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EditChannels/EditChannels.plugin.js"}*//

class EditChannels {
	getName () {return "EditChannels";}

	getVersion () {return "3.9.2";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to rename and recolor channelnames.";}

	initConstructor () {
		this.changelog = {
			"fixed":[["Quick Switcher","Fixed Channels not being changed in the Quick Switcher"]]
		};
		
		this.labels = {};

		this.patchModules = {
			"ChannelTextArea":"componentDidMount",
			"AuditLog":"componentDidMount",
			"InviteCard":"componentDidMount",
			"ChannelCategoryItem":"componentDidMount",
			"ChannelItem":"componentDidMount",
			"HeaderBar":["componentDidMount","componentDidUpdate"],
			"Clickable":"componentDidMount",
			"StandardSidebarView":"componentWillUnmount"
		};

		this.channelContextEntryMarkup =
			`<div class="${BDFDB.disCN.contextmenuitemgroup}">
				<div class="${BDFDB.disCN.contextmenuitem} localchannelsettings-item ${BDFDB.disCN.contextmenuitemsubmenu}">
					<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_context_localchannelsettings_text</div></span>
					<div class="${BDFDB.disCN.contextmenuhint}"></div>
				</div>
			</div>`;

		this.channelContextSubMenuMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} editchannels-submenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} channelsettings-item">
						<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_submenu_channelsettings_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} resetsettings-item ${BDFDB.disCN.contextmenuitemdisabled}">
						<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_submenu_resetsettings_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>
			</div>`;

		this.channelSettingsModalMarkup =
			`<span class="${this.name}-modal DevilBro-modal">
				<div class="${BDFDB.disCN.backdrop}"></div>
				<div class="${BDFDB.disCN.modal}">
					<div class="${BDFDB.disCN.modalinner}">
						<div class="${BDFDB.disCNS.modalsub + BDFDB.disCN.modalsizemedium}">
							<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.modalheader}" style="flex: 0 0 auto;">
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
							<div class="${BDFDB.disCNS.scrollerwrap + BDFDB.disCNS.modalcontent + BDFDB.disCNS.scrollerthemed + BDFDB.disCN.themeghosthairline}">
								<div class="${BDFDB.disCNS.scroller + BDFDB.disCN.modalsubinner}">
									<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_channelname_text</h3>
										</div>
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
											<div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;"><input type="text" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}" id="input-channelname"></div>
										</div>
										<div class="${BDFDB.disCNS.modaldivider + BDFDB.disCNS.modaldividerdefault + BDFDB.disCN.margintop20}"></div>
									</div>
									<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20}" style="flex: 1 1 auto;">
										<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.vertical + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;">
											<h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">REPLACE_modal_colorpicker1_text</h3>
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

		this.css = `
			${BDFDB.dotCN.channelheadertitletext}[changed-by-editchannels] ${BDFDB.dotCN.channelheaderchannelicon} {
				opacity: 0.6;
			}
			${BDFDB.dotCN.guildsettingsinvitechannelname}[changed-by-editchannels] {
				opacity: 1;
			}
		`;

		this.defaults = {
			settings: {
				changeChannelIcon:		{value:true, 	inner:false,	description:"Change color of Channel Icon."},
				changeUnreadIndicator:	{value:true, 	inner:false,	description:"Change color of Unread Indicator."},
				changeInChatTextarea:	{value:true, 	inner:true,		description:"Chat Textarea"},
				changeInMentions:		{value:true, 	inner:true,		description:"Mentions"},
				changeInChannelList:	{value:true, 	inner:true,		description:"Channel List"},
				changeInChannelHeader:	{value:true, 	inner:true,		description:"Channel Header"},
				changeInRecentMentions:	{value:true, 	inner:true,		description:"Recent Mentions Popout"},
				changeInAutoComplete:	{value:true, 	inner:true,		description:"Autocomplete Menu"},
				changeInAuditLog:		{value:true, 	inner:true,		description:"Audit Log"},
				changeInInviteLog:		{value:true, 	inner:true,		description:"Invite Log"},
				changeInSearchPopout:	{value:true, 	inner:true,		description:"Search Popout"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var settings = BDFDB.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			if (!this.defaults.settings[key].inner) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Change Channel in:</h3></div><div class="DevilBro-settings-inner-list">`;
		for (let key in settings) {
			if (this.defaults.settings[key].inner) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Reset all Channels.</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} reset-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Reset</div></button></div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".reset-button", () => {
			BDFDB.openConfirmModal(this, "Are you sure you want to reset all channels?", () => {
				BDFDB.removeAllData(this, "channels");
				BDFDB.WebModules.forceAllUpdates(this);
			});
		});
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			this.UserUtils = BDFDB.WebModules.findByProperties("getUsers","getUser");
			this.ChannelUtils = BDFDB.WebModules.findByProperties("getChannels","getChannel");
			this.GuildChannels = BDFDB.WebModules.findByProperties("getChannels","getDefaultChannel");
			this.LastGuildStore = BDFDB.WebModules.findByProperties("getLastSelectedGuildId");
			this.LastChannelStore = BDFDB.WebModules.findByProperties("getLastSelectedChannelId");

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			let data = BDFDB.loadAllData(this, "channels");
			BDFDB.removeAllData(this, "channels");
			try {BDFDB.WebModules.forceAllUpdates(this);} catch (err) {}
			BDFDB.saveAllData(data, this, "channels");

			BDFDB.removeEles(".autocompleteEditChannels", ".autocompleteEditChannelsRow");

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	changeLanguageStrings () {
		this.channelContextEntryMarkup = 	this.channelContextEntryMarkup.replace("REPLACE_context_localchannelsettings_text", this.labels.context_localchannelsettings_text);

		this.channelContextSubMenuMarkup = 	this.channelContextSubMenuMarkup.replace("REPLACE_submenu_channelsettings_text", this.labels.submenu_channelsettings_text);
		this.channelContextSubMenuMarkup = 	this.channelContextSubMenuMarkup.replace("REPLACE_submenu_resetsettings_text", this.labels.submenu_resetsettings_text);

		this.channelSettingsModalMarkup = 	this.channelSettingsModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.channelSettingsModalMarkup = 	this.channelSettingsModalMarkup.replace("REPLACE_modal_channelname_text", this.labels.modal_channelname_text);
		this.channelSettingsModalMarkup = 	this.channelSettingsModalMarkup.replace("REPLACE_modal_colorpicker1_text", this.labels.modal_colorpicker1_text);
		this.channelSettingsModalMarkup = 	this.channelSettingsModalMarkup.replace("REPLACE_btn_save_text", this.labels.btn_save_text);
	}

	onChannelContextMenu (instance, menu) {
		if (instance.props && instance.props.channel && !menu.querySelector(".localchannelsettings-item")) {
			let channelContextEntry = BDFDB.htmlToElement(this.channelContextEntryMarkup);
			let devgroup = BDFDB.React.findDOMNodeSafe(BDFDB.getOwnerInstance({node:menu,name:["DeveloperModeGroup","MessageDeveloperModeGroup"]}));
			if (devgroup) devgroup.parentElement.insertBefore(channelContextEntry, devgroup);
			else menu.appendChild(channelContextEntry, menu);
			let settingsitem = channelContextEntry.querySelector(".localchannelsettings-item");
			settingsitem.addEventListener("mouseenter", () => {
				let channelContextSubMenu = BDFDB.htmlToElement(this.channelContextSubMenuMarkup);
				let channelitem = channelContextSubMenu.querySelector(".channelsettings-item");
				channelitem.addEventListener("click", () => {
					BDFDB.closeContextMenu(menu);
					this.showChannelSettings(instance.props.channel);
				});
				if (BDFDB.loadData(instance.props.channel.id, this, "channels")) {
					let resetitem = channelContextSubMenu.querySelector(".resetsettings-item");
					BDFDB.removeClass(resetitem, BDFDB.disCN.contextmenuitemdisabled);
					resetitem.addEventListener("click", () => {
						BDFDB.closeContextMenu(menu);
						BDFDB.removeData(instance.props.channel.id, this, "channels");
						BDFDB.WebModules.forceAllUpdates(this);
					});
				}
				BDFDB.appendSubMenu(settingsitem, channelContextSubMenu);
			});
		}
	}

	showChannelSettings (info) {
		var {name,color} = BDFDB.loadData(info.id, this, "channels") || {}

		let channelSettingsModal = BDFDB.htmlToElement(this.channelSettingsModalMarkup);
		let channelnameinput = channelSettingsModal.querySelector("#input-channelname");

		channelSettingsModal.querySelector(BDFDB.dotCN.modalguildname).innerText = info.name;
		channelnameinput.value = name || "";
		channelnameinput.setAttribute("placeholder", info.name);
		BDFDB.setColorSwatches(channelSettingsModal, color);

		BDFDB.appendModal(channelSettingsModal);

		BDFDB.addChildEventListener(channelSettingsModal, "click", ".btn-save", e => {
			name = channelnameinput.value.trim();
			name = name ? name : null;

			color = BDFDB.getSwatchColor(channelSettingsModal, 1);
			if (color) {
				if (color[0] < 30 && color[1] < 30 && color[2] < 30) color = BDFDB.colorCHANGE(color, 30);
				else if (color[0] > 225 && color[1] > 225 && color[2] > 225) color = BDFDB.colorCHANGE(color, -30);
			}

			if (name == null && color == null) {
				BDFDB.removeData(info.id, this, "channels");
			}
			else {
				BDFDB.saveData(info.id, {name,color}, this, "channels");
			}
			BDFDB.WebModules.forceAllUpdates(this);
		});
		channelnameinput.focus();
	}

	processChannelTextArea (instance, wrapper) {
		let channel = BDFDB.getReactValue(instance, "props.channel");
		if (channel) {
			var textarea = wrapper.querySelector("textarea");
			if (!textarea) return;
			if (channel.type == 0 && instance.props.type == "normal") {
				let data = this.getChannelData(channel.id, wrapper);
				wrapper.querySelector("textarea").setAttribute("placeholder", BDFDB.LanguageStrings.TEXTAREA_PLACEHOLDER.replace("{{channel}}", "#" + (data.name || channel.name)));
			}
			BDFDB.removeEventListener(this, textarea);
			if (BDFDB.getData("changeInAutoComplete", this, "settings")) {
				BDFDB.addEventListener(this, textarea, "keydown", e => {
					let autocompletemenu = textarea.parentElement.querySelector(BDFDB.dotCN.autocomplete);
					if (autocompletemenu && (e.which == 9 || e.which == 13)) {
						if (BDFDB.containsClass(autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected).parentElement, "autocompleteEditChannelsRow")) {
							BDFDB.stopEvent(e);
							this.swapWordWithMention(textarea); 
						}
					}
					else if (autocompletemenu && (e.which == 38 || e.which == 40)) {
						let autocompleteitems = autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselectable + ":not(.autocompleteEditChannelsSelector)");
						let selected = autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected);
						if (BDFDB.containsClass(selected, "autocompleteEditChannelsSelector") || autocompleteitems[e.which == 38 ? 0 : (autocompleteitems.length-1)] == selected) {
							BDFDB.stopEvent(e);
							let next = this.getNextSelection(autocompletemenu, null, e.which == 38 ? false : true);
							BDFDB.removeClass(selected, BDFDB.disCN.autocompleteselected);
							BDFDB.addClass(selected, BDFDB.disCN.autocompleteselector);
							BDFDB.addClass(next, BDFDB.disCN.autocompleteselected);
						}
					}
					else if (textarea.value && !e.shiftKey && e.which == 13 && !autocompletemenu && textarea.value.indexOf("s/") != 0) {
						this.format = true;
						textarea.dispatchEvent(new Event("input"));
					}
					else if (!e.ctrlKey && e.which != 16 && textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length) {
						clearTimeout(textarea.EditChannelsAutocompleteTimeout);
						textarea.EditChannelsAutocompleteTimeout = setTimeout(() => {this.addAutoCompleteMenu(textarea, channel);},100);
					}

					if (!e.ctrlKey && e.which != 38 && e.which != 40 && !(e.which == 39 && textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length)) BDFDB.removeEles(".autocompleteEditChannels", ".autocompleteEditChannelsRow");
				});
				BDFDB.addEventListener(this, textarea, "click", e => {
					if (textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length) setImmediate(() => {this.addAutoCompleteMenu(textarea, channel);});
				});
			}
		}
	}

	processAuditLog (instance, wrapper) {
		let channel = BDFDB.getReactValue(instance, "props.log.options.channel");
		if (channel) {
			let hooks = wrapper.querySelectorAll(`${BDFDB.dotCN.flexchild} > span${BDFDB.notCN.auditloguserhook}`);
			if (hooks.length > 0) this.changeChannel2(channel, hooks[0].firstChild);
		} 
	}

	processInviteCard (instance, wrapper) {
		let invite = BDFDB.getReactValue(instance, "props.invite");
		if (invite && invite.inviter && invite.channel) {
			let channelname = wrapper.querySelector(BDFDB.dotCN.guildsettingsinvitechannelname);
			if (channelname) this.changeChannel2(invite.channel, channelname);
		}
	}

	processChannelCategoryItem (instance, wrapper) {
		if (instance.props && instance.props.channel) {
			this.changeChannel(instance.props.channel, wrapper.querySelector(BDFDB.dotCN.categorycolortransition));
		}
	}

	processChannelItem (instance, wrapper) {
		if (instance.props && instance.props.channel) {
			this.changeChannel(instance.props.channel, wrapper.querySelector(BDFDB.dotCN.channelname));
		}
	}

	processHeaderBar (instance, wrapper) {
		let channel_id = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.channelId");
		if (channel_id) {
			let channelname = wrapper.querySelector(BDFDB.dotCN.channelheaderchannelname);
			if (channelname) {
				let channel = this.ChannelUtils.getChannel(channel_id);
				if (channel) {
					if (channel.type == 0) this.changeChannel(channel, wrapper.querySelector(BDFDB.dotCN.channelheaderchannelname));
					else {
						if (channel.type == 1) channel = this.UserUtils.getUser(channel.recipients[0]) || channel;
						if (channelname.EditChannelsChangeObserver && typeof channelname.EditChannelsChangeObserver.disconnect == "function") channelname.EditChannelsChangeObserver.disconnect();
						channelname.style.removeProperty("color");
						channelname.style.removeProperty("background");
						BDFDB.setInnerText(channelname, channel.name || channel.username);
					}
				}
			}
		}
	}

	processClickable (instance, wrapper) {
		if (!instance.props || !instance.props.className) return;
		else if (instance.props.tag == "span" && instance.props.className.indexOf(BDFDB.disCN.mentionwrapper) > -1 && instance.props.className.indexOf(BDFDB.disCN.mention) == -1) {
			let children = BDFDB.getReactValue(instance, "_reactInternalFiber.memoizedProps.children");
			if (children && typeof children[0] == "string") {
				let channelname = children[0].slice(1);
				let categoryname = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.type.displayName") == "Tooltip" ? BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.memoizedProps.text") : null
				let channelid = this.LastGuildStore.getGuildId();
				let channels = channelid ? (this.GuildChannels.getChannels(channelid)[0] || this.GuildChannels.getChannels(channelid).SELECTABLE) : null;
				if (Array.isArray(channels)) for (let channel of channels) {
					if (channelname == channel.channel.name) {
						let category = categoryname ? this.ChannelUtils.getChannel(channel.channel.parent_id) : null;
						if (!category || category && categoryname == category.name) {
							this.changeMention(channel.channel, wrapper, category || {});
							break;
						}
					}
				}
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.quickswitchresult) > -1) {
			let channel = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.memoizedProps.channel");
			if (channel) {
				this.changeChannel(channel, wrapper.querySelector(BDFDB.dotCN.quickswitchresultmatch));
				if (channel.parent_id) this.changeChannel(this.ChannelUtils.getChannel(channel.parent_id), wrapper.querySelector(BDFDB.dotCN.quickswitchresultnote));
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.autocompleterow) > -1) {
			let channel = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.channel");
			if (channel) {
				this.changeChannel(channel, wrapper.querySelector(BDFDB.dotCN.marginleft4));
				let category = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.category");
				if (category) this.changeChannel(category, wrapper.querySelector(BDFDB.dotCN.autocompletedescription));
			}
		}
		else if (instance.props.tag == "span" && instance.props.className.indexOf(BDFDB.disCN.messagespopoutchannelname) > -1) {
			let channel = BDFDB.getReactValue(instance, "_reactInternalFiber.return.sibling.child.child.memoizedProps.channel");
			if (channel) this.changeChannel2(channel, wrapper);
		}
	}

	processStandardSidebarView (instance, wrapper) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			BDFDB.WebModules.forceAllUpdates(this);
		}
	}

	changeChannel (info, channelname) {
		if (!info || !channelname || !channelname.parentElement) return;
		if (channelname.EditChannelsChangeObserver && typeof channelname.EditChannelsChangeObserver.disconnect == "function") channelname.EditChannelsChangeObserver.disconnect();
		let data = this.getChannelData(info.id, channelname);
		if (data.name || data.color || channelname.parentElement.getAttribute("changed-by-editchannels")) {
			let color = this.chooseColor(channelname, data.color);
			channelname.style.setProperty("color", color, "important");
			BDFDB.setInnerText(channelname, data.name || info.name);
			let iconparent = BDFDB.containsClass(channelname, BDFDB.disCN.quickswitchresultmatch) ? channelname.parentElement.parentElement : channelname.parentElement;
			if (!BDFDB.containsClass(channelname, BDFDB.disCN.autocompletedescription)) {
				let settings = BDFDB.getAllData(this, "settings");
				iconparent.querySelectorAll('svg [stroke]:not([stroke="none"]').forEach(icon => {
					if (!icon.getAttribute("oldstroke")) icon.setAttribute("oldstroke", icon.getAttribute("stroke"));
					icon.setAttribute("stroke", color && settings.changeChannelIcon ? color : icon.getAttribute("oldstroke"), "important");
					icon.style.setProperty("stroke", color && settings.changeChannelIcon ? color : icon.getAttribute("oldstroke"), "important");
				});
				iconparent.querySelectorAll('svg [fill]:not([fill="none"]').forEach(icon => {
					if (!icon.getAttribute("oldfill")) icon.setAttribute("oldfill", icon.getAttribute("fill"));
					icon.setAttribute("fill", color && settings.changeChannelIcon ? color : icon.getAttribute("oldfill"), "important");
					icon.style.setProperty("fill", color && settings.changeChannelIcon ? color : icon.getAttribute("oldfill"), "important");
				});
				let unread = iconparent.parentElement.querySelector(BDFDB.dotCN.channelunread);
				if (unread) unread.style.setProperty("background-color", color && settings.changeUnreadIndicator ? color : null, "important");
			}
			if (data.name || data.color) {
				channelname.parentElement.setAttribute("changed-by-editchannels", true);
				channelname.EditChannelsChangeObserver = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.type == "childList" && change.addedNodes.length && change.target.tagName && (change.target.tagName == "SVG" || change.target.querySelector("svg")) || change.type == "attributes" && change.attributeName == "class" && change.target.className.length && change.target.className.indexOf("name") > -1 || change.type == "attributes" && change.attributeName == "style" && BDFDB.containsClass(change.target, BDFDB.disCN.channelheaderchannelname)) {
								channelname.EditChannelsChangeObserver.disconnect();
								this.changeChannel(info, channelname);
							}
						}
					);
				});
				channelname.EditChannelsChangeObserver.observe(iconparent, {attributes:true, childList:true, subtree:true});
			}
			else channelname.parentElement.removeAttribute("changed-by-editchannels");
		}
	}

	changeChannel2 (info, channelname) {
		if (!info || !channelname || !channelname.parentElement) return;
		if (channelname.EditChannelsChangeObserver && typeof channelname.EditChannelsChangeObserver.disconnect == "function") channelname.EditChannelsChangeObserver.disconnect();
		let data = this.getChannelData(info.id, channelname);
		if (data.name || data.color || channelname.getAttribute("changed-by-editchannels")) {
			channelname.style.setProperty("color", this.chooseColor(channelname, data.color), "important");
			BDFDB.setInnerText(channelname, "#" + (data.name || info.name));
			if (data.name || data.color) {
				channelname.setAttribute("changed-by-editchannels", true);
				channelname.EditChannelsChangeObserver = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.type == "childList" && change.addedNodes.length && change.target.tagName && (change.target.tagName == "SVG" || change.target.querySelector("svg")) || change.type == "attributes" && change.attributeName == "class" && change.target.className.length && change.target.className.indexOf("name") > -1) {
								channelname.EditChannelsChangeObserver.disconnect();
								this.changeChannel2(info, channelname);
							}
						}
					);
				});
				channelname.EditChannelsChangeObserver.observe(channelname.parentElement, {attributes:true, childList:true, subtree:true});
			}
			else channelname.removeAttribute("changed-by-editchannels");
		}
	}

	changeMention (info, mention, categoryinfo) {
		if (!info || !mention || !mention.parentElement) return;
		if (mention.EditChannelsChangeObserver && typeof mention.EditChannelsChangeObserver.disconnect == "function") mention.EditChannelsChangeObserver.disconnect();
		mention.removeEventListener("mouseover", mention.mouseoverListenerEditChannels);
		mention.removeEventListener("mouseout", mention.mouseoutListenerEditChannels);
		let data = this.getChannelData(info.id, mention);
		let color = BDFDB.colorCONVERT(data.color, "RGBCOMP");
		BDFDB.setInnerText(mention, "#" + (data.name || info.name));
		if (mention.EditChannelsHovered) colorHover();
		else colorDefault();
		mention.mouseoverListenerEditChannels = () => {
			mention.EditChannelsHovered = true;
			colorHover();
			let categorydata = this.getChannelData(categoryinfo.id, mention);
			if (categorydata.name) BDFDB.createTooltip(categorydata.name, mention, {type:"top",selector:"EditChannels-tooltip",css:`body ${BDFDB.dotCN.tooltip}:not(.EditChannels-tooltip) {display: none !important;}`});
		};
		mention.mouseoutListenerEditChannels = () => {
			delete mention.EditChannelsHovered;
			colorDefault();
		};
		mention.addEventListener("mouseover", mention.mouseoverListenerEditChannels);
		mention.addEventListener("mouseout", mention.mouseoutListenerEditChannels);
		mention.EditChannelsChangeObserver = new MutationObserver((changes, _) => {
			mention.EditChannelsChangeObserver.disconnect();
			this.changeMention(info, mention, categoryinfo);
		});
		mention.EditChannelsChangeObserver.observe(mention, {attributes:true});
		function colorDefault() {
			mention.style.setProperty("color", color ? "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")" : null, "important");
			mention.style.setProperty("background", color ? "rgba(" + color[0] + "," + color[1] + "," + color[2] + ",.1)" : null, "important");
		}
		function colorHover() {
			mention.style.setProperty("color", color ? "#FFFFFF" : null, "important");
			mention.style.setProperty("background", color ? "rgba(" + color[0] + "," + color[1] + "," + color[2] + ",.7)" : null, "important");
		}
	}

	chooseColor (channelname, color) {
		if (color && channelname) {
			let classname = channelname.className ? channelname.className.toLowerCase() : "";
			if (classname.indexOf("muted") > -1 || classname.indexOf("locked") > -1) color = BDFDB.colorCHANGE(color, -0.5);
			else if (classname.indexOf("selected") > -1 || classname.indexOf("hovered") > -1 || classname.indexOf("unread") > -1) color = BDFDB.colorCHANGE(color, 0.5);
			return BDFDB.colorCONVERT(color, "RGB");
		}
		return null;
	}
	
	getChannelData (id, wrapper) {
		let data = BDFDB.loadData(id, this, "channels");
		if (!data) return {};
		let allenabled = true, settings = BDFDB.getAllData(this, "settings");
		for (let i in settings) if (!settings[i]) {
			allenabled = false;
			break;
		}
		if (allenabled) return data;
		let key = null;
		if (BDFDB.getParentEle(BDFDB.dotCN.textareawrapchat, wrapper)) key = "changeInChatTextarea";
		else if (BDFDB.containsClass(wrapper, BDFDB.disCN.mentionwrapper)) key = "changeInMentions";
		else if (BDFDB.getParentEle(BDFDB.dotCN.guildchannels, wrapper)) key = "changeInChannelList";
		else if (BDFDB.getParentEle(BDFDB.dotCN.channelheaderheaderbar, wrapper)) key = "changeInChannelHeader";
		else if (BDFDB.getParentEle(BDFDB.dotCN.recentmentionspopout, wrapper)) key = "changeInRecentMentions";
		else if (BDFDB.getParentEle(BDFDB.dotCN.autocomplete, wrapper)) key = "changeInAutoComplete";
		else if (BDFDB.getParentEle(BDFDB.dotCN.auditlog, wrapper)) key = "changeInAuditLog";
		else if (BDFDB.getParentEle(BDFDB.dotCN.guildsettingsinvitecard, wrapper)) key = "changeInInviteLog";
		else if (BDFDB.getParentEle(BDFDB.dotCN.searchpopout, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.quickswitcher, wrapper)) key = "changeInSearchPopout";

		return !key || settings[key] ? data : {};
	}

	addAutoCompleteMenu (textarea, channel) {
		if (textarea.parentElement.querySelector(".autocompleteEditChannelsRow")) return;
		let words = textarea.value.split(/\s/);
		let lastword = words[words.length-1].trim();
		if (lastword && lastword.length > 1 && lastword[0] == "#") {
			let channels = BDFDB.loadAllData(this, "channels");
			if (!channels) return;
			let channelarray = [];
			for (let id in channels) if (channels[id].name) {
				let channel = this.ChannelUtils.getChannel(id);
				let category = channel && channel.parent_id ? this.ChannelUtils.getChannel(channel.parent_id) : null;
				let catdata = (category ? channels[category.id] : null) || {};
				if (channel && channel.type == 0) channelarray.push(Object.assign({lowercasename:channels[id].name.toLowerCase(),lowercasecatname:(catdata && catdata.name ? catdata.name.toLowerCase() : null),channel,category,catdata},channels[id])); 
			}
			channelarray = BDFDB.sortArrayByKey(channelarray.filter(n => n.lowercasename.indexOf(lastword.toLowerCase().slice(1)) != -1 || (n.lowercasecatname && n.lowercasecatname.indexOf(lastword.toLowerCase().slice(1)) != -1)), "lowercasename");
			if (channelarray.length) {
				let settings = BDFDB.getAllData(this, "settings");
				let autocompletemenu = textarea.parentElement.querySelector(BDFDB.dotCNS.autocomplete + BDFDB.dotCN.autocompleteinner), amount = 15;
				if (!autocompletemenu) {
					autocompletemenu = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.autocomplete + BDFDB.disCN.autocomplete2} autocompleteEditChannels"><div class="${BDFDB.disCN.autocompleteinner}"><div class="${BDFDB.disCNS.autocompleterowvertical + BDFDB.disCN.autocompleterow} autocompleteEditChannelsRow"><div class="${BDFDB.disCN.autocompleteselector} autocompleteEditChannelsSelector"><div class="${BDFDB.disCNS.autocompletecontenttitle + BDFDB.disCNS.small + BDFDB.disCNS.size12 + BDFDB.disCNS.height16 + BDFDB.disCN.weightsemibold}">${BDFDB.LanguageStrings.TEXT_CHANNELS_MATCHING.replace("{{prefix}}", BDFDB.encodeToHTML(lastword))}</strong></div></div></div></div></div>`);
					textarea.parentElement.appendChild(autocompletemenu);
					autocompletemenu = autocompletemenu.firstElementChild;
				}
				else {
					amount -= autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselectable).length;
				}

				BDFDB.addEventListener(this, autocompletemenu, "mouseenter", BDFDB.dotCN.autocompleteselectable, e => {
					var selected = autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselected);
					BDFDB.removeClass(selected, BDFDB.disCN.autocompleteselected);
					BDFDB.addClass(selected, BDFDB.disCN.autocompleteselector);
					BDFDB.addClass(e.currentTarget, BDFDB.disCN.autocompleteselected);
				});

				for (let data of channelarray) {
					if (amount-- < 1) break;
					let color = BDFDB.colorCONVERT(data.color, "RGB");
					let catcolor = BDFDB.colorCONVERT(data.catdata.color, "RGB");
					let autocompleterow = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.autocompleterowvertical + BDFDB.disCN.autocompleterow} autocompleteEditChannelsRow"><div channelid="${data.channel.id}" class="${BDFDB.disCNS.autocompleteselector + BDFDB.disCN.autocompleteselectable} autocompleteEditChannelsSelector"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.autocompletecontent}" style="flex: 1 1 auto;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="${BDFDB.disCN.autocompleteicon}"><path class="${BDFDB.disCN.autocompleteiconforeground}" d="M2.27333333,12 L2.74666667,9.33333333 L0.08,9.33333333 L0.313333333,8 L2.98,8 L3.68666667,4 L1.02,4 L1.25333333,2.66666667 L3.92,2.66666667 L4.39333333,0 L5.72666667,0 L5.25333333,2.66666667 L9.25333333,2.66666667 L9.72666667,0 L11.06,0 L10.5866667,2.66666667 L13.2533333,2.66666667 L13.02,4 L10.3533333,4 L9.64666667,8 L12.3133333,8 L12.08,9.33333333 L9.41333333,9.33333333 L8.94,12 L7.60666667,12 L8.08,9.33333333 L4.08,9.33333333 L3.60666667,12 L2.27333333,12 L2.27333333,12 Z M5.02,4 L4.31333333,8 L8.31333333,8 L9.02,4 L5.02,4 L5.02,4 Z" transform="translate(1.333 2)" ${settings.changeChannelIcon && color ? ('fill="' + color + '" oldfill="currentColor" style="fill: ' + color + ' !important;"') : 'fill="currentColor"'}></path></svg><div class="${BDFDB.disCN.marginleft4}" changed-by-editchannels="true" style="flex: 1 1 auto;${color ? (' color: ' + color + ' !important;') : ''}">${BDFDB.encodeToHTML(data.name || data.channel.name)}</div>${data.category ? '<div class="${BDFDB.disCN.autocompletedescription}"' + (catcolor ? (' style="color: ' + catcolor + ' !important;"') : '') + '>' + BDFDB.encodeToHTML(data.catdata.name || data.category.name) + '</div>' : ''}</div></div></div>`);
					autocompleterow.querySelector(BDFDB.dotCN.autocompleteselectable).addEventListener("click", () => {this.swapWordWithMention(textarea);});
					autocompletemenu.appendChild(autocompleterow);
				}
				if (!autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected)) {
					BDFDB.addClass(autocompletemenu.querySelector(".autocompleteEditChannelsRow " + BDFDB.dotCN.autocompleteselectable), BDFDB.disCN.autocompleteselected);
				}
			}
		}
	}

	getNextSelection (menu, selected, forward) {
		selected = selected ? selected : menu.querySelector(BDFDB.dotCN.autocompleteselected).parentElement;
		let next, sibling = forward ? selected.nextElementSibling : selected.previousElementSibling;
		if (sibling) {
			next = sibling.querySelector(BDFDB.dotCN.autocompleteselectable);
		}
		else {
			let items = menu.querySelectorAll(BDFDB.dotCN.autocompleteselectable);
			next = forward ? items[0] : items[items.length-1]; 
		}
		return next ? next : this.getNextSelection(menu, sibling, forward);
	}

	swapWordWithMention (textarea) {
		let selected = textarea.parentElement.querySelector(".autocompleteEditChannelsRow " + BDFDB.dotCN.autocompleteselected);
		let channelid = selected ? selected.getAttribute("channelid") : null;
		let words = textarea.value.split(/\s/);
		let lastword = words[words.length-1].trim();
		if (channelid && lastword) {
			BDFDB.removeEles(".autocompleteEditChannels", ".autocompleteEditChannelsRow");
			textarea.focus(); 
			textarea.selectionStart = textarea.value.length - lastword.length;
			textarea.selectionEnd = textarea.value.length;
			document.execCommand("insertText", false, `<#${channelid}> `);
			textarea.selectionStart = textarea.value.length;
			textarea.selectionEnd = textarea.value.length;
		}
	}

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					context_localchannelsettings_text:		"Postavke lokalnih kanala",
					submenu_channelsettings_text:			"Promijeni postavke",
					submenu_resetsettings_text:				"Vraćanje kanala",
					modal_header_text:						"Postavke lokalnih kanala",
					modal_channelname_text:					"Naziv lokalnog kanala",
					modal_colorpicker1_text:				"Boja lokalnog kanala",
					btn_cancel_text:						"Prekid",
					btn_save_text:							"Uštedjeti"
				};
			case "da":		//danish
				return {
					context_localchannelsettings_text:		"Lokal kanalindstillinger",
					submenu_channelsettings_text:			"Skift indstillinger",
					submenu_resetsettings_text:				"Nulstil kanal",
					modal_header_text:						"Lokal kanalindstillinger",
					modal_channelname_text:					"Lokalt kanalnavn",
					modal_colorpicker1_text:				"Lokal kanalfarve",
					btn_cancel_text:						"Afbryde",
					btn_save_text:							"Spare"
				};
			case "de":		//german
				return {
					context_localchannelsettings_text:		"Lokale Kanaleinstellungen",
					submenu_channelsettings_text:			"Einstellungen ändern",
					submenu_resetsettings_text:				"Kanal zurücksetzen",
					modal_header_text:						"Lokale Kanaleinstellungen",
					modal_channelname_text:					"Lokaler Kanalname",
					modal_colorpicker1_text:				"Lokale Kanalfarbe",
					btn_cancel_text:						"Abbrechen",
					btn_save_text:							"Speichern"
				};
			case "es":		//spanish
				return {
					context_localchannelsettings_text:		"Ajustes local de canal",
					submenu_channelsettings_text:			"Cambiar ajustes",
					submenu_resetsettings_text:				"Restablecer canal",
					modal_header_text:						"Ajustes local de canal",
					modal_channelname_text:					"Nombre local del canal",
					modal_colorpicker1_text:				"Color local del canal",
					btn_cancel_text:						"Cancelar",
					btn_save_text:							"Guardar"
				};
			case "fr":		//french
				return {
					context_localchannelsettings_text:		"Paramètres locale du canal",
					submenu_channelsettings_text:			"Modifier les paramètres",
					submenu_resetsettings_text:				"Réinitialiser le canal",
					modal_header_text:						"Paramètres locale du canal",
					modal_channelname_text:					"Nom local du canal",
					modal_colorpicker1_text:				"Couleur locale de la chaîne",
					btn_cancel_text:						"Abandonner",
					btn_save_text:							"Enregistrer"
				};
			case "it":		//italian
				return {
					context_localchannelsettings_text:		"Impostazioni locale canale",
					submenu_channelsettings_text:			"Cambia impostazioni",
					submenu_resetsettings_text:				"Ripristina canale",
					modal_header_text:						"Impostazioni locale canale",
					modal_channelname_text:					"Nome locale canale",
					modal_colorpicker1_text:				"Colore locale canale",
					btn_cancel_text:						"Cancellare",
					btn_save_text:							"Salvare"
				};
			case "nl":		//dutch
				return {
					context_localchannelsettings_text:		"Lokale kanaalinstellingen",
					submenu_channelsettings_text:			"Verandere instellingen",
					submenu_resetsettings_text:				"Reset kanaal",
					modal_header_text:						"Lokale kanaalinstellingen",
					modal_channelname_text:					"Lokale kanaalnaam",
					modal_colorpicker1_text:				"Lokale kanaalkleur",
					btn_cancel_text:						"Afbreken",
					btn_save_text:							"Opslaan"
				};
			case "no":		//norwegian
				return {
					context_localchannelsettings_text:		"Lokal kanalinnstillinger",
					submenu_channelsettings_text:			"Endre innstillinger",
					submenu_resetsettings_text:				"Tilbakestill kanal",
					modal_header_text:						"Lokal kanalinnstillinger",
					modal_channelname_text:					"Lokalt kanalnavn",
					modal_colorpicker1_text:				"Lokal kanalfarge",
					btn_cancel_text:						"Avbryte",
					btn_save_text:							"Lagre"
				};
			case "pl":		//polish
				return {
					context_localchannelsettings_text:		"Lokalne ustawienia kanału",
					submenu_channelsettings_text:			"Zmień ustawienia",
					submenu_resetsettings_text:				"Resetuj ustawienia",
					modal_header_text:						"Lokalne ustawienia kanału",
					modal_channelname_text:					"Lokalna nazwa kanału",
					modal_colorpicker1_text:				"Lokalny kolor kanału",
					btn_cancel_text:						"Anuluj",
					btn_save_text:							"Zapisz"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_localchannelsettings_text:		"Configurações local do canal",
					submenu_channelsettings_text:			"Mudar configurações",
					submenu_resetsettings_text:				"Redefinir canal",
					modal_header_text:						"Configurações local do canal",
					modal_channelname_text:					"Nome local do canal",
					modal_colorpicker1_text:				"Cor local do canal",
					btn_cancel_text:						"Cancelar",
					btn_save_text:							"Salvar"
				};
			case "fi":		//finnish
				return {
					context_localchannelsettings_text:		"Paikallinen kanavan asetukset",
					submenu_channelsettings_text:			"Vaihda asetuksia",
					submenu_resetsettings_text:				"Nollaa kanava",
					modal_header_text:						"Paikallinen kanavan asetukset",
					modal_channelname_text:					"Paikallinen kanavanimi",
					modal_colorpicker1_text:				"Paikallinen kanavanväri",
					btn_cancel_text:						"Peruuttaa",
					btn_save_text:							"Tallentaa"
				};
			case "sv":		//swedish
				return {
					context_localchannelsettings_text:		"Lokal kanalinställningar",
					submenu_channelsettings_text:			"Ändra inställningar",
					submenu_resetsettings_text:				"Återställ kanal",
					modal_header_text:						"Lokal kanalinställningar",
					modal_channelname_text:					"Lokalt kanalnamn",
					modal_colorpicker1_text:				"Lokal kanalfärg",
					btn_cancel_text:						"Avbryta",
					btn_save_text:							"Spara"
				};
			case "tr":		//turkish
				return {
					context_localchannelsettings_text:		"Yerel Kanal Ayarları",
					submenu_channelsettings_text:			"Ayarları Değiştir",
					submenu_resetsettings_text:				"Kanal Sıfırla",
					modal_header_text:						"Yerel Kanal Ayarları",
					modal_channelname_text:					"Yerel Kanal Adı",
					modal_colorpicker1_text:				"Yerel Kanal Rengi",
					btn_cancel_text:						"Iptal",
					btn_save_text:							"Kayıt"
				};
			case "cs":		//czech
				return {
					context_localchannelsettings_text:		"Místní nastavení kanálu",
					submenu_channelsettings_text:			"Změnit nastavení",
					submenu_resetsettings_text:				"Obnovit kanál",
					modal_header_text:						"Místní nastavení kanálu",
					modal_channelname_text:					"Místní název kanálu",
					modal_colorpicker1_text:				"Místní barvy kanálu",
					btn_cancel_text:						"Zrušení",
					btn_save_text:							"Uložit"
				};
			case "bg":		//bulgarian
				return {
					context_localchannelsettings_text:		"Настройки за локални канали",
					submenu_channelsettings_text:			"Промяна на настройките",
					submenu_resetsettings_text:				"Възстановяване на канал",
					modal_header_text:						"Настройки за локални канали",
					modal_channelname_text:					"Локално име на канал",
					modal_colorpicker1_text:				"Локален цветен канал",
					btn_cancel_text:						"Зъбести",
					btn_save_text:							"Cпасяване"
				};
			case "ru":		//russian
				return {
					context_localchannelsettings_text:		"Настройки локального канала",
					submenu_channelsettings_text:			"Изменить настройки",
					submenu_resetsettings_text:				"Сбросить канал",
					modal_header_text:						"Настройки локального канала",
					modal_channelname_text:					"Имя локального канала",
					modal_colorpicker1_text:				"Цвет локального канала",
					btn_cancel_text:						"Отмена",
					btn_save_text:							"Cпасти"
				};
			case "uk":		//ukrainian
				return {
					context_localchannelsettings_text:		"Налаштування локального каналу",
					submenu_channelsettings_text:			"Змінити налаштування",
					submenu_resetsettings_text:				"Скидання каналу",
					modal_header_text:						"Налаштування локального каналу",
					modal_channelname_text:					"Локальне ім'я каналу",
					modal_colorpicker1_text:				"Колір місцевого каналу",
					btn_cancel_text:						"Скасувати",
					btn_save_text:							"Зберегти"
				};
			case "ja":		//japanese
				return {
					context_localchannelsettings_text:		"ローカルチャネル設定",
					submenu_channelsettings_text:			"設定を変更する",
					submenu_resetsettings_text:				"チャネルをリセットする",
					modal_header_text:						"ローカルチャネル設定",
					modal_channelname_text:					"ローカルチャネル名",
					modal_colorpicker1_text:				"ローカルチャネルの色",
					btn_cancel_text:						"キャンセル",
					btn_save_text:							"セーブ"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_localchannelsettings_text:		"本地頻道設置",
					submenu_channelsettings_text:			"更改設置",
					submenu_resetsettings_text:				"重置通道",
					modal_header_text:						"本地頻道設置",
					modal_channelname_text:					"本地頻道名稱",
					modal_colorpicker1_text:				"本地頻道顏色",
					btn_cancel_text:						"取消",
					btn_save_text:							"保存"
				};
			case "ko":		//korean
				return {
					context_localchannelsettings_text:		"로컬 채널 설정",
					submenu_channelsettings_text:			"설정 변경",
					submenu_resetsettings_text:				"채널 재설정",
					modal_header_text:						"로컬 채널 설정",
					modal_channelname_text:					"로컬 채널 이름",
					modal_colorpicker1_text:				"지역 채널 색깔",
					btn_cancel_text:						"취소",
					btn_save_text:							"저장"
				};
			default:		//default: english
				return {
					context_localchannelsettings_text:		"Local Channelsettings",
					submenu_channelsettings_text:			"Change Settings",
					submenu_resetsettings_text:				"Reset Channel",
					modal_header_text:						"Local Channelsettings",
					modal_channelname_text:					"Local Channelname",
					modal_colorpicker1_text:				"Local Channelcolor",
					btn_cancel_text:						"Cancel",
					btn_save_text:							"Save"
				};
		}
	}
}
