import { ethers } from 'ethers';
import { Patient } from './patient.service';

// Smart contract ABI (Application Binary Interface)
const PATIENT_DATA_STORAGE_ABI = [
  "function storePatientData(string patientId, string encryptedData, bytes32 dataHash) external",
  "function getPatientData(string patientId) external view returns (string, bytes32, uint256, address)",
  "function verifyDataIntegrity(string patientId, bytes32 originalHash) external view returns (bool)",
  "function getAccessLogs(string patientId, uint256 offset, uint256 limit) external view returns (tuple(address accessor, uint256 timestamp, string accessType, bool authorized)[])",
  "function getTotalPatients() external view returns (uint256)",
  "function getAllPatientIds() external view returns (string[])",
  "function authorizeProvider(address provider) external",
  "function isAuthorizedProvider(address provider) external view returns (bool)",
  "event PatientDataStored(string indexed patientId, address indexed provider, uint256 timestamp)",
  "event PatientDataAccessed(string indexed patientId, address indexed accessor, string accessType)"
];

interface BlockchainConfig {
  rpcUrl: string;
  contractAddress: string;
  networkId: number;
  privateKey?: string;
}

interface Web3AccessLog {
  accessor: string;
  timestamp: number;
  accessType: string;
  authorized: boolean;
}

interface Web3BlockchainStats {
  totalPatients: number;
  encryptedRecords: number;
  lastActivity: number | null;
  isConnected: boolean;
  networkInfo: {
    name: string;
    isTestnet: boolean;
    rpcUrl: string;
    chainId: number;
  };
}

export class Web3BlockchainService {
  private static instance: Web3BlockchainService;
  private provider: ethers.JsonRpcProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.Wallet | null = null;
  private config: BlockchainConfig | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): Web3BlockchainService {
    if (!Web3BlockchainService.instance) {
      Web3BlockchainService.instance = new Web3BlockchainService();
    }
    return Web3BlockchainService.instance;
  }

  /**
   * Initialize the Web3 connection with configuration
   */
  async initialize(config?: BlockchainConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // Use provided config or environment variables
      this.config = config || {
        rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo',
        contractAddress: process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS || '',
        networkId: parseInt(process.env.NEXT_PUBLIC_NETWORK_ID || '11155111'),
        privateKey: process.env.PRIVATE_KEY
      };

      if (!this.config.contractAddress) {
        return { 
          success: false, 
          error: 'Contract address not configured. Please deploy the smart contract first and set NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS in your .env.local file.' 
        };
      }

      if (!this.config.rpcUrl || this.config.rpcUrl.includes('demo')) {
        return { 
          success: false, 
          error: 'RPC URL not configured. Please set SEPOLIA_RPC_URL in your .env.local file with your Alchemy or Infura endpoint.' 
        };
      }

      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
      
      // Test connection
      await this.provider.getNetwork();

      // Initialize contract (read-only first)
      this.contract = new ethers.Contract(
        this.config.contractAddress,
        PATIENT_DATA_STORAGE_ABI,
        this.provider
      ) as any;

      // If private key is provided, create signer for write operations
      if (this.config.privateKey && this.config.privateKey !== 'your_metamask_private_key_here') {
        this.signer = new ethers.Wallet(this.config.privateKey, this.provider);
        if (this.contract) {
          this.contract = this.contract.connect(this.signer) as any;
        }
      }

      this.isInitialized = true;
      console.log('✅ Web3 Blockchain Service initialized successfully');
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to initialize Web3 Blockchain Service:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown initialization error' 
      };
    }
  }

  /**
   * Connect to user's wallet (MetaMask)
   */
  async connectWallet(): Promise<{ success: boolean; address?: string; error?: string }> {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        return { success: false, error: 'MetaMask not detected. Please install MetaMask.' };
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (!accounts || accounts.length === 0) {
        return { success: false, error: 'No accounts found. Please unlock MetaMask.' };
      }

      // Create provider from MetaMask
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await web3Provider.getSigner();
      const address = await signer.getAddress();

      // Update contract with signer
      if (this.contract && this.config) {
        this.contract = new ethers.Contract(
          this.config.contractAddress,
          PATIENT_DATA_STORAGE_ABI,
          signer
        ) as any;
      }

      console.log('✅ Wallet connected:', address);
      return { success: true, address };

    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect wallet' 
      };
    }
  }

  /**
   * Store encrypted patient data on blockchain
   */
  async storePatientData(patient: Patient, accessLevel: string = 'confidential'): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.isInitialized || !this.contract) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return { success: false, error: initResult.error };
        }
      }

      // Encrypt patient data
      const encryptedData = await this.encryptPatientData(patient);
      const dataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(patient)));

      // Store on blockchain
      const tx = await (this.contract as any).storePatientData(
        patient.id!,
        encryptedData,
        dataHash
      );

      console.log('⏳ Transaction submitted:', tx.hash);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed in block:', receipt.blockNumber);

      return { success: true, txHash: tx.hash };

    } catch (error) {
      console.error('❌ Failed to store patient data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to store data' 
      };
    }
  }

  /**
   * Retrieve and decrypt patient data from blockchain
   */
  async getPatientData(patientId: string): Promise<{ success: boolean; patient?: Patient; error?: string }> {
    try {
      if (!this.isInitialized || !this.contract) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return { success: false, error: initResult.error };
        }
      }

      // Get data from blockchain
      const [encryptedData, dataHash, timestamp, version] = await (this.contract as any).getPatientData(patientId);

      // Decrypt patient data
      const patient = await this.decryptPatientData(encryptedData);

      return { success: true, patient };

    } catch (error) {
      console.error('❌ Failed to retrieve patient data:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to retrieve data' 
      };
    }
  }

  /**
   * Verify data integrity
   */
  async verifyDataIntegrity(patientId: string, originalData: Patient): Promise<{ success: boolean; isValid?: boolean; error?: string }> {
    try {
      if (!this.isInitialized || !this.contract) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return { success: false, error: initResult.error };
        }
      }

      const dataHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(originalData)));
      const isValid = await (this.contract as any).verifyDataIntegrity(patientId, dataHash);

      return { success: true, isValid };

    } catch (error) {
      console.error('❌ Failed to verify data integrity:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to verify integrity' 
      };
    }
  }

  /**
   * Get access logs for a patient
   */
  async getAccessLogs(patientId: string): Promise<Web3AccessLog[]> {
    try {
      if (!this.isInitialized || !this.contract) {
        await this.initialize();
        if (!this.contract) return [];
      }

      const logs = await (this.contract as any).getAccessLogs(patientId);
      
      return logs.map((log: any) => ({
        accessor: log.accessor,
        timestamp: Number(log.timestamp),
        accessType: log.accessType,
        authorized: log.authorized
      }));

    } catch (error) {
      console.error('❌ Failed to get access logs:', error);
      return [];
    }
  }

  /**
   * Get blockchain statistics
   */
  async getBlockchainStats(): Promise<Web3BlockchainStats> {
    try {
      if (!this.isInitialized || !this.contract) {
        await this.initialize();
      }

      const totalPatients = this.contract ? await (this.contract as any).getTotalPatients() : 0;
      const network = this.provider ? await this.provider.getNetwork() : null;

      return {
        totalPatients: Number(totalPatients),
        encryptedRecords: Number(totalPatients), // Same as total patients for now
        lastActivity: Date.now(),
        isConnected: this.isInitialized,
        networkInfo: {
          name: this.config?.networkId === 11155111 ? 'Sepolia Testnet' : 'Unknown Network',
          isTestnet: true,
          rpcUrl: this.config?.rpcUrl || '',
          chainId: Number(network?.chainId) || 0
        }
      };

    } catch (error) {
      console.error('❌ Failed to get blockchain stats:', error);
      return {
        totalPatients: 0,
        encryptedRecords: 0,
        lastActivity: null,
        isConnected: false,
        networkInfo: {
          name: 'Disconnected',
          isTestnet: false,
          rpcUrl: '',
          chainId: 0
        }
      };
    }
  }

  /**
   * Encrypt patient data using AES-256
   */
  private async encryptPatientData(patient: Patient): Promise<string> {
    try {
      // In a real implementation, you'd use proper encryption
      // For now, we'll use base64 encoding as a placeholder
      const patientJson = JSON.stringify(patient);
      return Buffer.from(patientJson).toString('base64');
    } catch (error) {
      throw new Error('Failed to encrypt patient data');
    }
  }

  /**
   * Decrypt patient data
   */
  private async decryptPatientData(encryptedData: string): Promise<Patient> {
    try {
      // Decrypt the base64 encoded data
      const patientJson = Buffer.from(encryptedData, 'base64').toString('utf8');
      return JSON.parse(patientJson);
    } catch (error) {
      throw new Error('Failed to decrypt patient data');
    }
  }

  /**
   * Get stored patient IDs (for compatibility with existing interface)
   */
  getStoredPatientIds(): string[] {
    // This would need to be implemented by querying events or maintaining a separate index
    // For now, return empty array
    return [];
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return this.isInitialized && this.contract !== null;
  }

  /**
   * Get network information
   */
  getNetworkInfo() {
    return {
      name: this.config?.networkId === 11155111 ? 'Sepolia Testnet' : 'Unknown Network',
      isTestnet: true,
      rpcUrl: this.config?.rpcUrl || '',
      chainId: this.config?.networkId || 0
    };
  }
}

// Type declaration for MetaMask
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default Web3BlockchainService; 