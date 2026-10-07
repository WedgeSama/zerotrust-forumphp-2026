import { text } from 'animejs';
import { registerStepAnimation } from './steps';

// Chiffrement par enveloppe (slide 04/08-kms-enveloppe).
// Sources : https://symfony.com/blog/new-in-symfony-8-2-keymanagement-component (lu le 25/09/2026)
// et la doc du composant (symfony-docs #22280) : le KMS fournit une clé de données et sa copie chiffrée,
// l'application chiffre en local, garde la clé chiffrée dans l'enveloppe et oublie la clé en clair.
// Positions : translations (px) depuis la position de départ définie dans index.scss.

const CLEAR = 'jane@example.com';
const CIPHER = 'AQf3…9Qk=';

registerStepAnimation(
    'enveloppe',
    {
        key: { opacity: 0, scale: 0.5 },
        wrapped: { opacity: 0, scale: 0.5 },
        dataText: { text: CLEAR },
        data: { classes: { 'is-cipher': false } },
        envelope: { opacity: 0, scale: 0.9 },
        packet: {},
        master: {},
    },
    [
        {
            // 1. Une clé de données, et sa copie chiffrée par le KMS.
            // AWS et Vault génèrent la clé ; Azure, Google Cloud et les backends locaux la tirent
            // dans l'application (random_bytes) et le KMS la chiffre. Dans tous les cas, l'application
            // repart avec la clé en clair et sa copie chiffrée (generateDataKey des bridges, 8.2).
            // La clé principale pulse : c'est elle qui chiffre la copie.
            state: {
                key: { opacity: 1, scale: 1 },
                wrapped: { opacity: 1, scale: 1 },
            },
            play: (timeline, { master, key, wrapped }) => {
                timeline
                    .add(master, { scale: [1, 1.15, 1], duration: 500, ease: 'inOutQuad' })
                    .add([key, wrapped], { opacity: [0, 1], scale: [0.5, 1], duration: 400, ease: 'outBack' }, '-=200');
            },
        },
        {
            // 2. L'application récupère les deux.
            state: {
                key: { x: -560, y: 30 },
                wrapped: { x: -380, y: -20 },
            },
            play: (timeline, { key, wrapped }) => {
                timeline
                    .add(key, { x: -560, y: 30, duration: 800, ease: 'inOutQuad' })
                    .add(wrapped, { x: -380, y: -20, duration: 800, ease: 'inOutQuad' }, '<<+=120');
            },
        },
        {
            // 3. L'application chiffre la donnée, en local.
            state: {
                key: { x: -475, y: 132 },
                dataText: { text: CIPHER },
                data: { classes: { 'is-cipher': true } },
            },
            play: (timeline, { key, data, dataText }) => {
                timeline
                    .add(key, { x: -475, y: 132, duration: 600, ease: 'inOutQuad' })
                    .call(() => data.classList.add('is-cipher'), '+=100')
                    .add(dataText, { innerHTML: text.scrambleText({ text: CIPHER }), duration: 900 }, '<<');
            },
        },
        {
            // 4. La clé en clair est effacée.
            state: {
                key: { opacity: 0, scale: 0 },
            },
            play: (timeline, { key }) => {
                timeline.add(key, { opacity: 0, scale: 0, duration: 450, ease: 'inBack' });
            },
        },
        {
            // 5. Donnée chiffrée + clé chiffrée : l'enveloppe.
            state: {
                wrapped: { x: -475, y: 165 },
                envelope: { opacity: 1, scale: 1 },
            },
            play: (timeline, { wrapped, envelope }) => {
                timeline
                    .add(wrapped, { x: -475, y: 165, duration: 700, ease: 'inOutQuad' })
                    .add(envelope, { opacity: [0, 1], scale: [0.9, 1], duration: 500, ease: 'outBack' }, '+=100');
            },
        },
        {
            // 6. L'enveloppe part en base.
            state: {
                packet: { x: 600, y: 70, scale: 0.78 },
            },
            play: (timeline, { packet }) => {
                timeline.add(packet, { x: 600, y: 70, scale: 0.78, duration: 1000, ease: 'inOutQuad' });
            },
        },
    ],
);
