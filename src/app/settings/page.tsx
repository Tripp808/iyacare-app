'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Smartphone, 
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  Key,
  Wifi,
  Upload,
  Camera
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/user.service';
import { toast } from 'sonner';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export default function SettingsPage() {
  const { user, firebaseUser, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    facility: '',
    role: 'healthcare_worker',
    bio: '',
    profilePicture: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: true,
    push: true,
    emergency: true,
    reports: false,
    updates: true
  });

  const [iotSettings, setIotSettings] = useState({
    autoSync: true,
    dataRetention: '1year',
    alertThreshold: 'medium',
    backupFrequency: 'daily'
  });

  useEffect(() => {
    if (user) {
      const names = user.name?.split(' ') || ['', ''];
      setProfileData({
        firstName: names[0] || '',
        lastName: names.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        facility: '', // Will need to add this to user schema
        role: user.role || 'healthcare_worker',
        bio: '', // Will need to add this to user schema
        profilePicture: user.profilePicture || ''
      });
    }
  }, [user]);

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleIotChange = (key: string, value: string | boolean) => {
    setIotSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProfileSave = async () => {
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

  const handlePasswordUpdate = async () => {
    if (!firebaseUser) return;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        firebaseUser.email!,
        passwordData.currentPassword
      );
      
      await reauthenticateWithCredential(firebaseUser, credential);
      await updatePassword(firebaseUser, passwordData.newPassword);
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password updated successfully!');
    } catch (error: any) {
      console.error('Password update error:', error);
      let errorMessage = 'Failed to update password. Please try again.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `profilePictures/${user?.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      handleProfileChange('profilePicture', downloadURL);
      toast.success('Profile picture uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRefreshProfile = async () => {
    setRefreshing(true);
    try {
      await refreshUserData();
      toast.success('Profile data refreshed!');
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast.error('Failed to refresh profile data');
    } finally {
      setRefreshing(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Please log in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#2D7D89] dark:text-[#4AA0AD]">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account, notifications, and platform configuration
        </p>
        {user?.name && (
          <div className="mt-4 p-4 bg-gradient-to-r from-[#2D7D89]/10 to-[#F7913D]/10 rounded-lg border border-[#2D7D89]/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#2D7D89] flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-semibold text-[#2D7D89] dark:text-[#4AA0AD]">
                  Welcome, {user.name}!
                </p>
                <p className="text-sm text-muted-foreground">
                  {user.email} • {user.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="platform" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Platform
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <Card>
          <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Profile Information
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshProfile}
                  disabled={refreshing}
                  className="ml-auto"
                >
                  {refreshing ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                  ) : (
                    <Wifi className="h-4 w-4" />
                  )}
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
              </CardTitle>
            <CardDescription>
                Update your account details and preferences
                <br />
                <small className="text-xs text-muted-foreground">
                  Current user: {user?.email} | ID: {user?.id}
                </small>
            </CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
              {/* Profile Picture Section */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-muted overflow-hidden border-[1px] border-gray-200 dark:border-gray-700">
                      {profileData.profilePicture ? (
                        <img 
                          src={profileData.profilePicture} 
                          alt="Profile" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-[#2D7D89]/10">
                          <User className="h-8 w-8 text-[#2D7D89]" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex items-center gap-2"
                    >
                      {uploadingImage ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          Change Picture
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
              
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
                  Email cannot be changed. Contact support if you need to update your email.
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
                <Label htmlFor="facility">Healthcare Facility</Label>
                <Input 
                  id="facility" 
                  value={profileData.facility}
                  onChange={(e) => handleProfileChange('facility', e.target.value)}
                  placeholder="e.g., Central Hospital Lagos"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={profileData.role} 
                  onValueChange={(value) => handleProfileChange('role', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthcare_worker">Healthcare Provider</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="patient">Patient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Brief description of your role and experience"
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleProfileSave}
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
          </CardContent>
        </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you want to receive alerts and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.email}
                    onCheckedChange={(value) => handleNotificationChange('email', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground font-medium">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive critical alerts via SMS
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.sms}
                    onCheckedChange={(value) => handleNotificationChange('sms', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground font-medium">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive real-time push notifications
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.push}
                    onCheckedChange={(value) => handleNotificationChange('push', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground font-medium">Emergency Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emergency notifications (recommended)
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.emergency}
                    onCheckedChange={(value) => handleNotificationChange('emergency', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground font-medium">Report Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when reports are ready
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.reports}
                    onCheckedChange={(value) => handleNotificationChange('reports', value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-foreground font-medium">System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Platform updates and announcements
                    </p>
                  </div>
                  <Switch 
                    checked={notificationSettings.updates}
                    onCheckedChange={(value) => handleNotificationChange('updates', value)}
                  />
                </div>
              </div>
              
              <div className="pt-6">
                <Button className="bg-[#2D7D89] hover:bg-[#236570] text-white">
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
          <CardHeader>
              <CardTitle>Change Password</CardTitle>
            <CardDescription>
                Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" strokeWidth="1.5" />
                    <Input 
                      id="currentPassword" 
                      type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className="pl-10"
                    />
            <Button 
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
              )}
            </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" strokeWidth="1" />
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="pl-10"
                    placeholder="Min. 6 characters"
                  />
                </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" strokeWidth="1" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="pl-10"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handlePasswordUpdate}
                disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="bg-[#2D7D89] hover:bg-[#236570] text-white"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-r-transparent"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
              <CardDescription>
                Verification and security status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Your email address verification status
                  </p>
                </div>
                <Badge variant={firebaseUser?.emailVerified ? "default" : "secondary"}>
                  {firebaseUser?.emailVerified ? "Verified" : "Pending"}
                </Badge>
              </div>
              
                  <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Account Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
        </Card>
        </TabsContent>

        {/* Platform Settings */}
        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>IoT Device Management</CardTitle>
              <CardDescription>
                Configure settings for connected medical devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-sync Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically sync data from connected devices
                    </p>
                  </div>
                  <Switch 
                    checked={iotSettings.autoSync}
                    onCheckedChange={(value) => handleIotChange('autoSync', value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Data Retention Period</Label>
                  <Select 
                    value={iotSettings.dataRetention}
                    onValueChange={(value) => handleIotChange('dataRetention', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="5years">5 Years</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Alert Threshold</Label>
                  <Select 
                    value={iotSettings.alertThreshold}
                    onValueChange={(value) => handleIotChange('alertThreshold', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Sensitivity</SelectItem>
                      <SelectItem value="medium">Medium Sensitivity</SelectItem>
                      <SelectItem value="high">High Sensitivity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Select 
                    value={iotSettings.backupFrequency}
                    onValueChange={(value) => handleIotChange('backupFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
      </div>
              
              <Button className="bg-[#2D7D89] hover:bg-[#236570] text-white">
                <Database className="h-4 w-4 mr-2" />
                Save Platform Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 