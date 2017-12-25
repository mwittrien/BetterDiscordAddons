//META{"name":"ReverseImageSearch"}*//

class ReverseImageSearch {
	constructor () {
		this.messageContextObserver = new MutationObserver(() => {});
		
		this.imageUrlReplaceString = "DEVILBRO_BD_REVERSEIMAGESEARCH_REPLACE_IMAGEURL";
		
		this.searchEngines = {
			Baidu: 		{value:true, 	name:"Baidu", 		url:"http://image.baidu.com/pcdutu?queryImageUrl=" + this.imageUrlReplaceString},
			Bing: 		{value:true, 	name:"Bing", 		url:"https://www.bing.com/images/search?q=imgurl:" + this.imageUrlReplaceString + "&view=detailv2&iss=sbi&FORM=IRSBIQ"},
			Google:		{value:true, 	name:"Google", 		url:"https://images.google.com/searchbyimage?image_url=" + this.imageUrlReplaceString},
			IQDB:		{value:true, 	name:"IQDB", 		url:"https://iqdb.org/?url=" + this.imageUrlReplaceString},
			Reddit: 	{value:true, 	name:"Reddit", 		url:"http://karmadecay.com/search?q=" + this.imageUrlReplaceString},
			SauceNAO: 	{value:true, 	name:"SauceNAO", 	url:"https://saucenao.com/search.php?db=999&url=" + this.imageUrlReplaceString},
			Sogou: 		{value:true, 	name:"Sogou", 		url:"http://pic.sogou.com/ris?flag=1&drag=0&query=" + this.imageUrlReplaceString + "&flag=1"},
			TinEye:		{value:true, 	name:"TinEye", 		url:"https://tineye.com/search?url=" + this.imageUrlReplaceString},
			Yandex: 	{value:true, 	name:"Yandex", 		url:"https://yandex.com/images/search?url=" + this.imageUrlReplaceString + "&rpt=imageview"}
		};

		this.messageContextEntryMarkup =
			`<div class="item-group">
				<div class="item reverseimagesearch-item item-subMenu">
					<span>Reverse Image Search</span>
					<div class="hint"></div>
				</div>
			</div>`;
			
			
		this.messageContextSubMenuMarkup = 
			`<div class="context-menu reverseImageSearchSubMenu">
				<div class="item-group">
					<div class="item alldisabled-item disabled">
						<span>REPLACE_submenu_disabled_text</span>
						<div class="hint"></div>
					</div>
					${Object.keys(this.searchEngines).map((key, i) => `<div class="item ${key} RIS-item"><span>${this.searchEngines[key].name}</span><div class="hint"></div></div>`).join("")}
				</div>
			</div>`;
	}
		
		
	getName () {return "ReverseImageSearch";}

	getDescription () {return "Adds a reverse image search option to the context menu.";}

	getVersion () {return "3.3.0";}
	
	getAuthor () {return "DevilBro";}

	getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			var settings = this.getSettings();
			var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">Search Engines:</h3></div><div class="DevilBro-settings-inner-list">`;
			for (let key in settings) {
				settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.searchEngines[key].name}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU ${settings[key] ? "valueChecked-3Bzkbm" : "valueUnchecked-XR6AOk"}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
			}
			settingshtml += `</div>`;
			settingshtml += `</div></div>`;
			
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
			
			this.messageContextObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.nodeType == 1 && node.className.includes("context-menu")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".app")) this.messageContextObserver.observe(document.querySelector(".app"), {childList: true});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.messageContextObserver.disconnect();
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	// begin of own functions
	
	getSettings () {
		var oldSettings = BDfunctionsDevilBro.loadAllData(this.getName(), "settings"), newSettings = {}, saveSettings = false;
		for (let key in this.searchEngines) {
			if (oldSettings[key] == null) {
				newSettings[key] = this.searchEngines[key].value;
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
	
	changeLanguageStrings () {
		this.messageContextSubMenuMarkup = 	this.messageContextSubMenuMarkup.replace("REPLACE_submenu_disabled_text", this.labels.submenu_disabled_text);
	}
	
	onContextMenu (context) {
		if (!context || !context.tagName || !context.parentElement || context.querySelector(".reverseimagesearch-item")) return;
		var url = BDfunctionsDevilBro.getKeyInformation({"node":context, "key":"src"});
		if (url) {
			if (url.indexOf("discordapp.com/assets/") == -1) {
				if (url.indexOf("https://images-ext-1.discordapp.net/external/") > -1) {
					if (url.split("/https/").length != 1) {
						url = "https://" + url.split("/https/")[url.split("/https/").length-1];
					}
					else if (url.split("/http/").length != 1) {
						url = "http://" + url.split("/http/")[url.split("/http/").length-1];
					}
				}
					
				$(context).append(this.messageContextEntryMarkup)
					.on("mouseenter", ".reverseimagesearch-item", (e) => {
						this.createContextSubMenu(url, e);
					});
			}
		}
	}
	
	createContextSubMenu (imageurl, e) {
		var messageContextSubMenu = $(this.messageContextSubMenuMarkup);
		
		messageContextSubMenu
			.on("click", ".RIS-item", (e2) => {
				$(".context-menu").hide();
				for (let key in this.searchEngines) {
					if (e2.currentTarget.classList.contains(key)) {
						var searchurl = this.searchEngines[key].url;
						searchurl = searchurl.replace(this.imageUrlReplaceString, imageurl);
						window.open(searchurl, "_blank");
						break;
					}
				}
			});
		
		var settings = this.getSettings();
		for (let key in settings) {
			if (!settings[key]) messageContextSubMenu.find("." + key).remove();
		}
		if (messageContextSubMenu.find(".RIS-item").length > 0) {
			messageContextSubMenu.find(".alldisabled-item").remove();
		}
		
		BDfunctionsDevilBro.appendSubMenu(e.currentTarget, messageContextSubMenu);
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					submenu_disabled_text:				"Svi su onemogućeni"
				};
			case "da":		//danish
				return {
					submenu_disabled_text:				"Alle deaktiveret"
				};
			case "de":		//german
				return {
					submenu_disabled_text:				"Alle deaktiviert"
				};
			case "es":		//spanish
				return {
					submenu_disabled_text:				"Todo desactivado"
				};
			case "fr":		//french
				return {
					submenu_disabled_text:				"Tous désactivés"
				};
			case "it":		//italian
				return {
					submenu_disabled_text:				"Tutto disattivato"
				};
			case "nl":		//dutch
				return {
					submenu_disabled_text:				"Alles gedeactiveerd"
				};
			case "no":		//norwegian
				return {
					submenu_disabled_text:				"Alle deaktivert"
				};
			case "pl":		//polish
				return {
					submenu_disabled_text:				"Wszystkie wyłączone"
				};
			case "pt":		//portuguese (brazil)
				return {
					submenu_disabled_text:				"Todos desativados"
				};
			case "fi":		//finnish
				return {
					submenu_disabled_text:				"Kaikki on poistettu käytöstä"
				};
			case "sv":		//swedish
				return {
					submenu_disabled_text:				"Alla avaktiverade"
				};
			case "tr":		//turkish
				return {
					submenu_disabled_text:				"Hepsi deaktive"
				};
			case "cs":		//czech
				return {
					submenu_disabled_text:				"Všechny deaktivované"
				};
			case "bg":		//bulgarian
				return {
					submenu_disabled_text:				"Всички са деактивирани"
				};
			case "ru":		//russian
				return {
					submenu_disabled_text:				"Все деактивированные"
				};
			case "uk":		//ukrainian
				return {
					submenu_disabled_text:				"Всі вимкнені"
				};
			case "ja":		//japanese
				return {
					submenu_disabled_text:				"すべて非アクティブ化"
				};
			case "zh":		//chinese (traditional)
				return {
					submenu_disabled_text:				"全部停用"
				};
			case "ko":		//korean
				return {
					submenu_disabled_text:				"모두 비활성화 됨"
				};
			default:		//default: english
				return {
					submenu_disabled_text:				"All disabled"
				};
		}
	}
}
