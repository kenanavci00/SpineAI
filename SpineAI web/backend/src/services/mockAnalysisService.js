/**
 * Mock Analysis Service
 * YOLO model olmadan test için mock data döner
 */

export const mockAnalyzeImage = async (imagePath) => {
  // Simulated processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Random analysis results
  const hasPathology = Math.random() > 0.5;
  const cobbAngle = Math.random() * 30 + 10; // 10-40 degrees
  const imageType = Math.random() > 0.5 ? 'AP' : 'LATERAL';
  
  const findings = {
    compression_fracture: hasPathology ? Math.floor(Math.random() * 2) : 0,
    herniated_disc: hasPathology ? Math.floor(Math.random() * 3) : 0,
    listhesis: hasPathology ? Math.floor(Math.random() * 2) : 0
  };

  const totalFindings = findings.compression_fracture + findings.herniated_disc + findings.listhesis;
  const severity = totalFindings > 2 ? 'critical' : totalFindings > 0 ? 'moderate' : 'normal';
  const consultDoctor = totalFindings > 0 || cobbAngle > 15;

  const recommendations = [];
  if (findings.compression_fracture > 0) {
    recommendations.push('Acil ortopedi konsültasyonu önerilir - Çökme kırığı tespit edildi');
  }
  if (findings.herniated_disc > 0) {
    recommendations.push('Disk hernisi tespit edildi - Doktor muayenesi gereklidir');
  }
  if (findings.listhesis > 0) {
    recommendations.push('Vertebral kayma tespit edildi - Doktor kontrolü önerilir');
  }
  if (imageType === 'AP' && cobbAngle > 15) {
    recommendations.push(`Skolyoz tespit edildi (Cobb: ${cobbAngle.toFixed(1)}°) - Doktora danışınız`);
  }
  if (imageType === 'LATERAL' && cobbAngle < 20) {
    recommendations.push('Lordoz düzleşmesi tespit edildi - Doktor muayenesi önerilir');
  }
  if (recommendations.length === 0) {
    recommendations.push('Normal omurga anatomisi - Rutin kontroller önerilir');
  }

  return {
    success: true,
    imageType,
    cobbAngle: parseFloat(cobbAngle.toFixed(2)),
    vertebraeCount: Math.floor(Math.random() * 5) + 10, // 10-15
    findings,
    severity,
    consultDoctor,
    recommendations,
    score: Math.max(0, 100 - (totalFindings * 20 + (cobbAngle > 15 ? 15 : 0))),
    imagePath
  };
};
