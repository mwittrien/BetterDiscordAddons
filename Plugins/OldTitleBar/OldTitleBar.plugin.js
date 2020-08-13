//META{"name":"OldTitleBar","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/OldTitleBar","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/OldTitleBar/OldTitleBar.plugin.js"}*//

var OldTitleBar = (_ => {
	var patched, electronWindow;
	var settings = {};
	
	return class OldTitleBar {
		getName () {return "OldTitleBar";}

		getVersion () {return "1.6.7";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Reverts the title bar back to its former self.";}

		constructor () {
			this.patchedModules = {
				after: {
					App: "render",
					AppSkeleton: "render",
					HeaderBarContainer: "render",
					StandardSidebarView: "render",
					AuthWrapper: "render"
				}
			};
		}

		initConstructor () {
			patched = false;

			electronWindow = BDFDB.LibraryRequires.electron.remote.getCurrentWindow();
			
			this.css = `
				${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.titlebar},
				${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.splashbackground}:before {
					display: none !important;
				}
				
				.platform-osx ${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.guildswrapper} {
					margin-top: 0;
				}

				.platform-osx ${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.guildsscroller} {
					padding-top: 4px;
				}
				
				${BDFDB.dotCN._oldtitlebartoolbar} {
					flex: 1 1 auto;
					justify-content: flex-end;
				}

				${BDFDB.dotCN._oldtitlebarsettingstoolbar} {
					position: absolute;
					top: 0;
					right: 0;
					padding: 10px;
					z-index: 2;
					-webkit-app-region: drag !important;
				}
				
				${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCNS.splashbackground + BDFDB.dotCN._oldtitlebarsettingstoolbar} {
					background: rgba(0, 0, 0, 0.3);
					border-radius: 0 0 0 5px;
				}

				${BDFDB.dotCN.channelheaderheaderbar} {
					-webkit-app-region: drag !important;
				}

				${BDFDB.dotCNS.stopanimations + BDFDB.dotCN.channelheaderheaderbar},
				${BDFDB.dotCN.channelheaderheaderbar} * {
					-webkit-app-region: no-drag !important;
				}`;

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
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let settingsPanel, settingsItems = [];
			
			let isLinux = !!document.querySelector(".platform-linux");
			
			for (let key in settings) {
				let isNativeTitlebarSetting = key == "displayNative";
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: isLinux && isNativeTitlebarSetting || settings[key],
					disabled: isLinux && isNativeTitlebarSetting,
					note: isLinux && isNativeTitlebarSetting && "This is disabled on Linux, because Discord/BD forces the titlebar on Linux systems!",
					onChange: isNativeTitlebarSetting ? value => {
						if (this.patchMainScreen(value)) {
							patched = !patched;
							let notifybar = document.querySelector("#OldTitleBarNotifyBar");
							if (notifybar) notifybar.querySelector(BDFDB.dotCN.noticedismiss).click();
							if (patched) {
								notifybar = BDFDB.NotificationUtils.notice("Changed nativebar settings, relaunch to see changes:", {type:"danger",btn:"Relaunch",id:"OldTitleBarNotifyBar"});
								notifybar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", _ => {
									BDFDB.LibraryRequires.electron.remote.app.relaunch();
									BDFDB.LibraryRequires.electron.remote.app.quit();
								});
							}
						}
					} : null
				}));
			}
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
		}

		// Legacy
		load () {}

		start () {
			if (!window.BDFDB) window.BDFDB = {myPlugins:{}};
			if (window.BDFDB && window.BDFDB.myPlugins && typeof window.BDFDB.myPlugins == "object") window.BDFDB.myPlugins[this.getName()] = this;
			let libraryScript = document.querySelector("head script#BDFDBLibraryScript");
			if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("id", "BDFDBLibraryScript");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", _ => {this.initialize();});
				document.head.appendChild(libraryScript);
			}
			else if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(_ => {
				try {return this.initialize();}
				catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
			}, 30000);
		}

		initialize () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				if (this.started) return;
				BDFDB.PluginUtils.init(this);

				BDFDB.ListenerUtils.add(this, window, "resize", e => {
					BDFDB.ModuleUtils.forceAllUpdates(this, ["HeaderBarContainer", "StandardSidebarView"]);
				});

				BDFDB.DOMUtils.addClass(document.body, BDFDB.disCN._oldtitlebarenabled);

				this.forceUpdateAll();

				this.patchMainScreen(settings.displayNative);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}


		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;
				
				this.forceUpdateAll();
				
				BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.app), {name:"App"}));

				BDFDB.DOMUtils.removeClassFromDOM(BDFDB.disCN._oldtitlebarenabled);

				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;

				this.forceUpdateAll();
			}
		}

		processApp (e) {
			let [children, index] = BDFDB.ReactUtils.findParent(e.instance, {props:[["type",["WINDOWS", "MACOS"]]]});
			if (index > -1) children[index] = null;
		}

		processAppSkeleton (e) {
			this.processApp(e);
		}

		processHeaderBarContainer (e) {
			if (!settings.addOldBar) return;
			let children = BDFDB.ReactUtils.getValue(e.returnvalue, "props.toolbar.props.children");
			if (!children) {
				let [oldToolbarParent, oldToolbarIndex] = BDFDB.ReactUtils.findParent(e.returnvalue, {key: "OldTitleBar-toolbar"});
				if (oldToolbarIndex > -1) oldToolbarParent.splice(oldToolbarIndex, 1);
				let toolbar = BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCNS.channelheadertoolbar + BDFDB.disCN._oldtitlebartoolbar,
					key: "OldTitleBar-toolbar",
					children: []
				});
				e.returnvalue.props.children.push(toolbar);
				children = toolbar.props.children;
			}
			this.injectButtons(children, true);
		}

		processStandardSidebarView (e) {
			if (!BDFDB.ArrayUtils.is(e.returnvalue.props.children)) e.returnvalue.props.children = [e.returnvalue.props.children];
			this.injectSettingsToolbar(e.returnvalue.props.children);
		}

		processAuthWrapper (e) {
			if (!BDFDB.ArrayUtils.is(e.returnvalue.props.children)) e.returnvalue.props.children = [e.returnvalue.props.children];
			this.injectSettingsToolbar(e.returnvalue.props.children, true);
		}
		
		injectSettingsToolbar (children, fixed) {
			if (!settings.addToSettings) return;
			let toolbar = BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCNS.channelheadertoolbar + BDFDB.disCN._oldtitlebarsettingstoolbar,
				children: [],
				style: fixed ? {position: "fixed"} : null
			});
			this.injectButtons(toolbar.props.children);
			children.push(toolbar);
		}
		
		injectButtons (children, addFirstDivider) {
			if (addFirstDivider) children.push(BDFDB.ReactUtils.createElement("div", {className: BDFDB.disCN.channelheaderdivider}))
			if (settings.reloadButton) {
				children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: BDFDB.LanguageUtils.LanguageStrings.ERRORS_RELOAD,
					tooltipConfig: {type: "bottom"},
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
						className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
						onClick: _ => {electronWindow.reload();},
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.disCN.channelheadericon,
							iconSVG: `<svg><path fill="currentColor" stroke="none" transform="translate(3,4)" d="M 17.061, 7.467 V 0 l -2.507, 2.507 C 13.013, 0.96, 10.885, 0, 8.528, 0 C 3.813, 0, 0.005, 3.819, 0.005, 8.533 s 3.808, 8.533, 8.523, 8.533 c 3.973, 0, 7.301 -2.72, 8.245 -6.4 h -2.219 c -0.88, 2.485 -3.237, 4.267 -6.027, 4.267 c -3.536, 0 -6.4 -2.864 -6.4 -6.4 s 2.864 -6.4, 6.4 -6.4 c 1.765, 0, 3.349, 0.736, 4.507, 1.893 l -3.44, 3.44 H 17.061 z"/></svg>`
						})
					})
				}));
				children.push(BDFDB.ReactUtils.createElement("div", {className: BDFDB.disCN.channelheaderdivider}));
			};
			children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
				className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
				onClick: _ => {electronWindow.minimize();},
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
					className: BDFDB.disCN.channelheadericon,
					iconSVG: `<svg width="26" height="26"><path stroke-width="2" stroke="currentColor" fill="none" d="M6 18 l13 0"/></svg>`
				})
			}));
			children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
				className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
				onClick: _ => {
					if (electronWindow.isMaximized()) electronWindow.unmaximize();
					else electronWindow.maximize();
				},
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
					className: BDFDB.disCN.channelheadericon,
					iconSVG: electronWindow.isMaximized() ? `<svg width="26" height="26"><path stroke-width="2" stroke="currentColor" fill="none" d="M6 9 l10 0 l0 10 l-10 0 l0 -10 m3 -3 l10 0 l0 10"/></svg>` : `<svg width="26" height="26"><path stroke-width="2" stroke="currentColor" fill="none" d="M6 6 l13 0 l0 13 l-13 0 l0 -13"/></svg>`
				})
			}));
			children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
				className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
				onClick: _ => {electronWindow.close();},
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
					className: BDFDB.disCN.channelheadericon,
					iconSVG: `<svg width="26" height="26"><path stroke-width="2" stroke="currentColor" fill="none" d="M6 6 l13 13 m0 -13 l-13 13"/></svg>`
				})
			}));
		}

		patchMainScreen (enable) {
			try {
				if (BdApi.getWindowPreference("frame") != enable) {
					BdApi.setWindowPreference("frame", enable);
					return true;
				}
				return false;
			}
			catch (err) {
				return false;
			}
		}
		
		forceUpdateAll () {
			settings = BDFDB.DataUtils.get(this, "settings");
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
	}
})();

module.exports = OldTitleBar;