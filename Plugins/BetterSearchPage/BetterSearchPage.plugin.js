/**
 * @name BetterSearchPage
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.2.0
 * @description Adds some extra Controls to the Search Results Page
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterSearchPage/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/BetterSearchPage/BetterSearchPage.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "BetterSearchPage",
			"author": "DevilBro",
			"version": "1.2.0",
			"description": "Adds some extra Controls to the Search Results Page"
		},
		"changeLog": {
			"fixed": {
				"Jump Input": "No longer adds jump input if there is only one page of search results"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
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
		var settings = {};
		
		return class BetterSearchPage extends Plugin {
			onLoad () {
				this.defaults = {
					settings: {
						addJumpTo:		{value: true, 	description: "Add a Jump to Input Field (press enter to Jump)"},
						cloneToTheTop:	{value: true, 	description: "Clone the controls to the top of the Results Page"}
					}
				};
				
				this.patchedModules = {
					after: {
						SearchResultsInner: "default"
					}
				};
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
						if (!pagination || maxPage < 2) return;
						pagination.props.className = BDFDB.DOMUtils.formatClassName(pagination.props.className, BDFDB.disCN.pagination, BDFDB.disCN._bettersearchpagepagination, settings.addJumpTo && BDFDB.disCN.paginationmini);
						
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
						if (settings.cloneToTheTop) {
							let topPagination = BDFDB.ReactUtils.cloneElement(pagination);
							topPagination.props.className = BDFDB.DOMUtils.formatClassName(topPagination.props.className, BDFDB.disCN.paginationtop);
							children.unshift(topPagination);
						}
						pagination.props.className = BDFDB.DOMUtils.formatClassName(pagination.props.className, BDFDB.disCN.paginationbottom);
					}
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();