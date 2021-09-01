/**
 * @name OldTitleBar
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.7.1
 * @description Allows you to switch to Discord's old Titlebar
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/OldTitleBar/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/OldTitleBar/OldTitleBar.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "OldTitleBar",
			"author": "DevilBro",
			"version": "1.7.1",
			"description": "Allows you to switch to Discord's old Titlebar"
		},
		"changeLog": {
			"fixed": {
				"Window Transparency": "Fixed an issue that might have broken maximizing when transparency is enabled"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
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
						this.downloadLibrary();
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
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var patched, lastWindowRects;
		
		return class OldTitleBar extends Plugin {
			onLoad () {
				patched = false;

				this.defaults = {
					general: {
						addToSettings:		{value: true, 												description: "Adds a Titlebar to Settings Windows"},
						reloadButton:		{value: false, 												description: "Adds a Reload Button to the Titlebar"}
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
					
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.guildswrapper} {
						margin-top: 0;
						padding-top: 0;
					}

					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.guildsscroller} {
						padding-top: 4px;
					}
					
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.settingswindowstandardsidebarview}:before {
						display: none;
					}
					
					${BDFDB.dotCN._oldtitlebartoolbar} {
						flex: 1 1 auto;
						justify-content: flex-end;
					}

					${BDFDB.dotCN._oldtitlebarsettingstoolbar} {
						display: flex;
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

					${BDFDB.dotCN.channelheaderheaderbar},
					${BDFDB.dotCNS.channelheaderheaderbar + BDFDB.dotCN.channelheaderchildren},
					${BDFDB.dotCNS.channelheaderheaderbar + BDFDB.dotCN.channelheadertoolbar} {
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

				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);

				BDFDB.DOMUtils.removeClassFromDOM(BDFDB.disCN._oldtitlebarenabled);
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						for (let key in this.defaults.general) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["general", key],
							label: this.defaults.general[key].description,
							value: this.settings.general[key],
						}));
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;

					BDFDB.PatchUtils.forceAllUpdates(this);
				}
			}

			processApp (e) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.instance, {props: [["type", ["WINDOWS", "MACOS"]]]});
				if (index > -1) children[index] = null;
			}

			processAppSkeleton (e) {
				this.processApp(e);
			}

			processHeaderBarContainer (e) {
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
				if (!this.settings.general.addToSettings) return;
				let toolbar = BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN._oldtitlebarsettingstoolbar,
					children: [],
					style: fixed ? {position: "fixed"} : null
				});
				this.injectButtons(toolbar.props.children);
				children.push(toolbar);
			}
			
			injectButtons (children, addFirstDivider) {
				if (addFirstDivider) children.push(BDFDB.ReactUtils.createElement("div", {className: BDFDB.disCN.channelheaderdivider}))
				if (this.settings.general.reloadButton) {
					children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: BDFDB.LanguageUtils.LanguageStrings.ERRORS_RELOAD,
						tooltipConfig: {type: "bottom"},
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
							className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
							onClick: _ => location.reload(),
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
					onClick: _ => BDFDB.LibraryModules.WindowUtils.minimize(),
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCN.channelheadericon,
						iconSVG: `<svg width="26" height="26"><path stroke-width="2" stroke="currentColor" fill="none" d="M6 18 l13 0"/></svg>`
					})
				}));
				children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
					className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
					onClick: _ => this.maximize(),
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCN.channelheadericon,
						iconSVG: this.isMaximized() ? `<svg width="26" height="26"><path stroke-width="2" stroke="currentColor" fill="none" d="M6 9 l10 0 l0 10 l-10 0 l0 -10 m3 -3 l10 0 l0 10"/></svg>` : `<svg width="26" height="26"><path stroke-width="2" stroke="currentColor" fill="none" d="M6 6 l13 0 l0 13 l-13 0 l0 -13"/></svg>`
					})
				}));
				children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
					className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
					onClick: _ => BDFDB.LibraryModules.WindowUtils.close(),
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCN.channelheadericon,
						iconSVG: `<svg width="26" height="26"><path stroke-width="2" stroke="currentColor" fill="none" d="M6 6 l13 13 m0 -13 l-13 13"/></svg>`
					})
				}));
			}
			
			isMaximized () {
				let rects = this.getWindowRects();
				return rects.x == 0 && rects.y == 0 && this.isScreenSize(rects);
			}
			
			isScreenSize (rects) {
				return screen.availWidth - rects.width == 0 && screen.availHeight - rects.height == 0;
			}
			
			maximize () {
				if (!this.isMaximized()) {
					lastWindowRects = this.getWindowRects();
					BDFDB.LibraryModules.WindowUtils.maximize();
				}
				else {
					BDFDB.LibraryModules.WindowUtils.maximize();
					BDFDB.TimeUtils.timeout(_ => {
						if (!this.isMaximized()) return;
						if (!lastWindowRects || this.isScreenSize(lastWindowRects)) {
							let rects = this.getWindowRects();
							window.resizeTo(rects.width/2, rects.height/2);
							window.moveTo(rects.width/4, rects.height/4);
						}
						else {
							window.resizeTo(lastWindowRects.width, lastWindowRects.height);
							window.moveTo(lastWindowRects.x, lastWindowRects.y);
						}
					}, 100);
				}
			}
			
			getWindowRects () {
				return {x: window.screenX, y: window.screenY, width: window.outerWidth, height: window.outerHeight};
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
