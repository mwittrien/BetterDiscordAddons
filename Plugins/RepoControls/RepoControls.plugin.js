//META{"name":"RepoControls","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RepoControls","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RepoControls/RepoControls.plugin.js"}*//

var RepoControls = (_ => {
	return class RepoControls {
		getName () {return "RepoControls";}

		getVersion () {return "1.3.5";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Lets you sort and filter your list of downloaded Themes and Plugins.";}

		constructor () {
			this.changelog = {
				"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
			};

			this.patchedModules = {
				after: {
					V2C_List: "render",
					V2C_PluginCard: "render",
					V2C_ThemeCard: "render",
					V2C_ContentColumn: "render"
				}
			};
		}

		initConstructor () {
			this.defaults = {
				settings: {
					addEditButton:		{value:true, 	description:"Adds an Edit Button to your Plugin and Theme List."},
					addDeleteButton:	{value:true, 	description:"Adds a Delete Button to your Plugin and Theme List."},
					confirmDelete:		{value:true, 	description:"Asks for your confirmation before deleting a File."}
				},
				sortings: {
					sort: {
						value: "name",
						label: "Sortkey:",
						values: {
							name:			"Name",
							author:			"Author",
							version:		"Version",
							description:	"Description",
							enabled:		"Enabled",
							adddate:		"Added",
							moddate:		"Modified"
						}
					},
					order: {
						value: "asc",
						label: "Order:",
						values: {
							asc:			"Ascending",
							desc:			"Descending"
						}
					}
				}
			};
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let settingspanel, settingsitems = [];
			
			for (let key in settings) settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
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

		processV2CContentColumn (e) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "V2C_List"});
			if (index > -1) {
				let list = children[index];
				this.injectControls(e.instance, list, children, index, children[index].key.split("-")[0]);
				this.sortEntries(null, list);
			}
		}

		processV2CPluginCard (e) {
			this.processV2CThemeCard(e);
		}

		processV2CThemeCard (e) {
			if (!e.instance.props.RCdata) return;
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["className", "bda-controls"]]});
			if (index > -1) {
				let settings = BDFDB.DataUtils.get(this, "settings");
				if (settings.addDeleteButton) children[index].props.children.unshift(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: BDFDB.LanguageUtils.LanguageStrings.DELETE,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
						className: BDFDB.disCN._repoentryiconwrapper,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.disCN.svgicon,
							name: BDFDB.LibraryComponents.SvgIcon.Names.NOVA_TRASH
						}),
						onClick: _ => {
							let deleteFile = _ => {
								BDFDB.LibraryRequires.fs.unlink(e.instance.props.RCdata.path, (error) => {
									if (error) BDFDB.NotificationUtils.toast(`Unable to delete ${e.instance.props.RCdata.type} "${e.returnvalue.props["data-name"]}".`, {type:"danger"});
									else BDFDB.NotificationUtils.toast(`Successfully deleted ${e.instance.props.RCdata.type} "${e.returnvalue.props["data-name"]}".`, {type:"success"});
								});
							};
							if (!settings.confirmDelete) deleteFile();
							else BDFDB.ModalUtils.confirm(this, `Are you sure you want to delete the ${e.instance.props.RCdata.type} "${e.returnvalue.props["data-name"]}"?`, deleteFile);
						}
					})
				}));
				if (settings.addEditButton) children[index].props.children.unshift(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: BDFDB.LanguageUtils.LanguageStrings.EDIT,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
						className: BDFDB.disCN._repoentryiconwrapper,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.disCN.svgicon,
							name: BDFDB.LibraryComponents.SvgIcon.Names.PENCIL
						}),
						onClick: _ => {
							if (!BDFDB.LibraryRequires.electron.shell.openItem(e.instance.props.RCdata.path)) BDFDB.NotificationUtils.toast(`Unable to open the ${e.instance.props.RCdata.type} "${e.returnvalue.props["data-name"]}".`, {type:"danger"});
						}
					})
				}));
				this.highlightSearchKey(e);
			}
		}
		
		injectControls (instance, parent, children, index, type) {
			let sortings = BDFDB.DataUtils.get(this, "sortings");
			this.searchTimeout;
			children.splice(index, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
				className: BDFDB.disCN.marginbottom8,
				justify: BDFDB.LibraryComponents.Flex.Justify.BETWEEN,
				align: BDFDB.LibraryComponents.Flex.Align.CENTER,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SearchBar, {
						onChange: value => {
							BDFDB.TimeUtils.clear(this.searchTimeout);
							this.searchTimeout = BDFDB.TimeUtils.timeout(_ => {
								this.sortEntries(instance, parent, value);
							}, 1000);
						},
						onClear: _ => {
							this.sortEntries(instance, parent, "");
						}
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
						color: BDFDB.LibraryComponents.Button.Colors.GREEN,
						size: BDFDB.LibraryComponents.Button.Sizes.MIN,
						onClick: _ => {
							this.toggleAll(type, instance, true);
						},
						children: "Enable All"
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
						color: BDFDB.LibraryComponents.Button.Colors.RED,
						size: BDFDB.LibraryComponents.Button.Sizes.MIN,
						onClick: _ => {
							this.toggleAll(type, instance, false);
						},
						children: "Disable All"
					}),
				].concat(Object.keys(sortings).map(key => 
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.QuickSelect, {
						nativeComponent: true,
						label: this.defaults.sortings[key].label,
						value: {
							label: this.defaults.sortings[key].values[sortings[key]],
							value: sortings[key]
						},
						options: Object.keys(this.defaults.sortings[key].values).map(valuekey => {return {
							label: this.defaults.sortings[key].values[valuekey],
							value: valuekey
						}}),
						onChange: value => {
							BDFDB.DataUtils.save(value, this, "sortings", key);
							this.sortEntries(instance, parent);
						}
					})
				))
			}));
		}

		sortEntries (instance, parent, searchkey = parent.props.searchkey) {
			if (instance) instance = BDFDB.ReactUtils.findOwner(instance, {name: "V2C_List"});
			
			let sortings = BDFDB.DataUtils.get(this, "sortings");
			
			parent.props.searchkey = (searchkey || "").toUpperCase();
			
			if (!parent.props.entries) parent.props.entries = parent.props.children;
			
			let entries = [].concat(parent.props.entries);
			
			for (let i in entries) {
				let entry = entries[i];
				if (!entry.props.RCdata) {
					entry.props.RCdata = {};
					if (entry.props.plugin) {
						["name", "author", "version", "description"].forEach(key => {
							let funcname = "get" + key.charAt(0).toUpperCase() + key.slice(1);
							let value = typeof entry.props.plugin[funcname] == "function" ? entry.props.plugin[funcname]() : "";
							if (value) entry.props.RCdata[key] = value.toUpperCase().trim();
							else entry.props.RCdata[key] = "";
						});
						entry.props.RCdata.type = "plugin";
						entry.props.RCdata.enabled = BDFDB.BDUtils.isPluginEnabled(entry.key) ? 1 : 2;
						entry.props.RCdata.path = window.bdplugins && window.bdplugins[entry.key] && typeof window.bdplugins[entry.key].filename == "string" && BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), window.bdplugins[entry.key].filename);
					}
					else if (entry.props.theme) {
						["name", "author", "version", "description"].forEach(key => {
							if (entry.props.theme[key]) entry.props.RCdata[key] = entry.props.theme[key].toUpperCase().trim();
							else entry.props.RCdata[key] = "";
						});
						entry.props.RCdata.type = "theme";
						entry.props.RCdata.enabled = BDFDB.BDUtils.isThemeEnabled(entry.key) ? 1 : 2;
						entry.props.RCdata.path = window.bdthemes && window.bdthemes[entry.key] && typeof window.bdthemes[entry.key].filename == "string" && BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getThemesFolder(), window.bdthemes[entry.key].filename);
					}
					let stats = entry.props.RCdata.path && BDFDB.LibraryRequires.fs.statSync(entry.props.RCdata.path);
					entry.props.RCdata.adddate = stats && stats.atime.getTime();
					entry.props.RCdata.moddate = stats && stats.mtime.getTime();
					entry.props.RCdata.search = [entry.props.RCdata.name, entry.props.RCdata.author, entry.props.RCdata.description].filter(n => n).join(" ");
				}
				entry.props.RCdata.searchkey = parent.props.searchkey;
				if (parent.props.searchkey && entry.props.RCdata.search.indexOf(parent.props.searchkey) == -1) entries[i] = null;
			}
			
			let order = sortings.order == "asc" ? -1 : 1;
			parent.props.children = entries.filter(n => n).sort(function (x, y) {
				return x.props.RCdata[sortings.sort] < y.props.RCdata[sortings.sort] ? order : x.props.RCdata[sortings.sort] > y.props.RCdata[sortings.sort] ? order * -1 : 0;
			});
			
			if (instance) {
				BDFDB.ReactUtils.forceUpdate(instance);
				BDFDB.TimeUtils.timeout(_ => {BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(instance, {name: ["V2C_PluginCard", "V2C_ThemeCard"]}));});
			}
		}
		
		highlightSearchKey (e) {
			if (!e.instance.props.RCdata.searchkey) return;
			[BDFDB.disCN._reponame, BDFDB.disCN._repoauthor, BDFDB.disCN._repodescription].forEach(className => {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["className", className]]});
				if (index > -1) {
					let originalText = BDFDB.StringUtils.htmlEscape(children[index].props.children);
					let highlightedText = BDFDB.StringUtils.highlight(originalText, e.instance.props.RCdata.searchkey);
					if (highlightedText != originalText) children[index].props.children = BDFDB.ReactUtils.elementToReact(BDFDB.DOMUtils.create(highlightedText));
				}
			});
		}

		toggleAll (type, instance, enable) {
			let listnode = BDFDB.ReactUtils.findDOMNode(BDFDB.ReactUtils.findOwner(instance, {name: "V2C_List"}));
			if (listnode) BDFDB.ModalUtils.confirm(this, `Are you sure you want to ${enable ? "enable" : "disable"} all ${type[0].toUpperCase() + type.slice(1)}s?`, _ => {
				for (let header of listnode.querySelectorAll(BDFDB.dotCN._repoheader)) {
					if (header.querySelector(BDFDB.dotCN._reponame).textContent.toLowerCase().indexOf(this.name.toLowerCase()) != 0) {
						let switchwrap = header.querySelector(BDFDB.dotCN._repocheckboxwrap);
						if (switchwrap) {
							let switchinner = switchwrap.querySelector(BDFDB.dotCN._repocheckboxinner);
							let switchinput = switchwrap.querySelector(BDFDB.dotCN._repocheckbox);
							if (switchinner && switchinput) {
								if (BDFDB.DOMUtils.containsClass(switchinner, BDFDB.disCN._repocheckboxchecked) && !enable) switchinput.click();
								else if (!BDFDB.DOMUtils.containsClass(switchinner, BDFDB.disCN._repocheckboxchecked) && enable) switchinput.click();
							}
						}
					}
				}
			});
		}
	}
})();