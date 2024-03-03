// TODO:  i don't understand second fat arrow ka input mai req, res, next ka data kaise ayega? - need to understand from whare it is called.
// promise.resolve returns a promise whatever  the return value is. Thus maintain consistency.

const asyncHandler = (requestHandeler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandeler(req, res, next)).catch((err) => next(err));
    }
};


export { asyncHandler };




// const asyncHandler = () => {}
// const asyncHandler = (function) => {() => {}}
// const asyncHandler = (function) => async () => {}

// another approach
// "next" is for refferencing next middleware that we want to after this. this chain is end when final sand is called.
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next);
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// };
