/**
 * @name BetterSearchPage
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterSearchPage
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterSearchPage/BetterSearchPage.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterSearchPage/BetterSearchPage.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "BetterSearchPage",
			"author": "DevilBro",
			"version": "1.1.8",
			"description": "Add some extra controls to the search results page"
		},
		"changeLog": {
			"fixed": {
				"New Pagination": "Fixed for the new pagination style, 'First/Last' was removed because the native pagination now allows to jump to those pages"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
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
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The library plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", _ => {
				require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
					if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
					else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
				});
			});
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var settings = {};
		
		return class BetterSearchPage extends Plugin {
			onLoad () {
				this.defaults = {
					settings: {
						addJumpTo:		{value: true, 	description: "Add a jump to input field (press enter to jump)"},
						cloneToTheTop:	{value: true, 	description: "Clone the controls to the top of the results page"}
					}
				};
				
				this.patchedModules = {
					after: {
						SearchResultsInner: "default"
					}
				};
				
				this.css = `
					${BDFDB.dotCN._bettersearchpagepagination} {
						display: flex;
						justify-content: center;
						align-items: center;
						margin-top: 16px;
					}
					${BDFDB.dotCN._bettersearchpagepagination}:first-child {
						margin-top: 0;
						margin-bottom: 16px;
					}
					${BDFDB.dotCNS._bettersearchpagepagination + BDFDB.dotCN.paginationcontainer} {
						margin: 0;
					}
					${BDFDB.dotCNS._bettersearchpagepagination + BDFDB.dotCNS._bettersearchpagewithjump + BDFDB.dotCN.paginationbutton},
					${BDFDB.dotCNS._bettersearchpagepagination + BDFDB.dotCNS._bettersearchpagewithjump + BDFDB.dotCN.paginationgap} {
						font-size: 14px;
						margin: 4px 2px;
					}
					${BDFDB.dotCNS._bettersearchpagepagination + BDFDB.dotCNS._bettersearchpagewithjump + BDFDB.dotCN.paginationgap} {
						width: 20px;
					}
				`;
			}
			
			onStart () {
				this.forceUpdateAll();
			}
			
			onStop () {
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
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "SearchPagination"});
					if (index > -1) {
						let currentPage = parseInt(Math.floor(e.instance.props.search.offset / BDFDB.DiscordConstants.SEARCH_PAGE_SIZE)) + 1;
						let maxPage = e.instance.props.search.totalResults > 5000 ? parseInt(Math.ceil(5000 / BDFDB.DiscordConstants.SEARCH_PAGE_SIZE)) : parseInt(Math.ceil(e.instance.props.search.totalResults / BDFDB.DiscordConstants.SEARCH_PAGE_SIZE));
						
						children[index].props.totalResults = children[index].props.totalResults > 5000 ? 5000 : children[index].props.totalResults;
						
						let pagination = children[index].type(children[index].props);
						if (!pagination) return;
						pagination.props.className = BDFDB.DOMUtils.formatClassName(pagination.props.className, BDFDB.disCN._bettersearchpagepagination, settings.addJumpTo && BDFDB.disCN._bettersearchpagewithjump);
						
						if (settings.addJumpTo) {
							pagination.props.children = [
								pagination.props.children,
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									type: "number",
									size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
									value: currentPage,
									min: 1,
									max: maxPage,
									onKeyDown: (event, instance) => {
										if (event.which == 13) {
											let page = instance.props.value < 1 ? 1 : (instance.props.value > maxPage ? maxPage : instance.props.value);
											if (page < currentPage) BDFDB.LibraryModules.SearchPageUtils.searchPreviousPage(e.instance.props.searchId, (currentPage - page) * BDFDB.DiscordConstants.SEARCH_PAGE_SIZE);
											else if (page > currentPage) BDFDB.LibraryModules.SearchPageUtils.searchNextPage(e.instance.props.searchId, (page - currentPage) * BDFDB.DiscordConstants.SEARCH_PAGE_SIZE);
										}
									}
								})
							].flat(10).filter(n => n);
						}
						children[index] = pagination;
						if (settings.cloneToTheTop) children.unshift(pagination);
					}
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();