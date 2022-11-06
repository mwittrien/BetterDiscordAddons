/**
 * @name ClickableMentions
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.0.6
 * @description Allows you to open a User Popout by clicking a Mention in your Message Input
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ClickableMentions/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ClickableMentions/ClickableMentions.plugin.js
 */

module.exports = (_ => {
	const changeLog = {
		
	};
	
	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		constructor (meta) {for (let key in meta) this[key] = meta[key];}
		getName () {return this.name;}
		getAuthor () {return this.author;}
		getVersion () {return this.version;}
		getDescription () {return `The Library Plugin needed for ${this.name} is missing. Open the Plugin Settings to download it. \n\n${this.description}`;}
		
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
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${this.name} is missing. Please click "Download Now" to install it.`, {
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
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${this.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		return class ClickableMentions extends Plugin {
			onLoad () {
				this.modulePatches = {
					after: [
						"RichUserMention"
					]
				};
				
				this.patchPriority = 9;
			}
			
			onStart () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			processRichUserMention (e) {
				if (!e.instance.props.id || !BDFDB.LibraryStores.UserStore.getUser(e.instance.props.id) || typeof e.returnvalue.props.children != "function") return;
				let childrenRender = e.returnvalue.props.children;
				e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.UserPopoutContainer, Object.assign({}, e.instance.props, {
					killEvent: true,
					userId: e.instance.props.id,
					position: BDFDB.LibraryComponents.PopoutContainer.Positions.RIGHT,
					align: BDFDB.LibraryComponents.PopoutContainer.Align.BOTTOM,
					children: childrenRender(...args)
				})), "Error in Children Render of RichUserMention", this);
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
