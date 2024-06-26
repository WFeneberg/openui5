sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/util/MockServer",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/OperationMode",
	"sap/m/ToolbarSpacer"
], function(Controller, MockServer, ODataModel, JSONModel, OperationMode, ToolbarSpacer) {
	"use strict";

	const sServiceUrl = "http://my.test.service.com/";

	return Controller.extend("sap.ui.table.sample.OData.Controller", {

		onInit: function() {
			this.oMockServer = new MockServer({
				rootUri: sServiceUrl
			});

			MockServer.config({autoRespondAfter: 2000});

			const sMockDataPath = sap.ui.require.toUrl("sap/ui/table/sample/OData");
			this.oMockServer.simulate(sMockDataPath + "/metadata.xml", {
				sMockdataBaseUrl: sMockDataPath,
				bGenerateMissingMockData: true
			});

			this.oMockServer.start();

			const oView = this.getView();
			this.oBusyIndicator = this.getTable().getNoData();
			oView.setModel(new ODataModel(sServiceUrl));

			this.initBindingEventHandler();

			const oUiData = {
				operationModes: [],
				selectedOperationMode: OperationMode.Server
			};
			for (const mode in OperationMode) {
				oUiData.operationModes.push({name: OperationMode[mode]});
			}
			oView.setModel(new JSONModel(oUiData), "ui");

			sap.ui.require(["sap/ui/table/sample/TableExampleUtils"], function(TableExampleUtils) {
				const oTb = oView.byId("infobar");
				oTb.addContent(new ToolbarSpacer());
				oTb.addContent(TableExampleUtils.createInfoButton("sap/ui/table/sample/OData"));
			}, function(oError) { /*ignore*/ });
		},

		onExit: function() {
			this.oBusyIndicator.destroy();
			this.oBusyIndicator = null;

			const oModel = this.getView().getModel();
			this.getView().setModel();
			oModel.destroy();

			this.oMockServer.destroy();
			this.oMockServer = null;
			MockServer.config({autoRespondAfter: 0});
		},

		formatDimensions: function(sWidth, sHeight, sDepth, sUnit) {
			if (sWidth && sHeight && sDepth && sUnit) {
				return sWidth + "x" + sHeight + "x" + sDepth + " " + (sUnit.toLowerCase());
			}
			return null;
		},

		getTable: function() {
			return this.byId("table");
		},

		onModelRefresh: function() {
			this.getTable().getBinding().refresh(true);
		},

		onOperationModeChange: function(oEvent) {
			this.getTable().bindRows({
				path: "/ProductSet",
				parameters: {operationMode: oEvent.getParameter("item").getKey()}
			});
			this.initBindingEventHandler();
			this.onModelRefresh();
		},

		initBindingEventHandler: function() {
			const oBusyIndicator = this.oBusyIndicator;
			const oTable = this.getTable();
			const oBinding = oTable.getBinding();

			oBinding.attachDataRequested(function() {
				oTable.setNoData(oBusyIndicator);
			});
			oBinding.attachDataReceived(function() {
				oTable.setNoData(null); //Use default again ("No Data" in case no data is available)
			});
		}

	});

});