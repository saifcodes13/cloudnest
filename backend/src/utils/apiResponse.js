export class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.success = true;
    this.message = message;
    this.data = data;
  }

  static success(res, data, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static error(res, message = "Error", statusCode = 500, details = null) {
    const responsePayload = {
      success: false,
      error: {
        message,
      },
    };
    if (details) {
      responsePayload.error.details = details;
    }
    return res.status(statusCode).json(responsePayload);
  }
}

export default ApiResponse;
