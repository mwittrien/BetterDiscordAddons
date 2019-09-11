//META{"name":"ForceImagePreviews","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ForceImagePreviews","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ForceImagePreviews/ForceImagePreviews.plugin.js"}*//

class ForceImagePreviews {
	getName () {return "ForceImagePreviews";}

	getVersion () {return "1.1.3";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Forces embedded Image Previews, if Discord doesn't do it itself. Caution: Externals Images can contain malicious code and reveal your IP!";}

	constructor () {
		this.changelog = {
			"fixed":[["Light Theme Update","Fixed bugs for the Light Theme Update, which broke 99% of my plugins"]]
		};

		this.patchModules = {
			"Message":"componentDidMount"
		};
	}

	//legacy
	load () {}

	start () {
		if (!global.BDFDB) global.BDFDB = {myPlugins:{}};
		if (global.BDFDB && global.BDFDB.myPlugins && typeof global.BDFDB.myPlugins == "object") global.BDFDB.myPlugins[this.getName()] = this;
		var libraryScript = document.querySelector('head script#BDFDBLibraryScript');
		if (!libraryScript || (performance.now() - libraryScript.getAttribute("date")) > 600000) {
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("id", "BDFDBLibraryScript");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js");
			libraryScript.setAttribute("date", performance.now());
			libraryScript.addEventListener("load", () => {this.initialize();});
			document.head.appendChild(libraryScript);
			this.libLoadTimeout = setTimeout(() => {
				libraryScript.remove();
				BDFDB.LibraryRequires.request("https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDFDB.js", (error, response, body) => {
					if (body) {
						libraryScript = document.createElement("script");
						libraryScript.setAttribute("id", "BDFDBLibraryScript");
						libraryScript.setAttribute("type", "text/javascript");
						libraryScript.setAttribute("date", performance.now());
						libraryScript.innerText = body;
						document.head.appendChild(libraryScript);
					}
					this.initialize();
				});
			}, 15000);
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
			BDFDB.removeEles(".FIP-embed");
			BDFDB.unloadMessage(this);
		}
	}


	// begin of own functions

	processMessage (instance, wrapper, returnvalue) {
		if (instance.props && instance.props.message) {
			let accessory = wrapper.querySelector(BDFDB.dotCN.messageaccessory);
			if (accessory) {
				let links = [];
				for (let word of instance.props.message.content.split(/\n|\s|\r|\t|\0/g)) {
					if (word.indexOf("https://") > -1 || word.indexOf("http://") > -1) {
						if (word.indexOf("<") == 0 && word.indexOf(">") == word.length-1) links.push({src:word.slice(1,-1),embedded:false});
						else if (!accessory.querySelector(`${BDFDB.dotCN.embedimage}[href="${this.parseSrc(word)}"]`) && !accessory.querySelector(`${BDFDB.dotCN.embedtitlelink}[href="${this.parseSrc(word)}"]`)) {
							links.push({src:word,embedded:false});
						}
						else links.push({src:word,embedded:true});
					}
				}
				if (links.length > 0) this.addItemToAccessory(null, links, accessory);
			}
		}
	}

	addItemToAccessory (previmage, links, accessory) {
		let item = links.shift();
		if (!item) return;
		else if (item.embedded) this.addItemToAccessory(item, links, accessory);
		else {
			let itemsrc = this.parseSrc(item.src);
			BDFDB.LibraryRequires.request(itemsrc, (error, response, result) => {
				if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") > -1) {
					let imagethrowaway = document.createElement("img");
					imagethrowaway.src = itemsrc;
					imagethrowaway.onload = () => {
						let width = imagethrowaway.naturalWidth > 400 ? 400 : imagethrowaway.naturalWidth;
						let height = Math.round(width*(imagethrowaway.naturalHeight/imagethrowaway.naturalWidth));
						if (height > 300) {
							width = Math.round(width*(300/height));
							height = 300;
						}
						let checkedsrc = itemsrc.indexOf("imgur.com/") > -1 ? ("imgur.com/" + itemsrc.split("/")[3].split(".")[0]) : itemsrc;
						if (!accessory.querySelector(`${BDFDB.dotCN.embedimage}[href*="${checkedsrc}"],${BDFDB.dotCN.embedgifv}[href*="${checkedsrc}"]`)) {
							let embed = BDFDB.htmlToElement(`<div class="FIP-embed ${BDFDB.disCNS.embed + BDFDB.disCN.embedwrapper}"><a class="${BDFDB.disCNS.imagewrapper + BDFDB.disCNS.imagezoom + BDFDB.disCN.embedimage}" href="${itemsrc}" rel="noreferrer noopener" target="_blank" style="width: ${width}px; height: ${height}px;"><img src="${itemsrc}" style="width: ${width}px; height: ${height}px;"></a></div>`);
							this.insertEmbed(embed, previmage, links, accessory);
						}
						this.addItemToAccessory(item, links, accessory);
					};
				}
				else if (response && response.headers["server"] && response.headers["server"].toLowerCase().indexOf("youtube") > -1 && result.indexOf("yt-user-info") > -1) {
					if (!accessory.querySelector(`${BDFDB.dotCN.embedtitlelink}[href="${itemsrc}"]`)) {
						result = result.replace(/[\r|\n|\t]|[\s]{2,}/g, "");
						let width = 400;
						let height = Math.round(width*(result.split('<meta itemprop="height" content="')[1].split('"')[0]/result.split('<meta itemprop="width" content="')[1].split('"')[0]));
						let embed = BDFDB.htmlToElement(`<div class="FIP-embed ${BDFDB.disCNS.embed + BDFDB.disCN.embedwrapper}" style="max-width: 426px;"><div class="${BDFDB.disCN.embedpill}" style="background-color: rgb(255, 0, 0);"></div><div class="${BDFDB.disCN.embedinner}"><div class="${BDFDB.disCNS.embedcontent + BDFDB.disCN.flex}"><div class="${BDFDB.disCN.embedcontentinner}"><div class=""><a class="${BDFDB.disCNS.anchor + BDFDB.disCNS.embedproviderlink + BDFDB.disCNS.embedlink + BDFDB.disCNS.embedprovider + BDFDB.disCNS.size12 + BDFDB.disCN.weightnormal}" href="https://www.youtube.com/" rel="noreferrer noopener" target="_blank">YouTube</a></div><div class="${BDFDB.disCNS.embedauthor + BDFDB.disCNS.flex + BDFDB.disCNS.aligncenter + BDFDB.disCNS.embedmargin + BDFDB.disCN.margintop4}"><a class="${BDFDB.disCNS.anchor + BDFDB.disCNS.embedauthornamelink + BDFDB.disCNS.embedlink + BDFDB.disCNS.embedauthorname + BDFDB.disCNS.weightmedium + BDFDB.disCN.size14}" href="https://www.youtube.com${result.split('<div class="yt-user-info"><a href="')[1].split('"')[0]}" rel="noreferrer noopener" target="_blank">${BDFDB.encodeToHTML(result.split('<div class="yt-user-info"><a href="')[1].split('>')[1].split('<')[0])}</a></div><div class="${BDFDB.disCNS.embedmargin + BDFDB.disCN.margintop4}"><a class="${BDFDB.disCNS.anchor + BDFDB.disCNS.embedtitlelink + BDFDB.disCNS.embedlink + BDFDB.disCNS.embedtitle + BDFDB.disCNS.size14 + BDFDB.disCN.weightmedium}" href="${itemsrc}" rel="noreferrer noopener" target="_blank">${BDFDB.encodeToHTML(result.split('<meta property="og:title" content="')[1].split('"')[0])}</a></div></div></div><div class="${BDFDB.disCNS.embedvideo + BDFDB.disCNS.embedimage + BDFDB.disCNS.embedmarginlarge + BDFDB.disCN.margintop8}" style="width: ${width}px; height: ${height}px;"><div class="${BDFDB.disCNS.imagewrapper + BDFDB.disCNS.imageclickable + BDFDB.disCN.embedvideoimagecomponent}" style="width: ${width}px; height: ${height}px;"><img alt="" src="${result.split('<link itemprop="thumbnailUrl" href="')[1].split('"')[0]}" style="width: ${width}px; height: ${height}px;"></div><div class="${BDFDB.disCN.embedvideoactions}"><div class="${BDFDB.disCN.embedcentercontent}"><div class="${BDFDB.disCN.iconactionswrapper}"><div tabindex="0" class="${BDFDB.disCNS.iconwrapper + BDFDB.disCN.iconwrapperactive}" role="button"><svg name="Play" class="${BDFDB.disCNS.iconplay + BDFDB.disCN.icon}" width="16" height="16" viewBox="0 0 24 24"><polygon fill="currentColor" points="0 0 0 14 11 7" transform="translate(7 5)"></polygon></svg></div><a class="${BDFDB.disCNS.anchor + BDFDB.disCNS.anchorunderlineonhover + BDFDB.disCNS.iconwrapper + BDFDB.disCN.iconwrapperactive}" href="${itemsrc}" rel="noreferrer noopener" target="_blank"><svg name="OpenExternal" class="${BDFDB.disCNS.iconexternalmargins + BDFDB.disCN.icon}" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" transform="translate(3.000000, 4.000000)" d="M16 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4v-2H2V4h14v10h-4v2h4c1.1 0 2-.9 2-2V2a2 2 0 0 0-2-2zM9 6l-4 4h3v6h2v-6h3L9 6z"></path></svg></a></div></div></div></div></div></div></div>`);
						BDFDB.addChildEventListener(embed, "click", BDFDB.dotCN.iconplay, () => {
							let videowrapper = embed.querySelector(BDFDB.dotCN.embedvideo);
							BDFDB.removeEles(videowrapper.childNodes);
							videowrapper.appendChild(BDFDB.htmlToElement(`<iframe src="${result.split('<link itemprop="embedURL" href="')[1].split('"')[0]}?start=0&amp;autoplay=1&amp;auto_play=1" width="${width}" height="${height}" frameborder="0" allowfullscreen=""></iframe>`));
						});
						this.insertEmbed(embed, previmage, links, accessory);
					}
					this.addItemToAccessory(item, links, accessory);
				}
				else this.addItemToAccessory(item, links, accessory);
			});
		}
	}

	insertEmbed (embed, previmage, links, accessory) {
		let prev = accessory.querySelector(`${BDFDB.dotCNS.embed + BDFDB.dotCN.embedimage}[href="${previmage ? this.parseSrc(previmage.src) : void 0}"]`);
		let next = accessory.querySelector(`${BDFDB.dotCNS.embed + BDFDB.dotCN.embedimage}[href="${links[0] ? this.parseSrc(links[0].src) : void 0}"]`);
		prev = prev ? prev : accessory.querySelector(`${BDFDB.dotCNS.embed + BDFDB.dotCN.embedtitlelink}[href="${previmage ? this.parseSrc(previmage.src) : void 0}"]`);
		next = next ? next : accessory.querySelector(`${BDFDB.dotCNS.embed + BDFDB.dotCN.embedtitlelink}[href="${links[0] ? this.parseSrc(links[0].src) : void 0}"]`);
		let isempty = accessory.childElementCount == 0;
		if (BDFDB.containsClass(embed.firstElementChild, BDFDB.disCN.embedimage)) embed.style.setProperty("pointer-events", "none", "important");
		accessory.insertBefore(embed, prev ? prev.nextSibling : next);
		let scroller = document.querySelector(BDFDB.dotCNS.chat + BDFDB.dotCN.messages);
		if (scroller) scroller.scrollTop += (BDFDB.getRects(embed).height + (isempty ? 15 : 0));
	}

	parseSrc (src) {
		return src.replace(/"/g, "");
	}
}