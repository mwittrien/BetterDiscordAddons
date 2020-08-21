//META{"name":"BetterSearchPage","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterSearchPage","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterSearchPage/BetterSearchPage.plugin.js"}*//

var BetterSearchPage = (_ => {
	var settings = {};
	
	return class BetterSearchPage {
		getName () {return "BetterSearchPage";}

		getVersion () {return "1.1.5";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds some extra controls to the search results page.";}

		constructor () {
			this.patchedModules = {
				after: {
					SearchResultsInner: "default"
				}
			};
		}

		initConstructor () {
			this.defaults = {
				settings: {
					addFirstLast:	{value:true, 	description:"Adds a first and last page button."},
					addJumpTo:		{value:true, 	description:"Adds a jump to input field (press enter to jump)."},
					cloneToTheTop:	{value:true, 	description:"Clones the controls to the top of the results page."}
				}
			};
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let settingsPanel, settingsItems = [];
			
			for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
			}));
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
		}

		// Legacy
		load () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) BDFDB.PluginUtils.load(this);
		}

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
				
				this.forceUpdateAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;
				
				this.forceUpdateAll();

				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		onSettingsClosed (e) {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
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
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.searchresultspaginationbutton, currentPage == 1 && BDFDB.disCN.searchresultspaginationdisabled, BDFDB.disCN.focusable),
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
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.searchresultspaginationbutton, currentPage >= maxPage && BDFDB.disCN.searchresultspaginationdisabled, BDFDB.disCN.focusable),
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
		
		forceUpdateAll () {
			settings = BDFDB.DataUtils.get(this, "settings");
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
	}
})();

module.exports = BetterSearchPage;