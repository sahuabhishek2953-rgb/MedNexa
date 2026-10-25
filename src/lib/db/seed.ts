import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/index";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("Seeding MedNexa database...");

  // 1. Create Sample Patients
  const [p1, p2, p3] = await db
    .insert(schema.patients)
    .values([
      {
        name: "Rajesh Kumar Sharma",
        age: 48,
        gender: "male",
        phone: "+91 98230 45671",
        email: "rajesh.sharma@example.com",
        address: "Flat 402, Sunrise Towers, Andheri East, Mumbai",
        medicalHistory: "Type 2 Diabetes, Mild Hypertension under control",
        allergies: ["Penicillin", "Sulfa drugs"],
      },
      {
        name: "Pooja Verma",
        age: 32,
        gender: "female",
        phone: "+91 97112 88923",
        email: "pooja.verma@example.com",
        address: "B-12, Sector 62, Noida",
        medicalHistory: "Seasonal allergic rhinitis, Asthma history in childhood",
        allergies: ["Aspirin"],
      },
      {
        name: "Amit Patel",
        age: 61,
        gender: "male",
        phone: "+91 94260 12890",
        email: "amit.patel@example.com",
        address: "7, Shanti Nagar, Ellisbridge, Ahmedabad",
        medicalHistory: "Post-cholecystectomy, Hyperlipidemia",
        allergies: [],
      },
    ])
    .returning();

  console.log("Created 3 patients");

  // 2. Create Sample Prescriptions
  await db.insert(schema.prescriptions).values([
    {
      patientId: p1.id,
      imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
      imageKey: "prescription_rajesh_01.jpg",
      rawOcrText: `Dr. Ramesh Gupta MD (Med)\nApex Clinic, Mumbai\nDate: 24/10/2026\nPatient: Rajesh Kumar, 48M\nRx:\n1. Tab Metformin 500mg - 1-0-1 after meals (30 days)\n2. Tab Telmisartan 40mg - 1-0-0 morning (30 days)\n3. Tab Atorvastatin 10mg - 0-0-1 bedtime (30 days)\nAdvice: Walk 30 min daily, low carb diet.\nReview in 1 month with HbA1c.`,
      ocrConfidence: 94,
      correctedText: `Dr. Ramesh Gupta, MD (General Medicine)\nApex Healthcare Clinic, Andheri, Mumbai\nPrescription Date: 24/10/2026\nPatient: Rajesh Kumar Sharma (48 / Male)\n\nDiagnosis: Type 2 Diabetes Mellitus with Mild Essential Hypertension\n\nPrescribed Medications:\n1. Tab Metformin 500 mg - 1 tablet twice daily after meals for 30 days\n2. Tab Telmisartan 40 mg - 1 tablet once daily in the morning for 30 days\n3. Tab Atorvastatin 10 mg - 1 tablet once daily at bedtime for 30 days\n\nLifestyle Advice:\n- Brisk walking 30 minutes daily\n- Low carbohydrate and low sodium diet\n- Regular blood pressure and fasting sugar monitoring\n\nFollow-up: Repeat fasting blood glucose and HbA1c after 4 weeks.`,
      doctorName: "Dr. Ramesh Gupta, MD",
      clinicName: "Apex Healthcare Clinic",
      prescriptionDate: "24/10/2026",
      diagnosis: "Type 2 Diabetes & Mild Hypertension",
      summary: "Patient managed for T2DM and Stage 1 Hypertension with Metformin, Telmisartan, and Atorvastatin. Advised daily exercise and low GI diet.",
      medicines: [
        {
          name: "Metformin",
          dosage: "500 mg",
          frequency: "Twice daily (1-0-1)",
          duration: "30 days",
          instructions: "Take with or immediately after meals",
        },
        {
          name: "Telmisartan",
          dosage: "40 mg",
          frequency: "Once daily in morning (1-0-0)",
          duration: "30 days",
          instructions: "Take with a glass of water after breakfast",
        },
        {
          name: "Atorvastatin",
          dosage: "10 mg",
          frequency: "Once daily at night (0-0-1)",
          duration: "30 days",
          instructions: "Bedtime administration",
        },
      ],
      importantFindings: [
        "Patient has known Penicillin and Sulfa allergy",
        "HbA1c monitoring due in 4 weeks",
      ],
      tags: ["Diabetes", "Hypertension", "Cardiology", "Chronic Care"],
      status: "approved",
      isVerified: true,
      important: true,
      doctorNotes: "Patient compliant with medication. Blood pressure recorded at 134/86 mmHg in clinic today. Continue same dosages.",
      imageQuality: {
        isBlurry: false,
        blurScore: 92,
        isWellLit: true,
        brightnessScore: 90,
        isAngled: false,
        overallScore: 95,
      },
    },
    {
      patientId: p2.id,
      imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80",
      imageKey: "prescription_pooja_acute.jpg",
      rawOcrText: `Dr. Neha Kapoor MBBS DNB\nCarewell Clinic, Noida\nPt: Pooja Verma 32F\nDx: Acute Bronchitis\nRx:\n1. Tab Augmentin 625 1-0-1 x 5d\n2. Tab Levocetirizine 5mg 0-0-1 x 5d\n3. Syp Ascoril D 2 tsp tds x 5d\n4. Tab Paracetamol 650 sos fever`,
      ocrConfidence: 76,
      correctedText: `Dr. Neha Kapoor, MBBS, DNB\nCarewell Family Clinic, Noida\nPrescription Date: 25/10/2026\nPatient: Pooja Verma (32 / Female)\n\nDiagnosis: Acute Bronchitis with Upper Respiratory Tract Infection\n\nPrescribed Medications:\n1. Tab Possibly Augmentin (Amoxicillin + Clavulanate) 625 mg - 1 tab twice daily for 5 days\n2. Tab Levocetirizine 5 mg - 1 tab at bedtime for 5 days\n3. Cough Syrup Ascoril D - 10 ml three times daily for 5 days\n4. Tab Paracetamol 650 mg - 1 tab as needed for fever/bodyache (max 3/day)\n\nDoctor Warning: Check allergy before starting Amoxicillin.`,
      doctorName: "Dr. Neha Kapoor",
      clinicName: "Carewell Family Clinic",
      prescriptionDate: "25/10/2026",
      diagnosis: "Acute Bronchitis & Cough",
      summary: "Patient presenting with productive cough and mild fever. Antibiotic course prescribed along with antihistamine and antitussive syrup.",
      medicines: [
        {
          name: "Possibly Augmentin 625",
          dosage: "625 mg",
          frequency: "Twice daily (1-0-1)",
          duration: "5 days",
          instructions: "Take after food",
        },
        {
          name: "Levocetirizine",
          dosage: "5 mg",
          frequency: "Night only (0-0-1)",
          duration: "5 days",
          instructions: "May cause drowsiness",
        },
        {
          name: "Syp Ascoril D",
          dosage: "10 ml (2 tsp)",
          frequency: "Three times daily (1-1-1)",
          duration: "5 days",
          instructions: "Shake well before use",
        },
        {
          name: "Paracetamol",
          dosage: "650 mg",
          frequency: "SOS / As needed",
          duration: "3 days",
          instructions: "Gap of at least 6 hours between doses",
        },
      ],
      importantFindings: [
        "Unclear antibiotic handwriting on raw scan - flagged for verification",
        "Advise steam inhalation twice daily",
      ],
      tags: ["Respiratory", "Cough", "Fever", "Antibiotic"],
      status: "review",
      isVerified: false,
      important: false,
      doctorNotes: "Needs verification of antibiotic tolerance before finalizing record.",
      imageQuality: {
        isBlurry: false,
        blurScore: 78,
        isWellLit: true,
        brightnessScore: 82,
        isAngled: true,
        overallScore: 75,
      },
    },
    {
      patientId: p3.id,
      imageUrl: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=800&auto=format&fit=crop&q=80",
      imageKey: "prescription_amit_ortho.jpg",
      rawOcrText: `Dr. Aniket Joshi MS (Ortho)\nCity Ortho Center\nPt: Amit Patel 61M\nOA Knee Bilateral\nTab Aceclofenac + Paracetamol 1-0-1 x 7d\nCap Omeprazole 20mg 1-0-0 b/f x 7d\nTab Glucosamine 1500mg 1-0-0 x 30d\nPhysiotherapy quadriceps exercises`,
      ocrConfidence: 88,
      correctedText: `Dr. Aniket Joshi, MS (Orthopaedics)\nCity Orthopaedic Center\nPrescription Date: 20/10/2026\nPatient: Amit Patel (61 / Male)\n\nDiagnosis: Bilateral Knee Osteoarthritis (Grade 2)\n\nPrescribed Medications:\n1. Tab Aceclofenac 100mg + Paracetamol 325mg - Twice daily after meals for 7 days\n2. Cap Omeprazole 20mg - Once daily before breakfast for 7 days\n3. Tab Glucosamine Sulfate 1500mg - Once daily for 30 days\n\nPhysiotherapy:\n- Isometric quadriceps exercises\n- Avoid deep squatting and cross-legged sitting`,
      doctorName: "Dr. Aniket Joshi, MS",
      clinicName: "City Orthopaedic Center",
      prescriptionDate: "20/10/2026",
      diagnosis: "Bilateral Knee Osteoarthritis",
      summary: "Senior patient with chronic knee joint pain. Prescribed short NSAID course with gastroprotective PPI and long-term joint supplement with physiotherapy advice.",
      medicines: [
        {
          name: "Aceclofenac + Paracetamol",
          dosage: "100mg / 325mg",
          frequency: "Twice daily (1-0-1)",
          duration: "7 days",
          instructions: "Strictly after food",
        },
        {
          name: "Omeprazole",
          dosage: "20 mg",
          frequency: "Morning before food (1-0-0)",
          duration: "7 days",
          instructions: "30 mins before breakfast",
        },
        {
          name: "Glucosamine Sulfate",
          dosage: "1500 mg",
          frequency: "Once daily (1-0-0)",
          duration: "30 days",
          instructions: "Cartilage support",
        },
      ],
      importantFindings: [
        "Weight management and knee strengthening exercises recommended",
      ],
      tags: ["Orthopaedics", "Joint Pain", "Senior Care", "Pain Relief"],
      status: "approved",
      isVerified: true,
      important: true,
      doctorNotes: "Review knee mobility in 3 weeks. Advised hot fomentation.",
      imageQuality: {
        isBlurry: false,
        blurScore: 89,
        isWellLit: true,
        brightnessScore: 87,
        isAngled: false,
        overallScore: 88,
      },
    },
  ]);

  console.log("Seeded prescriptions successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
