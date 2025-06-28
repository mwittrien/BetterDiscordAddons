/**
 * @name QuickMention
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.0.9
 * @description Adds a Mention Button to the Message 3-Dot Menu
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/QuickMention/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/QuickMention/QuickMention.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		"improved": {
			"Message Actions": "Button is back in the Message Actions Toolbar"
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
		downloadLibrary () {
			BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js").then(r => {
				if (!r || r.status != 200) throw new Error();
				else return r.text();
			}).then(b => {
				if (!b) throw new Error();
				else return require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.UI.showToast("Finished downloading BDFDB Library", {type: "success"}));
			}).catch(error => {
				BdApi.UI.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.UI.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(this.name)) window.BDFDB_Global.pluginQueue.push(this.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--text-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		return class QuickMention extends Plugin {
			onLoad () {
				this.modulePatches = {
					after: [
						"MessageButtons"
					]
				};
			}
			
			onStart () {
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MessageToolbarUtils, "useMessageMenu", {after: e => {
					if (e.instance.props.message && e.instance.props.channel) {
						let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnValue, {id: ["reply", "forward"]});
						children.splice(index > -1 ? index : 3, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: BDFDB.LanguageUtils.LanguageStrings.MENTION,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "mention"),
							icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								className: BDFDB.disCN.menuicon,
								name: BDFDB.LibraryComponents.SvgIcon.Names.NOVA_AT
							}),
							action: _ => BDFDB.LibraryModules.DispatchUtils.ComponentDispatch.dispatchToLastSubscribed(BDFDB.DiscordConstants.ComponentActions.INSERT_TEXT, {
								plainText: `<@!${e.instance.props.message.author.id}>`
							})
						}));
					}
				}});
			}
			
			onStop () {}

			onMessageContextMenu (e) {
				if (e.instance.props.message && e.instance.props.channel) {
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: ["reply", "forward"]});
					children.splice(index > -1 ? index : 3, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: BDFDB.LanguageUtils.LanguageStrings.MENTION,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "mention"),
						icon: _ => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
							className: BDFDB.disCN.menuicon,
							name: BDFDB.LibraryComponents.SvgIcon.Names.NOVA_AT
						}),
						action: _ => BDFDB.LibraryModules.DispatchUtils.ComponentDispatch.dispatchToLastSubscribed(BDFDB.DiscordConstants.ComponentActions.INSERT_TEXT, {
							plainText: `<@!${e.instance.props.message.author.id}>`
						})
					}));
				}
			}
			
			processMessageButtons (e) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.messagebuttons]]});
				if (index == -1) return;
				children.unshift(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					key: "mention",
					text: BDFDB.LanguageUtils.LanguageStrings.MENTION,
					tooltipConfig: {className: BDFDB.disCN.messagetoolbartooltip},
					children: BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCNS.messagetoolbarhoverbutton + BDFDB.disCN.messagetoolbarbutton,
						onClick: _ => BDFDB.LibraryModules.DispatchUtils.ComponentDispatch.dispatchToLastSubscribed(BDFDB.DiscordConstants.ComponentActions.INSERT_TEXT, {
							plainText: `<@!${e.instance.props.message.author.id}>`
						}),
						children: BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCNS.messagetoolbaricon + BDFDB.disCN.messagetoolbarbuttoncontent,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								className: BDFDB.disCN.messagetoolbaricon,
								nativeClass: true,
								name: BDFDB.LibraryComponents.SvgIcon.Names.NOVA_AT
							})
						})
					})
				}));
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
