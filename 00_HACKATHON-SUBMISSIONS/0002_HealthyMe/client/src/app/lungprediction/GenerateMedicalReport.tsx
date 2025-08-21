import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface ReportData {
  name: string;
  email: string;
  mobile: string;
  chance: string;
  filepath: string;
}

export const generateMedicalReport = (data: ReportData) => {
  const { name, email, mobile, chance, filepath } = data;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFillColor(0, 123, 255); // Blue color for header
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(24);
  doc.text("HealthifyMe", 20, 20);

  // Logo (assuming you have a base64 encoded logo)
 // const logo = "";
  //doc.addImage(logo, 'PNG', pageWidth - 50, 5, 20, 20);

  // Title
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0); // Black text
  doc.text("GENERATED MRI REPORT", pageWidth / 2, 50, { align: 'center' });

  // Patient Information
  doc.setFontSize(12);
  doc.text(`Name: ${name}`, 20, 70);
  doc.text(`Email: ${email}`, 20, 80);
  doc.text(`Mobile: ${mobile}`, 20, 90);
  doc.text(`Chances of Pneumonia: ${chance}`, 20, 100);

  // Scanned Image
  doc.text("Scanned Image:", 20, 120);
  doc.addImage(filepath, 'JPEG', 20, 130, 80, 80);

  // Doctor's Stamp
  doc.setFillColor(200, 200, 200); // Light gray
  doc.roundedRect(pageWidth - 80, pageHeight - 30, 30, 30, 5, 5, 'F');
  doc.setFontSize(10);
  doc.text("Doctor's Stamp", pageWidth - 70, pageHeight - 50);

  // Patient Predictor
  doc.setFontSize(14);
  doc.text("Patient Predictor: AI-Assisted Diagnosis", 20, pageHeight - 80);

  // Terms and Conditions
  doc.setFontSize(8);
  doc.text("Terms and Conditions:", 20, pageHeight - 60);
  doc.text("1. This report is generated with the assistance of AI and should be reviewed by a medical professional.", 20, pageHeight - 50);
  doc.text("2. The results are not a definitive diagnosis and should be used in conjunction with other clinical findings.", 20, pageHeight - 45);
  doc.text("3. HealthifyMe and its AI system are not liable for any misdiagnosis or medical decisions made based on this report.", 20, pageHeight - 40);

  // Footer
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 20, pageHeight - 20);
  doc.text("HealthifyMe", pageWidth - 40, pageHeight - 20);
  doc.save("1.pdf")
  return doc;
};

