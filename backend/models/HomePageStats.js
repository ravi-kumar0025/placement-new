import mongoose from 'mongoose';

const ProgramStatItemSchema = new mongoose.Schema({
    program: { type: String, required: true }, // e.g., 'BTech', 'MTech', 'MSc'
    average: { type: Number, default: 0 },
    median: { type: Number, default: 0 },
    highest: { type: Number, default: 0 },
    placedPercentage: { type: Number, default: 0 }
}, { _id: false });

const AcademicYearSchema = new mongoose.Schema({
    year: { type: String, required: true }, // e.g., "2023-24"
    stats: [ProgramStatItemSchema]
}, { _id: false });

const SectorDistributionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    count: { type: Number, default: 0 },
    color: { type: String, required: true } // Added color for UI customization directly from DB
}, { _id: false });

const HomePageStatsSchema = new mongoose.Schema({
    academicYears: [AcademicYearSchema],
    sectors: [SectorDistributionSchema],
    overallMetrics: {
        totalCompaniesVisited: { type: Number, default: 0 },
        overallPlacementPercentage: { type: Number, default: 0 }
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, { timestamps: true });

export default mongoose.model('HomePageStats', HomePageStatsSchema);
