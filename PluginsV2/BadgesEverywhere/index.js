module.exports = (Plugin, Api, Vendor) => {
	if (typeof BDFDB !== "object") global.BDFDB = {$: Vendor.$, BDv2Api: Api};
	
	const {$} = Vendor;

	return class extends Plugin {
		initConstructor () {
			this.css = ` 
				.BE-badge {
					display: inline-block;
					background-position: 50%;
					background-repeat: no-repeat;
					background-size: cover;
					height: 16px;
					margin: 0 2px;
				}
				.BE-badge-chat {
					margin-bottom: -3px;
				}
				.BE-badge:first-of-type {
					margin-left: 5px;
				}
				.BE-badge:last-of-type {
					margin-right: 5px;
				}
				.BE-badge-Staff {width:16px}
				.BE-badge-Partner {width:21px}
				.BE-badge-HypeSquad {width:17px}
				.BE-badge-BugHunter {width:17px}
				.BE-badge-Nitro {width:21px}`;
				
			this.loading = false;
			
			this.updateBadges = false;
			
			this.badges = {
				1:			{name:"Staff",			implemented:true,	white:"url(https://discordapp.com/assets/7cfd90c8062139e4804a1fa59f564731.svg)", color:"url(https://discordapp.com/assets/4358ad1fb423b346324516453750f569.svg)"},
				2:			{name:"Partner",		implemented:true,	white:"url(https://discordapp.com/assets/a0e288a458c48dfcf548dadc277e42e6.svg)", color:"url(https://discordapp.com/assets/33fedf082addb91d88abc272b4b18daa.svg)"},
				4:			{name:"HypeSquad",		implemented:true,	white:"url(https://discordapp.com/assets/0aae6033ad41cdda515a62cf72075afa.svg)", color:"url(https://discordapp.com/assets/17ebd99540a6e983bade13c3afff7946.svg)"},
				8:			{name:"BugHunter",		implemented:true,	white:"url(https://discordapp.com/assets/df26f079738a4dcd07cbce6eb3c957f1.svg)", color:"url(https://discordapp.com/assets/f61b8981e92feead854f52e5a1ba14f0.svg)"},
				16:			{name:"MFASMS",			implemented:false,	white:"", color:""},
				32:			{name:"PROMODISMISSED",	implemented:false,	white:"", color:""},
				256:		{name:"Nitro",		implemented:true,	white:"url(https://discordapp.com/assets/379d2b3171722ef8be494231234da5d1.svg)", color:"url(https://discordapp.com/assets/386884eecd36164487505ddfbac35a9d.svg)"}
			};
			
			this.requestedusers = {};
			this.loadedusers = {};
			
			this.defaults = {
				settings: {
					showInChat:			{value:true, 	description:"Show Badge in Chat Window."},
					showInMemberList:	{value:true, 	description:"Show Badge in Member List."},
					showInPopout:		{value:true, 	description:"Show Badge in User Popout."},
					useColoredVersion:	{value:true, 	description:"Use colored version of the Badges."}
				}
			};
		}

		onStart () {
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
			return true;
		}

		initialize () {
			if (typeof BDFDB === "object") {
				BDFDB.loadMessage(this);
				
				this.UserModalUtils = BDFDB.WebModules.findByProperties(["fetchMutualFriends","open"]);
				this.APIModule = BDFDB.WebModules.findByProperties(["getAPIBaseURL"]);
				this.DiscordConstants = BDFDB.WebModules.findByProperties(["Permissions", "ActivityTypes", "StatusTypes"]);
				
				var observer = null;

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.querySelector(BDFDB.dotCN.memberusername) && BDFDB.getData("showInMemberList", this, "settings")) {
										this.addBadges(node, "list", false);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.memberswrap, {name:"userListObserver",instance:observer}, {childList:true, subtree:true});
				
				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (BDFDB.getData("showInChat", this, "settings")) {
										if ($(BDFDB.dotCN.messagegroup).has(BDFDB.dotCN.avatarlargeold).length > 0) {
											if (node && node.tagName && node.querySelector(BDFDB.dotCN.messageusernamewrapper)) {
												this.addBadges(node, "chat", false);
											}
											else if (node && node.classList && node.classList.contains(BDFDB.disCN.messagetext)) {
												this.addBadges($(BDFDB.dotCN.messagegroup).has(node)[0], "chat", false);
											}
										}
										else {
											if (node && node.tagName && node.querySelector(BDFDB.dotCN.messageusernamewrapper)) {
												if (node.classList.contains(BDFDB.disCN.messagemarkup)) {
													this.addBadges(node, "chat", true);
												}
												else {
													var markups = node.querySelectorAll(BDFDB.dotCN.messagemarkup);
													for (var i = 0; i < markups.length; i++) {
														this.addBadges(markups[i], "chat", true);
													}
												}
											}
										}
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"chatWindowObserver",instance:observer}, {childList:true, subtree:true});
				
				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.tagName && node.querySelector(BDFDB.dotCN.userpopout) && BDFDB.getData("showInPopout", this, "settings")) {
										this.addBadges(node, "popout", false);
									}
								});
							}
						}
					);
				});
				BDFDB.addObserver(this, BDFDB.dotCN.popouts, {name:"userPopoutObserver",instance:observer}, {childList: true});
				
				for (let flag in this.badges) {
					if (!this.badges[flag].implemented) delete this.badges[flag];
				}
				
				this.loadBadges();

				return true;
			}
			else {
				console.error(this.name + ": Fatal Error: Could not load BD functions!");
				return false;
			}
		}

		onStop () {
			if (typeof BDFDB === "object") {
				document.querySelectorAll(".BE-badge").forEach(node=>{node.remove();});
				
				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}
		
		onSwitch () {
			if (typeof BDFDB === "object") {
				BDFDB.addObserver(this, BDFDB.dotCN.memberswrap, {name:"userListObserver"}, {childList:true, subtree:true});
				BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"chatWindowObserver"}, {childList:true, subtree:true});
				this.loadBadges();
			}
		}
		
		// begin of own functions

		updateSettings (settingspanel) {
			var settings = {};
			for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
				settings[input.value] = input.checked;
			}
			BDFDB.saveAllData(settings, this, "settings");
			this.updateBadges = true;
		}

		loadBadges() {
			document.querySelectorAll(".BE-badge").forEach(node=>{node.remove();});
			var settings = BDFDB.getAllData(this, "settings");
			if (settings.showInMemberList) {
				for (let user of document.querySelectorAll(BDFDB.dotCN.member)) {
					this.addBadges(user, "list", false, settings);
				}
			}
			if (settings.showInChat) { 
				for (let user of document.querySelectorAll(BDFDB.dotCN.messagegroup)) {
					var compact = document.querySelector(BDFDB.dotCN.messagegroup + BDFDB.dotCN.messagecompact);
					if (!compact) {
						this.addBadges(user, "chat", compact, settings);
					}
					else {
						for (let message of document.querySelectorAll(BDFDB.dotCN.messagemarkup)) {
							this.addBadges(message, "chat", compact, settings);
						}
					}
				}
			}
			if (settings.showInPopout) {
				for (let user of document.querySelectorAll(BDFDB.dotCN.userpopout)) {
					this.addBadges(user.parentElement, "popout", false, settings);
				}
			}
		}
		
		addBadges (wrapper, type, compact, settings = BDFDB.getAllData(this, "settings")) {
			if (!wrapper) return;
			
			let user = compact ? BDFDB.getKeyInformation({"node":$(BDFDB.dotCN.messagegroup).has(wrapper)[0],"key":"message"}).author : BDFDB.getKeyInformation({"node":wrapper,"key":"user"});
			if (user && !user.bot) {
				if (!this.requestedusers[user.id]) {
					this.requestedusers[user.id] = [[wrapper,type]]
					this.APIModule.get(this.DiscordConstants.Endpoints.USER_PROFILE(user.id)).then(result => {
						let usercopy = Object.assign({},result.body.user);
						if (result.body.premium_since) usercopy.flags += 256;
						this.loadedusers[user.id] = usercopy;
						for (let queredobj of this.requestedusers[user.id]) this.addToWrapper(queredobj[0], user.id, queredobj[1], settings);
					});
				}
				else if (!this.loadedusers[user.id]) {
					this.requestedusers[user.id].push([wrapper,type]);
				}
				else {
					this.addToWrapper(wrapper, user.id, type, settings);
				}
			}
		}
		
		addToWrapper (wrapper, id, type, settings) {
			if (wrapper.querySelector(".BE-badge")) return; 
			let memberwrap = wrapper.querySelector(BDFDB.dotCNC.memberusername + BDFDB.dotCNC.messageusernamewrapper + BDFDB.dotCN.nametag);
			if (memberwrap) for (let flag in this.badges) {
				if ((this.loadedusers[id].flags | flag) == this.loadedusers[id].flags) {
					let badge = document.createElement("div"); 
					badge.className = "BE-badge BE-badge-" + this.badges[flag].name + " BE-badge-" + type;
					badge.style.backgroundImage = settings.useColoredVersion ? this.badges[flag].color : this.badges[flag].white;
					memberwrap.appendChild(badge);
					$(badge)
						.on("mouseenter." + this.name, (e) => {
							BDFDB.createTooltip(this.badges[flag].name, e.currentTarget, {"type":"top"});
						});
				}
			}
		}
		
		getSettingsPanel () {
			var settings = BDFDB.getAllData(this, "settings"); 
			var settingshtml = `<div class="DevilBro-settings ${this.name}-settings">`;
			for (let key in settings) {
				settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
			}
			settingshtml += `</div>`;
			
			var settingspanel = $(settingshtml)[0];

			$(settingspanel)
				.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);});
				
			return settingspanel;
		}
		
		onSettingsClosed () {
			if (this.updateBadges) {
				this.loadBadges();
				this.updateBadges = false;
			}
		}
	}
};
