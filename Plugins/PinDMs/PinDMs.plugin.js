//META{"name":"PinDMs","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/PinDMs","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/PinDMs/PinDMs.plugin.js"}*//

var PinDMs = (_ => {
	return class PinDMs {
		getName () {return "PinDMs";}

		getVersion () {return "1.6.3";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Allows you to pin DMs, making them appear at the top of your DMs/Guild-list.";}

		constructor () {
			this.changelog = {
				"fixed":[["Pin Icon","Fixed Pin Icon not showing in stable and causing a crash in canary"]]
			};

			this.patchedModules = {
				before: {
					PrivateChannelsList: "render",
					UnreadDMs: "render"
				},
				after: {
					PrivateChannelsList: "render",
					UnreadDMs: "render",
					PrivateChannel: ["render", "componentDidMount"],
					DirectMessage: ["render", "componentDidMount", "componentWillUnmount"]
				}
			};
		}

		initConstructor () {
			this.css = `
				${BDFDB.dotCNS.dmchannel + BDFDB.dotCN.namecontainerchildren} {
					display: flex;
				}
				${BDFDB.dotCN.dmchannel}:hover ${BDFDB.dotCN._pindmsunpinbutton} {
					display: block;
				}
				${BDFDB.dotCN._pindmspinnedchannelsheadercontainer} {
					display: flex;
					cursor: pointer;
				}
				${BDFDB.dotCNS._pindmspinnedchannelsheadercontainer + BDFDB.dotCN.dmchannelheadertext}  {
					margin-right: 6px;
				}
				${BDFDB.dotCN._pindmspinnedchannelsheadercontainer + BDFDB.dotCN._pindmspinnedchannelsheadercolored}:hover ${BDFDB.dotCN.dmchannelheadertext} {
					filter: brightness(150%);
				}
				${BDFDB.dotCNS._pindmspinnedchannelsheadercontainer + BDFDB.dotCN._pindmspinnedchannelsheaderamount}  {
					position: relative;
					top: -1px;
					margin-right: 6px;
				}
				${BDFDB.dotCN._pindmspinnedchannelsheaderarrow} {
					flex: 0;
					width: 16px;
					height: 16px;
					margin-left: 0;
					margin-right: 2px;
				}
				${BDFDB.dotCNS._pindmspinnedchannelsheadercollapsed + BDFDB.dotCN._pindmspinnedchannelsheaderarrow + BDFDB.dotCN.channelheadericonwrapper} {
					transform: rotate(-90deg);
				}
				${BDFDB.dotCN._pindmsunpinbutton} {
					display: none;
					width: 16px;
					height: 16px;
					opacity: .7;
					margin: 2px;
				}
				${BDFDB.dotCN._pindmsunpinbutton}:hover {
					opacity: 1;
				}
				${BDFDB.dotCN._pindmsunpinicon} {
					display: block;
					width: 16px;
					height: 16px;
				}
				${BDFDB.dotCNS._pindmsdmchannelplaceholder + BDFDB.dotCN.namecontainerlayout} {
					box-sizing: border-box;
					border: 1px dashed currentColor;
				}
				${BDFDB.dotCN._pindmspinnedchannelsheadercontainer + BDFDB.dotCNS._pindmsdmchannelplaceholder} {
					margin-left: 8px;
					height: 12px;
					box-sizing: border-box;
					border: 1px dashed currentColor;
				}
				${BDFDB.dotCN._pindmsdragpreview} {
					pointer-events: none !important;
					position: absolute !important;
					opacity: 0.5 !important;
					z-index: 10000 !important;
				}`;

			this.defaults = {
				settings: {
					sortInRecentOrder:		{value:false, 	inner:true,		description:"Channel List"},
					sortInRecentOrderGuild:	{value:false, 	inner:true,		description:"Guild List"},
					showPinIcon:			{value:true, 	inner:false,	description:"Shows a little 'Pin' icon for pinned DMs in the server list:"},
					showCategoryUnread:		{value:true, 	inner:false,	description:"Shows the amount of unread Messages in a category in the channel list:"},
					showCategoryAmount:		{value:true, 	inner:false,	description:"Shows the amount of pinned DMs in a category in the channel list:"}
				}
			};
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let settingspanel, settingsitems = [], inneritems = [];
			
			for (let key in settings) (!this.defaults.settings[key].inner ? settingsitems : inneritems).push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
			}));
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
				title: "Sort pinned DMs in the recent message order instead of the pinned at order in:",
				first: settingsitems.length == 0,
				children: inneritems
			}));
			settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
				type: "Button",
				className: BDFDB.disCN.marginbottom8,
				color: BDFDB.LibraryComponents.Button.Colors.RED,
				label: "Unpin all pinned DMs",
				onClick: _ => {
					BDFDB.ModalUtils.confirm(this, "Are you sure you want to unpin all pinned DMs?", _ => {
						BDFDB.DataUtils.remove(this, "dmCategories");
						BDFDB.DataUtils.remove(this, "pinnedRecents");
					});
				},
				children: BDFDB.LanguageUtils.LanguageStrings.UNPIN
			}));
			
			return settingspanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
		}

		//legacy
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

				this.forceUpdateAll(true);
				
				let unreadDMsInstance = BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.app), {name:"UnreadDMs", unlimited:true});
				if (unreadDMsInstance) {
					delete unreadDMsInstance.props.pinnedPrivateChannelIds;
					unreadDMsInstance.props.unreadPrivateChannelIds = BDFDB.LibraryModules.DirectMessageUnreadStore.getUnreadPrivateChannelIds();
					BDFDB.ReactUtils.forceUpdate(unreadDMsInstance);
				}

				BDFDB.PluginUtils.clear(this);
			}
		}


		// begin of own functions

		onSettingsClosed (instance, wrapper, returnvalue) {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				this.forceUpdateAll();
			}
		}

		onUserContextMenu (e) {
			if (e.instance.props.user) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:"UserCloseChatItem"});
				if (index > -1) {
					let id = BDFDB.LibraryModules.ChannelStore.getDMFromUserId(e.instance.props.user.id);
					if (id) this.injectItem(e.instance, id, children, index);
				}
			}
		}

		onGroupDMContextMenu (e) {
			if (e.instance.props.channelId) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:"ChangeIcon"});
				if (index > -1) this.injectItem(e.instance, e.instance.props.channelId, children, index);
			}
		}

		injectItem (instance, id, children, index) {
			let pinnedInGuild = this.isPinned(id, "pinnedRecents");
			
			let categories = this.sortAndUpdateCategories("dmCategories", true);
			let currentCategory = this.getCategory(id, "dmCategories");
			
			children.splice(index, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Sub, {
				label: this.labels.context_pindm_text,
				render: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Sub, {
						label: this.labels.context_pinchannel_text,
						render: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Group, {
								children: currentCategory ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
									label: this.labels.context_unpinchannel_text,
									danger: true,
									action: _ => {
										BDFDB.ContextMenuUtils.close(instance);
										this.removeFromCategory(id, currentCategory, "dmCategories");
									}
								}) : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
									label: this.labels.context_addtonewcategory_text,
									brand: true,
									action: _ => {
										BDFDB.ContextMenuUtils.close(instance);
										this.openCategorySettingsModal({
											id: this.generateID("dmCategories").toString(),
											name: `${this.labels.header_pinneddms_text} #${categories.length + 1}`,
											dms: [id],
											pos: categories.length,
											collapsed: false,
											color: null
										}, "dmCategories", true);
									}
								})
							}),
							categories.length ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Group, {
								children: categories.map(category => currentCategory && currentCategory.id == category.id ? null : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
									label: category.name || this.labels.header_pinneddms_text,
									action: _ => {
										BDFDB.ContextMenuUtils.close(instance);
										if (currentCategory) this.removeFromCategory(id, currentCategory, "dmCategories");
										this.addToCategory(id, category, "dmCategories");
									}
								})).filter(n => n)
							}) : null
						].filter(n => n)
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
						label: this.labels[pinnedInGuild ? "context_unpinguild_text" : "context_pinguild_text"],
						danger: pinnedInGuild,
						action: _ => {
							BDFDB.ContextMenuUtils.close(instance);
							if (!pinnedInGuild) this.addPin(id, "pinnedRecents");
							else this.removePin(id, "pinnedRecents");
						}
					})
				]
			}));
		}

		processPrivateChannelsList (e) {
			let categories = this.sortAndUpdateCategories("dmCategories", true);
			if (categories.length) {
				if (this.draggedCategory && this.releasedCategory) {
					let draggedCategory = categories.find(n => n.id == this.draggedCategory);
					let releasedCategory = categories.find(n => n.id == this.releasedCategory);
					if (draggedCategory && releasedCategory) {
						BDFDB.ArrayUtils.remove(categories, draggedCategory, true);
						categories.splice(categories.indexOf(releasedCategory) + 1, 0, draggedCategory);
						let newCategories = {}, newPos = 0;
						for (let category of [].concat(categories).reverse()) newCategories[category.id] = Object.assign(category, {pos:newPos++});
						BDFDB.DataUtils.save(newCategories, this, "dmCategories");
					}
					delete this.draggedCategory;
					delete this.releasedCategory;
				}
				e.instance.props.channels = Object.assign({}, e.instance.props.channels);
				e.instance.props.pinnedChannels = Object.assign({}, e.instance.props.pinnedChannels);
				e.instance.props.privateChannelIds = [].concat(e.instance.props.privateChannelIds).filter(n => n);
				for (let category of categories) for (let id of this.sortDMsByTime(category.dms, "dmCategories")) if (e.instance.props.channels[id]) {
					e.instance.props.pinnedChannels[id] = e.instance.props.channels[id];
					delete e.instance.props.channels[id];
					BDFDB.ArrayUtils.remove(e.instance.props.privateChannelIds, id, true);
					e.instance.props.privateChannelIds.unshift(id);
				}
				if (e.returnvalue) {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "ListSectionItem"});
					if (index > -1) {
						if (this.draggedChannel && this.releasedChannel) {
							let categoryId = this.releasedChannel.split("header_")[1];
							let category = categories.find(n => categoryId != undefined ? n.id == categoryId : n.dms.includes(this.releasedChannel));
							if (category) {
								BDFDB.ArrayUtils.remove(category.dms, this.draggedChannel, true);
								category.dms.splice(categoryId != undefined ? 0 : category.dms.indexOf(this.releasedChannel) + 1, 0, this.draggedChannel);
								BDFDB.DataUtils.save(category, this, "dmCategories", category.id);
							}
							delete this.draggedChannel;
							delete this.releasedChannel;
						}
						let settings = BDFDB.DataUtils.get(this, "settings");
						for (let category of categories) if (this.draggedCategory != category.id) {
							let color = BDFDB.ColorUtils.convert(category.color, "RGBA");
							let foundDMs = this.filterDMs(category.dms);
							let unreadAmount = settings.showCategoryUnread && BDFDB.ArrayUtils.sum(foundDMs.map(id => BDFDB.LibraryModules.UnreadChannelUtils.getMentionCount(id)));
							children.splice(index++, 0, BDFDB.ReactUtils.createElement("header", {
								className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.dmchannelheader, BDFDB.disCN._pindmspinnedchannelsheadercontainer, category.collapsed && BDFDB.disCN._pindmspinnedchannelsheadercollapsed, color && BDFDB.disCN._pindmspinnedchannelsheadercolored, BDFDB.disCN.namecontainernamecontainer),
								categoryId: category.id,
								onMouseDown: event => {
									let node = BDFDB.DOMUtils.getParent(BDFDB.dotCN._pindmspinnedchannelsheadercontainer, event.target).cloneNode(true);
									let mousemove = event2 => {
										if (Math.sqrt((event.pageX - event2.pageX)**2) > 20 || Math.sqrt((event.pageY - event2.pageY)**2) > 20) {
											BDFDB.ListenerUtils.stopEvent(event);
											this.draggedCategory = category.id;
											this.updateContainer("dmCategories");
											let dragpreview = this.createDragPreview(node, event2);
											document.removeEventListener("mousemove", mousemove);
											document.removeEventListener("mouseup", mouseup);
											let dragging = event3 => {
												this.updateDragPreview(dragpreview, event3);
												let placeholder = BDFDB.DOMUtils.getParent(BDFDB.dotCN._pindmsdmchannelplaceholder, event3.target);
												let categoryNode = BDFDB.DOMUtils.getParent(BDFDB.dotCN._pindmspinnedchannelsheadercontainer, placeholder ? placeholder.previousSibling : event3.target);
												let hoveredCategory = categoryNode && categoryNode.getAttribute("categoryId");
												let update = hoveredCategory != this.hoveredCategory;
												if (hoveredCategory) this.hoveredCategory = hoveredCategory;
												else delete this.hoveredCategory; 
												if (update) this.updateContainer("dmCategories");
											};
											let releasing = event3 => {
												BDFDB.DOMUtils.remove(dragpreview);
												if (this.hoveredCategory) this.releasedCategory = this.hoveredCategory;
												else delete this.draggedCategory;
												delete this.hoveredCategory;
												this.updateContainer("dmCategories");
												document.removeEventListener("mousemove", dragging);
												document.removeEventListener("mouseup", releasing);
											};
											document.addEventListener("mousemove", dragging);
											document.addEventListener("mouseup", releasing);
										}
									};
									let mouseup = _ => {
										document.removeEventListener("mousemove", mousemove);
										document.removeEventListener("mouseup", mouseup);
									};
									document.addEventListener("mousemove", mousemove);
									document.addEventListener("mouseup", mouseup);
								},
								onClick: _ => {
									if (foundDMs.length || !category.collapsed) {
										category.collapsed = !category.collapsed;
										BDFDB.DataUtils.save(category, this, "dmCategories", category.id);
										BDFDB.ReactUtils.forceUpdate(e.instance);
									}
								},
								onContextMenu: event => {
									BDFDB.ContextMenuUtils.open(this, event, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Group, {
										children: [
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
												label: BDFDB.LanguageUtils.LanguageStrings.CATEGORY_SETTINGS,
												action: event2 => {
													BDFDB.ContextMenuUtils.close(BDFDB.DOMUtils.getParent(BDFDB.dotCN.contextmenu, event2.target));
													this.openCategorySettingsModal(category, "dmCategories");
												}
											}),
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItems.Item, {
												label: BDFDB.LanguageUtils.LanguageStrings.DELETE_CATEGORY,
												danger: true,
												action: event2 => {
													BDFDB.ContextMenuUtils.close(BDFDB.DOMUtils.getParent(BDFDB.dotCN.contextmenu, event2.target));
													BDFDB.DataUtils.remove(this, "dmCategories", category.id);
													this.updateContainer("dmCategories");
												}
											})
										]
									}));
								},
								children: [
									BDFDB.ObjectUtils.is(color) ? BDFDB.ReactUtils.createElement("span", {
										className: BDFDB.disCN.dmchannelheadertext,
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
											gradient: BDFDB.ColorUtils.createGradient(color),
											children: category.name
										})
									}) : BDFDB.ReactUtils.createElement("span", {
										className: BDFDB.disCN.dmchannelheadertext,
										style: {color: color},
										children: category.name,
									}),
									unreadAmount ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.NumberBadge, {
										className: BDFDB.disCN._pindmspinnedchannelsheaderamount,
										count: unreadAmount,
										style: {backgroundColor: BDFDB.DiscordConstants.Colors.STATUS_RED}
									}) : null,
									settings.showCategoryAmount ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.NumberBadge, {
										className: BDFDB.disCN._pindmspinnedchannelsheaderamount,
										count: foundDMs.length,
										style: {backgroundColor: BDFDB.DiscordConstants.Colors.BRAND}
									}) : null,
									BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCNS._pindmspinnedchannelsheaderarrow + BDFDB.disCNS.channelheadericonwrapper + BDFDB.disCN.channelheadericonclickable,
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
											className: BDFDB.disCNS._pindmspinnedchannelsheaderarrow + BDFDB.disCN.channelheadericon,
											nativeClass: true,
											iconSVG: `<svg width="24" height="24" viewBox="4 4 16 16"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M16.59 8.59004L12 13.17L7.41 8.59004L6 10L12 16L18 10L16.59 8.59004Z"></path></svg>`
										})
									})
								].filter(n => n)
							}));
							if (this.hoveredChannel == "header_" + category.id) children.splice(index++, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListItem, {
								className: BDFDB.disCNS.dmchannel + BDFDB.disCNS._pindmsdmchannelpinned + BDFDB.disCN._pindmsdmchannelplaceholder
							}));
							for (let id of this.sortDMsByTime(foundDMs, "dmCategories")) {
								if (e.instance.props.pinnedChannels[id] && this.draggedChannel != id && (!category.collapsed || e.instance.props.selectedChannelId == id)) {
									children.splice(index++, 0, e.instance.props.renderChannel(e.instance.props.pinnedChannels[id], e.instance.props.selectedChannelId == id));
									if (this.hoveredChannel == id) children.splice(index++, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListItem, {
										className: BDFDB.disCNS.dmchannel + BDFDB.disCNS._pindmsdmchannelpinned + BDFDB.disCN._pindmsdmchannelplaceholder
									}));
								}
								else BDFDB.ArrayUtils.remove(e.instance.props.privateChannelIds, id, true);
							}
							if (this.hoveredCategory == category.id) children.splice(index++, 0, BDFDB.ReactUtils.createElement("header", {
								className: BDFDB.disCNS.dmchannelheader + BDFDB.disCNS._pindmspinnedchannelsheadercontainer + BDFDB.disCNS._pindmsdmchannelplaceholder + BDFDB.disCN.namecontainernamecontainer
							}));
						}
					}
				}
			}
		}

		processUnreadDMs (e) {
			e.instance.props.pinnedPrivateChannelIds = [];
			let sortedRecents = this.sortAndUpdate("pinnedRecents");
			if (sortedRecents.length) {
				e.instance.props.unreadPrivateChannelIds = [];
				for (let pos in sortedRecents) {
					let id = sortedRecents[pos];
					if (e.instance.props.channels[id]) {
						if (!e.instance.props.pinnedPrivateChannelIds.includes(id)) e.instance.props.pinnedPrivateChannelIds.push(id);
						if (!e.instance.props.unreadPrivateChannelIds.includes(id)) e.instance.props.unreadPrivateChannelIds.push(id);
					}
				}
				e.instance.props.unreadPrivateChannelIds = e.instance.props.unreadPrivateChannelIds.concat(BDFDB.LibraryModules.DirectMessageUnreadStore.getUnreadPrivateChannelIds());
				if (e.returnvalue) {
					if (this.draggedChannel && this.releasedChannel) {
						let pinnedPrivateChannelIds = [].concat(e.instance.props.pinnedPrivateChannelIds), newData = {};
						BDFDB.ArrayUtils.remove(pinnedPrivateChannelIds, this.draggedChannel, true);
						pinnedPrivateChannelIds.splice(pinnedPrivateChannelIds.indexOf(this.releasedChannel) + 1, 0, this.draggedChannel);
						for (let pos in pinnedPrivateChannelIds) newData[pinnedPrivateChannelIds[pos]] = parseInt(pos);
						BDFDB.DataUtils.save(newData, this, "pinnedRecents");
						delete this.draggedChannel;
						delete this.releasedChannel;
						BDFDB.ReactUtils.forceUpdate(e.instance);
					}
					if (this.draggedChannel) {
						let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {filter: child => BDFDB.ReactUtils.getValue(child, "props.channel.id") == this.draggedChannel});
						children.splice(index, 1);
					}
					if (this.hoveredChannel) {
						let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {filter: child => BDFDB.ReactUtils.getValue(child, "props.channel.id") == this.hoveredChannel});
						children.splice(index + 1, 0, BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCNS.guildouter + BDFDB.disCN._pindmsrecentplaceholder,
							children: BDFDB.ReactUtils.createElement("div", {
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Items.DragPlaceholder, {})
							})
						}));
					}
				}
			}
			else e.instance.props.unreadPrivateChannelIds = BDFDB.LibraryModules.DirectMessageUnreadStore.getUnreadPrivateChannelIds();
		}

		processPrivateChannel (e) {
			if (e.instance.props.channel) {
				let category = this.getCategory(e.instance.props.channel.id, "dmCategories");
				if (category) {
					if (e.node) {
						BDFDB.DOMUtils.addClass(e.node, BDFDB.disCN._pindmsdmchannelpinned);
						e.node.removeEventListener("mousedown", e.node.PinDMsMouseDownListener);
						if (!BDFDB.DataUtils.get(this, "settings", "sortInRecentOrder")) {
							e.node.setAttribute("draggable", false);
							e.node.PinDMsMouseDownListener = event => {
								if (!BDFDB.BDUtils.isPluginEnabled("PinDMs")) e.node.removeEventListener("mousedown", e.node.PinDMsMouseDownListener);
								else {
									let mousemove = event2 => {
										if (Math.sqrt((event.pageX - event2.pageX)**2) > 20 || Math.sqrt((event.pageY - event2.pageY)**2) > 20) {
											BDFDB.ListenerUtils.stopEvent(event);
											this.draggedChannel = e.instance.props.channel.id;
											this.updateContainer("dmCategories");
											let dragpreview = this.createDragPreview(e.node, event2);
											document.removeEventListener("mousemove", mousemove);
											document.removeEventListener("mouseup", mouseup);
											let dragging = event3 => {
												this.updateDragPreview(dragpreview, event3);
												let hoveredChannel = null;
												if (BDFDB.DOMUtils.getParent(BDFDB.dotCN._pindmspinnedchannelsheadercontainer, event3.target)) {
													let hoveredCategoryId = BDFDB.ReactUtils.findValue(event3.target, "categoryId", {up: true});
													if (hoveredCategoryId && hoveredCategoryId == category.id) hoveredChannel = "header_" + category.id;
												}
												else {
													let placeholder = BDFDB.DOMUtils.getParent(BDFDB.dotCN._pindmsdmchannelplaceholder, event3.target);
													hoveredChannel = (BDFDB.ReactUtils.findValue(BDFDB.DOMUtils.getParent(BDFDB.dotCN._pindmsdmchannelpinned, placeholder ? placeholder.previousSibling : event3.target), "channel", {up: true}) || {}).id;
													let hoveredCategory = hoveredChannel && this.getCategory(hoveredChannel, "dmCategories");
													if (!hoveredCategory || hoveredCategory.id != category.id) hoveredChannel = null;
												};
												let update = hoveredChannel != this.hoveredChannel;
												if (hoveredChannel) this.hoveredChannel = hoveredChannel;
												else delete this.hoveredChannel; 
												if (update) this.updateContainer("dmCategories");
											};
											let releasing = event3 => {
												BDFDB.DOMUtils.remove(dragpreview);
												if (this.hoveredChannel) this.releasedChannel = this.hoveredChannel;
												else delete this.draggedChannel;
												delete this.hoveredChannel;
												this.updateContainer("dmCategories");
												document.removeEventListener("mousemove", dragging);
												document.removeEventListener("mouseup", releasing);
											};
											document.addEventListener("mousemove", dragging);
											document.addEventListener("mouseup", releasing);
										}
									};
									let mouseup = _ => {
										document.removeEventListener("mousemove", mousemove);
										document.removeEventListener("mouseup", mouseup);
									};
									document.addEventListener("mousemove", mousemove);
									document.addEventListener("mouseup", mouseup);
								}
							};
							e.node.addEventListener("mousedown", e.node.PinDMsMouseDownListener);
						}
					}
					if (e.returnvalue) e.returnvalue.props.children = [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: BDFDB.LanguageUtils.LanguageStrings.UNPIN,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
								className: BDFDB.disCN._pindmsunpinbutton,
								onClick: event => {
									BDFDB.ListenerUtils.stopEvent(event);
									this.removeFromCategory(e.instance.props.channel.id, category, "dmCategories");
								},
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
									className: BDFDB.disCN._pindmsunpinicon,
									name: BDFDB.LibraryComponents.SvgIcon.Names.PIN
								})
							})
						}),
						e.returnvalue.props.children
					].flat(10).filter(n => n);
				}
			}
		}

		processDirectMessage (e) {
			if (e.instance.props.channel) {
				if (e.node && e.methodname == "componentDidMount") {
					BDFDB.DOMUtils.removeClass(e.node, BDFDB.disCN._pindmsrecentpinned);
					e.node.removeEventListener("contextmenu", e.node.PinDMsContextMenuListener);
					e.node.PinDMsContextMenuListener = event => {BDFDB.DMUtils.openMenu(e.instance.props.channel.id, event);};
					e.node.addEventListener("contextmenu", e.node.PinDMsContextMenuListener);
					if (this.isPinned(e.instance.props.channel.id, "pinnedRecents")) {
						BDFDB.DOMUtils.addClass(e.node, BDFDB.disCN._pindmsrecentpinned);
						e.node.removeEventListener("mousedown", e.node.PinDMsMouseDownListener);
						if (!BDFDB.DataUtils.get(this, "settings", "sortInRecentOrderGuild")) {
							for (let child of e.node.querySelectorAll("a")) child.setAttribute("draggable", false);
							e.node.PinDMsMouseDownListener = event => {
								let mousemove = event2 => {
									if (Math.sqrt((event.pageX - event2.pageX)**2) > 20 || Math.sqrt((event.pageY - event2.pageY)**2) > 20) {
										BDFDB.ListenerUtils.stopEvent(event);
										this.draggedChannel = e.instance.props.channel.id;
										BDFDB.ModuleUtils.forceAllUpdates(this, "UnreadDMs");
										let dragpreview = this.createDragPreview(e.node, event2);
										document.removeEventListener("mousemove", mousemove);
										document.removeEventListener("mouseup", mouseup);
										let dragging = event3 => {
											this.updateDragPreview(dragpreview, event3);
											let placeholder = BDFDB.DOMUtils.getParent(BDFDB.dotCN._pindmsrecentplaceholder, event3.target);
											let hoveredChannel = (BDFDB.ReactUtils.findValue(BDFDB.DOMUtils.getParent(BDFDB.dotCN._pindmsrecentpinned, placeholder ? placeholder.previousSibling : event3.target), "channel", {up: true}) || {}).id;
											let update = hoveredChannel != this.hoveredChannel;
											if (hoveredChannel) this.hoveredChannel = hoveredChannel;
											else delete this.hoveredChannel; 
											if (update) BDFDB.ModuleUtils.forceAllUpdates(this, "UnreadDMs");
										};
										let releasing = event3 => {
											BDFDB.DOMUtils.remove(dragpreview);
											if (this.hoveredChannel) this.releasedChannel = this.hoveredChannel;
											else delete this.draggedChannel;
											delete this.hoveredChannel;
											BDFDB.ModuleUtils.forceAllUpdates(this, "UnreadDMs");
											document.removeEventListener("mousemove", dragging);
											document.removeEventListener("mouseup", releasing);
										};
										document.addEventListener("mousemove", dragging);
										document.addEventListener("mouseup", releasing);
									}
								};
								let mouseup = _ => {
									document.removeEventListener("mousemove", mousemove);
									document.removeEventListener("mouseup", mouseup);
								};
								document.addEventListener("mousemove", mousemove);
								document.addEventListener("mouseup", mouseup);
							};
							e.node.addEventListener("mousedown", e.node.PinDMsMouseDownListener);
						}
					}
				}
				if (e.node && e.methodname == "componentWillUnmount") {
					BDFDB.ModuleUtils.forceAllUpdates(this, "PrivateChannelsList");
				}
				if (e.returnvalue && this.isPinned(e.instance.props.channel.id, "pinnedRecents") && BDFDB.DataUtils.get(this, "settings", "showPinIcon")) {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:"BlobMask"});
					if (index > -1) children[index].props.upperLeftBadge = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.IconBadge, {
						className: BDFDB.disCN.guildiconbadge,
						disableColor: true,
						style: {transform: "scale(-1, 1)"},
						icon: BDFDB.LibraryComponents.SvgIcon.Names.NOVA_PIN
					});
				}
			}
		}

		generateID (type) {
			if (!type) return null;
			let categories = BDFDB.DataUtils.load(this, type);
			let id = Math.round(Math.random() * 10000000000000000);
			return categories[id] ? this.generateID() : id;
		}
		
		filterDMs (dms) {
			return dms.filter(id => BDFDB.LibraryModules.ChannelStore.getChannel(id));
		}

		addToCategory (id, category, type) {
			if (!id || !category || !type) return;
			let wasEmpty = !this.filterDMs(category.dms).length;
			if (!category.dms.includes(id)) category.dms.unshift(id);
			if (wasEmpty && category.dms.length) category.collapsed = false;
			BDFDB.DataUtils.save(category, this, type, category.id);
			this.updateContainer(type);
		}

		removeFromCategory (id, category, type) {
			if (!id || !category || !type) return;
			BDFDB.ArrayUtils.remove(category.dms, id, true);
			if (!this.filterDMs(category.dms).length) category.collapsed = true;
			BDFDB.DataUtils.save(category, this, type, category.id);
			this.updateContainer(type);
		}

		getCategory (id, type) {
			if (!id || !type) return null;
			let categories = BDFDB.DataUtils.load(this, type);
			for (let catId in categories) if (categories[catId].dms.includes(id)) return categories[catId];
			return null;
		}

		sortAndUpdateCategories (type, reverse) {
			let data = BDFDB.ObjectUtils.sort(BDFDB.DataUtils.load(this, type), "pos"), newData = {};
			let sorted = [], pos = 0, sort = id => {
				if (sorted[pos] === undefined) {
					newData[id] = Object.assign({}, data[id], {pos});
					sorted[pos] = newData[id];
				}
				else {
					pos++;
					sort(id);
				}
			};
			for (let id in data) sort(id);
			if (!BDFDB.equals(data, newData)) BDFDB.DataUtils.save(newData, this, type);
			return (reverse ? sorted.reverse() : sorted).filter(n => n);
		}
		
		sortDMsByTime (dms, type) {
			if (dms.length > 1 && BDFDB.DataUtils.get(this, "settings", type == "dmCategories" ? "sortInRecentOrder" : "sortInRecentOrderGuild")) {
				let timestamps = BDFDB.LibraryModules.DirectMessageStore.getPrivateChannelTimestamps();
				return [].concat(dms).sort(function (x, y) {return timestamps[x] > timestamps[y] ? -1 : timestamps[x] < timestamps[y] ? 1 : 0;});
			}
			else return dms;
		}
		
		openCategorySettingsModal (data, type, isNew) {
			if (BDFDB.ObjectUtils.is(data) && type) BDFDB.ModalUtils.open(this, {
				size: "MEDIUM",
				header: BDFDB.LanguageUtils.LanguageStrings.CATEGORY_SETTINGS,
				subheader: data.name,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: BDFDB.LanguageUtils.LanguageStrings.CATEGORY_NAME,
						className: BDFDB.disCN.marginbottom20 + " input-categoryname",
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
								value: data.name,
								placeholder: data.name,
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
					})
				],
				buttons: [{
					contents: isNew ? BDFDB.LanguageUtils.LanguageStrings.CREATE : BDFDB.LanguageUtils.LanguageStrings.SAVE,
					color: "BRAND",
					close: true,
					click: modal => {
						data.name = modal.querySelector(".input-categoryname " + BDFDB.dotCN.input).value.trim() || data.name;

						data.color = BDFDB.ColorUtils.getSwatchColor(modal, 1);
						if (data.color != null && !BDFDB.ObjectUtils.is(data.color)) {
							if (data.color[0] < 30 && data.color[1] < 30 && data.color[2] < 30) data.color = BDFDB.ColorUtils.change(data.color, 30);
							else if (data.color[0] > 225 && data.color[1] > 225 && data.color[2] > 225) data.color = BDFDB.ColorUtils.change(data.color, -30);
						}
						
						BDFDB.DataUtils.save(data, this, type, data.id);
						
						this.updateContainer(type);
					}
				}]
			});
		}

		addPin (newid, type) {
			if (!newid) return;
			let pinnedDMs = BDFDB.DataUtils.load(this, type);
			for (let id in pinnedDMs) pinnedDMs[id] = pinnedDMs[id] + 1;
			pinnedDMs[newid] = 0;
			BDFDB.DataUtils.save(pinnedDMs, this, type);
			this.updateContainer(type);
		}

		removePin (id, type) {
			if (!id) return;
			BDFDB.DataUtils.remove(this, type, id);
			this.updateContainer(type);
		}
		
		isPinned (id, type) {
			return BDFDB.DataUtils.load(this, type, id) != undefined;
		}
		
		updateContainer (type) {
			switch (type) {
				case "dmCategories": 
					BDFDB.ModuleUtils.forceAllUpdates(this, "PrivateChannelsList");
					break;
				case "pinnedRecents": 
					BDFDB.ModuleUtils.forceAllUpdates(this, "UnreadDMs");
					break;
			}
		}

		sortAndUpdate (type) {
			let data = BDFDB.DataUtils.load(this, type), newData = {};
			delete data[""];
			delete data["null"];
			let sortedDMs = [], existingDMs = [], sortDM = (id, pos) => {
				if (sortedDMs[pos] === undefined) sortedDMs[pos] = id;
				else sortDM(id, pos + 1);
			};
			for (let id in data) sortDM(id, data[id]);
			sortedDMs = sortedDMs.filter(n => n);
			for (let pos in sortedDMs) {
				newData[sortedDMs[pos]] = parseInt(pos);
				if (BDFDB.LibraryModules.ChannelStore.getChannel(sortedDMs[pos])) existingDMs.push(sortedDMs[pos]);
			}
			if (!BDFDB.equals(data, newData)) BDFDB.DataUtils.save(newData, this, type);
			return this.sortDMsByTime(existingDMs, type);
		}

		forceUpdateAll (stopped) {
			BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.app), {name:"FluxContainer(PrivateChannels)", all:true, unlimited:true}));
			BDFDB.ModuleUtils.forceAllUpdates(this);
		}

		createDragPreview (div, event) {
			if (!Node.prototype.isPrototypeOf(div)) return;
			let dragpreview = div.cloneNode(true);
			BDFDB.DOMUtils.addClass(dragpreview, BDFDB.disCN._pindmsdragpreview);
			BDFDB.DOMUtils.remove(dragpreview.querySelector(BDFDB.dotCNC.guildlowerbadge + BDFDB.dotCNC.guildupperbadge + BDFDB.dotCN.guildpillwrapper));
			document.querySelector(BDFDB.dotCN.appmount).appendChild(dragpreview);
			let rects = BDFDB.DOMUtils.getRects(dragpreview);
			BDFDB.DOMUtils.hide(dragpreview);
			dragpreview.style.setProperty("pointer-events", "none", "important");
			dragpreview.style.setProperty("left", event.clientX - (rects.width/2) + "px", "important");
			dragpreview.style.setProperty("top", event.clientY - (rects.height/2) + "px", "important");
			return dragpreview;
		}

		updateDragPreview (dragpreview, event) {
			if (!Node.prototype.isPrototypeOf(dragpreview)) return;
			BDFDB.DOMUtils.show(dragpreview);
			let rects = BDFDB.DOMUtils.getRects(dragpreview);
			dragpreview.style.setProperty("left", event.clientX - (rects.width/2) + "px", "important");
			dragpreview.style.setProperty("top", event.clientY - (rects.height/2) + "px", "important");
		}

		setLabelsByLanguage () {
			switch (BDFDB.LanguageUtils.getLanguage().id) {
				case "hr":		//croatian
					return {
						context_pindm_text:				"Prikljucite Izravnu Poruku",
						context_pinchannel_text:		"Priložite popisu kanala",
						context_unpinchannel_text:		"Ukloni s popisa kanala",
						context_addtonewcategory_text:	"Dodavanje u novu kategoriju",
						context_pinguild_text:			"Priložite popisu poslužitelja",
						context_unpinguild_text:		"Ukloni s popisa poslužitelja",
						header_pinneddms_text:			"Prikvačene Izravne Poruke",
						modal_colorpicker1_text:		"Boja kategorije"
					};
				case "da":		//danish
					return {
						context_pindm_text:				"Fastgør PB",
						context_pinchannel_text:		"Vedhæft til kanalliste",
						context_unpinchannel_text:		"Fjern fra kanalliste",
						context_addtonewcategory_text:	"Føj til ny kategori",
						context_pinguild_text:			"Vedhæft til serverliste",
						context_unpinguild_text:		"Fjern fra serverliste",
						header_pinneddms_text:			"Pinned Privat Beskeder",
						modal_colorpicker1_text:		"Kategori farve"
					};
				case "de":		//german
					return {
						context_pindm_text:				"Direktnachricht anheften",
						context_pinchannel_text:		"An Kanalliste anheften",
						context_unpinchannel_text:		"Von Kanalliste loslösen",
						context_addtonewcategory_text:	"Zur neuen Kategorie hinzufügen",
						context_pinguild_text:			"An Serverliste anheften",
						context_unpinguild_text:		"Von Serverliste loslösen",
						header_pinneddms_text:			"Gepinnte Direktnachrichten",
						modal_colorpicker1_text:		"Kategoriefarbe"
					};
				case "es":		//spanish
					return {
						context_pindm_text:				"Anclar MD",
						context_pinchannel_text:		"Adjuntar a la lista de canales",
						context_unpinchannel_text:		"Deshazte de la lista de canales",
						context_addtonewcategory_text:	"Agregar a nueva categoría",
						context_pinguild_text:			"Adjuntar a la lista de servidores",
						context_unpinguild_text:		"Deshazte de la lista de servidores",
						header_pinneddms_text:			"Mensajes Directos Fijados",
						modal_colorpicker1_text:		"Color de la categoría"
					};
				case "fr":		//french
					return {
						context_pindm_text:				"Épingler MP",
						context_pinchannel_text:		"Épingler à la liste des salons",
						context_unpinchannel_text:		"Détacher de la liste des salons",
						context_addtonewcategory_text:	"Ajouter à une nouvelle catégorie",
						context_pinguild_text:			"Épingler à la liste de serveurs",
						context_unpinguild_text:		"Détacher de la liste de serveurs",
						header_pinneddms_text:			"Messages Prives Épinglés",
						modal_colorpicker1_text:		"Couleur de la catégorie"
					};
				case "it":		//italian
					return {
						context_pindm_text:				"Fissa il messaggio diretto",
						context_pinchannel_text:		"Allega alla lista dei canali",
						context_unpinchannel_text:		"Rimuovi dalla lista dei canali",
						context_addtonewcategory_text:	"Aggiungi a nuova categoria",
						context_pinguild_text:			"Allega alla lista dei server",
						context_unpinguild_text:		"Rimuovi dalla lista dei server",
						header_pinneddms_text:			"Messaggi Diretti Aggiunti",
						modal_colorpicker1_text:		"Colore della categoria"
					};
				case "nl":		//dutch
					return {
						context_pindm_text:				"PB pinnen",
						context_pinchannel_text:		"Pin naar de kanalenlijst",
						context_unpinchannel_text:		"Losmaken van kanalenlijst",
						context_addtonewcategory_text:	"Toevoegen aan nieuwe categorie",
						context_pinguild_text:			"Pin naar de serverlijst",
						context_unpinguild_text:		"Losmaken van serverlijst",
						header_pinneddms_text:			"Vastgezette Persoonluke Berichten",
						modal_colorpicker1_text:		"Categorie kleur"
					};
				case "no":		//norwegian
					return {
						context_pindm_text:				"Fest DM",
						context_pinchannel_text:		"Fest på kanalliste",
						context_unpinchannel_text:		"Fjern fra kanalliste",
						context_addtonewcategory_text:	"Legg til i ny kategori",
						context_pinguild_text:			"Fest på serverliste",
						context_unpinguild_text:		"Fjern fra serverlisten",
						header_pinneddms_text:			"Pinned Direktemeldinger",
						modal_colorpicker1_text:		"Kategorifarge"
					};
				case "pl":		//polish
					return {
						context_pindm_text:				"Przypnij PW",
						context_pinchannel_text:		"Dołącz do listy kanałów",
						context_unpinchannel_text:		"Usuń z listy kanałów",
						context_addtonewcategory_text:	"Dodaj do nowej kategorii",
						context_pinguild_text:			"Dołącz do listy serwerów",
						context_unpinguild_text:		"Usuń z listy serwerów",
						header_pinneddms_text:			"Prywatne Wiadomości Bezpośrednie",
						modal_colorpicker1_text:		"Kolor kategorii"
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						context_pindm_text:				"Fixar MD",
						context_pinchannel_text:		"Anexar à lista de canais",
						context_unpinchannel_text:		"Remover da lista de canais",
						context_addtonewcategory_text:	"Adicionar à nova categoria",
						context_pinguild_text:			"Anexar à lista de servidores",
						context_unpinguild_text:		"Remover da lista de servidores",
						header_pinneddms_text:			"Mensagens diretas fixadas",
						modal_colorpicker1_text:		"Cor da categoria"
					};
				case "fi":		//finnish
					return {
						context_pindm_text:				"Kiinnitä yksityisviestit",
						context_pinchannel_text:		"Liitä kanavaluetteloon",
						context_unpinchannel_text:		"Poista kanavaluettelosta",
						context_addtonewcategory_text:	"Lisää uuteen luokkaan",
						context_pinguild_text:			"Liitä palvelinluetteloon",
						context_unpinguild_text:		"Poista palvelinluettelosta",
						header_pinneddms_text:			"Liitetyt yksityisviestit",
						modal_colorpicker1_text:		"Luokan väri"
					};
				case "sv":		//swedish
					return {
						context_pindm_text:				"Fäst DM",
						context_pinchannel_text:		"Fäst till kanallista",
						context_unpinchannel_text:		"Ta bort från kanallistan",
						context_addtonewcategory_text:	"Lägg till i ny kategori",
						context_pinguild_text:			"Fäst till servernlista",
						context_unpinguild_text:		"Ta bort från servernlista",
						header_pinneddms_text:			"Inlagda Direktmeddelanden",
						modal_colorpicker1_text:		"Kategori färg"
					};
				case "tr":		//turkish
					return {
						context_pindm_text:				"DM'yi Sabitle",
						context_pinchannel_text:		"Kanal listesine ekle",
						context_unpinchannel_text:		"Kanal listesinden kaldır",
						context_addtonewcategory_text:	"Yeni kategoriye ekle",
						context_pinguild_text:			"Sunucu listesine ekle",
						context_unpinguild_text:		"Sunucu listesinden kaldır",
						header_pinneddms_text:			"Direkt Mesajlar Sabitleyin",
						modal_colorpicker1_text:		"Kategori rengi"
					};
				case "cs":		//czech
					return {
						context_pindm_text:				"Připnout PZ",
						context_pinchannel_text:		"Připojení k seznamu kanálů",
						context_unpinchannel_text:		"Odstranit ze seznamu kanálů",
						context_addtonewcategory_text:	"Přidat do nové kategorie",
						context_pinguild_text:			"Připojit ke seznamu serverů",
						context_unpinguild_text:		"Odstranit ze seznamu serverů",
						header_pinneddms_text:			"Připojené Přímá Zpráva",
						modal_colorpicker1_text:		"Barva kategorie"
					};
				case "bg":		//bulgarian
					return {
						context_pindm_text:				"Закачени ДС",
						context_pinchannel_text:		"Прикачете към списъка с канали",
						context_unpinchannel_text:		"Премахване от списъка с канали",
						context_addtonewcategory_text:	"Добавяне към нова категория",
						context_pinguild_text:			"Прикачване към списъка със сървъри",
						context_unpinguild_text:		"Премахване от списъка със сървъри",
						header_pinneddms_text:			"Свързани директни съобщения",
						modal_colorpicker1_text:		"Цвят на категорията"
					};
				case "ru":		//russian
					return {
						context_pindm_text:				"Закрепить ЛС",
						context_pinchannel_text:		"Прикрепить к списку каналов",
						context_unpinchannel_text:		"Удалить из списка каналов",
						context_addtonewcategory_text:	"Добавить в новую категорию",
						context_pinguild_text:			"Присоединить к списку серверов",
						context_unpinguild_text:		"Удалить из списка серверов",
						header_pinneddms_text:			"Прикрепленные Личные Сообщения",
						modal_colorpicker1_text:		"Цвет категории"
					};
				case "uk":		//ukrainian
					return {
						context_pindm_text:				"Закріпити ОП",
						context_pinchannel_text:		"Додайте до списку каналів",
						context_unpinchannel_text:		"Видалити зі списку каналів",
						context_addtonewcategory_text:	"Додати до нової категорії",
						context_pinguild_text:			"Додайте до списку серверів",
						context_unpinguild_text:		"Видалити зі списку серверів",
						header_pinneddms_text:			"Прикріплені oсобисті повідомлення",
						modal_colorpicker1_text:		"Колір категорії"
					};
				case "ja":		//japanese
					return {
						context_pindm_text:				"DMピン",
						context_pinchannel_text:		"チャンネルリストに添付",
						context_unpinchannel_text:		"チャンネルリストから削除",
						context_addtonewcategory_text:	"新しいカテゴリに追加",
						context_pinguild_text:			"サーバーリストに添付",
						context_unpinguild_text:		"サーバーリストから削除",
						header_pinneddms_text:			"固定された直接メッセージ",
						modal_colorpicker1_text:		"カテゴリーの色"
					};
				case "zh-TW":	//chinese (traditional)
					return {
						context_pindm_text:				"引腳直接留言",
						context_pinchannel_text:		"附加到頻道列表",
						context_unpinchannel_text:		"從頻道列表中刪除",
						context_addtonewcategory_text:	"添加到新類別",
						context_pinguild_text:			"附加到服務器列表",
						context_unpinguild_text:		"從服務器列表中刪除",
						header_pinneddms_text:			"固定私人信息",
						modal_colorpicker1_text:		"類別顏色"
					};
				case "ko":		//korean
					return {
						context_pindm_text:				"비공개 메시지 고정",
						context_pinchannel_text:		"채널 목록에 첨부",
						context_unpinchannel_text:		"채널 목록에서 삭제",
						context_addtonewcategory_text:	"새 카테고리에 추가",
						context_pinguild_text:			"서버 목록에 첨부",
						context_unpinguild_text:		"서버 목록에서 제거",
						header_pinneddms_text:			"고정 된 비공개 메시지",
						modal_colorpicker1_text:		"카테고리 색상"
					};
				default:		//default: english
					return {
						context_pindm_text:				"Pin DM",
						context_pinchannel_text:		"Pin to Channellist",
						context_unpinchannel_text:		"Unpin from Channellist",
						context_addtonewcategory_text:	"Add to new Category",
						context_pinguild_text:			"Pin to Serverlist",
						context_unpinguild_text:		"Unpin from Serverlist",
						header_pinneddms_text:			"Pinned Direct Messages",
						modal_colorpicker1_text:		"Categorycolor"
					};
			}
		}
	}
})();