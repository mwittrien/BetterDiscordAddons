module.exports = (Plugin, Api, Vendor) => {
	if (!global.BDFDB || typeof BDFDB != "object") global.BDFDB = {myPlugins:{}, BDv2Api: Api};

	return class extends Plugin {
		initConstructor () {
			this.imgUrlReplaceString = "DEVILBRO_BD_REVERSEIMAGESEARCH_REPLACE_IMAGEURL";

			this.defaults = {
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

			this.messageContextEntryMarkup =
				`<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} reverseimagesearch-item ${BDFDB.disCN.contextmenuitemsubmenu}">
						<span>Reverse Image Search</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
				</div>`;


			this.messageContextSubMenuMarkup = 
				`<div class="${BDFDB.disCN.contextmenu} reverseimagesearch-submenu">
					<div class="${BDFDB.disCN.contextmenuitemgroup}">
						<div class="${BDFDB.disCN.contextmenuitem} alldisabled-item ${BDFDB.disCN.contextmenuitemdisabled}">
							<span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">REPLACE_submenu_disabled_text</div></span>
							<div class="${BDFDB.disCN.contextmenuhint}"></div>
						</div>
						${Object.keys(this.defaults.engines).map((key, i) => `<div engine="${key}" class="${BDFDB.disCN.contextmenuitem} RIS-item"><span class="DevilBro-textscrollwrapper" speed=3><div class="DevilBro-textscroll">${this.defaults.engines[key].name}</div></span><div class="${BDFDB.disCN.contextmenuhint}"></div></div>`).join("")}
					</div>
				</div>`;
		}

		onStart () {
			if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.name] = this;
			var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (!global.BDFDB || typeof BDFDB != "object" || performance.now() - BDFDB.creationTime > 600000e.now() - BDFDB.creationTime > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
				document.head.appendChild(libraryScript);
			}
			else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		}

		initialize () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				if (this.started) return true;
				BDFDB.loadMessage(this);

				return true;
			}
			else {
				console.error(`%c[${this.name}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
				return false;
			}
		}

		onStop () {
			if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}


		// begin of own functions

		changeLanguageStrings () {
			this.messageContextSubMenuMarkup = 	this.messageContextSubMenuMarkup.replace("REPLACE_submenu_disabled_text", this.labels.submenu_disabled_text);
		}

		onNativeContextMenu (instance, menu) {
			if (instance.props && instance.props.type == "NATIVE_IMAGE" && instance.props.href && !menu.querySelector(".reverseimagesearch-item")) {
				this.appendItem(instance, menu, instance.props.href);
			}
		}

		onMessageContextMenu (instance, menu) {
			if (instance.props && instance.props.message && instance.props.channel && instance.props.target && !menu.querySelector(".reverseimagesearch-item")) {
				if (instance.props.attachment) {
					this.appendItem(instance, menu, instance.props.attachment.url);
				}
				if (instance.props.target.tagName == "A") {
					BDFDB.toggleEles(menu, false);
					require("request")(instance.props.target.href, (error, response, result) => {
						if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") != -1) {
							this.appendItem(instance, menu, instance.props.target.href);
						}
						BDFDB.toggleEles(menu, true);
						BDFDB.updateContextPosition(menu);
					});
				}
			}
		}

		appendItem (instance, menu, url) {
			if (instance && menu && url) {
				if (url.indexOf("discordapp.com/assets/") == -1) {
					if (url.indexOf("https://images-ext-1.discordapp.net/external/") > -1) {
						if (url.split("/https/").length != 1) url = "https://" + url.split("/https/")[url.split("/https/").length-1];
						else if (url.split("/http/").length != 1) url = "http://" + url.split("/http/")[url.split("/http/").length-1];
					}
					let messageContextEntry = BDFDB.htmlToElement(this.messageContextEntryMarkup);
					menu.appendChild(messageContextEntry);
					let searchitem = messageContextEntry.querySelector(".reverseimagesearch-item");
					searchitem.addEventListener("mouseenter", () => {
						let messageContextSubMenu = BDFDB.htmlToElement(this.messageContextSubMenuMarkup);
						let engines = BDFDB.getAllData(this, "engines");
						for (let key in engines) if (!engines[key]) BDFDB.removeEles(messageContextSubMenu.querySelector("[engine='" + key + "']"));
						if (messageContextSubMenu.querySelector(".RIS-item")) BDFDB.removeEles(messageContextSubMenu.querySelector(".alldisabled-item"));
						BDFDB.addChildEventListener(messageContextSubMenu, "click", ".RIS-item", e => {
							instance._reactInternalFiber.return.memoizedProps.closeContextMenu();
							let engine = e.currentTarget.getAttribute("engine");
							if (engine == "_all") {
								for (let key in engines) if (key != "_all" && engines[key]) window.open(this.defaults.engines[key].url.replace(this.imgUrlReplaceString, encodeURIComponent(url)), "_blank");
							}
							else window.open(this.defaults.engines[engine].url.replace(this.imgUrlReplaceString, encodeURIComponent(url)), "_blank");
						});
						BDFDB.appendSubMenu(searchitem, messageContextSubMenu);
					});
				}
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
};
