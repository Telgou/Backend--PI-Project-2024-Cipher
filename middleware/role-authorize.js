import User from "../models/User.js";

class UnauthenticatedError extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnauthenticatedError';
    }
}

export const restrict = (...role) => {

    return async (req, res, next) => {
        console.log(req.user.id);
        const userId = req.user.id;
        if (!userId) {
            throw new UnauthenticatedError('User ID is undefined');
        }

        const user = await User.findOne({ _id: userId });

        const userRoles = user.role;
        console.log(user);

        if (!userRoles || !userRoles.some((r) => role.includes(r))) {

            res.status(500).json({ error: 'UnauthenticatedError' });
 
        }
        next();
    };
};

/*
interface AuthenticatedRequest extends Request {
    user: {
        role: string[];
    };
}

export const restrict = (...role: any) => {

    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

        const userRoles = req.user?.role;

        if (!userRoles || !userRoles.some((r) => role.includes(r))) {

            throw new UnauthenticatedError(

                'Your roles are not allowed to access this route'

            );

        }

        next();

    };

};*/