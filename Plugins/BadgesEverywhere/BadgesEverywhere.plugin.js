//META{"name":"BadgesEverywhere"}*//

class BadgesEverywhere {
	initConstructor () {
		this.patchModules = {
			"NameTag":"componentDidMount",
			"Popout":"componentDidMount",
			"StandardSidebarView":"componentWillUnmount"
		};
		
		this.css = ` 
			.BE-badge {
				display: inline-block;
				height: 17px !important;
				margin: 0 2px !important;
			}
			.BE-badge.BE-badge-chat {
				margin-bottom: -3px !important;
			}
			.BE-badge.BE-badge-popout {
				margin-bottom: -2px !important;
			}
			.BE-badge.BE-badge-settings {
				width: 30px !important;
			}
			.BE-badge.BE-badge:first-of-type {
				margin-left: 5px !important;
			}
			.BE-badge.BE-badge:last-of-type {
				margin-right: 5px !important;
			}
			.BE-badge.BE-badge-Staff {width:17px !important; min-width:17px !important;}
			.BE-badge.BE-badge-Partner {width:22px !important; min-width:22px !important;}
			.BE-badge.BE-badge-HypeSquad {width:17px !important; min-width:17px !important;}
			.BE-badge.BE-badge-BugHunter {width:17px !important; min-width:17px !important;}
			.BE-badge.BE-badge-HypeSquadBravery {width:17px !important; min-width:17px !important;}
			.BE-badge.BE-badge-HypeSquadBrilliance {width:17px !important; min-width:17px !important;}
			.BE-badge.BE-badge-HypeSquadBalance {width:17px !important; min-width:17px !important;}
			.BE-badge.BE-badge-EarlySupporter {width:24px !important; min-width:24px !important;}
			.BE-badge.BE-badge-Nitro {width:21px !important; min-width:21px !important;}`;
			
		this.loading = false;
		
		this.updateBadges = false;
		
		this.badges = {
			1:			{name:"Staff",					selector:"profileBadgeStaff"},
			2:			{name:"Partner",				selector:"profileBadgePartner"},
			4:			{name:"HypeSquad",				selector:"profileBadgeHypesquad"},
			8:			{name:"BugHunter",				selector:"profileBadgeBugHunter"},
			16:			{name:"MFASMS",					selector:false},
			32:			{name:"PROMODISMISSED",			selector:false},
			64:			{name:"HypeSquad Bravery",		selector:"profileBadgeHypeSquadOnlineHouse1"},
			128:		{name:"HypeSquad Brilliance",	selector:"profileBadgeHypeSquadOnlineHouse2"},
			256:		{name:"HypeSquad Balance",		selector:"profileBadgeHypeSquadOnlineHouse3"},
			512:		{name:"Early Supporter",		selector:"profileBadgeEarlySupporter"},
			2048:		{name:"Nitro",					selector:"profileBadgePremium"}
		};
		
		this.requestedusers = {};
		this.loadedusers = {};
		
		this.defaults = {
			settings: {
				showInPopout:		{value:true, 	description:"Show Badge in User Popout."},
				showInChat:			{value:true, 	description:"Show Badge in Chat Window."},
				showInMemberList:	{value:true, 	description:"Show Badge in Member List."},
				useColoredVersion:	{value:true, 	description:"Use colored version of the Badges for Chat and Members."}
			}
		};
	}

	getName () {return "BadgesEverywhere";}

	getDescription () {return "Displays Badges (Nitro, HypeSquad, etc...) in the chat/memberlist/userpopout. Thanks for Zerebos' help.";}

	getVersion () {return "1.1.7";}

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
			
			this.APIModule = BDFDB.WebModules.findByProperties("getAPIBaseURL");
			this.DiscordConstants = BDFDB.WebModules.findByProperties("Permissions", "ActivityTypes", "StatusTypes");
			this.BadgeClasses = BDFDB.WebModules.findByProperties("profileBadgeStaff","profileBadgePremium");
			
			for (let flag in this.badges) if (!this.badges[flag].selector) delete this.badges[flag];
			
			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			BDFDB.removeEles(".BE-badges");
			BDFDB.unloadMessage(this);
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
	
	processNameTag (instance, wrapper) { 
		if (!wrapper.classList || !instance || !instance.props) return;
		else if (wrapper.classList.contains(BDFDB.disCN.membernametag) && BDFDB.getData("showInMemberList", this, "settings")) {
			this.addBadges(instance.props.user, wrapper, "list");
		}
		else if (wrapper.classList.contains(BDFDB.disCN.userpopoutheadertag) && BDFDB.getData("showInPopout", this, "settings")) {
			wrapper = wrapper.classList.contains(BDFDB.disCN.userpopoutheadertagwithnickname) && wrapper.previousSibling ? wrapper.previousSibling : wrapper;
			this.addBadges(instance.props.user, wrapper, "popout");
		}
	}
	
	processPopout (instance, wrapper) {
		let fiber = instance._reactInternalFiber;
		if (fiber.return && fiber.return.memoizedProps && fiber.return.memoizedProps.message) {
			let username = wrapper.querySelector(BDFDB.dotCN.messageusername);
			if (username && BDFDB.getData("showInChat", this, "settings")) this.addBadges(fiber.return.memoizedProps.message.author, wrapper, "chat");
		}
	}
	
	processStandardSidebarView (instance, wrapper) {
		if (this.updateBadges) {
			this.updateBadges = false;
			BDFDB.removeEles(".BE-badges");
			BDFDB.WebModules.forceAllUpdates(this);
		}
	}
	
	addBadges (info, wrapper, type) {
		if (!info || info.bot || !wrapper) return;
		if (!this.requestedusers[info.id]) {
			this.requestedusers[info.id] = [[wrapper,type]]
			this.APIModule.get(this.DiscordConstants.Endpoints.USER_PROFILE(info.id)).then(result => {
				let usercopy = Object.assign({},result.body.user);
				if (result.body.premium_since) usercopy.flags += 2048;
				this.loadedusers[info.id] = usercopy;
				for (let queredobj of this.requestedusers[info.id]) this.addToWrapper(info, queredobj[0], queredobj[1]);
			});
		}
		else if (!this.loadedusers[info.id]) {
			this.requestedusers[info.id].push([wrapper,type]);
		}
		else {
			this.addToWrapper(info, wrapper, type);
		}
	}
	
	addToWrapper (info, wrapper, type) {
		let blacklist = BDFDB.loadAllData(this, "blacklist");
		let settings = BDFDB.getAllData(this, "settings");
		let header = BDFDB.getParentEle(BDFDB.dotCN.userpopoutheader, wrapper);
		let badgewrapper = document.createElement("span");
		badgewrapper.className = `BE-badges ${!settings.useColoredVersion || (header && !header.classList.contains(BDFDB.disCN.userpopoutheadernormal)) ? BDFDB.disCN.userprofiletopsectionplaying : BDFDB.disCN.userprofiletopsectionnormal}`;
		badgewrapper.setAttribute("style", "all: unset !important;");
		for (let flag in this.badges) {
			if ((this.loadedusers[info.id].flags | flag) == this.loadedusers[info.id].flags && !blacklist[flag]) {
				let badge = document.createElement("div");
				badge.className = `BE-badge BE-badge-${this.badges[flag].name.replace(/ /g, "")} BE-badge-${type} ${this.BadgeClasses[this.badges[flag].selector]}`;
				badgewrapper.appendChild(badge);
				$(badge).on("mouseenter." + this.getName(), (e) => {
					BDFDB.createTooltip(this.badges[flag].name, e.currentTarget, {"type":type == "list" ? "left" : "top"});
				});
			}
		}
		if (badgewrapper.firstChild) wrapper.appendChild(badgewrapper);
	}
}
