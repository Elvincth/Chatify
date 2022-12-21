# Generate private keys

You need to generate a key pair in the root of /apps/api/, in production you should use a different key pair for each environment.

```
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```
