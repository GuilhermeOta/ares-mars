import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Target, ChevronRight, Compass } from 'lucide-react';
import marsTextureFile from '../assets/8k_mars.jpg'; 

export default function GlobeView({ onSelectSector }) {
  const mountRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // 1. Configuração da Cena, Câmara e Renderizador WebGL
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // 2. Controlos de Órbita
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.5;
    controls.maxDistance = 8;
    controls.enablePan = false;

    // 3. Iluminação Espacial e O Sol Visível
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunPosition = new THREE.Vector3(40, 25, 40);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.5);
    sunLight.position.copy(sunPosition);
    scene.add(sunLight);

    const sunGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xfffaed });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.copy(sunPosition);
    scene.add(sunMesh);

    const sunGlowGeo = new THREE.SphereGeometry(5.5, 32, 32);
    const sunGlowMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    sunMesh.add(sunGlow);

    // 4. Campo de Estrelas Distantes (Starfield)
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 2000;
    const starPositions = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 500;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      sizeAttenuation: true
    });
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // 5. Carregamento da Textura utilizando o ficheiro importado do src/assets
    const textureLoader = new THREE.TextureLoader();
    const marsTexture = textureLoader.load(
      marsTextureFile, 
      () => {
        setIsLoading(false);
      },
      undefined,
      (error) => {
        console.error("Erro ao carregar a textura de Marte:", error);
        setIsLoading(false); 
      }
    );

    // 6. Esfera de Marte
    const geometry = new THREE.SphereGeometry(1.5, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      map: marsTexture,
      roughness: 0.85,
      metalness: 0.05,
    });

    const marsMesh = new THREE.Mesh(geometry, material);
    scene.add(marsMesh);

    // 7. Atmosfera / Glow nas Bordas do Planeta
    const atmosGeo = new THREE.SphereGeometry(1.53, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_FragColor = vec4(1.0, 0.6, 0.2, 1.0) * intensity * 0.6;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const atmosfera = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosfera);

    // 8. Ponto Marcador de Arcadia Planitia (Filho de marsMesh para rodar junto)
    const lat = 40;
    const lon = 188;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const radius = 1.5;
    
    const arcadiaPoint = new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );

    const markerGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const markerMesh = new THREE.Mesh(markerGeo, markerMat);
    markerMesh.position.copy(arcadiaPoint);
    marsMesh.add(markerMesh);

    // 9. Animação de Zoom Orbital (Descida)
    let zoomTarget = null;
    let startCameraPos = new THREE.Vector3();

    window.triggerZoomToArcadia = (callback) => {
      const worldMarkerPos = new THREE.Vector3();
      markerMesh.getWorldPosition(worldMarkerPos);

      zoomTarget = worldMarkerPos.clone().multiplyScalar(1.355);
      startCameraPos.copy(camera.position);
      controls.enabled = false;
      setIsAnimating(true);

      let startTime = performance.now();
      const duration = 1200;

      const animateZoom = (now) => {
        let elapsed = now - startTime;
        let progress = Math.min(elapsed / duration, 1);
        
        let easeProgress = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        camera.position.lerpVectors(startCameraPos, zoomTarget, easeProgress);
        controls.target.lerp(worldMarkerPos, 0.1);
        controls.update();

        renderer.render(scene, camera);

        if (progress < 1) {
          requestAnimationFrame(animateZoom);
        } else {
          setTimeout(callback, 150);
        }
      };

      requestAnimationFrame(animateZoom);
    };

    const handleResize = () => {
      if (!currentMount) return;
      const newWidth = currentMount.clientWidth;
      const newHeight = currentMount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!zoomTarget) {
        marsMesh.rotation.y += 0.0008;
        atmosfera.rotation.y += 0.0008;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      markerGeo.dispose();
      markerMat.dispose();
      atmosGeo.dispose();
      atmosMat.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      sunGeo.dispose();
      sunMat.dispose();
      sunGlowGeo.dispose();
      sunGlowMat.dispose();
    };
  }, []);

  const handleDescerClick = () => {
    if (window.triggerZoomToArcadia) {
      window.triggerZoomToArcadia(onSelectSector);
    } else {
      onSelectSector();
    }
  };

  return (
    <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing relative">
      
      {/* Tela de Carregamento Estilo NASA */}
      <div className={`absolute inset-0 z-50 bg-black flex flex-col items-center justify-center transition-opacity duration-700 ease-out pointer-events-none ${
        isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0'
      }`}>
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/40 flex items-center justify-center">
            <Compass className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
          <div className="text-center">
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-white">A.T.O.M. // Sistema ARES</h4>
            <p className="text-[10px] font-mono text-amber-400 mt-1 uppercase tracking-widest">A carregar telemetria de Marte...</p>
          </div>
          <div className="w-32 h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div className="w-full h-full bg-amber-500 animate-[pulse_1s_infinite]"></div>
          </div>
        </div>
      </div>

      {/* Painel de Telemetria e Alvo */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
        <div className="bg-zinc-950/90 backdrop-blur-xl border border-amber-500/40 p-4 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.15)] flex items-center space-x-6 max-w-lg w-full animate-fade-in">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">Alvo Selecionado: Arcadia Planitia</span>
            </div>
            <p className="text-xs text-zinc-300 mt-0.5">Evidências de gelo subterrâneo detetadas. Pronto para iniciar descida orbital.</p>
          </div>

          <button
            disabled={isAnimating || isLoading}
            onClick={handleDescerClick}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center space-x-1.5 active:scale-95 shrink-0 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <span>{isAnimating ? 'A aproximar...' : 'Descer'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ASSINATURA DO GRUPO: Canto Inferior Direito */}
      <div className="absolute bottom-8 right-8 z-20 pointer-events-none hidden sm:block">
        <div className="bg-zinc-950/80 backdrop-blur-md border border-amber-500/30 px-3.5 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
            Made by <strong className="text-amber-400 font-bold">A.T.O.M</strong>
          </span>
        </div>
      </div>

    </div>
  );
}