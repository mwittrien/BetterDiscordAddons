/**
 * @name EditServers
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 2.3.7
 * @description Allows you to locally edit Servers
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/EditServers/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/EditServers/EditServers.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "EditServers",
			"author": "DevilBro",
			"version": "2.3.7",
			"description": "Allows you to locally edit Servers"
		},
		"changeLog": {
			"fixed": {
				"Server Header": "Fixed changes not appearing in the Server Header in the Channel List"
			}
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
		var changedGuilds = {};
	
		return class EditServers extends Plugin {
			onLoad () {
				this.defaults = {
					general: {
						addOriginalTooltip:		{value: true, 			description: "Hovering over a changed Server Header shows the original Name as Tooltip"},
					},
					places: {
						guildList:				{value: true, 			description: "Server List"},
						guildHeader:			{value: true, 			description: "Server Header"},
						guildInvites:			{value: true, 			description: "Server Invites"},
						chat:					{value: true, 			description: "Chat (Welcome Message, etc.)"},
						mutualGuilds:			{value: true, 			description: "Mutual Servers"},
						recentMentions:			{value: true, 			description: "Recent Mentions Popout"},
						quickSwitcher:			{value: true, 			description: "Quick Switcher"}
					}
				};
			
				this.patchedModules = {
					before: {
						GuildItem: "type",
						GuildIconWrapper: "render",
						MutualGuilds: "default",
						QuickSwitcher: "render",
						QuickSwitchChannelResult: "render",
						GuildSidebar: "render",
						GuildHeader: "type",
						InviteGuildName: "GuildName"
					},
					after: {
						RecentsChannelHeader: "default",
						GuildItem: "type",
						BlobMask: "render",
						GuildIconWrapper: "render",
						GuildIcon: "render",
						NavItem: "default",
						GuildHeader: "type",
						WelcomeArea: "default"
					}
				};
				
				this.patchPriority = 7;
				
				this.css = `
					${BDFDB.dotCN.inviteguildicon} {
						background-size: cover;
						object-fit: cover;
					}
				`;
			}
			
			onStart () {				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.IconUtils, "getGuildBannerURL", {instead: e => {
					let guild = BDFDB.LibraryModules.GuildStore.getGuild(e.methodArguments[0].id);
					if (guild) {
						if (e.methodArguments[0].id == "410787888507256842") return guild.banner;
						let data = changedGuilds[guild.id];
						if (data && data.banner && !data.removeBanner) return data.banner;
					}
					return e.callOriginalMethod();
				}});

				BDFDB.PatchUtils.patch(this, BDFDB.LibraryComponents.GuildComponents.Guild.prototype, "render", {
					before: e => this.processGuildItem({instance: e.thisObject, returnvalue: e.returnValue, methodname: "render"}),
					after: e => this.processGuildItem({instance: e.thisObject, returnvalue: e.returnValue, methodname: "render"})
				});
				
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
							title: "Change Servers in:",
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
							label: "Reset all Servers",
							onClick: _ => BDFDB.ModalUtils.confirm(this, this.labels.confirm_resetall, _ => {
								BDFDB.DataUtils.remove(this, "servers");
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
		
			forceUpdateAll () {
				changedGuilds = BDFDB.DataUtils.load(this, "servers");
				
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.GuildUtils.rerenderAll();
			}
		
			onGuildContextMenu (e) {
				if (e.instance.props.guild) {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
					children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_localserversettings,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-submenu"),
							children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
								children: [
									BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
										label: this.labels.submenu_serversettings,
										id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-change"),
										action: _ => this.openGuildSettingsModal(e.instance.props.guild.id)
									}),
									BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
										label: this.labels.submenu_resetsettings,
										id: BDFDB.ContextMenuUtils.createItemId(this.name, "settings-reset"),
										color: BDFDB.LibraryComponents.MenuItems.Colors.DANGER,
										disabled: !changedGuilds[e.instance.props.guild.id],
										action: event => {
											let remove = _ => {
												BDFDB.DataUtils.remove(this, "servers", e.instance.props.guild.id);
												this.forceUpdateAll(true);
											};
											if (event.shiftKey) remove();
											else BDFDB.ModalUtils.confirm(this, this.labels.confirm_reset, remove);
										}
									})
								]
							})
						})
					}));
				}
			}

			processGuildItem (e) {
				if (BDFDB.GuildUtils.is(e.instance.props.guild) && e.instance.props.guild.joinedAt && this.settings.places.guildList) {
					if (!e.returnvalue) e.instance.props.guild = this.getGuildData(e.instance.props.guild.id);
					else {
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
				if (this.settings.places.guildList) {
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
			
			processGuildIconWrapper (e) {
				if (BDFDB.GuildUtils.is(e.instance.props.guild) && e.instance.props.guild.joinedAt) {
					if (e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.guildfolderguildicon) > -1) e.instance.props.guild = this.getGuildData(e.instance.props.guild.id, this.settings.places.guildList);
					else if (e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.listavatar) > -1) e.instance.props.guild = this.getGuildData(e.instance.props.guild.id, this.settings.places.mutualGuilds);
					else e.instance.props.guild = this.getGuildData(e.instance.props.guild.id);
				}
			}
			
			processGuildIcon (e) {
				if (BDFDB.GuildUtils.is(e.instance.props.guild) && e.instance.props.guild.joinedAt && e.instance.props.style && (!e.instance.props.style.backgroundImage || e.instance.props.style.backgroundImage == "none")) {
					let data = changedGuilds[e.instance.props.guild.id];
					if (data) {
						if (e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.guildfolderguildicon) > -1) this.changeGuildIcon(e, data, this.settings.places.guildList);
						else if (e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.listavatar) > -1 || BDFDB.ReactUtils.findConstructor(e.instance, "MutualGuild", {up: true})) this.changeGuildIcon(e, data, this.settings.places.mutualGuilds);
						else this.changeGuildIcon(e, data);
					}
				}
			}
			
			processNavItem (e) {
				if (this.settings.places.guildList) {
					let pathname = BDFDB.ObjectUtils.get(e.instance, "props.to.pathname");
					let data = pathname && changedGuilds[(pathname.split("/channels/")[1] || "").split("/")[0]];
					if (data) {
						let guildAcronym = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.guildiconacronym]]});
						if (guildAcronym) {
							let fontGradient = BDFDB.ObjectUtils.is(data.color2);
							guildAcronym.props.style = Object.assign({}, guildAcronym.props.style, {
								background: BDFDB.ObjectUtils.is(data.color1) ? BDFDB.ColorUtils.createGradient(data.color1) : BDFDB.ColorUtils.convert(data.color1, "RGBA"),
								color: !fontGradient && BDFDB.ColorUtils.convert(data.color2, "RGBA")
							});
							if (fontGradient) guildAcronym.props.children = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextGradientElement, {
								gradient: BDFDB.ColorUtils.createGradient(data.color2),
								children: guildAcronym.props.children
							});
						}
					}
				}
			}

			processMutualGuilds (e) {
				if (this.settings.places.mutualGuilds) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "GuildRow"});
					if (index > -1) for (let row of children) if (row && row.props && row.props.guild) row.props.guild = this.getGuildData(row.props.guild.id);
				}
			}

			processQuickSwitcher (e) {
				if (this.settings.places.quickSwitcher) for (let i in e.instance.props.results) if (e.instance.props.results[i].type == "GUILD") e.instance.props.results[i].record = this.getGuildData(e.instance.props.results[i].record.id);
			}

			processQuickSwitchChannelResult (e) {
				if (e.instance.props.channel && e.instance.props.channel.guild_id && this.settings.places.quickSwitcher) {
					e.instance.props.children.props.children = this.getGuildData(e.instance.props.channel.guild_id).name;
				}
			}
			
			processRecentsChannelHeader (e) {
				if (this.settings.places.recentMentions && BDFDB.ArrayUtils.is(e.returnvalue.props.children)) {
					for (let child of e.returnvalue.props.children) if (child && child.props && child.props.channel && child.type.displayName == "ChannelName") {
						let oldType = child.type;
						child.type = (...args) => {
							let instance = oldType(...args);
							let guildName = BDFDB.ReactUtils.findChild(instance, {props: [["className", BDFDB.disCN.recentmentionsguildname]]});
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
				if (e.instance.props.guild && this.settings.places.guildHeader) {
					e.instance.props.guild = this.getGuildData(e.instance.props.guild.id);
					let oldName = (BDFDB.LibraryModules.GuildStore.getGuild(e.instance.props.guild.id) || {}).name;
					if (e.returnvalue && this.settings.general.addOriginalTooltip && oldName != e.instance.props.guild.name) {
						e.returnvalue.props.children[0] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: oldName,
							children: e.returnvalue.props.children[0],
							tooltipConfig: {type: "right"}
						});
					}
				}
			}
			
			processInviteGuildName (e) {
				if (e.instance.props.guild && e.instance.props.guild.joinedAt && this.settings.places.guildInvites) {
					e.instance.props.guild = this.getGuildData(e.instance.props.guild.id);
				}
			}
			
			processWelcomeArea (e) {
				if (e.instance.props.channel && this.settings.places.chat) {
					let name = (BDFDB.LibraryModules.GuildStore.getGuild(e.instance.props.channel.guild_id) || {}).name;
					let guildName = name && BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", "titleName-3-Lp3Z"]]});
					if (guildName && guildName.props && BDFDB.ArrayUtils.is(guildName.props.children)) {
						for (let child of guildName.props.children) if (child && child.props && BDFDB.ArrayUtils.is(child.props.children) && child.props.children[0] == name) {
							child.props.children = [(this.getGuildData(e.instance.props.channel.guild_id) || {}).name || name];
							break;
						}
					}
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
				let newData = Object.assign({}, data);
				
				let nameInput, acronymInput, iconInput, bannerInput;
				
				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: this.labels.modal_header,
					subHeader: guild.name,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader1,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_guildname,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										value: data.name,
										placeholder: guild.name,
										autoFocus: true,
										ref: instance => {if (instance) nameInput = instance;},
										onChange: value => {
											newData.name = value;
											if (!newData.ignoreCustomName) {
												acronymInput.props.placeholder = value && BDFDB.LibraryModules.StringUtils.getAcronym(value) || guild.acronym;
												BDFDB.ReactUtils.forceUpdate(acronymInput);
											}
										}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_guildacronym,
									className: BDFDB.disCN.marginbottom8,
									children: 
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										value: data.shortName,
										ref: instance => {if (instance) acronymInput = instance;},
										placeholder: !data.ignoreCustomName && data.name && BDFDB.LibraryModules.StringUtils.getAcronym(data.name) || guild.acronym,
										onChange: value => {newData.shortName = value;}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									className: BDFDB.disCN.marginbottom20,
									label: this.labels.modal_ignorecustomname,
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
									value: data.ignoreCustomName,
									onChange: value => {
										newData.ignoreCustomName = value;
										acronymInput.props.placeholder = !value && newData.name && BDFDB.LibraryModules.StringUtils.getAcronym(newData.name) || guild.acronym;
										BDFDB.ReactUtils.forceUpdate(acronymInput);
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
													children: this.labels.modal_guildicon
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
											placeholder: BDFDB.GuildUtils.getIcon(guild.id),
											disabled: data.removeIcon,
											ref: instance => {if (instance) iconInput = instance;},
											onChange: (value, instance) => {
												this.checkUrl(value, instance).then(returnValue => {
													newData.url = returnValue;
												});
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
													children: this.labels.modal_guildbanner
												}),
												BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
													type: "Switch",
													margin: 0,
													grow: 0,
													label: BDFDB.LanguageUtils.LanguageStrings.REMOVE,
													tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
													value: data.removeBanner && guild.id != "410787888507256842",
													disabled: guild.id == "410787888507256842",
													onChange: value => {
														newData.removeBanner = value;
														if (value) {
															delete bannerInput.props.success;
															delete bannerInput.props.errorMessage;
															bannerInput.props.disabled = true;
															BDFDB.ReactUtils.forceUpdate(bannerInput);
														}
														else {
															bannerInput.props.disabled = false;
															this.checkUrl(bannerInput.props.value, bannerInput).then(returnValue => {
																newData.url = returnValue;
															});
														}
													}
												})
											]
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
											success: !data.removeBanner && data.banner,
											maxLength: 100000000000000000000,
											value: data.banner,
											placeholder: BDFDB.GuildUtils.getBanner(guild.id),
											disabled: data.removeBanner || guild.id == "410787888507256842",
											ref: instance => {if (instance) bannerInput = instance;},
											onChange: (value, instance) => {
												this.checkUrl(value, instance).then(returnValue => {
													newData.banner = returnValue;
												});
											}
										})
									]
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader2,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker1,
									className: BDFDB.disCN.marginbottom20,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
											color: data.color1,
											onColorChange: value => {newData.color1 = value;}
										})
									]
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker2,
									className: BDFDB.disCN.marginbottom20,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
											color: data.color2,
											onColorChange: value => {newData.color2 = value;}
										})
									]
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader3,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker3,
									className: BDFDB.disCN.marginbottom20,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
											color: data.color3,
											onColorChange: value => {newData.color3 = value;}
										})
									]
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker4,
									className: BDFDB.disCN.marginbottom20,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
											color: data.color4,
											onColorChange: value => {newData.color4 = value;}
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
						onClick: _ => {
							newData.url = !newData.removeIcon ? newData.url : "";
							newData.removeBanner = newData.removeBanner && guild.id != "410787888507256842";
							newData.banner = !newData.removeBanner ? newData.banner : "";

							let changed = false;
							if (Object.keys(newData).every(key => newData[key] == null || newData[key] == false) && (changed = true)) {
								BDFDB.DataUtils.remove(this, "servers", guild.id);
							}
							else if (!BDFDB.equals(newData, data) && (changed = true)) {
								BDFDB.DataUtils.save(newData, this, "servers", guild.id);
							}
							if (changed) this.forceUpdateAll();
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

			setBanner (id, data) {
				data = data || {};
				let guild = BDFDB.LibraryModules.GuildStore.getGuild(id);
				if (!guild) return;
				if (guild.EditServersCachedBanner === undefined) guild.EditServersCachedBanner = guild.banner;
				guild.banner = data.removeBanner ? null : (data.banner || guild.EditServersCachedBanner);
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							confirm_reset:						"Наистина ли искате да нулирате този сървър?",
							confirm_resetall:					"Наистина ли искате да нулирате всички сървъри?",
							context_localserversettings:		"Настройки на локалния сървър",
							modal_colorpicker1:					"Цвят на иконата",
							modal_colorpicker2:					"Цвят на шрифта",
							modal_colorpicker3:					"Цвят на подсказка",
							modal_colorpicker4:					"Цвят на шрифта",
							modal_guildacronym:					"Локален сървър Акроним",
							modal_guildbanner:					"Банер",
							modal_guildicon:					"Икона",
							modal_guildname:					"Име на локален сървър",
							modal_header:						"Настройки на локалния сървър",
							modal_ignorecustomname:				"Използвайте оригиналното име на сървъра за съкращението на сървъра",
							modal_invalidurl:					"Невалиден адрес",
							modal_tabheader1:					"Сървър",
							modal_tabheader2:					"Цвят на иконата",
							modal_tabheader3:					"Цвят на подсказка",
							submenu_resetsettings:				"Нулиране на сървъра",
							submenu_serversettings:				"Промяна на настройките"
						};
					case "da":		// Danish
						return {
							confirm_reset:						"Er du sikker på, at du vil nulstille denne server?",
							confirm_resetall:					"Er du sikker på, at du vil nulstille alle servere?",
							context_localserversettings:		"Lokale serverindstillinger",
							modal_colorpicker1:					"Ikonfarve",
							modal_colorpicker2:					"Skrift farve",
							modal_colorpicker3:					"Værktøjstip farve",
							modal_colorpicker4:					"Skrift farve",
							modal_guildacronym:					"Lokal server akronym",
							modal_guildbanner:					"Banner",
							modal_guildicon:					"Ikon",
							modal_guildname:					"Lokalt servernavn",
							modal_header:						"Lokale serverindstillinger",
							modal_ignorecustomname:				"Brug det originale servernavn til serverakronymet",
							modal_invalidurl:					"Ugyldig URL",
							modal_tabheader1:					"Server",
							modal_tabheader2:					"Ikonfarve",
							modal_tabheader3:					"Værktøjstip farve",
							submenu_resetsettings:				"Nulstil server",
							submenu_serversettings:				"Ændre indstillinger"
						};
					case "de":		// German
						return {
							confirm_reset:						"Möchtest du diesen Server wirklich zurücksetzen?",
							confirm_resetall:					"Möchtest du wirklich alle Server zurücksetzen?",
							context_localserversettings:		"Lokale Servereinstellungen",
							modal_colorpicker1:					"Symbolfarbe",
							modal_colorpicker2:					"Schriftfarbe",
							modal_colorpicker3:					"Tooltipfarbe",
							modal_colorpicker4:					"Schriftfarbe",
							modal_guildacronym:					"Lokales Serverakronym",
							modal_guildbanner:					"Banner",
							modal_guildicon:					"Symbol",
							modal_guildname:					"Lokaler Servername",
							modal_header:						"Lokale Servereinstellungen",
							modal_ignorecustomname:				"Verwenden Sie den ursprünglichen Servernamen für das Serverakronym",
							modal_invalidurl:					"Ungültige URL",
							modal_tabheader1:					"Server",
							modal_tabheader2:					"Symbolfarbe",
							modal_tabheader3:					"Tooltipfarbe",
							submenu_resetsettings:				"Server zurücksetzen",
							submenu_serversettings:				"Einstellungen ändern"
						};
					case "el":		// Greek
						return {
							confirm_reset:						"Είστε βέβαιοι ότι θέλετε να επαναφέρετε αυτόν τον διακομιστή;",
							confirm_resetall:					"Είστε βέβαιοι ότι θέλετε να επαναφέρετε όλους τους διακομιστές;",
							context_localserversettings:		"Ρυθμίσεις τοπικού διακομιστή",
							modal_colorpicker1:					"Χρώμα εικονιδίου",
							modal_colorpicker2:					"Χρώμα γραμματοσειράς",
							modal_colorpicker3:					"Χρώμα επεξήγησης εργαλείου",
							modal_colorpicker4:					"Χρώμα γραμματοσειράς",
							modal_guildacronym:					"Τοπικό αρκτικόλεξο διακομιστή",
							modal_guildbanner:					"Πανό",
							modal_guildicon:					"Εικόνισμα",
							modal_guildname:					"Τοπικό όνομα διακομιστή",
							modal_header:						"Ρυθμίσεις τοπικού διακομιστή",
							modal_ignorecustomname:				"Χρησιμοποιήστε το αρχικό όνομα διακομιστή για το αρκτικόλεξο διακομιστή",
							modal_invalidurl:					"Μη έγκυρη διεύθυνση URL",
							modal_tabheader1:					"Υπηρέτης",
							modal_tabheader2:					"Χρώμα εικονιδίου",
							modal_tabheader3:					"Χρώμα επεξήγησης εργαλείου",
							submenu_resetsettings:				"Επαναφορά διακομιστή",
							submenu_serversettings:				"Αλλαξε ρυθμίσεις"
						};
					case "es":		// Spanish
						return {
							confirm_reset:						"¿Está seguro de que desea restablecer este servidor?",
							confirm_resetall:					"¿Está seguro de que desea restablecer todos los servidores?",
							context_localserversettings:		"Configuración del servidor local",
							modal_colorpicker1:					"Color del icono",
							modal_colorpicker2:					"Color de fuente",
							modal_colorpicker3:					"Color de información sobre herramientas",
							modal_colorpicker4:					"Color de fuente",
							modal_guildacronym:					"Acrónimo del servidor local",
							modal_guildbanner:					"Bandera",
							modal_guildicon:					"Icono",
							modal_guildname:					"Nombre del servidor local",
							modal_header:						"Configuración del servidor local",
							modal_ignorecustomname:				"Utilice el nombre del servidor original para el acrónimo del servidor",
							modal_invalidurl:					"URL invalida",
							modal_tabheader1:					"Servidor",
							modal_tabheader2:					"Color del icono",
							modal_tabheader3:					"Color de información sobre herramientas",
							submenu_resetsettings:				"Restablecer servidor",
							submenu_serversettings:				"Cambiar ajustes"
						};
					case "fi":		// Finnish
						return {
							confirm_reset:						"Haluatko varmasti nollata tämän palvelimen?",
							confirm_resetall:					"Haluatko varmasti nollata kaikki palvelimet?",
							context_localserversettings:		"Paikallisen palvelimen asetukset",
							modal_colorpicker1:					"Kuvakkeen väri",
							modal_colorpicker2:					"Fontin väri",
							modal_colorpicker3:					"Työkaluvihjeen väri",
							modal_colorpicker4:					"Fontin väri",
							modal_guildacronym:					"Paikallisen palvelimen lyhenne",
							modal_guildbanner:					"Banneri",
							modal_guildicon:					"Kuvake",
							modal_guildname:					"Paikallisen palvelimen nimi",
							modal_header:						"Paikallisen palvelimen asetukset",
							modal_ignorecustomname:				"Käytä palvelimen lyhenteessä alkuperäistä palvelimen nimeä",
							modal_invalidurl:					"Virheellinen URL",
							modal_tabheader1:					"Palvelin",
							modal_tabheader2:					"Kuvakkeen väri",
							modal_tabheader3:					"Työkaluvihjeen väri",
							submenu_resetsettings:				"Nollaa palvelin",
							submenu_serversettings:				"Vaihda asetuksia"
						};
					case "fr":		// French
						return {
							confirm_reset:						"Êtes-vous sûr de vouloir réinitialiser ce serveur?",
							confirm_resetall:					"Voulez-vous vraiment réinitialiser tous les serveurs?",
							context_localserversettings:		"Paramètres locaux du serveur",
							modal_colorpicker1:					"Couleur de l'icône",
							modal_colorpicker2:					"Couleur de la police",
							modal_colorpicker3:					"Couleur de l'info-bulle",
							modal_colorpicker4:					"Couleur de la police",
							modal_guildacronym:					"Acronyme local du serveur",
							modal_guildbanner:					"Bannière",
							modal_guildicon:					"Icône",
							modal_guildname:					"Nom local du serveur",
							modal_header:						"Paramètres locaux du serveur",
							modal_ignorecustomname:				"Utilisez le nom de serveur d'origine pour l'acronyme de serveur",
							modal_invalidurl:					"URL invalide",
							modal_tabheader1:					"Serveur",
							modal_tabheader2:					"Couleur de l'icône",
							modal_tabheader3:					"Couleur de l'info-bulle",
							submenu_resetsettings:				"Réinitialiser le serveur",
							submenu_serversettings:				"Modifier les paramètres"
						};
					case "hr":		// Croatian
						return {
							confirm_reset:						"Jeste li sigurni da želite resetirati ovaj poslužitelj?",
							confirm_resetall:					"Jeste li sigurni da želite resetirati sve poslužitelje?",
							context_localserversettings:		"Postavke lokalnog poslužitelja",
							modal_colorpicker1:					"Ikona Boja",
							modal_colorpicker2:					"Boja fonta",
							modal_colorpicker3:					"Boja opisa",
							modal_colorpicker4:					"Boja fonta",
							modal_guildacronym:					"Lokalni poslužitelj kratica",
							modal_guildbanner:					"Natpis",
							modal_guildicon:					"Ikona",
							modal_guildname:					"Naziv lokalnog poslužitelja",
							modal_header:						"Postavke lokalnog poslužitelja",
							modal_ignorecustomname:				"Koristite izvorno ime poslužitelja za kraticu poslužitelja",
							modal_invalidurl:					"Neispravna poveznica",
							modal_tabheader1:					"Poslužitelj",
							modal_tabheader2:					"Ikona Boja",
							modal_tabheader3:					"Boja opisa",
							submenu_resetsettings:				"Resetiraj poslužitelj",
							submenu_serversettings:				"Promijeniti postavke"
						};
					case "hu":		// Hungarian
						return {
							confirm_reset:						"Biztosan visszaállítja ezt a szervert?",
							confirm_resetall:					"Biztosan visszaállítja az összes szervert?",
							context_localserversettings:		"Helyi kiszolgáló beállításai",
							modal_colorpicker1:					"Ikon színe",
							modal_colorpicker2:					"Betű szín",
							modal_colorpicker3:					"Tooltip Color",
							modal_colorpicker4:					"Betű szín",
							modal_guildacronym:					"Helyi szerver betűszó",
							modal_guildbanner:					"Transzparens",
							modal_guildicon:					"Ikon",
							modal_guildname:					"Helyi kiszolgáló neve",
							modal_header:						"Helyi kiszolgáló beállításai",
							modal_ignorecustomname:				"A kiszolgáló rövidítéshez használja az eredeti kiszolgáló nevet",
							modal_invalidurl:					"Érvénytelen URL",
							modal_tabheader1:					"Szerver",
							modal_tabheader2:					"Ikon színe",
							modal_tabheader3:					"Tooltip Color",
							submenu_resetsettings:				"Reset Server",
							submenu_serversettings:				"Beállítások megváltoztatása"
						};
					case "it":		// Italian
						return {
							confirm_reset:						"Sei sicuro di voler reimpostare questo server?",
							confirm_resetall:					"Sei sicuro di voler ripristinare tutti i server?",
							context_localserversettings:		"Impostazioni locale del server",
							modal_colorpicker1:					"Colore dell'icona",
							modal_colorpicker2:					"Colore del carattere",
							modal_colorpicker3:					"Colore della descrizione comando",
							modal_colorpicker4:					"Colore del carattere",
							modal_guildacronym:					"Acronimo locale del server",
							modal_guildbanner:					"Banner",
							modal_guildicon:					"Icona",
							modal_guildname:					"Nome locale server",
							modal_header:						"Impostazioni locale del server",
							modal_ignorecustomname:				"Utilizzare il nome del server originale per l'acronimo del server",
							modal_invalidurl:					"URL non valido",
							modal_tabheader1:					"Server",
							modal_tabheader2:					"Colore dell'icona",
							modal_tabheader3:					"Colore della descrizione comando",
							submenu_resetsettings:				"Reimposta server",
							submenu_serversettings:				"Cambia impostazioni"
						};
					case "ja":		// Japanese
						return {
							confirm_reset:						"このサーバーをリセットしてもよろしいですか？",
							confirm_resetall:					"すべてのサーバーをリセットしてもよろしいですか？",
							context_localserversettings:		"ローカルサーバー設定",
							modal_colorpicker1:					"アイコンの色",
							modal_colorpicker2:					"フォントの色",
							modal_colorpicker3:					"ツールチップの色",
							modal_colorpicker4:					"フォントの色",
							modal_guildacronym:					"ローカルサーバーの頭字語",
							modal_guildbanner:					"バナー",
							modal_guildicon:					"アイコン",
							modal_guildname:					"ローカルサーバー名",
							modal_header:						"ローカルサーバー設定",
							modal_ignorecustomname:				"サーバーの頭字語には元のサーバー名を使用します",
							modal_invalidurl:					"無効なURL",
							modal_tabheader1:					"サーバ",
							modal_tabheader2:					"アイコンの色",
							modal_tabheader3:					"ツールチップの色",
							submenu_resetsettings:				"サーバーのリセット",
							submenu_serversettings:				"設定を変更する"
						};
					case "ko":		// Korean
						return {
							confirm_reset:						"이 서버를 재설정 하시겠습니까?",
							confirm_resetall:					"모든 서버를 재설정 하시겠습니까?",
							context_localserversettings:		"로컬 서버 설정",
							modal_colorpicker1:					"아이콘 색상",
							modal_colorpicker2:					"글자 색",
							modal_colorpicker3:					"툴팁 색상",
							modal_colorpicker4:					"글자 색",
							modal_guildacronym:					"로컬 서버 약어",
							modal_guildbanner:					"배너",
							modal_guildicon:					"상",
							modal_guildname:					"로컬 서버 이름",
							modal_header:						"로컬 서버 설정",
							modal_ignorecustomname:				"서버 약어에 원래 서버 이름 사용",
							modal_invalidurl:					"잘못된 URL",
							modal_tabheader1:					"섬기는 사람",
							modal_tabheader2:					"아이콘 색상",
							modal_tabheader3:					"툴팁 색상",
							submenu_resetsettings:				"서버 재설정",
							submenu_serversettings:				"설정 변경"
						};
					case "lt":		// Lithuanian
						return {
							confirm_reset:						"Ar tikrai norite iš naujo nustatyti šį serverį?",
							confirm_resetall:					"Ar tikrai norite iš naujo nustatyti visus serverius?",
							context_localserversettings:		"Vietinio serverio nustatymai",
							modal_colorpicker1:					"Piktogramos spalva",
							modal_colorpicker2:					"Šrifto spalva",
							modal_colorpicker3:					"Patarimo spalva",
							modal_colorpicker4:					"Šrifto spalva",
							modal_guildacronym:					"Vietinio serverio santrumpa",
							modal_guildbanner:					"Reklamjuostė",
							modal_guildicon:					"Piktograma",
							modal_guildname:					"Vietinio serverio pavadinimas",
							modal_header:						"Vietinio serverio nustatymai",
							modal_ignorecustomname:				"Serverio akronimui naudokite originalų serverio pavadinimą",
							modal_invalidurl:					"Neteisingas URL",
							modal_tabheader1:					"Serveris",
							modal_tabheader2:					"Piktogramos spalva",
							modal_tabheader3:					"Patarimo spalva",
							submenu_resetsettings:				"Iš naujo nustatyti serverį",
							submenu_serversettings:				"Pakeisti nustatymus"
						};
					case "nl":		// Dutch
						return {
							confirm_reset:						"Weet u zeker dat u deze server opnieuw wilt instellen?",
							confirm_resetall:					"Weet u zeker dat u alle servers wilt resetten?",
							context_localserversettings:		"Lokale serverinstellingen",
							modal_colorpicker1:					"Icoonkleur",
							modal_colorpicker2:					"Letterkleur",
							modal_colorpicker3:					"Tooltipkleur",
							modal_colorpicker4:					"Letterkleur",
							modal_guildacronym:					"Lokale serveracroniem",
							modal_guildbanner:					"Banner",
							modal_guildicon:					"Icoon",
							modal_guildname:					"Lokale servernaam",
							modal_header:						"Lokale serverinstellingen",
							modal_ignorecustomname:				"Gebruik de oorspronkelijke servernaam voor het serveracroniem",
							modal_invalidurl:					"Ongeldige URL",
							modal_tabheader1:					"Server",
							modal_tabheader2:					"Icoonkleur",
							modal_tabheader3:					"Tooltipkleur",
							submenu_resetsettings:				"Reset server",
							submenu_serversettings:				"Instellingen veranderen"
						};
					case "no":		// Norwegian
						return {
							confirm_reset:						"Er du sikker på at du vil tilbakestille denne serveren?",
							confirm_resetall:					"Er du sikker på at du vil tilbakestille alle serverne?",
							context_localserversettings:		"Lokale serverinnstillinger",
							modal_colorpicker1:					"Ikonfarge",
							modal_colorpicker2:					"Skriftfarge",
							modal_colorpicker3:					"Verktøytipsfarge",
							modal_colorpicker4:					"Skriftfarge",
							modal_guildacronym:					"Lokal serverakronymet",
							modal_guildbanner:					"Banner",
							modal_guildicon:					"Ikon",
							modal_guildname:					"Lokalt servernavn",
							modal_header:						"Lokale serverinnstillinger",
							modal_ignorecustomname:				"Bruk det originale servernavnet for serverakronymet",
							modal_invalidurl:					"Ugyldig URL",
							modal_tabheader1:					"Server",
							modal_tabheader2:					"Ikonfarge",
							modal_tabheader3:					"Verktøytipsfarge",
							submenu_resetsettings:				"Tilbakestill server",
							submenu_serversettings:				"Endre innstillinger"
						};
					case "pl":		// Polish
						return {
							confirm_reset:						"Czy na pewno chcesz zresetować ten serwer?",
							confirm_resetall:					"Czy na pewno chcesz zresetować wszystkie serwery?",
							context_localserversettings:		"Ustawienia serwera lokalnego",
							modal_colorpicker1:					"Kolor ikony",
							modal_colorpicker2:					"Kolor czcionki",
							modal_colorpicker3:					"Kolor etykiety narzędzi",
							modal_colorpicker4:					"Kolor czcionki",
							modal_guildacronym:					"Akronim lokalnego serwera",
							modal_guildbanner:					"Transparent",
							modal_guildicon:					"Ikona",
							modal_guildname:					"Nazwa serwera lokalnego",
							modal_header:						"Ustawienia serwera lokalnego",
							modal_ignorecustomname:				"Użyj oryginalnej nazwy serwera dla akronimu serwera",
							modal_invalidurl:					"Nieprawidłowy URL",
							modal_tabheader1:					"Serwer",
							modal_tabheader2:					"Kolor ikony",
							modal_tabheader3:					"Kolor etykiety narzędzi",
							submenu_resetsettings:				"Zresetuj serwer",
							submenu_serversettings:				"Zmień ustawienia"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							confirm_reset:						"Tem certeza que deseja redefinir este servidor?",
							confirm_resetall:					"Tem certeza de que deseja redefinir todos os servidores?",
							context_localserversettings:		"Configurações do servidor local",
							modal_colorpicker1:					"Cor do ícone",
							modal_colorpicker2:					"Cor da fonte",
							modal_colorpicker3:					"Cor da dica de ferramenta",
							modal_colorpicker4:					"Cor da fonte",
							modal_guildacronym:					"Acrônimo de servidor local",
							modal_guildbanner:					"Bandeira",
							modal_guildicon:					"Ícone",
							modal_guildname:					"Nome do servidor local",
							modal_header:						"Configurações do servidor local",
							modal_ignorecustomname:				"Use o nome do servidor original para o acrônimo do servidor",
							modal_invalidurl:					"URL inválida",
							modal_tabheader1:					"Servidor",
							modal_tabheader2:					"Cor do ícone",
							modal_tabheader3:					"Cor da dica de ferramenta",
							submenu_resetsettings:				"Reiniciar Servidor",
							submenu_serversettings:				"Mudar configurações"
						};
					case "ro":		// Romanian
						return {
							confirm_reset:						"Sigur doriți să resetați acest server?",
							confirm_resetall:					"Sigur doriți să resetați toate serverele?",
							context_localserversettings:		"Setări locale ale serverului",
							modal_colorpicker1:					"Culoare pictogramă",
							modal_colorpicker2:					"Culoarea fontului",
							modal_colorpicker3:					"Culoare sfat de instrumente",
							modal_colorpicker4:					"Culoarea fontului",
							modal_guildacronym:					"Acronim de server local",
							modal_guildbanner:					"Banner",
							modal_guildicon:					"Pictogramă",
							modal_guildname:					"Numele serverului local",
							modal_header:						"Setări locale ale serverului",
							modal_ignorecustomname:				"Utilizați numele serverului original pentru acronimul serverului",
							modal_invalidurl:					"URL invalid",
							modal_tabheader1:					"Server",
							modal_tabheader2:					"Culoare pictogramă",
							modal_tabheader3:					"Culoare sfat",
							submenu_resetsettings:				"Resetați serverul",
							submenu_serversettings:				"Schimbă setările"
						};
					case "ru":		// Russian
						return {
							confirm_reset:						"Вы уверены, что хотите сбросить этот сервер?",
							confirm_resetall:					"Вы уверены, что хотите сбросить все серверы?",
							context_localserversettings:		"Настройки локального сервера",
							modal_colorpicker1:					"Цвет значка",
							modal_colorpicker2:					"Цвет шрифта",
							modal_colorpicker3:					"Цвет всплывающей подсказки",
							modal_colorpicker4:					"Цвет шрифта",
							modal_guildacronym:					"Акроним локального сервера",
							modal_guildbanner:					"Баннер",
							modal_guildicon:					"Икона",
							modal_guildname:					"Имя локального сервера",
							modal_header:						"Настройки локального сервера",
							modal_ignorecustomname:				"Используйте исходное имя сервера для аббревиатуры сервера",
							modal_invalidurl:					"Неверная ссылка",
							modal_tabheader1:					"Сервер",
							modal_tabheader2:					"Цвет значка",
							modal_tabheader3:					"Цвет всплывающей подсказки",
							submenu_resetsettings:				"Сбросить сервер",
							submenu_serversettings:				"Изменить настройки"
						};
					case "sv":		// Swedish
						return {
							confirm_reset:						"Är du säker på att du vill återställa den här servern?",
							confirm_resetall:					"Är du säker på att du vill återställa alla servrar?",
							context_localserversettings:		"Lokala serverinställningar",
							modal_colorpicker1:					"Ikonfärg",
							modal_colorpicker2:					"Fontfärg",
							modal_colorpicker3:					"Verktygstipsfärg",
							modal_colorpicker4:					"Fontfärg",
							modal_guildacronym:					"Lokal servernakronym",
							modal_guildbanner:					"Baner",
							modal_guildicon:					"Ikon",
							modal_guildname:					"Lokalt servernamn",
							modal_header:						"Lokala serverinställningar",
							modal_ignorecustomname:				"Använd det ursprungliga servernamnet för servernakronym",
							modal_invalidurl:					"Ogiltig URL",
							modal_tabheader1:					"Server",
							modal_tabheader2:					"Ikonfärg",
							modal_tabheader3:					"Verktygstipsfärg",
							submenu_resetsettings:				"Återställ server",
							submenu_serversettings:				"Ändra inställningar"
						};
					case "th":		// Thai
						return {
							confirm_reset:						"แน่ใจไหมว่าต้องการรีเซ็ตเซิร์ฟเวอร์นี้",
							confirm_resetall:					"แน่ใจไหมว่าต้องการรีเซ็ตเซิร์ฟเวอร์ทั้งหมด",
							context_localserversettings:		"การตั้งค่าเซิร์ฟเวอร์ภายใน",
							modal_colorpicker1:					"ไอคอนสี",
							modal_colorpicker2:					"สีตัวอักษร",
							modal_colorpicker3:					"เคล็ดลับเครื่องมือสี",
							modal_colorpicker4:					"สีตัวอักษร",
							modal_guildacronym:					"ตัวย่อเซิร์ฟเวอร์ภายใน",
							modal_guildbanner:					"แบนเนอร์",
							modal_guildicon:					"ไอคอน",
							modal_guildname:					"ชื่อเซิร์ฟเวอร์ภายใน",
							modal_header:						"การตั้งค่าเซิร์ฟเวอร์ภายใน",
							modal_ignorecustomname:				"ใช้ชื่อเซิร์ฟเวอร์เดิมสำหรับตัวย่อเซิร์ฟเวอร์",
							modal_invalidurl:					"URL ไม่ถูกต้อง",
							modal_tabheader1:					"เซิร์ฟเวอร์",
							modal_tabheader2:					"ไอคอนสี",
							modal_tabheader3:					"เคล็ดลับเครื่องมือสี",
							submenu_resetsettings:				"รีเซ็ตเซิร์ฟเวอร์",
							submenu_serversettings:				"เปลี่ยนการตั้งค่า"
						};
					case "tr":		// Turkish
						return {
							confirm_reset:						"Bu Sunucuyu sıfırlamak istediğinizden emin misiniz?",
							confirm_resetall:					"Tüm Sunucuları sıfırlamak istediğinizden emin misiniz?",
							context_localserversettings:		"Yerel Sunucu Ayarları",
							modal_colorpicker1:					"Simge Rengi",
							modal_colorpicker2:					"Yazı rengi",
							modal_colorpicker3:					"Araç İpucu Rengi",
							modal_colorpicker4:					"Yazı rengi",
							modal_guildacronym:					"Yerel Sunucu Kısaltması",
							modal_guildbanner:					"Afiş",
							modal_guildicon:					"Simge",
							modal_guildname:					"Yerel Sunucu Adı",
							modal_header:						"Yerel Sunucu Ayarları",
							modal_ignorecustomname:				"Sunucu Kısaltması için orijinal Sunucu Adını kullanın",
							modal_invalidurl:					"Geçersiz URL",
							modal_tabheader1:					"Sunucu",
							modal_tabheader2:					"Simge Rengi",
							modal_tabheader3:					"Araç İpucu Rengi",
							submenu_resetsettings:				"Sunucuyu Sıfırla",
							submenu_serversettings:				"Ayarları değiştir"
						};
					case "uk":		// Ukrainian
						return {
							confirm_reset:						"Справді скинути цей сервер?",
							confirm_resetall:					"Ви впевнені, що хочете скинути всі сервери?",
							context_localserversettings:		"Налаштування локального сервера",
							modal_colorpicker1:					"Значок Колір",
							modal_colorpicker2:					"Колір шрифту",
							modal_colorpicker3:					"Колір підказки",
							modal_colorpicker4:					"Колір шрифту",
							modal_guildacronym:					"Акронім локального сервера",
							modal_guildbanner:					"Банер",
							modal_guildicon:					"Піктограма",
							modal_guildname:					"Назва локального сервера",
							modal_header:						"Налаштування локального сервера",
							modal_ignorecustomname:				"Використовуйте оригінальне ім’я сервера для абревіатури сервера",
							modal_invalidurl:					"Недійсна URL-адреса",
							modal_tabheader1:					"Сервер",
							modal_tabheader2:					"Значок Колір",
							modal_tabheader3:					"Колір підказки",
							submenu_resetsettings:				"Скинути сервер",
							submenu_serversettings:				"Змінити налаштування"
						};
					case "vi":		// Vietnamese
						return {
							confirm_reset:						"Bạn có chắc chắn muốn đặt lại Máy chủ này không?",
							confirm_resetall:					"Bạn có chắc chắn muốn đặt lại tất cả Máy chủ không?",
							context_localserversettings:		"Cài đặt máy chủ cục bộ",
							modal_colorpicker1:					"Màu biểu tượng",
							modal_colorpicker2:					"Màu phông chữ",
							modal_colorpicker3:					"Màu chú giải công cụ",
							modal_colorpicker4:					"Màu phông chữ",
							modal_guildacronym:					"Từ viết tắt của máy chủ cục bộ",
							modal_guildbanner:					"Ảnh bìa",
							modal_guildicon:					"Biểu tượng",
							modal_guildname:					"Tên máy chủ cục bộ",
							modal_header:						"Cài đặt máy chủ cục bộ",
							modal_ignorecustomname:				"Sử dụng tên máy chủ ban đầu cho từ viết tắt máy chủ",
							modal_invalidurl:					"URL không hợp lệ",
							modal_tabheader1:					"Người phục vụ",
							modal_tabheader2:					"Màu biểu tượng",
							modal_tabheader3:					"Màu chú giải công cụ",
							submenu_resetsettings:				"Đặt lại máy chủ",
							submenu_serversettings:				"Thay đổi cài đặt"
						};
					case "zh-CN":	// Chinese (China)
						return {
							confirm_reset:						"您确定要重置此服务器吗？",
							confirm_resetall:					"您确定要重置所有服务器吗？",
							context_localserversettings:		"本地服务器设置",
							modal_colorpicker1:					"图标颜色",
							modal_colorpicker2:					"字体颜色",
							modal_colorpicker3:					"工具提示颜色",
							modal_colorpicker4:					"字体颜色",
							modal_guildacronym:					"本地服务器缩写",
							modal_guildbanner:					"旗帜",
							modal_guildicon:					"图标",
							modal_guildname:					"本地服务器名称",
							modal_header:						"本地服务器设置",
							modal_ignorecustomname:				"使用原始服务器名称作为服务器首字母缩写词",
							modal_invalidurl:					"无效的网址",
							modal_tabheader1:					"服务器",
							modal_tabheader2:					"图标颜色",
							modal_tabheader3:					"工具提示颜色",
							submenu_resetsettings:				"重置服务器",
							submenu_serversettings:				"更改设置"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							confirm_reset:						"您確定要重置此服務器嗎？",
							confirm_resetall:					"您確定要重置所有服務器嗎？",
							context_localserversettings:		"本地服務器設置",
							modal_colorpicker1:					"圖標顏色",
							modal_colorpicker2:					"字體顏色",
							modal_colorpicker3:					"工具提示顏色",
							modal_colorpicker4:					"字體顏色",
							modal_guildacronym:					"本地服務器縮​​寫",
							modal_guildbanner:					"旗幟",
							modal_guildicon:					"圖標",
							modal_guildname:					"本地服務器名稱",
							modal_header:						"本地服務器設置",
							modal_ignorecustomname:				"使用原始服務器名稱作為服務器首字母縮寫詞",
							modal_invalidurl:					"無效的網址",
							modal_tabheader1:					"服務器",
							modal_tabheader2:					"圖標顏色",
							modal_tabheader3:					"工具提示顏色",
							submenu_resetsettings:				"重置服務器",
							submenu_serversettings:				"更改設置"
						};
					default:		// English
						return {
							confirm_reset:						"Are you sure you want to reset this Server?",
							confirm_resetall:					"Are you sure you want to reset all Servers?",
							context_localserversettings:		"Local Server Settings",
							modal_colorpicker1:					"Icon Color",
							modal_colorpicker2:					"Font Color",
							modal_colorpicker3:					"Tooltip Color",
							modal_colorpicker4:					"Font Color",
							modal_guildacronym:					"Local Server Acronym",
							modal_guildbanner:					"Banner",
							modal_guildicon:					"Icon",
							modal_guildname:					"Local Server Name",
							modal_header:						"Local Server Settings",
							modal_ignorecustomname:				"Use the original Server Name for the Server Acronym",
							modal_invalidurl:					"Invalid URL",
							modal_tabheader1:					"Server",
							modal_tabheader2:					"Icon Color",
							modal_tabheader3:					"Tooltip Color",
							submenu_resetsettings:				"Reset Server",
							submenu_serversettings:				"Change Settings"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
