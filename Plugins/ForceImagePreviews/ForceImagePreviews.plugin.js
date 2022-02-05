/**
 * @name ForceImagePreviews
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.2.0
 * @description Forces unrendered embedded Image Previews to render. Caution: Externals Images can contain malicious code and reveal your IP!
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ForceImagePreviews/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ForceImagePreviews/ForceImagePreviews.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ForceImagePreviews",
			"author": "DevilBro",
			"version": "1.2.0",
			"description": "Forces unrendered embedded Image Previews to render. Caution: Externals Images can contain malicious code and reveal your IP!"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var loadedEmbeds, requestedEmbeds;
	
		return class ForceImagePreviews extends Plugin {
			onLoad () {
				loadedEmbeds = {};
				requestedEmbeds = [];
				
				this.patchedModules = {
					before: {
						SimpleMessageAccessories: "default"
					}
				};
			}
			
			onStart () {
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.MessageUtils.rerenderAll();
			}
		
			processSimpleMessageAccessories (e) {
				if (e.instance.props.message && e.instance.props.message.content) {
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
												rawDescription: result.split(new RegExp(BDFDB.StringUtils.regEscape('<meta property="og: description" content="'), "i"))[1].split('"')[0],
												rawTitle: result.split(new RegExp(BDFDB.StringUtils.regEscape('<meta property="og: title" content="'), "i"))[1].split('"')[0],
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
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();