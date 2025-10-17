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
    // oscillate around a dynamic center with fixed amplitude
    let amplitude = 0.5; // radians
    let spinCenterY = 0; // updated when drag ends
    let shouldFocus = false;
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    const dragSpeed = 0.005; // lower = slower rotation per pixel
    let holidayMode = false;
    let hue = 0;

    const focusListener = (e: CustomEvent<boolean>) => {
      shouldFocus = Boolean((e as any).detail);
    };
    // listen to focus toggle from header/email hover
    window.addEventListener("akf-focus-cube", focusListener as EventListener);

    const holidayListener = () => {
      holidayMode = !holidayMode;
    };
    window.addEventListener("akf-toggle-holiday", holidayListener);

    // pointer drag handlers (mouse, touch, pen)
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const onPointerDown = (e: PointerEvent) => {
      // compute NDC for raycast
      ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
      ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(cube, true);

      if (hit.length === 0) {
        // clicked outside the cube → resume auto motion and don't start dragging
        isDragging = false;
        shouldFocus = false;
        return;
      }

      isDragging = true;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      // prevent scroll on touch drag
      if (e.pointerType === "touch") e.preventDefault();
      try {
        renderer.domElement.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      if (e.pointerType === "touch") e.preventDefault();
      const deltaX = e.clientX - lastPointerX;
      const deltaY = e.clientY - lastPointerY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      // rotate cube: horizontal drag -> y rotation, vertical -> x rotation
      cube.rotation.y += deltaX * dragSpeed;
      cube.rotation.x += deltaY * dragSpeed;
      // cancel focus mode while actively dragging
      shouldFocus = false;
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      shouldFocus = false;
      spinCenterY = cube.rotation.y; // set new center
      if (e.pointerType === "touch") e.preventDefault();
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerCancel = (e: PointerEvent) => {
      isDragging = false;
      shouldFocus = false;
      spinCenterY = cube.rotation.y; // set new center
      try {
        renderer.domElement.releasePointerCapture(e.pointerId);
      } catch {}
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, {
      passive: false,
    } as any);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);

    const animate = () => {
      if (shouldFocus && !isDragging) {
        // ease cube back to centered rotation
        const ease = 0.08;
        cube.rotation.x += (0 - cube.rotation.x) * ease;
        cube.rotation.y += (0 - cube.rotation.y) * ease;
      } else {
        // only run autonomous motion when not dragging
        if (!isDragging) {
          cube.rotation.x += direction;
          cube.rotation.y += direction;
          if (
            cube.rotation.y >= spinCenterY + amplitude ||
            cube.rotation.y <= spinCenterY - amplitude
          ) {
            direction *= -1;
          }
        }
      }
      box.rotation.z += 0.0001;
      box.rotation.y += 0.0001;
      // holiday outer box color cycling
      if (holidayMode) {
        console.log(isDragging, shouldFocus);
        hue = (hue + 0.3) % 360;
        (box.material as THREE.MeshStandardMaterial).color.set(
          `hsl(${hue}, 85%, 55%)`
        );
        (box.material as THREE.MeshStandardMaterial).emissive.set(
          `hsl(${(hue + 260) % 360}, 60%, 35%)`
        );
      } else {
        (box.material as THREE.MeshStandardMaterial).color.set("#880000");
        (box.material as THREE.MeshStandardMaterial).emissive.set("#00116e");
      }
      composer.render();
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      renderer.dispose();
      window.removeEventListener(
        "akf-focus-cube",
        focusListener as EventListener
      );
      window.removeEventListener("akf-toggle-holiday", holidayListener);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove as any);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div className={s.scene} ref={mountRef} />;
}
