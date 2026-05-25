<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const route = useRoute()

const currentPath = computed(() => String(props.error?.url || route.fullPath || '/'))
const statusCode = computed(() => Number(props.error?.statusCode || 404))
const isAdminRoute = computed(() => currentPath.value.startsWith('/admin'))
const isNotFound = computed(() => statusCode.value === 404)

const label = computed(() => isAdminRoute.value ? 'ÁREA INTERNA · ACESSO RESTRITO' : 'EDIFICIO 118 · CORRE INTERROMPIDO')
const title = computed(() => {
  if (isNotFound.value) return isAdminRoute.value ? 'Essa sala não existe no prédio.' : 'Essa porta não abre mais.'
  return isAdminRoute.value ? 'O painel travou no elevador.' : 'O prédio saiu do eixo.'
})

const description = computed(() => {
  if (isNotFound.value && isAdminRoute.value) {
    return 'A rota que você tentou acessar não faz parte do painel. Pode ser um link digitado errado, um módulo que mudou de lugar ou uma página que foi removida.'
  }

  if (isNotFound.value) {
    return 'A página que você procurou não está nesse andar. Volte para a loja, veja o drop atual ou siga para as peças disponíveis.'
  }

  return 'A aplicação encontrou um erro inesperado. Volte para uma área segura e tente novamente.'
})

const primaryAction = computed(() => {
  if (isAdminRoute.value) {
    return { label: 'Voltar para o painel', to: '/admin' }
  }

  return { label: 'Ver a loja', to: '/produtos' }
})

const secondaryAction = computed(() => {
  if (isAdminRoute.value) {
    return { label: 'Ir para produtos', to: '/admin/produtos' }
  }

  return { label: 'Página inicial', to: '/' }
})

const thirdAction = computed(() => isAdminRoute.value
  ? { label: 'Página inicial', to: '/' }
  : { label: 'Drop atual', to: '/produtos' }
)

function goTo(path: string) {
  return clearError({ redirect: path })
}
</script>

<template>
  <main class="e-error-page" :class="{ 'is-admin': isAdminRoute }">
    <div class="e-error-grid" aria-hidden="true" />
    <div class="e-error-noise" aria-hidden="true" />
    <div class="e-error-beam e-error-beam-one" aria-hidden="true" />
    <div class="e-error-beam e-error-beam-two" aria-hidden="true" />

    <section class="e-error-shell" aria-labelledby="error-title">
      <div class="e-error-poster" aria-hidden="true">
        <div class="e-error-building">
          <span v-for="windowIndex in 18" :key="windowIndex" />
        </div>
        <div class="e-error-number">
          {{ statusCode }}
        </div>
        <div class="e-error-tape">
          <span>ROTA BLOQUEADA</span>
          <span>ROTA BLOQUEADA</span>
          <span>ROTA BLOQUEADA</span>
        </div>
      </div>

      <div class="e-error-content">
        <p class="e-error-kicker">
          {{ label }}
        </p>

        <h1 id="error-title">
          {{ title }}
        </h1>

        <p class="e-error-description">
          {{ description }}
        </p>

        <div class="e-error-path" aria-label="Rota acessada">
          <span>Última placa encontrada</span>
          <strong>{{ currentPath }}</strong>
        </div>

        <div class="e-error-actions">
          <button type="button" class="e-error-button primary" @click="goTo(primaryAction.to)">
            {{ primaryAction.label }}
          </button>

          <button type="button" class="e-error-button secondary" @click="goTo(secondaryAction.to)">
            {{ secondaryAction.label }}
          </button>

          <button type="button" class="e-error-button ghost" @click="goTo(thirdAction.to)">
            {{ thirdAction.label }}
          </button>
        </div>

        <div class="e-error-hint">
          <span />
          <p>
            Dica: confira se o endereço foi digitado certo. No admin, use o menu lateral em vez de montar a rota na mão.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.e-error-page {
  --e-bg: #070707;
  --e-bg-soft: #0d0d0d;
  --e-panel: #151515;
  --e-text: #f2ede3;
  --e-muted: #b9b0a3;
  --e-faint: #776f64;
  --e-line: rgba(242, 237, 227, 0.14);
  --e-acid: var(--drop-accent, #d6ff2f);
  --e-wine: #8e1b1b;
  --e-shadow: rgba(0, 0, 0, 0.48);

  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: grid;
  place-items: center;
  padding: clamp(2rem, 5vw, 5rem) 1rem;
  color: var(--e-text);
  background:
    radial-gradient(circle at 12% 8%, rgba(142, 27, 27, 0.42), transparent 26rem),
    radial-gradient(circle at 88% 18%, color-mix(in srgb, var(--e-acid) 16%, transparent), transparent 24rem),
    linear-gradient(135deg, #050505 0%, #10100e 54%, #070707 100%);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.e-error-page.is-admin {
  --e-acid: #d6ff2f;
}

.e-error-grid,
.e-error-noise,
.e-error-beam {
  position: absolute;
  pointer-events: none;
}

.e-error-grid {
  inset: 0;
  opacity: 0.18;
  background-image:
    linear-gradient(rgba(242, 237, 227, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(242, 237, 227, 0.08) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, black, transparent 86%);
}

.e-error-noise {
  inset: 0;
  opacity: 0.08;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.8'/%3E%3C/svg%3E");
}

.e-error-beam {
  width: 34rem;
  height: 34rem;
  border-radius: 999px;
  filter: blur(18px);
  opacity: 0.38;
}

.e-error-beam-one {
  left: -14rem;
  bottom: -16rem;
  background: rgba(142, 27, 27, 0.52);
}

.e-error-beam-two {
  right: -16rem;
  top: -18rem;
  background: color-mix(in srgb, var(--e-acid) 22%, transparent);
}

.e-error-shell {
  position: relative;
  z-index: 1;
  width: min(1120px, 100%);
  display: grid;
  grid-template-columns: minmax(260px, 0.78fr) minmax(0, 1.22fr);
  gap: clamp(1rem, 4vw, 2rem);
  align-items: stretch;
}

.e-error-poster,
.e-error-content {
  border: 1px solid var(--e-line);
  box-shadow: 0 2rem 5.5rem var(--e-shadow);
  backdrop-filter: blur(18px);
}

.e-error-poster {
  position: relative;
  min-height: 620px;
  overflow: hidden;
  display: grid;
  align-content: end;
  border-radius: 2rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.01)),
    rgba(14, 14, 14, 0.82);
}

.e-error-building {
  position: absolute;
  inset: 2rem 2rem 7rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
  padding: 2rem 1.2rem 1.2rem;
  border: 1px solid rgba(242, 237, 227, 0.14);
  border-bottom: 0;
  background:
    linear-gradient(180deg, rgba(242, 237, 227, 0.05), transparent),
    rgba(7, 7, 7, 0.62);
  clip-path: polygon(0 14%, 50% 0, 100% 14%, 100% 100%, 0 100%);
}

.e-error-building span {
  min-height: 2.15rem;
  border: 1px solid rgba(242, 237, 227, 0.13);
  border-radius: 0.35rem;
  background: rgba(242, 237, 227, 0.035);
}

.e-error-building span:nth-child(4n),
.e-error-building span:nth-child(9),
.e-error-building span:nth-child(14) {
  background: color-mix(in srgb, var(--e-acid) 46%, rgba(242, 237, 227, 0.04));
  box-shadow: 0 0 2rem color-mix(in srgb, var(--e-acid) 24%, transparent);
}

.e-error-number {
  position: relative;
  z-index: 1;
  padding: 0 1.45rem 2.4rem;
  color: var(--e-acid);
  font-size: clamp(6rem, 18vw, 13rem);
  font-weight: 950;
  line-height: 0.74;
  letter-spacing: -0.13em;
  text-shadow: 0 0 2rem color-mix(in srgb, var(--e-acid) 28%, transparent);
}

.e-error-tape {
  position: absolute;
  left: -14%;
  right: -14%;
  bottom: 8.2rem;
  z-index: 2;
  display: flex;
  gap: 1.2rem;
  justify-content: center;
  padding: 0.78rem 0;
  transform: rotate(-8deg);
  border-block: 1px solid rgba(7, 7, 7, 0.72);
  color: #070707;
  background: var(--e-acid);
  font-size: 0.76rem;
  font-weight: 950;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  white-space: nowrap;
}

.e-error-content {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 620px;
  padding: clamp(2rem, 6vw, 4.5rem);
  border-radius: 2rem;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.018)),
    rgba(10, 10, 10, 0.82);
}

.e-error-content::before {
  content: "118";
  position: absolute;
  right: -0.3em;
  top: -0.3em;
  color: rgba(242, 237, 227, 0.035);
  font-size: clamp(9rem, 24vw, 19rem);
  font-weight: 950;
  letter-spacing: -0.14em;
  line-height: 1;
}

.e-error-kicker {
  position: relative;
  z-index: 1;
  width: fit-content;
  margin: 0 0 1.15rem;
  padding: 0.48rem 0.78rem;
  border: 1px solid color-mix(in srgb, var(--e-acid) 55%, transparent);
  border-radius: 999px;
  color: var(--e-acid);
  background: color-mix(in srgb, var(--e-acid) 9%, transparent);
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.e-error-content h1 {
  position: relative;
  z-index: 1;
  max-width: 11ch;
  margin: 0;
  font-size: clamp(3.2rem, 9vw, 7.2rem);
  font-weight: 950;
  line-height: 0.82;
  letter-spacing: -0.09em;
  text-transform: uppercase;
}

.e-error-description {
  position: relative;
  z-index: 1;
  max-width: 62ch;
  margin: 1.35rem 0 0;
  color: var(--e-muted);
  font-size: clamp(1rem, 2vw, 1.12rem);
  line-height: 1.75;
}

.e-error-path {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 0.45rem;
  margin-top: 1.5rem;
  padding: 1rem;
  border: 1px dashed color-mix(in srgb, var(--e-acid) 38%, var(--e-line));
  border-radius: 1.2rem;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--e-acid) 8%, transparent), transparent),
    rgba(255, 255, 255, 0.045);
}

.e-error-path span {
  color: var(--e-faint);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.e-error-path strong {
  overflow-wrap: anywhere;
  color: var(--e-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.95rem;
}

.e-error-actions {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1.7rem;
}

.e-error-button {
  min-height: 3rem;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.85rem 1.12rem;
  font: inherit;
  font-size: 0.76rem;
  font-weight: 950;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}

.e-error-button:hover {
  transform: translateY(-2px);
}

.e-error-button.primary {
  color: #070707;
  background: var(--e-acid);
  box-shadow: 0 1rem 2.5rem color-mix(in srgb, var(--e-acid) 18%, transparent);
}

.e-error-button.secondary {
  color: var(--e-text);
  border-color: var(--e-line);
  background: rgba(255, 255, 255, 0.07);
}

.e-error-button.ghost {
  color: var(--e-muted);
  border-color: rgba(242, 237, 227, 0.08);
  background: transparent;
}

.e-error-hint {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  margin-top: 1.35rem;
  color: var(--e-faint);
  font-size: 0.88rem;
  line-height: 1.55;
}

.e-error-hint span {
  flex: 0 0 auto;
  width: 0.68rem;
  height: 0.68rem;
  margin-top: 0.38rem;
  border-radius: 999px;
  background: var(--e-acid);
  box-shadow: 0 0 1.4rem color-mix(in srgb, var(--e-acid) 44%, transparent);
}

.e-error-hint p {
  margin: 0;
}

@media (max-width: 860px) {
  .e-error-shell {
    grid-template-columns: 1fr;
  }

  .e-error-poster,
  .e-error-content {
    min-height: auto;
  }

  .e-error-poster {
    min-height: 330px;
  }

  .e-error-building {
    inset: 1.2rem 1.2rem 4.8rem;
    grid-template-columns: repeat(6, 1fr);
    padding-top: 1.4rem;
  }

  .e-error-building span {
    min-height: 1.4rem;
  }

  .e-error-number {
    padding-bottom: 1.2rem;
    font-size: clamp(5rem, 28vw, 10rem);
  }

  .e-error-tape {
    bottom: 5.1rem;
  }
}

@media (max-width: 560px) {
  .e-error-page {
    padding: 1rem;
  }

  .e-error-poster,
  .e-error-content {
    border-radius: 1.35rem;
  }

  .e-error-content {
    padding: 1.35rem;
  }

  .e-error-content h1 {
    font-size: clamp(2.65rem, 17vw, 4rem);
  }

  .e-error-actions {
    display: grid;
  }

  .e-error-button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .e-error-button {
    transition: none;
  }

  .e-error-button:hover {
    transform: none;
  }
}
</style>
