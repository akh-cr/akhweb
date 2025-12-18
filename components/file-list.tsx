import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileItem {
  name: string;
  size: string;
  type: "pdf" | "doc" | "docx" | "ppt" | "pptx" | "other";
  url: string; // Placeholder URL
}

interface FileListProps {
  files: readonly FileItem[];
}

export function FileList({ files }: FileListProps) {
  return (
    <div className="flex flex-col gap-4">
      {files.map((file, index) => (
        <a 
          key={index} 
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="flex items-center justify-between p-4 bg-card border rounded-xl hover:border-primary/50 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground uppercase">{file.type} • {file.size}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary">
            <Download className="h-5 w-5" />
            <span className="sr-only">Stáhnout</span>
          </Button>
        </a>
      ))}
    </div>
  );
}
