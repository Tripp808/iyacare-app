import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';
import { Patient } from '@/types';

// Blockchain configuration interface
interface BlockchainConfig {
  rpcUrl: string;
  contractAddress?: string;
  privateKey?: string;
  encryptionKey: string;
  isTestnet?: boolean;
}

// Patient data hash interface
interface PatientDataHash {
  patientId: string;
  dataHash: string;
  encryptedData: string;
  timestamp: number;
  accessLevel: 'public' | 'restricted' | 'confidential';
  lastModified: number;
  version: number;
}

// Access log interface
interface AccessLog {
  patientId: string;
  accessedBy: string;
  accessType: 'read' | 'write' | 'delete';
  timestamp: number;
  ipAddress?: string;
  authorized: boolean;
}

// Default testnet configuration
const DEFAULT_TESTNET_CONFIG = {
  rpcUrl: 'https://rpc.sepolia.org', // Free public Sepolia RPC
  isTestnet: true,
  networkName: 'Sepolia Testnet'
};

// Alternative free testnet endpoints
const ALTERNATIVE_TESTNET_RPCS = [
  'https://rpc.sepolia.org',
  'https://sepolia.gateway.tenderly.co',
  'https://ethereum-sepolia.blockpi.network/v1/rpc/public',
  'https://sepolia.drpc.org',
  'https://rpc-sepolia.rockx.com'
];

// Smart contract ABI (simplified for patient data storage)
const PATIENT_DATA_CONTRACT_ABI = [
  "function storePatientData(string patientId, string dataHash, uint256 timestamp, uint8 accessLevel) external",
  "function getPatientData(string patientId) external view returns (string, uint256, uint8, uint256)",
  "function updatePatientData(string patientId, string newDataHash, uint256 timestamp) external",
  "function authorizeAccess(string patientId, address user) external",
  "function revokeAccess(string patientId, address user) external",
  "function isAuthorized(string patientId, address user) external view returns (bool)",
  "function getAccessLogs(string patientId) external view returns (tuple(address user, uint256 timestamp, uint8 actionType)[])",
  "event PatientDataStored(string indexed patientId, string dataHash, uint256 timestamp)",
  "event PatientDataUpdated(string indexed patientId, string newDataHash, uint256 timestamp)",
  "event AccessGranted(string indexed patientId, address indexed user)",
  "event AccessRevoked(string indexed patientId, address indexed user)"
];

class BlockchainService {
  private static instance: BlockchainService;
  private config: BlockchainConfig | null = null;
  private provider: ethers.JsonRpcProvider | null = null;
  private contract: ethers.Contract | null = null;
  private wallet: ethers.Wallet | null = null;
  private localStorage: Map<string, PatientDataHash> = new Map();
  private accessLogs: AccessLog[] = [];

  constructor() {
    if (BlockchainService.instance) {
      return BlockchainService.instance;
    }
    BlockchainService.instance = this;
    this.loadLocalData();
  }

  static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  // Get default testnet configuration
  getDefaultTestnetConfig(): Partial<BlockchainConfig> {
    return DEFAULT_TESTNET_CONFIG;
  }

  // Get alternative testnet endpoints
  getAlternativeTestnetEndpoints(): string[] {
    return ALTERNATIVE_TESTNET_RPCS;
  }

  // Test RPC endpoint connectivity
  private async testRpcEndpoint(rpcUrl: string): Promise<boolean> {
    try {
      const testProvider = new ethers.JsonRpcProvider(rpcUrl);
      await testProvider.getBlockNumber();
      return true;
    } catch (error) {
      console.warn(`RPC endpoint failed: ${rpcUrl}`, error);
      return false;
    }
  }

  // Find working RPC endpoint
  private async findWorkingRpcEndpoint(preferredUrl?: string): Promise<string | null> {
    const endpoints = preferredUrl ? [preferredUrl, ...ALTERNATIVE_TESTNET_RPCS] : ALTERNATIVE_TESTNET_RPCS;
    
    for (const endpoint of endpoints) {
      console.log(`Testing RPC endpoint: ${endpoint}`);
      if (await this.testRpcEndpoint(endpoint)) {
        console.log(`✓ Working RPC endpoint found: ${endpoint}`);
        return endpoint;
      }
    }
    
    return null;
  }

  // Initialize blockchain connection
  async initialize(config: BlockchainConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // Determine if testnet
      const isTestnet = config.isTestnet || config.rpcUrl.includes('sepolia') || config.rpcUrl.includes('goerli') || config.rpcUrl.includes('testnet');
      
      let workingRpcUrl = config.rpcUrl;
      
      // For testnet, try to find a working endpoint
      if (isTestnet) {
        const foundEndpoint = await this.findWorkingRpcEndpoint(config.rpcUrl);
        if (foundEndpoint) {
          workingRpcUrl = foundEndpoint;
        } else {
          return { success: false, error: 'No working testnet RPC endpoints found. Please check your internet connection or try again later.' };
        }
      }
      
      this.config = { ...config, rpcUrl: workingRpcUrl, isTestnet };
      
      // Initialize provider with working endpoint
      this.provider = new ethers.JsonRpcProvider(workingRpcUrl);
      
      // Initialize wallet if private key provided
      if (config.privateKey) {
        this.wallet = new ethers.Wallet(config.privateKey, this.provider);
      }
      
      // Initialize contract if address provided
      if (config.contractAddress) {
        const signer = this.wallet || this.provider;
        this.contract = new ethers.Contract(
          config.contractAddress,
          PATIENT_DATA_CONTRACT_ABI,
          signer
        );
      }

      // Final connection test
      await this.provider.getBlockNumber();
      
      console.log(`Blockchain service initialized successfully on ${this.config.isTestnet ? 'testnet' : 'mainnet'}`);
      console.log(`Using RPC endpoint: ${workingRpcUrl}`);
      return { success: true };
    } catch (error: any) {
      console.error('Failed to initialize blockchain service:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if blockchain is configured and ready
  isConfigured(): boolean {
    return this.config !== null && this.provider !== null;
  }

  // Check if using testnet
  isTestnet(): boolean {
    return this.config?.isTestnet || false;
  }

  // Get network info
  getNetworkInfo(): { name: string; isTestnet: boolean; rpcUrl?: string } {
    if (!this.config) {
      return { name: 'Not configured', isTestnet: false };
    }
    
    let networkName = 'Unknown Network';
    if (this.config.rpcUrl.includes('sepolia')) {
      networkName = 'Sepolia Testnet';
    } else if (this.config.rpcUrl.includes('goerli')) {
      networkName = 'Goerli Testnet';
    } else if (this.config.rpcUrl.includes('mainnet')) {
      networkName = 'Ethereum Mainnet';
    } else if (this.config.rpcUrl.includes('polygon')) {
      networkName = 'Polygon Network';
    }

    return {
      name: networkName,
      isTestnet: this.config.isTestnet || false,
      rpcUrl: this.config.rpcUrl
    };
  }

  // Encrypt patient data
  private encryptData(data: any, key: string): string {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt patient data');
    }
  }

  // Decrypt patient data
  private decryptData(encryptedData: string, key: string): any {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt patient data');
    }
  }

  // Generate data hash
  private generateDataHash(data: any): string {
    const jsonString = JSON.stringify(data, Object.keys(data).sort());
    return CryptoJS.SHA256(jsonString).toString();
  }

  // Store patient data on blockchain
  async storePatientData(
    patient: Patient, 
    accessLevel: 'public' | 'restricted' | 'confidential' = 'confidential'
  ): Promise<{ success: boolean; hash?: string; error?: string }> {
    try {
      if (!this.config) {
        throw new Error('Blockchain not configured');
      }

      // Sanitize patient data (remove sensitive fields for public access)
      const sanitizedData = this.sanitizePatientData(patient, accessLevel);
      
      // Encrypt the data
      const encryptedData = this.encryptData(sanitizedData, this.config.encryptionKey);
      
      // Generate hash
      const dataHash = this.generateDataHash(sanitizedData);
      
      // Create patient data record
      const patientDataHash: PatientDataHash = {
        patientId: patient.id,
        dataHash,
        encryptedData,
        timestamp: Date.now(),
        accessLevel,
        lastModified: Date.now(),
        version: 1
      };

      // Store locally first (fallback)
      this.localStorage.set(patient.id, patientDataHash);
      this.saveLocalData();

      // Store on blockchain if contract available
      if (this.contract && this.wallet) {
        try {
          const accessLevelCode = this.getAccessLevelCode(accessLevel);
          const tx = await this.contract.storePatientData(
            patient.id,
            dataHash,
            Math.floor(Date.now() / 1000),
            accessLevelCode
          );
          await tx.wait();
          
          console.log(`Patient data stored on ${this.isTestnet() ? 'testnet' : 'blockchain'}: ${patient.id}`);
        } catch (blockchainError) {
          console.warn('Blockchain storage failed, using local storage:', blockchainError);
        }
      }

      // Log access
      this.logAccess(patient.id, 'system', 'write', true);

      return { success: true, hash: dataHash };
    } catch (error: any) {
      console.error('Error storing patient data:', error);
      return { success: false, error: error.message };
    }
  }

  // Retrieve patient data from blockchain
  async getPatientData(patientId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      if (!this.config) {
        throw new Error('Blockchain not configured');
      }

      let patientDataHash: PatientDataHash | null = null;

      // Try blockchain first
      if (this.contract) {
        try {
          const result = await this.contract.getPatientData(patientId);
          if (result[0]) { // dataHash exists
            // Find in local storage by hash
            for (const [id, data] of this.localStorage.entries()) {
              if (data.patientId === patientId && data.dataHash === result[0]) {
                patientDataHash = data;
                break;
              }
            }
          }
        } catch (blockchainError) {
          console.warn('Blockchain retrieval failed, trying local storage:', blockchainError);
        }
      }

      // Fallback to local storage
      if (!patientDataHash) {
        patientDataHash = this.localStorage.get(patientId) || null;
      }

      if (!patientDataHash) {
        return { success: false, error: 'Patient data not found' };
      }

      // Decrypt and return data
      const decryptedData = this.decryptData(patientDataHash.encryptedData, this.config.encryptionKey);
      
      // Log access
      this.logAccess(patientId, 'system', 'read', true);

      return { 
        success: true, 
        data: {
          ...decryptedData,
          blockchainInfo: {
            hash: patientDataHash.dataHash,
            timestamp: patientDataHash.timestamp,
            accessLevel: patientDataHash.accessLevel,
            version: patientDataHash.version,
            network: this.getNetworkInfo()
          }
        }
      };
    } catch (error: any) {
      console.error('Error retrieving patient data:', error);
      this.logAccess(patientId, 'system', 'read', false);
      return { success: false, error: error.message };
    }
  }

  // Update patient data on blockchain
  async updatePatientData(
    patientId: string, 
    updatedData: Partial<Patient>
  ): Promise<{ success: boolean; hash?: string; error?: string }> {
    try {
      // Get existing data
      const existingResult = await this.getPatientData(patientId);
      if (!existingResult.success || !existingResult.data) {
        return { success: false, error: 'Patient data not found for update' };
      }

      // Merge with updated data
      const mergedData = { ...existingResult.data, ...updatedData };
      delete mergedData.blockchainInfo; // Remove blockchain metadata

      // Store updated data
      const result = await this.storePatientData(mergedData as Patient);
      
      if (result.success) {
        // Update version
        const stored = this.localStorage.get(patientId);
        if (stored) {
          stored.version += 1;
          stored.lastModified = Date.now();
          this.localStorage.set(patientId, stored);
          this.saveLocalData();
        }
      }

      return result;
    } catch (error: any) {
      console.error('Error updating patient data:', error);
      return { success: false, error: error.message };
    }
  }

  // Verify data integrity
  async verifyDataIntegrity(patientId: string): Promise<{ success: boolean; verified?: boolean; error?: string }> {
    try {
      const result = await this.getPatientData(patientId);
      if (!result.success || !result.data) {
        return { success: false, error: 'Patient data not found' };
      }

      const currentHash = this.generateDataHash(result.data);
      const storedHash = result.data.blockchainInfo?.hash;

      const verified = currentHash === storedHash;
      
      return { success: true, verified };
    } catch (error: any) {
      console.error('Error verifying data integrity:', error);
      return { success: false, error: error.message };
    }
  }

  // Get access logs for a patient
  getAccessLogs(patientId: string): AccessLog[] {
    return this.accessLogs.filter(log => log.patientId === patientId);
  }

  // Get all stored patient IDs
  getStoredPatientIds(): string[] {
    return Array.from(this.localStorage.keys());
  }

  // Get blockchain statistics
  getBlockchainStats(): {
    totalPatients: number;
    totalAccesses: number;
    lastActivity: number | null;
    isConnected: boolean;
    networkInfo: { name: string; isTestnet: boolean; rpcUrl?: string };
  } {
    return {
      totalPatients: this.localStorage.size,
      totalAccesses: this.accessLogs.length,
      lastActivity: this.accessLogs.length > 0 
        ? Math.max(...this.accessLogs.map(log => log.timestamp))
        : null,
      isConnected: this.isConfigured(),
      networkInfo: this.getNetworkInfo()
    };
  }

  // Private helper methods
  private sanitizePatientData(patient: Patient, accessLevel: string): any {
    const sanitized = { ...patient };
    
    if (accessLevel === 'public') {
      // Create a new object without sensitive fields
      const publicData: Partial<Patient> = {
        id: sanitized.id,
        userId: sanitized.userId,
        patientId: sanitized.patientId,
        name: sanitized.name,
        dateOfBirth: sanitized.dateOfBirth,
        // Remove sensitive fields: phone, email, emergencyContact, medicalHistory
      };
      return publicData;
    } else if (accessLevel === 'restricted') {
      // Keep most data but limit medical history
      if (sanitized.medicalHistory) {
        sanitized.medicalHistory = {
          ...sanitized.medicalHistory,
          conditions: sanitized.medicalHistory.conditions?.slice(0, 3) || [] // Limit conditions
        };
      }
    }
    
    return sanitized;
  }

  private getAccessLevelCode(accessLevel: string): number {
    switch (accessLevel) {
      case 'public': return 0;
      case 'restricted': return 1;
      case 'confidential': return 2;
      default: return 2;
    }
  }

  private logAccess(patientId: string, accessedBy: string, accessType: 'read' | 'write' | 'delete', authorized: boolean): void {
    const log: AccessLog = {
      patientId,
      accessedBy,
      accessType,
      timestamp: Date.now(),
      authorized
    };
    
    this.accessLogs.push(log);
    
    // Keep only last 1000 logs
    if (this.accessLogs.length > 1000) {
      this.accessLogs = this.accessLogs.slice(-1000);
    }
    
    this.saveAccessLogs();
  }

  private loadLocalData(): void {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        return;
      }
      
      const stored = localStorage.getItem('blockchain_patient_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.localStorage = new Map(data);
      }
    } catch (error) {
      console.error('Error loading local blockchain data:', error);
    }
  }

  private saveLocalData(): void {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        return;
      }
      
      const data = Array.from(this.localStorage.entries());
      localStorage.setItem('blockchain_patient_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving local blockchain data:', error);
    }
  }

  private saveAccessLogs(): void {
    try {
      localStorage.setItem('blockchain_access_logs', JSON.stringify(this.accessLogs));
    } catch (error) {
      console.error('Error saving access logs:', error);
    }
  }
}

export const blockchainService = BlockchainService.getInstance();
export default BlockchainService; 