//META{"name":"PluginRepo"}*//

class PluginRepo {
	constructor () {
		this.settingsWindowObserver = new MutationObserver(() => {});
		this.innerSettingsWindowObserver = new MutationObserver(() => {});
		
		this.loading = false;
		
		this.loadedPlugins = {};
		
		this.pluginRepoButtonMarkup = 
			`<button class="bd-pfbtn bd-pluginrepobutton" style="left: 360px;">Plugin Repo</button>`;

		this.pluginEntryMarkup =
			`<li class="pluginEntry" style="position:relative;">
				<div class="bda-left">
					<span class="bda-name"></span>
					<div class="scrollerWrap-2uBjct scrollerThemed-19vinI">
						<div class="scroller-fzNley bda-description"></div>
					</div>
				</div>
				<div class="bda-right">
					<svg class="favStar" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px"><path fill="none" stroke="black" d="M 19.542, 9.092 c 0.393 -0.383, 0.532 -0.946, 0.362 -1.468 c -0.17 -0.523 -0.613 -0.896 -1.157 -0.975 l -4.837 -0.703 c -0.206 -0.03 -0.384 -0.159 -0.476 -0.346 L 11.273, 1.217 c -0.243 -0.492 -0.736 -0.798 -1.285 -0.798 c -0.549, 0 -1.042, 0.306 -1.284, 0.798 L 6.541, 5.6 c -0.092, 0.187 -0.27, 0.316 -0.476, 0.346 L 1.228, 6.649 c -0.544, 0.079 -0.987, 0.452 -1.157, 0.975 c -0.17, 0.523 -0.031, 1.085, 0.362, 1.468 l 3.5, 3.411 c 0.149, 0.146, 0.218, 0.355, 0.182, 0.56 L 3.29, 17.88 c -0.073, 0.424, 0.038, 0.836, 0.312, 1.162 c 0.426, 0.507, 1.171, 0.661, 1.766, 0.348 l 4.326 -2.274 c 0.181 -0.095, 0.408 -0.094, 0.589, 0 l 4.326, 2.274 c 0.21, 0.111, 0.435, 0.167, 0.666, 0.167 c 0.423, 0, 0.824 -0.188, 1.099 -0.515 c 0.275 -0.325, 0.386 -0.738, 0.312 -1.162 l -0.826 -4.817 c -0.035 -0.205, 0.033 -0.414, 0.182 -0.56 L 19.542, 9.092 z"/></svg>
					<button type="button" class="btn-download buttonBrandFilledDefault-2Rs6u5 buttonFilledDefault-AELjWf buttonDefault-2OLW-v button-2t3of8 buttonFilled-29g7b5 buttonBrandFilled-3Mv0Ra mediumGrow-uovsMu">
						<div class="contentsDefault-nt2Ym5 contents-4L4hQM contentsFilled-3M8HCx contents-4L4hQM">Download</div>
					</button>
				</div>
			</li>`;
			
		this.pluginRepoModalMarkup =
			`<span class="pluginrepo-modal recent-mentions-popout DevilBro-modal">
				<div class="backdrop-2ohBEd"></div>
				<div class="modal-2LIEKY">
					<div class="inner-1_1f7b">
						<div class="modal-3HOjGZ sizeMedium-1-2BNS">
							<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
								<div class="flexChild-1KGW5q" style="flex: 1 1 auto;">
									<h4 class="h4-2IXpeI title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 defaultMarginh4-jAopYe marginReset-3hwONl pluginAmount">Plugin Repository</h4>
									<div class="guildName-1u0hy7 small-3-03j1 size12-1IGJl9 height16-1qXrGy primary-2giqSn"></div>
								</div>
								<svg class="btn-cancel close-3ejNTg flexChild-1KGW5q" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 12 12">
									<g fill="none" fill-rule="evenodd">
										<path d="M0 0h12v12H0"></path>
										<path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path>
									</g>
								</svg>
							</div>
							<div class="header inner-tqJwAU">
								<div class="header-tab-bar-wrapper" style="margin-top:0;">
									<div class="tab-bar TOP">
										<div tab="plugins" class="tab-bar-item selected">Plugins</div>
										<div tab="settings" class="tab-bar-item">Settings</div>
									</div>
									<div class="mention-filter sort-filter">
										<div class="label">Sort by:</div>
										<div option="Name" class="value" style="text-transform:none;">Name</div>
									</div>
									<div class="mention-filter order-filter">
										<div class="label">Order:</div>
										<div option="asc" class="value" style="text-transform:none;">Ascending</div>
									</div>
								</div>
							</div>
							<div tab="plugins" class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW tab-content">
								<div class="scroller-fzNley inner-tqJwAU ui-standard-sidebar-view">
									<ul class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO bda-slist plugins" style="flex: 1 1 auto;"></ul>
								</div>
							</div>
							<div tab="settings" class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO inner-tqJwAU tab-content" style="flex: 1 1 auto;">
								<div></div>
							</div>
						</div>
					</div>
				</div>
			</span>`;
			
		this.sortPopoutMarkup =
			`<div class="popout popout-bottom-right no-shadow pluginrepo-sort-popout" style="position: fixed; z-index: 1100; visibility: visible; transform: translateX(-100%) translateY(0%) translateZ(0px);">
				<div>
					<div class="context-menu recent-mentions-filter-popout">
						<div class="item-group">
							<div option="Name" class="item">Name</div>
							<div option="Author" class="item">Author</div>
							<div option="Version" class="item">Version</div>
							<div option="State" class="item">Update Status</div>
							<div option="Fav" class="item">Favorites</div>
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
			.pluginrepo-modal {
				position: relative !important;
				z-index: 3500 !important;
			}
			.pluginrepo-modal .inner-1_1f7b {
				min-height: 100%;
			}
			.pluginrepo-modal .favStar {
				position: absolute;
				right: 10px;
				top: 11px;
			}
			.pluginrepo-modal .favStar path {
				stroke: yellow;
				fill: none;
			}
			.pluginrepo-modal .favStar.favorized path {
				stroke: yellow;
				fill: yellow;
			}
			.pluginrepo-modal .btn-download {
				position: absolute;
				right: 5px; 
				bottom: 10px;
			}
			.pluginrepo-modal .pluginEntry.outdated .btn-download {
				background-color: rgb(240, 71, 71) !important;
			}
			.pluginrepo-modal .pluginEntry.updated .btn-download {
				background-color: rgb(67, 181, 129) !important;
			}`;
	}

	getName () {return "PluginRepo";}

	getDescription () {return "Allows you to preview all plugins from the pluginrepo and download them on the fly. Repo button is in the plugin settings.";}

	getVersion () {return "1.0.1";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
		}
	}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
			
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
			this.settingsWindowObserver.observe(document.querySelector(".layers"), {childList:true});
			
			this.innerSettingsWindowObserver =  new MutationObserver((changes2, _) => {
				changes2.forEach(
					(change2, j) => {
						if (change2.addedNodes) {
							change2.addedNodes.forEach((node2) => {
								if (node2 && node2.tagName && node2.querySelector(".bd-pfbtn") && node2.querySelector("h2") && node2.querySelector("h2").innerText.toLowerCase() === "plugins") {
									this.addPluginRepoButton(node2);
								}
							});
						}
					}
				);
			});
			if (document.querySelector(".layer[layer-id='user-settings']")) this.innerSettingsWindowObserver.observe(document.querySelector(".layer[layer-id='user-settings']"), {childList:true, subtree:true});
			
			var bdbutton = document.querySelector(".bd-pfbtn");
			if (bdbutton && bdbutton.parentElement.querySelector("h2") && bdbutton.parentElement.querySelector("h2").innerText.toLowerCase() === "plugins") {
				this.addPluginRepoButton(bdbutton.parentElement);
			}
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.loadPlugins();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
			
			this.settingsWindowObserver.disconnect();
			this.innerSettingsWindowObserver.disconnect();
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
			
			$(".pluginrepo-modal, .bd-pluginrepobutton, webview[webview-PluginRepo]").remove();
		}
	}

	
	// begin of own functions
	
	addPluginRepoButton (container) {
		if (container && !container.querySelector(".bd-pluginrepobutton")) {
			$(this.pluginRepoButtonMarkup)
				.insertAfter(container.querySelector(".bd-pfbtn"))
				.on("click", () => {
					if (!this.loading) this.openPluginRepoModal(); 
					else BDfunctionsDevilBro.showToast(`Plugins are still being fetched. Try again in some seconds.`, {type:"danger"});
				})
				.on("mouseenter", (e) => {
					BDfunctionsDevilBro.createTooltip("Open Plugin Repo", e.currentTarget, {type:"right",selector:"pluginrepo-button-tooltip"});
				});
		}
	}
	
	openPluginRepoModal () {
		var pluginRepoModal = $(this.pluginRepoModalMarkup);
		pluginRepoModal.find(".pluginAmount").text(pluginRepoModal.find(".pluginAmount").text() + " " + Object.keys(this.loadedPlugins).length + " Plugins");
		pluginRepoModal
			.on("click." + this.getName(), ".sort-filter", (e) => {
				this.openSortPopout(e, this.sortPopoutMarkup, pluginRepoModal);
			})
			.on("click." + this.getName(), ".order-filter", (e) => {
				this.openSortPopout(e, this.orderPopoutMarkup, pluginRepoModal);
			})
			.on("click." + this.getName(), ".tab-bar-item[tab=plugins]", (e) => {
				this.addPluginEntries(pluginRepoModal);
			});
			
		this.addPluginEntries(pluginRepoModal);
			
		BDfunctionsDevilBro.appendModal(pluginRepoModal);
	}
	
	openSortPopout (e, markup, modal) {
		var wrapper = e.currentTarget;
		if (wrapper.classList.contains("popout-open")) return;
		wrapper.classList.add("popout-open");
		var value = $(wrapper).find(".value");
		var popout = $(markup);
		$(wrapper).append(popout)
			.off("click", ".item")
			.on("click", ".item", (e2) => {
				value.text($(e2.currentTarget).text());
				value.attr("option", $(e2.currentTarget).attr("option"));
				$(document).off("mousedown.sortpopout" + this.getName());
				popout.remove();
				this.addPluginEntries(modal);
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
	
	addPluginEntries (modal) {
		modal.find(".pluginEntry").remove();
		var favorites = BDfunctionsDevilBro.loadAllData(this.getName(), "favorites");
		var plugins = [];
		for (var url in this.loadedPlugins) {
			this.loadedPlugins[url].getFav = favorites[url] ? 0 : 1;
			var installedPlugin = BdApi.getPlugin(this.loadedPlugins[url].getName);
			if (installedPlugin) {
				if (installedPlugin.getVersion() != this.loadedPlugins[url].getVersion) {
					this.loadedPlugins[url].getState = 1;
				}
				else {
					this.loadedPlugins[url].getState = 0;
				}
			}
			else {
				this.loadedPlugins[url].getState = 2;
			}
			plugins.push(this.loadedPlugins[url]);
		}
		plugins = BDfunctionsDevilBro.sortArrayByKey(plugins, "get" + modal.find(".sort-filter .value").attr("option"));
		if (modal.find(".order-filter .value").attr("option") == "desc") plugins.reverse();
		for (let plugin of plugins) {
			let entry = $(this.pluginEntryMarkup);
			modal.find(".plugins").append(entry);
			entry.find(".bda-name").html(plugin.getName + " v" + plugin.getVersion + " by " + plugin.getAuthor);
			entry.find(".bda-description").html(plugin.getDescription ? plugin.getDescription : "No Description found.");
			if (plugin.getState != 2) {
				if (plugin.getState == 1) {
					entry.addClass("outdated")
						.find(".btn-download div").text("Outdated");
				}
				else {
					entry.addClass("updated")
						.find(".btn-download div").text("Updated");
				}
			}
			if (plugin.getFav == 0) entry.find(".favStar")[0].classList.add("favorized");
			entry
				.on("click." + this.getName(), ".favStar", (e) => {
					e.currentTarget.classList.toggle("favorized");
					if (e.currentTarget.classList.contains("favorized")) favorites[plugin.url] = true;
					else delete favorites[plugin.url];
					BDfunctionsDevilBro.saveAllData(favorites, this.getName(), "favorites");
				})
				.on("click." + this.getName(), ".btn-download", () => {
					this.downloadPlugin(plugin);
					entry.removeClass("outdated").addClass("updated")
						.find(".btn-download div").text("Updated");
				});
		}
	}
	
	loadPlugins () {
		var i = 0;
		var grabbedPlugins = [];
		var tags = ["getName", "getVersion", "getAuthor", "getDescription"];
		var seps = ["\"", "\'", "\`"];
		let request = require("request");
		request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/PluginRepo/res/PluginList.txt", (error, response, result) => {
			if (response) {
				grabbedPlugins = result.split("\n");
				this.loading = true;
				createWebview().then((webview) => {
					getPluginInfo(webview, this.loadedPlugins, () => {
						this.loading = false;
						webview.remove();
						if (document.querySelector(".bd-pluginrepobutton")) BDfunctionsDevilBro.showToast(`Finished fetching Plugins.`, {type:"success"});
					});
				});
			}
		});
		
		function getPluginInfo (webview, loadedPlugins, callback) {
			if (i >= grabbedPlugins.length) {
				callback();
				return;
			}
			let url = grabbedPlugins[i].replace(new RegExp("[\\r|\\n|\\t]", "g"), "");
			request(url, (error, response, body) => {
				if (response) {
					let plugin = {};
					let valid = true;
					for (let tag of tags) {
						let reg = new RegExp(tag + "[\\s|\\t|\\n|\\r|=|>|function|\(|\)|\{|return]*([\"|\'|\`]).*?\\1","gi");
						let temp = reg.exec(body);
						if (temp) {
							temp = temp[0];
							let foundIndex = temp.length;
							let foundSep = null;
							for (let sep of seps) {
								let index = temp.indexOf(sep);
								if (index > -1 && index < foundIndex) {
									foundIndex = index;
									foundSep = sep;
								}
							}
							if (foundSep) {
								temp = temp.split(foundSep);
								if (temp.length > 2) {
									plugin[tag] = tag != "getVersion" ? temp[1].charAt(0).toUpperCase() + temp[1].slice(1) : temp[1];
								}
							}
						}
					}
					for (let tag of tags) {
						if (!plugin[tag]) valid = false;
					}
					if (valid) {
						plugin.url = url;
						loadedPlugins[url] = plugin;
					}
					else {
						console.log(url);
						let name = body.replace(new RegExp("\\s*\:\\s*", "g"), ":").split('"name":"');
						if (name.length > 1) {
							name = name[1].split('"')[0];
							webview.getWebContents().executeJavaScript(body).then(() => {
								webview.getWebContents().executeJavaScript(`
									var p = new ` + name + `(); 
									var data = {
										"getName":p.getName(),
										"getAuthor":p.getAuthor(),
										"getVersion":p.getVersion(),
										"getDescription":p.getDescription()
									}; 
									Promise.resolve(data);`
								).then((plugin) => {
									console.log(url);
									plugin.url = url;
									loadedPlugins[url] = plugin;
								});
							});
						}
					}
				}
				i++;
				getPluginInfo(webview, loadedPlugins, callback);
			});
		}
		
		function createWebview () {
			return new Promise(function(callback) {
				var webview;
				webview = document.createElement("webview");
				webview.src = "non-existent.dummy";
				webview.setAttribute("webview-PluginRepo", null);
				webview.addEventListener("dom-ready", function() {
					callback(webview);
				});
				document.body.appendChild(webview);
			});
		}
	}
	
	downloadPlugin (plugin) {
		let request = require("request");
		request(plugin.url, (error, response, body) => {
			if (error) {
				BDfunctionsDevilBro.showToast(`Unable to download Plugin "${plugin.getName}".`, {type:"danger"});
			}
			else {
				let filename = plugin.url.split("/");
				this.createPluginFile(filename[filename.length - 1], body);
			}
		});
	}
	
	createPluginFile (filename, content) {
		let fileSystem = require("fs");
		let path = require("path");
		var file = path.join(BDfunctionsDevilBro.getPluginsFolder(), filename);
		fileSystem.writeFile(file, content, (error) => {
			if (error) {
				BDfunctionsDevilBro.showToast(`Unable to save Plugin "${filename}".`, {type:"danger"});
			}
			else {
				BDfunctionsDevilBro.showToast(`Successfully saved Plugin "${filename}".`, {type:"success"});
			}
		});
	}
}
