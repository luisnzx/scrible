# 🎨 Scrible — App de pareja

Dibuja, escribe, conecta. Una app para parejas donde podéis dibujar cosas, enviar mensajes, fotos y stickers que el otro puede ver.

## 📱 Funcionalidades

- ✏️ **Canvas de dibujo** — Dibuja con diferentes colores y grosores, envía tus dibujos
- 💬 **Chat** — Mensajes de texto con tu pareja en tiempo real
- 📸 **Fotos** — Envía fotos desde tu galería
- 😍 **Stickers** — Stickers de amor y emojis prediseñados
- 🔔 **Notificaciones Push** — Recibe notificaciones con preview de imagen
- 🌙 **Diseño Dark Mode** — Diseño premium con glassmorphism y gradientes

## 🚀 Configuración

### 1. Supabase Setup

1. Ve a [supabase.com](https://supabase.com) y abre tu proyecto
2. Ve a **SQL Editor** y pega el contenido de `supabase-setup.sql`
3. Ejecuta el SQL para crear tablas, políticas y triggers
4. Ve a **Settings > API** y copia:
   - **Project URL** (ej: `https://xxxx.supabase.co`)
   - **anon public key**
5. Edita `src/lib/supabase.ts` y reemplaza:
   ```typescript
   const SUPABASE_URL = 'https://TU_PROYECTO.supabase.co';
   const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
   ```

### 2. Configuración local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Abrir en Android (con emulador o Expo Go)
npm run android
```

### 3. Vincular parejas

1. Ambos registráis vuestras cuentas en la app
2. Cada uno va a **Perfil** y copia su **ID de usuario**
3. Uno introduce el ID del otro en la sección "Tu pareja"
4. ¡Vinculados! 💕

### 4. Push Notifications (opcional)

Para notificaciones push necesitas:
1. Crear un proyecto en [expo.dev](https://expo.dev)
2. Instalar EAS CLI: `npm install -g eas-cli`
3. Login: `eas login`
4. Hacer un build de desarrollo: `eas build --profile development --platform android`
5. Configurar el Database Webhook en Supabase Dashboard

## 🏗️ Tecnologías

- **Expo** (SDK 56) — Framework React Native
- **React Native Skia** — Canvas de dibujo de alto rendimiento
- **Supabase** — Auth, Database, Realtime, Storage
- **Expo Router** — File-based routing
- **Poppins** — Tipografía Google Fonts
- **Reanimated** — Animaciones fluidas

## 📁 Estructura

```
src/
├── app/
│   ├── _layout.tsx          # Root layout
│   ├── index.tsx            # Auth redirect
│   ├── (auth)/
│   │   ├── _layout.tsx      # Auth stack
│   │   ├── login.tsx        # Login screen
│   │   └── register.tsx     # Register screen
│   └── (tabs)/
│       ├── _layout.tsx      # Tab navigator
│       ├── index.tsx        # Home dashboard
│       ├── canvas.tsx       # Drawing canvas
│       ├── chat.tsx         # Chat + stickers
│       └── profile.tsx      # Profile + pair link
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── notifications.ts    # Push notifications
├── hooks/
│   └── useSupabase.ts       # Auth, profile, messages hooks
└── constants/
    └── theme.ts             # Design system
```

## 💕 Hecho con amor
