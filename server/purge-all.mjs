import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const run = async () => {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    const db = mongoose.connection.db;

    const cols = await db.listCollections().toArray();
    console.log('Collections:', cols.map(c => c.name).join(', '));

    const targets = ['students', 'faculties', 'classes', 'exams', 'examgrades', 'attendances', 'marks', 'timetables'];
    for (const c of targets) {
        try {
            const r = await db.collection(c).deleteMany({});
            console.log(c + ': ' + r.deletedCount + ' deleted');
        } catch (e) {
            console.log(c + ': skip - ' + e.message);
        }
    }

    const r = await db.collection('users').deleteMany({ role: { $ne: 'admin' } });
    console.log('users (non-admin): ' + r.deletedCount + ' deleted');

    console.log('\nDONE - All data purged. Admin account preserved.');
    await mongoose.disconnect();
    process.exit(0);
};

run().catch(e => { console.error(e); process.exit(1); });
