/**
 * @name WriteUpperCase
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.3.1
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
			"version": "1.3.1",
			"description": "Changes the first Letter of each Sentence in Message Inputs to Uppercase"
		},
		"changeLog": {
			"added": {
				"Quick Toggle": "Added option to add quick toggle to the message input"
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
		const QuickToogleButtonComponent = class TranslateButton extends BdApi.React.Component {
			componentDidMount() {
				toggleButtons[this.props.type] = this;
			}
			componentWillUnmount() {
				delete toggleButtons[this.props.type];
			}
			render() {
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ChannelTextAreaButton, {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._writeuppercasequicktogglebutton, channelBlacklist.indexOf(this.props.channelId) == -1 && BDFDB.disCN._writeuppercasequicktogglebuttonenabled, BDFDB.disCN.textareapickerbutton),
					iconSVG: `<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m 3,1.9999999 c -1.662,0 -3,1.115 -3,2.5 V 4.9257811 17.894531 19.5 C 0,20.885 1.338,22 3,22 h 18 c 1.662,0 3,-1.115 3,-2.5 V 17.894531 5.048828 4.4999999 c 0,-1.385 -1.338,-2.5 -3,-2.5 z M 6.460938,6.970703 h 3.355468 l 3.19336,9.703125 h -2.585938 l -0.492187,-1.875 H 6.416016 l -0.507813,1.875 H 3.308594 Z m 10.648437,1.6328125 c 2.631064,0 3.470703,1.5495695 3.470703,3.4062505 v 2.74414 c 0,0.758553 0.03039,1.484092 0.111328,1.919922 h -2.210937 l -0.144531,-0.791016 h -0.04883 c -0.516766,0.629875 -1.323255,0.96875 -2.259765,0.96875 -1.597787,0 -2.550782,-1.162897 -2.550782,-2.421874 0,-2.049961 1.840132,-3.034174 4.632813,-3.017579 v -0.113281 c 0,-0.419489 -0.225079,-1.017578 -1.435547,-1.017578 -0.806808,0 -1.663177,0.274933 -2.179687,0.597656 L 14.042969,9.2968749 c 0.548425,-0.3066383 1.629725,-0.6933594 3.066406,-0.6933594 z m -8.761719,0.609375 -0.34375,0.00195 -1.11914,3.3652345 h 2.576172 z m 9.722656,3.7304685 c -1.232783,0.0048 -2.171874,0.321562 -2.171874,1.244141 0,0.629362 0.420324,0.935547 0.96875,0.935547 0.613531,0 1.114028,-0.401663 1.27539,-0.902344 0.03243,-0.129446 0.04883,-0.27439 0.04883,-0.419922 v -0.857422 c -0.04036,-4.86e-4 -0.08133,-1.53e-4 -0.121094,0 z"/></svg>`,
					nativeClass: true,
					onClick: _ => {
						if (channelBlacklist.indexOf(this.props.channelId) > -1) BDFDB.ArrayUtils.remove(channelBlacklist, this.props.channelId, true);
						else channelBlacklist.push(this.props.channelId);
						for (let type in toggleButtons) BDFDB.ReactUtils.forceUpdate(toggleButtons[type]);
					}
				});
			}
		};
		
		const symbols = [".", "!", "¡", "?", "¿"], spaces = ["\n", "\r", "\t", " "];
		
		const channelBlacklist = [];
		const toggleButtons = {};
		
		return class WriteUpperCase extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						addQuickToggle:		{value: false, 			description: "Adds a quick Toggle to the Message Input"}
					},
					places: {
						changeNormal:		{value: true, 			description: "Normal Message Textarea"},
						changeEdit:			{value: true, 			description: "Edit Message Textarea"},
						changeForm:			{value: true, 			description: "Upload Message Prompt"}
					}
				};
				
				this.patchedModules = {
					before: {
						ChannelEditorContainer: "render"
					},
					after: {
						ChannelTextAreaContainer: "render"
					}
				};

				this.css = `
					${BDFDB.dotCN._writeuppercasequicktogglebutton + BDFDB.dotCNS._writeuppercasequicktogglebuttonenabled + BDFDB.dotCN.textareaicon} {
						color: var(--bdfdb-red) !important;
					}
				`;
			}
			
			onStart () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
				
						for (let key in this.defaults.general) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["general", key],
							label: this.defaults.general[key].description,
							value: this.settings.general[key]
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Automatically transform in:",
							children: Object.keys(this.defaults.places).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["places", key],
								label: this.defaults.places[key].description,
								value: this.settings.places[key]
							}))
						}));
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					BDFDB.PatchUtils.forceAllUpdates(this);
				}
			}
		
			forceUpdateAll () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processChannelEditorContainer (e) {
				let type = BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(e.instance.props.type || "");
				if (e.instance.props.textValue && e.instance.state.focused && (!type || this.settings.places[type] || !this.defaults.general[type]) && (!this.settings.general.addQuickToggle || channelBlacklist.indexOf(e.instance.props.channel.id) == -1)) {
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
			
			processChannelTextAreaContainer (e) {
				if (this.settings.general.addQuickToggle) {
					let editor = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "ChannelEditorContainer"});
					if (editor && !editor.props.disabled) {
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.textareapickerbuttons]]});
						if (index > -1 && children[index].props && children[index].props.children) children[index].props.children.unshift(BDFDB.ReactUtils.createElement(QuickToogleButtonComponent, {
							type: editor.props.type,
							channelId: e.instance.props.channel.id
						}));
					}
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();