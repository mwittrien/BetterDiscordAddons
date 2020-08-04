//META{"name":"ServerFolders","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/ServerFolders","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/ServerFolders/ServerFolders.plugin.js"}*//

var ServerFolders = (_ => {
	var _this;
	var folderStates, folderReads, guildStates;
	var folderConfigs = {}, customIcons = {}, settings = {};

	const folderIcons = [
		{openicon:`<path d="M 200,390 H 955 L 795,770 H 200 Z" fill="REPLACE_FILL2"/><path d="M 176.6,811 C 163.9,811 155.1,802.6 155,784.7 V 212.9 C 157.9,190.5 169,179.8 195.9,176 h 246 c 20.3,3.2 34.5,18.7 41,28.6 C 494.9,228.3 492.9,240.4 494,266 l 313.6,1.3 c 17.6,0.4 23.3,3.7 23.3,3.7 8.6,4.2 14.8,10.7 19,19.5 C 856.3,319.5 854,360 854,360 h 108.9 c 4.4,2.4 13.7,1.2 11.8,23.5 L 815.8,789.4 c -2.1,5.2 -12.5,13.6 -18.7,16.1 -6.8,2.7 -18.5,5.5 -23.9,5.5 z M 767,759 897,430 H 360 L 230,759 Z" fill="REPLACE_FILL1"/>`,
		closedicon:`<path d="M 175,320 V 790 H 820 V 320 Z" fill="REPLACE_FILL2"/><path d="M 183,811 c -12.2,-0.6 -17.9,-4.8 -21.5,-8.2 C 159.5,801 154.8,792.6 155,779.7 V 215.6 c 3.3,-14.1 9.3,-21.4 15.1,-26.4 7.4,-6.3 16,-11.6 36.7,-13.2 h 237.3 c 23.3,6 32.2,18.7 38.7,28.6 7.6,11.7 9.4,18.6 10.3,41.4 L 494,266 h 313.4 c 16.9,0.1 23.5,5.1 23.5,5.1 8.6,4.2 14.5,10.9 19,19.5 0,0 3.7,7.5 3.1,19.8 V 777.2 c -1.1,9 -4.1,13.7 -4.1,13.7 -4.2,8.6 -10.7,14.8 -19.5,19 L 823.3,811 Z m 602.8,-55 c 2.8,-1.7 6.9,-4.5 8.9,-7.4 2.4,-3.6 5,-10.8 5.4,-24.7 V 362 c -0.2,-10.9 -4.2,-16.3 -4.2,-16.3 -2,-3 -5.9,-6.8 -8.7,-8.6 0,0 -5.8,-3 -12.7,-3.2 h -548.1 c -7.8,0 -13.9,3.6 -13.9,3.6 -3,2 -7.3,6.7 -8.4,17.3 v 386.4 c 2.8,10.4 7.5,16 13.6,17.7 h 544.9 c 11,-0.2 18.4,-1.9 23.3,-3 z" fill="REPLACE_FILL1"/>`},
		{openicon:`<path d="M 167,200 h 200 l 50,50 H 829.8 L 830,330 H 970 L 825,779 H 167 Z" fill="REPLACE_FILL2"/><path d="M 184,799 c -10.5,0 -22.3,-5.3 -27,-10 -4.7,-4.7 -9,-15.1 -9,-34 V 212 c 0,-13.3 5,-22 11,-28 4.4,-4.4 15.4,-10 30,-10 h 170.3 l 53.3,53 H 820 c 13.1,0 18.2,4.2 25,10 6.4,5.5 7,14.4 7,31 v 52 h 122.3 c 11.6,0 17.1,3.3 17.1,3.3 2.9,2.9 3.3,4.4 3.3,14.2 0,8.4 -0.9,13.5 -3.8,22.4 L 849,799 Z M 933,360 H 335 l -130,398.1 603.2,1.3 z M 289.7,334.6 c 3,-8.2 8,-14.8 17,-14.8 0,0 506.6,0.2 506.3,0.2 0,-39.8 -12.2,-53 -53,-53 L 403.3,266.7 350,213 H 240 c -37.6,0 -53,10.1 -53,53 v 382.7 z" fill="REPLACE_FILL1"/>`,
		closedicon:`<path d="M 173,190 V 771 H 825 V 250 H 420 l -70,-60 z" fill="REPLACE_FILL2"/><path d="M 184.2,799 C 170.3,799 164.3,795.8 157.4,788.9 151.7,783.3 148,774.6 148,754.9 V 211.2 c 0.7,-18.6 6,-21.7 11.9,-27.6 6.8,-6.8 15.5,-9.4 29.3,-9.6 h 170.1 l 53.3,53 h 407.7 c 14.1,0 18.6,2.8 25.3,9.4 6.4,6.4 7.1,13.4 7.1,30.8 v 246.1 247.4 c 0.2,11.8 -1.9,22.1 -7.4,27.6 C 839.7,793.9 831,799 819.4,799 Z M 813,707 V 415 c 0,-36.9 -13.9,-53 -53,-53 H 240 c -38.1,0 -53,11.7 -53,53 v 292 c 0,38.8 11.5,53 53,53 h 520 c 37.8,0 53,-12.1 53,-53 z M 760,267 c 0,0 -228.6,-0.3 -356.7,-0.3 L 350,213 H 240 c -41.6,2.7 -52.2,14.3 -53,53 v 54 h 626 c -0.6,-37.5 -12,-53 -53,-53 z" fill="REPLACE_FILL1"/>`},
		{openicon:`<path d="M 307,330 H 970 L 825,779 H 167 Z" fill="REPLACE_FILL2"/><path d="M 189 174 C 174.4 174 163.4 179.6 159 184 C 153 190 148 198.7 148 212 L 148 755 C 148 773.9 152.3 784.3 157 789 C 161.7 793.7 173.5 799 184 799 L 849 799 L 990.8 359.8 C 993.8 350.9 994.7 345.9 994.7 337.4 C 994.7 327.6 994.3 326.2 991.4 323.3 C 991.4 323.3 985.9 320 974.3 320 L 852 320 L 852 268 C 852 251.4 851.4 242.5 845 237 C 838.2 231.2 833.1 227 820 227 L 412.6 227 L 359.3 174 L 189 174 z M 335 360 L 933 360 L 808.2 759.3 L 205 758.1 L 335 360 z" fill="REPLACE_FILL1"/>`,
		closedicon:`<path d="M 173,345 V 771 H 825 V 345 Z" fill="REPLACE_FILL2"/><path d="M 189.2 174 C 175.4 174.2 166.7 176.8 159.9 183.6 C 154 189.5 148.7 192.7 148 211.2 L 148 754.9 C 148 774.6 151.7 783.3 157.4 788.9 C 164.3 795.8 170.3 799 184.2 799 L 819.4 799 C 831 799 839.7 793.9 845.2 788.4 C 850.8 782.8 852.9 772.5 852.7 760.8 L 852.7 513.3 L 852.7 267.2 C 852.7 249.8 852 242.8 845.6 236.4 C 838.9 229.7 834.4 227 820.3 227 L 412.6 227 L 359.3 174 L 189.2 174 z M 240 362 L 760 362 C 799.1 362 813 378.1 813 415 L 813 707 C 813 747.9 797.8 760 760 760 L 240 760 C 198.5 760 187 745.8 187 707 L 187 415 C 187 373.7 201.9 362 240 362 z" fill="REPLACE_FILL1"/>`},
		{openicon:`<path d="M 167,200 h 200 l 50,50 H 829.8 L 830,330 H 314 L 167,779 Z" fill="REPLACE_FILL2"/><path d="M 189 174 C 174.4 174 163.4 179.6 159 184 C 153 190 148 198.7 148 212 L 148 755 C 148 773.9 152.3 784.3 157 789 C 161.7 793.7 173.5 799 184 799 L 849 799 L 990.8 359.8 C 993.8 350.9 994.7 345.9 994.7 337.4 C 994.7 327.6 994.3 326.2 991.4 323.3 C 991.4 323.3 985.9 320 974.3 320 L 852 320 L 852 268 C 852 251.4 851.4 242.5 845 237 C 838.2 231.2 833.1 227 820 227 L 412.6 227 L 359.3 174 L 189 174 z M 240 213 L 350 213 L 403.3 266.7 L 760 267 C 800.8 267 813 280.2 813 320 C 813.3 320 306.7 319.8 306.7 319.8 C 297.7 319.8 292.7 326.4 289.7 334.6 L 187 648.7 L 187 266 C 187 223.1 202.4 213 240 213 z" fill="REPLACE_FILL1"/>`,
		closedicon:`<path d="M 173,190 V 350 H 825 V 250 H 420 l -70,-60 z" fill="REPLACE_FILL2"/><path d="M 189.2 174 C 175.4 174.2 166.7 176.8 159.9 183.6 C 154 189.5 148.7 192.7 148 211.2 L 148 754.9 C 148 774.6 151.7 783.3 157.4 788.9 C 164.3 795.8 170.3 799 184.2 799 L 819.4 799 C 831 799 839.7 793.9 845.2 788.4 C 850.8 782.8 852.9 772.5 852.7 760.8 L 852.7 513.3 L 852.7 267.2 C 852.7 249.8 852 242.8 845.6 236.4 C 838.9 229.7 834.4 227 820.3 227 L 412.6 227 L 359.3 174 L 189.2 174 z M 240 213 L 350 213 L 403.3 266.7 C 531.4 266.7 760 267 760 267 C 801 267 812.4 282.5 813 320 L 187 320 L 187 266 C 187.8 227.3 198.4 215.7 240 213 z" fill="REPLACE_FILL1"/>`},
		{openicon:`<path d="M 132,305 H 880 V 750 H 132 Z" fill="REPLACE_FILL2"/><path d="M 135,188 c -5.6,0 -13.9,2.9 -19.8,8.9 C 109.4,203 107,206.8 107,216 c 0,189.7 0,379.3 0,569 0,11.1 1.7,14.8 7,20.2 C 120.5,811.6 125.4,813 135,813 h 717 c 16.7,0 16.7,-1.6 18.6,-6.6 L 981.3,423.4 c 0,-5.8 -1,-6.2 -2.8,-8.1 -1.9,-1.9 -4.3,-2 -11.9,-2 l -691.9,2.1 c -16.4,0 -21.3,11.5 -23.4,17.2 l -80.9,263 -0.2,0 C 159.1,714.4 147,704.3 147,677.2 V 334 h 733 v -26 c 0,-7.7 -1.6,-14.7 -7.6,-19.8 C 866.3,283.1 860.4,280 852,280 H 440 l -20,-82 c -1.2,-2.5 -3.1,-6.8 -5.8,-7.7 0,0 -3,-2.3 -10.2,-2.3 z" fill="REPLACE_FILL1"/>`,
		closedicon:`<path d="M 132,305 H 880 V 750 H 132 Z" fill="REPLACE_FILL2"/><path d="M 135,813 c -10.3,0 -14.5,-1.4 -21,-7.8 C 108.7,799.8 107,796.1 107,785 c 0,-189.7 0,-379.3 0,-569 0,-9.2 2.4,-13 8.2,-19.1 C 121.1,190.9 129.4,188 135,188 h 269 c 7.2,0 10.2,2.3 10.2,2.3 2.7,0.9 4.6,5.2 5.8,7.7 l 20,82 h 412 c 8.4,0 14.3,3.1 20.4,8.2 C 878.4,293.3 880,300.3 880,308 v 26 H 147 v 343.2 c 0,27.1 18.1,25.2 21.7,5.4 l 32.7,-277.7 c 0.7,-2.8 2.7,-7.5 5.8,-10.6 C 210.4,391.1 214.5,388 222.7,388 H 852 c 7.9,0 15.9,2.9 20.5,7.5 C 878.3,401.3 880,408.6 880,416 v 369 c 0,6.9 -1.8,14.7 -7.4,19.3 C 866.2,809.6 858.9,813 852,813 Z" fill="REPLACE_FILL1"/>`},
		{openicon:`<path d="M 186.3,187 c -20,0 -35.7,7.4 -47.4,19.3 -11.7,11.9 -17.6,25 -17.6,45.7 v 80 l -0.3,416 c 0,10.9 4.6,32.6 16.7,45.1 C 149.8,805.6 168,813 186.3,813 365.7,749.3 880.3,734.5 880.3,734.5 c 0,0 0,-255.4 0,-402.5 0,-16.9 -4.7,-35 -17.2,-47.4 -12.5,-12.4 -30.1,-17.6 -47.8,-17.6 h -310 l -79,-80 z" fill="REPLACE_FILL1"/><path d="m 175.1,810.3 79.1,-393 c 8.3,-23.6 21.8,-42.9 53.1,-43 H 920.6 c 17.7,0 35.9,19.5 33.7,29.3 l -73.7,365.7 c -9,24.8 -11.1,41.3 -51.8,44 H 185.6 c -3.6,0 -6.4,-0.1 -11.1,-0.9 z" fill="REPLACE_FILL2"/>`,
		closedicon:`<path d="M 121,252 c 0,-20.7 5.9,-33.8 17.6,-45.7 C 150.3,194.4 166,187 186,187 h 240 l 79,80 -384,113 z" fill="REPLACE_FILL1"/><path d="M 186,813 c -18.4,0 -36.5,-7.4 -48.6,-19.9 C 125.3,780.6 120.7,758.9 120.7,748 L 121,332 c 0,-16.9 7.2,-31.7 18.6,-43.5 C 151,276.7 170.1,267 186,267 h 629 c 17.6,0 35.2,5.3 47.8,17.6 C 875.3,297 880,315.1 880,332 v 416 c 0,14.8 -3.4,36.6 -17,47.9 C 849.5,807.2 830.9,813 815,813 Z" fill="REPLACE_FILL2"/>`},
		{openicon:`<path d="M 160,253 h 614 c 14.8,0 29.7,8.6 36.9,15.8 C 819.4,277.3 826,289.4 826,305 v 95 H 160 Z" fill="REPLACE_FILL2"/><path d="M 199,200 c -26.2,0 -33.9,6.5 -41.5,15.6 C 149.8,224.8 147,231.8 147,252 V 386.7 387 c -20.9,0.5 -56.5,-3.5 -70.3,6.9 -2.5,1.9 -5.4,3.2 -8.3,9.8 -6.8,25.6 -0.3,54.8 1.1,70.3 9.1,59.2 69.1,294.7 74.9,310 3.7,9.8 4.6,13.6 10,15 h 689.6 c 6.3,-1.4 11.6,-15 11.6,-15 L 931.8,474 c 2.7,-20 8.3,-54 -0.2,-70.3 -2,-3.5 -6.5,-8.1 -9.3,-9.8 C 902.5,385.1 881.9,387 853,387 852.6,369.4 855,346.8 846.6,333 842.4,326.2 830.5,321.3 826,321.3 V 387 L 173.2,386.7 173,387 v -82 c 0,-14.6 2.8,-25.9 12.4,-35.5 C 195.9,259 207.7,253 225,253 h 201 l -54,-53 z" fill="REPLACE_FILL1"/>`,
		closedicon:`<path d="M 160,400 V 253 h 440 v 147 z" fill="REPLACE_FILL2"/><path d="M 186,799 c -24.2,0 -34,-8 -39.7,-13.6 C 140.8,779.9 134,769.1 134,747 V 372 c 0,-21.5 13,-32 13,-32 V 252 c 0,-20.2 2.8,-27.2 10.5,-36.4 C 165.1,206.5 172.8,200 199,200 h 173 l 54,53 H 225 c -17.3,0 -29.1,6 -39.6,16.5 C 175.8,279.1 173,290.4 173,305 l -0.4,19 c 0,0 9.6,-4 20.9,-4 H 494 L 614,200 h 186 c 17.7,0 26.6,7.1 36,14.2 C 846.5,222 852,233.6 852,252 v 495 c 0,16.1 -7.5,30.2 -14.1,36.7 C 831.4,790.2 815.9,799 800,799 Z" fill="REPLACE_FILL1"/>`}
	];
	
	var folderGuildContent = null;
	const folderGuildContentComponent = class FolderGuildsContent extends BdApi.React.Component {
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
				className: BDFDB.DOMUtils.formatClassName(BDFDB.disCN.guildswrapper, BDFDB.disCN.guilds, this.props.themeOverride && BDFDB.disCN.themedark, BDFDB.disCN._serverfoldersfoldercontent, (!folders.length || closing) && BDFDB.disCN._serverfoldersfoldercontentclosed),
				children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ScrollerNone, {
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
										if (BDFDB.InternalData.pressedKeys.includes(46)) {
											BDFDB.ListenerUtils.stopEvent(event);
											_this.removeGuildFromFolder(folder.folderId, guildId);
										}
										else {
											if (settings.closeAllFolders) {
												for (let openFolderId of BDFDB.LibraryModules.FolderUtils.getExpandedFolders()) if (openFolderId != folder.folderId || !settings.forceOpenFolder) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(openFolderId);
											}
											else if (settings.closeTheFolder && !settings.forceOpenFolder && BDFDB.LibraryModules.FolderUtils.isFolderExpanded(folder.folderId)) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(folder.folderId);
											else BDFDB.ReactUtils.forceUpdate(this);
										}
									},
									onMouseDown: (event, instance) => {
										event = event.nativeEvent || event;
										let mousemove = event2 => {
											if (Math.sqrt((event.pageX - event2.pageX)**2) > 20 || Math.sqrt((event.pageY - event2.pageY)**2) > 20) {
												BDFDB.ListenerUtils.stopEvent(event);
												this.draggedGuild = guildId;
												let dragpreview = _this.createDragPreview(BDFDB.ReactUtils.findDOMNode(instance).cloneNode(true), event2);
												BDFDB.ReactUtils.forceUpdate(this);
												document.removeEventListener("mousemove", mousemove);
												document.removeEventListener("mouseup", mouseup);
												let dragging = event3 => {
													_this.updateDragPreview(dragpreview, event3);
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
													BDFDB.DOMUtils.remove(dragpreview);
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
										let mouseup = _ => {
											document.removeEventListener("mousemove", mousemove);
											document.removeEventListener("mouseup", mouseup);
										};
										document.addEventListener("mousemove", mousemove);
										document.addEventListener("mouseup", mouseup);
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
					}).filter(n => n).reduce((r, a) => r.concat(a, settings.addSeparators ? BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.GuildComponents.Items.Separator, {}) : null), [0]).slice(1, -1).flat(10).filter(n => n)
				})
			});
		}
	};
	
	const folderIconPickerComponent = class FolderIconPicker extends BdApi.React.Component {
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
	
	var redCross = `'data:image/svg+xml; base64, PHN2ZyB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cGF0aCBkPSJNNDAuNDAwIDE3LjE3OCBDIDM5Ljg1MCAxNy4zNjYsMzguNzkzIDE3LjUzOCwzOC4wNTAgMTcuNTYwIEMgMzMuMzUxIDE3LjY5OSwyMy4zOTcgMjQuNzg4LDIxLjM4MSAyOS40MzIgQyAyMS4wODcgMzAuMTA5LDIwLjU2NiAzMC44OTYsMjAuMjIzIDMxLjE4MSBDIDE5Ljg4MCAzMS40NjUsMTkuNjAwIDMxLjg2NiwxOS42MDAgMzIuMDcxIEMgMTkuNjAwIDMyLjI3NiwxOS4yMzYgMzMuMjQyLDE4Ljc5MiAzNC4yMTggQyAxNi4zNDUgMzkuNTg5LDE2LjM0NSA0OS42MTEsMTguNzkyIDU0Ljk4MiBDIDE5LjIzNiA1NS45NTgsMTkuNjAwIDU2LjkxOCwxOS42MDAgNTcuMTE2IEMgMTkuNjAwIDU3LjMxNCwxOS45NjAgNTcuODAyLDIwLjQwMCA1OC4yMDAgQyAyMC44NDAgNTguNTk4LDIxLjIwMCA1OS4xMzEsMjEuMjAwIDU5LjM4NSBDIDIxLjIwMCA2MC4zOTEsMjUuNjgwIDY0Ljk0Miw5MS41MDUgMTMwLjgwMCBDIDEyOC45OTUgMTY4LjMxMCwxNTkuODQ5IDE5OS4zMjYsMTYwLjA2OCAxOTkuNzI0IEMgMTYwLjQwOSAyMDAuMzQ0LDE1MC45NTAgMjA5Ljk2NCw5My45ODkgMjY2LjkyNCBDIDE4Ljc5OCAzNDIuMTEzLDE5LjYwMCAzNDEuMjkyLDE5LjYwMCAzNDMuMTI2IEMgMTkuNjAwIDM0My4yODMsMTkuMjUwIDM0NC4wNjUsMTguODIyIDM0NC44NjQgQyAxNS40MjkgMzUxLjE5NSwxNS45NTggMzYyLjkxOCwxOS45MzIgMzY5LjQ0MCBDIDIyLjA5NCAzNzIuOTkwLDI3LjQ3NCAzNzguODAwLDI4LjU5OCAzNzguODAwIEMgMjguODYxIDM3OC44MDAsMjkuNDAyIDM3OS4xNjAsMjkuODAwIDM3OS42MDAgQyAzMC4xOTggMzgwLjA0MCwzMC43MDMgMzgwLjQwMCwzMC45MjIgMzgwLjQwMCBDIDMxLjE0MSAzODAuNDAwLDMyLjIzOCAzODAuODMxLDMzLjM2MCAzODEuMzU4IEMgMzQuNDgyIDM4MS44ODYsMzYuNDgwIDM4Mi41MzMsMzcuODAwIDM4Mi43OTcgQyA0My43ODYgMzgzLjk5NCw0NC4zMjMgMzg0LjAyNyw0Ny4yOTkgMzgzLjM4NiBDIDQ4Ljg5NSAzODMuMDQyLDUxLjAxMCAzODIuNjE5LDUyLjAwMCAzODIuNDQ2IEMgNTIuOTkwIDM4Mi4yNzQsNTQuNTE3IDM4MS43NDMsNTUuMzk0IDM4MS4yNjYgQyA1Ni4yNzEgMzgwLjc5MCw1Ny4xODggMzgwLjQwMCw1Ny40MzIgMzgwLjQwMCBDIDU3LjY3NiAzODAuNDAwLDU4LjIwMiAzODAuMDQwLDU4LjYwMCAzNzkuNjAwIEMgNTguOTk4IDM3OS4xNjAsNTkuNTk4IDM3OC44MDAsNTkuOTMyIDM3OC44MDAgQyA2MC4yNjcgMzc4LjgwMCw5MS43MjUgMzQ3LjYxNSwxMjkuODM5IDMwOS41MDAgQyAxNjkuMDU3IDI3MC4yODEsMTk5LjQ5NiAyNDAuMTQ1LDE5OS45NjQgMjQwLjA3MyBDIDIwMC42MDIgMjM5Ljk3NSwyMTYuMDAxIDI1NS4xOTMsMjY3LjQ5NSAzMDYuODE0IEMgMzI3LjA0NiAzNjYuNTExLDMzOS41MzEgMzc4LjgwMCwzNDAuNjI3IDM3OC44MDAgQyAzNDAuNzk4IDM3OC44MDAsMzQxLjI2NSAzNzkuMDk3LDM0MS42NjcgMzc5LjQ2MSBDIDM0NS43MjggMzgzLjEzNiwzNjEuMDEzIDM4NC40MDksMzY1LjY4NSAzODEuNDYxIEMgMzY2LjE4OCAzODEuMTQzLDM2Ny4wMjQgMzgwLjc1NywzNjcuNTQxIDM4MC42MDIgQyAzNzAuNTgzIDM3OS42OTEsMzc2LjYyMyAzNzQuMjAwLDM3OS4zODIgMzY5LjgzNiBDIDM4NS4xMDUgMzYwLjc4NSwzODQuMDM5IDM0Ni40MDksMzc3LjAzOSAzMzguMjI4IEMgMzc2LjA4NCAzMzcuMTEzLDM0NC44NDYgMzA1Ljc0MywzMDcuNjIxIDI2OC41MTcgQyAyNTUuMzI5IDIxNi4yMjQsMjM5Ljk2OSAyMDAuNjQ3LDI0MC4wNzAgMjAwLjAwOSBDIDI0MC4xNDMgMTk5LjU0NSwyNzAuMDYyIDE2OS4yODgsMzA4LjIxNiAxMzEuMDkxIEMgMzQ1LjYyNSA5My42NDEsMzc2LjcyMyA2Mi4zNzAsMzc3LjMyNCA2MS42MDAgQyAzODQuMjg2IDUyLjY3OCwzODUuMDM2IDQwLjYyMSwzNzkuMjc3IDMwLjE3MSBDIDM3Ni4xMzYgMjQuNDY5LDM2Ny45MDYgMTguNTM3LDM2MS42NjggMTcuNDc3IEMgMzU0LjY1NiAxNi4yODYsMzQ1LjA5NSAxNy42NjUsMzQxLjg4MyAyMC4zMzEgQyAzNDEuNTY3IDIwLjU5NCwzNDAuNTQ5IDIxLjMxOCwzMzkuNjIyIDIxLjk0MSBDIDMzOC42OTUgMjIuNTYzLDMwNy4wMzEgNTMuOTcyLDI2OS4yNTkgOTEuNzM3IEMgMjMxLjQ4NiAxMjkuNTAxLDIwMC4zMzAgMTYwLjQwMCwyMDAuMDIyIDE2MC40MDAgQyAxOTkuNzE0IDE2MC40MDAsMTY4LjkzOCAxMjkuODY5LDEzMS42MzEgOTIuNTU0IEMgNTYuMjI1IDE3LjEzMSw2MC4yODggMjEuMDQ3LDU1LjIwMCAxOC44ODcgQyA1MS41OTEgMTcuMzU0LDQyLjgzNiAxNi4zNDMsNDAuNDAwIDE3LjE3OHoiIGZpbGw9InJnYigyNDAsIDcxLCA3MSkiPjwvcGF0aD48L3N2Zz4='`;
	
	const folderIconCustomPreviewComponent = class FolderIconCustomPreview extends BdApi.React.Component {
		componentDidMount() {
			this._previewInterval = BDFDB.TimeUtils.interval(_ => {
				this.props.tick = !this.props.tick;
				BDFDB.ReactUtils.forceUpdate(this);
			}, 2000);
		}
		componentWillUnmount() {
			BDFDB.TimeUtils.clear(this._previewInterval);
		}
		checkImage(base64OrUrl, callback) {
			if (base64OrUrl.indexOf("https://") == 0 || base64OrUrl.indexOf("http://") == 0) BDFDB.LibraryRequires.request(base64OrUrl.trim(), (error, response, body) => {
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
					document.body.appendChild(canvas);
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
			return [
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
					title: _this.labels.modal_customopen_text,
					className: BDFDB.disCN.marginbottom20,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
						type: "file",
						filter: "image",
						value: this.props.open,
						onChange: value => {
							this.props.open = value;
							BDFDB.ReactUtils.forceUpdate(this);
						}
					})
				}),
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
					title: _this.labels.modal_customclosed_text,
					className: BDFDB.disCN.marginbottom20,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
						type: "file",
						filter: "image",
						value: this.props.closed,
						onChange: value => {
							this.props.closed = value;
							BDFDB.ReactUtils.forceUpdate(this);
						}
					})
				}),
				BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
					title: _this.labels.modal_custompreview_text,
					className: BDFDB.disCN.marginbottom20,
					children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Flex, {
						justify: BDFDB.LibraryComponents.Flex.Justify.BETWEEN,
						align: BDFDB.LibraryComponents.Flex.Align.CENTER,
						children: [
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCNS._serverfoldersiconswatch + BDFDB.disCN._serverfoldersiconswatchpreview,
								children: BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN._serverfoldersiconswatchinner,
									style: {background: `url(${this.props.open || redCross}) center/cover no-repeat`}
								})
							}),
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCNS._serverfoldersiconswatch + BDFDB.disCN._serverfoldersiconswatchpreview,
								children: BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN._serverfoldersiconswatchinner,
									style: {background: `url(${this.props.closed || redCross}) center/cover no-repeat`}
								})
							}),
							BDFDB.ReactUtils.createElement("div", {
								className: BDFDB.disCNS._serverfoldersiconswatch + BDFDB.disCN._serverfoldersiconswatchpreview,
								children: BDFDB.ReactUtils.createElement("div", {
									className: BDFDB.disCN._serverfoldersiconswatchinner,
									style: {background: `url(${(this.props.tick ? this.props.open : this.props.closed) || redCross}) center/cover no-repeat`}
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
								children: BDFDB.LanguageUtils.LanguageStrings.ADD,
								onClick: (e, instance) => {
									let inputIns = BDFDB.ReactUtils.findOwner(this, {name: "BDFDB_TextInput", all:true, unlimited:true});
									if (inputIns.length == 2 && inputIns[0].props.value && inputIns[1].props.value) {
										this.checkImage(inputIns[0].props.value, openIcon => {
											this.checkImage(inputIns[1].props.value, closedIcon => {
												customIcons[_this.generateId("customicon")] = {openicon: openIcon, closedicon: closedIcon};
												BDFDB.DataUtils.save(customIcons, _this, "customicons");
												this.props.open = null;
												this.props.closed = null;
												BDFDB.ModuleUtils.forceAllUpdates(_this, "GuildFolderSettingsModal");
												BDFDB.NotificationUtils.toast("Custom Icon was added to selection", {type:"success"});
											});
										})
									}
									else BDFDB.NotificationUtils.toast("Add an image for the open and the closed icon", {type:"danger"});
								}
							})
						]
					})
				})
			]
		}
	};
			
	return class ServerFolders {
		getName () {return "ServerFolders";}

		getVersion () {return "6.8.4";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Patches Discords native Folders in a way to open Servers within a Folder in a new bar to the right. Also adds a bunch of new features to more easily organize, customize and manage your Folders.";}

		constructor () {
			this.changelog = {
				"fixed":[["Empty invisible folders","Fixed an issue where an open empty invisible folder would force the extra column to stay open forever, why the fuck discord are there empty invisible folders"], ["Switching", "Clicking a server in a folder opens the server again"]]
			};
			
			this.patchedModules = {
				after: {
					AppView: "render",
					GuildFolder: "type",
					Guilds: "render",
					Guild: ["componentDidMount", "render"],
					GuildFolderSettingsModal: ["componentDidMount", "render"]
				}
			};
		}

		initConstructor () {
			_this = this;
			
			folderStates = {};
			folderReads = {};
			guildStates = {};
				
			this.css = `
				.${this.name}-modal ${BDFDB.dotCN._serverfoldersiconswatch} {
					position: relative;
					margin: 3px 3px;
					padding: 3px 3px;
					width: 55px;
					height: 55px;
					border-radius: 12px;
					cursor: pointer;
				}
				.${this.name}-modal ${BDFDB.dotCN._serverfoldersiconswatch + BDFDB.dotCN._serverfoldersiconswatchpreview} {
					width: 95px;
					height: 95px;
					cursor: default;
				}
				.${this.name}-modal ${BDFDB.dotCN._serverfoldersiconswatch}:hover {
					background-color: var(--background-modifier-hover);
				}
				.${this.name}-modal ${BDFDB.dotCN._serverfoldersiconswatch + BDFDB.dotCN._serverfoldersiconswatchselected} {
					background-color: var(--background-modifier-selected);
				}
				.${this.name}-modal ${BDFDB.dotCNS._serverfoldersiconswatch + BDFDB.dotCN._serverfoldersiconswatchinner} {
					width: 100%;
					height: 100%;
					border-radius: 12px;
					background-position: center;
					background-size: cover;
					background-repeat: no-repeat;
				}
				.${this.name}-modal ${BDFDB.dotCN._serverfoldersiconswatch} svg${BDFDB.dotCN._serverfoldersiconswatchinner} {
					transform: translateY(-2px) scale(0.8);
				}
				.${this.name}-modal ${BDFDB.dotCNS._serverfoldersiconswatch + BDFDB.dotCN.hovercardbutton} {
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
				${BDFDB.dotCN.guildswrapper + BDFDB.dotCN._serverfoldersfoldercontent} {
					transition: width 0.3s linear !important;
				}
				${BDFDB.dotCN.guildswrapper + BDFDB.dotCN._serverfoldersfoldercontent + BDFDB.dotCN._serverfoldersfoldercontentclosed} {
					width: 0px !important;
				}
				${BDFDB.dotCN.appcontainer} {
					display: flex !important;
				}
				${BDFDB.dotCN.guildswrapper} {
					position: static !important;
					contain: unset !important;
				}
				${BDFDB.dotCN.chatbase} {
					position: static !important;
					contain: unset !important;
					width: 100% !important;
				}`;
			
			this.defaults = {
				settings: {
					closeOtherFolders:	{value:false, 	description:"Close other Folders when opening a Folder."},
					closeTheFolder:		{value:false, 	description:"Close the Folder when selecting a Server."},
					closeAllFolders:	{value:false, 	description:"Close All Folders when selecting a Server."},
					forceOpenFolder:	{value:false, 	description:"Force a Folder to open when switching to a Server of that Folder."},
					showCountBadge:		{value:true, 	description:"Display Badge for Amount of Servers in a Folder."},
					extraColumn:		{value:true, 	description:"Moves the Servers from opened Folders in an extra column."},
					addSeparators:		{value:true, 	description:"Adds separators between Servers of different Folders in extra column."}
				}
			};
		}

		getSettingsPanel () {
			if (!window.BDFDB || typeof BDFDB != "object" || !BDFDB.loaded || !this.started) return;
			let settingsPanel, settingsItems = [];
			
			for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
				className: BDFDB.disCN.marginbottom8,
				type: "Switch",
				plugin: this,
				keys: ["settings", key],
				label: this.defaults.settings[key].description,
				value: settings[key]
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
				type: "Button",
				className: BDFDB.disCN.marginbottom8,
				color: BDFDB.LibraryComponents.Button.Colors.RED,
				label: "Reset all Folders",
				onClick: _ => {
					BDFDB.ModalUtils.confirm(this, "Are you sure you want to reset all folders?", _ => {
						BDFDB.DataUtils.remove(this, "folders");
					});
				},
				children: BDFDB.LanguageUtils.LanguageStrings.RESET
			}));
			settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
				type: "Button",
				className: BDFDB.disCN.marginbottom8,
				color: BDFDB.LibraryComponents.Button.Colors.RED,
				label: "Remove all custom Icons",
				onClick: _ => {
					BDFDB.ModalUtils.confirm(this, "Are you sure you want to remove all custom icons?", _ => {
						BDFDB.DataUtils.remove(this, "customicons");
					});
				},
				children: BDFDB.LanguageUtils.LanguageStrings.REMOVE
			}));
			
			return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
		}

		// Legacy
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
				
				let forceClosing = false;
				BDFDB.ModuleUtils.patch(this, BDFDB.LibraryModules.GuildUtils, "toggleGuildFolderExpand", {after: e => {
					if (settings.closeOtherFolders && !forceClosing) {
						forceClosing = true;
						for (let openFolderId of BDFDB.LibraryModules.FolderUtils.getExpandedFolders()) if (openFolderId != e.methodArguments[0]) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(openFolderId);
						forceClosing = false;
					}
				}});
				
				this.forceUpdateAll();
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}

		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;
				
				this.forceUpdateAll();
				
				BDFDB.DOMUtils.removeClassFromDOM(BDFDB.disCN._serverfoldersfoldercontentisopen);
				
				BDFDB.PluginUtils.clear(this);
			}
		}

		onSwitch () {
			if (typeof BDFDB === "object" && settings.forceOpenFolder) {
				let folder = BDFDB.GuildUtils.getFolder(BDFDB.LibraryModules.LastGuildStore.getGuildId());
				if (folder && !BDFDB.LibraryModules.FolderUtils.isFolderExpanded(folder.folderId)) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(folder.folderId);
			}
		}


		// Begin of own functions

		onSettingsClosed () {
			if (this.SettingsUpdated) {
				delete this.SettingsUpdated;
				folderStates = {};
				this.forceUpdateAll();
			}
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
						label: this.labels.servercontext_serverfolders_text,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "submenu-add"),
						children: folder ? [
							BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								label: this.labels.serversubmenu_removefromfolder_text,
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "remove-from-folder"),
								color: BDFDB.LibraryComponents.MenuItems.Colors.DANGER,
								action: _ => {
									this.removeGuildFromFolder(folder.folderId, e.instance.props.guild.id);
								}
							})
						] : [
							BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								label: this.labels.serversubmenu_createfolder_text,
								id: BDFDB.ContextMenuUtils.createItemId(this.name, "create-folder"),
								disabled: !unfolderedGuilds.length,
								action: _ => {
									this.openFolderCreationMenu(unfolderedGuilds, e.instance.props.guild.id);
								}
							}),
							BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
								label: this.labels.serversubmenu_addtofolder_text,
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
					label: this.labels.foldercontext_autoreadfolder_text,
					id: BDFDB.ContextMenuUtils.createItemId(this.name, "auto-read-folder"),
					checked: data.autoRead,
					action: state => {
						data.autoRead = state;
						BDFDB.DataUtils.save(data, this, "folders", e.instance.props.folderId);
					}
				}));
				e.returnvalue.props.children.splice(e.returnvalue.props.children.length - 1, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuCheckboxItem, {
						label: this.labels.foldercontext_mutefolder_text,
						id: BDFDB.ContextMenuUtils.createItemId(this.name, "mute-folder"),
						checked: muted,
						action: state => {
							data.muteFolder = state;
							BDFDB.DataUtils.save(data, this, "folders", e.instance.props.folderId);
							for (let guildId of folder.guildIds) if (BDFDB.LibraryModules.MutedUtils.isGuildOrCategoryOrChannelMuted(guildId) != state) BDFDB.LibraryModules.GuildNotificationsUtils.updateGuildNotificationSettings(guildId, {muted:state, suppress_everyone:state, suppress_roles:state});
						}
					})
				}));
				e.returnvalue.props.children.push(BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
					children: BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
						label: this.labels.foldercontext_removefolder_text,
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
			if (settings.extraColumn) {
				let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["FluxContainer(Guilds)", "FluxContainer(NavigableGuilds)"]});
				if (index > -1) children.splice(index + 1, 0, BDFDB.ReactUtils.createElement(folderGuildContentComponent, {
					themeOverride: children[index].props.themeOverride
				}, true));
			}
		}

		processGuilds (e) {
			if (settings.extraColumn) {
				let topBar = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.guildswrapperunreadmentionsbartop]]});
				if (topBar) {
					let topIsVisible = topBar.props.isVisible;
					topBar.props.isVisible = (...args) => {
						let ids = BDFDB.LibraryModules.FolderStore.guildFolders.filter(n => n.folderId).map(n => n.guildIds).flat(10);
						args[2] = args[2].filter(n => !ids.includes(n));
						return topIsVisible(...args);
					};
				}
				let bottomBar = BDFDB.ReactUtils.findChild(e.returnvalue, {props:[["className", BDFDB.disCN.guildswrapperunreadmentionsbarbottom]]});
				if (bottomBar) {
					let bottomIsVisible = bottomBar.props.isVisible;
					bottomBar.props.isVisible = (...args) => {
						let ids = BDFDB.LibraryModules.FolderStore.guildFolders.filter(n => n.folderId).map(n => n.guildIds).flat(10);
						args[2] = args[2].filter(n => !ids.includes(n));
						return bottomIsVisible(...args);
					};
				}
			}
		}
		
		processGuildFolder (e) {
			let expandedFolders = BDFDB.LibraryModules.FolderUtils.getExpandedFolders();
			if (expandedFolders.size) BDFDB.DOMUtils.addClass(document.body, BDFDB.disCN._serverfoldersfoldercontentisopen);
			else BDFDB.DOMUtils.removeClassFromDOM(BDFDB.disCN._serverfoldersfoldercontentisopen);
			
			let data = this.getFolderConfig(e.instance.props.folderId);
			if (data.muteFolder) for (let guildId of e.instance.props.guildIds) if (!BDFDB.LibraryModules.MutedUtils.isGuildOrCategoryOrChannelMuted(guildId)) BDFDB.LibraryModules.GuildNotificationsUtils.updateGuildNotificationSettings(guildId, {muted:true, suppress_everyone:true});
			
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
			
			let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "ListItemTooltip"});
			if (index > -1) children[index] = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TooltipContainer, {
				text: e.instance.props.folderName || BDFDB.FolderUtils.getDefaultName(e.instance.props.folderId),
				tooltipConfig: {
					type: "right",
					list: true,
					offset: 12,
					backgroundColor: data.color3,
					fontColor: data.color4
				},
				children: children[index].props.children
			});
			if (e.instance.props.expanded || data.useCloseIcon) {
				let folderIcons = this.loadAllIcons(), icontype = e.instance.props.expanded ? "openicon" : "closedicon";
				let icon = folderIcons[data.iconID] ? (!folderIcons[data.iconID].customID ? this.createBase64SVG(folderIcons[data.iconID][icontype], data.color1, data.color2) : folderIcons[data.iconID][icontype]) : null;
				if (icon) {
					[children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: "FolderIcon"});
					if (index > -1) children[index] = BDFDB.ReactUtils.createElement("div", {
						className: BDFDB.disCN.guildfoldericonwrapper,
						style: {background: `url(${icon}) center/cover no-repeat`}
					});
				}
			}
			if (settings.showCountBadge) {
				[children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name:"BlobMask"});
				if (index > -1) {
					children[index].props.upperLeftBadgeWidth = BDFDB.LibraryComponents.Badges.getBadgeWidthForValue(e.instance.props.guildIds.length);
					children[index].props.upperLeftBadge = BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Badges.NumberBadge, {
						count: e.instance.props.guildIds.length,
						style: {backgroundColor: BDFDB.DiscordConstants.Colors.BRAND}
					});
				}
			}
			if (settings.extraColumn) {
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
				if (settings.closeAllFolders) for (let openFolderId of BDFDB.LibraryModules.FolderUtils.getExpandedFolders()) if (!folder || openFolderId != folder.folderId || !settings.forceOpenFolder) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(openFolderId);
				else if (folder && settings.closeTheFolder && !settings.forceOpenFolder && BDFDB.LibraryModules.FolderUtils.isFolderExpanded(folder.folderId)) BDFDB.LibraryModules.GuildUtils.toggleGuildFolderExpand(folder.folderId);
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
									{value: this.labels.modal_tabheader1_text},
									{value: this.labels.modal_tabheader2_text},
									{value: this.labels.modal_tabheader3_text},
									{value: this.labels.modal_tabheader4_text}
								],
								onItemSelect: (value, instance) => {
									let tabContentInstances = BDFDB.ReactUtils.findOwner(e.instance, {name:"BDFDB_ModalTabContent", all:true, unlimited:true});
									for (let ins of tabContentInstances) {
										if (ins.props.tab == value) ins.props.open = true;
										else delete ins.props.open;
									}
									BDFDB.ReactUtils.forceUpdate(tabContentInstances);
								}
							})
						})
					}));
				}
				[children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["ModalContent", "Content"]});
				if (index > -1) children[index].props.children = [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
						tab: this.labels.modal_tabheader1_text,
						open: true,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: BDFDB.LanguageUtils.LanguageStrings.GUILD_FOLDER_NAME,
								className: BDFDB.disCN.marginbottom20,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.TextInput, {
									inputClassName: "input-foldername",
									value: folder.folderName,
									placeholder: folder.folderName || BDFDB.LanguageUtils.LanguageStrings.SERVER_FOLDER_PLACEHOLDER,
									autoFocus: true
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: this.labels.modal_iconpicker_text,
								className: BDFDB.disCN.marginbottom20,
								children: BDFDB.ReactUtils.createElement(folderIconPickerComponent, {
									selectedIcon: data.iconID
								}, true)
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Switch",
								className: BDFDB.disCN.marginbottom20 + " input-usecloseicon",
								label: this.labels.modal_usecloseicon_text,
								tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
								value: data.useCloseIcon
							})
						]
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
						tab: this.labels.modal_tabheader2_text,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: this.labels.modal_colorpicker1_text,
								className: BDFDB.disCN.marginbottom20,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color1,
									defaultFallback: !data.color1 && !data.swapColors,
									number: 1
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: this.labels.modal_colorpicker2_text,
								className: BDFDB.disCN.marginbottom20,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color2,
									defaultFallback: !data.color2 && data.swapColors,
									number: 2
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Switch",
								className: BDFDB.disCN.marginbottom20 + " input-swapcolors",
								label: this.labels.modal_swapcolor_text,
								tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
								value: data.swapColors
							})
						]
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
						tab: this.labels.modal_tabheader3_text,
						children: [
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: this.labels.modal_colorpicker3_text,
								className: BDFDB.disCN.marginbottom20,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color3,
									number: 3
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.FormComponents.FormItem, {
								title: this.labels.modal_colorpicker4_text,
								className: BDFDB.disCN.marginbottom20,
								children: BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ColorSwatches, {
									color: data.color4,
									number: 4
								})
							}),
							BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsItem, {
								type: "Switch",
								className: BDFDB.disCN.marginbottom20 + " input-copytooltipcolor",
								label: this.labels.modal_copytooltipcolor_text,
								tag: BDFDB.LibraryComponents.FormComponents.FormTitle.Tags.H5,
								value: data.copyTooltipColor
							})
						]
					}),
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.ModalComponents.ModalTabContent, {
						tab: this.labels.modal_tabheader4_text,
						children: BDFDB.ReactUtils.createElement(folderIconCustomPreviewComponent, {}, true)
					})
				];
				[children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, {name: ["ModalFooter", "Footer"]});
				if (index > -1) children[index].props.children = [
					BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.Button, {
						children: BDFDB.LanguageUtils.LanguageStrings.SAVE,
						onClick: event => {
							let oldData = Object.assign({}, data);
							
							let root = BDFDB.ReactUtils.findDOMNode(e.instance).parentElement.querySelector(BDFDB.dotCN.layermodal);
							
							data.iconID = root.querySelector(BDFDB.dotCN._serverfoldersiconswatch + BDFDB.dotCN._serverfoldersiconswatchselected).getAttribute("iconID");

							data.useCloseIcon = root.querySelector(".input-usecloseicon " + BDFDB.dotCN.switchinner).checked;
							data.swapColors = root.querySelector(".input-swapcolors " + BDFDB.dotCN.switchinner).checked;
							data.copyTooltipColor = root.querySelector(".input-copytooltipcolor " + BDFDB.dotCN.switchinner).checked;
							
							data.color1 = BDFDB.ColorUtils.getSwatchColor(root, 1);
							data.color2 = BDFDB.ColorUtils.getSwatchColor(root, 2);
							data.color3 = BDFDB.ColorUtils.getSwatchColor(root, 3);
							data.color4 = BDFDB.ColorUtils.getSwatchColor(root, 4);
							
							let nativeColor = data.swapColors ? "color2" : "color1";
							this.updateFolder({
								folderId: e.instance.props.folderId,
								folderName: root.querySelector(".input-foldername").value,
								folderColor: data[nativeColor] ? BDFDB.ColorUtils.convert(data[nativeColor] && BDFDB.ObjectUtils.is(data[nativeColor]) ? data[nativeColor][Object.keys(data[nativeColor])[0]] : data[nativeColor], "INT") : null
							});
							if (!BDFDB.equals(oldData, data)) {
								BDFDB.DataUtils.save(data, this, "folders", e.instance.props.folderId);
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
				header: this.labels.serversubmenu_createfolder_text,
				subheader: "",
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
					click: (modal, instance) => {
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
					for (let guildId of oldFolder.guildIds) guildFolders.push({guildIds:[guildId]});
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
					guildFolders.push({guildIds:[guildId]});
				}
				else guildFolders.push(oldFolder);
			}
			for (let folder of guildFolders) for (let fGuildId of folder.guildIds) guildPositions.push(fGuildId);
			BDFDB.LibraryModules.SettingsUtils.updateRemoteSettings({guildPositions, guildFolders});
		}

		createDragPreview (div, event) {
			if (!Node.prototype.isPrototypeOf(div)) return;
			let dragpreview = div.cloneNode(true);
			BDFDB.DOMUtils.addClass(dragpreview, BDFDB.disCN._serverfoldersdragpreview);
			BDFDB.DOMUtils.remove(dragpreview.querySelector(BDFDB.dotCNC.guildlowerbadge + BDFDB.dotCNC.guildupperbadge + BDFDB.dotCN.guildpillwrapper));
			BDFDB.DOMUtils.hide(dragpreview);
			dragpreview.style.setProperty("pointer-events", "none", "important");
			dragpreview.style.setProperty("left", event.clientX - 25 + "px", "important");
			dragpreview.style.setProperty("top", event.clientY - 25 + "px", "important");
			document.querySelector(BDFDB.dotCN.appmount).appendChild(dragpreview);
			return dragpreview;
		}

		updateDragPreview (dragpreview, event) {
			if (!Node.prototype.isPrototypeOf(dragpreview)) return;
			BDFDB.DOMUtils.show(dragpreview);
			dragpreview.style.setProperty("left", event.clientX - 25 + "px", "important");
			dragpreview.style.setProperty("top", event.clientY - 25 + "px", "important");
		}
		
		forceUpdateAll() {
			settings = BDFDB.DataUtils.get(this, "settings");
			folderConfigs = BDFDB.DataUtils.load(this, "folders");
			customIcons = BDFDB.DataUtils.load(this, "customicons");
			
			BDFDB.ReactUtils.forceUpdate(folderGuildContent);
			BDFDB.ModuleUtils.forceAllUpdates(this);
			BDFDB.GuildUtils.rerenderAll();
		}

		setLabelsByLanguage () {
			switch (BDFDB.LanguageUtils.getLanguage().id) {
				case "hr":		//croatian
					return {
						servercontext_serverfolders_text:		"Poslužitelj mapu",
						serversubmenu_createfolder_text:		"Izradi mapu",
						serversubmenu_addtofolder_text:			"Dodaj poslužitelj u mapu",
						serversubmenu_removefromfolder_text:	"Ukloni poslužitelj iz mapu",
						foldercontext_autoreadfolder_text:		"Auto: Označite kao pročitano",
						foldercontext_mutefolder_text:			"Isključite mapu",
						foldercontext_removefolder_text:		"Izbriši mapu",
						modal_tabheader1_text:					"Mape",
						modal_tabheader2_text:					"Boja mape",
						modal_tabheader3_text:					"Boja tooltip",
						modal_tabheader4_text:					"Prilagođeni ikona",
						modal_iconpicker_text:					"Odabir mape",
						modal_usecloseicon_text:				"Koristite zatvorenu ikonu umjesto minisevera",
						modal_swapcolor_text:					"Koristite drugu boju za izvorne mape",
						modal_copytooltipcolor_text:			"Koristite iste boje za poslužitelj u mapi",
						modal_colorpicker1_text:				"Boja primarne mape",
						modal_colorpicker2_text:				"Boja sekundarne mape",
						modal_colorpicker3_text:				"Boja tooltip",
						modal_colorpicker4_text:				"Boja fonta",
						modal_customopen_text:					"Otvori ikona",
						modal_customclosed_text:				"Zatvorena ikona",
						modal_custompreview_text:				"Pregled ikona"
					};
				case "da":		//danish
					return {
						servercontext_serverfolders_text:		"Servermapper",
						serversubmenu_createfolder_text:		"Opret mappe",
						serversubmenu_addtofolder_text:			"Tilføj server til mappe",
						serversubmenu_removefromfolder_text:	"Fjern server fra mappe",
						foldercontext_autoreadfolder_text:		"Auto: Markér som læst",
						foldercontext_mutefolder_text:			"Dæmp mappe",
						foldercontext_removefolder_text:		"Slet mappe",
						modal_tabheader1_text:					"Mappe",
						modal_tabheader2_text:					"Mappefarve",
						modal_tabheader3_text:					"Tooltipfarve",
						modal_tabheader4_text:					"Brugerdefinerede ikoner",
						modal_iconpicker_text:					"Mappevalg",
						modal_usecloseicon_text:				"Brug et lukket ikon i stedet for miniserverne",
						modal_swapcolor_text:					"BBrug den anden farve til de originale mapper",
						modal_copytooltipcolor_text:			"Brug de samme farver til server på mappen",
						modal_colorpicker1_text:				"Primær mappefarve",
						modal_colorpicker2_text:				"Sekundær mappefarve",
						modal_colorpicker3_text:				"Tooltipfarve",
						modal_colorpicker4_text:				"Skriftfarve",
						modal_customopen_text:					"Åbn ikon",
						modal_customclosed_text:				"Lukket ikon",
						modal_custompreview_text:				"Ikon forhåndsvisning"
					};
				case "de":		//german
					return {
						servercontext_serverfolders_text:		"Serverordner",
						serversubmenu_createfolder_text:		"Ordner erzeugen",
						serversubmenu_addtofolder_text:			"Server zum Ordner hinzufügen",
						serversubmenu_removefromfolder_text:	"Server aus Ordner entfernen",
						foldercontext_autoreadfolder_text:		"Auto: Als gelesen markieren",
						foldercontext_mutefolder_text:			"Ordner stummschalten",
						foldercontext_removefolder_text:		"Ordner löschen",
						modal_tabheader1_text:					"Ordner",
						modal_tabheader2_text:					"Ordnerfarbe",
						modal_tabheader3_text:					"Tooltipfarbe",
						modal_tabheader4_text:					"Eigene Icons",
						modal_iconpicker_text:					"Ordnerauswahl",
						modal_usecloseicon_text:				"Verwende anstelle der Miniserver ein geschlossenes Symbol",
						modal_swapcolor_text:					"Verwende die zweite Farbe für den ursprünglichen Ordner",
						modal_copytooltipcolor_text:			"Verwende dieselbe Farbe für alle Server eines Ordners",
						modal_colorpicker1_text:				"Primäre Ordnerfarbe",
						modal_colorpicker2_text:				"Sekundäre Ordnerfarbe",
						modal_colorpicker3_text:				"Tooltipfarbe",
						modal_colorpicker4_text:				"Schriftfarbe",
						modal_customopen_text:					"Geöffnetes Icon",
						modal_customclosed_text:				"Geschlossenes Icon",
						modal_custompreview_text:				"Iconvorschau"
					};
				case "es":		//spanish
					return {
						servercontext_serverfolders_text:		"Carpetas de servidor",
						serversubmenu_createfolder_text:		"Crear carpeta",
						serversubmenu_addtofolder_text:			"Añadir servidor a la carpeta",
						serversubmenu_removefromfolder_text:	"Eliminar servidor de la carpeta",
						foldercontext_autoreadfolder_text:		"Auto: Marcar como leído",
						foldercontext_mutefolder_text:			"Silenciar carpeta",
						foldercontext_removefolder_text:		"Eliminar carpeta",
						modal_tabheader1_text:					"Carpeta",
						modal_tabheader2_text:					"Color de carpeta",
						modal_tabheader3_text:					"Color de tooltip",
						modal_tabheader4_text:					"Iconos personalizados",
						modal_iconpicker_text:					"Selección de carpeta",
						modal_usecloseicon_text:				"Use un icono cerrado en lugar de los miniservidores",
						modal_swapcolor_text:					"Use el segundo color para las carpetas originales",
						modal_copytooltipcolor_text:			"Usa los mismos colores para el servidor de la carpeta",
						modal_colorpicker1_text:				"Color primaria de carpeta",
						modal_colorpicker2_text:				"Color secundario de la carpeta",
						modal_colorpicker3_text:				"Color de tooltip",
						modal_colorpicker4_text:				"Color de fuente",
						modal_customopen_text:					"Ícono abierto",
						modal_customclosed_text:				"Icono cerrado",
						modal_custompreview_text:				"Vista previa del icono"
					};
				case "fr":		//french
					return {
						servercontext_serverfolders_text:		"Dossiers du serveur",
						serversubmenu_createfolder_text:		"Créer le dossier",
						serversubmenu_addtofolder_text:			"Ajouter le serveur à un dossier",
						serversubmenu_removefromfolder_text:	"Supprimer le serveur du dossier",
						foldercontext_autoreadfolder_text:		"Auto: Marquer comme lu",
						foldercontext_mutefolder_text:			"Rendre muet le dossier",
						foldercontext_removefolder_text:		"Supprimer le dossier",
						modal_tabheader1_text:					"Dossier",
						modal_tabheader2_text:					"Couleur du dossier",
						modal_tabheader3_text:					"Couleur de tooltip",
						modal_tabheader4_text:					"Icônes personnalisées",
						modal_iconpicker_text:					"Choix du dossier",
						modal_usecloseicon_text:				"Utilisez une icône fermée à la place des mini-serveurs",
						modal_swapcolor_text:					"Utilisez la deuxième couleur pour les dossiers d'origine",
						modal_copytooltipcolor_text:			"Utilisez les mêmes couleurs pour le serveur du dossier",
						modal_colorpicker1_text:				"Couleur primaire du dossier",
						modal_colorpicker2_text:				"Couleur secondaire du dossier",
						modal_colorpicker3_text:				"Couleur de tooltip",
						modal_colorpicker4_text:				"Couleur de la police",
						modal_customopen_text:					"Icône ouverte",
						modal_customclosed_text:				"Icône fermée",
						modal_custompreview_text:				"Aperçu de l'icône"
					};
				case "it":		//italian
					return {
						servercontext_serverfolders_text:		"Cartelle del server",
						serversubmenu_addtofolder_text:			"Aggiungi il server alla cartella",
						serversubmenu_createfolder_text:		"Creare una cartella",
						serversubmenu_removefromfolder_text:	"Rimuovi il server dalla cartella",
						foldercontext_autoreadfolder_text:		"Auto: Contrassegna come letto",
						foldercontext_mutefolder_text:			"Disattiva cartella",
						foldercontext_removefolder_text:		"Elimina cartella",
						modal_tabheader1_text:					"Cartella",
						modal_tabheader2_text:					"Colore della cartella",
						modal_tabheader3_text:					"Colore della tooltip",
						modal_tabheader4_text:					"Icone personalizzate",
						modal_iconpicker_text:					"Selezione della cartella",
						modal_usecloseicon_text:				"Utilizzare un'icona chiusa anziché i mini server",
						modal_swapcolor_text:					"Usa il secondo colore per le cartelle originali",
						modal_copytooltipcolor_text:			"Usa gli stessi colori per il server della cartella",
						modal_colorpicker1_text:				"Colore primaria della cartella",
						modal_colorpicker2_text:				"Colore secondaria della cartella",
						modal_colorpicker3_text:				"Colore della tooltip",
						modal_colorpicker4_text:				"Colore del carattere",
						modal_customopen_text:					"Icona aperta",
						modal_customclosed_text:				"Icona chiusa",
						modal_custompreview_text:				"Icona anteprima"
					};
				case "nl":		//dutch
					return {
						servercontext_serverfolders_text:		"Servermappen",
						serversubmenu_addtofolder_text:			"Voeg server toe aan de map",
						serversubmenu_createfolder_text:		"Map aanmaken",
						serversubmenu_removefromfolder_text:	"Verwijder de server uit de map",
						foldercontext_autoreadfolder_text:		"Auto: Markeren als gelezen",
						foldercontext_mutefolder_text:			"Demp map",
						foldercontext_removefolder_text:		"Verwijder map",
						modal_tabheader1_text:					"Map",
						modal_tabheader2_text:					"Mapkleur",
						modal_tabheader3_text:					"Tooltipkleur",
						modal_tabheader4_text:					"Aangepaste keuze",
						modal_iconpicker_text:					"Map keuze",
						modal_usecloseicon_text:				"Gebruik een gesloten keuze in plaats van de miniservers",
						modal_swapcolor_text:					"Gebruik de tweede kleur voor de originele mappen",
						modal_copytooltipcolor_text:			"Gebruik dezelfde kleuren voor de server van de map",
						modal_colorpicker1_text:				"Primaire mapkleur",
						modal_colorpicker2_text:				"Tweede mapkleur",
						modal_colorpicker3_text:				"Tooltipkleur",
						modal_colorpicker4_text:				"Doopvontkleur",
						modal_customopen_text:					"Geopende keuze",
						modal_customclosed_text:				"Gesloten keuze",
						modal_custompreview_text:				"Voorbeeld van keuze"
					};
				case "no":		//norwegian
					return {
						servercontext_serverfolders_text:		"Servermapper",
						serversubmenu_addtofolder_text:			"Legg til server i mappe",
						serversubmenu_createfolder_text:		"Lag mappe",
						serversubmenu_removefromfolder_text:	"Fjern server fra mappe",
						foldercontext_autoreadfolder_text:		"Auto: Merk som les",
						foldercontext_mutefolder_text:			"Demp mappe",
						foldercontext_removefolder_text:		"Slett mappe",
						modal_tabheader1_text:					"Mappe",
						modal_tabheader2_text:					"Mappefarge",
						modal_tabheader3_text:					"Tooltipfarge",
						modal_tabheader4_text:					"Tilpassede ikoner",
						modal_iconpicker_text:					"Mappevalg",
						modal_usecloseicon_text:				"Bruk et lukket ikon i stedet for minitjenerne",
						modal_swapcolor_text:					"Bruk den andre fargen for de originale mappene",
						modal_copytooltipcolor_text:			"Bruk de samme fargene til serveren til mappen",
						modal_colorpicker1_text:				"Primær mappefarge",
						modal_colorpicker2_text:				"Sekundær mappefarge",
						modal_colorpicker3_text:				"Tooltipfarge",
						modal_colorpicker4_text:				"Skriftfarge",
						modal_customopen_text:					"Åpnet ikon",
						modal_customclosed_text:				"Lukket ikon",
						modal_custompreview_text:				"Ikon forhåndsvisning"
					};
				case "pl":		//polish
					return {
						servercontext_serverfolders_text:		"Foldery serwera",
						serversubmenu_addtofolder_text:			"Dodaj serwer do folderu",
						serversubmenu_createfolder_text:		"Utwórz folder",
						serversubmenu_removefromfolder_text:	"Usuń serwer z folderu",
						foldercontext_autoreadfolder_text:		"Auto: Oznacz jako przeczytane",
						foldercontext_mutefolder_text:			"Wycisz folder",
						foldercontext_removefolder_text:		"Usuń folder",
						modal_tabheader1_text:					"Folder",
						modal_tabheader2_text:					"Kolor folderu",
						modal_tabheader3_text:					"Kolor podpowiedzi",
						modal_tabheader4_text:					"Niestandardowe ikony",
						modal_iconpicker_text:					"Wybór folderu",
						modal_usecloseicon_text:				"Użyj zamkniętej ikony zamiast mini serwerów",
						modal_swapcolor_text:					"Użyj drugiego koloru dla oryginalnych folderów",
						modal_copytooltipcolor_text:			"Użyj tych samych kolorów dla serwera folderu",
						modal_colorpicker1_text:				"Podstawowy kolor folderu",
						modal_colorpicker2_text:				"Drugorzędny kolor folderu",
						modal_colorpicker3_text:				"Kolor podpowiedzi",
						modal_colorpicker4_text:				"Kolor czcionki",
						modal_customopen_text:					"Otwarta ikona",
						modal_customclosed_text:				"Zamknięta ikona",
						modal_custompreview_text:				"Podgląd ikony"
					};
				case "pt-BR":	//portuguese (brazil)
					return {
						servercontext_serverfolders_text:		"Pastas de servidores",
						serversubmenu_addtofolder_text:			"Adicionar servidor à pasta",
						serversubmenu_createfolder_text:		"Criar pasta",
						serversubmenu_removefromfolder_text:	"Remover servidor da pasta",
						foldercontext_autoreadfolder_text:		"Auto: Marcar como lido",
						foldercontext_mutefolder_text:			"Silenciar pasta",
						foldercontext_removefolder_text:		"Excluir pasta",
						modal_tabheader1_text:					"Pasta",
						modal_tabheader2_text:					"Cor da pasta",
						modal_tabheader3_text:					"Cor da tooltip",
						modal_tabheader4_text:					"Ícones personalizados",
						modal_iconpicker_text:					"Escolha da pasta",
						modal_usecloseicon_text:				"Use um ícone fechado em vez dos mini servidores",
						modal_swapcolor_text:					"Use a segunda cor para as pastas originais",
						modal_copytooltipcolor_text:			"Use as mesmas cores para o servidor da pasta",
						modal_colorpicker1_text:				"Cor primária da pasta",
						modal_colorpicker2_text:				"Cor secundária da pasta",
						modal_colorpicker3_text:				"Cor da tooltip",
						modal_colorpicker4_text:				"Cor da fonte",
						modal_customopen_text:					"Ícone aberto",
						modal_customclosed_text:				"Ícone fechado",
						modal_custompreview_text:				"Pré-visualização de ícones"
					};
				case "fi":		//finnish
					return {
						servercontext_serverfolders_text:		"Palvelinkansiot",
						serversubmenu_addtofolder_text:			"Lisää palvelin kansioon",
						serversubmenu_createfolder_text:		"Luo kansio",
						serversubmenu_removefromfolder_text:	"Poista palvelin kansioon",
						foldercontext_autoreadfolder_text:		"Auto: merkitse luettavaksi",
						foldercontext_mutefolder_text:			"Mykistä kansio",
						foldercontext_removefolder_text:		"Poista kansio",
						modal_tabheader1_text:					"Kansio",
						modal_tabheader2_text:					"Kansionväri",
						modal_tabheader3_text:					"Tooltipväri",
						modal_tabheader4_text:					"Mukautetut kuvakkeet",
						modal_iconpicker_text:					"Kansion valinta",
						modal_usecloseicon_text:				"Käytä suljettua kuvaketta minipalvelimien sijasta",
						modal_swapcolor_text:					"Käytä toista väriä alkuperäisissä kansioissa",
						modal_copytooltipcolor_text:			"Käytä samoja värejä kansion palvelimelle",
						modal_colorpicker1_text:				"Ensisijainen kansionväri",
						modal_colorpicker2_text:				"Toissijainen kansionväri",
						modal_colorpicker3_text:				"Tooltipväri",
						modal_colorpicker4_text:				"Fontinväri",
						modal_customopen_text:					"Avattu kuvake",
						modal_customclosed_text:				"Suljettu kuvake",
						modal_custompreview_text:				"Kuvakkeen esikatselu"
					};
				case "sv":		//swedish
					return {
						servercontext_serverfolders_text:		"Servermappar",
						serversubmenu_addtofolder_text:			"Lägg till server i mapp",
						serversubmenu_createfolder_text:		"Skapa mapp",
						serversubmenu_removefromfolder_text:	"Ta bort servern från mappen",
						foldercontext_autoreadfolder_text:		"Auto: Markera som Läs",
						foldercontext_mutefolder_text:			"Stäng mapp",
						foldercontext_removefolder_text:		"Ta bort mapp",
						modal_tabheader1_text:					"Mapp",
						modal_tabheader2_text:					"Mappfärg",
						modal_tabheader3_text:					"Tooltipfärg",
						modal_tabheader4_text:					"Anpassade ikoner",
						modal_iconpicker_text:					"Mappval",
						modal_usecloseicon_text:				"Använd en stängd ikon istället för miniservrarna",
						modal_swapcolor_text:					"Använd den andra färgen för originalmapparna",
						modal_copytooltipcolor_text:			"Använd samma färger för mappen på mappen",
						modal_colorpicker1_text:				"Primär mappfärg",
						modal_colorpicker2_text:				"Sekundär mappfärg",
						modal_colorpicker3_text:				"Tooltipfärg",
						modal_colorpicker4_text:				"Fontfärg",
						modal_customopen_text:					"Öppnad ikon",
						modal_customclosed_text:				"Closed Icon",
						modal_custompreview_text:				"Ikon förhandsvisning"
					};
				case "tr":		//turkish
					return {
						servercontext_serverfolders_text:		"Sunucu klasörleri",
						serversubmenu_addtofolder_text:			"Klasöre sunucu ekle",
						serversubmenu_createfolder_text:		"Klasör oluşturun",
						serversubmenu_removefromfolder_text:	"Sunucuyu klasörden kaldır",
						foldercontext_autoreadfolder_text:		"Oto: Okundu Olarak İşaretle",
						foldercontext_mutefolder_text:			"Klasörü kapat",
						foldercontext_removefolder_text:		"Klasörü sil",
						modal_tabheader1_text:					"Klasör",
						modal_tabheader2_text:					"Klasör rengi",
						modal_tabheader3_text:					"Tooltip rengi",
						modal_tabheader4_text:					"Özel simgeler",
						modal_iconpicker_text:					"Klasör seçimi",
						modal_usecloseicon_text:				"Mini sunucular yerine kapalı bir simge kullanın",
						modal_swapcolor_text:					"Orijinal klasörler için ikinci rengi kullanın",
						modal_copytooltipcolor_text:			"Klasörün sunucusu için aynı renkleri kullanın",
						modal_colorpicker1_text:				"Birincil klasör rengi",
						modal_colorpicker2_text:				"İkincil klasör rengi",
						modal_colorpicker3_text:				"Tooltip rengi",
						modal_colorpicker4_text:				"Yazı rengi",
						modal_customopen_text:					"Açılmış simge",
						modal_customclosed_text:				"Kapalı simge",
						modal_custompreview_text:				"Simge önizleme"
					};
				case "cs":		//czech
					return {
						servercontext_serverfolders_text:		"Složky serveru",
						serversubmenu_addtofolder_text:			"Přidat server do složky",
						serversubmenu_createfolder_text:		"Vytvořit složky",
						serversubmenu_removefromfolder_text:	"Odebrat server ze složky",
						foldercontext_autoreadfolder_text:		"Auto: Označit jako přečtené",
						foldercontext_mutefolder_text:			"Ztlumte složky",
						foldercontext_removefolder_text:		"Smazat složky",
						modal_tabheader1_text:					"Složky",
						modal_tabheader2_text:					"Barva složky",
						modal_tabheader3_text:					"Barva tooltip",
						modal_tabheader4_text:					"Vlastní ikony",
						modal_iconpicker_text:					"Volba složky",
						modal_usecloseicon_text:				"Místo mini serverů použijte uzavřenou ikonu",
						modal_swapcolor_text:					"Použijte druhou barvu pro původní složky",
						modal_copytooltipcolor_text:			"Použijte stejné barvy pro server složky",
						modal_colorpicker1_text:				"Primární barva složky",
						modal_colorpicker2_text:				"Sekundární barva složky",
						modal_colorpicker3_text:				"Barva tooltip",
						modal_colorpicker4_text:				"Barva fontu",
						modal_customopen_text:					"Otevřená ikona",
						modal_customclosed_text:				"Uzavřená ikona",
						modal_custompreview_text:				"Náhled ikony"
					};
				case "bg":		//bulgarian
					return {
						servercontext_serverfolders_text:		"Сървърни папки",
						serversubmenu_addtofolder_text:			"Добавяне на сървър в папка",
						serversubmenu_createfolder_text:		"Създай папка",
						serversubmenu_removefromfolder_text:	"Премахване на сървър от папка",
						foldercontext_autoreadfolder_text:		"Авто: Маркиране като четене",
						foldercontext_mutefolder_text:			"Заглушаване на папката",
						foldercontext_removefolder_text:		"Изтриване на папка",
						modal_tabheader1_text:					"Папка",
						modal_tabheader2_text:					"Цвят на папка",
						modal_tabheader3_text:					"Цвят на подсказка",
						modal_tabheader4_text:					"Персонализирани икони",
						modal_iconpicker_text:					"Избор на папки",
						modal_usecloseicon_text:				"Използвайте затворена икона вместо мини сървърите",
						modal_swapcolor_text:					"Използвайте втория цвят за оригиналните папки",
						modal_copytooltipcolor_text:			"Използвайте същите цветове за сървъра на папката",
						modal_colorpicker3_text:				"Цвят на подсказка",
						modal_colorpicker4_text:				"Цвят на шрифта",
						modal_colorpicker1_text:				"Цвят основнен на папка",
						modal_colorpicker2_text:				"цвят вторичен на папка",
						modal_customopen_text:					"Отворена икона",
						modal_customclosed_text:				"Затворена икона",
						modal_custompreview_text:				"Икона Преглед"
					};
				case "ru":		//russian
					return {
						servercontext_serverfolders_text:		"Папки сервера",
						serversubmenu_addtofolder_text:			"Добавить сервер в папку",
						serversubmenu_createfolder_text:		"Создать папки",
						serversubmenu_removefromfolder_text:	"Удалить сервер из папки",
						foldercontext_autoreadfolder_text:		"Авто: Отметить как прочитанное",
						foldercontext_mutefolder_text:			"Отключить папки",
						foldercontext_removefolder_text:		"Удалить папки",
						modal_tabheader1_text:					"Папка",
						modal_tabheader2_text:					"Цвет папки",
						modal_tabheader3_text:					"Цвет подсказка",
						modal_tabheader4_text:					"Пользовательские значки",
						modal_iconpicker_text:					"Выбор папки",
						modal_usecloseicon_text:				"Используйте закрытую иконку вместо мини-серверов",
						modal_swapcolor_text:					"Используйте второй цвет для оригинальных папок",
						modal_copytooltipcolor_text:			"Используйте те же цвета для сервера папки",
						modal_colorpicker1_text:				"Цвет основной папки",
						modal_colorpicker2_text:				"Цвет вторичной папки",
						modal_colorpicker3_text:				"Цвет подсказка",
						modal_colorpicker4_text:				"Цвет шрифта",
						modal_customopen_text:					"Открытая иконка",
						modal_customclosed_text:				"Закрытая иконка",
						modal_custompreview_text:				"Иконка Просмотр"
					};
				case "uk":		//ukrainian
					return {
						servercontext_serverfolders_text:		"Папки сервера",
						serversubmenu_addtofolder_text:			"Додати сервер до папки",
						serversubmenu_createfolder_text:		"Створити папки",
						serversubmenu_removefromfolder_text:	"Видалити папку з папки",
						foldercontext_autoreadfolder_text:		"Авто: Позначити як прочитане",
						foldercontext_mutefolder_text:			"Відключення папки",
						foldercontext_removefolder_text:		"Видалити папки",
						modal_tabheader1_text:					"Папки",
						modal_tabheader2_text:					"Колір папки",
						modal_tabheader3_text:					"Колір підказка",
						modal_tabheader4_text:					"Користувальницькі іконки",
						modal_iconpicker_text:					"Вибір папки",
						modal_usecloseicon_text:				"Використовуйте закритий значок замість міні-серверів",
						modal_swapcolor_text:					"Використовуйте другий колір для оригінальних папок",
						modal_copytooltipcolor_text:			"Використовуйте ті ж кольори для сервера папки",
						modal_colorpicker1_text:				"Колір основної папки",
						modal_colorpicker2_text:				"Колір вторинного папки",
						modal_colorpicker3_text:				"Колір підказка",
						modal_colorpicker4_text:				"Колір шрифту",
						modal_customopen_text:					"Відкрита ікона",
						modal_customclosed_text:				"Закрита ікона",
						modal_custompreview_text:				"Піктограма попереднього перегляду"
					};
				case "ja":		//japanese
					return {
						servercontext_serverfolders_text:		"サーバーフォルダ",
						serversubmenu_addtofolder_text:			"サーバーをフォルダに追加する",
						serversubmenu_createfolder_text:		"フォルダーを作る",
						serversubmenu_removefromfolder_text:	"サーバーをフォルダから削除する",
						foldercontext_autoreadfolder_text:		"自動： 読み取りとしてマークする",
						foldercontext_mutefolder_text:			"ミュートフォルダー",
						foldercontext_removefolder_text:		"フォルダを削除する",
						modal_tabheader1_text:					"フォルダ",
						modal_tabheader2_text:					"フォルダの色",
						modal_tabheader3_text:					"ツールチップの色",
						modal_tabheader4_text:					"カスタムアイコン",
						modal_iconpicker_text:					"フォルダの選択",
						modal_usecloseicon_text:				"ミニサーバーの代わりに閉じたアイコンを使用する",
						modal_swapcolor_text:					"Використовуйте другий колір для оригінальних папок",
						modal_copytooltipcolor_text:			"フォルダのサーバーに同じ色を使う",
						modal_colorpicker1_text:				"プライマリフォルダの色",
						modal_colorpicker2_text:				"セカンダリフォルダの色",
						modal_colorpicker3_text:				"ツールチップの色",
						modal_colorpicker4_text:				"フォントの色",
						modal_customopen_text:					"開いたアイコン",
						modal_customclosed_text:				"クローズドアイコン",
						modal_custompreview_text:				"アイコンのプレビュー"
					};
				case "zh-TW":	//chinese (traditional)
					return {
						servercontext_serverfolders_text:		"服務器文件夾",
						serversubmenu_addtofolder_text:			"添加服務器到文件夾",
						serversubmenu_createfolder_text:		"創建文件夾",
						serversubmenu_removefromfolder_text:	"從文件夾中刪除服務器",
						foldercontext_autoreadfolder_text:		"自動： 標記為已讀",
						foldercontext_mutefolder_text:			"靜音文件夾",
						foldercontext_removefolder_text:		"刪除文件夾",
						modal_tabheader1_text:					"夾",
						modal_tabheader2_text:					"文件夾顏色",
						modal_tabheader3_text:					"工具提示顏色",
						modal_tabheader4_text:					"自定義圖標",
						modal_iconpicker_text:					"文件夾選擇",
						modal_usecloseicon_text:				"使用關閉的圖標代替迷你服務器",
						modal_swapcolor_text:					"將第二種顏色用於原始文件夾",
						modal_copytooltipcolor_text:			"對文件夾的服務器使用相同的顏色",
						modal_colorpicker1_text:				"主文件夾顏色",
						modal_colorpicker2_text:				"輔助文件夾顏色",
						modal_colorpicker3_text:				"工具提示顏色",
						modal_colorpicker4_text:				"字體顏色",
						modal_customopen_text:					"打開的圖標",
						modal_customclosed_text:				"封閉的圖標",
						modal_custompreview_text:				"圖標預覽"
					};
				case "ko":		//korean
					return {
						servercontext_serverfolders_text:		"서버 폴더",
						serversubmenu_addtofolder_text:			"폴더에 서버 추가",
						serversubmenu_createfolder_text:		"폴더 만들기",
						serversubmenu_removefromfolder_text:	"폴더에서 서버 제거",
						foldercontext_autoreadfolder_text:		"자동: 읽은 상태로 표시",
						foldercontext_mutefolder_text:			"폴더 음소거",
						foldercontext_removefolder_text:		"폴더 삭제",
						modal_tabheader1_text:					"폴더",
						modal_tabheader2_text:					"폴더 색",
						modal_tabheader3_text:					"툴팁 색깔",
						modal_tabheader4_text:					"사용자 정의 아이콘",
						modal_iconpicker_text:					"폴더 선택",
						modal_usecloseicon_text:				"미니 서버 대신 닫힌 아이콘을 사용하십시오",
						modal_swapcolor_text:					"원본 폴더에 두 번째 색상 사용",
						modal_copytooltipcolor_text:			"폴더의 서버에 대해 동일한 색상을 사용하십시오.",
						modal_colorpicker1_text:				"기본 폴더 색",
						modal_colorpicker2_text:				"보조 폴더 색",
						modal_colorpicker3_text:				"툴팁 색깔",
						modal_colorpicker4_text:				"글꼴 색깔",
						modal_customopen_text:					"열린 아이콘",
						modal_customclosed_text:				"닫힌 아이콘",
						modal_custompreview_text:				"아이콘 미리보기"
					};
				default:		//default: english
					return {
						servercontext_serverfolders_text:		"Serverfolders",
						serversubmenu_addtofolder_text:			"Add Server to Folder",
						serversubmenu_createfolder_text:		"Create Folder",
						serversubmenu_removefromfolder_text:	"Remove Server from Folder",
						foldercontext_autoreadfolder_text:		"Auto: Mark As Read",
						foldercontext_mutefolder_text:			"Mute Folder",
						foldercontext_removefolder_text:		"Delete Folder",
						modal_tabheader1_text:					"Folder",
						modal_tabheader2_text:					"Foldercolor",
						modal_tabheader3_text:					"Tooltipcolor",
						modal_tabheader4_text:					"Custom Icons",
						modal_iconpicker_text:					"Folderchoice",
						modal_usecloseicon_text:				"Use a closed Icon instead of the Mini-Servers",
						modal_swapcolor_text:					"Use second Color for the native Folder",
						modal_copytooltipcolor_text:			"Use same Colors for Servers of the Folder",
						modal_colorpicker1_text:				"Primary Foldercolor",
						modal_colorpicker2_text:				"Secondary Foldercolor",
						modal_colorpicker3_text:				"Tooltipcolor",
						modal_colorpicker4_text:				"Fontcolor",
						modal_customopen_text:					"Open Icon",
						modal_customclosed_text:				"Closed Icon",
						modal_custompreview_text:				"Iconpreview"
					};
			}
		}
	}
})();

module.exports = ServerFolders;