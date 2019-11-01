//META{"name":"EditServers","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditServers","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EditServers/EditServers.plugin.js"}*//

class EditServers {
	getName () {return "EditServers";}

	getVersion () {return "2.1.1";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to change the icon, name and color of servers.";}

	constructor () {
		this.changelog = {
			"fixed":[["Tooltips","Fixed issue where native tooltip wasn't hidden"]]
		};

		this.patchModules = {
			"Guild":"componentDidMount",
			"GuildIconWrapper":"componentDidMount",
			"GuildHeader":["componentDidMount","componentDidUpdate"],
			"Clickable":"componentDidMount"
		};
	}

	initConstructor () {
		this.defaults = {
			settings: {
				addOriginalTooltip:		{value:true, 	inner:false,	description:"Hovering over a changed Server Header shows the original Name as Tooltip"},
				changeInGuildList:		{value:true, 	inner:true,		description:"Server List"},
				changeInMutualGuilds:	{value:true, 	inner:true,		description:"Mutual Servers"},
				changeInGuildHeader:	{value:true, 	inner:true,		description:"Server Header"},
				changeInSearchPopout:	{value:true, 	inner:true,		description:"Search Popout"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		var settingsitems = [], inneritems = [];
		
		for (let key in settings) (!this.defaults.settings[key].inner ? settingsitems : inneritems).push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSwitch, {
			className: BDFDB.disCN.marginbottom8,
			plugin: this,
			keys: ["settings", key],
			label: this.defaults.settings[key].description,
			value: settings[key]
		}));
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
			title: "Change Servers in:",
			children: inneritems
		}));
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
			type: "Button",
			className: BDFDB.disCN.marginbottom8,
			color: BDFDB.LibraryComponents.Button.Colors.RED,
			label: "Reset all Servers",
			onClick: _ => {
				BDFDB.ModalUtils.confirm(this, "Are you sure you want to reset all servers?", () => {
					BDFDB.DataUtils.remove(this, "servers");
					this.forceUpdateAll();
				});
			},
			children: BDFDB.LanguageUtils.LanguageStrings.RESET
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
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);

			BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.IconUtils, 'getGuildBannerURL', {instead:e => {
				let guild = BDFDB.LibraryModules.GuildStore.getGuild(e.methodArguments[0].id);
				if (guild) {
					if (e.methodArguments[0].id == "410787888507256842") return guild.banner;
					let data = BDFDB.DataUtils.load(this, "servers", guild.id);
					if (data && data.banner && !data.removeBanner) return data.banner;
				}
				return e.callOriginalMethod();
			}});
			
			this.forceUpdateAll();
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			let data = BDFDB.DataUtils.load(this, "servers");
			BDFDB.DataUtils.remove(this, "servers");
			try {this.forceUpdateAll();} catch (err) {}
			BDFDB.DataUtils.save(data, this, "servers");

			for (let guildobj of BDFDB.GuildUtils.getAll()) if (guildobj.instance) {
				delete guildobj.instance.props.guild.EditServersCachedBanner;
			}

			BDFDB.PluginUtils.clear(this);
		}
	}

	// begin of own functions
	
	onGuildContextMenu (instance, menu, returnvalue) {
		if (instance.props && instance.props.guild && !menu.querySelector(`${this.name}-contextMenuSubItem`)) {
			let [children, index] = BDFDB.ReactUtils.findChildren(returnvalue, {name:["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]});
			const itemgroup = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuSubItem, {
						label: this.labels.context_localserversettings_text,
						className: `BDFDB-contextMenuSubItem ${this.name}-contextMenuSubItem ${this.name}-serversettings-contextMenuSubItem`,
						render: [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
							className: `BDFDB-contextMenuItemGroup ${this.name}-contextMenuItemGroup`,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
									label: this.labels.submenu_serversettings_text,
									className: `BDFDB-ContextMenuItem ${this.name}-ContextMenuItem ${this.name}-serversettings-ContextMenuItem`,
									action: e => {
										BDFDB.ContextMenuUtils.close(menu);
										this.showServerSettings(instance.props.guild);
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
									label: this.labels.submenu_resetsettings_text,
									className: `BDFDB-ContextMenuItem ${this.name}-ContextMenuItem ${this.name}-resetsettings-ContextMenuItem`,
									disabled: !BDFDB.DataUtils.load(this, "servers", instance.props.guild.id),
									action: e => {
										BDFDB.ContextMenuUtils.close(menu);
										BDFDB.DataUtils.remove(this, "servers", instance.props.guild.id);
										this.forceUpdateAll(instance.props.guild.id);
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

	processGuild (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.guild) {
			let icon = wrapper.querySelector(BDFDB.dotCN.guildicon + ":not(.fake-guildicon), " + BDFDB.dotCN.guildiconacronym + ":not(.fake-guildacronym)");
			if (!icon) return;
			this.changeGuildIcon(instance.props.guild, icon);
			this.changeTooltip(instance.props.guild, wrapper.querySelector(BDFDB.dotCN.guildcontainer), "right");
		}
	}

	processGuildIconWrapper (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.guild) {
			let icon = wrapper.classList && BDFDB.DOMUtils.containsClass(wrapper, BDFDB.disCN.avataricon) ? wrapper : wrapper.querySelector(BDFDB.dotCN.avataricon);
			if (!icon) return;
			this.changeGuildIcon(instance.props.guild, icon);
			if (BDFDB.DOMUtils.getParent(BDFDB.dotCN.friendscolumn, icon)) this.changeTooltip(instance.props.guild, icon.parentElement, "top");
		}
	}

	processGuildHeader (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.guild) {
			this.changeGuildName(instance.props.guild, wrapper.querySelector(BDFDB.dotCN.guildheadername));
		}
	}

	processClickable (instance, wrapper, returnvalue) {
		if (!wrapper || !instance.props || !instance.props.className) return;
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.userprofilelistrow) > -1) {
			let guild = BDFDB.ReactUtils.getValue(instance, "_reactInternalFiber.return.memoizedProps.guild");
			if (guild && BDFDB.ReactUtils.getValue(instance, "_reactInternalFiber.return.type.displayName") == "GuildRow") {
				this.changeGuildName(guild, wrapper.querySelector(BDFDB.dotCN.userprofilelistname));
			}
		}
		else if (instance.props.tag == "div" && instance.props.className.indexOf(BDFDB.disCN.quickswitchresult) > -1) {
			let guild = BDFDB.ReactUtils.getValue(instance, "_reactInternalFiber.return.return.memoizedProps.guild");
			if (guild) this.changeGuildName(guild, wrapper.querySelector(BDFDB.dotCN.quickswitchresultmatch));
			else {
				let channel = BDFDB.ReactUtils.getValue(instance, "_reactInternalFiber.return.return.memoizedProps.channel");
				if (channel && channel.guild_id) this.changeGuildName(BDFDB.LibraryModules.GuildStore.getGuild(channel.guild_id), wrapper.querySelector(BDFDB.dotCN.quickswitchresultmisccontainer));
			}
		}
	}
	
	forceUpdateAll (guildid) {
		this.updateGuildSidebar();
		BDFDB.ModuleUtils.forceAllUpdates(this);
		if (guildid) {
			let ServerFolders = BDFDB.BDUtils.getPlugin("ServerFolders", true);
			if (ServerFolders) {
				let folder = ServerFolders.getFolderOfGuildId(guildid);
				if (folder) ServerFolders.updateGuildInFolderContent(folder.folderId, guildid);
			}
		}
	}

	showServerSettings (info) {
		var data = BDFDB.DataUtils.load(this, "servers", info.id) || {};
		
		BDFDB.ModalUtils.open(this, {
			size: "MEDIUM",
			header: this.labels.modal_header_text,
			subheader: info.name,
			children: [
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
					tab: this.labels.modal_tabheader1_text,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_guildname_text,
							className: BDFDB.disCN.marginbottom20 + " input-guildname",
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									value: data.name,
									placeholder: info.name,
									autoFocus: true
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_guildacronym_text,
							className: BDFDB.disCN.marginbottom20 + " input-guildacronym",
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									value: data.shortName,
									placeholder: info.acronym
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_guildicon_text,
							className: BDFDB.disCN.marginbottom8 + " input-guildicon",
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									inputClassName: !data.removeIcon && data.url ? BDFDB.disCN.inputsuccess : null,
									inputId: "GUILDICON",
									value: data.url,
									placeholder: BDFDB.GuildUtils.getIcon(info.id),
									disabled: data.removeIcon,
									onFocus: e => {
										this.createNoticeTooltip(e.target);
									},
									onChange: (value, instance) => {
										this.checkUrl(value, instance);
									}
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Switch",
							className: BDFDB.disCN.marginbottom20 + " input-removeicon",
							label: this.labels.modal_removeicon_text,
							value: data.removeIcon,
							onChange: (value, instance) => {
								let iconinputins = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {props:[["inputId","GUILDICON"]]});
								if (iconinputins) {
									iconinputins.props.inputClassName = null;
									iconinputins.props.disabled = value;
									iconinputins.forceUpdate();
								}
							}
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_guildbanner_text,
							className: BDFDB.disCN.marginbottom8 + " input-guildbanner",
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									inputClassName: !data.removeBanner && data.banner ? BDFDB.disCN.inputsuccess : null,
									inputId: "GUILDBANNER",
									value: data.banner,
									placeholder: BDFDB.GuildUtils.getBanner(info.id),
									disabled: data.removeBanner || info.id == "410787888507256842",
									onFocus: e => {
										this.createNoticeTooltip(e.target);
									},
									onChange: (value, instance) => {
										this.checkUrl(value, instance);
									}
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Switch",
							className: BDFDB.disCN.marginbottom20 + " input-removebanner",
							label: this.labels.modal_removebanner_text,
							value: data.removeBanner,
							disabled: info.id == "410787888507256842",
							onChange: (value, instance) => {
								let bannerinputins = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {props:[["inputId","GUILDBANNER"]]});
								if (bannerinputins) {
									bannerinputins.props.inputClassName = null;
									bannerinputins.props.disabled = value;
									bannerinputins.forceUpdate();
								}
							}
						})
					]
				}),
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
					tab: this.labels.modal_tabheader2_text,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_colorpicker1_text,
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color1,
									number: 1
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_colorpicker2_text,
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color2,
									number: 2
								})
							]
						})
					]
				}),
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
					tab: this.labels.modal_tabheader3_text,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_colorpicker3_text,
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color3,
									number: 3
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_colorpicker4_text,
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color4,
									number: 4
								})
							]
						})
					]
				})
			],
			buttons: [{
				contents: BDFDB.LanguageUtils.LanguageStrings.SAVE,
				color: "BRAND",
				close: true,
				click: modal => {
					let olddata = Object.assign({}, data);
					
					let guildnameinput = modal.querySelector(".input-guildname " + BDFDB.dotCN.input);
					let guildacronyminput = modal.querySelector(".input-guildacronym " + BDFDB.dotCN.input);
					let guildiconinput = modal.querySelector(".input-guildicon " + BDFDB.dotCN.input);
					let removeiconinput = modal.querySelector(".input-removeicon " + BDFDB.dotCN.switchinner);
					let guildbannerinput = modal.querySelector(".input-guildbanner " + BDFDB.dotCN.input);
					let removebannerinput = modal.querySelector(".input-removebanner " + BDFDB.dotCN.switchinner);
					
					data.name = guildnameinput.value.trim() || null;
					data.shortName = guildacronyminput.value.trim() || null;
					data.url = (!data.removeIcon && BDFDB.DOMUtils.containsClass(guildiconinput, BDFDB.disCN.inputsuccess) ? guildiconinput.value.trim() : null) || null;
					data.removeIcon = removeiconinput.checked;
					data.banner = (!data.removeBanner && BDFDB.DOMUtils.containsClass(guildbannerinput, BDFDB.disCN.inputsuccess) ? guildbannerinput.value.trim() : null) || null;
					data.removeBanner = removebannerinput.checked && info.id != "410787888507256842";

					data.color1 = BDFDB.ColorUtils.getSwatchColor(modal, 1);
					data.color2 = BDFDB.ColorUtils.getSwatchColor(modal, 2);
					data.color3 = BDFDB.ColorUtils.getSwatchColor(modal, 3);
					data.color4 = BDFDB.ColorUtils.getSwatchColor(modal, 4);

					let changed = false;
					if (Object.keys(data).every(key => data[key] == null || data[key] == false) && (changed = true)) BDFDB.DataUtils.remove(this, "servers", info.id);
					else if (!BDFDB.equals(olddata, data) && (changed = true)) BDFDB.DataUtils.save(data, this, "servers", info.id);
					if (changed) this.forceUpdateAll(info.id);
				}
			}]
		});
	}
	
	checkUrl (url, instance) {
		let input = BDFDB.ReactUtils.findDOMNode(instance).firstElementChild;
		clearTimeout(instance.checkTimeout);
		if (url == null || !url.trim()) {
			if (input) BDFDB.DOMUtils.remove(input.tooltip);
			instance.props.inputClassName = null;
			instance.forceUpdate();
		}
		else instance.checkTimeout = setTimeout(() => {
			BDFDB.LibraryRequires.request(url.trim(), (error, response, result) => {
				if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") != -1) {
					if (input) BDFDB.DOMUtils.remove(input.tooltip);
					instance.props.inputClassName = BDFDB.disCN.inputsuccess;
				}
				else {
					this.createNoticeTooltip(input, true);
					instance.props.inputClassName = BDFDB.disCN.inputerror;
				}
				delete instance.checkTimeout;
				instance.forceUpdate();
			});
		}, 1000);
	}

	createNoticeTooltip (input, isinvalid = false) {
		if (!input) return;
		BDFDB.DOMUtils.remove(input.tooltip);
		var invalid = isinvalid || BDFDB.DOMUtils.containsClass(input, BDFDB.disCN.inputerror);
		var valid = invalid ? false : BDFDB.DOMUtils.containsClass(input, BDFDB.disCN.inputsuccess);
		if (invalid || valid) input.tooltip = BDFDB.TooltipUtils.create(input, invalid ? this.labels.modal_invalidurl_text : this.labels.modal_validurl_text, {type:"right", selector:"notice-tooltip", color: invalid ? "red" : "green"});
	}

	changeGuildName (info, guildname) {
		if (!info || !guildname || !guildname.parentElement) return;
		if (guildname.EditServersChangeObserver && typeof guildname.EditServersChangeObserver.disconnect == "function") guildname.EditServersChangeObserver.disconnect();
		guildname.removeEventListener("mouseenter", guildname.mouseenterListenerEditChannels);
		let data = this.getGuildData(info.id, guildname);
		if (data.name || data.color2 || guildname.getAttribute("changed-by-editservers")) {
			if (BDFDB.ObjectUtils.is(data.color2)) {
				guildname.style.setProperty("color", BDFDB.ColorUtils.convert(data.color2[Object.keys(data.color2)[0]], "RGBA"), "important");
				BDFDB.DOMUtils.setText(guildname, BDFDB.DOMUtils.create(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.ColorUtils.createGradient(data.color2)} !important;">${BDFDB.StringUtils.htmlEscape(data.name || info.name)}</span>`));
			}
			else {
				guildname.style.setProperty("color", BDFDB.ColorUtils.convert(data.color2, "RGBA"), "important");
				BDFDB.DOMUtils.setText(guildname, data.name || info.name);
			}
			if (data.name && BDFDB.DOMUtils.containsClass(guildname, BDFDB.disCN.guildheadername) && BDFDB.DataUtils.get(this, "settings", "addOriginalTooltip")) {
				guildname.mouseenterListenerEditChannels = () => {
					BDFDB.TooltipUtils.create(guildname.parentElement, info.name, {type:"right", selector:"EditServers-tooltip", hide:true});
				};
				guildname.addEventListener("mouseenter", guildname.mouseenterListenerEditChannels);
			}
			if (data.name || data.color2) {
				guildname.setAttribute("changed-by-editservers", true);
				guildname.EditServersChangeObserver = new MutationObserver((changes, _) => {
					guildname.EditServersChangeObserver.disconnect();
					this.changeName(info, guildname);
				});
				guildname.EditServersChangeObserver.observe(guildname, {attributes:true});
			}
			else guildname.removeAttribute("changed-by-editservers");
		}
	}

	changeGuildIcon (info, icon) {
		if (!info || !icon || !icon.parentElement) return;
		if (icon.EditServersChangeObserver && typeof icon.EditServersChangeObserver.disconnect == "function") icon.EditServersChangeObserver.disconnect();
		let data = this.getGuildData(info.id, icon);
		if (data.url || data.name || data.shortName || data.removeIcon || icon.getAttribute("changed-by-editservers")) {
			let url = data.url || BDFDB.GuildUtils.getIcon(info.id);
			let name = data.name || info.name || "";
			let shortname = data.url ? "" : (data.shortName || (info.icon && !data.removeIcon ? "" : info.acronym));
			if (BDFDB.DOMUtils.containsClass(icon.parentElement, BDFDB.disCN.guildiconwrapper)) icon.parentElement.setAttribute("aria-label", name);
			if (icon.tagName == "IMG") {
				icon.setAttribute("src", data.removeIcon ? null : url);
				let removeicon = data.removeIcon && BDFDB.DOMUtils.containsClass(icon, BDFDB.disCN.guildicon);
				BDFDB.DOMUtils.toggle(icon, !removeicon);
				BDFDB.DOMUtils.remove(icon.parentElement.querySelector(".fake-guildacronym"));
				if (removeicon) {
					let fakeicon = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCNS.guildiconchildwrapper + BDFDB.disCN.guildiconacronym} fake-guildacronym" aria-label="Server Acronym"></div>`);
					if (data.color1) {
						if (BDFDB.ObjectUtils.is(data.color1)) fakeicon.style.setProperty("background-image", BDFDB.ColorUtils.createGradient(data.color1));
						else fakeicon.style.setProperty("background-color", BDFDB.ColorUtils.convert(data.color1, "RGBA"));
					}
					if (data.color2) fakeicon.style.setProperty("color", BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data.color2) ? data.color2[Object.keys(data.color2)[0]] : data.color2, "RGBA"));
					BDFDB.DOMUtils.setText(fakeicon, BDFDB.ObjectUtils.is(data.color2) ? BDFDB.DOMUtils.create(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.ColorUtils.createGradient(data.color2)} !important;">${BDFDB.StringUtils.htmlEscape(shortname)}</span>`) : shortname);
					icon.parentElement.appendChild(fakeicon);
					fakeicon.style.setProperty("font-size", this.getFontSize(fakeicon));
				}
			}
			else {
				if (!data.removeIcon && !shortname && url) {
					BDFDB.DOMUtils.setText(icon, "");
					icon.style.setProperty("background-image", `url(${url})`);
				}
				else {
					if (data.color1) {
						if (BDFDB.ObjectUtils.is(data.color1)) icon.style.setProperty("background-image", BDFDB.ColorUtils.createGradient(data.color1));
						else icon.style.setProperty("background-color", BDFDB.ColorUtils.convert(data.color1, "RGBA"));
					}
					else {
						icon.style.removeProperty("background-image");
						icon.style.removeProperty("background-color");
					}
					if (data.color2) icon.style.setProperty("color", BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data.color2) ? data.color2[Object.keys(data.color2)[0]] : data.color2, "RGBA"));
					BDFDB.DOMUtils.setText(icon, BDFDB.ObjectUtils.is(data.color2) ? BDFDB.DOMUtils.create(`<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${BDFDB.ColorUtils.createGradient(data.color2)} !important;">${BDFDB.StringUtils.htmlEscape(shortname)}</span>`) : shortname);
				}
				icon.style.setProperty("font-size", this.getFontSize(icon));
				BDFDB.DOMUtils.toggleClass(icon, this.getNoIconClasses(icon), !icon.style.getPropertyValue("background-image") || BDFDB.ObjectUtils.is(data.color1));
				if (data.url && !data.removeIcon) {
					icon.style.setProperty("background-position", "center");
					icon.style.setProperty("background-size", "cover");
				}
			}
			if (data.url || data.name || data.shortName || data.removeIcon) {
				icon.setAttribute("changed-by-editservers", true);
				icon.EditServersChangeObserver = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (!data.url && !data.removeIcon && change.type == "attributes" && change.attributeName == "src" && change.target.src.indexOf(".gif") > -1) return;
							icon.EditServersChangeObserver.disconnect();
							this.changeGuildIcon(info, icon);
						}
					);
				});
				icon.EditServersChangeObserver.observe(icon, {attributes:true});
			}
			else icon.removeAttribute("changed-by-editservers");
		}
	}

	changeTooltip (info, wrapper, type) {
		if (!info || !wrapper || !wrapper.parentElement) return;
		let data = this.getGuildData(info.id, wrapper);
		wrapper.removeEventListener("mouseenter", wrapper.tooltipListenerEditServers);
		if (data.name || data.color3 || data.color4) {
			let ServerFolders = BDFDB.BDUtils.getPlugin("ServerFolders", true);
			let folder = ServerFolders ? ServerFolders.getFolderOfGuildId(info.id) : null;
			let folderData = folder ? BDFDB.DataUtils.load("ServerFolders", "folders", folder.folderId) : null;
			let color3 = data.color3 || (folderData && folderData.copyTooltipColor ? folderData.color3 : null);
			let color4 = data.color4 || (folderData && folderData.copyTooltipColor ? folderData.color4 : null);
			var isgradient3 = color3 && BDFDB.ObjectUtils.is(color3);
			var isgradient4 = color4 && BDFDB.ObjectUtils.is(color4);
			var bgColor = color3 ? (!isgradient3 ? BDFDB.ColorUtils.convert(color3, "RGBA") : BDFDB.ColorUtils.createGradient(color3)) : "";
			var fontColor = color4 ? (!isgradient4 ? BDFDB.ColorUtils.convert(color4, "RGBA") : BDFDB.ColorUtils.createGradient(color4)) : "";
			wrapper.tooltipListenerEditServers = () => {
				BDFDB.TooltipUtils.create(wrapper, isgradient4 ? `<span style="pointer-events: none; -webkit-background-clip: text !important; color: transparent !important; background-image: ${fontColor} !important;">${BDFDB.StringUtils.htmlEscape(data.name || info.name)}</span>` : (data.name || info.name), {type, selector:"EditServers-tooltip", style:`${isgradient4 ? '' : 'color: ' + fontColor + ' !important; '}background: ${bgColor} !important; border-color: ${isgradient3 ? BDFDB.ColorUtils.convert(color3[0], "RGBA") : bgColor} !important;`, html:isgradient3});
			};
			wrapper.addEventListener("mouseenter", wrapper.tooltipListenerEditServers);
			if (document.querySelector(BDFDB.dotCN.guildcontainer + ":hover") == wrapper) wrapper.tooltipListenerEditServers();
		}
	}

	getFontSize (icon) {
		if (icon.style.getPropertyValue("background-image") && icon.style.getPropertyValue("background-image").indexOf("linear-gradient(") == -1) return null;
		else if (BDFDB.DOMUtils.containsClass(icon, BDFDB.disCN.guildicon) || BDFDB.DOMUtils.containsClass(icon, BDFDB.disCN.guildiconacronym)) {
			var shortname = icon.firstElementChild ? icon.firstElementChild.innerText : icon.innerText;
			if (shortname) {
				if (shortname.length > 5) return "10px";
				else if (shortname.length > 4) return "12px";
				else if (shortname.length > 3) return "14px";
				else if (shortname.length > 1) return "16px";
				else if (shortname.length == 1) return "18px";
			}
		}
		else if (BDFDB.DOMUtils.containsClass(icon, BDFDB.disCN.avatariconsizexlarge)) return "12px";
		else if (BDFDB.DOMUtils.containsClass(icon, BDFDB.disCN.avatariconsizelarge)) return "10px";
		else if (BDFDB.DOMUtils.containsClass(icon, BDFDB.disCN.avatariconsizemedium)) return "8px";
		else if (BDFDB.DOMUtils.containsClass(icon, BDFDB.disCN.avatariconsizesmall)) return "4.8px";
		else if (BDFDB.DOMUtils.containsClass(icon, BDFDB.disCN.avatariconsizemini)) return "4px";
		return "10px";
	}

	getNoIconClasses (icon) {
		let noiconclasses = [BDFDB.disCN.avatarnoicon];
		if (BDFDB.DOMUtils.containsClass(icon, BDFDB.disCN.userprofilelistavatar)) noiconclasses.push(BDFDB.disCN.userprofilelistguildavatarwithouticon);
		return noiconclasses;
	}

	getGuildData (id, wrapper) {
		let data = BDFDB.DataUtils.load(this, "servers", id);
		this.setBanner(id, data);
		if (!data) return {};
		let allenabled = true, settings = BDFDB.DataUtils.get(this, "settings");
		for (let i in settings) if (!settings[i]) {
			allenabled = false;
			break;
		}
		if (allenabled) return data;
		let key = null;
		if (BDFDB.DOMUtils.getParent(BDFDB.dotCN.guilds, wrapper)) key = "changeInGuildList";
		else if (BDFDB.DOMUtils.getParent(BDFDB.dotCN.userprofile, wrapper) || BDFDB.DOMUtils.getParent(BDFDB.dotCN.friends, wrapper)) key = "changeInMutualGuilds";
		else if (BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildheader, wrapper)) key = "changeInGuildHeader";
		else if (BDFDB.DOMUtils.getParent(BDFDB.dotCN.searchpopout, wrapper) || BDFDB.DOMUtils.getParent(BDFDB.dotCN.quickswitcher, wrapper)) key = "changeInSearchPopout";

		return !key || settings[key] ? data : {};
	}

	setBanner (id, data) {
		data = data || {};
		let guild = BDFDB.LibraryModules.GuildStore.getGuild(id);
		if (!guild) return;
		if (guild.EditServersCachedBanner === undefined) guild.EditServersCachedBanner = guild.banner;
		guild.banner = data.removeBanner ? null : (data.banner || guild.EditServersCachedBanner);
	}

	updateGuildSidebar() {
		if (document.querySelector(BDFDB.dotCN.guildheader)) {
			var ins = BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.app), {name: ["GuildSidebar", "GuildHeader"], all: true, noCopies: true, depth: 99999999, time: 99999999});
			if (ins) for (let i in ins) ins[i].updater.enqueueForceUpdate(ins[i]);
		}
	}

	setLabelsByLanguage () {
		switch (BDFDB.LanguageUtils.getLanguage().id) {
			case "hr":		//croatian
				return {
					context_localserversettings_text:	"Lokalne postavke poslužitelja",
					submenu_serversettings_text:		"Promijeni postavke",
					submenu_resetsettings_text:			"Ponovno postavite poslužitelj",
					modal_header_text:					"Lokalne postavke poslužitelja",
					modal_guildname_text:				"Naziv lokalnog poslužitelja",
					modal_guildacronym_text:			"Poslužitelj prečaca",
					modal_guildicon_text:				"Ikona",
					modal_removeicon_text:				"Ukloni ikonu",
					modal_guildbanner_text:				"Baner",
					modal_removebanner_text:			"Uklonite baner",
					modal_tabheader1_text:				"Poslužitelja",
					modal_tabheader2_text:				"Boja ikona",
					modal_tabheader3_text:				"Boja tooltip",
					modal_colorpicker1_text:			"Boja ikona",
					modal_colorpicker2_text:			"Boja fonta",
					modal_colorpicker3_text:			"Boja tooltip",
					modal_colorpicker4_text:			"Boja fonta",
					modal_validurl_text:				"Vrijedi URL",
					modal_invalidurl_text:				"Nevažeći URL"
				};
			case "da":		//danish
				return {
					context_localserversettings_text:	"Lokal serverindstillinger",
					submenu_serversettings_text:		"Skift indstillinger",
					submenu_resetsettings_text:			"Nulstil server",
					modal_header_text:	 				"Lokal serverindstillinger",
					modal_guildname_text:				"Lokalt servernavn",
					modal_guildacronym_text:			"Initialer",
					modal_guildicon_text:				"Ikon",
					modal_removeicon_text:				"Fjern ikon",
					modal_guildbanner_text:				"Banner",
					modal_removebanner_text:			"Fjern banner",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Ikonfarve",
					modal_tabheader3_text:				"Tooltipfarve",
					modal_colorpicker1_text:			"Ikonfarve",
					modal_colorpicker2_text:			"Skriftfarve",
					modal_colorpicker3_text:			"Tooltipfarve",
					modal_colorpicker4_text:			"Skriftfarve",
					modal_validurl_text:				"Gyldig URL",
					modal_invalidurl_text:				"Ugyldig URL"
				};
			case "de":		//german
				return {
					context_localserversettings_text:	"Lokale Servereinstellungen",
					submenu_serversettings_text:		"Einstellungen ändern",
					submenu_resetsettings_text:			"Server zurücksetzen",
					modal_header_text:					"Lokale Servereinstellungen",
					modal_guildname_text:				"Lokaler Servername",
					modal_guildacronym_text:			"Serverkürzel",
					modal_guildicon_text:				"Icon",
					modal_removeicon_text:				"Icon entfernen",
					modal_guildbanner_text:				"Banner",
					modal_removebanner_text:			"Banner entfernen",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Iconfarbe",
					modal_tabheader3_text:				"Tooltipfarbe",
					modal_colorpicker1_text:			"Iconfarbe",
					modal_colorpicker2_text:			"Schriftfarbe",
					modal_colorpicker3_text:			"Tooltipfarbe",
					modal_colorpicker4_text:			"Schriftfarbe",
					modal_validurl_text:				"Gültige URL",
					modal_invalidurl_text:				"Ungültige URL"
				};
			case "es":		//spanish
				return {
					context_localserversettings_text:	"Ajustes local de servidor",
					submenu_serversettings_text:		"Cambiar ajustes",
					submenu_resetsettings_text:			"Restablecer servidor",
					modal_header_text:					"Ajustes local de servidor",
					modal_guildname_text:				"Nombre local del servidor",
					modal_guildacronym_text:			"Iniciales",
					modal_guildicon_text:				"Icono",
					modal_removeicon_text:				"Eliminar icono",
					modal_guildbanner_text:				"Bandera",
					modal_removebanner_text:			"Eliminar bandera",
					modal_tabheader1_text:				"Servidor",
					modal_tabheader2_text:				"Color del icono",
					modal_tabheader3_text:				"Color de tooltip",
					modal_colorpicker1_text:			"Color del icono",
					modal_colorpicker2_text:			"Color de fuente",
					modal_colorpicker3_text:			"Color de tooltip",
					modal_colorpicker4_text:			"Color de fuente",
					modal_validurl_text:				"URL válida",
					modal_invalidurl_text:				"URL inválida"
				};
			case "fr":		//french
				return {
					context_localserversettings_text:	"Paramètres locale du serveur",
					submenu_serversettings_text:		"Modifier les paramètres",
					submenu_resetsettings_text:			"Réinitialiser le serveur",
					modal_header_text:					"Paramètres locale du serveur",
					modal_guildname_text:				"Nom local du serveur",
					modal_guildacronym_text:			"Initiales",
					modal_guildicon_text:				"Icône",
					modal_removeicon_text:				"Supprimer l'icône",
					modal_guildbanner_text:				"Bannière",
					modal_removebanner_text:			"Supprimer la bannière",
					modal_tabheader1_text:				"Serveur",
					modal_tabheader2_text:				"Couleur de l'icône",
					modal_tabheader3_text:				"Couleur de tooltip",
					modal_colorpicker1_text:			"Couleur de l'icône",
					modal_colorpicker2_text:			"Couleur de la police",
					modal_colorpicker3_text:			"Couleur de tooltip",
					modal_colorpicker4_text:			"Couleur de la police",
					modal_validurl_text:				"URL valide",
					modal_invalidurl_text:				"URL invalide"
				};
			case "it":		//italian
				return {
					context_localserversettings_text:	"Impostazioni locale server",
					submenu_serversettings_text:		"Cambia impostazioni",
					submenu_resetsettings_text:			"Ripristina server",
					modal_header_text:					"Impostazioni locale server",
					modal_guildname_text:				"Nome locale server",
					modal_guildacronym_text:			"Iniziali",
					modal_guildicon_text:				"Icona",
					modal_removeicon_text:				"Rimuova l'icona",
					modal_guildbanner_text:				"Bandiera",
					modal_removebanner_text:			"Rimuovi bandiera",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Colore dell'icona",
					modal_tabheader3_text:				"Colore della tooltip",
					modal_colorpicker1_text:			"Colore dell'icona",
					modal_colorpicker2_text:			"Colore del carattere",
					modal_colorpicker3_text:			"Colore della tooltip",
					modal_colorpicker4_text:			"Colore del carattere",
					modal_validurl_text:				"URL valido",
					modal_invalidurl_text:				"URL non valido"
				};
			case "nl":		//dutch
				return {
					context_localserversettings_text:	"Lokale serverinstellingen",
					submenu_serversettings_text:		"Verandere instellingen",
					submenu_resetsettings_text:			"Reset server",
					modal_header_text:					"Lokale serverinstellingen",
					modal_guildname_text:				"Lokale servernaam",
					modal_guildacronym_text:			"Initialen",
					modal_guildicon_text:				"Icoon",
					modal_removeicon_text:				"Verwijder icoon",
					modal_guildbanner_text:				"Banier",
					modal_removebanner_text:			"Verwijder banier",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Icoonkleur",
					modal_tabheader3_text:				"Tooltipkleur",
					modal_colorpicker1_text:			"Icoonkleur",
					modal_colorpicker2_text:			"Doopvontkleur",
					modal_colorpicker3_text:			"Tooltipkleur",
					modal_colorpicker4_text:			"Doopvontkleur",
					modal_validurl_text:				"Geldige URL",
					modal_invalidurl_text:				"Ongeldige URL"
				};
			case "no":		//norwegian
				return {
					context_localserversettings_text:	"Lokal serverinnstillinger",
					submenu_serversettings_text:		"Endre innstillinger",
					submenu_resetsettings_text:			"Tilbakestill server",
					modal_header_text:					"Lokal serverinnstillinger",
					modal_guildname_text:				"Lokalt servernavn",
					modal_guildacronym_text:			"Initialer",
					modal_guildicon_text:				"Ikon",
					modal_removeicon_text:				"Fjern ikon",
					modal_guildbanner_text:				"Banner",
					modal_removebanner_text:			"Fjern banner",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Ikonfarge",
					modal_tabheader3_text:				"Tooltipfarge",
					modal_colorpicker1_text:			"Ikonfarge",
					modal_colorpicker2_text:			"Skriftfarge",
					modal_colorpicker3_text:			"Tooltipfarge",
					modal_colorpicker4_text:			"Skriftfarge",
					modal_validurl_text:				"Gyldig URL",
					modal_invalidurl_text:				"Ugyldig URL"
				};
			case "pl":		//polish
				return {
					context_localserversettings_text:	"Lokalne ustawienia serwera",
					submenu_serversettings_text:		"Zmień ustawienia",
					submenu_resetsettings_text:			"Resetuj ustawienia",
					modal_header_text:					"Lokalne ustawienia serwera",
					modal_guildname_text:				"Lokalna nazwa serwera",
					modal_guildacronym_text:			"Krótka nazwa",
					modal_guildicon_text:				"Ikona",
					modal_removeicon_text:				"Usuń ikonę",
					modal_guildbanner_text:				"Baner",
					modal_removebanner_text:			"Usuń baner",
					modal_tabheader1_text:				"Serwer",
					modal_tabheader2_text:				"Kolor ikony",
					modal_tabheader3_text:				"Kolor podpowiedzi",
					modal_colorpicker1_text:			"Kolor ikony",
					modal_colorpicker2_text:			"Kolor czcionki",
					modal_colorpicker3_text:			"Kolor podpowiedzi",
					modal_colorpicker4_text:			"Kolor czcionki",
					modal_validurl_text:				"Prawidłowe URL",
					modal_invalidurl_text:				"Nieprawidłowe URL"
				};
			case "pt-BR":	//portuguese (brazil)
				return {
					context_localserversettings_text:	"Configurações local do servidor",
					submenu_serversettings_text:		"Mudar configurações",
					submenu_resetsettings_text:			"Redefinir servidor",
					modal_header_text:					"Configurações local do servidor",
					modal_guildname_text:				"Nome local do servidor",
					modal_guildacronym_text:			"Iniciais",
					modal_guildicon_text:				"Icone",
					modal_removeicon_text:				"Remover ícone",
					modal_guildbanner_text:				"Bandeira",
					modal_removebanner_text:			"Remover bandeira",
					modal_tabheader1_text:				"Servidor",
					modal_tabheader2_text:				"Cor do ícone",
					modal_tabheader3_text:				"Cor da tooltip",
					modal_colorpicker1_text:			"Cor do ícone",
					modal_colorpicker2_text:			"Cor da fonte",
					modal_colorpicker3_text:			"Cor da tooltip",
					modal_colorpicker4_text:			"Cor da fonte",
					modal_validurl_text:				"URL válido",
					modal_invalidurl_text:				"URL inválida"
				};
			case "fi":		//finnish
				return {
					context_localserversettings_text:	"Paikallinen palvelimen asetukset",
					submenu_serversettings_text:		"Vaihda asetuksia",
					submenu_resetsettings_text:			"Nollaa palvelimen",
					modal_header_text:					"Paikallinen palvelimen asetukset",
					modal_guildname_text:				"Paikallinen palvelimenimi",
					modal_guildacronym_text:			"Nimikirjaimet",
					modal_guildicon_text:				"Ikonin",
					modal_removeicon_text:				"Poista kuvake",
					modal_guildbanner_text:				"Banneri",
					modal_removebanner_text:			"Poista banneri",
					modal_tabheader1_text:				"Palvelimen",
					modal_tabheader2_text:				"Ikoninväri",
					modal_tabheader3_text:				"Tooltipväri",
					modal_colorpicker1_text:			"Ikoninväri",
					modal_colorpicker2_text:			"Fontinväri",
					modal_colorpicker3_text:			"Tooltipväri",
					modal_colorpicker4_text:			"Fontinväri",
					modal_validurl_text:				"Voimassa URL",
					modal_invalidurl_text:				"Virheellinen URL"
				};
			case "sv":		//swedish
				return {
					context_localserversettings_text:	"Lokal serverinställningar",
					submenu_serversettings_text:		"Ändra inställningar",
					submenu_resetsettings_text:			"Återställ server",
					modal_header_text:					"Lokal serverinställningar",
					modal_guildname_text:				"Lokalt servernamn",
					modal_guildacronym_text:			"Initialer",
					modal_guildicon_text:				"Ikon",
					modal_removeicon_text:				"Ta bort ikonen",
					modal_guildbanner_text:				"Banderoll",
					modal_removebanner_text:			"Ta bort banderoll",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Ikonfärg",
					modal_tabheader3_text:				"Tooltipfärg",
					modal_colorpicker1_text:			"Ikonfärg",
					modal_colorpicker2_text:			"Fontfärg",
					modal_colorpicker3_text:			"Tooltipfärg",
					modal_colorpicker4_text:			"Fontfärg",
					modal_validurl_text:				"Giltig URL",
					modal_invalidurl_text:				"Ogiltig URL"
				};
			case "tr":		//turkish
				return {
					context_localserversettings_text:	"Yerel Sunucu Ayarları",
					submenu_serversettings_text:		"Ayarları Değiştir",
					submenu_resetsettings_text:			"Sunucu Sıfırla",
					modal_header_text:					"Yerel Sunucu Ayarları",
					modal_guildname_text:				"Yerel Sunucu Adı",
					modal_guildacronym_text:			"Baş harfleri",
					modal_guildicon_text:				"Simge",
					modal_removeicon_text:				"Simge kaldır",
					modal_guildbanner_text:				"Afişi",
					modal_removebanner_text:			"Afişi kaldır",
					modal_tabheader1_text:				"Sunucu",
					modal_tabheader2_text:				"Simge rengi",
					modal_tabheader3_text:				"Tooltip rengi",
					modal_colorpicker1_text:			"Simge rengi",
					modal_colorpicker2_text:			"Yazı rengi",
					modal_colorpicker3_text:			"Tooltip rengi",
					modal_colorpicker4_text:			"Yazı rengi",
					modal_validurl_text:				"Geçerli URL",
					modal_invalidurl_text:				"Geçersiz URL"
				};
			case "cs":		//czech
				return {
					context_localserversettings_text:	"Místní nastavení serveru",
					submenu_serversettings_text:		"Změnit nastavení",
					submenu_resetsettings_text:			"Obnovit server",
					modal_header_text:					"Místní nastavení serveru",
					modal_guildname_text:				"Místní název serveru",
					modal_guildacronym_text:			"Iniciály",
					modal_guildicon_text:				"Ikony",
					modal_removeicon_text:				"Odstranit ikonu",
					modal_guildbanner_text:				"Prapor",
					modal_removebanner_text:			"Odstraňte prapor",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Barva ikony",
					modal_tabheader3_text:				"Barva tooltip",
					modal_colorpicker1_text:			"Barva ikony",
					modal_colorpicker2_text:			"Barva fontu",
					modal_colorpicker3_text:			"Barva tooltip",
					modal_colorpicker4_text:			"Barva fontu",
					modal_validurl_text:				"Platná URL",
					modal_invalidurl_text:				"Neplatná URL"
				};
			case "bg":		//bulgarian
				return {
					context_localserversettings_text:	"Настройки за локални cървър",
					submenu_serversettings_text:		"Промяна на настройките",
					submenu_resetsettings_text:			"Възстановяване на cървър",
					modal_header_text:					"Настройки за локални cървър",
					modal_guildname_text:				"Локално име на cървър",
					modal_guildacronym_text:			"Инициали",
					modal_guildicon_text:				"Икона",
					modal_removeicon_text:				"Премахване на иконата",
					modal_guildbanner_text:				"Знаме",
					modal_removebanner_text:			"Премахване на знаме",
					modal_tabheader1_text:				"Cървър",
					modal_tabheader2_text:				"Цвят на иконата",
					modal_tabheader3_text:				"Цвят на подсказка",
					modal_colorpicker1_text:			"Цвят на иконата",
					modal_colorpicker2_text:			"Цвят на шрифта",
					modal_colorpicker3_text:			"Цвят на подсказка",
					modal_colorpicker4_text:			"Цвят на шрифта",
					modal_validurl_text:				"Валиден URL",
					modal_invalidurl_text:				"Невалиден URL"
				};
			case "ru":		//russian
				return {
					context_localserversettings_text:	"Настройки локального cервер",
					submenu_serversettings_text:		"Изменить настройки",
					submenu_resetsettings_text:			"Сбросить cервер",
					modal_header_text:					"Настройки локального cервер",
					modal_guildname_text:				"Имя локального cервер",
					modal_guildacronym_text:			"Инициалы",
					modal_guildicon_text:				"Значок",
					modal_removeicon_text:				"Удалить значок",
					modal_guildbanner_text:				"Баннер",
					modal_removebanner_text:			"Удалить баннер",
					modal_tabheader1_text:				"Cервер",
					modal_tabheader2_text:				"Цвет значков",
					modal_tabheader3_text:				"Цвет подсказка",
					modal_colorpicker1_text:			"Цвет значков",
					modal_colorpicker2_text:			"Цвет шрифта",
					modal_colorpicker3_text:			"Цвет подсказка",
					modal_colorpicker4_text:			"Цвет шрифта",
					modal_validurl_text:				"Действительный URL",
					modal_invalidurl_text:				"Неверная URL"
				};
			case "uk":		//ukrainian
				return {
					context_localserversettings_text:	"Налаштування локального cервер",
					submenu_serversettings_text:		"Змінити налаштування",
					submenu_resetsettings_text:			"Скидання cервер",
					modal_header_text:					"Налаштування локального cервер",
					modal_guildname_text:				"Локальне ім'я cервер",
					modal_guildacronym_text:			"Ініціали",
					modal_guildicon_text:				"Іконка",
					modal_removeicon_text:				"Видалити піктограму",
					modal_guildbanner_text:				"Банер",
					modal_removebanner_text:			"Видалити банер",
					modal_tabheader1_text:				"Cервер",
					modal_tabheader2_text:				"Колір ікони",
					modal_tabheader3_text:				"Колір підказка",
					modal_colorpicker1_text:			"Колір ікони",
					modal_colorpicker2_text:			"Колір шрифту",
					modal_colorpicker3_text:			"Колір підказка",
					modal_colorpicker4_text:			"Колір шрифту",
					modal_validurl_text:				"Дійсна URL",
					modal_invalidurl_text:				"Недійсна URL"
				};
			case "ja":		//japanese
				return {
					context_localserversettings_text:	"ローカルサーバー設定",
					submenu_serversettings_text:		"設定を変更する",
					submenu_resetsettings_text:			"サーバーをリセットする",
					modal_header_text:					"ローカルサーバー設定",
					modal_guildname_text:				"ローカルサーバー名",
					modal_guildacronym_text:			"イニシャル",
					modal_guildicon_text:				"アイコン",
					modal_removeicon_text:				"アイコンを削除",
					modal_guildbanner_text:				"バナー",
					modal_removebanner_text:			"バナーを削除",
					modal_tabheader1_text:				"サーバー",
					modal_tabheader2_text:				"アイコンの色",
					modal_tabheader3_text:				"ツールチップの色",
					modal_colorpicker1_text:			"アイコンの色",
					modal_colorpicker2_text:			"フォントの色",
					modal_colorpicker3_text:			"ツールチップの色",
					modal_colorpicker4_text:			"フォントの色",
					modal_validurl_text:				"有効な URL",
					modal_invalidurl_text:				"無効な URL"
				};
			case "zh-TW":	//chinese (traditional)
				return {
					context_localserversettings_text:	"本地服務器設置",
					submenu_serversettings_text:		"更改設置",
					submenu_resetsettings_text:			"重置服務器",
					modal_header_text:					"本地服務器設置",
					modal_guildname_text:				"服務器名稱",
					modal_guildacronym_text:			"聲母",
					modal_guildicon_text:				"圖標",
					modal_removeicon_text:				"刪除圖標",
					modal_guildbanner_text:				"旗幟",
					modal_removebanner_text:			"刪除橫幅",
					modal_tabheader1_text:				"服務器",
					modal_tabheader2_text:				"圖標顏色",
					modal_tabheader3_text:				"工具提示顏色",
					modal_colorpicker1_text:			"圖標顏色",
					modal_colorpicker2_text:			"字體顏色",
					modal_colorpicker3_text:			"工具提示顏色",
					modal_colorpicker4_text:			"字體顏色",
					modal_validurl_text:				"有效的 URL",
					modal_invalidurl_text:				"無效的 URL"
				};
			case "ko":		//korean
				return {
					context_localserversettings_text:	"로컬 서버 설정",
					submenu_serversettings_text:		"설정 변경",
					submenu_resetsettings_text:			"서버 재설정",
					modal_header_text:					"로컬 서버 설정",
					modal_guildname_text:				"로컬 서버 이름",
					modal_guildacronym_text:			"머리 글자",
					modal_guildicon_text:				"상",
					modal_removeicon_text:				"상 삭제",
					modal_guildbanner_text:				"기치",
					modal_removebanner_text:			"배너 삭제",
					modal_tabheader1_text:				"서버",
					modal_tabheader2_text:				"상 색깔",
					modal_tabheader3_text:				"툴팁 색깔",
					modal_colorpicker1_text:			"상 색깔",
					modal_colorpicker2_text:			"글꼴 색깔",
					modal_colorpicker3_text:			"툴팁 색깔",
					modal_colorpicker4_text:			"글꼴 색깔",
					modal_validurl_text:				"유효한 URL",
					modal_invalidurl_text:				"잘못된 URL"
				};
			default:		//default: english
				return {
					context_localserversettings_text:	"Local Serversettings",
					submenu_serversettings_text:		"Change Settings",
					submenu_resetsettings_text:			"Reset Server",
					modal_header_text:					"Local Serversettings",
					modal_guildname_text:				"Local Servername",
					modal_guildacronym_text:			"Initials",
					modal_guildicon_text:				"Icon",
					modal_removeicon_text:				"Remove Icon",
					modal_guildbanner_text:				"Banner",
					modal_removebanner_text:			"Remove Banner",
					modal_tabheader1_text:				"Server",
					modal_tabheader2_text:				"Iconcolor",
					modal_tabheader3_text:				"Tooltipcolor",
					modal_colorpicker1_text:			"Iconcolor",
					modal_colorpicker2_text:			"Fontcolor",
					modal_colorpicker3_text:			"Tooltipcolor",
					modal_colorpicker4_text:			"Fontcolor",
					modal_validurl_text:				"Valid URL",
					modal_invalidurl_text:				"Invalid URL"
				};
		}
	}
}
