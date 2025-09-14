// Heavy export utilities - lazy loaded to reduce main bundle size
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const exportToPDF = async (roadmap, objective, finalGoal) => {
  if (!roadmap) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(roadmap.title || "Study Roadmap", margin, yPosition);
  yPosition += 15;

  // Basic info
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Duration: ${roadmap.totalDuration}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Difficulty Level: ${roadmap.difficultyLevel || "Not specified"}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Total Estimated Hours: ${roadmap.totalEstimatedHours || "Not specified"}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Number of Phases: ${roadmap.phases?.length}`, margin, yPosition);
  yPosition += 15;

  doc.text(`Learning Objective: ${objective}`, margin, yPosition);
  yPosition += 8;
  doc.text(`Final Goal: ${finalGoal}`, margin, yPosition);
  yPosition += 20;

  // Phases
  roadmap.phases.forEach((phase, index) => {
    if (yPosition > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Phase ${phase.phaseNumber}: ${phase.title}`, margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Duration: ${phase.duration}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Goal: ${phase.goal}`, margin, yPosition);
    yPosition += 10;

    // Mini-goals table
    if (phase.miniGoals && phase.miniGoals.length > 0) {
      const miniGoalsData = phase.miniGoals.map((mg) => [
        mg.completed ? "✓" : "○",
        mg.title,
        mg.estimatedTime,
        mg.priority || "N/A",
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [["Status", "Mini-Goal", "Time", "Priority"]],
        body: miniGoalsData,
        theme: "striped",
        margin: { left: margin, right: margin },
        styles: { fontSize: 8 },
      });

      yPosition = doc.lastAutoTable.finalY + 10;
    }

    // Resources table
    if (phase.resources && phase.resources.length > 0) {
      const resourcesData = phase.resources.map((res) => [
        res.name,
        res.type || "N/A",
        res.difficulty || "N/A",
        res.estimatedTime || "N/A",
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [["Resource", "Type", "Difficulty", "Time"]],
        body: resourcesData,
        theme: "striped",
        margin: { left: margin, right: margin },
        styles: { fontSize: 8 },
      });

      yPosition = doc.lastAutoTable.finalY + 15;
    }
  });

  // Save the PDF
  const fileName = `${roadmap.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_roadmap.pdf`;
  doc.save(fileName);
};

export const exportToHTML = async (roadmap, objective, finalGoal) => {
  if (!roadmap) return;

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${roadmap.title} - Study Roadmap</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    h2 { color: #2980b9; margin-top: 30px; }
    h3 { color: #27ae60; }
    .meta-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .phase {
      border-left: 4px solid #3498db;
      padding-left: 20px;
      margin: 25px 0;
    }
    .mini-goal {
      background: #f1f2f6;
      padding: 10px;
      margin: 8px 0;
      border-radius: 5px;
    }
    .resource {
      border: 1px solid #ddd;
      padding: 10px;
      margin: 5px 0;
      border-radius: 5px;
    }
    .completed { background: #d4edda; }
    .priority-high { border-left: 3px solid #e74c3c; }
    .priority-medium { border-left: 3px solid #f39c12; }
    .priority-low { border-left: 3px solid #27ae60; }
  </style>
</head>
<body>
  <h1>${roadmap.title}</h1>
  
  <div class="meta-info">
    <p><strong>Learning Objective:</strong> ${objective}</p>
    <p><strong>Final Goal:</strong> ${finalGoal}</p>
    <p><strong>Total Duration:</strong> ${roadmap.totalDuration}</p>
    <p><strong>Difficulty Level:</strong> ${roadmap.difficultyLevel || "Not specified"}</p>
    <p><strong>Total Estimated Hours:</strong> ${roadmap.totalEstimatedHours || "Not specified"}</p>
    <p><strong>Number of Phases:</strong> ${roadmap.phases?.length}</p>
  </div>
`;

  roadmap.phases.forEach((phase) => {
    html += `
  <div class="phase">
    <h2>Phase ${phase.phaseNumber}: ${phase.title}</h2>
    <p><strong>Duration:</strong> ${phase.duration}</p>
    <p><strong>Goal:</strong> ${phase.goal}</p>
    
    <h3>Mini-Goals</h3>
`;
    
    phase.miniGoals.forEach((miniGoal) => {
      const statusIcon = miniGoal.completed ? "✅" : "⬜";
      const completedClass = miniGoal.completed ? "completed" : "";
      const priorityClass = miniGoal.priority ? `priority-${miniGoal.priority.toLowerCase()}` : "";
      
      html += `
    <div class="mini-goal ${completedClass} ${priorityClass}">
      <p><strong>${statusIcon} ${miniGoal.title}</strong> (${miniGoal.estimatedTime})</p>
      <p>${miniGoal.description}</p>
      ${miniGoal.url ? `<p><a href="${miniGoal.url}" target="_blank">Resource Link</a></p>` : ""}
      ${miniGoal.priority ? `<p><small>Priority: ${miniGoal.priority}</small></p>` : ""}
      ${miniGoal.completedDate ? `<p><small>Completed: ${formatDate(miniGoal.completedDate)}</small></p>` : ""}
    </div>
`;
    });

    html += `
    <h3>Resources</h3>
`;
    
    phase.resources.forEach((resource) => {
      html += `
    <div class="resource">
      <p><strong>${resource.name}</strong> ${resource.type ? `(${resource.type})` : ""}</p>
      ${resource.url ? `<p><a href="${resource.url}" target="_blank">${resource.url}</a></p>` : ""}
      <p>${resource.description}</p>
      ${resource.difficulty ? `<p><small>Difficulty: ${resource.difficulty}</small></p>` : ""}
      ${resource.estimatedTime ? `<p><small>Time: ${resource.estimatedTime}</small></p>` : ""}
    </div>
`;
    });

    html += `
    <h3>Phase Project</h3>
`;
    
    if (typeof phase.project === "object") {
      html += `
    <p><strong>${phase.project.title}</strong></p>
    <p>${phase.project.description}</p>
`;
      if (phase.project.deliverables) {
        html += `<p><strong>Deliverables:</strong></p><ul>`;
        phase.project.deliverables.forEach((deliverable) => {
          html += `<li>${deliverable}</li>`;
        });
        html += `</ul>`;
      }
      
      if (phase.project.monetizationPotential) {
        html += `<p><strong>Monetization Potential:</strong> ${phase.project.monetizationPotential}</p>`;
      }
    } else {
      html += `<p>${phase.project}</p>`;
    }

    if (phase.milestone) {
      html += `<p><strong>Milestone:</strong> ${phase.milestone}</p>`;
    }

    html += `
    <h3>Skills You'll Gain</h3>
    <ul>
`;
    phase.skills.forEach((skill) => {
      html += `<li>${skill}</li>`;
    });
    html += `</ul></div>`;
  });

  html += `
  <hr style="margin-top: 40px;">
  <p><em>Generated by AI Study Roadmap Planner</em></p>
  <p><em>Created on: ${formatDate(new Date())}</em></p>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const fileName = `${roadmap.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_roadmap.html`;
  saveAs(blob, fileName);
};

export const exportToJSON = async (roadmap) => {
  if (!roadmap) return;

  const jsonContent = JSON.stringify(roadmap, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
  const fileName = `${roadmap.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_roadmap.json`;
  saveAs(blob, fileName);
};
