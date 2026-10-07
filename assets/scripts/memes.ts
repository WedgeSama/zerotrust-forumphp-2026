import deck from './reveal';

// Memes animés à nombre de boucles limité (ex. questions.webp, 3 boucles) :
// Reveal charge les images au démarrage, l'animation serait finie avant d'arriver sur la slide.
// À chaque affichage, on recharge les <img data-replay> de la slide courante pour la rejouer depuis le début.
const replay = (): void => {
    const slide = deck.getCurrentSlide() as HTMLElement | undefined;

    slide?.querySelectorAll<HTMLImageElement>('img[data-replay]').forEach(img => {
        const src = img.getAttribute('src') ?? '';
        img.src = `${src.split('?')[0]}?replay=${Date.now()}`;
    });
};

deck.on('slidechanged', replay);
deck.on('ready', replay);
