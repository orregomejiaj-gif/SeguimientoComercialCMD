# Instrucciones para compilar el .exe instalador

## Requisitos (instalar una sola vez)
1. **Node.js** — descargar en: https://nodejs.org (versión LTS)
2. Verificar instalación: abrir CMD y escribir `node --version`

## Pasos para generar el instalador .exe

### 1. Abrir la carpeta del proyecto
- Descomprime esta carpeta en tu PC
- Abre CMD (símbolo del sistema) en esa carpeta:
  - Shift + clic derecho sobre la carpeta → "Abrir ventana de comandos aquí"

### 2. Instalar dependencias (solo la primera vez)
```
npm install
```
Esto descarga Electron (~100MB). Esperar 2-3 minutos.

### 3. Compilar el instalador Windows
```
npm run build-win
```
Esto genera la carpeta `dist/` con:
- `Seguimiento Comercial CMD Setup 1.1789.0.exe` ← instalador

### 4. Distribuir
- Copia ese `.exe` a cada PC
- Al ejecutarlo: instala la app, crea acceso directo en escritorio
- La app queda en Programas como cualquier otra aplicación

## Probar antes de compilar
Para ver la app sin compilar:
```
npm start
```

## Notas
- El .exe instalado pesa ~120MB (incluye Chromium, motor de la app)
- Funciona sin internet
- Los datos se guardan localmente en cada PC
- Para actualizar: compilar nueva versión y distribuir el nuevo .exe

## Soporte
Juan Orrego — Proceso PYV Comercial — Cooperativa Minuto de Dios
