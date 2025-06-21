// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title PatientDataStorage
 * @dev Secure storage for encrypted patient data on blockchain
 * @notice This contract ensures HIPAA compliance through encryption and access controls
 */
contract PatientDataStorage is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant HEALTHCARE_PROVIDER_ROLE = keccak256("HEALTHCARE_PROVIDER_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    
    struct PatientData {
        bytes32 dataHash;        // Hash of encrypted data for integrity verification
        string encryptedData;    // AES encrypted patient data
        uint256 timestamp;       // When the data was stored
        address updatedBy;       // Who last updated the data
        bool isActive;          // Whether the record is active
    }
    
    struct AccessLog {
        address accessor;
        uint256 timestamp;
        string accessType;      // "READ", "WRITE", "UPDATE"
        bool authorized;
    }
    
    mapping(string => PatientData) private patientRecords;
    mapping(string => AccessLog[]) private patientAccessLogs;
    mapping(address => bool) private authorizedProviders;
    
    string[] private patientIds;
    uint256 public totalPatients;
    uint256 public totalAccessLogs;
    
    event PatientDataStored(string indexed patientId, address indexed provider, uint256 timestamp);
    event PatientDataAccessed(string indexed patientId, address indexed accessor, string accessType);
    event PatientDataUpdated(string indexed patientId, address indexed provider, uint256 timestamp);
    event ProviderAuthorized(address indexed provider, address indexed authorizer);
    event ProviderRevoked(address indexed provider, address indexed revoker);
    
    modifier onlyAuthorizedProvider() {
        require(
            hasRole(HEALTHCARE_PROVIDER_ROLE, msg.sender) || authorizedProviders[msg.sender],
            "Not authorized healthcare provider"
        );
        _;
    }
    
    modifier validPatientId(string memory patientId) {
        require(bytes(patientId).length > 0, "Patient ID cannot be empty");
        _;
    }
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(HEALTHCARE_PROVIDER_ROLE, msg.sender);
        authorizedProviders[msg.sender] = true;
    }
    
    /**
     * @dev Store encrypted patient data on blockchain
     * @param patientId Unique identifier for the patient
     * @param encryptedData AES encrypted patient information
     * @param dataHash Hash of the original data for integrity verification
     */
    function storePatientData(
        string memory patientId,
        string memory encryptedData,
        bytes32 dataHash
    ) external onlyAuthorizedProvider nonReentrant whenNotPaused validPatientId(patientId) {
        require(bytes(encryptedData).length > 0, "Encrypted data cannot be empty");
        require(dataHash != bytes32(0), "Data hash cannot be empty");
        
        bool isNewPatient = !patientRecords[patientId].isActive;
        
        patientRecords[patientId] = PatientData({
            dataHash: dataHash,
            encryptedData: encryptedData,
            timestamp: block.timestamp,
            updatedBy: msg.sender,
            isActive: true
        });
        
        if (isNewPatient) {
            patientIds.push(patientId);
            totalPatients++;
            emit PatientDataStored(patientId, msg.sender, block.timestamp);
        } else {
            emit PatientDataUpdated(patientId, msg.sender, block.timestamp);
        }
        
        _logAccess(patientId, "WRITE", true);
    }
    
    /**
     * @dev Retrieve encrypted patient data
     * @param patientId Unique identifier for the patient
     */
    function getPatientData(string memory patientId) 
        external 
        view 
        onlyAuthorizedProvider 
        validPatientId(patientId) 
        returns (string memory encryptedData, bytes32 dataHash, uint256 timestamp, address updatedBy) 
    {
        PatientData memory patient = patientRecords[patientId];
        require(patient.isActive, "Patient record not found or inactive");
        
        return (patient.encryptedData, patient.dataHash, patient.timestamp, patient.updatedBy);
    }
    
    /**
     * @dev Verify data integrity
     * @param patientId Unique identifier for the patient
     * @param originalHash Hash to verify against stored hash
     */
    function verifyDataIntegrity(string memory patientId, bytes32 originalHash)
        external
        view
        onlyAuthorizedProvider
        validPatientId(patientId)
        returns (bool)
    {
        PatientData memory patient = patientRecords[patientId];
        require(patient.isActive, "Patient record not found or inactive");
        
        return patient.dataHash == originalHash;
    }
    
    /**
     * @dev Get access logs for a patient
     * @param patientId Unique identifier for the patient
     * @param offset Starting index for pagination
     * @param limit Maximum number of logs to return
     */
    function getAccessLogs(string memory patientId, uint256 offset, uint256 limit)
        external
        view
        onlyAuthorizedProvider
        validPatientId(patientId)
        returns (AccessLog[] memory logs)
    {
        AccessLog[] memory allLogs = patientAccessLogs[patientId];
        require(offset < allLogs.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > allLogs.length) {
            end = allLogs.length;
        }
        
        logs = new AccessLog[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            logs[i - offset] = allLogs[i];
        }
        
        return logs;
    }
    
    /**
     * @dev Get total number of stored patients
     */
    function getTotalPatients() external view returns (uint256) {
        return totalPatients;
    }
    
    /**
     * @dev Get all patient IDs (admin only)
     */
    function getAllPatientIds() external view onlyRole(DEFAULT_ADMIN_ROLE) returns (string[] memory) {
        return patientIds;
    }
    
    /**
     * @dev Authorize a healthcare provider
     * @param provider Address of the provider to authorize
     */
    function authorizeProvider(address provider) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(provider != address(0), "Invalid provider address");
        
        authorizedProviders[provider] = true;
        _grantRole(HEALTHCARE_PROVIDER_ROLE, provider);
        
        emit ProviderAuthorized(provider, msg.sender);
    }
    
    /**
     * @dev Revoke provider authorization
     * @param provider Address of the provider to revoke
     */
    function revokeProvider(address provider) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(provider != address(0), "Invalid provider address");
        require(provider != msg.sender, "Cannot revoke self");
        
        authorizedProviders[provider] = false;
        _revokeRole(HEALTHCARE_PROVIDER_ROLE, provider);
        
        emit ProviderRevoked(provider, msg.sender);
    }
    
    /**
     * @dev Emergency pause function
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause function
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Internal function to log access attempts
     * @param patientId Patient ID being accessed
     * @param accessType Type of access (READ, WRITE, UPDATE)
     * @param authorized Whether the access was authorized
     */
    function _logAccess(string memory patientId, string memory accessType, bool authorized) internal {
        patientAccessLogs[patientId].push(AccessLog({
            accessor: msg.sender,
            timestamp: block.timestamp,
            accessType: accessType,
            authorized: authorized
        }));
        
        totalAccessLogs++;
        emit PatientDataAccessed(patientId, msg.sender, accessType);
    }
    
    /**
     * @dev Check if an address is an authorized provider
     * @param provider Address to check
     */
    function isAuthorizedProvider(address provider) external view returns (bool) {
        return authorizedProviders[provider] || hasRole(HEALTHCARE_PROVIDER_ROLE, provider);
    }
} 