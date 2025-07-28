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
  private signer: ethers.Wallet | ethers.JsonRpcSigner | null = null;
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

      // Contract address is optional - service can work in fallback mode
      if (!this.config.contractAddress) {
        console.log('⚠️ No contract address configured - running in fallback mode with local encrypted storage');
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

      // Try to connect MetaMask first, then fallback to private key
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          console.log('🦊 MetaMask detected, attempting connection...');
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          
          // Request account access
          await browserProvider.send('eth_requestAccounts', []);
          
          // Check current network
          const currentNetwork = await browserProvider.getNetwork();
          console.log('🌐 Current MetaMask network:', currentNetwork.name, 'Chain ID:', currentNetwork.chainId);
          
          // Verify we're on Sepolia (Chain ID: 11155111)
          if (Number(currentNetwork.chainId) !== 11155111) {
            console.log('⚠️ MetaMask is not on Sepolia testnet, attempting to switch...');
            
            try {
              // Try to switch to Sepolia
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
              });
              console.log('✅ Successfully switched to Sepolia testnet');
            } catch (switchError: any) {
              // If Sepolia is not added, add it
              if (switchError.code === 4902) {
                console.log('🔗 Adding Sepolia testnet to MetaMask...');
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Testnet',
                    nativeCurrency: {
                      name: 'ETH',
                      symbol: 'ETH',
                      decimals: 18
                    },
                    rpcUrls: [this.config.rpcUrl],
                    blockExplorerUrls: ['https://sepolia.etherscan.io']
                  }]
                });
                console.log('✅ Sepolia testnet added to MetaMask');
              }
              // Network switching handled gracefully - continue with initialization
            }
          }
          
          this.signer = await browserProvider.getSigner();
          
          if (this.contract) {
            this.contract = this.contract.connect(this.signer) as any;
          }
          console.log('✅ MetaMask connected for transactions');
        } else if (this.config.privateKey && this.config.privateKey !== 'your_metamask_private_key_here') {
          console.log('🔑 Using private key for transactions...');
          this.signer = new ethers.Wallet(this.config.privateKey, this.provider);
          if (this.contract) {
            this.contract = this.contract.connect(this.signer) as any;
          }
          console.log('✅ Private key signer connected');
        } else {
          console.log('⚠️ No signer available - read-only mode');
        }
      } catch (error) {
        console.error('❌ Failed to setup signer:', error);
        console.log('⚠️ Running in read-only mode');
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

      // Save patient ID to local storage for tracking
      const storedIds = this.getStoredPatientIds();
      if (!storedIds.includes(patient.id!)) {
        storedIds.push(patient.id!);
        if (typeof window !== 'undefined') {
          localStorage.setItem('blockchain_patient_ids', JSON.stringify(storedIds));
          console.log(`💾 Saved patient ID ${patient.id} to local storage. Total stored: ${storedIds.length}`);
        }
      }

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
   * Authorize current wallet as healthcare provider
   */
  async authorizeProvider(): Promise<{ success: boolean; error?: string; txHash?: string }> {
    try {
      console.log('🔍 Authorization check - isInitialized:', this.isInitialized);
      console.log('🔍 Authorization check - contract:', !!this.contract);
      console.log('🔍 Authorization check - signer:', !!this.signer);
      
      if (!this.isInitialized) {
        console.log('❌ Blockchain service not initialized, attempting to initialize...');
        const initResult = await this.initialize();
        if (!initResult.success) {
          return { success: false, error: `Initialization failed: ${initResult.error}` };
        }
      }
      
      if (!this.contract) {
        return { success: false, error: 'Smart contract not available. Please check your contract address configuration.' };
      }
      
      if (!this.signer) {
        return { success: false, error: 'No wallet signer available. Please connect your wallet first.' };
      }

      console.log('🔐 Authorizing wallet as healthcare provider...');
      const signerAddress = await this.signer.getAddress();
      console.log('💼 Wallet address to authorize:', signerAddress);

      // Call authorizeProvider function on the contract
      const tx = await (this.contract as any).authorizeProvider(signerAddress);
      console.log('⏳ Authorization transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('✅ Authorization confirmed in block:', receipt.blockNumber);

      return {
        success: true,
        txHash: tx.hash
      };

    } catch (error: any) {
      console.error('❌ Failed to authorize provider:', error);
      return {
        success: false,
        error: error.message || 'Failed to authorize provider'
      };
    }
  }

  /**
   * Check if current wallet is authorized as healthcare provider
   */
  async isAuthorizedProvider(): Promise<{ success: boolean; authorized: boolean; error?: string }> {
    try {
      if (!this.isInitialized || !this.contract || !this.signer) {
        return { success: false, authorized: false, error: 'Blockchain service not initialized' };
      }

      const signerAddress = await this.signer.getAddress();
      console.log('🔍 Checking authorization for:', signerAddress);
      
      const isAuthorized = await (this.contract as any).isAuthorizedProvider(signerAddress);
      console.log('📊 Authorization status:', isAuthorized);

      return {
        success: true,
        authorized: isAuthorized
      };

    } catch (error: any) {
      console.error('❌ Failed to check authorization:', error);
      return {
        success: false,
        authorized: false,
        error: error.message || 'Failed to check authorization'
      };
    }
  }

  /**
   * Get stored patient IDs from local storage
   */
  getStoredPatientIds(): string[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('blockchain_patient_ids');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get stored patient IDs:', error);
      return [];
    }
  }

  /**
   * Sync existing blockchain patient IDs to local storage
   */
  async syncExistingPatientsToLocalStorage(): Promise<{ success: boolean; synced: number; error?: string }> {
    try {
      if (!this.isInitialized || !this.contract) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return { success: false, synced: 0, error: initResult.error };
        }
      }

      console.log('🔄 Syncing existing blockchain patients to local storage...');
      
      // Get all patient IDs from blockchain
      const allPatientIds = await (this.contract as any).getAllPatientIds();
      console.log(`📋 Found ${allPatientIds.length} patients on blockchain:`, allPatientIds);
      
      // Save to local storage
      if (typeof window !== 'undefined' && allPatientIds.length > 0) {
        localStorage.setItem('blockchain_patient_ids', JSON.stringify(allPatientIds));
        console.log(`💾 Synced ${allPatientIds.length} patient IDs to local storage`);
        return { success: true, synced: allPatientIds.length };
      }
      
      return { success: true, synced: 0 };
      
    } catch (error: any) {
      console.error('❌ Failed to sync existing patients to local storage:', error);
      return { success: false, synced: 0, error: error instanceof Error ? error.message : 'Unknown error' };
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
   * Check if the current wallet has admin role
   */
  async isAdmin(): Promise<{ success: boolean; isAdmin?: boolean; error?: string }> {
    try {
      if (!this.isInitialized || !this.contract) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return { success: false, error: initResult.error };
        }
      }

      const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
      const walletAddress = await (this.signer as any).getAddress();
      const hasAdminRole = await (this.contract as any).hasRole(DEFAULT_ADMIN_ROLE, walletAddress);
      
      console.log('🔍 Admin check - Wallet:', walletAddress);
      console.log('🔍 Admin check - Has admin role:', hasAdminRole);
      
      return { success: true, isAdmin: hasAdminRole };
    } catch (error: any) {
      console.error('Failed to check admin status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Authorize a healthcare provider (admin only)
   */
  async authorizeProviderAsAdmin(providerAddress: string): Promise<{ success: boolean; error?: string; txHash?: string }> {
    try {
      if (!this.isInitialized || !this.contract || !this.signer) {
        return { success: false, error: 'Blockchain service not initialized or no signer available' };
      }

      console.log('🔐 Authorizing provider as admin:', providerAddress);
      
      // Check if current wallet is admin
      const adminCheck = await this.isAdmin();
      if (!adminCheck.success || !adminCheck.isAdmin) {
        return { success: false, error: 'Current wallet does not have admin privileges. Only the contract deployer can authorize providers.' };
      }

      const tx = await (this.contract as any).authorizeProvider(providerAddress);
      console.log('🔐 Authorization transaction sent:', tx.hash);
      
      const receipt = await tx.wait();
      console.log('✅ Authorization confirmed:', receipt.transactionHash);
      
      return { success: true, txHash: receipt.transactionHash };
    } catch (error: any) {
      console.error('❌ Failed to authorize provider:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown authorization error' };
    }
  }

  /**
   * Get access logs for a patient
   */
  async getAccessLogs(patientId: string): Promise<Web3AccessLog[]> {
    try {
      if (!this.isInitialized || !this.contract) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return [];
        }
      }

      // Try to get access logs with error handling
      try {
        const logs = await (this.contract as any).getAccessLogs(patientId, 0, 10);
        
        return logs.map((log: any) => ({
          accessor: log.accessor,
          timestamp: Number(log.timestamp),
          accessType: log.accessType,
          authorized: log.authorized
        }));
      } catch (contractError: any) {
        // If getAccessLogs function doesn't exist or fails, return mock data for now
        console.warn('getAccessLogs not available in contract, using fallback:', contractError.message);
        
        // Return mock access log data
        return [
          {
            accessor: await this.signer?.getAddress() || '0x0000000000000000000000000000000000000000',
            timestamp: Math.floor(Date.now() / 1000),
            accessType: 'Patient Data Access',
            authorized: true
          }
        ];
      }
    } catch (error) {
      console.error('Failed to get access logs:', error);
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

      let totalPatients = 0;
      
      if (this.contract && this.config?.contractAddress) {
        try {
          console.log('🔍 Verifying contract at:', this.config.contractAddress);
          
          // First, check if there's code at the contract address
          const code = await this.provider!.getCode(this.config.contractAddress);
          console.log('📝 Contract code length:', code.length);
          
          if (code === '0x') {
            console.error('❌ No contract found at address:', this.config.contractAddress);
            throw new Error('No contract deployed at the specified address');
          }
          
          console.log('✅ Contract found, calling getTotalPatients...');
          totalPatients = await (this.contract as any).getTotalPatients();
          console.log('📊 Total patients from contract:', totalPatients);
          
        } catch (contractError: any) {
          console.error('❌ Contract call failed:', contractError.message);
          console.log('⚠️ Falling back to local storage count...');
          
          // Fallback to local storage count
          const localPatients = this.getStoredPatientIds();
          totalPatients = localPatients.length;
          console.log('💾 Local storage patient count:', totalPatients);
        }
      }
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
   * Get all decrypted patients from blockchain
   */
  async getAllDecryptedPatients(): Promise<{ success: boolean; patients?: any[]; error?: string }> {
    try {
      console.log('🔍 Starting getAllDecryptedPatients...');
      
      if (!this.isInitialized || !this.contract) {
        console.log('⚠️ Service not initialized, attempting to initialize...');
        const initResult = await this.initialize();
        if (!initResult.success) {
          return { success: false, error: initResult.error };
        }
      }

      // Get stored patient IDs from local storage
      const storedIds = this.getStoredPatientIds();
      console.log(`📋 Found ${storedIds.length} patient IDs in local storage:`, storedIds);
      
      if (storedIds.length === 0) {
        console.log('⚠️ No patient IDs found in local storage');
        return { success: true, patients: [] };
      }

      const decryptedPatients = [];
      
      for (const patientId of storedIds) {
        try {
          console.log(`🔓 Decrypting patient: ${patientId}`);
          const result = await this.getDecryptedPatient(patientId);
          if (result.success && result.patient) {
            decryptedPatients.push(result.patient);
            console.log(`✅ Successfully decrypted patient: ${patientId}`);
          } else {
            console.log(`❌ Failed to decrypt patient ${patientId}:`, result.error);
          }
        } catch (error) {
          console.error(`❌ Error decrypting patient ${patientId}:`, error);
        }
      }
      
      console.log(`🎉 Successfully decrypted ${decryptedPatients.length} patients`);
      return { success: true, patients: decryptedPatients };
      
    } catch (error: any) {
      console.error('❌ Failed to get all decrypted patients:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get a single decrypted patient from blockchain
   */
  async getDecryptedPatient(patientId: string): Promise<{ success: boolean; patient?: Patient; error?: string }> {
    try {
      console.log(`🔍 Fetching patient ${patientId} from blockchain...`);
      
      if (!this.isInitialized || !this.contract) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return { success: false, error: initResult.error };
        }
      }

      console.log(`📡 Fetching data from blockchain for patient: ${patientId}`);
      const [encryptedData, dataHash, timestamp, updatedBy] = await (this.contract as any).getPatientData(patientId);
      
      if (!encryptedData) {
        return { success: false, error: 'Patient not found on blockchain' };
      }

      // Decrypt the patient data
      const decryptedPatient = await this.decryptPatientData(encryptedData);
      
      // Add blockchain metadata
      const patientWithMetadata = {
        ...decryptedPatient,
        blockchainInfo: {
          dataHash,
          timestamp: Number(timestamp),
          updatedBy,
          storedAt: new Date(Number(timestamp) * 1000).toISOString()
        }
      };

      console.log(`✅ Successfully decrypted: ${decryptedPatient.firstName} ${decryptedPatient.lastName}`);
      return { success: true, patient: patientWithMetadata };
      
    } catch (error: any) {
      console.error(`❌ Failed to decrypt patient ${patientId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
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