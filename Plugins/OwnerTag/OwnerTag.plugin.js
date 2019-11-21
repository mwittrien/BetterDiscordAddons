//META{"name":"OwnerTag","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/OwnerTag","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/OwnerTag/OwnerTag.plugin.js"}*//

class OwnerTag {
	getName () {return "OwnerTag";}

	getVersion () {return "1.2.3";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a Tag like Bottags to the Serverowner.";}

	constructor () {
		this.changelog = {
			"fixed":[["BetterRoleColors","Fixed now working when BRC is enabled ......"]],
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};

		this.patchedModules = {
			after: {
				MemberListItem: "render",
				MessageUsername: "render",
				UserPopout: ["componentDidMount", "componentDidUpdate"],
				UserProfile: ["componentDidMount", "componentDidUpdate"]
			}
		};
	}

	initConstructor () {
		this.css = `
			${BDFDB.dotCN.memberownericon}.admin-crown {
				color: #b3b3b3;
			}
		`;
		
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
		let inputs = BDFDB.DataUtils.get(this, "inputs");
		let settingsitems = [], inneritems = [];
		
		for (let key in inputs) settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
			className: BDFDB.disCN.marginbottom8,
			type: "TextInput",
			plugin: this,
			keys: ["inputs", key],
			label: this.defaults.inputs[key].description,
			basis: "50%",
			value: inputs[key]
		}));	
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
			className: BDFDB.disCN.marginbottom8
		}));
		for (let key in settings) (!this.defaults.settings[key].inner ? settingsitems : inneritems).push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
			className: BDFDB.disCN.marginbottom8,
			type: "Switch",
			plugin: this,
			keys: ["settings", key],
			label: this.defaults.settings[key].description,
			value: settings[key]
		}));
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
			title: "Add Owner Tag in:",
			first: settingsitems.length == 0,
			last: true,
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
		this.startTimeout = setTimeout(() => {
			try {return this.initialize();}
			catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
		}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);

			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.ModuleUtils.forceAllUpdates(this);

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	onSettingsClosed () {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
	}

	processMemberListItem (e) {
		let usertype = this.getUserType(e.instance.props.user);
		if (usertype && BDFDB.DataUtils.get(this, "settings", "addInMemberList")) {
			this.injectOwnerTag(BDFDB.ReactUtils.getValue(e.returnvalue, "props.decorators.props.children"), e.instance.props.user, usertype, 1, BDFDB.disCN.bottagmember);
		}
	}

	processMessageUsername (e) {
		let user = BDFDB.ReactUtils.getValue(e.instance, "props.message.author");
		let usertype = this.getUserType(user);
		if (usertype && user && typeof e.returnvalue.props.children == "function" && BDFDB.DataUtils.get(this, "settings", "addInChatWindow")) {
			let renderChildren = e.returnvalue.props.children;
			e.returnvalue.props.children = (...args) => {
				let renderedChildren = renderChildren(...args);
				this.injectOwnerTag(renderedChildren.props.children, user, usertype, 2, e.instance.props.isCompact ? BDFDB.disCN.bottagmessagecompact : BDFDB.disCN.bottagmessagecozy);
				return renderedChildren;
			};
		}
	}

	processUserPopout (e) {
		let usertype = this.getUserType(e.instance.props.user);
		if (usertype && BDFDB.DataUtils.get(this, "settings", "addInUserPopout")) {
			let nameTag = e.node.querySelector(BDFDB.dotCN.nametag);
			let tagProps = BDFDB.ReactUtils.findProps(nameTag, {name:["DiscordTag", "ColoredFluxTag"], up:true});
			if (nameTag && tagProps) this.appendOwnerTag(nameTag, e.instance.props.user, usertype, ((tagProps.botClass || "") + " " + BDFDB.disCNS.bottagnametag).trim(), tagProps.invertBotTagColor);
		}
	}

	processUserProfile (e) {
		let usertype = this.getUserType(e.instance.props.user);
		if (usertype && BDFDB.DataUtils.get(this, "settings", "addInUserProfil")) {
			let nameTag = e.node.querySelector(BDFDB.dotCN.nametag);
			let tagProps = BDFDB.ReactUtils.findProps(nameTag, {name:["DiscordTag", "ColoredFluxTag"], up:true});
			if (nameTag && tagProps) this.appendOwnerTag(nameTag, e.instance.props.user, usertype, ((tagProps.botClass || "") + " " + BDFDB.disCNS.bottagnametag).trim(), tagProps.invertBotTagColor);
		}
	}

	injectOwnerTag (children, user, usertype, insertindex, tagclass = "", inverted = false) {
		if (!BDFDB.ArrayUtils.is(children) || !user) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		let [_, index] = BDFDB.ReactUtils.findChildren(settings.useCrown || settings.hideNativeCrown ? children : null, {props:[["text",[BDFDB.LanguageUtils.LanguageStrings.GROUP_OWNER, BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER]]]});
		if (index > -1) children[index] = null;
		children.splice(insertindex, 0, this.createOwnerTag(user, usertype, tagclass, inverted, settings));
	}
	
	appendOwnerTag (parent, user, usertype, tagclass = "", inverted = false) {
		BDFDB.DOMUtils.remove(parent.querySelectorAll(".owner-tag"));
		let renderWrapper = BDFDB.DOMUtils.create(`<span class="owner-tag"></span>`);
		BDFDB.ReactUtils.render(this.createOwnerTag(user, usertype, tagclass, inverted), renderWrapper);
		parent.appendChild(renderWrapper);
	}
	
	createOwnerTag (user, usertype, tagclass, inverted, settings = BDFDB.DataUtils.get(this, "settings")) {
		let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
		let member = settings.useRoleColor ? (BDFDB.LibraryModules.MemberStore.getMember(channel.guild_id, user.id) || {}) : {};
		let isowner = usertype == 2;
		if (settings.useCrown) {
			let label = isowner ? (channel.type == 3 ? BDFDB.LanguageUtils.LanguageStrings.GROUP_OWNER : BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER) : BDFDB.LanguageUtils.LanguageStrings.ADMINISTRATOR;
			return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
				text: label,
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
					className: BDFDB.disCNS.memberownericon + (isowner ? "owner-crown" : "admin-crown"),
					name: BDFDB.LibraryComponents.SvgIcon.Names.CROWN,
					"aria-label": label
				})
			});
		}
		else {
			let tagcolor = BDFDB.ColorUtils.convert(member.colorString, "RGBA");
			let isbright = BDFDB.ColorUtils.isBright(tagcolor);
			tagcolor = isbright ? (settings.useBlackFont ? tagcolor : BDFDB.ColorUtils.change(tagcolor, -0.3)) : tagcolor;
			return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BotTag, {
				className: tagclass,
				tag: BDFDB.DataUtils.get(this, "inputs", isowner ? "ownTagName" : "ownAdminTagName"),
				invertColor: inverted,
				style: {
					backgroundColor: inverted ? (isbright && settings.useBlackFont ? "black" : null) : tagcolor,
					color: !inverted ? (isbright && settings.useBlackFont ? "black" : null) : tagcolor
				}
			});
		}
	}
	
	getUserType (user) {
		if (!user) return 0;
		let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
		if (!channel) return 0;
		let guild = BDFDB.LibraryModules.GuildStore.getGuild(channel.guild_id);
		let isowner = channel.ownerId == user.id || guild && guild.ownerId == user.id;
		if (!(isowner || (BDFDB.DataUtils.get(this, "settings", "addForAdmins") && BDFDB.UserUtils.can("ADMINISTRATOR", user.id)))) return 0;
		return isowner ? 2 : 1;
	}
}
