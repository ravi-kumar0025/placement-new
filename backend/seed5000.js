const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const Student = require('./models/Student');
require('dotenv').config();

// Configuration
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/tpc_portal';
const BATCH_SIZE = 500;
const TOTAL_STUDENTS = 5000;

const BRANCHES = ['CSE', 'EE', 'ME', 'CE', 'MNC', 'ECE'];
const PROGRAMS = ['B.Tech', 'M.Tech', 'M.Sc'];
const YEARS_OF_STUDY = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
const VERIFICATION_STATUSES = ['unsubmitted', 'pending', 'verified', 'rejected'];

async function seedDatabase() {
    try {
        console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
        await mongoose.connect(MONGO_URI);
        console.log('Connected successfully.\n');

        console.log(`Preparing to seed ${TOTAL_STUDENTS} student records in batches of ${BATCH_SIZE}...`);

        let totalInserted = 0;

        for (let i = 0; i < TOTAL_STUDENTS; i += BATCH_SIZE) {
            const batch = [];
            const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_STUDENTS - i);

            for (let j = 0; j < currentBatchSize; j++) {
                const studentIndex = i + j;
                // Generate consistent fake data
                const firstName = faker.person.firstName();
                const lastName = faker.person.lastName();
                const rollNumber = `2301X${String(studentIndex).padStart(4, '0')}`; // Guaranteed unique
                const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.s${studentIndex}@iitp.ac.in`;

                const program = faker.helpers.arrayElement(PROGRAMS);
                const department = faker.helpers.arrayElement(BRANCHES);

                batch.push({
                    email: email,
                    role: 'student', // Mongoose Discriminator mapping
                    isVerified: true,

                    fullName: `${firstName} ${lastName}`,
                    rollNumber: rollNumber,
                    department: department,
                    program: program,
                    graduationYear: faker.helpers.arrayElement([2025, 2026, 2027, 2028]),
                    currentYearOfStudy: faker.helpers.arrayElement(YEARS_OF_STUDY),
                    institute: 'IIT Patna',
                    phoneNumber: faker.phone.number({ style: 'national' }),
                    cgpa: faker.number.float({ min: 5.0, max: 10.0, fractionDigits: 2 }),
                    verificationStatus: faker.helpers.arrayElement(VERIFICATION_STATUSES),
                });
            }

            // Insert the batch
            try {
                await Student.insertMany(batch, { ordered: false });
                totalInserted += currentBatchSize;
                console.log(`Inserted ${totalInserted} / ${TOTAL_STUDENTS} students...`);
            } catch (err) {
                if (err.code === 11000) {
                    // ordered: false throws a BulkWriteError but still inserts the rest
                    const insertedCount = err.result?.nInserted || 0;
                    totalInserted += insertedCount;
                    console.log(`Batch partially inserted (${insertedCount} docs) due to duplicates. Total: ${totalInserted}`);
                } else {
                    console.error('Error inserting batch:', err);
                }
            }
        }

        console.log('\n✅ Seeding complete! Inserted 5,000 students successfully.');

    } catch (error) {
        if (error.code === 11000) {
            console.warn('⚠️ Duplicate Key Error encountered. Did you already seed the database?');
        } else {
            console.error('❌ Error during seeding:', error);
        }
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    }
}

seedDatabase();
