/**
 * @name ImageUtilities
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 4.5.3
 * @description Adds several Utilities for Images/Videos (Gallery, Download, Reverse Search, Zoom, Copy, etc.)
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ImageUtilities/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ImageUtilities/ImageUtilities.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ImageUtilities",
			"author": "DevilBro",
			"version": "4.5.3",
			"description": "Adds several Utilities for Images/Videos (Gallery, Download, Reverse Search, Zoom, Copy, etc.)"
		}
	};
	
	return (window.Lightcord && !Node.prototype.isPrototypeOf(window.Lightcord) || window.LightCord && !Node.prototype.isPrototypeOf(window.LightCord) || window.Astra && !Node.prototype.isPrototypeOf(window.Astra)) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return "Do not use LightCord!";}
		load () {BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)");}
		start() {}
		stop() {}
	} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
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
		var firedEvents = [], clickedImage;
		var ownLocations = {}, downloadsFolder;
		
		const imgUrlReplaceString = "DEVILBRO_BD_REVERSEIMAGESEARCH_REPLACE_IMAGEURL";
		
		const fileTypes = {
			"3gp":		{copyable: false,	searchable: false,	video: true},
			"3g2":		{copyable: false,	searchable: false,	video: true},
			"amv":		{copyable: false,	searchable: false,	video: true},
			"apng":		{copyable: false,	searchable: true,	video: false},
			"avi":		{copyable: false,	searchable: false,	video: true},
			"flv":		{copyable: false,	searchable: false,	video: true},
			"jpeg":		{copyable: true,	searchable: true,	video: false},
			"jpg":		{copyable: true,	searchable: true,	video: false},
			"gif":		{copyable: false,	searchable: true,	video: false},
			"m4v":		{copyable: false,	searchable: false,	video: true},
			"mkv":		{copyable: false,	searchable: false,	video: true},
			"mov":		{copyable: false,	searchable: false,	video: true},
			"mp4":		{copyable: false,	searchable: false,	video: true},
			"mpeg-1":	{copyable: false,	searchable: false,	video: true},
			"mpeg-2":	{copyable: false,	searchable: false,	video: true},
			"ogg":		{copyable: false,	searchable: false,	video: true},
			"ogv":		{copyable: false,	searchable: false,	video: true},
			"png":		{copyable: true,	searchable: true,	video: false},
			"svg":		{copyable: false,	searchable: false,	video: false},
			"webm":		{copyable: false,	searchable: false,	video: true},
			"webp":		{copyable: false,	searchable: true,	video: false},
			"wmv":		{copyable: false,	searchable: false,	video: true}
		};
		
		const ImageDetailsComponent = class ImageDetails extends BdApi.React.Component {
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
			onLoad () {
				firedEvents = [];
				clickedImage = null;
				
				this.defaults = {
					general: {
						resizeImage: 			{value: true,		description: "Always resize Image to fit the whole Image Modal"},
						addDetails: 			{value: true,		description: "Add Image Details (Name, Size, Amount) in the Image Modal"},
						showAsHeader:			{value: true, 		description: "Show Image Details as a Details Header above the Image in the Chat"},
						showOnHover:			{value: false, 		description: "Show Image Details as Tooltip in the Chat"},
						enableGallery: 			{value: true,		description: "Display previous/next Images in the same message in the Image Modal"},
						enableZoom: 			{value: true,		description: "Create a Zoom Lens if you press down on an Image in the Image Modal"},
						pixelZoom: 				{value: false,		description: "Zoom Lens will be pixelated instead of blurry"},
						enableCopyImg: 			{value: true,		description: "Add a copy Image Option in the Image Modal"},
						enableSaveImg: 			{value: true,		description: "Add a save Image as Option in the Image Modal"},
					},
					places: {
						userAvatars: 			{value: true, 		description: "User Avatars"},
						groupIcons: 			{value: true, 		description: "Group Icons"},
						guildIcons: 			{value: true, 		description: "Server Icons"},
						emojis: 				{value: true, 		description: "Custom Emojis/Emotes"}
					},
					amounts: {
						hoverDelay:				{value: 0, 			min: 0,			description: "Image Tooltip Delay (in ms)"}
					},
					zoomSettings: {
						zoomLevel:				{value: 2,			digits: 1,		minValue: 1,	maxValue: 20,		unit: "x",	label: "ACCESSIBILITY_ZOOM_LEVEL_LABEL"},
						lensSize:				{value: 200,		digits: 0,		minValue: 50, 	maxValue: 5000,		unit: "px",	label: "context_lenssize"}
					},
					engines: {
						_all: 		{value: true, 	name: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL, 	url: null},
						Baidu: 		{value: true, 	name: "Baidu", 		url: "http://image.baidu.com/pcdutu?queryImageUrl=" + imgUrlReplaceString},
						Bing: 		{value: true, 	name: "Bing", 		url: "https://www.bing.com/images/search?q=imgurl: " + imgUrlReplaceString + "&view=detailv2&iss=sbi&FORM=IRSBIQ"},
						Google:		{value: true, 	name: "Google", 	url: "https://images.google.com/searchbyimage?image_url=" + imgUrlReplaceString},
						ImgOps:		{value: true, 	name: "ImgOps", 	raw: true, 	url: "https://imgops.com/specialized+reverse/" + imgUrlReplaceString},
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
						LazyImage: ["render", "componentDidMount"],
						UserBanner: "default"
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
						filter: unset !important;
						backdrop-filter: unset !important;
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
						border: 2px solid var(--bdfdb-blurple);
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
			
			onStart () {
				BDFDB.ListenerUtils.add(this, document.body, "click", BDFDB.dotCNS.message + BDFDB.dotCNS.imagewrapper + "img", e => {
					clickedImage = e.target;
					BDFDB.TimeUtils.timeout(_ => {clickedImage = null;});
				});
				
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MediaComponentUtils, "renderImageComponent", {after: e => {
					if (this.settings.general.showAsHeader && e.methodArguments[0].original && e.methodArguments[0].src.indexOf("https://media.discordapp.net/attachments") == 0 && (e.methodArguments[0].className || "").indexOf(BDFDB.disCN.embedmedia) == -1 && (e.methodArguments[0].className || "").indexOf(BDFDB.disCN.embedthumbnail) == -1 && BDFDB.ReactUtils.findChild(e.returnValue, {name: ["LazyImageZoomable", "LazyImage"]})) return BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.embedwrapper,
						children: [
							BDFDB.ReactUtils.createElement(ImageDetailsComponent, {
								original: e.methodArguments[0].original,
								attachment: {
									height: 0,
									width: 0,
									filename: "unknown.png"
								}
							}),
							e.returnValue
						]
					});
				}});

				this.forceUpdateAll();
			}
			
			onStop () {
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
							children: Object.keys(this.defaults.general).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["general", key],
								label: this.defaults.general[key].description,
								value: this.settings.general[key]
							})).concat(Object.keys(this.defaults.amounts).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "TextInput",
								plugin: this,
								keys: ["amounts", key],
								label: this.defaults.amounts[key].description,
								basis: "50%",
								childProps: {type: "number"},
								min: this.defaults.amounts[key].min,
								max: this.defaults.amounts[key].max,
								value: this.settings.amounts[key]
							})))
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
												for (let input of settingsPanel.props._node.querySelectorAll(".input-newlocation " + BDFDB.dotCN.input)) if (!input.value || input.value.length == 0 || input.value.trim().length == 0) return BDFDB.NotificationUtils.toast("Fill out all fields to add a new Location.", {type: "danger"});
												let name = settingsPanel.props._node.querySelector(".input-name " + BDFDB.dotCN.input).value.trim();
												let location = settingsPanel.props._node.querySelector(".input-location " + BDFDB.dotCN.input).value.trim();
												if (ownLocations[name] || name == "Downloads") return BDFDB.NotificationUtils.toast("A Location with the choosen Name already exists, please choose another Name", {type: "danger"});
												else if (!BDFDB.LibraryRequires.fs.existsSync(location)) return BDFDB.NotificationUtils.toast("The choosen download Location is not a valid Path to a Folder", {type: "danger"});
												else {
													ownLocations[name] = {enabled: true, location: location};
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
									let locationName = name;
									let editable = name != "Downloads";
									return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Card, {
										horizontal: true,
										children: [
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												grow: 0,
												basis: "180px",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													value: locationName,
													placeholder: locationName,
													size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
													maxLength: 100000000000000000000,
													disabled: !editable,
													onChange: !editable ? null : value => {
														ownLocations[value] = ownLocations[locationName];
														delete ownLocations[locationName];
														locationName = value;
														BDFDB.DataUtils.save(ownLocations, this, "ownLocations");
													}
												})
											}),
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													value: ownLocations[locationName].location,
													placeholder: ownLocations[locationName].location,
													size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
													maxLength: 100000000000000000000,
													onChange: value => {
														ownLocations[locationName].location = value;
														BDFDB.DataUtils.save(ownLocations, this, "ownLocations");
													}
												})
											}),
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Switch, {
													value: ownLocations[locationName].enabled,
													size: BDFDB.LibraryComponents.Switch.Sizes.MINI,
													onChange: value => {
														ownLocations[locationName].enabled = value;
														BDFDB.DataUtils.save(ownLocations, this, "ownLocations");
													}
												})
											})
										],
										noRemove: !editable,
										onRemove: !editable ? null : _ => {
											delete ownLocations[locationName];
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
							})].concat(Object.keys(this.defaults.places).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["places", key],
								label: this.defaults.places[key].description,
								value: this.settings.places[key]
							})))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Search Engines",
							collapseStates: collapseStates,
							children: Object.keys(this.defaults.engines).map(key => key != "_all" && BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["engines", key],
								label: this.defaults.engines[key].name,
								value: this.settings.engines[key]
							})).filter(n => n)
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
				const loadedLocations = BDFDB.DataUtils.load(this, "ownLocations");
				ownLocations = Object.assign(!loadedLocations || !loadedLocations.Downloads ? {"Downloads": {enabled:true, location: this.getDownloadLocation()}} : {}, loadedLocations);
				
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}

			onGuildContextMenu (e) {
				if (e.instance.props.guild && this.settings.places.guildIcons) {
					if (BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildheader, e.instance.props.target) || BDFDB.DOMUtils.getParent(BDFDB.dotCN.guildchannels, e.instance.props.target) && !e.instance.props.target.className && e.instance.props.target.parentElement.firstElementChild == e.instance.props.target) {
						let banner = BDFDB.GuildUtils.getBanner(e.instance.props.guild.id);
						if (banner) this.injectItem(e, banner.replace(/\.webp|\.gif/, ".png"), e.instance.props.guild.banner && BDFDB.LibraryModules.IconUtils.isAnimatedIconHash(e.instance.props.guild.banner), banner);
					}
					else if (e.type != "GuildChannelListContextMenu") this.injectItem(e, (e.instance.props.guild.getIconURL(4096) || "").replace(/\.webp|\.gif/, ".png"), e.instance.props.guild.icon && BDFDB.LibraryModules.IconUtils.isAnimatedIconHash(e.instance.props.guild.icon) && e.instance.props.guild.getIconURL(4096, true));
				}
			}

			onUserContextMenu (e) {
				if (e.instance.props.user && this.settings.places.userAvatars) this.injectItem(e, (e.instance.props.user.getAvatarURL(e.instance.props.guildId, 4096) || "").replace(/\.webp|\.gif/, ".png"), BDFDB.LibraryModules.IconUtils.isAnimatedIconHash(e.instance.props.user.avatar) && e.instance.props.user.getAvatarURL(e.instance.props.guildId, 4096, true));
			}

			onGroupDMContextMenu (e) {
				if (e.instance.props.channel && e.instance.props.channel.isGroupDM() && this.settings.places.groupIcons) this.injectItem(e, (BDFDB.DMUtils.getIcon(e.instance.props.channel.id) || "").replace(/\.webp|\.gif/, ".png"));
			}

			onNativeContextMenu (e) {
				if (e.type == "NativeImageContextMenu" && (e.instance.props.href || e.instance.props.src)) {
					this.injectItem(e, e.instance.props.href || e.instance.props.src);
				}
			}

			onMessageContextMenu (e) {
				if (e.instance.props.message && e.instance.props.channel && e.instance.props.target) {
					if (e.instance.props.attachment) this.injectItem(e, e.instance.props.attachment.url);
					else if (e.instance.props.target.tagName == "A" && e.instance.props.message.embeds && e.instance.props.message.embeds[0] && (e.instance.props.message.embeds[0].type == "image" || e.instance.props.message.embeds[0].type == "video")) this.injectItem(e, e.instance.props.target.href);
					else if (e.instance.props.target.tagName == "IMG" && e.instance.props.target.complete && e.instance.props.target.naturalHeight) {
						if (BDFDB.DOMUtils.containsClass(e.instance.props.target.parentElement, BDFDB.disCN.imagewrapper)) this.injectItem(e, {file: e.instance.props.target.src, original: this.getTargetLink(e.instance.props.target)});
						else if (BDFDB.DOMUtils.containsClass(e.instance.props.target, BDFDB.disCN.embedauthoricon) && this.settings.places.userAvatars) this.injectItem(e, e.instance.props.target.src);
						else if (BDFDB.DOMUtils.containsClass(e.instance.props.target, BDFDB.disCN.emojiold, "emote", false) && this.settings.places.emojis) this.injectItem(e, {file: e.instance.props.target.src, alternativeName: e.instance.props.target.getAttribute("data-name")});
					}
					else if (e.instance.props.target.tagName == "VIDEO") {
						if (BDFDB.DOMUtils.containsClass(e.instance.props.target, BDFDB.disCN.embedvideo) || BDFDB.DOMUtils.getParent(BDFDB.dotCN.attachmentvideo, e.instance.props.target)) this.injectItem(e, {file: e.instance.props.target.src, original: this.getTargetLink(e.instance.props.target)});
					}
					else {
						const reaction = BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagereaction, e.instance.props.target);
						if (reaction && this.settings.places.emojis) {
							const emoji = reaction.querySelector(BDFDB.dotCN.emojiold);
							if (emoji) this.injectItem(e, {file: emoji.src, alternativeName: emoji.getAttribute("data-name")});
						}
					}
				}
			}
			
			getTargetLink (target) {
				let ele = target;
				let src = "", href = "";
				while (ele instanceof Node) ele instanceof HTMLImageElement && null != ele.src && (src = ele.src), ele instanceof HTMLAnchorElement && null != ele.href && (href = ele.href), ele = ele.parentNode;
				return href || src;
			}

			injectItem (e, ...urls) {
				let validUrls = this.filterUrls(...urls);
				if (!validUrls.length) return;
				
				let [removeParent, removeIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "copy-native-link", group: true});
				if (removeIndex > -1) {
					removeParent.splice(removeIndex, 1);
					removeIndex -= 1;
				}
				let [removeParent2, removeIndex2] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "copy-image", group: true});
				if (removeIndex2 > -1) removeParent2.splice(removeIndex2, 1);
				
				let type = this.isValid(validUrls[0].file, "video") ? BDFDB.LanguageUtils.LanguageStrings.VIDEO : BDFDB.LanguageUtils.LanguageStrings.IMAGE;
				let isNative = validUrls.length == 1 && removeIndex > -1;
				let subMenu = this.createSubMenus(e.instance, validUrls);
				
				let [children, index] = isNative ? [removeParent, removeIndex] : BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
				children.splice(index > -1 ? index : children.length, 0, isNative ? subMenu : BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: type + " " + BDFDB.LanguageUtils.LanguageStrings.ACTIONS,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "main-subitem"),
						children: subMenu
					})
				}));
			}
			
			filterUrls (...urls) {
				let fileTypes = [];
				return urls.filter(n => this.isValid(n && n.file || n)).map(n => {
					let srcUrl = (n.file || n).replace(/^url\(|\)$|"|'/g, "").replace(/\?size\=\d+$/, "?size=4096");
					let url = srcUrl.replace(/[\?\&](height|width)=\d+/g, "").split("%3A")[0];
					let original = (n.original || n.file || n).replace(/^url\(|\)$|"|'/g, "").replace(/\?size\=\d+$/, "?size=4096").replace(/[\?\&](height|width)=\d+/g, "").split("%3A")[0];
					if (url.indexOf("https://images-ext-1.discordapp.net/external/") > -1 || url.indexOf("https://images-ext-2.discordapp.net/external/") > -1) {
						if (url.split("/https/").length > 1) url = "https://" + url.split("/https/").pop();
						else if (url.split("/http/").length > 1) url = "http://" + url.split("/http/").pop();
					}
					const file = url && (BDFDB.LibraryModules.URLParser.parse(url).pathname || "").toLowerCase();
					const fileType = file && (file.split(".").pop() || "");
					return url && fileType && !fileTypes.includes(fileType) && fileTypes.push(fileType) && {file: url, src: srcUrl, original: original, fileType, alternativeName: escape((n.alternativeName || "").replace(/:/g, ""))};
				}).filter(n => n);
			}
			
			isValid (url, type) {
				if (!url) return false;
				const file = url && (BDFDB.LibraryModules.URLParser.parse(url).pathname || "").split("%3A")[0].toLowerCase();
				return file && (!type && (url.indexOf("discord.com/streams/guild:") > -1 || url.indexOf("discordapp.com/streams/guild:") > -1 || url.indexOf("discordapp.net/streams/guild:") > -1 || url.startsWith("https://images-ext-1.discordapp.net/") || url.startsWith("https://images-ext-2.discordapp.net/") || Object.keys(fileTypes).some(t => file.endsWith(`/${t}`) || file.endsWith(`.${t}`))) || type && Object.keys(fileTypes).filter(t => fileTypes[t][type]).some(t => file.endsWith(`/${t}`) || file.endsWith(`.${t}`)));
			}
			
			createSubMenus (instance, validUrls) {
				return validUrls.length == 1 ? this.createUrlMenu(instance, validUrls[0]) : validUrls.map((urlData, i) => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
					label: urlData.fileType.toUpperCase(),
					id: BDFDB.ContextMenuUtils.createItemId(this.name, "subitem", i),
					children: this.createUrlMenu(instance, urlData)
				}));
			}
			
			createUrlMenu (instance, urlData) {
				let enabledEngines = BDFDB.ObjectUtils.filter(this.settings.engines, n => n);
				let enginesWithoutAll = BDFDB.ObjectUtils.filter(enabledEngines, n => n != "_all", true);
				let engineKeys = Object.keys(enginesWithoutAll);
				let locations = Object.keys(ownLocations).filter(n => ownLocations[n].enabled);
				let isVideo = this.isValid(urlData.file, "video");
				let type = isVideo ? BDFDB.LanguageUtils.LanguageStrings.VIDEO : BDFDB.LanguageUtils.LanguageStrings.IMAGE;
				return BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: [
						BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.OPEN_LINK,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "open-link"),
							action: _ => BDFDB.DiscordUtils.openLink(urlData.original)
						}),
						BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.COPY_LINK,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-link"),
							action: _ => {
								BDFDB.LibraryRequires.electron.clipboard.write({text: urlData.original});
								BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LanguageStrings.LINK_COPIED, {type: "success"});
							}
						}),
						urlData.file != urlData.original && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.COPY_MEDIA_LINK,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-media-link"),
							action: _ => {
								BDFDB.LibraryRequires.electron.clipboard.write({text: urlData.file});
								BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LanguageStrings.LINK_COPIED, {type: "success"});
							}
						}),
						BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_view.replace("{{var0}}", type),
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "view-file"),
							action: _ => {
								let img = document.createElement(isVideo ? "video" : "img");
								img.addEventListener(isVideo ? "loadedmetadata" : "load", function() {
									BDFDB.LibraryModules.ModalUtils.openModal(modalData => {
										return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalRoot, Object.assign({
											className: BDFDB.disCN.imagemodal
										}, modalData, {
											size: BDFDB.LibraryComponents.ModalComponents.ModalSize.DYNAMIC,
											"aria-label": BDFDB.LanguageUtils.LanguageStrings.IMAGE,
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ImageModal, {
												animated: !!isVideo,
												src: urlData.src || urlData.file,
												original: urlData.file,
												width: isVideo ? this.videoWidth : this.width,
												height: isVideo ? this.videoHeight : this.height,
												className: BDFDB.disCN.imagemodalimage,
												shouldAnimate: true,
												renderLinkComponent: props => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, props),
												children: !isVideo ? null : (videoData => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Video, {
													src: urlData.src || urlData.file,
													width: videoData.size.width,
													height: videoData.size.height,
													naturalWidth: this.videoWidth,
													naturalHeight: this.videoHeight,
													play: true
												}))
											})
										}), true);
									});
								});
								img.src = urlData.file;
							}
						}),
						!this.isValid(urlData.file, "copyable") ? null : BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_copy.replace("{{var0}}", type),
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-file"),
							action: _ => this.copyFile(urlData.file)
						}),
						BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_saveas.replace("{{var0}}", type),
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "download-file-as"),
							action: _ => this.downloadFileAs(urlData.file, urlData.src, urlData.alternativeName),
							children: locations.length && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
								children: locations.map((name, i) => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
									id: BDFDB.ContextMenuUtils.createItemId(this.name, "download", name, i),
									label: name,
									action: _ => this.downloadFile(urlData.file, ownLocations[name].location, urlData.src, urlData.alternativeName)
								}))
							})
						}),
						!this.isValid(urlData.file, "searchable") ? null : engineKeys.length == 1 ? BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_searchwith.replace("{{var0}}", type).replace("...", this.defaults.engines[engineKeys[0]].name),
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "single-search"),
							persisting: true,
							action: event => {
								if (!event.shiftKey) BDFDB.ContextMenuUtils.close(instance);
								BDFDB.DiscordUtils.openLink(this.defaults.engines[engineKeys[0]].url.replace(imgUrlReplaceString, encodeURIComponent(urlData.file)), {
									minimized: event.shiftKey
								});
							}
						}) : BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_searchwith.replace("{{var0}}", type),
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "submenu-search"),
							children: !engineKeys.length ? BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								label: this.labels.submenu_disabled,
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "disabled"),
								disabled: true
							}) : Object.keys(enabledEngines).map(key => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								label: this.defaults.engines[key].name,
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "search", key),
								color: key == "_all" ? BDFDB.LibraryComponents.MenuItems.Colors.DANGER : BDFDB.LibraryComponents.MenuItems.Colors.DEFAULT,
								persisting: true,
								action: event => {
									const open = (url, k) => BDFDB.DiscordUtils.openLink(this.defaults.engines[k].url.replace(imgUrlReplaceString, this.defaults.engines[k].raw ? url : encodeURIComponent(url)), {minimized: event.shiftKey});
									if (!event.shiftKey) BDFDB.ContextMenuUtils.close(instance);
									if (key == "_all") {
										for (let key2 in enginesWithoutAll) open(urlData.file, key2);
									}
									else open(urlData.file, key);
								}
							}))
						})
					].filter(n => n)
				});
			}

			processImageModal (e) {
				if (clickedImage) e.instance.props.cachedImage = clickedImage;
				let url = this.getImageSrc(e.instance.props.cachedImage && e.instance.props.cachedImage.src ? e.instance.props.cachedImage : e.instance.props.src);
				url = this.getImageSrc(typeof e.instance.props.children == "function" && e.instance.props.children(Object.assign({}, e.instance.props, {size: e.instance.props})).props.src) || url;
				let isVideo = this.isValid(url, "video");
				let messages = this.getMessageGroupOfImage(url);
				if (e.returnvalue) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.downloadlink]]});
					if (index > -1) {
						let type = isVideo ? BDFDB.LanguageUtils.LanguageStrings.VIDEO : BDFDB.LanguageUtils.LanguageStrings.IMAGE;
						let openContext = event => {
							BDFDB.ContextMenuUtils.open(this, event, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
								children: Object.keys(this.defaults.zoomSettings).map(type => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuSliderItem, Object.assign({
									id: BDFDB.ContextMenuUtils.createItemId(this.name, type),
									value: this.settings.zoomSettings[type],
									renderLabel: value => {
										return (this.labels[this.defaults.zoomSettings[type].label] || BDFDB.LanguageUtils.LanguageStrings[this.defaults.zoomSettings[type].label]) + ": " + value + this.defaults.zoomSettings[type].unit;
									},
									onValueRender: value => {
										return value + this.defaults.zoomSettings[type].unit;
									},
									onValueChange: value => {
										this.settings.zoomSettings[type] = value;
										BDFDB.DataUtils.save(this.settings.zoomSettings, this, "zoomSettings");
									}
								}, BDFDB.ObjectUtils.extract(this.defaults.zoomSettings[type], "digits", "minValue", "maxValue"))))
							}));
						};
						children[index] = BDFDB.ReactUtils.createElement("span", {
							className: BDFDB.disCN._imageutilitiesoperations,
							children: [
								children[index],
								this.settings.general.enableSaveImg && [
									BDFDB.ReactUtils.createElement("span", {
										className: BDFDB.disCN.downloadlink,
										children: "|",
										style: {margin: "0 5px"}
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
										className: BDFDB.disCN.downloadlink, 
										children: this.labels.context_saveas.replace("{{var0}}", type),
										onClick: event => {
											BDFDB.ListenerUtils.stopEvent(event);
											this.downloadFileAs(url);
										},
										onContextMenu: event => {
											let locations = Object.keys(ownLocations).filter(n => ownLocations[n].enabled);
											if (locations.length) BDFDB.ContextMenuUtils.open(this, event, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
												children: locations.map((name, i) => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
													id: BDFDB.ContextMenuUtils.createItemId(this.name, "download", name, i),
													label: name,
													action: _ => this.downloadFile(url, ownLocations[name].location)
												}))
											}));
										}
									})
								],
								this.settings.general.enableCopyImg && this.isValid(url, "copyable") && [
									BDFDB.ReactUtils.createElement("span", {
										className: BDFDB.disCN.downloadlink,
										children: "|",
										style: {margin: "0 5px"}
									}),
									BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
										className: BDFDB.disCN.downloadlink, 
										children: this.labels.context_copy.replace("{{var0}}", type),
										onClick: event => {
											BDFDB.ListenerUtils.stopEvent(event);
											this.copyFile(url);
										}
									})
								],
								this.settings.general.enableZoom && !isVideo && [
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
					if (this.settings.general.addDetails) e.returnvalue.props.children.push(BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._imageutilitiesdetailswrapper,
						children: [
							{label: "Source", text: url},
							{label: "Size", text: `${e.instance.props.width}x${e.instance.props.height}px`},
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
						modal.className = BDFDB.DOMUtils.formatClassName(modal.className, messages.length && BDFDB.disCN._imageutilitiesgallery, this.settings.general.addDetails && BDFDB.disCN._imageutilitiesdetailsadded);
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
					let isVideo = (typeof e.instance.props.children == "function" && e.instance.props.children(Object.assign({}, e.instance.props, {size: e.instance.props})) || {type: {}}).type.displayName == "Video";
					if (this.settings.general.enableZoom && !isVideo && !BDFDB.DOMUtils.containsClass(e.node.parentElement, BDFDB.disCN._imageutilitiessibling) && BDFDB.ReactUtils.findOwner(BDFDB.ReactUtils.getInstance(e.node), {name: "ImageModal", up: true})) {
						e.node.addEventListener("mousedown", event => {
							if (event.which != 1) return;
							BDFDB.ListenerUtils.stopEvent(event);

							let vanishObserver;
							
							let imgRects = BDFDB.DOMUtils.getRects(e.node.firstElementChild);

							let lens = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN._imageutilitieslense}" style="border-radius: 50% !important; pointer-events: none !important; z-index: 10000 !important; width: ${this.settings.zoomSettings.lensSize}px !important; height: ${this.settings.zoomSettings.lensSize}px !important; position: fixed !important;"><div style="position: absolute !important; top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important;"><${e.node.firstElementChild.tagName} src="${e.instance.props.src}" style="width: ${imgRects.width * this.settings.zoomSettings.zoomLevel}px; height: ${imgRects.height * this.settings.zoomSettings.zoomLevel}px; position: fixed !important;${this.settings.general.pixelZoom ? " image-rendering: pixelated !important;" : ""}"${e.node.firstElementChild.tagName == "VIDEO" ? " loop autoplay" : ""}></${e.node.firstElementChild.tagName}></div></div>`);
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
								lens.style.setProperty("width", this.settings.zoomSettings.lensSize + "px", "important");
								lens.style.setProperty("height", this.settings.zoomSettings.lensSize + "px", "important");
								lens.style.setProperty("clip-path", `circle(${(this.settings.zoomSettings.lensSize/2) + 2}px at center)`, "important");
								lens.firstElementChild.style.setProperty("clip-path", `circle(${this.settings.zoomSettings.lensSize/2}px at center)`, "important");
								pane.style.setProperty("left", imgRects.left + ((this.settings.zoomSettings.zoomLevel - 1) * (imgRects.left - x - halfW)) + "px", "important");
								pane.style.setProperty("top", imgRects.top + ((this.settings.zoomSettings.zoomLevel - 1) * (imgRects.top - y - halfH)) + "px", "important");
								pane.style.setProperty("width", imgRects.width * this.settings.zoomSettings.zoomLevel + "px", "important");
								pane.style.setProperty("height", imgRects.height * this.settings.zoomSettings.zoomLevel + "px", "important");
							};
							lens.update();
							
							e.node.style.setProperty("pointer-events", "none", "important");

							let dragging = event2 => {
								event = event2;
								lens.update();
							};
							let releasing = _ => {
								e.node.style.removeProperty("pointer-events");
								this.cleanupListeners("Zoom");
								document.removeEventListener("mousemove", dragging);
								document.removeEventListener("mouseup", releasing);
								if (vanishObserver) vanishObserver.disconnect();
								BDFDB.DOMUtils.remove(lens, backdrop);
								BDFDB.DataUtils.save(this.settings.zoomSettings, this, "zoomSettings");
							};
							document.addEventListener("mousemove", dragging);
							document.addEventListener("mouseup", releasing);
							
							this.cleanupListeners("Zoom");
							document.wheelImageUtilitiesZoomListener = event2 => {
								if (!document.contains(e.node)) this.cleanupListeners("Zoom");
								else {
									if (event2.deltaY < 0 && (this.settings.zoomSettings.zoomLevel + 0.1) <= this.defaults.zoomSettings.zoomLevel.maxValue) {
										this.settings.zoomSettings.zoomLevel += 0.1;
										lens.update();
									}
									else if (event2.deltaY > 0 && (this.settings.zoomSettings.zoomLevel - 0.1) >= this.defaults.zoomSettings.zoomLevel.minValue) {
										this.settings.zoomSettings.zoomLevel -= 0.1;
										lens.update();
									}
								}
							};
							document.keydownImageUtilitiesZoomListener = event2 => {
								if (!document.contains(e.node)) this.cleanupListeners("Zoom");
								else if (!firedEvents.includes("Zoom")) {
									firedEvents.push("Zoom");
									if (event2.keyCode == 187 && (this.settings.zoomSettings.zoomLevel + 0.5) <= this.defaults.zoomSettings.zoomLevel.maxValue) {
										this.settings.zoomSettings.zoomLevel += 0.5;
										lens.update();
									}
									else if (event2.keyCode == 189 && (this.settings.zoomSettings.zoomLevel - 0.5) >= this.defaults.zoomSettings.zoomLevel.minValue) {
										this.settings.zoomSettings.zoomLevel -= 0.5;
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
							
							vanishObserver = new MutationObserver(changes => {if (!document.contains(e.node)) releasing();});
							vanishObserver.observe(appMount, {childList: true, subtree: true});
						});
					}
				}
				else if (e.returnvalue) {
					if (this.settings.general.showOnHover && e.instance.props.original && e.instance.props.src.indexOf("https://media.discordapp.net/attachments") == 0 && typeof e.returnvalue.props.children == "function") {
						let attachment = BDFDB.ReactUtils.findValue(e.instance, "attachment", {up: true});
						if (attachment) {
							let renderChildren = e.returnvalue.props.children;
							e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
								return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
									text: `${attachment.filename}\n${BDFDB.NumberUtils.formatBytes(attachment.size)}\n${attachment.width}x${attachment.height}px`,
									tooltipConfig: {
										type: "right",
										delay: this.settings.amounts.hoverDelay
									},
									children: renderChildren(...args)
								});
							}, "", this);
						}
					}
				}
				else {
					if (this.settings.general.resizeImage && BDFDB.ReactUtils.findOwner(BDFDB.ObjectUtils.get(e, `instance.${BDFDB.ReactUtils.instanceKey}`), {name: "ImageModal", up: true})) {
						let data = this.settings.general.enableGallery ? this.getSiblingsAndPosition(e.instance.props.src, this.getMessageGroupOfImage(e.instance.props.src)) : {};
						let aRects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount));
						let ratio = Math.min((aRects.width * (data.previous || data.next ? 0.8 : 1) - 20) / e.instance.props.width, (aRects.height - (this.settings.general.addDetails ? 310 : 100)) / e.instance.props.height);
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
			
			processUserBanner (e) {
				let banner = e.instance.props.user && this.settings.places.userAvatars && BDFDB.UserUtils.getBanner(e.instance.props.user.id);
				if (banner) e.returnvalue.props.onContextMenu = event => {
					let validUrls = this.filterUrls((e.instance.props.user.getBannerURL(4096) || banner).replace(/\.webp|\.gif/, ".png"), BDFDB.LibraryModules.IconUtils.isAnimatedIconHash(e.instance.props.user.banner) && e.instance.props.user.getBannerURL(4096, true));
					if (validUrls.length) BDFDB.ContextMenuUtils.open(this, event, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: validUrls.length == 1 ? this.createSubMenus({}, validUrls) : BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.IMAGE + " " + BDFDB.LanguageUtils.LanguageStrings.ACTIONS,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "main-subitem"),
							children: this.createSubMenus({}, validUrls)
						})
					}));
				};
			}
			
			downloadFile (url, path, fallbackUrl, alternativeName) {
				url = url.startsWith("/assets") ? (window.location.origin + url) : url;
				BDFDB.LibraryRequires.request(url, {encoding: null}, (error, response, body) => {
					let type = this.isValid(url, "video") ? BDFDB.LanguageUtils.LanguageStrings.VIDEO : BDFDB.LanguageUtils.LanguageStrings.IMAGE;
					if (error || response.statusCode != 200) {
						if (fallbackUrl) this.downloadFile(fallbackUrl, path, null, alternativeName);
						else BDFDB.NotificationUtils.toast(this.labels.toast_save_failed.replace("{{var0}}", type).replace("{{var1}}", ""), {type: "danger"});
					}
					else {
						BDFDB.LibraryRequires.fs.writeFile(this.getFileName(path, alternativeName || url.split("/").pop().split(".").slice(0, -1).join(".") || "unknown", response.headers["content-type"].split("/").pop().split("+")[0], 0), body, error => {
							if (error) BDFDB.NotificationUtils.toast(this.labels.toast_save_failed.replace("{{var0}}", type).replace("{{var1}}", path), {type: "danger"});
							else BDFDB.NotificationUtils.toast(this.labels.toast_save_success.replace("{{var0}}", type).replace("{{var1}}", path), {type: "success"});
						});
					}
				});
			}
			
			downloadFileAs (url, fallbackUrl, alternativeName) {
				url = url.startsWith("/assets") ? (window.location.origin + url) : url;
				BDFDB.LibraryRequires.request(url, {encoding: null}, (error, response, body) => {
					let type = this.isValid(url, "video") ? BDFDB.LanguageUtils.LanguageStrings.VIDEO : BDFDB.LanguageUtils.LanguageStrings.IMAGE;
					if (error || response.statusCode != 200) {
						if (fallbackUrl) this.downloadFileAs(fallbackUrl, null, alternativeName);
						else BDFDB.NotificationUtils.toast(this.labels.toast_save_failed.replace("{{var0}}", type).replace("{{var1}}", ""), {type: "danger"});
					}
					else {
						let hrefURL = window.URL.createObjectURL(new Blob([body]));
						let tempLink = document.createElement("a");
						tempLink.href = hrefURL;
						tempLink.download = `${alternativeName || url.split("/").pop().split(".").slice(0, -1).join(".") || "unknown"}.${response.headers["content-type"].split("/").pop().split("+")[0]}`;
						tempLink.click();
						window.URL.revokeObjectURL(hrefURL);
					}
				});
			}
			
			copyFile (url) {
				BDFDB.LibraryRequires.request(url, {encoding: null}, (error, response, body) => {
					let type = this.isValid(url, "video") ? BDFDB.LanguageUtils.LanguageStrings.VIDEO : BDFDB.LanguageUtils.LanguageStrings.IMAGE;
					if (error) BDFDB.NotificationUtils.toast(this.labels.toast_copy_failed.replace("{{var0}}", type), {type: "danger"});
					else if (body) {
						if (BDFDB.LibraryRequires.process.platform === "win32" || BDFDB.LibraryRequires.process.platform === "darwin") {
							BDFDB.LibraryRequires.electron.clipboard.write({image: BDFDB.LibraryRequires.electron.nativeImage.createFromBuffer(body)});
						}
						else {
							let file = BDFDB.LibraryRequires.path.join(BDFDB.LibraryRequires.process.env.USERPROFILE || BDFDB.LibraryRequires.process.env.HOMEPATH || BDFDB.LibraryRequires.process.env.HOME, "imageutilstempimg.png");
							BDFDB.LibraryRequires.fs.writeFileSync(file, body, {encoding: null});
							BDFDB.LibraryRequires.electron.clipboard.write({image: file});
							BDFDB.LibraryRequires.fs.unlinkSync(file);
						}
						BDFDB.NotificationUtils.toast(this.labels.toast_copy_success.replace("{{var0}}", type), {type: "success"});
					}
				});
			}
			
			getDownloadLocation () {
				if (downloadsFolder && BDFDB.LibraryRequires.fs.existsSync(downloadsFolder)) return downloadsFolder;
				let homePath = BDFDB.LibraryRequires.process.env.USERPROFILE || BDFDB.LibraryRequires.process.env.HOMEPATH || BDFDB.LibraryRequires.process.env.HOME;
				let downloadPath = homePath && BDFDB.LibraryRequires.path.join(homePath, "Downloads");
				if (downloadPath && BDFDB.LibraryRequires.fs.existsSync(downloadPath)) return downloadsFolder = downloadPath;
				else {
					downloadsFolder = BDFDB.LibraryRequires.path.join(BDFDB.BDUtils.getPluginsFolder(), "downloads");
					if (!BDFDB.LibraryRequires.fs.existsSync(downloadsFolder)) BDFDB.LibraryRequires.fs.mkdirSync(downloadsFolder);
					return downloadsFolder;
				}
			}
			
			getFileName (path, fileName, extension, i) {
				let wholePath = BDFDB.LibraryRequires.path.join(path, i ? `${fileName} (${i}).${extension}` : `${fileName}.${extension}`);
				if (BDFDB.LibraryRequires.fs.existsSync(wholePath)) return this.getFileName(path, fileName, extension, i + 1);
				else return wholePath;
			}

			getMessageGroupOfImage (src) {
				if (src && this.settings.general.enableGallery) for (let message of document.querySelectorAll(BDFDB.dotCN.messagelistitem)) for (let img of message.querySelectorAll(BDFDB.dotCNS.imagewrapper + "img")) if (this.isSameImage(src, img)) {
					let previousSiblings = [], nextSiblings = [];
					let previousSibling = message.previousSibling, nextSibling = message.nextSibling;
					if (!BDFDB.DOMUtils.containsClass(message.firstElementChild, BDFDB.disCN.messagegroupstart)) while (previousSibling) {
						previousSiblings.push(previousSibling);
						if (BDFDB.DOMUtils.containsClass(previousSibling.firstElementChild, BDFDB.disCN.messagegroupstart)) previousSibling = null;
						else previousSibling = previousSibling.previousSibling;
					}
					while (nextSibling) {
						if (!BDFDB.DOMUtils.containsClass(nextSibling.firstElementChild, BDFDB.disCN.messagegroupstart)) {
							nextSiblings.push(nextSibling);
							nextSibling = nextSibling.nextSibling;
						}
						else nextSibling = null;
					}
					return [].concat(previousSiblings.reverse(), message, nextSiblings).filter(n => n && BDFDB.DOMUtils.containsClass(n, BDFDB.disCN.messagelistitem));
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
					onClick: _ => this.switchImages(instance, type),
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
					case "bg":		// Bulgarian
						return {
							context_copy:						"Копирайте {{var0}}",
							context_lenssize:					"Размер на обектива",
							context_saveas:						"Запазете {{var0}} като ...",
							context_searchwith:					"Търсете {{var0}} с ...",
							context_view:						"Преглед {{var0}}",
							submenu_disabled:					"Всички инвалиди",
							toast_copy_failed:					"{{var0}} не можа да бъде копиран в клипборда",
							toast_copy_success:					"{{var0}} беше копиран в клипборда",
							toast_save_failed:					"{{var0}} не можа да бъде запазен в '{{var1}}'",
							toast_save_success:					"{{var0}} бе запазено в '{{var1}}'"
						};
					case "cs":		// Czech
						return {
							context_copy:						"Zkopírovat {{var0}}",
							context_lenssize:					"Velikost lupy",
							context_saveas:						"Uložit {{var0}} jako...",
							context_searchwith:					"Hledat {{var0}} pomocí...",
							context_view:						"Zobrazit {{var0}}",
							submenu_disabled:					"Vše zakázáno",
							toast_copy_failed:					"{{var0}} nemohl být zkopírován do schránky",
							toast_copy_success:					"{{var0}} byl zkopírován do schránky",
							toast_save_failed:					"{{var0}} nemohl být uložen do '{{var1}}'",
							toast_save_success:					"{{var0}} bylo uložen do '{{var1}}'"
						};
					case "da":		// Danish
						return {
							context_copy:						"Kopiér {{var0}}",
							context_lenssize:					"Objektivstørrelse",
							context_saveas:						"Gem {{var0}} som ...",
							context_searchwith:					"Søg i {{var0}} med ...",
							context_view:						"Se {{var0}}",
							submenu_disabled:					"Alle handicappede",
							toast_copy_failed:					"{{var0}} kunne ikke kopieres til udklipsholderen",
							toast_copy_success:					"{{var0}} blev kopieret til udklipsholderen",
							toast_save_failed:					"{{var0}} kunne ikke gemmes i '{{var1}}'",
							toast_save_success:					"{{var0}} blev gemt i '{{var1}}'"
						};
					case "de":		// German
						return {
							context_copy:						"{{var0}} kopieren",
							context_lenssize:					"Linsengröße",
							context_saveas:						"{{var0}} speichern als ...",
							context_searchwith:					"{{var0}} suchen mit ...",
							context_view:						"{{var0}} ansehen",
							submenu_disabled:					"Alle deaktiviert",
							toast_copy_failed:					"{{var0}} konnte nicht in die Zwischenablage kopiert werden",
							toast_copy_success:					"{{var0}} wurde in die Zwischenablage kopiert",
							toast_save_failed:					"{{var0}} konnte nicht in '{{var1}}' gespeichert werden",
							toast_save_success:					"{{var0}} wurde in '{{var1}}' gespeichert"
						};
					case "el":		// Greek
						return {
							context_copy:						"Αντιγραφή {{var0}}",
							context_lenssize:					"Μέγεθος φακού",
							context_saveas:						"Αποθήκευση {{var0}} ως ...",
							context_searchwith:					"Αναζήτηση {{var0}} με ...",
							context_view:						"Προβολή {{var0}}",
							submenu_disabled:					"Όλα τα άτομα με ειδικές ανάγκες",
							toast_copy_failed:					"Δεν ήταν δυνατή η αντιγραφή του {{var0}} στο πρόχειρο",
							toast_copy_success:					"Το {{var0}} αντιγράφηκε στο πρόχειρο",
							toast_save_failed:					"Δεν ήταν δυνατή η αποθήκευση του {{var0}} στο '{{var1}}'",
							toast_save_success:					"Το {{var0}} αποθηκεύτηκε στο '{{var1}}'"
						};
					case "es":		// Spanish
						return {
							context_copy:						"Copiar {{var0}}",
							context_lenssize:					"Tamaño de la lente",
							context_saveas:						"Guardar {{var0}} como ...",
							context_searchwith:					"Buscar {{var0}} con ...",
							context_view:						"Ver {{var0}}",
							submenu_disabled:					"Todos discapacitados",
							toast_copy_failed:					"{{var0}} no se pudo copiar al portapapeles",
							toast_copy_success:					"{{var0}} se copió en el portapapeles",
							toast_save_failed:					"{{var0}} no se pudo guardar en '{{var1}}'",
							toast_save_success:					"{{var0}} se guardó en '{{var1}}'"
						};
					case "fi":		// Finnish
						return {
							context_copy:						"Kopioi {{var0}}",
							context_lenssize:					"Linssin koko",
							context_saveas:						"Tallenna {{var0}} nimellä ...",
							context_searchwith:					"Tee haku {{var0}} ...",
							context_view:						"Näytä {{var0}}",
							submenu_disabled:					"Kaikki vammaiset",
							toast_copy_failed:					"Kohdetta {{var0}} ei voitu kopioida leikepöydälle",
							toast_copy_success:					"{{var0}} kopioitiin leikepöydälle",
							toast_save_failed:					"Kohdetta {{var0}} ei voitu tallentaa kansioon '{{var1}}'",
							toast_save_success:					"{{var0}} tallennettiin kansioon '{{var1}}'"
						};
					case "fr":		// French
						return {
							context_copy:						"Copier {{var0}}",
							context_lenssize:					"Taille de l'objectif",
							context_saveas:						"Enregistrer {{var0}} sous ...",
							context_searchwith:					"Rechercher {{var0}} avec ...",
							context_view:						"Afficher {{var0}}",
							submenu_disabled:					"Tout désactivé",
							toast_copy_failed:					"{{var0}} n'a pas pu être copié dans le presse-papiers",
							toast_copy_success:					"{{var0}} a été copié dans le presse-papiers",
							toast_save_failed:					"{{var0}} n'a pas pu être enregistré dans '{{var1}}'",
							toast_save_success:					"{{var0}} a été enregistré dans '{{var1}}'"
						};
					case "hi":		// Hindi
						return {
							context_copy:						"कॉपी {{var0}}",
							context_lenssize:					"लेंस का आकार",
							context_saveas:						"{{var0}} को इस रूप में सेव करें...",
							context_searchwith:					"इसके साथ {{var0}} खोजें ...",
							context_view:						"देखें {{var0}}",
							submenu_disabled:					"सभी अक्षम",
							toast_copy_failed:					"{{var0}} को क्लिपबोर्ड पर कॉपी नहीं किया जा सका",
							toast_copy_success:					"{{var0}} को क्लिपबोर्ड पर कॉपी किया गया था",
							toast_save_failed:					"{{var0}} '{{var1}}' में सहेजा नहीं जा सका",
							toast_save_success:					"{{var0}} '{{var1}}' में सहेजा गया था"
						};
					case "hr":		// Croatian
						return {
							context_copy:						"Kopiraj {{var0}}",
							context_lenssize:					"Veličina leće",
							context_saveas:						"Spremi {{var0}} kao ...",
							context_searchwith:					"Traži {{var0}} sa ...",
							context_view:						"Pogledajte {{var0}}",
							submenu_disabled:					"Svi invalidi",
							toast_copy_failed:					"{{var0}} nije moguće kopirati u međuspremnik",
							toast_copy_success:					"{{var0}} je kopirano u međuspremnik",
							toast_save_failed:					"{{var0}} nije moguće spremiti u '{{var1}}'",
							toast_save_success:					"{{var0}} spremljeno je u '{{var1}}'"
						};
					case "hu":		// Hungarian
						return {
							context_copy:						"{{var0}} másolása",
							context_lenssize:					"Lencse mérete",
							context_saveas:						"{{var0}} mentése másként ...",
							context_searchwith:					"Keresés a következőben: {{var0}} a következővel:",
							context_view:						"Megtekintés: {{var0}}",
							submenu_disabled:					"Minden fogyatékkal él",
							toast_copy_failed:					"A {{var0}} fájl nem másolható a vágólapra",
							toast_copy_success:					"A {{var0}} elemet a vágólapra másolta",
							toast_save_failed:					"A {{var0}} fájl mentése nem sikerült a '{{var1}}' mappába",
							toast_save_success:					"{{var0}} mentve a '{{var1}}' mappába"
						};
					case "it":		// Italian
						return {
							context_copy:						"Copia {{var0}}",
							context_lenssize:					"Dimensione della lente",
							context_saveas:						"Salva {{var0}} come ...",
							context_searchwith:					"Cerca {{var0}} con ...",
							context_view:						"Visualizza {{var0}}",
							submenu_disabled:					"Tutti disabilitati",
							toast_copy_failed:					"{{var0}} non può essere copiato negli appunti",
							toast_copy_success:					"{{var0}} è stato copiato negli appunti",
							toast_save_failed:					"Impossibile salvare {{var0}} in '{{var1}}'",
							toast_save_success:					"{{var0}} è stato salvato in '{{var1}}'"
						};
					case "ja":		// Japanese
						return {
							context_copy:						"{{var0}} をコピーします",
							context_lenssize:					"レンズサイズ",
							context_saveas:						"{{var0}} を...として保存します",
							context_searchwith:					"{{var0}} を...で検索",
							context_view:						"{{var0}} を表示",
							submenu_disabled:					"すべて無効",
							toast_copy_failed:					"{{var0}} をクリップボードにコピーできませんでした",
							toast_copy_success:					"{{var0}} がクリップボードにコピーされました",
							toast_save_failed:					"{{var0}} を「'{{var1}}'」に保存できませんでした",
							toast_save_success:					"{{var0}} は「'{{var1}}'」に保存されました"
						};
					case "ko":		// Korean
						return {
							context_copy:						"{{var0}} 복사",
							context_lenssize:					"렌즈 크기",
							context_saveas:						"{{var0}} 을 다른 이름으로 저장 ...",
							context_searchwith:					"{{var0}} 검색 ...",
							context_view:						"{{var0}} 보기",
							submenu_disabled:					"모두 비활성화 됨",
							toast_copy_failed:					"{{var0}} 을 클립 보드에 복사 할 수 없습니다.",
							toast_copy_success:					"{{var0}} 이 클립 보드에 복사되었습니다.",
							toast_save_failed:					"{{var0}} 을 '{{var1}}'에 저장할 수 없습니다.",
							toast_save_success:					"{{var0}} 이 '{{var1}}'에 저장되었습니다."
						};
					case "lt":		// Lithuanian
						return {
							context_copy:						"Kopijuoti {{var0}}",
							context_lenssize:					"Objektyvo dydis",
							context_saveas:						"Išsaugoti '{{var0}}' kaip ...",
							context_searchwith:					"Ieškoti {{var0}} naudojant ...",
							context_view:						"Žiūrėti {{var0}}",
							submenu_disabled:					"Visi neįgalūs",
							toast_copy_failed:					"{{var0}} nepavyko nukopijuoti į mainų sritį",
							toast_copy_success:					"{{var0}} buvo nukopijuota į mainų sritį",
							toast_save_failed:					"Nepavyko išsaugoti {{var0}} aplanke '{{var1}}'",
							toast_save_success:					"{{var0}} išsaugotas aplanke '{{var1}}'"
						};
					case "nl":		// Dutch
						return {
							context_copy:						"Kopieer {{var0}}",
							context_lenssize:					"Lens Maat",
							context_saveas:						"Bewaar {{var0}} als ...",
							context_searchwith:					"Zoek {{var0}} met ...",
							context_view:						"Bekijk {{var0}}",
							submenu_disabled:					"Allemaal uitgeschakeld",
							toast_copy_failed:					"{{var0}} kan niet naar het klembord worden gekopieerd",
							toast_copy_success:					"{{var0}} is naar het klembord gekopieerd",
							toast_save_failed:					"{{var0}} kan niet worden opgeslagen in '{{var1}}'",
							toast_save_success:					"{{var0}} is opgeslagen in '{{var1}}'"
						};
					case "no":		// Norwegian
						return {
							context_copy:						"Kopier {{var0}}",
							context_lenssize:					"Linsestørrelse",
							context_saveas:						"Lagre {{var0}} som ...",
							context_searchwith:					"Søk på {{var0}} med ...",
							context_view:						"Vis {{var0}}",
							submenu_disabled:					"Alle funksjonshemmede",
							toast_copy_failed:					"{{var0}} kunne ikke kopieres til utklippstavlen",
							toast_copy_success:					"{{var0}} ble kopiert til utklippstavlen",
							toast_save_failed:					"{{var0}} kunne ikke lagres i '{{var1}}'",
							toast_save_success:					"{{var0}} ble lagret i '{{var1}}'"
						};
					case "pl":		// Polish
						return {
							context_copy:						"Kopiuj {{var0}}",
							context_lenssize:					"Rozmiar soczewki",
							context_saveas:						"Zapisz {{var0}} jako ...",
							context_searchwith:					"Wyszukaj {{var0}} za pomocą ...",
							context_view:						"Wyświetl {{var0}}",
							submenu_disabled:					"Wszystkie wyłączone",
							toast_copy_failed:					"Nie można skopiować {{var0}} do schowka",
							toast_copy_success:					"{{var0}} został skopiowany do schowka",
							toast_save_failed:					"Nie można zapisać {{var0}} w '{{var1}}'",
							toast_save_success:					"{{var0}} został zapisany w '{{var1}}'"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							context_copy:						"Copiar {{var0}}",
							context_lenssize:					"Tamanho da lente",
							context_saveas:						"Salve {{var0}} como ...",
							context_searchwith:					"Pesquise {{var0}} com ...",
							context_view:						"Veja {{var0}}",
							submenu_disabled:					"Todos desativados",
							toast_copy_failed:					"{{var0}} não pôde ser copiado para a área de transferência",
							toast_copy_success:					"{{var0}} foi copiado para a área de transferência",
							toast_save_failed:					"{{var0}} não pôde ser salvo em '{{var1}}'",
							toast_save_success:					"{{var0}} foi salvo em '{{var1}}'"
						};
					case "ro":		// Romanian
						return {
							context_copy:						"Copiați {{var0}}",
							context_lenssize:					"Dimensiunea obiectivului",
							context_saveas:						"Salvați {{var0}} ca ...",
							context_searchwith:					"Căutați {{var0}} cu ...",
							context_view:						"Vizualizați {{var0}}",
							submenu_disabled:					"Toate sunt dezactivate",
							toast_copy_failed:					"{{var0}} nu a putut fi copiat în clipboard",
							toast_copy_success:					"{{var0}} a fost copiat în clipboard",
							toast_save_failed:					"{{var0}} nu a putut fi salvat în '{{var1}}'",
							toast_save_success:					"{{var0}} a fost salvat în '{{var1}}'"
						};
					case "ru":		// Russian
						return {
							context_copy:						"Скопируйте {{var0}}",
							context_lenssize:					"Размер линзы",
							context_saveas:						"Сохранить {{var0}} как ...",
							context_searchwith:					"Искать {{var0}} с помощью ...",
							context_view:						"Посмотреть {{var0}}",
							submenu_disabled:					"Все отключены",
							toast_copy_failed:					"{{var0}} не удалось скопировать в буфер обмена",
							toast_copy_success:					"{{var0}} скопирован в буфер обмена",
							toast_save_failed:					"{{var0}} не удалось сохранить в '{{var1}}'",
							toast_save_success:					"{{var0}} был сохранен в '{{var1}}'"
						};
					case "sv":		// Swedish
						return {
							context_copy:						"Kopiera {{var0}}",
							context_lenssize:					"Linsstorlek",
							context_saveas:						"Spara {{var0}} som ...",
							context_searchwith:					"Sök {{var0}} med ...",
							context_view:						"Visa {{var0}}",
							submenu_disabled:					"Alla funktionshindrade",
							toast_copy_failed:					"{{var0}} kunde inte kopieras till Urklipp",
							toast_copy_success:					"{{var0}} kopierades till Urklipp",
							toast_save_failed:					"{{var0}} kunde inte sparas i '{{var1}}'",
							toast_save_success:					"{{var0}} sparades i '{{var1}}'"
						};
					case "th":		// Thai
						return {
							context_copy:						"คัดลอก{{var0}}",
							context_lenssize:					"ขนาดเลนส์",
							context_saveas:						"บันทึก{{var0}}เป็น ...",
							context_searchwith:					"ค้นหา{{var0}} ้วย ...",
							context_view:						"ดู{{var0}}",
							submenu_disabled:					"ปิดใช้งานทั้งหมด",
							toast_copy_failed:					"ไม่สามารถคัดลอก{{var0}}ไปยังคลิปบอร์ดได้",
							toast_copy_success:					"คัดลอก{{var0}}ไปยังคลิปบอร์ดแล้ว",
							toast_save_failed:					"ไม่สามารถบันทึก{{var0}}ใน '{{var1}}'",
							toast_save_success:					"{{var0}} ูกบันทึกใน '{{var1}}'"
						};
					case "tr":		// Turkish
						return {
							context_copy:						"{{var0}} kopyala",
							context_lenssize:					"Lens Boyutu",
							context_saveas:						"{{var0}} farklı kaydet ...",
							context_searchwith:					"{{var0}} şununla ara ...",
							context_view:						"{{var0}} görüntüle",
							submenu_disabled:					"Hepsi devre dışı",
							toast_copy_failed:					"{{var0}} panoya kopyalanamadı",
							toast_copy_success:					"{{var0}} panoya kopyalandı",
							toast_save_failed:					"{{var0}}, '{{var1}}' konumuna kaydedilemedi",
							toast_save_success:					"{{var0}}, '{{var1}}' konumuna kaydedildi"
						};
					case "uk":		// Ukrainian
						return {
							context_copy:						"Копіювати {{var0}}",
							context_lenssize:					"Розмір лінзи",
							context_saveas:						"Збережіть {{var0}} як ...",
							context_searchwith:					"Шукати {{var0}} за допомогою ...",
							context_view:						"Переглянути {{var0}}",
							submenu_disabled:					"Всі інваліди",
							toast_copy_failed:					"Не вдалося скопіювати {{var0}} у буфер обміну",
							toast_copy_success:					"{{var0}} скопійовано в буфер обміну",
							toast_save_failed:					"Не вдалося зберегти {{var0}} у '{{var1}}'",
							toast_save_success:					"{{var0}} було збережено у '{{var1}}'"
						};
					case "vi":		// Vietnamese
						return {
							context_copy:						"Sao chép {{var0}}",
							context_lenssize:					"Kích thước ống kính",
							context_saveas:						"Lưu {{var0}} dưới dạng ...",
							context_searchwith:					"Tìm kiếm {{var0}} bằng ...",
							context_view:						"Xem {{var0}}",
							submenu_disabled:					"Tất cả đã bị vô hiệu hóa",
							toast_copy_failed:					"Không thể sao chép {{var0}} vào khay nhớ tạm",
							toast_copy_success:					"{{var0}} đã được sao chép vào khay nhớ tạm",
							toast_save_failed:					"Không thể lưu {{var0}} trong '{{var1}}'",
							toast_save_success:					"{{var0}} đã được lưu trong '{{var1}}'"
						};
					case "zh-CN":	// Chinese (China)
						return {
							context_copy:						"复制 {{var0}}",
							context_lenssize:					"镜片尺寸",
							context_saveas:						"将 {{var0}} 另存为 ...",
							context_searchwith:					"用搜索 {{var0}} ...",
							context_view:						"查看 {{var0}}",
							submenu_disabled:					"全部禁用",
							toast_copy_failed:					"{{var0}} 无法复制到剪贴板",
							toast_copy_success:					"{{var0}} 已复制到剪贴板",
							toast_save_failed:					"{{var0}} 无法保存在'{{var1}}'中",
							toast_save_success:					"{{var0}} 已保存在'{{var1}}'中"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							context_copy:						"複製 {{var0}}",
							context_lenssize:					"鏡片尺寸",
							context_saveas:						"將 {{var0}} 另存為 ...",
							context_searchwith:					"用搜索 {{var0}} ...",
							context_view:						"查看 {{var0}}",
							submenu_disabled:					"全部禁用",
							toast_copy_failed:					"{{var0}} 無法複製到剪貼板",
							toast_copy_success:					"{{var0}} 已復製到剪貼板",
							toast_save_failed:					"{{var0}} 無法保存在'{{var1}}'中",
							toast_save_success:					"{{var0}} 已保存在'{{var1}}'中"
						};
					default:		// English
						return {
							context_copy:						"Copy {{var0}}",
							context_lenssize:					"Lens Size",
							context_saveas:						"Save {{var0}} as ...",
							context_searchwith:					"Search {{var0}} with ...",
							context_view:						"View {{var0}}",
							submenu_disabled:					"All disabled",
							toast_copy_failed:					"{{var0}} could not be copied to the Clipboard",
							toast_copy_success:					"{{var0}} was copied to the Clipboard",
							toast_save_failed:					"{{var0}} could not be saved in '{{var1}}'",
							toast_save_success:					"{{var0}} was saved in '{{var1}}'"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
