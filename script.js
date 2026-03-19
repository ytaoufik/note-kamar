// Variables globales
const noteInputs = document.querySelectorAll('.note-input');
const calculateBtn = document.getElementById('calculateBtn');
const printBtn = document.getElementById('printBtn');
const averageDisplay = document.getElementById('average');
const resultBanner = document.getElementById('resultBanner');
const resultStatus = document.getElementById('resultStatus');

// Noms des modules
const modules = [
    'M01: Droit de la famille',
    'M02: Droit social',
    'M03: Droit pénal spécial',
    'M04: Finances publiques',
    'M05: L\'action administrative',
    'M06: Langue étrangère (français)',
    'M07: Responsabilité civile'
];

// Événement au clic du bouton Calculer
calculateBtn.addEventListener('click', calculerMoyenne);

// Événement pour le bouton Imprimer
printBtn.addEventListener('click', imprimerReclamation);

// Calculer automatiquement lors de la saisie
noteInputs.forEach(input => {
    input.addEventListener('change', calculerMoyenne);
    input.addEventListener('keyup', () => {
        // Validation en temps réel
        let value = input.value;
        if (value !== '' && value !== '-') {
            if (isNaN(value) || value < 0 || value > 20) {
                input.style.borderColor = '#f44336';
                input.title = 'Veuillez entrer une note entre 0 et 20';
            } else {
                input.style.borderColor = '#ddd';
                input.title = '';
            }
        }
    });
});

/**
 * Fonction pour calculer la moyenne du semestre
 */
function calculerMoyenne() {
    // Récupérer uniquement les notes ordinaires (pas rattrapage)
    const notesOrdinaires = [];
    
    const orderedInputs = document.querySelectorAll('input[data-module]:not([data-module*="rattrapage"])');
    
    orderedInputs.forEach((input, index) => {
        const value = parseFloat(input.value);
        
        // Si la note est valide, l'ajouter
        if (!isNaN(value) && value >= 0 && value <= 20) {
            notesOrdinaires.push(value);
        }
    });

    // Calculer la moyenne
    let moyenne = 0;
    if (notesOrdinaires.length > 0) {
        moyenne = (notesOrdinaires.reduce((a, b) => a + b, 0) / notesOrdinaires.length).toFixed(2);
    }

    // Afficher la moyenne
    if (notesOrdinaires.length === 0) {
        averageDisplay.textContent = '-';
        averageDisplay.style.color = '#87CEEB';
        resultStatus.textContent = 'En attente';
        resultBanner.className = 'result-banner';
    } else {
        averageDisplay.textContent = moyenne;
        
        // Déterminer le statut (Admis/Ajourné)
        const admis = moyenne >= 10;
        
        if (admis) {
            averageDisplay.style.color = '#4CAF50';
            resultStatus.textContent = '✓ ADMIS';
            resultBanner.className = 'result-banner admis';
        } else {
            averageDisplay.style.color = '#f44336';
            resultStatus.textContent = '✗ AJOURNÉ';
            resultBanner.className = 'result-banner ajourn';
        }

        // Animation légère
        averageDisplay.style.animation = 'pulse 0.6s ease';
        setTimeout(() => {
            averageDisplay.style.animation = 'none';
        }, 600);
    }
}

/**
 * Fonction pour imprimer/télécharger le relevé
 */
function imprimerReclamation() {
    // Préparer le contenu à imprimer
    const contentToPrint = document.querySelector('.container').innerHTML;
    
    // Créer une nouvelle fenêtre
    const printWindow = window.open('', '', 'width=800, height=600');
    
    // Ajouter le CSS et le contenu
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Relevé de Notes</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Roboto', 'Arial', sans-serif;
                    background-color: white;
                    color: #333;
                }
                .container {
                    padding: 20px;
                }
                .header-banner {
                    background: linear-gradient(135deg, #87CEEB 0%, #87CEEB 100%);
                    color: white;
                    padding: 25px;
                    text-align: center;
                    margin-bottom: 25px;
                    border-radius: 8px;
                }
                .header-banner h1 {
                    font-size: 24px;
                    font-weight: 600;
                    letter-spacing: 1px;
                }
                .main-content {
                    padding: 0;
                }
                .main-content h2 {
                    color: #333;
                    font-size: 18px;
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                .table-wrapper {
                    margin-bottom: 25px;
                    overflow: hidden;
                }
                .notes-table {
                    width: 100%;
                    border-collapse: collapse;
                    background-color: white;
                }
                .header-row {
                    background-color: #d9d9d9;
                }
                .header-row th {
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                    color: #333;
                    font-size: 13px;
                    border: 1px solid #bbb;
                }
                .header-row th:nth-child(2),
                .header-row th:nth-child(3) {
                    text-align: center;
                }
                .data-row td {
                    padding: 12px;
                    color: #333;
                    font-size: 13px;
                    border: 1px solid #e0e0e0;
                }
                .module-label {
                    font-weight: 500;
                }
                .input-cell {
                    text-align: center;
                }
                .results-section {
                    padding: 15px;
                    background-color: #f9f9f9;
                    border-radius: 6px;
                    margin-bottom: 20px;
                }
                .average-box {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    font-size: 16px;
                }
                .label-average {
                    font-weight: 600;
                    color: #333;
                }
                .value-average {
                    font-size: 18px;
                    font-weight: bold;
                    color: #87CEEB;
                }
                .result-banner {
                    background: linear-gradient(135deg, #FF9800 0%, #FF9800 100%);
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 6px;
                    margin-top: 20px;
                }
                .result-banner.admis {
                    background: linear-gradient(135deg, #4CAF50 0%, #4CAF50 100%);
                }
                .result-banner.ajourn {
                    background: linear-gradient(135deg, #f44336 0%, #f44336 100%);
                }
                .result-content {
                    display: flex;
                    justify-content: center;
                    gap: 15px;
                    font-size: 16px;
                }
                .result-label {
                    font-weight: 600;
                }
                .result-status {
                    font-weight: bold;
                }
                .button-container {
                    display: none;
                }
                @media print {
                    body { margin: 0; padding: 0; }
                    .container { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                ${contentToPrint}
            </div>
            <script>
                window.print();
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

/**
 * Animation pulse pour les mises à jour
 */
const style = document.createElement('style');
style.innerHTML = `
    @keyframes pulse {
        0%, 100% {
            opacity: 1;
            transform: scale(1);
        }
        50% {
            opacity: 0.8;
            transform: scale(1.05);
        }
    }
`;
document.head.appendChild(style);

// Initialiser l'affichage au chargement
window.addEventListener('load', () => {
    calculerMoyenne();
});
