/**
 * @name OldTitleBar
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/OldTitleBar
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/OldTitleBar/OldTitleBar.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/OldTitleBar/OldTitleBar.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "OldTitleBar",
			"author": "DevilBro",
			"version": "1.6.7",
			"description": "Revert the title bar back to its former self"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it.\n\n${config.info.description}`;}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB Library Plugin, try again later or download it manually from GitHub: https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", _ => {
				require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
					if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
					else BdApi.alert("Error", "Could not download BDFDB Library Plugin, try again later or download it manually from GitHub: https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/");
				});
			});
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var patched, electronWindow;
		var settings = {};
		
		return class OldTitleBar extends Plugin {
			onLoad () {
				patched = false;

				electronWindow = BDFDB.LibraryRequires.electron && BDFDB.LibraryRequires.electron.remote && BDFDB.LibraryRequires.electron.remote.getCurrentWindow();

				this.defaults = {
					settings: {
						displayNative:		{value: !!document.querySelector(".platform-linux"), 	description: "Display the native title bar"},
						addOldBar:			{value: true, 											description: "Display the title bar in the old fashion"},
						addToSettings:		{value: true, 											description: "Add a title bar to settings windows"},
						reloadButton:		{value: false, 											description: "Add a reload button to the title bar"}
					}
				};
			
				this.patchedModules = {
					after: {
						App: "render",
						AppSkeleton: "render",
						HeaderBarContainer: "render",
						StandardSidebarView: "render",
						AuthWrapper: "render"
					}
				};
				
				this.css = `
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.titlebar},
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.splashbackground}:before {
						display: none !important;
					}
					
					.platform-osx ${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.guildswrapper} {
						margin-top: 0;
						padding-top: 0;
					}

					.platform-osx ${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.guildsscroller} {
						padding-top: 4px;
					}
					
					.platform-osx ${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.settingswindowstandardsidebarview}:before {
						display: none;
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
					}
				`;
			}
			
			onStart () {
				BDFDB.ListenerUtils.add(this, window, "resize", e => {
					BDFDB.PatchUtils.forceAllUpdates(this, ["HeaderBarContainer", "StandardSidebarView"]);
				});

				BDFDB.DOMUtils.addClass(document.body, BDFDB.disCN._oldtitlebarenabled);

				this.forceUpdateAll();

				this.patchMainScreen(settings.displayNative);
			}
			
			onStop () {
				this.forceUpdateAll();

				BDFDB.DOMUtils.removeClassFromDOM(BDFDB.disCN._oldtitlebarenabled);
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				let isLinux = !!document.querySelector(".platform-linux");
				
				for (let key in settings) {
					let isNativeTitlebarSetting = key == "displayNative";
					settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
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
									notifybar = BDFDB.NotificationUtils.notice("Changed nativebar settings, relaunch to see changes:", {type: "danger",btn: "Relaunch",id: "OldTitleBarNotifyBar"});
									notifybar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", _ => {
										if (BDFDB.LibraryRequires.electron && BDFDB.LibraryRequires.electron.remote) {
											BDFDB.LibraryRequires.electron.remote.app.relaunch();
											BDFDB.LibraryRequires.electron.remote.app.quit();
										}
									});
								}
							}
						} : null
					}));
				}
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;

					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processApp (e) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.instance, {props: [["type",["WINDOWS", "MACOS"]]]});
				if (index > -1) children[index] = null;
			}

			processAppSkeleton (e) {
				this.processApp(e);
			}

			processHeaderBarContainer (e) {
				if (!settings.addOldBar) return;
				let children = BDFDB.ObjectUtils.get(e.returnvalue, "props.toolbar.props.children");
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
							onClick: _ => {electronWindow && electronWindow.reload();},
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
					onClick: _ => {electronWindow && electronWindow.minimize();},
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCN.channelheadericon,
						iconSVG: `<svg width="26" height="26"><path stroke-width="2" stroke="currentColor" fill="none" d="M6 18 l13 0"/></svg>`
					})
				}));
				children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
					className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
					onClick: _ => {
						if (!electronWindow) return;
						else if (electronWindow.isMaximized()) electronWindow.unmaximize();
						else electronWindow.maximize();
					},
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCN.channelheadericon,
						iconSVG: electronWindow.isMaximized() ? `<svg width="26" height="26"><path stroke-width="2" stroke="currentColor" fill="none" d="M6 9 l10 0 l0 10 l-10 0 l0 -10 m3 -3 l10 0 l0 10"/></svg>` : `<svg width="26" height="26"><path stroke-width="2" stroke="currentColor" fill="none" d="M6 6 l13 0 l0 13 l-13 0 l0 -13"/></svg>`
					})
				}));
				children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
					className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
					onClick: _ => {electronWindow && electronWindow.close();},
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
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();