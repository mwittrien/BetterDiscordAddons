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
			"version": "1.6.4",
			"description": "Add a button to clear all notifications"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName() {return config.info.name;}
		getAuthor() {return config.info.author;}
		getVersion() {return config.info.version;}
		getDescription() {return config.info.description;}
		
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
					})).concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
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

			onSettingsClosed() {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll() {
				settings = BDFDB.DataUtils.get(this, "settings");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
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
											label: this.labels.context_unreadguilds,
											id: BDFDB.ContextMenuUtils.createItemId(this.name, "mark-unread-read"),
											action: event2 => {
												this.markGuildsAsRead(BDFDB.GuildUtils.getUnread());
											}
										}),
										BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
											label: this.labels.context_pingedguilds,
											id: BDFDB.ContextMenuUtils.createItemId(this.name, "mark-pinged-read"),
											action: event2 => {
												this.markGuildsAsRead(BDFDB.GuildUtils.getPinged());
											}
										}),
										BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
											label: this.labels.context_mutedguilds,
											id: BDFDB.ContextMenuUtils.createItemId(this.name, "mark-muted-read"),
											action: event2 => {
												this.markGuildsAsRead(BDFDB.GuildUtils.getMuted());
											}
										}),
										BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
											label: this.labels.context_guilds,
											id: BDFDB.ContextMenuUtils.createItemId(this.name, "mark-all-read"),
											action: event2 => {
												this.addPinnedRecent(instance.props.channel.id);
												this.markGuildsAsRead(BDFDB.GuildUtils.getAll());
											}
										}),
										BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
											label: this.labels.context_dms,
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

			setLabelsByLanguage() {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							context_dms:						"Директно съобщение",
							context_guilds:						"Всички сървъри",
							context_mutedguilds:				"Приглушени сървъри",
							context_pingedguilds:				"Pinged сървъри",
							context_unreadguilds:				"Непрочетени сървъри"
						};
					case "da":		// Danish
						return {
							context_dms:						"Direkte beskeder",
							context_guilds:						"Alle servere",
							context_mutedguilds:				"Dæmpede servere",
							context_pingedguilds:				"Pingede servere",
							context_unreadguilds:				"Ulæste servere"
						};
					case "de":		// German
						return {
							context_dms:						"Direktnachrichten",
							context_guilds:						"Alle Server",
							context_mutedguilds:				"Stummgeschaltete Server",
							context_pingedguilds:				"Gepingte Server",
							context_unreadguilds:				"Ungelesene Server"
						};
					case "el":		// Greek
						return {
							context_dms:						"Αμεσα μηνύματα",
							context_guilds:						"Όλοι οι διακομιστές",
							context_mutedguilds:				"Σίγαση διακομιστών",
							context_pingedguilds:				"Διακομιστές Ping",
							context_unreadguilds:				"Μη αναγνωσμένοι διακομιστές"
						};
					case "es":		// Spanish
						return {
							context_dms:						"Mensajes directos",
							context_guilds:						"Todos los servidores",
							context_mutedguilds:				"Servidores silenciados",
							context_pingedguilds:				"Servidores con ping",
							context_unreadguilds:				"Servidores no leídos"
						};
					case "fi":		// Finnish
						return {
							context_dms:						"Suorat viestit",
							context_guilds:						"Kaikki palvelimet",
							context_mutedguilds:				"Mykistetyt palvelimet",
							context_pingedguilds:				"Pinged-palvelimet",
							context_unreadguilds:				"Lukemattomat palvelimet"
						};
					case "fr":		// French
						return {
							context_dms:						"Messages directs",
							context_guilds:						"Tous les serveurs",
							context_mutedguilds:				"Serveurs muets",
							context_pingedguilds:				"Serveurs ping",
							context_unreadguilds:				"Serveurs non lus"
						};
					case "hr":		// Croatian
						return {
							context_dms:						"Direktna poruka",
							context_guilds:						"Svi poslužitelji",
							context_mutedguilds:				"Prigušeni poslužitelji",
							context_pingedguilds:				"Pingirani poslužitelji",
							context_unreadguilds:				"Nepročitani poslužitelji"
						};
					case "hu":		// Hungarian
						return {
							context_dms:						"Közvetlen üzenet",
							context_guilds:						"Minden szerver",
							context_mutedguilds:				"Némított szerverek",
							context_pingedguilds:				"Pingelt szerverek",
							context_unreadguilds:				"Olvasatlan szerverek"
						};
					case "it":		// Italian
						return {
							context_dms:						"Messaggi diretti",
							context_guilds:						"Tutti i server",
							context_mutedguilds:				"Server disattivati",
							context_pingedguilds:				"Server sottoposti a ping",
							context_unreadguilds:				"Server non letti"
						};
					case "ja":		// Japanese
						return {
							context_dms:						"ダイレクトメッセージ",
							context_guilds:						"すべてのサーバー",
							context_mutedguilds:				"ミュートされたサーバー",
							context_pingedguilds:				"pingされたサーバー",
							context_unreadguilds:				"未読サーバー"
						};
					case "ko":		// Korean
						return {
							context_dms:						"쪽지",
							context_guilds:						"모든 서버",
							context_mutedguilds:				"음소거 된 서버",
							context_pingedguilds:				"핑된 서버",
							context_unreadguilds:				"읽지 않은 서버"
						};
					case "lt":		// Lithuanian
						return {
							context_dms:						"Tiesioginiai pranešimai",
							context_guilds:						"Visi serveriai",
							context_mutedguilds:				"Nutildyti serveriai",
							context_pingedguilds:				"„Pinged“ serveriai",
							context_unreadguilds:				"Neskaityti serveriai"
						};
					case "nl":		// Dutch
						return {
							context_dms:						"Directe berichten",
							context_guilds:						"Alle servers",
							context_mutedguilds:				"Gedempte servers",
							context_pingedguilds:				"Gepingde servers",
							context_unreadguilds:				"Ongelezen servers"
						};
					case "no":		// Norwegian
						return {
							context_dms:						"Direktemeldinger",
							context_guilds:						"Alle servere",
							context_mutedguilds:				"Dempede servere",
							context_pingedguilds:				"Pingede servere",
							context_unreadguilds:				"Uleste servere"
						};
					case "pl":		// Polish
						return {
							context_dms:						"Bezpośrednie wiadomości",
							context_guilds:						"Wszystkie serwery",
							context_mutedguilds:				"Wyciszone serwery",
							context_pingedguilds:				"Serwery pingowane",
							context_unreadguilds:				"Nieprzeczytane serwery"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							context_dms:						"Mensagens diretas",
							context_guilds:						"Todos os servidores",
							context_mutedguilds:				"Servidores Silenciados",
							context_pingedguilds:				"Servidores com ping",
							context_unreadguilds:				"Servidores não lidos"
						};
					case "ro":		// Romanian
						return {
							context_dms:						"Mesaje directe",
							context_guilds:						"Toate serverele",
							context_mutedguilds:				"Servere mutate",
							context_pingedguilds:				"Servere pinged",
							context_unreadguilds:				"Servere necitite"
						};
					case "ru":		// Russian
						return {
							context_dms:						"Прямые сообщения",
							context_guilds:						"Все серверы",
							context_mutedguilds:				"Отключенные серверы",
							context_pingedguilds:				"Проверенные серверы",
							context_unreadguilds:				"Непрочитанные серверы"
						};
					case "sv":		// Swedish
						return {
							context_dms:						"Direktmeddelanden",
							context_guilds:						"Alla servrar",
							context_mutedguilds:				"Dämpade servrar",
							context_pingedguilds:				"Pingade servrar",
							context_unreadguilds:				"Olästa servrar"
						};
					case "th":		// Thai
						return {
							context_dms:						"ข้อความโดยตรง",
							context_guilds:						"เซิร์ฟเวอร์ทั้งหมด",
							context_mutedguilds:				"เซิร์ฟเวอร์ที่ปิดเสียง",
							context_pingedguilds:				"เซิร์ฟเวอร์ Pinged",
							context_unreadguilds:				"เซิร์ฟเวอร์ที่ยังไม่ได้อ่าน"
						};
					case "tr":		// Turkish
						return {
							context_dms:						"Direkt Mesajlar",
							context_guilds:						"Tüm Sunucular",
							context_mutedguilds:				"Sessiz Sunucular",
							context_pingedguilds:				"Ping Gönderilen Sunucular",
							context_unreadguilds:				"Okunmamış Sunucular"
						};
					case "uk":		// Ukrainian
						return {
							context_dms:						"Прямі повідомлення",
							context_guilds:						"Усі сервери",
							context_mutedguilds:				"Приглушені сервери",
							context_pingedguilds:				"Pinged сервери",
							context_unreadguilds:				"Непрочитані сервери"
						};
					case "vi":		// Vietnamese
						return {
							context_dms:						"Tin nhắn trực tiếp",
							context_guilds:						"Tất cả máy chủ",
							context_mutedguilds:				"Máy chủ bị tắt tiếng",
							context_pingedguilds:				"Máy chủ Pinged",
							context_unreadguilds:				"Máy chủ chưa đọc"
						};
					case "zh":		// Chinese
						return {
							context_dms:						"直接讯息",
							context_guilds:						"所有服务器",
							context_mutedguilds:				"静音服务器",
							context_pingedguilds:				"绑定服务器",
							context_unreadguilds:				"未读服务器"
						};
					case "zh-TW":	// Chinese (Traditional)
						return {
							context_dms:						"直接訊息",
							context_guilds:						"所有服務器",
							context_mutedguilds:				"靜音服務器",
							context_pingedguilds:				"綁定服務器",
							context_unreadguilds:				"未讀服務器"
						};
					default:		// English
						return {
							context_dms:						"Direct Messages",
							context_guilds:						"All Servers",
							context_mutedguilds:				"Muted Servers",
							context_pingedguilds:				"Pinged Servers",
							context_unreadguilds:				"Unread Servers"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();