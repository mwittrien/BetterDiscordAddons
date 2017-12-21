//META{"name":"RepoControls"}*//

class RepoControls {
	constructor () {
		this.settingsWindowObserver = new MutationObserver(() => {});
		this.innerSettingsWindowObserver = new MutationObserver(() => {});
		
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
			`<div class="popout popout-bottom-right no-shadow pluginrepo-sort-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="context-menu recent-mentions-filter-popout">
						<div class="item-group">
							<div option="name" class="item">Name</div>
							<div option="author" class="item">Author</div>
							<div option="version" class="item">Version</div>
							<div option="description" class="item">Description</div>
						</div>
					</div>
				</div>
			</div>`;
			
		this.orderPopoutMarkup =
			`<div class="popout popout-bottom-right no-shadow pluginrepo-order-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="context-menu recent-mentions-filter-popout">
						<div class="item-group">
							<div option="asc" class="item">Ascending</div>
							<div option="desc" class="item">Descending</div>
						</div>
					</div>
				</div>
			</div>`;
		
		this.css = `
			.repo-controls .header {
				overflow: visible !important;
			}
			.repo-controls .searchWrapper {
				margin-top: -5px !important;
			}
			.repo-controls .searchWrapper #input-search {
				padding: 1px 8px !important;
			}`;
	}

	getName () {return "RepoControls";}

	getDescription () {return "Lets you sort and filter your list of downloaded Themes and Plugins.";}

	getVersion () {return "1.0.1";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
		}
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
			
			this.settingsWindowObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.getAttribute("layer-id") == "user-settings") {
									this.innerSettingsWindowObserver.observe(node, {childList:true, subtree:true});
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".layers")) this.settingsWindowObserver.observe(document.querySelector(".layers"), {childList:true});
			
			this.innerSettingsWindowObserver = new MutationObserver((changes2, _) => {
				changes2.forEach(
					(change2, j) => {
						if (change2.addedNodes) {
							change2.addedNodes.forEach((node2) => {
								if (node2 && node2.tagName && node2.querySelector(".bd-pfbtn")) {
									this.addControls(node2.querySelector(".bda-slist"));
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".layer[layer-id='user-settings']")) this.innerSettingsWindowObserver.observe(document.querySelector(".layer[layer-id='user-settings']"), {childList:true, subtree:true});
			
			if (document.querySelector(".bd-pfbtn")) {
				this.addControls(document.querySelector(".bda-slist"));
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
			
			$(".repo-controls").remove();
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
		}
	}

	
	// begin of own functions
	
	addControls (container) {
		if (document.querySelector(".repo-controls")) return;
		
		var repoControls = $(this.repoControlsMarkup);
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
		var zacksFork = container.querySelector(".bda-author")
		for (let li of container.querySelectorAll("li")) {
			let name, version, author, description;
			if (zacksFork) {
				name = li.querySelector(".bda-name").textContent;
				version = li.querySelector(".bda-version").textContent;
				author = li.querySelector(".bda-author").textContent;
				description = li.querySelector(".bda-description").textContent;
			}
			else {
				let namestring = li.querySelector(".bda-name").textContent;
				name = namestring.split(" v")[0];
				version = namestring.split(" v")[1].split(" by ")[0];
				author = namestring.split(" by ")[1];
				description = li.querySelector(".bda-description").textContent;
			}
			let entry = {
				div: 			li,
				search:			(name + " " + version + " " + author + " " + description).toUpperCase(),
				name: 			name,
				version: 		version,
				author: 		author,
				description: 	description
			};
			container.entries.push(entry);
		}
		
		this.addEntries(container, repoControls);
	}
	
	addEntries (container, repoControls) {
		$(container).find("li").remove();
		
		var searchstring = repoControls.find("#input-search").val().replace(/[<|>]/g, "").toUpperCase();
		
		var entries = container.entries;
		entries = entries.filter((entry) => {return entry.search.indexOf(searchstring) > -1 ? entry : null;});
		entries = BDfunctionsDevilBro.sortArrayByKey(entries, repoControls.find(".sort-filter .value").attr("option"));
		if (repoControls.find(".order-filter .value").attr("option") == "desc") entries.reverse();
		
		for (let entry of entries) $(container).append(entry.div);
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
				value.text($(e2.currentTarget).text());
				value.attr("option", $(e2.currentTarget).attr("option"));
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
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
