//META{"name":"ReadAllNotificationsButton","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ReadAllNotificationsButton","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ReadAllNotificationsButton/ReadAllNotificationsButton.plugin.js"}*//

class ReadAllNotificationsButton {
	getName () {return "ReadAllNotificationsButton";}

	getVersion () {return "1.5.4";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a button to clear all notifications.";}

	constructor () {
		this.changelog = {
			"fixed":[["Clear Mentions","Clear Mentions buton is now properly added again"]],
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};

		this.patchedModules = {
			after: {
				Guilds: "render",
				MessagesPopout: "render"
			}
		};
	}

	initConstructor () {
		this.css = `
			${BDFDB.dotCN._readallnotificationsbuttonframe} {
				margin-bottom: 10px;
			}
			${BDFDB.dotCN._readallnotificationsbuttonbutton} {
				cursor: pointer;
				border-radius: 4px;
				font-size: 12px;
				line-height: 1.3;
			}
		`;

		this.defaults = {
			settings: {
				addClearButton:	{value:true, 	inner:false,	description:"Adds a 'Clear Mentions' button to the recent mentions popout"},
				includeGuilds:	{value:true, 	inner:true,		description:"unread Servers"},
				includeMuted:	{value:false, 	inner:true,		description:"muted unread Servers"},
				includeDMs:		{value:false, 	inner:true,		description:"unread DMs"}
			}
		};
	}

	getSettingsPanel () {
		if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		let settingspanel, settingsitems = [], inneritems = [];
		
		for (let key in settings) (!this.defaults.settings[key].inner ? settingsitems : inneritems).push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
			className: BDFDB.disCN.marginbottom8,
			type: "Switch",
			plugin: this,
			keys: ["settings", key],
			label: this.defaults.settings[key].description,
			value: settings[key],
			disabled: key == "includeMuted" && !settings.includeGuilds,
			onChange: (value, instance) => {
				if (key != "includeGuilds") return;
				let mutedSwitchIns = BDFDB.ReactUtils.findOwner(instance, {props:[["keys",["settings", "includeMuted"]]]});
				if (mutedSwitchIns) {
					mutedSwitchIns.props.disabled = !value;
					BDFDB.ReactUtils.forceUpdate(mutedSwitchIns);
				}
			}
		}));
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
			title: "When left clicking the 'read all' button mark following Elements as read:",
			first: settingsitems.length == 0,
			last: true,
			children: inneritems
		}));
		
		return settingspanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
	}

	//legacy
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

			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.ModuleUtils.forceAllUpdates(this);
			
			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	onUserContextMenu (e) {
		if (e.instance.props.channelId && e.instance.props.type == BDFDB.DiscordConstants.ContextMenuTypes.USER_PRIVATE_CHANNELS) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: BDFDB.LibraryComponents.ContextMenuItems.Group});
			if (index > -1) this.injectItem(children, e.instance.props.channelId);
		}
	}

	onGroupDMContextMenu (e) {
		if (e.instance.props.channelId) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: BDFDB.LibraryComponents.ContextMenuItems.Group});
			if (index > -1) this.injectItem(children, e.instance.props.channelId);
		}
	}
	
	injectItem (children, channelId) {
		children.unshift(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Group, {
			children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
				label: BDFDB.LanguageUtils.LanguageStrings.MARK_AS_READ,
				disabled: !BDFDB.LibraryModules.DirectMessageUnreadStore.getUnreadPrivateChannelIds().includes(channelId),
				action: event => {
					BDFDB.ContextMenuUtils.close(event.target);
					BDFDB.DMUtils.markAsRead(channelId);
				}
			})
		}));
	}
	
	processGuilds (e) {
		let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "ConnectedUnreadDMs"});
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
						let settings = BDFDB.DataUtils.get(this, "settings");
						if (settings.includeGuilds) BDFDB.GuildUtils.markAsRead(settings.includeMuted ? BDFDB.GuildUtils.getAll() : BDFDB.GuildUtils.getUnread());
						if (settings.includeDMs) BDFDB.DMUtils.markAsRead(BDFDB.DMUtils.getAll());
					},
					onContextMenu: event => {
						BDFDB.ContextMenuUtils.open(this, event, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Group, {
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
									label: this.labels.context_unreadguilds_text,
									action: event2 => {
										BDFDB.ContextMenuUtils.close(event2._targetInst);
										BDFDB.GuildUtils.markAsRead(BDFDB.GuildUtils.getUnread());
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
									label: this.labels.context_pingedguilds_text,
									action: event2 => {
										BDFDB.ContextMenuUtils.close(event2._targetInst);
										BDFDB.GuildUtils.markAsRead(BDFDB.GuildUtils.getPinged());
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
									label: this.labels.context_mutedguilds_text,
									action: event2 => {
										BDFDB.ContextMenuUtils.close(event2._targetInst);
										BDFDB.GuildUtils.markAsRead(BDFDB.GuildUtils.getMuted());
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
									label: this.labels.context_guilds_text,
									action: event2 => {
										BDFDB.ContextMenuUtils.close(event2._targetInst);
										this.addPinnedRecent(instance.props.channel.id);
										BDFDB.GuildUtils.markAsRead(BDFDB.GuildUtils.getAll());
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
									label: this.labels.context_dms_text,
									action: event2 => {
										BDFDB.ContextMenuUtils.close(event2._targetInst);
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
		if (e.instance.props.className == BDFDB.disCN.recentmentionspopout && BDFDB.DataUtils.get(this, "settings", "addClearButton")) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "RecentMentionsHeader"});
			if (index > -1) children.splice(index, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
				look: BDFDB.LibraryComponents.Button.Looks.OUTLINED,
				color: BDFDB.LibraryComponents.Button.Colors.GREY,
				hover: BDFDB.LibraryComponents.Button.Hovers.RED,
				size: BDFDB.LibraryComponents.Button.Sizes.SMALL,
				children: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
				onClick: (event, buttoninstance) => {
					this.clearMentions(e.instance, BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagespopoutwrap, BDFDB.ReactUtils.findDOMNode(buttoninstance)));
				},
				style: {
					position: "absolute",
					top: 8,
					right: 20
				}
			}));
		}
	}

	clearMentions (instance, wrapper) {
		if (!instance || !Node.prototype.isPrototypeOf(wrapper) || !document.contains(wrapper)) return;
		let closebuttons = wrapper.querySelectorAll(BDFDB.dotCN.messagespopoutclosebutton);
		for (let btn of wrapper.querySelectorAll(BDFDB.dotCN.messagespopoutclosebutton)) btn.click();
		if (closebuttons.length) {
			instance.props.loadMore();
			BDFDB.TimeUtils.timeout(_ => {this.clearMentions(instance, wrapper);},3000);
		}
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
