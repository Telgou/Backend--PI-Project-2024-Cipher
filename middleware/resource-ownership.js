import Post from "../models/Post.js";
import { User } from "../models/User.js";
import ResetToken from "../models/passwordreset.js";
import PreUser from "../models/preUser.js";

export const checkOwnership = async (req, res, next) => {

    const resourceId = req.path.split('/')[1];
    const resourceModel = getResourceModel(req);
    console.log("resource ", resourceId, resourceModel,)
    if (resourceId && resourceModel) {
        try {
            const resource = await resourceModel.findById(resourceId);

            if (!resource) {
                return res.status(404).json({ error: 'Resource not found' });
            }

            if (resourceModel == User) {
                if (resource._id.toString() !== req.user.id) {
                    console.log("FORBIDDEN")
                    return res.status(403).json({ error: 'Forbidden - You are not the owner' });
                }
            } else if (resource.userId.toString() !== req.user.id) {
                console.log("FORBIDDEN")
                return res.status(403).json({ error: 'Forbidden - You are not the owner' });
            }

            console.log(" OWNED ")
            req.resource = resource;
            next();
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server Error' });
        }
    } else {
        next();
    }
};



function getResourceModel(req) {
    // We extract the resource name from the URL
    const resourceName = req.originalUrl.split('/')[1];
    const secondaryResourceName = req.originalUrl.split('/')[3];

    console.log("resourceNAME= ", req.originalUrl, resourceName)
    // Map of resource models
    const modelMap = {
        'posts': Post,
        'users': User,
        'auth': {
            'changepass': ResetToken,
            '*': User,
        },
        'preusers': PreUser,
    };

    if (modelMap.hasOwnProperty(resourceName)) {
        if (typeof modelMap[resourceName] === 'object' && secondaryResourceName) {
            return modelMap[resourceName][secondaryResourceName] || null;
        } else {
            return modelMap[resourceName] || null;
        }
    } else {
        return null;
    }
}

