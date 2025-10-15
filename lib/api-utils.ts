import { NextApiResponse } from 'next';

export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    
    // Ensure the error has the correct prototype
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export const handleApiError = (error: unknown, res: NextApiResponse) => {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      details: error.details,
    });
  }

  // Handle other types of errors
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error : undefined,
  });
};

export const successResponse = <T>(res: NextApiResponse, data: T, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

export const errorResponse = (res: NextApiResponse, message: string, statusCode = 400, details?: any) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
    details,
  });
};
