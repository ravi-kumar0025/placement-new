
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Student = require('./models/Student');
const Company = require('./models/Company');
const Event = require('./models/Event');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tpc-portal';

// ── helpers ────────────────────────────────────────────────────────────────
function daysFromNow(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    d.setHours(10, 0, 0, 0);
    return d;
}

// ── data ───────────────────────────────────────────────────────────────────
const COMPANY_EMAIL = 'testcorp@company.com';

const STUDENTS = [
    { email: 'rahul.cse@iitpatna.ac.in', fullName: 'Rahul Sharma', rollNumber: '2101CS01', department: 'CSE', program: 'B.Tech', graduationYear: 2025, cgpa: 9.1 },
    { email: 'priya.ee@iitpatna.ac.in', fullName: 'Priya Mehta', rollNumber: '2101EE05', department: 'EE', program: 'B.Tech', graduationYear: 2025, cgpa: 8.7 },
    { email: 'ankit.me@iitpatna.ac.in', fullName: 'Ankit Verma', rollNumber: '2101ME11', department: 'ME', program: 'B.Tech', graduationYear: 2025, cgpa: 7.9 },
    { email: 'sneha.mtech@iitpatna.ac.in', fullName: 'Sneha Gupta', rollNumber: '2201CS02', department: 'CSE', program: 'M.Tech', graduationYear: 2024, cgpa: 9.4 },
    { email: 'vikram.ce@iitpatna.ac.in', fullName: 'Vikram Singh', rollNumber: '2101CE08', department: 'CE', program: 'B.Tech', graduationYear: 2025, cgpa: 8.2 },
];

async function seed() {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // ── 1. Remove old seed data (idempotent) ─────────────────────────────
    await User.deleteOne({ email: COMPANY_EMAIL });
    await User.deleteMany({ email: { $in: STUDENTS.map(s => s.email) } });
    console.log('🗑  Cleared previous seed records');

    // ── 2. Create verified company ────────────────────────────────────────
    const company = await Company.create({
        email: COMPANY_EMAIL,
        role: 'company',
        companyName: 'TestCorp Technologies',
        companyEmail: 'hr@testcorp.com',
        companyWebsite: 'https://testcorp.com',
        HRContactName: 'Ravi Kumar',
        HRContactEmail: 'ravi.kumar@testcorp.com',
        contactNumber: '9876543210',
        verificationStatus: 'verified',
    });
    console.log(`🏢 Company created: ${company.companyName}  (login: ${COMPANY_EMAIL})`);

    // ── 3. Create student accounts ────────────────────────────────────────
    const createdStudents = [];
    for (const s of STUDENTS) {
        const student = await Student.create({ ...s, role: 'student', verificationStatus: 'verified' });
        createdStudents.push(student);
        console.log(`👤 Student: ${s.fullName} <${s.email}>`);
    }

    // ── 4. Create events owned by the company ────────────────────────────
    const appliedToInternship = STUDENTS.slice(0, 3).map(s => s.email);   // first 3
    const appliedToPlacement = STUDENTS.slice(1, 5).map(s => s.email);   // last 4

    const events = await Event.insertMany([
        {
            title: 'TestCorp Summer Internship 2026',
            description: 'A 10-week paid internship at TestCorp HQ. Work on live products.\nStipend: ₹60,000/month | Location: Bangalore\nEligible: B.Tech CSE / EE / ME (2025 batch)',
            startDate: daysFromNow(15),
            endDate: daysFromNow(85),
            type: 'internship',
            targetBranches: ['CSE', 'EE', 'ME'],
            deadline: daysFromNow(10),
            appliedStudents: appliedToInternship,
            links: [{ label: 'Apply Here', url: 'https://testcorp.com/internship2026' }],
            createdBy: company._id,
        },
        {
            title: 'TestCorp SDE Campus Placement Drive',
            description: 'Full-time SDE role at TestCorp.\nCTC: 24–36 LPA | Roles: Frontend, Backend, Fullstack\n4 rounds: Online Test → DSA → System Design → HR\nEligible: B.Tech/M.Tech CSE (CGPA ≥ 7.5)',
            startDate: daysFromNow(30),
            endDate: daysFromNow(32),
            type: 'placement_drive',
            targetBranches: ['CSE'],
            deadline: daysFromNow(25),
            appliedStudents: appliedToPlacement,
            links: [{ label: 'JD & Registration', url: 'https://testcorp.com/placement2026' }],
            createdBy: company._id,
        },
    ]);
    console.log(`\n📅 Events created:`);
    events.forEach(e =>
        console.log(`   • "${e.title}"  (${e.type})  — ${e.appliedStudents.length} applicant(s)`)
    );

    // ── 5. Link event IDs into company.events ────────────────────────────
    await Company.findByIdAndUpdate(company._id, {
        $set: { events: events.map(e => e._id) }
    });
    console.log('\n🔗 company.events array updated');

    // ── Summary ───────────────────────────────────────────────────────────
    console.log('\n──────────────────────────────────────────────────────────');
    console.log('   Seed complete!  Log in as the company to test:\n');
    console.log(`   Company login  →  ${COMPANY_EMAIL}  (role: company)`);
    console.log('   Then open "Student Database" — select the event in the');
    console.log('   dropdown to see only its applicants.\n');
    console.log('   Applicants per event:');
    console.log(`   • Summer Internship  →  ${appliedToInternship.join(', ')}`);
    console.log(`   • Placement Drive    →  ${appliedToPlacement.join(', ')}`);
    console.log('──────────────────────────────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => {
    console.error('Seed Error:', err.message);
    process.exit(1);
});
