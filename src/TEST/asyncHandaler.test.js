import { asyncHandler } from "../utils/asyncHandeler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

function logReqResNext(req, res) {
    console.log("hELLO wORLD");
    return res
        .status(201)
        .json(new ApiResponse(200, "hello ji", "test successful"))
    // console.log(res);
    // console.log(next);
}
const a = 2;
// const one = asyncHandler(logReqResNext);

const two = (e) =>  {
    return (req, res) => {
        console.log(req.cookies);
        Promise.resolve(e(req, res));
    }
}

const one = two(logReqResNext)

// const two = () => {
//     return (req) => {console.log(req);}
// }
    
// const one = two  

export default one;