# BioFall Remake

BioFall es un roguelike de supervivencia 2D con perspectiva top-down, desarrollado como aplicación web adaptable a PC y dispositivos móviles.

## Estado actual

**Fundación técnica — etapa inicial.** El proyecto contiene una base modular de motor, ciclo de vida, eventos, tiempo, servicios y renderizado Canvas 2D. Todavía no representa una versión jugable.

## Principios del proyecto

- JavaScript moderno con ES Modules y plataforma web estándar.
- Arquitectura modular, escalable y sin dependencias globales innecesarias.
- Interfaz adaptable a pantallas de escritorio y móviles.
- Estilo visual minimalista, legible y fluido, con identidad propia.
- Sistemas de juego desacoplados para facilitar su ampliación y pruebas.

## Estructura

```
src/
  engine/
    core/
      EventBus.js
      GameContext.js
      GameEngine.js
      ServiceContainer.js
      Time.js
    rendering/
      Renderer.js
  game/
    createGame.js
  main.js
index.html
style.css
```

## Desarrollo

La aplicación se publica mediante GitHub Pages. La entrada del proyecto es `index.html` y el motor se carga como módulo ES desde `src/main.js`.

Cada sistema se incorporará por etapas, verificando que la base funcional siga iniciando correctamente.
