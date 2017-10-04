//META{"name":"ImageGallery"}*//

class ImageGallery {
	constructor () {
		this.imageModalObserver = new MutationObserver(() => {});
		
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

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}
	
    getSettingsPanel () {}

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
					}
				);
			});
			this.imageModalObserver.observe($("#app-mount>:first-child")[0], {childList: true, subtree: true});
			
			BDfunctionsDevilBro.appendLocalStyle(this.getName(), this.css);
			
			BDfunctionsDevilBro.loadMessage(this.getName(), this.getVersion());
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}


	stop () {
		if (typeof BDfunctionsDevilBro === "object") {
			this.imageModalObserver.disconnect();
			
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
		var groups = $(".message-group");
		for (var i = 0; i < groups.length; i++) {
			var imgs = $(groups[i]).find(".image");
			for (var j = 0; j < imgs.length; j++) {
				if (imgs[j].src.split("?width")[0] == img.src.split("?width")[0]) {
					return groups[i];
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
			if (img.src.split("?width")[0] == imgs[i].src.split("?width")[0]) {
				prevImg = 	imgs[i-1];
				nextImg = 	imgs[i+1];
				break;
			}
		}
		
		var height = img.clientHeight;
		var width = img.clientWidth;
		var resize = height > width ? modal.clientHeight/height * (4/5) : modal.clientWidth/width * (4/7);
		
		$(modal).find(".image")
			.attr("height", height * resize)
			.attr("width", width * resize)
			.attr("placeholder", img.src.split("?width")[0])
			.attr("src", img.src.split("?width")[0]);
			
		$(modal).find("a")
			.attr("href", img.src.split("?width")[0]);
		
		if (prevImg) $(modal).find(".modal-image").append($("<video/>", { 'class': 'image prev', 'poster': prevImg.src.split("?width")[0]}));
		if (nextImg) $(modal).find(".modal-image").append($("<video/>", { 'class': 'image next', 'poster': nextImg.src.split("?width")[0]}));
		
		$(modal).find(".image.prev").off("click");
		$(modal).find(".image.next").off("click");
		$(modal).find(".image.prev").on("click", this.addImagePreviews.bind(this, modal, imgs, prevImg));
		$(modal).find(".image.next").on("click", this.addImagePreviews.bind(this, modal, imgs, nextImg));
	}
}
