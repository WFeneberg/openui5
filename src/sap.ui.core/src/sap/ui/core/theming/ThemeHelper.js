/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/base/future',
	'sap/base/Log'
], function (future, Log) {
	"use strict";

	var mLibThemeMetadata = {};


	// Theme defaulting
	const DEFAULT_THEME = "sap_horizon";

	// dark mode detection
	const bDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

	// Theme Fallback for variants
	const rThemeVariantPattern = /(_hcb|_hcw|_dark)$/g;

	/**
	 * The list of all known themes incl. their variants.
	 * Any SAP theme outside this list will receive a fallback to the predefined default theme.
	 *
	 * Note: This list needs to be updated on each release and/or removal of a theme.
	 */
	const aKnownThemes = [
		// horizon
		"sap_horizon",
		"sap_horizon_dark",
		"sap_horizon_hcb",
		"sap_horizon_hcw",

		// fiori_3
		"sap_fiori_3",
		"sap_fiori_3_dark",
		"sap_fiori_3_hcb",
		"sap_fiori_3_hcw"
	];

	// cache for already calculated theme fallbacks
	const mThemeFallbacks = {};

	/**
	 *
	 * @since 1.92.0
	 * @alias sap.ui.core.theming.ThemeHelper
	 * @static
	 * @namespace
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var ThemeHelper = {};

	ThemeHelper.reset = function () {
		mLibThemeMetadata = {};
	};

	ThemeHelper.getMetadata = function (sLibId) {
		if (!sLibId) {
			return null;
		}

		var sLibName = sLibId.replace("sap-ui-theme-", "").replace(/\./g, "-");
		if (mLibThemeMetadata[sLibName]) {
			return mLibThemeMetadata[sLibName];
		}

		var oMetadataElement = document.createElement("span");
		oMetadataElement.classList.add("sapThemeMetaData-UI5-" + sLibName);
		document.documentElement.appendChild(oMetadataElement);
		var sDataUri = window.getComputedStyle(oMetadataElement).getPropertyValue("background-image");
		document.documentElement.removeChild(oMetadataElement);

		var aDataUriMatch = /\(["']?data:text\/plain;utf-8,(.*?)['"]?\)/i.exec(sDataUri);
		if (!aDataUriMatch || aDataUriMatch.length < 2) {
			return null;
		}

		var sMetaData = aDataUriMatch[1];

		// [COMPATIBILITY]: The following lines of code are moved unchanged from ThemeManager in order to not introduce any regressions but
		// neverteheless it's not fully clear if detection of URI encoding and URI decoding itself (especially manual encoding of spaces)
		// is necessary

		// Try to detect URI encoding by checking for first and last character for not encoded characters
		if (sMetaData.charAt(0) !== "{" && sMetaData.charAt(sMetaData.length - 1) !== "}") {
			try {
				sMetaData = decodeURI(sMetaData);
			} catch (ex) {
				// ignore
			}
		}

		// Remove superfluous escaping of double quotes
		sMetaData = sMetaData.replace(/\\"/g, '"');

		// Replace encoded spaces => not clear if this is really necessary and if there is any valid case where spaces are URI encoded
		//							 but we could not detect URI encoding. Keep coding in order to avoid regression.
		var sMetadataJSON = sMetaData.replace(/%20/g, " ");

		var oMetadata;
		try {
			oMetadata = JSON.parse(sMetadataJSON);
			mLibThemeMetadata[sLibName] = oMetadata;
		} catch (ex) {
			future.errorThrows("Could not parse theme metadata for library " + sLibName + ".");
		}
		return oMetadata;
	};

	/**
	 * Validates the given theme and changes it to the predefined standard fallback theme if needed.
	 *
	 * An SAP standard theme is considered invalid when it is either:
	 *   - not available anymore (deprecated & removed)
	 *   - not yet available (meaning: released in future versions)
	 *
	 * Invalid themes will be defaulted to the predetermined standard default theme.
	 *
	 * Themes for which a theme root exists are expected to be served from their given origin
	 * and will not be adapted.
	 *
	 * @param {string} sTheme the theme to be validated
	 * @param {string|null} sThemeRoot the theme root url for the given theme
	 * @returns {string} the validated and transformed theme name
	 */
	ThemeHelper.validateAndFallbackTheme = function(sTheme, sThemeRoot) {
		// check cache for already determined fallback
		// only do this for themes from the default location (potential SAP standard themes)
		if (sThemeRoot == null && mThemeFallbacks[sTheme]) {
			return mThemeFallbacks[sTheme];
		}

		let sNewTheme = sTheme;

		// We only fallback for a very specific set of themes:
		//  * no theme-root is given (themes from a different endpoint (i.e. theming-service) are excluded) and
		//  * the given theme is a standard SAP theme ('sap_' prefix)
		//  * not supported in this version
		if (sThemeRoot == null && sTheme.startsWith("sap_") && aKnownThemes.indexOf(sTheme) == -1) {
			// extract the theme variant if given: "_hcb", "_hcw", "_dark"
			const sVariant = sTheme.match(rThemeVariantPattern)?.[0] || "";

			sNewTheme = `${DEFAULT_THEME}${sVariant}`;

			mThemeFallbacks[sTheme] = sNewTheme;

			Log.warning(`The configured theme '${sTheme}' is not yet or no longer supported in this version. The valid fallback theme is '${sNewTheme}'.`, "Theming");
		}

		return sNewTheme;
	};

	ThemeHelper.getDefaultThemeInfo = function() {
		return {
			DEFAULT_THEME: DEFAULT_THEME,
			DARK_MODE: bDarkMode
		};
	};

	/**
	 * Checks whether the theme is a SAP delivered standard theme or not.
	 *
	 * @param {string} sTheme Name of the theme to check
	 * @returns {boolean} true if the theme is a standard theme, false otherwise
	 * @private
	 * @ui5-restricted sap.ui.core.Theming, sap.ui.core.theming.ThemeManager
	 * @since 1.135
	 */
	ThemeHelper.isStandardTheme = function(sTheme) {
		return sTheme.startsWith("sap_") || sTheme === "base";
	};

	return ThemeHelper;
});
