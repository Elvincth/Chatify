import bcrypt from "bcrypt";

//Used globally to hash passwords
export const hashPassword = async (password: string) => {
  //Where we do 10 rounds of salting and hash the password using bcrypt
  const SALT_ROUNDS = 10;
  //We will use bcrypt to hash the password
  //We will use 10 rounds of salting
  //bcrypt will concatenate the salt and the password and hash it so we do not need to store the salt
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  receivedPassword: string
) => {
  //We compare the password in mongoDB with receivedPassword
  return await bcrypt.compare(password, receivedPassword);
};
