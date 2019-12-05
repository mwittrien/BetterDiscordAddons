//META{"name":"GoogleSearchReplace","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/GoogleSearchReplace","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/GoogleSearchReplace/GoogleSearchReplace.plugin.js"}*//

class GoogleSearchReplace {
	getName () {return "GoogleSearchReplace";}

	getVersion () {return "1.2.3";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Replaces the default Google Text Search with a selection menu of several search engines.";}

	constructor () {
		this.changelog = {
			"improved":[["Inbuilt Window","Option to use an inbuilt browser instead of the default OS browser"],["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};
	}

	initConstructor () {
		this.textUrlReplaceString = "DEVILBRO_BD_GOOGLESEARCHREPLACE_REPLACE_TEXTURL";

		this.defaults = {
			settings: {
				useChromium: 		{value:false,	description:"Use an inbuilt browser window instead of opening your default browser"},
			},
			engines: {
				_all: 				{value:true, 	name:BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL, 	url:null},
				Ask: 				{value:true, 	name:"Ask", 				url:"https://ask.com/web?q=" + this.textUrlReplaceString},
				Bing: 				{value:true, 	name:"Bing", 				url:"https://www.bing.com/search?q=" + this.textUrlReplaceString},
				DogPile:			{value:true, 	name:"DogPile", 			url:"http://www.dogpile.com/search/web?q=" + this.textUrlReplaceString},
				DuckDuckGo:			{value:true, 	name:"DuckDuckGo", 			url:"https://duckduckgo.com/?q=" + this.textUrlReplaceString},
				Google: 			{value:true, 	name:"Google", 				url:"https://www.google.com/search?q=" + this.textUrlReplaceString},
				GoogleScholar: 		{value:true, 	name:"Google Scholar", 		url:"https://scholar.google.com/scholar?q=" + this.textUrlReplaceString},
				Quora: 				{value:true, 	name:"Quora", 				url:"https://www.quora.com/search?q=" + this.textUrlReplaceString},
				Qwant: 				{value:true, 	name:"Qwant", 				url:"https://www.qwant.com/?t=all&q=" + this.textUrlReplaceString},
				UrbanDictionary: 	{value:true, 	name:"Urban Dictionary", 	url:"https://www.urbandictionary.com/define.php?term=" + this.textUrlReplaceString},
				Searx: 				{value:true, 	name:"Searx", 				url:"https://searx.me/?q=" + this.textUrlReplaceString},
				WolframAlpha:		{value:true, 	name:"Wolfram Alpha", 		url:"https://www.wolframalpha.com/input/?i=" + this.textUrlReplaceString},
				Yandex: 			{value:true, 	name:"Yandex", 				url:"https://yandex.com/search/?text=" + this.textUrlReplaceString},
				Yahoo: 				{value:true, 	name:"Yahoo", 				url:"https://search.yahoo.com/search?p=" + this.textUrlReplaceString},
				YouTube: 			{value:true, 	name:"YouTube", 			url:"https://www.youtube.com/results?q=" + this.textUrlReplaceString}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		let engines = BDFDB.DataUtils.get(this, "engines");
		let settingsitems = [], engineitems = [];
		
		for (let key in settings) settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
			title: "Search Engines:",
			first: settingsitems.length == 0,
			last: true,
			children: engineitems
		}));
		
		return BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {
			try {return this.initialize();}
			catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
		}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	onNativeContextMenu (e) {
		if (e.instance.props.type == BDFDB.DiscordConstants.ContextMenuTypes.NATIVE_TEXT && e.instance.props.value) this.injectItem(e, e.instance.props.value);
	}

	onMessageContextMenu (e) {
		if (e.instance.props.message && e.instance.props.channel && e.instance.props.target) {
			let text = document.getSelection().toString();
			if (text) this.injectItem(e, text);
		}
	}

	injectItem (e, text) {
		let engines = BDFDB.DataUtils.get(this, "engines");
		let items = [];
		for (let key in engines) if (engines[key]) items.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
			label: this.defaults.engines[key].name,
			danger: key == "_all",
			action: event => {
				let useChromium = BDFDB.DataUtils.get(this, "settings", "useChromium");
				if (!event.shiftKey) BDFDB.ContextMenuUtils.close(e.instance);
				if (key == "_all") {
					for (let key2 in engines) if (key2 != "_all" && engines[key2]) BDFDB.DiscordUtils.openLink(this.defaults.engines[key2].url.replace(this.textUrlReplaceString, encodeURIComponent(text)), useChromium, event.shiftKey);
				}
				else BDFDB.DiscordUtils.openLink(this.defaults.engines[key].url.replace(this.textUrlReplaceString, encodeURIComponent(text)), useChromium, event.shiftKey);
			}
		}));
		if (!items.length) items.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
			label: this.labels.submenu_disabled_text,
			disabled: true
		}));
		let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:"SearchWithGoogle"});
		const item = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Sub, {
			label: this.labels.context_googlesearchreplace_text,
			render: items
		});
		if (index > -1) children.splice(index, 1, item);
		else children.push(item);
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
