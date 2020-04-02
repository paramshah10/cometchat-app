require('dotenv/config')                    //import the dependencies that we are going to need
const express = require('express')
const uuidv4 = require('uuid/v4')
const axios = require('axios')
const cors = require('cors')

const PORT = process.env.PORT || 4000       //create a dedicated port for the server to run
const app = express()                       //initialize express app
app.use(cors())
const headers = {                           //since using multiple axios requests - to avoid repetition
    appid: process.env.COMETCHAT_APP_ID,
    apikey: process.env.COMETCHAT_API_KEY,
    'content-type': 'application/json',
    accept: 'application/json'
}
const adminUID = 'admin'
const baseUrl = 'https://api-us.cometchat.io/v2.0/users'

async function createAuthToken(uid) {
    try {
        const response = await axios.post(`${baseUrl}/${uid}/auth_tokens`, null, 
          { headers }
        )
        return response.data.data
    } catch (err) {
        console.log({ 'create-auth-token': err })
    }
}

//create endpoint for creating new users when they visit the homepage
app.get('/api/create-user', async (_, res) => {
    const randomUUID = uuidv4()
    const newUser = {
      uid: randomUUID,
      name: randomUUID
    }
    try {
      const response = await axios.post(baseUrl, JSON.stringify(newUser),       //POST request to CometChat API with new user info
        { headers }
      )
      const uid = await response.data.data.uid
      const user = await createAuthToken(uid)
      res.status(200).json({ user })
    } catch (err) {
      console.log({ 'create-user': err })
    }
})

//endpoint to return auth token for admin
app.get('/api/authenticate-user', async (req, res) => {
    const uid = await req.query.uid
    const user = await createAuthToken(uid)
    res.status(200).json({ user })
})

//endpoint to return all the users
app.get('/api/get-users', async (_, res) => {
    try {
        const response = await axios.get(baseUrl, {
            headers
        })
        const users = await response.data.data.filter(user => user.uid !== adminUID)
        res.status(200).json({ users })
    } catch (err) {
        console.log({ 'get-users': err })
    }
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})