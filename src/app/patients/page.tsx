'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  Phone,
  ArrowUpDown
} from 'lucide-react';
import { getPatients, Patient, deletePatient } from '@/lib/firebase/patients';
import { formatDate, calculateAge } from '@/lib/utils';
import { appointmentsService } from '@/lib/firebase/appointments';
import { toast } from 'sonner';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);
  const searchParams = useSearchParams();
  
  const risk = searchParams.get('risk') || '';

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const result = await getPatients();
      if (result.success && result.patients) {
        setPatients(result.patients);
        
        // Fetch next appointments for all patients
        const appointmentPromises = result.patients.map(async (patient) => {
          if (patient.id) {
            const appointmentResult = await appointmentsService.getNextAppointment(patient.id);
            return {
              patientId: patient.id,
              nextVisit: appointmentResult.appointment ? `${appointmentResult.appointment.date} ${appointmentResult.appointment.time}` : null
            };
          }
          return { patientId: patient.id || '', nextVisit: null };
        });
        
        const appointmentResults = await Promise.all(appointmentPromises);
        const appointmentsMap: {[key: string]: string} = {};
        
        appointmentResults.forEach(({ patientId, nextVisit }) => {
          if (nextVisit) {
            appointmentsMap[patientId] = nextVisit;
          }
        });
        
        setAppointments(appointmentsMap);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort patients
  const filteredAndSortedPatients = patients
    .filter(patient => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesRisk = !risk || patient.riskLevel === risk;
      return matchesSearch && matchesRisk;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'name-desc':
          return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
        case 'date-newest':
          const dateA = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate()) : new Date(0);
          const dateB = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate()) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        case 'date-oldest':
          const dateA2 = a.createdAt ? (a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate()) : new Date(0);
          const dateB2 = b.createdAt ? (b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate()) : new Date(0);
          return dateA2.getTime() - dateB2.getTime();
        default:
          return 0;
      }
    });

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredAndSortedPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredAndSortedPatients.length / patientsPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Get risk level badge color
  const getRiskBadgeColor = (riskLevel: string | undefined) => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'low':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
        <Link href="/patients/add">
          <Button className="mt-4 sm:mt-0 bg-[#2D7D89] hover:bg-[#236570] text-white">
            <Plus className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="date-newest">Date Added (Newest)</SelectItem>
                    <SelectItem value="date-oldest">Date Added (Oldest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/patients">
                <Button 
                  className={!risk ? 'bg-[#2D7D89] hover:bg-[#236570] text-white' : 'border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89] hover:text-white'} 
                  variant={!risk ? 'default' : 'outline'} 
                  size="sm"
                >
                  All
                </Button>
              </Link>
              <Link href="/patients?risk=high">
                <Button 
                  className={risk === 'high' ? 'bg-[#F7913D] hover:bg-[#E6822A] text-white' : 'border-[#F7913D] text-[#F7913D] hover:bg-[#F7913D] hover:text-white'} 
                  variant={risk === 'high' ? 'default' : 'outline'} 
                  size="sm"
                >
                  High Risk
                </Button>
              </Link>
              <Link href="/patients?risk=medium">
                <Button 
                  className={risk === 'medium' ? 'bg-[#2D7D89] hover:bg-[#236570] text-white' : 'border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89] hover:text-white'} 
                  variant={risk === 'medium' ? 'default' : 'outline'} 
                  size="sm"
                >
                  Medium Risk
                </Button>
              </Link>
              <Link href="/patients?risk=low">
                <Button 
                  className={risk === 'low' ? 'bg-[#2D7D89] hover:bg-[#236570] text-white' : 'border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89] hover:text-white'} 
                  variant={risk === 'low' ? 'default' : 'outline'} 
                  size="sm"
                >
                  Low Risk
                </Button>
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]"></div>
              <p className="mt-2 text-sm text-gray-500">Loading patients...</p>
            </div>
          ) : filteredAndSortedPatients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500 mb-4">No patients found</p>
              <Link href="/patients/add">
                <Button className="bg-[#2D7D89] hover:bg-[#236570] text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add New Patient
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Pregnancy Stage</TableHead>
                      <TableHead>Next Visit</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">
                          <Link href={`/patients/${patient.id}`} className="hover:text-primary hover:underline">
                            {patient.firstName} {patient.lastName}
                          </Link>
                        </TableCell>
                        <TableCell>{calculateAge(patient.dateOfBirth)} years</TableCell>
                        <TableCell>{patient.pregnancyWeek ? `Week ${patient.pregnancyWeek}` : "Not recorded"}</TableCell>
                        <TableCell>
                          {appointments[patient.id || ''] ? (
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              {appointments[patient.id || '']}
                            </div>
                          ) : (
                            "Not scheduled"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiskBadgeColor(patient.riskLevel)}>
                            {patient.riskLevel || "Not assessed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={`/patients/${patient.id}`}>
                              <Button variant="outline" size="sm" className="border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89] hover:text-white">View</Button>
                            </Link>
                            <Link href={`tel:${patient.phone}`}>
                              <Button variant="ghost" size="icon" className="text-[#2D7D89] hover:bg-[#2D7D89] hover:text-white">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </Link>
                            {patient.riskLevel === 'high' && (
                              <Link href={`/patients/${patient.id}/alerts`}>
                                <Button variant="ghost" size="icon" className="text-[#F7913D] hover:bg-[#F7913D] hover:text-white">
                                  <AlertCircle className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {indexOfFirstPatient + 1}-{Math.min(indexOfLastPatient, filteredAndSortedPatients.length)} of {filteredAndSortedPatients.length} patients
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89] hover:text-white"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      const pageNum = currentPage > 3 && totalPages > 5
                        ? currentPage - 3 + i + (totalPages - currentPage < 2 ? -(5 - (totalPages - currentPage + 1)) : 0)
                        : i + 1;
                      
                      if (pageNum <= totalPages) {
                        return (
                          <Button
                            key={i}
                            className={currentPage === pageNum ? 'bg-[#2D7D89] hover:bg-[#236570] text-white' : 'border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89] hover:text-white'}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => paginate(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                      return null;
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#2D7D89] text-[#2D7D89] hover:bg-[#2D7D89] hover:text-white"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 