const { z } = require('zod');

// Base schemas for reuse
const emailSchema = z.string().email().optional().or(z.literal(''));
const textSchema = z.string().optional().or(z.literal(''));
const positiveNumberSchema = z.number().positive().optional();
const nonEmptyStringSchema = z.string().min(1);

// Main intake validation schema
const validateIntakeCreate = z.object({
  client_name: nonEmptyStringSchema,
  plan_year: z.string().transform(val => parseInt(val)).pipe(z.number().min(2020).max(2030)),
  requestor_name: nonEmptyStringSchema,
  payroll_storage_url: nonEmptyStringSchema,
  guide_type: z.enum(['Update Existing Guide', 'New Guide Build'], {
    required_error: 'Guide type is required'
  }),
  communications_add_ons: z.enum(['None', 'OE Letter', 'OE Presentation', 'Both', 'Other'], {
    required_error: 'Communications add ons selection is required'
  }),
  requested_production_time: z.enum(['Standard', 'Rush'], {
    required_error: 'Requested production time is required'
  }),
  notes_general: z.string().optional()
});

// Section update validation
const validateSectionUpdate = z.object({
  // Allow any structure for section payload as it varies by section
  // This will be validated more specifically per section type
}).passthrough();

// Medical plan schema (Section C)
const medicalPlanSchema = z.object({
  plan_name: z.string().optional(),
  carrier: z.string().optional(),
  network_name: z.string().optional(),
  plan_type: z.enum(['HDHP', 'PPO', 'EPO', 'HMO', 'Other']).optional(),
  out_of_network_available: z.boolean().optional(),
  deductible_individual: positiveNumberSchema,
  deductible_family: positiveNumberSchema,
  oop_max_individual: positiveNumberSchema,
  oop_max_family: positiveNumberSchema,
  coinsurance_in_network: z.string().optional(),
  coverage_preventive: z.string().optional(),
  coverage_primary_care: z.string().optional(),
  coverage_specialist: z.string().optional(),
  coverage_urgent_care: z.string().optional(),
  coverage_emergency_room: z.string().optional(),
  coverage_inpatient_hospital: z.string().optional(),
  coverage_outpatient_surgery: z.string().optional(),
  pharmacy_network_name: z.string().optional(),
  pharmacy_generic_tier: z.string().optional(),
  pharmacy_preferred_brand_tier: z.string().optional(),
  pharmacy_non_preferred_brand_tier: z.string().optional(),
  pharmacy_rx_oop_max_individual: positiveNumberSchema,
  pharmacy_rx_oop_max_family: positiveNumberSchema,
  hsa_eligible: z.boolean().optional(),
  hsa_employer_contribution_individual: positiveNumberSchema,
  hsa_employer_contribution_family: positiveNumberSchema,
  hsa_irs_limits: z.string().optional(),
  notes_special_considerations: z.string().optional()
});

// Dental plan schema (Section D)
const dentalPlanSchema = z.object({
  carrier: z.string().optional(),
  network_name: z.string().optional(),
  deductible_individual: positiveNumberSchema,
  deductible_family_max: positiveNumberSchema,
  annual_maximum: positiveNumberSchema,
  double_up_maximum: positiveNumberSchema,
  preventive_coverage: z.string().optional(),
  basic_coverage: z.string().optional(),
  major_coverage: z.string().optional(),
  orthodontia_coverage: z.string().optional(),
  premium_employee_only: positiveNumberSchema,
  premium_plus_one: positiveNumberSchema,
  premium_family: positiveNumberSchema
});

// Vision plan schema (Section E)
const visionPlanSchema = z.object({
  carrier: z.string().optional(),
  network_name: z.string().optional(),
  exam_copay: positiveNumberSchema,
  exam_frequency_months: positiveNumberSchema,
  lenses_copay: positiveNumberSchema,
  lenses_frequency_months: positiveNumberSchema,
  frames_allowance: positiveNumberSchema,
  frames_frequency_months: positiveNumberSchema,
  contacts_allowance: positiveNumberSchema,
  contacts_frequency_months: positiveNumberSchema,
  contacts_fit_followup_copay: positiveNumberSchema,
  premium_employee_only: positiveNumberSchema,
  premium_plus_spouse: positiveNumberSchema,
  premium_plus_children: positiveNumberSchema,
  premium_family: positiveNumberSchema
});

// Life & AD&D schema (Section F)
const lifeADDSchema = z.object({
  basic_multiple_of_salary: z.string().optional(),
  basic_max: positiveNumberSchema,
  basic_spouse_amount: positiveNumberSchema,
  basic_child_amount: positiveNumberSchema,
  basic_add_same_as_life: z.boolean().optional(),
  voluntary_increments_employee: z.string().optional(),
  voluntary_increments_spouse: z.string().optional(),
  voluntary_increments_child: z.string().optional(),
  voluntary_guarantee_issue_employee: z.string().optional(),
  voluntary_guarantee_issue_spouse: z.string().optional(),
  voluntary_guarantee_issue_child: z.string().optional(),
  voluntary_maximum_employee: z.string().optional(),
  voluntary_maximum_spouse: z.string().optional(),
  voluntary_maximum_child: z.string().optional(),
  voluntary_eoi_rules: z.string().optional(),
  notes: z.string().optional()
});

// Disability schema (Section G)
const disabilitySchema = z.object({
  std_percent_income: z.union([positiveNumberSchema, z.string()]).optional(),
  std_weekly_max: positiveNumberSchema,
  std_accident_wait_days: positiveNumberSchema,
  std_sickness_wait_days: positiveNumberSchema,
  std_max_duration_weeks: positiveNumberSchema,
  std_preexisting_limitations: z.string().optional(),
  ltd_percent_income: z.union([positiveNumberSchema, z.string()]).optional(),
  ltd_monthly_max: positiveNumberSchema,
  ltd_elimination_period_days: positiveNumberSchema,
  ltd_max_duration_rule: z.string().optional(),
  ltd_preexisting_limitations: z.string().optional(),
  notes: z.string().optional()
});

// FSAs and DCAs schema (Section H)
const fsaDcaSchema = z.object({
  fsa_full_max_contribution: positiveNumberSchema,
  fsa_full_rollover_amount: positiveNumberSchema,
  fsa_full_availability_timing: z.string().optional(),
  fsa_limited_max_contribution: positiveNumberSchema,
  fsa_limited_rollover_amount: positiveNumberSchema,
  fsa_limited_availability_timing: z.string().optional(),
  fsa_limited_eligibility_notes: z.string().optional(),
  dca_max_contribution: positiveNumberSchema,
  dca_rollover_allowed: z.boolean().optional(),
  dca_availability_timing: z.string().optional(),
  dca_eligibility_notes: z.string().optional(),
  notes: z.string().optional()
});

// EAP & Other Programs schema (Section I)
const eapOtherSchema = z.object({
  eap_provider: z.string().optional(),
  eap_sessions_per_issue_year: positiveNumberSchema,
  eap_modality: z.string().optional(),
  eap_availability: z.string().optional(),
  eap_family_access: z.boolean().optional(),
  telehealth_platforms: z.string().optional(),
  telehealth_services_included: z.string().optional(),
  telehealth_costs_by_service: z.string().optional(),
  additional_perks: z.string().optional(),
  notes: z.string().optional()
});

// File upload validation
const validateFileUpload = z.object({
  kind: z.enum(['GUIDE', 'PLAN_DOC', 'PAYROLL_SCREEN', 'OTHER']),
  files: z.array(z.object({
    originalname: z.string(),
    mimetype: z.string(),
    size: z.number().max(25 * 1024 * 1024) // 25MB
  }))
});

// Status update validation
const validateStatusUpdate = z.object({
  status: z.enum(['NOT_STARTED', 'STARTED', 'ROADBLOCK', 'READY_FOR_QA', 'DELIVERED_TO_CONSULTANT'])
});

// Query filters validation
const validateDashboardFilters = z.object({
  status: z.union([z.string(), z.array(z.string())]).optional(),
  complexity: z.union([z.string(), z.array(z.string())]).optional(),
  requestor: z.string().optional(),
  plan_year: z.string().transform(val => parseInt(val)).optional(),
  sort: z.enum(['client_name', 'requestor_name', 'complexity_band', 'date_received', 'status']).optional(),
  order: z.enum(['asc', 'desc']).optional()
});

module.exports = {
  validateIntakeCreate,
  validateSectionUpdate,
  validateFileUpload,
  validateStatusUpdate,
  validateDashboardFilters,
  medicalPlanSchema,
  dentalPlanSchema,
  visionPlanSchema,
  lifeADDSchema,
  disabilitySchema,
  fsaDcaSchema,
  eapOtherSchema
};
