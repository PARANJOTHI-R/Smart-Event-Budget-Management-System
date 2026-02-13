import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken'

const userAuth = async (req, res, next) => {

    const { token } = req.cookies;
    if (!token) {
        return res.json({ success: false, message: 'Unauthorized Login again' })
    }

    try {
        const parsedId = jwt.verify(token, process.env.JWT_SECRET);
        if (parsedId.id) {
            req.body=req.body||{};
            req.body.userId = parsedId.id;
            next();
        } else {
            return res.json({ success: false, message: 'Unauthorized Login again' })
        }
        
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export default userAuth;
