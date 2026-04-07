// Grade point calculation
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

function getGradeLetter(gpa) {
    if (gpa >= 5.0) return "A+";
    if (gpa >= 4.0) return "A";
    if (gpa >= 3.5) return "A-";
    if (gpa >= 3.0) return "B";
    if (gpa >= 2.0) return "C";
    if (gpa >= 1.0) return "D";
    return "F";
}

// Exam Manager Class
class ExamManager {
    constructor(containerId, groupSelectId, addBtnId, calcBtnId, resetBtnId, resultDivId, defaultMap) {
        this.container = document.getElementById(containerId);
        this.groupSelect = document.getElementById(groupSelectId);
        this.addBtn = document.getElementById(addBtnId);
        this.calcBtn = document.getElementById(calcBtnId);
        this.resetBtn = document.getElementById(resetBtnId);
        this.resultDiv = document.getElementById(resultDivId);
        this.defaultMap = defaultMap;
        this.subjects = [];
        this.init();
    }
    
    init() {
        this.loadGroupSubjects();
        this.groupSelect.addEventListener('change', () => this.loadGroupSubjects());
        this.addBtn.addEventListener('click', () => this.addSubject());
        this.calcBtn.addEventListener('click', () => this.calculate());
        this.resetBtn.addEventListener('click', () => this.loadGroupSubjects());
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
                <input type="text" value="${this.escapeHtml(sub.name)}" placeholder="Subject" class="subj-name" data-idx="${idx}">
                <input type="number" step="0.01" value="${sub.marks}" placeholder="Marks 0-100" class="marks-input" data-idx="${idx}">
                <label class="fourth-label">
                    <input type="checkbox" class="fourth-check" data-idx="${idx}" ${sub.isFourth ? 'checked' : ''}> 4th Subject
                </label>
                <button class="remove-subj" data-idx="${idx}"><i class="fas fa-trash"></i></button>
            `;
            this.container.appendChild(div);
        });
        
        this.container.querySelectorAll('.subj-name').forEach(inp => {
            inp.addEventListener('change', (e) => {
                let idx = e.target.dataset.idx;
                this.subjects[idx].name = e.target.value;
            });
        });
        
        this.container.querySelectorAll('.marks-input').forEach(inp => {
            inp.addEventListener('input', (e) => {
                let idx = e.target.dataset.idx;
                this.subjects[idx].marks = e.target.value;
            });
        });
        
        this.container.querySelectorAll('.fourth-check').forEach(ch => {
            ch.addEventListener('change', (e) => {
                let idx = e.target.dataset.idx;
                this.subjects.forEach((s, i) => s.isFourth = (i == idx));
                this.render();
            });
        });
        
        this.container.querySelectorAll('.remove-subj').forEach(btn => {
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
            this.resultDiv.innerHTML = `<div class="fail-message"><i class="fas fa-exclamation-circle"></i> ${result.error}</div>`;
            return;
        }
        
        let gpa = result.gpa;
        let gradeLetter = getGradeLetter(gpa);
        this.resultDiv.style.display = 'block';
        
        if (result.failed) {
            this.resultDiv.innerHTML = `
                <div class="result-gpa">0.00</div>
                <div class="result-grade fail-message"><i class="fas fa-times-circle"></i> FAILED</div>
                <div>Grade: F</div>
                <p class="info-text">One or more main subjects below 33 marks</p>
            `;
        } else {
            this.resultDiv.innerHTML = `
                <div class="result-gpa">${gpa.toFixed(2)}</div>
                <div class="result-grade">Grade: ${gradeLetter}</div>
                <p><i class="fas fa-check-circle"></i> 4th subject bonus applied automatically</p>
            `;
        }
        
        this.resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

// Subject Maps
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

// Initialize Managers
const sscManager = new ExamManager('sscSubjectsContainer', 'sscGroup', 'addSscSubjectBtn', 'calcSscBtn', 'resetSscBtn', 'sscResult', sscMap);
const hscManager = new ExamManager('hscSubjectsContainer', 'hscGroup', 'addHscSubjectBtn', 'calcHscBtn', 'resetHscBtn', 'hscResult', hscMap);

// Navigation
const navItems = document.querySelectorAll('.nav-item, .bottom-nav-item');
const sections = ['ssc', 'hsc', 'cgpa', 'gradetable'];

function switchTab(tabId) {
    sections.forEach(section => {
        const sectionEl = document.getElementById(`${section}Section`);
        if (sectionEl) sectionEl.classList.remove('active');
    });
    document.getElementById(`${tabId}Section`).classList.add('active');
    
    navItems.forEach(item => {
        if (item.dataset.tab === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    localStorage.setItem('activeTab', tabId);
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        switchTab(item.dataset.tab);
    });
});

// Theme Toggle
const root = document.documentElement;
const themeToggles = document.querySelectorAll('#floatingThemeToggle, #themeToggleSidebar');

function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const icon = document.querySelector('#floatingThemeToggle i');
    if (icon) {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
    const sidebarIcon = document.querySelector('#themeToggleSidebar i');
    if (sidebarIcon) {
        sidebarIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

themeToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme');
        const newTheme = current === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    });
});

// Mobile Sidebar
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');
const sidebarClose = document.getElementById('sidebarClose');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
    });
}

if (sidebarClose) {
    sidebarClose.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });
}

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target) && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    }
});

// Load saved tab
const savedTab = localStorage.getItem('activeTab') || 'ssc';
switchTab(savedTab);