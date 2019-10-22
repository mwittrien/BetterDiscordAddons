//META{"name":"EditChannels","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditChannels","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EditChannels/EditChannels.plugin.js"}*//

class EditChannels {
	getName () {return "EditChannels";}

	getVersion () {return "4.0.7";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to rename and recolor channelnames.";}

	constructor () {
		this.changelog = {
			"fixed":[["Settings","Fixed issue where settings could not be saved"]]
		};

		this.labels = {};

		this.patchModules = {
			"ChannelTextArea":"componentDidMount",
			"AuditLog":"componentDidMount",
			"InviteCard":"render",
			"ChannelCategoryItem":["componentDidMount","componentDidUpdate"],
			"ChannelItem":["componentDidMount","componentDidUpdate"],
			"HeaderBar":["componentDidMount","componentDidUpdate"],
			"HeaderBarContainer":["componentDidMount","componentDidUpdate"],
			"Clickable":"componentDidMount",
			"StandardSidebarView":"componentWillUnmount"
		};
	}

	initConstructor () {
		this.css = `
			${BDFDB.dotCN.guildsettingsinvitechannelname}[changed-by-editchannels] {
				opacity: 1;
			}
		`;

		this.defaults = {
			settings: {
				changeChannelIcon:		{value:true, 	inner:false,	description:"Change color of Channel Icon."},
				changeUnreadIndicator:	{value:true, 	inner:false,	description:"Change color of Unread Indicator."},
				changeInChatTextarea:	{value:true, 	inner:true,		description:"Chat Textarea"},
				changeInMentions:		{value:true, 	inner:true,		description:"Mentions"},
				changeInChannelList:	{value:true, 	inner:true,		description:"Channel List"},
				changeInChannelHeader:	{value:true, 	inner:true,		description:"Channel Header"},
				changeInRecentMentions:	{value:true, 	inner:true,		description:"Recent Mentions Popout"},
				changeInAutoComplete:	{value:true, 	inner:true,		description:"Autocomplete Menu"},
				changeInAuditLog:		{value:true, 	inner:true,		description:"Audit Log"},
				changeInInviteLog:		{value:true, 	inner:true,		description:"Invite Log"},
				changeInSearchPopout:	{value:true, 	inner:true,		description:"Search Popout"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		var settings = BDFDB.getAllData(this, "settings");
		var settingsitems = [], inneritems = [];
		
		for (let key in settings) (!this.defaults.settings[key].inner ? settingsitems : inneritems).push(BDFDB.React.createElement(BDFDB.LibraryComponents.SettingsSwitch, {
			className: BDFDB.disCN.marginbottom8,
			plugin: this,
			keys: ["settings", key],
			label: this.defaults.settings[key].description,
			value: settings[key]
		}));
		settingsitems.push(BDFDB.React.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
			title: "Change Channels in:",
			children: inneritems
		}));
		settingsitems.push(BDFDB.React.createElement(BDFDB.LibraryComponents.SettingsItem, {
			type: "Button",
			className: BDFDB.disCN.marginbottom8,
			color: BDFDB.LibraryComponents.Button.Colors.RED,
			label: "Reset all Channels",
			onClick: _ => {
				BDFDB.openConfirmModal(this, "Are you sure you want to reset all channels?", () => {
					BDFDB.removeAllData(this, "channels");
					this.forceUpdateAll();
				});
			},
			children: BDFDB.LanguageUtils.LanguageStrings.RESET
		}));
		
		return BDFDB.createSettingsPanel(this, settingsitems);
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
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			var observer = new MutationObserver(() => {this.changeAppTitle();});
			BDFDB.addObserver(this, document.head.querySelector("title"), {name:"appTitleObserver",instance:observer}, {childList:true});
			
			this.forceUpdateAll();
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			let data = BDFDB.loadAllData(this, "channels");
			BDFDB.removeAllData(this, "channels");
			try {this.forceUpdateAll();} catch (err) {}
			BDFDB.saveAllData(data, this, "channels");

			BDFDB.removeEles(".autocompleteEditChannels", ".autocompleteEditChannelsRow");

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	onChannelContextMenu (instance, menu, returnvalue) {
		if (instance.props && instance.props.channel && !BDFDB.getParentEle(".container-hidden", instance.props.target) && !menu.querySelector(`${this.name}-contextMenuSubItem`)) {
			let [children, index] = BDFDB.getContextMenuGroupAndIndex(returnvalue, ["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]);
			const itemgroup = BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
				children: [
					BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuSubItem, {
						label: this.labels.context_localchannelsettings_text,
						className: `BDFDB-contextMenuSubItem ${this.name}-contextMenuSubItem ${this.name}-channelsettings-contextMenuSubItem`,
						render: [BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
							className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
							children: [
								BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
									label: this.labels.submenu_channelsettings_text,
									className: `BDFDB-ContextMenuItem ${this.name}-ContextMenuItem ${this.name}-channelsettings-ContextMenuItem`,
									action: e => {
										BDFDB.closeContextMenu(menu);
										this.showChannelSettings(instance.props.channel);
									}
								}),
								BDFDB.React.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
									label: this.labels.submenu_resetsettings_text,
									className: `BDFDB-ContextMenuItem ${this.name}-ContextMenuItem ${this.name}-resetsettings-ContextMenuItem`,
									disabled: !BDFDB.loadData(instance.props.channel.id, this, "channels"),
									action: e => {
										BDFDB.closeContextMenu(menu);
										BDFDB.removeData(instance.props.channel.id, this, "channels");
										this.forceUpdateAll();
									}
								})
							]
						})]
					})
				]
			});
			if (index > -1) children.splice(index, 0, itemgroup);
			else children.push(itemgroup);
		}
	}
	
	forceUpdateAll () {
		this.changeAppTitle();
		BDFDB.WebModules.forceAllUpdates(this);
	}

	showChannelSettings (info) {
		var data = BDFDB.loadData(info.id, this, "channels") || {};
		
		BDFDB.openModal(this, {
			size: "MEDIUM",
			header: this.labels.modal_header_text,
			subheader: info.name,
			children: [
				BDFDB.React.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
					title: this.labels.modal_channelname_text,
					className: BDFDB.disCN.marginbottom20 + " input-channelname",
					children: [
						BDFDB.React.createElement(BDFDB.LibraryComponents.TextInput, {
							value: data.name,
							placeholder: info.name,
							autoFocus: true
						}),
						BDFDB.React.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
							className: BDFDB.disCN.dividerdefault
						})
					]
				}),
				BDFDB.React.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
					title: this.labels.modal_colorpicker1_text,
					className: BDFDB.disCN.marginbottom20,
					children: [
						BDFDB.React.createElement(BDFDB.LibraryComponents.ColorSwatches, {
							color: data.color,
							number: 1
						})
					]
				}),
				BDFDB.React.createElement(BDFDB.LibraryComponents.SettingsItem, {
					type: "Switch",
					className: BDFDB.disCN.marginbottom20 + " input-inheritcolor",
					label: this.labels.modal_inheritcolor_text,
					value: info.type == 4 && data.inheritColor,
					disabled: info.type != 4
				})
			],
			buttons: [{
				contents: BDFDB.LanguageUtils.LanguageStrings.SAVE,
				color: "BRAND",
				close: true,
				click: modal => {
					let olddata = Object.assign({}, data);
					
					let channelnameinput = modal.querySelector(".input-channelname " + BDFDB.dotCN.input);
					let inheritcolorinput = modal.querySelector(".input-inheritcolor " + BDFDB.dotCN.switchinner);
					
					data.name = channelnameinput.value.trim() || null;

					data.color = BDFDB.getSwatchColor(modal, 1);
					console.log(data.color);
					if (data.color != null && !BDFDB.isObject(data.color)) {
						if (data.color[0] < 30 && data.color[1] < 30 && data.color[2] < 30) data.color = BDFDB.colorCHANGE(data.color, 30);
						else if (data.color[0] > 225 && data.color[1] > 225 && data.color[2] > 225) data.color = BDFDB.colorCHANGE(data.color, -30);
					}

					data.inheritColor = inheritcolorinput.checked;
					
					let changed = false;
					if (Object.keys(data).every(key => data[key] == null || data[key] == false) && (changed = true)) BDFDB.removeData(info.id, this, "channels");
					else if (!BDFDB.equals(olddata, data) && (changed = true)) BDFDB.saveData(info.id, data, this, "channels");
					if (changed) this.forceUpdateAll();
				}
			}]
		});
	}

	processChannelTextArea (instance, wrapper, returnvalue) {
		let channel = BDFDB.getReactValue(instance, "props.channel");
		if (channel) {
			var textarea = wrapper.querySelector("textarea");
			if (!textarea) return;
			if (channel.type == 0 && instance.props.type == "normal" && !instance.props.disabled) {
				let data = this.getChannelData(channel.id, wrapper);
				wrapper.querySelector("textarea").setAttribute("placeholder", BDFDB.LanguageUtils.LanguageStringsFormat("TEXTAREA_PLACEHOLDER", "#" + (data.name || channel.name)));
			}
			BDFDB.removeEventListener(this, textarea);
			if (BDFDB.getData("changeInAutoComplete", this, "settings")) {
				BDFDB.addEventListener(this, textarea, "keydown", e => {
					let autocompletemenu = textarea.parentElement.querySelector(BDFDB.dotCN.autocomplete);
					if (autocompletemenu && (e.which == 9 || e.which == 13)) {
						if (BDFDB.containsClass(autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected).parentElement, "autocompleteEditChannelsRow")) {
							BDFDB.stopEvent(e);
							this.swapWordWithMention(textarea);
						}
					}
					else if (autocompletemenu && (e.which == 38 || e.which == 40)) {
						let autocompleteitems = autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselectable + ":not(.autocompleteEditChannelsSelector)");
						let selected = autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected);
						if (BDFDB.containsClass(selected, "autocompleteEditChannelsSelector") || autocompleteitems[e.which == 38 ? 0 : (autocompleteitems.length-1)] == selected) {
							BDFDB.stopEvent(e);
							let next = this.getNextSelection(autocompletemenu, null, e.which == 38 ? false : true);
							BDFDB.removeClass(selected, BDFDB.disCN.autocompleteselected);
							BDFDB.addClass(selected, BDFDB.disCN.autocompleteselector);
							BDFDB.addClass(next, BDFDB.disCN.autocompleteselected);
						}
					}
					else if (textarea.value && !e.shiftKey && e.which == 13 && !autocompletemenu && textarea.value.indexOf("s/") != 0) {
						this.format = true;
						textarea.dispatchEvent(new Event("input"));
					}
					else if (!e.ctrlKey && e.which != 16 && textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length) {
						clearTimeout(textarea.EditChannelsAutocompleteTimeout);
						textarea.EditChannelsAutocompleteTimeout = setTimeout(() => {this.addAutoCompleteMenu(textarea, channel);},100);
					}

					if (!e.ctrlKey && e.which != 38 && e.which != 40 && !(e.which == 39 && textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length)) BDFDB.removeEles(".autocompleteEditChannels", ".autocompleteEditChannelsRow");
				});
				BDFDB.addEventListener(this, textarea, "click", e => {
					if (textarea.selectionStart == textarea.selectionEnd && textarea.selectionEnd == textarea.value.length) setImmediate(() => {this.addAutoCompleteMenu(textarea, channel);});
				});
			}
		}
	}

	processAuditLog (instance, wrapper, returnvalue) {
		let channel = BDFDB.getReactValue(instance, "props.log.options.channel");
		if (channel) {
			let hooks = wrapper.querySelectorAll(`${BDFDB.dotCN.flexchild} > span${BDFDB.notCN.auditloguserhook}`);
			if (hooks.length > 0) this.changeChannel2(channel, hooks[0].firstChild);
		} 
	}

	processInviteCard (instance, wrapper, returnvalue) {
		let invite = BDFDB.getReactValue(instance, "props.invite");
		if (invite && invite.inviter && invite.channel) {
			let channelname = wrapper.querySelector(BDFDB.dotCN.guildsettingsinvitechannelname);
			if (channelname) this.changeChannel2(invite.channel, channelname);
		}
	}

	processChannelCategoryItem (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.channel) {
			this.changeChannel(instance.props.channel, wrapper.querySelector(BDFDB.dotCN.categoryname), true);
		}
	}

	processChannelItem (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.channel) {
			this.changeChannel(instance.props.channel, wrapper.querySelector(BDFDB.dotCN.channelname), true);
		}
	}

	processHeaderBarContainer (instance, wrapper, returnvalue) {
		this.processHeaderBar(instance, wrapper);
	}

	processHeaderBar (instance, wrapper, returnvalue) {
		let channel_id = BDFDB.getReactValue(instance, "props.channelId") || BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.channelId");
		if (channel_id) {
			let channelname = wrapper.querySelector(BDFDB.dotCN.channelheaderheaderbartitle);
			if (channelname) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(channel_id);
				if (channel) {
					if (channel.type == 0 || channel.type == 2) this.changeChannel(channel, channelname);
					else {
						if (channel.type == 1) channel = BDFDB.LibraryModules.UserStore.getUser(channel.recipients[0]) || channel;
						if (channelname.EditChannelsChangeObserver && typeof channelname.EditChannelsChangeObserver.disconnect == "function") channelname.EditChannelsChangeObserver.disconnect();
						if (BDFDB.isPluginEnabled("EditUsers")) BDFDB.getPlugin("EditUsers").changeName(channel, channelname);
						else {
							channelname.style.removeProperty("color");
							channelname.style.removeProperty("background");
							BDFDB.setInnerText(channelname, channel.name || channel.username);
						}
					}
				}
			}
		}
	}

	processClickable (instance, wrapper, returnvalue) {
		if (!instance.props || !instance.props.className) return;
		else if (instance.props.tag == "span" && instance.props.className.indexOf(BDFDB.disCN.mentionwrapper) > -1 && instance.props.className.indexOf(BDFDB.disCN.mention) == -1) {
			let children = BDFDB.getReactValue(instance, "_reactInternalFiber.memoizedProps.children");
			if (children && typeof children[0] == "string") {
				let channelname = children[0].slice(1);
				let categoryname = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.type.displayName") == "Tooltip" ? BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.memoizedProps.text") : null
				let channelid = BDFDB.LibraryModules.LastGuildStore.getGuildId();
				let channels = channelid ? (BDFDB.LibraryModules.GuildChannelStore.getChannels(channelid)[0] || BDFDB.LibraryModules.GuildChannelStore.getChannels(channelid).SELECTABLE) : null;
				if (Array.isArray(channels)) for (let channel of channels) {
					if (channelname == channel.channel.name) {
						let category = categoryname ? BDFDB.LibraryModules.ChannelStore.getChannel(channel.channel.parent_id) : null;
						if (!category || category && categoryname == category.name) {
							this.changeMention(channel.channel, wrapper, category || {});
							break;
						}
					}
				}
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.quickswitchresult) > -1) {
			let channel = BDFDB.getReactValue(instance, "_reactInternalFiber.return.return.memoizedProps.channel");
			if (channel) {
				this.changeChannel(channel, wrapper.querySelector(BDFDB.dotCN.quickswitchresultmatch));
				if (channel.parent_id) this.changeChannel(BDFDB.LibraryModules.ChannelStore.getChannel(channel.parent_id), wrapper.querySelector(BDFDB.dotCN.quickswitchresultnote));
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.autocompleterow) > -1) {
			let channel = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.channel");
			if (channel) {
				this.changeChannel(channel, wrapper.querySelector(BDFDB.dotCN.marginleft4));
				let category = BDFDB.getReactValue(instance, "_reactInternalFiber.return.memoizedProps.category");
				if (category) this.changeChannel(category, wrapper.querySelector(BDFDB.dotCN.autocompletedescription));
			}
		}
		else if (instance.props.tag == "span" && instance.props.className.indexOf(BDFDB.disCN.messagespopoutchannelname) > -1) {
			let channel = BDFDB.getReactValue(instance, "_reactInternalFiber.return.sibling.child.child.memoizedProps.channel");
			if (channel) this.changeChannel2(channel, wrapper);
		}
	}

	processStandardSidebarView (instance, wrapper, returnvalue) {
		if (this.SettingsUpdated) {
			delete this.SettingsUpdated;
			this.forceUpdateAll();
		}
	}

	changeAppTitle () {
		let channel = BDFDB.LibraryModules.ChannelStore.getChannel(BDFDB.LibraryModules.LastChannelStore.getChannelId());
		let title = document.head.querySelector("title");
		if (title && channel && channel.type != 1) {
			let data = this.getChannelData(channel.id, channel.parent_id, title);
			BDFDB.setInnerText(title, "@" + (data.name || channel.name));
		}
	}

	changeChannel (info, channelname, hoverlistener = false) {
		if (!info || !channelname || !channelname.parentElement) return;
		var change = () => {
			if (channelname.EditChannelsChangeObserver && typeof channelname.EditChannelsChangeObserver.disconnect == "function") channelname.EditChannelsChangeObserver.disconnect();
			let data = this.getChannelData(info.id, info.parent_id, channelname);
			if (data.name || data.color || channelname.parentElement.getAttribute("changed-by-editchannels")) {
				let isgradient = data.color && BDFDB.isObject(data.color);
				let color = this.chooseColor(channelname, data.color);
				if (isgradient) {
					channelname.style.setProperty("color", BDFDB.colorCONVERT(data.color[Object.keys(data.color)[0]], "RGBA"), "important");
					BDFDB.setInnerText(channelname, BDFDB.htmlToElement(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.colorGRADIENT(color)} !important;">${BDFDB.encodeToHTML(data.name || info.name)}</span>`));
				}
				else {
					channelname.style.setProperty("color", color, "important");
					BDFDB.setInnerText(channelname, data.name || info.name);
				}
				let iconparent = BDFDB.containsClass(channelname, BDFDB.disCN.quickswitchresultmatch) ? channelname.parentElement.parentElement : channelname.parentElement;
				if (!BDFDB.containsClass(channelname, BDFDB.disCN.autocompletedescription)) {
					let settings = BDFDB.getAllData(this, "settings");
					iconparent.querySelectorAll('svg [stroke]:not([stroke="none"]').forEach(icon => {
						let iconcolor = color && BDFDB.getParentEle(BDFDB.dotCN.channelheadertitle, icon) ? BDFDB.colorSETALPHA(isgradient ? color[0] : color, 0.6) : (isgradient ? color[0] : color);
						if (!icon.getAttribute("oldstroke")) icon.setAttribute("oldstroke", icon.getAttribute("stroke"));
						icon.setAttribute("stroke", iconcolor && settings.changeChannelIcon ? iconcolor : icon.getAttribute("oldstroke"), "important");
						icon.style.setProperty("stroke", iconcolor && settings.changeChannelIcon ? iconcolor : icon.getAttribute("oldstroke"), "important");
					});
					iconparent.querySelectorAll('svg [fill]:not([fill="none"]').forEach(icon => {
						let iconcolor = color && BDFDB.getParentEle(BDFDB.dotCN.channelheadertitle, icon) ? BDFDB.colorSETALPHA(isgradient ? color[0] : color, 0.6) : (isgradient ? color[0] : color);
						if (!icon.getAttribute("oldfill")) icon.setAttribute("oldfill", icon.getAttribute("fill"));
						icon.setAttribute("fill", iconcolor && settings.changeChannelIcon ? iconcolor : icon.getAttribute("oldfill"), "important");
						icon.style.setProperty("fill", iconcolor && settings.changeChannelIcon ? iconcolor : icon.getAttribute("oldfill"), "important");
					});
					let unread = iconparent.parentElement.querySelector(BDFDB.dotCN.channelunread);
					if (unread) unread.style.setProperty("background-color", color && settings.changeUnreadIndicator ? (isgradient ? color[0] : color) : null, "important");
				}
				if (data.name || data.color) {
					channelname.parentElement.setAttribute("changed-by-editchannels", true);
					channelname.EditChannelsChangeObserver = new MutationObserver((changes, _) => {
						changes.forEach(
							(change, i) => {
								if (change.type == "childList" && change.addedNodes.length && change.target.tagName && (change.target.tagName == "SVG" || change.target.querySelector("svg")) || change.type == "attributes" && change.attributeName == "class" && change.target.className.length && change.target.className.indexOf("name") > -1 || change.type == "attributes" && change.attributeName == "style" && BDFDB.containsClass(change.target, BDFDB.disCN.channelheaderheaderbartitle)) {
									channelname.EditChannelsChangeObserver.disconnect();
									this.changeChannel(info, channelname);
								}
							}
						);
					});
					channelname.EditChannelsChangeObserver.observe(iconparent, {attributes:true, childList:true, subtree:true});
				}
				else channelname.parentElement.removeAttribute("changed-by-editchannels");
			}
		}
		change();
		if (hoverlistener) {
			let wrapper = info.type == 4 ? BDFDB.getParentEle(BDFDB.dotCN.categorywrapper, channelname) : BDFDB.getParentEle(BDFDB.dotCN.channelwrapper, channelname);
			if (wrapper) {
				wrapper.removeEventListener("mouseover", wrapper.mouseoverListenerEditChannels);
				wrapper.removeEventListener("mouseout", wrapper.mouseoutListenerEditChannels);
				wrapper.mouseoverListenerEditChannels = () => {
					channelname.EditChannelsHovered = true;
					change();
				};
				wrapper.mouseoutListenerEditChannels = () => {
					delete channelname.EditChannelsHovered;
					change();
				};
				wrapper.addEventListener("mouseover", wrapper.mouseoverListenerEditChannels);
				wrapper.addEventListener("mouseout", wrapper.mouseoutListenerEditChannels);
			}
		}
	}

	changeChannel2 (info, channelname) {
		if (!info || !channelname || !channelname.parentElement) return;
		if (channelname.EditChannelsChangeObserver && typeof channelname.EditChannelsChangeObserver.disconnect == "function") channelname.EditChannelsChangeObserver.disconnect();
		let data = this.getChannelData(info.id, info.parent_id, channelname);
		if (data.name || data.color || channelname.getAttribute("changed-by-editchannels")) {
			if (BDFDB.isObject(data.color)) {
				channelname.style.setProperty("color", BDFDB.colorCONVERT(data.color[Object.keys(data.color)[0]], "RGBA"), "important");
				BDFDB.setInnerText(channelname, BDFDB.htmlToElement(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.colorGRADIENT(this.chooseColor(channelname, data.color))} !important;">${BDFDB.encodeToHTML("#" + (data.name || info.name))}</span>`));
			}
			else {
				channelname.style.setProperty("color", this.chooseColor(channelname, data.color), "important");
				BDFDB.setInnerText(channelname, "#" + (data.name || info.name));
			}
			if (data.name || data.color) {
				channelname.setAttribute("changed-by-editchannels", true);
				channelname.EditChannelsChangeObserver = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.type == "childList" && change.addedNodes.length && change.target.tagName && (change.target.tagName == "SVG" || change.target.querySelector("svg")) || change.type == "attributes" && change.attributeName == "class" && change.target.className.length && change.target.className.indexOf("name") > -1) {
								channelname.EditChannelsChangeObserver.disconnect();
								this.changeChannel2(info, channelname);
							}
						}
					);
				});
				channelname.EditChannelsChangeObserver.observe(channelname.parentElement, {attributes:true, childList:true, subtree:true});
			}
			else channelname.removeAttribute("changed-by-editchannels");
		}
	}

	changeMention (info, mention, categoryinfo) {
		if (!info || !mention || !mention.parentElement) return;
		if (mention.EditChannelsChangeObserver && typeof mention.EditChannelsChangeObserver.disconnect == "function") mention.EditChannelsChangeObserver.disconnect();
		mention.removeEventListener("mouseover", mention.mouseoverListenerEditChannels);
		mention.removeEventListener("mouseout", mention.mouseoutListenerEditChannels);
		let data = this.getChannelData(info.id, info.parent_id, mention);
		let name = "#" + (data.name || info.name);

		let isgradient = data.color && BDFDB.isObject(data.color);
		let color = isgradient ? BDFDB.colorGRADIENT(data.color) : BDFDB.colorCONVERT(data.color, "RGBA");
		let color0_1 = isgradient ? BDFDB.colorGRADIENT(BDFDB.colorSETALPHA(data.color, 0.1, "RGBA")) : BDFDB.colorSETALPHA(data.color, 0.1, "RGBA");
		let color0_7 = isgradient ? BDFDB.colorGRADIENT(BDFDB.colorSETALPHA(data.color, 0.7, "RGBA")) : BDFDB.colorSETALPHA(data.color, 0.7, "RGBA");

		if (mention.EditChannelsHovered) colorHover();
		else colorDefault();
		mention.mouseoverListenerEditChannels = () => {
			mention.EditChannelsHovered = true;
			colorHover();
			let categorydata = this.getChannelData(categoryinfo.id, null, mention);
			if (categorydata.name) BDFDB.createTooltip(categorydata.name, mention, {type:"top", selector:"EditChannels-tooltip", hide:true});
		};
		mention.mouseoutListenerEditChannels = () => {
			delete mention.EditChannelsHovered;
			colorDefault();
		};
		mention.addEventListener("mouseover", mention.mouseoverListenerEditChannels);
		mention.addEventListener("mouseout", mention.mouseoutListenerEditChannels);
		mention.EditChannelsChangeObserver = new MutationObserver((changes, _) => {
			mention.EditChannelsChangeObserver.disconnect();
			this.changeMention(info, mention, categoryinfo);
		});
		mention.EditChannelsChangeObserver.observe(mention, {attributes:true});
		function colorDefault() {
			mention.style.setProperty("background", color0_1, "important");
			if (isgradient) {
				mention.style.setProperty("color", BDFDB.colorCONVERT(data.color[Object.keys(data.color)[0]], "RGBA"), "important");
				BDFDB.setInnerText(mention, BDFDB.htmlToElement(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${color} !important;">${BDFDB.encodeToHTML(name)}</span>`));
			}
			else {
				mention.style.setProperty("color", color, "important");
				BDFDB.setInnerText(mention, name);
			}
		}
		function colorHover() {
			mention.style.setProperty("background", color0_7, "important");
			mention.style.setProperty("color", data.color ? "#FFFFFF" : null, "important");
			BDFDB.setInnerText(mention, name);
		}
	}

	chooseColor (channelname, color) {
		if (color && channelname) {
			let hovered = channelname.EditChannelsHovered;
			channelname = BDFDB.containsClass(channelname, BDFDB.disCN.channelname) ? channelname.parentElement.parentElement : channelname;
			let classname = channelname.className ? channelname.className.toLowerCase() : "";
			if (classname.indexOf("muted") > -1 || classname.indexOf("locked") > -1) color = BDFDB.colorCHANGE(color, -0.5);
			else if (hovered || classname.indexOf("selected") > -1 || classname.indexOf("hovered") > -1 || classname.indexOf("unread") > -1 || classname.indexOf("connected") > -1) color = BDFDB.colorCHANGE(color, 0.5);
			return BDFDB.isObject(color) ? color : BDFDB.colorCONVERT(color, "RGBA");
		}
		return null;
	}

	getChannelData (id, categoryid, wrapper) {
		let data = BDFDB.loadData(id, this, "channels");
		let categorydata = categoryid ? BDFDB.loadData(categoryid, this, "channels") : null;
		if (!data && (!categorydata || (categorydata && !categorydata.color && !categorydata.inheritColor))) return {};
		if (!data) data = {};
		data.color = data.color ? data.color : (categorydata && categorydata.color && categorydata.inheritColor ? categorydata.color : null);
		let allenabled = true, settings = BDFDB.getAllData(this, "settings");
		for (let i in settings) if (!settings[i]) {
			allenabled = false;
			break;
		}
		if (allenabled) return data;
		let key = null;
		if (BDFDB.getParentEle(BDFDB.dotCN.textareawrapchat, wrapper)) key = "changeInChatTextarea";
		else if (BDFDB.containsClass(wrapper, BDFDB.disCN.mentionwrapper)) key = "changeInMentions";
		else if (BDFDB.getParentEle(BDFDB.dotCN.guildchannels, wrapper)) key = "changeInChannelList";
		else if (BDFDB.getParentEle(BDFDB.dotCN.channelheaderheaderbar, wrapper)) key = "changeInChannelHeader";
		else if (BDFDB.getParentEle(BDFDB.dotCN.recentmentionspopout, wrapper)) key = "changeInRecentMentions";
		else if (BDFDB.getParentEle(BDFDB.dotCN.autocomplete, wrapper)) key = "changeInAutoComplete";
		else if (BDFDB.getParentEle(BDFDB.dotCN.auditlog, wrapper)) key = "changeInAuditLog";
		else if (BDFDB.getParentEle(BDFDB.dotCN.guildsettingsinvitecard, wrapper)) key = "changeInInviteLog";
		else if (BDFDB.getParentEle(BDFDB.dotCN.searchpopout, wrapper) || BDFDB.getParentEle(BDFDB.dotCN.quickswitcher, wrapper)) key = "changeInSearchPopout";

		return !key || settings[key] ? data : {};
	}

	addAutoCompleteMenu (textarea, channel) {
		if (textarea.parentElement.querySelector(".autocompleteEditChannelsRow")) return;
		let words = textarea.value.split(/\s/);
		let lastword = words[words.length-1].trim();
		if (lastword && lastword.length > 1 && lastword[0] == "#") {
			let channels = BDFDB.loadAllData(this, "channels");
			if (!channels) return;
			let channelarray = [];
			for (let id in channels) if (channels[id].name) {
				let channel = BDFDB.LibraryModules.ChannelStore.getChannel(id);
				let category = channel && channel.parent_id ? BDFDB.LibraryModules.ChannelStore.getChannel(channel.parent_id) : null;
				let catdata = (category ? channels[category.id] : null) || {};
				if (channel && channel.type == 0) channelarray.push(Object.assign({lowercasename:channels[id].name.toLowerCase(),lowercasecatname:(catdata && catdata.name ? catdata.name.toLowerCase() : null),channel,category,catdata},channels[id]));
			}
			channelarray = BDFDB.sortArrayByKey(channelarray.filter(n => n.lowercasename.indexOf(lastword.toLowerCase().slice(1)) != -1 || (n.lowercasecatname && n.lowercasecatname.indexOf(lastword.toLowerCase().slice(1)) != -1)), "lowercasename");
			if (channelarray.length) {
				let settings = BDFDB.getAllData(this, "settings");
				let autocompletemenu = textarea.parentElement.querySelector(BDFDB.dotCNS.autocomplete + BDFDB.dotCN.autocompleteinner), amount = 15;
				if (!autocompletemenu) {
					autocompletemenu = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.autocomplete + BDFDB.disCN.autocomplete2} autocompleteEditChannels"><div class="${BDFDB.disCN.autocompleteinner}"><div class="${BDFDB.disCNS.autocompleterowvertical + BDFDB.disCN.autocompleterow} autocompleteEditChannelsRow"><div class="${BDFDB.disCN.autocompleteselector} autocompleteEditChannelsSelector"><div class="${BDFDB.disCNS.autocompletecontenttitle + BDFDB.disCNS.small + BDFDB.disCNS.titlesize12 + BDFDB.disCNS.height16 + BDFDB.disCN.weightsemibold}">${BDFDB.LanguageUtils.LanguageStrings.TEXT_CHANNELS_MATCHING.replace("{{prefix}}", BDFDB.encodeToHTML(lastword))}</strong></div></div></div></div></div>`);
					textarea.parentElement.appendChild(autocompletemenu);
					autocompletemenu = autocompletemenu.firstElementChild;
				}
				else {
					amount -= autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselectable).length;
				}

				BDFDB.addEventListener(this, autocompletemenu, "mouseenter", BDFDB.dotCN.autocompleteselectable, e => {
					var selected = autocompletemenu.querySelectorAll(BDFDB.dotCN.autocompleteselected);
					BDFDB.removeClass(selected, BDFDB.disCN.autocompleteselected);
					BDFDB.addClass(selected, BDFDB.disCN.autocompleteselector);
					BDFDB.addClass(e.currentTarget, BDFDB.disCN.autocompleteselected);
				});

				for (let data of channelarray) {
					if (amount-- < 1) break;
					let color = BDFDB.colorCONVERT(data.color, "RGBA");
					let catcolor = BDFDB.colorCONVERT(data.catdata.color, "RGBA");
					let autocompleterow = BDFDB.htmlToElement(`<div class="${BDFDB.disCNS.autocompleterowvertical + BDFDB.disCN.autocompleterow} autocompleteEditChannelsRow"><div channelid="${data.channel.id}" class="${BDFDB.disCNS.autocompleteselector + BDFDB.disCN.autocompleteselectable} autocompleteEditChannelsSelector"><div class="${BDFDB.disCNS.flex + BDFDB.disCNS.horizontal + BDFDB.disCNS.justifystart + BDFDB.disCNS.aligncenter + BDFDB.disCNS.nowrap + BDFDB.disCN.autocompletecontent}" style="flex: 1 1 auto;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="${BDFDB.disCN.autocompleteicon}"><path class="${BDFDB.disCN.autocompleteiconforeground}" d="M2.27333333,12 L2.74666667,9.33333333 L0.08,9.33333333 L0.313333333,8 L2.98,8 L3.68666667,4 L1.02,4 L1.25333333,2.66666667 L3.92,2.66666667 L4.39333333,0 L5.72666667,0 L5.25333333,2.66666667 L9.25333333,2.66666667 L9.72666667,0 L11.06,0 L10.5866667,2.66666667 L13.2533333,2.66666667 L13.02,4 L10.3533333,4 L9.64666667,8 L12.3133333,8 L12.08,9.33333333 L9.41333333,9.33333333 L8.94,12 L7.60666667,12 L8.08,9.33333333 L4.08,9.33333333 L3.60666667,12 L2.27333333,12 L2.27333333,12 Z M5.02,4 L4.31333333,8 L8.31333333,8 L9.02,4 L5.02,4 L5.02,4 Z" transform="translate(1.333 2)" ${settings.changeChannelIcon && color ? ('fill="' + color + '" oldfill="currentColor" style="fill: ' + color + ' !important;"') : 'fill="currentColor"'}></path></svg><div class="${BDFDB.disCN.marginleft4}" changed-by-editchannels="true" style="flex: 1 1 auto;${color ? (' color: ' + color + ' !important;') : ''}">${BDFDB.encodeToHTML(data.name || data.channel.name)}</div>${data.category ? '<div class="${BDFDB.disCN.autocompletedescription}"' + (catcolor ? (' style="color: ' + catcolor + ' !important;"') : '') + '>' + BDFDB.encodeToHTML(data.catdata.name || data.category.name) + '</div>' : ''}</div></div></div>`);
					autocompleterow.querySelector(BDFDB.dotCN.autocompleteselectable).addEventListener("click", () => {this.swapWordWithMention(textarea);});
					autocompletemenu.appendChild(autocompleterow);
				}
				if (!autocompletemenu.querySelector(BDFDB.dotCN.autocompleteselected)) {
					BDFDB.addClass(autocompletemenu.querySelector(".autocompleteEditChannelsRow " + BDFDB.dotCN.autocompleteselectable), BDFDB.disCN.autocompleteselected);
				}
			}
		}
	}

	getNextSelection (menu, selected, forward) {
		selected = selected ? selected : menu.querySelector(BDFDB.dotCN.autocompleteselected).parentElement;
		let next, sibling = forward ? selected.nextElementSibling : selected.previousElementSibling;
		if (sibling) {
			next = sibling.querySelector(BDFDB.dotCN.autocompleteselectable);
		}
		else {
			let items = menu.querySelectorAll(BDFDB.dotCN.autocompleteselectable);
			next = forward ? items[0] : items[items.length-1];
		}
		return next ? next : this.getNextSelection(menu, sibling, forward);
	}

	swapWordWithMention (textarea) {
		let selected = textarea.parentElement.querySelector(".autocompleteEditChannelsRow " + BDFDB.dotCN.autocompleteselected);
		let channelid = selected ? selected.getAttribute("channelid") : null;
		let words = textarea.value.split(/\s/);
		let lastword = words[words.length-1].trim();
		if (channelid && lastword) {
			BDFDB.removeEles(".autocompleteEditChannels", ".autocompleteEditChannelsRow");
			textarea.focus();
			textarea.selectionStart = textarea.value.length - lastword.length;
			textarea.selectionEnd = textarea.value.length;
			document.execCommand("insertText", false, `<#${channelid}> `);
			textarea.selectionStart = textarea.value.length;
			textarea.selectionEnd = textarea.value.length;
		}
	}

	setLabelsByLanguage () {
		switch (BDFDB.getDiscordLanguage().id) {
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
					context_localchannelsettings_text:		"Paramètres locale du canal",
					submenu_channelsettings_text:			"Modifier les paramètres",
					submenu_resetsettings_text:				"Réinitialiser le canal",
					modal_header_text:						"Paramètres locale du canal",
					modal_channelname_text:					"Nom local du canal",
					modal_colorpicker1_text:				"Couleur locale de la chaîne",
					modal_inheritcolor_text:				"Hériter de la couleur sur les sous-canaux"
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
