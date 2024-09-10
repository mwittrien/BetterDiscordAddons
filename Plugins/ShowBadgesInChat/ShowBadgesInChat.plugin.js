/**
 * @name ShowBadgesInChat
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 2.0.8
 * @description Displays Badges (Nitro, Hypesquad, etc...) in the Chat/MemberList/DMList
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ShowBadgesInChat/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ShowBadgesInChat/ShowBadgesInChat.plugin.js
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
			BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js").then(r => {
				if (!r || r.status != 200) throw new Error();
				else return r.text();
			}).then(b => {
				if (!b) throw new Error();
				else return require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
			}).catch(error => {
				BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
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
		var _this;
		var badgeConfigs = {}, loadedUsers = {}, queuedInstances = {}, requestQueue = {queue: [], timeout: null, id: null}, cacheTimeout;
		
		const places = ["chat", "memberList", "dmsList"];
		
		const userBadgeFlagNameMap = {
			"BOT_HTTP_INTERACTIONS": "bot_commands",
			"HYPESQUAD_ONLINE_HOUSE_1": "hypesquad_house_1",
			"HYPESQUAD_ONLINE_HOUSE_2": "hypesquad_house_2",
			"HYPESQUAD_ONLINE_HOUSE_3": "hypesquad_house_3",
			"bot_commands": "BOT_HTTP_INTERACTIONS",
			"hypesquad_house_1": "HYPESQUAD_ONLINE_HOUSE_1",
			"hypesquad_house_2": "HYPESQUAD_ONLINE_HOUSE_2",
			"hypesquad_house_3": "HYPESQUAD_ONLINE_HOUSE_3"
		};
		
		const badges = {};
		
		return class ShowBadgesInChat extends Plugin {
			onLoad () {
				_this = this;
				
				this.modulePatches = {
					before: [
						"MessageUsername",
						"NameContainer"
					],
					after: [
						"PrivateChannel",
						"UserBadges"
					]
				};
				
				for (let key in BDFDB.DiscordConstants.UserBadges) {
					let basicKey = key.replace(/_lvl\d+/g, "");
					if (!badges[basicKey]) badges[basicKey] = {value: true, keys: []};
					badges[basicKey].keys.push(key);
				}
				
				this.css = `
					${BDFDB.dotCN._showbadgesinchatbadges} {
						display: inline-flex !important;
						justify-content: center;
						align-items: center;
						flex-wrap: nowrap;
						position: relative;
						margin: 0 0 0 4px;
						padding: 0;
						user-select: none;
						pointer-events: none !important;
					}
					${BDFDB.dotCN._showbadgesinchatbadges} > * {
						margin: 0;
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
					${BDFDB.dotCNS.messageheadertext + BDFDB.dotCN._showbadgesinchatbadgeschat} {
						top: 0.2rem;
					}
					${BDFDB.dotCNS.messagerepliedmessage + BDFDB.dotCN._showbadgesinchatbadgeschat} {
						top: 0;
					}
					${BDFDB.dotCN.messageheadertext}:has(${BDFDB.dotCN._showbadgesinchatbadges}) ${BDFDB.dotCN.bottag} {
						top: 0.4rem;
					}
					${BDFDB.dotCNS.messagecompact + BDFDB.dotCN.messageusername} ~ ${BDFDB.dotCN._showbadgesinchatbadges},
					${BDFDB.dotCNS.messagerepliedmessage + BDFDB.dotCN.messageusername} ~ ${BDFDB.dotCN._showbadgesinchatbadges} {
						text-indent: 0;
					}
					${BDFDB.dotCNS.messagerepliedmessage + BDFDB.dotCN.messageusername} ~ ${BDFDB.dotCN._showbadgesinchatbadges} {
						margin-left: 0;
						margin-right: .25rem;
					}
					
					${BDFDB.dotCN._showbadgesinchatbadgessettings} {
						color: var(--header-primary);
					}
					${BDFDB.dotCN._showbadgesinchatbadgessettings} * {
						cursor: default;
					}
					${BDFDB.dotCN._showbadgesinchatbadgessettings}:last-child {
						margin-right: 8px;
					}
					${BDFDB.dotCN._showbadgesinchatbadges} .bd-profile-badge {
						height: 15px;
					}
					${BDFDB.dotCN._showbadgesinchatbadgeschat} .bd-profile-badge {
						position: relative;
						top: -1px;
					}
					${BDFDB.dotCN._showbadgesinchatbadgesmemberlist} .bd-profile-badge {
						display: none;
					}
				`;
			}
			
			onStart () {
				queuedInstances = {}, loadedUsers = {};
				requestQueue = {queue: [], timeout: null, id: null};
				
				badgeConfigs = BDFDB.DataUtils.load(this, "badgeConfigs");
				for (let key in badges) {
					if (!badgeConfigs[key]) badgeConfigs[key] = {};
					for (let key2 of places) if (badgeConfigs[key][key2] == undefined) badgeConfigs[key][key2] = true;
					badgeConfigs[key].key = key;
				}
				
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
					loadedUsers[id] = {}
					loadedUsers[id].badges = data.badges;
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
					if (BDFDB.ObjectUtils.is(e.methodArguments[0]) && e.methodArguments[0].type == "USER_PROFILE_FETCH_FAILURE" && e.methodArguments[0].userId) {
						const user = BDFDB.LibraryStores.UserStore.getUser(e.methodArguments[0].userId);
						if (!loadedUsers[user.id]) processUser(e.methodArguments[0].userId, {user: user || {}, flags: user ? user.publicFlags : 0});
					}
					else if (BDFDB.ObjectUtils.is(e.methodArguments[0]) && e.methodArguments[0].type == "USER_PROFILE_FETCH_SUCCESS" && e.methodArguments[0].user) {
						processUser(e.methodArguments[0].user.id, e.methodArguments[0]);
					}
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
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
							className: BDFDB.disCN.marginbottom4,
							tag: BDFDB.LibraryComponents.FormComponents.FormTags.H3,
							children: "Show Badges in"
						}));
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsList, {
							settings: places,
							data: Object.keys(badges).filter(n => n.indexOf("BOT_") != 0).map(key => badgeConfigs[key]),
							noRemove: true,
							renderLabel: (cardData, instance) => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
								children: [
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
											onClick: _ => {
												for (let settingId of places) badgeConfigs[cardData.key][settingId] = true;
												BDFDB.DataUtils.save(badgeConfigs, this, "badgeConfigs");
												BDFDB.ReactUtils.forceUpdate(instance);
												this.SettingsUpdated = true;
											},
											onContextMenu: _ => {
												for (let settingId of places) badgeConfigs[cardData.key][settingId] = false;
												BDFDB.DataUtils.save(badgeConfigs, this, "badgeConfigs");
												BDFDB.ReactUtils.forceUpdate(instance);
												this.SettingsUpdated = true;
											},
											children: cardData.key.split("_").map(n => BDFDB.StringUtils.upperCaseFirstChar(n.toLowerCase())).join(" ")
										})
									}),
									badges[cardData.key] && badges[cardData.key].keys.map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.UserBadges, {
										className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._showbadgesinchatbadges, BDFDB.disCN._showbadgesinchatbadgessettings),
										place: "settings",
										custom: true,
										badges: [{id: key, icon: BDFDB.DiscordConstants.UserBadges[key]}]
									}))
								]
							}),
							onHeaderClick: (settingId, instance) => {
								for (let key in badgeConfigs) badgeConfigs[key][settingId] = true;
								BDFDB.DataUtils.save(badgeConfigs, this, "badgeConfigs");
								BDFDB.ReactUtils.forceUpdate(instance);
								this.SettingsUpdated = true;
							},
							onHeaderContextMenu: (settingId, instance) => {
								for (let key in badgeConfigs) badgeConfigs[key][settingId] = false;
								BDFDB.DataUtils.save(badgeConfigs, this, "badgeConfigs");
								BDFDB.ReactUtils.forceUpdate(instance);
								this.SettingsUpdated = true;
							},
							onCheckboxChange: (value, instance) => {
								badgeConfigs[instance.props.cardId][instance.props.settingId] = value;
								BDFDB.DataUtils.save(badgeConfigs, this, "badgeConfigs");
								this.SettingsUpdated = true;
							}
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Button",
							color: BDFDB.LibraryComponents.Button.Colors.RED,
							label: "Reset cached Badge Data",
							onClick: _ => BDFDB.ModalUtils.confirm(this, "Are you sure you want to reset the Badge Cache? This will force all Badges to rerender.", _ => {
								BDFDB.DataUtils.remove(this, "badgeCache");
								this.SettingsUpdated = true;
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
				if (!e.instance.props.message) return;
				const author = e.instance.props.userOverride || e.instance.props.message.author;
				let index = e.instance.props.compact ? 1 : 0;
				if (!BDFDB.ArrayUtils.is(e.instance.props.decorations[index])) e.instance.props.decorations[index] = [e.instance.props.decorations[index]].filter(n => n);
				this.injectBadges(e.instance.props.decorations[index], author, (BDFDB.LibraryStores.ChannelStore.getChannel(e.instance.props.message.channel_id) || {}).guild_id, "chat");
			}

			processNameContainer (e) {
				if (!e.instance.props.user) return;
				this.injectBadges(BDFDB.ObjectUtils.get(e.instance, "props.decorators.props.children"), e.instance.props.user, e.instance.props.channel.guild_id, "memberList");
			}

			processPrivateChannel (e) {
				if (!e.instance.props.user) return;
				let wrapper = e.returnvalue && e.returnvalue.props.children && e.returnvalue.props.children.props && typeof e.returnvalue.props.children.props.children == "function" ? e.returnvalue.props.children : e.returnvalue;
				if (typeof wrapper.props.children == "function") {
					let childrenRender = wrapper.props.children;
					wrapper.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let children = childrenRender(...args);
						this._processPrivateChannel(e.instance, children);
						return children;
					}, "Error in Children Render of PrivateChannel!", this);
				}
				else this._processPrivateChannel(e.instance, wrapper);
			}

			_processPrivateChannel (instance, returnvalue, a) {
				const wrapper = returnvalue.props.decorators ? returnvalue : BDFDB.ReactUtils.findChild(returnvalue, {props: ["decorators"]}) || returnvalue;
				if (!wrapper) return;
				wrapper.props.decorators = [wrapper.props.decorators].flat(10);
				this.injectBadges(wrapper.props.decorators, instance.props.user, null, "dmsList");
			}
			
			processUserBadges (e) {
				if (!e.instance.props.custom) return;
				let filter = e.instance.props.place != "settings";
				for (let i in e.returnvalue.props.children) if (e.returnvalue.props.children[i]) {
					let keyName = filter && Object.keys(badges).find(n => badges[n].keys.includes(e.returnvalue.props.children[i].key));
					if (keyName && badgeConfigs[keyName] && !badgeConfigs[keyName][e.instance.props.place]) e.returnvalue.props.children[i] = null;
					else if (typeof e.returnvalue.props.children[i].props.children == "function" && e.returnvalue.props.children[i].props.text) {
						e.returnvalue.props.children[i] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, e.returnvalue.props.children[i].props);
					}
				}
				if (!e.returnvalue.props.children.filter(n => n).length) return null;
			}

			injectBadges (children, user, guildId, place) {
				if (!BDFDB.ArrayUtils.is(children) || !user || user.isNonUserBot()) return;
				if (!loadedUsers[user.id] || !loadedUsers[user.id].badges || ((new Date()).getTime() - loadedUsers[user.id].date >= 1000*60*60*24*7)) {
					queuedInstances[user.id] = [].concat(queuedInstances[user.id]).filter(n => n);
					if (requestQueue.queue.indexOf(user.id) == -1) requestQueue.queue.push(user.id);
					this.runQueue();
				}
				children.push(BDFDB.ReactUtils.createElement(class extends BDFDB.ReactUtils.Component {
					render() {
						if (!loadedUsers[user.id] || !loadedUsers[user.id].badges || ((new Date()).getTime() - loadedUsers[user.id].date >= 1000*60*60*24*7)) {
							queuedInstances[user.id] = [].concat(queuedInstances[user.id]).filter(n => n);
							if (queuedInstances[user.id].indexOf(this) == -1) queuedInstances[user.id].push(this);
							return null;
						}
						else return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.UserBadges, {
							className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._showbadgesinchatbadges, BDFDB.disCN[`_showbadgesinchatbadges${place.toLowerCase()}`]),
							place: place.toLowerCase(),
							custom: true,
							badges: loadedUsers[user.id].badges
						});
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
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
