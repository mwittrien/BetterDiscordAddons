//META{"name":"CreationDate"}*//

class CreationDate {
	initConstructor () {
		this.labels = {};
		
		this.languages;
		
		this.creationDateMarkup = `<div class="creationDate ${BDFDB.disCN.textrow}"></div>`;
		
		this.css = `
			${BDFDB.dotCNS.themelight + BDFDB.dotCN.userpopoutheadernormal} .creationDate {
				color: #b9bbbe; 
			}
			${BDFDB.dotCNS.themelight + BDFDB.dotCN.userpopoutheader}:not(${BDFDB.dotCN.userpopoutheadernormal}) .creationDate,
			${BDFDB.dotCNS.themedark + BDFDB.dotCN.userpopoutheader} .creationDate {
				color: hsla(0,0%,100%,.6);
			}
			${BDFDB.dotCNS.themelight + BDFDB.dotCN.userprofiletopsectionnormal} .creationDate {
				color: hsla(216,4%,74%,.6); 
			}
			${BDFDB.dotCN.themelight} [class*='topSection']:not(${BDFDB.dotCN.userprofiletopsectionnormal}) .creationDate,
			${BDFDB.dotCN.themedark} [class*='topSection'] .creationDate {
				color: hsla(0,0%,100%,.6);
			}`;
			
			
		this.defaults = {
			settings: {
				addInUserPopout:		{value:true, 		description:"Add in User Popouts:"},
				addInUserProfil:		{value:true, 		description:"Add in User Profil Modal:"},
				addCreationTime:		{value:true, 		description:"Display the Time of Creation:"},
				forceZeros:				{value:false, 		description:"Force leading Zeros:"}
			},
			choices: {
				creationDateLang:		{value:"$discord", 	description:"Creation Date Format:"}
			}
		};
	}

	getName () {return "CreationDate";}

	getDescription () {return "Displays the Creation Date of an Account in the UserPopout and UserModal.";}

	getVersion () {return "1.1.8";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var settings = BDFDB.getAllData(this, "settings");
		var choices = BDFDB.getAllData(this, "choices");
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
		}
		for (let key in choices) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 30%; line-height: 38px;">${this.defaults.choices[key].description}</h3><div class="${BDFDB.disCN.selectwrap}" style="flex: 1 1 70%;"><div class="${BDFDB.disCNS.select + BDFDB.disCNS.selectsingle + BDFDB.disCN.selecthasvalue}" type="${key}" value="${choices[key]}"><div class="${BDFDB.disCN.selectcontrol}"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectvalue}" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal} languageName" style="flex: 1 1 42%; padding:0;">${this.languages[choices[key]].name}</div><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal} languageTimestamp" style="flex: 1 1 58%; padding:0;">${this.getCreationTime(this.languages[choices[key]].id)}</div></div><span class="${BDFDB.disCN.selectarrowzone}"><span class="${BDFDB.disCN.selectarrow}"></span></span></div></div></div></div>`;
		}
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", BDFDB.dotCN.switchinner, () => {
				this.updateSettings(settingspanel);
				var choices = BDFDB.getAllData(this, "choices");
				for (let key in choices) {
					settingspanel.querySelector(`${BDFDB.dotCN.select}[type='${key}'] .languageTimestamp`).innerText = this.getCreationTime(this.languages[choices[key]].id);
				}
			})
			.on("click", BDFDB.dotCN.selectcontrol, (e) => {this.openDropdownMenu(e);});
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDFDB !== "object" || BDFDB.isLibraryOutdated()) {
			if (typeof BDFDB === "object") BDFDB = "";
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDFDB === "object") {
			BDFDB.loadMessage(this);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(BDFDB.dotCN.userpopout)) {
									if (BDFDB.getData("addInUserPopout", this, "settings")) this.addCreationDate(node.querySelector(BDFDB.dotCN.userpopoutheadertext));
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.popouts, {name:"userPopoutObserver",instance:observer}, {childList: true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector("[class*='topSection']")) {
									if (BDFDB.getData("addInUserProfil", this, "settings")) this.addCreationDate(node.querySelector(BDFDB.dotCN.userprofileheaderinfo));
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.app + " ~ [class^='theme-']:not([class*='popouts'])", {name:"userProfilModalObserver",instance:observer}, {childList: true});
			
			this.languages = Object.assign({},BDFDB.languages);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDFDB === "object") {		
			BDFDB.unloadMessage(this);
		}
	}

	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
			settings[input.value] = input.checked;
		}
		BDFDB.saveAllData(settings, this, "settings");
	}
	
	openDropdownMenu (e) {
		var selectControl = e.currentTarget;
		var selectWrap = selectControl.parentElement;
		
		if (selectWrap.classList.contains(BDFDB.disCN.selectisopen)) return;
		
		selectWrap.classList.add(BDFDB.disCN.selectisopen);
		$("li").has(selectWrap).css("overflow", "visible");
		
		var type = selectWrap.getAttribute("type");
		var selectMenu = this.createDropdownMenu(selectWrap.getAttribute("value"), type);
		selectWrap.appendChild(selectMenu);
		
		$(selectMenu).on("mousedown." + this.getName(), BDFDB.dotCN.selectoption, (e2) => {
			var language = e2.currentTarget.getAttribute("value");
			selectWrap.setAttribute("value", language);
			selectControl.querySelector(".languageName").innerText = this.languages[language].name;
			selectControl.querySelector(".languageTimestamp").innerText = this.getCreationTime(language);
			BDFDB.saveData(type, language, this, "choices");
		});
		$(document).on("mousedown.select" + this.getName(), (e2) => {
			if (e2.target.parentElement == selectMenu) return;
			$(document).off("mousedown.select" + this.getName());
			selectMenu.remove();
			$("li").has(selectWrap).css("overflow", "auto");
			setTimeout(() => {selectWrap.classList.remove(BDFDB.disCN.selectisopen);},100);
		});
	}
	
	createDropdownMenu (choice, type) {
		var menuhtml = `<div class="${BDFDB.disCN.selectmenuouter}"><div class="${BDFDB.disCN.selectmenu}">`;
		for (var key in this.languages) {
			var isSelected = key == choice ? ` ${BDFDB.disCN.selectselected}` : ``;
			menuhtml += `<div value="${key}" class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignbaseline + BDFDB.disCNS.nowrap + BDFDB.disCN.selectoption + isSelected}" style="flex: 1 1 auto; display:flex;"><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}" style="flex: 1 1 42%;">${this.languages[key].name}</div><div class="${BDFDB.disCNS.title + BDFDB.disCNS.medium + BDFDB.disCNS.size16 + BDFDB.disCNS.height20 + BDFDB.disCNS.primary + BDFDB.disCN.weightnormal}" style="flex: 1 1 58%;">${this.getCreationTime(this.languages[key].id)}</div></div>`
		}
		menuhtml += `</div></div>`;
		return $(menuhtml)[0];
	}
	
	addCreationDate (container) {
		if (!container) return;
		var info = BDFDB.getKeyInformation({"node":container,"key":"user"});
		if (info) {
			var creationDate = $(this.creationDateMarkup);
			var choice = BDFDB.getData("creationDateLang", this, "choices");
			creationDate.text(this.labels.createdat_text + " " + this.getCreationTime(this.languages[choice].id, info.createdAt));
			var nametag = container.querySelector(BDFDB.dotCN.nametag);
			container.insertBefore(creationDate[0], nametag ? nametag.nextSibling : null);
		}
	}
	
	getCreationTime (languageid, timestamp = new Date()) {
		var settings = BDFDB.getAllData(this, "settings");
		var timestring = settings.addCreationTime ? timestamp.toLocaleString(languageid) : timestamp.toLocaleDateString(languageid);
		if (timestring && settings.forceZeros) timestring = this.addLeadingZeros(timestring);
		return timestring;
	}
	
	addLeadingZeros (timestring) {
		var chararray = timestring.split("");
		var numreg = /[0-9]/;
		for (var i = 0; i < chararray.length; i++) {
			if (!numreg.test(chararray[i-1]) && numreg.test(chararray[i]) && !numreg.test(chararray[i+1])) chararray[i] = "0" + chararray[i];
		}
		
		return chararray.join("");
	}
	
	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					createdat_text:				"Izrađen"
				};
			case "da":		//danish
				return {
					createdat_text:				"Oprettet den"
				};
			case "de":		//german
				return {
					createdat_text:				"Erstellt am"
				};
			case "es":		//spanish
				return {
					createdat_text:				"Creado el"
				};
			case "fr":		//french
				return {
					createdat_text:				"Créé le"
				};
			case "it":		//italian
				return {
					createdat_text:				"Creato il"
				};
			case "nl":		//dutch
				return {
					createdat_text:				"Gemaakt op"
				};
			case "no":		//norwegian
				return {
					createdat_text:				"Opprettet på"
				};
			case "pl":		//polish
				return {
					createdat_text:				"Utworzono"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					createdat_text:				"Criado em"
				};
			case "fi":		//finnish
				return {
					createdat_text:				"Luotu"
				};
			case "sv":		//swedish
				return {
					createdat_text:				"Skapat den"
				};
			case "tr":		//turkish
				return {
					createdat_text:				"Oluşturma tarihi"
				};
			case "cs":		//czech
				return {
					createdat_text:				"Vytvořeno dne"
				};
			case "bg":		//bulgarian
				return {
					createdat_text:				"Създадена на"
				};
			case "ru":		//russian
				return {
					createdat_text:				"Создано"
				};
			case "uk":		//ukrainian
				return {
					createdat_text:				"Створено"
				};
			case "ja":		//japanese
				return {
					createdat_text:				"作成日"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					createdat_text:				"創建於"
				};
			case "ko":		//korean
				return {
					createdat_text:				"생성 일"
				};
			default:		//default: english
				return {
					createdat_text:				"Created on"
				};
		}
	}
}
