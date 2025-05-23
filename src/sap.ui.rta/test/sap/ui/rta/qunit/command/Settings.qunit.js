/* global QUnit */

sap.ui.define([
	"rta/test/qunit/command/basicCommandTest"
], function(
	basicCommandTest
) {
	"use strict";

	basicCommandTest({
		commandName: "settings",
		designtimeActionStructure: "settings",
		designtimeAction: false
	}, {
		changeType: "settings",
		content: {
			myFancy: "Content"
		}
	}, {
		changeType: "settings",
		content: {
			myFancy: "Content"
		}
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});
