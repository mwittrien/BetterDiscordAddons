/**
 * @name StaffTag
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.5.9
 * @description Adds a Crown/Tag to Server Owners (or Admins/Management)
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/StaffTag/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/StaffTag/StaffTag.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
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
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		const userTypes = {
			NONE: 0,
			MANAGEMENT: 1,
			ADMIN: 2,
			FORUM_CREATOR: 3,
			THREAD_CREATOR: 3,
			GROUP_OWNER: 5,
			OWNER: 6
		};
		
		const labelMap = {
			[userTypes.NONE]: "",
			[userTypes.MANAGEMENT]: "management",
			[userTypes.ADMIN]: "admin",
			[userTypes.FORUM_CREATOR]: "forumCreator",
			[userTypes.THREAD_CREATOR]: "threadCreator",
			[userTypes.GROUP_OWNER]: "groupOwner",
			[userTypes.OWNER]: "owner"
		};
		
		const classNameMap = {
			[userTypes.NONE]: "",
			[userTypes.MANAGEMENT]: "_stafftagmanagementicon",
			[userTypes.ADMIN]: "_stafftagadminicon",
			[userTypes.FORUM_CREATOR]: "_stafftagforumcreatoricon",
			[userTypes.THREAD_CREATOR]: "_stafftagthreadcreatoricon",
			[userTypes.GROUP_OWNER]: "_stafftaggroupownericon",
			[userTypes.OWNER]: "_stafftagownericon"
		};
		
		return class StaffTag extends Plugin {
			onLoad () {
				
				this.modulePatches = {
					before: [
						"MessageHeader"
					],
					after: [
						"MemberListItem",
						"NameTag",
						"UsernameSection",
						"VoiceUser"
					]
				};
				
				this.defaults = {
					general: {
						useCrown:			{value: true,	description: "Uses the Crown Icon instead of the Bot Tag Style"},
						useRoleColor:		{value: true, 	description: "Uses the Role Color instead of the default Blurple"},
						useBlackFont:		{value: false,	description: "Uses black Font instead of darkening the Role Color on bright Colors"},
						ignoreBots:			{value: false,	description: "Doesn't add the Owner/Admin/Management Tag for Bots"},
						ignoreMyself:		{value: false,	description: "Doesn't add the Owner/Admin/Management Tag for yourself"}
					},
					tagTypes: {
						owners:				{value: true, 	description: "Server Owner Tag"},
						groupOwners:		{value: true, 	description: "Group Owner Tag"},
						threadCreators:		{value: true, 	description: "Thread Creator Tag"},
						forumCreators:		{value: true, 	description: "Forum Creator Tag"},
						admins:				{value: true, 	description: "Admin Tag (Admin Permissions)"},
						managementG:		{value: true, 	description: "Management Tag (Server Management)"},
						managementC:		{value: true, 	description: "Management Tag (Channel Management)"},
						managementT:		{value: true, 	description: "Management Tag (Threads Management)"},
						managementE:		{value: true, 	description: "Management Tag (Events Management)"},
						managementR:		{value: true, 	description: "Management Tag (Role Management)"},
						managementU:		{value: true, 	description: "Management Tag (User Management 'Kick/Ban')"},
						managementV:		{value: true, 	description: "Management Tag (Voice Management 'Mute/Deafen/Move')"},
						managementM:		{value: true, 	description: "Management Tag (Message Management)"}
					},
					tagPlaces: {
						chat:				{value: true, 	description: "Messages"},
						memberList:			{value: true, 	description: "Member List"},
						voiceList:			{value: true, 	description: "Voice User List"},
						userPopout:			{value: true, 	description: "User Popouts"},
						userProfile:		{value: true, 	description: "User Profile Modal"},
					},
					customTitles: {
						owner:				{value: "",		placeholder: "Owner", 		description: "Server Owner Tags"},
						groupOwner:			{value: "",		placeholder: "Group Owner",	description: "Group Owner Tags"},
						forumCreator:		{value: "",		placeholder: "Creator", 	description: "Forum Creator Tags"},
						threadCreator:		{value: "",		placeholder: "Creator", 	description: "Thread Creator Tags"},
						admin:				{value: "",		placeholder: "Admin", 		description: "Admin Tags"},
						management:			{value: "",		placeholder: "Management", 	description: "Management Tags"}
					}
				};
			
				this.css = `
					${BDFDB.dotCN.memberownericon + BDFDB.dotCN._stafftagadminicon} {
						color: #aaa9ad;
					}
					${BDFDB.dotCN.memberownericon + BDFDB.dotCN._stafftagmanagementicon} {
						color: #88540b;
					}
					${BDFDB.dotCN.memberownericon + BDFDB.dotCN._stafftagforumcreatoricon},
					${BDFDB.dotCN.memberownericon + BDFDB.dotCN._stafftagthreadcreatoricon} {
						color: var(--text-muted);
					}
					${BDFDB.dotCN.memberownericon} {
						top: 0px;
					}
					${BDFDB.dotCNS.message + BDFDB.dotCN.memberownericon} {
						top: 2px;
					}
					${BDFDB.dotCNS.messagecompact + BDFDB.dotCN.memberownericon} {
						top: 1px;
						margin-left: 0;
						margin-right: 4px;
					}
					${BDFDB.dotCNS.messagerepliedmessage + BDFDB.dotCN.memberownericon},
					${BDFDB.dotCNS.messagethreadaccessory + BDFDB.dotCN.memberownericon} {
						top: 0px;
						margin-left: 0;
						margin-right: 4px;
					}
					${BDFDB.dotCNS.voiceuser + BDFDB.dotCN.memberownericon}:last-child {
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
							title: "Custom Title Settings",
							collapseStates: collapseStates,
							children: Object.keys(this.defaults.customTitles).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "TextInput",
								plugin: this,
								keys: ["customTitles", key],
								label: this.defaults.customTitles[key].description,
								basis: "50%",
								value: this.settings.customTitles[key],
								placeholder: this.defaults.customTitles[key].placeholder
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

			processMessageHeader (e) {
				if (!e.instance.props.message || !this.settings.tagPlaces.chat) return;
				let [children, index] = BDFDB.ReactUtils.findParent(e.instance.props.username, {filter: n => n && n.props && typeof n.props.renderPopout == "function"});
				if (index == -1) return;
				const author = e.instance.props.userOverride || e.instance.props.message.author;
				let userType = this.getUserType(author, e.instance.props.message.channel_id);
				if (userType) this.injectStaffTag(children, author, userType, e.instance.props.compact ? index : (index + 2), {
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
						if (e.instance.props.className.indexOf(BDFDB.disCN.userpopoutheadertagnonickname) > -1) {
							inject = this.settings.tagPlaces.userPopout;
							tagClass = BDFDB.disCNS.userpopoutheaderbottag + BDFDB.disCN.bottagnametag;
						}
						else if (e.instance.props.className.indexOf(BDFDB.disCN.userprofilenametag) > -1) {
							inject = this.settings.tagPlaces.userProfile;
							tagClass = BDFDB.disCN.bottagnametag;
						}
						if (inject) this.injectStaffTag(e.returnvalue.props.children, e.instance.props.user, userType, 2, {
							tagClass: tagClass,
							useRem: e.instance.props.useRemSizes,
							inverted: e.instance.props.invertBotTagColor
						});
					}
				}
			}
			
			processUsernameSection (e) {
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
				let channel = BDFDB.LibraryStores.ChannelStore.getChannel(config.channelId || BDFDB.LibraryStores.SelectedChannelStore.getChannelId());
				let member = channel && this.settings.general.useRoleColor ? (BDFDB.LibraryStores.GuildMemberStore.getMember(channel.guild_id, user.id) || {}) : {};
				
				let fallbackLabel = this.settings.general.useCrown && this.getLabelFallback(userType);
				let label = this.getLabel(userType, fallbackLabel);
				let labelExtra = userType == userTypes.FORUM_CREATOR ? BDFDB.LanguageUtils.LanguageStrings.BOT_TAG_FORUM_ORIGINAL_POSTER_TOOLTIP : userType == userTypes.MANAGEMENT && this.getManagementLabel(user);
				
				let tag = null;
				if (this.settings.general.useCrown) tag = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: labelExtra ? `${label} (${labelExtra})` : label,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.memberownericon, classNameMap[userType] && BDFDB.disCN[classNameMap[userType]]),
						name: BDFDB.LibraryComponents.SvgIcon.Names.CROWN,
						"aria-label": fallbackLabel
					})
				});
				else {
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
						tag: label
					});
					if (labelExtra) tag = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: labelExtra,
						children: tag
					});
				}
				children.splice(insertIndex, 0, tag);
			}
			
			getLabelFallback (userType) {
				switch (userType) {
					case userTypes.OWNER: return BDFDB.LanguageUtils.LanguageStrings.GUILD_OWNER;
					case userTypes.GROUP_OWNER: return BDFDB.LanguageUtils.LanguageStrings.GROUP_OWNER;
					case userTypes.FORUM_CREATOR: return BDFDB.LanguageUtils.LanguageStrings.BOT_TAG_FORUM_ORIGINAL_POSTER;
					case userTypes.THREAD_CREATOR: return this.labels.creator.replace("{{var0}}", BDFDB.LanguageUtils.LanguageStrings.THREAD);
					case userTypes.ADMIN: return BDFDB.LanguageUtils.LanguageStrings.ADMINISTRATOR;
					case userTypes.MANAGEMENT: return this.labels.management;
					default: return "";
				}
			}
			
			getLabel (userType, fallback) {
				let type = labelMap[userType];
				if (!type) return fallback || "";
				else if (!fallback) return this.settings.customTitles[type] || this.defaults.customTitles[type].placeholder;
				else return this.settings.customTitles[type] && this.settings.customTitles[type].toLowerCase() != this.defaults.customTitles[type].placeholder.toLowerCase() ? this.settings.customTitles[type] : fallback;
			}
			
			getManagementLabel (user) {
				return [
					this.settings.tagTypes.managementG && BDFDB.UserUtils.can("MANAGE_GUILD", user.id) && BDFDB.LanguageUtils.LibraryStrings.server,
					this.settings.tagTypes.managementC && BDFDB.UserUtils.can("MANAGE_CHANNELS", user.id) && BDFDB.LanguageUtils.LanguageStrings.CHANNELS,
					this.settings.tagTypes.managementT && BDFDB.UserUtils.can("MANAGE_THREADS", user.id) && BDFDB.LanguageUtils.LanguageStrings.THREADS,
					this.settings.tagTypes.managementE && BDFDB.UserUtils.can("MANAGE_EVENTS", user.id) && BDFDB.LanguageUtils.LanguageStrings.GUILD_EVENTS,
					this.settings.tagTypes.managementR && BDFDB.UserUtils.can("MANAGE_ROLES", user.id) && BDFDB.LanguageUtils.LanguageStrings.ROLES,
					this.settings.tagTypes.managementU && (BDFDB.UserUtils.can("BAN_MEMBERS", user.id) || BDFDB.UserUtils.can("KICK_MEMBERS", user.id)) && BDFDB.LanguageUtils.LanguageStrings.MEMBERS,
					this.settings.tagTypes.managementV && (BDFDB.UserUtils.can("MUTE_MEMBERS", user.id) || BDFDB.UserUtils.can("DEAFEN_MEMBERS", user.id) || BDFDB.UserUtils.can("MOVE_MEMBERS", user.id)) && BDFDB.LanguageUtils.LanguageStrings.VOICE_AND_VIDEO,
					this.settings.tagTypes.managementM && BDFDB.UserUtils.can("MANAGE_MESSAGES", user.id) && BDFDB.LanguageUtils.LanguageStrings.MESSAGES
				].filter(n => n).join(", ");
			}
			
			getUserType (user, channelId) {
				if (!user || this.settings.general.ignoreBots && user.bot || this.settings.general.ignoreMyself && user.id == BDFDB.UserUtils.me.id) return userTypes.NONE;
				const channel = BDFDB.LibraryStores.ChannelStore.getChannel(channelId || BDFDB.LibraryStores.SelectedChannelStore.getChannelId());
				if (!channel) return userTypes.NONE;
				const guild = BDFDB.LibraryStores.GuildStore.getGuild(channel.guild_id);
				
				if (this.settings.tagTypes.owners && guild && guild.ownerId == user.id) return userTypes.OWNER;
				else if (this.settings.tagTypes.groupOwners && channel.ownerId == user.id && channel.isGroupDM()) return userTypes.GROUP_OWNER;
				else if (this.settings.tagTypes.forumCreators && channel.ownerId == user.id && BDFDB.ChannelUtils.isForumPost(channel)) return userTypes.FORUM_CREATOR;
				else if (this.settings.tagTypes.threadCreators && channel.ownerId == user.id && BDFDB.ChannelUtils.isThread(channel) && !BDFDB.ChannelUtils.isForumPost(channel)) return userTypes.THREAD_CREATOR;
				else if (this.settings.tagTypes.admins && BDFDB.UserUtils.can("ADMINISTRATOR", user.id)) return userTypes.ADMIN;
				else if (this.settings.tagTypes.managementG && BDFDB.UserUtils.can("MANAGE_GUILD", user.id) || this.settings.tagTypes.managementC && BDFDB.UserUtils.can("MANAGE_CHANNELS", user.id) || this.settings.tagTypes.managementR && BDFDB.UserUtils.can("MANAGE_ROLES", user.id) || this.settings.tagTypes.managementU && (BDFDB.UserUtils.can("BAN_MEMBERS", user.id) || BDFDB.UserUtils.can("KICK_MEMBERS", user.id)) || this.settings.tagTypes.managementM && BDFDB.UserUtils.can("MANAGE_MESSAGES", user.id)) return userTypes.MANAGEMENT;
				return userTypes.NONE;
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							management:							"Управление",
							creator:							"Cъздател {{var0}}"
						};
					case "cs":		// Czech
						return {
							management:							"Řízení",
							creator:							"{{var0}} autor"
						};
					case "da":		// Danish
						return {
							management:							"Ledelse",
							creator:							"{{var0}} skaber"
						};
					case "de":		// German
						return {
							management:							"Verwaltung",
							creator:							"{{var0}}ersteller"
						};
					case "el":		// Greek
						return {
							management:							"Διαχείριση",
							creator:							"{{var0}} δημιουργός"
						};
					case "es":		// Spanish
						return {
							management:							"Administración",
							creator:							"{{var0}} creador"
						};
					case "fi":		// Finnish
						return {
							management:							"Johto",
							creator:							"{{var0}} luoja"
						};
					case "fr":		// French
						return {
							management:							"La gestion",
							creator:							"{{var0}}créateur"
						};
					case "hi":		// Hindi
						return {
							management:							"प्रबंध",
							creator:							"{{var0}}निर्माता"
						};
					case "hr":		// Croatian
						return {
							management:							"Upravljanje",
							creator:							"{{var0}} kreator"
						};
					case "hu":		// Hungarian
						return {
							management:							"Menedzsment",
							creator:							"{{var0}} alkotója"
						};
					case "it":		// Italian
						return {
							management:							"Gestione",
							creator:							"{{var0}}creatore"
						};
					case "ja":		// Japanese
						return {
							management:							"管理",
							creator:							"{{var0}}作成者"
						};
					case "ko":		// Korean
						return {
							management:							"조치",
							creator:							"{{var0}}창조자"
						};
					case "lt":		// Lithuanian
						return {
							management:							"Valdymas",
							creator:							"{{var0}} kūrėjas"
						};
					case "nl":		// Dutch
						return {
							management:							"Beheer",
							creator:							"{{var0}}maker"
						};
					case "no":		// Norwegian
						return {
							management:							"Ledelse",
							creator:							"{{var0}} skaperen"
						};
					case "pl":		// Polish
						return {
							management:							"Zarządzanie",
							creator:							"{{var0}}twórca"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							management:							"Gestão",
							creator:							"{{var0}} criador"
						};
					case "ro":		// Romanian
						return {
							management:							"Administrare",
							creator:							"{{var0}} creator"
						};
					case "ru":		// Russian
						return {
							management:							"Управление",
							creator:							"Cоздатель {{var0}}"
						};
					case "sv":		// Swedish
						return {
							management:							"Förvaltning",
							creator:							"{{var0}} skapare"
						};
					case "th":		// Thai
						return {
							management:							"การจัดการ",
							creator:							"{{var0}}ผู้สร้าง"
						};
					case "tr":		// Turkish
						return {
							management:							"Yönetim",
							creator:							"{{var0}}yaratıcı"
						};
					case "uk":		// Ukrainian
						return {
							management:							"Управління",
							creator:							"{{var0}} творець"
						};
					case "vi":		// Vietnamese
						return {
							management:							"Sự quản lý",
							creator:							"Người tạo {{var0}}"
						};
					case "zh-CN":	// Chinese (China)
						return {
							management:							"管理",
							creator:							"{{var0}} 创建者"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							management:							"管理",
							creator:							"{{var0}} 建立者"
						};
					default:		// English
						return {
							management:							"Management",
							creator:							"{{var0}} Creator"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();