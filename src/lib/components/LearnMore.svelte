<script lang="ts">
  import { createEventDispatcher } from "svelte";

  export let eyebrow = "Introducing";
  export let title = "Discover what JobPostScore can do";
  export let description = "Understand our process, philosophy, and how we elevate your job postings for modern hiring teams.";
  export let ctaLabel = "Learn More";
  export let destination = "/learn-more";
  export let heightClass = "min-h-[420px]";
  export let backgroundImage = "";
  export let backgroundVideo = "";
  export let backgroundClass = "bg-slate-900";
  export let overlayClass = "bg-black/55";
  export let backgroundPlaybackRate = 1;

  const dispatch = createEventDispatcher();

  let videoElement: HTMLVideoElement | null = null;

  $: if (videoElement) {
    videoElement.playbackRate = backgroundPlaybackRate;
  }

  const handleClose = () => {
    dispatch("close");
  };
</script>

<div class={`relative overflow-hidden rounded-2xl ${heightClass} flex items-center justify-center`}>
  {#if backgroundImage}
    <img
      src={backgroundImage}
      alt=""
      class="absolute inset-0 h-full w-full object-cover"
      loading="lazy" />
  {:else if backgroundVideo}
    <video
      class="absolute inset-0 h-full w-full object-cover"
      autoplay
      muted
      loop
      playsinline
      bind:this={videoElement}
      poster={backgroundImage || undefined}>
      <source src={backgroundVideo} type="video/mp4" />
    </video>
  {:else}
    <div class={`absolute inset-0 ${backgroundClass}`}></div>
  {/if}

  <div class={`absolute inset-0 ${overlayClass}`}></div>

  <button
    class="absolute right-8 top-8 inline-flex items-center justify-center rounded-2xl py-2 px-4 bg-white/20 text-white/50 transition hover:scale-105 hover:bg-white/40 text-sm"
    type="button"
    aria-label="Close"
    on:click={handleClose}>
    Close
  </button>

  <div class="relative z-10 flex w-full max-w-3xl flex-col items-center justify-center gap-10 px-6 py-12 text-center text-white sm:px-10">
    <div class="space-y-4 lg:max-w-3xl">
      <slot name="header">
        {#if eyebrow}
          <p class="text-xs uppercase tracking-[0.28em] text-white/70">{eyebrow}</p>
        {/if}

        {#if title}
          <h2 class="text-2xl sm:text-4xl font-aeonik tracking-wide">{title}</h2>
        {/if}

        {#if description}
          <p class="text-base text-white/80 sm:text-lg">{description}</p>
        {/if}
      </slot>

      <slot name="body"></slot>
    </div>

    <div class="flex items-center justify-center gap-4">
      <slot name="cta">
        <a
          class="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm  text-slate-900 transition hover:bg-white/90"
          href={destination}>
          {ctaLabel}
        </a>
      </slot>

      <slot name="actions"></slot>
    </div>
  </div>
</div>
