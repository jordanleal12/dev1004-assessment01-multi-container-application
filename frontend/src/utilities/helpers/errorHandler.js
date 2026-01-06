// Map to provide default error messages for expected HTTP codes
export const statusMap = {
  // Client errors (4xx)
  400: "Bad request. Please check request syntax.",
  401: "Unauthorized. Please log in to continue.",
  403: "Forbidden. You don't have permission to access this route.",
  404: "Not Found. The requested resource was not found or does not exist.",
  409: "Conflict. Please retry request.",
  // Server errors (5xx)
  500: "Server error. Please try again later.",
  502: "Server is temporarily unavailable. Please try again.",
  503: "Service unavailable. Please try again later.",
};

// Format and return standardized error object to be used in axios API calls
export const handleApiError = (error) => {
  // Default error structure to return
  const errRes = {
    message: "",
    status: null,
    errors: [], // Some errors have errors array attached
  };

  // Error.response only exists if response received from server with error status
  if (error.response) {
    // Assign status code and extract response data
    errRes.status = error.response.status;
    const resData = error.response.data;

    // If response has message, use it, otherwise get from statusMap or revert to default message
    errRes.message =
      resData?.message || statusMap[errRes.status] || "Unknown error occurred. Please try again.";

    // If response has errors array, attach it
    if (resData?.errors && resData.errors.length > 0) {
      errRes.errors = resData.errors;
    }
  } else if (error.code === "ECONNABORTED") {
    // Axios sets this code for timeouts. Call above next else if, as timeout also has request
    errRes.message = "Request has timed out. Please try again.";
  } else if (error.request) {
    // If we have request but no response, it's probably a network error
    errRes.message = "Unable to connect to server. Check connection and try again";
  } else {
    // Catch other errors we may have missed and give generic message
    errRes.message = "An unexpected error occurred. Please try again.";
  }

  // Log error for debugging
  console.error("API Error:", {
    status: errRes.status,
    message: errRes.message,
    errors: errRes.errors,
    originalError: error,
  });

  return errRes;
};
