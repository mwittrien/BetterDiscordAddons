//META{"name":"RepoControls"}*//

class RepoControls {
	constructor () {
		this.settingsWindowObserver = new MutationObserver(() => {});
		this.innerSettingsWindowObserver = new MutationObserver(() => {});
		
		this.sortings = {
			sort: {
				name:			"Name",
				author:			"Author",
				version:		"Version",
				description:	"Description",
				enabled:		"Enabled"
			},
			order: {
				asc:			"Ascending",
				desc:			"Descending"
			}
		};
		
		this.repoControlsMarkup = 
			`<div class="repo-controls recent-mentions-popout">
				<div class="header flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;">
					<div class="inputWrapper-3xoRWR vertical-3X17r5 directionColumn-2h-LPR searchWrapper" style="flex: 1 1 50%;">
						<input type="text" class="input-2YozMi size16-3IvaX_" id="input-search" placeholder="Search for...">
					</div>
					<div class="mention-filter sort-filter" style="flex: 1 1 25%;">
						<div class="label">Sort by:</div>
						<div option="name" class="value" style="text-transform:none;">Name</div>
					</div>
					<div class="mention-filter order-filter" style="flex: 1 1 25%;">
						<div class="label">Order:</div>
						<div option="asc" class="value" style="text-transform:none;">Ascending</div>
					</div>
				</div>
			</div>`;
			
		this.sortPopoutMarkup =
			`<div class="popout popout-bottom-right no-shadow repocontrols-sort-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);" option="sort">
				<div>
					<div class="context-menu contextMenu-uoJTbz recent-mentions-filter-popout">
						<div class="item-group itemGroup-oViAgA">
							${Object.keys(this.sortings.sort).map((key, i) => `<div option="${key}" class="item item-1XYaYf">${this.sortings.sort[key]}</div>`).join("")}
						</div>
					</div>
				</div>
			</div>`;
			
		this.orderPopoutMarkup =
			`<div class="popout popout-bottom-right no-shadow repocontrols-order-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);" option="order">
				<div>
					<div class="context-menu contextMenu-uoJTbz recent-mentions-filter-popout">
						<div class="item-group itemGroup-oViAgA">
							${Object.keys(this.sortings.order).map((key, i) => `<div option="${key}" class="item item-1XYaYf">${this.sortings.order[key]}</div>`).join("")}
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
			#bd-settingspane-container .bda-right .ui-switch-wrapper {
				right: 0;
			}
			#bd-settingspane-container .bda-right button {
				position: absolute;
				right: 0;
				top: 30px;
			}
			#bd-settingspane-container .bda-right,
			#bd-settingspane-container .bda-header {
				position: relative;
			}
			#bd-settingspane-container .trashIcon {
				display: none;
			}
			#bd-settingspane-container .bda-right .trashIcon,
			#bd-settingspane-container .bda-header .trashIcon {
				cursor: pointer;
				display: block;
				position: absolute;
				right: 50px;
			}
			#bd-settingspane-container .bda-right .trashIcon {
				top: 7px;
			}
			.repo-controls .header {
				overflow: visible !important;
			}
			.repo-controls .searchWrapper {
				margin-top: -5px !important;
			}
			.repo-controls .searchWrapper #input-search {
				padding: 1px 8px !important;
			}`;
			
		this.defaults = {
			settings: {
				addDeleteButton:	{value:true, 	description:"Add a Delete Button to your Plugin and Theme List."},
				confirmDelete:		{value:true, 	description:"Ask for your confirmation before deleting a File."},
				enableHTML:			{value:true, 	description:"Correctly displays HTML descriptions for Plugins and Themes."}
			},
			sortings: {
				sort:		{value:"name"},
				order:		{value:"asc"}
			}
		};
	}

	getName () {return "RepoControls";}

	getDescription () {return "Lets you sort and filter your list of downloaded Themes and Plugins.";}

	getVersion () {return "1.1.0";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settings = BDfunctionsDevilBro.getAllData(this, "settings");
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU ${settings[key] ? "valueChecked-3Bzkbm" : "valueUnchecked-XR6AOk"}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];
		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);});
			
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append('<script src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"></script>');
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			var observertarget = null;

			this.settingsWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								setImmediate(() => {
									if (node && node.tagName && node.getAttribute("layer-id") == "user-settings") {
										if (this.getSettingsPageType(node)) this.addControls(node.querySelector(".bda-slist"));
										this.innerSettingsWindowObserver.observe(node, {childList:true, subtree:true});
									}
								});
							});
						}
					}
				);
			});
			if (observertarget = document.querySelector(".layers, .layers-20RVFW")) this.settingsWindowObserver.observe(observertarget, {childList:true});
			
			this.innerSettingsWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, j) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (this.getSettingsPageType(node)) this.addControls(node.querySelector(".bda-slist"));
								if (node && node.tagName && node.querySelector(".ui-switch") && this.getSettingsPageType()) {
									var entry = this.getEntry($("li").has(node)[0]);
									if (entry) {
										var settings = BDfunctionsDevilBro.getAllData(this, "settings");
										if (settings.addDeleteButton) 	this.addDeleteButton(entry);
										if (settings.enableHTML) 		this.changeTextToHTML(entry.div);
									}
								}
							});
						}
					}
				);
			});
			
			var settingswindow = document.querySelector(".layer[layer-id='user-settings'], .layer-kosS71[layer-id='user-settings']");
			if (settingswindow) {
				this.innerSettingsWindowObserver.observe(settingswindow, {childList:true, subtree:true});
				if (this.getSettingsPageType(settingswindow)) this.addControls(settingswindow.querySelector(".bda-slist"));
			}
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.unloadMessage(this);
			
			this.settingsWindowObserver.disconnect();
			this.innerSettingsWindowObserver.disconnect();
			
			$(".repo-controls, #bd-settingspane-container .trashIcon").remove();
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
		}
	}

	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(".checkbox-1KYsPm")) {
			settings[input.value] = input.checked;
			input.parentElement.classList.toggle("valueChecked-3Bzkbm", input.checked);
			input.parentElement.classList.toggle("valueUnchecked-XR6AOk", !input.checked);
		}
		BDfunctionsDevilBro.saveAllData(settings, this, "settings");
	}
	
	getSettingsPageType (container) {
		if (typeof container === "undefined") container = document.querySelector(".layer[layer-id='user-settings'], .layer-kosS71[layer-id='user-settings']");
		if (container && container.tagName) {
			var folderbutton = container.querySelector(".bd-pfbtn");
			if (folderbutton) {
				var buttonbar = folderbutton.parentElement;
				if (buttonbar && buttonbar.tagName) {
					var header = buttonbar.querySelector("h2");
					if (header) {
						var headerText = header.innerText.toUpperCase();
						if (headerText === "PLUGINS" || headerText === "THEMES") {
							return headerText;
						}
					}
				}
			}
		}
		return null;
	}
	
	addControls (container) {
		if (!container || document.querySelector(".repo-controls")) return;
		
		var sortings = BDfunctionsDevilBro.getAllData(this, "sortings");
		
		var repoControls = $(this.repoControlsMarkup);
		repoControls.find(".sort-filter .value").attr("option", sortings.sort).text(this.sortings.sort[sortings.sort]);
		repoControls.find(".order-filter .value").attr("option", sortings.order).text(this.sortings.order[sortings.order]);
		repoControls
			.on("keyup." + this.getName(), "#input-search", (e) => {
				clearTimeout(repoControls.searchTimeout);
				repoControls.searchTimeout = setTimeout(() => {this.addEntries(container, repoControls);},1000);
			})
			.on("click." + this.getName(), ".sort-filter", (e) => {
				this.openSortPopout(e, this.sortPopoutMarkup, container, repoControls);
			})
			.on("click." + this.getName(), ".order-filter", (e) => {
				this.openSortPopout(e, this.orderPopoutMarkup, container, repoControls);
			})
			.insertBefore(container);
			
		container.entries = [];
		for (let li of container.querySelectorAll("li")) {
			container.entries.push(this.getEntry(li));
		}
		
		this.addEntries(container, repoControls);
	}
	
	getEntry (li) {
		if (!li || !li.tagName || !li.querySelector(".bda-name")) return null;
		let name, version, author, description, enabled;
		if (BDfunctionsDevilBro.zacksFork()) {
			name = li.querySelector(".bda-name").textContent;
			version = li.querySelector(".bda-version").textContent;
			author = li.querySelector(".bda-author").textContent;
			description = li.querySelector(".bda-description").textContent;
			enabled = li.querySelector(".ui-switch-checkbox").checked;
		}
		else {
			let namestring = li.querySelector(".bda-name").textContent;
			name = namestring.split(" v")[0];
			version = namestring.split(" v")[1].split(" by ")[0];
			author = namestring.split(" by ")[1];
			description = li.querySelector(".bda-description").textContent;
			enabled = li.querySelector(".ui-switch-checkbox").checked;
		}
		return {
			div: 			li,
			search:			(name + " " + version + " " + author + " " + description).toUpperCase(),
			origName: 		name,
			name: 			(name).toUpperCase(),
			version: 		(version).toUpperCase(),
			author: 		(author).toUpperCase(),
			description: 	(description).toUpperCase(),
			enabled:		enabled ? 0 : 1
		};
	}
	
	addEntries (container, repoControls) {
		$(container).find(".trashIcon, li").remove();
		
		var searchstring = repoControls.find("#input-search").val().replace(/[<|>]/g, "").toUpperCase();
		
		var entries = container.entries;
		var sortings = BDfunctionsDevilBro.getAllData(this, "sortings");
		entries = entries.filter((entry) => {return entry.search.indexOf(searchstring) > -1 ? entry : null;});
		entries = BDfunctionsDevilBro.sortArrayByKey(entries, sortings.sort);
		if (sortings.order == "desc") entries.reverse();
		
		var settings = BDfunctionsDevilBro.getAllData(this, "settings");
		for (let entry of entries) {
			container.appendChild(entry.div);
			if (settings.enableHTML) 		this.changeTextToHTML(entry.div);
			if (settings.addDeleteButton) 	this.addDeleteButton(entry);
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
				if (container && (!BDfunctionsDevilBro.getData("confirmDelete", this, "settings") || confirm("Are you sure you want to delete this File?"))) {
					var name = BdApi.getPlugin(entry.origName) ? BdApi.getPlugin(entry.origName).constructor.name : entry.origName;
					var type = null, folder = null, extension = null;
					switch (this.getSettingsPageType()) {
						case "PLUGINS":
							type = "Plugin";
							folder = BDfunctionsDevilBro.getPluginsFolder();
							extension = ".plugin.js";
							break;
						case "THEMES": 
							type = "Theme";
							folder = BDfunctionsDevilBro.getThemesFolder();
							extension = ".theme.css";
							break;
					}
					if (type && folder && extension) {
						let fileSystem = require("fs");
						let path = require("path");
						var file = path.join(folder, name + extension);
						fileSystem.unlink(file, (error) => {
							if (error) {
								BDfunctionsDevilBro.showToast(`Unable to delete ${type} "${name}". Filename might not be the same as ${type}name.`, {type:"danger"});
							}
							else {
								BDfunctionsDevilBro.showToast(`Successfully deleted ${type} "${name}".`, {type:"success"});
								BDfunctionsDevilBro.removeFromArray(container.entries, entry);
								entry.div.remove();
							}
						});
					}
				}
			})
			.on("mouseenter." + this.getName(), (e) => {
				BDfunctionsDevilBro.createTooltip("Delete File", e.currentTarget, {type:"top",selector:"repocontrols-trashicon-tooltip"});
			})
			.insertAfter(entry.div.querySelector(".ui-switch-wrapper"));
	}
	
	changeTextToHTML (container) {
		if (!container || !container.tagName) return;
		container.querySelectorAll(".bda-name, .bda-version, .bda-author, .bda-description").forEach(ele => {ele.innerHTML = ele.innerText;});
	}
	
	openSortPopout (e, markup, container, repoControls) {
		var wrapper = e.currentTarget;
		if (wrapper.classList.contains("popout-open")) return;
		wrapper.classList.add("popout-open");
		var value = $(wrapper).find(".value");
		var popout = $(markup);
		$(".popouts").append(popout)
			.off("click", ".item")
			.on("click", ".item", (e2) => {
				var option = $(e2.currentTarget).attr("option");
				value.text($(e2.currentTarget).text());
				value.attr("option", option);
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				BDfunctionsDevilBro.saveData(popout.attr("option"), option, this, "sortings");
				this.addEntries(container, repoControls);
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			});
			
		popout
			.css("left", $(wrapper).offset().left + $(wrapper).outerWidth() + "px")
			.css("top", $(wrapper).offset().top + value.outerHeight() + "px")
			.find(".context-menu").addClass(BDfunctionsDevilBro.getDiscordTheme());
			
		$(document).on("mousedown.sortpopout" + this.getName(), (e2) => {
			if (popout.has(e2.target).length == 0) {
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				setTimeout(() => {wrapper.classList.remove("popout-open");},300);
			}
		});
	}
}
