# DEV Tinder API's

## Auth API's

- POST /signup
- POST /login
- POST /logout

## Profile APIS's

- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

## Connection Request

- POST /request/send/intrested/:userId
- POST /request/send/ignored/:userId
- POST /request/review/accepted/:userId
- POST /request/review/rejected/:userId

## User Routers

- GET /user/connections/received
- GET /user/requests
- GET /user/feed
