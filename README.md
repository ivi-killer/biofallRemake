# BioFall

BioFall es un roguelike de supervivencia 2D con perspectiva cenital (top-down), ambientado en un mundo hostil y cambiante. La prioridad del prototipo es conseguir una jugabilidad central fluida y legible antes de añadir armas, objetos, enemigos y sistemas secundarios.

## Prototipo actual

- Personaje circular con dos manos visibles, ojos y una animación ligera al desplazarse.
- Movimiento con aceleración, frenado controlado y orientación hacia la dirección de avance.
- Cámara con seguimiento suavizado, anticipación de movimiento y zoom dinámico sutil.
- Mundo finito dividido en etapas de 320 × 320 unidades.
- Generación determinista y cacheada de etapas; los colisionadores se cargan alrededor del jugador y se retiran al alejarse.
- Controles de teclado en PC y joystick virtual en dispositivos táctiles.

## Controles

- **WASD / flechas:** movimiento.
- **Joystick virtual:** movimiento en móviles.
- **DEV / F2:** herramientas internas de depuración.

El proyecto utiliza módulos JavaScript nativos y Canvas 2D, sin dependencias de ejecución externas.

## Pruebas

Ejecutar el comando npm test para comprobar el motor, la física, la cámara, el movimiento del jugador y la generación del mundo.