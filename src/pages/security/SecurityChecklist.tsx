import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Upload, Download, RotateCcw, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface EvaluationItem {
  id: number;
  area: string;
  field: string;
  subField: string;
  no: string;
  item: string;
}

interface SecurityItem {
  id: number;
  targetName: string;
  field: string;
  subField: string;
  no: string;
  item: string;
  status: "이행" | "부분이행" | "미이행" | "해당없음" | null;
  evidence: string;
  files: FileAttachment[];
}

interface FileAttachment {
  name: string;
  url: string;
  type: string;
}

interface TargetInfo {
  id: number;
  name: string;
}

export default function SecurityChecklist() {
  const { user } = useAuth();
  const [targets, setTargets] = useState<TargetInfo[]>([]);
  const [items, setItems] = useState<SecurityItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<TargetInfo | null>(null);
  const [targetName, setTargetName] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!user?.company) return;

      try {
        const targetsResponse = await api.security.targets.getAll(user.company);
        if (targetsResponse.length > 0) {
          setTargets(targetsResponse);
          if (!activeTab) {
            setActiveTab(targetsResponse[0].name);
          }
        }
      } catch (error) {
        toast({ title: "오류", description: "데이터 로딩 실패", variant: "destructive" });
      }
    };

    loadData();
  }, [user?.company]);

  useEffect(() => {
    const loadChecklist = async () => {
      if (!activeTab || !user?.company) return;

      try {
        const checklistResponse = await api.security.checklists.getAll({
          companyId: user.company,
          status: [],
        });

        setItems(checklistResponse.filter((item: any) => item.targetName === activeTab));
      } catch (error) {
        toast({ title: "오류", description: "체크리스트 로딩 실패", variant: "destructive" });
      }
    };

    loadChecklist();
  }, [activeTab, user?.company]);

  const handleStatusChange = (id: number, status: "이행" | "부분이행" | "미이행" | "해당없음") => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    setHasChanges(true);
  };

  const handleEvidenceChange = (id: number, evidence: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, evidence } : item)));
    setHasChanges(true);
  };

  const handleFileUpload = async (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // FormData로 AWS S3에 직접 업로드
        const uploadResult = await api.files.upload(file, "security-checklist");

        const fileData: FileAttachment = {
          name: file.name,
          url: uploadResult.fileUrl,
          type: file.type,
        };

        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, files: [...item.files, fileData] } : item)));
        setHasChanges(true);
        toast({ title: "파일이 업로드되었습니다" });
      } catch (error) {
        toast({ title: "파일 업로드 실패", variant: "destructive" });
      }
    }
  };

  const handleFileDelete = async (itemId: number, fileUrl: string) => {
    try {
      await api.files.delete(fileUrl);
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, files: item.files.filter((f) => f.url !== fileUrl) } : item,
        ),
      );
      setHasChanges(true);
      toast({ title: "파일이 삭제되었습니다" });
    } catch (error) {
      toast({ title: "파일 삭제 실패", variant: "destructive" });
    }
  };

  const handleFileDownload = (file: FileAttachment) => {
    window.open(file.url, "_blank");
  };

  const handleSave = async () => {
    if (!user?.company) return;

    try {
      await api.security.checklists.save(user.company, activeTab, items);
      setHasChanges(false);
      toast({ title: "저장되었습니다" });
    } catch (error) {
      toast({ title: "오류", description: "저장 실패", variant: "destructive" });
    }
  };

  const handleReset = () => {
    setItems((prev) => prev.map((item) => ({ ...item, status: null, evidence: "", files: [] })));
    setHasChanges(true);
  };

  const handleOpenDialog = (target?: TargetInfo) => {
    if (target) {
      setEditingTarget(target);
      setTargetName(target.name);
    } else {
      setEditingTarget(null);
      setTargetName("");
    }
    setIsDialogOpen(true);
  };

  const handleSaveTarget = async () => {
    if (!targetName.trim()) {
      alert("대상 이름을 입력해주세요.");
      return;
    }

    try {
      if (editingTarget) {
        await api.security.targets.update(editingTarget.id, targetName);
        setTargets((prev) => prev.map((t) => (t.id === editingTarget.id ? { ...t, name: targetName } : t)));
        toast({ title: "대상이 수정되었습니다" });
      } else {
        const newTarget = await api.security.targets.create(user?.company as string, targetName);
        setTargets((prev) => [...prev, newTarget]);
        if (targets.length === 0) {
          setActiveTab(newTarget.name);
        }
        toast({ title: "대상이 추가되었습니다" });
      }

      setIsDialogOpen(false);
      setEditingTarget(null);
      setTargetName("");
    } catch (error) {
      toast({ title: "저장 실패", variant: "destructive" });
    }
  };

  const handleDeleteTarget = async (id: number) => {
    const target = targets.find((t) => t.id === id);
    if (!target || !confirm(`${target.name} 대상을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await api.security.targets.delete(id);
      const updatedTargets = targets.filter((t) => t.id !== id);
      setTargets(updatedTargets);
      toast({ title: "대상이 삭제되었습니다" });

      if (activeTab === target.name && updatedTargets.length > 0) {
        setActiveTab(updatedTargets[0].name);
      }
    } catch (error) {
      toast({ title: "삭제 실패", variant: "destructive" });
    }
  };

  const getItemsForTarget = (targetName: string) => {
    return targetName === activeTab ? items : [];
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold text-primary">보안성 검토 Checklist</h1>
        <div className="space-x-2 flex items-center">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                검토대상 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTarget ? "검토대상 수정" : "새 검토대상 추가"}</DialogTitle>
                <DialogDescription>검토대상명을 입력해주세요</DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="targetName">검토대상명</Label>
                  <Input
                    id="targetName"
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    placeholder="예: 회원관리시스템"
                  />
                </div>
                <Button onClick={handleSaveTarget} className="w-full">
                  저장
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            초기화
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="mr-2 h-4 w-4" />
            저장
          </Button>
        </div>
      </div>

      {targets.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">검토대상을 추가해주세요.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(newTab) => {
            if (hasChanges && newTab !== activeTab) {
              if (
                confirm("저장하지 않은 변경사항이 있습니다. 탭을 전환하시겠습니까?\n(저장하지 않은 내용은 사라집니다)")
              ) {
                setActiveTab(newTab);
                setHasChanges(false);
              }
            } else {
              setActiveTab(newTab);
            }
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              {targets.map((target) => (
                <TabsTrigger key={target.id} value={target.name}>
                  {target.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex gap-2">
              {targets.map(
                (target) =>
                  activeTab === target.name && (
                    <div key={target.id} className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(target)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTarget(target.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ),
              )}
            </div>
          </div>

          {targets.map((target) => (
            <TabsContent key={target.id} value={target.name}>
              <div className="space-y-6">
                {getItemsForTarget(target.name).map((item, index, array) => {
                  const prevItem = index > 0 ? array[index - 1] : null;
                  const showFieldHeader = !prevItem || prevItem.field !== item.field;

                  return (
                    <div key={item.id}>
                      {showFieldHeader && (
                        <div className="mb-4 mt-6 first:mt-0">
                          <h2 className="text-xl font-semibold text-primary border-b pb-2">{item.field}</h2>
                        </div>
                      )}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {item.no} - {item.subField}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="font-semibold">평가항목</Label>
                            <p className="mt-1 text-sm">{item.item}</p>
                          </div>

                          <div>
                            <Label className="font-semibold mb-2 block">평가 결과</Label>
                            <RadioGroup
                              value={item.status || ""}
                              onValueChange={(value) =>
                                handleStatusChange(item.id, value as "이행" | "부분이행" | "미이행" | "해당없음")
                              }
                            >
                              <div className="flex gap-6">
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="이행" id={`${item.id}-이행`} />
                                  <Label htmlFor={`${item.id}-이행`}>이행</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="부분이행" id={`${item.id}-부분이행`} />
                                  <Label htmlFor={`${item.id}-부분이행`}>부분이행</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="미이행" id={`${item.id}-미이행`} />
                                  <Label htmlFor={`${item.id}-미이행`}>미이행</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="해당없음" id={`${item.id}-해당없음`} />
                                  <Label htmlFor={`${item.id}-해당없음`}>해당없음</Label>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>

                          <div>
                            <Label htmlFor={`evidence-${item.id}`} className="font-semibold">
                              평가 근거 및 의견
                            </Label>
                            <Textarea
                              id={`evidence-${item.id}`}
                              value={item.evidence}
                              onChange={(e) => handleEvidenceChange(item.id, e.target.value)}
                              placeholder="평가 근거 및 의견을 입력하세요"
                              className="mt-1"
                              rows={3}
                            />
                          </div>

                          <div>
                            <Label className="font-semibold">증적 자료</Label>
                            <div className="mt-2 space-y-2">
                              {item.files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 border rounded">
                                  <span className="text-sm truncate flex-1">{file.name}</span>
                                  <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => handleFileDownload(file)}>
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleFileDelete(item.id, file.url)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                              <div>
                                <input
                                  type="file"
                                  id={`file-${item.id}`}
                                  className="hidden"
                                  onChange={(e) => handleFileUpload(item.id, e)}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById(`file-${item.id}`)?.click()}
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  파일 업로드
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}

                {getItemsForTarget(target.name).length === 0 && (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-muted-foreground">
                        평가 항목이 없습니다. 영향평가 관리에서 평가 항목을 추가해주세요.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
