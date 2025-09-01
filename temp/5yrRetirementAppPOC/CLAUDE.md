# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a 5-Year Retirement Plan Evaluation App designed for retirement plan consultants. The application focuses on:

- Evaluating current client plan engagement and contribution patterns
- Modeling plan design modifications and their impact on long-term outcomes
- Visualizing total plan assets, average employee account balances, and career-long retirement outcomes

## Target Users

- Retirement plan consultants
- Financial advisors specializing in employer-sponsored retirement plans  
- HR professionals managing company retirement benefits

## Current State

This repository contains a complete retirement plan evaluation application with participant engagement tools:

- `index.html` - Main setup form with all required input fields including engagement parameters
- `results.html` - Results page with line chart visualization and data table
- `engagement.html` - Participant engagement analysis dashboard with behavioral insights
- `demo.html` - Interactive demo tool for quick client presentations
- `styles.css` - Responsive CSS styling with professional design
- `script.js` - Form validation, interactions, and data handling
- `results.js` - Asset growth calculations and Chart.js visualization
- `engagement.js` - Behavioral analytics and engagement modeling
- `test.html` - Simple test page for debugging data flow
- `README.md` - Project overview and requirements framework

## Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid, Flexbox, CSS Custom Properties, Responsive design
- **Charting**: Chart.js (CDN) for line and bar chart visualization
- **Data Persistence**: localStorage for client-side data storage
- **Local Development**: Python HTTP server or any static file server

## Key Features

### Setup Input Form
- 15+ input fields for retirement plan parameters
- Real-time form validation with error messaging
- Auto escalation conditional logic
- Currency and percentage formatting
- Data persistence via localStorage
- **New:** Engagement parameters (enrollment method, vesting, investment options, demographics)

### Results Visualization
- 25-year projection line chart (5-year increments)
- Monthly compounding calculations
- Fee impact analysis (investment fees always paid by employees)
- Summary cards showing key metrics
- Detailed projection data table
- Export functionality for setup data
- **New:** Auto-enrollment scenario modeling

### Engagement Analysis Dashboard (Single-Page App)
- **Plan Performance Assessment:** Side-by-side comparison of current plan vs. industry excellence standards
- **Interactive Feature Configuration:** Live plan feature controls (auto-enrollment, auto-escalation, match rates, vesting, fees)
- **Real-time Impact Modeling:** Charts and metrics update instantly based on feature configuration changes
- **25-Year Asset Growth Projections:** Integrated asset projection charts showing current vs. enhanced plan scenarios
- **Priority Improvement Recommendations:** Gap-based strategic guidance targeting below-target metrics
- **Behavioral Insights:** Participation patterns by age, contribution lifecycle modeling
- **Scenario Comparison:** Current vs. auto-enrollment vs. enhanced engagement tabs
- **Plan Participation Health Scoring:** Composite metric weighted by participation (40%), contribution adequacy (35%), match utilization (25%)
- **Strategic Recommendations:** Automated advice based on plan characteristics and performance gaps

### Interactive Demo Tool
- **Quick Setup:** Preset configurations for small/medium/large plans
- **Real-time Modeling:** Instant scenario comparison with visual feedback
- **Client Presentation:** Mobile-responsive design for consultant meetings
- **Export Capability:** Demo data export for client follow-up

## Development Commands

### Running the Application
```bash
# Start local development server (Python 3)
python3 -m http.server 8000

# Alternative with Python 2
python -m SimpleHTTPServer 8000

# Then open http://localhost:8000 in your browser
```

### Testing & Debugging
```bash
# Use test.html for quick debugging and data flow testing
# Open http://localhost:8000/test.html after starting server
# Test page provides buttons to populate localStorage with sample data
```

- Manual testing through browser interface
- Form validation testing with various input scenarios  
- Responsive design testing across different screen sizes
- Use `test.html` for debugging data persistence and calculations

## Key Functional Areas (Planned)

### Current State Analysis
- Plan participation rate assessment
- Contribution pattern analysis
- Plan engagement metrics evaluation

### Plan Design Impact Modeling  
- Scenario modeling for design changes
- Long-term asset growth projections
- Career-span employee balance analysis

### Reporting & Visualization
- Interactive charts and graphs
- Comparative analysis between current/proposed designs
- Career timeline visualizations

## Architecture & Code Structure

### Data Flow
1. **Input Collection**: `index.html` + `script.js` collect user inputs with real-time validation
2. **Data Persistence**: Form data stored in localStorage as JSON
3. **Engagement Analysis**: `engagement.js` calculates behavioral metrics and plan performance assessment
4. **Interactive Modeling**: Feature configuration changes trigger real-time updates to metrics and projections
5. **Financial Calculations**: Asset projections calculated with monthly compounding based on feature settings
6. **Visualization**: Chart.js renders interactive charts that update dynamically with configuration changes
7. **Export**: Results and engagement reports can be exported as JSON data

### Key Components

#### Form Validation (`script.js`)
- Real-time field validation with error messaging
- Conditional logic for auto-escalation fields
- Business rule validation (participants ≤ eligible employees)
- Currency and percentage formatting
- Form reset functionality

#### Financial Calculations (`results.js` & `engagement.js`)
- **Projection Scenarios**: Current plan, 10% contribution, 15% contribution, auto-enrollment with behavioral modeling
- **Monthly Compounding**: Investment returns calculated monthly over 25 years
- **Auto Escalation**: Annual contribution rate increases when enabled
- **Fee Management**: Flexible fee allocation (employer/employee/split)
- **Chart Data**: 5-year intervals for visualization, annual data for detailed table
- **Feature Impact Modeling**: Real-time asset projection calculations based on plan feature changes

#### Engagement Analytics (`engagement.js`)
- **Plan Performance Assessment**: Industry benchmarking with visual gap indicators
- **Feature Configuration Engine**: Interactive controls for plan design modifications
- **Real-time Impact Calculations**: Live updates to participation, contribution, and match utilization metrics
- **Asset Projection Integration**: 25-year growth projections responsive to feature configuration
- **Behavioral Modeling**: Research-based multipliers for auto-enrollment, vesting, and engagement features
- **Priority Recommendations**: Gap-based strategic guidance system

#### Styling Architecture (`styles.css`)
- CSS Grid for responsive form layouts
- CSS Custom Properties for consistent theming
- Professional gradient backgrounds and card-based design
- Mobile-first responsive design patterns

### Important Calculations
- Investment fees are always paid by employees regardless of other fee settings
- Employer match utilization varies by scenario (current/optimized/10%/auto-enrollment)
- Monthly compounding with annual fee deductions
- Auto escalation caps at specified maximum rate

### Engagement Modeling Methodology
- **Auto-enrollment Impact:** Research-based 2.8x participation multiplier, 1.8x match utilization boost
- **Behavioral Factors:** Age-based contribution patterns, tenure impact on engagement
- **Readiness Scoring:** Composite metric weighted by participation (40%), contribution adequacy (35%), match utilization (25%)
- **Scenario Assumptions:** Auto-enrollment defaults to 3% contribution, enhanced engagement adds behavioral nudges

### Navigation Flow
1. **Setup Form** (`index.html`) → Collect plan parameters and engagement factors
2. **Engagement Analysis** (`engagement.html`) → **Primary Dashboard**: Complete single-page app with plan assessment, feature configuration, asset projections, and recommendations
3. **Results Projections** (`results.html`) → Detailed financial modeling and comparative growth charts
4. **Interactive Demo** (`demo.html`) → Quick client presentation tool

### Current Implementation Status

#### Completed Features
- ✅ **Complete Setup Form**: All input fields with validation and data persistence
- ✅ **Engagement Dashboard**: Full single-page application with integrated features
- ✅ **Plan Performance Assessment**: Current vs. industry targets with visual gap indicators
- ✅ **Interactive Feature Configuration**: Live controls for auto-enrollment, auto-escalation, match rates, vesting, investment options, and fees
- ✅ **Real-time Impact Modeling**: Instant updates to charts and metrics when features change
- ✅ **Asset Projection Integration**: 25-year growth charts embedded in engagement dashboard
- ✅ **Priority Improvement System**: Gap-based recommendations targeting specific deficiencies
- ✅ **Scenario Comparison**: Tabbed interface for current, auto-enrollment, and enhanced engagement views
- ✅ **Behavioral Analytics**: Age-based participation patterns and engagement journey modeling
- ✅ **Plan Participation Health Scoring**: Composite metrics with industry benchmarking
- ✅ **Export Functionality**: Data export for both setup and engagement analysis
- ✅ **Results Page**: Separate detailed financial projections with 10% and 15% contribution scenarios
- ✅ **Demo Tool**: Interactive client presentation interface
- ✅ **Test Infrastructure**: Debugging tools and sample data population

#### Key Metrics Calculated
- **Participation Rate**: Current plan enrollment percentage with improvement projections
- **Average Savings Rate**: Employee contribution levels with auto-escalation modeling
- **Match Utilization**: Employer match participation with enhancement potential
- **Plan Participation Health Score**: Composite metric (40% participation, 35% contribution, 25% match)
- **25-Year Asset Projections**: Total plan assets and average account balances
- **Feature Impact Analysis**: Real-time calculations of plan design change effects

#### Research-Based Modeling
- **Auto-enrollment Impact**: 2.8x participation increase, 1.4x match utilization improvement
- **Vesting Schedule Effects**: Immediate vesting 15% participation boost, graded vesting impacts
- **Investment Menu Optimization**: 10-15 options ideal, 25+ options reduce participation
- **Auto-escalation Benefits**: 1-2% annual contribution rate increases over time
- **Behavioral Nudges**: Enhanced engagement programs provide additional 15% improvements