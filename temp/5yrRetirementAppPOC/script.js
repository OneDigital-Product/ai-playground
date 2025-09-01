document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('planSetupForm');
    const resetButton = document.getElementById('resetForm');
    const engagementButton = document.getElementById('engagementAnalysis');
    const autoEscalationSelect = document.getElementById('autoEscalation');
    const maxAutoEscalationInput = document.getElementById('maxAutoEscalationRate');
    const enrollmentMethodSelect = document.getElementById('enrollmentMethod');
    const defaultAutoContribRateInput = document.getElementById('defaultAutoContribRate');
    
    // Fee structure elements
    const recordKeeperFeeTypeRadios = document.querySelectorAll('input[name="recordKeeperFeeType"]');
    const advisorFeeTypeRadios = document.querySelectorAll('input[name="advisorFeeType"]');

    // Auto escalation dependency
    autoEscalationSelect.addEventListener('change', function() {
        if (this.value === 'no') {
            maxAutoEscalationInput.disabled = true;
            maxAutoEscalationInput.value = '';
            maxAutoEscalationInput.required = false;
        } else if (this.value === 'yes') {
            maxAutoEscalationInput.disabled = false;
            maxAutoEscalationInput.required = true;
        }
    });

    // Enrollment method dependency
    enrollmentMethodSelect.addEventListener('change', function() {
        if (this.value === 'opt-in') {
            defaultAutoContribRateInput.disabled = true;
            defaultAutoContribRateInput.value = '';
            defaultAutoContribRateInput.required = false;
        } else if (this.value === 'auto-enroll') {
            defaultAutoContribRateInput.disabled = false;
            defaultAutoContribRateInput.required = true;
            defaultAutoContribRateInput.value = defaultAutoContribRateInput.value || '3'; // Default to 3%
        }
    });

    // Fee structure toggles
    recordKeeperFeeTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            toggleFeeInputs('recordKeeper', this.value);
        });
    });

    advisorFeeTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            toggleFeeInputs('advisor', this.value);
        });
    });

    function toggleFeeInputs(feeType, structure) {
        const basisPointsGroup = document.getElementById(`${feeType}BasisPointsGroup`);
        const flatGroup = document.getElementById(`${feeType}FlatGroup`);
        const basisPointsInput = document.getElementById(`${feeType}BasisPointsFee`);
        const flatFeeInput = document.getElementById(`${feeType}FlatFee`);
        const perHeadInput = document.getElementById(`${feeType}PerHeadFee`);

        if (structure === 'basisPoints') {
            basisPointsGroup.style.display = 'block';
            flatGroup.style.display = 'none';
            basisPointsInput.required = true;
            flatFeeInput.required = false;
            perHeadInput.required = false;
            // Clear flat + per head values
            flatFeeInput.value = '';
            perHeadInput.value = '';
        } else if (structure === 'flatPerHead') {
            basisPointsGroup.style.display = 'none';
            flatGroup.style.display = 'block';
            basisPointsInput.required = false;
            flatFeeInput.required = true;
            perHeadInput.required = true;
            // Clear basis points value
            basisPointsInput.value = '';
        }
    }

    // Form validation
    function validateField(field) {
        const formGroup = field.closest('.form-group');
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error messages
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Required field validation
        if (field.hasAttribute('required') && !field.disabled && !value) {
            isValid = false;
            errorMessage = 'This field is required.';
        }

        // Number validation
        if (field.type === 'number' && value) {
            const numValue = parseFloat(value);
            const min = parseFloat(field.min);
            const max = parseFloat(field.max);

            if (isNaN(numValue)) {
                isValid = false;
                errorMessage = 'Please enter a valid number.';
            } else if (!isNaN(min) && numValue < min) {
                isValid = false;
                errorMessage = `Value must be at least ${min}.`;
            } else if (!isNaN(max) && numValue > max) {
                isValid = false;
                errorMessage = `Value must be no more than ${max}.`;
            }
        }

        // Business logic validation
        if (isValid && value) {
            switch (field.id) {
                case 'participants':
                    const eligibleEmployees = parseFloat(document.getElementById('eligibleEmployees').value);
                    if (eligibleEmployees && parseFloat(value) > eligibleEmployees) {
                        isValid = false;
                        errorMessage = 'Number of participants cannot exceed eligible employees.';
                    }
                    break;
                
                case 'participantsMaxMatch':
                    const participants = parseFloat(document.getElementById('participants').value);
                    if (participants && parseFloat(value) > 100) {
                        isValid = false;
                        errorMessage = 'Percentage cannot exceed 100%.';
                    }
                    break;
            }
        }

        // Update form group styling
        formGroup.classList.remove('error', 'success');
        if (!isValid) {
            formGroup.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errorMessage;
            formGroup.appendChild(errorDiv);
        } else if (value) {
            formGroup.classList.add('success');
        }

        return isValid;
    }

    // Add validation to all form fields
    const formFields = form.querySelectorAll('input, select');
    formFields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => {
            // Remove error styling while typing
            const formGroup = field.closest('.form-group');
            if (formGroup.classList.contains('error')) {
                formGroup.classList.remove('error');
                const errorMessage = formGroup.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
            }
        });
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isFormValid = true;
        
        // Validate all fields
        formFields.forEach(field => {
            if (!validateField(field)) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            // Collect form data
            const formData = new FormData(form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }

            // Store data for next page (in a real app, this would be sent to a server)
            localStorage.setItem('planSetupData', JSON.stringify(data));
            
            // Redirect to results page
            console.log('Plan Setup Data:', data);
            window.location.href = 'results.html';
        } else {
            // Scroll to first error
            const firstError = form.querySelector('.form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });

    // Reset form
    resetButton.addEventListener('click', function() {
        if (confirm('Are you sure you want to reset all fields? This action cannot be undone.')) {
            form.reset();
            
            // Remove all validation styling
            const formGroups = form.querySelectorAll('.form-group');
            formGroups.forEach(group => {
                group.classList.remove('error', 'success');
                const errorMessage = group.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
            });
            
            // Reset auto escalation dependency
            maxAutoEscalationInput.disabled = false;
            maxAutoEscalationInput.required = false;
        }
    });

    // Engagement Analysis button
    engagementButton.addEventListener('click', function() {
        // Validate key fields needed for engagement analysis
        const requiredFields = ['eligibleEmployees', 'participants', 'avgSalary', 'employeeContribRate', 
                               'employer401kMatch', 'participantsMaxMatch', 'enrollmentMethod'];
        
        let isValid = true;
        const missingFields = [];
        
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (!field.value.trim()) {
                isValid = false;
                missingFields.push(field.previousElementSibling.textContent);
            }
        });
        
        if (isValid) {
            // Save current form data
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            localStorage.setItem('planSetupData', JSON.stringify(data));
            
            // Navigate to engagement analysis
            window.location.href = 'engagement.html';
        } else {
            alert('Please complete the following required fields for engagement analysis:\n\n' + 
                  missingFields.join('\n'));
        }
    });

    // Format currency inputs
    const currencyInputs = ['avgAccountBalance', 'avgSalary', 'recordKeeperFlatFee', 'recordKeeperPerHeadFee', 
                           'advisorFlatFee', 'advisorPerHeadFee', 'tpaFlatFee', 'tpaPerHeadFee'];
    currencyInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('blur', function() {
                if (this.value) {
                    const value = parseFloat(this.value);
                    if (!isNaN(value)) {
                        this.value = value.toFixed(2);
                    }
                }
            });
        }
    });

    // Format percentage inputs
    const percentageInputs = ['investmentReturn', 'employeeContribRate', 'employerContribRate', 'employer401kMatch', 'participantsMaxMatch', 'maxAutoEscalationRate', 'defaultAutoContribRate'];
    
    // Format basis points inputs
    const basisPointsInputs = ['recordKeeperBasisPointsFee', 'advisorBasisPointsFee', 'investmentBasisPointsFee', 'auditBasisPointsFee'];
    percentageInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('blur', function() {
                if (this.value) {
                    const value = parseFloat(this.value);
                    if (!isNaN(value)) {
                        this.value = value.toFixed(2);
                    }
                }
            });
        }
    });

    basisPointsInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('blur', function() {
                if (this.value) {
                    const value = parseFloat(this.value);
                    if (!isNaN(value)) {
                        this.value = value.toFixed(1);
                    }
                }
            });
        }
    });

    // Initialize conditional field states
    maxAutoEscalationInput.disabled = false;
    maxAutoEscalationInput.required = false;
    defaultAutoContribRateInput.disabled = false;
    defaultAutoContribRateInput.required = false;
});