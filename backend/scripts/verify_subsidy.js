const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Subsidy = require("../models/Subsidy");
const SubsidyApplication = require("../models/SubsidyApplication");
const User = require("../models/User");
const subsidyController = require("../controllers/subsidyController");

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.jsonData = data;
        return res;
    };
    return res;
};

const runTest = async () => {
    await connectDB();

    try {
        // 1. Setup Users
        const timestamp = Date.now();
        const adminEmail = `admin_${timestamp}@test.com`;
        const farmerEmail = `farmer_${timestamp}@test.com`;

        const admin = await User.create({
            name: "Test Admin",
            email: adminEmail,
            password: "password123",
            role: "ADMIN"
        });

        const farmer = await User.create({
            name: "Test Farmer",
            email: farmerEmail,
            password: "password123",
            role: "FARMER"
        });

        console.log("Users created.");

        // 2. Test Create Subsidy (Government Action)
        const createReq = {
            user: admin,
            body: {
                title: "Test Gov Subsidy",
                description: "Subsidy for testing",
                issuedBy: "Ministry of Testing",
                amount: 5000,
                category: "FERTILIZER",
                deadline: new Date(Date.now() + 86400000), // Tomorrow
                totalBudget: 1000000
            }
        };
        const createRes = mockRes();
        await subsidyController.createSubsidy(createReq, createRes);

        if (createRes.statusCode !== 201) {
            throw new Error(`Create Subsidy failed: ${JSON.stringify(createRes.jsonData)}`);
        }
        const subsidyId = createRes.jsonData._id;
        console.log("Subsidy created:", subsidyId);

        // 3. Test Apply Subsidy (Farmer Action)
        const applyReq = {
            user: farmer,
            body: {
                subsidyId: subsidyId,
                note: "I need this for my crop."
            }
        };
        const applyRes = mockRes();
        await subsidyController.applySubsidy(applyReq, applyRes);

        if (applyRes.statusCode !== 201) {
            throw new Error(`Apply Subsidy failed: ${JSON.stringify(applyRes.jsonData)}`);
        }
        console.log("Application success for:", applyRes.jsonData._id);

        // 4. Verify Application Data in DB
        const application = await SubsidyApplication.findById(applyRes.jsonData._id).populate("subsidy");
        if (!application) throw new Error("Application not found in DB");
        if (application.subsidy.title !== "Test Gov Subsidy") throw new Error("Subsidy title mismatch");

        console.log("Verification Passed! Cleanup starting...");

        // Cleanup
        await User.deleteOne({ _id: admin._id });
        await User.deleteOne({ _id: farmer._id });
        await Subsidy.deleteOne({ _id: subsidyId });
        await SubsidyApplication.deleteOne({ _id: application._id });

        console.log("Cleanup done.");
        process.exit(0);

    } catch (err) {
        console.error("Test Failed:", err);
        process.exit(1);
    }
};

runTest();
