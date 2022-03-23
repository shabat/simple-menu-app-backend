import cors from 'cors'
import express from 'express'

import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

app.use(express.json());
app.use(cors());
app.listen(3000, async () => {
    console.log('listening on 3000')
    await db.read()
})

app.get('/restaurants', async (req, res) => {
    res.send(db.data)
})

app.get('/restaurants/:id', async (req, res) => {
    const restaurantExists = Object.keys(db.data).find(item => db.data[item].id === Number(req.params.id))
    if (!restaurantExists) {
        res.status(404)
        return res.send('Not found')
    } else {
        const restaurant = db.data[restaurantExists];
        restaurant.name = restaurantExists;
        res.send(restaurant)
    }
})

app.post('/restaurants', async (req, res) => {
    try {
        const newItemId = Math.max(...Object.keys(db.data).map(restaurantName => db.data[restaurantName].id)) + 1
        db.data[req.body.name] = {
            id: newItemId
        }
        await db.write()
        res.status(201)
        res.send({
            id: newItemId
        })
    } catch (err) {
        res.status(500)
        res.send(err);
    }
})

app.put('/restaurants/:id', async (req, res) => {
    try {
        const restaurantExists = Object.keys(db.data).find(item => db.data[item].id === Number(req.params.id))
        if (!restaurantExists) {
            res.status(404)
            return res.send('Not found')
        }
        db.data[restaurantExists].menu = req.body;

        await db.write()
        res.status(200)
        res.send({
            id: req.params.id
        })
    } catch (err) {
        res.status(500)
        res.send(err);
    }
})

app.delete('/restaurants/:id', async (req, res) => {
    try {
        const restaurantExists = Object.keys(db.data).find(item => db.data[item].id === Number(req.params.id))
        if (!restaurantExists) {
            res.status(404)
            return res.send('Not found')
        }
        delete db.data[restaurantExists];
        await db.write()
        res.send(204)
    } catch (err) {
        res.status(500)
        res.send(err);
    }
})