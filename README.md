# CoffeTec ☕🛡️

¡Bienvenido a **CoffeTec**! Una plataforma web descentralizada (dApp) diseñada para la gestión, pedido y compra de desayunos y alimentos de cafetería universitaria, integrada directamente con tecnología Blockchain para garantizar transacciones transparentes y seguras.

Como se observa en la interfaz de la aplicación, los usuarios pueden explorar un menú interactivo y realizar el pago de sus alimentos favoritos utilizando **XLM** a través de la red **Stellar**.

---

## 🚀 Características Principales

* **Pagos con Cripto:** Integración nativa con la red Stellar para realizar transacciones rápidas, eficientes y de bajo costo utilizando XLM.
* **Conexión de Billeteras (Web3):** Botón dedicado para conectar billeteras compatibles con el ecosistema Stellar (como Freighter), facilitando la interacción Web3.
* **Smart Contracts (Soroban):** Incorporación de contratos inteligentes mediante el ecosistema **Soroban** desarrollados en Rust para el control automatizado del estado y contador de compras.
* **Seguridad Avanzada & Biometría:** Panel de administración y acceso protegido mediante credenciales biométricas locales (WebAuthn / Claves de acceso / Passkeys) para garantizar que solo el personal autorizado gestione el menú.
* **Menú Interactivo:** Visualización clara y amigable de productos con imágenes, descripciones detalladas y conversión de precios adaptados al usuario.

---

## 🛠️ Stack Tecnológico

El repositorio está estructurado con las siguientes tecnologías:

* **Frontend:** HTML5, CSS3 estructurado y JavaScript moderno (Vanilla JS para una interacción Web3 nativa y veloz).
* **Backend:** Node.js para la lógica del servidor, API interna y serving de archivos estáticos.
* **Blockchain & Web3:** * **Stellar Network:** Procesamiento de pagos y transferencias de activos en la red de pruebas (Testnet).
    * **Soroban SDK:** Contratos inteligentes basados en WASM (Contrato Contador y lógica de tracking de pedidos).
* **Autenticación:** WebAuthn API para el inicio de sesión biométrico seguro sin contraseñas tradicionales.
* **Despliegue:** Configurado y alojado en la plataforma **Render**.

---

## 📐 Arquitectura del Sistema

El siguiente flujo describe cómo interactúan los componentes de CoffeTec:

1. **Capa de Usuario (Frontend):** El cliente selecciona los productos. Al pagar, interactúa con la extensión de la billetera Stellar para firmar la transacción.
2. **Capa Blockchain (Stellar/Soroban):** La transacción se procesa en la Testnet de Stellar. El contrato inteligente en Soroban valida la operación y actualiza el contador global de órdenes.
3. **Capa de Servidor (Backend):** Node.js actúa como puente para servir la app y procesar la autenticación WebAuthn cuando el administrador inicia sesión con su huella digital o rostro para modificar el menú.

---

## 📁 Estructura del Proyecto

De acuerdo con la arquitectura actual del repositorio:

```text
├── datos/          # Implementación de autenticación biométrica y passkeys (WebAuthn)
├── hola_mundo/     # Módulos iniciales y pruebas de concepto del Backend
├── node_modules/   # Dependencias del proyecto de Node.js
├── rascar/         # Scripts y conectores para interactuar con la wallet y red Stellar
├── src/            # Código fuente de los Contratos Inteligentes de Soroban (Rust)
├── indice.html     # Archivo de entrada principal del Frontend (UI)
├── servidor.js     # Servidor principal en Node.js (API y ruteo)
├── package.json    # Configuración de scripts y dependencias del proyecto
└── README.md       # Documentación del proyecto
