//META{"name":"OldTitleBar"}*//

class OldTitleBar {
	initConstructor () {
		this.patchModules = {
			"HeaderBar":["componentDidMount","componentDidUpdate"],
			"StandardSidebarView":["componentDidMount","componentWillUnmount"],
			"AuthWrapper":["componentDidMount","componentWillUnmount"]
		};
		
		this.patched = false;
		
		this.css = `
			.hidden-by-OTB ${BDFDB.dotCN.titlebar},
			.hidden-by-OTB ${BDFDB.dotCN.titlebar} + ${BDFDB.dotCNS.app + BDFDB.dotCN.splashbackground}:before {
				display: none !important;
			}
			
			${BDFDB.dotCN.channelheaderheaderbardrag} {
				-webkit-app-region: drag !important;
			}
			
			${BDFDB.dotCN.channelheaderheaderbardrag} *,
			${BDFDB.dotCN.contextmenu} * {
				-webkit-app-region: no-drag !important;
			}
			
			.settingsTitlebarOTB {
				position: relative;
				z-index: 1000;
				text-align: right;
				padding: 10px;
				-webkit-app-region: drag;
			}`;
			
		this.dividerMarkup = `<div class="buttonOTB dividerOTB ${BDFDB.disCN.channelheaderdivider}"></div>`;
			
		this.reloadButtonMarkup = 
			`<span class="${BDFDB.disCN.channelheadericonmargin} buttonOTB reloadButtonOTB">
				<svg class="${BDFDB.disCNS.channelheadericoninactive + BDFDB.disCN.channelheadericon}" xmlns="http://www.w3.org/2000/svg">
					<g fill="none" class="${BDFDB.disCN.channelheadericonforeground}" fill-rule="evenodd">
						<path fill="currentColor" transform="translate(4,4)" d="M17.061,7.467V0l-2.507,2.507C13.013,0.96,10.885,0,8.528,0C3.813,0,0.005,3.819,0.005,8.533s3.808,8.533,8.523,8.533c3.973,0,7.301-2.72,8.245-6.4h-2.219c-0.88,2.485-3.237,4.267-6.027,4.267c-3.536,0-6.4-2.864-6.4-6.4s2.864-6.4,6.4-6.4c1.765,0,3.349,0.736,4.507,1.893l-3.44,3.44H17.061z"/>
					</g>
				</svg>
			</span>`;
			
		this.minButtonMarkup = 
			`<span class="${BDFDB.disCN.channelheadericonmargin} buttonOTB minButtonOTB">
				<svg class="${BDFDB.disCNS.channelheadericoninactive + BDFDB.disCN.channelheadericon}" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
					<g fill="none" class="${BDFDB.disCN.channelheadericonforeground}" fill-rule="evenodd">
						<path stroke-width="2" stroke="currentColor" d="M6 18 l13 0"/>
					</g>
				</svg>
			</span>`;
			
		this.maxButtonIsMaxMarkup = 
			`<span class="${BDFDB.disCN.channelheadericonmargin} buttonOTB maxButtonOTB">
				<svg class="${BDFDB.disCNS.channelheadericoninactive + BDFDB.disCN.channelheadericon}" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
					<g fill="none" class="${BDFDB.disCN.channelheadericonforeground}" fill-rule="evenodd">
						<path stroke-width="2" stroke="currentColor" d="M6 9 l10 0 l0 10 l-10 0 l0 -10 m3 -3 l10 0 l0 10"/>
					</g>
				</svg>
			</span>`;
			
		this.maxButtonIsMinMarkup = 
			`<span class="${BDFDB.disCN.channelheadericonmargin} buttonOTB maxButtonOTB">
				<svg class="${BDFDB.disCNS.channelheadericoninactive + BDFDB.disCN.channelheadericon}" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
					<g fill="none" class="${BDFDB.disCN.channelheadericonforeground}" fill-rule="evenodd">
						<path stroke-width="2" stroke="currentColor" d="M6 6 l13 0 l0 13 l-13 0 l0 -13"/>
					</g>
				</svg>
			</span>`;
			
		this.closeButtonMarkup = 
			`<span class="${BDFDB.disCN.channelheadericonmargin} buttonOTB closeButtonOTB">
				<svg class="${BDFDB.disCNS.channelheadericoninactive + BDFDB.disCN.channelheadericon}" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
					<g fill="none" class="${BDFDB.disCN.channelheadericonforeground}" fill-rule="evenodd">
						<path stroke-width="2" stroke="currentColor" d="M6 6 l13 13 m0 -13 l-13 13"/>
					</g>
				</svg>
			</span>`;
			
		this.defaults = {
			settings: {
				displayNative:		{value:!!document.querySelector(".platform-linux"), 	description:"Displays the native Title Bar."},
				addOldBar:			{value:true, 											description:"Displays the Title Bar in the old fashion."},
				addToSettings:		{value:true, 											description:"Adds a Title Bar to Settings Windows."},
				reloadButton:		{value:false, 											description:"Adds a Reload Button to the Title Bar."}
			}
		};
	}

	getName () {return "OldTitleBar";}

	getDescription () {return "Reverts the title bar back to its former self.";}

	getVersion () {return "1.5.1";}

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
			.on("click", BDFDB.dotCN.switchinner, (e) => {this.updateSettings(settingspanel, e.currentTarget.value);});
			
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
			
			this.window = require("electron").remote.getCurrentWindow();
			
			$(window).on("resize." + this.getName(), (e) => {this.changeMaximizeButton();});
			
			this.patchMainScreen(BDFDB.getData("displayNative", this, "settings"));
		
			document.body.classList.add("hidden-by-OTB");
			document.querySelector(BDFDB.dotCN.titlebar).classList.add("hidden-by-OTB");
			
			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDFDB === "object") {
			BDFDB.removeEles(".headerbarOTB",".settingsTitlebarOTB");
		
			BDFDB.removeClasses("hidden-by-OTB");
			
			BDFDB.unloadMessage(this);
		}
	}

	
	// begin of own functions

	updateSettings (settingspanel, key) {
		var settings = {};
		for (var input of settingspanel.querySelectorAll(BDFDB.dotCN.switchinner)) {
			settings[input.value] = input.checked;
		}
		BDFDB.saveAllData(settings, this, "settings");
		if (key == "displayNative") {
			if (this.patchMainScreen(settings[key])) {
				this.patched = !this.patched;
				let notifybar = document.querySelector("#OldTitleBarNotifyBar");
				if (notifybar) notifybar.querySelector(BDFDB.dotCN.noticedismiss).click();
				if (this.patched) {
					notifybar = BDFDB.createNotificationsBar("Changed nativebar settings, relaunch to see changes:", {type:"danger",btn:"Relaunch",id:"OldTitleBarNotifyBar"});
					$(notifybar).on("click." + this.getName(), BDFDB.dotCN.noticebutton, (e) => {this.doRelaunch();});
				}
			}
		}
	}
	
	processHeaderBar (instance, wrapper) {
		this.addTitleBar();
	}
	
	processStandardSidebarView (instance, wrapper, methodnames) {
		this.processAuthWrapper(instance, wrapper, methodnames);
	}
	
	processAuthWrapper (instance, wrapper, methodnames) {
		if (methodnames.includes("componentDidMount")) {
			this.addSettingsTitleBar(wrapper);
		}
		else if (methodnames.includes("componentWillUnmount")) {
			BDFDB.removeEles(".settingsTitlebarOTB");
			this.addTitleBar();
		}
	}
	
	addTitleBar () {
		$("*").off("." + this.getName());
		BDFDB.removeEles(".headerbarOTB");
		var settings = BDFDB.getAllData(this, "settings");
		if (BDFDB.getData("addOldBar", this, "settings")) {
			var headerbar = $(`<span class="headerbarOTB ${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}"></span>`)[0];
			this.createButtons(headerbar);
			$(BDFDB.dotCNS.channelheaderheaderbardrag + BDFDB.dotCN.flex + " > " + BDFDB.dotCN.channelheadericonmargin).parent().append(headerbar);
		}
	}
	
	addSettingsTitleBar (settingspane) {
		BDFDB.removeEles(".settingsTitlebarOTB");
		if (BDFDB.getData("addToSettings", this, "settings")) {
			var settingsbar = $(`<div class="settingsTitlebarOTB"></div>`)[0];
			this.createButtons(settingsbar);
			settingspane.parentElement.appendChild(settingsbar);
		}
	}
	
	createButtons (bar) {
		if (BDFDB.getData("reloadButton", this, "settings")) {
			$(bar)
				.append(bar.classList.contains("settingsTitlebarOTB") ? "" : this.dividerMarkup)
				.append(this.reloadButtonMarkup)
				.on("click." + this.getName(), ".reloadButtonOTB " + BDFDB.dotCN.channelheadericon, () => {
					this.doReload();
				})
				.on("mouseenter." + this.getName(), ".reloadButtonOTB " + BDFDB.dotCN.channelheadericon, (e) => {
					BDFDB.createTooltip("Reload", e.currentTarget, {type:"bottom",selector:"reload-button-tooltip"});
				});
		}
		$(bar)
			.append(bar.classList.contains("settingsTitlebarOTB") ? "" : this.dividerMarkup)
			.append(this.minButtonMarkup)
			.append(this.isMaximized() ? this.maxButtonIsMaxMarkup : this.maxButtonIsMinMarkup)
			.append(this.closeButtonMarkup)
			.on("click." + this.getName(), ".minButtonOTB " + BDFDB.dotCN.channelheadericon, () => {
				this.doMinimize();
			})
			.on("click." + this.getName(), ".maxButtonOTB " + BDFDB.dotCN.channelheadericon, () => {
				this.doMaximize();
			})
			.on("click." + this.getName(), ".closeButtonOTB " + BDFDB.dotCN.channelheadericon, () => {
				this.doClose();
			});
	}
	
	doReload () {
		this.window.reload();
	}
	
	doMinimize () {
		this.window.minimize();
	}
	
	doMaximize () {
		if (this.isMaximized()) this.window.unmaximize();
		else this.window.maximize();
		this.changeMaximizeButton();
	}
	
	isMaximized () {
		var pos = this.window.getPosition();
		var size = this.window.getSize();
		return (pos[0] == 0 && pos[1] == 0 && size[0] == global.window.screen.availWidth && size[1] == global.window.screen.availHeight);
	}
	
	doClose () {
		this.window.close(); 
	}
	
	doRelaunch () {
		var app = require("electron").remote.app;
		app.relaunch();
		app.quit();
	}
	
	changeMaximizeButton () {
		var maxButtonHTML = this.isMaximized() ? this.maxButtonIsMaxMarkup : this.maxButtonIsMinMarkup;
		document.querySelectorAll(".maxButtonOTB").forEach(maxButton => {maxButton.outerHTML = maxButtonHTML;});
	}
	
	patchMainScreen (enable) {
		if (BdApi.getWindowPreference("frame") != enable) {
			BdApi.setWindowPreference("frame", enable);
			return true;
		}
		return false;
	}
}
