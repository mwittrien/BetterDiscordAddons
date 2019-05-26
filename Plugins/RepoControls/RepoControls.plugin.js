//META{"name":"RepoControls","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RepoControls","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RepoControls/RepoControls.plugin.js"}*//

class RepoControls {
	getName () {return "RepoControls";}

	getVersion () {return "1.2.8";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Lets you sort and filter your list of downloaded Themes and Plugins.";}

	initConstructor () {
		this.changelog = {
			"fixed":[["Canary/PTB","Fixed the plugin for canary and ptb"]]
		};
		
		this.patchModules = {
			"V2C_List":"componentDidMount",
			"V2C_PluginCard": ["componentDidMount","componentDidUpdate"],
			"V2C_ThemeCard": ["componentDidMount","componentDidUpdate"]
		};

		this.sortings = {
			sort: {
				name:			"Name",
				author:			"Author",
				version:		"Version",
				description:	"Description",
				enabled:		"Enabled",
				adddate:		"Added",
				moddate:		"Modified"
			},
			order: {
				asc:			"Ascending",
				desc:			"Descending"
			}
		};

		this.repoControlsMarkup = 
			`<div class="repo-controls ${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;">
				<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}" style="flex: 0 1 auto;">
					<button action="add" type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorgreen + BDFDB.disCNS.buttonsizeicon + BDFDB.disCN.buttongrow} btn-enableall" style="flex: 0 0 auto;">
						<div class="${BDFDB.disCN.buttoncontents}">Enable All</div>
					</button>
					<button action="add" type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorred + BDFDB.disCNS.buttonsizeicon + BDFDB.disCN.buttongrow} btn-disableall" style="flex: 0 0 auto;">
						<div class="${BDFDB.disCN.buttoncontents}">Disable All</div>
					</button>
				</div>
				<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.quickselect}" style="flex: 0 1 auto;">
					<div class="${BDFDB.disCNS.flex + BDFDB.disCN.quickselectlabel} style="flex: 0 0 auto;"">Sort by:</div>
					<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.quickselectclick} sort-filter" style="flex: 0 0 auto;">
						<div option="${Object.keys(this.sortings.sort)[0]}" class="${BDFDB.disCN.quickselectvalue}">${this.sortings.sort[Object.keys(this.sortings.sort)[0]]}</div>
						<div class="${BDFDB.disCN.quickselectarrow}"></div>
					</div>
				</div>
				<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.quickselect}" style="flex: 0 1 auto;">
					<div class="${BDFDB.disCNS.flex + BDFDB.disCN.quickselectlabel} style="flex: 0 0 auto;"">Order:</div>
					<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.quickselectclick} order-filter" style="flex: 0 0 auto;">
						<div option="${Object.keys(this.sortings.order)[0]}" class="${BDFDB.disCN.quickselectvalue}">${this.sortings.order[Object.keys(this.sortings.order)[0]]}</div>
						<div class="${BDFDB.disCN.quickselectarrow}"></div>
					</div>
				</div>
			</div>`;

		this.sortPopoutMarkup =
			`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottomright + BDFDB.disCN.popoutnoshadow} repocontrols-sort-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="${BDFDB.disCN.contextmenu} quickSelectPopout">
						<div class="${BDFDB.disCN.contextmenuitemgroup}">
							${Object.keys(this.sortings.sort).map((key, i) => `<div option="${key}" class="${BDFDB.disCN.contextmenuitem}">${this.sortings.sort[key]}</div>`).join("")}
						</div>
					</div>
				</div>
			</div>`;

		this.orderPopoutMarkup =
			`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottomright + BDFDB.disCN.popoutnoshadow} repocontrols-order-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="${BDFDB.disCN.contextmenu} quickSelectPopout">
						<div class="${BDFDB.disCN.contextmenuitemgroup}">
							${Object.keys(this.sortings.order).map((key, i) => `<div option="${key}" class="${BDFDB.disCN.contextmenuitem}">${this.sortings.order[key]}</div>`).join("")}
						</div>
					</div>
				</div>
			</div>`;

		this.editButtonMarkup = 
			`<svg class="editIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="-150 -55 620 620">
				<g fill="currentColor" fill-rule="evenodd">
					<path d="M496.093,189.613c-18.643-15.674-47.168-13.807-63.354,5.493l-9.727,11.508l68.945,57.849l9.288-11.466 C517.22,233.997,515.199,205.621,496.093,189.613z"/>
					<path d="M301.375,350.534l-5.131,6.072c-4.453,5.332-7.661,11.704-9.272,18.457l-13.945,58.359 c-1.318,5.522,0.601,11.323,4.951,14.971c4.234,3.558,10.206,4.591,15.601,2.285l55.063-23.877 c6.372-2.769,12.085-7.031,16.538-12.319l5.149-6.092L301.375,350.534z"/>
					<polygon points="403.656,229.517 320.733,327.631 389.683,385.487 472.601,287.366"/>
					<path d="M376.02,66.504l-56.982-54.141c-5.387-5.107-12.014-8.115-18.999-10.069V90h89.052 C387.23,81.09,382.69,72.836,376.02,66.504z"/>
					<path d="M257.792,368.091c2.681-11.221,8.027-21.841,15.439-30.718l116.807-138.214V120h-105c-8.291,0-15-6.709-15-15V0h-225 c-24.814,0-45,20.186-45,45v422c0,24.814,20.186,45,45,45h300c24.814,0,45-20.186,45-45v-35.459l-1.948,2.305 c-7.368,8.775-16.875,15.85-27.466,20.465l-55.107,23.892c-15.532,6.707-33.511,4.331-46.816-6.812 c-13.14-11.03-18.838-28.242-14.854-44.941L257.792,368.091z M75.038,90h150c8.291,0,15,6.709,15,15s-6.709,15-15,15h-150 c-8.291,0-15-6.709-15-15S66.747,90,75.038,90z M75.038,181h240c8.291,0,15,6.709,15,15s-6.709,15-15,15h-240 c-8.291,0-15-6.709-15-15S66.747,181,75.038,181z M195.038,391h-120c-8.291,0-15-6.709-15-15c0-8.291,6.709-15,15-15h120 c8.291,0,15,6.709,15,15C210.038,384.291,203.329,391,195.038,391z M75.038,301c-8.291,0-15-6.709-15-15c0-8.291,6.709-15,15-15 h180c8.291,0,15,6.709,15,15c0,8.291-6.709,15-15,15H75.038z"/>
				</g>
			</svg>`;

		this.deleteButtonMarkup = 
			`<svg class="trashIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
				<g fill="currentColor" transform="translate(2,1.5)">
					<path d="M 18.012, 0.648 H 12.98 C 12.944, 0.284, 12.637, 0, 12.264, 0 H 8.136 c -0.373, 0 -0.68, 0.284 -0.716, 0.648 H 2.389 c -0.398, 0 -0.72, 0.322 -0.72, 0.72 v 1.368 c 0, 0.398, 0.322, 0.72, 0.72, 0.72 h 15.623 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 1.368 C 18.731, 0.97, 18.409, 0.648, 18.012, 0.648 z"/>
					<path d="M 3.178, 4.839 v 14.841 c 0, 0.397, 0.322, 0.72, 0.72, 0.72 h 12.604 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 4.839 H 3.178 z M 8.449, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 c -0.438, 0 -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z M 13.538, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 s -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z"/>
				</g>
			</svg>`;

		this.css = `
			#bd-settingspane-container .editIcon,
			#bd-settingspane-container .trashIcon {
				margin: 0 5px 0 -2px;
				cursor: pointer;
				vertical-align: top;
				color: #72767d;
			}
			${BDFDB.dotCN.themedark} #bd-settingspane-container .editIcon,
			${BDFDB.dotCN.themedark} #bd-settingspane-container .trashIcon {
				color: #dcddde;
			}`;

		this.defaults = {
			settings: {
				addEditButton:		{value:true, 	description:"Adds an Edit Button to your Plugin and Theme List."},
				addDeleteButton:	{value:true, 	description:"Adds a Delete Button to your Plugin and Theme List."},
				confirmDelete:		{value:true, 	description:"Asks for your confirmation before deleting a File."}
			},
			sortings: {
				sort:		{value:"name"},
				order:		{value:"asc"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.getAllData(this, "settings");
		let settingshtml = `<div class="${this.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="BDFDB-settings-inner">`;
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

			this.fs = require("fs");
			this.path = require("path");
			this.dirs = {theme: BDFDB.getThemesFolder(), plugin: BDFDB.getPluginsFolder()};

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".repo-controls","#bd-settingspane-container .trashIcon");
			BDFDB.removeClasses("repocontrols-added");

			for (let list of document.querySelectorAll(BDFDB.dotCNS._repolist)) {
				list.style.removeProperty("display");
				list.style.removeProperty("flex-direction");
				for (let li of list.querySelectorAll("li")) {
					li.style.removeProperty("display");
					li.style.removeProperty("order");
					var checkbox = li.querySelector(BDFDB.dotCN._repocheckbox);
					if (checkbox) checkbox.removeEventListener("change", checkbox.changeRepoControlsListener);
				}
			}

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	processV2CList (instance, container) {
		if (instance._reactInternalFiber.key) this.addControls(instance._reactInternalFiber.key.split("-")[0], container);
	}

	processV2CPluginCard (instance, wrapper, methodnames) {
		if (wrapper.querySelector(BDFDB.dotCN._reponame)) {
			let settings = BDFDB.getAllData(this, "settings");
			if (instance.props && settings.addDeleteButton) this.addDeleteButton("plugin", wrapper);
			if (instance.props && settings.addEditButton) this.addEditButton("plugin", wrapper);
			if (methodnames.includes("componentDidUpdate")) this.changeTextToHTML(wrapper, "");
		}
	}

	processV2CThemeCard (instance, wrapper, methodnames) {
		if (wrapper.querySelector(BDFDB.dotCN._reponame)) {
			let settings = BDFDB.getAllData(this, "settings");
			if (instance.props && settings.addDeleteButton) this.addDeleteButton("theme", wrapper);
			if (instance.props && settings.addEditButton) this.addEditButton("theme", wrapper);
			if (methodnames.includes("componentDidUpdate")) this.changeTextToHTML(wrapper, "");
		}
	}

	addEditButton (type, wrapper) {
		if (!type || !wrapper || wrapper.querySelector(".editIcon")) return;
		let name = wrapper.getAttribute("data-name");
		let controls = wrapper.querySelector(BDFDB.dotCN._repocontrols);
		if (!name || !controls) return;
		let path = global[`bd${type}s`] && global[`bd${type}s`][name] ? this.path.join(this.dirs[type], global[`bd${type}s`][name].filename) : null;
		if (!path) return;
		let button = BDFDB.htmlToElement(this.editButtonMarkup);
		button.addEventListener("click", () => {
			if (!require("electron").shell.openItem(path)) BDFDB.showToast(`Unable to open ${type} "${name}".`, {type:"danger"});;
		});
		button.addEventListener("mouseenter", e => {
			BDFDB.createTooltip(`Edit ${type[0].toUpperCase() + type.slice(1)}`, e.currentTarget, {type:"top",selector:"repocontrols-editicon-tooltip"});
		});
		controls.insertBefore(button, controls.firstElementChild);
	}

	addDeleteButton (type, wrapper) {
		if (!type || !wrapper || wrapper.querySelector(".trashIcon")) return;
		let name = wrapper.getAttribute("data-name");
		let controls = wrapper.querySelector(BDFDB.dotCN._repocontrols);
		if (!name || !controls) return;
		let path = global[`bd${type}s`] && global[`bd${type}s`][name] ? this.path.join(this.dirs[type], global[`bd${type}s`][name].filename) : null;
		if (!path) return;
		let button = BDFDB.htmlToElement(this.deleteButtonMarkup);
		button.addEventListener("click", () => {
			let deleteFile = () => {
				this.fs.unlink(path, (error) => {
					if (error) BDFDB.showToast(`Unable to delete ${type} "${name}".`, {type:"danger"});
					else BDFDB.showToast(`Successfully deleted ${type} "${name}".`, {type:"success"});
				});
			};
			if (!BDFDB.getData("confirmDelete", this, "settings")) deleteFile();
			else BDFDB.openConfirmModal(this, `Are you sure you want to delete the ${type} "${name}"?`, () => {
				deleteFile();
			});
		});
		button.addEventListener("mouseenter", e => {
			BDFDB.createTooltip(`Delete ${type[0].toUpperCase() + type.slice(1)}`, e.currentTarget, {type:"top",selector:"repocontrols-trashicon-tooltip"});
		});
		controls.insertBefore(button, controls.firstElementChild);
	}

	addControls (type, container) {
		if (!type || !container) return;
		BDFDB.removeEles(".repo-controls");

		container.style.setProperty("display", "flex", "important");
		container.style.setProperty("flex-direction", "column", "important");

		let sortings = BDFDB.getAllData(this, "sortings");

		let repocontrols = BDFDB.htmlToElement(this.repoControlsMarkup);
		repocontrols.insertBefore(BDFDB.createSearchBar("small"), repocontrols.firstElementChild);
		BDFDB.initElements(repocontrols, this);
		container.parentElement.insertBefore(repocontrols, container);

		let sortfilter = repocontrols.querySelector(".sort-filter " + BDFDB.dotCN.quickselectvalue);
		sortfilter.setAttribute("option", sortings.sort);
		sortfilter.innerText = this.sortings.sort[sortings.sort];
		let orderfilter = repocontrols.querySelector(".order-filter " + BDFDB.dotCN.quickselectvalue);
		orderfilter.setAttribute("option", sortings.order);
		orderfilter.innerText = this.sortings.order[sortings.order];

		BDFDB.addChildEventListener(repocontrols, "keyup", BDFDB.dotCN.searchbarinput, () => {
			clearTimeout(repocontrols.searchTimeout);
			repocontrols.searchTimeout = setTimeout(() => {this.sortEntries(container, repocontrols);},1000);
		});
		BDFDB.addChildEventListener(repocontrols, "click", BDFDB.dotCN.searchbarclear + BDFDB.dotCN.searchbarvisible, () => {
			this.sortEntries(container, repocontrols);
		});
		BDFDB.addChildEventListener(repocontrols, "click", ".btn-enableall", e => {
			this.toggleAll(type, container, true);
		});
		BDFDB.addChildEventListener(repocontrols, "click", ".btn-disableall", e => {
			this.toggleAll(type, container, false);
		});
		BDFDB.addChildEventListener(repocontrols, "click", ".sort-filter", e => {
			BDFDB.createSortPopout(e.currentTarget, this.sortPopoutMarkup, () => {
				BDFDB.saveData("sort", sortfilter.getAttribute("option"), this, "sortings");
				this.sortEntries(container, repocontrols);
			});
		});
		BDFDB.addChildEventListener(repocontrols, "click", ".order-filter", e => {
			BDFDB.createSortPopout(e.currentTarget, this.orderPopoutMarkup, () => {
				BDFDB.saveData("order", orderfilter.getAttribute("option"), this, "sortings");
				this.sortEntries(container, repocontrols);
			});
		});

		BDFDB.addClass(container, "repocontrols-added");

		container.entries = {};
		for (let li of container.children) {
			if (li.querySelector(BDFDB.dotCN._reponame)) {
				let name = li.querySelector(BDFDB.dotCN._reponame).textContent;
				let version = li.querySelector(BDFDB.dotCN._repoversion).textContent;
				let author = li.querySelector(BDFDB.dotCN._repoauthor).textContent;
				let description = li.querySelector(BDFDB.dotCN._repodescription).textContent;
				let enabled = li.querySelector(BDFDB.dotCN._repocheckbox).checked;
				let path = global[`bd${type}s`] && global[`bd${type}s`][name] ? this.path.join(this.dirs[type], global[`bd${type}s`][name].filename) : null;
				let stats = path ? this.fs.statSync(path) : null;
				container.entries[name] = {
					search:			(name + " " + version + " " + author + " " + description).toUpperCase(),
					origName: 		name,
					name: 			(name).toUpperCase(),
					version: 		(version).toUpperCase(),
					author: 		(author).toUpperCase(),
					description: 	(description).toUpperCase(),
					type:			type,
					path:			path,
					adddate:		stats ? stats.atime.getTime() : null,
					moddate:		stats ? stats.mtime.getTime() : null,
					enabled:		enabled ? 0 : 1
				};
			}
		}
		this.sortEntries(container, repocontrols);
	}

	sortEntries (container, repocontrols) {
		if (typeof container.entries != "object") return;
		let searchstring = repocontrols.querySelector(BDFDB.dotCN.searchbarinput).value.replace(/[<|>]/g, "").toUpperCase();

		let sortings = BDFDB.getAllData(this, "sortings");
		let entries = BDFDB.filterObject(container.entries, entry => {return entry.search.indexOf(searchstring) > -1 ? entry : null;});
		entries = BDFDB.sortObject(entries, sortings.sort);
		if (sortings.order == "desc") entries = BDFDB.reverseObject(entries);
		let entrypositions = Object.keys(entries);
		for (let li of container.children) {
			let name = li.getAttribute("data-name");
			let pos = entrypositions.indexOf(name);
			if (pos > -1) {
				this.changeTextToHTML(li, searchstring);
				li.style.setProperty("order", pos, "important");
				var checkbox = li.querySelector(BDFDB.dotCN._repocheckbox);
				if (checkbox) {
					checkbox.removeEventListener("change", checkbox.changeRepoControlsListener);
					checkbox.changeRepoControlsListener = () => {entries[name].enabled = checkbox.checked ? 0 : 1};
					checkbox.addEventListener("change", checkbox.changeRepoControlsListener);
				}
			}
			else li.style.removeProperty("order");
			BDFDB.toggleEles(li, pos > -1)
		}
	}

	changeTextToHTML (wrapper, searchstring) {
		if (!wrapper || !wrapper.tagName) return;
		for (let ele of wrapper.querySelectorAll(BDFDB.dotCNC._reponame + BDFDB.dotCNC._repoversion + BDFDB.dotCNC._repoauthor + BDFDB.dotCN._repodescription)) {
			var string = ele.firstElementChild ? ele.innerHTML : ele.innerText;
			if (BDFDB.containsClass(ele, BDFDB.disCN._repodescription)) {
				ele.style.display = "block";
				if (searchstring && searchstring.length > 2) ele.innerHTML = BDFDB.highlightText(string, searchstring);
				else ele.innerHTML = string;
			}
			else if (searchstring && searchstring.length > 2 || ele.querySelector(BDFDB.dotCN.highlight)) ele.innerHTML = BDFDB.highlightText(string, searchstring); 
		}
	}

	toggleAll (type, container, enable) {
		BDFDB.openConfirmModal(this, `Are you sure you want to ${enable ? "enable" : "disable"} all ${type[0].toUpperCase() + type.slice(1)}s?`, () => {
			for (let header of container.querySelectorAll(BDFDB.dotCN._repoheader)) {
				if (header.querySelector(BDFDB.dotCN._reponame).textContent.toLowerCase().indexOf(this.name.toLowerCase()) != 0) {
					let switchwrap = header.querySelector(BDFDB.dotCN._repocheckboxwrap);
					if (switchwrap) {
						let switchinner = switchwrap.querySelector(BDFDB.dotCN._repocheckboxinner);
						let switchinput = switchwrap.querySelector(BDFDB.dotCN._repocheckbox);
						if (switchinner && switchinput) {
							if (BDFDB.containsClass(switchinner, BDFDB.disCN._repocheckboxchecked) && !enable) switchinput.click();
							else if (!BDFDB.containsClass(switchinner, BDFDB.disCN._repocheckboxchecked) && enable) switchinput.click();
						}
					}
				}
			}
		});
	}
}