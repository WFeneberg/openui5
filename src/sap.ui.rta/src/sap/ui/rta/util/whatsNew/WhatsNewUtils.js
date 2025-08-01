/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/fl/apply/api/FlexRuntimeInfoAPI",
	"sap/ui/rta/Utils",
	"sap/ui/rta/util/whatsNew/whatsNewContent/WhatsNewFeatures"
], function(
	FlexRuntimeInfoAPI,
	RtaUtils,
	WhatsNewFeatures
) {
	"use strict";

	function filterDontShowAgainFeatures(aFeatures, aDontShowAgainFeatureIds) {
		return aFeatures.filter((oFeature) => {
			return !aDontShowAgainFeatureIds?.includes(oFeature.featureId);
		});
	}

	async function filterApplicableFeatures(aFeatures, sLayer) {
		const aAreFeaturesApplicable = await Promise.all(
			aFeatures.map((oFeature) => {
				if (typeof oFeature.isFeatureApplicable === "function") {
					return oFeature.isFeatureApplicable(sLayer);
				}
				return true;
			})
		);

		const aFilteredFeatures = aFeatures.filter((oFeature, iIndex) => {
			return aAreFeaturesApplicable[iIndex];
		});

		return aFilteredFeatures;
	}

	const WhatsNewUtils = {
		/**
		 * Get the URL for the feature documentation
		 * @param {string} sPath - The path of the feature, including the index
		 * @param {Array} aFeatureCollection - Feature collection
		 * @returns {string} URL for the feature documentation
		 */
		getLearnMoreURL(sPath, aFeatureCollection) {
			const iFeaturePageIndex = sPath.slice(-1);
			const bIsS4Hana = !!FlexRuntimeInfoAPI.getSystem();

			if (bIsS4Hana) {
				if (RtaUtils.isS4HanaCloud()) {
					return aFeatureCollection[iFeaturePageIndex].documentationUrls.s4HanaCloudUrl;
				}

				return aFeatureCollection[iFeaturePageIndex].documentationUrls.s4HanaOnPremUrl;
			}

			return aFeatureCollection[iFeaturePageIndex].documentationUrls.btpUrl;
		},

		/**
		 * Filters the new features based on the dontShowAgain feature IDs and the Flex settings
		 * @param {string[]} aDontShowAgainFeatureIds - Array of feature IDs that should be excluded
		 * from the What's New dialog
		 * @param {string} sLayer - Layer for which the features should be filtered
		 * @returns {object[]} Filtered What's New features
		 */
		getFilteredFeatures(aDontShowAgainFeatureIds, sLayer) {
			const aAllFeatures = WhatsNewFeatures.getAllFeatures();
			const aNewFeatures = filterDontShowAgainFeatures(aAllFeatures, aDontShowAgainFeatureIds);
			return filterApplicableFeatures(aNewFeatures, sLayer);
		}
	};

	return WhatsNewUtils;
});