"use client";
import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Stage, Html } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { Perf } from "r3f-perf";

const MODEL_EXTENSIONS = [".glb", ".gltf", ".obj", ".stl", ".fbx"];
const ARCHIVE_EXTENSIONS = [".zip", ".rar", ".7z", ".blend"];

function getExtension(url: string) {
    return url.slice(((url.lastIndexOf(".") - 1) >>> 0) + 1).toLowerCase();
}

function ModelContent({ url }: { url: string }) {
    const ext = getExtension(url);

    if (ARCHIVE_EXTENSIONS.includes(ext)) {
        return (
            <Html fullscreen>
                <div className="flex flex-col items-center justify-center w-full h-full">
                    <div className="flex flex-col text-center items-center justify-center text-xs gap-3 w-1/3 text-pretty h-full">
                        <p>This model format is not viewable in the browser. Download below.</p>

                    </div>
                </div>
            </Html>
        );
    }

    if (ext === ".obj") {
        const obj = useLoader(OBJLoader, url);
        obj.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshStandardMaterial({
                    color: "gray",
                    metalness: 0.5,
                    roughness: 0.5,
                });
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        return <primitive object={obj} />;
    }
    if (ext === ".obj") {
        const obj = useLoader(OBJLoader, url);
        return <primitive object={obj} />;
    }
    if (ext === ".stl") {
        const geometry = useLoader(STLLoader, url);
        return (
            <mesh geometry={geometry}>
                <meshStandardMaterial color="gray" />
            </mesh>
        );
    }
    if (ext === ".fbx") {
        const fbx = useLoader(FBXLoader, url);
        return <primitive object={fbx} />;
    }

    return (
        <Html>
            <div className="flex items-center justify-center w-full h-full">
                <p>Unsupported model format: {url}</p>
            </div>
        </Html>
    );
}

export default function ModelViewer({ url }: { url: string }) {
    return (

        <Canvas
            gl={{ preserveDrawingBuffer: true }}
            shadows
            dpr={[1, 1.5]}
            camera={{ position: new THREE.Vector3(0, 0, 150), fov: 50 }}
            className="bg-gradient-to-br from-text/8 to-text/5 dark:bg-black aspect-square h-[100%]"
        >
            <ambientLight intensity={0.25} />
            <directionalLight castShadow position={[5, 5, 5]} intensity={1} />
            {/* <Perf position="top-left" /> */}
            <Suspense fallback={null}>
                <Stage
                    intensity={0}
                    shadows={true}
                    adjustCamera
                    environment="sunset"
                    preset="rembrandt"
                >
                    <ModelContent url={url} />
                </Stage>
            </Suspense>
            <OrbitControls autoRotate />
        </Canvas>
    );
}