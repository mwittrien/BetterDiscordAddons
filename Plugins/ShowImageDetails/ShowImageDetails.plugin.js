//META{"name":"ShowImageDetails","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ShowImageDetails","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ShowImageDetails/ShowImageDetails.plugin.js"}*//

var ShowImageDetails = (_ => {
	const ImageDetails = class ImageDetails extends BdApi.React.Component {
		componentDidMount() {
			this.props.attachment = BDFDB.ReactUtils.findValue(BDFDB.ReactUtils.getValue(this, "_reactInternalFiber.return"), "attachment", {up: true});
			BDFDB.ReactUtils.forceUpdate(this);
		}
		componentDidUpdate() {
			if ((!this.props.attachment || !this.props.attachment.size) && !this.props.loaded) {
				this.props.loaded = true;
				this.props.attachment = BDFDB.ReactUtils.findValue(BDFDB.ReactUtils.getValue(this, "_reactInternalFiber.return"), "attachment", {up: true});
				BDFDB.ReactUtils.forceUpdate(this);
			}
		}
		render() {
			return !this.props.attachment ? null : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
				className: BDFDB.disCN._showimagedetailsdetails,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
							title: this.props.original,
							href: this.props.original,
							children: this.props.attachment.filename,
							onClick: event => {
								BDFDB.ListenerUtils.stopEvent(event);
								BDFDB.DiscordUtils.openLink(this.props.original);
							}
						})
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
							color: BDFDB.LibraryComponents.TextElement.Colors.PRIMARY,
							children: BDFDB.NumberUtils.formatBytes(this.props.attachment.size)
						})
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
							color: BDFDB.LibraryComponents.TextElement.Colors.PRIMARY,
							children: `${this.props.attachment.width}x${this.props.attachment.height}px`
						})
					})
				]
			});
		}
	};
	
	return class ShowImageDetails {
		getName () {return "ShowImageDetails";}

		getVersion () {return "1.2.9";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Display the name, size and dimensions of uploaded images in the chat as an header or as a tooltip.";}

		constructor () {
			this.changelog = {
				"fixed":[["Image Link","Clicking an image link in the details now properly opens the image in a new window"]],
				"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
			};

			this.patchedModules = {
				after: {
					LazyImage: "render"
				}
			};
		}

		initConstructor () {
			this.css = `
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
				
				BDFDB.ModuleUtils.patch(this, (BDFDB.ModuleUtils.findByName("renderImageComponent", false).exports || {}), "renderImageComponent", {after: e => {
					if (e.returnValue && e.returnValue.type && (e.returnValue.type.displayName == "LazyImageZoomable" || e.returnValue.type.displayName == "LazyImage") && e.methodArguments[0].original && e.methodArguments[0].src.indexOf("https://media.discordapp.net/attachments") == 0) return this.injectImageDetails(e.methodArguments[0], e.returnValue);
				}});

				BDFDB.MessageUtils.rerenderAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.MessageUtils.rerenderAll();

				BDFDB.PluginUtils.clear(this);
			}
		}


		// begin of own functions

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				BDFDB.MessageUtils.rerenderAll();
			}
		}
		
		injectImageDetails (props, child) {
			let settings = BDFDB.DataUtils.get(this, "settings");
			if (!settings.showOnHover) {
				props.detailsAdded = true;
				return BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN.embedwrapper,
					children: [
						BDFDB.ReactUtils.createElement(ImageDetails, {
							original: props.original,
							attachment: {
								height: 0,
								width: 0,
								filename: "unknown.png"
							}
						}),
						child
					]
				});
			}
			return child;
		}
		
		processLazyImage (e) {
			if (e.instance.props.original && e.instance.props.src.indexOf("https://media.discordapp.net/attachments") == 0 && typeof e.returnvalue.props.children == "function") {
				let attachment = BDFDB.ReactUtils.findValue(e.instance, "attachment", {up:true});
				if (!attachment) return;
				let settings = BDFDB.DataUtils.get(this, "settings");
				if (settings.showOnHover) {
					let amounts = BDFDB.DataUtils.get(this, "amounts");
					let renderChildren = e.returnvalue.props.children;
					e.returnvalue.props.children = (...args) => {
						return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: `${attachment.filename}\n${BDFDB.NumberUtils.formatBytes(attachment.size)}\n${attachment.width}x${attachment.height}px`,
							tooltipConfig: {
								type: "right",
								delay: amounts.hoverDelay
							},
							children: renderChildren(...args)
						});
					};
				}
			}
		}
	}
})();
