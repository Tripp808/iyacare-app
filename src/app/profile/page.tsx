'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Camera,
  Save,
  Settings as SettingsIcon,
  Mail,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/user.service';
import { toast } from 'sonner';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, firebaseUser, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'healthcare_worker',
    bio: '',
    profilePicture: ''
  });

  // Initialize profile data when user data is available
  React.useEffect(() => {
    if (user) {
      const names = user.name?.split(' ') || ['', ''];
      setProfileData({
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'healthcare_worker',
        bio: '', // Add this to user schema later
        profilePicture: user.profilePicture || ''
      });
    }
  }, [user]);

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Helper function to compress image
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 400x400)
        const maxSize = 400;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Helper function to convert file to base64 (fallback)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    let file = event.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    // Validate file size (5MB max for original, compress if larger)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size too large. Compressing...');
      try {
        file = await compressImage(file);
        toast.success('Image compressed successfully');
      } catch (error) {
        toast.error('Failed to compress image');
        return;
      }
    }
    
    setUploadingImage(true);
    
    try {
      // Try Firebase Storage first
      const timestamp = Date.now();
      const fileName = `profile_${user?.id}_${timestamp}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `profiles/${fileName}`);
      
      console.log('Starting upload to Firebase Storage...', fileName);
      
      // Set a timeout for the upload
      const uploadPromise = uploadBytes(storageRef, file);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upload timeout')), 30000) // 30 second timeout
      );
      
      await Promise.race([uploadPromise, timeoutPromise]);
      console.log('Upload completed, getting download URL...');
      
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Download URL obtained:', downloadURL);
      
      setProfileData(prev => ({ ...prev, profilePicture: downloadURL }));
      toast.success('Profile picture uploaded successfully!');
      
    } catch (error: any) {
      console.error('Firebase Storage upload failed:', error);
      
      // Fallback to base64 storage
      try {
        console.log('Falling back to base64 storage...');
        const base64 = await fileToBase64(file);
        setProfileData(prev => ({ ...prev, profilePicture: base64 }));
        toast.success('Profile picture saved locally (fallback mode)');
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        toast.error('Failed to save profile picture. Please try a smaller image.');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!user || !firebaseUser) return;
    
    setLoading(true);
    try {
      const updatedData = {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        phone: profileData.phone,
        role: profileData.role as 'admin' | 'healthcare_worker' | 'patient',
        profilePicture: profileData.profilePicture
      };

      await UserService.updateUser(user.id, updatedData);
      await refreshUserData();
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'healthcare_worker': return 'Healthcare Provider';
      case 'patient': return 'Patient';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D7D89] dark:text-[#4AA0AD]">My Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        
        <Link href="/settings">
          <Button variant="outline" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Advanced Settings
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Basic Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload a profile picture to personalize your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-muted overflow-hidden border-[2px] border-gray-200 dark:border-gray-700 shadow-sm">
                  {profileData.profilePicture ? (
                    <img 
                      src={profileData.profilePicture} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#2D7D89]/10">
                      <User className="h-16 w-16 text-[#2D7D89]" />
                    </div>
                  )}
                </div>
              </div>
              
              <Button 
                type="button"
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex items-center gap-2"
              >
                {uploadingImage ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></div>
                    <span className="text-sm">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-4 w-4" />
                    Change Picture
                  </>
                )}
              </Button>
              
              {uploadingImage && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Please wait, this may take a moment...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Trying Firebase Storage, will fallback if needed
                  </p>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground text-center">
                JPG, PNG or GIF. Large images will be compressed automatically.
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Quick Info */}
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" strokeWidth="1.5" />
                <span className="text-muted-foreground">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" strokeWidth="1.5" />
                <span className="text-muted-foreground">{getRoleDisplayName(user.role)}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" strokeWidth="1.5" />
                  <span className="text-muted-foreground">{user.phone}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  value={profileData.firstName}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  value={profileData.lastName}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={profileData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed here. Use Advanced Settings for account management.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={profileData.phone}
                onChange={(e) => handleProfileChange('phone', e.target.value)}
                placeholder="e.g., +234 801 234 5678"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell us a bit about yourself and your role"
                value={profileData.bio}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleSave}
                disabled={loading}
                className="bg-[#2D7D89] hover:bg-[#236570] text-white"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 