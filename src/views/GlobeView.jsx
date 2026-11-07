import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Target, ChevronRight, Compass, X, Settings2 } from 'lucide-react';

// Importação de todas as texturas reais da missão
import marsTextureFile from '../assets/8k_mars.jpg'; 
import sunTextureFile from '../assets/8k_sun.jpg';
import starsTextureFile from '../assets/8k_stars.jpg';
import phobosTextureFile from '../assets/phobos.jpg';
import deimosTextureFile from '../assets/deimos.jpg';
import regionsData from '../api/regions.json'; 

// ---------- Configurações da câmera ----------
const CAMERA_MIN_DISTANCE = 2.5;  // o mais perto (Marte tem raio 1.5)
const CAMERA_MAX_DISTANCE = 30;   // o mais longe (o Sol está a ~62; não passe de ~50)
const SENSITIVITY_KEY = 'ares-sensibilidade-camera';

// Lê a sensibilidade salva no navegador (1 = padrão)
const loadSensitivity = () => {
  try {
    const v = parseFloat(localStorage.getItem(SENSITIVITY_KEY));
    return Number.isFinite(v) ? v : 1;
  } catch {
    return 1;
  }
};

export default function GlobeView({ onSelectSector }) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null); // acesso aos controles fora do useEffect
  const [sensitivity, setSensitivity] = useState(loadSensitivity);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHudVisible, setIsHudVisible] = useState(true); // Estado para controlar a visibilidade do HUD de descida

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
    controls.minDistance = CAMERA_MIN_DISTANCE;
    controls.maxDistance = CAMERA_MAX_DISTANCE;
    controls.enablePan = false;
    controlsRef.current = controls;

    // 3. Iluminação Espacial e O Sol com Textura Real
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunPosition = new THREE.Vector3(40, 25, 40);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    sunLight.position.copy(sunPosition);
    scene.add(sunLight);

    const textureLoader = new THREE.TextureLoader();

    // Carregamento de Texturas
    const marsTexture = textureLoader.load(marsTextureFile, () => setIsLoading(false));
    const sunTexture = textureLoader.load(sunTextureFile);
    const starsTexture = textureLoader.load(starsTextureFile);
    const phobosTexture = textureLoader.load(phobosTextureFile);
    const deimosTexture = textureLoader.load(deimosTextureFile);

    // Grupo do Sol Realista
    const sunGroup = new THREE.Group();
    sunGroup.position.copy(sunPosition);
    scene.add(sunGroup);

    const sunCoreGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const sunCoreMat = new THREE.MeshBasicMaterial({ map: sunTexture });
    const sunCore = new THREE.Mesh(sunCoreGeo, sunCoreMat);
    sunGroup.add(sunCore);

    const innerCoronaGeo = new THREE.SphereGeometry(4.3, 32, 32);
    const innerCoronaMat = new THREE.MeshBasicMaterial({
      color: 0xff8c00,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const innerCorona = new THREE.Mesh(innerCoronaGeo, innerCoronaMat);
    sunGroup.add(innerCorona);

    const outerCoronaGeo = new THREE.SphereGeometry(6.0, 32, 32);
    const outerCoronaMat = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const outerCorona = new THREE.Mesh(outerCoronaGeo, outerCoronaMat);
    sunGroup.add(outerCorona);

    // 4. Skybox de Espaço Profundo com a Textura de Estrelas Real
    const starsGeo = new THREE.SphereGeometry(450, 32, 32);
    const starsMat = new THREE.MeshBasicMaterial({
      map: starsTexture,
      side: THREE.BackSide
    });
    const starField = new THREE.Mesh(starsGeo, starsMat);
    scene.add(starField);

    // 5. Esfera de Marte
    const geometry = new THREE.SphereGeometry(1.5, 64, 64);
    const material = new THREE.MeshStandardMaterial({
      map: marsTexture,
      roughness: 0.85,
      metalness: 0.05,
    });

    const marsMesh = new THREE.Mesh(geometry, material);
    scene.add(marsMesh);

    // 6. Atmosfera / Glow nas Bordas do Planeta
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

    // ==========================================
    // 7. LUAS DE MARTE COM TEXTURAS REAIS (FOBOS E DEIMOS)
    // ==========================================
    
    const createTextSprite = (message, color = '#f59e0b', fontSize = 28) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 128;
      
      context.fillStyle = 'rgba(0, 0, 0, 0)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      context.font = `bold ${fontSize}px monospace`;
      context.fillStyle = color;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.shadowColor = '#000000';
      context.shadowBlur = 6;
      context.fillText(message, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.55, 0.14, 1);
      return sprite;
    };

    const phobosGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const phobosMat = new THREE.MeshStandardMaterial({ map: phobosTexture, roughness: 0.9 });
    const phobosMesh = new THREE.Mesh(phobosGeo, phobosMat);
    scene.add(phobosMesh);
    const phobosLabel = createTextSprite('PHOBOS', '#a1a1aa', 24);
    scene.add(phobosLabel);

    const deimosGeo = new THREE.SphereGeometry(0.045, 16, 16);
    const deimosMat = new THREE.MeshStandardMaterial({ map: deimosTexture, roughness: 0.9 });
    const deimosMesh = new THREE.Mesh(deimosGeo, deimosMat);
    scene.add(deimosMesh);
    const deimosLabel = createTextSprite('DEIMOS', '#a1a1aa', 24);
    scene.add(deimosLabel);

    const createOrbitLine = (radius, color) => {
      const orbitPoints = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        orbitPoints.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.15 });
      return new THREE.Line(orbitGeo, orbitMat);
    };

    const phobosOrbitRadius = 2.7;
    const deimosOrbitRadius = 4.2;
    scene.add(createOrbitLine(phobosOrbitRadius, 0xf59e0b));
    scene.add(createOrbitLine(deimosOrbitRadius, 0x38bdf8));

    const latLonToVector3 = (lat, lon, radius) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    let arcadiaCenterPoint = null;
    const numSegments = 90;

    // 8. Renderização Dinâmica baseada no JSON (`regions.json`)
    regionsData.mars_regions.forEach((reg) => {
      const colorHex = parseInt(reg.color.replace('#', '0x'));

      if (reg.type === 'plain') {
        const boundaryPoints = [];
        for (let i = 0; i <= numSegments; i++) {
          const t = (i / numSegments) * Math.PI * 2;
          const dLat = reg.geometry.dLatScale * Math.sin(t) + 1.2 * Math.sin(3 * t);
          const dLon = reg.geometry.dLonScale * Math.cos(t) - 1.5 * Math.sin(2 * t);
          boundaryPoints.push(latLonToVector3(reg.center.lat + dLat, reg.center.lon + dLon * 1.1, 1.51));
        }

        const lineGeo = new THREE.BufferGeometry().setFromPoints(boundaryPoints);
        const lineMat = new THREE.LineBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95 });
        const borderMesh = new THREE.LineLoop(lineGeo, lineMat);
        marsMesh.add(borderMesh);

        if (reg.id === 'arcadia-planitia') {
          arcadiaCenterPoint = latLonToVector3(reg.center.lat, reg.center.lon, 1.5);
        }
      } 
      else if (reg.type === 'volcano') {
        const pointCoord = latLonToVector3(reg.center.lat, reg.center.lon, 1.5);
        const markerGeo = new THREE.SphereGeometry(0.045, 16, 16);
        const markerMat = new THREE.MeshBasicMaterial({ color: colorHex });
        const markerMesh = new THREE.Mesh(markerGeo, markerMat);
        markerMesh.position.copy(pointCoord);
        marsMesh.add(markerMesh);
      } 
      else if (reg.type === 'landing_site') {
        const pointCoord = latLonToVector3(reg.center.lat, reg.center.lon, 1.52);
        const siteGeo = new THREE.SphereGeometry(0.02, 16, 16);
        const siteMat = new THREE.MeshBasicMaterial({ color: colorHex });
        const siteMesh = new THREE.Mesh(siteGeo, siteMat);
        siteMesh.position.copy(pointCoord);
        marsMesh.add(siteMesh);
      }

      const fontSize = reg.type === 'landing_site' ? 22 : 28;
      const labelSprite = createTextSprite(reg.name, reg.color, fontSize);
      const offsetLat = reg.geometry?.labelOffsetLat || 0;
      labelSprite.position.copy(latLonToVector3(reg.center.lat + offsetLat, reg.center.lon, 1.56));
      marsMesh.add(labelSprite);
    });

    if (!arcadiaCenterPoint) {
      arcadiaCenterPoint = latLonToVector3(46.0, 187.0, 1.5);
    }

    // 9. Animação de Zoom Orbital (Descida para Arcadia Planitia)
    let zoomTarget = null;
    let startCameraPos = new THREE.Vector3();

    window.triggerZoomToArcadia = (callback) => {
      const worldCenterPos = new THREE.Vector3();
      marsMesh.localToWorld(worldCenterPos.copy(arcadiaCenterPoint));

      zoomTarget = worldCenterPos.clone().multiplyScalar(1.355);
      startCameraPos.copy(camera.position);
      controls.enabled = false;
      setIsAnimating(true);

      let startTime = performance.now();
      const duration = 1200 + startCameraPos.length() * 30;

      const animateZoom = (now) => {
        let elapsed = now - startTime;
        let progress = Math.min(elapsed / duration, 1);
        
        let easeProgress = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        camera.position.lerpVectors(startCameraPos, zoomTarget, easeProgress);
        controls.target.lerp(worldCenterPos, 0.1);
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

    // 10. Loop de Animação em Câmera Lenta
    let clock = new THREE.Timer();
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      clock.update();
      const elapsedTime = clock.getElapsed();

      if (!zoomTarget) {
        marsMesh.rotation.y += 0.00018;
        atmosfera.rotation.y += 0.00018;

        const pulse = 1 + Math.sin(elapsedTime * 2) * 0.02;
        sunGroup.scale.set(pulse, pulse, pulse);

        const phobosAngle = elapsedTime * 0.18;
        phobosMesh.position.x = Math.cos(phobosAngle) * phobosOrbitRadius;
        phobosMesh.position.z = Math.sin(phobosAngle) * phobosOrbitRadius;
        phobosMesh.rotation.y += 0.002;
        phobosLabel.position.set(phobosMesh.position.x, phobosMesh.position.y + 0.18, phobosMesh.position.z);

        const deimosAngle = elapsedTime * 0.07 + 1.5;
        deimosMesh.position.x = Math.cos(deimosAngle) * deimosOrbitRadius;
        deimosMesh.position.z = Math.sin(deimosAngle) * deimosOrbitRadius;
        deimosMesh.rotation.y += 0.001;
        deimosLabel.position.set(deimosMesh.position.x, deimosMesh.position.y + 0.15, deimosMesh.position.z);
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
      atmosGeo.dispose();
      atmosMat.dispose();
      starsGeo.dispose();
      starsMat.dispose();
      sunCoreGeo.dispose();
      sunCoreMat.dispose();
      innerCoronaGeo.dispose();
      innerCoronaMat.dispose();
      outerCoronaGeo.dispose();
      outerCoronaMat.dispose();
      phobosGeo.dispose();
      phobosMat.dispose();
      deimosGeo.dispose();
      deimosMat.dispose();
    };
  }, []);
  useEffect(() => {
    const controls = controlsRef.current;
    if (controls) {
      controls.rotateSpeed = sensitivity;
      controls.zoomSpeed = sensitivity;
    }
    try {
      localStorage.setItem(SENSITIVITY_KEY, String(sensitivity));
    } catch {
      // navegador sem armazenamento: só não salva
    }
  }, [sensitivity]);
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

      {/* Painel de Telemetria e Alvo com Botão de Fechar */}
      {isHudVisible ? (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto max-w-lg w-[calc(100%-2rem)] px-2">
          <div className="bg-zinc-950/90 backdrop-blur-xl border border-amber-500/40 p-3 sm:p-4 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.15)] flex items-center justify-between space-x-3 sm:space-x-6 relative animate-fade-in">
            
            {/* Botão de Fechar no Canto Superior */}
            <button 
              onClick={() => setIsHudVisible(false)}
              className="absolute -top-2.5 -right-2.5 bg-zinc-900 border border-zinc-700 hover:border-amber-500 text-zinc-400 hover:text-white p-1 rounded-full shadow-lg transition-all duration-200 cursor-pointer"
              title="Ocultar Telemetria"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 animate-pulse" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0"></span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold truncate">Alvo Selecionado: Arcadia Planitia</span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-300 mt-0.5 line-clamp-2">Evidências de gelo subterrâneo detetadas. Pronto para iniciar descida orbital.</p>
            </div>

            <button
              disabled={isAnimating || isLoading}
              onClick={handleDescerClick}
              className="px-3 sm:px-4 py-2 sm:py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center space-x-1 sm:space-x-1.5 active:scale-95 shrink-0 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <span>{isAnimating ? 'A aproximar...' : 'Descer'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Botão para reexibir a telemetria caso tenha sido fechada */
        <button
          onClick={() => setIsHudVisible(true)}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-zinc-950/90 backdrop-blur-md border border-amber-500/40 text-amber-400 rounded-full text-xs font-mono uppercase tracking-widest shadow-xl hover:bg-zinc-900 transition-all duration-300 cursor-pointer flex items-center space-x-2 animate-fade-in"
        >
          <Target className="w-3.5 h-3.5" />
          <span>Exibir Alvo</span>
        </button>
      )}
      {/* CONFIGURAÇÕES DA CÂMERA: Canto Superior Esquerdo */}
      <div className="absolute top-20 left-3 sm:left-6 z-20">
        <button
          onClick={() => setIsSettingsOpen((v) => !v)}
          aria-expanded={isSettingsOpen}
          title="Configurações da câmera"
          className="p-2.5 bg-zinc-950/90 backdrop-blur-md border border-zinc-800 text-zinc-300 hover:text-white hover:border-amber-500/50 rounded shadow-xl transition-colors duration-200 cursor-pointer flex items-center space-x-2 text-xs uppercase tracking-wider font-semibold"
        >
          <Settings2 className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Câmera</span>
        </button>

        {isSettingsOpen && (
          <div className="mt-2 w-60 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 rounded-lg p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="sens" className="text-[11px] font-semibold text-zinc-200 uppercase tracking-wider">
                Sensibilidade
              </label>
              <span className="text-[11px] font-mono text-amber-400 tabular-nums">{sensitivity.toFixed(1)}×</span>
            </div>
            <input
              id="sens"
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
              <span>Lenta</span>
              <span>Rápida</span>
            </div>
            <button
              onClick={() => setSensitivity(1)}
              className="mt-3 w-full text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded py-1.5 cursor-pointer"
            >
              Restaurar padrão
            </button>
          </div>
        )}
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