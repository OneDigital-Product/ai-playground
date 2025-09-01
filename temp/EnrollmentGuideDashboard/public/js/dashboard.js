// Dashboard functionality for Enrollment Guide application

document.addEventListener('DOMContentLoaded', function() {
    initializeStatusSelects();
    initializeTableSorting();
    initializeFilters();
    initializeKeyboardShortcuts();
    loadLiveStats();
});

// Status update functionality
function initializeStatusSelects() {
    const statusSelects = document.querySelectorAll('.status-select');
    
    statusSelects.forEach(select => {
        const originalStatus = select.value;
        
        select.addEventListener('change', function(e) {
            const intakeId = this.dataset.intakeId;
            const newStatus = this.value;
            const selectElement = this;
            
            // Add loading state
            selectElement.disabled = true;
            selectElement.style.opacity = '0.6';
            
            // Update status via API
            fetch(`/intakes/${intakeId}/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showToast('Status updated successfully', 'success');
                    // Update the current status data attribute
                    selectElement.dataset.currentStatus = newStatus;
                    // Update the visual styling
                    updateStatusStyling(selectElement, newStatus);
                    
                    // Dispatch custom event to trigger stats update
                    const statusChangedEvent = new CustomEvent('statusChanged', {
                        detail: { intakeId, oldStatus: originalStatus, newStatus }
                    });
                    document.dispatchEvent(statusChangedEvent);
                } else {
                    throw new Error(data.error || 'Failed to update status');
                }
            })
            .catch(error => {
                console.error('Error updating status:', error);
                showToast('Failed to update status: ' + error.message, 'error');
                // Revert to original status
                selectElement.value = originalStatus;
            })
            .finally(() => {
                // Remove loading state
                selectElement.disabled = false;
                selectElement.style.opacity = '1';
            });
        });
    });
}

// Update status select styling based on status
function updateStatusStyling(selectElement, status) {
    // Remove all status classes
    const statusClasses = [
        'bg-gray-100', 'text-gray-800',
        'bg-blue-100', 'text-blue-800',
        'bg-red-100', 'text-red-800',
        'bg-yellow-100', 'text-yellow-800',
        'bg-green-100', 'text-green-800'
    ];
    
    selectElement.classList.remove(...statusClasses);
    
    // Add appropriate classes based on status
    switch(status) {
        case 'NOT_STARTED':
            selectElement.classList.add('bg-gray-100', 'text-gray-800');
            break;
        case 'STARTED':
            selectElement.classList.add('bg-blue-100', 'text-blue-800');
            break;
        case 'ROADBLOCK':
            selectElement.classList.add('bg-red-100', 'text-red-800');
            break;
        case 'READY_FOR_QA':
            selectElement.classList.add('bg-yellow-100', 'text-yellow-800');
            break;
        case 'DELIVERED_TO_CONSULTANT':
            selectElement.classList.add('bg-green-100', 'text-green-800');
            break;
    }
}

// Table sorting functionality
function initializeTableSorting() {
    const sortableHeaders = document.querySelectorAll('th a[href*="sort="]');
    
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function(e) {
            // Show loading indicator
            showLoadingIndicator();
        });
    });
}

// Filter functionality
function initializeFilters() {
    const filterForm = document.getElementById('filtersForm');
    if (!filterForm) return;
    
    // Auto-submit on filter changes
    const filterInputs = filterForm.querySelectorAll('select, input');
    filterInputs.forEach(input => {
        input.addEventListener('change', function() {
            // Small delay to allow for multiple rapid changes
            clearTimeout(window.filterTimeout);
            window.filterTimeout = setTimeout(() => {
                showLoadingIndicator();
                filterForm.submit();
            }, 300);
        });
    });
    
    // Handle text input with debouncing
    const textInputs = filterForm.querySelectorAll('input[type="text"]');
    textInputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(window.textFilterTimeout);
            window.textFilterTimeout = setTimeout(() => {
                showLoadingIndicator();
                filterForm.submit();
            }, 800);
        });
    });
}

// Keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[name="requestor"]');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        
        // N: New intake (when not in input)
        if (e.key === 'n' && !isInputFocused()) {
            e.preventDefault();
            window.location.href = '/intakes/new';
        }
        
        // E: Export CSV (when not in input)
        if (e.key === 'e' && !isInputFocused()) {
            e.preventDefault();
            const exportLink = document.querySelector('a[href*="export.csv"]');
            if (exportLink) {
                window.location.href = exportLink.href;
            }
        }
    });
}

// Check if an input element is currently focused
function isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        activeElement.tagName === 'SELECT' ||
        activeElement.contentEditable === 'true'
    );
}

// Load live statistics
function loadLiveStats() {
    // Simple implementation - in a real app, this might poll an API
    const statsElement = document.getElementById('live-stats');
    if (statsElement) {
        // Update with current page info
        const totalRows = document.querySelectorAll('tbody tr').length;
        if (totalRows > 0) {
            statsElement.textContent = `${totalRows} items shown`;
        } else {
            statsElement.textContent = 'No items';
        }
    }
}

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type} translate-x-full`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Slide in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 100);
    
    // Slide out and remove
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Loading indicator
function showLoadingIndicator() {
    // Create or show loading indicator
    let loader = document.getElementById('loading-indicator');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loading-indicator';
        loader.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
        loader.innerHTML = '<div class="spinner"></div> Loading...';
        document.body.appendChild(loader);
    }
    
    loader.style.display = 'flex';
    
    // Hide after a reasonable time
    setTimeout(() => {
        if (loader) {
            loader.style.display = 'none';
        }
    }, 2000);
}

// Row click handling for navigation
document.addEventListener('click', function(e) {
    const row = e.target.closest('tr[onclick]');
    if (row && !e.target.closest('.status-select') && !e.target.closest('a') && !e.target.closest('button')) {
        // Extract the onclick attribute and execute it
        const onclick = row.getAttribute('onclick');
        if (onclick) {
            eval(onclick);
        }
    }
});

// Bulk actions (if implemented in the future)
function initializeBulkActions() {
    const selectAllCheckbox = document.getElementById('select-all');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const bulkActionButtons = document.querySelectorAll('.bulk-action');
    
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            rowCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateBulkActionButtons();
        });
    }
    
    rowCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBulkActionButtons);
    });
    
    function updateBulkActionButtons() {
        const checkedCount = document.querySelectorAll('.row-checkbox:checked').length;
        bulkActionButtons.forEach(button => {
            button.disabled = checkedCount === 0;
            button.textContent = button.textContent.replace(/\(\d+\)/, `(${checkedCount})`);
        });
    }
}

// Export functionality enhancement
function enhancedExport() {
    const exportButtons = document.querySelectorAll('a[href*="export.csv"]');
    
    exportButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Show loading state
            const originalText = this.textContent;
            this.innerHTML = '<div class="spinner mr-2"></div> Exporting...';
            this.style.pointerEvents = 'none';
            
            // Reset after a delay (the download should start)
            setTimeout(() => {
                this.textContent = originalText;
                this.style.pointerEvents = 'auto';
                showToast('Export started - check your downloads', 'info');
            }, 1000);
        });
    });
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', function() {
    enhancedExport();
    // initializeBulkActions(); // Uncomment when bulk actions are implemented
});

// Global function to make showToast available to other scripts
window.showToast = showToast;

// Utility function for formatting dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Utility function for formatting relative time
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
        return 'Yesterday';
    } else {
        return `${Math.floor(diffInHours / 24)} days ago`;
    }
}

// Performance optimization: Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Error handling for network requests
function handleNetworkError(error) {
    console.error('Network error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showToast('Network error - please check your connection', 'error');
    } else {
        showToast('An unexpected error occurred', 'error');
    }
}

// Delete intake functionality
function deleteIntake(intakeId, clientName) {
    if (confirm(`Are you sure you want to delete the intake for "${clientName}"? This action cannot be undone.`)) {
        // Show loading state
        showToast('Deleting intake...', 'info');
        
        fetch(`/intakes/${intakeId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showToast('Intake deleted successfully', 'success');
                // Refresh the page to update the list
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                throw new Error(data.error || 'Failed to delete intake');
            }
        })
        .catch(error => {
            console.error('Error deleting intake:', error);
            showToast('Failed to delete intake: ' + error.message, 'error');
        });
    }
}

// Make utility functions available globally
window.formatDate = formatDate;
window.formatRelativeTime = formatRelativeTime;
window.debounce = debounce;
window.handleNetworkError = handleNetworkError;
window.deleteIntake = deleteIntake;
