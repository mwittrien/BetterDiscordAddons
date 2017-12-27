//META{"name":"CreationDate"}*//

class CreationDate {
	constructor () {
		this.labels = {};
		
		this.languages;
		
		this.userPopoutObserver = new MutationObserver(() => {});
		this.userProfilModalObserver = new MutationObserver(() => {});
		
		this.creationDateMarkup = `<div class="creationDate nameNormal-1LgIgN textRow-1_JoJf"></div>`;
		
		this.css = `
			.theme-light .headerNormal-1cioxU .creationDate {
				color: #b9bbbe; 
			}
			.theme-light .headerPlaying-2eYqm9 .creationDate {
				color: hsla(0,0%,100%,.6);
			}
			.theme-dark .headerNormal-1cioxU .creationDate {
				color: hsla(0,0%,100%,.6);
			}
			.theme-dark .headerPlaying-2eYqm9 .creationDate {
				color: hsla(0,0%,100%,.6);
			}
			.theme-light .topSectionNormal-2LlRG1 .creationDate {
				color: hsla(216,4%,74%,.6); 
			}
			.theme-light .topSectionPlaying-3jAH9b .creationDate {
				color: hsla(0,0%,100%,.6);
			}
			.theme-dark .topSectionNormal-2LlRG1 .creationDate {
				color: hsla(0,0%,100%,.6);
			}
			.theme-dark .topSectionPlaying-3jAH9b .creationDate {
				color: hsla(0,0%,100%,.6);
			}`;
			
			
		this.defaultSettings = {
			addInUserPopout:		{value:true, 	description:"Add in User Popouts."},
			addInUserProfil:		{value:true, 	description:"Add in User Profil Modal."},
			addCreationTime:		{value:true, 	description:"Display the Time of Creation."}
		};
	}

	getName () {return "CreationDate";}

	getDescription () {return "Displays the Creation Date of an Account in the UserPopout and UserModal.";}

	getVersion () {return "1.0.8";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settings = this.getSettings(); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaultSettings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU ${settings[key] ? "valueChecked-3Bzkbm" : "valueUnchecked-XR6AOk"}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
		}
		var choice = this.getChoice();
		settingshtml += `<div class="ui-form-item flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ weightMedium-13x9Y8 size16-3IvaX_ flexChild-1KGW5q" style="flex: 0 0 30%; line-height: 38px;">Creation Date Format:</h3><div class="ui-select format-select-wrapper" style="flex: 1 1 70%;"><div value="${choice}" class="Select Select--single has-value"><div class="Select-control"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-value" style="flex: 1 1 auto;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm languageName" style="flex: 1 1 42%;">${this.languages[choice].name}</div><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm languageTimestamp" style="flex: 1 1 58%;">${this.getCreationTime(this.languages[choice].id)}</div></div><span class="Select-arrow-zone"><span class="Select-arrow"></span></span></div></div></div></div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];
		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {
				this.updateSettings(settingspanel);
				settingspanel.querySelector(".languageTimestamp").innerText = this.getCreationTime(this.languages[this.getChoice()].id);
			})
			.on("click", ".Select-control", (e) => {this.openDropdownMenu(settingspanel, e);});
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"></script>');
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			this.userPopoutObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".userPopout-4pfA0d")) {
									if (this.getSettings().addInUserPopout) this.addCreationDate(node.querySelector(".headerText-3tKBWq"));
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".popouts")) this.userPopoutObserver.observe(document.querySelector(".popouts"), {childList: true});
			
			this.userProfilModalObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(".topSectionPlaying-3jAH9b, .topSectionNormal-2LlRG1")) {
									if (this.getSettings().addInUserProfil) this.addCreationDate(node.querySelector(".headerInfo-Gkqcz9"));
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".app ~ [class^='theme-']")) this.userProfilModalObserver.observe(document.querySelector(".app ~ [class^='theme-']"), {childList: true});
			
			this.languages = Object.assign({},BDfunctionsDevilBro.languages);
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.userPopoutObserver.disconnect();
			this.userProfilModalObserver.disconnect();
			
			if (typeof this.patchCancel === "function") this.patchCancel();
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}

	
	// begin of own functions
	
	getSettings () {
		var oldSettings = BDfunctionsDevilBro.loadAllData(this.getName(), "settings"), newSettings = {}, saveSettings = false;
		for (let key in this.defaultSettings) {
			if (oldSettings[key] == null) {
				newSettings[key] = this.defaultSettings[key].value;
				saveSettings = true;
			}
			else {
				newSettings[key] = oldSettings[key];
			}
		}
		if (saveSettings) BDfunctionsDevilBro.saveAllData(newSettings, this.getName(), "settings");
		return newSettings;
	}

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(".checkbox-1KYsPm")) {
			settings[input.value] = input.checked;
			input.parentElement.classList.toggle("valueChecked-3Bzkbm", input.checked);
			input.parentElement.classList.toggle("valueUnchecked-XR6AOk", !input.checked);
		}
		BDfunctionsDevilBro.saveAllData(settings, this.getName(), "settings");
	}
	
	getChoice () {
		var choice = BDfunctionsDevilBro.loadData("language", this.getName(), "languages"), saveChoice = false;
		if (choice == null || !this.languages[choice]) {
			choice = "$discord";
			saveChoice = true;
		}
		if (saveChoice) BDfunctionsDevilBro.saveData("language", choice, this.getName(), "languages");
		return choice;
	}
	
	openDropdownMenu (settingspanel, e) {
		var selectControl = e.currentTarget;
		var selectWrap = selectControl.parentElement;
		
		if (selectWrap.classList.contains("is-open")) return;
		
		selectWrap.classList.add("is-open");
		$("li").has(settingspanel).css("overflow", "visible");
		
		var selectMenu = this.createDropdownMenu(selectWrap.getAttribute("value"));
		selectWrap.appendChild(selectMenu);
		
		$(selectMenu).on("mousedown." + this.getName(), ".Select-option", (e2) => {
			var language = e2.currentTarget.getAttribute("value");
			selectWrap.setAttribute("value", language);
			selectControl.querySelector(".languageName").innerText = BDfunctionsDevilBro.languages[language].name;
			selectControl.querySelector(".languageTimestamp").innerText = new Date().toLocaleString(BDfunctionsDevilBro.languages[language].id);
			BDfunctionsDevilBro.saveData("language", language, this.getName(), "language");
		});
		$(document).on("mousedown.select" + this.getName(), (e2) => {
			if (e2.target.parentElement == selectMenu) return;
			$(document).off("mousedown.select" + this.getName());
			selectMenu.remove();
			$("li").has(settingspanel).css("overflow", "auto");
			setTimeout(() => {selectWrap.classList.remove("is-open");},100);
		});
	}
	
	createDropdownMenu (choice) {
		var menuhtml = `<div class="Select-menu-outer"><div class="Select-menu">`;
		for (var language in BDfunctionsDevilBro.languages) {
			var isSelected = language == choice ? " is-selected" : "";
			menuhtml += `<div value="${language}" class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignBaseline-4enZzv noWrap-v6g9vO wrapper-1v8p8a Select-option ${isSelected}" style="flex: 1 1 auto; display:flex;"><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm" style="flex: 1 1 42%;">${BDfunctionsDevilBro.languages[language].name}</div><div class="title-3I2bY1 medium-2KnC-N size16-3IvaX_ height20-165WbF primary-2giqSn weightNormal-3gw0Lm" style="flex: 1 1 58%;">${this.getCreationTime(BDfunctionsDevilBro.languages[language].id)}</div></div>`
		}
		menuhtml += `</div></div>`;
		return $(menuhtml)[0];
	}
	
	addCreationDate (container) {
		if (!container) return;
		var info = BDfunctionsDevilBro.getKeyInformation({"node":container,"key":"user"});
		if (info) {
			var creationDate = $(this.creationDateMarkup);
			creationDate.text(this.labels.createdat_text + " " + this.getCreationTime(this.languages[this.getChoice()].id, info.createdAt)).appendTo(container);
		}
	}
	
	getCreationTime (languageid, timestamp = new Date()) {
		return this.getSettings().addCreationTime ? timestamp.toLocaleString(languageid) : timestamp.toLocaleDateString(languageid);
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
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
					createdat_text:				"Creata il"
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
