const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next)=>{
    try {
        let token = req.headers.authorization
        token = token?.split(" ")[1]

        console.log(token)

        if(!token){
            return res.status(401).json({message:"unauthorized"})
        }

        const decodedToken = jwt.verify(token, "travel-web")

        

        req.user = decodedToken

        console.log(req.user)

        if(!decodedToken){
            return res.status(401).json({message:"unauthorized"})
        }

        next()

    } catch (error) {
        res.status(500).json({message:"something went wrong"})
    }
}

module.exports = authMiddleware