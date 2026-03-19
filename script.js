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
const LOCAL_FALLBACK_KEY = 'kamar-notes-local-fallback-v1';

let editMode = false;
let saveTimer = null;
let latestCloudState = {};

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

function collectNotesFromInputs() {
    const notes = {};
    noteInputs.forEach((input) => {
        notes[input.dataset.module] = input.value || '';
    });
    return notes;
}

function applyNotesToInputs(notes) {
    noteInputs.forEach((input) => {
        const value = notes[input.dataset.module];
        input.value = value === undefined || value === null ? '' : String(value);
    });
}

function saveLocalFallback(notes) {
    localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(notes));
}

function loadLocalFallback() {
    const raw = localStorage.getItem(LOCAL_FALLBACK_KEY);
    if (!raw) {
        return {};
    }

    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
        localStorage.removeItem(LOCAL_FALLBACK_KEY);
        return {};
    }
}

async function fetchCloudNotes() {
    const response = await fetch('/api/notes', {
        method: 'GET',
        cache: 'no-store',
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Impossible de lire les notes cloud.');
    }

    const data = await response.json();
    return data.notes && typeof data.notes === 'object' ? data.notes : {};
}

async function saveCloudNotes(notes) {
    const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
    });

    if (!response.ok) {
        throw new Error('Impossible d\'enregistrer les notes cloud.');
    }
}

async function loadNotesPreferCloud() {
    try {
        const notes = await fetchCloudNotes();
        latestCloudState = notes;
        applyNotesToInputs(notes);
        saveLocalFallback(notes);
        return;
    } catch (_) {
        const fallback = loadLocalFallback();
        applyNotesToInputs(fallback);
    }
}

async function syncNotesNow() {
    if (!editMode) {
        return;
    }

    const notes = collectNotesFromInputs();
    saveLocalFallback(notes);

    try {
        await saveCloudNotes(notes);
        latestCloudState = notes;
    } catch (_) {
        showAuthMessage('Connexion faible: sauvegarde locale appliquée.', 'error');
    }
}

function queueCloudSave() {
    if (!editMode) {
        return;
    }

    if (saveTimer) {
        clearTimeout(saveTimer);
    }

    saveTimer = setTimeout(() => {
        syncNotesNow();
    }, 450);
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

function imprimerReclamation() {
    window.print();
}

loginBtn.addEventListener('click', async () => {
    const name = loginName.value.trim().toLowerCase();
    const password = loginPassword.value.trim();

    if (name === LOGIN_NAME && password === LOGIN_PASSWORD) {
        await loadNotesPreferCloud();
        applyMode(true);
        calculerMoyenne();
        showAuthMessage('Accès autorisé : modification + synchro cloud activées.', 'success');
        setTimeout(closeAuthOverlay, 450);
        return;
    }

    applyMode(false);
    await loadNotesPreferCloud();
    calculerMoyenne();
    showAuthMessage('Identifiants incorrects : mode lecture seule.', 'error');
    setTimeout(closeAuthOverlay, 750);
});

viewOnlyBtn.addEventListener('click', async () => {
    applyMode(false);
    await loadNotesPreferCloud();
    calculerMoyenne();
    closeAuthOverlay();
});

noteInputs.forEach((input) => {
    input.addEventListener('input', () => {
        if (!editMode) {
            return;
        }

        sanitizeNoteInput(input);
        calculerMoyenne();
        queueCloudSave();
    });

    input.addEventListener('change', () => {
        if (!editMode) {
            return;
        }

        sanitizeNoteInput(input);
        calculerMoyenne();
        queueCloudSave();
    });

    input.addEventListener('blur', () => {
        if (!editMode) {
            return;
        }

        sanitizeNoteInput(input);
        calculerMoyenne();
        queueCloudSave();
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

window.addEventListener('beforeunload', () => {
    if (editMode) {
        const notes = collectNotesFromInputs();
        saveLocalFallback(notes);
    }
});

window.addEventListener('load', async () => {
    applyMode(false);
    await loadNotesPreferCloud();
    calculerMoyenne();
});
