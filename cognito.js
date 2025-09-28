const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand
} = require('@aws-sdk/client-cognito-identity-provider')
const crypto = require('crypto')
const { saveUser } = require('./dynamo')

const REGION = 'ap-southeast-2'
const USER_POOL_ID = 'ap-southeast-2_YuZttYiPL'
const CLIENT_ID = '7j53veksj398m8eoblb9g6ce3f'
const CLIENT_SECRET = '1ahu5q0qb2jf0iipmcnp7dspvrai22sb78fde3gtrfreg1ddg141'

const client = new CognitoIdentityProviderClient({ region: REGION })

function getSecretHash(username) {
  return crypto
    .createHmac('sha256', CLIENT_SECRET)
    .update(username + CLIENT_ID)
    .digest('base64')
}

async function registerUser(email, password) {
  const command = new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    SecretHash: getSecretHash(email),
    UserAttributes: [
      {
        Name: 'email',
        Value: email
      }
    ]
  })
  const response = await client.send(command)
  await saveUser(email, 'user')
  return response
}

async function confirmUser(email, code) {
  const command = new ConfirmSignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    SecretHash: getSecretHash(email)
  })
  const response = await client.send(command)
  return response
}

async function loginUser(email, password) {
  const command = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: getSecretHash(email)
    }
  })
  const response = await client.send(command)
  return response.AuthenticationResult
}

module.exports = {
  registerUser,
  confirmUser,
  loginUser
}
