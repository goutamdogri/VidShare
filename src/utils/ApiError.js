// TODO: learn more javascript to understand this code - inheritance, cllass

// jab bhi error ayega , issike through bhejenge

class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        // to detect stack of error from where the error comes
        if(stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export {ApiError}