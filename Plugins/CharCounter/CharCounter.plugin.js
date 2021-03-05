/**
 * @name CharCounter
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.5.0
 * @description Adds a Character Counter to most Inputs
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CharCounter
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CharCounter/CharCounter.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/CharCounter/CharCounter.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "CharCounter",
			"author": "DevilBro",
			"version": "1.5.0",
			"description": "Adds a Character Counter to most Inputs"
		},
		"changeLog": {
			"fixed": {
				"Message Input": "Works again for the message textarea"
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
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
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
		const maxLenghts = {
			normal: 2000,
			edit: 2000,
			form: 2000,
			nick: 32,
			customstatus: 128,
			popoutnote: 256,
			profilenote: 256
		};
		const typeMap = {
			normal: "chat",
			form: "upload"
		};
	
		return class CharCounter extends Plugin {
			onLoad () {
				this.patchedModules = {
					after: {
						ChannelTextAreaContainer: "render",
						Note: "render",
						ChangeNickname: "default",
						CustomStatusModal: "render"
					}
				};
				
				this.css = `
					${BDFDB.dotCN._charcountercounteradded} {
						position: relative !important;
					}
					${BDFDB.dotCN._charcountercounter} {
						display: block;
						position: absolute;
						z-index: 1000;
						pointer-events: none;
						font-size: 15px;
					}
					${BDFDB.dotCN._charcounterchatcounter} {
						right: 0;
						bottom: -1.3em;
					}
					${BDFDB.dotCN._charcountereditcounter} {
						right: 0;
						bottom: -1.3em;
					}
					${BDFDB.dotCN._charcounteruploadcounter} {
						right: 0;
						bottom: -1.0em;
					}
					${BDFDB.dotCN._charcounternickcounter} {
						right: 0 !important;
						top: 0 !important;
					}
					${BDFDB.dotCN._charcountercustomstatuscounter} {
						right: 0 !important;
						top: -1.5em;
					}
					${BDFDB.dotCN._charcounterpopoutnotecounter} {
						right: 3px !important;
						bottom: -8px !important;
						font-size: 10px !important;
					}
					${BDFDB.dotCN._charcounterprofilenotecounter} {
						right: 0 !important;
						bottom: -10px !important;
						font-size: 12px !important;
					}
					${BDFDB.dotCN.usernotetextarea}:not(:focus) ~ ${BDFDB.dotCN._charcountercounter} {
						display: none;
					}
				`;
			}
			
			onStart () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processChannelTextAreaContainer (e) {
				let editorContainer = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "ChannelEditorContainer"});
				if (editorContainer && editorContainer.props.type && maxLenghts[editorContainer.props.type] && !editorContainer.props.disabled) {
					if (!BDFDB.ArrayUtils.is(e.returnvalue.props.children)) e.returnvalue.props.children = [e.returnvalue.props.children];
					this.injectCounter(e.returnvalue, e.returnvalue.props.children, editorContainer.props.type, BDFDB.dotCN.textarea, true);
				}
			}

			processNote (e) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["TextAreaAutosize", "TextArea", "PlainTextArea"]});
				if (index > -1) this.injectCounter(e.returnvalue, children, e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.usernotepopout) > -1 ? "popoutnote" : "profilenote", "textarea");
			}

			processChangeNickname (e) {
				let formItem = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "FormItem"});
				if (formItem) {
					let [children, index] = BDFDB.ReactUtils.findParent(formItem, {name: "TextInput"});
					if (index > -1) this.injectCounter(formItem, children, "nick", BDFDB.dotCN.input);
				}
			}

			processCustomStatusModal (e) {
				let formItem = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.emojiinputcontainer]]});
				if (formItem) this.injectCounter(formItem, formItem.props.children, "customstatus", BDFDB.dotCN.input);
			}
			
			injectCounter (parent, children, type, refClass, parsing) {
				if (!children) return;
				if (parent.props.className) parent.props.className = BDFDB.DOMUtils.formatClassName(parent.props.className, BDFDB.disCN._charcountercounteradded);
				else parent.props.children = BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCN._charcountercounteradded,
					children: parent.props.children
				});
				children.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CharCounter, {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._charcountercounter, type && BDFDB.disCN[`_charcounter${typeMap[type] || type}counter`]),
					refClass: refClass,
					parsing: parsing,
					max: maxLenghts[type],
					onChange: instance => {
						let node = BDFDB.ReactUtils.findDOMNode(instance);
						let form = node && BDFDB.DOMUtils.getParent(BDFDB.dotCN.chatform, node);
						if (form) {
							let typing = form.querySelector(BDFDB.dotCN.typing);
							if (typing) typing.style.setProperty("margin-right", `${BDFDB.DOMUtils.getWidth(node) + 10}px`);
						}
					}
				}));
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();