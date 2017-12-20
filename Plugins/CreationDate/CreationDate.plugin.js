//META{"name":"CreationDate"}*//

class CreationDate {
	constructor () {
		this.userPopoutObserver = new MutationObserver(() => {});
		this.userProfilModalObserver = new MutationObserver(() => {});
		
		this.labels = {};
		
		this.creationDateMarkup = `<div class="creationDate nameNormal-1LgIgN textRow-1_JoJf"></div>`
		
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
			addInUserPopout:		{value:true, 	description:"User Popouts"},
			addInUserProfil:		{value:true, 	description:"User Profil Modal"}
		};
	}

	getName () {return "CreationDate";}

	getDescription () {return "Displays the Creation Date of an Account in the UserPopout and UserModal.";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			var settingshtml = `<div class="${this.getName()}-settings"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">Add Creation Date in:</h3></div><div class="inner-tqJwAU" style=" margin: 0;">`;
			var settings = this.getSettings(); 
			for (let key in settings) {
				settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto; margin-top: 0;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaultSettings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU ${settings[key] ? "valueChecked-3Bzkbm" : "valueUnchecked-XR6AOk"}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
			}
			settingshtml += `</div>`;
			settingshtml += `</div>`;
			
			var settingspanel = $(settingshtml)[0];
			$(settingspanel)
				.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);});
			return settingspanel;
		}
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
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			BDfunctionsDevilBro.translatePlugin(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.userPopoutObserver.disconnect();
			this.userProfilModalObserver.disconnect();
			
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
	
	addCreationDate (container) {
		if (!container) return;
		var info = BDfunctionsDevilBro.getKeyInformation({"node":container,"key":"user"});
		if (info) {
			var creationDate = $(this.creationDateMarkup);
			var timestamp = new Date((info.id / 4194304) + 1420070400000);
			var language = BDfunctionsDevilBro.getDiscordLanguage().id;
			creationDate.text(this.labels.createdat_text + " " + timestamp.toLocaleString(language)).appendTo(container);
		}
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
			case "pt":		//portuguese (brazil)
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
			case "zh":		//chinese (traditional)
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