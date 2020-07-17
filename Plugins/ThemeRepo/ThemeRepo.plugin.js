//META{"name":"ThemeRepo","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ThemeRepo","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ThemeRepo/ThemeRepo.plugin.js"}*//

var ThemeRepo = (_ => {
	var _this;	
	var loading, cachedThemes, grabbedThemes, foundThemes, loadedThemes, generatorThemes, updateInterval;
	
	const themeStates = {
		UPDATED: 0,
		OUTDATED: 1,
		DOWNLOADABLE: 2
	};
	const buttonData = {
		UPDATED: {
			colorClass: "GREEN",
			backgroundColor: "STATUS_GREEN",
			text: "Updated"
		},
		OUTDATED: {
			colorClass: "RED",
			backgroundColor: "STATUS_RED",
			text: "Outdated"
		},
		DOWNLOADABLE: {
			colorClass: "BRAND",
			backgroundColor: "BRAND",
			text: "Download"
		}
	};
	const favStates = {
		FAVORIZED: 0,
		NOT_FAVORIZED: 1
	};
	const newStates = {
		NEW: 0,
		NOT_NEW: 1
	};
	const sortKeys = {
		NAME:			"Name",
		AUTHOR:			"Author",
		VERSION:		"Version",
		DESCRIPTION:	"Description",
		STATE:			"Update State",
		FAV:			"Favorites",
		NEW:			"New Themes"
	};
	const orderKeys = {
		ASC:			"Ascending",
		DESC:			"Descending"
	};
	
	const themeRepoIcon = `<svg width="36" height="31" viewBox="20 0 400 332"><path d="M0.000 39.479 L 0.000 78.957 43.575 78.957 L 87.151 78.957 87.151 204.097 L 87.151 329.236 129.609 329.236 L 172.067 329.236 172.067 204.097 L 172.067 78.957 215.642 78.957 L 259.218 78.957 259.218 39.479 L 259.218 0.000 129.609 0.000 L 0.000 0.000 0.000 39.479" stroke="none" fill="#7289da" fill-rule="evenodd"></path><path d="M274.115 38.624 L 274.115 77.248 280.261 77.734 C 309.962 80.083,325.986 106.575,313.378 132.486 C 305.279 149.131,295.114 152.700,255.800 152.700 L 230.168 152.700 230.168 123.277 L 230.168 93.855 208.566 93.855 L 186.965 93.855 186.965 211.546 L 186.965 329.236 208.566 329.236 L 230.168 329.236 230.168 277.068 L 230.168 224.899 237.268 225.113 L 244.368 225.326 282.215 277.095 L 320.062 328.864 360.031 329.057 L 400.000 329.249 400.000 313.283 L 400.000 297.317 367.924 256.908 L 335.848 216.499 340.182 214.869 C 376.035 201.391,395.726 170.616,399.382 122.342 C 405.008 48.071,360.214 0.000,285.379 0.000 L 274.115 0.000 274.115 38.624" stroke="none" fill="#7f8186" fill-rule="evenodd"></path></svg>`;
	
	const repoListComponent = class ThemeList extends BdApi.React.Component {
		render() {
			let list = BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN._repolist,
				style: {
					display: "flex",
					flexDirection: "column",
					margin: "unset",
					width: "unset"
				},
				children: [].concat(this.props.entries).filter(n => n).map(entry => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.AddonCard, entry))
			});
			BDFDB.ReactUtils.forceStyle(list, ["display", "flex-direction", "margin", "width"]);
			return list;
		}
	};
	
	let forceRerenderGenerator;
	const generatorComponent = class ThemeGenerator extends BdApi.React.Component {
		render() {
			if (forceRerenderGenerator) {
				BDFDB.TimeUtils.timeout(_ => {
					forceRerenderGenerator = false;
					BDFDB.ReactUtils.forceUpdate(this);
				}, 500);
			}
			let theme = this.props.options && loadedThemes[this.props.options.currentGenerator];
			return !this.props.options || !this.props.options.preview ? null : [
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					className: BDFDB.disCN.marginbottom20,
					type: "Select",
					label: "Choose a Generator Theme",
					basis: "70%",
					value: this.props.options.currentGenerator || "-----",
					options: ["-----"].concat(generatorThemes).map(url => {return {value:url, label:(loadedThemes[url] || {}).name || "-----"}}).sort((x, y) => (x.label < y.label ? -1 : x.label > y.label ? 1 : 0)),
					searchable: true,
					onChange: (value, instance) => {
						if (loadedThemes[value.value]) {
							if (this.props.options.currentGenerator) forceRerenderGenerator = true;
							this.props.options.currentGenerator = value.value;
							this.props.options.generatorValues = {};
						}
						else {
							delete this.props.options.currentGenerator;
							delete this.props.options.generatorValues;
						}
						delete this.props.options.currentTheme;
						_this.updateList(instance, this.props.options);
						this.props.options.preview.executeJavaScriptSafe(`window.onmessage({
							origin: "ThemeRepo",
							reason: "NewTheme",
							checked: true,
							css: ${JSON.stringify((loadedThemes[value.value] || {}).fullcss || "")}
						})`);
					}
				}),
				theme && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					className: BDFDB.disCN.marginbottom20,
					type: "Button",
					label: "Download generated Theme",
					children: "Download",
					onClick: _ => {
						_this.createThemeFile(theme.name + ".theme.css", _this.generateTheme(theme, this.props.options));
					}
				}),
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
					className: BDFDB.disCN.marginbottom20
				}),
				theme && !forceRerenderGenerator && _this.createGeneratorInputs(theme, this.props.options)
			].flat(10).filter(n => n)
		}
	};
	
	return class ThemeRepo {
		getName () {return "ThemeRepo";}

		getVersion () {return "1.9.9";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Allows you to preview all themes from the theme repo and download them on the fly. Repo button is in the theme settings.";}

		constructor () {
			this.changelog = {
				"fixed":[["Moved repo button","Repo button is now an item in the settings sidebar instead of an extra button in the themes page"]]
			};
			
			this.patchedModules = {
				before: {
					SettingsView: "render"
				}
			};
		}

		initConstructor () {
			_this = this;
			
			loading = {is:false, timeout:null, amount:0};
			
			cachedThemes = [];
			grabbedThemes = [];
			foundThemes = [];
			loadedThemes = {};
			generatorThemes = [];

			this.defaults = {
				settings: {
					useChromium: 		{value:false,		description:"Use an inbuilt browser window instead of opening your default browser"},
					keepOnTop: 			{value:false,		description:"Keep the preview window always on top"},
					notifyOutdated:		{value:true, 		description:"Notifies you when one of your Themes is outdated"},
					notifyNewentries:	{value:true, 		description:"Notifies you when there are new entries in the Repo"}
				},
				modalSettings: {
					updated: 			{value:true,	modify:true,	description:"Show updated Themes",},
					outdated:			{value:true, 	modify:true,	description:"Show outdated Themes"},
					downloadable:		{value:true, 	modify:true,	description:"Show downloadable Themes"},
					rnmStart:			{value:true, 	modify:false,	description:"Apply Theme after Download"}
				}
			};

			this.css = `
				.${this.name}-modal.repo-modal {
					max-width: 800px;
					min-height: 90vh;
					max-height: 90vh;
				}
			`;
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let customList = this.getCustomList(), customUrl = "";
			let settingsPanel, settingsItems = [];
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Settings",
				collapseStates: collapseStates,
				children: Object.keys(settings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}))
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Custom Themes",
				collapseStates: collapseStates,
				dividertop: true,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: "Add Theme:",
						tag: BDFDB.LibraryComponents.FormComponents.FormTitleTags.H3,
						className: BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom8,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							align: BDFDB.LibraryComponents.Flex.Align.CENTER,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										placeholder: "Insert Raw Github Link of Theme (https://raw.githubusercontent.com/...)",
										onChange: value => {customUrl = value.trim();}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
									onClick: _ => {
										if (customUrl) {
											customList.push(customUrl);
											BDFDB.DataUtils.save(BDFDB.ArrayUtils.removeCopies(customList), this, "custom");
											BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
										}
									},
									children: BDFDB.LanguageUtils.LanguageStrings.ADD
								})
							]
						})
					}),
					customList.length ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
						title: "Custom Theme List:",
						className: BDFDB.disCNS.margintop8 + BDFDB.disCN.marginbottom20,
						first: true,
						last: true,
						children: customList.map(url => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Card, {
							children: url,
							onRemove: _ => {
								BDFDB.ArrayUtils.remove(customList, url, true);
								BDFDB.DataUtils.save(customList, this, "custom");
								BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
							}
						}))
					}) : null,
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						type: "Button",
						color: BDFDB.LibraryComponents.Button.Colors.RED,
						label: "Remove all custom added Themes",
						onClick: _ => {
							BDFDB.ModalUtils.confirm(this, "Are you sure you want to remove all added Themes from your own list", _ => {
								BDFDB.DataUtils.save([], this, "custom");
								BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
							});
						},
						children: BDFDB.LanguageUtils.LanguageStrings.REMOVE
					})
				].flat(10).filter(n => n)
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Refetch All",
				collapseStates: collapseStates,
				dividertop: true,
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					type: "Button",
					label: "Force all Themes to be fetched again",
					onClick: _ => {
						loading = {is:false, timeout:null, amount:0};
						this.loadThemes();
					},
					children: BDFDB.LanguageUtils.LanguageStrings.ERRORS_RELOAD
				})
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

				this.loadThemes();

				updateInterval = BDFDB.TimeUtils.interval(_ => {this.checkForNewThemes();}, 1000*60*30);

				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}


		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.TimeUtils.clear(updateInterval);
				BDFDB.TimeUtils.clear(loading.timeout);

				BDFDB.ModuleUtils.forceAllUpdates(this);

				BDFDB.DOMUtils.remove(".bd-themerepobutton", ".themerepo-notice", ".themerepo-loadingicon");

				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		onUserSettingsCogContextMenu (e) {
			BDFDB.TimeUtils.timeout(_ => {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["label", "BandagedBD"]]});
				if (index > -1 && BDFDB.ArrayUtils.is(children[index].props.children)) children[index].props.children.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
					label: "Theme Repo",
					id: BDFDB.ContextMenuUtils.createItemId(this.name, "repo"),
					action: _ => {
						if (!loading.is) BDFDB.ContextMenuUtils.close(e.instance);
						this.openThemeRepoModal();
					}
				}));
			});
		}
		
		processSettingsView (e) {
			if (BDFDB.ArrayUtils.is(e.instance.props.sections) && e.instance.props.sections[0] && e.instance.props.sections[0].label == BDFDB.LanguageUtils.LanguageStrings.USER_SETTINGS && !e.instance.props.sections.find(n => n.section == "themerepo")) {
				let oldSettings = !e.instance.props.sections.find(n => n.section == "themes");
				let isPRinjected = oldSettings && e.instance.props.sections.find(n => n.section == "pluginrepo");
				let search = oldSettings ? (isPRinjected ? n => n.section == "pluginrepo" : n => n.section == BDFDB.DiscordConstants.UserSettingsSections.DEVELOPER_OPTIONS) : n => n.section == BDFDB.DiscordConstants.UserSettingsSections.CHANGE_LOG || n.section == "changelog"
				let index = e.instance.props.sections.indexOf(e.instance.props.sections.find(search));
				if (index > -1) {
					e.instance.props.sections.splice(oldSettings ? index + 1 : index - 1, 0, {
						label: "Theme Repo",
						section: "themerepo",
						onClick: _ => {this.openThemeRepoModal();}
					});
					if (oldSettings && !isPRinjected) e.instance.props.sections.splice(index + 1, 0, {section: "DIVIDER"});
				}
			}
		}
		
		getCustomList () {
			let customList = BDFDB.DataUtils.load(this, "custom");
			return BDFDB.ArrayUtils.is(customList) ? customList : [];
		}


		openThemeRepoModal (options = {}) {
			if (loading.is) BDFDB.NotificationUtils.toast(`Themes are still being fetched. Try again in some seconds.`, {type:"danger"});
			else {				
				let modalSettings = BDFDB.DataUtils.get(this, "modalSettings");
				let searchTimeout, automaticLoading = BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.automaticLoading);
				options = Object.assign(options, modalSettings);
				options.updated = options.updated && !options.showOnlyOutdated;
				options.outdated = options.updated || options.showOnlyOutdated;
				options.downloadable = options.downloadable && !options.showOnlyOutdated;
				options.searchString = "";
				options.sortKey = options.forcedSort || Object.keys(sortKeys)[0];
				options.orderKey = options.forcedOrder || Object.keys(orderKeys)[0];
				
				options.preview = BDFDB.WindowUtils.open(this, "https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/DiscordPreview.html", {
					alwaysOnTop: BDFDB.DataUtils.get(this, "settings", "keepOnTop"),
					showOnReady: true,
					frame: false,
					onLoad: _ => {
						let nativeCSS = document.querySelector("head link[rel='stylesheet'][integrity]");
						let titleBar = document.querySelector(BDFDB.dotCN.titlebar);
						options.preview.executeJavaScriptSafe(`window.onmessage({
							origin: "ThemeRepo",
							reason: "OnLoad",
							username: ${JSON.stringify(BDFDB.UserUtils.me.username || "")},
							id: ${JSON.stringify(BDFDB.UserUtils.me.id || "")},
							discriminator: ${JSON.stringify(BDFDB.UserUtils.me.discriminator || "")},
							avatar: ${JSON.stringify(BDFDB.UserUtils.getAvatar() || "")},
							classes: ${JSON.stringify(JSON.stringify(BDFDB.DiscordClasses))},
							classModules: ${JSON.stringify(JSON.stringify(BDFDB.DiscordClassModules))},
							nativeCSS: ${JSON.stringify(nativeCSS && nativeCSS.href || "")},
							htmlClassName: ${JSON.stringify(document.documentElement.className || "")},
							titleBar: ${JSON.stringify(titleBar && titleBar.outerHTML || "")}
						})`);
						options.preview.executeJavaScriptSafe(`window.onmessage({
							origin: "ThemeRepo",
							reason: "DarkLight",
							checked: ${BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themelight}
						})`);
					}
				});
				
				let entries = this.createEntries(options);
				BDFDB.ModalUtils.open(this, {
					className: "repo-modal",
					size: "LARGE",
					header: "Theme Repository",
					subheader: BDFDB.ReactUtils.createElement(class RepoAmount extends BDFDB.ReactUtils.Component {
						render () {return `${this.props.entries.length}/${Object.keys(loadedThemes).length} Themes`}
					}, {entries}),
					tabBarChildren: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SearchBar, {
								autoFocus: true,
								query: options.searchString,
								onChange: (value, instance) => {
									BDFDB.TimeUtils.clear(searchTimeout);
									searchTimeout = BDFDB.TimeUtils.timeout(_ => {
										options.searchString = value.replace(/[<|>]/g, "").toUpperCase();
										this.updateList(instance, options);
									}, 1000);
								},
								onClear: instance => {
									options.searchString = "";
									this.updateList(instance, options);
								}
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.QuickSelect, {
								label: "Sort by:",
								value: {
									label: sortKeys[options.sortKey],
									value: options.sortKey
								},
								options: Object.keys(sortKeys).filter(n => n != "NEW" || Object.keys(loadedThemes).some(t => !cachedThemes.includes(t))).map(key => ({
									label: sortKeys[key],
									value: key
								})),
								onChange: (key, instance) => {
									options.sortKey = key;
									this.updateList(instance, options);
								}
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.QuickSelect, {
								label: "Order:",
								value: {
									label: orderKeys[options.orderKey],
									value: options.orderKey
								},
								options: Object.keys(orderKeys).map(key => ({
									label: orderKeys[key],
									value: key
								})),
								onChange: (key, instance) => {
									options.orderKey = key;
									this.updateList(instance, options);
								}
							})
						})
					],
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: "Themes",
							children: BDFDB.ReactUtils.createElement(repoListComponent, {
								entries: entries
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: "Generator",
							children: BDFDB.ReactUtils.createElement(generatorComponent, {
								options: options
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: BDFDB.LanguageUtils.LanguageStrings.SETTINGS,
							children: [
								!automaticLoading && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									className: BDFDB.disCN.marginbottom8,
									children: BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCNS.titledefault + BDFDB.disCN.cursordefault,
										style: {maxWidth: 760},
										children: "To experience ThemeRepo in the best way. I would recommend you to enable BD intern reload function, that way all downloaded files are loaded into Discord without the need to reload."
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCNS.titledefault + BDFDB.disCN.cursordefault,
										style: {maxWidth: 760},
										children: "You can toggle this menu with the 'Ctrl' key to take a better look at the preview."
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									className: BDFDB.disCN.marginbottom20,
									type: "Switch",
									label: "Preview in light mode",
									value: BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themelight,
									onChange: (value, instance) => {
										options.preview.executeJavaScriptSafe(`window.onmessage({
											origin: "ThemeRepo",
											reason: "DarkLight",
											checked: ${value}
										})`);
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									className: BDFDB.disCN.marginbottom20,
									type: "Switch",
									label: "Preview with normalized classes",
									value: BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.normalizedClasses),
									onChange: (value, instance) => {
										options.preview.executeJavaScriptSafe(`window.onmessage({
											origin: "ThemeRepo",
											reason: "Normalize",
											checked: ${value}
										})`);
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									className: BDFDB.disCN.marginbottom20,
									type: "Switch",
									label: "Include Custom CSS in Preview",
									value: false,
									onChange: (value, instance) => {
										let customCSS = document.querySelector("style#customcss");
										if (customCSS && customCSS.innerText.length > 0) options.preview.executeJavaScriptSafe(`window.onmessage({
											origin: "ThemeRepo",
											reason: "CustomCSS",
											checked: ${value},
											css: ${JSON.stringify(customCSS.innerText || "")}
										})`);
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									className: BDFDB.disCN.marginbottom20,
									type: "Switch",
									label: "Include ThemeFixer CSS in Preview",
									value: false,
									onChange: (value, instance) => {
										BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeFixer.css", (error, response, body) => {
											options.preview.executeJavaScriptSafe(`window.onmessage({
												origin: "ThemeRepo",
												reason: "ThemeFixer",
												checked: ${value},
												css: ${JSON.stringify(this.createFixerCSS(body) || "")}
											})`);
										});
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									className: BDFDB.disCN.marginbottom20,
									type: "Button",
									label: "Download ThemeFixer",
									children: "Download",
									onClick: _ => {
										BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeFixer.css", (error, response, body) => {
											this.createThemeFile("ThemeFixer.theme.css", `//META{"name":"ThemeFixer","description":"ThemeFixerCSS for transparent themes","author":"DevilBro","version":"1.0.3","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien"}*//\n\n` + this.createFixerCSS(body));
										});
									}
								}),
								Object.keys(modalSettings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
									className: BDFDB.disCN.marginbottom20,
									type: "Switch",
									plugin: this,
									keys: ["modalSettings", key],
									label: this.defaults.modalSettings[key].description,
									note: key == "rnmStart" && !automaticLoading && "Automatic Loading has to be enabled",
									disabled: key == "rnmStart" && !automaticLoading,
									value: options[key],
									onChange: (value, instance) => {
										options[key] = value;
										this.updateList(instance, options);
									}
								}))
							].flat(10).filter(n => n)
						})
					],
					onClose: (modal, instance) => {
						BDFDB.WindowUtils.close(options.preview);
					}
				});
			}
		}
		
		updateList (instance, options = {}) {
			let modalIns = BDFDB.ReactUtils.findOwner(instance, {name:"BDFDB_Modal", up:true});
			if (modalIns) {
				let amountIns = BDFDB.ReactUtils.findOwner(modalIns, {name:"RepoAmount"});
				let listIns = BDFDB.ReactUtils.findOwner(modalIns, {name:"ThemeList"});
				let genIns = BDFDB.ReactUtils.findOwner(modalIns, {name:"ThemeGenerator"});
				if (amountIns && listIns && genIns) {
					let entries = this.createEntries(options);
					amountIns.props.entries = entries;
					listIns.props.entries = entries;
					BDFDB.ReactUtils.forceUpdate(amountIns, listIns, genIns);
				}
			}
		}

		createEntries (options = {}) {
			let favorites = BDFDB.DataUtils.load(this, "favorites");
			let themes = Object.keys(loadedThemes).map(url => {
				let theme = loadedThemes[url];
				let instTheme = BDFDB.BDUtils.getTheme(theme.name);
				if (instTheme && instTheme.author.toUpperCase() == theme.author.toUpperCase()) theme.state = instTheme.version != theme.version ? themeStates.OUTDATED : themeStates.UPDATED;
				else theme.state = themeStates.DOWNLOADABLE;
				return {
					url: theme.url,
					requesturl: theme.requesturl,
					search: (theme.name + " " + theme.version + " " + theme.author + " " + theme.description).toUpperCase(),
					name: theme.name,
					version: theme.version,
					author: theme.author,
					description: theme.description || "No Description found.",
					fav: favorites[url] ? favStates.FAVORIZED : favStates.NOT_FAVORIZED,
					new: !cachedThemes.includes(url) ? newStates.NEW : newStates.NOT_NEW,
					state: theme.state,
					css: theme.css,
					fullcss: theme.fullcss
				};
			});
			if (!options.updated)		themes = themes.filter(theme => theme.state != themeStates.UPDATED);
			if (!options.outdated)		themes = themes.filter(theme => theme.state != themeStates.OUTDATED);
			if (!options.downloadable)	themes = themes.filter(theme => theme.state != themeStates.DOWNLOADABLE);
			if (options.searchString) 	themes = themes.filter(theme => theme.search.indexOf(options.searchString) > -1).map(theme => Object.assign({}, theme, {
				name: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(theme.name, options.searchString))) || theme.name,
				version: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(theme.version, options.searchString))) || theme.version,
				author: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(theme.author, options.searchString))) || theme.author,
				description: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(theme.description, options.searchString))) || theme.description
			}));

			BDFDB.ArrayUtils.keySort(themes, (options.sortKey == "NEW" && !themes.some(theme => theme.new == newStates.NEW) ? Object.keys(sortKeys)[0] : options.sortKey).toLowerCase());
			if (options.orderKey == "DESC") themes.reverse();
			return themes.map(theme => {
				let buttonConfig = buttonData[(Object.entries(themeStates).find(n => n[1] == theme.state) || [])[0]]
				return buttonConfig && {
					data: theme,
					controls: [
						theme.new == newStates.NEW && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.TextBadge, {
							style: {
								borderRadius: 3,
								textTransform: "uppercase",
								background: BDFDB.DiscordConstants.Colors.STATUS_YELLOW
							},
							text: BDFDB.LanguageUtils.LanguageStrings.NEW
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FavButton, {
							className: BDFDB.disCN._repocontrolsbutton,
							isFavorite: theme.fav == favStates.FAVORIZED,
							onClick: value => {
								theme.fav = value ? favStates.FAVORIZED : favStates.NOT_FAVORIZED;
								if (value) BDFDB.DataUtils.save(true, this, "favorites", theme.url);
								else BDFDB.DataUtils.remove(this, "favorites", theme.url);
							}
						}),
						BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._repocontrolsbutton,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
								text: "Go to Source",
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									name: BDFDB.LibraryComponents.SvgIcon.Names.GITHUB,
									className: BDFDB.disCN._repoicon,
									onClick: _ => {
										let gitUrl = null;
										if (theme.requesturl.indexOf("https://raw.githubusercontent.com") == 0) {
											let temp = theme.requesturl.replace("//raw.githubusercontent", "//github").split("/");
											temp.splice(5, 0, "blob");
											gitUrl = temp.join("/");
										}
										else if (theme.requesturl.indexOf("https://gist.githubusercontent.com/") == 0) {
											gitUrl = theme.requesturl.replace("//gist.githubusercontent", "//gist.github").split("/raw/")[0];
										}
										if (gitUrl) BDFDB.DiscordUtils.openLink(gitUrl, BDFDB.DataUtils.get(this, "settings", "useChromium"));
									}
								})
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Switch, {
							value: options.currentTheme == theme.url,
							onChange: (value, instance) => {
								if (value) options.currentTheme = theme.url;
								else delete options.currentTheme;
								delete options.currentGenerator;
								delete options.generatorValues;
								this.updateList(instance, options);
								options.preview.executeJavaScriptSafe(`window.onmessage({
									origin: "ThemeRepo",
									reason: "NewTheme",
									checked: ${value},
									css: ${JSON.stringify(theme.css || "")}
								})`);
							}
						})
					],
					buttons: [
						theme.state != themeStates.DOWNLOADABLE && BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._repocontrolsbutton,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
								text: "Delete Themefile",
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									name: BDFDB.LibraryComponents.SvgIcon.Names.NOVA_TRASH,
									className: BDFDB.disCN._repoicon,
									onClick: (e, instance) => {
										this.deleteThemeFile(theme);
										BDFDB.TimeUtils.timeout(_ => {
											this.updateList(instance, options);
											this.removeTheme(theme);
										}, 3000);
									}
								})
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
							size: BDFDB.LibraryComponents.Button.Sizes.MIN,
							color: BDFDB.LibraryComponents.Button.Colors[buttonConfig.colorClass],
							style: {backgroundColor: BDFDB.DiscordConstants.Colors[buttonConfig.backgroundColor]},
							children: buttonConfig.text,
							onClick: (e, instance) => {
								this.downloadTheme(theme);
								BDFDB.TimeUtils.timeout(_ => {
									this.updateList(instance, options);
									if (options.rnmStart) this.applyTheme(theme);
								}, 3000);
							}
						})
					]
				};
			}).filter(n => n);
		}
		
		createFixerCSS (body) {
			let oldcss = body.replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r").split("REPLACE_CLASS_");
			let newcss = oldcss.shift();
			for (let str of oldcss) {
				let reg = /([A-z0-9_]+)(.*)/.exec(str);
				newcss += BDFDB.dotCN[reg[1]] + reg[2];
			}
			return newcss.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "\r");
		}
		
		createGeneratorInputs (theme, options = {}) {
			if (!options.preview || !BDFDB.ObjectUtils.is(options.generatorValues) || !BDFDB.ObjectUtils.is(theme) || !theme.fullcss) return null;
			let vars = theme.fullcss.split(":root");
			if (vars.length < 2) return null;
			vars = vars[1].replace(/\t\(/g, " (").replace(/\r|\t| {2,}/g, "").replace(/\/\*\n*((?!\/\*|\*\/).|\n)*\n+((?!\/\*|\*\/).|\n)*\n*\*\//g, "").replace(/\n\/\*.*?\*\//g, "").replace(/\n/g, "");
			vars = vars.split("{");
			vars.shift();
			vars = vars.join("{").replace(/\s*(:|;|--|\*)\s*/g, "$1");
			vars = vars.split("}")[0];
			vars = vars.slice(2).split(/;--|\*\/--/);
			let inputRefs = [], updateTimeout;
			for (let varStr of vars) {
				varStr = varStr.split(":");
				let varName = varStr.shift().trim();
				varStr = varStr.join(":").split(/;[^A-z0-9]|\/\*/);
				let oldValue = varStr.shift().trim();
				if (oldValue) {
					let childType = "text", childMode = "";
					let isColor = BDFDB.ColorUtils.getType(oldValue);
					let isComp = !isColor && /[0-9 ]+,[0-9 ]+,[0-9 ]+/g.test(oldValue);
					if (isColor || isComp) {
						childType = "color";
						childMode = isComp && "comp";
					}
					else {
						let isUrlFile = /url\(.+\)/gi.test(oldValue);
						let isFile = !isUrlFile && /(http(s)?):\/\/[(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(oldValue);
						if (isFile || isUrlFile) {
							childType = "file";
							childMode = isUrlFile && "url";
						}
					}
					let varDescription = varStr.join("").replace(/\*\/|\/\*/g, "").replace(/:/g, ": ").replace(/: \//g, ":/").replace(/--/g, " --").replace(/\( --/g, "(--").trim();
					options.generatorValues[varName] = {value:oldValue, oldValue};
					inputRefs.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						className: BDFDB.disCN.marginbottom20,
						dividerbottom: vars[vars.length-1] != varStr,
						type: "TextInput",
						childProps: {
							type: childType,
							mode: childMode,
							filter: childType == "file" && "image"
						},
						label: varName[0].toUpperCase() + varName.slice(1),
						note: varDescription && varDescription.indexOf("*") == 0 ? varDescription.slice(1) : varDescription,
						basis: "70%",
						value: oldValue,
						placeholder: oldValue,
						onChange: value => {
							BDFDB.TimeUtils.clear(updateTimeout);
							updateTimeout = BDFDB.TimeUtils.timeout(_ => {
								options.generatorValues[varName] = {value, oldValue};
								options.preview.executeJavaScriptSafe(`window.onmessage({
									origin: "ThemeRepo",
									reason: "NewTheme",
									checked: true,
									css: ${JSON.stringify(this.generateTheme(theme, options) || "")}
								})`);
							}, 1000);
						}
					}));
				}
			}
			return inputRefs;
		}
		
		generateTheme (theme, options = {}) {
			if (!BDFDB.ObjectUtils.is(theme) || !BDFDB.ObjectUtils.is(options) || !BDFDB.ObjectUtils.is(options.generatorValues)) return "";
			let css = theme.fullcss;
			for (let inputId in options.generatorValues) if (options.generatorValues[inputId].value && options.generatorValues[inputId].value.trim() && options.generatorValues[inputId].value != options.generatorValues[inputId].oldValue) css = css.replace(new RegExp(`--${BDFDB.StringUtils.regEscape(inputId)}(\\s*):(\\s*)${BDFDB.StringUtils.regEscape(options.generatorValues[inputId].oldValue)}`,"g"),`--${inputId}$1:$2${options.generatorValues[inputId].value}`);
			return css;
		}

		loadThemes () {
			BDFDB.DOMUtils.remove(".themerepo-loadingicon");
			let settings = BDFDB.DataUtils.load(this, "settings");
			let getThemeInfo, outdated = 0, newentries = 0, i = 0, NFLDreplace = null;
			let tags = ["name","description","author","version"];
			let newentriesdata = BDFDB.DataUtils.load(this, "newentriesdata"), customList = this.getCustomList();
			cachedThemes = (newentriesdata.urlbase64 ? atob(newentriesdata.urlbase64).split("\n") : []).concat(customList);
			BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeList.txt", (error, response, body) => {
				if (!error && body) {
					body = body.replace(/[\r\t]/g, "");
					BDFDB.DataUtils.save(btoa(body), this, "newentriesdata", "urlbase64");
					loadedThemes = {};
					grabbedThemes = body.split("\n").filter(n => n);
					BDFDB.LibraryRequires.request("https://github.com/NFLD99/Better-Discord", (error2, response2, body2) => {
						if (!error2 && body2) {
							NFLDreplace = /\/NFLD99\/Better-Discord\/tree\/master\/Themes_[^"]+">([^<]+)/i.exec(body2);
							NFLDreplace = NFLDreplace && NFLDreplace.length > 1 ? NFLDreplace[1] : null;
						}
						foundThemes = grabbedThemes.concat(customList);

						loading = {is:true, timeout:BDFDB.TimeUtils.timeout(_ => {
							BDFDB.TimeUtils.clear(loading.timeout);
							if (this.started) {
								if (loading.is && loading.amount < 4) BDFDB.TimeUtils.timeout(_ => {this.loadThemes();}, 10000);
								loading = {is: false, timeout:null, amount:loading.amount};
							}
						},1200000), amount:loading.amount+1};
					
						let loadingicon = BDFDB.DOMUtils.create(themeRepoIcon);
						BDFDB.DOMUtils.addClass(loadingicon, "themerepo-loadingicon");
						loadingicon.addEventListener("mouseenter", _ => {
							BDFDB.TooltipUtils.create(loadingicon, this.getLoadingTooltipText(), {
								type: "left",
								delay: 500,
								style: "max-width: unset;",
								selector: "themerepo-loading-tooltip"
							});
						});
						BDFDB.PluginUtils.addLoadingIcon(loadingicon);

						getThemeInfo(_ => {
							if (!this.started) {
								BDFDB.TimeUtils.clear(loading.timeout);
								return;
							}
							BDFDB.TimeUtils.clear(loading.timeout);
							BDFDB.DOMUtils.remove(loadingicon, ".themerepo-loadingicon");
							loading = {is:false, timeout:null, amount:loading.amount};
							
							BDFDB.LogUtils.log("Finished fetching Themes.", this.name);
							if (document.querySelector(".bd-themerepobutton")) BDFDB.NotificationUtils.toast(`Finished fetching Themes.`, {type:"success"});
							
							if ((settings.notifyOutdated || settings.notifyOutdated == undefined) && outdated > 0) {
								let oldbarbutton = document.querySelector(".themerepo-outdate-notice " + BDFDB.dotCN.noticedismiss);
								if (oldbarbutton) oldbarbutton.click();
								let bar = BDFDB.NotificationUtils.notice(`${outdated} of your Themes ${outdated == 1 ? "is" : "are"} outdated. Check:`, {
									type: "danger",
									btn: "ThemeRepo",
									selector: "themerepo-notice themerepo-outdate-notice",
									customicon: themeRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#7f8186/gi, "#B9BBBE")
								});
								bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", _ => {
									this.openThemeRepoModal({showOnlyOutdated:true});
									bar.querySelector(BDFDB.dotCN.noticedismiss).click();
								});
							}
							
							if ((settings.notifyNewentries || settings.notifyNewentries == undefined) && newentries > 0) {
								let oldbarbutton = document.querySelector(".themerepo-newentries-notice " + BDFDB.dotCN.noticedismiss);
								if (oldbarbutton) oldbarbutton.click();
								let single = newentries == 1;
								let bar = BDFDB.NotificationUtils.notice(`There ${single ? "is" : "are"} ${newentries} new Theme${single ? "" : "s"} in the Repo. Check:`, {
									type: "success",
									btn: "ThemeRepo",
									selector: "themerepo-notice themerepo-newentries-notice",
									customicon: themeRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#7f8186/gi, "#B9BBBE")
								});
								bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", _ => {
									this.openThemeRepoModal({forcedSort:"new",forcedOrder:"asc"});
									bar.querySelector(BDFDB.dotCN.noticedismiss).click();
								});
							}
							
							if (BDFDB.UserUtils.me.id == "278543574059057154") {
								let wrongUrls = [];
								for (let url of foundThemes) if (url && !loadedThemes[url] && !wrongUrls.includes(url)) wrongUrls.push(url);
								if (wrongUrls.length) {
									let bar = BDFDB.NotificationUtils.notice(`ThemeRepo: ${wrongUrls.length} Theme${wrongUrls.length > 1 ? "s" : ""} could not be loaded.`, {
										type: "danger",
										btn: "List",
										selector: "themerepo-notice themerepo-fail-notice",
										customicon: themeRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#7f8186/gi, "#B9BBBE")
									});
									bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", e => {
										let toast = BDFDB.NotificationUtils.toast(wrongUrls.join("\n"), {type: "error"});
										toast.style.setProperty("overflow", "hidden");
										for (let url of wrongUrls) console.log(url);
									});
								}
							}
							
							BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/GeneratorList.txt", (error3, response3, body3) => {
								if (!error3 && body3) for (let url of body3.replace(/[\r\t]/g, "").split("\n").filter(n => n)) if (loadedThemes[url]) generatorThemes.push(url);
							});
						});
					});
				}
			});
			 
			getThemeInfo = (callback) => {
				if (i >= foundThemes.length || !this.started || !loading.is) {
					callback();
					return;
				}
				let url = foundThemes[i];
				let requesturl = NFLDreplace && url.includes("NFLD99/Better-Discord/master/Themes") ? url.replace("master/Themes", "master/" + NFLDreplace) : url;
				BDFDB.LibraryRequires.request(requesturl, (error, response, body) => {
					if (!response) {
						if (url && BDFDB.ArrayUtils.getAllIndexes(foundThemes, url).length < 2) foundThemes.push(url);
					}
					else if (body && body.indexOf("404: Not Found") != 0 && response.statusCode == 200) {
						let theme = {}, text = body;
						if ((text.split("*//").length > 1 || text.indexOf("/**") == 0) && text.split("\n").length > 1) {
							let hasMETAline = text.replace(/\s/g, "").indexOf("//META{");
							if (hasMETAline < 20 && hasMETAline > -1) {
								let searchtext = text.replace(/\s*:\s*/g, ":").replace(/\s*}\s*/g, "}");
								for (let tag of tags) {
									let result = searchtext.split('"' + tag + '":"');
									result = result.length > 1 ? result[1].split('",')[0].split('"}')[0] : null;
									result = result && tag != "version" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
									theme[tag] = result ? result.trim() : result;
								}
							}
							else {
								let searchtext = text.replace(/[\r\t| ]*\*\s*/g, "*");
								for (let tag of tags) {
									let result = searchtext.split('@' + tag + ' ');
									result = result.length > 1 ? result[1].split('\n')[0] : null;
									result = result && tag != "version" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
									theme[tag] = result ? result.trim() : result;
								}
							}
							
							let valid = true;
							for (let tag of tags) if (theme[tag] === null) valid = false;
							if (valid) {
								theme.fullcss = text;
								theme.css = hasMETAline < 20 && hasMETAline > -1 ? text.split("\n").slice(1).join("\n").replace(/[\r|\n|\t]/g, "") : text.replace(/[\r|\n|\t]/g, "");
								theme.url = url;
								theme.requesturl = requesturl;
								loadedThemes[url] = theme;
								let instTheme = BDFDB.BDUtils.getTheme(theme.name);
								if (instTheme && instTheme.author.toUpperCase() == theme.author.toUpperCase() && instTheme.version != theme.version) outdated++;
								if (!cachedThemes.includes(url)) newentries++;
							}
						}
					}
					i++;
					
					let loadingTooltip = document.querySelector(".themerepo-loading-tooltip");
					if (loadingTooltip) {
						BDFDB.DOMUtils.setText(loadingTooltip.querySelector(BDFDB.dotCN.tooltipcontent), this.getLoadingTooltipText());
						loadingTooltip.update();
					}
					
					getThemeInfo(callback);
				});
			}
		}

		getLoadingTooltipText () {
			return `Loading ThemeRepo - [${Object.keys(loadedThemes).length}/${Object.keys(grabbedThemes).length}]`;
		}

		checkForNewThemes () {
			BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeList.txt", (error, response, result) => {
				if (response && !BDFDB.equals(result.replace(/\t|\r/g, "").split("\n").filter(n => n), grabbedThemes)) {
					loading = {is:false, timeout:null, amount:0};
					this.loadThemes();
				}
			});
		}

		downloadTheme (data) {
			BDFDB.LibraryRequires.request(data.requesturl, (error, response, body) => {
				if (error) BDFDB.NotificationUtils.toast(`Unable to download Theme "${data.name}".`, {type:"danger"});
				else this.createThemeFile(data.requesturl.split("/").pop(), body);
			});
		}

		createThemeFile (filename, content) {
			BDFDB.LibraryRequires.fs.writeFile(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getThemesFolder(), filename), content, (error) => {
				if (error) BDFDB.NotificationUtils.toast(`Unable to save Theme "${filename}".`, {type:"danger"});
				else BDFDB.NotificationUtils.toast(`Successfully saved Theme "${filename}".`, {type:"success"});
			});
		}

		applyTheme (data) {
			if (BDFDB.BDUtils.isThemeEnabled(data.name) == false) {
				let id = data.name.replace(/^[^a-z]+|[^\w-]+/gi, "-");
				BDFDB.DOMUtils.remove(`style#${id}`);
				document.head.appendChild(BDFDB.DOMUtils.create(`<style id=${id}>${data.css}</style>`));
				BDFDB.BDUtils.enableTheme(data.name, false);
				BDFDB.LogUtils.log(`Applied Theme ${data.name}.`, this.name);
			}
		}

		deleteThemeFile (data) {
			let filename = data.requesturl.split("/").pop();
			BDFDB.LibraryRequires.fs.unlink(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getThemesFolder(), filename), (error) => {
				if (error) BDFDB.NotificationUtils.toast(`Unable to delete Theme "${filename}".`, {type:"danger"});
				else BDFDB.NotificationUtils.toast(`Successfully deleted Theme "${filename}".`);
			});
		}

		removeTheme (data) {
			if (BDFDB.BDUtils.isThemeEnabled(data.name) == true) {
				let id = data.name.replace(/^[^a-z]+|[^\w-]+/gi, "-");
				BDFDB.DOMUtils.remove(`style#${id}`);
				BDFDB.BDUtils.disableTheme(data.name, false);
				BDFDB.LogUtils.log(`Removed Theme ${data.name}.`, this.name);
			}
		}
	}
})();