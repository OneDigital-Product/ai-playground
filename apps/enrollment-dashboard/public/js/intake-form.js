// Intake form functionality for multi-step wizard

document.addEventListener("DOMContentLoaded", function () {
  initializeFormValidation();
  initializeSectionToggles();
  initializePlanBlocks();
  initializeFormPersistence();
  initializeProgressTracking();
});

// Form validation
function initializeFormValidation() {
  const form = document.getElementById("intakeForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    const currentStep = parseInt(
      document.querySelector('input[name="step"]').value,
    );

    if (!validateCurrentStep(currentStep)) {
      e.preventDefault();
      showToast("Please fix the errors before continuing", "error");
    }
  });

  // Real-time validation
  const inputs = form.querySelectorAll("input[required], select[required]");
  inputs.forEach((input) => {
    input.addEventListener("blur", function () {
      validateField(this);
    });

    input.addEventListener("input", function () {
      clearFieldError(this);
    });
  });
}

// Validate individual field
function validateField(field) {
  const value = field.value.trim();
  const isValid = field.checkValidity();

  clearFieldError(field);

  if (!isValid || (field.required && !value)) {
    showFieldError(field, getFieldErrorMessage(field));
    return false;
  }

  return true;
}

// Get appropriate error message for field
function getFieldErrorMessage(field) {
  if (field.validity.valueMissing) {
    return `${getFieldLabel(field)} is required`;
  }
  if (field.validity.typeMismatch) {
    if (field.type === "email") {
      return "Please enter a valid email address";
    }
  }
  if (field.validity.rangeUnderflow) {
    return `Value must be at least ${field.min}`;
  }
  if (field.validity.rangeOverflow) {
    return `Value must be no more than ${field.max}`;
  }
  return "Please enter a valid value";
}

// Get field label text
function getFieldLabel(field) {
  const label = document.querySelector(`label[for="${field.id}"]`);
  if (label) {
    return label.textContent.replace("*", "").trim();
  }
  return field.name.replace(/_/g, " ");
}

// Show field error
function showFieldError(field, message) {
  clearFieldError(field);

  field.classList.add(
    "border-red-300",
    "focus:border-red-500",
    "focus:ring-red-500",
  );

  const errorElement = document.createElement("p");
  errorElement.className = "mt-1 text-sm text-red-600 field-error";
  errorElement.textContent = message;

  field.parentNode.appendChild(errorElement);
}

// Clear field error
function clearFieldError(field) {
  field.classList.remove(
    "border-red-300",
    "focus:border-red-500",
    "focus:ring-red-500",
  );

  const existingError = field.parentNode.querySelector(".field-error");
  if (existingError) {
    existingError.remove();
  }
}

// Validate current step
function validateCurrentStep(step) {
  const form = document.getElementById("intakeForm");
  let isValid = true;

  if (step === 1) {
    // Validate basic information
    const requiredFields = ["client_name", "plan_year", "requestor_name"];
    requiredFields.forEach((fieldName) => {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (field && !validateField(field)) {
        isValid = false;
      }
    });

    // Validate email if provided
    const emailField = form.querySelector('[name="requestor_email"]');
    if (emailField && emailField.value && !validateField(emailField)) {
      isValid = false;
    }
  }

  return isValid;
}

// Section toggle functionality
function initializeSectionToggles() {
  const sectionRadios = document.querySelectorAll(
    'input[type="radio"][name*="_changed"]',
  );

  sectionRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      const sectionCode = this.name.split("_")[1]; // Extract section code
      const isChanged = this.value === "yes";

      toggleSectionDetails(sectionCode, isChanged);
    });
  });
}

// Toggle section details visibility
function toggleSectionDetails(sectionCode, showDetails) {
  const noChangesDiv = document.getElementById(`no-changes-${sectionCode}`);
  const yesChangesDiv = document.getElementById(`yes-changes-${sectionCode}`);

  if (noChangesDiv && yesChangesDiv) {
    if (showDetails) {
      noChangesDiv.classList.add("hidden");
      yesChangesDiv.classList.remove("hidden");
    } else {
      noChangesDiv.classList.remove("hidden");
      yesChangesDiv.classList.add("hidden");
    }
  }
}

// Plan block functionality for multi-plan sections
function initializePlanBlocks() {
  // Handle dynamic plan addition/removal if needed
  const addPlanButtons = document.querySelectorAll(".add-plan-btn");
  const removePlanButtons = document.querySelectorAll(".remove-plan-btn");

  addPlanButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const sectionCode = this.dataset.section;
      addPlanBlock(sectionCode);
    });
  });

  removePlanButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const planBlock = this.closest(".plan-block");
      if (planBlock) {
        removePlanBlock(planBlock);
      }
    });
  });
}

// Add new plan block (for future enhancement)
function addPlanBlock(sectionCode) {
  console.log(`Adding plan block for section ${sectionCode}`);
  // Implementation would clone existing plan block and update field names
}

// Remove plan block (for future enhancement)
function removePlanBlock(planBlock) {
  if (confirm("Are you sure you want to remove this plan?")) {
    planBlock.remove();
    updatePlanNumbers();
  }
}

// Update plan numbers after removal
function updatePlanNumbers() {
  const planBlocks = document.querySelectorAll(".plan-block");
  planBlocks.forEach((block, index) => {
    const title = block.querySelector("h4");
    if (title) {
      title.textContent = `Plan ${index + 1}`;
    }
  });
}

// Form data persistence across steps
function initializeFormPersistence() {
  const form = document.getElementById("intakeForm");
  if (!form) return;

  // Save form data to sessionStorage on input changes
  const inputs = form.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    input.addEventListener("change", function () {
      saveFormData();
    });
  });

  // Load saved data on page load
  loadFormData();
}

// Save form data to session storage
function saveFormData() {
  const form = document.getElementById("intakeForm");
  const formData = new FormData(form);
  const data = {};

  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  sessionStorage.setItem("intakeFormData", JSON.stringify(data));
}

// Load form data from session storage
function loadFormData() {
  const savedData = sessionStorage.getItem("intakeFormData");
  if (!savedData) return;

  try {
    const data = JSON.parse(savedData);
    const form = document.getElementById("intakeForm");

    Object.entries(data).forEach(([key, value]) => {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) {
        if (field.type === "radio" || field.type === "checkbox") {
          field.checked = field.value === value;
        } else {
          field.value = value;
        }

        // Trigger change event to update UI
        field.dispatchEvent(new Event("change"));
      }
    });
  } catch (error) {
    console.error("Error loading form data:", error);
  }
}

// Progress tracking
function initializeProgressTracking() {
  updateProgressIndicators();
}

// Update progress step indicators
function updateProgressIndicators() {
  const currentStep = parseInt(
    document.querySelector('input[name="step"]').value,
  );
  const progressSteps = document.querySelectorAll(".progress-step");
  const progressLines = document.querySelectorAll(".progress-line");

  progressSteps.forEach((step, index) => {
    const stepNumber = index + 1;

    if (stepNumber < currentStep) {
      step.classList.add("completed");
      step.classList.remove("active", "inactive");
    } else if (stepNumber === currentStep) {
      step.classList.add("active");
      step.classList.remove("completed", "inactive");
    } else {
      step.classList.add("inactive");
      step.classList.remove("active", "completed");
    }
  });

  progressLines.forEach((line, index) => {
    if (index + 1 < currentStep) {
      line.classList.add("completed");
      line.classList.remove("inactive");
    } else {
      line.classList.add("inactive");
      line.classList.remove("completed");
    }
  });
}

// Utility functions
function showToast(message, type = "info") {
  // Use the global toast function if available, otherwise create simple alert
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    alert(message);
  }
}

// Auto-save functionality
let autoSaveTimer;
function initializeAutoSave() {
  const inputs = document.querySelectorAll("input, select, textarea");

  inputs.forEach((input) => {
    input.addEventListener("input", function () {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        saveFormData();
        showAutoSaveIndicator();
      }, 2000); // Save after 2 seconds of inactivity
    });
  });
}

// Show auto-save indicator
function showAutoSaveIndicator() {
  let indicator = document.getElementById("autosave-indicator");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.id = "autosave-indicator";
    indicator.className =
      "fixed bottom-4 right-4 bg-green-500 text-white px-3 py-1 rounded text-sm opacity-0 transition-opacity";
    indicator.textContent = "Draft saved";
    document.body.appendChild(indicator);
  }

  indicator.style.opacity = "1";
  setTimeout(() => {
    indicator.style.opacity = "0";
  }, 2000);
}

// Clear saved form data when form is successfully submitted
function clearSavedFormData() {
  sessionStorage.removeItem("intakeFormData");
}

// Handle form submission completion
document.addEventListener("DOMContentLoaded", function () {
  // If we're on the success page or redirected, clear saved data
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("created") === "1") {
    clearSavedFormData();
  }
});

// Keyboard shortcuts for form navigation
document.addEventListener("keydown", function (e) {
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    return; // Don't interfere with typing in fields
  }

  // Alt + Right arrow: Next step
  if (e.altKey && e.key === "ArrowRight") {
    e.preventDefault();
    const nextButton = document.querySelector('button[type="submit"]');
    if (nextButton) {
      nextButton.click();
    }
  }

  // Alt + Left arrow: Previous step
  if (e.altKey && e.key === "ArrowLeft") {
    e.preventDefault();
    const prevButton = document.querySelector(
      'button[onclick*="history.back"]',
    );
    if (prevButton) {
      prevButton.click();
    }
  }
});

// Initialize enhanced features when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  initializeAutoSave();
});

// Export functions for potential use by other scripts
window.IntakeForm = {
  validateField,
  showToast,
  toggleSectionDetails,
  saveFormData,
  loadFormData,
};
