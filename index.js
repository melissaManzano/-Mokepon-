const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// ✅ Servir archivos estáticos desde el directorio raíz
app.use(express.static(__dirname))

const jugadores = []

class Jugador {
  constructor(id) {
    this.id = id
    this.mokepon = null
  }

  asignarMokepon(mokepon) {
    this.mokepon = mokepon
  }

  obtenerMokepon() {
    return this.mokepon
  }
}

app.get('/unirse', (req, res) => {
  const id = Math.random().toString(36).substring(2, 9)
  const jugador = new Jugador(id)
  jugadores.push(jugador)
  res.setHeader("Access-Control-Allow-Origin", '*')
  res.send(id)
})

app.post("/mokepon/:jugadorId", (req, res) => {
  const jugadorId = req.params.jugadorId
  const nombreMokepon = req.body.mokepon

  const jugador = jugadores.find(j => j.id === jugadorId)
  if (jugador) {
    jugador.asignarMokepon({
      nombre: nombreMokepon,
      imagen: `/imagenes/${nombreMokepon}.png`
    })
  }

  res.end()
})
app.listen(8080, () => {
  console.log("Servidor funcionando en http://localhost:8080")
})
