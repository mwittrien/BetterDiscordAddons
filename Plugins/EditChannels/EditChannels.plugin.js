//META{"name":"EditChannels"}*//

class EditChannels {
	getName () {return "EditChannels";}

	getVersion () {return "3.8.8";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to rename and recolor channelnames.";}
	
	initConstructor () {
		this.labels = {};
		
		this.patchModules = {
			"ChannelTextArea":"componentDidMount",
			"AuditLog":"componentDidMount",
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
			`<span class="${this.getName()}-modal DevilBro-modal">
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
			${BDFDB.dotCN.channelheadertitletext}[custom-editchannelsheader] ${BDFDB.dotCN.channelheaderchannelicon} {
				opacity: 0.6;
			}
		`;
			
		this.defaults = {
			settings: {
				changeChannelIcon:		{value:true, 	description:"Change color of Channel Icon."},
				changeUnreadIndicator:	{value:true, 	description:"Change color of Unread Indicator."}
			}
		};
	}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var settings = BDFDB.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
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
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {
				BDFDB.loaded = true;
				this.initialize();
			});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.loadMessage(this);
			
			this.UserUtils = BDFDB.WebModules.findByProperties("getUsers","getUser");
			this.ChannelUtils = BDFDB.WebModules.findByProperties("getChannels","getChannel");
			this.CurrentChannelUtils = BDFDB.WebModules.findByProperties("getChannels","getDefaultChannel");
			this.LastGuildStore = BDFDB.WebModules.findByProperties("getLastSelectedGuildId");
			this.LastChannelStore = BDFDB.WebModules.findByProperties("getLastSelectedChannelId");
			
			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			let data = BDFDB.loadAllData(this, "channels");
			BDFDB.removeAllData(this, "channels");
			BDFDB.WebModules.forceAllUpdates(this);
			BDFDB.saveAllData(data, this, "channels");
			
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
			menu.appendChild(channelContextEntry);
			let settingsitem = channelContextEntry.querySelector(".localchannelsettings-item");
			settingsitem.addEventListener("mouseenter", () => {
				let channelContextSubMenu = BDFDB.htmlToElement(this.channelContextSubMenuMarkup);
				let channelitem = channelContextSubMenu.querySelector(".channelsettings-item");
				channelitem.addEventListener("click", () => {
					instance._reactInternalFiber.return.memoizedProps.closeContextMenu();
					this.showChannelSettings(instance.props.channel);
				});
				if (BDFDB.loadData(instance.props.channel.id, this, "channels")) {
					let resetitem = channelContextSubMenu.querySelector(".resetsettings-item");
					BDFDB.removeClass(resetitem, BDFDB.disCN.contextmenuitemdisabled);
					resetitem.addEventListener("click", () => {
						instance._reactInternalFiber.return.memoizedProps.closeContextMenu();
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
			e.preventDefault();
			
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
		if (channel && channel.type == 0 && instance.props.type == "normal") {
			let data = BDFDB.loadData(channel.id, this, "channels") || {};
			wrapper.querySelector("textarea").setAttribute("placeholder", BDFDB.LanguageStrings.TEXTAREA_PLACEHOLDER.replace("{{channel}}", "#" + (data.name || channel.name)));
		}
	}
	
	processAuditLog (instance, wrapper) {
		let channel = BDFDB.getReactValue(instance, "props.log.options.channel");
		if (channel) {
			let hooks = wrapper.querySelectorAll(BDFDB.dotCN.flexchild + " > span:not(" + BDFDB.dotCN.auditloguserhook + ")");
			if (hooks.length > 0) this.changeChannel2(channel, hooks[0].firstChild);
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
				let categoryname = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.type.displayName") == "Tooltip" ? BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.memoizedProps.text") : null;
				for (let channel of this.CurrentChannelUtils.getChannels(this.LastGuildStore.getGuildId())[0]) {
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
			let result = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.result");
			if (result && result.type.indexOf("_CHANNEL") != -1) {
				this.changeChannel(result.record, wrapper.querySelector(BDFDB.dotCN.quickswitchresultmatch));
				if (result.record.parent_id) {
					this.changeChannel(this.ChannelUtils.getChannel(result.record.parent_id), wrapper.querySelector(BDFDB.dotCN.quickswitchresultnote));
				} 
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
		let data = BDFDB.loadData(info.id, this, "channels") || {};
		let settings = BDFDB.getAllData(this, "settings");
		let color = this.chooseColor(channelname, data.color);
		channelname.style.setProperty("color", color, "important");
		BDFDB.setInnerText(channelname, data.name || info.name);
		let iconparent = BDFDB.containsClass(channelname, BDFDB.disCN.quickswitchresultmatch) ? channelname.parentElement.parentElement : channelname.parentElement;
		if (!BDFDB.containsClass(channelname, BDFDB.disCN.autocompletedescription)) {
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
		if (color) {
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
	}
	
	changeChannel2 (info, channelname) {
		if (!info || !channelname || !channelname.parentElement) return;
		if (channelname.EditChannelsChangeObserver && typeof channelname.EditChannelsChangeObserver.disconnect == "function") channelname.EditChannelsChangeObserver.disconnect();
		let data = BDFDB.loadData(info.id, this, "channels") || {};
		let color = this.chooseColor(channelname, data.color);
		channelname.style.setProperty("color", color, "important");
		BDFDB.setInnerText(channelname, "#" + (data.name || info.name));
		if (color) {
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
	}
	
	changeMention (info, mention, categoryinfo) {
		if (!info || !mention || !mention.parentElement) return;
		if (mention.EditChannelsChangeObserver && typeof mention.EditChannelsChangeObserver.disconnect == "function") mention.EditChannelsChangeObserver.disconnect();
		mention.removeEventListener("mouseover", mention.mouseoverListenerEditChannels);
		mention.removeEventListener("mouseout", mention.mouseoutListenerEditChannels);
		let data = BDFDB.loadData(info.id, this, "channels") || {};
		let color = BDFDB.colorCONVERT(data.color, "RGBCOMP");
		BDFDB.setInnerText(mention, "#" + (data.name || info.name));
		if (mention.EditChannelsHovered) colorHover();
		else colorDefault();
		mention.mouseoverListenerEditChannels = () => {
			mention.EditChannelsHovered = true;
			colorHover();
			let categorydata = BDFDB.loadData(categoryinfo.id, this, "channels") || {};
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
