//META{"name":"TopRoleEverywhere","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/TopRoleEverywhere","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/TopRoleEverywhere/TopRoleEverywhere.plugin.js"}*//

module.exports = (_ => {
    const config = {
		"info": {
			"name": "TopRoleEverywhere",
			"author": "DevilBro",
			"version": "3.0.3",
			"description": "Adds the highest role of a user as a tag."
		}
	};
    return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
        load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue:[]});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {delete window.BDFDB_Global.downloadModal;require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (error, response, body) => {require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), body, _ => {});});}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
        }
        start() {}
        stop() {}
    } : (([Plugin, BDFDB]) => {
		var settings = {};
	
        return class TopRoleEverywhere extends Plugin {
			onLoad() {
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
				
				this.patchedModules = {
					after: {
						MemberListItem: "render",
						MessageHeader: "default"
					}
				};
				
				this.css = `
					${BDFDB.dotCNS.member + BDFDB.dotCN.namecontainercontent} {
						overflow: visible;
					}
					${BDFDB.dotCN._toproleseverywheretag} {
						cursor: pointer;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
					${BDFDB.dotCN._toproleseverywheremembertag} {
						max-width: 50%;
					}
					${BDFDB.dotCN._toproleseverywherebadgestyle} {
						margin-left: 0.3rem;
					}
					${BDFDB.dotCNS.themelight + BDFDB.dotCN._toproleseverywhererolestyle} {
						color: rgba(79, 84, 92, 0.8);
					}
					${BDFDB.dotCNS.themedark + BDFDB.dotCN._toproleseverywhererolestyle} {
						color: hsla(0, 0%, 100%, 0.8);
					}
					${BDFDB.dotCNS.messagecompact + BDFDB.dotCNS.messageheader + BDFDB.dotCN._toproleseverywherebadgestyle} {
						margin-left: 0.1rem;
						margin-right: 0.2rem;
					}
					${BDFDB.dotCNS.messagecompact + BDFDB.dotCNS.messageheader + BDFDB.dotCN._toproleseverywhererolestyle} {
						margin-right: 0.3rem;
					}
					${BDFDB.dotCN._toproleseverywhererolestyle} {
						display: inline-flex;
						margin: 0 0 0 0.3rem;
					}
					${BDFDB.dotCNS._toproleseverywhererolestyle + BDFDB.dotCN.userpopoutrolecircle} {
						flex: 0 0 auto;
					}
					${BDFDB.dotCNS.messagecompact + BDFDB.dotCNS.messageheader + BDFDB.dotCN._toproleseverywhererolestyle} {
						text-indent: 0;
					}
				`;
			}
			
			onStart() {
				this.forceUpdateAll();
			}
			
			onStop() {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				for (let key in settings) if (!this.defaults.settings[key].inner) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}));
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
					title: "Add Role Tags in:",
					first: settingsItems.length == 0,
					last: true,
					children: Object.keys(settings).map(key => this.defaults.settings[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						className: BDFDB.disCN.marginbottom8,
						type: "Switch",
						plugin: this,
						keys: ["settings", key],
						label: this.defaults.settings[key].description,
						value: settings[key]
					}))
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
	
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			processMemberListItem (e) {
				if (e.instance.props.user && settings.showInMemberList) {
					this.injectRoleTag(BDFDB.ObjectUtils.get(e.returnvalue, "props.decorators.props.children"), e.instance.props.user, "member", {
						tagClass: BDFDB.disCN.bottagmember
					});
				}
			}

			processMessageHeader (e) {
				if (e.instance.props.message) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue.props.children.slice(1), {name: "Popout", props: [["className", BDFDB.disCN.messageusername]]});
					if (index > -1) {
						if (settings.showInChat) this.injectRoleTag(children, e.instance.props.message.author, "chat", {
							tagClass: e.instance.props.compact ? BDFDB.disCN.messagebottagcompact : BDFDB.disCN.messagebottagcozy,
							useRem: true
						});
						if (settings.addUserID) this.injectIdTag(children, e.instance.props.message.author, "chat", {
							tagClass: e.instance.props.compact ? BDFDB.disCN.messagebottagcompact : BDFDB.disCN.messagebottagcozy,
							useRem: true
						});
					}
				}
			}

			injectRoleTag (children, user, type, config = {}) {
				if (!BDFDB.ArrayUtils.is(children) || !user) return;
				let guild = BDFDB.LibraryModules.GuildStore.getGuild(BDFDB.LibraryModules.LastGuildStore.getGuildId());
				if (!guild || user.bot && settings.disableForBots) return;
				let role = BDFDB.LibraryModules.PermissionRoleUtils.getHighestRole(guild, user.id);
				if (role && !role.colorString && !settings.includeColorless) {
					let member = BDFDB.LibraryModules.MemberStore.getMember(guild.id, user.id);
					if (member) for (let sortedRole of BDFDB.ArrayUtils.keySort(member.roles.map(roleId => guild.getRole(roleId)), "position").reverse()) if (sortedRole.colorString) {
						role = sortedRole;
						break;
					}
				}
				if (role && (role.colorString || settings.includeColorless)) children.push(this.createTag(Object.assign({}, role, {
					name: settings.showOwnerRole && user.id == guild.ownerId ? BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER : role.name
				}), type, config));
			}

			injectIdTag (children, user, type, config = {}) {
				if (!BDFDB.ArrayUtils.is(children) || !user) return;
				children.push(this.createTag({
					name: user.id
				}, type, config));
			}
			
			createTag (role, type, config = {}) {
				if (settings.useOtherStyle) {
					let tagColor = BDFDB.ColorUtils.convert(role.colorString || BDFDB.DiscordConstants.Colors.PRIMARY_DARK_500, "RGB")
					let isBright = role.colorString && BDFDB.ColorUtils.isBright(tagColor);
					tagColor = isBright ? (settings.useBlackFont ? tagColor : BDFDB.ColorUtils.change(tagColor, -0.3)) : tagColor;
					return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BotTag, {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._toproleseverywheretag, BDFDB.disCN[`_toproleseverywhere${type}tag`], BDFDB.disCN._toproleseverywherebadgestyle, config.tagClass),
						useRemSizes: config.useRem,
						invertColor: config.inverted,
						style: {
							backgroundColor: tagColor,
							color: isBright && settings.useBlackFont ? "black" : null
						},
						tag: role.name,
						onContextMenu: role.id ? e => {this.openRoleContextMenu(e, role);} : null
					});
				}
				else return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MemberRole, {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._toproleseverywheretag, BDFDB.disCN[`_toproleseverywhere${type}tag`], BDFDB.disCN._toproleseverywhererolestyle),
					role: role,
					onContextMenu: role.id ? e => {this.openRoleContextMenu(e, role);} : null
				});
			}
			
			openRoleContextMenu (e, role) {
				BDFDB.LibraryModules.ContextMenuUtils.openContextMenu(e, function (e) {
					return BDFDB.ReactUtils.createElement(BDFDB.ModuleUtils.findByName("DeveloperContextMenu"), Object.assign({}, e, {id: role.id}));
				});
			}
		};
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();