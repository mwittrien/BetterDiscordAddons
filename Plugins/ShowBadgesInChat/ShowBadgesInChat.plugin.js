/**
 * @name ShowBadgesInChat
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.8.2
 * @description Displays Badges (Nitro, Hypesquad, etc...) in the Chat/MemberList/DMList
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ShowBadgesInChat/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ShowBadgesInChat/ShowBadgesInChat.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ShowBadgesInChat",
			"author": "DevilBro",
			"version": "1.8.2",
			"description": "Displays Badges (Nitro, Hypesquad, etc...) in the Chat/MemberList/DMList"
		}
	};
	
	return (window.Lightcord && !Node.prototype.isPrototypeOf(window.Lightcord) || window.LightCord && !Node.prototype.isPrototypeOf(window.LightCord) || window.Astra && !Node.prototype.isPrototypeOf(window.Astra)) ? class {
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
		var _this;
		var loadedUsers = {}, queuedInstances = {}, requestQueue = {queue: [], timeout: null, id: null}, cacheTimeout;
		var specialFlag;
		
		return class ShowBadgesInChat extends Plugin {
			onLoad () {
				_this = this;
				
				specialFlag = BDFDB.NumberUtils.generateId() + "SPECIALFLAG";
		
				this.patchedModules = {
					after: {
						MessageUsername: "default",
						MemberListItem: "render",
						PrivateChannel: "render",
						UserProfileBadgeList: "default"
					}
				};
				
				this.defaults = {
					places: {
						chat:				{value: true, 	description: "Chat"},
						memberList:			{value: true, 	description: "Member List"},
						dmsList:			{value: true, 	description: "DM List"}
					},
					badges: {},
					indicators: {
						CURRENT_GUILD_BOOST: {value: true}
					}
				};
				
				for (let key of Object.keys(BDFDB.LibraryComponents.UserBadgesKeys).filter(n => isNaN(parseInt(n)))) {
					let basicKey = key.replace(/_LEVEL_\d+/g, "");
					if (!this.defaults.badges[basicKey]) this.defaults.badges[basicKey] = {value: true, keys: []};
					this.defaults.badges[basicKey].keys.push(BDFDB.LibraryComponents.UserBadgesKeys[key]);
				}
				
				this.css = `
					${BDFDB.dotCN._showbadgesinchatbadges} {
						display: inline-flex !important;
						justify-content: center;
						align-items: center;
						flex-wrap: nowrap;
						position: relative;
						margin: 0 0 0 4px;
						user-select: none;
					}
					${BDFDB.dotCN._showbadgesinchatbadges} > * {
						margin: 0;
					}
					${BDFDB.dotCN._showbadgesinchatbadges} > * + * {
						margin-left: 4px;
					}
					${BDFDB.dotCNS._showbadgesinchatbadges + BDFDB.dotCN.userbadge} {
						display: flex;
						justify-content: center;
						align-items: center;
					}
					${BDFDB.dotCNS._showbadgesinchatbadges + BDFDB.dotCN.userbadge + BDFDB.dotCN._showbadgesinchatindicator}::before {
						display: none;
					}
					${BDFDB.dotCNS._showbadgesinchatbadgessettings + BDFDB.dotCN.userbadge} {
						width: 24px !important;
						height: 20px !important;
					}
					${BDFDB.dotCN.memberpremiumicon} {
						display: none;
					}
					${BDFDB.dotCNS._showbadgesinchatbadges + BDFDB.dotCN.memberpremiumicon} {
						display: block;
						position: static;
						margin: 0;
					}
					${BDFDB.dotCN._showbadgesinchatbadgeschat} {
						position: relative;
						top: 4px;
					}
					${BDFDB.dotCNS.messagerepliedmessage + BDFDB.dotCN._showbadgesinchatbadgeschat} {
						top: 0;
					}
					${BDFDB.dotCNS.messagecompact + BDFDB.dotCN.messageusername} ~ ${BDFDB.dotCN._showbadgesinchatbadges},
					${BDFDB.dotCNS.messagerepliedmessage + BDFDB.dotCN.messageusername} ~ ${BDFDB.dotCN._showbadgesinchatbadges} {
						margin-right: .25rem;
						text-indent: 0;
					}
					${BDFDB.dotCNS.messagerepliedmessage + BDFDB.dotCN.messageusername} ~ ${BDFDB.dotCN._showbadgesinchatbadges} {
						margin-left: 0;
					}
					
					${BDFDB.dotCN._showbadgesinchatbadgessettings} {
						color: var(--header-primary);
					}
				`;
			}
			
			onStart () {
				queuedInstances = {}, loadedUsers = {};
				requestQueue = {queue: [], timeout: null, id: null};
				
				let badgeCache = BDFDB.DataUtils.load(this, "badgeCache");
				if (badgeCache) {
					let now = (new Date()).getTime(), month = 1000*60*60*24*30;
					for (let id in badgeCache) {
						if (now - badgeCache[id].date > month) delete badgeCache[id];
						else loadedUsers[id] = badgeCache[id];
					}
					BDFDB.DataUtils.save(badgeCache, this, "badgeCache");
				}
				
				const processUser = (id, data) => {
					let userCopy = Object.assign({}, data.user);
					userCopy.premium_since = data.premium_since;
					userCopy.premium_guild_since = data.premium_guild_since;
					loadedUsers[id] = BDFDB.ObjectUtils.extract(userCopy, "flags", "premium_since", "premium_guild_since");
					loadedUsers[id].date = (new Date()).getTime();
					
					BDFDB.TimeUtils.clear(cacheTimeout);
					cacheTimeout = BDFDB.TimeUtils.timeout(_ => BDFDB.DataUtils.save(loadedUsers, this, "badgeCache"), 5000);
					
					if (requestQueue.id && requestQueue.id == id) {
						BDFDB.ReactUtils.forceUpdate(queuedInstances[requestQueue.id]);
						delete queuedInstances[requestQueue.id];
						requestQueue.id = null;
						BDFDB.TimeUtils.timeout(_ => this.runQueue(), 1000);
					}
				};
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.DispatchApiUtils, "dispatch", {after: e => {
					if (BDFDB.ObjectUtils.is(e.methodArguments[0]) && e.methodArguments[0].type == BDFDB.DiscordConstants.ActionTypes.USER_PROFILE_FETCH_FAILURE && e.methodArguments[0].userId) {
						const user = BDFDB.LibraryModules.UserStore.getUser(e.methodArguments[0].userId);
						processUser(e.methodArguments[0].userId, {user: user || {}, flags: user ? user.publicFlags : 0});
					}
					else if (BDFDB.ObjectUtils.is(e.methodArguments[0]) && e.methodArguments[0].type == BDFDB.DiscordConstants.ActionTypes.USER_PROFILE_FETCH_SUCCESS && e.methodArguments[0].user) processUser(e.methodArguments[0].user.id, e.methodArguments[0])
				}});

				this.forceUpdateAll();
			}
			
			onStop () {
				BDFDB.TimeUtils.clear(requestQueue.timeout);

				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Show Badges in:",
							children: Object.keys(this.defaults.places).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["places", key],
								label: this.defaults.places[key].description,
								value: this.settings.places[key]
							}))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Display Badges:",
							children: Object.keys(this.defaults.badges).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["badges", key],
								label: key.split("_").map(n => BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(n.toLowerCase())).join(" "),
								value: this.settings.badges[key],
								labelChildren: this.createSettingsBadges(key)
							})).concat(Object.keys(this.defaults.indicators).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["indicators", key],
								label: key.split("_").map(n => BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(n.toLowerCase())).join(" "),
								value: this.settings.indicators[key],
								labelChildren: this.createSettingsBadges(key)
							})))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Button",
							color: BDFDB.LibraryComponents.Button.Colors.RED,
							label: "Reset cached Badge Data",
							onClick: _ => BDFDB.ModalUtils.confirm(this, "Are you sure you want to reset the Badge Cache? This will force all Badges to rerender.", _ => {
								BDFDB.DataUtils.remove(this, "badgeCache");
								this.forceUpdateAll();
							}),
							children: BDFDB.LanguageUtils.LanguageStrings.RESET
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

			processMessageUsername (e) {
				if (!e.instance.props.message || !this.settings.places.chat) return;
				const author = e.instance.props.userOverride || e.instance.props.message.author;
				this.injectBadges(e.returnvalue.props.children, author, (BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, "chat");
			}

			processMemberListItem (e) {
				if (!e.instance.props.user || !this.settings.places.memberList) return;
				this.injectBadges(BDFDB.ObjectUtils.get(e.returnvalue, "props.decorators.props.children"), e.instance.props.user, e.instance.props.channel.guild_id, "members");
			}

			processPrivateChannel (e) {
				if (!e.instance.props.user || !this.settings.places.dmsList) return;
				if (typeof e.returnvalue.props.children == "function") {
					let childrenRender = e.returnvalue.props.children;
					e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let children = childrenRender(...args);
						children.props.decorators = [children.props.decorators].flat(10);
						this.injectBadges(children.props.decorators, e.instance.props.user, null, "dms");
						return children;
					}, "", this);
				}
				else {
					e.returnvalue.props.decorators = [e.returnvalue.props.decorators].flat(10);
					this.injectBadges(e.returnvalue.props.decorators, e.instance.props.user, null, "dms");
				}
			}
			
			processUserProfileBadgeList (e) {
				if (e.instance.props.custom) {
					for (let i in e.returnvalue.props.children) if (e.returnvalue.props.children[i]) {
						let key = parseInt(e.returnvalue.props.children[i].key);
						let keyName = e.instance.props.filter && Object.keys(this.defaults.badges).find(n => this.defaults.badges[n].keys.includes(key));
						if (keyName && !this.settings.badges[keyName]) e.returnvalue.props.children[i] = null;
						else if (e.returnvalue.props.children[i].type.displayName == "TooltipContainer" || e.returnvalue.props.children[i].type.displayName == "Tooltip") {
							const childrenRender = e.returnvalue.props.children[i].props.children;
							e.returnvalue.props.children[i].props.children = (...args) => {
								const children = childrenRender(...args);
								delete children.props.onClick;
								return children;
							};
							e.returnvalue.props.children[i] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, e.returnvalue.props.children[i].props);
						}
					}
					if ((this.settings.indicators.CURRENT_GUILD_BOOST || !e.instance.props.filter) && e.instance.props.premiumCurrentGuildSince) e.returnvalue.props.children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: BDFDB.LanguageUtils.LanguageStringsFormat("PREMIUM_GUILD_SUBSCRIPTION_TOOLTIP", e.instance.props.premiumCurrentGuildSince),
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
							className: BDFDB.disCN.userbadgeouter,
							children: BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCNS.userbadge + BDFDB.disCN._showbadgesinchatindicator,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									className: BDFDB.disCN.memberpremiumicon,
									name: BDFDB.LibraryComponents.SvgIcon.Names.BOOST
								})
							})
						})
					}));
					if (!e.returnvalue.props.children.filter(n => n).length) return null;
				}
			}

			injectBadges (children, user, guildId, type) {
				if (!BDFDB.ArrayUtils.is(children) || !user || user.isNonUserBot()) return;
				if (!loadedUsers[user.id] || ((new Date()).getTime() - loadedUsers[user.id].date >= 1000*60*60*24*7)) {
					queuedInstances[user.id] = [].concat(queuedInstances[user.id]).filter(n => n);
					if (requestQueue.queue.indexOf(user.id) == -1) requestQueue.queue.push(user.id);
					this.runQueue();
				}
				children.push(BDFDB.ReactUtils.createElement(class extends BDFDB.ReactUtils.Component {
					render() {
						if (!loadedUsers[user.id] || ((new Date()).getTime() - loadedUsers[user.id].date >= 1000*60*60*24*7)) {
							if (queuedInstances[user.id].indexOf(this) == -1) queuedInstances[user.id].push(this);
							return null;
						}
						else return _this.createBadges(user, guildId, type);
					}
				}, {}, true));
			}
			
			runQueue () {
				if (!requestQueue.id) {
					let id = requestQueue.queue.shift();
					if (id) {
						requestQueue.id = id;
						BDFDB.TimeUtils.clear(requestQueue.timeout);
						requestQueue.timeout = BDFDB.TimeUtils.timeout(_ => {
							requestQueue.id = null;
							this.runQueue();
						}, 30000);
						BDFDB.LibraryModules.UserProfileUtils.fetchProfile(id);
					}
				}
			}

			createBadges (user, guildId, type) {
				let fakeGuildBoostDate;
				if (typeof user.id == "string" && user.id.startsWith(specialFlag + "GB")) {
					let level = parseInt(user.id.split("_").pop());
					for (let i = 0; i < 100 && !fakeGuildBoostDate; i++) {
						let date = new Date() - 1000*60*60*24*15 * i;
						if (level == BDFDB.LibraryModules.GuildBoostUtils.getUserLevel(date)) fakeGuildBoostDate = date;
					}
				}
				let member = guildId && BDFDB.LibraryModules.MemberStore.getMember(guildId, user.id);
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.UserBadges.default, {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._showbadgesinchatbadges, BDFDB.disCN[`_showbadgesinchatbadges${type}`]),
					user: user,
					size: BDFDB.LibraryComponents.UserBadges.BadgeSizes.SIZE_18,
					custom: true,
					filter: type != "settings",
					premiumSince: loadedUsers[user.id] && loadedUsers[user.id].premium_since ? new Date(loadedUsers[user.id].premium_since) : (user.id == (specialFlag + "NITRO") ? new Date() : null),
					premiumGuildSince: fakeGuildBoostDate || (loadedUsers[user.id] && loadedUsers[user.id].premium_guild_since ? new Date(loadedUsers[user.id].premium_guild_since) : null),
					premiumCurrentGuildSince: member && member.premiumSince && new Date(member.premiumSince) || user.id == (specialFlag + "CGB") && new Date()
				});
			}
			
			createSettingsBadges (flag) {
				let wrappers = [];
				if (this.defaults.indicators[flag]) {
					let id = flag == "CURRENT_GUILD_BOOST" ? (specialFlag + "CGB") : null;
					let user = new BDFDB.DiscordObjects.User({flags: 0, id: id});
					wrappers.push(this.createBadges(user, null, "settings"));
				}
				else for (let key of this.defaults.badges[flag].keys) {
					let userFlag = flag == "PREMIUM" || flag == "PREMIUM_GUILD_SUBSCRIPTION" ? 0 : BDFDB.DiscordConstants.UserFlags[flag];
					let keyName = BDFDB.LibraryComponents.UserBadgesKeys[key];
					if (userFlag == null && keyName) userFlag = BDFDB.DiscordConstants.UserFlags[keyName] != null ? BDFDB.DiscordConstants.UserFlags[keyName] : BDFDB.DiscordConstants.UserFlags[Object.keys(BDFDB.DiscordConstants.UserFlags).find(f => f.indexOf(keyName) > -1 || keyName.indexOf(f) > -1)];
					if (userFlag != null) {
						let id;
						if (flag == "PREMIUM") id = specialFlag + "NITRO";
						else if (keyName && keyName.startsWith("PREMIUM_GUILD_SUBSCRIPTION")) id = specialFlag + "GB_" + keyName.split("_").pop();
						let user = new BDFDB.DiscordObjects.User({flags: userFlag, id: id});
						wrappers.push(this.createBadges(user, null, "settings"));
					}
				}
				return wrappers;
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
