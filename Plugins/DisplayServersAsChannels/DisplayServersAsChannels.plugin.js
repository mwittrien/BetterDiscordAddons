/**
 * @name DisplayServersAsChannels
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/DisplayServersAsChannels
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/DisplayServersAsChannels/DisplayServersAsChannels.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/DisplayServersAsChannels/DisplayServersAsChannels.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "DisplayServersAsChannels",
			"author": "DevilBro",
			"version": "1.4.6",
			"description": "Display servers in a similar way as channels"
		},
		"changeLog": {
			"fixed": {
				"Works again": "Can discord stop messing with the server list, jeez"
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
				if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin, try again later or download it manually from GitHub: https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/");
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
		var settings = {}, amounts = {};
	
		return class DisplayServersAsChannels extends Plugin {
			onLoad () {
				this.defaults = {
					settings: {
						showGuildIcon:					{value: true, 	description: "Show a icon for servers"},
					},
					amounts: {
						serverListWidth:				{value: 240, 	min: 45,		description: "Server list width in px: "},
						serverElementHeight:			{value: 32, 		min: 16,		description: "Server element height in px: "}
					}
				};
				
				this.patchPriority = 10;

				this.patchedModules = {
					after: {
						Guilds: "render",
						DefaultHomeButton: "render",
						DirectMessage: "render",
						Guild: "render",
						GuildFolder: "type",
						CircleIconButton: "render",
						UnavailableGuildsButton: "UnavailableGuildsButton"
					}
				};
			}
			
			onStart () {
				BDFDB.DOMUtils.addClass(document.body, BDFDB.disCN._displayserversaschannelsstyled);

				BDFDB.PatchUtils.patch(this, BDFDB.LibraryComponents.GuildComponents.Guild.prototype, "render", {after: e => {
					if (e.thisObject.props.list) this.processGuild({instance: e.thisObject, returnvalue: e.returnValue, methodname: "render"});
				}});

				this.forceUpdateAll();
				this.addCSS();
			}
			
			onStop () {
				BDFDB.DOMUtils.removeClassFromDOM(BDFDB.disCN._displayserversaschannelsstyled);

				BDFDB.DOMUtils.removeLocalStyle("DSACStyle" + this.name);

				this.forceUpdateAll();
			}
		
			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}));
				for (let key in amounts) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "TextInput",
					childProps: {
						type: "number"
					},
					plugin: this,
					keys: ["amounts", key],
					label: this.defaults.amounts[key].description,
					basis: "20%",
					min: this.defaults.amounts[key].min,
					max: this.defaults.amounts[key].max,
					value: amounts[key]
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
					this.addCSS();
				}
			}
		
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
				amounts = BDFDB.DataUtils.get(this, "amounts");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.GuildUtils.rerenderAll();
			}
		
			processGuilds (e) {
				if (typeof e.returnvalue.props.children == "function") {
					let childrenRender = e.returnvalue.props.children;
					e.returnvalue.props.children = (...args) => {
						let children = childrenRender(...args);
						this.checkTree(children);
						return children;
					};
				}
				else this.checkTree(e.returnvalue);
			}
			
			checkTree (returnvalue) {
				let tree = BDFDB.ReactUtils.findChild(returnvalue, {filter: n => n && n.props && typeof n.props.children == "function"});
				if (tree) {
					let childrenRender = tree.props.children;
					tree.props.children = (...args) => {
						let children = childrenRender(...args);
						this.handleGuilds(children);
						return children;
					};
				}
				else this.handleGuilds(returnvalue);
			}
			
			handleGuilds (returnvalue) {
				let [errorChildren, errorIndex] = BDFDB.ReactUtils.findParent(returnvalue, {name: "FluxContainer(<Unknown>)"});
				if (errorIndex > -1) errorChildren[errorIndex] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Items.UnavailableGuildsButton, {
					unavailableGuilds: BDFDB.LibraryModules.GuildUnavailableStore.totalUnavailableGuilds
				});
				let scroller = BDFDB.ReactUtils.findChild(returnvalue, {props: [["className", BDFDB.disCN.guildsscroller]]});
				if (scroller) {
					scroller.props.fade = true;
					scroller.type = BDFDB.LibraryComponents.Scrollers.Thin;
				}
			}
			
			processDefaultHomeButton (e) {
				this.removeTooltip(e.returnvalue);
				this.removeMask(e.returnvalue);
				this.addElementName(e.returnvalue, BDFDB.LanguageUtils.LanguageStrings.HOME);
			}
			
			processDirectMessage (e) {
				if (e.instance.props.channel.id) {
					let text = BDFDB.ReactUtils.findValue(e.returnvalue, "text");
					this.removeTooltip(e.returnvalue);
					this.removeMask(e.returnvalue);
					this.addElementName(e.returnvalue, text, {
						isDm: true
					});
				}
			}
			
			processGuild (e) {
				if (e.instance.props.guild) {
					if (!BDFDB.BDUtils.isPluginEnabled("ServerDetails")) this.removeTooltip(e.returnvalue);
					this.removeMask(e.returnvalue);
					this.addElementName(e.returnvalue, e.instance.props.guild.name, {
						badges: [
							settings.showGuildIcon && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Icon, {
								animate: e.instance.props.animatable && e.instance.state && e.instance.state.hovered,
								guild: e.instance.props.guild,
								size: BDFDB.LibraryComponents.GuildComponents.Icon.Sizes.SMALLER
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Badge, {
								size: amounts.serverElementHeight * 0.5,
								badgeColor: BDFDB.DiscordConstants.Colors.STATUS_GREY,
								tooltipColor: BDFDB.LibraryComponents.TooltipContainer.Colors.BLACK,
								tooltipPosition: BDFDB.LibraryComponents.TooltipContainer.Positions.RIGHT,
								guild: e.instance.props.guild
							})
						]
					});
				}
			}
			
			processGuildFolder (e) {
				if (e.instance.props.folderId) {
					this.removeTooltip(e.returnvalue);
					this.removeMask(e.returnvalue);
					let folderColor = BDFDB.ColorUtils.convert(e.instance.props.folderColor, "HEX") || "var(--bdfdb-blurple)";
					let folderSize = Math.round(amounts.serverElementHeight * 0.6);
					this.addElementName(e.returnvalue, e.instance.props.folderName || BDFDB.LanguageUtils.LanguageStrings.SERVER_FOLDER_PLACEHOLDER, {
						wrap: true,
						backgroundColor: e.instance.props.expanded && BDFDB.ColorUtils.setAlpha(folderColor, 0.2),
						badges: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							color: folderColor,
							width: folderSize,
							height: folderSize,
							name: BDFDB.LibraryComponents.SvgIcon.Names.FOLDER
						})
					});
				}
			}
			
			processCircleIconButton (e) {
				this.removeTooltip(e.returnvalue);
				this.removeMask(e.returnvalue);
				this.addElementName(e.returnvalue, e.instance.props.tooltipText, {
					wrap: true,
					backgroundColor: "transparent"
				});
			}
			
			processUnavailableGuildsButton (e) {
				this.removeTooltip(e.returnvalue);
				this.addElementName(e.returnvalue, `${e.instance.props.unavailableGuilds} ${e.instance.props.unavailableGuilds == 1 ? "Server" : "Servers"}`, {
					wrap: true,
					backgroundColor: "transparent"
				});
			}
			
			removeTooltip (parent) {
				let [children, index] = BDFDB.ReactUtils.findParent(parent, {name: ["Tooltip", "ListItemTooltip", "GuildTooltip", "BDFDB_TooltipContainer"]});
				if (index > -1) children[index] = children[index].props.children;
			}
			
			removeMask (parent) {
				let [children, index] = BDFDB.ReactUtils.findParent(parent, {name: "BlobMask"});
				if (index > -1) {
					let badges = [];
					for (let key of Object.keys(children[index].props)) {
						if (key && key.endsWith("Badge") && BDFDB.ReactUtils.isValidElement(children[index].props[key])) badges.push(children[index].props[key]);
					}
					if (badges.length) {
						let insertBadges = returnvalue => {
							if (returnvalue.props.children) (returnvalue.props.children[0] || returnvalue.props.children).props.children = [
								(returnvalue.props.children[0] || returnvalue.props.children).props.children,
								badges
							].flat(10).filter(n => n);
							else returnvalue.props.children = [badges];
						};
						if (children[index].props.children && children[index].props.children.props && typeof children[index].props.children.props.children == "function") {
							let childrenRender = children[index].props.children.props.children;
							children[index].props.children.props.children = (...args) => {
								let renderedChildren = childrenRender(...args);
								insertBadges(renderedChildren);
								return renderedChildren;
							};
						}
						else insertBadges(children[index]);
					}
					children[index] = children[index].props.children;
				}
			}
			
			addElementName (parent, name, options = {}) {
				let [children, index] = BDFDB.ReactUtils.findParent(parent, {
					name: ["NavItem", "Clickable"],
					props: [["className", BDFDB.disCN.guildserrorinner]],
					filter: c => c && c.props && (c.props.id == "home" || !isNaN(parseInt(c.props.id)))
				});
				if (index > -1) {
					let insertElements = returnvalue => {
						let childEles = [
							[
								options.isDm && returnvalue.props.icon && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.AvatarComponents.default, {
									src: returnvalue.props.icon,
									size: BDFDB.LibraryComponents.AvatarComponents.Sizes.SIZE_24
								}),
								options.badges,
							].flat(10).filter(n => n).map(badge => BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN._displayserversaschannelsbadge,
								children: badge
							})),
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN._displayserversaschannelsname,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
									children: name
								})
							}),
							[returnvalue.props.children].flat(10).filter(n => !(n && (n.type && n.type.displayName ==  "FolderIcon" || n.props && n.props.className && n.props.className.indexOf(BDFDB.disCN.guildfoldericonwrapper) > -1)))
						].flat().filter(n => n);
						delete returnvalue.props.icon;
						delete returnvalue.props.name;
						returnvalue.props.children = options.wrap ? BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.guildiconchildwrapper,
							style: {backgroundColor: options.backgroundColor},
							children: childEles
						}) : childEles;
					};
					if (typeof children[index].props.children == "function") {
						let childrenRender = children[index].props.children;
						children[index].props.children = (...args) => {
							let renderedChildren = childrenRender(...args);
							insertElements(renderedChildren);
							return renderedChildren;
						};
					}
					else insertElements(children[index]);
				}
			}

			addCSS () {
				BDFDB.DOMUtils.appendLocalStyle("DSACStyle" + this.name, `
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.guildswrapper},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildsscroller},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildswrapperunreadmentionsbartop},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildswrapperunreadmentionsbarbottom} {
						width: ${amounts.serverListWidth}px;
					}
					
					${BDFDB.dotCNS.themedark + BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildsscroller}::-webkit-scrollbar-thumb,
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.guildswrapper + BDFDB.dotCNS.themedark + BDFDB.dotCN.guildsscroller}::-webkit-scrollbar-thumb {
						background-color: ${BDFDB.DiscordConstants.Colors.PRIMARY_DARK_800};
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildouter} {
						width: auto;
						display: flex;
						justify-content: flex-start;
						margin-left: 8px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildsscroller} > div[style*="transform"][style*="height"] {
						height: unset !important;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildpillwrapper} {
						top: ${-1 * (48 - amounts.serverElementHeight) / 2}px;
						left: -8px;
						transform: scaleY(calc(${amounts.serverElementHeight}/48));
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildiconchildwrapper} {
						height: ${amounts.serverElementHeight}px;
						width: ${amounts.serverListWidth - 20}px;
						padding: 0 8px;
						box-sizing: border-box;
						cursor: pointer;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCN._displayserversaschannelsname} {
						flex: 1 1 auto;
						font-size: ${amounts.serverElementHeight / 2}px;
						font-weight: 400;
						padding-top: 1px;
						overflow: hidden;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCN._displayserversaschannelsbadge}:not(:empty) {
						display: flex;
						margin-right: 4px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCNS._displayserversaschannelsbadge + BDFDB.dotCN.avataricon} {
						width: ${amounts.serverElementHeight/32 * 24}px;
						height: ${amounts.serverElementHeight/32 * 24}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCN.badgebase} {
						margin-left: 4px;
						border-radius: ${amounts.serverElementHeight/32 * 8}px;
						width: ${amounts.serverElementHeight/32 * 16}px;
						height: ${amounts.serverElementHeight/32 * 16}px;
						font-size: ${amounts.serverElementHeight/32 * 12}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCN.badgebase}[style*="width: 16px;"] {
						width: ${amounts.serverElementHeight/32 * 16}px !important;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCN.badgebase}[style*="width: 22px;"] {
						width: ${amounts.serverElementHeight/32 * 22}px !important;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCN.badgebase}[style*="width: 30px;"] {
						width: ${amounts.serverElementHeight/32 * 30}px !important;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.homebuttonicon} {
						width: ${amounts.serverElementHeight/32 * 28}px;
						height: ${amounts.serverElementHeight/32 * 20}px;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.avatarwrapper} {
						width: ${amounts.serverElementHeight/32 * 24}px !important;
						height: ${amounts.serverElementHeight/32 * 24}px !important;
					}
					
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildseparator} {
						width: ${amounts.serverListWidth - 20}px;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildiconwrapper} {
						height: ${amounts.serverElementHeight}px;
						width: ${amounts.serverListWidth - 20}px;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfolderwrapper} {
						width: auto;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfolder} {
						height: ${amounts.serverElementHeight}px;
						width: ${amounts.serverListWidth - 20}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfolderexpandedbackground} {
						top: -2px;
						right: 2px;
						bottom: -2px;
						left: 6px;
						width: auto;
						border-radius: 4px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfolderwrapper} [role="group"] {
						height: auto !important;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfolderwrapper} [role="group"] ${BDFDB.dotCN.guildouter}:last-child {
						margin-bottom: 10px;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildbuttoninner} {
						height: ${amounts.serverElementHeight}px;
						width: ${amounts.serverListWidth - 20}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildbuttoninner} svg {
						width: ${amounts.serverElementHeight/32 * 20}px;
						height: ${amounts.serverElementHeight/32 * 20}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildbuttoninner + BDFDB.dotCN._displayserversaschannelsname} {
						padding-top: 0;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildserror} {
						height: ${amounts.serverElementHeight}px;
						width: ${amounts.serverListWidth - 20}px;
						font-size: ${amounts.serverElementHeight/32 * 20}px;
						border: none;
						display: block;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildserror + BDFDB.dotCN.guildiconchildwrapper} {
						padding-right: ${amounts.serverElementHeight/32 * 16 + (32/amounts.serverElementHeight - 1) * 4}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildserror + BDFDB.dotCN._displayserversaschannelsname} {
						padding-top: 0;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._readallnotificationsbuttonframe},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._readallnotificationsbuttoninner},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._readallnotificationsbuttonbutton},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.guildswrapper} #bd-pub-li,
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.guildswrapper} #bd-pub-button {
						height: ${amounts.serverElementHeight}px !important;
						width: ${amounts.serverListWidth - 20}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._friendnotificationsfriendsonline},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildslabel} {
						height: ${amounts.serverElementHeight * 0.6}px !important;
						width: ${amounts.serverListWidth - 20}px;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._readallnotificationsbuttonbutton},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._friendnotificationsfriendsonline},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildslabel},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.guildswrapper} #bd-pub-button {
						display: flex;
						justify-content: flex-start;
						align-items: center;
						font-size: ${amounts.serverElementHeight / 2}px;
						font-weight: 400;
						text-transform: capitalize;
						padding-top: 1px;
						padding-left: 8px;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildiconwrapper},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildfolder},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildbuttoninner},
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildserror} {
						border-radius: 4px;
						overflow: hidden;
					}

					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.appcontainer} {
						display: flex !important;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.guildswrapper} {
						position: static !important;
						contain: unset !important;
					}
					${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.chatbase} {
						position: static !important;
						contain: unset !important;
						width: 100% !important;
					}
					
					#server-search ${BDFDB.dotCN.guildinner} {
						width: ${amounts.serverListWidth - 20}px;
						height: ${amounts.serverElementHeight}px;
						border-radius: 4px !important;
					}
					#server-search ${BDFDB.dotCN.guildinner}::before {
						content: "Server Search";
						color: var(--text-normal);
						display: flex;
						align-items: center;
						height: ${amounts.serverElementHeight}px;
						font-size: ${amounts.serverElementHeight / 2}px;
						font-weight: 400;
						padding-left: 8px;
					}
					#server-search ${BDFDB.dotCN.guildinner}::after {
						content: "";
						position: absolute;
						top: ${amounts.serverElementHeight/32 * 6}px;
						right: 7px;
						width: ${amounts.serverElementHeight/32 * 20}px;
						height: ${amounts.serverElementHeight/32 * 20}px;
						background: var(--text-normal);
						-webkit-mask: url('data:image/svg+xml;base64,PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAxOCAxOCI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSJ3aGl0ZSIgZD0iTTMuNjAwOTE0ODEsNy4yMDI5NzMxMyBDMy42MDA5MTQ4MSw1LjIwOTgzNDE5IDUuMjA5ODM0MTksMy42MDA5MTQ4MSA3LjIwMjk3MzEzLDMuNjAwOTE0ODEgQzkuMTk2MTEyMDYsMy42MDA5MTQ4MSAxMC44MDUwMzE0LDUuMjA5ODM0MTkgMTAuODA1MDMxNCw3LjIwMjk3MzEzIEMxMC44MDUwMzE0LDkuMTk2MTEyMDYgOS4xOTYxMTIwNiwxMC44MDUwMzE0IDcuMjAyOTczMTMsMTAuODA1MDMxNCBDNS4yMDk4MzQxOSwxMC44MDUwMzE0IDMuNjAwOTE0ODEsOS4xOTYxMTIwNiAzLjYwMDkxNDgxLDcuMjAyOTczMTMgWiBNMTIuMDA1NzE3NiwxMC44MDUwMzE0IEwxMS4zNzMzNTYyLDEwLjgwNTAzMTQgTDExLjE0OTIyODEsMTAuNTg4OTA3OSBDMTEuOTMzNjc2NCw5LjY3NjM4NjUxIDEyLjQwNTk0NjMsOC40OTE3MDk1NSAxMi40MDU5NDYzLDcuMjAyOTczMTMgQzEyLjQwNTk0NjMsNC4zMjkzMzEwNSAxMC4wNzY2MTUyLDIgNy4yMDI5NzMxMywyIEM0LjMyOTMzMTA1LDIgMiw0LjMyOTMzMTA1IDIsNy4yMDI5NzMxMyBDMiwxMC4wNzY2MTUyIDQuMzI5MzMxMDUsMTIuNDA1OTQ2MyA3LjIwMjk3MzEzLDEyLjQwNTk0NjMgQzguNDkxNzA5NTUsMTIuNDA1OTQ2MyA5LjY3NjM4NjUxLDExLjkzMzY3NjQgMTAuNTg4OTA3OSwxMS4xNDkyMjgxIEwxMC44MDUwMzE0LDExLjM3MzM1NjIgTDEwLjgwNTAzMTQsMTIuMDA1NzE3NiBMMTQuODA3MzE4NSwxNiBMMTYsMTQuODA3MzE4NSBMMTIuMjEwMjUzOCwxMS4wMDk5Nzc2IEwxMi4wMDU3MTc2LDEwLjgwNTAzMTQgWiI+PC9wYXRoPjwvZz48L3N2Zz4=') center/cover no-repeat;
					}
					#server-search ${BDFDB.dotCN.guildbuttonpill},
					#server-search ${BDFDB.dotCN.guildsvg} {
						display: none;
					}`);
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
