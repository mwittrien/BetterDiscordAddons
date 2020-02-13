//META{"name":"ReverseImageSearch","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ReverseImageSearch","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ReverseImageSearch/ReverseImageSearch.plugin.js"}*//

var ReverseImageSearch = (_ => {
	const imgUrlReplaceString = "DEVILBRO_BD_REVERSEIMAGESEARCH_REPLACE_IMAGEURL";
	
	return class ReverseImageSearch {
		getName () {return "ReverseImageSearch";}

		getVersion () {return "3.5.3";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds a reverse image search option to the context menu.";}

		constructor () {
			this.changelog = {
				"improved":[["One Engine", "Enabling only one search engine doesn't create a SubMenu anymore"],["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
			};
		}

		initConstructor () {
			this.defaults = {
				settings: {
					useChromium: 			{value:false, 	inner:false,	description:"Use an inbuilt browser window instead of opening your default browser"},
					addUserAvatarEntry: 	{value:true, 	inner:true,		description:"User Avatars"},
					addGuildIconEntry: 		{value:true, 	inner:true,		description:"Server Icons"},
					addEmojiEntry: 			{value:true, 	inner:true,		description:"Custom Emojis/Emotes"}
				},
				engines: {
					_all: 		{value:true, 	name:BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL, 	url:null},
					Baidu: 		{value:true, 	name:"Baidu", 		url:"http://image.baidu.com/pcdutu?queryImageUrl=" + imgUrlReplaceString},
					Bing: 		{value:true, 	name:"Bing", 		url:"https://www.bing.com/images/search?q=imgurl:" + imgUrlReplaceString + "&view=detailv2&iss=sbi&FORM=IRSBIQ"},
					Google:		{value:true, 	name:"Google", 		url:"https://images.google.com/searchbyimage?image_url=" + imgUrlReplaceString},
					IQDB:		{value:true, 	name:"IQDB", 		url:"https://iqdb.org/?url=" + imgUrlReplaceString},
					Reddit: 	{value:true, 	name:"Reddit", 		url:"http://karmadecay.com/search?q=" + imgUrlReplaceString},
					SauceNAO: 	{value:true, 	name:"SauceNAO", 	url:"https://saucenao.com/search.php?db=999&url=" + imgUrlReplaceString},
					Sogou: 		{value:true, 	name:"Sogou", 		url:"http://pic.sogou.com/ris?flag=1&drag=0&query=" + imgUrlReplaceString + "&flag=1"},
					TinEye:		{value:true, 	name:"TinEye", 		url:"https://tineye.com/search?url=" + imgUrlReplaceString},
					WhatAnime:	{value:true,	name:"WhatAnime",	url:"https://trace.moe/?url=" + imgUrlReplaceString},
					Yandex: 	{value:true, 	name:"Yandex", 		url:"https://yandex.com/images/search?url=" + imgUrlReplaceString + "&rpt=imageview"}
				}
			};
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let engines = BDFDB.DataUtils.get(this, "engines");
			let settingspanel, settingsitems = [], inneritems = [], engineitems = [];
			
			for (let key in settings) (!this.defaults.settings[key].inner ? settingsitems : inneritems).push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
				title: "Add extra ContextMenu Entry for:",
				first: settingsitems.length == 0,
				last: true,
				children: inneritems
			}));
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
				title: "Search Engines:",
				first: settingsitems.length == 0,
				last: true,
				children: engineitems
			}));
			
			return settingspanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
		}

		//legacy
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


		// begin of own functions

		onGuildContextMenu (e) {
			if (e.instance.props.guild && e.instance.props.target) {
				let guildicon = BDFDB.DOMUtils.containsClass(e.instance.props.target, BDFDB.disCN.avataricon) ? e.instance.props.target : e.instance.props.target.querySelector(BDFDB.dotCN.guildicon);
				if (guildicon && BDFDB.DataUtils.get(this, "settings", "addGuildIconEntry")) this.injectItem(e, guildicon.tagName == "IMG" ? guildicon.getAttribute("src") :  guildicon.style.getPropertyValue("background-image"));
			}
		}

		onUserContextMenu (e) {
			if (e.instance.props.user && e.instance.props.target) {
				let avatar = e.instance.props.target.querySelector(BDFDB.dotCN.avatar) || e.instance.props.target;
				if (avatar && BDFDB.DataUtils.get(this, "settings", "addUserAvatarEntry")) this.injectItem(e, avatar.tagName == "IMG" ? avatar.getAttribute("src") : avatar.style.getPropertyValue("background-image"));
			}
		}

		onNativeContextMenu (e) {
			if (e.instance.props.type == BDFDB.DiscordConstants.ContextMenuTypes.NATIVE_IMAGE && (e.instance.props.href || e.instance.props.src)) {
				this.injectItem(e, e.instance.props.href || e.instance.props.src);
			}
		}

		onMessageContextMenu (e) {
			if (e.instance.props.message && e.instance.props.channel && e.instance.props.target) {
				if (e.instance.props.attachment) this.injectItem(e, e.instance.props.attachment.url);
				else if (e.instance.props.target.tagName == "A" && e.instance.props.message.embeds && e.instance.props.message.embeds[0] && e.instance.props.message.embeds[0].type == "image") this.injectItem(e, e.instance.props.target.href);
				else if (e.instance.props.target.tagName == "IMG") {
					if (BDFDB.DOMUtils.containsClass(e.instance.props.target.parentElement, BDFDB.disCN.imagewrapper)) this.injectItem(e, e.instance.props.target.src);
					else if (BDFDB.DOMUtils.containsClass(e.instance.props.target, BDFDB.disCN.embedauthoricon) && BDFDB.DataUtils.get(this, "settings", "addUserAvatarEntry")) this.injectItem(e, e.instance.props.target.src);
					else if (BDFDB.DOMUtils.containsClass(e.instance.props.target, "emoji", "emote", false) && BDFDB.DataUtils.get(this, "settings", "addEmojiEntry")) this.injectItem(e, e.instance.props.target.src);
				}
			}
		}

		injectItem (e, url) {
			if (url && url.indexOf("discordapp.com/assets/") == -1 && !url.endsWith(".mp4")) {
				url = url.replace(/^url\(|\)$|"|'/g, "").replace(/\?size\=\d+$/, "?size=4096");
				if (url.indexOf("https://images-ext-1.discordapp.net/external/") > -1) {
					if (url.split("/https/").length != 1) url = "https://" + url.split("/https/")[url.split("/https/").length-1];
					else if (url.split("/http/").length != 1) url = "http://" + url.split("/http/")[url.split("/http/").length-1];
				}
				let enabledEngines = BDFDB.ObjectUtils.filter(BDFDB.DataUtils.get(this, "engines"), n => n);
				let enginesWithoutAll = BDFDB.ObjectUtils.filter(enabledEngines, n => n != "_all", true);
				let engineKeys = Object.keys(enginesWithoutAll);
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]});
				if (engineKeys.length == 1) children.splice(index > -1 ? index : children.length, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
					label: this.labels.context_reverseimagesearch_text.replace("...", this.defaults.engines[engineKeys[0]].name),
					action: event => {
						let useChromium = BDFDB.DataUtils.get(this, "settings", "useChromium");
						if (!event.shiftKey) BDFDB.ContextMenuUtils.close(e.instance);
						BDFDB.DiscordUtils.openLink(this.defaults.engines[engineKeys[0]].url.replace(imgUrlReplaceString, encodeURIComponent(url)), useChromium, event.shiftKey);
					}
				}));
				else {
					let items = [];
					for (let key in enabledEngines) items.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
						label: this.defaults.engines[key].name,
						danger: key == "_all",
						action: event => {
							let useChromium = BDFDB.DataUtils.get(this, "settings", "useChromium");
							if (!event.shiftKey) BDFDB.ContextMenuUtils.close(e.instance);
							if (key == "_all") {
								for (let key2 in enginesWithoutAll) BDFDB.DiscordUtils.openLink(this.defaults.engines[key2].url.replace(imgUrlReplaceString, encodeURIComponent(url)), useChromium, event.shiftKey);
							}
							else BDFDB.DiscordUtils.openLink(this.defaults.engines[key].url.replace(imgUrlReplaceString, encodeURIComponent(url)), useChromium, event.shiftKey);
						}
					}));
					if (!items.length) items.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
						label: this.labels.submenu_disabled_text,
						disabled: true
					}));
					children.splice(index > -1 ? index : children.length, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Group, {
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Sub, {
							label: this.labels.context_reverseimagesearch_text,
							render: items
						})
					}));
				}
			}
		}

		setLabelsByLanguage () {
			switch (BDFDB.LanguageUtils.getLanguage().id) {
				case "hr":		//croatian
					return {
						context_reverseimagesearch_text:	"Traži sliku ...",
						submenu_disabled_text:				"Svi su onemogućeni"
					};
				case "da":		//danish
					return {
						context_reverseimagesearch_text:	"Søg billede med ...",
						submenu_disabled_text:				"Alle deaktiveret"
					};
				case "de":		//german
					return {
						context_reverseimagesearch_text:	"Bild suchen mit ...",
						submenu_disabled_text:				"Alle deaktiviert"
					};
				case "es":		//spanish
					return {
						context_reverseimagesearch_text:	"Buscar imagen con ...",
						submenu_disabled_text:				"Todo desactivado"
					};
				case "fr":		//french
					return {
						context_reverseimagesearch_text:	"Rechercher une image avec ...",
						submenu_disabled_text:				"Tous désactivés"
					};
				case "it":		//italian
					return {
						context_reverseimagesearch_text:	"Cerca immagine con ...",
						submenu_disabled_text:				"Tutto disattivato"
					};
				case "nl":		//dutch
					return {
						context_reverseimagesearch_text:	"Afbeelding zoeken met ...",
						submenu_disabled_text:				"Alles gedeactiveerd"
					};
				case "no":		//norwegian
					return {
						context_reverseimagesearch_text:	"Søk på bilde med ...",
						submenu_disabled_text:				"Alle deaktivert"
					};
				case "pl":		//polish
					return {
						context_reverseimagesearch_text:	"Wyszukaj obraz za pomocą ...",
						submenu_disabled_text:				"Wszystkie wyłączone"
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						context_reverseimagesearch_text:	"Pesquisar imagem com ...",
						submenu_disabled_text:				"Todos desativados"
					};
				case "fi":		//finnish
					return {
						context_reverseimagesearch_text:	"Hae kuvaa ...",
						submenu_disabled_text:				"Kaikki on poistettu käytöstä"
					};
				case "sv":		//swedish
					return {
						context_reverseimagesearch_text:	"Sök bild med ...",
						submenu_disabled_text:				"Alla avaktiverade"
					};
				case "tr":		//turkish
					return {
						context_reverseimagesearch_text:	"Görüntüyü şununla ara ...",
						submenu_disabled_text:				"Hepsi deaktive"
					};
				case "cs":		//czech
					return {
						context_reverseimagesearch_text:	"Vyhledat obrázek pomocí ...",
						submenu_disabled_text:				"Všechny deaktivované"
					};
				case "bg":		//bulgarian
					return {
						context_reverseimagesearch_text:	"Търсене на изображение с ...",
						submenu_disabled_text:				"Всички са деактивирани"
					};
				case "ru":		//russian
					return {
						context_reverseimagesearch_text:	"Поиск изображения с ...",
						submenu_disabled_text:				"Все деактивированные"
					};
				case "uk":		//ukrainian
					return {
						context_reverseimagesearch_text:	"Шукати зображення за допомогою ...",
						submenu_disabled_text:				"Всі вимкнені"
					};
				case "ja":		//japanese
					return {
						context_reverseimagesearch_text:	"で画像を検索 ...",
						submenu_disabled_text:				"すべて非アクティブ化"
					};
				case "zh-TW":	//chinese (traditional)
					return {
						context_reverseimagesearch_text:	"搜尋圖片 ...",
						submenu_disabled_text:				"全部停用"
					};
				case "ko":		//korean
					return {
						context_reverseimagesearch_text:	"로 이미지 검색 ...",
						submenu_disabled_text:				"모두 비활성화 됨"
					};
				default:		//default: english
					return {
						context_reverseimagesearch_text:	"Search image with ...",
						submenu_disabled_text:				"All disabled"
					};
			}
		}
	}
})();