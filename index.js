const express = require('express')
const app = express()
require('dotenv').config()

const Person = require('./models/person')

let persons = [
]

app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const cors = require('cors')

app.use(cors())

app.use(express.json())
app.use(requestLogger)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/info', (req, res) => {
  const date = new Date()
  res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`)
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  }).catch(error => {
    res.status(500).send({ error: 'malfunctioning server' })
  })
})

app.delete('/api/persons/:id', (req, res) => {
  const id = req.params.id
  persons = persons.filter(person => person.id !== id)
  res.status(204).end()
})

app.post('/api/persons', (req, res) => {
  const body = req.body
  if (body.name === undefined) {
    return res.status(400).json({ error: 'content missing' })
  } else {
    if (!body.name) {
      return res.status(400).json({ error: 'name missing' })
    }
    if (!body.number) {
      return res.status(400).json({ error: 'number missing' })
    }
    const person = new Person({
      name: body.name,
      number: body.number
    })
    person.save().then(savedPerson => {
      res.json(savedPerson)
    })
  }
})

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
