/*!
 * ${copyright}
 */

sap.ui.define(["sap/ui/core/Lib"],
	function(CoreLib) {
	"use strict";

	var oRb = CoreLib.getResourceBundleFor("sap.m");

	var FeedInputRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} oRm the RenderManager that can be used for writing to the render output buffer
	 * @param {sap.m.FeedInput} oControl an object representation of the control that should be rendered
	 */
	FeedInputRenderer.render = function (oRm, oControl) {
		var sMyId = oControl.getId();
		var oActionButton = oControl._getActionButtonIfValid();

		oRm.openStart("div", oControl);
		oRm.class("sapMFeedInBase");
		oRm.attr("role", "group");
		oRm.attr("aria-label", oRb.getText("FEED_INPUT_ARIA_LABEL"));
		oRm.openEnd();
		oRm.openStart("div", sMyId + "-outerContainer");
		oRm.class("sapMFeedIn");
		if (!oControl.getShowIcon()) {
			oRm.class("sapMFeedInNoIcon");
		}
		if (!oControl.getEnabled()) {
			oRm.class("sapMFeedInDisabled");
		}
		oRm.openEnd();
		if (oControl.getShowIcon()) {
			this._addImage(oRm, oControl, sMyId);
		}
		oRm.openStart("div", sMyId + "-container");
		oRm.class("sapMFeedInContainer");
		if (oActionButton) {
			oRm.class("sapMFeedInAcitonButtonContainer");
		}
		oRm.openEnd();
		var oTextArea = oControl._getTextArea();
		oRm.renderControl(oTextArea);
		if (oActionButton) {
			oRm.renderControl(oActionButton.addStyleClass("sapMFeedInActionButton"));
		}
		oRm.renderControl(oControl._getPostButton());
		oRm.close("div");
		oRm.close("div");
		oRm.openStart("div", sMyId + "-counterContainer");
		oRm.class("sapMFeedInCounter");
		oRm.openEnd();
		oRm.close("div");
		oRm.close("div");
	};

	FeedInputRenderer._addImage = function (oRm, oControl, sMyId) {
		oRm.openStart("figure", sMyId + '-figure').class("sapMFeedInFigure");
		if (!oControl.getIcon()) {
			oRm.class("sapMFeedListItemIsDefaultIcon");
		}
		oRm.openEnd();
		oRm.renderControl(oControl._getAvatar());
		oRm.close("figure");
	};

	return FeedInputRenderer;

}, /* bExport= */ true);