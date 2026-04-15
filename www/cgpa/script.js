// Professional CGPA JavaScript - Add to your script.js

// Grade point mapping
const uniGradePoints = {
    'A+': 4.00, 'A': 3.75, 'A-': 3.50,
    'B+': 3.25, 'B': 3.00, 'B-': 2.75,
    'C+': 2.50, 'C': 2.25, 'D': 2.00, 'F': 0.00
};

let globalSemesterCounter = 1;

// Create semester
function createUniSemester(semesterNum) {
    const semesterDiv = document.createElement('div');
    semesterDiv.className = 'semester-card';
    semesterDiv.setAttribute('data-semester-id', semesterNum);
    semesterDiv.innerHTML = `
        <div class="semester-header">
            <div class="semester-title">
                <i class="fas fa-calendar-alt"></i>
                <span>Semester ${semesterNum}</span>
            </div>
            <button class="btn-remove-semester" onclick="removeUniSemester(this)">
                <i class="fas fa-trash-alt"></i> Remove Semester
            </button>
        </div>
        <div class="courses-container" id="uni-courses-${semesterNum}">
            ${createUniCourseRow(1)}
        </div>
        <button class="btn-add-course" onclick="addUniCourse(${semesterNum})">
            <i class="fas fa-plus-circle"></i> + Add New Course
        </button>
    `;
    return semesterDiv;
}

// Create course row with fixed credits (1 or 3)
function createUniCourseRow(courseNum) {
    return `
        <div class="course-row">
            <input type="text" placeholder="Course Name (e.g., Mathematics)" class="course-name" value="Course ${courseNum}">
            <select class="course-credit">
                <option value="1">1 Credit </option>
                <option value="3" selected>3 Credit </option>
            </select>
            <select class="course-grade">
                <option value="A+">A+ (4.00)</option>
                <option value="A">A (3.75)</option>
                <option value="A-">A- (3.50)</option>
                <option value="B+">B+ (3.25)</option>
                <option value="B">B (3.00)</option>
                <option value="B-">B- (2.75)</option>
                <option value="C+">C+ (2.50)</option>
                <option value="C">C (2.25)</option>
                <option value="D">D (2.00)</option>
                <option value="F">F (0.00)</option>
            </select>
            <button class="btn-remove-course" onclick="removeUniCourse(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

// Add course function - globally accessible
window.addUniCourse = function (semesterId) {
    const container = document.getElementById(`uni-courses-${semesterId}`);
    if (container) {
        const courseCount = container.children.length;
        const newCourse = createUniCourseRow(courseCount + 1);
        container.insertAdjacentHTML('beforeend', newCourse);

        // Show feedback
        const lastCourse = container.lastElementChild;
        lastCourse.style.opacity = '0';
        lastCourse.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            lastCourse.style.transition = 'all 0.3s ease';
            lastCourse.style.opacity = '1';
            lastCourse.style.transform = 'translateY(0)';
        }, 10);
    }
};

// Remove course
window.removeUniCourse = function (button) {
    const courseRow = button.closest('.course-row');
    const container = courseRow.parentElement;
    if (container.children.length > 1) {
        courseRow.style.transition = 'all 0.2s ease';
        courseRow.style.opacity = '0';
        courseRow.style.transform = 'scale(0.95)';
        setTimeout(() => {
            courseRow.remove();
        }, 150);
    } else {
        alert('At least one course is required per semester!');
    }
};

// Remove semester
window.removeUniSemester = function (button) {
    const semesterCard = button.closest('.semester-card');
    const semestersContainer = document.getElementById('semestersContainer');
    if (semestersContainer.children.length > 1) {
        semesterCard.style.transition = 'all 0.3s ease';
        semesterCard.style.opacity = '0';
        semesterCard.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            semesterCard.remove();
            renumberUniSemesters();
        }, 250);
    } else {
        alert('At least one semester is required!');
    }
};

// Renumber semesters
function renumberUniSemesters() {
    const semesters = document.querySelectorAll('.semester-card');
    semesters.forEach((semester, index) => {
        const newNum = index + 1;
        semester.setAttribute('data-semester-id', newNum);
        const titleSpan = semester.querySelector('.semester-title span');
        if (titleSpan) titleSpan.textContent = `Semester ${newNum}`;

        const coursesContainer = semester.querySelector('.courses-container');
        if (coursesContainer) {
            const oldId = coursesContainer.id;
            coursesContainer.id = `uni-courses-${newNum}`;

            const addBtn = semester.querySelector('.btn-add-course');
            if (addBtn) {
                addBtn.setAttribute('onclick', `addUniCourse(${newNum})`);
            }
        }
    });
    globalSemesterCounter = semesters.length;
}

// Add semester
function addUniSemester() {
    globalSemesterCounter++;
    const semestersContainer = document.getElementById('semestersContainer');
    const newSemester = createUniSemester(globalSemesterCounter);
    semestersContainer.appendChild(newSemester);

    // Scroll to new semester
    newSemester.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Calculate CGPA
function calculateUniCGPA() {
    let totalGradePoints = 0;
    let totalCredits = 0;
    let failedCourses = [];

    const semesters = document.querySelectorAll('.semester-card');

    semesters.forEach((semester, semIndex) => {
        const courses = semester.querySelectorAll('.course-row');
        courses.forEach((course, courseIndex) => {
            const courseName = course.querySelector('.course-name')?.value || `Course ${courseIndex + 1}`;
            const credit = parseFloat(course.querySelector('.course-credit').value);
            const grade = course.querySelector('.course-grade').value;
            const gradePoint = uniGradePoints[grade];

            if (!isNaN(credit) && credit > 0) {
                totalGradePoints += credit * gradePoint;
                totalCredits += credit;

                if (grade === 'F') {
                    failedCourses.push({ name: courseName, semester: semIndex + 1 });
                }
            }
        });
    });

    const resultDiv = document.getElementById('cgpaResult');

    if (totalCredits === 0) {
        alert('Please add at least one course with valid credit hours!');
        return;
    }

    let cgpa, message, gradient;

    if (failedCourses.length > 0) {
        cgpa = 0;
        message = `❌ Failed in ${failedCourses.length} course(s): ${failedCourses.map(f => f.name).join(', ')}`;
        gradient = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    } else {
        cgpa = (totalGradePoints / totalCredits).toFixed(2);

        if (cgpa >= 3.75) message = '🏆 Outstanding performance! Keep excelling!';
        else if (cgpa >= 3.50) message = '🎉 Excellent! Maintain this standard!';
        else if (cgpa >= 3.00) message = '👍 Good job! Aim for Dean\'s list!';
        else if (cgpa >= 2.75) message = '📚 Satisfactory. Keep improving!';
        else if (cgpa >= 2.50) message = '⚠️ Below average. Need improvement!';
        else message = '🚨 Academic probation risk! Seek help immediately!';

        if (cgpa >= 3.50) gradient = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        else if (cgpa >= 3.00) gradient = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
        else if (cgpa >= 2.50) gradient = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
        else gradient = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    }

    resultDiv.style.display = 'block';
    resultDiv.style.background = gradient;
    resultDiv.innerHTML = `
        <div style="text-align: center;">
            <i class="fas fa-chart-line" style="font-size: 2rem; opacity: 0.9;"></i>
            <h3>Your CGPA Result</h3>
            <div class="cgpa-value">${cgpa}</div>
            <div class="total-info">
                📊 Total Credits: ${totalCredits} | ⭐ Grade Points: ${totalGradePoints.toFixed(2)}
            </div>
            <div style="margin-top: 1rem; padding: 0.8rem; background: rgba(255,255,255,0.15); border-radius: 12px;">
                ${message}
            </div>
        </div>
    `;

    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Reset everything
function resetUniCGPA() {
    if (confirm('⚠️ This will reset all semesters and courses. Are you sure?')) {
        const semestersContainer = document.getElementById('semestersContainer');
        semestersContainer.innerHTML = '';
        globalSemesterCounter = 1;
        const firstSemester = createUniSemester(1);
        semestersContainer.appendChild(firstSemester);

        const resultDiv = document.getElementById('cgpaResult');
        resultDiv.style.display = 'none';
    }
}

// Initialize
function initUniCGPA() {
    const container = document.getElementById('semestersContainer');
    if (container && container.children.length === 0) {
        const firstSemester = createUniSemester(1);
        container.appendChild(firstSemester);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const addSemesterBtn = document.getElementById('addSemesterBtn');
    const calcBtn = document.getElementById('calcCgpaBtn');
    const resetBtn = document.getElementById('resetCgpaBtn');

    if (addSemesterBtn) addSemesterBtn.addEventListener('click', addUniSemester);
    if (calcBtn) calcBtn.addEventListener('click', calculateUniCGPA);
    if (resetBtn) resetBtn.addEventListener('click', resetUniCGPA);

    // Initialize when CGPA tab is shown
    const cgpaTab = document.querySelector('[data-tab="cgpa"]');
    if (cgpaTab) {
        cgpaTab.addEventListener('click', () => setTimeout(initUniCGPA, 100));
    }

    // Initial load if CGPA is active
    if (document.querySelector('[data-tab="cgpa"].active')) {
        initUniCGPA();
    }
});