//META{"name":"ThemeSettings","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ThemeSettings","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ThemeSettings/ThemeSettings.plugin.js"}*//

class ThemeSettings {
	getName () {return "ThemeSettings";}

	getVersion () {return "1.1.6";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to change Theme Variables within BetterDiscord. Adds a Settings button (similar to Plugins) to customizable Themes in your Themes Page.";}

	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};
		
		this.patchModules = {
			V2C_ThemeCard: "render"
		};
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
			
			this.dir = BDFDB.BDUtils.getThemesFolder();

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

	processV2CThemeCard (e) {
		if (e.instance.props && e.instance.props.theme && !e.instance.state.settings) {
			let vars = this.getThemeVars(e.instance.props.theme.css);
			if (vars.length) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {props: [["className", BDFDB.disCN._repofooter]]});
				if (index == -1) {
					let footer = BDFDB.ReactUtils.createElement("div", {className: BDFDB.disCN._repofooter, children: []});
					e.returnvalue.props.children.push(footer);
					children = footer.props.children;
				}
				else children = children[index].props.children;
				children.push(BDFDB.ReactUtils.createElement("button", {
					className: BDFDB.disCNS._reposettingsbutton,
					children: "Settings",
					onClick: event => {
						let wrapper = BDFDB.DOMUtils.getParent(BDFDB.dotCN._reposettingsclosed, event.currentTarget);
						BDFDB.DOMUtils.addClass(wrapper, BDFDB.disCN._reposettingsopen);
						BDFDB.DOMUtils.removeClass(wrapper, BDFDB.disCN._reposettingsclosed);
						let children = [];
						while (wrapper.childElementCount) {
							children.push(wrapper.firstChild);
							wrapper.firstChild.remove();
						}
						let closebutton = BDFDB.DOMUtils.create(`<div style="float: right; cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" style="width: 18px; height: 18px;"><g class="background" fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="#dcddde" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg></div>`);
						wrapper.appendChild(closebutton);
						closebutton.addEventListener("click", () => {
							BDFDB.DOMUtils.removeClass(wrapper, BDFDB.disCN._reposettingsopen);
							BDFDB.DOMUtils.addClass(wrapper, BDFDB.disCN._reposettingsclosed);
							while (wrapper.childElementCount) wrapper.firstChild.remove();
							while (children.length) wrapper.appendChild(children.shift());
						})
						this.createThemeSettings(wrapper, e.instance.props.theme, vars);
					}
				}));
			}
		}
	}

	getThemeVars (css) {
		let vars = css.split(":root");
		if (vars.length > 1) {
			vars = vars[1].replace(/\t\(/g, " (").replace(/\r|\t| {2,}/g, "").replace(/\/\*\n*((?!\/\*|\*\/).|\n)*\n+((?!\/\*|\*\/).|\n)*\n*\*\//g, "").replace(/\n\/\*.*?\*\//g, "").replace(/\n/g, "");
			vars = vars.split("{");
			vars.shift();
			vars = vars.join("{").replace(/\s*(:|;|--|\*)\s*/g, "$1");
			vars = vars.split("}")[0];
			return vars.slice(2).split(/;--|\*\/--/);
		}
		return [];
	}

	createThemeSettings (wrapper, theme, vars) {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settingsitems = [];
		
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
			type: "Button",
			className: BDFDB.disCN.marginbottom8,
			color: BDFDB.LibraryComponents.Button.Colors.GREEN,
			label: "Update all variables",
			onClick: _ => {
				let path = BDFDB.LibraryRequires.path.join(this.dir, theme.filename);
				let css = BDFDB.LibraryRequires.fs.readFileSync(path).toString();
				if (css) {
					let amount = 0;
					for (let input of wrapper.querySelectorAll(BDFDB.dotCN.input)) {
						let oldvalue = input.getAttribute("placeholder");
						let newvalue = input.value;
						if (newvalue && newvalue.trim() && newvalue != oldvalue) {
							let varname = input.getAttribute("varname");
							css = css.replace(new RegExp(`--${BDFDB.StringUtils.regEscape(varname)}(\\s*):(\\s*)${BDFDB.StringUtils.regEscape(oldvalue)}`,"g"),`--${varname}$1:$2${newvalue}`);
							amount++;
						}
					}
					if (amount > 0) {
						BDFDB.LibraryRequires.fs.writeFileSync(path, css);
						BDFDB.NotificationUtils.toast(`Updated ${amount} variable${amount == 1 ? "" : "s"} in ${theme.filename}`, {type:"success"});
					}
					else BDFDB.NotificationUtils.toast(`There are no changed variables to be updated in ${theme.filename}`, {type:"warning"});
				}
				else BDFDB.NotificationUtils.toast(`Could not find themefile: ${theme.filename}`, {type:"error"});
			},
			children: "Update"
		}));

		for (let varstr of vars) {
			varstr = varstr.split(":");
			let varname = varstr.shift().trim();
			varstr = varstr.join(":").split(/;[^A-z0-9]|\/\*/);
			let varvalue = varstr.shift().trim();
			if (varvalue) {
				let childType = "text", childMode = "";
				let iscolor = BDFDB.ColorUtils.getType(varvalue);
				let iscomp = !iscolor && /[0-9 ]+,[0-9 ]+,[0-9 ]+/g.test(varvalue);
				if (iscolor || iscomp) {
					childType = "color";
					childMode = iscomp && "comp";
				}
				else {
					let isurlfile = /url\(.+\)/gi.test(varvalue);
					let isfile = !isurlfile && /(http(s)?):\/\/[(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(varvalue);
					if (isfile || isurlfile) {
						childType = "file";
						childMode = isurlfile && "url";
					}
				}
				let vardescription = varstr.join("").replace(/\*\/|\/\*/g, "").replace(/:/g, ": ").replace(/: \//g, ":/").replace(/--/g, " --").replace(/\( --/g, "(--").trim();
				settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
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
					varname: varname,
					value: varvalue,
					placeholder: varvalue
				}));
			}
		}
		
		wrapper.appendChild(BDFDB.PluginUtils.createSettingsPanel(theme, settingsitems));
	}
}