//META{"name":"ThemeSettings","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ThemeSettings","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ThemeSettings/ThemeSettings.plugin.js"}*//

class ThemeSettings {
	getName () {return "ThemeSettings";}

	getVersion () {return "1.1.5";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to change Theme Variables within BetterDiscord. Adds a Settings button (similar to Plugins) to customizable Themes in your Themes Page.";}

	constructor () {
		this.changelog = {
			"improved":[["Colorpicker & Filenavigator","The plugin now tries to guess if whether an input is used as a colorinput or a fileinput and adds elements to more easily change them"]]
		};
		
		this.patchModules = {
			"V2C_ThemeCard":"componentDidMount"
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
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
					if (body) {
						libraryScript = document.createElement("script");
						libraryScript.setAttribute("id", "BDFDBLibraryScript");
						libraryScript.setAttribute("type", "text/javascript");
						libraryScript.setAttribute("date", performance.now());
						libraryScript.innerText = body;
						document.head.appendChild(libraryScript);
					}
					this.initialize();
				});
			}, 15000);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);
			
			this.dir = BDFDB.getThemesFolder();

			BDFDB.WebModules.forceAllUpdates(this);
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			BDFDB.removeEles(".themes-settings-button",".themes-settings-footer");
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	processV2CThemeCard (instance, wrapper) {
		if (instance.props && instance.props.theme && !wrapper.querySelector(BDFDB.dotCN._reposettingsbutton + ".themes-settings-button")) {
			let vars = this.getThemeVars(instance.props.theme.css);
			if (vars.length) {
				let footer = wrapper.querySelector(BDFDB.dotCN._repofooter);
				if (!footer) {
					footer = document.createElement("div");
					footer.className = BDFDB.disCNS._repofooter + "themes-settings-footer";
					wrapper.appendChild(footer);
				}
				let button = document.createElement("button");
				button.className = BDFDB.disCNS._reposettingsbutton + "themes-settings-button";
				button.innerText = "Settings";
				footer.appendChild(button);
				button.addEventListener("click", () => {
					BDFDB.addClass(wrapper, BDFDB.disCN._reposettingsopen);
					BDFDB.removeClass(wrapper, BDFDB.disCN._reposettingsclosed);
					let children = [];
					while (wrapper.childElementCount) {
						children.push(wrapper.firstChild);
						wrapper.firstChild.remove();
					}
					let closebutton = BDFDB.htmlToElement(`<div style="float: right; cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" style="width: 18px; height: 18px;"><g class="background" fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="#dcddde" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg></div>`);
					wrapper.appendChild(closebutton);
					closebutton.addEventListener("click", () => {
						BDFDB.removeClass(wrapper, BDFDB.disCN._reposettingsopen);
						BDFDB.addClass(wrapper, BDFDB.disCN._reposettingsclosed);
						while (wrapper.childElementCount) wrapper.firstChild.remove();
						while (children.length) wrapper.appendChild(children.shift());
					})
					this.createThemeSettings(wrapper, instance.props.theme, vars);
				});
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
		var settingshtml = `<div class="theme-settings" id="theme-settings-${theme.name}"><div class="${theme.name}-settings BDFDB-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${BDFDB.encodeToHTML(theme.name)}</div><div class="BDFDB-settings-inner"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Update all variables</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorgreen + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} update-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Update</div></button></div></div></div>`;

		let settingspanel = BDFDB.htmlToElement(settingshtml);
		var settingspanelinner = settingspanel.querySelector(".BDFDB-settings-inner");

		var maxwidth = BDFDB.getRects(wrapper).width - 80;

		for (let varstr of vars) {
			varstr = varstr.split(":");
			let varname = varstr.shift().trim();
			varstr = varstr.join(":").split(/;[^A-z0-9]|\/\*/);
			let varvalue = varstr.shift().trim();
			if (varvalue) {
				let vardescription = varstr.join("").replace(/\*\/|\/\*/g, "").replace(/:/g, ": ").replace(/: \//g, ":/").replace(/--/g, " --").replace(/\( --/g, "(--").trim();
				vardescription = vardescription && vardescription.indexOf("*") == 0 ? vardescription.slice(1) : vardescription;
				let varcontainer = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.directioncolumn + BDFDB.disCNS.justifystart + BDFDB.disCNS.alignstretch + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom20} varcontainer" style="flex: 1 1 auto;"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCN.nowrap}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild} BDFDB-textscrollwrapper" style="flex: 0 0 30%;"><div class="BDFDB-textscroll">${varname[0].toUpperCase() + varname.slice(1)}</div></h3><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex2 + BDFDB.disCN.directioncolumn}" style="flex: 1 1 auto;"><input type="text" option="${varname}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16} varinput"></div><button type="button" class="${BDFDB.disCN.colorpickerswatch} single-swatch" style="background-color: black;"></button><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorbrand + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} file-navigator" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}"></div><input type="file" accept="image/*" style="display:none!important;"></button></div>${vardescription ? `<div class="${BDFDB.disCNS.description + BDFDB.disCNS.note + BDFDB.disCN.primary} BDFDB-textscrollwrapper" style="flex: 1 1 auto; max-width: ${maxwidth}px !important;"><div class="BDFDB-textscroll">${BDFDB.encodeToHTML(vardescription)}</div></div>` : ""}${vars[vars.length-1] == varstr ? '' : `<div class="${BDFDB.disCNS.modaldivider + BDFDB.disCN.modaldividerdefault}"></div>`}</div>`);
				let varinput = varcontainer.querySelector(BDFDB.dotCN.input);
				varinput.value = varvalue;
				varinput.setAttribute("placeholder", varvalue);
				
				let swatch = varcontainer.querySelector(".single-swatch");
				let navigator = varcontainer.querySelector(".file-navigator");
				
				let iscolor = BDFDB.colorTYPE(varvalue);
				let iscomp = !iscolor && /[0-9 ]+,[0-9 ]+,[0-9 ]+/g.test(varvalue);
				let isurlfile = !iscolor && !iscolor && /url\(.+\)/gi.test(varvalue);
				let isfile = !iscolor && !iscolor && !isurlfile && /(http(s)?):\/\/[(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(varvalue);
				if (iscolor || iscomp) {
					let color = iscomp ? BDFDB.colorCONVERT(varvalue.split(","), "RGB") : varvalue;
					swatch.style.setProperty("background-color", color, "important");
					swatch.addEventListener("click", e => {
						BDFDB.openColorPicker(varcontainer, e.currentTarget, color, {gradient:false, comp:iscomp, alpha:iscolor});
					});
				}
				else BDFDB.removeEles(swatch);
				if (isurlfile || isfile) {
					navigator.addEventListener("change", e => {
						let file = navigator.querySelector("input").files[0];
						if (file && file.type.indexOf("image") == 0) varinput.value = `${isurlfile ? "url('" : ""}data:${file.type};base64,${BDFDB.LibraryRequires.fs.readFileSync(file.path).toString("base64")}${isurlfile ? "')" : ""}`;
						else varinput.value = varvalue;
					});
				}
				else BDFDB.removeEles(navigator);
				
				settingspanelinner.appendChild(varcontainer);
			}
		}

		BDFDB.initElements(settingspanel, this);

		BDFDB.addEventListener(this, settingspanel, "click", ".update-button", () => {
			let path = BDFDB.LibraryRequires.path.join(this.dir, theme.filename);
			let css = BDFDB.LibraryRequires.fs.readFileSync(path).toString();
			if (css) {
				let amount = 0;
				for (let input of settingspanel.querySelectorAll(BDFDB.dotCN.input)) {
					let oldvalue = input.getAttribute("placeholder");
					let newvalue = input.value;
					if (newvalue && newvalue.trim() && newvalue != oldvalue) {
						let varname = input.getAttribute("option");
						css = css.replace(new RegExp(`--${BDFDB.regEscape(varname)}(\\s*):(\\s*)${BDFDB.regEscape(oldvalue)}`,"g"),`--${varname}$1:$2${newvalue}`);
						amount++;
					}
				}
				if (amount > 0) {
					BDFDB.LibraryRequires.fs.writeFileSync(path, css);
					BDFDB.showToast(`Updated ${amount} variable${amount == 1 ? "" : "s"} in ${theme.filename}`, {type:"success"});
				}
				else BDFDB.showToast(`There are no changed variables to be updated in ${theme.filename}`, {type:"warning"});
			}
			else BDFDB.showToast(`Could not find themefile: ${theme.filename}`, {type:"error"});
		});

		wrapper.appendChild(settingspanel);
	}
}