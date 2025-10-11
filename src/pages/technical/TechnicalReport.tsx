import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell, TableRow, TextRun, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { Table as UITable, TableBody as UITableBody, TableCell as UITableCell, TableHead as UITableHead, TableHeader as UITableHeader, TableRow as UITableRow } from '@/components/ui/table';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanyData, getCompanyStorageKey } from '@/lib/utils';

export default function TechnicalReport() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const dataKey = getCompanyStorageKey(user?.company, 'technicalData');
      const improvementsKey = getCompanyStorageKey(user?.company, 'technicalImprovements');
      const systemsKey = getCompanyStorageKey(user?.company, 'technicalSystems');
      
      if (customEvent.detail?.key === dataKey || 
          customEvent.detail?.key === improvementsKey ||
          customEvent.detail?.key === systemsKey) {
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('storageUpdate', handleStorageUpdate);
    return () => window.removeEventListener('storageUpdate', handleStorageUpdate);
  }, [user?.company]);
  
  const handleDownload = async () => {
    try {
      // Load data from company storage
      const technicalData = getCompanyData(user?.company, 'technicalData', []);
      const improvements = getCompanyData(user?.company, 'technicalImprovements', {});

      const sections = [];

      // Title
      sections.push(
        new Paragraph({
          text: '기술적 보호조치 결과보고서',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );

      // 1. 영향평가 기준
      sections.push(
        new Paragraph({
          text: '1. 영향평가 기준',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      const criteriaBySystem: { [key: string]: { [subField: string]: string[] } } = {};
      technicalData.forEach((item: any) => {
        if (item.status !== '해당없음') {
          if (!criteriaBySystem[item.systemName]) criteriaBySystem[item.systemName] = {};
          if (!criteriaBySystem[item.systemName][item.subField]) {
            criteriaBySystem[item.systemName][item.subField] = [];
          }
          criteriaBySystem[item.systemName][item.subField].push(item.no);
        }
      });

      Object.keys(criteriaBySystem).forEach(systemName => {
        sections.push(new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: `[${systemName}]`, bold: true })]
        }));
        Object.keys(criteriaBySystem[systemName]).forEach(subField => {
          const nos = criteriaBySystem[systemName][subField].join(', ');
          sections.push(new Paragraph({ text: `- ${subField} (${nos})` }));
        });
      });

      // 2. 평가기준에 따른 개인정보 침해요인 분석･평가
      sections.push(
        new Paragraph({
          text: '2. 평가기준에 따른 개인정보 침해요인 분석･평가',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      const riskItems: any[] = [];
      technicalData.forEach((item: any) => {
        if (item.status === '부분이행' || item.status === '미이행') {
          const itemId = `${item.systemName}-${item.no}`;
          const saved = improvements[itemId];
          riskItems.push({
            systemName: item.systemName,
            code: item.no,
            evidence: item.evidence || '',
            riskFactor: saved?.riskFactor || ''
          });
        }
      });

      if (riskItems.length > 0) {
        const riskRows = [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('시스템명')] }),
              new TableCell({ children: [new Paragraph('질의문 코드')] }),
              new TableCell({ children: [new Paragraph('평가 근거 및 의견')] }),
              new TableCell({ children: [new Paragraph('침해요인')] }),
            ]
          }),
          ...riskItems.map(item => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(item.systemName)] }),
              new TableCell({ children: [new Paragraph(item.code)] }),
              new TableCell({ children: [new Paragraph(item.evidence)] }),
              new TableCell({ children: [new Paragraph(item.riskFactor)] }),
            ]
          }))
        ];
        sections.push(new DocxTable({ rows: riskRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }

      // 3. 주요 위험요소에 따른 개선 조치 계획
      sections.push(
        new Paragraph({
          text: '3. 주요 위험요소에 따른 개선 조치 계획',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      const actionPlans = getCompanyData(user?.company, 'technicalActionPlans', {});
      const actionPlansBySystem: { [key: string]: any[] } = {};
      
      Object.keys(actionPlans).forEach(id => {
        const plan = actionPlans[id];
        if (plan && plan.systemName) {
          if (!actionPlansBySystem[plan.systemName]) actionPlansBySystem[plan.systemName] = [];
          actionPlansBySystem[plan.systemName].push(plan);
        }
      });

      Object.keys(actionPlansBySystem).forEach(systemName => {
        sections.push(new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: `[${systemName}]`, bold: true })]
        }));

        const planRows = [
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
              new TableCell({ children: [new Paragraph('조치 일시')] }),
            ]
          }),
          ...actionPlansBySystem[systemName].map(plan => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(plan.code || '')] }),
              new TableCell({ children: [new Paragraph(plan.question || '')] }),
              new TableCell({ children: [new Paragraph(plan.evidence || '')] }),
              new TableCell({ children: [new Paragraph(plan.improvementGuide || '')] }),
              new TableCell({ children: [new Paragraph(plan.actionPlan || '')] }),
              new TableCell({ children: [new Paragraph(plan.actionPeriod || '')] }),
              new TableCell({ children: [new Paragraph(plan.department || '')] }),
              new TableCell({ children: [new Paragraph(plan.manager || '')] }),
              new TableCell({ children: [new Paragraph(plan.actionDate || '')] }),
            ]
          }))
        ];
        sections.push(new DocxTable({ rows: planRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      });

      // 4. 평가결과
      sections.push(
        new Paragraph({
          text: '4. 평가결과',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      const resultsBySystem: { [key: string]: { [field: string]: { 이행: number, 부분이행: number, 미이행: number, 해당없음: number } } } = {};
      technicalData.forEach((item: any) => {
        if (!resultsBySystem[item.systemName]) resultsBySystem[item.systemName] = {};
        if (!resultsBySystem[item.systemName][item.field]) {
          resultsBySystem[item.systemName][item.field] = { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 };
        }
        if (item.status) {
          resultsBySystem[item.systemName][item.field][item.status]++;
        }
      });

      Object.keys(resultsBySystem).forEach(systemName => {
        sections.push(new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: `[${systemName}]`, bold: true })]
        }));

        Object.keys(resultsBySystem[systemName]).forEach(field => {
          const counts = resultsBySystem[systemName][field];
          const total = counts.이행 + counts.부분이행 + counts.미이행;
          const rate = total > 0 ? ((counts.이행 + counts.부분이행 * 0.5) / total * 100).toFixed(1) : '0.0';
          
          sections.push(new Paragraph({
            text: `${field}: 이행 ${counts.이행}건, 부분이행 ${counts.부분이행}건, 미이행 ${counts.미이행}건, 해당없음 ${counts.해당없음}건 (이행률: ${rate}%)`
          }));
        });
      });

      // Create document
      const doc = new Document({
        sections: [{
          children: sections
        }]
      });

      // Generate and download
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '기술적_보호조치_결과보고서.docx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('보고서 생성 중 오류가 발생했습니다.');
    }
  };


  const technicalData = getCompanyData(user?.company, 'technicalData', []);
  const improvements = getCompanyData(user?.company, 'technicalImprovements', {});

  const criteriaBySystem: { [key: string]: { [subField: string]: string[] } } = {};
  technicalData.forEach((item: any) => {
    if (item.status !== '해당없음') {
      if (!criteriaBySystem[item.systemName]) criteriaBySystem[item.systemName] = {};
      if (!criteriaBySystem[item.systemName][item.subField]) {
        criteriaBySystem[item.systemName][item.subField] = [];
      }
      criteriaBySystem[item.systemName][item.subField].push(item.no);
    }
  });

  const riskItems = technicalData
    .filter((item: any) => item.status === '부분이행' || item.status === '미이행')
    .map((item: any) => {
      const itemId = `${item.systemName}-${item.no}`;
      const saved = improvements[itemId];
      return {
        systemName: item.systemName,
        code: item.no,
        evidence: item.evidence || '',
        riskFactor: saved?.riskFactor || '',
      };
    });

  const improvementsBySystem: { [key: string]: string[] } = {};
  technicalData.forEach((item: any) => {
    if (item.status === '부분이행' || item.status === '미이행') {
      const itemId = `${item.systemName}-${item.no}`;
      const saved = improvements[itemId];
      if (saved?.improvementPlan) {
        if (!improvementsBySystem[item.systemName]) improvementsBySystem[item.systemName] = [];
        improvementsBySystem[item.systemName].push(`${item.no}: ${saved.improvementPlan}`);
      }
    }
  });

  const resultsBySystem: { [key: string]: { [field: string]: { 이행: number, 부분이행: number, 미이행: number, 해당없음: number } } } = {};
  technicalData.forEach((item: any) => {
    if (!resultsBySystem[item.systemName]) resultsBySystem[item.systemName] = {};
    if (!resultsBySystem[item.systemName][item.field]) {
      resultsBySystem[item.systemName][item.field] = { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 };
    }
    if (item.status) resultsBySystem[item.systemName][item.field][item.status]++;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">기술적 보호조치 결과보고서</h1>
          <p className="text-muted-foreground mt-2">
            기술적 보호조치 수행 과정의 전체 결과를 확인합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            다운로드
          </Button>
        </div>
      </div>


      {/* 1. 영향평가 기준 */}
      <Card>
        <CardHeader>
          <CardTitle>1. 영향평가 기준</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.keys(criteriaBySystem).map((sys) => (
            <div key={sys}>
              <p className="font-semibold">[{sys}]</p>
              <ul className="list-disc pl-6">
                {Object.keys(criteriaBySystem[sys]).map((sub) => (
                  <li key={sub}>
                    {sub} ({criteriaBySystem[sys][sub].join(', ')})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 2. 침해요인 분석 표 */}
      <Card>
        <CardHeader>
          <CardTitle>2. 평가기준에 따른 개인정보 침해요인 분석·평가</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <UITable>
              <UITableHeader>
                <UITableRow>
                  <UITableHead>시스템명</UITableHead>
                  <UITableHead>질의문 코드</UITableHead>
                  <UITableHead>평가 근거 및 의견</UITableHead>
                  <UITableHead>침해요인</UITableHead>
                </UITableRow>
              </UITableHeader>
              <UITableBody>
                {riskItems.map((r: any, i: number) => (
                  <UITableRow key={i}>
                    <UITableCell>{r.systemName}</UITableCell>
                    <UITableCell>{r.code}</UITableCell>
                    <UITableCell>{r.evidence}</UITableCell>
                    <UITableCell>{r.riskFactor}</UITableCell>
                  </UITableRow>
                ))}
              </UITableBody>
            </UITable>
          </div>
        </CardContent>
      </Card>

      {/* 3. 개선 조치 계획 */}
      <Card>
        <CardHeader>
          <CardTitle>3. 주요 위험요소에 따른 개선 조치 계획</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(() => {
            const actionPlans = getCompanyData(user?.company, 'technicalActionPlans', {});
            const actionPlansBySystem: { [key: string]: any[] } = {};
            
            Object.keys(actionPlans).forEach(id => {
              const plan = actionPlans[id];
              if (plan && plan.systemName) {
                if (!actionPlansBySystem[plan.systemName]) actionPlansBySystem[plan.systemName] = [];
                actionPlansBySystem[plan.systemName].push(plan);
              }
            });

            return Object.keys(actionPlansBySystem).map((sys) => (
              <div key={sys} className="space-y-2">
                <p className="font-semibold">[{sys}]</p>
                <div className="overflow-x-auto">
                  <UITable>
                    <UITableHeader>
                      <UITableRow>
                        <UITableHead>질의문 코드</UITableHead>
                        <UITableHead>질의문</UITableHead>
                        <UITableHead>취약점</UITableHead>
                        <UITableHead>개선 가이드</UITableHead>
                        <UITableHead>조치 방안</UITableHead>
                        <UITableHead>조치 기간</UITableHead>
                        <UITableHead>부서</UITableHead>
                        <UITableHead>담당자</UITableHead>
                        <UITableHead>조치 일시</UITableHead>
                      </UITableRow>
                    </UITableHeader>
                    <UITableBody>
                      {actionPlansBySystem[sys].map((plan, idx) => (
                        <UITableRow key={idx}>
                          <UITableCell>{plan.code}</UITableCell>
                          <UITableCell>{plan.question}</UITableCell>
                          <UITableCell>{plan.evidence}</UITableCell>
                          <UITableCell>{plan.improvementGuide}</UITableCell>
                          <UITableCell>{plan.actionPlan}</UITableCell>
                          <UITableCell>{plan.actionPeriod}</UITableCell>
                          <UITableCell>{plan.department}</UITableCell>
                          <UITableCell>{plan.manager}</UITableCell>
                          <UITableCell>{plan.actionDate}</UITableCell>
                        </UITableRow>
                      ))}
                    </UITableBody>
                  </UITable>
                </div>
              </div>
            ));
          })()}
        </CardContent>
      </Card>

      {/* 4. 평가결과 */}
      <Card>
        <CardHeader>
          <CardTitle>4. 평가결과</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.keys(resultsBySystem).map((sys) => (
            <div key={sys} className="space-y-1">
              <p className="font-semibold">[{sys}]</p>
              <ul className="list-disc pl-6">
                {Object.keys(resultsBySystem[sys]).map((field) => {
                  const c = resultsBySystem[sys][field];
                  const total = c.이행 + c.부분이행 + c.미이행;
                  const rate = total > 0 ? (((c.이행 + c.부분이행 * 0.5) / total) * 100).toFixed(1) : '0.0';
                  return (
                    <li key={field}>{field}: 이행 {c.이행}건, 부분이행 {c.부분이행}건, 미이행 {c.미이행}건, 해당없음 {c.해당없음}건 (이행률: {rate}%)</li>
                  );
                })}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}