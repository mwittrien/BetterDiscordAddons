//META{"name":"ServerFolders"}*//

class ServerFolders {
	constructor () {
		
		this.selectedFolder;
		
		this.folderIDs = {};
		
		this.serverContextObserver;

		this.serverContextEntryMarkup =
			`<div class="item-group">
				<div class="item createfolder-item">
					<span>Create Folder</span>
					<div class="hint"></div>
				</div>
			</div>`;
			
		this.folderContextMarkup = 
			`<div class="context-menu">
				<div class="item-group">
					<div class="item removefolder-item">
						<span>Remove Folder</span>
						<div class="hint"></div>
					</div>
				</div>
			</div>`;
			
		this.folderIconMarkup = 
			`<div class="guild folder">
				<div draggable="true">
					<div class="guild-inner" draggable="false" style="border-radius: 25px;">
						<a draggable="false" class="avatar-small"></a>
					</div>
				</div>
			</div>`;
			
			
		this.folderClosedIcon =	
			"url('data:image/png;base64,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')";
			
			
		this.folderOpenIcon = 
			"url('data:image/png;base64,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')";
	}
		
	getName () {return "ServerFolders";}

	getDescription () {return "Add pseudofolders to your serverlist to organize your servers.";}

	getVersion () {return "2.0.0";}

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
		
		this.loadAllFolders();
	}

	stop () {
		this.serverContextObserver.disconnect();
		$(".guild.folder").remove();
		
	}
	
	// begin of own functions

	getReactInstance (node) { 
		return node[Object.keys(node).find((key) => key.startsWith("__reactInternalInstance"))];
	}

	getReactObject (node) { 
		return ((inst) => (inst._currentElement._owner._instance))(this.getReactInstance(node));
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
					.on("click", ".createfolder-item", data, this.createNewFolder.bind(this))
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
			var folderID = "FLID" + (100000000000000+Math.round(Math.random()*899999999999999));
			while(this.folderIDs[folderID]) {
				folderID = "FLID" + (100000000000000+Math.round(Math.random()*899999999999999));
			}
			this.folderIDs[folderID] = true;
			
			var folderDiv = $(this.folderIconMarkup);
			$(folderDiv).insertBefore(serverDiv)
			.find(".avatar-small")
			.css("background-image", this.folderOpenIcon)
			.attr("id", folderID)
			.attr("class", "avatar-small open")
			.on("click", this.changeIconAndServers.bind(this))
			.on("contextmenu", this.createFolderContextMenu.bind(this));
			
			var isOpen = true;
			
			this.saveSettings(serverID, {serverID,folderID,isOpen});
		}
	}
	
	changeIconAndServers (e) {
		var folder = e.target;
		var isOpen = true;
		if (folder && folder.classList && folder.classList.contains("open")) {
			isOpen = false;
		}
		
		folder.className = isOpen ? "avatar-small open" : "avatar-small closed";
		folder.style.backgroundImage = isOpen ? this.folderOpenIcon : this.folderClosedIcon;
		var folderDiv = this.getParentDivOfFolder(folder);
		var includedServers = this.getIncludedServers(folderDiv);
		
		this.hideAllServers(!isOpen, includedServers);
		var serverID = this.getIdOfServer($(folderDiv).next()[0]);
		var folderID = folder.id;
		
		this.saveSettings(serverID, {serverID,folderID,isOpen});
	}
	
	createFolderContextMenu (e) {
		this.selectedFolder = this.getParentDivOfFolder(e.target);
		var folderContext = $(this.folderContextMarkup);
		$("#app-mount>:first-child").append(folderContext)
		.off("click", ".removefolder-item")
		.on("click", ".removefolder-item", this.removeFolder.bind(this))
		.on("click", ".removefolder-item", function() {
			$(document).unbind('mousedown', folderContextEventHandler);
			folderContext[0].remove();
		});

		folderContext[0].style.left = e.pageX + "px";
		folderContext[0].style.top = e.pageY + "px";
		if (!this.themeIsLightTheme()) {
			folderContext[0].className = "context-menu theme-dark";
		}
		var folderContextEventHandler = function(e) {	
			if (!folderContext[0].contains(e.target)) {
				$(document).unbind('mousedown', folderContextEventHandler);
				folderContext[0].remove();
				this.selectedFolder = null;
			}
		};
		$(document).bind('mousedown', folderContextEventHandler);
	}
	
	removeFolder (e) {
		var folderDiv = this.selectedFolder;
		var folderID = $(folderDiv).find(".avatar-small")[0].id;
		var includedServers = this.getIncludedServers(folderDiv);
		this.hideAllServers(false, includedServers);
		
		var serverID = this.getIdOfServer($(folderDiv).next()[0]);
		var folderID = null;
		var isOpen = null;
		this.saveSettings(serverID, {serverID,folderID,isOpen});
		
		delete this.folderIDs[folderID];
		folderDiv.remove();
		this.selectedFolder = null;
	}
	
	loadFolder (server) {
		var id = this.getIdOfServer(server);
		if (id) {
			var serverID, folderID, isOpen;
			var settings = this.loadSettings(id);
			if (settings) {
				serverID = settings.serverID;
				folderID = settings.folderID;
				isOpen = settings.isOpen;
				
				if (folderID) {
					var serverDiv = this.getDivOfServer(serverID);
					console.log(settings);
					
					var folderDiv = $(this.folderIconMarkup);				
					$(folderDiv).insertBefore(serverDiv)
					.find(".avatar-small")
					.css("background-image", isOpen ? this.folderOpenIcon : this.folderClosedIcon)
					.attr("id", folderID)
					.attr("class", isOpen ? "avatar-small open" : "avatar-small closed")
					.on("click", this.changeIconAndServers.bind(this))
					.on("contextmenu", this.createFolderContextMenu.bind(this));
					
					this.folderIDs[folderID] = true;
					
					var includedServers = this.getIncludedServers(folderDiv);
					console.log(includedServers);
					
					// seems like the icons are loaded too slowly, didn't get hidden without a little delay
					var that = this;
					setTimeout(function() {
						that.hideAllServers(!isOpen, includedServers);
					},1000);
				}
			}
			else {
				serverID = id;
				folderID = null;
				isOpen = null;
				this.saveSettings(serverID, {serverID,folderID,isOpen});
			}
		}
	}
	
	loadAllFolders () {
		var servers = this.readServerList();
		for (var i = 0; i < servers.length; i++) {
			this.loadFolder(servers[i]);
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
		var found = false;
		for (var i = 0; i < servers.length; i++) {
			var childNodes = servers[i].getElementsByTagName("*");
			for (var j = 0; j < childNodes.length; j++) {
				if (childNodes[j].href) {
					if (childNodes[j].href.split("/")[4] == serverID) {
						return servers[i];
						found = true;
					}
				}
				if (found) {
					break;
				}
			}
			if (found) {
				break;
			}
		}
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
		if (curEle) {
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
	
	saveSettings (serverID, settings) {
		bdPluginStorage.set(this.getName(), serverID, JSON.stringify(settings));
	}

	loadSettings (serverID) {
		return JSON.parse(bdPluginStorage.get(this.getName(), serverID));
	}
}
