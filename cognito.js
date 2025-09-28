const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand
} = require('@aws-sdk/client-cognito-identity-provider');

const REGION = 'ap-southeast-2';
const USER_POOL_ID = 'ap-southeast-2_YuZttYiPL';
const CLIENT_ID = '7j53veksj398m8eoblb9g6ce3f';

const client = new CognitoIdentityProviderClient({ region: REGION });

async function registerUser(email, password) {
  const command = new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      {
        Name: 'email',
        Value: email
      }
    ]
  });

  try {
    const response = await client.send(command);
    return response;
  } catch (err) {
    throw err;
  }
}

async function confirmUser(email, code) {
  const command = new ConfirmSignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code
  });

  try {
    const response = await client.send(command);
    return response;
  } catch (err) {
    throw err;
  }
}

async function loginUser(email, password) {
  const command = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password
    }
  });

  try {
    const response = await client.send(command);
    return response.AuthenticationResult;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  registerUser,
  confirmUser,
  loginUser
};
