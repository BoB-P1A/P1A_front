import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell, TableRow, TextRun, WidthType, AlignmentType, HeadingLevel, ImageRun } from 'docx';
import { Table as UITable, TableBody as UITableBody, TableCell as UITableCell, TableHead as UITableHead, TableHeader as UITableHeader, TableRow as UITableRow } from '@/components/ui/table';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function ProtectionReport() {
  const { user } = useAuth();
  const [taskTableData, setTaskTableData] = useState<any[]>([]);
  const [flowTableData, setFlowTableData] = useState<any>({});
  const [lifecycleData, setLifecycleData] = useState<any[]>([]);
  const [improvements, setImprovements] = useState<any>({});
  const [flowChartImages, setFlowChartImages] = useState<any>({});

  useEffect(() => {
    const loadData = async () => {
      if (!user?.company) return;
      
      try {
        const [tasks, flowTables, lifecycle, improvementsData, flowCharts] = await Promise.all([
          api.lifecycle.tasks.getAll(user.company),
          api.lifecycle.flowTables.getAll(user.company),
          api.lifecycle.lifecycle.getAll(user.company),
          api.lifecycle.improvements.getAll(user.company),
          api.lifecycle.flowCharts.getAll(user.company),
        ]);
        
        setTaskTableData(tasks);
        setFlowTableData(flowTables);
        setLifecycleData(lifecycle);
        setImprovements(improvementsData);
        setFlowChartImages(flowCharts);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [user?.company]);

  const handleDownload = async () => {
    try {

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
              new TableCell({ children: [new Paragraph('평가업무명')] }),
              new TableCell({ children: [new Paragraph('처리 목적')] }),
              new TableCell({ children: [new Paragraph('처리 개인정보')] }),
              new TableCell({ children: [new Paragraph('주관부서')] }),
            ]
          }),
          ...taskTableData.map((task: any) => new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(task.taskName || '')] }),
              new TableCell({ children: [new Paragraph(task.purpose || '')] }),
              new TableCell({ children: [new Paragraph(task.personalInfo || '')] }),
              new TableCell({ children: [new Paragraph(task.department || '')] }),
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

      const phases = ['수집', '보유', '이용', '제공', '파기'];
      const phaseKeyMap: Record<string, string> = { 수집: 'collection', 보유: 'storage', 이용: 'usage', 제공: 'provision', 파기: 'disposal' };
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
          const key = phaseKeyMap[phase];
          const rows = taskData?.[key] || [];
          rows.forEach((row: any) => phaseData.push({ taskName, ...row }));
        });

        if (phaseData.length > 0) {
          const headers =
            phase === '수집'
              ? ['업무명', '세부업무명', '수집대상', '수집경로', '수집시스템', '수집항목', '수집항목명칭', '수집주기', '수집담당자', '수집근거', '온라인여부', '암호화여부']
              : phase === '보유'
              ? ['업무명', '세부업무명', '입력시스템', '보유공간', '보유항목', '보유항목명칭', '암호화항목', '온라인여부', '암호화여부']
              : phase === '이용'
              ? ['업무명', '세부업무명', '보유공간', '이용시스템', '이용항목', '이용항목명칭', '이용목적', '이용방법', '개인정보취급자', '온라인여부', '암호화여부']
              : phase === '제공'
              ? ['업무명', '세부업무명', '보유공간', '제공시스템', '제공자', '수신자', '제공항목', '제공항목명칭', '제공목적', '제공방법', '제공주기', '암호화방법', '제공근거', '제공시스템온라인', '제공시스템암호화', '수신자온라인', '수신자암호화']
              : ['업무명', '세부업무명', '보유공간', '파기시스템', '파기항목', '파기항목명칭', '보관기간', '파기담당자', '파기절차', '분리보관공간', '분리보관암호화항목', '파기온라인', '분리보관', '분리보관온라인', '분리보관암호화'];

          const flowRows = [
            new TableRow({
              children: headers.map(h => new TableCell({ children: [new Paragraph(h)] }))
            }),
            ...phaseData.map(row => new TableRow({
              children:
                phase === '수집'
                  ? [
                      new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                      new TableCell({ children: [new Paragraph(row.detailTask || '')] }),
                      new TableCell({ children: [new Paragraph(row.collectionTarget || '')] }),
                      new TableCell({ children: [new Paragraph(row.collectionPath || '')] }),
                      new TableCell({ children: [new Paragraph(row.collectionSystem || '')] }),
                      new TableCell({ children: [new Paragraph(row.collectionItem || '')] }),
                      new TableCell({ children: [new Paragraph(row.collectionItemName || '')] }),
                      new TableCell({ children: [new Paragraph(row.collectionPeriod || '')] }),
                      new TableCell({ children: [new Paragraph(row.collectionManager || '')] }),
                      new TableCell({ children: [new Paragraph(row.collectionBasis || '')] }),
                      new TableCell({ children: [new Paragraph(row.isOnline || '')] }),
                      new TableCell({ children: [new Paragraph(row.isEncrypted || '')] }),
                    ]
                  : phase === '보유'
                  ? [
                      new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                      new TableCell({ children: [new Paragraph(row.detailTask || '')] }),
                      new TableCell({ children: [new Paragraph(row.inputSystem || '')] }),
                      new TableCell({ children: [new Paragraph(row.storageSpace || '')] }),
                      new TableCell({ children: [new Paragraph(row.storageItem || '')] }),
                      new TableCell({ children: [new Paragraph(row.storageItemName || '')] }),
                      new TableCell({ children: [new Paragraph(row.encryptionItem || '')] }),
                      new TableCell({ children: [new Paragraph(row.isOnline || '')] }),
                      new TableCell({ children: [new Paragraph(row.isEncrypted || '')] }),
                    ]
                  : phase === '이용'
                  ? [
                      new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                      new TableCell({ children: [new Paragraph(row.detailTask || '')] }),
                      new TableCell({ children: [new Paragraph(row.storageSpace || '')] }),
                      new TableCell({ children: [new Paragraph(row.usageSystem || '')] }),
                      new TableCell({ children: [new Paragraph(row.usageItem || '')] }),
                      new TableCell({ children: [new Paragraph(row.usageItemName || '')] }),
                      new TableCell({ children: [new Paragraph(row.usagePurpose || '')] }),
                      new TableCell({ children: [new Paragraph(row.usageMethod || '')] }),
                      new TableCell({ children: [new Paragraph(row.personalInfoHandler || '')] }),
                      new TableCell({ children: [new Paragraph(row.isOnline || '')] }),
                      new TableCell({ children: [new Paragraph(row.isEncrypted || '')] }),
                    ]
                  : phase === '제공'
                  ? [
                      new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                      new TableCell({ children: [new Paragraph(row.detailTask || '')] }),
                      new TableCell({ children: [new Paragraph(row.storageSpace || '')] }),
                      new TableCell({ children: [new Paragraph(row.provisionSystem || '')] }),
                      new TableCell({ children: [new Paragraph(row.provider || '')] }),
                      new TableCell({ children: [new Paragraph(row.recipient || '')] }),
                      new TableCell({ children: [new Paragraph(row.provisionItem || '')] }),
                      new TableCell({ children: [new Paragraph(row.provisionItemName || '')] }),
                      new TableCell({ children: [new Paragraph(row.provisionPurpose || '')] }),
                      new TableCell({ children: [new Paragraph(row.provisionMethod || '')] }),
                      new TableCell({ children: [new Paragraph(row.provisionPeriod || '')] }),
                      new TableCell({ children: [new Paragraph(row.encryptionMethod || '')] }),
                      new TableCell({ children: [new Paragraph(row.provisionBasis || '')] }),
                      new TableCell({ children: [new Paragraph(row.provisionSystemOnline || '')] }),
                      new TableCell({ children: [new Paragraph(row.provisionSystemEncrypted || '')] }),
                      new TableCell({ children: [new Paragraph(row.recipientOnline || '')] }),
                      new TableCell({ children: [new Paragraph(row.recipientEncrypted || '')] }),
                    ]
                  : [
                      new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                      new TableCell({ children: [new Paragraph(row.detailTask || '')] }),
                      new TableCell({ children: [new Paragraph(row.storageSpace || '')] }),
                      new TableCell({ children: [new Paragraph(row.disposalSystem || '')] }),
                      new TableCell({ children: [new Paragraph(row.disposalItem || '')] }),
                      new TableCell({ children: [new Paragraph(row.disposalItemName || '')] }),
                      new TableCell({ children: [new Paragraph(row.retentionPeriod || '')] }),
                      new TableCell({ children: [new Paragraph(row.disposalManager || '')] }),
                      new TableCell({ children: [new Paragraph(row.disposalProcedure || '')] }),
                      new TableCell({ children: [new Paragraph(row.separateStorageSpace || '')] }),
                      new TableCell({ children: [new Paragraph(row.separateStorageEncryptionItem || '')] }),
                      new TableCell({ children: [new Paragraph(row.disposalOnline || '')] }),
                      new TableCell({ children: [new Paragraph(row.hasSeparateStorage || '')] }),
                      new TableCell({ children: [new Paragraph(row.separateStorageOnline || '')] }),
                      new TableCell({ children: [new Paragraph(row.separateStorageEncrypted || '')] }),
                    ],
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

      const taskNames = Object.keys(flowChartImages);
      
      if (taskNames.length > 0) {
        for (const taskName of taskNames) {
          sections.push(
            new Paragraph({
              text: `${taskName} 흐름도`,
              heading: HeadingLevel.HEADING_4,
              spacing: { before: 200, after: 100 }
            })
          );
          
          const imageData = flowChartImages[taskName];
          if (imageData) {
            try {
              // Convert base64 to buffer for docx
              const base64Data = imageData.split(',')[1];
              const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
              
              sections.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: imageBuffer,
                      transformation: {
                        width: 600,
                        height: 385,
                      },
                      type: 'png',
                    } as any)
                  ],
                  spacing: { after: 200 }
                })
              );
            } catch (error) {
              console.error('Error adding image to document:', error);
              sections.push(new Paragraph({ text: '(이미지 삽입 오류)' }));
            }
          }
        }
      } else {
        sections.push(new Paragraph({ text: '저장된 흐름도 이미지가 없습니다.' }));
      }

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

      // Sort by taskTableData order
      const taskOrder = taskTableData.map((t: any) => t.taskName);
      const sortedTaskNames = Object.keys(criteriaByTask).sort((a, b) => {
        const indexA = taskOrder.indexOf(a);
        const indexB = taskOrder.indexOf(b);
        return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
      });

      sortedTaskNames.forEach(taskName => {
        sections.push(new Paragraph({
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
              new TableCell({ children: [new Paragraph('취약점')] }),
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

      // 4. 주요 위험요소에 따른 개선 조치 계획
      sections.push(
        new Paragraph({
          text: '4. 주요 위험요소에 따른 개선 조치 계획',
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      const actionPlansData = await api.lifecycle.actionPlans.getAll(user.company);
      const actionPlansByTask: { [key: string]: any[] } = {};
      
      Object.keys(actionPlansData).forEach(id => {
        const plan = actionPlansData[id];
        if (plan && plan.taskName) {
          if (!actionPlansByTask[plan.taskName]) actionPlansByTask[plan.taskName] = [];
          actionPlansByTask[plan.taskName].push(plan);
        }
      });

      // Sort by taskTableData order
      const taskOrderForAction = taskTableData.map((t: any) => t.taskName);
      const sortedActionTaskNames = Object.keys(actionPlansByTask).sort((a, b) => {
        const indexA = taskOrderForAction.indexOf(a);
        const indexB = taskOrderForAction.indexOf(b);
        return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
      });

      sortedActionTaskNames.forEach(taskName => {
        sections.push(new Paragraph({
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: `[${taskName}]`, bold: true })]
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
          ...actionPlansByTask[taskName].map(plan => new TableRow({
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

      // Sort by taskTableData order
      const taskOrderForResults = taskTableData.map((t: any) => t.taskName);
      const sortedResultTaskNames = Object.keys(resultsByTask).sort((a, b) => {
        const indexA = taskOrderForResults.indexOf(a);
        const indexB = taskOrderForResults.indexOf(b);
        return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
      });

      sortedResultTaskNames.forEach(taskName => {
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


  const processingTasks = taskTableData;
  const PHASES = ['수집','보유','이용','제공','파기'] as const;

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

  const flowByPhase: Record<string, any[]> = { 수집: [], 보유: [], 이용: [], 제공: [], 파기: [] };
  Object.keys(flowTableData).forEach((taskName) => {
    const task = flowTableData[taskName];
    if (!task) return;
    (task.collection || []).forEach((row: any) => flowByPhase['수집'].push({ taskName, ...row }));
    (task.storage || []).forEach((row: any) => flowByPhase['보유'].push({ taskName, ...row }));
    (task.usage || []).forEach((row: any) => flowByPhase['이용'].push({ taskName, ...row }));
    (task.provision || []).forEach((row: any) => flowByPhase['제공'].push({ taskName, ...row }));
    (task.disposal || []).forEach((row: any) => flowByPhase['파기'].push({ taskName, ...row }));
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
          <Button variant="secondary" onClick={handleDownload}>
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
              
              const renderHeader = (text: string) => {
                // 보유, 이용 단계는 줄바꿈 없음
                if (phase === '보유' || phase === '이용') {
                  return text;
                }
                
                const breaks: Record<string, string[]> = {
                  '세부업무명': ['세부', '업무명'],
                  '수집대상': ['수집', '대상'],
                  '수집시스템': ['수집', '시스템'],
                  '수집주기': ['수집', '주기'],
                  '수집담당자': ['수집', '담당자'],
                  '온라인여부': ['온라인', '여부'],
                  '암호화여부': ['암호화', '여부'],
                  '보유공간': ['보유', '공간'],
                  '개인정보취급자': ['개인정보', '취급자'],
                  '제공시스템': ['제공', '시스템'],
                  '암호화방법': ['암호화', '방법'],
                  '제공시스템온라인': ['제공시스템', '온라인'],
                  '제공시스템암호화': ['제공시스템', '암호화'],
                  '수신자온라인': ['수신자', '온라인'],
                  '수신자암호화': ['수신자', '암호화'],
                  '파기시스템': ['파기', '시스템'],
                  '파기주기': ['파기', '주기'],
                  '파기항목': ['파기', '항목'],
                  '파기담당자': ['파기', '담당자'],
                  '분리보관공간': ['분리', '보관', '공간'],
                  '파기온라인': ['파기', '온라인'],
                  '분리보관여부': ['분리', '보관', '여부'],
                  '분리보관온라인': ['분리', '보관', '온라인'],
                  '분리보관암호화': ['분리', '보관', '암호화'],
                };
                
                const parts = breaks[text];
                if (parts) {
                  return parts.map((part, i) => (
                    <span key={i}>
                      {i > 0 && <br />}
                      {part}
                    </span>
                  ));
                }
                return text;
              };
              
              const headers =
                phase === '수집'
                  ? ['업무명','세부업무명','수집대상','수집경로','수집시스템','수집항목','수집항목명칭','수집주기','수집담당자','수집근거','온라인여부','암호화여부']
                  : phase === '보유'
                  ? ['업무명','세부업무명','입력시스템','보유공간','보유항목','보유항목명칭','암호화항목','온라인여부','암호화여부']
                  : phase === '이용'
                  ? ['업무명','세부업무명','보유공간','이용시스템','이용항목','이용항목명칭','이용목적','이용방법','개인정보취급자','온라인여부','암호화여부']
                  : phase === '제공'
                  ? ['업무명','세부업무명','보유공간','제공시스템','제공자','수신자','제공항목','제공항목명칭','제공목적','제공방법','제공주기','암호화방법','제공근거','제공시스템온라인','제공시스템암호화','수신자온라인','수신자암호화']
                  : ['업무명','세부업무명','보유공간','파기시스템','파기항목','파기항목명칭','보관기간','파기담당자','파기절차','분리보관공간','분리보관암호화항목','파기온라인','분리보관','분리보관온라인','분리보관암호화'];
              return (
                <div key={phase} className="space-y-2">
                  <h4 className="font-medium">{phase} 단계</h4>
                  <div className="overflow-x-auto">
                    <UITable>
                      <UITableHeader>
                        <UITableRow>
                          {headers.map((h) => <UITableHead key={h} className="text-center min-w-[80px]">{renderHeader(h)}</UITableHead>)}
                        </UITableRow>
                      </UITableHeader>
                      <UITableBody>
                        {rows.map((row: any, i: number) => (
                          <UITableRow key={i}>
                            {phase === '수집' && (
                              <>
                                <UITableCell>{row.taskName}</UITableCell>
                                <UITableCell>{row.detailTask}</UITableCell>
                                <UITableCell>{row.collectionTarget}</UITableCell>
                                <UITableCell>{row.collectionPath}</UITableCell>
                                <UITableCell>{row.collectionSystem}</UITableCell>
                                <UITableCell>{row.collectionItem}</UITableCell>
                                <UITableCell>{row.collectionItemName}</UITableCell>
                                <UITableCell>{row.collectionPeriod}</UITableCell>
                                <UITableCell>{row.collectionManager}</UITableCell>
                                <UITableCell>{row.collectionBasis}</UITableCell>
                                <UITableCell>{row.isOnline}</UITableCell>
                                <UITableCell>{row.isEncrypted}</UITableCell>
                              </>
                            )}
                            {phase === '보유' && (
                              <>
                                <UITableCell>{row.taskName}</UITableCell>
                                <UITableCell>{row.detailTask}</UITableCell>
                                <UITableCell>{row.inputSystem}</UITableCell>
                                <UITableCell>{row.storageSpace}</UITableCell>
                                <UITableCell>{row.storageItem}</UITableCell>
                                <UITableCell>{row.storageItemName}</UITableCell>
                                <UITableCell>{row.encryptionItem}</UITableCell>
                                <UITableCell>{row.isOnline}</UITableCell>
                                <UITableCell>{row.isEncrypted}</UITableCell>
                              </>
                            )}
                            {phase === '이용' && (
                              <>
                                <UITableCell>{row.taskName}</UITableCell>
                                <UITableCell>{row.detailTask}</UITableCell>
                                <UITableCell>{row.storageSpace}</UITableCell>
                                <UITableCell>{row.usageSystem}</UITableCell>
                                <UITableCell>{row.usageItem}</UITableCell>
                                <UITableCell>{row.usageItemName}</UITableCell>
                                <UITableCell>{row.usagePurpose}</UITableCell>
                                <UITableCell>{row.usageMethod}</UITableCell>
                                <UITableCell>{row.personalInfoHandler}</UITableCell>
                                <UITableCell>{row.isOnline}</UITableCell>
                                <UITableCell>{row.isEncrypted}</UITableCell>
                              </>
                            )}
                            {phase === '제공' && (
                              <>
                                <UITableCell>{row.taskName}</UITableCell>
                                <UITableCell>{row.detailTask}</UITableCell>
                                <UITableCell>{row.storageSpace}</UITableCell>
                                <UITableCell>{row.provisionSystem}</UITableCell>
                                <UITableCell>{row.provider}</UITableCell>
                                <UITableCell>{row.recipient}</UITableCell>
                                <UITableCell>{row.provisionItem}</UITableCell>
                                <UITableCell>{row.provisionItemName}</UITableCell>
                                <UITableCell>{row.provisionPurpose}</UITableCell>
                                <UITableCell>{row.provisionMethod}</UITableCell>
                                <UITableCell>{row.provisionPeriod}</UITableCell>
                                <UITableCell>{row.encryptionMethod}</UITableCell>
                                <UITableCell>{row.provisionBasis}</UITableCell>
                                <UITableCell>{row.provisionSystemOnline}</UITableCell>
                                <UITableCell>{row.provisionSystemEncrypted}</UITableCell>
                                <UITableCell>{row.recipientOnline}</UITableCell>
                                <UITableCell>{row.recipientEncrypted}</UITableCell>
                              </>
                            )}
                            {phase === '파기' && (
                              <>
                                <UITableCell>{row.taskName}</UITableCell>
                                <UITableCell>{row.detailTask}</UITableCell>
                                <UITableCell>{row.storageSpace}</UITableCell>
                                <UITableCell>{row.disposalSystem}</UITableCell>
                                <UITableCell>{row.disposalItem}</UITableCell>
                                <UITableCell>{row.disposalItemName}</UITableCell>
                                <UITableCell>{row.retentionPeriod}</UITableCell>
                                <UITableCell>{row.disposalManager}</UITableCell>
                                <UITableCell>{row.disposalProcedure}</UITableCell>
                                <UITableCell>{row.separateStorageSpace}</UITableCell>
                                <UITableCell>{row.separateStorageEncryptionItem}</UITableCell>
                                <UITableCell>{row.disposalOnline}</UITableCell>
                                <UITableCell>{row.hasSeparateStorage}</UITableCell>
                                <UITableCell>{row.separateStorageOnline}</UITableCell>
                                <UITableCell>{row.separateStorageEncrypted}</UITableCell>
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
          {(() => {
            const taskOrder = processingTasks.map((t: any) => t.taskName);
            const sortedTaskNames = Object.keys(criteriaByTask).sort((a, b) => {
              const indexA = taskOrder.indexOf(a);
              const indexB = taskOrder.indexOf(b);
              return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            return sortedTaskNames.map((task) => (
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
            ));
          })()}
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
                  <UITableHead>취약점</UITableHead>
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

      {/* 4. 개선 조치 계획 */}
      <Card>
        <CardHeader>
          <CardTitle>4. 주요 위험요소에 따른 개선 조치 계획</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(() => {
            const [actionPlansData, setActionPlansData] = useState<any>({});
            
            useEffect(() => {
              const loadActionPlans = async () => {
                if (!user?.company) return;
                try {
                  const data = await api.lifecycle.actionPlans.getAll(user.company);
                  setActionPlansData(data);
                } catch (error) {
                  console.error('Failed to load action plans:', error);
                }
              };
              loadActionPlans();
            }, [user?.company]);
            
            const actionPlansByTask: { [key: string]: any[] } = {};
            
            Object.keys(actionPlansData).forEach(id => {
              const plan = actionPlansData[id];
              if (plan && plan.taskName) {
                if (!actionPlansByTask[plan.taskName]) actionPlansByTask[plan.taskName] = [];
                actionPlansByTask[plan.taskName].push(plan);
              }
            });

            const taskOrder = processingTasks.map((t: any) => t.taskName);
            const sortedTaskNames = Object.keys(actionPlansByTask).sort((a, b) => {
              const indexA = taskOrder.indexOf(a);
              const indexB = taskOrder.indexOf(b);
              return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            return sortedTaskNames.map((task) => (
              <div key={task} className="space-y-2">
                <p className="font-semibold">[{task}]</p>
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
                      {actionPlansByTask[task].map((plan, idx) => (
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

      {/* 5. 평가결과 */}
      <Card>
        <CardHeader>
          <CardTitle>5. 평가결과</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(() => {
            const taskOrder = processingTasks.map((t: any) => t.taskName);
            const sortedTaskNames = Object.keys(resultsByTask).sort((a, b) => {
              const indexA = taskOrder.indexOf(a);
              const indexB = taskOrder.indexOf(b);
              return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
            });

            return sortedTaskNames.map((task) => (
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
            ));
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
