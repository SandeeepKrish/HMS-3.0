// class ErrorHandler extends Error {
//   constructor(message, statusCode) {
//     super(message);
//     this.statusCode = statusCode;
//   }
// }

// export const errorMiddleware = (err, req, res, next) => {
//   err.message = err.message || "Internal Server Error";
//   err.statusCode = err.statusCode || 500;

//   if (err.code === 11000) {
//     const message = `Duplicate ${Object.keys(err.keyValue)} Entered`,
//       err = new ErrorHandler(message, 400);
//   }
//   if (err.name === "JsonWebTokenError") {
//     const message = `Json Web Token is invalid, Try again!`;
//     err = new ErrorHandler(message, 400);
//   }
//   if (err.name === "TokenExpiredError") {
//     const message = `Json Web Token is expired, Try again!`;
//     err = new ErrorHandler(message, 400);
//   }
//   if (err.name === "CastError") {
//     const message = `Invalid ${err.path}`,
//       err = new ErrorHandler(message, 400);
//   }

//   const errorMessage = err.errors
//     ? Object.values(err.errors)
//         .map((error) => error.message)
//         .join(" ")
//     : err.message;

//   return res.status(err.statusCode).json({
//     success: false,
//     // message: err.message,
//     message: errorMessage,
//   });
// };

// export default ErrorHandler;
export const createError = (message, statusCode) => ({
  message: message || "Internal Server Error",
  statusCode: statusCode || 500,
});

export const errorMiddleware = (err, req, res, next) => {
  let errorMessage = err.message || "Internal Server Error";
  let statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    errorMessage = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    statusCode = 400;
  }
  if (err.name === "JsonWebTokenError") {
    errorMessage = "Json Web Token is invalid, Try again!";
    statusCode = 400;
  }
  if (err.name === "TokenExpiredError") {
    errorMessage = "Json Web Token is expired, Try again!";
    statusCode = 400;
  }
  if (err.name === "CastError") {
    errorMessage = `Invalid ${err.path}`;
    statusCode = 400;
  }

  if (err.errors) {
    errorMessage = Object.values(err.errors)
      .map((error) => error.message)
      .join(" ");
  }

  return res.status(statusCode).json({
    success: false,
    message: errorMessage,
  });
};
