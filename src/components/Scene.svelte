<script lang="ts" context="module">
type DeviceMotionConstructor = {
	prototype: DeviceMotionEvent;
	new (
		type: string,
		eventInitDict?: DeviceMotionEventInit
	): DeviceMotionEvent;
	requestPermission?(): Promise<"granted" | "denied">;
};

const HAND_ROT_DOWN = Math.PI / 4;
const HAND_POS_DOWN = new Vector3(0, -1.5, 2.75);
const HAND_ROT_UP = Math.PI / -10;
const HAND_POS_UP = new Vector3(1.25, -2.5, 2.75);

const HAND_ZOOM_EXTENT = [-1.25, 1.75];
const HAND_ZOOM_FACTOR = 15;
const HAND_ZOOM_STEP_COUNT = 20;
const HAND_ZOOM_STEP =
	(HAND_ZOOM_EXTENT[1] - HAND_ZOOM_EXTENT[0]) / HAND_ZOOM_STEP_COUNT;

const MIN_HORIZONTAL_ROT = (4 * Math.PI) / 3;
const MAX_HORIZONTAL_ROT = (5 * Math.PI) / 3;
const MIN_VERTICAL_ROT = -Math.PI / 6;
const MAX_VERTICAL_ROT = Math.PI / 6;

const DEVICE_MOTION_SMOOTHING = 30;
</script>

<script lang="ts">
import { createEventDispatcher, onDestroy, onMount } from "svelte";
import {
	AmbientLight,
	DirectionalLight,
	Group,
	LoadingManager,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	SphereGeometry,
	TextureLoader,
	Vector3,
	WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { pinchZoom } from "../pinch";
import { clamp, damp, degToRad } from "../util";

export let animate: boolean = false;

let hasRan: boolean = false;
let isAnimating: boolean = false;

// canvas element for drawing rendered view
let canvas: HTMLCanvasElement = null;
// WebGL rendering engine, used with canvas to draw scene
let renderer: WebGLRenderer = null;

// set aspect ratio of current window
let aspectRatio = window.innerWidth / window.innerHeight;

// set factors for mapping mouse coordinates to camera rotation
let widthFactor = (MAX_HORIZONTAL_ROT - MIN_HORIZONTAL_ROT) / window.innerWidth;
let heightFactor = (MAX_VERTICAL_ROT - MIN_VERTICAL_ROT) / window.innerHeight;

// create event dispatcher for asset load completion
const dispatch = createEventDispatcher();

// create load manager for signaling load completion
const loadingManager = new LoadingManager();
loadingManager.onLoad = onLoad;

// create scene
const scene = new Scene();

// create camera
const camera = new PerspectiveCamera(85, aspectRatio, 0.5, 1500);

// create lighting
const lightGroup = new Group();

const ambientLight = new AmbientLight(0xcccccc);
ambientLight.intensity = 0.75;
lightGroup.add(ambientLight);

const directionalLight = new DirectionalLight(0xffffff, 0.4);
directionalLight.intensity = 0.85;
directionalLight.position.set(2, 1, 1).normalize();
lightGroup.add(directionalLight);

scene.add(lightGroup);

// sphere for equirectangular texture
const geometry = new SphereGeometry(500, 32, 32);
geometry.scale(-1, 1, 1);

// load texture for office
const textureLoader = new TextureLoader(loadingManager);
textureLoader.load(
	"/img/room-rect.png",
	(texture) => {
		const material = new MeshBasicMaterial({ map: texture });
		const mesh = new Mesh(geometry, material);
		scene.add(mesh);
	},
	undefined,
	(err) => {
		console.error(err);
	}
);

// load hand and resume object
let hand: Group = null;

const gltfLoader = new GLTFLoader(loadingManager);
gltfLoader.load(
	"/models/resume-hand.glb",
	(obj) => {
		hand = obj.scene;

		// set initial hand scale, rotation, and position
		hand.scale.set(20, 20, 20);
		hand.rotation.z = HAND_ROT_DOWN;
		hand.position.copy(HAND_POS_DOWN);

		scene.add(hand);
	},
	undefined,
	(err) => {
		console.error(err);
	}
);

// initialize animation targets for camera
const targetBuffer = new Vector3(-1, 0, 0);
const target = new Vector3();
target.copy(targetBuffer);

// initialize animation targets for
const handTargetPos = new Vector3();
handTargetPos.copy(HAND_POS_DOWN);

// target z rotation for animating hand between up and down positions
let handTargetRot = HAND_ROT_DOWN;
let handZoom = 9 * HAND_ZOOM_FACTOR;
let handToggle = false; // is hand lifted to face? default to false

// initialize rotation coordinates for mouse and device
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let lastRotX = (MIN_HORIZONTAL_ROT + MAX_HORIZONTAL_ROT) / 2;
let lastRotY = (MIN_VERTICAL_ROT + MAX_VERTICAL_ROT) / 2;

// initialize window size and orientation
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;
let lastOrientation = 0;

// start or pause animation if animate state changes
$: {
	if (animate !== isAnimating) {
		isAnimating = animate;
		if (isAnimating) {
			run();
		}

		if (!hasRan) {
			addListeners();
			requestDeviceMotion();
			hasRan = true;
		}
	}
}

onMount(() => {
	// add renderer to canvas on mount
	renderer = new WebGLRenderer({
		canvas,
		antialias: true,
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight, false);
});

onDestroy(() => {
	// remove event listeners when canvas is destroyed
	removeListeners();
});

function addListeners() {
	canvas?.addEventListener("click", onClick);
	canvas?.addEventListener("move", onPointerMove);
	canvas?.addEventListener("pinchzoom", onZoom);

	window.addEventListener("wheel", onWheel);
}

function removeListeners() {
	canvas?.removeEventListener("click", onClick);
	canvas?.removeEventListener("move", onPointerMove);

	window.removeEventListener("devicemotion", onTryDeviceMotion);
	window.removeEventListener("devicemotion", onDeviceMotion);
	window.removeEventListener("wheel", onWheel);
}

function requestDeviceMotion() {
	if ("DeviceMotionEvent" in window) {
		const motionEvent = window.DeviceMotionEvent as DeviceMotionConstructor;
		if (
			"requestPermission" in motionEvent &&
			motionEvent.requestPermission instanceof Function
		) {
			motionEvent
				.requestPermission()
				.then((access) => {
					if (access === "granted") {
						window.addEventListener(
							"devicemotion",
							onTryDeviceMotion
						);
					}
				})
				.catch((err) => {
					console.error(err);
				});
		} else {
			window.addEventListener("devicemotion", onTryDeviceMotion);
		}
	}
}

function render() {
	if (renderer) {
		renderer.render(scene, camera);
	}

	if (lastWidth !== window.innerWidth || lastHeight !== window.innerHeight) {
		onResize(window.innerWidth, window.innerHeight);
	}

	lastOrientation = screen?.orientation?.angle;
	if (
		typeof lastOrientation !== "number" &&
		typeof window.orientation === "number"
	) {
		lastOrientation =
			window.orientation < 0
				? window.orientation + 360
				: window.orientation;
	}

	if (hand) {
		// dampen hand rotation by a factor of 0.1, if greater than 0.0001
		hand.rotation.z += damp(handTargetRot - hand.rotation.z, 0.1, 0.0001);

		// calculate number of stepped distances between camera and hand
		const handZoomLevel = handZoom / HAND_ZOOM_FACTOR;

		// get difference between target and current hand positions
		const nextHandPos = new Vector3();
		nextHandPos
			.copy(handTargetPos)
			.add(
				new Vector3(
					HAND_ZOOM_EXTENT[0] + handZoomLevel * HAND_ZOOM_STEP,
					0,
					0
				)
			)
			.sub(hand.position);

		// dampen delta vector by a factor of 0.05, if greater than 0.0001
		nextHandPos.fromArray(
			nextHandPos.toArray().map((v) => damp(v, 0.05, 0.0001))
		);

		hand.position.add(nextHandPos);
	}

	// get difference between buffer and current camera targets
	const nextTarget = new Vector3();
	nextTarget.copy(targetBuffer).sub(target);

	// dampen delta vector by a factor of 0.2, if greater than 0.0001
	nextTarget.fromArray(nextTarget.toArray().map((v) => damp(v, 0.2, 0.0001)));

	target.add(nextTarget);
	camera.lookAt(target);
}

function run() {
	if (isAnimating) {
		requestAnimationFrame(run);
		render();
	}
}

function onClick() {
	handToggle = !handToggle;
	if (handToggle) {
		handTargetPos.copy(HAND_POS_UP);
		handTargetRot = HAND_ROT_UP;
	} else {
		handTargetPos.copy(HAND_POS_DOWN);
		handTargetRot = HAND_ROT_DOWN;
	}
}

function onTryDeviceMotion(event: DeviceMotionEvent) {
	if (
		event.rotationRate?.alpha ||
		event.rotationRate?.beta ||
		event.rotationRate?.gamma
	) {
		canvas?.removeEventListener("move", onPointerMove);
		window.removeEventListener("devicemotion", onTryDeviceMotion);

		window.addEventListener("devicemotion", onDeviceMotion);
	}
}

function getOrientedRotationRates(
	rotationRate: DeviceMotionEventRotationRate,
	orientation: number
): [number, number] {
	// replace undefined values with zero
	const [alpha, beta] = [rotationRate?.alpha, rotationRate?.beta].map(
		(rate) => (rate === undefined || rate === null ? 0 : rate)
	);

	// modify rotation axes based on orientation, increasing in counterclockwise direction
	switch (orientation) {
		case 90:
			return [-beta, alpha];
		case 180:
			return [-alpha, -beta];
		case 270:
			return [beta, -alpha];
		default:
			return [alpha, beta];
	}
}

function onDeviceMotion(event: DeviceMotionEvent) {
	const angles = getOrientedRotationRates(
		event.rotationRate,
		lastOrientation
	);

	for (let i = 0; i < angles.length; i++) {
		if (Math.abs(angles[i]) < 1) {
			// ignore angle deltas less than 1 degree
			angles[i] = 0;
		} else {
			// convert angles to radians and smooth result
			angles[i] = degToRad(angles[i]) / DEVICE_MOTION_SMOOTHING;
		}
	}

	lastRotX = clamp(lastRotX + angles[1], {
		min: MIN_HORIZONTAL_ROT,
		max: MAX_HORIZONTAL_ROT,
	});
	lastRotY = clamp(lastRotY - angles[0], {
		min: MIN_VERTICAL_ROT,
		max: MAX_VERTICAL_ROT,
	});

	// map polar angles to 3D coordinates
	targetBuffer.set(
		Math.sin(lastRotX) * Math.cos(lastRotY),
		Math.sin(lastRotX) * Math.sin(lastRotY),
		Math.cos(lastRotX)
	);
}

function onPointerMove({
	detail: { original: event },
}: CustomEvent<{ original: PointerEvent }>) {
	// set current mouse position
	mouseX = window.innerWidth - event.clientX;
	mouseY = event.clientY;

	// map mouse position on screen to rotation bounds
	const nextRotX = widthFactor * mouseX + MIN_HORIZONTAL_ROT;
	const nextRotY = heightFactor * mouseY + MIN_VERTICAL_ROT;

	// map polar angles to 3D coordinates
	targetBuffer.set(
		Math.sin(nextRotX) * Math.cos(nextRotY),
		Math.sin(nextRotX) * Math.sin(nextRotY),
		Math.cos(nextRotX)
	);
}

function onWheel(event: WheelEvent) {
	let factor = HAND_ZOOM_FACTOR;
	if (event.deltaY > 0) {
		factor *= -1;
	}

	handZoom = clamp(handZoom + factor, {
		min: 0,
		max: HAND_ZOOM_STEP_COUNT * HAND_ZOOM_FACTOR,
	});
}

function onZoom({
	detail: { diff },
}: CustomEvent<{ diff: number; original: PointerEvent }>) {
	handZoom = clamp(handZoom + diff, {
		min: 0,
		max: HAND_ZOOM_STEP_COUNT * HAND_ZOOM_FACTOR,
	});
}

function onLoad() {
	dispatch("load");
}

function onResize(width: number, height: number) {
	// set aspect ratio of current window
	aspectRatio = width / height;

	// set factors for mapping mouse coordinates to camera rotation
	widthFactor = (MAX_HORIZONTAL_ROT - MIN_HORIZONTAL_ROT) / width;
	heightFactor = (MAX_VERTICAL_ROT - MIN_VERTICAL_ROT) / height;

	// update renderer canvas size
	if (renderer) {
		renderer.setSize(width, height, false);
	}

	lastWidth = width;
	lastHeight = height;

	// update camera aspect ratio
	camera.aspect = aspectRatio;
	camera.updateProjectionMatrix();
}
</script>

<canvas
	bind:this="{canvas}"
	class="fixed inset-0 w-screen h-screen"
	use:pinchZoom></canvas>
