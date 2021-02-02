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
			"version": "1.6.5",
			"description": "Add a button to clear all notifications"
		},
		"changeLog": {
			"improved": {
				"New Toast API": ""
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin, try again later or download it manually from GitHub: https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/");
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
		var blacklist, clearing;
		var settings = {};
	
		return class ReadAllNotificationsButton extends Plugin {
			onLoad () {
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
			
			onStart () {
				let loadedBlacklist = BDFDB.DataUtils.load(this, "blacklist");
				this.saveBlacklist(!BDFDB.ArrayUtils.is(loadedBlacklist) ? [] : loadedBlacklist);

				this.forceUpdateAll();
			}
			
			onStop () {
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
								else BDFDB.ModalUtils.confirm(this, this.labels.modal_confirmnotifications, clear);
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
									if (clearing) return BDFDB.NotificationUtils.toast(`${this.labels.toast_alreadyclearing} - ${BDFDB.LanguageUtils.LibraryStrings.please_wait}`, {type: "danger"});
									let messages = [].concat(e.instance.props.messages).filter(n => n);
									if (messages.length) {
										clearing = true;
										let toastInterval;
										let loadingString = `${this.labels.toast_clearing} - ${BDFDB.LanguageUtils.LibraryStrings.please_wait}`;
										let currentLoadingString = loadingString;
										let toast = BDFDB.NotificationUtils.toast(currentLoadingString, {
											timeout: 0,
											onClose: _ => {BDFDB.TimeUtils.clear(toastInterval);}
										});
										toastInterval = BDFDB.TimeUtils.interval(_ => {
											currentLoadingString = currentLoadingString.endsWith(".....") ? loadingString : currentLoadingString + ".";
											toast.update(currentLoadingString);
										}, 500);
										for (let i = 0; i < messages.length; i++) BDFDB.TimeUtils.timeout(_ => {
											BDFDB.LibraryModules.RecentMentionUtils.deleteRecentMention(messages[i].id);
											if (i == messages.length - 1) {
												clearing = false;
												toast.close();
												BDFDB.NotificationUtils.toast(this.labels.toastcleared, {type: "success"});
											}
										}, i * 1000);
									}
								};
								if (settings.confirmClear) BDFDB.ModalUtils.confirm(this, this.labels.modal_confirmmentions, clear);
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
					case "bg":		// Bulgarian
						return {
							context_dms:						"Директно съобщение",
							context_guilds:						"Всички сървъри",
							context_mutedguilds:				"Приглушени сървъри",
							context_pingedguilds:				"Pinged сървъри",
							context_unreadguilds:				"Непрочетени сървъри",
							modal_confirmmentions:				"Наистина ли искате да изтриете всички непрочетени споменавания?",
							modal_confirmnotifications:			"Наистина ли искате да изтриете всички непрочетени известия?",
							toast_alreadyclearing:				"Изтрива някои споменавания вече",
							toast_cleared:						"Всички последни споменавания бяха изтрити",
							toast_clearing:						"Изчиства всички скорошни споменавания"
						};
					case "da":		// Danish
						return {
							context_dms:						"Direkte beskeder",
							context_guilds:						"Alle servere",
							context_mutedguilds:				"Dæmpede servere",
							context_pingedguilds:				"Pingede servere",
							context_unreadguilds:				"Ulæste servere",
							modal_confirmmentions:				"Er du sikker på, at du vil slette alle ulæste omtaler?",
							modal_confirmnotifications:			"Er du sikker på, at du vil slette alle ulæste meddelelser?",
							toast_alreadyclearing:				"Sletter allerede nogle omtaler",
							toast_cleared:						"Alle nylige omtaler er blevet slettet",
							toast_clearing:						"Rydder alle nylige omtaler"
						};
					case "de":		// German
						return {
							context_dms:						"Direktnachrichten",
							context_guilds:						"Alle Server",
							context_mutedguilds:				"Stummgeschaltete Server",
							context_pingedguilds:				"Gepingte Server",
							context_unreadguilds:				"Ungelesene Server",
							modal_confirmmentions:				"Möchten Sie wirklich alle ungelesenen Erwähnungen löschen?",
							modal_confirmnotifications:			"Möchten Sie wirklich alle ungelesenen Benachrichtigungen löschen?",
							toast_alreadyclearing:				"Löscht bereits einige Erwähnungen",
							toast_cleared:						"Alle kürzlich Erwähnungen wurden gelöscht",
							toast_clearing:						"Löscht alle letzten Erwähnungen"
						};
					case "el":		// Greek
						return {
							context_dms:						"Αμεσα μηνύματα",
							context_guilds:						"Όλοι οι διακομιστές",
							context_mutedguilds:				"Σίγαση διακομιστών",
							context_pingedguilds:				"Διακομιστές Ping",
							context_unreadguilds:				"Μη αναγνωσμένοι διακομιστές",
							modal_confirmmentions:				"Είστε βέβαιοι ότι θέλετε να διαγράψετε όλες τις μη αναγνωσμένες αναφορές;",
							modal_confirmnotifications:			"Είστε βέβαιοι ότι θέλετε να διαγράψετε όλες τις μη αναγνωσμένες ειδοποιήσεις;",
							toast_alreadyclearing:				"Διαγράφει ήδη κάποιες αναφορές",
							toast_cleared:						"Όλες οι πρόσφατες αναφορές έχουν διαγραφεί",
							toast_clearing:						"Διαγράφει όλες τις πρόσφατες αναφορές"
						};
					case "es":		// Spanish
						return {
							context_dms:						"Mensajes directos",
							context_guilds:						"Todos los servidores",
							context_mutedguilds:				"Servidores silenciados",
							context_pingedguilds:				"Servidores con ping",
							context_unreadguilds:				"Servidores no leídos",
							modal_confirmmentions:				"¿Estás seguro de que deseas eliminar todas las menciones no leídas?",
							modal_confirmnotifications:			"¿Está seguro de que desea eliminar todas las notificaciones no leídas?",
							toast_alreadyclearing:				"Elimina algunas menciones ya",
							toast_cleared:						"Se han eliminado todas las menciones recientes",
							toast_clearing:						"Borra todas las menciones recientes"
						};
					case "fi":		// Finnish
						return {
							context_dms:						"Suorat viestit",
							context_guilds:						"Kaikki palvelimet",
							context_mutedguilds:				"Mykistetyt palvelimet",
							context_pingedguilds:				"Pinged-palvelimet",
							context_unreadguilds:				"Lukemattomat palvelimet",
							modal_confirmmentions:				"Haluatko varmasti poistaa kaikki lukemattomat maininnat?",
							modal_confirmnotifications:			"Haluatko varmasti poistaa kaikki lukemattomat ilmoitukset?",
							toast_alreadyclearing:				"Poistaa jo joitain mainintoja",
							toast_cleared:						"Kaikki viimeisimmät maininnat on poistettu",
							toast_clearing:						"Tyhjentää kaikki viimeisimmät maininnat"
						};
					case "fr":		// French
						return {
							context_dms:						"Messages directs",
							context_guilds:						"Tous les serveurs",
							context_mutedguilds:				"Serveurs muets",
							context_pingedguilds:				"Serveurs ping",
							context_unreadguilds:				"Serveurs non lus",
							modal_confirmmentions:				"Voulez-vous vraiment supprimer toutes les mentions non lues?",
							modal_confirmnotifications:			"Voulez-vous vraiment supprimer toutes les notifications non lues?",
							toast_alreadyclearing:				"Supprime déjà certaines mentions",
							toast_cleared:						"Toutes les mentions récentes ont été supprimées",
							toast_clearing:						"Efface toutes les mentions récentes"
						};
					case "hr":		// Croatian
						return {
							context_dms:						"Direktna poruka",
							context_guilds:						"Svi poslužitelji",
							context_mutedguilds:				"Prigušeni poslužitelji",
							context_pingedguilds:				"Pingirani poslužitelji",
							context_unreadguilds:				"Nepročitani poslužitelji",
							modal_confirmmentions:				"Jeste li sigurni da želite izbrisati sva nepročitana spominjanja?",
							modal_confirmnotifications:			"Jeste li sigurni da želite izbrisati sve nepročitane obavijesti?",
							toast_alreadyclearing:				"Briše već spomenute",
							toast_cleared:						"Sva nedavna spominjanja su izbrisana",
							toast_clearing:						"Briše sva nedavna spominjanja"
						};
					case "hu":		// Hungarian
						return {
							context_dms:						"Közvetlen üzenet",
							context_guilds:						"Minden szerver",
							context_mutedguilds:				"Némított szerverek",
							context_pingedguilds:				"Pingelt szerverek",
							context_unreadguilds:				"Olvasatlan szerverek",
							modal_confirmmentions:				"Biztosan törli az összes olvasatlan említést?",
							modal_confirmnotifications:			"Biztosan törli az összes olvasatlan értesítést?",
							toast_alreadyclearing:				"Néhány említést már töröl",
							toast_cleared:						"Az összes közelmúltbeli említést törölték",
							toast_clearing:						"Törli az összes közelmúltbeli említést"
						};
					case "it":		// Italian
						return {
							context_dms:						"Messaggi diretti",
							context_guilds:						"Tutti i server",
							context_mutedguilds:				"Server disattivati",
							context_pingedguilds:				"Server sottoposti a ping",
							context_unreadguilds:				"Server non letti",
							modal_confirmmentions:				"Sei sicuro di voler eliminare tutte le menzioni non lette?",
							modal_confirmnotifications:			"Sei sicuro di voler eliminare tutte le notifiche non lette?",
							toast_alreadyclearing:				"Elimina già alcune menzioni",
							toast_cleared:						"Tutte le menzioni recenti sono state eliminate",
							toast_clearing:						"Cancella tutte le menzioni recenti"
						};
					case "ja":		// Japanese
						return {
							context_dms:						"ダイレクトメッセージ",
							context_guilds:						"すべてのサーバー",
							context_mutedguilds:				"ミュートされたサーバー",
							context_pingedguilds:				"pingされたサーバー",
							context_unreadguilds:				"未読サーバー",
							modal_confirmmentions:				"未読のメンションをすべて削除してもよろしいですか？",
							modal_confirmnotifications:			"未読の通知をすべて削除してもよろしいですか？",
							toast_alreadyclearing:				"すでにいくつかの言及を削除します",
							toast_cleared:						"最近の言及はすべて削除されました",
							toast_clearing:						"最近の言及をすべてクリアします"
						};
					case "ko":		// Korean
						return {
							context_dms:						"쪽지",
							context_guilds:						"모든 서버",
							context_mutedguilds:				"음소거 된 서버",
							context_pingedguilds:				"핑된 서버",
							context_unreadguilds:				"읽지 않은 서버",
							modal_confirmmentions:				"읽지 않은 모든 멘션을 삭제 하시겠습니까?",
							modal_confirmnotifications:			"읽지 않은 모든 알림을 삭제 하시겠습니까?",
							toast_alreadyclearing:				"이미 일부 멘션을 삭제합니다.",
							toast_cleared:						"모든 최근 멘션이 삭제되었습니다.",
							toast_clearing:						"최근 멘션을 모두 지 웁니다."
						};
					case "lt":		// Lithuanian
						return {
							context_dms:						"Tiesioginiai pranešimai",
							context_guilds:						"Visi serveriai",
							context_mutedguilds:				"Nutildyti serveriai",
							context_pingedguilds:				"„Pinged“ serveriai",
							context_unreadguilds:				"Neskaityti serveriai",
							modal_confirmmentions:				"Ar tikrai norite ištrinti visus neperskaitytus paminėjimus?",
							modal_confirmnotifications:			"Ar tikrai norite ištrinti visus neperskaitytus pranešimus?",
							toast_alreadyclearing:				"Kai kurie paminėjimai jau ištrinami",
							toast_cleared:						"Visi naujausi paminėjimai buvo ištrinti",
							toast_clearing:						"Išvalo visus naujausius paminėjimus"
						};
					case "nl":		// Dutch
						return {
							context_dms:						"Directe berichten",
							context_guilds:						"Alle servers",
							context_mutedguilds:				"Gedempte servers",
							context_pingedguilds:				"Gepingde servers",
							context_unreadguilds:				"Ongelezen servers",
							modal_confirmmentions:				"Weet u zeker dat u alle ongelezen vermeldingen wilt verwijderen?",
							modal_confirmnotifications:			"Weet u zeker dat u alle ongelezen meldingen wilt verwijderen?",
							toast_alreadyclearing:				"Verwijdert al enkele vermeldingen",
							toast_cleared:						"Alle recente vermeldingen zijn verwijderd",
							toast_clearing:						"Wist alle recente vermeldingen"
						};
					case "no":		// Norwegian
						return {
							context_dms:						"Direktemeldinger",
							context_guilds:						"Alle servere",
							context_mutedguilds:				"Dempede servere",
							context_pingedguilds:				"Pingede servere",
							context_unreadguilds:				"Uleste servere",
							modal_confirmmentions:				"Er du sikker på at du vil slette alle uleste omtaler?",
							modal_confirmnotifications:			"Er du sikker på at du vil slette alle uleste varsler?",
							toast_alreadyclearing:				"Sletter allerede noen omtaler",
							toast_cleared:						"Alle nylige omtaler er slettet",
							toast_clearing:						"Fjerner alle nylige omtaler"
						};
					case "pl":		// Polish
						return {
							context_dms:						"Bezpośrednie wiadomości",
							context_guilds:						"Wszystkie serwery",
							context_mutedguilds:				"Wyciszone serwery",
							context_pingedguilds:				"Serwery pingowane",
							context_unreadguilds:				"Nieprzeczytane serwery",
							modal_confirmmentions:				"Czy na pewno chcesz usunąć wszystkie nieprzeczytane wzmianki?",
							modal_confirmnotifications:			"Czy na pewno chcesz usunąć wszystkie nieprzeczytane powiadomienia?",
							toast_alreadyclearing:				"Usuwa już niektóre wzmianki",
							toast_cleared:						"Wszystkie ostatnie wzmianki zostały usunięte",
							toast_clearing:						"Usuwa wszystkie ostatnie wzmianki"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							context_dms:						"Mensagens diretas",
							context_guilds:						"Todos os servidores",
							context_mutedguilds:				"Servidores Silenciados",
							context_pingedguilds:				"Servidores com ping",
							context_unreadguilds:				"Servidores não lidos",
							modal_confirmmentions:				"Tem certeza de que deseja excluir todas as menções não lidas?",
							modal_confirmnotifications:			"Tem certeza de que deseja excluir todas as notificações não lidas?",
							toast_alreadyclearing:				"Exclui algumas menções já",
							toast_cleared:						"Todas as menções recentes foram excluídas",
							toast_clearing:						"Limpa todas as menções recentes"
						};
					case "ro":		// Romanian
						return {
							context_dms:						"Mesaje directe",
							context_guilds:						"Toate serverele",
							context_mutedguilds:				"Servere mutate",
							context_pingedguilds:				"Servere pinged",
							context_unreadguilds:				"Servere necitite",
							modal_confirmmentions:				"Sigur doriți să ștergeți toate mențiunile necitite?",
							modal_confirmnotifications:			"Sigur doriți să ștergeți toate notificările necitite?",
							toast_alreadyclearing:				"Șterge deja câteva mențiuni",
							toast_cleared:						"Toate mențiunile recente au fost șterse",
							toast_clearing:						"Șterge toate mențiunile recente"
						};
					case "ru":		// Russian
						return {
							context_dms:						"Прямые сообщения",
							context_guilds:						"Все серверы",
							context_mutedguilds:				"Отключенные серверы",
							context_pingedguilds:				"Проверенные серверы",
							context_unreadguilds:				"Непрочитанные серверы",
							modal_confirmmentions:				"Вы уверены, что хотите удалить все непрочитанные упоминания?",
							modal_confirmnotifications:			"Вы действительно хотите удалить все непрочитанные уведомления?",
							toast_alreadyclearing:				"Удаляет уже некоторые упоминания",
							toast_cleared:						"Все недавние упоминания были удалены",
							toast_clearing:						"Удаляет все недавние упоминания"
						};
					case "sv":		// Swedish
						return {
							context_dms:						"Direktmeddelanden",
							context_guilds:						"Alla servrar",
							context_mutedguilds:				"Dämpade servrar",
							context_pingedguilds:				"Pingade servrar",
							context_unreadguilds:				"Olästa servrar",
							modal_confirmmentions:				"Är du säker på att du vill ta bort alla olästa omnämnanden?",
							modal_confirmnotifications:			"Är du säker på att du vill ta bort alla olästa aviseringar?",
							toast_alreadyclearing:				"Raderar några omnämnanden redan",
							toast_cleared:						"Alla nya omnämnanden har tagits bort",
							toast_clearing:						"Rensar alla senaste omnämnanden"
						};
					case "th":		// Thai
						return {
							context_dms:						"ข้อความโดยตรง",
							context_guilds:						"เซิร์ฟเวอร์ทั้งหมด",
							context_mutedguilds:				"เซิร์ฟเวอร์ที่ปิดเสียง",
							context_pingedguilds:				"เซิร์ฟเวอร์ Pinged",
							context_unreadguilds:				"เซิร์ฟเวอร์ที่ยังไม่ได้อ่าน",
							modal_confirmmentions:				"แน่ใจไหมว่าต้องการลบข้อความที่ยังไม่ได้อ่านทั้งหมด",
							modal_confirmnotifications:			"แน่ใจไหมว่าต้องการลบการแจ้งเตือนที่ยังไม่ได้อ่านทั้งหมด",
							toast_alreadyclearing:				"ลบการกล่าวถึงบางส่วนแล้ว",
							toast_cleared:						"ลบการกล่าวถึงล่าสุดทั้งหมดแล้ว",
							toast_clearing:						"ล้างการพูดถึงล่าสุดทั้งหมด"
						};
					case "tr":		// Turkish
						return {
							context_dms:						"Direkt Mesajlar",
							context_guilds:						"Tüm Sunucular",
							context_mutedguilds:				"Sessiz Sunucular",
							context_pingedguilds:				"Ping Gönderilen Sunucular",
							context_unreadguilds:				"Okunmamış Sunucular",
							modal_confirmmentions:				"Okunmamış tüm bahisleri silmek istediğinizden emin misiniz?",
							modal_confirmnotifications:			"Okunmamış tüm bildirimleri silmek istediğinizden emin misiniz?",
							toast_alreadyclearing:				"Zaten bazı bahsetmeleri siler",
							toast_cleared:						"Son bahsedenlerin tümü silindi",
							toast_clearing:						"Tüm son bahsedilenleri temizler"
						};
					case "uk":		// Ukrainian
						return {
							context_dms:						"Прямі повідомлення",
							context_guilds:						"Усі сервери",
							context_mutedguilds:				"Приглушені сервери",
							context_pingedguilds:				"Pinged сервери",
							context_unreadguilds:				"Непрочитані сервери",
							modal_confirmmentions:				"Ви впевнені, що хочете видалити всі непрочитані згадки?",
							modal_confirmnotifications:			"Ви впевнені, що хочете видалити всі непрочитані сповіщення?",
							toast_alreadyclearing:				"Видаляє деякі згадки вже",
							toast_cleared:						"Усі останні згадування були видалені",
							toast_clearing:						"Очищає всі останні згадування"
						};
					case "vi":		// Vietnamese
						return {
							context_dms:						"Tin nhắn trực tiếp",
							context_guilds:						"Tất cả máy chủ",
							context_mutedguilds:				"Máy chủ bị tắt tiếng",
							context_pingedguilds:				"Máy chủ Pinged",
							context_unreadguilds:				"Máy chủ chưa đọc",
							modal_confirmmentions:				"Bạn có chắc chắn muốn xóa tất cả các đề cập chưa đọc không?",
							modal_confirmnotifications:			"Bạn có chắc chắn muốn xóa tất cả các thông báo chưa đọc không?",
							toast_alreadyclearing:				"Đã xóa một số đề cập",
							toast_cleared:						"Tất cả các đề cập gần đây đã bị xóa",
							toast_clearing:						"Xóa tất cả các đề cập gần đây"
						};
					case "zh-CN":	// Chinese (China)
						return {
							context_dms:						"直接讯息",
							context_guilds:						"所有服务器",
							context_mutedguilds:				"静音服务器",
							context_pingedguilds:				"绑定服务器",
							context_unreadguilds:				"未读服务器",
							modal_confirmmentions:				"您确定要删除所有未读的提及吗？",
							modal_confirmnotifications:			"您确定要删除所有未读的通知吗？",
							toast_alreadyclearing:				"已删除一些提及",
							toast_cleared:						"最近所有提及的内容均已删除",
							toast_clearing:						"清除所有最近提及的内容"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							context_dms:						"直接訊息",
							context_guilds:						"所有服務器",
							context_mutedguilds:				"靜音服務器",
							context_pingedguilds:				"綁定服務器",
							context_unreadguilds:				"未讀服務器",
							modal_confirmmentions:				"您確定要刪除所有未讀的提及嗎？",
							modal_confirmnotifications:			"您確定要刪除所有未讀的通知嗎？",
							toast_alreadyclearing:				"已刪除一些提及",
							toast_cleared:						"最近所有提及的內容均已刪除",
							toast_clearing:						"清除所有最近提及的內容"
						};
					default:		// English
						return {
							context_dms:						"Direct Messages",
							context_guilds:						"All Servers",
							context_mutedguilds:				"Muted Servers",
							context_pingedguilds:				"Pinged Servers",
							context_unreadguilds:				"Unread Servers",
							modal_confirmmentions:				"Are you sure you want to delete all unread Mentions?",
							modal_confirmnotifications:			"Are you sure you want to delete all unread Notifications?",
							toast_alreadyclearing:				"Already clearing some Mentions",
							toast_cleared:						"All recent Mentions have been cleared",
							toast_clearing:						"Clearing all recent Mentions"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();