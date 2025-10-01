const validateFilters = (filters) => {
  const { recipient, after, before, date } = filters;

  if (before && after) {
    return {
      isValid: false,
      error: {
        status: 400,
        message: {
          error: 'Invalid filters',
          message: 'before and after cannot be used together'
        }
      }
    };
  }

  if (date && (before || after)) {
    return {
      isValid: false,
      error: {
        status: 400,
        message: {
          error: 'Invalid filters',
          message: 'date and before/after cannot be used together'
        }
      }
    };
  }

  if (date) {
    const dateObj = new Date(date);
    if (isNaN(dateObj)) {
      return {
        isValid: false,
        error: {
          status: 400,
          message: {
            error: 'Invalid filters',
            message: 'date is invalid'
          }
        }
      };
    }
  }

  if (recipient) {
    if (typeof recipient !== 'string' || recipient.trim() === '') {
      return {
        isValid: false,
        error: {
          status: 400,
          message: {
            error: 'Invalid filters',
            message: 'recipient must be a string and not empty.'
          }
        }
      };
    }
  }

  return {
    isValid: true,
    error: null
  };
};
