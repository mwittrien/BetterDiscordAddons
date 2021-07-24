/**
 * @name MessageUtilities
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.9.2
 * @description Adds several Quick Actions for Messages (Delete, Edit, Pin, etc.)
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/MessageUtilities/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/MessageUtilities/MessageUtilities.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "MessageUtilities",
			"author": "DevilBro",
			"version": "1.9.2",
			"description": "Adds several Quick Actions for Messages (Delete, Edit, Pin, etc.)"
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
		const clickMap = {
			CLICK: 0,
			DBLCLICK: 1
		};
		var firedEvents = [], clickTimeout;
		var settings = {}, bindings = {}, enabledBindings = {}, toasts = {};
		
		var ChannelTextAreaForm;
		
		return class MessageUtilities extends Plugin {
			onLoad () {
				this.defaults = {
					settings: {
						"addHints":					{value: true, 	description: "Add Key Combo hints to Context Menus"},
						"clearOnEscape":			{value: true, 	description: "Clear Chat Input when Escape is pressed"}
					},
					toasts: {},
					bindings: {
						"Edit_Message":				{name: "Edit Message",			func: this.doEdit,		value: {click: 1, 	keycombo: []}		},
						"Delete_Message":			{name: "Delete Message",		func: this.doDelete,	value: {click: 0, 	keycombo: [46]}		},
						"Pin/Unpin_Message":		{name: "Pin/Unpin Message",		func: this.doPinUnPin,	value: {click: 0, 	keycombo: [17]}		},
						"Reply_to_Message":			{name: "Reply to Message",		func: this.doReply,		value: {click: 0, 	keycombo: [17,72]}	},
						"React_to_Message":			{name: "Open React Menu",		func: this.doOpenReact,	value: {click: 0, 	keycombo: [17,83]}	},
						"Copy_Raw":					{name: "Copy raw Message",		func: this.doCopyRaw,	value: {click: 0, 	keycombo: [17,68]}	},
						"Copy_Link":				{name: "Copy Message Link",		func: this.doCopyLink,	value: {click: 0, 	keycombo: [17,81]}	},
						"__Quote_Message":			{name: "Quote Message",			func: this.doQuote,		value: {click: 0, 	keycombo: [17,87]}, plugin: "CustomQuoter"},
						"__Note_Message":			{name: "Note Message",			func: this.doNote,		value: {click: 0, 	keycombo: [16]}, 	plugin: "PersonalPins"},
						"__Translate_Message":		{name: "Translate Message",		func: this.doTranslate,	value: {click: 0, 	keycombo: [20]}, 	plugin: "Translator"}
					}
				};
				
				this.patchedModules = {
					before: {
						Menu: "default",
						Message: "default",
						ChannelTextAreaForm: "render"
					}
				};
				
				for (let type in this.defaults.bindings) {
					let nativeAction = type.indexOf("__") != 0;
					this.defaults.settings[type] = {value: nativeAction};
					if (nativeAction) this.defaults.toasts[type] = {value: type != "Edit_Message" && type != "React_to_Message" && type != "Quote_Message"};
				}
			}
			
			onStart () {
				BDFDB.ListenerUtils.add(this, document, "keydown", event => {
					if (BDFDB.DOMUtils.getParent(BDFDB.dotCN.textareawrapchat, document.activeElement)) this.onKeyDown(event);
				});
				
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
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Settings",
							collapseStates: collapseStates,
							children: Object.keys(settings).map(key => this.defaults.settings[key].description && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["settings", key],
								label: this.defaults.settings[key].description,
								value: settings[key]
							}))
						}));
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Actions",
							collapseStates: collapseStates,
							children: Object.keys(bindings).map(action => {
								if (this.defaults.bindings[action].plugin && !BDFDB.BDUtils.isPluginEnabled(this.defaults.bindings[action].plugin)) return null;
								let keyRecorderIns, clickSelectorIns;
								return BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.marginbottom20,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
											className: BDFDB.disCN.marginbottom8,
											align: BDFDB.LibraryComponents.Flex.Align.CENTER,
											direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
											children: [
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsLabel, {
													label: this.defaults.bindings[action].name + (this.defaults.bindings[action].plugin ? ` (${this.defaults.bindings[action].plugin})` : "")
												}),
												toasts[action] != undefined ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
													type: "Switch",
													mini: true,
													plugin: this,
													keys: ["toasts", action],
													grow: 0,
													label: "Show Confirmation Toast:",
													value: toasts[action]
												}) : null
											].filter(n => n)
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
											type: "Switch",
											plugin: this,
											keys: ["settings", action],
											value: settings[action],
											onChange: value => {
												keyRecorderIns.props.disabled = !value;
												clickSelectorIns.props.disabled = !value;
												BDFDB.ReactUtils.forceUpdate(keyRecorderIns, clickSelectorIns);
											},
											labelChildren: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
												direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
												children: [
													BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.KeybindRecorder, {
														value: bindings[action].keycombo.filter(n => n),
														reset: true,
														disabled: !settings[action],
														ref: instance => {if (instance) keyRecorderIns = instance;},
														onChange: value => {
															bindings[action].keycombo = value;
															BDFDB.DataUtils.save(bindings, this, "bindings");
															this.SettingsUpdated = true;
														}
													}),
													BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Select, {
														value: bindings[action].click,
														options: Object.keys(clickMap).map((label, i) => ({value: i, label: label})),
														disabled: !settings[action],
														ref: instance => {if (instance) clickSelectorIns = instance;},
														onChange: value => {
															bindings[action].click = value;
															BDFDB.DataUtils.save(bindings, this, "bindings");
															this.SettingsUpdated = true;
														}
													})
												]
											})
										})
									]
								});
							}).concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Button",
								color: BDFDB.LibraryComponents.Button.Colors.RED,
								label: "Reset all Key Bindings",
								onClick: _ => {
									BDFDB.ModalUtils.confirm(this, "Are you sure you want to reset all Key Bindings?", _ => {
										BDFDB.DataUtils.remove(this, "bindings");
										BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
										this.SettingsUpdated = true;
									});
								},
								children: BDFDB.LanguageUtils.LanguageStrings.RESET
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
				bindings = BDFDB.DataUtils.get(this, "bindings");
				enabledBindings = BDFDB.ObjectUtils.filter(bindings, action => settings[action], true);
				toasts = BDFDB.DataUtils.get(this, "toasts");
				
				BDFDB.MessageUtils.rerenderAll();
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			processMenu (e) {
				let contextMenu = BDFDB.ReactUtils.findChild(e.instance, {props: "navId"});
				if (contextMenu && BDFDB.ArrayUtils.is(contextMenu.props.children)) for (let group of contextMenu.props.children) {
					if (group && group.type == BDFDB.LibraryComponents.MenuItems.MenuGroup && BDFDB.ArrayUtils.is(group.props.children)) for (let item of group.props.children) {
						if (item && item.props && item.props.id && !item.props.hint && !item.props.children) {
							let hint, action;
							if (item.props.id == "mark-unread") hint = settings.addHints && `${BDFDB.LibraryModules.KeyCodeUtils.getString(18)}+CLICK`;
							else {
								switch (item.props.id) {
									case "copy-link":
										action = "Copy_Link";
										break;
									case "edit":
										action = "Edit_Message";
										break;
									case "reply":
										action = "Reply_to_Message";
										break;
									case "pin":
									case "unpin":
										action = "Pin/Unpin_Message";
										break;
									case "delete":
										action = "Delete_Message";
										break;
								}
								if (action) hint = this.getActiveShortcutString(action);
							}
							if (hint) item.props.hint = _ => {
								return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
									hint: hint
								});
							};
						}
					}
				}
			}
		
			processMessage (e) {
				let message;
				for (let key in e.instance.props) {
					if (!message) message = BDFDB.ObjectUtils.get(e.instance.props[key], "props.message");
					else break;
				}
				if (message) {
					let props = Object.assign({}, e.instance.props);
					e.instance.props.onClick = event => {
						this.onClick(event, message);
						if (typeof props.onClick == "function") props.onClick(event);
					};
					e.instance.props.onDoubleClick = event => {
						this.onClick(event, message);
						if (typeof props.onDoubleClick == "function") props.onDoubleClick(event);
					};
				}
			}
		
			processChannelTextAreaForm (e) {
				ChannelTextAreaForm = e.instance;
			}

			onClick (event, message) {
				if (BDFDB.DOMUtils.getParent(BDFDB.dotCNC.messagebuttons + BDFDB.dotCN.spoilerhidden, event.target)) return;
				let type = event.type;
				if (!firedEvents.includes(type)) {
					firedEvents.push(type);
					let priorityAction = null;
					let clickType = clickMap[type.toUpperCase()];
					for (let action in enabledBindings) {
						let binding = enabledBindings[action];
						let priorityBinding = enabledBindings[priorityAction];
						if (this.checkIfBindingIsValid(binding, clickType) && (!enabledBindings[priorityAction] || binding.click > priorityBinding.click || binding.keycombo.length > priorityBinding.keycombo.length)) priorityAction = action;
					}
					if (priorityAction) {
						let messageDiv = BDFDB.DOMUtils.getParent(BDFDB.dotCNC.message + BDFDB.dotCN.searchresultsmessage, event.target);
						if (messageDiv) {
							BDFDB.ListenerUtils.stopEvent(event);
							BDFDB.TimeUtils.clear(clickTimeout);
							if (!this.hasDoubleClickOverwrite(enabledBindings[priorityAction])) {
								BDFDB.TimeUtils.suppress(_ => this.defaults.bindings[priorityAction].func.apply(this, [{messageDiv, message}, priorityAction, event]), "", this)();
							}
							else clickTimeout = BDFDB.TimeUtils.timeout(_ => {
								BDFDB.TimeUtils.suppress(_ => this.defaults.bindings[priorityAction].func.apply(this, [{messageDiv, message}, priorityAction, event]), "", this)();
							}, 500);
						}
					}
					BDFDB.TimeUtils.timeout(_ => BDFDB.ArrayUtils.remove(firedEvents, type, true));
				}
			}

			onKeyDown (event) {
				let type = event.type;
				if (!firedEvents.includes(type)) {
					if (event.which == 27 && settings.clearOnEscape && ChannelTextAreaForm) {
						ChannelTextAreaForm.setState({textValue: "", richValue: BDFDB.LibraryModules.SlateUtils.deserialize("")});
					}
					BDFDB.TimeUtils.timeout(_ => {BDFDB.ArrayUtils.remove(firedEvents, type, true)});
				}
			}

			checkIfBindingIsValid (binding, clickType) {
				if (binding.click != clickType) return false;
				for (let key of binding.keycombo) if (!BDFDB.ListenerUtils.isPressed(key)) return false;
				return true;
			}

			hasDoubleClickOverwrite (binding) {
				if (binding.click == clickMap.DBLCLICK) return false;
				let dblBindings = BDFDB.ObjectUtils.filter(enabledBindings, bndg => bndg.click == clickMap.DBLCLICK);
				for (let dblAction in dblBindings) {
					let dblBinding = dblBindings[dblAction];
					let overwrite = true;
					if (BDFDB.equals(binding.keycombo, dblBinding.keycombo)) return true;
				}
				return false;
			}

			doDelete ({messageDiv, message}, action, event) {
				let deleteLink = messageDiv.parentElement.querySelector(BDFDB.dotCNS.messagelocalbotoperations + BDFDB.dotCN.anchor);
				if (deleteLink) deleteLink.click();
				else if (BDFDB.DiscordConstants.MessageTypesDeletable[message.type]) {
					let channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
					if (channel && (BDFDB.UserUtils.can("MANAGE_MESSAGES") || message.author.id == BDFDB.UserUtils.me.id)) {
						BDFDB.LibraryModules.MessageUtils.deleteMessage(message.channel_id, message.id, message.state != BDFDB.DiscordConstants.MessageStates.SENT);
						if (toasts[action]) BDFDB.NotificationUtils.toast(this.formatToast(BDFDB.LanguageUtils.LanguageStrings.GUILD_SETTINGS_FOLLOWER_ANALYTICS_MESSAGE_DELETED), {type: "success"});
					}
				}
			}

			doEdit ({messageDiv, message}, action, event) {
				if (message.author.id == BDFDB.UserUtils.me.id && !messageDiv.querySelector(BDFDB.dotCN.messagechanneltextarea)) {
					BDFDB.LibraryModules.MessageUtils.startEditMessage(message.channel_id, message.id, message.content);
					if (toasts[action]) BDFDB.NotificationUtils.toast(this.formatToast(BDFDB.LanguageUtils.LanguageStrings.EDITING_MESSAGE), {type: "success"});
				}
			}

			doOpenReact ({messageDiv, message}, action, event) {
				let reactButton = messageDiv.querySelector(`${BDFDB.dotCN.messagetoolbarbutton}[aria-label="${BDFDB.LanguageUtils.LanguageStrings.ADD_REACTION}"]`);
				if (reactButton) {
					reactButton.click();
					if (toasts[action]) BDFDB.NotificationUtils.toast(this.formatToast(BDFDB.LanguageUtils.LanguageStrings.ADD_REACTIONS), {type: "success"});
				}
			}

			doPinUnPin ({messageDiv, message}, action, event) {
				if (message.state == BDFDB.DiscordConstants.MessageStates.SENT) {
					let channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
					if (channel && (BDFDB.DMUtils.isDMChannel(channel.id) || BDFDB.UserUtils.can("MANAGE_MESSAGES")) && (message.type == BDFDB.DiscordConstants.MessageTypes.DEFAULT || message.type == BDFDB.DiscordConstants.MessageTypes.REPLY)) {
						if (message.pinned) {
							BDFDB.LibraryModules.MessagePinUtils.unpinMessage(channel, message.id);
							if (toasts[action]) BDFDB.NotificationUtils.toast(this.formatToast(BDFDB.LanguageUtils.LanguageStrings.MESSAGE_UNPINNED), {type: "danger"});
						}
						else {
							BDFDB.LibraryModules.MessagePinUtils.pinMessage(channel, message.id);
							if (toasts[action]) BDFDB.NotificationUtils.toast(this.formatToast(BDFDB.LanguageUtils.LanguageStrings.MESSAGE_PINNED), {type: "success"});
						}
					}
				}
			}
			
			doReply ({messageDiv, message}, action, event) {
				if (message.state == BDFDB.DiscordConstants.MessageStates.SENT) {
					let channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
					if (channel && (BDFDB.DMUtils.isDMChannel(channel.id) || BDFDB.UserUtils.can("SEND_MESSAGES")) && (message.type == BDFDB.DiscordConstants.MessageTypes.DEFAULT || message.type == BDFDB.DiscordConstants.MessageTypes.REPLY)) {
						BDFDB.LibraryModules.MessageManageUtils.replyToMessage(channel, message, event);
						if (toasts[action]) BDFDB.NotificationUtils.toast(this.formatToast(BDFDB.LanguageUtils.LanguageStrings.NOTIFICATION_REPLY), {type: "success"});
					}
				}
			}

			doCopyRaw ({messageDiv, message}, action, event) {
				if (message.content) {
					BDFDB.LibraryRequires.electron.clipboard.write({text: message.content});
					if (toasts[action]) BDFDB.NotificationUtils.toast(this.formatToast(BDFDB.LanguageUtils.LanguageStrings.COPIED_TEXT), {type: "success"});
				}
			}

			doCopyLink ({messageDiv, message}, action, event) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
				if (channel) {
					BDFDB.LibraryModules.MessageManageUtils.copyLink(channel, message);
					if (toasts[action]) BDFDB.NotificationUtils.toast(this.formatToast(BDFDB.LanguageUtils.LanguageStrings.LINK_COPIED), {type: "success"});
				}
			}

			doQuote ({messageDiv, message}, action, event) {
				if (BDFDB.BDUtils.isPluginEnabled(this.defaults.bindings.__Quote_Message.plugin)) {
					let channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
					if (channel) BDFDB.BDUtils.getPlugin(this.defaults.bindings.__Quote_Message.plugin).quote(channel, message);
				}
			}

			doNote ({messageDiv, message}, action, event) {
				if (BDFDB.BDUtils.isPluginEnabled(this.defaults.bindings.__Note_Message.plugin)) {
					let channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
					if (channel) BDFDB.BDUtils.getPlugin(this.defaults.bindings.__Note_Message.plugin).addMessageToNotes(message, channel);
				}
			}

			doTranslate ({messageDiv, message}, action, event) {
				if (BDFDB.BDUtils.isPluginEnabled(this.defaults.bindings.__Translate_Message.plugin)) {
					let channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
					if (channel) BDFDB.BDUtils.getPlugin(this.defaults.bindings.__Translate_Message.plugin).translateMessage(message, channel);
				}
			}
			
			formatToast (string) {
				return typeof string == "string" ? (string.endsWith(".") || string.endsWith("!") ? string.slice(0, -1) : string) : "";
			}

			getActiveShortcutString (action) {
				if (!action) return null;
				let str = [];
				if (settings.addHints && settings[action] && enabledBindings[action]) {
					if (enabledBindings[action].keycombo.length) str.push(BDFDB.LibraryModules.KeyCodeUtils.getString(enabledBindings[action].keycombo));
					str.push(Object.keys(clickMap).find(type => clickMap[type] == enabledBindings[action].click));
				}
				return str.join("+").replace(/ /g, "");
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
