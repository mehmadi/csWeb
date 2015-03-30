﻿module Translations {
    export class English {
        public static locale        : ng.translate.ITranslationTable = {
            CANCEL_BTN              : 'Cancel',
            OK_BTN                  : 'OK',
            MAP                     : 'Maps',
            MAP_LABEL               : 'Map',
            TABLE_LABEL             : 'Table',
            LAYERS                  : 'Layers',
            FILTERS                 : 'Filters',
            FILTER_INFO             : 'At the moment, no filters have been selected. In order to add a filter, click on an icon or area on the map, and click on the filter icon (<span class="fa fa-filter"></span>) in the right menu. This will create a filter for the selected property.',
            STYLES                  : 'Styles',
            STYLE_INFO              : 'At the moment, no style has been selected. In order to add a style, click on an icon or area on the map, and click on the style icon (<span class="fa fa-eye"></span>) in the right menu. This will create a filter for the selected property.',
            FEATURES                : 'Features',
            LEGEND                  : 'Legend',
            SEARCH                  : 'Search',
            MAP_FEATURES            : 'Map features',
            SPEEDS_TAOUFIK          : 'speed colors Taoufik',
            SPEEDS_GOOGLEMAPS       : 'speed colors Google Maps',
            PERCENTAGES_V1          : 'percentages v1',
            ORANGE_RED              : 'orange - red',
            WHITE_RED               : 'white - red',
            RED_WHITE               : 'red - white',
            GREEN_RED               : 'green - red',
            RED_GREEN               : 'red - green',
            BLUE_RED                : 'blue - red',
            RED_BLUE                : 'red - blue',
            WHITE_BLUE              : 'white - blue',
            BLUE_WHITE              : 'blue - white',
            WHITE_GREEN             : 'white - green',
            GREEN_WHITE             : 'green - white',
            WHITE_ORANGE            : 'white - orange',
            ORANGE_WHITE            : 'orange - white',
            LAYER_SERVICE           : {
                RELOAD_PROJECT_TITLE: 'Data is reloaded',
                RELOAD_PROJECT_MSG  : 'After switching the language, we need to reload all the map data. Our appologies for the inconvenience.'
            },
            MCA                     : {
                DESCRIPTION         : '<h4>Multi-Criteria Analysis</h4><p  style="text-align: left; margin-left:5px;">MCA, is a method that combines multiple properties of a feature on the map into a new property. It achieves this by:<ol><li>Scaling each property to a range between 0 (no value) and 1 (maximum value).</li><li>Weighing each property relative to the others, where a weight less than 0 indicates you wish to avoid it, 0 is ignored, and a value greater than 0 is prefered.</li></ol> In fact, it is a kind of linear regression.',
                INFO                : 'At the moment, no map layers are loaded that contain a multi-criteria analysis. Open another map layer to see it.',
                INFO_EXPERT         : 'At the moment, no map layers are loaded that contain a multi-criteria analysis. Open another map layer to use it, or create a new MCA using the wizard.',
                SHOW_FEATURE_MSG    : 'Select a feature on the map to see the effects of the Multi-Criteria Analysis (MCA).',
                TOTAL_RESULT        : 'Combined result',
                DELETE_MSG          : 'Delete "{0}"',
                DELETE_MSG2         : 'Are you sure?',
                HAS_CATEGORY        : '  Has category? ',
                HAS_RANK            : '  Include rank? ',
                EDITOR_TITLE        : 'MCA Editor',
                MAIN_FEATURE        : 'Select the main feature',
                PROPERTIES          : 'Select the properties',
                INCLUDE_RANK        : '  Show rank? ',
                RANK_TITLE          : '[Rank title...]',
                TITLE               : 'Title... *',
                CATEGORY_MSG        : '[Category...]',
                TOGGLE_SPARKLINE    : 'Show or hide bar charts and scoring function.',
                SCALE_MIN_TITLE     : '[Min. scale]',
                SCALE_MAX_TITLE     : '[Max. scale]',
                MIN_VALUE           : '[Minimum (\u03BC-2\u03C3)]',
                MAX_VALUE           : '[Maximum (\u03BC+2\u03C3)]',
                MIN_CUTOFF_VALUE    : '[Ignore when below this value]',
                MAX_CUTOFF_VALUE    : '[Ignore when above this value]',
                LINEAR              : 'Linearly increasing function between min and max.',
                SIGMOID             : 'Tangentially increasing function between min and max',
                GAUSSIAN            : 'Normal distribution increasing function between min and max.',
                ADD_MCA             : 'Add a new MCA.',
                DELETE_MCA          : 'Delete the MCA.',
                EDIT_MCA            : 'Edit the MCA.'
            },
            PROJECTSETTINGS         : {
                TITLE               : 'Project Settings',
                DESCRIPTION         : 'Settings'
            },
            SHOW5                   : 'Show 5 items',
            SHOW10                  : 'Show 10 items',
            SHOW15                  : 'Show 15 items',
            SHOW20                  : 'Show 20 items',
            SHOW25                  : 'Show 25 items',
            SHOW30                  : 'Show 30 items',
            SHOW35                  : 'Show 35 items',
            SHOW40                  : 'Show 40 items'
        };
    }
} 