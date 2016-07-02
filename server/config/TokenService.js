const jwt = require('jsonwebtoken');

class TokenService {
    constructor(headers) {
        this.token      = this._extractTokenFromHeaders(headers);
        this.payload    = {};
        this.validToken = false;

        this._verifyToken();
    }

    static createToken(options, cb) {
        const payload = {
            profilePicture: options.user.profilePicture,
            firstName: options.user.firstName,
            lastName: options.user.lastName,
            _id: options.user._id
        };

        jwt.sign(payload, process.env.TOKEN_SECRET, {
            algorithm: 'HS256',
            expiresIn: options.expireTime || 1440 // expires in 24 hours
        }, cb);
    }

    getPayload() {
        return this.payload;
    }

    isAuthenticated() {
        return this.validToken;
    }

    _verifyToken() {
        if(!this.token) return;

        try {
            this.payload    = jwt.verify(this.token, process.env.TOKEN_SECRET);
            this.validToken = true;
        } catch (err) {
            this.payload    = {};
            this.validToken = false;
            console.log(err);
        }
    }

    _extractTokenFromHeaders(headers) {
        if(!headers || !headers.authorization) return false;

        return headers.authorization.replace('Bearer ', '');
    }
}

module.exports = TokenService;