/**
 * @name WriteUpperCase
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.3.0
 * @description Changes the first Letter of each Sentence in Message Inputs to Uppercase
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/WriteUpperCase/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/WriteUpperCase/WriteUpperCase.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "WriteUpperCase",
			"author": "DevilBro",
			"version": "1.3.0",
			"description": "Changes the first Letter of each Sentence in Message Inputs to Uppercase"
		},
		"changeLog": {
			"fixed": {
				"Mentions": "No longer acts weird with mentions"
			}
		}
	};

	return (window.Lightcord || window.LightCord) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return "Do not use LightCord!";}
		load () {BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)");}
		start() {}
		stop() {}
	} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
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
		const symbols = [".", "!", "¡", "?", "¿"], spaces = ["\n", "\r", "\t", " "];
		var settings = {};
		
		return class WriteUpperCase extends Plugin {
			onLoad () {
				this.defaults = {
					settings: {
						changeNormal:		{value: true, 			description: "Normal Message Textarea"},
						changeEdit:			{value: true, 			description: "Edit Message Textarea"},
						changeForm:			{value: true, 			description: "Upload Message Prompt"}
					}
				};
				
				this.patchedModules = {
					before: {
						ChannelEditorContainer: "render"
					}
				};
			}
			
			onStart () {
				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Automatically transform in:",
							children: Object.keys(settings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["settings", key],
								label: this.defaults.settings[key].description,
								value: settings[key]
							}))
						}));
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processChannelEditorContainer (e) {
				let type = BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(e.instance.props.type || "");
				if (e.instance.props.textValue && e.instance.state.focused && (!type || settings["change" + type] || settings["change" + type] === undefined)) {
					let string = e.instance.props.textValue;
					if (string.length && !/<[#@][!&]{0,1}\d+>|@here|@everyone|:[A-z0-9_-]+:|[\uD83C-\uDBFF\uDC00-\uDFFF]+/.test(string)) {
						let newString = string, stop = false;
						for (let space of spaces) for (let symbol of symbols) if (!stop) {
							let reg;
							try {reg = new RegExp((symbol == "." ? "(?<!\\.)" : "") + BDFDB.StringUtils.regEscape(symbol + space), "g");}
							catch (err) {reg = new RegExp(BDFDB.StringUtils.regEscape(symbol + space), "g");}
							let sentences = newString.split(reg);
							for (let i in sentences) {
								let sentence = sentences[i];
								let first = sentence.charAt(0);
								if (first === first.toUpperCase() && (sentence.toLowerCase().indexOf("http") == 0 || sentence.toLowerCase().indexOf("s/") == 0)) sentences[i] = sentence.charAt(0).toLowerCase() + sentence.slice(1);
								else if (first === first.toLowerCase() && first !== first.toUpperCase() && sentence.toLowerCase().indexOf("http") != 0 && sentence.toLowerCase().indexOf("s/") != 0) sentences[i] = sentence.charAt(0).toUpperCase() + sentence.slice(1);
								if (sentence.indexOf("```") > -1) stop = true;
							}
							newString = sentences.join(symbol + space);
						}
						if (string != newString) {
							e.instance.props.textValue = newString;
							if (e.instance.props.richValue) e.instance.props.richValue = BDFDB.SlateUtils.copyRichValue(newString, e.instance.props.richValue);
						}
					}
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();