/**
 * @name QuickMention
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.0.2
 * @description Adds a Mention Button to the Message Options Bar
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/QuickMention/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/QuickMention/QuickMention.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "QuickMention",
			"author": "DevilBro",
			"version": "1.0.2",
			"description": "Adds a Mention Button to the Message Options Bar"
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
		return class QuickMention extends Plugin {
			onLoad () {}
			
			onStart () {}
			
			onStop () {}
		
			onMessageOptionToolbar (e) {
				if (!e.instance.props.expanded && e.instance.props.message.author.id != BDFDB.UserUtils.me.id && (BDFDB.UserUtils.can("SEND_MESSAGES") || e.instance.props.channel && (e.instance.props.channel.isDM() || e.instance.props.channel.isGroupDM()))) {
					e.returnvalue.props.children.splice(1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
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
								className: BDFDB.disCN.messagetoolbaricon,
								name: BDFDB.LibraryComponents.SvgIcon.Names.NOVA_AT
							})
						})
					}));
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();