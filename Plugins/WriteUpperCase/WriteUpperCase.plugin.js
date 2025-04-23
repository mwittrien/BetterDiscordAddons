/**
 * @name WriteUpperCase
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.4.5
 * @description Changes the first Letter of each Sentence in Message Inputs to Uppercase
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/WriteUpperCase/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/WriteUpperCase/WriteUpperCase.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		
	};
	
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js").then(r => {
				if (!r || r.status != 200) throw new Error();
				else return r.text();
			}).then(b => {
				if (!b) throw new Error();
				else return require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.UI.showToast("Finished downloading BDFDB Library", {type: "success"}));
			}).catch(error => {
				BdApi.UI.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.UI.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
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
		const QuickToogleButtonComponent = class TranslateButton extends BdApi.React.Component {
			componentDidMount() {
				toggleButtons[this.props.type] = this;
			}
			componentWillUnmount() {
				delete toggleButtons[this.props.type];
			}
			render() {
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ChannelTextAreaButton, {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._writeuppercasequicktogglebutton, BDFDB.disCN._writeuppercasequicktogglebuttonenabled, BDFDB.disCN.textareapickerbutton),
					iconSVG: channelBlacklist.indexOf(this.props.channelId) == -1 ? `<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m 3,1.9999999 c -1.662,0 -3,1.115 -3,2.5 V 4.9257811 17.894531 19.5 C 0,20.885 1.338,22 3,22 h 18 c 1.662,0 3,-1.115 3,-2.5 V 17.894531 5.048828 4.4999999 c 0,-1.385 -1.338,-2.5 -3,-2.5 z M 6.460938,6.970703 h 3.355468 l 3.19336,9.703125 h -2.585938 l -0.492187,-1.875 H 6.416016 l -0.507813,1.875 H 3.308594 Z m 10.648437,1.6328125 c 2.631064,0 3.470703,1.5495695 3.470703,3.4062505 v 2.74414 c 0,0.758553 0.03039,1.484092 0.111328,1.919922 h -2.210937 l -0.144531,-0.791016 h -0.04883 c -0.516766,0.629875 -1.323255,0.96875 -2.259765,0.96875 -1.597787,0 -2.550782,-1.162897 -2.550782,-2.421874 0,-2.049961 1.840132,-3.034174 4.632813,-3.017579 v -0.113281 c 0,-0.419489 -0.225079,-1.017578 -1.435547,-1.017578 -0.806808,0 -1.663177,0.274933 -2.179687,0.597656 L 14.042969,9.2968749 c 0.548425,-0.3066383 1.629725,-0.6933594 3.066406,-0.6933594 z m -8.761719,0.609375 -0.34375,0.00195 -1.11914,3.3652345 h 2.576172 z m 9.722656,3.7304685 c -1.232783,0.0048 -2.171874,0.321562 -2.171874,1.244141 0,0.629362 0.420324,0.935547 0.96875,0.935547 0.613531,0 1.114028,-0.401663 1.27539,-0.902344 0.03243,-0.129446 0.04883,-0.27439 0.04883,-0.419922 v -0.857422 c -0.04036,-4.86e-4 -0.08133,-1.53e-4 -0.121094,0 z"/></svg>` : `<svg width='24' height='24' viewBox='0 0 24 24'><path fill='${BDFDB.DiscordConstants.ColorsCSS.STATUS_DANGER}' d='M 21.923828 1.0019531 C 21.747523 1.0152946 21.565841 1.0809548 21.392578 1.2109375 L 1.4160156 21.193359 C 0.27889373 22.294648 1.7205802 23.709292 2.8144531 22.591797 L 22.789062 2.609375 C 23.308852 1.916135 22.783382 1.0851467 22.097656 1.0058594 C 22.040516 0.99925213 21.982597 0.99750595 21.923828 1.0019531 z M 3 2 C 1.3380034 2 0 3.1150028 0 4.5 L 0 4.9257812 L 0 17.894531 L 0 19.5 C 0 19.601446 0.0094792509 19.700611 0.0234375 19.798828 L 3.3867188 16.435547 L 6.4609375 6.9707031 L 9.8164062 6.9707031 L 10.568359 9.2519531 L 17.818359 2 L 3 2 z M 23.980469 4.2246094 L 19.146484 9.0605469 C 20.196401 9.653313 20.580078 10.760639 20.580078 12.009766 L 20.580078 14.753906 C 20.580078 15.512457 20.610468 16.238 20.691406 16.673828 L 18.480469 16.673828 L 18.335938 15.882812 L 18.287109 15.882812 C 17.770345 16.512687 16.963852 16.851562 16.027344 16.851562 C 14.550626 16.851562 13.627935 15.857352 13.496094 14.712891 L 12.644531 15.564453 L 13.009766 16.673828 L 11.535156 16.673828 L 6.2109375 22 L 21 22 C 22.661996 22 24 20.884998 24 19.5 L 24 17.894531 L 24 5.0488281 L 24 4.5 C 24 4.4066511 23.992315 4.3152465 23.980469 4.2246094 z M 8.3476562 9.2128906 L 8.0039062 9.2148438 L 6.8847656 12.580078 L 7.2402344 12.580078 L 8.9101562 10.912109 L 8.3476562 9.2128906 z M 17.691406 10.515625 L 16.707031 11.5 C 17.14097 11.438401 17.609237 11.409137 18.109375 11.412109 L 18.109375 11.298828 C 18.109375 11.045446 18.023202 10.728166 17.691406 10.515625 z M 18.070312 12.943359 C 16.837533 12.948159 15.898437 13.264923 15.898438 14.1875 C 15.898438 14.81686 16.318762 15.123047 16.867188 15.123047 C 17.480717 15.123047 17.981216 14.721384 18.142578 14.220703 C 18.175008 14.091257 18.191406 13.946313 18.191406 13.800781 L 18.191406 12.943359 C 18.151046 12.942873 18.110076 12.943206 18.070312 12.943359 z'/></svg>`,
					nativeClass: true,
					onClick: _ => {
						if (channelBlacklist.indexOf(this.props.channelId) > -1) BDFDB.ArrayUtils.remove(channelBlacklist, this.props.channelId, true);
						else channelBlacklist.push(this.props.channelId);
						for (let type in toggleButtons) BDFDB.ReactUtils.forceUpdate(toggleButtons[type]);
					}
				});
			}
		};
		
		const symbols = [".", "!", "¡", "?", "¿"], spaces = ["\n", "\r", "\t", " ", "  ", "   ", "    "];
		
		const channelBlacklist = [];
		const toggleButtons = {};
		
		return class WriteUpperCase extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						addQuickToggle:		{value: false, 			description: "Adds a quick Toggle to the Message Input"}
					},
					places: {
						normal:			{value: true, 			description: "Normal Message Textarea"},
						edit:			{value: true, 			description: "Edit Message Textarea"},
						form:			{value: true, 			description: "Upload Message Prompt"},
						user_profile:		{value: true, 			description: "Quick Message Textarea UserPopout"}
					}
				};
				
				this.modulePatches = {
					before: [
						"ChannelTextAreaEditor"
					],
					after: [
						"ChannelTextAreaButtons"
					]
				};
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

			processChannelTextAreaEditor (e) {
				let type = e.instance.props.type.analyticsName || e.instance.props.type || "";
				if (e.instance.props.textValue && e.instance.props.focused && (!type || this.settings.places[type] || !this.defaults.places[type]) && (!this.settings.general.addQuickToggle || channelBlacklist.indexOf(e.instance.props.channel.id) == -1) && e.instance.props.richValue && e.instance.props.richValue[0] && !e.instance.props.richValue[0].command) {
					let string = e.instance.props.textValue;
					let newString = this.parse(string);
					if (string != newString) {
						let selection = document.getSelection();
						let container = selection.anchorNode && BDFDB.DOMUtils.getParent("[contenteditable]", selection.anchorNode.parentElement);
						if (container && Array.from(container.children).findIndex(n => n && n.contains(selection.anchorNode)) == (container.childElementCount - 1)) {
							selection.modify("extend", "backward", "paragraphboundary");
							if (selection.toString().length == selection.anchorNode.textContent.length) {
								e.instance.props.textValue = newString;
								if (e.instance.props.richValue) e.instance.props.richValue = BDFDB.SlateUtils.toRichValue(newString);
							}
							selection.collapseToEnd();
						}
					}
				}
			}
			
			processChannelTextAreaButtons (e) {
				let type = e.instance.props.type.analyticsName || e.instance.props.type || "";
				if ((!type || this.settings.places[type] || !this.defaults.places[type]) && this.settings.general.addQuickToggle && !e.instance.props.disabled) {
					e.returnvalue.props.children.unshift(BDFDB.ReactUtils.createElement(QuickToogleButtonComponent, {
						type: type,
						channelId: e.instance.props.channel.id
					}));
				}
			}
			
			parse (string) {
				if (!string.length) return string;
				let newString = string, stop = false;
				let language = BDFDB.LanguageUtils.getLanguage().id;
				for (let space of spaces) for (let symbol of symbols) if (!stop) {
					let reg;
					try {reg = new RegExp((symbol == "." ? "(?<!\\.)" : "") + BDFDB.StringUtils.regEscape(symbol + space), "g");}
					catch (err) {reg = new RegExp(BDFDB.StringUtils.regEscape(symbol + space), "g");}
					let sentences = newString.split(reg);
					for (let i in sentences) {
						let sentence = sentences[i];
						let lowSentence = sentence.toLocaleLowerCase(language);
						let first = sentence.charAt(0);
						if (first === first.toLocaleUpperCase(language) && (lowSentence.indexOf("http") == 0 || lowSentence.indexOf("discord.gg") == 0 || lowSentence.indexOf("s/") == 0)) sentences[i] = sentence.charAt(0).toLocaleLowerCase(language) + sentence.slice(1);
						else if (first === first.toLocaleLowerCase(language) && first !== first.toLocaleUpperCase(language) && lowSentence.indexOf("http") != 0 && lowSentence.indexOf("discord.gg") != 0 && lowSentence.indexOf("s/") != 0) sentences[i] = sentence.charAt(0).toLocaleUpperCase(language) + sentence.slice(1);
						if (sentence.indexOf("```") > -1) stop = true;
					}
					newString = sentences.join(symbol + space);
				}
				return newString;
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
