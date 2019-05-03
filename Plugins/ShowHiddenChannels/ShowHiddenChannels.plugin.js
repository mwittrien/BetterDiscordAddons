//META{"name":"ShowHiddenChannels","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ShowHiddenChannels","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ShowHiddenChannels/ShowHiddenChannels.plugin.js"}*//

class ShowHiddenChannels {
	getName () {return "ShowHiddenChannels";}

	getVersion () {return "2.4.9";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Displays channels that are hidden from you by role restrictions.";}

	initConstructor () {
		this.changelog = {
			"added":[["Show Category Name","Added an option that shows the name of the category of a hidden channel in the tooltip (if the channel is the child of a category)"]]
		};
		
		this.patchModules = {
			"Channels":["componentDidMount","componentDidUpdate"],
			"ChannelItem":"componentDidMount",
			"ChannelCategoryItem":"componentDidMount",
			"StandardSidebarView":"componentWillUnmount"
		};
 
		this.categoryMarkup = 
			`<div class="container-hidden">
				<div class="${BDFDB.disCN.categorycontainerdefault} hidden-category" draggable="false">
					<div tabindex="0" class="${BDFDB.disCNS.categoryiconvisibility + BDFDB.disCNS.categorywrapper + BDFDB.disCNS.categorycollapsed + BDFDB.disCNS.categoryclickable}" role="button">
						<svg class="${BDFDB.disCN.categoryicon}" width="24" height="24" viewBox="0 0 24 24">
							<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M16.59 8.59004L12 13.17L7.41 8.59004L6 10L12 16L18 10L16.59 8.59004Z"></path>
						</svg>
						<div class="${BDFDB.disCN.categoryname}">hidden</div>
						<div class="${BDFDB.disCN.categorychildren}"></div>
					</div>
				</div>
			</div>`;

		this.channelMarkup = 
			`<div class="${BDFDB.disCN.channelcontainerdefault} hidden-channel">
				<div tabindex="0" class="${BDFDB.disCNS.channeliconvisibility + BDFDB.disCNS.channelwrapper + BDFDB.disCN.channelmodelocked}" role="button">
					<div class="${BDFDB.disCN.channelcontent}">
						<svg class="${BDFDB.disCN.channelicon}" width="24" height="24" viewBox="0 0 24 24">
							<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d=""></path>
							<path fill="currentColor" d="M21.025 5V4C21.025 2.88 20.05 2 19 2C17.95 2 17 2.88 17 4V5C16.4477 5 16 5.44772 16 6V9C16 9.55228 16.4477 10 17 10H19H21C21.5523 10 22 9.55228 22 9V5.975C22 5.43652 21.5635 5 21.025 5ZM20 5H18V4C18 3.42857 18.4667 3 19 3C19.5333 3 20 3.42857 20 4V5Z"></path>
						</svg>
						<div class="${BDFDB.disCN.channelname}"></div>
						<div class="${BDFDB.disCN.channelchildren}"></div>
					</div>
				</div>
			</div>`;
			
		this.channelMessage = {
			TEXT: `enter the hidden text channel`,
			VOICE: `enter the hidden voice channel`,
			CATEGORY: `open the hidden category`
		}
			
		this.channelIcons = {
			TEXT: `M14 8C14 7.44772 13.5523 7 13 7H9.76001L10.3657 3.58738C10.4201 3.28107 10.1845 3 9.87344 3H8.88907C8.64664 3 8.43914 3.17391 8.39677 3.41262L7.76001 7H4.18011C3.93722 7 3.72946 7.17456 3.68759 7.41381L3.51259 8.41381C3.45905 8.71977 3.69449 9 4.00511 9H7.41001L6.35001 15H2.77011C2.52722 15 2.31946 15.1746 2.27759 15.4138L2.10259 16.4138C2.04905 16.7198 2.28449 17 2.59511 17H6.00001L5.39427 20.4126C5.3399 20.7189 5.57547 21 5.88657 21H6.87094C7.11337 21 7.32088 20.8261 7.36325 20.5874L8.00001 17H14L13.3943 20.4126C13.3399 20.7189 13.5755 21 13.8866 21H14.8709C15.1134 21 15.3209 20.8261 15.3632 20.5874L16 17H19.5799C19.8228 17 20.0306 16.8254 20.0724 16.5862L20.2474 15.5862C20.301 15.2802 20.0655 15 19.7549 15H16.35L16.6758 13.1558C16.7823 12.5529 16.3186 12 15.7063 12C15.2286 12 14.8199 12.3429 14.7368 12.8133L14.3504 15H8.35045L9.41045 9H13C13.5523 9 14 8.55228 14 8Z`,
			VOICE: `M11.383 3.07904C11.009 2.92504 10.579 3.01004 10.293 3.29604L6 8.00204H3C2.45 8.00204 2 8.45304 2 9.00204V15.002C2 15.552 2.45 16.002 3 16.002H6L10.293 20.71C10.579 20.996 11.009 21.082 11.383 20.927C11.757 20.772 12 20.407 12 20.002V4.00204C12 3.59904 11.757 3.23204 11.383 3.07904ZM19 5.00195V7.00195C18.857 0.00195 19 12.24595 19 12.002C19 14.759 16.757 17.002 14 17.002V19.002C17.86 19.002 21 15.863 21 12.002C21 12.14295 22.86 12.00195 19 12.00195ZM14 9.00195C15.654 9.00195 17 10.349 17 12.002C17 13.657 15.654 15.002 14 15.002V13.002C14.551 13.002 15 12.553 15 12.002C15 11.451 14.551 11.002 14 11.002V9.00195Z`,
			CATEGORY: `M9.6,1.6 L9.6,6.4 L3.2,6.4 L3.2,1.6 L9.6,1.6 Z M16,16 L22.4,16 L22.4,20.8 L16,20.8 L16,16.533333328 L16,16 Z M14.4,12.8 L8,12.8 L8,17.6 L14.4,17.6 L14.4,20.8 L8,20.8 L4.8,20.8 L4.8,8 L8,8 L8,9.6 L14.4,9.6 L14.4,12.8 Z`
		};

		this.defaults = {
			settings: {
				showText:				{value:true, 	inner:false,	description:"Show hidden Textchannels:"},
				showVoice:				{value:true, 	inner:false,	description:"Show hidden Voicechannels:"},
				showCategory:			{value:false, 	inner:false,	description:"Show hidden Categories:"},
				showForNormal:			{value:false,	inner:false,	description:"Also show Roles/Users for visible Channels on hover:"},
				showAllowedRoles:		{value:true,	inner:true,		description:"Allowed Roles:"},
				showOverWrittenRoles:	{value:true,	inner:true,		description:"Include overwritten Roles in allowed Roles:"},
				showAllowedUsers:		{value:true,	inner:true,		description:"Specifically allowed Users:"},
				showDeniedRoles:		{value:true,	inner:true,		description:"Denied Roles:"},
				showDeniedUsers:		{value:true,	inner:true,		description:"Specifically denied Users:"},
				showTopic:				{value:false, 	inner:true,		description:"The Topic of the Channel:"},
				showChannelCategory:	{value:false, 	inner:true,		description:"The Category of the Channel:"},
				showVoiceUsers:			{value:false, 	inner:true,		description:"All currently connected Users of a Voice Channel:"}
			},
			amounts: {
				hoverDelay:				{value:0, 		min:0,	description:"Tooltip delay in millisec:"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var settings = BDFDB.getAllData(this, "settings");
		var amounts = BDFDB.getAllData(this, "amounts");
		var settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			if (!this.defaults.settings[key].inner) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Display in the hover Tooltip:</h3></div><div class="BDFDB-settings-inner-list">`;
		for (let key in settings) {
			if (this.defaults.settings[key].inner) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in amounts) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 50%;">${this.defaults.amounts[key].description}</h3><div class="${BDFDB.disCN.inputwrapper} inputNumberWrapper ${BDFDB.disCNS.vertical +  BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn}" style="flex: 1 1 auto;"><span class="numberinput-buttons-zone"><span class="numberinput-button-up"></span><span class="numberinput-button-down"></span></span><input type="number"${(!isNaN(this.defaults.amounts[key].min) && this.defaults.amounts[key].min !== null ? ' min="' + this.defaults.amounts[key].min + '"' : '') + (!isNaN(this.defaults.amounts[key].max) && this.defaults.amounts[key].max !== null ? ' max="' + this.defaults.amounts[key].max + '"' : '')} option="${key}" value="${amounts[key]}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} amount-input"></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

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

			this.UserUtils = BDFDB.WebModules.findByProperties("getUsers", "getUser");
			this.MemberUtils = BDFDB.WebModules.findByProperties("getMember", "getMembers");
			this.GuildUtils = BDFDB.WebModules.findByProperties("getGuilds", "getGuild");
			this.ChannelUtils = BDFDB.WebModules.findByProperties("getChannels", "getDMFromUserId");
			this.VoiceUtils = BDFDB.WebModules.findByProperties("getAllVoiceStates", "getVoiceStatesForChannel");
			this.GuildChannels = BDFDB.WebModules.findByProperties("getChannels", "getDefaultChannel");
			this.ChannelTypes = BDFDB.WebModules.findByProperties("ChannelTypes").ChannelTypes;
			this.Permissions = BDFDB.WebModules.findByProperties("Permissions", "ActivityTypes").Permissions;

			BDFDB.WebModules.forceAllUpdates(this, "Channels");
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".container-hidden");
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	processChannels (instance, wrapper, methodnames) {
		if (instance.props && instance.props.guild) {
			if (methodnames.includes("componentDidMount")) this.appendHiddenContainer(instance.props.guild);
			if (methodnames.includes("componentDidUpdate")) this.reappendHiddenContainer(instance.props.guild);
		}
	}

	processChannelItem (instance, wrapper) {
		if (instance.props && instance.props.channel) this.reappendHiddenContainer(this.GuildUtils.getGuild(instance.props.channel.guild_id));
	}

	processChannelCategoryItem (instance, wrapper) {
		if (instance.props && instance.props.channel) this.reappendHiddenContainer(this.GuildUtils.getGuild(instance.props.channel.guild_id));
	}

	processStandardSidebarView (instance, wrapper) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			BDFDB.WebModules.forceAllUpdates(this, "Channels");
		}
	}

	appendHiddenContainer (guild) {
		BDFDB.removeEles(".container-hidden");
		if (!guild) return;
		this.currentGuild = guild.id;
		var allChannels = this.ChannelUtils.getChannels();
		var shownChannels = this.GuildChannels.getChannels(guild.id);
		var hiddenChannels = {};

		for (let type in this.ChannelTypes) hiddenChannels[this.ChannelTypes[type]] = [];

		for (let channel_id in allChannels) {
			var channel = allChannels[channel_id];
			if (channel.guild_id == guild.id) {
				var isHidden = true;
				if (channel.type == this.ChannelTypes.GUILD_CATEGORY) {
					for (let type in this.ChannelTypes) {
						let shownChannelsOfType = this.ChannelTypes[type] == 0 && shownChannels.SELECTABLE ? shownChannels.SELECTABLE : shownChannels[this.ChannelTypes[type]];
						if (shownChannelsOfType) for (let shownChannel of shownChannelsOfType) {
							if (!channel.id || shownChannel.channel.parent_id == channel.id) {
								isHidden = false;
								break;
							}
						}
					}
				}
				else {
					let shownChannelsOfType = channel.type == 0 && shownChannels.SELECTABLE ? shownChannels.SELECTABLE : shownChannels[channel.type];
					if (shownChannelsOfType) for (let shownChannel of shownChannelsOfType) if (shownChannel.channel.id == channel.id) {
						isHidden = false;
						break;
					}
				}
				if (isHidden) hiddenChannels[channel.type].push(channel);
			}
		}


		var settings = BDFDB.getAllData(this, "settings"); 
		var count = 0;
		for (let type in this.ChannelTypes) {
			if (!settings.showText && type == "GUILD_TEXT" || !settings.showVoice && type == "GUILD_VOICE" || !settings.showCategory && type == "GUILD_CATEGORY") {
				hiddenChannels[this.ChannelTypes[type]] = [];
			}
			BDFDB.sortArrayByKey(hiddenChannels[this.ChannelTypes[type]], "name");
			count += hiddenChannels[this.ChannelTypes[type]].length;
		}
		hiddenChannels.count = count;

		if (count > 0) {
			var category = BDFDB.htmlToElement(this.categoryMarkup);
			var wrapper = category.querySelector(BDFDB.dotCN.categorywrapper);
			category.setAttribute("guild", guild.id);
			wrapper.addEventListener("click", () => {
				BDFDB.toggleClass(wrapper, BDFDB.disCN.categorycollapsed);

				var visibile = !BDFDB.containsClass(wrapper, BDFDB.disCN.categorycollapsed);
				BDFDB.toggleEles(category.querySelectorAll(BDFDB.dotCN.channelcontainerdefault), visibile);
				BDFDB.saveData(guild.id, visibile, this, "categorystatus");
			});

			for (let hiddenChannel of hiddenChannels[0]) this.createChannel(guild, category, hiddenChannel, "TEXT");
			for (let hiddenChannel of hiddenChannels[2]) this.createChannel(guild, category, hiddenChannel, "VOICE");
			for (let hiddenChannel of hiddenChannels[4]) this.createChannel(guild, category, hiddenChannel, "CATEGORY");
			
			var isvisibile = BDFDB.loadData(guild.id, this, "categorystatus") === true;
			BDFDB.toggleClass(wrapper, BDFDB.disCN.categorycollapsed, !isvisibile);
			BDFDB.toggleEles(category.querySelectorAll(BDFDB.dotCN.channelcontainerdefault), isvisibile);

			this.reappendHiddenContainer(guild, category);
		}
		let channellist = document.querySelector(BDFDB.dotCNS.channels + BDFDB.dotCN.scroller);
		if (channellist) {
			BDFDB.removeEventListener(this, channellist, "mouseenter", BDFDB.dotCNC.channelcontainerdefault + BDFDB.dotCN.categorycontainerdefault);
			if (settings.showForNormal) BDFDB.addEventListener(this, channellist, "mouseenter", BDFDB.dotCNC.channelcontainerdefault + BDFDB.dotCN.categorycontainerdefault, e => {
				if (!BDFDB.containsClass(e.currentTarget, "hidden-channel")) {
					var channel = BDFDB.getKeyInformation({"node":e.currentTarget,"key":"channel"});
					if (channel) this.showAccessRoles(guild, channel, e, false);
				}
			});
		}
	}
	
	createChannel (guild, category, info, type) {
		let channel = BDFDB.htmlToElement(this.channelMarkup);
		channel.querySelector(BDFDB.dotCN.channelname).innerText = info.name;
		channel.querySelector(BDFDB.dotCNS.channelicon + "path").setAttribute("d", this.channelIcons[type]);
		this.setReactInstanceOfChannel(info, channel);
		BDFDB.addChildEventListener(channel, "mouseenter mouseleave", BDFDB.dotCN.channelwrapper, e => {
			this.showAccessRoles(guild, info, e, false);
		});
		channel.addEventListener("click", () => {
			BDFDB.showToast(`You can not ${this.channelMessage[type]}&nbsp;&nbsp;<strong>${BDFDB.encodeToHTML(info.name)}</strong>.`, {type:"error", html:true});
		});
		channel.addEventListener("contextmenu", e => {
			this.createHiddenObjContextMenu(guild, info, type, e);
		});
		category.appendChild(channel);
	}

	reappendHiddenContainer (guild, category = document.querySelector(BDFDB.dotCNS.channels + BDFDB.dotCNS.scroller + ".container-hidden")) {
		if (!guild) return;
		if (guild.id != this.currentGuild) this.appendHiddenContainer(guild);
		else if (category) {
			var scroller = document.querySelector(BDFDB.dotCNS.channels + BDFDB.dotCN.scroller);
			if (!scroller || scroller.lastChild.previousSibling == category) return;
			category.remove();
			let count = parseInt(scroller.lastChild.previousSibling.className.split("-")[1])+1;
			category.className = "container-" + count + " container-hidden";
			scroller.insertBefore(category, scroller.lastChild);
		}
	}

	setReactInstanceOfChannel (guild, div) {
		var reactInstance = BDFDB.React.createElement(div);
		reactInstance.memoizedProps = {channel:guild};
		div.__reactInternalInstance = reactInstance;
	}

	createHiddenObjContextMenu (guild, channel, type, e) {
		BDFDB.stopEvent(e);
		var contextMenu = BDFDB.htmlToElement(`<div class="${BDFDB.disCN.contextmenu} showhiddenchannels-contextmenu">${BDFDB.isPluginEnabled("PermissionsViewer") ? '<div class="' + BDFDB.disCN.contextmenuitemgroup + '"><div class="' + BDFDB.disCN.contextmenuitem + '" style="display: none !important;"></div></div>' : ''}<div class="${BDFDB.disCN.contextmenuitemgroup}"><div class="${BDFDB.disCN.contextmenuitem} copyid-item"><span>${BDFDB.LanguageStrings.COPY_ID}</span><div class="${BDFDB.disCN.contextmenuhint}"></div></div></div></div>`);
		var reactInstance = BDFDB.React.createElement(contextMenu);
		reactInstance.memoizedProps = {displayName:"ChannelDeleteGroup",guild,channel};
		reactInstance.return = {memoizedProps:{type:("CHANNEL_LIST_" + type),guild,channel}};
		contextMenu.__reactInternalInstance = reactInstance;
		BDFDB.addChildEventListener(contextMenu, "click", ".copyid-item", e2 => {
			contextMenu.remove();
			require("electron").clipboard.write({text: channel.id});
		});

		BDFDB.appendContextMenu(contextMenu, e);
	}

	showAccessRoles (guild, channel, e, allowed) {
		if ((e.type != "mouseenter" && e.type != "mouseover") || !guild || !channel) return;
		var settings = BDFDB.getAllData(this, "settings");
		var myMember = this.MemberUtils.getMember(guild.id, BDFDB.myData.id);
		var allowedRoles = [], allowedUsers = [], overwrittenRoles = [], deniedRoles = [], deniedUsers = [];
		var everyoneDenied = false;
		for (let id in channel.permissionOverwrites) {
			if (settings.showAllowedRoles && channel.permissionOverwrites[id].type == "role" && (guild.roles[id].name != "@everyone") && ((channel.permissionOverwrites[id].allow | this.Permissions.VIEW_CHANNEL) == channel.permissionOverwrites[id].allow || (channel.permissionOverwrites[id].allow | this.Permissions.CONNECT) == channel.permissionOverwrites[id].allow)) {
				if (myMember.roles.includes(id) && !allowed) {
					if (settings.showOverWrittenRoles) overwrittenRoles.push(guild.roles[id]);
				}
				else {
					allowedRoles.push(guild.roles[id]);
				}
			}
			else if (settings.showAllowedUsers && channel.permissionOverwrites[id].type == "member" && ((channel.permissionOverwrites[id].allow | this.Permissions.VIEW_CHANNEL) == channel.permissionOverwrites[id].allow || (channel.permissionOverwrites[id].allow | this.Permissions.CONNECT) == channel.permissionOverwrites[id].allow)) {
				let user = this.UserUtils.getUser(id);
				let member = this.MemberUtils.getMember(guild.id,id);
				if (user && member) allowedUsers.push(Object.assign({name:user.username,id:user.id},member));
			}
			if (settings.showDeniedRoles && channel.permissionOverwrites[id].type == "role" && ((channel.permissionOverwrites[id].deny | this.Permissions.VIEW_CHANNEL) == channel.permissionOverwrites[id].deny || (channel.permissionOverwrites[id].deny | this.Permissions.CONNECT) == channel.permissionOverwrites[id].deny)) {
				deniedRoles.push(guild.roles[id]);
				if (guild.roles[id].name == "@everyone") everyoneDenied = true;
			}
			else if (settings.showDeniedUsers && channel.permissionOverwrites[id].type == "member" && ((channel.permissionOverwrites[id].deny | this.Permissions.VIEW_CHANNEL) == channel.permissionOverwrites[id].deny || (channel.permissionOverwrites[id].deny | this.Permissions.CONNECT) == channel.permissionOverwrites[id].deny)) {
				let user = this.UserUtils.getUser(id);
				let member = this.MemberUtils.getMember(guild.id, id);
				if (user && member) deniedUsers.push(Object.assign({name:user.username,id:user.id},member));
			}
		}
		if (settings.showAllowedRoles && allowed && !everyoneDenied) {
			allowedRoles.push({"name":"@everyone"});
		}
		var htmlString = ``;
		if (settings.showChannelCategory && !allowed && channel.parent_id) {
			htmlString += `<div class="${BDFDB.disCN.marginbottom4}">Category:</div><div class="${BDFDB.disCNS.flex + BDFDB.disCN.wrap}"><div class="${BDFDB.disCNS.userpopoutrole + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCN.wrap + BDFDB.disCNS.size12 + BDFDB.disCN.weightmedium} SHC-category" style="border-color: rgba(255, 255, 255, 0.6); height: unset !important; padding-top: 5px; padding-bottom: 5px; max-width: ${window.outerWidth/3}px; text-transform: uppercase;">${BDFDB.encodeToHTML(this.ChannelUtils.getChannel(channel.parent_id).name)}</div></div>`;
		}
		if (settings.showTopic && !allowed && channel.topic && channel.topic.replace(/[\t\n\r\s]/g, "")) {
			htmlString += `<div class="${BDFDB.disCN.marginbottom4}">Topic:</div><div class="${BDFDB.disCNS.flex + BDFDB.disCN.wrap}"><div class="${BDFDB.disCNS.userpopoutrole + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCN.wrap + BDFDB.disCNS.size12 + BDFDB.disCN.weightmedium} SHC-topic" style="border-color: rgba(255, 255, 255, 0.6); height: unset !important; padding-top: 5px; padding-bottom: 5px; max-width: ${window.outerWidth/3}px">${BDFDB.encodeToHTML(channel.topic)}</div></div>`;
		}
		if (settings.showVoiceUsers && (!allowed || e.currentTarget.querySelector(BDFDB.dotCN.channelnamelockedvoice)) && channel.type == 2) {
			let voicestates = this.VoiceUtils.getVoiceStatesForChannel(guild.id, channel.id);
			if (voicestates.length > 0) {
				htmlString += `<div class="${BDFDB.disCN.marginbottom4}">Connected Voice Users:</div><div class="${BDFDB.disCNS.flex + BDFDB.disCN.wrap}">`;
				for (let voicestate of voicestates) {
					let user = this.UserUtils.getUser(voicestate.userId);
					let member = this.MemberUtils.getMember(guild.id, voicestate.userId);
					if (user && member) {
						let color = member.colorString ? BDFDB.colorCONVERT(member.colorString, "RGBCOMP") : [255,255,255];
						htmlString += `<div class="${BDFDB.disCNS.userpopoutrole + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCN.wrap + BDFDB.disCNS.size12 + BDFDB.disCN.weightmedium} SHC-voiceuser" style="padding-left: 0; border-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6);"><div class="${BDFDB.disCNS.avatarimage + BDFDB.disCN.avatarxsmall}" style="margin-right: 4px; z-index: 1003; background-image: url(${BDFDB.getUserAvatar(user.id)});"></div><div class="${BDFDB.disCN.userpopoutrolecircle}" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]});"></div><div class="${BDFDB.disCNS.userpopoutrolename}">${BDFDB.encodeToHTML(member.nick || user.username)}</div></div>`;
					}
				}
				htmlString += `</div>`;
			}
		}
		if (allowedRoles.length > 0 || overwrittenRoles.length > 0) {
			htmlString += `<div class="${BDFDB.disCN.marginbottom4}">Allowed Roles:</div><div class="${BDFDB.disCNS.flex + BDFDB.disCN.wrap}">`;
			for (let role of allowedRoles) {
				let color = role.colorString ? BDFDB.colorCONVERT(role.colorString, "RGBCOMP") : [255,255,255];
				htmlString += `<div class="${BDFDB.disCNS.userpopoutrole + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCN.wrap + BDFDB.disCNS.size12 + BDFDB.disCN.weightmedium} SHC-allowedrole" style="border-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6);"><div class="${BDFDB.disCN.userpopoutrolecircle}" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]});"></div><div class="${BDFDB.disCNS.userpopoutrolename}">${BDFDB.encodeToHTML(role.name)}</div></div>`;
			}
			for (let role of overwrittenRoles) {
				let color = role.colorString ? BDFDB.colorCONVERT(role.colorString, "RGBCOMP") : [255,255,255];
				htmlString += `<div class="${BDFDB.disCNS.userpopoutrole + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCN.wrap + BDFDB.disCNS.size12 + BDFDB.disCN.weightmedium} SHC-overwrittenrole" style="border-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6);"><div class="${BDFDB.disCN.userpopoutrolecircle}" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]});"></div><div class="${BDFDB.disCNS.userpopoutrolename}" style="text-decoration: line-through !important;">${BDFDB.encodeToHTML(role.name)}</div></div>`;
			}
			htmlString += `</div>`;
		}
		if (allowedUsers.length > 0) {
			htmlString += `<div class="${BDFDB.disCN.marginbottom4}">Allowed Users:</div><div class="${BDFDB.disCNS.flex + BDFDB.disCN.wrap}">`;
			for (let user of allowedUsers) {
				let color = user.colorString ? BDFDB.colorCONVERT(user.colorString, "RGBCOMP") : [255,255,255];
				htmlString += `<div class="${BDFDB.disCNS.userpopoutrole + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCN.wrap + BDFDB.disCNS.size12 + BDFDB.disCN.weightmedium} SHC-alloweduser" style="padding-left: 0; border-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6);"><div class="${BDFDB.disCNS.avatarimage + BDFDB.disCN.avatarxsmall}" style="margin-right: 4px; z-index: 1003; background-image: url(${BDFDB.getUserAvatar(user.id)});"></div><div class="${BDFDB.disCN.userpopoutrolecircle}" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]});"></div><div class="${BDFDB.disCNS.userpopoutrolename}">${BDFDB.encodeToHTML(user.nick || user.name)}</div></div>`;
			}
			htmlString += `</div>`;
		}
		if (deniedRoles.length > 0) {
			htmlString += `<div class="${BDFDB.disCN.marginbottom4}">Denied Roles:</div><div class="${BDFDB.disCNS.flex + BDFDB.disCN.wrap}">`;
			for (let role of deniedRoles) {
				let color = role.colorString ? BDFDB.colorCONVERT(role.colorString, "RGBCOMP") : [255,255,255];
				htmlString += `<div class="${BDFDB.disCNS.userpopoutrole + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCN.wrap + BDFDB.disCNS.size12 + BDFDB.disCN.weightmedium} SHC-deniedrole" style="border-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6);"><div class="${BDFDB.disCN.userpopoutrolecircle}" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]});"></div><div class="${BDFDB.disCNS.userpopoutrolename}">${BDFDB.encodeToHTML(role.name)}</div></div>`;
			}
			htmlString += `</div>`;
		}
		if (deniedUsers.length > 0) {
			htmlString += `<div class="${BDFDB.disCN.marginbottom4}">Denied Users:</div><div class="${BDFDB.disCNS.flex + BDFDB.disCN.wrap}">`;
			for (let user of deniedUsers) {
				let color = user.colorString ? BDFDB.colorCONVERT(user.colorString, "RGBCOMP") : [255,255,255];
				htmlString += `<div class="${BDFDB.disCNS.userpopoutrole + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCN.wrap + BDFDB.disCNS.size12 + BDFDB.disCN.weightmedium} SHC-denieduser" style="padding-left: 0; border-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6);"><div class="${BDFDB.disCNS.avatarimage + BDFDB.disCN.avatarxsmall}" style="margin-right: 4px; z-index: 1003; background-image: url(${BDFDB.getUserAvatar(user.id)});"></div><div class="${BDFDB.disCN.userpopoutrolecircle}" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]});"></div><div class="${BDFDB.disCNS.userpopoutrolename}">${BDFDB.encodeToHTML(user.nick || user.name)}</div></div>`;
			}
			htmlString += `</div>`;
		}
		if (htmlString) {
			var width = window.outerWidth/2;
			var tooltip = BDFDB.createTooltip(htmlString, e.currentTarget, {type:"right", selector:"showhiddenchannels-tooltip", html:true, style:`max-width: ${width < 200 ? 400 : width}px !important;`, delay:BDFDB.getData("hoverDelay", this, "amounts")});
			var style = getComputedStyle(e.currentTarget);
			tooltip.style.setProperty("top", BDFDB.getRects(tooltip).top - style.paddingBottom.replace("px","")/2 + style.paddingTop.replace("px","")/2 + "px");
		}
	}
}
