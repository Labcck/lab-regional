# LAB Regional — CCK

Dinámica interactiva para el taller regional del LAB. Las participantes
entran desde su celular con un código de acceso, responden 3 preguntas
rápidas sobre su reto y la plataforma genera una idea de oportunidad que se
va comparando en vivo contra las respuestas de los demás países. Un tablero
para pantalla grande (`/tablero`) muestra el mapa de oportunidades regionales
mientras avanza la sesión.

Flujo: `Código + país` → `¿Dónde tenés el mayor reto?` → `¿Qué te cuesta más?`
→ `¿Qué debería hacer la IA?` → idea generada → coincidencias regionales.

## Correr en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) para el flujo de
participante y [http://localhost:3000/tablero](http://localhost:3000/tablero)
para el tablero en vivo (pantalla del facilitador / proyector).

## Configuración

Variables de entorno (`.env.local` en local, o en Vercel → Settings →
Environment Variables):

| Variable | Para qué sirve | Obligatoria |
|---|---|---|
| `NEXT_PUBLIC_ROOM_CODE` | Código de acceso que las participantes escriben para entrar. Por defecto `LABREGIONAL`. Cambialo por sesión. | No |
| `FACILITATOR_PIN` | PIN para poder reiniciar la sesión desde `/tablero`. Si no se define, cualquiera puede reiniciar. | No |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` (o `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`) | Base de datos Redis donde se guardan las respuestas de todos los dispositivos en tiempo real. **Necesaria para usarlo en vivo con varias personas.** | Sí, en producción |

### ⚠️ Importante: base de datos compartida

Sin una base de datos Redis conectada, las respuestas solo se guardan en la
memoria de una función de Vercel — con varios teléfonos conectados a la vez
el tablero puede verse incompleto o inconsistente, porque Vercel ejecuta
varias instancias de la función en paralelo.

Antes del taller real, conectá una base Redis gratuita:

1. En el proyecto en Vercel: **Storage → Marketplace Database Providers →
   Redis** (Upstash) → crear una base gratuita y conectarla al proyecto.
   Esto agrega automáticamente las variables `KV_REST_API_URL` y
   `KV_REST_API_TOKEN` (o el nombre equivalente que use la integración).
2. Volvé a desplegar (redeploy) el proyecto para que tome las nuevas
   variables.

En desarrollo local (`npm run dev`) no hace falta nada de esto: si no
detecta las variables, la app guarda las respuestas en memoria (alcanza para
probar el flujo en tu computadora).

## Desplegar en Vercel

1. Subí este proyecto a un repositorio de GitHub.
2. En [vercel.com/new](https://vercel.com/new), importá el repositorio.
3. Antes del primer deploy (o después, desde Settings → Environment
   Variables), configurá `NEXT_PUBLIC_ROOM_CODE` con el código que vas a
   compartir en el taller.
4. Conectá la base Redis como se explica arriba.
5. Deploy. La URL que te da Vercel es la que compartís (podés generar un QR
   apuntando a esa URL para que la gente entre más rápido desde el celular).

## Reiniciar una sesión

Desde `/tablero` hay un botón "Reiniciar sesión" que borra todas las
respuestas del código de sesión actual, por si querés correr la dinámica más
de una vez (por ejemplo, un ensayo antes del taller real).
