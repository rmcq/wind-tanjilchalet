# Wind Tanjilchalet

Golf wind calculator and shot tracker

## Features

- **Wind Calculator**: Calculate wind adjustments based on speed, direction, and club selection
- **Shot Tracking**: Record and analyze your shots with detailed statistics
- **Multiplier Analysis**: Get data-driven recommendations for wind multiplier adjustments
- **Performance Trends**: Visualize your performance over time with interactive charts
- **Green Reading Stopwatch**: Time your green reads for consistent break calculations
- **Club Range Management**: Track and manage carry distances for all your clubs
- **Import/Export**: Backup and restore all your data

## Usage

Open `index.html` in a web browser. 

For the best experience on mobile devices:
1. Open the app in Safari (iOS) or Chrome (Android)
2. Use "Add to Home Screen" for a full-screen app experience
3. The app works completely offline once loaded

## Data Storage

All data is stored locally in your browser's localStorage. Your data never leaves your device.

Use the export features in the Settings panel to create backups of your:
- Shot data
- Multiplier settings
- App settings

## Development

This is a client-side only application using vanilla JavaScript ES6 modules.

### File Structure

```
wind-tanjilchalet/
├── index.html          - HTML structure and CDN imports
├── styles.css          - All custom styling  
├── config.js           - Constants and default values
├── ui.js               - Application logic and UI
├── main.js             - Application initialization
└── README.md
```

### Technologies

- **Tailwind CSS** (via CDN) - Utility-first CSS framework
- **Chart.js** - Interactive charts and visualizations
- **JSZip** - ZIP file generation for exports
- **date-fns** - Date utilities for time-series charts

## Credits

Created by Tanjilchalet

## License

All rights reserved.
