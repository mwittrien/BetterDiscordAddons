//META{"name":"ReverseImageSearch"}*//

class ReverseImageSearch {
	constructor () {
		this.messageContextObserver = new MutationObserver(() => {});
		
		this.imageUrlReplaceString = "DEVILBRO_BD_REVERSEIMAGESEARCH_REPLACE_IMAGEURL";
		
		this.searchEngines = [
			{"name":"Baidu", 	"url":"http://image.baidu.com/pcdutu?queryImageUrl=" + this.imageUrlReplaceString},
			{"name":"Bing", 	"url":"https://www.bing.com/images/search?q=imgurl:" + this.imageUrlReplaceString + "&view=detailv2&iss=sbi&FORM=IRSBIQ"},
			{"name":"Google", 	"url":"https://images.google.com/searchbyimage?image_url=" + this.imageUrlReplaceString},
			{"name":"IQDB",		"url":"https://iqdb.org/?url=" + this.imageUrlReplaceString},
			{"name":"Reddit", 	"url":"http://karmadecay.com/search?q=" + this.imageUrlReplaceString},
			{"name":"Sogou", 	"url":"http://pic.sogou.com/ris?flag=1&drag=0&query=" + this.imageUrlReplaceString + "&flag=1"},
			{"name":"TinEye", 	"url":"https://tineye.com/search?url=" + this.imageUrlReplaceString},
			{"name":"Yandex", 	"url":"https://yandex.com/images/search?url=" + this.imageUrlReplaceString + "&rpt=imageview"}
		];

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
					${ this.searchEngines.map((val, i) => `<div class="item ${val.name.replace(new RegExp(" ", 'g'), "")} RIS-item"><span>${val.name}</span><div class="hint"></div></div>`).join("")}
				</div>
			</div>`;
	}
		
		
	getName () {return "ReverseImageSearch";}

	getDescription () {return "Adds a reverse image search option to the context menu.";}

	getVersion () {return "3.2.6";}
	
	getAuthor () {return "DevilBro";}

    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			var settings = this.getSettings();
			var settingshtml = `<div class="${this.getName()}-settings"><label style="color:grey;">Reverse Search Engines:</label><br>`;
			for (var i in this.searchEngines) {
				var engine = this.searchEngines[i].name;
				var checked = settings[engine] ? " checked" : "";
				settingshtml += `<label style="color:grey;"><input class="settings-checkbox" type="checkbox" value="${engine}"${checked}>${engine}</label><br>`;
			}
			settingshtml += `</div>`;
			var settingspanel = $(settingshtml)[0];
			$(settingspanel)
				.on("change", ".settings-checkbox", () => {this.updateSettings(settingspanel);});
			return settingspanel;
		}
    }
	
	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBroBeta.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBroBeta.js"></script>');
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
			
			this.searchEngines = BDfunctionsDevilBro.sortArrayByKey(this.searchEngines, "name");
			
			BDfunctionsDevilBro.translatePlugin(this);
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
		var settings = BDfunctionsDevilBro.loadAllData(this.getName(), "settings");
		var saveSettings = false;
		for (var i in this.searchEngines) {
			var key = this.searchEngines[i].name;
			if (settings[key] == null) {
				settings[key] = settings[key] ? settings[key] : true;
				saveSettings = true;
			}
		}
		if (saveSettings) {
			BDfunctionsDevilBro.saveAllData(settings, this.getName(), "settings");
		}
		return settings;
	}

    updateSettings (settingspanel) {
		var settings = {};
		var inputs = settingspanel.querySelectorAll(".settings-checkbox");
		for (var i = 0; i < inputs.length; i++) {
			settings[inputs[i].value] = inputs[i].checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, this.getName(), "settings");
    }
	
	changeLanguageStrings () {
		this.messageContextSubMenuMarkup = 	this.messageContextSubMenuMarkup.replace("REPLACE_submenu_disabled_text", this.labels.submenu_disabled_text);
	}
	
	onContextMenu (context) {
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
					
				var data = {"url": url};
				$(context).append(this.messageContextEntryMarkup)
					.on("mouseenter", ".reverseimagesearch-item", data, this.createContextSubMenu.bind(this))
					.on("mouseleave", ".reverseimagesearch-item", data, this.deleteContextSubMenu.bind(this));
			}
		}
	}
	
	createContextSubMenu (e) {
		var targetDiv = e.currentTarget;
		var imageurl = e.data.url;
		var messageContextSubMenu = $(this.messageContextSubMenuMarkup);
		$(targetDiv).append(messageContextSubMenu)
			.off("click", ".RIS-item")
			.on("click", ".RIS-item", (e2) => {
				$(".context-menu").hide();
				var choice = e2.currentTarget;
				for (var i in this.searchEngines) {
					var engine = this.searchEngines[i].name;
					if (choice.classList.contains(engine.replace(new RegExp(" ", 'g'), ""))) {
						var searchurl = this.searchEngines[i].url;
						searchurl = searchurl.replace(this.imageUrlReplaceString,imageurl);
						window.open(searchurl, "_blank");
						break;
					}
				}
				
			});
		$(messageContextSubMenu)
			.addClass(BDfunctionsDevilBro.getDiscordTheme())
			.css("left", $(targetDiv).offset().left + "px")
			.css("top", $(targetDiv).offset().top + "px");
		
		var settings = this.getSettings();
		for (var key in settings) {
			if (!settings[key]) {
				$(targetDiv).find("." + key.replace(new RegExp(" ", 'g'), "")).remove();
			}
		}
		if ($(".reverseImageSearchSubMenu .RIS-item").length > 0) {$(targetDiv).find(".alldisabled-item").remove();};
	}
	
	deleteContextSubMenu (e) {
		$(".reverseImageSearchSubMenu").remove();
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "da": 	//danish
				return {
					submenu_disabled_text: 				"Alle deaktiveret"
				};
			case "de": 	//german
				return {
					submenu_disabled_text: 				"Alle deaktiviert"
				};
			case "es": 	//spanish
				return {
					submenu_disabled_text: 				"Todo desactivado"
				};
			case "fr": 	//french
				return {
					submenu_disabled_text: 				"Tous désactivés"
				};
			case "it": 	//italian
				return {
					submenu_disabled_text: 				"Tutto disattivato"
				};
			case "nl": 	//dutch
				return {
					submenu_disabled_text: 				"Alles gedeactiveerd"
				};
			case "no": 	//norwegian
				return {
					submenu_disabled_text: 				"Alle deaktivert"
				};
			case "pl": 	//polish
				return {
					submenu_disabled_text: 				"Wszystkie wyłączone"
				};
			case "pt": 	//portuguese (brazil)
				return {
					submenu_disabled_text: 				"Todos desativados"
				};
			case "fi": 	//finnish
				return {
					submenu_disabled_text: 				"Kaikki on poistettu käytöstä"
				};
			case "sv": 	//swedish
				return {
					submenu_disabled_text: 				"Alla avaktiverade"
				};
			case "tr": 	//turkish
				return {
					submenu_disabled_text: 				"Hepsi deaktive"
				};
			case "cs": 	//czech
				return {
					submenu_disabled_text: 				"Všechny deaktivované"
				};
			case "bg": 	//bulgarian
				return {
					submenu_disabled_text: 				"Всички са деактивирани"
				};
			case "ru": 	//russian
				return {
					submenu_disabled_text: 				"Все деактивированные"
				};
			case "uk": 	//ukrainian
				return {
					submenu_disabled_text: 				"Всі вимкнені"
				};
			case "ja": 	//japanese
				return {
					submenu_disabled_text: 				"すべて非アクティブ化"
				};
			case "zh": 	//chinese (traditional)
				return {
					submenu_disabled_text: 				"全部停用"
				};
			case "ko": 	//korean
				return {
					submenu_disabled_text: 				"모두 비활성화 됨"
				};
			default: 	//default: english
				return {
					submenu_disabled_text: 				"All disabled"
				};
		}
	}
}
