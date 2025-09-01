# TICKET-004: Interactive Features and User Experience

**Project:** 5-Year Retirement Plan Evaluation App
**Component:** User Interaction
**Priority:** Medium
**Type:** Enhancement
**Estimated Effort:** 5 hours

## Summary
Implement advanced interactive features for the asset growth chart including scenario toggles, data export, and enhanced user controls for consultant presentations.

## Acceptance Criteria
- [ ] Toggle buttons to show/hide individual scenarios
- [ ] Data export functionality for chart data
- [ ] Zoom and pan capabilities for detailed analysis
- [ ] Comparison mode highlighting differences between scenarios
- [ ] Print-friendly chart styling
- [ ] Keyboard navigation support for accessibility
- [ ] Mobile-optimized touch interactions

## Interactive Features

### Scenario Toggle Controls
```html
<div class="chart-controls">
    <div class="scenario-toggles">
        <label class="toggle-switch">
            <input type="checkbox" id="toggleCurrent" checked>
            <span class="slider">Current Plan</span>
        </label>
        <label class="toggle-switch">
            <input type="checkbox" id="toggle10Percent" checked>
            <span class="slider">10% Contribution</span>
        </label>
        <label class="toggle-switch">
            <input type="checkbox" id="toggle15Percent" checked>
            <span class="slider">15% Contribution</span>
        </label>
        <label class="toggle-switch">
            <input type="checkbox" id="toggleAutoEnroll" checked>
            <span class="slider">Auto-Enrollment</span>
        </label>
    </div>
</div>
```

### Toggle Functionality
```javascript
function initializeScenarioToggles() {
    const toggles = document.querySelectorAll('.scenario-toggles input[type="checkbox"]');
    
    toggles.forEach((toggle, index) => {
        toggle.addEventListener('change', function() {
            const dataset = chartInstance.data.datasets[index];
            dataset.hidden = !this.checked;
            chartInstance.update();
            
            // Update legend styling
            updateLegendVisibility(index, this.checked);
        });
    });
}
```

### Data Export Feature
```javascript
function exportChartData() {
    const exportData = {
        scenarios: {
            current: currentProjections.chart,
            tenPercent: tenPercentProjections.chart,
            fifteenPercent: fifteenPercentProjections.chart,
            autoEnroll: autoEnrollProjections.chart
        },
        metadata: {
            planName: setupData.planName || 'Retirement Plan Analysis',
            generatedDate: new Date().toISOString(),
            participants: setupData.participants,
            avgSalary: setupData.avgSalary
        }
    };
    
    // CSV export
    const csvData = convertToCSV(exportData);
    downloadFile(csvData, 'retirement-projections.csv', 'text/csv');
    
    // JSON export option
    const jsonData = JSON.stringify(exportData, null, 2);
    downloadFile(jsonData, 'retirement-projections.json', 'application/json');
}
```

### Comparison Mode
```javascript
function enableComparisonMode() {
    const comparisonToggle = document.getElementById('comparisonMode');
    
    comparisonToggle.addEventListener('change', function() {
        if (this.checked) {
            // Highlight differences between current and best scenario
            highlightScenarioDifferences();
            showComparisonAnnotations();
        } else {
            clearComparisonHighlights();
            hideComparisonAnnotations();
        }
    });
}

function highlightScenarioDifferences() {
    const currentData = currentProjections.chart;
    const bestData = fifteenPercentProjections.chart;
    
    // Add difference area chart
    const differenceData = currentData.map((point, index) => {
        return bestData[index].balance - point.balance;
    });
    
    chartInstance.data.datasets.push({
        label: 'Improvement Potential',
        data: differenceData,
        type: 'bar',
        backgroundColor: 'rgba(46, 204, 113, 0.3)',
        borderColor: '#2ecc71',
        yAxisID: 'y1'
    });
    
    // Add second y-axis for difference scale
    chartInstance.options.scales.y1 = {
        type: 'linear',
        display: true,
        position: 'right',
        ticks: {
            callback: function(value) {
                return '+' + formatCurrency(value);
            }
        }
    };
    
    chartInstance.update();
}
```

### Zoom and Pan Controls
```javascript
const zoomOptions = {
    plugins: {
        zoom: {
            zoom: {
                wheel: {
                    enabled: true,
                    modifierKey: 'ctrl'
                },
                pinch: {
                    enabled: true
                },
                mode: 'x'
            },
            pan: {
                enabled: true,
                mode: 'x',
                modifierKey: 'shift'
            }
        }
    }
};
```

### Mobile Touch Optimization
```javascript
function optimizeMobileInteractions() {
    if (window.innerWidth <= 768) {
        // Increase touch target sizes
        chartInstance.options.plugins.tooltip.intersect = false;
        chartInstance.options.plugins.tooltip.mode = 'nearest';
        
        // Optimize point sizes for touch
        chartInstance.data.datasets.forEach(dataset => {
            dataset.pointRadius = 8;
            dataset.pointHoverRadius = 12;
        });
        
        // Enable mobile-friendly pan/zoom
        chartInstance.options.plugins.zoom.pan.threshold = 10;
        chartInstance.update();
    }
}
```

### Keyboard Navigation
```javascript
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        if (event.target.closest('.chart-container')) {
            switch(event.key) {
                case 'ArrowLeft':
                    navigateToDataPoint('previous');
                    break;
                case 'ArrowRight':
                    navigateToDataPoint('next');
                    break;
                case 'Enter':
                    showDetailedTooltip();
                    break;
                case 'Escape':
                    resetChartView();
                    break;
            }
        }
    });
}
```

## Control Panel Styling
```css
.chart-controls {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #e9ecef;
}

.scenario-toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    align-items: center;
}

.toggle-switch {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
}

.toggle-switch input {
    margin-right: 8px;
}

.export-controls {
    margin-top: 15px;
    display: flex;
    gap: 10px;
}

.chart-action-btn {
    padding: 8px 16px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
}

.chart-action-btn:hover {
    background: #5a67d8;
}
```

## Print Optimization
```css
@media print {
    .chart-controls {
        display: none;
    }
    
    .chart-container {
        height: 400px !important;
        page-break-inside: avoid;
    }
    
    .chart-title {
        color: #000 !important;
        font-size: 14pt;
    }
}
```

## Performance Considerations
- Debounce toggle events to prevent excessive re-renders
- Lazy load zoom/pan plugins only when needed
- Optimize chart updates for mobile devices
- Cache expensive calculations during interactions

## Accessibility Features
- ARIA labels for all interactive elements
- Focus indicators for keyboard navigation
- Screen reader support for chart data
- High contrast mode compatibility
- Reduced motion support for animations

## Testing Requirements
```javascript
// Interaction tests
testScenarioTogglesFunctionality();
testDataExportFormats(['csv', 'json']);
testKeyboardNavigation();
testMobileTouchGestures();
testPrintFormatting();

// Accessibility tests
testARIALabels();
testKeyboardOnlyNavigation();
testScreenReaderCompatibility();
testHighContrastMode();
```

## Files to Modify
- `results.html` - Add control panel HTML
- `results.js` - Implement interactive features
- `styles.css` - Control panel and interaction styling
- Add `chart-interactions.js` - Separate interaction logic

## Dependencies
- Chart.js zoom plugin (optional)
- File download utilities
- Touch gesture detection for mobile

---
**Created:** 2025-01-04
**Assignee:** Development Team
**Labels:** interaction, ux, accessibility, mobile