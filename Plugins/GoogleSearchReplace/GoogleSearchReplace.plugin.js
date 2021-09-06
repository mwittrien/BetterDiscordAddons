/**
 * @name GoogleSearchReplace
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.3.1
 * @description Replaces the default Google Text Search with a custom Search Engine
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/GoogleSearchReplace/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/GoogleSearchReplace/GoogleSearchReplace.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "GoogleSearchReplace",
			"author": "DevilBro",
			"version": "1.3.1",
			"description": "Replaces the default Google Text Search with a custom Search Engine"
		},
		"changeLog": {
			"added": {
				"StackOverflow": "Added StackOverflow as search engine"
			}
		}
	};
	
	return (window.Lightcord && !Node.prototype.isPrototypeOf(window.Lightcord) || window.LightCord && !Node.prototype.isPrototypeOf(window.LightCord) || window.Astra && !Node.prototype.isPrototypeOf(window.Astra)) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return "Do not use LightCord!";}
		load () {BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)");}
		start() {}
		stop() {}
	} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		const textUrlReplaceString = "DEVILBRO_BD_GOOGLESEARCHREPLACE_REPLACEURL";
		var engines = {}, enabledEngines = {};
	
		return class GoogleSearchReplace extends Plugin {
			onLoad () {
				this.defaults = {
					engines: {
						_all: 				{value: true, 	name: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL, 	url: null},
						Ask: 				{value: true, 	name: "Ask", 					url: "https://ask.com/web?q=" + textUrlReplaceString},
						Bing: 				{value: true, 	name: "Bing", 					url: "https://www.bing.com/search?q=" + textUrlReplaceString},
						DogPile:			{value: true, 	name: "DogPile", 				url: "http://www.dogpile.com/search/web?q=" + textUrlReplaceString},
						DuckDuckGo:			{value: true, 	name: "DuckDuckGo", 			url: "https://duckduckgo.com/?q=" + textUrlReplaceString},
						GitHub: 			{value: true, 	name: "GitHub", 				url: "https://github.com/search?q=" + textUrlReplaceString},
						Google: 			{value: true, 	name: "Google", 				url: "https://www.google.com/search?q=" + textUrlReplaceString},
						GoogleScholar: 		{value: true, 	name: "Google Scholar", 		url: "https://scholar.google.com/scholar?q=" + textUrlReplaceString},
						Quora: 				{value: true, 	name: "Quora", 					url: "https://www.quora.com/search?q=" + textUrlReplaceString},
						Qwant: 				{value: true, 	name: "Qwant", 					url: "https://www.qwant.com/?t=all&q=" + textUrlReplaceString},
						UrbanDictionary: 	{value: true, 	name: "Urban Dictionary", 		url: "https://www.urbandictionary.com/define.php?term=" + textUrlReplaceString},
						Searx: 				{value: true, 	name: "Searx", 					url: "https://searx.info/?q=" + textUrlReplaceString},
						StackOverflow: 		{value: true, 	name: "Stack Overflow", 		url: "https://stackoverflow.com/search?q=" + textUrlReplaceString},
						Startpage: 			{value: true, 	name: "Startpage", 				url: "https://www.startpage.com/sp/search?q=" + textUrlReplaceString},
						WolframAlpha:		{value: true, 	name: "Wolfram Alpha", 			url: "https://www.wolframalpha.com/input/?i=" + textUrlReplaceString},
						Yandex: 			{value: true, 	name: "Yandex", 				url: "https://yandex.com/search/?text=" + textUrlReplaceString},
						Yahoo: 				{value: true, 	name: "Yahoo", 					url: "https://search.yahoo.com/search?p=" + textUrlReplaceString},
						YouTube: 			{value: true, 	name: "YouTube", 				url: "https://www.youtube.com/results?q=" + textUrlReplaceString}
					}
				};
			}
			
			onStart () {
				this.forceUpdateAll();
			}
			
			onStop () {}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
					title: "Search Engines:",
					children: Object.keys(engines).filter(n => n && n != "_all").map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						type: "Switch",
						plugin: this,
						keys: ["engines", key],
						label: this.defaults.engines[key].name,
						value: engines[key]
					}))
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
			
			forceUpdateAll () {
				engines = BDFDB.DataUtils.get(this, "engines");
				enabledEngines = BDFDB.ObjectUtils.filter(engines, n => n);
			}

			onMessageContextMenu (e) {
				this.injectItem(e);
			}

			onNativeContextMenu (e) {
				this.injectItem(e);
			}
			
			injectItem (e) {
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "search-google"});
				if (index > -1) {
					let text = document.getSelection().toString();
					let enginesWithoutAll = BDFDB.ObjectUtils.filter(enabledEngines, n => n != "_all", true);
					let engineKeys = Object.keys(enginesWithoutAll);
					if (engineKeys.length == 1) {
						children.splice(index, 1, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_googlesearchreplace.replace("...", this.defaults.engines[engineKeys[0]].name),
							id: children[index].props.id,
							persisting: true,
							action: event => {
								if (!event.shiftKey) BDFDB.ContextMenuUtils.close(e.instance);
								BDFDB.DiscordUtils.openLink(this.defaults.engines[engineKeys[0]].url.replace(textUrlReplaceString, encodeURIComponent(text)), {
									minimized: event.shiftKey
								});
							}
						}));
					}
					else {
						let items = [];
						for (let key in enabledEngines) items.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.defaults.engines[key].name,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "search", key),
							color: key == "_all" ? BDFDB.LibraryComponents.MenuItems.Colors.DANGER : BDFDB.LibraryComponents.MenuItems.Colors.DEFAULT,
							persisting: true,
							action: event => {
								if (!event.shiftKey) BDFDB.ContextMenuUtils.close(e.instance);
								if (key == "_all") {
									for (let key2 in enginesWithoutAll) BDFDB.DiscordUtils.openLink(this.defaults.engines[key2].url.replace(textUrlReplaceString, encodeURIComponent(text)), {
										minimized: event.shiftKey
									});
								}
								else BDFDB.DiscordUtils.openLink(this.defaults.engines[key].url.replace(textUrlReplaceString, encodeURIComponent(text)), {
									minimized: event.shiftKey
								});
							}
						}));
						if (!items.length) items.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.submenu_disabled,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "disabled"),
							disabled: true
						}));
						children.splice(index, 1, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_googlesearchreplace,
							id: children[index].props.id,
							children: items
						}));
					}
				}
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							context_googlesearchreplace:		"Търсене с ...",
							submenu_disabled:					"Всички инвалиди"
						};
					case "da":		// Danish
						return {
							context_googlesearchreplace:		"Søg med ...",
							submenu_disabled:					"Alle handicappede"
						};
					case "de":		// German
						return {
							context_googlesearchreplace:		"Suche mit ...",
							submenu_disabled:					"Alle deaktiviert"
						};
					case "el":		// Greek
						return {
							context_googlesearchreplace:		"Αναζήτηση με ...",
							submenu_disabled:					"Όλα τα άτομα με ειδικές ανάγκες"
						};
					case "es":		// Spanish
						return {
							context_googlesearchreplace:		"Buscar con ...",
							submenu_disabled:					"Todos discapacitados"
						};
					case "fi":		// Finnish
						return {
							context_googlesearchreplace:		"Hae ...",
							submenu_disabled:					"Kaikki vammaiset"
						};
					case "fr":		// French
						return {
							context_googlesearchreplace:		"Rechercher avec ...",
							submenu_disabled:					"Tout désactivé"
						};
					case "hr":		// Croatian
						return {
							context_googlesearchreplace:		"Traži sa ...",
							submenu_disabled:					"Svi invalidi"
						};
					case "hu":		// Hungarian
						return {
							context_googlesearchreplace:		"Keresés a következővel:",
							submenu_disabled:					"Minden fogyatékkal él"
						};
					case "it":		// Italian
						return {
							context_googlesearchreplace:		"Cerca con ...",
							submenu_disabled:					"Tutti disabilitati"
						};
					case "ja":		// Japanese
						return {
							context_googlesearchreplace:		"で検索 ...",
							submenu_disabled:					"すべて無効"
						};
					case "ko":		// Korean
						return {
							context_googlesearchreplace:		"다음으로 검색 ...",
							submenu_disabled:					"모두 비활성화 됨"
						};
					case "lt":		// Lithuanian
						return {
							context_googlesearchreplace:		"Ieškoti naudojant ...",
							submenu_disabled:					"Visi neįgalūs"
						};
					case "nl":		// Dutch
						return {
							context_googlesearchreplace:		"Zoeken met ...",
							submenu_disabled:					"Allemaal uitgeschakeld"
						};
					case "no":		// Norwegian
						return {
							context_googlesearchreplace:		"Søk med ...",
							submenu_disabled:					"Alle funksjonshemmede"
						};
					case "pl":		// Polish
						return {
							context_googlesearchreplace:		"Szukaj za pomocą ...",
							submenu_disabled:					"Wszystkie wyłączone"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							context_googlesearchreplace:		"Pesquise com ...",
							submenu_disabled:					"Todos desativados"
						};
					case "ro":		// Romanian
						return {
							context_googlesearchreplace:		"Căutați cu ...",
							submenu_disabled:					"Toate sunt dezactivate"
						};
					case "ru":		// Russian
						return {
							context_googlesearchreplace:		"Искать с ...",
							submenu_disabled:					"Все отключены"
						};
					case "sv":		// Swedish
						return {
							context_googlesearchreplace:		"Sök med ...",
							submenu_disabled:					"Alla funktionshindrade"
						};
					case "th":		// Thai
						return {
							context_googlesearchreplace:		"ค้นหาด้วย ...",
							submenu_disabled:					"ปิดใช้งานทั้งหมด"
						};
					case "tr":		// Turkish
						return {
							context_googlesearchreplace:		"Şununla ara ...",
							submenu_disabled:					"Hepsi devre dışı"
						};
					case "uk":		// Ukrainian
						return {
							context_googlesearchreplace:		"Шукати за допомогою ...",
							submenu_disabled:					"Всі інваліди"
						};
					case "vi":		// Vietnamese
						return {
							context_googlesearchreplace:		"Tìm kiếm với ...",
							submenu_disabled:					"Tất cả đã bị vô hiệu hóa"
						};
					case "zh-CN":	// Chinese (China)
						return {
							context_googlesearchreplace:		"用 ... 搜索",
							submenu_disabled:					"全部禁用"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							context_googlesearchreplace:		"用 ... 搜索",
							submenu_disabled:					"全部禁用"
						};
					default:		// English
						return {
							context_googlesearchreplace:		"Search with ...",
							submenu_disabled:					"All disabled"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
