/**
 * @name WriteUpperCase
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.3.8
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
					iconSVG: channelBlacklist.indexOf(this.props.channelId) == -1 ? `<svg width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m 3,1.9999999 c -1.662,0 -3,1.115 -3,2.5 V 4.9257811 17.894531 19.5 C 0,20.885 1.338,22 3,22 h 18 c 1.662,0 3,-1.115 3,-2.5 V 17.894531 5.048828 4.4999999 c 0,-1.385 -1.338,-2.5 -3,-2.5 z M 6.460938,6.970703 h 3.355468 l 3.19336,9.703125 h -2.585938 l -0.492187,-1.875 H 6.416016 l -0.507813,1.875 H 3.308594 Z m 10.648437,1.6328125 c 2.631064,0 3.470703,1.5495695 3.470703,3.4062505 v 2.74414 c 0,0.758553 0.03039,1.484092 0.111328,1.919922 h -2.210937 l -0.144531,-0.791016 h -0.04883 c -0.516766,0.629875 -1.323255,0.96875 -2.259765,0.96875 -1.597787,0 -2.550782,-1.162897 -2.550782,-2.421874 0,-2.049961 1.840132,-3.034174 4.632813,-3.017579 v -0.113281 c 0,-0.419489 -0.225079,-1.017578 -1.435547,-1.017578 -0.806808,0 -1.663177,0.274933 -2.179687,0.597656 L 14.042969,9.2968749 c 0.548425,-0.3066383 1.629725,-0.6933594 3.066406,-0.6933594 z m -8.761719,0.609375 -0.34375,0.00195 -1.11914,3.3652345 h 2.576172 z m 9.722656,3.7304685 c -1.232783,0.0048 -2.171874,0.321562 -2.171874,1.244141 0,0.629362 0.420324,0.935547 0.96875,0.935547 0.613531,0 1.114028,-0.401663 1.27539,-0.902344 0.03243,-0.129446 0.04883,-0.27439 0.04883,-0.419922 v -0.857422 c -0.04036,-4.86e-4 -0.08133,-1.53e-4 -0.121094,0 z"/></svg>` : `<svg width='24' height='24' viewBox='0 0 24 24'><path fill='currentColor' d='M 3 2 C 1.338 2 0 3.115 0 4.5 L 0 4.9257812 L 0 17.894531 L 0 19.5 C 0 19.794967 0.064199977 20.075579 0.17578125 20.337891 L 3.8398438 16.673828 L 3.3085938 16.673828 L 6.4609375 6.9707031 L 9.8164062 6.9707031 L 10.738281 9.7753906 L 18.513672 2 L 3 2 z M 23.763672 3.5214844 L 19.972656 7.3125 L 18.498047 8.7871094 C 20.043946 9.2485927 20.580078 10.531086 20.580078 12.009766 L 20.580078 14.753906 C 20.580078 15.512459 20.610468 16.237998 20.691406 16.673828 L 18.480469 16.673828 L 18.335938 15.882812 L 18.287109 15.882812 C 17.770343 16.512687 16.963854 16.851562 16.027344 16.851562 C 14.429557 16.851562 13.476562 15.688664 13.476562 14.429688 C 13.476562 14.179968 13.503633 13.946722 13.556641 13.728516 L 12.416016 14.871094 L 13.009766 16.673828 L 10.613281 16.673828 L 10.267578 17.019531 L 5.8398438 21.447266 L 5.2910156 22 L 21 22 C 22.662 22 24 20.885 24 19.5 L 24 17.894531 L 24 5.0488281 L 24 4.5 C 24 4.1522582 23.916317 3.8218102 23.763672 3.5214844 z M 8.3476562 9.2128906 L 8.0039062 9.2148438 L 6.8847656 12.580078 L 7.9335938 12.580078 L 9.0820312 11.431641 L 8.3476562 9.2128906 z M 16.984375 10.302734 L 15.494141 11.792969 C 16.213559 11.533287 17.097834 11.406098 18.109375 11.412109 L 18.109375 11.298828 C 18.109375 10.919047 17.917537 10.398944 16.984375 10.302734 z M 18.070312 12.943359 C 16.837529 12.948159 15.898438 13.264921 15.898438 14.1875 C 15.898438 14.816862 16.318762 15.123047 16.867188 15.123047 C 17.480718 15.123047 17.981216 14.721384 18.142578 14.220703 C 18.175008 14.091257 18.191406 13.946313 18.191406 13.800781 L 18.191406 12.943359 C 18.151046 12.942873 18.110076 12.943206 18.070312 12.943359 z'/><path d='M 24,1.6933333 22.306667,0 0,22.306667 1.6933333,24 7.28,18.426667 8.92,16.773333 11.133333,14.56 15.986667,9.706667 Z' class='${BDFDB.disCN.accountinfobuttonstrikethrough}' fill='currentColor'/></svg>`,
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
						normal:			{value: true, 			description: "Normal Message Textarea"},
						edit:			{value: true, 			description: "Edit Message Textarea"},
						form:			{value: true, 			description: "Upload Message Prompt"},
						quickmessage:	{value: true, 			description: "Quick Message Textarea UserPopout"}
					}
				};
				
				this.modulePatches = {
					before: [
						"ChannelTextAreaEditor",
						"TextInput"
					],
					after: [
						"ChannelTextAreaButtons",
						"TextInput"
					]
				};
				
				this.css = `
					${BDFDB.dotCNS.userpopoutmessageinputcontainer + BDFDB.dotCNS.flex + BDFDB.dotCN.inputwrapper} {
						flex: 1 1 auto;
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

			processChannelTextAreaEditor (e) {
				let type = e.instance.props.type.analyticsName || e.instance.props.type || "";
				if (e.instance.props.textValue && e.instance.props.focused && (!type || this.settings.places[type] || !this.defaults.places[type]) && (!this.settings.general.addQuickToggle || channelBlacklist.indexOf(e.instance.props.channel.id) == -1)) {
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
			
			processTextInput (e) {
				if (!this.settings.places.quickmessage || !e.instance.props.className || e.instance.props.className.indexOf(BDFDB.disCN.userpopoutmessageinputcontainer) == -1) return;
				let channelId = BDFDB.LibraryStores.SelectedChannelStore.getChannelId();
				if (!e.returnvalue) {
					let input = e.instance.props.inputRef.current;
					if (input) BDFDB.ListenerUtils.add(this, input, "keyup", event => {
						if (this.settings.places.quickmessage && (!this.settings.general.addQuickToggle || channelBlacklist.indexOf(channelId) == -1)) {
							let string = input.value;
							let newString = this.parse(string);
							if (string != newString) input.value = newString;
						}
					});
				}
				else {
					if (this.settings.general.addQuickToggle) e.returnvalue = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
								children: e.returnvalue
							}),
							BDFDB.ReactUtils.createElement(QuickToogleButtonComponent, {
								type: "quickmessage",
								channelId: channelId
							})
						]
					});
				}
			}
			
			parse (string) {
				if (!string.length || /<[#@][!&]{0,1}\d+>|@here|@everyone|:[A-z0-9_-]+:|[\uD83C-\uDBFF\uDC00-\uDFFF]+/.test(string)) return string;
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
						if (first === first.toLocaleUpperCase(language) && (lowSentence.indexOf("http") == 0 || lowSentence.indexOf("s/") == 0)) sentences[i] = sentence.charAt(0).toLocaleLowerCase(language) + sentence.slice(1);
						else if (first === first.toLocaleLowerCase(language) && first !== first.toLocaleUpperCase(language) && lowSentence.indexOf("http") != 0 && lowSentence.indexOf("s/") != 0) sentences[i] = sentence.charAt(0).toLocaleUpperCase(language) + sentence.slice(1);
						if (sentence.indexOf("```") > -1) stop = true;
					}
					newString = sentences.join(symbol + space);
				}
				return newString;
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
