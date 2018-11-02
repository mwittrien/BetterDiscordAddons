//META{"name":"ReverseImageSearch"}*//

class ReverseImageSearch {
	initConstructor () {
		this.imgUrlReplaceString = "DEVILBRO_BD_REVERSEIMAGESEARCH_REPLACE_IMAGEURL";
		
		this.defaults = {
			engines: {
				_all: 		{value:true, 	name:BDFDB.getLibraryStrings().btn_all_text, 	url:null},
				Baidu: 		{value:true, 	name:"Baidu", 		url:"http://image.baidu.com/pcdutu?queryImageUrl=" + this.imgUrlReplaceString},
				Bing: 		{value:true, 	name:"Bing", 		url:"https://www.bing.com/images/search?q=imgurl:" + this.imgUrlReplaceString + "&view=detailv2&iss=sbi&FORM=IRSBIQ"},
				e621:		{value:true, 	name:"e621", 		url:"https://iqdb.harry.lu/?url=" + this.imgUrlReplaceString},
				Google:		{value:true, 	name:"Google", 		url:"https://images.google.com/searchbyimage?image_url=" + this.imgUrlReplaceString},
				ImgOps:		{value:true, 	name:"ImgOps", 		url:"https://imgops.com/" + this.imgUrlReplaceString},
				IQDB:		{value:true, 	name:"IQDB", 		url:"https://iqdb.org/?url=" + this.imgUrlReplaceString},
				Reddit: 	{value:true, 	name:"Reddit", 		url:"http://karmadecay.com/search?q=" + this.imgUrlReplaceString},
				SauceNAO: 	{value:true, 	name:"SauceNAO", 	url:"https://saucenao.com/search.php?db=999&url=" + this.imgUrlReplaceString},
				Sogou: 		{value:true, 	name:"Sogou", 		url:"http://pic.sogou.com/ris?flag=1&drag=0&query=" + this.imgUrlReplaceString + "&flag=1"},
				TinEye:		{value:true, 	name:"TinEye", 		url:"https://tineye.com/search?url=" + this.imgUrlReplaceString},
				WhatAnime:	{value:true,	name:"WhatAnime",	url:"https://whatanime.ga/?url=" + this.imgUrlReplaceString},
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
			`<div class="${BDFDB.disCN.contextmenu} reverseImageSearchSubMenu">
				<div class="${BDFDB.disCN.contextmenuitemgroup}">
					<div class="${BDFDB.disCN.contextmenuitem} alldisabled-item ${BDFDB.disCN.contextmenuitemdisabled}">
						<span>REPLACE_submenu_disabled_text</span>
						<div class="${BDFDB.disCN.contextmenuhint}"></div>
					</div>
					${Object.keys(this.defaults.engines).map((key, i) => `<div engine="${key}" class="${BDFDB.disCN.contextmenuitem} RIS-item"><span>${this.defaults.engines[key].name}</span><div class="${BDFDB.disCN.contextmenuhint}"></div></div>`).join("")}
				</div>
			</div>`;
	}
		
	getName () {return "ReverseImageSearch";}

	getDescription () {return "Adds a reverse image search option to the context menu.";}

	getVersion () {return "3.3.8";}
	
	getAuthor () {return "DevilBro";}

	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var engines = BDFDB.getAllData(this, "engines");
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 0 0 auto;">Search Engines:</h3></div><div class="DevilBro-settings-inner-list">`;
		for (let key in engines) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.engines[key].name}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${engines[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div>`;
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);});
			
		return settingspanel;
	}
	
	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDFDB === "object") {
			BDFDB.loadMessage(this);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.nodeType == 1 && node.className.includes(BDFDB.disCN.contextmenu)) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.appmount, {name:"messageContextObserver",instance:observer}, {childList: true});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			BDFDB.unloadMessage(this);
		}
	}
	
	
	// begin of own functions
	
	changeLanguageStrings () {
		this.messageContextSubMenuMarkup = 	this.messageContextSubMenuMarkup.replace("REPLACE_submenu_disabled_text", this.labels.submenu_disabled_text);
	}
	
	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
			settings[input.value] = input.checked;
		}
		BDFDB.saveAllData(settings, this, "engines");
	}
	
	onContextMenu (context) {
		if (!context || !context.tagName || !context.parentElement || context.querySelector(".reverseimagesearch-item")) return;
		var url = BDFDB.getKeyInformation({"node":context, "key":"src"});
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
					
				$(context).append(this.messageContextEntryMarkup)
					.on("mouseenter", ".reverseimagesearch-item", (e) => {
						this.createContextSubMenu(url, e, context);
					});
				
				BDFDB.updateContextPosition(context);
			}
		}
	}
	
	createContextSubMenu (imageurl, e, context) {
		var messageContextSubMenu = $(this.messageContextSubMenuMarkup);
		
		messageContextSubMenu
			.on("click", ".RIS-item", (e2) => {
				$(context).hide();
				var engine = e2.currentTarget.getAttribute("engine");
				if (engine == "_all") {
					var engines = BDFDB.getAllData(this, "engines");
					for (let key in engines) {
						if (key != "_all" && engines[key]) window.open(this.defaults.engines[key].url.replace(this.imgUrlReplaceString, encodeURIComponent(imageurl)), "_blank");
					}
				}
				else {
					window.open(this.defaults.engines[engine].url.replace(this.imgUrlReplaceString, encodeURIComponent(imageurl)), "_blank");
				}
			});
		
		var engines = BDFDB.getAllData(this, "engines");
		for (let key in engines) {
			if (!engines[key]) messageContextSubMenu.find("[engine='" + key + "']").remove();
		}
		if (messageContextSubMenu.find(".RIS-item").length > 0) {
			messageContextSubMenu.find(".alldisabled-item").remove();
		}
		
		BDFDB.appendSubMenu(e.currentTarget, messageContextSubMenu);
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
