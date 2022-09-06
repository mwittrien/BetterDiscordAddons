/**
 * @name ThemeSettings
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.3.5
 * @description Allows you to change Theme Variables within Discord
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ThemeSettings/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ThemeSettings/ThemeSettings.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		improved: {
			"Changed Location": "Due to the new Plugin Guidelines, which forbid changes to BDs Plugin/Themes Pages, the option to change the variables for Themes are now inside the Plugin Settings of 'ThemeSettings'"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {		
		var dir;
	
		return class ThemeSettings extends Plugin {
			onLoad () {
				dir = BDFDB.BDUtils.getThemesFolder();
				
				this.css = `
					${BDFDB.dotCN._themesettingsgrid} {
						display: grid;
						grid-template-columns: 50% auto;
					}
					${BDFDB.dotCN._themesettingscard} {
						display: flex;
						align-items: center;
						padding: 10px;
					}
					${BDFDB.dotCN._themesettingscardname} {
						flex: 1 1 auto;
						margin-right: 10px;
					}
				`;
			}
			
			onStart () {}
			
			onStop () {}
			
			getSettingsPanel () {
				let themes = window.BdApi && BdApi.Themes && BdApi.Themes.getAll && BdApi.Themes.getAll().map(theme => {
					let css = theme.css.replace(/\r/g, "");
					let imports = css.split("\n@import url(").splice(1).map(n => [n.split(");")[0], true]).concat(css.split("\n/* @import url(").splice(1).map(n => [n.split("); */")[0], false]));
					let vars = css.split(":root");
					if (vars.length > 1) {
						vars = vars[1].replace(/\t\(/g, " (").replace(/\t| {2,}/g, "").replace(/\/\*\n*((?!\/\*|\*\/).|\n)*\n+((?!\/\*|\*\/).|\n)*\n*\*\//g, "").replace(/\n\/\*.*?\*\//g, "").replace(/\n/g, "");
						vars = vars.split("{");
						vars.shift();
						vars = vars.join("{").replace(/\s*(:|;|--|\*)\s*/g, "$1");
						vars = vars.split("}")[0];
						vars = (vars.endsWith(";") ? vars.slice(0, -1) : vars).slice(2).split(/;--|\*\/--/);
					}
					else vars = [];
					
					if (imports.length || vars.length) return {data: theme, imports, vars};
				}).filter(n => n);
				return themes && themes.length && BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN._themesettingsgrid,
					children: themes.map(theme => BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._themesettingscard,
						children: [
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN._themesettingscardname,
								children: theme.data.name
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
								size: BDFDB.LibraryComponents.Button.Sizes.SMALL,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									align: BDFDB.LibraryComponents.Flex.Align.CENTER,
									children: [
										BDFDB.ReactUtils.createElement("div", {
											children: "Edit"
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
											className: BDFDB.disCN.marginleft4,
											name: BDFDB.LibraryComponents.SvgIcon.Names.PENCIL
										})
									]
								}),
								onClick: _ => {
									let importInstances = {}, inputInstances = {};
									BDFDB.ModalUtils.open(this, {
										header: `${theme.data.name} ${BDFDB.LanguageUtils.LanguageStrings.SETTINGS}`,
										subHeader: "",
										size: "MEDIUM",
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanel, {
											addon: theme.data,
											children: _ => {
												let settingsItems = [];
												
												let varInputs = [];
												for (let i in theme.vars) {
													let varStr = theme.vars[i].split(":");
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
																ref: instance => {if (instance) inputInstances[i] = instance;}
															},
															label: varName.split("-").map(BDFDB.LibraryModules.StringUtils.upperCaseFirstChar).join(" "),
															note: varDescription && varDescription.indexOf("*") == 0 ? varDescription.slice(1) : varDescription,
															basis: "70%",
															name: varName,
															value: varValue,
															oldValue: varValue,
															defaultValue: varValue,
															placeholder: varValue
														}));
													}
												};
												
												if (theme.imports.length) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
													title: "Imports:",
													dividerBottom: varInputs.length,
													children: theme.imports.map((impo, i) => {
														let name = impo[0].split("/").pop().replace(/"/g, "");
														return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
															type: "Switch",
															margin: 8,
															childProps: {ref: instance => {if (instance) importInstances[i] = instance;}},
															label: name[0].toUpperCase() + name.slice(1),
															note: impo[0].replace(/"/g, ""),
															name: impo[0],
															value: impo[1],
															oldValue: impo[1].toString(),
															defaultValue: impo[1].toString()
														});
													})
												}));
												if (varInputs.length) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
													title: "Variables:",
													children: varInputs
												}));
												
												return settingsItems;
											}
										}),
										buttons: [{
											contents: BDFDB.LanguageUtils.LanguageStrings.SAVE,
											color: "BRAND",
											onClick: _ => this.updateTheme(theme.data, {imports: importInstances, inputs: inputInstances}, false)
										}, {
											contents: BDFDB.LanguageUtils.LanguageStrings.RESET,
											look: "LINK",
											onClick: _ => this.updateTheme(theme.data, {imports: importInstances, inputs: inputInstances}, true)
										}]
									});
								}
							})
						]
					}))
				});
			}
			
			updateTheme (theme, instances, reset) {
				let path = BDFDB.LibraryRequires.path.join(dir, theme.filename);
				let css = BDFDB.LibraryRequires.fs.readFileSync(path).toString();
				if (css) {
					let amount = 0;
					for (let i in instances.imports) {
						let input = instances.imports[i];
						let oldValue = input.props.oldValue;
						let newValue = reset ? input.props.defaultValue : input.props.value;
						if (newValue.toString() != oldValue.toString()) {
							let trueValue = typeof newValue == "string" ? newValue == "true" : newValue;
							let importUrl = input.props.name;
							if (trueValue) css = css.replace(new RegExp(`\\n${BDFDB.StringUtils.regEscape("/* @import url(" + importUrl + "); */")}`, "g"), `\n@import url(${importUrl});`);
							else css = css.replace(new RegExp(`\\n${BDFDB.StringUtils.regEscape("@import url(" + importUrl + ");")}`, "g"), `\n/* @import url(${importUrl}); */`);
							input.props.value = trueValue;
							input.props.oldValue = newValue;
							amount++;
						}
					}
					for (let i in instances.inputs) {
						let input = instances.inputs[i];
						let oldValue = input.props.oldValue;
						let newValue = reset ? input.props.defaultValue : input.props.value;
						if (newValue && newValue.trim() && newValue != oldValue) {
							let varName = input.props.name;
							css = css.replace(new RegExp(`--${BDFDB.StringUtils.regEscape(varName)}(\\s*):(\\s*)${BDFDB.StringUtils.regEscape(oldValue)}`,"g"), `--${varName}$1: $2${newValue}`);
							input.props.value = newValue;
							input.props.oldValue = newValue;
							input.props.placeholder = newValue;
							amount++;
						}
					}
					if (amount > 0) {
						BDFDB.ReactUtils.forceUpdate(BDFDB.ObjectUtils.toArray(instances.imports), BDFDB.ObjectUtils.toArray(instances.inputs));
						BDFDB.LibraryRequires.fs.writeFileSync(path, css);
						BDFDB.NotificationUtils.toast(`Updated ${amount} Variable${amount == 1 ? "" : "s"} in '${theme.filename}'`, {type: "success"});
					}
					else BDFDB.NotificationUtils.toast(`There are no changed Variables to be updated in '${theme.filename}'`, {type: "warning"});
				}
				else BDFDB.NotificationUtils.toast(`Could not find Theme File '${theme.filename}'`, {type: "danger"});
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();