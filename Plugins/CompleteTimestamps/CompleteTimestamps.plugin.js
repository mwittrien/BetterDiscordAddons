/**
 * @name CompleteTimestamps
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.6.7
 * @description Replaces Timestamps with your own custom Timestamps
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/CompleteTimestamps/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/CompleteTimestamps/CompleteTimestamps.plugin.js
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
		var currentMode, tooltipIsSame;
	
		return class CompleteTimestamps extends Plugin {
			onLoad () {
				
				this.defaults = {
					places: {
						chat:					{value: true, 			description: "Chat Timestamps"},
						embed:					{value: true, 			description: "Embed Timestamps"},
						markup:					{value: true, 			description: "Markup Timestamps"},
						auditLogs:				{value: true, 			description: "Audit Logs Timestamps"}
					},
					tooltips: {
						chat:					{value: true, 			description: "Chat Time Tooltips"},
						edit:					{value: true, 			description: "Edited Time Tooltips"},
						markup:					{value: true, 			description: "Markup Timestamp Tooltips"}
					},
					dates: {
						timestampDate:			{value: {}, 			description: "Chat Timestamps"},
						tooltipDate:			{value: {}, 			description: "Tooltip Timestamps"}
					}
				};
				
				this.modulePatches = {
					after: [
						"AuditLogEntry",
						"Embed",
						"MessageTimestamp",
						"UserMemberSince"
					]
				};
				
				this.css = `
					${BDFDB.dotCN.messagetimestamp} {
						z-index: 1;
					}
				`;
			}
			
			onStart () {
				BDFDB.LibraryModules.MessageParser && BDFDB.LibraryModules.MessageParser.defaultRules && BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MessageParser.defaultRules.timestamp, "react", {after: e => {
					const date = 1e3 * Number(e.methodArguments[0].timestamp);
					if (this.settings.places.markup && e.methodArguments[0].formatted == BDFDB.LibraryModules.MessageParser.defaultRules.timestamp.parse([null, e.methodArguments[0].timestamp, "f"]).formatted) {
						if (tooltipIsSame) e.returnValue.props.delay = 99999999999999999999;
						let timestamp = this.formatTimestamp(this.settings.dates.timestampDate, date);
						if (e.returnValue.props.node) e.returnValue.props.node.formatted = timestamp;
					}
					if (this.settings.tooltips.markup) {
						e.returnValue.props.text = this.formatTimestamp(this.settings.dates.tooltipDate, date);
						if (e.returnValue.props.node) e.returnValue.props.node.full = e.returnValue.props.text;
					}
				}});
				
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
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Change Timestamps to custom Timestamps in:",
							children: Object.keys(this.defaults.places).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["places", key],
								label: this.defaults.places[key].description,
								value: this.settings.places[key]
							}))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Change Tooltip Timestamps to custom Timestamps for:",
							children: Object.keys(this.defaults.tooltips).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["tooltips", key],
								label: this.defaults.tooltips[key].description,
								value: this.settings.tooltips[key]
							}))
						}));
						
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
			
			processMessageTimestamp (e) {
				let tooltipWrapper = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "TooltipContainer"});
				if (!tooltipWrapper) return;
				let childClassName = BDFDB.ObjectUtils.get(e, "instance.props.children.props.className");
				if (childClassName && childClassName.indexOf(BDFDB.disCN.messageedited) > -1) {
					if (this.settings.tooltips.edit) tooltipWrapper.props.text = this.formatTimestamp(this.settings.dates.tooltipDate, e.instance.props.timestamp._i);
				}
				else {
					if (!e.instance.props.cozyAlt) {
						if (this.settings.places.chat) {
							if (tooltipIsSame) tooltipWrapper.props.delay = 99999999999999999999;
							let timestamp = this.formatTimestamp(this.settings.dates.timestampDate, e.instance.props.timestamp._i);
							let renderChildren = tooltipWrapper.props.children;
							tooltipWrapper.props.children = BDFDB.TimeUtils.suppress((...args) => {
								let renderedChildren = renderChildren(...args);
								let [children, index] = BDFDB.ReactUtils.findParent(renderedChildren, {props: [["className", BDFDB.disCN.messagetimestampseparator]]});
								if (index > -1) children[index + 1] = timestamp;
								else renderedChildren.props.children = timestamp;
								return renderedChildren;
							}, "Error in Children Render of TooltipContainer in MessageTimestamp!", this);
							this.setMaxWidth(e.returnvalue, e.instance.props.compact);
						}
					}
					if (this.settings.tooltips.chat) {
						let timestamp = this.formatTimestamp(this.settings.dates.tooltipDate, e.instance.props.timestamp._i);
						if (tooltipWrapper.props.text && tooltipWrapper.props.text.props && BDFDB.ArrayUtils.is(tooltipWrapper.props.text.props.children)) tooltipWrapper.props.text.props.children[0] = timestamp;
						else tooltipWrapper.props.text = timestamp;
					}
				}
			}
			
			processUserMemberSince (e) {
				let bodys = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.userpopoutsectionbody]], all: true});
				if (bodys[0]) bodys[0].props.children = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: this.formatTimestamp(this.settings.dates.tooltipDate, BDFDB.LibraryModules.TimestampUtils.extractTimestamp(e.instance.props.userId)),
					children: BDFDB.ReactUtils.createElement("span", {children: bodys[0].props.children})
				});
				if (e.instance.props.guildMember && e.instance.props.guildMember.joinedAt && bodys[1]) bodys[1].props.children = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: this.formatTimestamp(this.settings.dates.tooltipDate, e.instance.props.guildMember.joinedAt),
					children: BDFDB.ReactUtils.createElement("span", {children: bodys[1].props.children})
				});
			}

			processEmbed (e) {
				if (!this.settings.places.embed || !e.instance.props.embed || !e.instance.props.embed.timestamp) return;
				let process = returnvalue => {
					let [children, index] = BDFDB.ReactUtils.findParent(returnvalue, {props: [["className", BDFDB.disCN.embedfootertext]]});
					if (index > -1) {
						if (BDFDB.ArrayUtils.is(children[index].props.children)) children[index].props.children[children[index].props.children.length - 1] = this.formatTimestamp(this.settings.dates.timestampDate, e.instance.props.embed.timestamp._i);
						else children[index].props.children = this.formatTimestamp(this.settings.dates.timestampDate, e.instance.props.embed.timestamp._i);
					}
				};
				if (typeof e.returnvalue.props.children == "function") {
					let childrenRender = e.returnvalue.props.children;
					e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let children = childrenRender(...args);
						process(children);
						return children;
					}, "Error in Children Render of Embed!", this);
				}
				else process(e.returnvalue);
			}

			processAuditLogEntry (e) {
				if (!this.settings.places.auditLogs || !e.instance.props.log) return;
				let process = returnvalue => {
					let [children, index] = BDFDB.ReactUtils.findParent(returnvalue, {props: [["className", BDFDB.disCN.auditlogtimestamp]]});
					if (index > -1) children[index].props.children = this.formatTimestamp(this.settings.dates.timestampDate, e.instance.props.log.timestampStart._i);
				};
				if (typeof e.returnvalue.props.children == "function") {
					let childrenRender = e.returnvalue.props.children;
					e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let children = childrenRender(...args);
						process(children);
						return children;
					}, "", this);
				}
				else process(e.returnvalue);
			}
			
			formatTimestamp (format, date) {
				return BDFDB.StringUtils.upperCaseFirstChar(BDFDB.LibraryComponents.DateInput.format(format, date));
			}
			
			setMaxWidth (timestamp, compact) {
				if (currentMode == compact) return;
				currentMode = compact;
				if (!timestamp.props.className || typeof timestamp.type != "string") return;
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
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
