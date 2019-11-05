//META{"name":"ReadAllNotificationsButton","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ReadAllNotificationsButton","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ReadAllNotificationsButton/ReadAllNotificationsButton.plugin.js"}*//

class ReadAllNotificationsButton {
	getName () {return "ReadAllNotificationsButton";}

	getVersion () {return "1.5.1";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a button to clear all notifications.";}

	constructor () {
		this.changelog = {
			"added":[["Pinged servers","Added the contextmenu item to only clear unread notifications on pinged servers"]]
		};

		this.patchModules = {
			"Guilds":["componentDidMount","componentDidUpdate"],
			"RecentMentions":"componentDidMount",
			"DirectMessage":"componentDidMount"
		};
	}

	initConstructor () {
		this.RANbuttonMarkup = 
			`<div class="${BDFDB.disCN.guildouter} RANbutton-frame" style="height: 20px;">
				<div class="${BDFDB.disCN.guildiconwrapper} RANbutton-inner" style="height: 20px;">
					<div class="${BDFDB.disCNS.guildiconchildwrapper + BDFDB.disCN.guildiconacronym} RANbutton" style="height: 20px;">read all</div>
				</div>
			</div>`;

		this.RAMbuttonMarkup = 
			`<button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemin + BDFDB.disCN.buttongrow} RAMbutton" style="flex: 0 0 auto; margin-left: 25px; height: 25px;">
				<div class="${BDFDB.disCN.buttoncontents}">Clear Mentions</div>
			</button>`;

		this.css = `
			.RANbutton-frame {
				margin-bottom: 10px;
			}
			.RANbutton {
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
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		let settingsitems = [], inneritems = [];
		
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
			children: inneritems
		}));
		
		return BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {
			try {return this.initialize();}
			catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
		}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);

			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.DOMUtils.remove(".RANbutton-frame", ".RAMbutton");
			BDFDB.DOMUtils.removeClassFromDOM("RAN-added", "RAM-added");
			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	processGuilds (instance, wrapper, returnvalue, methodnames) {
		if (methodnames.includes("componentDidMount") || (methodnames.includes("componentDidUpdate") && document.querySelector(".bd-guild ~ .RANbutton-frame"))) {
			BDFDB.DOMUtils.remove(".RANbutton-frame");
			let insertnode = this.getInsertNode();
			if (insertnode) {
				let ranbutton = BDFDB.DOMUtils.create(this.RANbuttonMarkup);
				insertnode.parentElement.insertBefore(ranbutton, insertnode);
				ranbutton.addEventListener("click", () => {
					let settings = BDFDB.DataUtils.get(this, "settings");
					if (settings.includeGuilds) BDFDB.GuildUtils.markAsRead(settings.includeMuted ? BDFDB.GuildUtils.getAll() : BDFDB.GuildUtils.getUnread());
					if (settings.includeDMs) BDFDB.DMUtils.markAsRead(BDFDB.DMUtils.getAll());
				});
				ranbutton.addEventListener("contextmenu", e => {
					const itemGroup = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
						className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
								label: this.labels.context_unreadguilds_text,
								className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-unreadguilds-contextMenuItem`,
								action: e => {
									BDFDB.ContextMenuUtils.close(BDFDB.DOMUtils.getParent(BDFDB.dotCN.contextmenu, e.target));
									BDFDB.GuildUtils.markAsRead(BDFDB.GuildUtils.getUnread());
								}
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
								label: this.labels.context_pingedguilds_text,
								className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-pingedguilds-contextMenuItem`,
								action: e => {
									BDFDB.ContextMenuUtils.close(BDFDB.DOMUtils.getParent(BDFDB.dotCN.contextmenu, e.target));
									BDFDB.GuildUtils.markAsRead(BDFDB.GuildUtils.getPinged());
								}
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
								label: this.labels.context_mutedguilds_text,
								className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-mutedguilds-contextMenuItem`,
								action: e => {
									BDFDB.ContextMenuUtils.close(BDFDB.DOMUtils.getParent(BDFDB.dotCN.contextmenu, e.target));
									BDFDB.GuildUtils.markAsRead(BDFDB.GuildUtils.getMuted());
								}
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
								label: this.labels.context_guilds_text,
								className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-guilds-contextMenuItem`,
								action: e => {
									BDFDB.ContextMenuUtils.close(BDFDB.DOMUtils.getParent(BDFDB.dotCN.contextmenu, e.target));
									this.addPinnedRecent(instance.props.channel.id);
									BDFDB.GuildUtils.markAsRead(BDFDB.GuildUtils.getAll());
								}
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
								label: this.labels.context_dms_text,
								className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-dms-contextMenuItem`,
								action: e => {
									BDFDB.ContextMenuUtils.close(BDFDB.DOMUtils.getParent(BDFDB.dotCN.contextmenu, e.target));
									BDFDB.DMUtils.markAsRead(BDFDB.DMUtils.getAll());
								}
							})
						]
					});
					BDFDB.ContextMenuUtils.open(this, e, itemGroup);
				});
				BDFDB.DOMUtils.addClass(wrapper, "RAN-added");
			}
		}
	}

	processDirectMessage (instance, wrapper, returnvalue, methodnames) {
		let ranbutton = document.querySelector(".RANbutton-frame");
		let insertnode = this.getInsertNode();
		if (ranbutton && insertnode) insertnode.parentElement.insertBefore(ranbutton, insertnode);
	}

	processRecentMentions (instance, wrapper, returnvalue) {
		BDFDB.DOMUtils.remove(".RAMbutton");
		if (instance.props && instance.props.popoutName == "RECENT_MENTIONS_POPOUT" && BDFDB.DataUtils.get(this, "settings", "addClearButton")) {
			let recentmentionstitle = wrapper.querySelector(BDFDB.dotCN.messagespopouttitle);
			if (recentmentionstitle) {
				let ranbutton = BDFDB.DOMUtils.create(this.RAMbuttonMarkup);
				recentmentionstitle.appendChild(ranbutton);
				ranbutton.addEventListener("click", () => {this.clearMentions(instance, wrapper);});
				BDFDB.DOMUtils.addClass(wrapper, "RAM-added");
			}
		}
	}

	clearMentions (instance, wrapper) {
		let closebuttons = wrapper.querySelectorAll(BDFDB.dotCN.messagespopoutclosebutton);
		for (let btn of wrapper.querySelectorAll(BDFDB.dotCN.messagespopoutclosebutton)) btn.click();
		if (closebuttons.length) {
			instance.loadMore();
			BDFDB.TimeUtils.timeout(() => {this.clearMentions(instance, wrapper);},3000);
		}
	}

	getInsertNode () {
		let homebutton = BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildouter, document.querySelector(BDFDB.dotCN.homebuttonicon));
		if (!homebutton) return null;
		let nextsibling = homebutton.nextElementSibling, insertnode = null;
		while (nextsibling && insertnode == null) {
			if (nextsibling.querySelector(`${BDFDB.dotCN.guildseparator}:not(.folderseparator)`)) insertnode = nextsibling;
			nextsibling = nextsibling.nextElementSibling
		}
		return insertnode;
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
