import { text } from 'animejs';
import { registerStepAnimation } from './steps';

// Blind index (slide 05/06-blind-index).
// Source : docblock de BlindIndex (symfony/symfony, branche 8.2, lu le 28/09/2026) : le chiffrement
// est aléatoire, donc on range à côté une empreinte à clé de la valeur, égale pour des valeurs égales,
// et on cherche sur cette empreinte. Valeurs chiffrées et empreintes illustratives.
// Positions : translations (px) depuis la position de départ définie dans index.scss.

const CLEAR = 'jane@example.com';
const CIPHER = 'Qr7b…Vn4=';

// Cellules email / email_index de la 3e ligne de la table.
const CELL_EMAIL = { x: 390, y: 85 };
const CELL_INDEX = { x: 550, y: 169 };

registerStepAnimation(
    'blind-index',
    {
        indexKey: {},
        value: { opacity: 0, scale: 0.9 },
        search: { opacity: 0, scale: 0.9 },
        cipher: { opacity: 0, classes: { 'is-cipher': false } },
        cipherText: { text: CLEAR },
        tag: { opacity: 0, scale: 0.5 },
        searchTag: { opacity: 0, scale: 0.5 },
        match: { classes: { 'is-match': false } },
    },
    [
        {
            // 1. On enregistre jane@example.com.
            state: {
                value: { opacity: 1, scale: 1 },
            },
            play: (timeline, { value }) => {
                timeline.add(value, { opacity: [0, 1], scale: [0.9, 1], duration: 400, ease: 'outBack' });
            },
        },
        {
            // 2. Chiffrée, elle part dans email : illisible.
            state: {
                cipher: { opacity: 1, ...CELL_EMAIL, classes: { 'is-cipher': true } },
                cipherText: { text: CIPHER },
            },
            play: (timeline, { cipher, cipherText }) => {
                timeline
                    .add(cipher, { opacity: [0, 1], duration: 300 })
                    .call(() => cipher.classList.add('is-cipher'))
                    .add(cipherText, { innerHTML: text.scrambleText({ text: CIPHER }), duration: 700 }, '<<')
                    .add(cipher, { ...CELL_EMAIL, duration: 800, ease: 'inOutQuad' });
            },
        },
        {
            // 3. À côté, son empreinte, calculée avec la clé d'index.
            state: {
                tag: { opacity: 1, scale: 1, ...CELL_INDEX },
            },
            play: (timeline, { indexKey, tag }) => {
                timeline
                    .add(indexKey, { scale: [1, 1.15, 1], duration: 500, ease: 'inOutQuad' })
                    .add(tag, { opacity: [0, 1], scale: [0.5, 1], duration: 400, ease: 'outBack' }, '-=200')
                    .add(tag, { ...CELL_INDEX, duration: 800, ease: 'inOutQuad' }, '+=100');
            },
        },
        {
            // 4. Plus tard, on cherche jane@example.com.
            state: {
                value: { opacity: 0 },
                search: { opacity: 1, scale: 1 },
            },
            play: (timeline, { value, search }) => {
                timeline
                    .add(value, { opacity: 0, duration: 300 })
                    .add(search, { opacity: [0, 1], scale: [0.9, 1], duration: 400, ease: 'outBack' });
            },
        },
        {
            // 5. Même valeur, même clé : même empreinte.
            state: {
                searchTag: { opacity: 1, scale: 1 },
            },
            play: (timeline, { indexKey, searchTag }) => {
                timeline
                    .add(indexKey, { scale: [1, 1.15, 1], duration: 500, ease: 'inOutQuad' })
                    .add(searchTag, { opacity: [0, 1], scale: [0.5, 1], duration: 400, ease: 'outBack' }, '-=200');
            },
        },
        {
            // 6. PostgreSQL compare les empreintes : ligne trouvée.
            state: {
                searchTag: { ...CELL_INDEX, opacity: 0 },
                match: { classes: { 'is-match': true } },
            },
            play: (timeline, { searchTag, match }) => {
                timeline
                    .add(searchTag, { ...CELL_INDEX, duration: 800, ease: 'inOutQuad' })
                    .add(searchTag, { opacity: 0, duration: 300 })
                    .call(() => match.classList.add('is-match'), '<<');
            },
        },
        {
            // 7. La base n'a jamais vu l'email en clair.
            state: {},
        },
    ],
);
