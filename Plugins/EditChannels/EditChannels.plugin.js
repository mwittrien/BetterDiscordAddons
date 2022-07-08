/**
 * @name EditChannels
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 4.3.9
 * @description Allows you to locally edit Channels
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditChannels/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/EditChannels/EditChannels.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "EditChannels",
			"author": "DevilBro",
			"version": "4.3.9",
			"description": "Allows you to locally edit Channels"
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
		var changedChannels = {};
	
		return class EditChannels extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						changeChannelIcon:	{value: true, 			description: "Change Color of Channel Icon"}
					},
					places: {
						chatTextarea:		{value: true, 			description: "Chat Textarea"},
						chatWindow:			{value: true, 			description: "Messages"},
						mentions:			{value: true, 			description: "Mentions"},
						channelList:		{value: true, 			description: "Channel/Group List"},
						channelHeader:		{value: true, 			description: "Channel/Group Header"},
						recentDms:			{value: true, 			description: "Group Notifications"},
						recentMentions:		{value: true, 			description: "Recent Mentions Popout"},
						threads:			{value: true, 			description: "Thread Overview"},
						autocompletes:		{value: true, 			description: "Autocomplete Menu"},
						auditLog:			{value: true, 			description: "Audit Log"},
						inviteLog:			{value: true, 			description: "Invite Log"},
						quickSwitcher:		{value: true, 			description: "Quick Switcher"},
						searchResults:		{value: true, 			description: "Search Results"},
						searchPopout:		{value: true, 			description: "Search Popout"},
						appTitle:			{value: true, 			description: "Discord App Title (Channels)"}
					}
				};
			
				this.patchedModules = {
					before: {
						ChannelEditorContainer: "render",
						TextChannelEmptyMessage: "default",
						ThreadEmptyMessage: "default",
						SystemMessageWrapper: "type",
						AutocompleteChannelResult: "render",
						GuildSettingsAuditLogEntry: "render",
						SettingsInvites: "render",
						HeaderBarContainer: "default",
						ChannelCategoryItem: "type",
						ChannelItem: "default",
						GuildSidebarThreadListEntry: "type",
						QuickSwitchChannelResult: "render",
						SearchPopoutComponent: "render",
						MessageContent: "type"
					},
					after: {
						ThreadMessageAccessories: "default",
						ThreadCreated: "default",
						AutocompleteChannelResult: "render",
						GuildSettingsAuditLogEntry: "render",
						HeaderBarContainer: "default",
						ThreadSidebar: "default",
						ThreadCard: "type",
						FocusRing: "default",
						ChannelItem: "default",
						GuildSidebarThreadListEntry: "type",
						DirectMessage: "render",
						PrivateChannel: "render",
						QuickSwitchChannelResult: "render",
						SearchResultsInner: "default",
						RecentsChannelHeader: "default",
						RichChannelMention: "ChannelMention"
					}
				};
				
				this.patchPriority = 9;
				
				this.css = `
					${BDFDB.dotCN.messagespopoutchannelname}:hover > span[style*="color"],
					${BDFDB.dotCN.recentmentionschannelname}:hover > span[style*="color"],
					${BDFDB.dotCN.searchresultschannelname}:hover > span[style*="color"] {
						text-decoration: underline;
					}
				`;
			}
			
			onStart () {				
				let observer = new MutationObserver(_ => {this.changeAppTitle();});
				BDFDB.ObserverUtils.connect(this, document.head.querySelector("title"), {name: "appTitleObserver", instance: observer}, {childList: true});
				
				if (BDFDB.LibraryModules.AutocompleteOptions && BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS) BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.AutocompleteOptions.AUTOCOMPLETE_OPTIONS.CHANNELS, "queryResults", {after: e => {
					let channelArray = [];
					for (let id in changedChannels) if (changedChannels[id] && changedChannels[id].name) {
						let channel = BDFDB.LibraryModules.ChannelStore.getChannel(id);
						let category = channel && channel.parent_id && BDFDB.LibraryModules.ChannelStore.getChannel(channel.parent_id);
						let catData = category && changedChannels[category.id] || {};
						if (BDFDB.ChannelUtils.isTextChannel(channel) && channel.guild_id == e.methodArguments[0].guild_id) channelArray.push(Object.assign({
							lowerCaseName: changedChannels[id].name.toLowerCase(),
							lowerCaseCatName: catData && catData.name && catData.name.toLowerCase(),
							channel,
							category,
							catData
						}, changedChannels[id]));
					}
					channelArray = BDFDB.ArrayUtils.keySort(channelArray.filter(n => e.returnValue.results.channels.every(channel => channel.id != n.channel.id) && (n.lowerCaseName.indexOf(e.methodArguments[2].toLowerCase()) != -1 || (n.lowerCaseCatName && n.lowerCaseCatName.indexOf(e.methodArguments[2].toLowerCase()) != -1))), "lowerCaseName");
					e.returnValue.results.channels = [].concat(e.returnValue.results.channels, channelArray.map(n => n.channel)).slice(0, BDFDB.DiscordConstants.MAX_AUTOCOMPLETE_RESULTS);
				}});
				
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
						
						settingsItems.push(Object.keys(this.defaults.general).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["general", key],
							label: this.defaults.general[key].description,
							value: this.settings.general[key]
						})));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
							title: "Change Channels in:",
							children: Object.keys(this.defaults.places).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["places", key],
								label: this.defaults.places[key].description,
								value: this.settings.places[key]
							}))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Button",
							color: BDFDB.LibraryComponents.Button.Colors.RED,
							label: "Reset all Channels",
							onClick: _ => BDFDB.ModalUtils.confirm(this, this.labels.confirm_resetall, _ => {
								BDFDB.DataUtils.remove(this, "channels");
								this.forceUpdateAll();;
							}),
							children: BDFDB.LanguageUtils.LanguageStrings.RESET
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
		
			forceUpdateAll (instant = false) {
				changedChannels = BDFDB.DataUtils.load(this, "channels");
				
				this.changeAppTitle();
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.DiscordUtils.rerenderAll(instant);
			}

			onChannelContextMenu (e) {
				if (e.instance.props.channel && (e.subType == "useChannelDeleteItem" || e.subType == "useChannelLeaveItem")) {
					if (e.returnvalue.length > 0) e.returnvalue.unshift(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuSeparator, {}));
					e.returnvalue.unshift(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.context_localchannelsettings,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-submenu"),
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
							children: [
								BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
									label: this.labels.submenu_channelsettings,
									id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-change"),
									action: _ => this.openChannelSettingsModal(e.instance.props.channel)
								}),
								BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
									label: this.labels.submenu_resetsettings,
									id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-reset"),
									color: BDFDB.LibraryComponents.MenuItems.Colors.DANGER,
									disabled: !changedChannels[e.instance.props.channel.id],
									action: event => {
										let remove = _ => {
											BDFDB.DataUtils.remove(this, "channels", e.instance.props.channel.id);
											this.forceUpdateAll(true);
										};
										if (event.shiftKey) remove();
										else BDFDB.ModalUtils.confirm(this, this.labels.confirm_reset, remove);
									}
								})
							]
						})
					}));
				}
			}
			
			processChannelEditorContainer (e) {
				if (!e.instance.props.disabled && e.instance.props.channel && changedChannels[e.instance.props.channel.id] && (e.instance.props.type == BDFDB.LibraryComponents.ChannelTextAreaTypes.NORMAL || e.instance.props.type == BDFDB.LibraryComponents.ChannelTextAreaTypes.SIDEBAR) && this.settings.places.chatTextarea) {
					if (changedChannels[e.instance.props.channel.id].name) e.instance.props.placeholder = BDFDB.LanguageUtils.LanguageStringsFormat("TEXTAREA_PLACEHOLDER", `#${changedChannels[e.instance.props.channel.id].name}`);
				}
			}
			
			processTextChannelEmptyMessage (e) {
				if (e.instance.props.channel && changedChannels[e.instance.props.channel.id] && this.settings.places.chatWindow) e.instance.props.channel = this.getChannelData(e.instance.props.channel.id);
			}
			
			processThreadEmptyMessage (e) {
				if (e.instance.props.channel && changedChannels[e.instance.props.channel.id] && this.settings.places.chatWindow) e.instance.props.channel = this.getChannelData(e.instance.props.channel.id);
			}
			
			processSystemMessageWrapper (e) {
				if (e.instance.props.channel && changedChannels[e.instance.props.channel.id] && this.settings.places.chatWindow) e.instance.props.channel = this.getChannelData(e.instance.props.channel.id);
			}
			
			processThreadCreated (e) {
				if (e.instance.props.message && e.instance.props.message.messageReference && e.instance.props.message.messageReference.channel_id && changedChannels[e.instance.props.message.messageReference.channel_id] && this.settings.places.chatWindow) {
					let channelName = BDFDB.ObjectUtils.get(e, "returnvalue.props.children.2.props.children.0");
					if (changedChannels[e.instance.props.message.messageReference.channel_id].name) channelName.props.children = [changedChannels[e.instance.props.message.messageReference.channel_id].name];
					this.changeChannelColor(channelName, e.instance.props.message.messageReference.channel_id);
				}
			}
			
			processThreadMessageAccessories (e) {
				if (e.returnvalue.props.channel && changedChannels[e.returnvalue.props.channel.id] && this.settings.places.chatWindow) {
					e.returnvalue.props.channel = this.getChannelData(e.returnvalue.props.channel.id);
					let type = e.returnvalue.type;
					e.returnvalue.type = BDFDB.TimeUtils.suppress((...args) => {
						let returnValue = type(...args);
						let channelName = BDFDB.ReactUtils.findChild(returnValue, {props: [["className", BDFDB.disCN.messagesystemname]]});
						this.changeChannelColor(channelName, e.instance.props.message.messageReference.channel_id);
						return returnValue;
					}, "Error in Type Render of ThreadMessageAccessories!", this);
				}
			}

			processAutocompleteChannelResult (e) {
				console.log(e);
			}

			processGuildSettingsAuditLogEntry (e) {
				let channel = BDFDB.ObjectUtils.get(e.instance, "props.log.options.channel");
				if (channel && this.settings.places.auditLog) {
					if (!e.returnvalue) e.instance.props.log.options.channel = this.getChannelData(channel.id);
					else {
						let channelName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["children", [["#" + channel.name]]]]});
						if (channelName) this.changeChannelColor(channelName, channel.id);
					}
				}
			}

			processSettingsInvites (e) {
				if (BDFDB.ObjectUtils.is(e.instance.props.invites) && this.settings.places.inviteLog) {
					e.instance.props.invites = Object.assign({}, e.instance.props.invites);
					for (let id in e.instance.props.invites) e.instance.props.invites[id] = new BDFDB.DiscordObjects.Invite(Object.assign({}, e.instance.props.invites[id], {channel: this.getChannelData(e.instance.props.invites[id].channel.id)}));
				}
			}
			
			processHeaderBarContainer (e) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.channelId);
				if (channel && this.settings.places.channelHeader) {
					let thread;
					if (BDFDB.ChannelUtils.isThread(channel)) {
						thread = channel;
						channel = BDFDB.LibraryModules.ChannelStore.getChannel(thread.parent_id);
					}
					if (changedChannels[channel.id] || thread && changedChannels[thread.id]) {
						if (!e.returnvalue) {
							let channelNames = BDFDB.ReactUtils.findChild(e.instance, {all: true, name: ["Title", "ChannelName"]});
							if (channelNames.length) {
								if (channelNames[0].props.children) {
									if (changedChannels[channel.id] && changedChannels[channel.id].name) channelNames[0].props.children = channel.isGroupDM() ? this.getGroupName(channel.id) : this.getChannelData(channel.id).name;
									this.changeChannelColor(channelNames[0], channel.id);
								}
								if (channelNames[0].props.channel) channelNames[0].props.channel = this.getChannelData(channel.id);
								if (thread && channelNames[1].props.children) {
									if (changedChannels[thread.id] && changedChannels[thread.id].name) channelNames[1].props.children = this.getChannelData(thread.id).name;
									this.changeChannelColor(channelNames[1], thread.id);
								}
							}
						}
						else {
							let channelIcons = BDFDB.ReactUtils.findChild(e.instance, {all: true, name: "Icon"});
							if (channelIcons.length) {
								if (channelIcons[0].props.icon) {
									let iconRender = channelIcons[0].props.icon;
									channelIcons[0].props.icon = BDFDB.TimeUtils.suppress((...args) => {
										let icon = iconRender(...args);
										this.changeChannelIconColor(icon, channel.id);
										return icon;
									}, "Error in Channel Icon Render of HeaderBarContainer!", this);
								}
								if (thread && channelIcons[1].props.icon) {
									let iconRender = channelIcons[1].props.icon;
									channelIcons[1].props.icon = BDFDB.TimeUtils.suppress((...args) => {
										let icon = iconRender(...args);
										this.changeChannelIconColor(icon, thread.id);
										return icon;
									}, "Error in Thread Icon Render of HeaderBarContainer!", this);
								}
							}
						}
					}
				}
			}
			
			processThreadSidebar (e) {
				if (changedChannels[e.instance.props.channelId] && this.settings.places.channelHeader) {
					let channelName = BDFDB.ReactUtils.findChild(e.returnvalue, {name: ["Title", "ChannelName"]});
					if (channelName && channelName.props.children) {
						if (changedChannels[e.instance.props.channelId].name) channelName.props.children = this.getChannelData(e.instance.props.channelId).name;
						this.changeChannelColor(channelName, e.instance.props.channelId);
					}
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "Icon"});
					if (index > -1) {
						let icon = BDFDB.ReactUtils.createElement(children[index].props.icon, {
							className: BDFDB.disCN.channelheadericon
						});
						this.changeChannelIconColor(icon, e.instance.props.channelId);
						children[index] = BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.channelheadericonwrapper,
							children: icon
						})
					}
				}
			}

			processThreadCard (e) {
				if (changedChannels[e.instance.props.threadId] && this.settings.places.threads) {
					let channelName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.threadcardname]]});
					if (channelName) {
						if (changedChannels[e.instance.props.threadId].name) channelName.props.children = changedChannels[e.instance.props.threadId].name;
						this.changeChannelColor(channelName, e.instance.props.threadId);
					}
				}
			}

			processFocusRing (e) {
				if (e.returnvalue && e.returnvalue.props.className) {
					let change, channelId, nameClass, categoyClass, iconClass, modify = {};
					if (this.settings.places.channelList && e.returnvalue.props.className.indexOf(BDFDB.disCN.categoryiconvisibility) > -1) {
						change = true;
						channelId = (BDFDB.ReactUtils.findValue(e.returnvalue, "data-list-item-id") || "").split("___").pop();
						nameClass = BDFDB.disCN.categoryname;
						iconClass = BDFDB.disCN.categoryicon;
						modify = {muted: BDFDB.LibraryModules.MutedUtils.isGuildOrCategoryOrChannelMuted(BDFDB.LibraryModules.LastGuildStore.getGuildId(), channelId)};
					}
					else if (this.settings.places.searchPopout && e.returnvalue.props.className.indexOf(BDFDB.disCN.searchpopoutoption) > -1) {
						change = true;
						let channel = (BDFDB.ReactUtils.findValue(e.returnvalue._owner, "result", {up: true}) || {}).channel;
						channelId = channel && channel.id;
						nameClass = BDFDB.disCN.searchpopoutresultchannel;
						categoyClass = BDFDB.disCN.searchpopoutsearchresultchannelcategory;
						iconClass = BDFDB.disCN.searchpopoutsearchresultchannelicon;
					}
					if (change && channelId) {
						if (changedChannels[channelId]) {
							let name = nameClass && BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", nameClass]]});
							if (name) {
								name = name.props && name.props.children || name;
								this.changeChannelColor(BDFDB.ArrayUtils.is(name) ? name.find(c => c.type == "strong") || name[0] : name, channelId, modify);
							}
							let icon = iconClass && BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", iconClass]]});
							if (icon) this.changeChannelIconColor(icon, channelId, modify);
						}
						let categoryId = (BDFDB.LibraryModules.ChannelStore.getChannel(channelId) || {}).parent_id;
						if (categoryId && changedChannels[categoryId]) {
							let categoryName = categoyClass && BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", categoyClass]]});
							if (categoryName) {
								categoryName.props.children = this.getChannelData(categoryId).name;
								this.changeChannelColor(categoryName, categoryId, modify);
							}
						}
					}
				}
			}
			
			processChannelCategoryItem (e) {
				if (e.instance.props.channel && this.settings.places.channelList) e.instance.props.channel = this.getChannelData(e.instance.props.channel.id, true, e.instance.props.channel);
			}
			
			processChannelItem (e) {
				if (e.instance.props.channel && this.settings.places.channelList) {
					if (!e.returnvalue) e.instance.props.channel = this.getChannelData(e.instance.props.channel.id, true, e.instance.props.channel);
					else {
						let modify = BDFDB.ObjectUtils.extract(Object.assign({}, e.instance.props, e.instance.state), "muted", "locked", "selected", "unread", "connected", "hovered");
						let channelName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.channelnameinner]]});
						if (channelName) this.changeChannelColor(channelName, e.instance.props.channel.id, modify);
						let channelIcon = this.settings.general.changeChannelIcon && BDFDB.ReactUtils.findChild(e.returnvalue, {name: "ChannelItemIcon"});
						if (channelIcon && typeof channelIcon.type == "function") {
							let type = channelIcon.type;
							channelIcon.type = BDFDB.TimeUtils.suppress((...args) => {
								let returnValue = type(...args);
								if (returnValue && typeof returnValue.props.children == "function") {
									let childrenRender = returnValue.props.children;
									returnValue.props.children = BDFDB.TimeUtils.suppress((...args2) => {
										let renderedChildren = childrenRender(...args2);
										this.changeChannelIconColor(renderedChildren.props.children, e.instance.props.channel.id, modify);
										return renderedChildren;
									}, "Error in Children Render of ChannelItem!", this);
								}
								return returnValue;
							}, "Error in Type Render of ChannelItem!", this);
						}
					}
				}
			}

			processGuildSidebarThreadListEntry (e) {
				if (e.instance.props.thread && this.settings.places.channelList) {
					if (!e.returnvalue) e.instance.props.thread = this.getChannelData(e.instance.props.thread.id, true, e.instance.props.thread);
					else {
						let modify = BDFDB.ObjectUtils.extract(Object.assign({}, e.instance.props, e.instance.state), "muted", "locked", "selected", "unread", "connected", "hovered");
						let channelName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.channelnameinner]]});
						if (channelName) this.changeChannelColor(channelName, e.instance.props.thread.id, modify);
					}
				}
			}

			processDirectMessage (e) {
				if (e.instance.props.channel && e.instance.props.channel.isGroupDM() && this.settings.places.recentDms) {
					if (changedChannels[e.instance.props.channel.id] && changedChannels[e.instance.props.channel.id].name) {
						let tooltip = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "ListItemTooltip"});
						if (tooltip) tooltip.props.text = this.getGroupName(e.instance.props.channel.id);
					}
					let avatar = BDFDB.ReactUtils.findChild(e.returnvalue, {filter: c => c && c.props && !isNaN(parseInt(c.props.id))});
					if (avatar && typeof avatar.props.children == "function") {
						let childrenRender = avatar.props.children;
						avatar.props.children = BDFDB.TimeUtils.suppress((...args) => {
							let renderedChildren = childrenRender(...args);
							if (renderedChildren && renderedChildren.props) renderedChildren.props.icon = this.getGroupIcon(e.instance.props.channel.id);
							return renderedChildren;
						}, "Error in Avatar Render of DirectMessage!", this);
					}
				}
			}

			processPrivateChannel (e) {
				if (e.instance.props.channel && e.instance.props.channel.isGroupDM() && this.settings.places.channelList) {
					let wrapper = e.returnvalue && e.returnvalue.props.children && e.returnvalue.props.children.props && typeof e.returnvalue.props.children.props.children == "function" ? e.returnvalue.props.children : e.returnvalue;
					if (typeof wrapper.props.children == "function") {
						let childrenRender = wrapper.props.children;
						wrapper.props.children = BDFDB.TimeUtils.suppress((...args) => {
							let children = childrenRender(...args);
							this._processPrivateChannel(e.instance, children);
							return children;
						}, "Error in Children Render of PrivateChannel!", this);
					}
					else this._processPrivateChannel(e.instance, wrapper);
				}
			}

			_processPrivateChannel (instance, returnvalue) {
				const wrapper = returnvalue.props.avatar ? returnvalue : BDFDB.ReactUtils.findChild(returnvalue, {props: ["avatar"]});
				if (!wrapper) return;
				if (changedChannels[instance.props.channel.id] && changedChannels[instance.props.channel.id].name) {
					wrapper.props.name = BDFDB.ReactUtils.createElement("span", {children: this.getGroupName(instance.props.channel.id)});
				}
				this.changeChannelColor(wrapper.props.name, instance.props.channel.id, {modify: BDFDB.ObjectUtils.extract(Object.assign({}, instance.props, instance.state), "hovered", "selected", "hasUnreadMessages", "muted")});
				wrapper.props.name = [wrapper.props.name];
				if (wrapper.props.avatar) wrapper.props.avatar.props.src = this.getGroupIcon(instance.props.channel.id);
			}
			
			processQuickSwitchChannelResult (e) {
				if (e.instance.props.channel && this.settings.places.quickSwitcher) {
					if (!e.returnvalue) {
						e.instance.props.channel = this.getChannelData(e.instance.props.channel.id);
						if (e.instance.props.category) e.instance.props.category = this.getChannelData(e.instance.props.category.id);
					}
					else {
						let modify = BDFDB.ObjectUtils.extract(e.instance.props, "focused", "unread", "mentions");
						let channelName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.quickswitchresultmatch]]});
						if (channelName) this.changeChannelColor(channelName, e.instance.props.channel.id, modify);
						let channelIcon = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.quickswitchresulticon]]});
						if (channelIcon) this.changeChannelIconColor(channelIcon, e.instance.props.channel.id, modify);
						if (e.instance.props.category) {
							let categoryName = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.quickswitchresultnote]]});
							if (categoryName) this.changeChannelColor(categoryName, e.instance.props.category.id);
						}
					}
				}
			}

			processSearchPopoutComponent (e) {
				if (BDFDB.ArrayUtils.is(BDFDB.ObjectUtils.get(e, "instance.props.resultsState.autocompletes")) && this.settings.places.searchPopout) {
					for (let autocomplete of e.instance.props.resultsState.autocompletes) if (autocomplete && BDFDB.ArrayUtils.is(autocomplete.results)) for (let result of autocomplete.results) if (result.channel) result.channel = this.getChannelData(result.channel.id);
				}
			}
			
			processSearchResultsInner (e) {
				if (this.settings.places.searchResults) {
					let results = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["id", "search-results"]]});
					if (results && BDFDB.ArrayUtils.is(results.props.children)) for (let group of results.props.children) {
						let channelId = (BDFDB.ObjectUtils.get(group, "props.children.key") || "").split("-")[0];
						let channelName = channelId && changedChannels[channelId] && BDFDB.ReactUtils.findChild(group, {props: [["className", BDFDB.disCN.searchresultschannelname]]});
						if (channelName) {
							if (changedChannels[channelId].name) channelName.props.children = "#" + changedChannels[channelId].name;
							this.changeChannelColor(channelName, channelId);
						}
					}
				}
			}
			
			processRecentsChannelHeader (e) {
				if (this.settings.places.recentMentions && BDFDB.ArrayUtils.is(e.returnvalue.props.children)) {
					for (let child of e.returnvalue.props.children) if (child && child.props && child.props.channel && child.type.displayName == "ChannelName") {
						child.props.channel = this.getChannelData(child.props.channel.id);
						let oldType = child.type;
						child.type = (...args) => {
							let instance = oldType(...args);
							let channelName = BDFDB.ReactUtils.findChild(instance, {props: [["className", BDFDB.disCN.recentmentionschannelname]]});
							if (channelName) this.changeChannelColor(channelName, child.props.channel.id);
							return instance;
						};
						child.type.displayName = oldType.displayName;
					}
				}
			}

			processMessageContent (e) {
				if (BDFDB.ArrayUtils.is(e.instance.props.content) && this.settings.places.mentions) for (let ele of e.instance.props.content) {
					if (BDFDB.ReactUtils.isValidElement(ele) && ele.type && ele.type.displayName == "Tooltip" && typeof ele.props.children == "function") {
						let children = ele.props.children({});
						if (children && children.type.displayName == "Mention") {
							const checkChild = label => {
								if (label[0] != "#") return;
								let channelName = label.slice(1);
								let guildId = BDFDB.LibraryModules.LastGuildStore.getGuildId();
								let channels = guildId && [].concat(BDFDB.LibraryModules.GuildChannelStore.getChannels(guildId).SELECTABLE, Object.keys(BDFDB.LibraryModules.ThreadStore.getThreadsForGuild(guildId)).map(id => ({channel: BDFDB.LibraryModules.ChannelStore.getChannel(id)})));
								if (BDFDB.ArrayUtils.is(channels)) for (let channelObj of channels) {
									if (channelName == channelObj.channel.name) {
										let category = BDFDB.LibraryModules.ChannelStore.getChannel(channelObj.channel.parent_id);
										if (!category || category && ele.props.text == category.name) {
											if (category) {
												let categoryData = changedChannels[category.id];
												if (categoryData && categoryData.name) ele.props.text = categoryData.name;
											}
											let name = (changedChannels[channelObj.channel.id] || {}).name;
											let color = this.getChannelDataColor(channelObj.channel.id);
											if (name || color) {
												let renderChildren = ele.props.children;
												ele.props.children = (...args) => {
													let children = renderChildren(...args);
													this.changeMention(children, {name, color});
													return children;
												}
											}
											break;
										}
									}
								}
							};
							if (typeof children.props.children == "string") checkChild(children.props.children);
							else if (BDFDB.ArrayUtils.is(children.props.children)) for (let i in children.props.children) {
								if (typeof children.props.children[i] == "string") checkChild(children.props.children[i]);
								else if (BDFDB.ArrayUtils.is(children.props.children[i])) for (let j in children.props.children[i]) if (typeof children.props.children[i][j] == "string") checkChild(children.props.children[i][j]);
							}
						}
					}
				}
			}
			
			processRichChannelMention (e) {
				if (e.instance.props.id && this.settings.places.mentions) {
					let name = (changedChannels[e.instance.props.id] || {}).name;
					let color = this.getChannelDataColor(e.instance.props.id);
					if (name || color) {
						if (typeof e.returnvalue.props.children == "function") {
							let renderChildren = e.returnvalue.props.children;
							e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
								let children = renderChildren(...args);
								this.changeMention(children, {name, color});
								return children;
							}, "Error in Children Render of RichChannelMention!", this);
						}
						else this.changeMention(e.returnvalue, {name, color});
					}
				}
			}
			
			changeMention (mention, data) {
				if (!mention) return;
				if (data.name) {
					const changeMentionName = (child, name) => {
						if (!child) return;
						if (BDFDB.ArrayUtils.is(child)) for (let i in child) {
							if (typeof child[i] == "string" && child[i][0] == "#") {
								if (child[i] == "#") child[parseInt(i) + 1] = data.name;
								else child[i] = "#" + data.name;
							}
							else changeMentionName(child[i]);
						}
						else if (child.props && typeof child.props.children == "string" && child.props.children[0] == "#") child.props.children = "#" + data.name;
						else if (child.props && BDFDB.ArrayUtils.is(child.props.children)) changeMentionName(child.props.children);
					};
					changeMentionName(mention);
				}
				if (data.color) mention.props.color = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data.color) ? data.color[0] : data.color, "INT");
			}

			changeAppTitle () {
				if (this.settings.places.appTitle) {
					let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
					let title = document.head.querySelector("title");
					if (title && channel && (document.location.href || "").indexOf(channel.id) > -1 && changedChannels[channel.id] && changedChannels[channel.id].name) {
						if (channel.isGroupDM()) BDFDB.DOMUtils.setText(title, this.getGroupName(channel.id));
						else BDFDB.DOMUtils.setText(title, (BDFDB.ChannelUtils.isTextChannel(channel) ? "#" : "") + this.getChannelData(channel.id).name);
					}
				}
			}
			
			changeChannelColor (child, channelId, modify) {
				if (BDFDB.ReactUtils.isValidElement(child)) {
					let color = this.getChannelDataColor(channelId);
					if (color) {
						color = modify ? this.chooseColor(color, modify) : BDFDB.ColorUtils.convert(color, "RGBA");
						let childProp = child.props.children ? "children" : "text";
						let fontGradient = BDFDB.ObjectUtils.is(color);
						if (fontGradient) child.props[childProp] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
							gradient: BDFDB.ColorUtils.createGradient(color),
							children: child.props[childProp]
						});
						else child.props[childProp] = BDFDB.ReactUtils.createElement("span", {
							style: {color: color},
							children: child.props[childProp]
						});
					}
				}
			}
			
			changeChannelIconColor (child, channelId, modify) {
				let color = child && this.getChannelDataColor(channelId);
				if (color && this.settings.general.changeChannelIcon) {
					color = modify ? this.chooseColor(BDFDB.ObjectUtils.is(color) ? color[0] : color, modify) : BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color) ? color[0] : color, "RGBA");
					if (color) {
						child.props.foreground = null;
						child.props.color = color || "currentColor";
						child.props.children = [child.props.children].flat(10).filter(n => n);
						for (let c of child.props.children) {
							if (c && c.props && c.props.fill == "currentColor") c.props.fill = color || "currentColor";
							if (c && c.props && c.props.path == "currentColor") c.props.path = color || "currentColor";
						}
					}
				}
			}

			chooseColor (color, config) {
				if (color) {
					if (BDFDB.ObjectUtils.is(config)) {
						if (config.mentions || config.focused || config.hovered || config.selected || config.unread || config.connected) color = BDFDB.ColorUtils.change(color, 0.5);
						else if (config.muted || config.locked) color = BDFDB.ColorUtils.change(color, -0.5);
					}
					return BDFDB.ColorUtils.convert(color, "RGBA");
				}
				return null;
			}
			
			getChannelDataColor (channelId) {
				if (changedChannels[channelId] && changedChannels[channelId].color) return changedChannels[channelId].color;
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channelId);
				let category = channel && (BDFDB.ChannelUtils.isThread(channel) ? BDFDB.LibraryModules.ChannelStore.getChannel((BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.ChannelStore.getChannel(channel.id).parent_id) || {}).parent_id) : BDFDB.LibraryModules.ChannelStore.getChannel(channel.parent_id));
				if (category && changedChannels[category.id] && changedChannels[category.id].inheritColor && changedChannels[category.id].color) return changedChannels[category.id].color;
				return null;
			}
			
			getChannelData (channelId, change = true, fallbackData) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channelId);
				if (!channel && BDFDB.ObjectUtils.is(fallbackData) || channel && BDFDB.ObjectUtils.is(fallbackData) && channel.name != fallbackData.name) channel = fallbackData;
				if (!channel) return new BDFDB.DiscordObjects.Channel({});
				let data = change && changedChannels[channel.id];
				if (data) {
					let nativeObject = new BDFDB.DiscordObjects.Channel(channel);
					nativeObject.name = data.name || nativeObject.name;
					return nativeObject;
				}
				return new BDFDB.DiscordObjects.Channel(channel);
			}
			
			getGroupName (channelId) {
				let channel = this.getChannelData(channelId);
				if (channel.name) return channel.name;
				let recipients = channel.recipients.map(BDFDB.LibraryModules.UserStore.getUser).filter(n => n);
				return recipients.length > 0 ? recipients.map(u => u.toString()).join(", ") : BDFDB.LanguageUtils.LanguageStrings.UNNAMED;
			}
			
			getGroupIcon (channelId, change = true) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channelId);
				if (!channel) return "";
				let data = change && changedChannels[channel.id];
				if (data) {
					if (data.removeIcon) return "";
					else if (data.url) return data.url;
				}
				return BDFDB.LibraryModules.IconUtils.getChannelIconURL(channel);
			}

			openChannelSettingsModal (channel) {
				let data = changedChannels[channel.id] || {};
				let newData = Object.assign({}, data);
				
				let iconInput;
				
				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: this.labels.modal_header,
					subHeader: channel.name,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_channelname,
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									value: data.name,
									placeholder: channel.name,
									autoFocus: true,
									onChange: value => {newData.name = value;}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
									className: BDFDB.disCN.dividerdefault
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_colorpicker1,
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color,
									onColorChange: value => {newData.color = value;}
								})
							]
						}),
						!channel.isGroupDM() && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Switch",
							margin: 20,
							label: this.labels.modal_inheritcolor,
							tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
							value: channel.isCategory() && data.inheritColor,
							disabled: !channel.isCategory(),
							onChange: value => {newData.inheritColor = value;}
						}),
						channel.isGroupDM() && BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
									className: BDFDB.disCNS.dividerdefault + BDFDB.disCN.marginbottom20
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									className: BDFDB.disCN.marginbottom8,
									align: BDFDB.LibraryComponents.Flex.Align.CENTER,
									direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
											className: BDFDB.disCN.marginreset,
											tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
											children: this.labels.modal_channelicon
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
											type: "Switch",
											margin: 0,
											grow: 0,
											label: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
											tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
											value: data.removeIcon,
											onChange: value => {
												newData.removeIcon = value;
												if (value) {
													delete iconInput.props.success;
													delete iconInput.props.errorMessage;
													iconInput.props.disabled = true;
													BDFDB.ReactUtils.forceUpdate(iconInput);
												}
												else {
													iconInput.props.disabled = false;
													this.checkUrl(iconInput.props.value, iconInput).then(returnValue => {
														newData.url = returnValue;
													});
												}
											}
										})
									]
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									success: !data.removeIcon && data.url,
									maxLength: 100000000000000000000,
									value: data.url,
									placeholder: BDFDB.DMUtils.getIcon(channel.id),
									disabled: data.removeIcon,
									ref: instance => {if (instance) iconInput = instance;},
									onChange: (value, instance) => {
										this.checkUrl(value, instance).then(returnValue => {
											newData.url = returnValue;
										});
									}
								})
							]
						})
					],
					buttons: [{
						contents: BDFDB.LanguageUtils.LanguageStrings.SAVE,
						color: "BRAND",
						close: true,
						onClick: _ => {
							if (newData.color != null && !BDFDB.ObjectUtils.is(newData.color)) {
								if (newData.color[0] < 30 && newData.color[1] < 30 && newData.color[2] < 30) newData.color = BDFDB.ColorUtils.change(newData.color, 30);
								else if (newData.color[0] > 225 && newData.color[1] > 225 && newData.color[2] > 225) newData.color = BDFDB.ColorUtils.change(newData.color, -30);
							}
							
							newData.url = !newData.removeIcon ? newData.url : "";
							
							let changed = false;
							if (Object.keys(newData).every(key => newData[key] == null || newData[key] == false) && (changed = true)) {
								BDFDB.DataUtils.remove(this, "channels", channel.id);
							}
							else if (!BDFDB.equals(newData, data) && (changed = true)) {
								BDFDB.DataUtils.save(newData, this, "channels", channel.id);
							}
							if (changed) this.forceUpdateAll(true);
						}
					}]
				});
			}
			
			checkUrl (url, instance) {
				return new Promise(callback => {
					BDFDB.TimeUtils.clear(instance.checkTimeout);
					url = url && url.trim();
					if (!url || instance.props.disabled) {
						delete instance.props.success;
						delete instance.props.errorMessage;
						callback("");
						BDFDB.ReactUtils.forceUpdate(instance);
					}
					else instance.checkTimeout = BDFDB.TimeUtils.timeout(_ => {
						BDFDB.LibraryRequires.request(url, {agentOptions: {rejectUnauthorized: false}}, (error, response, result) => {
							delete instance.checkTimeout;
							if (instance.props.disabled) {
								delete instance.props.success;
								delete instance.props.errorMessage;
								callback("");
							}
							else if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") != -1) {
								instance.props.success = true;
								delete instance.props.errorMessage;
								callback(url);
							}
							else {
								delete instance.props.success;
								instance.props.errorMessage = this.labels.modal_invalidurl;
								callback("");
							}
							BDFDB.ReactUtils.forceUpdate(instance);
						});
					}, 1000);
				});
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							confirm_reset:						"Наистина ли искате да нулирате този канал?",
							confirm_resetall:					"Наистина ли искате да нулирате всички канали?",
							context_localchannelsettings:		"Настройки на местния канал",
							modal_channelname:					"Име на местния канал",
							modal_channelicon:					"Икона",
							modal_colorpicker1:					"Локален цвят на канала",
							modal_header:						"Настройки на местния канал",
							modal_inheritcolor:					"Наследете цвета на подканали",
							modal_invalidurl:					"Невалиден адрес",
							submenu_channelsettings:			"Промяна на настройките",
							submenu_resetsettings:				"Нулиране на канала"
						};
					case "da":		// Danish
						return {
							confirm_reset:						"Er du sikker på, at du vil nulstille denne kanal?",
							confirm_resetall:					"Er du sikker på, at du vil nulstille alle kanaler?",
							context_localchannelsettings:		"Lokale kanalindstillinger",
							modal_channelname:					"Lokalt kanalnavn",
							modal_channelicon:					"Ikon",
							modal_colorpicker1:					"Lokal kanalfarve",
							modal_header:						"Lokale kanalindstillinger",
							modal_inheritcolor:					"Arv farve til underkanaler",
							modal_invalidurl:					"Ugyldig URL",
							submenu_channelsettings:			"Ændre indstillinger",
							submenu_resetsettings:				"Nulstil kanal"
						};
					case "de":		// German
						return {
							confirm_reset:						"Möchtest du diesen Kanal wirklich zurücksetzen?",
							confirm_resetall:					"Möchtest du wirklich alle Kanäle zurücksetzen?",
							context_localchannelsettings:		"Lokale Kanaleinstellungen",
							modal_channelname:					"Lokaler Kanalname",
							modal_channelicon:					"Symbol",
							modal_colorpicker1:					"Lokale Kanalfarbe",
							modal_header:						"Lokale Kanaleinstellungen",
							modal_inheritcolor:					"Vererbung der Farbe an Unterkanäle",
							modal_invalidurl:					"Ungültige URL",
							submenu_channelsettings:			"Einstellungen ändern",
							submenu_resetsettings:				"Kanal zurücksetzen"
						};
					case "el":		// Greek
						return {
							confirm_reset:						"Είστε βέβαιοι ότι θέλετε να επαναφέρετε αυτό το κανάλι;",
							confirm_resetall:					"Είστε βέβαιοι ότι θέλετε να επαναφέρετε όλα τα κανάλια;",
							context_localchannelsettings:		"Ρυθμίσεις τοπικού καναλιού",
							modal_channelname:					"Τοπικό όνομα καναλιού",
							modal_channelicon:					"Εικόνισμα",
							modal_colorpicker1:					"Τοπικό χρώμα καναλιού",
							modal_header:						"Ρυθμίσεις τοπικού καναλιού",
							modal_inheritcolor:					"Κληρονομήστε το χρώμα στα δευτερεύοντα κανάλια",
							modal_invalidurl:					"Μη έγκυρη διεύθυνση URL",
							submenu_channelsettings:			"Αλλαξε ρυθμίσεις",
							submenu_resetsettings:				"Επαναφορά καναλιού"
						};
					case "es":		// Spanish
						return {
							confirm_reset:						"¿Estás seguro de que deseas restablecer este canal?",
							confirm_resetall:					"¿Está seguro de que desea restablecer todos los canales?",
							context_localchannelsettings:		"Configuración de canal local",
							modal_channelname:					"Nombre del canal local",
							modal_channelicon:					"Icono",
							modal_colorpicker1:					"Color del canal local",
							modal_header:						"Configuración de canal local",
							modal_inheritcolor:					"Heredar color a subcanales",
							modal_invalidurl:					"URL invalida",
							submenu_channelsettings:			"Cambiar ajustes",
							submenu_resetsettings:				"Restablecer canal"
						};
					case "fi":		// Finnish
						return {
							confirm_reset:						"Haluatko varmasti nollata tämän kanavan?",
							confirm_resetall:					"Haluatko varmasti nollata kaikki kanavat?",
							context_localchannelsettings:		"Paikallisen kanavan asetukset",
							modal_channelname:					"Paikallisen kanavan nimi",
							modal_channelicon:					"Kuvake",
							modal_colorpicker1:					"Paikallisen kanavan väri",
							modal_header:						"Paikallisen kanavan asetukset",
							modal_inheritcolor:					"Peri väri alikanaville",
							modal_invalidurl:					"Virheellinen URL",
							submenu_channelsettings:			"Vaihda asetuksia",
							submenu_resetsettings:				"Nollaa kanava"
						};
					case "fr":		// French
						return {
							confirm_reset:						"Voulez-vous vraiment réinitialiser cette salon?",
							confirm_resetall:					"Voulez-vous vraiment réinitialiser toutes les salons?",
							context_localchannelsettings:		"Paramètres  de la salon",
							modal_channelname:					"Nom local de la salon",
							modal_channelicon:					"Icône",
							modal_colorpicker1:					"Couleur locale de la salon",
							modal_header:						"Paramètres locaux de la salon",
							modal_inheritcolor:					"Hériter de la couleur aux sous-canaux",
							modal_invalidurl:					"URL invalide",
							submenu_channelsettings:			"Modifier les paramètres",
							submenu_resetsettings:				"Réinitialiser la salon"
						};
					case "hr":		// Croatian
						return {
							confirm_reset:						"Jeste li sigurni da želite resetirati ovaj kanal?",
							confirm_resetall:					"Jeste li sigurni da želite resetirati sve kanale?",
							context_localchannelsettings:		"Postavke lokalnog kanala",
							modal_channelname:					"Naziv lokalnog kanala",
							modal_channelicon:					"Ikona",
							modal_colorpicker1:					"Lokalna boja kanala",
							modal_header:						"Postavke lokalnog kanala",
							modal_inheritcolor:					"Naslijedi boju na podkanalima",
							modal_invalidurl:					"Neispravna poveznica",
							submenu_channelsettings:			"Promijeniti postavke",
							submenu_resetsettings:				"Resetiraj kanal"
						};
					case "hu":		// Hungarian
						return {
							confirm_reset:						"Biztosan vissza akarja állítani ezt a csatornát?",
							confirm_resetall:					"Biztosan visszaállítja az összes csatornát?",
							context_localchannelsettings:		"Helyi csatorna beállításai",
							modal_channelname:					"Helyi csatorna neve",
							modal_channelicon:					"Ikon",
							modal_colorpicker1:					"Helyi csatorna színe",
							modal_header:						"Helyi csatorna beállításai",
							modal_inheritcolor:					"Örökli a színt az alcsatornákra",
							modal_invalidurl:					"Érvénytelen URL",
							submenu_channelsettings:			"Beállítások megváltoztatása",
							submenu_resetsettings:				"Csatorna visszaállítása"
						};
					case "it":		// Italian
						return {
							confirm_reset:						"Sei sicuro di voler ripristinare questo canale?",
							confirm_resetall:					"Sei sicuro di voler ripristinare tutti i canali?",
							context_localchannelsettings:		"Impostazioni del canale locale",
							modal_channelname:					"Nome canale locale",
							modal_channelicon:					"Icona",
							modal_colorpicker1:					"Colore canale locale",
							modal_header:						"Impostazioni del canale locale",
							modal_inheritcolor:					"Eredita colore ai canali secondari",
							modal_invalidurl:					"URL non valido",
							submenu_channelsettings:			"Cambia impostazioni",
							submenu_resetsettings:				"Reimposta canale"
						};
					case "ja":		// Japanese
						return {
							confirm_reset:						"このチャンネルをリセットしてもよろしいですか？",
							confirm_resetall:					"すべてのチャンネルをリセットしてもよろしいですか？",
							context_localchannelsettings:		"ローカルチャンネル設定",
							modal_channelname:					"ローカルチャネル名",
							modal_channelicon:					"アイコン",
							modal_colorpicker1:					"ローカルチャンネルの色",
							modal_header:						"ローカルチャンネル設定",
							modal_inheritcolor:					"サブチャネルに色を継承する",
							modal_invalidurl:					"無効なURL",
							submenu_channelsettings:			"設定を変更する",
							submenu_resetsettings:				"チャネルをリセット"
						};
					case "ko":		// Korean
						return {
							confirm_reset:						"이 채널을 재설정 하시겠습니까?",
							confirm_resetall:					"모든 채널을 재설정 하시겠습니까?",
							context_localchannelsettings:		"로컬 채널 설정",
							modal_channelname:					"로컬 채널 이름",
							modal_channelicon:					"상",
							modal_colorpicker1:					"로컬 채널 색상",
							modal_header:						"로컬 채널 설정",
							modal_inheritcolor:					"하위 채널에 색상 상속",
							modal_invalidurl:					"잘못된 URL",
							submenu_channelsettings:			"설정 변경",
							submenu_resetsettings:				"채널 재설정"
						};
					case "lt":		// Lithuanian
						return {
							confirm_reset:						"Ar tikrai norite iš naujo nustatyti šį kanalą?",
							confirm_resetall:					"Ar tikrai norite iš naujo nustatyti visus kanalus?",
							context_localchannelsettings:		"Vietinio kanalo nustatymai",
							modal_channelname:					"Vietinio kanalo pavadinimas",
							modal_channelicon:					"Piktograma",
							modal_colorpicker1:					"Vietinio kanalo spalva",
							modal_header:						"Vietinio kanalo nustatymai",
							modal_inheritcolor:					"Paveldėkite spalvas subkanalams",
							modal_invalidurl:					"Neteisingas URL",
							submenu_channelsettings:			"Pakeisti nustatymus",
							submenu_resetsettings:				"Iš naujo nustatyti kanalą"
						};
					case "nl":		// Dutch
						return {
							confirm_reset:						"Weet u zeker dat u dit kanaal opnieuw wilt instellen?",
							confirm_resetall:					"Weet u zeker dat u alle kanalen opnieuw wilt instellen?",
							context_localchannelsettings:		"Lokale kanaalinstellingen",
							modal_channelname:					"Lokale kanaalnaam",
							modal_channelicon:					"Icoon",
							modal_colorpicker1:					"Lokale kanaalkleur",
							modal_header:						"Lokale kanaalinstellingen",
							modal_inheritcolor:					"Overerf kleur naar subkanalen",
							modal_invalidurl:					"Ongeldige URL",
							submenu_channelsettings:			"Instellingen veranderen",
							submenu_resetsettings:				"Kanaal resetten"
						};
					case "no":		// Norwegian
						return {
							confirm_reset:						"Er du sikker på at du vil tilbakestille denne kanalen?",
							confirm_resetall:					"Er du sikker på at du vil tilbakestille alle kanaler?",
							context_localchannelsettings:		"Lokale kanalinnstillinger",
							modal_channelname:					"Lokalt kanalnavn",
							modal_channelicon:					"Ikon",
							modal_colorpicker1:					"Lokal kanalfarge",
							modal_header:						"Lokale kanalinnstillinger",
							modal_inheritcolor:					"Arv farge til underkanaler",
							modal_invalidurl:					"Ugyldig URL",
							submenu_channelsettings:			"Endre innstillinger",
							submenu_resetsettings:				"Tilbakestill kanal"
						};
					case "pl":		// Polish
						return {
							confirm_reset:						"Czy na pewno chcesz zresetować ten kanał?",
							confirm_resetall:					"Czy na pewno chcesz zresetować wszystkie kanały?",
							context_localchannelsettings:		"Ustawienia kanału lokalnego",
							modal_channelname:					"Nazwa kanału lokalnego",
							modal_channelicon:					"Ikona",
							modal_colorpicker1:					"Kolor kanału lokalnego",
							modal_header:						"Ustawienia kanału lokalnego",
							modal_inheritcolor:					"Dziedzicz kolor do kanałów podrzędnych",
							modal_invalidurl:					"Nieprawidłowy URL",
							submenu_channelsettings:			"Zmień ustawienia",
							submenu_resetsettings:				"Resetuj kanał"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							confirm_reset:						"Tem certeza que deseja redefinir este canal?",
							confirm_resetall:					"Tem certeza de que deseja redefinir todos os canais?",
							context_localchannelsettings:		"Configurações de canal local",
							modal_channelname:					"Nome do canal local",
							modal_channelicon:					"Ícone",
							modal_colorpicker1:					"Cor do Canal Local",
							modal_header:						"Configurações de canal local",
							modal_inheritcolor:					"Herdar cor para subcanais",
							modal_invalidurl:					"URL inválida",
							submenu_channelsettings:			"Mudar configurações",
							submenu_resetsettings:				"Reiniciar canal"
						};
					case "ro":		// Romanian
						return {
							confirm_reset:						"Sigur doriți să resetați acest canal?",
							confirm_resetall:					"Sigur doriți să resetați toate canalele?",
							context_localchannelsettings:		"Setări canale locale",
							modal_channelname:					"Numele canalului local",
							modal_channelicon:					"Pictogramă",
							modal_colorpicker1:					"Culoare canal local",
							modal_header:						"Setări canale locale",
							modal_inheritcolor:					"Moșteniți culoarea la sub-canale",
							modal_invalidurl:					"URL invalid",
							submenu_channelsettings:			"Schimbă setările",
							submenu_resetsettings:				"Resetați canalul"
						};
					case "ru":		// Russian
						return {
							confirm_reset:						"Вы уверены, что хотите сбросить этот канал?",
							confirm_resetall:					"Вы уверены, что хотите сбросить все каналы?",
							context_localchannelsettings:		"Настройки локального канала",
							modal_channelname:					"Имя локального канала",
							modal_channelicon:					"Икона",
							modal_colorpicker1:					"Цвет локального канала",
							modal_header:						"Настройки локального канала",
							modal_inheritcolor:					"Наследовать цвет для субканалов",
							modal_invalidurl:					"Неверная ссылка",
							submenu_channelsettings:			"Изменить настройки",
							submenu_resetsettings:				"Сбросить канал"
						};
					case "sv":		// Swedish
						return {
							confirm_reset:						"Är du säker på att du vill återställa den här kanalen?",
							confirm_resetall:					"Är du säker på att du vill återställa alla kanaler?",
							context_localchannelsettings:		"Lokala kanalinställningar",
							modal_channelname:					"Lokalt kanalnamn",
							modal_channelicon:					"Ikon",
							modal_colorpicker1:					"Lokal kanalfärg",
							modal_header:						"Lokala kanalinställningar",
							modal_inheritcolor:					"Ärva färg till underkanaler",
							modal_invalidurl:					"Ogiltig URL",
							submenu_channelsettings:			"Ändra inställningar",
							submenu_resetsettings:				"Återställ kanal"
						};
					case "th":		// Thai
						return {
							confirm_reset:						"แน่ใจไหมว่าต้องการรีเซ็ตช่องนี้",
							confirm_resetall:					"แน่ใจไหมว่าต้องการรีเซ็ตช่องทั้งหมด",
							context_localchannelsettings:		"การตั้งค่าช่องท้องถิ่น",
							modal_channelname:					"ชื่อช่องท้องถิ่น",
							modal_channelicon:					"ไอคอน",
							modal_colorpicker1:					"ช่องท้องถิ่นสี",
							modal_header:						"การตั้งค่าช่องท้องถิ่น",
							modal_inheritcolor:					"สืบทอดสีไปยังช่องย่อย",
							modal_invalidurl:					"URL ไม่ถูกต้อง",
							submenu_channelsettings:			"เปลี่ยนการตั้งค่า",
							submenu_resetsettings:				"รีเซ็ตช่อง"
						};
					case "tr":		// Turkish
						return {
							confirm_reset:						"Bu kanalı sıfırlamak istediğinizden emin misiniz?",
							confirm_resetall:					"Tüm kanalları sıfırlamak istediğinizden emin misiniz?",
							context_localchannelsettings:		"Yerel Kanal Ayarları",
							modal_channelname:					"Yerel Kanal Adı",
							modal_channelicon:					"Simge",
							modal_colorpicker1:					"Yerel Kanal Rengi",
							modal_header:						"Yerel Kanal Ayarları",
							modal_inheritcolor:					"Renkleri Alt Kanallara Devral",
							modal_invalidurl:					"Geçersiz URL",
							submenu_channelsettings:			"Ayarları değiştir",
							submenu_resetsettings:				"Kanalı Sıfırla"
						};
					case "uk":		// Ukrainian
						return {
							confirm_reset:						"Справді скинути цей канал?",
							confirm_resetall:					"Ви впевнені, що хочете скинути всі канали?",
							context_localchannelsettings:		"Налаштування локального каналу",
							modal_channelname:					"Назва місцевого каналу",
							modal_channelicon:					"Піктограма",
							modal_colorpicker1:					"Колір локального каналу",
							modal_header:						"Налаштування локального каналу",
							modal_inheritcolor:					"Успадковувати колір для підканалів",
							modal_invalidurl:					"Недійсна URL-адреса",
							submenu_channelsettings:			"Змінити налаштування",
							submenu_resetsettings:				"Скинути канал"
						};
					case "vi":		// Vietnamese
						return {
							confirm_reset:						"Bạn có chắc chắn muốn đặt lại kênh này không?",
							confirm_resetall:					"Bạn có chắc chắn muốn đặt lại tất cả các kênh không?",
							context_localchannelsettings:		"Cài đặt kênh cục bộ",
							modal_channelname:					"Tên kênh địa phương",
							modal_channelicon:					"Biểu tượng",
							modal_colorpicker1:					"Màu kênh địa phương",
							modal_header:						"Cài đặt kênh cục bộ",
							modal_inheritcolor:					"Kế thừa màu cho các kênh phụ",
							modal_invalidurl:					"URL không hợp lệ",
							submenu_channelsettings:			"Thay đổi cài đặt",
							submenu_resetsettings:				"Đặt lại kênh"
						};
					case "zh-CN":	// Chinese (China)
						return {
							confirm_reset:						"您确定要重置此频道吗？",
							confirm_resetall:					"您确定要重置所有频道吗？",
							context_localchannelsettings:		"本地频道设置",
							modal_channelname:					"本地频道名称",
							modal_channelicon:					"图标",
							modal_colorpicker1:					"本地频道颜色",
							modal_header:						"本地频道设置",
							modal_inheritcolor:					"继承颜色到子通道",
							modal_invalidurl:					"无效的网址",
							submenu_channelsettings:			"更改设置",
							submenu_resetsettings:				"重置频道"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							confirm_reset:						"您確定要重置此頻道嗎？",
							confirm_resetall:					"您確定要重置所有頻道嗎？",
							context_localchannelsettings:		"本地頻道設置",
							modal_channelname:					"本地頻道名稱",
							modal_channelicon:					"圖標",
							modal_colorpicker1:					"本地頻道顏色",
							modal_header:						"本地頻道設置",
							modal_inheritcolor:					"繼承顏色到子通道",
							modal_invalidurl:					"無效的網址",
							submenu_channelsettings:			"更改設置",
							submenu_resetsettings:				"重置頻道"
						};
					default:		// English
						return {
							confirm_reset:						"Are you sure you want to reset this Channel?",
							confirm_resetall:					"Are you sure you want to reset all Channels?",
							context_localchannelsettings:		"Local Channel Settings",
							modal_channelname:					"Local Channel Name",
							modal_channelicon:					"Icon",
							modal_colorpicker1:					"Local Channel Color",
							modal_header:						"Local Channel Settings",
							modal_inheritcolor:					"Inherit Color to Sub-Channels",
							modal_invalidurl:					"Invalid URL",
							submenu_channelsettings:			"Change Settings",
							submenu_resetsettings:				"Reset Channel"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
