import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell, TableRow, TextRun, WidthType, HeadingLevel, AlignmentType } from 'docx';
import { Table, TableBody, TableCell as UITableCell, TableHead, TableHeader, TableRow as UITableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanyData } from '@/lib/utils';

export default function SecurityReport() {
  const { user } = useAuth();

  const handleDownload = async () => {
    const securityData = getCompanyData(user?.company, 'securityData', []);
    const improvements = getCompanyData(user?.company, 'securityImprovements', {});
    const actionPlans = getCompanyData(user?.company, 'securityActionPlans', {});

    const sections = [];
    sections.push(new Paragraph({ text: '보안성 검토 결과보고서', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, spacing: { after: 400 } }));

    // 1. 영향평가 기준
    sections.push(new Paragraph({ text: '1. 영향평가 기준', heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
    const criteriaByTarget: { [key: string]: { [subField: string]: string[] } } = {};
    securityData.forEach((item: any) => {
      if (item.status !== '해당없음') {
        if (!criteriaByTarget[item.targetName]) criteriaByTarget[item.targetName] = {};
        if (!criteriaByTarget[item.targetName][item.subField]) criteriaByTarget[item.targetName][item.subField] = [];
        criteriaByTarget[item.targetName][item.subField].push(item.no);
      }
    });
    
    // Sort by targets order
    const targets = getCompanyData(user?.company, 'securityTargets', []);
    const targetOrder = targets.map((t: any) => t.name);
    const sortedTargetNames = Object.keys(criteriaByTarget).sort((a, b) => {
      const indexA = targetOrder.indexOf(a);
      const indexB = targetOrder.indexOf(b);
      return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
    });
    
    sortedTargetNames.forEach(targetName => {
      sections.push(new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: `[${targetName}]`, bold: true })] }));
      Object.keys(criteriaByTarget[targetName]).forEach(subField => {
        sections.push(new Paragraph({ text: `- ${subField} (${criteriaByTarget[targetName][subField].join(', ')})` }));
      });
    });

    // 2. 침해요인 분석
    sections.push(new Paragraph({ text: '2. 평가기준에 따른 개인정보 침해요인 분석･평가', heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
    const riskItems = securityData.filter((item: any) => item.status === '부분이행' || item.status === '미이행')
      .map((item: any) => {
        const itemId = `${item.targetName}-${item.no}`;
        const saved = improvements[itemId];
        return { targetName: item.targetName, code: item.no, evidence: item.evidence || '', riskFactor: saved?.riskFactor || '' };
      });
    if (riskItems.length > 0) {
      const riskRows = [
        new TableRow({ children: [new TableCell({ children: [new Paragraph('검토대상명')] }), new TableCell({ children: [new Paragraph('질의문 코드')] }), new TableCell({ children: [new Paragraph('취약점')] }), new TableCell({ children: [new Paragraph('침해요인')] })] }),
        ...riskItems.map((item: any) => new TableRow({ children: [new TableCell({ children: [new Paragraph(item.targetName)] }), new TableCell({ children: [new Paragraph(item.code)] }), new TableCell({ children: [new Paragraph(item.evidence)] }), new TableCell({ children: [new Paragraph(item.riskFactor)] })] }))
      ];
      sections.push(new DocxTable({ rows: riskRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    }

    // 3. 개선 조치 계획
    sections.push(new Paragraph({ text: '3. 주요 위험요소에 따른 개선 조치 계획', heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
    const actionsByTarget: { [key: string]: any[] } = {};
    securityData.forEach((item: any) => {
      if (item.status === '부분이행' || item.status === '미이행') {
        const itemId = `${item.targetName}-${item.no}`;
        const savedAction = actionPlans[itemId];
        const savedImprovement = improvements[itemId];
        if (savedAction || savedImprovement) {
          if (!actionsByTarget[item.targetName]) actionsByTarget[item.targetName] = [];
          actionsByTarget[item.targetName].push({ code: item.no, question: item.item, evidence: item.evidence, guide: savedImprovement?.improvementPlan || '', ...savedAction });
        }
      }
    });
    
    // Sort by targets order
    const sortedActionTargetNames = Object.keys(actionsByTarget).sort((a, b) => {
      const indexA = targetOrder.indexOf(a);
      const indexB = targetOrder.indexOf(b);
      return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
    });
    
    sortedActionTargetNames.forEach(targetName => {
      sections.push(new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: `[${targetName}]`, bold: true })] }));
      const actionRows = [
        new TableRow({ 
          children: [
            new TableCell({ children: [new Paragraph('질의문 코드')] }), 
            new TableCell({ children: [new Paragraph('질의문')] }), 
            new TableCell({ children: [new Paragraph('취약점')] }), 
            new TableCell({ children: [new Paragraph('개선 가이드')] }), 
            new TableCell({ children: [new Paragraph('조치 방안')] }), 
            new TableCell({ children: [new Paragraph('조치 기간')] }), 
            new TableCell({ children: [new Paragraph('부서')] }), 
            new TableCell({ children: [new Paragraph('담당자')] }), 
            new TableCell({ children: [new Paragraph('조치 일시')] })
          ] 
        }),
        ...actionsByTarget[targetName].map((act: any) => new TableRow({ 
          children: [
            new TableCell({ children: [new Paragraph(act.code)] }), 
            new TableCell({ children: [new Paragraph(act.question || '')] }), 
            new TableCell({ children: [new Paragraph(act.evidence || '')] }), 
            new TableCell({ children: [new Paragraph(act.guide || '')] }), 
            new TableCell({ children: [new Paragraph(act.actionPlan || '')] }), 
            new TableCell({ children: [new Paragraph(act.actionPeriod || '')] }), 
            new TableCell({ children: [new Paragraph(act.department || '')] }), 
            new TableCell({ children: [new Paragraph(act.manager || '')] }), 
            new TableCell({ children: [new Paragraph(act.actionDate || '')] })
          ] 
        }))
      ];
      sections.push(new DocxTable({ rows: actionRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
    });

    // 4. 평가결과
    sections.push(new Paragraph({ text: '4. 평가결과', heading: HeadingLevel.HEADING_2, spacing: { before: 400, after: 200 } }));
    const resultsByTarget: { [key: string]: { [field: string]: { 이행: number, 부분이행: number, 미이행: number, 해당없음: number } } } = {};
    securityData.forEach((item: any) => {
      if (!resultsByTarget[item.targetName]) resultsByTarget[item.targetName] = {};
      if (!resultsByTarget[item.targetName][item.field]) {
        resultsByTarget[item.targetName][item.field] = { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 };
      }
      if (item.status) {
        resultsByTarget[item.targetName][item.field][item.status]++;
      }
    });

    // Sort by targets order
    const sortedResultTargetNames = Object.keys(resultsByTarget).sort((a, b) => {
      const indexA = targetOrder.indexOf(a);
      const indexB = targetOrder.indexOf(b);
      return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
    });

    sortedResultTargetNames.forEach(targetName => {
      sections.push(new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: `[${targetName}]`, bold: true })]
      }));

      Object.keys(resultsByTarget[targetName]).forEach(field => {
        const counts = resultsByTarget[targetName][field];
        const total = counts.이행 + counts.부분이행 + counts.미이행;
        const rate = total > 0 ? ((counts.이행 + counts.부분이행 * 0.5) / total * 100).toFixed(1) : '0.0';
        
        sections.push(new Paragraph({
          text: `${field}: 이행 ${counts.이행}건, 부분이행 ${counts.부분이행}건, 미이행 ${counts.미이행}건, 해당없음 ${counts.해당없음}건 (이행률: ${rate}%)`
        }));
      });
    });

    const doc = new Document({ sections: [{ children: sections }] });
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '보안성검토_결과보고서.docx';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const securityData = getCompanyData(user?.company, 'securityData', []);
  const improvements = getCompanyData(user?.company, 'securityImprovements', {});
  const actionPlans = getCompanyData(user?.company, 'securityActionPlans', {});

  const criteriaByTarget: { [key: string]: { [subField: string]: string[] } } = {};
  securityData.forEach((item: any) => {
    if (item.status !== '해당없음') {
      if (!criteriaByTarget[item.targetName]) criteriaByTarget[item.targetName] = {};
      if (!criteriaByTarget[item.targetName][item.subField]) criteriaByTarget[item.targetName][item.subField] = [];
      criteriaByTarget[item.targetName][item.subField].push(item.no);
    }
  });

  const targets = getCompanyData(user?.company, 'securityTargets', []);
  const targetOrder = targets.map((t: any) => t.name);

  const riskItems = securityData.filter((item: any) => item.status === '부분이행' || item.status === '미이행')
    .map((item: any) => {
      const itemId = `${item.targetName}-${item.no}`;
      const saved = improvements[itemId];
      return { targetName: item.targetName, code: item.no, evidence: item.evidence || '', riskFactor: saved?.riskFactor || '' };
    });

  const actionsByTarget: { [key: string]: any[] } = {};
  securityData.forEach((item: any) => {
    if (item.status === '부분이행' || item.status === '미이행') {
      const itemId = `${item.targetName}-${item.no}`;
      const savedAction = actionPlans[itemId];
      const savedImprovement = improvements[itemId];
      if (savedAction || savedImprovement) {
        if (!actionsByTarget[item.targetName]) actionsByTarget[item.targetName] = [];
        actionsByTarget[item.targetName].push({ code: item.no, question: item.item, evidence: item.evidence, guide: savedImprovement?.improvementPlan || '', ...savedAction });
      }
    }
  });

  const resultsByTarget: { [key: string]: { [field: string]: { 이행: number, 부분이행: number, 미이행: number, 해당없음: number } } } = {};
  securityData.forEach((item: any) => {
    if (!resultsByTarget[item.targetName]) resultsByTarget[item.targetName] = {};
    if (!resultsByTarget[item.targetName][item.field]) {
      resultsByTarget[item.targetName][item.field] = { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 };
    }
    if (item.status) resultsByTarget[item.targetName][item.field][item.status]++;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">보안성 검토 결과보고서</h1>
          <p className="text-muted-foreground mt-2">보안성 검토 수행 과정의 전체 결과를 확인합니다</p>
        </div>
        <Button variant="secondary" onClick={handleDownload}><Download className="mr-2 h-4 w-4" />다운로드</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. 영향평가 기준</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(() => {
            const sortedTargetNames = Object.keys(criteriaByTarget).sort((a, b) => {
              const indexA = targetOrder.indexOf(a);
              const indexB = targetOrder.indexOf(b);
              return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            return sortedTargetNames.map((target) => (
              <div key={target}>
                <p className="font-semibold">[{target}]</p>
                <ul className="list-disc pl-6">
                  {Object.keys(criteriaByTarget[target]).map((sub) => (
                    <li key={sub}>{sub} ({criteriaByTarget[target][sub].join(', ')})</li>
                  ))}
                </ul>
              </div>
            ));
          })()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. 평가기준에 따른 개인정보 침해요인 분석·평가</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <UITableRow>
                  <TableHead>검토대상명</TableHead>
                  <TableHead>질의문 코드</TableHead>
                  <TableHead>취약점</TableHead>
                  <TableHead>침해요인</TableHead>
                </UITableRow>
              </TableHeader>
              <TableBody>
                {riskItems.map((r: any, i: number) => (
                  <UITableRow key={i}>
                    <UITableCell>{r.targetName}</UITableCell>
                    <UITableCell>{r.code}</UITableCell>
                    <UITableCell>{r.evidence}</UITableCell>
                    <UITableCell>{r.riskFactor}</UITableCell>
                  </UITableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. 주요 위험요소에 따른 개선 조치 계획</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(() => {
            const sortedActionTargetNames = Object.keys(actionsByTarget).sort((a, b) => {
              const indexA = targetOrder.indexOf(a);
              const indexB = targetOrder.indexOf(b);
              return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            return sortedActionTargetNames.map((target) => (
              <div key={target} className="space-y-2">
                <p className="font-semibold">[{target}]</p>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <UITableRow>
                        <TableHead>질의문 코드</TableHead>
                        <TableHead>질의문</TableHead>
                        <TableHead>취약점</TableHead>
                        <TableHead>개선 가이드</TableHead>
                        <TableHead>조치 방안</TableHead>
                        <TableHead>조치 기간</TableHead>
                        <TableHead>부서</TableHead>
                        <TableHead>담당자</TableHead>
                        <TableHead>조치 일시</TableHead>
                      </UITableRow>
                    </TableHeader>
                    <TableBody>
                      {actionsByTarget[target].map((act: any, i: number) => (
                        <UITableRow key={i}>
                          <UITableCell>{act.code}</UITableCell>
                          <UITableCell>{act.question}</UITableCell>
                          <UITableCell>{act.evidence}</UITableCell>
                          <UITableCell>{act.guide}</UITableCell>
                          <UITableCell>{act.actionPlan}</UITableCell>
                          <UITableCell>{act.actionPeriod}</UITableCell>
                          <UITableCell>{act.department}</UITableCell>
                          <UITableCell>{act.manager}</UITableCell>
                          <UITableCell>{act.actionDate}</UITableCell>
                        </UITableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ));
          })()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. 평가결과</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(() => {
            const sortedResultTargetNames = Object.keys(resultsByTarget).sort((a, b) => {
              const indexA = targetOrder.indexOf(a);
              const indexB = targetOrder.indexOf(b);
              return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            return sortedResultTargetNames.map((target) => (
              <div key={target} className="space-y-1">
                <p className="font-semibold">[{target}]</p>
                {Object.keys(resultsByTarget[target]).map((field) => {
                  const counts = resultsByTarget[target][field];
                  const total = counts.이행 + counts.부분이행 + counts.미이행;
                  const rate = total > 0 ? ((counts.이행 + counts.부분이행 * 0.5) / total * 100).toFixed(1) : '0.0';
                  return (
                    <p key={field} className="text-sm">
                      {field}: 이행 {counts.이행}건, 부분이행 {counts.부분이행}건, 미이행 {counts.미이행}건, 해당없음 {counts.해당없음}건 (이행률: {rate}%)
                    </p>
                  );
                })}
              </div>
            ));
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
