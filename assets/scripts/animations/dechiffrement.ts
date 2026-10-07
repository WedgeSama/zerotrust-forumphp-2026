import { text } from 'animejs';
import { registerStepAnimation } from './steps';

// Déchiffrement d'une enveloppe (slide 04/09-kms-dechiffrement), suite de enveloppe.ts.
// Source : EnvelopeEncrypter::decrypt() (symfony/symfony, branche 8.2) : l'application envoie la copie
// chiffrée de la clé au KMS (unwrapDataKey), récupère la clé en clair et déchiffre la donnée en local.
// Positions : translations (px) depuis la position de départ définie dans index.scss.

const CLEAR = 'jane@example.com';
const CIPHER = 'AQf3…9Qk=';

registerStepAnimation(
    'dechiffrement',
    {
        // L'enveloppe est en base, comme à la fin de la slide précédente.
        packet: { x: 600, y: 70, scale: 0.78 },
        wrapped: {},
        envelope: {},
        key: { opacity: 0, scale: 0.5 },
        dataText: { text: CIPHER },
        data: { classes: { 'is-cipher': true } },
        master: {},
    },
    [
        {
            // 1. L'application relit l'enveloppe en base.
            state: {
                packet: { x: 0, y: 0, scale: 1 },
            },
            play: (timeline, { packet }) => {
                timeline.add(packet, { x: 0, y: 0, scale: 1, duration: 1000, ease: 'inOutQuad' });
            },
        },
        {
            // 2. Elle envoie la clé chiffrée au KMS.
            state: {
                wrapped: { x: 475, y: -215 },
            },
            play: (timeline, { wrapped }) => {
                timeline.add(wrapped, { x: 475, y: -215, duration: 900, ease: 'inOutQuad' });
            },
        },
        {
            // 3. Le KMS la déchiffre avec la clé principale.
            // La clé principale pulse, comme au chiffrement : c'est elle qui déchiffre la copie.
            state: {
                wrapped: { opacity: 0, scale: 0.5 },
                key: { opacity: 1, scale: 1 },
            },
            play: (timeline, { master, wrapped, key }) => {
                timeline
                    .add(master, { scale: [1, 1.15, 1], duration: 500, ease: 'inOutQuad' })
                    .add(wrapped, { opacity: 0, scale: 0.5, duration: 400, ease: 'inQuad' }, '<<')
                    .add(key, { opacity: [0, 1], scale: [0.5, 1], duration: 400, ease: 'outBack' }, '-=200');
            },
        },
        {
            // 4. Et renvoie la clé en clair à l'application.
            state: {
                key: { x: -475, y: 132 },
            },
            play: (timeline, { key }) => {
                timeline.add(key, { x: -475, y: 132, duration: 900, ease: 'inOutQuad' });
            },
        },
        {
            // 5. L'application déchiffre la donnée, en local.
            state: {
                dataText: { text: CLEAR },
                data: { classes: { 'is-cipher': false } },
            },
            play: (timeline, { data, dataText }) => {
                timeline
                    .call(() => data.classList.remove('is-cipher'))
                    .add(dataText, { innerHTML: text.scrambleText({ text: CLEAR }), duration: 900 }, '<<');
            },
        },
        {
            // 6. La clé en clair est de nouveau effacée.
            state: {
                key: { opacity: 0, scale: 0 },
            },
            play: (timeline, { key }) => {
                timeline.add(key, { opacity: 0, scale: 0, duration: 450, ease: 'inBack' });
            },
        },
        {
            // 7. L'enveloppe est retirée : il ne reste que la donnée en clair.
            state: {
                envelope: { opacity: 0, scale: 1.08 },
            },
            play: (timeline, { envelope }) => {
                timeline.add(envelope, { opacity: 0, scale: 1.08, duration: 600, ease: 'inQuad' });
            },
        },
        {
            // 8. Le KMS n'a vu que la clé, jamais la donnée (légende seule).
            state: {},
        },
    ],
);
