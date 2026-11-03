import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';
const Globe = ({ isMobile }) => {
    const sphereRef = useRef(null);
    const targetRotation = useRef({ x: 0, y: 0 });
    useFrame((state, delta) => {
        if (sphereRef.current) {
            // Base rotation over time
            const timeRotationX = state.clock.getElapsedTime() * 0.08;
            const timeRotationY = state.clock.getElapsedTime() * 0.12;
            // Interactive rotation based on mouse pointer
            targetRotation.current.x = (state.pointer.y * Math.PI) / 6;
            targetRotation.current.y = (state.pointer.x * Math.PI) / 6;
            // Smoothly interpolate current rotation towards target rotation
            sphereRef.current.rotation.x = THREE.MathUtils.lerp(sphereRef.current.rotation.x, timeRotationX + targetRotation.current.x, Math.min(delta * 2, 0.1));
            sphereRef.current.rotation.y = THREE.MathUtils.lerp(sphereRef.current.rotation.y, timeRotationY + targetRotation.current.y, Math.min(delta * 2, 0.1));
        }
    });
    return (<Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
      {/* Outer Wireframe Distort Sphere */}
      <Sphere ref={sphereRef} args={[1, isMobile ? 16 : 24, isMobile ? 16 : 24]} scale={1.4}>
        <MeshDistortMaterial color="#06b6d4" // Cyan
     attach="material" distort={0.35} speed={1.5} roughness={0.3} metalness={0.8} wireframe={true} emissive="#3b82f6" // Blue
     emissiveIntensity={0.4}/>
      </Sphere>
      
      {/* Inner Core */}
      <Sphere args={[0.75, 16, 16]}>
        <meshStandardMaterial color="#1e3a8a" roughness={0.2} metalness={0.9} emissive="#06b6d4" emissiveIntensity={0.25}/>
      </Sphere>

      {/* Sparkles Particle Field — disabled on mobile to reduce main-thread work */}
      {!isMobile && (<Sparkles count={40} scale={3.5} size={2} speed={0.3} opacity={0.4} color="#38bdf8"/>)}
    </Float>);
};
export const HeroGlobe3D = () => {
    const containerRef = useRef(null);
    const [isInView, setIsInView] = useState(true);
    const [isTabActive, setIsTabActive] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        // Check mobile screen width
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile, { passive: true });
        // IntersectionObserver to pause rendering when scrolled out of viewport
        const observer = new IntersectionObserver(([entry]) => {
            setIsInView(entry.isIntersecting);
        }, { rootMargin: '100px', threshold: 0.05 });
        if (containerRef.current) {
            observer.observe(containerRef.current);
        }
        // Visibility change listener to pause rendering when tab is inactive
        const handleVisibilityChange = () => {
            setIsTabActive(!document.hidden);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.removeEventListener('resize', checkMobile);
            observer.disconnect();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
    const shouldRender = isInView && isTabActive;
    return (<div ref={containerRef} className="absolute inset-0 -z-10 w-full h-full pointer-events-none opacity-50 transition-opacity duration-1000" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} dpr={[1, isMobile ? 1 : 1.5]} frameloop={shouldRender ? 'always' : 'never'} gl={{
            powerPreference: 'low-power',
            antialias: false,
            alpha: true,
            preserveDrawingBuffer: false,
        }}>
        <ambientLight intensity={0.6}/>
        <directionalLight position={[10, 10, 5]} intensity={0.8}/>
        <pointLight position={[-10, -10, -5]} color="#06b6d4" intensity={1.5}/>
        <Globe isMobile={isMobile}/>
      </Canvas>
    </div>);
};
export default HeroGlobe3D;
