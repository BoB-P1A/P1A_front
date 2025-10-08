import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer } from 'lucide-react';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell, TableRow, TextRun, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { Table as UITable, TableBody as UITableBody, TableCell as UITableCell, TableHead as UITableHead, TableHeader as UITableHeader, TableRow as UITableRow } from '@/components/ui/table';
import { useState, useEffect } from 'react';

export default function ProtectionReport() {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.key === 'processingTasks' || 
          customEvent.detail?.key === 'flowTableData' ||
          customEvent.detail?.key === 'flowChartData' ||
          customEvent.detail?.key === 'lifecycleData' ||
          customEvent.detail?.key === 'protectionImprovements') {
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('storageUpdate', handleStorageUpdate);
    return () => window.removeEventListener('storageUpdate', handleStorageUpdate);
  }, []);
  const handleDownload = async () => {
    try {
      // Load data from localStorage
      const taskTableData = JSON.parse(localStorage.getItem('processingTasks') || '[]');
      const flowTableData = JSON.parse(localStorage.getItem('flowTableData') || '{}');
      const lifecycleData = JSON.parse(localStorage.getItem('lifecycleData') || '[]');
      const improvements = JSON.parse(localStorage.getItem('protectionImprovements') || '{}');

      const sections = [];

      // Title
      sections.push(
        new Paragraph({
          text: '개인정보 처리단계별 보호조치 결과보고서',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );

      // 1. 개인정보 처리 흐름분석
      sections.push(
        new Paragraph({
          text: '1. 개인정보 처리 흐름분석',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      // 처리업무표
      sections.push(
        new Paragraph({
          text: '1.1 개인정보 처리업무표',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        })
      );

      if (taskTableData.length > 0) {
        const taskTableRows = [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph('처리업무명')] }),
              new TableCell({ children: [new Paragraph('수집 항목')] }),
              new TableCell({ children: [new Paragraph('수집 방법')] }),
              new TableCell({ children: [new Paragraph('수집 근거')] }),
              new TableCell({ children: [new Paragraph('보유 기간')] }),
            ]
          }),
          ...taskTableData.map((task: any) => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(task.taskName || '')] }),
              new TableCell({ children: [new Paragraph(task.collectionItems || '')] }),
              new TableCell({ children: [new Paragraph(task.collectionMethod || '')] }),
              new TableCell({ children: [new Paragraph(task.collectionBasis || '')] }),
              new TableCell({ children: [new Paragraph(task.retentionPeriod || '')] }),
            ]
          }))
        ];
        sections.push(new DocxTable({ rows: taskTableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }

      // 개인정보 흐름표
      sections.push(
        new Paragraph({
          text: '1.2 개인정보 흐름표',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 400, after: 100 }
        })
      );

      const phases = ['수집', '보유이용', '제공', '파기'];
      phases.forEach(phase => {
        sections.push(
          new Paragraph({
            text: `${phase} 단계`,
            heading: HeadingLevel.HEADING_4,
            spacing: { before: 200, after: 100 }
          })
        );

        const phaseData: any[] = [];
        Object.keys(flowTableData).forEach(taskName => {
          const taskData = flowTableData[taskName];
          if (taskData && taskData[phase]) {
            taskData[phase].forEach((row: any) => {
              phaseData.push({ taskName, ...row });
            });
          }
        });

        if (phaseData.length > 0) {
          const headers = phase === '수집' 
            ? ['업무명', '수집항목', '수집방법', '수집근거']
            : phase === '보유이용'
            ? ['업무명', '개인정보파일명', '보유기간', '보유근거', '이용목적']
            : phase === '제공'
            ? ['업무명', '제공받는 자', '제공목적', '제공항목', '제공방법']
            : ['업무명', '파기항목', '파기방법', '파기주기'];

          const flowRows = [
            new TableRow({
              children: headers.map(h => new TableCell({ children: [new Paragraph(h)] }))
            }),
            ...phaseData.map(row => new TableRow({
              children: phase === '수집'
                ? [
                    new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                    new TableCell({ children: [new Paragraph(row.items || '')] }),
                    new TableCell({ children: [new Paragraph(row.method || '')] }),
                    new TableCell({ children: [new Paragraph(row.basis || '')] })
                  ]
                : phase === '보유이용'
                ? [
                    new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                    new TableCell({ children: [new Paragraph(row.fileName || '')] }),
                    new TableCell({ children: [new Paragraph(row.period || '')] }),
                    new TableCell({ children: [new Paragraph(row.basis || '')] }),
                    new TableCell({ children: [new Paragraph(row.purpose || '')] })
                  ]
                : phase === '제공'
                ? [
                    new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                    new TableCell({ children: [new Paragraph(row.recipient || '')] }),
                    new TableCell({ children: [new Paragraph(row.purpose || '')] }),
                    new TableCell({ children: [new Paragraph(row.items || '')] }),
                    new TableCell({ children: [new Paragraph(row.method || '')] })
                  ]
                : [
                    new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                    new TableCell({ children: [new Paragraph(row.items || '')] }),
                    new TableCell({ children: [new Paragraph(row.method || '')] }),
                    new TableCell({ children: [new Paragraph(row.cycle || '')] })
                  ]
            }))
          ];
          sections.push(new DocxTable({ rows: flowRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
        }
      });

      // 개인정보 흐름도
      sections.push(
        new Paragraph({
          text: '1.3 개인정보 흐름도',
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 400, after: 100 }
        })
      );
      sections.push(new Paragraph({ text: '각 처리업무별 개인정보 흐름도가 별도로 작성되었습니다.' }));

      // 2. 영향평가 기준
      sections.push(
        new Paragraph({
          text: '2. 영향평가 기준',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      const criteriaByTask: { [key: string]: { [subField: string]: string[] } } = {};
      lifecycleData.forEach((item: any) => {
        if (item.status !== '해당없음') {
          if (!criteriaByTask[item.taskName]) criteriaByTask[item.taskName] = {};
          if (!criteriaByTask[item.taskName][item.subField]) {
            criteriaByTask[item.taskName][item.subField] = [];
          }
          criteriaByTask[item.taskName][item.subField].push(item.no);
        }
      });

      Object.keys(criteriaByTask).forEach(taskName => {
        sections.push(new Paragraph({
          text: `[${taskName}]`,
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: `[${taskName}]`, bold: true })]
        }));
        Object.keys(criteriaByTask[taskName]).forEach(subField => {
          const nos = criteriaByTask[taskName][subField].join(', ');
          sections.push(new Paragraph({ text: `- ${subField} (${nos})` }));
        });
      });

      // 3. 평가기준에 따른 개인정보 침해요인 분석･평가
      sections.push(
        new Paragraph({
          text: '3. 평가기준에 따른 개인정보 침해요인 분석･평가',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      const riskItems: any[] = [];
      lifecycleData.forEach((item: any) => {
        if (item.status === '부분이행' || item.status === '미이행') {
          const itemId = `${item.taskName}-${item.no}`;
          const saved = improvements[itemId];
          riskItems.push({
            taskName: item.taskName,
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
              new TableCell({ children: [new Paragraph('처리업무명')] }),
              new TableCell({ children: [new Paragraph('질의문 코드')] }),
              new TableCell({ children: [new Paragraph('평가 근거 및 의견')] }),
              new TableCell({ children: [new Paragraph('침해요인')] }),
            ]
          }),
          ...riskItems.map(item => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(item.taskName)] }),
              new TableCell({ children: [new Paragraph(item.code)] }),
              new TableCell({ children: [new Paragraph(item.evidence)] }),
              new TableCell({ children: [new Paragraph(item.riskFactor)] }),
            ]
          }))
        ];
        sections.push(new DocxTable({ rows: riskRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
      }

      // 4. 주요 위험요소에 따른 개선 조치 방안
      sections.push(
        new Paragraph({
          text: '4. 주요 위험요소에 따른 개선 조치 방안',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      const improvementsByTask: { [key: string]: string[] } = {};
      lifecycleData.forEach((item: any) => {
        if (item.status === '부분이행' || item.status === '미이행') {
          const itemId = `${item.taskName}-${item.no}`;
          const saved = improvements[itemId];
          if (saved?.improvementPlan) {
            if (!improvementsByTask[item.taskName]) improvementsByTask[item.taskName] = [];
            improvementsByTask[item.taskName].push(`${item.no}: ${saved.improvementPlan}`);
          }
        }
      });

      Object.keys(improvementsByTask).forEach(taskName => {
        sections.push(new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: `[${taskName}]`, bold: true })]
        }));
        improvementsByTask[taskName].forEach(plan => {
          sections.push(new Paragraph({ text: `- ${plan}` }));
        });
      });

      // 5. 평가결과
      sections.push(
        new Paragraph({
          text: '5. 평가결과',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      const resultsByTask: { [key: string]: { [field: string]: { 이행: number, 부분이행: number, 미이행: number, 해당없음: number } } } = {};
      lifecycleData.forEach((item: any) => {
        if (!resultsByTask[item.taskName]) resultsByTask[item.taskName] = {};
        if (!resultsByTask[item.taskName][item.field]) {
          resultsByTask[item.taskName][item.field] = { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 };
        }
        if (item.status) {
          resultsByTask[item.taskName][item.field][item.status]++;
        }
      });

      Object.keys(resultsByTask).forEach(taskName => {
        sections.push(new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: `[${taskName}]`, bold: true })]
        }));

        Object.keys(resultsByTask[taskName]).forEach(field => {
          const counts = resultsByTask[taskName][field];
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
      link.download = '개인정보_처리단계별_보호조치_결과보고서.docx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('보고서 생성 중 오류가 발생했습니다.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const processingTasks = JSON.parse(localStorage.getItem('processingTasks') || '[]');
  const flowTableData = JSON.parse(localStorage.getItem('flowTableData') || '{}');
  const lifecycleData = JSON.parse(localStorage.getItem('lifecycleData') || '[]');
  const improvements = JSON.parse(localStorage.getItem('protectionImprovements') || '{}');
  const PHASES = ['수집','보유이용','제공','파기'] as const;

  const criteriaByTask: { [key: string]: { [subField: string]: string[] } } = {};
  lifecycleData.forEach((item: any) => {
    if (item.status !== '해당없음') {
      if (!criteriaByTask[item.taskName]) criteriaByTask[item.taskName] = {};
      if (!criteriaByTask[item.taskName][item.subField]) criteriaByTask[item.taskName][item.subField] = [];
      criteriaByTask[item.taskName][item.subField].push(item.no);
    }
  });

  const riskItems = lifecycleData
    .filter((item: any) => item.status === '부분이행' || item.status === '미이행')
    .map((item: any) => {
      const itemId = `${item.taskName}-${item.no}`;
      const saved = improvements[itemId];
      return {
        taskName: item.taskName,
        code: item.no,
        evidence: item.evidence || '',
        riskFactor: saved?.riskFactor || '',
      };
    });

  const improvementsByTask: { [key: string]: string[] } = {};
  lifecycleData.forEach((item: any) => {
    if (item.status === '부분이행' || item.status === '미이행') {
      const itemId = `${item.taskName}-${item.no}`;
      const saved = improvements[itemId];
      if (saved?.improvementPlan) {
        if (!improvementsByTask[item.taskName]) improvementsByTask[item.taskName] = [];
        improvementsByTask[item.taskName].push(`${item.no}: ${saved.improvementPlan}`);
      }
    }
  });

  const resultsByTask: { [key: string]: { [field: string]: { 이행: number, 부분이행: number, 미이행: number, 해당없음: number } } } = {};
  lifecycleData.forEach((item: any) => {
    if (!resultsByTask[item.taskName]) resultsByTask[item.taskName] = {};
    if (!resultsByTask[item.taskName][item.field]) {
      resultsByTask[item.taskName][item.field] = { 이행: 0, 부분이행: 0, 미이행: 0, 해당없음: 0 };
    }
    if (item.status) resultsByTask[item.taskName][item.field][item.status]++;
  });

  const flowByPhase: Record<string, any[]> = { 수집: [], 보유이용: [], 제공: [], 파기: [] };
  Object.keys(flowTableData).forEach((taskName) => {
    const task = flowTableData[taskName];
    if (!task) return;
    PHASES.forEach((p) => {
      const rows = task[p];
      if (rows && Array.isArray(rows)) {
        rows.forEach((row: any) => flowByPhase[p].push({ taskName, ...row }));
      }
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">개인정보 처리단계별 보호조치 결과보고서</h1>
          <p className="text-muted-foreground mt-2">
            개인정보 처리단계별 보호조치 수행 과정의 전체 결과를 확인합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            인쇄
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            다운로드
          </Button>
        </div>
      </div>


      {/* 1. 개인정보 처리 흐름분석 */}
      <Card>
        <CardHeader>
          <CardTitle>1. 개인정보 처리 흐름분석</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 1.1 처리업무표 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">1.1 개인정보 처리업무표</h3>
            <div className="overflow-x-auto">
              <UITable>
                <UITableHeader>
                  <UITableRow>
                    <UITableHead>평가업무명</UITableHead>
                    <UITableHead>처리 목적</UITableHead>
                    <UITableHead>처리 개인정보</UITableHead>
                    <UITableHead>주관부서</UITableHead>
                  </UITableRow>
                </UITableHeader>
                <UITableBody>
                  {processingTasks.map((t: any, idx: number) => (
                    <UITableRow key={idx}>
                      <UITableCell>{t.taskName}</UITableCell>
                      <UITableCell>{t.purpose}</UITableCell>
                      <UITableCell>{t.personalInfo}</UITableCell>
                      <UITableCell>{t.department}</UITableCell>
                    </UITableRow>
                  ))}
                </UITableBody>
              </UITable>
            </div>
          </div>

          {/* 1.2 흐름표 */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">1.2 개인정보 흐름표</h3>
            {PHASES.map((phase) => {
              const rows = flowByPhase[phase];
              if (!rows || rows.length === 0) return null;
              const headers = phase === '수집'
                ? ['업무명','수집항목','수집방법','수집근거']
                : phase === '보유이용'
                ? ['업무명','개인정보파일명','보유기간','보유근거','이용목적']
                : phase === '제공'
                ? ['업무명','제공받는 자','제공목적','제공항목','제공방법']
                : ['업무명','파기항목','파기방법','파기주기'];
              return (
                <div key={phase} className="space-y-2">
                  <h4 className="font-medium">{phase} 단계</h4>
                  <div className="overflow-x-auto">
                    <UITable>
                      <UITableHeader>
                        <UITableRow>
                          {headers.map((h) => <UITableHead key={h}>{h}</UITableHead>)}
                        </UITableRow>
                      </UITableHeader>
                      <UITableBody>
                        {rows.map((row: any, i: number) => (
                          <UITableRow key={i}>
                            {phase === '수집' && (
                              <>
                                <UITableCell>{row.taskName}</UITableCell>
                                <UITableCell>{row.items}</UITableCell>
                                <UITableCell>{row.method}</UITableCell>
                                <UITableCell>{row.basis}</UITableCell>
                              </>
                            )}
                            {phase === '보유이용' && (
                              <>
                                <UITableCell>{row.taskName}</UITableCell>
                                <UITableCell>{row.fileName}</UITableCell>
                                <UITableCell>{row.period}</UITableCell>
                                <UITableCell>{row.basis}</UITableCell>
                                <UITableCell>{row.purpose}</UITableCell>
                              </>
                            )}
                            {phase === '제공' && (
                              <>
                                <UITableCell>{row.taskName}</UITableCell>
                                <UITableCell>{row.recipient}</UITableCell>
                                <UITableCell>{row.purpose}</UITableCell>
                                <UITableCell>{row.items}</UITableCell>
                                <UITableCell>{row.method}</UITableCell>
                              </>
                            )}
                            {phase === '파기' && (
                              <>
                                <UITableCell>{row.taskName}</UITableCell>
                                <UITableCell>{row.items}</UITableCell>
                                <UITableCell>{row.method}</UITableCell>
                                <UITableCell>{row.cycle}</UITableCell>
                              </>
                            )}
                          </UITableRow>
                        ))}
                      </UITableBody>
                    </UITable>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 1.3 흐름도 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1.3 개인정보 흐름도</h3>
            {(() => {
              const flowChartImages = JSON.parse(localStorage.getItem('flowChartImages') || '{}');
              const taskNames = processingTasks.map((t: any) => t.taskName).filter((name: string) => name.trim() !== '');
              
              if (Object.keys(flowChartImages).length === 0) {
                return <p className="text-sm text-muted-foreground">각 처리업무별 흐름도는 "개인정보 흐름도" 페이지에서 "이미지 저장" 버튼을 클릭하여 저장하세요.</p>;
              }
              
              return (
                <div className="space-y-6">
                  {taskNames.map((taskName: string) => {
                    const imageData = flowChartImages[taskName];
                    if (!imageData) return null;
                    
                    return (
                      <div key={taskName} className="space-y-2">
                        <h4 className="font-semibold">[{taskName}]</h4>
                        <img 
                          src={imageData} 
                          alt={`${taskName} 흐름도`}
                          className="w-full border rounded-lg bg-white p-4"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* 2. 영향평가 기준 */}
      <Card>
        <CardHeader>
          <CardTitle>2. 영향평가 기준</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.keys(criteriaByTask).map((task) => (
            <div key={task}>
              <p className="font-semibold">[{task}]</p>
              <ul className="list-disc pl-6">
                {Object.keys(criteriaByTask[task]).map((sub) => (
                  <li key={sub}>
                    {sub} ({criteriaByTask[task][sub].join(', ')})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 3. 침해요인 분석 표 */}
      <Card>
        <CardHeader>
          <CardTitle>3. 평가기준에 따른 개인정보 침해요인 분석·평가</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <UITable>
              <UITableHeader>
                <UITableRow>
                  <UITableHead>개인정보 처리업무명</UITableHead>
                  <UITableHead>질의문 코드</UITableHead>
                  <UITableHead>평가 근거 및 의견</UITableHead>
                  <UITableHead>침해요인</UITableHead>
                </UITableRow>
              </UITableHeader>
              <UITableBody>
                {riskItems.map((r: any, i: number) => (
                  <UITableRow key={i}>
                    <UITableCell>{r.taskName}</UITableCell>
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

      {/* 4. 개선 조치 방안 */}
      <Card>
        <CardHeader>
          <CardTitle>4. 주요 위험요소에 따른 개선 조치 방안</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.keys(improvementsByTask).map((task) => (
            <div key={task}>
              <p className="font-semibold">[{task}]</p>
              <ul className="list-disc pl-6">
                {improvementsByTask[task].map((plan, idx) => (
                  <li key={idx}>- {plan}</li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 5. 평가결과 */}
      <Card>
        <CardHeader>
          <CardTitle>5. 평가결과</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.keys(resultsByTask).map((task) => (
            <div key={task} className="space-y-1">
              <p className="font-semibold">[{task}]</p>
              <ul className="list-disc pl-6">
                {Object.keys(resultsByTask[task]).map((field) => {
                  const c = resultsByTask[task][field];
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
