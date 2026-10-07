import { createTimeline, utils, type Timeline } from 'animejs';
import deck from '../reveal';

// Animation pas à pas pilotée par les fragments Reveal.
// Chaque fragment [data-anim-step="N"] de la slide déclenche l'étape N :
// en avant, on joue la chorégraphie de l'étape ; en arrière ou à l'arrivée sur la slide,
// on pose directement l'état final de l'étape (pas de chorégraphie à l'envers).

export interface ElementState {
    x?: number;
    y?: number;
    scale?: number;
    opacity?: number;
    text?: string;
    classes?: Record<string, boolean>;
}

// Clé : valeur de data-anim-el dans la scène.
export type StepState = Record<string, ElementState>;

export type Elements = Record<string, HTMLElement>;

export interface Step {
    // État de fin d'étape (seules les propriétés qui changent).
    state: StepState;
    // Chorégraphie jouée en avant, depuis l'état de l'étape précédente.
    play?: (timeline: Timeline, elements: Elements) => void;
}

// Événement fragmentshown / fragmenthidden de Reveal.
type FragmentEvent = Event & { fragment: HTMLElement };

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function registerStepAnimation(name: string, initial: StepState, steps: Step[]): void {
    const stage = document.querySelector<HTMLElement>(`[data-anim="${name}"]`);
    const slide = stage?.closest('section');

    if (!stage || !slide) {
        return;
    }

    const elements: Elements = {};
    stage.querySelectorAll<HTMLElement>('[data-anim-el]').forEach(element => {
        elements[element.dataset.animEl as string] = element;
    });

    // États cumulés : states[0] = état initial, states[N] = après l'étape N.
    const states: StepState[] = [initial];
    steps.forEach((step, index) => {
        const next: StepState = {};
        for (const key of new Set([...Object.keys(states[index]), ...Object.keys(step.state)])) {
            const previous = states[index][key] ?? {};
            const change = step.state[key] ?? {};
            next[key] = {
                ...previous,
                ...change,
                classes: { ...previous.classes, ...change.classes },
            };
        }
        states.push(next);
    });

    let running: Timeline | null = null;

    const applyState = (index: number): void => {
        running?.pause();
        running = null;

        for (const [key, state] of Object.entries(states[index])) {
            const element = elements[key];
            if (!element) {
                continue;
            }

            utils.set(element, {
                x: state.x ?? 0,
                y: state.y ?? 0,
                scale: state.scale ?? 1,
                opacity: state.opacity ?? 1,
            });

            if (state.text !== undefined) {
                element.textContent = state.text;
            }

            for (const [className, enabled] of Object.entries(state.classes ?? {})) {
                element.classList.toggle(className, enabled);
            }
        }
    };

    const stepOf = (fragment: HTMLElement | undefined): number | null => {
        if (!fragment || !slide.contains(fragment) || fragment.dataset.animStep === undefined) {
            return null;
        }

        return Number(fragment.dataset.animStep);
    };

    const currentStep = (): number => {
        let step = 0;
        slide.querySelectorAll<HTMLElement>('.fragment.visible[data-anim-step]').forEach(fragment => {
            step = Math.max(step, Number(fragment.dataset.animStep));
        });

        return step;
    };

    const play = (index: number): void => {
        const step = steps[index - 1];
        applyState(index - 1);

        if (!step?.play || reducedMotion.matches) {
            applyState(index);
            return;
        }

        const timeline = createTimeline({ onComplete: () => applyState(index) });
        step.play(timeline, elements);
        running = timeline;
    };

    deck.on('fragmentshown', (event: Event) => {
        const step = stepOf((event as FragmentEvent).fragment);
        if (step !== null) {
            play(step);
        }
    });

    deck.on('fragmenthidden', (event: Event) => {
        const step = stepOf((event as FragmentEvent).fragment);
        if (step !== null) {
            applyState(step - 1);
        }
    });

    const sync = (): void => {
        if (deck.getCurrentSlide() === slide) {
            applyState(currentStep());
        }
    };

    deck.on('slidechanged', sync);
    deck.on('ready', sync);

    applyState(0);
}
