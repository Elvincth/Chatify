# Get started

1. First you need to install the dependencies:
   ```bash
   yarn
   ```
2. Download [Docker](https://www.docker.com/products/docker-desktop) and run it.
3. Run the following command to start the mongodb (wait for it to be ready for next step):
   ```bash
   docker-compose up -d
   ```
4. Then can run the server and frontend in the development mode:
   ```bash
   yarn dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Troubleshooting

If you encounter login error and not able to login, please try to clear the cookies and local storage.

## Generate RSA pair for JWT

You need to generate a key pair in the root of /apps/api/, in production you should use a different key pair for each environment.

```
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

## What's inside?

This turborepo uses [Yarn](https://classic.yarnpkg.com/) as a package manager. It includes the following packages/apps:

### Apps and Packages

- `api`: a [Express.js](https://expressjs.com/) app
- `web`: a [Next.js](https://nextjs.org/) app
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).
