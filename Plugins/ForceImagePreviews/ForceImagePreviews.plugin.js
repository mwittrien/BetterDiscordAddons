//META{"name":"ForceImagePreviews"}*//

class ForceImagePreviews {
	initConstructor () {
		this.waitTime = 3000;
	}

	getName () {return "ForceImagePreviews";}

	getDescription () {return "Forces embedded Image Previews, if Discord doesn't do it itself.";}

	getVersion () {return "1.0.3";}

	getAuthor () {return "DevilBro";}
	
	getSettingsPanel () {
		if (!this.started || typeof BDFDB !== "object") return;
	}

	//legacy
	load () {}

	start () {
		var libraryScript = null;
		if (typeof BDFDB !== "object" || BDFDB.isLibraryOutdated()) {
			if (typeof BDFDB === "object") BDFDB = "";
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			document.head.appendChild(libraryScript);
		}
		this.startTimeout = setTimeout(() => {this.initialize();}, 30000);
		if (typeof BDFDB === "object") this.initialize();
		else libraryScript.addEventListener("load", () => {this.initialize();});
	}

	initialize () {
		if (typeof BDFDB === "object") {
			BDFDB.loadMessage(this);
			
			var observer = null;

			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.type == "characterData") {
							setTimeout(() => {this.addPreviews(change.target.parentElement);},this.waitTime);
						}
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if ($(node).attr("class") == BDFDB.disCN.message) setTimeout(() => {this.addPreviews($(node).find(BDFDB.dotCN.messagemarkup)[0]);},this.waitTime);
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, null, {name:"messageChangeObserver",instance:observer,multi:true}, {childList:true, characterData:true, subtree:true});
			
			observer = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node && node.tagName && node.querySelector(BDFDB.dotCN.message)) {
									BDFDB.addObserver(this, node, {name:"messageChangeObserver",multi:true}, {childList:true, characterData:true, subtree:true});
									node.querySelectorAll(BDFDB.dotCN.messagemarkup).forEach(message => {
										setTimeout(() => {this.addPreviews(message);},this.waitTime);
									});
								}
							});
						}
					}
				);
			});
			BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"chatWindowObserver",instance:observer}, {childList:true});
			
			this.addAllPreviews();
		}
		else {
			console.error(this.getName() + ": Fatal Error: Could not load BD functions!");
		}
	}

	stop () {
		if (typeof BDFDB === "object") {
			document.querySelectorAll(".FIP-embed").forEach(embed => {embed.remove();});
			
			BDFDB.unloadMessage(this);
		}
	}
	
	onSwitch () {
		if (typeof BDFDB === "object") {
			this.addAllPreviews();
			BDFDB.addObserver(this, BDFDB.dotCN.messages, {name:"chatWindowObserver"}, {childList:true, subtree:true});
		}
	}
	
	
	// begin of own functions
	
	addAllPreviews () {
		document.querySelectorAll(".FIP-embed").forEach(embed => {embed.remove();});
		document.querySelectorAll(BDFDB.dotCN.messagegroup).forEach(messageContainer => {
			BDFDB.addObserver(this, messageContainer, {name:"messageChangeObserver",multi:true}, {childList:true, characterData:true, subtree:true});
			messageContainer.querySelectorAll(BDFDB.dotCN.messagemarkup).forEach(message => {
				this.addPreviews(message);
			});
		});
	}
	
	addPreviews (message) {
		if (!message) return;
		var messageData = BDFDB.getKeyInformation({node:message,key:"message",up:true});
		if (!messageData) return;
		
		let accessory = this.getAccessoryOfMessage(message);
		if (accessory) {
			let links = [];
			for (let word of messageData.content.split(new RegExp("\\n|\\s|\\r|\\t|\\0"))) {
				if (word.indexOf("https://") > -1 || word.indexOf("http://") > -1) {
					if (word.indexOf("<") == 0 && word.indexOf(">") == word.length-1) links.push({src:word.slice(1,-1),embedded:false});
					else if (!accessory.querySelector(`${BDFDB.dotCN.embedimage}[href="${this.parseSrc(word)}"]`)) links.push({src:word,embedded:false});
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
					let embed = $(`<div class="FIP-embed ${BDFDB.disCNS.embed + BDFDB.disCNS.flex + BDFDB.disCN.embedold}"><a class="${BDFDB.disCNS.imagewrapper + BDFDB.disCNS.imagezoom + BDFDB.disCN.embedimage}" href="${imagesrc}" rel="noreferrer noopener" target="_blank" style="width: ${width}px; height: ${height}px;"><img src="${imagesrc}" style="width: ${width}px; height: ${height}px;"></a></div>`)[0];
					let prevembed = accessory.querySelector(`${BDFDB.dotCN.embedimage}[href="${previmage ? this.parseSrc(previmage.src) : void 0}"]`);
					let nextembed = accessory.querySelector(`${BDFDB.dotCN.embedimage}[href="${links[0] ? this.parseSrc(links[0].src) : void 0}"]`);
					if (!accessory.querySelector(`${BDFDB.dotCN.embedimage}[href="${imagesrc}"]`)) {
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
		while (message && !message.querySelector(BDFDB.dotCN.messagegroup) && !accessory) {
			accessory = message.querySelector(BDFDB.dotCN.messageaccessory);
			message = message.parentElement;
		}
		return accessory;
	}
	
	parseSrc (src) {
		return src.replace(/"/g, "");
	}
}