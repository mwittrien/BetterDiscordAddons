//META{"name":"ImageGallery","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ImageGallery","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ImageGallery/ImageGallery.plugin.js"}*//

var ImageGallery = (_ => {
	var eventFired, clickedImage;
	
	return class ImageGallery {
		getName () {return "ImageGallery";}

		getVersion () {return "1.6.8";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Allows the user to browse through images sent inside the same message.";}

		constructor () {
			this.changelog = {
				"improved":[["Styling","Fixed the style for the details section"]]
			};

			this.patchedModules = {
				after: {
					ImageModal: ["render", "componentDidMount"]
				}
			};
		}

		initConstructor () {
			this.defaults = {
				settings: {
					addDetails: 	{value:true,			description:"Adds details (name, size, amount) to the Image Modal"}
				}
			};
			
			this.css = `
				${BDFDB.dotCN._imagegallerysibling} {
					display: flex;
					align-items: center;
					position: fixed;
					top: 50%;
					bottom: 50%;
					cursor: pointer;
					z-index: -1;
				}
				${BDFDB.dotCN._imagegalleryprevious} {
					justify-content: flex-end;
					right: 90%;
				} 
				${BDFDB.dotCN._imagegallerynext} {
					justify-content: flex-start;
					left: 90%;
				}
				${BDFDB.dotCN._imagegalleryicon} {
					position: absolute;
					background: rgba(0, 0, 0, 0.3);
					border-radius: 50%;
					padding: 15px;
					transition: all 0.3s ease;
				}
				${BDFDB.dotCNS._imagegalleryprevious + BDFDB.dotCN._imagegalleryicon} {
					right: 10px;
				} 
				${BDFDB.dotCNS._imagegallerynext + BDFDB.dotCN._imagegalleryicon} {
					left: 10px;
				}
				${BDFDB.dotCN._imagegallerysibling}:hover ${BDFDB.dotCN._imagegalleryicon} {
					background: rgba(0, 0, 0, 0.5);
				}
				${BDFDB.dotCN._imagegallerydetailswrapper} {
					position: fixed;
					bottom: 10px;
					left: 15px;
					right: 15px;
					pointer-events: none;
				}
				${BDFDB.dotCN._imagegallerydetails} {
					margin-top: 5px;
					font-size: 14px;
					font-weight: 500;
				}
				${BDFDB.dotCN._imagegallerydetailslabel} {
					font-weight: 600;
				}
			`;
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settings = BDFDB.DataUtils.get(this, "settings");
			let settingsPanel, settingsItems = [];
			
			for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
			}));
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
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
				
				eventFired = false;
				clickedImage = null;

				BDFDB.ListenerUtils.add(this, document.body, "click", BDFDB.dotCNS.message + BDFDB.dotCNS.imagewrapper + "img", e => {
					clickedImage = e.target;
					BDFDB.TimeUtils.timeout(_ => {clickedImage = null;});
				});

				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.ModuleUtils.forceAllUpdates(this);

				BDFDB.PluginUtils.clear(this);
			}
		}


		// begin of own functions

		processImageModal (e) {
			if (clickedImage) e.instance.props.cachedImage = clickedImage;
			let src = e.instance.props.cachedImage && e.instance.props.cachedImage.src ? e.instance.props.cachedImage : e.instance.props.src;
			let messages = this.getMessageGroupOfImage(src);
			if (messages.length) {
				if (e.returnvalue) {
					let images = messages.map(n => Array.from(n.querySelectorAll(BDFDB.dotCNS.imagewrapper + "img"))).flat().filter(img => !BDFDB.DOMUtils.getParent(BDFDB.dotCN.spoilerhidden, img));
					let next, previous, index = 0, amount = images.length;
					for (let i = 0; i < amount; i++) if (this.isSameImage(src, images[i])) {
						index = i;
						previous = images[i-1];
						next = images[i+1];
						break;
					}
					if (previous) {
						if (e.instance.previousRef) e.returnvalue.props.children.push(this.createImageWrapper(e.instance, e.instance.previousRef, "previous", BDFDB.LibraryComponents.SvgIcon.Names.LEFT_CARET));
						else this.loadImage(e.instance, previous, "previous");
					}
					if (next) {
						if (e.instance.nextRef) e.returnvalue.props.children.splice(1, 0, this.createImageWrapper(e.instance, e.instance.nextRef, "next", BDFDB.LibraryComponents.SvgIcon.Names.RIGHT_CARET));
						else this.loadImage(e.instance, next, "next");
					}
					if (BDFDB.DataUtils.get(this, "settings", "addDetails")) e.returnvalue.props.children.push(BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN._imagegallerydetailswrapper,
						children: [
							{label: "Source", text: e.instance.props.src},
							{label: "Size", text: `${e.instance.props.width} x ${e.instance.props.height}px`},
							{label: "Image", text: `${index+1} of ${amount}`}
						].map(data => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextElement, {
							className: BDFDB.disCN._imagegallerydetails,
							children: [
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN._imagegallerydetailslabel,
									children: data.label + ":"
								}),
								data.text
							]
						}))
					}));
				}
				if (e.node) {
					BDFDB.DOMUtils.addClass(BDFDB.DOMUtils.getParent(BDFDB.dotCN.modal, e.node), BDFDB.disCN._imagegallerygallery);
					this.cleanUpListeners();
					document.keydownImageGalleryListener = event => {
						if (!document.contains(e.node)) this.cleanUpListeners();
						else if (!eventFired) {
							eventFired = true;
							if (event.keyCode == 37) this.switchImages(e.instance, "previous");
							else if (event.keyCode == 39) this.switchImages(e.instance, "next");
						}
					};
					document.keyupImageGalleryListener = _ => {
						eventFired = false;
						if (!document.contains(e.node)) this.cleanUpListeners();
					};
					document.addEventListener("keydown", document.keydownImageGalleryListener);
					document.addEventListener("keyup", document.keyupImageGalleryListener);
				}
			}
		}

		getMessageGroupOfImage (src) {
			if (src) for (let message of document.querySelectorAll(BDFDB.dotCN.message)) for (let img of message.querySelectorAll(BDFDB.dotCNS.imagewrapper + "img")) if (this.isSameImage(src, img)) {
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
		
		isSameImage (src, img) {
			return img.src && (Node.prototype.isPrototypeOf(src) && img == src || !Node.prototype.isPrototypeOf(src) && this.getImageSrc(img) == this.getImageSrc(src));
		}

		getImageSrc (img) {
			if (!img) return null;
			return (typeof img == "string" ? img : (img.src || (img.querySelector("canvas") ? img.querySelector("canvas").src : ""))).split("?width=")[0];
		}
		
		createImageWrapper (instance, imgRef, type, svgIcon) {
			return BDFDB.ReactUtils.createElement("div", {
				className: BDFDB.disCNS._imagegallerysibling + BDFDB.disCN[`_imagegallery${type}`],
				onClick: _ => {this.switchImages(instance, type);},
				children: [
					imgRef,
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
						className: BDFDB.disCNS._imagegalleryicon + BDFDB.disCN.svgicon,
						name: svgIcon
					})
				]
			});
		}
		
		loadImage (instance, img, type) {
			let imagethrowaway = document.createElement("img");
			let src = this.getImageSrc(img);
			imagethrowaway.src = src;
			imagethrowaway.onload = _ => {
				let arects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount));
				let resizeY = (arects.height/imagethrowaway.naturalHeight) * 0.65, resizeX = (arects.width/imagethrowaway.naturalWidth) * 0.8;
				let resize = resizeX < resizeY ? resizeX : resizeY;
				let newHeight = imagethrowaway.naturalHeight * resize;
				let newWidth = imagethrowaway.naturalWidth * resize;
				instance[type + "Img"] = img;
				instance[type + "Ref"] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.LazyImage, {
					src: src,
					height: imagethrowaway.naturalHeight,
					width: imagethrowaway.naturalWidth,
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
		
		cleanUpListeners () {
			document.removeEventListener("keydown", document.keydownImageGalleryListener);
			document.removeEventListener("keyup", document.keyupImageGalleryListener);
			delete document.keydownImageGalleryListener;
			delete document.keyupImageGalleryListener;
		}
	}
})();