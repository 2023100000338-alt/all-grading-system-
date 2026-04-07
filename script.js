/**
 * GPA CALCULATOR LOGIC - GradePoint Pro
 * Handles group selection, subject management, and GPA calculation with validation.
 */

const defaultSubjects = {
    Science: ["Bangla", "English", "ICT", "Physics", "Chemistry", "Higher Math", "Biology"],
    Commerce: ["Bangla", "English", "ICT", "Accounting", "Finance", "Business Studies", "Economics"],
    Arts: ["Bangla", "English", "ICT", "History", "Civics", "Geography", "Economics"]
};

let currentSubjects = [];

/**
 * Navigation: Switches between the Calculator and Grade Reference sections.
 */
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(n => n.classList.remove('active'));
    
    const targetId = sectionId === 'calculator' ? 'calculatorSection' : 'gradesSection';
    document.getElementById(targetId).classList.remove('hidden');
    
    const btns = document.querySelectorAll(`[onclick="showSection('${sectionId}')"]`);
    btns.forEach(b => b.classList.add('active'));
}

/**
 * Initialization: Loads the default subjects based on the selected group (Science/Arts/Commerce).
 */
function init() {
    const group = document.getElementById('groupSelect').value;
    // Map subject names to objects. Usually, the last subject in the array is set as the 4th subject.
    currentSubjects = defaultSubjects[group].map((name, i, arr) => ({
        name, 
        marks: "", 
        isFourth: i === arr.length - 1,
        invalid: false // Track if input is > 100 or < 0
    }));
    render();
}

/**
 * UI Rendering: Dynamically creates the input rows for each subject.
 */
function render() {
    const list = document.getElementById('subjectsList');
    list.innerHTML = '';
    
    currentSubjects.forEach((sub, i) => {
        const row = document.createElement('div');
        // If the mark is invalid, we add an 'error-row' class (you can style this in CSS)
        row.className = `subject-row ${sub.invalid ? 'error-row' : ''}`;
        
        row.innerHTML = `
            <input type="text" class="subject-name-input" value="${sub.name}" 
                   onchange="updateName(${i}, this.value)">
            
            <input type="number" class="mark-input" placeholder="0-100" value="${sub.marks}" 
                   style="${sub.invalid ? 'border-color: #ef4444;' : ''}"
                   oninput="updateMark(${i}, this.value)">
            
            <i data-lucide="award" title="Set as 4th Subject" 
               class="fourth-toggle ${sub.isFourth ? 'active' : ''}" 
               onclick="toggleFourth(${i})"></i>
            
            <button class="btn-remove" onclick="removeSubject(${i})">
                <i data-lucide="trash-2"></i>
            </button>
        `;
        list.appendChild(row);
    });
    // Refresh icons from Lucide library
    lucide.createIcons();
}

/**
 * Helper: Updates data when user types. 
 * Includes real-time validation for marks between 0 and 100.
 */
window.updateMark = (i, val) => {
    const num = Number(val);
    currentSubjects[i].marks = val;
    // Mark as invalid if out of bounds
    currentSubjects[i].invalid = (val !== "" && (num < 0 || num > 100));
    
    // Optional: Real-time visual feedback without full re-render
    const inputs = document.querySelectorAll('.mark-input');
    if(inputs[i]) {
        inputs[i].style.borderColor = currentSubjects[i].invalid ? "#ef4444" : "";
    }
};

window.updateName = (i, val) => currentSubjects[i].name = val;

window.toggleFourth = (i) => {
    // Only one subject can be the 4th subject at a time
    currentSubjects.forEach((s, idx) => s.isFourth = (idx === i));
    render();
};

window.removeSubject = (i) => { 
    currentSubjects.splice(i, 1); 
    render(); 
};

document.getElementById('addSubjectBtn').onclick = () => {
    currentSubjects.push({ name: "New Subject", marks: "", isFourth: false, invalid: false });
    render();
};

/**
 * GPA Calculation Engine
 * Logic: 
 * 1. Convert marks to Grade Points (GP).
 * 2. If any main subject is below 33 (F), total GPA is 0.00.
 * 3. 4th subject adds (GP - 2) points to the total if GP is above 2.0.
 */
document.getElementById('calculateBtn').onclick = () => {
    let totalPoints = 0;
    let mainSubjectCount = 0;
    let failed = false;
    let hasInvalidInput = false;

    currentSubjects.forEach(s => {
        const m = Number(s.marks);
        
        // Validation check before calculation
        if (s.marks === "" || m < 0 || m > 100) {
            hasInvalidInput = true;
            s.invalid = true;
            return;
        }

        let gp = 0;
        if (m >= 80) gp = 5;
        else if (m >= 70) gp = 4;
        else if (m >= 60) gp = 3.5;
        else if (m >= 50) gp = 3;
        else if (m >= 40) gp = 2;
        else if (m >= 33) gp = 1;
        else gp = 0;

        if (s.isFourth) {
            // 4th Subject Logic: Only points above 2.00 are added
            totalPoints += Math.max(0, gp - 2);
        } else {
            // Main Subject Logic: If any main subject is F (0), the student fails
            if (gp === 0) failed = true;
            totalPoints += gp;
            mainSubjectCount++;
        }
    });

    if (hasInvalidInput) {
        alert("Please enter valid marks (0-100) for all subjects.");
        render(); // Show red error borders
        return;
    }

    // Calculate final GPA
    // Formula: (Total Points of Main Subjects + Bonus from 4th) / Total Main Subjects
    let gpa = failed ? 0.00 : (totalPoints / mainSubjectCount);
    
    // GPA cannot exceed 5.00
    const finalGPA = Math.min(5.0, gpa).toFixed(2);

    // Update UI
    document.getElementById('finalGPA').innerText = finalGPA;
    document.getElementById('resultCard').classList.remove('hidden');
    document.getElementById('failMessage').classList.toggle('hidden', !failed);
    
    // Scroll to result for mobile users
    document.getElementById('resultCard').scrollIntoView({ behavior: 'smooth' });
};

/**
 * Theme & Reset Listeners
 */
const toggleTheme = () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
};

document.getElementById('themeToggle').onclick = toggleTheme;
document.getElementById('mobileThemeToggle').onclick = toggleTheme;
document.getElementById('groupSelect').onchange = init;
document.getElementById('resetBtn').onclick = init;

// Run on page load
init();