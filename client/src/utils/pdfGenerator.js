import { jsPDF } from 'jspdf';

export const generateActionPlanPDF = (processData, completedSteps = {}, eligibilityStatus = false) => {
  if (!processData) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const margin = 20;
  let yPosition = 25;

  // Primary branding colors
  const primaryColor = [124, 58, 237]; // purple-600
  const secondaryColor = [30, 41, 59]; // slate-800
  const textColor = [51, 65, 85]; // slate-700
  const lightBg = [248, 250, 252]; // slate-50

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('CIVICPILOT ACTION PLAN', margin, 18);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Your AI-Powered Guide for Government Procedures', margin, 26);
  
  // Date Stamp
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
  doc.text(`Generated: ${dateStr}`, 155, 26);

  yPosition = 50;

  // 2. Process Title & Overview
  doc.setTextColor(...secondaryColor);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(processData.name, margin, yPosition);
  
  yPosition += 6;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  
  // Split description if it overflows page width
  const descLines = doc.splitTextToSize(processData.description, 170);
  doc.text(descLines, margin, yPosition);
  yPosition += descLines.length * 5 + 4;

  // 3. Stats Block (Costs & Timelines)
  doc.setFillColor(...lightBg);
  doc.rect(margin, yPosition, 170, 20, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.text('Department:', margin + 5, yPosition + 7);
  doc.text('Est. Cost:', margin + 65, yPosition + 7);
  doc.text('Est. Timeline:', margin + 120, yPosition + 7);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(...textColor);
  doc.text(processData.department || 'N/A', margin + 5, yPosition + 14);
  doc.text(processData.estimatedCost || 'N/A', margin + 65, yPosition + 14);
  doc.text(processData.timeline || 'N/A', margin + 120, yPosition + 14);

  yPosition += 28;

  // 4. Eligibility Summary
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...secondaryColor);
  doc.text('Eligibility Status:', margin, yPosition);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  if (eligibilityStatus) {
    doc.setTextColor(16, 185, 129); // emerald-500
    doc.text('ELIGIBLE (All conditions passed)', margin + 35, yPosition);
  } else {
    doc.setTextColor(245, 158, 11); // amber-500
    doc.text('PENDING VERIFICATION / MISSING REQUIREMENTS', margin + 35, yPosition);
  }

  yPosition += 10;

  // 5. Steps Roadmap Header
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...secondaryColor);
  doc.text('Step-by-Step Roadmap', margin, yPosition);
  
  // Draw line separator
  doc.setDrawColor(226, 232, 240); // border gray
  doc.line(margin, yPosition + 2, 190, yPosition + 2);
  yPosition += 8;

  // 6. Loop steps
  processData.steps.forEach((step, idx) => {
    // Check page height limit (A4 is 297mm height)
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 25;
    }

    const isCompleted = !!completedSteps[step.id];

    // Bullet Circle or Check box
    doc.setFillColor(isCompleted ? 16 : 226, isCompleted ? 185 : 232, isCompleted ? 129 : 240);
    doc.circle(margin + 3, yPosition + 1.5, 2.5, 'F');
    
    // Check mark or index
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7);
    doc.text(isCompleted ? 'Y' : (idx + 1).toString(), margin + 2.2, yPosition + 2.5);

    // Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.text(step.title, margin + 10, yPosition + 2);

    // Cost & duration pill right side
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textColor);
    doc.text(`Time: ${step.duration}  |  Cost: ${step.cost}`, 140, yPosition + 2);

    // Description text
    yPosition += 6;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // gray-500
    const stepLines = doc.splitTextToSize(step.desc, 160);
    doc.text(stepLines, margin + 10, yPosition);

    yPosition += (stepLines.length * 4.5) + 6;
  });

  // 7. Footer Page Stamp
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // gray-400
  doc.text('CivicPilot is an AI guide. Always cross-reference with official portals before paying fees.', margin, 285);

  // Save the PDF
  doc.save(`CivicPilot_Plan_${processData.id}.pdf`);
};