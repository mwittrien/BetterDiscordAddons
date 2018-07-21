//META{"name":"OldTitleBar"}*//

class OldTitleBar {
	initConstructor () {
		this.css = `
			${BDFDB.dotCN.titlebar}.hidden-by-OTB {
				display: none;
			}
			
			${BDFDB.dotCN.titlebar}.hidden-by-OTB + ${BDFDB.dotCN.app} .splashBackground-1FRCko:before {
				display: none;
			}
			
			${BDFDB.dotCN.channelheadertitletext},
			${BDFDB.dotCN.channelheadertopic},
			${BDFDB.dotCN.contextmenu} * {
				-webkit-app-region: no-drag;
			}
			
			.settings-titlebar-OTB {
				position: relative;
				z-index: 1000;
				text-align: right;
				padding: 10px;
				-webkit-app-region: drag;
			}`;
			
		this.dividerMarkup = `<div class="dividerOTB ${BDFDB.disCN.channelheaderdivider}"></div>`;
			
		this.reloadButtonMarkup = 
			`<span class="${BDFDB.disCN.channelheadericonmargin} reloadButtonOTB">
				<svg class="${BDFDB.disCNS.channelheadericoninactive + BDFDB.disCN.channelheadericon}" xmlns="http://www.w3.org/2000/svg">
					<g fill="none" class="${BDFDB.disCN.channelheadericonforeground}" fill-rule="evenodd">
						<path fill="currentColor" transform="translate(4,4)" d="M17.061,7.467V0l-2.507,2.507C13.013,0.96,10.885,0,8.528,0C3.813,0,0.005,3.819,0.005,8.533s3.808,8.533,8.523,8.533c3.973,0,7.301-2.72,8.245-6.4h-2.219c-0.88,2.485-3.237,4.267-6.027,4.267c-3.536,0-6.4-2.864-6.4-6.4s2.864-6.4,6.4-6.4c1.765,0,3.349,0.736,4.507,1.893l-3.44,3.44H17.061z"/>
					</g>
				</svg>
			</span>`;
			
		this.minButtonMarkup = 
			`<span class="${BDFDB.disCN.channelheadericonmargin} minButtonOTB">
				<svg class="${BDFDB.disCNS.channelheadericoninactive + BDFDB.disCN.channelheadericon}" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
					<g fill="none" class="${BDFDB.disCN.channelheadericonforeground}" fill-rule="evenodd">
						<path stroke-width="2" stroke="currentColor" d="M6 18 l13 0"/>
					</g>
				</svg>
			</span>`;
			
		this.maxButtonIsMaxMarkup = 
			`<span class="${BDFDB.disCN.channelheadericonmargin} maxButtonOTB">
				<svg class="${BDFDB.disCNS.channelheadericoninactive + BDFDB.disCN.channelheadericon}" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
					<g fill="none" class="${BDFDB.disCN.channelheadericonforeground}" fill-rule="evenodd">
						<path stroke-width="2" stroke="currentColor" d="M6 9 l10 0 l0 10 l-10 0 l0 -10 m3 -3 l10 0 l0 10"/>
					</g>
				</svg>
			</span>`;
			
		this.maxButtonIsMinMarkup = 
			`<span class="${BDFDB.disCN.channelheadericonmargin} maxButtonOTB">
				<svg class="${BDFDB.disCNS.channelheadericoninactive + BDFDB.disCN.channelheadericon}" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
					<g fill="none" class="${BDFDB.disCN.channelheadericonforeground}" fill-rule="evenodd">
						<path stroke-width="2" stroke="currentColor" d="M6 6 l13 0 l0 13 l-13 0 l0 -13"/>
					</g>
				</svg>
			</span>`;
			
		this.closeButtonMarkup = 
			`<span class="${BDFDB.disCN.channelheadericonmargin} closeButtonOTB">
				<svg class="${BDFDB.disCNS.channelheadericoninactive + BDFDB.disCN.channelheadericon}" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
					<g fill="none" class="${BDFDB.disCN.channelheadericonforeground}" fill-rule="evenodd">
						<path stroke-width="2" stroke="currentColor" d="M6 6 l13 13 m0 -13 l-13 13"/>
					</g>
				</svg>
			</span>`;
			
		this.defaults = {
			settings: {
				addToSettings:		{value:true, 	description:"Add a Title Bar to Settings Windows."},
				reloadButton:		{value:false, 	description:"Add a Reload Button to the Title Bar."}
			}
		};
	}

	getName () {return "OldTitleBar";}

	getDescription () {return "Reverts the title bar back to its former self.";}

	getVersion () {return "1.3.7";}

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
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								setImmediate(() => {
									if (node && node.tagName && node.classList.contains(BDFDB.disCN.loginscreen)) {
										this.addSettingsTitleBar(node);
									}
								});
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.app, {name:"loginScreenObserver",instance:observer}, {childList:true});

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								setImmediate(() => {
									if (node && node.tagName && node.getAttribute("layer-id") || node.querySelector(".ui-standard-sidebar-view")) {
										$(BDFDB.dotCN.channelheaderdivider).parent().has(BDFDB.dotCN.channelheadericoninactive).parent().css("-webkit-app-region", "initial");
										if (BDFDB.getData("addToSettings", this, "settings")) this.addSettingsTitleBar(node);
									}
								});
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && node.tagName && node.getAttribute("layer-id") || node.querySelector(".ui-standard-sidebar-view")) {
									this.removeTitleBar();
									this.addTitleBar();
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.layers, {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			$(window).on("resize." + this.getName(), (e) => {
				this.changeMaximizeButton();
			});
						
			this.addTitleBar();
		
			$(BDFDB.dotCN.titlebar).addClass("hidden-by-OTB");
			
			var settingswindow = document.querySelector(BDFDB.dotCN.layers + "[layer-id]");
			if (settingswindow && BDFDB.getData("addToSettings", this, "settings")) {
				this.addSettingsTitleBar(settingswindow);
			}
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDFDB === "object") {
			this.removeTitleBar();
		
			$(".hidden-by-OTB").removeClass("hidden-by-OTB");
			
			BDFDB.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDFDB === "object") {
			setImmediate(() => {this.addTitleBar();});
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
	
	addTitleBar () {
		this.removeTitleBar();
		var settings = BDFDB.getAllData(this, "settings");
		let activityfeed = document.querySelector(BDFDB.dotCN.activityfeed), container;
		if (activityfeed) {
			container = $(`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.flex2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifyend + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.channelheaderheaderbar} headerbarOTB" style="flex: 0 0 auto;"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.flex2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}" style="flex: 0 0 auto;"></div></div>`);
			container.insertBefore(activityfeed.firstElementChild);
			container = container.children().first();
		}
		container = container ? container : $(BDFDB.dotCN.channelheaderdivider).parent().has(BDFDB.dotCN.channelheadericoninactive);
		if (settings.reloadButton) {
			container
				.append(this.dividerMarkup)
				.append(this.reloadButtonMarkup)
				.on("click." + this.getName(), ".reloadButtonOTB", () => {
					this.doReload();
				})
				.on("mouseenter." + this.getName(), ".reloadButtonOTB", (e) => {
					this.createReloadToolTip(e);
				});
		}
		container
			.append(this.dividerMarkup)
			.append(this.minButtonMarkup)
			.append(require("electron").remote.getCurrentWindow().isMaximized() ? this.maxButtonIsMaxMarkup : this.maxButtonIsMinMarkup)
			.append(this.closeButtonMarkup)
			.on("click." + this.getName(), ".minButtonOTB", () => {
				this.doMinimize();
			})
			.on("click." + this.getName(), ".maxButtonOTB", () => {
				this.doMaximize();
			})
			.on("click." + this.getName(), ".closeButtonOTB", () => {
				this.doClose();
			})
			.parent().css("-webkit-app-region", "drag");
	}
	
	addSettingsTitleBar (settingspane) {
		if (!settingspane.querySelector(".dividerOTB, .reloadButtonOTB, .minButtonOTB, .maxButtonOTB, .closeButtonOTB")) {
			var settingsbar = $(`<div class="settings-titlebar-OTB"></div>`);
			var settings = BDFDB.getAllData(this, "settings");
			if (settings.reloadButton) {
				settingsbar
					.append(this.reloadButtonMarkup)
					.on("click." + this.getName(), ".reloadButtonOTB", () => {
						this.doReload();
					})
					.on("mouseenter." + this.getName(), ".reloadButtonOTB", (e) => {
						this.createReloadToolTip(e);
					});
			}
			settingsbar
				.append(this.minButtonMarkup)
				.append(require("electron").remote.getCurrentWindow().isMaximized() ? this.maxButtonIsMaxMarkup : this.maxButtonIsMinMarkup)
				.append(this.closeButtonMarkup)
				.on("click." + this.getName(), ".minButtonOTB", () => {
					this.doMinimize();
				})
				.on("click." + this.getName(), ".maxButtonOTB", () => {
					this.doMaximize();
				})
				.on("click." + this.getName(), ".closeButtonOTB", () => {
					this.doClose();
				});
				
			$(settingspane).append(settingsbar);
		}
	}
	
	doReload () {
		require("electron").remote.getCurrentWindow().reload();
	}
	
	doMinimize () {
		require("electron").remote.getCurrentWindow().minimize();
	}
	
	doMaximize () {
		if (require("electron").remote.getCurrentWindow().isMaximized()) require("electron").remote.getCurrentWindow().unmaximize();
		else require("electron").remote.getCurrentWindow().maximize();
	}
	
	doClose () {
		require("electron").remote.getCurrentWindow().close();
	}
	
	changeMaximizeButton () {
		var maxButtonHTML = require("electron").remote.getCurrentWindow().isMaximized() ? this.maxButtonIsMaxMarkup : this.maxButtonIsMinMarkup;
		document.querySelectorAll(".maxButtonOTB").forEach(maxButton => {
			maxButton.outerHTML = maxButtonHTML;
		});
	}
	
	removeTitleBar () {
		$(".headerbarOTB").remove();
		
		$(BDFDB.dotCN.channelheaderdivider).parent().has(BDFDB.dotCN.channelheadericoninactive)
			.off("click." + this.getName())
			.off("mouseenter." + this.getName())
			.find(".dividerOTB, .reloadButtonOTB, .minButtonOTB, .maxButtonOTB, .closeButtonOTB").remove();
			
		$(BDFDB.dotCN.channelheaderdivider).parent().has(BDFDB.dotCN.channelheadericoninactive).parent().css("-webkit-app-region", "initial");
	}
	
	createReloadToolTip (e) {
		BDFDB.createTooltip("Reload", e.currentTarget, {type:"bottom",selector:"reload-button-tooltip"});
	}
}
