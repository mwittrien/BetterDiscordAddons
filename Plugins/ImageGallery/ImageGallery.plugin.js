//META{"name":"ImageGallery"}*//

class ImageGallery {
	initConstructor () {
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

	getName () {return "ImageGallery";}

	getDescription () {return "Allows the user to browse through images sent inside the same message.";}

	getVersion () {return "1.5.5";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDFDB !== "object" || typeof BDFDB.isLibraryOutdated !== "function" || BDFDB.isLibraryOutdated()) {
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object" && typeof BDFDB.isLibraryOutdated === "function") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDFDB === "object") {
			BDFDB.loadMessage(this);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(BDFDB.dotCN.imagewrapper) && node.querySelector(BDFDB.dotCN.downloadlink)) {
									this.loadImages(node);
								}
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(BDFDB.dotCN.imagewrapper) && node.querySelector(BDFDB.dotCN.downloadlink)) {
									$(document).off("keyup." + this.getName()).off("keydown." + this.getName());
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.app + " ~ [class^='theme-']:not([class*='popouts'])", {name:"imageModalObserver",instance:observer}, {childList: true});
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			BDFDB.unloadMessage(this);
		}
	}

	
	// begin of own functions
	
	loadImages (modal) {
		var start = performance.now();
		var waitForImg = setInterval(() => {
			var img = modal.querySelector(BDFDB.dotCNS.imagewrapper + "img");
			if (img && img.src) {
				clearInterval(waitForImg);
				var message = this.getMessageGroupOfImage(img);
				if (message) {
					modal.classList.add("image-gallery");
					this.addImages(modal, message.querySelectorAll(BDFDB.dotCNS.imagewrapper + "img"), img);
				}
			}
			else if (performance.now() - start > 10000) {
				clearInterval(waitForImg);
			}
		}, 100);
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
		var src = img.src ? img.src : (img.querySelector("canvas") ? img.querySelector("canvas").src : "");
		return src.split("?width=")[0];
	}
	
	addImages (modal, imgs, img) {
		modal.querySelectorAll(`${BDFDB.dotCN.imagewrapper}.prev, ${BDFDB.dotCN.imagewrapper}.next`).forEach(ele => {ele.remove();});
		
		var prevImg, nextImg, index;
		for (index = 0; index < imgs.length; index++) {
			if (this.getSrcOfImage(img) == this.getSrcOfImage(imgs[index])) {
				prevImg = 	imgs[index-1];
				img = 		imgs[index];
				nextImg = 	imgs[index+1];
				break;
			}
		}
		
		$(modal).find(BDFDB.dotCN.imagewrapper)
			.addClass("current")
			.find("img").attr("src", this.getSrcOfImage(img));
			
		$(modal.querySelector(BDFDB.dotCN.downloadlink))
			.attr("href", this.getSrcOfImage(img));
			
		this.resizeImage(modal, img, modal.querySelector(BDFDB.dotCN.imagewrapper + ".current img"));
		if (prevImg) {
			$(this.imageMarkup)
				.appendTo(modal.querySelector(BDFDB.dotCN.modalinner))
				.addClass("prev")
				.off("click." + this.getName()).on("click." + this.getName(), () => {
					this.addImages(modal, imgs, prevImg);
				})
				.find("img").attr("src", this.getSrcOfImage(prevImg));
			this.resizeImage(modal, prevImg, modal.querySelector(BDFDB.dotCN.imagewrapper + ".prev img"));
		}
		if (nextImg) {
			$(this.imageMarkup)
				.appendTo(modal.querySelector(BDFDB.dotCN.modalinner))
				.addClass("next")
				.off("click." + this.getName()).on("click." + this.getName(), () => {
					this.addImages(modal, imgs, nextImg);
				})
				.find("img").attr("src", this.getSrcOfImage(nextImg));
			this.resizeImage(modal, nextImg, modal.querySelector(BDFDB.dotCN.imagewrapper + ".next img"));
		}
		
		$(document).off("keydown." + this.getName()).off("keyup." + this.getName())
			.on("keydown." + this.getName(), (e) => {
				this.keyPressed({modal, imgs, prevImg, nextImg}, e);
			})
			.on("keyup." + this.getName(), () => {
				this.eventFired = false;
			});
	}
	
	resizeImage (container, src, img) {
		$(img).hide();
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
			
			
			$(wrapper)
				.css("top", !wrapper.classList.contains("current") ? (container.clientHeight - newHeight) / 2 : "")
				.css("width", newWidth)
				.css("height", newHeight);
				
			$(img)
				.css("width", newWidth)
				.css("height", newHeight)
				.show();
		};
	}
	
	keyPressed (data, e) {
		if (!this.eventFired) {
			this.eventFired = true;
			if (e.keyCode == 37 && data.prevImg) {
				this.addImages(data.modal, data.imgs, data.prevImg);
			}
			else if (e.keyCode == 39 && data.nextImg) {
				this.addImages(data.modal, data.imgs, data.nextImg);
			}
		}
	}
}
