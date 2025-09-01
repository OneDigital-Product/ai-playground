const { z } = require('zod');

function validateBody(schema) {
  return (req, res, next) => {
    try {
      const validation = schema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors
        });
      }
      
      req.validatedBody = validation.data;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Validation error' });
    }
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    try {
      const validation = schema.safeParse(req.query);
      
      if (!validation.success) {
        return res.status(400).json({
          error: 'Query validation failed',
          details: validation.error.flatten().fieldErrors
        });
      }
      
      req.validatedQuery = validation.data;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Query validation error' });
    }
  };
}

// Error handler for multer
function handleMulterError(error, req, res, next) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 25MB.' });
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ error: 'Too many files. Maximum is 10 files.' });
  }
  
  if (error.message === 'Invalid file type') {
    return res.status(400).json({ error: 'Invalid file type. Allowed types: PDF, DOCX, XLSX, PNG, JPG' });
  }
  
  next(error);
}

module.exports = {
  validateBody,
  validateQuery,
  handleMulterError
};
