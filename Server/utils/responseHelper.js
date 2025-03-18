// utils/responseHelper.js

exports.sendResponse = (res, statusCode, data, message = "success", pagination = null) => {
    const response = {
      status: message,
      results: Array.isArray(data) ? data.length : undefined,
      data,
    };
  
    // Include pagination metadata if provided
    if (pagination) {
      response.pagination = pagination;
    }
  
    res.status(statusCode).json(response);
  };
  