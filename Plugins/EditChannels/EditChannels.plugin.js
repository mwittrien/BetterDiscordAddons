//META{"name":"EditChannels","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditChannels","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EditChannels/EditChannels.plugin.js"}*//

var EditChannels = (_ => {
	var changedChannels = {}, settings = {};
	
	return class EditChannels {
		getName () {return "EditChannels";}

		getVersion () {return "4.1.6";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Allows you to rename and recolor channelnames.";}

		constructor () {
			this.patchedModules = {
				before: {
					ChannelEditorContainer: "render",
					ChannelAutoComplete: "render",
					AutocompleteChannelResult: "render",
					AuditLog: "render",
					SettingsInvites: "render",
					HeaderBarContainer: "render",
					ChannelCategoryItem: "render",
					ChannelItem: "render",
					QuickSwitchChannelResult: "render",
					MessageContent: "type"
				},
				after: {
					AutocompleteChannelResult: "render",
					AuditLog: "render",
					HeaderBarContainer: "render",
					ChannelCategoryItem: "render",
					ChannelItem: "render",
					QuickSwitchChannelResult: "render",
					RecentsChannelHeader: "default"
				}
			};
		}

		initConstructor () {
			this.css = `
				${BDFDB.dotCN.messagespopoutchannelname}:hover > span[style*="color"],
				${BDFDB.dotCN.recentmentionschannelname}:hover > span[style*="color"] {
					text-decoration: underline;
				}
			`;

			this.defaults = {
				settings: {
					changeChannelIcon:		{value:true, 	inner:false,	description:"Change color of Channel Icon"},
					changeInChatTextarea:	{value:true, 	inner:true,		description:"Chat Textarea"},
					changeInMentions:		{value:true, 	inner:true,		description:"Mentions"},
					changeInChannelList:	{value:true, 	inner:true,		description:"Channel List"},
					changeInChannelHeader:	{value:true, 	inner:true,		description:"Channel Header"},
					changeInRecentMentions:	{value:true, 	inner:true,		description:"Recent Mentions Popout"},
					changeInAutoComplete:	{value:true, 	inner:true,		description:"Autocomplete Menu"},
					changeInAuditLog:		{value:true, 	inner:true,		description:"Audit Log"},
					changeInInviteLog:		{value:true, 	inner:true,		description:"Invite Log"},
					changeInQuickSwitcher:	{value:true, 	inner:true,		description:"Quick Switcher"}
				}
			};
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let settingsPanel, settingsItems = [], innerItems = [];
			
			for (let key in settings) (!this.defaults.settings[key].inner ? settingsItems : innerItems).push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
				title: "Change Channels in:",
				first: settingsItems.length == 0,
				children: innerItems
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
				type: "Button",
				className: BDFDB.disCN.marginbottom8,
				color: BDFDB.LibraryComponents.Button.Colors.RED,
				label: "Reset all Channels",
				onClick: _ => {
					BDFDB.ModalUtils.confirm(this, "Are you sure you want to reset all channels?", _ => {
						BDFDB.DataUtils.remove(this, "channels");
						this.forceUpdateAll();
					});
				},
				children: BDFDB.LanguageUtils.LanguageStrings.RESET
			}));
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
		}

		// Legacy
		load () {}

		start () {
			if (!window.BDFDB) window.BDFDB = {myPlugins:{}};
			if (window.BDFDB && window.BDFDB.myPlugins && typeof window.BDFDB.myPlugins == "object") window.BDFDB.myPlugins[this.getName()] = this;
			let libraryScript = document.querySelector("head script#BDFDBLibraryScript");
			if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("id", "BDFDBLibraryScript");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
				libraryScript.setAttribute("date", performance.now());
				libraryScript.addEventListener("load", _ => {this.initialize();});
				document.head.appendChild(libraryScript);
			}
			else if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
			this.startTimeout = setTimeout(_ => {
				try {return this.initialize();}
				catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
			}, 30000);
		}

		initialize () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				if (this.started) return;
				BDFDB.PluginUtils.init(this);

				let observer = new MutationObserver(_ => {this.changeAppTitle();});
				BDFDB.ObserverUtils.connect(this, document.head.querySelector("title"), {name:"appTitleObserver",instance:observer}, {childList:true});
				
				this.forceUpdateAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				this.forceUpdateAll();

				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		onChannelContextMenu (e) {
			if (e.instance.props.channel) {
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
				children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.context_localchannelsettings_text,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-submenu"),
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
							children: [
								BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
									label: this.labels.submenu_channelsettings_text,
									id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-change"),
									action: _ => {
										BDFDB.ContextMenuUtils.close(e.instance);
										this.openChannelSettingsModal(e.instance.props.channel);
									}
								}),
								BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
									label: this.labels.submenu_resetsettings_text,
									id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-reset"),
									disabled: !changedChannels[e.instance.props.channel.id],
									action: _ => {
										BDFDB.ContextMenuUtils.close(e.instance);
										BDFDB.DataUtils.remove(this, "channels", e.instance.props.channel.id);
										this.forceUpdateAll();
									}
								})
							]
						})
					})
				}));
			}
		}

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
		}
		
		processChannelEditorContainer (e) {
			if (!e.instance.props.disabled && e.instance.props.channel && BDFDB.ChannelUtils.isTextChannel(e.instance.props.channel) && e.instance.props.type == BDFDB.DiscordConstants.TextareaTypes.NORMAL && settings.changeInChatTextarea) {
				let data = changedChannels[e.instance.props.channel.id];
				e.instance.props.placeholder = BDFDB.LanguageUtils.LanguageStringsFormat("TEXTAREA_PLACEHOLDER", `#${data && data.name || e.instance.props.channel.name}`);
			}
		}

		processChannelAutoComplete (e) {
			if (e.instance.state.autocompleteType == "CHANNELS" && BDFDB.ArrayUtils.is(e.instance.state.autocompletes.channels) && e.instance.props.channel && e.instance.props.channel.guild_id) {
				let lastWord = (e.instance.props.textValue || "").slice(1).toLowerCase();
				if (!lastWord) return;
				let channelArray = [];
				for (let id in changedChannels) if (changedChannels[id] && changedChannels[id].name) {
					let channel = BDFDB.LibraryModules.ChannelStore.getChannel(id);
					let category = channel && channel.parent_id && BDFDB.LibraryModules.ChannelStore.getChannel(channel.parent_id);
					let catdata = category && changedChannels[category.id] || {};
					if (BDFDB.ChannelUtils.isTextChannel(channel) && channel.guild_id == e.instance.props.channel.guild_id) channelArray.push(Object.assign({
						lowerCaseName: changedChannels[id].name.toLowerCase(),
						lowerCaseCatName: catdata && catdata.name && catdata.name.toLowerCase(),
						channel,
						category,
						catdata
					}, changedChannels[id]));
				}
				channelArray = BDFDB.ArrayUtils.keySort(channelArray.filter(n => e.instance.state.autocompletes.channels.every(channel => channel.id != n.channel.id) && (n.lowerCaseName.indexOf(lastWord) != -1 || (n.lowerCaseCatName && n.lowerCaseCatName.indexOf(lastWord) != -1))), "lowerCaseName");
				e.instance.state.autocompletes.channels = [].concat(e.instance.state.autocompletes.channels, channelArray.map(n => n.channel)).slice(0, BDFDB.DiscordConstants.MAX_AUTOCOMPLETE_RESULTS);
			}
		}

		processAutocompleteChannelResult (e) {
			if (e.instance.props.channel && settings.changeInAutoComplete) {
				if (!e.returnvalue) {
					e.instance.props.channel = this.getChannelData(e.instance.props.channel.id);
					if (e.instance.props.category) e.instance.props.category = this.getChannelData(e.instance.props.category.id);
				}
				else {
					let channelName = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.marginleft4]]});
					if (channelName) this.changeChannelColor(channelName, e.instance.props.channel.id);
					let channelIcon = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.autocompleteicon]]});
					if (channelIcon) this.changeChannelIconColor(channelIcon, e.instance.props.channel.id, {alpha: 0.6});
					if (e.instance.props.category) {
						let categoryName = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.autocompletedescription]]});
						if (categoryName) this.changeChannelColor(categoryName, e.instance.props.category.id);
					}
				}
			}
		}

		processAuditLog (e) {
			let channel = BDFDB.ReactUtils.getValue(e.instance, "props.log.options.channel");
			if (channel && settings.changeInAuditLog) {
				if (!e.returnvalue) e.instance.props.log.options.channel = this.getChannelData(channel.id);
				else {
					let channelName = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["children", [["#" + channel.name]]]]});
					if (channelName) this.changeChannelColor(channelName, channel.id);
				}
			}
		}

		processSettingsInvites (e) {
			if (BDFDB.ObjectUtils.is(e.instance.props.invites) && settings.changeInInviteLog) {
				e.instance.props.invites = Object.assign({}, e.instance.props.invites);
				for (let id in e.instance.props.invites) e.instance.props.invites[id] = new BDFDB.DiscordObjects.Invite(Object.assign({}, e.instance.props.invites[id], {channel: this.getChannelData(e.instance.props.invites[id].channel.id)}));
			}
		}

		processHeaderBarContainer (e) {
			let channel = BDFDB.LibraryModules.ChannelStore.getChannel(e.instance.props.channelId);
			if (channel && BDFDB.ChannelUtils.isTextChannel(channel) && settings.changeInChannelHeader) {
				if (!e.returnvalue) {
					let channelName = BDFDB.ReactUtils.findChild(e.instance, {name: "Title"});
					if (channelName) {
						channelName.props.children = this.getChannelData(channel.id).name;
						this.changeChannelColor(channelName, channel.id);
					}
				}
				else {
					let [children, index] = BDFDB.ReactUtils.findParent(e.instance, {name: "Icon"});
					if (index > -1) {
						let icon = BDFDB.ReactUtils.createElement(children[index].props.icon, {
							className: BDFDB.disCN.channelheadericon
						});
						this.changeChannelIconColor(icon, channel.id, {alpha: 0.6});
						children[index] = BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.channelheadericonwrapper,
							children: icon
						})
					}
				}
			}
		}

		processChannelCategoryItem (e) {
			if (e.instance.props.channel && settings.changeInChannelList) {
				if (!e.returnvalue) e.instance.props.channel = this.getChannelData(e.instance.props.channel.id);
				else {
					let onMouseEnter = e.returnvalue.props.onMouseEnter || ( _ => {});
					e.returnvalue.props.onMouseEnter = event => {e.instance.setState({hovered: true});};
					let onMouseLeave = e.returnvalue.props.onMouseLeave || ( _ => {});
					e.returnvalue.props.onMouseLeave = event => {e.instance.setState({hovered: false});};
					let modify = BDFDB.ObjectUtils.extract(Object.assign({}, e.instance.props, e.instance.state), "muted", "locked", "selected", "unread", "connected", "hovered");
					let categoryName = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.categoryname]]});
					if (categoryName) this.changeChannelColor(categoryName, e.instance.props.channel.id, modify);
					let categoryIcon = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.categoryicon]]});
					if (categoryIcon) this.changeChannelIconColor(categoryIcon, e.instance.props.channel.id, Object.assign({alpha: 0.6}, modify));
				}
			}
		}

		processChannelItem (e) {
			if (e.instance.props.channel && settings.changeInChannelList) {
				if (!e.returnvalue) e.instance.props.channel = this.getChannelData(e.instance.props.channel.id);
				else {
					let onMouseEnter = e.returnvalue.props.onMouseEnter || ( _ => {});
					e.returnvalue.props.onMouseEnter = event => {e.instance.setState({hovered: true});};
					let onMouseLeave = e.returnvalue.props.onMouseLeave || ( _ => {});
					e.returnvalue.props.onMouseLeave = event => {e.instance.setState({hovered: false});};
					let modify = BDFDB.ObjectUtils.extract(Object.assign({}, e.instance.props, e.instance.state), "muted", "locked", "selected", "unread", "connected", "hovered");
					let channelName = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.channelname]]});
					if (channelName) this.changeChannelColor(channelName, e.instance.props.channel.id, modify);
					let channelIcon = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.channelicon]]});
					if (channelIcon) this.changeChannelIconColor(channelIcon, e.instance.props.channel.id, Object.assign({alpha: 0.6}, modify));
				}
			}
		}
		
		processQuickSwitchChannelResult (e) {
			if (e.instance.props.channel && settings.changeInQuickSwitcher) {
				if (!e.returnvalue) {
					e.instance.props.channel = this.getChannelData(e.instance.props.channel.id);
					if (e.instance.props.category) e.instance.props.category = this.getChannelData(e.instance.props.category.id);
				}
				else {
					let modify = BDFDB.ObjectUtils.extract(e.instance.props, "focused", "unread", "mentions");
					let channelName = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.quickswitchresultmatch]]});
					if (channelName) this.changeChannelColor(channelName, e.instance.props.channel.id, modify);
					let channelIcon = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.quickswitchresulticon]]});
					if (channelIcon) this.changeChannelIconColor(channelIcon, e.instance.props.channel.id, Object.assign({alpha: 0.6}, modify));
					if (e.instance.props.category) {
						let categoryName = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.quickswitchresultnote]]});
						if (categoryName) this.changeChannelColor(categoryName, e.instance.props.category.id);
					}
				}
			}
		}
		
		processRecentsChannelHeader (e) {
			if (settings.changeInRecentMentions && BDFDB.ArrayUtils.is(e.returnvalue.props.children)) {
				for (let child of e.returnvalue.props.children) if (child && child.props && child.props.channel && child.type.displayName == "ChannelName") {
					child.props.channel = this.getChannelData(child.props.channel.id);
					let oldType = child.type;
					child.type = (...args) => {
						let instance = oldType(...args);
						let channelName = BDFDB.ReactUtils.findChild(instance, {props:[["className", BDFDB.disCN.recentmentionschannelname]]});
						if (channelName) this.changeChannelColor(channelName, child.props.channel.id);
						return instance;
					};
					child.type.displayName = oldType.displayName;
				}
			}
		}

		processMessageContent (e) {
			if (BDFDB.ArrayUtils.is(e.instance.props.content) && settings.changeInMentions) for (let ele of e.instance.props.content) {
				if (BDFDB.ReactUtils.isValidElement(ele) && ele.type && ele.type.displayName == "Tooltip" && typeof ele.props.children == "function") {
					let children = ele.props.children({});
					if (children && children.type.displayName == "Mention" && children.props.children && typeof children.props.children[0] == "string" && children.props.children[0][0] == "#") {
						let channelName = children.props.children[0].slice(1);
						let guildId = BDFDB.LibraryModules.LastGuildStore.getGuildId();
						let channels = guildId && (BDFDB.LibraryModules.GuildChannelStore.getChannels(guildId)[0] || BDFDB.LibraryModules.GuildChannelStore.getChannels(guildId).SELECTABLE);
						if (Array.isArray(channels)) for (let channelObj of channels) {
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
											let renderedChildren = renderChildren(...args);
											if (name) renderedChildren.props.children[0] = "#" + name;
											if (color) {
												let color1_0 = BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color) ? color[0] : color, "RGBA");
												let color0_1 = BDFDB.ColorUtils.setAlpha(color1_0, 0.1, "RGBA");
												let color0_7 = BDFDB.ColorUtils.setAlpha(color1_0, 0.7, "RGBA");
												renderedChildren.props.style = Object.assign({}, renderedChildren.props.style, {
													background: color0_1,
													color: color1_0
												});
												let onMouseEnter = renderedChildren.props.onMouseEnter || ( _ => {});
												renderedChildren.props.onMouseEnter = event => {
													onMouseEnter(event);
													event.target.style.setProperty("background", color0_7, "important");
													event.target.style.setProperty("color", "#FFFFFF", "important");
												};
												let onMouseLeave = renderedChildren.props.onMouseLeave || ( _ => {});
												renderedChildren.props.onMouseLeave = event => {
													onMouseLeave(event);
													event.target.style.setProperty("background", color0_1, "important");
													event.target.style.setProperty("color", color1_0, "important");
												};
											}
											return renderedChildren;
										}
									}
									break;
								}
							}
						}
					}
				}
			}
		}

		changeAppTitle () {
			let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
			let title = document.head.querySelector("title");
			if (title && BDFDB.ChannelUtils.isTextChannel(channel)) BDFDB.DOMUtils.setText(title, "@" + this.getChannelData(channel.id, settings.changeAppTitle).name);
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
			let color = this.getChannelDataColor(channelId);
			if (color && settings.changeChannelIcon) {
				color = modify ? this.chooseColor(BDFDB.ObjectUtils.is(color) ? color[0] : color, modify) : BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(color) ? color[0] : color, "RGBA");
				child.props.color = color || "currentColor";
				if (color) child.props.foreground = null;
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
			let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channelId);
			if (!channel) return null;
			let channelData = changedChannels[channel.id];
			if (channelData && channelData.color) return channelData.color;
			let category = channel.parent_id && BDFDB.LibraryModules.ChannelStore.getChannel(channel.parent_id);
			if (category) {
				let categoryData = changedChannels[category.id];
				if (categoryData && categoryData.inheritColor && categoryData.color) return categoryData.color;
			}
			return null;
		}
		
		getChannelData (channelId, change = true) {
			let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channelId);
			if (!channel) return new BDFDB.DiscordObjects.Channel({});
			let data = change && changedChannels[channel.id];
			if (data) {
				let nativeObject = new BDFDB.DiscordObjects.Channel(channel);
				nativeObject.name = data.name || nativeObject.name;
				return nativeObject;
			}
			return new BDFDB.DiscordObjects.Channel(channel);
		}
		
		forceUpdateAll () {
			changedChannels = BDFDB.DataUtils.load(this, "channels");
			settings = BDFDB.DataUtils.get(this, "settings");
			
			this.changeAppTitle();
			BDFDB.ModuleUtils.forceAllUpdates(this);
			BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.app), {name:"Channel", unlimited:true}));
		}

		openChannelSettingsModal (channel) {
			let data = changedChannels[channel.id] || {};
			
			BDFDB.ModalUtils.open(this, {
				size: "MEDIUM",
				header: this.labels.modal_header_text,
				subheader: channel.name,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: this.labels.modal_channelname_text,
						className: BDFDB.disCN.marginbottom20 + " input-channelname",
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
								value: data.name,
								placeholder: channel.name,
								autoFocus: true
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
								className: BDFDB.disCN.dividerdefault
							})
						]
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: this.labels.modal_colorpicker1_text,
						className: BDFDB.disCN.marginbottom20,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
								color: data.color,
								number: 1
							})
						]
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						type: "Switch",
						className: BDFDB.disCN.marginbottom20 + " input-inheritcolor",
						label: this.labels.modal_inheritcolor_text,
						tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
						value: channel.type == 4 && data.inheritColor,
						disabled: channel.type != 4
					})
				],
				buttons: [{
					contents: BDFDB.LanguageUtils.LanguageStrings.SAVE,
					color: "BRAND",
					close: true,
					click: modal => {
						let olddata = Object.assign({}, data);
						
						data.name = modal.querySelector(".input-channelname " + BDFDB.dotCN.input).value.trim() || null;

						data.color = BDFDB.ColorUtils.getSwatchColor(modal, 1);
						if (data.color != null && !BDFDB.ObjectUtils.is(data.color)) {
							if (data.color[0] < 30 && data.color[1] < 30 && data.color[2] < 30) data.color = BDFDB.ColorUtils.change(data.color, 30);
							else if (data.color[0] > 225 && data.color[1] > 225 && data.color[2] > 225) data.color = BDFDB.ColorUtils.change(data.color, -30);
						}

						data.inheritColor = modal.querySelector(".input-inheritcolor " + BDFDB.dotCN.switchinner).checked;
						
						let changed = false;
						if (Object.keys(data).every(key => data[key] == null || data[key] == false) && (changed = true)) BDFDB.DataUtils.remove(this, "channels", channel.id);
						else if (!BDFDB.equals(olddata, data) && (changed = true)) BDFDB.DataUtils.save(data, this, "channels", channel.id);
						if (changed) this.forceUpdateAll();
					}
				}]
			});
		}

		setLabelsByLanguage () {
			switch (BDFDB.LanguageUtils.getLanguage().id) {
				case "hr":		//croatian
					return {
						context_localchannelsettings_text:		"Postavke lokalnih kanala",
						submenu_channelsettings_text:			"Promijeni postavke",
						submenu_resetsettings_text:				"Vraćanje kanala",
						modal_header_text:						"Postavke lokalnih kanala",
						modal_channelname_text:					"Naziv lokalnog kanala",
						modal_colorpicker1_text:				"Boja lokalnog kanala",
						modal_inheritcolor_text:				"Naslijedi boju u potkanale"
					};
				case "da":		//danish
					return {
						context_localchannelsettings_text:		"Lokal kanalindstillinger",
						submenu_channelsettings_text:			"Skift indstillinger",
						submenu_resetsettings_text:				"Nulstil kanal",
						modal_header_text:						"Lokal kanalindstillinger",
						modal_channelname_text:					"Lokalt kanalnavn",
						modal_colorpicker1_text:				"Lokal kanalfarve",
						modal_inheritcolor_text:				"Arve farve til subkanaler"
					};
				case "de":		//german
					return {
						context_localchannelsettings_text:		"Lokale Kanaleinstellungen",
						submenu_channelsettings_text:			"Einstellungen ändern",
						submenu_resetsettings_text:				"Kanal zurücksetzen",
						modal_header_text:						"Lokale Kanaleinstellungen",
						modal_channelname_text:					"Lokaler Kanalname",
						modal_colorpicker1_text:				"Lokale Kanalfarbe",
						modal_inheritcolor_text:				"Farbe an Unterkanäle vererben"
					};
				case "es":		//spanish
					return {
						context_localchannelsettings_text:		"Ajustes local de canal",
						submenu_channelsettings_text:			"Cambiar ajustes",
						submenu_resetsettings_text:				"Restablecer canal",
						modal_header_text:						"Ajustes local de canal",
						modal_channelname_text:					"Nombre local del canal",
						modal_colorpicker1_text:				"Color local del canal",
						modal_inheritcolor_text:				"Heredar color a sub-canales"
					};
				case "fr":		//french
					return {
						context_localchannelsettings_text:		"Paramètres locale du salon",
						submenu_channelsettings_text:			"Modifier les paramètres",
						submenu_resetsettings_text:				"Réinitialiser le salon",
						modal_header_text:						"Paramètres locale du salon",
						modal_channelname_text:					"Nom local du salon",
						modal_colorpicker1_text:				"Couleur locale du salon",
						modal_inheritcolor_text:				"Hériter de la couleur sur les sous-salons"
					};
				case "it":		//italian
					return {
						context_localchannelsettings_text:		"Impostazioni locale canale",
						submenu_channelsettings_text:			"Cambia impostazioni",
						submenu_resetsettings_text:				"Ripristina canale",
						modal_header_text:						"Impostazioni locale canale",
						modal_channelname_text:					"Nome locale canale",
						modal_colorpicker1_text:				"Colore locale canale",
						modal_inheritcolor_text:				"Eredita colore per sub-canali"
					};
				case "nl":		//dutch
					return {
						context_localchannelsettings_text:		"Lokale kanaalinstellingen",
						submenu_channelsettings_text:			"Verandere instellingen",
						submenu_resetsettings_text:				"Reset kanaal",
						modal_header_text:						"Lokale kanaalinstellingen",
						modal_channelname_text:					"Lokale kanaalnaam",
						modal_colorpicker1_text:				"Lokale kanaalkleur",
						modal_inheritcolor_text:				"Overerving van kleuren naar subkanalen"
					};
				case "no":		//norwegian
					return {
						context_localchannelsettings_text:		"Lokal kanalinnstillinger",
						submenu_channelsettings_text:			"Endre innstillinger",
						submenu_resetsettings_text:				"Tilbakestill kanal",
						modal_header_text:						"Lokal kanalinnstillinger",
						modal_channelname_text:					"Lokalt kanalnavn",
						modal_colorpicker1_text:				"Lokal kanalfarge",
						modal_inheritcolor_text:				"Arve farge til underkanaler"
					};
				case "pl":		//polish
					return {
						context_localchannelsettings_text:		"Lokalne ustawienia kanału",
						submenu_channelsettings_text:			"Zmień ustawienia",
						submenu_resetsettings_text:				"Resetuj ustawienia",
						modal_header_text:						"Lokalne ustawienia kanału",
						modal_channelname_text:					"Lokalna nazwa kanału",
						modal_colorpicker1_text:				"Lokalny kolor kanału",
						modal_inheritcolor_text:				"Dziedzicz kolor do podkanałów"
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						context_localchannelsettings_text:		"Configurações local do canal",
						submenu_channelsettings_text:			"Mudar configurações",
						submenu_resetsettings_text:				"Redefinir canal",
						modal_header_text:						"Configurações local do canal",
						modal_channelname_text:					"Nome local do canal",
						modal_colorpicker1_text:				"Cor local do canal",
						modal_inheritcolor_text:				"Herdar cor aos sub-canais"
					};
				case "fi":		//finnish
					return {
						context_localchannelsettings_text:		"Paikallinen kanavan asetukset",
						submenu_channelsettings_text:			"Vaihda asetuksia",
						submenu_resetsettings_text:				"Nollaa kanava",
						modal_header_text:						"Paikallinen kanavan asetukset",
						modal_channelname_text:					"Paikallinen kanavanimi",
						modal_colorpicker1_text:				"Paikallinen kanavanväri",
						modal_inheritcolor_text:				"Hävitä väri alikanaville"
					};
				case "sv":		//swedish
					return {
						context_localchannelsettings_text:		"Lokal kanalinställningar",
						submenu_channelsettings_text:			"Ändra inställningar",
						submenu_resetsettings_text:				"Återställ kanal",
						modal_header_text:						"Lokal kanalinställningar",
						modal_channelname_text:					"Lokalt kanalnamn",
						modal_colorpicker1_text:				"Lokal kanalfärg",
						modal_inheritcolor_text:				"Inherit färg till subkanaler"
					};
				case "tr":		//turkish
					return {
						context_localchannelsettings_text:		"Yerel Kanal Ayarları",
						submenu_channelsettings_text:			"Ayarları Değiştir",
						submenu_resetsettings_text:				"Kanal Sıfırla",
						modal_header_text:						"Yerel Kanal Ayarları",
						modal_channelname_text:					"Yerel Kanal Adı",
						modal_colorpicker1_text:				"Yerel Kanal Rengi",
						modal_inheritcolor_text:				"Renkleri alt kanallara miras alma"
					};
				case "cs":		//czech
					return {
						context_localchannelsettings_text:		"Místní nastavení kanálu",
						submenu_channelsettings_text:			"Změnit nastavení",
						submenu_resetsettings_text:				"Obnovit kanál",
						modal_header_text:						"Místní nastavení kanálu",
						modal_channelname_text:					"Místní název kanálu",
						modal_colorpicker1_text:				"Místní barvy kanálu",
						modal_inheritcolor_text:				"Zdědit barvu na subkanály"
					};
				case "bg":		//bulgarian
					return {
						context_localchannelsettings_text:		"Настройки за локални канали",
						submenu_channelsettings_text:			"Промяна на настройките",
						submenu_resetsettings_text:				"Възстановяване на канал",
						modal_header_text:						"Настройки за локални канали",
						modal_channelname_text:					"Локално име на канал",
						modal_colorpicker1_text:				"Локален цветен канал",
						modal_inheritcolor_text:				"Наследи цвета до подканали"
					};
				case "ru":		//russian
					return {
						context_localchannelsettings_text:		"Настройки локального канала",
						submenu_channelsettings_text:			"Изменить настройки",
						submenu_resetsettings_text:				"Сбросить канал",
						modal_header_text:						"Настройки локального канала",
						modal_channelname_text:					"Имя локального канала",
						modal_colorpicker1_text:				"Цвет локального канала",
						modal_inheritcolor_text:				"Наследовать цвет на подканалы"
					};
				case "uk":		//ukrainian
					return {
						context_localchannelsettings_text:		"Налаштування локального каналу",
						submenu_channelsettings_text:			"Змінити налаштування",
						submenu_resetsettings_text:				"Скидання каналу",
						modal_header_text:						"Налаштування локального каналу",
						modal_channelname_text:					"Локальне ім'я каналу",
						modal_colorpicker1_text:				"Колір місцевого каналу",
						modal_inheritcolor_text:				"Успадковують колір до підканалів"
					};
				case "ja":		//japanese
					return {
						context_localchannelsettings_text:		"ローカルチャネル設定",
						submenu_channelsettings_text:			"設定を変更する",
						submenu_resetsettings_text:				"チャネルをリセットする",
						modal_header_text:						"ローカルチャネル設定",
						modal_channelname_text:					"ローカルチャネル名",
						modal_colorpicker1_text:				"ローカルチャネルの色",
						modal_inheritcolor_text:				"サブチャンネルに色を継承"
					};
				case "zh-TW":	//chinese (traditional)
					return {
						context_localchannelsettings_text:		"本地頻道設置",
						submenu_channelsettings_text:			"更改設置",
						submenu_resetsettings_text:				"重置通道",
						modal_header_text:						"本地頻道設置",
						modal_channelname_text:					"本地頻道名稱",
						modal_colorpicker1_text:				"本地頻道顏色",
						modal_inheritcolor_text:				"繼承子通道的顏色"
					};
				case "ko":		//korean
					return {
						context_localchannelsettings_text:		"로컬 채널 설정",
						submenu_channelsettings_text:			"설정 변경",
						submenu_resetsettings_text:				"채널 재설정",
						modal_header_text:						"로컬 채널 설정",
						modal_channelname_text:					"로컬 채널 이름",
						modal_colorpicker1_text:				"지역 채널 색깔",
						modal_inheritcolor_text:				"하위 채널에 색상 상속"
					};
				default:		//default: english
					return {
						context_localchannelsettings_text:		"Local Channelsettings",
						submenu_channelsettings_text:			"Change Settings",
						submenu_resetsettings_text:				"Reset Channel",
						modal_header_text:						"Local Channelsettings",
						modal_channelname_text:					"Local Channelname",
						modal_colorpicker1_text:				"Local Channelcolor",
						modal_inheritcolor_text:				"Inherit color to Sub-Channels"
					};
			}
		}
	}
})();