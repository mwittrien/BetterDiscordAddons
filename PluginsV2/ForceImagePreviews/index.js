module.exports = (Plugin, Api, Vendor) => {
	if (typeof BDfunctionsDevilBro !== "object") global.BDfunctionsDevilBro = {$: Vendor.$, BDv2Api: Api};
	
	const {$} = Vendor;

	return class extends Plugin {
		onStart() {
			var libraryScript = null;
			if (typeof BDfunctionsDevilBro !== "object" || typeof BDfunctionsDevilBro.isLibraryOutdated !== "function" || BDfunctionsDevilBro.isLibraryOutdated()) {
				libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]');
				if (libraryScript) libraryScript.remove();
				libraryScript = document.createElement("script");
				libraryScript.setAttribute("type", "text/javascript");
				libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js");
				document.head.appendChild(libraryScript);
			}
			this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
			if (typeof BDfunctionsDevilBro === "object" && typeof BDfunctionsDevilBro.isLibraryOutdated === "function") this.initialize();
			else libraryScript.addEventListener("load", () => {this.initialize();});
			return true;
		}
		
		initialize() {
			if (typeof BDfunctionsDevilBro === "object") {
				this.waitTime = 3000;
		
								BDfunctionsDevilBro.loadMessage(this);
				
				var observer = null;

				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.type == "characterData") {
								setTimeout(() => {this.addPreviews(change.target.parentElement);},this.waitTime);
							}
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if ($(node).attr("class") == "message") setTimeout(() => {this.addPreviews($(node).find(".markup")[0]);},this.waitTime);
								});
							}
						}
					);
				});
				BDfunctionsDevilBro.addObserver(this, null, {name:"messageChangeObserver",instance:observer,multi:true}, {childList:true, characterData:true, subtree:true});
				
				observer = new MutationObserver((changes, _) => {
					changes.forEach(
						(change, i) => {
							if (change.addedNodes) {
								change.addedNodes.forEach((node) => {
									if (node && node.tagName && node.querySelector(".message")) {
										BDfunctionsDevilBro.addObserver(this, node, {name:"messageChangeObserver",multi:true}, {childList:true, characterData:true, subtree:true});
										node.querySelectorAll(".markup").forEach(message => {
											setTimeout(() => {this.addPreviews(message);},this.waitTime);
										});
									}
								});
							}
						}
					);
				});
				BDfunctionsDevilBro.addObserver(this, ".messages.scroller", {name:"chatWindowObserver",instance:observer}, {childList:true});
				
				this.addAllPreviews();

				return true;
			}
			else {
				console.error(this.name + ": Fatal Error: Could not load BD functions!");
				return false;
			}
		}

		onStop() {
			if (typeof BDfunctionsDevilBro === "object") {
				document.querySelectorAll(".FIP-embed").forEach(embed => {embed.remove();});
							
				BDfunctionsDevilBro.unloadMessage(this);
				return true;
			}
			else {
				return false;
			}
		}
	
		onSwitch () {
			if (typeof BDfunctionsDevilBro === "object") {
				this.addAllPreviews();
				BDfunctionsDevilBro.addObserver(this, ".messages.scroller", {name:"chatWindowObserver"}, {childList:true, subtree:true});
			}
		}

	
		// begin of own functions
		
		addAllPreviews () {
			document.querySelectorAll(".FIP-embed").forEach(embed => {embed.remove();});
			document.querySelectorAll(".message-group").forEach(messageContainer => {
				BDfunctionsDevilBro.addObserver(this, messageContainer, {name:"messageChangeObserver",multi:true}, {childList:true, characterData:true, subtree:true});
				messageContainer.querySelectorAll(".markup").forEach(message => {
					this.addPreviews(message);
				});
			});
		}
		
		addPreviews (message) {
			if (!message) return;
			var messageData = BDfunctionsDevilBro.getKeyInformation({node:message,key:"message",up:true});
			if (!messageData) return;
			
			let accessory = this.getAccessoryOfMessage(message);
			if (accessory) {
				let links = [];
				for (let word of messageData.content.split(new RegExp("\\n|\\s|\\r|\\t|\\0"))) {
					if (word.indexOf("https://") > -1 || word.indexOf("http://") > -1) {
						if (word.indexOf("<") == 0 && word.indexOf(">") == word.length-1) links.push({src:word.slice(1,-1),embedded:false});
						else if (!accessory.querySelector(`.embedImage-1JnXMa[href="${this.parseSrc(word)}"]`)) links.push({src:word,embedded:false});
						else links.push({src:word,embedded:true});
					}
				}
				if (links.length > 0) this.addImageToAccessory(null, links, accessory);
			}
		}
		
		addImageToAccessory (previmage, links, accessory) {
			let image = links.shift();
			if (!image) return;
			else if (image.embedded) this.addImageToAccessory(image, links, accessory); 
			else {
				let imagesrc = this.parseSrc(image.src);
				require("request")(imagesrc, (error, response, result) => {
					if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") > -1) {
						let imagethrowaway = document.createElement("img");
						imagethrowaway.src = imagesrc;
						let width = 400;
						let height = Math.round(width*(imagethrowaway.naturalHeight/imagethrowaway.naturalWidth));
						let embed = $(`<div class="FIP-embed embed-2diOCQ flex-3B1Tl4 embed"><a class="imageWrapper-38T7d9 imageZoom-2suFUV embedImage-1JnXMa" href="${imagesrc}" rel="noreferrer noopener" target="_blank" style="width: ${width}px; height: ${height}px;"><img src="${imagesrc}" style="width: ${width}px; height: ${height}px;"></a></div>`)[0];
						let prevembed = accessory.querySelector(`.embedImage-1JnXMa[href="${previmage ? this.parseSrc(previmage.src) : void 0}"]`);
						let nextembed = accessory.querySelector(`.embedImage-1JnXMa[href="${links[0] ? this.parseSrc(links[0].src) : void 0}"]`);
						if (!accessory.querySelector(`.embedImage-1JnXMa[href="${imagesrc}"]`)) {
							accessory.insertBefore(embed, prevembed ? prevembed.parentElement.nextSibling : (nextembed ? nextembed.parentElement : null));
						}
						this.addImageToAccessory(image, links, accessory);
					} 
					else this.addImageToAccessory(image, links, accessory);
				});
			}
		}
		
		getAccessoryOfMessage (message) {
			var accessory = null;
			while (message && !message.querySelector(".message-group") && !accessory) {
				accessory = message.querySelector(".accessory");
				message = message.parentElement;
			}
			return accessory;
		}
		
		parseSrc (src) {
			return src.replace(/"/g, "");
		}
	}
};
