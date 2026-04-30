
DESARROLLO

Se diseñó el contrato en soroban CLI, con rust con la siguiente estructura: 

Lógica del Contador
increment(env: Env) -> u32: Esta función accede al almacenamiento de instancia (instance storage) del contrato, obtiene el valor actual de la constante COUNTER (o 0 si no existe), le suma uno y guarda el nuevo resultado, retornando el valor actualizado.
decrement(env: Env) -> u32: Similar a la función de incremento, esta reduce el valor almacenado. Utiliza la operación saturating_sub(1) para garantizar que, si el contador es 0, no ocurra un error de bajo flujo (underflow), manteniendo el valor en 0.
get(env: Env) -> u32: Es una función de lectura simple que permite a cualquier usuario consultar el valor actual del contador almacenado en la memoria del contrato.
reset(env: Env): Función administrativa que sobrescribe el valor de COUNTER en el almacenamiento de instancia con un valor de 0, reiniciando el estado del contador.
Lógica de Tokens (Estándar básico)
mint(env: Env, to: Address, amount: u128) -> u128: Crea una nueva cantidad de tokens para una dirección específica (to). La función actualiza un mapa de saldos (BALANCES) y suma la cantidad al suministro total (TOTAL_SUPPLY) en el almacenamiento, utilizando checked_add para prevenir errores de desbordamiento (overflow).
transfer(env: Env, from: Address, to: Address, amount: u128) -> bool: Ejecuta la lógica de transferencia de tokens. Primero verifica si la cuenta de origen (from) tiene fondos suficientes. Si es así, resta el monto del emisor, lo suma al receptor, actualiza el mapa de saldos y retorna true. Si no hay fondos, retorna false.
balance(env: Env, account: Address) -> u128: Función de consulta que accede al mapa de saldos (BALANCES) almacenado para retornar la cantidad de tokens que posee una dirección específica. Si la dirección no existe en el mapa, retorna 0.
total_supply(env: Env) -> u128: Recupera el valor almacenado bajo la clave TOTAL_SUPPLY, representando la cantidad total de tokens que han sido emitidos y no quemados hasta el momento.
burn(env: Env, from: Address, amount: u128) -> bool: Reduce el saldo de un usuario específico (from) y decrementa el suministro total (TOTAL_SUPPLY) del contrato. Utiliza saturating_sub para asegurar que el suministro total nunca sea negativo.
La sección central muestra la implementación de la lógica del contrato dentro del bloque impl ContadorContract. Aquí se visualizan las primeras tres funciones: increment, decrement y get. Estas funciones utilizan el objeto env para acceder al almacenamiento de instancia (env.storage().instance()), realizando operaciones de lectura, escritura y manejo de errores (como el uso de unwrap_or(0)). El código está organizado con comentarios descriptivos y una indentación clara, lo que refleja una estructura lógica y modular diseñada para interactuar con la cadena de bloques de Stellar.


Funciones de token

En el bloque de código, se observa cómo la función accede al almacenamiento de instancia (instance storage) para recuperar el mapa de saldos (BALANCES). Un aspecto técnico relevante es el uso del patrón unwrap_or_else, que permite inicializar un nuevo mapa si es la primera vez que se interactúa con el almacenamiento, asegurando que el contrato no falle por una clave inexistente. Posteriormente, la función recupera el balance actual de la dirección destino (to) y realiza un cálculo seguro para añadir la nueva cantidad de tokens.
La seguridad del contrato es un punto destacado en esta sección, ya que se implementa la operación checked_add seguida de un expect("overflow"). Esto es una práctica recomendada en el desarrollo de smart contracts, ya que previene que las transacciones ocurran si el número resultante excede la capacidad máxima del tipo de dato u128, lo cual es vital para evitar vulnerabilidades de desbordamiento de enteros.
Finalmente, el fragmento ilustra cómo la función mantiene la consistencia global al actualizar el suministro total (TOTAL_SUPPLY). Tras ajustar el balance individual del usuario, el código replica el proceso de recuperación y suma segura para el suministro total, guardando el nuevo valor en el almacenamiento. Esta lógica dual asegura que la suma de todos los saldos individuales siempre coincida con el total_supply, un requisito indispensable para cualquier sistema de tokenización funcional.

Transferencia de tokens.

La siguiente captura de pantalla documenta tres funciones esenciales para la operatividad del token: dos funciones de consulta de solo lectura (balance y total_supply) y el inicio de la función de destrucción de activos (burn). La estructura visual sigue las convenciones de Rust para contratos de Soroban, priorizando el acceso seguro al almacenamiento de instancia y la validación de condiciones antes de ejecutar cambios en el estado del contrato.
Función balance(env: Env, account: Address) -> u128: Esta función actúa como un getter para consultar la tenencia de tokens de un usuario. Su lógica interna accede al mapa de saldos (BALANCES) almacenado en el contrato. Es notable su implementación defensiva mediante unwrap_or(0), lo cual asegura que, si una dirección no ha interactuado previamente con el contrato y por tanto no existe en el mapa, la función retorne un saldo de cero en lugar de generar un error de ejecución.
Función total_supply(env: Env) -> u128: Esta operación es una función de consulta directa y eficiente que recupera el valor global del suministro total de tokens. Al acceder únicamente a la clave TOTAL_SUPPLY en el almacenamiento de instancia, permite a cualquier usuario o interfaz externa conocer el volumen total de activos circulantes emitidos por el contrato, garantizando la transparencia del suministro.


Balance para obtener el saldo de una cuenta.



La cuarta captura de pantalla documenta la implementación de una prueba de integración integral denominada test_multiple_operations. A diferencia de las pruebas unitarias que validan funciones aisladas, este bloque de código es fundamental para el reporte, ya que simula un ciclo de vida completo de interacciones con el contrato dentro de un entorno de prueba de Soroban. Su propósito es verificar la coherencia del estado del contrato al ejecutar una secuencia encadenada de operaciones, asegurando que la lógica contable se mantenga íntegra tras múltiples cambios de estado, lo cual es vital para validar la fiabilidad del contrato en escenarios de uso real.


Test.
El flujo lógico del código comienza con la inicialización del entorno y la creación de tres identidades independientes (acc1, acc2 y acc3) utilizando el contrato ficticio DummyContract. A continuación, el test ejecuta una serie de llamadas al cliente del contrato: primero, realiza operaciones de mint para distribuir tokens y valida el total_supply resultante; posteriormente, realiza transferencias entre cuentas para probar la lógica de movimiento de saldos; y finalmente, invoca la función burn para reducir el suministro. Cada etapa está validada mediante macros assert_eq!, que comparan los valores esperados con los obtenidos, confirmando que, tras todas las operaciones, los balances individuales y el suministro total coinciden con la matemática esperada. Esta prueba actúa como un mecanismo de validación robusto, confirmando que las operaciones de almacenamiento y los cálculos aritméticos operan correctamente de manera secuencial y persistente.

Compilando el contrato.
Especificaciones del Módulo de Tokens
El contrato implementa un estándar de tokenización básico que permite la gestión completa del ciclo de vida de los activos digitales. A continuación, se detallan las operaciones disponibles y su propósito técnico:
1. Gestión de Emisión y Retiro
mint(to: Address, amount: u128) -> u128: Función administrativa orientada a la creación de nuevos activos. Incrementa el suministro total y asigna la cantidad especificada a la dirección destino, devolviendo el nuevo saldo actualizado del usuario.
burn(from: Address, amount: u128) -> bool: Mecanismo de control deflacionario. Permite destruir tokens de una cuenta específica, reduciendo el suministro total del contrato. Es una función crítica para la gestión de la oferta circulante.
2. Movilidad y Transferencia
transfer(from: Address, to: Address, amount: u128) -> bool: Facilita la circulación de activos dentro del ecosistema. Incluye una validación interna que garantiza la solvencia del emisor; si el balance es insuficiente, la transacción se cancela, garantizando la integridad de los fondos.
3. Transparencia y Consulta de Estado
balance(account: Address) -> u128: Función de lectura que permite consultar la tenencia de activos de cualquier usuario de forma pública y transparente.
total_supply() -> u128: Proporciona visibilidad sobre la cantidad total de tokens emitidos y activos en el contrato, esencial para la auditoría y el control del suministro global.




Funciones agregadas al contrato.



Suite de Pruebas y Validación (QA)
Para garantizar la fiabilidad del contrato ContadorContract, se ha implementado una suite de 10 pruebas automatizadas que cubren tanto las operaciones aritméticas del contador como la lógica transaccional de los tokens (mint, transfer, burn). El resultado de la ejecución es un 100% de éxito, lo que confirma que el contrato cumple con las especificaciones de negocio y maneja correctamente los casos de borde (como fondos insuficientes o desbordamientos).


Test ejecutados: 
Seguridad y Validaciones Lógicas
La robustez de un contrato inteligente no se mide solo por su funcionalidad, sino por su capacidad de fallar de manera segura ante entradas incorrectas. Tu implementación incluye validaciones críticas que previenen vulnerabilidades comunes:
Protección contra Desbordamiento (Overflow): Uso de checked_add para garantizar que los números nunca superen la capacidad del tipo de dato u128.
Validación de Solvencia: Verificación explícita de fondos antes de cualquier transferencia o quema de tokens (burn).
Manejo de Casos Límite: Uso de unwrap_or y unwrap_or_else para gestionar estados iniciales (como cuentas nuevas sin saldo) sin causar interrupciones en el servicio.


Validaciones lógicas.

DESPLIEGUE DEL CONTRATO


Despliegue del contrato.
