/**
 * @name ShowConnections
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.1.9
 * @description Shows the connected Accounts of a User in the UserPopout
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ShowConnections/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ShowConnections/ShowConnections.plugin.js
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
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
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
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var _this;
		var loadedUsers, requestedUsers, queuedInstances;
		
		const UserConnectionsComponents = class UserConnections extends BdApi.React.Component {
			render() {
				if (!loadedUsers[this.props.user.id] && !requestedUsers[this.props.user.id]) {
					requestedUsers[this.props.user.id] = true;
					queuedInstances[this.props.user.id] = [].concat(queuedInstances[this.props.user.id]).filter(n => n);
					BDFDB.LibraryModules.UserProfileUtils.fetchProfile(this.props.user.id);
				}
				if (!loadedUsers[this.props.user.id]) {
					if (queuedInstances[this.props.user.id].indexOf(this) == -1) queuedInstances[this.props.user.id].push(this);
					return null;
				}
				let connections = loadedUsers[this.props.user.id].filter(c => _this.settings.connections[c.type]);
				if (!connections.length) return null;
				let isLightTheme = (!this.props.theme || this.props.theme == "light") && BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themelight;
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.UserPopoutSection, {
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Heading, {
							className: BDFDB.disCN.userpopoutsectiontitle,
							variant: "eyebrow",
							color: null,
							children: BDFDB.LanguageUtils.LanguageStrings.CONNECTIONS
						}),
						BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN._showconnectionsconnections,
							children: connections.map(c => {
								let provider = BDFDB.LibraryModules.ConnectionProviderUtils.get(c.type);
								let url = _this.settings.general.openWebpage && provider.getPlatformUserUrl && provider.getPlatformUserUrl(c);
								let metadata = [];
								if (_this.settings.general.showDetails && provider.hasMetadata && c.metadata) {
									if (c.metadata.created_at) metadata.push(BDFDB.ReactUtils.createElement("span", {children: BDFDB.LanguageUtils.LanguageStringsFormat("CONNECTIONS_PROFILE_MEMBER_SINCE", (new Date(c.metadata.created_at)).toLocaleDateString("default", {year: "numeric", month: "long", day: "numeric"}))}));
									let metadataGetter = BDFDB.LibraryModules.ConnectionMetadataUtils["get" + BDFDB.StringUtils.upperCaseFirstChar(c.type)];
									if (metadataGetter) metadata = metadata.concat(metadataGetter(c.metadata));
								}
								return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
									text: `${provider.name}: ${c.name}`,
									note: metadata && metadata.length ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
										direction: BDFDB.LibraryComponents.Flex.Direction.VERTICAL,
										children: metadata
									}): null,
									tooltipConfig: {backgroundColor: _this.settings.general.useColoredTooltips && BDFDB.ColorUtils.change(provider.color, -0.3), color: !_this.settings.general.useColoredTooltips || !provider.color ? "black" : null},
									children: BDFDB.ReactUtils.createElement(!url ? "div" : BDFDB.LibraryComponents.Anchor, Object.assign(!url ? {} : {
										href: url
									}, {
										className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._showconnectionsconnection, url && BDFDB.disCN.cursorpointer),
										onContextMenu: event => {
											BDFDB.ContextMenuUtils.open(_this, event, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
												children: [
													BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
														label: BDFDB.LanguageUtils.LibraryStringsFormat("copy", BDFDB.LanguageUtils.LanguageStrings.USER_SETTINGS_LABEL_USERNAME),
														id: BDFDB.ContextMenuUtils.createItemId(_this.name, "copy-name"),
														action: _ => BDFDB.LibraryModules.WindowUtils.copy(c.name)
													}),
													url && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
														label: BDFDB.LanguageUtils.LibraryStringsFormat("copy", BDFDB.LanguageUtils.LanguageStrings.SEARCH_ANSWER_HAS_LINK),
														id: BDFDB.ContextMenuUtils.createItemId(_this.name, "copy-url"),
														action: _ => BDFDB.LibraryModules.WindowUtils.copy(url)
													})
												]
											}));
										},
										children: [
											BDFDB.ReactUtils.createElement("img", {
												className: BDFDB.disCN._showconnectionsicon,
												alt: BDFDB.LanguageUtils.LanguageStringsFormat("IMG_ALT_LOGO", provider.name),
												src: provider.icon[_this.settings.general.useColoredIcons ? (isLightTheme ? "lightSVG" : "darkSVG" ) : "whiteSVG"]
											}),
											_this.settings.general.showVerifiedBadge && c.verified && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
												text: BDFDB.LanguageUtils.LanguageStrings.CONNECTION_VERIFIED,
												tooltipConfig: {color: "brand", type: "bottom"},
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FlowerStar, {
													className: BDFDB.disCN._showconnectionsverifiedbadge,
													size: "50%",
													color: isLightTheme ? BDFDB.DiscordConstants.Colors.PRIMARY_200 : BDFDB.DiscordConstants.Colors.PRIMARY,
													children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
														name: BDFDB.LibraryComponents.SvgIcon.Names.CHECKMARK,
														width: "70%",
														height: "70%",
														color: isLightTheme ? BDFDB.DiscordConstants.Colors.PRIMARY_500 : BDFDB.DiscordConstants.Colors.WHITE
													})
												})
											})
										]
									}))
								});
							})
						})
					]
				});
			}
		};
		
		return class ShowConnections extends Plugin {
			onLoad () {
				_this = this;
				loadedUsers = {};
				requestedUsers = {};
				queuedInstances = {};
				
				this.modulePatches = {
					after: [
						"UserConnectionsSection"
					]
				};
				
				this.defaults = {
					general: {
						useColoredIcons:	{value: true, 	description: "Uses colored Version of the Icons"},
						useColoredTooltips:	{value: true, 	description: "Uses colored Version of the Tooltips"},
						showDetails:		{value: true, 	description: "Shows Details of Connection on hover"},
						showVerifiedBadge:	{value: true, 	description: "Shows the Badge for verified Connections"},
						openWebpage:		{value: true, 	description: "Opens the Connection Page when clicking the Icon"}
					},
					connections: {}
				};
				
				for (let connection of BDFDB.LibraryModules.ConnectionProviderUtils.filter(n => n)) this.defaults.connections[connection.type] = Object.assign({}, connection, {value: true});
				
				this.css = `
					${BDFDB.dotCN._showconnectionsconnections} {
						display: flex;
						flex-wrap: wrap;
					}
					${BDFDB.dotCN._showconnectionsconnection} {
						position: relative;
						width: 28px;
						height: 28px;
						margin: 4px 10px 6px 0;
					}
					${BDFDB.dotCN._showconnectionsicon} {
						margin: -15% 0 0 -15%;
						width: 130%;
						height: 130%;
					}
					${BDFDB.dotCN._showconnectionsverifiedbadge} {
						position: absolute;
						bottom: -10%;
						right: -10%;
					}
				`;
			}
			
			onStart () {				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.DispatchApiUtils, "dispatch", {after: e => {
					if (BDFDB.ObjectUtils.is(e.methodArguments[0]) && e.methodArguments[0].type == "USER_PROFILE_FETCH_SUCCESS" && e.methodArguments[0].user && e.methodArguments[0].connected_accounts) {
						const user = e.methodArguments[0].user;
						delete requestedUsers[user.id];
						loadedUsers[user.id] = e.methodArguments[0].connected_accounts;
						BDFDB.ReactUtils.forceUpdate(queuedInstances[user.id]);
						delete queuedInstances[user.id];
					}
				}});
			}
			
			onStop () {}

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
							value: this.settings.general[key]
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Display Connections:",
							children: Object.keys(this.defaults.connections).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["connections", key],
								label: this.defaults.connections[key].name,
								value: this.settings.connections[key],
								labelChildren: [
									BDFDB.ReactUtils.createElement("img", {style: {width: 28, height: 28}, src: this.defaults.connections[key].icon.lightSVG}),
									BDFDB.ReactUtils.createElement("img", {style: {width: 28, height: 28}, src: this.defaults.connections[key].icon.whiteSVG})
								]
							}))
						}));
						
						return settingsItems;
					}
				});
			}

			processUserConnectionsSection (e) {
				let user = e.instance.props.user || BDFDB.LibraryStores.UserStore.getUser(e.instance.props.userId);
				if (!user || user.isNonUserBot()) return;
				e.returnvalue = [
					e.returnvalue,
					BDFDB.ReactUtils.createElement(UserConnectionsComponents, {
						user: user,
						theme: e.instance.props.theme
					}, true)
				];
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
