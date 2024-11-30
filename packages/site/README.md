# Qng-Amount-Recovery-Tool

This project was bootstrapped with [Gatsby](https://www.gatsbyjs.com/).

## Node Version

### `Node > 18`

# Dependence

### 1. Run Qng Node , see https://github.com/Qitmeer/qng or use public rpc service

### 2. Run Bundler service , see https://github.com/eth-infinitism/bundler . checkout tag v0.6.0

- update the config file in `packages/bundler/localconfig/bundler.config.json`
  `network` is the qng rpc server
  `entryPoint` can see https://github.com/Qitmeer/eip4337-account-abstraction/blob/v0.6-qng/contracts/address.ts
  `beneficiary` is your bundler address which can receive the left fee.
- run bundler
  `yarn && yarn preprocess`
  `yarn run bundler --unsafe`

### 3. start your nginx proxy server

```
server {
        listen 443 ssl;
        # Add index.php to the list if you are using PHP
        index index.html index.htm index.nginx-debian.html;
        ssl_certificate ssl/myserver.crt;
        ssl_certificate_key ssl/myserver.key;
        server_name 127.0.0.1;
        root /opt/qng-snap/packages/site/public;
        location /qng {
                proxy_pass http://127.0.0.1:1234/; # qng server rpc
        }
        location /bundler {
                proxy_pass http://127.0.0.1:3000/rpc; # bundler server rpc
        }
}

```

## Available Scripts

In the project directory, you can run:

### `cd packages/site`

### `npm install buffer`

### `yarn install`

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:8000](http://localhost:8000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `public` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/) for more information.

## Environment variables

Gatsby has built-in support for loading environment variables into the browser and Functions. Loading environment variables into Node.js requires a small code snippet.

In development, Gatsby will load environment variables from a file named `.env.development`. For builds, it will load from `.env.production`.

By default you can use the `SNAP_ORIGIN` variable (used in `src/config/snap.ts`) to define a production origin for you snap (eg. `npm:MyPackageName`). If not defined it will defaults to `local:http://localhost:8080`.

By default you can use the `PROXY_SERVER` variable (used in `src/utils/config.ts`) to define a production origin for you nginx proxy server. If not defined it will defaults to `https://127.0.0.1`. the nginx proxy server need https

A `.env` file template is available, to use it rename `.env.production.dist` to `.env.production`

To learn more visit [Gatsby documentation](https://www.gatsbyjs.com/docs/how-to/local-development/environment-variables/)

## Learn More

You can learn more in the [Gatsby documentation](https://www.gatsbyjs.com/docs/).

To learn React, check out the [React documentation](https://reactjs.org/).
