# 9 — Input: Hacer la app más llamativa e interesante

Las iteraciones 1–8 ya entregaron un producto funcional, pulido, offline-first y
accesible (aprobado en 8.5/10). Esta iteración NO cambia la pedagogía ni el stack
técnico: sigue siendo un juego de lectura en español, PWA sin backend, vanilla JS
sin bundler, offline-first y con los mismos criterios de accesibilidad
(objetivos táctiles ≥56px, contraste ≥4.5:1, respeto a `prefers-reduced-motion`,
`prefers-contrast` y `forced-colors`).

El objetivo de esta ronda es puramente **atractivo e interés a largo plazo para
niños de 3 a 6 años**: convertir la app de "una herramienta de práctica correcta"
en "algo a lo que el niño quiere volver". Todo lo ya aceptado en iteraciones
anteriores se conserva.

Las demandas están agrupadas por dimensión y priorizadas. Las tres primeras
(D1, D2, D3) son las de mayor impacto y son obligatorias en esta ronda.

---

## UI / Personaje — máxima prioridad

### D1 — Personalizar a Lalo (mecánica de colección)
- El niño puede **personalizar a Lalo**: como mínimo cambiar su **color de
  cuerpo** y ponerle **accesorios** (ej. sombrero, gafas, lazo, capa). Reutiliza
  el SVG inline de Lalo (`js/mascot.js`); los accesorios son capas SVG adicionales
  sobre el mismo `viewBox`.
- Debe existir una **pantalla/armario** accesible desde el mapa (un botón nuevo
  en la barra superior del mapa, junto a "Álbum de pegatinas" y "Para adultos")
  donde el niño elige entre las opciones **desbloqueadas**.
- Los accesorios y colores se **desbloquean** al progresar: completar niveles y/o
  alcanzar hitos de estrellas otorga nuevos ítems. Las opciones bloqueadas se
  muestran como silueta (igual que las pegatinas no ganadas hoy).
- La elección del niño **persiste** (vía `progress.js`, como el resto del estado)
  y el Lalo personalizado aparece en todas las pantallas donde sale Lalo
  (bienvenida, mapa, juego, resumen).
- No requiere texto: la pantalla de personalización funciona con iconos/toques,
  compatible con el "modo muy pequeño" existente.

### D2 — Lalo con más vida y reacciones
- Amplía los estados de Lalo más allá de los 4 actuales
  (idle/cheer/encourage/model). Añade al menos: **parpadeo aleatorio** en reposo,
  una reacción de **sorpresa/curiosidad** cuando aparece una palabra nueva, y una
  pose de **"dormido/esperando"** cuando el niño no interactúa durante un rato.
- Toda la animación sigue siendo **CSS-driven** (como ya está) y debe degradar a
  una pose estática expresiva con `prefers-reduced-motion` (igual que hoy).
- Lalo nunca debe robar un toque destinado a la tarjeta ni tapar la palabra,
  tiles, botones o feedback (se mantiene `aria-hidden` y `pointer-events:none` en
  el acompañante del juego).

---

## Features / funcionalidad — alta prioridad

### D3 — Variedad de mini-juegos (modos de práctica)
- Añade **al menos un modo de práctica adicional** al actual "mira la palabra y
  dila", usando el mismo vocabulario y arte que ya existe. Opciones recomendadas
  (implementar una o dos, no todas):
  - **Emparejar palabra ↔ dibujo**: se muestran varias cartas y el niño toca el
    dibujo que corresponde a la palabra (o viceversa).
  - **Elegir la palabra correcta**: se muestra un dibujo y 2–3 palabras; el niño
    toca la correcta.
  - **Completar la sílaba que falta**: la palabra aparece con una sílaba vacía
    (ej. `pa-__`) y el niño elige la sílaba correcta entre pocas opciones.
- La selección de modo debe ser sencilla y adecuada para niños, o alternarse de
  forma automática para dar variedad dentro de un nivel. El modo elegido no debe
  romper el micro-loop existente de éxito → avance → lectura.
- Debe respetar la accesibilidad actual (teclado, objetivos táctiles, lectura en
  voz alta, contraste) y no introducir callejones sin salida.

### D4 — Progreso acumulativo que crece (mundo de Lalo)
- Añade un **progreso visual acumulativo** que crezca con lo que el niño gana, de
  forma que haya motivo para volver incluso tras completar el mapa. Por ejemplo:
  un **"hogar/jardín de Lalo"** que se va llenando de elementos (árboles, estrellas,
  objetos) a medida que el niño gana estrellas/pegatinas.
- Este progreso es **persistente** y **visible para el niño** (no solo en el panel
  de adultos). Debe sentirse como que "se construye algo" con el tiempo.
- Reutiliza el catálogo de recompensas existente (`js/rewards.js`): los elementos
  del mundo se pueden anclar a hitos de estrellas o a niveles completados.

---

## UI / diseño visual — prioridad media

### D5 — Fondos y escenas temáticas por familia de palabras
- Sustituye el gradiente de fondo único por **fondos temáticos** según la familia
  de palabras del nivel (p. ej. playa, bosque, espacio). Mantén el contraste de
  texto ≥4.5:1 sobre cada fondo.
- Opcionalmente añade elementos ambientales sutiles (nubes que pasan, partículas
  flotando) que **se desactivan** con `prefers-reduced-motion`.
- Los colores por familia ya existen en el mapa y en las tarjetas; esta demanda
  extiende ese sistema de temas al fondo de la pantalla de juego.

### D6 — El mapa como un camino, no una cuadrícula
- Convierte "El mapa de Lalo" de una cuadrícula de botones en un **sendero/camino**
  por el que Lalo avanza de nivel en nivel (estilo recorrido), de modo que el
  progreso se entienda de un vistazo.
- Mantén el estado de cada nivel (bloqueado/desbloqueado/completado), los colores
  por familia, los objetivos táctiles ≥56px y la navegación por teclado actuales.

---

## Pulido — prioridad baja

### D7 — Preview de voz en el panel de adultos
- Al elegir una voz en el selector de voz del panel de adultos (`#voice-select`),
  reproduce una **palabra de muestra corta** con esa voz para que el adulto la
  oiga antes de confirmar. (Esto ya estaba contemplado como AC-K3.5 y quedó sin
  cablear.)

### D8 — Música de fondo opcional
- Añade una **melodía de fondo suave y opcional**, generada con Web Audio (como
  los efectos actuales), con un **interruptor en el panel de adultos** para
  activarla/desactivarla. Por defecto **desactivada**. No debe interferir con la
  lectura en voz alta ni con el reconocimiento de voz.

---

## Fuera de alcance (esta iteración)
- Ningún backend, cuenta de usuario, analítica ni tracking.
- Ningún cambio de framework, bundler o lenguaje: se mantiene vanilla JS sin
  build, offline-first.
- Ningún cambio a la pedagogía ni al orden de aprendizaje (palabras completas,
  sílabas solo como ayuda de decodificación).
- No se amplía el vocabulario en esta ronda (ya se amplió en la iteración 8); el
  foco es presentación, personaje, variedad de juego y motivación.
