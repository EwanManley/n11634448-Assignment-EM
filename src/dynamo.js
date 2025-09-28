const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb')

const REGION = 'ap-southeast-2'
const TABLE_NAME = 'a2_n11634448_db'
const QUT_USERNAME = 'n11634448@qut.edu.au'

const client = new DynamoDBClient({ region: REGION })
const ddb = DynamoDBDocumentClient.from(client)

async function saveMeta(userId, videoId, data) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      pk: `user#${userId}`,
      sk: `video#${videoId}`,
      'qut-username': QUT_USERNAME,
      ...data
    }
  }
  await ddb.send(new PutCommand(params))
}

async function getVideosByUser(userId) {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: {
      ':pk': `user#${userId}`
    }
  }
  const result = await ddb.send(new QueryCommand(params))
  return result.Items
}

async function getMeta(userId, videoId) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: `user#${userId}`,
      sk: `video#${videoId}`
    }
  }
  const result = await ddb.send(new GetCommand(params))
  return result.Item
}

async function saveUser(email, role) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      pk: `user#${email}`,
      sk: 'profile',
      'qut-username': QUT_USERNAME,
      role: role
    }
  }
  await ddb.send(new PutCommand(params))
}

module.exports = { saveMeta, getMeta, getVideosByUser, saveUser }
