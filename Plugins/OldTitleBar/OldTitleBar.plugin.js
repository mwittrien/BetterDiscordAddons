//META{"name":"OldTitleBar","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/OldTitleBar","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/OldTitleBar/OldTitleBar.plugin.js"}*//

class OldTitleBar {
	getName () {return "OldTitleBar";}

	getVersion () {return "1.5.5";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Reverts the title bar back to its former self.";}

	initConstructor () {
		this.changelog = {
			"fixed":[["Appending","Fixed the issue where the buttons wouldn't show on canary"]]
		};
		
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

			body:not(.settingsTitlebarOTB-added) ${BDFDB.dotCN.channelheaderheaderbardrag} {
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

		this.maxButtonMarkup = 
			`<span class="${BDFDB.disCN.channelheadericonmargin} buttonOTB maxButtonOTB">
				<svg class="${BDFDB.disCNS.channelheadericoninactive + BDFDB.disCN.channelheadericon}" xmlns="http://www.w3.org/2000/svg" width="26" height="26">
					<g fill="none" class="${BDFDB.disCN.channelheadericonforeground}" fill-rule="evenodd"></g>
				</svg>
			</span>`;
		this.maxButtonInnerMin = `<path stroke-width="2" stroke="currentColor" d="M6 6 l13 0 l0 13 l-13 0 l0 -13"/>`;
		this.maxButtonInnerMax = `<path stroke-width="2" stroke="currentColor" d="M6 9 l10 0 l0 10 l-10 0 l0 -10 m3 -3 l10 0 l0 10"/>`;

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

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var settings = BDFDB.getAllData(this, "settings"); 
		var settingshtml = `<div class="${this.name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${this.name}</div><div class="DevilBro-settings-inner">`;
		for (let key in settings) {
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">${this.defaults.settings[key].description}</h3><div class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.switchenabled + BDFDB.disCNS.switch + BDFDB.disCNS.switchvalue + BDFDB.disCNS.switchsizedefault + BDFDB.disCNS.switchsize + BDFDB.disCN.switchthemedefault}" style="flex: 0 0 auto;"><input type="checkbox" value="settings ${key}" class="${BDFDB.disCNS.switchinnerenabled + BDFDB.disCN.switchinner} settings-switch${key == "displayNative" ? " nativetitlebar-switch" : ""}"${settings[key] ? " checked" : ""}></div></div>`;
		}
		settingshtml += `</div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".nativetitlebar-switch", e => {
			if (this.patchMainScreen(e.currentTarget.checked)) {
				this.patched = !this.patched;
				let notifybar = document.querySelector("#OldTitleBarNotifyBar");
				if (notifybar) notifybar.querySelector(BDFDB.dotCN.noticedismiss).click();
				if (this.patched) {
					notifybar = BDFDB.createNotificationsBar("Changed nativebar settings, relaunch to see changes:", {type:"danger",btn:"Relaunch",id:"OldTitleBarNotifyBar"});
					notifybar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", () => {
						let app = require("electron").remote.app;
						app.relaunch();
						app.quit();
					});
				}
			}
		});

		return settingspanel;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			BDFDB.addEventListener(this, window, "resize", e => {
				this.changeMaximizeButtons();
			});

			this.window = require("electron").remote.getCurrentWindow();

			this.patchMainScreen(BDFDB.getData("displayNative", this, "settings"));

			BDFDB.addClass([document.body,document.querySelector(BDFDB.dotCN.titlebar)], "hidden-by-OTB");

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}


	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".headerbarOTB", ".settingsTitlebarOTB");

			BDFDB.removeClasses("hidden-by-OTB", "settingsTitlebarOTB-added");

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

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
			BDFDB.removeClass(document.body, "settingsTitlebarOTB-added");
			this.addTitleBar();
		}
	}

	addTitleBar () {
		BDFDB.removeEles(".headerbarOTB");
		var settings = BDFDB.getAllData(this, "settings");
		if (BDFDB.getData("addOldBar", this, "settings")) {
			var headerbar = BDFDB.htmlToElement(`<span class="headerbarOTB ${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}"></span>`);
			this.createButtons(headerbar);
			let headerbaricon = document.querySelector(BDFDB.dotCN.channelheaderheaderbardrag + " > * > " + BDFDB.dotCN.channelheadericonmargin);
			if (headerbaricon) headerbaricon.parentElement.appendChild(headerbar);
			this.changeMaximizeButtons();
		}
	}

	addSettingsTitleBar (settingspane) {
		BDFDB.removeEles(".settingsTitlebarOTB");
		if (BDFDB.getData("addToSettings", this, "settings")) {
			BDFDB.addClass(document.body, "settingsTitlebarOTB-added");
			var settingsbar = BDFDB.htmlToElement(`<div class="settingsTitlebarOTB"></div>`);
			this.createButtons(settingsbar);
			settingspane.parentElement.appendChild(settingsbar);
			this.changeMaximizeButtons();
		}
	}

	createButtons (bar) {
		var settings = BDFDB.containsClass(bar, "settingsTitlebarOTB");
		if (BDFDB.getData("reloadButton", this, "settings")) {
			if (!settings) bar.appendChild(BDFDB.htmlToElement(this.dividerMarkup));
			var reloadbutton = BDFDB.htmlToElement(this.reloadButtonMarkup);
			bar.appendChild(reloadbutton);
			var reloadbuttonicon = reloadbutton.querySelector(BDFDB.dotCN.channelheadericon);
			reloadbuttonicon.addEventListener("click", () => {this.window.reload();});
			reloadbuttonicon.addEventListener("mouseenter", e => {
				BDFDB.createTooltip("Reload", reloadbuttonicon, {type:"bottom",selector:"reload-button-tooltip"});
			});
		}
		if (!settings) bar.appendChild(BDFDB.htmlToElement(this.dividerMarkup));
		var minbutton = BDFDB.htmlToElement(this.minButtonMarkup);
		bar.appendChild(minbutton);
		minbutton.querySelector(BDFDB.dotCN.channelheadericon).addEventListener("click", () => {this.window.minimize();});
		var maxbutton = BDFDB.htmlToElement(this.maxButtonMarkup);
		bar.appendChild(maxbutton);
		maxbutton.querySelector(BDFDB.dotCN.channelheadericon).addEventListener("click", () => {
			if (this.isMaximized()) this.window.unmaximize();
			else this.window.maximize();
		});
		var closebutton = BDFDB.htmlToElement(this.closeButtonMarkup);
		bar.appendChild(closebutton);
		closebutton.querySelector(BDFDB.dotCN.channelheadericon).addEventListener("click", () => {this.window.close();});
	}

	changeMaximizeButtons () {
		var innerHTML = this.isMaximized() ? this.maxButtonInnerMax : this.maxButtonInnerMin;
		document.querySelectorAll(".maxButtonOTB g").forEach(g => {g.innerHTML = innerHTML;});
	}
	
	isMaximized () {
		return window.screen.availWidth == window.outerWidth && window.screen.availHeight == window.outerHeight && window.screenX == 0 && window.screenY == 0;
	}

	patchMainScreen (enable) {
		if (BdApi.getWindowPreference("frame") != enable) {
			BdApi.setWindowPreference("frame", enable);
			return true;
		}
		return false;
	}
}
