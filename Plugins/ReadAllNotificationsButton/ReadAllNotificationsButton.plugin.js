//META{"name":"ReadAllNotificationsButton"}*//

class ReadAllNotificationsButton {
	constructor () {
		this.RANbuttonMarkup = 
			`<div class="guild" id="RANbutton-frame" style="height: 20px; margin-bottom: 10px;">
				<div class="guild-inner" style="height: 20px; border-radius: 4px;">
					<a>
						<div id="RANbutton" style="line-height: 20px; font-size: 12px;">read all</div>
					</a>
				</div>
			</div>`;
	}

	getName () {return "ReadAllNotificationsButton";}

	getDescription () {return "Adds a button to clear all notifications.";}

	getVersion () {return "1.0.0";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		var that = this;
		var readButton = $(this.RANbuttonMarkup);
		$(readButton).insertBefore(".guild-separator")
		.on("click", "#RANbutton", this.clearAllReadNotifications.bind(this));
	}

	stop () {
		$('.readallnotificationsbutton').remove();
		$("#RANbutton-frame").remove();
	}

	
	// begin of own functions

	getReactInstance (node) { 
		return node[Object.keys(node).find((key) => key.startsWith("__reactInternalInstance"))];
	}

	getReactObject (node) { 
		return ((inst) => (inst._currentElement._owner._instance))(this.getReactInstance(node));
	}
	
	clearAllReadNotifications () {
		var unreadServers = this.readUnreadServerList();
		unreadServers.forEach(
			(folder,i) => {
				var that = this;
				setTimeout(function() {
					var div = folder.firstElementChild;
					var divInst = that.getReactInstance(div);
					
					if (divInst && 
					divInst._renderedChildren && 
					divInst._renderedChildren[".0"] && 
					divInst._renderedChildren[".0"]._instance && 
					divInst._renderedChildren[".0"]._instance.handleContextMenu) {
						var data = {
							preventDefault: a=>a,
							stopPropagation: a=>a,
							pageX: -1000 + Math.round(Math.random()*500),
						};
						divInst._renderedChildren[".0"]._instance.handleContextMenu(data);
						
						var context = document.getElementsByClassName("context-menu")[0];
						$(".context-menu .item-group").each (
							(i,ele) => {
								var inst = that.getReactInstance(ele);
								if (inst) {
									var childIndex = -1;
									var curEle = inst._currentElement;
									if (curEle && curEle.props && curEle.props.children) {
										var children = Array.isArray(curEle.props.children) ? curEle.props.children : [curEle.props.children];
										children.forEach((child,i) => {
											if (child.type && child.type.displayName && child.type.displayName == "GuildMarkReadItem") {
												ele.children[i].click();
											}
										});
									}
								}
							}
						);
					}
				},i*100);
			}
		);
	}
	
	readUnreadServerList () {
		var foundServers = [];
		var servers = document.getElementsByClassName("guild");
		for (var i = 0; i < servers.length; i++) {
			var serverInst = this.getReactInstance(servers[i]);
			if (serverInst && serverInst._currentElement && serverInst._currentElement._owner && serverInst._currentElement._owner._instance) {
				var serverObj = serverInst._currentElement._owner._instance;
				if (serverObj && serverObj.props && serverObj.props.guild) {
					if (servers[i].classList.contains("unread") || servers[i].children[servers[i].childElementCount-1].className == "badge") {
						foundServers.push(servers[i]);
					}
				}
			}
		}
		return foundServers;
	}
}
