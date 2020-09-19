//META{"name":"BetterNsfwTag","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/BetterNsfwTag","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/BetterNsfwTag/BetterNsfwTag.plugin.js"}*//

module.exports = (_ => {
    const config = {
		"info": {
			"name": "BetterNsfwTag",
			"author": "DevilBro",
			"version": "1.2.4",
			"description": "Adds a more noticeable tag to NSFW channels."
		}
	};
    return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return config.info.description;}
		
        load() {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue:[]});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {delete window.BDFDB_Global.downloadModal;require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (error, response, body) => {require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), body, _ => {});});}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
        }
        start() {}
        stop() {}
    } : (([Plugin, BDFDB]) => {
        return class BetterNsfwTag extends Plugin {
			onLoad() {
				this.patchedModules = {
					after: {
						ChannelItem: "render"
					}
				};
			}
			
			onStart() {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop() {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}

			processChannelItem (e) {
				if (e.instance.props.channel && e.instance.props.channel.nsfw) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props:[["className", BDFDB.disCN.channelchildren]]});
					if (index > -1 && children[index].props && children[index].props.children) {
						let [oldTagParent, oldTagIndex] = BDFDB.ReactUtils.findParent(children[index], {key: "NSFW-badge"});
						if (oldTagIndex > -1) oldTagParent.splice(oldTagIndex, 1);
						children[index].props.children.push(BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCNS._betternsfwtagtag + BDFDB.disCN.channelchildiconbase,
							key: "NSFW-badge",
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.TextBadge, {
								style: {borderRadius: "3px"},
								text: "NSFW"
							})
						}));
					}
				}
			}
		};
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();