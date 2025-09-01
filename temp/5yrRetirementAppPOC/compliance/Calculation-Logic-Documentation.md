# Retirement Plan Growth Calculation Logic
**Compliance Documentation**

## Executive Summary

This document explains the mathematical methodology used in the 5-Year Retirement Plan Evaluation App to project average account balance growth over 25 years. The calculations use standard financial modeling principles with monthly compounding, realistic contribution patterns, and industry-standard fee structures.

## Core Calculation Methodology

### 1. Monthly Compounding Formula

The application uses monthly compounding to accurately reflect how retirement accounts grow throughout the year:

**Basic Monthly Growth Calculation:**
```
Starting Balance: $50,000 (example)
Monthly Contribution: $400 (employee) + $150 (employer) = $550 total
Monthly Return Rate: 7% annual ÷ 12 months = 0.583% per month

Month 1:
New Balance = ($50,000 + $550) × (1 + 0.00583) = $50,844.51

Month 2: 
New Balance = ($50,844.51 + $550) × (1 + 0.00583) = $51,695.28
```

This process repeats for 12 months per year, for 25 years (300 total months).

### 2. Annual Fee Deduction

At the end of each year, applicable fees are deducted from the account balance:

**Fee Calculation Examples:**
- **Basis Points Fee:** 50 basis points = 0.50% of account balance
  - Account Balance: $75,000
  - Annual Fee: $75,000 × 0.005 = $375

- **Flat + Per Participant Fee:** $5,000 base + $25 per participant
  - For 100 participants: $5,000 + ($25 × 100) = $7,500 total
  - Per participant impact: $7,500 ÷ 100 = $75 per person

## Four Projection Scenarios

### Scenario 1: Current Plan (Status Quo)
Uses actual current contribution rates and employer matching patterns.

**Contribution Calculation:**
- Employee Rate: Current average (e.g., 6% of salary)
- Employer Rate: Current average contribution (e.g., 3% of salary)
- Match Utilization: Current percentage maximizing match (e.g., 75%)

**Example with $65,000 salary:**
- Monthly Employee Contribution: ($65,000 × 6%) ÷ 12 = $325
- Monthly Employer Contribution: ($65,000 × 3%) ÷ 12 = $162.50
- Total Monthly Contributions: $487.50

### Scenario 2: 10% Employee Contribution
Models improved employee engagement with 10% contribution rate.

**Enhanced Assumptions:**
- Employee Rate: Fixed at 10% of salary
- Match Utilization: Current rate + 30% improvement (capped at 100%)
- Employer Contribution: Based on improved match utilization

**Enhanced Match Calculation:**
- Maximum possible match: 3% of salary
- Current utilization: 75% of eligible employees
- Improved utilization: 75% + 30% = 100% (capped)
- Employer monthly contribution: ($65,000 × 3% × 100%) ÷ 12 = $162.50

### Scenario 3: 15% Employee Contribution
Models aggressive savings behavior with 15% contribution rate.

**Enhanced Assumptions:**
- Employee Rate: Fixed at 15% of salary
- Match Utilization: Current rate + 40% improvement (capped at 100%)
- Represents participants following retirement planning best practices

**Example Calculation:**
- Monthly Employee Contribution: ($65,000 × 15%) ÷ 12 = $812.50
- Monthly Employer Contribution: Same enhanced match as Scenario 2
- Total Monthly Contributions: $975.00

### Scenario 4: Auto-Enrollment Impact
Models the behavioral impact of switching to auto-enrollment.

**Behavioral Modeling:**
- **Current Opt-In Plans:** Default to 3% employee rate with 80% increase in match utilization
- **Existing Auto-Enroll Plans:** 20% increase in contribution rate with 25% match improvement

**Research Basis:** Industry studies show auto-enrollment can triple participation rates and significantly improve match utilization among enrolled participants.

## Auto-Escalation Logic

When auto-escalation is enabled:

**Annual Increase Calculation:**
- Year 1: Starting employee contribution rate (e.g., 6%)
- Year 2: Previous rate + 1% = 7%
- Year 3: Previous rate + 1% = 8%
- Continues until maximum rate reached (e.g., 15%)

**Example Over Time:**
```
Year 1: 6% contribution = $325/month
Year 2: 7% contribution = $379/month  
Year 3: 8% contribution = $433/month
...continues until maximum rate
```

## Fee Structure Handling

### Investment Fees (Always Paid by Employees)
Investment fees are **always deducted from employee account balances** regardless of the fee payment designation selected for other plan fees.

- Calculated as basis points of account balance
- Applied annually with no employer subsidy option
- Example: 75 basis points = 0.75% of balance annually
- **Rationale:** Investment fees are embedded in mutual fund expense ratios and cannot be separated from employee accounts

### Administrative Fees (Variable Payment Structure)

Administrative fees include Record Keeper, Advisor, TPA, and Audit fees. These can be structured and paid in different ways:

**Fee Structure Options:**

**Option 1: Basis Points**
- Record Keeper: 25-75 basis points typical
- Advisor: 40-100 basis points typical
- Calculated as percentage of total plan assets, divided by participants

**Option 2: Flat + Per Participant**
- Record Keeper: $5,000-$25,000 base + $15-$50 per participant
- Advisor: $8,000-$30,000 base + $25-$75 per participant
- TPA: Always flat + per participant structure

**Fee Payment Allocation (Administrative Fees Only):**

The "Fees Paid By" setting determines who bears the cost of administrative fees:

- **Employer Paid:** Administrative fees have no impact on employee account balances
  - Employer absorbs all Record Keeper, Advisor, TPA, and Audit fees
  - Employees still pay Investment fees (cannot be avoided)

- **Employee Paid:** All administrative fees reduce employee account balances
  - Employees pay Investment fees PLUS all administrative fees
  - Maximum fee burden on participants

- **Split:** Administrative fees shared equally between employer and employees
  - Employer pays 50% of administrative fees
  - Employees pay 50% of administrative fees PLUS all Investment fees

### Fee Calculation Examples

**Example Plan:** 100 participants, $5M in total assets, $50,000 average balance

**Fees Structure:**
- Investment Fee: 75 basis points
- Record Keeper: 50 basis points 
- Advisor: 60 basis points
- TPA: $3,000 flat + $20 per participant
- Audit: 25 basis points

**Annual Fee Calculations:**
- Investment Fee: $5,000,000 × 0.0075 = $37,500 (always on employees)
- Record Keeper: $5,000,000 × 0.0050 = $25,000
- Advisor: $5,000,000 × 0.0060 = $30,000  
- TPA: $3,000 + ($20 × 100) = $5,000
- Audit: $5,000,000 × 0.0025 = $12,500
- **Total Administrative Fees:** $72,500

**Impact on Average Employee Account ($50,000 balance):**

| Fee Payment Method | Employee Pays | Annual Impact | % of Balance |
|-------------------|---------------|---------------|--------------|
| Employer Paid | Investment only | $375 | 0.75% |
| Employee Paid | All fees | $1,100 | 2.20% |
| Split | Investment + 50% admin | $737.50 | 1.48% |

## Key Assumptions and Limitations

### Conservative Assumptions
1. **Investment Returns:** Uses single annual rate (typically 6-8%) rather than variable market returns
2. **Salary Growth:** Assumes constant salary throughout projection period
3. **Contribution Consistency:** Assumes steady contribution behavior
4. **Fee Stability:** Uses current fee structure throughout 25-year period

### Industry Benchmarks Used
1. **Participation Rates:** Based on Plan Sponsor Council of America data
2. **Contribution Rates:** Industry averages from Vanguard "How America Saves" reports
3. **Fee Ranges:** Typical ranges from 401(k) Averages Book and industry surveys
4. **Match Utilization:** Conservative estimates based on behavioral finance research

### Excluded Factors
The model does not account for:
- Market volatility or recession impacts
- Inflation adjustments to contributions or fees
- Participant turnover or new hires
- Regulatory changes affecting contribution limits
- Individual participant variations in age, salary, or tenure

## Validation and Reasonableness Checks

### Mathematical Validation
1. **Conservation of Value:** All money is accounted for in contributions, growth, or fees
2. **Compound Interest:** Uses standard financial formulas verified against Excel calculations
3. **Fee Mathematics:** Basis point and flat fee calculations verified independently

### Reasonableness Testing
1. **Growth Rates:** Final balances align with standard retirement calculators
2. **Fee Impact:** Fee deductions match industry expense ratio impacts
3. **Scenario Differences:** Improvements between scenarios reflect expected behavioral changes

### Example 25-Year Projection Summary
**Starting Parameters:**
- Average Account Balance: $50,000
- Average Salary: $65,000  
- Investment Return: 7% annually
- Current Employee Rate: 6%
- Current Employer Rate: 3%

**Projected Final Balances (before considering new contributions from others):**
- Current Plan: ~$420,000
- 10% Contribution: ~$585,000  
- 15% Contribution: ~$750,000
- Auto-Enrollment: ~$525,000

These projections represent the mathematical result of the compound growth formula applied consistently over 25 years with the stated assumptions.

## Compliance Considerations

### Fiduciary Standards
- Projections are for illustration purposes only
- Results depend on actual market performance and participant behavior
- Past performance does not guarantee future results
- Individual results will vary based on personal circumstances

### Disclosure Requirements
- All assumptions clearly documented and available to participants
- Fee impact calculations transparent and verifiable
- Scenarios represent possible outcomes, not guaranteed results
- Professional investment advice recommended for individual situations

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-04  
**Prepared for:** Compliance Review  
**Technical Contact:** Development Team