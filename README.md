# BioFall Remake

BioFall es un roguelike de supervivencia 2D con perspectiva top-down, desarrollado como aplicación web adaptable a PC y dispositivos móviles.

## Estado actual

**Fundación del motor — versión 0.3.0.** La base modular incluye ciclo de vida, eventos, tiempo, servicios, renderizado Canvas 2D, matemáticas 2D, entrada multiplataforma, cámara, escenas y una arquitectura inicial de entidades y componentes. Todavía no representa una versión jugable.

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
    rendering/
    scenes/
    world/
  game/
  main.js
index.html
style.css
```

## Desarrollo

La aplicación se publica mediante GitHub Pages. La entrada es `index.html` y el motor se carga como módulo ES desde `src/main.js`.

Cada sistema se incorporará por etapas, verificando que la base funcional siga iniciando correctamente.
