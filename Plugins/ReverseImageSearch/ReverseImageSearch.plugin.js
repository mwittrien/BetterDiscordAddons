//META{"name":"ReverseImageSearch"}*//

class ReverseImageSearch {
	constructor () {
		
		this.messageContextObserver;

		this.messageContextEntryMarkup =
			`<div class="item-group">
				<div class="item reverseimagesearch-item">
					<span>Reverse Image Search</span>
					<div class="hint"></div>
				</div>
			</div>`;
	}
		
	getName () {return "ReverseImageSearch";}

	getDescription () {return "Adds a reverse image search option to the context menu.";}

	getVersion () {return "1.1.0";}

	getAuthor () {return "DevilBro";}

	//legacy
	load () {}

	start () {
		this.messageContextObserver = new MutationObserver((changes, _) => {
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
		this.messageContextObserver.observe($("#app-mount>:first-child")[0], {childList: true});
	}

	stop () {
		this.messageContextObserver.disconnect();
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
				if (children[i] && children[i].props && children[i].props.src && children[i].type && children[i].type.displayName == "NativeLinkGroup") {
					var url = children[i].props.src;
					if (url.indexOf("https://discordapp.com/assets/") == -1) {
						
						if (url.indexOf("https://images-ext-1.discordapp.net/external/") > -1) {
							if (url.split("/https/").length != 1) {
								url = "https://" + url.split("/https/")[url.split("/https/").length-1];
							}
							else if (url.split("/http/").length != 1) {
								url = "http://" + url.split("/http/")[url.split("/http/").length-1];
							}
						}
							
						var data = {"url": url};
						$(context).append(this.messageContextEntryMarkup)
							.on("click", ".reverseimagesearch-item", data, this.reverseImageSearch.bind(this));
					}
				}
			}
		}
	}
	
	reverseImageSearch (e) {
		$(e.delegateTarget).hide();
		var imageurl = e.data.url;
		var searchurl = "https://images.google.com/searchbyimage?image_url=";
		window.open(searchurl+imageurl, "_blank");
	}
}
