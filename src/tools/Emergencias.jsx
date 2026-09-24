const PRINCIPALES = [
  { n: '131', name: 'Ambulancia (SAMU)', color: 'red' },
  { n: '132', name: 'Bomberos', color: 'orange' },
  { n: '133', name: 'Carabineros', color: 'green' },
  { n: '134', name: 'PDI', color: 'blue' },
]

const OTROS = [
  { n: '137', name: 'Emergencias marítimas (Armada)' },
  { n: '138', name: 'Rescate aéreo (FACh)' },
  { n: '130', name: 'Incendios forestales (CONAF)' },
  { n: '1455', name: 'Violencia contra la mujer (orientación)' },
  { n: '149', name: 'Fono Familia (Carabineros)' },
  { n: '147', name: 'Fono Niños (Carabineros)' },
  { n: '*4141', name: 'Línea de prevención del suicidio (MINSAL)' },
  { n: '600 360 7777', name: 'Salud Responde (MINSAL, 24 horas)' },
  { n: '1412', name: 'SENDA: orientación en drogas y alcohol' },
]

const tel = (n) => `tel:${n.replace(/\s/g, '')}`

export default function Emergencias() {
  return (
    <>
      <div className="emergency-grid">
        {PRINCIPALES.map((e) => (
          <a key={e.n} href={tel(e.n)} className={`emergency ${e.color}`}>
            <strong>{e.n}</strong>
            <span>{e.name}</span>
          </a>
        ))}
      </div>
      <section className="card">
        <h2>Otros números útiles</h2>
        <ul className="phone-list">
          {OTROS.map((e) => (
            <li key={e.name}>
              <span>{e.name}</span>
              <a href={tel(e.n)}>{e.n}</a>
            </li>
          ))}
        </ul>
      </section>
      <p className="muted small">Desde un celular, toca un número para llamar. Las llamadas a números de emergencia son gratuitas.</p>
    </>
  )
}
