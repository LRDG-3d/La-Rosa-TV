# 🌹 Capítulos de la Rosa

React + Vite + Firebase. Sitio de streaming con panel de admin en `/#/admin`.

## Configurar Firebase

1. Crea un proyecto en https://console.firebase.google.com
2. Activa **Authentication → Email/Password** y crea ahí mismo tu(s) usuario(s) admin.
3. Activa **Realtime Database**, modo producción, y pon estas reglas (lectura pública, escritura solo autenticados):

```json
{
  "rules": {
    "episodes": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

4. Copia `.env.example` a `.env` y llena los valores de tu proyecto (Configuración del proyecto → Tus apps → SDK config).
5. Si despliegas con GitHub Actions, agrega esos mismos valores como **Secrets** del repositorio (Settings → Secrets and variables → Actions) con los mismos nombres `VITE_FIREBASE_*`.

## Desarrollo local

```bash
npm install
npm run dev
```

## Build y deploy manual

```bash
npm run build
npm run deploy
```

El workflow en `.github/workflows/deploy.yml` también despliega automáticamente a GitHub Pages en cada push a `main` (requiere tener Pages configurado con "GitHub Actions" como fuente, en Settings → Pages).

## Panel de admin

Entra a `tusitio.github.io/la-rosa/#/admin`, inicia sesión con el correo/contraseña que creaste en Firebase Authentication, y desde ahí puedes subir, editar y eliminar capítulos. Todo se guarda en Realtime Database, así que se refleja al instante en la página principal.
