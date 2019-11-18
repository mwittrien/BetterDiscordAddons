//META{"name":"BetterSearchPage","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterSearchPage","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterSearchPage/BetterSearchPage.plugin.js"}*//

class BetterSearchPage {
	getName () {return "BetterSearchPage";}

	getVersion () {return "1.1.0";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds some extra controls to the search results page.";}

	constructor () {
		this.changelog = {
			"fixed":[["Jump to","Pressing the Jump to button now properly works again"]],
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};

		this.patchedModules = {
			after: {
				SearchResults: "render"
			}
		};
	}

	initConstructor () {
		this.css = `
			.BSP-pagination-button {
				background: url('data:image/svg+xml; base64, PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIyNSI+PGcgZmlsbD0iIzczN2Y4ZCIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZD0iTTE3LjMzOCAxMi40ODVjLTQuMTU2IDQuMTU2LTguMzEyIDguMzEyLTEyLjQ2OCAxMi40NjctMS40MDItMS40MDItMi44MDUtMi44MDQtNC4yMDctNC4yMDYgMi43NTYtMi43NTcgNS41MTMtNS41MTQgOC4yNy04LjI3QzYuMTc2IDkuNzIgMy40MTkgNi45NjMuNjYzIDQuMjA3TDQuODcgMGMtLjA1OC0uMDU5IDEyLjU1NSAxMi41NjIgMTIuNDY4IDEyLjQ4NXoiLz48cGF0aCB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGQ9Ik0xNy4zMzggMTIuNDg1Yy00LjE1NiA0LjE1Ni04LjMxMiA4LjMxMi0xMi40NjggMTIuNDY3LTEuNDAyLTEuNDAyLTIuODA1LTIuODA0LTQuMjA3LTQuMjA2IDIuNzU2LTIuNzU3IDUuNTEzLTUuNTE0IDguMjctOC4yN0M2LjE3NiA5LjcyIDMuNDE5IDYuOTYzLjY2MyA0LjIwN0w0Ljg3IDBjLS4wNTgtLjA1OSAxMi41NTUgMTIuNTYyIDEyLjQ2OCAxMi40ODV6IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMiAwKSIvPjwvZz48L3N2Zz4=') 50%/9px 12px no-repeat;
				border: 1px solid rgba(79,84,92,.16);
				border-radius: 2px;
				cursor: pointer;
				height: 18px;
				left: 20px;
				opacity: .7;
				top: 20px;
				width: 18px;
			}
			${BDFDB.dotCN.themedark} .BSP-pagination-button {
				background-image: url('data:image/svg+xml; base64, PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIyNSI+PGcgZmlsbD0iI0ZGRiIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZD0iTTE3LjMzOCAxMi40ODVjLTQuMTU2IDQuMTU2LTguMzEyIDguMzEyLTEyLjQ2OCAxMi40NjctMS40MDItMS40MDItMi44MDUtMi44MDQtNC4yMDctNC4yMDYgMi43NTYtMi43NTcgNS41MTMtNS41MTQgOC4yNy04LjI3QzYuMTc2IDkuNzIgMy40MTkgNi45NjMuNjYzIDQuMjA3TDQuODcgMGMtLjA1OC0uMDU5IDEyLjU1NSAxMi41NjIgMTIuNDY4IDEyLjQ4NXoiIC8+PHBhdGggeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBkPSJNMTcuMzM4IDEyLjQ4NWMtNC4xNTYgNC4xNTYtOC4zMTIgOC4zMTItMTIuNDY4IDEyLjQ2Ny0xLjQwMi0xLjQwMi0yLjgwNS0yLjgwNC00LjIwNy00LjIwNiAyLjc1Ni0yLjc1NyA1LjUxMy01LjUxNCA4LjI3LTguMjdDNi4xNzYgOS43MiAzLjQxOSA2Ljk2My42NjMgNC4yMDdMNC44NyAwYy0uMDU4LS4wNTkgMTIuNTU1IDEyLjU2MiAxMi40NjggMTIuNDg1eiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTIgMCkiLz48L2c+PC9zdmc+');
				border: 1px solid hsla(0,0%,100%,.16);
			}
			.BSP-pagination-button.BSP-pagination-first {
				margin-right: 10px;
				transform: rotate(180deg);
			}
			.BSP-pagination-button.BSP-pagination-last {
				margin-left: 10px;
				margin-right: 10px;
			}
			.BSP-pagination-button.BSP-pagination-jump {
				margin-left: 10px;
				transform: rotate(90deg);
			}
			.BSP-pagination-button${BDFDB.dotCN.searchresultspaginationdisabled} {
				cursor: default;
				opacity: .3;
			}
			.BSP-pagination-button${BDFDB.notCN.searchresultspaginationdisabled}:hover {
				opacity: 1;
			}
		`;

		this.defaults = {
			settings: {
				addFirstLast:	{value:true, 	description:"Adds a first and last page button."},
				addJumpTo:		{value:true, 	description:"Adds a jump to input field (press enter to jump)."},
				cloneToTheTop:	{value:true, 	description:"Clones the controls to the top of the results page."}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		var settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.titlesize18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.titlesize16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.DOMUtils.create(settingshtml);

		BDFDB.initElements(settingspanel, this);
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {
			try {return this.initialize();}
			catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
		}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;
			
			BDFDB.ModuleUtils.forceAllUpdates(this);

			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions

	onSettingsClosed (e) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
	}

	processSearchResults (e) {
		if (e.instance.props.search) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:"Pagination"});
			if (index > -1) {
				let settings = BDFDB.DataUtils.get(this, "settings");
				let currentpage = parseInt(Math.floor(e.instance.props.search.offset / BDFDB.DiscordConstants.SEARCH_PAGE_SIZE)) + 1;
				let maxpage = e.instance.props.search.totalResults > 5000 ? parseInt(Math.ceil(5000 / BDFDB.DiscordConstants.SEARCH_PAGE_SIZE)) : parseInt(Math.ceil(e.instance.props.search.totalResults / BDFDB.DiscordConstants.SEARCH_PAGE_SIZE));
				let doJump = page => {
					page = page < 1 ? 1 : (page > maxpage ? maxpage : page);
					if (page < currentpage) BDFDB.LibraryModules.SearchPageUtils.searchPreviousPage(e.instance.props.searchId, (currentpage - page) * BDFDB.DiscordConstants.SEARCH_PAGE_SIZE);
					else if (page > currentpage) BDFDB.LibraryModules.SearchPageUtils.searchNextPage(e.instance.props.searchId, (page - currentpage) * BDFDB.DiscordConstants.SEARCH_PAGE_SIZE);
				};
				let pagination = BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN.searchresultspagination, 
					children: [
						settings.addFirstLast ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							className: ["BSP-pagination-button", "BSP-pagination-first", currentpage == 1 ? BDFDB.disCN.searchresultspaginationdisabled : null].filter(n => n).join(" "),
							text: "First",
							"aria-label": "First",
							onClick: () => {if (currentpage != 1) doJump(1);}
						}) : null,
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							className: [BDFDB.disCN.searchresultspaginationprevious, currentpage == 1 ? BDFDB.disCN.searchresultspaginationdisabled : null].filter(n => n).join(" "),
							text: BDFDB.LanguageUtils.LanguageStrings.PAGINATION_PREVIOUS,
							"aria-label": BDFDB.LanguageUtils.LanguageStrings.PAGINATION_PREVIOUS,
							onClick: () => {if (currentpage != 1) doJump(currentpage - 1);}
						}),
						BDFDB.LanguageUtils.LanguageStringsFormat("PAGINATOR_OF_PAGES", currentpage, maxpage),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							className: [BDFDB.disCN.searchresultspaginationnext, currentpage == maxpage ? BDFDB.disCN.searchresultspaginationdisabled : null].filter(n => n).join(" "),
							text: BDFDB.LanguageUtils.LanguageStrings.PAGINATION_NEXT,
							"aria-label": BDFDB.LanguageUtils.LanguageStrings.PAGINATION_NEXT,
							onClick: () => {if (currentpage != maxpage) doJump(currentpage + 1);}
						}),
						settings.addFirstLast ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							className: ["BSP-pagination-button", "BSP-pagination-last", currentpage == maxpage ? BDFDB.disCN.searchresultspaginationdisabled : null].filter(n => n).join(" "),
							text: "Last",
							"aria-label": "Last",
							onClick: () => {if (currentpage != maxpage) doJump(maxpage);}
						}) : null,
						settings.addJumpTo ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
							id: "BSP-pagination-jumpinput",
							type: "number",
							size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
							suppress: true,
							value: currentpage,
							min: 1,
							max: maxpage,
							onKeyDown: (e, inputinstance) => {
								if (e.which == 13) doJump(inputinstance.props.value);
							}
						}) : null,
						settings.addJumpTo ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							className: "BSP-pagination-button BSP-pagination-jump",
							text: BDFDB.LanguageUtils.LanguageStrings.JUMP,
							"aria-label": BDFDB.LanguageUtils.LanguageStrings.JUMP,
							onClick: (e, buttoninstance) => {
								let jumpinput = BDFDB.ReactUtils.findOwner(buttoninstance._reactInternalFiber.return, {props:[["id","BSP-pagination-jumpinput"]]});
								if (jumpinput) doJump(jumpinput.props.value);
							}
						}) : null
					]
				});
				children.splice(index, 1, pagination);
				if (settings.cloneToTheTop) children.unshift(pagination);
			}
		}
	}
}