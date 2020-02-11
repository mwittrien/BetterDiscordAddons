//META{"name":"ThemeRepo","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ThemeRepo","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ThemeRepo/ThemeRepo.plugin.js"}*//

var ThemeRepo = (_ => {
	var loading, cachedThemes, grabbedThemes, foundThemes, loadedThemes, generatorThemes, updateInterval;
	
	const themeStates = {
		UPDATED: 0,
		OUTDATED: 1,
		DOWNLOADABLE: 2
	};
	const buttonData = {
		UPDATED: {
			colorClass: "GREEN",
			backgroundColor: "STATUS_GREEN",
			text: "Updated"
		},
		OUTDATED: {
			colorClass: "RED",
			backgroundColor: "STATUS_RED",
			text: "Outdated"
		},
		DOWNLOADABLE: {
			colorClass: "BRAND",
			backgroundColor: "BRAND",
			text: "Download"
		}
	};
	const favStates = {
		FAVORIZED: 0,
		NOT_FAVORIZED: 1
	};
	const newStates = {
		NEW: 0,
		NOT_NEW: 1
	};
	const sortKeys = {
		NAME:			"Name",
		AUTHOR:			"Author",
		VERSION:		"Version",
		DESCRIPTION:	"Description",
		STATE:			"Update State",
		FAV:			"Favorites",
		NEW:			"New Themes"
	};
	const orderKeys = {
		ASC:			"Ascending",
		DESC:			"Descending"
	};
	
	const themeRepoIcon = `<svg width="36" height="31" viewBox="20 0 400 332"><path d="M0.000 39.479 L 0.000 78.957 43.575 78.957 L 87.151 78.957 87.151 204.097 L 87.151 329.236 129.609 329.236 L 172.067 329.236 172.067 204.097 L 172.067 78.957 215.642 78.957 L 259.218 78.957 259.218 39.479 L 259.218 0.000 129.609 0.000 L 0.000 0.000 0.000 39.479" stroke="none" fill="#7289da" fill-rule="evenodd"></path><path d="M274.115 38.624 L 274.115 77.248 280.261 77.734 C 309.962 80.083,325.986 106.575,313.378 132.486 C 305.279 149.131,295.114 152.700,255.800 152.700 L 230.168 152.700 230.168 123.277 L 230.168 93.855 208.566 93.855 L 186.965 93.855 186.965 211.546 L 186.965 329.236 208.566 329.236 L 230.168 329.236 230.168 277.068 L 230.168 224.899 237.268 225.113 L 244.368 225.326 282.215 277.095 L 320.062 328.864 360.031 329.057 L 400.000 329.249 400.000 313.283 L 400.000 297.317 367.924 256.908 L 335.848 216.499 340.182 214.869 C 376.035 201.391,395.726 170.616,399.382 122.342 C 405.008 48.071,360.214 0.000,285.379 0.000 L 274.115 0.000 274.115 38.624" stroke="none" fill="#7f8186" fill-rule="evenodd"></path></svg>`;
	const gitHubIcon = `<svg width="24" height="24" viewBox="0 0 24 24"><g fill="currentColor" transform="translate(2, 2)"><path d="M 7.19, 16.027 c -0.139, 0.026 -0.199, 0.091 -0.182, 0.195 c 0.017, 0.104, 0.095, 0.138, 0.234, 0.104 c 0.139 -0.035, 0.199 -0.095, 0.182 -0.182 C 7.406, 16.049, 7.328, 16.01, 7.19, 16.027 z"></path><path d="M 6.45, 16.131 c -0.138, 0 -0.208, 0.047 -0.208, 0.143 c 0, 0.112, 0.074, 0.16, 0.221, 0.143 c 0.138, 0, 0.208 -0.048, 0.208 -0.143 C 6.671, 16.162, 6.597, 16.114, 6.45, 16.131 z"></path><path d="M 5.438, 16.092 c -0.035, 0.095, 0.022, 0.16, 0.169, 0.195 c 0.13, 0.052, 0.212, 0.026, 0.247 -0.078 c 0.026 -0.095 -0.03 -0.164 -0.169 -0.208 C 5.554, 15.967, 5.472, 15.996, 5.438, 16.092 z"></path><path d="M 18.837, 1.097 C 18.106, 0.366, 17.226, 0, 16.196, 0 H 3.738 C 2.708, 0, 1.828, 0.366, 1.097, 1.097 C 0.366, 1.828, 0, 2.708, 0, 3.738 v 12.459 c 0, 1.03, 0.366, 1.91, 1.097, 2.641 c 0.731, 0.731, 1.612, 1.097, 2.641, 1.097 h 2.907 c 0.19, 0, 0.333 -0.007, 0.428 -0.019 c 0.095 -0.013, 0.19 -0.069, 0.285 -0.169 c 0.095 -0.099, 0.143 -0.244, 0.143 -0.435 c 0 -0.026 -0.002 -0.32 -0.007 -0.883 c -0.004 -0.562 -0.007 -1.008 -0.007 -1.337 l -0.298, 0.052 c -0.19, 0.035 -0.43, 0.05 -0.72, 0.045 c -0.29 -0.004 -0.59 -0.035 -0.902 -0.091 c -0.312 -0.056 -0.601 -0.186 -0.87 -0.389 c -0.268 -0.203 -0.458 -0.469 -0.571 -0.798 l -0.13 -0.299 c -0.086 -0.199 -0.223 -0.419 -0.409 -0.662 c -0.186 -0.242 -0.374 -0.407 -0.564 -0.493 l -0.091 -0.065 c -0.06 -0.043 -0.117 -0.095 -0.169 -0.156 c -0.052 -0.061 -0.091 -0.121 -0.117 -0.182 c -0.026 -0.061 -0.004 -0.11, 0.065 -0.149 c 0.069 -0.039, 0.195 -0.058, 0.376 -0.058 l 0.259, 0.039 c 0.173, 0.035, 0.387, 0.138, 0.642, 0.311 c 0.255, 0.173, 0.465, 0.398, 0.629, 0.675 c 0.199, 0.355, 0.439, 0.625, 0.72, 0.811 c 0.281, 0.186, 0.565, 0.279, 0.85, 0.279 s 0.532 -0.022, 0.74 -0.065 c 0.208 -0.043, 0.402 -0.108, 0.584 -0.195 c 0.078 -0.58, 0.29 -1.025, 0.636 -1.337 c -0.493 -0.052 -0.936 -0.13 -1.33 -0.234 c -0.394 -0.104 -0.8 -0.272 -1.22 -0.506 c -0.42 -0.234 -0.768 -0.523 -1.045 -0.87 c -0.277 -0.346 -0.504 -0.8 -0.681 -1.363 c -0.177 -0.562 -0.266 -1.211 -0.266 -1.947 c 0 -1.047, 0.342 -1.938, 1.025 -2.673 c -0.32 -0.787 -0.29 -1.67, 0.091 -2.647 c 0.251 -0.078, 0.623 -0.019, 1.116, 0.175 c 0.493, 0.195, 0.854, 0.361, 1.084, 0.5 c 0.229, 0.138, 0.413, 0.255, 0.552, 0.35 c 0.805 -0.225, 1.635 -0.337, 2.492 -0.337 c 0.856, 0, 1.687, 0.112, 2.492, 0.337 l 0.493 -0.311 c 0.338 -0.208, 0.735 -0.398, 1.194 -0.571 c 0.459 -0.173, 0.809 -0.221, 1.051 -0.143 c 0.389, 0.978, 0.424, 1.86, 0.104, 2.647 c 0.683, 0.735, 1.025, 1.627, 1.025, 2.673 c 0, 0.735 -0.089, 1.387 -0.266, 1.953 c -0.177, 0.567 -0.406, 1.021 -0.688, 1.363 c -0.281, 0.342 -0.632, 0.629 -1.051, 0.863 c -0.42, 0.234 -0.826, 0.402 -1.22, 0.506 c -0.394, 0.104 -0.837, 0.182 -1.33, 0.234 c 0.45, 0.389, 0.675, 1.003, 0.675, 1.843 v 3.102 c 0, 0.147, 0.021, 0.266, 0.065, 0.357 c 0.044, 0.091, 0.113, 0.153, 0.208, 0.188 c 0.096, 0.035, 0.18, 0.056, 0.253, 0.065 c 0.074, 0.009, 0.18, 0.013, 0.318, 0.013 h 2.907 c 1.029, 0, 1.91 -0.366, 2.641 -1.097 c 0.731 -0.731, 1.097 -1.612, 1.097 -2.641 V 3.738 C 19.933, 2.708, 19.568, 1.827, 18.837, 1.097 z"></path><path d="M 3.945, 14.509 c -0.06, 0.043 -0.052, 0.112, 0.026, 0.208 c 0.087, 0.086, 0.156, 0.1, 0.208, 0.039 c 0.061 -0.043, 0.052 -0.112 -0.026 -0.208 C 4.066, 14.47, 3.997, 14.457, 3.945, 14.509 z"></path><path d="M 3.517, 14.184 c -0.026, 0.061, 0.004, 0.113, 0.091, 0.156 c 0.069, 0.043, 0.126, 0.035, 0.169 -0.026 c 0.026 -0.061 -0.004 -0.113 -0.091 -0.156 C 3.599, 14.132, 3.543, 14.141, 3.517, 14.184 z"></path><path d="M 4.348, 15.015 c -0.078, 0.043 -0.078, 0.121, 0, 0.234 c 0.078, 0.113, 0.151, 0.143, 0.221, 0.091 c 0.078 -0.061, 0.078 -0.143, 0 -0.247 C 4.499, 14.981, 4.425, 14.954, 4.348, 15.015 z"></path><path d="M 4.802, 15.599 c -0.078, 0.069 -0.061, 0.151, 0.052, 0.247 c 0.104, 0.104, 0.19, 0.117, 0.259, 0.039 c 0.069 -0.069, 0.052 -0.151 -0.052 -0.246 C 4.958, 15.534, 4.871, 15.521, 4.802, 15.599 z"></path></g></svg>`;
	
	const repoListComponent = class ThemeList extends BdApi.React.Component {
		render() {
			let list = BDFDB.ReactUtils.createElement("ul", {
				className: BDFDB.disCN._repolist,
				style: {
					display: "flex",
					flexDirection: "column",
					margin: "unset",
					width: "unset"
				},
				children: [].concat(this.props.entries).filter(n => n).map(entry => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.AddonCard, entry))
			});
			BDFDB.ReactUtils.forceStyle(list, ["display", "flex-direction", "margin", "width"]);
			return list;
		}
	};
	
	let forceRerenderGenerator;
	const generatorComponent = class ThemeGenerator extends BdApi.React.Component {
		render() {
			if (forceRerenderGenerator) {
				BDFDB.TimeUtils.timeout(_ => {
					forceRerenderGenerator = false;
					BDFDB.ReactUtils.forceUpdate(this);
				}, 500);
			}
			let theme = this.props.options && loadedThemes[this.props.options.currentGenerator];
			return !this.props.options || !this.props.options.frame ? null : [
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					className: BDFDB.disCN.marginbottom20,
					type: "Select",
					label: "Choose a Generator Theme",
					basis: "70%",
					value: this.props.options.currentGenerator || "-----",
					options: ["-----"].concat(generatorThemes).map(url => {return {value:url, label:(loadedThemes[url] || {}).name || "-----"}}),
					searchable: true,
					onChange: (value, instance) => {
						if (loadedThemes[value.value]) {
							if (this.props.options.currentGenerator) forceRerenderGenerator = true;
							this.props.options.currentGenerator = value.value;
							this.props.options.generatorValues = {};
						}
						else {
							delete this.props.options.currentGenerator;
							delete this.props.options.generatorValues;
						}
						delete this.props.options.currentTheme;
						this.props.plugin.updateList(instance, this.props.options);
						this.props.options.frame.contentWindow.postMessage({
							origin: "ThemeRepo",
							reason: "NewTheme",
							checked: true,
							css: (loadedThemes[value.value] || {}).fullcss
						}, "*");
					}
				}),
				theme && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					className: BDFDB.disCN.marginbottom20,
					type: "Button",
					label: "Download generated Theme",
					children: "Download",
					onClick: _ => {
						this.props.plugin.createThemeFile(theme.name + ".theme.css", this.props.plugin.generateTheme(theme, this.props.options));
					}
				}),
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
					className: BDFDB.disCN.marginbottom20
				}),
				theme && !forceRerenderGenerator && this.props.plugin.createGeneratorInputs(theme, this.props.options)
			].flat(10).filter(n => n)
		}
	};
	
	return class ThemeRepo {
		getName () {return "ThemeRepo";}

		getVersion () {return "1.9.1";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Allows you to preview all themes from the theme repo and download them on the fly. Repo button is in the theme settings.";}

		constructor () {
			this.changelog = {
				"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
			};

			this.patchedModules = {
				after: {
					V2C_ContentColumn: "render"
				}
			};
		}

		initConstructor () {
			loading = {is:false, timeout:null, amount:0};
			
			cachedThemes = [];
			grabbedThemes = [];
			foundThemes = [];
			loadedThemes = {};
			generatorThemes = [];

			this.defaults = {
				settings: {
					useChromium: 		{value:false,		description:"Use an inbuilt browser window instead of opening your default browser"},
					notifyOutdated:		{value:true, 		description:"Notifies you when one of your Themes is outdated"},
					notifyNewentries:	{value:true, 		description:"Notifies you when there are new entries in the Repo"}
				},
				modalSettings: {
					updated: 			{value:true,	modify:true,	description:"Show updated Themes",},
					outdated:			{value:true, 	modify:true,	description:"Show outdated Themes"},
					downloadable:		{value:true, 	modify:true,	description:"Show downloadable Themes"},
					rnmStart:			{value:true, 	modify:false,	description:"Apply Theme after Download"}
				}
			};

			this.css = `
				iframe.discordPreview {
					width: 100vw !important;
					height: 100vh !important;
					position: absolute !important;
					z-index: 999 !important;
				}
				iframe.discordPreview ~ ${BDFDB.dotCN.appmount} {
					position: absolute !important;
					top: 0 !important;
				}
				iframe.discordPreview ~ ${BDFDB.dotCNS.appmount + BDFDB.dotCN.titlebar},
				iframe.discordPreview ~ ${BDFDB.dotCNS.appmount + BDFDB.dotCN.app} > *:not(.toasts):not(.bd-toasts) {
					opacity: 0 !important;
					visibility: hidden !important;
				}
				.${this.name}-modal.repo-modal {
					max-width: 800px;
					min-height: 90vh;
					max-height: 90vh;
				}
			`;
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let customList = this.getCustomList(), customUrl = "";
			let settingspanel, settingsitems = [];
			
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Settings",
				collapseStates: collapseStates,
				children: Object.keys(settings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}))
			}));
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Custom Themes",
				collapseStates: collapseStates,
				dividertop: true,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: "Add Theme:",
						tag: BDFDB.LibraryComponents.FormComponents.FormTitleTags.H3,
						className: BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom8,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							align: BDFDB.LibraryComponents.Flex.Align.CENTER,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										placeholder: customUrl,
										placeholder: "Insert Raw Github Link of Theme (https://raw.githubusercontent.com/...)",
										onChange: value => {customUrl = value.trim();}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
									onClick: _ => {
										if (customUrl) {
											customList.push(customUrl);
											BDFDB.DataUtils.save(BDFDB.ArrayUtils.removeCopies(customList), this, "custom");
											BDFDB.PluginUtils.refreshSettingsPanel(this, settingspanel, collapseStates);
										}
									},
									children: BDFDB.LanguageUtils.LanguageStrings.ADD
								})
							]
						})
					}),
					customList.length ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
						title: "Custom Theme List:",
						className: BDFDB.disCNS.margintop8 + BDFDB.disCN.marginbottom20,
						first: true,
						last: true,
						children: customList.map(url => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Card, {
							children: url,
							onRemove: _ => {
								BDFDB.ArrayUtils.remove(customList, url, true);
								BDFDB.DataUtils.save(customList, this, "custom");
								BDFDB.PluginUtils.refreshSettingsPanel(this, settingspanel, collapseStates);
							}
						}))
					}) : null,
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						type: "Button",
						color: BDFDB.LibraryComponents.Button.Colors.RED,
						label: "Remove all custom added Themes",
						onClick: _ => {
							BDFDB.ModalUtils.confirm(this, "Are you sure you want to remove all added Themes from your own list", _ => {
								BDFDB.DataUtils.save([], this, "custom");
								BDFDB.PluginUtils.refreshSettingsPanel(this, settingspanel, collapseStates);
							});
						},
						children: BDFDB.LanguageUtils.LanguageStrings.REMOVE
					})
				].flat(10).filter(n => n)
			}));
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Refetch All",
				collapseStates: collapseStates,
				dividertop: true,
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					type: "Button",
					label: "Force all Themes to be fetched again",
					onClick: _ => {
						loading = {is:false, timeout:null, amount:0};
						this.loadThemes();
					},
					children: BDFDB.LanguageUtils.LanguageStrings.ERRORS_RELOAD
				})
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
				
				// REMOVE 18.01.2020
				let olddata = BDFDB.DataUtils.load(this, "ownlist", "ownlist");
				if (olddata) {
					BDFDB.DataUtils.save(olddata, this, "custom");
					BDFDB.DataUtils.remove(this, "ownlist");
				}

				this.loadThemes();

				updateInterval = BDFDB.TimeUtils.interval(_ => {this.checkForNewThemes();}, 1000*60*30);

				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}


		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.TimeUtils.clear(updateInterval);
				BDFDB.TimeUtils.clear(loading.timeout);

				BDFDB.ModuleUtils.forceAllUpdates(this);

				BDFDB.DOMUtils.remove("iframe.discordPreview", ".bd-themerepobutton", ".themerepo-notice", ".themerepo-loadingicon");

				BDFDB.PluginUtils.clear(this);
			}
		}


		// begin of own functions

		onUserSettingsCogContextMenu (e) {
			BDFDB.TimeUtils.timeout(_ => {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["label", "BandagedBD"]]});
				if (index > -1) children[index].props.render.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
					label: "Theme Repo",
					action: _ => {
						if (!loading.is) BDFDB.ContextMenuUtils.close(e.instance);
						this.openThemeRepoModal();
					}
				}));
			});
		}
		
		processV2CContentColumn (e) {
			if (e.instance.props.title == "Themes") {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {key: "folder-button"});
				if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: "Open Theme Repo",
					children: BDFDB.ReactUtils.createElement("button", {
						className: `${BDFDB.disCN._repofolderbutton} bd-themerepobutton`,
						onClick: _ => {this.openThemeRepoModal();},
						children: "ThemeRepo"
					})
				}));
			}
		}
		
		getCustomList () {
			let customlist = BDFDB.DataUtils.load(this, "custom");
			return BDFDB.ArrayUtils.is(customlist) ? customlist : [];
		}


		openThemeRepoModal (options = {}) {
			if (loading.is) BDFDB.NotificationUtils.toast(`Themes are still being fetched. Try again in some seconds.`, {type:"danger"});
			else {
				let keyPressed, messageReceived;
				
				let modalSettings = BDFDB.DataUtils.get(this, "modalSettings");
				let searchTimeout, automaticLoading = BDFDB.BDUtils.isAutoLoadEnabled();
				options = Object.assign(options, modalSettings);
				options.updated = options.updated && !options.showOnlyOutdated;
				options.outdated = options.updated || options.showOnlyOutdated;
				options.downloadable = options.downloadable && !options.showOnlyOutdated;
				options.searchString = "";
				options.sortKey = options.forcedSort || Object.keys(sortKeys)[0];
				options.orderKey = options.forcedOrder || Object.keys(orderKeys)[0];
				
				options.frame = BDFDB.DOMUtils.create(`<iframe class="discordPreview" src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/DiscordPreview.html"></iframe>`)
				
				let entries = this.createEntries(options);
				BDFDB.ModalUtils.open(this, {
					className: "repo-modal",
					size: "LARGE",
					header: "Theme Repository",
					subheader: BDFDB.ReactUtils.createElement(class RepoAmount extends BDFDB.ReactUtils.Component {
						render () {return `${this.props.entries.length}/${Object.keys(loadedThemes).length} Themes`}
					}, {entries}),
					tabBarChildren: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SearchBar, {
								autoFocus: true,
								query: options.searchString,
								onChange: (value, instance) => {
									BDFDB.TimeUtils.clear(searchTimeout);
									searchTimeout = BDFDB.TimeUtils.timeout(_ => {
										options.searchString = value.replace(/[<|>]/g, "").toUpperCase();
										this.updateList(instance, options);
									}, 1000);
								},
								onClear: instance => {
									options.searchString = "";
									this.updateList(instance, options);
								}
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.QuickSelect, {
								label: "Sort by:",
								value: {
									label: sortKeys[options.sortKey],
									value: options.sortKey
								},
								options: Object.keys(sortKeys).map(key => {return {
									label: sortKeys[key],
									value: key
								};}),
								onChange: (key, instance) => {
									options.sortKey = key;
									this.updateList(instance, options);
								}
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.QuickSelect, {
								label: "Order:",
								value: {
									label: orderKeys[options.orderKey],
									value: options.orderKey
								},
								options: Object.keys(orderKeys).map(key => {return {
									label: orderKeys[key],
									value: key
								};}),
								onChange: (key, instance) => {
									options.orderKey = key;
									this.updateList(instance, options);
								}
							})
						})
					],
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: "Themes",
							children: BDFDB.ReactUtils.createElement(repoListComponent, {
								plugin: this,
								entries: entries
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: "Generator",
							children: BDFDB.ReactUtils.createElement(generatorComponent, {
								plugin: this,
								options: options
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: BDFDB.LanguageUtils.LanguageStrings.SETTINGS,
							children: [
								!automaticLoading && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									className: BDFDB.disCN.marginbottom8,
									children: BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCNS.titledefault + BDFDB.disCN.cursordefault,
										style: {maxWidth: 760},
										children: "To experience ThemeRepo in the best way. I would recommend you to enable BD intern reload function, that way all downloaded files are loaded into Discord without the need to reload."
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCNS.titledefault + BDFDB.disCN.cursordefault,
										style: {maxWidth: 760},
										children: "You can toggle this menu with the 'Ctrl' key to take a better look at the preview."
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									className: BDFDB.disCN.marginbottom20,
									type: "Switch",
									label: "Preview in light mode",
									value: BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themelight,
									onChange: (value, instance) => {
										options.frame.contentWindow.postMessage({
											origin: "ThemeRepo",
											reason: "DarkLight",
											checked: value
										}, "*");
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									className: BDFDB.disCN.marginbottom20,
									type: "Switch",
									label: "Preview with normalized classes",
									value: BDFDB.BDUtils.getSettings("fork-ps-4"),
									onChange: (value, instance) => {
										options.frame.contentWindow.postMessage({
											origin: "ThemeRepo",
											reason: "Normalize",
											checked: value
										}, "*");
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									className: BDFDB.disCN.marginbottom20,
									type: "Switch",
									label: "Include Custom CSS in Preview",
									value: false,
									onChange: (value, instance) => {
										let customCSS = document.querySelector("style#customcss");
										if (customCSS && customCSS.innerText.length > 0) options.frame.contentWindow.postMessage({
											origin: "ThemeRepo",
											reason: "CustomCSS",
											checked: value,
											css: customCSS.innerText
										}, "*");
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									className: BDFDB.disCN.marginbottom20,
									type: "Switch",
									label: "Include ThemeFixer CSS in Preview",
									value: false,
									onChange: (value, instance) => {
										BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeFixer.css", (error, response, body) => {
											options.frame.contentWindow.postMessage({
												origin: "ThemeRepo",
												reason: "ThemeFixer",
												checked: value,
												css: this.createFixerCSS(body)
											}, "*");
										});
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									className: BDFDB.disCN.marginbottom20,
									type: "Button",
									label: "Download ThemeFixer",
									children: "Download",
									onClick: _ => {
										BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeFixer.css", (error, response, body) => {
											this.createThemeFile("ThemeFixer.theme.css", `//META{"name":"ThemeFixer","description":"ThemeFixerCSS for transparent themes","author":"DevilBro","version":"1.0.3"}*//\n\n` + this.createFixerCSS(body));
										});
									}
								}),
								Object.keys(modalSettings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
									className: BDFDB.disCN.marginbottom20,
									type: "Switch",
									plugin: this,
									keys: ["modalSettings", key],
									label: this.defaults.modalSettings[key].description,
									note: key == "rnmStart" && !automaticLoading && "Automatic Loading has to be enabled",
									disabled: key == "rnmStart" && !automaticLoading,
									value: options[key],
									onChange: (value, instance) => {
										options[key] = value;
										this.updateList(instance, options);
									}
								}))
							].flat(10).filter(n => n)
						})
					],
					onOpen: (modal, instance) => {
						let layerContainer = BDFDB.DOMUtils.getParent(BDFDB.dotCN.itemlayercontainer, modal);
						BDFDB.ListenerUtils.addToChildren(layerContainer, "mouseenter", BDFDB.dotCN.backdropwithlayer, e => {
							if (!document.querySelector(BDFDB.dotCN.colorpicker)) {
								for (let child of layerContainer.childNodes) {
									child.style.setProperty("transition", "opacity .5s ease-in-out", "important");
									child.style.setProperty("opacity", "0", "important");
								}
							}
						});
						BDFDB.ListenerUtils.addToChildren(layerContainer, "mouseleave", BDFDB.dotCN.backdropwithlayer, e => {
							if (!document.querySelector(BDFDB.dotCN.colorpicker)) {
								layerContainer.childNodes[0].style.setProperty("opacity", "0.85");
								layerContainer.childNodes[1].style.setProperty("opacity", "1");
								BDFDB.TimeUtils.timeout(_ => {for (let child of layerContainer.childNodes) child.style.removeProperty("transition");}, 500);
							}
						});
						keyPressed = e => {
							if (e.which == 17) {
								if (!Array.from(document.querySelectorAll(BDFDB.dotCNC.input + BDFDB.dotCN.searchbarinput)).some(ele => ele == document.activeElement)) BDFDB.DOMUtils.toggle(layerContainer);
							}
							else if (e.which == 27) options.frame.remove();
						};
						messageReceived = e => {
							if (!document.contains(options.frame)) {
								document.removeEventListener("keyup", keyPressed);
								window.removeEventListener("message", messageReceived);
							}
							else if (typeof e.data === "object" && e.data.origin == "DiscordPreview") {
								switch (e.data.reason) {
									case "OnLoad":
										let nativecss = document.querySelector("head link[rel='stylesheet'][integrity]");
										let titlebar = document.querySelector(BDFDB.dotCN.titlebar);
										options.frame.contentWindow.postMessage({
											origin: "ThemeRepo",
											reason: "OnLoad",
											classes: JSON.stringify(BDFDB.DiscordClasses),
											classmodules: JSON.stringify(BDFDB.DiscordClassModules),
											username: BDFDB.UserUtils.me.username,
											id: BDFDB.UserUtils.me.id,
											discriminator: BDFDB.UserUtils.me.discriminator,
											avatar: BDFDB.UserUtils.getAvatar(),
											nativecss: nativecss && nativecss.href,
											html: document.documentElement.className,
											titlebar: titlebar && titlebar.outerHTML
										}, "*");
										options.frame.contentWindow.postMessage({
											origin: "ThemeRepo",
											reason: "DarkLight",
											checked: BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themelight
										}, "*");
										break;
									case "KeyUp":
										keyPressed(e.data);
										break;
								}
							}
						};

						document.addEventListener("keyup", keyPressed);
						window.addEventListener("message", messageReceived);
						document.body.insertBefore(options.frame, document.body.firstElementChild);
					},
					onClose: (modal, instance) => {
						options.frame.remove();
						document.removeEventListener("keyup", keyPressed);
						window.removeEventListener("message", messageReceived);
					}
				});
			}
		}
		
		updateList (instance, options = {}) {
			let modalIns = BDFDB.ReactUtils.findOwner(instance, {name:"BDFDB_Modal", up:true});
			if (modalIns) {
				let amountIns = BDFDB.ReactUtils.findOwner(modalIns, {name:"RepoAmount"});
				let listIns = BDFDB.ReactUtils.findOwner(modalIns, {name:"ThemeList"});
				let genIns = BDFDB.ReactUtils.findOwner(modalIns, {name:"ThemeGenerator"});
				if (amountIns && listIns && genIns) {
					let entries = this.createEntries(options);
					amountIns.props.entries = entries;
					listIns.props.entries = entries;
					BDFDB.ReactUtils.forceUpdate(amountIns, listIns, genIns);
				}
			}
		}

		createEntries (options = {}) {
			let favorites = BDFDB.DataUtils.load(this, "favorites");
			let themes = Object.keys(loadedThemes).map(url => {
				let theme = loadedThemes[url];
				let instTheme = BDFDB.BDUtils.getTheme(theme.name);
				if (instTheme && instTheme.author.toUpperCase() == theme.author.toUpperCase()) theme.state = instTheme.version != theme.version ? themeStates.OUTDATED : themeStates.UPDATED;
				else theme.state = themeStates.DOWNLOADABLE;
				return {
					url: theme.url,
					requesturl: theme.requesturl,
					search: (theme.name + " " + theme.version + " " + theme.author + " " + theme.description).toUpperCase(),
					name: theme.name,
					version: theme.version,
					author: theme.author,
					description: theme.description || "No Description found.",
					fav: favorites[url] ? favStates.FAVORIZED : favStates.NOT_FAVORIZED,
					new: !cachedThemes.includes(url) ? newStates.NEW : newStates.NOT_NEW,
					state: theme.state,
					css: theme.css,
					fullcss: theme.fullcss
				};
			});
			if (!options.updated)		themes = themes.filter(theme => theme.state == themeStates.UPDATED);
			if (!options.outdated)		themes = themes.filter(theme => theme.state == themeStates.OUTDATED);
			if (!options.downloadable)	themes = themes.filter(theme => theme.state == themeStates.DOWNLOADABLE);
			if (options.searchString) 	themes = themes.filter(theme => theme.search.indexOf(options.searchString) > -1).map(theme => Object.assign({}, theme, {
				name: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(theme.name, options.searchString))) || theme.name,
				version: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(theme.version, options.searchString))) || theme.version,
				author: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(theme.author, options.searchString))) || theme.author,
				description: BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(BDFDB.StringUtils.highlight(theme.description, options.searchString))) || theme.description
			}));

			BDFDB.ArrayUtils.keySort(themes, (options.sortKey == "NEW" && !themes.some(theme => theme.new == newStates.NEW) ? Object.keys(sortKeys)[0] : options.sortKey).toLowerCase());
			if (options.orderKey == "DESC") themes.reverse();
			return themes.map(theme => {
				let buttonConfig = buttonData[(Object.entries(themeStates).find(n => n[1] == theme.state) || [])[0]]
				return buttonConfig && {
					data: theme,
					controls: [
						theme.new == newStates.NEW && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.TextBadge, {
							style: {
								borderRadius: 3,
								textTransform: "uppercase",
								background: BDFDB.DiscordConstants.Colors.STATUS_YELLOW
							},
							text: BDFDB.LanguageUtils.LanguageStrings.NEW
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FavButton, {
							className: BDFDB.disCNS._repoentryiconwrapper + BDFDB.disCN.cursorpointer,
							isFavorite: theme.fav == favStates.FAVORIZED,
							onClick: value => {
								theme.fav = value ? favStates.FAVORIZED : favStates.NOT_FAVORIZED;
								if (value) BDFDB.DataUtils.save(true, this, "favorites", theme.url);
								else BDFDB.DataUtils.remove(this, "favorites", theme.url);
							}
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: "Go to Source",
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
								className: BDFDB.disCNS._repoentryiconwrapper,
								onClick: _ => {
									let giturl = null;
									if (theme.requesturl.indexOf("https://raw.githubusercontent.com") == 0) {
										let temp = theme.requesturl.replace("//raw.githubusercontent", "//github").split("/");
										temp.splice(5, 0, "blob");
										giturl = temp.join("/");
									}
									else if (theme.requesturl.indexOf("https://gist.githubusercontent.com/") == 0) {
										giturl = theme.requesturl.replace("//gist.githubusercontent", "//gist.github").split("/raw/")[0];
									}
									if (giturl) BDFDB.DiscordUtils.openLink(giturl, BDFDB.DataUtils.get(this, "settings", "useChromium"));
								},
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									iconSVG: gitHubIcon
								})
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Switch, {
							value: options.currentTheme == theme.url,
							onChange: (value, instance) => {
								if (value) options.currentTheme = theme.url;
								else delete options.currentTheme;
								delete options.currentGenerator;
								delete options.generatorValues;
								this.updateList(instance, options);
								options.frame.contentWindow.postMessage({
									origin: "ThemeRepo",
									reason: "NewTheme",
									checked: value,
									css: theme.css
								}, "*");
							}
						})
					],
					buttons: [
						theme.state != themeStates.DOWNLOADABLE && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: "Delete Themefile",
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
								className: BDFDB.disCN._repoentryiconwrapper,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									className: BDFDB.disCN.svgicon,
									name: BDFDB.LibraryComponents.SvgIcon.Names.NOVA_TRASH
								}),
								onClick: (e, instance) => {
									this.deleteThemeFile(theme);
									BDFDB.TimeUtils.timeout(_ => {
										this.updateList(instance, options);
										if (!BDFDB.BDUtils.isAutoLoadEnabled()) this.removeTheme(theme);
									}, 3000);
								}
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
							size: BDFDB.LibraryComponents.Button.Sizes.MIN,
							color: BDFDB.LibraryComponents.Button.Colors[buttonConfig.colorClass],
							style: {backgroundColor: BDFDB.DiscordConstants.Colors[buttonConfig.backgroundColor]},
							children: buttonConfig.text,
							onClick: (e, instance) => {
								this.downloadTheme(theme);
								BDFDB.TimeUtils.timeout(_ => {
									this.updateList(instance, options);
									if (options.rnmStart) this.applyTheme(theme);
								}, 3000);
							}
						})
					]
				};
			}).filter(n => n);
		}
		
		createFixerCSS (body) {
			let oldcss = body.replace(/\n/g, "\\n").replace(/\t/g, "\\t").replace(/\r/g, "\\r").split("REPLACE_CLASS_");
			let newcss = oldcss.shift();
			for (let str of oldcss) {
				let reg = /([A-z0-9_]+)(.*)/.exec(str);
				newcss += BDFDB.dotCN[reg[1]] + reg[2];
			}
			return newcss.replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "\r");
		}
		
		createGeneratorInputs (theme, options = {}) {
			if (!options.frame || !BDFDB.ObjectUtils.is(options.generatorValues) || !BDFDB.ObjectUtils.is(theme) || !theme.fullcss) return null;
			let vars = theme.fullcss.split(":root");
			if (vars.length < 2) return null;
			vars = vars[1].replace(/\t\(/g, " (").replace(/\r|\t| {2,}/g, "").replace(/\/\*\n*((?!\/\*|\*\/).|\n)*\n+((?!\/\*|\*\/).|\n)*\n*\*\//g, "").replace(/\n\/\*.*?\*\//g, "").replace(/\n/g, "");
			vars = vars.split("{");
			vars.shift();
			vars = vars.join("{").replace(/\s*(:|;|--|\*)\s*/g, "$1");
			vars = vars.split("}")[0];
			vars = vars.slice(2).split(/;--|\*\/--/);
			let inputRefs = [], updateTimeout;
			for (let varstr of vars) {
				varstr = varstr.split(":");
				let varname = varstr.shift().trim();
				varstr = varstr.join(":").split(/;[^A-z0-9]|\/\*/);
				let oldvalue = varstr.shift().trim();
				if (oldvalue) {
					let childType = "text", childMode = "";
					let iscolor = BDFDB.ColorUtils.getType(oldvalue);
					let iscomp = !iscolor && /[0-9 ]+,[0-9 ]+,[0-9 ]+/g.test(oldvalue);
					if (iscolor || iscomp) {
						childType = "color";
						childMode = iscomp && "comp";
					}
					else {
						let isurlfile = /url\(.+\)/gi.test(oldvalue);
						let isfile = !isurlfile && /(http(s)?):\/\/[(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(oldvalue);
						if (isfile || isurlfile) {
							childType = "file";
							childMode = isurlfile && "url";
						}
					}
					let vardescription = varstr.join("").replace(/\*\/|\/\*/g, "").replace(/:/g, ": ").replace(/: \//g, ":/").replace(/--/g, " --").replace(/\( --/g, "(--").trim();
					options.generatorValues[varname] = {value:oldvalue, oldvalue};
					inputRefs.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						className: BDFDB.disCN.marginbottom20,
						dividerbottom: vars[vars.length-1] != varstr,
						type: "TextInput",
						childProps: {
							type: childType,
							mode: childMode,
							filter: childType == "file" && "image"
						},
						label: varname[0].toUpperCase() + varname.slice(1),
						note: vardescription && vardescription.indexOf("*") == 0 ? vardescription.slice(1) : vardescription,
						basis: "70%",
						value: oldvalue,
						placeholder: oldvalue,
						onChange: value => {
							BDFDB.TimeUtils.clear(updateTimeout);
							updateTimeout = BDFDB.TimeUtils.timeout(_ => {
								options.generatorValues[varname] = {value, oldvalue};
								options.frame.contentWindow.postMessage({
									origin: "ThemeRepo",
									reason: "NewTheme",
									checked: true,
									css: this.generateTheme(theme, options)
								}, "*");
							}, 1000);
						}
					}));
				}
			}
			return inputRefs;
		}
		
		generateTheme (theme, options = {}) {
			if (!BDFDB.ObjectUtils.is(theme) || !BDFDB.ObjectUtils.is(options) || !BDFDB.ObjectUtils.is(options.generatorValues)) return "";
			let css = theme.fullcss;
			for (let inputId in options.generatorValues) if (options.generatorValues[inputId].value && options.generatorValues[inputId].value.trim() && options.generatorValues[inputId].value != options.generatorValues[inputId].oldvalue) css = css.replace(new RegExp(`--${BDFDB.StringUtils.regEscape(inputId)}(\\s*):(\\s*)${BDFDB.StringUtils.regEscape(options.generatorValues[inputId].oldvalue)}`,"g"),`--${inputId}$1:$2${options.generatorValues[inputId].value}`);
			return css;
		}

		loadThemes () {
			BDFDB.DOMUtils.remove(".themerepo-loadingicon");
			let settings = BDFDB.DataUtils.load(this, "settings");
			let getThemeInfo, outdated = 0, newentries = 0, i = 0, NFLDreplace = null;
			let tags = ["name","description","author","version"];
			let newentriesdata = BDFDB.DataUtils.load(this, "newentriesdata"), customList = this.getCustomList();
			cachedThemes = (newentriesdata.urlbase64 ? atob(newentriesdata.urlbase64).split("\n") : []).concat(customList);
			BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeList.txt", (error, response, body) => {
				if (!error && body) {
					body = body.replace(/[\r\t]/g, "");
					BDFDB.DataUtils.save(btoa(body), this, "newentriesdata", "urlbase64");
					loadedThemes = {};
					grabbedThemes = body.split("\n").filter(n => n);
					BDFDB.LibraryRequires.request("https://github.com/NFLD99/Better-Discord", (error2, response2, body2) => {
						if (!error2 && body2) {
							NFLDreplace = /\/NFLD99\/Better-Discord\/tree\/master\/Themes_[^"]+">([^<]+)/i.exec(body2);
							NFLDreplace = NFLDreplace && NFLDreplace.length > 1 ? NFLDreplace[1] : null;
						}
						foundThemes = grabbedThemes.concat(customList);

						loading = {is:true, timeout:BDFDB.TimeUtils.timeout(_ => {
							BDFDB.TimeUtils.clear(loading.timeout);
							if (this.started) {
								if (loading.is && loading.amount < 4) BDFDB.TimeUtils.timeout(_ => {this.loadThemes();}, 10000);
								loading = {is: false, timeout:null, amount:loading.amount};
							}
						},1200000), amount:loading.amount+1};
					
						let loadingicon = BDFDB.DOMUtils.create(themeRepoIcon);
						BDFDB.DOMUtils.addClass(loadingicon, "themerepo-loadingicon");
						loadingicon.addEventListener("mouseenter", _ => {
							BDFDB.TooltipUtils.create(loadingicon, this.getLoadingTooltipText(), {
								type: "left",
								delay: 500,
								style: "max-width: unset;",
								selector: "themerepo-loading-tooltip"
							});
						});
						BDFDB.PluginUtils.addLoadingIcon(loadingicon);

						getThemeInfo(_ => {
							if (!this.started) {
								BDFDB.TimeUtils.clear(loading.timeout);
								return;
							}
							BDFDB.TimeUtils.clear(loading.timeout);
							BDFDB.DOMUtils.remove(loadingicon, ".themerepo-loadingicon");
							loading = {is:false, timeout:null, amount:loading.amount};
							
							BDFDB.LogUtils.log("Finished fetching Themes.", this.name);
							if (document.querySelector(".bd-themerepobutton")) BDFDB.NotificationUtils.toast(`Finished fetching Themes.`, {type:"success"});
							
							if ((settings.notifyOutdated || settings.notifyOutdated == undefined) && outdated > 0) {
								let oldbarbutton = document.querySelector(".themerepo-outdate-notice " + BDFDB.dotCN.noticedismiss);
								if (oldbarbutton) oldbarbutton.click();
								let bar = BDFDB.NotificationUtils.notice(`${outdated} of your Themes ${outdated == 1 ? "is" : "are"} outdated. Check:`, {
									type: "danger",
									btn: "ThemeRepo",
									selector: "themerepo-notice themerepo-outdate-notice",
									customicon: themeRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#7f8186/gi, "#B9BBBE")
								});
								bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", _ => {
									this.openThemeRepoModal({showOnlyOutdated:true});
									bar.querySelector(BDFDB.dotCN.noticedismiss).click();
								});
							}
							
							if ((settings.notifyNewentries || settings.notifyNewentries == undefined) && newentries > 0) {
								let oldbarbutton = document.querySelector(".themerepo-newentries-notice " + BDFDB.dotCN.noticedismiss);
								if (oldbarbutton) oldbarbutton.click();
								let single = newentries == 1;
								let bar = BDFDB.NotificationUtils.notice(`There ${single ? "is" : "are"} ${newentries} new Theme${single ? "" : "s"} in the Repo. Check:`, {
									type: "success",
									btn: "ThemeRepo",
									selector: "themerepo-notice themerepo-newentries-notice",
									customicon: themeRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#7f8186/gi, "#B9BBBE")
								});
								bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", _ => {
									this.openThemeRepoModal({forcedSort:"new",forcedOrder:"asc"});
									bar.querySelector(BDFDB.dotCN.noticedismiss).click();
								});
							}
							
							if (BDFDB.UserUtils.me.id == "278543574059057154") {
								let wrongUrls = [];
								for (let url of foundThemes) if (url && !loadedThemes[url] && !wrongUrls.includes(url)) wrongUrls.push(url);
								if (wrongUrls.length) {
									let bar = BDFDB.NotificationUtils.notice(`ThemeRepo: ${wrongUrls.length} Theme${wrongUrls.length > 1 ? "s" : ""} could not be loaded.`, {
										type: "danger",
										btn: "List",
										selector: "themerepo-notice themerepo-fail-notice",
										customicon: themeRepoIcon.replace(/#7289da/gi, "#FFF").replace(/#7f8186/gi, "#B9BBBE")
									});
									bar.querySelector(BDFDB.dotCN.noticebutton).addEventListener("click", e => {
										let toast = BDFDB.NotificationUtils.toast(wrongUrls.join("\n"), {type: "error"});
										toast.style.setProperty("overflow", "hidden");
										for (let url of wrongUrls) console.log(url);
									});
								}
							}
							
							BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/GeneratorList.txt", (error3, response3, body3) => {
								if (!error3 && body3) for (let url of body3.replace(/[\r\t]/g, "").split("\n").filter(n => n)) if (loadedThemes[url]) generatorThemes.push(url);
							});
						});
					});
				}
			});
			 
			getThemeInfo = (callback) => {
				if (i >= foundThemes.length || !this.started || !loading.is) {
					callback();
					return;
				}
				let url = foundThemes[i];
				let requesturl = NFLDreplace && url.includes("NFLD99/Better-Discord/master/Themes") ? url.replace("master/Themes", "master/" + NFLDreplace) : url;
				BDFDB.LibraryRequires.request(requesturl, (error, response, body) => {
					if (!response) {
						if (url && BDFDB.ArrayUtils.getAllIndexes(foundThemes, url).length < 2) foundThemes.push(url);
					}
					else if (body && body.indexOf("404: Not Found") != 0 && response.statusCode == 200) {
						let theme = {}, text = body;
						if ((text.split("*//").length > 1 || text.indexOf("/**") == 0) && text.split("\n").length > 1) {
							let hasMETAline = text.replace(/\s/g, "").indexOf("//META{");
							if (hasMETAline < 20 && hasMETAline > -1) {
								let searchtext = text.replace(/\s*:\s*/g, ":").replace(/\s*}\s*/g, "}");
								for (let tag of tags) {
									let result = searchtext.split('"' + tag + '":"');
									result = result.length > 1 ? result[1].split('",')[0].split('"}')[0] : null;
									result = result && tag != "version" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
									theme[tag] = result ? result.trim() : result;
								}
							}
							else {
								let searchtext = text.replace(/[\r\t| ]*\*\s*/g, "*");
								for (let tag of tags) {
									let result = searchtext.split('@' + tag + ' ');
									result = result.length > 1 ? result[1].split('\n')[0] : null;
									result = result && tag != "version" ? result.charAt(0).toUpperCase() + result.slice(1) : result;
									theme[tag] = result ? result.trim() : result;
								}
							}
							
							let valid = true;
							for (let tag of tags) if (theme[tag] === null) valid = false;
							if (valid) {
								theme.fullcss = text;
								theme.css = hasMETAline < 20 && hasMETAline > -1 ? text.split("\n").slice(1).join("\n").replace(/[\r|\n|\t]/g, "") : text.replace(/[\r|\n|\t]/g, "");
								theme.url = url;
								theme.requesturl = requesturl;
								loadedThemes[url] = theme;
								let instTheme = BDFDB.BDUtils.getTheme(theme.name);
								if (instTheme && instTheme.author.toUpperCase() == theme.author.toUpperCase() && instTheme.version != theme.version) outdated++;
								if (!cachedThemes.includes(url)) newentries++;
							}
						}
					}
					i++;
					
					let loadingtooltip = document.querySelector(".themerepo-loading-tooltip");
					if (loadingtooltip) {
						BDFDB.DOMUtils.setText(loadingtooltip, this.getLoadingTooltipText());
						BDFDB.TooltipUtils.update(loadingtooltip);
					}
					
					getThemeInfo(callback);
				});
			}
		}

		getLoadingTooltipText () {
			return `Loading ThemeRepo - [${Object.keys(loadedThemes).length}/${Object.keys(grabbedThemes).length}]`;
		}

		checkForNewThemes () {
			BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeRepo/res/ThemeList.txt", (error, response, result) => {
				if (response && !BDFDB.equals(result.replace(/\t|\r/g, "").split("\n").filter(n => n), grabbedThemes)) {
					loading = {is:false, timeout:null, amount:0};
					this.loadThemes();
				}
			});
		}

		downloadTheme (data) {
			BDFDB.LibraryRequires.request(data.requesturl, (error, response, body) => {
				if (error) BDFDB.NotificationUtils.toast(`Unable to download Theme "${data.name}".`, {type:"danger"});
				else this.createThemeFile(data.requesturl.split("/").pop(), body);
			});
		}

		createThemeFile (filename, content) {
			BDFDB.LibraryRequires.fs.writeFile(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getThemesFolder(), filename), content, (error) => {
				if (error) BDFDB.NotificationUtils.toast(`Unable to save Theme "${filename}".`, {type:"danger"});
				else BDFDB.NotificationUtils.toast(`Successfully saved Theme "${filename}".`, {type:"success"});
			});
		}

		applyTheme (data) {
			if (BDFDB.BDUtils.isThemeEnabled(data.name) == false) {
				BDFDB.DOMUtils.remove(`style#${data.name}`);
				document.head.appendChild(BDFDB.DOMUtils.create(`<style id=${data.name}>${data.css}</style>`));
				window.themeModule.enableTheme(data.name);
				BDFDB.LogUtils.log(`Applied Theme ${data.name}.`, this.name);
			}
		}

		deleteThemeFile (data) {
			let filename = data.requesturl.split("/").pop();
			BDFDB.LibraryRequires.fs.unlink(BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getThemesFolder(), filename), (error) => {
				if (error) BDFDB.NotificationUtils.toast(`Unable to delete Theme "${filename}".`, {type:"danger"});
				else BDFDB.NotificationUtils.toast(`Successfully deleted Theme "${filename}".`);
			});
		}

		removeTheme (data) {
			if (BDFDB.BDUtils.isThemeEnabled(data.name) == true) {
				BDFDB.DOMUtils.remove(`style#${data.name}`);
				window.themeModule.disableTheme(data.name);
				BDFDB.LogUtils.log(`Removed Theme ${data.name}.`, this.name);
			}
		}
	}
})();