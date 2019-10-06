//META{"name":"ReverseImageSearch","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ReverseImageSearch","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ReverseImageSearch/ReverseImageSearch.plugin.js"}*//

class ReverseImageSearch {
	getName () {return "ReverseImageSearch";}

	getVersion () {return "3.4.6";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds a reverse image search option to the context menu.";}

	constructor () {
		this.changelog = {
			"added":[["New Options","Right clicking a user avatar/server icon/custom emoji now also adds a context menu entry to reverse image search the image, can be disabled"]]
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
				_all: 		{value:true, 	name:BDFDB.getLibraryStrings().btn_all_text, 	url:null},
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
		let settings = 	BDFDB.getAllData(this, "settings");
		let engines = BDFDB.getAllData(this, "engines");
		let settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Add a contextmenu entry when right clicking</h3></div><div class="BDFDB-settings-inner-list">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Search Engines:</h3></div><div class="BDFDB-settings-inner-list">`;
		for (let key in engines) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.engines[key].name}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="engines ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${engines[key] ? " checked" : ""}></div></div>`;
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
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
					if (body) {
						libraryScript = document.createElement("script");
						libraryScript.setAttribute("id", "BDFDBLibraryScript");
						libraryScript.setAttribute("type", "text/javascript");
						libraryScript.setAttribute("date", performance.now());
						libraryScript.innerText = body;
						document.head.appendChild(libraryScript);
					}
					this.initialize();
				});
			}, 15000);
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

	onGuildContextMenu (instance, menu, returnvalue) {
		if (instance.props && instance.props.guild && instance.props.target) {
			let guildicon = BDFDB.containsClass(instance.props.target, BDFDB.disCN.avataricon) ? instance.props.target : instance.props.target.querySelector(BDFDB.dotCN.guildicon);
			if (guildicon && BDFDB.getData("addGuildIconEntry", this, "settings")) this.appendItem(menu, returnvalue, guildicon.tagName == "IMG" ? guildicon.getAttribute("src") :  guildicon.style.getPropertyValue("background-image"));
		}
	}

	onUserContextMenu (instance, menu, returnvalue) {
		if (instance.props && instance.props.user && instance.props.target) {
			let avatar = BDFDB.containsClass(instance.props.target, BDFDB.disCN.avataricon) ? instance.props.target : instance.props.target.querySelector(BDFDB.dotCN.avatar);
			if (avatar && BDFDB.getData("addUserAvatarEntry", this, "settings")) this.appendItem(menu, returnvalue, avatar.tagName == "IMG" ? avatar.getAttribute("src") :  avatar.style.getPropertyValue("background-image"));
		}
	}

	onNativeContextMenu (instance, menu, returnvalue) {
		if (instance.props && instance.props.type == "NATIVE_IMAGE" && (instance.props.href || instance.props.src) && !menu.querySelector(`${this.name}-contextMenuSubItem`)) {
			this.appendItem(menu, returnvalue, instance.props.href || instance.props.src);
		}
	}

	onMessageContextMenu (instance, menu, returnvalue) {
		if (instance.props && instance.props.message && instance.props.channel && instance.props.target && !menu.querySelector(".reverseimagesearch-item")) {
			if (instance.props.attachment) {
				this.appendItem(menu, returnvalue, instance.props.attachment.url);
			}
			if (instance.props.target.tagName == "A" && instance.props.message.embeds && instance.props.message.embeds[0] && instance.props.message.embeds[0].type == "image") {
				this.appendItem(menu, returnvalue, instance.props.target.href);
			}
			if (instance.props.target.tagName == "IMG" && BDFDB.containsClass(instance.props.target, "emoji", "emote", false) && BDFDB.getData("addEmojiEntry", this, "settings")) {
				this.appendItem(menu, returnvalue, instance.props.target.src);
			}
		}
	}

	appendItem (menu, returnvalue, url) {
		if (url && url.indexOf("discordapp.com/assets/") == -1 && !url.endsWith(".mp4")) {
			url = url.replace(/^url\(|\)$|"|'/g, "").replace(/\?size\=\d+$/, "?size=4096");
			if (url.indexOf("https://images-ext-1.discordapp.net/external/") > -1) {
				if (url.split("/https/").length != 1) url = "https://" + url.split("/https/")[url.split("/https/").length-1];
				else if (url.split("/http/").length != 1) url = "http://" + url.split("/http/")[url.split("/http/").length-1];
			}
			let engines = BDFDB.getAllData(this, "engines");
			let items = [];
			for (let key in engines) if (engines[key]) items.push(BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
				label: this.defaults.engines[key].name,
				className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-engine-contextMenuItem`,
				danger: key == "_all",
				action: e => {
					if (!e.shiftKey) BDFDB.closeContextMenu(menu);
					if (key == "_all") {
						for (let key2 in engines) if (key2 != "_all" && engines[key2]) window.open(this.defaults.engines[key2].url.replace(this.imgUrlReplaceString, encodeURIComponent(url)), "_blank");
					}
					else window.open(this.defaults.engines[key].url.replace(this.imgUrlReplaceString, encodeURIComponent(url)), "_blank");
				}
			}));
			if (!items.length) items.push(BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
				label: this.labels.submenu_disabled_text,
				className: `BDFDB-contextMenuItem ${this.name}-contextMenuItem ${this.name}-disabled-contextMenuItem`,
				disabled: true
			}));
			let [children, index] = BDFDB.getContextMenuGroupAndIndex(returnvalue, ["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]);
			const itemgroup = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
				children: [
					BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuSubItem, {
						label: "Reverse Image Search",
						className: `BDFDB-contextMenuSubItem ${this.name}-contextMenuSubItem ${this.name}-search-contextMenuSubItem`,
						render: items
					})
				]
			});
			if (index > -1) children.splice(index, 0, itemgroup);
			else children.push(itemgroup);
		}
	}

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
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
