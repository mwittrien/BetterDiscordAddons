//META{"name":"EditServers","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditServers","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/EditServers/EditServers.plugin.js"}*//

module.exports = (_ => {
    const config = {
		"info": {
			"name": "EditServers",
			"author": "DevilBro",
			"version": "2.2.4",
			"description": "Allows you to change the icon, name and color of servers."
		},
		"changeLog": {
			"fixed": {
				"Server Invites": "No longer breaks server invites of non-joined servers"
			}
		}
	};
    return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
        load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue:[]});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`//META{"name":"`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
        }
        start() {}
        stop() {}
    } : (([Plugin, BDFDB]) => {
		var changedGuilds = {}, settings = {};
	
        return class EditServers extends Plugin {
			onLoad() {
				this.defaults = {
					settings: {
						addOriginalTooltip:		{value:true, 	inner:false,	description:"Hovering over a changed Server Header shows the original Name as Tooltip"},
						changeInGuildList:		{value:true, 	inner:true,		description:"Server List"},
						changeInGuildHeader:	{value:true, 	inner:true,		description:"Server Header"},
						changeInGuildInvites:	{value:true, 	inner:true,		description:"Server Invites"},
						changeInMutualGuilds:	{value:true, 	inner:true,		description:"Mutual Servers"},
						changeInRecentMentions:	{value:true, 	inner:true,		description:"Recent Mentions Popout"},
						changeInQuickSwitcher:	{value:true, 	inner:true,		description:"Quick Switcher"}
					}
				};
			
				this.patchedModules = {
					before: {
						Guild: "render",
						GuildIconWrapper: "render",
						MutualGuilds: "render",
						QuickSwitcher: "render",
						QuickSwitchChannelResult: "render",
						GuildSidebar: "render",
						GuildHeader: "render",
						InviteGuildName: "GuildName"
					},
					after: {
						RecentsChannelHeader: "default",
						Guild: "render",
						BlobMask: "render",
						GuildIconWrapper: "render",
						GuildIcon: "render",
						GuildHeader: "render"
					}
				};
				
				this.patchPriority = 7;
			}
			
			onStart() {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.IconUtils, "getGuildBannerURL", {instead:e => {
					let guild = BDFDB.LibraryModules.GuildStore.getGuild(e.methodArguments[0].id);
					if (guild) {
						if (e.methodArguments[0].id == "410787888507256842") return guild.banner;
						let data = changedGuilds[guild.id];
						if (data && data.banner && !data.removeBanner) return data.banner;
					}
					return e.callOriginalMethod();
				}});

				BDFDB.PatchUtils.patch(this, BDFDB.LibraryComponents.GuildComponents.Guild.prototype, "render", {
					before: e => {this.processGuild({instance:e.thisObject, returnvalue:e.returnValue, methodname:"render"});},
					after: e => {this.processGuild({instance:e.thisObject, returnvalue:e.returnValue, methodname:"render"});}
				});

				BDFDB.PatchUtils.patch(this, BDFDB.LibraryComponents.Connectors.Link.prototype, "render", {
					after: e => {
						if (e.thisObject.props.className && e.thisObject.props.className.indexOf(BDFDB.disCN.guildiconwrapper) > -1) this.processGuildAcronym({instance:e.thisObject, returnvalue:e.returnValue, methodname:"render"});
					}
				});
				
				this.forceUpdateAll();
			}
			
			onStop() {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [], innerItems = [];
				
				for (let key in settings) if (!this.defaults.settings[key].inner) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					className: BDFDB.disCN.marginbottom8,
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}));
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelInner, {
					title: "Change Servers in:",
					first: settingsItems.length == 0,
					children: Object.keys(settings).map(key => this.defaults.settings[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
						className: BDFDB.disCN.marginbottom8,
						type: "Switch",
						plugin: this,
						keys: ["settings", key],
						label: this.defaults.settings[key].description,
						value: settings[key]
					}))
				}));
				settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
					type: "Button",
					className: BDFDB.disCN.marginbottom8,
					color: BDFDB.LibraryComponents.Button.Colors.RED,
					label: "Reset all Servers",
					onClick: _ => {
						BDFDB.ModalUtils.confirm(this, "Are you sure you want to reset all Servers?", _ => {
							BDFDB.DataUtils.remove(this, "servers");
							this.forceUpdateAll();;
						});
					},
					children: BDFDB.LanguageUtils.LanguageStrings.RESET
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				changedGuilds = BDFDB.DataUtils.load(this, "servers");
				settings = BDFDB.DataUtils.get(this, "settings");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
		
			onGuildContextMenu (e) {
				if (e.instance.props.guild) {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
					children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_localserversettings_text,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-submenu"),
							children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
								children: [
									BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
										label: this.labels.submenu_serversettings_text,
										id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-change"),
										action: _ => {
											this.openGuildSettingsModal(e.instance.props.guild.id);
										}
									}),
									BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
										label: this.labels.submenu_resetsettings_text,
										id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-reset"),
										disabled: !changedGuilds[e.instance.props.guild.id],
										action: _ => {
											BDFDB.DataUtils.remove(this, "servers", e.instance.props.guild.id);
											this.forceUpdateAll();
										}
									})
								]
							})
						})
					}));
				}
			}

			processGuild (e) {
				if (BDFDB.GuildUtils.is(e.instance.props.guild) && e.instance.props.guild.joinedAt && settings.changeInGuildList) {
					e.instance.props.guild = this.getGuildData(e.instance.props.guild.id);
					if (e.returnvalue) {
						let data = changedGuilds[e.instance.props.guild.id];
						if (data && (data.color3 || data.color4)) {
							let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["GuildTooltip", "BDFDB_TooltipContainer"]});
							if (index > -1) children[index] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
								tooltipConfig: {
									type: "right",
									guild: e.instance.props.guild,
									list: true,
									offset: 12,
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
				if (settings.changeInGuildList) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "NavItem"});
					if (index > -1 && children[index].props.to && children[index].props.to.pathname) {
						let guild = BDFDB.LibraryModules.GuildStore.getGuild((children[index].props.to.pathname.split("/channels/")[1] || "").split("/")[0]);
						if (guild) {
							let data = changedGuilds[guild.id];
							if (data) {
								if (data.shortName) children[index].props.name = data.shortName.split("").join(" ");
								else if (data.name && data.ignoreCustomName) children[index].props.name = guild.name;
							}
						}
					}
				}
			}

			processGuildAcronym (e) {
				if (typeof e.returnvalue.props.children == "function" && settings.changeInGuildList) {
					let pathname = BDFDB.ObjectUtils.get(e.instance, "props.to.pathname");
					let data = pathname && changedGuilds[(pathname.split("/channels/")[1] || "").split("/")[0]];
					if (data) {
						let renderChildren = e.returnvalue.props.children;
						e.returnvalue.props.children = (...args) => {
							let renderedChildren = renderChildren(...args);
							let [children, index] = BDFDB.ReactUtils.findParent(renderedChildren, {props:[["className", BDFDB.disCN.guildiconacronym]]});
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
				if (BDFDB.GuildUtils.is(e.instance.props.guild) && e.instance.props.guild.joinedAt) {
					if (e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.guildfolderguildicon) > -1) e.instance.props.guild = this.getGuildData(e.instance.props.guild.id, settings.changeInGuildList);
					else if (e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.listavatar) > -1) e.instance.props.guild = this.getGuildData(e.instance.props.guild.id, settings.changeInMutualGuilds);
					else e.instance.props.guild = this.getGuildData(e.instance.props.guild.id);
				}
			}
			
			processGuildIcon (e) {
				if (BDFDB.GuildUtils.is(e.instance.props.guild) && e.instance.props.guild.joinedAt && e.instance.props.style && (!e.instance.props.style.backgroundImage || e.instance.props.style.backgroundImage == "none")) {
					let data = changedGuilds[e.instance.props.guild.id];
					if (data) {
						if (e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.guildfolderguildicon) > -1) this.changeGuildIcon(e, data, settings.changeInGuildList);
						else if (e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.listavatar) > -1 || BDFDB.ReactUtils.findConstructor(e.instance, "MutualGuild", {up: true})) this.changeGuildIcon(e, data, settings.changeInMutualGuilds);
						else this.changeGuildIcon(e, data);
					}
				}
			}

			processMutualGuilds (e) {
				if (settings.changeInMutualGuilds) for (let i in e.instance.props.mutualGuilds) e.instance.props.mutualGuilds[i].guild = this.getGuildData(e.instance.props.mutualGuilds[i].guild.id);
			}

			processQuickSwitcher (e) {
				if (settings.changeInQuickSwitcher) for (let i in e.instance.props.results) if (e.instance.props.results[i].type == "GUILD") e.instance.props.results[i].record = this.getGuildData(e.instance.props.results[i].record.id);
			}

			processQuickSwitchChannelResult (e) {
				if (e.instance.props.channel && e.instance.props.channel.guild_id && settings.changeInQuickSwitcher) {
					e.instance.props.children.props.children = this.getGuildData(e.instance.props.channel.guild_id).name;
				}
			}
			
			processRecentsChannelHeader (e) {
				if (settings.changeInRecentMentions && BDFDB.ArrayUtils.is(e.returnvalue.props.children)) {
					for (let child of e.returnvalue.props.children) if (child && child.props && child.props.channel && child.type.displayName == "ChannelName") {
						let oldType = child.type;
						child.type = (...args) => {
							let instance = oldType(...args);
							let guildName = BDFDB.ReactUtils.findChild(instance, {props:[["className", BDFDB.disCN.recentmentionsguildname]]});
							if (guildName) guildName.props.children = (this.getGuildData(e.instance.props.channel.guild_id) || {}).name || guildName.props.children;
							return instance;
						};
						child.type.displayName = oldType.displayName;
					}
				}
			}
			
			processGuildSidebar (e) {
				if (e.instance.props.guild) {
					let data = changedGuilds[e.instance.props.guild.id];
					if (data) {
						if (data.removeBanner) e.instance.props.guild = new BDFDB.DiscordObjects.Guild(Object.assign({}, e.instance.props.guild, {banner: null}));
						else if (data.banner) e.instance.props.guild = new BDFDB.DiscordObjects.Guild(Object.assign({}, e.instance.props.guild, {banner: data.banner}));
					}
				}
			}
			
			processGuildHeader (e) {
				if (e.instance.props.guild && settings.changeInGuildHeader) {
					e.instance.props.guild = this.getGuildData(e.instance.props.guild.id);
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
			
			processInviteGuildName (e) {
				if (e.instance.props.guild && e.instance.props.guild.joinedAt && settings.changeInGuildInvites) {
					e.instance.props.guild = this.getGuildData(e.instance.props.guild.id);
				}
			}
			
			getGuildData (guildId, change = true) {
				let guild = BDFDB.LibraryModules.GuildStore.getGuild(guildId);
				if (!guild) return new BDFDB.DiscordObjects.Guild({});
				let data = change && changedGuilds[guild.id];
				if (data) {
					let newGuildObject = {}, nativeObject = new BDFDB.DiscordObjects.Guild(guild);
					for (let key in nativeObject) newGuildObject[key] = nativeObject[key];
					newGuildObject.name = data.name || nativeObject.name;
					newGuildObject.acronym = data.shortName && data.shortName.replace(/\s/g, "") || BDFDB.LibraryModules.StringUtils.getAcronym(!data.ignoreCustomName && data.name || nativeObject.name);
					if (data.removeIcon) {
						newGuildObject.icon = null;
						newGuildObject.getIconURL = _ => {return null;};
					}
					else if (data.url) {
						newGuildObject.icon = data.url;
						newGuildObject.getIconURL = _ => {return data.url;};
					}
					if (data.removeBanner) newGuildObject.banner = null;
					else if (data.banner) newGuildObject.banner = data.banner;
					return newGuildObject;
				}
				return new BDFDB.DiscordObjects.Guild(guild);
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

			openGuildSettingsModal (guildId) {
				let guild = BDFDB.LibraryModules.GuildStore.getGuild(guildId);
				if (!guild) return;
				let data = changedGuilds[guild.id] || {};
				
				let currentIgnoreCustomNameState = data.ignoreCustomName;
				
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
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										className: "input-guildname",
										key: "GUILDNAME",
										value: data.name,
										placeholder: guild.name,
										autoFocus: true,
										onChange: (value, instance) => {
											if (!currentIgnoreCustomNameState) {
												let acronymInputIns = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return.return.return, {key: "GUILDACRONYM"});
												if (acronymInputIns) {
													acronymInputIns.props.placeholder = value && BDFDB.LibraryModules.StringUtils.getAcronym(value) || guild.acronym;
													BDFDB.ReactUtils.forceUpdate(acronymInputIns);
												}
											}
										}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_guildacronym_text,
									className: BDFDB.disCN.marginbottom8,
									children: 
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										className: "input-guildacronym",
										key: "GUILDACRONYM",
										value: data.shortName,
										placeholder: !data.ignoreCustomName && data.name && BDFDB.LibraryModules.StringUtils.getAcronym(data.name) || guild.acronym
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									className: BDFDB.disCN.marginbottom20 + " input-ignorecustomname",
									label: this.labels.modal_ignorecustomname_text,
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
									value: data.ignoreCustomName,
									onChange: (value, instance) => {
										currentIgnoreCustomNameState = value;
										let nameInputIns = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {key: "GUILDNAME"});
										let acronymInputIns = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return, {key: "GUILDACRONYM"});
										if (nameInputIns && acronymInputIns) {
											acronymInputIns.props.placeholder = !value && nameInputIns.props.value && BDFDB.LibraryModules.StringUtils.getAcronym(nameInputIns.props.value) || guild.acronym;
											BDFDB.ReactUtils.forceUpdate(acronymInputIns);
										}
									}
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.marginbottom20,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
											className: BDFDB.disCN.marginbottom8,
											align: BDFDB.LibraryComponents.Flex.Align.CENTER,
											direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
											children: [
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
													className: BDFDB.disCN.marginreset,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													children: this.labels.modal_guildicon_text
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													className: "input-removeicon",
													type: "Switch",
													grow: 0,
													label: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													value: data.removeIcon,
													onChange: (value, instance) => {
														let iconInputIins = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return.return, {key: "GUILDICON"});
														if (iconInputIins) {
															delete iconInputIins.props.success;
															delete iconInputIins.props.errorMessage;
															iconInputIins.props.disabled = value;
															BDFDB.ReactUtils.forceUpdate(iconInputIins);
														}
													}
												})
											]
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
											className: "input-guildicon",
											key: "GUILDICON",
											success: !data.removeIcon && data.url,
											maxLength: 100000000000000000000,
											value: data.url,
											placeholder: BDFDB.GuildUtils.getIcon(guild.id),
											disabled: data.removeIcon,
											onChange: (value, instance) => {
												this.checkUrl(value, instance);
											}
										})
									]
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.marginbottom20,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
											className: BDFDB.disCN.marginbottom8,
											align: BDFDB.LibraryComponents.Flex.Align.CENTER,
											direction: BDFDB.LibraryComponents.Flex.Direction.HORIZONTAL,
											children: [
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
													className: BDFDB.disCN.marginreset,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													children: this.labels.modal_guildbanner_text
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													className: "input-removebanner",
													type: "Switch",
													grow: 0,
													label: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													value: data.removeBanner && guild.id != "410787888507256842",
													disabled: guild.id == "410787888507256842",
													onChange: (value, instance) => {
														let bannerInputIns = BDFDB.ReactUtils.findOwner(instance._reactInternalFiber.return.return, {key: "GUILDBANNER"});
														if (bannerInputIns) {
															delete bannerInputIns.props.success;
															delete bannerInputIns.props.errorMessage;
															bannerInputIns.props.disabled = value;
															BDFDB.ReactUtils.forceUpdate(bannerInputIns);
														}
													}
												})
											]
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
											className: "input-guildbanner",
											key: "GUILDBANNER",
											success: !data.removeBanner && data.banner,
											maxLength: 100000000000000000000,
											value: data.banner,
											placeholder: BDFDB.GuildUtils.getBanner(guild.id),
											disabled: data.removeBanner || guild.id == "410787888507256842",
											onChange: (value, instance) => {
												this.checkUrl(value, instance);
											}
										})
									]
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
							let oldData = Object.assign({}, data);
							
							let guildnameinput = modal.querySelector(".input-guildname " + BDFDB.dotCN.input);
							let guildacronyminput = modal.querySelector(".input-guildacronym " + BDFDB.dotCN.input);
							let ignorecustomnameinput = modal.querySelector(".input-ignorecustomname " + BDFDB.dotCN.switchinner);
							let guildiconinput = modal.querySelector(".input-guildicon " + BDFDB.dotCN.input);
							let removeiconinput = modal.querySelector(".input-removeicon " + BDFDB.dotCN.switchinner);
							let guildbannerinput = modal.querySelector(".input-guildbanner " + BDFDB.dotCN.input);
							let removebannerinput = modal.querySelector(".input-removebanner " + BDFDB.dotCN.switchinner);
							
							data.name = guildnameinput.value.trim() || null;
							data.shortName = guildacronyminput.value.trim() || null;
							data.ignoreCustomName = ignorecustomnameinput.checked;
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
							else if (!BDFDB.equals(oldData, data) && (changed = true)) BDFDB.DataUtils.save(data, this, "servers", guild.id);
							if (changed) this.forceUpdateAll();;
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
				else instance.checkTimeout = BDFDB.TimeUtils.timeout(_ => {
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
							modal_guildacronym_text:			"Akronim lokalnog poslužitelja",
							modal_ignorecustomname_text:		"Koristite izvorno ime poslužitelja za akronim poslužitelja",
							modal_guildicon_text:				"Ikona",
							modal_guildbanner_text:				"Baner",
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
							modal_guildacronym_text:			"Lokalt serverakronym",
							modal_ignorecustomname_text:		"Brug det originale servernavn til serverens akronym",
							modal_guildicon_text:				"Ikon",
							modal_guildbanner_text:				"Banner",
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
							modal_guildacronym_text:			"Lokales Serverkürzel",
							modal_ignorecustomname_text:		"Benutze den ursprünglichen Servernamen für das Serverkürzel",
							modal_guildicon_text:				"Icon",
							modal_guildbanner_text:				"Banner",
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
							modal_guildacronym_text:			"Acrónimo local del servidor",
							modal_ignorecustomname_text:		"Use el nombre del servidor original para el acrónimo del servidor",
							modal_guildicon_text:				"Icono",
							modal_guildbanner_text:				"Bandera",
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
							modal_guildacronym_text:			"Acronyme local de serveur",
							modal_ignorecustomname_text:		"Utilisez le nom de serveur d'origine pour l'acronyme de serveur",
							modal_guildicon_text:				"Icône",
							modal_guildbanner_text:				"Bannière",
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
							modal_guildacronym_text:			"Acronimo locale server",
							modal_ignorecustomname_text:		"Utilizzare il nome del server originale per l'acronimo del server",
							modal_guildicon_text:				"Icona",
							modal_guildbanner_text:				"Bandiera",
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
							modal_guildacronym_text:			"Lokale server acroniem",
							modal_ignorecustomname_text:		"Gebruik de oorspronkelijke servernaam voor het serveracrononiem",
							modal_guildicon_text:				"Icoon",
							modal_guildbanner_text:				"Banier",
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
							modal_guildacronym_text:			"Lokalt serverforkortelse",
							modal_ignorecustomname_text:		"Bruk det originale servernavnet til serverforkortelsen",
							modal_guildicon_text:				"Ikon",
							modal_guildbanner_text:				"Banner",
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
							modal_guildacronym_text:			"Akronim lokalnego serwera",
							modal_ignorecustomname_text:		"Użyj oryginalnej nazwy serwera dla akronimu serwera",
							modal_guildicon_text:				"Ikona",
							modal_guildbanner_text:				"Baner",
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
							modal_guildacronym_text:			"Acrônimo local de servidor",
							modal_ignorecustomname_text:		"Use o nome do servidor original para a sigla do servidor",
							modal_guildicon_text:				"Icone",
							modal_guildbanner_text:				"Bandeira",
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
							modal_guildacronym_text:			"Paikallisen palvelimen lyhenne",
							modal_ignorecustomname_text:		"Käytä alkuperäistä palvelimen nimeä palvelimen lyhenteessä",
							modal_guildicon_text:				"Ikonin",
							modal_guildbanner_text:				"Banneri",
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
							modal_guildacronym_text:			"Lokal server förkortning",
							modal_ignorecustomname_text:		"Använd det ursprungliga servernamnet för serverförkortningen",
							modal_guildicon_text:				"Ikon",
							modal_guildbanner_text:				"Banderoll",
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
							modal_header_text:					"Yerel sunucu ayarları",
							modal_guildname_text:				"Yerel sunucu adı",
							modal_guildacronym_text:			"Yerel sunucu kısaltması",
							modal_ignorecustomname_text:		"Sunucu kısaltması için orijinal sunucu adını kullanın",
							modal_guildicon_text:				"Simge",
							modal_guildbanner_text:				"Afişi",
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
							modal_guildacronym_text:			"Zkratka místního serveru",
							modal_ignorecustomname_text:		"Pro zkratku serveru použijte původní název serveru",
							modal_guildicon_text:				"Ikony",
							modal_guildbanner_text:				"Prapor",
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
							modal_guildacronym_text:			"Акроним на локалния сървър",
							modal_ignorecustomname_text:		"Използвайте оригиналното име на сървъра за съкращението на сървъра",
							modal_guildicon_text:				"Икона",
							modal_guildbanner_text:				"Знаме",
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
							modal_guildacronym_text:			"Акроним локального сервера",
							modal_ignorecustomname_text:		"Используйте оригинальное имя сервера для сокращения сервера",
							modal_guildicon_text:				"Значок",
							modal_guildbanner_text:				"Баннер",
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
							modal_guildacronym_text:			"Акронім локального сервера",
							modal_ignorecustomname_text:		"Використовуйте оригінальне ім'я сервера для абревіатури сервера",
							modal_guildicon_text:				"Іконка",
							modal_guildbanner_text:				"Банер",
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
							modal_guildacronym_text:			"ローカルサーバーの頭字語",
							modal_ignorecustomname_text:		"サーバーの頭字語に元のサーバー名を使用する",
							modal_guildicon_text:				"アイコン",
							modal_guildbanner_text:				"バナー",
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
							modal_guildacronym_text:			"本地服務器縮寫",
							modal_ignorecustomname_text:		"使用原始服務器名稱作為服務器首字母縮寫",
							modal_guildicon_text:				"圖標",
							modal_guildbanner_text:				"旗幟",
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
							modal_guildacronym_text:			"로컬 서버 약어",
							modal_ignorecustomname_text:		"서버 약어에 원래 서버 이름을 사용하십시오",
							modal_guildicon_text:				"상",
							modal_guildbanner_text:				"기치",
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
							modal_guildacronym_text:			"Local Serveracronym",
							modal_ignorecustomname_text:		"Use the original Servername for the Serveracronym",
							modal_guildicon_text:				"Icon",
							modal_guildbanner_text:				"Banner",
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
		};
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();