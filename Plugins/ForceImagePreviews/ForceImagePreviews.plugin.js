//META{"name":"ForceImagePreviews","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ForceImagePreviews","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ForceImagePreviews/ForceImagePreviews.plugin.js"}*//

var ForceImagePreviews = (_ => {
	var loadedEmbeds, requestedEmbeds;
	
	return class ForceImagePreviews {
		getName () {return "ForceImagePreviews";}

		getVersion () {return "1.2.0";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Forces embedded Image Previews, if Discord doesn't do it itself. Caution: Externals Images can contain malicious code and reveal your IP!";}

		constructor () {
			this.changelog = {
				"improved":[["Requests","No longer tries to request an embed more than one time"]]
			};

			this.patchedModules = {
				before: {
					SimpleMessageAccessories: "default"
				}
			};
		}
		
		initConstructor () {
			loadedEmbeds = {};
			requestedEmbeds = [];
		}

		// Legacy
		load () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) BDFDB.PluginUtils.load(this);
		}

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
				
				BDFDB.ModuleUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;
				
				BDFDB.ModuleUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
				
				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions
		
		processSimpleMessageAccessories (e) {
			if (e.instance.props.message.content) {
				let message = new BDFDB.DiscordObjects.Message(e.instance.props.message);
				for (let link of e.instance.props.message.content.split(/\n|\s|\r|\t|\0/g)) if (link.indexOf("https://") > -1 || link.indexOf("http://") > -1) {
					link = link.indexOf("<") == 0 && link.indexOf(">") == link.length - 1 ? link.slice(1, -1) : link;
					if (!this.isEmbedded(message.embeds, link)) {
						if (!requestedEmbeds.includes(link)) {
							requestedEmbeds.push(link);
							BDFDB.LibraryRequires.request(link, (error, response, result) => {
								if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") > -1) {
									let imageThrowaway = document.createElement("img");
									imageThrowaway.src = link;
									imageThrowaway.onload = _ => {
										if (!this.isEmbedded(message.embeds, link)) {
											loadedEmbeds[link] = {
												image: {
													url: link,
													proxyURL: link,
													height: imageThrowaway.naturalHeight,
													width: imageThrowaway.naturalWidth
												},
												type: "image",
												url: link
											};
											message.embeds.push(loadedEmbeds[link]);
											BDFDB.ReactUtils.forceUpdate(e.instance);
										}
									};
								}
								else if (response && response.headers["server"] && response.headers["server"].toLowerCase().indexOf("youtube") > -1 && result.indexOf("yt-user-info") > -1) {
									if (!this.isEmbedded(message.embeds, link)) {
										result = result.replace(/[\r|\n|\t]|[\s]{2,}/g, "");
										let width = result.split(new RegExp(BDFDB.StringUtils.regEscape('<meta itemprop="width" content="'), "i"))[1].split('"')[0];
										let height = result.split(new RegExp(BDFDB.StringUtils.regEscape('<meta itemprop="height" content="'), "i"))[1].split('"')[0];
										let thumbnail = result.split(new RegExp(BDFDB.StringUtils.regEscape('<link itemprop="thumbnailUrl" href="'), "i"))[1].split('"')[0];
										loadedEmbeds[link] = {
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
										};
										message.embeds.push(loadedEmbeds[link]);
										BDFDB.ReactUtils.forceUpdate(e.instance);
									}
								}
							});
						}
						else if (loadedEmbeds[link]) message.embeds.push(loadedEmbeds[link]);
					}
				}
				e.instance.props.message = message;
			}
		}
		
		isEmbedded (embeds, link) {
			if (link.indexOf("youtube.") > -1 || link.indexOf("youtu.be") > -1) {
				let videoId = (link.split("watch?v=")[1] || link.split("?")[0].split("/").pop() || "").split("&").shift();
				if (videoId) for (let embed of embeds) if (embed.url == link || embed.video && embed.url.indexOf(videoId) > -1) return true;
			}
			else {
				for (let embed of embeds) if (embed.url == link || embed.image && embed.image.url == link) return true;
			}
			return false;
		}
	}
})();

module.exports = ForceImagePreviews;