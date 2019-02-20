//META{"name":"LastMessageDate","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/LastMessageDate","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/LastMessageDate/LastMessageDate.plugin.js"}*//

class LastMessageDate {
	getName () {return "LastMessageDate";}

	getVersion () {return "1.0.2";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Displays the Date of the last sent Message of a Member for the current Server/DM in the UserPopout and UserModal.";}

	initConstructor () {
		this.changelog = {
			"improved":[["DMs","Now also shows the Date of the last send Message in DMs"]]
		};
		
		this.labels = {};

		this.patchModules = {
			"UserPopout":"componentDidMount",
			"UserProfile":"componentDidMount"
		};

		this.languages;

		this.loadedusers = {};

		this.css = `
			${BDFDB.dotCNS.userpopout + BDFDB.dotCN.nametag} {
				margin-bottom: 4px;
			}
			${BDFDB.dotCN.userprofile} .lastMessageDate {
				margin-right: 20px;
			}
			${BDFDB.dotCNS.themelight + BDFDB.dotCN.userpopoutheadernormal} .lastMessageDate {
				color: #b9bbbe; 
			}
			${BDFDB.dotCNS.themelight + BDFDB.dotCN.userpopoutheader + BDFDB.notCN.userpopoutheadernormal} .lastMessageDate,
			${BDFDB.dotCNS.themedark + BDFDB.dotCN.userpopoutheader} .lastMessageDate {
				color: hsla(0,0%,100%,.6);
			}
			${BDFDB.dotCNS.themelight + BDFDB.dotCN.userprofiletopsectionnormal} .lastMessageDate {
				color: hsla(216,4%,74%,.6); 
			}
			${BDFDB.dotCN.themelight} [class*='topSection']${BDFDB.notCN.userprofiletopsectionnormal} .lastMessageDate,
			${BDFDB.dotCN.themedark} [class*='topSection'] .lastMessageDate {
				color: hsla(0,0%,100%,.6);
			}`;


		this.defaults = {
			settings: {
				addInUserPopout:		{value:true, 		description:"Add in User Popouts:"},
				addInUserProfil:		{value:true, 		description:"Add in User Profil Modal:"},
				addJoinedAtTime:		{value:true, 		description:"Display the Time when the User Joined:"},
				forceZeros:				{value:false, 		description:"Force leading Zeros:"}
			},
			choices: {
				lastMessageDateLang:	{value:"$discord", 	description:"Joined At Date Format:"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.getAllData(this, "settings");
		let choices = BDFDB.getAllData(this, "choices");
		let settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in choices) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 30%;">${this.defaults.choices[key].description}</h3><div class="${BDFDB.disCN.selectwrap}" style="flex: 1 1 70%;"><div class="${BDFDB.disCNS.select + BDFDB.disCNS.selectsingle + BDFDB.disCN.selecthasvalue}" type="${key}" value="${choices[key]}"><div class="${BDFDB.disCN.selectcontrol}"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectvalue}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal} languageName" style="flex: 1 1 42%; padding:0;">${this.languages[choices[key]].name}</div><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal} languageTimestamp" style="flex: 1 1 58%; padding:0;">${this.getLastMessageTime(this.languages[choices[key]].id)}</div></div><span class="${BDFDB.disCN.selectarrowzone}"><span class="${BDFDB.disCN.selectarrow}"></span></span></div></div></div></div>`;
		}
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".settings-switch", () => {
			let choices = BDFDB.getAllData(this, "choices");
			for (let key in choices) settingspanel.querySelector(`${BDFDB.dotCN.select}[type='${key}'] .languageTimestamp`).innerText = this.getLastMessageTime(this.languages[choices[key]].id);
		});
		BDFDB.addEventListener(this, settingspanel, "click", BDFDB.dotCN.selectcontrol, e => {this.openDropdownMenu(e);});
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

			this.CurrentGuildStore = BDFDB.WebModules.findByProperties("getLastSelectedGuildId");
			this.CurrentChannelStore = BDFDB.WebModules.findByProperties("getLastSelectedChannelId");
			this.APIModule = BDFDB.WebModules.findByProperties("getAPIBaseURL");
			this.DiscordConstants = BDFDB.WebModules.findByProperties("Permissions", "ActivityTypes", "StatusTypes");

			this.languages = Object.assign({},BDFDB.languages);
			
			BDFDB.WebModules.patch(BDFDB.WebModules.findByProperties("receiveMessage"), "receiveMessage", this, {after: e => {
				let message = e.methodArguments[1];
				let guildid = message.guild_id || message.channel_id;
				if (guildid && this.loadedusers[guildid] && this.loadedusers[guildid][message.author.id]) this.loadedusers[guildid][message.author.id] = new Date(message.timestamp);
			}});

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".lastMessageDate");
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	openDropdownMenu (e) {
		let selectControl = e.currentTarget;
		let selectWrap = selectControl.parentElement;
		let plugincard = BDFDB.getParentEle("li", selectWrap);

		if (!plugincard || BDFDB.containsClass(selectWrap, BDFDB.disCN.selectisopen)) return;

		BDFDB.addClass(selectWrap, BDFDB.disCN.selectisopen);
		plugincard.style.setProperty("overflow", "visible", "important");

		let type = selectWrap.getAttribute("type");
		let selectMenu = this.createDropdownMenu(selectWrap.getAttribute("value"), type);
		selectWrap.appendChild(selectMenu);

		BDFDB.addChildEventListener(selectMenu, "mousedown", BDFDB.dotCN.selectoption, e2 => {
			let language = e2.currentTarget.getAttribute("value");
			selectWrap.setAttribute("value", language);
			selectControl.querySelector(".languageName").innerText = this.languages[language].name;
			selectControl.querySelector(".languageTimestamp").innerText = this.getLastMessageTime(language);
			BDFDB.saveData(type, language, this, "choices");
		});

		var removeMenu = e2 => {
			if (e2.target.parentElement != selectMenu) {
				document.removeEventListener("mousedown", removeMenu);
				selectMenu.remove();
				plugincard.style.removeProperty("overflow");
				setTimeout(() => {BDFDB.removeClass(selectWrap, BDFDB.disCN.selectisopen);},100);
			}
		};

		document.addEventListener("mousedown", removeMenu);
	}

	createDropdownMenu (choice, type) {
		let menuhtml = `<div class="${BDFDB.disCN.selectmenuouter}"><div class="${BDFDB.disCN.selectmenu}">`;
		for (let key in this.languages) {
			let isSelected = key == choice ? ` ${BDFDB.disCN.selectselected}` : ``;
			menuhtml += `<div value="${key}" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectoption + isSelected}" style="flex: 1 1 auto; display:flex;"><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}" style="flex: 1 1 42%;">${this.languages[key].name}</div><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}" style="flex: 1 1 58%;">${this.getLastMessageTime(this.languages[key].id)}</div></div>`
		}
		menuhtml += `</div></div>`;
		return BDFDB.htmlToElement(menuhtml);
	}

	processUserPopout (instance, wrapper) {
		if (instance.props && instance.props.user && BDFDB.getData("addInUserPopout", this, "settings")) {
			this.addLastMessageDate(instance.props.user, wrapper.querySelector(BDFDB.dotCN.userpopoutheadertext), wrapper.parentElement);
		}
	}

	processUserProfile (instance, wrapper) {
		if (instance.props && instance.props.user && BDFDB.getData("addInUserProfil", this, "settings")) {
			this.addLastMessageDate(instance.props.user, wrapper.querySelector(BDFDB.dotCN.userprofileheaderinfo), null);
		}
	}

	addLastMessageDate (info, container, popout) {
		if (!info || info.isLocalBot() || !container || container.querySelector(".lastMessageDate")) return;
		let guildid = this.CurrentGuildStore.getGuildId();
		let isguild = !!guildid;
		guildid = guildid || this.CurrentChannelStore.getChannelId();
		if (guildid) {
			if (!this.loadedusers[guildid]) this.loadedusers[guildid] = {};
			let addTimestamp = (timestamp) => {
				if (document.contains(container)) {
					let choice = BDFDB.getData("lastMessageDateLang", this, "choices");
					let nametag = container.querySelector(BDFDB.dotCN.nametag);
					let joinedAtDate = container.querySelector(".joinedAtDate");
					container.insertBefore(BDFDB.htmlToElement(`<div class="lastMessageDate DevilBro-textscrollwrapper ${BDFDB.disCN.textrow}" style="max-width: ${BDFDB.getRects(BDFDB.getParentEle(popout ? BDFDB.dotCN.userpopoutheader : BDFDB.dotCN.userprofileheaderinfo, container)).width - 20}px !important;"><div class="DevilBro-textscroll">${this.labels.lastmessage_text + " " + (timestamp == "never" ? "---" : this.getLastMessageTime(this.languages[choice].id, timestamp))}</div></div>`), joinedAtDate ? joinedAtDate.nextSibling : (nametag ? nametag.nextSibling : null));
					BDFDB.initElements(container.parentElement, this);
					if (popout && popout.style.transform.indexOf("translateY(-1") == -1) {
						let arect = BDFDB.getRects(document.querySelector(BDFDB.dotCN.appmount));
						let prect = BDFDB.getRects(popout);
						popout.style.setProperty("top", (prect.y + prect.height > arect.height ? (arect.height - prect.height) : prect.y) + "px");
					}
				}
			};
			if (this.loadedusers[guildid][info.id]) addTimestamp(this.loadedusers[guildid][info.id]);
			else this.APIModule.get((isguild ? this.DiscordConstants.Endpoints.SEARCH_GUILD(guildid) : this.DiscordConstants.Endpoints.SEARCH_CHANNEL(guildid)) + "?author_id=" + info.id).then(result => {
				if (result && result.body && Array.isArray(result.body.messages[0])) {
					for (let message of result.body.messages[0]) if (message.hit && message.author.id == info.id) {
						let timestamp = new Date(message.timestamp);
						this.loadedusers[guildid][info.id] = timestamp;
						addTimestamp(timestamp);
					}
				}
				else {
					let timestamp = "never";
					this.loadedusers[guildid][info.id] = timestamp;
					addTimestamp(timestamp);
				}
			});
		}
	}

	getLastMessageTime (languageid, timestamp = new Date()) {
		let settings = BDFDB.getAllData(this, "settings");
		let timestring = settings.addJoinedAtTime ? timestamp.toLocaleString(languageid) : timestamp.toLocaleDateString(languageid);
		if (timestring && settings.forceZeros) timestring = this.addLeadingZeros(timestring);
		return timestring;
	}

	addLeadingZeros (timestring) {
		let chararray = timestring.split("");
		let numreg = /[0-9]/;
		for (let i = 0; i < chararray.length; i++) {
			if (!numreg.test(chararray[i-1]) && numreg.test(chararray[i]) && !numreg.test(chararray[i+1])) chararray[i] = "0" + chararray[i];
		}

		return chararray.join("");
	}

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					lastmessage_text:				"Posljednja poruka dana"
				};
			case "da":		//danish
				return {
					lastmessage_text:				"Sidste besked den"
				};
			case "de":		//german
				return {
					lastmessage_text:				"Letzte Nachricht am"
				};
			case "es":		//spanish
				return {
					lastmessage_text:				"Último mensaje el"
				};
			case "fr":		//french
				return {
					lastmessage_text:				"Dernier message le"
				};
			case "it":		//italian
				return {
					lastmessage_text:				"Ultimo messaggio il"
				};
			case "nl":		//dutch
				return {
					lastmessage_text:				"Laatste bericht op"
				};
			case "no":		//norwegian
				return {
					lastmessage_text:				"Siste melding på"
				};
			case "pl":		//polish
				return {
					lastmessage_text:				"Ostatnia wiadomość z"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					lastmessage_text:				"Última mensagem em"
				};
			case "fi":		//finnish
				return {
					lastmessage_text:				"Viimeisin viesti"
				};
			case "sv":		//swedish
				return {
					lastmessage_text:				"Senaste meddelandet den"
				};
			case "tr":		//turkish
				return {
					lastmessage_text:				"Son mesajı"
				};
			case "cs":		//czech
				return {
					lastmessage_text:				"Poslední zpráva dne"
				};
			case "bg":		//bulgarian
				return {
					lastmessage_text:				"Последно съобщение на"
				};
			case "ru":		//russian
				return {
					lastmessage_text:				"Последнее сообщение"
				};
			case "uk":		//ukrainian
				return {
					lastmessage_text:				"Останнє повідомлення"
				};
			case "ja":		//japanese
				return {
					lastmessage_text:				"最後のメッセージ"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					lastmessage_text:				"最後消息於"
				};
			case "ko":		//korean
				return {
					lastmessage_text:				"마지막 메시지"
				};
			default:		//default: english
				return {
					lastmessage_text:				"Last message on"
				};
		}
	}
}
