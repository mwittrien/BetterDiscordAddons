/**
 * @name StaffTag
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.4.6
 * @description Adds a Crown/Tag to Server Owners (or Admins/Management)
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/StaffTag/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/StaffTag/StaffTag.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "StaffTag",
			"author": "DevilBro",
			"version": "1.4.6",
			"description": "Adds a Crown/Tag to Server Owners (or Admins/Management)"
		},
		"changeLog": {
			"fixed": {
				"User Popout": "Fixing Stuff for the User Popout Update, thanks Discord"
			}
		}
	};

	return (window.Lightcord || window.LightCord) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return "Do not use LightCord!";}
		load () {BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)");}
		start() {}
		stop() {}
	} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		const userTypes = {
			NONE: 0,
			MANAGEMENT: 1,
			ADMIN: 2,
			OWNER: 3
		};
		
		return class StaffTag extends Plugin {
			onLoad () {
				this.patchedModules = {
					after: {
						MemberListItem: "render",
						MessageUsername: "default",
						VoiceUser: "render",
						NameTag: "default",
						UserPopoutInfo: "UserPopoutInfo"
					}
				};
				
				this.defaults = {
					general: {
						useCrown:				{value: true,	description: "Use the Crown Icon instead of the Bot Tag Style"},
						useRoleColor:			{value: true, 	description: "Use the Role Color instead of the default Blurple"},
						useBlackFont:			{value: false,	description: "Use black Font instead of darkening the Role Color on bright Colors"},
						ignoreBots:				{value: false,	description: "Don't add the Owner/Admin/Management Tag for Bots"}
					},
					tagTypes: {
						owners:					{value: true, 	description: "Owner Tag (Server/Group Owner)"},
						admins:					{value: true, 	description: "Admin Tag (Admin Permissions)"},
						managementG:			{value: true, 	description: "Management Tag (Server Management)"},
						managementC:			{value: true, 	description: "Management Tag (Channel Management)"},
						managementR:			{value: true, 	description: "Management Tag (Role Management)"},
						managementU:			{value: true, 	description: "Management Tag (User Management 'Kick/Ban')"},
						managementM:			{value: true, 	description: "Management Tag (Message Management)"}
					},
					tagPlaces: {
						chat:					{value: true, 	description: "Messages"},
						memberList:				{value: true, 	description: "Member List"},
						voiceList:				{value: true, 	description: "Voice User List"},
						userPopout:				{value: true, 	description: "User Popouts"},
						userProfile:			{value: true, 	description: "User Profile Modal"},
					},
					inputs: {
						ownOwnerTagName:		{value: "Owner", 		description: "Owner Tags"},
						ownAdminTagName:		{value: "Admin", 		description: "Admin Tags"},
						ownManagementTagName:	{value: "Management", 	description: "Management Tags"}
					}
				};
			
				this.css = `
					${BDFDB.dotCN.memberownericon + BDFDB.dotCN._stafftagadminicon} {
						color: #aaa9ad;
					}
					${BDFDB.dotCN.memberownericon + BDFDB.dotCN._stafftagmanagementicon} {
						color: #88540b;
					}
					${BDFDB.dotCNS.message + BDFDB.dotCN.memberownericon} {
						top: 2px;
					}
					${BDFDB.dotCNS.voicecontent + BDFDB.dotCN.memberownericon} {
						top: 0px;
					}
					${BDFDB.dotCNS.userprofile + BDFDB.dotCN.memberownericon} {
						top: 0px;
					}
					${BDFDB.dotCNS.messagerepliedmessage + BDFDB.dotCN.memberownericon} {
						top: 0px;
						margin-left: 0;
						margin-right: 4px;
					}
					${BDFDB.dotCNS.messagecompact + BDFDB.dotCN.memberownericon} {
						top: 1px;
						margin-left: 0;
						margin-right: 4px;
					}
				`;
			}
			
			onStart () {
				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
				
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Settings",
							collapseStates: collapseStates,
							children: Object.keys(this.defaults.general).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								key: key,
								keys: ["general", key],
								label: this.defaults.general[key].description,
								value: this.settings.general[key]
							}))
						}));
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Tag Settings",
							collapseStates: collapseStates,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
									title: "Add Tags for:",
									dividerBottom: true,
									children: Object.keys(this.defaults.tagTypes).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
										type: "Switch",
										plugin: this,
										keys: ["tagTypes", key],
										label: this.defaults.tagTypes[key].description,
										value: this.settings.tagTypes[key]
									}))
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
									title: "Add Tags in:",
									children: Object.keys(this.defaults.tagPlaces).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
										type: "Switch",
										plugin: this,
										keys: ["tagPlaces", key],
										label: this.defaults.tagPlaces[key].description,
										value: this.settings.tagPlaces[key]
									}))
								})
							]
						}));
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Tag Text Settings",
							collapseStates: collapseStates,
							children: Object.keys(this.defaults.inputs).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "TextInput",
								plugin: this,
								keys: ["inputs", key],
								label: this.defaults.inputs[key].description,
								basis: "50%",
								value: this.settings.inputs[key]
							}))
						}));
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
	
			forceUpdateAll () {				
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			processMemberListItem (e) {
				let userType = this.getUserType(e.instance.props.user, e.instance.props.channel && e.instance.props.channel.id);
				if (userType && this.settings.tagPlaces.memberList) {
					this.injectStaffTag(BDFDB.ObjectUtils.get(e.returnvalue, "props.decorators.props.children"), e.instance.props.user, userType, 1, {
						channelId: e.instance.props.channel && e.instance.props.channel.id,
						tagClass: BDFDB.disCN.bottagmember
					});
				}
			}

			processMessageUsername (e) {
				if (!e.instance.props.message || !this.settings.tagPlaces.chat) return;
				const author = e.instance.props.userOverride || e.instance.props.message.author;
				let userType = this.getUserType(author, e.instance.props.message.channel_id);
				if (userType) this.injectStaffTag(e.returnvalue.props.children, author, userType, e.instance.props.compact ? 0 : 2, {
					channelId: e.instance.props.message.channel_id,
					tagClass: e.instance.props.compact ? BDFDB.disCN.messagebottagcompact : BDFDB.disCN.messagebottagcozy,
					useRem: true
				});
			}

			processVoiceUser (e) {
				if (e.instance.props.user && this.settings.tagPlaces.voiceList) {
					let userType = this.getUserType(e.instance.props.user, e.instance.props.channel && e.instance.props.channel.id);
					if (userType) {
						let content = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.voicecontent]]});
						if (content) this.injectStaffTag(content.props.children, e.instance.props.user, userType, 3, {
							channelId: e.instance.props.channel && e.instance.props.channel.id,
						});
					}
				}
			}

			processNameTag (e) {
				if (e.instance.props.user && e.instance.props.className) {
					let userType = this.getUserType(e.instance.props.user);
					if (userType) {
						let inject = false, tagClass = "";
						switch (e.instance.props.className) {
							case BDFDB.disCN.userpopoutheadertagnonickname:
								inject = this.settings.tagPlaces.userPopout;
								tagClass = BDFDB.disCNS.userpopoutheaderbottag + BDFDB.disCN.bottagnametag;
								break;
							case BDFDB.disCN.userprofilenametag:
								inject = this.settings.tagPlaces.userProfile;
								tagClass = BDFDB.disCNS.userprofilebottag + BDFDB.disCN.bottagnametag;
								break;
						}
						if (inject) this.injectStaffTag(e.returnvalue.props.children, e.instance.props.user, userType, 2, {
							tagClass: tagClass,
							useRem: e.instance.props.useRemSizes,
							inverted: e.instance.props.invertBotTagColor
						});
					}
				}
			}
			
			processUserPopoutInfo (e) {
				if (e.instance.props.user && this.settings.tagPlaces.userPopout) {
					let userType = this.getUserType(e.instance.props.user, e.instance.props.channel && e.instance.props.channel.id);
					if (userType) {
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.userpopoutheadernickname]]});
						if (index > -1) {
							if (!BDFDB.ArrayUtils.is(children[index].props.children)) children[index].props.children = [children[index].props.children].flat(10);
							this.injectStaffTag(children[index].props.children, e.instance.props.user, userType, 2, {
								tagClass: BDFDB.disCNS.userpopoutheaderbottag + BDFDB.disCN.bottagnametag,
								inverted: typeof e.instance.getMode == "function" && e.instance.getMode() !== "Normal"
							});
						}
					}
				}
			}

			injectStaffTag (children, user, userType, insertIndex, config = {}) {
				if (!BDFDB.ArrayUtils.is(children) || !user) return;
				let [_, index] = BDFDB.ReactUtils.findParent(children, {props: [["text", [BDFDB.LanguageUtils.LanguageStrings.GROUP_OWNER, BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER]]]});
				if (index > -1) children[index] = null;
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(config.channelId || BDFDB.LibraryModules.LastChannelStore.getChannelId());
				let member = channel && this.settings.general.useRoleColor ? (BDFDB.LibraryModules.MemberStore.getMember(channel.guild_id, user.id) || {}) : {};
				let tag = null;
				if (this.settings.general.useCrown) {
					let label, className;
					switch (userType) {
						case userTypes.OWNER:
							label = channel && channel.isGroupDM() ? BDFDB.LanguageUtils.LanguageStrings.GROUP_OWNER : BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER;
							className = BDFDB.disCN._stafftagownericon;
							break;
						case userTypes.ADMIN:
							label = BDFDB.LanguageUtils.LanguageStrings.ADMINISTRATOR;
							className = BDFDB.disCN._stafftagadminicon;
							break;
						case userTypes.MANAGEMENT:
							label = `${this.labels.management} (${this.getManagementLabel(user)})`;
							className = BDFDB.disCN._stafftagmanagementicon;
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
							input = "ownOwnerTagName";
							break;
						case userTypes.ADMIN:
							input = "ownAdminTagName";
							break;
						case userTypes.MANAGEMENT:
							input = "ownManagementTagName";
							label = this.getManagementLabel(user);
							break;
					}
					let tagColor = BDFDB.ColorUtils.convert(member.colorString, "RGBA");
					let isBright = BDFDB.ColorUtils.isBright(tagColor);
					tagColor = isBright ? (this.settings.general.useBlackFont ? tagColor : BDFDB.ColorUtils.change(tagColor, -0.3)) : tagColor;
					tag = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BotTag, {
						className: config.tagClass,
						useRemSizes: config.useRem,
						invertColor: config.inverted,
						style: {
							backgroundColor: config.inverted ? (isBright && this.settings.general.useBlackFont ? "black" : null) : tagColor,
							color: !config.inverted ? (isBright && this.settings.general.useBlackFont ? "black" : null) : tagColor
						},
						tag: this.settings.inputs[input]
					});
					if (label) tag = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: label,
						children: tag
					});
				}
				children.splice(insertIndex, 0, tag);
			}
			
			getManagementLabel (user) {
				return [
					this.settings.tagTypes.managementG && BDFDB.UserUtils.can("MANAGE_GUILD", user.id) && BDFDB.LanguageUtils.LibraryStrings.server,
					this.settings.tagTypes.managementC && BDFDB.UserUtils.can("MANAGE_CHANNELS", user.id) && BDFDB.LanguageUtils.LanguageStrings.CHANNELS,
					this.settings.tagTypes.managementR && BDFDB.UserUtils.can("MANAGE_ROLES", user.id) && BDFDB.LanguageUtils.LanguageStrings.ROLES,
					this.settings.tagTypes.managementU && (BDFDB.UserUtils.can("BAN_MEMBERS", user.id) || BDFDB.UserUtils.can("KICK_MEMBERS", user.id)) && BDFDB.LanguageUtils.LanguageStrings.MEMBERS,
					this.settings.tagTypes.managementM && BDFDB.UserUtils.can("MANAGE_MESSAGES", user.id) && BDFDB.LanguageUtils.LanguageStrings.MESSAGES
				].filter(n => n).join(", ");
			}
			
			getUserType (user, channelId) {
				if (!user || this.settings.general.ignoreBots && user.bot) return userTypes.NONE;
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channelId || BDFDB.LibraryModules.LastChannelStore.getChannelId());
				if (!channel) return userTypes.NONE;
				let guild = BDFDB.LibraryModules.GuildStore.getGuild(channel.guild_id);
				let isOwner = channel.ownerId == user.id || guild && guild.ownerId == user.id;
				if (this.settings.tagTypes.owners && isOwner) return userTypes.OWNER;
				else if (this.settings.tagTypes.admins && BDFDB.UserUtils.can("ADMINISTRATOR", user.id)) return userTypes.ADMIN;
				else if (this.settings.tagTypes.managementG && BDFDB.UserUtils.can("MANAGE_GUILD", user.id) || this.settings.tagTypes.managementC && BDFDB.UserUtils.can("MANAGE_CHANNELS", user.id) || this.settings.tagTypes.managementR && BDFDB.UserUtils.can("MANAGE_ROLES", user.id) || this.settings.tagTypes.managementU && (BDFDB.UserUtils.can("BAN_MEMBERS", user.id) || BDFDB.UserUtils.can("KICK_MEMBERS", user.id)) || this.settings.tagTypes.managementM && BDFDB.UserUtils.can("MANAGE_MESSAGES", user.id)) return userTypes.MANAGEMENT;
				return userTypes.NONE;
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							management:							"Управление"
						};
					case "da":		// Danish
						return {
							management:							"Ledelse"
						};
					case "de":		// German
						return {
							management:							"Verwaltung"
						};
					case "el":		// Greek
						return {
							management:							"Διαχείριση"
						};
					case "es":		// Spanish
						return {
							management:							"Administración"
						};
					case "fi":		// Finnish
						return {
							management:							"Johto"
						};
					case "fr":		// French
						return {
							management:							"La gestion"
						};
					case "hr":		// Croatian
						return {
							management:							"Upravljanje"
						};
					case "hu":		// Hungarian
						return {
							management:							"Menedzsment"
						};
					case "it":		// Italian
						return {
							management:							"Gestione"
						};
					case "ja":		// Japanese
						return {
							management:							"管理"
						};
					case "ko":		// Korean
						return {
							management:							"조치"
						};
					case "lt":		// Lithuanian
						return {
							management:							"Valdymas"
						};
					case "nl":		// Dutch
						return {
							management:							"Beheer"
						};
					case "no":		// Norwegian
						return {
							management:							"Ledelse"
						};
					case "pl":		// Polish
						return {
							management:							"Zarządzanie"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							management:							"Gestão"
						};
					case "ro":		// Romanian
						return {
							management:							"Administrare"
						};
					case "ru":		// Russian
						return {
							management:							"Управление"
						};
					case "sv":		// Swedish
						return {
							management:							"Förvaltning"
						};
					case "th":		// Thai
						return {
							management:							"การจัดการ"
						};
					case "tr":		// Turkish
						return {
							management:							"Yönetim"
						};
					case "uk":		// Ukrainian
						return {
							management:							"Управління"
						};
					case "vi":		// Vietnamese
						return {
							management:							"Sự quản lý"
						};
					case "zh-CN":	// Chinese (China)
						return {
							management:							"管理"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							management:							"管理"
						};
					default:		// English
						return {
							management:							"Management"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
