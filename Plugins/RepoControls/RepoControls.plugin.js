//META{"name":"RepoControls","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RepoControls","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/RepoControls/RepoControls.plugin.js"}*//

class RepoControls {
	getName () {return "RepoControls";}

	getVersion () {return "1.3.3";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Lets you sort and filter your list of downloaded Themes and Plugins.";}

	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};

		this.patchModules = {
			V2C_List: "render",
			V2C_PluginCard: "render",
			V2C_ThemeCard: "render",
			V2C_ContentColumn: "render"
		};
	}

	initConstructor () {
		this.css = `
			.RC-button {
				margin-right: 5px;
			}
		`;

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
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		let settingsitems = [];
		
		for (let key in settings) settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
			className: BDFDB.disCN.marginbottom8,
			type: "Switch",
			plugin: this,
			keys: ["settings", key],
			label: this.defaults.settings[key].description,
			value: settings[key]
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
			if (settings.addDeleteButton) children[index].props.children.unshift(this.createDeleteButton(e));
			if (settings.addEditButton) children[index].props.children.unshift(this.createEditButton(e));
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
					popoutClassName: BDFDB.disCN.contextmenu,
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
					entry.props.RCdata.path = window.bdplugins && window.bdplugins[entry.key] && BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), window.bdplugins[entry.key].filename);
				}
				else if (entry.props.theme) {
					["name", "author", "version", "description"].forEach(key => {
						if (entry.props.theme[key]) entry.props.RCdata[key] = entry.props.theme[key].toUpperCase().trim();
						else entry.props.RCdata[key] = "";
					});
					entry.props.RCdata.type = "theme";
					entry.props.RCdata.enabled = BDFDB.BDUtils.isThemeEnabled(entry.key) ? 1 : 2;
					entry.props.RCdata.path = window.bdthemes && window.bdthemes[entry.key] && BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getThemesFolder(), window.bdthemes[entry.key].filename);
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
	
	createDeleteButton (e) {
		return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
			text: BDFDB.LanguageUtils.LanguageStrings.DELETE,
			children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
				className: "RC-deleteButton RC-button",
				look: BDFDB.LibraryComponents.Button.Looks.BLANK,
				size: BDFDB.LibraryComponents.Button.Sizes.NONE,
				onClick: _ => {
					let deleteFile = () => {
						BDFDB.LibraryRequires.fs.unlink(e.instance.props.RCdata.path, (error) => {
							if (error) BDFDB.NotificationUtils.toast(`Unable to delete ${e.instance.props.RCdata.type} "${e.returnvalue.props["data-name"]}".`, {type:"danger"});
							else BDFDB.NotificationUtils.toast(`Successfully deleted ${e.instance.props.RCdata.type} "${e.returnvalue.props["data-name"]}".`, {type:"success"});
						});
					};
					if (!BDFDB.DataUtils.get(this, "settings", "confirmDelete")) deleteFile();
					else BDFDB.ModalUtils.confirm(this, `Are you sure you want to delete the ${e.instance.props.RCdata.type} "${e.returnvalue.props["data-name"]}"?`, deleteFile);
				},
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
					iconSVG: `<svg width="24" height="24"><g fill="currentColor" transform="translate(2,1.5)"><path d="M 18.012, 0.648 H 12.98 C 12.944, 0.284, 12.637, 0, 12.264, 0 H 8.136 c -0.373, 0 -0.68, 0.284 -0.716, 0.648 H 2.389 c -0.398, 0 -0.72, 0.322 -0.72, 0.72 v 1.368 c 0, 0.398, 0.322, 0.72, 0.72, 0.72 h 15.623 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 1.368 C 18.731, 0.97, 18.409, 0.648, 18.012, 0.648 z"/><path d="M 3.178, 4.839 v 14.841 c 0, 0.397, 0.322, 0.72, 0.72, 0.72 h 12.604 c 0.398, 0, 0.72 -0.322, 0.72 -0.72 V 4.839 H 3.178 z M 8.449, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 c -0.438, 0 -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z M 13.538, 15.978 c 0, 0.438 -0.355, 0.794 -0.794, 0.794 s -0.794 -0.355 -0.794 -0.794 V 8.109 c 0 -0.438, 0.355 -0.794, 0.794 -0.794 c 0.438, 0, 0.794, 0.355, 0.794, 0.794 V 15.978 z"/></g></svg>`
				})
			})
		});
	}
	
	createEditButton (e) {
		return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
			text: BDFDB.LanguageUtils.LanguageStrings.EDIT,
			children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
				className: "RC-editButton RC-button",
				look: BDFDB.LibraryComponents.Button.Looks.BLANK,
				size: BDFDB.LibraryComponents.Button.Sizes.NONE,
				onClick: _ => {
					if (!BDFDB.LibraryRequires.electron.shell.openItem(e.instance.props.RCdata.path)) {
						BDFDB.NotificationUtils.toast(`Unable to open the ${e.instance.props.RCdata.type} "${e.returnvalue.props["data-name"]}".`, {type:"danger"});
					}
				},
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
					iconSVG: `<svg width="24" height="24" viewBox="-80 -55 620 620"><g fill="currentColor" fill-rule="evenodd"><path d="M 496.093, 189.613c -18.643 -15.674 -47.168 -13.807 -63.354, 5.493l -9.727, 11.508l 68.945, 57.849l 9.288 -11.466 C 517.22, 233.997, 515.199, 205.621, 496.093, 189.613z"/><path d="M 301.375, 350.534l -5.131, 6.072c -4.453, 5.332 -7.661, 11.704 -9.272, 18.457l -13.945, 58.359 c -1.318, 5.522, 0.601, 11.323, 4.951, 14.971c 4.234, 3.558, 10.206, 4.591, 15.601, 2.285l 55.063 -23.877 c 6.372 -2.769, 12.085 -7.031, 16.538 -12.319l 5.149 -6.092L 301.375, 350.534z"/><polygon points ="403.656, 229.517 320.733, 327.631 389.683, 385.487 472.601, 287.366"/><path d="M 376.02, 66.504l -56.982 -54.141c -5.387 -5.107 -12.014 -8.115 -18.999 -10.069V 90h 89.052 C 387.23, 81.09, 382.69, 72.836, 376.02, 66.504z"/><path d="M 257.792, 368.091c 2.681 -11.221, 8.027 -21.841, 15.439 -30.718l 116.807 -138.214V 120h -105c -8.291, 0 -15 -6.709 -15 -15V 0h -225 c -24.814, 0 -45, 20.186 -45, 45v 422c 0, 24.814, 20.186, 45, 45, 45h 300c 24.814, 0, 45 -20.186, 45 -45v -35.459l -1.948, 2.305 c -7.368, 8.775 -16.875, 15.85 -27.466, 20.465l -55.107, 23.892c -15.532, 6.707 -33.511, 4.331 -46.816 -6.812 c -13.14 -11.03 -18.838 -28.242 -14.854 -44.941L 257.792, 368.091z M 75.038, 90h 150c 8.291, 0, 15, 6.709, 15, 15s -6.709, 15 -15, 15h -150 c -8.291, 0 -15 -6.709 -15 -15S 66.747, 90, 75.038, 90z M 75.038, 181h 240c 8.291, 0, 15, 6.709, 15, 15s -6.709, 15 -15, 15h -240 c -8.291, 0 -15 -6.709 -15 -15S 66.747, 181, 75.038, 181z M 195.038, 391h -120c -8.291, 0 -15 -6.709 -15 -15c 0 -8.291, 6.709 -15, 15 -15h 120 c 8.291, 0, 15, 6.709, 15, 15C 210.038, 384.291, 203.329, 391, 195.038, 391z M 75.038, 301c -8.291, 0 -15 -6.709 -15 -15c 0 -8.291, 6.709 -15, 15 -15 h 180c 8.291, 0, 15, 6.709, 15, 15c 0, 8.291 -6.709, 15 -15, 15H 75.038z"/></g></svg>`
				})
			})
		});
	}

	toggleAll (type, instance, enable) {
		let listnode = BDFDB.ReactUtils.findDOMNode(BDFDB.ReactUtils.findOwner(instance, {name: "V2C_List"}));
		if (listnode) BDFDB.ModalUtils.confirm(this, `Are you sure you want to ${enable ? "enable" : "disable"} all ${type[0].toUpperCase() + type.slice(1)}s?`, () => {
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