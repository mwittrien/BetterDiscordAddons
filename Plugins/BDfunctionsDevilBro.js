var BDfunctionsDevilBro = {};
BDfunctionsDevilBro.test = function () {
	console.log("HI");
};
	
BDfunctionsDevilBro.getReactInstance = function (node) { 
	return node[Object.keys(node).find((key) => key.startsWith("__reactInternalInstance"))];
}

BDfunctionsDevilBro.getKeyInformation = function (node, key, value) {
	var inst = BDfunctionsDevilBro.getReactInstance(node);
	if (!inst) return null;
	var curEle = inst.memoizedProps || inst._currentElement;
	if (curEle) {
		return BDfunctionsDevilBro.searchKeyInReact(curEle, key, value); 
	}
	else {
		return null;
	}
}

BDfunctionsDevilBro.searchKeyInReact = function (ele, key, value) {
	if (!ele) return null;
	if (value === undefined) {
		if (ele[key] != null) 						return ele[key];
		if (ele.props && ele.props[key] != null) 	return ele.props[key];
		if (ele.type && ele.type[key] != null) 		return ele.type[key];
		if (ele.state && ele.state[key] != null) 	return ele.state[key];
	}
	else {
		if ((ele[key] === value) || (ele.props && ele.props[key] === value) || (ele.type && ele.type[key] === value) || (ele.state && ele.state[key] === value)) {
			return value;
		}
	}
	if (ele.children){
		var children = Array.isArray(ele.children) ? ele.children : [ele.children];
		var result = null;
		for (let i = 0; result === null && i < children.length; i++){
			result = BDfunctionsDevilBro.searchKeyInReact(children[i], key, value);
		}
		return result;
	}
	if (ele.props && ele.props.children){
		var children = Array.isArray(ele.props.children) ? ele.props.children : [ele.props.children];
		var result = null;
		for (let i = 0; result === null && i < children.length; i++){
			result = BDfunctionsDevilBro.searchKeyInReact(children[i], key, value);
		}
		return result;
	}
	return null;
}
