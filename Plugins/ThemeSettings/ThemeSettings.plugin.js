/**
 * @name ThemeSettings
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ThemeSettings
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ThemeSettings/ThemeSettings.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ThemeSettings/ThemeSettings.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ThemeSettings",
			"author": "DevilBro",
			"version": "1.3.1",
			"description": "Allow you to change Theme Variables within BetterDiscord. Adds a Settings button (similar to Plugins) to customizable Themes in your Themes Page"
		},
		"changeLog": {
			"improved": {
				"Canary Changes": "Preparing Plugins for the changes that are already done on Discord Canary"
			}
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin, try again later or download it manually from GitHub: https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		const isBeta = !(window.BdApi && !Array.isArray(BdApi.settings));
		
		var dir;
	
		return class ThemeSettings extends Plugin {
			onLoad () {
				dir = BDFDB.BDUtils.getThemesFolder();
			}
			
			onStart () {
				let cardObserver = (new MutationObserver(changes => {changes.forEach(change => {if (change.addedNodes) {change.addedNodes.forEach(node => {
					if (BDFDB.DOMUtils.containsClass(node, BDFDB.disCN._repocard)) this.appendSettingsButton(node);
					if (node.nodeType != Node.TEXT_NODE) for (let child of node.querySelectorAll(BDFDB.dotCN._repocard)) this.appendSettingsButton(child);
				});}});}));
				BDFDB.ObserverUtils.connect(this, document.querySelector(`${BDFDB.dotCN.layer}[aria-label="${BDFDB.DiscordConstants.Layers.USER_SETTINGS}"]`), {name: "cardObserver", instance: cardObserver}, {childList: true, subtree: true});
				BDFDB.ObserverUtils.connect(this, BDFDB.dotCN.applayers, {name: "appLayerObserver", instance: (new MutationObserver(changes => {changes.forEach(change => {if (change.addedNodes) {change.addedNodes.forEach(node => {
					if (node.nodeType != Node.TEXT_NODE && node.getAttribute("aria-label") == BDFDB.DiscordConstants.Layers.USER_SETTINGS) BDFDB.ObserverUtils.connect(this, node, {name: "cardObserver", instance: cardObserver}, {childList: true, subtree: true});
				});}});}))}, {childList: true});
				for (let child of document.querySelectorAll(BDFDB.dotCN._repocard)) this.appendSettingsButton(child);
			}
			
			onStop () {
				BDFDB.DOMUtils.remove(".theme-settings-button");
			}
		
			appendSettingsButton (card) {
				if (card.querySelector(".theme-settings-button")) return;
				let addon = BDFDB.ObjectUtils.get(BDFDB.ReactUtils.getInstance(card), "return.stateNode.props.addon");
				if (addon && !addon.plugin && !addon.instance && addon.css) {
					let css = addon.css.replace(/\r/g, "");
					let imports = this.getThemeImports(css);
					let vars = this.getThemeVars(css);
					if (imports.length || vars.length) {
						let open = _ => {
							let refs = {imports: {}, inputs: {}};
							BDFDB.ModalUtils.open(this, {
								header: `${addon.name} ${BDFDB.LanguageUtils.LanguageStrings.SETTINGS}`,
								subHeader: "",
								className: BDFDB.disCN._repomodal,
								headerClassName: BDFDB.disCN._repomodalheader,
								contentClassName: BDFDB.disCN._repomodalsettings,
								footerClassName: BDFDB.disCN._repomodalfooter,
								size: "MEDIUM",
								children: this.createThemeInputs(refs, addon, imports, vars),
								buttons: [{
									contents: BDFDB.LanguageUtils.LanguageStrings.SAVE,
									color: "BRAND",
									onClick: _ => {this.updateTheme(refs, addon);}
								}]
							});
							console.log(refs);
						};
						if (isBeta) {
							let controls = card.querySelector("." + BDFDB.disCN._repofooter.split(" ")[0] + " " + BDFDB.dotCN._repocontrols);
							let settingsButton = document.createElement("button");
							settingsButton.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._repobutton, BDFDB.disCN._repocontrolsbutton, "theme-settings-button");
							settingsButton.appendChild(BDFDB.DOMUtils.create(`<svg viewBox="0 0 20 20" style="width: 20px; height: 20px;"><path fill="none" d="M0 0h20v20H0V0z"></path><path d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"></path></svg>`));
							controls.insertBefore(settingsButton, controls.firstElementChild);
							settingsButton.addEventListener("click", open);
							settingsButton.addEventListener("mouseenter", _ => {
								BDFDB.TooltipUtils.create(settingsButton, BDFDB.LanguageUtils.LanguageStrings.SETTINGS);
							});
						}
						else {
							let footer = card.querySelector("." + BDFDB.disCN._repofooter.split(" ").join(",."));
							if (!footer) {
								footer = document.createElement("div");
								footer.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._repofooter);
								let links = document.createElement("span");
								links.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._repolinks);
								footer.appendChild(links);
								card.appendChild(footer);
							}
							let settingsButton = document.createElement("button");
							settingsButton.className = BDFDB.DOMUtils.formatClassName(BDFDB.disCN._reposettingsbutton, "theme-settings-button");
							settingsButton.innerText = "Settings";
							footer.appendChild(settingsButton);
							settingsButton.addEventListener("click", open);
						}
					}
				}
			}
			
			updateTheme (refs, addon) {
				let path = BDFDB.LibraryRequires.path.join(dir, addon.filename);
				let css = BDFDB.LibraryRequires.fs.readFileSync(path).toString();
				if (css) {
					let amount = 0;
					for (let i in refs.imports) {
						let input = refs.imports[i];
						let oldValue = input.props.oldValue;
						let newValue = input.props.value;
						console.log(oldValue, newValue);
						if (newValue.toString() != oldValue.toString()) {
							let importUrl = input.props.name;
							if (newValue) css = css.replace(new RegExp(`\\n${BDFDB.StringUtils.regEscape("/* @import url(" + importUrl + "); */")}`, "g"), `\n@import url(${importUrl});`);
							else css = css.replace(new RegExp(`\\n${BDFDB.StringUtils.regEscape("@import url(" + importUrl + ");")}`, "g"), `\n/* @import url(${importUrl}); */`);
							input.props.oldValue = newValue;
							amount++;
						}
					}
					for (let i in refs.inputs) {
						let input = refs.inputs[i];
						let oldValue = input.props.oldValue;
						let newValue = input.props.value;
						console.log(oldValue, newValue);
						if (newValue && newValue.trim() && newValue != oldValue) {
							let varName = input.props.name;
							css = css.replace(new RegExp(`--${BDFDB.StringUtils.regEscape(varName)}(\\s*):(\\s*)${BDFDB.StringUtils.regEscape(oldValue)}`,"g"), `--${varName}$1: $2${newValue}`);
							input.props.oldValue = newValue;
							input.props.placeholder = newValue;
							amount++;
						}
					}
					if (amount > 0) {
						BDFDB.ReactUtils.forceUpdate(BDFDB.ObjectUtils.toArray(refs.imports), BDFDB.ObjectUtils.toArray(refs.inputs));
						BDFDB.LibraryRequires.fs.writeFileSync(path, css);
						BDFDB.NotificationUtils.toast(`Updated ${amount} Variable${amount == 1 ? "" : "s"} in '${addon.filename}'`, {type: "success"});
					}
					else BDFDB.NotificationUtils.toast(`There are no changed Variables to be updated in '${addon.filename}'`, {type: "warning"});
				}
				else BDFDB.NotificationUtils.toast(`Could not find Theme File '${addon.filename}'`, {type: "danger"});
			}

			getThemeImports (css) {
				return css.split("\n@import url(").splice(1).map(n => [n.split(");")[0], true]).concat(css.split("\n/* @import url(").splice(1).map(n => [n.split("); */")[0], false]));
			}

			getThemeVars (css) {
				let vars = css.split(":root");
				if (vars.length > 1) {
					vars = vars[1].replace(/\t\(/g, " (").replace(/\t| {2,}/g, "").replace(/\/\*\n*((?!\/\*|\*\/).|\n)*\n+((?!\/\*|\*\/).|\n)*\n*\*\//g, "").replace(/\n\/\*.*?\*\//g, "").replace(/\n/g, "");
					vars = vars.split("{");
					vars.shift();
					vars = vars.join("{").replace(/\s*(:|;|--|\*)\s*/g, "$1");
					vars = vars.split("}")[0];
					return vars.slice(2).split(/;--|\*\/--/);
				}
				return [];
			}

			createThemeInputs (refs, theme, imports, vars) {
				let settingsItems = [];
				if (imports.length) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
					title: "Imports:",
					dividerBottom: vars.length,
					children: imports.map((impo, i) => {
						let name = impo[0].split("/").pop().replace(/"/g, "");
						return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Switch",
							margin: 8,
							childProps: {
								ref: instance => {if (instance) refs.imports[i] = instance;}
							},
							label: name[0].toUpperCase() + name.slice(1),
							note: impo[0].replace(/"/g, ""),
							name: impo[0],
							value: impo[1],
							oldValue: impo[1].toString()
						});
					})
				}));
				let varInputs = [];
				for (let i in vars) {
					let varStr = vars[i].split(":");
					let varName = varStr.shift().trim();
					varStr = varStr.join(":").split(/;[^A-z0-9]|\/\*/);
					let varValue = varStr.shift().trim();
					if (varValue) {
						let childType = "text", childMode = "";
						let isColor = BDFDB.ColorUtils.getType(varValue);
						let isComp = !isColor && /^[0-9 ]+,[0-9 ]+,[0-9 ]+$/g.test(varValue);
						if (isColor || isComp) {
							childType = "color";
							childMode = isComp && "comp";
						}
						else {
							let isUrlFile = /url\(.+\)/gi.test(varValue);
							let isFile = !isUrlFile && /(http(s)?):\/\/[(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(varValue);
							if (isFile || isUrlFile) {
								childType = "file";
								childMode = isUrlFile && "url";
							}
						}
						let varDescription = varStr.join("").replace(/\*\/|\/\*/g, "").replace(/:/g, ": ").replace(/: \//g, ":/").replace(/--/g, " --").replace(/\( --/g, "(--").trim();
						varInputs.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "TextInput",
							margin: 8,
							childProps: {
								type: childType,
								mode: childMode,
								filter: childType == "file" && "image",
								ref: instance => {if (instance) refs.inputs[i] = instance;}
							},
							label: varName[0].toUpperCase() + varName.slice(1),
							note: varDescription && varDescription.indexOf("*") == 0 ? varDescription.slice(1) : varDescription,
							basis: "70%",
							name: varName,
							value: varValue,
							oldValue: varValue,
							placeholder: varValue
						}));
					}
				};
				if (varInputs.length) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
					title: "Variables:",
					children: varInputs
				}));
				
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanel, {
					addon: theme,
					children: settingsItems
				});
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();