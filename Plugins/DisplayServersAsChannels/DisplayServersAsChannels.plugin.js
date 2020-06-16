//META{"name":"DisplayServersAsChannels","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/DisplayServersAsChannels","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/DisplayServersAsChannels/DisplayServersAsChannels.plugin.js"}*//

var DisplayServersAsChannels = (_ => {
	var amounts = {};
	
	return class DisplayServersAsChannels {
		getName () {return "DisplayServersAsChannels";}

		getVersion () {return "1.3.5";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Display servers in a similar way as channels.";}

		constructor () {
			this.changelog = {
				"fixed":[["Silent updates? NANI!","Fixed for discords sneaky updates"]]
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

		initConstructor () {
			this.defaults = {
				amounts: {
					serverListWidth:				{value:240, 	min:45,		description:"Server list width in px:"},
					serverElementHeight:			{value:32, 		min:16,		description:"Server element height in px:"}
				}
			};
		}
		
		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let amounts = BDFDB.DataUtils.get(this, "amounts");
			let settingsPanel, settingsItems = [];
			
			for (let key in amounts) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
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

				BDFDB.DOMUtils.addClass(document.body, BDFDB.disCN._displayserversaschannelsstyled);

				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryComponents.GuildComponents.Guild.prototype, "render", {after: e => {
					if (e.thisObject.props.list) this.processGuild({instance:e.thisObject, returnvalue:e.returnValue, methodname:"render"});
				}});

				this.forceUpdateAll();
				this.addCSS();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.DOMUtils.removeClassFromDOM(BDFDB.disCN._displayserversaschannelsstyled);

				BDFDB.DOMUtils.removeLocalStyle("DSACStyle" + this.name);

				this.forceUpdateAll();

				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
				this.addCSS();
			}
		}
		
		processGuilds (e) {
			let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "FluxContainer(<Unknown>)"});
			if (index > -1) children[index] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Items.UnavailableGuildsButton, {
				unavailableGuilds: BDFDB.LibraryModules.GuildUnavailableStore.totalUnavailableGuilds
			});
		}
		
		processDefaultHomeButton (e) {
			this.removeTooltip(e.returnvalue);
			this.removeMask(e.returnvalue);
			this.addElementName(e.returnvalue, BDFDB.LanguageUtils.LanguageStrings.HOME);
		}
		
		processDirectMessage (e) {
			if (e.instance.props.channel.id) {
				let text = BDFDB.ReactUtils.findValue(e.returnvalue, "text");
				let icon = BDFDB.ReactUtils.findValue(e.returnvalue, "icon");
				this.removeTooltip(e.returnvalue);
				this.removeMask(e.returnvalue);
				this.addElementName(e.returnvalue, text, {
					badge: icon && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Avatar, {
						src: icon,
						size: BDFDB.LibraryComponents.Avatar.Sizes.SIZE_24,
					})
				});
			}
		}
		
		processGuild (e) {
			if (e.instance.props.guild) {
				this.removeTooltip(e.returnvalue);
				this.removeMask(e.returnvalue);
				this.addElementName(e.returnvalue, e.instance.props.guild.name, {
					badge: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Badge, {
						size: amounts.serverElementHeight * 0.5,
						badgeColor: BDFDB.DiscordConstants.Colors.STATUS_GREY,
						tooltipColor: BDFDB.LibraryComponents.TooltipContainer.Colors.BLACK,
						tooltipPosition: BDFDB.LibraryComponents.TooltipContainer.Positions.RIGHT,
						guild: e.instance.props.guild
					})
				});
			}
		}
		
		processGuildFolder (e) {
			if (e.instance.props.folderId) {
				this.removeTooltip(e.returnvalue);
				this.removeMask(e.returnvalue);
				let folderColor = BDFDB.ColorUtils.convert(e.instance.props.folderColor, "HEX") || BDFDB.DiscordConstants.Colors.BRAND;
				let folderSize = Math.round(amounts.serverElementHeight * 0.6);
				this.addElementName(e.returnvalue, e.instance.props.folderName || BDFDB.LanguageUtils.LanguageStrings.SERVER_FOLDER_PLACEHOLDER, {
					wrap: true,
					backgroundColor: e.instance.props.expanded && BDFDB.ColorUtils.setAlpha(folderColor, 0.2),
					badge: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
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
				for (let key of Object.keys(children[index].props)) if (key && key.endsWith("Badge") && BDFDB.ReactUtils.isValidElement(children[index].props[key])) badges.push(children[index].props[key]);
				(children[index].props.children[0] || children[index].props.children).props.children = [
					(children[index].props.children[0] || children[index].props.children).props.children,
					badges
				].flat(10).filter(n => n);
				children[index] = children[index].props.children;
			}
		}
		
		addElementName (parent, name, options = {}) {
			let [children, index] = BDFDB.ReactUtils.findParent(parent, {name: ["NavItem", "Clickable"], props:[["className",BDFDB.disCN.guildserrorinner]]});
			if (index > -1) {
				delete children[index].props.icon;
				delete children[index].props.name;
				let [children2, index2] = BDFDB.ReactUtils.findParent(children[index].props.children, {name:"FolderIcon", props:[["className",BDFDB.disCN.guildfoldericonwrapper]]});
				if (index2 > -1) children2.splice(index2, 1);
				let childEles = [
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._displayserversaschannelsbadge,
						children: options.badge
					}),
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._displayserversaschannelsname,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
							children: name
						})
					}),
					children[index].props.children
				].flat().filter(n => n);
				children[index].props.children = options.wrap ? BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN.guildiconchildwrapper,
					style: {backgroundColor: options.backgroundColor},
					children: childEles
				}) : childEles;
				
			}
		}
		
		forceUpdateAll() {
			amounts = BDFDB.DataUtils.get(this, "amounts");
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
			BDFDB.GuildUtils.rerenderAll();
		}

		addCSS () {
			BDFDB.DOMUtils.appendLocalStyle("DSACStyle" + this.name, `
				${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCN.guildswrapper},
				${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildsscrollerwrap},
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
				${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildpillwrapper} {
					top: -${(48 - amounts.serverElementHeight) / 2}px;
					left: -8px;
					transform: scaleY(calc(${amounts.serverElementHeight}/48));
				}
				${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN.guildiconchildwrapper} {
					height: ${amounts.serverElementHeight}px;
					width: ${amounts.serverListWidth - 20}px;
					padding: 0 8px;
					box-sizing: border-box;
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
				${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCNS.guildiconchildwrapper + BDFDB.dotCN.badgebase} {
					margin-left: 4px;
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
					bottom: -2px;
					left: 6px;
					right: 2px;
					width: auto;
					border-radius: 4px;
					margin-bottom: 10px;
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
				${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._friendnotificationsfriendsonline} {
					height: ${amounts.serverElementHeight * 0.6}px !important;
					width: ${amounts.serverListWidth - 20}px;
				}
				${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._readallnotificationsbuttonbutton},
				${BDFDB.dotCNS._displayserversaschannelsstyled + BDFDB.dotCNS.guildswrapper + BDFDB.dotCN._friendnotificationsfriendsonline},
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
				}`);
		}
	}
})();