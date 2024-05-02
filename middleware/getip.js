const getIPAddress = (req) => {
    const ip =
        req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    return ip;
};

const extractIP = (req, res, next) => {
    req.clientIP = getIPAddress(req);
    next();
};

export default extractIP;
