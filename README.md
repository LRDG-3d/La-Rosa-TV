# La Rosa TV

Página de descargas con barra superior, menú lateral y selector de 9 temporadas. React + Vite.

## Desarrollo local

```bash
npm install
npm run dev
```

## Deploy a GitHub Pages

### Opción A: automático con GitHub Actions (recomendado)

1. Sube este proyecto a un repo de GitHub (`LRDG-Descargar`).
2. En **Settings → Pages**, en "Build and deployment" selecciona **GitHub Actions** como fuente.
3. Cada `push` a `main` va a construir y publicar el sitio solo (el workflow ya está en `.github/workflows/deploy.yml`).
4. El proyecto ya está configurado con `base: '/LRDG-Descargar/'` en `vite.config.js`, así que si no cambias el nombre del repo no necesitas tocar nada más.

### Opción B: manual con gh-pages

```bash
npm install
npm run build
npm run deploy
```

Esto publica la carpeta `dist` en la rama `gh-pages`. Luego en **Settings → Pages** selecciona la rama `gh-pages` como fuente.

## Configurar Firebase (login de admin + base de datos)

1. Ve a [console.firebase.google.com](https://console.firebase.google.com) y crea un proyecto nuevo.
2. **Authentication** → pestaña "Sign-in method" → activa **Correo electrónico/contraseña**.
3. **Authentication** → pestaña "Users" → **Add user** → crea tu usuario admin (tu correo y contraseña).
4. **Realtime Database** → **Create database** → elige una ubicación → inicia en modo bloqueado.
5. En **Rules** de Realtime Database, pega esto para que solo tú puedas escribir, y cualquiera pueda ver los episodios:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": "auth != null"
     }
   }
   ```
6. Ve a **Configuración del proyecto** (ícono de engranaje) → en "Tus apps" añade una app **Web** → copia el objeto `firebaseConfig` que te muestra.
7. Con esos valores, crea un archivo `.env` en la raíz del proyecto (copia `.env.example` y complétalo):
   ```
   VITE_FIREBASE_API_KEY=xxxx
   VITE_FIREBASE_AUTH_DOMAIN=xxxx.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://xxxx-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=xxxx
   VITE_FIREBASE_STORAGE_BUCKET=xxxx.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=xxxx
   VITE_FIREBASE_APP_ID=xxxx
   ```
   Este archivo NO se sube a GitHub (ya está en `.gitignore`), solo es para probar en local con `npm run dev`.
8. Para que el deploy en GitHub Actions también tenga estas variables, ve a tu repo en GitHub → **Settings → Secrets and variables → Actions → New repository secret**, y crea un secret por cada línea del `.env` (mismo nombre, ej. `VITE_FIREBASE_API_KEY`). El workflow ya está listo para leerlos.
9. Entra a `tu-usuario.github.io/LRDG-Descargar/#/admin`, inicia sesión con el usuario que creaste en el paso 3, y ya puedes añadir/eliminar categorías, temporadas y episodios.

> Nota: la URL de admin usa `#/admin` porque el sitio usa `HashRouter` — es lo que evita errores 404 en GitHub Pages al recargar la página en una ruta que no es la raíz.



```
la-rosa-tv/
├── .github/workflows/deploy.yml   # Deploy automático a GitHub Pages
├── src/
│   ├── components/
│   │   ├── TopBar.jsx
│   │   ├── SideMenu.jsx
│   │   ├── SeasonsGrid.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/AuthContext.jsx    # Login/logout con Firebase Auth
│   ├── data/db.js                 # CRUD de categorías, temporadas, episodios
│   ├── pages/
│   │   ├── Home.jsx               # Página pública
│   │   ├── AdminLogin.jsx         # /admin sin sesión
│   │   └── AdminDashboard.jsx     # /admin con sesión
│   ├── firebase.js
│   ├── App.jsx                    # Rutas (/ y /admin)
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .env.example
├── index.html
├── vite.config.js
└── package.json
```

## Próximos pasos

- El panel `/admin` ya permite añadir/eliminar categorías, temporadas y episodios en vivo.
- Puedes agregar más campos a los episodios (miniatura, descripción, orden) editando `src/data/db.js` y `AdminDashboard.jsx`.
