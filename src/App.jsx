import { useEffect, useState } from 'react'
import NoticiaCard from './components/NoticiaCard/NoticiaCard.jsx'

const API_URL = import.meta.env.VITE_API_URL

const App = () => {
  const [noticias, setNoticias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [termino, setTermino] = useState('')

  function buscar(evento) {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    const valor = String(datos.get('q') ?? '').trim()
    setTermino(valor)
  }

  useEffect(() => {
    const controller = new AbortController()

    async function cargarNoticias() {
      try {
        setCargando(true)
        setError(null)

        const params = new URLSearchParams({ limit: '12' })
        if (termino) {
          params.set('search', termino)
        }

        const respuesta = await fetch(`${API_URL}/articles/?${params.toString()}`, {
          signal: controller.signal,
        })

        if (!respuesta.ok) {
          throw new Error(`Error HTTP ${respuesta.status}`)
        }

        const datos = await respuesta.json()
        setNoticias(datos.results)
      } catch (err) {
        if (err.name === 'AbortError') return
        setError(err.message)
      } finally {
        if (!controller.signal.aborted) {
          setCargando(false)
        }
      }
    }

    cargarNoticias()

    return () => controller.abort()
  }, [termino])

  return (
    <>
      <header className="contenedor cabecera">
        <a href="#">Bitácora Espacial</a>
        <nav aria-label="Principal">
          <a href="#noticias">Noticias</a>
          <a href="#blogs">Blogs</a>
          <a href="#acerca">Acerca</a>
        </nav>
      </header>

      <main className="contenedor">
        <h1>Explora las noticias del espacio</h1>
        <p className="subtitulo">
          Misiones, descubrimientos y próximos destinos. Encuentra un tema y sigue explorando.
        </p>

        <form className="buscador" onSubmit={buscar}>
          <label htmlFor="busqueda">Buscar por tema</label>
          <input
            id="busqueda"
            name="q"
            type="search"
            placeholder="Ej.: Mars, Artemis, SpaceX"
          />
          <button type="submit">Buscar</button>
        </form>

        <section aria-labelledby="ultimas-noticias">
          <h2 id="ultimas-noticias">Últimas noticias</h2>

          {cargando && <p role="status">Cargando noticias...</p>}
          {error && <p role="alert">No se pudieron cargar las noticias: {error}</p>}
          {!cargando && !error && noticias.length === 0 && (
            <p role="status">No hay noticias para "{termino}".</p>
          )}

          {!cargando && !error && noticias.length > 0 && (
            <div className="grid-noticias">
              {noticias.map((noticia) => (
                <NoticiaCard
                  key={noticia.id}
                  titulo={noticia.title}
                  resumen={noticia.summary}
                  imagen={noticia.image_url}
                  fuente={noticia.news_site}
                  fecha={noticia.published_at}
                  enlace={noticia.url}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="contenedor">
        <p>Spaceflight News API</p>
      </footer>
    </>
  )
}

export default App