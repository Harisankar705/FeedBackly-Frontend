import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileCog, Calendar, PieChart, FileText, Eye } from "lucide-react";
import { downloadCSV, exportSurveysToCSV } from "@/lib/survey-service";
import { ISurvey } from "@/interfaces/interface";
import { surveyAPI } from "@/api/surveyApi";
import { useAuthStore } from "@/store/authStore";


const AdminDashboard = () => {
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewSurvey, setViewSurvey] = useState<ISurvey | null>(null);
  const [loading,setLoading]=useState(false)
  const [error, setError] = useState<string | null>(null);
  // const [surveys,setSurveys]=useState<ISurvey[]>([])
  // useEffect(()=>{
  //   const fetchSurveys=async()=>{
  //     try {
  //       setLoading(true)
  //     const response=await surveyAPI.fetchSurvey()
  //     setSurveys(response.data)
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   finally{
  //     setLoading(false)
  //   }
  // }
  //   fetchSurveys()
  // },[])
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      toast({
        title: "Access denied",
        description: "You must be logged in as admin to view this page",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, navigate, toast]);
  
  const { data: surveys = [], isLoading, isError } = useQuery({
    queryKey: ["surveys"],
    queryFn: async () => {
      const response = await surveyAPI.fetchSurvey();
      return response.data;
    },
   
  });
  
  
  
  
  const handleViewClick = (survey: ISurvey) => {
    setViewSurvey(survey);
  };
  
 
  
  const handleExport = () => {
    if (surveys && surveys.length > 0) {
    const formattedSurveys=surveys.map((survey:ISurvey)=>({
        ...survey,
        createdAt:typeof survey.createdAt==='string'  ? new Date(survey.createdAt):survey.createdAt
      }))
      const csvData = exportSurveysToCSV(formattedSurveys);
      const date = new Date().toISOString().split('T')[0];
      downloadCSV(csvData, `survey-data-${date}.csv`);
      toast({
        title: "Data exported successfully",
        description: "The survey data has been exported to CSV format.",
      });
    } else {
      toast({
        title: "Export failed",
        description: "No data available to export",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="text-center">
          <Skeleton className="h-12 w-48 mx-auto mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }
  
  
  
  const getDisplayedNationality = (code: string): string => {
    const nationalities: Record<string, string> = {
      us: "United States",
      ca: "Canada",
      uk: "United Kingdom",
      au: "Australia",
      fr: "France",
      de: "Germany",
      in: "India",
      jp: "Japan",
      other: "Other"
    };
    return nationalities[code] || code;
  };
  
  const formatDate = (date: string | Date): string => {
    if (!date) return "N/A";
    return format(new Date(date), "MMM d, yyyy");
  };
  
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Survey Submissions</h1>
            <p className="mt-2 text-sm text-[#7D99AA]">A list of all survey submissions including name, email, phonenumber number and date.</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <Button 
              onClick={handleExport}
              className="bg-[#66C4FF] hover:bg-[#66C4FF]/90 text-white"
            >
              <FileCog className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                {loading ? (
                  <div className="p-8">
                    <Skeleton className="h-8 w-full mb-4" />
                    <Skeleton className="h-8 w-full mb-4" />
                    <Skeleton className="h-8 w-full mb-4" />
                  </div>
                ) : error ? (
                  <div className="text-center p-8 text-red-500">
                    Failed to load survey data
                  </div>
                ) : surveys && surveys.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-4 pr-3 sm:pl-6">Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Nationality</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {surveys.map((survey: any) => (
                        <TableRow key={survey.id}>
                          <TableCell className="whitespace-nowrap py-4 pl-4 pr-3 font-medium text-gray-900 sm:pl-6">
                            {survey.name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-4 text-[#7D99AA]">
                            {survey.email}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-4 text-[#7D99AA]">
                            {survey.phonenumber}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-4 text-[#7D99AA]">
                            {getDisplayedNationality(survey.nationality)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-4 text-[#7D99AA]">
                            {formatDate(survey.createdAt)}
                          </TableCell>
                          <TableCell className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <Button
                              variant="ghost"
                              className="text-[#66C4FF] hover:text-[#66C4FF]/80 mr-2"
                              onClick={() => handleViewClick(survey)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center p-8 text-[#7D99AA]">
                    No surveys submitted yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-[#FFC067]/20 p-3">
                    <FileText className="h-5 w-5 text-[#FFC067]" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[#7D99AA] truncate">Total Submissions</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{surveys?.length || 0}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-[#66F4FF]/20 p-3">
                    <Calendar className="h-5 w-5 text-[#66F4FF]" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[#7D99AA] truncate">Recent Submissions</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {surveys ? surveys.filter((s: ISurvey) => {
                          if(!s.createdAt)return false
                          const date = new Date(s.createdAt);
                          const now = new Date();
                          const diffTime = Math.abs(now.getTime() - date.getTime());
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return diffDays <= 7;
                        }).length : 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-[#66C4FF]/20 p-3">
                    <PieChart className="h-5 w-5 text-[#66C4FF]" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-[#7D99AA] truncate">Analytics</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">View data</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => {
        if (!open) setDeleteId(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the survey submission. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
           
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* View Survey Dialog */}
      <Dialog open={viewSurvey !== null} onOpenChange={(open) => {
        if (!open) setViewSurvey(null);
      }}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>Survey Details</DialogTitle>
          </DialogHeader>
          
          {viewSurvey && (
            <div className="mt-4 space-y-4 bg-white">
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-sm text-gray-500">Name:</div>
                <div className="col-span-2 text-sm">{viewSurvey.name}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-sm text-gray-500">Gender:</div>
                <div className="col-span-2 text-sm">{viewSurvey.gender}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-sm text-gray-500">Nationality:</div>
                <div className="col-span-2 text-sm">{getDisplayedNationality(viewSurvey.nationality)}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-sm text-gray-500">Email:</div>
                <div className="col-span-2 text-sm">{viewSurvey.email}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-sm text-gray-500">Phone:</div>
                <div className="col-span-2 text-sm">{viewSurvey.phonenumber}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-sm text-gray-500">Address:</div>
                <div className="col-span-2 text-sm">{viewSurvey.address}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-sm text-gray-500">Message:</div>
                <div className="col-span-2 text-sm">{viewSurvey.message}</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="font-medium text-sm text-gray-500">Date:</div>
                <div className="col-span-2 text-sm">{viewSurvey.createdAt ? formatDate(viewSurvey.createdAt):'N/A'}</div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
