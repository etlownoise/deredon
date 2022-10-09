
module.exports = function(RED) {
    "use strict";
    function BitFlip(n) {
        RED.nodes.createNode(this,n);
        this.property = n.property || "payload";
        var node = this;
       

        this.on("input", function(msg) {
            var value = RED.util.getMessageProperty(msg,node.property);
			var tvalue = "";
            if (value !== undefined) {
                if (typeof(value)=="string") {
				   var ran  = Math.floor(Math.random() * (value.length-1));
				   var mask  = (1 << ran);
				
				   tvalue = value.split('');
				   tvalue[ran] = String.fromCharCode((parseInt(tvalue[ran],2) ^ mask));
				   value = tvalue.join('');
				}
				else if (typeof(value)=="number") {
				   	tvalue = value.toString(2).split('');
					
					
					var ran  = Math.floor(Math.random() * (tvalue.length-1));
					
				  
					if (tvalue[ran] == '1') {
					   tvalue[ran] = '0';
					}
					else {
					    tvalue[ran] = '1';
					}	
				
					
					value = parseInt(tvalue.join(''),2);
                    					
				}
                else {
                    node.warn(RED._("bitflip.warn.undefinedtype"));
                }					
                               
       	        RED.util.setMessageProperty(msg,node.property,value);
                node.send(msg);
                
            }
            else { node.warn(RED._("bitflip.warn.noproperty")); }
        });
    }
    RED.nodes.registerType("bitflip",BitFlip);
}
