// -------- Utility: Grade point from marks (0-100) --------
function getGradePointFromMarks(marks) {
    let m = parseFloat(marks);
    if (isNaN(m)) return 0;
    if (m >= 80) return 5.0;
    if (m >= 70) return 4.0;
    if (m >= 60) return 3.5;
    if (m >= 50) return 3.0;
    if (m >= 40) return 2.0;
    if (m >= 33) return 1.0;
    return 0.0;
}

// SSC / HSC core calculation
function calculateGPA(subjects) {
    let totalPoints = 0;
    let mainCount = 0;
    let hasFail = false;
    let fourthBonus = 0;
    
    for (let sub of subjects) {
        let marksVal = sub.marks.trim() === "" ? NaN : parseFloat(sub.marks);
        if (isNaN(marksVal) || marksVal < 0 || marksVal > 100) {
            return { gpa: null, error: "Invalid marks (0-100 required)", failed: false };
        }
        let gp = getGradePointFromMarks(marksVal);
        if (sub.isFourth) {
            if (gp > 2.0) fourthBonus += (gp - 2);
        } else {
            totalPoints += gp;
            mainCount++;
            if (gp === 0.0) hasFail = true;
        }
    }
    
    if (mainCount === 0) return { gpa: null, error: "No main subjects", failed: false };
    if (hasFail) return { gpa: 0.0, failed: true, error: null };
    
    let rawGpa = (totalPoints + fourthBonus) / mainCount;
    let finalGpa = Math.min(5.0, Math.max(0, rawGpa));
    return { gpa: finalGpa, failed: false, error: null };
}

function getGradeLetterFromGpa(gpa, isUniversity = false) {
    if (isUniversity) {
        if (gpa >= 4.0) return "A+";
        if (gpa >= 3.7) return "A";
        if (gpa >= 3.3) return "A-";
        if (gpa >= 3.0) return "B+";
        if (gpa >= 2.7) return "B";
        if (gpa >= 2.3) return "B-";
        if (gpa >= 2.0) return "C";
        if (gpa >= 1.0) return "D";
        return "F";
    } else {
        if (gpa >= 5.0) return "A+";
        if (gpa >= 4.0) return "A";
        if (gpa >= 3.5) return "A-";
        if (gpa >= 3.0) return "B";
        if (gpa >= 2.0) return "C";
        if (gpa >= 1.0) return "D";
        return "F";
    }
}

// Dynamic Subject Manager for SSC/HSC
class ExamManager {
    constructor(containerId, groupSelectId, addBtnId, calcBtnId, resultDivId, defaultGroupSubjects) {
        this.container = document.getElementById(containerId);
        this.groupSelect = document.getElementById(groupSelectId);
        this.addBtn = document.getElementById(addBtnId);
        this.calcBtn = document.getElementById(calcBtnId);
        this.resultDiv = document.getElementById(resultDivId);
        this.defaultMap = defaultGroupSubjects;
        this.subjects = [];
        this.init();
    }
    
    init() {
        this.loadGroupSubjects();
        this.groupSelect.addEventListener('change', () => this.loadGroupSubjects());
        this.addBtn.addEventListener('click', () => this.addSubject());
        this.calcBtn.addEventListener('click', () => this.calculate());
    }
    
    loadGroupSubjects() {
        const group = this.groupSelect.value;
        const subjectNames = this.defaultMap[group] || ["Bangla", "English", "ICT", "Mathematics", "Physics"];
        this.subjects = subjectNames.map((name, idx) => ({
            name: name,
            marks: "",
            isFourth: (idx === subjectNames.length - 1 && subjectNames.length >= 4)
        }));
        this.render();
    }
    
    render() {
        this.container.innerHTML = '';
        this.subjects.forEach((sub, idx) => {
            const div = document.createElement('div');
            div.className = 'subject-item';
            div.innerHTML = `
                <input type="text" value="${this.escapeHtml(sub.name)}" placeholder="Subject" class="subj-name" data-idx="${idx}" style="flex:2">
                <input type="number" step="0.01" value="${sub.marks}" placeholder="Marks 0-100" class="marks-input" data-idx="${idx}" style="flex:1">
                <label style="display:flex; align-items:center; gap:4px; font-size:0.75rem;">
                    <input type="checkbox" class="fourth-check" data-idx="${idx}" ${sub.isFourth ? 'checked' : ''}> 4th
                </label>
                <button class="remove-subj" data-idx="${idx}">🗑️</button>
            `;
            this.container.appendChild(div);
        });
        
        // attach events
        document.querySelectorAll(`#${this.container.id} .subj-name`).forEach(inp => {
            inp.addEventListener('change', (e) => {
                let idx = e.target.dataset.idx;
                this.subjects[idx].name = e.target.value;
            });
        });
        
        document.querySelectorAll(`#${this.container.id} .marks-input`).forEach(inp => {
            inp.addEventListener('input', (e) => {
                let idx = e.target.dataset.idx;
                this.subjects[idx].marks = e.target.value;
            });
        });
        
        document.querySelectorAll(`#${this.container.id} .fourth-check`).forEach(ch => {
            ch.addEventListener('change', (e) => {
                let idx = e.target.dataset.idx;
                this.subjects.forEach((s, i) => s.isFourth = (i == idx));
                this.render();
            });
        });
        
        document.querySelectorAll(`#${this.container.id} .remove-subj`).forEach(btn => {
            btn.addEventListener('click', (e) => {
                let idx = btn.dataset.idx;
                this.subjects.splice(idx, 1);
                this.render();
            });
        });
    }
    
    addSubject() {
        this.subjects.push({ name: "New Subject", marks: "", isFourth: false });
        this.render();
    }
    
    calculate() {
        const result = calculateGPA(this.subjects);
        if (result.error) {
            this.resultDiv.style.display = 'block';
            this.resultDiv.innerHTML = `<div class="fail-msg">⚠️ ${result.error}</div>`;
            return;
        }
        
        let gpa = result.gpa;
        let gradeLetter = getGradeLetterFromGpa(gpa, false);
        this.resultDiv.style.display = 'block';
        
        if (result.failed) {
            this.resultDiv.innerHTML = `<div><span class="gpa-value">0.00</span><div class="fail-msg">❌ FAILED (GPA 0.00)</div><div>Result: F</div><p class="info-text">One or more main subjects below 33.</p></div>`;
        } else {
            this.resultDiv.innerHTML = `<div><span class="gpa-value">${gpa.toFixed(2)}</span><div class="grade-label">Grade: ${gradeLetter}</div><p class="success-msg">✅ 4th subject bonus applied automatically</p></div>`;
        }
    }
    
    escapeHtml(str) {
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
}

// Default subject maps
const sscMap = {
    Science: ["Bangla", "English", "Mathematics", "Physics", "Chemistry", "Biology", "ICT"],
    Commerce: ["Bangla", "English", "Accounting", "Finance", "Business Studies", "Economics", "ICT"],
    Arts: ["Bangla", "English", "History", "Civics", "Geography", "Economics", "ICT"]
};

const hscMap = {
    Science: ["Bangla", "English", "Physics", "Chemistry", "Higher Math", "Biology", "ICT"],
    Commerce: ["Bangla", "English", "Accounting", "Finance", "Business Management", "Economics", "ICT"],
    Arts: ["Bangla", "English", "History", "Islamic History", "Geography", "Political Science", "ICT"]
};

// Initialize managers
const sscManager = new ExamManager('sscSubjectsContainer', 'sscGroup', 'addSscSubjectBtn', 'calcSscBtn', 'sscResult', sscMap);
const hscManager = new ExamManager('hscSubjectsContainer', 'hscGroup', 'addHscSubjectBtn', 'calcHscBtn', 'hscResult', hscMap);

// University CGPA logic
let semesters = [];

function updateCGPADisplay() {
    const container = document.getElementById('semestersList');
    if (!container) return;
    
    if (semesters.length === 0) {
        container.innerHTML = '<p class="info-text">No semesters added. Add semester above.</p>';
        document.getElementById('cgpaResultDisplay').innerHTML = `<span class="gpa-value">0.00</span><p>Current CGPA (Weighted)</p><span id="cgpaStatus">-</span>`;
        return;
    }
    
    let totalPoints = 0;
    let totalCredits = 0;
    semesters.forEach(s => {
        totalPoints += (s.gradePoint * s.credits);
        totalCredits += s.credits;
    });
    
    let cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    cgpa = Math.min(4.0, Math.max(0, cgpa));
    let gradeLetter = getGradeLetterFromGpa(cgpa, true);
    
    let html = '';
    semesters.forEach((sem, idx) => {
        html += `<div class="semester-card">
                    <div class="cgpa-row"><strong>${escapeHtml(sem.name)}</strong> <button class="remove-sem" data-idx="${idx}" style="background:none; border:none; color:var(--danger); cursor:pointer;">✖️</button></div>
                    <div>Credits: ${sem.credits} | GPA: ${sem.gradePoint.toFixed(2)}</div>
                </div>`;
    });
    container.innerHTML = html;
    
    document.querySelectorAll('.remove-sem').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let idx = parseInt(btn.dataset.idx);
            semesters.splice(idx, 1);
            updateCGPADisplay();
        });
    });
    
    const resultBox = document.getElementById('cgpaResultDisplay');
    resultBox.innerHTML = `<span class="gpa-value">${cgpa.toFixed(2)}</span><p>Current CGPA (Weighted)</p><div class="grade-label">${gradeLetter}</div>`;
}

document.getElementById('addSemesterBtn')?.addEventListener('click', () => {
    let name = document.getElementById('semName').value.trim();
    let credits = parseFloat(document.getElementById('semCredit').value);
    let gpaVal = parseFloat(document.getElementById('semGpa').value);
    
    if (!name) name = `Semester ${semesters.length + 1}`;
    if (isNaN(credits) || credits <= 0) {
        alert("Enter valid credits > 0");
        return;
    }
    if (isNaN(gpaVal) || gpaVal < 0 || gpaVal > 4) {
        alert("Grade point must be between 0.00 and 4.00");
        return;
    }
    
    semesters.push({ name: name, credits: credits, gradePoint: gpaVal });
    updateCGPADisplay();
    document.getElementById('semName').value = '';
    document.getElementById('semGpa').value = '';
});

document.getElementById('resetSemestersBtn')?.addEventListener('click', () => {
    semesters = [];
    updateCGPADisplay();
});

updateCGPADisplay();

// Navigation Tabs
const tabs = document.querySelectorAll('.nav-btn');
const sections = {
    ssc: document.getElementById('sscSection'),
    hsc: document.getElementById('hscSection'),
    cgpa: document.getElementById('cgpaSection'),
    gradetable: document.getElementById('gradetableSection')
};

function switchTab(tabId) {
    Object.values(sections).forEach(sec => sec.classList.remove('active-section'));
    sections[tabId].classList.add('active-section');
    tabs.forEach(btn => {
        if (btn.dataset.tab === tabId) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

tabs.forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
    });
});

// Light/Dark theme toggle
const rootHtml = document.documentElement;
const themeBtn = document.getElementById('themeToggleBtn');

function setTheme(theme) {
    rootHtml.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

themeBtn.addEventListener('click', () => {
    const current = rootHtml.getAttribute('data-theme');
    const newTheme = current === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
});

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Initial load
window.addEventListener('load', () => {
    sscManager.loadGroupSubjects();
    hscManager.loadGroupSubjects();
});