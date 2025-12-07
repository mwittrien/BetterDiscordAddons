/**
 * @name OldTitleBar
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.8.8
 * @description Allows you to switch to Discord's old Titlebar
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/OldTitleBar/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/OldTitleBar/OldTitleBar.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js").then(r => {
				if (!r || r.status != 200) throw new Error();
				else return r.text();
			}).then(b => {
				if (!b) throw new Error();
				else return require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.UI.showToast("Finished downloading BDFDB Library", {type: "success"}));
			}).catch(error => {
				BdApi.UI.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.UI.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--text-strong); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var _this;
		var patched, lastWindowRects;
		var titleBarButton;
		var toolbars = [];
		
		const OldTitleBarToolbarComponent = class OldTitleBarToolbar extends BdApi.React.Component {
			componentDidMount() {
				if (toolbars.indexOf(this) == -1) toolbars.push(this);
			}
			componentWillUnmount() {
				BDFDB.ArrayUtils.remove(toolbars, this, true);
			}
			render() {
				let children = [];
				if (_this.settings.general.minimizeButton) children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
					className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
					onClick: _ => BDFDB.LibraryModules.WindowUtils.minimize(),
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCN.channelheadericon,
						iconSVG: `<svg width="24" height="24"><path fill="currentColor" d="M 3.0000229,18.453 V 21 H 21.000023 v -2.547 z"/></svg>`
					})
				}));
				if (_this.settings.general.maximizeButton) children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
					className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
					onClick: _ => _this.maximize(),
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCN.channelheadericon,
						iconSVG: _this.isMaximized() ? `<svg width="24" height="24"><path fill="currentColor" d="M 6.1764705,3 V 5.3968291 H 18.60317 c 0,0 -0.01092,12.5543579 0,12.4267009 H 21 V 3 Z M 3,6.1764705 V 21 H 17.82353 V 6.1764705 Z m 2.3968291,2.396829 H 15.4267 V 18.60317 H 5.3968291 Z"/></svg>` : `<svg width="24" height="24"><path fill="currentColor" d="m 3.0000225,3.0000002 c 0,0 0,18.0327688 0,17.9999548 H 20.999977 V 3.0000002 Z M 5.5466471,5.5466248 H 18.453353 V 18.453331 H 5.5466471 Z"/></svg>`
					})
				}));
				if (_this.settings.general.closeButton) children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
					className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
					onClick: _ => BDFDB.LibraryModules.WindowUtils.close(),
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCN.channelheadericon,
						iconSVG: `<svg width="24" height="24"><path fill="currentColor" d="M 19.2,3 12,10.2 4.8,3 3,4.8 10.2,12 3,19.2 4.8,21 12,13.8 19.2,21 21,19.2 13.8,12 21,4.8 Z"/></svg>`
					})
				}));
				if (_this.settings.general.reloadButton) {
					if (children.length) children.unshift(BDFDB.ReactUtils.createElement("div", {className: BDFDB.disCN.channelheaderdivider}));
					children.unshift(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: BDFDB.LanguageUtils.LanguageStrings.RELOAD,
						tooltipConfig: {type: "bottom"},
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
							className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
							onClick: _ => location.reload(),
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								className: BDFDB.disCN.channelheadericon,
								iconSVG: `<svg width="24" height="24"><path fill="currentColor" d="M 21,10.875658 V 3 L 18.354245,5.6442048 C 16.727955,4.0125396 14.482176,3 11.994724,3 7.0187617,3 3,7.0280088 3,12 c 0,4.97199 4.0187617,9 8.994724,9 4.192893,0 7.705089,-2.868863 8.701336,-6.750263 h -2.341815 c -0.928705,2.621 -3.416159,4.500526 -6.360578,4.500526 -3.7317064,0 -6.7542205,-3.020742 -6.7542205,-6.750263 0,-3.7295207 3.0225141,-6.7502637 6.7542205,-6.7502637 1.862689,0 3.534359,0.7762803 4.75645,1.9966015 L 13.119724,10.874604 H 21 Z"/></svg>`
							})
						})
					}));
				};
				return !children.length ? null : BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN._oldtitlebartoolbar,
					children: [
						this.props.addFirstDivider && BDFDB.ReactUtils.createElement("div", {className: BDFDB.disCN.channelheaderdivider}),
						children
					].flat(10)
				});
			}
		};
		
		return class OldTitleBar extends Plugin {
			onLoad () {
				_this = this;

				this.defaults = {
					general: {
						addToSettings:		{value: true, 				description: "Adds a Titlebar to Settings Windows"},
						reloadButton:		{value: true, 				description: "Adds a Reload Button to the Titlebar"},
						minimizeButton:		{value: true, 				description: "Adds a Minimize Button to the Titlebar"},
						maximizeButton:		{value: true, 				description: "Adds a Resize/Maximize Button to the Titlebar"},
						closeButton:		{value: true, 				description: "Adds a Close Button to the Titlebar"}
					}
				};
			
				this.modulePatches = {
					before: [
						"HeaderBar",
						"HeaderBarDiscovery",
						"TitleBar"
					],
					after: [
						"AuthWrapper",
						"SettingsView"
					]
				};
				
				this.css = `
					${BDFDB.dotCN.app} {
						--custom-app-top-bar-height: 0px;
					}
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.titlebar},
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.titlebarthick},
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.authboxcharacterbackground}:before,
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.authboxsplashbackground}:before {
						display: none !important;
					}
					
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.guildswrapper} {
						margin-top: 0;
						padding-top: 0;
					}

					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.guildsscroller} {
						padding-top: 4px;
					}
					
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.channelheaderheaderbar},
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.channelheaderdiscovery} {
						padding-right: 8px;
					}
					
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.channelheaderdiscoverysearchfloating} {
						position: static;
					}
					
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCN.settingswindowstandardsidebarview}:before {
						display: none;
					}
					
					${BDFDB.dotCN._oldtitlebartoolbar} {
						display: flex;
						flex: 1 0 auto;
						justify-content: flex-end;
						align-items: center;
					}
					
					${BDFDB.dotCN.titlebarthick} ~ * ${BDFDB.dotCNS._oldtitlebartoolbar + BDFDB.dotCN.channelheadericonwrapper} {
						--chat-input-icon-size: 24px;
						transform: scale(90%);
					}
					
					${BDFDB.dotCNS.chatthreadsidebaropen} > *:first-child ${BDFDB.dotCN._oldtitlebartoolbar} {
						display: none !important;
					}

					${BDFDB.dotCN._oldtitlebarsettingstoolbar} {
						display: flex;
						position: absolute;
						top: 0;
						right: 0;
						padding: 10px;
						z-index: 103;
						-webkit-app-region: drag !important;
					}
					.platform-win ${BDFDB.dotCN._oldtitlebarsettingstoolbar} {
						top: 22px;
					}
					
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCNS.authboxcharacterbackground + BDFDB.dotCN._oldtitlebarsettingstoolbar},
					${BDFDB.dotCNS._oldtitlebarenabled + BDFDB.dotCNS.authboxsplashbackground + BDFDB.dotCN._oldtitlebarsettingstoolbar} {
						background: rgba(0, 0, 0, 0.3);
						border-radius: 0 0 0 5px;
						top: 0;
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
					BDFDB.ReactUtils.forceUpdate(toolbars);
				});

				BDFDB.DOMUtils.addClass(document.body, BDFDB.disCN._oldtitlebarenabled);

				BDFDB.DiscordUtils.rerenderAll();
			}
			
			onStop () {
				BDFDB.DiscordUtils.rerenderAll();

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

					BDFDB.DiscordUtils.rerenderAll();
				}
			}
			
			processTitleBar (e) {
				titleBarButton = e.instance.props.trailing;
			}
			
			processHeaderBarDiscovery (e) {
				this.injectButtons(e.instance.props.children);
			}
			
			processHeaderBar (e) {
				if (e.instance.props.className && e.instance.props.className.indexOf("fullscreen") > -1) return;
				let wrapper = BDFDB.ReactUtils.findChild(e.instance, {props: ["toolbar", "children"]});
				if (!wrapper) return;
				let children = BDFDB.ArrayUtils.is(wrapper.props.toolbar) ? wrapper.props.toolbar : BDFDB.ObjectUtils.get(wrapper, "props.toolbar.props.children");
				if (!children) {
					children = [];
					wrapper.props.toolbar = [
						wrapper.props.toolbar,
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {children})
					];
				}
				if (titleBarButton) children.push(titleBarButton);
				this.injectButtons(children, true);
			}

			processAuthWrapper (e) {
				if (!BDFDB.ArrayUtils.is(e.returnvalue.props.children)) e.returnvalue.props.children = [e.returnvalue.props.children];
				this.injectSettingsToolbar(e.returnvalue.props.children, true);
			}

			processSettingsView (e) {
				if (!BDFDB.ArrayUtils.is(e.returnvalue.props.children)) e.returnvalue.props.children = [e.returnvalue.props.children];
				this.injectSettingsToolbar(e.returnvalue.props.children);
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
				children.push(BDFDB.ReactUtils.createElement(OldTitleBarToolbarComponent, {addFirstDivider: addFirstDivider}));
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
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
