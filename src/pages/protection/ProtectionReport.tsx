import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Printer } from 'lucide-react';
import { Document, Packer, Paragraph, Table as DocxTable, TableCell, TableRow, TextRun, WidthType, AlignmentType, HeadingLevel, ImageRun } from 'docx';
import { Table as UITable, TableBody as UITableBody, TableCell as UITableCell, TableHead as UITableHead, TableHeader as UITableHeader, TableRow as UITableRow } from '@/components/ui/table';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCompanyData, getCompanyStorageKey } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export default function ProtectionReport() {
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [flowChartImages, setFlowChartImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadFlowChartImages = async () => {
      try {
        const companyId = user?.company || 'default';

        // Load flowchart images from database
        const { data: flowCharts } = await supabase
          .from('flow_charts')
          .select('*')
          .eq('company_id', companyId)
          .eq('phase', 'flowchart');

        if (flowCharts) {
          const images: Record<string, string> = {};
          
          // Load images from storage
          for (const chart of flowCharts) {
            if (chart.storage_path) {
              const { data } = supabase.storage
                .from('flowchart-images')
                .getPublicUrl(chart.storage_path);
              
              if (data?.publicUrl) {
                images[chart.task_name || ''] = data.publicUrl;
              }
            } else if (chart.image_data) {
              // Fallback to legacy base64 data
              images[chart.task_name || ''] = chart.image_data;
            }
          }
          
          setFlowChartImages(images);
        }
        
        // Also check localStorage for backwards compatibility
        const localImages = getCompanyData(user?.company, 'flowChartImages', {});
        setFlowChartImages(prev => ({ ...localImages, ...prev }));
      } catch (error) {
        console.error('Error loading flowchart images:', error);
      }
    };

    loadFlowChartImages();

    const handleStorageUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const taskKey = getCompanyStorageKey(user?.company, 'processingTasks');
      const flowKey = getCompanyStorageKey(user?.company, 'flowTableData');
      const chartKey = getCompanyStorageKey(user?.company, 'flowChartData');
      const lifecycleKey = getCompanyStorageKey(user?.company, 'lifecycleData');
      const improvementsKey = getCompanyStorageKey(user?.company, 'protectionImprovements');
      
      if (customEvent.detail?.key === taskKey || 
          customEvent.detail?.key === flowKey ||
          customEvent.detail?.key === chartKey ||
          customEvent.detail?.key === lifecycleKey ||
          customEvent.detail?.key === improvementsKey) {
        setRefreshKey(prev => prev + 1);
        loadFlowChartImages();
      }
    };

    window.addEventListener('storageUpdate', handleStorageUpdate);
    return () => window.removeEventListener('storageUpdate', handleStorageUpdate);
  }, [user?.company]);
  const handleDownload = async () => {
    try {
      // Load data from company storage
      const taskTableData = getCompanyData(user?.company, 'processingTasks', []);
      const flowTableData = getCompanyData(user?.company, 'flowTableData', {});
      const lifecycleData = getCompanyData(user?.company, 'lifecycleData', []);
      const improvements = getCompanyData(user?.company, 'protectionImprovements', {});

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

      const phases = ['수집', '보유이용', '제공', '파기'];
      const phaseKeyMap: Record<string, string> = { 수집: 'collection', 보유이용: 'storage', 제공: 'provision', 파기: 'disposal' };
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
              ? ['업무명', '수집 항목', '수집 경로', '수집 대상', '수집 주기', '수집 담당자', '수집 근거']
              : phase === '보유이용'
              ? ['업무명', '보유 형태', '암호화 항목', '이용 목적', '이용 항목', '개인정보취급자', '이용 방법']
              : phase === '제공'
              ? ['업무명', '제공 목적', '제공자', '수신자', '제공 정보', '제공 방법', '제공 주기', '암호화 여부', '제공근거']
              : ['업무명', '보관 기간', '파기 담당자', '파기 절차', '분리보관 여부'];

          const flowRows = [
            new TableRow({
              children: headers.map(h => new TableCell({ children: [new Paragraph(h)] }))
            }),
            ...phaseData.map(row => new TableRow({
              children:
                phase === '수집'
                  ? [
                      new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                      new TableCell({ children: [new Paragraph(row.collectionItem || '')] }),
                      new TableCell({ children: [new Paragraph(row.collectionPath || '')] }),
                      new TableCell({ children: [new Paragraph(row.collectionTarget || '')] }),
                      new TableCell({ children: [new Paragraph(row.collectionPeriod || '')] }),
                      new TableCell({ children: [new Paragraph(row.collectionManager || '')] }),
                      new TableCell({ children: [new Paragraph(row.collectionBasis || '')] }),
                    ]
                  : phase === '보유이용'
                  ? [
                      new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                      new TableCell({ children: [new Paragraph(row.storageType || '')] }),
                      new TableCell({ children: [new Paragraph(row.encryptionItem || '')] }),
                      new TableCell({ children: [new Paragraph(row.usagePurpose || '')] }),
                      new TableCell({ children: [new Paragraph(row.usageItem || '')] }),
                      new TableCell({ children: [new Paragraph(row.personalInfoHandler || '')] }),
                      new TableCell({ children: [new Paragraph(row.usageMethod || '')] }),
                    ]
                  : phase === '제공'
                  ? [
                      new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                      new TableCell({ children: [new Paragraph(row.provisionPurpose || '')] }),
                      new TableCell({ children: [new Paragraph(row.provider || '')] }),
                      new TableCell({ children: [new Paragraph(row.recipient || '')] }),
                      new TableCell({ children: [new Paragraph(row.provisionInfo || '')] }),
                      new TableCell({ children: [new Paragraph(row.provisionMethod || '')] }),
                      new TableCell({ children: [new Paragraph(row.provisionPeriod || '')] }),
                      new TableCell({ children: [new Paragraph(row.encryptionStatus || '')] }),
                      new TableCell({ children: [new Paragraph(row.provisionBasis || '')] }),
                    ]
                  : [
                      new TableCell({ children: [new Paragraph(row.taskName || '')] }),
                      new TableCell({ children: [new Paragraph(row.retentionPeriod || '')] }),
                      new TableCell({ children: [new Paragraph(row.disposalManager || '')] }),
                      new TableCell({ children: [new Paragraph(row.disposalProcedure || '')] }),
                      new TableCell({ children: [new Paragraph(row.separateStorageStatus || '')] }),
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

      // Load flow chart images from state
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
          
          const imageUrl = flowChartImages[taskName];
          if (imageUrl) {
            try {
              // Fetch image and convert to buffer
              let imageBuffer: Uint8Array;
              
              if (imageUrl.startsWith('data:image')) {
                // Base64 image
                const base64Data = imageUrl.split(',')[1];
                imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
              } else {
                // URL image - fetch and convert
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                imageBuffer = new Uint8Array(arrayBuffer);
              }
              
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

      Object.keys(criteriaByTask).forEach(taskName => {
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

  const processingTasks = getCompanyData(user?.company, 'processingTasks', []);
  const flowTableData = getCompanyData(user?.company, 'flowTableData', {});
  const lifecycleData = getCompanyData(user?.company, 'lifecycleData', []);
  const improvements = getCompanyData(user?.company, 'protectionImprovements', {});
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
    (task.collection || []).forEach((row: any) => flowByPhase['수집'].push({ taskName, ...row }));
    (task.storage || []).forEach((row: any) => flowByPhase['보유이용'].push({ taskName, ...row }));
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
              const headers =
                phase === '수집'
                  ? ['업무명','수집 항목','수집 경로','수집 대상','수집 주기','수집 담당자','수집 근거']
                  : phase === '보유이용'
                  ? ['업무명','보유 형태','암호화 항목','이용 목적','이용 항목','개인정보취급자','이용 방법']
                  : phase === '제공'
                  ? ['업무명','제공 목적','제공자','수신자','제공 정보','제공 방법','제공 주기','암호화 여부','제공근거']
                  : ['업무명','보관 기간','파기 담당자','파기 절차','분리보관 여부'];
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
                                <UITableCell>{row.collectionItem}</UITableCell>
                                <UITableCell>{row.collectionPath}</UITableCell>
                                <UITableCell>{row.collectionTarget}</UITableCell>
                                <UITableCell>{row.collectionPeriod}</UITableCell>
                                <UITableCell>{row.collectionManager}</UITableCell>
                                <UITableCell>{row.collectionBasis}</UITableCell>
                              </>
                            )}
                            {phase === '보유이용' && (
                              <>
                                <UITableCell>{row.taskName}</UITableCell>
                                <UITableCell>{row.storageType}</UITableCell>
                                <UITableCell>{row.encryptionItem}</UITableCell>
                                <UITableCell>{row.usagePurpose}</UITableCell>
                                <UITableCell>{row.usageItem}</UITableCell>
                                <UITableCell>{row.personalInfoHandler}</UITableCell>
                                <UITableCell>{row.usageMethod}</UITableCell>
                              </>
                            )}
                            {phase === '제공' && (
                              <>
                                <UITableCell>{row.taskName}</UITableCell>
                                <UITableCell>{row.provisionPurpose}</UITableCell>
                                <UITableCell>{row.provider}</UITableCell>
                                <UITableCell>{row.recipient}</UITableCell>
                                <UITableCell>{row.provisionInfo}</UITableCell>
                                <UITableCell>{row.provisionMethod}</UITableCell>
                                <UITableCell>{row.provisionPeriod}</UITableCell>
                                <UITableCell>{row.encryptionStatus}</UITableCell>
                                <UITableCell>{row.provisionBasis}</UITableCell>
                              </>
                            )}
                            {phase === '파기' && (
                              <>
                                <UITableCell>{row.taskName}</UITableCell>
                                <UITableCell>{row.retentionPeriod}</UITableCell>
                                <UITableCell>{row.disposalManager}</UITableCell>
                                <UITableCell>{row.disposalProcedure}</UITableCell>
                                <UITableCell>{row.separateStorageStatus}</UITableCell>
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
                return <p className="text-sm text-muted-foreground">각 처리업무별 흐름도는 "개인정보 흐름도" 페이지에서 "저장" 버튼을 클릭하여 저장하세요.</p>;
              }
              
              return (
                <div className="space-y-6">
                  {taskNames.map((taskName: string) => {
                    const imageUrl = flowChartImages[taskName];
                    if (!imageUrl) return null;
                    
                    return (
                      <div key={taskName} className="space-y-2">
                        <h4 className="font-semibold">[{taskName}]</h4>
                        <img 
                          src={imageUrl} 
                          alt={`${taskName} 흐름도`}
                          className="w-full border rounded-lg bg-white p-4"
                          crossOrigin="anonymous"
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
                  <li key={idx}>{plan}</li>
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
