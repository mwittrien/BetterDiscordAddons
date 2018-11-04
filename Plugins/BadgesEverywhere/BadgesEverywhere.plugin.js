//META{"name":"BadgesEverywhere"}*//

class BadgesEverywhere {
	initConstructor () {
		this.css = ` 
			.BE-badge {
				display: inline-block;
				background-position: 50%;
				background-repeat: no-repeat;
				background-size: contain;
				height: 17px;
				margin: 0 2px;
			}
			.BE-badge-chat {
				margin-bottom: -3px;
			}
			.BE-badge-popout {
				margin-bottom: -2px;
			}
			.BE-badge-settings {
				width: 30px !important;
			}
			.BE-badge:first-of-type {
				margin-left: 5px;
			}
			.BE-badge:last-of-type {
				margin-right: 5px;
			}
			.BE-badge-Staff {width:17px; min-width:17px;}
			.BE-badge-Partner {width:22px; min-width:22px;}
			.BE-badge-HypeSquad {width:17px; min-width:17px;}
			.BE-badge-BugHunter {width:17px; min-width:17px;}
			.BE-badge-HypeSquadBravery {width:17px; min-width:17px;}
			.BE-badge-HypeSquadBrilliance {width:17px; min-width:17px;}
			.BE-badge-HypeSquadBalance {width:17px; min-width:17px;}
			.BE-badge-EarlySupporter {width:24px; min-width:24px;}
			.BE-badge-Nitro {width:21px; min-width:21px;}`;
			
		this.loading = false;
		
		this.updateBadges = false;
		
		this.badges = {
			1:			{name:"Staff",					implemented:true,	white:"url(https://discordapp.com/assets/7cfd90c8062139e4804a1fa59f564731.svg)", color:"url(https://discordapp.com/assets/4358ad1fb423b346324516453750f569.svg)"},
			2:			{name:"Partner",				implemented:true,	white:"url(https://discordapp.com/assets/a0e288a458c48dfcf548dadc277e42e6.svg)", color:"url(https://discordapp.com/assets/33fedf082addb91d88abc272b4b18daa.svg)"},
			4:			{name:"HypeSquad",				implemented:true,	white:"url(https://discordapp.com/assets/3a050fcc884255231b99b7033c776070.svg)", color:"url(https://discordapp.com/assets/6c73f47daf179ffade99f501bfc5101b.svg)"},
			8:			{name:"BugHunter",				implemented:true,	white:"url(https://discordapp.com/assets/df26f079738a4dcd07cbce6eb3c957f1.svg)", color:"url(https://discordapp.com/assets/f61b8981e92feead854f52e5a1ba14f0.svg)"},
			16:			{name:"MFASMS",					implemented:false,	white:"", color:""},
			32:			{name:"PROMODISMISSED",			implemented:false,	white:"", color:""},
			64:			{name:"HypeSquad Bravery",		implemented:true,	white:"url(https://discordapp.com/assets/1115767aed344e96a27a12e97718c171.svg)", color:"url(https://discordapp.com/assets/64ae1208b6aefc0a0c3681e6be36f0ff.svg)"},
			128:		{name:"HypeSquad Brilliance",	implemented:true,	white:"url(https://discordapp.com/assets/d3478c6bd5cee0fc600e55935ddc81aa.svg)", color:"url(https://discordapp.com/assets/48cf0556d93901c8cb16317be2436523.svg)"},
			256:		{name:"HypeSquad Balance",		implemented:true,	white:"url(https://discordapp.com/assets/2a085ed9c86f3613935a6a8667ba8b89.svg)", color:"url(https://discordapp.com/assets/9fdc63ef8a3cc1617c7586286c34e4f1.svg)"},
			512:		{name:"Early Supporter",		implemented:true,	white:"url(https://discordapp.com/assets/ce15562552e3d70c56d5408cfeed2ffd.svg)", color:"url(https://discordapp.com/assets/23e59d799436a73c024819f84ea0b627.svg)"},
			2048:		{name:"Nitro",					implemented:true,	white:"url(https://discordapp.com/assets/379d2b3171722ef8be494231234da5d1.svg)", color:"url(https://discordapp.com/assets/386884eecd36164487505ddfbac35a9d.svg)"}
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

	getName () {return "BadgesEverywhere";}

	getDescription () {return "Displays Badges (Nitro, HypeSquad, etc...) in the chat/memberlist/userpopout. Thanks for Zerebos' help.";}

	getVersion () {return "1.1.2";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var settings = BDFDB.getAllData(this, "settings"); 
		var blacklist = BDFDB.loadAllData(this, "blacklist"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settingsswitch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Display Badges:</h3></div><div class="DevilBro-settings-inner-list">`;
		for (let flag in this.badges) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.badges[flag].name}</h3><div class="${BDFDB.disCNS.flexchild + "BE-badge-" + this.badges[flag].name.replace(/ /g, "")} BE-badge BE-badge-settings" style="background-image: ${this.badges[flag].color}; flex: 0 0 auto;"></div><div class="${BDFDB.disCNS.flexchild + "BE-badge-" + this.badges[flag].name.replace(/ /g, "")} BE-badge BE-badge-settings" style="background-image: ${this.badges[flag].white}; flex: 0 0 auto;"></div><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${flag}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} blacklistswitch"${blacklist[flag] ? "" : " checked"}></div></div>`;
		}
		
		settingshtml += `</div></div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", BDFDB.dotCN.switchinner + ".settingsswitch", () => {this.updateSettings(settingspanel);})
			.on("click", BDFDB.dotCN.switchinner + ".blacklistswitch", () => {this.updateBlacklist(settingspanel);});
			
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
			
			this.APIModule = BDFDB.WebModules.findByProperties(["getAPIBaseURL"]);
			this.DiscordConstants = BDFDB.WebModules.findByProperties(["Permissions", "ActivityTypes", "StatusTypes"]);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.tagName && node.querySelector(BDFDB.dotCN.memberusername) && BDFDB.getData("showInMemberList", this, "settings")) {
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
									if (node.tagName && node.querySelector(BDFDB.dotCN.messageusername)) {
										this.addBadges(node, "chat", BDFDB.getDiscordMode() == "compact");
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
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && node.tagName && node.getAttribute("layer-id") == "user-settings" && this.updateBadges) {
									this.updateBadges = false;
									this.loadBadges();
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.layers, {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			for (let flag in this.badges) if (!this.badges[flag].implemented) delete this.badges[flag];
			
			this.loadBadges();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			document.querySelectorAll(".BE-badge").forEach(node=>{node.remove();});
			BDFDB.unloadMessage(this);
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
		for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner + ".settingsswitch")) {
			settings[input.value] = input.checked;
		}
		BDFDB.saveAllData(settings, this, "settings");
		this.updateBadges = true;
	}

	updateBlacklist (settingspanel) {
		var blacklist = {};
		for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner + ".blacklistswitch")) {
			blacklist[input.value] = !input.checked;
		}
		BDFDB.saveAllData(blacklist, this, "blacklist");
		this.updateBadges = true;
	}

	loadBadges() {
		document.querySelectorAll(".BE-badge").forEach(node=>{node.remove();});
		var settings = BDFDB.getAllData(this, "settings");
		if (settings.showInMemberList) {
			for (let user of document.querySelectorAll(BDFDB.dotCN.member)) {
				this.addBadges(user, "list", false);
			}
		}
		if (settings.showInChat) {
			for (let messagegroup of document.querySelectorAll(BDFDB.dotCN.messagegroupcozy)) {
				this.addBadges(messagegroup, "chat", false);
			}
			for (let messagegroup of document.querySelectorAll(BDFDB.dotCN.messagegroupcompact)) {
				for (let message of messagegroup.querySelectorAll(BDFDB.dotCN.messagemarkup)) {
					this.addBadges(message, "chat", true);
				}
			}
		}
		if (settings.showInPopout) {
			for (let user of document.querySelectorAll(BDFDB.dotCN.userpopout)) {
				this.addBadges(user.parentElement, "popout", false);
			}
		}
	}
	
	addBadges (wrapper, type, compact) {
		if (!wrapper) return;
		let user = compact ? BDFDB.getKeyInformation({"node":wrapper.classList.contains(BDFDB.disCN.messagegroup) ? wrapper : $(BDFDB.dotCN.messagegroup).has(wrapper)[0],"key":"message"}).author : BDFDB.getKeyInformation({"node":wrapper,"key":"user"});
		if (user && !user.bot) {
			if (!this.requestedusers[user.id]) {
				this.requestedusers[user.id] = [[wrapper,type]]
				this.APIModule.get(this.DiscordConstants.Endpoints.USER_PROFILE(user.id)).then(result => {
					let usercopy = Object.assign({},result.body.user);
					if (result.body.premium_since) usercopy.flags += 2048;
					this.loadedusers[user.id] = usercopy;
					for (let queredobj of this.requestedusers[user.id]) this.addToWrapper(queredobj[0], user.id, queredobj[1]);
				});
			}
			else if (!this.loadedusers[user.id]) {
				this.requestedusers[user.id].push([wrapper,type]);
			}
			else {
				this.addToWrapper(wrapper, user.id, type);
			}
		}
	}
	
	addToWrapper (wrapper, id, type) {
		if (wrapper.querySelector(".BE-badge")) return; 
		let memberwrap = wrapper.querySelector(BDFDB.dotCN.memberusername);
		if (!memberwrap) memberwrap = wrapper.querySelector(BDFDB.dotCN.messageusername);
		if (memberwrap) memberwrap = memberwrap.parentElement;
		if (!memberwrap) memberwrap = wrapper.querySelector(BDFDB.dotCN.nametag);
		if (memberwrap) {
			var blacklist = BDFDB.loadAllData(this, "blacklist");
			for (let flag in this.badges) {
				if ((this.loadedusers[id].flags | flag) == this.loadedusers[id].flags && !blacklist[flag]) {
					let badge = document.createElement("div"); 
					badge.className = "BE-badge BE-badge-" + this.badges[flag].name.replace(/ /g, "") + " BE-badge-" + type;
					badge.style.backgroundImage = BDFDB.getData("useColoredVersion", this, "settings") ? this.badges[flag].color : this.badges[flag].white;
					memberwrap.appendChild(badge);
					$(badge)
						.on("mouseenter." + this.getName(), (e) => {
							BDFDB.createTooltip(this.badges[flag].name, e.currentTarget, {"type":type == "list" ? "left" : "top"});
						});
				}
			}
		}
	}
}