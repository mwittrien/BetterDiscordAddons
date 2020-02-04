//META{"name":"ShowImageDetails","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ShowImageDetails","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ShowImageDetails/ShowImageDetails.plugin.js"}*//

var ShowImageDetails = (_ => {
	return class ShowImageDetails {
		getName () {return "ShowImageDetails";}

		getVersion () {return "1.2.1";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Display the name, size and dimensions of uploaded images in the chat as an header or as a tooltip.";}

		constructor () {
			this.changelog = {
				"fixed":[["Message Update","Fixed the plugin for the new Message Update"],["Scroll issue fixed","Loading images would collapse to 0 height and screw up the chat scroller"]],
				"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
			};

			this.patchedModules = {
				before: {
					LazyImage: "render"
				},
				after: {
					LazyImage: "render"
				}
			};
		}

		initConstructor () {
			this.css = `
				${BDFDB.dotCN._showimagedetailsdetailsadded},
				${BDFDB.dotCN._showimagedetailsdetailsadded}:hover {
					text-decoration: none;
					height: unset !important;
					width: unset !important;
				}
				${BDFDB.dotCN._showimagedetailsdetailsadded} img {
					position: relative !important;
				}
				${BDFDB.dotCN._showimagedetailsdetails} {
					margin: 5px 0;
				}
				${BDFDB.dotCNS.spoilerhidden + BDFDB.dotCN._showimagedetailsdetails} {
					visibility: hidden;
					max-width: 1px;
				}
			`;
			
			this.defaults = {
				settings: {
					showOnHover:	{value:false, 	description:"Show the details as Tooltip instead:"}
				},
				amounts: {
					hoverDelay:		{value:0, 		min:0,	description:"Tooltip delay in millisec:"}
				}
			};
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let amounts = BDFDB.DataUtils.get(this, "amounts");
			let settingspanel, settingsitems = [];
			
			for (let key in settings) settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
			}));
			
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
				className: BDFDB.disCN.marginbottom8
			}));
			
			for (let key in amounts) settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "TextInput",
				childProps: {
					type: "number"
				},
				plugin: this,
				keys: ["amounts", key],
				label: this.defaults.amounts[key].description,
				basis: "50%",
				min: this.defaults.amounts[key].min,
				max: this.defaults.amounts[key].max,
				value: amounts[key]
			}));
			
			return settingspanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
		}

		//legacy
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

				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;
				
				BDFDB.ModuleUtils.forceAllUpdates(this);

				BDFDB.PluginUtils.clear(this);
			}
		}


		// begin of own functions

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
		}

		processLazyImage (e) {
			if (e.instance.props.original && e.instance.props.src.indexOf("https://media.discordapp.net/attachments") == 0 && e.instance.state && e.instance.state.readyState == "READY") {
				if (!e.returnvalue) e.instance.props.className = BDFDB.DOMUtils.formatClassName(e.instance.props.className, BDFDB.disCN._showimagedetailsdetailsadded);
				else if (typeof e.returnvalue.props.children == "function") {
					let attachment = BDFDB.ReactUtils.findValue(e.instance, "attachment", {up:true});
					if (!attachment) return;
					let settings = BDFDB.DataUtils.get(this, "settings");
					let amounts = BDFDB.DataUtils.get(this, "amounts");
					let renderChildren = e.returnvalue.props.children;
					e.returnvalue.props.children = (...args) => {
						let renderedChildren = renderChildren(...args);
						if (settings.showOnHover) return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: `${attachment.filename}\n${BDFDB.NumberUtils.formatBytes(attachment.size)}\n${attachment.width}x${attachment.height}px`,
							tooltipConfig: {
								type: "right",
								delay: amounts.hoverDelay
							},
							children: renderedChildren
						});
						else return [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
								className: BDFDB.disCN._showimagedetailsdetails,
								children: [
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
											title: e.instance.props.original,
											href: e.instance.props.original,
											children: attachment.filename,
											onClick: event => {
												BDFDB.ListenerUtils.stopEvent(event);
												BDFDB.DiscordUtils.openLink(e.instance.props.original);
											}
										})
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
											color: BDFDB.LibraryComponents.TextElement.Colors.PRIMARY,
											children: BDFDB.NumberUtils.formatBytes(attachment.size)
										})
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
											color: BDFDB.LibraryComponents.TextElement.Colors.PRIMARY,
											children: `${attachment.width}x${attachment.height}px`
										})
									})
								]
							}),
							renderedChildren
						];
					};
				}
			}
		}
	}
})();