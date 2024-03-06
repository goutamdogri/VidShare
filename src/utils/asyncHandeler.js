// TODO:  i don't understand second fat arrow ka input mai req, res, next ka data kaise ayega? - need to understand from whare it is called.

// SOLVE: - ".post" function/method ko ak callback function chahiye. uss callback function ka input field ke andar argument error, req, res, next available hota hai. yeh express ka functionality hai. to hume asyncHandaler ko aise execute karna hai ki asyncHandaler execute hoke uske andar jo fat arrow function hai, o as a callback function ".post" ke andar jay.

// WORk: 'requestHandeler' jo bhi return karega usko hum promise mai convert kar denge. so that concistency is maintained. we use it as a utility. so, jo bhi function ke liye jarorat padega uss function  ko iske andar pass kar denge. and humara required result - promise mil jayega.

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
