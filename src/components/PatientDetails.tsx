        {/* AI Risk Assessment */}
        {aiPrediction && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Brain className="mr-2 text-blue-600" size={20} />
              AI Risk Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Risk Level:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      aiPrediction.risk_level === 'High'
                        ? 'bg-red-100 text-red-800'
                        : aiPrediction.risk_level === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {aiPrediction.risk_level} Risk
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Confidence:</span>
                  <span className="text-sm">{(aiPrediction.confidence * 100).toFixed(1)}%</span>
                </div>
                {aiPrediction.details?.risk_score && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Risk Score:</span>
                    <span className="text-sm">{aiPrediction.details.risk_score}/100</span>
                  </div>
                )}
              </div>
              
              {aiPrediction.details?.risk_factors && (
                <div>
                  <span className="text-sm font-medium">Risk Factors:</span>
                  <ul className="mt-1 text-sm space-y-1">
                    {aiPrediction.details.risk_factors.map((factor: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span className="text-gray-700">{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Vital Signs Used for Prediction */}
            {aiPrediction.details?.vital_signs && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-600">Vital Signs Used for Analysis:</span>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div>Age: {aiPrediction.details.vital_signs.age} years</div>
                  <div>BP: {aiPrediction.details.vital_signs.systolic_bp}/{aiPrediction.details.vital_signs.diastolic_bp}</div>
                  <div>Blood Sugar: {aiPrediction.details.vital_signs.blood_sugar} mmol/L</div>
                  <div>Temperature: {aiPrediction.details.vital_signs.body_temp}°F</div>
                  <div>Heart Rate: {aiPrediction.details.vital_signs.heart_rate} bpm</div>
                </div>
              </div>
            )}
            
            <div className="mt-3 text-xs text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        )} 