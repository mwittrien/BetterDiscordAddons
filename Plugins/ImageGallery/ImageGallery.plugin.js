//META{"name":"ImageGallery"}*//

class ImageGallery {
	constructor () {
		this.imageModalObserver = new MutationObserver(() => {});
		
		this.eventFired = false;
		
		this.css = ` 
			.modal-image .image.prev,
			.modal-image .image.next {
				position: absolute;
				top: 15%;
				height: 66%;
			} 
			
			.modal-image .image.prev {
				right: 90%;
			} 
			
			.modal-image .image.next {
				left: 90%;
			}`;
	}

	getName () {return "ImageGallery";}

	getDescription () {return "Allows the user to browse through images sent inside the same message.";}

	getVersion () {return "1.3.0";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
		$('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
		$('head').append("<script src='https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		if (typeof BDfunctionsDevilBro !== "object") {
			$('head script[src="https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]').remove();
			$('head').append("<script src='https://cors-anywhere.herokuapp.com/https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js'></script>");
		}
		if (typeof BDfunctionsDevilBro === "object") {
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
			
			this.imageModalObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if ($(node).find(".modal-image").length != 0) {
									this.loadImages(node);
								}
							});
						}
						if (change.removedNodes) {
							change.removedNodes.forEach((node) => {
								if ($(node).find(".modal-image").length != 0) {
									$(document).off("keyup." + this.getName()).off("keydown." + this.getName());
								}
							});
						}
					}
				);
			});
			if (document.querySelector("body > div > [class*='platform-'] > div")) this.imageModalObserver.observe($("body > div > [class*='platform-'] > div").last()[0], {childList: true});
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.imageModalObserver.disconnect();
			
			$(document).off("keyup." + this.getName()).off("keydown." + this.getName());
			
			BDfunctionsDevilBro.removeLocalStyle(this.getName());
		}
	}

	
	// begin of own functions
	
	
	loadImages (modal) {
		var start = performance.now();
		var waitForImg = setInterval(() => {
			var img = $(modal).find(".image")[0];
			if (img && img.src) {
				clearInterval(waitForImg);
				var message = this.getMessageGroupOfImage(img);
				var imgs = $(message).find(".image");
				
				this.addImagePreviews(modal, imgs, img);
			}
			else if (performance.now() - start > 10000) {
				clearInterval(waitForImg);
			}
		}, 100);
	}
	
	getMessageGroupOfImage (img) {
		if (img && img.src) {
			var groups = $(".message-group");
			for (var i = 0; i < groups.length; i++) {
				var imgs = $(groups[i]).find(".image");
				for (var j = 0; j < imgs.length; j++) {
					if (imgs[j].src && this.getSrcOfImage(img) == this.getSrcOfImage(imgs[j])) {
						return groups[i];
					}
				}
			}
		}
		return null;
	}
	
	addImagePreviews (modal, imgs, img) {
		$(modal).find(".image.prev").remove();
		$(modal).find(".image.next").remove();
		var prevImg;
		var nextImg;
		for (var i = 0; i < imgs.length; i++) {
			if (this.getSrcOfImage(img) == this.getSrcOfImage(imgs[i])) {
				prevImg = 	imgs[i-1];
				img = 		imgs[i];
				nextImg = 	imgs[i+1];
				break;
			}
		}
		
		console.log(prevImg);
		console.log(img);
		console.log(nextImg);
		
		$(modal).find(".image")
			.attr("placeholder", this.getSrcOfImage(img))
			.attr("src", this.getSrcOfImage(img));
			
		$(modal).find("a")
			.attr("href", this.getSrcOfImage(img));
		
		this.resizeImage(modal, img, modal.querySelector(".image"));
			
		if (prevImg) {
			$(modal).find(".modal-image").append($("<video/>", { 'class': 'image prev', 'poster': this.getSrcOfImage(prevImg)}));
			this.resizeImage(modal, prevImg, modal.querySelector(".image.prev"));
		}
		if (nextImg) {
			$(modal).find(".modal-image").append($("<video/>", { 'class': 'image next', 'poster': this.getSrcOfImage(nextImg)}));
			this.resizeImage(modal, nextImg, modal.querySelector(".image.next"));
		}
		$(modal).find(".image.prev").off("click").on("click", this.addImagePreviews.bind(this, modal, imgs, prevImg));
		$(modal).find(".image.next").off("click").on("click", this.addImagePreviews.bind(this, modal, imgs, nextImg));
		$(document).off("keydown." + this.getName()).on("keydown." + this.getName(), {modal, imgs, prevImg, nextImg}, this.keyPressed.bind(this));
		$(document).off("keyup." + this.getName()).on("keyup." + this.getName(), () => {this.eventFired = false});
	}
	
	getSrcOfImage (img) {
		var src = img.src ? img.src : (img.querySelector("canvas") ? img.querySelector("canvas").src : null);
		return src.split("?width=")[0];
	}
	
	resizeImage (modal, src, img) {
		$(img).hide();
		var temp = new Image();
		console.log(src.src);
		temp.src = src.src.split("?width=")[0];
		temp.onload = function () {
			var resizeX = (modal.clientWidth/src.clientWidth) * 0.71;
			var resizeY = (modal.clientHeight/src.clientHeight) * 0.57;
			var resize = resizeX < resizeY ? resizeX : resizeY;
			var newWidth = src.clientWidth * resize;
			var newHeight = src.clientHeight * resize;
			
			$(img)
				.attr("width", temp.width > newWidth ? newWidth : temp.width)
				.attr("height", temp.height > newHeight ? newHeight : temp.height)
				.show();
		};
	}
	
	keyPressed (e) {
		if (!this.eventFired) {
			this.eventFired = true;
			if (e.keyCode == 37 && e.data.prevImg) {
				this.addImagePreviews(e.data.modal, e.data.imgs, e.data.prevImg)
			}
			else if (e.keyCode == 39 && e.data.nextImg) {
				this.addImagePreviews(e.data.modal, e.data.imgs, e.data.nextImg)
			}
		}
	}
}
