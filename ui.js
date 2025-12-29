// Import all constants from config
import * as Config from './config.js';

// Make all config constants available globally in this module
Object.keys(Config).forEach(key => {
window[key] = Config[key];
});
let pinDistance = 150; // NEW: For the DTP input
let allShotData = [];
let powerPercent = 100; // NEW: For power adjustment
let extraElevation = 0;
let isDragging = false;
let currentRotation = 0; 
let safetyLockActive = false; // REVISED: Renamed for clarity (UI lock)
let analysisLockActive = false; // NEW: For freezing calculations
let elevationPolarity = 1; 
let activeClubKey = '7'; 
let clubsWithActiveRecommendations = new Set(); // NEW: To track clubs with recommendations
let activeAnalysisClubKey = '7'; // This is the club being viewed in the Analysis panel
let recommendationCooldowns = {}; // NEW: To track when recommendations were applied
let multiplierHistory = {}; // NEW: To hold the history of all multiplier changes
let currentFirmnessIndex = 2; // NEW: Default to 'Firm' (index 2)
let shotBias = 'fade'; // 'fade' or 'draw'
let clubRangeChart = null; // NEW: To hold the club range chart instance
let shotChart = null; // NEW: To hold the Chart.js instance
let clubBaseRanges = {}; // NEW: Will be populated from storage or defaults
let clubPresets = {}; // Will be loaded from storage or defaults
let greenFirmnessPresets = {}; // Will be loaded from storage or defaults
let activeClubs = new Set(); // NEW: To hold the set of active club keys
let isPlotFiltered = false; // NEW: State for the plot filter button
let performanceTrendChart = null; // NEW: To hold the performance trend chart instance
let activePlotFilter = null; // NEW: To store the current table row filter {category, component}

// NEW: Default settings for cup arrow suggestions
let cupSuggestionSettings = { ...Config.defaultCupSuggestionSettings }; // Initialize with defaults
let selectedShotTimestamp = null; // NEW: To track the currently selected shot in the history

let dtpCounterMode = 'additive'; // NEW: 'additive' or 'cyclic'
let playerHandedness = 'right'; // NEW: 'right' or 'left'

// NEW: Stopwatch state variables
let stopwatchInterval = null;
let stopwatchStartTime = 0;
let stopwatchRunning = false;
let stopwatchCues = []; // NEW: To hold custom cue ranges
let lieCues = []; // NEW: To hold lie reading cues
let stopwatchBeepEnabled = true; // NEW: State for beep sound
let stopwatchTotalValue = 0; // NEW: For accumulation
let stopwatchAdditionCount = 0; // NEW: To count additions
let lastStopwatchValue = 0; // NEW: To hold the value of the last timed event
let stopwatchAdditions = []; // NEW: To hold the list of added values    
let lastStopwatchTrustScore = 0; // NEW: To hold trust score of last timed event
let lastStopwatchBias = 0; // NEW: To hold bias of last timed event
let originalStopwatchValue = 0; // NEW: To store the original value for the toggle
let isStopwatchValueHalved = false; // NEW: State for the toggle button
let audioCtx; // NEW: To hold the AudioContext for the beep sound
let stopwatchMode = 'green'; // NEW: 'green' or 'lie'
let lieTargetSlider = 'uphillDownhillLie'; // NEW: 'uphillDownhillLie' or 'feetLie'

let lastPotentialCupError = 0; // NEW: For dynamic arrow calculation
let liePolarity = 1; // NEW: 1 for Uphill, -1 for Downhill
// NEW: Default stopwatch cues
// DOM Element references
// NEW: DTP/HIT Block Elements
const dtpDisplay = document.getElementById('dtpDisplay');
const dtpClearBtn = document.getElementById('dtpClear');
const dtpResetBtn = document.getElementById('dtpReset');
const dtpButtons = document.querySelectorAll('.dtp-btn');
const hitDistanceDisplay = document.getElementById('hitDistanceDisplay');
const clubMatchDisplay = document.getElementById('clubMatchDisplay'); // NEW
const clubRangeMinDisplay = document.getElementById('clubRangeMinDisplay'); // NEW
const clubRangeMaxDisplay = document.getElementById('clubRangeMaxDisplay'); // NEW
const aimAdjustmentDisplay = document.getElementById('aimAdjustmentDisplay'); // NEW
const powerDecrementBtn = document.getElementById('powerDecrementBtn'); // NEW
const powerIncrementBtn = document.getElementById('powerIncrementBtn'); // NEW
const powerPercentDisplay = document.getElementById('powerPercentDisplay'); // NEW

const dialContainer = document.getElementById('windDialContainer');
const windDirectionArrow = document.getElementById('windDirectionArrow');
const windAngleDisplay = document.getElementById('windAngleDisplay'); 
const windSpeedSlider = document.getElementById('windSpeed');
const windSpeedValueNumeral = document.getElementById('windSpeedValueNumeral');
const windSpeedValueCategory = document.getElementById('windSpeedValueCategory');
const windDialSpeedDisplay = document.getElementById('windDialSpeedDisplay');
const safetyLockButton = document.getElementById('safetyLockButton'); // REVISED
const safetyLockIcon = document.getElementById('safetyLockIcon'); // REVISED
const analysisLockButton = document.getElementById('analysisLockButton'); // NEW
const analysisLockIcon = document.getElementById('analysisLockIcon'); // NEW
const multiplierSliders = document.querySelectorAll('.multiplier-slider');
const presetButtons = document.querySelectorAll('.grid-preset-btn');
const shotBiasToggleButton = document.getElementById('shotBiasToggleButton'); // NEW
const clubButtons = document.querySelectorAll('.club-btn'); // Calculator Club Buttons
const currentGridMultiplierDisplay = document.getElementById('currentGridMultiplierDisplay'); 
const snapButtons = document.querySelectorAll('#windDialContainer .snap-target');

// Elevation Elements
const elevationSlider = document.getElementById('elevation');
const polarityToggle = document.getElementById('elevationPolarityToggle');
const elevationPlus50Button = document.getElementById('elevationPlus50Button');
const resetBonusButton = document.getElementById('resetBonusButton');
const baseElevationDisplay = document.getElementById('baseElevationDisplay');
const baseElevationSliderDisplay = document.getElementById('baseElevationSliderDisplay'); // NEW
const extraElevationDisplay = document.getElementById('extraElevationDisplay'); 
const signedTotalElevationDisplay = document.getElementById('signedTotalElevationDisplay');
const polarityText = document.getElementById('polarityText');

// Multiplier Display Element
const aimMultiplierDisplay = document.getElementById('aimMultiplierDisplay');

// References to Multiplier Sliders 
const headwindSlider = document.getElementById('headwindMultiplier');
const tailwindSlider = document.getElementById('tailwindMultiplier');
const assistCrosswindSlider = document.getElementById('assistCrosswindMultiplier');
const opposedCrosswindSlider = document.getElementById('opposedCrosswindMultiplier');

// NEW: References to Multiplier Labels for highlighting
const headwindLabel = document.getElementById('headwindLabel');
const tailwindLabel = document.getElementById('tailwindLabel');
const assistCrosswindLabel = document.getElementById('assistCrosswindLabel');
const opposedCrosswindLabel = document.getElementById('opposedCrosswindLabel');

// NEW: Final Adjustment Elements
const finalAdjustmentValue = document.getElementById('finalAdjustmentValue');
const finalAdjustmentDescription = document.getElementById('finalAdjustmentDescription');
const finalGridAdjustmentDisplay = document.getElementById('finalGridAdjustmentDisplay');

// NEW: Roll Calculation Elements
const rollValueDisplay = document.getElementById('rollValueDisplay');
const baseRollInput = document.getElementById('baseRollInput'); // REVISED: Changed from display to input
// const baseRollDisplay = document.getElementById('baseRollDisplay'); // No longer needed
const defaultBaseRollDisplay = document.getElementById('defaultBaseRollDisplay'); // NEW & FIXED: To show the coded default
const greenSpeedInput = document.getElementById('greenSpeedInput');
const headwindRollPercentInput = document.getElementById('headwindRollPercent');
const tailwindRollPercentInput = document.getElementById('tailwindRollPercent');
const windRollSensitivityInput = document.getElementById('windRollSensitivity');
// NEW: View-only display fields for roll contributions
const hwRollEffectDisplay = document.getElementById('hwRollEffectDisplay');
const twRollEffectDisplay = document.getElementById('twRollEffectDisplay');
const sensitivityEffectDisplay = document.getElementById('sensitivityEffectDisplay');
const gsEffectDisplay = document.getElementById('gsEffectDisplay');
// NEW: Green Firmness Elements
const firmnessDecrementBtn = document.getElementById('firmnessDecrementBtn');
const firmnessIncrementBtn = document.getElementById('firmnessIncrementBtn');
const greenFirmnessDisplay = document.getElementById('greenFirmnessDisplay');
const firmnessEffectDisplay = document.getElementById('firmnessEffectDisplay');


// Shot Tracker Elements
const shotHistoryList = document.getElementById('shotHistoryList');
const authStatus = document.getElementById('authStatus');

// Analysis Elements
const analysisClubButtons = document.querySelectorAll('.analysis-club-btn');
const analysisResultsList = document.getElementById('analysisResultsList');
const currentAnalysisClubDisplay = document.getElementById('currentAnalysisClub');
const dataPointsCountDisplay = document.getElementById('dataPointsCount');
const recommendationList = document.getElementById('recommendationList');


// Constants for visual wind fill calculation
const MAX_WIND_SPEED_CAP = 30; 
const MIN_WIND_SPEED_VISUAL = -4; 
const VISUAL_RANGE = MAX_WIND_SPEED_CAP - MIN_WIND_SPEED_VISUAL; 





/**
 * Determines the wind category key based on speed.
 * @param {number} speed - The current wind speed.
 * @returns {string} The category key.
 */
function getWindCategory(speed) {
    if (speed >= WIND_CATEGORIES_MAP.veryHigh3.min) return 'veryHigh3';
    if (speed >= WIND_CATEGORIES_MAP.veryHigh2.min) return 'veryHigh2';
    if (speed >= WIND_CATEGORIES_MAP.veryHigh1.min) return 'veryHigh1';
    if (speed >= WIND_CATEGORIES_MAP.high2.min) return 'high2';
    if (speed >= WIND_CATEGORIES_MAP.high1.min) return 'high1';
    if (speed >= WIND_CATEGORIES_MAP.medium.min) return 'medium';
    return 'low';
}

/**
 * Formats the crosswind aim adjustment text (left/right).
 */
function formatAimAdjustment(aimAdjustment) {
    if (Math.abs(aimAdjustment) < DISPLAY_EPSILON) { // No adjustment
        return 'Center';
    } else if (aimAdjustment < 0) { // Negative value means aim right
        return `R ${Math.abs(aimAdjustment).toFixed(1)}`;
    } else {
        return `L ${Math.abs(aimAdjustment).toFixed(1)}`;
    }
}

/**
 * Finds other club keys that have the exact same set of ACTIVE wind multipliers 
 * for the current wind speed category.
 */
function findEquivalentClubs(activeKey, windSpeed, distanceWindSpeed, aimWindDirectionComponent) {
    if (!activeKey || !clubPresets[activeKey] || windSpeed < EPSILON) return [];

    const categoryKey = getWindCategory(windSpeed);
    const activeMultipliers = clubPresets[activeKey].windCategories[categoryKey];
    const equivalentKeys = [];
    
    const isHeadwindActive = distanceWindSpeed > EPSILON;
    const isTailwindActive = distanceWindSpeed < -EPSILON;
    const isAssistActive = aimWindDirectionComponent > EPSILON;
    const isOpposedActive = aimWindDirectionComponent < -EPSILON;
    
    const requiredKeys = [];
    
    if (isHeadwindActive) requiredKeys.push('hw');
    else if (isTailwindActive) requiredKeys.push('tw');
    
    if (isAssistActive) requiredKeys.push('acw');
    else if (isOpposedActive) requiredKeys.push('ocw');

    if (requiredKeys.length === 0) return [];
    
    for (const key in clubPresets) {
        if (key === activeKey) continue; 

        const currentMultipliers = clubPresets[key].windCategories[categoryKey];
        let matches = true;
        
        for (const type of requiredKeys) {
            if (Math.abs(currentMultipliers[type] - activeMultipliers[type]) >= EPSILON) {
                matches = false;
                break;
            }
        }

        if (matches) {
            equivalentKeys.push(key);
        }
    }

    return equivalentKeys;
}

/**
 * Calculates the standard deviation of an array of numbers.
 * @param {number[]} array The array of numbers.
 * @returns {number} The standard deviation.
 */
function calculateStandardDeviation(array) {
    if (array.length < 2) {
        return 0; // Std dev is not meaningful for less than 2 samples
    }
    const n = array.length;
    const mean = array.reduce((a, b) => a + b, 0) / n;
    // Using sample standard deviation (n-1)
    const variance = array.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    return Math.sqrt(variance);
}

/**
 * Calculates the median of an array after filtering out outliers using the IQR method.
 * This function is resilient and will fall back to the original median if filtering removes all data,
 * preventing downstream errors.
 * @param {number[]} array The array of numbers.
 * @returns {number} The robust median of the data.
 */
function calculateIQRMedian(array) {
    if (!array || array.length === 0) {
        return 0; // Should not happen with current checks, but safe.
    }

    const sorted = [...array].sort((a, b) => a - b);

    // Helper to get a quantile (like median or quartile) from a sorted array
    const getQuantile = (arr, q) => {
        const pos = (arr.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (arr[base + 1] !== undefined) {
            return arr[base] + rest * (arr[base + 1] - arr[base]);
        } else {
            return arr[base];
        }
    };

    // If the array is too small for IQR, just return the standard median.
    if (sorted.length < 4) {
        return getQuantile(sorted, 0.5);
    }

    const q1 = getQuantile(sorted, 0.25);
    const q3 = getQuantile(sorted, 0.75);
    const iqr = q3 - q1;

    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const filteredData = sorted.filter(x => x >= lowerBound && x <= upperBound);

    // CRITICAL: Use the median of filtered data, but fall back to the original median if filtering was too aggressive.
    return filteredData.length > 0 ? getQuantile(filteredData, 0.5) : getQuantile(sorted, 0.5);
}

/**
 * Updates the visual styles of all club buttons based on the active club and current wind speed/components.
 */
function updateClubButtonStyles(distanceWindSpeed, aimWindDirectionComponent, distanceMatchingClubs) {
    const windSpeed = parseFloat(windSpeedSlider.value) || 0; // This is correct
    
    const equivalentKeys = findEquivalentClubs(activeClubKey, windSpeed, distanceWindSpeed, aimWindDirectionComponent);

    clubButtons.forEach(btn => {
        const btnKey = btn.getAttribute('data-club');
        const isEquivalent = equivalentKeys.includes(btnKey); // This is correct
        const isDistanceMatch = distanceMatchingClubs.has(btnKey); // This is correct

        // Clear all highlight styles first
        btn.classList.remove(
            'active', 'text-black',                                 // Active style
            'club-distance-match',                                  // NEW: Distance match style
            'club-equivalent', 'text-fairway-blue', 'border-fairway-blue' // Multiplier equivalent style
        );

        // Reset button text to just the club key
        btn.textContent = btnKey;

        // Apply styles based on priority: Active > Distance Match > Equivalent
        if (btnKey === activeClubKey) {
            btn.classList.add('active', 'text-black');
            // NEW: If the active club is ALSO a distance match, update its text.
            if (isDistanceMatch) {
                const distance = distanceMatchingClubs.get(btnKey);
                if (distance) {
                    // Use innerHTML to allow for styled sub-text
                    btn.innerHTML = `${btnKey} <span class="font-normal text-sm text-gray-800">${distance.toFixed(1)}</span>`;
                }
            }
        } else if (isDistanceMatch) {
            btn.classList.add('club-distance-match');
            const distance = distanceMatchingClubs.get(btnKey);
            if (distance) {
                btn.innerHTML = `${btnKey} <span class="font-normal text-sm text-gray-300">${distance.toFixed(1)}</span>`;
            }
        } else if (isEquivalent) {
            btn.classList.add('club-equivalent');
        }
    });
}


/**
 * Updates HW/TW/ACW/OCW slider values based on the currently active club and wind speed.
 */
function updateClubMultipliersBasedOnWind(clubKey, windSpeed) {
    if (!clubKey || !clubPresets[clubKey]) return; 

    const categoryKey = getWindCategory(windSpeed);
    const preset = clubPresets[clubKey];
    
    const multipliers = preset.windCategories[categoryKey];

    // REVISED: Only update if the ANALYSIS lock is off. The safety lock should still allow auto-loading.
    if (!analysisLockActive) {
        // --- REVISED: Bias-aware slider update ---
        // This ensures the correct values are loaded into the sliders,
        // even when their labels/values have been swapped for 'draw' bias.
        const isDraw = shotBias === 'draw';

        headwindSlider.value = (multipliers.hw * 100).toFixed(0);
        tailwindSlider.value = (multipliers.tw * 100).toFixed(0);
        assistCrosswindSlider.value = ((isDraw ? multipliers.ocw : multipliers.acw) * 100).toFixed(0);
        opposedCrosswindSlider.value = ((isDraw ? multipliers.acw : multipliers.ocw) * 100).toFixed(0);

        document.getElementById('headwindMultiplierValue').textContent = multipliers.hw.toFixed(2);
        document.getElementById('tailwindMultiplierValue').textContent = multipliers.tw.toFixed(2);
        document.getElementById('assistCrosswindMultiplierValue').textContent = (isDraw ? multipliers.ocw : multipliers.acw).toFixed(2);
        document.getElementById('opposedCrosswindMultiplierValue').textContent = (isDraw ? multipliers.acw : multipliers.ocw).toFixed(2);
    }
}

/**
 * NEW: Loads club base ranges from localStorage or uses defaults.
 */
function loadClubRanges() {
    try {
        const storedRanges = localStorage.getItem(CLUB_RANGES_STORAGE_KEY);
        // Check if storedRanges is not null/undefined AND not an empty object string '{}'.
        // This handles imports from older backups that don't contain club range data.
        if (storedRanges && storedRanges !== '{}') {
            const parsedRanges = JSON.parse(storedRanges);
            clubBaseRanges = parsedRanges;
        } else {
            clubBaseRanges = JSON.parse(JSON.stringify(defaultClubBaseRanges));
        }
    } catch (error) {
        console.error("Error loading club ranges, using defaults.", error);
        clubBaseRanges = JSON.parse(JSON.stringify(defaultClubBaseRanges));
    }
}

/**
 * NEW: Loads the set of active clubs from localStorage.
 */
function loadActiveClubs() {
    try {
        const storedActiveClubs = localStorage.getItem(ACTIVE_CLUBS_STORAGE_KEY);
        if (storedActiveClubs) {
            activeClubs = new Set(JSON.parse(storedActiveClubs));
        } else {
            activeClubs = new Set(DEFAULT_ACTIVE_CLUBS);
        }
    } catch (error) {
        console.error("Error loading active clubs, using defaults.", error);
        activeClubs = new Set(DEFAULT_ACTIVE_CLUBS);
    }
}

/**
 * Applies the club preset: sets the active club and triggers the wind-dependent HW/TW update.
 */
function applyClubPreset(clubKey) {
    activeClubKey = clubKey;
    // Automatically update the analysis club to mirror the calculator
    setActiveAnalysisClub(clubKey);
    const windSpeed = parseFloat(windSpeedSlider.value) || 0;
    updateClubMultipliersBasedOnWind(activeClubKey, windSpeed);

    // REVISED: Only update base roll if the analysis lock is off.
    if (!analysisLockActive) {
        if (baseRollInput && clubPresets[clubKey] && typeof clubPresets[clubKey].r !== 'undefined') {
            baseRollInput.value = clubPresets[clubKey].r.toFixed(1);
            // This input's disabled state is managed by the lock functions, so we don't set it here.
        } else if (baseRollInput) {
            baseRollInput.value = '0.0';
        }
    }

    // NEW & FIXED: Update the default base roll display
    if (defaultBaseRollDisplay && defaultClubPresets[clubKey] && typeof defaultClubPresets[clubKey].r !== 'undefined') {
        defaultBaseRollDisplay.textContent = `(Default: ${defaultClubPresets[clubKey].r.toFixed(1)})`;
    } else if (defaultBaseRollDisplay) {
        defaultBaseRollDisplay.textContent = `(Default: --)`;
    }

    // The club range display is now part of the club match logic inside calculateWind,
    // so the old static display update is no longer needed here.
    // The new element `clubMatchDisplay` will be updated in `calculateWind`.

    calculateWind();
    updateClubButtonActiveStyles(); // This now handles visibility and styles
}

/**
 * NEW: Updates the visual style of calculator club buttons based on active status.
 */
function updateClubButtonActiveStyles() {
    clubButtons.forEach(btn => {
        const clubKey = btn.dataset.club;
        if (activeClubs.has(clubKey)) {
            btn.classList.remove('hidden'); // Show active clubs
        } else {
            btn.classList.add('hidden'); // Hide inactive clubs
        }
    });

    // NEW: Check for manual changes when applying a preset to hide the save button if necessary.
    checkMultiplierChanges();
}

/**
 * Calculates the roll of the ball based on various factors.
 * It uses raw wind components to remain independent from carry multipliers.
 * @param {number} headwindComponentSpeed - The raw headwind component in MPH.
 * @param {number} tailwindComponentSpeed - The raw tailwind component in MPH.
 */
function calculateRoll(headwindComponentSpeed, tailwindComponentSpeed) {
    const firmnessPreset = greenFirmnessPresets[greenFirmnessOrder[currentFirmnessIndex]];
    // Reset displays and exit if not applicable
    const isNotApplicable = !activeClubKey || !clubPresets[activeClubKey] || typeof clubPresets[activeClubKey].r === 'undefined';
    if (isNotApplicable) {
        rollValueDisplay.textContent = '--';
        firmnessEffectDisplay.textContent = 'x1.00 (0.0y)';
        hwRollEffectDisplay.textContent = '-0.0y';
        twRollEffectDisplay.textContent = '+0.0y';
        // REVISED: Use a neutral display when not applicable
        sensitivityEffectDisplay.textContent = 'x1.00 (0.0y)';
        gsEffectDisplay.textContent = '0.0y';
        return 0; // Return 0 if not applicable
    }

    // 1. Get Base and UI Values
    // REVISED & FIXED: Get base roll directly from the input field for real-time updates
    const baseRoll = parseFloat(baseRollInput.value) || 0;
    const greenSpeed = parseFloat(greenSpeedInput.value) || 151;
    const hwRollPercent = (parseFloat(headwindRollPercentInput.value) || 0) / 100;
    const twRollPercent = (parseFloat(tailwindRollPercentInput.value) || 0) / 100;
    const sensitivity = (parseFloat(windRollSensitivityInput.value) || 0) / 100;

    // 2. Calculate Surface Effects (Green Speed & Firmness)
    const greenSpeedModifier = greenSpeed / 151;
    const firmnessMultiplier = firmnessPreset.multiplier;
    const rollAfterSurfaceEffects = baseRoll * greenSpeedModifier * firmnessMultiplier;
    const greenSpeedEffect = (baseRoll * greenSpeedModifier) - baseRoll; // Isolate green speed effect
    
    // NEW: Isolate the yardage effect of just the firmness multiplier
    const firmnessYardageEffect = (baseRoll * firmnessMultiplier) - baseRoll;

    // 3. Calculate Non-Linear Wind Effect
    let windRollEffect = 0;
    let hwEffect = 0;
    let twEffect = 0;
    let sensitivityYardageEffect = 0;
    // REVISED: Use the sum of raw wind components as the basis for the sensitivity curve.
    const windMagnitude = headwindComponentSpeed + tailwindComponentSpeed;

    // The curve: effect = base_percent * wind * (1 + sensitivity * (wind / 10))
    // This makes the effect grow faster as wind increases, controlled by sensitivity.
    const curveFactor = 1 + (sensitivity * (windMagnitude / 10));

    if (headwindComponentSpeed > 0) { // Headwind
        // REVISED: Calculate effect from raw headwind speed.
        const baseHwEffect = headwindComponentSpeed * hwRollPercent;
        sensitivityYardageEffect = baseHwEffect * (curveFactor - 1);
        hwEffect = baseHwEffect + sensitivityYardageEffect;
        windRollEffect = hwEffect;
    } else if (tailwindComponentSpeed > 0) { // Tailwind
        // REVISED: Calculate effect from raw tailwind speed.
        const baseTwEffect = tailwindComponentSpeed * twRollPercent;
        sensitivityYardageEffect = baseTwEffect * (curveFactor - 1);
        twEffect = baseTwEffect + sensitivityYardageEffect;
        windRollEffect = -twEffect; // Tailwind adds to roll, so we subtract from the reduction.
    }

    // 4. Calculate Final Roll (allows for negative roll/backspin)
    const finalRoll = rollAfterSurfaceEffects - windRollEffect;

    // 5. Update UI
    rollValueDisplay.textContent = finalRoll.toFixed(1);
    firmnessEffectDisplay.textContent = `x${firmnessMultiplier.toFixed(2)} (${firmnessYardageEffect >= 0 ? '+' : ''}${firmnessYardageEffect.toFixed(1)}y)`;
    firmnessEffectDisplay.title = `Base Roll (${baseRoll.toFixed(1)}y) * ${firmnessMultiplier.toFixed(2)} = ${(baseRoll * firmnessMultiplier).toFixed(1)}y`;
    hwRollEffectDisplay.textContent = `-${hwEffect.toFixed(1)}y`;
    twRollEffectDisplay.textContent = `+${twEffect.toFixed(1)}y`;
    // REVISED: Show the correct sign for the sensitivity effect.
    sensitivityEffectDisplay.textContent = `x${curveFactor.toFixed(2)} (${(windRollEffect > 0 ? '-' : '+')}${Math.abs(sensitivityYardageEffect).toFixed(1)}y inc)`;
    gsEffectDisplay.textContent = `${greenSpeedEffect >= 0 ? '+' : ''}${greenSpeedEffect.toFixed(1)}y`;

    // NEW: Return the calculated roll value
    return finalRoll;
}


/**
 * Calculates the total distance and aim adjustments based on user inputs.
 * Also returns the final calculated data object for shot tracking.
 */
function calculateWind() {
    let distanceMatchingClubs = new Map(); // NEW: To store keys and distances of clubs that are a distance match
    // 1. Get Input Values
    const windSpeed = parseFloat(windSpeedSlider.value) || 0;

    // --- REVISED: Non-Linear Lie Slider Implementation ---
    // REVISED: Read the percentage directly from the slider.
    const uphillDownhillLiePercent = parseFloat(document.getElementById('uphillDownhillLie').value) || 0;
    const feetLiePercent = parseFloat(document.getElementById('feetLie').value) || 0;
    const lieAdjustedPinDistance = pinDistance * (1 + (uphillDownhillLiePercent / 100));
    
    let windAngle = currentRotation % 360;
    if (windAngle < 0) {
        windAngle += 360;
    }
    const roundedWindAngle = Math.round(windAngle);
    
    // 1b. Get Multiplier Values 
    const HEADWIND_MULTIPLIER = (parseFloat(headwindSlider.value) / 100) ?? 1.50;
    const TAILWIND_MULTIPLIER = (parseFloat(tailwindSlider.value) / 100) ?? 1.00;
    const assistMultiplier = (parseFloat(assistCrosswindSlider.value) / 100) ?? 1.00;
    const opposedMultiplier = (parseFloat(opposedCrosswindSlider.value) / 100) ?? 1.00;
    
    const GRID_MULTIPLIER = parseFloat(document.getElementById('greenGridsMultiplier').value) ?? 1.00; 
    
    // 1c. Get Elevation Values
    const rawBaseElevation = parseFloat(elevationSlider.value) || 0;
    const rawTotalElevation = rawBaseElevation + extraElevation;
    const signedElevation = rawTotalElevation * elevationPolarity; 
    const elevationCarryAdjustment = signedElevation / 3; 

    // --- WIND COMPONENT CALCULATION ---
    const angleRad = windAngle * (Math.PI / 180);
    const distanceWindSpeed = windSpeed * -Math.cos(angleRad); 
    let aimWindDirectionComponent = windSpeed * Math.sin(angleRad); 
    
    let headwindComponentSpeed = 0;
    let tailwindComponentSpeed = 0;

    if (distanceWindSpeed > EPSILON) {
        headwindComponentSpeed = distanceWindSpeed;
    } else if (distanceWindSpeed < -EPSILON) {
        tailwindComponentSpeed = -distanceWindSpeed;
    }

    // --- CARRY CALCULATION LOGIC (LONG/SHORT) ---
    const effectiveHeadwindDistance = headwindComponentSpeed * HEADWIND_MULTIPLIER;
    const effectiveTailwindDistance = tailwindComponentSpeed * TAILWIND_MULTIPLIER;
    const windDistanceChange = effectiveHeadwindDistance - effectiveTailwindDistance;
    const netFlightChange = windDistanceChange + elevationCarryAdjustment; 
    const totalAdjustment = parseFloat(netFlightChange.toFixed(1)); 


    // --- AIM CALCULATION LOGIC (LEFT/RIGHT) ---
    let effectiveAimWindSpeed = aimWindDirectionComponent;
    
    if (aimWindDirectionComponent > EPSILON) {
        effectiveAimWindSpeed *= assistMultiplier;
    } else if (aimWindDirectionComponent < -EPSILON) {
        effectiveAimWindSpeed *= opposedMultiplier;
    }

    const finalAimAdjustment = parseFloat(effectiveAimWindSpeed.toFixed(1));

    const lieAimAdjustment = (pinDistance * (feetLiePercent / 100)); // Positive for above feet (aim right), negative for below (aim left)
    const totalAimAdjustment = finalAimAdjustment - lieAimAdjustment; // Subtract because a positive feetLie (above feet) requires a right aim (which is a negative value in our system)
    
    // 7. Calculate Grid Adjustment (Conversion to Grids)
    // --- REVISED: Highlight Active Multiplier Labels & Values ---
    const headwindValueDisplay = document.getElementById('headwindMultiplierValue');
    const tailwindValueDisplay = document.getElementById('tailwindMultiplierValue');
    const assistCrosswindValueDisplay = document.getElementById('assistCrosswindMultiplierValue');
    const opposedCrosswindValueDisplay = document.getElementById('opposedCrosswindMultiplierValue');

    // First, reset all labels and values to their inactive state
    headwindLabel.classList.remove('active-multiplier-label');
    tailwindLabel.classList.remove('active-multiplier-label');
    assistCrosswindLabel.classList.remove('active-multiplier-label');
    opposedCrosswindLabel.classList.remove('active-multiplier-label');

    [headwindValueDisplay, tailwindValueDisplay, assistCrosswindValueDisplay, opposedCrosswindValueDisplay].forEach(el => {
        el.classList.remove('text-gray-100');
        el.classList.add('text-gray-400');
    });

    // Then, apply the active styles to the active ones
    if (distanceWindSpeed > DISPLAY_EPSILON) { headwindLabel.classList.add('active-multiplier-label'); headwindValueDisplay.classList.replace('text-gray-400', 'text-gray-100'); }
    if (distanceWindSpeed < -DISPLAY_EPSILON) { tailwindLabel.classList.add('active-multiplier-label'); tailwindValueDisplay.classList.replace('text-gray-400', 'text-gray-100'); }
    if (aimWindDirectionComponent > DISPLAY_EPSILON) { assistCrosswindLabel.classList.add('active-multiplier-label'); assistCrosswindValueDisplay.classList.replace('text-gray-400', 'text-gray-100'); }
    if (aimWindDirectionComponent < -EPSILON) { opposedCrosswindLabel.classList.add('active-multiplier-label'); opposedCrosswindValueDisplay.classList.replace('text-gray-400', 'text-gray-100'); }





    const gridMultiplier = GRID_MULTIPLIER;
    const carryInGrids = parseFloat((totalAdjustment / gridMultiplier).toFixed(1)); 
    const aimInGrids = parseFloat((finalAimAdjustment / gridMultiplier).toFixed(1)); 
    

    // --- VISUAL UPDATES ---
    windAngleDisplay.textContent = roundedWindAngle + '°'; 
    
    const category = getWindCategory(windSpeed);
    const categoryText = WIND_CATEGORIES_MAP[category].label;

    // --- NEW: Dynamic Wind Slider Styling ---
    // Remove all previous wind classes
    windSpeedSlider.classList.remove('wind-low', 'wind-medium', 'wind-high', 'wind-very-high');
    
    let windColor = '#4b5563'; // Default gray
    let windClass = '';

    if (category === 'low') {
        windColor = '#bae6fd';
        windClass = 'wind-low';
    } else if (category === 'medium') {
        windColor = '#3b82f6';
        windClass = 'wind-medium';
    } else if (category === 'high1' || category === 'high2') {
        windColor = '#fb923c';
        windClass = 'wind-high';
    } else { // veryHigh1, veryHigh2, veryHigh3
        windColor = '#ef4444';
        windClass = 'wind-very-high';
    }

    if (windClass) windSpeedSlider.classList.add(windClass);
    
    const windFillPercent = (windSpeed / 30) * 100;
    windSpeedSlider.style.setProperty('--wind-track-color', windColor);
    windSpeedSlider.style.setProperty('--wind-fill-percent', `${windFillPercent}%`);
    
    if (windSpeedValueNumeral) {
        windSpeedValueNumeral.textContent = windSpeed.toFixed(0);
    }
    if (windSpeedValueCategory) {
        windSpeedValueCategory.textContent = categoryText;
    }

    windDialSpeedDisplay.textContent = windSpeed.toFixed(0); 

    const windFillElement = document.getElementById('windFill');
    const visualValue = windSpeed - MIN_WIND_SPEED_VISUAL; 
    const fillPercentage = Math.max(0, Math.min(100, (visualValue / VISUAL_RANGE) * 100));
    windFillElement.style.height = `${fillPercentage}%`;
    windFillElement.style.backgroundColor = `${windColor}80`; // Set fill color to match slider, with 50% opacity (80 in hex)
    
    if (currentGridMultiplierDisplay) {
        currentGridMultiplierDisplay.textContent = GRID_MULTIPLIER.toFixed(2);
    }

    signedTotalElevationDisplay.textContent = formatAdjustment(signedElevation, true, 0);
    baseElevationDisplay.textContent = rawBaseElevation.toFixed(0);
    baseElevationSliderDisplay.textContent = rawBaseElevation.toFixed(0); // NEW: Update the second display
    extraElevationDisplay.textContent = extraElevation.toFixed(0);

    if (elevationPolarity === 1) {
         polarityToggle.classList.remove('bg-fairway-blue', 'hover:bg-fairway-blue/80'); 
         polarityToggle.classList.add('bg-grass-green', 'hover:bg-grass-green/80');
         polarityText.firstChild.textContent = "Uphill ";
         polarityToggle.textContent = '+'; 
         // NEW: Set slider color to green
         elevationSlider.style.setProperty('--elevation-track-color', '#10b981');
         // NEW: Change text colors to green
         polarityText.classList.remove('text-fairway-blue');
         polarityText.classList.add('text-grass-green');
         signedTotalElevationDisplay.classList.remove('text-fairway-blue');
         signedTotalElevationDisplay.classList.add('text-grass-green');
    } else {
         polarityToggle.classList.remove('bg-grass-green', 'hover:bg-grass-green/80'); 
         polarityToggle.classList.add('bg-fairway-blue', 'hover:bg-fairway-blue/80');
         polarityText.firstChild.textContent = "Downhill ";
         polarityToggle.textContent = '-'; 
         // NEW: Set slider color to blue
         elevationSlider.style.setProperty('--elevation-track-color', '#3b82f6');
         // NEW: Change text colors to blue
         polarityText.classList.remove('text-grass-green');
         polarityText.classList.add('text-fairway-blue');
         signedTotalElevationDisplay.classList.remove('text-grass-green');
         signedTotalElevationDisplay.classList.add('text-fairway-blue');
    }

    // NEW: Update the fill percentage for the elevation slider
    const elevationFillPercent = (rawBaseElevation / (elevationSlider.max - elevationSlider.min)) * 100;
    elevationSlider.style.setProperty('--elevation-fill-percent', `${elevationFillPercent}%`);
    
    if (aimMultiplierDisplay) {
        let activeMultipliers = [];

        if (distanceWindSpeed > DISPLAY_EPSILON) {
            activeMultipliers.push(`H:${HEADWIND_MULTIPLIER.toFixed(2)}`);
        } else if (distanceWindSpeed < -DISPLAY_EPSILON) { // Corrected from else if to just if
            activeMultipliers.push(`T:${TAILWIND_MULTIPLIER.toFixed(2)}`);
        }

        if (aimWindDirectionComponent > DISPLAY_EPSILON) {
            activeMultipliers.push(`A:${assistMultiplier.toFixed(2)}`);
        } else if (aimWindDirectionComponent < -EPSILON) {
            activeMultipliers.push(`O:${opposedMultiplier.toFixed(2)}`);
        }

        // Add base roll to the display
        const currentBaseRoll = parseFloat(baseRollInput.value);
        if (!isNaN(currentBaseRoll) && currentBaseRoll !== 0) { // Only add if it's a valid non-zero roll
            activeMultipliers.push(`R:${currentBaseRoll.toFixed(1)}`);
        }

        const multiplierText = activeMultipliers.join(' | ');
        aimMultiplierDisplay.textContent = multiplierText.length > 0 ? multiplierText : "No wind multiplier active"; 
    }
    // --- END VISUAL UPDATES ---


    // 8. Update Output
    document.getElementById('totalAdjustment').textContent = formatAdjustment(totalAdjustment, true, 1);
    document.getElementById('carryGridAdjustmentDisplay').textContent = formatAdjustment(carryInGrids, true, 1) + 'g';
    
    aimAdjustmentDisplay.textContent = formatAimAdjustment(totalAimAdjustment); // e.g., "Left 5.0y"
    aimGridAdjustmentDisplay.textContent = `${Math.abs(totalAimAdjustment / gridMultiplier).toFixed(1)}g`;
    
    // REMOVED: Carry Description update logic is no longer needed.
    updatePresetButtonState();
    
    

    // NEW: Update trust scores whenever calculation runs
    updateTrustScoreDisplays();

    // --- NEW: Final Adjustment Calculation ---
    // REVISED: Call the roll calculation and get the returned value.
    const calculatedRollValue = calculateRoll(headwindComponentSpeed, tailwindComponentSpeed);

    // --- NEW: C L R T Calculation Logic ---
    // C (Carry) is `totalAdjustment` (wind + elevation)
    // L (Lie) is the adjustment from the U/D lie slider
    const lieYardageAdjustment = lieAdjustedPinDistance - pinDistance;
    const lieGridAdjustment = lieYardageAdjustment / gridMultiplier;
    // R (Roll) is `calculatedRollValue`
    // T (Total) is C + L - R
    const finalAdjustment = totalAdjustment + lieYardageAdjustment - calculatedRollValue;
    const finalGridAdjustment = finalAdjustment / gridMultiplier;
    const rollGridValue = calculatedRollValue / gridMultiplier;

    // --- REVISED: Final Adjustment Calculation & Display ---
    const finalCarryToHit = pinDistance + finalAdjustment; // The final HIT is DTP + Total Adjustment
    
    // NEW: Apply Power Adjustment as the final step
    const displayedHitCarry = finalCarryToHit / (powerPercent / 100);
    hitDistanceDisplay.textContent = displayedHitCarry.toFixed(1);

    // Update C, L, R, T displays
    document.getElementById('lieAdjustmentValue').textContent = formatAdjustment(lieYardageAdjustment, true, 1);
    document.getElementById('lieGridAdjustmentDisplay').textContent = formatAdjustment(lieGridAdjustment, true, 1) + 'g';
    finalAdjustmentValue.textContent = formatAdjustment(finalAdjustment, true, 1);
    finalGridAdjustmentDisplay.textContent = formatAdjustment(finalGridAdjustment, true, 1) + 'g';
    rollGridDisplay.textContent = `${formatAdjustment(rollGridValue, false, 1)}g`;
    // --- END REVISED ---

    // --- REVISED: Club Match Logic for the new display ---
    const currentRange = clubBaseRanges[activeClubKey];
    if (clubMatchDisplay && currentRange && clubRangeMinDisplay && clubRangeMaxDisplay) {
        // Always display the min and max ranges
        clubRangeMinDisplay.textContent = currentRange.min.toString();
        clubRangeMaxDisplay.textContent = currentRange.max.toString();
    
        if (displayedHitCarry > currentRange.max) {
            // HIT CARRY is too high for the club
            clubMatchDisplay.innerHTML = `<span class="font-bold text-white">${activeClubKey}</span> <span class="text-white">Club ↑</span>`;
        } else if (displayedHitCarry < currentRange.min) {
            // HIT CARRY is too low for the club
            clubMatchDisplay.innerHTML = `<span class="font-bold text-white">${activeClubKey}</span> <span class="text-white">Club ↓</span>`;
        } else {
            // HIT CARRY is within the club's range (the "just right" case)
            clubMatchDisplay.innerHTML = `<span class="font-bold text-bunker-yellow">${activeClubKey} Match</span>`;
            distanceMatchingClubs.set(activeClubKey, finalCarryToHit); // Add the active club and its distance to the match map
        }
    
    }
    // --- END NEW ---

    // --- NEW: Adjacent Club Match Check ---
    // This runs only if the primary club is a match, for efficiency.
    if (distanceMatchingClubs.has(activeClubKey)) {
        // Get the master list of all clubs, sorted by default distance.
        const masterClubList = Object.keys(clubPresets).sort((a, b) => defaultClubBaseRanges[a].order - defaultClubBaseRanges[b].order);
        
        // NEW: Filter the master list to get only the clubs in the user's active bag. This is our new source for neighbors.
        const sortedActiveBag = masterClubList.filter(clubKey => activeClubs.has(clubKey));

        // Find the index of the current club within the *active bag* list.
        const activeIndex = sortedActiveBag.indexOf(activeClubKey);
        const adjacentIndices = [activeIndex - 2, activeIndex - 1, activeIndex + 1, activeIndex + 2];

        adjacentIndices.forEach(index => {
            // Check against the bounds of the *active bag* list.
            if (index >= 0 && index < sortedActiveBag.length) {
                const adjacentClubKey = sortedActiveBag[index];
                const adjacentPreset = clubPresets[adjacentClubKey];
                const adjacentRange = clubBaseRanges[adjacentClubKey];

                if (adjacentPreset && adjacentRange) {
                    // Perform a "ghost" calculation for the adjacent club
                    const adjacentMultipliers = adjacentPreset.windCategories[category];
                    
                    const ghostHwMult = adjacentMultipliers.hw;
                    const ghostTwMult = adjacentMultipliers.tw;
                    
                    // We only need to recalculate the carry adjustment part
                    const ghostEffectiveHwDist = headwindComponentSpeed * ghostHwMult;
                    const ghostEffectiveTwDist = tailwindComponentSpeed * ghostTwMult;
                    const ghostWindDistChange = ghostEffectiveHwDist - ghostEffectiveTwDist;
                    const ghostNetFlightChange = ghostWindDistChange + elevationCarryAdjustment;
                    const ghostTotalAdjustment = parseFloat(ghostNetFlightChange.toFixed(1));

                    // And the roll
                    const ghostBaseRoll = adjacentPreset.r;
                    const firmnessPreset = greenFirmnessPresets[greenFirmnessOrder[currentFirmnessIndex]];
                    const greenSpeedModifier = (parseFloat(greenSpeedInput.value) || 151) / 151;
                    const firmnessMultiplier = firmnessPreset.multiplier;
                    const rollAfterSurface = ghostBaseRoll * greenSpeedModifier * firmnessMultiplier;
                    
                    const sensitivity = (parseFloat(windRollSensitivityInput.value) || 0) / 100;
                    const windMagnitude = headwindComponentSpeed + tailwindComponentSpeed;
                    const curveFactor = 1 + (sensitivity * (windMagnitude / 10));
                    let ghostWindRollEffect = 0;
                    if (headwindComponentSpeed > 0) {
                        ghostWindRollEffect = (headwindComponentSpeed * (parseFloat(headwindRollPercentInput.value) / 100)) * curveFactor;
                    } else if (tailwindComponentSpeed > 0) {
                        ghostWindRollEffect = -(tailwindComponentSpeed * (parseFloat(tailwindRollPercentInput.value) / 100)) * curveFactor;
                    }
                    const ghostCalculatedRoll = rollAfterSurface - ghostWindRollEffect;

                    // Final ghost calculation
                    const ghostFinalAdjustment = ghostTotalAdjustment + lieYardageAdjustment - ghostCalculatedRoll;
                    const ghostFinalCarryToHit = pinDistance + ghostFinalAdjustment;

                    // Check if this adjacent club is also a match
                    if (ghostFinalCarryToHit >= adjacentRange.min && ghostFinalCarryToHit <= adjacentRange.max) {
                        distanceMatchingClubs.set(adjacentClubKey, ghostFinalCarryToHit);
                    }
                }
            }
        });
    }

    // --- FINAL UI UPDATES ---
    // Reset and apply colors for the HIT CARRY display based on the final match set
    hitDistanceDisplay.classList.toggle('text-bunker-yellow', distanceMatchingClubs.has(activeClubKey));
    hitDistanceDisplay.classList.toggle('text-white', !distanceMatchingClubs.has(activeClubKey));
    clubRangeMinDisplay.classList.toggle('text-bunker-yellow', distanceMatchingClubs.has(activeClubKey));
    clubRangeMinDisplay.classList.toggle('text-gray-400', !distanceMatchingClubs.has(activeClubKey));
    clubRangeMaxDisplay.classList.toggle('text-bunker-yellow', distanceMatchingClubs.has(activeClubKey));
    clubRangeMaxDisplay.classList.toggle('text-gray-400', !distanceMatchingClubs.has(activeClubKey));

    // Pass all matching clubs to the style updater
    updateClubButtonStyles(distanceWindSpeed, aimWindDirectionComponent, distanceMatchingClubs); // Pass the map

    // 10. Return Data Object for Tracker
    return {
        clubKey: activeClubKey || 'Manual',
        windSpeed: windSpeed,
        windCategory: category, // Stored as key 'low', 'medium', etc.
        windAngle: roundedWindAngle,
        elevationYards: signedElevation,
        // NEW: Store lie adjustments
        uphillDownhillLiePercent: uphillDownhillLiePercent,
        feetLiePercent: feetLiePercent,
        lieAimAdjustmentYards: lieAimAdjustment,
        shotBias: shotBias, // NEW: Store the bias
        hwMultiplier: HEADWIND_MULTIPLIER,
        twMultiplier: TAILWIND_MULTIPLIER,
        acwMultiplier: parseFloat(assistCrosswindSlider.value), // Store the slider's actual value
        ocwMultiplier: parseFloat(opposedCrosswindSlider.value), // Store the slider's actual value
        calculatedCarryAdj: totalAdjustment,
        calculatedAimAdj: totalAimAdjustment, // Store the total aim adjustment
        calculatedCarryGrids: carryInGrids,
        calculatedAimGrids: aimInGrids,
        headwindComponentSpeed: headwindComponentSpeed, // NEW: Store component speed
        tailwindComponentSpeed: tailwindComponentSpeed, // NEW: Store component speed
    };
}

/**
 * Clears active state from all preset buttons and applies it to the one matching the current slider value.
 */
function updatePresetButtonState() {
    const hiddenInput = document.getElementById('greenGridsMultiplier');
    const currentValue = parseFloat(hiddenInput.value);
    const tolerance = 0.004; 

    presetButtons.forEach(button => {
        button.classList.remove('active'); 
        const buttonValue = parseFloat(button.getAttribute('data-value'));
        if (Math.abs(currentValue - buttonValue) < tolerance) { 
            button.classList.add('active');
        }
    });
}

/**
 * Formats the adjustment text (yards or grids) with +/- sign and specified decimal places.
 */
function formatAdjustment(value, addSign = false, decimals = 0) {
    const roundedValue = value.toFixed(decimals); 
    let result = roundedValue;

    if (addSign) {
        if (value > 0) {
            result = "+" + roundedValue;
        } else if (value < -EPSILON) {
            // Value is negative, toFixed handles the sign.
        } else { // Value is 0 or very close to it
            result = roundedValue; // This will be "0.00" if decimals=2
        }
    }
    return result;
}

/**
 * NEW: Calculates the Trust % score for a given multiplier.
 * This combines accuracy (vs ideal) and data volume.
 * @returns {object|null} An object { score, shotCount } or null if not calculable.
 */
function calculateTrustScore(clubKey, category, component) {
    let isLatestShotExcluded = false;
    let shotsForComponent = getShotsForComponent(allShotData, clubKey, category, component);

    // Check if the latest shot matches the current context and was excluded.
    if (allShotData.length > 0) {
        const latestShot = allShotData[0]; // Shots are sorted newest first
        const isCarryComponent = component === 'Headwind' || component === 'Tailwind';
        const isAimComponent = component === 'Assist Crosswind' || component === 'Opposed Crosswind';

        const wasCarryExcluded = isCarryComponent && latestShot.includedCarryError === false && latestShot.windCategory === category && latestShot.clubKey === clubKey;
        const wasAimExcluded = isAimComponent && latestShot.includedAimError === false && latestShot.windCategory === category && latestShot.clubKey === clubKey;

        if (wasCarryExcluded || wasAimExcluded) {
            isLatestShotExcluded = true;
            // If the latest shot was excluded, we calculate the score based on all *other* shots.
            shotsForComponent = shotsForComponent.filter(shot => shot.timestamp !== latestShot.timestamp);
        }
    }

    // If an excluded shot was the *only* shot, there's no data to calculate a score.
    if (isLatestShotExcluded && shotsForComponent.length === 0) {
        return { score: null, shotCount: 0, isExcluded: true };
    }
    
    // A shot is only valid if it can produce an ideal multiplier. This filters out excluded shots.
    const validShotsForAnalysis = shotsForComponent.filter(shot => calculateIdealMultiplierForShot(shot, component) !== null);
    const shotCount = validShotsForAnalysis.length; // Use the count of VALID shots for all logic.
    // --- END REVISION ---

    // Rule: Not enough data to calculate a score.
    if (shotCount < MIN_SHOTS_FOR_RECOMMENDATION) {
        return { score: null, shotCount: shotCount, isExcluded: isLatestShotExcluded };
    }
    
    // --- Calculate the "Ideal" Multiplier ---
    const MAX_ERROR_FOR_WEIGHTING = parseFloat(document.getElementById('maxErrorForWeightingInput').value) || 10.0;
    const getShotWeight = (shot) => {
        const totalError = Math.sqrt(Math.pow(shot.actualCarryError, 2) + Math.pow(shot.actualAimError, 2));
        if (totalError >= MAX_ERROR_FOR_WEIGHTING) return 0;
        return 1.0 - (totalError / MAX_ERROR_FOR_WEIGHTING);
    };

    const weightedIdealMultipliers = [];
    // REVISED: Iterate over the pre-filtered valid shots.
    validShotsForAnalysis.forEach(shot => {
        const idealMultiplier = calculateIdealMultiplierForShot(shot, component); // This will not be null because we already filtered.
        if (idealMultiplier !== null) {
            const weight = getShotWeight(shot);
            const replicationCount = Math.round(weight * 10);
            for (let i = 0; i < replicationCount; i++) {
                weightedIdealMultipliers.push(idealMultiplier);
            }
        }
    });

    if (weightedIdealMultipliers.length === 0) {
        return { score: null, shotCount: shotCount, isExcluded: isLatestShotExcluded };
    }

    const idealMultiplier = calculateIQRMedian(weightedIdealMultipliers);

    // --- Get the Current Multiplier ---
    const multiplierMap = { 'Headwind': 'hw', 'Tailwind': 'tw', 'Assist Crosswind': 'acw', 'Opposed Crosswind': 'ocw' };
    const multiplierKey = multiplierMap[component];
    const currentMultiplier = clubPresets[clubKey]?.windCategories[category]?.[multiplierKey];

    if (typeof currentMultiplier === 'undefined') {
        return { score: null, shotCount: shotCount, isExcluded: isLatestShotExcluded };
    }

    // --- Calculate Base Accuracy Score (100% -> 50%) ---
    const difference = Math.abs(idealMultiplier - currentMultiplier);
    const RECOMMENDATION_THRESHOLD = 0.03;
    let accuracyScore = 100;
    if (difference > 0) {
        // Scale from 100 down to 50 as difference approaches the threshold
        accuracyScore = 100 - 50 * (Math.min(difference, RECOMMENDATION_THRESHOLD) / RECOMMENDATION_THRESHOLD);
    }

    // --- Determine Data Volume Cap ---
    let dataVolumeCap = 100;
    if (shotCount >= 3 && shotCount <= 4) {
        dataVolumeCap = 75;
    } else if (shotCount >= 5 && shotCount <= 9) {
        dataVolumeCap = 90;
    }

    // --- Final Score ---
    const finalScore = Math.min(accuracyScore, dataVolumeCap);

    return { score: Math.round(finalScore), shotCount: shotCount, isExcluded: isLatestShotExcluded };
}

/**
 * NEW: Updates the UI for all four multiplier trust scores.
 */
function updateTrustScoreDisplays() {
     const windSpeed = parseFloat(windSpeedSlider.value) || 0;
     const category = getWindCategory(windSpeed);
     const clubKey = activeClubKey;
 
     const components = ['Headwind', 'Tailwind', 'Assist Crosswind', 'Opposed Crosswind'];
     const componentMap = { 'Headwind': 'headwind', 'Tailwind': 'tailwind', 'Assist Crosswind': 'assistCrosswind', 'Opposed Crosswind': 'opposedCrosswind' };
 
     components.forEach(component => {
         const result = calculateTrustScore(clubKey, category, component);
 
         // --- REVISED: Bias-aware element selection ---
         let targetKey = componentMap[component];
         if (shotBias === 'draw') {
             if (component === 'Assist Crosswind') targetKey = 'opposedCrosswind';
             if (component === 'Opposed Crosswind') targetKey = 'assistCrosswind';
         }
         // --- END REVISION ---
 
         const slider = document.getElementById(`${targetKey}Multiplier`);
         const text = document.getElementById(`${targetKey}TrustScoreText`);
 
         const score = result.score;
         const isExcluded = result.isExcluded;

         // Determine the color based on the score, but override to grey if the latest shot was excluded.
         let sliderColor = '#4b5563'; // Default grey
         let textColor = '#6b7280'; // Default grey for text

         if (score !== null) {
             const scoreBasedColor = score > 85 ? '#10b981' : score > 60 ? '#facc15' : '#ef4444';
             sliderColor = isExcluded ? '#6b7280' : scoreBasedColor; // Use grey for slider if excluded
             textColor = scoreBasedColor; // Text color always reflects the score
         }
 
         if (text) {
             text.textContent = score !== null ? `T ${score}%` : 'T --%';
             text.style.color = textColor;
         }
 
         if (slider) {
             slider.style.setProperty('--trust-color', sliderColor);
             slider.style.setProperty('--trust-score-percent', score !== null ? `${score}%` : '0%');
         }
     });
}
/**
 * Helper function to set the disabled state of all calculation-related inputs.
 */
function setCalculationInputsDisabled(isDisabled) {
    const multiplierSection = document.getElementById('multiplier-section');
    if (!multiplierSection) return;

    // Select all interactive elements within the section
    const allControls = multiplierSection.querySelectorAll(
        '.multiplier-slider, input[type="number"], .roll-increment-btn, #firmnessDecrementBtn, #firmnessIncrementBtn, #shotBiasToggleButton, #saveManualMultiplierChanges, #revertManualMultiplierChanges'
    );
    const nonInputControls = multiplierSection.querySelectorAll('#greenFirmnessDisplay, #manualChangesControlContainer');

    // Disable all buttons and inputs
    allControls.forEach(control => {
        control.disabled = isDisabled;
    });

    // Toggle opacity on all visual elements, including containers and spans
    const elementsToToggleOpacity = [...allControls, ...nonInputControls];
    elementsToToggleOpacity.forEach(el => el.classList.toggle('opacity-50', isDisabled));
}

/**
 * Toggles the Safety Lock (UI lock only).
 */
function toggleSafetyLock() {
    safetyLockActive = !safetyLockActive;

    // If activating safety lock, deactivate analysis lock.
    if (safetyLockActive && analysisLockActive) {
        analysisLockActive = false;
        updateAnalysisLockButtonState();
    }

    setCalculationInputsDisabled(safetyLockActive);
    updateSafetyLockButtonState();
}

/**
 * Toggles the Analysis Lock (calculation freeze).
 */
function toggleAnalysisLock() {
    analysisLockActive = !analysisLockActive;

    // If activating analysis lock, deactivate safety lock.
    if (analysisLockActive && safetyLockActive) {
        safetyLockActive = false;
        updateSafetyLockButtonState();
    }

    setCalculationInputsDisabled(analysisLockActive);
    updateAnalysisLockButtonState();

    // If unlocking, re-apply the current club's preset to sync the UI.
    if (!analysisLockActive) {
        applyClubPreset(activeClubKey || '7');
    }
}

/**
 * Updates the visual state of the safety lock button.
 */
function updateSafetyLockButtonState() {
    safetyLockIcon.textContent = '🔗'; // Set to link icon
    if (safetyLockActive) {
        safetyLockButton.classList.replace('bg-gray-600', 'bg-bunker-yellow/50');
    } else {
        safetyLockButton.classList.replace('bg-bunker-yellow/50', 'bg-gray-600');
    }
    // Force a reflow to ensure immediate visual update
    void safetyLockButton.offsetHeight;
}

/**
 * Updates the visual state of the analysis lock button.
 */
function updateAnalysisLockButtonState() {
    if (analysisLockActive) {
        analysisLockIcon.textContent = '🔒'; // Set to locked icon
        analysisLockButton.classList.replace('bg-gray-600', 'bg-bunker-yellow/50');
    } else {
        analysisLockIcon.textContent = '🔓'; // Set to unlocked icon
        analysisLockButton.classList.replace('bg-bunker-yellow/50', 'bg-gray-600');
    }
    // Force a reflow to ensure immediate visual update
    void analysisLockButton.offsetHeight;
}

/**
 * NEW: Updates UI labels for left/right-handed players without changing logic.
 */
function updateUiForHandedness() {
    const isLeftHanded = playerHandedness === 'left';

    // 1. Update A/B Feet Lie Slider Labels
    const feetLieLabelBelow = document.getElementById('feetLieLabelBelow');
    const feetLieLabelAbove = document.getElementById('feetLieLabelAbove');
    if (feetLieLabelBelow && feetLieLabelAbove) {
        feetLieLabelBelow.textContent = isLeftHanded ? 'Above' : 'Below';
        feetLieLabelAbove.textContent = isLeftHanded ? 'Below' : 'Above';
    }

    // 2. Update Fade/Draw Button Text
    // The underlying shotBias variable is always from a right-handed perspective.
    // 'fade' means ball curves right. For a lefty, this is a Draw.
    // 'draw' means ball curves left. For a lefty, this is a Fade.
    const isRightyFade = shotBias === 'fade';
    shotBiasToggleButton.textContent = isLeftHanded ? (isRightyFade ? 'Draw' : 'Fade') : (isRightyFade ? 'Fade' : 'Draw');
}


/**
 * Toggles the shot bias between 'fade' and 'draw'.
 */
function toggleShotBias() {
    // NEW: Physically swap the slider values and their displays
    const assistSlider = document.getElementById('assistCrosswindMultiplier');
    const opposedSlider = document.getElementById('opposedCrosswindMultiplier');
    const assistValueDisplay = document.getElementById('assistCrosswindMultiplierValue');
    const opposedValueDisplay = document.getElementById('opposedCrosswindMultiplierValue');

    const tempValue = assistSlider.value;

    // NEW: Swap the label text
    const assistLabelDiv = document.getElementById('assistCrosswindLabel');
    const opposedLabelDiv = document.getElementById('opposedCrosswindLabel');
    const tempLabelHTML = assistLabelDiv.innerHTML;
    assistLabelDiv.innerHTML = opposedLabelDiv.innerHTML;
    opposedLabelDiv.innerHTML = tempLabelHTML;

    assistSlider.value = opposedSlider.value;
    opposedSlider.value = tempValue;

    assistValueDisplay.textContent = (parseFloat(assistSlider.value) / 100).toFixed(2);
    opposedValueDisplay.textContent = (parseFloat(opposedSlider.value) / 100).toFixed(2);

    // Update the button state and text
    shotBias = (shotBias === 'fade') ? 'draw' : 'fade';
    shotBiasToggleButton.classList.toggle('bg-fairway-blue', shotBias === 'fade');
    shotBiasToggleButton.classList.toggle('bg-grass-green', shotBias === 'draw');

    updateUiForHandedness(); // NEW: Update all handedness-related UI
}

/**
 * Updates a specific multiplier in the clubPresets object and saves it to localStorage.
 */
function updateAndSavePreset(clubKey, category, component, newValue, options = {}) {
    const multiplierMap = {
        'Headwind': 'hw', // Corrected mapping
        'Tailwind': 'tw', // Corrected mapping
        'Assist Crosswind': 'acw', // Corrected mapping
        'Opposed Crosswind': 'ocw'  // Corrected mapping
    };
    const multiplierKey = multiplierMap[component];

    if (clubPresets[clubKey] && clubPresets[clubKey].windCategories[category] && multiplierKey) {
        // Update the value in the live presets object
        clubPresets[clubKey].windCategories[category][multiplierKey] = newValue;

        // Save the entire updated presets object to localStorage
        try {
            localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(clubPresets));
            // NEW: Ensure the reset button is visible now that a custom preset is saved.
            document.getElementById('resetMultipliersButton').classList.remove('hidden');

            console.log(`Saved new preset for ${clubKey} [${category}][${multiplierKey}] = ${newValue}`);

            // REFACTORED: This function's ONLY job is to save and update the sliders.
            // The calling function will handle re-running analysis to prevent loops.
            applyClubPreset(activeClubKey);
        } catch (error) {
            console.error("Error saving preset:", error);
        }
    }
}

/**
 * NEW: Saves the current analysis settings to localStorage.
 */
function saveAnalysisSettings() {
    const settings = {
        maxErrorForWeighting: parseFloat(document.getElementById('maxErrorForWeightingInput').value) || 10.0
    };
    try {
        localStorage.setItem(ANALYSIS_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Error saving analysis settings:", error);
    }
}

/**
 * NEW: Loads analysis settings from localStorage.
 */
function loadAnalysisSettings() {
    try {
        const storedSettings = localStorage.getItem(ANALYSIS_SETTINGS_KEY);
        if (storedSettings) {
            const settings = JSON.parse(storedSettings);
            if (settings.maxErrorForWeighting) {
                document.getElementById('maxErrorForWeightingInput').value = settings.maxErrorForWeighting.toFixed(1);
            }
        }
    } catch (error) {
        console.error("Error loading analysis settings:", error);
    }
}

/**
 * NEW: Loads the power setting from localStorage.
 */
function loadPowerSetting() {
    try {
        const storedPower = localStorage.getItem(POWER_SETTING_KEY);
        if (storedPower) {
            powerPercent = parseInt(storedPower, 10);
        } else {
            powerPercent = 100;
        }
        powerPercentDisplay.textContent = `${powerPercent}%`;
    } catch (error) {
        console.error("Error loading power setting, using default.", error);
        powerPercent = 100;
    }
}

/**
 * NEW: Saves the current roll calculation settings to localStorage.
 */
function saveRollSettings() {

    const settings = {
        greenSpeed: greenSpeedInput.value,
        firmnessIndex: currentFirmnessIndex, // NEW
        headwindRollPercent: headwindRollPercentInput.value,
        tailwindRollPercent: tailwindRollPercentInput.value,
        windRollSensitivity: windRollSensitivityInput.value
    };
    try {
        localStorage.setItem(ROLL_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Error saving roll settings:", error);
    }
}

/**
 * NEW: Saves the power setting to localStorage.
 */
function savePowerSetting() {
    try {
        localStorage.setItem(POWER_SETTING_KEY, powerPercent);
    } catch (error) {
        console.error("Error saving power setting:", error);
    }
}

/**
 * NEW: Loads roll calculation settings from localStorage.
 */
function loadRollSettings() {
    try {
        const storedSettings = localStorage.getItem(ROLL_SETTINGS_KEY);
        if (storedSettings) {
            const settings = JSON.parse(storedSettings);
            greenSpeedInput.value = settings.greenSpeed ?? defaultRollSettings.greenSpeed;
            currentFirmnessIndex = settings.firmnessIndex ?? 2; // NEW
            headwindRollPercentInput.value = settings.headwindRollPercent ?? defaultRollSettings.headwindRollPercent;
            tailwindRollPercentInput.value = settings.tailwindRollPercent ?? defaultRollSettings.tailwindRollPercent;
            windRollSensitivityInput.value = settings.windRollSensitivity ?? defaultRollSettings.windRollSensitivity;
        }
    } catch (error) {
        console.error("Error loading roll settings:", error);
    }
    // NEW: Update the firmness display after loading
    updateFirmnessDisplay();
}

/**
 * NEW: Loads custom green firmness multipliers from localStorage.
 */
function loadGreenFirmnessSettings() {
    try {
        const storedSettings = localStorage.getItem(GREEN_FIRMNESS_SETTINGS_KEY);
        if (storedSettings) {
            const customSettings = JSON.parse(storedSettings);
            // Merge with defaults to ensure all keys are present
            greenFirmnessPresets = { ...defaultGreenFirmnessPresets, ...customSettings };
        } else {
            greenFirmnessPresets = JSON.parse(JSON.stringify(defaultGreenFirmnessPresets));
        }
    } catch (error) {
        console.error("Error loading green firmness settings:", error);
        greenFirmnessPresets = JSON.parse(JSON.stringify(defaultGreenFirmnessPresets));
    }
}

/**
 * NEW: Updates the green firmness display text and effect.
 */
function updateFirmnessDisplay() {
    const preset = greenFirmnessPresets[greenFirmnessOrder[currentFirmnessIndex]];
    greenFirmnessDisplay.textContent = preset.label;
    calculateWind(); // Recalculate to update the effect display
}

/**
 * NEW: Changes the green firmness setting.
 * @param {number} direction - 1 for increment, -1 for decrement.
 */
function changeGreenFirmness(direction) {
    currentFirmnessIndex += direction;

    if (currentFirmnessIndex < 0) {
        currentFirmnessIndex = greenFirmnessOrder.length - 1;
    } else if (currentFirmnessIndex >= greenFirmnessOrder.length) {
        currentFirmnessIndex = 0;
    }

    updateFirmnessDisplay();
    saveRollSettings(); // Save the new index
}

// --- Local Storage Handlers ---

/**
 * Saves the current calculation and actual shot result to localStorage.
 */
function recordShot() {
    const shotData = calculateWind(); 
    
    const actualCarryError = parseFloat(actualCarryErrorInput.value);
    const actualAimError = parseFloat(actualAimErrorInput.value);

    if (isNaN(actualCarryError) || isNaN(actualAimError)) {
        authStatus.textContent = "Error: Please enter valid numbers for Carry and Aim Errors.";
        return;
    }

    // NEW: Check checkbox states
    const includeCarryError = document.getElementById('includeCarryError').checked;
    const includeAimError = document.getElementById('includeAimError').checked;

    const shotDocument = {
        ...shotData,
        // Only record the actual error if the corresponding checkbox is ticked
        actualCarryError: includeCarryError ? actualCarryError : null, 
        actualAimError: includeAimError ? actualAimError : null,
        powerPercent: powerPercent, // NEW: Record the power setting
        // Use numeric timestamp for easier filtering/comparison
        timestamp: new Date().toISOString(),
        // NEW: Store whether these were included for potential future analysis/UI
        includedCarryError: includeCarryError,
        includedAimError: includeAimError,
        // FIX: Store the multipliers based on their true identity, not the slider's current label
        multipliersUsed: {
            hw: shotData.hwMultiplier,
            tw: shotData.twMultiplier,
            acw: shotBias === 'fade'
                ? (parseFloat(assistCrosswindSlider.value) / 100)
                : (parseFloat(opposedCrosswindSlider.value) / 100),
            ocw: shotBias === 'fade'
                ? (parseFloat(opposedCrosswindSlider.value) / 100)
                : (parseFloat(assistCrosswindSlider.value) / 100),
        }
    }; 
    shotDocument.numericTimestamp = Date.now(); // Add numeric timestamp

    try {
        // Load existing data
        let existingShots = JSON.parse(localStorage.getItem(SHOT_STORAGE_KEY) || '[]');
        
        // Add new shot to the beginning (for descending order)
        existingShots.unshift(shotDocument);
        
        // Save back to localStorage
        localStorage.setItem(SHOT_STORAGE_KEY, JSON.stringify(existingShots));

        // Update in-memory data and UI immediately
        allShotData = existingShots;
        
        actualCarryErrorInput.value = '0.0';
        actualAimErrorInput.value = '0.0';

        // Restore default checkbox state after recording a shot.
        document.getElementById('includeCarryError').checked = true;
        document.getElementById('includeAimError').checked = true;

        // Explicitly confirm the club saved
        authStatus.textContent = `Shot for ${shotDocument.clubKey} recorded successfully!`;
        setTimeout(() => authStatus.textContent = "Data saved locally to this browser.", 3000);

        // NEW: Flash the record button to confirm success
        const recordButton = document.getElementById('recordShotButton');
        if (recordButton) {
            recordButton.classList.add('shot-recorded-success');
            setTimeout(() => {
                recordButton.classList.remove('shot-recorded-success');
            }, 500); // Remove the highlight after 500ms
        }
        
        // --- REVISED ORDER ---
        // 1. Immediately check all clubs for new recommendations. This is the most critical update.
        updateAllClubRecommendationStatus();
        // 2. Then, update the rest of the UI.
        renderShotHistory(allShotData.slice(0, MAX_HISTORY_ITEMS));
        updateTrustScoreDisplays(); // NEW: A new shot affects trust scores
        analyzeData();

    } catch (error) {
        console.error("Error writing shot document to localStorage: ", error);
        authStatus.textContent = "Error recording shot: See console for details.";
    }
}

/**
 * Loads all shot data from localStorage.
 */
function loadShots() {
    shotHistoryList.innerHTML = '<li class="text-gray-500 text-center py-4">Loading history from local storage...</li>';
    
    try {
        const storedData = localStorage.getItem(SHOT_STORAGE_KEY);
        
        if (storedData) {
            // Parse the JSON string into the array
            allShotData = JSON.parse(storedData);
        } else {
            allShotData = [];
        }            
        loadDataSourceDisplays();
        
        // Render history (last 10) and run analysis on all data
        renderShotHistory(allShotData.slice(0, MAX_HISTORY_ITEMS));
        updateTrustScoreDisplays(); // NEW: Update trust scores on load
        analyzeData();
        // NEW: Check for recommendations on initial load
        updateAllClubRecommendationStatus();
        
    } catch (error) {
        console.error("Error reading shot data from localStorage:", error);
        allShotData = [];
        shotHistoryList.innerHTML = `<li class="text-red-400 text-center py-4">Error loading local data.</li>`;
    }
}

/**
 * Loads custom multiplier presets from localStorage.
 */
function loadPresets() {
    try {
        const storedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
        const storedUpdates = localStorage.getItem(LAST_UPDATE_KEY);
        const storedHistory = localStorage.getItem(MULTIPLIER_HISTORY_KEY); // NEW: Load history
        if (storedPresets) {
            // Load last update timestamps if they exist
            if (storedUpdates) { recommendationCooldowns = JSON.parse(storedUpdates); }

            clubPresets = JSON.parse(storedPresets);
            document.getElementById('resetMultipliersButton').classList.remove('hidden');
        }
        // NEW: Load multiplier history if it exists
        if (storedHistory) {
            multiplierHistory = JSON.parse(storedHistory);
        }

    } catch (error) {
        console.error("Error loading custom presets from localStorage. Using defaults.", error);
    }
}

/**
 * Deletes a single shot from the history based on its timestamp.
 * @param {string} timestamp - The ISO string timestamp of the shot to delete.
 */
function deleteShot(timestamp) {
    // Find the index of the shot to remove
    const shotIndex = allShotData.findIndex(shot => shot.timestamp === timestamp);

    if (shotIndex > -1) {
        // Remove the shot from the in-memory array
        allShotData.splice(shotIndex, 1);

        try {
            // Save the updated array back to localStorage
            localStorage.setItem(SHOT_STORAGE_KEY, JSON.stringify(allShotData));

            // Re-render the UI to reflect the change
            renderShotHistory(allShotData.slice(0, MAX_HISTORY_ITEMS));
            updateTrustScoreDisplays(); // NEW: Deleting a shot affects trust scores
            analyzeData();
            updateAllClubRecommendationStatus();
        } catch (error) {
            console.error("Error saving data after deletion:", error);
            authStatus.textContent = "Error deleting shot. See console.";
        }
    }
}

// --- NEW: UNIFIED DATA MANAGEMENT FUNCTIONS ---

/**
 * Backs up all critical application data into a single JSON file.
 */
function backupAllData() {
    // 1. Gather all data from localStorage
    const shots = localStorage.getItem(SHOT_STORAGE_KEY);
    const presets = localStorage.getItem(PRESET_STORAGE_KEY);
    const history = localStorage.getItem(MULTIPLIER_HISTORY_KEY);
    const lastUpdates = localStorage.getItem(LAST_UPDATE_KEY);
    const analysisSettings = localStorage.getItem(ANALYSIS_SETTINGS_KEY);
    const rollSettings = localStorage.getItem(ROLL_SETTINGS_KEY); // NEW
    const firmnessSettings = localStorage.getItem(GREEN_FIRMNESS_SETTINGS_KEY);
    const stopwatchSettings = localStorage.getItem(STOPWATCH_SETTINGS_KEY); // NEW
    const stopwatchCues = localStorage.getItem(STOPWATCH_CUES_KEY); // NEW
    const lieCues = localStorage.getItem(LIE_CUES_STORAGE_KEY); // NEW: Add this line
    const ranges = localStorage.getItem(CLUB_RANGES_STORAGE_KEY); // NEW
    const notes = localStorage.getItem(SESSION_NOTES_KEY); // NEW
    const activeClubsData = localStorage.getItem(ACTIVE_CLUBS_STORAGE_KEY); // NEW
    const dtpMode = localStorage.getItem(DTP_COUNTER_MODE_KEY); // NEW
    const handedness = localStorage.getItem(PLAYER_HANDEDNESS_KEY); // NEW
    const greenGridMultiplier = localStorage.getItem(GREEN_GRID_MULTIPLIER_KEY); // NEW
    const cupSuggestionSettingsData = localStorage.getItem(CUP_SUGGESTION_SETTINGS_KEY); // NEW
    const powerSetting = localStorage.getItem(POWER_SETTING_KEY); // NEW

    // 2. Create a comprehensive backup object
    const fullBackup = {
        shots: shots ? JSON.parse(shots) : [],
        presets: presets ? JSON.parse(presets) : null,
        history: history ? JSON.parse(history) : {},
        lastUpdates: lastUpdates ? JSON.parse(lastUpdates) : {},
        analysisSettings: analysisSettings ? JSON.parse(analysisSettings) : {},
        rollSettings: rollSettings ? JSON.parse(rollSettings) : {}, // NEW
        greenFirmnessSettings: firmnessSettings ? JSON.parse(firmnessSettings) : {},
        stopwatchSettings: stopwatchSettings ? JSON.parse(stopwatchSettings) : {}, // NEW
        stopwatchCues: stopwatchCues ? JSON.parse(stopwatchCues) : {}, // NEW
        lieCues: lieCues ? JSON.parse(lieCues) : {}, // NEW: Add this line
        clubRanges: ranges ? JSON.parse(ranges) : {}, // NEW
        activeClubs: activeClubsData ? JSON.parse(activeClubsData) : [], // NEW
        notes: notes ? notes : "", // NEW
        dtpCounterMode: dtpMode ? dtpMode : 'additive', // NEW
        playerHandedness: handedness ? handedness : 'right', // NEW
        greenGridMultiplier: greenGridMultiplier ? greenGridMultiplier : '0.93', // NEW
        cupSuggestionSettings: cupSuggestionSettingsData ? JSON.parse(cupSuggestionSettingsData) : {}, // NEW
        powerSetting: powerSetting ? powerSetting : '100' // NEW
    };

    // 3. Create and download the JSON file
    const backupJSON = JSON.stringify(fullBackup, null, 2); // Pretty-print
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // .getMonth() is 0-indexed
    const year = now.getFullYear();
    const formattedDate = `${day}-${month}-${year}`; // DD-MM-YYYY

    // --- NEW: Calculate stats for the filename ---
    const shotCount = fullBackup.shots.length;
    let changedMultiplierCount = 0;
    const userPresets = fullBackup.presets;

    if (userPresets) {
        for (const clubKey in userPresets) {
            if (defaultClubPresets[clubKey]) {
                for (const categoryKey in userPresets[clubKey].windCategories) {
                    if (defaultClubPresets[clubKey].windCategories[categoryKey]) {
                        for (const multiplierKey in userPresets[clubKey].windCategories[categoryKey]) {
                            const userValue = userPresets[clubKey].windCategories[categoryKey][multiplierKey];
                            const defaultValue = defaultClubPresets[clubKey].windCategories[categoryKey][multiplierKey];
                            // Check if the value has changed from the default, accounting for floating point issues
                            if (Math.abs(userValue - defaultValue) > 0.001) {
                                changedMultiplierCount++;
                            }
                        }
                    }
                }
            }
        }
    }
    const statsString = `(${shotCount}_shots_${changedMultiplierCount}_mult)`;
    // --- END NEW ---
    
    try {
        const blob = new Blob([backupJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wind_app_full_backup_${formattedDate}_${statsString}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error creating full backup file:", error);
        alert("An error occurred while creating the backup file.");
    }
}

/**
 * NEW: Backs up just the application settings, excluding shot history and wind multipliers.
 */
function backupSettings() {
    // 1. Gather all settings from localStorage
    const playerHandedness = localStorage.getItem(PLAYER_HANDEDNESS_KEY);
    const clubRanges = localStorage.getItem(CLUB_RANGES_STORAGE_KEY);
    const activeClubs = localStorage.getItem(ACTIVE_CLUBS_STORAGE_KEY);
    const rollSettings = localStorage.getItem(ROLL_SETTINGS_KEY);
    const greenFirmnessSettings = localStorage.getItem(GREEN_FIRMNESS_SETTINGS_KEY);
    const greenGridMultiplier = localStorage.getItem(GREEN_GRID_MULTIPLIER_KEY);
    const dtpCounterMode = localStorage.getItem(DTP_COUNTER_MODE_KEY);
    const stopwatchCues = localStorage.getItem(STOPWATCH_CUES_KEY);
    const lieCues = localStorage.getItem(LIE_CUES_STORAGE_KEY);
    const powerSetting = localStorage.getItem(POWER_SETTING_KEY);
    const cupSuggestionSettings = localStorage.getItem(CUP_SUGGESTION_SETTINGS_KEY);
    const presets = localStorage.getItem(PRESET_STORAGE_KEY);

    // 2. Extract base roll ('r') values from presets
    const baseRolls = {};
    if (presets) {
        const parsedPresets = JSON.parse(presets);
        for (const clubKey in parsedPresets) {
            if (parsedPresets[clubKey] && typeof parsedPresets[clubKey].r !== 'undefined') {
                baseRolls[clubKey] = { r: parsedPresets[clubKey].r };
            }
        }
    }

    // 3. Create a settings backup object
    const settingsBackup = {
        playerHandedness: playerHandedness,
        clubRanges: clubRanges ? JSON.parse(clubRanges) : null,
        activeClubs: activeClubs ? JSON.parse(activeClubs) : null,
        rollSettings: rollSettings ? JSON.parse(rollSettings) : null,
        greenFirmnessSettings: greenFirmnessSettings ? JSON.parse(greenFirmnessSettings) : null,
        greenGridMultiplier: greenGridMultiplier,
        dtpCounterMode: dtpCounterMode,
        stopwatchCues: stopwatchCues ? JSON.parse(stopwatchCues) : null,
        lieCues: lieCues ? JSON.parse(lieCues) : null,
        powerSetting: powerSetting,
        cupSuggestionSettings: cupSuggestionSettings ? JSON.parse(cupSuggestionSettings) : null,
        presets: baseRolls // This only contains the 'r' values
    };

    // 4. Create and download the JSON file
    const backupJSON = JSON.stringify(settingsBackup, null, 2);
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
    
    try {
        const blob = new Blob([backupJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wind_app_settings_backup_${formattedDate}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error creating settings backup file:", error);
        alert("An error occurred while creating the settings backup file.");
    }
}

/**
 * NEW: Imports and smart-merges application settings.
 */
function importSettings(event) {
    const file = event.target.files[0];
    if (!file) return;

    const isConfirmed = window.confirm("WARNING: This will overwrite your current application settings (like club ranges, roll settings, etc.) with the data from the selected file. Your shot history and wind multipliers will NOT be affected.\n\nAre you sure you want to continue?");
    if (!isConfirmed) {
        event.target.value = ''; // Reset file input
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const data = JSON.parse(content);

            // --- Validation ---
            if (typeof data.clubRanges === 'undefined' || typeof data.presets === 'undefined') {
                alert("Import Failed: The selected file does not appear to be a valid 'Settings' backup.");
                return;
            }

            // --- 1. Overwrite simple settings ---
            const setItemIfExists = (key, value) => {
                if (value !== null && typeof value !== 'undefined') {
                    const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;
                    localStorage.setItem(key, valueToStore);
                }
            };

            setItemIfExists(PLAYER_HANDEDNESS_KEY, data.playerHandedness);
            setItemIfExists(CLUB_RANGES_STORAGE_KEY, data.clubRanges);
            setItemIfExists(ACTIVE_CLUBS_STORAGE_KEY, data.activeClubs);
            setItemIfExists(ROLL_SETTINGS_KEY, data.rollSettings);
            setItemIfExists(GREEN_FIRMNESS_SETTINGS_KEY, data.greenFirmnessSettings);
            setItemIfExists(GREEN_GRID_MULTIPLIER_KEY, data.greenGridMultiplier);
            setItemIfExists(DTP_COUNTER_MODE_KEY, data.dtpCounterMode);
            setItemIfExists(STOPWATCH_CUES_KEY, data.stopwatchCues);
            setItemIfExists(LIE_CUES_STORAGE_KEY, data.lieCues);
            setItemIfExists(POWER_SETTING_KEY, data.powerSetting);
            setItemIfExists(CUP_SUGGESTION_SETTINGS_KEY, data.cupSuggestionSettings);

            // --- 2. Merge Base Roll ---
            // The current presets are already loaded into the global `clubPresets` variable.
            if (data.presets) {
                for (const clubKey in data.presets) {
                    if (clubPresets[clubKey] && typeof data.presets[clubKey].r !== 'undefined') {
                        clubPresets[clubKey].r = data.presets[clubKey].r;
                    }
                }
            }

            // --- 3. Save the merged presets object ---
            localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(clubPresets));

            // NEW: Save the filename of the imported settings
            localStorage.setItem(SETTINGS_DATA_SOURCE_KEY, file.name);

            // --- 4. Reload page ---
            alert(`Successfully imported settings from ${file.name}!\n\nThe application will now reload.`);
            event.target.value = '';
            window.location.reload();

        } catch (error) {
            alert(`Error importing settings file: ${error.message}`);
        } finally {
            event.target.value = ''; // Reset file input
        }
    };
    reader.readAsText(file);
}

/**
 * Imports all application data from a single JSON file.
 */
function importAllData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const isConfirmed = window.confirm("WARNING: This will overwrite ALL existing shots, multipliers, and history with the data from the selected file. This action cannot be undone.\n\nAre you sure you want to continue?");
    if (!isConfirmed) {
        event.target.value = ''; // Reset file input
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const data = JSON.parse(content);

            // --- NEW: Validate the structure of the imported file ---
            // A full backup must have 'shots' and 'presets' keys. A shot-only backup is just an array.
            if (typeof data.shots === 'undefined' || typeof data.presets === 'undefined') {
                alert("Import Failed: The selected file does not appear to be a valid 'All Data' backup. It might be a 'Shots' or 'Multipliers' only backup. Please use the correct import button for that file type.");
                return; // Abort the import
            }

            // Restore all data to localStorage
            localStorage.setItem(SHOT_STORAGE_KEY, JSON.stringify(data.shots ?? []));
            localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(data.presets ?? defaultClubPresets));
            localStorage.setItem(MULTIPLIER_HISTORY_KEY, JSON.stringify(data.history ?? {}));
            localStorage.setItem(LAST_UPDATE_KEY, JSON.stringify(data.lastUpdates ?? {}));
            localStorage.setItem(ANALYSIS_SETTINGS_KEY, JSON.stringify(data.analysisSettings ?? {}));
            localStorage.setItem(ROLL_SETTINGS_KEY, JSON.stringify(data.rollSettings ?? {})); // NEW
            localStorage.setItem(GREEN_FIRMNESS_SETTINGS_KEY, JSON.stringify(data.greenFirmnessSettings ?? {})); // NEW
            localStorage.setItem(STOPWATCH_SETTINGS_KEY, JSON.stringify(data.stopwatchSettings ?? {})); // NEW
            localStorage.setItem(STOPWATCH_CUES_KEY, JSON.stringify(data.stopwatchCues ?? {})); // NEW
            localStorage.setItem(LIE_CUES_STORAGE_KEY, JSON.stringify(data.lieCues ?? {})); // NEW: Add this line
            localStorage.setItem(CLUB_RANGES_STORAGE_KEY, JSON.stringify(data.clubRanges ?? {})); // NEW
            localStorage.setItem(SESSION_NOTES_KEY, data.notes ?? ""); // NEW
            localStorage.setItem(ACTIVE_CLUBS_STORAGE_KEY, JSON.stringify(data.activeClubs ?? [])); // NEW
            localStorage.setItem(DTP_COUNTER_MODE_KEY, data.dtpCounterMode ?? 'additive'); // NEW
            localStorage.setItem(PLAYER_HANDEDNESS_KEY, data.playerHandedness ?? 'right'); // NEW
            localStorage.setItem(GREEN_GRID_MULTIPLIER_KEY, data.greenGridMultiplier ?? '0.93'); // NEW
            localStorage.setItem(CUP_SUGGESTION_SETTINGS_KEY, JSON.stringify(data.cupSuggestionSettings ?? {})); // NEW
            localStorage.setItem(POWER_SETTING_KEY, data.powerSetting ?? '100'); // NEW

            // NEW: Set both data sources to the name of the imported file
            localStorage.setItem(SHOT_DATA_SOURCE_KEY, file.name);
            localStorage.setItem(MULTIPLIER_DATA_SOURCE_KEY, file.name);
            localStorage.setItem(SETTINGS_DATA_SOURCE_KEY, file.name); // A full backup is also a source for settings.

            // FIX: Reload the page to ensure all components are refreshed with the new data.
            // This is the most robust way to handle a full data import.
            alert(`Successfully imported all data from ${file.name}!\n\nThe application will now reload.`);
            // CRITICAL FIX: Reset the input's value BEFORE reloading to prevent a phantom 'change' event on page load.
            event.target.value = '';
            window.location.reload();
        } catch (error) {
            alert(`Error importing file: ${error.message}`);
        } finally {
            event.target.value = ''; // Reset file input
        }
    };
    reader.readAsText(file);
}

/**
 * NEW: Resets all application settings to their default values without affecting shot or multiplier data.
 */
function resetSettings() {
    const isConfirmed = window.confirm("Are you sure you want to reset all application settings (e.g., club ranges, roll settings, player handedness) to their defaults?\n\nThis will NOT affect your shot history or your custom wind multipliers.");
    if (isConfirmed) {
        try {
            // 1. Remove simple, standalone settings keys from localStorage
            localStorage.removeItem(PLAYER_HANDEDNESS_KEY);
            localStorage.removeItem(CLUB_RANGES_STORAGE_KEY);
            localStorage.removeItem(ACTIVE_CLUBS_STORAGE_KEY);
            localStorage.removeItem(ROLL_SETTINGS_KEY);
            localStorage.removeItem(GREEN_FIRMNESS_SETTINGS_KEY);
            localStorage.removeItem(GREEN_GRID_MULTIPLIER_KEY);
            localStorage.removeItem(DTP_COUNTER_MODE_KEY);
            localStorage.removeItem(STOPWATCH_CUES_KEY);
            localStorage.removeItem(LIE_CUES_STORAGE_KEY);
            localStorage.removeItem(CUP_SUGGESTION_SETTINGS_KEY);
            localStorage.removeItem(POWER_SETTING_KEY);
            localStorage.removeItem(ANALYSIS_SETTINGS_KEY);
            localStorage.removeItem(STOPWATCH_SETTINGS_KEY);
            localStorage.removeItem(SETTINGS_DATA_SOURCE_KEY);

            // 2. Surgically reset only the base roll ('r') values within the existing presets
            const storedPresets = localStorage.getItem(PRESET_STORAGE_KEY);
            if (storedPresets) {
                let currentPresets = JSON.parse(storedPresets);
                for (const clubKey in currentPresets) {
                    // Ensure both the current preset and the default preset for the club exist
                    if (currentPresets[clubKey] && defaultClubPresets[clubKey]) {
                        // Reset only the 'r' value, leaving wind multipliers (hw, tw, etc.) untouched
                        currentPresets[clubKey].r = defaultClubPresets[clubKey].r;
                    }
                }
                // Save the modified presets object back to localStorage
                localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(currentPresets));
            }

            // 3. Reload the page to apply all default values cleanly
            alert("All settings have been reset to their defaults. The application will now reload.");
            window.location.reload();
        } catch (error) {
            console.error("Error resetting settings:", error);
            alert("An error occurred while resetting settings. Please check the console for details.");
        }
    }
}

/**
 * NEW: Loads and updates the data source display elements in the settings modal.
 */
function loadDataSourceDisplays() {
    const shotSource = localStorage.getItem(SHOT_DATA_SOURCE_KEY) || '--';
    const multSource = localStorage.getItem(MULTIPLIER_DATA_SOURCE_KEY) || '--';
    const settingsSource = localStorage.getItem(SETTINGS_DATA_SOURCE_KEY) || '--';

    const shotDisplay = document.getElementById('shotDataSourceDisplay');
    const multDisplay = document.getElementById('multiplierDataSourceDisplay');
    const settingsDisplay = document.getElementById('settingsDataSourceDisplay');

    if (shotDisplay) shotDisplay.textContent = shotSource;
    if (multDisplay) multDisplay.textContent = multSource;
    if (settingsDisplay) settingsDisplay.textContent = settingsSource;
}


/**
 * NEW: Resets the entire application to its default state by clearing all data from localStorage.
 */
function resetAllData() {
    const isConfirmed = window.confirm(
        "EXTREME WARNING:\n\nThis will permanently delete ALL of your data, including every shot, all custom multipliers, and your entire multiplier history. This is the master reset for the application.\n\nThis action CANNOT be undone.\n\nAre you absolutely sure you want to proceed?"
    );

    if (isConfirmed) {
        try {
            // Clear all known keys from localStorage
            localStorage.removeItem(SHOT_STORAGE_KEY);
            localStorage.removeItem(PRESET_STORAGE_KEY);
            localStorage.removeItem(LAST_UPDATE_KEY);
            localStorage.removeItem(ANALYSIS_SETTINGS_KEY);
            localStorage.removeItem(MULTIPLIER_HISTORY_KEY);
            localStorage.removeItem(ROLL_SETTINGS_KEY); // NEW
            localStorage.removeItem(GREEN_FIRMNESS_SETTINGS_KEY); // NEW
            localStorage.removeItem(STOPWATCH_SETTINGS_KEY); // NEW
            localStorage.removeItem(CLUB_RANGES_STORAGE_KEY); // NEW
            localStorage.removeItem(SESSION_NOTES_KEY); // NEW                
            localStorage.removeItem(DTP_COUNTER_MODE_KEY); // NEW
            localStorage.removeItem(PLAYER_HANDEDNESS_KEY); // NEW
            localStorage.removeItem(SHOT_DATA_SOURCE_KEY); // NEW
            localStorage.removeItem(MULTIPLIER_DATA_SOURCE_KEY); // NEW
            localStorage.removeItem(SETTINGS_DATA_SOURCE_KEY); // NEW
            localStorage.removeItem(GREEN_GRID_MULTIPLIER_KEY); // NEW
            localStorage.removeItem(CUP_SUGGESTION_SETTINGS_KEY); // NEW
            localStorage.removeItem(POWER_SETTING_KEY); // NEW

            // Reload the application to reflect the cleared state
            // This is simpler and more robust than manually resetting every variable
            window.location.reload();

            // This alert will likely not be seen due to the reload, but is good practice
            alert("All application data has been reset. The page will now reload.");

        } catch (error) {
            console.error("Error resetting all data:", error);
            alert("An error occurred while trying to reset the data. Please check the console for details.");
        }
    }
}


/**
 * Clears all shot history from localStorage after confirmation.
 */
function clearAllShots() {
    const isConfirmed = window.confirm("Are you sure you want to delete ALL shot history? This action cannot be undone.");
    if (isConfirmed) {
        try {
            // Clear from storage
            localStorage.removeItem(SHOT_STORAGE_KEY);
            // Clear in-memory data
            allShotData = [];
            // NEW: Clear the shot data source
            localStorage.removeItem(SHOT_DATA_SOURCE_KEY);
            loadDataSourceDisplays(); // Manually update UI

            activePlotFilter = null;
            // Refresh UI
            renderShotHistory([]);
            updateTrustScoreDisplays(); // NEW: Clearing shots resets trust scores
            analyzeData();
            updateAllClubRecommendationStatus();
            authStatus.textContent = "All shot history has been cleared.";
            setTimeout(() => authStatus.textContent = "Data saved locally to this browser.", 3000);
        } catch (error) {
            console.error("Error clearing shot history:", error);
            authStatus.textContent = "Error clearing history. See console.";
        }
    }
}

/**
 * Backs up the current shot history from localStorage to a JSON file.
 */
function backupShots() {
    const storedShots = localStorage.getItem(SHOT_STORAGE_KEY);
    if (!storedShots || JSON.parse(storedShots).length === 0) {
        alert("No shot data found to back up.");
        return;
    }
    
    const shotsArray = JSON.parse(storedShots);
    const numberOfShots = shotsArray.length;

    const now = new Date(); // Get current date and time
    const day = now.getDate().toString().padStart(2, '0'); // Day (DD)
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month (MM), getMonth() is 0-indexed
    const year = now.getFullYear(); // Year (YYYY)
    const formattedDate = `${day}-${month}-${year}`; // DD-MM-YYYY
    try {
        const blob = new Blob([storedShots], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        link.download = `shot_history_backup_${formattedDate}_(${numberOfShots}_shots).json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error creating shot backup file:", error);
        alert("An error occurred while trying to create the backup file. See console for details.");
    }
}

/**
 * Imports shots from a user-selected JSON file, with an option to merge or replace.
 */
function importShots(event) {
    const file = event.target.files[0];
    if (!file) return;
    const filename = file.name;

    // NEW: Add confirmation dialog to prevent accidental overwrite
    const isConfirmed = window.confirm(
        "This will overwrite all current shot history with the data from the selected file. This action cannot be undone.\n\nAre you sure you want to continue?"
    );
    if (!isConfirmed) {
        event.target.value = ''; // Reset the input so the same file can be selected again
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const importedShots = JSON.parse(content);
            
            // Basic validation
            if (!Array.isArray(importedShots)) {
                throw new Error("Invalid file format. Expected a JSON array of shots.");
            }

            localStorage.setItem(SHOT_STORAGE_KEY, JSON.stringify(importedShots));                
            localStorage.setItem(SHOT_DATA_SOURCE_KEY, filename); // NEW: Set shot source
            localStorage.removeItem(MULTIPLIER_DATA_SOURCE_KEY); // NEW: Clear multiplier source


            // FIX: Reload the page to ensure all components are refreshed with the new data.
            alert(`Imported ${importedShots.length} shots from ${filename}!\n\nThe application will now reload.`);
            // CRITICAL FIX: Reset the input's value BEFORE reloading to prevent a phantom 'change' event on page load.
            event.target.value = '';
            window.location.reload();
        } catch (error) {
            alert(`Error importing file: ${error.message}`);
        }
    };
    reader.readAsText(file);
}

/**
 * Clears custom multiplier presets from localStorage and reverts to defaults.
 */
function resetAllPresets() {
    const isConfirmed = window.confirm("Are you sure you want to reset ALL multiplier values to their defaults? This cannot be undone.");
    if (isConfirmed) {
        localStorage.removeItem(PRESET_STORAGE_KEY);
        clubPresets = JSON.parse(JSON.stringify(defaultClubPresets)); // Deep copy defaults
        // Also clear the update timestamps when resetting presets
        recommendationCooldowns = {};
        // NEW: Also clear the multiplier history
        multiplierHistory = {};
        localStorage.removeItem(MULTIPLIER_HISTORY_KEY);
        localStorage.removeItem(LAST_UPDATE_KEY);
        // NEW: Clear the multiplier data source
        localStorage.removeItem(MULTIPLIER_DATA_SOURCE_KEY);
        document.getElementById('resetMultipliersButton').classList.add('hidden');
        loadDataSourceDisplays(); // Manually update UI
        
        // Re-apply and re-analyze to reflect the change
        applyClubPreset(activeClubKey);
        updateTrustScoreDisplays(); 
        analyzeData(); // Re-run analysis to clear old recommendations.
        updateAllClubRecommendationStatus(); // Re-check all clubs for new recommendations based on default values.
    }
}

/**
 * Backs up the current custom presets from localStorage to a JSON file.
 */
function backupPresets() {
    const storedPresetsJSON = localStorage.getItem(PRESET_STORAGE_KEY);
    if (!storedPresetsJSON) {
        alert("No custom multipliers found to back up. Your settings are currently at default.");
        return;
    }

    // NEW: Create a comprehensive backup object
    const backupData = {
        presets: JSON.parse(storedPresetsJSON),
        updateTimestamps: recommendationCooldowns, // Include the cooldowns/timestamps
        history: multiplierHistory // NEW: Include the full history in the backup
    };

    const backupJSON = JSON.stringify(backupData, null, 2); // Pretty-print the JSON

    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0'); // Day (DD)
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month (MM), getMonth() is 0-indexed
    const year = now.getFullYear(); // Year (YYYY)
    const formattedDate = `${day}-${month}-${year}`; // DD-MM-YYYY
    try {
        const blob = new Blob([backupJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        link.download = `multiplier_backup_${formattedDate}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Error creating backup file:", error);
        alert("An error occurred while trying to create the backup file. See console for details.");
    }
}

/**
 * Imports presets from a user-selected JSON file.
 */
function importPresets(event) {
    const file = event.target.files[0];
    if (!file) return;
    const filename = file.name;

    // NEW: Add confirmation dialog to prevent accidental overwrite
    const isConfirmed = window.confirm(
        "This will overwrite all current multipliers, update history, and other analysis data with the contents of the selected file. This action cannot be undone.\n\nAre you sure you want to continue?"
    );
    if (!isConfirmed) {
        event.target.value = ''; // Reset the input so the same file can be selected again
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const parsed = JSON.parse(content);

            // NEW: Check for the new backup structure, but also support the old one.
            let presetsToLoad;
            let timestampsToLoad = {}; // Default to empty
            let historyToLoad = {}; // NEW: Default to empty

            if (parsed.presets) { // Check for the main 'presets' key
                // New format
                presetsToLoad = parsed.presets;
                timestampsToLoad = parsed.updateTimestamps || {};
                historyToLoad = parsed.history || {}; // NEW: Load history if it exists

            } else if (parsed['D'] && parsed['D'].windCategories) { // Fallback for old format
                // Old format
                presetsToLoad = parsed;
                alert("Importing an older backup format. 'View Since Update' data will not be restored.");
            } else {
                throw new Error("Invalid preset file format.");
            }

            localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presetsToLoad));
            localStorage.setItem(LAST_UPDATE_KEY, JSON.stringify(timestampsToLoad));
            localStorage.setItem(MULTIPLIER_HISTORY_KEY, JSON.stringify(historyToLoad)); // NEW: Save history
            localStorage.setItem(MULTIPLIER_DATA_SOURCE_KEY, filename); // NEW: Set multiplier source

            // FIX: Reload the page to ensure all components are refreshed with the new data.
            alert(`Successfully imported multipliers from ${filename}!\n\nThe application will now reload.`);
            // CRITICAL FIX: Reset the input's value BEFORE reloading to prevent a phantom 'change' event on page load.
            event.target.value = '';
            window.location.reload();

        } catch (error) {
            alert(`Error importing file: ${error.message}`);
        }
    };
    reader.readAsText(file);
}

/**
 * Sets the active club for analysis and triggers data processing.
 * @param {string} clubKey - The club key to analyze.
 */
function setActiveAnalysisClub(clubKey) {
    // NEW: Clear any active table row filter to ensure the plot resets correctly
    activePlotFilter = null;
    // NEW: Reset the plot filter state whenever a new club is selected
    const filterStatusDisplay = document.getElementById('filterStatusDisplay');
    isPlotFiltered = false;

    activeAnalysisClubKey = clubKey;
    currentAnalysisClubDisplay.textContent = clubKey;
    
    // Update button styles
    analysisClubButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-club') === clubKey) {
            btn.classList.add('active');
            // The .active class styles will override the defaults, no need to remove them.
        }
    });

    // NEW: Reset the filter status display text when changing clubs
    if (filterStatusDisplay) {
        filterStatusDisplay.textContent = 'Viewing: All';
        filterStatusDisplay.className = 'font-semibold text-gray-400';
    }

    analyzeData();
}

/**
 * NEW: Gets the COUNT of pending recommendations for a specific club.
 * @param {Array} shots - The array of all shot data.
 * @param {string} clubKey - The club to check.
 * @returns {number} - The number of available recommendations.
 */
function getRecommendationCountForClub(shots, clubKey) {
    let recommendationCount = 0;
    const filteredShots = shots.filter(shot => shot.clubKey === clubKey);
    if (filteredShots.length < 3) return 0; // Not enough data, return 0 instead of false

    // --- REVISED LOGIC: Replicate the weighting system from processShotData for accuracy ---
    const MAX_ERROR_FOR_WEIGHTING = parseFloat(document.getElementById('maxErrorForWeightingInput').value) || 10.0;
    const getShotWeight = (shot) => {
        const totalError = Math.sqrt(Math.pow(shot.actualCarryError, 2) + Math.pow(shot.actualAimError, 2));
        if (totalError >= MAX_ERROR_FOR_WEIGHTING) {
            return 0;
        }
        const weight = 1.0 - (totalError / MAX_ERROR_FOR_WEIGHTING);
        return weight;
    };
    // --- END REVISION ---

    const recommendationData = {};
    const RECOMMENDATION_THRESHOLD = 0.03;
    const MIN_SHOTS_FOR_RECOMMENDATION = 3;

    WIND_CATEGORIES_ORDER.forEach(category => {
        recommendationData[category] = {};
        ANALYSIS_COMPONENTS_ORDER.forEach(component => {
            // REVISED: Store full shot objects to allow for weighting
            recommendationData[category][component] = { shots: [] };
        });
    });

    filteredShots.forEach(shot => {
        const category = shot.windCategory;
        // FIX: Add check for non-null carry error before including in count
        if (shot.actualCarryError !== null && shot.calculatedCarryAdj > EPSILON && shot.headwindComponentSpeed > MIN_WIND_FOR_RECOMMENDATION_CALC) {
            recommendationData[category]['Headwind'].shots.push(shot);
        } else if (shot.actualCarryError !== null && shot.calculatedCarryAdj < -EPSILON && shot.tailwindComponentSpeed > MIN_WIND_FOR_RECOMMENDATION_CALC) {
            recommendationData[category]['Tailwind'].shots.push(shot);
        }

        // --- REVISED: Use bias-aware logic for recommendation counting ---
        // FIX: Add check for non-null aim error before including in count
        const isSignificantCrosswind = shot.actualAimError !== null && Math.abs(shot.calculatedAimAdj) > MIN_WIND_FOR_RECOMMENDATION_CALC;
        if (isSignificantCrosswind) {
            const isLeftAdj = shot.calculatedAimAdj > EPSILON;
            const isRightAdj = shot.calculatedAimAdj < -EPSILON;

            // This logic is identical to processShotData
            const isAssist = (shot.shotBias === 'fade' && isLeftAdj) || (shot.shotBias === 'draw' && isRightAdj); 
            const isOpposed = (shot.shotBias === 'fade' && isRightAdj) || (shot.shotBias === 'draw' && isLeftAdj); 

            if (isAssist) {
                recommendationData[category]['Assist Crosswind'].shots.push(shot);
            } else if (isOpposed) {
                recommendationData[category]['Opposed Crosswind'].shots.push(shot);
            }
        }
        // --- END REVISION ---
    });

    const multiplierMap = {
        'Headwind': 'hw',
        'Tailwind': 'tw',
        'Assist Crosswind': 'acw',
        'Opposed Crosswind': 'ocw'
    };

    for (const category of WIND_CATEGORIES_ORDER) {
        for (const component of ANALYSIS_COMPONENTS_ORDER) {
            const data = recommendationData[category][component];
            
            // REVISED: Check shot count, not ideal multiplier count
            if (data.shots.length >= MIN_SHOTS_FOR_RECOMMENDATION) {
                // --- REVISED: Build the weighted list exactly like in processShotData ---
                const weightedIdealMultipliers = [];
                data.shots.forEach(shot => {
                    const idealMultiplier = calculateIdealMultiplierForShot(shot, component);
                    if (idealMultiplier !== null) {
                        const weight = getShotWeight(shot);
                        const replicationCount = Math.round(weight * 10);
                        for (let i = 0; i < replicationCount; i++) {
                            weightedIdealMultipliers.push(idealMultiplier);
                        }
                    }
                });
                // --- END REVISION ---

                const avgIdeal = calculateIQRMedian(weightedIdealMultipliers); // Use robust median on the weighted list
                const multiplierKey = multiplierMap[component];
                const currentMultiplier = clubPresets[clubKey].windCategories[category][multiplierKey];
                
                if (Math.abs(avgIdeal - currentMultiplier) > RECOMMENDATION_THRESHOLD) { 
                    recommendationCount++; // Found a recommendation
                }
            }
        }
    }
    return recommendationCount;
}

/**
 * Scans all clubs for recommendations and updates the analysis button highlights.
 */
function updateAllClubRecommendationStatus() {
    const newRecommendationClubs = new Set();
    const clubKeys = Object.keys(clubPresets);

    clubKeys.forEach(clubKey => {
        const count = getRecommendationCountForClub(allShotData, clubKey);
        if (count > 0) {
            newRecommendationClubs.add(clubKey);
        }
    });

    analysisClubButtons.forEach(btn => {
        const btnKey = btn.getAttribute('data-club');
        const badge = btn.querySelector('.recommendation-badge');
        const count = getRecommendationCountForClub(allShotData, btnKey);

        if (badge) {
            badge.textContent = count;
            badge.classList.toggle('hidden', count === 0);
        }

        const hasNewRec = newRecommendationClubs.has(btnKey);
        const hadOldRec = clubsWithActiveRecommendations.has(btnKey);

        // Add the highlight class if there's a recommendation
        btn.classList.toggle('has-recommendation', hasNewRec);

        // If a recommendation just appeared, add the wiggle animation
        if (hasNewRec && !hadOldRec) {
            btn.classList.add('new-recommendation-wiggle');
            // Remove the class after the animation finishes to allow it to re-trigger later
            setTimeout(() => btn.classList.remove('new-recommendation-wiggle'), 600); // 2 * 300ms
        }
    });

    // Update the state for the next comparison
    clubsWithActiveRecommendations = newRecommendationClubs;

    // NEW: Update the main analysis tab indicator
    const analysisTabButton = document.querySelector('.tab-button[data-tab="analysis"]');
    if (analysisTabButton) {
        analysisTabButton.classList.toggle('has-recommendation-indicator', clubsWithActiveRecommendations.size > 0);
    }

    // NEW: Update the footer analysis button indicator
    const analysisFooterButton = document.getElementById('analysis-scroll-button');
    if (analysisFooterButton) {
        analysisFooterButton.classList.toggle(
            'footer-analysis-indicator', 
            clubsWithActiveRecommendations.size > 0
        );
    }
}
/**
 * Processes all fetched shot data to calculate average errors per wind component, 
 * grouped by wind category, for the active club.
 */
// --- REFACTORED: Moved getShotWeight to be a global helper function ---
function getShotWeight(shot) {
    const MAX_ERROR_FOR_WEIGHTING = parseFloat(document.getElementById('maxErrorForWeightingInput').value) || 10.0;
    // Use the hypotenuse of the errors to find the direct distance from the target
    const totalError = Math.sqrt(Math.pow(shot.actualCarryError ?? 0, 2) + Math.pow(shot.actualAimError ?? 0, 2));
    if (totalError >= MAX_ERROR_FOR_WEIGHTING) {
        return 0; // This shot is too wayward to be considered
    }
    // Linear falloff: weight decreases as error increases
    return 1.0 - (totalError / MAX_ERROR_FOR_WEIGHTING);
};

function processShotData(shots, clubKey) {
    // 1. Filter by Club
    const filteredShots = shots.filter(shot => shot.clubKey === clubKey);
    
    // 2. Initialize Component Groupings
    // Use a structure to hold results for each Category-Component pair
    const results = {}; 

    const recommendationData = {};
    WIND_CATEGORIES_ORDER.forEach(category => {
        // Initialize category total row
        const categoryLabel = WIND_CATEGORIES_MAP[category].label.replace(/ \(.+\)/, ''); 
        // REVISED: Use separate totals and counts for carry and aim to handle nulls correctly.
        results[category] = { carryTotal: 0, aimTotal: 0, carryCount: 0, aimCount: 0, label: `${categoryLabel} Wind Total`, isCategoryTotal: true };

        ANALYSIS_COMPONENTS_ORDER.forEach(component => {
            const key = `${category}-${component}`;
            results[key] = { carryTotal: 0, aimTotal: 0, carryCount: 0, aimCount: 0, label: component };
        });

        // NEW: Initialize recommendation data structure
        recommendationData[category] = { // REVISED: Store shot objects to retain weight info
            'Headwind': { shots: [] },
            'Tailwind': { shots: [] },
            'Assist Crosswind': { shots: [] },
            'Opposed Crosswind': { shots: [] }
        };
    });
    
    results['Total'] = { carryTotal: 0, aimTotal: 0, carryCount: 0, aimCount: 0, label: 'Grand Total', isGrandTotal: true };

    // 3. Populate Groupings
    filteredShots.forEach(shot => {
        const category = shot.windCategory;
        
        // REVISED: Track Grand and Category Totals, respecting nulls
        if (shot.actualCarryError !== null) {
            results['Total'].carryTotal += shot.actualCarryError;
            results['Total'].carryCount += 1;
            if (results[category]) {
                results[category].carryTotal += shot.actualCarryError;
                results[category].carryCount += 1;
            }
        }
        if (shot.actualAimError !== null) {
            results['Total'].aimTotal += shot.actualAimError;
            results['Total'].aimCount += 1;
            if (results[category]) {
                results[category].aimTotal += shot.actualAimError;
                results[category].aimCount += 1;
            }
        }

        // Carry Analysis (HW/TW dominance based on calculated adjustment sign)
        // positive calculatedCarryAdj (long adjustment needed) is HW dominant
        if (shot.calculatedCarryAdj > EPSILON) {
            const key = `${category}-Headwind`;
            // REVISED: Check for null and significance
            if (results[key] && shot.actualCarryError !== null && shot.headwindComponentSpeed > MIN_WIND_FOR_RECOMMENDATION_CALC) {
                results[key].carryTotal += shot.actualCarryError;
                results[key].carryCount += 1;
                // REVISED: Store the entire shot object
                recommendationData[category]['Headwind'].shots.push(shot);
            }
        } 
        // negative calculatedCarryAdj (short adjustment needed) is TW dominant
        else if (shot.calculatedCarryAdj < -EPSILON) { 
            const key = `${category}-Tailwind`;
            // REVISED: Check for null and significance
            if (results[key] && shot.actualCarryError !== null && shot.tailwindComponentSpeed > MIN_WIND_FOR_RECOMMENDATION_CALC) {
                results[key].carryTotal += shot.actualCarryError;
                results[key].carryCount += 1;
                // REVISED: Store the entire shot object
                recommendationData[category]['Tailwind'].shots.push(shot);
            }
        }

        // --- REVISED: Bias-Aware Aim Analysis ---
        // This logic now correctly categorizes shots based on the bias used for that specific shot.
        const isSignificantCrosswind = shot.actualAimError !== null && Math.abs(shot.calculatedAimAdj) > MIN_WIND_FOR_RECOMMENDATION_CALC;
        if (isSignificantCrosswind) {
            const isLeftAdj = shot.calculatedAimAdj > EPSILON; // Wind from right, requires left aim adjustment
            const isRightAdj = shot.calculatedAimAdj < -EPSILON; // Wind from left, requires right aim adjustment

            // Determine if the situation was 'Assist' or 'Opposed' based on the shot's bias
            const isAssist = (shot.shotBias === 'fade' && isLeftAdj) || (shot.shotBias === 'draw' && isRightAdj);
            const isOpposed = (shot.shotBias === 'fade' && isRightAdj) || (shot.shotBias === 'draw' && isLeftAdj);

            if (isAssist) {
                const component = 'Assist Crosswind';
                const key = `${category}-${component}`;
                if (results[key]) {
                    results[key].aimTotal += shot.actualAimError;
                    results[key].aimCount += 1;
                    recommendationData[category][component].shots.push(shot);
                }
            } else if (isOpposed) {
                const component = 'Opposed Crosswind';
                const key = `${category}-${component}`;
                if (results[key]) {
                    results[key].aimTotal += shot.actualAimError;
                    results[key].aimCount += 1;
                    recommendationData[category][component].shots.push(shot);
                }
            }
        }
    });

    // 4. Calculate Averages
    const analysisResults = {};
    for (const key in results) {
        const data = results[key];
        analysisResults[key] = {
            label: data.label,
            // REVISED: Use separate counts for accurate averages
            carryCount: data.carryCount,
            aimCount: data.aimCount,
            avgCarryError: data.carryCount > 0 ? (data.carryTotal / data.carryCount) : 0,
            avgAimError: data.aimCount > 0 ? (data.aimTotal / data.aimCount) : 0,
            isCategoryTotal: data.isCategoryTotal || false,
            isGrandTotal: data.isGrandTotal || false,
        };
    }
    
    dataPointsCountDisplay.textContent = filteredShots.length;
    
    // NEW: Clear any previous outlier flags before processing
    allShotData.forEach(shot => delete shot.isOutlier);
    const RECOMMENDATION_THRESHOLD = 0.03; // Min difference to trigger a recommendation

    // NEW: Generate recommendations
    recommendationList.innerHTML = ''; // Clear old recommendations
    let recommendationsMade = 0;

    WIND_CATEGORIES_ORDER.forEach(category => {
        ANALYSIS_COMPONENTS_ORDER.forEach(component => {
            const data = recommendationData[category][component];
            if (data.shots.length >= MIN_SHOTS_FOR_RECOMMENDATION) {

                // --- NEW: Create the weighted list of ideal multipliers ---
                const weightedIdealMultipliers = [];
                data.shots.forEach(shot => {
                    const idealMultiplier = calculateIdealMultiplierForShot(shot, component);
                    if (idealMultiplier !== null) {
                        const weight = getShotWeight(shot);
                        // Replicate the value based on its weight (e.g., 0.8 weight = 8 entries)
                        const replicationCount = Math.round(weight * 10);
                        for (let i = 0; i < replicationCount; i++) {
                            weightedIdealMultipliers.push(idealMultiplier);
                        }
                    }
                });
                // --- END NEW ---

                const multiplierMap = {
                    'Headwind': 'hw',
                    'Tailwind': 'tw',
                    'Assist Crosswind': 'acw',
                    'Opposed Crosswind': 'ocw'
                };
                const multiplierKey = multiplierMap[component];
                const currentMultiplier = clubPresets[clubKey].windCategories[category][multiplierKey];
                
                // --- REVISED: Determine outlier count from the new weighted list ---

                let outliersExcluded = 0;
                let cleanedShotCount = data.shots.length; // The user-facing count is still the number of unique shots

                if (weightedIdealMultipliers.length >= 4) { // Only perform IQR if there's enough data
                    const sorted = [...weightedIdealMultipliers].sort((a, b) => a - b);
                    const getQuantile = (arr, q) => {
                        const pos = (arr.length - 1) * q;
                        const base = Math.floor(pos);
                        const rest = pos - base;
                        return arr[base + 1] !== undefined ? arr[base] + rest * (arr[base + 1] - arr[base]) : arr[base];
                    };
                    const q1 = getQuantile(sorted, 0.25);
                    const q3 = getQuantile(sorted, 0.75);
                    const iqr = q3 - q1;
                    const lowerBound = q1 - 1.5 * iqr;
                    const upperBound = q3 + 1.5 * iqr;

                    const filteredData = sorted.filter(x => x >= lowerBound && x <= upperBound);
                    outliersExcluded = weightedIdealMultipliers.length - filteredData.length;

                    // Find and flag the shots that correspond to the outlier values
                    const outlierValues = sorted.filter(x => x < lowerBound || x > upperBound);
                    if (outlierValues.length > 0) {
                        // Flag original shots if their calculated multiplier was an outlier
                        data.shots.forEach(shot => {
                            const idealMultiplier = calculateIdealMultiplierForShot(shot, component);
                            if (outlierValues.includes(idealMultiplier)) shot.isOutlier = true;
                        });
                    }
                }
                // --- END REVISED ---

                // REVISED: Run the robust median on the WEIGHTED list of multipliers
                const avgIdeal = calculateIQRMedian(weightedIdealMultipliers);
                
                // REVISED: Calculate Std Dev on the WEIGHTED list for confidence
                const stdDev = calculateStandardDeviation(weightedIdealMultipliers);


                let confidence;
                if (stdDev < HIGH_CONFIDENCE_STD_DEV_THRESHOLD) {
                    confidence = 'High';
                } else if (stdDev < MEDIUM_CONFIDENCE_STD_DEV_THRESHOLD) {
                    confidence = 'Medium';
                } else {
                    confidence = 'Low';
                }
                const difference = Math.abs(avgIdeal - currentMultiplier);
                if (difference > RECOMMENDATION_THRESHOLD) {
                    // --- REVISED: Final, Simplified Display Logic ---
                    // The component name from the analysis is the source of truth.
                    // No more re-interpretation. If it's an 'Assist Crosswind' group, the text will say that.
                    const displayComponent = component;
                    // --- END REVISION ---

                    const categoryLabel = WIND_CATEGORIES_MAP[category].label;
                    const newMultiplier = parseFloat(avgIdeal.toFixed(2)); // The recommended value
                    
                    const li = document.createElement('li');
                    // NEW: Add a class for easier selection and transition
                    let borderColor, borderStyle;
                    switch (confidence) {
                        case 'High':
                            borderColor = 'border-grass-green';
                            borderStyle = 'border-solid';
                            break;
                        case 'Medium':
                            borderColor = 'border-bunker-yellow';
                            borderStyle = 'border-solid';
                            break;
                        case 'Low':
                            borderColor = 'border-red-500'; // More intuitive for low confidence
                            borderStyle = 'border-dashed';
                            break;
                    }
                    li.className = `recommendation-item p-2 bg-gray-800 rounded-lg border-l-4 ${borderColor} ${borderStyle} flex justify-between items-center transition-all duration-300 ease-in-out`;
                    
                    // Store context for the buttons
                    const buttonContext = `data-club-key="${clubKey}" data-category="${category}" data-component="${component}"`;

                    li.innerHTML = `
                        <div>
                            Based on <strong>${cleanedShotCount} shots</strong> for <strong>${categoryLabel}</strong>, adjust <strong>${displayComponent}</strong>: 
                            <span class="font-bold text-red-400 line-through">${currentMultiplier.toFixed(2)}</span> → <span class="font-bold text-grass-green">${newMultiplier.toFixed(2)}</span>.
                            <br><span class="text-xs text-gray-400">Confidence: ${confidence} (Std. Dev: ${stdDev.toFixed(3)})${outliersExcluded > 0 ? ` | <span class="text-yellow-400">${outliersExcluded} outlier(s) excluded</span>` : ''}</span>
                        </div>
                        <div class="flex flex-col items-end gap-1">
                            <button ${buttonContext} class="apply-recommendation-btn bg-grass-green text-black text-xs font-bold px-3 py-1 rounded-md hover:bg-grass-green/80 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">Apply</button> 
                            <div class="flex gap-1 mt-1">
                                <button ${buttonContext} class="view-shots-btn bg-fairway-blue text-white text-xs font-bold px-2 py-1 rounded-md hover:bg-fairway-blue/80 transition-colors">View Shots</button>
                                <button ${buttonContext} class="view-plot-btn bg-fairway-blue text-white text-xs font-bold px-2 py-1 rounded-md hover:bg-fairway-blue/80 transition-colors">View Rec</button>
                            </div>
                        </div>
                    `;
                    recommendationList.appendChild(li);
                    // Add data attributes to the LI itself for easier access during export
                    li.dataset.clubKey = clubKey;
                    li.dataset.category = category;
                    li.dataset.component = component;

                    recommendationsMade++;
                }
            }
        });
    });

    if (recommendationsMade === 0 && filteredShots.length > 0) {
        const li = document.createElement('li');
        li.className = 'text-gray-500 text-center py-2';
        li.textContent = 'No specific recommendations at this time. Your multipliers look consistent with the data.';
        recommendationList.appendChild(li);
    }

    return analysisResults;
}

/**
 * Renders the analysis results to the dedicated UI card using the new component structure.
 */
function renderAnalysis(results) {
    const exportButton = document.getElementById('exportAnalysisButton');

    // Clear previous results
    analysisResultsList.innerHTML = '';

    // REVISED: Use the greater of carry or aim count for the total.
    const totalShots = results['Total'] ? Math.max(results['Total'].carryCount, results['Total'].aimCount) : 0;
    
    // Iteration order: Categories -> Components -> Total
    const componentKeysToRender = [];
    

    WIND_CATEGORIES_ORDER.forEach(category => {
        if (results[category] && Math.max(results[category].carryCount, results[category].aimCount) > 0) {
             componentKeysToRender.push(category); // Category Total
        }
        ANALYSIS_COMPONENTS_ORDER.forEach(component => {
            const key = `${category}-${component}`;
            if (results[key] && Math.max(results[key].carryCount, results[key].aimCount) > 0) {
                componentKeysToRender.push(key);
            }
        });
    });
    
    if (totalShots > 0) {
        componentKeysToRender.push('Total'); // Grand Total at the end
    }
    
    if (componentKeysToRender.length === 0) {
        const headerItem = document.createElement('li');
        headerItem.className = 'flex justify-between items-center p-2 rounded-lg bg-gray-700/50 font-bold text-xs text-gray-300';
        headerItem.innerHTML = `
            <span class="w-1/4">WIND COMPONENT</span>
            <span class="w-1/4 text-center">AVG CARRY ERR</span>
            <span class="w-1/4 text-center">AVG AIM ERR</span>
            <span class="w-1/4 text-right">COUNT</span>
        `;
        analysisResultsList.appendChild(headerItem);
        const listItem = document.createElement('li');
        listItem.className = 'text-gray-500 text-center py-4 text-xs';
        listItem.textContent = 'No shots recorded for this club with meaningful wind data.';
        if (exportButton) {
            exportButton.disabled = true;
        }
        analysisResultsList.appendChild(listItem);
        return;
    }
    
    const headerItem = document.createElement('li');
    headerItem.className = 'flex justify-between items-center p-2 rounded-lg bg-gray-700/50 font-bold text-xs text-gray-300';
    headerItem.innerHTML = `
        <span class="w-1/4">WIND COMPONENT</span>
        <span class="w-1/4 text-center">AVG CARRY ERR</span>
        <span class="w-1/4 text-center">AVG AIM ERR</span>
        <span class="w-1/4 text-right">COUNT</span>
    `;
    analysisResultsList.appendChild(headerItem);


    componentKeysToRender.forEach(key => {
        const result = results[key];
        
        if (!result) return;
        
        const isMeaningful = Math.max(result.carryCount, result.aimCount) > 0;
        const isCategoryTotalRow = result.isCategoryTotal;
        const isGrandTotalRow = result.isGrandTotal;
        const isComponentRow = !isCategoryTotalRow && !isGrandTotalRow;



        // Error threshold for color highlight
        const errorThreshold = isGrandTotalRow ? 1.0 : isCategoryTotalRow ? 0.8 : 0.5; 

        const carryColor = Math.abs(result.avgCarryError) > errorThreshold ? 'text-red-400' 
                         : 'text-gray-300';
        
        const aimColor = Math.abs(result.avgAimError) > errorThreshold ? 'text-yellow-400' : 'text-gray-300';
        
        // --- REVISED: Logic to show '---' for irrelevant data points ---
        let carryText = '---';
        let aimText = '---';

        if (isMeaningful) {
            // Carry components (Headwind/Tailwind) should only show carry error if data exists.
            if ((result.label === 'Headwind' || result.label === 'Tailwind') && result.carryCount > 0) {
                carryText = formatAdjustment(result.avgCarryError, true, 2);
            } 
            // Aim components (Crosswinds) should only show aim error if data exists.
            else if ((result.label === 'Assist Crosswind' || result.label === 'Opposed Crosswind') && result.aimCount > 0) {
                aimText = formatAdjustment(result.avgAimError, true, 2);
            }
            // Category/Grand totals show both.
            else {
                carryText = result.carryCount > 0 ? formatAdjustment(result.avgCarryError, true, 2) : '---';
                aimText = result.aimCount > 0 ? formatAdjustment(result.avgAimError, true, 2) : '---';
            }
        }

        const listItem = document.createElement('li');
        
        let bgColor = 'bg-gray-800/80 hover:bg-gray-700/80';
        let fontWeight = 'font-semibold';
        let labelClass = 'w-1/4';
        let clickableClass = '';
        let marginTopClass = '';
        
        if (isGrandTotalRow) {
            // Highlight the grand total row
            bgColor = 'bg-grass-green/30 border-t-2 border-grass-green';
            fontWeight = 'font-extrabold text-white';
            labelClass = 'w-1/4';
            marginTopClass = 'mt-3';
        } else if (isCategoryTotalRow) {
            // Highlight category total row
            bgColor = 'bg-gray-700/80 border-b border-gray-500';
            fontWeight = 'font-bold text-white uppercase';
            labelClass = 'w-1/4'; 
            marginTopClass = 'mt-2';
            clickableClass = 'analysis-row-clickable'; 
        } else if (isComponentRow) {
             // Component rows are indented and less prominent
            bgColor = 'bg-gray-800/60';
            fontWeight = 'font-normal';
            labelClass = 'w-1/4 pl-4 text-gray-400';
            clickableClass = 'analysis-row-clickable'; 
        }
        
        listItem.className = `flex justify-between items-center p-2 rounded-lg text-xs ${bgColor} ${fontWeight} ${marginTopClass} ${clickableClass}`;

        // NEW: Add data attributes for filtering
        if (clickableClass) {
            const categoryKey = key.split('-')[0];
            listItem.dataset.category = categoryKey;
            // For category totals, component is null. For component rows, it's the component name.
            listItem.dataset.component = isComponentRow ? result.label : 'null';
        }
        
        // REVISED: Add a descriptive sub-heading for category total rows
        if (isCategoryTotalRow) {
            listItem.innerHTML = `
                <div class="${labelClass}">
                    <span>${result.label}</span>
                    <span class="block text-gray-400 font-normal normal-case text-[10px] -mt-1">(Avg. of all shots)</span>
                </div>
                <span class="w-1/4 text-center text-white">${carryText}</span>
                <span class="w-1/4 text-center text-white">${aimText}</span>
                <span class="w-1/4 text-right">${Math.max(result.carryCount, result.aimCount)}</span>
            `;
        } else {
            listItem.innerHTML = `
                <span class="${labelClass}">${result.label}</span>
                <span class="w-1/4 text-center ${isGrandTotalRow ? 'text-white' : carryColor}">${carryText}</span>
                <span class="w-1/4 text-center ${isGrandTotalRow ? 'text-white' : aimColor}">${aimText}</span>
                <span class="w-1/4 text-right">${Math.max(result.carryCount, result.aimCount)}</span>
            `;
        }
        analysisResultsList.appendChild(listItem);
    });
    
    if (exportButton) {
        exportButton.disabled = false;
    }
}

/**
 * NEW: Renders a scatter plot of shot errors for a given set of shots.
 * @param {Array|Object} plotData - An array of shot objects, or an object with datasets.
 */
const BASE_POINT_RADIUS = 5;
// NEW: Global variable to hold the single selected shot data for the plot
let singleShotPlotData = null;


function renderScatterPlot(plotData) {
    const plotDescription = document.getElementById('scatterPlotDescription');
    const container = document.getElementById('scatterPlotContainer');
    if (!container) return;

    const isSingleDataSet = Array.isArray(plotData);
    // REVISED: If a single shot is selected via its timestamp, find it and use it. Otherwise, use the provided plotData.
    const shots = selectedShotTimestamp
        ? allShotData.filter(shot => shot.timestamp === selectedShotTimestamp)
        : (isSingleDataSet ? plotData : (plotData.datasets[0]?.data || []));

    // Show or hide the plot based on whether there are shots
    container.style.display = shots.length > 0 ? 'block' : 'none';
    if (shots.length === 0) {
        if (shotChart) {
            shotChart.destroy();
            shotChart = null;
            allShotData.forEach(shot => delete shot.isOutlier);
        }
        plotDescription.textContent = 'Shows Carry Error (Y-axis) vs. Aim Error (X-axis)';
        return;
    }

    const ctx = document.getElementById('shotScatterPlot').getContext('2d');
    if (shotChart) {
        shotChart.destroy();
    }

    let datasets; // REVISED: Use let instead of const
    if (isSingleDataSet) {
        // --- NEW: Opacity Blending Approach ---
        // We no longer group points. We map every single shot to a data point.
        const individualShotData = shots.map(shot => ({
            x: shot.actualAimError ?? 0,
            y: shot.actualCarryError ?? 0,
            isOutlier: shot.isOutlier,
            timestamp: shot.timestamp, // NEW: Add timestamp for identification
            weight: getShotWeight(shot) // Keep weight for tooltip
        }));

        datasets = [{
            label: 'Shots',
            data: individualShotData,
            // --- REVISED: Use opacity blending for density visualization ---
            backgroundColor: context => {
                if (context.raw.isOutlier) return 'rgba(239, 68, 68, 0.7)'; // Red for outliers
                return 'rgba(250, 204, 21, 0.25)'; // bunker-yellow at 25% opacity for all normal points
            },
            borderColor: context => {
                if (context.raw.isOutlier) return 'rgba(255, 100, 100, 0.8)';
                return 'rgba(250, 204, 21, 0.5)'; // Faint yellow border
            },
            borderWidth: 1,
            // --- NEW: Use different shapes for outliers vs. normal shots ---
            pointStyle: context => {
                return context.raw.isOutlier ? 'crossRot' : 'circle';
            }, // REVISED: Add a comma here
            radius: context => {
                // NEW: Make the selected shot larger
                if (context.raw.timestamp === selectedShotTimestamp) {
                    return 10;
                }
                return context.raw.isOutlier ? 6 : 5; // Make outliers slightly larger
            },
            hoverRadius: context => {
                // NEW: Make the selected shot larger on hover
                if (context.raw.timestamp === selectedShotTimestamp) {
                    return 12;
                }
                return context.raw.isOutlier ? 8 : 7;
            },
        }];
    } else {
        // This is the comparison view (current vs recommended)
        // We don't apply grouping here to keep the before/after comparison clear
        datasets = plotData.datasets;
    }

    // Determine max absolute value for symmetrical axes
    const maxError = datasets.reduce((max, dataset) => {
        const datasetMax = dataset.data.reduce((dMax, p) => Math.max(dMax, Math.abs(p.x), Math.abs(p.y)), 0);
        return Math.max(max, datasetMax);
    }, 5); // Start with a minimum of 5
    const axisLimit = Math.ceil(maxError / 5) * 5; // Round up to the nearest 5

    shotChart = new Chart(ctx, {
        plugins: [ChartDataLabels, {
            id: 'targetReticule',
            beforeDatasetsDraw: (chart) => {
                const { ctx, scales: { x, y } } = chart;
                const x0 = x.getPixelForValue(0);
                const y0 = y.getPixelForValue(0);

                // --- NEW: Draw Archery Target Rings ---
                const radius1yd = Math.abs(x.getPixelForValue(1) - x0);
                const radius3yd = Math.abs(x.getPixelForValue(3) - x0);

                ctx.save();
                // Draw 3-yard circle (blue)
                ctx.beginPath();
                ctx.arc(x0, y0, radius3yd, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'; // fairway-blue at 10% opacity
                ctx.fill();

                // Draw 1-yard circle (green)
                ctx.beginPath();
                ctx.arc(x0, y0, radius1yd, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'rgba(16, 185, 129, 0.15)'; // grass-green at 15% opacity
                ctx.fill();
                ctx.restore();
                // --- END NEW ---


                ctx.save();
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;

                // Draw crosshair lines
                // Vertical line
                ctx.beginPath();
                ctx.moveTo(x0, y.top);
                ctx.lineTo(x0, y.bottom);
                ctx.stroke();

                // Horizontal line
                ctx.beginPath();
                ctx.moveTo(x.left, y0);
                ctx.lineTo(x.right, y0);
                ctx.stroke();

                // Draw the "cup" circle
                ctx.beginPath();
                ctx.arc(x0, y0, 5, 0, 2 * Math.PI, false);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                ctx.fill();
                ctx.restore();
            }
        }],
        type: 'scatter',
        data: {
            datasets: datasets
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                datalabels: {
                    display: false // Disable the numbering system
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            const weightPercent = (point.weight * 100).toFixed(0);
                            let lines = [];

                            // The tooltip now shows info for a single point
                            lines.push(`Aim: ${context.parsed.x.toFixed(1)}yd`);
                            lines.push(`Carry: ${context.parsed.y.toFixed(1)}yd`);
                            lines.push(`Weight: ${weightPercent}%`);

                            return lines;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear', position: 'bottom', min: -axisLimit, max: axisLimit,
                    grid: { color: 'rgba(255, 255, 255, 0.1)', zeroLineColor: 'rgba(255, 255, 255, 0.4)' },
                    ticks: { color: '#9ca3af' } // gray-400
                },
                y: {
                    type: 'linear', min: -axisLimit, max: axisLimit,
                    grid: { color: 'rgba(255, 255, 255, 0.1)', zeroLineColor: 'rgba(255, 255, 255, 0.4)' },
                    ticks: { color: '#9ca3af' } // gray-400
                }
            }
        }
    });
}

/**
 * NEW: Renders a horizontal floating bar chart of club carry ranges.
 * @param {string} [filter='all'] - The category to filter by ('all', 'woods', 'irons', 'wedges').
 */
function renderClubRangeChart(filter = 'all') {
    const canvas = document.getElementById('clubRangeChartCanvas');
    if (!canvas) return;

    // Destroy any existing chart on the canvas to prevent memory leaks
    if (clubRangeChart) {
        clubRangeChart.destroy();
    }
    
    // --- NEW: Filter clubs based on the selected category ---
    let clubKeys = Object.keys(clubBaseRanges);
    if (filter === 'active') { // NEW: Filter for active clubs
        clubKeys = clubKeys.filter(clubKey => activeClubs.has(clubKey));
    }
    else if (filter === 'long-game') { // NEW: Special case for the new filter
        const longGameOrders = { min: 3, max: 10 }; // 5W is order 3, 5i is order 10
        clubKeys = clubKeys.filter(clubKey => {
            const order = clubBaseRanges[clubKey].order;
            return order >= longGameOrders.min && order <= longGameOrders.max;
        });
    }
    else if (filter !== 'all') {
        clubKeys = clubKeys.filter(clubKey => CLUB_CATEGORIES[clubKey] === filter);
    }
    if (clubKeys.length === 0) {
        // Optionally, display a message on the canvas if no clubs match the filter
        return;
    }
    // --- END NEW ---
    const sortedClubs = clubKeys.sort((a, b) => clubBaseRanges[a].order - clubBaseRanges[b].order);

    // 2. Format Data for Chart.js
    const chartData = sortedClubs.map(clubKey => [clubBaseRanges[clubKey].min, clubBaseRanges[clubKey].max]);
    const chartLabels = sortedClubs;
    
    // --- NEW: True Gapping Calculation ---
    // This algorithm correctly finds gaps between ALL clubs, not just adjacent ones.
    const gapData = [];
    const gapLabels = [];
    const overlapData = []; // NEW: Array for overlap data
    const overlapLabels = []; // NEW: Array for overlap labels

    // 1. Get all ranges and sort them by their start value.
    const allRanges = sortedClubs.map(clubKey => [clubBaseRanges[clubKey].min, clubBaseRanges[clubKey].max]).sort((a, b) => a[0] - b[0]);

    if (allRanges.length > 1) {
        // 2. Merge overlapping ranges into "coverage zones".
        const mergedRanges = allRanges.reduce((acc, currentRange) => {
            // --- NEW: Find overlaps before merging ---
            if (acc.length > 0) {
                const lastRange = acc[acc.length - 1];
                // Check if the current range starts before the last one ends.
                if (currentRange[0] < lastRange[1]) {
                    const overlapStart = currentRange[0];
                    const overlapEnd = Math.min(lastRange[1], currentRange[1]);
                    // Add 1 to count the number of discrete yardages in the overlap (fencepost problem)
                    const overlapAmount = (overlapEnd - overlapStart) + 1;

                    if (overlapAmount > 0) {
                        // REVISED: Find the index of the HIGHER club in the chart (the one with the smaller order number)
                        // to draw the overlap bar on its row. This is more intuitive.
                        const clubKeyForOverlap = sortedClubs.find(key => clubBaseRanges[key].min === currentRange[0] && clubBaseRanges[key].max === currentRange[1]);
                        const clubIndex = sortedClubs.indexOf(clubKeyForOverlap);
                        if (clubIndex !== -1) {
                            overlapData[clubIndex] = [overlapStart, overlapEnd];
                            overlapLabels[clubIndex] = `${overlapAmount}y`;
                        }
                    }
                }
            }
            // --- END NEW ---
            if (acc.length === 0) {
                return [currentRange];
            }
            const lastRange = acc[acc.length - 1];
            // If the current range overlaps or touches the last one, merge them.
            if (currentRange[0] <= lastRange[1]) {
                lastRange[1] = Math.max(lastRange[1], currentRange[1]);
            } else {
                // Otherwise, it's a new, separate coverage zone.
                acc.push(currentRange);
            }
            return acc;
        }, []);

        // 3. Find the gaps between the merged coverage zones.
        for (let i = 0; i < mergedRanges.length - 1; i++) {
            const endOfCurrent = mergedRanges[i][1];
            const startOfNext = mergedRanges[i + 1][0];
            const gapSize = startOfNext - endOfCurrent; // e.g., 229 - 228 = 1 (no gap); 230 - 228 = 2 (1yd gap)

            // REVISED: A true gap only exists if the difference is greater than 1. A difference of 1 is a perfect match.
            if (gapSize > 1) {
                // FINAL CORRECTED LOGIC: We found a true gap. The gap appears *before* the next club's range.
                // Per user feedback, the red gap bar should be drawn on the row of the club that comes AFTER the gap.
                // Find the club whose min range matches the start of the next coverage zone.
                const clubKeyForGap = sortedClubs.find(key => clubBaseRanges[key].min === startOfNext);
                const clubIndex = sortedClubs.indexOf(clubKeyForGap);
                if (clubIndex !== -1) {
                    // Initialize array with nulls if needed
                    while (gapData.length <= clubIndex) {
                        gapData.push([null, null]);
                        gapLabels.push('');
                    }
                    gapData[clubIndex] = [endOfCurrent, startOfNext];
                    const uncoveredYardages = gapSize - 1; // The number of integers in the gap
                    gapLabels[clubIndex] = `${uncoveredYardages}y`;
                }
            }
        }
    }
    // 3. Create the Chart
    clubRangeChart = new Chart(canvas, {
        type: 'bar',
        plugins: [ChartDataLabels],
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: 'Carry Range',
                    data: chartData,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)', // fairway-blue with opacity
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    borderSkipped: false, // Render border on all sides
                },
                // NEW: Second dataset for gaps and overlaps
                {
                    label: 'Gap',
                    data: gapData,
                    backgroundColor: 'rgba(239, 68, 68, 0.6)', // Red for all gaps
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1,
                    borderSkipped: false,
                },
                // NEW: Third dataset for overlaps, now just 'Overlap'
                {
                    label: 'Overlaps',
                    data: overlapData,
                    backgroundColor: 'rgba(245, 158, 11, 0.6)', // Amber/Yellow
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 1,
                    borderSkipped: false,
                }
            ]
        },
        options: {
            indexAxis: 'y', // This makes the bar chart horizontal
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    min: 75,
                    max: 325,
                    title: {
                        display: true,
                        text: 'Carry Distance (Yards)',
                        color: '#9ca3af'
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#d1d5db' }
                },
                // NEW: Stack the datasets on the same y-axis category
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#d1d5db' }
                }
            },
            plugins: {
                // REVISED: Enable the legend to explain the colors
                legend: { 
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#d1d5db' // gray-300
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const range = context.raw;
                            return ` ${context.label}: ${range[0]} - ${range[1]} yds (Gap: ${range[1] - range[0]} yds)`;
                        }
                    }
                },
                datalabels: {
                    // Configuration for the main club range labels
                    color: '#d1d5db',
                    font: { weight: 'bold' },
                    formatter: (value, context) => {
                        // Only show labels for the first dataset (Carry Range)
                        if (context.datasetIndex === 0) {
                            return `${value[0]}-${value[1]}`;
                        }
                        // For the second dataset (Gaps), use the pre-calculated labels
                        if (context.datasetIndex === 1) {
                            return gapLabels[context.dataIndex] || '';
                        }
                        // NEW: For the third dataset (Overlaps)
                        if (context.datasetIndex === 2) {
                            return overlapLabels[context.dataIndex] || '';
                        }
                        return '';
                    },
                    // Positioning for the main labels
                    anchor: 'end',
                    align: 'right',
                    offset: 8,
                }
            }
        }
    });
}
/**
 * Main function to trigger data analysis.
 */
function analyzeData() {
    // NEW: If a table row filter is active, we don't want to override it with the "Since Update" filter.
    if (activePlotFilter) {
        applyTableRowFilter(activePlotFilter.category, activePlotFilter.component);
        return;
    }
    const filterButton = document.getElementById('plotFilterToggleButton');
    const filterStatusDisplay = document.getElementById('filterStatusDisplay');
    const allClubShots = allShotData.filter(shot => shot.clubKey === activeAnalysisClubKey);

    // --- NEW: Logic to determine if the "Since Update" filter is possible ---
    const lastUpdateTimestamp = recommendationCooldowns[activeAnalysisClubKey] || 0;
    const hasShotsSinceUpdate = lastUpdateTimestamp > 0 && allClubShots.some(shot => shot.numericTimestamp && shot.numericTimestamp > lastUpdateTimestamp);

    // Hide the filter button entirely if a "since update" filter is not possible.
    if (filterButton) {
        filterButton.style.display = hasShotsSinceUpdate ? 'block' : 'none';
    }
    // --- END NEW ---

    // --- REWRITTEN: Filter data source FIRST ---
    let shotsToAnalyze = allClubShots; // Default to all shots for the club

    // If the filter is active, apply it.
    if (isPlotFiltered) {
        if (lastUpdateTimestamp > 0) {
            const filteredShots = allClubShots.filter(shot => shot.numericTimestamp && shot.numericTimestamp > lastUpdateTimestamp);
            
            // If filtering results in no shots, revert to showing all shots to avoid confusion.
            if (filteredShots.length === 0) {
                isPlotFiltered = false; // Revert state
                shotsToAnalyze = allClubShots;
                alert(`No shots found for ${activeAnalysisClubKey} since the last multiplier update. Showing all shots.`);
            } else {
                shotsToAnalyze = filteredShots;
            }
        } else {
            // No update timestamp exists, so filtering is not possible. Revert state.
            isPlotFiltered = false;
        }
    }

    // Update the button text based on the final state
    if (filterButton) {
        filterButton.textContent = isPlotFiltered ? 'View All' : 'Since Update';
    }

    // NEW: Update the status display for clarity
    if (filterStatusDisplay) {
        if (isPlotFiltered) {
            filterStatusDisplay.textContent = 'Viewing: Since Update';
            filterStatusDisplay.className = 'font-semibold text-bunker-yellow';
        } else {
            filterStatusDisplay.textContent = 'Viewing: All';
            filterStatusDisplay.className = 'font-semibold text-gray-400';
        }
    }

    // Now, process and render using the correctly filtered data source
    const results = processShotData(shotsToAnalyze, activeAnalysisClubKey);
    renderAnalysis(results);
    renderScatterPlot(shotsToAnalyze);
}
/**
 * Renders the shot history list.
 * @param {Array<Object>} historyData - The array of shot objects to display.
 */
function renderShotHistory(historyData) {
    // Helper function to determine wind component text
    const getWindComponentText = (shot) => {
        const components = [];
        // Determine Headwind/Tailwind
        if (shot.headwindComponentSpeed > 0.5) {
            components.push('Headwind');
        } else if (shot.tailwindComponentSpeed > 0.5) {
            components.push('Tailwind');
        }

        // Determine Crosswind using the shot's bias
        const isLeftAdj = shot.calculatedAimAdj > 0.5;
        const isRightAdj = shot.calculatedAimAdj < -0.5;
        const isAssist = (shot.shotBias === 'fade' && isLeftAdj) || (shot.shotBias === 'draw' && isRightAdj);
        const isOpposed = (shot.shotBias === 'fade' && isRightAdj) || (shot.shotBias === 'draw' && isLeftAdj);

        if (isAssist) components.push('Assist');
        if (isOpposed) components.push('Opposed');

        return components.length > 0 ? ` - ${components.join(' ')}` : '';
    };

    // NEW: Update total shots tally
    const totalShotsTally = document.getElementById('totalShotsTally');
    if (totalShotsTally) {
        totalShotsTally.textContent = allShotData.length;
    }

    if (historyData.length === 0) {
        shotHistoryList.innerHTML = '<li class="text-gray-500 text-center py-4">No shots recorded yet.</li>';
        return;
    }

    shotHistoryList.innerHTML = ''; 
    
    historyData.forEach((shot) => {
        // Use simple string conversion for local storage timestamp
        let timestamp = 'N/A';
        try {
            timestamp = new Date(shot.timestamp).toLocaleTimeString();
        } catch (e) {
            timestamp = 'N/A';
        }
        
        // REVISED: Use nullish coalescing to handle nulls gracefully.
        const carryErrAbs = Math.abs(shot.actualCarryError ?? 0);
        const aimErrAbs = Math.abs(shot.actualAimError ?? 0);
        
        // REVISED: Determine border color based on the WORST of the two errors.
        let borderColor;
        if (shot.actualCarryError === null && shot.actualAimError === null) {
            borderColor = 'border-gray-500'; // No error data
        } else if (carryErrAbs > 2 || aimErrAbs > 2) {
            borderColor = 'border-red-500'; // Red if either error is large
        } else if (carryErrAbs > 0.5 || aimErrAbs > 0.5) {
            borderColor = 'border-yellow-500'; // Yellow if either error is medium
        } else {
            borderColor = 'border-grass-green'; // Green only if both are small
        }

        // REVISED: Both error numbers now get dynamic color classes.
        const carryErrorColor = shot.actualCarryError === null ? 'text-gray-400' : carryErrAbs > 2 ? 'text-red-500' : carryErrAbs > 0.5 ? 'text-yellow-500' : 'text-grass-green';
        const aimColor = shot.actualAimError === null ? 'text-gray-400' : aimErrAbs > 2 ? 'text-red-500' : aimErrAbs > 0.5 ? 'text-yellow-500' : 'text-grass-green';

        const carryAdjSign = shot.calculatedCarryAdj > 0 ? '+' : '';
        const aimAdjDir = shot.calculatedAimAdj > 0 ? 'L' : shot.calculatedAimAdj < 0 ? 'R' : 'N';
        const aimAdjValue = Math.abs(shot.calculatedAimAdj).toFixed(1);

        const carryErrorText = shot.actualCarryError === null ? '---' : `${shot.actualCarryError > 0 ? '+' : ''}${shot.actualCarryError.toFixed(1)}`;
        const aimErrorText = shot.actualAimError === null ? '---' : `${shot.actualAimError > 0 ? '+' : ''}${shot.actualAimError.toFixed(1)}`;

        // NEW: Get the wind component text
        const windComponentText = getWindComponentText(shot);

        const listItem = document.createElement('li');
        listItem.className = `shot-item p-3 rounded-lg border-2 border-gray-700 ${borderColor} transition-all duration-300 hover:bg-gray-800 relative cursor-pointer`;
        listItem.innerHTML = `
            <div class="flex justify-between items-center text-xs pr-4">
                <span class="font-bold text-white text-sm">${shot.clubKey} (${WIND_CATEGORIES_MAP[shot.windCategory].label} @ ${shot.windAngle}°${windComponentText})</span>
                <span class="text-gray-400">${timestamp}</span>
            </div>
            <!-- NEW: Redesigned grid layout for Carry/Aim vs Adj/Err -->
            <div class="mt-2 text-xs space-y-1">
                <!-- Carry Row -->
                <div class="grid grid-cols-[auto_1fr_1fr] items-center gap-x-2">
                    <span class="font-bold text-gray-300 w-10">CARRY</span>
                    <div class="bg-gray-800 rounded px-2 py-1 text-center">
                        <span class="text-gray-400">Adj: </span><span class="font-semibold text-grass-green">${carryAdjSign}${shot.calculatedCarryAdj.toFixed(1)} yds</span>
                    </div>
                    <div class="bg-gray-800 rounded px-2 py-1 text-center">
                        <span class="text-gray-400">Err: </span><span class="font-semibold ${carryErrorColor}">${carryErrorText} yds</span>
                    </div>
                </div>
                <!-- Aim Row -->
                <div class="grid grid-cols-[auto_1fr_1fr] items-center gap-x-2">
                    <span class="font-bold text-gray-300 w-10">AIM</span>
                    <div class="bg-gray-800 rounded px-2 py-1 text-center">
                        <span class="text-gray-400">Adj: </span><span class="font-semibold text-fairway-blue">${aimAdjDir}${aimAdjValue} yds</span>
                    </div>
                    <div class="bg-gray-800 rounded px-2 py-1 text-center">
                        <span class="text-gray-400">Err: </span><span class="font-semibold ${aimColor}">${aimErrorText} yds</span>
                    </div>
                </div>
            </div>
            <button class="delete-shot-btn absolute top-1 right-1 text-gray-500 hover:text-red-400 font-bold text-lg leading-none p-1 z-10" data-timestamp="${shot.timestamp}">&times;</button>
        `;
        // NEW: Add data-timestamp to the list item itself for the main click handler
        listItem.dataset.timestamp = shot.timestamp;
        shotHistoryList.appendChild(listItem);
    });
}

/**
 * NEW HELPER FUNCTION: Gets all shots that match a specific club, wind category, and component.
 * This is used to establish the shot count when a recommendation is applied.
 * @param {Array} sourceShots - The array of shots to filter from (e.g., allShotData or a pre-filtered subset).
 */
function getShotsForComponent(sourceShots, clubKey, category, component) {
    return sourceShots.filter(shot => {
        if (shot.clubKey !== clubKey || shot.windCategory !== category) {
            return false;
        }

        // --- REVISED: Use bias-aware logic to correctly categorize shots ---
        const isLeftAdj = shot.calculatedAimAdj > EPSILON;
        const isRightAdj = shot.calculatedAimAdj < -EPSILON;

        const isAssistSituation = (shot.shotBias === 'fade' && isLeftAdj) || (shot.shotBias === 'draw' && isRightAdj);
        const isOpposedSituation = (shot.shotBias === 'fade' && isRightAdj) || (shot.shotBias === 'draw' && isLeftAdj);

        switch (component) {
            case 'Headwind':
                return shot.calculatedCarryAdj > EPSILON && shot.headwindComponentSpeed > EPSILON;
            case 'Tailwind':
                return shot.calculatedCarryAdj < -EPSILON && shot.tailwindComponentSpeed > EPSILON;
            case 'Assist Crosswind':
                return isAssistSituation && Math.abs(shot.calculatedAimAdj) > EPSILON;
            case 'Opposed Crosswind':
                return isOpposedSituation && Math.abs(shot.calculatedAimAdj) > EPSILON;
            default:
                return false;
        }
        // --- END REVISION ---
    });
}

/**
 * NEW HELPER: Calculates the ideal multiplier for a single shot and component.
 * This centralizes the calculation logic used in both processing and flagging.
 */
function calculateIdealMultiplierForShot(shot, component) {
    // NEW: If the required error value was not included (is null), this shot cannot be used for this calculation.
    switch (component) {
        case 'Headwind':
            if (shot.actualCarryError === null) return null;
            if (shot.headwindComponentSpeed > MIN_WIND_FOR_RECOMMENDATION_CALC) {
                return shot.multipliersUsed.hw - (shot.actualCarryError / shot.headwindComponentSpeed);
            }
            break;
        case 'Tailwind':
            if (shot.actualCarryError === null) return null;
            if (shot.tailwindComponentSpeed > MIN_WIND_FOR_RECOMMENDATION_CALC) {
                return shot.multipliersUsed.tw + (shot.actualCarryError / shot.tailwindComponentSpeed);
            }
            break;
        case 'Assist Crosswind':
            // FIX: Ensure we use calculatedAimAdj and prevent division by zero.
            if (shot.actualAimError === null || Math.abs(shot.calculatedAimAdj) < MIN_WIND_FOR_RECOMMENDATION_CALC) return null;
            return shot.multipliersUsed.acw + (shot.actualAimError / shot.calculatedAimAdj);
        case 'Opposed Crosswind':
            // FIX: Ensure we use calculatedAimAdj and prevent division by zero.
            if (shot.actualAimError === null || Math.abs(shot.calculatedAimAdj) < MIN_WIND_FOR_RECOMMENDATION_CALC) return null;
            return shot.multipliersUsed.ocw + (shot.actualAimError / shot.calculatedAimAdj);
    }
    return null; // Return null if not applicable
}

/**
 * NEW: Filters shots based on a category and component from the analysis table and updates the plot.
 */
function applyTableRowFilter(category, component) {
    // Clear any existing active filter highlight
    document.querySelectorAll('.analysis-row-clickable.active-filter').forEach(row => {
        row.classList.remove('active-filter');
    });

    // Find the clicked row and highlight it
    const clickedRow = document.querySelector(`.analysis-row-clickable[data-category="${category}"][data-component="${component}"]`);
    if (clickedRow) {
        clickedRow.classList.add('active-filter');
    }

    // Get the base shots (respecting the "Since Update" filter if active)
    let sourceShots = allShotData.filter(shot => shot.clubKey === activeAnalysisClubKey);
    if (isPlotFiltered) {
        const lastUpdateTimestamp = recommendationCooldowns[activeAnalysisClubKey] || 0;
        if (lastUpdateTimestamp > 0) {
            sourceShots = sourceShots.filter(shot => shot.numericTimestamp && shot.numericTimestamp > lastUpdateTimestamp);
        }
    }

    let shotsToPlot;
    let filterDescription;

    if (component && component !== 'null') {
        // This is a specific component row (e.g., "Headwind")
        shotsToPlot = getShotsForComponent(sourceShots, activeAnalysisClubKey, category, component);
        filterDescription = `${WIND_CATEGORIES_MAP[category].label} - ${component}`;
    } else {
        // This is a category total row (e.g., "High Wind Total")
        shotsToPlot = sourceShots.filter(shot => shot.windCategory === category);
        filterDescription = `${WIND_CATEGORIES_MAP[category].label} (All)`;
    }

    // Update the plot and its description
    renderScatterPlot(shotsToPlot);
    const plotDescription = document.getElementById('scatterPlotDescription');
    if (plotDescription) {
        plotDescription.innerHTML = `Filtering by: <span class="font-bold text-fairway-blue">${filterDescription}</span> (${shotsToPlot.length} shots)`;
    }

    // Update the main filter button to act as a "Clear" button
    const filterButton = document.getElementById('plotFilterToggleButton');
    if (filterButton) {
        filterButton.textContent = 'Clear Filter';
        filterButton.style.display = 'block'; // Ensure it's visible
    }
}

/**
 * NEW: Saves the cup suggestion settings from the modal to localStorage.
 */
function saveCupSuggestionSettings() {
    const parsedConfidence = parseFloat(document.getElementById('cupSuggestionConfidenceThresholdInput').value);
    const parsedLeeway = parseFloat(document.getElementById('cupSuggestionLeewayFactorInput').value);
    const parsedThreshold = parseFloat(document.getElementById('cupSuggestionArrowThresholdInput').value);

    // REVISED: Use isNaN check to correctly handle '0' as a valid input, which is falsy in JS.
    // The previous `||` logic incorrectly fell back to the default when the user entered 0.
    cupSuggestionSettings.confidenceThreshold = !isNaN(parsedConfidence) ? parsedConfidence : defaultCupSuggestionSettings.confidenceThreshold;
    cupSuggestionSettings.leewayFactor = !isNaN(parsedLeeway) ? parsedLeeway : defaultCupSuggestionSettings.leewayFactor;
    cupSuggestionSettings.arrowThreshold = !isNaN(parsedThreshold) ? parsedThreshold : defaultCupSuggestionSettings.arrowThreshold;

    try {
        localStorage.setItem(CUP_SUGGESTION_SETTINGS_KEY, JSON.stringify(cupSuggestionSettings));
    } catch (error) {
        console.error("Error saving cup suggestion settings:", error);
    }
}

/**
 * NEW: Loads the cup suggestion settings from localStorage and populates the modal inputs.
 */
function loadCupSuggestionSettings() {
    try {
        const storedSettings = localStorage.getItem(CUP_SUGGESTION_SETTINGS_KEY);
        if (storedSettings) {
            const parsed = JSON.parse(storedSettings);
            // Merge with defaults to ensure all properties are present
            cupSuggestionSettings = { ...defaultCupSuggestionSettings, ...parsed };
        } else {
            cupSuggestionSettings = { ...Config.defaultCupSuggestionSettings };
        }
    } catch (error) {
        console.error("Error loading cup suggestion settings, using defaults.", error);
        cupSuggestionSettings = { ...Config.defaultCupSuggestionSettings };
    }
    // Populate the UI
    document.getElementById('cupSuggestionConfidenceThresholdInput').value = cupSuggestionSettings.confidenceThreshold;
    document.getElementById('cupSuggestionLeewayFactorInput').value = cupSuggestionSettings.leewayFactor.toFixed(2);
    document.getElementById('cupSuggestionArrowThresholdInput').value = cupSuggestionSettings.arrowThreshold.toFixed(2);
}

// --- REVISED: Centralize tab content population logic ---
function populateTabContent(targetPanelId) {
    if (targetPanelId === 'panel-multiplier-history') {
        showMultiplierHistory(activeAnalysisClubKey);
    } else if (targetPanelId === 'panel-performance-trends') {
        const isFirstPopulation = (performanceChartClubSelect.options.length === 0);
        populatePerformanceChartClubSelect();
        } else if (targetPanelId === 'panel-multiplier-status') {
            renderMultiplierStatus();
        if (isFirstPopulation) {
            performanceChartClubSelect.value = activeAnalysisClubKey;
        }
        renderPerformanceTrendChart();
    }
}

const mainHistoryTabs = document.querySelectorAll('.main-history-tab-button');
const mainHistoryPanels = document.querySelectorAll('.main-history-tab-panel');

mainHistoryTabs.forEach(tab => {
    tab.addEventListener('click', (event) => { // Pass event object
        const targetPanelId = tab.dataset.target;

        mainHistoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        mainHistoryPanels.forEach(p => p.classList.add('hidden'));
        document.getElementById(targetPanelId).classList.remove('hidden');

        // Populate content when a user clicks a tab.
        populateTabContent(targetPanelId);
    });
});


/**
 * NEW: Renders and displays the multiplier history modal for the active club.
 */
function showMultiplierHistory() {
    // REVISED: Target the specific containers within the 'Multiplier History' tab panel.
    const tabContainer = document.getElementById('historyTabContainer');
    const panelContainer = document.getElementById('historyPanelContainer');
    const exportButton = document.getElementById('exportHistoryButton');
    const modalTitle = document.getElementById('historyModalTitle');

    const clubHistory = multiplierHistory[activeAnalysisClubKey] || []; // This remains correct.

    modalTitle.textContent = `Multiplier History for ${activeAnalysisClubKey}`;
    
    // Show/hide export button based on history existence
    exportButton.classList.toggle('hidden', clubHistory.length === 0);

    // REVISED: Clear only the specific history containers, not the whole modal structure.
    tabContainer.innerHTML = '';
    panelContainer.innerHTML = '';

    if (clubHistory.length === 0) {
        panelContainer.innerHTML = '<p class="text-gray-400 text-center py-8">No multiplier changes have been applied for this club yet.</p>';
        return;
    }

    // Group history by wind category first
    const historyByWindCategory = clubHistory.reduce((acc, entry) => {
        if (!acc[entry.category]) {
            acc[entry.category] = [];
        }
        acc[entry.category].push(entry);
        return acc;
    }, {});

    // This will hold the active chart instances for the currently visible tab
    let activeChartInstances = [];

    let isFirstTab = true;
    WIND_CATEGORIES_ORDER.forEach(categoryKey => {
        if (historyByWindCategory[categoryKey]) {
            const categoryLabel = WIND_CATEGORIES_MAP[categoryKey].label.replace(/ \(.+\)/, '');

            // Create Tab Button
            const tabButton = document.createElement('button');
            tabButton.className = `history-tab-button px-4 py-2 text-sm font-medium text-gray-400 hover:text-bunker-yellow`;
            tabButton.textContent = categoryLabel;
            tabButton.dataset.target = `history-panel-${categoryKey}`;
            tabContainer.appendChild(tabButton); // REVISED: Append to the correct container

            // Create Tab Panel
            const tabPanel = document.createElement('div');
            tabPanel.id = `history-panel-${categoryKey}`;
            tabPanel.className = 'hidden';
            panelContainer.appendChild(tabPanel); // REVISED: Append to the correct container

            // Group changes within this category by component
            const groupedByComponent = historyByWindCategory[categoryKey].reduce((acc, entry) => {
                if (!acc[entry.component]) acc[entry.component] = [];
                acc[entry.component].push(entry);
                return acc;
            }, {});

            // Render content into the panel
            for (const componentName in groupedByComponent) {
                const entries = groupedByComponent[componentName].sort((a, b) => b.timestamp - a.timestamp); // Newest first for list
                const groupContainer = document.createElement('div');
                groupContainer.className = 'mb-4';
                groupContainer.innerHTML = `<h4 class="text-base font-bold text-bunker-yellow border-b border-gray-600 pb-1 mb-2">${componentName}</h4>`;
                
                // NEW: Add a placeholder for the chart canvas
                if (entries.length > 1) {
                    const chartPlaceholder = document.createElement('div');
                    chartPlaceholder.className = 'history-chart-placeholder mb-2';
                    groupContainer.appendChild(chartPlaceholder);
                }

                const list = document.createElement('ul');
                list.className = 'space-y-2 text-xs';
                entries.forEach(entry => {
                    const changeArrow = entry.newValue > entry.oldValue ? '↑' : '↓';
                    const date = new Date(entry.timestamp).toLocaleString();
                    list.innerHTML += `<li class="p-2 bg-gray-800 rounded-md">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-white">${entry.oldValue.toFixed(2)} → ${entry.newValue.toFixed(2)} <span class="text-lg">${changeArrow}</span></span>
                            <span class="text-gray-400">${date}</span>
                        </div>
                        <div class="text-gray-500 mt-1">Based on ${entry.shotCount} shots (Confidence: ${entry.confidence})</div>
                    </li>`;
                });
                groupContainer.appendChild(list);
                tabPanel.appendChild(groupContainer);
            }
        }
    });

    /**
     * REFACTORED: Renders charts for a specific, visible panel.
     * @param {HTMLElement} panel - The panel element to render charts in.
     */
    function renderChartsForPanel(panel, panelData) {
        // Destroy any previous charts
        activeChartInstances.forEach(chart => chart.destroy());
        activeChartInstances = [];

        const placeholders = panel.querySelectorAll('.history-chart-placeholder');
        placeholders.forEach(placeholder => {
            // Find the component name from the sibling h4 element
            const componentName = placeholder.previousElementSibling.textContent;

            // Find the corresponding entries from the data passed to this function
            const entries = (panelData[componentName] || []).sort((a, b) => a.timestamp - b.timestamp); // Sort chronologically for the chart

            // A chart is meaningful if there's at least one change.
            if (entries.length > 0) {
                placeholder.innerHTML = `
                    <div class="w-full h-24 bg-gray-900/50 rounded-md p-1 relative">
                        <canvas></canvas>
                    </div>
                `;
                const canvas = placeholder.querySelector('canvas');
                const ctx = canvas.getContext('2d');

                // --- REVISED: Prepend the original value to the chart data ---
                const chartData = [entries[0].oldValue, ...entries.map(entry => entry.newValue)];
                const chartLabels = ["Start", ...entries.map(entry => new Date(entry.timestamp).toLocaleDateString())];

                const chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            data: chartData,
                            borderColor: '#facc15', // bunker-yellow
                            backgroundColor: 'rgba(250, 204, 21, 0.2)',
                            borderWidth: 2,
                            pointRadius: 3,
                            tension: 0.1,
                            fill: true
                        }]
                    },
                    options: getMiniChartOptions()
                });
                activeChartInstances.push(chart);
            }
        });
    }

    // Add event listener for tab switching
    tabContainer.addEventListener('click', (e) => { // REVISED: Attach listener to the correct container
        if (e.target.matches('.history-tab-button')) {
            const targetPanelId = e.target.dataset.target;
            const targetPanel = document.getElementById(targetPanelId);
            const categoryKey = targetPanelId.replace('history-panel-', '');

            // Deactivate all tabs and panels
            tabContainer.querySelectorAll('.history-tab-button').forEach(btn => btn.classList.remove('active'));
            panelContainer.querySelectorAll('div[id^="history-panel-"]').forEach(panel => panel.classList.add('hidden'));

            // Activate the clicked tab and its corresponding panel
            e.target.classList.add('active');
            targetPanel.classList.remove('hidden');

            // REVISED: Group the data for the target panel and pass it to the render function.
            const panelData = (historyByWindCategory[categoryKey] || []).reduce((acc, entry) => {
                if (!acc[entry.component]) acc[entry.component] = [];
                acc[entry.component].push(entry);
                return acc;
            }, {});

            // Render charts for the newly activated panel
            renderChartsForPanel(targetPanel, panelData);
        }
    });

    // Manually click the first tab to activate it and render its charts
    const firstTabButton = tabContainer.querySelector('.history-tab-button');
    if (firstTabButton) {
        firstTabButton.click();
    }
}

// --- NEW: PERFORMANCE TREND CHART FUNCTIONS ---

/**
 * Populates the club selection dropdown for the performance trend chart.
 */
function populatePerformanceChartClubSelect() {
    // Prevent re-populating if already done
    if (performanceChartClubSelect.options.length > 0) return;

    // Add the global option first
    const globalOption = document.createElement('option');
    globalOption.value = 'Global';
    globalOption.textContent = 'Global (All Clubs)';
    performanceChartClubSelect.appendChild(globalOption);

    // Get club keys and sort them by their defined order
    const sortedClubKeys = Object.keys(clubPresets).sort((a, b) => defaultClubBaseRanges[a].order - defaultClubBaseRanges[b].order);

    // Add each club as an option
    sortedClubKeys.forEach(clubKey => {
        const option = document.createElement('option');
        option.value = clubKey;
        option.textContent = clubKey;
        performanceChartClubSelect.appendChild(option);
    });
}

/**
 * Processes shot and history data to prepare it for the performance trend chart.
 * @param {string} clubKey - The club to analyze, or 'Global' for all clubs.
 * @returns {object} - An object containing labels, datasets, and update markers.
 */
function getPerformanceTrendData(clubKey) {
    const relevantShots = (clubKey === 'Global')
        ? allShotData
        : allShotData.filter(shot => shot.clubKey === clubKey);

    const relevantHistory = (clubKey === 'Global')
        ? Object.values(multiplierHistory).flat()
        : multiplierHistory[clubKey] || [];

    // Group shots by day (YYYY-MM-DD format)
    const shotsByDay = relevantShots.reduce((acc, shot) => {
        const day = shot.timestamp.split('T')[0];
        if (!acc[day]) {
            acc[day] = [];
        }
        acc[day].push(shot);
        return acc;
    }, {});

    const dataPoints = [];
    for (const day in shotsByDay) {
        const dayShots = shotsByDay[day];
        const totalShots = dayShots.length;
        if (totalShots === 0) continue;

        const carryErrors = dayShots.map(s => Math.abs(s.actualCarryError)).filter(e => e !== null);
        const aimErrors = dayShots.map(s => Math.abs(s.actualAimError)).filter(e => e !== null);
        const combinedErrors = dayShots.map(s => Math.sqrt(Math.pow(s.actualCarryError ?? 0, 2) + Math.pow(s.actualAimError ?? 0, 2)));

        dataPoints.push({
            day: day,
            avgCarryError: carryErrors.length > 0 ? carryErrors.reduce((a, b) => a + b, 0) / carryErrors.length : 0,
            avgAimError: aimErrors.length > 0 ? aimErrors.reduce((a, b) => a + b, 0) / aimErrors.length : 0,
            avgCombinedError: combinedErrors.length > 0 ? combinedErrors.reduce((a, b) => a + b, 0) / combinedErrors.length : 0,
            shotCount: totalShots
        });
    }

    // Sort data points chronologically
    dataPoints.sort((a, b) => new Date(a.day) - new Date(b.day));

    // --- REVISED LOGIC FOR "CAUSE AND EFFECT" ---
    // The star should mark the FIRST session played AFTER a multiplier change.
    const updateDayIndices = new Set();
    if (relevantHistory.length > 0) {
        // Get all unique multiplier update timestamps, sorted newest to oldest
        const updateTimestamps = [...new Set(relevantHistory.map(entry => entry.timestamp))].sort((a, b) => b - a);

        // For each update, find the first data point (session) that occurred after it.
        updateTimestamps.forEach(ts => {
            const firstDataPointAfterUpdate = dataPoints.find(p => new Date(p.day).getTime() > ts);

            if (firstDataPointAfterUpdate) {
                const index = dataPoints.findIndex(p => p.day === firstDataPointAfterUpdate.day);
                if (index !== -1) {
                    updateDayIndices.add(index);
                }
            }
        });
    }

    return {
        labels: dataPoints.map((p, i) => `${i + 1}`), // Use just the session number for a cleaner axis
        dateLabels: dataPoints.map(p => p.day), // Keep original dates for tooltips
        carryData: dataPoints.map(p => p.avgCarryError),
        aimData: dataPoints.map(p => p.avgAimError),
        combinedData: dataPoints.map(p => p.avgCombinedError),
        updateDayIndices: updateDayIndices,
        shotCounts: dataPoints.map(p => p.shotCount),
    };
}

/**
 * Renders the performance trend line chart.
 */
function renderPerformanceTrendChart() {
    // REVISED: The function now simply reads the current value of the dropdown.
    // The "snapping" logic is handled when the tab is first clicked.
    const selectedClub = performanceChartClubSelect.value;
    const { labels, dateLabels, carryData, aimData, combinedData, updateDayIndices, shotCounts } = getPerformanceTrendData(selectedClub);

    if (performanceTrendChart) {
        performanceTrendChart.destroy();
    }

    const ctx = performanceTrendChartCanvas.getContext('2d');
    performanceTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Avg Combined Error',
                    data: combinedData,
                    borderColor: '#facc15', // bunker-yellow
                    backgroundColor: 'rgba(250, 204, 21, 0.1)',
                    yAxisID: 'y',
                    tension: 0.1,
                },
                {
                    label: 'Avg Carry Error',
                    data: carryData,
                    borderColor: '#10b981', // grass-green
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    yAxisID: 'y',
                    tension: 0.1,
                },
                {
                    label: 'Avg Aim Error',
                    data: aimData,
                    borderColor: '#3b82f6', // fairway-blue
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    yAxisID: 'y',
                    tension: 0.1,
                }
            ]
        },
        options: getPerformanceChartOptions(updateDayIndices, dateLabels, shotCounts)
    });
}


/**
 * NEW: Returns a configuration object for the mini history charts.
 */
function getMiniChartOptions() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    title: (tooltipItems) => `Value: ${tooltipItems[0].formattedValue}`,
                    label: (tooltipItem) => `Date: ${tooltipItem.label}`
                }
            }
        },
        scales: {
            x: {
                display: false // Hide x-axis labels to keep it compact
            },
            y: {
                display: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    font: { size: 10 },
                    color: '#d1d5db' // gray-300 for better contrast
                }
            }
        }
    };
}

/**
 * NEW: Returns a configuration object for the main performance trend chart.
 * @param {Set<number>} updateDayIndices - A set of indices for days where updates occurred.
 * @param {string[]} dateLabels - An array of the actual date strings for tooltips.
 * @param {number[]} shotCounts - An array of shot counts for each data point.
 */
function getPerformanceChartOptions(updateDayIndices, dateLabels, shotCounts) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#d1d5db' }
            },
            tooltip: {
                callbacks: {
                    title: function(tooltipItems) {
                        const index = tooltipItems[0].dataIndex;
                        // REVERTED: Show the actual date from the dateLabels array in the tooltip title
                        const dateString = dateFns.format(dateFns.parseISO(dateLabels[index]), 'MMM d, yyyy');
                        // Add the session number to the tooltip title for clarity
                        return `Session ${tooltipItems[0].label}: ${dateString}`;
                    },
                    footer: function(tooltipItems) {
                        const index = tooltipItems[0].dataIndex;
                        let footerText = `Shots Recorded: ${shotCounts[index]}`;
                        // Add a note if this was the first session after an update
                        if (updateDayIndices.has(index)) {
                            footerText += '\n(First session after multiplier update)';
                        }
                        return footerText;
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'category', // REVERTED: Change scale type back to category for "Session 1", "Session 2", etc.
                grid: { color: 'rgba(255, 255, 255, 0.05)' }, // Make grid lines fainter
                ticks: { color: '#9ca3af' }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Average Error (Yards)',
                    color: '#9ca3af'
                },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: '#d1d5db' }
            }
        },
        // REVISED: Use the index of the data point to check for updates
        pointRadius: context => updateDayIndices.has(context.dataIndex) ? 6 : 4, // Increased radius for non-update points
        pointStyle: context => updateDayIndices.has(context.dataIndex) ? 'star' : 'circle',
        pointBackgroundColor: context => updateDayIndices.has(context.dataIndex) ? '#ef4444' : '#ffffff', // White points for non-update days
    };
}


/**
 * NEW: Opens a modal to show the specific shots used for a recommendation.
 */
function showRecommendationShots(sourceShots, clubKey, category, component) {
    const shots = getShotsForComponent(sourceShots, clubKey, category, component);
    const modal = document.getElementById('shotDetailModal');
    const modalContent = document.getElementById('modalContent');
    const modalTitle = document.getElementById('modalTitle');

    modalTitle.textContent = `Shots for ${clubKey} - ${WIND_CATEGORIES_MAP[category].label} - ${component}`;
    modalContent.innerHTML = ''; // Clear previous content

    if (shots.length === 0) {
        modalContent.innerHTML = '<p class="text-gray-400 text-center">No matching shots found.</p>';
    } else {
        const list = document.createElement('ul');
        list.className = 'space-y-3';
        shots.forEach(shot => {
            // REVISED: Handle null values gracefully for display.
            const carryErrorText = shot.actualCarryError === null ? '---' : `${shot.actualCarryError >= 0 ? '+' : ''}${shot.actualCarryError.toFixed(1)}`;
            const aimErrorText = shot.actualAimError === null ? '---' : `${shot.actualAimError >= 0 ? '+' : ''}${shot.actualAimError.toFixed(1)}`;

            const carryAdjSign = shot.calculatedCarryAdj >= 0 ? '+' : '';
            const aimAdjDir = shot.calculatedAimAdj > 0 ? 'L' : shot.calculatedAimAdj < 0 ? 'R' : 'N';

            const li = document.createElement('li');
            li.className = 'p-3 bg-gray-800 rounded-lg text-xs border-l-2 border-gray-600';
            li.innerHTML = `
                <div class="grid grid-cols-2 gap-x-4 gap-y-1">
                    <span class="font-bold text-white">Wind: ${shot.windSpeed}mph @ ${shot.windAngle}°</span>
                    <span class="text-gray-400 text-right">Elev: ${shot.elevationYards}yd</span>
                    <span><span class="text-gray-400">Target Adj:</span> <span class="font-semibold text-grass-green">${carryAdjSign}${shot.calculatedCarryAdj.toFixed(1)}</span> | <span class="font-semibold text-fairway-blue">${aimAdjDir}${Math.abs(shot.calculatedAimAdj).toFixed(1)}</span></span>
                    <span>Error: <span class="font-semibold text-white">Carry ${carryErrorText}</span> | <span class="font-semibold text-white">Aim ${aimErrorText}</span></span>
                    <span class="col-span-2 text-gray-500">Multipliers Used: HW ${shot.multipliersUsed.hw.toFixed(2)}, TW ${shot.multipliersUsed.tw.toFixed(2)}, ACW ${shot.multipliersUsed.acw.toFixed(2)}, OCW ${shot.multipliersUsed.ocw.toFixed(2)}</span>
                </div>
            `;
            list.appendChild(li);
        });
        modalContent.appendChild(list);
    }

    modal.classList.remove('hidden');
}

/**
 * Manually changes the value of a target input element by a specified step.
 * @param {string} targetId - The ID of the input to change ('actualCarryErrorInput' or 'actualAimErrorInput').
 * @param {number} step - The amount to add or subtract (e.g., 0.1, -1.0).
 */
function changeInputValue(targetId, step) {
    const input = document.getElementById(targetId);
    if (!input) return;

    const currentValue = parseFloat(input.value) || 0.0;
    let newValue = currentValue + step;

    // NEW: Determine precision from the step value to handle different increments (e.g., 1, 0.5, 0.05)
    const stepString = step.toString();
    const decimalPlaces = stepString.includes('.') ? stepString.split('.')[1].length : 0;

    // Format the output string to the correct precision, which also handles rounding.
    input.value = newValue.toFixed(decimalPlaces);

    // Manually dispatch an 'input' event to trigger any live calculations (like the roll calculation).
    input.dispatchEvent(new Event('input', { bubbles: true }));

    // Manually dispatch a 'change' event to trigger any final saving logic (like saving base roll).
    input.dispatchEvent(new Event('change', { bubbles: true }));
}


// --- Drag/Touch Event Handlers (Unchanged) ---

function handleStart(event) {
    if (event.target.classList.contains('snap-target')) { return; }
    if (event.touches) { event.preventDefault(); }

    isDragging = true;
    dialContainer.classList.add('ring-4', 'ring-fairway-blue');
    
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    updateAngleFromCoords(clientX, clientY);
}

function handleMove(event) {
    if (!isDragging) return;
    
    if (event.touches) { event.preventDefault(); }
    
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    updateAngleFromCoords(clientX, clientY);
}

function handleEnd() {
    isDragging = false;
    dialContainer.classList.remove('ring-4', 'ring-fairway-blue');
}

function updateAngleFromCoords(clientX, clientY) {
    const rect = dialContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    let angleRad = Math.atan2(deltaY, deltaX); 
    let angleDeg = angleRad * (180 / Math.PI);

    angleDeg += 90; 

    angleDeg = angleDeg % 360;
    if (angleDeg < 0) {
        angleDeg += 360;
    }
    
    const finalAngle = Math.round(angleDeg);

    let currentAngleNormalized = currentRotation % 360;
    if (currentAngleNormalized < 0) {
        currentAngleNormalized += 360;
    }
    let difference = finalAngle - currentAngleNormalized;
    
    if (difference > 180) {
        difference -= 360;
    } else if (difference < -180) {
        difference += 360;
    }
    
    currentRotation += difference;

    windDirectionArrow.style.transform = `rotate(${currentRotation}deg)`;

    calculateWind();
}

function snapArrowToDirection(targetDegrees) {
    let normalizedCurrent = currentRotation % 360;
    if (normalizedCurrent < 0) {
        normalizedCurrent += 360;
    }

    let difference = targetDegrees - normalizedCurrent;
    
    if (difference > 180) {
        difference -= 360;
    } else if (difference < -180) {
        difference += 360;
    }
    
    currentRotation += difference;

    windDirectionArrow.style.transform = `rotate(${currentRotation}deg)`;
    calculateWind();
}


// --- Initializers and Event Listeners ---

document.addEventListener('DOMContentLoaded', () => {
    
    // --- NEW: LIE SLIDER LISTENERS ---
    const uphillDownhillLieSlider = document.getElementById('uphillDownhillLie');
    const feetLieSlider = document.getElementById('feetLie');
    const uphillDownhillLieDisplay = document.getElementById('uphillDownhillLieDisplay');
    const uphillDownhillLieValueDisplay = document.getElementById('uphillDownhillLieValueDisplay');
    const feetLieDisplay = document.getElementById('feetLieDisplay');
    const feetLieValueDisplay = document.getElementById('feetLieValueDisplay');;

    const updateLieDisplay = (slider, displayElement, valueDisplayElement) => {
        const percent = parseFloat(slider.value);
        const isUphillDownhill = slider.id.includes('uphill');

        // --- NEW: Calculate Yardage Adjustment ---
        const yardageAdjustment = pinDistance * (percent / 100);
        const formattedYardage = `${yardageAdjustment >= 0 ? '+' : ''}${yardageAdjustment.toFixed(1)}y`;
        
        // --- NEW: Calculate and format the green grid equivalent ---
        const GRID_MULTIPLIER = parseFloat(document.getElementById('greenGridsMultiplier').value) ?? 1.00;
        const gridAdjustment = yardageAdjustment / GRID_MULTIPLIER;
        const formattedGrid = `(${gridAdjustment >= 0 ? '+' : ''}${gridAdjustment.toFixed(1)}g)`;
        
        // Update the new value display next to the label
        if (valueDisplayElement) {
            valueDisplayElement.innerHTML = `${formattedYardage} <span class="text-gray-400 font-medium">${formattedGrid}</span>`;
            // Color based on positive/negative adjustment
            valueDisplayElement.className = 'text-sm font-bold ' + (percent > 0 ? 'text-grass-green' : percent < 0 ? 'text-fairway-blue' : 'text-white'); // This only colors the yardage part
        }
        
        // Update the text display below the slider
        displayElement.textContent = percent === 0 ? 'Level' : `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`;

        // Style the text below the slider
        if (percent !== 0) {
            displayElement.classList.remove('text-gray-400');
            displayElement.classList.add('text-white', 'font-bold');
        } else {
            displayElement.classList.remove('text-white', 'font-bold');
            displayElement.classList.add('text-gray-400');
        }

        // --- NEW: Dynamic background for lie sliders ---
        const min = parseInt(slider.min);
        const max = parseInt(slider.max);
        const value = parseFloat(slider.value);
        const range = max - min;
        const percentFromLeft = ((value - min) / range) * 100; // 0% to 100%

        let gradient;
        const trackBaseColor = '#4b5563'; // Tailwind 'track-base'
        const positiveFillColor = '#10b981'; // Tailwind 'grass-green'
        const negativeFillColor = '#3b82f6'; // Tailwind 'fairway-blue's

        if (value > 0) {
            // Fills from 50% to current value with positive color, rest is base
            gradient = `linear-gradient(to right, ${trackBaseColor} 0%, ${trackBaseColor} 50%, ${positiveFillColor} 50%, ${positiveFillColor} ${percentFromLeft}%, ${trackBaseColor} ${percentFromLeft}%, ${trackBaseColor} 100%)`;
        } else if (value < 0) {
            gradient = `linear-gradient(to right, ${trackBaseColor} 0%, ${trackBaseColor} ${percentFromLeft}%, ${negativeFillColor} ${percentFromLeft}%, ${negativeFillColor} 50%, ${trackBaseColor} 50%, ${trackBaseColor} 100%)`;
        } else { // value === 0
            // Entire track is base color
            gradient = `linear-gradient(to right, ${trackBaseColor} 0%, ${trackBaseColor} 100%)`;
        }

        slider.style.setProperty('--lie-track-background', gradient);
        // --- END NEW ---
    };

    uphillDownhillLieSlider.addEventListener('input', () => { updateLieDisplay(uphillDownhillLieSlider, uphillDownhillLieDisplay, uphillDownhillLieValueDisplay); calculateWind(); });
    feetLieSlider.addEventListener('input', () => { updateLieDisplay(feetLieSlider, feetLieDisplay, feetLieValueDisplay); calculateWind(); });

    // NEW: Add click listeners for the "Level" snap text
    uphillDownhillLieDisplay.addEventListener('click', () => {
        uphillDownhillLieSlider.value = 0;
        // Manually trigger the input event to update the display and recalculate
        uphillDownhillLieSlider.dispatchEvent(new Event('input', { bubbles: true }));
    });

    feetLieDisplay.addEventListener('click', () => {
        feetLieSlider.value = 0;
        // Manually trigger the input event to update the display and recalculate
        feetLieSlider.dispatchEvent(new Event('input', { bubbles: true }));
    });

    // --- NEW: HYBRID LIE SLIDER BUTTON LISTENERS ---
    document.querySelectorAll('.lie-slider-increment-btn').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const step = parseInt(button.dataset.step, 10);
            const slider = document.getElementById(targetId);;

            if (slider) {
                const currentValue = parseFloat(slider.value);
                const min = parseFloat(slider.min);
                const max = parseFloat(slider.max);
                let newValue = currentValue + step;

                // Clamp the value to stay within the slider's bounds
                newValue = Math.max(min, Math.min(max, newValue));
                slider.value = newValue.toFixed(1);
                slider.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    });
    // --- CALCULATOR EVENT LISTENERS ---
    const visibleSliders = document.querySelectorAll('#input-section input[type="range"], #multiplier-section input[type="range"]');
    
    visibleSliders.forEach(input => {
        // REVISED: Changed from 'input' to 'change' for sliders to fire only when user releases mouse. 'input' for live updates.
        input.addEventListener('input', () => {
            if (input.id === 'windSpeed' && activeClubKey) {
                const windSpeed = parseFloat(input.value) || 0;
                updateClubMultipliersBasedOnWind(activeClubKey, windSpeed);
            }
            
            if (input.id.includes('Multiplier') || input.id.includes('Factor')) {
                const displayId = input.id + 'Value';
                const displayElement = document.getElementById(displayId);
                if (displayElement) {
                    displayElement.textContent = (parseFloat(input.value) / 100).toFixed(2);
                }
            }
            
            // NEW: Check if a multiplier slider value differs from the saved preset and show the save button.
            if (input.classList.contains('multiplier-slider')) {
                checkMultiplierChanges();
            }

            calculateWind();
        });
    });
    
    polarityToggle.addEventListener('click', () => {
        elevationPolarity *= -1; 
        calculateWind();
    });

    elevationPlus50Button.addEventListener('click', () => {
        extraElevation += BONUS_AMOUNT;
        calculateWind();
    });
    
    resetBonusButton.addEventListener('click', () => {
        extraElevation = 0;
        calculateWind();
    });

    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.disabled) return;
            const presetValue = button.getAttribute('data-value');
            const hiddenInput = document.getElementById('greenGridsMultiplier');
            hiddenInput.value = presetValue;

            // NEW: Save the value to localStorage
            localStorage.setItem(GREEN_GRID_MULTIPLIER_KEY, presetValue);

            updatePresetButtonState(); 
            calculateWind();
        });
    });

    clubButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.disabled) return;
            applyClubPreset(button.getAttribute('data-club'));
        });
    });

    // REVISED: Dual Lock Event Listeners
    safetyLockButton.addEventListener('click', toggleSafetyLock);
    analysisLockButton.addEventListener('click', toggleAnalysisLock);
    shotBiasToggleButton.addEventListener('click', toggleShotBias); // NEW
    
    
    // NEW: Event listener for the manual save button
    document.getElementById('saveManualMultiplierChanges').addEventListener('click', () => {
        const windSpeed = parseFloat(windSpeedSlider.value) || 0;
        const category = getWindCategory(windSpeed);
        const clubKey = activeClubKey;

        const sliders = [
            { slider: headwindSlider, component: 'Headwind', key: 'hw', isCrosswind: false },
            { slider: tailwindSlider, component: 'Tailwind', key: 'tw', isCrosswind: false },
            // Handle shot bias for crosswind sliders
            { slider: assistCrosswindSlider, component: 'Assist Crosswind', key: 'acw', isCrosswind: true },
            { slider: opposedCrosswindSlider, component: 'Opposed Crosswind', key: 'ocw', isCrosswind: true }
        ];

        let changesMade = 0;
        const changesToLog = [];

        for (const { slider, component, key } of sliders) {
            const newValue = parseFloat(slider.value) / 100;
            // Determine the correct component and key based on shot bias for crosswinds
            const actualComponent = (shotBias === 'draw' && key === 'acw') ? 'Opposed Crosswind' : (shotBias === 'draw' && key === 'ocw') ? 'Assist Crosswind' : component;
            const actualKey = (shotBias === 'draw' && key === 'acw') ? 'ocw' : (shotBias === 'draw' && key === 'ocw') ? 'acw' : key;
            const oldValue = parseFloat(clubPresets[clubKey].windCategories[category][actualKey]);

            if (Math.abs(newValue - oldValue) > 0.001) {
                // Stage the change to be logged
                changesToLog.push({ component: actualComponent, oldValue: oldValue, newValue: parseFloat(newValue) });
                clubPresets[clubKey].windCategories[category][actualKey] = parseFloat(newValue);
                changesMade++;
            }
        }

        if (changesMade > 0) {
            // Log all staged changes
            changesToLog.forEach(change => {
                logMultiplierChange(clubKey, category, change.component, change.oldValue, change.newValue, 'N/A', 'Manual');
            });
            showConfirmation(`Saved ${changesMade} manual change(s) for ${clubKey}!`);
            // Save all collected changes to presets at once
            localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(clubPresets));
            // NEW: Ensure the reset button is visible now that a custom preset is saved.
            updateTrustScoreDisplays(); // NEW: Manual save changes the trust score
            document.getElementById('resetMultipliersButton').classList.remove('hidden');
            document.getElementById('manualSaveContainer').classList.add('hidden');
            analyzeData(); // Re-run analysis to reflect the manual change
        }
    });

    // --- NEW: REVERT MANUAL CHANGES LISTENER ---
    const revertManualChangesButton = document.getElementById('revertManualMultiplierChanges');
    if (revertManualChangesButton) {
        revertManualChangesButton.addEventListener('click', () => applyClubPreset(activeClubKey));
    }

    // --- NEW: WIND INCREMENT/DECREMENT BUTTONS ---
    const windIncrementBtn = document.getElementById('windIncrementBtn');
    const windDecrementBtn = document.getElementById('windDecrementBtn');

    const changeWindSpeed = (step) => {
        const currentValue = parseInt(windSpeedSlider.value, 10);
        const min = parseInt(windSpeedSlider.min, 10);
        const max = parseInt(windSpeedSlider.max, 10);
        
        let newValue = currentValue + step;

        // Clamp the value within the slider's min/max range
        newValue = Math.max(min, Math.min(max, newValue));

        windSpeedSlider.value = newValue;
        // Manually trigger the 'input' event so all other functions (calculateWind, etc.) run automatically
        windSpeedSlider.dispatchEvent(new Event('input', { bubbles: true }));
    };

    windIncrementBtn.addEventListener('click', () => changeWindSpeed(1));
    windDecrementBtn.addEventListener('click', () => changeWindSpeed(-1));

    // --- NEW: ELEVATION INCREMENT/DECREMENT BUTTONS ---
    const elevationIncrementBtn = document.getElementById('elevationIncrementBtn');
    const elevationDecrementBtn = document.getElementById('elevationDecrementBtn');

    const changeElevation = (step) => {
        const currentValue = parseInt(elevationSlider.value, 10);
        const min = parseInt(elevationSlider.min, 10);
        const max = parseInt(elevationSlider.max, 10);
        
        let newValue = currentValue + step;

        // Clamp the value within the slider's min/max range
        newValue = Math.max(min, Math.min(max, newValue));

        elevationSlider.value = newValue;
        elevationSlider.dispatchEvent(new Event('input', { bubbles: true }));
    };
    elevationIncrementBtn.addEventListener('click', () => changeElevation(1));
    elevationDecrementBtn.addEventListener('click', () => changeElevation(-1));

    // --- SHOT TRACKER & DATA MANAGEMENT LISTENERS ---
    recordShotButton.addEventListener('click', recordShot);
    document.getElementById('clearShotInputsButton').addEventListener('click', () => {
        document.getElementById('actualCarryErrorInput').value = '0.0';
        document.getElementById('actualAimErrorInput').value = '0.0';
    });

    // Data Management Buttons (now in modal)
    document.getElementById('backupAllDataButton').addEventListener('click', backupAllData);
    document.getElementById('importAllDataButton').addEventListener('click', () => document.getElementById('allDataImportInput').click());
    document.getElementById('allDataImportInput').addEventListener('change', importAllData);
    document.getElementById('backupShotsButton').addEventListener('click', backupShots);
    document.getElementById('importShotsButton').addEventListener('click', () => document.getElementById('shotImportInput').click());
    document.getElementById('shotImportInput').addEventListener('change', importShots);
    document.getElementById('clearAllShotsButton').addEventListener('click', clearAllShots);
    document.getElementById('backupPresetsButton').addEventListener('click', backupPresets);
    document.getElementById('importPresetsButton').addEventListener('click', () => document.getElementById('presetImportInput').click());
    document.getElementById('presetImportInput').addEventListener('change', importPresets);
    document.getElementById('resetMultipliersButton').addEventListener('click', resetAllPresets);
    // NEW: Settings Sync Listeners
    document.getElementById('backupSettingsButton').addEventListener('click', backupSettings);
    document.getElementById('importSettingsButton').addEventListener('click', () => document.getElementById('settingsImportInput').click());
    document.getElementById('resetSettingsButton').addEventListener('click', resetSettings); // NEW
    document.getElementById('settingsImportInput').addEventListener('change', importSettings);

    document.getElementById('resetAllDataButton').addEventListener('click', resetAllData);

    // NEW: Listener for the new CSV export button
    document.getElementById('exportAllPresetsCsvButton').addEventListener('click', exportAllPresetsToCSV);

    // --- NEW: ROLL CALCULATION LISTENERS ---
    const rollInputs = [greenSpeedInput, headwindRollPercentInput, tailwindRollPercentInput, windRollSensitivityInput, firmnessDecrementBtn, firmnessIncrementBtn];
    rollInputs.forEach(input => {
        input.addEventListener('input', () => {
            saveRollSettings(); // NEW: Save settings on any change
            calculateWind(); // Re-trigger the main calculation which will call calculateRoll
        });
    });

    // REVISED: Add event listener for the new base roll input
    // Use 'input' for real-time updates, 'change' for saving after edit is complete.
    if (baseRollInput) {
        baseRollInput.addEventListener('input', () => calculateWind()); // Recalculate on every keystroke
        baseRollInput.addEventListener('change', () => { // Save the final value when done editing
            if (activeClubKey && clubPresets[activeClubKey]) {
                clubPresets[activeClubKey].r = parseFloat(baseRollInput.value) || 0;
                localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(clubPresets));
                // No need to call calculateWind() here, 'input' event already handled it.
            }
        });
    }

    // NEW: Green Firmness button listeners
    firmnessDecrementBtn.addEventListener('click', () => changeGreenFirmness(-1));
    firmnessIncrementBtn.addEventListener('click', () => changeGreenFirmness(1));

    // --- CUSTOM INCREMENT BUTTON LISTENERS (NEW) ---
    document.querySelectorAll('.increment-btn, .roll-increment-btn').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const step = parseFloat(button.getAttribute('data-step'));
            changeInputValue(targetId, step);
        });
    });

    // --- RECOMMENDATION BUTTON EVENT DELEGATION (NEW) ---
    recommendationList.addEventListener('click', (event) => {
        const applyBtn = event.target.closest('.apply-recommendation-btn');
        const viewBtn = event.target.closest('.view-shots-btn');
        const plotBtn = event.target.closest('.view-plot-btn');

        if (applyBtn) {
            // ... (existing code inside this block is correct)
            const clubKey = applyBtn.dataset.clubKey;
            const category = applyBtn.dataset.category;
            const component = applyBtn.dataset.component;
            const newMultiplier = parseFloat(applyBtn.closest('.recommendation-item').querySelector('.text-grass-green').textContent);
            const oldMultiplier = parseFloat(applyBtn.closest('.recommendation-item').querySelector('.text-red-400').textContent);

            // Disable the button to prevent multiple clicks.
            applyBtn.disabled = true;

            // --- NEW: Record the timestamp for this club ---
            recommendationCooldowns[clubKey] = Date.now();
            try {
                localStorage.setItem(LAST_UPDATE_KEY, JSON.stringify(recommendationCooldowns));
            } catch (e) {
                console.error("Could not save update timestamp:", e);
            }

            // NEW: Log the change to the history object
            const recommendationText = applyBtn.closest('.recommendation-item').querySelector('div:first-child').innerHTML;
            const shotCountMatch = recommendationText.match(/Based on <strong>(\d+) shots/);
            const confidenceMatch = recommendationText.match(/Confidence: (\w+)/);
            logMultiplierChange(clubKey, category, component, oldMultiplier, newMultiplier, shotCountMatch ? parseInt(shotCountMatch[1], 10) : 0, confidenceMatch ? confidenceMatch[1] : 'N/A');

            // Show confirmation message
            showConfirmation(`Multiplier for ${clubKey} updated!`);

            // Fade out the list item
            const listItem = applyBtn.closest('.recommendation-item');
            listItem.classList.add('fading-out');

            // After the fade, remove the item and hide the confirmation
            setTimeout(() => {
                listItem.remove();
                // FIX: Call updateAndSavePreset HERE, right before re-analyzing.
                // This ensures the UI updates correctly and the recommendation is truly gone.
                updateAndSavePreset(clubKey, category, component, newMultiplier);
            updateTrustScoreDisplays(); // NEW: Applying a recommendation changes the trust score
            updateAllClubRecommendationStatus(); // Refresh badges after applying
                // Now that saving is complete, re-run analysis to refresh the state.
                analyzeData();
                updateAllClubRecommendationStatus();
            }, 1500); // 1.5 seconds
        } 

        if (viewBtn) {
            const clubKey = viewBtn.dataset.clubKey;
            const category = viewBtn.dataset.category;
            const component = viewBtn.dataset.component;

            // --- NEW: Respect the main plot's filter state ---
            let sourceShots = allShotData;
            if (isPlotFiltered) {
                const lastUpdateTimestamp = recommendationCooldowns[clubKey] || 0;
                if (lastUpdateTimestamp > 0) {
                    sourceShots = sourceShots.filter(shot => shot.numericTimestamp && shot.numericTimestamp > lastUpdateTimestamp);
                }
            }
            // --- END NEW ---

            showRecommendationShots(sourceShots, clubKey, category, component);
        }

        if (plotBtn) {
            const clubKey = plotBtn.dataset.clubKey;
            const category = plotBtn.dataset.category;
            const component = plotBtn.dataset.component;
            const newMultiplier = parseFloat(plotBtn.closest('.recommendation-item').querySelector('.text-grass-green').textContent);

            // --- NEW: Respect the main plot's filter state ---
            let sourceShots = allShotData;
            if (isPlotFiltered) {
                const lastUpdateTimestamp = recommendationCooldowns[clubKey] || 0;
                if (lastUpdateTimestamp > 0) {
                    sourceShots = sourceShots.filter(shot => shot.numericTimestamp && shot.numericTimestamp > lastUpdateTimestamp);
                }
            }
            // --- END NEW ---

            // Get the relevant shots from the correct source (either all data or filtered data)
            const shots = getShotsForComponent(sourceShots, clubKey, category, component); // This now correctly finds all shots

            const plotData = {
                datasets: [
                    { 
                        label: 'Current', 
                        // REVISED: Pass the outlier flag and use scriptable options to style outliers correctly.
                        data: shots.map(shot => ({
                            x: shot.actualAimError ?? 0,
                            y: shot.actualCarryError ?? 0,
                            isOutlier: shot.isOutlier,
                            weight: getShotWeight(shot) // Add weight property
                        })), 
                        backgroundColor: context => context.raw.isOutlier ? 'rgba(239, 68, 68, 0.8)' : 'rgba(250, 204, 21, 0.7)', // Solid red for outliers
                        borderColor: context => context.raw.isOutlier ? 'rgba(239, 68, 68, 1)' : 'rgba(250, 204, 21, 1)', // Solid red border for outliers
                        borderWidth: 1, // Standard border width for all points
                        radius: 5 
                    },
                    { 
                        label: 'Recommended', 
                        // REVISED: Filter out outliers before calculating and mapping hypothetical results.
                        data: shots.filter(shot => !shot.isOutlier).map(shot => {
                            // REVISED: Use nullish coalescing to treat null as 0 for this visualization.
                            let hypotheticalCarryError = shot.actualCarryError ?? 0;
                            let hypotheticalAimError = shot.actualAimError ?? 0;
                            let deltaAdj = 0;

                            switch (component) {
                                case 'Headwind':
                                    deltaAdj = -(newMultiplier - shot.multipliersUsed.hw) * shot.headwindComponentSpeed;
                                    hypotheticalCarryError = (shot.actualCarryError ?? 0) - deltaAdj;
                                    break;
                                case 'Tailwind':
                                    deltaAdj = (newMultiplier - shot.multipliersUsed.tw) * shot.tailwindComponentSpeed;
                                    hypotheticalCarryError = (shot.actualCarryError ?? 0) - deltaAdj;
                                    break;
                                case 'Assist Crosswind': // No change needed here
                                    deltaAdj = (newMultiplier - shot.multipliersUsed.acw) * shot.calculatedAimAdj;
                                    hypotheticalAimError = (shot.actualAimError ?? 0) - deltaAdj;
                                    break;
                                case 'Opposed Crosswind':
                                    deltaAdj = (newMultiplier - shot.multipliersUsed.ocw) * shot.calculatedAimAdj;
                                    hypotheticalAimError = (shot.actualAimError ?? 0) - deltaAdj;
                                    break;
                            }
                            return { 
                                x: hypotheticalAimError, 
                                y: hypotheticalCarryError,
                                weight: getShotWeight(shot) // Add weight property
                            };
                        }), 
                        backgroundColor: 'transparent', // Hollow
                        borderColor: 'rgba(59, 130, 246, 0.9)', // fairway-blue border
                        borderWidth: 2, // Thicker ring
                        radius: 6 // Slightly larger to encircle the yellow dot
                    }
                ]
            };

            renderScatterPlot(plotData);

            // Update description and legend
            const plotDescription = document.getElementById('scatterPlotDescription');
            plotDescription.innerHTML = `Comparing ${shots.length} shots for ${clubKey} - ${component}<br><span class="font-bold text-yellow-400">Current</span> vs. <span class="font-bold text-fairway-blue">Recommended</span>`;
            shotChart.options.plugins.legend.display = true;
        }
    });

    // Event delegation for deleting individual shots
    shotHistoryList.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('.delete-shot-btn');
        const shotItem = event.target.closest('.shot-item');

        if (deleteButton) {
            const timestamp = deleteButton.getAttribute('data-timestamp');
            if (timestamp) {
                // If the deleted shot was the selected one, clear the selection
                if (selectedShotTimestamp === timestamp) {
                    selectedShotTimestamp = null;
                }
                deleteShot(timestamp);
            }
            return; // Prevent the main item click from firing
        }

        if (shotItem) {
            const timestamp = shotItem.dataset.timestamp;
            const shot = allShotData.find(s => s.timestamp === timestamp);

            if (!shot) return;

            // If clicking the already selected shot, deselect it
            if (selectedShotTimestamp === timestamp) {
                selectedShotTimestamp = null;
                shotItem.classList.remove('selected');
                analyzeData(); // Re-run analysis to show all shots
            } else {
                // Deselect any other selected item
                document.querySelectorAll('#shotHistoryList .shot-item.selected').forEach(item => item.classList.remove('selected'));
                
                selectedShotTimestamp = timestamp;
                shotItem.classList.add('selected');
                // REVISED: Check if the club needs to be changed.
                if (activeAnalysisClubKey !== shot.clubKey) {
                    setActiveAnalysisClub(shot.clubKey); // This will trigger analyzeData
                } else {
                    // If the club is already correct, just render the single shot plot.
                    renderScatterPlot([]); // Pass empty array, the function will find the selected shot
                }
            }
        }

    });

    // --- NEW: ANALYSIS TABLE ROW CLICK LISTENER ---
    analysisResultsList.addEventListener('click', (event) => {
        const clickedRow = event.target.closest('.analysis-row-clickable');
        if (clickedRow) {
            const category = clickedRow.dataset.category;
            const component = clickedRow.dataset.component;

            // If this filter is already active, clear it. Otherwise, apply it.
            if (activePlotFilter && activePlotFilter.category === category && activePlotFilter.component === component) {
                activePlotFilter = null;
                clickedRow.classList.remove('active-filter');
                analyzeData(); // Re-run the default analysis
            } else {
                activePlotFilter = { category, component };
                applyTableRowFilter(category, component);
            }
        }
    });


    // --- WIND DIAL EVENT LISTENERS ---
    dialContainer.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    dialContainer.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);

    snapButtons.forEach(button => {
        button.addEventListener('click', () => { 
            const degrees = parseInt(button.getAttribute('data-direction'));
            snapArrowToDirection(degrees);
        });
    });
    
    // --- ANALYSIS EVENT LISTENERS ---
    setActiveAnalysisClub('7'); // Set initial analysis club
    
    analysisClubButtons.forEach(button => {
        button.addEventListener('click', () => {
            setActiveAnalysisClub(button.getAttribute('data-club'));
        });
    });
    
    const exportButton = document.getElementById('exportAnalysisButton');
    if(exportButton) {
        exportButton.addEventListener('click', exportAnalysisData);
    }

    // --- MODAL EVENT LISTENERS (NEW) ---
    document.getElementById('closeModalButton').addEventListener('click', () => {
        document.getElementById('shotDetailModal').classList.add('hidden');
    });

    // REVISED: Plot filter toggle button
    document.getElementById('plotFilterToggleButton').addEventListener('click', () => {
        // NEW: If a table row filter is active, this button's primary job is to clear it.
        if (activePlotFilter) {
            activePlotFilter = null;
            document.querySelectorAll('.analysis-row-clickable.active-filter').forEach(row => row.classList.remove('active-filter'));
        } else {
            // Otherwise, it toggles the "Since Update" filter as before.
            isPlotFiltered = !isPlotFiltered;
        }
        analyzeData(); // Re-run analysis to apply the new filter state
        document.getElementById('scatterPlotDescription').textContent = 'Shows Carry Error (Y-axis) vs. Aim Error (X-axis)'; // Reset description
    });

    // --- NEW: ANALYSIS SETTINGS LISTENER ---
    const maxErrorInput = document.getElementById('maxErrorForWeightingInput');
    if (maxErrorInput) {
        maxErrorInput.addEventListener('change', () => {
            saveAnalysisSettings();
            analyzeData(); // Re-run analysis with the new setting
        });
    }

    // --- NEW: TAB NAVIGATION LOGIC ---
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;

            // Update button active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update panel visibility
            tabPanels.forEach(panel => {
                panel.classList.toggle('active', panel.dataset.panel === tabName);
            });
        });
    });

    // --- NEW: MIRROR CLUB SELECTION LISTENER ---
    const mirrorClubCheckbox = document.getElementById('mirrorClubSelection');
    if (mirrorClubCheckbox) {
        mirrorClubCheckbox.addEventListener('change', (e) => {
            isMirroringClub = e.target.checked;
            if (isMirroringClub) {
                setActiveAnalysisClub(activeClubKey); // Immediately sync
            }
        });
    }

    // --- NEW: ANALYSIS SCROLL BUTTON LISTENER ---
    const analysisScrollButton = document.getElementById('analysis-scroll-button');
    if (analysisScrollButton) {
        analysisScrollButton.addEventListener('click', () => {
            const analysisPanel = document.getElementById('analysis-panel');
            if (analysisPanel) {
                analysisPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }
    // --- NEW: Main History Modal Tab Switching ---
    const mainHistoryTabs = document.querySelectorAll('.main-history-tab-button');
    const mainHistoryPanels = document.querySelectorAll('.main-history-tab-panel');

    // --- NEW: Performance Trend Chart Elements ---
    const performanceChartClubSelect = document.getElementById('performanceChartClubSelect');
    const performanceTrendChartCanvas = document.getElementById('performanceTrendChartCanvas');



    mainHistoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPanelId = tab.dataset.target;

            mainHistoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            mainHistoryPanels.forEach(p => p.classList.add('hidden'));
            document.getElementById(targetPanelId).classList.remove('hidden');

            // REVISED: Populate the content of the tab that was just clicked.
            // This is a more robust approach that avoids race conditions on modal open.
            if (targetPanelId === 'panel-multiplier-history') {
                // REVISED: Pass the active analysis club key to ensure the correct history is shown.
                // This fixes the bug where it wasn't snapping to the selected club.
                showMultiplierHistory(activeAnalysisClubKey);
            }
            if (targetPanelId === 'panel-performance-trends') {
                // REVISED: Implement the "snap on first view" logic.
                const isFirstPopulation = (performanceChartClubSelect.options.length === 0);
                
                populatePerformanceChartClubSelect(); // Populate the dropdown if it's empty.
                
                if (isFirstPopulation) {
                    // If this is the first time, snap the value to the active club.
                    performanceChartClubSelect.value = activeAnalysisClubKey;
                }

                renderPerformanceTrendChart();
            }
            // NEW: Handle the new Multiplier Status tab
            if (targetPanelId === 'panel-multiplier-status') {
                // The content is static for the session, so just render it.
                renderMultiplierStatus();
            }
        });
    });

    // --- HELP MODAL LISTENERS (NEW) ---
    const helpButton = document.getElementById('helpButton');
    const helpModal = document.getElementById('helpModal');
    const closeHelpModalButton = document.getElementById('closeHelpModalButton');

    if (helpButton && helpModal && closeHelpModalButton) {
        helpButton.addEventListener('click', () => helpModal.classList.remove('hidden'));
        closeHelpModalButton.addEventListener('click', () => helpModal.classList.add('hidden'));
        helpModal.addEventListener('click', (e) => { if (e.target === helpModal) helpModal.classList.add('hidden'); }); // Close on background click
    }

    // --- NOTES MODAL LISTENERS (NEW) ---
    const notesButton = document.getElementById('notesButton');
    const notesModal = document.getElementById('notesModal');
    const closeNotesModalButton = document.getElementById('closeNotesModalButton');
    const notesTextarea = document.getElementById('sessionNotesTextarea');

    if (notesButton && notesModal && closeNotesModalButton && notesTextarea) {
        notesButton.addEventListener('click', () => notesModal.classList.remove('hidden'));
        closeNotesModalButton.addEventListener('click', () => notesModal.classList.add('hidden'));
        notesModal.addEventListener('click', (e) => { if (e.target === notesModal) notesModal.classList.add('hidden'); });
        notesTextarea.addEventListener('input', () => {
            localStorage.setItem(SESSION_NOTES_KEY, notesTextarea.value);
        });
    }

    // --- SETTINGS MODAL LISTENERS (NEW) ---
    const settingsButton = document.getElementById('settingsButton');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModalButton = document.getElementById('closeSettingsModalButton');
    const firmnessSettingsContainer = document.getElementById('greenFirmnessSettingsContainer');
    const clubRangesSettingsContainer = document.getElementById('clubRangesSettingsContainer'); // NEW
    const baseRollSettingsContainer = document.getElementById('baseRollSettingsContainer'); // NEW
    const rollSettingsContainer = document.getElementById('rollSettingsContainer'); // NEW

    const populateSettingsModal = () => {
        firmnessSettingsContainer.innerHTML = '';
        greenFirmnessOrder.forEach(key => {
            const preset = greenFirmnessPresets[key];
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center';
            div.innerHTML = `
                <label for="firmness-input-${key}" class="font-medium text-gray-300">${preset.label}</label>
                <input type="number" id="firmness-input-${key}" value="${preset.multiplier.toFixed(2)}" step="0.01" class="settings-input">
            `;
            firmnessSettingsContainer.appendChild(div);
        });

        // NEW: Populate Club Ranges
        clubRangesSettingsContainer.innerHTML = '';
        const sortedClubs = Object.keys(clubBaseRanges).sort((a, b) => clubBaseRanges[a].order - clubBaseRanges[b].order);
        sortedClubs.forEach(clubKey => {
            const range = clubBaseRanges[clubKey];
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center';
            div.innerHTML = `
                <div class="flex items-center gap-3">
                    <input type="checkbox" data-club="${clubKey}" class="active-club-checkbox focus:ring-bunker-yellow" ${activeClubs.has(clubKey) ? 'checked' : ''}>
                    <label class="font-medium text-gray-300 w-12">${clubKey}</label>
                </div>
                <div class="flex items-center gap-2 ml-auto">
                    <input type="number" data-club="${clubKey}" data-type="min" value="${range.min}" class="settings-input club-range-input">
                    <span class="text-gray-500">-</span>
                    <input type="number" data-club="${clubKey}" data-type="max" value="${range.max}" class="settings-input club-range-input">
                </div>
            `;
            clubRangesSettingsContainer.appendChild(div);
        });

        // Update counter
        const activeClubCounter = document.getElementById('activeClubCounter');
        activeClubCounter.textContent = `Active Clubs: ${activeClubs.size} / ${MAX_ACTIVE_CLUBS}`;
    };

    // NEW: Populate and handle DTP Counter Mode settings
    const dtpCounterModeContainer = document.getElementById('dtpCounterModeContainer');
    const updateDtpModeButtons = () => {
        dtpCounterModeContainer.querySelectorAll('.dtp-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === dtpCounterMode);
        });
    };
    dtpCounterModeContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.dtp-mode-btn');
        if (!button) return;
        dtpCounterMode = button.dataset.mode;
        localStorage.setItem(DTP_COUNTER_MODE_KEY, dtpCounterMode);
        updateDtpModeButtons();
    });
    // NEW: Populate Base Roll Settings
    const populateBaseRollSettings = () => {
        baseRollSettingsContainer.innerHTML = '';
        const sortedClubs = Object.keys(clubPresets).sort((a, b) => defaultClubBaseRanges[a].order - defaultClubBaseRanges[b].order);
        sortedClubs.forEach(clubKey => {
            const preset = clubPresets[clubKey];
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center';
            div.innerHTML = `
                <label for="base-roll-input-${clubKey}" class="font-medium text-gray-300 w-12">${clubKey}</label><div class="flex items-center"><button type="button" data-target="base-roll-input-${clubKey}" data-step="-0.5" class="roll-increment-btn text-white rounded-l-md bg-fairway-blue/90 hover:bg-fairway-blue transition-colors duration-150">-</button><input type="number" id="base-roll-input-${clubKey}" value="${preset.r.toFixed(1)}" step="0.5" class="w-20 bg-gray-700 text-white p-1 text-lg text-center font-bold border-y border-gray-600 focus:border-bunker-yellow focus:ring-0 disabled:opacity-50 h-[2.5rem] base-roll-input"><button type="button" data-target="base-roll-input-${clubKey}" data-step="0.5" class="roll-increment-btn text-white rounded-r-md bg-grass-green/90 hover:bg-grass-green transition-colors duration-150">+</button></div>
            `;
            baseRollSettingsContainer.appendChild(div);
        });
    };

    // NEW: Populate Roll Settings
    const populateRollSettings = () => {
        // This function is simpler as the inputs are static in the HTML
        document.getElementById('settings-greenSpeed').value = greenSpeedInput.value;
        document.getElementById('settings-windRollSensitivity').value = windRollSensitivityInput.value;
        document.getElementById('settings-headwindRollPercent').value = headwindRollPercentInput.value;
        document.getElementById('settings-tailwindRollPercent').value = tailwindRollPercentInput.value;
    };

    if (rollSettingsContainer) {
        rollSettingsContainer.addEventListener('change', handleRollSettingsChange);
    }

    if (settingsButton && settingsModal && closeSettingsModalButton) {
        settingsButton.addEventListener('click', () => {
            populateSettingsModal();
            populateBaseRollSettings(); // NEW
            updateDtpModeButtons(); // NEW
            settingsModal.classList.remove('hidden');
        });
        closeSettingsModalButton.addEventListener('click', () => settingsModal.classList.add('hidden'));
        settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) settingsModal.classList.add('hidden'); });
    }

    firmnessSettingsContainer.addEventListener('change', (e) => {
        if (e.target.matches('.settings-input')) {
            const key = e.target.id.replace('firmness-input-', '');
            const newValue = parseFloat(e.target.value);
            if (!isNaN(newValue) && greenFirmnessPresets[key]) {
                greenFirmnessPresets[key].multiplier = newValue;
                localStorage.setItem(GREEN_FIRMNESS_SETTINGS_KEY, JSON.stringify(greenFirmnessPresets));
                calculateWind(); // Recalculate to update any displays
            }
        }
    });

    document.getElementById('resetFirmnessDefaultsButton').addEventListener('click', () => {
        greenFirmnessPresets = JSON.parse(JSON.stringify(defaultGreenFirmnessPresets));
        localStorage.removeItem(GREEN_FIRMNESS_SETTINGS_KEY);
        populateSettingsModal();
        calculateWind();
    });

    // NEW: Club Ranges Settings Listeners
    clubRangesSettingsContainer.addEventListener('change', (e) => {
        if (e.target.matches('.club-range-input')) {
            const clubKey = e.target.dataset.club;
            const rangeType = e.target.dataset.type;
            const newValue = parseInt(e.target.value, 10);

            if (!isNaN(newValue) && clubBaseRanges[clubKey]) {
                clubBaseRanges[clubKey][rangeType] = newValue;
                localStorage.setItem(CLUB_RANGES_STORAGE_KEY, JSON.stringify(clubBaseRanges));
                applyClubPreset(activeClubKey); // Re-apply to update display
                if (clubRangeChart) renderClubRangeChart(); // NEW: Redraw chart if it exists
            }
        }
    });

    // NEW: Active Club Checkbox Listener
    clubRangesSettingsContainer.addEventListener('change', (e) => {
        if (e.target.matches('.active-club-checkbox')) {
            const clubKey = e.target.dataset.club;
            if (e.target.checked) {
                if (activeClubs.size >= MAX_ACTIVE_CLUBS) {
                    alert(`You can only have ${MAX_ACTIVE_CLUBS} clubs in your active bag.`);
                    e.target.checked = false; // Prevent checking
                    return;
                }
                activeClubs.add(clubKey);
            } else {
                activeClubs.delete(clubKey);
            }
            // Save the updated set to local storage
            localStorage.setItem(ACTIVE_CLUBS_STORAGE_KEY, JSON.stringify(Array.from(activeClubs)));
            
            // Update UI
            const activeClubCounter = document.getElementById('activeClubCounter');
            activeClubCounter.textContent = `Active Clubs: ${activeClubs.size} / ${MAX_ACTIVE_CLUBS}`; // Apply preset will call updateClubButtonActiveStyles
            applyClubPreset(activeClubKey);
            if (clubRangeChart) renderClubRangeChart(document.querySelector('#rangeChartFilterContainer .active').dataset.filter);
        }
    });

    document.getElementById('resetClubRangesButton').addEventListener('click', () => {
        clubBaseRanges = JSON.parse(JSON.stringify(defaultClubBaseRanges));
        localStorage.removeItem(CLUB_RANGES_STORAGE_KEY);
        populateSettingsModal();
        applyClubPreset(activeClubKey);
        if (clubRangeChart) renderClubRangeChart(); // NEW: Redraw chart if it exists
    });

    // --- NEW: RANGE CHART FILTER LISTENERS ---
    const rangeChartFilterContainer = document.getElementById('rangeChartFilterContainer');
    if (rangeChartFilterContainer) {
        rangeChartFilterContainer.addEventListener('click', (e) => {
            if (e.target.matches('.range-chart-filter-btn')) {
                const filter = e.target.dataset.filter;
                // Update active button style
                rangeChartFilterContainer.querySelectorAll('.range-chart-filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                // Re-render the chart with the selected filter
                renderClubRangeChart(filter);
            }
        });
    }
    // --- NEW: DTP BUTTON LISTENERS ---
    const updateDtpDisplay = () => {
        dtpDisplay.textContent = pinDistance;
        calculateWind(); 
        updateLieDisplay(uphillDownhillLieSlider, uphillDownhillLieDisplay, uphillDownhillLieValueDisplay); // Refresh lie displays
        updateLieDisplay(feetLieSlider, feetLieDisplay, feetLieValueDisplay); // Refresh lie displays
    };

    // RE-ADD: DTP button listeners that were accidentally removed.
    dtpButtons.forEach(button => {
        button.addEventListener('click', () => {
            const value = parseInt(button.dataset.value, 10);

            if (dtpCounterMode === 'additive') {
                pinDistance += value;
            } else { // 'cyclic' mode
                let hundreds = Math.floor(pinDistance / 100);
                let tens = Math.floor((pinDistance % 100) / 10);
                let ones = pinDistance % 10;
                const increment = value > 0 ? 1 : -1;

                if (Math.abs(value) === 100) { hundreds = (hundreds + increment + 10) % 10; } 
                else if (Math.abs(value) === 10) { tens = (tens + increment + 10) % 10; } 
                else if (Math.abs(value) === 1) { ones = (ones + increment + 10) % 10; }
                
                pinDistance = hundreds * 100 + tens * 10 + ones;
            }

            // Clamp the final value
            if (pinDistance < 0) { pinDistance = 0; } 
            else if (pinDistance > 999) { pinDistance = 999; }

            updateDtpDisplay();
        });
    });

    dtpClearBtn.addEventListener('click', () => {
        pinDistance = 0;
        updateDtpDisplay();
    });

    // REVISED: DTP Reset Button Listener (now also resets stopwatch total)
    if (dtpResetBtn) {
        dtpResetBtn.addEventListener('click', () => {
            // 1. Reset Elevation slider and bonus
            elevationSlider.value = 0;
            extraElevation = 0;

            // 2. Reset Lie Sliders
            const uphillDownhillLieSlider = document.getElementById('uphillDownhillLie');
            const feetLieSlider = document.getElementById('feetLie');
            uphillDownhillLieSlider.value = 0;
            feetLieSlider.value = 0;

            // 3. NEW: Reset Stopwatch Total Break
            stopwatchTotalValue = 0;
            stopwatchAdditionCount = 0;
            stopwatchAdditions = [];
            renderStopwatchAdditions();
            updateStopwatchUIForMode(); // This will reset the display correctly

            // 4. Manually trigger input events to update UI and recalculate everything
            elevationSlider.dispatchEvent(new Event('input', { bubbles: true }));
            uphillDownhillLieSlider.dispatchEvent(new Event('input', { bubbles: true }));
            feetLieSlider.dispatchEvent(new Event('input', {
                bubbles: true
            }));
            dtpResetBtn.classList.add('reset-confirmed'); // Turn button green
            dtpDisplay.classList.add('dtp-reset-confirmed'); // Turn DTP display green
        });
    }

    // --- NEW: POWER ADJUSTMENT LISTENERS ---
    powerDecrementBtn.addEventListener('click', () => {
        powerPercent--;
        if (powerPercent < 1) powerPercent = 1; // Prevent going below 1%
        powerPercentDisplay.textContent = `${powerPercent}%`;
        savePowerSetting();
        calculateWind();
    });

    powerIncrementBtn.addEventListener('click', () => {
        powerPercent++;
        powerPercentDisplay.textContent = `${powerPercent}%`;
        savePowerSetting();
        calculateWind();
    });
    // NEW: Settings Modal Tab-Switching Logic
    const settingsTabContainer = document.getElementById('settingsTabContainer');
    if (settingsTabContainer) {
        settingsTabContainer.addEventListener('click', (e) => {
            if (e.target.matches('.history-tab-button')) {
                const targetPanelId = e.target.dataset.target;
                // Deactivate all tabs and panels within the settings modal
                settingsTabContainer.querySelectorAll('.history-tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('#settingsPanelContainer > div').forEach(panel => panel.classList.add('hidden'));
                // Activate the clicked one
                if (targetPanelId === 'settings-panel-ranges') populateSettingsModal(); // Repopulate on tab click
                if (targetPanelId === 'settings-panel-calculator') updateDtpModeButtons(); // Update button state on tab click


                e.target.classList.add('active');
                // NEW: If the chart tab is clicked, render the chart.
                if (targetPanelId === 'settings-panel-range-chart') {
                    // Reset filter buttons to 'All' and render the full chart
                    const currentFilter = document.querySelector('#rangeChartFilterContainer .active')?.dataset.filter || 'all';
                    renderClubRangeChart(currentFilter);
                } else if (targetPanelId === 'settings-panel-ranges') {
                    document.querySelectorAll('#rangeChartFilterContainer .range-chart-filter-btn').forEach(btn => btn.classList.remove('active'));
                    document.querySelector('#rangeChartFilterContainer .range-chart-filter-btn[data-filter="all"]').classList.add('active');
                    if (clubRangeChart) renderClubRangeChart();
                }

                document.getElementById(targetPanelId).classList.remove('hidden');

                // NEW: Handle player settings tab
                if (targetPanelId === 'settings-panel-player') {
                    updatePlayerHandednessButtons();
                }

                // NEW: Handle stopwatch cues tab
                if (targetPanelId === 'settings-panel-stopwatch') {
                    loadStopwatchCues();
                    populateStopwatchCuesModal();
                }
                // NEW: Handle lie cues population
                if (targetPanelId === 'settings-panel-stopwatch') {
                    loadLieCues();
                    populateLieCuesModal();
                }

            }
        });
    }

    // NEW: Base Roll Settings Listeners (Event Delegation)
    if (baseRollSettingsContainer) {
        baseRollSettingsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.roll-increment-btn');
            if (button) {
                changeInputValue(button.dataset.target, parseFloat(button.dataset.step));
            }
        });
    }

    // NEW: Base Roll Settings Listeners
    if (baseRollSettingsContainer) {
        baseRollSettingsContainer.addEventListener('change', (e) => {
            if (e.target.matches('.base-roll-input')) {
                const clubKey = e.target.id.replace('base-roll-input-', '');
                const newValue = parseFloat(e.target.value);
                if (!isNaN(newValue) && clubPresets[clubKey]) {
                    clubPresets[clubKey].r = newValue;
                    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(clubPresets));
                    applyClubPreset(activeClubKey); // Re-apply to update main UI if the active club was changed
                }
            }
        });
    }

    const resetBaseRollDefaultsButton = document.getElementById('resetBaseRollDefaultsButton');
    if (resetBaseRollDefaultsButton) {
        resetBaseRollDefaultsButton.addEventListener('click', () => {
            Object.keys(clubPresets).forEach(clubKey => {
                clubPresets[clubKey].r = defaultClubPresets[clubKey].r;
            });
            localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(clubPresets));
            populateBaseRollSettings(); // Refresh the modal UI
            applyClubPreset(activeClubKey); // Refresh the main UI
        });
    }

    // NEW: Handler for changes in the Roll Settings modal tab
    function handleRollSettingsChange(e) {
        if (e.target.matches('.settings-input')) {
            const settingId = e.target.id.replace('settings-', ''); // e.g., 'greenSpeed'
            const mainInput = document.getElementById(settingId + 'Input') || document.getElementById(settingId);
            if (mainInput) {
                mainInput.value = e.target.value;
                // Trigger the save and recalculate logic
                mainInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    }

    // NEW: Reset button for Roll Settings
    const resetRollDefaultsButton = document.getElementById('resetRollDefaultsButton');
    if (resetRollDefaultsButton) {
        resetRollDefaultsButton.addEventListener('click', () => {
            localStorage.removeItem(ROLL_SETTINGS_KEY); // Clear saved custom settings
            loadRollSettings(); // Reload the defaults into the main UI
            populateRollSettings(); // Update the settings modal UI to reflect the change
        });
    }
    // --- HISTORY MODAL LISTENERS (NEW) ---
    const showHistoryButton = document.getElementById('showHistoryButton');
    const historyModal = document.getElementById('historyModal');
    const closeHistoryModalButton = document.getElementById('closeHistoryModalButton');
    const exportHistoryButton = document.getElementById('exportHistoryButton');

    if (showHistoryButton && historyModal && closeHistoryModalButton) {
        // REVISED: The button now just opens the modal. The tab logic handles the content.
        showHistoryButton.addEventListener('click', () => {
            // 1. Simply make the modal visible.
            historyModal.classList.remove('hidden');

            // 2. Programmatically click the first tab to ensure the modal opens in a clean, default state.
            const firstTab = document.querySelector('.main-history-tab-button[data-target="panel-multiplier-history"]');
            if (firstTab) {
                // NEW: Clear the performance chart dropdown so it can be re-snapped on the next open.
                performanceChartClubSelect.innerHTML = '';
                firstTab.click();
            }
        });
        closeHistoryModalButton.addEventListener('click', () => historyModal.classList.add('hidden'));
        historyModal.addEventListener('click', (e) => { 
            if (e.target === historyModal) {
                historyModal.classList.add('hidden');
                // Manually destroy any charts that might be active
                const chartsToDestroy = Chart.instances;
                Object.values(chartsToDestroy).forEach(chart => { if(chart.canvas.id.startsWith('history-chart')) chart.destroy(); });
            }
        });
    }

    if (exportHistoryButton) {
        exportHistoryButton.addEventListener('click', exportHistoryData);
    }

    // --- NEW: PERFORMANCE CHART LISTENER ---
    if (performanceChartClubSelect) {
        performanceChartClubSelect.addEventListener('change', renderPerformanceTrendChart);
    }

    // --- RESTRUCTURED INITIALIZATION ---
    // All event listeners are now attached. Now, we can safely load data and initialize the UI.

    // Set initial UI states that don't depend on loaded data
    updateSafetyLockButtonState();
    updateAnalysisLockButtonState();
    setCalculationInputsDisabled(false);
    
    // NEW: Load the green grid multiplier from storage, or use default
    const savedGridMultiplier = localStorage.getItem(GREEN_GRID_MULTIPLIER_KEY);
    if (savedGridMultiplier) {
        document.getElementById('greenGridsMultiplier').value = savedGridMultiplier;
    } else {
        document.getElementById('greenGridsMultiplier').value = '0.93';
    }

    // Load all data from localStorage
    loadPresets();
    loadGreenFirmnessSettings(); // NEW
    loadAnalysisSettings();
    loadRollSettings(); // NEW: Load roll settings
    loadPowerSetting(); // NEW
    loadClubRanges(); // NEW
    loadStopwatchSettings(); // NEW
    loadActiveClubs(); // NEW
    loadShots();
    loadCupSuggestionSettings(); // NEW
    loadStopwatchCues(); // NEW
    loadDataSourceDisplays(); // NEW
    loadLieCues(); // NEW

    // NEW: Load DTP counter mode
    const savedDtpMode = localStorage.getItem(DTP_COUNTER_MODE_KEY);
    if (savedDtpMode) {
        dtpCounterMode = savedDtpMode;
    }

    // NEW: Load Player Handedness
    const savedHandedness = localStorage.getItem(PLAYER_HANDEDNESS_KEY);
    if (savedHandedness) {
        playerHandedness = savedHandedness;
    }
    const playerHandednessContainer = document.getElementById('playerHandednessContainer');
    const updatePlayerHandednessButtons = () => {
        playerHandednessContainer.querySelectorAll('.dtp-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.hand === playerHandedness);
        });
    };
    playerHandednessContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.dtp-mode-btn');
        if (!button) return;
        playerHandedness = button.dataset.hand;
        localStorage.setItem(PLAYER_HANDEDNESS_KEY, playerHandedness);
        updateUiForHandedness(); // NEW: Update UI when handedness changes
        updatePlayerHandednessButtons();
    });

    // NEW: Load notes into textarea on startup
    const savedNotes = localStorage.getItem(SESSION_NOTES_KEY);
    if (savedNotes && notesTextarea) {
        notesTextarea.value = savedNotes;
    }

    // NEW: Populate roll settings on initial load
    if (document.getElementById('settings-panel-roll')) {
        populateRollSettings();
    }

    // NEW: Set initial DTP display
    dtpDisplay.textContent = pinDistance;

    // NEW: Set initial lie display values
    updateLieDisplay(uphillDownhillLieSlider, uphillDownhillLieDisplay, uphillDownhillLieValueDisplay);
    updateLieDisplay(feetLieSlider, feetLieDisplay, feetLieValueDisplay);

    // --- NEW: STOPWATCH DOM ELEMENTS (must be declared before updateStopwatchUIForMode call) ---
    const stopwatchDisplay = document.getElementById('stopwatchDisplay');
    const stopwatchStartStopBtn = document.getElementById('stopwatchStartStop');
    const stopwatchCups = document.getElementById('stopwatchCups');
    const stopwatchHalveBtn = document.getElementById('stopwatchHalveBtn');
    const stopwatchResultContainer = document.getElementById('stopwatchResultContainer');
    const stopwatchAddBtn = document.getElementById('stopwatchAddBtn');
    const stopwatchClearTotalBtn = document.getElementById('stopwatchClearTotal');
    const stopwatchManualAddBtn = document.getElementById('stopwatchManualAddBtn');
    const stopwatchManualSubtractBtn = document.getElementById('stopwatchManualSubtractBtn');

    updateStopwatchUIForMode(); // NEW: Set initial stopwatch UI
    // NEW: Listeners to remove the 'reset-confirmed' state when sliders are adjusted
    const slidersToMonitor = [elevationSlider, uphillDownhillLieSlider, feetLieSlider];
    slidersToMonitor.forEach(slider => {
        if (slider) {
            slider.addEventListener('input', () => {
                dtpResetBtn.classList.remove('reset-confirmed'); // Revert button color
                dtpDisplay.classList.remove('dtp-reset-confirmed'); // Revert DTP display color
            });
        }
    });


    // Apply the default club preset, which triggers the first calculation
    applyClubPreset('7');
    // updateClubButtonActiveStyles(); // This is now called inside applyClubPreset

    // NEW: Set initial UI labels based on loaded handedness
    updateUiForHandedness();

    // --- NEW: Add click-to-edit functionality for multiplier values ---
    const multiplierValueSpans = [
        { span: document.getElementById('headwindMultiplierValue'), slider: headwindSlider },
        { span: document.getElementById('tailwindMultiplierValue'), slider: tailwindSlider },
        { span: document.getElementById('assistCrosswindMultiplierValue'), slider: assistCrosswindSlider },
        { span: document.getElementById('opposedCrosswindMultiplierValue'), slider: opposedCrosswindSlider }
    ];

    multiplierValueSpans.forEach(({ span, slider }) => {
        if (span && slider) {
            span.addEventListener('click', () => makeMultiplierEditable(span, slider));
        }
    });

    // --- NEW: Add click-to-edit functionality for power percentage ---
    if (powerPercentDisplay) {
        powerPercentDisplay.addEventListener('click', () => makePowerEditable(powerPercentDisplay));
    }

// --- STOPWATCH FUNCTIONS ---

/**
 * NEW: Plays a short beep sound for UI feedback.
 * Updated to support variable frequency and type for "Do-Re-Mi" feedback.
 */
function playBeep(frequency = 1046.5, type = 'sine', duration = 0.1) {
    // NEW: Check if the beep is enabled by the user
    if (!stopwatchBeepEnabled) return;

    // Initialize AudioContext on the first user interaction to comply with browser policies
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.");
            return; // Can't play sound
        }
    }

    // Proactively resume the AudioContext if it's suspended (for iOS/iPadOS reliability)
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration); 
}

function updateStopwatch() {
    const elapsedTime = Date.now() - stopwatchStartTime;
    if (elapsedTime >= 30000) { // Stop at 30 seconds
        stopStopwatch();
        stopwatchDisplay.textContent = '30.00s';
    } else {
        stopwatchDisplay.textContent = (elapsedTime / 1000).toFixed(2) + 's';
    }
}

/**
 * NEW: Updates the stopwatch UI elements based on the current mode ('green' or 'lie').
 */
function updateStopwatchUIForMode() {
    const modeLabel = document.getElementById('stopwatchModeLabel');
    const modeLabelLie = document.getElementById('stopwatchModeLabelLie'); // NEW
    const greenModeContainer = document.getElementById('stopwatchGreenControlsContainer');
    const lieModeContainer = document.getElementById('stopwatchLieControlsContainer');
    const additionsContainer = document.getElementById('stopwatchAdditionsContainer');
    const lieTargetLabel = document.getElementById('lieTargetLabel');

    // NEW: Get the preview pane element
    const suggestionPreview = document.getElementById('cupSuggestionPreview');

    if (stopwatchMode === 'green') {
        if (modeLabel) modeLabel.textContent = 'Green';
        modeLabel.textContent = 'Green';
        modeLabel.className = 'text-grass-green';
        // Show Green mode UI, hide Lie mode UI
        greenModeContainer.classList.remove('hidden');
        lieModeContainer.classList.add('hidden');
        additionsContainer.classList.remove('hidden');
        
        // --- NEW: Trust Score Display Logic ---
        const totalDisplay = document.getElementById('stopwatchTotalDisplay');
        
        if (stopwatchAdditionCount === 0) {
            totalDisplay.textContent = '0';
            totalDisplay.className = 'text-xl font-bold text-white'; // Reset style
            // NEW: Update preview
            if (suggestionPreview) {
                suggestionPreview.textContent = '0';
                suggestionPreview.className = 'text-xl font-bold text-white ml-2';
            }
        } else {
            // --- NEW "Lock-In" Logic ---
            // 1. Calculate overall trust score across ALL additions (for the percentage display)
            let totalWeightedTrust = 0;
            let totalWeightForAll = 0;
            stopwatchAdditions.forEach(addition => {
                // NEW: Use Square Root Weighting to reduce the dominance of large breaks.
                const weight = Math.sqrt(Math.abs(addition.value));
                totalWeightedTrust += addition.trustScore * weight;
                totalWeightForAll += weight;
            });
            const finalTrustScore = totalWeightForAll > 0 ? totalWeightedTrust / totalWeightForAll : 0;

            // --- NEW HYBRID LOGIC: Accumulate & Dampen ---
            // 1. Sums errors from uncertain (yellow/red) reads.
            // 2. Dampens that sum with confidence from certain (blue) reads.
            let sumOfWeightedNonBlueErrors = 0;
            let sumOfBlueWeights = 0;

            stopwatchAdditions.forEach(addition => {
                const weight = Math.sqrt(Math.abs(addition.value));
                if (addition.trustScore >= cupSuggestionSettings.confidenceThreshold) { // Blue, confident read
                    sumOfBlueWeights += weight;
                } else { // Yellow or Red, uncertain read
                    if (typeof addition.potentialCupError !== 'undefined') {
                        sumOfWeightedNonBlueErrors += addition.potentialCupError * weight;
                    }
                }
            });

            // The "confidence divisor" starts at 1 and increases with the weight of each confident (blue) read.
            const confidenceDivisor = 1 + sumOfBlueWeights;
            const finalError = confidenceDivisor > 0 ? sumOfWeightedNonBlueErrors / confidenceDivisor : sumOfWeightedNonBlueErrors;

            // Apply a leeway factor from settings to make arrow thresholds more forgiving.
            const leewayError = finalError * cupSuggestionSettings.leewayFactor;

            // Dynamic Arrow Logic using Math.round() on the adjusted error.
            const absLeewayError = Math.abs(leewayError);
            let numberOfArrows = 0;
            if (absLeewayError >= cupSuggestionSettings.arrowThreshold) {
                // If the error passes the threshold, guarantee at least one arrow. Then use rounding for scaling.
                numberOfArrows = Math.max(1, Math.round(absLeewayError));
            }

            // Cap at 4 arrows
            numberOfArrows = Math.min(numberOfArrows, 4);

            let biasIcon = '';
            if (numberOfArrows === 0) { // Show checkmark if there's no significant error suggestion
                biasIcon = ' <svg class="inline-block w-4 h-4 -mt-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>';
            } else {
                const arrowChar = finalError > 0 ? '▲' : '▼'; // A positive error means leaning towards MORE break (UP arrow).
                biasIcon = ` ${arrowChar.repeat(numberOfArrows)}`;
            }

            // The color is still determined by the overall trust score.
            let trustColorClass = 'text-white';
            if (finalTrustScore > 75) {
                trustColorClass = 'text-fairway-blue';
            } else if (finalTrustScore > 50) {
                trustColorClass = 'text-bunker-yellow';
            } else {
                trustColorClass = 'text-red-500';
            }

            // 4. Construct and apply the final string and styles
            const totalValueString = stopwatchTotalValue.toFixed(1).replace(/\.0$/, '');
            const countSpan = `<span class="text-base font-normal text-gray-400 ml-1">${stopwatchAdditionCount}</span>`;
            const trustScoreSpan = `<span class="text-sm font-semibold">${Math.round(finalTrustScore)}%</span>`;
            const finalHTML = `${totalValueString}&nbsp;${trustScoreSpan}${biasIcon}${countSpan}`;

            totalDisplay.innerHTML = finalHTML;
            totalDisplay.className = `text-xl font-bold ${trustColorClass} flex items-baseline`;

            // NEW: Update preview display
            if (suggestionPreview) {
                suggestionPreview.innerHTML = finalHTML;
                suggestionPreview.className = `text-xl font-bold ${trustColorClass} ml-2`;
            }
        }

        stopwatchAddBtn.textContent = 'Add';
    } else { // 'lie' mode
        if (modeLabelLie) modeLabelLie.textContent = 'Lie'; // NEW

        // Hide Green mode UI, show Lie mode UI
        greenModeContainer.classList.add('hidden');
        lieModeContainer.classList.remove('hidden');
        lieModeContainer.classList.add('flex'); // Make sure it's a flex container
        additionsContainer.classList.add('hidden');

        stopwatchAddBtn.textContent = 'Apply';

        // Update lie target label
        lieTargetLabel.textContent = lieTargetSlider === 'uphillDownhillLie' ? 'U/D Lie' : 'A/B Feet'; // This line was duplicated, removing one.
    }

    // Reset the result displays when mode changes
    stopwatchCups.classList.add('hidden');
    // In lie mode, the result is shown in the timer area, not the total area.
    document.getElementById('stopwatchLieResultDisplayLie').textContent = '---'; // NEW: Reset lie result display
    if (stopwatchMode === 'lie') {
        stopwatchCups.textContent = '---';
    }
    document.getElementById('stopwatchResultViz').classList.add('hidden');
}

function startStopwatch() {
    if (!stopwatchRunning) {
        // NEW: Explicitly reset display to 0.00s on start, making the reset button's primary function part of the start action.
        // Also reset the last value so it can't be accidentally added again.
        lastStopwatchValue = 0;

        stopwatchResultActions.classList.add('hidden'); // Hide the result actions group on start
        document.getElementById('stopwatchResultViz').classList.add('hidden'); // NEW: Hide the visualization
        stopwatchAddBtn.disabled = true; // Disable the Add button on start

        if (stopwatchDisplay.textContent !== '0.00s') {
            stopwatchDisplay.textContent = '0.00s';
        }
        
        stopwatchStartTime = Date.now();
        stopwatchInterval = setInterval(updateStopwatch, 10); // Update every 10ms
        stopwatchRunning = true;
        stopwatchStartStopBtn.textContent = 'Stop';
        stopwatchStartStopBtn.classList.replace('bg-grass-green', 'bg-red-500');
        stopwatchStartStopBtn.classList.add('text-white');
    }
}

function stopStopwatch() {
    if (stopwatchRunning) {
        clearInterval(stopwatchInterval);
        const finalTimeMs = Date.now() - stopwatchStartTime;

        // --- NEW: Ignore accidental double-presses ---
        // If the time is very short (e.g., under 10ms), it's not a valid reading.
        // Just stop the timer and reset the UI without trying to find a cue.
        if (finalTimeMs < 10) {
            stopwatchDisplay.textContent = '0.00s';
            stopwatchRunning = false;
            stopwatchStartStopBtn.textContent = 'Start';
            stopwatchStartStopBtn.classList.replace('bg-red-500', 'bg-grass-green');
            stopwatchStartStopBtn.classList.remove('text-white');
            stopwatchAddBtn.disabled = true;
            stopwatchCups.classList.add('hidden');
            document.getElementById('stopwatchResultViz').classList.add('hidden');
            return; // Exit the function early
        }

        // --- NEW: Rounding on Stop Logic ---
        // 1. Round the final time to the nearest 10 milliseconds (0.01 seconds).
        const roundedTimeMs = Math.round(finalTimeMs / 10) * 10;

        // 2. Update the display with the rounded value.
        stopwatchDisplay.textContent = (roundedTimeMs / 1000).toFixed(2) + 's';

        stopwatchRunning = false;
        stopwatchStartStopBtn.textContent = 'Start';
        stopwatchStartStopBtn.classList.replace('bg-red-500', 'bg-grass-green');
        stopwatchStartStopBtn.classList.remove('text-white');

        // NEW: Select the correct cues based on the current mode
        const cuesToUse = stopwatchMode === 'green' ? stopwatchCues : lieCues;

        // 3. Check for cues using the same rounded value.
        let cueFound = false;
        // REVISED: Use a for loop with index to find adjacent cues for potential error calculation
        for (let i = 0; i < cuesToUse.length; i++) {
            const cue = cuesToUse[i];
            // NEW: Hide all result elements by default before checking
            stopwatchCups.classList.add('hidden'); 
            document.getElementById('stopwatchResultViz').classList.add('hidden');

            // A cue is active only if it's enabled in the settings, regardless of mode.
            if (cue.enabled && roundedTimeMs >= cue.min * 1000 && roundedTimeMs <= cue.max * 1000) {
                stopwatchCups.textContent = stopwatchMode === 'green' ? `${cue.text}` : cue.text;
                lastStopwatchValue = cue.value;
                originalStopwatchValue = cue.value;

                // --- REVISED: Calculate trust score, bias, and potential cup error ---
                const cueDuration = (cue.max - cue.min) * 1000;
                if (cueDuration > 0) {
                    const midpoint = (cue.min * 1000) + (cueDuration / 2);
                    const halfWidth = cueDuration / 2;
                    const distanceFromMidpoint = Math.abs(roundedTimeMs - midpoint);
                    
                    lastStopwatchTrustScore = Math.max(0, 100 - (distanceFromMidpoint / halfWidth) * 100);
                    lastStopwatchBias = (midpoint - roundedTimeMs) / halfWidth;

                    // Potential Cup Error Calculation
                    let cupDifference = 0;
                    // A positive bias means the time was FASTER, leaning towards a HIGHER cup value (next highest break).
                    if (lastStopwatchBias > 0) {
                        if (i > 0) { // There is a faster cue (higher cup value) to compare to.
                            const fasterCue = cuesToUse[i - 1];
                            if (fasterCue && fasterCue.enabled) {
                                cupDifference = Math.abs(fasterCue.value - cue.value);
                            }
                        } else { // This is the fastest cue (i=0). Assume the next interval's difference as a logical default.
                            const slowerCue = cuesToUse[i + 1];
                            if (slowerCue && slowerCue.enabled) {
                                cupDifference = Math.abs(slowerCue.value - cue.value);
                            }
                        }
                    // A negative bias means the time was SLOWER, leaning towards a LOWER cup value.
                    } else if (lastStopwatchBias < 0) {
                        if (i < cuesToUse.length - 1) { // There is a slower cue to compare to.
                            const slowerCue = cuesToUse[i + 1];
                            if (slowerCue && slowerCue.enabled) {
                                cupDifference = Math.abs(slowerCue.value - cue.value);
                            }
                        } else { // This is the slowest cue. Assume the previous interval's difference.
                            const fasterCue = cuesToUse[i - 1];
                            if (fasterCue && fasterCue.enabled) {
                                cupDifference = Math.abs(fasterCue.value - cue.value);
                            }
                        }
                    }
                    lastPotentialCupError = lastStopwatchBias * cupDifference;
                } else {
                    lastStopwatchTrustScore = 100;
                    lastStopwatchBias = 0;
                    lastPotentialCupError = 0;
                }

                isStopwatchValueHalved = false; // NEW: Reset toggle state
                renderSingleVisualization(document.getElementById('stopwatchResultViz'), roundedTimeMs / 1000, cue); // REVISED: Use rounded time for visualization
                cueFound = true;
                // NEW: Update the Lie Result display immediately
                if (stopwatchMode === 'lie') {
                    // FIX: Display the numeric value with a percentage, not the text label.
                    document.getElementById('stopwatchLieResultDisplayLie').textContent = `${cue.value}%`;
                }
                stopwatchCups.classList.remove('hidden'); // NEW: Show the cup display
                break; // Stop after finding the first match
            }
        }
        
        stopwatchResultActions.classList.toggle('hidden', !cueFound); // Show/hide the result actions group
        stopwatchAddBtn.disabled = !cueFound; // Enable/disable the Add button
        // Reset the Halve button's appearance on a new stop event if a cue was found
        if (cueFound) { stopwatchHalveBtn.textContent = 'Halve'; stopwatchHalveBtn.classList.replace('text-bunker-yellow', 'text-fairway-blue'); }
    }
}

// REVISED: Use mousedown and touchstart for instantaneous feedback
const handleStopwatchPress = (event) => {
    // Prevent the browser from also firing a 'click' event which would double-trigger the logic
    event.preventDefault();
    // Start = C6 (1046.5), Stop = D6 (1174.7)
    const freq = stopwatchRunning ? 1174.7 : 1046.5;
    playBeep(freq, 'sine', 0.1);
    stopwatchRunning ? stopStopwatch() : startStopwatch();
};

stopwatchStartStopBtn.addEventListener('mousedown', handleStopwatchPress);
stopwatchStartStopBtn.addEventListener('touchstart', handleStopwatchPress, { passive: false });

// REVISED: Use mousedown/touchstart for the "Add" button for instantaneous feedback
const handleStopwatchAddPress = (event) => {
    // Prevent the browser from also firing a 'click' event which would double-trigger the logic
    event.preventDefault();
    // Add = E6 (1318.5), using triangle wave for distinction
    playBeep(1318.5, 'triangle', 0.08); 
    if (lastStopwatchValue === null && originalStopwatchValue === null) return; // Do nothing if there's no value to add

    if (stopwatchMode === 'green') {
        // --- GREEN MODE: Accumulate break ---
        const timeString = stopwatchDisplay.textContent.replace('s', '');
        const timeValue = parseFloat(timeString);

        let correspondingCue = null;
        for (const cue of stopwatchCues) {
            if (cue.enabled && timeValue >= cue.min && timeValue <= cue.max) {
                correspondingCue = cue;
                break;
            }
        }

        stopwatchTotalValue += lastStopwatchValue;
        stopwatchAdditionCount++;
        stopwatchAdditions.push({ 
            value: lastStopwatchValue, 
            time: timeValue, 
            wasHalved: isStopwatchValueHalved, 
            cueMin: correspondingCue?.min, 
            cueMax: correspondingCue?.max,
            trustScore: lastStopwatchTrustScore,
            bias: lastStopwatchBias,
            potentialCupError: lastPotentialCupError // NEW
        });

        renderStopwatchAdditions();

    } else {
        // --- LIE MODE: Apply percentage to slider ---
        const lieValue = lastStopwatchValue * liePolarity; // NEW: Apply polarity
        const slider = document.getElementById(lieTargetSlider); // Use the target variable
        slider.value = lieValue.toFixed(1);
        slider.dispatchEvent(new Event('input', { bubbles: true })); // Trigger UI update and recalculation
    }

    // Always update the total display after an addition
    updateStopwatchUIForMode();

    // NEW: If the reset button was green, turn it back to blue.
    if (dtpResetBtn) dtpResetBtn.classList.remove('reset-confirmed');
};

/**
 * NEW: Renders a single stopwatch visualization (line and dot) into a container.
 * @param {HTMLElement} container - The element to render the visualization into.
 * @param {number} time - The time value of the stop.
 * @param {object} cue - The cue object containing min and max times.
 */
function renderSingleVisualization(container, time, cue) {
    // REVISED: Only clear the container if it's the main result viz.
    // This prevents clearing the text from the list items.
    if (container.id === 'stopwatchResultViz') {
        container.innerHTML = '';
    }
    container.classList.remove('hidden'); // Make it visible

    const cueDuration = cue.max - cue.min;
    if (cueDuration <= 0) return;

    const timeIntoCue = time - cue.min;
    const percentage = Math.max(0, Math.min(100, (timeIntoCue / cueDuration) * 100));

    // Create the line
    const dotColorClass = getStopwatchDotColor(percentage);
    const lineDiv = document.createElement('div');
    lineDiv.className = `stopwatch-cue-line ${dotColorClass}`;
    container.appendChild(lineDiv);

    // Create and position the dot
    const dotDiv = document.createElement('div');
    dotDiv.className = `stopwatch-time-dot ${dotColorClass}`;
    dotDiv.style.left = `${percentage}%`;
    container.appendChild(dotDiv);

    // NEW: Conditionally add min/max labels ONLY for the main result visualization.
    if (container.id === 'stopwatchResultViz') {
        const minLabel = document.createElement('span');
        minLabel.className = 'stopwatch-cue-label min';
        minLabel.textContent = cue.min.toFixed(2);
        container.appendChild(minLabel);

        const maxLabel = document.createElement('span');
        maxLabel.className = 'stopwatch-cue-label max';
        maxLabel.textContent = cue.max.toFixed(2);
        container.appendChild(maxLabel);
    }
}
/**
 * NEW: Determines the color of the stopwatch dot based on its percentage along the cue.
 * @param {number} percentage - The position of the stop, from 0 to 100.
 * @returns {string} A Tailwind CSS background color class.
 */
function getStopwatchDotColor(percentage) {
    // Blue for the center 25% (Trust > 75%)
    if (percentage >= 37.5 && percentage <= 62.5) {
        return 'bg-fairway-blue';
    }
    // Red for the outer 25% on each side (Trust < 50%)
    if (percentage < 25 || percentage > 75) {
        return 'bg-red-500';
    }
    // Yellow for everything in between (Trust 50-75%)
    return 'bg-bunker-yellow';
}



stopwatchAddBtn.addEventListener('mousedown', handleStopwatchAddPress);
stopwatchAddBtn.addEventListener('touchstart', handleStopwatchAddPress, { passive: false });

// REVISED: Event listener for the "Halve" button to act as a toggle
stopwatchHalveBtn.addEventListener('click', () => {
    if (originalStopwatchValue !== 0) {
        if (!isStopwatchValueHalved) {
            // Halve the value
            lastStopwatchValue = originalStopwatchValue / 2;
            stopwatchHalveBtn.textContent = 'Full'; // REVISED: More intuitive label
            stopwatchHalveBtn.classList.replace('text-fairway-blue', 'text-bunker-yellow');
        } else {
            // Restore the original value
            lastStopwatchValue = originalStopwatchValue;
            stopwatchHalveBtn.textContent = 'Halve';
            stopwatchHalveBtn.classList.replace('text-bunker-yellow', 'text-fairway-blue');
        }
        isStopwatchValueHalved = !isStopwatchValueHalved; // Flip the state
        // Update the display text
        const suffix = stopwatchMode === 'green' ? ' cups' : '%';
        stopwatchCups.textContent = `${lastStopwatchValue.toFixed(2).replace(/\.00$/, '').replace(/\.50$/, '.5')}${suffix}`;
    }
});

// NEW: Event listener for the "Clear Total" button
stopwatchClearTotalBtn.addEventListener('click', () => {
    stopwatchTotalValue = 0;
    stopwatchAdditionCount = 0; // Reset the counter
    stopwatchAdditions = []; // Clear the data array
    renderStopwatchAdditions(); // Clear the visual display
    updateStopwatchUIForMode(); // Recalculate and reset the display
});

// NEW: Event listeners for manual cup adjustments
if (stopwatchManualAddBtn) {
    stopwatchManualAddBtn.addEventListener('click', () => {
        stopwatchTotalValue += 1;
        stopwatchAdditionCount++;
        // Add with 100% trust and 0 bias as it's a manual entry
        stopwatchAdditions.push({ value: 1, time: 0, wasHalved: false, cueMin: null, cueMax: null, trustScore: 100, bias: 0 });
        renderStopwatchAdditions();
        updateStopwatchUIForMode();

        // NEW: If the reset button was green, turn it back to blue.
        if (dtpResetBtn) dtpResetBtn.classList.remove('reset-confirmed');
    });
}
if (stopwatchManualSubtractBtn) {
    stopwatchManualSubtractBtn.addEventListener('click', () => {
        stopwatchTotalValue -= 1;
        stopwatchAdditionCount++;
        stopwatchAdditions.push({ value: -1, time: 0, wasHalved: false, cueMin: null, cueMax: null, trustScore: 100, bias: 0 });
        renderStopwatchAdditions();
        updateStopwatchUIForMode();

        // NEW: If the reset button was green, turn it back to blue.
        if (dtpResetBtn) dtpResetBtn.classList.remove('reset-confirmed');
    });
}

/**
 * NEW: Deletes a stopwatch addition by its index and updates the UI.
 * @param {number} index - The index of the addition to delete.
 */
function deleteStopwatchAddition(index) {
    if (isNaN(index) || index < 0 || index >= stopwatchAdditions.length) {
        return; // Invalid index
    }

    // Remove the item from the array
    stopwatchAdditions.splice(index, 1);

    // Recalculate total and count
    stopwatchTotalValue = stopwatchAdditions.reduce((total, item) => total + item.value, 0);
    stopwatchAdditionCount = stopwatchAdditions.length;

    // Re-render the list
    renderStopwatchAdditions();
    // Update the total display
    updateStopwatchUIForMode();
}

/**
 * NEW: Renders the horizontal list of added stopwatch values.
 */
function renderStopwatchAdditions() {
    const mainListContainer = document.getElementById('stopwatchAdditionsList');
    const previewListContainer = document.getElementById('cupSuggestionPreviewAdditions');

    // An array of the containers that exist
    const containers = [mainListContainer, previewListContainer].filter(c => c !== null);
    
    // Clear all existing containers
    containers.forEach(c => c.innerHTML = '');

    if (containers.length === 0) return;

    stopwatchAdditions.forEach((addition, index) => {
        
        // Create a new item for each container to avoid cloning issues with event listeners
        containers.forEach(container => {
            const itemContainer = document.createElement('div');
            itemContainer.className = 'stopwatch-addition-item';

            const textSpan = document.createElement('span');
            textSpan.className = 'font-mono font-medium';
            textSpan.style.fontSize = '0.8rem';
            const valueColor = addition.wasHalved ? 'text-bunker-yellow' : 'text-white';
            textSpan.innerHTML = `<span class="${valueColor}">${addition.value.toFixed(1).replace(/\.0$/, '')}</span> <span class="text-gray-500">${addition.time.toFixed(2)}</span>`;
            itemContainer.appendChild(textSpan);

            if (addition.time !== null && addition.cueMin !== null && addition.cueMax !== null) {
                renderSingleVisualization(itemContainer, addition.time, { min: addition.cueMin, max: addition.cueMax });
            }

            // ONLY add listeners if it's the main container
            if (container.id === 'stopwatchAdditionsList') {
                let holdTimer;
                const startHold = () => {
                    clearTimeout(holdTimer);
                    holdTimer = setTimeout(() => {
                        const isConfirmed = window.confirm(`Delete this entry? (${addition.value.toFixed(1)} cups at ${addition.time.toFixed(2)}s)`);
                        if (isConfirmed) {
                            deleteStopwatchAddition(index);
                        }
                    }, 750);
                };
                const cancelHold = () => { clearTimeout(holdTimer); };

                itemContainer.addEventListener('mousedown', startHold);
                itemContainer.addEventListener('touchstart', startHold, { passive: true });
                ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(evt => itemContainer.addEventListener(evt, cancelHold));
            }
            
            container.appendChild(itemContainer);
        });
    });
}
/**
 * NEW: Loads stopwatch settings (like beep enabled) from localStorage.
 */
function loadStopwatchSettings() {
    try {
        const storedSettings = localStorage.getItem(STOPWATCH_SETTINGS_KEY);
        if (storedSettings) {
            const settings = JSON.parse(storedSettings);
            // Default to true if the property is missing from older backups
            stopwatchBeepEnabled = settings.beepEnabled ?? true;
        }
        // Update the checkbox in the UI
        document.getElementById('stopwatchBeepToggle').checked = stopwatchBeepEnabled;
    } catch (error) {
        console.error("Error loading stopwatch settings, using defaults.", error);
        stopwatchBeepEnabled = true;
    }
}

/**
 * NEW: Saves stopwatch settings to localStorage.
 */
function saveStopwatchSettings() {
    const settings = { beepEnabled: stopwatchBeepEnabled };
    try {
        localStorage.setItem(STOPWATCH_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error("Error saving stopwatch settings:", error);
    }
}
// --- NEW: STOPWATCH CUES MODAL LOGIC ---

function loadStopwatchCues() {
    try {
        const storedCues = localStorage.getItem(STOPWATCH_CUES_KEY);
        if (storedCues) {
            stopwatchCues = JSON.parse(storedCues);
        } else {
            stopwatchCues = JSON.parse(JSON.stringify(defaultStopwatchCues));
        }
    } catch (error) {
        console.error("Error loading stopwatch cues, using defaults.", error);
        stopwatchCues = JSON.parse(JSON.stringify(defaultStopwatchCues));
    }
}
// NEW: Initialize lie cues with defaults (they are not user-configurable for now)
function loadLieCues() {
    try {
        const storedCues = localStorage.getItem(LIE_CUES_STORAGE_KEY);
        if (storedCues) {
            lieCues = JSON.parse(storedCues);
        } else {
            lieCues = JSON.parse(JSON.stringify(defaultLieCues));
        }
    } catch (error) {
        console.error("Error loading lie cues, using defaults.", error);
        lieCues = JSON.parse(JSON.stringify(defaultLieCues));
    }
}


function saveStopwatchCues() {
    try {
        localStorage.setItem(STOPWATCH_CUES_KEY, JSON.stringify(stopwatchCues));
    } catch (error) {
        console.error("Error saving stopwatch cues:", error);
    }
}

function saveLieCues() {
    try {
        localStorage.setItem(LIE_CUES_STORAGE_KEY, JSON.stringify(lieCues));
    } catch (error) {
        console.error("Error saving lie cues:", error);
    }
}

/**
 * NEW: Renders a visual timeline (Gantt chart) for cues.
 * @param {string} containerId - The ID of the timeline container div.
 * @param {Array} cues - The array of cue objects.
 * @param {string} inputClass - The class name of the inputs (to target for focus).
 */
function renderCueTimeline(containerId, cues, inputClass) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ''; // Clear existing

    // Dynamic Scaling (Option B): Find the max time among enabled cues
    const enabledCues = cues.filter(c => c.enabled);
    let maxTime = 0;
    enabledCues.forEach(c => {
        if (c.max > maxTime) maxTime = c.max;
    });
    if (maxTime === 0) maxTime = 10; // Default fallback

    // Theme colors to cycle through
    const colors = [
        'rgba(16, 185, 129, 0.6)', // Green
        'rgba(59, 130, 246, 0.6)', // Blue
        'rgba(250, 204, 21, 0.6)', // Yellow
        'rgba(239, 68, 68, 0.6)',  // Red
        'rgba(167, 139, 250, 0.6)' // Purple
    ];

    cues.forEach((cue, index) => {
        if (!cue.enabled) return;

        const widthPercent = ((cue.max - cue.min) / maxTime) * 100;
        const leftPercent = (cue.min / maxTime) * 100;

        if (leftPercent > 100) return; // Should not happen with dynamic scaling

        const block = document.createElement('div');
        block.className = 'timeline-block';
        block.style.left = `${leftPercent}%`;
        block.style.width = `${widthPercent}%`;
        block.style.backgroundColor = colors[index % colors.length];
        block.textContent = cue.text;
        block.innerHTML += `<div class="timeline-range-text">${cue.min.toFixed(2)} - ${cue.max.toFixed(2)}s</div>`;

        // Click to edit: Focus the corresponding Min input
        block.addEventListener('click', () => {
            const input = document.querySelector(`.${inputClass}[data-index="${index}"][data-type="min"]`);
            if (input) { input.focus(); input.select(); }
        });
        container.appendChild(block);
    });
}

function populateStopwatchCuesModal() {
    const container = document.getElementById('stopwatchCuesContainer');
    container.innerHTML = ''; // Clear existing

    // NEW: Add header row for the cues
    const createHeader = () => {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'grid grid-cols-[auto_1fr_1fr_1fr_1fr] items-center gap-x-3 px-2 pb-2 text-xs text-gray-400 font-semibold';
        headerDiv.innerHTML = `
        <span class="text-center">On</span>
        <span class="text-center">Min (s)</span>
        <span class="text-center">Max (s)</span>
        <span class="text-center">Cup Value</span>
        <span class="text-center">Cup Desc</span>
    `;
        return headerDiv;
    };

    // The container is a 2-column grid on medium screens. We need a header for each column.
    container.appendChild(createHeader());
    container.appendChild(createHeader());

    stopwatchCues.forEach((cue, index) => {
        const div = document.createElement('div');
        div.className = 'grid grid-cols-[auto_1fr_1fr_1fr_1fr] items-center gap-x-3 p-2 bg-gray-900/50 rounded-lg';
        div.innerHTML = `
            <input type="checkbox" data-index="${index}" class="active-club-checkbox cue-enabled-checkbox focus:ring-bunker-yellow" ${cue.enabled ? 'checked' : ''}>
            <input type="number" data-index="${index}" data-type="min" value="${cue.min.toFixed(2)}" step="0.01" class="settings-input cue-input">
            <input type="number" data-index="${index}" data-type="max" value="${cue.max.toFixed(2)}" step="0.01" class="settings-input cue-input">
            <input type="number" data-index="${index}" data-type="value" value="${cue.value}" step="0.1" class="settings-input cue-input">
            <input type="text" data-index="${index}" data-type="text" value="${cue.text}" class="w-full bg-gray-700 text-white p-1 rounded-md text-sm text-center font-bold border border-gray-600 focus:border-bunker-yellow focus:ring-0 cue-input">
        `;
        container.appendChild(div);
    });

    // Initial render of the timeline
    renderCueTimeline('stopwatchCuesTimeline', stopwatchCues, 'cue-input');

    container.addEventListener('change', (e) => {
        if (e.target.matches('.cue-input, .cue-enabled-checkbox')) {
            const index = parseInt(e.target.dataset.index, 10);
            const type = e.target.dataset.type;

            if (e.target.type === 'checkbox') {
                stopwatchCues[index].enabled = e.target.checked;
            } else if (e.target.type === 'number') {
                stopwatchCues[index][type] = parseFloat(e.target.value) || 0;
            } else { // text input
                stopwatchCues[index][type] = e.target.value;
            }
            saveStopwatchCues();
        }
        // Re-render timeline on change (checkbox toggle)
        renderCueTimeline('stopwatchCuesTimeline', stopwatchCues, 'cue-input');
    });

    // NEW: Live update listener for inputs
    container.addEventListener('input', (e) => {
        if (e.target.matches('.cue-input')) {
            const index = parseInt(e.target.dataset.index, 10);
            const type = e.target.dataset.type;
            if (e.target.type === 'number') {
                stopwatchCues[index][type] = parseFloat(e.target.value) || 0;
            } else {
                stopwatchCues[index][type] = e.target.value;
            }
            renderCueTimeline('stopwatchCuesTimeline', stopwatchCues, 'cue-input');
        }
    });
}

document.getElementById('resetStopwatchCuesButton').addEventListener('click', () => {
    stopwatchCues = JSON.parse(JSON.stringify(defaultStopwatchCues));
    saveStopwatchCues();
    populateStopwatchCuesModal();
});

// NEW: Logic for Lie Cues Modal
function populateLieCuesModal() {
    const container = document.getElementById('lieCuesContainer');
    container.innerHTML = ''; // Clear existing

    // Add header row for the cues
    const createHeader = () => {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'grid grid-cols-[auto_1fr_1fr_1fr_1fr] items-center gap-x-3 px-2 pb-2 text-xs text-gray-400 font-semibold';
        headerDiv.innerHTML = `
            <span class="text-center">On</span>
            <span class="text-center">Min (s)</span>
            <span class="text-center">Max (s)</span>
            <span class="text-center">Value (%)</span>
            <span class="text-center">Label</span>
        `;
        return headerDiv;
    };

    container.appendChild(createHeader());
    container.appendChild(createHeader());

    lieCues.forEach((cue, index) => {
        const div = document.createElement('div');
        div.className = 'grid grid-cols-[auto_1fr_1fr_1fr_1fr] items-center gap-x-3 p-2 bg-gray-900/50 rounded-lg';
        div.innerHTML = `
            <input type="checkbox" data-index="${index}" class="active-club-checkbox lie-cue-enabled-checkbox focus:ring-bunker-yellow" ${cue.enabled ? 'checked' : ''}>
            <input type="number" data-index="${index}" data-type="min" value="${cue.min.toFixed(2)}" step="0.01" class="settings-input lie-cue-input">
            <input type="number" data-index="${index}" data-type="max" value="${cue.max.toFixed(2)}" step="0.01" class="settings-input lie-cue-input">
            <input type="number" data-index="${index}" data-type="value" value="${cue.value}" step="0.1" class="settings-input lie-cue-input">
            <input type="text" data-index="${index}" data-type="text" value="${cue.text}" class="w-full bg-gray-700 text-white p-1 rounded-md text-sm text-center font-bold border border-gray-600 focus:border-bunker-yellow focus:ring-0 lie-cue-input">
        `;
        container.appendChild(div);
    });

    // Initial render of the timeline
    renderCueTimeline('lieCuesTimeline', lieCues, 'lie-cue-input');

    container.addEventListener('change', (e) => { // REVISED: Listen for changes on both input types
        if (e.target.matches('.lie-cue-input, .lie-cue-enabled-checkbox')) {
            const index = parseInt(e.target.dataset.index, 10);
            const type = e.target.dataset.type;
            if (e.target.type === 'checkbox') {
                lieCues[index].enabled = e.target.checked;
            } else {
                lieCues[index][type] = (e.target.type === 'number') ? (parseFloat(e.target.value) || 0) : e.target.value;
            }
            saveLieCues();
        }
        // Re-render timeline on change
        renderCueTimeline('lieCuesTimeline', lieCues, 'lie-cue-input');
    });

    // NEW: Live update listener for inputs
    container.addEventListener('input', (e) => {
        if (e.target.matches('.lie-cue-input')) {
            const index = parseInt(e.target.dataset.index, 10);
            const type = e.target.dataset.type;
            if (e.target.type === 'number') {
                lieCues[index][type] = parseFloat(e.target.value) || 0;
            } else {
                lieCues[index][type] = e.target.value;
            }
            renderCueTimeline('lieCuesTimeline', lieCues, 'lie-cue-input');
        }
    });
}

document.getElementById('resetLieCuesButton').addEventListener('click', () => {
    lieCues = JSON.parse(JSON.stringify(defaultLieCues));
    saveLieCues();
    populateLieCuesModal();
});

// NEW: Event listener for the beep toggle
const stopwatchBeepToggle = document.getElementById('stopwatchBeepToggle');
if (stopwatchBeepToggle) {
    stopwatchBeepToggle.addEventListener('change', (e) => {
        stopwatchBeepEnabled = e.target.checked;
        saveStopwatchSettings();
    });
}

// NEW: Event listeners for cup suggestion settings
const cupSuggestionSettingsContainer = document.getElementById('cupSuggestionSettingsContainer');
if (cupSuggestionSettingsContainer) {
    cupSuggestionSettingsContainer.addEventListener('input', (e) => {
        if (e.target.matches('.settings-input')) {
            saveCupSuggestionSettings();
            updateStopwatchUIForMode(); // Force UI to recalculate arrow suggestions
        }
    });
    document.getElementById('resetCupSuggestionSettingsButton').addEventListener('click', () => {
        localStorage.setItem(CUP_SUGGESTION_SETTINGS_KEY, JSON.stringify(defaultCupSuggestionSettings)); // Save reset values
        loadCupSuggestionSettings(); // Reload to update the UI
    });
}

// NEW: Event listener for the stopwatch mode toggle
const stopwatchModeToggle = document.getElementById('stopwatchModeToggle');
if (stopwatchModeToggle) {
    stopwatchModeToggle.addEventListener('click', () => {
        stopwatchMode = (stopwatchMode === 'green') ? 'lie' : 'green';
        // If the stopwatch is running, stop it to prevent confusion
        if (stopwatchRunning) { stopStopwatch(); }
        updateStopwatchUIForMode();
    });

    // NEW: Add listener for the second toggle button in Lie mode
    const stopwatchModeToggleLie = document.getElementById('stopwatchModeToggleLie');
    if (stopwatchModeToggleLie) {
        stopwatchModeToggleLie.addEventListener('click', () => {
            stopwatchModeToggle.click(); // Just trigger the original button's logic
        });
    }
}

// NEW: Event listener for the lie target toggle
document.getElementById('lieTargetToggle')?.addEventListener('click', () => {
        lieTargetSlider = (lieTargetSlider === 'uphillDownhillLie') ? 'feetLie' : 'uphillDownhillLie';
    document.getElementById('lieTargetToggle').dataset.target = lieTargetSlider; // Update data attribute for consistency

        // If the stopwatch is running, stop it to prevent confusion
        if (stopwatchRunning) { stopStopwatch(); }
        updateStopwatchUIForMode(); // Update the UI to show the new target
    updateLiePolarityButtonUI(); // NEW: Update the polarity button text
});

/**
 * NEW: Updates the text and color of the lie polarity button based on the current target and polarity.
 */
function updateLiePolarityButtonUI() {
    const liePolarityToggle = document.getElementById('liePolarityToggle');
    if (!liePolarityToggle) return;

    const isFeetLie = lieTargetSlider === 'feetLie';
    const isPositive = liePolarity === 1;

    liePolarityToggle.textContent = isFeetLie ? (isPositive ? 'Above' : 'Below') : (isPositive ? 'Up' : 'Down');
    liePolarityToggle.classList.toggle('bg-grass-green', isPositive);
    liePolarityToggle.classList.toggle('bg-fairway-blue', !isPositive);
}

// REVISED: Event listener for the lie polarity toggle to use the new UI function
document.getElementById('liePolarityToggle')?.addEventListener('click', () => {
        liePolarity *= -1; // Flip between 1 and -1
    updateLiePolarityButtonUI(); // Update the button's text and color
        // If the stopwatch is running, stop it to prevent confusion
        if (stopwatchRunning) { stopStopwatch(); }
});

/**
 * NEW: Checks if any multiplier slider values differ from the saved preset and shows/hides the save button.
 */
function checkMultiplierChanges() {
    if (safetyLockActive || analysisLockActive) return;

    const windSpeed = parseFloat(windSpeedSlider.value) || 0;
    const category = getWindCategory(windSpeed);
    const clubKey = activeClubKey;
    const manualChangesControlContainer = document.getElementById('manualChangesControlContainer');

    if (!clubPresets[clubKey] || !clubPresets[clubKey].windCategories[category]) {
        manualChangesControlContainer.classList.add('hidden');
        return;
    }

    const savedPreset = clubPresets[clubKey].windCategories[category];

    const isHwChanged = Math.abs((parseFloat(headwindSlider.value) / 100) - savedPreset.hw) > 0.001;
    const isTwChanged = Math.abs((parseFloat(tailwindSlider.value) / 100) - savedPreset.tw) > 0.001;

    // Handle bias-aware checking for crosswind
    const isAcwChanged = shotBias === 'fade' ? Math.abs((parseFloat(assistCrosswindSlider.value) / 100) - savedPreset.acw) > 0.001 : Math.abs((parseFloat(opposedCrosswindSlider.value) / 100) - savedPreset.acw) > 0.001;
    const isOcwChanged = shotBias === 'fade' ? Math.abs((parseFloat(opposedCrosswindSlider.value) / 100) - savedPreset.ocw) > 0.001 : Math.abs((parseFloat(assistCrosswindSlider.value) / 100) - savedPreset.ocw) > 0.001;

    const revertBtn = document.getElementById('revertManualMultiplierChanges');
    const saveBtn = document.getElementById('saveManualMultiplierChanges');

    if (isHwChanged || isTwChanged || isAcwChanged || isOcwChanged) {
        [revertBtn, saveBtn].forEach(btn => { btn.disabled = false; btn.classList.remove('opacity-50', 'cursor-not-allowed'); });
    } else {
        [revertBtn, saveBtn].forEach(btn => { btn.disabled = true; btn.classList.add('opacity-50', 'cursor-not-allowed'); });
    }
}

/**
 * NEW: Shows a temporary confirmation message in the analysis panel.
 * @param {string} message - The text to display.
 */
function showConfirmation(message) {
    const confirmationMessage = document.getElementById('confirmationMessage');
    const confirmationText = document.getElementById('confirmationText');
    confirmationText.textContent = message;
    confirmationMessage.classList.remove('hidden');
    setTimeout(() => {
        confirmationMessage.classList.add('hidden');
    }, 2500); // Hide after 2.5 seconds
}

/**
 * NEW: Exports all club presets to a single CSV file.
 */
function exportAllPresetsToCSV() {
    // 1. Define the order of clubs and components
    const clubOrder = Array.from(document.querySelectorAll('#club-slim-buttons .club-btn')).map(btn => btn.dataset.club);
    const componentMap = {
        'Headwind': 'hw',
        'Tailwind': 'tw',
        'Assist Crosswind': 'acw',
        'Opposed Crosswind': 'ocw'
    };
    const componentOrder = ['Headwind', 'Tailwind', 'Assist Crosswind', 'Opposed Crosswind'];

    // 2. Build the CSV content
    let csvContent = "data:text/csv;charset=utf-8,";

    // Header Row: Blank cell + all club names
    const header = ['"Wind Condition"', ...clubOrder.map(club => `"${club}"`)].join(',');
    csvContent += header + '\r\n';

    // 3. Iterate through each wind category and component to build rows
    WIND_CATEGORIES_ORDER.forEach(categoryKey => {
        const categoryLabel = WIND_CATEGORIES_MAP[categoryKey].label.replace(/ \(.+\)/, '');

        // Add a separator row for the wind category
        csvContent += `"${categoryLabel} Wind"\r\n`;

        componentOrder.forEach(componentName => {
            const componentKey = componentMap[componentName];
            const rowData = [componentName]; // First column is the component name

            clubOrder.forEach(clubKey => {
                // Get the multiplier value, using default if club doesn't exist (safety)
                const value = clubPresets[clubKey]?.windCategories[categoryKey]?.[componentKey] ?? 'N/A';
                rowData.push(value.toFixed(2));
            });

            csvContent += `"${rowData.join('","')}"\r\n`;
        });

        // Add a blank line between wind categories for readability
        csvContent += '\r\n';
    });

    // 4. Create and trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;

    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `all_club_multipliers_${formattedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * NEW: Makes a multiplier value span editable on click.
 * @param {HTMLElement} valueSpan - The span element displaying the value.
 * @param {HTMLElement} slider - The corresponding range slider element.
 */
function makeMultiplierEditable(valueSpan, slider) {
    // Prevent making it editable if it's already an input
    if (valueSpan.querySelector('input')) return;

    const originalValue = parseFloat(valueSpan.textContent);
    const input = document.createElement('input');
    input.type = 'number';
    input.step = '0.01';
    input.min = '0';
    input.max = '2';
    input.value = originalValue.toFixed(2);
    // Apply styling to match the theme and fit in the space
    input.className = 'w-12 bg-gray-900 text-white text-right font-semibold rounded-md border border-bunker-yellow focus:ring-1 focus:ring-bunker-yellow';

    // Hide the original span and append the input
    valueSpan.style.display = 'none';
    valueSpan.parentNode.appendChild(input);
    input.focus();
    input.select();

    // Function to finalize the edit
    const finishEditing = () => {
        let newValue = parseFloat(input.value);

        // Validate and clamp the new value
        if (isNaN(newValue)) {
            newValue = originalValue; // Revert if not a number
        } else {
            newValue = Math.max(0, Math.min(2.0, newValue)); // Clamp between 0.00 and 2.00
        }

        // Update the slider value (which is 0-200)
        slider.value = Math.round(newValue * 100);

        // Update the span's text content
        valueSpan.textContent = newValue.toFixed(2);

        // Clean up: remove the input and show the span again
        input.remove();
        valueSpan.style.display = 'inline';

        // Trigger necessary updates
        checkMultiplierChanges();
        calculateWind();
    };

    // Add event listeners to the new input
    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent form submission
            input.blur(); // Trigger the blur event to finish editing
        } else if (e.key === 'Escape') {
            input.value = originalValue.toFixed(2); // Revert on escape
            input.blur();
        }
    });
}

/**
 * NEW: Makes the power percentage span editable on click.
 * @param {HTMLElement} valueSpan - The span element displaying the value.
 */
function makePowerEditable(valueSpan) {
    // Prevent making it editable if it's already an input
    if (valueSpan.querySelector('input')) return;

    const originalValue = parseInt(valueSpan.textContent.replace('%', ''), 10);
    const input = document.createElement('input');
    input.type = 'number';
    input.step = '1';
    input.min = '1';
    input.max = '200'; // A reasonable max
    input.value = originalValue;
    // Apply styling to match the theme and fit in the space
    input.className = 'w-12 bg-gray-900 text-white text-center font-bold rounded-md border border-bunker-yellow focus:ring-1 focus:ring-bunker-yellow';

    // Hide the original span and append the input
    valueSpan.style.display = 'none';
    valueSpan.parentNode.insertBefore(input, valueSpan);
    input.focus();
    input.select();

    // Function to finalize the edit
    const finishEditing = () => {
        let newValue = parseInt(input.value, 10);

        // Validate and clamp the new value
        if (isNaN(newValue)) {
            newValue = originalValue; // Revert if not a number
        } else {
            newValue = Math.max(1, Math.min(200, newValue)); // Clamp between 1 and 200
        }

        powerPercent = newValue;
        valueSpan.textContent = `${newValue}%`;

        input.remove();
        valueSpan.style.display = 'inline';

        savePowerSetting();
        calculateWind();
    };

    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } else if (e.key === 'Escape') { input.value = originalValue; input.blur(); } });
}

/**
 * NEW: Logs a multiplier change to the history object and saves it.
 */
function logMultiplierChange(clubKey, category, component, oldValue, newValue, shotCount, confidence) {
    if (!multiplierHistory[clubKey]) {
        multiplierHistory[clubKey] = [];
    }
    multiplierHistory[clubKey].push({
        timestamp: Date.now(),
        club: clubKey,
        category: category,
        component: component,
        oldValue: oldValue,
        newValue: newValue,
        shotCount: shotCount,
        confidence: confidence
    });
    try {
        localStorage.setItem(MULTIPLIER_HISTORY_KEY, JSON.stringify(multiplierHistory));
    } catch (e) { console.error("Could not save multiplier history:", e); }
}
/**
 * NEW: Calculates the customization status of all multipliers.
 * @returns {object} An object with totalChanged, totalPossible, and clubStatus details.
 */
function getMultiplierStatus() {
    let totalChanged = 0; // REVISED: Renamed from totalChanged to totalCustomized for clarity
    let totalPerfectDefaults = 0; // NEW: To count perfect defaults across all clubs
    const clubStatus = {};
    const clubKeys = Object.keys(defaultClubPresets);
    const totalPossible = clubKeys.length * WIND_CATEGORIES_ORDER.length * 4; // 4 multipliers per category

    // NEW: Define trust score thresholds
    const HIGH_CONFIDENCE_THRESHOLD = 85;
    const MEDIUM_CONFIDENCE_THRESHOLD = 60;

    clubKeys.forEach(clubKey => {
        // REVISED: Initialize counts for each color category
        clubStatus[clubKey] = { changed: 0, perfect: 0, total: 0, allMultipliers: [], greenCount: 0, yellowCount: 0, redCount: 0 };

        WIND_CATEGORIES_ORDER.forEach(categoryKey => {
            const defaultCategory = defaultClubPresets[clubKey].windCategories[categoryKey];
            const currentCategory = clubPresets[clubKey]?.windCategories[categoryKey] || defaultCategory;

            const multipliers = ['hw', 'tw', 'acw', 'ocw'];
            const componentMap = { hw: 'Headwind', tw: 'Tailwind', acw: 'Assist Crosswind', ocw: 'Opposed Crosswind' };
            const categoryLabel = WIND_CATEGORIES_MAP[categoryKey].label.replace(/ \(.+\)/, '');

            multipliers.forEach(multKey => {
                clubStatus[clubKey].total++;
                const defaultValue = defaultCategory[multKey];
                const currentValue = currentCategory[multKey];
                const isChanged = Math.abs(defaultValue - currentValue) > 0.001;
                
                // NEW: Calculate trust score for this specific multiplier to check for perfection.
                const componentName = componentMap[multKey];
                const trustScore = calculateTrustScore(clubKey, categoryKey, componentName).score;

                if (isChanged) {
                    totalChanged++;
                    clubStatus[clubKey].changed++;
                } else if (trustScore === 100) {
                    // NEW: It's a default value and has 100% trust, so it's "perfect".
                    totalPerfectDefaults++;
                    clubStatus[clubKey].perfect++;
                }

                // NEW: Categorize the trust score for the progress bar coloring
                if (isChanged || trustScore === 100) {
                    if (trustScore >= HIGH_CONFIDENCE_THRESHOLD) {
                        clubStatus[clubKey].greenCount++;
                    } else if (trustScore >= MEDIUM_CONFIDENCE_THRESHOLD) {
                        clubStatus[clubKey].yellowCount++;
                    } else {
                        clubStatus[clubKey].redCount++;
                    }
                }
                clubStatus[clubKey].allMultipliers.push({
                    text: `${categoryLabel} - ${componentMap[multKey]}`,
                    defaultValue: defaultValue.toFixed(2),
                    currentValue: currentValue.toFixed(2),
                    isChanged: isChanged,
                    trustScore: trustScore // NEW: Pass the score through
                });
            });
        });
    });

    return { totalCustomized: totalChanged, totalPerfectDefaults, totalPossible, clubStatus };
}

/**
 * NEW: Returns a Tailwind CSS color class based on the trust score value.
 * @param {number|null} score - The trust score percentage.
 * @returns {string} The CSS class string.
 */
function getTrustScoreColorClass(score) {
    if (score === null || typeof score === 'undefined') return 'text-gray-600';
    if (score > 85) return 'font-bold text-grass-green'; // REVISED: Match slider threshold
    if (score > 60) return 'font-bold text-bunker-yellow'; // REVISED: Match slider threshold
    return 'font-bold text-red-500';
}

/**
 * NEW: Renders the multiplier status view in the settings modal.
 */
function renderMultiplierStatus() {
    const { totalCustomized, totalPerfectDefaults, totalPossible, clubStatus } = getMultiplierStatus();
    const remainingToAnalyze = totalPossible - totalCustomized - totalPerfectDefaults;

    // Render Summary
    const summaryContainer = document.getElementById('multiplierStatusSummary');
    summaryContainer.innerHTML = `
        <div class="text-base space-y-1 text-left">
            <p class="font-semibold text-white"><span class="text-grass-green">✅ ${totalPerfectDefaults}</span> default multipliers confirmed as perfect (100% Trust).</p>
            <p class="font-semibold text-white"><span class="text-bunker-yellow">✏️ ${totalCustomized}</span> multipliers have been customized.</p>
            <p class="font-semibold text-gray-300"><span class="text-gray-400">... ${remainingToAnalyze}</span> multipliers remaining to analyze.</p>
        </div>
        <button id="resetAllMultipliersStatusBtn" class="mt-2 text-xs font-semibold text-red-500 hover:text-red-400 transition duration-150 px-3 py-1 rounded-md border border-red-500/50">Reset All Multipliers to Default</button>
    `;
    document.getElementById('resetAllMultipliersStatusBtn').addEventListener('click', resetAllPresets);

    // Render Club List
    const listContainer = document.getElementById('multiplierStatusList');
    listContainer.innerHTML = '';
    const sortedClubs = Object.keys(clubStatus).sort((a, b) => defaultClubBaseRanges[a].order - defaultClubBaseRanges[b].order);

    sortedClubs.forEach(clubKey => {
        const status = clubStatus[clubKey];
        // REVISED: Progress bar now reflects both customized and perfect defaults.
        const analyzedCount = status.changed + status.perfect;
        const percentage = status.total > 0 ? (analyzedCount / status.total) * 100 : 0;

        // NEW: Create the linear-gradient for the progress bar
        let gradientStyle = 'background-color: #374151;'; // Default to gray if no shots analyzed
        if (analyzedCount > 0) {
            const greenPercent = (status.greenCount / analyzedCount) * 100;
            const yellowPercent = (status.yellowCount / analyzedCount) * 100;
            
            const greenStop = greenPercent;
            const yellowStop = greenPercent + yellowPercent;

            gradientStyle = `background: linear-gradient(to right, 
                #10b981 0%, 
                #10b981 ${greenStop}%, 
                #facc15 ${greenStop}%, 
                #facc15 ${yellowStop}%, 
                #ef4444 ${yellowStop}%, 
                #ef4444 100%);`;
        }

        const li = document.createElement('li');
        li.className = 'p-3 bg-gray-800/50 rounded-lg';
        li.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="font-bold text-white w-16">${clubKey}</span>
                <div class="flex-grow mx-4">
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${percentage}%; ${gradientStyle}"></div>
                    </div>
                </div>
                <span class="text-sm text-gray-300 w-28 text-right">${analyzedCount} / ${status.total} analyzed</span>
                <button data-club="${clubKey}" class="toggle-details-btn ml-3 text-xs font-semibold text-fairway-blue hover:text-blue-300 transition duration-150 px-2 py-1 rounded-md border border-fairway-blue/50">Details</button>
            </div>
            <div class="multiplier-details-list mt-2 pl-4 text-xs" id="details-${clubKey}">
                <ul class="list-disc list-inside space-y-1 pr-2">
                    <!-- REVISED: Correctly check the 'isChanged' flag for EACH multiplier 'm' in the map. -->
                    ${status.allMultipliers.map(m => {
                        const trustScoreColorClass = getTrustScoreColorClass(m.trustScore);
                        if (m.isChanged) { // This was the line with the error. It is now corrected.
                            // Render changed multipliers in bold with before/after values
                            return `<li class="text-white font-semibold">✏️ ${m.text}: <span class="font-semibold text-red-400">${m.defaultValue}</span> → <span class="font-semibold text-grass-green">${m.currentValue}</span> <span class="${trustScoreColorClass}">(T:${m.trustScore ?? '--'}%)</span></li>`;
                        } else if (m.trustScore === 100) {
                            // NEW: Render "perfect" defaults with a green highlight.
                            return `<li class="text-grass-green font-semibold">✅ ${m.text}: <span class="font-bold">${m.defaultValue} (Perfect)</span></li>`;
                        } else {
                            // Render default multipliers in a dimmer color
                            return `<li class="text-gray-500">${m.text}: <span class="font-normal">${m.defaultValue}</span> <span class="${trustScoreColorClass}">(T:${m.trustScore ?? '--'}%)</span></li>`;
                        }
                    }).join('')}
                </ul>
            </div>
        `;
        listContainer.appendChild(li);
    });

    listContainer.querySelectorAll('.toggle-details-btn').forEach(btn => {
        btn.addEventListener('click', () => document.getElementById(`details-${btn.dataset.club}`).classList.toggle('expanded'));
    });
}
/**
 * Exports the current analysis table data to a CSV file.
 */
function exportAnalysisData() {
    // --- NEW, MORE ROBUST EXPORT LOGIC ---
    // Create the link element immediately to preserve the user-initiated event context.
    // This prevents browsers from blocking the download which can happen inside a setTimeout.
    const link = document.createElement("a");
    document.body.appendChild(link); // Append to body to ensure it's clickable

    const club = activeAnalysisClubKey.replace('°', 'deg'); // Sanitize filename

    // --- NEW: Export Scatter Plot as Image ---
    if (shotChart && allShotData.filter(shot => shot.clubKey === activeAnalysisClubKey).length > 0) {
        try {
            const imageUrl = shotChart.toBase64Image();
            const imageLink = document.createElement('a');
            imageLink.href = imageUrl;
            imageLink.download = `shot_dispersion_plot_${club}.png`;
            imageLink.click();
        } catch (error) {
            console.error("Error exporting chart image:", error);
            alert("Could not export the shot plot image. See console for details.");
        }
    }

    // --- Existing CSV Export Logic (with a delay) ---
    setTimeout(() => {
        const shotsForClub = allShotData.filter(shot => shot.clubKey === activeAnalysisClubKey);

        let csvContent = "data:text/csv;charset=utf-8,";

        // 1. Add Analysis Table Data
        const analysisList = document.getElementById('analysisResultsList');
        if (!analysisList) return; // Safety check
        const analysisRows = analysisList.querySelectorAll('li');

        analysisRows.forEach((row, rowIndex) => {
            const cols = Array.from(row.children).map(child => `"${child.textContent.replace(/\s+/g, ' ').trim()}"`);
            csvContent += cols.join(',') + '\r\n';

            // Check if the current row is a category total row by looking for the specific data attributes
            // and ensure it's not the last row in the list to avoid an extra blank line at the end.
            const isCategoryTotalRow = row.dataset.component === 'null' && !row.querySelector('.font-extrabold'); // Grand total has font-extrabold
            if (isCategoryTotalRow && rowIndex < analysisRows.length - 1) {
                csvContent += '\r\n';
            }
        });

        // 2. Add Recommendations if they exist
        const recommendationList = document.getElementById('recommendationList');
        const recommendationRows = recommendationList ? recommendationList.querySelectorAll('li.recommendation-item') : [];

        if (recommendationRows.length > 0) {
            csvContent += "\r\n"; // Add a blank line for separation
            csvContent += '"Recommendations"\r\n'; // Add a header for the section

            recommendationRows.forEach(row => {
                // REVISED: Use innerText to better respect line breaks in the display.
                const recommendationText = row.querySelector('div:first-child').innerText.replace(/\s+/g, ' ').trim();
                csvContent += `"${recommendationText}"\r\n`;

                // Get the shots for this recommendation
                const clubKey = row.dataset.clubKey;
                const category = row.dataset.category;
                const component = row.dataset.component;
                if (clubKey && category && component) {
                    // BUG FIX: Always use the complete, unfiltered shot list for the club when exporting.
                    const shots = getShotsForComponent(allShotData.filter(s => s.clubKey === clubKey), clubKey, category, component);
                    if (shots.length > 0) {
                        // Add a header for the shot data
                        csvContent += '"Wind (MPH@°)","Elevation (yd)","Target Adj (Carry|Aim)","Error (Carry|Aim)","Multipliers Used (HW,TW,ACW,OCW)"\r\n';
                        shots.forEach(shot => {
                            const shotCols = [
                                `"${shot.windSpeed}@${shot.windAngle}°"`, `"${shot.elevationYards}"`, `"${shot.calculatedCarryAdj.toFixed(1)}|${shot.calculatedAimAdj.toFixed(1)}"`, `"${shot.actualCarryError.toFixed(1)}|${shot.actualAimError.toFixed(1)}"`, `"${shot.multipliersUsed.hw.toFixed(2)},${shot.multipliersUsed.tw.toFixed(2)},${shot.multipliersUsed.acw.toFixed(2)},${shot.multipliersUsed.ocw.toFixed(2)}"`
                            ];
                            csvContent += shotCols.join(',') + "\r\n";
                        });
                        csvContent += "\r\n"; // Add a blank line after the shots for this recommendation
                    }
                }
            });
        }

        // 3. Create and trigger the download
        const encodedUri = encodeURI(csvContent);
        if (shotsForClub.length > 0) {
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `analysis_and_recommendations_${club}.csv`);
            link.click();
        } else {
            alert("No analysis or recommendation data to export.");
        }
        document.body.removeChild(link);
    }, 100); // 100ms delay
}

/**
 * NEW: Exports the multiplier history data and chart thumbnails as a ZIP file.
 */
async function exportHistoryData() {
    if (typeof JSZip === 'undefined') {
        alert("Error: JSZip library is not loaded. Cannot create ZIP file.");
        return;
    }

    const clubKey = activeAnalysisClubKey;
    const clubHistory = multiplierHistory[clubKey] || [];

    if (clubHistory.length === 0) {
        alert("No history data to export for this club.");
        return;
    }

    const zip = new JSZip();
    const clubFolder = zip.folder(clubKey);

    // 1. Add CSV data (no changes here)
    try {
        const headers = ["timestamp", "date", "club", "category", "component", "oldValue", "newValue", "shotCount", "confidence"];
        const csvRows = [headers.join(',')];
        clubHistory.forEach(entry => {
            const sanitizedValues = [
                entry.timestamp, `"${new Date(entry.timestamp).toLocaleString()}"`, entry.club, entry.category, `"${entry.component}"`,
                entry.oldValue, entry.newValue, entry.shotCount, entry.confidence
            ];
            csvRows.push(sanitizedValues.join(','));
        });
        const csvContent = csvRows.join('\r\n');
        clubFolder.file("history_data.csv", csvContent);
    } catch (e) {
        console.error("Error creating CSV:", e);
    }

    // 2. REVISED: Systematically render and capture all charts
    const mainHistoryTabContainer = document.getElementById('historyTabContainer').parentElement.parentElement.previousElementSibling;
    const originalActiveMainTab = mainHistoryTabContainer.querySelector('.main-history-tab-button.active');
    const originalActiveSubTab = document.getElementById('historyTabContainer').querySelector('.history-tab-button.active');

    // Ensure the multiplier history tab is active before we begin
    const multiplierHistoryMainTab = document.querySelector('.main-history-tab-button[data-target="panel-multiplier-history"]');
    if (multiplierHistoryMainTab) multiplierHistoryMainTab.click();

    // Helper function to pause execution for a moment
    const delay = ms => new Promise(res => setTimeout(res, ms));

    // --- Part 1: Capture Multiplier History Mini-Charts ---
    const historyTabButtons = document.querySelectorAll('#historyTabContainer .history-tab-button');
    for (const tabButton of historyTabButtons) {
        tabButton.click(); // This will now correctly render the charts

        // IMPORTANT: Wait a brief moment for the chart animations to complete.
        // Without this, we might capture a blank or partially rendered canvas.
        await delay(250);

        const panelId = tabButton.dataset.target;
        const panel = document.getElementById(panelId);
        if (!panel) continue;

        const chartCanvases = panel.querySelectorAll('canvas');

        for (const canvas of chartCanvases) {
            const componentHeader = canvas.closest('.history-chart-placeholder')?.previousElementSibling;
            if (!componentHeader) continue;

            const category = panel.id.replace('history-panel-', '');
            const component = componentHeader.textContent.replace(/\s/g, '_'); // Sanitize for filename
            const filename = `${clubKey}_${category}-${component}_chart.png`;

            try {
                const imageDataUrl = canvas.toDataURL('image/png');
                const base64Data = imageDataUrl.split(',')[1];
                clubFolder.file(`charts/${filename}`, base64Data, { base64: true });
            } catch (e) {
                console.error(`Failed to capture chart for ${filename}:`, e);
            }
        }
    }

    // --- Part 2: Capture Performance Trend Chart ---
    const performanceTabButton = document.querySelector('.main-history-tab-button[data-target="panel-performance-trends"]');
    if (performanceTabButton) {
        // Programmatically click the tab to make it visible, which triggers rendering.
        performanceTabButton.click();
        
        await delay(250); // Wait for chart to render

        const performanceCanvas = performanceTrendChartCanvas; // Use direct reference
        if (performanceCanvas) {
            try {
                const selectedClubForFilename = performanceChartClubSelect.value; // Get the currently selected club from the dropdown
                // Per user feedback, save this chart inside the 'charts' subfolder for consistency.
                const filename = `performance_trend_${selectedClubForFilename}.png`; 
                const imageDataUrl = performanceCanvas.toDataURL('image/png');
                const base64Data = imageDataUrl.split(',')[1];
                // REVISED: Save to the charts subfolder.
                clubFolder.file(`charts/${filename}`, base64Data, { base64: true });
            } catch (e) {
                console.error(`Failed to capture performance trend chart:`, e);
            }
        }
    }

    // Restore the originally active tab for a seamless user experience
    if (originalActiveMainTab) {
        // Programmatically click to restore the view for the user
        originalActiveMainTab.click(); 
        if (originalActiveSubTab) originalActiveSubTab.click();
    }

    // 3. Generate and download the ZIP file
    try {
        const content = await zip.generateAsync({ type: "blob" });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `multiplier_history_${clubKey}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error("Error generating ZIP file:", error);
        alert("An error occurred while creating the ZIP file. See console for details.");
    }
}

}); // End of DOMContentLoaded

