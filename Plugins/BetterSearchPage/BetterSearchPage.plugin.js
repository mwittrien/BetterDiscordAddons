/**
 * @name BetterSearchPage
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterSearchPage
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterSearchPage/BetterSearchPage.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "BetterSearchPage",
			"author": "DevilBro",
			"version": "1.1.6",
			"description": "Add some extra controls to the search results page"
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
		var settings = {};
		
		return class BetterSearchPage extends Plugin {
			onLoad() {
				this.defaults = {
					settings: {
						addFirstLast:	{value:true, 	description:"Add a first and last page button"},
						addJumpTo:		{value:true, 	description:"Add a jump to input field (press enter to jump)"},
						cloneToTheTop:	{value:true, 	description:"Clone the controls to the top of the results page"}
					}
				};
				
				this.patchedModules = {
					after: {
						SearchResultsInner: "default"
					}
				};
				
			}
			
			onStart() {
				this.forceUpdateAll();
			}
			
			onStop() {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed (e) {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processSearchResultsInner (e) {
				if (e.instance.props.search) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name:"SearchPagination"});
					if (index > -1) {
						let currentPage = parseInt(Math.floor(e.instance.props.search.offset / BDFDB.DiscordConstants.SEARCH_PAGE_SIZE)) + 1;
						let maxPage = e.instance.props.search.totalResults > 5000 ? parseInt(Math.ceil(5000 / BDFDB.DiscordConstants.SEARCH_PAGE_SIZE)) : parseInt(Math.ceil(e.instance.props.search.totalResults / BDFDB.DiscordConstants.SEARCH_PAGE_SIZE));
						let doJump = page => {
							page = page < 1 ? 1 : (page > maxPage ? maxPage : page);
							if (page < currentPage) BDFDB.LibraryModules.SearchPageUtils.searchPreviousPage(e.instance.props.searchId, (currentPage - page) * BDFDB.DiscordConstants.SEARCH_PAGE_SIZE);
							else if (page > currentPage) BDFDB.LibraryModules.SearchPageUtils.searchNextPage(e.instance.props.searchId, (page - currentPage) * BDFDB.DiscordConstants.SEARCH_PAGE_SIZE);
						};
						let pagination = children[index].type(children[index].props);
						if (!pagination) return;
						
						if (currentPage >= maxPage) {
							pagination.props.children[2].props.className = BDFDB.DOMUtils.formatClassName(pagination.props.children[2].props.className, BDFDB.disCN.searchresultspaginationdisabled);
							pagination.props.children[2].props.onClick = _ => {};
						}
						pagination.props.children[0] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: "Previous",
							children: pagination.props.children[0]
						});
						pagination.props.children[2] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: currentPage >= maxPage ? "Max Page is 200" : "Next",
							tooltipConfig: {color: currentPage >= maxPage && BDFDB.LibraryComponents.TooltipContainer.Colors.RED},
							children: pagination.props.children[2]
						});
						if (settings.addFirstLast) {
							pagination.props.children.unshift(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
								text: BDFDB.LanguageUtils.LibraryStrings.first,
								"aria-label": BDFDB.LanguageUtils.LibraryStrings.first,
								onClick: _ => {if (currentPage != 1) doJump(1);},
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
									className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.searchresultspaginationbutton, currentPage == 1 && BDFDB.disCN.searchresultspaginationdisabled),
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
										className: BDFDB.disCN.searchresultspaginationicon,
										name: BDFDB.LibraryComponents.SvgIcon.Names.LEFT_DOUBLE_CARET
									})
								})
							}));
							pagination.props.children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
								text: currentPage >= maxPage ? "Max Page is 200" : BDFDB.LanguageUtils.LibraryStrings.last,
								tooltipConfig: {color: currentPage >= maxPage && BDFDB.LibraryComponents.TooltipContainer.Colors.RED},
								"aria-label": BDFDB.LanguageUtils.LibraryStrings.last,
								onClick: _ => {if (currentPage != maxPage) doJump(maxPage);},
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
									className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.searchresultspaginationbutton, currentPage >= maxPage && BDFDB.disCN.searchresultspaginationdisabled),
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
										className: BDFDB.disCN.searchresultspaginationicon,
										name: BDFDB.LibraryComponents.SvgIcon.Names.RIGHT_DOUBLE_CARET
									})
								})
							}));
						}
						if (settings.addJumpTo) {
							pagination.props.children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
								key: "BSP-pagination-jumpinput",
								type: "number",
								size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
								value: currentPage,
								min: 1,
								max: maxPage,
								onKeyDown: (event, instance) => {if (event.which == 13) doJump(instance.props.value);}
							}));
							pagination.props.children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
								text: BDFDB.LanguageUtils.LanguageStrings.JUMP,
								"aria-label": BDFDB.LanguageUtils.LanguageStrings.JUMP,
								onClick: (event, instance) => {
									let jumpInput = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {key:"BSP-pagination-jumpinput"});
									if (jumpInput) doJump(jumpInput.props.value);
								},
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
									className: BDFDB.disCN.searchresultspaginationbutton,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
										className: BDFDB.disCN.searchresultspaginationicon,
										style: {transform: "rotate(90deg"},
										name: BDFDB.LibraryComponents.SvgIcon.Names.RIGHT_CARET
									})
								})
							}));
						}
						children[index] = pagination;
						if (settings.cloneToTheTop) children.unshift(pagination);
					}
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();