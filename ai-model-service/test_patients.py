import requests
import json
import pandas as pd
from typing import Dict, List

# Test patients data
test_patients = [
    # LOW RISK PROFILES
    {
        'patient_id': 'PT001',
        'name': 'Sarah Johnson - Ideal Young Mother',
        'age_group': 'Young Adult',
        'risk_category': 'Low Risk',
        'data': {
            'Age': 24,
            'SystolicBP': 108,
            'DiastolicBP': 68,
            'BS': 5.1,
            'BodyTemp': 98.4,
            'HeartRate': 70
        },
        'clinical_notes': 'First pregnancy, excellent health, regular exercise'
    },
    {
        'patient_id': 'PT002',
        'name': 'Maria Rodriguez - Healthy Second Pregnancy',
        'age_group': 'Prime Reproductive',
        'risk_category': 'Low Risk',
        'data': {
            'Age': 28,
            'SystolicBP': 112,
            'DiastolicBP': 72,
            'BS': 5.4,
            'BodyTemp': 98.6,
            'HeartRate': 74
        },
        'clinical_notes': 'Second pregnancy, previous uncomplicated delivery'
    },
    {
        'patient_id': 'PT003',
        'name': 'Jennifer Chen - Optimal Health Metrics',
        'age_group': 'Prime Reproductive',
        'risk_category': 'Low Risk',
        'data': {
            'Age': 30,
            'SystolicBP': 115,
            'DiastolicBP': 75,
            'BS': 5.8,
            'BodyTemp': 98.8,
            'HeartRate': 76
        },
        'clinical_notes': 'Third pregnancy, excellent prenatal care compliance'
    },
    
    # MODERATE RISK PROFILES
    {
        'patient_id': 'PT004',
        'name': 'Lisa Thompson - Borderline Hypertension',
        'age_group': 'Mature Reproductive',
        'risk_category': 'Mid Risk',
        'data': {
            'Age': 34,
            'SystolicBP': 138,
            'DiastolicBP': 88,
            'BS': 6.9,
            'BodyTemp': 99.0,
            'HeartRate': 82
        },
        'clinical_notes': 'Mild pregnancy-induced hypertension, monitoring needed'
    },
    {
        'patient_id': 'PT005',
        'name': 'Rebecca Davis - Gestational Diabetes Risk',
        'age_group': 'Mature Reproductive',
        'risk_category': 'Mid Risk',
        'data': {
            'Age': 32,
            'SystolicBP': 125,
            'DiastolicBP': 82,
            'BS': 8.2,
            'BodyTemp': 99.1,
            'HeartRate': 85
        },
        'clinical_notes': 'Family history of diabetes, elevated glucose levels'
    },
    {
        'patient_id': 'PT006',
        'name': 'Amanda White - Multiple Moderate Factors',
        'age_group': 'Mature Reproductive',
        'risk_category': 'Mid Risk',
        'data': {
            'Age': 36,
            'SystolicBP': 142,
            'DiastolicBP': 90,
            'BS': 7.8,
            'BodyTemp': 99.3,
            'HeartRate': 88
        },
        'clinical_notes': 'Advanced maternal age, mild hypertension'
    },
    
    # HIGH RISK PROFILES
    {
        'patient_id': 'PT007',
        'name': 'Patricia Williams - Severe Preeclampsia Risk',
        'age_group': 'Advanced Maternal Age',
        'risk_category': 'High Risk',
        'data': {
            'Age': 41,
            'SystolicBP': 168,
            'DiastolicBP': 108,
            'BS': 9.5,
            'BodyTemp': 100.8,
            'HeartRate': 102
        },
        'clinical_notes': 'Previous preeclampsia, chronic hypertension'
    },
    {
        'patient_id': 'PT008',
        'name': 'Michelle Brown - Multiple Comorbidities',
        'age_group': 'Advanced Maternal Age',
        'risk_category': 'High Risk',
        'data': {
            'Age': 44,
            'SystolicBP': 175,
            'DiastolicBP': 115,
            'BS': 11.2,
            'BodyTemp': 101.5,
            'HeartRate': 110
        },
        'clinical_notes': 'Type 2 diabetes, chronic hypertension, obesity'
    },
    {
        'patient_id': 'PT009',
        'name': 'Karen Martinez - Critical Risk Factors',
        'age_group': 'Advanced Maternal Age',
        'risk_category': 'High Risk',
        'data': {
            'Age': 43,
            'SystolicBP': 180,
            'DiastolicBP': 120,
            'BS': 12.8,
            'BodyTemp': 102.0,
            'HeartRate': 115
        },
        'clinical_notes': 'Emergency presentation, severe symptoms'
    },
    
    # EDGE CASES AND SPECIAL SCENARIOS
    {
        'patient_id': 'PT010',
        'name': 'Ashley Garcia - Young High BP',
        'age_group': 'Young Adult',
        'risk_category': 'Edge Case',
        'data': {
            'Age': 21,
            'SystolicBP': 158,
            'DiastolicBP': 98,
            'BS': 6.0,
            'BodyTemp': 98.2,
            'HeartRate': 78
        },
        'clinical_notes': 'Unexpectedly high BP in young patient'
    },
    {
        'patient_id': 'PT011',
        'name': 'Nicole Taylor - Fever with Normal BP',
        'age_group': 'Prime Reproductive',
        'risk_category': 'Edge Case',
        'data': {
            'Age': 27,
            'SystolicBP': 118,
            'DiastolicBP': 76,
            'BS': 5.9,
            'BodyTemp': 102.2,
            'HeartRate': 95
        },
        'clinical_notes': 'High fever, possible infection, normal BP'
    },
    {
        'patient_id': 'PT012',
        'name': 'Stephanie Lee - Hypoglycemia Case',
        'age_group': 'Prime Reproductive',
        'risk_category': 'Edge Case',
        'data': {
            'Age': 29,
            'SystolicBP': 122,
            'DiastolicBP': 78,
            'BS': 3.8,  # Low blood sugar
            'BodyTemp': 97.8,
            'HeartRate': 68
        },
        'clinical_notes': 'Hypoglycemia, possible eating disorder history'
    },
    {
        'patient_id': 'PT013',
        'name': 'Rachel Anderson - Tachycardia Focus',
        'age_group': 'Prime Reproductive',
        'risk_category': 'Edge Case',
        'data': {
            'Age': 31,
            'SystolicBP': 128,
            'DiastolicBP': 80,
            'BS': 6.5,
            'BodyTemp': 98.9,
            'HeartRate': 125  # High heart rate
        },
        'clinical_notes': 'Persistent tachycardia, anxiety-related'
    },
    
    # BORDERLINE CASES
    {
        'patient_id': 'PT014',
        'name': 'Melissa Jackson - Borderline Everything',
        'age_group': 'Mature Reproductive',
        'risk_category': 'Borderline',
        'data': {
            'Age': 35,
            'SystolicBP': 139,  # Just under high
            'DiastolicBP': 89,   # Just under high
            'BS': 7.0,           # Borderline
            'BodyTemp': 99.9,    # Just under fever
            'HeartRate': 89      # Upper normal
        },
        'clinical_notes': 'All metrics at decision boundaries'
    },
    {
        'patient_id': 'PT015',
        'name': 'Diana Wilson - Pre-diabetes Profile',
        'age_group': 'Mature Reproductive',
        'risk_category': 'Borderline',
        'data': {
            'Age': 33,
            'SystolicBP': 130,
            'DiastolicBP': 85,
            'BS': 7.9,  # Pre-diabetic range
            'BodyTemp': 99.0,
            'HeartRate': 84
        },
        'clinical_notes': 'Pre-diabetes, family history positive'
    },
    
    # EXTREME CASES
    {
        'patient_id': 'PT016',
        'name': 'Catherine Moore - Maximum Risk',
        'age_group': 'Very Advanced Age',
        'risk_category': 'Extreme High Risk',
        'data': {
            'Age': 47,
            'SystolicBP': 190,
            'DiastolicBP': 125,
            'BS': 15.2,
            'BodyTemp': 103.0,
            'HeartRate': 125
        },
        'clinical_notes': 'Multiple severe comorbidities, emergency case'
    },
    {
        'patient_id': 'PT017',
        'name': 'Emma Thompson - Teen Pregnancy',
        'age_group': 'Adolescent',
        'risk_category': 'Special Population',
        'data': {
            'Age': 17,
            'SystolicBP': 115,
            'DiastolicBP': 75,
            'BS': 5.5,
            'BodyTemp': 98.5,
            'HeartRate': 72
        },
        'clinical_notes': 'Teenage pregnancy, social support concerns'
    },
    {
        'patient_id': 'PT018',
        'name': 'Helen Roberts - Geriatric Pregnancy',
        'age_group': 'Geriatric Pregnancy',
        'risk_category': 'Special Population',
        'data': {
            'Age': 48,
            'SystolicBP': 145,
            'DiastolicBP': 92,
            'BS': 8.8,
            'BodyTemp': 99.5,
            'HeartRate': 88
        },
        'clinical_notes': 'Very advanced maternal age, high-risk pregnancy'
    },
    
    # TWIN PREGNANCY SIMULATION
    {
        'patient_id': 'PT019',
        'name': 'Laura Phillips - Twin Pregnancy',
        'age_group': 'Prime Reproductive',
        'risk_category': 'Multiple Gestation',
        'data': {
            'Age': 30,
            'SystolicBP': 148,  # Higher due to twins
            'DiastolicBP': 92,
            'BS': 7.5,
            'BodyTemp': 99.2,
            'HeartRate': 92
        },
        'clinical_notes': 'Twin pregnancy, increased cardiovascular load'
    },
    
    # POST-COVID COMPLICATIONS
    {
        'patient_id': 'PT020',
        'name': 'Victoria Evans - Post-COVID',
        'age_group': 'Prime Reproductive',
        'risk_category': 'Post-Viral',
        'data': {
            'Age': 29,
            'SystolicBP': 135,
            'DiastolicBP': 88,
            'BS': 6.8,
            'BodyTemp': 99.8,  # Persistent low fever
            'HeartRate': 98    # Elevated resting HR
        },
        'clinical_notes': 'Recent COVID-19, lingering cardiovascular effects'
    }
]

# Expected results from your table
expected_results = {
    'PT001': {'predicted_risk': 'low risk', 'confidence': 0.674},
    'PT002': {'predicted_risk': 'mid risk', 'confidence': 0.556},
    'PT003': {'predicted_risk': 'mid risk', 'confidence': 0.735},
    'PT004': {'predicted_risk': 'high risk', 'confidence': 0.982},
    'PT005': {'predicted_risk': 'high risk', 'confidence': 0.788},
    'PT006': {'predicted_risk': 'high risk', 'confidence': 0.990},
    'PT007': {'predicted_risk': 'high risk', 'confidence': 0.997},
    'PT008': {'predicted_risk': 'high risk', 'confidence': 0.997},
    'PT009': {'predicted_risk': 'high risk', 'confidence': 0.998},
    'PT010': {'predicted_risk': 'high risk', 'confidence': 0.675},
    'PT011': {'predicted_risk': 'mid risk', 'confidence': 0.606},
    'PT012': {'predicted_risk': 'mid risk', 'confidence': 0.831},
    'PT013': {'predicted_risk': 'low risk', 'confidence': 0.612},
    'PT014': {'predicted_risk': 'high risk', 'confidence': 0.988},
    'PT015': {'predicted_risk': 'high risk', 'confidence': 0.701},
    'PT016': {'predicted_risk': 'high risk', 'confidence': 0.998},
    'PT017': {'predicted_risk': 'mid risk', 'confidence': 0.583},
    'PT018': {'predicted_risk': 'high risk', 'confidence': 0.989},
    'PT019': {'predicted_risk': 'high risk', 'confidence': 0.990},
    'PT020': {'predicted_risk': 'high risk', 'confidence': 0.968}
}

def convert_to_api_format(patient_data: Dict) -> Dict:
    """Convert patient data to API format"""
    data = patient_data['data']
    return {
        'age': data['Age'],
        'systolic_bp': data['SystolicBP'],
        'diastolic_bp': data['DiastolicBP'],
        'blood_sugar': data['BS'] * 18,  # Convert mmol/L to mg/dL
        'body_temp': (data['BodyTemp'] - 32) * 5/9,  # Convert F to C
        'heart_rate': data['HeartRate']
    }

def test_patient_predictions():
    """Test all patients and compare with expected results"""
    api_url = "http://localhost:8000/predict"
    results = []
    
    print("🧪 Testing AI Model with 20 Patient Profiles")
    print("=" * 80)
    
    for patient in test_patients:
        patient_id = patient['patient_id']
        name = patient['name']
        expected = expected_results.get(patient_id, {})
        
        # Convert data to API format
        api_data = convert_to_api_format(patient)
        
        try:
            # Make API request
            response = requests.post(api_url, json=api_data, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            predicted_risk = result['predicted_risk']
            confidence = round(result['confidence'], 3)
            
            # Compare with expected
            expected_risk = expected.get('predicted_risk', 'N/A')
            expected_conf = expected.get('confidence', 0)
            
            risk_match = predicted_risk == expected_risk
            conf_diff = abs(confidence - expected_conf) if expected_conf > 0 else 0
            
            # Status indicators
            risk_status = "✅" if risk_match else "❌"
            conf_status = "✅" if conf_diff < 0.1 else "⚠️" if conf_diff < 0.2 else "❌"
            
            print(f"\n{patient_id}: {name.split(' - ')[0]}")
            print(f"  Expected: {expected_risk} ({expected_conf:.3f})")
            print(f"  Actual:   {predicted_risk} ({confidence:.3f}) {risk_status} {conf_status}")
            print(f"  Category: {patient['risk_category']}")
            
            if not risk_match:
                print(f"  ⚠️  RISK MISMATCH: Expected {expected_risk}, got {predicted_risk}")
            
            if conf_diff > 0.1:
                print(f"  ⚠️  CONFIDENCE DIFF: {conf_diff:.3f}")
            
            results.append({
                'patient_id': patient_id,
                'name': name.split(' - ')[0],
                'expected_risk': expected_risk,
                'predicted_risk': predicted_risk,
                'expected_confidence': expected_conf,
                'actual_confidence': confidence,
                'risk_match': risk_match,
                'confidence_diff': conf_diff,
                'category': patient['risk_category']
            })
            
        except requests.exceptions.RequestException as e:
            print(f"\n❌ {patient_id}: API Error - {e}")
            results.append({
                'patient_id': patient_id,
                'name': name.split(' - ')[0],
                'error': str(e)
            })
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 SUMMARY")
    print("=" * 80)
    
    valid_results = [r for r in results if 'error' not in r]
    if valid_results:
        risk_matches = sum(1 for r in valid_results if r['risk_match'])
        conf_close = sum(1 for r in valid_results if r['confidence_diff'] < 0.1)
        
        print(f"Total Patients Tested: {len(valid_results)}")
        print(f"Risk Prediction Matches: {risk_matches}/{len(valid_results)} ({risk_matches/len(valid_results)*100:.1f}%)")
        print(f"Confidence Close (±0.1): {conf_close}/{len(valid_results)} ({conf_close/len(valid_results)*100:.1f}%)")
        
        # Risk category breakdown
        risk_categories = {}
        for r in valid_results:
            category = r['category']
            if category not in risk_categories:
                risk_categories[category] = {'total': 0, 'matches': 0}
            risk_categories[category]['total'] += 1
            if r['risk_match']:
                risk_categories[category]['matches'] += 1
        
        print(f"\n📈 Performance by Category:")
        for category, stats in risk_categories.items():
            accuracy = stats['matches'] / stats['total'] * 100
            print(f"  {category}: {stats['matches']}/{stats['total']} ({accuracy:.1f}%)")
    
    return results

if __name__ == "__main__":
    results = test_patient_predictions() 