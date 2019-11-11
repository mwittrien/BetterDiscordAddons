//META{"name":"ShowImageDetails","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ShowImageDetails","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ShowImageDetails/ShowImageDetails.plugin.js"}*//

class ShowImageDetails {
	getName () {return "ShowImageDetails";}

	getVersion () {return "1.1.6";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Display the name, size and dimensions of uploaded images in the chat as an header or as a tooltip.";}

	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};

		this.patchModules = {
			LazyImage: "render"
		};
	}

	initConstructor () {
		this.css = `
			 .image-details .image-details-size {
				 margin: 0 10px;
			 }
			 .image-details-tooltip {
				 max-width: 500px;
			 }
			 .image-details-tooltip .image-details-tooltip-size {
				 margin: 10px 0;
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
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		let amounts = BDFDB.DataUtils.get(this, "amounts");
		let settingsitems = [];
		
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
		
		return BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {
			try {return this.initialize();}
			catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
		}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);

			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
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
		if (typeof e.returnvalue.props.children == "function" && e.instance.props.original && e.instance.props.src.indexOf("https://media.discordapp.net/attachments") == 0) {
			this.injectDetails(e);
			if (!e.instance.props.size) BDFDB.LibraryRequires.request(e.instance.props.original, (error, response, result) => {
				if (response) {
					e.instance.props.size = response.headers["content-length"];
					BDFDB.ReactUtils.forceUpdate(e.instance);
				}
			});
		}
	}
	
	injectDetails (e) {
		let settings = BDFDB.DataUtils.get(this, "settings");
		let amounts = BDFDB.DataUtils.get(this, "amounts");
		let renderChildren = e.returnvalue.props.children;
		e.returnvalue.props.children = () => {
			let renderedChildren = renderChildren(e.instance);
			if (settings.showOnHover) return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
				text: `${e.instance.props.original.split("/").slice(-1)}\n${BDFDB.NumberUtils.formatBytes(e.instance.props.size)}\n${e.instance.props.width}x${e.instance.props.height}px`,
				tooltipConfig: {
					type: "right",
					delay: amounts.hoverDelay
				},
				children: renderedChildren
			});
			else return [
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
					className: "image-details",
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
								title: e.instance.props.original,
								href: e.instance.props.original,
								children: e.instance.props.original.split("/").slice(-1)
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
								color: BDFDB.LibraryComponents.TextElement.Colors.PRIMARY,
								children: BDFDB.NumberUtils.formatBytes(e.instance.props.size)
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
								color: BDFDB.LibraryComponents.TextElement.Colors.PRIMARY,
								children: `${e.instance.props.width}x${e.instance.props.height}px`
							})
						})
					]
				}),
				renderedChildren
			];
		};
	}
}