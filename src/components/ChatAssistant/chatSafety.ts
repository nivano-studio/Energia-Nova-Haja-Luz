import { chatContext } from './chatContext';
import type { ExtractedEntities } from './types';

export type SafetyLevel = "urgent_human_support" | "safety_guided_questions" | "safety_warning" | null;

export function evaluateElectricalSafety(cleanInput: string, isContextual: boolean, entities: ExtractedEntities): SafetyLevel {
  const urgentKeywords = [
    "safety_urgent",
    "tomada esquentando",
    "fio derretendo",
    "cheiro de queimado",
    "faisca",
    "fumaca",
    "choque",
    "disjuntor caindo",
    "disjuntor desarmando",
    "curto"
  ];

  if (urgentKeywords.some(kw => cleanInput.includes(kw))) {
    return "urgent_human_support";
  }

  const warningKeywords = [
    "safety_warning",
    "posso ligar chuveiro em extensao",
    "posso emendar",
    "isolar com fita",
    "fio fino"
  ];

  if (warningKeywords.some(kw => cleanInput.includes(kw))) {
    return "safety_warning";
  }

  const guidedKeywords = [
    "safety_guided",
    "qual fio usar para chuveiro",
    "qual cabo para chuveiro",
    "qual disjuntor para chuveiro",
    "qual cabo para ar condicionado",
    "qual fio para tomada"
  ];

  if (guidedKeywords.some(kw => cleanInput.includes(kw))) {
    return "safety_guided_questions";
  }

  // Also trigger if the user mentions wire/breaker + shower/AC
  const hasWireOrBreaker = cleanInput.includes("fio") || cleanInput.includes("cabo") || cleanInput.includes("disjuntor");
  const hasHeavyLoad = cleanInput.includes("chuveiro") || cleanInput.includes("ar condicionado") || cleanInput.includes("motor");
  
  if (hasWireOrBreaker && hasHeavyLoad) {
    return "safety_guided_questions";
  }

  // Contextual check
  if (isContextual) {
    const isHeavyLoadContext = 
      chatContext.softContext.subject === "chuveiro" || 
      chatContext.softContext.subject === "ar condicionado" ||
      chatContext.softContext.entities.usage === "chuveiro" || 
      chatContext.softContext.entities.usage === "ar condicionado";
    
    if (isHeavyLoadContext && (entities.powerWatts || entities.voltage || entities.currentAmps)) {
      return "safety_guided_questions";
    }
  }

  return null;
}
