'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, User, Phone, MapPin, Calendar, AlertTriangle, Eye, Edit } from 'lucide-react';
import Link from 'next/link';
import { Patient, getPatients } from '@/lib/firebase/patients';
import { toast } from 'react-hot-toast';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'name-asc' | 'name-desc'>('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const result = await getPatients();
      if (result.success && result.patients) {
        setPatients(result.patients);
      } else {
        toast.error(result.error || 'Failed to load patients');
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort patients
  const filteredAndSortedPatients = patients
    .filter(patient => {
      const matchesSearch = `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (patient.phone || '').includes(searchTerm);
      const matchesRisk = riskFilter === 'all' || patient.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'name-desc':
          return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        default:
          return 0;
      }
  });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPatients.length / itemsPerPage);
  const paginatedPatients = filteredAndSortedPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRiskBadgeColor = (riskLevel: string | undefined) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getRiskLevelDisplay = (riskLevel: string | undefined) => {
    if (!riskLevel) {
      return 'Not Assessed';
    }
    return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1) + ' Risk';
  };

  const getAgeFromBirthDate = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D7D89] mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading patients...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Patients</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and monitor all patient records
          </p>
        </div>
        <Link href="/patients/add">
          <Button className="bg-[#2D7D89] hover:bg-[#245A62] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search patients by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <Select value={riskFilter} onValueChange={(value: any) => setRiskFilter(value)}>
              <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem value="all" className="text-gray-900 dark:text-white">All Risk Levels</SelectItem>
                <SelectItem value="low" className="text-gray-900 dark:text-white">Low Risk</SelectItem>
                <SelectItem value="medium" className="text-gray-900 dark:text-white">Medium Risk</SelectItem>
                <SelectItem value="high" className="text-gray-900 dark:text-white">High Risk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem value="name-asc" className="text-gray-900 dark:text-white">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc" className="text-gray-900 dark:text-white">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            Patient Records ({filteredAndSortedPatients.length})
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            View and manage all patient information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedPatients.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200 dark:border-gray-700">
                      <TableHead className="text-gray-900 dark:text-gray-300">Patient</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-300">Age</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-300">Contact</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-300">Location</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-300">Risk Level</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-300">Pregnancy Status</TableHead>
                      <TableHead className="text-gray-900 dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPatients.map((patient) => (
                      <TableRow key={patient.id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#e6f3f5] dark:bg-[#2D7D89]/20 flex items-center justify-center">
                              <User className="w-5 h-5 text-[#2D7D89] dark:text-[#4AA0AD]" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                            {patient.firstName} {patient.lastName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {patient.id?.slice(0, 8) || 'Unknown'}...
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                          {getAgeFromBirthDate(patient.dateOfBirth)} years
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="w-3 h-3" />
                              {patient.phone || 'No phone'}
                            </div>
                            {patient.email && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">{patient.email}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3 h-3" />
                            {patient.address || 'Not specified'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskBadgeColor(patient.riskLevel)}>
                            {patient.riskLevel === 'high' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {getRiskLevelDisplay(patient.riskLevel)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={patient.isPregnant 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }>
                            {patient.isPregnant ? 'Pregnant' : 'Not Pregnant'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/patients/${patient.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#2D7D89] hover:text-[#245A62] hover:bg-[#e6f3f5] dark:text-[#4AA0AD] dark:hover:bg-[#2D7D89]/20"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/patients/${patient.id}/edit`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedPatients.length)} of {filteredAndSortedPatients.length} patients
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No patients found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || riskFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'Get started by adding your first patient.'
                }
              </p>
              <Link href="/patients/add">
                <Button className="bg-[#2D7D89] hover:bg-[#245A62] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Patient
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 