//META{"name":"ShowHiddenChannels","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ShowHiddenChannels","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ShowHiddenChannels/ShowHiddenChannels.plugin.js"}*//

var ShowHiddenChannels = (_ => {
	var blacklist = [], hiddenCategory;
			
	const settingsMap = {
		GUILD_TEXT: "showText",
		GUILD_VOICE: "showVoice",
		GUILD_ANNOUNCEMENT: "showAnnouncement",
		GUILD_STORE: "showStore"
	};

	const typeNameMap = {
		GUILD_TEXT: "TEXT_CHANNEL",
		GUILD_VOICE: "VOICE_CHANNEL",
		GUILD_ANNOUNCEMENT: "NEWS_CHANNEL",
		GUILD_STORE: "STORE_CHANNEL"
	};

	const channelIcons = {
		GUILD_TEXT: `M 5.88657 21 C 5.57547 21 5.3399 20.7189 5.39427 20.4126 L 6.00001 17 H 2.59511 C 2.28449 17 2.04905 16.7198 2.10259 16.4138 L 2.27759 15.4138 C 2.31946 15.1746 2.52722 15 2.77011 15 H 6.35001 L 7.41001 9 H 4.00511 C 3.69449 9 3.45905 8.71977 3.51259 8.41381 L 3.68759 7.41381 C 3.72946 7.17456 3.93722 7 4.18011 7 H 7.76001 L 8.39677 3.41262 C 8.43914 3.17391 8.64664 3 8.88907 3 H 9.87344 C 10.1845 3 10.4201 3.28107 10.3657 3.58738 L 9.76001 7 H 15.76 L 16.3968 3.41262 C 16.4391 3.17391 16.6466 3 16.8891 3 H 17.8734 C 18.1845 3 18.4201 3.28107 18.3657 3.58738 L 17.76 7 H 21.1649 C 21.4755 7 21.711 7.28023 21.6574 7.58619 L 21.4824 8.58619 C 21.4406 8.82544 21.2328 9 20.9899 9 H 17.41 L 16.35 15 H 19.7549 C 20.0655 15 20.301 15.2802 20.2474 15.5862 L 20.0724 16.5862 C 20.0306 16.8254 19.8228 17 19.5799 17 H 16 L 15.3632 20.5874 C 15.3209 20.8261 15.1134 21 14.8709 21 H 13.8866 C 13.5755 21 13.3399 20.7189 13.3943 20.4126 L 14 17 H 8.00001 L 7.36325 20.5874 C 7.32088 20.8261 7.11337 21 6.87094 21 H 5.88657Z M 9.41045 9 L 8.35045 15 H 14.3504 L 15.4104 9 H 9.41045 Z`,
		GUILD_VOICE: `M 11.383 3.07904 C 11.009 2.92504 10.579 3.01004 10.293 3.29604 L 6 8.00204 H 3 C 2.45 8.00204 2 8.45304 2 9.00204 V 15.002 C 2 15.552 2.45 16.002 3 16.002 H 6 L 10.293 20.71 C 10.579 20.996 11.009 21.082 11.383 20.927 C 11.757 20.772 12 20.407 12 20.002 V 4.00204 C 12 3.59904 11.757 3.23204 11.383 3.07904Z M 14 5.00195 V 7.00195 C 16.757 7.00195 19 9.24595 19 12.002 C 19 14.759 16.757 17.002 14 17.002 V 19.002 C 17.86 19.002 21 15.863 21 12.002 C 21 8.14295 17.86 5.00195 14 5.00195Z M 14 9.00195 C 15.654 9.00195 17 10.349 17 12.002 C 17 13.657 15.654 15.002 14 15.002 V 13.002 C 14.551 13.002 15 12.553 15 12.002 C 15 11.451 14.551 11.002 14 11.002 V 9.00195 Z`,
		GUILD_ANNOUNCEMENT: `M 3.9 8.26 H 2 V 15.2941 H 3.9 V 8.26 Z M 19.1 4 V 5.12659 L 4.85 8.26447 V 18.1176 C 4.85 18.5496 5.1464 18.9252 5.5701 19.0315 L 9.3701 19.9727 C 9.4461 19.9906 9.524 20 9.6 20 C 9.89545 20 10.1776 19.8635 10.36 19.6235 L 12.7065 16.5242 L 19.1 17.9304 V 19.0588 H 21 V 4 H 19.1 Z M 9.2181 17.9944 L 6.75 17.3826 V 15.2113 L 10.6706 16.0753 L 9.2181 17.9944 Z`,
		GUILD_STORE: `M 21.707 13.293l -11 -11 C 10.519 2.105 10.266 2 10 2 H 3c -0.553 0 -1 0.447 -1 1 v 7 c 0 0.266 0.105 0.519 0.293 0.707l11 11 c 0.195 0.195 0.451 0.293 0.707 0.293 s 0.512 -0.098 0.707 -0.293l7 -7 c 0.391 -0.391 0.391 -1.023 0 -1.414 z M 7 9c -1.106 0 -2 -0.896 -2 -2 0 -1.106 0.894 -2 2 -2 1.104 0 2 0.894 2 2 0 1.104 -0.896 2 -2 2 z`,
		DEFAULT: `M 11.44 0 c 4.07 0 8.07 1.87 8.07 6.35 c 0 4.13 -4.74 5.72 -5.75 7.21 c -0.76 1.11 -0.51 2.67 -2.61 2.67 c -1.37 0 -2.03 -1.11 -2.03 -2.13 c 0 -3.78 5.56 -4.64 5.56 -7.76 c 0 -1.72 -1.14 -2.73 -3.05 -2.73 c -4.07 0 -2.48 4.19 -5.56 4.19 c -1.11 0 -2.07 -0.67 -2.07 -1.94 C 4 2.76 7.56 0 11.44 0 z M 11.28 18.3 c 1.43 0 2.61 1.17 2.61 2.61 c 0 1.43 -1.18 2.61 -2.61 2.61 c -1.43 0 -2.61 -1.17 -2.61 -2.61 C 8.68 19.48 9.85 18.3 11.28 18.3 z`
	};
	
	const userRowComponent = class UserRow extends BdApi.React.Component {
		componentDidMount() {
			if (this.props.user.fetchable) {
				this.props.user.fetchable = false;
				BDFDB.LibraryModules.UserFetchUtils.getUser(this.props.user.id).then(fetchedUser => {
					this.props.user = Object.assign({}, fetchedUser, BDFDB.LibraryModules.MemberStore.getMember(this.props.guildId, this.props.user.id) || {});
					BDFDB.ReactUtils.forceUpdate(this);
				});
			}
		}
		render() {
			return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListRow, {
				prefix: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Avatar, {
					className: BDFDB.disCN.listavatar,
					src: BDFDB.UserUtils.getAvatar(this.props.user.id),
					status: BDFDB.UserUtils.getStatus(this.props.user.id),
					size: BDFDB.LibraryComponents.Avatar.Sizes.SIZE_40
				}),
				label: [
					BDFDB.ReactUtils.createElement("span", {
						className: BDFDB.disCN.username,
						children: this.props.user.username,
						style: {color: this.props.user.colorString}
					}),
					!this.props.user.discriminator ? null : BDFDB.ReactUtils.createElement("span", {
						className: BDFDB.disCN.listdiscriminator,
						children: `#${this.props.user.discriminator}`
					})
				]
			});
		}
	};
	
	const roleRowComponent = class RoleRow extends BdApi.React.Component {
		render() {
			return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListRow, {
				prefix: BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCNS.avataricon + BDFDB.disCNS.listavatar + BDFDB.disCNS.avatariconsizemedium + BDFDB.disCN.avatariconinactive,
					style: {
						boxSizing: "border-box",
						padding: 10
					},
					children: BDFDB.ReactUtils.createElement("div", {
						style: {
							borderRadius: "50%",
							height: "100%",
							width: "100%",
							backgroundColor: BDFDB.ColorUtils.convert(this.props.role.colorString || BDFDB.DiscordConstants.Colors.PRIMARY_DARK_300, "RGB")
						}
					})
				}),
				labelClassName: this.props.role.overwritten && BDFDB.disCN.strikethrough,
				label: BDFDB.ReactUtils.createElement("span", {
					children: this.props.role.name,
					style: {color: this.props.role.colorString}
				})
			});
		}
	};
	
	return class ShowHiddenChannels {
		getName () {return "ShowHiddenChannels";}

		getVersion () {return "2.7.8";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Displays channels that are hidden from you by role restrictions.";}

		constructor () {
			this.changelog = {
				"improved":[["UserId: id...","Instead of just showing the user id when a user is not cached, the plugin now tries to fetch the user"]]
			};
			
			this.patchedModules = {
				before: {
					Channels: "render",
					ChannelCategoryItem: "render"
				},
				after: {
					ChannelItem: ["render", "componentDidMount", "componentDidUpdate"]
				}
			};
		}

		initConstructor () {
			this.defaults = {
				settings: {
					sortNative:				{value:false, 	description:"Sort hidden Channels in the native Order"},
					showText:				{value:true, 	description:"Show hidden Text Channels"},
					showVoice:				{value:true, 	description:"Show hidden Voice Channels"},
					showAnnouncement:		{value:true, 	description:"Show hidden Announcement Channels"},
					showStore:				{value:true, 	description:"Show hidden Store Channels"},
					showForNormal:			{value:false,	description:"Add Access-Overview ContextMenu Entry for non-hidden Channels"},
				}
			};
		}

		getSettingsPanel (collapseStates = {}) {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let settingsPanel, settingsItems = [];
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Settings",
				collapseStates: collapseStates,
				children: Object.keys(settings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}))
			}));
			
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
				title: "Server Black List",
				collapseStates: collapseStates,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsGuildList, {
						className: BDFDB.disCN.marginbottom20,
						disabled: BDFDB.DataUtils.load(this, "blacklist"),
						onClick: disabledGuilds => {
							this.saveBlacklist(disabledGuilds);
						}
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						type: "Button",
						className: BDFDB.disCN.marginbottom8,
						color: BDFDB.LibraryComponents.Button.Colors.GREEN,
						label: "Enable for all Servers",
						onClick: _ => {
							this.batchSetGuilds(settingsPanel, collapseStates, true);
						},
						children: BDFDB.LanguageUtils.LanguageStrings.ENABLE
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
						type: "Button",
						className: BDFDB.disCN.marginbottom8,
						color: BDFDB.LibraryComponents.Button.Colors.PRIMARY,
						label: "Disable for all Servers",
						onClick: _ => {
							this.batchSetGuilds(settingsPanel, collapseStates, false);
						},
						children: BDFDB.LanguageUtils.LanguageStrings.DISABLE
					})
				]
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
				
				let loadedBlacklist = BDFDB.DataUtils.load(this, "blacklist");
				this.saveBlacklist(!BDFDB.ArrayUtils.is(loadedBlacklist) ? [] : loadedBlacklist);
				
				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.UnreadChannelUtils, "hasUnread", {after: e => {
					return e.returnValue && !this.isChannelHidden(e.methodArguments[0]);
				}});
				
				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.UnreadChannelUtils, "getMentionCount", {after: e => {
					return this.isChannelHidden(e.methodArguments[0]) ? 0 : e.returnValue;
				}});
				
				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.CategoryCollapseStore, "isCollapsed", {after: e => {
					if (e.methodArguments[0] && e.methodArguments[0].endsWith("hidden")) return (BDFDB.DataUtils.load(this, "categorydata", "collapsed") || []).includes(e.methodArguments[0]);
				}});
				
				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.CategoryCollapseUtils, "categoryCollapse", {before: e => {
					if (e.methodArguments[0] && e.methodArguments[0].endsWith("hidden")) {
						let collapsed = BDFDB.DataUtils.load(this, "categorydata", "collapsed") || [];
						if (!collapsed.includes(e.methodArguments[0])) {
							collapsed.push(e.methodArguments[0]);
							BDFDB.DataUtils.save(collapsed, this, "categorydata", "collapsed");
						}
					}
				}});
				
				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.CategoryCollapseUtils, "categoryExpand", {before: e => {
					if (e.methodArguments[0] && e.methodArguments[0].endsWith("hidden")) {
						let collapsed = BDFDB.DataUtils.load(this, "categorydata", "collapsed") || [];
						if (collapsed.includes(e.methodArguments[0])) {
							BDFDB.ArrayUtils.remove(collapsed, e.methodArguments[0], true);
							BDFDB.DataUtils.save(collapsed, this, "categorydata", "collapsed");
						}
					}
				}});
				
				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.GuildChannelStore, "getTextChannelNameDisambiguations", {after: e => {
					let all = BDFDB.LibraryModules.ChannelStore.getChannels();
					for (let channel_id in all) if (all[channel_id].guild_id == e.methodArguments[0] && !e.returnValue[channel_id] && (all[channel_id].type != BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY && all[channel_id].type != BDFDB.DiscordConstants.ChannelTypes.GUILD_VOICE)) e.returnValue[channel_id] = {id: channel_id, name: all[channel_id].name};
				}});

				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.ModuleUtils.forceAllUpdates(this);
				
				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions

		onSettingsClosed (instance, wrapper, returnvalue) {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;

				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
		}
		
		onChannelContextMenu (e) {
			if (e.instance.props.channel) {
				if (e.instance.props.channel.id.endsWith("hidden") && e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "ChannelMuteItem"});
					if (index > -1) children.splice(index, 1);
				}
				let isHidden = this.isChannelHidden(e.instance.props.channel.id);
				if (isHidden || BDFDB.DataUtils.get(this, "settings", "showForNormal")) {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
					children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.CHANNEL + " " + BDFDB.LanguageUtils.LanguageStrings.ACCESSIBILITY,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "permissions"),
							action: _ => {
								BDFDB.ContextMenuUtils.close(e.instance);
								this.showAccessModal(e.instance.props.channel, !isHidden);
							}
						})
					}));
				}
			}
		}
		
		processChannels (e) {
			if (!e.instance.props.guild || blacklist.includes(e.instance.props.guild.id)) return;
			let [hiddenChannels, amount] = this.getHiddenChannels(e.instance.props.guild);
			if (amount) {
				e.instance.props.categories = Object.assign({}, e.instance.props.categories);
				for (let catId in e.instance.props.categories) e.instance.props.categories[catId] = [].concat(e.instance.props.categories[catId]);
				e.instance.props.channels = Object.assign({}, e.instance.props.channels);
				for (let type in e.instance.props.channels) e.instance.props.channels[type] = [].concat(e.instance.props.channels[type]);
					
				let hiddenId = e.instance.props.guild.id + "_hidden";
				
				delete e.instance.props.categories[hiddenId];
				e.instance.props.categories._categories = e.instance.props.categories._categories.filter(n => n.channel.id != hiddenId);
				e.instance.props.channels[BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY] = e.instance.props.channels[BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY].filter(n => n.channel.id != hiddenId);
				
				let settings = BDFDB.DataUtils.get(this, "settings"), index = -1;
				for (let catId in e.instance.props.categories) {
					if (catId != "_categories") e.instance.props.categories[catId] = e.instance.props.categories[catId].filter(n => !this.isChannelHidden(n.channel.id));
					for (let channelObj of e.instance.props.categories[catId]) if (channelObj.index > index) index = parseInt(channelObj.index);
				}
				if (!settings.sortNative) {
					hiddenCategory = new BDFDB.DiscordObjects.Channel({
						guild_id: e.instance.props.guild.id,
						id: hiddenId,
						name: "hidden",
						type: BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY
					});
					e.instance.props.categories[hiddenId] = [];
					e.instance.props.categories._categories.push({
						channel: hiddenCategory,
						index: ++index
					});
					e.instance.props.channels[BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY].push({
						comparator: (e.instance.props.channels[BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY][e.instance.props.channels[BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY].length - 1] || {comparator: 0}).comparator + 1,
						channel: hiddenCategory
					});
				}
				else hiddenCategory = null;
					
				for (let type in hiddenChannels) {
					let channelType = type == BDFDB.DiscordConstants.ChannelTypes.GUILD_TEXT && e.instance.props.channels.SELECTABLE ? "SELECTABLE" : type;
					if (!BDFDB.ArrayUtils.is(e.instance.props.channels[channelType])) e.instance.props.channels[channelType] = [];
					for (let channel of hiddenChannels[type]) {
						let hiddenChannel = new BDFDB.DiscordObjects.Channel(Object.assign({}, channel, {
							parent_id: hiddenCategory ? hiddenId : channel.parent_id
						}));
						let parent_id = hiddenChannel.parent_id || "null";
						e.instance.props.categories[parent_id].push({
							channel: hiddenChannel,
							index: hiddenChannel.position
						});
						e.instance.props.channels[channelType].push({
							comparator: hiddenChannel.position,
							channel: hiddenChannel
						});
					}
				}
				
				for (let parent_id in e.instance.props.categories) BDFDB.ArrayUtils.keySort(e.instance.props.categories[parent_id], "index");
				for (let channelType in e.instance.props.channels) BDFDB.ArrayUtils.keySort(e.instance.props.channels[channelType], "comparator");
			}
		}
		
		processChannelCategoryItem (e) {
			if (hiddenCategory && e.instance.props.channel && !e.instance.props.channel.id && e.instance.props.channel.type != BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY) e.instance.props.channel = hiddenCategory;
		}
		
		processChannelItem (e) {
			if (e.node) {
				if (e.instance.props.className.indexOf(BDFDB.disCN.channelmodelocked) == -1) BDFDB.DOMUtils.removeClass(e.node, BDFDB.disCN.channelmodelocked);
				e.node.removeEventListener("click", BDFDB.ListenerUtils.stopEvent);
				e.node.removeEventListener("mousedown", BDFDB.ListenerUtils.stopEvent);
				e.node.removeEventListener("mouseup", BDFDB.ListenerUtils.stopEvent);
			}
			if (e.instance.props.channel && this.isChannelHidden(e.instance.props.channel.id)) {
				if (e.returnvalue) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "Icon"});
					if (index > -1) children[index] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						nativeClass: true,
						iconSVG: `<svg class="${BDFDB.disCN.channelicon}" width="24" height="24" viewBox="0 0 24 24"><mask id="${this.name + e.instance.props.channel.id}" fill="black"><path d="M 0 0 H 24 V 24 H 0 Z" fill="white"></path><path d="M24 0 H 13 V 12 H 24 Z" fill="black"></path></mask><path mask="url(#${this.name + e.instance.props.channel.id})" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="${this.channelIcons[BDFDB.DiscordConstants.ChannelTypes[e.instance.props.channel.type]] || this.channelIcons.DEFAULT}"></path><path fill="currentColor" d="M 21.025 5 V 4 C 21.025 2.88 20.05 2 19 2 C 17.95 2 17 2.88 17 4 V 5 C 16.4477 5 16 5.44772 16 6 V 9 C 16 9.55228 16.4477 10 17 10 H 19 H 21 C 21.5523 10 22 9.55228 22 9 V 5.975C22 5.43652 21.5635 5 21.025 5 Z M 20 5 H 18 V 4 C 18 3.42857 18.4667 3 19 3 C 19.5333 3 20 3.42857 20 4 V 5 Z"></path></svg>`
					});
					[children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props:[["className", BDFDB.disCN.channelchildren]]});
					if (index > -1 && children[index].props && children[index].props.children) {
						children[index].props.children = [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: BDFDB.LanguageUtils.LanguageStrings.CHANNEL_LOCKED_SHORT,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									className: BDFDB.disCN.channelactionicon,
									name: BDFDB.LibraryComponents.SvgIcon.Names.LOCK_CLOSED
								})
							})
						})];
					}
				}
				if (e.node) {
					BDFDB.DOMUtils.addClass(e.node, BDFDB.disCN.channelmodelocked);
					e.node.addEventListener("click", BDFDB.ListenerUtils.stopEvent);
					e.node.addEventListener("mousedown", BDFDB.ListenerUtils.stopEvent);
					e.node.addEventListener("mouseup", BDFDB.ListenerUtils.stopEvent);
				}
			}
		}
		
		isChannelHidden (channelId) {
			return !BDFDB.DMUtils.isDMChannel(channelId) && !BDFDB.UserUtils.can("VIEW_CHANNEL", BDFDB.UserUtils.me.id, channelId);
		}
		
		getHiddenChannels (guild) {
			if (!guild) return [{}, 0];
			let settings = BDFDB.DataUtils.get(this, "settings");
			let all = BDFDB.LibraryModules.ChannelStore.getChannels(), hidden = {}, amount = 0;
			for (let type in BDFDB.DiscordConstants.ChannelTypes) hidden[BDFDB.DiscordConstants.ChannelTypes[type]] = [];
			for (let channel_id in all) {
				let channel = all[channel_id];
				if (channel.guild_id == guild.id && channel.type != BDFDB.DiscordConstants.ChannelTypes.GUILD_CATEGORY && (settings[settingsMap[BDFDB.DiscordConstants.ChannelTypes[channel.type]]] || settings[settingsMap[BDFDB.DiscordConstants.ChannelTypes[channel.type]]] === undefined) && this.isChannelHidden(channel.id)) {
					amount++;
					hidden[channel.type].push(channel);
				}
			}
			return [hidden, amount];
		}
		
		batchSetGuilds (settingsPanel, collapseStates, value) {
			if (!value) {
				for (let id of BDFDB.LibraryModules.FolderStore.getFlattenedGuildIds()) blacklist.push(id);
				this.saveBlacklist(BDFDB.ArrayUtils.removeCopies(blacklist));
			}
			else this.saveBlacklist([]);
			BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
		}
		
		saveBlacklist (savedBlacklist) {
			blacklist = savedBlacklist;
			BDFDB.DataUtils.save(savedBlacklist, this, "blacklist");
		}
		
		showAccessModal (channel, allowed) {
			let guild = BDFDB.LibraryModules.GuildStore.getGuild(channel.guild_id);
			let myMember = guild && BDFDB.LibraryModules.MemberStore.getMember(guild.id, BDFDB.UserUtils.me.id);
			if (myMember) {
				let category = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.ChannelStore.getChannel(channel.id).parent_id);
				let lightTheme = BDFDB.DiscordUtils.getTheme() == BDFDB.disCN.themelight;
				let allowedRoles = [], allowedUsers = [], deniedRoles = [], deniedUsers = [], everyoneDenied = false;
				for (let id in channel.permissionOverwrites) {
					if (channel.permissionOverwrites[id].type == "role" && (guild.roles[id] && guild.roles[id].name != "@everyone") && ((channel.permissionOverwrites[id].allow | BDFDB.DiscordConstants.Permissions.VIEW_CHANNEL) == channel.permissionOverwrites[id].allow || (channel.permissionOverwrites[id].allow | BDFDB.DiscordConstants.Permissions.CONNECT) == channel.permissionOverwrites[id].allow)) {
						allowedRoles.push(Object.assign({overwritten: myMember.roles.includes(id) && !allowed}, guild.roles[id]));
					}
					else if (channel.permissionOverwrites[id].type == "member" && ((channel.permissionOverwrites[id].allow | BDFDB.DiscordConstants.Permissions.VIEW_CHANNEL) == channel.permissionOverwrites[id].allow || (channel.permissionOverwrites[id].allow | BDFDB.DiscordConstants.Permissions.CONNECT) == channel.permissionOverwrites[id].allow)) {
						let user = BDFDB.LibraryModules.UserStore.getUser(id);
						if (user) allowedUsers.push(Object.assign({}, user, BDFDB.LibraryModules.MemberStore.getMember(guild.id, id) || {}));
						else allowedUsers.push({id: id, username: `UserId: ${id}`, fetchable: true});
					}
					if (channel.permissionOverwrites[id].type == "role" && ((channel.permissionOverwrites[id].deny | BDFDB.DiscordConstants.Permissions.VIEW_CHANNEL) == channel.permissionOverwrites[id].deny || (channel.permissionOverwrites[id].deny | BDFDB.DiscordConstants.Permissions.CONNECT) == channel.permissionOverwrites[id].deny)) {
						deniedRoles.push(guild.roles[id]);
						if (guild.roles[id] && guild.roles[id].name == "@everyone") everyoneDenied = true;
					}
					else if (channel.permissionOverwrites[id].type == "member" && ((channel.permissionOverwrites[id].deny | BDFDB.DiscordConstants.Permissions.VIEW_CHANNEL) == channel.permissionOverwrites[id].deny || (channel.permissionOverwrites[id].deny | BDFDB.DiscordConstants.Permissions.CONNECT) == channel.permissionOverwrites[id].deny)) {
						let user = BDFDB.LibraryModules.UserStore.getUser(id);
						if (user) deniedUsers.push(Object.assign({}, user, BDFDB.LibraryModules.MemberStore.getMember(guild.id, id) || {}));
						else deniedUsers.push({id: id, username: `UserId: ${id}`, fetchable: true});
					}
				}
				if (allowed && !everyoneDenied) allowedRoles.push({name: "@everyone"});
				let allowedElements = [], deniedElements = [];
				for (let role of allowedRoles) allowedElements.push(BDFDB.ReactUtils.createElement(roleRowComponent, {role: role, guildId: guild.id, channelId: channel.id}));
				for (let user of allowedUsers) allowedElements.push(BDFDB.ReactUtils.createElement(userRowComponent, {user: user, guildId: guild.id, channelId: channel.id}));
				for (let role of deniedRoles) deniedElements.push(BDFDB.ReactUtils.createElement(roleRowComponent, {role: role, guildId: guild.id, channelId: channel.id}));
				for (let user of deniedUsers) deniedElements.push(BDFDB.ReactUtils.createElement(userRowComponent, {user: user, guildId: guild.id, channelId: channel.id}));
				
				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: BDFDB.LanguageUtils.LanguageStrings.CHANNEL + " " + BDFDB.LanguageUtils.LanguageStrings.ACCESSIBILITY,
					subheader: "#" + channel.name,
					contentClassName: BDFDB.disCN.listscroller,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							className: BDFDB.disCN.modalsubinner,
							tab: BDFDB.LanguageUtils.LanguageStrings.OVERLAY_SETTINGS_GENERAL_TAB,
							children: [{
									title: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_CHANNEL_NAME,
									text: channel.name
								}, {
									title: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_CHANNEL_TOPIC,
									text: channel.topic || BDFDB.LanguageUtils.LanguageStrings.CHANNEL_TOPIC_EMPTY
								}, {
									title: BDFDB.LanguageUtils.LanguageStrings.CHANNEL_TYPE,
									text: BDFDB.LanguageUtils.LanguageStrings[typeNameMap[BDFDB.DiscordConstants.ChannelTypes[channel.type]]]
								}, {
									title: BDFDB.LanguageUtils.LanguageStrings.CATEGORY_NAME,
									text: category && category.name || BDFDB.LanguageUtils.LanguageStrings.NO_CATEGORY
								}].map((formlabel, i) => [,
									i == 0 ? null : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
										className: BDFDB.disCN.marginbottom20
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
										title: `${formlabel.title}:`,
										className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.marginbottom20, i == 0 && BDFDB.disCN.margintop8),
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormText, {
											className: BDFDB.disCN.marginleft8,
											children: formlabel.text
										})
									})
								]).flat(10).filter(n => n)
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_allowed_text,
							children: allowedElements.length ? allowedElements :
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MessagesPopoutComponents.EmptyStateBottom, {
									msg: BDFDB.LanguageUtils.LanguageStrings.AUTOCOMPLETE_NO_RESULTS_HEADER,
									image: lightTheme ? "/assets/9b0d90147f7fab54f00dd193fe7f85cd.svg" : "/assets/308e587f3a68412f137f7317206e92c2.svg"
								})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_denied_text,
							children: deniedElements.length ? deniedElements :
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.MessagesPopoutComponents.EmptyStateBottom, {
									msg: BDFDB.LanguageUtils.LanguageStrings.AUTOCOMPLETE_NO_RESULTS_HEADER,
									image: lightTheme ? "/assets/9b0d90147f7fab54f00dd193fe7f85cd.svg" : "/assets/308e587f3a68412f137f7317206e92c2.svg"
								})
						})
					]
				});
			}
		}

		setLabelsByLanguage () {
			switch (BDFDB.LanguageUtils.getLanguage().id) {
				case "hr":		//croatian
					return {
						modal_allowed_text:				"Dopušteno",
						modal_denied_text:				"Odbijen"
					};
				case "da":		//danish
					return {
						modal_allowed_text:				"Odbijen",
						modal_denied_text:				"Nægtet"
					};
				case "de":		//german
					return {
						modal_allowed_text:				"Erlaubt",
						modal_denied_text:				"Verweigert"
					};
				case "es":		//spanish
					return {
						modal_allowed_text:				"Permitido",
						modal_denied_text:				"Negado"
					};
				case "fr":		//french
					return {
						modal_allowed_text:				"Permis",
						modal_denied_text:				"Nié"
					};
				case "it":		//italian
					return {
						modal_allowed_text:				"Permesso",
						modal_denied_text:				"Negato"
					};
				case "nl":		//dutch
					return {
						modal_allowed_text:				"Toegestaan",
						modal_denied_text:				"Ontkend"
					};
				case "no":		//norwegian
					return {
						modal_allowed_text:				"Tillatt",
						modal_denied_text:				"Benektet"
					};
				case "pl":		//polish
					return {
						modal_allowed_text:				"Dozwolony",
						modal_denied_text:				"Odmówiono"
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						modal_allowed_text:				"Permitido",
						modal_denied_text:				"Negado"
					};
				case "fi":		//finnish
					return {
						modal_allowed_text:				"Sallittu",
						modal_denied_text:				"Evätty"
					};
				case "sv":		//swedish
					return {
						modal_allowed_text:				"Tillåten",
						modal_denied_text:				"Nekas"
					};
				case "tr":		//turkish
					return {
						modal_allowed_text:				"Izin",
						modal_denied_text:				"Inkar"
					};
				case "cs":		//czech
					return {
						modal_allowed_text:				"Povoleno",
						modal_denied_text:				"Odepřeno"
					};
				case "bg":		//bulgarian
					return {
						modal_allowed_text:				"Позволен",
						modal_denied_text:				"Отказан"
					};
				case "ru":		//russian
					return {
						modal_allowed_text:				"Разрешается",
						modal_denied_text:				"Отказано"
					};
				case "uk":		//ukrainian
					return {
						modal_allowed_text:				"Дозволено",
						modal_denied_text:				"Заперечували"
					};
				case "ja":		//japanese
					return {
						modal_allowed_text:				"許可された",
						modal_denied_text:				"拒否されました"
					};
				case "zh-TW":	//chinese (traditional)
					return {
						modal_allowed_text:				"允許的",
						modal_denied_text:				"被拒絕"
					};
				case "ko":		//korean
					return {
						modal_allowed_text:				"허용됨",
						modal_denied_text:				"거부"
					};
				default:		//default: english
					return {
						modal_allowed_text:				"Permitted",
						modal_denied_text:				"Denied"
					};
			}
		}
	}
})();