//META{"name":"ShowHiddenChannels"}*//

class ShowHiddenChannels {
	initConstructor () {
		this.updateHiddenCategory = false;
		
		this.categoryMarkup = 
			`<div class="container-hidden">
				<div class="${BDFDB.disCN.categorycontainerdefault}">
					<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstart + BDFDB.disCNS.nowrap + BDFDB.disCNS.categorywrapperdefault + BDFDB.disCN.cursorpointer}" style="flex: 1 1 auto;">
						<svg class="${BDFDB.disCNS.categoryicondefault + BDFDB.disCN.categoryicontransition}" width="12" height="12" viewBox="0 0 24 24">
							<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10"></path>
						</svg>
						<div class="${BDFDB.disCNS.categorynamedefault + BDFDB.disCNS.categorycolortransition + BDFDB.disCN.overflowellipsis}" style="flex: 1 1 auto;">hidden</div>
					</div>
				</div>
			</div>`;
			
		this.channelTextMarkup = 
			`<div class="${BDFDB.disCN.channelcontainerdefault}">
				<div class="${BDFDB.disCNS.channelwrapperdefaulttext + BDFDB.disCN.channelwrapper}">
					<div class="${BDFDB.disCNS.channelcontentdefaulttext + BDFDB.disCN.channelcontent}">
						<div class="${BDFDB.disCN.marginreset}" style="flex: 0 0 auto;">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="${BDFDB.disCNS.channelcolordefaulttext + BDFDB.disCN.channelicon}">
								<path class="${BDFDB.disCN.channelbackground}" fill="currentColor" d="M7.92,4.66666667 L6.50666667,4.66666667 L6.98,2 L5.64666667,2 L5.17333333,4.66666667 L2.50666667,4.66666667 L2.27333333,6 L4.94,6 L4.23333333,10 L1.56666667,10 L1.33333333,11.3333333 L4,11.3333333 L3.52666667,14 L4.86,14 L5.33333333,11.3333333 L9.33333333,11.3333333 L8.86,14 L10.1933333,14 L10.6666667,11.3333333 L13.3333333,11.3333333 L13.5666667,10 L12.2333333,10 L8.74333333,10 L5.56666667,10 L6.27333333,6 L7.92,6 L7.92,4.66666667 Z"></path>
								<path class="${BDFDB.disCN.channelforeground}" fill="currentColor" fill-rule="nonzero" d="M15.1,3.2 L15.1,2 C15.1,0.88 14.05,0 13,0 C11.95,0 10.9,0.88 10.9,2 L10.9,3.2 C10.45,3.2 10,3.68 10,4.16 L10,6.96 C10,7.52 10.45,8 10.9,8 L15.025,8 C15.55,8 16,7.52 16,7.04 L16,4.24 C16,3.68 15.55,3.2 15.1,3.2 Z M14,3 L12,3 L12,1.92857143 C12,1.35714286 12.4666667,1 13,1 C13.5333333,1 14,1.35714286 14,1.92857143 L14,3 Z"></path>
							</svg>
						</div>
						<div class="${BDFDB.disCNS.channelnamedefaulttext + BDFDB.disCNS.channelname + BDFDB.disCN.overflowellipsis}" style="flex: 1 1 auto;"></div>
						<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginreset}" style="flex: 0 1 auto;"></div>
					</div>
				</div>
			</div>`;
			
		this.channelVoiceMarkup = 
			`<div class="${BDFDB.disCN.channelcontainerdefault}">
				<div class="${BDFDB.disCNS.channelwrapperdefaultvoice + BDFDB.disCN.channelwrapper}">
					<div class="${BDFDB.disCNS.channelcontentdefaultvoice + BDFDB.disCN.channelcontent}">
						<div class="${BDFDB.disCN.marginreset}" style="flex: 0 0 auto;">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="${BDFDB.disCNS.channelcolordefaultvoice + BDFDB.disCN.channelicon}">
								<path class="${BDFDB.disCN.channelbackground}" fill="currentColor" d="M13.6005009,10 C12.8887426,11.8438372 11.2906136,13.2480521 9.33333333,13.6933333 L9.33333333,12.3133333 C10.5512947,11.950895 11.5614504,11.1062412 12.1398042,10 L13.6005009,10 Z M10.7736513,8.99497564 C10.4978663,9.6613459 9.98676114,10.2040442 9.33333333,10.5133333 L9.33333333,8.99497564 L10.7736513,8.99497564 Z M2,5.84666667 L4.66666667,5.84666667 L8,2.51333333 L8,13.18 L4.66666667,9.84666667 L2,9.84666667 L2,5.84666667 Z"></path>
								<path class="${BDFDB.disCN.channelforeground}" fill="currentColor" fill-rule="nonzero" d="M15.1,3.2 L15.1,2 C15.1,0.88 14.05,0 13,0 C11.95,0 10.9,0.88 10.9,2 L10.9,3.2 C10.45,3.2 10,3.68 10,4.16 L10,6.96 C10,7.52 10.45,8 10.9,8 L15.025,8 C15.55,8 16,7.52 16,7.04 L16,4.24 C16,3.68 15.55,3.2 15.1,3.2 Z M14,3 L12,3 L12,1.92857143 C12,1.35714286 12.4666667,1 13,1 C13.5333333,1 14,1.35714286 14,1.92857143 L14,3 Z"></path>
							</svg>
						</div>
						<div class="${BDFDB.disCNS.channelnamedefaultvoice + BDFDB.disCNS.channelname + BDFDB.disCN.overflowellipsis}" style="flex: 1 1 auto;"></div>
						<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginreset}" style="flex: 0 1 auto;"></div>
					</div>
				</div>
			</div>`;
			
		this.channelCategoryMarkup = 
			`<div class="${BDFDB.disCN.channelcontainerdefault}">
				<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCNS.cursorpointer + BDFDB.disCNS.categorywrappercollapsed + BDFDB.disCN.channelcontent}" style="flex: 1 1 auto;">
					<svg class="${BDFDB.disCNS.categoryicontransition + BDFDB.disCNS.directionright + BDFDB.disCN.categoryiconcollapsed}" width="12" height="12" viewBox="0 0 24 24">
						<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M7 10L12 15 17 10"></path>
					</svg>
					<div class="${BDFDB.disCNS.categorycolortransition + BDFDB.disCNS.overflowellipsis + BDFDB.disCN.categorynamecollapsed}" style="flex: 1 1 auto;"></div>
				</div>
			</div>`;
			
		this.css = `
			.container-hidden .containerDefault-1ZnADq .iconTransition-2pOJ7l {
				position: static;
			}`;
			
		this.defaults = {
			settings: {
				showText:				{value:true, 	description:"Show hidden Textchannels:"},
				showVoice:				{value:true, 	description:"Show hidden Voicechannels:"},
				showCategory:			{value:false, 	description:"Show hidden Categories:"},
				showAllowedRoles:		{value:true,	description:"Show allowed Roles on hover:"},
				showAllowedUsers:		{value:true,	description:"Show specifically allowed Users on hover:"},
				showOverWrittenRoles:	{value:true,	description:"Include overwritten Roles in allowed Roles:"},
				showDeniedRoles:		{value:true,	description:"Show denied Roles on hover:"},
				showDeniedUsers:		{value:true,	description:"Show denied Users on hover:"},
				showForNormal:			{value:false,	description:"Also show Roles/Users for allowed channels:"},
				showTopic:				{value:false, 	description:"Show the topic of hidden channels:"}
			},
			amounts: {
				hoverDelay:				{value:0, 		description:"Tooltip delay in millisec:"}
			}
		};
	}

	getName () {return "ShowHiddenChannels";}

	getDescription () {return "Displays channels that are hidden from you by role restrictions.";}

	getVersion () {return "2.3.5";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var settings = BDFDB.getAllData(this, "settings");
		var amounts = BDFDB.getAllData(this, "amounts");
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in amounts) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 50%; line-height: 38px;">${this.defaults.amounts[key].description}</h3><div class="${BDFDB.disCN.inputwrapper} inputNumberWrapper ${BDFDB.disCNS.vertical +  BDFDB.disCNS.flex + BDFDB.disCNS.directioncolumn}" style="flex: 1 1 auto;"><span class="numberinput-buttons-zone"><span class="numberinput-button-up"></span><span class="numberinput-button-down"></span></span><input type="number" min="0" option="${key}" value="${amounts[key]}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} amountInput"></div></div>`;
		}
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);})
			.on("input", ".amountInput", (e) => {
				var input = parseInt(e.currentTarget.value);
				if (!isNaN(input) && input > -1) BDFDB.saveData(e.currentTarget.getAttribute("option"), input, this, "amounts");
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
			
			this.React = BDFDB.WebModules.findByProperties(["createElement", "cloneElement"]);
			this.ChannelTypes = BDFDB.WebModules.findByProperties(["ChannelTypes"]).ChannelTypes;
			this.UserStore = BDFDB.WebModules.findByProperties(["getUsers", "getUser"]);
			this.MemberStore = BDFDB.WebModules.findByProperties(["getMember", "getMembers"]);
			this.ChannelStore = BDFDB.WebModules.findByProperties(["getChannels", "getDMFromUserId"]);
			this.GuildChannels = BDFDB.WebModules.findByProperties(["getChannels", "getDefaultChannel"]);
			this.Permissions = BDFDB.WebModules.findByProperties(["Permissions", "ActivityTypes"]).Permissions;
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.className && node.className.length > 0 && node.className.indexOf("container-") > -1 && node.className.indexOf("hidden") == -1) {
									this.appendToChannelList(document.querySelector(".container-hidden"));
								} 
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.channels, {name:"channelListObserver",instance:observer}, {childList: true, subtree: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (this.updateHiddenCategory && node.tagName && node.getAttribute("layer-id") == "user-settings") {
									document.querySelectorAll(".container-hidden").forEach(category => {category.remove();});
									this.displayHiddenChannels();
									this.updateHiddenCategory = false;
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.layers, {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			this.displayHiddenChannels();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			$(".container-hidden").remove();
			
			BDFDB.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDFDB === "object") {
			this.displayHiddenChannels();
		}
	}

	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
			settings[input.value] = input.checked;
		}
		BDFDB.saveAllData(settings, this, "settings");
		this.updateHiddenCategory = true;
	}
	
	displayHiddenChannels () {
		var serverObj = BDFDB.getSelectedServer();
		if (serverObj) {
			var serverID = serverObj.id;
			if (!document.querySelector(".container-hidden[server='" + serverID + "']")) {
				$(".container-hidden").remove();
				var allChannels = this.ChannelStore.getChannels();
				var shownChannels = this.GuildChannels.getChannels(serverID);
				var hiddenChannels = {};
				
				for (let type in this.ChannelTypes) hiddenChannels[this.ChannelTypes[type]] = [];
				
				for (let channelID in allChannels) {
					var channel = allChannels[channelID];
					if (channel.guild_id == serverID) {
                        var isHidden = true;
						if (channel.type == this.ChannelTypes.GUILD_CATEGORY) {
							for (let type in this.ChannelTypes) {
								if (shownChannels[this.ChannelTypes[type]]) for (let shownChannel of shownChannels[this.ChannelTypes[type]]) {
									if (!channel.id || shownChannel.channel.parent_id == channel.id) {
										isHidden = false;
										break;
									}
								}
							}
						}
						else {
							for (let shownChannel of shownChannels[channel.type]) {
								if (shownChannel.channel.id == channel.id) {
									isHidden = false;
									break;
								}
							}
						}
                        if (isHidden) {
                            hiddenChannels[channel.type].push(channel);
                        }
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
					var category = $(this.categoryMarkup)[0];
					var wrapper = category.querySelector(BDFDB.dotCN.cursorpointer);
					var svg = category.querySelector(BDFDB.dotCN.categoryicontransition);
					var name = category.querySelector(BDFDB.dotCN.categorycolortransition);
					$(category)
						.attr("server", serverID)
						.on("click", BDFDB.dotCN.categorycontainerdefault + " > " + BDFDB.dotCN.flex, (e) => {
							wrapper.classList.toggle(BDFDB.disCN.categorywrapperhovered);
							wrapper.classList.toggle(BDFDB.disCN.categorywrapperhoveredcollapsed);
							svg.classList.toggle(BDFDB.disCN.categoryiconhovered);
							svg.classList.toggle(BDFDB.disCN.categoryiconhoveredcollapsed);
							svg.classList.toggle(BDFDB.disCN.directionright);
							name.classList.toggle(BDFDB.disCN.categorynamehovered);
							name.classList.toggle(BDFDB.disCN.categorynamehoveredcollapsed);
							
							$(category).find(BDFDB.dotCN.channelcontainerdefault).toggle(!svg.classList.contains(BDFDB.disCN.directionright));
							BDFDB.saveData(serverID, !svg.classList.contains(BDFDB.disCN.directionright), this, "categorystatus");
						})
						.on("mouseenter mouseleave", BDFDB.dotCN.categorycontainerdefault + " > " + BDFDB.dotCN.flex, () => {
							if (!svg.classList.contains(BDFDB.disCN.directionright)) {
								wrapper.classList.toggle(BDFDB.disCN.categorywrapperdefault);
								wrapper.classList.toggle(BDFDB.disCN.categorywrapperhovered);
								svg.classList.toggle(BDFDB.disCN.categoryicondefault);
								svg.classList.toggle(BDFDB.disCN.categoryiconhovered);
								name.classList.toggle(BDFDB.disCN.categorynamedefault);
								name.classList.toggle(BDFDB.disCN.categorynamehovered);
							}
							else {
								wrapper.classList.toggle(BDFDB.disCN.categorywrappercollapsed);
								wrapper.classList.toggle(BDFDB.disCN.categorywrapperhoveredcollapsed)
								svg.classList.toggle(BDFDB.disCN.categoryiconcollapsed)
								svg.classList.toggle(BDFDB.disCN.categoryiconhoveredcollapsed);
								name.classList.toggle(BDFDB.disCN.categorynamecollapsed);
								name.classList.toggle(BDFDB.disCN.categorynamehoveredcollapsed)
							}
						});
					
					for (let hiddenChannel of hiddenChannels[0]) {
						let channel = $(this.channelTextMarkup)[0];
						let channelwrapper = channel.querySelector(BDFDB.dotCN.channelwrapper);
						let channelicon = channel.querySelector(BDFDB.dotCN.channelcontent);
						let channelsvg = channel.querySelector(BDFDB.dotCN.channelicon);
						let channelname = channel.querySelector(BDFDB.dotCN.channelname);
						channelname.innerText = hiddenChannel.name;
						$(channel)
							.on("mouseenter mouseleave", BDFDB.dotCN.channelwrapper, (e) => {
								channelwrapper.classList.toggle(BDFDB.disCN.channelwrapperdefaulttext);
								channelwrapper.classList.toggle(BDFDB.disCN.channelwrapperhoveredtext);
								channelicon.classList.toggle(BDFDB.disCN.channelcontentdefaulttext);
								channelicon.classList.toggle(BDFDB.disCN.channelcontenthoveredtext);
								channelsvg.classList.toggle(BDFDB.disCN.channelcolordefaulttext);
								channelsvg.classList.toggle(BDFDB.disCN.channelcolorhoveredtext);
								channelname.classList.toggle(BDFDB.disCN.channelnamedefaulttext);
								channelname.classList.toggle(BDFDB.disCN.channelnamehoveredtext);
								this.showAccessRoles(serverObj, hiddenChannel, e, false);
							})
							.on("click", () => {
								BDFDB.showToast(`You can not enter the hidden textchannel ${hiddenChannel.name}.`, {type:"error"});
							})
							.on("contextmenu", (e) => {
								this.createHiddenObjContextMenu(serverObj, hiddenChannel, "TEXT", e);
							})
							.appendTo(category);
					}
					
					for (let hiddenChannel of hiddenChannels[2]) {
						let channel = $(this.channelVoiceMarkup)[0];
						let channelwrapper = channel.querySelector(BDFDB.dotCN.channelwrapper);
						let channelicon = channel.querySelector(BDFDB.dotCN.channelcontent);
						let channelsvg = channel.querySelector(BDFDB.dotCN.channelicon);
						let channelname = channel.querySelector(BDFDB.dotCN.channelname);
						channelname.innerText = hiddenChannel.name;
						$(channel)
							.on("mouseenter mouseleave", BDFDB.dotCN.channelwrapper, (e) => {
								channelwrapper.classList.toggle(BDFDB.disCN.channelwrapperdefaultvoice);
								channelwrapper.classList.toggle(BDFDB.disCN.channelwrapperhoveredvoice);
								channelicon.classList.toggle(BDFDB.disCN.channelcontentdefaultvoice);
								channelicon.classList.toggle(BDFDB.disCN.channelcontenthoveredvoice);
								channelsvg.classList.toggle(BDFDB.disCN.channelcolordefaultvoice);
								channelsvg.classList.toggle(BDFDB.disCN.channelcolorhoveredvoice);
								channelname.classList.toggle(BDFDB.disCN.channelnamedefaultvoice);
								channelname.classList.toggle(BDFDB.disCN.channelnamehoveredvoice);
								this.showAccessRoles(serverObj, hiddenChannel, e, false);
							})
							.on("click", () => {
								BDFDB.showToast(`You can not enter the hidden voicechannel ${hiddenChannel.name}.`, {type:"error"});
							})
							.on("contextmenu", (e) => {
								this.createHiddenObjContextMenu(serverObj, hiddenChannel, "VOICE", e);
							})
							.appendTo(category);
					}
					
					for (let hiddenChannel of hiddenChannels[4]) {
						let channel = $(this.channelCategoryMarkup)[0];
						let channelwrapper = channel.querySelector(BDFDB.dotCN.categorywrappercollapsed);
						let channelsvg = channel.querySelector(BDFDB.dotCN.categoryiconcollapsed);
						let channelname = channel.querySelector(BDFDB.dotCN.categorynamecollapsed);
						channelname.innerText = hiddenChannel.name;
						$(channel)
							.on("mouseenter mouseleave", BDFDB.dotCN.flex, (e) => {
								channelwrapper.classList.toggle(BDFDB.disCN.categorywrappercollapsed);
								channelwrapper.classList.toggle(BDFDB.disCN.categorywrapperhoveredcollapsed);
								channelsvg.classList.toggle(BDFDB.disCN.categoryiconcollapsed)
								channelsvg.classList.toggle(BDFDB.disCN.categoryiconhoveredcollapsed);
								channelname.classList.toggle(BDFDB.disCN.categorynamecollapsed);
								channelname.classList.toggle(BDFDB.disCN.categorynamehoveredcollapsed);
								this.showAccessRoles(serverObj, hiddenChannel, e, false);
							})
							.on("click", () => {
								BDFDB.showToast(`You can not open the hidden category ${hiddenChannel.name}.`, {type:"error"});
							})
							.on("contextmenu", (e) => {
								this.createHiddenObjContextMenu(serverObj, hiddenChannel, "CATEGORY", e);
							}) 
							.appendTo(category);
					}
					
					var isOpen = BDFDB.loadData(serverID, this, "categorystatus");
					isOpen = isOpen === null ? true : isOpen;
					
					if (!isOpen) {
						wrapper.classList.toggle(BDFDB.disCN.categorywrapperdefault);
						wrapper.classList.toggle(BDFDB.disCN.categorywrappercollapsed);
						svg.classList.toggle(BDFDB.disCN.categoryicondefault);
						svg.classList.toggle(BDFDB.disCN.categoryiconcollapsed)
						svg.classList.toggle(BDFDB.disCN.directionright);
						name.classList.toggle(BDFDB.disCN.categorynamedefault);
						name.classList.toggle(BDFDB.disCN.categorynamecollapsed);
						
						$(category).find(BDFDB.dotCN.channelcontainerdefault).hide();
					}
					
					this.appendToChannelList(category);
				}
				let channelist = document.querySelector(BDFDB.dotCNS.channels + BDFDB.dotCN.scroller);
				$(channelist).off("mouseenter." + this.getName()).off("mouseleave." + this.getName());
				if (settings.showForNormal) {
					$(channelist)
						.on("mouseenter." + this.getName(), BDFDB.dotCNC.channelcontainerdefault + BDFDB.dotCN.categorycontainerdefault, (e) => {
							var channel = BDFDB.getKeyInformation({"node":e.currentTarget,"key":"channel"});
							if (channel) this.showAccessRoles(serverObj, channel, e, false);
						});
				}
			}
		}
	}
	
	createHiddenObjContextMenu (serverObj, hiddenObj, type, e) {
		e.preventDefault();
		e.stopPropagation();
		var contextMenu = $(`<div class="${BDFDB.disCN.contextmenu} ShowHiddenChannelsContextMenu">${BDFDB.isPluginEnabled("PermissionsViewer") ? '<div class="' + BDFDB.disCN.contextmenuitemgroup + '"><div class="' + BDFDB.disCN.contextmenuitem + '" style="display: none !important;"></div></div>' : ''}<div class="${BDFDB.disCN.contextmenuitemgroup}"><div class="${BDFDB.disCN.contextmenuitem} copyid-item"><span>${BDFDB.LanguageStrings.COPY_ID}</span><div class="${BDFDB.disCN.contextmenuhint}"></div></div></div></div>`);
		var reactInstance = this.React.createElement(contextMenu[0]);
		reactInstance.return = {memoizedProps:{type:("CHANNEL_LIST_" + type),guild:serverObj.data,channel:hiddenObj}};
		contextMenu[0].__reactInternalInstance = reactInstance;
		contextMenu
			.on("click." + this.getName(), ".copyid-item", (e2) => {
				contextMenu.remove();
				require("electron").clipboard.write({text: hiddenObj.id});
			});
		
		BDFDB.appendContextMenu(contextMenu[0], e);
	}
	
	showAccessRoles (serverObj, channel, e, allowed) {
		if ((e.type != "mouseenter" && e.type != "mouseover") || !serverObj || !channel) return;
		var settings = BDFDB.getAllData(this, "settings");
		var myMember = this.MemberStore.getMember(serverObj.id, BDFDB.myData.id);
		var allowedRoles = [], allowedUsers = [], overwrittenRoles = [], deniedRoles = [], deniedUsers = [];
		var everyoneDenied = false;
		for (let id in channel.permissionOverwrites) {
			if (settings.showAllowedRoles &&
				channel.permissionOverwrites[id].type == "role" && 
				(serverObj.roles[id].name != "@everyone") &&
				(channel.permissionOverwrites[id].allow | this.Permissions.VIEW_CHANNEL) == channel.permissionOverwrites[id].allow) {
					if (myMember.roles.includes(id) && !allowed) {
						if (settings.showOverWrittenRoles) overwrittenRoles.push(serverObj.roles[id]);
					}
					else {
						allowedRoles.push(serverObj.roles[id]);
					}
			}
			else if (settings.showAllowedUsers &&
				channel.permissionOverwrites[id].type == "member" && 
				(channel.permissionOverwrites[id].allow | this.Permissions.VIEW_CHANNEL) == channel.permissionOverwrites[id].allow) {
					let user = this.UserStore.getUser(id);
					let member = this.MemberStore.getMember(serverObj.id,id);
					if (user && member) allowedUsers.push(Object.assign({name:user.username},member));
			}
			if (settings.showDeniedRoles &&
				channel.permissionOverwrites[id].type == "role" && 
				(channel.permissionOverwrites[id].deny | this.Permissions.VIEW_CHANNEL) == channel.permissionOverwrites[id].deny) {
					deniedRoles.push(serverObj.roles[id]);
					if (serverObj.roles[id].name == "@everyone") everyoneDenied = true;
			}
			else if (settings.showDeniedUsers &&
				channel.permissionOverwrites[id].type == "member" && 
				(channel.permissionOverwrites[id].deny | this.Permissions.VIEW_CHANNEL) == channel.permissionOverwrites[id].deny) {
					let user = this.UserStore.getUser(id);
					let member = this.MemberStore.getMember(serverObj.id,id);
					if (user && member) deniedUsers.push(Object.assign({name:user.username},member));
			}
		}
		if (settings.showAllowedRoles && allowed && !everyoneDenied) {
			allowedRoles.push({"name":"@everyone"});
		}
		var htmlString = ``;
		if (settings.showTopic && !allowed && channel.topic && channel.topic.replace(/[\t\n\r\s]/g, "")) {
			htmlString += `<div class="${BDFDB.disCN.marginbottom4}">Topic:</div><div class="${BDFDB.disCNS.flex + BDFDB.disCN.wrap}"><div class="${BDFDB.disCNS.userpopoutrole + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCN.wrap + BDFDB.disCNS.size12 + BDFDB.disCN.weightmedium} SHC-topic" style="border-color: rgba(255, 255, 255, 0.6); height: unset !important; padding-top: 5px; padding-bottom: 5px; max-width: ${window.outerWidth/3}px">${channel.topic}</div></div>`;
		}
		if (allowedRoles.length > 0 || overwrittenRoles.length > 0) {
			htmlString += `<div class="${BDFDB.disCN.marginbottom4}">Allowed Roles:</div><div class="${BDFDB.disCNS.flex + BDFDB.disCN.wrap}">`;
			for (let role of allowedRoles) {
				let color = role.colorString ? BDFDB.color2COMP(role.colorString) : [255,255,255];
				htmlString += `<div class="${BDFDB.disCNS.userpopoutrole + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCN.wrap + BDFDB.disCNS.size12 + BDFDB.disCN.weightmedium} SHC-allowedrole" style="border-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6);"><div class="${BDFDB.disCNS.userpopoutrolecircle}" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]});"></div><div class="${BDFDB.disCNS.userpopoutrolename}">${BDFDB.encodeToHTML(role.name)}</div></div>`;
			}
			for (let role of overwrittenRoles) {
				let color = role.colorString ? BDFDB.color2COMP(role.colorString) : [255,255,255];
				htmlString += `<div class="${BDFDB.disCNS.userpopoutrole + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCN.wrap + BDFDB.disCNS.size12 + BDFDB.disCN.weightmedium} SHC-overwrittenrole" style="border-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6);"><div class="${BDFDB.disCNS.userpopoutrolecircle}" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]});"></div><div class="${BDFDB.disCNS.userpopoutrolename}" style="text-decoration: line-through !important;">${BDFDB.encodeToHTML(role.name)}</div></div>`;
			}
			htmlString += `</div>`;
		}
		if (allowedUsers.length > 0) {
			htmlString += `<div class="${BDFDB.disCN.marginbottom4}">Allowed Users:</div><div class="${BDFDB.disCNS.flex + BDFDB.disCN.wrap}">`;
			for (let user of allowedUsers) {
				let color = user.colorString ? BDFDB.color2COMP(user.colorString) : [255,255,255];
				htmlString += `<div class="${BDFDB.disCNS.userpopoutrole + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCN.wrap + BDFDB.disCNS.size12 + BDFDB.disCN.weightmedium} SHC-denieduser" style="border-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6);"><div class="${BDFDB.disCNS.userpopoutrolecircle}" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]});"></div><div class="${BDFDB.disCNS.userpopoutrolename}">${BDFDB.encodeToHTML(user.nick ? user.nick : user.name)}</div></div>`;
			}
			htmlString += `</div>`;
		}
		if (deniedRoles.length > 0) {
			htmlString += `<div class="${BDFDB.disCN.marginbottom4}">Denied Roles:</div><div class="${BDFDB.disCNS.flex + BDFDB.disCN.wrap}">`;
			for (let role of deniedRoles) {
				let color = role.colorString ? BDFDB.color2COMP(role.colorString) : [255,255,255];
				htmlString += `<div class="${BDFDB.disCNS.userpopoutrole + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCN.wrap + BDFDB.disCNS.size12 + BDFDB.disCN.weightmedium} SHC-deniedrole" style="border-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6);"><div class="${BDFDB.disCNS.userpopoutrolecircle}" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]});"></div><div class="${BDFDB.disCNS.userpopoutrolename}">${BDFDB.encodeToHTML(role.name)}</div></div>`;
			}
			htmlString += `</div>`;
		}
		if (deniedUsers.length > 0) {
			htmlString += `<div class="${BDFDB.disCN.marginbottom4}">Denied Users:</div><div class="${BDFDB.disCNS.flex + BDFDB.disCN.wrap}">`;
			for (let user of deniedUsers) {
				let color = user.colorString ? BDFDB.color2COMP(user.colorString) : [255,255,255];
				htmlString += `<div class="${BDFDB.disCNS.userpopoutrole + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCN.wrap + BDFDB.disCNS.size12 + BDFDB.disCN.weightmedium} SHC-denieduser" style="border-color: rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6);"><div class="${BDFDB.disCNS.userpopoutrolecircle}" style="background-color: rgb(${color[0]}, ${color[1]}, ${color[2]});"></div><div class="${BDFDB.disCNS.userpopoutrolename}">${BDFDB.encodeToHTML(user.nick ? user.nick : user.name)}</div></div>`;
			}
			htmlString += `</div>`;
		}
		if (htmlString) {
			var width = window.outerWidth/2;
			var tooltip = BDFDB.createTooltip(htmlString, e.currentTarget, {type:"right", selector:"showhiddenchannels-tooltip", html:true, style:`max-width: ${width < 200 ? 400 : width}px !important;`, delay:BDFDB.getData("hoverDelay", this, "amounts")});
			tooltip.style.top = tooltip.style.top.replace("px","") - $(e.currentTarget).css("padding-bottom").replace("px","")/2 + $(e.currentTarget).css("padding-top").replace("px","")/2 + "px";
		}
	}
	
	appendToChannelList (category) {
		var channelList = document.querySelector(BDFDB.dotCNS.channels + BDFDB.dotCN.scroller);
		if (channelList && category) {
			category.remove();
			let count = parseInt(channelList.lastChild.previousSibling.className.split("-")[1])+1;
			category.className = "container-" + count + " container-hidden";
			channelList.insertBefore(category,channelList.lastChild);
		}
	}
}
