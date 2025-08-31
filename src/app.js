const express = require('express')
const multer = require('multer')
const ffmpeg = require('fluent-ffmpeg')
const path = require('path')
const fs = require('fs')
const authenticateToken = require('./midAuth')
const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const { verifyLogin, registerUser } = require('./userm')

const app = express()
const SECRET = 'supersecretkey'
const upload = multer({ dest: 'uploads/' })
const s3 = new AWS.S3({ region: 'ap-southeast-2' })
const BUCKET_NAME = 'n11634448-vt-output'

app.use(express.json())
app.use(bodyParser.json())
app.use('/outputs', express.static('/app/outputs'))
app.use(express.static(path.join(__dirname, '..')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'))
})

app.post('/api/register', (req, res) => {
    const { username, password, role } = req.body
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'All fields are required' })
    }

    const success = registerUser(username, password, role)
    if (!success) {
        return res.status(500).json({ error: 'Registration failed' })
    }

    res.json({ message: 'Registration successful' })
})

app.post('/api/login', (req, res) => {
    const { username, password } = req.body
    const user = verifyLogin(username, password)

    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' })
    }

    const payload = {
        id: user.id,
        username: user.username,
        role: user.role
    }

    const token = jwt.sign(payload, SECRET, { expiresIn: '1h' })
    res.json({ token })
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
        console.error('Signed URL Error:', err)
        res.status(500).json({ error: 'Could not generate upload URL', details: err.message })
    }
})

app.post('/api/transcode', authenticateToken, upload.single('video'), async (req, res) => {
    const inputPath = req.file.path
    const bitrate = req.body.bitrate || '192k'
    const outputFilename = `output-${Date.now()}.mp3`
    const outputPath = path.join('outputs', outputFilename)
    const s3Key = `outputs/${outputFilename}`

    fs.mkdirSync('outputs', { recursive: true })

    ffmpeg(inputPath)
        .format('mp3')
        .audioBitrate(bitrate)
        .noVideo()
        .on('end', async () => {
            try {
                const fileContent = fs.readFileSync(outputPath)

                await s3.upload({
                    Bucket: BUCKET_NAME,
                    Key: s3Key,
                    Body: fileContent,
                    ContentType: 'audio/mpeg'
                }).promise()

                const downloadUrl = await s3.getSignedUrlPromise('getObject', {
                    Bucket: BUCKET_NAME,
                    Key: s3Key,
                    Expires: 3600
                })

                res.json({
                    message: 'Conversion complete',
                    file: outputFilename,
                    download: downloadUrl
                })

            } catch (err) {
                console.error('Upload or URL Error:', err)
                res.status(500).json({ error: 'Upload to S3 failed', details: err.message })
            }
        })
        .on('error', err => {
            console.error('FFmpeg Error:', err)
            res.status(500).json({ error: 'Transcoding failed', details: err.message })
        })
        .save(outputPath)
})

module.exports = app
