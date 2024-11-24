# Install required dependencies

```sh
npm install
```

# Run the application

This application uses MongoDB for storing data.
Make sure to set the address for your MongoDB cluster
in the `MONGODB_ADDRESS` environment variable.
Default port is 8080.

```sh
MONGODB_ADDRESS="<insert MongoDB address here>" node main.mjs
```
