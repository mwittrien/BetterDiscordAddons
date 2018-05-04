//META{"name":"BetterSearchPage"}*//

class BetterSearchPage {
	initConstructor () {
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
				-webkit-transform: rotate(180deg);
				margin-right: 10px;
				transform: rotate(180deg);
			}
			.BSP-pagination-button.BSP-pagination-last {
				margin-left: 10px;
				margin-right: 10px;
			}
			.BSP-pagination-button${BDFDB.dotCN.searchresultspaginationdisabled} {
				cursor: default;
				opacity: .3;
			}
			.BSP-pagination-button:not(${BDFDB.dotCN.searchresultspaginationdisabled}):hover {
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

	getName () {return "BetterSearchPage";}

	getDescription () {return "Adds some extra controls to the search results page.";}

	getVersion () {return "1.0.1";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
		var settings = BDFDB.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner}"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel)
			.on("click", BDFDB.dotCN.switchinner, () => {this.updateSettings(settingspanel);});
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDFDB === "object") {
			BDFDB.loadMessage(this);
			
			this.SearchNavigation = BDFDB.WebModules.findByProperties(["searchNextPage","searchPreviousPage"]);
			this.SearchUtils = BDFDB.WebModules.findByProperties(["getCurrentSearchId"]);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.classList.contains(BDFDB.disCN.searchresultswrap)) {
									BDFDB.addObserver(this, node, {name:"searchResultsObserver"}, {childList:true, subtree:true});
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCNS.chat + BDFDB.dotCN.chatcontent, {name:"chatContentObserver",instance:observer}, {childList:true});

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								let pagination = null;
								if (node && node.tagName && (pagination = node.querySelector(BDFDB.dotCN.searchresultspagination)) != null) {
									this.addNewControls(pagination);
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCNS.searchresultswrap, {name:"searchResultsObserver",instance:observer}, {childList:true, subtree:true});
			
			let pagination = document.querySelector(BDFDB.dotCNS.searchresultswrap + BDFDB.dotCNS.searchresultspagination);
			if (pagination) this.addNewControls(pagination);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			document.querySelectorAll(".BSP-pagination, .BSP-pagination-button, .BSP-pagination-jumpinput").forEach(ele => {ele.remove();});
			
			BDFDB.unloadMessage(this);
		}
	}

	onSwitch () {
		if (typeof BDFDB === "object") {
			BDFDB.addObserver(this, BDFDB.dotCNS.chat + BDFDB.dotCN.chatcontent, {name:"chatContentObserver"}, {childList:true});
			BDFDB.addObserver(this, BDFDB.dotCNS.searchresultswrap, {name:"searchResultsObserver"}, {childList:true, subtree:true});
			let pagination = document.querySelector(BDFDB.dotCNS.searchresultswrap + BDFDB.dotCNS.searchresultspagination);
			if (pagination) this.addNewControls(pagination);
		}
	}
	
	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
			settings[input.value] = input.checked;
		}
		BDFDB.saveAllData(settings, this, "settings");
	}
	
	addNewControls (pagination) {
		if (!pagination || document.querySelector(".BSP-pagination, .BSP-pagination-button, .BSP-pagination-jumpinput")) return; 
		let searchResults = document.querySelector(BDFDB.dotCN.searchresults);
		let searchID = this.SearchUtils.getCurrentSearchId();
		if (!searchResults || !searchID) return;
		let currentpage, maxpage;
		for (let word of pagination.textContent.split(" ")) {
			let number = parseInt(word.replace(/\./g,""));
			if (!isNaN(number) && !currentpage) {
				currentpage = number;
			}
			else if (!isNaN(number)) {
				maxpage = number;
				break;
			}
		}
		if (!currentpage || !maxpage) return;
		let temppage = currentpage;
		currentpage = currentpage < maxpage ? currentpage : maxpage;
		maxpage = temppage < maxpage ? maxpage : temppage;
		if (maxpage > 201) {
			if (currentpage == 201) BDFDB.showToast("Discord doesn't allow you to go further than page 201.",{type:"error"});
			maxpage = 201;
		}
		if (currentpage == maxpage && maxpage == 201) pagination.querySelector(BDFDB.dotCN.searchresultspaginationnext).classList.add(BDFDB.disCN.searchresultspaginationdisabled);
		let settings = BDFDB.getAllData(this, "settings");
		if (settings.addFirstLast) {
			let BSPpaginatonFirst = document.createElement("div");
			BSPpaginatonFirst.className = "BSP-pagination-button BSP-pagination-first";
			if (currentpage == 1) BSPpaginatonFirst.classList.add(BDFDB.disCN.searchresultspaginationdisabled);
			pagination.insertBefore(BSPpaginatonFirst, pagination.firstElementChild);
			let BSPpaginatonLast = document.createElement("div");
			BSPpaginatonLast.className = "BSP-pagination-button BSP-pagination-last";
			if (currentpage == maxpage) BSPpaginatonLast.classList.add(BDFDB.disCN.searchresultspaginationdisabled);
			pagination.appendChild(BSPpaginatonLast);
		}
		if (settings.addJumpTo) {
			let jumpInput = 
				$(`<div class="inputNumberWrapper inputNumberWrapperMini BSP-pagination-jumpinput ${BDFDB.disCN.inputwrapper}">
					<span class="numberinput-buttons-zone">
						<span class="numberinput-button-up"></span>
						<span class="numberinput-button-down"></span>
					</span>
					<input type="number" min="1" max="${maxpage}" placeholder="${currentpage}" value="${currentpage}" class="${BDFDB.disCNS.inputmini + BDFDB.disCNS.input + BDFDB.disCN.size16}">
				</div>`)[0];
			pagination.appendChild(jumpInput);
		}
		BDFDB.initElements(pagination);
		if (settings.cloneToTheTop) {
			let BSPpaginaton = pagination.cloneNode(true);
			BSPpaginaton.classList.add("BSP-pagination");
			searchResults.parentElement.insertBefore(BSPpaginaton, searchResults);
			BDFDB.initElements(BSPpaginaton);
		}
		$(searchResults.parentElement) 
			.off("click." + this.getName()).off("keyup." + this.getName())
			.on("click." + this.getName(), BDFDB.dotCN.searchresultspaginationprevious + BDFDB.dotCN.searchresultspaginationdisabled, (e) => {
				e.preventDefault();
				e.stopPropagation();
			})
			.on("click." + this.getName(), BDFDB.dotCN.searchresultspaginationnext + BDFDB.dotCN.searchresultspaginationdisabled, (e) => {
				e.preventDefault();
				e.stopPropagation();
			})
			.on("click." + this.getName(), ".BSP-pagination " + BDFDB.dotCN.searchresultspaginationprevious + ":not(" + BDFDB.dotCN.searchresultspaginationdisabled + ")", () => {
				this.SearchNavigation.searchPreviousPage(searchID);
			})
			.on("click." + this.getName(), ".BSP-pagination " + BDFDB.dotCN.searchresultspaginationnext + ":not(" + BDFDB.dotCN.searchresultspaginationdisabled + ")", () => {
				this.SearchNavigation.searchNextPage(searchID);
			})
			.on("click." + this.getName(), ".BSP-pagination-first:not(" + BDFDB.dotCN.searchresultspaginationdisabled + ")", () => {
				for (let i = 0; currentpage - 1 - i > 0; i++) {
					this.SearchNavigation.searchPreviousPage(searchID);
				}
			})
			.on("click." + this.getName(), ".BSP-pagination-last:not(" + BDFDB.dotCN.searchresultspaginationdisabled + ")", () => {
				for (let i = 0; maxpage - currentpage - i > 0; i++) {
					this.SearchNavigation.searchNextPage(searchID);
				}
			})
			.on("keyup." + this.getName(), ".BSP-pagination-jumpinput " + BDFDB.dotCN.inputmini, (e) => {
				if (e.which == 13) {
					let value = e.target.value;
					if (value < 1 || value > maxpage) {
						e.target.value = currentpage;
						if (maxpage == 201 && value > maxpage) BDFDB.showToast("Discord doesn't allow you to go further than page 201.",{type:"error"});
					}
					else if (value < currentpage) {
						for (; currentpage - value > 0; value++) {
							this.SearchNavigation.searchPreviousPage(searchID);
						}
					}
					else if (value > currentpage) {
						for (; value - currentpage > 0; value--) {
							this.SearchNavigation.searchNextPage(searchID);
						}
					}
				}
			});
	}
}