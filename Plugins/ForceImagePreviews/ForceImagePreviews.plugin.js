//META{"name":"ForceImagePreviews","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ForceImagePreviews","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ForceImagePreviews/ForceImagePreviews.plugin.js"}*//

class ForceImagePreviews {
	getName () {return "ForceImagePreviews";}

	getVersion () {return "1.1.5";}

	getAuthor () {return "DevilBro";}

	getDescription () {return "Forces embedded Image Previews, if Discord doesn't do it itself. Caution: Externals Images can contain malicious code and reveal your IP!";}

	constructor () {
		this.changelog = {
			"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
		};
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
			 
			BDFDB.ModuleUtils.patch(this, (BDFDB.ModuleUtils.findByName("MessageAccessories") || {}).prototype, "render", {before: e => {
				if (e.thisObject.props.message.content) {
					let message = new BDFDB.DiscordObjects.Message(e.thisObject.props.message);
					for (let word of e.thisObject.props.message.content.split(/\n|\s|\r|\t|\0/g)) if (word.indexOf("https://") > -1 || word.indexOf("http://") > -1) {
						word = word.indexOf("<") == 0 && word.indexOf(">") == word.length-1 ? word.slice(1,-1) : word;
						if (!this.isEmbedded(message.embeds, word)) this.injectEmbed(e.thisObject, message.embeds, word);
					}
					e.thisObject.props.message = message;
				}
			}});
			
			BDFDB.ReactUtils.forceUpdate(BDFDB.ReactUtils.findOwner(document.querySelector(BDFDB.dotCN.app), {name:"MessageAccessories", all:true, noCopies:true, unlimited:true}));
		}
		else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
	}

	stop () {
		if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
			this.stopping = true;
			
			BDFDB.PluginUtils.clear(this);
		}
	}


	// begin of own functions
	
	injectEmbed (instance, embeds, link) {
		BDFDB.LibraryRequires.request(link, (error, response, result) => {
			if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") > -1) {
				let imagethrowaway = document.createElement("img");
				imagethrowaway.src = link;
				imagethrowaway.onload = _ => {
					if (!this.isEmbedded(embeds, link)) {
						embeds.push({
							image: {
								url: link,
								proxyURL: link,
								height: imagethrowaway.naturalHeight,
								width: imagethrowaway.naturalWidth
							},
							type: "image",
							url: link
						});
						BDFDB.ReactUtils.forceUpdate(instance);
					}
				};
			}
			else if (response && response.headers["server"] && response.headers["server"].toLowerCase().indexOf("youtube") > -1 && result.indexOf("yt-user-info") > -1) {
				if (!this.isEmbedded(embeds, link)) {
					result = result.replace(/[\r|\n|\t]|[\s]{2,}/g, "");
					let width = result.split(new RegExp(BDFDB.StringUtils.regEscape('<meta itemprop="width" content="'), "i"))[1].split('"')[0];
					let height = result.split(new RegExp(BDFDB.StringUtils.regEscape('<meta itemprop="height" content="'), "i"))[1].split('"')[0];
					let thumbnail = result.split(new RegExp(BDFDB.StringUtils.regEscape('<link itemprop="thumbnailUrl" href="'), "i"))[1].split('"')[0];
					embeds.push({
						author: {
							name: result.split(new RegExp(BDFDB.StringUtils.regEscape('<div class="yt-user-info"><a href="'), "i"))[1].split('>')[1].split('<')[0],
							url: `https://www.youtube.com${result.split(new RegExp(BDFDB.StringUtils.regEscape('<div class="yt-user-info"><a href="'), "i"))[1].split('"')[0]}`
						},
						color: "#ff0000",
						provider: {
							name: "YouTube",
							url: "https://www.youtube.com/"
						},
						rawDescription: result.split(new RegExp(BDFDB.StringUtils.regEscape('<meta property="og:description" content="'), "i"))[1].split('"')[0],
						rawTitle: result.split(new RegExp(BDFDB.StringUtils.regEscape('<meta property="og:title" content="'), "i"))[1].split('"')[0],
						thumbnail: {
							url: thumbnail,
							proxyURL: thumbnail,
							width: width,
							height: height
						},
						type: "video",
						url: link,
						video: {
							url: result.split(new RegExp(BDFDB.StringUtils.regEscape('<link itemprop="embedUrl" href="'), "i"))[1].split('"')[0],
							width: width,
							height: height
						}
					});
					BDFDB.ReactUtils.forceUpdate(instance);
				}
			}
		});
	}
	
	isEmbedded (embeds, link) {
		for (let embed of embeds) if (embed.url == link) return true;
		return false;
	}
}