/**
 * @fileoverview Bank Statement Import Component
 * 
 * A comprehensive component for importing and processing bank statements
 * from CSV and PDF files. Includes drag-and-drop upload, parsing progress,
 * error handling, and transaction reconciliation.
 * 
 * @author GitHub Copilot
 * @version 1.0.0
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download,
  Eye,
  Clock,
  Database
} from 'lucide-react';
import { useFinancialData } from '../../hooks/use-financial-data';
import { BankStatement, ImportError } from '../../types/financial';

/**
 * Helper to check if PDF parsing failed due to image-based or unparseable PDF
 */
function isImageBasedPDFError(errors: ImportError[]): boolean {
  return errors.some(e =>
    e.message?.toLowerCase().includes('no text could be extracted') ||
    e.message?.toLowerCase().includes('pdf parsing failed')
  );
}

/**
 * Props for the BankStatementImport component
 */
interface BankStatementImportProps {
  /** Callback when import is completed */
  onImportComplete?: (statement: BankStatement) => void;
  /** CSS class name */
  className?: string;
}

/**
 * Component for importing bank statements
 * 
 * @param props - Component props
 * @returns JSX element
 */
export function BankStatementImport({ 
  onImportComplete, 
  className = '' 
}: BankStatementImportProps) {
  const {
    importStatement,
    getImportHistory,
    reconcileTransactions,
    isLoading,
    error
  } = useFinancialData();

  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importHistory, setImportHistory] = useState(() => {
    // Load history from localStorage if available
    const stored = localStorage.getItem('bankStatementHistory');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return getImportHistory();
      }
    }
    return getImportHistory();
  });

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isValidFile(file)) {
        setSelectedFile(file);
      }
    }
  }, []);

  // Validate file type and size
  const isValidFile = (file: File): boolean => {
    const validTypes = ['text/csv', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      alert('Please select a CSV or PDF file.');
      return false;
    }
    
    if (file.size > maxSize) {
      alert('File size must be less than 10MB.');
      return false;
    }
    
    return true;
  };

  // Handle import
  const handleImport = useCallback(async () => {
    if (!selectedFile) return;

    try {
      setUploadProgress(0);
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Generate a unique ID for this statement
      const statementId = `stmt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // If PDF, store it first before processing
      if (selectedFile.type === 'application/pdf') {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = function(e) {
            const base64 = e.target?.result as string;
            if (base64) {
              localStorage.setItem(`pdf_${statementId}`, base64);
              resolve(base64);
            } else {
              reject(new Error('Failed to read PDF file'));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read PDF file'));
          reader.readAsDataURL(selectedFile);
        });
        await base64Promise;
      }

      // Import the statement
      const statement = await importStatement(selectedFile);
      // Check for image-based PDF error and show a user-friendly message
      if (statement.errors && isImageBasedPDFError(statement.errors)) {
        alert('This PDF appears to be image-based or scanned. Text cannot be extracted. Please use a text-based PDF.');
      }

      // Update statement ID to match the one we used for storage
      const updatedStatement = { ...statement, id: statementId };

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setUploadProgress(0);
        setSelectedFile(null);

        // Add to local history
        const newHistory = [updatedStatement, ...importHistory];
        setImportHistory(newHistory);
        localStorage.setItem('bankStatementHistory', JSON.stringify(newHistory));

        if (onImportComplete) {
          onImportComplete(updatedStatement);
        }
      }, 1000);

    } catch (err) {
      setUploadProgress(0);
      console.error('Import failed:', err);
      // Show user-friendly error message
      const errorMessage = err instanceof Error ? err.message : 'Import failed. Please try again.';
      alert(`Import Error: ${errorMessage}`);
    }
  }, [selectedFile, importStatement, onImportComplete, importHistory]);

  // Get status color
  const getStatusColor = (status: BankStatement['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'processing': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status: BankStatement['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Bank Statement Import
        </CardTitle>
        <CardDescription>
          Import transactions from your bank statements (CSV or PDF format)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="import" className="w-full">
          <TabsList className="bg-muted rounded-lg shadow-sm p-1 flex gap-2 mb-8">
            <div className="flex sm:contents gap-1 overflow-x-auto scrollbar-hide">
              <TabsTrigger value="import" className="flex-shrink-0 px-3 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Import Statement</TabsTrigger>
              <TabsTrigger value="history" className="flex-shrink-0 px-3 py-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-background data-[state=active]:shadow-sm">Import History</TabsTrigger>
            </div>
          </TabsList>

          <TabsContent value="import" className="space-y-6 mt-6">
            {/* File Upload Area - Updated with theme-aware styling */}
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                ${selectedFile ? 'border-primary/30 bg-card hover:bg-accent/50' : ''}
              `}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  {/* File icon with theme-aware primary color */}
                  <FileText className="w-12 h-12 text-primary mx-auto" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Remove
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={isLoading}
                      size="sm"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20 hover:shadow-primary/40 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      {isLoading ? 'Importing...' : 'Import'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-medium">
                      Drop your bank statement here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports CSV and PDF files up to 10MB
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      id="file-upload"
                      className="sr-only"
                      accept=".csv,.pdf"
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" asChild>
                        <span>Choose File</span>
                      </Button>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading and processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Import Guidelines & PDF Help */}
            <div className="space-y-4">
              <h3 className="font-medium">Import Guidelines</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">CSV Format</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Include headers: Date, Description, Amount/Debit/Credit</li>
                    <li>• Date format: DD/MM/YYYY or YYYY-MM-DD</li>
                    <li>• Amounts as numbers (no currency symbols)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Supported Banks</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• State Bank of India (SBI)</li>
                    <li>• HDFC Bank</li>
                    <li>• ICICI Bank</li>
                    <li>• Axis Bank</li>
                    <li>• And most major Indian banks</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-900">
                <strong>PDF Import Help:</strong> If your PDF import fails with a message about no text being extracted, your PDF is likely scanned or image-based. <br />
                <ul className="list-disc ml-4">
                  <li>Use a PDF with selectable text (not a scanned image).</li>
                  <li>If you only have a scanned PDF, use an OCR tool (like <a href="https://www.onlineocr.net/" target="_blank" rel="noopener noreferrer" className="underline">Online OCR</a>) to convert it to text before importing.</li>
                  <li>For privacy, use trusted local OCR software if your statement is sensitive.</li>
                </ul>
                <span className="block mt-2">Need help? <a href="https://www.adobe.com/acrobat/online/pdf-to-text.html" target="_blank" rel="noopener noreferrer" className="underline">Convert PDF to text online</a></span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            {importHistory.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No import history</p>
                <p className="text-sm text-muted-foreground">
                  Your imported statements will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {importHistory.map((statement) => (
                  <div key={statement.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={getStatusColor(statement.status)}>
                          {getStatusIcon(statement.status)}
                        </div>
                        <div>
                          <h4 className="font-medium">{statement.fileName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {statement.bankName || 'Unknown Bank'} • 
                            {statement.transactionCount} transactions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          statement.status === 'completed' ? 'secondary' :
                          statement.status === 'failed' ? 'destructive' : 'default'
                        }>
                          {statement.status}
                        </Badge>
                        {statement.status === 'completed' && (
                          <div className="flex gap-1">
                            {/* Only show view button for PDF */}
                            {statement.fileName?.endsWith('.pdf') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  try {
                                    const pdfData = localStorage.getItem(`pdf_${statement.id}`);
                                    if (pdfData) {
                                      // Create a blob URL for better PDF viewing
                                      const byteCharacters = atob(pdfData.split(',')[1]);
                                      const byteNumbers = new Array(byteCharacters.length);
                                      for (let i = 0; i < byteCharacters.length; i++) {
                                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                                      }
                                      const byteArray = new Uint8Array(byteNumbers);
                                      const blob = new Blob([byteArray], { type: 'application/pdf' });
                                      const url = URL.createObjectURL(blob);
                                      
                                      // Open PDF in new tab
                                      const win = window.open(url, '_blank');
                                      if (!win) {
                                        alert('Please allow pop-ups to view the PDF.');
                                      }
                                    } else {
                                      alert('PDF file not found. It may have been cleared from storage.');
                                    }
                                  } catch (error) {
                                    console.error('Error viewing PDF:', error);
                                    alert('Failed to open PDF. Please try re-importing the file.');
                                  }
                                }}
                                title="View PDF"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Uploaded:</span>{' '}
                        {new Date(statement.uploadedAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Processed:</span>{' '}
                        {statement.processedAt 
                          ? new Date(statement.processedAt).toLocaleDateString()
                          : 'Pending'
                        }
                      </div>
                    </div>

                    {/* Statement Period */}
                    {statement.statementPeriod.startDate && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Period:</span>{' '}
                        {new Date(statement.statementPeriod.startDate).toLocaleDateString()} -{' '}
                        {new Date(statement.statementPeriod.endDate).toLocaleDateString()}
                      </div>
                    )}

                    {/* Errors */}
                    {statement.errors.length > 0 && (
                      <div className="mt-3">
                        <details className="space-y-2">
                          <summary className="text-sm font-medium cursor-pointer flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            {statement.errors.length} issues found
                          </summary>
                          <div className="space-y-1 ml-6">
                            {statement.errors.slice(0, 5).map((error, index) => (
                              <div key={index} className="text-sm">
                                <Badge 
                                  variant={error.severity === 'error' ? 'destructive' : 'secondary'}
                                  className="text-xs mr-2"
                                >
                                  {error.severity}
                                </Badge>
                                {error.row && `Row ${error.row}: `}
                                {error.message}
                              </div>
                            ))}
                            {statement.errors.length > 5 && (
                              <p className="text-xs text-muted-foreground">
                                +{statement.errors.length - 5} more issues
                              </p>
                            )}
                            {/* Show warning for image-based PDF error */}
                            {isImageBasedPDFError(statement.errors) && (
                              <div className="text-xs text-yellow-700 mt-2">
                                <strong>Warning:</strong> This PDF appears to be image-based or scanned. Text cannot be extracted. Please use a text-based PDF.
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default BankStatementImport;
