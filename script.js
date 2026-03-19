const noteInputs = document.querySelectorAll('.note-input');
const printBtn = document.getElementById('printBtn');
const resultBanner = document.getElementById('resultBanner');
const resultStatus = document.getElementById('resultStatus');
const authOverlay = document.getElementById('authOverlay');
const loginName = document.getElementById('loginName');
const loginPassword = document.getElementById('loginPassword');
const loginBtn = document.getElementById('loginBtn');
const viewOnlyBtn = document.getElementById('viewOnlyBtn');
const authMessage = document.getElementById('authMessage');

const LOGIN_NAME = 'kamar';
const LOGIN_PASSWORD = 'notedekamar';
const STORAGE_KEY = 'kamar-notes-v1';

let editMode = false;

function applyMode(canEdit) {
    editMode = canEdit;
    document.body.classList.toggle('readonly', !canEdit);

    noteInputs.forEach((input) => {
        input.disabled = !canEdit;
    });
}

function showAuthMessage(text, type) {
    authMessage.textContent = text;
    authMessage.classList.remove('success', 'error');
    if (type) {
        authMessage.classList.add(type);
    }
}

function closeAuthOverlay() {
    authOverlay.classList.add('hidden');
}

function saveNotes() {
    if (!editMode) {
        return;
    }

    const notes = {};
    noteInputs.forEach((input) => {
        notes[input.dataset.module] = input.value;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function loadNotes() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return;
    }

    try {
        const notes = JSON.parse(raw);
        noteInputs.forEach((input) => {
            const value = notes[input.dataset.module];
            if (value !== undefined && value !== null) {
                input.value = value;
            }
        });
    } catch (error) {
        localStorage.removeItem(STORAGE_KEY);
    }
}

function calculerMoyenne() {
    const notesOrdinaires = [];
    const ordinaryInputs = document.querySelectorAll('input[data-module]:not([data-module*="rattrapage"])');

    ordinaryInputs.forEach((input) => {
        const value = parseFloat(input.value);
        if (!Number.isNaN(value) && value >= 0 && value <= 20) {
            notesOrdinaires.push(value);
        }
    });

    if (notesOrdinaires.length === 0) {
        resultStatus.textContent = '--';
        resultBanner.className = 'result-banner';
        return;
    }

    const moyenne = notesOrdinaires.reduce((total, note) => total + note, 0) / notesOrdinaires.length;

    if (moyenne >= 10) {
        resultStatus.textContent = 'ADMIS';
        resultBanner.className = 'result-banner admis';
    } else {
        resultStatus.textContent = 'AJOURNÉ';
        resultBanner.className = 'result-banner ajourn';
    }
}

function sanitizeNoteInput(input) {
    if (input.value === '') {
        return;
    }

    let value = Number.parseFloat(input.value);
    if (Number.isNaN(value)) {
        input.value = '';
        return;
    }

    if (value < 0) {
        value = 0;
    }

    if (value > 20) {
        value = 20;
    }

    input.value = Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function imprimerReclamation() {
    window.print();
}

loginBtn.addEventListener('click', () => {
    const name = loginName.value.trim().toLowerCase();
    const password = loginPassword.value.trim();

    if (name === LOGIN_NAME && password === LOGIN_PASSWORD) {
        applyMode(true);
        showAuthMessage('Accès autorisé : modification activée.', 'success');
        setTimeout(closeAuthOverlay, 450);
        return;
    }

    applyMode(false);
    showAuthMessage('Identifiants incorrects : mode lecture seule.', 'error');
    setTimeout(closeAuthOverlay, 750);
});

viewOnlyBtn.addEventListener('click', () => {
    applyMode(false);
    closeAuthOverlay();
});

noteInputs.forEach((input) => {
    input.addEventListener('input', () => {
        if (!editMode) {
            return;
        }

        sanitizeNoteInput(input);
        calculerMoyenne();
        saveNotes();
    });

    input.addEventListener('blur', () => {
        if (!editMode) {
            return;
        }

        sanitizeNoteInput(input);
        calculerMoyenne();
        saveNotes();
    });
});

printBtn.addEventListener('click', imprimerReclamation);

window.addEventListener('keydown', (event) => {
    if (authOverlay.classList.contains('hidden')) {
        return;
    }

    if (event.key === 'Enter') {
        loginBtn.click();
    }
});

window.addEventListener('load', () => {
    loadNotes();
    applyMode(false);
    calculerMoyenne();
});
