const express = require('express')
const multer = require('multer')
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const fs = require('fs')
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const authenticateToken = require('./midAuth')

const app = express()
const SECRET = 'supersecretkey'
const upload = multer({ dest: 'uploads/' })
const s3 = new AWS.S3({ region: 'ap-southeast-2' })
const BUCKET_NAME = 'n11634448-vt-output'

const COGNITO_POOL_ID = 'ap-southeast-2_YuZttYiPL'
const COGNITO_CLIENT_ID = '7j53veksj398m8eoblb9g6ce3f'
const cognitoISP = new AWS.CognitoIdentityServiceProvider({ region: 'ap-southeast-2' })

app.use(express.json())
app.use(bodyParser.json())
app.use('/outputs', express.static('/app/outputs'))
app.use(express.static(path.join(__dirname, '..')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'))
})

app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  try {
    const params = {
      ClientId: COGNITO_CLIENT_ID,
      Username: username,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email }
      ]
    }

    await cognitoISP.signUp(params).promise()
    res.json({ message: 'Registration initiated. Check your email for confirmation code.' })
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message })
  }
})

app.post('/api/confirm', async (req, res) => {
  const { username, code } = req.body

  try {
    await cognitoISP.confirmSignUp({
      ClientId: COGNITO_CLIENT_ID,
      Username: username,
      ConfirmationCode: code
    }).promise()

    res.json({ message: 'Email confirmed. You can now log in.' })
  } catch (err) {
    res.status(400).json({ error: 'Confirmation failed', details: err.message })
  }
})

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body

  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password
    }
  }

  try {
    const result = await cognitoISP.initiateAuth(params).promise()
    const idToken = result.AuthenticationResult.IdToken

    res.json({ token: idToken })
  } catch (err) {
    res.status(401).json({ error: 'Login failed', details: err.message })
  }
})

app.get('/api/generate-upload-url', async (req, res) => {
  const fileName = `uploads/${uuidv4()}.webm`

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Expires: 60,
    ContentType: 'video/webm'
  }

  try {
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params)
    res.json({ uploadUrl, key: fileName })
  } catch (err) {
    res.status(500).json({ error: 'Could not generate upload URL', details: err.message })
  }
})

app.post('/api/transcode', authenticateToken, upload.single('video'), async (req, res) => {
  const inputPath = req.file.path
  const bitrate = req.body.bitrate || '192k'
  const format = req.body.format || 'mp3'

  const ext = format === 'mp4' ? '.mp4' : '.mp3'
  const outputFilename = `output-${Date.now()}${ext}`
  const outputPath = path.join('outputs', outputFilename)
  const s3Key = `outputs/${outputFilename}`

  fs.mkdirSync('outputs', { recursive: true })

  let command = ffmpeg(inputPath)

  if (format === 'mp3') {
    command = command.format('mp3').audioBitrate(bitrate).noVideo()
  } else if (format === 'mp4') {
    command = command.format('mp4').videoCodec('libx264').audioCodec('aac').outputOptions('-preset veryfast')
  } else {
    return res.status(400).json({ error: 'Unsupported format' })
  }

  command
    .on('end', async () => {
      try {
        const fileContent = fs.readFileSync(outputPath)

        await s3.upload({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          Body: fileContent,
          ContentType: format === 'mp4' ? 'video/mp4' : 'audio/mpeg'
        }).promise()

        const originalName = path.parse(req.file.originalname).name

        const downloadUrl = await s3.getSignedUrlPromise('getObject', {
          Bucket: BUCKET_NAME,
          Key: s3Key,
          Expires: 3600,
          ResponseContentDisposition: `attachment; filename="${originalName}${ext}"`
        })

        fs.unlinkSync(inputPath)
        fs.unlinkSync(outputPath)

        res.json({
          message: 'Conversion complete',
          file: outputFilename,
          download: downloadUrl,
          suggestedName: `${originalName}${ext}`
        })
      } catch (err) {
        fs.existsSync(inputPath) && fs.unlinkSync(inputPath)
        fs.existsSync(outputPath) && fs.unlinkSync(outputPath)
        res.status(500).json({ error: 'Upload to S3 failed', details: err.message })
      }
    })
    .on('error', err => {
      fs.existsSync(inputPath) && fs.unlinkSync(inputPath)
      res.status(500).json({ error: 'Transcoding failed', details: err.message })
    })
    .save(outputPath)
})

app.get('/api/downloads', authenticateToken, async (req, res) => {
  try {
    const list = await s3.listObjectsV2({
      Bucket: BUCKET_NAME,
      Prefix: 'outputs/'
    }).promise()

    const files = await Promise.all(list.Contents.map(async obj => {
      const url = await s3.getSignedUrlPromise('getObject', {
        Bucket: BUCKET_NAME,
        Key: obj.Key,
        Expires: 3600
      })

      return {
        name: obj.Key.replace('outputs/', ''),
        url
      }
    }))

    res.json({ files })
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch files', details: err.message })
  }
})

app.delete('/api/delete/:filename', authenticateToken, (req, res) => {
  const key = `outputs/${req.params.filename}`

  s3.deleteObject({
    Bucket: BUCKET_NAME,
    Key: key
  }, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete', details: err.message })
    }
    res.json({ message: 'File deleted' })
  })
})

module.exports = app
