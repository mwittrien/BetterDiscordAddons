//META{"name":"OwnerTag"}*//

class OwnerTag {
	getName () {return "OwnerTag";}

	getVersion () {return "1.0.5";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a Tag like Bottags to the Serverowner.";}
	
	initConstructor () {
		this.patchModules = {
			"NameTag":["componentDidMount","componentDidUpdate"],
			"MessageUsername":["componentDidMount","componentDidUpdate"],
			"StandardSidebarView":"componentWillUnmount"
		};
			
		this.defaults = {
			settings: {
				addInChatWindow:		{value:true, 	inner:true,		description:"Messages"},
				addInMemberList:		{value:true, 	inner:true,		description:"Member List"},
				addInUserPopout:		{value:true, 	inner:true,		description:"User Popouts"},
				addInUserProfil:		{value:true, 	inner:true,		description:"User Profile Modal"},
				useRoleColor:			{value:true, 	inner:false,	description:"Use the Rolecolor instead of the default blue."},
				useBlackFont:			{value:false, 	inner:false,	description:"Instead of darkening the Rolecolor on bright colors use black font."}
			},
			inputs: {
				ownTagName:				{value:"Owner", 	description:"Owner Tag Text"}
			}
		};
	}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var settings = BDFDB.getAllData(this, "settings"); 
		var inputs = BDFDB.getAllData(this, "inputs"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in inputs) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 30%; line-height: 38px;">${this.defaults.inputs[key].description}</h3><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCN.directioncolumn}" style="flex: 1 1 auto;"><input type="text" option="${key}" value="${inputs[key]}" placeholder="${this.defaults.inputs[key].value}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}"></div></div>`;
		}
		for (let key in settings) {
			if (!this.defaults.settings[key].inner) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Add Owner Tag in:</h3></div><div class="DevilBro-settings-inner-list">`;
		for (let key in settings) {
			if (this.defaults.settings[key].inner) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `</div></div>`;
		
		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		$(settingspanel)
			.on("keyup", BDFDB.dotCN.input, () => {this.saveInputs(settingspanel);});
			
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
			
			this.MemberUtils = BDFDB.WebModules.findByProperties("getMembers", "getMember");
			this.GuildUtils = BDFDB.WebModules.findByProperties("getGuilds","getGuild");
			this.LastGuildStore = BDFDB.WebModules.findByProperties("getLastSelectedGuildId");
			
			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			BDFDB.removeEles(".owner-tag");
			BDFDB.unloadMessage(this);
		}
	}
	
	
	// begin of own functions

	saveInputs (settingspanel) {
		let inputs = {};
		for (let input of settingspanel.querySelectorAll(BDFDB.dotCN.input)) {
			inputs[input.getAttribute("option")] = input.value;
		}
		BDFDB.saveAllData(inputs, this, "inputs");
		this.updateTags = true;
	}
	
	processNameTag (instance, wrapper) {
		let container = null;
		if (!instance.props || !wrapper.classList) return;
		else if (wrapper.classList.contains(BDFDB.disCN.membernametag) && BDFDB.getData("addInMemberList", this, "settings")) {
			this.addOwnerTag(instance.props.user, wrapper, "list", BDFDB.disCN.bottagnametag + (instance.props.botClass ? (" " + instance.props.botClass) : ""), container);
		}
		else if ((container = BDFDB.getParentEle(BDFDB.dotCN.userpopout, wrapper)) != null && BDFDB.getData("addInUserPopout", this, "settings")) {
			this.addOwnerTag(instance.props.user, wrapper, "popout", BDFDB.disCN.bottagnametag + (instance.props.botClass ? (" " + instance.props.botClass) : ""), container);
		}
		else if ((container = BDFDB.getParentEle(BDFDB.dotCN.userprofile, wrapper)) != null && BDFDB.getData("addInUserProfil", this, "settings")) {
			this.addOwnerTag(instance.props.user, wrapper, "profile", BDFDB.disCN.bottagnametag + (instance.props.botClass ? (" " + instance.props.botClass) : ""), container);
		}
	}
	
	processMessageUsername (instance, wrapper, methodnames) {
		let message = BDFDB.getReactValue(instance, "props.message");
		if (message && BDFDB.getData("addInChatWindow", this, "settings")) {
			let username = wrapper.querySelector(BDFDB.dotCN.messageusername);
			if (username) {
				let messagegroup = BDFDB.getParentEle(BDFDB.dotCN.messagegroup, wrapper);
				this.addOwnerTag(message.author, username.parentElement, "chat", BDFDB.disCN.bottagmessage + " " + (messagegroup.classList.contains(BDFDB.disCN.messagegroupcozy) ? BDFDB.disCN.bottagmessagecozy : BDFDB.disCN.bottagmessagecompact), null);
			}
		}
	}
	
	processStandardSidebarView (instance, wrapper) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			BDFDB.removeEles(".owner-tag");
			BDFDB.WebModules.forceAllUpdates(this);
		}
	}
	
	addOwnerTag (info, wrapper, type, selector = "", container) {
		if (!info || !wrapper || !wrapper.parentElement) return;
		BDFDB.removeEles(wrapper.querySelectorAll(".owner-tag"));
		let guild = this.GuildUtils.getGuild(this.LastGuildStore.getGuildId());
		if (!guild || guild.ownerId != info.id) return;
		let settings = BDFDB.getAllData(this, "settings");
		let member = settings.useRoleColor ? (this.MemberUtils.getMember(this.LastGuildStore.getGuildId(), info.id) || {}) : {};
		let EditUsersData = BDFDB.isPluginEnabled("EditUsers") ? bdplugins.EditUsers.plugin.getUserData(info.id, wrapper) : {};
		let tag = document.createElement("span");
		tag.className = "owner-tag " + "owner-" + type + "-tag " + (settings.useRoleColor ? "owner-tag-rolecolor " : "") + BDFDB.disCN.bottag + (selector ? (" " + selector) : "");
		tag.innerText = BDFDB.getData("ownTagName", this, "inputs") || "Owner";
		let invert = false;
		if (container && container.firstElementChild && !container.firstElementChild.classList.contains(BDFDB.disCN.userpopoutheadernormal) && !container.firstElementChild.classList.contains(BDFDB.disCN.userprofiletopsectionnormal)) invert = true;
		tag.classList.add(invert ? BDFDB.disCN.bottaginvert : BDFDB.disCN.bottagregular);
		let tagcolor = BDFDB.colorCONVERT(EditUsersData.color1 || member.colorString, "RGB");
		let isbright = BDFDB.colorISBRIGHT(tagcolor);
		tagcolor = isbright ? (settings.useBlackFont ? tagcolor : BDFDB.colorCHANGE(tagcolor, -0.3)) : tagcolor;
		tag.style.setProperty(invert ? "color" : "background-color", tagcolor, "important");
		if (isbright && settings.useBlackFont) tag.style.setProperty(invert ? "background-color" : "color", "black", "important");
		wrapper.appendChild(tag);
	}
}
