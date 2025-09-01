# TICKET-002: Financial Calculation Engine

**Project:** 5-Year Retirement Plan Evaluation App
**Component:** Financial Modeling
**Priority:** High
**Type:** Story
**Estimated Effort:** 8 hours

## Summary
Implement comprehensive financial calculation engine for 25-year asset growth projections with monthly compounding, multiple scenarios, and proper fee handling.

## Acceptance Criteria
- [ ] Monthly compounding calculations are mathematically accurate
- [ ] All four scenarios calculate correctly (Current, 10%, 15%, Auto-Enrollment)
- [ ] Auto-escalation logic works properly with annual rate increases
- [ ] Fee calculations handle both basis points and flat+per-head structures
- [ ] Employer contribution logic correctly models current vs potential matching
- [ ] Edge cases handled (zero values, extreme inputs)
- [ ] Calculations complete in < 200ms for 25-year projection

## Financial Calculation Specifications

### Core Formula
```javascript
// Monthly compounding with contributions
for (let year = 0; year <= 25; year++) {
    for (let month = 0; month < 12; month++) {
        // Add monthly contributions
        currentBalance += monthlyEmployeeContrib + monthlyEmployerContrib;
        
        // Apply monthly return
        currentBalance += currentBalance * (annualReturn / 12);
    }
    
    // Deduct annual fees
    currentBalance -= calculateAnnualFees(currentBalance * participants) / participants;
}
```

### Scenario Logic
```javascript
// Current: Use actual rates
// 10%: Employee contributes 10%, enhanced match utilization +30%
// 15%: Employee contributes 15%, enhanced match utilization +40% 
// Auto-Enrollment: Default 3% rate, match utilization +80%
```

### Auto-Escalation
```javascript
if (autoEscalation && year > 0 && currentRate < maxRate) {
    currentEmployeeRate = Math.min(currentRate + 1, maxAutoEscalationRate);
}
```

### Fee Calculations
```javascript
// Basis Points: (basisPoints / 10000) * planAssets
// Flat + Per Head: flatFee + (perHeadFee * participants)

// Fee Payment Logic:
// 1. Investment fees ALWAYS paid by employees (cannot be avoided)
// 2. Administrative fees (Record Keeper, Advisor, TPA, Audit) depend on feesPaidBy setting:
//    - 'employer': Only investment fees impact employee accounts
//    - 'employee': All fees impact employee accounts  
//    - 'split': Investment fees + 50% of administrative fees impact employee accounts
```

### Employer Contribution Logic
```javascript
// Current scenario: Use actual average employer contribution rate
// Improvement scenarios: Model based on maximum match potential
if (scenario === 'current') {
    monthlyEmployerContrib = (employerContribRate / 100) * avgSalary / 12;
} else {
    employeeMatch = Math.min(employeeRate, employer401kMatch);
    projectedMatch = employeeMatch * (enhancedMatchUtilization / 100);
    monthlyEmployerContrib = (projectedMatch / 100) * avgSalary / 12;
}
```

## Data Structure
```javascript
const projectionResult = {
    annual: [
        {
            year: 0,
            startingBalance: 50000,
            contributions: 12000,
            growth: 3500,
            fees: 500,
            endingBalance: 65000
        }
        // ... for 25 years
    ],
    chart: [
        // Data for 5-year intervals: 0, 5, 10, 15, 20, 25
    ],
    effectiveReturn: 6.8 // Calculated effective annual return
};
```

## Validation Requirements
- Balance values must be non-negative
- Contribution rates within 0-100% range
- Investment returns must be positive
- Fee calculations account for participant count > 0
- Auto-escalation cannot exceed maximum rate
- Results are deterministic (same inputs = same outputs)

## Error Handling
- Invalid parameters return meaningful error messages
- Division by zero protection (participants = 0)
- Overflow protection for extreme values
- Graceful degradation for missing optional parameters

## Testing Requirements
```javascript
// Unit test examples
testCurrentScenario(validInputs, expectedOutput);
testAutoEscalation(escalationInputs, expectedRates);
testFeeCalculations(feeStructures, expectedFees);
testEdgeCases(extremeInputs, expectedBehavior);
```

## Performance Requirements
- 25-year calculation: < 200ms
- Memory efficient (no memory leaks in loops)
- Handles plans up to 10,000 participants

## Files to Create/Modify
- `results.js` - Main calculation functions
- `financial-calculator.js` - Core calculation engine (if separate)
- Test files for validation

## Dependencies
- Valid form data from localStorage
- Proper error handling infrastructure

---
**Created:** 2025-01-04
**Assignee:** Development Team
**Labels:** calculations, finance, core-logic