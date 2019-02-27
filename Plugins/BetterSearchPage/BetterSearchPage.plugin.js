//META{"name":"BetterSearchPage","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterSearchPage","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterSearchPage/BetterSearchPage.plugin.js"}*//

class BetterSearchPage {
	getName () {return "BetterSearchPage";}

	getVersion () {return "1.0.6";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Adds some extra controls to the search results page.";}

	initConstructor () {
		this.changelog = {
			"fixed":[["Language Issues","Fixed the bug where the plugin wouldn't work with certain languages"]]
		};
		
		this.patchModules = {
			"SearchResults":["componentDidMount","componentDidUpdate"],
			"StandardSidebarView":"componentWillUnmount"
		};

		this.css = `
			.BSP-pagination-button {
				background: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" width="30" height="25"><g fill="#737f8d" fill-rule="evenodd" clip-rule="evenodd"><path xmlns="http://www.w3.org/2000/svg" d="M17.338 12.485c-4.156 4.156-8.312 8.312-12.468 12.467-1.402-1.402-2.805-2.804-4.207-4.206 2.756-2.757 5.513-5.514 8.27-8.27C6.176 9.72 3.419 6.963.663 4.207L4.87 0c-.058-.059 12.555 12.562 12.468 12.485z"/><path xmlns="http://www.w3.org/2000/svg" d="M17.338 12.485c-4.156 4.156-8.312 8.312-12.468 12.467-1.402-1.402-2.805-2.804-4.207-4.206 2.756-2.757 5.513-5.514 8.27-8.27C6.176 9.72 3.419 6.963.663 4.207L4.87 0c-.058-.059 12.555 12.562 12.468 12.485z" transform="translate(12 0)"/></g></svg>') 50%/9px 12px no-repeat;
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
				background-image: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" width="30" height="25"><g fill="#FFF" fill-rule="evenodd" clip-rule="evenodd"><path xmlns="http://www.w3.org/2000/svg" d="M17.338 12.485c-4.156 4.156-8.312 8.312-12.468 12.467-1.402-1.402-2.805-2.804-4.207-4.206 2.756-2.757 5.513-5.514 8.27-8.27C6.176 9.72 3.419 6.963.663 4.207L4.87 0c-.058-.059 12.555 12.562 12.468 12.485z" /><path xmlns="http://www.w3.org/2000/svg" d="M17.338 12.485c-4.156 4.156-8.312 8.312-12.468 12.467-1.402-1.402-2.805-2.804-4.207-4.206 2.756-2.757 5.513-5.514 8.27-8.27C6.176 9.72 3.419 6.963.663 4.207L4.87 0c-.058-.059 12.555 12.562 12.468 12.485z" transform="translate(12 0)"/></g></svg>');
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
		var settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
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
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
			document.head.appendChild(libraryScript);
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