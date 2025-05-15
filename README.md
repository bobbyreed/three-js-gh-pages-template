# Three.js Interactive Showcase Template

This template combines [the starter guides on the three.js documentation](https://threejs.org/manual/#en/creating-a-scene) with troubleshooting experiences from deploying 3D web applications using [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

The project uses a pure CDN approach with no build steps required, making it extremely simple to deploy and modify.

[Template Demo](https://bobbyreed.github.io/three-js-gh-pages-template/)

## Technology Approach

This template uses CDNs exclusively with ES modules and import maps for dependency management. This approach offers several advantages:

- **No build steps required** - Edit the HTML/CSS/JS files directly and deploy
- **Instant deployment** - Works immediately when pushed to GitHub Pages
- **Reduced complexity** - No Node.js, npm, or build tools needed
- **Smaller repository size** - No node_modules directory or package files

The template loads these libraries via CDN:
```html
<!-- Three.js and its addons -->
"three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"
"three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"

<!-- React libraries -->
"react": "https://unpkg.com/react@18/umd/react.production.min.js"
"react-dom": "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
```

### Currently Working Features

- **Core 3D Setup**
  - WebGL renderer with anti-aliasing
  - Perspective camera with dynamic sizing
  - Orbital controls for camera navigation
  - Basic scene with ambient and directional lighting
  - Responsive design that adjusts to window resizing

- **3D Objects**
  - 10 primitive geometries (Cube, Sphere, Cylinder, Cone, Torus, Torus Knot, Dodecahedron, Octahedron, Tetrahedron, Icosahedron)
  - Navigation between objects (next/previous buttons)
  - Object selection dropdown

- **Material Controls**
  - 5 material types (Basic, Phong, Standard, Lambert, Toon)
  - Color controls with color picker
  - Random color generator
  - Opacity adjustment
  - Wireframe toggle
  - Scale adjustment

- **Animation Controls**
  - Start/stop animation
  - Basic rotation animation for objects

### Placeholder Features (UI Only - Not Yet Implemented)

- **Performance Monitoring**
  - FPS counter
  - Vertices counter
  - Memory usage tracking
  - Rendered objects counter

- **Environment Presets**
  - Deep Space, Alien Planet, and Tech Lab scenes
  - Ambient light slider control

- **Camera Controls**
  - Zoom slider
  - Fixed position views (Top, Front, Left, Right)
  - Orbit mode toggle

- **Lighting Controls**
  - Light type selection (Ambient, Directional, Point, Spot)
  - Light intensity adjustment
  - Shadow toggle

- **Environment Controls**
  - Grid toggle
  - Axis helper toggle
  - Background selection (Solid, Gradient, Skybox)

- **Effects**
  - Bloom effect
  - Depth of Field
  - Screenshot capture

- **Advanced Features**
  - Physics simulation
  - Particle systems
  - 3D Model loading

## Projects using this template

### Virtual Fairgrounds
[Virtual Fairgrounds Web](https://github.com/DEVlimited/virtual-fairgrounds-web) is a VR and browser based recreation of the 1950's fairground neighborhood of Oklahoma City.

## Getting Started

1. Fork this repository
2. Enable GitHub Pages in your repository settings
3. Customize the 3D objects and UI to fit your project needs
4. Deploy your changes

No build steps or package installations required!

## Projects using this template

### Virtual Fairgrounds
[Virtual Fairgrounds Web](https://github.com/DEVlimited/virtual-fairgrounds-web) is a VR and browser based recreation of the 1950's fairground neighborhood of Oklahoma City.
