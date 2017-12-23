//META{"name":"OldTitleBar"}*//

class OldTitleBar {
	constructor () {
		this.settingsWindowObserver = new MutationObserver(() => {});
		
		this.css = `
			.titleBar-3_fDwJ {
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
					<path fill="currentColor" d="M19 19v-2H7v2h12z"/>
					<path d="M1 25h24V1H1v24z"/>
				</g>
			</svg>`;
			
		this.maxButtonMarkup = 
			`<svg class="maxButtonOTB iconInactive-WWHQEI icon-mr9wAc iconMargin-2Js7V9" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
				<g fill="none" class="iconForeground-2c7s3m" fill-rule="evenodd">
					<path d="M1 1h24v24H1V1z"/>
					<path fill="currentColor" d="M8 13H6v7h7v-2H8v-5zm-2 0h2V8h5V6H6v7zm7 5v2h7v-7h-2v5h-5zm0-12v2h5v5h2V6h-7z"/>
				</g>
			</svg>`;
			
		this.closeButtonMarkup = 
			`<svg class="closeButtonOTB iconInactive-WWHQEI icon-mr9wAc iconMargin-2Js7V9" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
				<g fill="none" class="iconForeground-2c7s3m" fill-rule="evenodd">
					<path d="M1 1h24v24H1V1z"/>
					<path fill="currentColor" d="M20 7.41L18.59 6 13 11.59 7.41 6 6 7.41 11.59 13 6 18.59 7.41 20 13 14.41 18.59 20 20 18.59 14.41 13 20 7.41z"/>
				</g>
			</svg>`;
			
		this.defaultSettings = {
			addToSettings:		{value:true, 	description:"Add a Title Bar to Settings Windows."},
			reloadButton:		{value:false, 	description:"Add a Reload Button to the Title Bar."}
		};
	}

	getName () {return "OldTitleBar";}

	getDescription () {return "Reverts the title bar back to its former self.";}

	getVersion () {return "1.2.8";}

	getAuthor () {return "DevilBro";}

	getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			var settings = this.getSettings(); 
			var settingshtml = `<div class="${this.getName()}-settings DevilBro-settings"><div class="titleDefault-1CWM9y title-3i-5G_ size18-ZM4Qv- height24-2pMcnc weightNormal-3gw0Lm marginBottom8-1mABJ4">${this.getName()}</div><div class="DevilBro-settings-inner">`;
			for (let key in settings) {
				settingshtml += `<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignStart-pnSyE6 noWrap-v6g9vO marginBottom8-1mABJ4" style="flex: 1 1 auto;"><h3 class="titleDefault-1CWM9y title-3i-5G_ marginReset-3hwONl weightMedium-13x9Y8 size16-3IvaX_ height24-2pMcnc flexChild-1KGW5q" style="flex: 1 1 auto;">${this.defaultSettings[key].description}</h3><div class="flexChild-1KGW5q switchEnabled-3CPlLV switch-3lyafC value-kmHGfs sizeDefault-rZbSBU size-yI1KRe themeDefault-3M0dJU ${settings[key] ? "valueChecked-3Bzkbm" : "valueUnchecked-XR6AOk"}" style="flex: 0 0 auto;"><input type="checkbox" value="${key}" class="checkboxEnabled-4QfryV checkbox-1KYsPm"${settings[key] ? " checked" : ""}></div></div>`;
			}
			settingshtml += `</div></div>`;
			
			var settingspanel = $(settingshtml)[0];
			$(settingspanel)
				.on("click", ".checkbox-1KYsPm", () => {this.updateSettings(settingspanel);});
				
			return settingspanel;
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
								setImmediate(() => {
									if (node && node.tagName && node.getAttribute("layer-id") || node.querySelector(".ui-standard-sidebar-view")) {
										$(".divider-1GKkV3").parent().has(".iconInactive-WWHQEI").parent().css("-webkit-app-region", "initial");
										if (this.getSettings().addToSettings) this.addSettingsTitleBar(node);
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
			if (document.querySelector(".layers")) this.settingsWindowObserver.observe(document.querySelector(".layers"), {childList:true});
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			this.addTitleBar();
			
			if (this.getSettings().addToSettings && document.querySelector(".layer[layer-id]")) this.addSettingsTitleBar(document.querySelector(".layer[layer-id]"));
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.settingsWindowObserver.disconnect();
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName(), this.css);
			
			this.removeTitleBar();
			
			BDfunctionsDevilBro.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.addTitleBar();
		}
	}

	
	// begin of own functions
	
	getSettings () {
		var oldSettings = BDfunctionsDevilBro.loadAllData(this.getName(), "settings"), newSettings = {}, saveSettings = false;
		for (let key in this.defaultSettings) {
			if (oldSettings[key] == null) {
				newSettings[key] = this.defaultSettings[key].value;
				saveSettings = true;
			}
			else {
				newSettings[key] = oldSettings[key];
			}
		}
		if (saveSettings) BDfunctionsDevilBro.saveAllData(newSettings, this.getName(), "settings");
		return newSettings;
	}

	updateSettings (settingspanel) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(".checkbox-1KYsPm")) {
			settings[input.value] = input.checked;
			input.parentElement.classList.toggle("valueChecked-3Bzkbm", input.checked);
			input.parentElement.classList.toggle("valueUnchecked-XR6AOk", !input.checked);
		}
		BDfunctionsDevilBro.saveAllData(settings, this.getName(), "settings");
	}
	
	addTitleBar () {
		this.removeTitleBar();
		var settings = this.getSettings();
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
			.append(this.maxButtonMarkup)
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
			var settings = this.getSettings();
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
				.append(this.maxButtonMarkup)
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
