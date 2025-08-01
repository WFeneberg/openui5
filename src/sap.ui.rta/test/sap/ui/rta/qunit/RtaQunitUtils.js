sap.ui.define([
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/core/Component",
	"sap/ui/core/ComponentContainer",
	"sap/ui/core/UIComponent",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/apply/_internal/changes/Reverter",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObjectFactory",
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/fl/write/_internal/connectors/SessionStorageConnector",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/rta/plugin/rename/RenameDialog",
	"sap/ui/rta/RuntimeAuthoring",
	"test-resources/sap/ui/fl/api/FlexTestAPI",
	"test-resources/sap/ui/fl/qunit/FlQUnitUtils"
], function(
	JsControlTreeModifier,
	Component,
	ComponentContainer,
	UIComponent,
	KeyCodes,
	Reverter,
	FlexObjectFactory,
	FlexRuntimeInfoAPI,
	SessionStorageConnector,
	PersistenceWriteAPI,
	VersionsAPI,
	Layer,
	flUtils,
	JSONModel,
	nextUIUpdate,
	QUnitUtils,
	RenameDialog,
	RuntimeAuthoring,
	FlexTestAPI,
	FlQUnitUtils
) {
	"use strict";

	function disableRtaRestart() {
		RuntimeAuthoring.disableRestart(Layer.CUSTOMER);
		RuntimeAuthoring.disableRestart(Layer.USER);
	}

	var RtaQunitUtils = {};

	RtaQunitUtils.clear = async function(oElement, bRevert) {
		const oComponent = (oElement && flUtils.getAppComponentForControl(oElement)) || Component.getComponentById("Comp1");

		await VersionsAPI.initialize({
			control: oComponent,
			layer: Layer.CUSTOMER
		});
		const aCustomerChanges = await PersistenceWriteAPI.save({
			selector: oComponent,
			layer: Layer.CUSTOMER,
			draft: true
		});
		const aUserChangesChanges = await PersistenceWriteAPI.save({
			selector: oComponent,
			layer: Layer.USER
		});

		if (bRevert) {
			const aChangesToRevert = aCustomerChanges.concat(aUserChangesChanges).reverse()
			.filter((oChange) => {
				// skip manifest changes
				return !oChange.isA("sap.ui.fl.apply._internal.flexObjects.AppDescriptorChange");
			});
			await Reverter.revertMultipleChanges(aChangesToRevert, {
				modifier: JsControlTreeModifier,
				appComponent: oComponent,
				reference: FlexRuntimeInfoAPI.getFlexReference({ element: oComponent })
			});
		}

		FlexTestAPI.clearStorage(SessionStorageConnector.storage);
	};

	RtaQunitUtils.getNumberOfChangesForTestApp = function() {
		return FlexTestAPI.getNumberOfStoredChanges("SessionStorage", "sap.ui.rta.qunitrta.Component");
	};

	RtaQunitUtils.renderTestAppAtAsync = function(sDomId) {
		disableRtaRestart();

		return Component.create({
			name: "sap.ui.rta.qunitrta",
			id: "Comp1",
			settings: {
				componentData: {
					showAdaptButton: true
				}
			}
		})
		.then(function(oComponent) {
			return oComponent.oView
			.then(function() {
				return new ComponentContainer({
					component: oComponent,
					async: true
				});
			});
		})
		.then(async function(oComponentContainer) {
			oComponentContainer.placeAt(sDomId);
			await nextUIUpdate();

			return oComponentContainer;
		});
	};

	RtaQunitUtils.renderRuntimeAuthoringAppAt = function(sDomId) {
		disableRtaRestart();
		return Component.create({
			name: "sap.ui.rta.test",
			id: "Comp1",
			settings: {
				componentData: {
					showAdaptButton: true,
					useSessionStorage: true
				}
			}
		})
		.then(function(oComponent) {
			return oComponent.oView
			.then(function() {
				return new ComponentContainer({
					component: oComponent,
					async: true
				});
			});
		})
		.then(async function(oComponentContainer) {
			oComponentContainer.placeAt(sDomId);
			await nextUIUpdate();
			return oComponentContainer;
		});
	};

	RtaQunitUtils.simulateRename = function(sandbox, sNewLabel, fnStartRenameCallback, fnExpectError) {
		return new Promise(function(resolve) {
			const oCreatePopupStub = sandbox.stub(RenameDialog.prototype, "_createPopup");
			oCreatePopupStub.callsFake(async function(...args) {
				const oPopover = await oCreatePopupStub.wrappedMethod.apply(this, args);
				oPopover.attachAfterOpen(() => {
					oPopover.attachAfterClose(() => {
						oCreatePopupStub.restore();
						resolve();
					});

					const oInput = oPopover.getContent()[0].getItems()[1];
					oInput.setValue(sNewLabel);
					oInput.fireLiveChange({ value: sNewLabel });
					if (fnExpectError) {
						fnExpectError(oInput.getValueStateText());
						oPopover.getEndButton().firePress();
						return;
					}
					oPopover.getBeginButton().firePress();
				});
				return oPopover;
			});
			fnStartRenameCallback();
		});
	};

	RtaQunitUtils.openContextMenuWithKeyboard = function(oTarget) {
		return new Promise(function(resolve) {
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", resolve);

			var oEvent = new KeyboardEvent("keyup", {
				keyCode: KeyCodes.F10,
				which: KeyCodes.F10,
				shiftKey: true,
				altKey: false,
				metaKey: false,
				ctrlKey: false
			});
			oTarget.getDomRef().dispatchEvent(oEvent);
		}.bind(this));
	};

	RtaQunitUtils.openContextMenuWithClick = function(oTarget, sinon) {
		return new Promise(function(resolve) {
			this.oRta.getPlugins().contextMenu.attachEventOnce("openedContextMenu", resolve);

			var clock = sinon.useFakeTimers();
			QUnitUtils.triggerMouseEvent(oTarget.getDomRef(), "contextmenu");
			clock.tick(50);
			clock.restore();
		}.bind(this));
	};

	RtaQunitUtils.closeContextMenu = function(oTarget) {
		return new Promise(function(resolve) {
			this.oRta.getPlugins().contextMenu.attachEventOnce("closedContextMenu", resolve);
			oTarget.close();
		}.bind(this));
	};

	RtaQunitUtils.getContextMenuItemCount = function(oTarget) {
		return new Promise(function(resolve) {
			var iItemCount;
			oTarget.focus();
			oTarget.setSelected(true);
			RtaQunitUtils.openContextMenuWithKeyboard.call(this, oTarget)
			.then(function() {
				var { oContextMenuControl } = this.oRta.getPlugins().contextMenu;
				iItemCount = oContextMenuControl.getItems().length;
				return oContextMenuControl;
			}.bind(this))
			.then(RtaQunitUtils.closeContextMenu.bind(this))
			.then(function() {
				resolve(iItemCount);
			});
		}.bind(this));
	};

	RtaQunitUtils.createAndStubAppComponent = function(sandbox, sId, oManifest, oContent, oAsyncHints) {
		sId ||= "someName";
		oManifest ||= {
			"sap.app": {
				id: sId,
				type: "application"
			}
		};
		var Component = UIComponent.extend("component", {
			metadata: {
				manifest: oManifest
			},
			createContent() {
				return oContent;
			}
		});

		var oComponent = new Component(sId, { _componentConfig: { asyncHints: oAsyncHints } });
		sandbox.stub(flUtils, "getAppComponentForControl").returns(oComponent);
		oComponent._restoreGetAppComponentStub = flUtils.getAppComponentForControl.restore;
		return oComponent;
	};

	RtaQunitUtils.createUIChange = function(oFileContent) {
		return FlexObjectFactory.createFromFileContent(oFileContent);
	};

	RtaQunitUtils.stubSapUiRequire = function(...aArgs) {
		return FlQUnitUtils.stubSapUiRequire.apply(undefined, aArgs);
	};

	RtaQunitUtils.showActionsMenu = function(oToolbar) {
		return oToolbar.showActionsMenu({
			getSource() {
				return oToolbar.getControl("actionsMenu");
			}
		});
	};

	RtaQunitUtils.createToolbarControlsModel = function() {
		return new JSONModel({
			changesNeedHardReload: false,
			modeSwitcher: "adaptation",
			undo: {
				enabled: false
			},
			redo: {
				enabled: false
			},
			save: {
				enabled: false
			},
			restore: {
				enabled: false
			},
			appVariantMenu: {
				overview: {
					visible: false,
					enabled: false
				},
				saveAs: {
					visible: false,
					enabled: false
				},
				manageApps: {
					visible: false,
					enabled: false
				}
			},
			contextBasedAdaptation: {
				visible: false,
				enabled: false
			},
			actionsMenuButton: {
				enabled: true
			},
			visualizationButton: {
				visible: false,
				enabled: false
			}
		});
	};

	RtaQunitUtils.waitForMethodCall = function(sandbox, oObject, sMethodName) {
		// Returns a promise which is resolved with the return value
		// of the given method after it was first called
		// Doesn't work with event handlers
		return new Promise(function(resolve) {
			sandbox.stub(oObject, sMethodName)
			.callsFake(function(...aArgs) {
				if (oObject[sMethodName].wrappedMethod) {
					const oResult = oObject[sMethodName].wrappedMethod.apply(this, aArgs);
					resolve(oResult);
				}
			});
		})
		.then(function() {
			oObject[sMethodName].restore();
		});
	};

	return RtaQunitUtils;
});