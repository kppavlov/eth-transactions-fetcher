# Project Overview
## Project folder structure
```
├───.scripts
├───src
    ├───db
    │   ├───dto
    │   ├───entities
    │   └───scripts
    ├───loaders
    ├───providers
    ├───routes
    │   └───validators
    ├───services
    └───tests
        ├───services
        └───_mocks_
```

### The .Scripts folder holds:
    A bash script that sets and prepares all the application to be tested locally.
    It fetches the lates postgres docker image and sets all required env variables for it.
    It creates a local bridge network so that the DB and our app can communicate.
    It also uses the Dockerfile in the app to create a image of our limeapi and runs it.
    So whenever you run the script you will get a fully working application and DB set up.

### The DB folder holds:
    - Data transfer object
    - Entities(class representations of a DB table with helper functions)
    - Scripts(holds the SQL scripts to initialize the tables on applicaiton load)

### The Loaders folder:
    It is a combination of all possible middlewares and main routes.
    
### The Providers folder:
    It holds in this case a single provider to be used across the whole app.
    It is the RPC provider to connect to the Sepolia test net.

### The Routes folder:
    It holds all the route handlers for the application. All the files there define
    the sub-routes of the main route("/lime" in our case). There you can also find the 
    validator functions that are used to validate the user input.

### The Services folder:
    It holds the service classes that have the business logic that must be executed per route.
    They have direct connection with the class, used to query the DB,

### The Tests folder:
    I did not put much time on it since this app is not going in production anyways so did not
    want to spend that much time on that stuff.
    It is selfexplanatory but it holds all the unit tests written to verify the logic written in
    the service classes and any utils there could be.
    It aslo has a _mocks_ folder where you can find a couple of mock classes and constants,


# How to run the application

## Locally
    You can always use `npm run start` command to run the app locally. It has a .env.local file with
    the enironment variables needed and default values. It is only used for local development!
    If you do not have a postgres db set up locally you will need to do this first as the app 
    requires a connection to the DB in order to work!

## Prepare for production
    In order to use this app in production we will need to set up CD pipeline in one of the cloud providers.
    The script in ".scripts" folder can be split in steps, the ENV variables could be set via the cloud's secrets
    manager so that they do not leak in the git repository. There are also a couple of missing steps that will be
    required, like pushing the built image to a docker repository. Then, once it is there we can fetch it and create 
    container whenever we need them. So it all depends on what we want to achieve. 
    In order to scale the limeapi we can use kubernetes cluster and define configuration which wiill scale in/out 
    the number of pods based on the demand. Kubernetes could also be user for loadbalancing between the pods.

# Endpoints

1. `/lime/authenticate` - Creates a json web token if the user exists in the DB otherwise returns an error response.
2. `/lime/eth?transactionHashes` - This one gets all provided transaction hashes, checks if they are valid and fetches them from the test net. Every next request does not do a db read but instead takes the result from the RAM. The responses are memoized in the RAM for quick access and minimization of Read operations which could cost money. If a ATUH_TOKEN header is provided a association is also saved in the DB with the userId and the transactionHash.
3. `/lime/eth/:rlphexstringparam` - It works the same as the transactionHashes but first takes the rlp hex string, validates it if it is a hex string then decodes it to get the transaction hashes array or single hash, ensures they are all valid transactionHashes and then does what the endpoint number 2 does.
4. `/lime/my` - Works only if there is a valid AUTH_TOKEN header present. It verifies it, decodes it, checks if the user exists in the DB and only then queries the DB to get the associated transactions with the userId.
5. `/lime/all` - Gets all the already fetched and stored transactions in the DB.


# Improvements

- Db migrations scripts
- Find resolution on bulk fetching transactions from the test net? At the moment I fetch them one by one...
- Add a logging service for production debug
- Adding swagger definition for better endpoint documentation
- Endpoint validators would be better to be written without any dependency
- CI/CD pipeline in the cloud and/or Jenkins
- Write endpoint test
- Add service like Redis for transactions memoization
- The service could be paid using API_KEY generation. Each key will be associated with a single user. Each key will have validity, expiration and access permissions. This could be achieved by adding additional service that will do only this. This also means that we will have to add a check for the API_KEY header in every endpoint. This can be delegated to a special service that will be written for this specific case.
- To be ready for the event of current Eth node URL failure we can define a fallback URL of another node. If first attempt to connect to the node is a failure we might try again and if the result is the same we can switch to the fallback URL.

 
    