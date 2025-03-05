/**
 * @name ImageUtilities
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 5.5.5
 * @description Adds several Utilities for Images/Videos (Gallery, Download, Reverse Search, Zoom, Copy, etc.)
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ImageUtilities/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ImageUtilities/ImageUtilities.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		
	};
	
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js").then(r => {
				if (!r || r.status != 200) throw new Error();
				else return r.text();
			}).then(b => {
				if (!b) throw new Error();
				else return require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.UI.showToast("Finished downloading BDFDB Library", {type: "success"}));
			}).catch(error => {
				BdApi.UI.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.UI.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var _this;
		var firedEvents = [];
		var ownLocations = {}, downloadsFolder;
		
		var firstViewedImage, viewedImage, viewedImageTimeout;
		var switchedImageProps;
		var cachedImages;
		var eventTypes = {};
		
		const rescaleOptions = {
			NONE: "No Resize",
			ORIGINAL: "Resize to Original Size",
			WINDOW: "Resize to Window Size"
		};
		
		const fileTypes = {
			"3gp":		{copyable: false,	searchable: false,	gif: false,	video: true,	signs: [[0x66, 0x74, 0x79, 0x70, 0x33, 0x67]]},
			"avi":		{copyable: false,	searchable: false,	gif: false,	video: true,	signs: [[0x41, 0x56, 0x49, 0x20]]},
			"flv":		{copyable: false,	searchable: false,	gif: false,	video: true,	signs: [[0x46, 0x4C, 0x56]]},
			"jpeg":		{copyable: true,	searchable: true,	gif: false,	video: false,	signs: [[0xFF, 0xD8, 0xFF, 0xEE]]},
			"jpg":		{copyable: true,	searchable: true,	gif: false,	video: false,	signs: [[0xFF, 0xD8, 0xFF, 0xDB], [0xFF, 0xD8, 0xFF, 0xE0], [0xFF, 0xD8, 0xFF, 0xE1]]},
			"gif":		{copyable: false,	searchable: true,	gif: true,	video: false,	signs: [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]]},
			"mov":		{copyable: false,	searchable: false,	gif: false,	video: true,	signs: [[null, null, null, null, 0x6D, 0x6F, 0x6F, 0x76], [null, null, null, null, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20]]},
			"mp4":		{copyable: false,	searchable: false,	gif: false,	video: true,	signs: [[null, null, null, null, 0x66, 0x74, 0x79, 0x70]]},
			"mpeg-1":	{copyable: false,	searchable: false,	gif: false,	video: true,	signs: [[0x00, 0x00, 0x01, 0xBA]]},
			"mpeg-2":	{copyable: false,	searchable: false,	gif: false,	video: true,	signs: [[0x00, 0x00, 0x01, 0xB3]]},
			"ogg":		{copyable: false,	searchable: false,	gif: false,	video: true,	signs: [[0x4F, 0x67, 0x67, 0x53]]},
			"png":		{copyable: true,	searchable: true,	gif: false,	video: false,	signs: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]]},
			"svg":		{copyable: false,	searchable: false,	gif: false,	video: false,	signs: [[0x3C]]},
			"webm":		{copyable: false,	searchable: false,	gif: false,	video: true,	signs: [[0x1A, 0x45, 0xDF, 0xA3]]},
			"webp":		{copyable: false,	searchable: true,	gif: false,	video: false,	signs: [[0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50]]},
			"wmv":		{copyable: false,	searchable: false,	gif: false,	video: true,	signs: [[0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11], [0xA6, 0xD9, 0x00, 0xAA, 0x00, 0x62, 0xCE, 0x6C]]}
		};
		
		const LazyImageSiblingComponent = class LazyImageSibling extends BdApi.React.Component {
			render() {
				if (!this.props.loadedImage) {
					const instance = this;
					const imageThrowaway = document.createElement("img");
					imageThrowaway.addEventListener("load", function() {
						let aRects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount));
						let resizeX = (aRects.width/this.width) * 0.8, resizeY = (aRects.height/this.height) * 0.65
						let ratio = resizeX < resizeY ? resizeX : resizeY;
						instance.props.loadedImage = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.LazyImage, {
							src: imageThrowaway.src,
							width: this.width,
							height: this.height,
							maxWidth: this.width * ratio,
							maxHeight: this.height * ratio
						});
						BDFDB.ReactUtils.forceUpdate(instance);
					});
					imageThrowaway.src = !_this.isValid(this.props.url, "video") ? this.props.url : _this.getPosterUrl(this.props.url);
				}
				return BDFDB.ReactUtils.createElement("div", {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._imageutilitiessibling, this.props.className),
					onClick: event => {
						BDFDB.ListenerUtils.stopEvent(event);
						_this.switchImages(this.props.offset, _this.isValid(this.props.url, "video"));
					},
					children: [
						this.props.loadedImage || BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SpinnerComponents.Spinner, {
							type: BDFDB.LibraryComponents.SpinnerComponents.Types.WANDERING_CUBES
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.disCNS._imageutilitiesswitchicon + BDFDB.disCN.svgicon,
							name: this.props.svgIcon
						})
					]
				});
			}
		};
		
		const ImageDetailsComponent = class ImageDetails extends BdApi.React.Component {
			componentDidMount() {
				BDFDB.DOMUtils.addClass(BDFDB.DOMUtils.getParent(BDFDB.dotCN.imagemosaiconebyonegridsingle, BDFDB.ReactUtils.findDOMNode(this)), BDFDB.disCN._imageutilitiesimagedetailsadded);
				let item = BDFDB.ReactUtils.findValue(BDFDB.ObjectUtils.get(this, `${BDFDB.ReactUtils.instanceKey}.return`), "item", {up: true});
				if (item && item.originalItem) {
					this.props.attachment = item.originalItem;
					BDFDB.ReactUtils.forceUpdate(this);
				}
			}
			componentDidUpdate() {
				if ((!this.props.attachment || !this.props.attachment.size) && !this.props.loaded) {
					this.props.loaded = true;
					let item = BDFDB.ReactUtils.findValue(BDFDB.ObjectUtils.get(this, `${BDFDB.ReactUtils.instanceKey}.return`), "item", {up: true});
					if (item && item.originalItem) {
						this.props.attachment = item.originalItem;
						BDFDB.ReactUtils.forceUpdate(this);
					}
				}
			}
			render() {
				return !this.props.attachment ? null : BDFDB.ReactUtils.createElement("span", {
					className: BDFDB.disCN._imageutilitiesimagedetails,
					children: [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
							title: this.props.original,
							href: this.props.original,
							children: this.props.attachment.filename,
							onClick: event => {
								BDFDB.ListenerUtils.stopEvent(event);
								BDFDB.DiscordUtils.openLink(this.props.original);
							}
						}),
						BDFDB.ReactUtils.createElement("span", {
							children: BDFDB.NumberUtils.formatBytes(this.props.attachment.size)
						}),
						BDFDB.ReactUtils.createElement("span", {
							children: `${this.props.attachment.width}x${this.props.attachment.height}px`
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							text: BDFDB.LanguageUtils.LibraryStrings.download,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								className: BDFDB.disCN.cursorpointer,
								name: BDFDB.LibraryComponents.SvgIcon.Names.DOWNLOAD,
								width: 16,
								height: 16,
								onClick: event => {
									BDFDB.ListenerUtils.stopEvent(event);
									_this.downloadFile({url: this.props.attachment.proxy_url || this.props.original});
								},
								onContextMenu: event => {
									let locations = Object.keys(ownLocations).filter(n => ownLocations[n].enabled);
									if (locations.length) BDFDB.ContextMenuUtils.open(_this, event, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
										children: locations.map((name, i) => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
											id: BDFDB.ContextMenuUtils.createItemId(_this.name, "download", name, i),
											label: name,
											action: _ => _this.downloadFile({url: this.props.attachment.proxy_url || this.props.original}, ownLocations[name].location)
										}))
									}));
								}
							})
						})
					]
				});
			}
		};
		
		return class ImageUtilities extends Plugin {
			onLoad () {
				_this = this;
				firedEvents = [];
				firstViewedImage = null;
				viewedImage = null;
				cachedImages = null;
				
				this.defaults = {
					general: {
						nsfwMode: 				{value: false,	description: "Blurs Media that is posted in NSFW Channels"}
					},
					viewerSettings: {
						zoomMode: 				{value: true,	description: "Enables Zoom Mode to zoom into Images while holding down your Mouse"},
						galleryMode: 				{value: true,	description: "Enables Gallery Mode to quick-switch between Images"},
						details: 				{value: true,	description: "Adds Image Details (Name, Size, Amount)"},
						copyImage: 				{value: true,	description: "Adds a 'Copy Image' Option"},
						saveImage: 				{value: true,	description: "Adds a 'Save Image as' Option"},
						jumpTo: 				{value: true,	description: "Adds a 'Jump to Message' Option in Gallery Mode"}
					},
					galleryFilter: {},
					zoomSettings: {
						pixelMode: 				{value: false,	label: "Uses Pixel Lens instead of a Blur Lens"},
						clickMode: 				{value: false,	label: "Click Image to zoom instead of holding the Mouse Button"},
						lensSize:				{value: 200,	digits: 0,	minValue: 50,	maxValue: 5000,	unit: "px",		label: "context_lenssize"},
						zoomLevel:				{value: 2,	digits: 1,	minValue: 1,	maxValue: 20,	unit: "x",		label: "ACCESSIBILITY_ZOOM_LEVEL_LABEL"},
						zoomSpeed: 				{value: 0.1,	digits: 2,	minValue: 0.01,	maxValue: 1,	unit: "",		label: "context_zoomspeed"}
					},
					rescaleSettings: {
						messages: 				{value: "NONE",	description: "Messages"},
						imageViewer: 				{value: "NONE",	description: "Image Viewer"},
						rescaleEmbeds: 				{value: true,	description: "Resize Image Embeds"}
					},
					detailsSettings: {
						footnote:				{value: true, 			description: "in the Image Description"},
						tooltip:				{value: false, 			description: "as a Hover Tooltip"},
						tooltipDelay:				{value: 0, 	min: 0,		description: "Image Tooltip Delay (in ms)"}
					},
					places: {
						userAvatars: 				{value: true, 	description: "User Avatars"},
						groupIcons: 				{value: true, 	description: "Group Icons"},
						guildIcons: 				{value: true, 	description: "Server Icons"},
						streamPreviews: 			{value: true, 	description: "Stream Previews"},
						emojis: 				{value: true, 	description: "Custom Emojis/Emotes"}
					},
					engines: {
						_all: 		{value: true, 	name: BDFDB.LanguageUtils.LanguageStrings.FORM_LABEL_ALL, 	url: null},
						Baidu: 		{value: true, 	name: "Baidu", 						url: "http://image.baidu.com/pcdutu?queryImageUrl="},
						Bing: 		{value: true, 	name: "Bing", 						url: "https://www.bing.com/images/search?view=detailv2&iss=sbi&FORM=IRSBIQ&q=imgurl:"},
						Google:		{value: true, 	name: "Google", 					url: "https://www.google.com/searchbyimage?sbisrc=cr_1&image_url="},
						GoogleLens:	{value: true, 	name: "Google Lens",					url: "https://lens.google.com/uploadbyurl?url="},
						ImgOps:		{value: true, 	name: "ImgOps",			raw: true, 		url: "https://imgops.com/specialized+reverse/"},
						IQDB:		{value: true, 	name: "IQDB", 						url: "https://iqdb.org/?url="},
						Reddit: 	{value: true, 	name: "Reddit", 					url: "http://karmadecay.com/search?q="},
						SauceNAO: 	{value: true, 	name: "SauceNAO", 					url: "https://saucenao.com/search.php?db=999&url="},
						Sogou: 		{value: true, 	name: "Sogou", 						url: "http://pic.sogou.com/ris?flag=1&drag=0&flag=1&query="},
						TinEye:		{value: true, 	name: "TinEye", 					url: "https://tineye.com/search?url="},
						WhatAnime:	{value: true,	name: "WhatAnime",					url: "https://trace.moe/?url="},
						Yandex: 	{value: true, 	name: "Yandex", 					url: "https://yandex.com/images/search?rpt=imageview&url="}
					}
				};
				
				for (let fileType in fileTypes) this.defaults.galleryFilter[fileType] = {value: true};
			
				this.modulePatches = {
					before: [
						"ImageModal",
						"MessageAccessories",
						"Spoiler"
					],
					after: [
						"ImageModal",
						"LazyImage",
						"LazyImageZoomable",
						"Spoiler",
						"UserBanner"
					],
					componentDidMount: [
						"LazyImage"
					],
					componentDidUpdate: [
						"LazyImage"
					],
					componentWillUnmount: [
						"LazyImage"
					]
				};
				
				this.css = `
					${BDFDB.dotCN._imageutilitiesimagedetailsadded} {
						max-height: unset !important;
					}
					${BDFDB.dotCNS._imageutilitiesimagedetailsadded + BDFDB.dotCN.imagewrapper} {
						border-radius: 8px !important;
						height: calc(100% - 1rem - 16px) !important;
						max-height: unset !important;
						margin-left: unset !important;
					}
					${BDFDB.dotCNS._imageutilitiesimagedetailsadded + BDFDB.dotCN.imagealttextcontainer} {
						bottom: calc(1rem + 16px) !important;
					}
					${BDFDB.dotCN._imageutilitiesimagedetails} {
						display: inline-flex;
						font-weight: 500;
						color: var(--text-muted);
						font-size: 12px;
						margin: .25rem 0 .75rem;
						line-height: 16px;
					}
					${BDFDB.dotCNS.spoilerhidden + BDFDB.dotCN._imageutilitiesimagedetails} {
						visibility: hidden;
					}
					span + ${BDFDB.dotCN._imageutilitiesimagedetails} {
						margin-left: 12px;
					}
					${BDFDB.dotCN._imageutilitiesimagedetails} > * {
						display: inline-block;
						margin-right: 12px;
						overflow: hidden;
						text-overflow: ellipsis;
						white-space: nowrap;
					}
					${BDFDB.dotCN._imageutilitiesimagedetails} > a {
						max-width: 300px;
					}
					span + ${BDFDB.dotCN._imageutilitiesimagedetails} > a {
						max-width: 200px;
					}
					${BDFDB.dotCN._imageutilitiesimagedetails} > span {
						max-width: 100px;
					}
					${BDFDB.dotCNS._imageutilitiesgallery + BDFDB.dotCN.modal},
					${BDFDB.dotCNS._imageutilitiesdetailsadded + BDFDB.dotCN.modal} {
						transform: unset !important;
						filter: unset !important;
						backdrop-filter: unset !important;
					}
					${BDFDB.dotCN._imageutilitiesviewer} {
						pointer-events: none;
					}
					${BDFDB.dotCN._imageutilitiesviewer} > * > *${BDFDB.notCN._imageutilitiesdetailswrapper} {
						pointer-events: initial;
					}
					${BDFDB.dotCN._imageutilitiesgallery} ~ ${BDFDB.dotCN.imagemodalnavbutton} {
						display: none;
					}
					${BDFDB.dotCNS.imagemodal + BDFDB.dotCNS.attachment + BDFDB.dotCN.attachmentvideocontrols},
					${BDFDB.dotCNS.imagemodal + BDFDB.dotCN.attachment + BDFDB.dotCNS.attachmentcontrolshidden + BDFDB.dotCN.attachmentvideocontrols}:hover {
						bottom: -10px;
						transform: unset !important;
						transition: bottom 0.3s ease;
					}
					${BDFDB.dotCNS.imagemodal + BDFDB.dotCN.attachment + BDFDB.dotCNS.attachmentcontrolshidden + BDFDB.dotCN.attachmentvideocontrols} {
						bottom: -42px;
					}
					${BDFDB.dotCNS.imagemodal + BDFDB.notCN._imageutilitiessibling} > ${BDFDB.dotCN.imagewrapper} {
						display: flex;
						justify-content: center;
						align-items: center;
						min-width: 500px;
					}
					${BDFDB.dotCNS.imagemodal + BDFDB.notCN._imageutilitiessibling} > ${BDFDB.dotCN.imagewrapper} img {
						object-fit: contain;
						width: unset;
					}
					${BDFDB.dotCN.imagemodalnavbutton} {
						background: rgba(0, 0, 0, 0.3);
						border-radius: 100%;
					}
					${BDFDB.dotCN.imagemodalnavbutton}:hover {
						background: rgba(0, 0, 0, 0.5);
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
					${BDFDB.dotCNS._imageutilitiessibling + BDFDB.dotCN.spinner} {
						position: absolute;
						width: 32px;
					}
					${BDFDB.dotCNS._imageutilitiesprevious + BDFDB.dotCN.spinner} {
						right: 21px;
					}
					${BDFDB.dotCNS._imageutilitiesnext + BDFDB.dotCN.spinner} {
						left: 21px;
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
						display: inline-block;
						width: 80px;
						font-weight: 600;
					}
					${BDFDB.dotCN._imageutilitieslense} {
						border: 2px solid var(--bdfdb-blurple);
					}
					${BDFDB.dotCN._imageutilitiesoperations} {
						position: absolute;
						display: flex;
					}
					${BDFDB.dotCNS._imageutilitiesoperations + BDFDB.dotCN.imagemodalimageoptionscontainer} {
						position: static !important;
						display: flex !important;
						flex-wrap: unset !important;
					}
					${BDFDB.dotCNS._imageutilitiesoperations + BDFDB.dotCN.imagemodalimagedownloadlink} {
						position: relative !important;
						white-space: nowrap !important;
					}
					${BDFDB.dotCNS._imageutilitiesoperations + BDFDB.dotCN.anchor + BDFDB.dotCN.imagemodalimagedownloadlink} {
						margin: 0 !important;
					}
					${BDFDB.dotCNS._imageutilitiesoperations + BDFDB.dotCN.imagemodalimageforward} {
						display: flex;
					}
					${BDFDB.dotCNS._imageutilitiesoperations + BDFDB.dotCN.imagemodalimageforward}::before {
						content: "|";
						margin-right: 6px;
						transition: opacity .15s ease
					}
					${BDFDB.dotCNS._imageutilitiesoperations + BDFDB.dotCN.imagemodalimageforward}:hover::before {
						opacity: .5;
					}
				`;
			}
			
			onStart () {
				BDFDB.ListenerUtils.add(this, document.body, "click", [BDFDB.dotCN.imageoriginallink, "img", BDFDB.dotCN.attachmentcover, BDFDB.dotCN.attachmentcovericon, "video"].map(n => BDFDB.dotCNS.message + BDFDB.dotCNS.imagewrapper + n).join(", "), e => this.cacheClickedImage(e.target));

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
							title: "General",
							collapseStates: collapseStates,
							children: Object.keys(this.defaults.general).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["general", key],
								label: this.defaults.general[key].description,
								value: this.settings.general[key]
							}))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Image Viewer Settings",
							collapseStates: collapseStates,
							children: Object.keys(this.defaults.viewerSettings).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["viewerSettings", key],
								label: this.defaults.viewerSettings[key].description,
								value: this.settings.viewerSettings[key]
							}))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Gallery Filter Settings",
							collapseStates: collapseStates,
							children: Object.keys(this.defaults.galleryFilter).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["galleryFilter", key],
								label: key,
								value: this.settings.galleryFilter[key]
							}))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Resize Settings",
							collapseStates: collapseStates,
							children: [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
								title: "Automatically Resize Images in: ",
								children: Object.keys(this.defaults.rescaleSettings).filter(key => typeof this.defaults.rescaleSettings[key].value != "boolean").map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
									type: "Select",
									plugin: this,
									keys: ["rescaleSettings", key],
									label: this.defaults.rescaleSettings[key].description,
									basis: "50%",
									options: Object.keys(rescaleOptions).map(n => ({value: n, label: rescaleOptions[n]})),
									value: this.settings.rescaleSettings[key]
								}))
							})].concat(Object.keys(this.defaults.rescaleSettings).filter(key => typeof this.defaults.rescaleSettings[key].value == "boolean").map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "Switch",
								plugin: this,
								keys: ["rescaleSettings", key],
								label: this.defaults.rescaleSettings[key].description,
								value: this.settings.rescaleSettings[key]
							})))
						}));
						
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Image Details Settings",
							collapseStates: collapseStates,
							children: [BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
								title: "Show Image Details",
								children: Object.keys(this.defaults.detailsSettings).filter(key => typeof this.defaults.detailsSettings[key].value == "boolean").map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
									type: "Switch",
									plugin: this,
									keys: ["detailsSettings", key],
									label: this.defaults.detailsSettings[key].description,
									value: this.settings.detailsSettings[key]
								}))
							})].concat(Object.keys(this.defaults.detailsSettings).filter(key => typeof this.defaults.detailsSettings[key].value != "boolean").map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
								type: "TextInput",
								plugin: this,
								keys: ["detailsSettings", key],
								label: this.defaults.detailsSettings[key].description,
								value: this.settings.detailsSettings[key],
								basis: "50%",
								childProps: {type: "number"},
								min: this.defaults.detailsSettings[key].min,
								max: this.defaults.detailsSettings[key].max,
							})))
						}));
						
						const locationInputs = {name: "", location: ""};
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.CollapseContainer, {
							title: "Download Locations",
							collapseStates: collapseStates,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormTitle.Title, {
									className: BDFDB.disCN.marginbottom4,
									tag: BDFDB.LibraryComponents.FormTitle.Tags.H3,
									children: "Add additional Download Locations"
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
									className: BDFDB.disCN.marginbottom8,
									align: BDFDB.LibraryComponents.Flex.Align.END,
									children: [
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
												title: "Name:",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													value: locationInputs.name,
													placeholder: "Name",
													onChange: value => locationInputs.name = value
												})
											})
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
											children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormItem, {
												title: "Location:",
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
													value: locationInputs.location,
													placeholder: "Location",
													onChange: value => locationInputs.location = value
												})
											})
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
											style: {marginBottom: 1},
											onClick: _ => {
												for (let key in locationInputs) if (!locationInputs[key] || !locationInputs[key].trim()) return BDFDB.NotificationUtils.toast("Fill out all fields to add a new Location", {type: "danger"});
												let name = locationInputs.name.trim();
												let location = locationInputs.location.trim();
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
								title: "Your own Download Locations",
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
							title: "Context Menu Settings",
							collapseStates: collapseStates,
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
									title: "Add additional Context Menu Entry for",
									children: Object.keys(this.defaults.places).map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
										type: "Switch",
										plugin: this,
										keys: ["places", key],
										label: this.defaults.places[key].description,
										value: this.settings.places[key]
									}))
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsPanelList, {
									title: "Reverse Image Search Engines",
									children: Object.keys(this.defaults.engines).filter(key => key != "_all").map(key => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
										type: "Switch",
										plugin: this,
										keys: ["engines", key],
										label: this.defaults.engines[key].name,
										value: this.settings.engines[key]
									}))
								})
							]
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
				if (!this.settings.places.guildIcons || !e.instance.props.guild) return;
				if (BDFDB.DOMUtils.getParent(BDFDB.dotCNC.guildheader + BDFDB.dotCN.guildchannels, e.instance.props.target) && (!e.instance.props.target.className && e.instance.props.target.parentElement.firstElementChild == e.instance.props.target) || (e.instance.props.target.className && e.instance.props.target.className.indexOf(BDFDB.disCN.guildheaderbanneranimatedhoverlayer) > -1)) {
					let banner = BDFDB.GuildUtils.getBanner(e.instance.props.guild.id);
					if (banner) this.injectItem(e, [banner.replace(/\.webp|\.gif/, ".png"), e.instance.props.guild.banner && BDFDB.LibraryModules.IconUtils.isAnimatedIconHash(e.instance.props.guild.banner) && banner.replace(/\.webp|\.png/, ".gif")], {prefix: BDFDB.LanguageUtils.LibraryStrings.guildbanner, id: "banner"});
				}
				else if (!BDFDB.DOMUtils.getParent(BDFDB.dotCN.channels, e.instance.props.target)) this.injectItem(e, [(e.instance.props.guild.getIconURL(4096) || "").replace(/\.webp|\.gif/, ".png"), e.instance.props.guild.icon && BDFDB.LibraryModules.IconUtils.isAnimatedIconHash(e.instance.props.guild.icon) && e.instance.props.guild.getIconURL(4096, true)], {prefix: BDFDB.LanguageUtils.LibraryStrings.guildicon, id: "icon"});
			}

			onUserContextMenu (e) {
				if (this.settings.places.userAvatars && e.instance.props.user) {
					const guildId = BDFDB.LibraryStores.SelectedGuildStore.getGuildId();
					const member = BDFDB.LibraryStores.GuildMemberStore.getMember(guildId, e.instance.props.user.id);
					this.injectItem(e, [(e.instance.props.user.getAvatarURL(null, 4096) || "").replace(/\.webp|\.gif/, ".png"), BDFDB.LibraryModules.IconUtils.isAnimatedIconHash(e.instance.props.user.avatar) && e.instance.props.user.getAvatarURL(null, 4096, true), (e.instance.props.user.getAvatarURL(guildId, 4096) || "").replace(/\.webp|\.gif/, ".png"), member && member.avatar && BDFDB.LibraryModules.IconUtils.isAnimatedIconHash(member.avatar) && e.instance.props.user.getAvatarURL(guildId, 4096, true)]);
				}
				if (this.settings.places.streamPreviews && e.instance.props.user) {
					let stream = BDFDB.LibraryStores.ApplicationStreamingStore.getAnyStreamForUser(e.instance.props.user.id);
					let previewUrl = stream && BDFDB.LibraryStores.ApplicationStreamPreviewStore.getPreviewURL(stream.guildId, stream.channelId, stream.ownerId);
					if (previewUrl) this.injectItem(e, [previewUrl], {id: "stream", label: this.labels.context_streamactions});
				}
			}

			onGroupDMContextMenu (e) {
				if (!this.settings.places.groupIcons || !e.instance.props.channel || !e.instance.props.channel.isGroupDM()) return;
				this.injectItem(e, [(BDFDB.DMUtils.getIcon(e.instance.props.channel.id) || "").replace(/\.webp|\.gif/, ".png")]);
			}

			onImageContextMenu (e) {
				if (!e.instance.props.href && !e.instance.props.src) return;
				this.injectItem(e, [e.instance.props.href || e.instance.props.src]);
			}

			onMessageContextMenu (e) {
				if (!e.instance.props.message || !e.instance.props.channel || !e.instance.props.target) return;
				const target = e.instance.props.target.tagName == "A" && BDFDB.DOMUtils.containsClass(e.instance.props.target, BDFDB.disCN.imageoriginallink) && e.instance.props.target.parentElement.querySelector("img") || (BDFDB.DOMUtils.getParent(BDFDB.dotCN.messageattachment, e.instance.props.target) || e.instance.props.target).querySelector("img, video") || e.instance.props.target;
				if (target.tagName == "A" && e.instance.props.message.embeds && e.instance.props.message.embeds[0] && (e.instance.props.message.embeds[0].type == "image" || e.instance.props.message.embeds[0].type == "video" || e.instance.props.message.embeds[0].type == "gifv")) this.injectItem(e, [target.href], {isNative: true});
				else if (target.tagName == "IMG" && target.complete && target.naturalHeight) {
					if (BDFDB.DOMUtils.getParent(BDFDB.dotCN.imagewrapper, target) || BDFDB.DOMUtils.containsClass(target, BDFDB.disCN.imagesticker)) this.injectItem(e, [{file: target.src, original: this.getTargetLink(e.instance.props.target) || this.getTargetLink(target)}], {isNative: true});
					else if (BDFDB.DOMUtils.containsClass(target, BDFDB.disCN.embedauthoricon) && this.settings.places.userAvatars) this.injectItem(e, [target.src], {isNative: true});
					else if (BDFDB.DOMUtils.containsClass(target, BDFDB.disCN.emojiold, "emote", false) && this.settings.places.emojis) this.injectItem(e, [{file: target.src, alternativeName: target.getAttribute("data-name")}], {isNative: true});
				}
				else if (target.tagName == "VIDEO") {
					if (BDFDB.DOMUtils.containsClass(target, BDFDB.disCN.embedvideo) || BDFDB.DOMUtils.getParent(BDFDB.dotCN.attachmentvideo, target)) this.injectItem(e, [{file: target.src, original: this.getTargetLink(e.instance.props.target) || this.getTargetLink(target)}], {isNative: true});
				}
				else {
					const reaction = BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagereaction, target);
					if (reaction && this.settings.places.emojis) {
						const emoji = reaction.querySelector(BDFDB.dotCN.emojiold);
						if (emoji) this.injectItem(e, [{file: emoji.src, alternativeName: emoji.getAttribute("data-name")}], {isNative: true});
					}
				}
			}
			
			getTargetLink (target) {
				let ele = target;
				let src = "", href = "";
				while (ele instanceof Node) ele instanceof HTMLImageElement && null != ele.src && (src = ele.src), ele instanceof HTMLAnchorElement && null != ele.href && (href = ele.href), ele = ele.parentNode;
				return href || src;
			}

			injectItem (e, urls, config = {}) {
				let validUrls = this.filterUrls(...urls);
				if (!validUrls.length) return;
				let [nativeParent, nativeIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "copy-native-link", group: true});
				if (nativeIndex > -1) {
					if (validUrls.length == 1) config.isNative = true;
					nativeParent.splice(nativeIndex, 1);
				}
				for (let id of ["open-native-link", "copy-image", "save-image"]) {
					let [removeParent, removeIndex] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: id, group: true});
					if (removeIndex > -1) removeParent.splice(removeIndex, 1);
				}
				
				let subMenu = this.createSubMenus({
					instance: e.instance,
					urls: validUrls,
					prefix: config.prefix,
					target: e.instance.props.target
				});
				
				let [children, index] = config.isNative && nativeIndex > -1 ? [nativeParent, nativeIndex] : BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
				children.splice(index > -1 ? index : children.length, 0, config.isNative && nativeIndex > -1 ? subMenu : BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: config.label || (this.isValid(validUrls[0].file, "video") ? this.labels.context_videoactions : this.labels.context_imageactions),
						id: BDFDB.ContextMenuUtils.createItemId(this.name, config.id, "main-subitem"),
						children: subMenu
					})
				}));
			}
			
			filterUrls (...urls) {
				let addedUrls = [];
				return urls.filter(n => this.isValid(n && n.file || n)).map(n => {
					let srcUrl = (n.file || n).replace(/^url\(|\)$|"|'/g, "");
					let originalUrl = (n.original || n.file || n).replace(/^url\(|\)$|"|'/g, "");
					let fileUrl = srcUrl;
					if (fileUrl.indexOf("https://images-ext-1.discordapp.net/external/") > -1 || fileUrl.indexOf("https://images-ext-2.discordapp.net/external/") > -1) {
						if (fileUrl.split("/https/").length > 1) fileUrl = "https://" + fileUrl.split("/https/").pop();
						else if (url.split("/http/").length > 1) fileUrl = "http://" + fileUrl.split("/http/").pop();
					}
					const file = fileUrl && (BDFDB.LibraryModules.URLParser.parse(fileUrl).pathname || "").toLowerCase();
					const fileType = file && (file.split(".").pop() || "");
					return fileUrl && fileType && !addedUrls.includes(srcUrl) && addedUrls.push(srcUrl) && {file: fileUrl, src: srcUrl, original: originalUrl, isGuildSpecific: /^https:\/\/cdn\.discordapp\.com\/guilds\/\d+\/users\/\d+/.test(srcUrl), fileType, alternativeName: escape((n.alternativeName || "").replace(/:/g, ""))};
				}).filter(n => n);
			}
			
			isValid (url, type) {
				if (!url) return false;
				if (url && url.indexOf("data:") == 0 && url.indexOf("base64") > -1) {
					const fileType = (url.split("/")[1] || "").split(";")[0];
					return !type && fileTypes[fileType] || type && type != "searchable" && fileTypes[fileType] && fileTypes[fileType][type];
				}
				else {
					const file = url && (BDFDB.LibraryModules.URLParser.parse(url).pathname || "").split("%3A")[0].toLowerCase();
					return file && (!type && (url.indexOf("discord.com/streams/guild:") > -1 || url.indexOf("discordapp.com/streams/guild:") > -1 || url.indexOf("discordapp.net/streams/guild:") > -1 || url.startsWith("https://images-ext-1.discordapp.net/") || url.startsWith("https://images-ext-2.discordapp.net/") || Object.keys(fileTypes).some(t => file.endsWith(`/${t}`) || file.endsWith(`.${t}`))) || ((type == "copyable" || type == "searchable") && (url.indexOf("discord.com/streams/guild:") > -1 || url.indexOf("discordapp.com/streams/guild:") > -1 || url.indexOf("discordapp.net/streams/guild:") > -1)) || type && Object.keys(fileTypes).filter(t => fileTypes[t][type]).some(t => file.endsWith(`/${t}`) || file.endsWith(`.${t}`)));
				}
			}
			
			getPosterUrl (url) {
				url = (url || "").replace("https://cdn.discordapp.com", "https://media.discordapp.net").split("?size=")[0];
				return url + (url.indexOf("?") > -1 ? "&format=jpeg" : "?format=jpeg");
			}
			
			createSubMenus (data) {
				return data.urls.length == 1 ? this.createUrlMenu(data.instance, data.urls[0], data.target) : data.urls.map((urlData, i) => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
					label: [urlData.isGuildSpecific && BDFDB.LanguageUtils.LanguageStrings.CHANGE_IDENTITY_SERVER_PROFILE, data.prefix, urlData.fileType.toUpperCase()].filter(n => n).join(" "),
					id: BDFDB.ContextMenuUtils.createItemId(this.name, "subitem", i),
					children: this.createUrlMenu(data.instance, urlData, data.target)
				}));
			}
			
			createUrlMenu (instance, urlData, target) {
				let enabledEngines = BDFDB.ObjectUtils.filter(this.settings.engines, n => n);
				let enginesWithoutAll = BDFDB.ObjectUtils.filter(enabledEngines, n => n != "_all", true);
				let engineKeys = Object.keys(enginesWithoutAll);
				
				let locations = Object.keys(ownLocations).filter(n => ownLocations[n].enabled);
				
				let isVideo = this.isValid(urlData.file, "video");
				let type = isVideo ? BDFDB.LanguageUtils.LanguageStrings.VIDEO : BDFDB.LanguageUtils.LanguageStrings.IMAGE;
				
				return BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: [
						urlData.original && urlData.original.indexOf("data:") != 0 && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.COPY_LINK,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-link"),
							action: _ => {
								let url = this.removeSizeInUrl(urlData.original);
								url = this.removeFormatInUrl(url);
								url = url.indexOf("discordapp.com/avatars/") > 0 || url.indexOf("discordapp.com/icons/") > 0 ? `${url}?size=4096` : url;
								BDFDB.LibraryModules.WindowUtils.copy(url);
								BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LanguageStrings.LINK_COPIED, {type: "success"});
							}
						}),
						urlData.file != urlData.original && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.COPY_MEDIA_LINK,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-media-link"),
							action: _ => {
								let url = this.removeSizeInUrl(urlData.file);
								url = this.removeFormatInUrl(url);
								url = url.indexOf("discordapp.com/avatars/") > 0 || url.indexOf("discordapp.com/icons/") > 0 ? `${url}?size=4096` : url;
								BDFDB.LibraryModules.WindowUtils.copy(url);
								BDFDB.NotificationUtils.toast(BDFDB.LanguageUtils.LanguageStrings.LINK_COPIED, {type: "success"});
							}
						}),
						urlData.original && urlData.original.indexOf("data:") != 0 && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.OPEN_LINK,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "open-link"),
							action: _ => BDFDB.DiscordUtils.openLink(urlData.original)
						}),
						!this.isValid(urlData.file, "copyable") ? null : BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_copy.replace("{{var0}}", type),
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "copy-file"),
							action: _ => this.copyFile({url: urlData.original, fallbackUrl: urlData.src})
						}),
						!document.querySelector(BDFDB.dotCN.imagemodal) && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_view.replace("{{var0}}", type),
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "view-file"),
							action: _ => {
								const imageThrowaway = document.createElement(isVideo ? "video" : "img");
								imageThrowaway.addEventListener(isVideo ? "loadedmetadata" : "load", function() {
									_this.cacheClickedImage(target);
									let open = _ => BDFDB.LibraryModules.ModalUtils.openModal(modalData => {
										return BDFDB.ReactUtils.createElement("div", {
											className: _this.settings.viewerSettings.details && BDFDB.disCN._imageutilitiesdetailsadded,
											children: BDFDB.ReactUtils.createElement("div", {
												className: BDFDB.disCNS.modalcarouselmodal + BDFDB.disCNS.imagemodal + BDFDB.disCNS.modal + BDFDB.disCN._imageutilitiesviewer,
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ImageModal, {
													location: "LazyImageZoomable",
													onClose: _ => modalData.onClose(),
													items: [isVideo ? {
														src: imageThrowaway.src,
														poster: _this.getPosterUrl(imageThrowaway.src),
														width: this.videoWidth,
														naturalWidth: this.videoWidth,
														height: this.videoHeight,
														naturalHeight: this.videoHeight
													} : {
														animated: false,
														height: this.height,
														original: imageThrowaway.src,
														srcIsAnimated: false,
														trigger: "CLICK",
														type: "IMAGE",
														url: imageThrowaway.src,
														width: this.width,
														zoomThumbnailPlaceholder: imageThrowaway.src
													}]
												})
											})
										}, true);
									});
									if (BDFDB.LibraryComponents.ImageModal != "div") open();
									else BDFDB.ModuleUtils.lazyLoadModuleImports(BDFDB.LibraryComponents.ImageModalOuter).then(_ => open());	
								});
								imageThrowaway.src = urlData.src || urlData.file;
							}
						}),
						BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_saveas.replace("{{var0}}", type),
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "download-file-as"),
							action: _ => this.downloadFile({url: urlData.original, fallbackUrl: urlData.src}, null, urlData.alternativeName),
							children: locations.length && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
								children: locations.map((name, i) => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
									id: BDFDB.ContextMenuUtils.createItemId(this.name, "download", name, i),
									label: name,
									action: _ => this.downloadFile({url: urlData.original, fallbackUrl: urlData.src}, ownLocations[name].location, urlData.alternativeName)
								}))
							})
						}),
						!this.isValid(urlData.original, "searchable") || !engineKeys.length ? null : engineKeys.length == 1 ? BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_searchwith.replace("{{var0}}", type).replace("...", this.defaults.engines[engineKeys[0]].name),
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "single-search"),
							persisting: true,
							action: event => {
								if (!event.shiftKey) BDFDB.ContextMenuUtils.close(instance);
								BDFDB.DiscordUtils.openLink(this.defaults.engines[engineKeys[0]].url + encodeURIComponent(urlData.original), {
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
								color: key == "_all" ? BDFDB.DiscordConstants.MenuItemColors.DANGER : BDFDB.DiscordConstants.MenuItemColors.DEFAULT,
								persisting: true,
								action: event => {
									const open = (url, k) => BDFDB.DiscordUtils.openLink(this.defaults.engines[k].url + (this.defaults.engines[k].raw ? url : encodeURIComponent(url)), {minimized: event.shiftKey});
									if (!event.shiftKey) BDFDB.ContextMenuUtils.close(instance);
									if (key == "_all") {
										for (let key2 in enginesWithoutAll) open(urlData.original, key2);
									}
									else open(urlData.original, key);
								}
							}))
						})
					].filter(n => n)
				});
			}
			
			processImageModal (e, filterForVideos = false) {
				if (switchedImageProps) {
					e.instance.props.items = [switchedImageProps];
					switchedImageProps = null;
				}
				else if (e.returnvalue) {
					let url = this.getImageSrc(viewedImage && viewedImage.proxy_url || e.instance.props.items[0].src || e.instance.props.items[0].original);
					
					let zoomedFitWrapper = BDFDB.ReactUtils.findChild(e.returnvalue, {props: [["className", BDFDB.disCN.imagemodalimagezoomedfit]]});
					if (zoomedFitWrapper) zoomedFitWrapper.props.className = BDFDB.ArrayUtils.remove(zoomedFitWrapper.props.className.split(" "), BDFDB.disCN.imagemodalimagezoomedfit, true).join(" ");
					
					
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.imagemodalimageoptionscontainer]]});
					if (index > -1) {
						let type = filterForVideos ? BDFDB.LanguageUtils.LanguageStrings.VIDEO : BDFDB.LanguageUtils.LanguageStrings.IMAGE;
						let openContext = event => BDFDB.ContextMenuUtils.open(this, event, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
							children: Object.keys(this.defaults.zoomSettings).map(type => {
								let isBoolean = typeof this.defaults.zoomSettings[type].value == "boolean";
								return BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems[isBoolean ? "MenuCheckboxItem" : "MenuSliderItem"], Object.assign({
									id: BDFDB.ContextMenuUtils.createItemId(this.name, type)
								}, isBoolean ? {
									checked: this.settings.zoomSettings[type],
									action: value => {
										this.settings.zoomSettings[type] = value;
										BDFDB.DataUtils.save(this.settings.zoomSettings, this, "zoomSettings");
									}
								} : {
									value: this.settings.zoomSettings[type],
									renderLabel: (value, instance) => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
										align: BDFDB.LibraryComponents.Flex.Align.CENTER,
										children: [
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex.Child, {
												children: `${this.labels[this.defaults.zoomSettings[type].label] || BDFDB.LanguageUtils.LanguageStrings[this.defaults.zoomSettings[type].label]}:`
											}),
											BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
												type: "number",
												size: BDFDB.LibraryComponents.TextInput.Sizes.MINI,
												style: {width: 70},
												min: 1,
												max: this.defaults.zoomSettings[type].maxValue,
												value: this.settings.zoomSettings[type],
												onChange: value => value && value >= this.defaults.zoomSettings[type].minValue && instance.handleValueChange(BDFDB.NumberUtils.mapRange([this.defaults.zoomSettings[type].minValue, this.defaults.zoomSettings[type].maxValue], [0, 100], value))
											}),
											BDFDB.ReactUtils.createElement("span", {
												style: {width: 20},
												children: this.defaults.zoomSettings[type].unit
											})
										]
									}),
									onValueRender: value => `${value}${this.defaults.zoomSettings[type].unit}`,
									onValueChange: value => {
										this.settings.zoomSettings[type] = value;
										BDFDB.DataUtils.save(this.settings.zoomSettings, this, "zoomSettings");
									}
								}, BDFDB.ObjectUtils.extract(this.defaults.zoomSettings[type], isBoolean ? ["label"] : ["digits", "minValue", "maxValue"])));
							})
						}));
						children[index] = BDFDB.ReactUtils.createElement("span", {
							className: BDFDB.disCN._imageutilitiesoperations,
							children: [
								children[index],
								this.settings.viewerSettings.saveImage && BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.imagemodalimageoptionscontainer,
									children: [
										BDFDB.ReactUtils.createElement("span", {
											className: BDFDB.disCN.imagemodalimagedownloadlink,
											children: "|",
											style: {margin: "0 5px"}
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
											className: BDFDB.disCN.imagemodalimagedownloadlink, 
											children: this.labels.context_saveas.replace("{{var0}}", type),
											onClick: event => {
												BDFDB.ListenerUtils.stopEvent(event);
												this.downloadFile({url: e.instance.props.items?.[0]?.original, fallbackUrl: url});
											},
											onContextMenu: event => {
												let locations = Object.keys(ownLocations).filter(n => ownLocations[n].enabled);
												if (locations.length) BDFDB.ContextMenuUtils.open(this, event, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
													children: locations.map((name, i) => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
														id: BDFDB.ContextMenuUtils.createItemId(this.name, "download", name, i),
														label: name,
														action: _ => this.downloadFile({url: e.instance.props.items?.[0]?.original, fallbackUrl: url}, ownLocations[name].location)
													}))
												}));
											}
										})
									]
								}),
								this.settings.viewerSettings.copyImage && this.isValid(url, "copyable") && BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.imagemodalimageoptionscontainer,
									children: [
										BDFDB.ReactUtils.createElement("span", {
											className: BDFDB.disCN.imagemodalimagedownloadlink,
											children: "|",
											style: {margin: "0 5px"}
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
											className: BDFDB.disCN.imagemodalimagedownloadlink, 
											children: this.labels.context_copy.replace("{{var0}}", type),
											onClick: event => {
												BDFDB.ListenerUtils.stopEvent(event);
												this.copyFile({url: e.instance.props.items?.[0]?.original, fallbackUrl: url});
											}
										})
									]
								}),
								this.settings.viewerSettings.galleryMode && viewedImage && this.settings.viewerSettings.jumpTo && BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.imagemodalimageoptionscontainer,
									children: [
										BDFDB.ReactUtils.createElement("span", {
											className: BDFDB.disCN.imagemodalimagedownloadlink,
											children: "|",
											style: {margin: "0 5px"}
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
											className: BDFDB.disCN.imagemodalimagedownloadlink, 
											children: BDFDB.LanguageUtils.LanguageStrings.JUMP,
											onClick: event => {
												let layerContainer = !event.shiftKey && BDFDB.DOMUtils.getParent(BDFDB.dotCN.itemlayercontainer, event.currentTarget)
												let backdrop = layerContainer && layerContainer.querySelector(BDFDB.dotCN.backdrop);
												if (backdrop) backdrop.click();
												let channel = BDFDB.LibraryStores.ChannelStore.getChannel(viewedImage.channelId);
												if (channel) BDFDB.LibraryModules.HistoryUtils.transitionTo(BDFDB.DiscordConstants.Routes.CHANNEL(channel.guild_id, channel.id, viewedImage.message.id));
											}
										})
									]
								}),
								this.settings.viewerSettings.zoomMode && !filterForVideos && !this.isValid(e.instance.props.src, "gif") && BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.imagemodalimageoptionscontainer,
									children: [
										BDFDB.ReactUtils.createElement("span", {
											className: BDFDB.disCN.imagemodalimagedownloadlink,
											children: "|",
											style: {margin: "0 5px"}
										}),
										BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Anchor, {
											className: BDFDB.disCN.imagemodalimagedownloadlink, 
											children: `Zoom ${BDFDB.LanguageUtils.LanguageStrings.SETTINGS}`,
											onClick: openContext,
											onContextMenu: openContext
										})
									]
								})
							].flat(10).filter(n => n)
						});
						
						if (this.settings.viewerSettings.details) {
							e.returnvalue.props.children.push(BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN._imageutilitiesdetailswrapper,
								children: [
									e.instance.props.items[0].alt && {label: "Alt", text: e.instance.props.items[0].alt},
									{label: "Source", text: this.removeSizeInUrl(this.removeFormatInUrl(url))},
									{label: "Size", text: `${e.instance.props.items[0].width}x${e.instance.props.items[0].height}px`},
									cachedImages && cachedImages.amount && cachedImages.amount > 1 && {label: filterForVideos ? "Video" : "Image", text: `${cachedImages.index + 1 || 1} of ${cachedImages.amount}`}
								].filter(n => n).map(data => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
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
					}
					if (this.settings.viewerSettings.galleryMode && viewedImage) {
						if (!cachedImages || cachedImages.channelId != viewedImage.channelId || cachedImages.amount && this.getImageIndex(cachedImages.all, viewedImage) == -1) {
							BDFDB.TimeUtils.clear(viewedImageTimeout);
							let channel = BDFDB.LibraryStores.ChannelStore.getChannel(viewedImage.channelId);
							BDFDB.LibraryModules.HTTPUtils.get({
								url: BDFDB.DiscordConstants.Endpoints.MESSAGES(channel.id),
								query: BDFDB.LibraryModules.APIEncodeUtils.stringify({
									channel_id: channel && channel.guild_id ? (BDFDB.ChannelUtils.isThread(channel) && channel.parent_id || channel.id) : null,
									has: "image",
									include_nsfw: true,
									limit: 100,
									around: viewedImage.message.id
								})
							}).catch(err => {
								cachedImages = {
									channelId: viewedImage.channelId,
									firstReached: null,
									oldestId: null,
									all: [],
									index: -1,
									amount: 0,
									newestId: null,
									lastReached: null
								};
								this.updateImageModal();
							}).then(result => {
								if (!viewedImage) return;
								let messages = [], index = -1;
								if (result) {
									messages = result.body.flat(10).reverse();
									cachedImages = {all: this.filterMessagesForImages(messages, viewedImage, filterForVideos)};
									index = this.getImageIndex(cachedImages.all, viewedImage);
								}
								if (index > -1) cachedImages = Object.assign(cachedImages, {
									channelId: viewedImage.channelId,
									firstReached: index == 0,
									oldestId: messages[0] ? messages[0].id : null,
									index: index,
									amount: cachedImages.all.length,
									newestId: messages[messages.length-1] ? messages[messages.length-1].id : null,
									lastReached: index == (cachedImages.all.length - 1)
								});
								else cachedImages = {
									channelId: viewedImage.channelId,
									firstReached: null,
									oldestId: null,
									all: [],
									index: -1,
									amount: 0,
									newestId: null,
									lastReached: null
								};
								this.updateImageModal();
							});
						}
						else {
							if (cachedImages.all[cachedImages.index - 1]) e.returnvalue.props.children.push(BDFDB.ReactUtils.createElement(LazyImageSiblingComponent, {
								className: BDFDB.disCN._imageutilitiesprevious,
								url: this.getImageSrc(cachedImages.all[cachedImages.index - 1].thumbnail || cachedImages.all[cachedImages.index - 1]),
								offset: -1,
								svgIcon: BDFDB.LibraryComponents.SvgIcon.Names.LEFT_CARET
							}));
							if (cachedImages.all[cachedImages.index + 1]) e.returnvalue.props.children.push(BDFDB.ReactUtils.createElement(LazyImageSiblingComponent, {
								className: BDFDB.disCN._imageutilitiesnext,
								url: this.getImageSrc(cachedImages.all[cachedImages.index + 1].thumbnail || cachedImages.all[cachedImages.index + 1]),
								offset: 1,
								svgIcon: BDFDB.LibraryComponents.SvgIcon.Names.RIGHT_CARET
							}));
							if (cachedImages.all[cachedImages.index - 1] || cachedImages.all[cachedImages.index + 1]) {
								this.addListener("keydown", "Gallery", event => {
									if (!firedEvents.includes("Gallery")) {
										firedEvents.push("Gallery");
										if (event.keyCode == 37) this.switchImages(-1, filterForVideos);
										else if (event.keyCode == 39) this.switchImages(1, filterForVideos);
									}
								});
								this.addListener("keyup", "Gallery", _ => BDFDB.ArrayUtils.remove(firedEvents, "Gallery", true));
							}
						}
						e.returnvalue.props.className = "";
						e.returnvalue.props.children[0] = null;
						e.returnvalue.props.children[2] = null;
					}
				}
			}
			
			processLazyImage (e) {
				if (e.node) {
					if (!e.instance.props.src.split("?")[0].endsWith(".gif") && !e.instance.props.src.split("?")[0].endsWith(".mp4") && !e.instance.props.animated && !e.instance.props.children) for (let ele of [e.node.src && e.node, ...e.node.querySelectorAll("[src]")].filter(n => n)) ele.src = this.removeFormatInUrl(ele.src);
					if (e.instance.props.resized) {
						let selectors = ["embedgridcontainer", "imagemosaicattachmentscontainer", "imagemosaiconebyonegridsingle"];

						if (this.settings.rescaleSettings.rescaleEmbeds)
							selectors.push("embedfull", "embedinlinemedia")

						for (let selector of selectors) {
							let parent = BDFDB.DOMUtils.getParent(BDFDB.dotCN[selector], e.node);
							if (parent) parent.style.setProperty("max-width", "unset", "important");
							if (parent) parent.style.setProperty("max-height", "unset", "important");
						}
						for (let ele of [e.node.style.getPropertyValue("width") && e.node, ...e.node.querySelectorAll("[style*='width:']")].filter(n => n)) {
							ele.style.setProperty("width", e.instance.props.width + "px");
							ele.style.setProperty("max-width", e.instance.props.width + "px");
							ele.style.setProperty("height", e.instance.props.height + "px");
							ele.style.setProperty("max-height", e.instance.props.height + "px");
						}
						for (let ele of [e.node.src && e.node, ...e.node.querySelectorAll("[src]")].filter(n => n)) ele.src = this.removeSizeInUrl(ele.src);
						if (e.instance.state.readyState != BDFDB.DiscordConstants.ImageReadyStates.READY) {
							e.instance.state.readyState = BDFDB.DiscordConstants.ImageReadyStates.READY;
							BDFDB.ReactUtils.forceUpdate(e.instance);
						}
					}
					if (e.methodname == "componentWillUnmount" && BDFDB.DOMUtils.getParent(BDFDB.dotCNC.imagemodal + BDFDB.dotCN.modalcarouselmodal, e.node)) {
						BDFDB.TimeUtils.clear(viewedImageTimeout);
						viewedImageTimeout = BDFDB.TimeUtils.timeout(_ => {
							firstViewedImage = null;
							viewedImage = null;
							this.cleanupListeners("Gallery");
						}, 1000);
					}
					if (e.methodname == "componentDidMount" && BDFDB.DOMUtils.getParent(BDFDB.dotCNC.imagemodal + BDFDB.dotCN.modalcarouselmodal, e.node)) {
						BDFDB.TimeUtils.clear(viewedImageTimeout);
						let modal = BDFDB.DOMUtils.getParent(BDFDB.dotCN.modal, e.node);
						if (modal) {
							modal.parentElement.className = BDFDB.DOMUtils.formatClassName(modal.parentElement.className, this.settings.viewerSettings.galleryMode && BDFDB.disCN._imageutilitiesgallery, this.settings.viewerSettings.details && BDFDB.disCN._imageutilitiesdetailsadded);
							if (this.settings.viewerSettings.galleryMode) BDFDB.DOMUtils.addClass(modal, BDFDB.disCN.imagemodal);
						}
						
						if (this.isValid(e.instance.props.src, "gif")) e.node.style.setProperty("pointer-events", "none");
						if (this.settings.viewerSettings.zoomMode && typeof e.instance.props.children != "function" && !BDFDB.DOMUtils.containsClass(e.node.parentElement, BDFDB.disCN._imageutilitiessibling)) {
							e.node.style.setProperty("cursor", "zoom-in");
							e.node.addEventListener(this.settings.zoomSettings.clickMode ? "click" : "mousedown", event => {
								BDFDB.ListenerUtils.stopEvent(event);
								if (event.which != 1 || e.node.querySelector("video")) return;
								
								let vanishObserver;
								
								let zoomLevel = this.settings.zoomSettings.zoomLevel;
								let img = e.node.querySelector("img, video");
								let imgRects = BDFDB.DOMUtils.getRects(img);
								let lens = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN._imageutilitieslense}" style="border-radius: 50% !important; pointer-events: none !important; z-index: 10000 !important; width: ${this.settings.zoomSettings.lensSize}px !important; height: ${this.settings.zoomSettings.lensSize}px !important; position: fixed !important;"><div style="position: absolute !important; top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important;"><${img.tagName} src="${!this.isValid(e.instance.props.src, "video") ? e.instance.props.src : this.getPosterUrl(e.instance.props.src)}" style="width: ${imgRects.width * zoomLevel}px; height: ${imgRects.height * zoomLevel}px; position: fixed !important;${this.settings.zoomSettings.pixelMode ? " image-rendering: pixelated !important;" : ""}"${img.tagName == "VIDEO" ? " loop autoplay" : ""}></${img.tagName}></div></div>`);
								let pane = lens.firstElementChild.firstElementChild;
								let backdrop = BDFDB.DOMUtils.create(`<div class="${BDFDB.disCN._imageutilitieslensebackdrop}" style="background: rgba(0, 0, 0, 0.3) !important; position: absolute !important; top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important; pointer-events: all !important; z-index: 8000 !important;"></div>`);
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
									pane.style.setProperty("left", imgRects.left + ((zoomLevel - 1) * (imgRects.left - x - halfW)) + "px", "important");
									pane.style.setProperty("top", imgRects.top + ((zoomLevel - 1) * (imgRects.top - y - halfH)) + "px", "important");
									pane.style.setProperty("width", imgRects.width * zoomLevel + "px", "important");
									pane.style.setProperty("height", imgRects.height * zoomLevel + "px", "important");
								};
								lens.update();
								
								let dragging = event2 => {
									event = event2;
									lens.update();
								};
								let releasing = event2 => {
									BDFDB.ListenerUtils.stopEvent(event2);
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
								this.addListener("wheel", "Zoom", event2 => {
									if (!document.contains(e.node)) this.cleanupListeners("Zoom");
									else {
										if (event2.deltaY < 0 && (zoomLevel + this.settings.zoomSettings.zoomSpeed * zoomLevel) <= this.defaults.zoomSettings.zoomLevel.maxValue) {
											zoomLevel += this.settings.zoomSettings.zoomSpeed * zoomLevel;
											lens.update();
										}
										else if (event2.deltaY > 0 && (zoomLevel - this.settings.zoomSettings.zoomSpeed * zoomLevel) >= this.defaults.zoomSettings.zoomLevel.minValue) {
											zoomLevel -= this.settings.zoomSettings.zoomSpeed * zoomLevel;
											lens.update();
										}
									}
								});
								this.addListener("keydown", "Zoom", event2 => {
									if (!document.contains(e.node)) this.cleanupListeners("Zoom");
									else if (!firedEvents.includes("Zoom")) {
										firedEvents.push("Zoom");
										if (event2.keyCode == 187 && (zoomLevel + zoomLevel * 0.5) <= this.defaults.zoomSettings.zoomLevel.maxValue) {
											zoomLevel += zoomLevel * 0.5;
											lens.update();
										}
										else if (event2.keyCode == 189 && (zoomLevel - zoomLevel * 0.5) >= this.defaults.zoomSettings.zoomLevel.minValue) {
											zoomLevel -= zoomLevel * 0.5;
											lens.update();
										}
									}
								});
								this.addListener("keyup", "Zoom", _ => {
									BDFDB.ArrayUtils.remove(firedEvents, "Zoom", true);
									if (!document.contains(e.node)) this.cleanupListeners("Zoom");
								});
								
								vanishObserver = new MutationObserver(changes => {if (!document.contains(e.node)) releasing();});
								vanishObserver.observe(appMount, {childList: true, subtree: true});
							});
						}
					}
				}
				else {
					let reactInstance = BDFDB.ObjectUtils.get(e, `instance.${BDFDB.ReactUtils.instanceKey}`);
					if (this.settings.rescaleSettings.imageViewer != "NONE" && e.instance.props.className && e.instance.props.className.indexOf(BDFDB.disCN.imagemodalimage) > -1) {
						let aRects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount));
						let ratio = Math.min((aRects.width * (this.settings.viewerSettings.galleryMode ? 0.8 : 1) - 20) / e.instance.props.width, (aRects.height - (this.settings.viewerSettings.details ? 280 : 100)) / e.instance.props.height);
						ratio = this.settings.rescaleSettings.imageViewer == "ORIGINAL" && ratio > 1 ? 1 : ratio;
						let width = Math.round(ratio * e.instance.props.width);
						let height = Math.round(ratio * e.instance.props.height);
						if (e.instance.props.width != width || e.instance.props.maxWidth != width || e.instance.props.height != height || e.instance.props.maxHeight != height) {
							e.instance.props.width = width;
							e.instance.props.maxWidth = width;
							e.instance.props.height = height;
							e.instance.props.maxHeight = height;
							e.instance.props.src = e.instance.props.src.replace(/width=\d+/, `width=${width}`).replace(/height=\d+/, `height=${height}`);
							e.instance.props.resized = true;
						}
					}
					if (this.settings.rescaleSettings.messages != "NONE" && [e.instance.props.className, e.instance.props.containerClassName].every(n => [BDFDB.disCN.embedvideoimagecomponent, BDFDB.disCN.embedthumbnail].every(m => (n || "").indexOf(m) == -1)) && BDFDB.ReactUtils.findOwner(reactInstance, {name: "LazyImageZoomable", up: true}) && (e.instance.props.mediaLayoutType != "MOSAIC" || (BDFDB.ReactUtils.findValue(reactInstance, "message", {up: true}) || {attachments: []}).attachments.filter(n => n.content_type && n.content_type.startsWith("image")).length < 2)) {
						let aRects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount));
						let mRects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCNC.messageaccessory + BDFDB.dotCN.messagecontents));
						let mwRects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.messagewrapper));
						if (mRects.width || mwRects.width) {
							let embed = BDFDB.ReactUtils.findValue(reactInstance, "embed", {up: true});
							if (embed && !this.settings.rescaleSettings.rescaleEmbeds)
								return;

							let ratio = ((mRects.width || (mwRects.width - 120)) - (embed && embed.color ? 100 : 0)) / e.instance.props.width;
							ratio = this.settings.rescaleSettings.messages == "ORIGINAL" && ratio > 1 ? 1 : ratio;
							let width = Math.round(ratio * e.instance.props.width);
							let height = Math.round(ratio * e.instance.props.height);
							if (height > (aRects.height * 0.66)) {
								let newHeight = Math.round(aRects.height * 0.66);
								width = (newHeight/height) * width;
								height = newHeight;
							}
							if (e.instance.props.width != width || e.instance.props.maxWidth != width || e.instance.props.height != height || e.instance.props.maxHeight != height) {
								e.instance.props.width = width;
								e.instance.props.maxWidth = width;
								e.instance.props.height = height;
								e.instance.props.maxHeight = height;
								e.instance.props.src = e.instance.props.src.replace(/width=\d+/, `width=${width}`).replace(/height=\d+/, `height=${height}`);
								e.instance.props.resized = true;
							}
						}
					}
				}
			}

			processLazyImageZoomable (e) {
				if (!e.instance.props.item || !e.instance.props.item.originalItem || e.instance.props.src.indexOf("https://media.discordapp.net/attachments") != 0) return;
				if (this.settings.detailsSettings.tooltip || this.settings.detailsSettings.footnote && e.instance.props.mediaLayoutType == "MOSAIC" && (BDFDB.ReactUtils.findValue(BDFDB.ObjectUtils.get(e, `instance.${BDFDB.ReactUtils.instanceKey}`), "message", {up: true}) || {attachments: []}).attachments.filter(n => n.content_type && n.content_type.startsWith("image")).length > 1) {
					const onMouseEnter = e.returnvalue.props.onMouseEnter || (_ => {});
					e.returnvalue.props.onMouseEnter = BDFDB.TimeUtils.suppress((...args) => {
						BDFDB.TooltipUtils.create(args[0].target, [
							e.instance.props.item.originalItem.filename,
							BDFDB.NumberUtils.formatBytes(e.instance.props.item.originalItem.size),
							`${e.instance.props.item.originalItem.width}x${e.instance.props.item.originalItem.height}px`
						].map(l => BDFDB.ReactUtils.createElement("div", {style: {padding: "2px 0"}, children: l})), {
							type: "right",
							delay: this.settings.detailsSettings.tooltipDelay
						});
						return onMouseEnter(...args);
					}, "Error in onMouseEnter of LazyImageZoomable!");
				}
				if (this.settings.detailsSettings.footnote && [e.instance.props.className, e.instance.props.containerClassName].every(n => [BDFDB.disCN.embedmedia, BDFDB.disCN.embedthumbnail].every(m => (n || "").indexOf(m) == -1)) && (e.instance.props.mediaLayoutType != "MOSAIC" || (BDFDB.ReactUtils.findValue(BDFDB.ObjectUtils.get(e, `instance.${BDFDB.ReactUtils.instanceKey}`), "message", {up: true}) || {attachments: []}).attachments.filter(n => n.content_type && n.content_type.startsWith("image")).length < 2)) {
					e.returnvalue = BDFDB.ReactUtils.createElement("div", {
						children: [
							e.returnvalue,
							BDFDB.ReactUtils.createElement(ImageDetailsComponent, {
								original: e.instance.props.item.original,
								attachment: {
									height: 0,
									width: 0,
									filename: "unknown.png"
								}
							}, true)
						]
					});
				}
			}

			processMessageAccessories (e) {
				if (this.settings.general.nsfwMode && e.instance.props.channel.nsfw) {
					e.instance.props.message = new BDFDB.DiscordObjects.Message(e.instance.props.message);
					e.instance.props.message.attachments = [].concat(e.instance.props.message.attachments);
					for (let i in e.instance.props.message.attachments) if (e.instance.props.message.attachments[i].spoiler != undefined) {
						e.instance.props.message.attachments[i] = Object.assign({}, e.instance.props.message.attachments[i], {spoiler: true, nsfw: !e.instance.props.message.attachments[i].spoiler});
					}
				}
			}

			processSpoiler (e) {
				if (!e.returnvalue) {
					if (this.settings.rescaleSettings.messages != "NONE" && !e.instance.props.inline && e.instance.props.type == "attachment" && e.instance.props.containerStyles) e.instance.props.containerStyles.maxWidth = "100%";
				}
				else {
					if (e.instance.state && e.instance.state.visible) return;
					if (this.settings.general.nsfwMode && typeof e.returnvalue.props.children == "function") {
						let childrenRender = e.returnvalue.props.children;
						e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
							let returnedChildren = childrenRender(...args);
							let item = BDFDB.ReactUtils.findValue(returnedChildren, "item");
							if (item && item.originalItem && item.originalItem.nsfw) {
								returnedChildren.props.children[0] = BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN.spoilerwarning,
									children: "NSFW"
								});
							}
							return returnedChildren;
						}, "Error in Children Render of Spoiler!");
					}
				}
			}
			
			processUserBanner (e) {
				if (!this.settings.places.userAvatars || !e.instance.props.displayProfile || !e.instance.props.displayProfile.banner) return;
				let div = BDFDB.ReactUtils.findChild(e.returnvalue, {type: "div"});
				if (div) div.props.onContextMenu = event => {
					let validUrls = this.filterUrls(BDFDB.UserUtils.getBanner(e.instance.props.user.id, null, false), BDFDB.LibraryModules.IconUtils.isAnimatedIconHash(e.instance.props.displayProfile._userProfile.banner) && BDFDB.UserUtils.getBanner(e.instance.props.user.id, null, true), e.instance.props.displayProfile._guildMemberProfile.banner && BDFDB.UserUtils.getBanner(e.instance.props.user.id, e.instance.props.guildId, false), e.instance.props.displayProfile._guildMemberProfile.banner && BDFDB.LibraryModules.IconUtils.isAnimatedIconHash(e.instance.props.displayProfile._guildMemberProfile.banner) && BDFDB.UserUtils.getBanner(e.instance.props.user.id, e.instance.props.guildId, true));
					if (validUrls.length) BDFDB.ContextMenuUtils.open(this, event, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: validUrls.length == 1 ? this.createSubMenus({
							instance: {},
							urls: validUrls,
							prefix: BDFDB.LanguageUtils.LanguageStrings.USER_SETTINGS_PROFILE_BANNER
						}) : BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.context_imageactions,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "main-subitem"),
							children: this.createSubMenus({
								instance: {},
								urls: validUrls,
								prefix: BDFDB.LanguageUtils.LanguageStrings.USER_SETTINGS_PROFILE_BANNER
							})
						})
					}));
				};
			}
			
			cacheClickedImage (target) {
				if (!target) return;
				const image = (BDFDB.DOMUtils.getParent(BDFDB.dotCN.imagewrapper, target) || target).querySelector("img, video") || target;
				if (!image) return;
				const message = BDFDB.ReactUtils.findValue(image, "message", {up: true});
				if (!message) return;
				BDFDB.DOMUtils.hide(document.querySelectorAll(BDFDB.dotCN.tooltip));
				firstViewedImage = {message: message, channelId: message.channel_id, proxy_url: image.src};
				viewedImage = firstViewedImage;
				if (cachedImages) cachedImages.index = this.getImageIndex(cachedImages.all, viewedImage);
				viewedImageTimeout = BDFDB.TimeUtils.timeout(_ => {
					firstViewedImage = null;
					viewedImage = null;
				}, 1000);
			}
			
			requestFile (urls, onLoad, onError, config = {}) {
				if (!urls || typeof onLoad != "function") return typeof onError == "function" && onError();
				let url = (urls.url && urls.url.startsWith("/assets") ? (window.location.origin + urls.url) : urls.url || "");
				let isResized = !config.orignalSizeChecked && (url.indexOf("width=") > -1 || url.indexOf("height=") > -1 || url.indexOf("size=") > -1);
				url = isResized ? this.removeSizeInUrl(url) : url;
				let isFormatted = (url.indexOf("format=") > -1);
				url = isFormatted ? this.removeFormatInUrl(url) : url;
				url = url.indexOf("discordapp.com/avatars/") > 0 || url.indexOf("discordapp.com/icons/") > 0 ? `${url}?size=4096` : url;
				BDFDB.LibraryRequires.request(url, {toBuffer: true}, (error, response, buffer) => {
					if (error || response.statusCode != 200 || response.headers["content-type"].indexOf("text/html") > -1) {
						if (isResized) this.requestFile(urls, onLoad, onError, {orignalSizeChecked: true});
						else if (urls.fallbackUrl && urls.url != urls.fallbackUrl) this.requestFile({url: urls.fallbackUrl}, onLoad, onError);
						else if (typeof onError == "function") onError();
					}
					else onLoad(url, buffer);
				});
			}
			
			downloadFile (urls, path, alternativeName) {
				this.requestFile(urls, (url, buffer) => {
					let extension = this.getFileExtension(new Uint8Array(buffer));
					if (!extension) BDFDB.NotificationUtils.toast(this.labels.toast_save_failed.replace("{{var0}}", BDFDB.LanguageUtils.LanguageStrings.IMAGE).replace("{{var1}}", path || "PC"), {type: "danger"});
					else {
						let type = fileTypes[extension].video ? BDFDB.LanguageUtils.LanguageStrings.VIDEO : BDFDB.LanguageUtils.LanguageStrings.IMAGE;
						if (path) BDFDB.LibraryRequires.fs.writeFile(this.getFileName(path, (alternativeName || url.split("/").pop().split(".").slice(0, -1).join(".") || "unknown").slice(0, 35), extension, 0), new Uint8Array(buffer), error => {
							if (error) BDFDB.NotificationUtils.toast(this.labels.toast_save_failed.replace("{{var0}}", type).replace("{{var1}}", path), {type: "danger"});
							else BDFDB.NotificationUtils.toast(this.labels.toast_save_success.replace("{{var0}}", type).replace("{{var1}}", path), {type: "success"});
						});
						else {
							let hrefURL = window.URL.createObjectURL(new Blob([buffer], {type: this.getMimeType(extension)}));
							let tempLink = document.createElement("a");
							tempLink.href = hrefURL;
							tempLink.download = `${(alternativeName || url.split("/").pop().split(".").slice(0, -1).join(".") || "unknown").slice(0, 35)}.${extension}`;
							tempLink.click();
							window.URL.revokeObjectURL(hrefURL);
						}
					}
				}, _ => {
					BDFDB.NotificationUtils.toast(this.labels.toast_save_failed.replace("{{var0}}", BDFDB.LanguageUtils.LanguageStrings.IMAGE).replace("{{var1}}", path || "PC"), {type: "danger"});
				});
			}
			
			copyFile (urls) {
				this.requestFile(urls, url => {
					let type = this.isValid(url, "video") ? BDFDB.LanguageUtils.LanguageStrings.VIDEO : BDFDB.LanguageUtils.LanguageStrings.IMAGE;
					BDFDB.LibraryModules.WindowUtils.copyImage(url);
					BDFDB.NotificationUtils.toast(this.labels.toast_copy_success.replace("{{var0}}", type), {type: "success"});
				}, _ => {
					BDFDB.NotificationUtils.toast(this.labels.toast_copy_failed.replace("{{var0}}", BDFDB.LanguageUtils.LanguageStrings.IMAGE), {type: "danger"});
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
				fileName = fileName.split("?")[0];
				let wholePath = BDFDB.LibraryRequires.path.join(path, i ? `${fileName} (${i}).${extension}` : `${fileName}.${extension}`);
				if (BDFDB.LibraryRequires.fs.existsSync(wholePath)) return this.getFileName(path, fileName, extension, i + 1);
				else return wholePath;
			}
			
			getFileExtension (intArray) {
				for (let fileType in fileTypes) if (fileTypes[fileType].signs.some(signs => signs.every((hex, i) => hex === null || hex == intArray[i]))) return fileType;
				return "";
			}
			
			getMimeType (fileType) {
				if (fileTypes[fileType]) return `${fileTypes[fileType].video ? "video" : "image"}/${fileType == "svg" ? "svg+xml" : fileType}`;
				return "";
			}

			getImageSrc (img) {
				if (!img) return null;
				return (typeof img == "string" ? img : (img.proxy_url || img.src || (typeof img.querySelector == "function" && img.querySelector("canvas") ? img.querySelector("canvas").src : "")));
			}
			
			getImageIndex (messages, img) {
				return messages.findIndex(i => i.message.id == img.message.id && (messages.filter(n => n.message.id == i.message.id).length < 2 || i.url && img.proxy_url && img.proxy_url.indexOf(i.url) > -1 || i.proxy_url && img.proxy_url && img.proxy_url.indexOf(i.proxy_url) > -1));
			}
			
			filterMessagesForImages (messages, img, filterForVideos) {
				return messages.filter(m => m && m.channel_id == img.channelId && !BDFDB.LibraryStores.RelationshipStore.isBlocked(m.author.id) && (firstViewedImage && m.id == firstViewedImage.message.id || m.id == img.message.id || m.embeds.filter(e => e.image || e.thumbnail || e.video).length || m.attachments.filter(a => !a.filename.startsWith("SPOILER_")).length)).map(m => [m.attachments, m.embeds].flat(10).filter(n => n).map(i => Object.assign({message: m, channelId: img.channelId}, i, i.image, i.thumbnail, i.video))).flat(10).filter(n => {
					if (!n) return false;
					let type = (n.type || n.content_type || "").split("/")[0];
					if (type && (filterForVideos && type != "video" || !filterForVideos && type == "video")) return false;
					if (!n.content_type || img.proxy_url == n.proxy_url || img.proxy_url == n.url || img.proxy_url == n.href) return true;
					let extension = (n.content_type.split("/")[1] || "").split("+")[0] || "";
					if (extension && (!fileTypes[extension] || this.settings.galleryFilter[extension] === false)) return false;
					return true;
				});
			}
			
			switchImages (offset, filterForVideos) {
				const newIndex = parseInt(cachedImages.index) + parseInt(offset);
				if (newIndex < 0 || newIndex > (cachedImages.amount - 1)) return;
				
				cachedImages.index = newIndex;
				const oldImage = viewedImage;
				viewedImage = cachedImages.all[cachedImages.index];
				
				if (offset > 0 && !cachedImages.lastReached && cachedImages.index == (cachedImages.amount - 1)) {
					let channel = BDFDB.LibraryStores.ChannelStore.getChannel(viewedImage.channelId);
					BDFDB.LibraryModules.HTTPUtils.get({
						url: BDFDB.DiscordConstants.Endpoints.MESSAGES(channel.id),
						query: BDFDB.LibraryModules.APIEncodeUtils.stringify({
							channel_id: channel && channel.guild_id ? (BDFDB.ChannelUtils.isThread(channel) && channel.parent_id || channel.id) : null,
							has: "image",
							include_nsfw: true,
							limit: 100,
							after: (BigInt(cachedImages.newestId) - BigInt(1)).toString()
						})
					}).then(result => {
						if (result && viewedImage) {
							const messages = result.body.flat(10).reverse();
							Object.assign(cachedImages, {all: this.filterForCopies([].concat(cachedImages.all, this.filterMessagesForImages(messages, viewedImage, filterForVideos)))});
							const index = this.getImageIndex(cachedImages.all, viewedImage);
							cachedImages = Object.assign(cachedImages, {
								channelId: viewedImage.channelId,
								index: index,
								amount: cachedImages.all.length,
								newestId: messages[messages.length-1] ? messages[messages.length-1].id : null,
								lastReached: index == (cachedImages.all.length - 1)
							});
							this.updateImageModal();
						}
					});
				}
				if (offset < 0 && !cachedImages.firstReached && cachedImages.index == 0) {
					let channel = BDFDB.LibraryStores.ChannelStore.getChannel(viewedImage.channelId);
					BDFDB.LibraryModules.HTTPUtils.get({
						url: BDFDB.DiscordConstants.Endpoints.MESSAGES(channel.id),
						query: BDFDB.LibraryModules.APIEncodeUtils.stringify({
							channel_id: channel && channel.guild_id ? (BDFDB.ChannelUtils.isThread(channel) && channel.parent_id || channel.id) : null,
							has: "image",
							include_nsfw: true,
							limit: 100,
							before: (BigInt(cachedImages.oldestId) + BigInt(1)).toString()
						})
					}).then(result => {
						if (result && viewedImage) {
							const messages = result.body.flat(10).reverse();
							Object.assign(cachedImages, {all: this.filterForCopies([].concat(this.filterMessagesForImages(messages, viewedImage, filterForVideos), cachedImages.all))});
							const index = this.getImageIndex(cachedImages.all, viewedImage);
							cachedImages = Object.assign(cachedImages, {
								channelId: viewedImage.channelId,
								firstReached: index == 0,
								oldestId: messages[0] ? messages[0].id : null,
								index: index,
								amount: cachedImages.all.length
							});
							this.updateImageModal();
						}
					});
				}
				let isVideo = this.isValid(viewedImage.proxy_url, "video");
				let thisViewedImage = viewedImage;
				switchedImageProps = {
					animated: !!isVideo,
					children: !isVideo ? null : (videoData => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Video, {
						ignoreMaxSize: true,
						poster: this.getPosterUrl(thisViewedImage.proxy_url),
						src: thisViewedImage.proxy_url,
						width: videoData.size.width,
						height: videoData.size.height,
						naturalWidth: thisViewedImage.width,
						naturalHeight: thisViewedImage.height,
						play: true,
						playOnHover: !!BDFDB.LibraryStores.AccessibilityStore.useReducedMotion
					})),
					height: thisViewedImage.height,
					original: thisViewedImage.url,
					sourceMetadata: {
						identifier: {type: "attachment", attachmentId: thisViewedImage.id},
						message: thisViewedImage.message
					},
					srcIsAnimated: !!isVideo,
					trigger: "CLICK",
					type: isVideo ? "VIDEO" : "IMAGE",
					url: thisViewedImage.url,
					width: thisViewedImage.width,
					zoomThumbnailPlaceholder: thisViewedImage.proxy_url,
				};
				this.updateImageModal();
			}
			
			updateImageModal () {
				BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.imagemodal), {up: true, filter: n => n && n.stateNode && n.stateNode.props && n.stateNode.props.isTopModal && n.stateNode.props.modalKey}));
			}
			
			filterForCopies (messages) {
				let filtered = [];
				for (let message of messages) if (!filtered.find(n => n.message.id == message.message.id && n.id == message.id)) filtered.push(message);
				return filtered;
			}
			
			removeSizeInUrl (url) {
				return (url || "").split(/[&?]width=/)[0].split(/[&?]height=/)[0].split(/[&?]size=/)[0].split(/[&?]width=/)[0].split(/[&?]height=/)[0].split(/[&?]size=/)[0];
			}

			removeFormatInUrl (url) {
				return (url || "").replace(/format\=[A-z]+(\&){0,1}/g, "");
			}
			
			addListener (eventType, type, callback) {
				if (!type || !eventType || typeof callback != "function") return;
				if (!eventTypes[type]) eventTypes[type] = [];
				if (!eventTypes[type].includes(eventType)) eventTypes[type].push(eventType);
				document.removeEventListener(eventType, document[`${eventType}${this.name}${type}Listener`]);
				delete document[`${eventType}${this.name}${type}Listener`];
				document[`${eventType}${this.name}${type}Listener`] = callback;
				document.addEventListener(eventType, document[`${eventType}${this.name}${type}Listener`]);
			}
			
			cleanupListeners (type) {
				if (!type || !eventTypes[type]) return;
				for (let eventType of eventTypes[type]) {
					document.removeEventListener(eventType, document[`${eventType}${this.name}${type}Listener`]);
					delete document[`${eventType}${this.name}${type}Listener`];
				}
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							context_copy:						"Копирайте {{var0}}",
							context_imageactions:						"Действия с изображения",
							context_lenssize:					"Размер на обектива",
							context_saveas:						"Запазете {{var0}} като ...",
							context_searchwith:					"Търсете {{var0}} с ...",
							context_streamactions:						"Действия за визуализация на потока",
							context_videoactions:						"Видео действия",
							context_view:						"Преглед {{var0}}",
							context_zoomspeed:					"Скорост на мащабиране",
							submenu_disabled:					"Всички инвалиди",
							toast_copy_failed:					"{{var0}} не можа да бъде копиран в клипборда",
							toast_copy_success:					"{{var0}} беше копиран в клипборда",
							toast_save_failed:					"{{var0}} не можа да бъде запазен в '{{var1}}'",
							toast_save_success:					"{{var0}} бе запазено в '{{var1}}'"
						};
					case "cs":		// Czech
						return {
							context_copy:						"Zkopírovat {{var0}}",
							context_imageactions:					"Akce s obrázky",
							context_lenssize:					"Velikost lupy",
							context_saveas:						"Uložit {{var0}} jako...",
							context_searchwith:					"Hledat {{var0}} pomocí...",
							context_streamactions:					"Akce náhledu streamu",
							context_videoactions:					"Video akce",
							context_view:						"Zobrazit {{var0}}",
							context_zoomspeed:					"Rychlost zoomu",
							submenu_disabled:					"Vše zakázáno",
							toast_copy_failed:					"{{var0}} nemohl být zkopírován do schránky",
							toast_copy_success:					"{{var0}} byl zkopírován do schránky",
							toast_save_failed:					"{{var0}} nemohl být uložen do '{{var1}}'",
							toast_save_success:					"{{var0}} bylo uložen do '{{var1}}'"
						};
					case "da":		// Danish
						return {
							context_copy:						"Kopiér {{var0}}",
							context_imageactions:					"Billedhandlinger",
							context_lenssize:					"Objektivstørrelse",
							context_saveas:						"Gem {{var0}} som ...",
							context_searchwith:					"Søg i {{var0}} med ...",
							context_streamactions:					"Stream forhåndsvisningshandlinger",
							context_videoactions:					"Videohandlinger",
							context_view:						"Se {{var0}}",
							context_zoomspeed:					"Zoomhastighed",
							submenu_disabled:					"Alle handicappede",
							toast_copy_failed:					"{{var0}} kunne ikke kopieres til udklipsholderen",
							toast_copy_success:					"{{var0}} blev kopieret til udklipsholderen",
							toast_save_failed:					"{{var0}} kunne ikke gemmes i '{{var1}}'",
							toast_save_success:					"{{var0}} blev gemt i '{{var1}}'"
						};
					case "de":		// German
						return {
							context_copy:						"{{var0}} kopieren",
							context_imageactions:					"Bildaktionen",
							context_lenssize:					"Linsengröße",
							context_saveas:						"{{var0}} speichern als ...",
							context_searchwith:					"{{var0}} suchen mit ...",
							context_streamactions:					"Stream-Vorschau-Aktionen",
							context_videoactions:					"Videoaktionen",
							context_view:						"{{var0}} ansehen",
							context_zoomspeed:					"Zoomgeschwindigkeit",
							submenu_disabled:					"Alle deaktiviert",
							toast_copy_failed:					"{{var0}} konnte nicht in die Zwischenablage kopiert werden",
							toast_copy_success:					"{{var0}} wurde in die Zwischenablage kopiert",
							toast_save_failed:					"{{var0}} konnte nicht in '{{var1}}' gespeichert werden",
							toast_save_success:					"{{var0}} wurde in '{{var1}}' gespeichert"
						};
					case "el":		// Greek
						return {
							context_copy:						"Αντιγραφή {{var0}}",
							context_imageactions:					"Ενέργειες εικόνας",
							context_lenssize:					"Μέγεθος φακού",
							context_saveas:						"Αποθήκευση {{var0}} ως ...",
							context_searchwith:					"Αναζήτηση {{var0}} με ...",
							context_streamactions:					"Ενέργειες προεπισκόπησης ροής",
							context_videoactions:					"Ενέργειες βίντεο",
							context_view:						"Προβολή {{var0}}",
							context_zoomspeed:					"Ταχύτητα ζουμ",
							submenu_disabled:					"Όλα τα άτομα με ειδικές ανάγκες",
							toast_copy_failed:					"Δεν ήταν δυνατή η αντιγραφή του {{var0}} στο πρόχειρο",
							toast_copy_success:					"Το {{var0}} αντιγράφηκε στο πρόχειρο",
							toast_save_failed:					"Δεν ήταν δυνατή η αποθήκευση του {{var0}} στο '{{var1}}'",
							toast_save_success:					"Το {{var0}} αποθηκεύτηκε στο '{{var1}}'"
						};
					case "es":		// Spanish
						return {
							context_copy:						"Copiar {{var0}}",
							context_imageactions:					"Acciones de imagen",
							context_lenssize:					"Tamaño de la lente",
							context_saveas:						"Guardar {{var0}} como ...",
							context_searchwith:					"Buscar {{var0}} con ...",
							context_streamactions:					"Acciones de vista previa de transmisión",
							context_videoactions:					"Acciones de vídeo",
							context_view:						"Ver {{var0}}",
							context_zoomspeed:					"Velocidad de zoom",
							submenu_disabled:					"Todos discapacitados",
							toast_copy_failed:					"{{var0}} no se pudo copiar al portapapeles",
							toast_copy_success:					"{{var0}} se copió en el portapapeles",
							toast_save_failed:					"{{var0}} no se pudo guardar en '{{var1}}'",
							toast_save_success:					"{{var0}} se guardó en '{{var1}}'"
						};
					case "fi":		// Finnish
						return {
							context_copy:						"Kopioi {{var0}}",
							context_imageactions:					"Kuvatoiminnot",
							context_lenssize:					"Linssin koko",
							context_saveas:						"Tallenna {{var0}} nimellä ...",
							context_searchwith:					"Tee haku {{var0}} ...",
							context_streamactions:					"Streamin esikatselutoiminnot",
							context_videoactions:					"Videotoiminnot",
							context_view:						"Näytä {{var0}}",
							context_zoomspeed:					"Zoomausnopeus",
							submenu_disabled:					"Kaikki vammaiset",
							toast_copy_failed:					"Kohdetta {{var0}} ei voitu kopioida leikepöydälle",
							toast_copy_success:					"{{var0}} kopioitiin leikepöydälle",
							toast_save_failed:					"Kohdetta {{var0}} ei voitu tallentaa kansioon '{{var1}}'",
							toast_save_success:					"{{var0}} tallennettiin kansioon '{{var1}}'"
						};
					case "fr":		// French
						return {
							context_copy:						"Copier {{var0}}",
							context_imageactions:					"Actions sur les images",
							context_lenssize:					"Taille de l'objectif",
							context_saveas:						"Enregistrer {{var0}} sous ...",
							context_searchwith:					"Rechercher {{var0}} avec ...",
							context_streamactions:					"Actions d'aperçu de flux",
							context_videoactions:					"Actions vidéo",
							context_view:						"Afficher {{var0}}",
							context_zoomspeed:					"Vitesse de zoom",
							submenu_disabled:					"Tout désactivé",
							toast_copy_failed:					"{{var0}} n'a pas pu être copié dans le presse-papiers",
							toast_copy_success:					"{{var0}} a été copié dans le presse-papiers",
							toast_save_failed:					"{{var0}} n'a pas pu être enregistré dans '{{var1}}'",
							toast_save_success:					"{{var0}} a été enregistré dans '{{var1}}'"
						};
					case "hi":		// Hindi
						return {
							context_copy:						"कॉपी {{var0}}",
							context_imageactions:					"छवि क्रियाएँ",
							context_lenssize:					"लेंस का आकार",
							context_saveas:						"{{var0}} को इस रूप में सेव करें...",
							context_searchwith:					"इसके साथ {{var0}} खोजें ...",
							context_streamactions:					"स्ट्रीम पूर्वावलोकन क्रियाएं",
							context_videoactions:					"वीडियो क्रिया",
							context_view:						"देखें {{var0}}",
							context_zoomspeed:					"ज़ूम गति",
							submenu_disabled:					"सभी अक्षम",
							toast_copy_failed:					"{{var0}} को क्लिपबोर्ड पर कॉपी नहीं किया जा सका",
							toast_copy_success:					"{{var0}} को क्लिपबोर्ड पर कॉपी किया गया था",
							toast_save_failed:					"{{var0}} '{{var1}}' में सहेजा नहीं जा सका",
							toast_save_success:					"{{var0}} '{{var1}}' में सहेजा गया था"
						};
					case "hr":		// Croatian
						return {
							context_copy:						"Kopiraj {{var0}}",
							context_imageactions:					"Radnje slike",
							context_lenssize:					"Veličina leće",
							context_saveas:						"Spremi {{var0}} kao ...",
							context_searchwith:					"Traži {{var0}} sa ...",
							context_streamactions:					"Radnje pregleda streama",
							context_videoactions:					"Video radnje",
							context_view:						"Pogledajte {{var0}}",
							context_zoomspeed:					"Brzina zumiranja",
							submenu_disabled:					"Svi invalidi",
							toast_copy_failed:					"{{var0}} nije moguće kopirati u međuspremnik",
							toast_copy_success:					"{{var0}} je kopirano u međuspremnik",
							toast_save_failed:					"{{var0}} nije moguće spremiti u '{{var1}}'",
							toast_save_success:					"{{var0}} spremljeno je u '{{var1}}'"
						};
					case "hu":		// Hungarian
						return {
							context_copy:						"{{var0}} másolása",
							context_imageactions:					"Képműveletek",
							context_lenssize:					"Lencse mérete",
							context_saveas:						"{{var0}} mentése másként ...",
							context_searchwith:					"Keresés a következőben: {{var0}} a következővel:",
							context_streamactions:					"Stream előnézeti műveletek",
							context_videoactions:					"Videóműveletek",
							context_view:						"Megtekintés: {{var0}}",
							context_zoomspeed:					"Zoom sebesség",
							submenu_disabled:					"Minden fogyatékkal él",
							toast_copy_failed:					"A {{var0}} fájl nem másolható a vágólapra",
							toast_copy_success:					"A {{var0}} elemet a vágólapra másolta",
							toast_save_failed:					"A {{var0}} fájl mentése nem sikerült a '{{var1}}' mappába",
							toast_save_success:					"{{var0}} mentve a '{{var1}}' mappába"
						};
					case "it":		// Italian
						return {
							context_copy:						"Copia {{var0}}",
							context_imageactions:					"Azioni immagine",
							context_lenssize:					"Dimensione della lente",
							context_saveas:						"Salva {{var0}} come ...",
							context_searchwith:					"Cerca {{var0}} con ...",
							context_streamactions:					"Azioni di anteprima del flusso",
							context_videoactions:					"Azioni video",
							context_view:						"Visualizza {{var0}}",
							context_zoomspeed:					"Velocità dello zoom",
							submenu_disabled:					"Tutti disabilitati",
							toast_copy_failed:					"{{var0}} non può essere copiato negli appunti",
							toast_copy_success:					"{{var0}} è stato copiato negli appunti",
							toast_save_failed:					"Impossibile salvare {{var0}} in '{{var1}}'",
							toast_save_success:					"{{var0}} è stato salvato in '{{var1}}'"
						};
					case "ja":		// Japanese
						return {
							context_copy:						"{{var0}} をコピーします",
							context_imageactions:					"画像アクション",
							context_lenssize:					"レンズサイズ",
							context_saveas:						"{{var0}} を...として保存します",
							context_searchwith:					"{{var0}} を...で検索",
							context_streamactions:					"ストリーム プレビュー アクション",
							context_videoactions:					"ビデオ アクション",
							context_view:						"{{var0}} を表示",
							context_zoomspeed:					"ズーム速度",
							submenu_disabled:					"すべて無効",
							toast_copy_failed:					"{{var0}} をクリップボードにコピーできませんでした",
							toast_copy_success:					"{{var0}} がクリップボードにコピーされました",
							toast_save_failed:					"{{var0}} を「'{{var1}}'」に保存できませんでした",
							toast_save_success:					"{{var0}} は「'{{var1}}'」に保存されました"
						};
					case "ko":		// Korean
						return {
							context_copy:						"{{var0}} 복사",
							context_imageactions:					"이미지 작업",
							context_lenssize:					"렌즈 크기",
							context_saveas:						"{{var0}} 을 다른 이름으로 저장 ...",
							context_searchwith:					"{{var0}} 검색 ...",
							context_streamactions:					"스트림 미리보기 작업",
							context_videoactions:					"비디오 작업",
							context_view:						"{{var0}} 보기",
							context_zoomspeed:					"줌 속도",
							submenu_disabled:					"모두 비활성화 됨",
							toast_copy_failed:					"{{var0}} 을 클립 보드에 복사 할 수 없습니다.",
							toast_copy_success:					"{{var0}} 이 클립 보드에 복사되었습니다.",
							toast_save_failed:					"{{var0}} 을 '{{var1}}'에 저장할 수 없습니다.",
							toast_save_success:					"{{var0}} 이 '{{var1}}'에 저장되었습니다."
						};
					case "lt":		// Lithuanian
						return {
							context_copy:						"Kopijuoti {{var0}}",
							context_imageactions:					"Vaizdo veiksmai",
							context_lenssize:					"Objektyvo dydis",
							context_saveas:						"Išsaugoti '{{var0}}' kaip ...",
							context_searchwith:					"Ieškoti {{var0}} naudojant ...",
							context_streamactions:					"Srauto peržiūros veiksmai",
							context_videoactions:					"Vaizdo įrašų veiksmai",
							context_view:						"Žiūrėti {{var0}}",
							context_zoomspeed:					"Priartinimo greitis",
							submenu_disabled:					"Visi neįgalūs",
							toast_copy_failed:					"{{var0}} nepavyko nukopijuoti į mainų sritį",
							toast_copy_success:					"{{var0}} buvo nukopijuota į mainų sritį",
							toast_save_failed:					"Nepavyko išsaugoti {{var0}} aplanke '{{var1}}'",
							toast_save_success:					"{{var0}} išsaugotas aplanke '{{var1}}'"
						};
					case "nl":		// Dutch
						return {
							context_copy:						"Kopieer {{var0}}",
							context_imageactions:					"Afbeeldingsacties",
							context_lenssize:					"Lens Maat",
							context_saveas:						"Bewaar {{var0}} als ...",
							context_searchwith:					"Zoek {{var0}} met ...",
							context_streamactions:					"Stream Preview-acties",
							context_videoactions:					"Video-acties",
							context_view:						"Bekijk {{var0}}",
							context_zoomspeed:					"Zoom snelheid",
							submenu_disabled:					"Allemaal uitgeschakeld",
							toast_copy_failed:					"{{var0}} kan niet naar het klembord worden gekopieerd",
							toast_copy_success:					"{{var0}} is naar het klembord gekopieerd",
							toast_save_failed:					"{{var0}} kan niet worden opgeslagen in '{{var1}}'",
							toast_save_success:					"{{var0}} is opgeslagen in '{{var1}}'"
						};
					case "no":		// Norwegian
						return {
							context_copy:						"Kopier {{var0}}",
							context_imageactions:					"Bildehandlinger",
							context_lenssize:					"Linsestørrelse",
							context_saveas:						"Lagre {{var0}} som ...",
							context_searchwith:					"Søk på {{var0}} med ...",
							context_streamactions:					"Strøm forhåndsvisningshandlinger",
							context_videoactions:					"Videohandlinger",
							context_view:						"Vis {{var0}}",
							context_zoomspeed:					"Zoomhastighet",
							submenu_disabled:					"Alle funksjonshemmede",
							toast_copy_failed:					"{{var0}} kunne ikke kopieres til utklippstavlen",
							toast_copy_success:					"{{var0}} ble kopiert til utklippstavlen",
							toast_save_failed:					"{{var0}} kunne ikke lagres i '{{var1}}'",
							toast_save_success:					"{{var0}} ble lagret i '{{var1}}'"
						};
					case "pl":		// Polish
						return {
							context_copy:						"Kopiuj {{var0}}",
							context_imageactions:					"Działania związane z obrazem",
							context_lenssize:					"Rozmiar soczewki",
							context_saveas:						"Zapisz {{var0}} jako ...",
							context_searchwith:					"Wyszukaj {{var0}} za pomocą ...",
							context_streamactions:					"Akcje podglądu strumienia",
							context_videoactions:					"Akcje wideo",
							context_view:						"Wyświetl {{var0}}",
							context_zoomspeed:					"Szybkość zoomu",
							submenu_disabled:					"Wszystkie wyłączone",
							toast_copy_failed:					"Nie można skopiować {{var0}} do schowka",
							toast_copy_success:					"{{var0}} został skopiowany do schowka",
							toast_save_failed:					"Nie można zapisać {{var0}} w '{{var1}}'",
							toast_save_success:					"{{var0}} został zapisany w '{{var1}}'"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							context_copy:						"Copiar {{var0}}",
							context_imageactions:					"Ações de imagem",
							context_lenssize:					"Tamanho da lente",
							context_saveas:						"Salvar {{var0}} como ...",
							context_searchwith:					"Pesquisar {{var0}} com ...",
							context_streamactions:					"Ações de visualização de fluxo",
							context_videoactions:					"Ações de vídeo",
							context_view:						"Visualizar {{var0}}",
							context_zoomspeed:					"Velocidade do zoom",
							submenu_disabled:					"Todos desativados",
							toast_copy_failed:					"{{var0}} não pôde ser copiado para a área de transferência",
							toast_copy_success:					"{{var0}} foi copiado para a área de transferência",
							toast_save_failed:					"{{var0}} não pôde ser salvo em '{{var1}}'",
							toast_save_success:					"{{var0}} foi salvo em '{{var1}}'"
						};
					case "ro":		// Romanian
						return {
							context_copy:						"Copiați {{var0}}",
							context_imageactions:					"Acțiuni de imagine",
							context_lenssize:					"Dimensiunea obiectivului",
							context_saveas:						"Salvați {{var0}} ca ...",
							context_searchwith:					"Căutați {{var0}} cu ...",
							context_streamactions:					"Acțiuni de previzualizare în flux",
							context_videoactions:					"Acțiuni video",
							context_view:						"Vizualizați {{var0}}",
							context_zoomspeed:					"Viteza de zoom",
							submenu_disabled:					"Toate sunt dezactivate",
							toast_copy_failed:					"{{var0}} nu a putut fi copiat în clipboard",
							toast_copy_success:					"{{var0}} a fost copiat în clipboard",
							toast_save_failed:					"{{var0}} nu a putut fi salvat în '{{var1}}'",
							toast_save_success:					"{{var0}} a fost salvat în '{{var1}}'"
						};
					case "ru":		// Russian
						return {
							context_copy:						"Скопируйте {{var0}}",
							context_imageactions:					"Действия с изображением",
							context_lenssize:					"Размер линзы",
							context_saveas:						"Сохранить {{var0}} как ...",
							context_searchwith:					"Искать {{var0}} с помощью ...",
							context_streamactions:					"Действия предварительного просмотра трансляции",
							context_videoactions:					"Действия с видео",
							context_view:						"Посмотреть {{var0}}",
							context_zoomspeed:					"Скорость масштабирования",
							submenu_disabled:					"Все отключены",
							toast_copy_failed:					"{{var0}} не удалось скопировать в буфер обмена",
							toast_copy_success:					"{{var0}} скопирован в буфер обмена",
							toast_save_failed:					"{{var0}} не удалось сохранить в '{{var1}}'",
							toast_save_success:					"{{var0}} был сохранен в '{{var1}}'"
						};
					case "sv":		// Swedish
						return {
							context_copy:						"Kopiera {{var0}}",
							context_imageactions:					"Bildåtgärder",
							context_lenssize:					"Linsstorlek",
							context_saveas:						"Spara {{var0}} som ...",
							context_searchwith:					"Sök {{var0}} med ...",
							context_streamactions:					"Streama förhandsgranskningsåtgärder",
							context_videoactions:					"Videoåtgärder",
							context_view:						"Visa {{var0}}",
							context_zoomspeed:					"Zoomhastighet",
							submenu_disabled:					"Alla funktionshindrade",
							toast_copy_failed:					"{{var0}} kunde inte kopieras till Urklipp",
							toast_copy_success:					"{{var0}} kopierades till Urklipp",
							toast_save_failed:					"{{var0}} kunde inte sparas i '{{var1}}'",
							toast_save_success:					"{{var0}} sparades i '{{var1}}'"
						};
					case "th":		// Thai
						return {
							context_copy:						"คัดลอก{{var0}}",
							context_imageactions:					"การทำงานของรูปภาพ",
							context_lenssize:					"ขนาดเลนส์",
							context_saveas:						"บันทึก{{var0}}เป็น ...",
							context_searchwith:					"ค้นหา{{var0}} ้วย ...",
							context_streamactions:					"การดำเนินการแสดงตัวอย่างสตรีม",
							context_videoactions:					"การกระทำของวิดีโอ",
							context_view:						"ดู{{var0}}",
							context_zoomspeed:					"ความเร็วในการซูม",
							submenu_disabled:					"ปิดใช้งานทั้งหมด",
							toast_copy_failed:					"ไม่สามารถคัดลอก{{var0}}ไปยังคลิปบอร์ดได้",
							toast_copy_success:					"คัดลอก{{var0}}ไปยังคลิปบอร์ดแล้ว",
							toast_save_failed:					"ไม่สามารถบันทึก{{var0}}ใน '{{var1}}'",
							toast_save_success:					"{{var0}} ูกบันทึกใน '{{var1}}'"
						};
					case "tr":		// Turkish
						return {
							context_copy:						"{{var0}} kopyala",
							context_imageactions:					"Görüntü Eylemleri",
							context_lenssize:					"Lens Boyutu",
							context_saveas:						"{{var0}} farklı kaydet ...",
							context_searchwith:					"{{var0}} şununla ara ...",
							context_streamactions:					"Akış Önizleme İşlemleri",
							context_videoactions:					"Video Eylemleri",
							context_view:						"{{var0}} görüntüle",
							context_zoomspeed:					"yakınlaştırma hızı",
							submenu_disabled:					"Hepsi devre dışı",
							toast_copy_failed:					"{{var0}} panoya kopyalanamadı",
							toast_copy_success:					"{{var0}} panoya kopyalandı",
							toast_save_failed:					"{{var0}}, '{{var1}}' konumuna kaydedilemedi",
							toast_save_success:					"{{var0}}, '{{var1}}' konumuna kaydedildi"
						};
					case "uk":		// Ukrainian
						return {
							context_copy:						"Копіювати {{var0}}",
							context_imageactions:					"Дії із зображеннями",
							context_lenssize:					"Розмір лінзи",
							context_saveas:						"Збережіть {{var0}} як ...",
							context_searchwith:					"Шукати {{var0}} за допомогою ...",
							context_streamactions:					"Дії попереднього перегляду потоку",
							context_videoactions:					"Відео дії",
							context_view:						"Переглянути {{var0}}",
							context_zoomspeed:					"Швидкість масштабування",
							submenu_disabled:					"Всі інваліди",
							toast_copy_failed:					"Не вдалося скопіювати {{var0}} у буфер обміну",
							toast_copy_success:					"{{var0}} скопійовано в буфер обміну",
							toast_save_failed:					"Не вдалося зберегти {{var0}} у '{{var1}}'",
							toast_save_success:					"{{var0}} було збережено у '{{var1}}'"
						};
					case "vi":		// Vietnamese
						return {
							context_copy:						"Sao chép {{var0}}",
							context_imageactions:					"Hành động hình ảnh",
							context_lenssize:					"Kích thước ống kính",
							context_saveas:						"Lưu {{var0}} dưới dạng ...",
							context_searchwith:					"Tìm kiếm {{var0}} bằng ...",
							context_streamactions:					"Tác vụ xem trước luồng",
							context_videoactions:					"Hành động video",
							context_view:						"Xem {{var0}}",
							context_zoomspeed:					"tốc độ thu phóng",
							submenu_disabled:					"Tất cả đã bị vô hiệu hóa",
							toast_copy_failed:					"Không thể sao chép {{var0}} vào khay nhớ tạm",
							toast_copy_success:					"{{var0}} đã được sao chép vào khay nhớ tạm",
							toast_save_failed:					"Không thể lưu {{var0}} trong '{{var1}}'",
							toast_save_success:					"{{var0}} đã được lưu trong '{{var1}}'"
						};
					case "zh-CN":	// Chinese (China)
						return {
							context_copy:						"复制 {{var0}}",
							context_imageactions:					"图像动作",
							context_lenssize:					"缩放尺寸",
							context_saveas:						"将 {{var0}} 另存到...",
							context_searchwith:					"搜索 {{var0}} 使用...",
							context_streamactions:					"流预览操作",
							context_videoactions:					"视频动作",
							context_view:						"查看 {{var0}}",
							context_zoomspeed:					"变焦速度",
							submenu_disabled:					"全部禁用",
							toast_copy_failed:					"{{var0}} 无法复制到剪贴板",
							toast_copy_success:					"{{var0}} 已复制到剪贴板",
							toast_save_failed:					"{{var0}} 无法保存到'{{var1}}'",
							toast_save_success:					"{{var0}} 已保存到'{{var1}}'"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							context_copy:						"複製 {{var0}}",
							context_imageactions:					"圖像動作",
							context_lenssize:					"縮放尺寸",
							context_saveas:						"將 {{var0}} 另存到...",
							context_searchwith:					"搜尋 {{var0}} 使用...",
							context_streamactions:					"流預覽操作",
							context_videoactions:					"視頻動作",
							context_view:						"預覽 {{var0}}",
							context_zoomspeed:					"变焦速度",
							submenu_disabled:					"全部關閉",
							toast_copy_failed:					"{{var0}} 無法複製到剪貼簿",
							toast_copy_success:					"{{var0}} 已複製到剪貼簿",
							toast_save_failed:					"{{var0}} 無法儲存到 '{{var1}}'",
							toast_save_success:					"{{var0}} 已儲存到 '{{var1}}'"
						};
					default:		// English
						return {
							context_copy:						"Copy {{var0}}",
							context_imageactions:					"Image Actions",
							context_lenssize:					"Lens size",
							context_saveas:						"Save {{var0}} as ...",
							context_searchwith:					"Search {{var0}} with ...",
							context_streamactions:					"Stream Preview Actions",
							context_videoactions:					"Video Actions",
							context_view:						"View {{var0}}",
							context_zoomspeed:					"Zoom speed",
							submenu_disabled:					"All disabled",
							toast_copy_failed:					"{{var0}} could not be copied to the Clipboard",
							toast_copy_success:					"{{var0}} was copied to the Clipboard",
							toast_save_failed:					"{{var0}} could not be saved in '{{var1}}'",
							toast_save_success:					"{{var0}} was saved in '{{var1}}'"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();