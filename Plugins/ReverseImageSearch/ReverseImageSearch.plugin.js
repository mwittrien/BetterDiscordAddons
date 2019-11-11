//META{"name":"ReverseImageSearch","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ReverseImageSearch","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ReverseImageSearch/ReverseImageSearch.plugin.js"}*//

class ReverseImageSearch {
	getName () {return "ReverseImageSearch";}

	getVersion () {return "3.4.8";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a reverse image search option to the context menu.";}

	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};
	}

	initConstructor () {
		this.imgUrlReplaceString = "DEVILBRO_BD_REVERSEIMAGESEARCH_REPLACE_IMAGEURL";

		this.defaults = {
			settings: {
				addUserAvatarEntry: 	{value:true, 	description:"User Avatars"},
				addGuildIconEntry: 		{value:true, 	description:"Server Icons"},
				addEmojiEntry: 			{value:true, 	description:"Custom Emojis/Emotes"}
			},
			engines: {
				_all: 		{value:true, 	name:BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL, 	url:null},
				Baidu: 		{value:true, 	name:"Baidu", 		url:"http://image.baidu.com/pcdutu?queryImageUrl=" + this.imgUrlReplaceString},
				Bing: 		{value:true, 	name:"Bing", 		url:"https://www.bing.com/images/search?q=imgurl:" + this.imgUrlReplaceString + "&view=detailv2&iss=sbi&FORM=IRSBIQ"},
				Google:		{value:true, 	name:"Google", 		url:"https://images.google.com/searchbyimage?image_url=" + this.imgUrlReplaceString},
				IQDB:		{value:true, 	name:"IQDB", 		url:"https://iqdb.org/?url=" + this.imgUrlReplaceString},
				Reddit: 	{value:true, 	name:"Reddit", 		url:"http://karmadecay.com/search?q=" + this.imgUrlReplaceString},
				SauceNAO: 	{value:true, 	name:"SauceNAO", 	url:"https://saucenao.com/search.php?db=999&url=" + this.imgUrlReplaceString},
				Sogou: 		{value:true, 	name:"Sogou", 		url:"http://pic.sogou.com/ris?flag=1&drag=0&query=" + this.imgUrlReplaceString + "&flag=1"},
				TinEye:		{value:true, 	name:"TinEye", 		url:"https://tineye.com/search?url=" + this.imgUrlReplaceString},
				WhatAnime:	{value:true,	name:"WhatAnime",	url:"https://trace.moe/?url=" + this.imgUrlReplaceString},
				Yandex: 	{value:true, 	name:"Yandex", 		url:"https://yandex.com/images/search?url=" + this.imgUrlReplaceString + "&rpt=imageview"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "engines");
		let engines = BDFDB.DataUtils.get(this, "engines");
		let settingsitems = [], inneritems = [];
		
		for (let key in settings) settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
			className: BDFDB.disCN.marginbottom8,
			type: "Switch",
			plugin: this,
			keys: ["settings", key],
			label: this.defaults.settings[key].description,
			value: settings[key]
		}));
		for (let key in engines) inneritems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
			children: inneritems
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

	onGuildContextMenu (e) {
		if (e.instance.props.guild && e.instance.props.target) {
			let guildicon = BDFDB.DOMUtils.containsClass(e.instance.props.target, BDFDB.disCN.avataricon) ? e.instance.props.target : e.instance.props.target.querySelector(BDFDB.dotCN.guildicon);
			if (guildicon && BDFDB.DataUtils.get(this, "settings", "addGuildIconEntry")) this.injectItem(e, guildicon.tagName == "IMG" ? guildicon.getAttribute("src") :  guildicon.style.getPropertyValue("background-image"));
		}
	}

	onUserContextMenu (e) {
		if (e.instance.props.user && e.instance.props.target) {
			let avatar = BDFDB.DOMUtils.containsClass(e.instance.props.target, BDFDB.disCN.avataricon) ? e.instance.props.target : e.instance.props.target.querySelector(BDFDB.dotCN.avatar);
			if (avatar && BDFDB.DataUtils.get(this, "settings", "addUserAvatarEntry")) this.injectItem(e, avatar.tagName == "IMG" ? avatar.getAttribute("src") :  avatar.style.getPropertyValue("background-image"));
		}
	}

	onNativeContextMenu (e) {
		if (e.instance.props.type == "NATIVE_IMAGE" && (e.instance.props.href || e.instance.props.src)) this.injectItem(e, e.instance.props.href || e.instance.props.src);
	}

	onMessageContextMenu (e) {
		if (e.instance.props.message && e.instance.props.channel && e.instance.props.target) {
			if (e.instance.props.attachment) this.injectItem(e, e.instance.props.attachment.url);
			else if (e.instance.props.target.tagName == "A" && e.instance.props.message.embeds && e.instance.props.message.embeds[0] && e.instance.props.message.embeds[0].type == "image") this.injectItem(e, e.instance.props.target.href);
			else if (e.instance.props.target.tagName == "IMG" && BDFDB.DOMUtils.containsClass(e.instance.props.target, "emoji", "emote", false) && BDFDB.DataUtils.get(this, "settings", "addEmojiEntry")) this.injectItem(e, e.instance.props.target.src);
		}
	}

	injectItem (e, url) {
		if (url && url.indexOf("discordapp.com/assets/") == -1 && !url.endsWith(".mp4")) {
			url = url.replace(/^url\(|\)$|"|'/g, "").replace(/\?size\=\d+$/, "?size=4096");
			if (url.indexOf("https://images-ext-1.discordapp.net/external/") > -1) {
				if (url.split("/https/").length != 1) url = "https://" + url.split("/https/")[url.split("/https/").length-1];
				else if (url.split("/http/").length != 1) url = "http://" + url.split("/http/")[url.split("/http/").length-1];
			}
			let engines = BDFDB.DataUtils.get(this, "engines");
			let items = [];
			for (let key in engines) if (engines[key]) items.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
				label: this.defaults.engines[key].name,
				danger: key == "_all",
				action: event => {
					if (!event.shiftKey) BDFDB.ContextMenuUtils.close(e.instance);
					if (key == "_all") {
						for (let key2 in engines) if (key2 != "_all" && engines[key2]) window.open(this.defaults.engines[key2].url.replace(this.imgUrlReplaceString, encodeURIComponent(url)), "_blank");
					}
					else window.open(this.defaults.engines[key].url.replace(this.imgUrlReplaceString, encodeURIComponent(url)), "_blank");
				}
			}));
			if (!items.length) items.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
				label: this.labels.submenu_disabled_text,
				disabled: true
			}));
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]});
			const itemgroup = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuSubItem, {
						label: "Reverse Image Search",
						render: items
					})
				]
			});
			if (index > -1) children.splice(index, 0, itemgroup);
			else children.push(itemgroup);
		}
	}

	setLabelsByLanguage () {
		switch (BDFDB.LanguageUtils.getLanguage().id) {
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
			case "pt-BR":	//portuguese (brazil)
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
			case "zh-TW":	//chinese (traditional)
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
