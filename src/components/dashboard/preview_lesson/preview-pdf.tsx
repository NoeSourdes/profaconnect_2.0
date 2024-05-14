"use client";

import { Undo2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "../../ui/button";
import { BreadcrumbComponent } from "../Breadcrumb";
import { TopBarPdf } from "./top-bar-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export type PreviewPdfProps = {
  url: string;
  courseId: string;
  lessonId: string;
  lessonTitle: string;
};

export const PreviewPdf = (props: PreviewPdfProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }
  return (
    <div>
      <div className="flex items-center gap-3 w-full">
        <Link href={`/courses/${props.courseId}`}>
          <Button size="icon" variant="secondary">
            <Undo2 size={20} />
          </Button>
        </Link>
        <BreadcrumbComponent
          array={[
            { item: "Home", link: "/" },
            { item: "Dashboard", link: "/dashboard" },
            { item: "Cours", link: "/courses" },
            { item: "Leçons", link: `/courses/${props.courseId}` },
            {
              item: props.lessonTitle,
              link: `/courses/${props.courseId}/${props.lessonId}`,
            },
          ]}
        />
      </div>
      <div className="w-full bg-background flex flex-col items-center pt-5">
        <TopBarPdf />
        <div className="flex-1 w-full max-h-screen flex justify-center max-sm:overflow-hidden">
          <div>
            <Document
              file={props.url}
              onLoadSuccess={onDocumentLoadSuccess}
              className="max-h-full"
            >
              <Page pageNumber={pageNumber} />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
};
