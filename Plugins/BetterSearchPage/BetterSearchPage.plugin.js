//META{"name":"BetterSearchPage","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterSearchPage","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterSearchPage/BetterSearchPage.plugin.js"}*//

class BetterSearchPage {
	getName () {return "BetterSearchPage";}

	getVersion () {return "1.0.7";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds some extra controls to the search results page.";}

	initConstructor () {
		this.changelog = {
			"fixed":[["Canary/PTB","Fixed the plugin for canary and ptb"]]
		};
		
		this.patchModules = {
			"SearchResults":["componentDidMount","componentDidUpdate"],
			"StandardSidebarView":"componentWillUnmount"
		};

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
		var settings = BDFDB.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

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
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				require("request")("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
					if (body) {
						libraryScript = document.createElement("script");
						libraryScript.setAttribute("id", "BDFDBLibraryScript");
						libraryScript.setAttribute("type", "text/javascript");
						libraryScript.setAttribute("date", performance.now());
						libraryScript.innerText = body;
						document.head.appendChild(libraryScript);
					}
					this.initialize();
				});
			}, 15000);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);     

			this.SearchNavigation = BDFDB.WebModules.findByProperties("searchNextPage","searchPreviousPage");

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".BSP-pagination",".BSP-pagination-button",".BSP-pagination-jumpinput");
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	processSearchResults (instance, wrapper) {
		if (instance.props && instance.props.searchId) this.addNewControls(wrapper.querySelector(BDFDB.dotCN.searchresultspagination), instance.props.searchId);
	}

	processStandardSidebarView (instance, wrapper) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			BDFDB.removeEles(".BSP-pagination",".BSP-pagination-button",".BSP-pagination-jumpinput");
			BDFDB.WebModules.forceAllUpdates(this);
		}
	}

	addNewControls (pagination, searchId) {
		if (!pagination || !searchId || document.querySelector(".BSP-pagination, .BSP-pagination-button, .BSP-pagination-jumpinput")) return;
		let searchResultsWrapper = BDFDB.getParentEle(BDFDB.dotCN.searchresultswrapper, pagination);
		if (!searchResultsWrapper) return;
		let numbers = pagination.textContent.replace(/[\s\.\,]/g,"").split(/[^\d]/).filter(n => n);
		let currentpage = parseInt(numbers[0]);
		let maxpage = parseInt(numbers[1]);
		if (isNaN(currentpage) || isNaN(maxpage)) return;
		let temppage = currentpage;
		currentpage = currentpage < maxpage ? currentpage : maxpage;
		maxpage = temppage < maxpage ? maxpage : temppage;
		if (maxpage > 201) {
			if (currentpage == 201) BDFDB.showToast("Discord doesn't allow you to go further than page 201.",{type:"error"});
			maxpage = 201;
		}
		if (currentpage == maxpage && maxpage == 201) BDFDB.addClass(pagination.querySelector(BDFDB.dotCN.searchresultspaginationnext), BDFDB.disCN.searchresultspaginationdisabled);
		let settings = BDFDB.getAllData(this, "settings");
		for (let btn of pagination.querySelectorAll(BDFDB.dotCNC.searchresultspaginationprevious + BDFDB.dotCN.searchresultspaginationnext)) BDFDB.addClass(btn, "pagination-button");
		if (settings.addFirstLast) {
			pagination.insertBefore(BDFDB.htmlToElement(`<div aria-label="First" class="${currentpage == 1 ? BDFDB.disCNS.searchresultspaginationdisabled : ""}pagination-button BSP-pagination-button BSP-pagination-first"></div>`), pagination.firstElementChild);
			pagination.appendChild(BDFDB.htmlToElement(`<div aria-label="Last" class="${currentpage == maxpage ? BDFDB.disCNS.searchresultspaginationdisabled : ""}pagination-button BSP-pagination-button BSP-pagination-last"></div>`));
		}
		if (settings.addJumpTo) {
			pagination.appendChild(BDFDB.htmlToElement(`<div class="inputNumberWrapper inputNumberWrapperMini BSP-pagination-jumpinput ${BDFDB.disCN.inputwrapper}"><span class="numberinput-buttons-zone"><span class="numberinput-button-up"></span><span class="numberinput-button-down"></span></span><input type="number" min="1" max="${maxpage}" placeholder="${currentpage}" value="${currentpage}" class="${BDFDB.disCNS.inputmini + BDFDB.disCNS.input + BDFDB.disCN.size16}"></div>`));
			pagination.appendChild(BDFDB.htmlToElement(`<div aria-label="Go To" class="pagination-button BSP-pagination-button BSP-pagination-jump"></div>`));
		}
		BDFDB.initElements(pagination, this);
		if (settings.cloneToTheTop) {
			let BSPpaginaton = pagination.cloneNode(true);
			BDFDB.addClass(BSPpaginaton, "BSP-pagination");
			searchResultsWrapper.insertBefore(BSPpaginaton, searchResultsWrapper.firstElementChild);
			BDFDB.initElements(BSPpaginaton, this);
		}
		var doJump = (input) => {
			let value = input.value;
			if (value < 1 || value > maxpage) {
				input.value = currentpage;
				if (maxpage == 201 && value > maxpage) BDFDB.showToast("Discord doesn't allow you to go further than page 201.",{type:"error"});
			}
			else if (value < currentpage) {
				for (; currentpage - value > 0; value++) {
					this.SearchNavigation.searchPreviousPage(searchId);
				}
			}
			else if (value > currentpage) {
				for (; value - currentpage > 0; value--) {
					this.SearchNavigation.searchNextPage(searchId);
				}
			}
		};
		BDFDB.addEventListener(this, searchResultsWrapper, "click", BDFDB.dotCN.searchresultspaginationdisabled, e => {
			BDFDB.stopEvent(e);
		});
		BDFDB.addEventListener(this, searchResultsWrapper, "click", `.BSP-pagination ${BDFDB.dotCN.searchresultspaginationprevious + BDFDB.notCN.searchresultspaginationdisabled}`, () => {
			this.SearchNavigation.searchPreviousPage(searchId);
		});
		BDFDB.addEventListener(this, searchResultsWrapper, "click", `.BSP-pagination ${BDFDB.dotCN.searchresultspaginationnext + BDFDB.notCN.searchresultspaginationdisabled}`, () => {
			this.SearchNavigation.searchNextPage(searchId);
		});
		BDFDB.addEventListener(this, searchResultsWrapper, "click", `.BSP-pagination-first${BDFDB.notCN.searchresultspaginationdisabled}`, () => {
			for (let i = 0; currentpage - 1 - i > 0; i++) this.SearchNavigation.searchPreviousPage(searchId);
		});
		BDFDB.addEventListener(this, searchResultsWrapper, "click", `.BSP-pagination-last${BDFDB.notCN.searchresultspaginationdisabled}`, () => {
			for (let i = 0; maxpage - currentpage - i > 0; i++) this.SearchNavigation.searchNextPage(searchId);
		});
		BDFDB.addEventListener(this, searchResultsWrapper, "click", `.BSP-pagination-jump${BDFDB.notCN.searchresultspaginationdisabled}`, e => {
			doJump(e.currentTarget.parentElement.querySelector(`.BSP-pagination-jumpinput ${BDFDB.dotCN.inputmini}`));
		});
		BDFDB.addEventListener(this, searchResultsWrapper, "keydown", `.BSP-pagination-jumpinput ${BDFDB.dotCN.inputmini}`, e => {
			let label = e.currentTarget.getAttribute("aria-label");
			if (label) BDFDB.createTooltip(label, e.currentTarget, {type:"top"});
		});
		BDFDB.addEventListener(this, searchResultsWrapper, "mouseenter", `.pagination-button${BDFDB.notCN.searchresultspaginationdisabled}`, e => {
			let label = e.currentTarget.getAttribute("aria-label");
			if (label) BDFDB.createTooltip(label, e.currentTarget, {type:"top"});
		});
	}
}