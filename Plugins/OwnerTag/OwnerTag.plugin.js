//META{"name":"OwnerTag","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/OwnerTag","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/OwnerTag/OwnerTag.plugin.js"}*//

module.exports = (_ => {
	const config = {
		"info": {
			"name": "OwnerTag",
			"author": "DevilBro",
			"version": "1.3.4",
			"description": "Add a tag or crown to the server owner (or admins/management)"
		},
		"changeLog": {
			"fixed": {
				"Chat": "Works again in chat"
			}
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
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`//META{"name":"`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
		stop() {}
	} : (([Plugin, BDFDB]) => {
		const userTypes = {
			NONE: 0,
			MANAGEMENT: 1,
			ADMIN: 2,
			OWNER: 3
		};
		
		var settings = {}, inputs = {};
		
		return class OwnerTag extends Plugin {
			onLoad() {
				this.patchedModules = {
					after: {
						MemberListItem: "render",
						MessageUsername: "default",
						NameTag: "default",
						UserPopout: "render"
					}
				};
				
				this.defaults = {
					settings: {
						addInChatWindow:		{value:true, 	inner:true,		description:"Messages"},
						addInMemberList:		{value:true, 	inner:true,		description:"Member List"},
						addInUserPopout:		{value:true, 	inner:true,		description:"User Popouts"},
						addInUserProfile:		{value:true, 	inner:true,		description:"User Profile Modal"},
						useRoleColor:			{value:true, 	inner:false,	description:"Use the Rolecolor instead of the default blue"},
						useBlackFont:			{value:false, 	inner:false,	description:"Instead of darkening the Rolecolor on bright colors use black font"},
						useCrown:				{value:false, 	inner:false,	description:"Use the Crown Icon instead of the Bot Tag Style"},
						hideNativeCrown:		{value:true, 	inner:false,	description:"Hide the native Crown Icon (not the Plugin one)"},
						addForAdmins:			{value:false, 	inner:false,	description:"Add an Admin Tag for users with admin permissions"},
						addForManagement:		{value:false, 	inner:false,	description:"Add a Management Tag for users with management permissions"},
						ignoreBotAdmins:		{value:false, 	inner:false,	description:"Do not add the Admin/Management tag for bots"}
					},
					inputs: {
						ownTagName:				{value:"Owner", 		description:"Tag Text for Owners"},
						ownAdminTagName:		{value:"Admin", 		description:"Tag Text for Admins"},
						ownManagementTagName:	{value:"Management", 	description:"Tag Text for Management"}
					}
				};
			
				this.css = `
					${BDFDB.dotCN.memberownericon + BDFDB.dotCN._ownertagadminicon} {
						color: #c0c0c0;
					}
					${BDFDB.dotCN.memberownericon + BDFDB.dotCN._ownertagmanagementicon} {
						color: #ef7f32;
					}
					${BDFDB.dotCNS.message + BDFDB.dotCN.memberownericon} {
						top: 2px;
					}
					${BDFDB.dotCNS.userprofile + BDFDB.dotCN.memberownericon} {
						top: 0px;
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
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: "Settings",
					collapseStates: collapseStates,
					children: Object.keys(settings).map(key => !this.defaults.settings[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Switch",
						plugin: this,
						key: key,
						disabled: key == "hideNativeCrown" && settings.useCrown,
						keys: ["settings", key],
						label: this.defaults.settings[key].description,
						value: settings[key],
						onChange: key == "useCrown" ? (value, instance) => {
							let hideNativeCrownInstance = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {key: "hideNativeCrown"});
							if (hideNativeCrownInstance) {
								hideNativeCrownInstance.props.disabled = value;
								BDFDB.ReactUtils.forceUpdate(hideNativeCrownInstance);
							}
						} : null
					}))
				}));
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: "Tag Settings",
					collapseStates: collapseStates,
					children: [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
						className: BDFDB.disCN.marginbottom4,
						tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H3,
						children: "Add Tags in:"
					})].concat(Object.keys(settings).map(key => this.defaults.settings[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Switch",
						plugin: this,
						keys: ["settings", key],
						label: this.defaults.settings[key].description,
						value: settings[key]
					})))
				}));
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: "Tag Text Settings",
					collapseStates: collapseStates,
					children: Object.keys(inputs).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "TextInput",
						plugin: this,
						keys: ["inputs", key],
						label: this.defaults.inputs[key].description,
						basis: "50%",
						value: inputs[key]
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
				inputs = BDFDB.DataUtils.get(this, "inputs");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			processMemberListItem (e) {
				let userType = this.getUserType(e.instance.props.user, e.instance.props.channel && e.instance.props.channel.id);
				if (userType && settings.addInMemberList) {
					this.injectOwnerTag(BDFDB.ObjectUtils.get(e.returnvalue, "props.decorators.props.children"), e.instance.props.user, userType, 1, {
						tagClass: BDFDB.disCN.bottagmember
					});
				}
			}

			processMessageUsername (e) {
				if (e.instance.props.message && settings.addInChatWindow) {
					let userType = this.getUserType(e.instance.props.message.author, e.instance.props.message.channel_id);
					if (userType) this.injectOwnerTag(e.returnvalue.props.children, e.instance.props.message.author, userType, e.instance.props.compact ? 0 : 2, {
						tagClass: e.instance.props.compact ? BDFDB.disCN.messagebottagcompact : BDFDB.disCN.messagebottagcozy,
						useRem: true
					});
				}
			}

			processNameTag (e) {
				if (e.instance.props.user && e.instance.props.className) {
					let userType = this.getUserType(e.instance.props.user);
					if (userType) {
						let inject = false, tagClass = "";
						switch (e.instance.props.className) {
							case BDFDB.disCN.userpopoutheadertagnonickname:
								inject = settings.addInUserPopout;
								tagClass = BDFDB.disCN.bottagnametag;
								break;
							case BDFDB.disCN.userprofilenametag:
								inject = settings.addInUserProfile;
								tagClass = BDFDB.disCNS.userprofilebottag + BDFDB.disCN.bottagnametag;
								break;
						}
						if (inject) this.injectOwnerTag(e.returnvalue.props.children, e.instance.props.user, userType, 2, {
							tagClass: tagClass,
							useRem: e.instance.props.useRemSizes,
							inverted: e.instance.props.invertBotTagColor
						});
					}
				}
			}

			processUserPopout (e) {
				if (e.instance.props.user && settings.addInUserPopout) {
					let userType = this.getUserType(e.instance.props.user, e.instance.props.channel && e.instance.props.channel.id);
					if (userType) {
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.userpopoutheadertagwithnickname]]});
						if (index > -1) this.injectOwnerTag(children, e.instance.props.user, userType, 2, {
							tagClass: BDFDB.disCNS.userpopoutheaderbottagwithnickname + BDFDB.disCN.bottagnametag,
							inverted: typeof e.instance.getMode == "function" && e.instance.getMode() !== "Normal"
						});
					}
				}
			}

			injectOwnerTag (children, user, userType, insertIndex, config = {}) {
				if (!BDFDB.ArrayUtils.is(children) || !user) return;
				if (settings.useCrown || settings.hideNativeCrown) {
					let [_, index] = BDFDB.ReactUtils.findParent(children, {props: [["text",[BDFDB.LanguageUtils.LanguageStrings.GROUP_OWNER, BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER]]]});
					if (index > -1) children[index] = null;
				}
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
				let member = settings.useRoleColor ? (BDFDB.LibraryModules.MemberStore.getMember(channel.guild_id, user.id) || {}) : {};
				let tag = null;
				if (settings.useCrown) {
					let label, className;
					switch (userType) {
						case userTypes.OWNER:
							label = channel.type == BDFDB.DiscordConstants.ChannelTypes.GROUP_DM ? BDFDB.LanguageUtils.LanguageStrings.GROUP_OWNER : BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER;
							className = BDFDB.disCN._ownertagownericon;
							break;
						case userTypes.ADMIN:
							label = BDFDB.LanguageUtils.LanguageStrings.ADMINISTRATOR;
							className = BDFDB.disCN._ownertagadminicon;
							break;
						case userTypes.MANAGEMENT:
							label = `${this.labels.management_text} (${[BDFDB.UserUtils.can("MANAGE_GUILD", user.id) && BDFDB.LanguageUtils.LibraryStrings.server, BDFDB.UserUtils.can("MANAGE_CHANNELS", user.id) && BDFDB.LanguageUtils.LanguageStrings.CHANNELS, BDFDB.UserUtils.can("MANAGE_ROLES", user.id) && BDFDB.LanguageUtils.LanguageStrings.ROLES].filter(n => n).join(", ")})`;
							className = BDFDB.disCN._ownertagmanagementicon;
							break;
					}
					tag = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: label,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.memberownericon, className),
							name: BDFDB.LibraryComponents.SvgIcon.Names.CROWN,
							"aria-label": label
						})
					});
				}
				else {
					let input, label;
					switch (userType) {
						case userTypes.OWNER:
							input = "ownTagName";
							break;
						case userTypes.ADMIN:
							input = "ownAdminTagName";
							break;
						case userTypes.MANAGEMENT:
							input = "ownManagementTagName";
							label = [BDFDB.UserUtils.can("MANAGE_GUILD", user.id) && BDFDB.LanguageUtils.LibraryStrings.server, BDFDB.UserUtils.can("MANAGE_CHANNELS", user.id) && BDFDB.LanguageUtils.LanguageStrings.CHANNELS, BDFDB.UserUtils.can("MANAGE_ROLES", user.id) && BDFDB.LanguageUtils.LanguageStrings.ROLES].filter(n => n).join(", ");
							break;
					}
					let tagColor = BDFDB.ColorUtils.convert(member.colorString, "RGBA");
					let isBright = BDFDB.ColorUtils.isBright(tagColor);
					tagColor = isBright ? (settings.useBlackFont ? tagColor : BDFDB.ColorUtils.change(tagColor, -0.3)) : tagColor;
					tag = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BotTag, {
						className: config.tagClass,
						useRemSizes: config.useRem,
						invertColor: config.inverted,
						style: {
							backgroundColor: config.inverted ? (isBright && settings.useBlackFont ? "black" : null) : tagColor,
							color: !config.inverted ? (isBright && settings.useBlackFont ? "black" : null) : tagColor
						},
						tag: inputs[input]
					});
					if (label) tag = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: label,
						children: tag
					});
				}
				children.splice(insertIndex, 0, tag);
			}
			
			getUserType (user, channelId) {
				if (!user) return userTypes.NONE;
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channelId || BDFDB.LibraryModules.LastChannelStore.getChannelId());
				if (!channel) return userTypes.NONE;
				let guild = BDFDB.LibraryModules.GuildStore.getGuild(channel.guild_id);
				let isOwner = channel.ownerId == user.id || guild && guild.ownerId == user.id;
				if (isOwner) return userTypes.OWNER;
				else if (settings.addForAdmins && BDFDB.UserUtils.can("ADMINISTRATOR", user.id) && !(settings.ignoreBotAdmins && user.bot)) return userTypes.ADMIN;
				else if (settings.addForManagement && (BDFDB.UserUtils.can("MANAGE_GUILD", user.id) || BDFDB.UserUtils.can("MANAGE_CHANNELS", user.id) || BDFDB.UserUtils.can("MANAGE_ROLES", user.id)) && !(settings.ignoreBotAdmins && user.bot)) return userTypes.MANAGEMENT;
				return userTypes.NONE;
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "hr":		//croatian
						return {
							management_text:					"Upravljanje"
						};
					case "da":		//danish
						return {
							management_text:					"Ledelse"
						};
					case "de":		//german
						return {
							management_text:					"Verwaltung"
						};
					case "es":		//spanish
						return {
							management_text:					"Administración"
						};
					case "fr":		//french
						return {
							management_text:					"Gestion"
						};
					case "it":		//italian
						return {
							management_text:					"Gestione"
						};
					case "nl":		//dutch
						return {
							management_text:					"Beheer"
						};
					case "no":		//norwegian
						return {
							management_text:					"Ledelse"
						};
					case "pl":		//polish
						return {
							management_text:					"Zarządzanie"
						};
					case "pt-BR":	//portuguese (brazil)
						return {
							management_text:					"Gestão"
						};
					case "fi":		//finnish
						return {
							management_text:					"Johto"
						};
					case "sv":		//swedish
						return {
							management_text:					"Förvaltning"
						};
					case "tr":		//turkish
						return {
							management_text:					"Yönetim"
						};
					case "cs":		//czech
						return {
							management_text:					"Řízení"
						};
					case "bg":		//bulgarian
						return {
							management_text:					"Управление"
						};
					case "ru":		//russian
						return {
							management_text:					"Управление"
						};
					case "uk":		//ukrainian
						return {
							management_text:					"Управління"
						};
					case "ja":		//japanese
						return {
							management_text:					"管理"
						};
					case "zh-TW":	//chinese (traditional)
						return {
							management_text:					"管理"
						};
					case "ko":		//korean
						return {
							management_text:					"관리"
						};
					default:		//default: english
						return {
							management_text:					"Management"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();