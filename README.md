
# CoffeTec ☕🛡️

¡Bienvenido a **CoffeTec**! Una plataforma web descentralizada orientada a la gestión y compra de desayunos y alimentos de cafetería, integrada directamente con tecnología Blockchain.

Como se observa en la interfaz de la aplicación, los usuarios pueden explorar un menú interactivo y realizar el pago de sus alimentos favoritos utilizando **XLM** a través de la red **Stellar**.

---

## 🚀 Características Principales

*   **Pagos con Cripto:** Integración nativa con la red Stellar para realizar transacciones rápidas y seguras con XLM.
*   **Conexión de Billeteras:** Botón dedicado para "Conectar Wallet" que facilita la interacción Web3.
*   **Smart Contracts:** Incorporación de contratos inteligentes mediante el ecosistema **Soroban**.
*   **Panel de Administración:** Acceso protegido mediante credenciales (WebAuthn/Clave de acceso) para la gestión interna del menú.
*   **Menú Interactivo:** Visualización clara de productos con imágenes, descripciones y precios adaptados al usuario.

---

## 🛠️ Stack Tecnológico

El repositorio está estructurado con las siguientes tecnologías:

*   **Frontend:** HTML5, CSS estructurado y JavaScript (interfaz de usuario intuitiva).
*   **Backend:** Node.js (`servidor.js`, `package.json`) para la lógica del servidor y API interna.
*   **Blockchain & Web3:** 
    *   **Stellar Network:** Procesamiento de pagos en XLM.
    *   **Soroban:** Contratos inteligentes integrados (Contrato Contador y lógicas de compra).
*   **Despliegue:** Configurado y alojado en la plataforma **Render**.

---

## 📁 Estructura del Proyecto

De acuerdo con la arquitectura actual del repositorio:

```text
├── datos/          # Implementación de autenticación y llaves de acceso
├── hola_mundo/     # Primeros módulos del Backend
├── node_modules/   # Dependencias del proyecto
├── rascar/         # Conectores para compras con la billetera Stellar
├── src/            # Contratos inteligentes de Soroban (Contador, etc.)
├── indice.html     # Archivo de entrada principal del Frontend
├── servidor.js     # Servidor principal en Node.js
├── package.json    # Configuración de scripts y dependencias
└── LÉAME.md        # Documentación del proyecto

IMAGEN DE LA APLICACIÓN:

<img width="1289" height="697" alt="image" src="https://github.com/user-attachments/assets/252194f4-92eb-4834-a258-08a57a3a5176" />

