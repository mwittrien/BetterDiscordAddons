//META{"name":"ImageGallery","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ImageGallery","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ImageGallery/ImageGallery.plugin.js"}*//

class ImageGallery {
	getName () {return "ImageGallery";}

	getVersion () {return "1.5.8";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Allows the user to browse through images sent inside the same message.";}

	initConstructor () {
		this.changelog = {
			"fixed":[["Prev/Next Image","Fixed bug where the previou/next image would sometimes be doubled with the current image on the first/last image"]]
		};
		
		this.patchModules = {
			"ImageModal":["componentDidMount","componentWillUnmount"]
		}
		this.eventFired = false;

		this.imageMarkup = `<div class="${BDFDB.disCN.imagewrapper}" style="width: 100px; height: 100px;"><img src="" style="width: 100px; height: 100px; display: inline;"></div>`;

		this.css = ` 
			.image-gallery ${BDFDB.dotCN.imagewrapper}.prev,
			.image-gallery ${BDFDB.dotCN.imagewrapper}.next {
				position: absolute;
			} 

			.image-gallery ${BDFDB.dotCN.imagewrapper}.prev {
				right: 90%;
			} 

			.image-gallery ${BDFDB.dotCN.imagewrapper}.next {
				left: 90%;
			}`;
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
		if (!libraryScript || performance.now() - libraryScript.getAttribute("date") > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();});
			document.head.appendChild(libraryScript);
		}
		else if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) this.initialize();
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
	}

	initialize () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			if (this.started) return;
			BDFDB.loadMessage(this);

			BDFDB.WebModules.forceAllUpdates(this); 
		}
		else {
			console.error(`%c[${this.getName()}]%c`, 'color: #3a71c1; font-weight: 700;', '', 'Fatal Error: Could not load BD functions!');
		}
	}

	stop () {
		if (global.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.closemodal = true;

			BDFDB.WebModules.forceAllUpdates(this, "ImageModal");

			delete this.closemodal;

			document.removeEventListener("keydown", document.keydownImageGalleryListener);
			document.removeEventListener("keyup", document.keyupImageGalleryListener);

			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	processImageModal (instance, wrapper, methodnames) {
		if (this.closemodal && instance.props && instance.props.onClose) instance.props.onClose();
		else if (methodnames.includes("componentDidMount")) {
			let modal = BDFDB.getParentEle(BDFDB.dotCN.modal, wrapper);
			if (!modal) return;
			let start = performance.now();
			let waitForImg = setInterval(() => {
				let img = modal.querySelector(BDFDB.dotCNS.imagewrapper + "img");
				if (img && img.src) {
					clearInterval(waitForImg);
					let message = this.getMessageGroupOfImage(img);
					if (message) {
						BDFDB.addClass(modal, "image-gallery");
						this.addImages(modal, message.querySelectorAll(BDFDB.dotCNS.imagewrapper + "img"), img);
					}
				}
				else if (performance.now() - start > 10000) {
					clearInterval(waitForImg);
				}
			}, 100);
		}
		else if (methodnames.includes("componentWillUnmount")) {
			document.removeEventListener("keydown", document.keydownImageGalleryListener);
			document.removeEventListener("keyup", document.keyupImageGalleryListener);
		}
	}

	getMessageGroupOfImage (thisimg) {
		if (thisimg && thisimg.src) {
			for (let group of document.querySelectorAll(BDFDB.dotCN.messagegroup)) {
				for (let img of group.querySelectorAll(BDFDB.dotCNS.imagewrapper + "img")) {
					if (img.src && this.getSrcOfImage(img) == this.getSrcOfImage(thisimg)) {
						return group;
					}
				}
			}
		}
		return null;
	}

	getSrcOfImage (img) {
		return (img.src || (img.querySelector("canvas") ? img.querySelector("canvas").src : "")).split("?width=")[0];
	}

	addImages (modal, imgs, img) {
		BDFDB.removeEles(modal.querySelectorAll(`${BDFDB.dotCN.imagewrapper}.prev, ${BDFDB.dotCN.imagewrapper}.next`));

		let inner = modal.querySelector(BDFDB.dotCN.modalinner);

		if (!inner) return;

		var prevImg, nextImg, index;
		for (index = 0; index < imgs.length; index++) {
			if (this.getSrcOfImage(img) == this.getSrcOfImage(imgs[index])) {
				prevImg = 	imgs[index-1];
				img = 		imgs[index];
				nextImg = 	imgs[index+1];
				break;
			}
		}

		var imagesrc = this.getSrcOfImage(img);
		modal.querySelector(BDFDB.dotCN.downloadlink).setAttribute("href", imagesrc);

		var imagewrapper = modal.querySelector(BDFDB.dotCN.imagewrapper);
		BDFDB.addClass(imagewrapper, "current");
		var imagewrapperimage = imagewrapper.querySelector("img");
		imagewrapperimage.setAttribute("src", imagesrc);

		this.resizeImage(modal, img, imagewrapperimage);

		if (prevImg) inner.appendChild(this.createImage(modal, imgs, prevImg, "prev"));
		if (nextImg) inner.appendChild(this.createImage(modal, imgs, nextImg, "next"));

		document.removeEventListener("keydown", document.keydownImageGalleryListener);
		document.removeEventListener("keyup", document.keyupImageGalleryListener);
		document.keydownImageGalleryListener = e => {this.keyPressed({modal, imgs, prevImg, nextImg}, e);};
		document.keyupImageGalleryListener = e => {this.eventFired = false;};
		document.addEventListener("keydown", document.keydownImageGalleryListener);
		document.addEventListener("keyup", document.keyupImageGalleryListener);
	}

	createImage (modal, imgs, img, type) {
		var imagewrapper = BDFDB.htmlToElement(this.imageMarkup);
		BDFDB.addClass(imagewrapper, type);
		imagewrapper.addEventListener("click", () => {this.addImages(modal, imgs, img);});
		var imagewrapperimage = imagewrapper.querySelector("img");
		imagewrapperimage.setAttribute("src", this.getSrcOfImage(img));
		this.resizeImage(modal, img, imagewrapperimage);
		return imagewrapper;
	}

	resizeImage (container, src, img) {
		BDFDB.toggleEles(img, false);
		var temp = new Image();
		temp.src = src.src.split("?width=")[0];
		temp.onload = function () {
			var resizeX = (container.clientWidth/src.clientWidth) * 0.71;
			var resizeY = (container.clientHeight/src.clientHeight) * 0.57;
			var resize = resizeX < resizeY ? resizeX : resizeY;
			var newWidth = src.clientWidth * resize;
			var newHeight = src.clientHeight * resize;
			newWidth = temp.width > newWidth ? newWidth : temp.width;
			newHeight = temp.height > newHeight ? newHeight : temp.height;

			var wrapper = img.parentElement;
			if (!BDFDB.containsClass(wrapper, "current")) wrapper.style.setProperty("top",  (container.clientHeight - newHeight) / 2 + "px");
			wrapper.style.setProperty("width", newWidth + "px");
			wrapper.style.setProperty("height", newHeight + "px");

			img.style.setProperty("width", newWidth + "px");
			img.style.setProperty("height", newHeight + "px");

			BDFDB.toggleEles(img, true);
		};
	}

	keyPressed ({modal, imgs, prevImg, nextImg}, e) {
		if (!this.eventFired) {
			this.eventFired = true;
			if (e.keyCode == 37 && prevImg) this.addImages(modal, imgs, prevImg);
			else if (e.keyCode == 39 && nextImg) this.addImages(modal, imgs, nextImg);
		}
	}
}
