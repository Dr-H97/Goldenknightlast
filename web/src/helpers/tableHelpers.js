/**
 * Helper functions for tables
 */

/**
 * Apply data-label attributes to all cells in a table
 * This helps with responsive mobile tables
 * @param {string} tableId - The ID of the table to process
 */
export const applyDataLabels = (tableId) => {
  // Get the table element
  const table = document.getElementById(tableId);
  if (!table) return;
  
  // Get all header cells
  const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent);
  
  // Apply data-label to each cell in the table body
  const rows = table.querySelectorAll('tbody tr');
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    cells.forEach((cell, index) => {
      if (index < headers.length) {
        cell.setAttribute('data-label', headers[index]);
      }
    });
  });
};

/**
 * Format a date for display
 * @param {string} dateString - ISO date string to format
 * @param {boolean} includeTime - Whether to include time in the formatted output
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, includeTime = true) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  if (includeTime) {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};
