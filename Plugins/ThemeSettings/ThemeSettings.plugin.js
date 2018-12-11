//META{"name":"ThemeSettings"}*//

class ThemeSettings {
	initConstructor () {}

	getName () {return "ThemeSettings";}

	getDescription () {return "Allows you to change Theme Variables within BetterDiscord.";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDFDB === "object") {
			BDFDB.loadMessage(this);
			
			this.fs = require("fs");
			this.path = require("path");
			this.dir = BDFDB.getThemesFolder();
			
			var observer = null;
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, j) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.tagName && node.querySelector(".ui-switch") && this.isThemesPage()) {
									this.addSettingsButton(node);
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.layer + "[layer-id='user-settings']", {name:"innerSettingsWindowObserver",instance:observer}, {childList:true,subtree:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								setImmediate(() => {
									if (node.tagName && node.getAttribute("layer-id") == "user-settings") {
										BDFDB.addObserver(this, node, {name:"innerSettingsWindowObserver"}, {childList:true,subtree:true});
									}
								});
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.layers, {name:"settingsWindowObserver",instance:observer}, {childList:true});
			
			var settingswindow = document.querySelector(BDFDB.dotCN.layer + "[layer-id='user-settings']");
			if (settingswindow && this.isThemesPage(settingswindow)) {
				for (let li of settingswindow.querySelectorAll(".bda-slist > li")) this.addSettingsButton(li);
			}
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			$(".themes-settings-button, .themes-settings-footer").remove();
			
			BDFDB.unloadMessage(this);
		}
	}
	
	// begin of own functions
	
	isThemesPage (container) {
		if (typeof container === "undefined") container = document.querySelector(BDFDB.dotCN.layer + "[layer-id='user-settings']");
		if (container && container.tagName) {
			var folderbutton = container.querySelector(".bd-pfbtn");
			if (folderbutton) {
				var buttonbar = folderbutton.parentElement;
				if (buttonbar && buttonbar.tagName) {
					var header = buttonbar.querySelector("h2");
					if (header) {
						return BDFDB.getInnerText(header).toLowerCase() === "themes";
					}
				}
			}
		}
		return false;
	}
	
	addSettingsButton (li) {
		if (li && li.tagName && li.tagName == "LI" && !li.querySelector(".bda-settings-button.themes-settings-button")) {
			let nameele = li.querySelector(".bda-name");
			let name = nameele ? nameele.textContent : null;
			if (name && bdthemes[name]) {
				let vars = this.getThemeVars(bdthemes[name].css);
				if (vars.length) {
					let footer = li.querySelector(".bda-footer");
					if (!footer) {
						footer = document.createElement("div");
						footer.className = "bda-footer themes-settings-footer";
						li.appendChild(footer);
					}
					let button = document.createElement("button");
					button.className = "bda-settings-button themes-settings-button";
					button.innerText = "Settings";
					footer.appendChild(button);
					$(button).on("click." + this.getName(), () => {
						li.classList.remove("settings-closed");
						li.classList.add("settings-open");
						let children = [];
						while (li.childElementCount) {
							children.push(li.firstChild);
							li.firstChild.remove();
						}
						$(`<div style="float: right; cursor: pointer;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" style="width: 18px; height: 18px;"><g class="background" fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="#dcddde" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg></div>`)
							.on("click." + this.getName(), () => {
								li.classList.remove("settings-open");
								li.classList.add("settings-closed");
								while (li.childElementCount) li.firstChild.remove();
								while (children.length) li.appendChild(children.shift());
							})
							.appendTo(li);
						li.appendChild(this.createThemeSettings(name, vars));
					});
				}
			}
		}
	}
	
	getThemeVars (css) {
		let vars = css.split(":root");
		if (vars.length > 1) {
			vars = vars[1].replace(/[\t\n\r]/g,"").replace(/\s{2,}/g," ").replace(/\/\*+.*?\*+\//g,"");
			vars = vars.split("{");
			vars.shift();
			vars = vars.join("{").replace(/ (;|--)/g,"$1").replace(/(:) /g,"$1")
			vars = vars.split(";}")[0].slice(2).split(";--");
			if (vars.length > 1) return vars;
		}
		return [];
	}
	
	createThemeSettings (name, vars) {
		if (!this.started || typeof BDFDB !== "object") return;
		var settingshtml = `<div class="theme-settings" id="theme-settings-${name}"><div class="${name}-settings DevilBro-settings"><div class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.size18 + BDFDB.disCNS.height24 + BDFDB.disCNS.weightnormal + BDFDB.disCN.marginbottom8}">${BDFDB.encodeToHTML(name)}</div><div class="DevilBro-settings-inner"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 0 0 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.marginreset + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCNS.height24 + BDFDB.disCN.flexchild}" style="flex: 1 1 auto;">Update all variables</h3><button type="button" class="${BDFDB.disCNS.flexchild + BDFDB.disCNS.button + BDFDB.disCNS.buttonlookfilled + BDFDB.disCNS.buttoncolorgreen + BDFDB.disCNS.buttonsizemedium + BDFDB.disCN.buttongrow} update-button" style="flex: 0 0 auto;"><div class="${BDFDB.disCN.buttoncontents}">Update</div></button></div>`;
		for (let varstr of vars) {
			varstr = varstr.split(":");
			let varname = varstr.shift();
			let varvalue = varstr.join(":");
			let iscontentvar = varvalue[0] == varvalue[varvalue.length-1] && (varvalue[0] == `"` || varvalue[0] == `'`);
			varvalue = iscontentvar ? varvalue.slice(1,-1) : varvalue;
			settingshtml += `<div class="${BDFDB.disCNS.flex + BDFDB.disCNS.flex2 + BDFDB.disCNS.horizontal + BDFDB.disCNS.horizontal2 + BDFDB.disCNS.directionrow + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.marginbottom8}" style="flex: 1 1 auto;"><h3 class="${BDFDB.disCNS.titledefault + BDFDB.disCNS.title + BDFDB.disCNS.weightmedium + BDFDB.disCNS.size16 + BDFDB.disCN.flexchild}" style="flex: 0 0 30%; line-height: 38px;">${varname}:</h3><div class="${BDFDB.disCNS.inputwrapper + BDFDB.disCNS.vertical + BDFDB.disCNS.flex + BDFDB.disCN.directioncolumn}" style="flex: 1 1 auto;"><input type="text" option="${varname}" value="${varvalue}"${iscontentvar ? " iscontent=true" : ""} placeholder="${varvalue}" class="${BDFDB.disCNS.inputdefault + BDFDB.disCNS.input + BDFDB.disCN.size16}"></div></div>`;
		}
		settingshtml += `</div></div>`; 
		
		var settingspanel = $(settingshtml)[0];

		BDFDB.initElements(settingspanel);

		$(settingspanel).on("click", ".update-button", () => {
			let path = this.path.join(this.dir, bdthemes[name].filename);
			let css = this.fs.readFileSync(path).toString();
			if (css) {
				let amount = 0;
				for (let input of settingspanel.querySelectorAll(BDFDB.dotCN.input)) {
					let oldvalue = input.getAttribute("placeholder");
					let newvalue = input.value;
					if (newvalue && newvalue.trim() && newvalue != oldvalue) {
						let varname = input.getAttribute("option");
						if (input.getAttribute("iscontent")) css = css.replace(new RegExp(`--${varname}(\\s*):(\\s*)(["'])${oldvalue}["']`,"g"),`--${varname}$1:$2$3${newvalue}$3`);
						else css = css.replace(new RegExp(`--${varname}(\\s*):(\\s*)${oldvalue}`,"g"),`--${varname}$1:$2${newvalue}`);
						amount++;
					}
				}
				if (amount > 0) {
					this.fs.writeFileSync(path, css);
					BDFDB.showToast(`Updated ${amount} variable${amount == 1 ? "" : "s"} in ${bdthemes[name].filename}`, {type:"success"});
				}
				else BDFDB.showToast(`There are no changed variables to be updated in ${bdthemes[name].filename}`, {type:"warning"});
			}
			else BDFDB.showToast(`Could not find themefile: ${bdthemes[name].filename}`, {type:"error"});
		});
		return settingspanel;
	}
}