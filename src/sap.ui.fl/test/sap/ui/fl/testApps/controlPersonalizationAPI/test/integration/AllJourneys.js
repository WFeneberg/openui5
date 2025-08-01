sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/fl/testApps/controlPersonalizationAPI/test/integration/arrangements/Startup",
	"test-resources/sap/ui/fl/testApps/controlPersonalizationAPI/test/integration/PersonalizationAPIJourney"
], function(Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		viewNamespace: "test.sap.ui.fl.testApps.controlPersonalizationAPIChanges.view.",
		autoWait: true
	});
});