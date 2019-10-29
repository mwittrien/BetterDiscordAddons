//META{"name":"BadgesEverywhere","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BadgesEverywhere","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BadgesEverywhere/BadgesEverywhere.plugin.js"}*//

class BadgesEverywhere {
	getName () {return "BadgesEverywhere";} 

	getVersion () {return "1.4.6";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Displays Badges (Nitro, HypeSquad, etc...) in the chat/memberlist/userpopout. Thanks for Zerebos' help.";}

	constructor () {
		this.changelog = {
			"fixed":[["Padding in Memberlist","Fixed the padding in the memberlist"]]
		};

		this.patchModules = {
			"MemberListItem":"componentDidMount",
			"MessageUsername":"componentDidMount",
			"UserPopout":"componentDidMount",
			"StandardSidebarView":"componentWillUnmount"
		};
	}

	initConstructor () {
		this.css = `
			${BDFDB.dotCN.userpopoutcustomstatus}:not(:last-child) {
				margin-top: 4px;
				margin-bottom: 4px;
			}
			.BE-badge {
				position: relative;
				background-size: contain;
				background-position: center;
				background-repeat: no-repeat;
				display: inline-flex;
				align-items: center;
				justify-content: center;
				margin: 0 2px !important;
			}
			.BE-badge.BE-badge-popout:not(.BE-badge-CurrentGuildBoost) {
				top: 3px !important;
			}
			.BE-badge.BE-badge-popout.BE-badge-CurrentGuildBoost {
				top: 1px !important;
			}
			.BE-badge.BE-badge-list.BE-badge-CurrentGuildBoost {
				top: -1px !important;
			}
			.BE-badge.BE-badge-chat:not(.BE-badge-CurrentGuildBoost) {
				top: 2px !important;
			}
			.BE-badge.BE-badge-chat.BE-badge-CurrentGuildBoost {
				top: 1px !important;
			}
			.BE-badge:not(.BE-badge-settings):first-of-type {
				margin-left: 5px !important;
			}
			.BE-badge:not(.BE-badge-settings):last-of-type {
				margin-right: 0 !important;
			}
			${BDFDB.dotCN.userprofiletopsectionplaying} .BE-badge.BE-badge-CurrentGuildBoost svg {
				color: white !important;
			}
			.BE-badge.BE-badge-chat, .BE-badge.BE-badge-list {height:14px !important;}
			.BE-badge.BE-badge-chat.BE-size-17, .BE-badge.BE-badge-list.BE-size-17 {width:14px !important; min-width:14px !important;}
			.BE-badge.BE-badge-chat.BE-size-21, .BE-badge.BE-badge-list.BE-size-21 {width:18px !important; min-width:18px !important;}
			.BE-badge.BE-badge-chat.BE-size-22, .BE-badge.BE-badge-list.BE-size-22 {width:18px !important; min-width:18px !important;}
			.BE-badge.BE-badge-chat.BE-size-24, .BE-badge.BE-badge-list.BE-size-24 {width:19px !important; min-width:19px !important;}
			.BE-badge:not(.BE-badge-chat):not(.BE-badge-list) {height:17px !important;}
			.BE-badge:not(.BE-badge-chat):not(.BE-badge-list).BE-size-17 {width:17px !important; min-width:17px !important;}
			.BE-badge:not(.BE-badge-chat):not(.BE-badge-list).BE-size-21 {width:21px !important; min-width:21px !important;}
			.BE-badge:not(.BE-badge-chat):not(.BE-badge-list).BE-size-22 {width:22px !important; min-width:22px !important;}
			.BE-badge:not(.BE-badge-chat):not(.BE-badge-list).BE-size-24 {width:24px !important; min-width:24px !important;}

			.BE-badge.BE-badge-CurrentGuildBoost {height:14px !important; width:14px !important; min-width:14px !important;}

			#app-mount .BE-badge.BE-badge-settings {width:30px !important;min-width:30px !important;}

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
				"STAFF":					{value:true, 	id:"Staff",					name:"STAFF_BADGE_TOOLTIP",			selector:"profileBadgeStaff",					size:17},
				"PARTNER":					{value:true, 	id:"Partner",				name:"PARTNER_BADGE_TOOLTIP",		selector:"profileBadgePartner",					size:22},
				"HYPESQUAD":				{value:true, 	id:"HypeSquad",				name:"HYPESQUAD_BADGE_TOOLTIP",		selector:"profileBadgeHypesquad",				size:17},
				"BUG_HUNTER":				{value:true, 	id:"BugHunter",				name:"BUG_HUNTER_BADGE_TOOLTIP",	selector:"profileBadgeBugHunter",				size:17},
				"MFA_SMS":					{value:false, 	id:null,					name:null,							selector:false,									size:0},
				"PREMIUM_PROMO_DISMISSED":	{value:false, 	id:null,					name:null,							selector:false,									size:0},
				"HYPESQUAD_ONLINE_HOUSE_1":	{value:true, 	id:"HypeSquadBravery",		name:"HypeSquad Bravery",			selector:"profileBadgeHypeSquadOnlineHouse1",	size:17},
				"HYPESQUAD_ONLINE_HOUSE_2":	{value:true, 	id:"HypeSquadBrilliance",	name:"HypeSquad Brilliance",		selector:"profileBadgeHypeSquadOnlineHouse2",	size:17},
				"HYPESQUAD_ONLINE_HOUSE_3":	{value:true, 	id:"HypeSquadBalance",		name:"HypeSquad Balance",			selector:"profileBadgeHypeSquadOnlineHouse3",	size:17},
				"PREMIUM_EARLY_SUPPORTER":	{value:true, 	id:"EarlySupporter",		name:"EARLY_SUPPORTER_TOOLTIP",		selector:"profileBadgeEarlySupporter",			size:24},
				"NITRO":					{value:true, 	id:"Nitro",					name:"Nitro",						selector:"profileBadgePremium",					size:21},
				"GUILD_BOOST":				{value:true, 	id:"NitroGuildBoost",		name:"Nitro Guild Boost", 			selector:"profileGuildSubscriberlvl",			size:17,	types:[1,2,3,4]},
			},
			indicators: {
				"CURRENT_GUILD_BOOST":		{value:true, 	id:"CurrentGuildBoost",		name:"Current Nitro Guild Boost", 	inner:`<svg name="PremiumGuildSubscriberBadge" class="BE-badge-CurrentGuildBoost-inner ${BDFDB.disCNS.memberpremiumicon + BDFDB.disCN.membericon}" aria-hidden="false" width="24" height="24" viewBox="0 0 8 12" style="margin: 0;"><path d="M4 0L0 4V8L4 12L8 8V4L4 0ZM7 7.59L4 10.59L1 7.59V4.41L4 1.41L7 4.41V7.59Z" fill="currentColor"></path><path d="M2 4.83V7.17L4 9.17L6 7.17V4.83L4 2.83L2 4.83Z" fill="currentColor"></path></svg>`},
			}
		};

		for (let flagname in BDFDB.DiscordConstants.UserFlags) if (this.defaults.badges[flagname]) {
			if (BDFDB.LanguageUtils.LanguageStringsCheck[this.defaults.badges[flagname].name]) this.defaults.badges[flagname].name = BDFDB.LanguageUtils.LanguageStrings[this.defaults.badges[flagname].name];
			this.defaults.badges[BDFDB.DiscordConstants.UserFlags[flagname]] = this.defaults.badges[flagname];
			delete this.defaults.badges[flagname];
		}
		this.nitroflag = Math.pow(2, Object.keys(BDFDB.DiscordConstants.UserFlags).length);
		this.defaults.badges[this.nitroflag] = this.defaults.badges.NITRO;
		delete this.defaults.badges.NITRO;
		this.boostflag = Math.pow(2, Object.keys(BDFDB.DiscordConstants.UserFlags).length + 1);
		this.defaults.badges[this.boostflag] = this.defaults.badges.GUILD_BOOST;
		delete this.defaults.badges.GUILD_BOOST;
		for (let flag in this.defaults.badges) if (!this.defaults.badges[flag].selector || isNaN(parseInt(flag))) delete this.defaults.badges[flag];
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		var badges = BDFDB.DataUtils.get(this, "badges");
		var indicators = BDFDB.DataUtils.get(this, "indicators");
		var settingsitems = [], inneritems = [];
		
		for (let key in settings) settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSwitch, {
			className: BDFDB.disCN.marginbottom8,
			plugin: this,
			keys: ["settings", key],
			label: this.defaults.settings[key].description,
			value: settings[key]
		}));
		for (let flag in badges) inneritems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSwitch, {
			className: BDFDB.disCN.marginbottom8,
			plugin: this,
			keys: ["badges", flag],
			label: this.defaults.badges[flag].name,
			value: badges[flag],
			labelchildren: [
				BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(`<span class="BE-badges BE-badges-settings ${BDFDB.disCN.userprofiletopsectionplaying}" style="all: unset !important;">${Array.isArray(this.defaults.badges[flag].types) ? this.defaults.badges[flag].types.map(rank => this.createBadge("settings", flag, rank)).join("") : this.createBadge("settings", flag)}</span>`)),
				BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(`<span class="BE-badges BE-badges-settings ${BDFDB.disCN.userprofiletopsectionnormal}" style="all: unset !important;">${Array.isArray(this.defaults.badges[flag].types) ? this.defaults.badges[flag].types.map(rank => this.createBadge("settings", flag, rank)).join("") : this.createBadge("settings", flag)}</span>`))
			]
		}));
		for (let flag in indicators) inneritems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSwitch, {
			className: BDFDB.disCN.marginbottom8,
			plugin: this,
			keys: ["indicators", flag],
			label: this.defaults.indicators[flag].name,
			value: indicators[flag],
			labelchildren: [
				BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(`<span class="BE-badges BE-badges-settings ${BDFDB.disCN.userprofiletopsectionplaying}" style="all: unset !important;">${this.createBadge("settings", flag)}</span>`)),
				BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(`<span class="BE-badges BE-badges-settings ${BDFDB.disCN.userprofiletopsectionnormal}" style="all: unset !important;">${this.createBadge("settings", flag)}</span>`))
			]
		}));
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
			title: "Display Badges:",
			children: inneritems
		}));
		
		return BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
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
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);

			this.BadgeClasses = BDFDB.ModuleUtils.findByProperties("profileBadgeStaff", "profileBadgePremium");

			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.DOMUtils.remove(".BE-badges");
			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	processMemberListItem (e) {
		if (e.instance.props && BDFDB.DataUtils.get(this, "settings", "showInMemberList")) this.addBadges(e.instance.props.user, e.node.querySelector(BDFDB.dotCN.namecontainernamewrapper), "list");
	}

	processMessageUsername (e) {
		let message = BDFDB.ReactUtils.getValue(e.instance, "props.message");
		if (message) {
			let username = e.node.querySelector(BDFDB.dotCN.messageusername);
			if (username && BDFDB.DataUtils.get(this, "settings", "showInChat")) this.addBadges(message.author, e.node, "chat");
		}
	}

	processUserPopout (e) {
		if (e.instance.props && BDFDB.DataUtils.get(this, "settings", "showInPopout")) this.addBadges(e.instance.props.user, e.node.querySelector(BDFDB.dotCN.userpopoutheadertext), "popout");
	}

	processStandardSidebarView () {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
	}
	
	createBadge (type, flag, rank = "") {
		let data = this.defaults.badges[flag] || this.defaults.indicators[flag];
		if (!data) return "";
		let className = [`BE-badge`, `BE-badge-${type}`, data.id ? `BE-badge-${data.id}` : null, data.selector ? this.BadgeClasses[data.selector + rank] : null, data.size ? `BE-size-${data.size}` : null].filter(n => n).join(" ");
		return `<div class="${className}">${data.inner || ""}</div>`;
	}

	addBadges (info, wrapper, type) {
		if (!info || info.bot || !wrapper) return;
		if (!this.requestedusers[info.id]) {
			this.requestedusers[info.id] = [[wrapper,type]];
			BDFDB.LibraryModules.APIUtils.get(BDFDB.DiscordConstants.Endpoints.USER_PROFILE(info.id)).then(result => {
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
		BDFDB.DOMUtils.remove(wrapper.querySelectorAll(".BE-badges"));
		let badges = BDFDB.DataUtils.get(this, "badges");
		let indicators = BDFDB.DataUtils.get(this, "indicators");
		let settings = BDFDB.DataUtils.get(this, "settings");
		let header = BDFDB.DOMUtils.getParent(BDFDB.dotCN.userpopoutheader, wrapper);
		let badgewrapper = BDFDB.DOMUtils.create(`<span class="BE-badges BE-badges-${type} ${!settings.useColoredVersion || (header && !BDFDB.DOMUtils.containsClass(header, BDFDB.disCN.userpopoutheadernormal)) ? BDFDB.disCN.userprofiletopsectionplaying : BDFDB.disCN.userprofiletopsectionnormal}" style="all: unset !important; display: flex !important; flex-direction: row !important;"></span>`);
		for (let flag in this.defaults.badges) {
			if ((this.loadedusers[info.id].flags | flag) == this.loadedusers[info.id].flags && badges[flag]) {
				let badge = BDFDB.DOMUtils.create(this.createBadge(type, flag, flag == this.boostflag ? BDFDB.LibraryModules.GuildBoostUtils.getUserLevel(this.loadedusers[info.id].premium_guild_since) : ""));
				badgewrapper.appendChild(badge);
				badge.addEventListener("mouseenter", () => {
					let text = this.defaults.badges[flag].name;
					if (flag == this.nitroflag && settings.showNitroDate) text = BDFDB.LanguageUtils.LanguageStringsFormat("PREMIUM_BADGE_TOOLTIP", new Date(this.loadedusers[info.id].premium_since));
					else if (flag == this.boostflag && settings.showNitroDate) text = BDFDB.LanguageUtils.LanguageStringsFormat("PREMIUM_GUILD_SUBSCRIPTION_TOOLTIP", new Date(this.loadedusers[info.id].premium_guild_since));
					BDFDB.TooltipUtils.create(badge, text, {type:"top", style:"white-space: nowrap; max-width: unset"});
				});
			}
		}
		let member = BDFDB.LibraryModules.MemberStore.getMember(BDFDB.LibraryModules.LastGuildStore.getGuildId(), info.id);
		if (indicators.CURRENT_GUILD_BOOST && member && member.premiumSince) {
			let badge = BDFDB.DOMUtils.create(this.createBadge(type, "CURRENT_GUILD_BOOST"));
			badgewrapper.appendChild(badge);
			badge.addEventListener("mouseenter", () => {
				BDFDB.TooltipUtils.create(badge, settings.showNitroDate ? BDFDB.LanguageUtils.LanguageStringsFormat("PREMIUM_GUILD_SUBSCRIPTION_TOOLTIP", new Date(member.premiumSince)) : "Boosting current server", {type:"top", style:"white-space: nowrap; max-width: unset"});
			});
		}
		if (badgewrapper.firstChild) {
			if (header) {
				header.firstElementChild.appendChild(badgewrapper);
				let popout = header.parentElement.parentElement;
				if (popout.style.transform.indexOf("translateY(-1") == -1) {
					let arect = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount)), prect = BDFDB.DOMUtils.getRects(popout);
					popout.style.setProperty("top", (prect.y + prect.height > arect.height ? (arect.height - prect.height) : prect.y) + "px");
				}
			}
			else {
				wrapper.insertBefore(badgewrapper, wrapper.querySelector(".owner-tag,.TRE-tag,svg[name=MobileDevice]"));
			}
		}
	}
}
