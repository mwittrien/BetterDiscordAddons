//META{"name":"MoveablePopups","authorId":"278543574059057154","invite":"Jx3TjNS","donate":"https://www.paypal.me/MircoWittrien","patreon":"https://www.patreon.com/MircoWittrien","website":"https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/MoveablePopups","source":"https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Plugins/MoveablePopups/MoveablePopups.plugin.js"}*//

var MoveablePopups = (_ => {
	var dragging;
	
	return class MoveablePopups {
		getName () {return "MoveablePopups";}

		getVersion () {return "1.1.6";}

		getAuthor () {return "DevilBro";}

		getDescription () {return "Adds the feature to move all popups and modals around like on a normal desktop. Ctrl + drag with your left mousebutton to drag element.";}

		constructor () {
			this.changelog = {
				"improved":[["New Library Structure & React","Restructured my Library and switched to React rendering instead of DOM manipulation"]]
			};

			this.patchedModules = {
				after: {
					Popouts: "componentDidMount",
					ReferencePositionLayer: "componentDidMount",
					Modals: "componentDidMount",
					ModalLayer: "componentDidMount"
				}
			};
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

				BDFDB.ModuleUtils.forceAllUpdates(this);
			}
			else console.error(`%c[${this.getName()}]%c`, "color: #3a71c1; font-weight: 700;", "", "Fatal Error: Could not load BD functions!");
		}


		stop () {
			if (window.BDFDB && typeof BDFDB === "object" && BDFDB.loaded) {
				this.stopping = true;

				BDFDB.ModuleUtils.forceAllUpdates(this);
				
				BDFDB.PluginUtils.clear(this);
			}
		}


		// Begin of own functions
		
		processPopouts (e) {
			BDFDB.ObserverUtils.connect(this, e.node, {name:"popoutObserver", instance:new MutationObserver(changes => {changes.forEach(change => {change.addedNodes.forEach(node => {
				if (node && BDFDB.DOMUtils.containsClass(node, BDFDB.disCN.popout)) this.makeMoveable(node);
			})})})}, {childList: true});
		}
		
		processReferencePositionLayer (e) {
			this.makeMoveable(e.node);
		}
		
		processModals (e) {
			BDFDB.ObserverUtils.connect(this, e.node, {name:"modalObserver", instance:new MutationObserver(changes => {changes.forEach(change => {change.addedNodes.forEach(node => {
				if (node && !node.querySelector(BDFDB.dotCN.downloadlink)) this.makeMoveable(node.querySelector(BDFDB.dotCNC.modalinner + BDFDB.dotCN.layermodal));
				else if (node.tagName && !node.querySelector(BDFDB.dotCN.downloadlink)) this.makeMoveable(node.querySelector(BDFDB.dotCNC.modalinner + BDFDB.dotCN.layermodal));
			})})})}, {childList: true});
		}
		
		processModalLayer (e) {
			if (e.node && !e.node.querySelector(BDFDB.dotCN.downloadlink)) this.makeMoveable(e.node.querySelector(BDFDB.dotCNC.modalinner + BDFDB.dotCN.layermodal));
		}

		makeMoveable (div) {
			if (!Node.prototype.isPrototypeOf(div)) return;
			div.removeEventListener("click", div.clickMovablePopups);
			div.removeEventListener("mousedown", div.mousedownMovablePopups);
			div.clickMovablePopups = e => {if (dragging) BDFDB.ListenerUtils.stopEvent(e);};
			div.mousedownMovablePopups = e => {
				if (!e.ctrlKey) return;
				div.style.setProperty("position", "fixed", "important");
				dragging = true;
				var rects = BDFDB.DOMUtils.getRects(div);
				var transform = getComputedStyle(div, null).getPropertyValue("transform").replace(/[^0-9,-]/g,"").split(",");
				var left = rects.left - (transform.length > 4 ? parseFloat(transform[4]) : 0);
				var top = rects.top - (transform.length > 4 ? parseFloat(transform[5]) : 0);
				var oldX = e.pageX;
				var oldY = e.pageY;
				var mouseup = e2 => {
					BDFDB.DOMUtils.removeLocalStyle("disableTextSelection");
					document.removeEventListener("mouseup", mouseup);
					document.removeEventListener("mousemove", mousemove);
					BDFDB.TimeUtils.timeout(_ => {dragging = false});
				};
				var mousemove = e2 => {
					left = left - (oldX - e2.pageX);
					top = top - (oldY - e2.pageY);
					oldX = e2.pageX;
					oldY = e2.pageY;
					div.style.setProperty("left", left + "px", "important");
					div.style.setProperty("top", top + "px", "important");

				};
				document.addEventListener("mouseup", mouseup);
				document.addEventListener("mousemove", mousemove);
			};
			div.addEventListener("click", div.clickMovablePopups);
			div.addEventListener("mousedown", div.mousedownMovablePopups);
		}
	}
})();