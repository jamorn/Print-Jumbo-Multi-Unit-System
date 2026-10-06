import type { GradeItem, GradeOption, UnitId } from "@/type";

const SEABULK_THRESHOLD = 16000;

/**
 * generateGradeOptions (PL)
 * จาก gradeItems (GAS) → array ของ option สำหรับตาราง
 *
 * Rule: netweight >= 16000 ใช้ "/SB/" ; ปกติ "/"
 * SUB: displayText = "<GRADE> SUB/<netweight>"
 */
export function generatePlGradeOptions(gradeItems: GradeItem[]): GradeOption[] {
  const options: GradeOption[] = [];

  gradeItems.forEach((g) => {
    if (g.status === false) return;

    g.netweightArray.forEach((netweight) => {
      const separator = netweight >= SEABULK_THRESHOLD ? "/SB/" : "/";
      const gradeString = `${g.grade}${separator}${netweight}`;
      const isSeabulk = netweight >= SEABULK_THRESHOLD;
      const displayText = isSeabulk
        ? `${g.grade}/SB/${netweight}`
        : `${g.grade}/${netweight}`;

      options.push({
        grade: g.grade,
        netweight,
        isSub: false,
        isSeabulk,
        gradeString,
        displayText,
        description: g.description,
      });

      if (g.sub === true) {
        const subDisplayText = `${g.grade} SUB/${netweight}`;
        options.push({
          grade: g.grade,
          netweight,
          isSub: true,
          isSeabulk,
          gradeString,
          displayText: subDisplayText,
          description: `${g.description} (SUB)`,
        });
      }
    });
  });

  return options;
}

/**
 * generateSasbGradeOptions
 * เหมือน PL แต่:
 *  - displayText SUB = "<GRADE>SUB/<netweight>" (ไม่เว้นวรรค)
 *  - เพิ่ม specialGrade, isSpecial, plantCode, plantName
 */
export function generateSasbGradeOptions(gradeItems: GradeItem[]): GradeOption[] {
  const options: GradeOption[] = [];

  gradeItems.forEach((g) => {
    if (g.status === false) return;

    const specialGrade = String(g.specialGrade || "N").trim().toUpperCase() === "Y" ? "Y" : "N";
    const isSpecial = specialGrade === "Y";

    g.netweightArray.forEach((netweight) => {
      const separator = netweight >= SEABULK_THRESHOLD ? "/SB/" : "/";
      const gradeString = `${g.grade}${separator}${netweight}`;
      const isSeabulk = netweight >= SEABULK_THRESHOLD;
      const displayText = isSeabulk
        ? `${g.grade}/SB/${netweight}`
        : `${g.grade}/${netweight}`;

      options.push({
        grade: g.grade,
        netweight,
        isSub: false,
        isSeabulk,
        gradeString,
        displayText,
        description: g.description,
        specialGrade,
        isSpecial,
        plantCode: g.plantCode,
        plantName: g.plantName,
      });

      if (g.sub === true) {
        const subDisplayText = `${g.grade}SUB/${netweight}`;
        options.push({
          grade: g.grade,
          netweight,
          isSub: true,
          isSeabulk,
          gradeString,
          displayText: subDisplayText,
          description: `${g.description || ""} (SUB)`,
          specialGrade,
          isSpecial,
          plantCode: g.plantCode,
          plantName: g.plantName,
        });
      }
    });
  });

  return options;
}

/** เลือก generator ตาม unit profile */
export function generateGradeOptions(
  gradeItems: GradeItem[],
  profile: "PL" | "SASB",
): GradeOption[] {
  return profile === "SASB"
    ? generateSasbGradeOptions(gradeItems)
    : generatePlGradeOptions(gradeItems);
}
