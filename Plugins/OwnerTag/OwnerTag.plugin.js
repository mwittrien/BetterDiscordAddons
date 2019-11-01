//META{"name":"OwnerTag","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/OwnerTag","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/OwnerTag/OwnerTag.plugin.js"}*//

class OwnerTag {
	getName () {return "OwnerTag";}

	getVersion () {return "1.1.8";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a Tag like Bottags to the Serverowner.";}

	constructor () {
		this.changelog = {
			"improved":[["Transparent colors","Added compatibility for (semi-)transparent colors"]]
		};

		this.patchModules = {
			"MemberListItem":["componentDidMount","componentDidUpdate"],
			"MessageUsername":["componentDidMount","componentDidUpdate"],
			"UserPopout":["componentDidMount","componentDidUpdate"],
			"UserProfile":["componentDidMount","componentDidUpdate"],
			"StandardSidebarView":"componentWillUnmount"
		};
	}

	initConstructor () {
		this.defaults = {
			settings: {
				addInChatWindow:		{value:true, 	inner:true,		description:"Messages"},
				addInMemberList:		{value:true, 	inner:true,		description:"Member List"},
				addInUserPopout:		{value:true, 	inner:true,		description:"User Popouts"},
				addInUserProfil:		{value:true, 	inner:true,		description:"User Profile Modal"},
				useRoleColor:			{value:true, 	inner:false,	description:"Use the Rolecolor instead of the default blue."},
				useBlackFont:			{value:false, 	inner:false,	description:"Instead of darkening the Rolecolor on bright colors use black font."},
				useCrown:				{value:false, 	inner:false,	description:"Use the Crown Icon instead of the OwnerTag."},
				hideNativeCrown:		{value:true, 	inner:false,	description:"Hide the native Crown Icon (not the Plugin one)."},
				addForAdmins:			{value:false, 	inner:false,	description:"Also add the Tag for any user with Admin rights."}
			},
			inputs: {
				ownTagName:				{value:"Owner", 	description:"Owner Tag Text for Owners"},
				ownAdminTagName:		{value:"Admin", 	description:"Owner Tag Text for Admins"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		var inputs = BDFDB.DataUtils.get(this, "inputs");
		var settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.titlesize18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in inputs) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCN.flexchild}" style="flex: 0 0 50%;">${this.defaults.inputs[key].description}</h3><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex2 + BDFDB.disCN.directioncolumn}" style="flex: 1 1 auto;"><input type="text" option="${key}" value="${inputs[key]}" placeholder="${this.defaults.inputs[key].value}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.titlesize16}"></div></div>`;
		}
		for (let key in settings) {
			if (!this.defaults.settings[key].inner) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Add Owner Tag in:</h3></div><div class="BDFDB-settings-inner-list">`;
		for (let key in settings) {
			if (this.defaults.settings[key].inner) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.DOMUtils.create(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.ListenerUtils.add(this, settingspanel, "keyup", BDFDB.dotCN.input, () => {this.saveInputs(settingspanel);});

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

			BDFDB.ModuleUtils.forceAllUpdates(this);

			this.addHideCSS();
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.DOMUtils.remove(".owner-tag, .owner-tag-crown");

			BDFDB.DOMUtils.removeLocalStyle(this.name + "HideCrown");

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	saveInputs (settingspanel) {
		let inputs = {};
		for (let input of settingspanel.querySelectorAll(BDFDB.dotCN.input)) {
			inputs[input.getAttribute("option")] = input.value;
		}
		BDFDB.DataUtils.save(inputs, this, "inputs");
		this.SettingsUpdated = true;
	}

	processMemberListItem (instance, wrapper, returnvalue) {
		if (instance.props && BDFDB.DataUtils.get(this, "settings", "addInMemberList")) this.addOwnerTag(instance.props.user, null, wrapper.querySelector(BDFDB.dotCN.namecontainernamewrapper), "list", BDFDB.disCN.bottagmember, null);
	}

	processUserPopout (instance, wrapper, returnvalue) {
		if (instance.props && BDFDB.DataUtils.get(this, "settings", "addInUserPopout")) this.addOwnerTag(instance.props.user, null, wrapper.querySelector(BDFDB.dotCN.nametag), "popout", BDFDB.disCN.bottagnametag, wrapper);
	}

	processUserProfile (instance, wrapper, returnvalue) {
		if (instance.props && BDFDB.DataUtils.get(this, "settings", "addInUserProfil")) this.addOwnerTag(instance.props.user, null, wrapper.querySelector(BDFDB.dotCN.nametag), "profile", BDFDB.disCNS.bottagnametag + BDFDB.disCN.userprofilebottag, wrapper);
	}

	processMessageUsername (instance, wrapper, returnvalue, methodnames) {
		let message = BDFDB.ReactUtils.getValue(instance, "props.message");
		if (message && BDFDB.DataUtils.get(this, "settings", "addInChatWindow")) {
			let username = wrapper.querySelector(BDFDB.dotCN.messageusername);
			if (username) {
				let messagegroup = BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagegroup, wrapper);
				this.addOwnerTag(message.author, message.channel_id, username.parentElement, "chat", BDFDB.DOMUtils.containsClass(messagegroup, BDFDB.disCN.messagegroupcozy) ? BDFDB.disCN.bottagmessagecozy : BDFDB.disCN.bottagmessagecompact, null);
			}
		}
	}

	processStandardSidebarView (instance, wrapper, returnvalue) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			BDFDB.DOMUtils.remove(".owner-tag, .owner-tag-crown");
			BDFDB.ModuleUtils.forceAllUpdates(this);
			this.addHideCSS();
		}
	}

	addOwnerTag (info, channelid, wrapper, type, selector = "", container) {
		if (!info || !wrapper || !wrapper.parentElement) return;
		BDFDB.DOMUtils.remove(wrapper.querySelectorAll(".owner-tag, .owner-tag-crown"));
		let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channelid || BDFDB.LibraryModules.LastChannelStore.getChannelId());
		if (!channel) return;
		let guild = BDFDB.LibraryModules.GuildStore.getGuild(channel.guild_id);
		let settings = BDFDB.DataUtils.get(this, "settings");
		let isowner = channel.ownerId == info.id || guild && guild.ownerId == info.id;
		if (!(isowner || (settings.addForAdmins && BDFDB.UserUtils.can("ADMINISTRATOR", info.id)))) return;
		let member = settings.useRoleColor ? (BDFDB.LibraryModules.MemberStore.getMember(channel.guild_id, info.id) || {}) : {};
		if (!settings.useCrown) {
			let tag = BDFDB.DOMUtils.create(`<span class="owner-tag ${isowner ? "owner-tag-owner" : "owner-tag-admin"} owner-${type}-tag ${(settings.useRoleColor ? "owner-tag-rolecolor " : "") + BDFDB.disCN.bottag + (selector ? (" " + selector) : "")}" style="order: 10 !important;">${BDFDB.DataUtils.get(this, "inputs", isowner ? "ownTagName" : "ownAdminTagName")}</span>`);
			let invert = container && container.firstElementChild && !(BDFDB.DOMUtils.containsClass(container.firstElementChild, BDFDB.disCN.userpopoutheadernormal) || BDFDB.DOMUtils.containsClass(container.firstElementChild, BDFDB.disCN.userprofiletopsectionnormal));
			BDFDB.DOMUtils.addClass(tag, invert ? BDFDB.disCN.bottaginvert : BDFDB.disCN.bottagregular);
			let EditUsersData = BDFDB.BDUtils.isPluginEnabled("EditUsers") ? BDFDB.BDUtils.getPlugin("EditUsers").getUserData(info.id, wrapper) : {};
			let tagcolor = BDFDB.ColorUtils.convert(EditUsersData.color1 || member.colorString, "RGBA");
			let isbright = BDFDB.ColorUtils.isBright(tagcolor);
			tagcolor = isbright ? (settings.useBlackFont ? tagcolor : BDFDB.ColorUtils.change(tagcolor, -0.3)) : tagcolor;
			tag.style.setProperty(invert ? "color" : "background-color", tagcolor, "important");
			if (isbright && settings.useBlackFont) tag.style.setProperty(invert ? "background-color" : "color", "black", "important");
			wrapper.insertBefore(tag, wrapper.querySelector(".TRE-tag,svg[name=MobileDevice]"));
		}
		else {
			let crown = BDFDB.DOMUtils.create(`<svg name="Crown" class="owner-tag-crown ${isowner ? "owner-tag-owner" : "owner-tag-admin"} ${BDFDB.disCN.memberownericon}" aria-hidden="false" width="24" height="24" viewBox="0 0 16 16"><g fill="none" fill-rule="evenodd"><path fill-rule="evenodd" clip-rule="evenodd" d="M13.6572 5.42868C13.8879 5.29002 14.1806 5.30402 14.3973 5.46468C14.6133 5.62602 14.7119 5.90068 14.6473 6.16202L13.3139 11.4954C13.2393 11.7927 12.9726 12.0007 12.6666 12.0007H3.33325C3.02725 12.0007 2.76058 11.792 2.68592 11.4954L1.35258 6.16202C1.28792 5.90068 1.38658 5.62602 1.60258 5.46468C1.81992 5.30468 2.11192 5.29068 2.34325 5.42868L5.13192 7.10202L7.44592 3.63068C7.46173 3.60697 7.48377 3.5913 7.50588 3.57559C7.5192 3.56612 7.53255 3.55663 7.54458 3.54535L6.90258 2.90268C6.77325 2.77335 6.77325 2.56068 6.90258 2.43135L7.76458 1.56935C7.89392 1.44002 8.10658 1.44002 8.23592 1.56935L9.09792 2.43135C9.22725 2.56068 9.22725 2.77335 9.09792 2.90268L8.45592 3.54535C8.46794 3.55686 8.48154 3.56651 8.49516 3.57618C8.51703 3.5917 8.53897 3.60727 8.55458 3.63068L10.8686 7.10202L13.6572 5.42868ZM2.66667 12.6673H13.3333V14.0007H2.66667V12.6673Z" fill="${isowner ? "currentColor" : "#b3b3b3"}"></path></svg>`);
			crown.addEventListener("mouseenter", () => {
				BDFDB.TooltipUtils.create(crown, isowner ? (channel.type == 3 ? BDFDB.LanguageUtils.LanguageStrings.GROUP_OWNER : BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER) : BDFDB.LanguageUtils.LanguageStrings.ADMINISTRATOR, {type: "top"});
			});
			wrapper.insertBefore(crown, wrapper.querySelector(".TRE-tag,svg[name=MobileDevice]"));
		}
	}

	addHideCSS () {
		let settings = BDFDB.DataUtils.get(this, "settings");
		if (settings.hideNativeCrown || settings.useCrown) BDFDB.DOMUtils.appendLocalStyle(this.name + "HideCrown", `${BDFDB.dotCNS.member + BDFDB.dotCN.memberownericon}:not(.owner-tag-crown) {display: none;}`);
		else BDFDB.DOMUtils.removeLocalStyle(this.name + "HideCrown");
	}
}
