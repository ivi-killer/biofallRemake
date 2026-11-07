# BioFall

BioFall es un roguelike de supervivencia 2D con perspectiva cenital (top-down), ambientado en un mundo hostil y cambiante. La prioridad del prototipo es conseguir una jugabilidad central fluida y legible antes de añadir armas, objetos, enemigos y sistemas secundarios.

## Prototipo actual

- Personaje circular con dos manos visibles, ojos y una animación ligera al desplazarse.
- Movimiento inmediato en terreno normal, con diagonales normalizadas y parada al soltar el control.
- Orientación independiente del movimiento mediante el ratón en PC.
- Cámara centrada en el jugador, con encuadre y zoom estables.
- Mundo finito dividido en etapas de 320 × 320 unidades.
- Generación determinista y cacheada de etapas; los colisionadores se cargan alrededor del jugador y se retiran al alejarse.
- Controles de teclado en PC y joystick virtual en dispositivos táctiles.

## Recursos gráficos

- Primera integración local del Creator Kit: árbol, arbusto y roca.
- Los sprites se cargan desde archivos incluidos en el repositorio; el renderizado vectorial permanece como respaldo durante la carga.
- La generación determinista y las dimensiones de colisión de los objetos no dependen del tamaño de los PNG/SVG.

## Controles

- **WASD / flechas:** movimiento en PC.
- **Ratón:** orientar al personaje independientemente del movimiento.
- **Joystick virtual:** movimiento en móviles; la orientación sigue la dirección de desplazamiento por ahora.
- **DEV / F2:** herramientas internas de depuración.

El proyecto utiliza módulos JavaScript nativos y Canvas 2D, sin dependencias de ejecución externas.

## Pruebas

Ejecutar el comando npm test para comprobar el motor, la física, la cámara, el movimiento del jugador y la generación del mundo.

## Créditos de recursos

Los primeros sprites integrados proceden del repositorio público [survival2d/Assets](https://github.com/survival2d/Assets), archivo de recursos de surviv.io Creator Kit. BioFall es un proyecto fanmade independiente y no oficial.
