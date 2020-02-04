//META{"name":"ImageGallery","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ImageGallery","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ImageGallery/ImageGallery.plugin.js"}*//

var ImageGallery = (_ => {
	var eventFired;
	
	return class ImageGallery {
		getName () {return "ImageGallery";}

		getVersion () {return "1.6.3";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Allows the user to browse through images sent inside the same message.";}

		constructor () {
			this.changelog = {
				"fixed":[["Message Update","Fixed the plugin for the new Message Update"]],
				"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
			};

			this.patchedModules = {
				after: {
					ImageModal: ["render", "componentDidMount"]
				}
			};
		}

		initConstructor () {
			this.css = `
				${BDFDB.dotCNS._imagegallerygallery + BDFDB.dotCN.imagewrapper + BDFDB.dotCN._imagegalleryprevious},
				${BDFDB.dotCNS._imagegallerygallery + BDFDB.dotCN.imagewrapper + BDFDB.dotCN._imagegallerynext} {
					position: fixed;
					z-index: -1;
				}
				${BDFDB.dotCNS._imagegallerygallery + BDFDB.dotCN.imagewrapper + BDFDB.dotCN._imagegalleryprevious} {
					right: 90%;
				} 
				${BDFDB.dotCNS._imagegallerygallery + BDFDB.dotCN.imagewrapper + BDFDB.dotCN._imagegallerynext} {
					left: 90%;
				}`;
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
			let messages = this.getMessageGroupOfImage(e.instance.props.src);
			if (messages.length) {
				if (e.returnvalue) {
					let images = messages.map(n => Array.from(n.querySelectorAll(BDFDB.dotCNS.imagewrapper + "img"))).flat().filter(img => !BDFDB.DOMUtils.getParent(BDFDB.dotCN.spoilerhidden, img));
					let next, previous;
					for (let i = 0; i < images.length; i++) if (this.getSrcOfImage(e.instance.props.src) == this.getSrcOfImage(images[i])) {
						next = this.getSrcOfImage(images[i+1]);
						previous = this.getSrcOfImage(images[i-1]);
						break;
					}
					if (next) {
						if (e.instance.nextRef) e.returnvalue.props.children.splice(1, 0, e.instance.nextRef);
						else this.loadImage(e.instance, this.getSrcOfImage(next), "next");
					}
					if (previous) {
						if (e.instance.previousRef) e.returnvalue.props.children.push(e.instance.previousRef);
						else this.loadImage(e.instance, this.getSrcOfImage(previous), "previous");
					}
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
			if (src) for (let message of document.querySelectorAll(BDFDB.dotCN.message)) for (let img of message.querySelectorAll(BDFDB.dotCNS.imagewrapper + "img")) if (img.src && this.getSrcOfImage(img) == this.getSrcOfImage(src)) {
				let previousSiblings = [], nextSiblings = [];
				let previousSibling = message.previousSibling, nextSibling = message.nextSibling;
				while (previousSibling) {
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

		getSrcOfImage (img) {
			if (!img) return null;
			return (typeof img == "string" ? img : (img.src || (img.querySelector("canvas") ? img.querySelector("canvas").src : ""))).split("?width=")[0];
		}
		
		loadImage (instance, src, type) {
			let imagethrowaway = document.createElement("img");
			imagethrowaway.src = src;
			imagethrowaway.onload = _ => {
				let arects = BDFDB.DOMUtils.getRects(document.querySelector(BDFDB.dotCN.appmount));
				let resizeY = (arects.height/imagethrowaway.naturalHeight) * 0.65, resizeX = (arects.width/imagethrowaway.naturalWidth) * 0.8;
				let resize = resizeX < resizeY ? resizeX : resizeY;
				let newHeight = imagethrowaway.naturalHeight * resize;
				let newWidth = imagethrowaway.naturalWidth * resize;
				instance[type + "Ref"] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.LazyImage, {
					className: BDFDB.disCN[`_imagegallery${type}`],
					src: src,
					height: imagethrowaway.naturalHeight,
					width: imagethrowaway.naturalWidth,
					maxHeight: newHeight,
					maxWidth: newWidth,
					onClick: _ => {this.switchImages(instance, type);}
				});
				BDFDB.ReactUtils.forceUpdate(instance);
			};
		}
		
		switchImages (instance, type) {
			let imageRef = instance[type + "Ref"];
			if (!imageRef) return;
			delete instance.previousRef;
			delete instance.nextRef;
			instance.props.original = imageRef.props.src;
			instance.props.placeholder = imageRef.props.src;
			instance.props.src = imageRef.props.src;
			instance.props.height = imageRef.props.height;
			instance.props.width = imageRef.props.width;
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