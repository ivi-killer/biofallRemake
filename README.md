# BioFall Remake

BioFall es un roguelike de supervivencia 2D con perspectiva top-down, desarrollado como aplicación web adaptable a PC y dispositivos móviles.

## Estado actual

**Fundación del motor — versión 0.4.0.** La base modular incluye ciclo de vida, eventos, tiempo configurable, servicios, renderizado Canvas 2D, matemáticas 2D, entrada multiplataforma, cámara, escenas y arquitectura de entidades/componentes. La capa inicial de física detecta colisiones entre círculos y cajas, aplica filtros por capas y máscaras, y emite eventos de entrada, permanencia y salida. Todavía no resuelve físicamente el movimiento ni representa una versión jugable.

## Principios

- JavaScript moderno con ES Modules y plataforma web estándar.
- Arquitectura modular, escalable y con responsabilidades separadas.
- Adaptación a escritorio y móviles.
- Estilo visual minimalista, legible y con identidad propia.
- Sistemas desacoplados para facilitar ampliación y pruebas.

## Estructura

```
src/
  engine/
    core/
    entities/
    input/
    math/
    physics/
    rendering/
    scenes/
    world/
  game/
  main.js
tests/
index.html
style.css
package.json
```

## Desarrollo

La aplicación se publica mediante GitHub Pages. La entrada es `index.html` y el motor se carga como módulo ES desde `src/main.js`.

Las pruebas automáticas se ejecutan con `npm test` usando el test runner integrado de Node.js. Cada sistema se incorpora por etapas, verificando que la base funcional siga iniciando correctamente.
