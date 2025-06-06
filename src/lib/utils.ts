import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from "firebase/firestore"

// Merge classnames with Tailwind CSS
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date or Firestore timestamp to a readable string
 * @param date Date, Timestamp, string, or number to format
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | Timestamp | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
): string {
  if (!date) return "N/A";

  let dateObj: Date;

  if (date instanceof Timestamp) {
    dateObj = date.toDate();
  } else if (typeof date === "string") {
    dateObj = new Date(date);
  } else if (typeof date === "number") {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return "Invalid Date";
  }

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return "Invalid Date";
  }

  return new Intl.DateTimeFormat("en-US", options).format(dateObj);
}

/**
 * Format a date to YYYY-MM-DD format
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDateToYYYYMMDD(date: Date | null): string {
  if (!date) return "";
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

// Format time to readable string
export function formatTime(date: Date | string | number): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : new Date(date);
  
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Format date and time to readable string
export function formatDateTime(date: Date | string | number): string {
  if (!date) return '';
  
  return `${formatDate(date)} at ${formatTime(date)}`;
}

// Calculate age from date of birth
export function calculateAge(dateOfBirth: string | Date | any): number {
  if (!dateOfBirth) return 0;
  
  let dob: Date;
  
  try {
    if (typeof dateOfBirth === 'string') {
      dob = new Date(dateOfBirth);
    } else if (dateOfBirth instanceof Date) {
      dob = dateOfBirth;
    } else if (dateOfBirth && typeof dateOfBirth.toDate === 'function') {
      // Handle Firestore Timestamp
      dob = dateOfBirth.toDate();
    } else if (dateOfBirth && typeof dateOfBirth.seconds === 'number') {
      // Handle Firestore Timestamp object
      dob = new Date(dateOfBirth.seconds * 1000);
    } else {
      // Try to convert to Date
      dob = new Date(dateOfBirth);
    }
    
    // Validate the date
    if (isNaN(dob.getTime())) {
      return 0;
    }
    
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  } catch (error) {
    console.error('Error calculating age:', error, 'Input:', dateOfBirth);
    return 0;
  }
}

// Calculate pregnancy week from EDD (Estimated Due Date)
export function calculatePregnancyWeek(edd: string | Date | any): number {
  if (!edd) return 0;
  
  let dueDate: Date;
  
  try {
    if (typeof edd === 'string') {
      dueDate = new Date(edd);
    } else if (edd instanceof Date) {
      dueDate = edd;
    } else if (edd && typeof edd.toDate === 'function') {
      // Handle Firestore Timestamp
      dueDate = edd.toDate();
    } else if (edd && typeof edd.seconds === 'number') {
      // Handle Firestore Timestamp object
      dueDate = new Date(edd.seconds * 1000);
    } else {
      // Try to convert to Date
      dueDate = new Date(edd);
    }
    
    // Validate the date
    if (isNaN(dueDate.getTime())) {
      return 0;
    }
    
    const now = new Date();
    
    // Full term is 40 weeks
    const fullTermDays = 280;
    
    // Days left until due date
    const daysLeft = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Current week of pregnancy
    const currentWeek = Math.floor((fullTermDays - daysLeft) / 7);
    
    return currentWeek > 0 ? (currentWeek <= 42 ? currentWeek : 42) : 0;
  } catch (error) {
    console.error('Error calculating pregnancy week:', error, 'Input:', edd);
    return 0;
  }
}

// Get trimester from pregnancy week
export function getTrimester(pregnancyWeek: number): string {
  if (pregnancyWeek <= 0) return 'Unknown';
  if (pregnancyWeek <= 12) return '1st Trimester';
  if (pregnancyWeek <= 27) return '2nd Trimester';
  return '3rd Trimester';
}

// Get pregnancy risk status
export function getRiskStatus(
  age: number, 
  medicalHistory: string = '', 
  pregnancyWeek: number = 0
): 'low' | 'medium' | 'high' {
  // Age-based risk
  if (age < 18 || age > 35) {
    return 'high';
  }
  
  // Medical history risk factors
  const highRiskConditions = [
    'diabetes',
    'hypertension',
    'preeclampsia',
    'eclampsia',
    'heart disease',
    'kidney disease',
    'hiv',
    'hepatitis'
  ];
  
  const mediumRiskConditions = [
    'anemia',
    'asthma',
    'depression',
    'anxiety',
    'previous cesarean',
    'obesity'
  ];
  
  const medHistoryLower = medicalHistory.toLowerCase();
  
  for (const condition of highRiskConditions) {
    if (medHistoryLower.includes(condition)) {
      return 'high';
    }
  }
  
  for (const condition of mediumRiskConditions) {
    if (medHistoryLower.includes(condition)) {
      return 'medium';
    }
  }
  
  // Week-based risk (3rd trimester)
  if (pregnancyWeek >= 28) {
    return 'medium';
  }
  
  return 'low';
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + '...';
}
