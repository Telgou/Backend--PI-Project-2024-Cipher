import * as chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import Post from '../models/Post.js';
import {
    getLessPrivUsers,
    getUser,
    getUserFriends,
    updateUser,
    addRemoveFriend
} from '../controllers/users.js';

chai.use(chaiHttp);
const expect = chai.expect;

// Define mock data for users with different roles
const mockUsers = {
    admin: [
        { firstName: 'Admin', lastName: 'Admin', email: 'admin@example.com', role: 'admin' }
    ],
    depHead: [
        { firstName: 'Eve', lastName: 'Wilson', email: 'eve@example.com', role: 'depHead' },
        { firstName: 'Charlie', lastName: 'Miller', email: 'charlie@example.com', role: 'depHead' }
    ],
    coordinator: [
        { firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', role: 'coordinator' },
        { firstName: 'Bob', lastName: 'Brown', email: 'bob@example.com', role: 'coordinator' }
    ],
    prof: [
        { firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'prof' },
        { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'prof' }
    ]
};

describe('Auth Controller Tests', () => {

    describe('getLessPrivUsers', () => {
        let findStub;

        beforeEach(() => {
            // Create a stub for User.find method
            findStub = sinon.stub(User, 'find');
        });

        afterEach(() => {
            sinon.restore(); // Restore stubs after each test
        });

        it('should return depHeads, coords and profs users cause user is an admin', async () => {
            // Mock request and response objects
            const req = {
                user: { role: 'admin' } // Assuming an admin user
            };
            const res = {
                status: sinon.stub().returnsThis(), // Stubbing status method
                json: sinon.stub()
            };

            // Stub User.find to return the mock data for admin role
            findStub.withArgs({ role: { $in: ['depHead', 'coordinator', 'prof'] } }).resolves(mockUsers.depHead.concat(mockUsers.coordinator, mockUsers.prof));


            // Call the controller function
            await getLessPrivUsers(req, res);

            // Assert that users are returned in the response
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.be.an('array');
            expect(res.json.firstCall.args[0]).to.deep.equal(mockUsers.depHead.concat(mockUsers.coordinator, mockUsers.prof));

            // Assert that User.find was called with the correct arguments
            expect(User.find.calledOnce).to.be.true;
            expect(User.find.calledWith({ role: { $in: ['depHead', 'coordinator', 'prof'] } })).to.be.true;

            // Assert the response status
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;

            // Log the returned users
            console.log('Returned Users:', res.json.firstCall.args[0]);

        });

        it('should return coords and profs users cause user is an depHead', async () => {
            // Mock request and response objects
            const req = {
                user: { role: 'depHead' } // Assuming an admin user
            };
            const res = {
                status: sinon.stub().returnsThis(), // Stubbing status method
                json: sinon.stub()
            };

            // Stub User.find to return the mock data for admin role
            findStub.withArgs({ role: { $in: ['coordinator', 'prof'] } }).resolves(mockUsers.coordinator.concat(mockUsers.prof));

            // Call the controller function
            await getLessPrivUsers(req, res);

            // Assert that users are returned in the response
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.be.an('array');
            expect(res.json.firstCall.args[0]).to.deep.equal(mockUsers.coordinator.concat(mockUsers.prof));

            // Assert that User.find was called with the correct arguments
            expect(User.find.calledOnce).to.be.true;
            expect(User.find.calledWith({ role: { $in: ['coordinator', 'prof'] } })).to.be.true;

            // Assert the response status
            //console.log(res.status.callCount); // Log the call count of res.status
            expect(res.status.calledOnce).to.be.true;
            //console.log(res.status.args); // Log the arguments passed to res.status
            expect(res.status.calledWith(200)).to.be.true;

            // Log the returned users
            console.log('Returned Users:', res.json.firstCall.args[0]);

        });

    });


    describe('getUser', () => {
        it('should return the user with the provided ID', async () => {
            // Mock request and response objects
            const req = {
                params: { id: 'mockUserId' } // Assuming a valid user ID
            };
            const res = {
                status: sinon.stub().returnsThis(), // Stubbing status method
                json: sinon.stub()
            };

            // Stub User.findById to return a mock user
            const mockUser = { firstName: 'Mock', lastName: 'User', email: 'mock@example.com', role: 'user' };
            sinon.stub(User, 'findById').withArgs('mockUserId').resolves(mockUser);

            // Call the controller function
            await getUser(req, res);

            // Assert that the user is returned in the response
            expect(res.json.calledOnce).to.be.true;
            expect(res.json.firstCall.args[0]).to.deep.equal(mockUser);

            // Assert the response status
            expect(res.status.calledOnce).to.be.true;
            expect(res.status.calledWith(200)).to.be.true;

            // Restore stub after test
            sinon.restore();
        });
    });


    describe('getUserFriends', () => {
        let sandbox;

        before(() => {
            sandbox = sinon.createSandbox();
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should return user friends with formatted data', async () => {
            const req = {
                params: {
                    id: 'user_id'
                }
            };
            const res = {
                status: sandbox.stub().returnsThis(),
                json: sandbox.stub()
            };

            const user = {
                _id: 'user_id',
                friends: ['friend_id1', 'friend_id2']
            };

            const friends = [
                {
                    _id: 'friend_id1',
                    firstName: 'Friend1',
                    lastName: 'Lastname1',
                    occupation: 'Occupation1',
                    location: 'Location1',
                    picturePath: '/path/to/picture1'
                },
                {
                    _id: 'friend_id2',
                    firstName: 'Friend2',
                    lastName: 'Lastname2',
                    occupation: 'Occupation2',
                    location: 'Location2',
                    picturePath: '/path/to/picture2'
                }
            ];

            sandbox.stub(User, 'findById')
                .withArgs('user_id').resolves(user)
                .withArgs('friend_id1').resolves(friends[0])
                .withArgs('friend_id2').resolves(friends[1]);

            await getUserFriends(req, res);

            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledWith(res.json, [
                {
                    _id: 'friend_id1',
                    firstName: 'Friend1',
                    lastName: 'Lastname1',
                    occupation: 'Occupation1',
                    location: 'Location1',
                    picturePath: '/path/to/picture1'
                },
                {
                    _id: 'friend_id2',
                    firstName: 'Friend2',
                    lastName: 'Lastname2',
                    occupation: 'Occupation2',
                    location: 'Location2',
                    picturePath: '/path/to/picture2'
                }
            ]);
        });

        it('should handle error if user id is not found', async () => {
            const req = {
                params: {
                    id: 'invalid_user_id'
                }
            };
            const res = {
                status: sandbox.stub().returnsThis(),
                json: sandbox.stub()
            };

            sandbox.stub(User, 'findById').rejects({ message: 'User not found' });

            await getUserFriends(req, res);

            sinon.assert.calledWith(res.status, 404);
            sinon.assert.calledWith(res.json, { message: 'User not found' });
        });

        it('should handle error if friend id is not found', async () => {
            const req = {
                params: {
                    id: 'user_id'
                }
            };
            const res = {
                status: sandbox.stub().returnsThis(),
                json: sandbox.stub()
            };

            const user = {
                _id: 'user_id',
                friends: ['friend_id1', 'friend_id2']
            };

            sandbox.stub(User, 'findById')
                .withArgs('user_id').resolves(user)
                .withArgs('friend_id1').resolves(null)
                .withArgs('friend_id2').resolves(null);

            await getUserFriends(req, res);

            sinon.assert.calledWith(res.status, 404);
        });
    });

/*
    describe('updateUser Tests', () => {
        let sandbox;
    
        beforeEach(() => {
            sandbox = sinon.createSandbox();
        });
    
        afterEach(() => {
            sandbox.restore();
        });

        it('should update user information and return 200 status', async () => {
            // 1. Create a test user in your database
            const existingUser = await User.create({
                firstName: 'OldName',  // Use a different starting name
                lastName: 'OldLastName',
                email: 'test@example.com',
                password: 'hashedpassword', // (Remember to hash in a real application)
                // ... other fields as needed for your User schema
            });
        
            // 2. Stub Post.updateUserDataInPosts to avoid actual updates
            sandbox.stub(Post, 'updateUserDataInPosts').resolves();
        
            // 3. Define the update data
            const updateData = { firstName: 'NewName', picturePath: 'newPic.jpg' };
        
            // 4. Make the API request
            const res = await chai
                .request(app)
                .put(`/users/${existingUser._id}`) // Use actual route path
                .send(updateData);
        
            // 5. Assertions on the response
            expect(res).to.have.status(200);
            expect(res.body.message).to.equal('User information updated successfully'); 
        
            // 6. Assertions against the database
            const updatedUser = await User.findById(existingUser._id);
            expect(updatedUser.firstName).to.equal(updateData.firstName);
            expect(updatedUser.picturePath).to.equal(updateData.picturePath);
            
        });
        

        it('should return 404 if user is not found', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
        
            const res = await chai
                .request(app)
                .put(`/users/${nonExistentId}`)
                .send({ firstName: 'Test' });
        
            expect(res).to.have.status(404);
            expect(res.body.error).to.equal('User not found');
        });

        it('should return 500 status on database error', async () => {
            const existingUser = await User.create({ /* ...test user data...  });
       
            // Force an error in the User.findById call
            sandbox.stub(User, 'findById').throws(new Error('Database Error'));
       
            const res = await chai
                .request(app)
                .put(`/users/${existingUser._id}`)
                .send({ firstName: 'Test' });
       
            expect(res).to.have.status(500);
            expect(res.body.error).to.equal('Server Error');
       });
       
    });
    */



    /*
        describe('addRemoveFriend', () => {
            let sandbox;
    
            beforeEach(() => {
                // Create a sandbox for stubs
                sandbox = sinon.createSandbox();
            });
    
            afterEach(() => {
                // Restore the sandbox to clean up stubs
                sandbox.restore();
            });
    
    
            it('should add or remove a friend for the user with the provided ID', async () => {
                // Mock request and response objects
                const req = {
                    params: { id: 'mockUserId', friendId: 'friendId' } // Assuming valid IDs
                };
                const res = {
                    status: function (code) {
                        return this; // For chaining
                    },
                    json: function (data) {
                        this.data = data;
                        return this; // For chaining
                    }
                };
    
                // Stub User.findById to return mock user and friend objects
                sinon.stub(User, 'findById')
                    .withArgs('mockUserId').resolves({ friends: [] })
                    .withArgs('friendId').resolves({ friends: [] });
    
                // Stub User.save to do nothing
                sinon.stub(User.prototype, 'save').resolves();
    
                // Call the controller function
                await addRemoveFriend(req, res);
    
                // Assert the response or any expected behavior
                // Add assertions as needed
    
                // Restore stub after test
                sinon.restore();
            });
        });
        */
});
