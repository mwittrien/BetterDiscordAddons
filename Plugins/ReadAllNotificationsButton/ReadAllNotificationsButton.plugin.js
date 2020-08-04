//META{"name":"ReadAllNotificationsButton","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ReadAllNotificationsButton","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ReadAllNotificationsButton/ReadAllNotificationsButton.plugin.js"}*//

var ReadAllNotificationsButton = (_ => {
	var blacklist, clearing;
	var settings = {};
	
	return class ReadAllNotificationsButton {
		getName () {return "ReadAllNotificationsButton";}

		getVersion () {return "1.6.0";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds a button to clear all notifications.";}

		constructor () {
			this.changelog = {
				"fixed":[["Context Menu Update","Fixes for the context menu update, yaaaaaay"]]
			};
			
			this.patchedModules = {
				after: {
					Guilds: "render",
					MessagesPopout: "render",
					RecentsHeader: "default"
				}
			};
		}

		initConstructor () {
			this.css = `
				${BDFDB.dotCN.messagespopouttabbar} {
					flex: 1 0 auto;
				}
				${BDFDB.dotCN.messagespopouttabbar} ~ * {
					margin-left: 10px;
				}
				${BDFDB.dotCN._readallnotificationsbuttonframe} {
					margin-bottom: 10px;
				}
				${BDFDB.dotCN._readallnotificationsbuttonframe}:active {
					transform: translateY(1px);
				}
				${BDFDB.dotCN._readallnotificationsbuttonbutton} {
					cursor: pointer;
					border-radius: 4px;
					font-size: 12px;
					line-height: 1.3;
					white-space: nowrap;
				}
			`;

			this.defaults = {
				settings: {
					addClearButton:	{value:true, 	inner:false,	description:"Adds a 'Clear Mentions' button to the recent mentions popout"},
					confirmClear:	{value:false,	inner:false, 	description:"Asks for your confirmation before clearing reads."},
					includeGuilds:	{value:true, 	inner:true,		description:"unread Servers"},
					includeMuted:	{value:false, 	inner:true,		description:"muted unread Servers"},
					includeDMs:		{value:false, 	inner:true,		description:"unread DMs"}
				}
			};
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let settingsPanel, settingsItems = [];
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Settings",
				collapseStates: collapseStates,
				children: Object.keys(settings).filter(key => !this.defaults.settings[key].inner).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
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
						className: BDFDB.disCN.marginbottom8,
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
						className: BDFDB.disCN.marginbottom8,
						color: BDFDB.LibraryComponents.Button.Colors.GREEN,
						label: "Enable for all Servers",
						onClick: _ => {
							this.batchSetGuilds(settingsPanel, collapseStates, true);
						},
						children: BDFDB.LanguageUtils.LanguageStrings.ENABLE
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						type: "Button",
						className: BDFDB.disCN.marginbottom8,
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

		// Legacy
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
				
				let loadedBlacklist = BDFDB.DataUtils.load(this, "blacklist");
				this.saveBlacklist(!BDFDB.ArrayUtils.is(loadedBlacklist) ? [] : loadedBlacklist);

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


		// Begin of own functions

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
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
					action: event => {
						BDFDB.DMUtils.markAsRead(channelId);
					}
				})
			}));
		}
		
		processGuilds (e) {
			let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "ConnectedUnreadDMs"});
			if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCNS.guildouter + BDFDB.disCN._readallnotificationsbuttonframe,
				style: {height: 20},
				children: BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCNS.guildiconwrapper + BDFDB.disCN._readallnotificationsbuttoninner,
					style: {height: 20},
						children: BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCNS.guildiconchildwrapper + BDFDB.disCN._readallnotificationsbuttonbutton,
						style: {height: 20},
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

		processMessagesPopout (e) {
			if (e.instance.props.className == BDFDB.disCN.recentmentionspopout && e.returnvalue.props.children && e.returnvalue.props.children[0]) {
				e.returnvalue.props.children[0].props.messages = e.instance.props.messages;
			}
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
								let messages = [].concat(e.instance.props.messages);
								if (messages.length) {
									clearing = true;
									let toast = BDFDB.NotificationUtils.toast("Clearing all recent mentions, please wait...", {timeout:0});
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
		
		forceUpdateAll () {
			settings = BDFDB.DataUtils.get(this, "settings");
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
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
	}
})();

module.exports = ReadAllNotificationsButton;