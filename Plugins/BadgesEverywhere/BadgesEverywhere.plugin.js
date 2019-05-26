//META{"name":"BadgesEverywhere","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BadgesEverywhere","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BadgesEverywhere/BadgesEverywhere.plugin.js"}*//

class BadgesEverywhere {
	getName () {return "BadgesEverywhere";} 

	getVersion () {return "1.2.6";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Displays Badges (Nitro, HypeSquad, etc...) in the chat/memberlist/userpopout. Thanks for Zerebos' help.";}

	initConstructor () {
		this.changelog = {
			"improved":[["Nitro","Nitro badge now shows the subscription date instead of the name (can be turned off)"]]
		};
		
		this.patchModules = {
			"NameTag":"componentDidMount",
			"MessageUsername":"componentDidMount",
			"StandardSidebarView":"componentWillUnmount"
		};

		this.css = ` 
			.BE-badge {
				background-size: contain;
				background-position: center;
				background-repeat: no-repeat;
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
			.BE-badge.BE-badge-Nitro {width:21px !important; min-width:21px !important;}
			.BE-badge.BE-badge-settings {width:30px !important; min-width:30px !important;}`;


		this.requestedusers = {};
		this.loadedusers = {};

		this.defaults = {
			settings: {
				showInPopout:		{value:true, 	description:"Show Badge in User Popout."},
				showInChat:			{value:true, 	description:"Show Badge in Chat Window."},
				showInMemberList:	{value:true, 	description:"Show Badge in Member List."},
				useColoredVersion:	{value:true, 	description:"Use colored version of the Badges for Chat and Members."},
				showNitroDate:		{value:true, 	description:"Show the subscription date for Nitro Badges"}
			},
			badges: {
				"STAFF1":						{value:true, 	name:"Staff",					selector:"profileBadgeStaff"},
				"PARTNER":						{value:true, 	name:"Partner",					selector:"profileBadgePartner"},
				"HYPESQUAD":					{value:true, 	name:"HypeSquad",				selector:"profileBadgeHypesquad"},
				"BUG_HUNTER":					{value:true, 	name:"BugHunter",				selector:"profileBadgeBugHunter"},
				"MFA_SMS":						{value:false, 	name:"MFASMS",					selector:false},
				"PREMIUM_PROMO_DISMISSED":		{value:false, 	name:"PROMODISMISSED",			selector:false},
				"HYPESQUAD_ONLINE_HOUSE_1":		{value:true, 	name:"HypeSquad Bravery",		selector:"profileBadgeHypeSquadOnlineHouse1"},
				"HYPESQUAD_ONLINE_HOUSE_2":		{value:true, 	name:"HypeSquad Brilliance",	selector:"profileBadgeHypeSquadOnlineHouse2"},
				"HYPESQUAD_ONLINE_HOUSE_3":		{value:true, 	name:"HypeSquad Balance",		selector:"profileBadgeHypeSquadOnlineHouse3"},
				"PREMIUM_EARLY_SUPPORTER":		{value:true, 	name:"Early Supporter",			selector:"profileBadgeEarlySupporter"},
				"NITRO":						{value:true, 	name:"Nitro",					selector:"profileBadgePremium"}
			}
		};
		
		var UserFlags = BDFDB.WebModules.findByProperties("UserFlags").UserFlags;
		for (let flagname in UserFlags) if (this.defaults.badges[flagname]) {
			this.defaults.badges[UserFlags[flagname]] = this.defaults.badges[flagname];
			delete this.defaults.badges[flagname];
		}
		this.nitroflag = Math.pow(2, Object.keys(UserFlags).length);
		this.defaults.badges[this.nitroflag] = this.defaults.badges.NITRO;
		delete this.defaults.badges.NITRO;
		for (let flag in this.defaults.badges) if (!this.defaults.badges[flag].selector || isNaN(parseInt(flag))) delete this.defaults.badges[flag];
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var settings = BDFDB.getAllData(this, "settings"); 
		var badges = BDFDB.getAllData(this, "badges"); 
		var settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Display Badges:</h3></div><div class="BDFDB-settings-inner-list">`;
		for (let flag in badges) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.badges[flag].name}</h3><span class="BE-badges ${BDFDB.disCN.userprofiletopsectionplaying}" style="all: unset !important;"><div class="BE-badge BE-badge-${this.defaults.badges[flag].name.replace(/ /g, "")} BE-badge-settings ${this.BadgeClasses[this.defaults.badges[flag].selector]}"></div></span><span class="BE-badges ${BDFDB.disCN.userprofiletopsectionnormal}" style="all: unset !important;"><div class="BE-badge BE-badge-${this.defaults.badges[flag].name.replace(/ /g, "")} BE-badge-settings ${this.BadgeClasses[this.defaults.badges[flag].selector]}"></div></span><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="badges ${flag}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${badges[flag] ? " checked" : ""}></div></div>`;
		}

		settingshtml += `</div></div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

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

			this.APIModule = BDFDB.WebModules.findByProperties("getAPIBaseURL");
			this.DiscordConstants = BDFDB.WebModules.findByProperties("Permissions", "ActivityTypes", "StatusTypes");
			this.BadgeClasses = BDFDB.WebModules.findByProperties("profileBadgeStaff","profileBadgePremium");

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".BE-badges");
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	processNameTag (instance, wrapper) { 
		if (!wrapper.classList || !instance || !instance.props) return;
		else if (BDFDB.containsClass(wrapper, BDFDB.disCN.membernametag) && BDFDB.getData("showInMemberList", this, "settings")) {
			this.addBadges(instance.props.user, wrapper, "list");
		}
		else if (BDFDB.containsClass(wrapper, BDFDB.disCN.userpopoutheadertag) && BDFDB.getData("showInPopout", this, "settings")) {
			wrapper = BDFDB.containsClass(wrapper, BDFDB.disCN.userpopoutheadertagwithnickname) && wrapper.previousSibling ? wrapper.previousSibling : wrapper;
			this.addBadges(instance.props.user, wrapper, "popout");
		}
	}

	processMessageUsername (instance, wrapper) {
		let message = BDFDB.getReactValue(instance, "props.message");
		if (message) {
			let username = wrapper.querySelector(BDFDB.dotCN.messageusername);
			if (username && BDFDB.getData("showInChat", this, "settings")) this.addBadges(message.author, wrapper, "chat");
		}
	}

	processStandardSidebarView (instance, wrapper) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			BDFDB.WebModules.forceAllUpdates(this);
		}
	}

	addBadges (info, wrapper, type) {
		if (!info || info.bot || !wrapper) return;
		if (!this.requestedusers[info.id]) {
			this.requestedusers[info.id] = [[wrapper,type]];
			this.APIModule.get(this.DiscordConstants.Endpoints.USER_PROFILE(info.id)).then(result => {
				let usercopy = Object.assign({},result.body.user);
				if (result.body.premium_since) usercopy.flags += this.nitroflag;
				usercopy.premium_since = result.body.premium_since;
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
		BDFDB.removeEles(wrapper.querySelectorAll(".BE-badges"));
		let badges = BDFDB.getAllData(this, "badges");
		let settings = BDFDB.getAllData(this, "settings");
		let header = BDFDB.getParentEle(BDFDB.dotCN.userpopoutheader, wrapper);
		let badgewrapper = BDFDB.htmlToElement(`<span class="BE-badges ${!settings.useColoredVersion || (header && !BDFDB.containsClass(header, BDFDB.disCN.userpopoutheadernormal)) ? BDFDB.disCN.userprofiletopsectionplaying : BDFDB.disCN.userprofiletopsectionnormal}" style="all: unset !important; order: 9 !important;"></span>`);
		for (let flag in this.defaults.badges) {
			if ((this.loadedusers[info.id].flags | flag) == this.loadedusers[info.id].flags && badges[flag]) {
				let badge = BDFDB.htmlToElement(`<div class="BE-badge BE-badge-${this.defaults.badges[flag].name.replace(/ /g, "")} BE-badge-${type} ${this.BadgeClasses[this.defaults.badges[flag].selector]}"></div>`);
				badgewrapper.appendChild(badge);
				badge.addEventListener("mouseenter", () => {BDFDB.createTooltip(flag == this.nitroflag && settings.showNitroDate ? BDFDB.LanguageStringsFormat("PREMIUM_BADGE_TOOLTIP", new Date(this.loadedusers[info.id].premium_since)) : this.defaults.badges[flag].name, badge, {type:"top", style:"white-space: nowrap; max-width: unset"});});
			}
		}
		if (badgewrapper.firstChild) wrapper.insertBefore(badgewrapper, wrapper.querySelector(".owner-tag,.TRE-tag,svg[name=MobileDevice]"));
	}
}
