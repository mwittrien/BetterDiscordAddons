//META{"name":"GoogleSearchReplace"}*//

class GoogleSearchReplace {
	constructor () {
		
		this.labels = {};
		
		this.messageContextObserver = new MutationObserver(() => {});
		
		this.textUrlReplaceString = "DEVILBRO_BD_GOOGLESEARCHREPLACE_REPLACE_TEXTURL";
		
		this.searchEngines = [
			{"name":"Ask", 				"url":"https://ask.com/web?q=" + this.textUrlReplaceString},
			{"name":"Bing", 			"url":"https://www.bing.com/search?q=" + this.textUrlReplaceString},
			{"name":"DogPile",			"url":"http://www.dogpile.com/search/web?q=" + this.textUrlReplaceString},
			{"name":"DuckDuckGo",		"url":"https://duckduckgo.com/?q=" + this.textUrlReplaceString},
			{"name":"Google", 			"url":"https://www.google.com/search?q=" + this.textUrlReplaceString},
			{"name":"Google Scholar", 	"url":"https://scholar.google.com/scholar?q=" + this.textUrlReplaceString},
			{"name":"Quora", 			"url":"https://www.quora.com/search?q=" + this.textUrlReplaceString},
			{"name":"WolframAlpha",		"url":"https://www.wolframalpha.com/input/?i=" + this.textUrlReplaceString},
			{"name":"Yandex", 			"url":"https://yandex.com/search/?text=" + this.textUrlReplaceString},
			{"name":"Yahoo", 			"url":"https://search.yahoo.com/search?p=" + this.textUrlReplaceString}
		];

		this.messageContextEntryMarkup =
			`<div class="item googlereplacesearch-item item-subMenu">
				<span>REPLACE_context_googlesearchreplace_text</span>
				<div class="hint"></div>
			</div>`;
			
			
		this.messageContextSubMenuMarkup = 
			`<div class="context-menu googleReplaceSearchSubMenu">
				<div class="item-group">
					<div class="item alldisabled-item disabled">
						<span>REPLACE_submenu_disabled_text</span>
						<div class="hint"></div>
					</div>
					${ this.searchEngines.map((val, i) => `<div class="item ${val.name.replace(new RegExp(" ", 'g'), "")} GRS-item"><span>${val.name}</span><div class="hint"></div></div>`).join("")}
				</div>
			</div>`;
	}
		
		
	getName () {return "GoogleSearchReplace";}

	getDescription () {return "Replaces the default Google Text Search with a selection menu of several search engines.";}

	getVersion () {return "1.0.3";}
	
	getAuthor () {return "DevilBro";}

    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			var settings = this.getSettings();
			var settingspanel = `<label style="color:grey;">Search Engines</label><br>\n`;
			for (var i in this.searchEngines) {
				var engine = this.searchEngines[i].name;
				var checked = settings[engine] ? " checked" : "";
				settingspanel += `<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="` + engine + `"` + checked + `> ` + engine + `</label><br>\n`;
			}
			
			return settingspanel;
		}
    }
	
	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
			
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
			
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
		}
	}
	
	// begin of own functions
	
	getSettings () {
		var defaultSettings = {
			enableEmojiHovering: true,
			enableEmojiStatisticsButton: true
		};
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

    static updateSettings (ele, pluginName) {
		var settingspanel = BDfunctionsDevilBro.getSettingsPanelDiv(ele);
		var settings = {};
		var inputs = settingspanel.querySelectorAll("input");
		for (var i = 0; i < inputs.length; i++) {
			settings[inputs[i].value] = inputs[i].checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, pluginName, "settings");
    }
	
	changeLanguageStrings () {
		this.messageContextEntryMarkup = 	this.messageContextEntryMarkup.replace("REPLACE_context_googlesearchreplace_text", this.labels.context_googlesearchreplace_text);
		
		this.messageContextSubMenuMarkup = 	this.messageContextSubMenuMarkup.replace("REPLACE_submenu_disabled_text", this.labels.submenu_disabled_text);
	}
	
	onContextMenu (context) {
		var groups = $(context).find(".item-group");
		for (let i = 0; i < groups.length; i++) {
			var group = groups[i];
			if (BDfunctionsDevilBro.getKeyInformation({"node":group, "key":"handleSearchWithGoogle"})) {
				var text = BDfunctionsDevilBro.getKeyInformation({"node":group, "key":"value"});
				if (text) {
					$(group).find(".item").hide();
					var data = {"text":text};
					$(group).append(this.messageContextEntryMarkup)
						.on("mouseenter", ".googlereplacesearch-item", data, this.createContextSubMenu.bind(this))
						.on("mouseleave", ".googlereplacesearch-item", data, this.deleteContextSubMenu.bind(this));
				}
				break;
			}
		}
	}
	
	createContextSubMenu (e) {
		var targetDiv = e.currentTarget;
		var searchtext = encodeURIComponent(e.data.text);
		var messageContextSubMenu = $(this.messageContextSubMenuMarkup);
		$(targetDiv).append(messageContextSubMenu)
			.off("click", ".GRS-item")
			.on("click", ".GRS-item", (e) => {
				$(".context-menu").hide();
				
				var choice = e.target.tagName != "SPAN" ? e.target : e.target.parentNode;
				for (var i in this.searchEngines) {
					var engine = this.searchEngines[i].name;
					if (choice.classList.contains(engine.replace(new RegExp(" ", 'g'), ""))) {
						var searchurl = this.searchEngines[i].url;
						searchurl = searchurl.replace(this.textUrlReplaceString,searchtext);
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
		if ($(".googleReplaceSearchSubMenu .GRS-item").length > 0) {$(targetDiv).find(".alldisabled-item").remove();};
	}
	
	deleteContextSubMenu (e) {
		$(".googleReplaceSearchSubMenu").remove();
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "da": 	//danish
				return {
					context_googlesearchreplace_text: 	"Søg med ...",
					submenu_disabled_text: 				"Alle deaktiveret"
				};
			case "de": 	//german
				return {
					context_googlesearchreplace_text: 	"Suche mit ...",
					submenu_disabled_text: 				"Alle deaktiviert"
				};
			case "es": 	//spanish
				return {
					context_googlesearchreplace_text: 	"Buscar con ...",
					submenu_disabled_text: 				"Todo desactivado"
				};
			case "fr": 	//french
				return {
					context_googlesearchreplace_text: 	"Rechercher avec ...",
					submenu_disabled_text: 				"Tous désactivés"
				};
			case "it": 	//italian
				return {
					context_googlesearchreplace_text: 	"Cerca con ...",
					submenu_disabled_text: 				"Tutto disattivato"
				};
			case "nl": 	//dutch
				return {
					context_googlesearchreplace_text: 	"Zoeken met ...",
					submenu_disabled_text: 				"Alles gedeactiveerd"
				};
			case "no": 	//norwegian
				return {
					context_googlesearchreplace_text: 	"Søk med ...",
					submenu_disabled_text: 				"Alle deaktivert"
				};
			case "pl": 	//polish
				return {
					context_googlesearchreplace_text:	"Szukaj za pomocą ...",
                    submenu_disabled_text:				"Wszystkie wyłączone"
				};
			case "pt": 	//portuguese (brazil)
				return {
					context_googlesearchreplace_text: 	"Pesquisar com ...",
					submenu_disabled_text: 				"Todos desativados"
				};
			case "fi": 	//finnish
				return {
					context_googlesearchreplace_text: 	"Etsi ...",
					submenu_disabled_text: 				"Kaikki on poistettu käytöstä"
				};
			case "sv": 	//swedish
				return {
					context_googlesearchreplace_text: 	"Sök med ...",
					submenu_disabled_text: 				"Alla avaktiverade"
				};
			case "tr": 	//turkish
				return {
					context_googlesearchreplace_text: 	"Ile ara ...",
					submenu_disabled_text: 				"Hepsi deaktive"
				};
			case "cs": 	//czech
				return {
					context_googlesearchreplace_text: 	"Hledat s ...",
					submenu_disabled_text: 				"Všechny deaktivované"
				};
			case "bg": 	//bulgarian
				return {
					context_googlesearchreplace_text: 	"Търсене с ...",
					submenu_disabled_text: 				"Всички са деактивирани"
				};
			case "ru": 	//russian
				return {
					context_googlesearchreplace_text: 	"Поиск с ...",
					submenu_disabled_text: 				"Все деактивированные"
				};
			case "uk": 	//ukrainian
				return {
					context_googlesearchreplace_text: 	"Пошук з ...",
					submenu_disabled_text: 				"Всі вимкнені"
				};
			case "ja": 	//japanese
				return {
					context_googlesearchreplace_text: 	"で検索する ...",
					submenu_disabled_text: 				"すべて非アクティブ化"
				};
			case "zh": 	//chinese (traditional)
				return {
					context_googlesearchreplace_text: 	"搜索 ...",
					submenu_disabled_text: 				"全部停用"
				};
			case "ko": 	//korean
				return {
					context_googlesearchreplace_text: 	"다음으로 검색 ...",
					submenu_disabled_text: 				"모두 비활성화 됨"
				};
			default: 	//default: english
				return {
					context_googlesearchreplace_text: 	"Search with ...",
					submenu_disabled_text: 				"All disabled"
				};
		}
	}
}
