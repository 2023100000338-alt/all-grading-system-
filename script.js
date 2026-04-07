const defaultSubjects = {
    Science: ["Bangla", "English", "ICT", "Physics", "Chemistry", "Higher Math", "Biology"],
    Commerce: ["Bangla", "English", "ICT", "Accounting", "Finance", "Business Studies", "Economics"],
    Arts: ["Bangla", "English", "ICT", "History", "Civics", "Geography", "Economics"]
};

let currentSubjects = [];

// Navigation Logic
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(n => n.classList.remove('active'));
    
    if(sectionId === 'calculator') {
        document.getElementById('calculatorSection').classList.remove('hidden');
    } else {
        document.getElementById('gradesSection').classList.remove('hidden');
    }
    
    // Set active class on buttons
    const btns = document.querySelectorAll(`[onclick="showSection('${sectionId}')"]`);
    btns.forEach(b => b.classList.add('active'));
}

// GPA Logic
function init() {
    const group = document.getElementById('groupSelect').value;
    currentSubjects = defaultSubjects[group].map((name, i, arr) => ({
        name, marks: "", isFourth: i === arr.length - 1
    }));
    render();
}

function render() {
    const list = document.getElementById('subjectsList');
    list.innerHTML = '';
    currentSubjects.forEach((sub, i) => {
        const row = document.createElement('div');
        row.className = 'subject-row';
        row.innerHTML = `
            <input type="text" class="subject-name-input" value="${sub.name}" onchange="updateName(${i}, this.value)">
            <input type="number" class="mark-input" placeholder="0" value="${sub.marks}" oninput="updateMark(${i}, this.value)">
            <i data-lucide="award" class="fourth-toggle ${sub.isFourth ? 'active' : ''}" onclick="toggleFourth(${i})"></i>
            <button class="btn-remove" onclick="removeSubject(${i})"><i data-lucide="trash-2"></i></button>
        `;
        list.appendChild(row);
    });
    lucide.createIcons();
}

window.updateMark = (i, val) => currentSubjects[i].marks = val;
window.updateName = (i, val) => currentSubjects[i].name = val;
window.toggleFourth = (i) => {
    currentSubjects.forEach((s, idx) => s.isFourth = (idx === i));
    render();
};
window.removeSubject = (i) => { currentSubjects.splice(i, 1); render(); };

document.getElementById('addSubjectBtn').onclick = () => {
    currentSubjects.push({ name: "New Subject", marks: "", isFourth: false });
    render();
};

document.getElementById('calculateBtn').onclick = () => {
    let totalPoints = 0;
    let count = 0;
    let failed = false;

    currentSubjects.forEach(s => {
        const m = Number(s.marks);
        let gp = 0;
        if (m >= 80) gp = 5;
        else if (m >= 70) gp = 4;
        else if (m >= 60) gp = 3.5;
        else if (m >= 50) gp = 3;
        else if (m >= 40) gp = 2;
        else if (m >= 33) gp = 1;
        
        if (s.isFourth) {
            totalPoints += Math.max(0, gp - 2);
        } else {
            if (gp === 0) failed = true;
            totalPoints += gp;
            count++;
        }
    });

    const gpa = failed ? "0.00" : Math.min(5.0, totalPoints / count).toFixed(2);
    document.getElementById('finalGPA').innerText = gpa;
    document.getElementById('resultCard').classList.remove('hidden');
    document.getElementById('failMessage').classList.toggle('hidden', !failed);
};

// Theme Toggle
const toggle = () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
};
document.getElementById('themeToggle').onclick = toggle;
document.getElementById('mobileThemeToggle').onclick = toggle;
document.getElementById('groupSelect').onchange = init;
document.getElementById('resetBtn').onclick = init;

init();
