//META{"name":"TopRoleEverywhere","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/TopRoleEverywhere","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/TopRoleEverywhere/TopRoleEverywhere.plugin.js"}*//

class TopRoleEverywhere {
	getName () {return "TopRoleEverywhere";}

	getVersion () {return "2.9.5";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds the highest role of a user as a tag.";}

	constructor () {
		this.changelog = {
			"fixed":[["Compact", "Fixed roles in role style for compact mode"]],
			"improved":[["Coloress", "If you disabled the plugin for colorless roles and the highest role of a user is a role without color, then the plugin will try to find the next highest role with a color"], ["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};

		this.patchedModules = {
			after: {
				MemberListItem: "render",
				MessageUsername: "render"
			}
		};
	}

	initConstructor () {
		this.css = `
			${BDFDB.dotCNS.member + BDFDB.dotCN.namecontainercontent} {
				overflow: visible;
			}
			.TRE-tag {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			.TRE-tag.TRE-roletag {
				margin: 0 0 0 0.3rem;
			}
			${BDFDB.dotCN.messageheadercompact} .TRE-roletag {
				text-indent: 0;
			}
			.TRE-tag.TRE-bottag {
				margin-left: 0.3rem;
			}
			.TRE-tag.TRE-listtag {
				max-width: 50%;
			}
			.TRE-roletag {
				display: inline-flex;
			}
			.TRE-roletag ${BDFDB.dotCN.userpopoutrolecircle} {
				flex: 0 0 auto;
			}`;

		this.defaults = {
			settings: {
				showInChat:			{value:true, 	inner:true, 	description:"Chat Window"},
				showInMemberList:	{value:true, 	inner:true, 	description:"Member List"},
				useOtherStyle:		{value:false, 	inner:false, 	description:"Use BotTag Style instead of the Role Style."},
				useBlackFont:		{value:false, 	inner:false,	description:"Instead of darkening the color for BotTag Style on bright colors use black font."},
				includeColorless:	{value:false, 	inner:false, 	description:"Include colorless roles."},
				showOwnerRole:		{value:false, 	inner:false, 	description:`Display Role Tag of Serverowner as "${BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER}".`},
				disableForBots:		{value:false, 	inner:false, 	description:"Disable Role Tag for Bots."},
				addUserID:			{value:false, 	inner:false, 	description:"Add the UserID as a Tag to the Chat Window."}
			}
		};
	}

	getSettingsPanel () {
		if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		let settingspanel, settingsitems = [], inneritems = [];
		
		for (let key in settings) (!this.defaults.settings[key].inner ? settingsitems : inneritems).push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
			className: BDFDB.disCN.marginbottom8,
			type: "Switch",
			plugin: this,
			keys: ["settings", key],
			label: this.defaults.settings[key].description,
			value: settings[key]
		}));
		
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
			title: "Add Role Tags in:",
			first: settingsitems.length == 0,
			last: true,
			children: inneritems
		}));
		
		return settingspanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
	}

	//legacy
	load () {}

	start () {
		if (!window.BDFDB) window.BDFDB = {myPlugins:{}};
		if (window.BDFDB && window.BDFDB.myPlugins && typeof window.BDFDB.myPlugins == "object") window.BDFDB.myPlugins[this.getName()] = this;
		let libraryScript = document.querySelector("head script#BDFDBLibraryScript");
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", _ => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(_ => {
			try {return this.initialize();}
			catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
		}, 30000);
	}

	initialize () {
		if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);

			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
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
		if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "showInMemberList")) {
			this.injectRoleTag(BDFDB.ReactUtils.getValue(e.returnvalue, "props.decorators.props.children"), e.instance.props.user, "list", BDFDB.disCN.bottagmember);
		}
	}

	processMessageUsername (e) {
		let user = BDFDB.ReactUtils.getValue(e.instance, "props.message.author");
		if (user && typeof e.returnvalue.props.children == "function" && BDFDB.DataUtils.get(this, "settings", "showInChat")) {
			let renderChildren = e.returnvalue.props.children;
			e.returnvalue.props.children = (...args) => {
				let renderedChildren = renderChildren(...args);
				this.injectRoleTag(renderedChildren.props.children, user, "chat", e.instance.props.isCompact ? BDFDB.disCN.bottagmessagecompact : BDFDB.disCN.bottagmessagecozy);
				return renderedChildren;
			};
		}
	}

	injectRoleTag (children, user, type, tagclass) {
		if (!BDFDB.ArrayUtils.is(children) || !user) return;
		let guild = BDFDB.LibraryModules.GuildStore.getGuild(BDFDB.LibraryModules.LastGuildStore.getGuildId());
		let settings = BDFDB.DataUtils.get(this, "settings");
		if (!guild || user.bot && settings.disableForBots) return;
		let role = BDFDB.LibraryModules.PermissionRoleUtils.getHighestRole(guild, user.id);
		if (role && !role.colorString && !settings.includeColorless) {
			let member = BDFDB.LibraryModules.MemberStore.getMember(guild.id, user.id);
			if (member) for (let sortedRole of BDFDB.ArrayUtils.keySort(member.roles.map(roleId => guild.getRole(roleId)), "position").reverse()) if (sortedRole.colorString) {
				role = sortedRole;
				break;
			}
		}
		if (role && (role.colorString || settings.includeColorless)) children.push(this.createRoleTag(settings, Object.assign({}, role, {
			name: settings.showOwnerRole && user.id == guild.ownerId ? BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER : role.name
		}),type, tagclass));
		if (type == "chat" && settings.addUserID) children.push(this.createRoleTag(settings, {
			name: user.id
		}, type, tagclass));
	}
	
	createRoleTag (settings, role, type, tagclass) {
		let tagcolor = BDFDB.ColorUtils.convert(role.colorString || BDFDB.DiscordConstants.Colors.PRIMARY_DARK_500, "RGB")
		let isbright = role.colorString && BDFDB.ColorUtils.isBright(tagcolor);
		tagcolor = isbright ? (settings.useBlackFont ? tagcolor : BDFDB.ColorUtils.change(tagcolor, -0.3)) : tagcolor;
		if (settings.useOtherStyle) {
			return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BotTag, {
				className: `${tagclass} TRE-tag TRE-bottag TRE-${type}tag`,
				tag: role.name,
				style: {
					backgroundColor: tagcolor,
					color: isbright && settings.useBlackFont ? "black" : null
				},
				onContextMenu: role.id ? e => {this.openRoleContextMenu(e, role);} : null
			});
		}
		else return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MemberRole, {
			className: `TRE-tag TRE-roletag TRE-${type}tag`,
			role: role,
			onContextMenu: role.id ? e => {this.openRoleContextMenu(e, role);} : null
		});
	}
	
	openRoleContextMenu (e, role) {
		BDFDB.LibraryModules.ContextMenuUtils.openContextMenu(e, function (e) {
			return BDFDB.ReactUtils.createElement(BDFDB.ModuleUtils.findByName("GuildRoleContextMenu"), Object.assign({}, e, {
				roleId: role.id
			}));
		});
	}
}
