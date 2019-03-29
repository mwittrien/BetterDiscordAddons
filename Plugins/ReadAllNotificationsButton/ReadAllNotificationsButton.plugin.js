//META{"name":"ReadAllNotificationsButton","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ReadAllNotificationsButton","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ReadAllNotificationsButton/ReadAllNotificationsButton.plugin.js"}*//

class ReadAllNotificationsButton {
	getName () {return "ReadAllNotificationsButton";}

	getVersion () {return "1.4.3";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a button to clear all notifications.";}

	initConstructor () {
		this.changelog = {
			"fixed":[["Changes","Fixed for the new server classes"]]
		};
		
		this.patchModules = {
			"Guilds":"componentDidMount",
			"RecentMentions":"componentDidMount",
			"DirectMessage":"componentDidMount"
		};

		this.RANcontextMenuMarkup = 
			`<div class="${BDFDB.disCN.contextmenu} RANbutton-contextmenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} readguilds-item">
						<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_context_guilds_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} readmutedguilds-item">
						<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_context_mutedguilds_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					<div class="${BDFDB.disCN.contextmenuitem} readdms-item">
						<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_context_dms_text</div></span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>
			</div>`;

		this.RANbuttonMarkup = 
			`<div class="${BDFDB.disCN.guild} RANbutton-frame" id="bd-pub-li" style="height: 20px; margin-bottom: 10px;">
				<div class="${BDFDB.disCN.guildinner}" style="height: 20px; border-radius: 4px;">
					<a>
						<div class="RANbutton" id="bd-pub-button" style="line-height: 20px; font-size: 12px;">read all</div>
					</a>
				</div>
			</div>`;

		this.RAMbuttonMarkup = 
			`<button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemin + BDFDB.disCN.buttongrow} RAMbutton" style="flex: 0 0 auto; margin-left: 25px; height: 25px;">
				<div class="${BDFDB.disCN.buttoncontents}">Clear Mentions</div>
			</button>`;

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
		var settings = BDFDB.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			if (!this.defaults.settings[key].inner) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">When left clicking the button mark following elements as unread:</h3></div><div class="DevilBro-settings-inner-list">`;
		for (let key in settings) {
			if (this.defaults.settings[key].inner) settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);
		
		let mutedinput = settingspanel.querySelector(".settings-switch[value='settings includeMuted']").parentElement.parentElement;
		BDFDB.toggleEles(mutedinput, settings.includeGuilds);
		BDFDB.addEventListener(this, settingspanel, "click", ".settings-switch[value='settings includeGuilds']", e => {
			BDFDB.toggleEles(mutedinput, e.currentTarget.checked);
		});

		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".RANbutton-frame", ".RAMbutton");
			BDFDB.removeClasses("RAN-added", "RAM-added");
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	changeLanguageStrings () {
		this.RANcontextMenuMarkup = 	this.RANcontextMenuMarkup.replace("REPLACE_context_guilds_text", this.labels.context_guilds_text);
		this.RANcontextMenuMarkup = 	this.RANcontextMenuMarkup.replace("REPLACE_context_mutedguilds_text", this.labels.context_mutedguilds_text);
		this.RANcontextMenuMarkup = 	this.RANcontextMenuMarkup.replace("REPLACE_context_dms_text", this.labels.context_dms_text);
	}

	processGuilds (instance, wrapper) {
		BDFDB.removeEles(".RANbutton-frame");
		let guildseparator = wrapper.querySelector(BDFDB.dotCN.guildseparator);
		if (guildseparator) {
			let ranbutton = BDFDB.htmlToElement(this.RANbuttonMarkup);
			guildseparator.parentElement.insertBefore(ranbutton, guildseparator);
			ranbutton.addEventListener("click", () => {
				let settings = BDFDB.getAllData(this, "settings");
				if (settings.includeGuilds) BDFDB.markGuildAsRead(settings.includeMuted ? BDFDB.readServerList() : BDFDB.readUnreadServerList());
				if (settings.includeDMs) BDFDB.markChannelAsRead(BDFDB.readDmList());
			});
			ranbutton.addEventListener("contextmenu", e => {
				let RANcontextMenu = BDFDB.htmlToElement(this.RANcontextMenuMarkup);
				RANcontextMenu.querySelector(".readguilds-item").addEventListener("click", () => {
					BDFDB.removeEles(RANcontextMenu);
					BDFDB.markGuildAsRead(BDFDB.readUnreadServerList());
				});
				RANcontextMenu.querySelector(".readmutedguilds-item").addEventListener("click", () => {
					BDFDB.removeEles(RANcontextMenu);
					BDFDB.markGuildAsRead(BDFDB.readServerList());
				});
				RANcontextMenu.querySelector(".readdms-item").addEventListener("click", () => {
					BDFDB.removeEles(RANcontextMenu);
					BDFDB.markChannelAsRead(BDFDB.readDmList());
				});
				BDFDB.appendContextMenu(RANcontextMenu, e);
			});
			BDFDB.addClass(wrapper, "RAN-added");
		}
	}

	processDirectMessage (instance, wrapper, methodnames) {
		let ranbutton = document.querySelector(".RANbutton-frame");
		let guildseparator = wrapper.parentElement.parentElement.querySelector(BDFDB.dotCN.guildseparator);
		if (ranbutton && guildseparator) guildseparator.parentElement.insertBefore(ranbutton, guildseparator);
	}

	processRecentMentions (instance, wrapper) {
		BDFDB.removeEles(".RAMbutton");
		if (instance.props && instance.props.popoutName == "RECENT_MENTIONS_POPOUT" && BDFDB.getData("addClearButton", this, "settings")) {
			let recentmentionstitle = wrapper.querySelector(BDFDB.dotCN.messagespopouttitle);
			if (recentmentionstitle) {
				let ranbutton = BDFDB.htmlToElement(this.RAMbuttonMarkup);
				recentmentionstitle.appendChild(ranbutton);
				ranbutton.addEventListener("click", () => {this.clearMentions(instance, wrapper);});
				BDFDB.addClass(wrapper, "RAM-added");
			}
		}
	}

	clearMentions (instance, wrapper) {
		let closebuttons = wrapper.querySelectorAll(BDFDB.dotCN.messagespopoutclosebutton);
		for (let btn of wrapper.querySelectorAll(BDFDB.dotCN.messagespopoutclosebutton)) btn.click();
		if (closebuttons.length) {
			instance.loadMore();
			setTimeout(() => {this.clearMentions(instance, wrapper);},3000);
		}
	}
	
	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					context_guilds_text:		"Poslužitelji",
					context_mutedguilds_text:	"Prigušeni Poslužitelji",
					context_dms_text:			"Prikvacene Izravne"
				};
			case "da":		//danish
				return {
					context_guilds_text:		"Servere",
					context_mutedguilds_text:	"Dæmpede Servere",
					context_dms_text:			"Private Beskeder"
				};
			case "de":		//german
				return {
					context_guilds_text:		"Server",
					context_mutedguilds_text:	"Stummgeschaltene Server",
					context_dms_text:			"Direktnachrichten"
				};
			case "es":		//spanish
				return {
					context_guilds_text:		"Servidores",
					context_mutedguilds_text:	"Servidores silenciados",
					context_dms_text:			"Mensajes directos"
				};
			case "fr":		//french
				return {
					context_guilds_text:		"Serveurs",
					context_mutedguilds_text:	"Serveurs en sourdine",
					context_dms_text:			"Messages privés"
				};
			case "it":		//italian
				return {
					context_guilds_text:		"Server",
					context_mutedguilds_text:	"Server disattivati",
					context_dms_text:			"Messaggi diretti"
				};
			case "nl":		//dutch
				return {
					context_guilds_text:		"Servers",
					context_mutedguilds_text:	"Gedempte Servers",
					context_dms_text:			"Prive Berichten"
				};
			case "no":		//norwegian
				return {
					context_guilds_text:		"Servere",
					context_mutedguilds_text:	"Dempet Servere",
					context_dms_text:			"Direktemeldinger"
				};
			case "pl":		//polish
				return {
					context_guilds_text:		"Serwery",
					context_mutedguilds_text:	"Wyciszone Serwery",
					context_dms_text:			"Prywatne Wiadomości"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_guilds_text:		"Servidores",
					context_mutedguilds_text:	"Servidores Silenciosos",
					context_dms_text:			"Mensagens Diretas"
				};
			case "fi":		//finnish
				return {
					context_guilds_text:		"Palvelimet",
					context_mutedguilds_text:	"Mykistetyt Palvelimet",
					context_dms_text:			"Yksityisviestit"
				};
			case "sv":		//swedish
				return {
					context_guilds_text:		"Servrar",
					context_mutedguilds_text:	"Dämpade Servrar",
					context_dms_text:			"Direktmeddelanden"
				};
			case "tr":		//turkish
				return {
					context_guilds_text:		"Sunucular",
					context_mutedguilds_text:	"Sessiz Sunucular",
					context_dms_text:			"Özel Mesajlar"
				};
			case "cs":		//czech
				return {
					context_guilds_text:		"Servery",
					context_mutedguilds_text:	"Tlumené Servery",
					context_dms_text:			"Přímé Zpráva"
				};
			case "bg":		//bulgarian
				return {
					context_guilds_text:		"Сървъри",
					context_mutedguilds_text:	"приглушени Сървъри",
					context_dms_text:			"директно Съобщение"
				};
			case "ru":		//russian
				return {
					context_guilds_text:		"Серверы",
					context_mutedguilds_text:	"Отключенные Серверы",
					context_dms_text:			"Прямые Сообщения"
				};
			case "uk":		//ukrainian
				return {
					context_guilds_text:		"Сервери",
					context_mutedguilds_text:	"Приглушені Сервери",
					context_dms_text:			"Прямі Повідомлення"
				};
			case "ja":		//japanese
				return {
					context_guilds_text:		"サーバー",
					context_mutedguilds_text:	"ミュートサーバー",
					context_dms_text:			"ダイレクトメッセージ"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_guilds_text:		"服務器",
					context_mutedguilds_text:	"靜音服務器",
					context_dms_text:			"直接消息",
				};
			case "ko":		//korean
				return {
					context_guilds_text:		"서버",
					context_mutedguilds_text:	"음소거 된 서버",
					context_dms_text:			"직접 메시지"
				};
			default:		//default: english
				return {
					context_guilds_text:		"Servers",
					context_mutedguilds_text:	"Muted Servers",
					context_dms_text:			"Direct Messages"
				};
		}
	}
}
