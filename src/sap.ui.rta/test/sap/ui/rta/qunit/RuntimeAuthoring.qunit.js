/* global QUnit */

sap.ui.define([
	"qunit/RtaQunitUtils",
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/core/Element",
	"sap/ui/dt/DesignTimeMetadata",
	"sap/ui/dt/DOMUtil",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/apply/_internal/flexState/Loader",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/_internal/Versions",
	"sap/ui/fl/write/api/BusinessNetworkAPI",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/ReloadInfoAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/command/CommandFactory",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/util/changeVisualization/ChangeVisualization",
	"sap/ui/rta/util/ReloadManager",
	"sap/ui/rta/RuntimeAuthoring",
	"sap/ui/rta/Utils",
	"sap/ui/thirdparty/sinon-4",
	"sap/ui/Device"
], function(
	RtaQunitUtils,
	Log,
	MessageBox,
	MessageToast,
	Element,
	DesignTimeMetadata,
	DOMUtil,
	OverlayRegistry,
	KeyCodes,
	Loader,
	FlexRuntimeInfoAPI,
	Versions,
	BusinessNetworkAPI,
	ChangesWriteAPI,
	FeaturesAPI,
	PersistenceWriteAPI,
	ReloadInfoAPI,
	VersionsAPI,
	nextUIUpdate,
	RTABaseCommand,
	CommandFactory,
	Stack,
	ChangeVisualization,
	ReloadManager,
	RuntimeAuthoring,
	RtaUtils,
	sinon,
	Device
) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.config.fixture = null;

	var oComp;
	var oComponentPromise = RtaQunitUtils.renderTestAppAtAsync("qunit-fixture").then(function(oCompContainer) {
		oComp = oCompContainer.getComponentInstance();
	});

	function triggerKeydown(oTargetDomRef, iKeyCode, bShiftKey, bAltKey, bCtrlKey, bMetaKey) {
		var oParams = {};
		oParams.keyCode = iKeyCode;
		oParams.which = oParams.keyCode;
		oParams.shiftKey = bShiftKey;
		oParams.altKey = bAltKey;
		oParams.metaKey = bMetaKey;
		oParams.ctrlKey = bCtrlKey;
		document.dispatchEvent(new KeyboardEvent("keydown", oParams));
	}

	function cleanInfoSessionStorage() {
		var sFlexReference = FlexRuntimeInfoAPI.getFlexReference({element: oComp});
		window.sessionStorage.removeItem(`sap.ui.fl.info.${sFlexReference}`);
	}

	QUnit.module("Given that RuntimeAuthoring based on test-view is available together with a CommandStack with changes...", {
		before() {
			return oComponentPromise;
		},
		beforeEach(assert) {
			Versions.clearInstances();
			var fnDone = assert.async();

			sandbox.stub(ChangesWriteAPI, "getChangeHandler").resolves();
			sandbox.stub(FlexRuntimeInfoAPI, "getUserId").returns("testUser");
			this.oMessageBoxStub = sandbox.stub(RtaUtils, "showMessageBox");

			// Prepare elements an designtime
			var oElement1 = Element.getElementById("Comp1---idMain1--GeneralLedgerDocument.Name");
			var oElement2 = Element.getElementById("Comp1---idMain1--GeneralLedgerDocument.CompanyCode");
			this.oGroupElementDesignTimeMetadata = new DesignTimeMetadata({
				data: {
					actions: {
						remove: {
							changeType: "hideControl"
						}
					}
				}
			});
			// Create commands
			var oCommandFactory = new CommandFactory();
			oCommandFactory.getCommandFor(oElement1, "Remove", {
				removedElement: oElement1
			}, this.oGroupElementDesignTimeMetadata)

			.then(function(oRemoveCommand) {
				this.oRemoveCommand = oRemoveCommand;
				this.oCommandStack = new Stack();
				// Start RTA with command stack
				var oRootControl = oComp.getAggregation("rootControl");
				this.oRta = new RuntimeAuthoring({
					rootControl: oRootControl,
					commandStack: this.oCommandStack,
					showToolbars: true,
					flexSettings: {
						developerMode: false
					}
				});
				return RtaQunitUtils.clear(oRootControl, true)
				.then(this.oRta.start.bind(this.oRta))
				.then(function() {
					this.oRootControlOverlay = OverlayRegistry.getOverlay(oRootControl);
					this.oElement2Overlay = OverlayRegistry.getOverlay(oElement2);
					this.oCommandStack.pushAndExecute(oRemoveCommand);
				}.bind(this))
				.then(fnDone);
			}.bind(this));
		},
		afterEach() {
			cleanInfoSessionStorage();
			sandbox.restore();
			this.oRemoveCommand.destroy();
			this.oCommandStack.destroy();
			this.oRta.destroy();
			return RtaQunitUtils.clear();
		},
		after() {
			window.sessionStorage.clear();
		}
	}, function() {
		QUnit.test("when UI Adaptation is started and the UI Adaptation Tour is started automatically", function(assert) {
			assert.ok(this.oMessageBoxStub.calledOnce, "then the tour message box is shown");
			assert.ok(
				sessionStorage.getItem("sap.ui.rta.dontShowUIAdaptationTourAfterReload"),
				"then the session storage tour flag is set"
			);
		});

		QUnit.test("when UI Adaptation is started and the UI Adaptation Tour flag is available", function(assert) {
			assert.ok(
				sessionStorage.getItem("sap.ui.rta.dontShowUIAdaptationTourAfterReload"),
				"then the session storage tour flag is set"
			);
			assert.ok(this.oMessageBoxStub.notCalled, "then the tour message box does not appear");
		});

		QUnit.test("when cut is triggered by keydown-event on rootElementOverlay, with macintosh device and metaKey is pushed", function(assert) {
			var done = assert.async();
			var bMacintoshOriginal;
			var fnStackModifiedSpy = sinon.spy(function() {
				if (fnStackModifiedSpy.calledOnce) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "after CMD + Z the stack is empty");
					// redo -> execute -> fireModified (inside promise)
					triggerKeydown(this.oElement2Overlay.getDomRef(), KeyCodes.Z, true, false, false, true);
				} else if (fnStackModifiedSpy.calledTwice) {
					assert.equal(
						this.oCommandStack.getAllExecutedCommands().length,
						1,
						"after CMD + SHIFT + Z is again 1 command in the stack"
					);
					Device.os.macintosh = bMacintoshOriginal;
					done();
				}
			}.bind(this));
			this.oCommandStack.attachModified(fnStackModifiedSpy);
			bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = true;
			assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 commands is still in the stack");

			// undo -> _unExecute -> fireModified
			document.activeElement.blur(); // reset focus to body
			triggerKeydown(this.oRootControlOverlay.getDomRef(), KeyCodes.Z, false, false, false, true);
		});

		QUnit.test("when cut is triggered by keydown-event on rootElementOverlay, with no macintosh device and ctrlKey is pushed", function(assert) {
			var done = assert.async();
			var bMacintoshOriginal;
			var fnStackModifiedSpy = sinon.spy(function() {
				if (fnStackModifiedSpy.calledOnce) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "after CTRL + Z the stack is empty");
					// redo -> execute -> fireModified (inside promise)
					triggerKeydown(this.oElement2Overlay.getDomRef(), KeyCodes.Y, false, false, true, false);
				} else if (fnStackModifiedSpy.calledTwice) {
					assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "after CTRL + Y is again 1 command in the stack");
					Device.os.macintosh = bMacintoshOriginal;
					done();
				}
			}.bind(this));
			this.oCommandStack.attachModified(fnStackModifiedSpy);
			bMacintoshOriginal = Device.os.macintosh;
			Device.os.macintosh = false;
			assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 commands is still in the stack");

			// undo -> _unExecute -> fireModified
			document.activeElement.blur(); // reset focus to body
			triggerKeydown(this.oRootControlOverlay.getDomRef(), KeyCodes.Z, false, false, true, false);
		});

		QUnit.test("when handleElementModified is called and the command fails because of dependencies", function(assert) {
			assert.expect(2);
			const oLogStub = sandbox.stub(Log, "error");
			const oCommandStack = {
				pushAndExecute() {
					return Promise.reject(Error(
						"Some stuff.... The following Change cannot be applied because of a dependency .... some other stuff"
					));
				}
			};
			sandbox.stub(this.oRta, "getCommandStack").returns(oCommandStack);
			this.oRta.getPluginManager().getDefaultPlugins().rename.fireElementModified({
				command: new RTABaseCommand()
			});
			return this.oRta._pElementModified.then(function() {
				assert.equal(oLogStub.callCount, 1, "one error got logged");
				assert.equal(this.oMessageBoxStub.callCount, 1, "one MessageBox got shown");
			}.bind(this));
		});

		QUnit.test("when handleElementModified is called and the command fails, but not because of dependencies", function(assert) {
			assert.expect(2);
			const oLogStub = sandbox.stub(Log, "error");
			const oCommandStack = {
				pushAndExecute() {
					return Promise.reject(Error("Some stuff........ some other stuff"));
				}
			};
			sandbox.stub(this.oRta, "getCommandStack").returns(oCommandStack);
			this.oRta.getPluginManager().getDefaultPlugins().rename.fireElementModified({
				command: new RTABaseCommand()
			});
			return this.oRta._pElementModified.then(function() {
				assert.equal(oLogStub.callCount, 1, "one error got logged");
				assert.equal(this.oMessageBoxStub.callCount, 0, "no MessageBox got shown");
			}.bind(this));
		});

		QUnit.test("when saving RTA without exiting,", function(assert) {
			var fnDone = assert.async();
			var oCVizUpdateSpy = sandbox.spy(ChangeVisualization.prototype, "updateAfterSave");
			var oMessageToastShowSpy = sandbox.spy(MessageToast, "show");
			var sExpectedMessageToastMessage = this.oRta._getTextResources().getText("MSG_SAVE_SUCCESS");

			function fnChecks() {
				assert.ok(this.oRta, "RTA is still up and running");
				assert.ok(oMessageToastShowSpy.calledWith(sExpectedMessageToastMessage), "message toast save confirmation is triggered");
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "command stack is cleared");
				assert.ok(DOMUtil.isVisible(document.querySelector(".sapUiRtaToolbar")), "and the Toolbar is visible.");
				var oToolbar = this.oRta.getToolbar();
				assert.notOk(
					oToolbar.getControl("save").getEnabled(),
					"then the save button is disabled"
				);
				assert.ok(oCVizUpdateSpy.called, "then CViz has been updated");
				RtaQunitUtils.showActionsMenu(oToolbar)
				.then(function() {
					assert.ok(
						oToolbar.getControl("restore").getEnabled(),
						"then the reset button is enabled"
					);
					fnDone();
				});
			}

			// Simulate pressing the "save" button
			this.oRta.getToolbar().fireSave({
				callback: fnChecks.bind(this)
			});
		});

		QUnit.test("when saving RTA including variants without exiting,", function(assert) {
			var fnDone = assert.async();

			function fnChecks() {
				assert.ok(this.oRta, "RTA is still up and running");
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "command stack is cleared");
				assert.ok(DOMUtil.isVisible(document.querySelector(".sapUiRtaToolbar")), "and the Toolbar is visible");
				fnDone();
			}

			// Simulate pressing the "save" button
			this.oRta.getToolbar().fireSave({
				callback: fnChecks.bind(this)
			});
		});

		QUnit.test("when saving RTA without exiting with error in saving changes,", function(assert) {
			const fnDone = assert.async();
			const oMessageToastShowSpy = sandbox.spy(MessageToast, "show");
			sandbox.stub(this.oRta, "_serializeToLrep").returns(Promise.reject("Test Exception"));
			const oMessageBoxErrorStub = sandbox.stub(MessageBox, "error")
			.resolves(this.oRta._getTextResources().getText("BTN_UNSAVED_CHANGES_ON_CLOSE_SAVE"));
			const sExpectedErrorMessage = this.oRta._getTextResources().getText("MSG_LREP_TRANSFER_ERROR");

			function fnChecks() {
				assert.ok(this.oRta, "RTA is still up and running");
				assert.strictEqual(oMessageToastShowSpy.callCount, 0, "then message toast with confirmation message is not called");
				assert.strictEqual(oMessageBoxErrorStub.callCount, 1, "then the messagebox with the error message is called once");
				assert.ok(
					oMessageBoxErrorStub.getCall(0).args[0].includes(sExpectedErrorMessage),
					"then the expected messagebox is called"
				);
				assert.ok(this.oCommandStack.getAllExecutedCommands().length > 0, "command stack is not cleared");
				assert.ok(DOMUtil.isVisible(document.querySelector(".sapUiRtaToolbar")), "and the Toolbar is visible");
				fnDone();
			}

			// Simulate pressing the "save" button
			this.oRta.getToolbar().fireSave({
				callback: fnChecks.bind(this)
			});
		});

		QUnit.test("when trying to stop rta with error in saving changes,", function(assert) {
			sandbox.stub(this.oRta, "_serializeToLrep").returns(Promise.reject());
			this.oMessageBoxStub.resolves(this.oRta._getTextResources().getText("BTN_UNSAVED_CHANGES_ON_CLOSE_SAVE"));

			return this.oRta.stop(false).catch(function() {
				assert.ok(true, "then the promise got rejected");
				assert.ok(this.oRta, "RTA is still up and running");
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 command is still in the stack");
				assert.equal(DOMUtil.isVisible(document.querySelector(".sapUiRtaToolbar")), true, "and the Toolbar is visible.");
				assert.strictEqual(this.oMessageBoxStub.callCount, 1, "then the messagebox is called once");
				assert.strictEqual(
					this.oMessageBoxStub.getCall(0).args[1],
					"MSG_UNSAVED_CHANGES_ON_CLOSE",
					"then the expected messagebox is called"
				);
			}.bind(this));
		});

		QUnit.test("when stopping rta without saving changes,", function(assert) {
			var oSerializeToLrepSpy = sandbox.spy(this.oRta, "_serializeToLrep");
			return this.oRta.stop(/* bSkipSave= */true)
			.then(function() {
				assert.ok(true, "then the promise got resolved");
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 command is still in the stack");
				assert.ok(oSerializeToLrepSpy.notCalled, "then 'serializeToLrep' was not called");
			}.bind(this))
			.then(RtaQunitUtils.getNumberOfChangesForTestApp)
			.then(function(iNumOfChanges) {
				assert.equal(iNumOfChanges, 0, "there is no change written");
			});
		});

		QUnit.test("when stopping rta with bSkipSave is false and dirty changes not exists,", function(assert) {
			var oSerializeToLrepSpy = sandbox.spy(this.oRta, "_serializeToLrep");
			var oHasDirtyChangesSpy = sandbox.stub(PersistenceWriteAPI, "hasDirtyChanges").returns(false);
			return this.oRta.stop(/* bSkipSave= */false)
			.then(function() {
				assert.equal(oHasDirtyChangesSpy.callCount, 1, "hasDirtyChanges was called");
				assert.ok(true, "then the promise got resolved");
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 command is still in the stack");
				assert.ok(oSerializeToLrepSpy.notCalled, "then 'serializeToLrep' was not called");
			}.bind(this))
			.then(RtaQunitUtils.getNumberOfChangesForTestApp)
			.then(function(iNumOfChanges) {
				assert.equal(iNumOfChanges, 0, "there is no change written");
			});
		});

		QUnit.test("when stopping rta with changes and choosing not to save them on the dialog,", function(assert) {
			const oSaveSpy = sandbox.spy(PersistenceWriteAPI, "save");
			const oCheckReloadOnExitSpy = sandbox.spy(ReloadManager, "checkReloadOnExit");
			const oHasDirtyChangesSpy = sandbox.stub(PersistenceWriteAPI, "hasDirtyChanges").returns(true);
			this.oMessageBoxStub.resolves(this.oRta._getTextResources().getText("BTN_UNSAVED_CHANGES_ON_CLOSE_DONT_SAVE"));

			return this.oRta.stop(false)
			.then(function() {
				assert.equal(oHasDirtyChangesSpy.called, true, "hasDirtyChanges was called");
				assert.strictEqual(
					this.oMessageBoxStub.getCall(0).args[1],
					"MSG_UNSAVED_CHANGES_ON_CLOSE",
					"then the expected messagebox is called"
				);
				assert.deepEqual(this.oMessageBoxStub.getCall(0).args[2], {
					titleKey: "TIT_UNSAVED_CHANGES_ON_CLOSE",
					actionKeys: ["BTN_UNSAVED_CHANGES_ON_CLOSE_SAVE", "BTN_UNSAVED_CHANGES_ON_CLOSE_DONT_SAVE"],
					emphasizedActionKey: "BTN_UNSAVED_CHANGES_ON_CLOSE_SAVE",
					showCancel: true
				}, "and the message box is called with the right parameters");
				assert.ok(true, "then the promise got resolved");
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 0, "command stack is cleared");
				assert.ok(oSaveSpy.called, "then save was called (to invalidate the cache)");
				assert.ok(oCheckReloadOnExitSpy.calledBefore(oSaveSpy), "then the reload check happened before the save");
				var mPropertyBag = {
					oComponent: oComp,
					selector: oComp,
					invalidateCache: false,
					currentLayer: this.oRta.getLayer(),
					includeDirtyChanges: true
				};
				return PersistenceWriteAPI._getUIChanges(mPropertyBag);
			}.bind(this))
			.then(function(aChanges) {
				assert.equal(aChanges.length, 0, "then all dirty changes are cleared");
				return RtaQunitUtils.getNumberOfChangesForTestApp();
			}).then(function(iNumOfChanges) {
				assert.equal(iNumOfChanges, 0, "there is no change written");
			});
		});

		QUnit.test("when stopping rta with versioning enabled, existing changes and pressing cancel on the dialog,", function(assert) {
			this.oMessageBoxStub.resolves(MessageBox.Action.CANCEL);
			this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
			const oVersionsClearInstances = sandbox.spy(VersionsAPI, "clearInstances");

			return this.oRta.stop(false)
			.then(function() {
				assert.deepEqual(this.oMessageBoxStub.getCall(0).args[2], {
					titleKey: "TIT_UNSAVED_CHANGES_ON_CLOSE",
					actionKeys: ["BTN_UNSAVED_DRAFT_CHANGES_ON_CLOSE_SAVE", "BTN_UNSAVED_CHANGES_ON_CLOSE_DONT_SAVE"],
					emphasizedActionKey: "BTN_UNSAVED_CHANGES_ON_CLOSE_SAVE",
					showCancel: true
				}, "and the message box is called with the right parameters (save draft button)");
				assert.deepEqual(this.oMessageBoxStub.getCall(0).args[1], "MSG_UNSAVED_DRAFT_CHANGES_ON_CLOSE",
					"then message box message text is selected accordingly");
				assert.ok(true, "then the promise gets resolved");
				assert.ok(this.oRta, "RTA is still up and running");
				assert.ok(DOMUtil.isVisible(document.querySelector(".sapUiRtaToolbar")), "and the Toolbar is visible.");
				assert.equal(this.oCommandStack.getAllExecutedCommands().length, 1, "1 command is still in the stack");
			}.bind(this))
			.then(RtaQunitUtils.getNumberOfChangesForTestApp)
			.then(function(iNumOfChanges) {
				assert.equal(iNumOfChanges, 0, "there is no change written");
				assert.equal(oVersionsClearInstances.callCount, 0, "do not clear version model instances");
			});
		});

		QUnit.test("when stopping rta with saving changes", function(assert) {
			const oSaveSpy = sandbox.spy(PersistenceWriteAPI, "save");
			const oVersionsClearInstances = sandbox.spy(VersionsAPI, "clearInstances");
			const oSerializeToLrepSpy = sandbox.spy(this.oRta, "_serializeToLrep");
			const oRemoveInfoSessionStub = sandbox.stub(ReloadInfoAPI, "removeInfoSessionStorage");
			this.oMessageBoxStub.resolves(this.oRta._getTextResources().getText("BTN_UNSAVED_CHANGES_ON_CLOSE_SAVE"));

			return this.oRta.stop()
			.then(function() {
				assert.strictEqual(oRemoveInfoSessionStub.callCount, 1, "then the info session storage is removed");
				var oSavePropertyBag = oSaveSpy.getCall(0).args[0];
				assert.ok(oSavePropertyBag.removeOtherLayerChanges, "then removeOtherLayerChanges is set to true");
				assert.strictEqual(oSavePropertyBag.layer, this.oRta.getLayer(), "then the layer is properly passed along");
				assert.strictEqual(this.oMessageBoxStub.callCount, 1, "then the messagebox is called once");
				assert.strictEqual(
					this.oMessageBoxStub.getCall(0).args[1],
					"MSG_UNSAVED_CHANGES_ON_CLOSE",
					"then the expected messagebox is called"
				);
			}.bind(this))
			.then(RtaQunitUtils.getNumberOfChangesForTestApp)
			.then(function(iNumberOfChanges) {
				assert.equal(oVersionsClearInstances.callCount, 1, "clear version model instances");
				assert.strictEqual(iNumberOfChanges, 1, "then the change is written");
				var mPropertyBag = {
					oComponent: oComp,
					selector: oComp,
					invalidateCache: false,
					currentLayer: this.oRta.getLayer(),
					includeDirtyChanges: true
				};
				return PersistenceWriteAPI._getUIChanges(mPropertyBag).then(function(aChanges) {
					assert.ok(
						aChanges[0].isSuccessfullyApplied(),
						"then the change keeps its apply state"
					);
					assert.notStrictEqual(
						aChanges[0].getRevertData(),
						null,
						"then the change keeps its revert data"
					);
					assert.strictEqual(
						oSerializeToLrepSpy.args[0][0],
						false,
						"then '_serializeToLrep' was called with 'bCondenseAnyLayer' parameter equal to false"
					);
					assert.strictEqual(
						oSerializeToLrepSpy.args[0][1],
						true,
						"then '_serializeToLrep' was called with 'bIsExit' parameter equal to true"
					);
				});
			}.bind(this));
		});

		QUnit.test("when saving changes and versioning and cba is disabled", function(assert) {
			var oSaveStub = sandbox.stub(PersistenceWriteAPI, "save").resolves();

			return this.oRta._serializeToLrep()
			.then(function() {
				assert.equal(oSaveStub.callCount, 1, "save was triggered");
				var aSavePropertyBag = oSaveStub.getCall(0).args[0];
				assert.equal(aSavePropertyBag.draft, false, "the draft flag is set to false");
				assert.notOk(aSavePropertyBag.version, "the version is not passed");
				assert.notOk(aSavePropertyBag.adaptationId, "the adaptationId is not passed");
			});
		});

		QUnit.test("when saving changes and versioning and cba is enabled and condenseAnyLayer true", function(assert) {
			this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
			this.oRta._oContextBasedAdaptationsModel.setProperty("/contextBasedAdaptationsEnabled", true);
			this.oRta._oContextBasedAdaptationsModel.setProperty("/displayedAdaptation", {id: "ad123"});
			var oSaveStub = sandbox.stub(PersistenceWriteAPI, "save").resolves();

			return this.oRta._serializeToLrep(true)
			.then(function() {
				assert.equal(oSaveStub.callCount, 1, "save was triggered");
				var aSavePropertyBag = oSaveStub.getCall(0).args[0];
				assert.strictEqual(aSavePropertyBag.draft, true, "the draft flag is set to true");
				assert.strictEqual(aSavePropertyBag.condenseAnyLayer, true, "the condense flag is set to true");
				assert.equal(aSavePropertyBag.version, "0", "the draft version is passed");
				assert.equal(aSavePropertyBag.adaptationId, "ad123", "the adaptationId is passed");
			});
		});

		QUnit.test("when stopping rta with saving changes and versioning and cba is disabled", function(assert) {
			var oSaveStub = sandbox.stub(PersistenceWriteAPI, "save").resolves();

			return this.oRta._serializeToLrep(false, true)
			.then(function() {
				assert.equal(oSaveStub.callCount, 1, "save was triggered");
				var aSavePropertyBag = oSaveStub.getCall(0).args[0];
				assert.equal(aSavePropertyBag.draft, false, "the draft flag is set to false");
				assert.notOk(aSavePropertyBag.version, "the version is not passed");
				assert.notOk(aSavePropertyBag.adaptationId, "the adaptationId is not passed");
			});
		});

		QUnit.test("when stopping rta with saving changes and versioning and cba is enabled and condenseAnyLayer true", function(assert) {
			this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
			this.oRta._oContextBasedAdaptationsModel.setProperty("/contextBasedAdaptationsEnabled", true);
			this.oRta._oContextBasedAdaptationsModel.setProperty("/displayedAdaptation", {id: "ad123"});
			var oSaveStub = sandbox.stub(PersistenceWriteAPI, "save").resolves();

			return this.oRta._serializeToLrep(true, true)
			.then(function() {
				assert.equal(oSaveStub.callCount, 1, "save was triggered");
				var aSavePropertyBag = oSaveStub.getCall(0).args[0];
				assert.strictEqual(aSavePropertyBag.draft, true, "the draft flag is set to true");
				assert.strictEqual(aSavePropertyBag.condenseAnyLayer, true, "the condense flag is set to true");
				assert.notOk(aSavePropertyBag.version, "the version is not passed because we switch to active version");
				assert.notOk(aSavePropertyBag.adaptationId, "the adaptationId is not passed");
			});
		});

		QUnit.test("when stopping rta with saving changes and current displayed version is not draft", function(assert) {
			this.oRta._oVersionsModel.setProperty("/versioningEnabled", true);
			this.oRta._oVersionsModel.setProperty("/displayedVersion", "-1");
			this.oRta._oContextBasedAdaptationsModel.setProperty("/contextBasedAdaptationsEnabled", false);
			const oSaveStub = sandbox.stub(PersistenceWriteAPI, "save").resolves();

			return this.oRta._serializeToLrep(true, true)
			.then(function() {
				assert.equal(oSaveStub.callCount, 1, "save was triggered");
				const aSavePropertyBag = oSaveStub.getCall(0).args[0];
				assert.strictEqual(aSavePropertyBag.draft, false, "the draft flag is set to false");
				assert.notOk(aSavePropertyBag.version, "the version is not passed because we switch to active version");
			});
		});

		QUnit.test("when calling condenseAndSaveChanges", function(assert) {
			var oSerializeStub = sandbox.stub(this.oRta, "_serializeToLrep");
			this.oRta.condenseAndSaveChanges(true);
			assert.strictEqual(oSerializeStub.callCount, 1, "the serialize function was called once");
			assert.strictEqual(oSerializeStub.lastCall.args[0], true, "the parameter is passed");
			this.oRta.condenseAndSaveChanges(false);
			assert.strictEqual(oSerializeStub.callCount, 2, "the serialize function was called once again");
			assert.strictEqual(oSerializeStub.lastCall.args[0], false, "the parameter is passed");
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started with a scope set...", {
		before() {
			return oComponentPromise;
		},
		beforeEach() {
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl"),
				metadataScope: "someScope"
			});

			return RtaQunitUtils.clear()
			.then(this.oRta.start.bind(this.oRta));
		},
		afterEach() {
			cleanInfoSessionStorage();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when RTA is started, then the overlay has the scoped metadata associated", function(assert) {
			assert.equal(this.oRta.getMetadataScope(), "someScope", "then RTA knows the scope");
			assert.equal(this.oRta._oDesignTime.getScope(), "someScope", "then designtime knows the scope");

			var oOverlayWithInstanceSpecificMetadata = OverlayRegistry.getOverlay("Comp1---idMain1--Dates.SpecificFlexibility");
			var mDesignTimeMetadata = oOverlayWithInstanceSpecificMetadata.getDesignTimeMetadata().getData();
			assert.equal(mDesignTimeMetadata.newKey, "new", "New scoped key is added");
			assert.equal(mDesignTimeMetadata.someKeyToOverwriteInScopes, "scoped", "Scope can overwrite keys");
			assert.equal(mDesignTimeMetadata.some.deep, null, "Scope can delete keys");

			var oRootOverlayWithInstanceSpecificMetadata = OverlayRegistry.getOverlay("Comp1---app");
			var mDesignTimeMetadata2 = oRootOverlayWithInstanceSpecificMetadata.getDesignTimeMetadata().getData();
			assert.equal(mDesignTimeMetadata2.newKey, "new", "New scoped key is added");
			assert.equal(mDesignTimeMetadata2.someKeyToOverwriteInScopes, "scoped", "Scope can overwrite keys");
			assert.equal(mDesignTimeMetadata2.some.deep, null, "Scope can delete keys");

			var oErrorStub = sandbox.stub(Log, "error");
			this.oRta.setMetadataScope("some other scope");
			assert.equal(this.oRta.getMetadataScope(), "someScope", "then the scope in RTA didn't change");
			assert.equal(oErrorStub.callCount, 1, "and an error was logged");
		});
	});

	QUnit.module("Given that RuntimeAuthoring is started and the UI Adaptation Tour autostarts", {
		before() {
			return oComponentPromise;
		},
		beforeEach() {
			 this.oMessageBoxStub = sandbox.stub(RtaUtils, "showMessageBox");
		},
		afterEach() {
			cleanInfoSessionStorage();
			window.sessionStorage.clear();
			this.oRta.destroy();
			sandbox.restore();
		}
	}, function() {
		QUnit.test("when RTA is started with no created versions from the user", async function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "getUserId").returns("testUser");
			sandbox.stub(VersionsAPI, "getCreatedVersionsByUser").returns([]);
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
			});

			await RtaQunitUtils.clear();
			await this.oRta.start();
			assert.ok(this.oMessageBoxStub.calledOnce, "then the tour message box is shown");
		});

		QUnit.test("when RTA is started with crested versions from the user", async function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "getUserId").returns("testUser");
			sandbox.stub(VersionsAPI, "getCreatedVersionsByUser").returns([{versionId: "testVersion"}]);
			sandbox.stub(PersistenceWriteAPI, "_getFlexObjectsForUser").returns([]);
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
			});

			await RtaQunitUtils.clear();
			await this.oRta.start();
			assert.ok(this.oMessageBoxStub.notCalled, "then the tour message box is not shown");
		});

		QUnit.test("when RTA is started with no changes from the user", async function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "getUserId").returns("testUser");
			sandbox.stub(PersistenceWriteAPI, "_getFlexObjectsForUser").returns([]);
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
			});

			await RtaQunitUtils.clear();
			await this.oRta.start();
			assert.ok(this.oMessageBoxStub.calledOnce, "then the tour tour message box is shown");
		});

		QUnit.test("when RTA is started with changes from the user", async function(assert) {
			sandbox.stub(FlexRuntimeInfoAPI, "getUserId").returns("testUser");
			sandbox.stub(PersistenceWriteAPI, "_getFlexObjectsForUser").returns([{changeId: "testChange"}]);
			sandbox.stub(VersionsAPI, "getCreatedVersionsByUser").returns([]);
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
			});

			await RtaQunitUtils.clear();
			await this.oRta.start();
			assert.ok(this.oMessageBoxStub.notCalled, "then the tour message box is not shown");
		});

		QUnit.test("when RTA is stopped with no reload skip in session storage", async function(assert) {
			const oReloadManagerSpy = sandbox.spy(ReloadManager, "handleReloadOnExit");
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
			});

			await RtaQunitUtils.clear();
			await this.oRta.start();
			await this.oRta.stop();

			const oArgs = oReloadManagerSpy.getCall(0).args[0];

			assert.ok(oReloadManagerSpy.calledOnce, "then handleReloadOnExit was called");
			assert.ok(Object.keys(oArgs).length > 0, "handleReloadOnExit was called with a reload Info object");
		});

		QUnit.test("when RTA is stopped with a reload skip in session storage", async function(assert) {
			window.sessionStorage.setItem("sap.ui.rta.skipReload", true);
			const oReloadManagerSpy = sandbox.spy(ReloadManager, "handleReloadOnExit");
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
			});

			await RtaQunitUtils.clear();
			await this.oRta.start();
			await this.oRta.stop();

			const oArgs = oReloadManagerSpy.getCall(0).args[0];

			assert.ok(oReloadManagerSpy.calledOnce, "then handleReloadOnExit was called");
			assert.ok(Object.keys(oArgs).length === 0, "handleReloadOnExit was called without a reload Info object");
		});

		QUnit.test("when UI Adaptation is started and the What's New dialog is initialized", async function(assert) {
			sandbox.stub(FeaturesAPI, "isSeenFeaturesAvailable").returns(true);
			sandbox.stub(FeaturesAPI, "getSeenFeatureIds").returns([]);
			const sessionStorageSpy = sandbox.spy(sessionStorage, "setItem").withArgs("sap.ui.rta.dontShowWhatsNewAfterReload", true);
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
			});

			await RtaQunitUtils.clear();
			await this.oRta.start();

			assert.ok(DOMUtil.isVisible(document.getElementById("sapUiRtaWhatsNewDialog")), "then the WhatsNew dialog is visible");
			assert.ok(
				sessionStorageSpy.calledOnceWithExactly("sap.ui.rta.dontShowWhatsNewAfterReload", true),
				"then the WhatsNew dialog doesn't show after reload flag is set"
			);
		});

		QUnit.test("when UI Adaptation is started and the dontShowWhatsNewAfterReload flag is set", async function(assert) {
			sandbox.stub(FeaturesAPI, "isSeenFeaturesAvailable").returns(true);
			sandbox.stub(FeaturesAPI, "getSeenFeatureIds").returns([]);
			sessionStorage.setItem("sap.ui.rta.dontShowWhatsNewAfterReload", true);
			this.oRta = new RuntimeAuthoring({
				rootControl: oComp.getAggregation("rootControl")
			});

			await RtaQunitUtils.clear();
			await this.oRta.start();

			assert.notOk(DOMUtil.isVisible(document.getElementById("sapUiRtaWhatsNewDialog")), "then the WhatsNew dialog is not visible");
		});
	});

	QUnit.done(function() {
		oComp.destroy();
		document.getElementById("qunit-fixture").style.display = "none";
	});
});