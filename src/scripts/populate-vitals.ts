import { getPatients } from '@/lib/firebase/patients';
import { addVitalSigns } from '@/lib/firebase/vitals';
import { Timestamp } from 'firebase/firestore';

// Generate realistic vital signs based on patient age and pregnancy status
function generateRealisticVitals(patient: any) {
  const age = calculateAge(patient.dateOfBirth);
  const isPregnant = patient.isPregnant || false;
  
  // Base ranges for vital signs
  let systolicBP = { min: 90, max: 140 };
  let diastolicBP = { min: 60, max: 90 };
  let heartRate = { min: 60, max: 100 };
  let temperature = { min: 36.0, max: 37.5 };
  let bloodSugar = { min: 70, max: 140 };
  let weight = { min: 45, max: 85 };
  let oxygenSaturation = { min: 95, max: 100 };
  let respiratoryRate = { min: 12, max: 20 };

  // Adjust ranges based on age
  if (age < 20) {
    // Younger patients - generally lower BP, higher HR
    systolicBP = { min: 85, max: 120 };
    diastolicBP = { min: 55, max: 80 };
    heartRate = { min: 70, max: 110 };
    weight = { min: 40, max: 70 };
  } else if (age > 35) {
    // Older patients - slightly higher BP risk
    systolicBP = { min: 95, max: 150 };
    diastolicBP = { min: 65, max: 95 };
    heartRate = { min: 55, max: 95 };
    weight = { min: 50, max: 90 };
  }

  // Adjust for pregnancy
  if (isPregnant) {
    // Pregnant women - physiological changes
    heartRate = { min: 70, max: 120 }; // Increased HR is normal
    systolicBP = { min: 85, max: 135 }; // Slightly lower in early pregnancy
    diastolicBP = { min: 55, max: 85 };
    weight = { min: 55, max: 95 }; // Pregnancy weight gain
    respiratoryRate = { min: 14, max: 22 }; // Slightly increased
  }

  // Introduce some risk factors randomly (20% chance of elevated values)
  const hasRiskFactor = Math.random() < 0.2;
  if (hasRiskFactor) {
    const riskType = Math.random();
    if (riskType < 0.3) {
      // Hypertension
      systolicBP = { min: 140, max: 180 };
      diastolicBP = { min: 90, max: 110 };
    } else if (riskType < 0.6) {
      // Diabetes/High blood sugar
      bloodSugar = { min: 140, max: 250 };
    } else {
      // Tachycardia
      heartRate = { min: 100, max: 130 };
    }
  }

  // Generate random values within ranges
  const randomInRange = (min: number, max: number, decimals: number = 0) => {
    const value = Math.random() * (max - min) + min;
    return Number(value.toFixed(decimals));
  };

  return {
    systolicBP: randomInRange(systolicBP.min, systolicBP.max),
    diastolicBP: randomInRange(diastolicBP.min, diastolicBP.max),
    heartRate: randomInRange(heartRate.min, heartRate.max),
    temperature: randomInRange(temperature.min, temperature.max, 1),
    bloodSugar: randomInRange(bloodSugar.min, bloodSugar.max),
    weight: randomInRange(weight.min, weight.max, 1),
    oxygenSaturation: randomInRange(oxygenSaturation.min, oxygenSaturation.max),
    respiratoryRate: randomInRange(respiratoryRate.min, respiratoryRate.max)
  };
}

function calculateAge(dateOfBirth: any): number {
  if (!dateOfBirth) return 25; // Default age
  
  try {
    let birthDate: Date;
    if (dateOfBirth.toDate) {
      birthDate = dateOfBirth.toDate();
    } else {
      birthDate = new Date(dateOfBirth);
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : 25;
  } catch {
    return 25;
  }
}

// Main function to populate vital signs
export async function populateVitalSigns() {
  try {
    console.log('Starting vital signs population...');
    
    // Get all patients
    const patientsResult = await getPatients();
    if (!patientsResult.success || !patientsResult.patients) {
      throw new Error('Failed to fetch patients');
    }

    const patients = patientsResult.patients;
    console.log(`📊 Found ${patients.length} patients`);

    let successCount = 0;
    let errorCount = 0;
    const results: string[] = [];

    // Generate vital signs for each patient
    for (const patient of patients) {
      if (!patient.id) continue;

      try {
        const vitals = generateRealisticVitals(patient);
        const patientName = `${patient.firstName} ${patient.lastName}`;
        
        // Create vital signs record
        const vitalSignsData = {
          patientId: patient.id,
          patientName: patientName,
          ...vitals,
          notes: 'Generated realistic vital signs for AI training',
          recordedBy: 'System (Auto-generated)',
          recordedAt: Timestamp.now()
        };

        const result = await addVitalSigns(vitalSignsData);
        
        if (result.success) {
          successCount++;
          results.push(`${patientName}: BP ${vitals.systolicBP}/${vitals.diastolicBP}, HR ${vitals.heartRate}, Temp ${vitals.temperature}°C, BS ${vitals.bloodSugar}`);
        } else {
          errorCount++;
          results.push(`${patientName}: ${result.error}`);
        }
      } catch (error) {
        errorCount++;
        results.push(`${patient.firstName} ${patient.lastName}: ${error}`);
      }
    }

    // Summary
    console.log('\nVITAL SIGNS POPULATION SUMMARY');
    console.log('=====================================');
    console.log(`Successfully created: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Total patients processed: ${patients.length}`);
    
    console.log('\nDETAILED RESULTS:');
    results.forEach(result => console.log(result));

    console.log('\nAI MODEL IMPACT:');
    console.log('• Each patient now has unique vital signs');
    console.log('• Realistic ranges based on age and pregnancy status');
    console.log('• 20% of patients have risk factors (hypertension, diabetes, tachycardia)');
    console.log('• AI model will now have diverse data for accurate predictions');

    return {
      success: true,
      processed: patients.length,
      successful: successCount,
      errors: errorCount,
      results
    };

  } catch (error) {
    console.error('❌ Error populating vital signs:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export for use in other files
export default populateVitalSigns; 