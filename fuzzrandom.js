module.exports = function(RED) {
    "use strict";
    var Looper = require('loop');
	
	function randomString(length, chars) {
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
            return result;
    }

    function FuzzRandom(n) {
        RED.nodes.createNode(this, n);

        this.stype = n.stype || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\%\!\@\#\$\^\&\*\(\)\_\+\=\`\~\|\[\]\"\'\/\<\>\.\,\?';
        this.property = n.property || "payload";
		this.ssize = n.ssize || 1;
        this.units = n.units || "Second";
        this.duration = n.duration || 5;
        this.maxloops = n.maxloops || 100;
        this.maxtimeoutunits = n.maxtimeoutunits || "Hour";
        this.maxtimeout = n.maxtimeout || 1;
		

        if (this.duration <= 0) {
            this.duration = 0;
        } else {
            if (this.units == "Second") {
                this.duration = this.duration * 1000;
            }
            if (this.units == "Minute") {
                this.duration = this.duration * 1000 * 60;
            }
            if (this.units == "Hour") {
                this.duration = this.duration * 1000 * 60 * 60;
            }
        }

        if (this.maxtimeout <= 0) {
            this.maxtimeout = 0;
        } else {
            if (this.maxtimeoutunits == "Second") {
                this.maxtimeout = this.maxtimeout * 1000;
            }
            if (this.maxtimeoutunits == "Minute") {
                this.maxtimeout = this.maxtimeout * 1000 * 60;
            }
            if (this.maxtimeoutunits == "Hour") {
                this.maxtimeout = this.maxtimeout * 1000 * 60 * 60;
            }
        }

        var node = this;
        var loop = null;
        var timeout = null;
        var stopped = false;
        var cpmsg = null;
        var stopmsg = null;
        var mlmsg = null;
        this.on("input", function(msg) {
            loop = Looper();
            loop.setTimeout(node.maxtimeout);
            loop.setMaxLoop(node.maxloops);
            node.status({});
            if (stopped === false || msg._timerpass !== true) {
                stopped = false;
                clearTimeout(timeout);
                timeout = null;
                if (msg.payload == "stop" || msg.payload == "STOP") {
                    node.status({
                        fill: "red",
                        shape: "ring",
                        text: "stopped"
                    });
                    stopped = true;
                    stopmsg = RED.util.cloneMessage(msg);
                    stopmsg.payload = "stopped";
                    node.send([null, stopmsg]);
                    stopped = false;

                } else {
					cpmsg = RED.util.cloneMessage(msg);
					var rString = randomString(node.ssize, node.stype);
					//var rString ="asahjha";
					RED.util.setMessageProperty(cpmsg,node.property,rString);
                    //cpmsg.payload = rString;
                    node.send([cpmsg, null]);
                    msg._timerpass = true;
					
                    loop.run(function(next, err, data) {
                        node.status({
                            fill: "green",
                            shape: "dot",
                            text: "running"
                        });
                        data++;
						
						
                        timeout = setTimeout(function() {
                            if (stopped === false) {
                                cpmsg = RED.util.cloneMessage(msg);
								var rString = randomString(node.ssize, node.stype);
					            //var rString ="asahjha";
								
                                cpmsg.payload = rString;
								
								RED.util.setMessageProperty(cpmsg,node.property,rString);
								
                                if (data == node.maxloops) {
                                    mlmsg = RED.util.cloneMessage(msg);
                                    mlmsg.payload = "max loops reached";
                                    node.send([cpmsg, mlmsg]);
                                    node.status({
                                        fill: "red",
                                        shape: "ring",
                                        text: "max loops reached"
                                    });
                                    timeout = null;
                                    next("break");
                                } else {
                                    node.status({});
                                    if ((data * node.duration) <= node.maxtimeout) {
                                        node.send([cpmsg, null]);
                                        timeout = null;
                                        if (((data + 1) * node.duration) > node.maxtimeout) {
                                            next("break");
                                        } else {
                                            next(undefined, data);
                                        }
                                    } else {
                                        timeout = null;
                                        next("break");
                                    }
                                }
                            } else {
                                timeout = null;
                                next("break");
                            }
                        }, node.duration);
                    }, 0);
                }
            }
        });
        this.on("close", function() {
            stopped=false;
            if (timeout) {
                clearTimeout(timeout);
            }
            node.status({});
        });
    }
    RED.nodes.registerType("fuzzrandom", FuzzRandom);
}
