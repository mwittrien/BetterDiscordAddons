//META{"name":"GoogleSearchReplace","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/GoogleSearchReplace","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/GoogleSearchReplace/GoogleSearchReplace.plugin.js"}*//

var GoogleSearchReplace = (_ => {
	const textUrlReplaceString = "DEVILBRO_BD_GOOGLESEARCHREPLACE_REPLACE_TEXTURL";
	
	return class GoogleSearchReplace {
		getName () {return "GoogleSearchReplace";}

		getVersion () {return "1.2.7";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Replaces the default Google Text Search with a selection menu of several search engines.";}

		constructor () {
			this.changelog = {
				"fixed":[["Context Menu Update","Fixes for the context menu update, yaaaaaay"]]
			};
		}

		initConstructor () {
			this.defaults = {
				settings: {
					useChromium: 		{value:false,	description:"Use an inbuilt browser window instead of opening your default browser"},
				},
				engines: {
					_all: 				{value:true, 	name:BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL, 	url:null},
					Ask: 				{value:true, 	name:"Ask", 				url:"https://ask.com/web?q=" + textUrlReplaceString},
					Bing: 				{value:true, 	name:"Bing", 				url:"https://www.bing.com/search?q=" + textUrlReplaceString},
					DogPile:			{value:true, 	name:"DogPile", 			url:"http://www.dogpile.com/search/web?q=" + textUrlReplaceString},
					DuckDuckGo:			{value:true, 	name:"DuckDuckGo", 			url:"https://duckduckgo.com/?q=" + textUrlReplaceString},
					Google: 			{value:true, 	name:"Google", 				url:"https://www.google.com/search?q=" + textUrlReplaceString},
					GoogleScholar: 		{value:true, 	name:"Google Scholar", 		url:"https://scholar.google.com/scholar?q=" + textUrlReplaceString},
					Quora: 				{value:true, 	name:"Quora", 				url:"https://www.quora.com/search?q=" + textUrlReplaceString},
					Qwant: 				{value:true, 	name:"Qwant", 				url:"https://www.qwant.com/?t=all&q=" + textUrlReplaceString},
					UrbanDictionary: 	{value:true, 	name:"Urban Dictionary", 	url:"https://www.urbandictionary.com/define.php?term=" + textUrlReplaceString},
					Searx: 				{value:true, 	name:"Searx", 				url:"https://searx.me/?q=" + textUrlReplaceString},
					WolframAlpha:		{value:true, 	name:"Wolfram Alpha", 		url:"https://www.wolframalpha.com/input/?i=" + textUrlReplaceString},
					Yandex: 			{value:true, 	name:"Yandex", 				url:"https://yandex.com/search/?text=" + textUrlReplaceString},
					Yahoo: 				{value:true, 	name:"Yahoo", 				url:"https://search.yahoo.com/search?p=" + textUrlReplaceString},
					YouTube: 			{value:true, 	name:"YouTube", 			url:"https://www.youtube.com/results?q=" + textUrlReplaceString}
				}
			};
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let engines = BDFDB.DataUtils.get(this, "engines");
			let settingsPanel, settingsItems = [], engineitems = [];
			
			for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
			}));
			for (let key in engines) engineitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["engines", key],
				label: this.defaults.engines[key].name,
				value: engines[key]
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
				title: "Search Engines:",
				first: settingsItems.length == 0,
				last: true,
				children: engineitems
			}));
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
		}

		// Legacy
		load () {}

		start () {
			if (!window.BDFDB) window.BDFDB = {myPlugins:{}};
			if (window.BDFDB && window.BDFDB.myPlugins && typeof window.BDFDB.myPlugins == "object") window.BDFDB.myPlugins[this.getName()] = this;
			let libraryScript = document.querySelector("head script#BDFDBLibraryScript");
			if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("id", "BDFDBLibraryScript");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", _ => {this.initialize();});
				document.head.appendChild(libraryScript);
			}
			else if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(_ => {
				try {return this.initialize();}
				catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
			}, 30000);
		}

		initialize () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				if (this.started) return;
				BDFDB.PluginUtils.init(this);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		onMessageContextMenu (e) {
			this.injectItem(e);
		}

		onNativeContextMenu (e) {
			this.injectItem(e);
		}
		
		injectItem (e) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props:[["id", "search-google"]]});
			if (index > -1) {
				let text = document.getSelection().toString();
				let enabledEngines = BDFDB.ObjectUtils.filter(BDFDB.DataUtils.get(this, "engines"), n => n);
				let enginesWithoutAll = BDFDB.ObjectUtils.filter(enabledEngines, n => n != "_all", true);
				let engineKeys = Object.keys(enginesWithoutAll);
				if (engineKeys.length == 1) return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuItem, {
					label: this.labels.context_googlesearchreplace_text.replace("...", this.defaults.engines[engineKeys[0]].name),
					id: BDFDB.ContextMenuUtils.createItemId(this.name, "single-search"),
					action: event => {
						let useChromium = BDFDB.DataUtils.get(this, "settings", "useChromium");
						if (!event.shiftKey) BDFDB.ContextMenuUtils.close(e.instance);
						BDFDB.DiscordUtils.openLink(this.defaults.engines[engineKeys[0]].url.replace(textUrlReplaceString, encodeURIComponent(text)), useChromium, event.shiftKey);
					}
				});
				else {
					let items = [];
					for (let key in enabledEngines) items.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.defaults.engines[key].name,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "search", key),
						color: key == "_all" ? BDFDB.LibraryComponents.MenuItems.Colors.DANGER : BDFDB.LibraryComponents.MenuItems.Colors.DEFAULT,
						action: event => {
							let useChromium = BDFDB.DataUtils.get(this, "settings", "useChromium");
							if (!event.shiftKey) BDFDB.ContextMenuUtils.close(e.instance);
							if (key == "_all") {
								for (let key2 in enginesWithoutAll) BDFDB.DiscordUtils.openLink(this.defaults.engines[key2].url.replace(textUrlReplaceString, encodeURIComponent(text)), useChromium, event.shiftKey);
							}
							else BDFDB.DiscordUtils.openLink(this.defaults.engines[key].url.replace(textUrlReplaceString, encodeURIComponent(text)), useChromium, event.shiftKey);
						}
					}));
					if (!items.length) items.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.submenu_disabled_text,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "disabled"),
						disabled: true
					}));
					children.splice(index, 1, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.context_googlesearchreplace_text,
						id: children[index].props.id,
						children: items
					}));
				}
			}
		}

		setLabelsByLanguage () {
			switch (BDFDB.LanguageUtils.getLanguage().id) {
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
})();