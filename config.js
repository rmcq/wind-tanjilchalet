// Constants for Local Storage Keys
export const SHOT_STORAGE_KEY = 'wind_calculator_shots';
export const PRESET_STORAGE_KEY = 'wind_calculator_presets';
export const LAST_UPDATE_KEY = 'wind_calculator_last_updates';
export const ANALYSIS_SETTINGS_KEY = 'wind_calculator_analysis_settings';
export const MULTIPLIER_HISTORY_KEY = 'wind_calculator_multiplier_history';
export const STOPWATCH_SETTINGS_KEY = 'wind_calculator_stopwatch_settings';
export const GREEN_FIRMNESS_SETTINGS_KEY = 'wind_calculator_green_firmness_settings';
export const STOPWATCH_CUES_KEY = 'wind_calculator_stopwatch_cues';
export const LIE_CUES_STORAGE_KEY = 'wind_calculator_lie_cues';
export const SESSION_NOTES_KEY = 'wind_calculator_session_notes';
export const ROLL_SETTINGS_KEY = 'wind_calculator_roll_settings';
export const CLUB_RANGES_STORAGE_KEY = 'wind_calculator_club_ranges';
export const DTP_COUNTER_MODE_KEY = 'wind_calculator_dtp_counter_mode';
export const ACTIVE_CLUBS_STORAGE_KEY = 'wind_calculator_active_clubs';
export const PLAYER_HANDEDNESS_KEY = 'wind_calculator_player_handedness';
export const POWER_SETTING_KEY = 'wind_calculator_power_setting';
export const CUP_SUGGESTION_SETTINGS_KEY = 'wind_calculator_cup_suggestion_settings';
export const GREEN_GRID_MULTIPLIER_KEY = 'wind_calculator_green_grid_multiplier';
export const SHOT_DATA_SOURCE_KEY = 'wind_calculator_shot_source_filename';
export const MULTIPLIER_DATA_SOURCE_KEY = 'wind_calculator_multiplier_source_filename';
export const SETTINGS_DATA_SOURCE_KEY = 'wind_calculator_settings_source_filename';

// General Constants
export const MAX_HISTORY_ITEMS = 10;
export const BONUS_AMOUNT = 50;
export const EPSILON = 1e-6;
export const DISPLAY_EPSILON = 0.01;
export const MAX_ACTIVE_CLUBS = 13;

// Analysis Thresholds
export const MIN_WIND_FOR_AVG_ERROR = 1.0;
export const MIN_WIND_FOR_RECOMMENDATION_CALC = 0.5;
export const MIN_SHOTS_FOR_RECOMMENDATION = 3;
export const HIGH_CONFIDENCE_STD_DEV_THRESHOLD = 0.10;
export const MEDIUM_CONFIDENCE_STD_DEV_THRESHOLD = 0.20;

export const WIND_CATEGORIES_MAP = { // UPDATED
        'low': { min: 0, max: 5, label: 'Low 0-5' },
        'medium': { min: 6, max: 10, label: 'Medium 6-10' },
        'high1': { min: 11, max: 13, label: 'High 1 11-13' },
        'high2': { min: 14, max: 16, label: 'High 2 14-16' },
        'veryHigh1': { min: 17, max: 20, label: 'V High 1 17-20' },
        'veryHigh2': { min: 21, max: 24, label: 'V High 2 21-24' },
        'veryHigh3': { min: 25, max: 30, label: 'V High 3 25+' }
    };
    
    // NEW: Percentage-based buffers to dampen recommendations in low wind
export const WIND_BUFFER_PERCENTAGES = {
        'low': 1.00,      // 100% buffer
        'medium': 0.50,   // 50% buffer
        'high1': 0.25,
        'high2': 0.20,
        'veryHigh1': 0.15,
        'veryHigh2': 0.10,
        'veryHigh3': 0.05
    };
    
    // Constants for array/iteration order
export const WIND_CATEGORIES_ORDER = ['low', 'medium', 'high1', 'high2', 'veryHigh1', 'veryHigh2', 'veryHigh3'];

    // Analysis Component Keys (unchanged, used for internal grouping)
export const ANALYSIS_COMPONENTS_ORDER = [
        'Headwind',
        'Tailwind',
        'Assist Crosswind',
        'Opposed Crosswind'
    ];
export const defaultGreenFirmnessPresets = {
        'very_soft': { label: 'Very Soft', multiplier: 0.70 },
        'soft': { label: 'Soft', multiplier: 0.80 },
        'moderate': { label: 'Moderate', multiplier: 0.90 },
        'firm': { label: 'Firm', multiplier: 1.00 },
        'very_firm': { label: 'Very Firm', multiplier: 1.15 },
        'extremely_firm': { label: 'Extremely Firm', multiplier: 1.30 },
        'ultra_firm': { label: 'Ultra Firm', multiplier: 1.50 }
    };

    // NEW: Default Roll Settings
export const defaultRollSettings = {
        greenSpeed: 151,
        headwindRollPercent: 35,
        tailwindRollPercent: 25,
        windRollSensitivity: 40
    };
export const greenFirmnessOrder = ['very_soft', 'soft', 'moderate', 'firm', 'very_firm', 'extremely_firm', 'ultra_firm'];
export const defaultRollSettings = {
        greenSpeed: 151,
        headwindRollPercent: 35,
        tailwindRollPercent: 25,
        windRollSensitivity: 40
    };
    // NEW: Default settings for cup arrow suggestions
export const defaultCupSuggestionSettings = {
        confidenceThreshold: 75,
        leewayFactor: 0.75,
        arrowThreshold: 0.5
    };
export const defaultStopwatchCues = [
        { min: 0.01, max: 0.99, text: '5 cups', value: 5, enabled: true },
        { min: 1.00, max: 1.99, text: '4 cups', value: 4, enabled: true },
        { min: 2.00, max: 2.79, text: '3 cups', value: 3, enabled: true },
        { min: 2.80, max: 3.89, text: '2 cups', value: 2, enabled: true },
        { min: 3.90, max: 6.59, text: '1 cup', value: 1, enabled: true },
        { min: 6.60, max: 12.49, text: '0.5 cups', value: 0.5, enabled: true },
        { min: 12.50, max: 30.00, text: '0.25 cups', value: 0.25, enabled: true },
        { min: 0.00, max: 0.00, text: '', value: 0, enabled: false },
        { min: 0.00, max: 0.00, text: '', value: 0, enabled: false },
        { min: 0.00, max: 0.00, text: '', value: 0, enabled: false },
    ];
export const defaultLieCues = [
        { min: 0.01, max: 0.39, text: '8%', value: 8.0, enabled: true },
        { min: 0.40, max: 0.74, text: '6%', value: 6.0, enabled: true },
        { min: 0.75, max: 1.09, text: '4%', value: 4.0, enabled: true },
        { min: 1.10, max: 1.34, text: '3%', value: 3.0, enabled: true },
        { min: 1.35, max: 1.79, text: '2.5%', value: 2.5, enabled: true },
        { min: 1.80, max: 2.49, text: '1.5%', value: 1.5, enabled: true },
        { min: 2.50, max: 4.99, text: '0.5%', value: 0.5, enabled: true },
        { min: 5.00, max: 7.99, text: '0.2%', value: 0.2, enabled: true },
        { min: 8.00, max: 9.99, text: 'Flat', value: 0.0, enabled: true },
        { min: 0.00, max: 0.00, text: '', value: 0, enabled: false },
    ];
export const defaultClubPresets = {
        // Wedges (based on old 62)
        '62°': {
            windCategories: {
                'low': { hw: 0.50, tw: 1.00, acw: 0.70, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 0.70, ocw: 1.00 },
                'high1': { hw: 1.00, tw: 0.50, acw: 0.70, ocw: 1.00 },
                'high2': { hw: 1.00, tw: 0.50, acw: 0.70, ocw: 1.00 },
                'veryHigh1': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 }
            },
            r: 2.0
        },'60°': {
            windCategories: {
                'low': { hw: 0.50, tw: 1.00, acw: 0.70, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 0.70, ocw: 1.00 },
                'high1': { hw: 1.00, tw: 0.50, acw: 0.70, ocw: 1.00 },
                'high2': { hw: 1.00, tw: 0.50, acw: 0.70, ocw: 1.00 },
                'veryHigh1': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 }
            },
            r: 2.0
        },'56°': {
            windCategories: {
                'low': { hw: 0.50, tw: 1.00, acw: 0.70, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 0.70, ocw: 1.00 },
                'high1': { hw: 1.00, tw: 0.50, acw: 0.70, ocw: 1.00 },
                'high2': { hw: 1.00, tw: 0.50, acw: 0.70, ocw: 1.00 },
                'veryHigh1': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 }
            },
            r: 2.0
        },'52°': {
            windCategories: {
                'low': { hw: 0.50, tw: 1.00, acw: 0.70, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 0.70, ocw: 1.00 },
                'high1': { hw: 1.00, tw: 0.50, acw: 0.70, ocw: 1.00 },
                'high2': { hw: 1.00, tw: 0.50, acw: 0.70, ocw: 1.00 },
                'veryHigh1': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 }
            },
            r: 2.0
        },'50°': {
            windCategories: {
                'low': { hw: 0.50, tw: 1.00, acw: 0.70, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 0.70, ocw: 1.00 },
                'high1': { hw: 1.00, tw: 0.50, acw: 0.70, ocw: 1.00 },
                'high2': { hw: 1.00, tw: 0.50, acw: 0.70, ocw: 1.00 },
                'veryHigh1': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.30, tw: 0.50, acw: 1.40, ocw: 1.00 }
            },
            r: 3.0
        },
        // Woods (based on old W)
        'D': {
            windCategories: {
                'low': { hw: 1.30, tw: 1.50, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 },
                'high1': { hw: 1.30, tw: 1.30, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 1.30, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 }
            },
            r: 30.0
        },'3W': {
            windCategories: {
                'low': { hw: 1.30, tw: 1.50, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 },
                'high1': { hw: 1.30, tw: 1.30, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 1.30, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 }
            },
            r: 25.0
        },'5W': {
            windCategories: {
                'low': { hw: 1.30, tw: 1.50, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 },
                'high1': { hw: 1.30, tw: 1.30, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 1.30, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 }
            },
            r: 22.0
        },'7W': {
            windCategories: {
                'low': { hw: 1.30, tw: 1.50, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 },
                'high1': { hw: 1.30, tw: 1.30, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 1.30, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 }
            },
            r: 20.0
        },
        // Short Irons (based on old 7-PW)
        'PW': {
            windCategories: {
                'low': { hw: 1.50, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'high1': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 0.70, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 0.70, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 0.70, acw: 1.40, ocw: 1.00 }
            },
            r: 3.0
        },'9': {
            windCategories: {
                'low': { hw: 1.50, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'high1': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 0.70, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 0.70, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 0.70, acw: 1.40, ocw: 1.00 }
            },
            r: 5.0
        },'8': {
            windCategories: {
                'low': { hw: 1.50, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'high1': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 0.70, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 0.70, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 0.70, acw: 1.40, ocw: 1.00 }
            },
            r: 6.0
        },'7': {
            windCategories: {
                'low': { hw: 1.50, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'high1': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 0.70, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 0.70, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 0.70, acw: 1.40, ocw: 1.00 }
            },
            r: 7.0
        },
        // Long Irons / Hybrids (based on old 2-6)
        '6': {
            windCategories: {
                'low': { hw: 1.30, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 },
                'high1': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 }
            },
            r: 8.0
        },'5': {
            windCategories: {
                'low': { hw: 1.30, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 },
                'high1': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 }
            },
            r: 10.0
        },'4': {
            windCategories: {
                'low': { hw: 1.30, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 },
                'high1': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 }
            },
            r: 14.0
        },'3': {
            windCategories: {
                'low': { hw: 1.30, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 },
                'high1': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 }
            },
            r: 16.0
        },'2': {
            windCategories: {
                'low': { hw: 1.30, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 },
                'high1': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 }
            },
            r: 16.0
        },'5H': {
            windCategories: {
                'low': { hw: 1.30, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 },
                'high1': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 }
            },
            r: 12.0
        },'3H': {
            windCategories: {
                'low': { hw: 1.30, tw: 1.00, acw: 1.00, ocw: 1.00 }, 
                'medium': { hw: 1.00, tw: 1.00, acw: 1.00, ocw: 1.00 },
                'high1': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'high2': { hw: 1.30, tw: 0.70, acw: 1.00, ocw: 1.00 },
                'veryHigh1': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh2': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 },
                'veryHigh3': { hw: 1.50, tw: 1.00, acw: 1.40, ocw: 1.00 }
            },
            r: 16.0
        },
    };
export const defaultClubBaseRanges = {
        'D': { min: 287, max: 296, order: 1 },
        '3W': { min: 253, max: 260, order: 2 },
        '5W': { min: 229, max: 243, order: 3 },
        '7W': { min: 212, max: 228, order: 4 },
        '3H': { min: 225, max: 236, order: 5 },
        '5H': { min: 203, max: 218, order: 6 },
        '2': { min: 225, max: 237, order: 7 },
        '3': { min: 215, max: 227, order: 8 },
        '4': { min: 204, max: 217, order: 9 },
        '5': { min: 191, max: 204, order: 10 },
        '6': { min: 179, max: 193, order: 11 },
        '7': { min: 168, max: 182, order: 12 },
        '8': { min: 156, max: 170, order: 13 },
        '9': { min: 146, max: 159, order: 14 },
        'PW': { min: 130, max: 143, order: 15 },
        '50°': { min: 117, max: 128, order: 16 },
        '52°': { min: 112, max: 123, order: 17 },
        '56°': { min: 103, max: 113, order: 18 },
        '60°': { min: 92, max: 101, order: 19 },
        '62°': { min: 88, max: 97, order: 20 },
    };
export const CLUB_CATEGORIES = {
        'D': 'woods', '3W': 'woods', '5W': 'woods', '7W': 'woods',
        '3H': 'irons', '5H': 'irons', '2': 'irons', '3': 'irons', '4': 'irons', '5': 'irons', '6': 'irons', '7': 'irons', '8': 'irons', '9': 'irons',
        'PW': 'wedges', '50°': 'wedges', '52°': 'wedges', '56°': 'wedges', '60°': 'wedges', '62°': 'wedges'
    };

    // NEW: Default active clubs (a standard 13-club set)
export const DEFAULT_ACTIVE_CLUBS = [
        'D', '3W', '5H', '4', '5', '6', '7', '8', '9', 'PW', '50°', '56°', '60°'
    ];

export const MAX_ACTIVE_CLUBS = 13;

// End of config.js
