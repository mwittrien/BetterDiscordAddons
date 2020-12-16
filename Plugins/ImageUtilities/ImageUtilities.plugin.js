/**
 * @name ImageUtilities
 * @authorId 278543574059057154
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ImageUtilities
 * @source https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ImageUtilities/ImageUtilities.plugin.js
 * @updateUrl https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ImageUtilities/ImageUtilities.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ImageUtilities",
			"author": "DevilBro",
			"version": "4.2.3",
			"description": "Add a handful of options for images/emotes/avatars (direct download, reverse image search, zoom, copy image link, copy image to clipboard, gallery mode)"
		},
		"changeLog": {
			"improved": {
				"Download locations": "Merged 'save' and 'save as' entry, clicking it opens the save as modal, and hovering over it opens a submenu for preset paths, you can add your own download locations in the plugin settings",
				"Toggle": "You can now toggle the download locations"
			},
			"fixed": {
				"Slow modal transitions": "Fixed issue where the css of the plugin would cause render slow downds for modals"
			}
		}
	};
	
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
		load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start() {this.load();}
		stop() {}
		getSettingsPanel() {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The library plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", _ => {
				require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
					if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
					else BdApi.alert("Error", "Could not download BDFDB library plugin, try again some time later.");
				});
			});
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		const imgUrlReplaceString = "DEVILBRO_BD_REVERSEIMAGESEARCH_REPLACE_IMAGEURL";
		var firedEvents = [], clickedImage;
		var settings = {}, amounts = {}, zoomSettings = {}, engines = {}, enabledEngines = {}, ownLocations = {}, downloadsFolder;
		
		const ImageDetails = class ImageDetails extends BdApi.React.Component {
			componentDidMount() {
				this.props.attachment = BDFDB.ReactUtils.findValue(BDFDB.ObjectUtils.get(this, `${BDFDB.ReactUtils.instanceKey}.return`), "attachment", {up: true});
				BDFDB.ReactUtils.forceUpdate(this);
			}
			componentDidUpdate() {
				if ((!this.props.attachment || !this.props.attachment.size) && !this.props.loaded) {
					this.props.loaded = true;
					this.props.attachment = BDFDB.ReactUtils.findValue(BDFDB.ObjectUtils.get(this, `${BDFDB.ReactUtils.instanceKey}.return`), "attachment", {up: true});
					BDFDB.ReactUtils.forceUpdate(this);
				}
			}
			render() {
				return !this.props.attachment ? null : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
					className: BDFDB.disCN._imageutilitiesimagedetails,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
								title: this.props.original,
								href: this.props.original,
								children: this.props.attachment.filename,
								onClick: event => {
									BDFDB.ListenerUtils.stopEvent(event);
									BDFDB.DiscordUtils.openLink(this.props.original);
								}
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
								children: BDFDB.NumberUtils.formatBytes(this.props.attachment.size)
							})
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
								children: `${this.props.attachment.width}x${this.props.attachment.height}px`
							})
						})
					]
				});
			}
		};
		
		return class ImageUtilities extends Plugin {
			onLoad() {
				firedEvents = [];
				clickedImage = null;
					
				this.defaults = {
					settings: {
						resizeImage: 			{value: true,	inner: false,		description: "Always resize image to fit the whole image modal"},
						addDetails: 			{value: true,	inner: false,		description: "Add image details (name, size, amount) in the image modal"},
						showAsHeader:			{value: true, 	inner: false,		description: "Show image details as a details header above the image in the chat"},
						showOnHover:			{value: false, 	inner: false,		description: "Show image details as Tooltip in the chat"},
						enableGallery: 			{value: true,	inner: false,		description: "Display previous/next Images in the same message in the image modal"},
						enableZoom: 			{value: true,	inner: false,		description: "Create a zoom lens if you press down on an image in the image modal"},
						enableCopyImg: 			{value: true,	inner: false,		description: "Add a copy image option in the image modal"},
						enableSaveImg: 			{value: true,	inner: false,		description: "Add a save image as option in the image modal"},
						useChromium: 			{value: false, 	inner: false,		description: "Use an inbuilt browser window instead of opening your default browser"},
						addUserAvatarEntry: 	{value: true, 	inner: true,		description: "User Avatars"},
						addGuildIconEntry: 		{value: true, 	inner: true,		description: "Server Icons"},
						addEmojiEntry: 			{value: true, 	inner: true,		description: "Custom Emojis/Emotes"}
					},
					amounts: {
						hoverDelay:				{value: 0, 		min: 0,				description: "Image Tooltip delay (in millisec)"}
					},
					zoomSettings: {
						zoomlevel:				{value: 2,		digits: 1,			minValue: 1,	maxValue: 20,		unit: "x",	label: "ACCESSIBILITY_ZOOM_LEVEL_LABEL"},
						lensesize:				{value: 200,	digits: 0,			minValue: 50, 	maxValue: 5000,		unit: "px",	label: "context_lenssize_text"}
					},
					engines: {
						_all: 		{value: true, 	name: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL, 	url: null},
						Baidu: 		{value: true, 	name: "Baidu", 		url: "http://image.baidu.com/pcdutu?queryImageUrl=" + imgUrlReplaceString},
						Bing: 		{value: true, 	name: "Bing", 		url: "https://www.bing.com/images/search?q=imgurl: " + imgUrlReplaceString + "&view=detailv2&iss=sbi&FORM=IRSBIQ"},
						Google:		{value: true, 	name: "Google", 	url: "https://images.google.com/searchbyimage?image_url=" + imgUrlReplaceString},
						IQDB:		{value: true, 	name: "IQDB", 		url: "https://iqdb.org/?url=" + imgUrlReplaceString},
						Reddit: 	{value: true, 	name: "Reddit", 	url: "http://karmadecay.com/search?q=" + imgUrlReplaceString},
						SauceNAO: 	{value: true, 	name: "SauceNAO", 	url: "https://saucenao.com/search.php?db=999&url=" + imgUrlReplaceString},
						Sogou: 		{value: true, 	name: "Sogou", 		url: "http://pic.sogou.com/ris?flag=1&drag=0&query=" + imgUrlReplaceString + "&flag=1"},
						TinEye:		{value: true, 	name: "TinEye", 	url: "https://tineye.com/search?url=" + imgUrlReplaceString},
						WhatAnime:	{value: true,	name: "WhatAnime",	url: "https://trace.moe/?url=" + imgUrlReplaceString},
						Yandex: 	{value: true, 	name: "Yandex", 	url: "https://yandex.com/images/search?url=" + imgUrlReplaceString + "&rpt=imageview"}
					}
				};
			
				this.patchedModules = {
					before: {
						LazyImage: "render"
					},
					after: {
						ImageModal: ["render", "componentDidMount"],
						LazyImage: ["render", "componentDidMount"]
					}
				};
				
				this.css = `
					${BDFDB.dotCN._imageutilitiesimagedetails} {
						margin: 5px 0;
					}
					${BDFDB.dotCNS.spoilerhidden + BDFDB.dotCN._imageutilitiesimagedetails} {
						visibility: hidden;
						max-width: 1px;
					}
					${BDFDB.dotCN._imageutilitiesgallery},
					${BDFDB.dotCN._imageutilitiesdetailsadded} {
						transform: unset !important;
					}
					${BDFDB.dotCN._imageutilitiessibling} {
						display: flex;
						align-items: center;
						position: fixed;
						top: 50%;
						bottom: 50%;
						cursor: pointer;
					}
					${BDFDB.dotCN._imageutilitiesprevious} {
						justify-content: flex-end;
						right: 90%;
					} 
					${BDFDB.dotCN._imageutilitiesnext} {
						justify-content: flex-start;
						left: 90%;
					}
					${BDFDB.dotCN._imageutilitiesswitchicon} {
						position: absolute;
						background: rgba(0, 0, 0, 0.3);
						border-radius: 50%;
						padding: 15px;
						transition: all 0.3s ease;
					}
					${BDFDB.dotCNS._imageutilitiesprevious + BDFDB.dotCN._imageutilitiesswitchicon} {
						right: 10px;
					} 
					${BDFDB.dotCNS._imageutilitiesnext + BDFDB.dotCN._imageutilitiesswitchicon} {
						left: 10px;
					}
					${BDFDB.dotCN._imageutilitiessibling}:hover ${BDFDB.dotCN._imageutilitiesswitchicon} {
						background: rgba(0, 0, 0, 0.5);
					}
					${BDFDB.dotCN._imageutilitiesdetailswrapper} {
						position: fixed;
						bottom: 10px;
						left: 15px;
						right: 15px;
						pointer-events: none;
					}
					${BDFDB.dotCN._imageutilitiesdetails} {
						color: #dcddde;
						margin-top: 5px;
						font-size: 14px;
						font-weight: 500;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
					${BDFDB.dotCN._imageutilitiesdetailslabel} {
						font-weight: 600;
					}
					${BDFDB.dotCN._imageutilitieslense} {
						border: 2px solid rgb(114, 137, 218);
					}
					${BDFDB.dotCN._imageutilitiesoperations} {
						position: absolute;
						display: flex;
					}
					${BDFDB.dotCNS._imageutilitiesoperations + BDFDB.dotCN.downloadlink} {
						position: relative !important;
						white-space: nowrap !important;
					}
					${BDFDB.dotCNS._imageutilitiesoperations + BDFDB.dotCN.anchor + BDFDB.dotCN.downloadlink} {
						margin: 0 !important;
					}
				`;
			}
			
			onStart() {
				// REMOVE 16.12.2020
				let oL = BDFDB.DataUtils.load(this, "ownLocations"), c = false;
				for (let i in oL) if (!BDFDB.ObjectUtils.is(oL[i])) {
					oL[i] = {enabled: true, location: oL[i]};
					c = true;
				}
				if (c) BDFDB.DataUtils.save(oL, this, "ownLocations")
				
				BDFDB.ListenerUtils.add(this, document.body, "click", BDFDB.dotCNS.message + BDFDB.dotCNS.imagewrapper + "img", e => {
					clickedImage = e.target;
					BDFDB.TimeUtils.timeout(_ => {clickedImage = null;});
				});
				
				BDFDB.PatchUtils.patch(this, (BDFDB.ModuleUtils.findByName("renderImageComponent", false).exports || {}), "renderImageComponent", {after: e => {
					if (e.returnValue && e.returnValue.type && (e.returnValue.type.displayName == "LazyImageZoomable" || e.returnValue.type.displayName == "LazyImage") && e.methodArguments[0].original && e.methodArguments[0].src.indexOf("https://media.discordapp.net/attachments") == 0 && (e.methodArguments[0].className || "").indexOf(BDFDB.disCN.embedthumbnail) == -1) return this.injectImageDetails(e.methodArguments[0], e.returnValue);
				}});

				this.forceUpdateAll();
			}
			
			onStop() {
				this.cleanupListeners("Gallery");
				this.cleanupListeners("Zoom");

				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Settings",
							collapseStates: collapseStates,
							children: Object.keys(settings).map(key => !this.defaults.settings[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["settings", key],
								label: this.defaults.settings[key].description,
								value: settings[key]
							})).concat(Object.keys(amounts).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "TextInput",
								plugin: this,
								keys: ["amounts", key],
								label: this.defaults.amounts[key].description,
								basis: "50%",
								childProps: {type: "number"},
								min: this.defaults.amounts[key].min,
								max: this.defaults.amounts[key].max,
								value: amounts[key]
							}))).filter(n => n)
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Download Locations",
							collapseStates: collapseStates,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
									className: BDFDB.disCN.marginbottom4,
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H3,
									children: "Add additional Download Locations: "
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									className: BDFDB.disCN.marginbottom8,
									align: BDFDB.LibraryComponents.Flex.Align.END,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
												title: "Name:",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													className: "input-newlocation input-name",
													value: "",
													placeholder: "Name"
												})
											})
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
												title: "Location:",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													className: "input-newlocation input-location",
													value: "",
													placeholder: "Location"
												})
											})
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											style: {marginBottom: 1},
											onClick: _ => {
												for (let input of settingsPanel.props._node.querySelectorAll(".input-newlocation " + BDFDB.dotCN.input)) if (!input.value || input.value.length == 0 || input.value.trim().length == 0) return BDFDB.NotificationUtils.toast("Fill out all fields to add a new location.", {type: "danger"});
												let name = settingsPanel.props._node.querySelector(".input-name " + BDFDB.dotCN.input).value.trim();
												let location = settingsPanel.props._node.querySelector(".input-location " + BDFDB.dotCN.input).value.trim();
												if (ownLocations[name] || name == "Downloads") return BDFDB.NotificationUtils.toast("A location with the choosen name already exists, please choose another name", {type: "danger"});
												else if (!BDFDB.LibraryRequires.fs.existsSync(location)) return BDFDB.NotificationUtils.toast("The choosen download location is not a valid path to a folder", {type: "danger"});
												else {
													ownLocations[name] = location;
													BDFDB.DataUtils.save(ownLocations, this, "ownLocations");
													BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel, collapseStates);
												}
											},
											children: BDFDB.LanguageUtils.LanguageStrings.ADD
										})
									]
								})
							].concat(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
								title: "Your own Download Locations:",
								dividerTop: true,
								children: Object.keys(ownLocations).map(name => {
									let editable = name != "Downloads";
									return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Card, {
										horizontal: true,
										children: [
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												grow: 0,
												basis: "180px",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													value: name,
													placeholder: name,
													size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
													maxLength: 100000000000000000000,
													style: {marginRight: 6},
													disabled: !editable,
													onChange: !editable ? null : value => {
														ownLocations[value] = ownLocations[name];
														delete ownLocations[name];
														BDFDB.DataUtils.save(ownLocations, this, "ownLocations");
													}
												})
											}),
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													value: ownLocations[name].location,
													placeholder: ownLocations[name].location,
													size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
													maxLength: 100000000000000000000,
													style: {marginRight: 10},
													disabled: !editable,
													onChange: !editable ? null : value => {
														ownLocations[name].location = value;
														BDFDB.DataUtils.save(ownLocations, this, "ownLocations");
													}
												})
											}),
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Switch, {
													value: ownLocations[name].enabled,
													size: BDFDB.LibraryComponents.Switch.Sizes.MINI,
													onChange: value => {
														ownLocations[name].enabled = value;
														BDFDB.DataUtils.save(ownLocations, this, "ownLocations");
													}
												})
											})
										],
										noRemove: !editable,
										onRemove: !editable ? null : _ => {
											delete ownLocations[name];
											BDFDB.DataUtils.save(ownLocations, this, "ownLocations");
											BDFDB.PluginUtils.refreshSettingsPanel(this, settingsPanel);
										}
									});
								})
							})).filter(n => n)
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Context Menu Entries",
							collapseStates: collapseStates,
							children: [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormTitle, {
								className: BDFDB.disCN.marginbottom4,
								tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H3,
								children: "Add additional Context Menu Entry for: "
							})].concat(Object.keys(settings).map(key => this.defaults.settings[key].inner && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["settings", key],
								label: this.defaults.settings[key].description,
								value: settings[key]
							})))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Search Engines",
							collapseStates: collapseStates,
							children: Object.keys(engines).filter(n => n && n != "_all").map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["engines", key],
								label: this.defaults.engines[key].name,
								value: engines[key]
							}))
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
				settings = BDFDB.DataUtils.get(this, "settings");
				amounts = BDFDB.DataUtils.get(this, "amounts");
				zoomSettings = BDFDB.DataUtils.get(this, "zoomSettings");
				engines = BDFDB.DataUtils.get(this, "engines");
				enabledEngines = BDFDB.ObjectUtils.filter(engines, n => n);
				ownLocations = Object.assign({"Downloads": {enabled:true, location: this.getDownloadLocation()}}, BDFDB.DataUtils.load(this, "ownLocations"));
				
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			onGuildContextMenu (e) {
				if (e.instance.props.guild && settings.addGuildIconEntry) {
					let banner = BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildheader, e.instance.props.target) || BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildchannels, e.instance.props.target) && !e.instance.props.target.className && e.instance.props.target.parentElement.firstElementChild == e.instance.props.target;
					if (banner) {
						if (e.instance.props.guild.banner) this.injectItem(e, BDFDB.LibraryModules.IconUtils.getGuildBannerURL(e.instance.props.guild));
					}
					else if (e.type != "GuildChannelListContextMenu") this.injectItem(e, e.instance.props.guild.getIconURL("png"), BDFDB.LibraryModules.IconUtils.hasAnimatedGuildIcon(e.instance.props.guild) && e.instance.props.guild.getIconURL("gif"));
				}
			}

			onUserContextMenu (e) {
				if (e.instance.props.user && settings.addUserAvatarEntry) this.injectItem(e, e.instance.props.user.getAvatarURL("png"), BDFDB.LibraryModules.IconUtils.hasAnimatedAvatar(e.instance.props.user) && e.instance.props.user.getAvatarURL("gif"))
			}

			onNativeContextMenu (e) {
				if (e.type == "NativeImageContextMenu" && (e.instance.props.href || e.instance.props.src)) {
					this.injectItem(e, e.instance.props.href || e.instance.props.src);
				}
			}

			onMessageContextMenu (e) {
				if (e.instance.props.message && e.instance.props.channel && e.instance.props.target) {
					if (e.instance.props.attachment) this.injectItem(e, e.instance.props.attachment.url);
					else if (e.instance.props.target.tagName == "A" && e.instance.props.message.embeds && e.instance.props.message.embeds[0] && e.instance.props.message.embeds[0].type == "image") this.injectItem(e, e.instance.props.target.href);
					else if (e.instance.props.target.tagName == "IMG") {
						if (BDFDB.DOMUtils.containsClass(e.instance.props.target.parentElement, BDFDB.disCN.imagewrapper)) this.injectItem(e, e.instance.props.target.src);
						else if (BDFDB.DOMUtils.containsClass(e.instance.props.target, BDFDB.disCN.embedauthoricon) && settings.addUserAvatarEntry) this.injectItem(e, e.instance.props.target.src);
						else if (BDFDB.DOMUtils.containsClass(e.instance.props.target, BDFDB.disCN.emojiold, "emote", false) && settings.addEmojiEntry) this.injectItem(e, e.instance.props.target.src);
					}
					else {
						let reaction = BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagereaction, e.instance.props.target);
						if (reaction && settings.addEmojiEntry) this.injectItem(e, reaction.querySelector(BDFDB.dotCN.emojiold).src);
					}
				}
			}

			injectItem (e, ...urls) {
				let types = [];
				let validUrls = urls.filter(n => this.isValidImg(n)).map(n => {
					let url = n.replace(/^url\(|\)$|"|'/g, "").replace(/\?size\=\d+$/, "?size=4096").replace(/[\?\&](height|width)=\d+/g, "");
					if (url.indexOf("https://images-ext-1.discordapp.net/external/") > -1) {
						if (url.split("/https/").length > 1) url = "https://" + url.split("/https/").pop();
						else if (url.split("/http/").length > 1) url = "http://" + url.split("/http/").pop();
					}
					const file = url && (BDFDB.LibraryModules.URLParser.parse(url).pathname || "").toLowerCase();
					const type = file && file.split(".").pop();
					return url && type && !types.includes(type) && types.push(type) && {url, type};
				}).filter(n => n);
				if (!validUrls.length) return;
				let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
				children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: "Image Utilities",
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "main-subitem"),
						children: validUrls.length == 1 ? this.createUrlMenu(e, validUrls[0].url) : validUrls.map((urlData, i) => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: urlData.type.toUpperCase(),
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "subitem", i),
							children: this.createUrlMenu(e, urlData.url)
						}))
					})
				}));
			}
			
			createUrlMenu (e, url) {
				let enginesWithoutAll = BDFDB.ObjectUtils.filter(enabledEngines, n => n != "_all", true);
				let engineKeys = Object.keys(enginesWithoutAll);
				let locations = Object.keys(ownLocations).filter(n => ownLocations[n].enabled);
				return [
					BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.context_viewimage_text,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "view-image"),
						action: _ => {
							let img = new Image();
							img.onload = function() {
								BDFDB.LibraryModules.ModalUtils.openModal(modalData => {
									return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalRoot, Object.assign({
										className: BDFDB.disCN.imagemodal
									}, modalData, {
										size: BDFDB.LibraryComponents.ModalComponents.ModalSize.DYNAMIC,
										"aria-label": BDFDB.LanguageUtils.LanguageStrings.IMAGE,
										children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ImageModal, {
											src: url,
											original: url,
											width: this.width,
											height: this.height,
											className: BDFDB.disCN.imagemodalimage,
											shouldAnimate: true,
											renderLinkComponent: props => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, props)
										})
									}), true);
								});
							};
							img.src = url;
						}
					}),
					BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.context_saveimageas_text,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "download-image-as"),
						action: _ => {
							this.downloadImageAs(url);
						},
						children: locations.length && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
							children: locations.map((name, i) => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "download", name, i),
								label: name,
								action: _ => {
									this.downloadImage(url, ownLocations[name].location);
								}
							}))
						})
					}),
					!this.isCopyable(url) ? null : BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.context_copyimage_text,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-image"),
						action: _ => {
							this.copyImage(url);
						}
					}),
					BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.context_copyimagelink_text,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-src"),
						action: _ => {
							BDFDB.LibraryRequires.electron.clipboard.write({text: url});
							BDFDB.NotificationUtils.toast(this.labels.toast_copyimagelink_success, {type: "success"});
						}
					}),
					!this.isSearchable(url) ? null : engineKeys.length == 1 ? BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.context_reverseimagesearch_text.replace("...", this.defaults.engines[engineKeys[0]].name),
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "single-search"),
						persisting: true,
						action: event => {
							if (!event.shiftKey) BDFDB.ContextMenuUtils.close(e.instance);
							BDFDB.DiscordUtils.openLink(this.defaults.engines[engineKeys[0]].url.replace(imgUrlReplaceString, encodeURIComponent(url)), settings.useChromium, event.shiftKey);
						}
					}) : BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.context_reverseimagesearch_text,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "submenu-search"),
						children: !engineKeys.length ? BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.submenu_disabled_text,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "disabled"),
							disabled: true
						}) : Object.keys(enabledEngines).map(key => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.defaults.engines[key].name,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "search", key),
							color: key == "_all" ? BDFDB.LibraryComponents.MenuItems.Colors.DANGER : BDFDB.LibraryComponents.MenuItems.Colors.DEFAULT,
							persisting: true,
							action: event => {
								if (!event.shiftKey) BDFDB.ContextMenuUtils.close(e.instance);
								if (key == "_all") {
									for (let key2 in enginesWithoutAll) BDFDB.DiscordUtils.openLink(this.defaults.engines[key2].url.replace(imgUrlReplaceString, encodeURIComponent(url)), settings.useChromium, event.shiftKey);
								}
								else BDFDB.DiscordUtils.openLink(this.defaults.engines[key].url.replace(imgUrlReplaceString, encodeURIComponent(url)), settings.useChromium, event.shiftKey);
							}
						}))
					})
				].filter(n => n);
			}

			processImageModal (e) {
				if (clickedImage) e.instance.props.cachedImage = clickedImage;
				let url = e.instance.props.cachedImage && e.instance.props.cachedImage.src ? e.instance.props.cachedImage : e.instance.props.src;
				url = url.src || url;
				let messages = this.getMessageGroupOfImage(url);
				if (e.returnvalue) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.downloadlink]]});
					if (index > -1) {
						children[index].props.onClick = event => {
							return event.shiftKey;
						};
						let openContext = event => {
							BDFDB.ContextMenuUtils.open(this, event, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
								children: Object.keys(zoomSettings).map(type => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuSliderItem, Object.assign({
									id: BDFDB.ContextMenuUtils.createItemId(this.name, type),
									value: zoomSettings[type],
									renderLabel: value => {
										return (this.labels[this.defaults.zoomSettings[type].label] || BDFDB.LanguageUtils.LanguageStrings[this.defaults.zoomSettings[type].label]) + ": " + value + this.defaults.zoomSettings[type].unit;
									},
									onValueRender: value => {
										return value + this.defaults.zoomSettings[type].unit;
									},
									onValueChange: value => {
										zoomSettings[type] = value;
										BDFDB.DataUtils.save(zoomSettings, this, "zoomSettings");
									}
								}, BDFDB.ObjectUtils.extract(this.defaults.zoomSettings[type], "digits", "minValue", "maxValue"))))
							}));
						};
						let isVideo = (typeof e.instance.props.children == "function" && e.instance.props.children(Object.assign({}, e.instance.props, {size: e.instance.props})) || {type: {}}).type.displayName == "Video";
						children[index] = BDFDB.ReactUtils.createElement("span", {
							className: BDFDB.disCN._imageutilitiesoperations,
							children: [
								children[index],
								settings.enableSaveImg && !isVideo && [
									BDFDB.ReactUtils.createElement("span", {
										className: BDFDB.disCN.downloadlink,
										children: "|",
										style: {margin: "0 5px"}
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
										className: BDFDB.disCN.downloadlink, 
										children: this.labels.context_saveimageas_text,
										onClick: event => {
											BDFDB.ListenerUtils.stopEvent(event);
											this.downloadImageAs(url);
										},
										onContextMenu: event => {
											let locations = Object.keys(ownLocations).filter(n => ownLocations[n].enabled);
											if (locations.length) BDFDB.ContextMenuUtils.open(this, event, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
												children: Object.keys(locations).map((name, i) => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
													id: BDFDB.ContextMenuUtils.createItemId(this.name, "download", name, i),
													label: name,
													action: _ => {
														this.downloadImage(url, ownLocations[name].location);
													}
												}))
											}));
										}
									})
								],
								settings.enableCopyImg && this.isCopyable(url) && !isVideo && [
									BDFDB.ReactUtils.createElement("span", {
										className: BDFDB.disCN.downloadlink,
										children: "|",
										style: {margin: "0 5px"}
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
										className: BDFDB.disCN.downloadlink, 
										children: this.labels.context_copyimage_text,
										onClick: event => {
											BDFDB.ListenerUtils.stopEvent(event);
											this.copyImage(url);
										}
									})
								],
								settings.enableZoom && !isVideo && [
									BDFDB.ReactUtils.createElement("span", {
										className: BDFDB.disCN.downloadlink,
										children: "|",
										style: {margin: "0 5px"}
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
										className: BDFDB.disCN.downloadlink, 
										children: `Zoom ${BDFDB.LanguageUtils.LanguageStrings.SETTINGS}`,
										onClick: openContext,
										onContextMenu: openContext
									})
								]
							].flat(10).filter(n => n)
						});
					}
					let imageIndex = 0, amount = 1;
					if (messages.length) {
						let data = this.getSiblingsAndPosition(url, messages);
						imageIndex = data.index;
						amount = data.amount;
						if (data.previous) {
							if (e.instance.previousRef) e.returnvalue.props.children.push(this.createImageWrapper(e.instance, e.instance.previousRef, "previous", BDFDB.LibraryComponents.SvgIcon.Names.LEFT_CARET));
							else this.loadImage(e.instance, data.previous, "previous");
						}
						if (data.next) {
							if (e.instance.nextRef) e.returnvalue.props.children.splice(1, 0, this.createImageWrapper(e.instance, e.instance.nextRef, "next", BDFDB.LibraryComponents.SvgIcon.Names.RIGHT_CARET));
							else this.loadImage(e.instance, data.next, "next");
						}
					}
					if (settings.addDetails) e.returnvalue.props.children.push(BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._imageutilitiesdetailswrapper,
						children: [
							{label: "Source", text: e.instance.props.src},
							{label: "Size", text: `${e.instance.props.width} x ${e.instance.props.height}px`},
							{label: "Image", text: `${imageIndex + 1} of ${amount}`}
						].map(data => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
							className: BDFDB.disCN._imageutilitiesdetails,
							children: [
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN._imageutilitiesdetailslabel,
									children: data.label + ":"
								}),
								data.text
							]
						}))
					}));
				}
				if (e.node) {
					let modal = BDFDB.DOMUtils.getParent(BDFDB.dotCNC.modal + BDFDB.dotCN.layermodal, e.node);
					if (modal) {
						modal.className = BDFDB.DOMUtils.formatClassName(modal.className, messages.length && BDFDB.disCN._imageutilitiesgallery, settings.addDetails && BDFDB.disCN._imageutilitiesdetailsadded);
						this.cleanupListeners("Gallery");
						if (messages.length) {
							document.keydownImageUtilitiesGalleryListener = event => {
								if (!document.contains(e.node)) this.cleanupListeners("Gallery");
								else if (!firedEvents.includes("Gallery")) {
									firedEvents.push("Gallery");
									if (event.keyCode == 37) this.switchImages(e.instance, "previous");
									else if (event.keyCode == 39) this.switchImages(e.instance, "next");
								}
							};
							document.keyupImageUtilitiesGalleryListener = _ => {
								BDFDB.ArrayUtils.remove(firedEvents, "Gallery", true);
								if (!document.contains(e.node)) this.cleanupListeners("Gallery");
							};
							document.addEventListener("keydown", document.keydownImageUtilitiesGalleryListener);
							document.addEventListener("keyup", document.keyupImageUtilitiesGalleryListener);
						}
					}
				}
			}

			processLazyImage (e) {
				if (e.node) {
					if (e.instance.props.resized) e.instance.state.readyState = BDFDB.LibraryComponents.Image.ImageReadyStates.READY;
					if (settings.enableZoom && !e.node.querySelector("video") && !BDFDB.DOMUtils.containsClass(e.node.parentElement, BDFDB.disCN._imageutilitiessibling) && BDFDB.DOMUtils.getParent(BDFDB.dotCN.imagemodal, e.node)) {
						e.node.addEventListener("mousedown", event => {
							if (event.which != 1) return;
							BDFDB.ListenerUtils.stopEvent(event);

							let imgRects = BDFDB.DOMUtils.getRects(e.node.firstElementChild);

							let lens = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN._imageutilitieslense}" style="border-radius: 50% !important; pointer-events: none !important; z-index: 10000 !important; width: ${zoomSettings.lensesize}px !important; height: ${zoomSettings.lensesize}px !important; position: fixed !important;"><div style="position: absolute !important; top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important;"><${e.node.firstElementChild.tagName} src="${e.instance.props.src}" style="width: ${imgRects.width * zoomSettings.zoomlevel}px; height: ${imgRects.height * zoomSettings.zoomlevel}px; position: fixed !important;"${e.node.firstElementChild.tagName == "VIDEO" ? " loop autoplay" : ""}></${e.node.firstElementChild.tagName}></div></div>`);
							let pane = lens.firstElementChild.firstElementChild;
							let backdrop = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN._imageutilitieslensebackdrop}" style="background: rgba(0, 0, 0, 0.3) !important; position: absolute !important; top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important; pointer-events: none !important; z-index: 8000 !important;"></div>`);
							let appMount = document.querySelector(BDFDB.dotCN.appmount);
							appMount.appendChild(lens);
							appMount.appendChild(backdrop);

							let lensRects = BDFDB.DOMUtils.getRects(lens);
							
							let halfW = lensRects.width / 2, halfH = lensRects.height / 2;
							let minX = imgRects.left, maxX = minX + imgRects.width;
							let minY = imgRects.top, maxY = minY + imgRects.height;
							
							lens.update = _ => {
								let x = event.clientX > maxX ? maxX - halfW : event.clientX < minX ? minX - halfW : event.clientX - halfW;
								let y = event.clientY > maxY ? maxY - halfH : event.clientY < minY ? minY - halfH : event.clientY - halfH;
								lens.style.setProperty("left", x + "px", "important");
								lens.style.setProperty("top", y + "px", "important");
								lens.style.setProperty("width", zoomSettings.lensesize + "px", "important");
								lens.style.setProperty("height", zoomSettings.lensesize + "px", "important");
								lens.style.setProperty("clip-path", `circle(${(zoomSettings.lensesize/2) + 2}px at center)`, "important");
								lens.firstElementChild.style.setProperty("clip-path", `circle(${zoomSettings.lensesize/2}px at center)`, "important");
								pane.style.setProperty("left", imgRects.left + ((zoomSettings.zoomlevel - 1) * (imgRects.left - x - halfW)) + "px", "important");
								pane.style.setProperty("top", imgRects.top + ((zoomSettings.zoomlevel - 1) * (imgRects.top - y - halfH)) + "px", "important");
								pane.style.setProperty("width", imgRects.width * zoomSettings.zoomlevel + "px", "important");
								pane.style.setProperty("height", imgRects.height * zoomSettings.zoomlevel + "px", "important");
							};
							lens.update();

							let dragging = event2 => {
								event = event2;
								lens.update();
							};
							let releasing = _ => {
								this.cleanupListeners("Zoom");
								document.removeEventListener("mousemove", dragging);
								document.removeEventListener("mouseup", releasing);
								if (document.removeImageUtilitiesZoomObserver) {
									document.removeImageUtilitiesZoomObserver.disconnect();
									delete document.removeImageUtilitiesZoomObserver;
								}
								BDFDB.DOMUtils.remove(lens, backdrop);
								BDFDB.DataUtils.save(zoomSettings, this, "zoomSettings");
							};
							document.addEventListener("mousemove", dragging);
							document.addEventListener("mouseup", releasing);
							
							this.cleanupListeners("Zoom");
							document.wheelImageUtilitiesZoomListener = event2 => {
								if (!document.contains(e.node)) this.cleanupListeners("Zoom");
								else {
									if (event2.deltaY < 0 && (zoomSettings.zoomlevel + 0.1) <= this.defaults.zoomSettings.zoomlevel.maxValue) {
										zoomSettings.zoomlevel += 0.1;
										lens.update();
									}
									else if (event2.deltaY > 0 && (zoomSettings.zoomlevel - 0.1) >= this.defaults.zoomSettings.zoomlevel.minValue) {
										zoomSettings.zoomlevel -= 0.1;
										lens.update();
									}
								}
							};
							document.keydownImageUtilitiesZoomListener = event2 => {
								if (!document.contains(e.node)) this.cleanupListeners("Zoom");
								else if (!firedEvents.includes("Zoom")) {
									firedEvents.push("Zoom");
									if (event2.keyCode == 187 && (zoomSettings.zoomlevel + 0.5) <= this.defaults.zoomSettings.zoomlevel.maxValue) {
										zoomSettings.zoomlevel += 0.5;
										lens.update();
									}
									else if (event2.keyCode == 189 && (zoomSettings.zoomlevel - 0.5) >= this.defaults.zoomSettings.zoomlevel.minValue) {
										zoomSettings.zoomlevel -= 0.5;
										lens.update();
									}
								}
							};
							document.keyupImageUtilitiesZoomListener = _ => {
								BDFDB.ArrayUtils.remove(firedEvents, "Zoom", true);
								if (!document.contains(e.node)) this.cleanupListeners("Zoom");
							};
							document.addEventListener("wheel", document.wheelImageUtilitiesZoomListener);
							document.addEventListener("keydown", document.keydownImageUtilitiesZoomListener);
							document.addEventListener("keyup", document.keyupImageUtilitiesZoomListener);
							
							document.removeImageUtilitiesZoomObserver = new MutationObserver(changes => changes.forEach(change => {
								let nodes = Array.from(change.removedNodes);
								if (nodes.indexOf(appMount) > -1 || nodes.some(n => n.contains(appMount)) || nodes.indexOf(e.node) > -1 || nodes.some(n => n.contains(e.node))) {
									releasing();
								}
							}));
							document.removeImageUtilitiesZoomObserver.observe(document.body, {subtree: true, childList: true});
						});
					}
				}
				else if (e.returnvalue) {
					if (settings.showOnHover && e.instance.props.original && e.instance.props.src.indexOf("https://media.discordapp.net/attachments") == 0 && typeof e.returnvalue.props.children == "function") {
						let attachment = BDFDB.ReactUtils.findValue(e.instance, "attachment", {up: true});
						if (attachment) {
							let renderChildren = e.returnvalue.props.children;
							e.returnvalue.props.children = (...args) => {
								return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
									text: `${attachment.filename}\n${BDFDB.NumberUtils.formatBytes(attachment.size)}\n${attachment.width}x${attachment.height}px`,
									tooltipConfig: {
										type: "right",
										delay: amounts.hoverDelay
									},
									children: renderChildren(...args)
								});
							};
						}
					}
				}
				else {
					if (settings.resizeImage && e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.imagemodalimage) > -1 && BDFDB.ReactUtils.findOwner(BDFDB.ObjectUtils.get(e, `instance.${BDFDB.ReactUtils.instanceKey}`), {name: "ImageModal", up: true})) {
						let data = settings.enableGallery ? this.getSiblingsAndPosition(e.instance.props.src, this.getMessageGroupOfImage(e.instance.props.src)) : {};
						let aRects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount));
						let ratio = Math.min((aRects.width * (data.previous || data.next ? 0.8 : 1) - 20) / e.instance.props.width, (aRects.height - (settings.addDetails ? 310 : 100)) / e.instance.props.height);
						let width = Math.round(ratio * e.instance.props.width);
						let height = Math.round(ratio * e.instance.props.height);
						e.instance.props.width = width;
						e.instance.props.maxWidth = width;
						e.instance.props.height = height;
						e.instance.props.maxHeight = height;
						e.instance.props.src = e.instance.props.src.replace(/width=\d+/, `width=${width}`).replace(/height=\d+/, `height=${height}`);
						e.instance.props.resized = true;
					}
				}
			}
			
			injectImageDetails (props, child) {
				if (settings.showAsHeader) {
					props.detailsAdded = true;
					return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.embedwrapper,
						children: [
							BDFDB.ReactUtils.createElement(ImageDetails, {
								original: props.original,
								attachment: {
									height: 0,
									width: 0,
									filename: "unknown.png"
								}
							}),
							child
						]
					});
				}
				return child;
			}
			
			isValidImg (url) {
				const file = url && (BDFDB.LibraryModules.URLParser.parse(url).pathname || "").toLowerCase();
				return file && (url.startsWith("https://images-ext-2.discordapp.net/") || file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".png") || file.endsWith(".gif") || file.endsWith(".apng") || file.endsWith(".webp") || file.endsWith(".svg"));
			}
			
			isCopyable (url) {
				const file = url && (BDFDB.LibraryModules.URLParser.parse(url).pathname || "").toLowerCase();
				return file && (url.startsWith("https://images-ext-2.discordapp.net/") || file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".png"));
			}
			
			isSearchable (url) {
				const file = url && (BDFDB.LibraryModules.URLParser.parse(url).pathname || "").toLowerCase();
				return file && (url.startsWith("https://images-ext-2.discordapp.net/") || file.endsWith(".jpg") || file.endsWith(".jpeg") || file.endsWith(".png") || file.endsWith(".gif") || file.endsWith(".apng") || file.endsWith(".webp"));
			}
			
			downloadImage (url, path) {
				url = url.startsWith("/assets") ? (window.location.origin + url) : url;
				BDFDB.LibraryRequires.request(url, {encoding: null}, (error, response, body) => {
					if (error) BDFDB.NotificationUtils.toast(this.labels.toast_saveimage_failed.replace("{{path}}", path), {type: "error"});
					else {
						BDFDB.LibraryRequires.fs.writeFile(this.getFileName(path, url.split("/").pop().split(".").slice(0, -1).join("."), response.headers["content-type"].split("/").pop().split("+")[0], 0), body, error => {
							if (error) BDFDB.NotificationUtils.toast(this.labels.toast_saveimage_failed.replace("{{path}}", path), {type: "error"});
							else BDFDB.NotificationUtils.toast(this.labels.toast_saveimage_success.replace("{{path}}", path), {type: "success"});
						});
					}
				});
			}
			
			downloadImageAs (url) {
				url = url.startsWith("/assets") ? (window.location.origin + url) : url;
				BDFDB.LibraryRequires.request(url, {encoding: null}, (error, response, body) => {
					let hrefURL = window.URL.createObjectURL(new Blob([body]));
					let tempLink = document.createElement("a");
					tempLink.href = hrefURL;
					tempLink.download = `${url.split("/").pop().split(".").slice(0, -1).join(".")}.${response.headers["content-type"].split("/").pop().split("+")[0]}`;
					tempLink.click();
					window.URL.revokeObjectURL(hrefURL);
				});
			}
			
			copyImage (url) {
				BDFDB.LibraryRequires.request(url, {encoding: null}, (error, response, buffer) => {
					if (error) BDFDB.NotificationUtils.toast(this.labels.toast_copyimage_failed, {type: "error"});
					else if (buffer) {
						if (BDFDB.LibraryRequires.process.platform === "win32" || BDFDB.LibraryRequires.process.platform === "darwin") {
							BDFDB.LibraryRequires.electron.clipboard.write({image: BDFDB.LibraryRequires.electron.nativeImage.createFromBuffer(buffer)});
						}
						else {
							let file = BDFDB.LibraryRequires.path.join(BDFDB.LibraryRequires.process.env.HOME, "imageutilstempimg.png");
							BDFDB.LibraryRequires.fs.writeFileSync(file, buffer, {encoding: null});
							BDFDB.LibraryRequires.electron.clipboard.write({image: file});
							BDFDB.LibraryRequires.fs.unlinkSync(file);
						}
						BDFDB.NotificationUtils.toast(this.labels.toast_copyimage_success, {type: "success"});
					}
				});
			}
			
			getDownloadLocation () {
				if (downloadsFolder && BDFDB.LibraryRequires.fs.existsSync(downloadsFolder)) return downloadsFolder;
				let homePath = BDFDB.LibraryRequires.process.env.USERPROFILE || BDFDB.LibraryRequires.process.env.HOMEPATH || BDFDB.LibraryRequires.process.env.HOME;
				let downloadPath = homePath && BDFDB.LibraryRequires.path.join(homePath, "Downloads");
				if (downloadPath && BDFDB.LibraryRequires.fs.existsSync(downloadPath)) return downloadsFolder = downloadPath;
				return downloadsFolder = BDFDB.BDUtils.getPluginsFolder();
			}
			
			getFileName (path, fileName, extension, i) {
				let wholePath = BDFDB.LibraryRequires.path.join(path, i ? `${fileName} (${i}).${extension}` : `${fileName}.${extension}`);
				if (BDFDB.LibraryRequires.fs.existsSync(wholePath)) return this.getFileName(path, fileName, extension, i + 1);
				else return wholePath;
			}

			getMessageGroupOfImage (src) {
				if (src && settings.enableGallery) for (let message of document.querySelectorAll(BDFDB.dotCN.message)) for (let img of message.querySelectorAll(BDFDB.dotCNS.imagewrapper + "img")) if (this.isSameImage(src, img)) {
					let previousSiblings = [], nextSiblings = [];
					let previousSibling = message.previousSibling, nextSibling = message.nextSibling;
					if (!BDFDB.DOMUtils.containsClass(message, BDFDB.disCN.messagegroupstart)) while (previousSibling) {
						previousSiblings.push(previousSibling);
						if (BDFDB.DOMUtils.containsClass(previousSibling, BDFDB.disCN.messagegroupstart)) previousSibling = null;
						else previousSibling = previousSibling.previousSibling;
					}
					while (nextSibling) {
						if (!BDFDB.DOMUtils.containsClass(nextSibling, BDFDB.disCN.messagegroupstart)) {
							nextSiblings.push(nextSibling);
							nextSibling = nextSibling.nextSibling;
						}
						else nextSibling = null;
					}
					return [].concat(previousSiblings.reverse(), message, nextSiblings).filter(n => n && BDFDB.DOMUtils.containsClass(n, BDFDB.disCN.message));
				}
				return [];
			}
			
			getSiblingsAndPosition (url, messages) {
				let images = messages.map(n => Array.from(n.querySelectorAll(BDFDB.dotCNS.imagewrapper + "img"))).flat().filter(img => !BDFDB.DOMUtils.getParent(BDFDB.dotCN.spoilerhidden, img));
				let next, previous, index = 0, amount = images.length;
				for (let i = 0; i < amount; i++) if (this.isSameImage(url, images[i])) {
					index = i;
					previous = images[i-1];
					next = images[i+1];
					break;
				}
				return {next, previous, index, amount};
			}
			
			isSameImage (src, img) {
				return img.src && (Node.prototype.isPrototypeOf(src) && img == src || !Node.prototype.isPrototypeOf(src) && this.getImageSrc(img) == this.getImageSrc(src));
			}

			getImageSrc (img) {
				if (!img) return null;
				return (typeof img == "string" ? img : (img.src || (img.querySelector("canvas") ? img.querySelector("canvas").src : ""))).split("?width=")[0];
			}
			
			createImageWrapper (instance, imgRef, type, svgIcon) {
				return BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.disCNS._imageutilitiessibling + BDFDB.disCN[`_imageutilities${type}`],
					onClick: _ => {this.switchImages(instance, type);},
					children: [
						imgRef,
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.disCNS._imageutilitiesswitchicon + BDFDB.disCN.svgicon,
							name: svgIcon
						})
					]
				});
			}
			
			loadImage (instance, img, type) {
				let imageThrowaway = document.createElement("img");
				let src = this.getImageSrc(img);
				imageThrowaway.src = src;
				imageThrowaway.onload = _ => {
					let arects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount));
					let resizeY = (arects.height/imageThrowaway.naturalHeight) * 0.65, resizeX = (arects.width/imageThrowaway.naturalWidth) * 0.8;
					let resize = resizeX < resizeY ? resizeX : resizeY;
					let newHeight = imageThrowaway.naturalHeight * resize;
					let newWidth = imageThrowaway.naturalWidth * resize;
					instance[type + "Img"] = img;
					instance[type + "Ref"] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.LazyImage, {
						src: src,
						height: imageThrowaway.naturalHeight,
						width: imageThrowaway.naturalWidth,
						maxHeight: newHeight,
						maxWidth: newWidth,
					});
					BDFDB.ReactUtils.forceUpdate(instance);
				};
			}
			
			switchImages (instance, type) {
				let img = instance[type + "Img"];
				let imgRef = instance[type + "Ref"];
				if (!img || !imgRef) return;
				delete instance.previousRef;
				delete instance.nextRef;
				delete instance.previousImg;
				delete instance.nextImg;
				instance.props.original = imgRef.props.src;
				instance.props.placeholder = imgRef.props.src;
				instance.props.src = imgRef.props.src;
				instance.props.height = imgRef.props.height;
				instance.props.width = imgRef.props.width;
				instance.props.cachedImage = img;
				BDFDB.ReactUtils.forceUpdate(instance);
			}
			
			cleanupListeners (type) {
				if (!type) return;
				for (let eventType of ["wheel", "keydown", "keyup"]) {
					document.removeEventListener("wheel", document[`${eventType}ImageUtilities${type}Listener`]);
					delete document[`${eventType}ImageUtilities${type}Listener`];
				}
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "hr":		//croatian
						return {
							toast_copyimage_success:			"Kopirana je slika u međuspremnik",
							toast_copyimage_failed:				"Kopiranje slike u međuspremnik nije uspjelo",
							toast_copyimagelink_success:		"Kopirana slika povezana na međuspremnik",
							toast_saveimage_success:			"Slika je spremljena u '{{path}}'",
							toast_saveimage_failed:				"Spremanje slike na '{{path}}' nije uspjelo",
							context_viewimage_text:				"Pogledati sliku",
							context_saveimageas_text:			"Spremi sliku kao ...",
							context_copyimage_text:				"Kopiraj sliku",
							context_copyimagelink_text:			"Kopirajte vezu slike",
							context_reverseimagesearch_text:	"Traži sliku ...",
							context_lenssize_text:				"Veličina leće",
							submenu_disabled_text:				"Svi su onemogućeni"
						};
					case "da":		//danish
						return {
							toast_copyimage_success:			"Kopieret billede til udklipsholder",
							toast_copyimage_failed:				"Kunne ikke kopiere billedet til udklipsholderen",
							toast_copyimagelink_success:		"Kopieret billedlink til udklipsholder",
							toast_saveimage_success:			"Billedet er gemt i '{{path}}'",
							toast_saveimage_failed:				"Kunne ikke gemme billedet i '{{path}}'",
							context_viewimage_text:				"Se billede",
							context_saveimageas_text:			"Gem billede som ...",
							context_copyimage_text:				"Kopier billede",
							context_copyimagelink_text:			"Kopier billedlink",
							context_reverseimagesearch_text:	"Søg billede med ...",
							context_lenssize_text:				"Linsestørrelse",
							submenu_disabled_text:				"Alle deaktiveret"
						};
					case "de":		//german
						return {
							toast_copyimage_success:			"Bild in Zwischenablage kopiert",
							toast_copyimage_failed:				"Bild konnte nicht in die Zwischenablage kopiert werden",
							toast_copyimagelink_success:		"Bildadresse in Zwischenablage kopiert",
							toast_saveimage_success:			"Bild wurde in '{{path}}' gespeichert",
							toast_saveimage_failed:				"Bild konnte nicht in '{{path}}' gespeichert werden",
							context_viewimage_text:				"Bild ansehen",
							context_saveimageas_text:			"Bild speichern unter ...",
							context_copyimage_text:				"Bild kopieren",
							context_copyimagelink_text:			"Bildadresse kopieren",
							context_reverseimagesearch_text:	"Bild suchen mit ...",
							context_lenssize_text:				"Linsengröße",
							submenu_disabled_text:				"Alle deaktiviert"
						};
					case "es":		//spanish
						return {
							toast_copyimage_success:			"Imagen copiada al portapapeles",
							toast_copyimage_failed:				"No se pudo copiar la imagen al portapapeles",
							toast_copyimagelink_success:		"Enlace de imagen copiado al portapapeles",
							toast_saveimage_success:			"Imagen guardada en '{{path}}'",
							toast_saveimage_failed:				"No se pudo guardar la imagen en '{{path}}'",
							context_viewimage_text:				"Ver imagen",
							context_saveimageas_text:			"Guardar imagen como ...",
							context_copyimage_text:				"Copiar imagen",
							context_copyimagelink_text:			"Copiar enlace de imagen",
							context_reverseimagesearch_text:	"Buscar imagen con ...",
							context_lenssize_text:				"Tamaño de la lente",
							submenu_disabled_text:				"Todo desactivado"
						};
					case "fr":		//french
						return {
							toast_copyimage_success:			"Image copiée dans le presse-papiers",
							toast_copyimage_failed:				"Échec de la copie de l'image dans le presse-papiers",
							toast_copyimagelink_success:		"Lien d'image copié dans le presse-papiers",
							toast_saveimage_success:			"Image enregistrée dans '{{path}}'",
							toast_saveimage_failed:				"Échec de l'enregistrement de l'image dans '{{path}}'",
							context_viewimage_text:				"Voir l'image",
							context_saveimageas_text:			"Enregistrer l'image sous ...",
							context_copyimage_text:				"Copier l'image",
							context_copyimagelink_text:			"Copier le lien de l'image",
							context_reverseimagesearch_text:	"Rechercher une image avec ...",
							context_lenssize_text:				"Taille de la lentille",
							submenu_disabled_text:				"Tous désactivés"
						};
					case "it":		//italian
						return {
							toast_copyimage_success:			"Immagine copiata negli appunti",
							toast_copyimage_failed:				"Impossibile copiare l'immagine negli appunti",
							toast_copyimagelink_success:		"Collegamento dell'immagine copiato negli appunti",
							toast_saveimage_success:			"Immagine salvata in '{{path}}'",
							toast_saveimage_failed:				"Impossibile salvare l'immagine in '{{path}}'",
							context_viewimage_text:				"Guarda l'immagine",
							context_saveimageas_text:			"Salva l'immagine come ...",
							context_copyimage_text:				"Copia l'immagine",
							context_copyimagelink_text:			"Copia link immagine",
							context_reverseimagesearch_text:	"Cerca immagine con ...",
							context_lenssize_text:				"Dimensione dell'obiettivo",
							submenu_disabled_text:				"Tutto disattivato"
						};
					case "nl":		//dutch
						return {
							toast_copyimage_success:			"Gekopieerde afbeelding naar klembord",
							toast_copyimage_failed:				"Kan afbeelding niet naar klembord kopiëren",
							toast_copyimagelink_success:		"Gekopieerde afbeeldingslink naar klembord",
							toast_saveimage_success:			"Afbeelding opgeslagen in '{{path}}'",
							toast_saveimage_failed:				"Kan afbeelding niet opslaan in '{{path}}'",
							context_viewimage_text:				"Bekijk afbeelding",
							context_saveimageas_text:			"Sla afbeelding op als ...",
							context_copyimage_text:				"Kopieer afbeelding",
							context_copyimagelink_text:			"Kopieer afbeeldingslink",
							context_reverseimagesearch_text:	"Afbeelding zoeken met ...",
							context_lenssize_text:				"Lensgrootte",
							submenu_disabled_text:				"Alles gedeactiveerd"
						};
					case "no":		//norwegian
						return {
							toast_copyimage_success:			"Kopiert bilde til utklippstavlen",
							toast_copyimage_failed:				"Kunne ikke kopiere bildet til utklippstavlen",
							toast_copyimagelink_success:		"Kopiert bildelink til utklippstavlen",
							toast_saveimage_success:			"Bilde lagret i '{{path}}'",
							toast_saveimage_failed:				"Kunne ikke lagre bildet i '{{path}}'",
							context_viewimage_text:				"Vis bilde",
							context_saveimageas_text:			"Lagre bildet som ...",
							context_copyimage_text:				"Kopier bilde",
							context_copyimagelink_text:			"Kopier bildelink",
							context_reverseimagesearch_text:	"Søk på bilde med ...",
							context_lenssize_text:				"Linsestørrelse",
							submenu_disabled_text:				"Alle deaktivert"
						};
					case "pl":		//polish
						return {
							toast_copyimage_success:			"Skopiowany obraz do schowka",
							toast_copyimage_failed:				"Nie udało się skopiować obrazu do schowka",
							toast_copyimagelink_success:		"Link do skopiowanego obrazu do schowka",
							toast_saveimage_success:			"Obraz zapisany w '{{path}}'",
							toast_saveimage_failed:				"Nie udało się zapisać obrazu w '{{path}}'",
							context_viewimage_text:				"Zobacz obraz",
							context_saveimageas_text:			"Zapisz obraz jako ...",
							context_copyimage_text:				"Skopiuj obraz",
							context_copyimagelink_text:			"Kopiuj łącze do obrazu",
							context_reverseimagesearch_text:	"Wyszukaj obraz za pomocą ...",
							context_lenssize_text:				"Rozmiar obiektywu",
							submenu_disabled_text:				"Wszystkie wyłączone"
						};
					case "pt-BR":	//portuguese (brazil)
						return {
							toast_copyimage_success:			"Imagem copiada para a área de transferência",
							toast_copyimage_failed:				"Falha ao copiar imagem para a área de transferência",
							toast_copyimagelink_success:		"Link da imagem copiada para a área de transferência",
							toast_saveimage_success:			"Imagem salva em '{{path}}'",
							toast_saveimage_failed:				"Falha ao salvar imagem em '{{path}}'",
							context_viewimage_text:				"Ver imagem",
							context_saveimageas_text:			"Salvar imagem como ...",
							context_copyimage_text:				"Copiar imagem",
							context_copyimagelink_text:			"Copiar link da imagem",
							context_reverseimagesearch_text:	"Pesquisar imagem com ...",
							context_lenssize_text:				"Tamanho da lente",
							submenu_disabled_text:				"Todos desativados"
						};
					case "fi":		//finnish
						return {
							toast_copyimage_success:			"Kopioitu kuva leikepöydälle",
							toast_copyimage_failed:				"Kuvan kopiointi leikepöydälle epäonnistui",
							toast_copyimagelink_success:		"Kopioitu kuvan linkki leikepöydälle",
							toast_saveimage_success:			"Kuva tallennettu '{{path}}'",
							toast_saveimage_failed:				"Kuvan tallentaminen epäonnistui '{{path}}'",
							context_viewimage_text:				"Näytä kuva",
							context_saveimageas_text:			"Tallenna kuva nimellä ...",
							context_copyimage_text:				"Kopioi kuva",
							context_copyimagelink_text:			"Kopioi kuvan linkki",
							context_reverseimagesearch_text:	"Hae kuvaa ...",
							context_lenssize_text:				"Linssin koko",
							submenu_disabled_text:				"Kaikki on poistettu käytöstä"
						};
					case "sv":		//swedish
						return {
							toast_copyimage_success:			"Kopierad bild till urklipp",
							toast_copyimage_failed:				"Det gick inte att kopiera bilden till urklipp",
							toast_copyimagelink_success:		"Kopierad bildlänk till urklipp",
							toast_saveimage_success:			"Bild sparad i '{{path}}'",
							toast_saveimage_failed:				"Det gick inte att spara bilden i '{{path}}'",
							context_viewimage_text:				"Se bild",
							context_saveimageas_text:			"Spara bild som ...",
							context_copyimage_text:				"Kopiera bild",
							context_copyimagelink_text:			"Kopiera bildlänk",
							context_reverseimagesearch_text:	"Sök bild med ...",
							context_lenssize_text:				"Linsstorlek",
							submenu_disabled_text:				"Alla avaktiverade"
						};
					case "tr":		//turkish
						return {
							toast_copyimage_success:			"Görüntü panoya kopyalandı",
							toast_copyimage_failed:				"Görüntü panoya kopyalanamadı",
							toast_copyimagelink_success:		"Görsel bağlantısı panoya kopyalandı",
							toast_saveimage_success:			"Resim '{{path}}' konumuna kaydedildi",
							toast_saveimage_failed:				"'{{path}}' konumuna resim kaydedilemedi",
							context_viewimage_text:				"Resmi görüntüle",
							context_saveimageas_text:			"Resmi farklı kaydet ...",
							context_copyimage_text:				"Resmi kopyala",
							context_copyimagelink_text:			"Görüntü Bağlantısını kopyala",
							context_reverseimagesearch_text:	"Görüntüyü şununla ara ...",
							context_lenssize_text:				"Lens boyutu",
							submenu_disabled_text:				"Hepsi deaktive"
						};
					case "cs":		//czech
						return {
							toast_copyimage_success:			"Zkopírován obrázek do schránky",
							toast_copyimage_failed:				"Nepodařilo se kopírovat obrázek do schránky",
							toast_copyimagelink_success:		"Odkaz na zkopírovaný obrázek do schránky",
							toast_saveimage_success:			"Obrázek uložený v '{{path}}'",
							toast_saveimage_failed:				"Nepodařilo se uložit obrázek do '{{path}}'",
							context_viewimage_text:				"Zobrazit obrázek",
							context_saveimageas_text:			"Uložit obrázek jako ...",
							context_copyimage_text:				"Kopírovat obrázek",
							context_copyimagelink_text:			"Kopírovat odkaz na obrázek",
							context_reverseimagesearch_text:	"Vyhledat obrázek pomocí ...",
							context_lenssize_text:				"Velikost objektivu",
							submenu_disabled_text:				"Všechny deaktivované"
						};
					case "bg":		//bulgarian
						return {
							toast_copyimage_success:			"Копирано изображение в клипборда",
							toast_copyimage_failed:				"Копирането на изображение в буферната памет не бе успешно",
							toast_copyimagelink_success:		"Копирано изображение за връзка в клипборда",
							toast_saveimage_success:			"Изображението е запазено в '{{path}}'",
							toast_saveimage_failed:				"Неуспешно запазване на изображението в '{{path}}'",
							context_viewimage_text:				"Вижте изображението",
							context_saveimageas_text:			"Запази изображението като ...",
							context_copyimage_text:				"Копирай изображение",
							context_copyimagelink_text:			"Копиране на изображението",
							context_reverseimagesearch_text:	"Търсене на изображение с ...",
							context_lenssize_text:				"Размер на обектива",
							submenu_disabled_text:				"Всички са деактивирани"
						};
					case "ru":		//russian
						return {
							toast_copyimage_success:			"Изображение скопировано в буфер обмена",
							toast_copyimage_failed:				"Не удалось скопировать изображение в буфер обмена",
							toast_copyimagelink_success:		"Ссылка на скопированное изображение в буфер обмена",
							toast_saveimage_success:			"Изображение сохранено в '{{path}}'",
							toast_saveimage_failed:				"Не удалось сохранить изображение в '{{path}}'",
							context_viewimage_text:				"Просмотр изображения",
							context_saveimageas_text:			"Сохранить изображение как ...",
							context_copyimage_text:				"Копировать изображение",
							context_copyimagelink_text:			"Копировать ссылку на изображение",
							context_reverseimagesearch_text:	"Поиск изображения с ...",
							context_lenssize_text:				"Размер объектива",
							submenu_disabled_text:				"Все деактивированные"
						};
					case "uk":		//ukrainian
						return {
							toast_copyimage_success:			"Скопійоване зображення в буфер обміну",
							toast_copyimage_failed:				"Не вдалося скопіювати зображення в буфер обміну",
							toast_copyimagelink_success:		"Скопійоване зображення посилання на буфер обміну",
							toast_saveimage_success:			"Зображення збережено на '{{path}}'",
							toast_saveimage_failed:				"Не вдалося зберегти зображення на '{{path}}'",
							context_viewimage_text:				"Переглянути зображення",
							context_saveimageas_text:			"Зберегти зображення як ...",
							context_copyimage_text:				"Скопіювати зображення",
							context_copyimagelink_text:			"Скопіюйте посилання на зображення",
							context_reverseimagesearch_text:	"Шукати зображення за допомогою ...",
							context_lenssize_text:				"Розмір об'єктива",
							submenu_disabled_text:				"Всі вимкнені"
						};
					case "ja":		//japanese
						return {
							toast_copyimage_success:			"画像をクリップボードにコピー",
							toast_copyimage_failed:				"画像をクリップボードにコピーできませんでした",
							toast_copyimagelink_success:		"クリップボードへの画像リンクのコピー",
							toast_saveimage_success:			"画像は'{{path}}'に保存されました",
							toast_saveimage_failed:				"画像を'{{path}}'に保存できませんでした",
							context_viewimage_text:				"画像を見る",
							context_saveimageas_text:			"画像を保存します ...",
							context_copyimage_text:				"画像をコピー",
							context_copyimagelink_text:			"画像リンクをコピー",
							context_reverseimagesearch_text:	"で画像を検索 ...",
							context_lenssize_text:				"レンズサイズ",
							submenu_disabled_text:				"すべて非アクティブ化"
						};
					case "zh-TW":	//chinese (traditional)
						return {
							toast_copyimage_success:			"複製的圖像到剪貼板",
							toast_copyimage_failed:				"無法將圖像複製到剪貼板",
							toast_copyimagelink_success:		"複製的圖像鏈接到剪貼板",
							toast_saveimage_success:			"圖片保存在'{{path}}'中",
							toast_saveimage_failed:				"無法將圖像保存到'{{path}}'中",
							context_viewimage_text:				"看圖片",
							context_saveimageas_text:			"將圖像另存為...",
							context_copyimage_text:				"複製圖片",
							context_copyimagelink_text:			"複製圖像鏈接",
							context_lenssize_text:				"鏡片尺寸",
							context_reverseimagesearch_text:	"搜尋圖片...",
							submenu_disabled_text:				"全部停用"
						};
					case "ko":		//korean
						return {
							toast_copyimage_success:			"클립 보드에 복사 된 이미지",
							toast_copyimage_failed:				"이미지를 클립 보드로 복사하지 못했습니다",
							toast_copyimagelink_success:		"클립 보드에 복사 된 이미지 링크",
							toast_saveimage_success:			"'{{path}}'에 저장된 이미지",
							toast_saveimage_failed:				"'{{path}}'에 이미지를 저장하지 못했습니다",
							context_viewimage_text:				"이미지보기",
							context_saveimageas_text:			"다른 이름으로 이미지 저장 ...",
							context_copyimage_text:				"복사 이미지",
							context_copyimagelink_text:			"이미지 링크 복사",
							context_reverseimagesearch_text:	"로 이미지 검색 ...",
							context_lenssize_text:				"렌즈 크기",
							submenu_disabled_text:				"모두 비활성화 됨"
						};
					default:		//default: english
						return {
							toast_copyimage_success:			"Copied image to clipboard",
							toast_copyimage_failed:				"Failed to copy image to clipboard",
							toast_copyimagelink_success:		"Copied image link to clipboard",
							toast_saveimage_success:			"Saved image in '{{path}}'",
							toast_saveimage_failed:				"Failed to save image in '{{path}}'",
							context_viewimage_text:				"View Image",
							context_saveimageas_text:			"Save Image as ...",
							context_copyimage_text:				"Copy Image",
							context_copyimagelink_text:			"Copy Image Link",
							context_reverseimagesearch_text:	"Search Image with ...",
							context_lenssize_text:				"Lens Size",
							submenu_disabled_text:				"All disabled"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
