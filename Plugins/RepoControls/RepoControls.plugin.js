//META{"name":"RepoControls"}*//

class RepoControls {
	initConstructor () {
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
				<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCNS.searchbar + BDFDB.disCN.size14}" style="flex: 1 1 auto;">
					<input class="${BDFDB.disCN.searchbarinput}" value="" placeholder="Search for ..." style="flex: 1 1 auto;">
					<div class="${BDFDB.disCN.searchbariconwrap}">
						<i class="${BDFDB.disCNS.searchbaricon + BDFDB.disCNS.searchbareyeglass + BDFDB.disCN.searchbarvisible}"/>
						<i class="${BDFDB.disCNS.searchbaricon + BDFDB.disCN.searchbarclear}"/>
					</div>
				</div>
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
			`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottomright + BDFDB.disCN.popoutnoshadow} repocontrols-sort-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);" option="sort">
				<div>
					<div class="${BDFDB.disCN.contextmenu} quickSelectPopout">
						<div class="${BDFDB.disCN.contextmenuitemgroup}">
							${Object.keys(this.sortings.sort).map((key, i) => `<div option="${key}" class="${BDFDB.disCN.contextmenuitem}">${this.sortings.sort[key]}</div>`).join("")}
						</div>
					</div>
				</div>
			</div>`;
			
		this.orderPopoutMarkup =
			`<div class="${BDFDB.disCNS.popout + BDFDB.disCNS.popoutbottomright + BDFDB.disCN.popoutnoshadow} repocontrols-order-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);" option="order">
				<div>
					<div class="${BDFDB.disCN.contextmenu} quickSelectPopout">
						<div class="${BDFDB.disCN.contextmenuitemgroup}">
							${Object.keys(this.sortings.order).map((key, i) => `<div option="${key}" class="${BDFDB.disCN.contextmenuitem}">${this.sortings.order[key]}</div>`).join("")}
						</div>
					</div>
				</div>
			</div>`;
			
		this.deleteButtonMarkup = 
			`<svg class="trashIcon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px">
				<g fill="white">
					<path d="M 18.012, 0.648 H 12.98 C 12.944, 0.284, 12.637, 0, 12.264, 0 H 8.136 c -0.373, 0 -0.68, 0.284 -0.716, 0.648 H 2.389 c -0.398, 0 -0.72, 0.322 -0.72, 0.72 v 1.368 c 0, 0.398, 0.322, 0.72, 0.72, 0.72 h 15.623 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 1.368 C 18.731, 0.97, 18.409, 0.648, 18.012, 0.648 z"/><path d="M 3.178, 4.839 v 14.841 c 0, 0.397, 0.322, 0.72, 0.72, 0.72 h 12.604 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 4.839 H 3.178 z M 8.449, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 c -0.438, 0 -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z M 13.538, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 s -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z"/>
				</g>
			</svg>`;
		
		this.css = `
			#bd-settingspane-container .bda-description {
				display: block;
			}
			#bd-settingspane-container .bda-header {
				position: relative;
			}
			#bd-settingspane-container .trashIcon {
				display: none;
			}
			#bd-settingspane-container .bda-header .trashIcon {
				cursor: pointer;
				display: block;
				position: absolute;
				right: 50px;
				top: 2px;
			}
			#bd-settingspane-container .bda-header .bd-reload ~ .trashIcon {
				right: 78px;
			}`;
			
		this.defaults = {
			settings: {
				addDeleteButton:	{value:true, 	description:"Add a Delete Button to your Plugin and Theme List."},
				confirmDelete:		{value:true, 	description:"Ask for your confirmation before deleting a File."}
			},
			sortings: {
				sort:		{value:"name"},
				order:		{value:"asc"}
			}
		};
	}

	getName () {return "RepoControls";}

	getDescription () {return "Lets you sort and filter your list of downloaded Themes and Plugins.";}

	getVersion () {return "1.2.1";}

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
			
			this.fs = require("fs");
			this.path = require("path");
			this.dirs = {themes: BDFDB.getThemesFolder(), plugins: BDFDB.getPluginsFolder()};
			
			var observer = null;
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, j) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (this.getSettingsPageType(node)) {
									this.addControls(node.querySelector(".bda-slist"));
									if (node.tagName && node.querySelector(".ui-switch")) {
										var entry = this.getEntry($(".repo-controls"), $("li").has(node)[0]);
										if (entry) {
											if (BDFDB.getData("addDeleteButton", this, "settings")) this.addDeleteButton(entry);
											this.changeTextToHTML(entry.div);
										}
									}
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.layer + "[layer-id='user-settings']", {name:"innerSettingsWindowObserver",instance:observer}, {childList:true,subtree:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								setImmediate(() => {
									if (node.tagName && node.getAttribute("layer-id") == "user-settings") {
										BDFDB.addObserver(this, node, {name:"innerSettingsWindowObserver"}, {childList:true,subtree:true});
										if (this.getSettingsPageType(node)) this.addControls(node.querySelector(".bda-slist"));
									}
								});
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.layers, {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			var settingswindow = document.querySelector(BDFDB.dotCN.layer + "[layer-id='user-settings']");
			if (settingswindow && this.getSettingsPageType(settingswindow)) this.addControls(settingswindow.querySelector(".bda-slist"));
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDFDB === "object") {
			$(".repo-controls, #bd-settingspane-container .trashIcon").remove();
			$(".repocontrols-added").removeClass(".repocontrols-added");
			
			BDFDB.unloadMessage(this);
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
	
	getSettingsPageType (container) {
		if (typeof container === "undefined") container = document.querySelector(BDFDB.dotCN.layer + "[layer-id='user-settings']");
		if (container && container.tagName) {
			var folderbutton = container.querySelector(".bd-pfbtn");
			if (folderbutton) {
				var buttonbar = folderbutton.parentElement;
				if (buttonbar && buttonbar.tagName) {
					var header = buttonbar.querySelector("h2");
					if (header) {
						var headerText = BDFDB.getInnerText(header).toLowerCase();
						if (headerText === "plugins" || headerText === "themes") return headerText;
					}
				}
			}
		}
		return null;
	}
	
	addControls (container) {
		if (!container || document.querySelector(".repo-controls")) return;
		
		var sortings = BDFDB.getAllData(this, "sortings");
		
		var repoControls = $(this.repoControlsMarkup);
		BDFDB.initElements(repoControls);
		repoControls.find(".sort-filter " + BDFDB.dotCN.quickselectvalue).attr("option", sortings.sort).text(this.sortings.sort[sortings.sort]);
		repoControls.find(".order-filter " + BDFDB.dotCN.quickselectvalue).attr("option", sortings.order).text(this.sortings.order[sortings.order]);
		repoControls
			.on("keyup." + this.getName(), BDFDB.dotCN.searchbarinput, () => {
				clearTimeout(repoControls.searchTimeout);
				repoControls.searchTimeout = setTimeout(() => {this.addEntries(container, repoControls);},1000);
			})
			.on("click." + this.getName(), BDFDB.dotCN.searchbarclear + BDFDB.dotCN.searchbarvisible, () => {
				this.addEntries(container, repoControls);
			})
			.on("click." + this.getName(), ".btn-enableall", (e) => {
				this.toggleAll(container, true);
			})
			.on("click." + this.getName(), ".btn-disableall", (e) => {
				this.toggleAll(container, false);
			})
			.on("click." + this.getName(), ".sort-filter", (e) => {
				this.openSortPopout(e, this.sortPopoutMarkup, container, repoControls);
			})
			.on("click." + this.getName(), ".order-filter", (e) => {
				this.openSortPopout(e, this.orderPopoutMarkup, container, repoControls);
			})
			.insertBefore(container);
		
		$(container).addClass("repocontrols-added").on("click." + this.getName(), "div[style='float: right; cursor: pointer;']", (e) => {
			setImmediate(() => {
				var entry = this.getEntry(repoControls, $("li").has(e.currentTarget)[0]);
				if (entry) {
					if (BDFDB.getData("addDeleteButton", this, "settings")) this.addDeleteButton(entry);
					this.changeTextToHTML(entry.div);
				}
			});
		});
			
		container.entries = [];
		for (let li of container.querySelectorAll("li")) {
			container.entries.push(this.getEntry(repoControls, li));
		}
		
		this.addEntries(container, repoControls);
	}
	
	getEntry (repoControls, li) {
		if (!repoControls || !li || !li.tagName || !li.querySelector(".bda-name")) return null;
		let name = li.querySelector(".bda-name").textContent;
		let version = li.querySelector(".bda-version").textContent;
		let author = li.querySelector(".bda-author").textContent;
		let description = li.querySelector(".bda-description").textContent;
		let enabled = li.querySelector(".ui-switch-checkbox").checked;
		let type = this.getSettingsPageType();
		let path = type && global[`bd${type}`] && global[`bd${type}`][name] ? this.path.join(this.dirs[type], global[`bd${type}`][name].filename) : null;
		let stats = path ? this.fs.statSync(path) : null;
		return {
			div: 			li,
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
	
	addEntries (container, repoControls) {
		$(container).find(".trashIcon, li").remove();
		
		var searchstring = repoControls.find(BDFDB.dotCN.searchbarinput).val().replace(/[<|>]/g, "").toUpperCase();
		
		var entries = container.entries;
		var sortings = BDFDB.getAllData(this, "sortings");
		entries = entries.filter((entry) => {return entry.search.indexOf(searchstring) > -1 ? entry : null;});
		BDFDB.sortArrayByKey(entries, sortings.sort);
		if (sortings.order == "desc") entries.reverse();
		
		var settings = BDFDB.getAllData(this, "settings");
		for (let entry of entries) {
			container.appendChild(entry.div);
			if (settings.addDeleteButton) this.addDeleteButton(entry);
			this.changeTextToHTML(entry.div, searchstring);
			$(entry.div).find(".ui-switch-checkbox")
				.off("change." + this.getName())
				.on("change." + this.getName(), (e) => {
					entry.enabled = e.checked ? 0 : 1
				});
		}
	}
	
	addDeleteButton (entry) {
		if (!entry || !entry.div || !entry.div.tagName || entry.div.querySelector(".trashIcon")) return;
		$(this.deleteButtonMarkup)
			.on("click." + this.getName(), () => {
				var container = document.querySelector(".bda-slist");
				let type = entry.type ? entry.type.slice(0, -1) : "file";
				if (container && (!BDFDB.getData("confirmDelete", this, "settings") || confirm(`Are you sure you want to delete this ${type}?`))) {
					this.fs.unlink(entry.path, (error) => {
						if (error) {
							BDFDB.showToast(`Unable to delete ${type} "${entry.origName}". Filename might not be the same as ${type}name.`, {type:"danger"});
						}
						else {
							BDFDB.showToast(`Successfully deleted ${type} "${entry.origName}".`, {type:"success"});
							BDFDB.removeFromArray(container.entries, entry);
							entry.div.remove();
						}
					});
				}
			})
			.on("mouseenter." + this.getName(), (e) => {
				BDFDB.createTooltip("Delete File", e.currentTarget, {type:"top",selector:"repocontrols-trashicon-tooltip"});
			})
			.insertAfter(entry.div.querySelector(".ui-switch-wrapper"));
	}
	
	toggleAll (container, enable) {
		if (confirm(`Are you sure you want to ${enable ? "enable" : "disable"} everything?`)) {
			for (let header of container.querySelectorAll(".bda-header")) {
				if (header.querySelector(".bda-name").textContent.toLowerCase().indexOf(this.getName().toLowerCase()) != 0) {
					let switchwrap = header.querySelector(".ui-switch-wrapper");
					if (switchwrap) {
						let switchinner = switchwrap.querySelector(".ui-switch");
						let switchinput = switchwrap.querySelector(".ui-switch-checkbox");
						if (switchinner && switchinput) {
							if (switchinner.classList.contains("checked") && !enable) {
								switchinput.click();
							}
							else if (!switchinner.classList.contains("checked") && enable) {
								switchinput.click();
							}
						}
					}
				}
			}
		}
	}
	
	changeTextToHTML (container, searchstring) {
		if (!container || !container.tagName) return;
		if (typeof searchstring === "undefined") {
			var searchinput = document.querySelector(".repo-controls " + BDFDB.dotCN.searchbarinput);
			searchstring = searchinput ? searchinput.value : "";
		}
		container.querySelectorAll(".bda-name, .bda-version, .bda-author, .bda-description").forEach(ele => {
			if (ele.classList.contains("bda-description")) ele.style.display = "block";
			ele.innerHTML = BDFDB.highlightText(ele.innerText, searchstring);
		});
	}
	
	openSortPopout (e, markup, container, repoControls) {
		var wrapper = e.currentTarget;
		if (wrapper.classList.contains("popout-open")) return;
		wrapper.classList.add("popout-open");
		var value = $(wrapper).find(BDFDB.dotCN.quickselectvalue);
		var popout = $(markup);
		$(BDFDB.dotCN.popouts).append(popout)
			.off("click", BDFDB.dotCN.contextmenuitem)
			.on("click", BDFDB.dotCN.contextmenuitem, (e2) => {
				var option = $(e2.currentTarget).attr("option");
				value.text($(e2.currentTarget).text());
				value.attr("option", option);
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				BDFDB.saveData(popout.attr("option"), option, this, "sortings");
				this.addEntries(container, repoControls);
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			});
			
		popout
			.css("left", $(wrapper).offset().left + $(wrapper).outerWidth() + "px")
			.css("top", $(wrapper).offset().top + value.outerHeight() + "px")
			.find(BDFDB.dotCN.contextmenu).addClass(BDFDB.getDiscordTheme());
			
		$(document).on("mousedown.sortpopout" + this.getName(), (e2) => {
			if (popout.has(e2.target).length == 0) {
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			}
		});
	}
}