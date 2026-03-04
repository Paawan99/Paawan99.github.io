/* ============================================
   3D FLOATING ISLANDS HUB — Three.js Scene
   Paawan Shah Portfolio
   ============================================ */

class IslandHub {
    constructor() {
        this.canvas = document.getElementById('hub-canvas');
        this.labelsContainer = document.getElementById('hub-labels');
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();
        this.mouse = { x: 0, y: 0 };
        this.raycaster = new THREE.Raycaster();
        this.mouseVec = new THREE.Vector2();
        this.islands = [];
        this.particles = [];
        this.hoveredIsland = null;
        this.isAnimating = false;

        // Island configuration
        this.islandData = [
            { id: 'about',      name: 'About',       icon: '\u{1F464}', color: 0x64ffda, pos: { x: -4.5, y: 1.8, z: -2 } },
            { id: 'ccfinder',   name: 'CC Finder',   icon: '\u{1F4B3}', color: 0xffd700, pos: { x: -1.5, y: 2.5, z: -3 } },
            { id: 'skills',     name: 'Skills',      icon: '\u{1F4CA}', color: 0x7c5cfc, pos: { x: 2.0,  y: 1.5, z: -2.5 } },
            { id: 'experience', name: 'Experience',   icon: '\u{1F4BC}', color: 0xff6b9d, pos: { x: 5.0,  y: 2.2, z: -1.5 } },
            { id: 'projects',   name: 'Projects',     icon: '\u{1F680}', color: 0x64ffda, pos: { x: -3.5, y: -1.5, z: -1.5 } },
            { id: 'blog',       name: 'Blog',         icon: '\u{1F4DD}', color: 0x7c5cfc, pos: { x: 0.5,  y: -2.0, z: -2 } },
            { id: 'games',      name: 'Games',        icon: '\u{1F3AE}', color: 0xff6b9d, pos: { x: 3.5,  y: -1.2, z: -2.5 } },
            { id: 'contact',    name: 'Contact',      icon: '\u{1F4E7}', color: 0xffd700, pos: { x: -0.5, y: 0.2, z: -1 } },
        ];

        this.init();
        this.createStarfield();
        this.createIslands();
        this.createConnections();
        this.createAmbientParticles();
        this.createLabels();
        this.addEventListeners();
        this.animate();
    }

    init() {
        // Camera
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 0.5, 7);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x04040a, 1);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x334455, 0.6);
        this.scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x64ffda, 1.2, 30);
        pointLight1.position.set(5, 5, 5);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x7c5cfc, 0.8, 30);
        pointLight2.position.set(-5, -3, 3);
        this.scene.add(pointLight2);

        // Fog
        this.scene.fog = new THREE.FogExp2(0x04040a, 0.06);
    }

    createStarfield() {
        const starCount = 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 60;
            positions[i3 + 1] = (Math.random() - 0.5) * 40;
            positions[i3 + 2] = (Math.random() - 0.5) * 40 - 10;

            // Vary colors between cyan and purple
            const t = Math.random();
            colors[i3] = 0.39 + t * 0.1;     // R
            colors[i3 + 1] = 0.6 + t * 0.4;  // G
            colors[i3 + 2] = 0.85 + t * 0.1;  // B

            sizes[i] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true,
        });

        this.starfield = new THREE.Points(geometry, material);
        this.scene.add(this.starfield);
    }

    createIslands() {
        this.islandData.forEach((data) => {
            const group = new THREE.Group();
            group.userData = { id: data.id, name: data.name };

            // Main platform — flat cylinder
            const platformGeo = new THREE.CylinderGeometry(0.6, 0.75, 0.18, 6);
            const platformMat = new THREE.MeshPhongMaterial({
                color: data.color,
                emissive: data.color,
                emissiveIntensity: 0.15,
                transparent: true,
                opacity: 0.85,
                flatShading: true,
            });
            const platform = new THREE.Mesh(platformGeo, platformMat);
            group.add(platform);

            // Glow ring
            const ringGeo = new THREE.RingGeometry(0.7, 0.85, 6);
            const ringMat = new THREE.MeshBasicMaterial({
                color: data.color,
                transparent: true,
                opacity: 0.2,
                side: THREE.DoubleSide,
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = -0.05;
            group.add(ring);

            // Floating object on top (varies per island type)
            const topObject = this.createTopObject(data.id, data.color);
            topObject.position.y = 0.5;
            group.add(topObject);

            // Point light halo
            const halo = new THREE.PointLight(data.color, 0.4, 3);
            halo.position.y = 0.3;
            group.add(halo);

            group.position.set(data.pos.x, data.pos.y, data.pos.z);
            group.userData.baseY = data.pos.y;
            group.userData.phase = Math.random() * Math.PI * 2;

            this.scene.add(group);
            this.islands.push(group);
        });
    }

    createTopObject(id, color) {
        let geo, mat;
        const commonMat = {
            color: color,
            wireframe: true,
            transparent: true,
            opacity: 0.6,
        };

        switch (id) {
            case 'about':
                geo = new THREE.IcosahedronGeometry(0.25, 0);
                break;
            case 'ccfinder':
                geo = new THREE.BoxGeometry(0.35, 0.22, 0.02);
                commonMat.wireframe = false;
                commonMat.opacity = 0.8;
                break;
            case 'skills':
                geo = new THREE.OctahedronGeometry(0.25, 0);
                break;
            case 'experience':
                geo = new THREE.TorusGeometry(0.2, 0.08, 8, 6);
                break;
            case 'projects':
                geo = new THREE.ConeGeometry(0.22, 0.4, 4);
                break;
            case 'blog':
                geo = new THREE.TetrahedronGeometry(0.25, 0);
                break;
            case 'games':
                geo = new THREE.DodecahedronGeometry(0.22, 0);
                break;
            case 'contact':
                geo = new THREE.SphereGeometry(0.2, 8, 6);
                break;
            default:
                geo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
        }

        mat = new THREE.MeshPhongMaterial(commonMat);
        return new THREE.Mesh(geo, mat);
    }

    createConnections() {
        // Draw subtle lines between connected islands
        const connections = [
            [0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [0, 4], [3, 6], [7, 0], [7, 5]
        ];

        connections.forEach(([a, b]) => {
            const posA = this.islandData[a].pos;
            const posB = this.islandData[b].pos;
            const points = [
                new THREE.Vector3(posA.x, posA.y, posA.z),
                new THREE.Vector3(posB.x, posB.y, posB.z),
            ];
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineBasicMaterial({
                color: 0x64ffda,
                transparent: true,
                opacity: 0.06,
            });
            const line = new THREE.Line(geo, mat);
            this.scene.add(line);
        });
    }

    createAmbientParticles() {
        const count = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 12;
            positions[i3 + 2] = (Math.random() - 0.5) * 12 - 5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 0.03,
            color: 0x64ffda,
            transparent: true,
            opacity: 0.4,
        });

        this.ambientPts = new THREE.Points(geometry, material);
        this.scene.add(this.ambientPts);
    }

    createLabels() {
        this.labelElements = [];
        this.islandData.forEach((data, i) => {
            const el = document.createElement('div');
            el.className = 'hub-label';
            el.dataset.island = data.id;
            el.innerHTML = `
                <span class="hub-label-icon">${data.icon}</span>
                <span class="hub-label-name">${data.name}</span>
            `;
            el.addEventListener('click', () => this.onIslandClick(data.id));
            this.labelsContainer.appendChild(el);
            this.labelElements.push(el);
        });
    }

    updateLabels() {
        this.islands.forEach((island, i) => {
            const pos = island.position.clone();
            pos.y += 1.1;
            pos.project(this.camera);

            const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-pos.y * 0.5 + 0.5) * window.innerHeight;

            const el = this.labelElements[i];
            if (el) {
                el.style.left = `${x}px`;
                el.style.top = `${y}px`;
                el.style.transform = 'translate(-50%, -50%)';

                // Hide if behind camera
                if (pos.z > 1) {
                    el.style.opacity = '0';
                } else {
                    el.style.opacity = '1';
                }
            }
        });
    }

    addEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onMouseMove(e) {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        this.mouseVec.set(this.mouse.x, this.mouse.y);
    }

    onCanvasClick(e) {
        this.raycaster.setFromCamera(this.mouseVec, this.camera);
        const intersects = this.raycaster.intersectObjects(
            this.islands.flatMap(g => g.children),
            false
        );

        if (intersects.length > 0) {
            const island = intersects[0].object.parent;
            if (island.userData.id) {
                this.onIslandClick(island.userData.id);
            }
        }
    }

    onIslandClick(id) {
        if (this.isAnimating) return;
        // Dispatch custom event for the app to handle
        window.dispatchEvent(new CustomEvent('islandClick', { detail: { id } }));
    }

    flyToIsland(id, callback) {
        const island = this.islands.find(i => i.userData.id === id);
        if (!island || this.isAnimating) return;

        this.isAnimating = true;
        const target = island.position.clone();
        target.z += 2;
        target.y += 0.3;

        // Animate camera towards island
        const startPos = this.camera.position.clone();
        const duration = 1200;
        const startTime = Date.now();

        const animateFly = () => {
            const elapsed = Date.now() - startTime;
            const t = Math.min(elapsed / duration, 1);
            // Ease out quart
            const ease = 1 - Math.pow(1 - t, 4);

            this.camera.position.lerpVectors(startPos, target, ease);
            this.camera.lookAt(island.position);

            if (t < 1) {
                requestAnimationFrame(animateFly);
            } else {
                this.isAnimating = false;
                if (callback) callback();
            }
        };
        animateFly();
    }

    resetCamera(callback) {
        this.isAnimating = true;
        const startPos = this.camera.position.clone();
        const endPos = new THREE.Vector3(0, 0.5, 7);
        const duration = 800;
        const startTime = Date.now();

        const animateReset = () => {
            const elapsed = Date.now() - startTime;
            const t = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);

            this.camera.position.lerpVectors(startPos, endPos, ease);
            this.camera.lookAt(0, 0, 0);

            if (t < 1) {
                requestAnimationFrame(animateReset);
            } else {
                this.isAnimating = false;
                if (callback) callback();
            }
        };
        animateReset();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = this.clock.getElapsedTime();

        // Floating animation for islands
        this.islands.forEach((island) => {
            const phase = island.userData.phase;
            island.position.y = island.userData.baseY + Math.sin(time * 0.8 + phase) * 0.15;
            // Gentle rotation for top objects
            if (island.children[2]) {
                island.children[2].rotation.y = time * 0.5 + phase;
                island.children[2].rotation.x = Math.sin(time * 0.3 + phase) * 0.2;
            }
            // Pulse ring
            if (island.children[1]) {
                island.children[1].material.opacity = 0.12 + Math.sin(time * 1.5 + phase) * 0.08;
            }
        });

        // Gentle starfield rotation
        if (this.starfield) {
            this.starfield.rotation.y = time * 0.01;
            this.starfield.rotation.x = time * 0.005;
        }

        // Ambient particles drift
        if (this.ambientPts) {
            this.ambientPts.rotation.y = time * 0.02;
        }

        // Subtle camera sway from mouse
        if (!this.isAnimating) {
            this.camera.position.x += (this.mouse.x * 0.3 - this.camera.position.x) * 0.02;
            this.camera.position.y += (this.mouse.y * 0.2 + 0.5 - this.camera.position.y) * 0.02;
            this.camera.lookAt(0, 0, -2);
        }

        this.updateLabels();
        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        this.renderer.dispose();
    }
}

// Initialize when DOM ready
let hubScene;
document.addEventListener('DOMContentLoaded', () => {
    hubScene = new IslandHub();
    window.hubScene = hubScene;
});
