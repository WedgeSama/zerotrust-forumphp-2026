import { Chart, BarController, BarElement, LinearScale, CategoryScale, Tooltip } from 'chart.js';

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip);

// Source : https://frenchbreaches.com/statistiques, API /api/breach_metrics.php (relevé au 01/10/2026).
// Octobre 2025 est sorti de la fenêtre glissante de l'API : valeur du relevé du 29/09/2026 conservée.
// Fuites de données françaises recensées par mois.
const labels = [
    '10/25', '11/25', '12/25',
    '01/26', '02/26', '03/26', '04/26', '05/26', '06/26',
    '07/26', '08/26', '09/26',
];

const breaches = [13, 26, 42, 91, 90, 71, 81, 98, 105, 119, 131, 165];

const canvas = document.getElementById('fuites-chart') as HTMLCanvasElement | null;

if (canvas) {
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Fuites recensées',
                    data: breaches,
                    backgroundColor: '#1D4ED8',
                },
            ],
        },
        options: {
            responsive: false,
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: context => `${context.formattedValue} fuites`,
                    },
                },
            },
            scales: {
                x: {
                    ticks: { color: '#475569', maxRotation: 0, font: { size: 10 } },
                    grid: { display: false },
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Fuites par mois', color: '#1D4ED8' },
                    ticks: { color: '#475569', precision: 0 },
                    grid: { color: '#E2E8F0' },
                },
            },
        },
    });
}
