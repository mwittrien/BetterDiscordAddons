/**
 * @name CompleteTimestamps
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.5.7
 * @description Replaces Timestamps with your own custom Timestamps
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CompleteTimestamps/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/CompleteTimestamps/CompleteTimestamps.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "CompleteTimestamps",
			"author": "DevilBro",
			"version": "1.5.7",
			"description": "Replaces Timestamps with your own custom Timestamps"
		},
		"changeLog": {
			"fixed": {
				"Works again": "",
				"Edit Stamp Compact Mode": "Fixed Issue where the (edited) stamp would grow in size in compact mode"
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
		var currentMode, tooltipIsSame;
		var MessageTimestampComponent;
	
		return class CompleteTimestamps extends Plugin {
			onLoad () {
				MessageTimestampComponent = (BDFDB.ModuleUtils.findByName("MessageTimestamp", false) || {exports: null}).exports;
				
				this.defaults = {
					general: {
						showInChat:				{value: true, 			description: "Replace Chat Timestamps with complete Timestamps"},
						showInEmbed:			{value: true, 			description: "Replace Embed Timestamps with complete Timestamps"},
						showInAuditLogs:		{value: true, 			description: "Replace Audit Log Timestamps with complete Timestamps"},
						changeForChat:			{value: true, 			description: "Change the Time for Chat Time Tooltips"},
						changeForEdit:			{value: true, 			description: "Change the Time for Edited Time Tooltips"}
					},
					dates: {
						timestampDate:			{value: {}, 			description: "Chat Timestamp"},
						tooltipDate:			{value: {}, 			description: "Tooltip Timestamp"}
					}
				};
				
				this.patchedModules = {
					after: {
						Message: "default",
						MessageTimestamp: "default",
						Embed: "render",
						SystemMessage: "default",
						AuditLog: "render"
					}
				};
				
				this.css = `
					${BDFDB.dotCN.messagetimestamp} {
						z-index: 1;
					}
				`;
			}
			
			onStart () {
				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
				
				BDFDB.DOMUtils.removeLocalStyle(this.name + "CompactCorrection");
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						settingsItems.push(Object.keys(this.defaults.general).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["general", key],
							label: this.defaults.general[key].description,
							value: this.settings.general[key]
						})));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
							className: BDFDB.disCN.marginbottom8
						}));
						
						settingsItems.push(Object.keys(this.defaults.dates).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.DateInput, Object.assign({}, this.settings.dates[key], {
							label: this.defaults.dates[key].description,
							onChange: valueObj => {
								this.SettingsUpdated = true;
								this.settings.dates[key] = valueObj;
								BDFDB.DataUtils.save(this.settings.dates, this, "dates");
							}
						}))));
						
						return settingsItems.flat(10);
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
				currentMode = null;
				tooltipIsSame = BDFDB.equals(this.settings.dates.timestampDate, this.settings.dates.tooltipDate);
				
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			processMessage (e) {
				if (MessageTimestampComponent) {
					let timestamp = BDFDB.ReactUtils.findChild(e.returnvalue, {filter: c => c && c.type && c.type.type && c.type.type.displayName == "MessageTimestamp"});
					if (timestamp) timestamp.type.type = MessageTimestampComponent.default;
				}
			}
			
			processMessageTimestamp (e) {
				let tooltipWrapper = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "Tooltip"});
				if (!tooltipWrapper) return;
				let childClassName = BDFDB.ObjectUtils.get(e, "instance.props.children.props.className");
				if (childClassName && childClassName.indexOf(BDFDB.disCN.messageedited) > -1) {
					if (this.settings.general.changeForEdit) tooltipWrapper.props.text = this.formatTimestamp(this.settings.dates.tooltipDate, e.instance.props.timestamp._i);
				}
				else {
					if (this.settings.general.changeForChat) tooltipWrapper.props.text = this.formatTimestamp(this.settings.dates.tooltipDate, e.instance.props.timestamp._i);
					if (this.settings.general.showInChat && !e.instance.props.cozyAlt) {
						if (tooltipIsSame) tooltipWrapper.props.delay = 99999999999999999999;
						let timestamp = this.formatTimestamp(this.settings.dates.timestampDate, e.instance.props.timestamp._i);
						let renderChildren = tooltipWrapper.props.children;
						tooltipWrapper.props.children = (...args) => {
							let renderedChildren = renderChildren(...args);
							if (BDFDB.ArrayUtils.is(renderedChildren.props.children)) renderedChildren.props.children[1] = timestamp;
							else renderedChildren.props.children = timestamp;
							return renderedChildren;
						};
						this.setMaxWidth(e.returnvalue, e.instance.props.compact);
					}
				}
			}

			processEmbed (e) {
				if (e.instance.props.embed && e.instance.props.embed.timestamp && this.settings.general.showInEmbed) {
					let process = returnvalue => {
						let [children, index] = BDFDB.ReactUtils.findParent(returnvalue, {props: [["className", BDFDB.disCN.embedfootertext]]});
						if (index > -1) {
							if (BDFDB.ArrayUtils.is(children[index].props.children)) children[index].props.children[children[index].props.children.length - 1] = this.formatTimestamp(this.settings.dates.timestampDate, e.instance.props.embed.timestamp._i);
							else children[index].props.children = this.formatTimestamp(this.settings.dates.timestampDate, e.instance.props.embed.timestamp._i);
						}
					};
					if (typeof e.returnvalue.props.children == "function") {
						let childrenRender = e.returnvalue.props.children;
						e.returnvalue.props.children = (...args) => {
							let children = childrenRender(...args);
							process(children);
							return children;
						};
					}
					else process(e.returnvalue);
				}
			}

			processSystemMessage (e) {
				if (e.instance.props.timestamp && this.settings.general.showInChat) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "time"});
					if (index > -1) children[index].props.children = this.formatTimestamp(this.settings.dates.timestampDate, e.instance.props.timestamp._i);
				}
			}

			processAuditLog (e) {
				if (e.instance.props.log && this.settings.general.showInAuditLogs) {
					if (typeof e.returnvalue.props.children == "function") {
						let childrenRender = e.returnvalue.props.children;
						e.returnvalue.props.children = (...args) => {
							let children = childrenRender(...args);
							this.editLog(e.instance.props.log, children);
							return children;
						};
					}
					else this.editLog(e.instance.props.log, e.returnvalue);
				}
			}
			
			editLog (log, returnvalue) {
				if (!log || !returnvalue) return;
				let [children, index] = BDFDB.ReactUtils.findParent(returnvalue, {props: [["className", BDFDB.disCN.auditlogtimestamp]]});
				if (index > -1) children[index].props.children = this.formatTimestamp(this.settings.dates.timestampDate, log.timestampStart._i);
			}
			
			formatTimestamp (format, date) {
				return BDFDB.LibraryModules.StringUtils.upperCaseFirstChar(BDFDB.LibraryComponents.DateInput.format(format, date));
			}
			
			setMaxWidth (timestamp, compact) {
				if (currentMode != compact) {
					currentMode = compact;
					if (timestamp.props.className && typeof timestamp.type == "string") {
						let tempTimestamp = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN.messagecompact}"><${timestamp.type} class="${timestamp.props.className}" style="width: auto !important;">${this.formatTimestamp(this.settings.dates.timestampDate, new Date(253402124399995))}</${timestamp.type}></div>`);
						document.body.appendChild(tempTimestamp);
						let width = BDFDB.DOMUtils.getRects(tempTimestamp.firstElementChild).width + 10;
						tempTimestamp.remove();
						BDFDB.DOMUtils.appendLocalStyle(this.name + "CompactCorrection", `
							${BDFDB.dotCN.messagecompact + BDFDB.dotCN.messagewrapper} {
								padding-left: ${44 + width}px;
							}
							${BDFDB.dotCNS.messagecompact + BDFDB.dotCN.messagecontents} {
								margin-left: -${44 + width}px;
								padding-left: ${44 + width}px;
								text-indent: calc(-${44 + width}px - -1rem);
							}
							${BDFDB.dotCNS.messagecompact + BDFDB.dotCNS.messageheader + BDFDB.dotCN.messagetimestamp} {
								width: ${width}px;
							}
						`);
					}
					 
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
