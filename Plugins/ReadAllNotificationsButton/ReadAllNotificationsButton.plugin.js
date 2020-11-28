/**
 * @name ReadAllNotificationsButton
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ReadAllNotificationsButton
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ReadAllNotificationsButton/ReadAllNotificationsButton.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ReadAllNotificationsButton/ReadAllNotificationsButton.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ReadAllNotificationsButton",
			"author": "DevilBro",
			"version": "1.6.3",
			"description": "Add a button to clear all notifications"
		},
		"changeLog": {
			"fixed": {
				"Clear Mentions": "Works again"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
		stop() {}
		getSettingsPanel() {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The library plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", _ => {
				require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
					if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
					else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
				});
			});
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var blacklist, clearing;
		var settings = {};
	
		return class ReadAllNotificationsButton extends Plugin {
			onLoad() {
				this.defaults = {
					settings: {
						addClearButton:	{value: true, 	inner: false,	description: "Add a 'Clear Mentions' button to the recent mentions popout"},
						confirmClear:	{value: false,	inner: false, 	description: "Ask for your confirmation before clearing reads"},
						includeGuilds:	{value: true, 	inner: true,	description: "unread Servers"},
						includeMuted:	{value: false, 	inner: true,	description: "muted unread Servers"},
						includeDMs:		{value: false, 	inner: true,	description: "unread DMs"}
					}
				};
				
				this.patchedModules = {
					after: {
						Guilds: "render",
						RecentMentions: "default",
						RecentsHeader: "default"
					}
				};
				
				this.css = `
					${BDFDB.dotCN.messagespopouttabbar} {
						flex: 1 0 auto;
					}
					${BDFDB.dotCN.messagespopouttabbar} ~ * {
						margin-left: 10px;
					}
					${BDFDB.dotCN._readallnotificationsbuttonframe} {
						height: 24px;
						margin-bottom: 10px;
					}
					${BDFDB.dotCN._readallnotificationsbuttonframe}:active {
						transform: translateY(1px);
					}
					${BDFDB.dotCN._readallnotificationsbuttoninner} {
						height: 24px;
					}
					${BDFDB.dotCN._readallnotificationsbuttonbutton} {
						border-radius: 4px;
						height: 24px;
						font-size: 12px;
						line-height: 1.3;
						white-space: nowrap;
						cursor: pointer;
					}
				`;
			}
			
			onStart() {
				let loadedBlacklist = BDFDB.DataUtils.load(this, "blacklist");
				this.saveBlacklist(!BDFDB.ArrayUtils.is(loadedBlacklist) ? [] : loadedBlacklist);

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
					children: Object.keys(settings).filter(key => !this.defaults.settings[key].inner).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Switch",
						plugin: this,
						keys: ["settings", key],
						label: this.defaults.settings[key].description,
						value: settings[key]
					})).concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
						title: "When left clicking the 'read all' button mark following Elements as read:",
						first: false,
						last: true,
						children: Object.keys(settings).filter(key => this.defaults.settings[key].inner).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["settings", key],
							label: this.defaults.settings[key].description,
							value: settings[key]
						}))
					}))
				}));
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: "Server Black List",
					collapseStates: collapseStates,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsGuildList, {
							className: BDFDB.disCN.marginbottom20,
							disabled: BDFDB.DataUtils.load(this, "blacklist"),
							onClick: disabledGuilds => {
								this.saveBlacklist(disabledGuilds);
							}
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Button",
							color: BDFDB.LibraryComponents.Button.Colors.GREEN,
							label: "Enable for all Servers",
							onClick: _ => {
								this.batchSetGuilds(settingsPanel, collapseStates, true);
							},
							children: BDFDB.LanguageUtils.LanguageStrings.ENABLE
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Button",
							color: BDFDB.LibraryComponents.Button.Colors.PRIMARY,
							label: "Disable for all Servers",
							onClick: _ => {
								this.batchSetGuilds(settingsPanel, collapseStates, false);
							},
							children: BDFDB.LanguageUtils.LanguageStrings.DISABLE
						})
					]
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
			}

			onUserContextMenu (e) {
				if (e.instance.props.channel && e.type == "DMUserContextMenu") {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: BDFDB.LibraryComponents.MenuItems.MenuGroup});
					if (index > -1) this.injectItem(children, e.instance.props.channel.id);
				}
			}

			onGroupDMContextMenu (e) {
				if (e.instance.props.channel) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: BDFDB.LibraryComponents.MenuItems.MenuGroup});
					if (index > -1) this.injectItem(children, e.instance.props.channel.id);
				}
			}
			
			injectItem (children, channelId) {
				children.unshift(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: BDFDB.LanguageUtils.LanguageStrings.MARK_AS_READ,
						id: "mark-dm-read",
						disabled: !BDFDB.LibraryModules.DirectMessageUnreadStore.getUnreadPrivateChannelIds().includes(channelId),
						action: _ => {
							BDFDB.DMUtils.markAsRead(channelId);
						}
					})
				}));
			}
		
			processGuilds (e) {
				if (typeof e.returnvalue.props.children == "function") {
					let childrenRender = e.returnvalue.props.children;
					e.returnvalue.props.children = (...args) => {
						let children = childrenRender(...args);
						this.checkTree(children);
						return children;
					};
				}
				else this.checkTree(e.returnvalue);
			}
			
			checkTree (returnvalue) {
				let tree = BDFDB.ReactUtils.findChild(returnvalue, {filter: n => n && n.props && typeof n.props.children == "function"});
				if (tree) {
					let childrenRender = tree.props.children;
					tree.props.children = (...args) => {
						let children = childrenRender(...args);
						this.injectButton(children);
						return children;
					};
				}
				else this.injectButton(returnvalue);
			}
			
			injectButton (returnvalue) {
				let [children, index] = BDFDB.ReactUtils.findParent(returnvalue, {name: "ConnectedUnreadDMs"});
				if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCNS.guildouter + BDFDB.disCN._readallnotificationsbuttonframe,
					children: BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCNS.guildiconwrapper + BDFDB.disCN._readallnotificationsbuttoninner,
							children: BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCNS.guildiconchildwrapper + BDFDB.disCN._readallnotificationsbuttonbutton,
							children: "read all",
							onClick: _ => {
								let clear = _ => {
									if (settings.includeGuilds) this.markGuildsAsRead(settings.includeMuted ? BDFDB.GuildUtils.getAll() : BDFDB.GuildUtils.getUnread());
									if (settings.includeDMs) BDFDB.DMUtils.markAsRead(BDFDB.DMUtils.getAll());
								};
								if (!settings.confirmClear) clear();
								else BDFDB.ModalUtils.confirm(this, `Are you sure you want to mark all Notifications as read?`, clear);
							},
							onContextMenu: event => {
								BDFDB.ContextMenuUtils.open(this, event, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
									children: [
										BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
											label: this.labels.context_unreadguilds_text,
											id: BDFDB.ContextMenuUtils.createItemId(this.name, "mark-unread-read"),
											action: event2 => {
												this.markGuildsAsRead(BDFDB.GuildUtils.getUnread());
											}
										}),
										BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
											label: this.labels.context_pingedguilds_text,
											id: BDFDB.ContextMenuUtils.createItemId(this.name, "mark-pinged-read"),
											action: event2 => {
												this.markGuildsAsRead(BDFDB.GuildUtils.getPinged());
											}
										}),
										BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
											label: this.labels.context_mutedguilds_text,
											id: BDFDB.ContextMenuUtils.createItemId(this.name, "mark-muted-read"),
											action: event2 => {
												this.markGuildsAsRead(BDFDB.GuildUtils.getMuted());
											}
										}),
										BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
											label: this.labels.context_guilds_text,
											id: BDFDB.ContextMenuUtils.createItemId(this.name, "mark-all-read"),
											action: event2 => {
												this.addPinnedRecent(instance.props.channel.id);
												this.markGuildsAsRead(BDFDB.GuildUtils.getAll());
											}
										}),
										BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
											label: this.labels.context_dms_text,
											id: BDFDB.ContextMenuUtils.createItemId(this.name, "mark-dms-read"),
											action: event2 => {
												BDFDB.DMUtils.markAsRead(BDFDB.DMUtils.getAll());
											}
										})
									]
								}));
							}
						})
					})
				}));
			}

			processRecentMentions (e) {
				if (e.instance.props.header && e.instance.props.header.props) e.instance.props.header.props.messages = e.returnvalue.props.messages;
			}

			processRecentsHeader (e) {
				if (settings.addClearButton && e.instance.props.tab == "Recent Mentions") e.returnvalue.props.children.push(BDFDB.ReactUtils.createElement("div", {
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: `${BDFDB.LanguageUtils.LanguageStrings.CLOSE} (${BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL})`,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
							className: BDFDB.disCNS.messagespopoutbutton + BDFDB.disCN.messagespopoutbuttonsecondary,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								nativeClass: true,
								name: BDFDB.LibraryComponents.SvgIcon.Names.CLOSE,
								width: 16,
								height: 16
							}),
							onClick: _ => {
								let clear = _ => {
									if (clearing) return BDFDB.NotificationUtils.toast("Already clearing some recent mentions, please wait...", {type: "error"});
									let messages = [].concat(e.instance.props.messages).filter(n => n);
									if (messages.length) {
										clearing = true;
										let toast = BDFDB.NotificationUtils.toast("Clearing all recent mentions, please wait...", {timeout: 0});
										for (let i = 0; i < messages.length; i++) BDFDB.TimeUtils.timeout(_ => {
											BDFDB.LibraryModules.RecentMentionUtils.deleteRecentMention(messages[i].id);
											if (i == messages.length - 1) {
												clearing = false;
												toast.close();
												BDFDB.NotificationUtils.toast("Cleared all recent mentions.", {type: "success"});
											}
										}, i * 1000);
									}
								};
								if (settings.confirmClear) BDFDB.ModalUtils.confirm(this, `Are you sure you want to mark all mentions as read?`, clear);
								else clear();
							}
						})
					})
				}));
			}
			
			markGuildsAsRead (guilds) {
				BDFDB.GuildUtils.markAsRead(guilds.filter(g => g && g.id && !blacklist.includes(g.id)));
			}
			
			batchSetGuilds (settingsPanel, collapseStates, value) {
				if (!value) {
					for (let id of BDFDB.LibraryModules.FolderStore.getFlattenedGuildIds()) blacklist.push(id);
					this.saveBlacklist(BDFDB.ArrayUtils.removeCopies(blacklist));
				}
				else this.saveBlacklist([]);
				BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
			}
			
			saveBlacklist (savedBlacklist) {
				blacklist = savedBlacklist;
				BDFDB.DataUtils.save(savedBlacklist, this, "blacklist");
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "hr":		//croatian
						return {
							context_unreadguilds_text:	"Nepročitani poslužitelje",
							context_pingedguilds_text:	"Zvižduci poslužitelje",
							context_mutedguilds_text:	"Prigušeni poslužitelje",
							context_guilds_text:		"Sve poslužitelje",
							context_dms_text:			"Prikvacene izravne"
						};
					case "da":		//danish
						return {
							context_unreadguilds_text:	"Ulæste servere",
							context_pingedguilds_text:	"Pinget servere",
							context_mutedguilds_text:	"Dæmpede servere",
							context_guilds_text:		"Alle servere",
							context_dms_text:			"Private beskeder"
						};
					case "de":		//german
						return {
							context_unreadguilds_text:	"Ungelesene Server",
							context_pingedguilds_text:	"Gepingte Server",
							context_mutedguilds_text:	"Stummgeschaltene Server",
							context_guilds_text:		"Alle Server",
							context_dms_text:			"Direktnachrichten"
						};
					case "es":		//spanish
						return {
							context_unreadguilds_text:	"Servidores no leídos",
							context_pingedguilds_text:	"Servidores mencionados",
							context_mutedguilds_text:	"Servidores silenciados",
							context_guilds_text:		"Todos los servidores",
							context_dms_text:			"Mensajes directos"
						};
					case "fr":		//french
						return {
							context_unreadguilds_text:	"Serveurs non lus",
							context_pingedguilds_text:	"Serveurs mentionnés",
							context_mutedguilds_text:	"Serveurs en sourdine",
							context_guilds_text:		"Tous les serveurs",
							context_dms_text:			"Messages privés"
						};
					case "it":		//italian
						return {
							context_unreadguilds_text:	"Server non letti",
							context_pingedguilds_text:	"Server pingato",
							context_mutedguilds_text:	"Server mutate",
							context_guilds_text:		"Tutti i server",
							context_dms_text:			"Messaggi diretti"
						};
					case "nl":		//dutch
						return {
							context_unreadguilds_text:	"Ongelezen servers",
							context_pingedguilds_text:	"Gepingde servers",
							context_mutedguilds_text:	"Gedempte servers",
							context_guilds_text:		"Alle servers",
							context_dms_text:			"Prive berichten"
						};
					case "no":		//norwegian
						return {
							context_unreadguilds_text:	"Uleste servere",
							context_pingedguilds_text:	"Pinget servere",
							context_mutedguilds_text:	"Dempet servere",
							context_guilds_text:		"Alle servere",
							context_dms_text:			"Direktemeldinger"
						};
					case "pl":		//polish
						return {
							context_unreadguilds_text:	"Nieprzeczytane serwery",
							context_pingedguilds_text:	"Pingowany serwery",
							context_mutedguilds_text:	"Wyciszone serwery",
							context_guilds_text:		"Wszystkie serwery",
							context_dms_text:			"Prywatne wiadomości"
						};
					case "pt-BR":	//portuguese (brazil)
						return {
							context_unreadguilds_text:	"Servidores não lidos",
							context_pingedguilds_text:	"Servidores com ping",
							context_mutedguilds_text:	"Servidores silenciosos",
							context_guilds_text:		"Todos os servidores",
							context_dms_text:			"Mensagens diretas"
						};
					case "fi":		//finnish
						return {
							context_unreadguilds_text:	"Lukemattomia palvelimet",
							context_pingedguilds_text:	"Tapitut palvelimet",
							context_mutedguilds_text:	"Mykistetyt palvelimet",
							context_guilds_text:		"Kaikki palvelimet",
							context_dms_text:			"Yksityisviestit"
						};
					case "sv":		//swedish
						return {
							context_unreadguilds_text:	"Olästa servrar",
							context_pingedguilds_text:	"Pingade servrar",
							context_mutedguilds_text:	"Dämpade servrar",
							context_guilds_text:		"Alla servrar",
							context_dms_text:			"Direktmeddelanden"
						};
					case "tr":		//turkish
						return {
							context_unreadguilds_text:	"Okunmamış sunucular",
							context_pingedguilds_text:	"Ping sunucular",
							context_mutedguilds_text:	"Sessiz sunucular",
							context_guilds_text:		"Tüm sunucular",
							context_dms_text:			"Özel mesajlar"
						};
					case "cs":		//czech
						return {
							context_unreadguilds_text:	"Nepřečtené servery",
							context_pingedguilds_text:	"Pinged servery",
							context_mutedguilds_text:	"Tlumené servery",
							context_guilds_text:		"Všechny servery",
							context_dms_text:			"Přímé zpráva"
						};
					case "bg":		//bulgarian
						return {
							context_unreadguilds_text:	"Непрочетени сървъри",
							context_pingedguilds_text:	"Споменатите сървъри",
							context_mutedguilds_text:	"Приглушени сървъри",
							context_guilds_text:		"Всички сървъри",
							context_dms_text:			"Директно съобщение"
						};
					case "ru":		//russian
						return {
							context_unreadguilds_text:	"Непрочитанные серверы",
							context_pingedguilds_text:	"Проверенные серверы",
							context_mutedguilds_text:	"Отключенные серверы",
							context_guilds_text:		"Все серверы",
							context_dms_text:			"Прямые сообщения"
						};
					case "uk":		//ukrainian
						return {
							context_unreadguilds_text:	"Непрочитаних сервери",
							context_pingedguilds_text:	"Згадані сервери",
							context_mutedguilds_text:	"Приглушені сервери",
							context_guilds_text:		"Всі сервери",
							context_dms_text:			"Прямі Повідомлення"
						};
					case "ja":		//japanese
						return {
							context_unreadguilds_text:	"未読サーバー",
							context_pingedguilds_text:	"",
							context_mutedguilds_text:	"ミュートサーバー",
							context_guilds_text:		"すべてのサーバー",
							context_dms_text:			"ダイレクトメッセージ"
						};
					case "zh-TW":	//chinese (traditional)
						return {
							context_unreadguilds_text:	"未讀服務器",
							context_pingedguilds_text:	"言及されたサーバー",
							context_mutedguilds_text:	"靜音服務器",
							context_guilds_text:		"所有服務器",
							context_dms_text:			"直接消息",
						};
					case "ko":		//korean
						return {
							context_unreadguilds_text:	"읽지 않은 서버",
							context_pingedguilds_text:	"언급 된 서버",
							context_mutedguilds_text:	"음소거 된 서버",
							context_guilds_text:		"모든 서버",
							context_dms_text:			"직접 메시지"
						};
					default:		//default: english
						return {
							context_unreadguilds_text:	"Unread Servers",
							context_pingedguilds_text:	"Pinged Servers",
							context_mutedguilds_text:	"Muted Servers",
							context_guilds_text:		"All Servers",
							context_dms_text:			"Direct Messages"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();