'use client';

import { useState } from 'react';
import { Result, ok, err } from 'neverthrow';
import { 
  ValidationChain,
  validateRequired,
  validateEmail,
  validateMinLength,
  combineValidations,
  EVPSResult
} from '@/lib/result-utils';
import {
  ValidationError,
  toDisplayMessage,
  isValidationError
} from '@/lib/errors';

// Sample form data interface
interface UserFormData {
  name: string;
  email: string;
  message: string;
}

// Sample validation function using NeverThrow
const validateUserForm = (data: Partial<UserFormData>): EVPSResult<UserFormData> => {
  const nameResult = validateRequired(data.name, 'Name')
    .andThen(name => validateMinLength(name, 2, 'Name'));
    
  const emailResult = validateRequired(data.email, 'Email')
    .andThen(validateEmail);
    
  const messageResult = validateRequired(data.message, 'Message')
    .andThen(msg => validateMinLength(msg, 10, 'Message'));

  return combineValidations([nameResult, emailResult, messageResult])
    .map(([name, email, message]) => ({ name, email, message }));
};

export default function Home() {
  const [formData, setFormData] = useState<Partial<UserFormData>>({});
  const [validationResult, setValidationResult] = useState<EVPSResult<UserFormData> | null>(null);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  const handleInputChange = (field: keyof UserFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    setValidationResult(null);
    setSubmitResult(null);
  };

  const handleValidate = () => {
    const result = validateUserForm(formData);
    setValidationResult(result);
  };

  const handleSubmit = () => {
    const result = validateUserForm(formData);
    setValidationResult(result);
    
    result.match(
      (validData) => {
        // Simulate successful submission
        setSubmitResult(`Form submitted successfully for ${validData.name}!`);
        setFormData({});
      },
      (error) => {
        setSubmitResult(`Validation failed: ${toDisplayMessage(error)}`);
      }
    );
  };

  // Example of using ValidationChain
  const validateWithChain = () => {
    const result = ValidationChain.of(formData.name || '')
      .validate(name => validateRequired(name, 'Name'))
      .validate(name => validateMinLength(name, 2, 'Name'))
      .transform(name => name.toUpperCase())
      .build();
      
    console.log('Chain validation result:', result);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Employee Value Perception Study
          </h1>
          <p className="text-lg text-gray-600">
            Demonstrating NeverThrow error handling patterns
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Sample Form with NeverThrow Validation</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (required, min 2 chars)
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={handleInputChange('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (required, valid format)
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message (required, min 10 chars)
              </label>
              <textarea
                value={formData.message || ''}
                onChange={handleInputChange('message')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your message"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleValidate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Validate Only
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Validate & Submit
              </button>
              <button
                onClick={validateWithChain}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Chain Example
              </button>
            </div>
          </div>
        </div>

        {/* Validation Results Display */}
        {validationResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3">Validation Result</h3>
            {validationResult.match(
              (validData) => (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center mb-2">
                    <span className="text-green-800 font-medium">✓ Validation Successful</span>
                  </div>
                  <pre className="text-sm text-green-700 bg-green-100 p-2 rounded">
                    {JSON.stringify(validData, null, 2)}
                  </pre>
                </div>
              ),
              (error) => (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center mb-2">
                    <span className="text-red-800 font-medium">✗ Validation Failed</span>
                  </div>
                  <p className="text-red-700 text-sm mb-2">{error.message}</p>
                  {isValidationError(error) && error.details && (
                    <div className="text-sm text-red-600">
                      <p className="font-medium">Field Errors:</p>
                      <pre className="bg-red-100 p-2 rounded mt-1">
                        {JSON.stringify(error.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* Submit Result Display */}
        {submitResult && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-3">Submit Result</h3>
            <div className={`p-3 rounded-md ${
              submitResult.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
            }`}>
              {submitResult}
            </div>
          </div>
        )}

        {/* Documentation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">NeverThrow Patterns Demonstrated</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong>Result&lt;T, E&gt;:</strong> Type-safe error handling without exceptions
            </div>
            <div>
              <strong>Validation Chains:</strong> Compose multiple validation steps with <code>andThen</code>
            </div>
            <div>
              <strong>Error Combination:</strong> Collect all validation errors with <code>combineValidations</code>
            </div>
            <div>
              <strong>Pattern Matching:</strong> Handle success/error cases explicitly with <code>match</code>
            </div>
            <div>
              <strong>Transformation:</strong> Transform success values with <code>map</code>
            </div>
            <div>
              <strong>Custom Error Types:</strong> Structured error handling with <code>EVPSError</code> types
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}