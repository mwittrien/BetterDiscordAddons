//META{"name":"PinDMs","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/PinDMs","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/PinDMs/PinDMs.plugin.js"}*//

class PinDMs {
	getName () {return "PinDMs";}

	getVersion () {return "1.5.1";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to pin DMs, making them appear at the top of your DMs/Guild-list.";}

	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};

		this.patchedModules = {
			before: {
				PrivateChannelsList: "render",
				UnreadDMs: "render",
			},
			after: {
				PrivateChannelsList: "render",
				UnreadDMs: "render",
				PrivateChannel: ["render", "componentDidMount"],
				DirectMessage: ["render", "componentDidMount"]
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
			${BDFDB.dotCN._pindmsdragpreview} {
				pointer-events: none !important;
				position: absolute !important;
				opacity: 0.5 !important;
				z-index: 10000 !important;
			}`;

		this.defaults = {
			settings: {
				showPinIcon:		{value:true, 	description:"Shows a little 'Pin' icon for pinned DMs in the server list:"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		let settingsitems = [];
		
		for (let key in settings) (!this.defaults.settings[key].inner ? settingsitems : inneritems).push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
			className: BDFDB.disCN.marginbottom8,
			type: "Switch",
			plugin: this,
			keys: ["settings", key],
			label: this.defaults.settings[key].description,
			value: settings[key]
		}));
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
			type: "Button",
			className: BDFDB.disCN.marginbottom8,
			color: BDFDB.LibraryComponents.Button.Colors.RED,
			label: "Unpin all pinned DMs",
			onClick: _ => {
				BDFDB.ModalUtils.confirm(this, "Are you sure you want to unpin all pinned DMs?", () => {
					BDFDB.DataUtils.remove(this, "pinnedDMs");
					BDFDB.DataUtils.remove(this, "pinnedRecents");
				});
			},
			children: BDFDB.LanguageUtils.LanguageStrings.UNPIN
		}));
		
		return BDFDB.PluginUtils.createSettingsPanel(this, settingsitems);
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.min.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {
			try {return this.initialize();}
			catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
		}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);

			BDFDB.ModuleUtils.forceAllUpdates(this);
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			this.forceUpdateAll();
			
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
		let pinnedInChannel = this.isPinned(id, "pinnedDMs");
		let pinnedInGuild = this.isPinned(id, "pinnedRecents");
		children.splice(index, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuSubItem, {
			label: this.labels.context_pindm_text,
			render: [
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
					label: this.labels[pinnedInChannel ? "context_unpinchannel_text" : "context_pinchannel_text"],
					danger: pinnedInChannel,
					action: _ => {
						BDFDB.ContextMenuUtils.close(instance);
						if (!pinnedInChannel) this.addPin(id, "pinnedDMs");
						else this.removePin(id, "pinnedDMs");
					}
				}),
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
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
		let sortedDMs = this.sortAndUpdate("pinnedDMs");
		if (sortedDMs.length) {
			e.instance.props.channels = Object.assign({}, e.instance.props.channels);
			e.instance.props.pinnedChannels = Object.assign({}, e.instance.props.pinnedChannels);
			for (let pos in sortedDMs) {
				let id = sortedDMs[pos];
				if (e.instance.props.channels[id]) {
					e.instance.props.pinnedChannels[id] = e.instance.props.channels[id];
					BDFDB.ArrayUtils.remove(e.instance.props.privateChannelIds, id, true);
					delete e.instance.props.channels[id];
				}
			}
			if (e.returnvalue && !BDFDB.ObjectUtils.isEmpty(e.instance.props.pinnedChannels)) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "ListSectionItem"});
				if (index > -1) {
					if (this.draggedChannel && this.releasedChannel) {
						let ids = Object.keys(e.instance.props.pinnedChannels), pinnedChannels = {}, newData = {};
						BDFDB.ArrayUtils.remove(ids, this.draggedChannel, true);
						ids.splice(this.releasedChannel == "header" ? 0 : ids.indexOf(this.releasedChannel) + 1, 0, this.draggedChannel);
						for (let pos in ids) {
							let id = ids[pos];
							pinnedChannels[id] = e.instance.props.pinnedChannels[id];
							newData[id] = parseInt(pos);
						}
						e.instance.props.pinnedChannels = pinnedChannels;
						BDFDB.DataUtils.save(newData, this, "pinnedDMs");
						delete this.draggedChannel;
						delete this.releasedChannel;
					}
					children.splice(index++, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListHeader, {
						className: BDFDB.disCNS.dmchannelheader + BDFDB.disCN._pindmspinnedchannelsheadercontainer,
						children: this.labels.header_pinneddms_text
					}));
					if (this.hoveredChannel == "header") children.splice(index++, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListItem, {
						className: BDFDB.disCNS.dmchannel + BDFDB.disCNS._pindmsdmchannelpinned + BDFDB.disCN._pindmsdmchannelplaceholder
					}));
					for (let id in e.instance.props.pinnedChannels) if (e.instance.props.pinnedChannels[id]) {
						if (!e.instance.props.privateChannelIds.includes(id)) e.instance.props.privateChannelIds.unshift(id);
						if (this.draggedChannel != id) {
							let channel = e.instance.props.renderChannel(e.instance.props.pinnedChannels[id], e.instance.props.selectedChannelId == id);
							channel.props.pinned = true;
							children.splice(index++, 0, channel);
							if (this.hoveredChannel == id) children.splice(index++, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListItem, {
								className: BDFDB.disCNS.dmchannel + BDFDB.disCNS._pindmsdmchannelpinned + BDFDB.disCN._pindmsdmchannelplaceholder
							}));
						}
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
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.DragPlaceholder, {})
						})
					}));
				}
			}
		}
		else e.instance.props.unreadPrivateChannelIds = BDFDB.LibraryModules.DirectMessageUnreadStore.getUnreadPrivateChannelIds();
	}

	processPrivateChannel (e) {
		if (e.instance.props.channel && e.instance.props.pinned) {
			if (e.node) {
				BDFDB.DOMUtils.addClass(e.node, BDFDB.disCN._pindmsdmchannelpinned);
				e.node.setAttribute("draggable", false);
				e.node.removeEventListener("mousedown", e.node.PinDMsMouseDownListener);
				e.node.PinDMsMouseDownListener = event => {
					let mousemove = event2 => {
						if (Math.sqrt((event.pageX - event2.pageX)**2) > 20 || Math.sqrt((event.pageY - event2.pageY)**2) > 20) {
							BDFDB.ListenerUtils.stopEvent(event);
							this.draggedChannel = e.instance.props.channel.id;
							BDFDB.ModuleUtils.forceAllUpdates(this, "PrivateChannelsList");
							let dragpreview = this.createDragPreview(e.node, event2);
							document.removeEventListener("mousemove", mousemove);
							document.removeEventListener("mouseup", mouseup);
							let dragging = event3 => {
								this.updateDragPreview(dragpreview, event3);
								let hoveredChannel = null;
								if (BDFDB.DOMUtils.getParent(BDFDB.dotCN._pindmspinnedchannelsheadercontainer, event3.target)) hoveredChannel = "header";
								else {
									let placeholder = BDFDB.DOMUtils.getParent(BDFDB.dotCN._pindmsdmchannelplaceholder, event3.target);
									hoveredChannel = (BDFDB.ReactUtils.findValue(BDFDB.DOMUtils.getParent(BDFDB.dotCN._pindmsdmchannelpinned, placeholder ? placeholder.previousSibling : event3.target), "channel", {up: true}) || {}).id;
								};
								let update = hoveredChannel != this.hoveredChannel;
								if (hoveredChannel) this.hoveredChannel = hoveredChannel;
								else delete this.hoveredChannel; 
								if (update) BDFDB.ModuleUtils.forceAllUpdates(this, "PrivateChannelsList");
							};
							let releasing = event3 => {
								BDFDB.DOMUtils.remove(dragpreview);
								if (this.hoveredChannel) this.releasedChannel = this.hoveredChannel;
								else delete this.draggedChannel;
								delete this.hoveredChannel;
								BDFDB.ModuleUtils.forceAllUpdates(this, "PrivateChannelsList");
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
			if (e.returnvalue) e.returnvalue.props.children = [
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: BDFDB.LanguageUtils.LanguageStrings.UNPIN,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
						className: BDFDB.disCN._pindmsunpinbutton,
						onClick: event => {
							BDFDB.ListenerUtils.stopEvent(event);
							this.removePin(e.instance.props.channel.id, "pinnedDMs");
						},
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.disCN._pindmsunpinicon,
							name: BDFDB.LibraryComponents.SvgIcon.Names.PIN
						})
					})
				})
			].concat(e.returnvalue.props.children).flat(10);
		}
	}

	processDirectMessage (e) {
		if (e.instance.props.channel) {
			if (e.node) {
				BDFDB.DOMUtils.removeClass(e.node, BDFDB.disCN._pindmsrecentpinned);
				e.node.removeEventListener("contextmenu", e.node.PinDMsContextMenuListener);
				e.node.PinDMsContextMenuListener = event => {BDFDB.DMUtils.openMenu(e.instance.props.channel.id, event);};
				e.node.addEventListener("contextmenu", e.node.PinDMsContextMenuListener);
				if (this.isPinned(e.instance.props.channel.id, "pinnedRecents")) {
					BDFDB.DOMUtils.addClass(e.node, BDFDB.disCN._pindmsrecentpinned);
					for (let child of e.node.querySelectorAll("a")) child.setAttribute("draggable", false);
					e.node.removeEventListener("mousedown", e.node.PinDMsMouseDownListener);
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
			if (this.isPinned(e.instance.props.channel.id, "pinnedRecents") && BDFDB.DataUtils.get(this, "settings", "showPinIcon")) {
				let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:"BlobMask"});
				if (index > -1) children[index].props.upperLeftBadge = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.BadgeComponents.IconBadge, {
					className: BDFDB.disCN.guildbadgeiconbadge2,
					name: BDFDB.LibraryComponents.SvgIcon.Names.NOVA_PIN,
					style: {backgroundColor: null, transform: "scale(-1, 1)"}
				});
			}
		}
	}

	addPin (newid, type) {
		if (!newid) return;
		let container = this.getContainer(type);
		if (!container) return;
		let pinnedDMs = BDFDB.DataUtils.load(this, type);
		for (let id in pinnedDMs) pinnedDMs[id] = pinnedDMs[id] + 1;
		pinnedDMs[newid] = 0;
		BDFDB.DataUtils.save(pinnedDMs, this, type);
		BDFDB.ModuleUtils.forceAllUpdates(this, container);
	}

	removePin (id, type) {
		if (!id) return;
		let container = this.getContainer(type);
		if (!container) return;
		BDFDB.DataUtils.remove(this, type, id);
		BDFDB.ModuleUtils.forceAllUpdates(this, container);
	}
	
	isPinned (id, type) {
		return BDFDB.DataUtils.load(this, type, id) != undefined;
	}
	
	getContainer (type) {
		switch (type) {
			case "pinnedDMs": return "PrivateChannelsList";
			case "pinnedRecents": return "UnreadDMs";
			default: return null;
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
		return existingDMs;
	}

	forceUpdateAll () {
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
					context_pinguild_text:			"Priložite popisu poslužitelja",
					context_unpinguild_text:		"Ukloni s popisa poslužitelja",
					header_pinneddms_text:			"Prikvačene Izravne Poruke"
				};
			case "da":		//danish
				return {
					context_pindm_text:				"Fastgør PB",
					context_pinchannel_text:		"Vedhæft til kanalliste",
					context_unpinchannel_text:		"Fjern fra kanalliste",
					context_pinguild_text:			"Vedhæft til serverliste",
					context_unpinguild_text:		"Fjern fra serverliste",
					header_pinneddms_text:			"Pinned Privat Beskeder"
				};
			case "de":		//german
				return {
					context_pindm_text:				"Direktnachricht anheften",
					context_pinchannel_text:		"An Kanalliste anheften",
					context_unpinchannel_text:		"Von Kanalliste loslösen",
					context_pinguild_text:			"An Serverliste anheften",
					context_unpinguild_text:		"Von Serverliste loslösen",
					header_pinneddms_text:			"Gepinnte Direktnachrichten"
				};
			case "es":		//spanish
				return {
					context_pindm_text:				"Anclar MD",
					context_pinchannel_text:		"Adjuntar a la lista de canales",
					context_unpinchannel_text:		"Deshazte de la lista de canales",
					context_pinguild_text:			"Adjuntar a la lista de servidores",
					context_unpinguild_text:		"Deshazte de la lista de servidores",
					header_pinneddms_text:			"Mensajes Directos Fijados"
				};
			case "fr":		//french
				return {
					context_pindm_text:				"Épingler MP",
					context_pinchannel_text:		"Épingler à la liste des chaînes",
					context_unpinchannel_text:		"Détacher de la liste des chaînes",
					context_pinguild_text:			"Épingler à la liste de serveurs",
					context_unpinguild_text:		"Détacher de la liste de serveurs",
					header_pinneddms_text:			"Messages Prives Épinglés"
				};
			case "it":		//italian
				return {
					context_pindm_text:				"Fissa il messaggio diretto",
					context_pinchannel_text:		"Allega alla lista dei canali",
					context_unpinchannel_text:		"Rimuovi dalla lista dei canali",
					context_pinguild_text:			"Allega alla lista dei server",
					context_unpinguild_text:		"Rimuovi dalla lista dei server",
					header_pinneddms_text:			"Messaggi Diretti Aggiunti"
				};
			case "nl":		//dutch
				return {
					context_pindm_text:				"PB pinnen",
					context_pinchannel_text:		"Pin naar de kanalenlijst",
					context_unpinchannel_text:		"Losmaken van kanalenlijst",
					context_pinguild_text:			"Pin naar de serverlijst",
					context_unpinguild_text:		"Losmaken van serverlijst",
					header_pinneddms_text:			"Vastgezette Persoonluke Berichten"
				};
			case "no":		//norwegian
				return {
					context_pindm_text:				"Fest DM",
					context_pinchannel_text:		"Fest på kanalliste",
					context_unpinchannel_text:		"Fjern fra kanalliste",
					context_pinguild_text:			"Fest på serverliste",
					context_unpinguild_text:		"Fjern fra serverlisten",
					header_pinneddms_text:			"Pinned Direktemeldinger"
				};
			case "pl":		//polish
				return {
					context_pindm_text:				"Przypnij PW",
					context_pinchannel_text:		"Dołącz do listy kanałów",
					context_unpinchannel_text:		"Usuń z listy kanałów",
					context_pinguild_text:			"Dołącz do listy serwerów",
					context_unpinguild_text:		"Usuń z listy serwerów",
					header_pinneddms_text:			"Prywatne Wiadomości Bezpośrednie"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_pindm_text:				"Fixar MD",
					context_pinchannel_text:		"Anexar à lista de canais",
					context_unpinchannel_text:		"Remover da lista de canais",
					context_pinguild_text:			"Anexar à lista de servidores",
					context_unpinguild_text:		"Remover da lista de servidores",
					header_pinneddms_text:			"Mensagens diretas fixadas"
				};
			case "fi":		//finnish
				return {
					context_pindm_text:				"Kiinnitä yksityisviestit",
					context_pinchannel_text:		"Liitä kanavaluetteloon",
					context_unpinchannel_text:		"Poista kanavaluettelosta",
					context_pinguild_text:			"Liitä palvelinluetteloon",
					context_unpinguild_text:		"Poista palvelinluettelosta",
					header_pinneddms_text:			"Liitetyt yksityisviestit"
				};
			case "sv":		//swedish
				return {
					context_pindm_text:				"Fäst DM",
					context_pinchannel_text:		"Fäst till kanallista",
					context_unpinchannel_text:		"Ta bort från kanallistan",
					context_pinguild_text:			"Fäst till servernlista",
					context_unpinguild_text:		"Ta bort från servernlista",
					header_pinneddms_text:			"Inlagda Direktmeddelanden"
				};
			case "tr":		//turkish
				return {
					context_pindm_text:				"DM'yi Sabitle",
					context_pinchannel_text:		"Kanal listesine ekle",
					context_unpinchannel_text:		"Kanal listesinden kaldır",
					context_pinguild_text:			"Sunucu listesine ekle",
					context_unpinguild_text:		"Sunucu listesinden kaldır",
					header_pinneddms_text:			"Direkt Mesajlar Sabitleyin"
				};
			case "cs":		//czech
				return {
					context_pindm_text:				"Připnout PZ",
					context_pinchannel_text:		"Připojení k seznamu kanálů",
					context_unpinchannel_text:		"Odstranit ze seznamu kanálů",
					context_pinguild_text:			"Připojit ke seznamu serverů",
					context_unpinguild_text:		"Odstranit ze seznamu serverů",
					header_pinneddms_text:			"Připojené Přímá Zpráva"
				};
			case "bg":		//bulgarian
				return {
					context_pindm_text:				"Закачени ДС",
					context_pinchannel_text:		"Прикачете към списъка с канали",
					context_unpinchannel_text:		"Премахване от списъка с канали",
					context_pinguild_text:			"Прикачване към списъка със сървъри",
					context_unpinguild_text:		"Премахване от списъка със сървъри",
					header_pinneddms_text:			"Свързани директни съобщения"
				};
			case "ru":		//russian
				return {
					context_pindm_text:				"Закрепить ЛС",
					context_pinchannel_text:		"Прикрепить к списку каналов",
					context_unpinchannel_text:		"Удалить из списка каналов",
					context_pinguild_text:			"Присоединить к списку серверов",
					context_unpinguild_text:		"Удалить из списка серверов",
					header_pinneddms_text:			"Прикрепленные Личные Сообщения"
				};
			case "uk":		//ukrainian
				return {
					context_pindm_text:				"Закріпити ОП",
					context_pinchannel_text:		"Додайте до списку каналів",
					context_unpinchannel_text:		"Видалити зі списку каналів",
					context_pinguild_text:			"Додайте до списку серверів",
					context_unpinguild_text:		"Видалити зі списку серверів",
					header_pinneddms_text:			"Прикріплені oсобисті повідомлення"
				};
			case "ja":		//japanese
				return {
					context_pindm_text:				"DMピン",
					context_pinchannel_text:		"チャンネルリストに添付",
					context_unpinchannel_text:		"チャンネルリストから削除",
					context_pinguild_text:			"サーバーリストに添付",
					context_unpinguild_text:		"サーバーリストから削除",
					header_pinneddms_text:			"固定された直接メッセージ"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_pindm_text:				"引腳直接留言",
					context_pinchannel_text:		"附加到頻道列表",
					context_unpinchannel_text:		"從頻道列表中刪除",
					context_pinguild_text:			"附加到服務器列表",
					context_unpinguild_text:		"從服務器列表中刪除",
					header_pinneddms_text:			"固定私人信息"
				};
			case "ko":		//korean
				return {
					context_pindm_text:				"비공개 메시지 고정",
					context_pinchannel_text:		"채널 목록에 첨부",
					context_unpinchannel_text:		"채널 목록에서 삭제",
					context_pinguild_text:			"서버 목록에 첨부",
					context_unpinguild_text:		"서버 목록에서 제거",
					header_pinneddms_text:			"고정 된 비공개 메시지"
				};
			default:		//default: english
				return {
					context_pindm_text:				"Pin DM",
					context_pinchannel_text:		"Pin to Channellist",
					context_unpinchannel_text:		"Unpin from Channellist",
					context_pinguild_text:			"Pin to Serverlist",
					context_unpinguild_text:		"Unpin from Serverlist",
					header_pinneddms_text:			"Pinned Direct Messages"
				};
		}
	}
}