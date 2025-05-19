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
  Plus, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle,
  Phone
} from 'lucide-react';
import { getPatients } from '@/lib/firebase/patients';
import { formatDate, calculateAge } from '@/lib/utils';
import { Patient } from '@/lib/firebase/patients';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  
  const risk = searchParams.get('risk') || '';
  const patientsPerPage = 10;

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const result = await getPatients();
        
        if (result.success) {
          let filteredPatients = result.patients || [];
          
          // Filter by risk level if specified in URL
          if (risk) {
            filteredPatients = filteredPatients.filter(patient => patient.riskLevel === risk);
          }
          
          setPatients(filteredPatients);
        } else {
          console.error('Failed to fetch patients:', result.error);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, [risk]);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

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
          <Button className="mt-4 sm:mt-0">
            <Plus className="mr-2 h-4 w-4" /> Add Patient
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Link href="/patients">
                <Button variant={!risk ? 'default' : 'outline'} size="sm">
                  All
                </Button>
              </Link>
              <Link href="/patients?risk=high">
                <Button variant={risk === 'high' ? 'destructive' : 'outline'} size="sm">
                  High Risk
                </Button>
              </Link>
              <Link href="/patients?risk=medium">
                <Button variant={risk === 'medium' ? 'secondary' : 'outline'} size="sm">
                  Medium Risk
                </Button>
              </Link>
              <Link href="/patients?risk=low">
                <Button variant={risk === 'low' ? 'default' : 'outline'} size="sm">
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
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500 mb-4">No patients found</p>
              <Link href="/patients/add">
                <Button>
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
                        <TableCell>{patient.pregnancyStage || "Not recorded"}</TableCell>
                        <TableCell>
                          {patient.nextVisit ? (
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              {formatDate(patient.nextVisit)}
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
                              <Button variant="outline" size="sm">View</Button>
                            </Link>
                            <Link href={`tel:${patient.phone}`}>
                              <Button variant="ghost" size="icon">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </Link>
                            {patient.riskLevel === 'high' && (
                              <Link href={`/patients/${patient.id}/alerts`}>
                                <Button variant="ghost" size="icon" className="text-red-500">
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
                    Showing {indexOfFirstPatient + 1}-{Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} patients
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
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