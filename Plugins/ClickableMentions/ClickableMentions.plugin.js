/**
 * @name ClickableMentions
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.0.5
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
				this.patchedModules = {
					before: {
						RoleMention: "default"
					},
					after: {
						RichUserMention: "UserMention",
						RichRoleMention: "RoleMention",
						RoleMention: "default"
					}
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
				if (e.instance.props.id && BDFDB.LibraryStores.UserStore.getUser(e.instance.props.id)) return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.UserMention, {
					className: "mention",
					userId: e.instance.props.id,
					channelId: e.instance.props.channelId,
					guildId: e.instance.props.guildId,
					inlinePreview: false
				});
			}
			
			processRichRoleMention (e) {
				if (e.instance.props.id && e.instance.props.guildId && e.instance.props.id != e.instance.props.guildId) {
					let guild = BDFDB.LibraryStores.GuildStore.getGuild(e.instance.props.guildId);
					let channelId = e.instance.props.channelId;
					if (!channelId) {
						let currentChannelId = BDFDB.LibraryModules.LastChannelStore.getChannelId();
						channelId = BDFDB.LibraryStores.GuildChannelStore.getSelectableChannelIds(guild.id).indexOf(currentChannelId) > -1 ? currentChannelId : BDFDB.LibraryStores.GuildChannelStore.getDefaultChannel(guild.id).id;
					}
					return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.RoleMention, {
						type: "mention_textarea",
						children: [`@${guild.roles[e.instance.props.id].name}`],
						content: [
							{type: "text", content: `@${guild.roles[e.instance.props.id].name}`}
						],
						roleColor: guild.roles[e.instance.props.id].color,
						roleId: e.instance.props.id,
						channelId: channelId,
						guildId: e.instance.props.guildId,
						inlinePreview: false
					});
				}
			}
			
			processRoleMention (e) {
				if (!e.returnvalue) {
					if (e.instance.props.type == "mention_textarea") {
						e.instance.props.type = "mention";
						e.instance.props.place = "textarea";
					}
				}
				else if (e.instance.props.place == "textarea") {
					e.returnvalue.props.align = BDFDB.LibraryComponents.PopoutContainer.Align.BOTTOM;
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(changeLog));
})();
