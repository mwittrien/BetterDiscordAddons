/**
 * @name WriteUpperCase
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/WriteUpperCase
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/WriteUpperCase/WriteUpperCase.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/WriteUpperCase/WriteUpperCase.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "WriteUpperCase",
			"author": "DevilBro",
			"version": "1.2.8",
			"description": "Change first letter of each sentence in message input to uppercase"
		},
		"changeLog": {
			"fixed": {
				"Emojis": "No longer tries to capitalize letters when the message already contains an emoji since that makes the cursor jump to the start of the message"
			},
			"improved": {
				"Ellipsis": "No longer capitalizes a word after ellipsis (...)"
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
		const symbols = [".", "!", "¡", "?", "¿"], spaces = ["\n", "\r", "\t", " "];
		
		return class WriteUpperCase extends Plugin {
			onLoad () {
				this.patchedModules = {
					before: {
						ChannelEditorContainer: "render"
					}
				};
			}
			
			onStart () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processChannelEditorContainer (e) {
				if (e.instance.props.textValue && e.instance.state.focused) {
					let string = e.instance.props.textValue;
					if (string.length && !/:[A-z0-9_-]+:|[\uD83C-\uDBFF\uDC00-\uDFFF]+/.test(string)) {
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