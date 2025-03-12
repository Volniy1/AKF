"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import s from "./Scene.module.scss";
import {
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
} from "three/examples/jsm/Addons.js";

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      window.innerWidth < 450 ? 90 : 65,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Post-processin
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.5,
      0.3,
      0.5
    );
    composer.addPass(bloomPass);

    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight("#444444", 1);
    const light = new THREE.SpotLight("#ffffff", 100);
    light.position.z = 6;
    light.position.x = 0;
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 1000;
    light.shadow.focus = 1; //

    const directLight = new THREE.DirectionalLight("#006dac", 100);
    directLight.position.z = -5;
    directLight.position.x = -1;
    directLight.position.y = 2;

    const box = new THREE.Mesh(
      new THREE.BoxGeometry(11, 11, 11),
      new THREE.MeshStandardMaterial({
        color: "#880000",
        emissive: "#00116e",
        side: THREE.BackSide,
      })
    );
    box.castShadow = false;
    box.receiveShadow = true;

    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(
        window.innerWidth / 1000 + 3.5,
        window.innerWidth / 1000 + 3.5,
        window.innerWidth / 1000 + 3.5
      ),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        emissive: "#00116e",
      })
    );
    cube.receiveShadow = true;
    cube.castShadow = true;
    cube.position.z = -3;
    directLight.target = cube;

    scene.add(ambientLight);
    scene.add(light);
    scene.add(box);
    scene.add(cube);

    let direction = 0.0017;
    let limit = 0.5;

    const animate = () => {
      cube.rotation.x += direction;
      cube.rotation.y += direction;
      box.rotation.z += 0.0001;
      box.rotation.y += 0.0001;

      if (cube.rotation.y >= limit || cube.rotation.y <= -limit) {
        direction *= -1;
      }
      composer.render();
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      renderer.dispose();
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div className={s.scene} ref={mountRef} />;
}
