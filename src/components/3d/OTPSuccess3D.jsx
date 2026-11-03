import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
const Checkmark = () => {
    const groupRef = useRef(null);
    const ringRef = useRef(null);
    const targetRotation = useRef({ x: 0, y: 0 });
    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();
        if (groupRef.current) {
            // Intro animation: scale up and rotate
            const scale = Math.min(1, time * 1.5);
            groupRef.current.scale.set(scale, scale, scale);
            // Interactive rotation based on mouse pointer
            targetRotation.current.x = (state.pointer.y * Math.PI) / 6; // Tilt up/down
            targetRotation.current.y = (state.pointer.x * Math.PI) / 6; // Tilt left/right
            // Smoothly interpolate current rotation towards target rotation + base rotation
            const baseRotationY = Math.sin(time * 0.5) * 0.2;
            const baseRotationZ = Math.sin(time * 0.3) * 0.1;
            groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotation.current.x, 3 * delta);
            groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, baseRotationY + targetRotation.current.y, 3 * delta);
            groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, baseRotationZ, 3 * delta);
        }
        if (ringRef.current) {
            ringRef.current.rotation.z = time * 2;
        }
    });
    return (<group ref={groupRef}>
      <Float speed={3} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Outer Ring */}
        <mesh ref={ringRef} position={[0, 0, 0]}>
          <torusGeometry args={[1.2, 0.05, 16, 100]}/>
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={1} toneMapped={false}/>
        </mesh>

        {/* Shield/Check body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[1, 1, 0.2, 32]}/>
          <meshPhysicalMaterial color="#059669" metalness={0.9} roughness={0.1} transmission={0.5} thickness={0.5} emissive="#047857" emissiveIntensity={0.5}/>
        </mesh>

        {/* Inner glow core */}
        <mesh position={[0, 0, 0.1]}>
          <sphereGeometry args={[0.5, 32, 32]}/>
          <meshBasicMaterial color="#34d399"/>
        </mesh>

        <Sparkles count={50} scale={3} size={3} speed={1} color="#6ee7b7" opacity={0.8}/>
      </Float>
    </group>);
};
export const OTPSuccess3D = () => {
    return (<div className="w-full h-[300px] relative">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.5}/>
        <spotLight position={[5, 5, 5]} angle={0.15} penumbra={1} intensity={2} color="#10b981"/>
        <pointLight position={[-5, -5, -5]} intensity={1} color="#3b82f6"/>
        
        <Checkmark />
        
        <Environment preset="city"/>
        <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4}/>
      </Canvas>
    </div>);
};
export default OTPSuccess3D;
