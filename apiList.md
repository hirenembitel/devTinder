#authRouter

POST signup
POST login
POST logout

#profileRouter
GET /profile/view
PATCH /profile/edit
PATCH /profile/password

#connectionRequestRouter
POST /request/send/interested/:userId
POST /request/send/ignored/:userId
POST /request/review/accepeted/:requestId
POST /request/review/rejected/:requestId

#userRouter
GET /user/connections
GET /user/request/recieved
GET feed - Get list of connection that matches with your interested. list of users.