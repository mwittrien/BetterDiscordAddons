//META{"name":"OwnerTag","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/OwnerTag","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/OwnerTag/OwnerTag.plugin.js"}*//

var OwnerTag = (_ => {
	return class OwnerTag {
		getName () {return "OwnerTag";}

		getVersion () {return "1.2.6";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds a Tag like Bottags to the Serverowner.";}

		constructor () {
			this.changelog = {
				"fixed":[["Message Update","Fixed the plugin for the new Message Update"]],
				"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
			};

			this.patchedModules = {
				after: {
					MemberListItem: "render",
					MessageHeader: "default",
					NameTag: "default",
					UserPopout: "render"
				}
			};
		}

		initConstructor () {
			this.css = `
				${BDFDB.dotCN.memberownericon}.admin-crown {
					color: #b3b3b3;
				}
				${BDFDB.dotCNS.message + BDFDB.dotCN.memberownericon} {
					top: 2px;
				}
				${BDFDB.dotCNS.userprofile + BDFDB.dotCN.memberownericon} {
					top: 0px;
				}
				${BDFDB.dotCNS.messagecozy + BDFDB.dotCN.memberownericon} {
					margin-right: .25rem;
				}
				${BDFDB.dotCNS.messagecozy + BDFDB.dotCN.messageusername} + ${BDFDB.dotCN.memberownericon} {
					margin-left: 0;
				}
			`;
			
			this.defaults = {
				settings: {
					addInChatWindow:		{value:true, 	inner:true,		description:"Messages"},
					addInMemberList:		{value:true, 	inner:true,		description:"Member List"},
					addInUserPopout:		{value:true, 	inner:true,		description:"User Popouts"},
					addInUserProfile:		{value:true, 	inner:true,		description:"User Profile Modal"},
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
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let inputs = BDFDB.DataUtils.get(this, "inputs");
			let settingspanel, settingsitems = [], inneritems = [];
			
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

				this.forceUpdateAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				this.forceUpdateAll();

				BDFDB.PluginUtils.clear(this);
			}
		}


		// begin of own functions

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
		}

		processMemberListItem (e) {
			let usertype = this.getUserType(e.instance.props.user);
			if (usertype && BDFDB.DataUtils.get(this, "settings", "addInMemberList")) {
				this.injectOwnerTag(BDFDB.ReactUtils.getValue(e.returnvalue, "props.decorators.props.children"), e.instance.props.user, usertype, 1, BDFDB.disCN.bottagmember);
			}
		}

		processMessageHeader (e) {
			if (e.instance.props.message && BDFDB.DataUtils.get(this, "settings", "addInChatWindow")) {
				let usertype = this.getUserType(e.instance.props.message.author);
				if (usertype) {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue.props.children.slice(1), {name: "Popout"});
					if (index > -1) this.injectOwnerTag(children, e.instance.props.message.author, usertype, e.instance.props.compact ? 0 : 2, e.instance.props.compact ? BDFDB.disCN.messagebottagcompact : BDFDB.disCN.messagebottagcozy);
				}
			}
		}

		processNameTag (e) {
			if (e.instance.props.user && e.instance.props.className) {
				let usertype = this.getUserType(e.instance.props.user);
				if (usertype) {
					let inject = false, bottag = "";
					switch (e.instance.props.className) {
						case BDFDB.disCN.userpopoutheadertagnonickname:
							inject = BDFDB.DataUtils.get(this, "settings", "addInUserPopout");
							bottag = BDFDB.disCN.bottagnametag;
							break;
						case BDFDB.disCN.userprofilenametag:
							inject = BDFDB.DataUtils.get(this, "settings", "addInUserProfile");
							bottag = BDFDB.disCNS.userprofilebottag + BDFDB.disCN.bottagnametag;
							break;
					}
					if (inject) this.injectOwnerTag(e.returnvalue.props.children, e.instance.props.user, usertype, 2, bottag);
				}
			}
		}

		processUserPopout (e) {
			if (e.instance.props.user && BDFDB.DataUtils.get(this, "settings", "addInUserPopout")) {
				let usertype = this.getUserType(e.instance.props.user);
				if (usertype) {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["className", BDFDB.disCN.userpopoutheadertagwithnickname]]});
					if (index > -1) this.injectOwnerTag(children, e.instance.props.user, usertype, 2, BDFDB.disCNS.userpopoutheaderbottagwithnickname + BDFDB.disCN.bottagnametag);
				}
			}
		}

		injectOwnerTag (children, user, usertype, insertindex, tagclass = "", inverted = false) {
			if (!BDFDB.ArrayUtils.is(children) || !user) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			if (settings.useCrown || settings.hideNativeCrown) {
				let [_, index] = BDFDB.ReactUtils.findChildren(children, {props: [["text",[BDFDB.LanguageUtils.LanguageStrings.GROUP_OWNER, BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER]]]});
				if (index > -1) children[index] = null;
			}
			let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
			let member = settings.useRoleColor ? (BDFDB.LibraryModules.MemberStore.getMember(channel.guild_id, user.id) || {}) : {};
			let isOwner = usertype == 2;
			let tag = null;
			if (settings.useCrown) {
				let label = isOwner ? (channel.type == 3 ? BDFDB.LanguageUtils.LanguageStrings.GROUP_OWNER : BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER) : BDFDB.LanguageUtils.LanguageStrings.ADMINISTRATOR;
				tag = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: label,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCNS.memberownericon + (isOwner ? "owner-crown" : "admin-crown"),
						name: BDFDB.LibraryComponents.SvgIcon.Names.CROWN,
						"aria-label": label
					})
				});
			}
			else {
				let tagcolor = BDFDB.ColorUtils.convert(member.colorString, "RGBA");
				let isbright = BDFDB.ColorUtils.isBright(tagcolor);
				tagcolor = isbright ? (settings.useBlackFont ? tagcolor : BDFDB.ColorUtils.change(tagcolor, -0.3)) : tagcolor;
				tag = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BotTag, {
					className: tagclass,
					tag: BDFDB.DataUtils.get(this, "inputs", isOwner ? "ownTagName" : "ownAdminTagName"),
					invertColor: inverted,
					style: {
						backgroundColor: inverted ? (isbright && settings.useBlackFont ? "black" : null) : tagcolor,
						color: !inverted ? (isbright && settings.useBlackFont ? "black" : null) : tagcolor
					}
				});
			}
			children.splice(insertindex, 0, tag);
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
	
		forceUpdateAll () {
			BDFDB.ModuleUtils.forceAllUpdates(this);
			BDFDB.MessageUtils.rerenderAll();
		}
	}
})();