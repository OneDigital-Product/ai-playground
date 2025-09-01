document.addEventListener('DOMContentLoaded', function() {
    console.log('Engagement analysis page loaded');
    
    // Get data from localStorage
    const setupDataString = localStorage.getItem('planSetupData');
    const setupData = JSON.parse(setupDataString || '{}');
    
    if (Object.keys(setupData).length === 0) {
        alert('No setup data found. Please complete the setup form first.');
        window.location.href = 'index.html';
        return;
    }

    // Parse setup data
    const eligibleEmployees = parseInt(setupData.eligibleEmployees) || 0;
    const participants = parseInt(setupData.participants) || 0;
    const avgSalary = parseFloat(setupData.avgSalary) || 0;
    const avgAccountBalance = parseFloat(setupData.avgAccountBalance) || 0;
    const investmentReturn = parseFloat(setupData.investmentReturn) || 0;
    const employeeContribRate = parseFloat(setupData.employeeContribRate) || 0;
    const employerContribRate = parseFloat(setupData.employerContribRate) || 0;
    const employer401kMatch = parseFloat(setupData.employer401kMatch) || 0;
    const participantsMaxMatch = parseFloat(setupData.participantsMaxMatch) || 0;
    const autoEscalation = setupData.autoEscalation === 'yes';
    const maxAutoEscalationRate = parseFloat(setupData.maxAutoEscalationRate) || 0;
    const enrollmentMethod = setupData.enrollmentMethod || 'opt-in';
    const defaultAutoContribRate = parseFloat(setupData.defaultAutoContribRate) || 3;
    const vestingSchedule = setupData.vestingSchedule || 'immediate';
    const investmentOptions = parseInt(setupData.investmentOptions) || 12;
    const avgTenure = parseFloat(setupData.avgTenure) || 5;
    const avgAge = parseInt(setupData.avgAge) || 42;

    // Calculate engagement metrics
    const engagementData = calculateEngagementMetrics();
    
    // Update UI with error handling
    try {
        updateEngagementMetrics(engagementData);
        updateReportCard(engagementData);
        createEngagementCharts(engagementData);
        generatePriorityImprovements(engagementData);
        generateRecommendations(engagementData);
    } catch (error) {
        console.error('Error updating engagement page:', error);
        // Show a basic fallback if charts fail
        document.getElementById('participationRate').textContent = `${engagementData.current.participation.toFixed(1)}%`;
        document.getElementById('avgContribRate').textContent = `${engagementData.current.avgContribution.toFixed(1)}%`;
        document.getElementById('matchUtilization').textContent = `${engagementData.current.matchUtilization.toFixed(1)}%`;
        document.getElementById('readinessScore').textContent = engagementData.current.readiness;
    }
    
    // Set up scenario tabs
    setupScenarioTabs();
    
    // Initialize feature configuration
    initializeFeatureConfiguration();
    
    // Initialize asset projection charts
    createAssetProjectionCharts();

    function calculateEngagementMetrics() {
        const currentParticipationRate = eligibleEmployees > 0 ? (participants / eligibleEmployees) * 100 : 0;
        
        // Research-based engagement modeling
        const engagementFactors = {
            enrollmentMethod: enrollmentMethod === 'auto-enroll' ? 1.5 : 1.0, // Auto-enrollment can triple participation
            vestingSchedule: vestingSchedule === 'immediate' ? 1.2 : (vestingSchedule === '3-year' ? 1.1 : 1.0),
            investmentOptions: investmentOptions >= 10 && investmentOptions <= 15 ? 1.1 : (investmentOptions > 20 ? 0.9 : 1.0),
            avgAge: avgAge < 30 ? 0.8 : (avgAge > 50 ? 1.3 : 1.0),
            avgTenure: avgTenure > 3 ? 1.2 : 0.9
        };

        // Calculate projected engagement improvements
        const autoEnrollProjection = Math.min(95, currentParticipationRate * 2.8); // Auto-enrollment typically triples participation
        const enhancedProjection = Math.min(98, autoEnrollProjection * 1.15); // Additional behavioral enhancements
        
        // Contribution rate projections
        const currentAvgContrib = employeeContribRate;
        const autoEnrollAvgContrib = enrollmentMethod === 'auto-enroll' ? 
            Math.max(currentAvgContrib, defaultAutoContribRate) : defaultAutoContribRate;
        const enhancedAvgContrib = autoEnrollAvgContrib * 1.25; // Auto-escalation and education boost
        
        // Match utilization calculations
        const currentMatchUtil = participantsMaxMatch;
        const autoEnrollMatchUtil = Math.min(100, currentMatchUtil * 1.4);
        const enhancedMatchUtil = Math.min(100, autoEnrollMatchUtil * 1.1);
        
        // Retirement readiness scoring (0-100)
        const baseReadiness = calculateRetirementReadiness(currentParticipationRate, currentAvgContrib, currentMatchUtil);
        const autoEnrollReadiness = calculateRetirementReadiness(autoEnrollProjection, autoEnrollAvgContrib, autoEnrollMatchUtil);
        const enhancedReadiness = calculateRetirementReadiness(enhancedProjection, enhancedAvgContrib, enhancedMatchUtil);

        return {
            current: {
                participation: currentParticipationRate,
                avgContribution: currentAvgContrib,
                matchUtilization: currentMatchUtil,
                readiness: baseReadiness
            },
            autoEnroll: {
                participation: autoEnrollProjection,
                avgContribution: autoEnrollAvgContrib,
                matchUtilization: autoEnrollMatchUtil,
                readiness: autoEnrollReadiness
            },
            enhanced: {
                participation: enhancedProjection,
                avgContribution: enhancedAvgContrib,
                matchUtilization: enhancedMatchUtil,
                readiness: enhancedReadiness
            },
            demographics: calculateDemographicInsights(),
            behavioralPattern: calculateBehavioralPatterns()
        };
    }

    function calculateRetirementReadiness(participation, contribution, matchUtil) {
        // Weighted scoring based on research insights
        const participationWeight = 0.4;
        const contributionWeight = 0.35;
        const matchWeight = 0.25;
        
        const participationScore = Math.min(100, participation);
        const contributionScore = Math.min(100, (contribution / 10) * 100); // 10% contribution = 100 score
        const matchScore = matchUtil;
        
        return Math.round(
            (participationScore * participationWeight) +
            (contributionScore * contributionWeight) +
            (matchScore * matchWeight)
        );
    }

    function calculateDemographicInsights() {
        // Generate age-based contribution patterns based on research
        const ageGroups = [
            { age: '20-29', participation: avgAge < 30 ? 45 : 35, contribution: 4.2 },
            { age: '30-39', participation: avgAge >= 30 && avgAge < 40 ? 72 : 65, contribution: 6.1 },
            { age: '40-49', participation: avgAge >= 40 && avgAge < 50 ? 85 : 78, contribution: 8.3 },
            { age: '50-59', participation: avgAge >= 50 && avgAge < 60 ? 92 : 85, contribution: 11.2 },
            { age: '60+', participation: avgAge >= 60 ? 95 : 88, contribution: 13.8 }
        ];
        
        return ageGroups;
    }

    function calculateBehavioralPatterns() {
        // Model typical participant journey based on tenure and engagement factors
        const journeyStages = [
            { stage: 'Enrollment', current: participants / eligibleEmployees * 100, potential: 95 },
            { stage: 'Initial Contribution', current: employeeContribRate, potential: 6 },
            { stage: 'Match Awareness', current: participantsMaxMatch, potential: 90 },
            { stage: 'Optimization', current: participantsMaxMatch * 0.8, potential: 85 },
            { stage: 'Long-term Planning', current: 45, potential: 75 }
        ];
        
        return journeyStages;
    }

    function updateEngagementMetrics(data) {
        document.getElementById('participationRate').textContent = `${data.current.participation.toFixed(1)}%`;
        document.getElementById('avgContribRate').textContent = `${data.current.avgContribution.toFixed(1)}%`;
        document.getElementById('matchUtilization').textContent = `${data.current.matchUtilization.toFixed(1)}%`;
        document.getElementById('readinessScore').textContent = data.current.readiness;
        
        // Calculate and display improvement potential
        const participationGain = data.autoEnroll.participation - data.current.participation;
        const contribGain = data.autoEnroll.avgContribution - data.current.avgContribution;
        const matchGain = data.autoEnroll.matchUtilization - data.current.matchUtilization;
        const readinessGain = data.autoEnroll.readiness - data.current.readiness;
        
        updateChangeIndicator('participationChange', participationGain, '%');
        updateChangeIndicator('contribChange', contribGain, '%');
        updateChangeIndicator('matchChange', matchGain, '%');
        updateChangeIndicator('readinessChange', readinessGain, ' pts');
    }

    function updateChangeIndicator(elementId, change, suffix) {
        const element = document.getElementById(elementId);
        if (change > 0) {
            element.textContent = `+${change.toFixed(1)}${suffix} potential`;
            element.className = 'metric-change positive';
        } else if (change < 0) {
            element.textContent = `${change.toFixed(1)}${suffix}`;
            element.className = 'metric-change negative';
        } else {
            element.textContent = 'No change';
            element.className = 'metric-change';
        }
    }

    function updateReportCard(data) {
        // Define industry best practice targets
        const targets = {
            participation: 85,
            contribution: 8,
            matchUtilization: 90,
            readiness: 75
        };

        // Update current values in report card
        document.getElementById('reportParticipationCurrent').textContent = `${data.current.participation.toFixed(1)}%`;
        document.getElementById('reportContribCurrent').textContent = `${data.current.avgContribution.toFixed(1)}%`;
        document.getElementById('reportMatchCurrent').textContent = `${data.current.matchUtilization.toFixed(1)}%`;
        document.getElementById('reportReadinessCurrent').textContent = data.current.readiness;

        // Calculate gaps and update indicators
        const participationGap = data.current.participation - targets.participation;
        const contribGap = data.current.avgContribution - targets.contribution;
        const matchGap = data.current.matchUtilization - targets.matchUtilization;
        const readinessGap = data.current.readiness - targets.readiness;

        // Update gap indicators
        updateGapIndicator('participationGap', 'participationGapBar', participationGap, '%');
        updateGapIndicator('contribGap', 'contribGapBar', contribGap, '%');
        updateGapIndicator('matchGap', 'matchGapBar', matchGap, '%');
        updateGapIndicator('readinessGap', 'readinessGapBar', readinessGap, ' pts');

        // Calculate overall grade
        const overallScore = calculateOverallGrade(data.current, targets);
        updateOverallGrade(overallScore);
    }

    function updateGapIndicator(gapId, barId, gap, suffix) {
        const gapElement = document.getElementById(gapId);
        const barElement = document.getElementById(barId);
        
        const gapText = gap > 0 ? `+${gap.toFixed(1)}${suffix}` : `${gap.toFixed(1)}${suffix}`;
        const gapSpan = gapElement.querySelector('span');
        gapSpan.textContent = `vs Target: ${gapText}`;
        
        // Color code the gap indicator
        if (gap >= 0) {
            gapElement.className = 'gap-indicator positive';
            barElement.className = 'gap-bar-fill positive';
            barElement.style.width = '100%';
        } else if (gap > -10) {
            gapElement.className = 'gap-indicator negative';
            barElement.className = 'gap-bar-fill needs-improvement';
            barElement.style.width = `${Math.max(20, 100 + (gap * 5))}%`;
        } else {
            gapElement.className = 'gap-indicator negative';
            barElement.className = 'gap-bar-fill critical';
            barElement.style.width = '20%';
        }
    }

    function calculateOverallGrade(current, targets) {
        // Calculate percentage of targets met
        const participationScore = Math.min(100, (current.participation / targets.participation) * 100);
        const contribScore = Math.min(100, (current.avgContribution / targets.contribution) * 100);
        const matchScore = Math.min(100, (current.matchUtilization / targets.matchUtilization) * 100);
        const readinessScore = Math.min(100, (current.readiness / targets.readiness) * 100);
        
        // Weighted average (participation and readiness are most important)
        const weightedScore = (
            participationScore * 0.3 +
            contribScore * 0.25 +
            matchScore * 0.25 +
            readinessScore * 0.2
        );
        
        return Math.round(weightedScore);
    }

    function updateOverallGrade(score) {
        const ratingElement = document.getElementById('overallRating');
        const descriptionElement = document.getElementById('ratingDescription');
        
        let rating, description;
        
        if (score >= 90) {
            rating = 'Excellent';
            description = 'Outstanding performance across all key metrics';
        } else if (score >= 80) {
            rating = 'Very Good';
            description = 'Strong foundation with minor enhancement opportunities';
        } else if (score >= 70) {
            rating = 'Good';
            description = 'Solid performance with clear improvement potential';
        } else if (score >= 60) {
            rating = 'Fair';
            description = 'Average performance with significant enhancement opportunities';
        } else if (score >= 50) {
            rating = 'Needs Improvement';
            description = 'Below industry standards - strategic enhancements recommended';
        } else {
            rating = 'Requires Attention';
            description = 'Comprehensive plan review and improvements needed';
        }
        
        ratingElement.textContent = rating;
        descriptionElement.textContent = description;
    }

    function generatePriorityImprovements(data) {
        const priorities = [];
        
        // Define industry targets
        const targets = {
            participation: 85,
            contribution: 8,
            matchUtilization: 90
        };

        // Calculate gaps for current scenario
        const participationGap = data.current.participation - targets.participation;
        const contribGap = data.current.avgContribution - targets.contribution;
        const matchGap = data.current.matchUtilization - targets.matchUtilization;

        // Priority 1: Participation Rate (if below target)
        if (participationGap < 0) {
            const gapSize = Math.abs(participationGap);
            const potentialNewParticipants = Math.round((gapSize/100) * eligibleEmployees);
            
            let urgency, actionPlan;
            if (gapSize > 20) {
                urgency = 'Critical';
                actionPlan = `Your participation rate is ${gapSize.toFixed(1)} points below industry standards. This represents ${potentialNewParticipants} employees not participating in retirement savings.`;
            } else if (gapSize > 10) {
                urgency = 'High';
                actionPlan = `Participation is ${gapSize.toFixed(1)} points below target. ${potentialNewParticipants} additional employees could benefit from plan participation.`;
            } else {
                urgency = 'Moderate';
                actionPlan = `Close to target but ${gapSize.toFixed(1)} points below industry benchmark. ${potentialNewParticipants} more participants would reach excellence standards.`;
            }

            priorities.push({
                metric: 'Employee Participation',
                current: `${data.current.participation.toFixed(1)}%`,
                target: `${targets.participation}%+`,
                gap: `${gapSize.toFixed(1)} points below`,
                urgency: urgency,
                impact: `${potentialNewParticipants} additional participants`,
                actionPlan: actionPlan,
                strategies: enrollmentMethod === 'opt-in' ? 
                    ['Implement auto-enrollment', 'Enhance new hire enrollment process', 'Targeted employee education campaigns'] :
                    ['Improve enrollment communication', 'Address participation barriers', 'Enhanced onboarding process']
            });
        }

        // Priority 2: Savings Rate (if below target)
        if (contribGap < 0) {
            const gapSize = Math.abs(contribGap);
            const additionalSavings = Math.round(participants * avgSalary * (gapSize/100));
            
            let urgency, actionPlan;
            if (gapSize > 3) {
                urgency = 'High';
                actionPlan = `Average savings rate is ${gapSize.toFixed(1)} points below the 8% adequacy target. Employees may not be saving enough for retirement.`;
            } else {
                urgency = 'Moderate';
                actionPlan = `Savings rate is ${gapSize.toFixed(1)} points below target. Small improvements could significantly impact retirement outcomes.`;
            }

            priorities.push({
                metric: 'Average Savings Rate',
                current: `${data.current.avgContribution.toFixed(1)}%`,
                target: `${targets.contribution}%+`,
                gap: `${gapSize.toFixed(1)} points below`,
                urgency: urgency,
                impact: `$${additionalSavings.toLocaleString()} additional annual savings`,
                actionPlan: actionPlan,
                strategies: setupData.autoEscalation === 'yes' ? 
                    ['Increase default contribution rates', 'Enhanced contribution rate education', 'Salary increase campaigns'] :
                    ['Implement auto-escalation', 'Contribution rate education', 'Annual enrollment campaigns']
            });
        }

        // Priority 3: Match Participation (if below target)
        if (matchGap < 0) {
            const gapSize = Math.abs(matchGap);
            const unusedMatch = Math.round((gapSize/100) * participants * avgSalary * (employer401kMatch/100));
            
            let urgency, actionPlan;
            if (gapSize > 15) {
                urgency = 'Critical';
                actionPlan = `Only ${data.current.matchUtilization.toFixed(1)}% of participants maximize their employer match. Employees are leaving significant "free money" on the table.`;
            } else if (gapSize > 5) {
                urgency = 'High';
                actionPlan = `Match participation is ${gapSize.toFixed(1)} points below target. Enhanced education could help employees capture more employer contributions.`;
            } else {
                urgency = 'Moderate';
                actionPlan = `Close to target but ${gapSize.toFixed(1)} points below optimal match utilization.`;
            }

            priorities.push({
                metric: 'Match Participation',
                current: `${data.current.matchUtilization.toFixed(1)}%`,
                target: `${targets.matchUtilization}%+`,
                gap: `${gapSize.toFixed(1)} points below`,
                urgency: urgency,
                impact: `$${unusedMatch.toLocaleString()} potential additional match utilization`,
                actionPlan: actionPlan,
                strategies: ['Enhanced match education campaigns', 'Contribution calculators and tools', 'Personalized match statements', 'Annual match optimization reviews']
            });
        }

        // Render priority improvements
        const container = document.getElementById('priorityImprovements');
        
        if (priorities.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 30px; background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%); border-radius: 10px; border: 2px solid #27ae60;">
                    <h3 style="color: #27ae60; margin: 0 0 10px 0;">🎯 Excellent Performance</h3>
                    <p style="margin: 0; color: #2c3e50; font-size: 1.1rem;">Your plan meets or exceeds all industry targets. Focus on maintaining these strong results and exploring advanced engagement features.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = priorities.map(priority => {
            const urgencyColor = priority.urgency === 'Critical' ? '#e74c3c' : 
                                priority.urgency === 'High' ? '#f39c12' : '#3498db';
            
            return `
                <div style="background: white; border-left: 4px solid ${urgencyColor}; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <div>
                            <h3 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 1.2rem;">${priority.metric}</h3>
                            <div style="display: flex; gap: 20px; align-items: center; margin-bottom: 10px;">
                                <span style="font-size: 1.1rem;"><strong>Current:</strong> ${priority.current}</span>
                                <span style="font-size: 1.1rem;"><strong>Target:</strong> ${priority.target}</span>
                                <span style="color: ${urgencyColor}; font-weight: 600;">${priority.gap}</span>
                            </div>
                        </div>
                        <span style="background: ${urgencyColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
                            ${priority.urgency} Priority
                        </span>
                    </div>
                    
                    <div style="background: #f8f9fa; border-radius: 6px; padding: 15px; margin: 15px 0;">
                        <p style="margin: 0 0 10px 0; color: #2c3e50; font-weight: 500;">Expected Impact:</p>
                        <p style="margin: 0; color: #27ae60; font-size: 1.1rem; font-weight: 600;">${priority.impact}</p>
                    </div>
                    
                    <p style="margin: 15px 0; color: #2c3e50; line-height: 1.5;">${priority.actionPlan}</p>
                    
                    <div style="margin-top: 15px;">
                        <p style="margin: 0 0 8px 0; font-weight: 600; color: #2c3e50;">Recommended Strategies:</p>
                        <ul style="margin: 0; padding-left: 20px; color: #2c3e50;">
                            ${priority.strategies.map(strategy => `<li style="margin: 5px 0;">${strategy}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }).join('');
    }

    function createEngagementCharts(data) {
        createParticipationChart(data);
        createReadinessGauge(data);
        createAgePatternChart(data);
        createJourneyChart(data);
        
        // Add asset projection charts
        createAssetProjectionCharts();
    }

    function createParticipationChart(data) {
        const ctx = document.getElementById('participationChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Current Plan', 'Auto-Enrollment', 'Enhanced Engagement'],
                datasets: [
                    {
                        label: 'Participation Rate',
                        data: [
                            data.current.participation,
                            data.autoEnroll.participation,
                            data.enhanced.participation
                        ],
                        backgroundColor: ['#667eea', '#27ae60', '#f39c12'],
                        borderWidth: 0,
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'Participation Rate Comparison'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        },
                        title: {
                            display: true,
                            text: 'Participation Rate (%)'
                        }
                    }
                }
            }
        });
    }

    function createReadinessGauge(data) {
        const ctx = document.getElementById('readinessGauge').getContext('2d');
        const currentScore = data.current.readiness;
        
        // Update the score display
        document.getElementById('readinessGaugeScore').textContent = currentScore;
        
        // Create a doughnut chart that looks like a gauge
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [currentScore, 100 - currentScore],
                    backgroundColor: [
                        currentScore >= 75 ? '#27ae60' : 
                        currentScore >= 60 ? '#f39c12' : '#e74c3c',
                        '#e9ecef'
                    ],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                cutout: '80%'
            }
        });
    }

    function createAgePatternChart(data) {
        const ctx = document.getElementById('agePatternChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.demographics.map(d => d.age),
                datasets: [
                    {
                        label: 'Participation Rate',
                        data: data.demographics.map(d => d.participation),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Avg Contribution Rate',
                        data: data.demographics.map(d => d.contribution),
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Age Group'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Participation Rate (%)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Contribution Rate (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    function createJourneyChart(data) {
        const ctx = document.getElementById('journeyChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: data.behavioralPattern.map(p => p.stage),
                datasets: [
                    {
                        label: 'Current Performance',
                        data: data.behavioralPattern.map(p => p.current),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        pointBackgroundColor: '#667eea'
                    },
                    {
                        label: 'Potential with Enhancements',
                        data: data.behavioralPattern.map(p => p.potential),
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.2)',
                        pointBackgroundColor: '#27ae60'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                }
            }
        });
    }

    function generateRecommendations(data) {
        const recommendations = [];
        
        // Define industry targets for gap analysis
        const targets = {
            participation: 85,
            contribution: 8,
            matchUtilization: 90,
            readiness: 75
        };

        // Calculate gaps
        const participationGap = data.current.participation - targets.participation;
        const contribGap = data.current.avgContribution - targets.contribution;
        const matchGap = data.current.matchUtilization - targets.matchUtilization;
        const readinessGap = data.current.readiness - targets.readiness;

        // Prioritize recommendations based on gaps and impact potential
        let priority = 1;

        // Critical Gap: Participation Rate (most impactful)
        if (participationGap < -10 && enrollmentMethod === 'opt-in') {
            const participationIncrease = data.autoEnroll.participation - data.current.participation;
            const newParticipants = Math.round((participationIncrease/100) * eligibleEmployees);
            recommendations.push({
                priority: priority++,
                title: '🚨 CRITICAL: Implement Auto-Enrollment',
                description: `Your participation rate is ${Math.abs(participationGap).toFixed(1)} points below industry target. Auto-enrollment could add ${newParticipants} participants and increase participation by ${participationIncrease.toFixed(1)} points, moving you from ${data.current.participation.toFixed(1)}% to ${data.autoEnroll.participation.toFixed(1)}%.`,
                impact: 'Critical',
                gapType: 'participation'
            });
        } else if (participationGap < 0 && enrollmentMethod === 'opt-in') {
            const participationIncrease = data.autoEnroll.participation - data.current.participation;
            recommendations.push({
                priority: priority++,
                title: 'Implement Auto-Enrollment',
                description: `Close the ${Math.abs(participationGap).toFixed(1)}-point participation gap with auto-enrollment. This could increase participation by ${participationIncrease.toFixed(1)} percentage points.`,
                impact: 'High',
                gapType: 'participation'
            });
        }

        // Critical Gap: Match Utilization (direct cost impact)
        if (matchGap < -15) {
            const unusedMatchDollars = Math.round(((targets.matchUtilization - data.current.matchUtilization)/100) * participants * avgSalary * (employer401kMatch/100));
            recommendations.push({
                priority: priority++,
                title: '🚨 CRITICAL: Emergency Match Education Campaign',
                description: `Only ${data.current.matchUtilization.toFixed(1)}% of participants maximize their match (${Math.abs(matchGap).toFixed(1)} points below target). Employees are leaving approximately $${unusedMatchDollars.toLocaleString()} in match dollars on the table annually.`,
                impact: 'Critical',
                gapType: 'match'
            });
        } else if (matchGap < 0) {
            const unusedMatchDollars = Math.round(((targets.matchUtilization - data.current.matchUtilization)/100) * participants * avgSalary * (employer401kMatch/100));
            recommendations.push({
                priority: priority++,
                title: 'Enhance Match Communication Strategy',
                description: `Close the ${Math.abs(matchGap).toFixed(1)}-point match utilization gap. Targeted education could help recover $${unusedMatchDollars.toLocaleString()} in unused match dollars annually.`,
                impact: 'High',
                gapType: 'match'
            });
        }

        // Critical Gap: Contribution Adequacy
        if (contribGap < -3) {
            const additionalSavings = Math.round(participants * avgSalary * (Math.abs(contribGap)/100));
            recommendations.push({
                priority: priority++,
                title: '🚨 CRITICAL: Address Contribution Inadequacy',
                description: `Average contribution rate is ${Math.abs(contribGap).toFixed(1)} points below the 8% retirement adequacy target. Auto-escalation and education could help participants save an additional $${additionalSavings.toLocaleString()} annually.`,
                impact: 'Critical',
                gapType: 'contribution'
            });
        } else if (contribGap < 0) {
            recommendations.push({
                priority: priority++,
                title: 'Boost Contribution Rates',
                description: `Average contributions are ${Math.abs(contribGap).toFixed(1)} points below target. Consider auto-escalation and contribution rate education campaigns.`,
                impact: 'High',
                gapType: 'contribution'
            });
        }

        // Auto-escalation (addresses contribution gap)
        if (setupData.autoEscalation !== 'yes' && contribGap < 0) {
            recommendations.push({
                priority: priority++,
                title: 'Add Auto-Escalation Feature',
                description: `Auto-escalation can increase average contribution rates by 2-3 percentage points over time, helping close your ${Math.abs(contribGap).toFixed(1)}-point contribution gap.`,
                impact: 'High',
                gapType: 'contribution'
            });
        }

        // Investment menu optimization (affects engagement)
        if (investmentOptions > 20) {
            recommendations.push({
                priority: priority++,
                title: 'Streamline Investment Menu',
                description: `Your plan offers ${investmentOptions} investment options. Research shows 10-12 options optimize engagement while reducing choice paralysis. This could improve overall engagement scores.`,
                impact: 'Medium',
                gapType: 'engagement'
            });
        }

        // Demographic-specific recommendations
        if (avgAge < 35 && (participationGap < 0 || contribGap < 0)) {
            recommendations.push({
                priority: priority++,
                title: 'Target Younger Employee Engagement',
                description: `Your younger workforce (avg age ${avgAge}) shows typical engagement challenges. Implement mobile-first communication, student loan assistance, and compound growth education to address participation and contribution gaps.`,
                impact: 'Medium',
                gapType: 'demographic'
            });
        }

        // Tenure-based recommendations
        if (avgTenure < 3 && participationGap < 0) {
            recommendations.push({
                priority: priority++,
                title: 'Address High Turnover Impact',
                description: `Short average tenure (${avgTenure} years) limits engagement. Consider immediate vesting and intensive new hire engagement to improve your ${Math.abs(participationGap).toFixed(1)}-point participation gap.`,
                impact: 'Medium',
                gapType: 'demographic'
            });
        }

        // Overall readiness improvement
        if (readinessGap < -10) {
            recommendations.push({
                priority: priority++,
                title: 'Comprehensive Readiness Improvement Plan',
                description: `Overall retirement readiness score is ${Math.abs(readinessGap)} points below target. Implement a multi-faceted approach addressing the gaps identified above to improve long-term outcomes.`,
                impact: 'High',
                gapType: 'overall'
            });
        }

        // If no major gaps, provide optimization recommendations
        if (recommendations.length === 0) {
            recommendations.push({
                priority: 1,
                title: '✅ Plan Performing Well - Optimization Opportunities',
                description: 'Your plan meets or exceeds industry targets. Consider advanced features like managed accounts, financial wellness programs, or retirement income planning to maintain leadership position.',
                impact: 'Enhancement',
                gapType: 'optimization'
            });
        }

        // Sort by priority and render
        recommendations.sort((a, b) => a.priority - b.priority);
        
        const container = document.getElementById('recommendationsList');
        container.innerHTML = recommendations.map(rec => {
            const iconColor = rec.impact === 'Critical' ? '#e74c3c' : 
                             rec.impact === 'High' ? '#f39c12' : '#27ae60';
            const borderColor = rec.impact === 'Critical' ? '#e74c3c' : 
                               rec.impact === 'High' ? '#f39c12' : '#27ae60';
            
            return `
                <div class="recommendation-item" style="border-left-color: ${borderColor}">
                    <div class="recommendation-icon" style="background-color: ${iconColor}">${rec.priority}</div>
                    <div class="recommendation-content">
                        <h4>${rec.title}</h4>
                        <p>${rec.description}</p>
                        <div style="margin-top: 8px;">
                            <span style="background: ${iconColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">
                                ${rec.impact} Impact
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function createAssetProjectionCharts() {
        // Calculate projections for current plan and with feature improvements
        const currentProjections = calculateAssetProjections('current');
        const enhancedProjections = calculateAssetProjections('enhanced');
        
        // Update summary cards
        updateProjectionSummary(currentProjections, enhancedProjections);
        
        // Create charts
        createAssetGrowthChart(currentProjections, enhancedProjections);
        createAvgBalanceChart(currentProjections, enhancedProjections);
        
        // Generate insights
        generateProjectionInsights(currentProjections, enhancedProjections);
    }

    function calculateAssetProjections(scenario = 'current') {
        const years = 25;
        const monthsPerYear = 12;
        const projections = [];
        
        // Get feature configuration
        const featureConfig = scenario === 'enhanced' ? getFeatureConfiguration() : null;
        
        // Determine effective rates based on scenario
        let effectiveParticipants = participants;
        let effectiveEmployeeRate = employeeContribRate;
        let effectiveMatchUtilization = participantsMaxMatch;
        
        if (scenario === 'enhanced' && featureConfig) {
            // Apply feature configuration impacts
            const participationMultiplier = featureConfig.autoEnroll && enrollmentMethod !== 'auto-enroll' ? 2.8 : 1.0;
            const vestingMultiplier = featureConfig.vestingSchedule === 'immediate' ? 1.15 : 1.0;
            
            effectiveParticipants = Math.min(eligibleEmployees, participants * participationMultiplier * vestingMultiplier);
            
            if (featureConfig.autoEnroll) {
                effectiveEmployeeRate = Math.max(effectiveEmployeeRate, featureConfig.defaultAutoRate);
                effectiveMatchUtilization = Math.min(100, effectiveMatchUtilization * 1.4);
            }
            
            if (featureConfig.autoEscalate) {
                effectiveEmployeeRate += 1.5; // Auto-escalation impact over time
            }
        }
        
        // Calculate monthly rates
        const monthlyReturn = investmentReturn / 100 / monthsPerYear;
        const monthlyEmployeeContrib = (effectiveEmployeeRate / 100) * avgSalary / monthsPerYear;
        
        // Employer contribution based on match utilization
        const employeeContribForMatch = Math.min(effectiveEmployeeRate, employer401kMatch);
        const actualMatchRate = employeeContribForMatch * (effectiveMatchUtilization / 100);
        const monthlyEmployerContrib = (actualMatchRate / 100) * avgSalary / monthsPerYear;
        
        // Starting balance
        let currentBalance = avgAccountBalance * effectiveParticipants;
        
        // Calculate projections
        for (let year = 0; year <= years; year++) {
            if (year === 0) {
                projections.push({
                    year: year,
                    totalAssets: currentBalance,
                    avgBalance: currentBalance / effectiveParticipants,
                    participants: effectiveParticipants
                });
                continue;
            }
            
            // Calculate year-over-year growth
            for (let month = 0; month < monthsPerYear; month++) {
                // Investment growth
                currentBalance *= (1 + monthlyReturn);
                
                // Employee contributions
                currentBalance += monthlyEmployeeContrib * effectiveParticipants;
                
                // Employer contributions
                currentBalance += monthlyEmployerContrib * effectiveParticipants;
                
                // Apply fees (simplified - annual application)
                if (month === 11) { // Last month of year
                    const totalFees = parseFloat(document.getElementById('totalFees')?.value || 1.25);
                    currentBalance *= (1 - totalFees / 100);
                }
            }
            
            projections.push({
                year: year,
                totalAssets: currentBalance,
                avgBalance: currentBalance / effectiveParticipants,
                participants: effectiveParticipants
            });
        }
        
        return projections;
    }

    function updateProjectionSummary(currentProjections, enhancedProjections) {
        const current25Year = currentProjections[25];
        const enhanced25Year = enhancedProjections[25];
        
        // Update current plan card
        document.getElementById('currentTotalAssets').textContent = `$${(current25Year.totalAssets / 1000000).toFixed(1)}M`;
        document.getElementById('currentAvgBalance').textContent = `Average Balance: $${current25Year.avgBalance.toLocaleString()}`;
        
        // Update enhanced plan card
        document.getElementById('enhancedTotalAssets').textContent = `$${(enhanced25Year.totalAssets / 1000000).toFixed(1)}M`;
        document.getElementById('enhancedAvgBalance').textContent = `Average Balance: $${enhanced25Year.avgBalance.toLocaleString()}`;
        
        // Calculate improvement
        const assetImprovement = enhanced25Year.totalAssets - current25Year.totalAssets;
        const improvementPercent = (assetImprovement / current25Year.totalAssets) * 100;
        
        document.getElementById('projectionImprovement').textContent = 
            `+$${(assetImprovement / 1000000).toFixed(1)}M (+${improvementPercent.toFixed(1)}%)`;
    }

    function createAssetGrowthChart(currentProjections, enhancedProjections) {
        const ctx = document.getElementById('assetGrowthChart').getContext('2d');
        
        // Sample every 5 years for cleaner display
        const years = [0, 5, 10, 15, 20, 25];
        const currentData = years.map(year => currentProjections[year].totalAssets / 1000000);
        const enhancedData = years.map(year => enhancedProjections[year].totalAssets / 1000000);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: years.map(y => `Year ${y}`),
                datasets: [
                    {
                        label: 'Current Plan',
                        data: currentData,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'With Improvements',
                        data: enhancedData,
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Assets (Millions $)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toFixed(1) + 'M';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Years'
                        }
                    }
                }
            }
        });
    }

    function createAvgBalanceChart(currentProjections, enhancedProjections) {
        const ctx = document.getElementById('avgBalanceChart').getContext('2d');
        
        // Sample every 5 years for cleaner display
        const years = [0, 5, 10, 15, 20, 25];
        const currentData = years.map(year => currentProjections[year].avgBalance);
        const enhancedData = years.map(year => enhancedProjections[year].avgBalance);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: years.map(y => `Year ${y}`),
                datasets: [
                    {
                        label: 'Current Plan',
                        data: currentData,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'With Improvements',
                        data: enhancedData,
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Average Balance ($)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Years'
                        }
                    }
                }
            }
        });
    }

    function generateProjectionInsights(currentProjections, enhancedProjections) {
        const current25Year = currentProjections[25];
        const enhanced25Year = enhancedProjections[25];
        
        const insights = [];
        
        // Asset growth insight
        const assetGrowth = enhanced25Year.totalAssets - current25Year.totalAssets;
        const growthPercent = (assetGrowth / current25Year.totalAssets) * 100;
        
        if (growthPercent > 10) {
            insights.push({
                title: 'Significant Asset Growth Potential',
                description: `Plan feature improvements could increase total plan assets by $${(assetGrowth / 1000000).toFixed(1)} million (${growthPercent.toFixed(1)}%) over 25 years, demonstrating substantial long-term value.`
            });
        }
        
        // Per-participant insight
        const avgBalanceGrowth = enhanced25Year.avgBalance - current25Year.avgBalance;
        const participantGrowthPercent = (avgBalanceGrowth / current25Year.avgBalance) * 100;
        
        if (participantGrowthPercent > 5) {
            insights.push({
                title: 'Employee Retirement Outcome Improvement',
                description: `On average, each participant could have $${avgBalanceGrowth.toLocaleString()} more (${participantGrowthPercent.toFixed(1)}% increase) in their retirement account after 25 years with these plan improvements.`
            });
        }
        
        // Compound effect insight
        const year10Current = currentProjections[10].totalAssets;
        const year10Enhanced = enhancedProjections[10].totalAssets;
        const early10YearGrowth = ((year10Enhanced - year10Current) / year10Current) * 100;
        
        if (early10YearGrowth > 5) {
            insights.push({
                title: 'Compound Growth Acceleration',
                description: `The improvements show accelerating benefits over time, with ${early10YearGrowth.toFixed(1)}% more assets after 10 years growing to ${growthPercent.toFixed(1)}% more after 25 years due to compound growth effects.`
            });
        }
        
        // Render insights
        const container = document.getElementById('projectionInsights');
        if (insights.length === 0) {
            container.innerHTML = '<p style="color: #6c757d; text-align: center;">Configure plan features above to see projection insights.</p>';
        } else {
            container.innerHTML = insights.map(insight => `
                <div class="insight-item">
                    <h4>${insight.title}</h4>
                    <p>${insight.description}</p>
                </div>
            `).join('');
        }
    }

    function setupScenarioTabs() {
        const tabs = document.querySelectorAll('.scenario-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const scenario = this.dataset.scenario;
                updateScenarioView(scenario);
            });
        });
    }

    function updateScenarioView(scenario) {
        console.log('Updating view for scenario:', scenario);
        
        // Get the current engagement data
        const data = calculateEngagementMetrics();
        
        // Update metrics display based on selected scenario
        let scenarioData;
        switch(scenario) {
            case 'current':
                scenarioData = data.current;
                break;
            case 'auto-enroll':
                scenarioData = data.autoEnroll;
                break;
            case 'enhanced':
                scenarioData = data.enhanced;
                break;
            default:
                scenarioData = data.current;
        }
        
        // Update the main metric cards to show selected scenario
        document.getElementById('participationRate').textContent = `${scenarioData.participation.toFixed(1)}%`;
        document.getElementById('avgContribRate').textContent = `${scenarioData.avgContribution.toFixed(1)}%`;
        document.getElementById('matchUtilization').textContent = `${scenarioData.matchUtilization.toFixed(1)}%`;
        document.getElementById('readinessScore').textContent = scenarioData.readiness;
        
        // Update change indicators to show difference from current
        const currentData = data.current;
        const participationChange = scenarioData.participation - currentData.participation;
        const contribChange = scenarioData.avgContribution - currentData.avgContribution;
        const matchChange = scenarioData.matchUtilization - currentData.matchUtilization;
        const readinessChange = scenarioData.readiness - currentData.readiness;
        
        if (scenario === 'current') {
            // For current scenario, show potential improvements
            updateChangeIndicator('participationChange', data.autoEnroll.participation - currentData.participation, '%');
            updateChangeIndicator('contribChange', data.autoEnroll.avgContribution - currentData.avgContribution, '%');
            updateChangeIndicator('matchChange', data.autoEnroll.matchUtilization - currentData.matchUtilization, '%');
            updateChangeIndicator('readinessChange', data.autoEnroll.readiness - currentData.readiness, ' pts');
        } else {
            // For other scenarios, show change from current
            updateChangeIndicator('participationChange', participationChange, '%');
            updateChangeIndicator('contribChange', contribChange, '%');
            updateChangeIndicator('matchChange', matchChange, '%');
            updateChangeIndicator('readinessChange', readinessChange, ' pts');
        }
        
        // Update report card to reflect selected scenario
        updateReportCardForScenario(scenarioData, scenario);
        
        // Update readiness gauge for scenario
        updateReadinessGaugeForScenario(scenarioData);
        
        // Update recommendations based on scenario
        generateRecommendationsForScenario(data, scenario);
        
        // Update chart titles to reflect current view
        updateChartTitles(scenario);
    }
    
    function updateReportCardForScenario(scenarioData, scenario) {
        // Update the report card current values to show selected scenario
        document.getElementById('reportParticipationCurrent').textContent = `${scenarioData.participation.toFixed(1)}%`;
        document.getElementById('reportContribCurrent').textContent = `${scenarioData.avgContribution.toFixed(1)}%`;
        document.getElementById('reportMatchCurrent').textContent = `${scenarioData.matchUtilization.toFixed(1)}%`;
        document.getElementById('reportReadinessCurrent').textContent = scenarioData.readiness;
        
        // Recalculate gaps for this scenario
        const targets = {
            participation: 85,
            contribution: 8,
            matchUtilization: 90,
            readiness: 75
        };
        
        const participationGap = scenarioData.participation - targets.participation;
        const contribGap = scenarioData.avgContribution - targets.contribution;
        const matchGap = scenarioData.matchUtilization - targets.matchUtilization;
        const readinessGap = scenarioData.readiness - targets.readiness;
        
        // Update gap indicators
        updateGapIndicator('participationGap', 'participationGapBar', participationGap, '%');
        updateGapIndicator('contribGap', 'contribGapBar', contribGap, '%');
        updateGapIndicator('matchGap', 'matchGapBar', matchGap, '%');
        updateGapIndicator('readinessGap', 'readinessGapBar', readinessGap, ' pts');
        
        // Update overall grade for this scenario
        const overallScore = calculateOverallGrade(scenarioData, targets);
        updateOverallGrade(overallScore);
        
        // Update the section header to indicate which scenario is being viewed
        const reportCardSection = document.querySelector('.report-card-section.current h3');
        if (reportCardSection) {
            const scenarioNames = {
                'current': '📊 Your Plan Performance',
                'auto-enroll': '📊 Auto-Enrollment Scenario',
                'enhanced': '📊 Enhanced Engagement Scenario'
            };
            reportCardSection.textContent = scenarioNames[scenario] || '📊 Your Plan Performance';
        }
    }
    
    function updateReadinessGaugeForScenario(scenarioData) {
        // Update the score display
        document.getElementById('readinessGaugeScore').textContent = scenarioData.readiness;
        
        // Destroy existing chart if it exists
        const canvas = document.getElementById('readinessGauge');
        const existingChart = Chart.getChart(canvas);
        if (existingChart) {
            existingChart.destroy();
        }
        
        // Recreate the gauge with new data
        const ctx = canvas.getContext('2d');
        const currentScore = scenarioData.readiness;
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [currentScore, 100 - currentScore],
                    backgroundColor: [
                        currentScore >= 75 ? '#27ae60' : 
                        currentScore >= 60 ? '#f39c12' : '#e74c3c',
                        '#e9ecef'
                    ],
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                cutout: '80%'
            }
        });
    }
    
    function generateRecommendationsForScenario(data, scenario) {
        // For current scenario, show normal recommendations
        if (scenario === 'current') {
            generateRecommendations(data);
            return;
        }
        
        // For other scenarios, show what would still need improvement
        const scenarioData = scenario === 'auto-enroll' ? data.autoEnroll : data.enhanced;
        const recommendations = [];
        
        const targets = {
            participation: 85,
            contribution: 8,
            matchUtilization: 90,
            readiness: 75
        };
        
        const contribGap = scenarioData.avgContribution - targets.contribution;
        const matchGap = scenarioData.matchUtilization - targets.matchUtilization;
        
        let priority = 1;
        
        if (scenario === 'auto-enroll') {
            recommendations.push({
                priority: priority++,
                title: `✅ Auto-Enrollment Implementation`,
                description: `This scenario shows the impact of implementing auto-enrollment. Participation would increase to ${scenarioData.participation.toFixed(1)}%, adding approximately ${Math.round((scenarioData.participation - data.current.participation)/100 * eligibleEmployees)} new participants.`,
                impact: 'Scenario',
                gapType: 'scenario'
            });
        } else if (scenario === 'enhanced') {
            recommendations.push({
                priority: priority++,
                title: `✅ Enhanced Engagement Program`,
                description: `This scenario combines auto-enrollment with behavioral enhancements. Participation would reach ${scenarioData.participation.toFixed(1)}% with improved contribution rates and match utilization.`,
                impact: 'Scenario',
                gapType: 'scenario'
            });
        }
        
        // Show remaining gaps even in improved scenarios
        if (contribGap < 0) {
            recommendations.push({
                priority: priority++,
                title: 'Further Contribution Improvements Needed',
                description: `Even with ${scenario === 'auto-enroll' ? 'auto-enrollment' : 'enhanced engagement'}, average contributions would be ${Math.abs(contribGap).toFixed(1)} points below target. Consider additional auto-escalation features.`,
                impact: 'Medium',
                gapType: 'remaining'
            });
        }
        
        if (matchGap < 0) {
            recommendations.push({
                priority: priority++,
                title: 'Match Education Still Needed',
                description: `Match utilization would improve but remain ${Math.abs(matchGap).toFixed(1)} points below target. Continue targeted match education campaigns.`,
                impact: 'Medium',
                gapType: 'remaining'
            });
        }
        
        if (recommendations.length === 1) {
            recommendations.push({
                priority: priority++,
                title: '🎯 Excellent Results',
                description: `This scenario achieves or exceeds most industry targets. Focus on maintaining these improvements and monitoring ongoing engagement.`,
                impact: 'Enhancement',
                gapType: 'success'
            });
        }
        
        // Render recommendations
        const container = document.getElementById('recommendationsList');
        container.innerHTML = recommendations.map(rec => {
            const iconColor = rec.impact === 'Scenario' ? '#667eea' :
                             rec.impact === 'Medium' ? '#f39c12' : '#27ae60';
            const borderColor = iconColor;
            
            return `
                <div class="recommendation-item" style="border-left-color: ${borderColor}">
                    <div class="recommendation-icon" style="background-color: ${iconColor}">${rec.priority}</div>
                    <div class="recommendation-content">
                        <h4>${rec.title}</h4>
                        <p>${rec.description}</p>
                        <div style="margin-top: 8px;">
                            <span style="background: ${iconColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">
                                ${rec.impact} ${rec.impact === 'Scenario' ? 'View' : 'Impact'}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    function updateChartTitles(scenario) {
        // Update chart section headers to indicate current view
        const scenarioLabels = {
            'current': 'Current Plan Analysis',
            'auto-enroll': 'Auto-Enrollment Projection',
            'enhanced': 'Enhanced Engagement Projection'
        };
        
        const scenarioSection = document.querySelector('.engagement-section h2');
        if (scenarioSection && scenarioSection.textContent.includes('Engagement Scenario Analysis')) {
            // We could update chart titles here if needed
            console.log(`Viewing ${scenarioLabels[scenario] || 'Current Plan Analysis'}`);
        }
    }

    function initializeFeatureConfiguration() {
        // Set initial values based on current plan data
        document.getElementById('autoEnrollToggle').checked = enrollmentMethod === 'auto-enroll';
        document.getElementById('defaultAutoRate').value = defaultAutoContribRate || 3;
        document.getElementById('autoEscalateToggle').checked = setupData.autoEscalation === 'yes';
        document.getElementById('escalationRate').value = 1; // Default annual increase
        document.getElementById('maxEscalationRate').value = setupData.maxAutoEscalationRate || 10;
        document.getElementById('matchFormula').value = employer401kMatch || 3;
        document.getElementById('vestingSchedule').value = vestingSchedule || 'immediate';
        document.getElementById('investmentOptions').value = investmentOptions || 12;
        
        // Calculate total fees from individual fee components
        const totalFeesCalculated = calculateTotalFees();
        document.getElementById('totalFees').value = totalFeesCalculated.toFixed(2);
        document.getElementById('feesPaidBy').value = setupData.feesPaidBy || 'employee';
        
        // Show/hide conditional fields and set initial visual states
        toggleFeatureDetails();
        
        // Set initial toggle visual states
        const autoEnrollToggle = document.getElementById('autoEnrollToggle');
        const autoEscalateToggle = document.getElementById('autoEscalateToggle');
        const autoEnrollSlider = autoEnrollToggle.closest('.toggle-slider');
        const autoEscalateSlider = autoEscalateToggle.closest('.toggle-slider');
        
        if (autoEnrollToggle.checked) {
            autoEnrollSlider.classList.add('checked');
        }
        if (autoEscalateToggle.checked) {
            autoEscalateSlider.classList.add('checked');
        }
        
        // Generate initial impact summary
        updateFeatureImpactSummary();
    }

    function calculateTotalFees() {
        // Sum up all the fee components from the original setup data
        let totalFees = 0;
        
        // Investment fees (always present)
        const investmentFees = parseFloat(setupData.investmentBasisPointsFee) || 75;
        totalFees += investmentFees / 100; // Convert basis points to percentage
        
        // Record keeper fees
        if (setupData.recordKeeperFeeType === 'basisPoints') {
            const rkFees = parseFloat(setupData.recordKeeperBasisPointsFee) || 0;
            totalFees += rkFees / 100;
        } else if (setupData.recordKeeperFeeType === 'flatPerHead') {
            // Convert per-head fee to approximate percentage (rough estimate)
            const rkFee = parseFloat(setupData.recordKeeperPerHeadFee) || 0;
            const estimatedPercent = (rkFee * participants) / (participants * avgSalary) * 100;
            totalFees += estimatedPercent;
        }
        
        // Advisor fees
        if (setupData.advisorFeeType === 'basisPoints') {
            const advisorFees = parseFloat(setupData.advisorBasisPointsFee) || 0;
            totalFees += advisorFees / 100;
        } else if (setupData.advisorFeeType === 'flatPerHead' || setupData.advisorFeeType === 'flatFee') {
            const advisorFee = parseFloat(setupData.advisorPerHeadFee) || parseFloat(setupData.advisorFlatFee) || 0;
            let estimatedPercent = 0;
            if (setupData.advisorFeeType === 'flatPerHead') {
                estimatedPercent = (advisorFee * participants) / (participants * avgSalary) * 100;
            } else {
                estimatedPercent = advisorFee / (participants * avgSalary) * 100;
            }
            totalFees += estimatedPercent;
        }
        
        // TPA fees  
        const tpaPerHead = parseFloat(setupData.tpaPerHeadFee) || 0;
        const tpaFlat = parseFloat(setupData.tpaFlatFee) || 0;
        const tpaTotal = (tpaPerHead * participants) + tpaFlat;
        const tpaPercent = tpaTotal / (participants * avgSalary) * 100;
        totalFees += tpaPercent;
        
        // Audit fees
        const auditFees = parseFloat(setupData.auditBasisPointsFee) || 0;
        totalFees += auditFees / 100;
        
        // Ensure reasonable bounds (0.25% to 2.5%)
        return Math.max(0.25, Math.min(2.5, totalFees));
    }

    function toggleFeatureDetails() {
        const autoEnrollChecked = document.getElementById('autoEnrollToggle').checked;
        const autoEscalateChecked = document.getElementById('autoEscalateToggle').checked;
        
        document.getElementById('autoEnrollDetails').style.display = autoEnrollChecked ? 'block' : 'none';
        document.getElementById('autoEscalateDetails').style.display = autoEscalateChecked ? 'block' : 'none';
    }

    function updateFeatureImpactSummary() {
        // Get current feature configuration
        const featureConfig = getFeatureConfiguration();
        
        // Calculate impact with new configuration
        const originalData = calculateEngagementMetrics();
        const modifiedData = calculateEngagementMetricsWithFeatures(featureConfig);
        
        // Calculate changes
        const participationChange = modifiedData.current.participation - originalData.current.participation;
        const contribChange = modifiedData.current.avgContribution - originalData.current.avgContribution;
        const matchChange = modifiedData.current.matchUtilization - originalData.current.matchUtilization;
        const readinessChange = modifiedData.current.readiness - originalData.current.readiness;
        
        // Generate impact summary
        const summaryHtml = `
            <h4>💡 Feature Configuration Impact</h4>
            <div class="impact-metrics">
                <div class="impact-metric">
                    <div class="impact-value">${modifiedData.current.participation.toFixed(1)}%</div>
                    <div class="impact-label">Participation Rate</div>
                    <div class="impact-change ${participationChange >= 0 ? 'positive' : 'negative'}">
                        ${participationChange >= 0 ? '+' : ''}${participationChange.toFixed(1)}% change
                    </div>
                </div>
                <div class="impact-metric">
                    <div class="impact-value">${modifiedData.current.avgContribution.toFixed(1)}%</div>
                    <div class="impact-label">Avg Savings Rate</div>
                    <div class="impact-change ${contribChange >= 0 ? 'positive' : 'negative'}">
                        ${contribChange >= 0 ? '+' : ''}${contribChange.toFixed(1)}% change
                    </div>
                </div>
                <div class="impact-metric">
                    <div class="impact-value">${modifiedData.current.matchUtilization.toFixed(1)}%</div>
                    <div class="impact-label">Match Participation</div>
                    <div class="impact-change ${matchChange >= 0 ? 'positive' : 'negative'}">
                        ${matchChange >= 0 ? '+' : ''}${matchChange.toFixed(1)}% change
                    </div>
                </div>
                <div class="impact-metric">
                    <div class="impact-value">${modifiedData.current.readiness}</div>
                    <div class="impact-label">Plan Health Score</div>
                    <div class="impact-change ${readinessChange >= 0 ? 'positive' : 'negative'}">
                        ${readinessChange >= 0 ? '+' : ''}${readinessChange} change
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('featureImpactSummary').innerHTML = summaryHtml;
    }

    function getFeatureConfiguration() {
        return {
            autoEnroll: document.getElementById('autoEnrollToggle').checked,
            defaultAutoRate: parseFloat(document.getElementById('defaultAutoRate').value),
            autoEscalate: document.getElementById('autoEscalateToggle').checked,
            escalationRate: parseFloat(document.getElementById('escalationRate').value),
            maxEscalationRate: parseFloat(document.getElementById('maxEscalationRate').value),
            matchFormula: parseFloat(document.getElementById('matchFormula').value),
            vestingSchedule: document.getElementById('vestingSchedule').value,
            investmentOptions: parseInt(document.getElementById('investmentOptions').value),
            totalFees: parseFloat(document.getElementById('totalFees').value),
            feesPaidBy: document.getElementById('feesPaidBy').value
        };
    }

    function calculateEngagementMetricsWithFeatures(config) {
        // Override global variables with feature configuration
        const tempEnrollmentMethod = config.autoEnroll ? 'auto-enroll' : 'opt-in';
        const tempDefaultAutoContribRate = config.defaultAutoRate;
        const tempAutoEscalation = config.autoEscalate ? 'yes' : 'no';
        const tempEmployer401kMatch = config.matchFormula;
        const tempVestingSchedule = config.vestingSchedule;
        const tempInvestmentOptions = config.investmentOptions;
        
        // Calculate participation rate impact
        let modifiedParticipationRate = eligibleEmployees > 0 ? (participants / eligibleEmployees) * 100 : 0;
        
        if (config.autoEnroll && enrollmentMethod !== 'auto-enroll') {
            // Auto-enrollment boost: research shows 2.5-3x improvement
            modifiedParticipationRate = Math.min(95, modifiedParticipationRate * 2.8);
        } else if (!config.autoEnroll && enrollmentMethod === 'auto-enroll') {
            // Removing auto-enrollment reduces participation
            modifiedParticipationRate = modifiedParticipationRate / 2.8;
        }
        
        // Vesting schedule impact
        const vestingMultiplier = config.vestingSchedule === 'immediate' ? 1.15 : 
                                 config.vestingSchedule === '2-year' ? 1.05 : 
                                 config.vestingSchedule === '3-year' ? 1.0 : 0.9;
        modifiedParticipationRate *= vestingMultiplier;
        
        // Investment options impact (sweet spot is 10-15 options)
        const investmentMultiplier = config.investmentOptions >= 10 && config.investmentOptions <= 15 ? 1.1 : 
                                    config.investmentOptions > 25 ? 0.9 : 1.0;
        modifiedParticipationRate *= investmentMultiplier;
        
        // Calculate contribution rate impact
        let modifiedContribRate = employeeContribRate;
        
        if (config.autoEnroll) {
            modifiedContribRate = Math.max(modifiedContribRate, config.defaultAutoRate);
        }
        
        if (config.autoEscalate && setupData.autoEscalation !== 'yes') {
            modifiedContribRate += 1.5; // Auto-escalation typically adds 1-2% over time
        }
        
        // Match utilization impact
        let modifiedMatchUtil = participantsMaxMatch;
        
        if (config.autoEnroll) {
            modifiedMatchUtil = Math.min(100, modifiedMatchUtil * 1.4);
        }
        
        if (config.matchFormula > employer401kMatch) {
            modifiedMatchUtil = Math.min(100, modifiedMatchUtil * 1.1); // Better match increases utilization
        }
        
        // Calculate readiness with modified values
        const modifiedReadiness = calculateRetirementReadiness(
            modifiedParticipationRate, 
            modifiedContribRate, 
            modifiedMatchUtil
        );
        
        return {
            current: {
                participation: modifiedParticipationRate,
                avgContribution: modifiedContribRate,
                matchUtilization: modifiedMatchUtil,
                readiness: modifiedReadiness
            }
        };
    }
});

// Global function for HTML onchange events
function updateFeatureConfiguration() {
    console.log('Feature configuration updated');
    
    // Toggle visibility of conditional fields
    const autoEnrollToggle = document.getElementById('autoEnrollToggle');
    const autoEscalateToggle = document.getElementById('autoEscalateToggle');
    
    // Update toggle slider visual states
    const autoEnrollSlider = autoEnrollToggle.closest('.toggle-slider');
    const autoEscalateSlider = autoEscalateToggle.closest('.toggle-slider');
    
    if (autoEnrollToggle.checked) {
        autoEnrollSlider.classList.add('checked');
    } else {
        autoEnrollSlider.classList.remove('checked');
    }
    
    if (autoEscalateToggle.checked) {
        autoEscalateSlider.classList.add('checked');
    } else {
        autoEscalateSlider.classList.remove('checked');
    }
    
    // Toggle visibility of conditional fields
    document.getElementById('autoEnrollDetails').style.display = autoEnrollToggle.checked ? 'block' : 'none';
    document.getElementById('autoEscalateDetails').style.display = autoEscalateToggle.checked ? 'block' : 'none';
    
    // Update impact summary (simplified version for global scope)
    updateGlobalFeatureImpact();
}

function updateGlobalFeatureImpact() {
    // Get current setup data from localStorage for calculations
    const setupDataString = localStorage.getItem('planSetupData');
    const setupData = JSON.parse(setupDataString || '{}');
    
    if (Object.keys(setupData).length === 0) {
        return;
    }
    
    // Get feature configuration
    const config = {
        autoEnroll: document.getElementById('autoEnrollToggle').checked,
        defaultAutoRate: parseFloat(document.getElementById('defaultAutoRate').value),
        autoEscalate: document.getElementById('autoEscalateToggle').checked,
        matchFormula: parseFloat(document.getElementById('matchFormula').value),
        vestingSchedule: document.getElementById('vestingSchedule').value,
        investmentOptions: parseInt(document.getElementById('investmentOptions').value)
    };
    
    // Calculate baseline metrics
    const eligibleEmployees = parseInt(setupData.eligibleEmployees) || 0;
    const participants = parseInt(setupData.participants) || 0;
    const employeeContribRate = parseFloat(setupData.employeeContribRate) || 0;
    const participantsMaxMatch = parseFloat(setupData.participantsMaxMatch) || 0;
    const originalEnrollmentMethod = setupData.enrollmentMethod || 'opt-in';
    
    let baseParticipation = eligibleEmployees > 0 ? (participants / eligibleEmployees) * 100 : 0;
    
    // Calculate modified metrics
    let modifiedParticipation = baseParticipation;
    let modifiedContribution = employeeContribRate;
    let modifiedMatch = participantsMaxMatch;
    
    // Auto-enrollment impact
    if (config.autoEnroll && originalEnrollmentMethod !== 'auto-enroll') {
        modifiedParticipation = Math.min(95, baseParticipation * 2.8);
        modifiedMatch = Math.min(100, modifiedMatch * 1.4);
        modifiedContribution = Math.max(modifiedContribution, config.defaultAutoRate);
    } else if (!config.autoEnroll && originalEnrollmentMethod === 'auto-enroll') {
        modifiedParticipation = baseParticipation / 2.8;
        modifiedMatch = modifiedMatch / 1.4;
    }
    
    // Vesting impact
    const vestingMultiplier = config.vestingSchedule === 'immediate' ? 1.15 : 
                             config.vestingSchedule === '2-year' ? 1.05 : 1.0;
    modifiedParticipation *= vestingMultiplier;
    
    // Auto-escalation impact
    if (config.autoEscalate && setupData.autoEscalation !== 'yes') {
        modifiedContribution += 1.5;
    }
    
    // Calculate readiness (simplified)
    const modifiedReadiness = Math.round(
        (modifiedParticipation * 0.4) + 
        (Math.min(100, (modifiedContribution / 10) * 100) * 0.35) + 
        (modifiedMatch * 0.25)
    );
    
    const baseReadiness = Math.round(
        (baseParticipation * 0.4) + 
        (Math.min(100, (employeeContribRate / 10) * 100) * 0.35) + 
        (participantsMaxMatch * 0.25)
    );
    
    // Calculate changes
    const participationChange = modifiedParticipation - baseParticipation;
    const contribChange = modifiedContribution - employeeContribRate;
    const matchChange = modifiedMatch - participantsMaxMatch;
    const readinessChange = modifiedReadiness - baseReadiness;
    
    // Update impact summary
    const summaryHtml = `
        <h4>💡 Feature Configuration Impact</h4>
        <div class="impact-metrics">
            <div class="impact-metric">
                <div class="impact-value">${modifiedParticipation.toFixed(1)}%</div>
                <div class="impact-label">Participation Rate</div>
                <div class="impact-change ${participationChange >= 0 ? 'positive' : 'negative'}">
                    ${participationChange >= 0 ? '+' : ''}${participationChange.toFixed(1)}% change
                </div>
            </div>
            <div class="impact-metric">
                <div class="impact-value">${modifiedContribution.toFixed(1)}%</div>
                <div class="impact-label">Avg Savings Rate</div>
                <div class="impact-change ${contribChange >= 0 ? 'positive' : 'negative'}">
                    ${contribChange >= 0 ? '+' : ''}${contribChange.toFixed(1)}% change
                </div>
            </div>
            <div class="impact-metric">
                <div class="impact-value">${modifiedMatch.toFixed(1)}%</div>
                <div class="impact-label">Match Participation</div>
                <div class="impact-change ${matchChange >= 0 ? 'positive' : 'negative'}">
                    ${matchChange >= 0 ? '+' : ''}${matchChange.toFixed(1)}% change
                </div>
            </div>
            <div class="impact-metric">
                <div class="impact-value">${modifiedReadiness}</div>
                <div class="impact-label">Plan Health Score</div>
                <div class="impact-change ${readinessChange >= 0 ? 'positive' : 'negative'}">
                    ${readinessChange >= 0 ? '+' : ''}${readinessChange} change
                </div>
            </div>
        </div>
    `;
    
    const summaryElement = document.getElementById('featureImpactSummary');
    if (summaryElement) {
        summaryElement.innerHTML = summaryHtml;
    }
    
    // Update asset projections if the section exists
    const assetGrowthChart = document.getElementById('assetGrowthChart');
    if (assetGrowthChart) {
        // Destroy existing charts
        Chart.getChart('assetGrowthChart')?.destroy();
        Chart.getChart('avgBalanceChart')?.destroy();
        
        // Recreate with updated configuration - need to call within proper scope
        setTimeout(() => {
            if (typeof createAssetProjectionCharts === 'function') {
                createAssetProjectionCharts();
            }
        }, 100);
    }
}

function goBack() {
    window.location.href = 'index.html';
}

function goToResults() {
    window.location.href = 'results.html';
}

function exportEngagementReport() {
    const setupData = JSON.parse(localStorage.getItem('planSetupData') || '{}');
    
    // Create engagement report data
    const reportData = {
        planData: setupData,
        generatedDate: new Date().toISOString(),
        reportType: 'Participant Engagement Analysis',
        metrics: {
            currentParticipation: document.getElementById('participationRate').textContent,
            averageContribution: document.getElementById('avgContribRate').textContent,
            matchUtilization: document.getElementById('matchUtilization').textContent,
            readinessScore: document.getElementById('readinessScore').textContent
        }
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `engagement-analysis-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}