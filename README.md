<br>
<p align="center">
<img src="https://user-images.githubusercontent.com/6602723/208947973-a344908c-bdf0-461e-9bfd-c185509baa1c.png" alt="Chatify"  width="250"/>
</p>

<h3 align="center">
<b>💬 An OpenPGP and Socket.io based end-to-end real time messaging application  🔒</b>
</h3>

<h3 align="center">
⚠️ Warning: This project is for educational purposes only. It is not intended to be used in production. ⚠️ 
</h4>

# Features

- 🔒 End-to-end encryption using OpenPGP
- 🔌 Real-time communication using Socket.io
- 📦 Conversations persisted in MongoDB
- 🌙 Dark mode support
- 🥰 Emoji support in messages
- 📱 Fully responsive

![banner](https://user-images.githubusercontent.com/6602723/208961516-c59f32e9-b05d-42d8-8f8b-ca67eddda9a4.png)

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
4. You need to generate a key pair in the root of /apps/api/ folder. You can use the following command to generate a key pair:
   ```
   cd apps/api
   openssl genrsa -out private.pem 2048
   openssl rsa -in private.pem -pubout -out public.pem
   ```
5. Then you can run the server and frontend in the development mode:
   ```bash
   yarn dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Troubleshooting

If you encounter login error and not able to login, please try to clear the cookies and local storage.

## What's inside?

This turborepo uses [Yarn](https://classic.yarnpkg.com/) as a package manager. It includes the following packages/apps:

### Apps and Packages

- `api`: a [Express.js](https://expressjs.com/) app it is the backend of the application
- `web`: a [Next.js](https://nextjs.org/) app it is the frontend of the application
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo
- `interfaces`: shared interfaces used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

# Implementation

## Authentication system

### Registration

The user could first go to the register page “/register”, where they are required to fill in information including username, name, email and password. For the password in the user interface we added a strength meter, which will show the strength of the password, to make sure that the password is strong enough, to avoid brute force attack.

Then, we will use the Bcrypt library to hash passwords, which prevents or mitigates rainbow table attacks, brute force attacks and dictionary attacks.

After the user has been registered, server will issue an JWT token, which is signed by our own private key which is generated by command "openssl genrsa -out private.pem 2048", the token will be stored in the user cookie named "access-token".

![image](https://user-images.githubusercontent.com/6602723/208950648-95f5cade-4f82-4499-88d4-8dfa86b6d4e2.png)


![Register](https://user-images.githubusercontent.com/6602723/208958144-ba410b3a-0f67-4d1e-b6d4-9db26f48870c.png)

### Login
Users can go to the login page "/login", where they need to fill in their username and password. After the user fills in the required information and clicks the login button, the information will be sent to the server. The server will first compare the password with the hashed password in the database using the Bcrypt comparison function .It will pre-salt and calculate the hash value and check if it matches the password stored in our database.

If the password is matched, the server will issue a JWT to the user where it is the and store in user cookie.

![image](https://user-images.githubusercontent.com/6602723/208951586-6aa7a6b8-0fb8-4758-a9e1-d2ae54788587.png)

![Login](https://user-images.githubusercontent.com/6602723/208957998-e331abf6-a748-4958-a2a7-bbec6b1507ac.png)

## Chat system

To implant the chat system, we used the open pgp library, which is a javascript implementation of the open pgp protocol. In addition, we used the socket.io library to enable real-time communication.

### Create a PGP key pair

Before the user can send a message, the user will have to generate a PGP key pair in the browser. Where, if we detect the user didn't have a key pair in their local storage, we will prompt the user to generate a PGP key pair or to import a PGP key pair.

If the user wants to generate a new PGP key pair, the user must enter a passphrase for encrypting the private key, since the private key will be stored in the browser's local storage and adding the passphrase mitigates the risk of the private key being stolen through attacks such as XSS.

Then the user can click the "Create Key Pair" button, which will generate a armored format of PGP key pair in the browser using the open PGP library, were the key type is RSA, the key size is 4096, and the user id will be using the username and email of the user, also the private key will be encrypted with the passphrase the user has entered.

Then, the generated public key will be sent to the server via a POST request in route “/keys/public-key” with the public key as payload (Fig 17), along with the authorization token - JWT to verify the user identity and associate the public key with that user (decode user id from the JWT), where the server will store the public key in the database. Meanwhile, the generated key pair will be stored in the browser's local storage, and the stored key name will be "crypto-<user_id>" to support account switching.

![image](https://user-images.githubusercontent.com/6602723/208952999-1ba0a65f-153e-483f-9f93-30e3621bffb0.png)

![Create PGP key pair](https://user-images.githubusercontent.com/6602723/208958275-a8d0e289-c721-4671-87ae-317803a08720.png)

![Create passphrase](https://user-images.githubusercontent.com/6602723/208958285-55333288-24e3-4b7c-9b30-c9d343df9230.png)

![Complete](https://user-images.githubusercontent.com/6602723/208958296-9f394524-2da3-40a0-992c-22213d38e839.png)

### Export and import a PGP key pair

Due to browser limitations, there is no persistent storage and key pairs are lost if the local storage is cleared or the browser is deleted. Therefore, to solve this problem, we provide a feature to export key pairs so that users can save the keys themselves and import them when they need to use them. Here, we will compress the key pair into .asc format and users can download the file and save it by themselves.

![image 40](https://user-images.githubusercontent.com/6602723/208958943-7d70933d-8108-4a55-9b8b-7772b9712ab6.png)

![image 39](https://user-images.githubusercontent.com/6602723/208958953-caff5f3b-6c51-4947-979e-1039ac02f92f.png)

### Send and receive message using PGP protocol

To secure the communication between the client and the server, we have made use of the open PGP library, which is a javascript implementation of the open PGP protocol, which will be explained in detail below.

![image](https://user-images.githubusercontent.com/6602723/208954236-55ec29d5-719f-47c8-bd0d-3f4ebb1b0346.png)

![image 38](https://user-images.githubusercontent.com/6602723/208959096-e643e137-025a-498c-924b-8b499263fe81.png)

![image 36](https://user-images.githubusercontent.com/6602723/208959121-9d87934f-ad64-432d-9fa5-9a121e8d183b.png)

![image 37](https://user-images.githubusercontent.com/6602723/208959107-6578c897-c4c0-40cd-baa8-10540cc6e137.png)

![image 41](https://user-images.githubusercontent.com/6602723/208959501-9052be2c-b3e5-44b0-92d3-b52ae659ea7d.png)

![image 42](https://user-images.githubusercontent.com/6602723/208959511-210d793b-cae0-4f71-8687-2f238925e379.png)

