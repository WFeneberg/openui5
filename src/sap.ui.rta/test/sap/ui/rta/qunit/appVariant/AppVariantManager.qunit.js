/* global QUnit  */

sap.ui.define([
	"sap/ui/rta/appVariant/AppVariantManager",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/appVariant/AppVariantUtils",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/command/LREPSerializer",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/_internal/appVariant/AppVariantFactory",
	"sap/ui/fl/write/_internal/connectors/Utils",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/core/Control",
	"sap/ui/rta/appVariant/S4HanaCloudBackend",
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/AppVariantWriteAPI",
	"sap/ui/fl/apply/_internal/appVariant/DescriptorChangeTypes",
	"sap/ui/thirdparty/sinon-4",
	"test-resources/sap/ui/rta/qunit/RtaQunitUtils",
	"sap/ui/core/Element"
], function(
	AppVariantManager,
	RtaAppVariantFeature,
	AppVariantUtils,
	Stack,
	LREPSerializer,
	FlexRuntimeInfoAPI,
	AppVariantFactory,
	WriteUtils,
	Layer,
	FlUtils,
	Control,
	S4HanaCloudBackend,
	Log,
	MessageBox,
	ChangesWriteAPI,
	AppVariantWriteAPI,
	DescriptorChangeTypes,
	sinon,
	RtaQunitUtils,
	Element
) {
	"use strict";

	const sandbox = sinon.createSandbox();

	QUnit.module("Given an AppVariantManager is instantiated", {
		beforeEach() {
			const oRootControl = new Control();
			const oRtaCommandStack = new Stack();
			this.oCommandSerializer = new LREPSerializer({commandStack: oRtaCommandStack, rootControl: oRootControl});
			this.oAppVariantManager = new AppVariantManager({commandSerializer: this.oCommandSerializer, layer: Layer.CUSTOMER});
		},
		afterEach() {
			sandbox.restore();
			this.oAppVariantManager.destroy();
		}
	}, function() {
		QUnit.test("When _openDialog() method is called and create event is triggered", function(assert) {
			let bCreate = false;
			const fnCreate = function() {
				bCreate = true;
				this.destroy();
			};
			let fnCancel;

			this.oAppVariantManager._openDialog(fnCreate, fnCancel);
			const oAppVariantDialog = Element.getElementById("appVariantDialog");
			oAppVariantDialog.fireCreate();

			assert.equal(bCreate, true, "then the create event is correctly triggered");
		});

		QUnit.test("When _openDialog() method is called and cancel event is triggered", function(assert) {
			let bCancel = false;
			let fnCreate;
			const fnCancel = function() {
				bCancel = true;
				this.destroy();
			};

			this.oAppVariantManager._openDialog(fnCreate, fnCancel);
			const oAppVariantDialog = Element.getElementById("appVariantDialog");
			oAppVariantDialog.fireCancel();

			assert.equal(bCancel, true, "then the cancel event is correctly triggered");
		});

		QUnit.test("When processSaveAsDialog() method is called and key user provides the dialog input", function(assert) {
			const oManifest = {
				"sap.app": {
					id: "TestId",
					crossNavigation: {
						inbounds: {}
					}
				}
			};

			const fnSimulateDialogSelectionAndSave = function(fSave) {
				const oParameters = {
					title: "App Variant Title",
					subTitle: "App Variant Subtitle",
					description: "App Variant Description",
					icon: "App Variant Icon"
				};

				const oResult = {
					getParameters() {
						return oParameters;
					}
				};

				fSave(oResult);
			};

			const oOpenDialogStub = sandbox.stub(this.oAppVariantManager, "_openDialog").callsFake(fnSimulateDialogSelectionAndSave);

			return this.oAppVariantManager.processSaveAsDialog(oManifest).then(function(oAppVariantData) {
				assert.ok(oOpenDialogStub.calledOnce, "the _openDialog is called only once");
				assert.strictEqual(oAppVariantData.title, "App Variant Title", "then the title is correct");
				assert.strictEqual(oAppVariantData.subTitle, "App Variant Subtitle", "then the subtitle is correct");
				assert.strictEqual(oAppVariantData.description, "App Variant Description", "then the description is correct");
				assert.strictEqual(oAppVariantData.icon, "App Variant Icon", "then the icon is correct");
				assert.strictEqual(oAppVariantData.referenceAppId, "TestId", "then the running app id is correct");
			});
		});
	});

	let oServer;

	QUnit.module("Given an AppVariantManager is instantiated for different platforms", {
		beforeEach() {
			this.oAppComponent = RtaQunitUtils.createAndStubAppComponent(sandbox, "TestId");

			const oRtaCommandStack = new Stack();
			this.oCommandSerializer = new LREPSerializer({commandStack: oRtaCommandStack, rootControl: this.oAppComponent});
			this.oAppVariantManager = new AppVariantManager({commandSerializer: this.oCommandSerializer, layer: Layer.CUSTOMER});

			oServer = sinon.fakeServer.create();

			const oParsedHashStub = {
				semanticObject: "testSemanticObject",
				action: "testAction"
			};
			sandbox.stub(FlUtils, "getParsedURLHash").returns(oParsedHashStub);

			this.oAppVariantData = {
				description: "App Variant Description",
				referenceAppId: "TestId",
				title: "App Variant Title",
				subTitle: "App Variant Subtitle",
				icon: "App Variant Icon"
			};
		},
		afterEach() {
			sandbox.restore();
			this.oAppComponent.destroy();
			this.oAppVariantManager.destroy();
			oServer.restore();
		}
	}, function() {
		const assertChanges = function(assert, oAppVariantManager, oAppVariantData, oAppComponent, bAddNewInboundRequired) {
			sandbox.stub(AppVariantUtils, "getInboundInfo").returns(Promise.resolve({
				currentRunningInbound: "customer.savedAsAppVariant",
				addNewInboundRequired: bAddNewInboundRequired
			}));
			sandbox.stub(FlexRuntimeInfoAPI, "getFlexReference").returns("testComponent");
			const fnCreateChangesSpy = sandbox.spy(ChangesWriteAPI, "create");

			return oAppVariantManager.createAllInlineChanges(oAppVariantData, oAppComponent)
			.then(function(aAllInlineChanges) {
				assert.equal(fnCreateChangesSpy.callCount, aAllInlineChanges.length, `then ChangesWriteAPI.create method is called ${fnCreateChangesSpy.callCount} times`);
				aAllInlineChanges.forEach(function(oInlineChange) {
					const sChangeType = oInlineChange._oInlineChange.getMap().changeType;
					assert.equal(DescriptorChangeTypes.getChangeTypes().includes(sChangeType), true, `then inline change ${sChangeType} got successfully created`);
				});
				assert.equal(aAllInlineChanges.some(function(oInlineChange) {
					const sChangeType = oInlineChange._oInlineChange.getMap().changeType;
					return sChangeType === "appdescr_app_removeAllInboundsExceptOne";
				}), true, "inline changes include appdescr_app_removeAllInboundsExceptOne change");
			});
		};

		QUnit.test("When createAllInlineChanges() method is called with new inbound", function(assert) {
			return assertChanges(assert, this.oAppVariantManager, this.oAppVariantData, this.oAppComponent, false);
		});

		QUnit.test("When createAllInlineChanges() method is called with existing inbound", function(assert) {
			return assertChanges(assert, this.oAppVariantManager, this.oAppVariantData, this.oAppComponent, true);
		});

		QUnit.test("When notifyKeyUserWhenPublishingIsReady() method is called during app creation", function(assert) {
			const fnNotifyFlpCustomizingIsReadyStub = sandbox.stub(S4HanaCloudBackend.prototype, "notifyFlpCustomizingIsReady").resolves(true);
			const fncatchErrorDialog = sandbox.stub(AppVariantUtils, "catchErrorDialog");
			return this.oAppVariantManager.notifyKeyUserWhenPublishingIsReady("IamID", "AppvarID", true).then(function() {
				assert.ok(fnNotifyFlpCustomizingIsReadyStub.calledOnceWith("IamID", true), "then the function notifyFlpCustomizingIsReady() is called once and with right parameters");
				assert.ok(fncatchErrorDialog.notCalled, "then the function catchErrorDialog() is not called");
			});
		});

		QUnit.test("When notifyKeyUserWhenPublishingIsReady() method is called during app deletion", function(assert) {
			const fnNotifyFlpCustomizingIsReadyStub = sandbox.stub(S4HanaCloudBackend.prototype, "notifyFlpCustomizingIsReady").resolves(true);
			const fncatchErrorDialog = sandbox.stub(AppVariantUtils, "catchErrorDialog");
			return this.oAppVariantManager.notifyKeyUserWhenPublishingIsReady("IamID", "AppvarID", false).then(function() {
				assert.ok(fnNotifyFlpCustomizingIsReadyStub.calledOnceWith("IamID", false), "then the function notifyFlpCustomizingIsReady() is called once and with right parameters");
				assert.ok(fncatchErrorDialog.notCalled, "then the function catchErrorDialog() is not called");
			});
		});

		QUnit.test("When notifyKeyUserWhenPublishingIsReady() method is failed on S4/Hana Cloud", function(assert) {
			const checkFlpCustomizingIsReadyStub = sandbox.stub(S4HanaCloudBackend.prototype, "notifyFlpCustomizingIsReady").returns(Promise.reject());
			const fncatchErrorDialog = sandbox.spy(AppVariantUtils, "catchErrorDialog");
			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});
			return this.oAppVariantManager.notifyKeyUserWhenPublishingIsReady("IamID", "AppvarID", true).catch(
				function() {
					assert.ok(checkFlpCustomizingIsReadyStub.calledOnceWith("IamID", true), "then the method notifyFlpCustomizingIsReady is called once with correct parameters");
					assert.ok(fncatchErrorDialog.calledOnce, "then the function catchErrorDialog() is called once");
					assert.strictEqual(fncatchErrorDialog.getCall(0).args[1], "MSG_TILE_CREATION_FAILED", "then the function catchErrorDialog() is called with correct message key");
					assert.strictEqual(fncatchErrorDialog.getCall(0).args[2], "AppvarID", "then the function catchErrorDialog() is called with correct app const id");
				}
			);
		});
	});

	QUnit.module("Given an AppVariantManager is instantiated for different platforms", {
		beforeEach() {
			this.oRootControl = new Control();
			const oRtaCommandStack = new Stack();
			this.oCommandSerializer = new LREPSerializer({commandStack: oRtaCommandStack, rootControl: this.oRootControl});

			this.oAppVariantManager = new AppVariantManager({commandSerializer: this.oCommandSerializer, layer: Layer.CUSTOMER});
			oServer = sinon.fakeServer.create();
		},
		afterEach() {
			sandbox.restore();
			oServer.restore();
		}
	}, function() {
		QUnit.test("When createAppVariant() method is called", function(assert) {
			const fnSaveAsAppVariantStub = sandbox.stub(AppVariantWriteAPI, "saveAs").resolves();

			return this.oAppVariantManager.createAppVariant("customer.appvar.id", this.oRootControl)
			.then(function() {
				assert.ok(fnSaveAsAppVariantStub.calledWithExactly({selector: this.oRootControl, id: "customer.appvar.id", layer: Layer.CUSTOMER, version: "1.0.0"}));
			}.bind(this));
		});

		QUnit.test("When deleteAppVariant() method is called", function(assert) {
			const fnDeleteAppVariantStub = sandbox.stub(AppVariantWriteAPI, "deleteAppVariant").resolves();

			return this.oAppVariantManager.deleteAppVariant("customer.app.const.id")
			.then(function() {
				assert.ok(fnDeleteAppVariantStub.calledWithExactly({selector: {appId: "customer.app.const.id"}, layer: Layer.CUSTOMER}), "then AppVariantWriteApi.deleteAppVariant method is called with correct parameters");
			});
		});

		QUnit.test("When clearRTACommandStack() method is called without any unsaved changes", function(assert) {
			const fnClearCommandStackStub = sandbox.stub(this.oCommandSerializer, "clearCommandStack").resolves();
			return this.oAppVariantManager.clearRTACommandStack(false).then(function() {
				assert.ok("then the promise is resolved");
				assert.ok(fnClearCommandStackStub.notCalled, "then LREPSerializer.clearCommandStack is never called");
			});
		});

		QUnit.test("When clearRTACommandStack() method is called with some dirty changes", function(assert) {
			sandbox.stub(this.oCommandSerializer.getCommandStack(), "getAllExecutedCommands").returns(["firstCommand", "secondCommand"]);

			const fnClearCommandStackStub = sandbox.stub(this.oCommandSerializer, "clearCommandStack").resolves();

			return this.oAppVariantManager.clearRTACommandStack(true).then(function() {
				assert.ok("then the promise is resolved");
				assert.ok(fnClearCommandStackStub.calledOnce, "then LREPSerializer.clearCommandStack is called once");
			});
		});

		QUnit.test("When triggerCatalogPublishing() method is called on S4/Hana Cloud for catalog assignment", function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			const oResponse = {
				VariantId: "customer.TestId",
				IAMId: "IAMId",
				CatalogIds: ["TEST_CATALOG"]
			};

			const oSendRequestStub = sandbox.stub(WriteUtils, "sendRequest").resolves(oResponse);
			const fnTriggerCatalogAssignment = sandbox.spy(AppVariantUtils, "triggerCatalogAssignment");

			return AppVariantFactory.prepareCreate({id: "customer.TestId", reference: "TestIdBaseApp"})
			.then(function(oManifest) {
				return this.oAppVariantManager.triggerCatalogPublishing(oManifest.getId(), oManifest.getReference(), true);
			}.bind(this))
			.then(function(oResult) {
				assert.ok(fnTriggerCatalogAssignment.calledOnceWith("customer.TestId", Layer.CUSTOMER, "TestIdBaseApp"), "then the method triggerCatalogAssignment is called once with correct parameters");
				assert.ok(oSendRequestStub.calledOnceWith("/sap/bc/lrep/appdescr_variants/customer.TestId?action=assignCatalogs&assignFromAppId=TestIdBaseApp", "POST"), "then the sendRequest() method is called once and with right parameters");
				assert.strictEqual(oResult.IAMId, "IAMId", "then the IAM id is correct");
				assert.strictEqual(oResult.VariantId, "customer.TestId", "then the variant id is correct");
				assert.strictEqual(oResult.CatalogIds[0], "TEST_CATALOG", "then the new app variant has been added to a correct catalog ");
			});
		});

		QUnit.test("When triggerCatalogPublishing() method is called on S4/Hana Cloud for catalog unassignment", function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			const oResponse = {
				IAMId: "IAMId",
				inProgress: true
			};

			const oSendRequestStub = sandbox.stub(WriteUtils, "sendRequest").resolves(oResponse);
			const fnTriggerCatalogUnAssignment = sandbox.spy(AppVariantUtils, "triggerCatalogUnAssignment");

			return AppVariantFactory.prepareCreate({id: "customer.TestId", reference: "TestIdBaseApp"})
			.then(function(oManifest) {
				return this.oAppVariantManager.triggerCatalogPublishing(oManifest.getId(), oManifest.getReference(), false);
			}.bind(this))
			.then(function(oResult) {
				assert.ok(fnTriggerCatalogUnAssignment.calledOnceWith("customer.TestId", Layer.CUSTOMER, "TestIdBaseApp"), "then the method triggerCatalogUnAssignment is called once with correct parameters");
				assert.ok(oSendRequestStub.calledOnceWith("/sap/bc/lrep/appdescr_variants/customer.TestId?action=unassignCatalogs", "POST"), "then the sendRequest() method is called once and with right parameters");
				assert.strictEqual(oResult.IAMId, "IAMId", "then the IAM id is correct");
				assert.strictEqual(oResult.inProgress, true, "then the inProgress property is true");
			});
		});

		QUnit.test("When triggerCatalogPublishing() method is called on S4/Hana Cloud for catalog assignment and response is failed", function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			const oSendRequestStub = sandbox.stub(WriteUtils, "sendRequest").returns(Promise.reject("Error"));

			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "error").returns();

			const fnShowRelevantDialog = sandbox.spy(AppVariantUtils, "showRelevantDialog");
			const oErrorInfo = {appVariantId: "customer.TestId"};
			const fnBuildErrorInfoStub = sandbox.stub(AppVariantUtils, "buildErrorInfo").returns(oErrorInfo);
			const fncatchErrorDialog = sandbox.spy(AppVariantUtils, "catchErrorDialog");
			const fnTriggerCatalogAssignment = sandbox.spy(AppVariantUtils, "triggerCatalogAssignment");

			return AppVariantFactory.prepareCreate({id: "customer.TestId", reference: "TestIdBaseApp"})
			.then(function(oManifest) {
				return this.oAppVariantManager.triggerCatalogPublishing(oManifest.getId(), oManifest.getReference(), true);
			}.bind(this))
			.then(function() {
				assert.ok(fnTriggerCatalogAssignment.calledOnceWith("customer.TestId", Layer.CUSTOMER, "TestIdBaseApp"), "then the method triggerCatalogAssignment is called once with correct parameters");
				assert.ok(oSendRequestStub.calledOnceWith("/sap/bc/lrep/appdescr_variants/customer.TestId?action=assignCatalogs&assignFromAppId=TestIdBaseApp", "POST"), "then the sendRequest() method is called once and with right parameters");
				assert.ok(fncatchErrorDialog.calledOnce, "then the fncatchErrorDialog method is called once");
				assert.strictEqual(fncatchErrorDialog.getCall(0).args[1], "MSG_CATALOG_ASSIGNMENT_FAILED", "then the fncatchErrorDialog method is called with correct message key");
				assert.strictEqual(fncatchErrorDialog.getCall(0).args[2], "customer.TestId", "then the fncatchErrorDialog method is called with correct app const id");
				assert.ok(fnBuildErrorInfoStub.calledOnce, "then the buildErrorInfo method is called once");
				assert.ok(fnShowRelevantDialog.calledOnceWith(oErrorInfo, false), "then the showRelevantDialog method is called once and with correct parameters");
			});
		});

		QUnit.test("When triggerCatalogPublishing() method is called on S4/Hana Cloud for catalog unassignment and response is failed", function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			const oSendRequestStub = sandbox.stub(WriteUtils, "sendRequest").returns(Promise.reject("Error"));

			sandbox.stub(MessageBox, "show").callsFake(function(sText, mParameters) {
				mParameters.onClose("Close");
			});

			sandbox.stub(Log, "error").callThrough().withArgs("App variant error: ", "error").returns();

			const fnShowRelevantDialog = sandbox.spy(AppVariantUtils, "showRelevantDialog");
			const oErrorInfo = {appVariantId: "customer.TestId"};
			const fnBuildErrorInfoStub = sandbox.stub(AppVariantUtils, "buildErrorInfo").returns(oErrorInfo);
			const fncatchErrorDialog = sandbox.spy(AppVariantUtils, "catchErrorDialog");
			const fnTriggerCatalogUnAssignment = sandbox.spy(AppVariantUtils, "triggerCatalogUnAssignment");

			return AppVariantFactory.prepareCreate({id: "customer.TestId", reference: "TestIdBaseApp"})
			.then(function(oManifest) {
				return this.oAppVariantManager.triggerCatalogPublishing(oManifest.getId(), oManifest.getReference(), false);
			}.bind(this))
			.then(function() {
				assert.ok(fnTriggerCatalogUnAssignment.calledOnceWith("customer.TestId", Layer.CUSTOMER, "TestIdBaseApp"), "then the method triggerCatalogUnAssignment is called once with correct parameters");
				assert.ok(oSendRequestStub.calledOnceWith("/sap/bc/lrep/appdescr_variants/customer.TestId?action=unassignCatalogs", "POST"), "then the sendRequest() method is called once and with right parameters");
				assert.ok(fncatchErrorDialog.calledOnce, "then the fncatchErrorDialog method is called once");
				assert.strictEqual(fncatchErrorDialog.getCall(0).args[1], "MSG_DELETE_APP_VARIANT_FAILED", "then the fncatchErrorDialog method is called with correct message key");
				assert.strictEqual(fncatchErrorDialog.getCall(0).args[2], "customer.TestId", "then the fncatchErrorDialog method is called with correct app const id");
				assert.ok(fnBuildErrorInfoStub.calledOnce, "then the buildErrorInfo method is called once");
				assert.ok(fnShowRelevantDialog.calledOnceWith(oErrorInfo, false), "then the showRelevantDialog method is called once and with correct parameters");
			});
		});

		QUnit.test("When showSuccessMessage() method is called on S4/Hana Cloud ('Save As' is triggered from RTA Toolbar)", function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();

			return AppVariantFactory.prepareCreate({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oManifest) {
				return this.oAppVariantManager.showSuccessMessage(oManifest, true).then(function() {
					assert.ok("then the promise is resolved and app is navigated to FLP Homepage");
				});
			}.bind(this));
		});

		QUnit.test("When showSuccessMessage() method is called on S4/Hana on premise ('Save As' is triggered from RTA Toolbar)", function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(false);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();

			return AppVariantFactory.prepareCreate({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oManifest) {
				return this.oAppVariantManager.showSuccessMessage(oManifest, true).then(function() {
					assert.ok("then the promise is resolved and app is navigated to FLP Homepage");
				});
			}.bind(this));
		});

		QUnit.test("When showSuccessMessage() method is called on S4/Hana Cloud ('Save As' is triggered from app variant overview list)", function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(true);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();

			const fnAppVariantFeatureSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves(true);

			return AppVariantFactory.prepareCreate({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oManifest) {
				return this.oAppVariantManager.showSuccessMessage(oManifest, false).then(function() {
					assert.ok(fnAppVariantFeatureSpy.notCalled, "then the onGetOverview() method is called once");
				});
			}.bind(this));
		});

		QUnit.test("When showSuccessMessage() method is called on S4/Hana on premise ('Save As' is triggered from app variant overview list)", function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "isAtoEnabled").returns(false);

			sandbox.stub(AppVariantUtils, "showRelevantDialog").resolves();

			const fnAppVariantFeatureSpy = sandbox.stub(RtaAppVariantFeature, "onGetOverview").resolves(true);

			return AppVariantFactory.prepareCreate({
				id: "customer.TestId",
				reference: "TestIdBaseApp"
			}).then(function(oManifest) {
				return this.oAppVariantManager.showSuccessMessage(oManifest, false).then(function() {
					assert.ok(fnAppVariantFeatureSpy.notCalled, "then the onGetOverview() method is called once");
				});
			}.bind(this));
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});