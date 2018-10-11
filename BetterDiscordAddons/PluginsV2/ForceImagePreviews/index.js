module.exports = (Plugin, Api, Vendor) => {
	if (typeof BDFDB !== "object") global.BDFDB = {$: Vendor.$, BDv2Api: Api};
	
	const {$} = Vendor;

	return class extends Plugin {
		initConstructor () {
			this.waitTime = 3000;
		}
		
		onStart () {
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
			return true;
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

				return true;
			}
			else {
				console.error(this.name + ": Fatal Error: Could not load BD functions!");
				return false;
			}
		}

		onStop () {
			if (typeof BDFDB === "object") {
				document.querySelectorAll(".FIP-embed").forEach(embed => {embed.remove();});
				
				BDFDB.unloadMessage(this);
				return true;
			}
			else {
				return false;
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
			let scroller = document.querySelector(BDFDB.dotCNS.chat + BDFDB.dotCN.messages);
			if (!message || !scroller) return;
			var messageData = BDFDB.getKeyInformation({node:message,key:"message",up:true});
			if (!messageData) return;
			
			let accessory = this.getAccessoryOfMessage(message);
			if (accessory) {
				let links = [];
				for (let word of messageData.content.split(new RegExp("\\n|\\s|\\r|\\t|\\0"))) {
					if (word.indexOf("https://") > -1 || word.indexOf("http://") > -1) { 
						if (word.indexOf("<") == 0 && word.indexOf(">") == word.length-1) links.push({src:word.slice(1,-1),embedded:false});
						else if (!accessory.querySelector(`${BDFDB.dotCN.embedimage}[href="${this.parseSrc(word)}"]`) && !accessory.querySelector(`${BDFDB.dotCN.embedtitlelink}[href="${this.parseSrc(word)}"]`)) {
							links.push({src:word,embedded:false});
						}
						else links.push({src:word,embedded:true});
					}
				}
				if (links.length > 0) this.addItemToAccessory(null, links, accessory, scroller);
			}
		}
		
		addItemToAccessory (previmage, links, accessory, scroller) {
			let item = links.shift();
			if (!item) return;
			else if (item.embedded) this.addItemToAccessory(item, links, accessory, scroller); 
			else {
				let itemsrc = this.parseSrc(item.src);
				require("request")(itemsrc, (error, response, result) => {
					if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") > -1) {
						let imagethrowaway = document.createElement("img");
						imagethrowaway.src = itemsrc;
						imagethrowaway.onload = () => {
							let width = 400;
							let height = Math.round(width*(imagethrowaway.naturalHeight/imagethrowaway.naturalWidth));
							if (!accessory.querySelector(`${BDFDB.dotCN.embedimage}[href="${itemsrc}"]`)) {
								let embed = $(`<div class="FIP-embed ${BDFDB.disCNS.embed + BDFDB.disCNS.flex + BDFDB.disCN.embedold}"><a class="${BDFDB.disCNS.imagewrapper + BDFDB.disCNS.imagezoom + BDFDB.disCN.embedimage}" href="${itemsrc}" rel="noreferrer noopener" target="_blank" style="width: ${width}px; height: ${height}px;"><img src="${itemsrc}" style="width: ${width}px; height: ${height}px;"></a></div>`)[0];
								this.insertEmbed(embed, previmage, links, accessory, scroller);
							}
							this.addItemToAccessory(item, links, accessory, scroller);
						};
					}
					else if (response && response.headers["server"] && response.headers["server"].toLowerCase().indexOf("youtube") > -1 && result.indexOf("yt-user-info") > -1) {
						if (!accessory.querySelector(`${BDFDB.dotCN.embedtitlelink}[href="${itemsrc}"]`)) {
							result = result.replace(new RegExp("[\\r|\\n|\\t]|[\\s]{2,}", "g"), "");
							let width = 400;
							let height = Math.round(width*(result.split('<meta itemprop="height" content="')[1].split('"')[0]/result.split('<meta itemprop="width" content="')[1].split('"')[0]));
							let embed = $(`<div class="FIP-embed ${BDFDB.disCNS.embed + BDFDB.disCNS.flex + BDFDB.disCN.embedold}" style="max-width: 426px;"><div class="${BDFDB.disCN.embedpill}" style="background-color: rgb(255, 0, 0);"></div><div class="${BDFDB.disCN.embedinner}"><div class="${BDFDB.disCNS.embedcontent + BDFDB.disCN.flex}"><div class="${BDFDB.disCN.embedcontentinner}"><div class=""><a class="${BDFDB.disCNS.anchor + BDFDB.disCNS.embedproviderlink + BDFDB.disCNS.embedlink + BDFDB.disCNS.embedprovider + BDFDB.disCNS.size12 + BDFDB.disCN.weightnormal}" href="https://www.youtube.com/" rel="noreferrer noopener" target="_blank">YouTube</a></div><div class="${BDFDB.disCNS.embedauthor + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCNS.embedmargin + BDFDB.disCN.margintop4}"><a class="${BDFDB.disCNS.anchor + BDFDB.disCNS.embedauthornamelink + BDFDB.disCNS.embedlink + BDFDB.disCNS.embedauthorname + BDFDB.disCNS.weightmedium + BDFDB.disCN.size14}" href="https://www.youtube.com${result.split('<div class="yt-user-info"><a href="')[1].split('"')[0]}" rel="noreferrer noopener" target="_blank">${BDFDB.encodeToHTML(result.split('<div class="yt-user-info"><a href="')[1].split('>')[1].split('<')[0])}</a></div><div class="${BDFDB.disCNS.embedmargin + BDFDB.disCN.margintop4}"><a class="${BDFDB.disCNS.anchor + BDFDB.disCNS.embedtitlelink + BDFDB.disCNS.embedlink + BDFDB.disCNS.embedtitle + BDFDB.disCNS.size14 + BDFDB.disCN.weightmedium}" href="${itemsrc}" rel="noreferrer noopener" target="_blank">${BDFDB.encodeToHTML(result.split('<meta property="og:title" content="')[1].split('"')[0])}</a></div></div></div><div class="${BDFDB.disCNS.embedvideo + BDFDB.disCNS.embedimage + BDFDB.disCNS.embedmarginlarge + BDFDB.disCN.margintop8}" style="width: ${width}px; height: ${height}px;"><div class="${BDFDB.disCNS.imagewrapper + BDFDB.disCN.imagezoom}" style="width: ${width}px; height: ${height}px;"><img alt="" src="${result.split('<link itemprop="thumbnailUrl" href="')[1].split('"')[0]}" style="width: ${width}px; height: ${height}px;"></div><div class="${BDFDB.disCNS.embedvideoactions + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex + BDFDB.disCNS.justifycenter + BDFDB.disCN.aligncenter}"><div class="${BDFDB.disCNS.embedvideoactionsinner + BDFDB.disCNS.flexcenter + BDFDB.disCNS.flex + BDFDB.disCNS.justifycenter + BDFDB.disCN.aligncenter}"><div class="${BDFDB.disCN.iconwrapper}"><svg name="Play" class="${BDFDB.disCNS.iconplay + BDFDB.disCN.icon}" width="16" height="16" viewBox="0 0 24 24"><polygon fill="currentColor" points="0 0 0 14 11 7" transform="translate(7 5)"></polygon></svg><a class="${BDFDB.disCN.anchor}" href="${itemsrc}" rel="noreferrer noopener" target="_blank"><svg name="OpenExternal" class="${BDFDB.disCNS.iconexternalmargins + BDFDB.disCN.icon}" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" transform="translate(3.000000, 4.000000)" d="M16 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4v-2H2V4h14v10h-4v2h4c1.1 0 2-.9 2-2V2a2 2 0 0 0-2-2zM9 6l-4 4h3v6h2v-6h3L9 6z"></path></svg></a></div></div></div></div></div></div>`)[0];
							$(embed).on("click." + this.name, BDFDB.dotCN.iconplay, (e) => {
								let videowrapper = embed.querySelector(BDFDB.dotCN.embedvideo);
								while (videowrapper.firstChild) videowrapper.firstChild.remove();
								$(`<iframe src="${result.split('<link itemprop="embedURL" href="')[1].split('"')[0]}?start=0&amp;autoplay=1&amp;auto_play=1" width="${width}" height="${height}" frameborder="0" allowfullscreen=""></iframe>`).appendTo(videowrapper);
							});
							this.insertEmbed(embed, previmage, links, accessory, scroller);
						}
						this.addItemToAccessory(item, links, accessory, scroller);
					}
					else this.addItemToAccessory(item, links, accessory, scroller);
				});
			}
		}
		
		insertEmbed (embed, previmage, links, accessory, scroller) {
			let prev = accessory.querySelector(`${BDFDB.dotCNS.embed + BDFDB.dotCN.embedimage}[href="${previmage ? this.parseSrc(previmage.src) : void 0}"]`);
			let next = accessory.querySelector(`${BDFDB.dotCNS.embed + BDFDB.dotCN.embedimage}[href="${links[0] ? this.parseSrc(links[0].src) : void 0}"]`);
			prev = prev ? prev : accessory.querySelector(`${BDFDB.dotCNS.embed + BDFDB.dotCN.embedtitlelink}[href="${previmage ? this.parseSrc(previmage.src) : void 0}"]`);
			next = next ? next : accessory.querySelector(`${BDFDB.dotCNS.embed + BDFDB.dotCN.embedtitlelink}[href="${links[0] ? this.parseSrc(links[0].src) : void 0}"]`);
			accessory.insertBefore(embed, prev ? prev.nextSibling : next);
			scroller.scrollTop += embed.getBoundingClientRect().height;
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
};
