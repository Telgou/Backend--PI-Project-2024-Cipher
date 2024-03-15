import User from "../models/User.js";
import { Role } from "../models/User.js";

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
        const userDiscriminator = req.user.role;

        Role.findOne({ name: userDiscriminator })
            .then(role => {
                if (!role) {
                    return res.status(403).json({ error: 'Forbidden' }); // Handle if no matching role
                }

                const userPermissions = role.permissions;
                // ... (rest of your permission check logic from previous examples) 
            })
            .catch(err => {
                // Handle database errors
            });

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