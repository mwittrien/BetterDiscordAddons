/**
 * @name GoogleSearchReplace
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.3.8
 * @description Replaces the default Google Text Search with a custom Search Engine
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/GoogleSearchReplace/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/GoogleSearchReplace/GoogleSearchReplace.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		
	};
	
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js").then(r => {
				if (!r || r.status != 200) throw new Error();
				else return r.text();
			}).then(b => {
				if (!b) throw new Error();
				else return require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
			}).catch(error => {
				BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var engines = {}, enabledEngines = {};
	
		return class GoogleSearchReplace extends Plugin {
			onLoad () {
				this.defaults = {
					engines: {
						_all: 			{value: true, 	name: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL, 	url: null},
						Amazon: 		{value: false, 	name: "Amazon", 						url: "https://www.amazon.com/s?k="},
						Ask: 			{value: true, 	name: "Ask", 							url: "https://ask.com/web?q="},
						Bing: 			{value: true, 	name: "Bing", 							url: "https://www.bing.com/search?q="},
						Brave:			{value: true, 	name: "Brave",							url: "https://search.brave.com/search?q="},
						DogPile:		{value: false, 	name: "DogPile", 						url: "http://www.dogpile.com/search/web?q="},
						DuckDuckGo:		{value: true, 	name: "DuckDuckGo", 						url: "https://duckduckgo.com/?q="},
						Ecosia:			{value: false, 	name: "Ecosia", 						url: "https://www.ecosia.org/search?q="},
						Facebook: 		{value: true, 	name: "Facebook", 						url: "https://www.facebook.com/search/top/?q="},
						GitHub: 		{value: false, 	name: "GitHub", 						url: "https://github.com/search?q="},
						Google: 		{value: true, 	name: "Google", 						url: "https://www.google.com/search?q="},
						GoogleScholar: 		{value: false, 	name: "Google Scholar", 					url: "https://scholar.google.com/scholar?q="},
						Linkedin: 		{value: false, 	name: "Linkedin", 						url: "https://www.linkedin.com/search/results/all/?keywords="},
						Pinterest: 		{value: true, 	name: "Pinterest", 						url: "https://www.pinterest.com/search/pins/?q="},
						Quora: 			{value: true, 	name: "Quora", 							url: "https://www.quora.com/search?q="},
						Qwant: 			{value: false, 	name: "Qwant", 							url: "https://www.qwant.com/?t=all&q="},
						Searx: 			{value: false, 	name: "Searx", 							url: "https://searx.info/?q="},
						StackOverflow: 		{value: true, 	name: "Stack Overflow", 					url: "https://stackoverflow.com/search?q="},
						Startpage: 		{value: false, 	name: "Startpage", 						url: "https://www.startpage.com/sp/search?q="},
						UrbanDictionary: 	{value: false, 	name: "Urban Dictionary", 					url: "https://www.urbandictionary.com/define.php?term="},
						Whoogle: 		{value: false, 	name: "Whoogle", 						url: "https://search.sethforprivacy.com/search?q="},
						WolframAlpha:		{value: false, 	name: "Wolfram Alpha", 						url: "https://www.wolframalpha.com/input/?i="},
						Yahoo: 			{value: true, 	name: "Yahoo", 							url: "https://search.yahoo.com/search?p="},
						Yandex: 		{value: true, 	name: "Yandex", 						url: "https://yandex.com/search/?text="},
						YouTube: 		{value: false, 	name: "YouTube", 						url: "https://www.youtube.com/results?q="}
					}
				};
			}
			
			onStart () {
				this.forceUpdateAll();
			}
			
			onStop () {}

			getSettingsPanel (collapseStates = {}) {
				let ownEngines = BDFDB.DataUtils.load(this, "ownEngines");
				
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
				
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Search Engines",
							collapseStates: collapseStates,
							children: Object.keys(engines).filter(n => n && n != "_all").map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["engines", key],
								label: this.defaults.engines[key].name,
								value: engines[key]
							}))
						}));
						
						let values = {engineName: "", engineUrl: ""};
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Add your own Search Engine",
							collapseStates: collapseStates,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
									title: "Name:",
									className: BDFDB.disCN.marginbottom8,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										value: values.engineName,
										placeholder: values.engineName,
										errorMessage: !values.engineName && "Enter a Name" || (ownEngines[values.engineName] || this.defaults.engines[values.engineName]) && "Engine already exists",
										onChange: (value, instance) => {
											values.engineName = value.trim();
											if (!values.engineName) instance.props.errorMessage = "Enter a Name";
											else if (ownEngines[values.engineName] || this.defaults.engines[values.engineName]) instance.props.errorMessage = "Engine already exists";
											else delete instance.props.errorMessage;
											values.addButton.props.disabled = !Object.keys(values).every(valueName => values[valueName]);
											BDFDB.ReactUtils.forceUpdate(values.addButton);
										},
										inputChildren: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											disabled: !Object.keys(values).every(valueName => values[valueName]),
											children: BDFDB.LanguageUtils.LanguageStrings.ADD,
											ref: instance => {if (instance) values.addButton = instance;},
											onClick: _ => {
												ownEngines[values.engineName] = {url: values.engineUrl, enabled: true};
												BDFDB.DataUtils.save(ownEngines, this, "ownEngines");
												BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
											}
										})
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
									title: "URL:",
									className: BDFDB.disCN.marginbottom8,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										value: values.engineUrl,
										placeholder: values.engineUrl,
										errorMessage: !values.engineUrl && "Enter an URL",
										onChange: (value, instance) => {
											values.engineUrl = value.trim();
											if (!values.engineUrl) instance.props.errorMessage = "Enter an URL";
											else delete instance.props.errorMessage;
											values.addButton.props.disabled = !Object.keys(values).every(valueName => values[valueName]);
											BDFDB.ReactUtils.forceUpdate(values.addButton);
										}
									})
								})
							]
						}));
								
						if (Object.keys(ownEngines).length) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Your own Search Engines",
							collapseStates: collapseStates,
							children: Object.entries(ownEngines).map(engine => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Card, {
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									style: {width: "100%"},
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
											value: engine[0],
											placeholder: engine[0],
											size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
											maxLength: 100000000000000000000,
											onChange: value => {
												ownEngines[value] = ownEngines[engine[0]];
												delete ownEngines[engine[0]];
												engine[0] = value;
												BDFDB.DataUtils.save(ownEngines, this, "ownEngines");
											}
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
											stretch: 1,
											shrink: 0,
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
												value: engine[1].url,
												placeholder: engine[1].url,
												size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
												maxLength: 100000000000000000000,
												onChange: value => {
													ownEngines[engine[0]].url = value;
													engine[1].url = value;
													BDFDB.DataUtils.save(ownEngines, this, "ownEngines");
												}
											})
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Switch, {
											value: engine[1].enabled,
											onChange: value => {
												ownEngines[engine[0]].enabled = value;
												engine[1].enabled = value;
												BDFDB.DataUtils.save(ownEngines, this, "ownEngines");
											}
										})
									]
								}),
								onRemove: _ => {
									delete ownEngines[engine[0]];
									BDFDB.DataUtils.save(ownEngines, this, "ownEngines");
									BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel);
								}
							}))
						}));
						
						return settingsItems;
					}
				});
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

			onTextContextMenu (e) {
				this.injectItem(e);
			}

			onTextAreaContextMenu (e) {
				this.injectItem(e);
			}
			
			injectItem (e) {
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "search-google"});
				if (index > -1) {
					let text = document.getSelection().toString();
					let enginesWithoutAll = BDFDB.ObjectUtils.filter(enabledEngines, n => n != "_all", true);
					let ownEnabledEngines = BDFDB.ObjectUtils.filter(BDFDB.DataUtils.load(this, "ownEngines"), n => n.enabled);
					let engineKeys = Object.keys(Object.assign({}, enginesWithoutAll, ownEnabledEngines)).sort();
					if (engineKeys.length == 1) {
						children.splice(index, 1, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_googlesearchreplace.replace("...", this.defaults.engines[engineKeys[0]].name),
							id: children[index].props.id,
							persisting: true,
							action: event => {
								if (!event.shiftKey) BDFDB.ContextMenuUtils.close(e.instance);
								BDFDB.DiscordUtils.openLink(this.defaults.engines[engineKeys[0]].url + encodeURIComponent(text), {
									minimized: event.shiftKey
								});
							}
						}));
					}
					else {
						let items = [];
						for (let key of engineKeys) items.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.defaults.engines[key] && this.defaults.engines[key].name || key,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "search", key),
							color: key == "_all" ? BDFDB.DiscordConstants.MenuItemColors.DANGER : BDFDB.DiscordConstants.MenuItemColors.DEFAULT,
							persisting: true,
							action: event => {
								if (!event.shiftKey) BDFDB.ContextMenuUtils.close(e.instance);
								if (key == "_all") {
									for (let key2 of engineKeys) BDFDB.DiscordUtils.openLink((this.defaults.engines[key2] || ownEnabledEngines[key2]).url + encodeURIComponent(text), {
										minimized: event.shiftKey
									});
								}
								else BDFDB.DiscordUtils.openLink((this.defaults.engines[key] || ownEnabledEngines[key]).url + encodeURIComponent(text), {
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
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
