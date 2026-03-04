const canvas = document.getElementById('sparks-canvas');
const container = document.getElementById('hero');

if (canvas && container) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Geometry
    const particlesCount = 3000;
    const posArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    const velocityArray = new Float32Array(particlesCount);

    const colors = [
        new THREE.Color(0xa855f7), // Purple
        new THREE.Color(0x3b82f6), // Blue
        new THREE.Color(0xec4899)  // Pink
    ];

    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        posArray[i3] = (Math.random() - 0.5) * 10;

        // Bias Y-position towards the bottom (-5 to 5 range, bias towards -5)
        // Using power function to push more particles to the lower values
        posArray[i3 + 1] = (Math.pow(Math.random(), 2) * 10) - 5;

        posArray[i3 + 2] = (Math.random() - 0.5) * 5;

        const color = colors[Math.floor(Math.random() * colors.length)];
        colorArray[i3] = color.r;
        colorArray[i3 + 1] = color.g;
        colorArray[i3 + 2] = color.b;

        velocityArray[i] = 0.002 + Math.random() * 0.005;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    // Particle Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.012,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
    });

    // Create Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    camera.position.z = 3;

    // Animation loop
    const animate = () => {
        requestAnimationFrame(animate);

        const positions = particlesGeometry.attributes.position.array;

        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            // Move upwards
            positions[i3 + 1] += velocityArray[i];

            // Reset if out of view
            if (positions[i3 + 1] > 5) {
                positions[i3 + 1] = -5;
                positions[i3] = (Math.random() - 0.5) * 10;
            }

            // Subtle horizontal drift
            positions[i3] += Math.sin(Date.now() * 0.001 + i) * 0.001;
        }

        particlesGeometry.attributes.position.needsUpdate = true;

        // Rotate the entire system slightly
        particlesMesh.rotation.y += 0.0005;

        renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}
