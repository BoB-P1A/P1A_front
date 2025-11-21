import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

type GojsMessage =
    | { type: "combined-json"; payload: any }
    | { type: "toast"; payload: { level?: "info" | "error"; message: string } }
    | { type: string; payload?: any };

type TaskRow = { id: string; taskName: string };

// FAST API로 연결되도록 설정하기
const FLOW_API_BASE = import.meta.env.VITE_FLOW_API_BASE_URL ?? "http://localhost:8000";

export default function ProtectionFlowChart() {
    const { user } = useAuth();
    const companyId = (user?.companyId || user?.company) as string | undefined;

    const iframeRef = useRef<HTMLIFrameElement>(null);

    const [tasks, setTasks] = useState<TaskRow[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(undefined);

    // 컴포넌트 시작하자마자 window.__API_BASE__ 세팅
    useEffect(() => {
        (window as any).__API_BASE__ = "/flow";
    }, []);

    // 최초: 처리업무 목록 로드
    useEffect(() => {
        if (!companyId) return;
        (async () => {
            try {
                const r = await fetch(`${FLOW_API_BASE}/api/tasks?company_id=${encodeURIComponent(companyId)}`, {
                    // FastAPI는 인증없이 열어두었으면 헤더 불필요. 필요하면 Authorization 추가.
                    // headers: { Authorization: `Bearer ${token}` }
                });
                if (!r.ok) throw new Error(String(r.status));
                const rows = await r.json();
                const normalized = (rows ?? []).map((t: any) => ({
                    id: String(t.id),
                    taskName: t.taskName || "(무제)",
                }));
                setTasks(normalized);
                if (normalized.length && !selectedTaskId) setSelectedTaskId(normalized[0].id);

            } catch (e) {
                console.warn("FastAPI /api/tasks failed, fallback to team api:", e);
                toast({ title: "업무 목록 로드 실패", variant: "destructive" });
            }
        })();
    }, [companyId]);

    // flow1.html은 이제 task_id만 사용 + GoJS 라이선스 키 전달
    const gojsKey = import.meta.env.VITE_GOJS_LICENSE;

    const buildSrc = (taskId?: string) =>
        `/gojs/flow1.html?company_id=${companyId || ""}&task_id=${taskId || ""}&gojs_key=${gojsKey || ""}&ts=${Date.now()}`;

    const [src, setSrc] = useState<string>(buildSrc(selectedTaskId));

    // 업무/선택 바뀌면 iframe 새로 로드
    useEffect(() => {
        setSrc(buildSrc(selectedTaskId));
    }, [selectedTaskId, companyId]);

    const reloadIframe = () => setSrc(buildSrc(selectedTaskId));

    // ---- iframe → React 수신: 저장
    useEffect(() => {
        const handler = async (ev: MessageEvent) => {
            const data: GojsMessage = ev.data;
            if (!data || typeof data !== "object") return;

            if (data.type === "combined-json") {
                if (!companyId || !selectedTaskId) {
                    toast({ title: "회사/업무 정보가 없습니다", variant: "destructive" });
                    return;
                }
                try {
                    const res = await fetch(
                        `${FLOW_API_BASE}/api/derived?company_id=${encodeURIComponent(companyId)}&task_id=${encodeURIComponent(selectedTaskId)}`,
                        {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(data.payload),
                        }
                    );
                    if (!res.ok) throw new Error(await res.text());
                    toast({ title: "흐름도 저장 완료" });
                } catch (e: any) {
                    toast({ title: "저장 실패", description: String(e?.message || e), variant: "destructive" });
                }
            } else if (data.type === "toast") {
                const lvl = data.payload?.level ?? "info";
                (lvl === "error"
                    ? () => toast({ title: "오류", description: data.payload?.message, variant: "destructive" })
                    : () => toast({ title: data.payload?.message || "알림" }))();
            }
        };
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, [companyId, selectedTaskId]);

    // ---- React → iframe 송신
    const postToIframe = (msg: GojsMessage) => {
        const iframeWin = iframeRef.current?.contentWindow;
        if (!iframeWin) return;
        iframeWin.postMessage(msg, "*");
    };

    const triggerBuildFromSheets = async () => {
        if (!companyId || !selectedTaskId) return;
        try {
            const res = await fetch(
                `${FLOW_API_BASE}/api/build?company_id=${encodeURIComponent(companyId)}&task_id=${encodeURIComponent(selectedTaskId)}`,
                { method: "POST" }
            );
            if (!res.ok) throw new Error(await res.text());
            toast({ title: "엑셀→JSON 변환 완료", description: "편집기에 재적용합니다" });
            reloadIframe(); // flow1.html은 task_idx로 combined를 다시 가져옴
        } catch (e: any) {
            toast({ title: "변환 실패", description: String(e?.message || e), variant: "destructive" });
        }
    };

    const requestCombinedJson = () => {
        postToIframe({ type: "request-combined-json" });
    };

    // --- PNG 캡쳐: iframe 내부 GoJS 다이어그램 → dataURL (동일 오리진 전제)
    async function captureDiagramPngDataUrl(): Promise<string> {
        const win = iframeRef.current?.contentWindow as any;
        if (!win) throw new Error("편집기가 아직 로드되지 않았습니다.");

        // 1) 전체(표+흐름도+우측 PII) 캡쳐 시도
        if (typeof win.captureWholePanelPng === "function") {
            const dataUrl = await win.captureWholePanelPng(1);
            if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/png")) {
                return dataUrl;
            }
        }

        // 2) 폴백: 다이어그램만 캡쳐
        if (typeof win.getFlowPngDataUrl === "function") {
            const dataUrl = win.getFlowPngDataUrl();
            if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/png")) {
                return dataUrl;
            }
        }
        if (win.myDiagram && typeof win.myDiagram.makeImageData === "function") {
            const dataUrl = win.myDiagram.makeImageData({ background: "white", scale: 2 });
            if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/png")) {
                return dataUrl;
            }
        }
        throw new Error("캡쳐 함수를 찾을 수 없습니다( flow1.html 전역 노출 필요 )");
    }

    function dataUrlToBlob(dataUrl: string): Blob {
        const [header, b64] = dataUrl.split(",");
        const mime = header.match(/data:(.*);base64/)?.[1] || "image/png";
        const bin = atob(b64);
        const buf = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
        return new Blob([buf], { type: mime });
    }

    async function uploadSnapshotToS3(blob: Blob, companyId: string, taskId: string) {
        // 백엔드가 프록시 또는 동일 오리진 노출이라면 절대경로 필요없음.
        const base = FLOW_API_BASE; // 이미 상단에 정의됨(:contentReference[oaicite:3]{index=3}L16-L18)
        const url = `${base}/api/s3/flow-snapshot?company_id=${encodeURIComponent(companyId)}&task_id=${encodeURIComponent(taskId)}`;
        const fd = new FormData();
        fd.append("file", blob, "flow.png");
        const res = await fetch(url, { method: "POST", body: fd });
        if (!res.ok) throw new Error(await res.text());
        return res.json(); // { ok: true, key, url? }
    }

    async function deleteSnapshotFromS3(companyId: string, taskId: string) {
        const base = FLOW_API_BASE;
        const url = `${base}/api/s3/flow-snapshot?company_id=${encodeURIComponent(companyId)}&task_id=${encodeURIComponent(taskId)}`;
        const res = await fetch(url, { method: "DELETE" });
        if (!res.ok) throw new Error(await res.text());
        return res.json(); // { ok: true, deleted_key }
    }
    // "사진으로 다운로드(.png)" 버튼
    async function handleDownloadClick() {
        if (!companyId || !selectedTaskId) {
            toast({ title: "회사/업무 정보가 없습니다", variant: "destructive" });
            return;
        }
        try {
            // 1) 캡쳐
            const dataUrl = await captureDiagramPngDataUrl();
            const blob = dataUrlToBlob(dataUrl);

            // 2) S3 업서트 저장 (임시)
            await uploadSnapshotToS3(blob, companyId, selectedTaskId);

            // 3) 로컬 다운로드
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `flow_${companyId}_${selectedTaskId}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            // 4) S3 임시본 삭제
            try {
                await deleteSnapshotFromS3(companyId, selectedTaskId);
            } catch (delErr: any) {
                console.warn("S3 snapshot delete failed:", delErr);
            }

            toast({ title: "흐름도 사진 다운로드 완료" });
        } catch (e: any) {
            toast({ title: "사진 다운로드 실패", description: String(e?.message || e), variant: "destructive" });
        }
    }
    // "결과보고서에 넣기" 버튼
    async function handleSaveToReportClick() {
        if (!companyId || !selectedTaskId) {
            toast({ title: "회사/업무 정보가 없습니다", variant: "destructive" });
            return;
        }
        try {
            const dataUrl = await captureDiagramPngDataUrl();
            const blob = dataUrlToBlob(dataUrl);
            await uploadSnapshotToS3(blob, companyId, selectedTaskId);
            toast({ title: "보고서용 이미지 저장 완료", description: "S3에 최신본으로 업로드했습니다" });
        } catch (e: any) {
            toast({ title: "보고서용 저장 실패", description: String(e?.message || e), variant: "destructive" });
        }
    }

    // "결과보고서에 넣기 취소" 버튼
    async function handleCancelReportImageClick() {
        if (!companyId || !selectedTaskId) {
            toast({ title: "회사/업무 정보가 없습니다", variant: "destructive" });
            return;
        }
        try {
            await deleteSnapshotFromS3(companyId, selectedTaskId);
            toast({ title: "보고서 이미지 삭제 완료", description: "S3에서 제거되었습니다." });
        } catch (e: any) {
            toast({ title: "삭제 실패", description: String(e?.message || e), variant: "destructive" });
        }
    }



    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-primary">개인정보 흐름도</h1>
                    <p className="text-muted-foreground mt-2">
                        처리업무별로 GoJS 편집기를 사용해 흐름도를 관리합니다.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadClick}>사진으로 다운로드(.png)</Button>
                    <Button onClick={handleSaveToReportClick}>결과보고서에 포함</Button>
                    <Button variant="destructive" onClick={handleCancelReportImageClick}>포함 취소</Button>
                </div>
            </div>

            {/* 처리업무 탭: TaskTable/FlowTable과 동일 UX */}
            <Tabs value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <TabsList>
                    {tasks.map(t => (
                        <TabsTrigger key={t.id} value={t.id}>
                            {t.taskName || "(무제)"}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {tasks.map(t => (
                    <TabsContent key={t.id} value={t.id}>
                        <Card className="shadow-pia-card">
                            <CardHeader>
                                {/* <CardTitle>
                  GoJS 편집기 — {t.taskName || "(무제)"}{" "}
                  <span className="text-xs text-muted-foreground">(id: {t.id})</span>
                </CardTitle>*/}
                            </CardHeader>
                            <CardContent>
                                <div className="w-full" style={{ height: "calc(100vh - 300px)" }}>
                                    <iframe
                                        ref={iframeRef}
                                        src={src}
                                        title={`GoJS-Editor-${t.id}`}
                                        width="100%"
                                        height="100%"
                                        style={{ border: "1px solid var(--border)", borderRadius: 8, background: "#fff" }}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}