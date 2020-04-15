//META{"name":"PluginRepo","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/PluginRepo","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/PluginRepo/PluginRepo.plugin.js"}*// 

var PluginRepo = (_ => {
	var loading, cachedPlugins, grabbedPlugins, foundPlugins, loadedPlugins, updateInterval;
	
	const pluginStates = {
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
		NEW:			"New Plugins"
	};
	const orderKeys = {
		ASC:			"Ascending",
		DESC:			"Descending"
	};
	
	const pluginRepoIcon = `<svg width="34" height="31" viewBox="0 0 400 382"><path d="M0.000 183.023 L 0.000 366.046 46.377 366.046 L 92.754 366.046 92.754 312.629 L 92.754 259.213 127.223 259.213 C 174.433 259.213,187.432 257.146,210.766 245.926 C 311.105 197.681,301.344 41.358,195.859 7.193 C 173.603 -0.015,173.838 0.000,80.846 0.000 L 0.000 0.000 0.000 183.023 M157.615 88.195 C 193.007 97.413,198.827 152.678,166.407 171.674 C 158.993 176.019,155.494 176.398,122.807 176.398 L 92.754 176.398 92.754 131.677 L 92.754 86.957 122.807 86.957 C 146.807 86.957,153.819 87.206,157.615 88.195" stroke="none" fill="#7289da" fill-rule="evenodd"></path><path d="M226.647 3.824 C 258.085 21.580,282.721 54.248,291.095 89.281 C 292.183 93.834,293.041 95.659,294.560 96.655 C 310.880 107.348,312.400 140.701,297.286 156.464 C 293.685 160.221,293.134 161.348,291.162 169.006 C 282.026 204.468,259.916 235.185,230.701 253.002 C 229.548 253.705,235.510 262.261,270.237 309.731 L 311.131 365.631 355.565 365.846 L 400.000 366.060 400.000 348.309 L 400.000 330.557 364.338 285.630 L 328.676 240.703 333.494 238.892 C 373.356 223.907,395.248 189.691,399.313 136.020 C 404.504 67.495,372.510 19.710,311.375 4.675 C 294.592 0.548,287.694 -0.000,252.482 0.000 L 219.876 0.000 226.647 3.824 M202.899 265.964 C 183.869 272.635,168.536 274.960,139.752 275.540 L 116.770 276.003 116.770 321.024 L 116.770 366.046 163.975 366.046 L 211.180 366.046 211.180 314.700 C 211.180 286.460,210.901 263.386,210.559 263.425 C 210.217 263.464,206.770 264.607,202.899 265.964" stroke="none" fill="#7f8186" fill-rule="evenodd"></path></svg>`;
	
	const repoListComponent = class PluginList extends BdApi.React.Component {
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
	
	return class PluginRepo {
		getName () {return "PluginRepo";} 

		getVersion () {return "1.9.7";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Allows you to look at all plugins from the plugin repo and download them on the fly. Repo button is in the plugins settings.";}

		constructor () {
			this.changelog = {
				"improved":[["Loading","Switched from using and iFrame to using an extra Browser Window to load the plugin list, should be faster too"]]
			};	
			
			this.patchedModules = {
				after: {
					V2C_ContentColumn: "render"
				}
			};
		}

		initConstructor () {
			loading = {is:false, timeout:null, amount:0};

			cachedPlugins = [];
			grabbedPlugins = [];
			foundPlugins = [];
			loadedPlugins = {};

			this.defaults = {
				settings: {
					useChromium: 		{value:false,	description:"Use an inbuilt browser window instead of opening your default browser"},
					notifyOutdated:		{value:true, 	description:"Notifies you when one of your Plugins is outdated"},
					notifyNewentries:	{value:true, 	description:"Notifies you when there are new entries in the Repo"}
				},
				modalSettings: {
					updated: 			{value:true,	modify:true,	description:"Show updated Plugins",},
					outdated:			{value:true, 	modify:true,	description:"Show outdated Plugins"},
					downloadable:		{value:true, 	modify:true,	description:"Show downloadable Plugins"},
					rnmStart:			{value:true, 	modify:false,	description:"Start Plugin after Download"}
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
				title: "Custom Plugins",
				collapseStates: collapseStates,
				dividertop: true,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: "Add Plugin:",
						tag: BDFDB.LibraryComponents.FormComponents.FormTitleTags.H3,
						className: BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom8,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							align: BDFDB.LibraryComponents.Flex.Align.CENTER,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										placeholder: customUrl,
										placeholder: "Insert Raw Github Link of Plugin (https://raw.githubusercontent.com/...)",
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
						title: "Custom Plugin List:",
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
						label: "Remove all custom added Plugins",
						onClick: _ => {
							BDFDB.ModalUtils.confirm(this, "Are you sure you want to remove all added Plugins from your own list", _ => {
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
					label: "Force all Plugins to be fetched again",
					onClick: _ => {
						loading = {is:false, timeout:null, amount:0};
						this.loadPlugins();
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

				this.loadPlugins();

				updateInterval = BDFDB.TimeUtils.interval(_ => {this.checkForNewPlugins();},1000*60*30);

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

				BDFDB.DOMUtils.remove(".bd-pluginrepobutton", ".pluginrepo-notice", ".pluginrepo-loadingicon");

				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		onUserSettingsCogContextMenu (e) {
			BDFDB.TimeUtils.timeout(_ => {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["label", "BandagedBD"]]});
				if (index > -1) children[index].props.render.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
					label: "Plugin Repo",
					action: _ => {
						if (!loading.is) BDFDB.ContextMenuUtils.close(e.instance);
						this.openPluginRepoModal();
					}
				}));
			});
		}
		
		processV2CContentColumn (e) {
			if (typeof e.instance.props.title == "string" && e.instance.props.title.toUpperCase().indexOf("PLUGINS") == 0) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {key: "folder-button"});
				if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: "Open Plugin Repo",
					children: BDFDB.ReactUtils.createElement("button", {
						className: `${BDFDB.disCNS._repobutton + BDFDB.disCN._repofolderbutton} bd-pluginrepobutton`,
						onClick: _ => {this.openPluginRepoModal();},
						children: "PluginRepo"
					})
				}));
			}
		}
		
		getCustomList () {
			let customList = BDFDB.DataUtils.load(this, "custom");
			return BDFDB.ArrayUtils.is(customList) ? customList : [];
		}

		openPluginRepoModal (options = {}) {
			if (loading.is) BDFDB.NotificationUtils.toast(`Plugins are still being fetched. Try again in some seconds.`, {type:"danger"});
			else {
				let modalSettings = BDFDB.DataUtils.get(this, "modalSettings");
				let searchTimeout, automaticLoading = BDFDB.BDUtils.isAutoLoadEnabled();
				options = Object.assign(options, modalSettings);
				options.updated = options.updated && !options.showOnlyOutdated;
				options.outdated = options.updated || options.showOnlyOutdated;
				options.downloadable = options.downloadable && !options.showOnlyOutdated;
				options.searchString = "";
				options.sortKey = options.forcedSort || Object.keys(sortKeys)[0];
				options.orderKey = options.forcedOrder || Object.keys(orderKeys)[0];
				
				let entries = this.createEntries(options);
				BDFDB.ModalUtils.open(this, {
					className: "repo-modal",
					size: "LARGE",
					header: "Plugin Repository",
					subheader: BDFDB.ReactUtils.createElement(class RepoAmount extends BDFDB.ReactUtils.Component {
						render () {return `${this.props.entries.length}/${Object.keys(loadedPlugins).length} Plugins`}
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
								options: Object.keys(sortKeys).filter(n => n != "NEW" || Object.keys(loadedPlugins).some(p => !cachedPlugins.includes(p))).map(key => ({
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
							tab: "Plugins",
							children: BDFDB.ReactUtils.createElement(repoListComponent, {
								plugin: this,
								entries: entries
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: BDFDB.LanguageUtils.LanguageStrings.SETTINGS,
							children: [
								!automaticLoading && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCNS.titledefault + BDFDB.disCN.cursordefault,
										style: {maxWidth: 760},
										children: "To experience PluginRepo in the best way. I would recommend you to enable BD intern reload function, that way all downloaded files are loaded into Discord without the need to reload."
									})
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
					]
				});
			}
		}
		
		updateList (instance, options = {}) {
			let modalIns = BDFDB.ReactUtils.findOwner(instance, {name:"BDFDB_Modal", up:true});
			if (modalIns) {
				let listIns = BDFDB.ReactUtils.findOwner(modalIns, {name:"PluginList"});
				let amountIns = BDFDB.ReactUtils.findOwner(modalIns, {name:"RepoAmount"});
				if (listIns && amountIns) {
					let entries = this.createEntries(options);
					listIns.props.entries = entries;
					amountIns.props.entries = entries;
					BDFDB.ReactUtils.forceUpdate(listIns, amountIns);
				}
			}
		}

		createEntries (options = {}) {
			let favorites = BDFDB.DataUtils.load(this, "favorites");
			let plugins = Object.keys(loadedPlugins).map(url => {
				let plugin = loadedPlugins[url];
				let instPlugin = BDFDB.BDUtils.getPlugin(plugin.getName);
				if (instPlugin && typeof instPlugin.getAuthor == "function" && this.getString(instPlugin.getAuthor()).toUpperCase() == plugin.getAuthor.toUpperCase()) plugin.getState = this.getString(instPlugin.getVersion()) != plugin.getVersion ? pluginStates.OUTDATED : pluginStates.UPDATED;
				else plugin.getState = pluginStates.DOWNLOADABLE;
				return {
					url: plugin.url,
					search: (plugin.getName + " " + plugin.getVersion + " " + plugin.getAuthor + " " + plugin.getDescription).toUpperCase(),
					name: plugin.getName,
					version: plugin.getVersion,
					author: plugin.getAuthor,
					description: plugin.getDescription || "No Description found.",
					fav: favorites[url] ? favStates.FAVORIZED : favStates.NOT_FAVORIZED,
					new: !cachedPlugins.includes(url) ? newStates.NEW : newStates.NOT_NEW,
					state: plugin.getState
				};
			});
			if (!options.updated)		plugins = plugins.filter(plugin => plugin.state != pluginStates.UPDATED);
			if (!options.outdated)		plugins = plugins.filter(plugin => plugin.state != pluginStates.OUTDATED);
			if (!options.downloadable)	plugins = plugins.filter(plugin => plugin.state != pluginStates.DOWNLOADABLE);
			if (options.searchString) 	plugins = plugins.filter(plugin => plugin.search.indexOf(options.searchString) > -1).map(plugin => Object.assign({}, plugin, {
				name: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(plugin.name, options.searchString))) || plugin.name,
				version: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(plugin.version, options.searchString))) || plugin.version,
				author: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(plugin.author, options.searchString))) || plugin.author,
				description: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(plugin.description, options.searchString))) || plugin.description
			}));

			BDFDB.ArrayUtils.keySort(plugins, (options.sortKey == "NEW" && !plugins.some(plugin => plugin.new == newStates.NEW) ? Object.keys(sortKeys)[0] : options.sortKey).toLowerCase());
			if (options.orderKey == "DESC") plugins.reverse();
			return plugins.map(plugin => {
				let buttonConfig = buttonData[(Object.entries(pluginStates).find(n => n[1] == plugin.state) || [])[0]]
				return buttonConfig && {
					data: plugin,
					controls: [
						plugin.new == newStates.NEW && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.TextBadge, {
							style: {
								borderRadius: 3,
								textTransform: "uppercase",
								background: BDFDB.DiscordConstants.Colors.STATUS_YELLOW
							},
							text: BDFDB.LanguageUtils.LanguageStrings.NEW
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FavButton, {
							className: BDFDB.disCN._repocontrolsbutton,
							isFavorite: plugin.fav == favStates.FAVORIZED,
							onClick: value => {
								plugin.fav = value ? favStates.FAVORIZED : favStates.NOT_FAVORIZED;
								if (value) BDFDB.DataUtils.save(true, this, "favorites", plugin.url);
								else BDFDB.DataUtils.remove(this, "favorites", plugin.url);
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
										if (plugin.url.indexOf("https://raw.githubusercontent.com") == 0) {
											let temp = plugin.url.replace("//raw.githubusercontent", "//github").split("/");
											temp.splice(5, 0, "blob");
											gitUrl = temp.join("/");
										}
										else if (plugin.url.indexOf("https://gist.githubusercontent.com/") == 0) {
											gitUrl = plugin.url.replace("//gist.githubusercontent", "//gist.github").split("/raw/")[0];
										}
										if (gitUrl) BDFDB.DiscordUtils.openLink(gitUrl, BDFDB.DataUtils.get(this, "settings", "useChromium"));
									}
								})
							})
						}),
					],
					buttons: [
						plugin.state != pluginStates.DOWNLOADABLE && BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._repocontrolsbutton,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
								text: "Delete Pluginfile",
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									name: BDFDB.LibraryComponents.SvgIcon.Names.NOVA_TRASH,
									className: BDFDB.disCN._repoicon,
									onClick: (e, instance) => {
										this.deletePluginFile(plugin);
										BDFDB.TimeUtils.timeout(_ => {
											this.updateList(instance, options);
											if (!BDFDB.BDUtils.isAutoLoadEnabled()) this.stopPlugin(plugin);
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
								this.downloadPlugin(plugin);
								BDFDB.TimeUtils.timeout(_ => {
									this.updateList(instance, options);
									if (options.rnmStart) this.startPlugin(plugin);
								}, 3000);
							}
						})
					]
				};
			}).filter(n => n);
		}

		loadPlugins () {
			BDFDB.DOMUtils.remove(".pluginrepo-loadingicon");
			let settings = BDFDB.DataUtils.load(this, "settings");
			let getPluginInfo, extractConfigInfo, createSandbox, runInSandbox;
			let sandbox, sandboxRunning = false, sandboxQueue = [], outdated = 0, newentries = 0, i = 0;
			let tags = ["getName", "getVersion", "getAuthor", "getDescription"];
			let seps = ["\"", "\'", "\`"];
			let newentriesdata = BDFDB.DataUtils.load(this, "newentriesdata"), customList = this.getCustomList();
			cachedPlugins = (newentriesdata.urlbase64 ? atob(newentriesdata.urlbase64).split("\n") : []).concat(customList);
			BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/PluginRepo/res/PluginList.txt", (error, response, result) => {
				if (!error && result) {
					result = result.replace(/[\r\t]/g, "");
					BDFDB.DataUtils.save(btoa(result), this, "newentriesdata", "urlbase64");
					
					loadedPlugins = {};
					grabbedPlugins = result.split("\n").filter(n => n);
					foundPlugins = grabbedPlugins.concat(customList);
					
					loading = {is:true, timeout:BDFDB.TimeUtils.timeout(_ => {
						BDFDB.TimeUtils.clear(loading.timeout);
						if (this.started) {
							if (loading.is && loading.amount < 4) BDFDB.TimeUtils.timeout(_ => {this.loadPlugins();},10000);
							loading = {is: false, timeout:null, amount:loading.amount};
						}
					},1200000), amount:loading.amount+1};
					
					let loadingIcon = BDFDB.DOMUtils.create(pluginRepoIcon);
					BDFDB.DOMUtils.addClass(loadingIcon, "pluginrepo-loadingicon");
					loadingIcon.addEventListener("mouseenter", _ => {
						BDFDB.TooltipUtils.create(loadingIcon, this.getLoadingTooltipText(), {
							type: "left",
							delay: 500,
							style: "max-width: unset;",
							selector: "pluginrepo-loading-tooltip"
						});
					});
					BDFDB.PluginUtils.addLoadingIcon(loadingIcon);

					createSandbox().then(_ => {
						getPluginInfo(_ => {
							if (!this.started) {
								BDFDB.TimeUtils.clear(loading.timeout);
								BDFDB.WindowUtils.close(sandbox);
								return;
							}
							let finishCounter = 0, finishInterval = BDFDB.TimeUtils.interval(_ => { 
								if ((sandboxQueue.length == 0 && !sandboxRunning) || finishCounter > 300 || !loading.is) {
									BDFDB.TimeUtils.clear(loading.timeout);
									BDFDB.TimeUtils.clear(finishInterval);
									BDFDB.WindowUtils.close(sandbox);
									BDFDB.DOMUtils.remove(loadingIcon, ".pluginrepo-loadingicon");
									loading = {is:false, timeout:null, amount:loading.amount};
									
									BDFDB.LogUtils.log("Finished fetching Plugins.", this.name);
									if (document.querySelector(".bd-pluginrepobutton")) BDFDB.NotificationUtils.toast(`Finished fetching Plugins.`, {type:"success"});
									
									if ((settings.notifyOutdated || settings.notifyOutdated == undefined) && outdated > 0) {
										let oldbarbutton = document.querySelector(".pluginrepo-outdate-notice " + BDFDB.dotCN.noticedismiss);
										if (oldbarbutton) oldbarbutton.click();
										let bar = BDFDB.NotificationUtils.notice(`${outdated} of your Plugins ${outdated == 1 ? "is" : "are"} outdated. Check:`, {
											type: "danger",
											btn: "PluginRepo",
											selector: "pluginrepo-notice pluginrepo-outdate-notice",
											customicon: pluginRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#7f8186/gi, "#B9BBBE")
										});
										bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", _ => {
											this.openPluginRepoModal({showOnlyOutdated:true});
											bar.querySelector(BDFDB.dotCN.noticedismiss).click();
										});
									}
									
									if ((settings.notifyNewentries || settings.notifyNewentries == undefined) && newentries > 0) {
										let oldbarbutton = document.querySelector(".pluginrepo-newentries-notice " + BDFDB.dotCN.noticedismiss);
										if (oldbarbutton) oldbarbutton.click();
										let single = newentries == 1;
										let bar = BDFDB.NotificationUtils.notice(`There ${single ? "is" : "are"} ${newentries} new Plugin${single ? "" : "s"} in the Repo. Check:`, {
											type: "success",
											btn: "PluginRepo",
											selector: "pluginrepo-notice pluginrepo-newentries-notice",
											customicon: pluginRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#7f8186/gi, "#B9BBBE")
										});
										bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", _ => {
											this.openPluginRepoModal({forcedSort:"NEW", forcedOrder:"ASC"});
											bar.querySelector(BDFDB.dotCN.noticedismiss).click();
										});
									}
									
									if (BDFDB.UserUtils.me.id == "278543574059057154") {
										let wrongUrls = [];
										for (let url of foundPlugins) if (url && !loadedPlugins[url] && !wrongUrls.includes(url)) wrongUrls.push(url);
										if (wrongUrls.length) {
											let bar = BDFDB.NotificationUtils.notice(`PluginRepo: ${wrongUrls.length} Plugin${wrongUrls.length > 1 ? "s" : ""} could not be loaded.`, {
												type: "danger",
												btn: "List",
												selector: "pluginrepo-notice pluginrepo-fail-notice",
												customicon: pluginRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#7f8186/gi, "#B9BBBE")
											});
											bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", e => {
												let toast = BDFDB.NotificationUtils.toast(wrongUrls.join("\n"), {type: "error"});
												toast.style.setProperty("overflow", "hidden");
												for (let url of wrongUrls) console.log(url);
											});
										}
									}
								}
								else finishCounter++;
							},1000);
						});
					});
				}
			});

			getPluginInfo = callback => {
				if (i >= foundPlugins.length || !this.started || !loading.is) {
					callback();
					return;
				}
				let url = foundPlugins[i];
				BDFDB.LibraryRequires.request(url, (error, response, body) => {
					if (!response) {
						if (url && BDFDB.ArrayUtils.getAllIndexes(foundPlugins, url).length < 2) foundPlugins.push(url);
					}
					else if (body && body.indexOf("404: Not Found") != 0 && response.statusCode == 200) {
						let plugin = {};
						let bodyCopy = body;
						if (body.length / body.split("\n").length > 1000) {
							/* code is minified -> add newlines */
							bodyCopy = body.replace(/}/g, "}\n");
						}
						let bodyWithoutSpecial = bodyCopy.replace(/\n|\r|\t/g, "").replace(/\n|\r|\t/g, "");
						let configReg = /(\.exports|config)\s*=\s*\{\s*["'`]*info["'`]*\s*:\s*/i.exec(bodyWithoutSpecial);
						if (url != "https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/PluginRepo/PluginRepo.plugin.js" && configReg) {
							try {
								extractConfigInfo(plugin, JSON.parse('{"info":' + bodyWithoutSpecial.substring(configReg.index).split(configReg[0])[1].split("};")[0].split("}},")[0] + '}'));
							}
							catch (err) {
								try {
									let i = 0, j = 0, configString = "";
									for (let c of (bodyWithoutSpecial.substring(configReg.index).split(configReg[0])[1].split("};")[0].split("}},")[0]).replace(/,/g, ',"').replace(/:/g, '":').replace(/{/g, '{"').replace(/""/g, '"').replace(/" /g, ' ').replace(/,"{/g, ',{').replace(/,"\[/g, ',[').replace(/":\/\//g, ':\/\/')) {
										configString += c;
										if (c == "{") i++;
										else if (c == "}") j++;
										if (i > 0 && i == j) break;
									}
									extractConfigInfo(plugin, JSON.parse('{"info":' + configString + '}'));
								}
								catch (err2) {}
							}
						}
						else {
							for (let tag of tags) {
								let result = new RegExp(tag + "[\\s|\\t|\\n|\\r|=|>|_|:|function|\(|\)|\{|return]*([\"|\'|\`]).*\\1","gi").exec(bodyCopy);
								if (!result) result = new RegExp("get " + tag.replace("get", "").toLowerCase() + "[\\s|\\t|\\n|\\r|=|>|_|:|function|\(|\)|\{|return]*([\"|\'|\`]).*\\1","gi").exec(bodyCopy);
								if (result) {
									let separator = result[1];
									result = result[0].replace(new RegExp("\\\\" + separator, "g"), separator).split(separator);
									if (result.length > 2) {
										result = result.slice(1, -1).join(separator).replace(/\\n/g, "<br>").replace(/\\/g, "");
										result = tag != "getVersion" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
										plugin[tag] = result ? result.trim() : result;
									}
								}
							}
						}
						
						if (!tags.some(tag => !plugin[tag] || plugin[tag].length > 10000)) {
							plugin.url = url;
							loadedPlugins[url] = plugin;
							if (this.isPluginOutdated(plugin, url)) outdated++;
							if (!cachedPlugins.includes(url)) newentries++;
						}
						else if (sandbox) {
							sandboxQueue.push({body, url});
							runInSandbox();
						}
					}
					i++;
					
					let loadingTooltip = document.querySelector(".pluginrepo-loading-tooltip");
					if (loadingTooltip) {
						BDFDB.DOMUtils.setText(loadingTooltip, this.getLoadingTooltipText());
						loadingTooltip.update();
					}
					
					getPluginInfo(callback);
				});
			};
			
			extractConfigInfo = (plugin, config) => {
				plugin.getName = BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(config.info.name);
				plugin.getDescription = BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(config.info.description);
				plugin.getVersion = config.info.version;
				plugin.getAuthor = "";
				if (typeof config.info.author == "string") plugin.getAuthor = BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(config.info.author);
				else if (typeof config.info.authors == "string") plugin.getAuthor = BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(config.info.authors);
				else if (Array.isArray(config.info.authors)) for (let author of config.info.authors) {
					plugin.getAuthor += (plugin.getAuthor + (plugin.getAuthor ? ", " : "") + BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(typeof author == "string" ? author : author.name || ""));
				}
			};

			createSandbox = _ => {
				return new Promise(callback => {
					let loadTimeout = BDFDB.TimeUtils.timeout(_ => {
						callback();
					}, 600000);
					sandbox = BDFDB.WindowUtils.open(this, "https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/DiscordPreview.html", {
						onLoad: _ => {
							BDFDB.TimeUtils.clear(loadTimeout);
							sandbox.executeJavaScriptSafe(`window.onmessage({
								origin: "PluginRepo",
								reason: "OnLoad",
								classes: ${JSON.stringify(JSON.stringify(BDFDB.DiscordClasses))},
								classModules: ${JSON.stringify(JSON.stringify(BDFDB.DiscordClassModules))}
							})`);
							callback();
						}
					});
				});
			}

			runInSandbox = _ => {
				if (sandboxRunning) return;
				let sandboxData = sandboxQueue.shift();
				if (!sandboxData) return;
				let {body, url} = sandboxData;
				let name = (body.replace(/\s*:\s*/g, ":").split('"name":"')[1] || "").split('"')[0];
				name = name ? name : (body.replace(/ {2,}/g, " ").replace(/\r/g, "").split("@name ")[1] || "").split("\n")[0];
				if (name) {
					let messageId = (this.name + name + BDFDB.NumberUtils.generateId()).replace(/\s/g, "").trim();
					sandboxRunning = true;
					BDFDB.WindowUtils.addListener(this, messageId, (event, messageData) => {
						BDFDB.WindowUtils.removeListener(this, messageId);
						if (BDFDB.ObjectUtils.is(messageData.plugin)) {
							messageData.plugin.url = url;
							loadedPlugins[url] = messageData.plugin;
							if (this.isPluginOutdated(messageData.plugin, url)) outdated++;
							if (!cachedPlugins.includes(url)) newentries++;
						}
						sandboxRunning = false;
						runInSandbox();
					});
					sandbox.executeJavaScriptSafe(`
						let result = null;
						try {
							${body};
							let p = new ${name}();
							result = {
								"getName": getString(p.getName()),
								"getAuthor": getString(p.getAuthor()),
								"getVersion": getString(p.getVersion()),
								"getDescription": getString(p.getDescription())
							};
						}
						catch (err) {}
						window.respondToParent({
							hostId: ${BDFDB.LibraryRequires.electron.remote.getCurrentWindow().webContents.id},
							hostName: "${messageId}",
							plugin: result
						});
					`);
				}
			}
		}

		getLoadingTooltipText () {
			return `Loading PluginRepo - [${Object.keys(loadedPlugins).length}/${Object.keys(grabbedPlugins).length}]`;
		}
		
		isPluginOutdated (plugin, url) {
			let instPlugin = BDFDB.BDUtils.getPlugin(plugin.getName);
			return instPlugin && typeof instPlugin.getAuthor == "function" && this.getString(instPlugin.getAuthor()).toUpperCase() == plugin.getAuthor.toUpperCase() && this.getString(instPlugin.getVersion()) != plugin.getVersion && !this.pluginHasUpdateCheck(url);
		}
		
		pluginHasUpdateCheck (url) {
			if (!BDFDB.ObjectUtils.is(window.PluginUpdates) || !BDFDB.ObjectUtils.is(window.PluginUpdates.plugins)) return false;
			if (window.PluginUpdates.plugins[url]) return true;
			else {
				let temp = "https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/PluginRepo/PluginRepo.plugin.js".replace("//raw.githubusercontent.com", "//").split("/");
				let gitname = temp.splice(3, 1);
				temp.splice(4, 1);
				temp.splice(2, 1, gitname + ".github.io");
				return !!window.PluginUpdates.plugins[temp.join("/")];
			}
		}

		getString (obj) {
			let string = "";
			if (typeof obj == "string") string = obj;
			else if (obj && obj.props) {
				if (typeof obj.props.children == "string") string = obj.props.children;
				else if (Array.isArray(obj.props.children)) for (let c of obj.props.children) string += typeof c == "string" ? c : this.getString(c);
			}
			return string;
		}

		checkForNewPlugins () {
			BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/PluginRepo/res/PluginList.txt", (error, response, result) => {
				if (response && !BDFDB.equals(result.replace(/\t|\r/g, "").split("\n").filter(n => n), grabbedPlugins)) {
					loading = {is:false, timeout:null, amount:0};
					this.loadPlugins();
				}
			});
		}

		downloadPlugin (data) {
			BDFDB.LibraryRequires.request(data.url, (error, response, body) => {
				if (error) BDFDB.NotificationUtils.toast(`Unable to download Plugin "${plugin.getName}".`, {type:"danger"});
				else this.createPluginFile(data.url.split("/").pop(), body);
			});
		}

		createPluginFile (filename, content) {
			BDFDB.LibraryRequires.fs.writeFile(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), filename), content, (error) => {
				if (error) BDFDB.NotificationUtils.toast(`Unable to save Plugin "${filename}".`, {type:"danger"});
				else BDFDB.NotificationUtils.toast(`Successfully saved Plugin "${filename}".`, {type:"success"});
			});
		}

		startPlugin (data) {
			if (BDFDB.BDUtils.isPluginEnabled(data.name) == false) {
				BDFDB.BDUtils.enablePlugin(data.name, false);
				BDFDB.LogUtils.log(`Started Plugin ${data.name}.`, this.name);
			}
		}

		deletePluginFile (data) {
			let filename = data.url.split("/").pop();
			BDFDB.LibraryRequires.fs.unlink(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), filename), (error) => {
				if (error) BDFDB.NotificationUtils.toast(`Unable to delete Plugin "${filename}".`, {type:"danger"});
				else BDFDB.NotificationUtils.toast(`Successfully deleted Plugin "${filename}".`);
			});
		}

		stopPlugin (data) {
			if (BDFDB.BDUtils.isPluginEnabled(data.name) == true) {
				BDFDB.BDUtils.disablePlugin(data.name, false);
				BDFDB.LogUtils.log(`Stopped Plugin ${data.name}.`, this.name);
			}
		}
	}
})();