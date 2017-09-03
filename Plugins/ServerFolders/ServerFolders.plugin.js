//META{"name":"ServerFolders"}*//

class ServerFolders {
	constructor () {
		
		this.labels;
		
		this.selectedFolder;
		
		this.serverContextObserver;
		this.serverListObserver;
		this.serverListContextHandler;
    
		this.css = `
			<style class='serverfolders'>

			.pick-wrap {
				position: relative;
				padding: 0;
				margin: 0;
			}

			.pick-wrap .color-picker-popout {
				position: absolute;
			}

			.ui-color-picker-swatch1,
			.ui-color-picker-swatch2 {
				width: 22px;
				height: 22px;
				margin-bottom: 5px;
				margin-top: 5px;
				border: 4px solid transparent;
				border-radius: 12px;
			}

			.ui-color-picker-swatch1.large,
			.ui-color-picker-swatch2.large {
				min-width: 62px;
				height: 62px;
				border-radius: 25px;
			}
			
			.serverfolders-modal .modal {
				align-content: space-around;
				align-items: center;
				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				height: 100%;
				justify-content: center;
				max-height: 660px;
				min-height: 340px;
				opacity: 0;
				padding-bottom: 60px;
				padding-top: 60px;
				pointer-events: none;
				position: absolute;
				user-select: none;
				width: 100%;
				z-index: 1000;
			}
			
			.serverfolders-modal .form {
				width: 100%;
			}

			.serverfolders-modal .form-header, .serverfolders-modal .form-actions {
				background-color: rgba(32,34,37,.3);
				box-shadow: inset 0 1px 0 rgba(32,34,37,.6);
				padding: 20px;
				
			}

			.serverfolders-modal .form-header {
				color: #f6f6f7;
				cursor: default;
				font-size: 16px;
				font-weight: 600;
				letter-spacing: .3px;
				line-height: 20px;
				text-transform: uppercase;
			}

			.serverfolders-modal .form-actions {
				display: flex;
				flex-direction: row-reverse;
				flex-wrap: nowrap;
				flex: 0 0 auto;
				padding-right: 32px;
			}

			.serverfolders-modal .form-inner{
				margin: 10px 0;
				max-height: 360px;
				overflow-x: hidden;
				overflow-y: hidden;
				padding: 0 20px;
				
			}

			.serverfolders-modal .modal-inner {
				background-color: #36393E;
				border-radius: 5px;
				box-shadow: 0 0 0 1px rgba(32,34,37,.6),0 2px 10px 0 rgba(0,0,0,.2);
				display: flex;
				min-height: 200px;
				pointer-events: auto;
				width: 470px;
			}

			.serverfolders-modal input {
				color: #f6f6f7;
				background-color: rgba(0,0,0,.1);
				border-color: rgba(0,0,0,.3);
				padding: 10px;
				height: 40px;
				box-sizing: border-box;
				width: 100%;
				border-width: 1px;
				border-style: solid;
				border-radius: 3px;
				outline: none;
				transition: background-color .15s ease,border .15s ease;
			}

			.serverfolders-modal .btn {
				align-items: center;
				background: none;
				border-radius: 3px;
				border: none;
				box-sizing: border-box;
				display: flex;
				font-size: 14px;
				font-weight: 500;
				justify-content: center;
				line-height: 16px;
				min-height: 38px;
				min-width: 96px;
				padding: 2px 16px;
				position: relative;
			}

			.serverfolders-modal .btn-cancel {
				background-color: #2f3136;
				color: #fff;
			}

			.serverfolders-modal .btn-save {
				background-color: #3A71C1;
				color: #fff;
			}

			.serverfolders-modal .control-group label {
				color: #b9bbbe;
				letter-spacing: .5px;
				text-transform: uppercase;
				flex: 1;
				cursor: default;
				margin-bottom: 8px;
				margin-top: 0;
				font-weight: 600;
				line-height: 16px;
				font-size: 12px;
			}

			.serverfolders-modal .control-group {
				margin-top: 10px;
			}

			'</style>`;

		this.serverContextEntryMarkup =
			`<div class="item-group">
				<div class="item createfolder-item">
					<span>REPLACE_servercontext_createfolder_text</span>
					<div class="hint"></div>
				</div>
			</div>`;
			
		this.folderContextMarkup = 
			`<div class="context-menu">
				<div class="item-group">
					<div class="item foldersettings-item">
						<span>REPLACE_foldercontext_foldersettings_text</span>
						<div class="hint"></div>
					</div>
					<div class="item removefolder-item">
						<span>REPLACE_foldercontext_removefolder_text</span>
						<div class="hint"></div>
					</div>
				</div>
			</div>`;
			
		this.folderIconMarkup = 
			`<div class="guild folder">
				<div draggable="true">
					<div class="guild-inner" draggable="false" style="border-radius: 25px;">
						<img draggable="false" class="avatar-small"></img>
					</div>
				</div>
				<div class="badge folder"></div>
			</div>`;
			
		this.folderTooltipMarkup = 
			`<div class="tooltip tooltip-right tooltip-brand guild-folder-tooltip"></div>`;

		this.folderSettingsModalMarkup =
			`<span class="serverfolders-modal">
				<div class="callout-backdrop" style="background-color:#000; opacity:0.85"></div>
				<div class="modal" style="opacity: 1">
					<div class="modal-inner">
						<form class="form">
							<div class="form-header">
								<header class="modal-header">REPLACE_modal_header_text</header>
							</div>
							<div class="form-inner">
								<div class="control-group">
									<label class="modal-text-label" for="modal-text">REPLACE_modal_foldername_text</label>
									<input type="text" id="modal-text" name="text">
								</div>
								<div class="control-group">
									<label class="color-picker1-label">REPLACE_modal_colorpicker1_text</label>
									<div class="color-picker1">
										<div class="swatches1"></div>
									</div>
									<label class="color-picker2-label">REPLACE_modal_colorpicker2_text</label>
									<div class="color-picker2">
										<div class="swatches2"></div>
									</div>
								</div>
							</div>
							<div class="form-actions">
								<button type="button" class="btn btn-cancel">REPLACE_btn_cancel_text</button>
								<button type="button" class="btn btn-save">REPLACE_btn_save_text</button>
							</div>
						</form>
					</div>
				</div>
			</span>`;

		this.colourList = 
			['rgb(26, 188, 156)','rgb(46, 204, 113)','rgb(52, 152, 219)','rgb(155, 89, 182)','rgb(233, 30, 99)','rgb(241, 196, 15)','rgb(230, 126, 34)','rgb(231, 76, 60)','rgb(149, 165, 166)','rgb(96, 125, 139)','rgb(99, 99, 99)','rgb(77, 77, 77)',
			'rgb(17, 128, 106)','rgb(31, 139, 76)','rgb(32, 102, 148)','rgb(113, 54, 138)','rgb(173, 20, 87)','rgb(194, 124, 14)','rgb(168, 67, 0)','rgb(153, 45, 34)','rgb(151, 156, 159)','rgb(84, 110, 122)','rgb(44, 44, 44)','rgb(33, 33, 33)'];
			
			
		this.folderOpenIcon =	
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAAB2ElEQVR4Xu2Z4W6DMAwG4f0fmqloq0YJw0dIhLPb7y+qfT0Hr8yTf2ECczhpcBIWkEBYwgIEQFSzhAUIgKhmCQsQAFHNEhYgAKKaJSxAAETvMGsBn1eK3lFDZQmx4zWF1kL6rLCmlli3lamrBd4N6qeNq/VUYogdv1JcK1CPByasmFRrisJqbdWj7RLWAGaBFi5FqSSPHsNLBOAhDIwe6HVnwb4vx1H/KDxN02iw0ENOWGAjEJaw0B0WFiYc/P547yzwPYwI66j9nUiadW7Km5GwzmG91wthCStGAKRWqbqatSw5ng/zXL7bu8FKDKr/nSWs4NAnB9XXLGEFrXrFksPqt5QmB7XZGJo/DZPD2vBpCis5qN0eKqzXZr5fQosLezNYo1nV9N8dYYG3O8lhFSeuyRgmB3U4ccLaL9eHTG6HNapVTS745LD+lEeztmPYD9bIVt0+hsLaanr4I3pyUCFxbruzksMKcQiFfsk1qlkhDqHQGaz/YFVoTj8W3Bwv/sBP3uTdKTVr/Umd1fLoNOofhc/G8dFYysWh/lF4sJHEveMDhS8o01hW9Vt1OOHYVZUsLIBPWMICBEBUs4QFCICoZgkLEABRzRIWIACimiUsQABENQvA+gLIy3lMlnMoMQAAAABJRU5ErkJggg==";			
			
		this.folderClosedIcon =	
			"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEsAAABLCAYAAAA4TnrqAAABkElEQVR4Xu3a6xKCIABEYXz/h7bpOl1M94CWMqffywRfK1I2FF+xwBAnDRaxQAnEEgsIgKjNEgsIgKjNEgsIgKjNEgsIgKjNEgsIgOgazRrB+01F15hD4xSy4S0TbUV6n2HLXLLVNqZqJ7g21H0ZtfNpZMiG10xuK6jdg4mVleqSolhbt2rX7RKrg2aBJVRFaUl2fRlWCcBBGIwO+NWeBdddHUfrR+FSSm9Y6CYnFjgRNGON43HKNgyTy40N4uBtV3iRORLU4wD3CRYbxEGxwPUqlli/uxu6Z82f79zgwflXLLEyAY8O4CYnlljfL6uJrzxxYeKgh1JQQbHE8gQ/dxBwz8qOSdeHDv5Ek2uJlVvZLGAlllhEAGTds8QCAiBqs8QCAiBqs8QCAiBqs8QCAiD6t2ad53ikB61//ReNWOCJNGj/nqPxc4g4+LTa4/x7bfkjQutH4c7A8NrxgE7AqtZdNWi53X0mxAKfq1hiAQEQtVliAQEQtVliAQEQtVliAQEQtVliAQEQtVliAQEQPQHGLZBMBnSlGQAAAABJRU5ErkJggg==";
	}
		
	getName () {return "ServerFolders";}

	getDescription () {return "Add pseudofolders to your serverlist to organize your servers.";}

	getVersion () {return "2.2.0";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		this.serverContextObserver = new MutationObserver((changes, _) => {
			changes.forEach(
				(change, i) => {
					if (change.addedNodes) {
						change.addedNodes.forEach((node) => {
							if (node.nodeType == 1 && node.className.includes("context-menu")) {
								this.onContextMenu(node);
							}
						});
					}
				}
			);
		});
		this.serverContextObserver.observe($("#app-mount>:first-child")[0], {childList: true});
		
		this.serverListObserver = new MutationObserver((changes, _) => {
			changes.forEach(
				(change, i) => {
					if (change.addedNodes) {
						change.addedNodes.forEach((node) => {
							if (node.className === "badge") {
								this.badgeObserver.observe(node, {characterData: true, characterDataOldValue:true, subtree: true });
								this.updateAllFolderBadges();
							}
						});
					}
					if (change.removedNodes) {
						change.removedNodes.forEach((node) => {
							if (node.className === "badge") {
								this.updateAllFolderBadges();
							}
						});
					}
				}
			);
		});
		this.serverListObserver.observe($(".guilds.scroller")[0], {childList: true, subtree:true});
		
		this.badgeObserver = new MutationObserver((changes, _) => {
			changes.forEach(
				(change, i) => {
					this.updateAllFolderBadges();
				}
			);
		});
		
		$(".badge:not(.folder)").each( 
			(i, badge) => {
				this.badgeObserver.observe(badge, {characterData: true, characterDataOldValue:true, subtree: true });
			}
		);
		
		this.serverListContextHandler = (e) => {	
			$(".guild.folder").each( 
				(i, folder) => {
					this.checkIfServerDivChangedTellIfDeleted(folder);
				}
			);
		};
		$(".guilds.scroller").bind('mouseleave', this.serverListContextHandler);
		
		$('head').append(this.css)
			.append("<script src='https://bgrins.github.io/spectrum/spectrum.js'></script>")
			.append("<link rel='stylesheet' href='https://bgrins.github.io/spectrum/spectrum.css' />");
		
		this.loadAllFolders();
		
		this.updateAllFolderBadges();
		
		var that = this;
		setTimeout(function() {
			that.labels = that.setLabelsByLanguage();
			that.changeLanguageStrings();
		},5000);
	}

	stop () {
		this.serverContextObserver.disconnect();
		this.serverListObserver.disconnect();
		this.badgeObserver.disconnect();
		$(".guilds.scroller").unbind('mouseleave', this.serverListContextHandler);
		$(".serverfolders").remove();
		$(".guild.folder").remove();
		
	}
	
	// begin of own functions

	getReactInstance (node) { 
		return node[Object.keys(node).find((key) => key.startsWith("__reactInternalInstance"))];
	}

	getReactObject (node) { 
		return ((inst) => (inst._currentElement._owner._instance))(this.getReactInstance(node));
	}

	changeLanguageStrings () {
		this.serverContextEntryMarkup = 	this.serverContextEntryMarkup.replace("REPLACE_servercontext_createfolder_text", this.labels.servercontext_createfolder_text);
		
		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_foldersettings_text", this.labels.foldercontext_foldersettings_text);
		this.folderContextMarkup = 			this.folderContextMarkup.replace("REPLACE_foldercontext_removefolder_text", this.labels.foldercontext_removefolder_text);
		
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_header_text", this.labels.modal_header_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_foldername_text", this.labels.modal_foldername_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_colorpicker1_text", this.labels.modal_colorpicker1_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_modal_colorpicker2_text", this.labels.modal_colorpicker2_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_btn_cancel_text", this.labels.btn_cancel_text);
		this.folderSettingsModalMarkup = 	this.folderSettingsModalMarkup.replace("REPLACE_btn_save_text", this.labels.btn_save_text);
	}
	
	onContextMenu (context) {
		var inst = this.getReactInstance(context);
		if (!inst) return;
		var ele = inst._currentElement;
		if (ele.props && ele.props.children) {
			var children = Array.isArray(ele.props.children) ? ele.props.children : [ele.props.children];
			for (var i = 0; i < children.length; i++) {
				if (children[i] && children[i].props && children[i].props.guild && children[i].type && children[i].type.displayName == "GuildLeaveGroup") {
					var { id, name } = children[i].props.guild;
					var data = { id, name, };
					$(context).append(this.serverContextEntryMarkup)
					.on("click", ".createfolder-item", data, this.createNewFolder.bind(this));
					break;
				}
			}
		}
	}
	
	createNewFolder (e) {
		$(e.delegateTarget).hide();
		var serverID = e.data.id;
		var serverDiv = this.getDivOfServer(serverID);
		if ($(serverDiv).prev()[0].className != "guild folder") {
			
			var folderDiv = $(this.folderIconMarkup);
			$(folderDiv).insertBefore(serverDiv)
				.find(".avatar-small")
				.attr("src", this.folderOpenIcon)
				.attr("id", "FL_ID_" + serverID)
				.attr("class", "avatar-small open")
				.on("click", this.changeIconAndServers.bind(this))
				.on("contextmenu", this.createFolderContextMenu.bind(this))
				.on("mouseenter", this.createFolderToolTip.bind(this))
				.on("mouseleave", this.deleteFolderToolTip.bind(this));
			
			var folderPlaced = 	true;
			var folderName = 	null;
			var isOpen = 		true;
			var openIcon = 		this.folderOpenIcon;
			var closedIcon = 	this.folderClosedIcon;
			var color1 = 		["0","0","0"];
			var color2 = 		["255","255","255"];
			
			this.saveSettings(serverID, {serverID,folderPlaced,folderName,isOpen,openIcon,closedIcon,color1,color2});
		}
	}
	
	createFolderToolTip (e) {
		if (e.target.name != "") {
			var folderTooltip = $(this.folderTooltipMarkup);
			$(".tooltips").append(folderTooltip);
			$(folderTooltip)
				.text(e.target.name)
				.css("left", (e.target.x + 50) + "px")
				.css("top", (e.target.y + 15) + "px");
		}
	}
	
	deleteFolderToolTip (e) {
		$(".tooltips").find(".guild-folder-tooltip").remove();
	}
	
	changeIconAndServers (e) {
		var folder = e.target;
		var folderDiv = this.getParentDivOfFolder(folder);
		
		var wasDeleted = this.checkIfServerDivChangedTellIfDeleted(folderDiv);
		
		if (!wasDeleted) {
			var id = this.getIdOfServer($(folderDiv).next()[0]);
			
			if (id) {
				var settings = this.loadSettings(id);
				if (settings) {
					var serverID = 		settings.serverID;
					var folderPlaced = 	settings.folderPlaced;
					var folderName = 	settings.folderName;
					var isOpen = 		!settings.isOpen;
					var openIcon = 		settings.openIcon;
					var closedIcon = 	settings.closedIcon;
					var color1 = 		settings.color1;
					var color2 = 		settings.color2;
					
					if (folderPlaced) {
						folder.className = isOpen ? "avatar-small open" : "avatar-small closed";
						folder.src = isOpen ? openIcon : closedIcon;
						
						var includedServers = this.getIncludedServers(folderDiv);
						this.hideAllServers(!isOpen, includedServers);
						
						this.saveSettings(serverID, {serverID,folderPlaced,folderName,isOpen,openIcon,closedIcon,color1,color2});
					}
				}
			}
		}
	}
	
	createFolderContextMenu (e) {
		this.selectedFolder = this.getParentDivOfFolder(e.target);
		
		var wasDeleted = this.checkIfServerDivChangedTellIfDeleted(this.selectedFolder);
		
		if (!wasDeleted) {
			var folderContext = $(this.folderContextMarkup);
			$("#app-mount>:first-child").append(folderContext)
				.off("click", ".foldersettings-item")
				.off("click", ".removefolder-item")
				.on("click", ".foldersettings-item", this.showFolderSettings.bind(this))
				.on("click", ".removefolder-item", this.removeSelectedFolder.bind(this))
				.on("click", ".removefolder-item,.foldersettings-item", function() {
					$(document).unbind('mousedown', folderContextEventHandler);
					folderContext[0].remove();
				});

			var theme = this.themeIsLightTheme() ? "" : "theme-dark";
			
			$(folderContext)
				.addClass(theme)
				.css("left", e.pageX + "px")
				.css("top", e.pageY + "px");
				
			var folderContextEventHandler = function(e) {	
				if (!folderContext[0].contains(e.target)) {
					$(document).unbind('mousedown', folderContextEventHandler);
					$(folderContext).remove();
					this.selectedFolder = null;
				}
			};
			$(document).bind('mousedown', folderContextEventHandler);
		}
	}
	
	showFolderSettings (e) {
		var id = this.getIdOfServer($(this.selectedFolder).next()[0]);
		if (id) {
			var serverID, folderPlaced, folderName, isOpen, openIcon, closedIcon, color1, color2;
			var settings = this.loadSettings(id);
			if (settings) {
				serverID = 		settings.serverID;
				folderPlaced = 	settings.folderPlaced;
				folderName = 	settings.folderName;
				isOpen = 		settings.isOpen;
				color1 = 		settings.color1;
				color2 = 		settings.color2;
				
				var folderSettingsModal = $(this.folderSettingsModalMarkup);
				folderSettingsModal.find("#modal-text")[0].value = folderName;
				this.setSwatches(color1, this.colourList, folderSettingsModal.find(".swatches1"), "swatch1");
				this.setSwatches(color2, this.colourList, folderSettingsModal.find(".swatches2"), "swatch2");
				folderSettingsModal.appendTo("#app-mount")
					.on("click", ".callout-backdrop,button.btn-cancel", (e) => {
						folderSettingsModal.remove();
						this.selectedFolder = null;
					})
					.on("submit", "form", (e) => {
						e.preventDefault();
						
						folderName = folderSettingsModal.find("#modal-text")[0].value;
						
						color1 = $(".ui-color-picker-swatch1.selected").css("backgroundColor").slice(4, -1).split(", ");
						color2 = $(".ui-color-picker-swatch2.selected").css("backgroundColor").slice(4, -1).split(", ");
						
						openIcon = this.changeImgColor(true, color1, color2);
						closedIcon = this.changeImgColor(false, color1, color2);
						
						$(this.selectedFolder).find(".avatar-small").attr("src", isOpen ? openIcon : closedIcon);
						$(this.selectedFolder).find(".avatar-small").attr("name", folderName);
						
						this.saveSettings(serverID, {serverID,folderPlaced,folderName,isOpen,openIcon,closedIcon,color1,color2});
						this.selectedFolder = null;
						folderSettingsModal.remove();
					});
					
				folderSettingsModal.find("#modal-text")[0].focus();
			}
		}
	}

	setSwatches (currentCOMP, colorOptions, wrapper, swatch) {
		var wrapperDiv = $(wrapper);
		
		var currentRGB = "rgb(" + (currentCOMP[0]) + ", " + (currentCOMP[1]) + ", " + (currentCOMP[2]) + ")";
        var currentHex = '#' + (0x1000000 + (currentCOMP[2] | (currentCOMP[1] << 8) | (currentCOMP[0] << 16))).toString(16).slice(1);
		
		var invColor = "rgb(" + (255-currentCOMP[0]) + ", " + (255-currentCOMP[1]) + ", " + (255-currentCOMP[2]) + ")";
		
		var selection = colorOptions.indexOf(currentRGB);
			
		var swatches = swatch == "swatch1" ?
			`<div class="ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap" style="flex: 1 1 auto; margin-top: 5px;">
				<div class="ui-color-picker-swatch1 large custom" style="background-color: rgb(0, 0, 0);"></div>
				<div class="regulars ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-wrap ui-color-picker-row" style="flex: 1 1 auto; display: flex; flex-wrap: wrap; overflow: visible !important;">
					${ colorOptions.map((val, i) => `<div class="ui-color-picker-swatch1" style="background-color: ${val};"></div>`).join("")}
				</div>
			</div>` :
			`<div class="ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap" style="flex: 1 1 auto; margin-top: 5px;">
				<div class="ui-color-picker-swatch2 large custom" style="background-color: rgb(255, 255, 255);"></div>
				<div class="regulars ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-wrap ui-color-picker-row" style="flex: 1 1 auto; display: flex; flex-wrap: wrap; overflow: visible !important;">
					${ colorOptions.map((val, i) => `<div class="ui-color-picker-swatch2" style="background-color: ${val};"></div>`).join("")}
				</div>
			</div>`;
		$(swatches).appendTo(wrapperDiv);
		
		if (selection > -1) {
			wrapperDiv.find(".regulars .ui-color-picker-"+ swatch).eq(selection)
				.addClass("selected")
				.css("background-color", currentRGB)
				.css("border", "4px solid " + invColor);
		} 
		else {
			$(".custom", wrapperDiv)
				.addClass("selected")
				.css("background-color", currentRGB)
				.css("border", "4px solid " + invColor);
		}
		
		wrapperDiv.on("click", ".ui-color-picker-"+ swatch +":not(.custom)", (e) => {
			var tempColor = $(e.target).css("background-color").slice(4, -1).split(", ");
			var newInvColor = "rgb(" + (255-tempColor[0]) + ", " + (255-tempColor[1]) + ", " + (255-tempColor[2]) + ")";
			
			wrapperDiv.find(".ui-color-picker-"+ swatch +".selected")
				.removeClass("selected")
				.css("border", "4px solid transparent");
			
			$(e.target)
				.addClass("selected")
				.css("border", "4px solid " + newInvColor);
		})
		var custom = $(".ui-color-picker-"+ swatch +".custom", wrapperDiv).spectrum({
			color: $(".custom", wrapperDiv).css("background-color"),
			preferredFormat: "rgb",
			clickoutFiresChange: true,
			showInput: true,
			showButtons: false,
			move: (color) => {
				var tempColor = color.toRgbString().slice(4, -1).split(", ");
				var newInvColor = "rgb(" + (255-tempColor[0]) + ", " + (255-tempColor[1]) + ", " + (255-tempColor[2]) + ")";
				
				$(".ui-color-picker-"+ swatch +".selected")
					.removeClass("selected")
					.css("border", "4px solid transparent");
				
				custom
					.addClass("selected")
					.css("background-color", color.toRgbString())
					.css("border", "4px solid " + newInvColor);
			}
		});
	}
	
	removeSelectedFolder (e) {
		var folderDiv = this.selectedFolder;
		var includedServers = this.getIncludedServers(folderDiv);
		this.hideAllServers(false, includedServers);
		
		var serverID = $(folderDiv).find(".avatar-small")[0].id.split("FL_ID_")[1];
		this.clearSettings(serverID);
		
		folderDiv.remove();
		
		this.selectedFolder = null;
	}
	
	loadFolder (server) {
		var id = this.getIdOfServer(server);
		if (id) {
			var serverID, folderPlaced, folderName, isOpen, openIcon, closedIcon, color1, color2;
			var settings = this.loadSettings(id);
			if (settings) {
				serverID = 		settings.serverID;
				folderPlaced = 	settings.folderPlaced;
				folderName = 	settings.folderName;
				isOpen = 		settings.isOpen;
				openIcon = 		settings.openIcon;
				closedIcon = 	settings.closedIcon;
				color1 = 		settings.color1;
				color2 = 		settings.color2;
				
				if (folderPlaced) {
					var serverDiv = this.getDivOfServer(serverID);
					
					var folderDiv = $(this.folderIconMarkup);				
					$(folderDiv).insertBefore(serverDiv)
						.find(".avatar-small")
						.attr("src", isOpen ? openIcon : closedIcon)
						.attr("name", folderName)
						.attr("id", "FL_ID_" + serverID)
						.attr("class", isOpen ? "avatar-small open" : "avatar-small closed")
						.on("click", this.changeIconAndServers.bind(this))
						.on("contextmenu", this.createFolderContextMenu.bind(this))
						.on("mouseenter", this.createFolderToolTip.bind(this))
						.on("mouseleave", this.deleteFolderToolTip.bind(this));
					
					var includedServers = this.getIncludedServers(folderDiv);
					
					// seems like the icons are loaded too slowly, didn't get hidden without a little delay
					var that = this;
					setTimeout(function() {
						that.hideAllServers(!isOpen, includedServers);
					},1000);
				}
			}
			else {
				serverID = 		id;
				folderPlaced = 	false;
				folderName = 	null;
				isOpen = 		null;
				openIcon = 		null;
				closedIcon = 	null;
				color1 = 		null;
				color2 = 		null;
				this.saveSettings(serverID, {serverID,folderPlaced,folderName,isOpen,openIcon,closedIcon,color1,color2});
			}
		}
	}
	
	loadAllFolders () {
		var servers = this.readServerList();
		for (var i = 0; i < servers.length; i++) {
			this.loadFolder(servers[i]);
		}
	}
	
	updateFolderBadge (folderDiv) {
		var includedServers = this.getIncludedServers(folderDiv);
		var badgeAmount = 0;
		$(includedServers).each(  
			(i, server) => {
				var thisBadge = parseInt($(server).find(".badge").text());
				if (thisBadge > 0) {
					badgeAmount += thisBadge;
				}
			}
		);
		if (badgeAmount > 0) {
			$(folderDiv).find(".folder.badge").show();
			$(folderDiv).find(".folder.badge").text(badgeAmount);
		}
		else {
			$(folderDiv).find(".folder.badge").hide();
		}
	}
	
	updateAllFolderBadges () {
		var folders = document.getElementsByClassName("guild folder");
		for (var i = 0; folders.length > i; i++) {
			this.updateFolderBadge(folders[i]);
		}
		
	}
	
	checkIfServerDivChangedTellIfDeleted (folderDiv) {
		var folder = $(folderDiv).find(".avatar-small")[0];
		var folderID = folder.id.split("FL_ID_")[1];
		var id = this.getIdOfServer($(folderDiv).next()[0]);
		
		if (id) {
			if (id != folderID) {
				var settings = this.loadSettings(folderID);
				if (settings) {
					folder.id = "FL_ID_" + id;
					
					var serverID = 		id;
					var folderPlaced = 	settings.folderPlaced;
					var folderName = 	settings.folderName;
					var isOpen = 		settings.isOpen;
					var openIcon = 		settings.openIcon;
					var closedIcon = 	settings.closedIcon;
					var color1 = 		settings.color1;
					var color2 = 		settings.color2;
					
					this.saveSettings(serverID, {serverID,folderPlaced,folderName,isOpen,openIcon,closedIcon,color1,color2});
					this.clearSettings(folderID);
				}
			}
			return false;
		}
		else {
			this.selectedFolder = folderDiv;
			this.removeSelectedFolder();
			
			return true;
		}
	}
	
	getIncludedServers (folder) {
		var nextServers = $(folder).nextAll();
		var includedServers = [];
		for (var i = 0; nextServers.length > i; i++) {
			var serverInst = this.getReactInstance(nextServers[i]);
			if (serverInst && serverInst._currentElement && serverInst._currentElement._owner && serverInst._currentElement._owner._instance) {
				var serverObj = serverInst._currentElement._owner._instance;
				if (serverObj && serverObj.props && serverObj.props.guild) {
					includedServers.push(nextServers[i]);
				}
			}
			else {
				break;
			}
		}
		return includedServers;
	}
	
	getParentDivOfFolder (div) {
		var folders = document.getElementsByClassName("guild folder");
		var foundFolder;
		for (var i = 0; folders.length > i; i++) {
			if (folders[i].contains(div)) {
				foundFolder = folders[i];
				break;
			}
		}
		return foundFolder;
	}
	
	hideAllServers (hide, servers) {
		for (var i = 0; servers.length > i; i++) {
			servers[i].hidden = hide;
		}
	}
	
	getDivOfServer (serverID) {
		var servers = this.readServerList();
		for (var i = 0; i < servers.length; i++) {
			var childNodes = servers[i].getElementsByTagName("*");
			for (var j = 0; j < childNodes.length; j++) {
				if (childNodes[j].href) {
					if (childNodes[j].href.split("/")[4] == serverID) {
						return servers[i];
					}
				}
			}
		}
		return null;
	}
	
	readServerList () {
		var foundServers = [];
		var servers = document.getElementsByClassName("guild");
		for (var i = 0; i < servers.length; i++) {
			var serverInst = this.getReactInstance(servers[i]);
			if (serverInst && serverInst._currentElement && serverInst._currentElement._owner && serverInst._currentElement._owner._instance) {
				var serverObj = serverInst._currentElement._owner._instance;
				if (serverObj && serverObj.props && serverObj.props.guild) {
					foundServers.push(servers[i]);
				}
			}
		}
		return foundServers;
	}
	
	getIdOfServer (server) {
		var inst = this.getReactInstance(server);
		if (!inst) return null;
		var curEle = inst._currentElement;
			if (curEle && curEle._owner && curEle._owner._instance) {
			var serverInfo = this.checkForServerInformation(curEle); 
			if (serverInfo && serverInfo.id) {
				return serverInfo.id;
			}
			else {
				return null;
			}
		}
		else {
			return null;
		}
	}
	
	checkForServerInformation (ele) {
		if (ele && ele.props && ele.props.guild){
			return ele.props.guild;
		}
		else if (ele && ele.props && ele.props.children){
			var children = Array.isArray(ele.props.children) ? ele.props.children : [ele.props.children];
			var i;
			var result = null;
			for (i = 0; result == null && i < children.length; i++){
				result = this.checkForServerInformation(children[i]);
			}
			return result;
		}
		else {
			return null;
		}
	}
	
	themeIsLightTheme () {
		if ($(".theme-light").length > $(".theme-dark").length) {
			return true;
		}
		else {
			return false;
		}
	}
	
	changeImgColor (isOpen, color1, color2) {
		var img = new Image();
		img.src = isOpen ? this.folderOpenIcon : this.folderClosedIcon;
		var can = document.createElement('canvas');
		can.width = img.width;
		can.height = img.height;
		var ctx = can.getContext('2d');
		ctx.drawImage(img, 0, 0);
		var imageData = ctx.getImageData(0, 0, img.width, img.height);
		var data = imageData.data;
		for (var i = 0; i < data.length; i += 4) {
			if (data[i] == 0 && data[i + 1] == 0 && data[i + 2] == 0) {
				data[i] = color1[0];
				data[i + 1] = color1[1];
				data[i + 2] = color1[2];
			}
			else if (data[i] == 255 && data[i + 1] == 255 && data[i + 2] == 255) {
				data[i] = color2[0];
				data[i + 1] = color2[1];
				data[i + 2] = color2[2];
			}
			// overwrite original image
			ctx.putImageData(imageData, 0, 0);
		}
		return can.toDataURL("image/png");
	}
	
	saveSettings (serverID, settings) {
		bdPluginStorage.set(this.getName(), serverID, JSON.stringify(settings));
	}

	loadSettings (serverID) {
		return JSON.parse(bdPluginStorage.get(this.getName(), serverID));
	}
	
	clearSettings (serverID) {
		var folderPlaced = 	false;
		var folderName = 	null;
		var isOpen = 		null;
		var openIcon = 		null;
		var closedIcon = 	null;
		var color1 = 		null;
		var color2 = 		null;
		this.saveSettings(serverID, {serverID,folderPlaced,folderName,isOpen,openIcon,closedIcon,color1,color2});
	}
	
	setLabelsByLanguage () {
		switch (document.getElementsByTagName("html")[0].lang.split("-")[0]) {
			case "da": 		//danish
				return {
					servercontext_createfolder_text: 	"Opret mappe",
					foldercontext_foldersettings_text: 	"Mappeindstillinger",
					foldercontext_removefolder_text:	"Slet mappe",
					modal_header_text:					"Mappindstillinger",
					modal_foldername_text:				"Mappenavn",
					modal_colorpicker1_text:			"Primær mappefarve",
					modal_colorpicker2_text:			"Sekundær mappefarve",
					btn_cancel_text:					"Afbryde",
					btn_save_text:						"Spare"
				};
			case "de": 		//german
				return {
					servercontext_createfolder_text: 	"Erzeuge Ordner",
					foldercontext_foldersettings_text: 	"Ordnereinstellungen",
					foldercontext_removefolder_text:	"Lösche Ordner",
					modal_header_text:					"Ordnereinstellungen",
					modal_foldername_text:				"Ordnername",
					modal_colorpicker1_text:			"Primäre Ordnerfarbe",
					modal_colorpicker2_text:			"Sekundäre Ordnerfarbe",
					btn_cancel_text:					"Abbrechen",
					btn_save_text:						"Speichern"
				};
			case "es": 		//spanish
				return {
					servercontext_createfolder_text: 	"Crear carpeta",
					foldercontext_foldersettings_text: 	"Ajustes de carpeta",
					foldercontext_removefolder_text:	"Eliminar carpeta",
					modal_header_text:					"Ajustes de carpeta",
					modal_foldername_text:				"Nombre de la carpeta",
					modal_colorpicker1_text:			"Color primaria de carpeta",
					modal_colorpicker2_text:			"Color secundario de la carpeta",
					btn_cancel_text:					"Cancelar",
					btn_save_text:						"Guardar"
				};
			case "fr": 		//french
				return {
					servercontext_createfolder_text: 	"Créer le dossier",
					foldercontext_foldersettings_text: 	"Paramètres du dossier",
					foldercontext_removefolder_text:	"Supprimer le dossier",
					modal_header_text:					"Paramètres du dossier",
					modal_foldername_text:				"Nom de dossier",
					modal_colorpicker1_text:			"Couleur primaire du dossier",
					modal_colorpicker2_text:			"Couleur secondaire du dossier",
					btn_cancel_text:					"Abandonner",
					btn_save_text:						"Enregistrer"
				};
			case "it": 		//italian
				return {
					servercontext_createfolder_text: 	"Creare una cartella",
					foldercontext_foldersettings_text: 	"Impostazioni cartella",
					foldercontext_removefolder_text:	"Elimina cartella",
					modal_header_text:					"Impostazioni cartella",
					modal_foldername_text:				"Nome della cartella",
					modal_colorpicker1_text:			"Colore primaria della cartella",
					modal_colorpicker2_text:			"Colore secondaria della cartella",
					btn_cancel_text:					"Cancellare",
					btn_save_text:						"Salvare"
				};
			case "nl":		//dutch
				return {
					servercontext_createfolder_text: 	"Map aanmaken",
					foldercontext_foldersettings_text: 	"Mapinstellingen",
					foldercontext_removefolder_text:	"Verwijder map",
					modal_header_text:					"Mapinstellingen",
					modal_foldername_text:				"Mapnaam",
					modal_colorpicker1_text:			"Primaire map kleur",
					modal_colorpicker2_text:			"Tweede map kleur",
					btn_cancel_text:					"Afbreken",
					btn_save_text:						"Opslaan"
				};
			case "no":		//norwegian
				return {
					servercontext_createfolder_text: 	"Lag mappe",
					foldercontext_foldersettings_text: 	"Mappinnstillinger",
					foldercontext_removefolder_text:	"Slett mappe",
					modal_header_text:					"Mappinnstillinger",
					modal_foldername_text:				"Mappenavn",
					modal_colorpicker1_text:			"Primær mappefarge",
					modal_colorpicker2_text:			"Sekundær mappefarge",
					btn_cancel_text:					"Avbryte",
					btn_save_text:						"Lagre"
				};
			case "pl":		//polish
				return {
					servercontext_createfolder_text: 	"Utwórz folder",
					foldercontext_foldersettings_text: 	"Ustawienia folderu",
					foldercontext_removefolder_text:	"Usuń folder",
					modal_header_text:					"Ustawienia folderu",
					modal_foldername_text:				"Nazwa folderu",
					modal_colorpicker1_text:			"Podstawowy kolor folderu",
					modal_colorpicker2_text:			"Drugorzędny kolor folderu",
					btn_cancel_text:					"Anuluj",
					btn_save_text:						"Zapisz"
				};
			case "pt":		//portuguese (brazil)
				return {
					servercontext_createfolder_text: 	"Criar pasta",
					foldercontext_foldersettings_text: 	"Configurações da pasta",
					foldercontext_removefolder_text:	"Excluir pasta",
					modal_header_text:					"Configurações da pasta",
					modal_foldername_text:				"Nome da pasta",
					modal_colorpicker1_text:			"Cor primária da pasta",
					modal_colorpicker2_text:			"Cor secundária da pasta",
					btn_cancel_text:					"Cancelar",
					btn_save_text:						"Salvar"
				};
			case "fi":		//finnish
				return {
					servercontext_createfolder_text: 	"Luo kansio",
					foldercontext_foldersettings_text: 	"Kansion kansio",
					foldercontext_removefolder_text:	"Poista kansio",
					modal_header_text:					"Kansion kansio",
					modal_foldername_text:				"Kansion nimi",
					modal_colorpicker1_text:			"Ensisijainen kansion väri",
					modal_colorpicker2_text:			"Toissijainen kansion väri",
					btn_cancel_text:					"Peruuttaa",
					btn_save_text:						"Tallentaa"
				};
			case "sv":		//swedish
				return {
					servercontext_createfolder_text: 	"Skapa mapp",
					foldercontext_foldersettings_text: 	"Mappinställningar",
					foldercontext_removefolder_text:	"Ta bort mapp",
					modal_header_text:					"Mappinställningar",
					modal_foldername_text:				"Mappnamn",
					modal_colorpicker1_text:			"Primär mappfärg",
					modal_colorpicker2_text:			"Sekundär mappfärg",
					btn_cancel_text:					"Avbryta",
					btn_save_text:						"Spara"
				};
			case "tr":		//turkish
				return {
					servercontext_createfolder_text: 	"Klasör oluşturun",
					foldercontext_foldersettings_text: 	"Klasör Ayarları",
					foldercontext_removefolder_text:	"Klasörü sil",
					modal_header_text:					"Klasör Ayarları",
					modal_foldername_text:				"Klasör adı",
					modal_colorpicker1_text:			"Birincil klasör rengi",
					modal_colorpicker2_text:			"İkincil klasör rengi",
					btn_cancel_text:					"Iptal",
					btn_save_text:						"Kayıt"
				};
			case "cs":		//czech
				return {
					servercontext_createfolder_text: 	"Vytvořit složky",
					foldercontext_foldersettings_text: 	"Nastavení složky",
					foldercontext_removefolder_text:	"Smazat složky",
					modal_header_text:					"Nastavení složky",
					modal_foldername_text:				"Název složky",
					modal_colorpicker1_text:			"Primární barva složky",
					modal_colorpicker2_text:			"Sekundární barva složky",
					btn_cancel_text:					"Zrušení",
					btn_save_text:						"Uložit"
				};
			case "bg":		//bulgarian
				return {
					servercontext_createfolder_text: 	"Създай папка",
					foldercontext_foldersettings_text: 	"Настройки папка",
					foldercontext_removefolder_text:	"Изтриване на папка",
					modal_header_text:					"Настройки папка",
					modal_foldername_text:				"Име на папка",
					modal_colorpicker1_text:			"Цвят основнен на папка",
					modal_colorpicker2_text:			"цвят вторичен на папка",
					btn_cancel_text:					"Зъбести",
					btn_save_text:						"Cпасяване"
				};
			case "ru":		//russian
				return {
					servercontext_createfolder_text: 	"Создать папки",
					foldercontext_foldersettings_text: 	"Настройки папки",
					foldercontext_removefolder_text:	"Удалить папки",
					modal_header_text:					"Настройки папки",
					modal_foldername_text:				"Имя папки",
					modal_colorpicker1_text:			"Цвет основной папки",
					modal_colorpicker2_text:			"Цвет вторичной папки",
					btn_cancel_text:					"Отмена",
					btn_save_text:						"Cпасти"
				};
			case "uk":		//ukranian
				return {
					servercontext_createfolder_text: 	"Створити папки",
					foldercontext_foldersettings_text: 	"Параметри папки",
					foldercontext_removefolder_text:	"Видалити папки",
					modal_header_text:					"Параметри папки",
					modal_foldername_text:				"Ім'я папки",
					modal_colorpicker1_text:			"Колір основної папки",
					modal_colorpicker2_text:			"Колір вторинного папки",
					btn_cancel_text:					"Скасувати",
					btn_save_text:						"Зберегти"
				};
			case "ja":		//japanese
				return {
					servercontext_createfolder_text: 	"フォルダーを作る",
					foldercontext_foldersettings_text: 	"フォルダ設定",
					foldercontext_removefolder_text:	"フォルダを削除する",
					modal_header_text:					"フォルダ設定",
					modal_foldername_text:				"フォルダ名",
					modal_colorpicker1_text:			"プライマリフォルダの色",
					modal_colorpicker2_text:			"セカンダリフォルダの色",
					btn_cancel_text:					"キャンセル",
					btn_save_text:						"セーブ"
				};
			case "zh":		//chinese (traditional)
				return {
					servercontext_createfolder_text: 	"創建文件夾",
					foldercontext_foldersettings_text: 	"文件夾設置",
					foldercontext_removefolder_text:	"刪除文件夾",
					modal_header_text:					"文件夾設置",
					modal_foldername_text:				"文件夾名稱",
					modal_colorpicker1_text:			"主文件夾顏色",
					modal_colorpicker2_text:			"輔助文件夾顏色",
					btn_cancel_text:					"取消",
					btn_save_text:						"保存"
				};
			case "ko":		//korean
				return {
					servercontext_createfolder_text: 	"폴더 만들기",
					foldercontext_foldersettings_text: 	"폴더 설정",
					foldercontext_removefolder_text:	"폴더 삭제",
					modal_header_text:					"폴더 설정",
					modal_foldername_text:				"폴더 이름",
					modal_colorpicker1_text:			"기본 폴더 색",
					modal_colorpicker2_text:			"보조 폴더 색",
					btn_cancel_text:					"취소",
					btn_save_text:						"저장"
				};
			default:		//default: english
				return {
					servercontext_createfolder_text: 	"Create Folder",
					foldercontext_foldersettings_text: 	"Foldersettings",
					foldercontext_removefolder_text:	"Delete Folder",
					modal_header_text:					"Foldersettings",
					modal_foldername_text:				"Foldername",
					modal_colorpicker1_text:			"Primary Foldercolor",
					modal_colorpicker2_text:			"Secondary Foldercolor",
					btn_cancel_text:					"Cancel",
					btn_save_text:						"Save"
				};
		}
	}
}
