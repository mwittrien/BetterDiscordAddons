/**
 * @name ServerFolders
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 6.9.3
 * @description Changes Discord's Folders, Servers open in a new Container, also adds extra Features to more easily organize, customize and manage your Folders
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ServerFolders/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/ServerFolders/ServerFolders.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "ServerFolders",
			"author": "DevilBro",
			"version": "6.9.3",
			"description": "Changes Discord's Folders, Servers open in a new Container, also adds extra Features to more easily organize, customize and manage your Folders"
		},
		"changeLog": {
			"fixed": {
				"Mentioned Bar": "No longer shows for Foldered Servers in extra Column"
			},
		}
	};

	return (window.Lightcord || window.LightCord) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return "Do not use LightCord!";}
		load () {BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)");}
		start() {}
		stop() {}
	} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
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
		var _this;
		var folderStates, folderReads, guildStates;
		var folderConfigs = {}, customIcons = {};

		const folderIcons = [
			{openicon: `<path d="M 200,390 H 955 L 795,770 H 200 Z" fill="REPLACE_FILL2"/><path d="M 176.6,811 C 163.9,811 155.1,802.6 155,784.7 V 212.9 C 157.9,190.5 169,179.8 195.9,176 h 246 c 20.3,3.2 34.5,18.7 41,28.6 C 494.9,228.3 492.9,240.4 494,266 l 313.6,1.3 c 17.6,0.4 23.3,3.7 23.3,3.7 8.6,4.2 14.8,10.7 19,19.5 C 856.3,319.5 854,360 854,360 h 108.9 c 4.4,2.4 13.7,1.2 11.8,23.5 L 815.8,789.4 c -2.1,5.2 -12.5,13.6 -18.7,16.1 -6.8,2.7 -18.5,5.5 -23.9,5.5 z M 767,759 897,430 H 360 L 230,759 Z" fill="REPLACE_FILL1"/>`,
			closedicon: `<path d="M 175,320 V 790 H 820 V 320 Z" fill="REPLACE_FILL2"/><path d="M 183,811 c -12.2,-0.6 -17.9,-4.8 -21.5,-8.2 C 159.5,801 154.8,792.6 155,779.7 V 215.6 c 3.3,-14.1 9.3,-21.4 15.1,-26.4 7.4,-6.3 16,-11.6 36.7,-13.2 h 237.3 c 23.3,6 32.2,18.7 38.7,28.6 7.6,11.7 9.4,18.6 10.3,41.4 L 494,266 h 313.4 c 16.9,0.1 23.5,5.1 23.5,5.1 8.6,4.2 14.5,10.9 19,19.5 0,0 3.7,7.5 3.1,19.8 V 777.2 c -1.1,9 -4.1,13.7 -4.1,13.7 -4.2,8.6 -10.7,14.8 -19.5,19 L 823.3,811 Z m 602.8,-55 c 2.8,-1.7 6.9,-4.5 8.9,-7.4 2.4,-3.6 5,-10.8 5.4,-24.7 V 362 c -0.2,-10.9 -4.2,-16.3 -4.2,-16.3 -2,-3 -5.9,-6.8 -8.7,-8.6 0,0 -5.8,-3 -12.7,-3.2 h -548.1 c -7.8,0 -13.9,3.6 -13.9,3.6 -3,2 -7.3,6.7 -8.4,17.3 v 386.4 c 2.8,10.4 7.5,16 13.6,17.7 h 544.9 c 11,-0.2 18.4,-1.9 23.3,-3 z" fill="REPLACE_FILL1"/>`},
			{openicon: `<path d="M 167,200 h 200 l 50,50 H 829.8 L 830,330 H 970 L 825,779 H 167 Z" fill="REPLACE_FILL2"/><path d="M 184,799 c -10.5,0 -22.3,-5.3 -27,-10 -4.7,-4.7 -9,-15.1 -9,-34 V 212 c 0,-13.3 5,-22 11,-28 4.4,-4.4 15.4,-10 30,-10 h 170.3 l 53.3,53 H 820 c 13.1,0 18.2,4.2 25,10 6.4,5.5 7,14.4 7,31 v 52 h 122.3 c 11.6,0 17.1,3.3 17.1,3.3 2.9,2.9 3.3,4.4 3.3,14.2 0,8.4 -0.9,13.5 -3.8,22.4 L 849,799 Z M 933,360 H 335 l -130,398.1 603.2,1.3 z M 289.7,334.6 c 3,-8.2 8,-14.8 17,-14.8 0,0 506.6,0.2 506.3,0.2 0,-39.8 -12.2,-53 -53,-53 L 403.3,266.7 350,213 H 240 c -37.6,0 -53,10.1 -53,53 v 382.7 z" fill="REPLACE_FILL1"/>`,
			closedicon: `<path d="M 173,190 V 771 H 825 V 250 H 420 l -70,-60 z" fill="REPLACE_FILL2"/><path d="M 184.2,799 C 170.3,799 164.3,795.8 157.4,788.9 151.7,783.3 148,774.6 148,754.9 V 211.2 c 0.7,-18.6 6,-21.7 11.9,-27.6 6.8,-6.8 15.5,-9.4 29.3,-9.6 h 170.1 l 53.3,53 h 407.7 c 14.1,0 18.6,2.8 25.3,9.4 6.4,6.4 7.1,13.4 7.1,30.8 v 246.1 247.4 c 0.2,11.8 -1.9,22.1 -7.4,27.6 C 839.7,793.9 831,799 819.4,799 Z M 813,707 V 415 c 0,-36.9 -13.9,-53 -53,-53 H 240 c -38.1,0 -53,11.7 -53,53 v 292 c 0,38.8 11.5,53 53,53 h 520 c 37.8,0 53,-12.1 53,-53 z M 760,267 c 0,0 -228.6,-0.3 -356.7,-0.3 L 350,213 H 240 c -41.6,2.7 -52.2,14.3 -53,53 v 54 h 626 c -0.6,-37.5 -12,-53 -53,-53 z" fill="REPLACE_FILL1"/>`},
			{openicon: `<path d="M 307,330 H 970 L 825,779 H 167 Z" fill="REPLACE_FILL2"/><path d="M 189 174 C 174.4 174 163.4 179.6 159 184 C 153 190 148 198.7 148 212 L 148 755 C 148 773.9 152.3 784.3 157 789 C 161.7 793.7 173.5 799 184 799 L 849 799 L 990.8 359.8 C 993.8 350.9 994.7 345.9 994.7 337.4 C 994.7 327.6 994.3 326.2 991.4 323.3 C 991.4 323.3 985.9 320 974.3 320 L 852 320 L 852 268 C 852 251.4 851.4 242.5 845 237 C 838.2 231.2 833.1 227 820 227 L 412.6 227 L 359.3 174 L 189 174 z M 335 360 L 933 360 L 808.2 759.3 L 205 758.1 L 335 360 z" fill="REPLACE_FILL1"/>`,
			closedicon: `<path d="M 173,345 V 771 H 825 V 345 Z" fill="REPLACE_FILL2"/><path d="M 189.2 174 C 175.4 174.2 166.7 176.8 159.9 183.6 C 154 189.5 148.7 192.7 148 211.2 L 148 754.9 C 148 774.6 151.7 783.3 157.4 788.9 C 164.3 795.8 170.3 799 184.2 799 L 819.4 799 C 831 799 839.7 793.9 845.2 788.4 C 850.8 782.8 852.9 772.5 852.7 760.8 L 852.7 513.3 L 852.7 267.2 C 852.7 249.8 852 242.8 845.6 236.4 C 838.9 229.7 834.4 227 820.3 227 L 412.6 227 L 359.3 174 L 189.2 174 z M 240 362 L 760 362 C 799.1 362 813 378.1 813 415 L 813 707 C 813 747.9 797.8 760 760 760 L 240 760 C 198.5 760 187 745.8 187 707 L 187 415 C 187 373.7 201.9 362 240 362 z" fill="REPLACE_FILL1"/>`},
			{openicon: `<path d="M 167,200 h 200 l 50,50 H 829.8 L 830,330 H 314 L 167,779 Z" fill="REPLACE_FILL2"/><path d="M 189 174 C 174.4 174 163.4 179.6 159 184 C 153 190 148 198.7 148 212 L 148 755 C 148 773.9 152.3 784.3 157 789 C 161.7 793.7 173.5 799 184 799 L 849 799 L 990.8 359.8 C 993.8 350.9 994.7 345.9 994.7 337.4 C 994.7 327.6 994.3 326.2 991.4 323.3 C 991.4 323.3 985.9 320 974.3 320 L 852 320 L 852 268 C 852 251.4 851.4 242.5 845 237 C 838.2 231.2 833.1 227 820 227 L 412.6 227 L 359.3 174 L 189 174 z M 240 213 L 350 213 L 403.3 266.7 L 760 267 C 800.8 267 813 280.2 813 320 C 813.3 320 306.7 319.8 306.7 319.8 C 297.7 319.8 292.7 326.4 289.7 334.6 L 187 648.7 L 187 266 C 187 223.1 202.4 213 240 213 z" fill="REPLACE_FILL1"/>`,
			closedicon: `<path d="M 173,190 V 350 H 825 V 250 H 420 l -70,-60 z" fill="REPLACE_FILL2"/><path d="M 189.2 174 C 175.4 174.2 166.7 176.8 159.9 183.6 C 154 189.5 148.7 192.7 148 211.2 L 148 754.9 C 148 774.6 151.7 783.3 157.4 788.9 C 164.3 795.8 170.3 799 184.2 799 L 819.4 799 C 831 799 839.7 793.9 845.2 788.4 C 850.8 782.8 852.9 772.5 852.7 760.8 L 852.7 513.3 L 852.7 267.2 C 852.7 249.8 852 242.8 845.6 236.4 C 838.9 229.7 834.4 227 820.3 227 L 412.6 227 L 359.3 174 L 189.2 174 z M 240 213 L 350 213 L 403.3 266.7 C 531.4 266.7 760 267 760 267 C 801 267 812.4 282.5 813 320 L 187 320 L 187 266 C 187.8 227.3 198.4 215.7 240 213 z" fill="REPLACE_FILL1"/>`},
			{openicon: `<path d="M 132,305 H 880 V 750 H 132 Z" fill="REPLACE_FILL2"/><path d="M 135,188 c -5.6,0 -13.9,2.9 -19.8,8.9 C 109.4,203 107,206.8 107,216 c 0,189.7 0,379.3 0,569 0,11.1 1.7,14.8 7,20.2 C 120.5,811.6 125.4,813 135,813 h 717 c 16.7,0 16.7,-1.6 18.6,-6.6 L 981.3,423.4 c 0,-5.8 -1,-6.2 -2.8,-8.1 -1.9,-1.9 -4.3,-2 -11.9,-2 l -691.9,2.1 c -16.4,0 -21.3,11.5 -23.4,17.2 l -80.9,263 -0.2,0 C 159.1,714.4 147,704.3 147,677.2 V 334 h 733 v -26 c 0,-7.7 -1.6,-14.7 -7.6,-19.8 C 866.3,283.1 860.4,280 852,280 H 440 l -20,-82 c -1.2,-2.5 -3.1,-6.8 -5.8,-7.7 0,0 -3,-2.3 -10.2,-2.3 z" fill="REPLACE_FILL1"/>`,
			closedicon: `<path d="M 132,305 H 880 V 750 H 132 Z" fill="REPLACE_FILL2"/><path d="M 135,813 c -10.3,0 -14.5,-1.4 -21,-7.8 C 108.7,799.8 107,796.1 107,785 c 0,-189.7 0,-379.3 0,-569 0,-9.2 2.4,-13 8.2,-19.1 C 121.1,190.9 129.4,188 135,188 h 269 c 7.2,0 10.2,2.3 10.2,2.3 2.7,0.9 4.6,5.2 5.8,7.7 l 20,82 h 412 c 8.4,0 14.3,3.1 20.4,8.2 C 878.4,293.3 880,300.3 880,308 v 26 H 147 v 343.2 c 0,27.1 18.1,25.2 21.7,5.4 l 32.7,-277.7 c 0.7,-2.8 2.7,-7.5 5.8,-10.6 C 210.4,391.1 214.5,388 222.7,388 H 852 c 7.9,0 15.9,2.9 20.5,7.5 C 878.3,401.3 880,408.6 880,416 v 369 c 0,6.9 -1.8,14.7 -7.4,19.3 C 866.2,809.6 858.9,813 852,813 Z" fill="REPLACE_FILL1"/>`},
			{openicon: `<path d="M 186.3,187 c -20,0 -35.7,7.4 -47.4,19.3 -11.7,11.9 -17.6,25 -17.6,45.7 v 80 l -0.3,416 c 0,10.9 4.6,32.6 16.7,45.1 C 149.8,805.6 168,813 186.3,813 365.7,749.3 880.3,734.5 880.3,734.5 c 0,0 0,-255.4 0,-402.5 0,-16.9 -4.7,-35 -17.2,-47.4 -12.5,-12.4 -30.1,-17.6 -47.8,-17.6 h -310 l -79,-80 z" fill="REPLACE_FILL1"/><path d="m 175.1,810.3 79.1,-393 c 8.3,-23.6 21.8,-42.9 53.1,-43 H 920.6 c 17.7,0 35.9,19.5 33.7,29.3 l -73.7,365.7 c -9,24.8 -11.1,41.3 -51.8,44 H 185.6 c -3.6,0 -6.4,-0.1 -11.1,-0.9 z" fill="REPLACE_FILL2"/>`,
			closedicon: `<path d="M 121,252 c 0,-20.7 5.9,-33.8 17.6,-45.7 C 150.3,194.4 166,187 186,187 h 240 l 79,80 -384,113 z" fill="REPLACE_FILL1"/><path d="M 186,813 c -18.4,0 -36.5,-7.4 -48.6,-19.9 C 125.3,780.6 120.7,758.9 120.7,748 L 121,332 c 0,-16.9 7.2,-31.7 18.6,-43.5 C 151,276.7 170.1,267 186,267 h 629 c 17.6,0 35.2,5.3 47.8,17.6 C 875.3,297 880,315.1 880,332 v 416 c 0,14.8 -3.4,36.6 -17,47.9 C 849.5,807.2 830.9,813 815,813 Z" fill="REPLACE_FILL2"/>`},
			{openicon: `<path d="M 160,253 h 614 c 14.8,0 29.7,8.6 36.9,15.8 C 819.4,277.3 826,289.4 826,305 v 95 H 160 Z" fill="REPLACE_FILL2"/><path d="M 199,200 c -26.2,0 -33.9,6.5 -41.5,15.6 C 149.8,224.8 147,231.8 147,252 V 386.7 387 c -20.9,0.5 -56.5,-3.5 -70.3,6.9 -2.5,1.9 -5.4,3.2 -8.3,9.8 -6.8,25.6 -0.3,54.8 1.1,70.3 9.1,59.2 69.1,294.7 74.9,310 3.7,9.8 4.6,13.6 10,15 h 689.6 c 6.3,-1.4 11.6,-15 11.6,-15 L 931.8,474 c 2.7,-20 8.3,-54 -0.2,-70.3 -2,-3.5 -6.5,-8.1 -9.3,-9.8 C 902.5,385.1 881.9,387 853,387 852.6,369.4 855,346.8 846.6,333 842.4,326.2 830.5,321.3 826,321.3 V 387 L 173.2,386.7 173,387 v -82 c 0,-14.6 2.8,-25.9 12.4,-35.5 C 195.9,259 207.7,253 225,253 h 201 l -54,-53 z" fill="REPLACE_FILL1"/>`,
			closedicon: `<path d="M 160,400 V 253 h 440 v 147 z" fill="REPLACE_FILL2"/><path d="M 186,799 c -24.2,0 -34,-8 -39.7,-13.6 C 140.8,779.9 134,769.1 134,747 V 372 c 0,-21.5 13,-32 13,-32 V 252 c 0,-20.2 2.8,-27.2 10.5,-36.4 C 165.1,206.5 172.8,200 199,200 h 173 l 54,53 H 225 c -17.3,0 -29.1,6 -39.6,16.5 C 175.8,279.1 173,290.4 173,305 l -0.4,19 c 0,0 9.6,-4 20.9,-4 H 494 L 614,200 h 186 c 17.7,0 26.6,7.1 36,14.2 C 846.5,222 852,233.6 852,252 v 495 c 0,16.1 -7.5,30.2 -14.1,36.7 C 831.4,790.2 815.9,799 800,799 Z" fill="REPLACE_FILL1"/>`}
		];
		
		var folderGuildContent = null;
		const FolderGuildContentComponent = class FolderGuildContent extends BdApi.React.Component {
			componentDidMount() {
				folderGuildContent = this;
			}
			render() {
				let closing = this.props.closing;
				delete this.props.closing;
				let folders = Array.from(BDFDB.LibraryModules.FolderUtils.getExpandedFolders()).map(folderId => BDFDB.LibraryModules.FolderStore.getGuildFolderById(folderId)).filter(folder => folder && folder.guildIds);
				this.props.folders = folders.length || closing ? folders : (this.props.folders || []);
				BDFDB.TimeUtils.clear(this._rerenderTimeout);
				if (!folders.length && this.props.folders.length && !closing) this._rerenderTimeout = BDFDB.TimeUtils.timeout(_ => {
					this.props.closing = true;
					BDFDB.ReactUtils.forceUpdate(this);
				}, 300);
				return BDFDB.ReactUtils.createElement("nav", {
					className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.guildswrapper, BDFDB.disCN.guilds, this.props.isAppFullscreen && BDFDB.disCN.guildswrapperhidden, this.props.themeOverride && BDFDB.disCN.themedark, BDFDB.disCN._serverfoldersfoldercontent, (!folders.length || closing) && BDFDB.disCN._serverfoldersfoldercontentclosed),
					children: BDFDB.ReactUtils.createElement("ul", {
						role: "tree",
						tabindex: 0,
						"data-list-id": "guildfoldersnav",
						className: BDFDB.disCN.guildstree,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Scrollers.None, {
							className: BDFDB.disCN.guildsscroller,
							children: this.props.folders.map(folder => {
								let data = _this.getFolderConfig(folder.folderId);
								return folder.guildIds.map(guildId => {
									return [
										this.draggedGuild == guildId ? null : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Guild, {
											guild: BDFDB.LibraryModules.GuildStore.getGuild(guildId),
											state: true,
											list: true,
											tooltipConfig: Object.assign({
												offset: 12
											}, data.copyTooltipColor && {
												backgroundColor: data.color3,
												fontColor: data.color4,
											}),
											onClick: event => {
												if (BDFDB.ListenerUtils.isPressed(46)) {
													BDFDB.ListenerUtils.stopEvent(event);
													_this.removeGuildFromFolder(folder.folderId, guildId);
												}
												else {
													if (_this.settings.general.closeAllFolders) {
														for (let openFolderId of BDFDB.LibraryModules.FolderUtils.getExpandedFolders()) if (openFolderId != folder.folderId || !_this.settings.general.forceOpenFolder) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(openFolderId);
													}
													else if (_this.settings.general.closeTheFolder && !_this.settings.general.forceOpenFolder && BDFDB.LibraryModules.FolderUtils.isFolderExpanded(folder.folderId)) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(folder.folderId);
													else BDFDB.ReactUtils.forceUpdate(this);
												}
											},
											onMouseDown: (event, instance) => {
												event = event.nativeEvent || event;
												let mouseMove = event2 => {
													if (Math.sqrt((event.pageX - event2.pageX)**2) > 20 || Math.sqrt((event.pageY - event2.pageY)**2) > 20) {
														BDFDB.ListenerUtils.stopEvent(event);
														this.draggedGuild = guildId;
														let dragPreview = _this.createDragPreview(BDFDB.ReactUtils.findDOMNode(instance).cloneNode(true), event2);
														BDFDB.ReactUtils.forceUpdate(this);
														document.removeEventListener("mousemove", mouseMove);
														document.removeEventListener("mouseup", mouseUp);
														let dragging = event3 => {
															_this.updateDragPreview(dragPreview, event3);
															let placeholder = BDFDB.DOMUtils.getParent(BDFDB.dotCN._serverfoldersguildplaceholder, event3.target);
															let hoveredGuild = (BDFDB.ReactUtils.findValue(BDFDB.DOMUtils.getParent(BDFDB.dotCNS._serverfoldersfoldercontent + BDFDB.dotCN.guildouter, placeholder ? placeholder.previousSibling : event3.target), "guild", {up: true}) || {}).id;
															if (hoveredGuild) {
																let hoveredGuildFolder = BDFDB.GuildUtils.getFolder(hoveredGuild);
																if (!hoveredGuildFolder || hoveredGuildFolder.folderId != folder.folderId) hoveredGuild = null;
															}
															let update = hoveredGuild != this.hoveredGuild;
															if (hoveredGuild) this.hoveredGuild = hoveredGuild;
															else delete this.hoveredGuild; 
															if (update) BDFDB.ReactUtils.forceUpdate(this);
														};
														let releasing = event3 => {
															BDFDB.ListenerUtils.stopEvent(event3);
															BDFDB.DOMUtils.remove(dragPreview);
															if (this.hoveredGuild) {
																let guildIds = [].concat(folder.guildIds);
																BDFDB.ArrayUtils.remove(guildIds, this.draggedGuild, true);
																guildIds.splice(guildIds.indexOf(this.hoveredGuild) + 1, 0, this.draggedGuild);
																_this.updateFolder(Object.assign({}, folder, {guildIds}));
															}
															delete this.draggedGuild;
															delete this.hoveredGuild;
															BDFDB.ReactUtils.forceUpdate(this);
															document.removeEventListener("mousemove", dragging);
															document.removeEventListener("mouseup", releasing);
														};
														document.addEventListener("mousemove", dragging);
														document.addEventListener("mouseup", releasing);
													}
												};
												let mouseUp = _ => {
													document.removeEventListener("mousemove", mouseMove);
													document.removeEventListener("mouseup", mouseUp);
												};
												document.addEventListener("mousemove", mouseMove);
												document.addEventListener("mouseup", mouseUp);
											}
										}),
										this.hoveredGuild != guildId ? null : BDFDB.ReactUtils.createElement("div", {
											className: BDFDB.disCNS.guildouter + BDFDB.disCN._serverfoldersguildplaceholder,
											children: BDFDB.ReactUtils.createElement("div", {
												children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Items.DragPlaceholder, {})
											})
										})
									]
								});
							}).filter(n => n).reduce((r, a) => r.concat(a, _this.settings.general.addSeparators ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Items.Separator, {}) : null), [0]).slice(1, -1).flat(10).filter(n => n)
						})
					})
				});
			}
		};
		
		const FolderIconPickerComponent = class FolderIconPicker extends BdApi.React.Component {
			render() {
				let folderIcons = _this.loadAllIcons();
				for (let id in folderIcons) if (!folderIcons[id].customID) {
					folderIcons[id].openicon = _this.createBase64SVG(folderIcons[id].openicon);
					folderIcons[id].closedicon = _this.createBase64SVG(folderIcons[id].closedicon);
				}
				folderIcons["-1"] = {};
				return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
					wrap: BDFDB.LibraryComponents.Flex.Wrap.WRAP,
					children: Object.keys(folderIcons).sort().map(id => {
						return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Card, {
							className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._serverfoldersiconswatch, this.props.selectedIcon == id && BDFDB.disCN._serverfoldersiconswatchselected),
							backdrop: false,
							iconID: id,
							grow: 0,
							shrink: 0,
							noRemove: !folderIcons[id].customID || this.props.selectedIcon == id,
							onMouseEnter: _ => {
								this.props.hoveredIcon = id;
								BDFDB.ReactUtils.forceUpdate(this);
							},
							onMouseLeave: _ => {
								delete this.props.hoveredIcon;
								BDFDB.ReactUtils.forceUpdate(this);
							},
							onClick: _ => {
								this.props.selectedIcon = id;
								this.props.onSelect(this.props.selectedIcon);
								BDFDB.ReactUtils.forceUpdate(this);
							},
							onRemove: _ => {
								delete customIcons[id];
								BDFDB.DataUtils.save(customIcons, _this, "customicons");
								BDFDB.ReactUtils.forceUpdate(this);
							},
							children: folderIcons[id].closedicon ? BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCN._serverfoldersiconswatchinner,
								style: {background: `url(${this.props.hoveredIcon == id ? folderIcons[id].openicon : folderIcons[id].closedicon}) center/cover no-repeat`}
							}) : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, {
								className: BDFDB.disCN._serverfoldersiconswatchinner,
								name: BDFDB.LibraryComponents.SvgIcon.Names.FOLDER,
								style: {color: "rbg(0, 0, 0)"}
							})
						});
					})
				})
			}
		};
		
		const FolderIconCustomPreviewComponent = class FolderIconCustomPreview extends BdApi.React.Component {
			componentDidMount() {
				this._previewInterval = BDFDB.TimeUtils.interval(_ => {
					this.props.tick = !this.props.tick;
					if (this.props.open || this.props.closed) BDFDB.ReactUtils.forceUpdate(this);
				}, 2000);
			}
			componentWillUnmount () {
				BDFDB.TimeUtils.clear(this._previewInterval);
			}
			checkImage(base64OrUrl, callback) {
				if (base64OrUrl.indexOf("https://") == 0 || base64OrUrl.indexOf("http://") == 0) BDFDB.LibraryRequires.request(base64OrUrl.trim(), {encoding: null}, (error, response, body) => {
					if (response && response.headers["content-type"] && response.headers["content-type"].indexOf("image") != -1 && response.headers["content-type"] != "image/gif") {
						this.resizeImage("data:" + response.headers["content-type"] + ";base64," + (new Buffer(body).toString("base64")), callback);
					}
					else callback(base64OrUrl);
				});
				else this.resizeImage(base64OrUrl, callback);
			}
			resizeImage(base64, callback) {
				let type = base64.split("data:").slice(1).join(" ").split(";")[0];
				if (type == "image/gif") callback(base64);
				else {
					let img = new Image();
					img.onload = function() {
						let width = 0, height = 0;
						if (this.width >= this.height) {
							width = (128 / this.height) * this.width;
							height = 128;
						}
						else {
							width = 128;
							height = (128 / this.width) * this.height;
						}
						let canvas = document.createElement("canvas");
						let ctx = canvas.getContext("2d");
						ctx.canvas.width = width;
						ctx.canvas.height = height;
						ctx.drawImage(img, 0, 0, width, height);
						callback(canvas.toDataURL(type));
					};
					img.onerror = function() {
						callback(base64);
					};
					img.src = base64;
				}
			}
			render() {
				let openInput, closeInput;
				return [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: _this.labels.modal_customopen,
						className: BDFDB.disCN.marginbottom20,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
							type: "file",
							filter: "image",
							value: this.props.open,
							ref: instance => {if (instance) openInput = instance;},
							onChange: value => {
								this.props.open = value;
								BDFDB.ReactUtils.forceUpdate(this);
							}
						})
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: _this.labels.modal_customclosed,
						className: BDFDB.disCN.marginbottom20,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
							type: "file",
							filter: "image",
							value: this.props.closed,
							ref: instance => {if (instance) closeInput = instance;},
							onChange: value => {
								this.props.closed = value;
								BDFDB.ReactUtils.forceUpdate(this);
							}
						})
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
						title: _this.labels.modal_custompreview,
						className: BDFDB.disCN.marginbottom20,
						children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							justify: BDFDB.LibraryComponents.Flex.Justify.BETWEEN,
							align: BDFDB.LibraryComponents.Flex.Align.CENTER,
							children: [
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._serverfoldersiconswatch, BDFDB.disCN._serverfoldersiconswatchpreview, !this.props.open && BDFDB.disCN._serverfoldersiconswatchnopreview),
									children: BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN._serverfoldersiconswatchinner,
										style: this.props.open && {background: `url(${this.props.open}) center/cover no-repeat`} || {}
									})
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._serverfoldersiconswatch, BDFDB.disCN._serverfoldersiconswatchpreview, !this.props.closed && BDFDB.disCN._serverfoldersiconswatchnopreview),
									children: BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN._serverfoldersiconswatchinner,
										style: this.props.closed && {background: `url(${this.props.closed}) center/cover no-repeat`} || {}
									})
								}),
								BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN._serverfoldersiconswatch, BDFDB.disCN._serverfoldersiconswatchpreview, !(this.props.tick ? this.props.open : this.props.closed) && BDFDB.disCN._serverfoldersiconswatchnopreview),
									children: BDFDB.ReactUtils.createElement("div", {
										className: BDFDB.disCN._serverfoldersiconswatchinner,
										style: (this.props.tick ? this.props.open : this.props.closed) && {background: `url(${(this.props.tick ? this.props.open : this.props.closed)}) center/cover no-repeat`} || {}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
									children: BDFDB.LanguageUtils.LanguageStrings.ADD,
									onClick: _ => {
										if (openInput.props.value && closeInput.props.value) {
											this.checkImage(openInput.props.value, openIcon => {
												this.checkImage(closeInput.props.value, closedIcon => {
													customIcons[_this.generateId("customicon")] = {openicon: openIcon, closedicon: closedIcon};
													BDFDB.DataUtils.save(customIcons, _this, "customicons");
													this.props.open = null;
													this.props.closed = null;
													BDFDB.PatchUtils.forceAllUpdates(_this, "GuildFolderSettingsModal");
													BDFDB.NotificationUtils.toast("Custom Icon was added to Selection", {type: "success"});
												});
											})
										}
										else BDFDB.NotificationUtils.toast("Add an Image for the open and closed Icon", {type: "danger"});
									}
								})
							]
						})
					})
				]
			}
		};
	
		return class ServerFolders extends Plugin {
			onLoad () {
				_this = this;
				
				folderStates = {};
				folderReads = {};
				guildStates = {};
				
				this.defaults = {
					general: {
						closeOtherFolders:	{value: false, 	description: "Closes other Folders when opening a Folder"},
						closeTheFolder:		{value: false, 	description: "Closes the Folder when selecting a Server"},
						closeAllFolders:	{value: false, 	description: "Closes all Folders when selecting a Server"},
						forceOpenFolder:	{value: false, 	description: "Forces a Folder to open when switching to a Server of that Folder"},
						showCountBadge:		{value: true, 	description: "Displays Badge for Amount of Servers in a Folder"},
						extraColumn:		{value: true, 	description: "Moves the Servers from opened Folders in an extra Column"},
						addSeparators:		{value: true, 	description: "Adds Separators between Servers of different Folders in extra Column"}
					}
				};
			
				this.patchedModules = {
					after: {
						AppView: "default",
						Guilds: "render",
						GuildFolder: "render",
						Guild: ["componentDidMount", "render"],
						GuildFolderSettingsModal: ["componentDidMount", "render"]
					}
				};
				
				this.css = `
					${BDFDB.dotCN._serverfoldersiconswatch} {
						position: relative;
						margin: 3px 3px;
						padding: 3px 3px;
						width: 55px;
						height: 55px;
						border-radius: 12px;
						cursor: pointer;
					}
					${BDFDB.dotCN._serverfoldersiconswatch + BDFDB.dotCN._serverfoldersiconswatchpreview} {
						width: 95px;
						height: 95px;
						cursor: default;
					}
					${BDFDB.dotCN._serverfoldersiconswatch}:hover {
						background-color: var(--background-modifier-hover);
					}
					${BDFDB.dotCN._serverfoldersiconswatch + BDFDB.dotCN._serverfoldersiconswatchselected} {
						background-color: var(--background-modifier-selected);
					}
					${BDFDB.dotCNS._serverfoldersiconswatch + BDFDB.dotCN._serverfoldersiconswatchinner} {
						width: 100%;
						height: 100%;
						border-radius: 12px;
						background-position: center;
						background-size: cover;
						background-repeat: no-repeat;
					}
					${BDFDB.dotCN._serverfoldersiconswatchnopreview},
					${BDFDB.dotCN._serverfoldersiconswatchnopreview}:hover {
						background-color: transparent;
					}
					${BDFDB.dotCNS._serverfoldersiconswatchnopreview + BDFDB.dotCN._serverfoldersiconswatchinner} {
						background-image: url('data:image/svg+xml; utf8, <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><g fill="none" stroke="rgb(240,71,71)" stroke-width="2.63295174" stroke-linecap="round"><path d="M 2.3297741,2.3297744 17.669885,17.670227"/><path d="M 17.66721,2.3327927 2.3327902,17.667207"/></g></svg>');
					}
					${BDFDB.dotCN._serverfoldersiconswatch} svg${BDFDB.dotCN._serverfoldersiconswatchinner} {
						transform: translateY(-2px) scale(0.8);
					}
					${BDFDB.dotCNS._serverfoldersiconswatch + BDFDB.dotCN.hovercardbutton} {
						position: absolute;
						top: -10px;
						right: -10px;
					}
					${BDFDB.dotCN._serverfoldersdragpreview} {
						pointer-events: none !important;
						position: absolute !important;
						opacity: 0.5 !important;
						z-index: 10000 !important;
					}
					${BDFDB.dotCN._serverfoldersfoldercontent + BDFDB.notCN.guildswrapperhidden} {
						transition: width 0.3s linear !important;
					}
					${BDFDB.dotCN._serverfoldersfoldercontent + BDFDB.dotCN._serverfoldersfoldercontentclosed} {
						width: 0 !important;
					}
				`;
			}
			
			onStart () {
				// REMOVE 24.04.2021
				let oldData = BDFDB.DataUtils.load(this);
				if (oldData.settings) {
					this.settings.general = oldData.settings;
					BDFDB.DataUtils.save(this.settings.general, this, "general");
					BDFDB.DataUtils.remove(this, "settings");
				}
				
				let forceClosing = false;
				BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.GuildUtils, "toggleGuildFolderExpand", {after: e => {
					if (this.settings.general.closeOtherFolders && !forceClosing) {
						forceClosing = true;
						for (let openFolderId of BDFDB.LibraryModules.FolderUtils.getExpandedFolders()) if (openFolderId != e.methodArguments[0]) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(openFolderId);
						forceClosing = false;
					}
				}});
				
				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
				
				BDFDB.DOMUtils.removeClassFromDOM(BDFDB.disCN._serverfoldersfoldercontentisopen);
			}

			onSwitch () {
				if (typeof BDFDB === "object" && this.settings.general.forceOpenFolder) {
					let folder = BDFDB.GuildUtils.getFolder(BDFDB.LibraryModules.LastGuildStore.getGuildId());
					if (folder && !BDFDB.LibraryModules.FolderUtils.isFolderExpanded(folder.folderId)) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(folder.folderId);
				}
			}
			
			getSettingsPanel (collapseStates = {}) {
				let settingsPanel;
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
					collapseStates: collapseStates,
					children: _ => {
						let settingsItems = [];
						
						for (let key in this.defaults.general) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
							type: "Switch",
							plugin: this,
							keys: ["general", key],
							label: this.defaults.general[key].description,
							value: this.settings.general[key]
						}));
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Button",
							color: BDFDB.LibraryComponents.Button.Colors.RED,
							label: "Reset all Folders",
							onClick: _ => BDFDB.ModalUtils.confirm(this, "Are you sure you want to reset all Folders?", _ => BDFDB.DataUtils.remove(this, "folders")),
							children: BDFDB.LanguageUtils.LanguageStrings.RESET
						}));
						settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
							type: "Button",
							color: BDFDB.LibraryComponents.Button.Colors.RED,
							label: "Remove all custom Icons",
							onClick: _ => BDFDB.ModalUtils.confirm(this, "Are you sure you want to remove all custom Icons?", _ => BDFDB.DataUtils.remove(this, "customicons")),
							children: BDFDB.LanguageUtils.LanguageStrings.REMOVE
						}));
						
						return settingsItems;
					}
				});
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					folderStates = {};
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				folderConfigs = BDFDB.DataUtils.load(this, "folders");
				customIcons = BDFDB.DataUtils.load(this, "customicons");
				
				BDFDB.ReactUtils.forceUpdate(folderGuildContent);
				BDFDB.PatchUtils.forceAllUpdates(this);
				BDFDB.DiscordUtils.rerenderAll();
			}

			onGuildContextMenu (e) {
				if (document.querySelector(BDFDB.dotCN.modalwrapper)) return;
				if (e.instance.props.guild) {
					let folders = BDFDB.LibraryModules.FolderStore.guildFolders.filter(n => n.folderId);
					let folder = BDFDB.GuildUtils.getFolder(e.instance.props.guild.id);
					let unfolderedGuilds = BDFDB.LibraryModules.FolderStore.getSortedGuilds().filter(n => !n.folderId).map(n => n.guilds[0]).filter(n => n);
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
					children.splice(index > -1 ? index : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.servercontext_serverfolders,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "submenu-add"),
							children: folder ? [
								BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
									label: this.labels.serversubmenu_removefromfolder,
									id: BDFDB.ContextMenuUtils.createItemId(this.name, "remove-from-folder"),
									color: BDFDB.LibraryComponents.MenuItems.Colors.DANGER,
									action: _ => {
										this.removeGuildFromFolder(folder.folderId, e.instance.props.guild.id);
									}
								})
							] : [
								BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
									label: this.labels.serversubmenu_createfolder,
									id: BDFDB.ContextMenuUtils.createItemId(this.name, "create-folder"),
									disabled: !unfolderedGuilds.length,
									action: _ => {
										this.openFolderCreationMenu(unfolderedGuilds, e.instance.props.guild.id);
									}
								}),
								BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
									label: this.labels.serversubmenu_addtofolder,
									id: BDFDB.ContextMenuUtils.createItemId(this.name, "submenu-add-to-folder"),
									disabled: !folders.length,
									children: folders.map((folder, i) => BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
										label: folder.folderName || `${BDFDB.LanguageUtils.LanguageStrings.SERVER_FOLDER_PLACEHOLDER} #${i + 1}`,
										id: BDFDB.ContextMenuUtils.createItemId(this.name, "add-to-folder", i + 1),
										action: _ => {
											this.addGuildToFolder(folder.folderId, e.instance.props.guild.id);
										}
									}))
								})
							]
						})
					}));
				}
			}
			
			onGuildFolderContextMenu (e) {
				if (document.querySelector(BDFDB.dotCN.modalwrapper)) return;
				if (e.instance.props.target && e.instance.props.folderId) {
					let folder = BDFDB.LibraryModules.FolderStore.getGuildFolderById(e.instance.props.folderId);
					let data = this.getFolderConfig(e.instance.props.folderId);
					let muted = data.muteFolder && folder.guildIds.every(guildid => BDFDB.LibraryModules.MutedUtils.isGuildOrCategoryOrChannelMuted(guildid));
					if (data.muteFolder != muted) {
						data.muteFolder = muted;
						BDFDB.DataUtils.save(data, this, "folders", e.instance.props.folderId);
					}
					let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "mark-folder-read"});
					children.splice(index > -1 ? index + 1 : children.length, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuCheckboxItem, {
						label: this.labels.foldercontext_autoreadfolder,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "auto-read-folder"),
						checked: data.autoRead,
						action: state => {
							data.autoRead = state;
							BDFDB.DataUtils.save(data, this, "folders", e.instance.props.folderId);
						}
					}));
					e.returnvalue.props.children.splice(e.returnvalue.props.children.length - 1, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuCheckboxItem, {
							label: this.labels.foldercontext_mutefolder,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "mute-folder"),
							checked: muted,
							action: state => {
								data.muteFolder = state;
								BDFDB.DataUtils.save(data, this, "folders", e.instance.props.folderId);
								for (let guildId of folder.guildIds) if (BDFDB.LibraryModules.MutedUtils.isGuildOrCategoryOrChannelMuted(guildId) != state) BDFDB.LibraryModules.GuildNotificationsUtils.updateGuildNotificationSettings(guildId, {muted: state, suppress_everyone: state, suppress_roles: state});
							}
						})
					}));
					e.returnvalue.props.children.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
						children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: this.labels.foldercontext_removefolder,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "remove-folder"),
							color: BDFDB.LibraryComponents.MenuItems.Colors.DANGER,
							action: event => {
								BDFDB.ModalUtils.confirm(this, `Are you sure you want to remove the folder${folder.folderName ? ` '${folder.folderName}'` : ""}?`, _ => {
									this.removeFolder(e.instance.props.folderId);
								});
							}
						})
					}));
				}
			}

			processAppView (e) {
				if (this.settings.general.extraColumn) {
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {props: [["className", BDFDB.disCN.guilds]]});
					if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(FolderGuildContentComponent, {
						isAppFullscreen: BDFDB.LibraryModules.VoiceChannelUtils.isFullscreenInContext(),
						themeOverride: BDFDB.LibraryModules.LocalSettingsStore.darkSidebar
					}, true));
				}
			}

			processGuilds (e) {
				if (this.settings.general.extraColumn) {
					if (folderGuildContent && (e.instance.props.isAppFullscreen != folderGuildContent.props.isAppFullscreen || e.instance.props.themeOverride != folderGuildContent.props.themeOverride)) {
						folderGuildContent.props.isAppFullscreen = e.instance.props.isAppFullscreen;
						folderGuildContent.props.themeOverride = e.instance.props.themeOverride;
						BDFDB.ReactUtils.forceUpdate(folderGuildContent);
					}
					if (typeof e.returnvalue.props.children == "function") {
						let childrenRender = e.returnvalue.props.children;
						e.returnvalue.props.children = BDFDB.TimeUtils.suppress((...args) => {
							let children = childrenRender(...args);
							this.checkTree(children);
							return children;
						}, "", this);
					}
					else this.checkTree(e.returnvalue);
				}
			}
			
			checkTree (returnvalue) {
				let tree = BDFDB.ReactUtils.findChild(returnvalue, {filter: n => n && n.props && typeof n.props.children == "function"});
				if (tree) {
					let childrenRender = tree.props.children;
					tree.props.children = BDFDB.TimeUtils.suppress((...args) => {
						let children = childrenRender(...args);
						this.handleGuilds(children);
						return children;
					}, "", this);
				}
				else this.handleGuilds(returnvalue);
			}
			
			handleGuilds (returnvalue) {
				let topBar = BDFDB.ReactUtils.findChild(returnvalue, {props: [["className", BDFDB.disCN.guildswrapperunreadmentionsbartop]]});
				if (topBar) {
					let topIsVisible = topBar.props.isVisible;
					topBar.props.isVisible = (...args) => {
						let ids = BDFDB.LibraryModules.FolderStore.guildFolders.filter(n => n.folderId).map(n => n.guildIds).flat(10);
						args[2] = args[2].filter(id => !ids.includes(id));
						return topIsVisible(...args);
					};
				}
				let bottomBar = BDFDB.ReactUtils.findChild(returnvalue, {props: [["className", BDFDB.disCN.guildswrapperunreadmentionsbarbottom]]});
				if (bottomBar) {
					let bottomIsVisible = bottomBar.props.isVisible;
					bottomBar.props.isVisible = (...args) => {
						let ids = BDFDB.LibraryModules.FolderStore.guildFolders.filter(n => n.folderId).map(n => n.guildIds).flat(10);
						args[2] = args[2].filter(id => !ids.includes(id));
						return bottomIsVisible(...args);
					};
				}
			}
			
			processGuildFolder (e) {
				let expandedFolders = BDFDB.LibraryModules.FolderUtils.getExpandedFolders();
				if (expandedFolders.size) BDFDB.DOMUtils.addClass(document.body, BDFDB.disCN._serverfoldersfoldercontentisopen);
				else BDFDB.DOMUtils.removeClassFromDOM(BDFDB.disCN._serverfoldersfoldercontentisopen);
				
				let data = this.getFolderConfig(e.instance.props.folderId);
				if (data.muteFolder) for (let guildId of e.instance.props.guildIds) if (!BDFDB.LibraryModules.MutedUtils.isGuildOrCategoryOrChannelMuted(guildId)) BDFDB.LibraryModules.GuildNotificationsUtils.updateGuildNotificationSettings(guildId, {muted: true, suppress_everyone: true});
				
				let state = this.getState(e.instance);
				if (folderStates[e.instance.props.folderId] && !BDFDB.equals(state, folderStates[e.instance.props.folderId])) {
					if (data.autoRead && (state.unread || state.badge > 0)) {
						BDFDB.TimeUtils.clear(folderReads[e.instance.props.folderId]);
						folderReads[e.instance.props.folderId] = BDFDB.TimeUtils.timeout(_ => {
							BDFDB.GuildUtils.markAsRead(e.instance.props.guildIds);
						}, 10000);
					}
					BDFDB.ReactUtils.forceUpdate(folderGuildContent);
				}
				folderStates[e.instance.props.folderId] = state;
				
				let [tooltipParent, tooltipIndex] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["ListItemTooltip", "BDFDB_TooltipContainer"]});
				if (tooltipIndex > -1) tooltipParent[tooltipIndex] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
					text: e.instance.props.folderName || BDFDB.FolderUtils.getDefaultName(e.instance.props.folderId),
					tooltipConfig: {
						type: "right",
						list: true,
						offset: 12,
						backgroundColor: data.color3,
						fontColor: data.color4
					},
					children: tooltipParent[tooltipIndex].props.children
				});
				if (e.instance.props.expanded || data.useCloseIcon) {
					let folderIcons = this.loadAllIcons(), icontype = e.instance.props.expanded ? "openicon" : "closedicon";
					let icon = folderIcons[data.iconID] ? (!folderIcons[data.iconID].customID ? this.createBase64SVG(folderIcons[data.iconID][icontype], data.color1, data.color2) : folderIcons[data.iconID][icontype]) : null;
					if (icon) {
						let [folderIconParent, folderIconIndex] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "FolderIcon"});
						if (folderIconIndex > -1) folderIconParent[folderIconIndex] = BDFDB.ReactUtils.createElement("div", {
							className: BDFDB.disCN.guildfoldericonwrapper,
							style: {background: `url(${icon}) center/cover no-repeat`}
						});
					}
				}
				if (this.settings.general.showCountBadge) {
					let mask = BDFDB.ReactUtils.findChild(e.returnvalue, {name: "BlobMask"});
					if (mask) {
						mask.props.upperLeftBadgeWidth = BDFDB.LibraryComponents.Badges.getBadgeWidthForValue(e.instance.props.guildIds.length);
						mask.props.upperLeftBadge = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.NumberBadge, {
							count: e.instance.props.guildIds.length,
							style: {backgroundColor: "var(--bdfdb-blurple)"}
						});
					}
				}
				if (this.settings.general.extraColumn) {
					e.returnvalue.props.children[0] = null;
					e.returnvalue.props.children[2] = BDFDB.ReactUtils.createElement("div", {
						children: e.returnvalue.props.children[2],
						style: {display: "none"}
					});
				}
			}

			processGuild (e) {
				let folder = BDFDB.GuildUtils.getFolder(e.instance.props.guild.id);
				if (folder) {
					let state = this.getState(e.instance);
					if (guildStates[e.instance.props.guild.id] && !BDFDB.equals(state, guildStates[e.instance.props.guild.id])) {
						BDFDB.ReactUtils.forceUpdate(folderGuildContent);
					}
					guildStates[e.instance.props.guild.id] = state;
					if (e.returnvalue) {
						let data = this.getFolderConfig(folder.folderId);
						let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["GuildTooltip", "BDFDB_TooltipContainer"]});
						if (index > -1) children[index] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
							tooltipConfig: Object.assign({
								type: "right",
								list: true,
								guild: e.instance.props.guild,
								offset: 12
							}, data.copyTooltipColor && {
								backgroundColor: data.color3,
								fontColor: data.color4,
							}),
							children: children[index].props.children
						});
					}
				}
				if (e.node) BDFDB.ListenerUtils.add(this, e.node, "click", _ => {BDFDB.TimeUtils.timeout(_ => {
					let folder = BDFDB.GuildUtils.getFolder(e.instance.props.guild.id);
					if (this.settings.general.closeAllFolders) for (let openFolderId of BDFDB.LibraryModules.FolderUtils.getExpandedFolders()) if (!folder || openFolderId != folder.folderId || !this.settings.general.forceOpenFolder) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(openFolderId);
					else if (folder && this.settings.general.closeTheFolder && !this.settings.general.forceOpenFolder && BDFDB.LibraryModules.FolderUtils.isFolderExpanded(folder.folderId)) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(folder.folderId);
				})});
			}
			
			processGuildFolderSettingsModal (e) {
				if (e.node) {
					let root = e.node.parentElement.querySelector(BDFDB.dotCN.layermodal);
					BDFDB.DOMUtils.addClass(root, BDFDB.disCN.layermodalmedium, BDFDB.disCN.modalwrapper, `${this.name}-modal`);
					BDFDB.DOMUtils.removeClass(root, BDFDB.disCN.layermodalsmall);
				}
				if (e.returnvalue) {
					let folder = BDFDB.LibraryModules.FolderStore.getGuildFolderById(e.instance.props.folderId);
					let data = this.getFolderConfig(e.instance.props.folderId);
					let newData = Object.assign({}, data, {folderName: folder.folderName});
					
					let tabs = {};
					
					let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["ModalHeader", "Header"]});
					if (index > -1) {
						children[index].props.className = BDFDB.DOMUtils.formatClassName(children[index].props.className, BDFDB.disCN.modalheaderhassibling),
						children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
							grow: 0,
							shrink: 0,
							children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
								className: BDFDB.disCN.tabbarcontainer,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TabBar, {
									className: BDFDB.disCN.tabbar,
									itemClassName: BDFDB.disCN.tabbaritem,
									type: BDFDB.LibraryComponents.TabBar.Types.TOP,
									items: [
										{value: this.labels.modal_tabheader1},
										{value: this.labels.modal_tabheader2},
										{value: this.labels.modal_tabheader3},
										{value: this.labels.modal_tabheader4}
									],
									onItemSelect: (value, instance) => {
										let tabsArray = BDFDB.ObjectUtils.toArray(tabs);
										for (let ins of tabsArray) {
											if (ins.props.tab == value) ins.props.open = true;
											else delete ins.props.open;
										}
										BDFDB.ReactUtils.forceUpdate(tabsArray);
									}
								})
							})
						}));
					}
					[children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["ModalContent", "Content"]});
					if (index > -1) children[index].props.children = [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader1,
							open: true,
							ref: instance => {if (instance) tabs[this.labels.modal_tabheader1] = instance;},
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: BDFDB.LanguageUtils.LanguageStrings.GUILD_FOLDER_NAME,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
										value: folder.folderName,
										placeholder: folder.folderName || BDFDB.LanguageUtils.LanguageStrings.SERVER_FOLDER_PLACEHOLDER,
										autoFocus: true,
										onChange: value => {newData.folderName = value;}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_iconpicker,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(FolderIconPickerComponent, {
										selectedIcon: data.iconID,
										onSelect: value => {newData.iconID = value;}
									}, true)
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									margin: 20,
									label: this.labels.modal_usecloseicon,
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
									value: data.useCloseIcon,
									onChange: value => {newData.useCloseIcon = value;}
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader2,
							ref: instance => {if (instance) tabs[this.labels.modal_tabheader2] = instance;},
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker1,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color1,
										defaultFallback: !data.color1 && !data.swapColors,
										onColorChange: value => {newData.color1 = value;}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker2,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color2,
										defaultFallback: !data.color2 && data.swapColors,
										onColorChange: value => {newData.color2 = value;}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									margin: 20,
									label: this.labels.modal_swapcolor,
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
									value: data.swapColors,
									onChange: value => {newData.swapColors = value;}
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader3,
							ref: instance => {if (instance) tabs[this.labels.modal_tabheader3] = instance;},
							children: [
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker3,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color3,
										onColorChange: value => {newData.color3 = value;}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
									title: this.labels.modal_colorpicker4,
									className: BDFDB.disCN.marginbottom20,
									children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
										color: data.color4,
										onColorChange: value => {newData.color4 = value;}
									})
								}),
								BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
									type: "Switch",
									margin: 20,
									label: this.labels.modal_copytooltipcolor,
									tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
									value: data.copyTooltipColor,
									onChange: value => {newData.copyTooltipColor = value;}
								})
							]
						}),
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
							tab: this.labels.modal_tabheader4,
							ref: instance => {if (instance) tabs[this.labels.modal_tabheader4] = instance;},
							children: BDFDB.ReactUtils.createElement(FolderIconCustomPreviewComponent, {}, true)
						})
					];
					[children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["ModalFooter", "Footer"]});
					if (index > -1) children[index].props.children = [
						BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
							children: BDFDB.LanguageUtils.LanguageStrings.SAVE,
							onClick: _ => {								
								let folderColor = newData[newData.swapColors ? "color2" : "color1"];
								this.updateFolder({
									folderId: e.instance.props.folderId,
									folderName: newData.folderName,
									folderColor: folderColor ? BDFDB.ColorUtils.convert(folderColor && BDFDB.ObjectUtils.is(folderColor) ? folderColor[Object.keys(folderColor)[0]] : folderColor, "INT") : null
								});
								if (!BDFDB.equals(newData, data)) {
									BDFDB.DataUtils.save(newData, this, "folders", e.instance.props.folderId);
									this.forceUpdateAll();
								}
								e.instance.close();
							}
						})
					]
				}
			}

			loadAllIcons () {
				let icons = {};
				folderIcons.forEach((array, i) => {
					icons[i] = {
						openicon: array.openicon,
						closedicon: array.closedicon,
						customID: null
					};
				});
				for (let id in customIcons) icons[id] = Object.assign({customID: id}, customIcons[id]);
				return icons;
			}

			generateId (prefix) {
				if (prefix == "folder") {
					let id = Math.floor(Math.random() * 4294967296);
					return BDFDB.LibraryModules.FolderStore.guildFolders.every(n => !n.folderId || n.folderId != id) ? id : this.generateId(prefix);
				}
				else {
					let data = BDFDB.DataUtils.load(this, prefix + "s");
					let id = prefix + "_" + Math.round(Math.random()*10000000000000000);
					return data[id] ? this.generateId(prefix) : id;
				}
			}

			getState (instance) {
				let state = {};
				for (let key in instance.props) {
					if (typeof instance.props[key] != "object" && typeof instance.props[key] != "function") state[key] = instance.props[key];
					else if (Array.isArray(instance.props[key])) state[key] = instance.props[key].length;
				}
				return state;
			}
			
			getFolderConfig (folderId) {
				let folder = BDFDB.LibraryModules.FolderStore.getGuildFolderById(folderId) || {};
				let data = folderConfigs[folderId] || {
					iconID: 			"-1",
					muteFolder: 		false,
					autoRead: 			false,
					useCloseIcon: 		true,
					swapColors: 		false,
					copyTooltipColor: 	false,
					color1: 			null,
					color2: 			["255","255","255"],
					color3: 			null,
					color4: 			null
				};
				let nativeColor = data.swapColors ? "color2" : "color1";
				if (!data[nativeColor]) data[nativeColor] = BDFDB.ColorUtils.convert(folder.folderColor, "RGBCOMP");
				else if (folder.folderColor && !BDFDB.ColorUtils.compare(folder.folderColor, BDFDB.ColorUtils.convert(BDFDB.ObjectUtils.is(data[nativeColor]) ? data[nativeColor][Object.keys(data[nativeColor])[0]] : data[nativeColor], "INT"))) {
					data[nativeColor] = BDFDB.ColorUtils.convert(folder.folderColor, "RGBCOMP");
					BDFDB.DataUtils.save(data, this, "folders", folderId);
				}
				folderConfigs[folderId] = data;
				return data;
			}

			createBase64SVG (paths, color1 = "#000000", color2 = "#FFFFFF") {
				if (paths.indexOf("<path ") != 0) return paths;
				let isGradient1 = color1 && BDFDB.ObjectUtils.is(color1);
				let isGradient2 = color2 && BDFDB.ObjectUtils.is(color2);
				let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="-60 -50 1100 1100">`;
				if (isGradient1) {
					color1 = BDFDB.ColorUtils.convert(color1, "RGBA");
					svg += `<linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">`;
					for (let pos of Object.keys(color1).sort()) svg += `<stop offset="${pos * 100}%" style="stop-color: ${color1[pos]};"></stop>`;
					svg += `</linearGradient>`;
				}
				if (isGradient2) {
					color2 = BDFDB.ColorUtils.convert(color2, "RGBA");
					svg += `<linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">`;
					for (let pos of Object.keys(color2).sort()) svg += `<stop offset="${pos * 100}%" style="stop-color: ${color2[pos]};"></stop>`;
					svg += `</linearGradient>`;
				}
				svg += `${paths.replace("REPLACE_FILL1", isGradient1 ? "url(#grad1)" : BDFDB.ColorUtils.convert(color1, "RGBA")).replace("REPLACE_FILL2", isGradient2 ? "url(#grad2)" : BDFDB.ColorUtils.convert(color2, "RGBA"))}</svg>`;
				return `data:image/svg+xml;base64,${btoa(svg)}`;
			}

			openFolderCreationMenu (guilds, initGuildId) {
				let targetedGuildIds = [].concat(initGuildId || []);
				
				BDFDB.ModalUtils.open(this, {
					size: "MEDIUM",
					header: this.labels.serversubmenu_createfolder,
					subHeader: "",
					contentClassName: BDFDB.disCN.listscroller,
					children: guilds.map((guild, i) => {
						return [
							i == 0 ? null : BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormDivider, {
								className: BDFDB.disCNS.margintop4 + BDFDB.disCN.marginbottom4
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ListRow, {
								prefix: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Guild, {
									className: BDFDB.disCN.listavatar,
									guild: guild,
									menu: false,
									tooltip: false
								}),
								label: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextScroller, {
									children: guild.name
								}),
								suffix: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Switch, {
									value: targetedGuildIds.includes(guild.id),
									onChange: value => {
										if (value) targetedGuildIds.push(guild.id);
										else BDFDB.ArrayUtils.remove(targetedGuildIds, guild.id, true);
									}
								})
							})
						];
					}).flat(10).filter(n => n),
					buttons: [{
						contents: BDFDB.LanguageUtils.LanguageStrings.DONE,
						color: "BRAND",
						close: true,
						onClick: (modal, instance) => {
							this.createFolder(BDFDB.ArrayUtils.removeCopies(targetedGuildIds));
						}
					}]
				});
			}
			
			updateFolder (folder) {
				let oldGuildFolders = [].concat(BDFDB.LibraryModules.FolderStore.guildFolders), guildFolders = [], guildPositions = [];
				for (let oldFolder of oldGuildFolders) {
					if (oldFolder.folderId == folder.folderId) guildFolders.push(Object.assign({}, oldFolder, folder));
					else guildFolders.push(oldFolder);
				}
				for (let folder of guildFolders) for (let fGuildId of folder.guildIds) guildPositions.push(fGuildId);
				BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({guildPositions, guildFolders});
			}
			
			createFolder (guildIds) {
				if (!guildIds) return;
				guildIds = [guildIds].flat(10);
				if (!guildIds.length) return;
				let oldGuildFolders = [].concat(BDFDB.LibraryModules.FolderStore.guildFolders), guildFolders = [], guildPositions = [], added = false;
				for (let oldFolder of oldGuildFolders) {
					if (!oldFolder.folderId && guildIds.includes(oldFolder.guildIds[0])) {
						if (!added) {
							added = true;
							guildFolders.push({
								guildIds: guildIds,
								folderId: this.generateId("folder")
							});
						}
					}
					else guildFolders.push(oldFolder);
				}
				for (let folder of guildFolders) for (let fGuildId of folder.guildIds) guildPositions.push(fGuildId);
				BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({guildPositions, guildFolders});
			}
			
			removeFolder (folderId) {
				let oldGuildFolders = [].concat(BDFDB.LibraryModules.FolderStore.guildFolders), guildFolders = [], guildPositions = [];
				for (let oldFolder of oldGuildFolders) {
					if (oldFolder.folderId == folderId) {
						for (let guildId of oldFolder.guildIds) guildFolders.push({guildIds: [guildId]});
					}
					else guildFolders.push(oldFolder);
				}
				for (let folder of guildFolders) for (let fGuildId of folder.guildIds) guildPositions.push(fGuildId);
				BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({guildPositions, guildFolders});
			}
			
			addGuildToFolder (folderId, guildId) {
				let oldGuildFolders = [].concat(BDFDB.LibraryModules.FolderStore.guildFolders), guildFolders = [], guildPositions = [];
				for (let oldFolder of oldGuildFolders) {
					if (oldFolder.folderId) {
						let newFolder = Object.assign({}, oldFolder);
						if (oldFolder.folderId == folderId) newFolder.guildIds.push(guildId);
						else BDFDB.ArrayUtils.remove(newFolder.guildIds, guildId);
						guildFolders.push(newFolder);
					}
					else if (oldFolder.guildIds[0] != guildId) guildFolders.push(oldFolder);
				}
				for (let folder of guildFolders) for (let fGuildId of folder.guildIds) guildPositions.push(fGuildId);
				BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({guildPositions, guildFolders});
			}
			
			removeGuildFromFolder (folderId, guildId) {
				let oldGuildFolders = [].concat(BDFDB.LibraryModules.FolderStore.guildFolders), guildFolders = [], guildPositions = [];
				for (let oldFolder of oldGuildFolders) {
					if (oldFolder.folderId == folderId) {
						let newFolder = Object.assign({}, oldFolder);
						BDFDB.ArrayUtils.remove(newFolder.guildIds, guildId);
						guildFolders.push(newFolder);
						guildFolders.push({guildIds: [guildId]});
					}
					else guildFolders.push(oldFolder);
				}
				for (let folder of guildFolders) for (let fGuildId of folder.guildIds) guildPositions.push(fGuildId);
				BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({guildPositions, guildFolders});
			}

			createDragPreview (div, event) {
				if (!Node.prototype.isPrototypeOf(div)) return;
				let dragPreview = div.cloneNode(true);
				BDFDB.DOMUtils.addClass(dragPreview, BDFDB.disCN._serverfoldersdragpreview);
				BDFDB.DOMUtils.remove(dragPreview.querySelector(BDFDB.dotCNC.guildlowerbadge + BDFDB.dotCNC.guildupperbadge + BDFDB.dotCN.guildpillwrapper));
				BDFDB.DOMUtils.hide(dragPreview);
				dragPreview.style.setProperty("pointer-events", "none", "important");
				dragPreview.style.setProperty("left", event.clientX - 25 + "px", "important");
				dragPreview.style.setProperty("top", event.clientY - 25 + "px", "important");
				document.querySelector(BDFDB.dotCN.appmount).appendChild(dragPreview);
				return dragPreview;
			}

			updateDragPreview (dragPreview, event) {
				if (!Node.prototype.isPrototypeOf(dragPreview)) return;
				BDFDB.DOMUtils.show(dragPreview);
				dragPreview.style.setProperty("left", event.clientX - 25 + "px", "important");
				dragPreview.style.setProperty("top", event.clientY - 25 + "px", "important");
			}

			setLabelsByLanguage () {
				switch (BDFDB.LanguageUtils.getLanguage().id) {
					case "bg":		// Bulgarian
						return {
							foldercontext_autoreadfolder:		"Авто: Маркиране като прочетено",
							foldercontext_mutefolder:			"Без звук папка",
							foldercontext_removefolder:			"Изтриване на папка",
							modal_colorpicker1:					"Основен цвят на папката",
							modal_colorpicker2:					"Вторичен цвят на папката",
							modal_colorpicker3:					"Цвят на подсказка",
							modal_colorpicker4:					"Цвят на шрифта",
							modal_copytooltipcolor:				"Използвайте един и същи цвят за всички сървъри в папка",
							modal_customclosed:					"Затворена икона",
							modal_customopen:					"Отворете иконата",
							modal_custompreview:				"Визуализация на иконата",
							modal_iconpicker:					"Избор на папка",
							modal_swapcolor:					"Използвайте втория цвят за оригиналната папка",
							modal_tabheader1:					"Папка",
							modal_tabheader2:					"Цвят на папката",
							modal_tabheader3:					"Цвят на подсказка",
							modal_tabheader4:					"Собствени символи",
							modal_usecloseicon:					"Използвайте затворена икона вместо минисервъра",
							servercontext_serverfolders:		"Папка на сървъра",
							serversubmenu_addtofolder:			"Добавете сървъра към папката",
							serversubmenu_createfolder:			"Създай папка",
							serversubmenu_removefromfolder:		"Премахнете сървъра от папката"
						};
					case "da":		// Danish
						return {
							foldercontext_autoreadfolder:		"Auto: Marker som læst",
							foldercontext_mutefolder:			"Dæmp mappe",
							foldercontext_removefolder:			"Slet mappe",
							modal_colorpicker1:					"Primær mappefarve",
							modal_colorpicker2:					"Sekundær mappefarve",
							modal_colorpicker3:					"Værktøjstipfarve",
							modal_colorpicker4:					"Skriftfarve",
							modal_copytooltipcolor:				"Brug den samme farve til alle servere i en mappe",
							modal_customclosed:					"Lukket ikon",
							modal_customopen:					"Åbn ikonet",
							modal_custompreview:				"Eksempel på ikon",
							modal_iconpicker:					"Mappevalg",
							modal_swapcolor:					"Brug den anden farve til den originale mappe",
							modal_tabheader1:					"Folder",
							modal_tabheader2:					"Mappefarve",
							modal_tabheader3:					"Værktøjstipfarve",
							modal_tabheader4:					"Egne symboler",
							modal_usecloseicon:					"Brug et lukket ikon i stedet for miniserver",
							servercontext_serverfolders:		"Servermappe",
							serversubmenu_addtofolder:			"Føj serveren til mappen",
							serversubmenu_createfolder:			"Opret mappe",
							serversubmenu_removefromfolder:		"Fjern serveren fra mappen"
						};
					case "de":		// German
						return {
							foldercontext_autoreadfolder:		"Auto: Als gelesen markieren",
							foldercontext_mutefolder:			"Ordner stummschalten",
							foldercontext_removefolder:			"Ordner löschen",
							modal_colorpicker1:					"Primäre Ordnerfarbe",
							modal_colorpicker2:					"Sekundäre Ordnerfarbe",
							modal_colorpicker3:					"Tooltipfarbe",
							modal_colorpicker4:					"Schriftfarbe",
							modal_copytooltipcolor:				"Dieselbe Farbe für alle Server eines Ordners verwenden",
							modal_customclosed:					"Geschlossenes Icon",
							modal_customopen:					"Geöffnetes Icon",
							modal_custompreview:				"Symbolvorschau",
							modal_iconpicker:					"Ordnerauswahl",
							modal_swapcolor:					"Die zweite Farbe für den ursprünglichen Ordner verwenden",
							modal_tabheader1:					"Ordner",
							modal_tabheader2:					"Ordnerfarbe",
							modal_tabheader3:					"Tooltipfarbe",
							modal_tabheader4:					"Eigene Symbole",
							modal_usecloseicon:					"Anstelle der Miniserver ein geschlossenes Symbol verwenden",
							servercontext_serverfolders:		"Serverordner",
							serversubmenu_addtofolder:			"Server zum Ordner hinzufügen",
							serversubmenu_createfolder:			"Ordner erzeugen",
							serversubmenu_removefromfolder:		"Server aus Ordner entfernen"
						};
					case "el":		// Greek
						return {
							foldercontext_autoreadfolder:		"Αυτόματο: Επισήμανση ως αναγνωσμένου",
							foldercontext_mutefolder:			"Σίγαση φακέλου",
							foldercontext_removefolder:			"Διαγραφή φακέλου",
							modal_colorpicker1:					"Κύριο χρώμα φακέλου",
							modal_colorpicker2:					"Χρώμα δευτερεύοντος φακέλου",
							modal_colorpicker3:					"Χρώμα επεξήγησης εργαλείου",
							modal_colorpicker4:					"Χρώμα γραμματοσειράς",
							modal_copytooltipcolor:				"Χρησιμοποιήστε το ίδιο χρώμα για όλους τους διακομιστές σε ένα φάκελο",
							modal_customclosed:					"Κλειστό εικονίδιο",
							modal_customopen:					"Άνοιγμα εικονιδίου",
							modal_custompreview:				"Προεπισκόπηση εικονιδίου",
							modal_iconpicker:					"Επιλογή φακέλου",
							modal_swapcolor:					"Χρησιμοποιήστε το δεύτερο χρώμα για τον αρχικό φάκελο",
							modal_tabheader1:					"Ντοσιέ",
							modal_tabheader2:					"Χρώμα φακέλου",
							modal_tabheader3:					"Χρώμα επεξήγησης εργαλείου",
							modal_tabheader4:					"Ίδια σύμβολα",
							modal_usecloseicon:					"Χρησιμοποιήστε ένα κλειστό εικονίδιο αντί για το miniserver",
							servercontext_serverfolders:		"Φάκελος διακομιστή",
							serversubmenu_addtofolder:			"Προσθέστε το διακομιστή στο φάκελο",
							serversubmenu_createfolder:			"ΔΗΜΙΟΥΡΓΩ φακελο",
							serversubmenu_removefromfolder:		"Κατάργηση διακομιστή από φάκελο"
						};
					case "es":		// Spanish
						return {
							foldercontext_autoreadfolder:		"Automático: marcar como leído",
							foldercontext_mutefolder:			"Silenciar carpeta",
							foldercontext_removefolder:			"Eliminar carpeta",
							modal_colorpicker1:					"Color de carpeta principal",
							modal_colorpicker2:					"Color de carpeta secundaria",
							modal_colorpicker3:					"Color de la información sobre herramientas",
							modal_colorpicker4:					"Color de fuente",
							modal_copytooltipcolor:				"Use el mismo color para todos los servidores de una carpeta",
							modal_customclosed:					"Icono cerrado",
							modal_customopen:					"Abrir icono",
							modal_custompreview:				"Vista previa del icono",
							modal_iconpicker:					"Selección de carpeta",
							modal_swapcolor:					"Use el segundo color para la carpeta original",
							modal_tabheader1:					"Carpeta",
							modal_tabheader2:					"Color de la carpeta",
							modal_tabheader3:					"Color de la información sobre herramientas",
							modal_tabheader4:					"Símbolos propios",
							modal_usecloseicon:					"Use un icono cerrado en lugar del miniserver",
							servercontext_serverfolders:		"Carpeta del servidor",
							serversubmenu_addtofolder:			"Agrega el servidor a la carpeta",
							serversubmenu_createfolder:			"Crear carpeta",
							serversubmenu_removefromfolder:		"Quitar servidor de carpeta"
						};
					case "fi":		// Finnish
						return {
							foldercontext_autoreadfolder:		"Automaattinen: Merkitse luetuksi",
							foldercontext_mutefolder:			"Mykistä kansio",
							foldercontext_removefolder:			"Poista kansio",
							modal_colorpicker1:					"Ensisijaisen kansion väri",
							modal_colorpicker2:					"Toissijaisen kansion väri",
							modal_colorpicker3:					"Työkaluvinkin väri",
							modal_colorpicker4:					"Fontin väri",
							modal_copytooltipcolor:				"Käytä samaa väriä kaikille kansion palvelimille",
							modal_customclosed:					"Suljettu kuvake",
							modal_customopen:					"Avaa kuvake",
							modal_custompreview:				"Kuvakkeen esikatselu",
							modal_iconpicker:					"Kansion valinta",
							modal_swapcolor:					"Käytä alkuperäisen kansion toista väriä",
							modal_tabheader1:					"Kansio",
							modal_tabheader2:					"Kansion väri",
							modal_tabheader3:					"Työkaluvinkin väri",
							modal_tabheader4:					"Omat symbolit",
							modal_usecloseicon:					"Käytä suljetun kuvaketta minipalvelimen sijaan",
							servercontext_serverfolders:		"Palvelinkansio",
							serversubmenu_addtofolder:			"Lisää palvelin kansioon",
							serversubmenu_createfolder:			"Luo kansio",
							serversubmenu_removefromfolder:		"Poista palvelin kansiosta"
						};
					case "fr":		// French
						return {
							foldercontext_autoreadfolder:		"Auto: marquer comme lu",
							foldercontext_mutefolder:			"Dossier muet",
							foldercontext_removefolder:			"Supprimer le dossier",
							modal_colorpicker1:					"Couleur du dossier primaire",
							modal_colorpicker2:					"Couleur du dossier secondaire",
							modal_colorpicker3:					"Couleur de l'info-bulle",
							modal_colorpicker4:					"Couleur de la police",
							modal_copytooltipcolor:				"Utilisez la même couleur pour tous les serveurs d'un dossier",
							modal_customclosed:					"Icône fermée",
							modal_customopen:					"Icône ouverte",
							modal_custompreview:				"Aperçu de l'icône",
							modal_iconpicker:					"Sélection de dossier",
							modal_swapcolor:					"Utilisez la deuxième couleur pour le dossier d'origine",
							modal_tabheader1:					"Dossier",
							modal_tabheader2:					"Couleur du dossier",
							modal_tabheader3:					"Couleur de l'info-bulle",
							modal_tabheader4:					"Propres symboles",
							modal_usecloseicon:					"Utilisez une icône fermée au lieu du miniserver",
							servercontext_serverfolders:		"Dossier du serveur",
							serversubmenu_addtofolder:			"Ajouter le serveur au dossier",
							serversubmenu_createfolder:			"Créer le dossier",
							serversubmenu_removefromfolder:		"Supprimer le serveur du dossier"
						};
					case "hr":		// Croatian
						return {
							foldercontext_autoreadfolder:		"Automatski: Označi kao pročitano",
							foldercontext_mutefolder:			"Isključi mapu",
							foldercontext_removefolder:			"Izbriši mapu",
							modal_colorpicker1:					"Boja primarne mape",
							modal_colorpicker2:					"Boja sekundarne mape",
							modal_colorpicker3:					"Boja opisa",
							modal_colorpicker4:					"Boja fonta",
							modal_copytooltipcolor:				"Koristite istu boju za sve poslužitelje u mapi",
							modal_customclosed:					"Zatvorena ikona",
							modal_customopen:					"Otvori ikonu",
							modal_custompreview:				"Pregled ikone",
							modal_iconpicker:					"Odabir mape",
							modal_swapcolor:					"Upotrijebite drugu boju za izvornu mapu",
							modal_tabheader1:					"Mapu",
							modal_tabheader2:					"Boja mape",
							modal_tabheader3:					"Boja opisa",
							modal_tabheader4:					"Vlastiti simboli",
							modal_usecloseicon:					"Upotrijebite zatvorenu ikonu umjesto miniservera",
							servercontext_serverfolders:		"Mapa poslužitelja",
							serversubmenu_addtofolder:			"Dodajte poslužitelj u mapu",
							serversubmenu_createfolder:			"Stvori mapu",
							serversubmenu_removefromfolder:		"Uklonite poslužitelj iz mape"
						};
					case "hu":		// Hungarian
						return {
							foldercontext_autoreadfolder:		"Automatikus: Megjelölés olvasottként",
							foldercontext_mutefolder:			"Mappa némítása",
							foldercontext_removefolder:			"Mappa törlése",
							modal_colorpicker1:					"Elsődleges mappa színe",
							modal_colorpicker2:					"Másodlagos mappa színe",
							modal_colorpicker3:					"Eszköztár színe",
							modal_colorpicker4:					"Betű szín",
							modal_copytooltipcolor:				"Használja ugyanazt a színt egy mappa összes kiszolgálójához",
							modal_customclosed:					"Zárt ikonra",
							modal_customopen:					"Megnyitás ikonra",
							modal_custompreview:				"Ikon előnézet",
							modal_iconpicker:					"Mappa kiválasztása",
							modal_swapcolor:					"Használja az eredeti mappa második színét",
							modal_tabheader1:					"Mappába",
							modal_tabheader2:					"Mappa színe",
							modal_tabheader3:					"Eszköztár színe",
							modal_tabheader4:					"Saját szimbólumok",
							modal_usecloseicon:					"Használjon zárt ikont a miniszerver helyett",
							servercontext_serverfolders:		"Szerver mappa",
							serversubmenu_addtofolder:			"Adja hozzá a szervert a mappához",
							serversubmenu_createfolder:			"Mappa létrehozás",
							serversubmenu_removefromfolder:		"Távolítsa el a szervert a mappából"
						};
					case "it":		// Italian
						return {
							foldercontext_autoreadfolder:		"Auto: contrassegna come letto",
							foldercontext_mutefolder:			"Disattiva cartella",
							foldercontext_removefolder:			"Elimina cartella",
							modal_colorpicker1:					"Colore cartella principale",
							modal_colorpicker2:					"Colore cartella secondaria",
							modal_colorpicker3:					"Colore della descrizione comando",
							modal_colorpicker4:					"Colore del carattere",
							modal_copytooltipcolor:				"Usa lo stesso colore per tutti i server in una cartella",
							modal_customclosed:					"Icona chiusa",
							modal_customopen:					"Icona Apri",
							modal_custompreview:				"Anteprima icona",
							modal_iconpicker:					"Selezione della cartella",
							modal_swapcolor:					"Usa il secondo colore per la cartella originale",
							modal_tabheader1:					"Cartella",
							modal_tabheader2:					"Colore cartella",
							modal_tabheader3:					"Colore della descrizione comando",
							modal_tabheader4:					"Simboli propri",
							modal_usecloseicon:					"Utilizza un'icona chiusa al posto del miniserver",
							servercontext_serverfolders:		"Cartella del server",
							serversubmenu_addtofolder:			"Aggiungi il server alla cartella",
							serversubmenu_createfolder:			"Creare una cartella",
							serversubmenu_removefromfolder:		"Rimuovi il server dalla cartella"
						};
					case "ja":		// Japanese
						return {
							foldercontext_autoreadfolder:		"自動：既読としてマーク",
							foldercontext_mutefolder:			"ミュートフォルダ",
							foldercontext_removefolder:			"フォルダを削除",
							modal_colorpicker1:					"プライマリフォルダの色",
							modal_colorpicker2:					"セカンダリフォルダの色",
							modal_colorpicker3:					"ツールチップの色",
							modal_colorpicker4:					"フォントの色",
							modal_copytooltipcolor:				"フォルダ内のすべてのサーバーに同じ色を使用する",
							modal_customclosed:					"閉じたアイコン",
							modal_customopen:					"アイコンを開く",
							modal_custompreview:				"アイコンプレビュー",
							modal_iconpicker:					"フォルダの選択",
							modal_swapcolor:					"元のフォルダに2番目の色を使用します",
							modal_tabheader1:					"フォルダ",
							modal_tabheader2:					"フォルダーの色",
							modal_tabheader3:					"ツールチップの色",
							modal_tabheader4:					"独自のシンボル",
							modal_usecloseicon:					"ミニサーバーの代わりに閉じたアイコンを使用する",
							servercontext_serverfolders:		"サーバーフォルダ",
							serversubmenu_addtofolder:			"サーバーをフォルダーに追加します",
							serversubmenu_createfolder:			"フォルダーを作る",
							serversubmenu_removefromfolder:		"フォルダからサーバーを削除します"
						};
					case "ko":		// Korean
						return {
							foldercontext_autoreadfolder:		"자동 : 읽은 상태로 표시",
							foldercontext_mutefolder:			"폴더 음소거",
							foldercontext_removefolder:			"폴더 삭제",
							modal_colorpicker1:					"기본 폴더 색상",
							modal_colorpicker2:					"보조 폴더 색상",
							modal_colorpicker3:					"툴팁 색상",
							modal_colorpicker4:					"글자 색",
							modal_copytooltipcolor:				"폴더의 모든 서버에 동일한 색상 사용",
							modal_customclosed:					"닫힌 아이콘",
							modal_customopen:					"열기 아이콘",
							modal_custompreview:				"아이콘 미리보기",
							modal_iconpicker:					"폴더 선택",
							modal_swapcolor:					"원본 폴더에 두 번째 색상 사용",
							modal_tabheader1:					"폴더",
							modal_tabheader2:					"폴더 색상",
							modal_tabheader3:					"툴팁 색상",
							modal_tabheader4:					"자신의 기호",
							modal_usecloseicon:					"미니 서버 대신 닫힌 아이콘 사용",
							servercontext_serverfolders:		"서버 폴더",
							serversubmenu_addtofolder:			"폴더에 서버 추가",
							serversubmenu_createfolder:			"폴더 생성",
							serversubmenu_removefromfolder:		"폴더에서 서버 제거"
						};
					case "lt":		// Lithuanian
						return {
							foldercontext_autoreadfolder:		"Automatinis: pažymėti kaip perskaitytą",
							foldercontext_mutefolder:			"Nutildyti aplanką",
							foldercontext_removefolder:			"Ištrinti aplanką",
							modal_colorpicker1:					"Pagrindinio aplanko spalva",
							modal_colorpicker2:					"Antrinio aplanko spalva",
							modal_colorpicker3:					"Patarimo spalva",
							modal_colorpicker4:					"Šrifto spalva",
							modal_copytooltipcolor:				"Naudokite tą pačią spalvą visiems aplanko serveriams",
							modal_customclosed:					"Uždaryta piktograma",
							modal_customopen:					"Atidaryti piktogramą",
							modal_custompreview:				"Piktogramos peržiūra",
							modal_iconpicker:					"Aplanko pasirinkimas",
							modal_swapcolor:					"Originalo aplankui naudokite antrą spalvą",
							modal_tabheader1:					"Aplanką",
							modal_tabheader2:					"Aplanko spalva",
							modal_tabheader3:					"Patarimo spalva",
							modal_tabheader4:					"Savo simbolius",
							modal_usecloseicon:					"Vietoj miniserverio naudokite uždarą piktogramą",
							servercontext_serverfolders:		"Serverio aplankas",
							serversubmenu_addtofolder:			"Pridėkite serverį prie aplanko",
							serversubmenu_createfolder:			"Sukurti aplanką",
							serversubmenu_removefromfolder:		"Pašalinti serverį iš aplanko"
						};
					case "nl":		// Dutch
						return {
							foldercontext_autoreadfolder:		"Auto: Markeer als gelezen",
							foldercontext_mutefolder:			"Mute map",
							foldercontext_removefolder:			"Verwijder map",
							modal_colorpicker1:					"Kleur primaire map",
							modal_colorpicker2:					"Kleur secundaire map",
							modal_colorpicker3:					"Tooltipkleur",
							modal_colorpicker4:					"Letterkleur",
							modal_copytooltipcolor:				"Gebruik dezelfde kleur voor alle servers in een map",
							modal_customclosed:					"Gesloten pictogram",
							modal_customopen:					"Open icoon",
							modal_custompreview:				"Pictogramvoorbeeld",
							modal_iconpicker:					"Map selecteren",
							modal_swapcolor:					"Gebruik de tweede kleur voor de originele map",
							modal_tabheader1:					"Map",
							modal_tabheader2:					"Mapkleur",
							modal_tabheader3:					"Tooltipkleur",
							modal_tabheader4:					"Eigen symbolen",
							modal_usecloseicon:					"Gebruik een gesloten pictogram in plaats van de miniserver",
							servercontext_serverfolders:		"Servermap",
							serversubmenu_addtofolder:			"Voeg de server toe aan de map",
							serversubmenu_createfolder:			"Map aanmaken",
							serversubmenu_removefromfolder:		"Verwijder de server uit de map"
						};
					case "no":		// Norwegian
						return {
							foldercontext_autoreadfolder:		"Auto: Merk som lest",
							foldercontext_mutefolder:			"Demp mappe",
							foldercontext_removefolder:			"Slett mappe",
							modal_colorpicker1:					"Primær mappefarge",
							modal_colorpicker2:					"Sekundær mappefarge",
							modal_colorpicker3:					"Verktøytipsfarge",
							modal_colorpicker4:					"Skriftfarge",
							modal_copytooltipcolor:				"Bruk samme farge for alle servere i en mappe",
							modal_customclosed:					"Lukket ikon",
							modal_customopen:					"Åpne ikonet",
							modal_custompreview:				"Forhåndsvisning av ikon",
							modal_iconpicker:					"Mappevalg",
							modal_swapcolor:					"Bruk den andre fargen for den originale mappen",
							modal_tabheader1:					"Mappe",
							modal_tabheader2:					"Mappefarge",
							modal_tabheader3:					"Verktøytipsfarge",
							modal_tabheader4:					"Egne symboler",
							modal_usecloseicon:					"Bruk et lukket ikon i stedet for miniserver",
							servercontext_serverfolders:		"Servermappe",
							serversubmenu_addtofolder:			"Legg til serveren i mappen",
							serversubmenu_createfolder:			"Lag mappe",
							serversubmenu_removefromfolder:		"Fjern serveren fra mappen"
						};
					case "pl":		// Polish
						return {
							foldercontext_autoreadfolder:		"Auto: oznacz jako przeczytane",
							foldercontext_mutefolder:			"Wycisz folder",
							foldercontext_removefolder:			"Usunięty folder",
							modal_colorpicker1:					"Główny kolor folderu",
							modal_colorpicker2:					"Kolor folderu dodatkowego",
							modal_colorpicker3:					"Kolor podpowiedzi",
							modal_colorpicker4:					"Kolor czcionki",
							modal_copytooltipcolor:				"Użyj tego samego koloru dla wszystkich serwerów w folderze",
							modal_customclosed:					"Ikona zamknięta",
							modal_customopen:					"Otwórz ikonę",
							modal_custompreview:				"Podgląd ikon",
							modal_iconpicker:					"Wybór folderu",
							modal_swapcolor:					"Użyj drugiego koloru dla oryginalnego folderu",
							modal_tabheader1:					"Teczka",
							modal_tabheader2:					"Kolor folderu",
							modal_tabheader3:					"Kolor podpowiedzi",
							modal_tabheader4:					"Własne symbole",
							modal_usecloseicon:					"Użyj zamkniętej ikony zamiast miniserwera",
							servercontext_serverfolders:		"Folder serwera",
							serversubmenu_addtofolder:			"Dodaj serwer do folderu",
							serversubmenu_createfolder:			"Utwórz folder",
							serversubmenu_removefromfolder:		"Usuń serwer z folderu"
						};
					case "pt-BR":	// Portuguese (Brazil)
						return {
							foldercontext_autoreadfolder:		"Auto: Marcar como lido",
							foldercontext_mutefolder:			"Pasta sem som",
							foldercontext_removefolder:			"Excluir pasta",
							modal_colorpicker1:					"Cor da pasta primária",
							modal_colorpicker2:					"Cor secundária da pasta",
							modal_colorpicker3:					"Cor da dica de ferramenta",
							modal_colorpicker4:					"Cor da fonte",
							modal_copytooltipcolor:				"Use a mesma cor para todos os servidores em uma pasta",
							modal_customclosed:					"Ícone fechado",
							modal_customopen:					"Ícone aberto",
							modal_custompreview:				"Antevisão do ícone",
							modal_iconpicker:					"Seleção de pasta",
							modal_swapcolor:					"Use a segunda cor para a pasta original",
							modal_tabheader1:					"Pasta",
							modal_tabheader2:					"Cor da pasta",
							modal_tabheader3:					"Cor da dica de ferramenta",
							modal_tabheader4:					"Símbolos próprios",
							modal_usecloseicon:					"Use um ícone fechado em vez do miniserver",
							servercontext_serverfolders:		"Pasta do servidor",
							serversubmenu_addtofolder:			"Adicione o servidor à pasta",
							serversubmenu_createfolder:			"Criar pasta",
							serversubmenu_removefromfolder:		"Remover servidor da pasta"
						};
					case "ro":		// Romanian
						return {
							foldercontext_autoreadfolder:		"Automat: marcați ca citit",
							foldercontext_mutefolder:			"Dezactivați folderul",
							foldercontext_removefolder:			"Ștergeți folderul",
							modal_colorpicker1:					"Culoarea folderului principal",
							modal_colorpicker2:					"Culoare dosar secundar",
							modal_colorpicker3:					"Culoarea sfatului de instrumente",
							modal_colorpicker4:					"Culoarea fontului",
							modal_copytooltipcolor:				"Utilizați aceeași culoare pentru toate serverele dintr-un folder",
							modal_customclosed:					"Pictogramă închisă",
							modal_customopen:					"Pictogramă Deschidere",
							modal_custompreview:				"Previzualizare pictogramă",
							modal_iconpicker:					"Selectarea dosarelor",
							modal_swapcolor:					"Utilizați a doua culoare pentru folderul original",
							modal_tabheader1:					"Pliant",
							modal_tabheader2:					"Culoare dosar",
							modal_tabheader3:					"Culoarea sfatului de instrumente",
							modal_tabheader4:					"Simboluri proprii",
							modal_usecloseicon:					"Folosiți o pictogramă închisă în locul miniserverului",
							servercontext_serverfolders:		"Dosar server",
							serversubmenu_addtofolder:			"Adăugați serverul în dosar",
							serversubmenu_createfolder:			"Creeaza dosar",
							serversubmenu_removefromfolder:		"Eliminați serverul din dosar"
						};
					case "ru":		// Russian
						return {
							foldercontext_autoreadfolder:		"Авто: Отметить как прочитанное",
							foldercontext_mutefolder:			"Отключить папку",
							foldercontext_removefolder:			"Удалить папку",
							modal_colorpicker1:					"Цвет основной папки",
							modal_colorpicker2:					"Цвет вторичной папки",
							modal_colorpicker3:					"Цвет всплывающей подсказки",
							modal_colorpicker4:					"Цвет шрифта",
							modal_copytooltipcolor:				"Используйте один цвет для всех серверов в папке",
							modal_customclosed:					"Закрытый значок",
							modal_customopen:					"Открыть значок",
							modal_custompreview:				"Предварительный просмотр значков",
							modal_iconpicker:					"Выбор папки",
							modal_swapcolor:					"Используйте второй цвет для исходной папки",
							modal_tabheader1:					"Папка",
							modal_tabheader2:					"Цвет папки",
							modal_tabheader3:					"Цвет всплывающей подсказки",
							modal_tabheader4:					"Собственные символы",
							modal_usecloseicon:					"Используйте закрытый значок вместо минисервера",
							servercontext_serverfolders:		"Папка сервера",
							serversubmenu_addtofolder:			"Добавьте сервер в папку",
							serversubmenu_createfolder:			"Создать папку",
							serversubmenu_removefromfolder:		"Удалить сервер из папки"
						};
					case "sv":		// Swedish
						return {
							foldercontext_autoreadfolder:		"Auto: Markera som läst",
							foldercontext_mutefolder:			"Tyst mapp",
							foldercontext_removefolder:			"Ta bort mapp",
							modal_colorpicker1:					"Primär mappfärg",
							modal_colorpicker2:					"Sekundär mappfärg",
							modal_colorpicker3:					"Verktygstipsfärg",
							modal_colorpicker4:					"Fontfärg",
							modal_copytooltipcolor:				"Använd samma färg för alla servrar i en mapp",
							modal_customclosed:					"Stängd ikon",
							modal_customopen:					"Öppna ikonen",
							modal_custompreview:				"Ikonförhandsvisning",
							modal_iconpicker:					"Mappval",
							modal_swapcolor:					"Använd den andra färgen för den ursprungliga mappen",
							modal_tabheader1:					"Mapp",
							modal_tabheader2:					"Mappfärg",
							modal_tabheader3:					"Verktygstipsfärg",
							modal_tabheader4:					"Egna symboler",
							modal_usecloseicon:					"Använd en stängd ikon istället för miniserver",
							servercontext_serverfolders:		"Servermapp",
							serversubmenu_addtofolder:			"Lägg till servern i mappen",
							serversubmenu_createfolder:			"Skapa mapp",
							serversubmenu_removefromfolder:		"Ta bort servern från mappen"
						};
					case "th":		// Thai
						return {
							foldercontext_autoreadfolder:		"อัตโนมัติ: ทำเครื่องหมายว่าอ่านแล้ว",
							foldercontext_mutefolder:			"ปิดเสียงโฟลเดอร์",
							foldercontext_removefolder:			"ลบโฟลเดอร์",
							modal_colorpicker1:					"สีโฟลเดอร์หลัก",
							modal_colorpicker2:					"สีโฟลเดอร์รอง",
							modal_colorpicker3:					"สีคำแนะนำเครื่องมือ",
							modal_colorpicker4:					"สีตัวอักษร",
							modal_copytooltipcolor:				"ใช้สีเดียวกันสำหรับเซิร์ฟเวอร์ทั้งหมดในโฟลเดอร์",
							modal_customclosed:					"ไอคอนปิด",
							modal_customopen:					"เปิดไอคอน",
							modal_custompreview:				"ดูตัวอย่างไอคอน",
							modal_iconpicker:					"การเลือกโฟลเดอร์",
							modal_swapcolor:					"ใช้สีที่สองสำหรับโฟลเดอร์เดิม",
							modal_tabheader1:					"โฟลเดอร์",
							modal_tabheader2:					"สีโฟลเดอร์",
							modal_tabheader3:					"สีคำแนะนำเครื่องมือ",
							modal_tabheader4:					"สัญลักษณ์ของตัวเอง",
							modal_usecloseicon:					"ใช้ไอคอนปิดแทน miniserver",
							servercontext_serverfolders:		"โฟลเดอร์เซิร์ฟเวอร์",
							serversubmenu_addtofolder:			"เพิ่มเซิร์ฟเวอร์ลงในโฟลเดอร์",
							serversubmenu_createfolder:			"สร้างโฟลเดอร์",
							serversubmenu_removefromfolder:		"ลบเซิร์ฟเวอร์ออกจากโฟลเดอร์"
						};
					case "tr":		// Turkish
						return {
							foldercontext_autoreadfolder:		"Otomatik: Okundu olarak işaretle",
							foldercontext_mutefolder:			"Klasörü sessize al",
							foldercontext_removefolder:			"Klasörü sil",
							modal_colorpicker1:					"Birincil klasör rengi",
							modal_colorpicker2:					"İkincil klasör rengi",
							modal_colorpicker3:					"Araç ipucu rengi",
							modal_colorpicker4:					"Yazı rengi",
							modal_copytooltipcolor:				"Bir klasördeki tüm sunucular için aynı rengi kullanın",
							modal_customclosed:					"Kapalı simge",
							modal_customopen:					"Aç simgesi",
							modal_custompreview:				"Simge önizlemesi",
							modal_iconpicker:					"Klasör seçimi",
							modal_swapcolor:					"Orijinal klasör için ikinci rengi kullanın",
							modal_tabheader1:					"Klasör",
							modal_tabheader2:					"Klasör rengi",
							modal_tabheader3:					"Araç ipucu rengi",
							modal_tabheader4:					"Kendi sembolleri",
							modal_usecloseicon:					"Miniserver yerine kapalı bir simge kullanın",
							servercontext_serverfolders:		"Sunucu klasörü",
							serversubmenu_addtofolder:			"Sunucuyu klasöre ekleyin",
							serversubmenu_createfolder:			"Klasör oluşturun",
							serversubmenu_removefromfolder:		"Sunucuyu klasörden kaldır"
						};
					case "uk":		// Ukrainian
						return {
							foldercontext_autoreadfolder:		"Авто: Позначити як прочитане",
							foldercontext_mutefolder:			"Вимкнути папку",
							foldercontext_removefolder:			"Видалити папку",
							modal_colorpicker1:					"Основний колір папки",
							modal_colorpicker2:					"Колір вторинної папки",
							modal_colorpicker3:					"Колір підказки",
							modal_colorpicker4:					"Колір шрифту",
							modal_copytooltipcolor:				"Використовуйте однаковий колір для всіх серверів у папці",
							modal_customclosed:					"Закритий значок",
							modal_customopen:					"Відкрити значок",
							modal_custompreview:				"Попередній перегляд піктограми",
							modal_iconpicker:					"Вибір папки",
							modal_swapcolor:					"Використовуйте другий колір для вихідної папки",
							modal_tabheader1:					"Папку",
							modal_tabheader2:					"Колір папки",
							modal_tabheader3:					"Колір підказки",
							modal_tabheader4:					"Власні символи",
							modal_usecloseicon:					"Використовуйте закритий значок замість мінісервера",
							servercontext_serverfolders:		"Папка сервера",
							serversubmenu_addtofolder:			"Додайте сервер до папки",
							serversubmenu_createfolder:			"Створити папку",
							serversubmenu_removefromfolder:		"Видалити сервер з папки"
						};
					case "vi":		// Vietnamese
						return {
							foldercontext_autoreadfolder:		"Tự động: Đánh dấu là đã đọc",
							foldercontext_mutefolder:			"Thư mục ẩn",
							foldercontext_removefolder:			"Xóa thư mục",
							modal_colorpicker1:					"Màu thư mục chính",
							modal_colorpicker2:					"Màu thư mục phụ",
							modal_colorpicker3:					"Màu chú giải công cụ",
							modal_colorpicker4:					"Màu phông chữ",
							modal_copytooltipcolor:				"Sử dụng cùng một màu cho tất cả các máy chủ trong một thư mục",
							modal_customclosed:					"Biểu tượng đã đóng",
							modal_customopen:					"Mở biểu tượng",
							modal_custompreview:				"Xem trước biểu tượng",
							modal_iconpicker:					"Lựa chọn thư mục",
							modal_swapcolor:					"Sử dụng màu thứ hai cho thư mục gốc",
							modal_tabheader1:					"Thư mục",
							modal_tabheader2:					"Màu thư mục",
							modal_tabheader3:					"Màu chú giải công cụ",
							modal_tabheader4:					"Ký hiệu riêng",
							modal_usecloseicon:					"Sử dụng biểu tượng đã đóng thay vì trình thu nhỏ",
							servercontext_serverfolders:		"Thư mục máy chủ",
							serversubmenu_addtofolder:			"Thêm máy chủ vào thư mục",
							serversubmenu_createfolder:			"Tạo thư mục",
							serversubmenu_removefromfolder:		"Xóa máy chủ khỏi thư mục"
						};
					case "zh-CN":	// Chinese (China)
						return {
							foldercontext_autoreadfolder:		"自动：标记为已读",
							foldercontext_mutefolder:			"静音文件夹",
							foldercontext_removefolder:			"删除文件夹",
							modal_colorpicker1:					"文件夹主色",
							modal_colorpicker2:					"文件夹辅色",
							modal_colorpicker3:					"工具提示颜色",
							modal_colorpicker4:					"字体颜色",
							modal_copytooltipcolor:				"对文件夹中的所有服务器使用相同颜色",
							modal_customclosed:					"文件夹收起图标",
							modal_customopen:					"文件夹展开图标",
							modal_custompreview:				"图标预览",
							modal_iconpicker:					"文件夹选择",
							modal_swapcolor:					"将文件夹副色应用于原始文件夹",
							modal_tabheader1:					"文件夹",
							modal_tabheader2:					"文件夹颜色",
							modal_tabheader3:					"工具提示颜色",
							modal_tabheader4:					"自定义图标",
							modal_usecloseicon:					"使用文件夹收起图标代替服务器缩略图",
							servercontext_serverfolders:		"服务器文件夹",
							serversubmenu_addtofolder:			"将服务器添加到文件夹",
							serversubmenu_createfolder:			"创建文件夹",
							serversubmenu_removefromfolder:		"从文件夹中移除服务器"
						};
					case "zh-TW":	// Chinese (Taiwan)
						return {
							foldercontext_autoreadfolder:		"自動：標記為已讀",
							foldercontext_mutefolder:			"靜音資料夾",
							foldercontext_removefolder:			"刪除資料夾",
							modal_colorpicker1:					"資料夾主色",
							modal_colorpicker2:					"資料夾輔色",
							modal_colorpicker3:					"工具提示顏色",
							modal_colorpicker4:					"字體顏色",
							modal_copytooltipcolor:				"對資料夾中的所有伺服器使用相同顏色",
							modal_customclosed:					"資料夾收起圖標",
							modal_customopen:					"資料夾展開圖標",
							modal_custompreview:				"圖標預覽",
							modal_iconpicker:					"資料夾選擇",
							modal_swapcolor:					"將文件夾輔色應用於原始資料夾",
							modal_tabheader1:					"資料夾",
							modal_tabheader2:					"資料夾顏色",
							modal_tabheader3:					"工具提示顏色",
							modal_tabheader4:					"客製化圖標",
							modal_usecloseicon:					"使用資料夾收起圖標代替伺服器縮略圖",
							servercontext_serverfolders:		"伺服器資料夾",
							serversubmenu_addtofolder:			"將伺服器添加到資料夾",
							serversubmenu_createfolder:			"創建資料夾",
							serversubmenu_removefromfolder:		"從資料夾中移除伺服器"
						};
					default:		// English
						return {
							foldercontext_autoreadfolder:		"Auto: Mark As Read",
							foldercontext_mutefolder:			"Mute Folder",
							foldercontext_removefolder:			"Delete Folder",
							modal_colorpicker1:					"Primary Folder Color",
							modal_colorpicker2:					"Secondary Folder Color",
							modal_colorpicker3:					"Tooltip Color",
							modal_colorpicker4:					"Font Color",
							modal_copytooltipcolor:				"Use the same Color for all Servers in a Folder",
							modal_customclosed:					"Closed Icon",
							modal_customopen:					"Open Icon",
							modal_custompreview:				"Icon Preview",
							modal_iconpicker:					"Folder Selection",
							modal_swapcolor:					"Use the second Color for the original Folder",
							modal_tabheader1:					"Folder",
							modal_tabheader2:					"Folder Color",
							modal_tabheader3:					"Tooltip Color",
							modal_tabheader4:					"Custom Icons",
							modal_usecloseicon:					"Use a closed Icon instead of the Mini-Servers",
							servercontext_serverfolders:		"Server Folder",
							serversubmenu_addtofolder:			"Add the Server to the Folder",
							serversubmenu_createfolder:			"Create Folder",
							serversubmenu_removefromfolder:		"Remove Server from Folder"
						};
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();