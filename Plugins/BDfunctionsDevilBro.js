var BDfunctionsDevilBro = null;
if (typeof BDfunctionsDevilBroClass === "undefined") {
	class BDfunctionsDevilBroClass {};
	BDfunctionsDevilBroClass.test = function () {
		console.log("HI");
	};
	
	BDfunctionsDevilBro = new BDfunctionsDevilBroClass();
	console.log(BDfunctionsDevilBro);
}
else {
	alert("Fatal Error: Could not create FunctionClass.");
}
