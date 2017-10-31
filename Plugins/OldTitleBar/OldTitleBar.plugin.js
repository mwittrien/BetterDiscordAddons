//META{"name":"OldTitleBar"}*//

class OldTitleBar {
	constructor () {
		this.switchFixObserver = new MutationObserver(() => {});
		this.settingsWindowObserver = new MutationObserver(() => {});
		
		this.css = `
			.titleBar-3_fDwJ {
				display: none;
			}
			
			.settings-titlebar {
				position: relative;
				z-index: 1000;
				text-align: right;
				padding: 10px;
				-webkit-app-region: drag;
			}`;
			
		this.dividerMarkup = `<div class="dividerOTB divider-1GKkV3"></div>`;
			
		this.reloadButtonMarkup = `
			<svg class="reloadButtonOTB iconInactive-WWHQEI icon-mr9wAc iconMargin-2Js7V9" xmlns="http://www.w3.org/2000/svg">
				<g fill="none" class="iconForeground-2c7s3m" fill-rule="evenodd">
					<path fill="currentColor" transform="translate(4,4)" d="M17.061,7.467V0l-2.507,2.507C13.013,0.96,10.885,0,8.528,0C3.813,0,0.005,3.819,0.005,8.533s3.808,8.533,8.523,8.533c3.973,0,7.301-2.72,8.245-6.4h-2.219c-0.88,2.485-3.237,4.267-6.027,4.267c-3.536,0-6.4-2.864-6.4-6.4s2.864-6.4,6.4-6.4c1.765,0,3.349,0.736,4.507,1.893l-3.44,3.44H17.061z"/>
				</g>
			</svg>`;
			
		this.minButtonMarkup = `
			<svg class="minButtonOTB iconInactive-WWHQEI icon-mr9wAc iconMargin-2Js7V9" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
				<g fill="none" class="iconForeground-2c7s3m" fill-rule="evenodd">
					<path fill="currentColor" d="M19 19v-2H7v2h12z"/>
					<path d="M1 25h24V1H1v24z"/>
				</g>
			</svg>`;
			
		this.maxButtonMarkup = `
			<svg class="maxButtonOTB iconInactive-WWHQEI icon-mr9wAc iconMargin-2Js7V9" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
				<g fill="none" class="iconForeground-2c7s3m" fill-rule="evenodd">
					<path d="M1 1h24v24H1V1z"/>
					<path fill="currentColor" d="M8 13H6v7h7v-2H8v-5zm-2 0h2V8h5V6H6v7zm7 5v2h7v-7h-2v5h-5zm0-12v2h5v5h2V6h-7z"/>
				</g>
			</svg>`;
			
		this.closeButtonMarkup = `
			<svg class="closeButtonOTB iconInactive-WWHQEI icon-mr9wAc iconMargin-2Js7V9" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
				<g fill="none" class="iconForeground-2c7s3m" fill-rule="evenodd">
					<path d="M1 1h24v24H1V1z"/>
					<path fill="currentColor" d="M20 7.41L18.59 6 13 11.59 7.41 6 6 7.41 11.59 13 6 18.59 7.41 20 13 14.41 18.59 20 20 18.59 14.41 13 20 7.41z"/>
				</g>
			</svg>`;
			
		this.reloadButtonTooltipMarkup = 
			`<div class="tooltip tooltip-bottom tooltip-black reload-button-tooltip"></div>`;
	}

	getName () {return "OldTitleBar";}

	getDescription () {return "Reverts the title bar back to its former self.";}

	getVersion () {return "1.1.0";}

	getAuthor () {return "DevilBro";}

    getSettingsPanel () {
		if (typeof BDfunctionsDevilBro === "object") {
			return `
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="addToSettings"${(this.getSettings().addToSettings ? " checked" : void 0)}> Add an old fashioned title bar to settings windows.</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="reloadButton"${(this.getSettings().reloadButton ? " checked" : void 0)}> Add a reload button to the title bar.</label><br>\n
			<label style="color:grey;"><input type="checkbox" onchange='` + this.getName() + `.updateSettings(this, "` + this.getName() + `")' value="forceClose"${(this.getSettings().forceClose ? " checked" : void 0)}> Completely turn off Discord when pressing close.</label>`;
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
								if (node && node.tagName && node.getAttribute("layer-id") || node.querySelector(".ui-standard-sidebar-view")) {
									this.removeTitleBar();
									if (this.getSettings().addToSettings) this.addSettingsTitleBar(node);
								}
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && node.tagName && node.getAttribute("layer-id") || node).querySelector(".ui-standard-sidebar-view")) {
									this.addTitleBar();
								}
							});
						}
					}
				);
			});
			this.settingsWindowObserver.observe(document.querySelector(".layers"), {childList:true});
			
			this.switchFixObserver = BDfunctionsDevilBro.onSwitchFix(this);
			
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
			this.switchFixObserver.disconnect();
			this.settingsWindowObserver.disconnect();
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName(), this.css);
			
			this.removeTitleBar();
			
			BDfunctionsDevilBro.unloadMessage(this.getName(), this.getVersion());
		}
	}
	
	onSwitch () {
		if (typeof BDfunctionsDevilBro === "object") {
			setTimeout(() => {
				this.addTitleBar();
			},1);
		}
	}

	
	// begin of own functions
	
	getSettings () {
		var defaultSettings = {
			addToSettings: true,
			reloadButton: false,
			forceClose: false
		};
		var settings = BDfunctionsDevilBro.loadAllData(this.getName(), "settings");
		var saveSettings = false;
		for (var key in defaultSettings) {
			if (settings[key] == null) {
				settings[key] = settings[key] ? settings[key] : defaultSettings[key];
				saveSettings = true;
			}
		}
		if (saveSettings) {
			BDfunctionsDevilBro.saveAllData(settings, this.getName(), "settings");
		}
		return settings;
	}

    static updateSettings (ele, pluginName) {
		var settingspanel = BDfunctionsDevilBro.getSettingsPanelDiv(ele);
		var settings = {};
		var inputs = settingspanel.querySelectorAll("input");
		for (var i = 0; i < inputs.length; i++) {
			settings[inputs[i].value] = inputs[i].checked;
		}
		BDfunctionsDevilBro.saveAllData(settings, pluginName, "settings");
    }
	
	addTitleBar () {
		if (!document.querySelector(".dividerOTB, .reloadButtonOTB, .minButtonOTB, .maxButtonOTB, .closeButtonOTB")) {
			var settings = this.getSettings();
			if (settings.reloadButton) {
				$(".divider-1GKkV3").parent().has(".iconInactive-WWHQEI")
					.append(this.dividerMarkup)
					.append(this.reloadButtonMarkup)
					.on("click." + this.getName(), ".reloadButtonOTB", () => {
						require("electron").remote.getCurrentWindow().reload();
					})
					.on("mouseenter." + this.getName(), ".reloadButtonOTB", this.createReloadToolTip.bind(this))
					.on("mouseleave." + this.getName(), ".reloadButtonOTB", this.deleteReloadToolTip.bind(this));
			}
			$(".divider-1GKkV3").parent().has(".iconInactive-WWHQEI")
				.append(this.dividerMarkup)
				.append(this.minButtonMarkup)
				.append(this.maxButtonMarkup)
				.append(this.closeButtonMarkup)
				.on("click." + this.getName(), ".minButtonOTB", () => {
					require("electron").remote.getCurrentWindow().minimize();
				})
				.on("click." + this.getName(), ".maxButtonOTB", () => {
					require("electron").remote.getCurrentWindow().maximize();
				})
				.on("click." + this.getName(), ".closeButtonOTB", () => {
					if (settings.forceClose) require("electron").remote.app.quit();
					else require("electron").remote.getCurrentWindow().close();
				})
				.parent().css("-webkit-app-region", "drag");
		}
	}
	
	addSettingsTitleBar (settingspane) {
		if (!settingspane.querySelector(".dividerOTB, .reloadButtonOTB, .minButtonOTB, .maxButtonOTB, .closeButtonOTB")) {
			var settingsbar = $(`<div class="settings-titlebar"></div>`)
			var settings = this.getSettings();
			if (settings.reloadButton) {
				$(settingsbar)
					.append(this.reloadButtonMarkup)
					.on("click." + this.getName(), ".reloadButtonOTB", () => {
						require("electron").remote.getCurrentWindow().reload();
					})
					.on("mouseenter." + this.getName(), ".reloadButtonOTB", this.createReloadToolTip.bind(this))
					.on("mouseleave." + this.getName(), ".reloadButtonOTB", this.deleteReloadToolTip.bind(this));
			}
			$(settingsbar)
				.append(this.minButtonMarkup)
				.append(this.maxButtonMarkup)
				.append(this.closeButtonMarkup)
				.on("click." + this.getName(), ".minButtonOTB", () => {
					require("electron").remote.getCurrentWindow().minimize();
				})
				.on("click." + this.getName(), ".maxButtonOTB", () => {
					require("electron").remote.getCurrentWindow().maximize();
				})
				.on("click." + this.getName(), ".closeButtonOTB", () => {
					if (settings.forceClose) require("electron").remote.app.quit();
					else require("electron").remote.getCurrentWindow().close();
				});
				
			$(settingspane).append(settingsbar);
		}
	}
	
	removeTitleBar () {
		$(".settings-titlebar").remove();
		
		$(".divider-1GKkV3").parent().has(".iconInactive-WWHQEI")
			.off("click." + this.getName())
			.off("mouseenter." + this.getName())
			.off("mouseleave." + this.getName())
			.find(".dividerOTB, .reloadButtonOTB, .minButtonOTB, .maxButtonOTB, .closeButtonOTB").remove();
			
		$(".divider-1GKkV3")
			.parent().has(".iconInactive-WWHQEI").parent().css("-webkit-app-region", "initial");
	}
	
	createReloadToolTip (e) {
		var btn = document.querySelector(".reloadButtonOTB");
		var reloadButtonTooltip = $(this.reloadButtonTooltipMarkup);
		$(".tooltips").append(reloadButtonTooltip);
		$(reloadButtonTooltip)
			.text("Reload")
			.css("left", ($(btn).offset().left + ($(btn).outerWidth() - $(reloadButtonTooltip).outerWidth())/2) + "px")
			.css("top", ($(btn).offset().top + $(btn).height()) + "px");
	}
	
	deleteReloadToolTip (e) {
		$(".tooltips").find(".reload-button-tooltip").remove();
	}
}
