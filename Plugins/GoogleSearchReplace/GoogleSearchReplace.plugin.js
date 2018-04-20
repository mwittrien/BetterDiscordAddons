//META{"name":"GoogleSearchReplace"}*//

class GoogleSearchReplace {
	constructor () {
		this.labels = {};
		
		this.textUrlReplaceString = "DEVILBRO_BD_GOOGLESEARCHREPLACE_REPLACE_TEXTURL";
		
		this.defaults = {
			engines: {
				Ask: 			{value:true, 	name:"Ask", 			url:"https://ask.com/web?q=" + this.textUrlReplaceString},
				Bing: 			{value:true, 	name:"Bing", 			url:"https://www.bing.com/search?q=" + this.textUrlReplaceString},
				DogPile:		{value:true, 	name:"DogPile", 		url:"http://www.dogpile.com/search/web?q=" + this.textUrlReplaceString},
				DuckDuckGo:		{value:true, 	name:"DuckDuckGo", 		url:"https://duckduckgo.com/?q=" + this.textUrlReplaceString},
				Google: 		{value:true, 	name:"Google", 			url:"https://www.google.com/search?q=" + this.textUrlReplaceString},
				GoogleScholar: 	{value:true, 	name:"Google Scholar", 	url:"https://scholar.google.com/scholar?q=" + this.textUrlReplaceString},
				Quora: 			{value:true, 	name:"Quora", 			url:"https://www.quora.com/search?q=" + this.textUrlReplaceString},
				Qwant: 			{value:true, 	name:"Qwant", 			url:"https://www.qwant.com/?t=all&q=" + this.textUrlReplaceString},
				Searx: 			{value:true, 	name:"Searx", 			url:"https://searx.me/?q=" + this.textUrlReplaceString},
				WolframAlpha:	{value:true, 	name:"Wolfram Alpha", 	url:"https://www.wolframalpha.com/input/?i=" + this.textUrlReplaceString},
				Yandex: 		{value:true, 	name:"Yandex", 			url:"https://yandex.com/search/?text=" + this.textUrlReplaceString},
				Yahoo: 			{value:true, 	name:"Yahoo", 			url:"https://search.yahoo.com/search?p=" + this.textUrlReplaceString},
				YouTube: 		{value:true, 	name:"YouTube", 		url:"https://www.youtube.com/results?q=" + this.textUrlReplaceString}
			}
		};

		this.messageContextEntryMarkup =
			`<div class="item-1XYaYf googlereplacesearch-item itemSubMenu-3ZgIw-">
				<span>REPLACE_context_googlesearchreplace_text</span>
				<div class="hint-3TJykr"></div>
			</div>`;
			
		this.messageContextSubMenuMarkup = 
			`<div class="contextMenu-uoJTbz googleReplaceSearchSubMenu">
				<div class="itemGroup-oViAgA itemGroup-oViAgA">
					<div class="item-1XYaYf alldisabled-item disabled-dlOjhg">
						<span>REPLACE_submenu_disabled_text</span>
						<div class="hint-3TJykr"></div>
					</div>
					${Object.keys(this.defaults.engines).map((key, i) => `<div engine="${key}" class="item-1XYaYf GRS-item"><span>${this.defaults.engines[key].name}</span><div class="hint-3TJykr"></div></div>`).join("")}
				</div>
			</div>`;
	}
		
	getName () {return "GoogleSearchReplace";}

	getDescription () {return "Replaces the default Google Text Search with a selection menu of several search engines.";}

	getVersion () {return "1.1.2";}
	
	getAuthor () {return "DevilBro";}

	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var engines = BDfunctionsDevilBro.getAllData(this, "engines");
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 0 0 auto;">Search Engines:</h3></div><div class="DevilBro-settings-inner-list">`;
		for (let key in engines) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.engines[key].name}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${engines[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);});
			
		return settingspanel;
	}
	
	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDfunctionsDevilBro === "object") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.nodeType == 1 && node.className.includes("contextMenu-uoJTbz")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			BDfunctionsDevilBro.addObserver(this, "#app-mount", {name:"messageContextObserver",instance:observer}, {childList: true});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(".checkbox-1KYsPm")) {
			settings[input.value] = input.checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, this, "engines");
	}
	
	changeLanguageStrings () {
		this.messageContextEntryMarkup = 	this.messageContextEntryMarkup.replace("REPLACE_context_googlesearchreplace_text", this.labels.context_googlesearchreplace_text);
		
		this.messageContextSubMenuMarkup = 	this.messageContextSubMenuMarkup.replace("REPLACE_submenu_disabled_text", this.labels.submenu_disabled_text);
	}
	
	onContextMenu (context) {
		if (!context || !context.tagName || !context.parentElement || context.querySelector(".googlereplacesearch-item")) return;
		for (let group of context.querySelectorAll(".itemGroup-oViAgA")) {
			if (BDfunctionsDevilBro.getKeyInformation({"node":group, "key":"handleSearchWithGoogle"})) {
				var text = BDfunctionsDevilBro.getKeyInformation({"node":group, "key":"value"});
				if (text) {
					$(group).find(".item-1XYaYf").hide();
					$(group).append(this.messageContextEntryMarkup)
						.on("mouseenter", ".googlereplacesearch-item", (e) => {
							this.createContextSubMenu(text, e, context);
						});
				
					BDfunctionsDevilBro.updateContextPosition(context);
				}
				break;
			}
		}
	}
	
	createContextSubMenu (text, e, context) {
		var messageContextSubMenu = $(this.messageContextSubMenuMarkup);
		
		messageContextSubMenu
			.on("click", ".GRS-item", (e2) => {
				$(context).hide();
				var engine = e2.currentTarget.getAttribute("engine");
				window.open(this.defaults.engines[engine].url.replace(this.textUrlReplaceString, encodeURIComponent(text)), "_blank");
			});
		
		var engines = BDfunctionsDevilBro.getAllData(this, "engines");
		for (let key in engines) {
			if (!engines[key]) messageContextSubMenu.find("[engine='" + key + "']").remove();
		}
		if (messageContextSubMenu.find(".GRS-item").length > 0) {
			messageContextSubMenu.find(".alldisabled-item").remove();
		}
		
		BDfunctionsDevilBro.appendSubMenu(e.currentTarget, messageContextSubMenu);
	}
	
	setLabelsByLanguage () {
		switch (BDfunctionsDevilBro.getDiscordLanguage().id) {
			case "hr":		//croatian
				return {
					context_googlesearchreplace_text:	"Pretražujte s ...",
					submenu_disabled_text:				"Svi su onemogućeni"
				};
			case "da":		//danish
				return {
					context_googlesearchreplace_text:	"Søg med ...",
					submenu_disabled_text:				"Alle deaktiveret"
				};
			case "de":		//german
				return {
					context_googlesearchreplace_text:	"Suche mit ...",
					submenu_disabled_text:				"Alle deaktiviert"
				};
			case "es":		//spanish
				return {
					context_googlesearchreplace_text:	"Buscar con ...",
					submenu_disabled_text:				"Todo desactivado"
				};
			case "fr":		//french
				return {
					context_googlesearchreplace_text:	"Rechercher avec ...",
					submenu_disabled_text:				"Tous désactivés"
				};
			case "it":		//italian
				return {
					context_googlesearchreplace_text:	"Cerca con ...",
					submenu_disabled_text:				"Tutto disattivato"
				};
			case "nl":		//dutch
				return {
					context_googlesearchreplace_text:	"Zoeken met ...",
					submenu_disabled_text:				"Alles gedeactiveerd"
				};
			case "no":		//norwegian
				return {
					context_googlesearchreplace_text:	"Søk med ...",
					submenu_disabled_text:				"Alle deaktivert"
				};
			case "pl":		//polish
				return {
					context_googlesearchreplace_text:	"Szukaj za pomocą ...",
					submenu_disabled_text:				"Wszystkie wyłączone"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_googlesearchreplace_text:	"Pesquisar com ...",
					submenu_disabled_text:				"Todos desativados"
				};
			case "fi":		//finnish
				return {
					context_googlesearchreplace_text:	"Etsi ...",
					submenu_disabled_text:				"Kaikki on poistettu käytöstä"
				};
			case "sv":		//swedish
				return {
					context_googlesearchreplace_text:	"Sök med ...",
					submenu_disabled_text:				"Alla avaktiverade"
				};
			case "tr":		//turkish
				return {
					context_googlesearchreplace_text:	"Ile ara ...",
					submenu_disabled_text:				"Hepsi deaktive"
				};
			case "cs":		//czech
				return {
					context_googlesearchreplace_text:	"Hledat s ...",
					submenu_disabled_text:				"Všechny deaktivované"
				};
			case "bg":		//bulgarian
				return {
					context_googlesearchreplace_text:	"Търсене с ...",
					submenu_disabled_text:				"Всички са деактивирани"
				};
			case "ru":		//russian
				return {
					context_googlesearchreplace_text:	"Поиск с ...",
					submenu_disabled_text:				"Все деактивированные"
				};
			case "uk":		//ukrainian
				return {
					context_googlesearchreplace_text:	"Пошук з ...",
					submenu_disabled_text:				"Всі вимкнені"
				};
			case "ja":		//japanese
				return {
					context_googlesearchreplace_text:	"で検索する ...",
					submenu_disabled_text:				"すべて非アクティブ化"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_googlesearchreplace_text:	"搜索 ...",
					submenu_disabled_text:				"全部停用"
				};
			case "ko":		//korean
				return {
					context_googlesearchreplace_text:	"다음으로 검색 ...",
					submenu_disabled_text:				"모두 비활성화 됨"
				};
			default:		//default: english
				return {
					context_googlesearchreplace_text:	"Search with ...",
					submenu_disabled_text:				"All disabled"
				};
		}
	}
}
