"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function GlobeNetwork() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // mountRef.current.appendChild(renderer.domElement);
    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);
    /* ---------------- LIGHTING ---------------- */

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    /* ---------------- EARTH TEXTURE ---------------- */

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg",
    );

    const globeGeometry = new THREE.SphereGeometry(1.2, 64, 64);

    const globeMaterial = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 1,
      metalness: 0,
    });

    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    /* ---------------- ATMOSPHERE ---------------- */

    const atmosphereGeometry = new THREE.SphereGeometry(1.28, 64, 64);

    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: "#3fa9ff",
      transparent: true,
      opacity: 0.04,
      side: THREE.BackSide,
    });

    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    /* ---------------- SATELLITES ---------------- */

    const satellites: THREE.Mesh[] = [];

    const satGeometry = new THREE.BoxGeometry(0.08, 0.08, 0.08);
    const satMaterial = new THREE.MeshStandardMaterial({ color: "#F4A024" });

    for (let i = 0; i < 3; i++) {
      const sat = new THREE.Mesh(satGeometry, satMaterial);
      scene.add(sat);
      satellites.push(sat);
    }

    /* ---------------- CONNECTION POINTS ---------------- */

    const points: THREE.Vector3[] = [];

    for (let i = 0; i < 35; i++) {
      const phi = Math.acos(-1 + (2 * i) / 35);
      const theta = Math.sqrt(35 * Math.PI) * phi;

      const x = Math.cos(theta) * Math.sin(phi);
      const y = Math.sin(theta) * Math.sin(phi);
      const z = Math.cos(phi);

      const point = new THREE.Vector3(x, y, z).multiplyScalar(1.2);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8),
        new THREE.MeshBasicMaterial({ color: "#F4A024" }),
      );

      dot.position.copy(point);
      scene.add(dot);

      points.push(point);
    }

    /* ---------------- CONNECTION LINES ---------------- */

    const lineMaterial = new THREE.LineBasicMaterial({
      color: "#F4A024",
      transparent: true,
      opacity: 0.35,
    });

    for (let i = 0; i < points.length; i++) {
      const target = points[(i + 6) % points.length];

      const curve = new THREE.QuadraticBezierCurve3(
        points[i],
        new THREE.Vector3(0, 0, 0).multiplyScalar(0.3),
        target,
      );

      const curvePoints = curve.getPoints(20);

      const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

      const line = new THREE.Line(geometry, lineMaterial);

      scene.add(line);
    }

    /* ---------------- MOUSE ROTATION ---------------- */

    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = (event.clientY / window.innerHeight) * 2 - 1;

      targetRotationY = x * 0.5;
      targetRotationX = y * 0.3;
    };

    window.addEventListener("mousemove", onMouseMove);

    /* ---------------- ANIMATION ---------------- */

    let time = 0;
    let disposed = false;
    let inView = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(mountRef.current);

    const animate = () => {
      if (disposed) return;

      requestAnimationFrame(animate);

      if (!inView) return;

      time += 0.01;

      targetRotationY += 0.002; // auto-rotate by nudging the target each frame

      globe.rotation.y += (targetRotationY - globe.rotation.y) * 0.02;
      globe.rotation.x += (targetRotationX - globe.rotation.x) * 0.02;

      satellites.forEach((sat, i) => {
        const angle = time + (i * Math.PI * 2) / satellites.length;

        sat.position.x = Math.cos(angle) * 2;
        sat.position.z = Math.sin(angle) * 2;
        sat.position.y = Math.sin(angle * 2) * 0.2;
      });

      renderer.render(scene, camera);
    };

    animate();

    /* ---------------- RESIZE ---------------- */

    const handleResize = () => {
      if (!mountRef.current) return;

      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);

      renderer.dispose();

      if (mountRef.current) {
        mountRef.current.innerHTML = "";
      }
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 opacity-40 z-0" />;
}
