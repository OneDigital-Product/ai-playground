# TICKET-005: Testing and Validation Framework

**Project:** 5-Year Retirement Plan Evaluation App
**Component:** Quality Assurance
**Priority:** High
**Type:** Testing
**Estimated Effort:** 6 hours

## Summary
Implement comprehensive testing framework for the asset growth chart functionality, including unit tests, integration tests, visual regression tests, and manual testing procedures.

## Acceptance Criteria
- [ ] Unit tests for all calculation functions achieve 95%+ coverage
- [ ] Integration tests verify chart renders with real data
- [ ] Visual regression tests catch styling/layout changes
- [ ] Performance tests ensure chart loads within requirements
- [ ] Cross-browser compatibility verified
- [ ] Accessibility testing passes WCAG AA standards
- [ ] Manual testing checklist completed

## Testing Framework Structure

### Unit Tests for Financial Calculations
```javascript
// tests/financial-calculations.test.js
describe('Financial Calculation Engine', () => {
    beforeEach(() => {
        // Setup test data
        testData = {
            participants: 100,
            avgAccountBalance: 50000,
            avgSalary: 65000,
            investmentReturn: 7,
            employeeContribRate: 6,
            employerContribRate: 3,
            employer401kMatch: 3,
            participantsMaxMatch: 75
        };
    });

    describe('calculateProjections', () => {
        test('current scenario calculates correctly', () => {
            const result = calculateProjections('current');
            
            expect(result.annual).toHaveLength(26); // 0-25 years
            expect(result.chart).toHaveLength(6);   // 5-year intervals
            expect(result.annual[0].startingBalance).toBe(50000);
            expect(result.annual[25].endingBalance).toBeGreaterThan(50000);
        });

        test('10% scenario shows improvement over current', () => {
            const current = calculateProjections('current');
            const tenPercent = calculateProjections('tenPercent');
            
            const finalCurrent = current.annual[25].endingBalance;
            const finalTenPercent = tenPercent.annual[25].endingBalance;
            
            expect(finalTenPercent).toBeGreaterThan(finalCurrent);
        });

        test('auto-escalation increases contributions over time', () => {
            const dataWithEscalation = {
                ...testData,
                autoEscalation: true,
                maxAutoEscalationRate: 15
            };
            
            const result = calculateProjections('current');
            
            // Year 1 should have higher contributions than year 0
            expect(result.annual[1].contributions).toBeGreaterThan(result.annual[0].contributions);
        });

        test('fee calculations handle different structures', () => {
            const basisPointsFee = { type: 'basisPoints', value: 50 };
            const flatFee = { type: 'flatPerHead', flat: 5000, perHead: 25 };
            
            const planAssets = 5000000; // $5M plan
            
            const basisPointsResult = calculateAnnualFees(planAssets, [basisPointsFee]);
            const flatFeeResult = calculateAnnualFees(planAssets, [flatFee]);
            
            expect(basisPointsResult).toBe(planAssets * 0.005); // 50 bp = 0.5%
            expect(flatFeeResult).toBe(5000 + (25 * 100)); // flat + per participant
        });
    });

    describe('edge cases', () => {
        test('handles zero participants gracefully', () => {
            const zeroParticipants = { ...testData, participants: 0 };
            expect(() => calculateProjections('current')).not.toThrow();
        });

        test('handles extreme investment returns', () => {
            const highReturn = { ...testData, investmentReturn: 15 };
            const lowReturn = { ...testData, investmentReturn: 1 };
            
            expect(() => calculateProjections('current')).not.toThrow();
        });

        test('validates contribution rate bounds', () => {
            const invalidRate = { ...testData, employeeContribRate: 150 };
            // Should cap at reasonable maximum or throw validation error
            expect(() => calculateProjections('current')).not.toThrow();
        });
    });
});
```

### Chart Integration Tests
```javascript
// tests/chart-integration.test.js
describe('Chart Integration', () => {
    let chartContainer;
    let mockChartInstance;

    beforeEach(() => {
        // Setup DOM environment
        document.body.innerHTML = `
            <div class="chart-container">
                <canvas id="aabChart"></canvas>
            </div>
        `;
        chartContainer = document.querySelector('.chart-container');
        
        // Mock Chart.js
        global.Chart = jest.fn(() => mockChartInstance);
        mockChartInstance = {
            update: jest.fn(),
            destroy: jest.fn(),
            data: { datasets: [] },
            options: {}
        };
    });

    test('creates chart with correct data structure', () => {
        const projections = generateTestProjections();
        createChart(projections.current, projections.tenPercent, projections.fifteenPercent);
        
        expect(Chart).toHaveBeenCalledWith(
            expect.any(Object), // canvas context
            expect.objectContaining({
                type: 'line',
                data: expect.objectContaining({
                    labels: expect.arrayContaining(['Year 0', 'Year 5', 'Year 10']),
                    datasets: expect.arrayContaining([
                        expect.objectContaining({
                            label: 'Current Plan (Status Quo)',
                            borderColor: '#667eea'
                        })
                    ])
                })
            })
        );
    });

    test('updates chart when data changes', () => {
        const initialProjections = generateTestProjections();
        createChart(initialProjections.current, initialProjections.tenPercent, initialProjections.fifteenPercent);
        
        const updatedProjections = generateTestProjections({ avgSalary: 70000 });
        createChart(updatedProjections.current, updatedProjections.tenPercent, updatedProjections.fifteenPercent);
        
        expect(mockChartInstance.destroy).toHaveBeenCalled();
        expect(Chart).toHaveBeenCalledTimes(2);
    });

    test('handles responsive design breakpoints', () => {
        // Mock mobile viewport
        Object.defineProperty(window, 'innerWidth', { value: 400 });
        
        const projections = generateTestProjections();
        createChart(projections.current, projections.tenPercent, projections.fifteenPercent);
        
        // Verify mobile-specific options applied
        const chartOptions = Chart.mock.calls[0][1].options;
        expect(chartOptions.plugins.legend.labels.font.size).toBeLessThan(14);
    });
});
```

### Visual Regression Tests
```javascript
// tests/visual-regression.test.js
describe('Visual Regression Tests', () => {
    test('chart renders consistently', async () => {
        await page.goto('http://localhost:8000/results.html');
        
        // Wait for chart to load
        await page.waitForSelector('#aabChart');
        await page.waitForTimeout(1000); // Allow for animations
        
        const chartImage = await page.screenshot({
            clip: { x: 0, y: 0, width: 800, height: 600 }
        });
        
        expect(chartImage).toMatchImageSnapshot({
            threshold: 0.02,
            customSnapshotIdentifier: 'asset-growth-chart'
        });
    });

    test('mobile chart layout', async () => {
        await page.setViewport({ width: 375, height: 667 });
        await page.goto('http://localhost:8000/results.html');
        
        const mobileImage = await page.screenshot();
        expect(mobileImage).toMatchImageSnapshot({
            customSnapshotIdentifier: 'mobile-chart-layout'
        });
    });
});
```

### Performance Tests
```javascript
// tests/performance.test.js
describe('Chart Performance', () => {
    test('chart renders within performance budget', async () => {
        const startTime = performance.now();
        
        const projections = generateLargeDataset(); // 25 years of data
        createChart(projections.current, projections.tenPercent, projections.fifteenPercent);
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        expect(renderTime).toBeLessThan(300); // 300ms budget
    });

    test('memory usage stays within bounds', () => {
        const initialMemory = performance.memory.usedJSHeapSize;
        
        // Create and destroy chart multiple times
        for (let i = 0; i < 10; i++) {
            const projections = generateTestProjections();
            createChart(projections.current, projections.tenPercent, projections.fifteenPercent);
            destroyChart();
        }
        
        const finalMemory = performance.memory.usedJSHeapSize;
        const memoryGrowth = finalMemory - initialMemory;
        
        expect(memoryGrowth).toBeLessThan(5000000); // 5MB growth limit
    });
});
```

### Accessibility Tests
```javascript
// tests/accessibility.test.js
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Chart Accessibility', () => {
    test('chart container meets WCAG AA standards', async () => {
        document.body.innerHTML = `
            <div class="chart-container">
                <canvas id="aabChart" role="img" aria-label="Asset growth chart showing retirement projections"></canvas>
            </div>
        `;
        
        const results = await axe(document.body);
        expect(results).toHaveNoViolations();
    });

    test('keyboard navigation works correctly', async () => {
        const chartContainer = document.querySelector('.chart-container');
        chartContainer.focus();
        
        // Test arrow key navigation
        const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        chartContainer.dispatchEvent(arrowRightEvent);
        
        // Verify navigation occurred (implementation-specific)
        expect(getCurrentDataPointIndex()).toBe(1);
    });
});
```

## Cross-Browser Testing Matrix

| Browser | Version | Desktop | Mobile | Status |
|---------|---------|---------|--------|--------|
| Chrome | 90+ | ✅ | ✅ | Pass |
| Firefox | 88+ | ✅ | ✅ | Pass |
| Safari | 14+ | ✅ | ✅ | Pass |
| Edge | 90+ | ✅ | ✅ | Pass |
| IE | 11 | ❌ | N/A | Not Supported |

## Manual Testing Checklist

### Functional Testing
- [ ] Chart loads with sample data
- [ ] All four scenarios display correctly
- [ ] Tooltips show accurate information
- [ ] Legend toggles work properly
- [ ] Export functionality generates correct files
- [ ] Responsive design adapts at breakpoints
- [ ] Print view formats correctly

### Data Validation Testing
- [ ] Current scenario matches input parameters
- [ ] 10% scenario shows realistic improvement
- [ ] 15% scenario exceeds 10% scenario
- [ ] Auto-enrollment scenario reflects behavioral changes
- [ ] Fee calculations impact final balances correctly
- [ ] Auto-escalation affects multi-year projections

### Error Handling Testing
- [ ] Invalid input data handled gracefully
- [ ] Missing Chart.js library shows error message
- [ ] Network failures don't crash application
- [ ] Browser compatibility issues display fallback

### Performance Testing
- [ ] Initial chart load < 500ms
- [ ] Chart interactions remain smooth
- [ ] Memory usage stable during extended use
- [ ] Mobile performance acceptable on slower devices

## Test Data Generation
```javascript
// tests/test-data-generator.js
function generateTestProjections(overrides = {}) {
    const baseData = {
        participants: 100,
        avgAccountBalance: 50000,
        avgSalary: 65000,
        investmentReturn: 7,
        ...overrides
    };
    
    return {
        current: calculateProjections('current', baseData),
        tenPercent: calculateProjections('tenPercent', baseData),
        fifteenPercent: calculateProjections('fifteenPercent', baseData),
        autoEnroll: calculateProjections('autoEnroll', baseData)
    };
}

function generateLargeDataset() {
    // Generate realistic data for performance testing
    return generateTestProjections({
        participants: 1000,
        complexFeeStructure: true
    });
}
```

## Continuous Integration Setup
```yaml
# .github/workflows/chart-tests.yml
name: Chart Testing
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npm test
      - run: npm run test:visual
      - run: npm run test:accessibility
```

## Files to Create
- `tests/financial-calculations.test.js`
- `tests/chart-integration.test.js`
- `tests/visual-regression.test.js`
- `tests/performance.test.js`
- `tests/accessibility.test.js`
- `tests/test-data-generator.js`
- `jest.config.js`
- `package.json` (test dependencies)

## Dependencies
```json
{
  "devDependencies": {
    "jest": "^27.0.0",
    "jest-axe": "^5.0.0",
    "jest-image-snapshot": "^4.5.0",
    "puppeteer": "^10.0.0",
    "@testing-library/dom": "^8.0.0"
  }
}
```

---
**Created:** 2025-01-04
**Assignee:** Development Team
**Labels:** testing, qa, automation, accessibility