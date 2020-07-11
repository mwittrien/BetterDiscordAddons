//META{"name":"PersonalPins","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/PersonalPins","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/PersonalPins/PersonalPins.plugin.js"}*//

var PersonalPins = (_ => {
	var choices = {};
	
	const pinIconGeneral = `<svg name="Note" width="24" height="24" viewBox="-1 -1.5 23 23"><mask/><g mask="url(#pinIconMask)"><path fill="currentColor" d="M 4.618, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 s 0.573 -0.256, 0.573 -0.573 V 0.573 C 5.191, 0.256, 4.935, 0, 4.618, 0 z"/><path fill="currentColor" d="M 8.053, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 s 0.573 -0.256, 0.573 -0.573 V 0.573 C 8.626, 0.256, 8.37, 0, 8.053, 0 z"/><path fill="currentColor" d="M 11.489, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 c 0.316, 0, 0.573 -0.256, 0.573 -0.573 V 0.573 C 12.061, 0.256, 11.805, 0, 11.489, 0 z "/><path fill="currentColor" d="M 14.924, 0 c -0.316, 0 -0.573, 0.256 -0.573, 0.573 v 1.145 c 0, 0.316, 0.256, 0.573, 0.573, 0.573 c 0.316, 0, 0.573 -0.256, 0.573 -0.573 V 0.573 C 15.496, 0.256, 15.24, 0, 14.924, 0 z"/><path fill="currentColor" d="M 16.641, 1.25 V 1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 c 0, 0.947 -0.77, 1.718 -1.718, 1.718 c -0.947, 0 -1.718 -0.77 -1.718 -1.718 V 1.25 C 2.236, 1.488, 1.756, 2.117, 1.756, 2.863 v 14.962 c 0, 0.947, 0.77, 1.718, 1.718, 1.718 h 12.595 c 0.947, 0, 1.718 -0.77, 1.718 -1.718 V 2.863 C 17.786, 2.117, 17.306, 1.488, 16.641, 1.25 z M 14.924, 16.679 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 c 0 -0.316, 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 C 15.496, 16.423, 15.24, 16.679, 14.924, 16.679 z M 14.924, 13.244 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 c 0 -0.316, 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 C 15.496, 12.988, 15.24, 13.244, 14.924, 13.244 z M 14.924, 9.733 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 s 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 S 15.24, 9.733, 14.924, 9.733 z M 14.924, 6.298 H 4.618 c -0.316, 0 -0.573 -0.256 -0.573 -0.573 s 0.256 -0.573, 0.573 -0.573 h 10.305 c 0.316, 0, 0.573, 0.256, 0.573, 0.573 S 15.24, 6.298, 14.924, 6.298 z"/></g><extra/></svg>`;
	const pinIconMask = `<mask id="pinIconMask" fill="black"><path d="M 0 0 H 24 V 24 H 0 Z" fill="white"></path><path d="M24 12 H 12 V 24 H 24 Z" fill="black"></path></mask>`;
	const pinIcon = pinIconGeneral.replace(`<extra/>`, ``).replace(`<mask/>`, ``).replace(` mask="url(#pinIconMask)"`, ``);
	const pinIconDelete = pinIconGeneral.replace(`<extra/>`, `<path transform="translate(8, 8)" stroke="#f04747" stroke-width="2" fill="none" d="M 4 4 l 8.666 8.666 m 0 -8.667 l -8.667 8.666 Z"/>`).replace(`<mask/>`, pinIconMask);
	const pinIconUpdate = pinIconGeneral.replace(`<extra/>`, `<path transform="translate(10, 10)" fill="#43b581" d="M 11.374, 4.978 V 0 l -1.672, 1.671 C 8.675, 0.64, 7.256, 0, 5.685, 0 C 2.542, 0, 0.003, 2.546, 0.003, 5.688 s 2.538, 5.688, 5.681, 5.688 c 2.648, 0, 4.867 -1.814, 5.496 -4.267 h -1.48 c -0.587, 1.656 -2.158, 2.844 -4.018, 2.844 c -2.358, 0 -4.267 -1.91 -4.267 -4.267 s 1.909 -4.267, 4.266 -4.267 c 1.176, 0, 2.232, 0.49, 3.004, 1.262 l -2.294, 2.293 H 11.374 z"/>`).replace(`<mask/>`, pinIconMask);
	
	const filterKeys = ["channel", "server", "all"], sortKeys = ["notetime", "messagetime"];
	
	return class PersonalPins {
		getName () {return "PersonalPins";}

		getDescription () {return "Similar to normal pins. Lets you save messages as notes for yourself.";}

		getVersion () {return "1.9.5";} 

		getAuthor () {return "DevilBro";}

		constructor () {
			this.changelog = {
				"added":[["Default settings","You can now change the default tab/sort order for the popout"]]
			};

			this.patchedModules = {
				after: {
					HeaderBarContainer: "render"
				}
			};
		}
		
		initConstructor () {
			this.defaults = {
				choices: {
					defaultFilter:		{value:filterKeys[0], 	options:filterKeys,		type:"filter",	description:"Default choice tab"},
					defaultSort:		{value:sortKeys[0], 	options:sortKeys,		type:"sort",	description:"Default sort order"}
				}
			};
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settingsPanel, settingsItems = [];
			
			for (let key in choices) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Select",
				plugin: this,
				keys: ["choices", key],
				label: this.defaults.choices[key].description,
				basis: "50%",
				value: choices[key],
				options: (this.defaults.choices[key].options || []).map(option => this.getValue(option, this.defaults.choices[key].type)),
				searchable: true
			}));
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
				type: "Button",
				className: BDFDB.disCN.marginbottom8,
				color: BDFDB.LibraryComponents.Button.Colors.RED,
				label: "Delete all notes",
				onClick: _ => {
					BDFDB.ModalUtils.confirm(this, "Are you sure you want to delete all pinned notes?", _ => {
						BDFDB.DataUtils.remove(this, "notes");
					});
				},
				children: BDFDB.LanguageUtils.LanguageStrings.DELETE
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

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
		}

		onMessageContextMenu (e) {
			if (e.instance.props.message && e.instance.props.channel) {
				let note = this.getNoteData(e.instance.props.message, e.instance.props.channel);
				let hint = BDFDB.BDUtils.isPluginEnabled("MessageUtilities") ? BDFDB.BDUtils.getPlugin("MessageUtilities").getActiveShortcutString("__Note_Message") : null;
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["pin", "unpin"]});
				children.splice(index > -1 ? index + 1: 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
					label: note ? this.labels.context_unpinoption_text : this.labels.context_pinoption_text,
					id: BDFDB.ContextMenuUtils.createItemId(this.name, note ? "unpin-note" : "pin-note"),
					hint: hint && (_ => {
						return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuHint, {
							hint: hint
						});
					}),
					action: _ => {
						BDFDB.ContextMenuUtils.close(e.instance);
						this.addMessageToNotes(e.instance.props.message, e.instance.props.channel);
					}
				}));
				if (this.isNoteOutdated(note, e.instance.props.message)) children.splice(index > -1 ? index + 1: 0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
					label: this.labels.context_updateoption_text,
					id: BDFDB.ContextMenuUtils.createItemId(this.name, "update-note"),
					action: _ => {
						BDFDB.ContextMenuUtils.close(e.instance);
						this.updateNoteData(note, e.instance.props.message);
					}
				}));
			}
		}
		
		onMessageOptionContextMenu (e) {
			if (e.instance.props.message && e.instance.props.channel) {
				let note = this.getNoteData(e.instance.props.message, e.instance.props.channel);
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["pin", "unpin"]});
				children.splice(index + 1, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
					label: note ? this.labels.context_unpinoption_text : this.labels.context_pinoption_text,
					id: BDFDB.ContextMenuUtils.createItemId(this.name, note ? "unpin-note" : "pin-note"),
					icon: _ => {
						return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
							icon: note ? pinIconDelete : pinIcon
						});
					},
					action: _ => {
						this.addMessageToNotes(e.instance.props.message, e.instance.props.channel);
					}
				}));
				if (this.isNoteOutdated(note, e.instance.props.message)) children.splice(index + 1, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
					label: this.labels.context_updateoption_text,
					id: "update-note",
					icon: _ => {
						return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MenuItems.MenuIcon, {
							icon: pinIconUpdate
						});
					},
					action: _ => {
						this.updateNoteData(note, e.instance.props.message);
					}
				}));
			}
		}

		processHeaderBarContainer (e) {
			let [children, index] = BDFDB.ReactUtils.findParent(BDFDB.ReactUtils.getValue(e.returnvalue, "props.toolbar"), {name: "FluxContainer(Search)"});
			if (index > -1) children.splice(index, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PopoutContainer, {
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: this.labels.popout_note_text,
					tooltipConfig: {type: "bottom"},
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
						className: BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.disCNS.channelheadericon,
							iconSVG: pinIcon
						})
					})
				}),
				popoutClassName: BDFDB.disCN.messagespopoutwrap,
				animation: BDFDB.LibraryComponents.PopoutContainer.Animation.SCALE,
				position: BDFDB.LibraryComponents.PopoutContainer.Positions.BOTTOM,
				align: BDFDB.LibraryComponents.PopoutContainer.Align.RIGHT,
				width: 500,
				maxHeight: "calc(100vh - 100px)",
				onClose: instance => {
					BDFDB.DOMUtils.removeClass(instance.domElementRef.current, BDFDB.disCN.channelheadericonselected);
				},
				renderPopout: instance => {
					BDFDB.DOMUtils.addClass(instance.domElementRef.current, BDFDB.disCN.channelheadericonselected);
					return this.openNotesPopout(instance);
				}
			}));
		}
		
		openNotesPopout (buttonInstance) {
			buttonInstance.props.selectedFilter = buttonInstance.props.selectedFilter || this.getValue(choices.defaultFilter || filterKeys[0], "filter");
			buttonInstance.props.selectedSort = buttonInstance.props.selectedSort || this.getValue(choices.defaultSort || sortKeys[0], "sort");
			buttonInstance.props.searchKey = buttonInstance.props.searchKey || "";
			let searchTimeout;
			return [
				BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCNS.messagespopouttabbarheader + BDFDB.disCN.messagespopoutheader,
					style: {
						paddingBottom: 4
					},
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
						direction: BDFDB.LibraryComponents.Flex.Direction.VERTICAL,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
								className: BDFDB.disCN.marginbottom4,
								align: BDFDB.LibraryComponents.Flex.Align.CENTER,
								children: [
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
										className: BDFDB.disCN.messagespopouttitle,
										children: this.labels.popout_note_text
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SearchBar, {
										query: buttonInstance.props.searchKey,
										onChange: value => {
											BDFDB.TimeUtils.clear(searchTimeout);
											searchTimeout = BDFDB.TimeUtils.timeout(_ => {
												buttonInstance.props.searchKey = value;
												BDFDB.ReactUtils.forceUpdate(buttonInstance.popout._owner.stateNode);
											}, 1000);
										},
										onClear: _ => {
											buttonInstance.props.searchKey = "";
											BDFDB.ReactUtils.forceUpdate(buttonInstance.popout._owner.stateNode);
										}
									})
								]
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
								align: BDFDB.LibraryComponents.Flex.Align.CENTER,
								children: [
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TabBar, {
										className: BDFDB.disCN.messagespopouttabbar,
										itemClassName: BDFDB.disCN.messagespopouttabbartab,
										itemSelectedClassName: BDFDB.disCN.messagespopouttabbartabactive,
										type: BDFDB.LibraryComponents.TabBar.Types.TOP_PILL,
										selectedItem: buttonInstance.props.selectedFilter.value,
										items: filterKeys.map(option => this.getValue(option, "filter")),
										onItemSelect: option => {
											buttonInstance.props.selectedFilter = this.getValue(option, "filter");
											BDFDB.ReactUtils.forceUpdate(buttonInstance.popout._owner.stateNode);
										}
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.QuickSelect, {
										label: this.labels.popout_sort_text + ":",
										value: buttonInstance.props.selectedSort,
										options: sortKeys.map(option => this.getValue(option, "sort")),
										onChange: option => {
											buttonInstance.props.selectedSort = this.getValue(option, "sort");
											BDFDB.ReactUtils.forceUpdate(buttonInstance.popout._owner.stateNode);
										}
									})
								]
							})
						]
					})
				}),
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ScrollerVertical, {
					className: BDFDB.disCN.messagespopout,
					children: this.filterMessages(buttonInstance, buttonInstance.props.selectedFilter.value, buttonInstance.props.selectedSort.value, buttonInstance.props.searchKey.toUpperCase())
				})
			];
		}
		
		getValue (key, type) {
			return {
				label: this.labels[`popout_${type}_${key}_text`],
				value: key
			}
		}
		
		filterMessages (buttonInstance, filter, sort, searchkey) {
			let lighttheme = BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themelight;
			let messages = [], notes = BDFDB.DataUtils.load(this, "notes"), updatedata = false;
			for (let guild_id in notes) for (let channel_id in notes[guild_id]) for (let message_idPOS in notes[guild_id][channel_id]) {
				let message = JSON.parse(notes[guild_id][channel_id][message_idPOS].message);
				message.author = new BDFDB.DiscordObjects.User(message.author);
				message.timestamp = new BDFDB.DiscordObjects.Timestamp(message.timestamp);
				message.editedTimestamp = message.editedTimestamp && new BDFDB.DiscordObjects.Timestamp(message.editedTimestamp);
				if (message.customRenderedContent && message.customRenderedContent.content.length) message.customRenderedContent.content = BDFDB.ReactUtils.objectToReact(message.customRenderedContent.content);
				for (let embed of message.embeds) {
					embed.color = typeof embed.color != "string" ? null : embed.color;
					embed.timestamp = embed.timestamp && new BDFDB.DiscordObjects.Timestamp(embed.timestamp);
				}
				message.embeds = message.embeds.filter(n => !(n && n.type == "gifv"));
				message.reactions = [];
				message = new BDFDB.DiscordObjects.Message(message);
				let channel = notes[guild_id][channel_id][message_idPOS].channel && new BDFDB.DiscordObjects.Channel(JSON.parse(notes[guild_id][channel_id][message_idPOS].channel));
				if (!channel) {
					channel = BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
					if (channel) {
						updatedata = true;
						notes[guild_id][channel_id][message_idPOS].channel = JSON.stringify(channel);
					}
				}
				messages.push({
					note: notes[guild_id][channel_id][message_idPOS],
					channel_id,
					guild_id,
					message,
					channel,
					messagetime: notes[guild_id][channel_id][message_idPOS].timestamp,
					notetime: notes[guild_id][channel_id][message_idPOS].addedat
				});
			}
			if (updatedata) BDFDB.DataUtils.save(notes, this, "notes");
			let currentchannel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId()) || {};
			switch (filter) {
				case "channel":
					messages = messages.filter(messageData => messageData.channel_id == currentchannel.id);
					break;
				case "server":
					messages = messages.filter(messageData => messageData.guild_id == (currentchannel.guild_id || BDFDB.DiscordConstants.ME));
					break;
				case "allservers":
					messages = messages;
					break;
			}
			if (searchkey) {
				let searchvalues = ["content", "author.username", "rawDescription", "author.name"];
				messages = messages.filter(messageData => searchvalues.some(key => this.containsSearchkey(messageData.message, key, searchkey) || messageData.message.embeds.some(embed => this.containsSearchkey(embed, key, searchkey))));
			}
			BDFDB.ArrayUtils.keySort(messages, sort);
			messages.reverse();
			return Object.keys(messages).length ? 
				messages.map(messageData => this.renderMessage(buttonInstance, messageData.note, messageData.message, messageData.channel, filter)).flat(10).filter(n => n) :
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MessagesPopoutComponents.EmptyStateCenter, {
					msg: BDFDB.LanguageUtils.LanguageStrings.AUTOCOMPLETE_NO_RESULTS_HEADER,
					image: lighttheme ? "/assets/03c7541028afafafd1a9f6a81cb7f149.svg" : "/assets/6793e022dc1b065b21f12d6df02f91bd.svg"
				});
		}
		
		containsSearchkey (data, key, searchkey) {
			let value = BDFDB.ReactUtils.getValue(data, key);
			return value && value.toUpperCase().indexOf(searchkey) > -1
		}
		
		renderMessage (buttonInstance, note, message, channel, filter) {
			if (!message || !channel) return null;
			let channelname = channel.name;
			let guild = channel.guild_id && BDFDB.LibraryModules.GuildStore.getGuild(channel.guild_id);
			let role = guild && BDFDB.LibraryModules.PermissionRoleUtils.getHighestRole(guild, message.author.id);
			if (role) message.colorString = role.colorString;
			if (filter != "channel" && !channelname && channel.recipients.length > 0) {
				for (let dmuser_id of channel.recipients) {
					channelname = channelname ? channelname + ", @" : channelname;
					channelname = channelname + ((BDFDB.LibraryModules.UserStore.getUser(dmuser_id) || {}).username || BDFDB.LanguageUtils.LanguageStrings.UNKNOWN_USER);
				}
			}
			return [filter == "channel" ? null : BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN.messagespopoutchannelseparator,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
						tag: "span",
						className: BDFDB.disCN.messagespopoutchannelname,
						onClick: _ => {
							BDFDB.LibraryModules.SelectChannelUtils.selectChannel(channel.guild_id, channel.id);
						},
						children: channelname ? ((channel.guild_id ? "#" : "@") + channelname) : "???"
					}),
					filter == "all" ? BDFDB.ReactUtils.createElement("span", {
						className: BDFDB.disCN.messagespopoutguildname,
						children: channel.guild_id ? (BDFDB.LibraryModules.GuildStore.getGuild(channel.guild_id) || {}).name || BDFDB.LanguageUtils.LanguageStrings.GUILD_UNAVAILABLE_HEADER : BDFDB.LanguageUtils.LanguageStrings.DIRECT_MESSAGES
					}) : null
				]
			}), BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCN.messagespopoutgroupwrapper,
				key: message.id,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MessageGroup, {
						className: BDFDB.disCN.messagespopoutgroupcozy,
						message: message,
						channel: channel
					}),
					BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.messagespopoutactionbuttons,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
								className: BDFDB.disCN.messagespopoutjumpbutton,
								onClick: _ => {
									BDFDB.LibraryModules.SelectChannelUtils.selectChannel(channel.guild_id, channel.id, message.id);
								},
								children: BDFDB.ReactUtils.createElement("div", {
									children: BDFDB.LanguageUtils.LanguageStrings.JUMP
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
								className: BDFDB.disCN.messagespopoutjumpbutton,
								onClick: _ => {
									if (message.content || message.attachments.length > 1) {
										let text = message.content || "";
										for (let attachment of message.attachments) if (attachment.url) text += ((text ? "\n" : "") + attachment.url);
										BDFDB.LibraryRequires.electron.clipboard.write({text});
									}
									else if (message.attachments.length == 1 && message.attachments[0].url) {
										BDFDB.LibraryRequires.request({url: message.attachments[0].url, encoding: null}, (error, response, buffer) => {
											if (buffer) {
												if (BDFDB.LibraryRequires.process.platform === "win32" || BDFDB.LibraryRequires.process.platform === "darwin") {
													BDFDB.LibraryRequires.electron.clipboard.write({image: BDFDB.LibraryRequires.electron.nativeImage.createFromBuffer(buffer)});
												}
												else {
													let file = BDFDB.LibraryRequires.path.join(BDFDB.LibraryRequires.process.env["HOME"], "personalpinstemp.png");
													BDFDB.LibraryRequires.fs.writeFileSync(file, buffer, {encoding: null});
													BDFDB.LibraryRequires.electron.clipboard.write({image: file});
													BDFDB.LibraryRequires.fs.unlinkSync(file);
												}
											}
										});
									}
								},
								children: BDFDB.ReactUtils.createElement("div", {
									children: BDFDB.LanguageUtils.LanguageStrings.COPY
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
								look: BDFDB.LibraryComponents.Button.Looks.BLANK,
								size: BDFDB.LibraryComponents.Button.Sizes.NONE,
								onClick: (e, instance) => {
									this.removeNoteData(note);
									BDFDB.ReactUtils.forceUpdate(buttonInstance.popout._owner.stateNode);
								},
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									className: BDFDB.disCN.messagespopoutclosebutton,
									name: BDFDB.LibraryComponents.SvgIcon.Names.CLOSE
								})
							})
						]
					})
				]
			})];
		}

		addMessageToNotes (message, channel) {
			if (!message) return;
			let notes = BDFDB.DataUtils.load(this, "notes");
			channel = channel || BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
			let guild_id = channel.guild_id || BDFDB.DiscordConstants.ME;
			notes[guild_id] = notes[guild_id] || {};
			notes[guild_id][channel.id] = notes[guild_id][channel.id] || {}
			if (!notes[guild_id][channel.id][message.id]) {
				notes[guild_id][channel.id][message.id] = {
					addedat: new Date().getTime(),
					channel: JSON.stringify(channel),
					id: message.id,
					message: JSON.stringify(message),
					timestamp: message.timestamp._i.getTime()
				};
				BDFDB.DataUtils.save(notes, this, "notes");
				BDFDB.NotificationUtils.toast(this.labels.toast_noteadd_text, {type: "success"});
			}
			else this.removeNoteData(notes[guild_id][channel.id][message.id]);
		}
		
		isNoteOutdated (note, message) {
			let notemessage = note && JSON.parse(note.message), keys = ["content", "embeds", "attachment"];
			return notemessage && !BDFDB.equals(BDFDB.ObjectUtils.extract(notemessage, keys), BDFDB.ObjectUtils.extract(message, keys));
		}

		getNoteData (message, channel) {
			if (!message) return;
			channel = channel || BDFDB.LibraryModules.ChannelStore.getChannel(message.channel_id);
			let guild_id = channel.guild_id || BDFDB.DiscordConstants.ME;
			let notes = BDFDB.DataUtils.load(this, "notes");
			return notes[guild_id] && notes[guild_id][channel.id] && notes[guild_id][channel.id][message.id];
		}

		updateNoteData (note, newmessage) {
			let message = JSON.parse(note.message);
			let channel = JSON.parse(note.channel);
			if (!message || !channel) return;
			let guild_id = channel.guild_id || BDFDB.DiscordConstants.ME;
			let notes = BDFDB.DataUtils.load(this, "notes");
			notes[guild_id][channel.id][note.id].message = JSON.stringify(newmessage);
			BDFDB.DataUtils.save(notes, this, "notes");
			BDFDB.NotificationUtils.toast(this.labels.toast_noteupdate_text, {type: "info"});
		}

		removeNoteData (note) {
			let message = JSON.parse(note.message);
			let channel = JSON.parse(note.channel);
			if (!message || !channel) return;
			let guild_id = channel.guild_id || BDFDB.DiscordConstants.ME;
			let notes = BDFDB.DataUtils.load(this, "notes");
			delete notes[guild_id][channel.id][note.id];
			if (BDFDB.ObjectUtils.isEmpty(notes[guild_id][channel.id])) {
				delete notes[guild_id][channel.id];
				if (BDFDB.ObjectUtils.isEmpty(notes[guild_id])) delete notes[guild_id];
			}
			BDFDB.DataUtils.save(notes, this, "notes");
			BDFDB.NotificationUtils.toast(this.labels.toast_noteremove_text, {type: "danger"});
		}
		
		forceUpdateAll() {
			choices = BDFDB.DataUtils.get(this, "choices");
			
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}


		setLabelsByLanguage () {
			switch (BDFDB.LanguageUtils.getLanguage().id) {
				case "hr":		//croatian
					return {
						popout_note_text:				"Bilješke",
						popout_filter_channel_text:		"Kanal",
						popout_filter_server_text:		"Poslužavnik",
						popout_filter_all_text:			"Svi poslužitelji",
						popout_sort_text:				"Poredaj po",
						popout_sort_messagetime_text:	"Vijesti-Datum",
						popout_sort_notetime_text:		"Bilješka-Datum",
						context_pinoption_text:			"Napominjemo poruku",
						context_updateoption_text:		"Ažuriraj bilješku",
						context_unpinoption_text:		"Uklonite bilješku",
						popout_pinoption_text:			"Bilješka",
						toast_noteadd_text:				"Poruka dodana u bilježnicu.",
						toast_noteupdate_text:			"Poruka je ažurirana u bilježnici.",
						toast_noteremove_text:			"Poruka uklonjena iz bilježnice."
					};
				case "da":		//danish
					return {
						popout_note_text:				"Noter",
						popout_filter_channel_text:		"Kanal",
						popout_filter_server_text:		"Server",
						popout_filter_all_text:			"Alle servere",
						popout_sort_text:				"Sorter efter",
						popout_sort_messagetime_text:	"Meddelelse-Dato",
						popout_sort_notetime_text:		"Note-Dato",
						context_pinoption_text:			"Noter besked",
						context_updateoption_text:		"Opdater note",
						context_unpinoption_text:		"Fjern note",
						popout_pinoption_text:			"Noter",
						toast_noteadd_text:				"Meddelelse tilføjet til notesbog.",
						toast_noteupdate_text:			"Meddelelse opdateret i den notesbog.",
						toast_noteremove_text:			"Meddelelse fjernet fra notesbog."
					};
				case "de":		//german
					return {
						popout_note_text:				"Notizen",
						popout_filter_channel_text:		"Kanal",
						popout_filter_server_text:		"Server",
						popout_filter_all_text:			"Alle Server",
						popout_sort_text:				"Sortieren nach",
						popout_sort_messagetime_text:	"Nachrichten-Datum",
						popout_sort_notetime_text:		"Notiz-Datum",
						context_pinoption_text:			"Nachricht notieren",
						context_updateoption_text:		"Notiz aktualisieren",
						context_unpinoption_text:		"Notiz entfernen",
						popout_pinoption_text:			"Notieren",
						toast_noteadd_text:				"Nachricht zum Notizbuch hinzugefügt.",
						toast_noteupdate_text:			"Nachricht im Notizbuch aktualisiert.",
						toast_noteremove_text:			"Nachricht aus dem Notizbuch entfernt."
					};
				case "es":		//spanish
					return {
						popout_note_text:				"Notas",
						popout_filter_channel_text:		"Canal",
						popout_filter_server_text:		"Servidor",
						popout_filter_all_text:			"Todos los servidores",
						popout_sort_text:				"Ordenar por",
						popout_sort_messagetime_text:	"Mensaje-Fecha",
						popout_sort_notetime_text:		"Nota-Fecha",
						context_pinoption_text:			"Anotar mensaje",
						context_updateoption_text:		"Actualiza la nota",
						context_unpinoption_text:		"Eliminar la nota",
						popout_pinoption_text:			"Anotar",
						toast_noteadd_text:				"Mensaje agregado al cuaderno.",
						toast_noteupdate_text:			"Mensaje actualizado en el cuaderno.",
						toast_noteremove_text:			"Mensaje eliminado del cuaderno."
					};
				case "fr":		//french
					return {
						popout_note_text:				"Notes",
						popout_filter_channel_text:		"Canal",
						popout_filter_server_text:		"Serveur",
						popout_filter_all_text:			"Tous les serveurs",
						popout_sort_text:				"Trier par",
						popout_sort_messagetime_text:	"Message-Date",
						popout_sort_notetime_text:		"Note-Date",
						context_pinoption_text:			"Noter le message",
						context_updateoption_text:		"Mettre à jour la note",
						context_unpinoption_text:		"Enlevez la note",
						popout_pinoption_text:			"Noter",
						toast_noteadd_text:				"Message ajouté au cahier.",
						toast_noteupdate_text:			"Message mis à jour dans le cahier.",
						toast_noteremove_text:			"Message supprimé du cahier."
					};
				case "it":		//italian
					return {
						popout_note_text:				"Note",
						popout_filter_channel_text:		"Canale",
						popout_filter_server_text:		"Server",
						popout_filter_all_text:			"Tutti i server",
						popout_sort_text:				"Ordina per",
						popout_sort_messagetime_text:	"Messaggio-Data",
						popout_sort_notetime_text:		"Nota-Data",
						context_pinoption_text:			"Annotare il messaggio",
						context_updateoption_text:		"Aggiorna la nota",
						context_unpinoption_text:		"Rimuovi la nota",
						popout_pinoption_text:			"Annotare",
						toast_noteadd_text:				"Messaggio aggiunto al blocco note.",
						toast_noteupdate_text:			"Messaggio aggiornato nel blocco note.",
						toast_noteremove_text:			"Messaggio rimosso dal blocco note."
					};
				case "nl":		//dutch
					return {
						popout_note_text:				"Notities",
						popout_filter_channel_text:		"Kanaal",
						popout_filter_server_text:		"Server",
						popout_filter_all_text:			"Alle servers",
						popout_sort_text:				"Sorteer op",
						popout_sort_messagetime_text:	"Bericht-Datum",
						popout_sort_notetime_text:		"Notitie-Datum",
						context_pinoption_text:			"Noteer bericht",
						context_updateoption_text:		"Update de notitie",
						context_unpinoption_text:		"Verwijder de notitie",
						popout_pinoption_text:			"Noteer",
						toast_noteadd_text:				"Bericht toegevoegd aan notitieblok.",
						toast_noteupdate_text:			"Bericht bijgewerkt in het notitieblok.",
						toast_noteremove_text:			"Bericht verwijderd van notitieblok."
					};
				case "no":		//norwegian
					return {
						popout_note_text:				"Notatene",
						popout_filter_channel_text:		"Kanal",
						popout_filter_server_text:		"Server",
						popout_filter_all_text:			"Alle servere",
						popout_sort_text:				"Sorter etter",
						popout_sort_messagetime_text:	"Melding-Dato",
						popout_sort_notetime_text:		"Merknad-Dato",
						context_pinoption_text:			"Notat ned meldingen",
						context_updateoption_text:		"Oppdater notatet",
						context_unpinoption_text:		"Fjern notatet",
						popout_pinoption_text:			"Notere",
						toast_noteadd_text:				"Melding lagt til i notisboken.",
						toast_noteupdate_text:			"Melding oppdatert i notisbok.",
						toast_noteremove_text:			"Melding fjernet fra notatboken."
					};
				case "pl":		//polish
					return {
						popout_note_text:				"Notatki",
						popout_filter_channel_text:		"Kanał",
						popout_filter_server_text:		"Serwer",
						popout_filter_all_text:			"Wszystkie serwery",
						popout_sort_text:				"Sortuj według",
						popout_sort_messagetime_text:	"Wiadomość-Data",
						popout_sort_notetime_text:		"Notatka-Data",
						context_pinoption_text:			"Notuj wiadomość",
						context_updateoption_text:		"Zaktualizuj notatkę",
						context_unpinoption_text:		"Usuń notatkę",
						popout_pinoption_text:			"Notuj",
						toast_noteadd_text:				"Wiadomość została dodana do notatnika.",
						toast_noteupdate_text:			"Wiadomość zaktualizowana w notatniku.",
						toast_noteremove_text:			"Wiadomość została usunięta z notatnika."
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						popout_note_text:				"Notas",
						popout_filter_channel_text:		"Canal",
						popout_filter_server_text:		"Servidor",
						popout_filter_all_text:			"Todos os servidores",
						popout_sort_text:				"Ordenar por",
						popout_sort_messagetime_text:	"Mensagem-Data",
						popout_sort_notetime_text:		"Nota-Data",
						context_pinoption_text:			"Anote a mensagem",
						context_updateoption_text:		"Atualize a nota",
						context_unpinoption_text:		"Remova a nota",
						popout_pinoption_text:			"Anotar",
						toast_noteadd_text:				"Mensagem adicionada ao caderno.",
						toast_noteupdate_text:			"Mensagem atualizada no caderno.",
						toast_noteremove_text:			"Mensagem removida do caderno."
					};
				case "fi":		//finnish
					return {
						popout_note_text:				"Muistiinpanot",
						popout_filter_channel_text:		"Kanava",
						popout_filter_server_text:		"Palvelin",
						popout_filter_all_text:			"Kaikki palvelimet",
						popout_sort_text:				"Järjestä",
						popout_sort_messagetime_text:	"Viesti-Päivämäärä",
						popout_sort_notetime_text:		"Huomaa-Päivämäärä",
						context_pinoption_text:			"Huomaa viesti",
						context_updateoption_text:		"Päivitä muistiinpano",
						context_unpinoption_text:		"Poista muistiinpano",
						popout_pinoption_text:			"Huomaa",
						toast_noteadd_text:				"Viesti lisätty muistikirjaan.",
						toast_noteupdate_text:			"Viesti päivitetty muistikirjaan.",
						toast_noteremove_text:			"Viesti poistettiin muistikirjaan."
					};
				case "sv":		//swedish
					return {
						popout_note_text:				"Anteckningarna",
						popout_filter_channel_text:		"Kanal",
						popout_filter_server_text:		"Server",
						popout_filter_all_text:			"Alla servrar",
						popout_sort_text:				"Sortera efter",
						popout_sort_messagetime_text:	"Meddelande-Datum",
						popout_sort_notetime_text:		"Anteckningen-Datum",
						context_pinoption_text:			"Anteckna meddelande",
						context_updateoption_text:		"Uppdatera noten",
						context_unpinoption_text:		"Ta bort noten",
						popout_pinoption_text:			"Anteckna",
						toast_noteadd_text:				"Meddelandet läggs till i anteckningsboken.",
						toast_noteupdate_text:			"Meddelandet uppdateras i anteckningsboken.",
						toast_noteremove_text:			"Meddelande borttaget från anteckningsboken."
					};
				case "tr":		//turkish
					return {
						popout_note_text:				"Notlar",
						popout_filter_channel_text:		"Kanal",
						popout_filter_server_text:		"Sunucu",
						popout_filter_all_text:			"Tüm Sunucular",
						popout_sort_text:				"Göre sırala",
						popout_sort_messagetime_text:	"Mesaj-Tarih",
						popout_sort_notetime_text:		"Not-Tarih",
						context_pinoption_text:			"Mesajı not alın",
						context_updateoption_text:		"Notu güncelle",
						context_unpinoption_text:		"Notu kaldırmak",
						popout_pinoption_text:			"Not almak",
						toast_noteadd_text:				"Mesaj not defteri'ya eklendi.",
						toast_noteupdate_text:			"Mesaj defterde güncellendi.",
						toast_noteremove_text:			"Mesaj not defteri'dan kaldırıldı."
					};
				case "cs":		//czech
					return {
						popout_note_text:				"Poznámky",
						popout_filter_channel_text:		"Kanál",
						popout_filter_server_text:		"Server",
						popout_filter_all_text:			"Všechny servery",
						popout_sort_text:				"Seřazeno podle",
						popout_sort_messagetime_text:	"Zpráva-datum",
						popout_sort_notetime_text:		"Poznámka-datum",
						context_pinoption_text:			"Poznámka dolů zprávu",
						context_updateoption_text:		"Aktualizujte poznámku",
						context_unpinoption_text:		"Odstraňte poznámku",
						popout_pinoption_text:			"Poznámka dolů",
						toast_noteadd_text:				"Zpráva byla přidána do notebooku.",
						toast_noteupdate_text:			"Zpráva byla v notebooku aktualizována.",
						toast_noteremove_text:			"Zpráva byla odebrána z notebooku."
					};
				case "bg":		//bulgarian
					return {
						popout_note_text:				"бележките",
						popout_filter_channel_text:		"Канал",
						popout_filter_server_text:		"Сървър",
						popout_filter_all_text:			"Всички сървъри",
						popout_sort_text:				"Сортиране по",
						popout_sort_messagetime_text:	"Съобщение-Дата",
						popout_sort_notetime_text:		"Забележка-Дата",
						context_pinoption_text:			"Oтбележете съобщението",
						context_updateoption_text:		"Актуализирайте бележката",
						context_unpinoption_text:		"Премахнете бележката",
						popout_pinoption_text:			"Oтбележете",
						toast_noteadd_text:				"Съобщението бе добавено към бележника.",
						toast_noteupdate_text:			"Съобщението е актуализирано в бележника.",
						toast_noteremove_text:			"Съобщението е премахнато от преносимия бележника."
					};
				case "ru":		//russian
					return {
						popout_note_text:				"Заметки",
						popout_filter_channel_text:		"Канал",
						popout_filter_server_text:		"Cервер",
						popout_filter_all_text:			"Все серверы",
						popout_sort_text:				"Сортировать по",
						popout_sort_messagetime_text:	"Сообщение-дата",
						popout_sort_notetime_text:		"Заметки-Дата",
						context_pinoption_text:			"Записывать вниз",
						context_updateoption_text:		"Обновить заметку",
						context_unpinoption_text:		"Удалить заметку",
						popout_pinoption_text:			"Записывать",
						toast_noteadd_text:				"Сообщение добавлено в блокнот.",
						toast_noteupdate_text:			"Сообщение обновлено в записной блокнот.",
						toast_noteremove_text:			"Сообщение удалено из записной блокнот."
					};
				case "uk":		//ukrainian
					return {
						popout_note_text:				"Замітки",
						popout_filter_channel_text:		"Канал",
						popout_filter_server_text:		"Сервер",
						popout_filter_all_text:			"Всі сервери",
						popout_sort_text:				"Сортувати за",
						popout_sort_messagetime_text:	"Повідомлення-дата",
						popout_sort_notetime_text:		"Примітка-дата",
						context_pinoption_text:			"Зверніть увагу на повідомлення",
						context_updateoption_text:		"Оновіть нотатку",
						context_unpinoption_text:		"Видаліть нотатку",
						popout_pinoption_text:			"Занотуйте",
						toast_noteadd_text:				"Повідомлення додається до ноутбука.",
						toast_noteupdate_text:			"Повідомлення оновлено в ноутбука.",
						toast_noteremove_text:			"Повідомлення видалено з ноутбука."
					};
				case "ja":		//japanese
					return {
						popout_note_text:				"ノート",
						popout_filter_channel_text:		"チャネル",
						popout_filter_server_text:		"サーバ",
						popout_filter_all_text:			"すべてのサーバー",
						popout_sort_text:				"並び替え",
						popout_sort_messagetime_text:	"メッセージ-日付",
						popout_sort_notetime_text:		"注-日付",
						context_pinoption_text:			"ノートダウンメッセージ",
						context_updateoption_text:		"メモを更新する",
						context_unpinoption_text:		"メモを削除",
						popout_pinoption_text:			"書き留める",
						toast_noteadd_text:				"ノートブックにメッセージが追加されました.",
						toast_noteupdate_text:			"ノートブックで更新されたメッセージ.",
						toast_noteremove_text:			"ノートブックからメッセージが削除されました."
					};
				case "zh-TW":	//chinese (traditional)
					return {
						popout_note_text:				"筆記",
						popout_filter_channel_text:		"渠道",
						popout_filter_server_text:		"服務器",
						popout_filter_all_text:			"所有服務器",
						popout_sort_text:				"排序方式",
						popout_sort_messagetime_text:	"消息-日期",
						popout_sort_notetime_text:		"注-日期",
						context_pinoption_text:			"記下下來的消息",
						context_updateoption_text:		"更新說明",
						context_unpinoption_text:		"刪除備註",
						popout_pinoption_text:			"記下",
						toast_noteadd_text:				"消息添加到筆記本.",
						toast_noteupdate_text:			"消息在筆記本中更新.",
						toast_noteremove_text:			"消息從筆記本中刪除."
					};
				case "ko":		//korean
					return {
						popout_note_text:				"노트",
						popout_filter_channel_text:		"채널",
						popout_filter_server_text:		"섬기는 사람",
						popout_filter_all_text:			"모든 서버",
						popout_sort_text:				"정렬 기준",
						popout_sort_messagetime_text:	"메시지-날짜",
						popout_sort_notetime_text:		"주-날짜",
						context_pinoption_text:			"메모 다운 메시지",
						context_updateoption_text:		"메모 업데이트",
						context_unpinoption_text:		"메모 삭제",
						popout_pinoption_text:			"메모하다",
						toast_noteadd_text:				"노트북에 메시지 추가됨.",
						toast_noteupdate_text:			"노트북에서 메시지가 업데이트되었습니다.",
						toast_noteremove_text:			"노트에서 메시지 삭제됨."
					};
				default:		//default: english
					return {
						popout_note_text:				"Notes",
						popout_filter_channel_text:		"Channel",
						popout_filter_server_text:		"Server",
						popout_filter_all_text:			"All Servers",
						popout_sort_text:				"Sort by",
						popout_sort_messagetime_text:	"Message-Date",
						popout_sort_notetime_text:		"Note-Date",
						context_pinoption_text:			"Note Message",
						context_updateoption_text:		"Update Note",
						context_unpinoption_text:		"Remove Note",
						popout_pinoption_text:			"Note",
						toast_noteadd_text:				"Message added to notebook.",
						toast_noteupdate_text:			"Message updated in the notebook.",
						toast_noteremove_text:			"Message removed from notebook."
					};
			}
		}
	}
})();