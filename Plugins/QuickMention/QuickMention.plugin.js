//META{"name":"QuickMention","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/QuickMention","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/QuickMention/QuickMention.plugin.js"}*//

module.exports = (_ => {
    const config = {
		"info": {
			"name": "QuickMention",
			"author": "DevilBro",
			"version": "1.0.1",
			"description": "Adds a mention entry to the message option toolbar."
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
        return class QuickMention extends Plugin {
			onLoad() {}
			
			onStart() {}
			
			onStop() {}
		
			onMessageOptionToolbar (e) {
				if (e.instance.props.message.author.id != BDFDB.UserUtils.me.id && e.instance.props.message.type == BDFDB.DiscordConstants.MessageTypes.DEFAULT && (BDFDB.UserUtils.can("SEND_MESSAGES") || e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.DM || e.instance.props.channel.type == BDFDB.DiscordConstants.ChannelTypes.GROUP_DM)) e.returnvalue.props.children.unshift(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					key: "mention",
					text: BDFDB.LanguageUtils.LanguageStrings.MENTION,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Clickable, {
						className: BDFDB.disCN.messagetoolbarbutton,
						onClick: _ => {
							BDFDB.LibraryModules.DispatchUtils.ComponentDispatch.dispatchToLastSubscribed(BDFDB.DiscordConstants.ComponentActions.INSERT_TEXT, {
								content: `<@!${e.instance.props.message.author.id}>`
							});
						},
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.disCNS.messagetoolbaricon,
							nativeClass: true,
							name: BDFDB.LibraryComponents.SvgIcon.Names.NOVA_AT
						})
					})
				}));
			}
		};
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();