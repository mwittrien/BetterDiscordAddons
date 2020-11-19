/**
 * @name PluginRepo
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/PluginRepo
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/PluginRepo/PluginRepo.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/PluginRepo/PluginRepo.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "PluginRepo",
			"author": "DevilBro",
			"version": "2.1.0",
			"description": "Allow you to look at all plugins from the plugin repo and download them on the fly"
		},
		"changeLog": {
			"fixed": {
				"BD Beta": "Fixed some issues with the beta"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue:[]});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
		stop() {}
	} : (([Plugin, BDFDB]) => {
		const isBeta = !(window.BdApi && !Array.isArray(BdApi.settings));
		var _this;
		var loading, cachedPlugins, grabbedPlugins, foundPlugins, loadedPlugins, updateInterval;
		var list, header, searchTimeout, forcedSort, forcedOrder, showOnlyOutdated;
		var settings = {}, modalSettings = {}, favorites = [], customList = [];
		
		const pluginStates = {
			UPDATED: 0,
			OUTDATED: 1,
			DOWNLOADABLE: 2
		};
		const buttonData = {
			UPDATED: {
				colorClass: "GREEN",
				backgroundColor: "STATUS_GREEN",
				icon: "CHECKMARK",
				text: "Updated"
			},
			OUTDATED: {
				colorClass: "RED",
				backgroundColor: "STATUS_RED",
				icon: "CLOSE",
				text: "Outdated"
			},
			DOWNLOADABLE: {
				colorClass: "BRAND",
				backgroundColor: "BRAND",
				icon: "DOWNLOAD",
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
			ASC:			"ascending",
			DESC:			"descending"
		};
		
		const pluginRepoIcon = `<svg width="34" height="31" viewBox="0 0 400 382"><path d="M0.000 183.023 L 0.000 366.046 46.377 366.046 L 92.754 366.046 92.754 312.629 L 92.754 259.213 127.223 259.213 C 174.433 259.213,187.432 257.146,210.766 245.926 C 311.105 197.681,301.344 41.358,195.859 7.193 C 173.603 -0.015,173.838 0.000,80.846 0.000 L 0.000 0.000 0.000 183.023 M157.615 88.195 C 193.007 97.413,198.827 152.678,166.407 171.674 C 158.993 176.019,155.494 176.398,122.807 176.398 L 92.754 176.398 92.754 131.677 L 92.754 86.957 122.807 86.957 C 146.807 86.957,153.819 87.206,157.615 88.195" stroke="none" fill="#7289da" fill-rule="evenodd"></path><path d="M226.647 3.824 C 258.085 21.580,282.721 54.248,291.095 89.281 C 292.183 93.834,293.041 95.659,294.560 96.655 C 310.880 107.348,312.400 140.701,297.286 156.464 C 293.685 160.221,293.134 161.348,291.162 169.006 C 282.026 204.468,259.916 235.185,230.701 253.002 C 229.548 253.705,235.510 262.261,270.237 309.731 L 311.131 365.631 355.565 365.846 L 400.000 366.060 400.000 348.309 L 400.000 330.557 364.338 285.630 L 328.676 240.703 333.494 238.892 C 373.356 223.907,395.248 189.691,399.313 136.020 C 404.504 67.495,372.510 19.710,311.375 4.675 C 294.592 0.548,287.694 -0.000,252.482 0.000 L 219.876 0.000 226.647 3.824 M202.899 265.964 C 183.869 272.635,168.536 274.960,139.752 275.540 L 116.770 276.003 116.770 321.024 L 116.770 366.046 163.975 366.046 L 211.180 366.046 211.180 314.700 C 211.180 286.460,210.901 263.386,210.559 263.425 C 210.217 263.464,206.770 264.607,202.899 265.964" stroke="none" fill="#72767d" fill-rule="evenodd"></path></svg>`;
		
		const RepoListComponent = class PluginList extends BdApi.React.Component {
			componentDidMount() {
				list = this;
				BDFDB.TimeUtils.timeout(_ => {
					forcedSort = null;
					forcedOrder = null;
					showOnlyOutdated = false;
				}, 5000);
			}
			filterPlugins() {
				let plugins = Object.keys(loadedPlugins).map(url => {
					let plugin = loadedPlugins[url];
					let instPlugin = BDFDB.BDUtils.getPlugin(plugin.getName);
					if (instPlugin && typeof instPlugin.getAuthor == "function" && _this.getString(instPlugin.getAuthor()).toUpperCase() == plugin.getAuthor.toUpperCase()) plugin.getState = _this.getString(instPlugin.getVersion()) != plugin.getVersion ? pluginStates.OUTDATED : pluginStates.UPDATED;
					else plugin.getState = pluginStates.DOWNLOADABLE;
					return {
						url: plugin.url,
						search: (plugin.getName + " " + plugin.getVersion + " " + plugin.getAuthor + " " + plugin.getDescription).toUpperCase(),
						name: plugin.getName,
						version: plugin.getVersion,
						author: plugin.getAuthor,
						description: plugin.getDescription || "No Description found",
						fav: favorites.includes(url) ? favStates.FAVORIZED : favStates.NOT_FAVORIZED,
						new: plugin.getState == pluginStates.DOWNLOADABLE && !cachedPlugins.includes(url) ? newStates.NEW : newStates.NOT_NEW,
						state: plugin.getState
					};
				});
				if (!this.props.updated)		plugins = plugins.filter(plugin => plugin.state != pluginStates.UPDATED);
				if (!this.props.outdated)		plugins = plugins.filter(plugin => plugin.state != pluginStates.OUTDATED);
				if (!this.props.downloadable)	plugins = plugins.filter(plugin => plugin.state != pluginStates.DOWNLOADABLE);
				if (this.props.searchString) 	{
					let searchString = this.props.searchString.toUpperCase();
					plugins = plugins.filter(plugin => plugin.search.indexOf(searchString) > -1);
				}

				BDFDB.ArrayUtils.keySort(plugins, (!this.props.sortKey || this.props.sortKey == "NEW" && !plugins.some(plugin => plugin.new == newStates.NEW) ? Object.keys(sortKeys)[0] : this.props.sortKey).toLowerCase());
				if (this.props.orderKey == "DESC") plugins.reverse();
				return plugins;
			}
			render() {
				let automaticLoading = BDFDB.BDUtils.getSettings(BDFDB.BDUtils.settingsIds.automaticLoading);
				if (!this.props.tab) this.props.tab = "Plugins";
				this.props.entries = (!loading.is && !BDFDB.ObjectUtils.isEmpty(loadedPlugins) ? this.filterPlugins() : []).map(plugin => BDFDB.ReactUtils.createElement(RepoCardComponent, {
					plugin: plugin
				})).filter(n => n);
				
				BDFDB.TimeUtils.timeout(_ => {
					if (!loading.is && header && this.props.entries.length != header.props.amount) {
						header.props.amount = this.props.entries.length;
						BDFDB.ReactUtils.forceUpdate(header);
					}
				});
				
				return [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
						tab: "Plugins",
						open: this.props.tab == "Plugins",
						render: false,
						children: loading.is ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							direction: BDFDB.LibraryComponents.Flex.Direction.VERTICAL,
							justify: BDFDB.LibraryComponents.Flex.Justify.CENTER,
							style: {marginTop: "50%"},
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Spinner, {
									type: BDFDB.LibraryComponents.Spinner.Type.WANDERING_CUBES
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
									className: BDFDB.disCN.margintop20,
									style: {textAlign: "center"},
									children: "Plugins are still being fetched. Please wait a moment."
								})
							]
						}) : BDFDB.ReactUtils.forceStyle(BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._repolist,
							style: {
								display: "flex",
								flexDirection: "column",
								margin: "unset",
								width: "unset"
							},
							children: this.props.entries
						}), ["display", "flex-direction", "margin", "width"])
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
						tab: BDFDB.LanguageUtils.LanguageStrings.SETTINGS,
						open: this.props.tab == BDFDB.LanguageUtils.LanguageStrings.SETTINGS,
						render: false,
						children: [
							!automaticLoading && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
								className: BDFDB.disCN.marginbottom20,
								children: BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCNS.settingsrowtitledefault + BDFDB.disCN.cursordefault,
									children: "To experience PluginRepo in the best way. I would recommend you to enable BD intern reload function, that way all downloaded files are loaded into Discord without the need to reload."
								})
							}),
							Object.keys(modalSettings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								className: BDFDB.disCN.marginbottom20,
								type: "Switch",
								plugin: _this,
								keys: ["modalSettings", key],
								label: _this.defaults.modalSettings[key].description,
								note: key == "rnmStart" && !automaticLoading && "Automatic Loading has to be enabled",
								disabled: key == "rnmStart" && !automaticLoading,
								value: this.props[key],
								onChange: (value, instance) => {
									this.props[key] = value;
									BDFDB.ReactUtils.forceUpdate(this);
								}
							}))
						].flat(10).filter(n => n)
					})
				];
			}
		};
		
		const RepoCardComponent = class PluginCard extends BdApi.React.Component {
			render() {
				let buttonConfig = buttonData[(Object.entries(pluginStates).find(n => n[1] == this.props.plugin.state) || [])[0]];
				return buttonConfig && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.AddonCard, {
					icon: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCN._repoicon,
						nativeClass: true,
						iconSVG: `<svg viewBox="0 0 24 24" fill="#FFFFFF" style="width: 18px; height: 18px;"><path d="M0 0h24v24H0z" fill="none"></path><path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"></path></svg>`
					}),
					data: this.props.plugin,
					controls: [
						this.props.plugin.new == newStates.NEW && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.TextBadge, {
							style: {
								borderRadius: 3,
								textTransform: "uppercase",
								background: BDFDB.DiscordConstants.Colors.STATUS_YELLOW
							},
							text: BDFDB.LanguageUtils.LanguageStrings.NEW
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FavButton, {
							className: BDFDB.disCN._repocontrolsbutton,
							isFavorite: this.props.plugin.fav == favStates.FAVORIZED,
							onClick: value => {
								this.props.plugin.fav = value ? favStates.FAVORIZED : favStates.NOT_FAVORIZED;
								if (value) favorites.push(this.props.plugin.url);
								else BDFDB.ArrayUtils.remove(favorites, this.props.plugin.url, true);
								BDFDB.DataUtils.save(favorites, _this, "favorites");
							}
						}),
						!isBeta && BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._repocontrolsbutton,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
								text: "Go to Source",
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									name: BDFDB.LibraryComponents.SvgIcon.Names.GITHUB,
									className: BDFDB.disCN._repoicon,
									onClick: _ => {
										let gitUrl = null;
										if (this.props.plugin.url.indexOf("https://raw.githubusercontent.com") == 0) {
											let temp = this.props.plugin.url.replace("//raw.githubusercontent", "//github").split("/");
											temp.splice(5, 0, "blob");
											gitUrl = temp.join("/");
										}
										else if (this.props.plugin.url.indexOf("https://gist.githubusercontent.com/") == 0) {
											gitUrl = this.props.plugin.url.replace("//gist.githubusercontent", "//gist.github").split("/raw/")[0];
										}
										if (gitUrl) BDFDB.DiscordUtils.openLink(gitUrl, settings.useChromium);
									}
								})
							})
						})
					],
					links: isBeta && [{
						label: "Source",
						icon: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							name: BDFDB.LibraryComponents.SvgIcon.Names.GITHUB,
							nativeClass: true,
							width: 18,
							height: 18
						}),
						onClick: _ => {
							let gitUrl = null;
							if (this.props.plugin.url.indexOf("https://raw.githubusercontent.com") == 0) {
								let temp = this.props.plugin.url.replace("//raw.githubusercontent", "//github").split("/");
								temp.splice(5, 0, "blob");
								gitUrl = temp.join("/");
							}
							else if (this.props.plugin.url.indexOf("https://gist.githubusercontent.com/") == 0) {
								gitUrl = this.props.plugin.url.replace("//gist.githubusercontent", "//gist.github").split("/raw/")[0];
							}
							if (gitUrl) BDFDB.DiscordUtils.openLink(gitUrl, settings.useChromium);
						}
					}],
					buttons: isBeta ? [
						this.props.plugin.state != pluginStates.DOWNLOADABLE && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: BDFDB.LanguageUtils.LanguageStrings.DELETE,
							children: BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCNS._repobutton + BDFDB.disCNS._repocontrolsbutton + BDFDB.disCN._repobuttondanger,
								onClick: _ => {
									_this.stopPlugin(this.props.plugin);
									_this.deletePluginFile(this.props.plugin);
									this.props.plugin.state = pluginStates.DOWNLOADABLE;
									BDFDB.ReactUtils.forceUpdate(this);
								},
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									name: BDFDB.LibraryComponents.SvgIcon.Names.TRASH,
									nativeClass: true,
									color: "#FFFFFF",
									width: 20,
									height: 20
								})
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: buttonConfig.text,
							children: BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCNS._repobutton + BDFDB.disCN._repocontrolsbutton,
								style: {backgroundColor: BDFDB.DiscordConstants.Colors[buttonConfig.backgroundColor]},
								onClick: _ => {
									_this.downloadPlugin(this.props.plugin);
									if (list && list.props.rnmStart) BDFDB.TimeUtils.timeout(_ => {
										if (this.props.plugin.state == pluginStates.UPDATED) _this.startPlugin(this.props.plugin);
									}, 3000);
									this.props.plugin.state = pluginStates.UPDATED;
									BDFDB.ReactUtils.forceUpdate(this);
								},
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									name: BDFDB.LibraryComponents.SvgIcon.Names[buttonConfig.icon],
									nativeClass: true,
									color: "#FFFFFF",
									width: 20,
									height: 20
								})
							})
						})
					] : [
						this.props.plugin.state != pluginStates.DOWNLOADABLE && BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._repocontrolsbutton,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
								text: "Delete Pluginfile",
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									name: BDFDB.LibraryComponents.SvgIcon.Names.NOVA_TRASH,
									className: BDFDB.disCN._repoicon,
									onClick: (e, instance) => {
										_this.stopPlugin(this.props.plugin);
										_this.deletePluginFile(this.props.plugin);
										this.props.plugin.state = pluginStates.DOWNLOADABLE;
										BDFDB.ReactUtils.forceUpdate(this);
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
								_this.downloadPlugin(this.props.plugin);
								if (list && list.props.rnmStart) BDFDB.TimeUtils.timeout(_ => {
									if (this.props.plugin.state == pluginStates.UPDATED) _this.startPlugin(this.props.plugin);
								}, 3000);
								this.props.plugin.state = pluginStates.UPDATED;
								BDFDB.ReactUtils.forceUpdate(this);
							}
						})
					]
				});
			}
		};
		
		const RepoListHeaderComponent = class PluginListHeader extends BdApi.React.Component {
			componentDidMount() {
				header = this;
			}
			render() {
				if (!this.props.tab) this.props.tab = "Plugins";
				return BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN._repolistheader,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							className: BDFDB.disCN.marginbottom4,
							align: BDFDB.LibraryComponents.Flex.Align.CENTER,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H2,
									className: BDFDB.disCN.marginreset,
									children: `Plugin Repo — ${loading.is ? 0 : this.props.amount || 0}/${loading.is ? 0 : Object.keys(loadedPlugins).length}`
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SearchBar, {
										autoFocus: true,
										query: this.props.searchString,
										onChange: (value, instance) => {
											BDFDB.TimeUtils.clear(searchTimeout);
											searchTimeout = BDFDB.TimeUtils.timeout(_ => {
												this.props.searchString = list.props.searchString = value.replace(/[<|>]/g, "");
												BDFDB.ReactUtils.forceUpdate(this, list);
											}, 1000);
										},
										onClear: instance => {
											this.props.searchString = list.props.searchString = "";
											BDFDB.ReactUtils.forceUpdate(this, list);
										}
									})
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							className: BDFDB.disCNS.tabbarcontainer + BDFDB.disCN.tabbarcontainerbottom,
							align: BDFDB.LibraryComponents.Flex.Align.CENTER,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TabBar, {
										className: BDFDB.disCN.tabbar,
										itemClassName: BDFDB.disCN.tabbaritem,
										type: BDFDB.LibraryComponents.TabBar.Types.TOP,
										selectedItem: this.props.tab,
										items: [{value:"Plugins"}, {value:BDFDB.LanguageUtils.LanguageStrings.SETTINGS}],
										onItemSelect: (value, instance) => {
											this.props.tab = list.props.tab = value;
											BDFDB.ReactUtils.forceUpdate(list);
										}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.QuickSelect, {
										label: BDFDB.LanguageUtils.LibraryStrings.sort_by + ":",
										value: {
											label: sortKeys[this.props.sortKey],
											value: this.props.sortKey
										},
										options: Object.keys(sortKeys).filter(n => n != "NEW" || Object.keys(loadedPlugins).some(p => !cachedPlugins.includes(p))).map(key => ({
											label: sortKeys[key],
											value: key
										})),
										onChange: (key, instance) => {
											this.props.sortKey = list.props.sortKey = key;
											BDFDB.ReactUtils.forceUpdate(this, list);
										}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.QuickSelect, {
										label: BDFDB.LanguageUtils.LibraryStrings.order + ":",
										value: {
											label: BDFDB.LanguageUtils.LibraryStrings[orderKeys[this.props.orderKey]],
											value: this.props.orderKey
										},
										options: Object.keys(orderKeys).map(key => ({
											label: BDFDB.LanguageUtils.LibraryStrings[orderKeys[key]],
											value: key
										})),
										onChange: (key, instance) => {
											this.props.orderKey = list.props.orderKey = key;
											BDFDB.ReactUtils.forceUpdate(this, list);
										}
									})
								})
							]
						})
					]
				});
			}
		};
	
		return class PluginRepo extends Plugin {
			onLoad() {
				_this = this;
				
				loading = {is:false, timeout:null, amount:0};

				cachedPlugins = [];
				grabbedPlugins = [];
				foundPlugins = [];
				loadedPlugins = {};

				this.defaults = {
					settings: {
						useChromium: 		{value:false,	description:"Use an inbuilt browser window instead of opening your default browser"},
						notifyOutdated:		{value:true, 	description:"Get a notification when one of your Plugins is outdated"},
						notifyNewEntries:	{value:true, 	description:"Get a notification when there are new entries in the Repo"}
					},
					modalSettings: {
						updated: 			{value:true,	modify:true,	description:"Show updated Plugins",},
						outdated:			{value:true, 	modify:true,	description:"Show outdated Plugins"},
						downloadable:		{value:true, 	modify:true,	description:"Show downloadable Plugins"},
						rnmStart:			{value:true, 	modify:false,	description:"Start Plugin after Download"}
					}
				};
			
				this.patchedModules = {
					before: {
						SettingsView: "render"
					},
					after: {
						StandardSidebarView: "render"
					}
				};
				
			}
			
			onStart() {
				this.forceUpdateAll();

				this.loadPlugins();

				updateInterval = BDFDB.TimeUtils.interval(_ => {this.checkForNewPlugins();}, 1000*60*30);
			}
			
			onStop() {
				BDFDB.TimeUtils.clear(updateInterval);
				BDFDB.TimeUtils.clear(loading.timeout);

				this.forceUpdateAll();

				BDFDB.DOMUtils.remove(".bd-pluginrepobutton", ".pluginrepo-notice", ".pluginrepo-loadingicon");
			}

			getSettingsPanel (collapseStates = {}) {
				let customUrl = "";
				let settingsPanel, settingsItems = [];
				
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
					title: "Settings",
					collapseStates: collapseStates,
					children: Object.keys(settings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
			
			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
			
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
				modalSettings = BDFDB.DataUtils.get(this, "modalSettings");
				favorites = BDFDB.DataUtils.load(this, "favorites");
				favorites = BDFDB.ArrayUtils.is(favorites) ? favorites : [];
				customList = BDFDB.DataUtils.load(this, "custom");
				customList = BDFDB.ArrayUtils.is(customList) ? customList : [];
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			onUserSettingsCogContextMenu (e) {
				BDFDB.TimeUtils.timeout(_ => {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["label", ["BandagedBD", "BetterDiscord"]]]});
					if (index > -1 && BDFDB.ArrayUtils.is(children[index].props.children)) children[index].props.children.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: "Plugin Repo",
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "repo"),
						action: _ => {
							BDFDB.LibraryModules.UserSettingsUtils.open("pluginrepo");
						}
					}));
				});
			}
			
			processSettingsView (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.sections) && e.instance.props.sections[0] && e.instance.props.sections[0].label == BDFDB.LanguageUtils.LanguageStrings.USER_SETTINGS) {
					e.instance.props.sections = e.instance.props.sections.filter(n => n.section != "pluginrepo");
					let oldSettings = !e.instance.props.sections.find(n => n.section == "plugins");
					let index = e.instance.props.sections.indexOf(e.instance.props.sections.find(oldSettings ? n => n.section == BDFDB.DiscordConstants.UserSettingsSections.DEVELOPER_OPTIONS : n => n.section == BDFDB.DiscordConstants.UserSettingsSections.CHANGE_LOG || n.section == "changelog"));
					if (index > -1) {
						e.instance.props.sections.splice(oldSettings ? index + 1 : index - 1, 0, {
							label: "Plugin Repo",
							section: "pluginrepo",
							element: _ => {
								let options = Object.assign({}, modalSettings);
								options.updated = options.updated && !showOnlyOutdated;
								options.outdated = options.outdated || showOnlyOutdated;
								options.downloadable = options.downloadable && !showOnlyOutdated;
								options.searchString = "";
								options.sortKey = forcedSort || Object.keys(sortKeys)[0];
								options.orderKey = forcedOrder || Object.keys(orderKeys)[0];
								
								return BDFDB.ReactUtils.createElement(RepoListComponent, options, true);
							}
						});
						if (oldSettings) e.instance.props.sections.splice(index + 1, 0, {section: "DIVIDER"});
					}
				}
			}
			
			processStandardSidebarView (e) {
				if (BDFDB.ObjectUtils.get(e, "instance.props.content.props.section") == "pluginrepo") {
					let content = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.settingswindowcontentregion]]});
					if (content) content.props.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._repolistwrapper, content.props.className);
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.settingswindowcontentregionscroller]]});
					if (index > -1) {
						let options = {};
						options.searchString = "";
						options.sortKey = forcedSort || Object.keys(sortKeys)[0];
						options.orderKey = forcedOrder || Object.keys(orderKeys)[0];
						children[index] = [
							BDFDB.ReactUtils.createElement(RepoListHeaderComponent, options, true),
							children[index]
						];
					}
				}
			}

			loadPlugins () {
				BDFDB.DOMUtils.remove(".pluginrepo-loadingicon");
				let settings = BDFDB.DataUtils.load(this, "settings");
				let getPluginInfo, extractConfigInfo, createSandbox, runInSandbox;
				let sandbox, sandboxRunning = false, sandboxQueue = [], outdated = 0, newEntries = 0, i = 0;
				let tags = ["getName", "getVersion", "getAuthor", "getDescription"];
				let seps = ["\"", "\'", "\`"];
				let newEntriesData = BDFDB.DataUtils.load(this, "newentriesdata");
				cachedPlugins = (newEntriesData.urlbase64 ? atob(newEntriesData.urlbase64).split("\n") : []).concat(customList);
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/PluginRepo/_res/PluginList.txt", (error, response, result) => {
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
						}, 1200000), amount:loading.amount+1};
						
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
										if (list) BDFDB.ReactUtils.forceUpdate(list);
										
										if ((settings.notifyOutdated || settings.notifyOutdated == undefined) && outdated > 0) {
											let oldBarButton = document.querySelector(".pluginrepo-outdate-notice " + BDFDB.dotCN.noticedismiss);
											if (oldBarButton) oldBarButton.click();
											let bar = BDFDB.NotificationUtils.notice(`${outdated} of your Plugins ${outdated == 1 ? "is" : "are"} outdated. Check:`, {
												type: "danger",
												btn: "PluginRepo",
												selector: "pluginrepo-notice pluginrepo-outdate-notice",
												customicon: pluginRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#72767d/gi, "#B9BBBE")
											});
											bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", _ => {
												showOnlyOutdated = true;
												BDFDB.LibraryModules.UserSettingsUtils.open("pluginrepo");
												bar.querySelector(BDFDB.dotCN.noticedismiss).click();
											});
										}
										
										if ((settings.notifyNewEntries || settings.notifyNewEntries == undefined) && newEntries > 0) {
											let oldBarButton = document.querySelector(".pluginrepo-newentries-notice " + BDFDB.dotCN.noticedismiss);
											if (oldBarButton) oldBarButton.click();
											let single = newEntries == 1;
											let bar = BDFDB.NotificationUtils.notice(`There ${single ? "is" : "are"} ${newEntries} new Plugin${single ? "" : "s"} in the Repo. Check:`, {
												type: "success",
												btn: "PluginRepo",
												selector: "pluginrepo-notice pluginrepo-newentries-notice",
												customicon: pluginRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#72767d/gi, "#B9BBBE")
											});
											bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", _ => {
												forcedSort = "NEW";
												forcedOrder = "ASC";
												BDFDB.LibraryModules.UserSettingsUtils.open("pluginrepo");
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
													customicon: pluginRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#72767d/gi, "#B9BBBE")
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
							let bodyWithoutSpecial = bodyCopy.replace(/\n|\r|\t/g, "").replace(/\n|\r|\t/g, "").replace(/\s{2,}/g, "");
							let configReg = /(\.exports|config)\s*=\s*\{(.*?)\s*["'`]*info["'`]*\s*:\s*/i.exec(bodyWithoutSpecial);
							if (configReg) {
								try {
									extractConfigInfo(plugin, JSON.parse('{"info":' + bodyWithoutSpecial.substring(configReg.index).split(configReg[0])[1].split("};")[0].split("}},")[0] + '}'));
								}
								catch (err) {
									let i = 0, j = 0, configString = "";
									try {
										for (let c of (bodyWithoutSpecial.substring(configReg.index).split(configReg[0])[1].split("};")[0].split("}},")[0]).replace(/,/g, ',"').replace(/:/g, '":').replace(/{/g, '{"').replace(/""/g, '"').replace(/" /g, ' ').replace(/,"{/g, ',{').replace(/,"\[/g, ',[').replace(/":\/\//g, ':\/\/')) {
											configString += c;
											if (c == "{") i++;
											else if (c == "}") j++;
											if (i > 0 && i == j) break;
										}
										extractConfigInfo(plugin, JSON.parse('{"info":' + configString + '}'));
									}
									catch (err2) {
										try {
											extractConfigInfo(plugin, JSON.parse(('{"info":' + configString + '}').replace(/'/g, "\"")));
										}
										catch (err3) {}
									}
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
											result = result.slice(1, -1).join(separator).replace(/\\n/g, "\n").replace(/\\/g, "");
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
								if (!cachedPlugins.includes(url)) newEntries++;
							}
							else if (sandbox) {
								sandboxQueue.push({body, url});
								runInSandbox();
							}
						}
						i++;
						
						let loadingTooltip = document.querySelector(".pluginrepo-loading-tooltip");
						if (loadingTooltip) loadingTooltip.update(this.getLoadingTooltipText());
						
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
						sandbox = BDFDB.WindowUtils.open(this, "https://mwittrien.github.io/BetterDiscordAddons/Plugins/_res/DiscordPreview.html", {
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
								if (!cachedPlugins.includes(url)) newEntries++;
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
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/PluginRepo/_res/PluginList.txt", (error, response, result) => {
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
				if (data.name && BDFDB.BDUtils.isPluginEnabled(data.name) == false) {
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
				if (data.name && BDFDB.BDUtils.isPluginEnabled(data.name) == true) {
					BDFDB.BDUtils.disablePlugin(data.name, false);
					BDFDB.LogUtils.log(`Stopped Plugin ${data.name}.`, this.name);
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();