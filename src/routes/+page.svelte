<script lang="ts">
	import { MousePointer2 } from 'lucide-svelte';
	import { cubicOut } from 'svelte/easing';
	import { crossfade, fade } from 'svelte/transition';
	import { onDestroy } from 'svelte';

	interface Photo {
		id: number;
		image: string;
		title: string;
		x: string;
		y: string;
		rotate: number;
		serial: string;
	}

	const photos: Photo[] = [
		{
			id: 1,
			image: 'https://picsum.photos/seed/abandoned1/600/600',
			title: 'Sector 4 - Breach',
			x: '10%',
			y: '8%',
			rotate: -14,
			serial: 'SN-49281A'
		},
		{
			id: 2,
			image: 'https://picsum.photos/seed/machine2/600/600',
			title: 'Pump Station',
			x: '40%',
			y: '4%',
			rotate: 8,
			serial: 'SN-99210B'
		},
		{
			id: 3,
			image: 'https://picsum.photos/seed/corridor3/600/600',
			title: 'Level 3 Hallway',
			x: '70%',
			y: '12%',
			rotate: 22,
			serial: 'SN-10293C'
		},
		{
			id: 4,
			image: 'https://picsum.photos/seed/specimen4/600/600',
			title: 'Unknown Biomass',
			x: '8%',
			y: '45%',
			rotate: -6,
			serial: 'SN-55812D'
		},
		{
			id: 5,
			image: 'https://picsum.photos/seed/terminal5/600/600',
			title: 'Mainframe Terminal',
			x: '35%',
			y: '40%',
			rotate: -18,
			serial: 'SN-77382E'
		},
		{
			id: 6,
			image: 'https://picsum.photos/seed/crew6/600/600',
			title: 'Crew Quarters',
			x: '65%',
			y: '50%',
			rotate: 12,
			serial: 'SN-11223F'
		},
		{
			id: 7,
			image: 'https://picsum.photos/seed/airlock7/600/600',
			title: 'Airlock 2',
			x: '82%',
			y: '35%',
			rotate: -8,
			serial: 'SN-44556G'
		},
		{
			id: 8,
			image: 'https://picsum.photos/seed/reactor8/600/600',
			title: 'Reactor Core',
			x: '48%',
			y: '70%',
			rotate: 4,
			serial: 'SN-99887H'
		},
		{
			id: 9,
			image: 'https://picsum.photos/seed/vent9/600/600',
			title: 'Ventilation Shaft',
			x: '20%',
			y: '75%',
			rotate: -25,
			serial: 'SN-33445I'
		},
		{
			id: 10,
			image: 'https://picsum.photos/seed/control10/600/600',
			title: 'Control Room',
			x: '75%',
			y: '72%',
			rotate: 16,
			serial: 'SN-66778J'
		}
	];

	let inspectedId = $state<number | null>(null);
	let hoverOffsets = $state<Record<number, number>>({});
	let hoverId = $state<number | null>(null);
	let rotateX = $state(0);
	let rotateY = $state(0);
	let targetRotateX = 0;
	let targetRotateY = 0;
	let frameId: number | null = null;

	const [send, receive] = crossfade({
		duration: (distance) => Math.min(700, Math.max(250, distance * 0.9)),
		easing: cubicOut,
		fallback: (node) => fade(node, { duration: 250 })
	});

	const inspectedPhoto = $derived(photos.find((photo) => photo.id === inspectedId) ?? null);
	const visiblePhotos = $derived(photos.filter((photo) => photo.id !== inspectedId));

	const stepTilt = () => {
		rotateX += (targetRotateX - rotateX) * 0.18;
		rotateY += (targetRotateY - rotateY) * 0.18;

		if (Math.abs(targetRotateX - rotateX) < 0.05 && Math.abs(targetRotateY - rotateY) < 0.05) {
			rotateX = targetRotateX;
			rotateY = targetRotateY;
			frameId = null;
			return;
		}

		frameId = requestAnimationFrame(stepTilt);
	};

	const ensureTiltAnimation = () => {
		if (frameId !== null) {
			return;
		}
		frameId = requestAnimationFrame(stepTilt);
	};

	const openInspection = (photoId: number) => {
		inspectedId = photoId;
		targetRotateX = 0;
		targetRotateY = 0;
		rotateX = 0;
		rotateY = 0;
	};

	const closeInspection = () => {
		inspectedId = null;
		targetRotateX = 0;
		targetRotateY = 0;
		ensureTiltAnimation();
	};

	const updateHover = (photoId: number) => {
		hoverId = photoId;
		hoverOffsets = {
			...hoverOffsets,
			[photoId]: Math.random() * 4 - 2
		};
	};

	const clearHover = () => {
		hoverId = null;
	};

	const handleBackdropPointerDown = (event: PointerEvent) => {
		if (event.target === event.currentTarget) {
			closeInspection();
		}
	};

	const handlePolaroidPointerMove = (event: PointerEvent) => {
		if (event.buttons !== 1) {
			return;
		}
		targetRotateY += event.movementX * 0.6;
		targetRotateX -= event.movementY * 0.6;
		ensureTiltAnimation();
	};

	onDestroy(() => {
		if (frameId !== null) {
			cancelAnimationFrame(frameId);
		}
	});
</script>

<div
	class="relative min-h-screen overflow-hidden select-none bg-[#1a1a18]"
	style="background-image: radial-gradient(circle at 50% 50%, #2a2a28 0%, #111 100%);"
>
	<div
		class="pointer-events-none absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-30 mix-blend-multiply"
	></div>
	<div
		class="pointer-events-none absolute top-[-20%] left-[-10%] h-[50%] w-[50%] rounded-full bg-orange-900/10 blur-[120px]"
	></div>
	<div
		class="pointer-events-none absolute right-[-10%] bottom-[-20%] h-[60%] w-[60%] rounded-full bg-blue-900/10 blur-[150px]"
	></div>

	<div class="relative h-screen w-full p-8">
		{#each visiblePhotos as photo (photo.id)}
			<button
				type="button"
				aria-label={`Inspect ${photo.title}`}
				class="absolute cursor-pointer border border-black/10 bg-[#f4f4f0] p-3 pb-12 text-left"
				style={`left:${photo.x};top:${photo.y};z-index:${hoverId === photo.id ? 20 : 10};transform:rotate(${photo.rotate + (hoverId === photo.id ? (hoverOffsets[photo.id] ?? 0) : 0)}deg) scale(${hoverId === photo.id ? 1.05 : 1});box-shadow:${hoverId === photo.id ? '4px 8px 25px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.03)' : '2px 4px 15px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,0,0,0.03)'};transition:transform 180ms ease, box-shadow 180ms ease;`}
				onmouseenter={() => updateHover(photo.id)}
				onmouseleave={clearHover}
				onclick={() => openInspection(photo.id)}
				out:send={{ key: photo.id }}
			>
				<div class="relative h-40 w-40 overflow-hidden bg-gray-800 shadow-inner pointer-events-none md:h-48 md:w-48">
					<img
						src={photo.image}
						alt={photo.title}
						class="h-full w-full object-cover brightness-90 contrast-125 sepia-[0.3]"
						referrerpolicy="no-referrer"
					/>
					<div class="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
					<div
						class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-40 mix-blend-screen"
					></div>
				</div>
				<div class="pointer-events-none mt-3 text-center font-handwriting text-xl text-gray-800 opacity-80">
					{photo.title}
				</div>
			</button>
		{/each}
	</div>

	{#if inspectedPhoto}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
			style="perspective:1200px;"
			onpointerdown={handleBackdropPointerDown}
			transition:fade={{ duration: 200 }}
		>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="relative cursor-grab border border-black/10 bg-[#f4f4f0] p-4 pb-16 active:cursor-grabbing"
				style={`transform-style:preserve-3d;transform:rotateX(${rotateX}deg) rotateY(${rotateY}deg);box-shadow:0 30px 60px rgba(0,0,0,0.6), inset 0 0 30px rgba(0,0,0,0.05);`}
				onpointermove={handlePolaroidPointerMove}
				in:receive={{ key: inspectedPhoto.id }}
			>
				<div class="relative z-10" style="backface-visibility:hidden;transform:translateZ(1px);">
					<div class="relative h-72 w-72 overflow-hidden bg-gray-800 shadow-inner pointer-events-none md:h-96 md:w-96">
						<img
							src={inspectedPhoto.image}
							alt={inspectedPhoto.title}
							class="h-full w-full object-cover brightness-90 contrast-125 sepia-[0.3]"
							referrerpolicy="no-referrer"
						/>
						<div class="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
						<div
							class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-40 mix-blend-screen"
						></div>
					</div>
					<div class="pointer-events-none mt-4 text-center font-handwriting text-3xl text-gray-800 opacity-80">
						{inspectedPhoto.title}
					</div>
				</div>

				<div
					class="absolute inset-0 flex items-center justify-center bg-[#ebebe6] p-8"
					style="transform:rotateY(180deg) translateZ(-1px);backface-visibility:hidden;box-shadow:inset 0 0 40px rgba(0,0,0,0.08);"
				>
					<div class="absolute top-4 left-4 h-4 w-12 rotate-[-10deg] bg-yellow-900/10"></div>
					<div class="absolute right-4 bottom-4 h-4 w-16 rotate-[15deg] bg-yellow-900/10"></div>

					<div
						class="transform rounded-sm border border-gray-400/30 bg-gray-100/50 p-2 font-typewriter text-xl text-gray-600 opacity-70 -rotate-6 shadow-inner"
					>
						{inspectedPhoto.serial}
					</div>

					<div
						class="absolute bottom-12 left-8 rotate-3 font-handwriting text-2xl text-gray-500/60 transform"
					>
						Classified.
					</div>
				</div>
			</div>

			<div
				class="pointer-events-none absolute bottom-12 flex flex-col items-center gap-3 font-typewriter text-sm text-white/60"
				transition:fade={{ duration: 350, delay: 250 }}
			>
				<div class="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-md">
					<MousePointer2 size={16} class="animate-pulse" />
					<span>Click and drag to inspect</span>
				</div>
				<span class="text-xs text-white/40">Click outside to close</span>
			</div>
		</div>
	{/if}
</div>
