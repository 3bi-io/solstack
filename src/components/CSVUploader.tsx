import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CSVRow {
  address: string;
  amount?: number;
}

interface CSVUploaderProps {
  onDataParsed: (data: CSVRow[]) => void;
}

export const CSVUploader = ({ onDataParsed }: CSVUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const validateAddress = (address: string): boolean => {
    // Basic Solana address validation (32-44 characters, base58)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address.trim());
  };

  const parseCSV = useCallback((file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validRows: CSVRow[] = [];
        const errorMessages: string[] = [];

        results.data.forEach((row: any, index: number) => {
          const address = row.address || row.Address || row.wallet || row.Wallet;
          const amount = row.amount || row.Amount;

          if (!address) {
            errorMessages.push(`Row ${index + 1}: Missing address`);
            return;
          }

          if (!validateAddress(address)) {
            errorMessages.push(`Row ${index + 1}: Invalid Solana address: ${address}`);
            return;
          }

          validRows.push({
            address: address.trim(),
            amount: amount ? parseFloat(amount) : undefined,
          });
        });

        if (errorMessages.length > 0) {
          setErrors(errorMessages);
          toast({
            title: "CSV Validation Errors",
            description: `Found ${errorMessages.length} errors. Check the list below.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "CSV Parsed Successfully",
            description: `Loaded ${validRows.length} recipients`,
          });
        }

        setParsedData(validRows);
        onDataParsed(validRows);
      },
      error: (error) => {
        toast({
          title: "CSV Parsing Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  }, [onDataParsed, toast]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setFile(file);
    setErrors([]);
    parseCSV(file);
  }, [parseCSV, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleRemove = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    onDataParsed([]);
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <Card>
          <CardContent className="p-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg font-medium">Drop your CSV file here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">
                    Drag & drop your CSV file here
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    or click to browse
                  </p>
                  <Button variant="outline" size="sm">
                    Select CSV File
                  </Button>
                </>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">CSV Format Requirements:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Column: <code className="bg-background px-1">address</code> (required) - Solana wallet address</li>
                <li>• Column: <code className="bg-background px-1">amount</code> (optional) - Amount per address</li>
                <li>• Example: <code className="bg-background px-1">address,amount</code></li>
                <li>• Maximum 1000 recipients per CSV</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {parsedData.length} recipients loaded
                    {errors.length > 0 && ` • ${errors.length} errors`}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRemove}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {errors.length === 0 && parsedData.length > 0 && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700 dark:text-green-400">
                  All addresses validated successfully
                </span>
              </div>
            )}

            {errors.length > 0 && (
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    Validation Errors ({errors.length})
                  </span>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {errors.slice(0, 10).map((error, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      {error}
                    </p>
                  ))}
                  {errors.length > 10 && (
                    <p className="text-xs text-muted-foreground italic">
                      ...and {errors.length - 10} more errors
                    </p>
                  )}
                </div>
              </div>
            )}

            {parsedData.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Preview (first 5 rows)</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2 font-medium">Address</th>
                        {parsedData[0].amount !== undefined && (
                          <th className="text-left p-2 font-medium">Amount</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2 font-mono text-xs">
                            {row.address.slice(0, 8)}...{row.address.slice(-8)}
                          </td>
                          {row.amount !== undefined && (
                            <td className="p-2">{row.amount}</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parsedData.length > 5 && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    ...and {parsedData.length - 5} more recipients
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
