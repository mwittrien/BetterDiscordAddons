//META{"name":"EditServers","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditServers","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EditServers/EditServers.plugin.js"}*//

class EditServers {
	getName () {return "EditServers";}

	getVersion () {return "2.1.3";}
	
	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows you to change the icon, name and color of servers.";}

	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};

		this.patchedModules = {
			before: {
				Guild: "render",
				GuildIconWrapper: "render",
				MutualGuilds: "render",
				FriendRow: "render",
				QuickSwitcher: "render",
				QuickSwitchChannelResult: "render",
				GuildSidebar: "render",
				GuildHeader: "render"
			},
			after: {
				Guild: "render",
				BlobMask: "render",
				GuildIconWrapper: "render",
				GuildIcon: "render",
				GuildHeader: "render"
			}
		};
	}

	initConstructor () {
		this.defaults = {
			settings: {
				addOriginalTooltip:		{value:true, 	inner:false,	description:"Hovering over a changed Server Header shows the original Name as Tooltip"},
				changeInGuildList:		{value:true, 	inner:true,		description:"Server List"},
				changeInMutualGuilds:	{value:true, 	inner:true,		description:"Mutual Servers"},
				changeInQuickSwitcher:	{value:true, 	inner:true,		description:"Quick Switcher"},
				changeInGuildHeader:	{value:true, 	inner:true,		description:"Server Header"}
			}
		};
	}

	getSettingsPanel () {
		if (!global.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
		let settings = BDFDB.DataUtils.get(this, "settings");
		let settingsitems = [], inneritems = [];
		
		for (let key in settings) (!this.defaults.settings[key].inner ? settingsitems : inneritems).push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
			className: BDFDB.disCN.marginbottom8,
			type: "Switch",
			plugin: this,
			keys: ["settings", key],
			label: this.defaults.settings[key].description,
			value: settings[key]
		}));
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
			title: "Change Servers in:",
			first: settingsitems.length == 0,
			children: inneritems
		}));
		settingsitems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
			type: "Button",
			className: BDFDB.disCN.marginbottom8,
			color: BDFDB.LibraryComponents.Button.Colors.RED,
			label: "Reset all Servers",
			onClick: _ => {
				BDFDB.ModalUtils.confirm(this, "Are you sure you want to reset all Servers?", () => {
					BDFDB.DataUtils.remove(this, "servers");
					BDFDB.ModuleUtils.forceAllUpdates(this);;
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
		this.startTimeout = setTimeout(() => {
			try {return this.initialize();}
			catch (err) {console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not initiate plugin! " + err);}
		}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.PluginUtils.init(this);

			BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.IconUtils, "getGuildBannerURL", {instead:e => {
				let guild = BDFDB.LibraryModules.GuildStore.getGuild(e.methodArguments[0].id);
				if (guild) {
					if (e.methodArguments[0].id == "410787888507256842") return guild.banner;
					let data = BDFDB.DataUtils.load(this, "servers", guild.id);
					if (data && data.banner && !data.removeBanner) return data.banner;
				}
				return e.callOriginalMethod();
			}});

			BDFDB.ModuleUtils.patch(this, BDFDB.LibraryComponents.GuildComponents.Guild.prototype, "render", {
				before: e => {this.processGuild({instance:e.thisObject, returnvalue:e.returnValue, methodname:"render"});},
				after: e => {this.processGuild({instance:e.thisObject, returnvalue:e.returnValue, methodname:"render"});}
			});

			BDFDB.ModuleUtils.patch(this, BDFDB.LibraryComponents.Connectors.Link.prototype, "render", {
				after: e => {
					if (e.thisObject.props.className && e.thisObject.props.className.indexOf(BDFDB.disCN.guildiconwrapper) > -1) this.processGuildAcronym({instance:e.thisObject, returnvalue:e.returnValue, methodname:"render"});
				}
			});
			
			BDFDB.ModuleUtils.forceAllUpdates(this);;
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;

			let data = BDFDB.DataUtils.load(this, "servers");
			BDFDB.DataUtils.remove(this, "servers");
			try {BDFDB.ModuleUtils.forceAllUpdates(this);;} catch (err) {}
			BDFDB.DataUtils.save(data, this, "servers");

			for (let guildobj of BDFDB.GuildUtils.getAll()) if (guildobj.instance) {
				delete guildobj.instance.props.guild.EditServersCachedBanner;
			}

			BDFDB.PluginUtils.clear(this);
		}
	}

	// begin of own functions
	
	onGuildContextMenu (e) {
		if (e.instance.props.guild) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name:["FluxContainer(MessageDeveloperModeGroup)", "DeveloperModeGroup"]});
			children.splice(index > -1 ? index : children.length, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
				children: [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuSubItem, {
						label: this.labels.context_localserversettings_text,
						render: [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItemGroup, {
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
									label: this.labels.submenu_serversettings_text,
									action: _ => {
										BDFDB.ContextMenuUtils.close(e.instance);
										this.showServerSettings(e.instance.props.guild);
									}
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ContextMenuItem, {
									label: this.labels.submenu_resetsettings_text,
									disabled: !BDFDB.DataUtils.load(this, "servers", e.instance.props.guild.id),
									action: _ => {
										BDFDB.ContextMenuUtils.close(e.instance);
										BDFDB.DataUtils.remove(this, "servers", e.instance.props.guild.id);
										BDFDB.ModuleUtils.forceAllUpdates(this);;
									}
								})
							]
						})]
					})
				]
			}));
		}
	}

	processGuild (e) {
		if (e.instance.props.guild && BDFDB.DataUtils.get(this, "settings", "changeInGuildList")) {
			e.instance.props.guild = this.getGuildData(e.instance.props.guild);
			if (e.returnvalue) {
				let data = BDFDB.DataUtils.load(this, "servers", e.instance.props.guild.id);
				if (data) {
					let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: ["GuildTooltip", "BDFDB_TooltipContainer"]});
					if (index > -1) children[index] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						tooltipConfig: {
							type: "right",
							guild: e.instance.props.guild,
							list: true,
							backgroundColor: data.color3,
							fontColor: data.color4
						},
						children: children[index].props.children
					});
				}
			}
		}
	}

	processBlobMask (e) {
		if (BDFDB.DataUtils.get(this, "settings", "changeInGuildList")) {
			let [children, index] = BDFDB.ReactUtils.findChildren(e.returnvalue, {name: "NavItem"});
			if (index > -1) {
				let data = BDFDB.DataUtils.load(this, "servers", (children[index].props.to.pathname.split("/channels/")[1] || "").split("/")[0]);
				if (data && data.shortName) children[index].props.name = data.shortName.split("").join(" ");
			}
		}
	}

	processGuildAcronym (e) {
		if (typeof e.returnvalue.props.children == "function" && BDFDB.DataUtils.get(this, "settings", "changeInGuildList")) {
			let data = BDFDB.DataUtils.load(this, "servers", (e.instance.props.to.pathname.split("/channels/")[1] || "").split("/")[0]);
			if (data) {
				let renderChildren = e.returnvalue.props.children;
				e.returnvalue.props.children = (...args) => {
					let renderedChildren = renderChildren(...args);
			 		let [children, index] = BDFDB.ReactUtils.findChildren(renderedChildren, {props:[["className", BDFDB.disCN.guildiconacronym]]});
					if (index > -1) {
						let fontGradient = BDFDB.ObjectUtils.is(data.color2);
						children[index].props.style = Object.assign({}, children[index].props.style, {
							background: BDFDB.ObjectUtils.is(data.color1) ? BDFDB.ColorUtils.createGradient(data.color1) : BDFDB.ColorUtils.convert(data.color1, "RGBA"),
							color: !fontGradient && BDFDB.ColorUtils.convert(data.color2, "RGBA")
						});
						if (fontGradient) children[index].props.children = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
							gradient: BDFDB.ColorUtils.createGradient(data.color2),
							children: children[index].props.children
						});
					}
					return renderedChildren;
				};
			}
		}
	}
	
	processGuildIconWrapper (e) {
		if (e.instance.props.guild) {
			let settings = BDFDB.DataUtils.get(this, "settings");
			if (e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.guildfolderguildicon) > -1) e.instance.props.guild = this.getGuildData(e.instance.props.guild, settings.changeInGuildList);
			else if (e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.listavatar) > -1) e.instance.props.guild = this.getGuildData(e.instance.props.guild, settings.changeInMutualGuilds);
			else e.instance.props.guild = this.getGuildData(e.instance.props.guild);
		}
	}
	
	processGuildIcon (e) {
		if (e.instance.props.guild && e.instance.props.style && (!e.instance.props.style.backgroundImage || e.instance.props.style.backgroundImage == "none")) {
			let data = BDFDB.DataUtils.load(this, "servers", e.instance.props.guild.id);
			if (data) {
				let settings = BDFDB.DataUtils.get(this, "settings");
				if (e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.guildfolderguildicon) > -1) this.changeGuildIcon(e, data, settings.changeInGuildList);
				else if (e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.listavatar) > -1 || BDFDB.ReactUtils.findConstructor(e.instance, "MutualGuild", {up: true})) this.changeGuildIcon(e, data, settings.changeInMutualGuilds);
				else this.changeGuildIcon(e, data);
			}
		}
	}

	processMutualGuilds (e) {
		if (BDFDB.DataUtils.get(this, "settings", "changeInMutualGuilds")) for (let i in e.instance.props.mutualGuilds) e.instance.props.mutualGuilds[i].guild = this.getGuildData(e.instance.props.mutualGuilds[i].guild);
	}

	processFriendRow (e) {
		if (BDFDB.DataUtils.get(this, "settings", "changeInMutualGuilds")) for (let i in e.instance.props.mutualGuilds) e.instance.props.mutualGuilds[i] = this.getGuildData(e.instance.props.mutualGuilds[i]);
	}

	processQuickSwitcher (e) {
		if (BDFDB.DataUtils.get(this, "settings", "changeInQuickSwitcher")) for (let i in e.instance.props.results) if (e.instance.props.results[i].type == "GUILD") e.instance.props.results[i].record = this.getGuildData(e.instance.props.results[i].record);
	}

	processQuickSwitchChannelResult (e) {
		if (e.instance.props.channel && e.instance.props.channel.guild_id && BDFDB.DataUtils.get(this, "settings", "changeInQuickSwitcher")) {
			e.instance.props.children.props.children = this.getGuildData(BDFDB.LibraryModules.GuildStore.getGuild(e.instance.props.channel.guild_id)).name;
		}
	}
	
	processGuildSidebar (e) {
		if (e.instance.props.guild) {
			let data = BDFDB.DataUtils.load(this, "servers", e.instance.props.guild.id);
			if (data && data.removeBanner) e.instance.props.guild = new BDFDB.DiscordObjects.Guild(Object.assign({}, e.instance.props.guild, {banner: null}));
		}
	}
	
	processGuildHeader (e) {
		if (e.instance.props.guild) {
			let settings = BDFDB.DataUtils.get(this, "settings");
			if (settings.changeInGuildHeader) {
				e.instance.props.guild = this.getGuildData(e.instance.props.guild);
				let oldName = (BDFDB.LibraryModules.GuildStore.getGuild(e.instance.props.guild.id) || {}).name;
				if (e.returnvalue && settings.addOriginalTooltip && oldName != e.instance.props.guild.name) {
					e.returnvalue.props.children[0] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
						text: oldName,
						children: e.returnvalue.props.children[0],
						tooltipConfig: {type: "right"}
					});
				}
			}
		}
	}
	
	getGuildData (guild, change = true) {
		let data = change && BDFDB.DataUtils.load(this, "servers", guild.id);
		if (data) {
			let newGuildObject = {}, nativeObject = new BDFDB.DiscordObjects.Guild(guild);
			for (let key in nativeObject) newGuildObject[key] = nativeObject[key];
			newGuildObject.name = data.name || nativeObject.name;
			newGuildObject.acronym = data.shortName && data.shortName.replace(/\s/g, "") || BDFDB.LibraryModules.StringUtils.getAcronym(newGuildObject.name);
			if (data.removeIcon) {
				newGuildObject.icon = null;
				newGuildObject.getIconURL = _ => {return null;};
			}
			else if (data.url) newGuildObject.getIconURL = _ => {return data.url;};
			if (data.removeBanner) newGuildObject.banner = null;
			return newGuildObject;
		}
		return new BDFDB.DiscordObjects.Guild(BDFDB.LibraryModules.GuildStore.getGuild(guild.id));
	}
	
	changeGuildIcon (e, data, change = true) {
		if (change) {
			let fontGradient = BDFDB.ObjectUtils.is(data.color2);
			e.returnvalue.props.style = Object.assign({}, e.returnvalue.props.style, {
				background: BDFDB.ObjectUtils.is(data.color1) ? BDFDB.ColorUtils.createGradient(data.color1) : BDFDB.ColorUtils.convert(data.color1, "RGBA"),
				color: !fontGradient && BDFDB.ColorUtils.convert(data.color2, "RGBA")
			});
			if (fontGradient) e.returnvalue.props.children[0] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
				gradient: BDFDB.ColorUtils.createGradient(data.color2),
				children: e.returnvalue.props.children[0]
			});
		}
	}

	showServerSettings (guild) {
		let data = BDFDB.DataUtils.load(this, "servers", guild.id) || {};
		
		BDFDB.ModalUtils.open(this, {
			size: "MEDIUM",
			header: this.labels.modal_header_text,
			subheader: guild.name,
			children: [
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
					tab: this.labels.modal_tabheader1_text,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_guildname_text,
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									inputClassName: "input-guildname",
									value: data.name,
									placeholder: guild.name,
									autoFocus: true
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_guildacronym_text,
							className: BDFDB.disCN.marginbottom20,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									inputClassName: "input-guildacronym",
									value: data.shortName,
									placeholder: guild.acronym
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_guildicon_text,
							className: BDFDB.disCN.marginbottom8,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									inputClassName: "input-guildicon",
									inputId: "GUILDICON",
									success: !data.removeIcon && data.url,
									value: data.url,
									placeholder: BDFDB.GuildUtils.getIcon(guild.id),
									disabled: data.removeIcon,
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
									delete iconinputins.props.success;
									delete iconinputins.props.errorMessage;
									iconinputins.props.disabled = value;
									iconinputins.forceUpdate();
								}
							}
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
							title: this.labels.modal_guildbanner_text,
							className: BDFDB.disCN.marginbottom8,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									inputClassName: "input-guildbanner",
									inputId: "GUILDBANNER",
									success: !data.removeBanner && data.banner,
									value: data.banner,
									placeholder: BDFDB.GuildUtils.getBanner(guild.id),
									disabled: data.removeBanner || guild.id == "410787888507256842",
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
							disabled: guild.id == "410787888507256842",
							onChange: (value, instance) => {
								let bannerinputins = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {props:[["inputId","GUILDBANNER"]]});
								if (bannerinputins) {
									delete bannerinputins.props.success;
									delete bannerinputins.props.errorMessage;
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
					
					let guildnameinput = modal.querySelector(".input-guildname");
					let guildacronyminput = modal.querySelector(".input-guildacronym");
					let guildiconinput = modal.querySelector(".input-guildicon");
					let removeiconinput = modal.querySelector(".input-removeicon " + BDFDB.dotCN.switchinner);
					let guildbannerinput = modal.querySelector(".input-guildbanner");
					let removebannerinput = modal.querySelector(".input-removebanner " + BDFDB.dotCN.switchinner);
					
					data.name = guildnameinput.value.trim() || null;
					data.shortName = guildacronyminput.value.trim() || null;
					data.url = (!data.removeIcon && BDFDB.DOMUtils.containsClass(guildiconinput, BDFDB.disCN.inputsuccess) ? guildiconinput.value.trim() : null) || null;
					data.removeIcon = removeiconinput.checked;
					data.banner = (!data.removeBanner && BDFDB.DOMUtils.containsClass(guildbannerinput, BDFDB.disCN.inputsuccess) ? guildbannerinput.value.trim() : null) || null;
					data.removeBanner = removebannerinput.checked && guild.id != "410787888507256842";

					data.color1 = BDFDB.ColorUtils.getSwatchColor(modal, 1);
					data.color2 = BDFDB.ColorUtils.getSwatchColor(modal, 2);
					data.color3 = BDFDB.ColorUtils.getSwatchColor(modal, 3);
					data.color4 = BDFDB.ColorUtils.getSwatchColor(modal, 4);

					let changed = false;
					if (Object.keys(data).every(key => !data[key]) && (changed = true)) BDFDB.DataUtils.remove(this, "servers", guild.id);
					else if (!BDFDB.equals(olddata, data) && (changed = true)) BDFDB.DataUtils.save(data, this, "servers", guild.id);
					if (changed) BDFDB.ModuleUtils.forceAllUpdates(this);;
				}
			}]
		});
	}
	
	checkUrl (url, instance) {
		BDFDB.TimeUtils.clear(instance.checkTimeout);
		if (url == null || !url.trim()) {
			delete instance.props.success;
			delete instance.props.errorMessage;
			instance.forceUpdate();
		}
		else instance.checkTimeout = BDFDB.TimeUtils.timeout(() => {
			BDFDB.LibraryRequires.request(url.trim(), (error, response, result) => {
				if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") != -1) {
					instance.props.success = true;
					delete instance.props.errorMessage;
				}
				else {
					delete instance.props.success;
					instance.props.errorMessage = this.labels.modal_invalidurl_text;
				}
				delete instance.checkTimeout;
				instance.forceUpdate();
			});
		}, 1000);
	}

	setBanner (id, data) {
		data = data || {};
		let guild = BDFDB.LibraryModules.GuildStore.getGuild(id);
		if (!guild) return;
		if (guild.EditServersCachedBanner === undefined) guild.EditServersCachedBanner = guild.banner;
		guild.banner = data.removeBanner ? null : (data.banner || guild.EditServersCachedBanner);
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
					modal_invalidurl_text:				"Invalid URL"
				};
		}
	}
}
