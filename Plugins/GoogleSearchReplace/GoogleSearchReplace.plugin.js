//META{"name":"GoogleSearchReplace","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/GoogleSearchReplace","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/GoogleSearchReplace/GoogleSearchReplace.plugin.js"}*//

class GoogleSearchReplace {
	getName () {return "GoogleSearchReplace";}

	getVersion () {return "1.1.9";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Replaces the default Google Text Search with a selection menu of several search engines.";}

	constructor () {
		this.changelog = {
			"fixed":[["Light Theme Update","Fixed bugs for the Light Theme Update, which broke 99% of my plugins"]]
		};
		
		this.labels = {};
	}

	initConstructor () {
		this.textUrlReplaceString = "DEVILBRO_BD_GOOGLESEARCHREPLACE_REPLACE_TEXTURL";

		this.defaults = {
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
		let engines = BDFDB.getAllData(this, "engines");
		let settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.titlesize18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Search Engines:</h3></div><div class="BDFDB-settings-inner-list">`;
		for (let key in engines) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.engines[key].name}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="engines ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${engines[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		return settingspanel;
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
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	onNativeContextMenu (instance, menu, returnvalue) {
		if (instance.props && instance.props.type == "NATIVE_TEXT" && instance.props.value && !menu.querySelector(`${this.name}-contextMenuSubItem`)) {
			this.appendItem(menu, returnvalue, instance.props.value);
		}
	}

	onMessageContextMenu (instance, menu, returnvalue) {
		if (instance.props && instance.props.message && instance.props.channel && instance.props.target && !menu.querySelector(`${this.name}-contextMenuSubItem`)) {
			let text = document.getSelection().toString();
			if (text) this.appendItem(menu, returnvalue, text);
		}
	}

	appendItem (menu, returnvalue, text) {
		let engines = BDFDB.getAllData(this, "engines");
		let items = [];
		for (let key in engines) if (engines[key]) items.push(BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
			label: this.defaults.engines[key].name,
			className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-engine-contextMenuItem`,
			action: e => {
				if (!e.shiftKey) BDFDB.closeContextMenu(menu);
				if (key == "_all") {
					for (let key2 in engines) if (key2 != "_all" && engines[key2]) window.open(this.defaults.engines[key2].url.replace(this.textUrlReplaceString, encodeURIComponent(text)), "_blank");
				}
				else window.open(this.defaults.engines[key].url.replace(this.textUrlReplaceString, encodeURIComponent(text)), "_blank");
			}
		}));
		if (!items.length) items.push(BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
			label: this.labels.submenu_disabled_text,
			className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-disabled-contextMenuItem`,
			disabled: true
		}));
		let [children, index] = BDFDB.getContextMenuGroupAndIndex(returnvalue, "SearchWithGoogle");
		const item = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuSubItem, {
			label: this.labels.context_googlesearchreplace_text,
			className: `BDFDB-contextMenuSubItem ${this.name}-contextMenuSubItem ${this.name}-search-contextMenuSubItem`,
			render: items
		});
		if (index > -1) children.splice(index, 1, item);
		else children.push(item);
	}

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
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
