//META{"name":"BadgesEverywhere","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BadgesEverywhere","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BadgesEverywhere/BadgesEverywhere.plugin.js"}*//

class BadgesEverywhere {
	getName () {return "BadgesEverywhere";} 

	getVersion () {return "1.3.2";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Displays Badges (Nitro, HypeSquad, etc...) in the chat/memberlist/userpopout. Thanks for Zerebos' help.";}

	initConstructor () {
		this.changelog = {
			"improved":[["Guild Boost","Changed the general guild boost badge in a way that it's displayed everywhere in all servers and added the option to add the badge for the boosting of the current server"]],
			"fixed":[["Message Username","Fixed the issue that moved the message username when a badge was appended"],["Badges","Some badges didn't get added properly"]]
		};
		
		this.patchModules = {
			"NameTag":"componentDidMount",
			"MessageUsername":"componentDidMount",
			"StandardSidebarView":"componentWillUnmount"
		};

		this.css = `
			${BDFDB.dotCNS.message + BDFDB.dotCN.messageheadercozy} {
				padding-top: 0;
			}
			${BDFDB.dotCNC.userpopoutheadertagnonickname + BDFDB.dotCNC.userpopoutheadernamewrapper + BDFDB.dotCN.messageheadercozymeta} > span:first-child {
				display: inline-flex;
			}
			.BE-badge {
				position: relative;
				background-size: contain;
				background-position: center;
				background-repeat: no-repeat;
				display: inline-flex;
				align-items: center;
				height: 17px !important;
				margin: 0 2px !important;
			}
			.BE-badge.BE-badge-list:not(.BE-badge-CurrentGuildBoost) {
				top: 1px !important;
			}
			.BE-badge.BE-badge-popout:not(.BE-badge-CurrentGuildBoost) {
				top: 3px !important;
			}
			.BE-badge.BE-badge-list.BE-badge-CurrentGuildBoost {
				top: -2px !important;
			}
			.BE-badge.BE-badge-chat.BE-badge-CurrentGuildBoost {
				top: -3px !important;
			}
			.BE-badge:not(.BE-badge-settings):first-of-type {
				margin-left: 5px !important;
			}
			.BE-badge:not(.BE-badge-settings):last-of-type {
				margin-right: 5px !important;
			}
			${BDFDB.dotCN.userprofiletopsectionplaying} .BE-badge.BE-badge-CurrentGuildBoost svg {
				color: white !important;
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
			.BE-badge.BE-badge-NitroGuildBoost {width:17px !important; min-width:17px !important;}
			.BE-badge.BE-badge-CurrentGuildBoost {width:14px !important; min-width:14px !important;}
			
			.BE-badge.BE-badge-settings {width:30px !important;min-width:30px !important;}
			
			${BDFDB.dotCNS.member + BDFDB.dotCN.memberpremiumicon}:not(.BE-badge-CurrentGuildBoost-inner) {display: none;}`; 


		this.requestedusers = {};
		this.loadedusers = {};

		this.defaults = {
			settings: {
				showInPopout:		{value:true, 	description:"Show Badge in User Popout."},
				showInChat:			{value:true, 	description:"Show Badge in Chat Window."},
				showInMemberList:	{value:true, 	description:"Show Badge in Member List."},
				useColoredVersion:	{value:true, 	description:"Use colored version of the Badges for Chat and Members."},
				showNitroDate:		{value:true, 	description:"Show the subscription date for Nitro/Boost Badges"}
			},
			badges: {
				"STAFF":					{value:true, 	id:"Staff",					name:"STAFF_BADGE_TOOLTIP",			selector:"profileBadgeStaff"},
				"PARTNER":					{value:true, 	id:"Partner",				name:"PARTNER_BADGE_TOOLTIP",		selector:"profileBadgePartner"},
				"HYPESQUAD":				{value:true, 	id:"HypeSquad",				name:"HYPESQUAD_BADGE_TOOLTIP",		selector:"profileBadgeHypesquad"},
				"BUG_HUNTER":				{value:true, 	id:"BugHunter",				name:"BUG_HUNTER_BADGE_TOOLTIP",	selector:"profileBadgeBugHunter"},
				"MFA_SMS":					{value:false, 	id:null,					name:null,							selector:false},
				"PREMIUM_PROMO_DISMISSED":	{value:false, 	id:null,					name:null,							selector:false},
				"HYPESQUAD_ONLINE_HOUSE_1":	{value:true, 	id:"HypeSquadBravery",		name:"HypeSquad Bravery",			selector:"profileBadgeHypeSquadOnlineHouse1"},
				"HYPESQUAD_ONLINE_HOUSE_2":	{value:true, 	id:"HypeSquadBrilliance",	name:"HypeSquad Brilliance",		selector:"profileBadgeHypeSquadOnlineHouse2"},
				"HYPESQUAD_ONLINE_HOUSE_3":	{value:true, 	id:"HypeSquadBalance",		name:"HypeSquad Balance",			selector:"profileBadgeHypeSquadOnlineHouse3"},
				"PREMIUM_EARLY_SUPPORTER":	{value:true, 	id:"EarlySupporter",		name:"EARLY_SUPPORTER_TOOLTIP",		selector:"profileBadgeEarlySupporter"},
				"NITRO":					{value:true, 	id:"Nitro",					name:"Nitro",						selector:"profileBadgePremium"},
				"GUILD_BOOST":				{value:true, 	id:"NitroGuildBoost",		name:"Nitro Guild Boost", 			selector:"profileGuildSubscriberlvl",	types:[1,2,3,4]},
			},
			indicators: {
				"CURRENT_GUILD_BOOST":			{value:true, 	name:"Current Nitro Guild Boost", 			markup:`<div class="BE-badge BE-badge-CurrentGuildBoost"><svg aria-label="Nitro boosting since May 31, 2019" name="PremiumGuildSubscriberBadge" class="BE-badge-CurrentGuildBoost-inner ${BDFDB.disCNS.memberpremiumicon + BDFDB.disCN.membericon}" aria-hidden="false" width="24" height="24" viewBox="0 0 8 12" style="margin: 0;"><path d="M4 0L0 4V8L4 12L8 8V4L4 0ZM7 7.59L4 10.59L1 7.59V4.41L4 1.41L7 4.41V7.59Z" fill="currentColor"></path><path d="M2 4.83V7.17L4 9.17L6 7.17V4.83L4 2.83L2 4.83Z" fill="currentColor"></path></svg></div>`},
			}
		};
		
		var UserFlags = BDFDB.WebModules.findByProperties("UserFlags").UserFlags;
		for (let flagname in UserFlags) if (this.defaults.badges[flagname]) {
			if (BDFDB.LanguageStringsCheck[this.defaults.badges[flagname].name]) this.defaults.badges[flagname].name = BDFDB.LanguageStrings[this.defaults.badges[flagname].name];
			this.defaults.badges[UserFlags[flagname]] = this.defaults.badges[flagname];
			delete this.defaults.badges[flagname];
		}
		this.nitroflag = Math.pow(2, Object.keys(UserFlags).length);
		this.defaults.badges[this.nitroflag] = this.defaults.badges.NITRO;
		delete this.defaults.badges.NITRO;
		this.boostflag = Math.pow(2, Object.keys(UserFlags).length + 1);
		this.defaults.badges[this.boostflag] = this.defaults.badges.GUILD_BOOST;
		delete this.defaults.badges.GUILD_BOOST;
		for (let flag in this.defaults.badges) if (!this.defaults.badges[flag].selector || isNaN(parseInt(flag))) delete this.defaults.badges[flag];
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var settings = BDFDB.getAllData(this, "settings");
		var badges = BDFDB.getAllData(this, "badges");
		var indicators = BDFDB.getAllData(this, "indicators");
		var settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Display Badges:</h3></div><div class="BDFDB-settings-inner-list">`;
		for (let flag in badges) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.badges[flag].name}</h3><span class="BE-badges BE-badges-settings ${BDFDB.disCN.userprofiletopsectionplaying}" style="all: unset !important;">`;
			if (Array.isArray(this.defaults.badges[flag].types)) for (let type of this.defaults.badges[flag].types) settingshtml += `<div class="BE-badge BE-badge-${this.defaults.badges[flag].id} ${this.BadgeClasses[this.defaults.badges[flag].selector + type]}"></div>`;
			else settingshtml += `<div class="BE-badge BE-badge-${this.defaults.badges[flag].id} ${this.BadgeClasses[this.defaults.badges[flag].selector]}"></div>`;
			settingshtml += `</span><span class="BE-badges BE-badges-settings ${BDFDB.disCN.userprofiletopsectionnormal}" style="all: unset !important;">`
			if (Array.isArray(this.defaults.badges[flag].types)) for (let type of this.defaults.badges[flag].types) settingshtml += `<div class="BE-badge BE-badge-${this.defaults.badges[flag].id} ${this.BadgeClasses[this.defaults.badges[flag].selector + type]}"></div>`;
			else settingshtml += `<div class="BE-badge BE-badge-${this.defaults.badges[flag].id} ${this.BadgeClasses[this.defaults.badges[flag].selector]}"></div>`;
			settingshtml += `</span><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="badges ${flag}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${badges[flag] ? " checked" : ""}></div></div>`;
		}
		for (let flag in indicators) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.indicators[flag].name}</h3><span class="BE-badges BE-badges-settings ${BDFDB.disCN.userprofiletopsectionplaying}" style="all: unset !important;">${this.defaults.indicators[flag].markup}</span><span class="BE-badges BE-badges-settings ${BDFDB.disCN.userprofiletopsectionnormal}" style="all: unset !important;">${this.defaults.indicators[flag].markup}</span><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="indicators ${flag}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${indicators[flag] ? " checked" : ""}></div></div>`;
		}

		settingshtml += `</div></div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);
		
		BDFDB.addClass(settingspanel.querySelectorAll(".BE-badge"), "BE-badge-settings");

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

			this.MemberUtils = BDFDB.WebModules.findByProperties("getMembers", "getMember");
			this.GuildBoostUtils = BDFDB.WebModules.findByProperties("getTierName", "getUserLevel");
			this.LastGuildStore = BDFDB.WebModules.findByProperties("getLastSelectedGuildId");
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
				if (result.body.premium_guild_since) usercopy.flags += this.boostflag;
				usercopy.premium_guild_since = result.body.premium_guild_since;
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
		let indicators = BDFDB.getAllData(this, "indicators");
		let settings = BDFDB.getAllData(this, "settings");
		let header = BDFDB.getParentEle(BDFDB.dotCN.userpopoutheader, wrapper);
		let badgewrapper = BDFDB.htmlToElement(`<span class="BE-badges BE-badges-${type} ${!settings.useColoredVersion || (header && !BDFDB.containsClass(header, BDFDB.disCN.userpopoutheadernormal)) ? BDFDB.disCN.userprofiletopsectionplaying : BDFDB.disCN.userprofiletopsectionnormal}" style="all: unset !important; order: 9 !important;"></span>`);
		for (let flag in this.defaults.badges) {
			if ((this.loadedusers[info.id].flags | flag) == this.loadedusers[info.id].flags && badges[flag]) {
				let badge = BDFDB.htmlToElement(`<div class="BE-badge BE-badge-${this.defaults.badges[flag].id} BE-badge-${type} ${this.BadgeClasses[this.defaults.badges[flag].selector + (flag == this.boostflag ? this.GuildBoostUtils.getUserLevel(this.loadedusers[info.id].premium_guild_since) : "")]}"></div>`);
				badgewrapper.appendChild(badge);
				badge.addEventListener("mouseenter", () => {
					let text = this.defaults.badges[flag].name;
					if (flag == this.nitroflag && settings.showNitroDate) text = BDFDB.LanguageStringsFormat("PREMIUM_BADGE_TOOLTIP", new Date(this.loadedusers[info.id].premium_since));
					else if (flag == this.boostflag && settings.showNitroDate) text = BDFDB.LanguageStringsFormat("PREMIUM_GUILD_SUBSCRIPTION_TOOLTIP", new Date(this.loadedusers[info.id].premium_guild_since));
					BDFDB.createTooltip(text, badge, {type:"top", style:"white-space: nowrap; max-width: unset"});
				});
			}
		}
		let member = this.MemberUtils.getMember(this.LastGuildStore.getGuildId(), info.id);
		if (indicators.CURRENT_GUILD_BOOST && member && member.premiumSince) {
			let badge = BDFDB.htmlToElement(this.defaults.indicators.CURRENT_GUILD_BOOST.markup);
			BDFDB.addClass(badge, `BE-badge-${type}`);
			badgewrapper.appendChild(badge);
			badge.addEventListener("mouseenter", () => {BDFDB.createTooltip(settings.showNitroDate ? BDFDB.LanguageStringsFormat("PREMIUM_GUILD_SUBSCRIPTION_TOOLTIP", new Date(member.premiumSince)) : "Boosting current server", badge, {type:"top", style:"white-space: nowrap; max-width: unset"});});
		}
		if (badgewrapper.firstChild) wrapper.insertBefore(badgewrapper, wrapper.querySelector(".owner-tag,.TRE-tag,svg[name=MobileDevice]"));
	}
}
