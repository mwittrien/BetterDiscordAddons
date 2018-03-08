//META{"name":"OldTitleBar"}*//

class OldTitleBar {
	constructor () {
		this.css = `
			.titleBar-3_fDwJ.hidden-by-OTB {
				display: none;
			}
			
			.topic-1KFf6J {
				-webkit-app-region: no-drag;
			}
			
			.settings-titlebar-OTB {
				position: relative;
				z-index: 1000;
				text-align: right;
				padding: 10px;
				-webkit-app-region: drag;
			}`;
			
		this.dividerMarkup = `<div class="dividerOTB divider-1GKkV3"></div>`;
			
		this.reloadButtonMarkup = 
			`<svg class="reloadButtonOTB iconInactive-WWHQEI icon-mr9wAc iconMargin-2Js7V9" xmlns="http://www.w3.org/2000/svg">
				<g fill="none" class="iconForeground-2c7s3m" fill-rule="evenodd">
					<path fill="currentColor" transform="translate(4,4)" d="M17.061,7.467V0l-2.507,2.507C13.013,0.96,10.885,0,8.528,0C3.813,0,0.005,3.819,0.005,8.533s3.808,8.533,8.523,8.533c3.973,0,7.301-2.72,8.245-6.4h-2.219c-0.88,2.485-3.237,4.267-6.027,4.267c-3.536,0-6.4-2.864-6.4-6.4s2.864-6.4,6.4-6.4c1.765,0,3.349,0.736,4.507,1.893l-3.44,3.44H17.061z"/>
				</g>
			</svg>`;
			
		this.minButtonMarkup = 
			`<svg class="minButtonOTB iconInactive-WWHQEI icon-mr9wAc iconMargin-2Js7V9" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
				<g fill="none" class="iconForeground-2c7s3m" fill-rule="evenodd">
					<path stroke-width="2" stroke="currentColor" d="M6 18 l13 0"/>
				</g>
			</svg>`;
			
		this.maxButtonIsMaxMarkup = 
			`<svg class="maxButtonOTB iconInactive-WWHQEI icon-mr9wAc iconMargin-2Js7V9" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
				<g fill="none" class="iconForeground-2c7s3m" fill-rule="evenodd">
					<path stroke-width="2" stroke="currentColor" d="M6 9 l10 0 l0 10 l-10 0 l0 -10 m3 -3 l10 0 l0 10"/>
				</g>
			</svg>`;
			
		this.maxButtonIsMinMarkup = 
			`<svg class="maxButtonOTB iconInactive-WWHQEI icon-mr9wAc iconMargin-2Js7V9" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
				<g fill="none" class="iconForeground-2c7s3m" fill-rule="evenodd">
					<path stroke-width="2" stroke="currentColor" d="M6 6 l13 0 l0 13 l-13 0 l0 -13"/>
				</g>
			</svg>`;
			
		this.closeButtonMarkup = 
			`<svg class="closeButtonOTB iconInactive-WWHQEI icon-mr9wAc iconMargin-2Js7V9" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
				<g fill="none" class="iconForeground-2c7s3m" fill-rule="evenodd">
					<path stroke-width="2" stroke="currentColor" d="M6 6 l13 13 m0 -13 l-13 13"/>
				</g>
			</svg>`;
			
		this.defaults = {
			settings: {
				addToSettings:		{value:true, 	description:"Add a Title Bar to Settings Windows."},
				reloadButton:		{value:false, 	description:"Add a Reload Button to the Title Bar."}
			}
		};
	}

	getName () {return "OldTitleBar";}

	getDescription () {return "Reverts the title bar back to its former self.";}

	getVersion () {return "1.3.2";}

	getAuthor () {return "DevilBro";}

	getSettingsPanel () {
		if (!this.started || typeof BDfunctionsDevilBro !== "object") return;
		var settings = BDfunctionsDevilBro.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div></div>`;
		
		var settingspanel = $(settingshtml)[0];

		BDfunctionsDevilBro.initElements(settingspanel);

		$(settingspanel)
			.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);});
			
		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDfunctionsDevilBro === "object") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								setImmediate(() => {
									if (node && node.tagName && node.getAttribute("layer-id") || node.querySelector(".ui-standard-sidebar-view")) {
										$(".divider-1GKkV3").parent().has(".iconInactive-WWHQEI").parent().css("-webkit-app-region", "initial");
										if (BDfunctionsDevilBro.getData("addToSettings", this, "settings")) this.addSettingsTitleBar(node);
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
			BDfunctionsDevilBro.addObserver(this, ".layers-20RVFW", {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			$(window).on("resize." + this.getName(), (e) => {
				this.changeMaximizeButton();
			});
						
			this.addTitleBar();
		
			$(".titleBar-3_fDwJ").addClass("hidden-by-OTB");
			
			var settingswindow = document.querySelector(".layer-kosS71[layer-id]");
			if (settingswindow && BDfunctionsDevilBro.getData("addToSettings", this, "settings")) {
				this.addSettingsTitleBar(settingswindow);
			}
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			$(window).off("resize." + this.getName());
			this.removeTitleBar();
		
			$(".titleBar-3_fDwJ").removeClass("hidden-by-OTB");
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			setImmediate(() => {this.addTitleBar();});
		}
	}

	
	// begin of own functions

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(".checkbox-1KYsPm")) {
			settings[input.value] = input.checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, this, "settings");
	}
	
	addTitleBar () {
		this.removeTitleBar();
		var settings = BDfunctionsDevilBro.getAllData(this, "settings");
		if (settings.reloadButton) {
			$(".divider-1GKkV3").parent().has(".iconInactive-WWHQEI")
				.append(this.dividerMarkup)
				.append(this.reloadButtonMarkup)
				.on("click." + this.getName(), ".reloadButtonOTB", () => {
					this.doReload();
				})
				.on("mouseenter." + this.getName(), ".reloadButtonOTB", (e) => {
					this.createReloadToolTip(e);
				});
		}
		$(".divider-1GKkV3").parent().has(".iconInactive-WWHQEI")
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
			var settings = BDfunctionsDevilBro.getAllData(this, "settings");
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
		if (require("electron").remote.getCurrentWindow().isMaximized()) {
			var newWidth = this.oldWidth ? this.oldWidth : Math.round(screen.availWidth - Math.round(screen.availWidth/10));
			var newHeight = this.oldHeight ? this.oldHeight : Math.round(screen.availHeight - Math.round(screen.availHeight/10));
			var newLeft = this.oldLeft ? this.oldLeft : Math.round((screen.availWidth - newWidth)/2);
			var newTop = this.oldTop ? this.oldTop : Math.round((screen.availHeight - newHeight)/2);
			
			require("electron").remote.getCurrentWindow().setPosition(newLeft, newTop);
			require("electron").remote.getCurrentWindow().setSize(newWidth, newHeight);
		}
		else {
			this.oldLeft = window.screenX;
			this.oldTop = window.screenY;
			this.oldWidth = window.outerWidth;
			this.oldHeight = window.outerHeight;
			require("electron").remote.getCurrentWindow().maximize();
		}
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
		$(".settings-titlebar").remove();
		
		$(".divider-1GKkV3").parent().has(".iconInactive-WWHQEI")
			.off("click." + this.getName())
			.off("mouseenter." + this.getName())
			.find(".dividerOTB, .reloadButtonOTB, .minButtonOTB, .maxButtonOTB, .closeButtonOTB").remove();
			
		$(".divider-1GKkV3").parent().has(".iconInactive-WWHQEI").parent().css("-webkit-app-region", "initial");
	}
	
	createReloadToolTip (e) {
		BDfunctionsDevilBro.createTooltip("Reload", e.currentTarget, {type:"bottom",selector:"reload-button-tooltip"});
	}
}
